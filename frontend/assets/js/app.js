(()=>{var Wi=Object.defineProperty;var Wt=(e,t)=>{for(var s in t)Wi(e,s,{get:t[s],enumerable:!0})};var Pa="judgment.api_base",Ia="http://127.0.0.1:9200",gt=class extends Error{constructor(t,s=0,a=null){super(t),this.name="ApiError",this.status=s,this.detail=a}};function Hn(e){return["localhost","127.0.0.1","::1","[::1]"].includes(e)}function Kt(e){let t=String(e??"").trim();if(!t||t==="/")return"";t=t.replace(/\/+$/,""),!/^https?:\/\//i.test(t)&&!t.startsWith("/")&&(t=`${Hn(t.split(":")[0])?"http":"https"}://${t}`);try{let s=new URL(t,window.location.href);return s.protocol!=="http:"&&s.protocol!=="https:"?"":`${s.origin}${s.pathname==="/"?"":s.pathname.replace(/\/+$/,"")}`}catch{return t}}function Ba(e){let t=Kt(e);if(!t)return!0;try{let s=new URL(t);return s.protocol==="http:"||s.protocol==="https:"}catch{return!1}}function Da(){try{let e=new URLSearchParams(window.location.search);return e.has("api")?Kt(e.get("api")):null}catch{return null}}function Oa(){try{let e=window.localStorage.getItem(Pa);return e===null?null:Kt(e)}catch{return null}}function Fa(){let e=window.JUDGMENT_CONFIG&&window.JUDGMENT_CONFIG.apiBase;return Kt(e||"")}function Yt(){let e=Da();if(e!==null)return e;let t=Oa();if(t!==null)return t;let s=Fa();return s||(window.location.protocol==="file:"?Ia:"")}function Ki(){if(Da()!==null)return!0;let e=Oa();return e!==null?!!e:!!Fa()}function Xt(){return Da()!==null?"query":Oa()!==null?"storage":Fa()?"config":window.location.protocol==="file:"?"file-default":"same-origin"}function Ks(){return Ki()||window.location.protocol==="file:"||!window.JUDGMENT_CONFIG?!1:!Hn(window.location.hostname)}function za(e){let t=Kt(e);try{t?window.localStorage.setItem(Pa,t):window.localStorage.removeItem(Pa)}catch{}return t}function os(e=Yt()){return e||"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"}function _t(e,t=Yt()){return t?`${t}${e.startsWith("/")?e:`/${e}`}`:e}function kt(e,t,{onError:s=null,onProgress:a=null}={}){let n=(Array.isArray(e)?e:[e]).map(c=>String(c||"").trim()).filter(Boolean);if(!n.length||typeof EventSource>"u")return()=>{};let i=new EventSource(_t(`/api/events/stream?topic=${encodeURIComponent(n.join(","))}`)),o=0;i.onopen=()=>{o+=1};let l=c=>{let p={};try{p=JSON.parse(c.data||"{}")}catch{p={}}p.initial&&o<=1&&!p.snapshot||t?.(p.topic||n[0],p)},u=c=>{let p={};try{p=JSON.parse(c.data||"{}")}catch{p={}}a?.(p.topic||n[0],p)};return i.addEventListener("refresh",l),i.addEventListener("progress",u),i.onerror=()=>{s?.()},()=>{i.removeEventListener("refresh",l),i.removeEventListener("progress",u),i.close()}}function Ha(e){return`\u7121\u6CD5\u9023\u7DDA\u5230\u4F3A\u670D\u5668${e?`\uFF08${e}\uFF09`:""}\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u662F\u5426\u555F\u52D5\uFF0C\u6216\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u8A2D\u5B9A\u5F8C\u7AEF\u4F4D\u5740\u3002`}async function le(e,t={}){let s=Yt(),a=new AbortController,n=t.timeout===void 0?3e4:t.timeout,i=n>0?window.setTimeout(()=>a.abort(),n):null,o=Date.now(),l=performance.now(),u=t.requestId||Un(),c={Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},"X-Judgment-Request-Id":u,"X-Judgment-Client-Started-At":String(o),...t.headers||{}},p;try{p=await fetch(_t(e,s),{...t,headers:c,signal:a.signal})}catch(w){throw w.name==="AbortError"?new gt("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new gt(Ha(s),0,w)}finally{i&&window.clearTimeout(i)}let $=null;if((p.headers.get("content-type")||"").includes("application/json"))try{$=await p.json()}catch{$=null}else try{$=await p.text()}catch{$=null}let g=performance.now(),m=p.headers.get("X-Judgment-Request-Id")||u;if(t.trackClient!==!1&&m){let w=Math.round(performance.now()-l);window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{Qn({request_id:m,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:w,render_ms:Math.max(0,Math.round(performance.now()-g)),status:p.ok?"success":"failed"})})})}if(!p.ok){let w=$&&typeof $=="object"?$.detail||$.message:$,S=typeof w=="string"&&w?w:`\u4F3A\u670D\u5668\u56DE\u61C9 ${p.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new gt(S,p.status,w)}return $}function Un(){try{if(window.crypto&&typeof window.crypto.randomUUID=="function")return window.crypto.randomUUID().replace(/-/g,"").slice(0,32)}catch{}return`req${Date.now().toString(36)}${Math.random().toString(36).slice(2,10)}`}function Qn(e){try{fetch(_t("/api/performance/client",Yt()),{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e),keepalive:!0}).catch(()=>{})}catch{}}async function Gn(e){let t=Kt(e);if(!Ba(t))throw new gt("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002");let s=performance.now(),a=new AbortController,n=window.setTimeout(()=>a.abort(),1e4);try{let i=await fetch(_t("/api/health",t),{headers:{Accept:"application/json"},signal:a.signal});if(!i.ok)throw new gt(`API \u56DE\u61C9 ${i.status}\u3002`,i.status);let o=await i.json();return{base:t,version:o.version||"\u2014",duration_ms:Math.round(performance.now()-s)}}catch(i){throw i instanceof gt?i:i.name==="AbortError"?new gt("\u9023\u7DDA\u6E2C\u8A66\u903E\u6642\uFF0C\u8ACB\u78BA\u8A8D API \u4F4D\u5740\u8207\u7DB2\u8DEF\u3002",0,i):new gt(Ha(t),0,i)}finally{window.clearTimeout(n)}}var Q={health(){return le("/api/health")},status(){return le("/api/status",{trackClient:!1})},ollamaHosts(){return le("/api/ollama/hosts",{timeout:3e4,trackClient:!1})},addOllamaHost(e){return le("/api/ollama/hosts",{method:"POST",body:JSON.stringify(e),timeout:3e4,trackClient:!1})},updateOllamaHost(e,t){return le(`/api/ollama/hosts/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},deleteOllamaHost(e){return le(`/api/ollama/hosts/${encodeURIComponent(e)}`,{method:"DELETE",timeout:3e4,trackClient:!1})},activateOllamaHost(e){return le(`/api/ollama/hosts/${encodeURIComponent(e)}/activate`,{method:"POST",timeout:3e4,trackClient:!1})},deactivateOllamaHosts(){return le("/api/ollama/hosts/deactivate",{method:"POST",timeout:3e4,trackClient:!1})},reorderOllamaHosts(e){return le("/api/ollama/hosts/reorder",{method:"POST",body:JSON.stringify({host_ids:e}),timeout:3e4,trackClient:!1})},checkOllamaCapabilities(){return le("/api/ollama/hosts/capabilities/test",{method:"POST",timeout:18e4,trackClient:!1})},selectOllamaModel(e,t){return le(`/api/ollama/hosts/${encodeURIComponent(e)}/models/select`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},clearOllamaModel(e,t){return le(`/api/ollama/hosts/${encodeURIComponent(e)}/models/clear`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},systemUsage(){return le("/api/system-usage",{trackClient:!1})},indexVersions(){return le("/api/index-versions",{trackClient:!1})},indexVersion(e){return le(`/api/index-versions/${encodeURIComponent(e)}`,{trackClient:!1})},validateIndexVersion(e){return le(`/api/index-versions/${encodeURIComponent(e)}/validate`,{method:"POST",trackClient:!1})},activateIndexVersion(e){return le(`/api/index-versions/${encodeURIComponent(e)}/activate`,{method:"POST",trackClient:!1})},rollbackIndexVersion(){return le("/api/index-versions/rollback",{method:"POST",trackClient:!1})},reconcileIndexAlias(e=!1){let t=new URLSearchParams({repair:e?"true":"false"});return le(`/api/index-alias/reconcile?${t.toString()}`,{trackClient:!1})},catalog(){return le("/api/catalog")},judgmentStats(){return le("/api/judgment-stats")},query({database:e,filters:t,page:s=1,pageSize:a=25}){return le("/api/query",{method:"POST",body:JSON.stringify({database:e,filters:t,page:s,page_size:a})})},dataSuggest({kind:e,query:t="",limit:s=12}){let a=new URLSearchParams({kind:e,query:t,limit:String(s)});return le(`/api/data/suggest?${a.toString()}`,{timeout:45e3,trackClient:!1})},schemaSuggest({database:e,table:t,column:s,query:a,limit:n=1e3}){let i=new URLSearchParams({database:e,table:t,column:s,q:a||"",limit:String(n)});return le(`/api/schema/suggest?${i.toString()}`,{timeout:3e4})},lawDetail(e,t="",s="",a=""){let n=new URLSearchParams({law_key:e});return t&&n.set("source_type",t),s&&n.set("version_id",String(s)),a&&n.set("article_no",String(a)),le(`/api/law?${n.toString()}`,{timeout:45e3})},judgmentDetail(e,t=""){let s=new URLSearchParams({jid:e});return t&&s.set("source",t),le(`/api/judgment?${s.toString()}`,{timeout:45e3})},testMode(){return le("/api/test-mode",{trackClient:!1})},llmModels(){return le("/api/llm/models",{timeout:6e4,trackClient:!1})},testLlmModels(){return le("/api/llm/models/test",{method:"POST",timeout:12e4,trackClient:!1})},rerankStatus(){return le("/api/rerank/status",{timeout:6e4,trackClient:!1})},testReranker(){return le("/api/rerank/test",{method:"POST",timeout:12e4,trackClient:!1})},selectLlmModel(e,t=null){return le("/api/llm/model",{method:"POST",body:JSON.stringify({model:e,host_id:t}),timeout:3e4,trackClient:!1})},setTestMode(e){return le("/api/test-mode",{method:"POST",body:JSON.stringify({enabled:!!e}),trackClient:!1})},testRuns(e=20){let t=new URLSearchParams({limit:String(e)});return le(`/api/test-runs?${t.toString()}`,{trackClient:!1})},testRunCurrent(){return le("/api/test-runs/current",{trackClient:!1})},testRun(e){return le(`/api/test-runs/${encodeURIComponent(e)}`,{trackClient:!1})},performanceOptions(){return le("/api/performance/options",{trackClient:!1})},performance(e={},t=1,s=25){let a=new URLSearchParams;for(let[n,i]of Object.entries(e))i==null||i===""||a.set(n,String(i));return a.set("page",String(t)),a.set("page_size",String(s)),le(`/api/performance?${a.toString()}`,{timeout:45e3,trackClient:!1})},quality(){return le("/api/quality",{timeout:18e4,trackClient:!1})},processing(){return le("/api/processing",{timeout:45e3,trackClient:!1})},processingActive(){return le("/api/processing/active",{timeout:3e3,trackClient:!1})},judgmentDownloadStatus(){return le("/api/judgment-download/status",{timeout:3e4,trackClient:!1})},versioningSummary(){return le("/api/versioning/summary",{trackClient:!1})},updatesStatus(){return le("/api/updates/status",{trackClient:!1})},checkCourts(){return le("/api/courts/check",{timeout:6e4,trackClient:!1})},checkLawVersions(){return le("/api/law-versions/check",{timeout:6e4,trackClient:!1})},checkUpdates(e=[]){let t=Array.isArray(e)&&e.length?{source_types:e}:{};return le("/api/updates/check",{method:"POST",body:JSON.stringify(t),timeout:12e4,trackClient:!1})},versioningSnapshots(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.limit&&t.set("limit",String(e.limit)),le(`/api/versioning/judgments/snapshots?${t.toString()}`,{trackClient:!1})},versioningChanges(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit)),le(`/api/versioning/judgments/changes?${t.toString()}`,{trackClient:!1})},versioningJudgment(e){return le(`/api/versioning/judgments/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVersion(e){return le(`/api/versioning/judgments/versions/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVector(e,t){return le(`/api/versioning/judgments/${encodeURIComponent(e)}/vectors/${encodeURIComponent(t)}`,{trackClient:!1})},versioningAudit(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit||500)),le(`/api/versioning/audit?${t.toString()}`,{trackClient:!1})},questionBankStats(){return le("/api/question-bank/stats",{trackClient:!1})},questionBankItems(e={},t=50,s=0){let a=new URLSearchParams;for(let[n,i]of Object.entries(e))if(!(i==null||i==="")){if(Array.isArray(i)){for(let o of i)o==null||o===""||a.append(n,String(o));continue}a.set(n,String(i))}return a.set("limit",String(t)),a.set("offset",String(s)),le(`/api/question-bank/items?${a.toString()}`,{timeout:45e3,trackClient:!1})},questionBankTags(e="",t=12){let s=new URLSearchParams({query:e,limit:String(t)});return le(`/api/question-bank/tags?${s.toString()}`,{timeout:45e3,trackClient:!1})},questionBankItem(e){return le(`/api/question-bank/items/${encodeURIComponent(e)}`,{timeout:45e3,trackClient:!1})},createQuestionBankItem(e){return le("/api/question-bank/items",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},createQuestionBankItemWithAI(e){return le("/api/question-bank/ai-items",{method:"POST",body:JSON.stringify(e),timeout:42e4,trackClient:!1})},updateQuestionBankItem(e,t){return le(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteQuestionBankItem(e){return le(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},restoreQuestionBankItem(e){return le(`/api/question-bank/items/${encodeURIComponent(e)}/restore`,{method:"POST",timeout:45e3,trackClient:!1})},submitQuestionBankItemForReview(e){return le(`/api/question-bank/items/${encodeURIComponent(e)}/submit`,{method:"POST",timeout:45e3,trackClient:!1})},reviewQuestionBankItem(e,t){return le(`/api/question-bank/items/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},importQuestionBank(e){return le("/api/question-bank/import",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},exportQuestionBank({status:e="accepted"}={}){let t=new URLSearchParams({status:e});return le(`/api/question-bank/export?${t.toString()}`,{timeout:45e3,trackClient:!1})},revalidateQuestionBank(){return le("/api/question-bank/revalidate",{method:"POST",body:JSON.stringify({}),timeout:12e4,trackClient:!1})},benchmarkReadyQuestions(e=200){return le(`/api/question-bank/benchmark-ready?limit=${e}`,{timeout:45e3,trackClient:!1})},benchmarkSuites(){return le("/api/benchmark/suites",{timeout:45e3,trackClient:!1})},benchmarkSuiteLatestAnswers(e){return le(`/api/benchmark/suites/${encodeURIComponent(e)}/latest-answers`,{timeout:45e3,trackClient:!1})},removeBenchmarkSuiteItem(e,t){return le(`/api/benchmark/suites/${encodeURIComponent(e)}/items/${encodeURIComponent(t)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},createBenchmarkSuite(e){return le("/api/benchmark/suites",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},updateBenchmarkSuite(e,t){return le(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteBenchmarkSuite(e){return le(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},benchmarkRuns(e=20){return le(`/api/benchmark/runs?limit=${e}`,{timeout:45e3,trackClient:!1})},startBenchmarkRun(e){return le("/api/benchmark/runs",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},benchmarkRun(e,t=!0){return le(`/api/benchmark/runs/${encodeURIComponent(e)}?include_cases=${t}`,{timeout:45e3,trackClient:!1})},stopBenchmarkRun(e){return le(`/api/benchmark/runs/${encodeURIComponent(e)}/stop`,{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},reviewBenchmarkResult(e,t){return le(`/api/benchmark/results/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},benchmarkModels(){return le("/api/benchmark/models",{timeout:45e3,trackClient:!1})},benchmarkFingerprintHistory(e,t=50){return le(`/api/benchmark/fingerprints/${encodeURIComponent(e)}?limit=${t}`,{timeout:45e3,trackClient:!1})},processingPlan(){return le("/api/processing/plan",{timeout:45e3,trackClient:!1})},startProcessingWorkflow(e){return le(`/api/processing/workflows/${encodeURIComponent(e)}/run`,{method:"POST",body:JSON.stringify({})})},startProcessingUpdate(e=!1){return le("/api/processing/update",{method:"POST",body:JSON.stringify({index:!!e}),timeout:45e3,trackClient:!1})},stopProcessingUpdate(){return le("/api/processing/stop",{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},rag(e,t={}){return le("/api/rag/query",{method:"POST",body:JSON.stringify({question:e}),timeout:t.testMode?0:3e5})},async ragStream(e,{testMode:t=!1,onStep:s=null,onPartial:a=null,onToken:n=null,onTokenReset:i=null}={}){let o=Yt(),l=new AbortController,u=t?0:3e5,c=u>0?window.setTimeout(()=>l.abort(),u):null,p=Date.now(),$=performance.now(),v=Un(),g={Accept:"text/event-stream","Content-Type":"application/json","X-Judgment-Request-Id":v,"X-Judgment-Client-Started-At":String(p)},m;try{m=await fetch(_t("/api/rag/query/stream",o),{method:"POST",headers:g,body:JSON.stringify({question:e}),signal:l.signal})}catch(W){throw W.name==="AbortError"?new gt("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new gt(Ha(o),0,W)}finally{c&&window.clearTimeout(c)}if(!m.ok){let W=null;try{W=await m.json()}catch{W=null}let K=W&&typeof W=="object"&&W.detail?String(W.detail):`\u4F3A\u670D\u5668\u56DE\u61C9 ${m.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new gt(K,m.status,W)}if(!m.body)throw new gt("\u4F3A\u670D\u5668\u6C92\u6709\u56DE\u50B3\u53EF\u8B80\u53D6\u7684\u6D41\u7A0B\u4E32\u6D41\u3002",0,null);let w=m.body.getReader(),S=new TextDecoder,M="",j=null,B=null;try{for(;;){let{value:W,done:K}=await w.read();if(K)break;M+=S.decode(W,{stream:!0});let ye=M.indexOf(`

`);for(;ye>=0;){let pe=M.slice(0,ye).replace(/\r/g,"");M=M.slice(ye+2);let z="message",E=[];for(let x of pe.split(`
`))x.startsWith("event:")?z=x.slice(6).trim():x.startsWith("data:")&&E.push(x.slice(5).trimStart());if(E.length){let x=null;try{x=JSON.parse(E.join(`
`))}catch{x=null}if(x)if(z==="step"&&typeof s=="function")try{s(x)}catch{}else if(z==="partial"){if(typeof a=="function")try{a(x)}catch{}}else if(z==="token"){if(typeof n=="function")try{n(String(x.text||""))}catch{}}else if(z==="token_reset"){if(typeof i=="function")try{i()}catch{}}else z==="result"?j=x:z==="error"&&(B=new gt(x.message||x.detail||"RAG \u6D41\u7A0B\u5931\u6557\u3002",0,x))}ye=M.indexOf(`

`)}}}finally{try{await w.cancel()}catch{}c&&window.clearTimeout(c)}if(B)throw B;if(!j)throw new gt("\u6D41\u7A0B\u4E32\u6D41\u7D50\u675F\uFF0C\u4F46\u6C92\u6709\u6536\u5230\u6700\u7D42\u56DE\u7B54\u3002",0,null);let U=Math.round(performance.now()-$);return Qn({request_id:v,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:U,render_ms:0,status:"success"}),j&&typeof j=="object"&&(j._client_request_id=v),j}};var Jn="judgment.theme",Ua="nvidia",Ys=[{id:"vercel",name:"Vercel",description:"\u9ED1\u767D\u7CBE\u6E96 \xB7 Geist \xB7 \u5E7E\u4F55\u7559\u767D",swatches:["#0070f3","#171717","#fafafa"],metaColor:"#ffffff"},{id:"apple",name:"Apple",description:"SF Pro \xB7 \u5927\u5713\u89D2 \xB7 \u6C89\u6D78\u7559\u767D",swatches:["#0066cc","#1d1d1f","#f5f5f7"],metaColor:"#fbfbfd"},{id:"meta",name:"Meta",description:"Optimistic \xB7 \u660E\u4EAE\u85CD \xB7 \u81A0\u56CA\u5143\u4EF6",swatches:["#0064e0","#0091ff","#f1f4f7"],metaColor:"#ffffff"},{id:"nvidia",name:"NVIDIA",description:"GPU \u7DA0 \xB7 \u9ED1\u5E95 \xB7 \u92B3\u5229\u76F4\u89D2",swatches:["#76b900","#000000","#f7f7f7"],metaColor:"#000000"},{id:"ibm",name:"IBM",description:"Carbon \xB7 Plex Sans \xB7 \u4F01\u696D\u85CD",swatches:["#0f62fe","#161616","#f4f4f4"],metaColor:"#161616"},{id:"stripe",name:"Stripe",description:"\u7D2B\u975B\u6F38\u5C64 \xB7 \u7CBE\u5BC6\u91D1\u878D\u611F",swatches:["#635bff","#ea2261","#f6f9fc"],metaColor:"#ffffff"},{id:"linear",name:"Linear",description:"\u6DF1\u7A7A\u9ED1 \xB7 \u975B\u7D2B \xB7 \u6975\u7C21\u7DDA\u689D",swatches:["#17171d","#5e6ad2","#e8e8ec"],metaColor:"#010102"},{id:"figma",name:"Figma",description:"\u591A\u5F69\u8272\u584A \xB7 \u5354\u4F5C\u611F \xB7 \u85CD\u8272\u7126\u9EDE",swatches:["#0d99ff","#a259ff","#0acf83"],metaColor:"#ffffff"},{id:"notion",name:"Notion",description:"\u6696\u767D\u7D19\u5F35 \xB7 \u896F\u7DDA\u6A19\u984C \xB7 \u77E5\u8B58\u5EAB",swatches:["#0075de","#191918","#f7f6f3"],metaColor:"#ffffff"},{id:"openai",name:"OpenAI",description:"\u6696\u7070\u756B\u5E03 \xB7 \u9ED1\u8272\u884C\u52D5 \xB7 \u7DA0\u8272\u8A0A\u865F",swatches:["#10a37f","#0d0d0d","#f9f9f7"],metaColor:"#f9f9f7"}],Qa=new Map(Ys.map(e=>[e.id,e]));function Yi(e){return Qa.has(e)}function Xi(e){return Qa.get(e)||Qa.get(Ua)}function Ga(){try{let e=window.localStorage.getItem(Jn);return Yi(e)?e:Ua}catch{return Ua}}function Ja(e,{persist:t=!0}={}){let s=Xi(e);document.documentElement.dataset.theme=s.id;let a=document.getElementById("theme-color-meta");if(a&&a.setAttribute("content",s.metaColor),document.querySelectorAll(".theme-option").forEach(n=>{let i=n.dataset.themeId===s.id;n.classList.toggle("is-active",i),n.setAttribute("aria-checked",i?"true":"false")}),t)try{window.localStorage.setItem(Jn,s.id)}catch{}return window.dispatchEvent(new CustomEvent("judgment:theme",{detail:{theme:s.id}})),s}var Zi={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},eo={operational:{label:"\u6B63\u5E38",tone:"ok"},success:{label:"\u6210\u529F",tone:"ok"},ok:{label:"\u6B63\u5E38",tone:"ok"},healthy:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},warning:{label:"\u6CE8\u610F",tone:"warn"},empty:{label:"\u7121\u8CC7\u6599",tone:"warn"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},running:{label:"\u57F7\u884C\u4E2D",tone:"info"},pending:{label:"\u7B49\u5F85",tone:"idle"},skipped:{label:"\u7565\u904E",tone:"idle"},partial:{label:"\u90E8\u5206\u6210\u529F",tone:"warn"},preview:{label:"\u9810\u89BD\u6A21\u5F0F",tone:"info"},retrieval_only:{label:"\u50C5\u6AA2\u7D22\u7D50\u679C",tone:"warn"},not_indexed:{label:"\u5C1A\u672A\u7D22\u5F15",tone:"warn"},missing_query:{label:"\u7B49\u5F85\u67E5\u8A62",tone:"idle"},client_side:{label:"\u700F\u89BD\u5668\u7AEF",tone:"info"},not_configured:{label:"\u672A\u8A2D\u5B9A",tone:"idle"},unavailable:{label:"\u96E2\u7DDA",tone:"danger"},failed:{label:"\u5931\u6557",tone:"danger"},error:{label:"\u932F\u8AA4",tone:"danger"}},to={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},so={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},Vn={search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',send:'<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',refresh:'<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 4v5.5H15"/>',copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',check:'<path d="m5 12 4.2 4.2L19 6.5"/>',plus:'<path d="M12 5v14M5 12h14"/>',edit:'<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m13.5 7.5 3 3"/>',trash:'<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v5M14 11v5"/>',upload:'<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>',x:'<path d="m6 6 12 12M18 6 6 18"/>',external:'<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/>',message:'<path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H6l-3 2 1.3-4.2A8.5 8.5 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',history:'<path d="M3.2 12a8.8 8.8 0 1 0 2.8-6.3L3.2 8.5"/><path d="M3 3.5v5h5"/><path d="M12 7.5V12l3 1.8"/>',database:'<ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/><path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/>',layers:'<path d="m12 3 9 4.8-9 4.8-9-4.8L12 3Z"/><path d="m3 12.2 9 4.8 9-4.8"/><path d="m3 16.7 9 4.8 9-4.8"/>',cube:'<path d="m12 2.8 8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4L12 2.8Z"/><path d="m3.8 7.4 8.2 4.6 8.2-4.6"/><path d="M12 12v9.2"/>',browser:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6.5 6.5h.01"/>',download:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',chevronLeft:'<path d="m14.5 5-7 7 7 7"/>',chevronRight:'<path d="m9.5 5 7 7-7 7"/>',chevronDown:'<path d="m5 9 7 7 7-7"/>',arrowRight:'<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',alert:'<path d="M12 3 2.5 20.5h19L12 3Z"/><path d="M12 9v4.5"/><path d="M12 17.5h.01"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',sparkles:'<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"/>',table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M9 9.5V20M15 9.5V20"/>',sliders:'<path d="M4 7h8M16 7h4M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',palette:'<path d="M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h4a5 5 0 0 0 0-10h-4Z"/><circle cx="7.5" cy="10.5" r=".8" fill="currentColor" stroke="none"/><circle cx="10" cy="6.8" r=".8" fill="currentColor" stroke="none"/><circle cx="14.5" cy="6.8" r=".8" fill="currentColor" stroke="none"/>',server:'<rect x="3" y="4" width="18" height="6" rx="1.6"/><rect x="3" y="14" width="18" height="6" rx="1.6"/><path d="M7 7h.01M7 17h.01"/>',brain:'<path d="M9.7 4.2a2.8 2.8 0 0 0-3 2.8 2.8 2.8 0 0 0-1.1 5.2A2.9 2.9 0 0 0 7.8 18a2.9 2.9 0 0 0 3.9 2V4.2a2.8 2.8 0 0 0-2 0Z"/><path d="M14.3 4.2a2.8 2.8 0 0 1 3 2.8 2.8 2.8 0 0 1 1.1 5.2A2.9 2.9 0 0 1 16.2 18a2.9 2.9 0 0 1-3.9 2"/>',cloud:'<path d="M7 18.5h10.5a3.5 3.5 0 0 0 .4-7 5.5 5.5 0 0 0-10.6-1.3A4.2 4.2 0 0 0 7 18.5Z"/>',code:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',play:'<path d="M7 4.5v15l13-7.5-13-7.5Z"/>',file:'<path d="M6 2.8h8l4.5 4.5v13.9H6V2.8Z"/><path d="M14 2.8V7.5h5"/>',activity:'<path d="M3 12h4l2.2-5 4.1 10 2.2-5H21"/>',shield:'<path d="M12 2.8 20 6v6c0 4.7-3.2 8-8 9.2C7.2 20 4 16.7 4 12V6l8-3.2Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',terminal:'<path d="m5 7 5 5-5 5"/><path d="M12 17h7"/>',filter:'<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',link:'<path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10.2 5.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-1.4 1.4a5 5 0 0 0 7.1 7.1l1.2-1.2"/>',grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',pin:'<path d="M9 3.5h6l-1.1 5 2.6 2.6v2.4H7.5v-2.4L10.1 8.5 9 3.5Z"/><path d="M12 13.5v7"/>',more:'<circle cx="4.2" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="19.8" cy="12" r="2.6" fill="currentColor" stroke="none"/>',folder:'<path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h3.7l2 2H18a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5v-9Z"/>',cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9.5 9.5h5v5h-5z"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>'};function r(e){return String(e??"").replace(/[&<>"']/g,t=>Zi[t])}function f(e,t=16,s=""){let a=Vn[e]||Vn.info;return`<svg${s?` class="${r(s)}"`:""} width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a}</svg>`}function d(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?new Intl.NumberFormat("zh-TW").format(s):t}function Re(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=["B","KB","MB","GB","TB"],a=0;for(;t>=1024&&a<s.length-1;)t/=1024,a+=1;return a===0?`${t.toFixed(0)} B`:`${t.toFixed(1)} ${s[a]}`}function Va(e){if(e instanceof Date)return e;if(typeof e=="number"){let n=new Date(e);return Number.isNaN(n.getTime())?null:n}let t=String(e??"").trim();if(!t)return null;if(/^\d{8}$/.test(t))return new Date(Number(t.slice(0,4)),Number(t.slice(4,6))-1,Number(t.slice(6,8)));let s=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(t),a=new Date(s?`${t}Z`:t);return Number.isNaN(a.getTime())?null:a}function Dt(e){let t=Va(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit"}).format(t):e?r(e):"\u2014"}function qe(e){let t=Va(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1}).format(t):e?r(e):"\u2014"}function js(e){let t=Va(e);if(!t)return"";let s=Date.now()-t.getTime();return s<45e3?"\u525B\u525B":s<36e5?`${Math.max(1,Math.round(s/6e4))} \u5206\u9418\u524D`:s<864e5?`${Math.round(s/36e5)} \u5C0F\u6642\u524D`:s<6048e5?`${Math.round(s/864e5)} \u5929\u524D`:Dt(t)}function ge(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;if(t<6e4)return`${(t/1e3).toFixed(1)} s`;let s=Math.floor(t/6e4),a=Math.round(t%6e4/1e3);return`${s}m ${a}s`}function Ot(e){return eo[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function Ve(e,t){let s=Ot(e);return`<span class="badge ${to[s.tone]}"><span class="status-dot ${so[s.tone]}"></span>${r(t||s.label)}</span>`}function ao(e){return e==="law"?'<span class="badge badge-info">\u6CD5\u898F</span>':e==="order"?'<span class="badge badge-neutral">\u547D\u4EE4</span>':e?`<span class="badge badge-neutral">${r(e)}</span>`:'<span class="cell-empty">\u2014</span>'}function Xs(e,t){let s=String(e??"");return s.length>t?`${s.slice(0,t)}\u2026`:s}function Zs(e,t="text"){if(e==null||e==="")return'<span class="cell-empty">\u2014</span>';switch(t){case"boolean":return e?'<span class="badge badge-ok">\u662F</span>':'<span class="badge badge-neutral">\u5426</span>';case"status":return Ve(String(e));case"source":return ao(String(e));case"number":return`<span class="mono">${d(e)}</span>`;case"duration":return`<span class="mono">${ge(e)}</span>`;case"datetime":return`<span class="mono">${qe(e)}</span>`;case"date":return`<span class="mono">${Dt(e)}</span>`;case"url":{let s=String(e),a=Xs(s.replace(/^https?:\/\//,""),46);return`<span class="cell-url"><a href="${r(s)}" target="_blank" rel="noopener noreferrer" title="${r(s)}">${f("external",10)}${r(a)}</a></span>`}case"mono":{let s=String(e);return`<span class="cell-mono cell-truncate" title="${r(s)}">${r(Xs(s,54))}</span>`}case"longtext":{let s=String(e);return`<span class="cell-truncate" title="${r(s)}">${r(Xs(s,100))}</span>`}default:{let s=String(e);return`<span class="cell-truncate" title="${r(s)}">${r(Xs(s,90))}</span>`}}}function Ie({tone:e="info",title:t,text:s,iconName:a="info"}){let n=e==="ok"?"check":e==="danger"||e==="warn"?"alert":"i";return`<div class="notice notice-${e}" role="status">
    <span class="notice-icon" aria-hidden="true">${n==="i"?"i":f(n,12)}</span>
    <div class="notice-body">
      ${t?`<strong>${r(t)}</strong>`:""}
      ${s?`<p>${s}</p>`:""}
    </div>
  </div>`}function pt({iconName:e="search",title:t,text:s="",actions:a="",className:n=""}){return`<div class="empty-state ${n}">
    <span class="empty-icon">${f(e,24)}</span>
    <h3 class="empty-title">${r(t)}</h3>
    ${s?`<p class="empty-text">${s}</p>`:""}
    ${a?`<div class="empty-actions">${a}</div>`:""}
  </div>`}function Me(e,t,s="\u8655\u7406\u4E2D\u2026"){e&&(t?(e.dataset.idleHtml||(e.dataset.idleHtml=e.innerHTML),e.disabled=!0,e.classList.add("is-loading"),e.innerHTML=`<span class="spinner" aria-hidden="true"></span><span>${r(s)}</span>`):(e.disabled=!1,e.classList.remove("is-loading"),e.dataset.idleHtml&&(e.innerHTML=e.dataset.idleHtml,delete e.dataset.idleHtml)))}function N(e,t="info",s=4200){let a=document.getElementById("toast-region");if(!a)return null;let n={info:"i",ok:"\u2713",warn:"!",danger:"\xD7"},i=document.createElement("div");i.className=`toast toast-${t}`,i.setAttribute("role",t==="danger"?"alert":"status"),i.innerHTML=`<span class="toast-mark" aria-hidden="true">${n[t]||"i"}</span>
    <div class="toast-body">${r(e)}</div>
    <button class="toast-close" type="button" aria-label="\u95DC\u9589\u901A\u77E5">\xD7</button>`;let o=()=>{i.isConnected&&(i.classList.add("is-leaving"),window.setTimeout(()=>i.remove(),190))};return i.querySelector(".toast-close").addEventListener("click",o),a.appendChild(i),s>0&&window.setTimeout(o,s),i}async function fs(e){try{return await navigator.clipboard.writeText(e),!0}catch{let s=document.createElement("textarea");s.value=e,s.setAttribute("readonly",""),s.style.position="fixed",s.style.opacity="0",document.body.appendChild(s),s.select();let a=!1;try{a=document.execCommand("copy")}catch{a=!1}return s.remove(),a}}function Ft(e,t,s="text/plain;charset=utf-8"){let a=new Blob([t],{type:s}),n=URL.createObjectURL(a),i=document.createElement("a");i.href=n,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(n),1e3)}var ea="judgment.fontSizes.v1",Za="judgment.appearance",er=new Set(["light","dark","system"]),Wn="light",Ts=window.matchMedia("(prefers-color-scheme: dark)"),no="font-size",Es=[{id:"page-title",label:"\u9801\u9762\u6A19\u984C",hint:"\u5404\u9801\u6700\u4E0A\u65B9\u7684 h1 \u6A19\u984C",selectors:[".page-title"],defaultPx:40,min:20,max:72},{id:"home-title",label:"\u9996\u9801\u4E3B\u8996\u89BA\u6A19\u984C",hint:"\u9996\u9801\u6700\u5927\u7684\u4E3B\u6A19\u984C",selectors:[".home-title"],defaultPx:88,min:40,max:140},{id:"section-title",label:"\u5340\u584A\u6A19\u984C",hint:"\u5831\u8868\u3001\u5361\u7247\u8207\u5340\u584A\u6A19\u984C",selectors:[".section-title",".report-title",".side-card-title",".filter-title",".tests-card-title",".status-sidebar-title",".judgment-dialog-head h2"],defaultPx:16,min:10,max:36},{id:"body",label:"\u5167\u6587\u8207\u8AAA\u660E",hint:"\u6BB5\u843D\u3001\u56DE\u7B54\u3001\u8AAA\u660E\u8207\u6458\u8981\u6587\u5B57",selectors:[".answer-text",".page-subtitle",".report-sub",".home-lead",".empty-text",".notice-body p",".citation-snippet",".side-card-body",".detail-list",".field-help",".report-empty-inline",".processing-section-sub",".summary-value-text",".status-summary",".warnings",".law-dialog-warning"],defaultPx:14,min:8,max:28},{id:"table",label:"\u8868\u683C\u5167\u5BB9",hint:"\u8CC7\u6599\u8868\u683C\u7684\u8868\u982D\u8207\u5132\u5B58\u683C",selectors:[".data-table th",".data-table td"],defaultPx:12,min:8,max:24},{id:"meta",label:"\u6A19\u7C64\u8207\u8F14\u52A9\u6587\u5B57",hint:"badge\u3001chip\u3001\u6B04\u4F4D\u6A19\u7C64\u8207 metadata",selectors:[".badge",".chip",".citation-meta",".citation-index",".answer-section-label",".report-kicker",".report-section-title",".eyebrow",".field-label",".summary-label",".metric-label",".footer-bottom",".nav-update-badge"],defaultPx:10,min:7,max:20},{id:"button",label:"\u6309\u9215\u8207\u5C0E\u89BD",hint:"\u64CD\u4F5C\u6309\u9215\u3001\u9801\u9996\u5C0E\u89BD\u8207\u9023\u7D50",selectors:[".btn",".nav-link",".page-btn",".law-link",".judgment-link",".theme-option-name",".theme-option-desc"],defaultPx:13,min:9,max:24},{id:"form",label:"\u8868\u55AE\u8207\u8F38\u5165",hint:"\u8F38\u5165\u6846\u3001\u4E0B\u62C9\u9078\u55AE\u8207 textarea",selectors:["input","textarea","select",".input",".field-input"],defaultPx:14,min:9,max:28},{id:"mono",label:"\u7A0B\u5F0F\u78BC\u8207\u6578\u503C",hint:"\u7B49\u5BEC\u6587\u5B57\u3001\u67E5\u8A62\u8A9E\u53E5\u8207\u7D71\u8A08\u6578\u503C",selectors:[".mono",".cell-mono",".cell-number",".query-code","code",".metric-value",".summary-value",".perf-stat-value",".mini-stat-value"],defaultPx:13,min:8,max:30},{id:"law-page",label:"\u6CD5\u898F\u689D\u6587\uFF08\u9801\u9762\uFF09",hint:"\u6CD5\u898F\u6AA2\u7D22\u7D50\u679C\u8207\u6CD5\u898F\u4F86\u6E90\u5361\u689D\u6587",selectors:[".law-answer-article-text",".law-answer-article-no",".law-source-article-text",".law-source-article-no",".law-article-text",".law-article-no"],excludeAncestors:[".law-dialog"],defaultPx:12,min:9,max:28},{id:"law-dialog",label:"\u6CD5\u898F\u689D\u6587\uFF08\u5F48\u51FA\u8996\u7A97\uFF09",hint:"\u6309\u4E0B\u689D\u6587\u5F8C\u958B\u555F\u7684\u6CD5\u898F dialog",selectors:[".law-dialog .law-article-text",".law-dialog .law-article-no",".law-dialog .law-chapter"],defaultPx:16,min:10,max:32},{id:"judgment-dialog",label:"\u5224\u6C7A\u5168\u6587\uFF08\u5F48\u51FA\u8996\u7A97\uFF09",hint:"\u5224\u6C7A\u539F\u6587 dialog \u7684\u5168\u6587\u5340\u584A",selectors:[".judgment-dialog-text"],defaultPx:23,min:12,max:48}],hs=new Map(Es.map(e=>[e.id,e])),Ns=new WeakMap,Qt=nr(),$t={...Qt},Gt=sr(),Wa=new Set,vs=null,bs=null,ft=null,ls=null,Kn=null,Zt=no,es=!1,Ka=null,Ya=!1,ta="";function tr(e,t,s){return Math.min(s,Math.max(t,e))}function en(e){return Math.round(e*10)/10}function aa(e){return Number.isInteger(e)?String(e):e.toFixed(1)}function sr(){try{let e=window.localStorage.getItem(Za);return er.has(e)?e:Wn}catch{return Wn}}function ro(){return Gt==="system"?Ts.matches?"dark":"light":Gt}function ar(){document.querySelectorAll("[data-appearance-option]").forEach(e=>{let t=e.dataset.appearanceOption===Gt;e.classList.toggle("is-active",t),e.setAttribute("aria-pressed",t?"true":"false")})}function sa({persist:e=!1}={}){if(document.documentElement.dataset.appearance=ro(),document.documentElement.dataset.appearanceMode=Gt,ar(),e)try{window.localStorage.setItem(Za,Gt)}catch{}}function io(e){er.has(e)&&(Gt=e,sa({persist:!0}))}function Yn(){Gt==="system"&&sa()}typeof Ts.addEventListener=="function"?Ts.addEventListener("change",Yn):typeof Ts.addListener=="function"&&Ts.addListener(Yn);function nr(){let e=null;try{e=JSON.parse(window.localStorage.getItem(ea)||"null")}catch{e=null}if(!e||typeof e!="object"||Array.isArray(e))return{};let t={};for(let s of Es){let a=Number(e[s.id]);Number.isFinite(a)&&(t[s.id]=en(tr(a,s.min,s.max)))}return t}function oo(){try{return Object.keys(Qt).length?window.localStorage.setItem(ea,JSON.stringify(Qt)):window.localStorage.removeItem(ea),!0}catch{return!1}}function Cs(e){let t=new Set;for(let s of e.selectors)document.querySelectorAll(s).forEach(a=>{a.closest(".settings-sidebar")||Array.isArray(e.excludeAncestors)&&e.excludeAncestors.some(n=>a.closest(n))||t.add(a)});return Array.from(t)}function rr(){if(!ta)return;let e=hs.get(ta);if(e)for(let t of Cs(e))t.classList.add("font-size-highlight")}function ir(e){if($s(),!hs.get(e))return;ta=e;let s=ft.querySelector(`.font-size-row[data-font-group="${e}"]`);s&&s.classList.add("is-previewing"),rr()}function $s(){ta="",ft.querySelectorAll(".font-size-row.is-previewing").forEach(e=>e.classList.remove("is-previewing")),document.querySelectorAll(".font-size-highlight").forEach(e=>e.classList.remove("font-size-highlight"))}function lo(e){if(Ns.has(e))return Ns.get(e);let t={inline:e.style.fontSize||"",computed:parseFloat(window.getComputedStyle(e).fontSize)||0};return Ns.set(e,t),t}function co(e){let t=Ns.get(e);t&&(t.inline?e.style.fontSize=t.inline:e.style.removeProperty("font-size"))}function uo(e){let t=$t[e.id];if(Number.isFinite(t))for(let s of Cs(e))lo(s),s.style.fontSize=`${t}px`}function po(e){for(let t of Cs(e))co(t)}function ts(){for(let e of Wa){let t=hs.get(e);t&&po(t)}Wa=new Set;for(let e of Es)Number.isFinite($t[e.id])&&(uo(e),Wa.add(e.id));rr()}function or(){ts(),es&&Zt==="font-size"&&Rs()}function lr(){Ya||(Ya=!0,window.requestAnimationFrame(()=>{Ya=!1,ts()}))}function mo(){Ka||!document.body||(Ka=new MutationObserver(e=>{if(Object.keys($t).length){for(let t of e)if(t.type==="childList"&&(t.addedNodes.length||t.removedNodes.length)){lr();return}}}),Ka.observe(document.body,{childList:!0,subtree:!0}))}function go(e){let t=e.filter(s=>typeof s.getClientRects=="function"&&s.getClientRects().length);return t.length?t:e}function fo(){let e=Es.filter(t=>Cs(t).length>0||Number.isFinite($t[t.id]));return e.length?e:Es}function na(e){let t=$t[e.id];if(Number.isFinite(t))return t;let a=go(Cs(e)).map(o=>{let l=Ns.get(o);return l&&l.computed?l.computed:parseFloat(window.getComputedStyle(o).fontSize)||0}).filter(o=>o>0).sort((o,l)=>o-l);if(!a.length)return e.defaultPx;let n=Math.floor(a.length/2),i=a.length%2?a[n]:(a[n-1]+a[n])/2;return en(i)}function bo(){let e=[{id:"font-size",label:"\u5B57\u578B\u5927\u5C0F",hint:"\u8ABF\u6574\u5404\u6587\u5B57\u5340\u584A",glyph:'<span class="settings-option-aa" aria-hidden="true">Aa</span>'},{id:"theme",label:"\u4ECB\u9762\u98A8\u683C",hint:"\u5207\u63DB\u54C1\u724C\u8996\u89BA\u8A9E\u8A00",glyph:f("palette",15)}];ls.innerHTML=e.map(t=>`<button class="settings-option${Zt===t.id?" is-active":""}" type="button" role="tab"
        data-settings-panel="${t.id}"
        aria-selected="${Zt===t.id?"true":"false"}">
        <span class="settings-option-icon">${t.glyph}</span>
        <span class="settings-option-copy">
          <strong>${r(t.label)}</strong>
          <small>${r(t.hint)}</small>
        </span>
        ${f("chevronRight",12,"settings-option-chevron")}
      </button>`).join("")}function Rs(){$s();let e=fo(),t=e.map(s=>{let a=aa(na(s));return`<section class="font-size-row" data-font-group="${s.id}">
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
    </section>`}).join("");ft.innerHTML=`<div class="settings-panel-head">
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
    </div>`}function vo(){$s();let e=Ga(),t=Ys.map((n,i)=>{let o=n.swatches.map(l=>`<i style="--swatch:${r(l)}"></i>`).join("");return`<button class="theme-option${n.id===e?" is-active":""}" type="button" role="menuitemradio"
      data-theme-id="${r(n.id)}"
      data-theme="${r(n.id)}"
      aria-checked="${n.id===e?"true":"false"}">
      <span class="theme-option-index">${String(i+1).padStart(2,"0")}</span>
      <span class="theme-option-body">
        <span class="theme-option-name">${r(n.name)}</span>
        <span class="theme-option-desc">${r(n.description)}</span>
      </span>
      <span class="theme-option-active-preview" aria-hidden="true">
        ${f("sliders",11)}
        <span>\u4F5C\u7528\u4E2D</span>
        <span class="theme-option-active-preview-badge">2</span>
      </span>
      <span class="theme-option-swatches" aria-hidden="true">${o}</span>
      <span class="theme-option-check" aria-hidden="true">${f("check",14)}</span>
    </button>`}).join(""),a=`<div class="appearance-switch" role="group" aria-label="\u660E\u6697\u6A21\u5F0F">
    ${[{id:"light",label:"\u4EAE"},{id:"dark",label:"\u6697"},{id:"system",label:"\u7CFB\u7D71"}].map(n=>`<button class="appearance-option" type="button"
          data-appearance-option="${n.id}"
          aria-pressed="${Gt===n.id?"true":"false"}"
          title="${n.id==="system"?"\u8DDF\u96A8\u7CFB\u7D71\u660E\u6697":`${n.label}\u8272\u6A21\u5F0F`}">${n.label}</button>`).join("")}
  </div>`;ft.innerHTML=`<div class="settings-panel-head">
      <div>
        <h3>\u4ECB\u9762\u98A8\u683C</h3>
        <p>\u9078\u64C7\u4E3B\u63A7\u53F0\u7684\u54C1\u724C\u8996\u89BA\u8A9E\u8A00\uFF1B\u4E3B\u984C\u6703\u7ACB\u5373\u5957\u7528\u4E26\u4FDD\u7559\u3002</p>
      </div>
      <div class="settings-panel-head-actions">
        <span class="badge badge-info">${Ys.length} \u7A2E</span>
        ${a}
      </div>
    </div>
    <div class="settings-theme-list" role="menu" aria-label="\u4ECB\u9762\u98A8\u683C">${t}</div>`,ar()}function ho(){ls.querySelectorAll("[data-settings-panel]").forEach(e=>{let t=e.dataset.settingsPanel===Zt;e.classList.toggle("is-active",t),e.setAttribute("aria-selected",t?"true":"false")})}function tn(e=Zt){Zt=e==="theme"?"theme":"font-size",ho(),Zt==="theme"?vo():Rs()}function Xn(e,t,s){let a=Number(t);if(!Number.isFinite(a))return;let n=en(tr(a,e.min,e.max));$t[e.id]=n;let i=s?.querySelector(".font-size-slider");i&&(i.value=String(n));let o=s?.querySelector(".font-size-preview");o&&(o.style.fontSize=`${n}px`),lr()}function $o(){ft.querySelectorAll(".font-size-row").forEach(e=>{let t=hs.get(e.dataset.fontGroup);if(!t)return;let s=$t[t.id]??na(t),a=e.querySelector(".font-size-number-input");a&&(a.value=aa(s));let n=e.querySelector(".font-size-slider");n&&(n.value=String(s));let i=e.querySelector(".font-size-preview");i&&(i.style.fontSize=`${s}px`)})}function Zn(e){let t=e.target.closest(".font-size-row");if(!t)return;let s=hs.get(t.dataset.fontGroup);if(!s)return;let a=e.target.classList.contains("font-size-number-input");if(!(a&&e.target.value==="")){if(e.type==="input"&&a){let n=Number(e.target.value);if(!Number.isFinite(n))return;Xn(s,n,t);return}if(Xn(s,e.target.value,t),e.type==="input"){let n=t.querySelector(".font-size-number-input");n&&document.activeElement!==n&&(n.value=aa($t[s.id]??na(s)))}}}function yo(e){if(!e.target.classList.contains("font-size-number-input"))return;let t=e.target.closest(".font-size-row"),s=t?hs.get(t.dataset.fontGroup):null;if(!s)return;let a=$t[s.id]??na(s);e.target.value=aa(a)}function wo(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||ir(t.dataset.fontGroup)}function _o(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||$s()}function ko(e){let t=e.target.closest(".font-size-row");t&&ir(t.dataset.fontGroup)}function So(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||$s()}function xo(e){let t=e.target.closest("[data-settings-panel]");if(t){tn(t.dataset.settingsPanel);return}let s=e.target.closest("[data-settings-action]");if(s){let i=s.dataset.settingsAction;if(i==="save"){Qt={...$t};let o=oo();$o(),N(o?"\u5B57\u578B\u5927\u5C0F\u5DF2\u5132\u5B58\u3002":"\u5B57\u578B\u5927\u5C0F\u5DF2\u5957\u7528\uFF0C\u4F46\u700F\u89BD\u5668\u7121\u6CD5\u5132\u5B58\u8A2D\u5B9A\u3002",o?"ok":"warn");return}if(i==="cancel"){$t={...Qt},ts(),Rs(),N("\u5DF2\u53D6\u6D88\u672A\u5132\u5B58\u7684\u5B57\u578B\u8B8A\u66F4\u3002","info");return}i==="reset"&&($t={},ts(),Rs(),N("\u5DF2\u56DE\u5FA9\u9810\u8A2D\u5B57\u578B\uFF1B\u6309\u300C\u5132\u5B58\u300D\u4FDD\u7559\u8B8A\u66F4\u3002","info"));return}let a=e.target.closest("[data-appearance-option]");if(a){io(a.dataset.appearanceOption);return}let n=e.target.closest(".theme-option");n&&Ja(n.dataset.themeId)}function qo(){es||(es=!0,$t={...Qt},document.body.classList.add("settings-open"),vs.removeAttribute("inert"),vs.setAttribute("aria-hidden","false"),bs.setAttribute("aria-expanded","true"),tn(Zt),ts(),window.requestAnimationFrame(()=>{let e=ls.querySelector(".settings-option.is-active")||ls.querySelector(".settings-option");e&&e.focus({preventScroll:!0})}))}function Xa({restoreFocus:e=!0}={}){es&&(es=!1,$s(),$t={...Qt},ts(),document.body.classList.remove("settings-open"),e&&bs.focus({preventScroll:!0}),vs.setAttribute("aria-hidden","true"),vs.setAttribute("inert",""),bs.setAttribute("aria-expanded","false"))}function cr(){vs=document.getElementById("settings-sidebar"),bs=document.getElementById("settings-trigger"),ft=document.getElementById("settings-panel"),ls=document.getElementById("settings-options"),Kn=document.getElementById("settings-close"),!(!vs||!bs||!ft||!ls)&&(sa(),Ja(Ga(),{persist:!1}),bo(),Rs(),mo(),ts(),bs.addEventListener("click",()=>{es?Xa():qo()}),Kn?.addEventListener("click",()=>Xa()),ls.addEventListener("click",e=>{let t=e.target.closest("[data-settings-panel]");t&&tn(t.dataset.settingsPanel)}),ft.addEventListener("click",xo),ft.addEventListener("input",Zn),ft.addEventListener("change",Zn),ft.addEventListener("blur",yo,!0),ft.addEventListener("pointerover",wo),ft.addEventListener("pointerout",_o),ft.addEventListener("focusin",ko),ft.addEventListener("focusout",So),ft.addEventListener("keydown",e=>{e.key==="Enter"&&e.target.classList.contains("font-size-number-input")&&(e.preventDefault(),e.target.blur())}),document.addEventListener("keydown",e=>{e.key==="Escape"&&es&&Xa()}),window.addEventListener("storage",e=>{if(e.key===Za){Gt=sr(),sa();return}e.key===ea&&(Qt=nr(),es||($t={...Qt},ts()))}))}var sn={};Wt(sn,{render:()=>Lo});function Ao(e){let t=e&&typeof e=="object"?e:{},s=t.judgment_total,a=t.financial_total,n=Number(s),i=Number(a),o=s!=null&&Number.isFinite(n)&&n>=0,l=a!=null&&Number.isFinite(i)&&i>=0;return{total:o?n:null,financial:l?i:null,ratio:o&&l&&n>0?i/n*100:null}}function zt(e,{loading:t=!1}={}){let s=Ao(e),a=t?"\u8B80\u53D6\u4E2D\u2026":d(s.total),n=t?"\u8B80\u53D6\u4E2D\u2026":d(s.financial),i=t?"\u8B80\u53D6\u4E2D\u2026":s.ratio===null?"\u2014":`${s.ratio.toFixed(1)}%`;return`<div class="processing-summary-card">
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
  </div>`}var dr=[{route:"rag",icon:"message",kicker:"RAG",title:"RAG \u63D0\u554F",summary:"\u7528\u81EA\u7136\u8A9E\u8A00\u627E\u5230\u6CD5\u898F\u8207\u5224\u6C7A\uFF0C\u7B54\u6848\u9644\u4E0A\u53EF\u56DE\u6EAF\u7684\u5F15\u7528\u4F86\u6E90\u3002",description:"Qdrant \u5411\u91CF\u6AA2\u7D22\u3001LLM \u751F\u6210\u56DE\u7B54\u3001\u5F15\u7528\u9A57\u8B49\u8207 pipeline waterfall\uFF0C\u90FD\u5728\u540C\u4E00\u500B\u5DE5\u4F5C\u5340\u5B8C\u6210\u3002",metric:"Citations first",tone:"feature"},{route:"data",icon:"database",kicker:"EXPLORE",title:"\u8CC7\u6599\u5EAB\u67E5\u8A62",summary:"\u8DE8 PostgreSQL\u3001Parquet\u3001Qdrant \u8207 IndexedDB \u63A2\u7D22\u8CC7\u6599\u3002",description:"\u4EE5 metadata\u3001SQL \u6216\u8A9E\u610F\u67E5\u8A62\u6AA2\u8996\u8CC7\u6599\u8868\uFF0C\u652F\u63F4\u5206\u9801\u3001\u6392\u5E8F\u8207 CSV\uFF0FJSON \u532F\u51FA\u3002",metric:"4 \u7A2E\u8CC7\u6599\u4F86\u6E90",tone:"blue"},{route:"quality",icon:"shield",kicker:"QUALITY",title:"\u8CC7\u6599\u54C1\u8CEA",summary:"\u7528 DuckDB \u76F4\u63A5\u6AA2\u67E5\u539F\u59CB\u5224\u6C7A\u8CC7\u6599\u7684\u5B8C\u6574\u6027\u3002",description:"\u6AA2\u67E5\u91CD\u8907\u3001\u7F3A\u6F0F\u3001\u5F15\u7528\u4E00\u81F4\u6027\u8207 archive \u7D71\u8A08\uFF0C\u4E26\u7DAD\u8B77\u984C\u5EAB\u8207 benchmark \u984C\u7D44\u3002",metric:"DuckDB native",tone:"green"},{route:"performance",icon:"activity",kicker:"OBSERVE",title:"\u6548\u80FD\u5831\u8868",summary:"\u5F9E\u55AE\u6B21\u8ACB\u6C42\u5230\u6574\u9AD4\u7D22\u5F15\uFF0C\u8FFD\u8E64\u6BCF\u4E00\u500B\u6642\u9593\u7247\u6BB5\u3002",description:"\u5B8C\u6574 Flow\u3001RAG Pipeline waterfall\u3001Token\u3001TTFT\u3001\u7D22\u5F15\u541E\u5410\u8207 RAG Benchmark \u4E00\u6B21\u770B\u5B8C\u3002",metric:"ms-level trace",tone:"amber"},{route:"processing",icon:"sliders",kicker:"PIPELINE",title:"\u8CC7\u6599\u8655\u7406",summary:"\u4E0B\u8F09\u3001\u532F\u5165\u3001\u5099\u4EFD\u3001\u7D22\u5F15\uFF0C\u96C6\u4E2D\u7BA1\u7406\u8CC7\u6599\u751F\u547D\u9031\u671F\u3002",description:"\u8FFD\u8E64\u6CD5\u898F\u3001\u547D\u4EE4\u8207\u5224\u6C7A\u6D41\u7A0B\uFF0C\u7BA1\u7406 Ollama \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u8207\u7DDA\u4E0A\u66F4\u65B0\u6AA2\u67E5\u3002",metric:"End-to-end",tone:"violet"},{route:"status",icon:"server",kicker:"STATUS",title:"\u7CFB\u7D71\u72C0\u614B",summary:"\u5373\u6642\u638C\u63E1\u6BCF\u4E00\u500B\u670D\u52D9\u8207\u57FA\u790E\u8A2D\u65BD\u7684\u904B\u4F5C\u72C0\u614B\u3002",description:"FastAPI\u3001PostgreSQL\u3001Qdrant\u3001Ollama\u3001Docker\uFF0Fvolume\u3001\u78C1\u789F\u8207\u8CC7\u6599\u7248\u672C\u3002",metric:"Live health",tone:"slate"},{route:"tests",icon:"check",kicker:"VERIFY",title:"\u7CFB\u7D71\u6E2C\u8A66",summary:"\u5728\u4E0A\u7DDA\u524D\u78BA\u8A8D API\u3001\u6A21\u578B\u8207\u6E2C\u8A66 Flow \u90FD\u6E96\u5099\u597D\u4E86\u3002",description:"\u8A2D\u5B9A API Base\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207 LLM chat \u80FD\u529B\uFF0C\u57F7\u884C\u591A\u6A21\u578B\u6E2C\u8A66\u4E26\u6AA2\u67E5\u7D50\u679C\u3002",metric:"Model ready",tone:"rose"}];function Mo(e){return`<a class="home-tile tone-${r(e.tone)}" href="#/${e.route}">
    <span class="home-tile-watermark" aria-hidden="true">${f(e.icon,132)}</span>
    <span class="home-tile-head">
      <span class="home-tile-icon">${f(e.icon,22)}</span>
      <span class="home-tile-kicker">${r(e.kicker)}</span>
    </span>
    <span class="home-tile-copy">
      <strong>${r(e.title)}</strong>
      <span>${r(e.summary)}</span>
    </span>
    <span class="home-tile-foot">
      <span class="home-tile-metric">${r(e.metric)}</span>
      <span class="home-tile-cta">\u63A2\u7D22 ${f("arrowRight",13)}</span>
    </span>
  </a>`}async function Lo(e,t){let s=dr[0],a=dr.slice(1).map(Mo).join("");e.innerHTML=`<section class="page home-page">
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
              ${f("sparkles",16)}<span>\u958B\u59CB\u6AA2\u7D22</span>
            </button>
          </div>
          <div class="home-ask-help" id="home-ask-help">
            <span><kbd>Enter</kbd> \u9001\u51FA</span>
            <span><kbd>Shift</kbd> + <kbd>Enter</kbd> \u63DB\u884C</span>
            <span>\u9001\u51FA\u5F8C\u5728 RAG \u63D0\u554F\u4E2D\u958B\u555F</span>
          </div>
        </form>
        <div class="home-hero-meta">
          <span>${f("shield",13)}\u53EF\u56DE\u6EAF\u5F15\u7528</span>
          <span>${f("database",13)}\u6CD5\u898F\uFF0B\u5224\u6C7A</span>
          <span>${f("activity",13)}Pipeline waterfall</span>
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

      <div class="processing-summary judgment-stats-cards" id="home-judgment-stats" aria-label="\u91D1\u878D\u6848\u4EF6\u4F54\u6BD4">
        ${zt(null,{loading:!0})}
      </div>

      <a class="home-feature" href="#/${s.route}">
        <span class="home-feature-glow" aria-hidden="true"></span>
        <div class="home-feature-copy">
          <span class="home-feature-kicker">${r(s.kicker)} \xB7 ${r(s.metric)}</span>
          <h3>${r(s.title)}<br /><span>${r(s.summary)}</span></h3>
          <p>${r(s.description)}</p>
          <span class="home-feature-cta">\u958B\u59CB\u63D0\u554F ${f("arrowRight",14)}</span>
        </div>
        <div class="home-feature-art" aria-hidden="true">
          <span class="home-feature-orbit orbit-one"></span>
          <span class="home-feature-orbit orbit-two"></span>
          <span class="home-feature-core">${f(s.icon,46)}</span>
          <span class="home-feature-chip chip-qdrant">Qdrant</span>
          <span class="home-feature-chip chip-llm">LLM</span>
          <span class="home-feature-chip chip-cite">Citations</span>
        </div>
      </a>

      <div class="home-tile-grid">${a}</div>
    </div>

    <section class="home-trust" aria-label="\u7CFB\u7D71\u539F\u5247">
      <div class="home-trust-item">
        <span class="home-trust-icon">${f("shield",18)}</span>
        <strong>\u4F86\u6E90\u512A\u5148</strong>
        <p>\u56DE\u7B54\u53EA\u6839\u64DA\u6AA2\u7D22\u5230\u7684\u6CD5\u898F\u8207\u5224\u6C7A\u7247\u6BB5\u751F\u6210\uFF0C\u5F15\u7528\u7DE8\u865F\u53EF\u56DE\u5230\u539F\u59CB\u8CC7\u6599\u3002</p>
      </div>
      <div class="home-trust-item">
        <span class="home-trust-icon">${f("server",18)}</span>
        <strong>\u672C\u6A5F\u6A21\u578B</strong>
        <p>\u900F\u904E Ollama \u4F7F\u7528\u672C\u6A5F\u6216\u5340\u7DB2\u6A21\u578B\uFF0C\u6A21\u578B\u8207\u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u90FD\u53EF\u8ABF\u6574\u3002</p>
      </div>
      <div class="home-trust-item">
        <span class="home-trust-icon">${f("layers",18)}</span>
        <strong>\u7248\u672C\u53EF\u8FFD\u6EAF</strong>
        <p>\u6CD5\u898F\u3001\u5224\u6C7A\u8207\u5411\u91CF\u7D22\u5F15\u4FDD\u7559\u7248\u672C\u8207\u66F4\u65B0\u7D00\u9304\uFF0C\u8CC7\u6599\u8B8A\u66F4\u4E0D\u6703\u9ED8\u9ED8\u6D88\u5931\u3002</p>
      </div>
    </section>
  </section>`;let n=e.querySelector("#home-ask-form"),i=e.querySelector("#home-question"),o=()=>{let c=String(i?.value||"").trim().slice(0,500);if(!c){i?.focus();return}try{window.sessionStorage.setItem("judgment.pending_question",c)}catch{}window.__judgmentPendingQuestion=c,t&&typeof t.navigate=="function"?t.navigate("rag"):window.location.hash="#/rag"},l=()=>{i&&(i.style.height="auto",i.style.height=`${Math.min(i.scrollHeight,140)}px`)};i?.addEventListener("input",l),n?.addEventListener("submit",c=>{c.preventDefault(),o()}),i?.addEventListener("keydown",c=>{c.key==="Enter"&&!c.shiftKey&&!c.isComposing&&(c.preventDefault(),o())});let u=e.querySelector("#home-judgment-stats");Q.judgmentStats().then(c=>{!u||!u.isConnected||(u.innerHTML=zt(c))}).catch(()=>{!u||!u.isConnected||(u.innerHTML=zt(null))}),l(),i?.focus({preventScroll:!0})}var kn={};Wt(kn,{render:()=>fc});var jo="judgment-console";var St="query_history",ss="settings",as="audit_events";var ct={history:[],settings:new Map,audit:[],nextId:1},ra=null,dt=!("indexedDB"in window);function Ht(e){return new Promise((t,s)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>s(e.error)})}function qt(e){return new Promise((t,s)=>{e.oncomplete=()=>t(),e.onerror=()=>s(e.error),e.onabort=()=>s(e.error||new Error("transaction aborted"))})}function Tt(){return ra||(ra=new Promise((e,t)=>{if(!("indexedDB"in window)){dt=!0,t(new Error("IndexedDB is unavailable"));return}let s;try{s=window.indexedDB.open(jo,2)}catch(a){dt=!0,t(a);return}s.onupgradeneeded=()=>{let a=s.result;if(!a.objectStoreNames.contains(St)){let n=a.createObjectStore(St,{keyPath:"id",autoIncrement:!0});n.createIndex("created_at","created_at"),n.createIndex("kind","kind")}if(a.objectStoreNames.contains(ss)||a.createObjectStore(ss,{keyPath:"key"}),!a.objectStoreNames.contains(as)){let n=a.createObjectStore(as,{keyPath:"key"});n.createIndex("created_at","created_at"),n.createIndex("dataset","dataset"),n.createIndex("jid","jid"),n.createIndex("issue_month","issue_month")}},s.onsuccess=()=>{let a=s.result;a.onversionchange=()=>a.close(),e(a)},s.onerror=()=>{dt=!0,t(s.error||new Error("Unable to open IndexedDB"))},s.onblocked=()=>{dt=!0,t(new Error("IndexedDB upgrade blocked by another tab"))}}),ra)}function ur(){return"indexedDB"in window}function pr(){return dt}function ia(){return dt?"memory":"indexeddb"}function To(e){let t=e.created_at||new Date().toISOString();return{kind:e.kind||"query",title:String(e.title||""),detail:String(e.detail||""),payload:e.payload||{},turns:Array.isArray(e.turns)?e.turns:[],pinned:!!e.pinned,project_id:String(e.project_id||""),created_at:t,updated_at:e.updated_at||t}}async function No(){try{let t=(await Tt()).transaction(St,"readwrite"),s=t.objectStore(St),a=await Ht(s.count());if(a>120){let n=a-120,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let u=i.result;if(!u||n<=0){o();return}u.delete(),n-=1,u.continue()},i.onerror=()=>l(i.error)})}await qt(t)}catch{dt=!0}}async function Ps(e){let t=To(e);try{let a=(await Tt()).transaction(St,"readwrite"),n=a.objectStore(St),i=await Ht(n.add(t));return await qt(a),await No(),i}catch{dt=!0;let a=ct.nextId++;return ct.history.push({id:a,...t}),ct.history.length>120&&ct.history.shift(),a}}async function Is(e,t={}){let s=Number(e);if(!Number.isFinite(s))return null;try{let n=(await Tt()).transaction(St,"readwrite"),i=n.objectStore(St),o=await Ht(i.get(s));if(!o)return await qt(n),null;let l={...o,...t,id:s};return await Ht(i.put(l)),await qt(n),l}catch{dt=!0;let n=ct.history.findIndex(i=>Number(i.id)===s);return n===-1?null:(ct.history[n]={...ct.history[n],...t,id:s},ct.history[n])}}async function mr(e){let t=Number(e);if(!Number.isFinite(t))return!1;try{let a=(await Tt()).transaction(St,"readwrite");return a.objectStore(St).delete(t),await qt(a),!0}catch{dt=!0;let a=ct.history.findIndex(n=>Number(n.id)===t);return a===-1?!1:(ct.history.splice(a,1),!0)}}async function oa({keyword:e="",limit:t=50}={}){let s=e.trim().toLowerCase();try{let n=(await Tt()).transaction(St,"readonly"),i=n.objectStore(St),o=await Ht(i.getAll());return await qt(n),o.filter(l=>s?`${l.kind} ${l.title} ${l.detail}`.toLowerCase().includes(s):!0).sort((l,u)=>String(u.updated_at||u.created_at).localeCompare(String(l.updated_at||l.created_at))).slice(0,t)}catch{return dt=!0,ct.history.filter(n=>s?`${n.kind} ${n.title} ${n.detail}`.toLowerCase().includes(s):!0).slice().sort((n,i)=>String(i.updated_at||i.created_at).localeCompare(String(n.updated_at||n.created_at))).slice(0,t)}}async function gr(){try{let t=(await Tt()).transaction(St,"readwrite");t.objectStore(St).clear(),await qt(t)}catch{dt=!0}ct.history=[]}function Eo(e){let t=Number(e.id??e.event_id??0)||0,s=String(e.dataset||e.kind||"judgment"),a=String(e.key||`${s}:${t||`${Date.now()}:${Math.random().toString(36).slice(2)}`}`),n=String(e.jid||""),i=String(e.issue_month||""),o=String(e.change_type||""),l=String(e.detected_at||e.created_at||new Date().toISOString());return{key:a,event_id:t,dataset:s,jid:n,issue_month:i,change_type:o,title:String(e.title||n||i||"\u7248\u672C\u8B8A\u66F4"),detail:String(e.detail||[o,i,n].filter(Boolean).join(" \xB7 ")),created_at:l,payload:e}}async function Ro(){try{let t=(await Tt()).transaction(as,"readwrite"),s=t.objectStore(as),a=await Ht(s.count());if(a>2e3){let n=a-2e3,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let u=i.result;if(!u||n<=0){o();return}u.delete(),n-=1,u.continue()},i.onerror=()=>l(i.error)})}await qt(t)}catch{dt=!0}}async function fr(e){let t=(Array.isArray(e)?e:[]).filter(s=>s&&typeof s=="object").map(Eo);if(!t.length)return 0;try{let a=(await Tt()).transaction(as,"readwrite"),n=a.objectStore(as);for(let i of t)await Ht(n.put(i));return await qt(a),await Ro(),t.length}catch{dt=!0;let a=new Map(ct.audit.map(n=>[n.key,n]));for(let n of t)a.set(n.key,n);return ct.audit=Array.from(a.values()).sort((n,i)=>String(i.created_at).localeCompare(String(n.created_at))).slice(0,2e3),t.length}}async function br({keyword:e="",limit:t=200}={}){let s=e.trim().toLowerCase(),a=n=>s?`${n.dataset} ${n.jid} ${n.issue_month} ${n.change_type} ${n.detail}`.toLowerCase().includes(s):!0;try{let i=(await Tt()).transaction(as,"readonly"),o=i.objectStore(as),l=await Ht(o.getAll());return await qt(i),l.filter(a).sort((u,c)=>String(c.created_at).localeCompare(String(u.created_at))).slice(0,t)}catch{return dt=!0,ct.audit.filter(a).slice().sort((i,o)=>String(o.created_at).localeCompare(String(i.created_at))).slice(0,t)}}async function Bs(e,t){let s={key:String(e),value:t,updated_at:new Date().toISOString()};try{let n=(await Tt()).transaction(ss,"readwrite");return n.objectStore(ss).put(s),await qt(n),s}catch{return dt=!0,ct.settings.set(s.key,s),s}}async function ns(e,t=null){try{let a=(await Tt()).transaction(ss,"readonly"),n=a.objectStore(ss),i=await Ht(n.get(String(e)));return await qt(a),i?i.value:t}catch{dt=!0;let a=ct.settings.get(String(e));return a?a.value:t}}async function vr({keyword:e=""}={}){let t=e.trim().toLowerCase();try{let a=(await Tt()).transaction(ss,"readonly"),n=a.objectStore(ss),i=await Ht(n.getAll());return await qt(a),i.filter(o=>t?`${o.key} ${JSON.stringify(o.value)}`.toLowerCase().includes(t):!0).sort((o,l)=>String(o.key).localeCompare(String(l.key)))}catch{return dt=!0,Array.from(ct.settings.values()).filter(a=>t?`${a.key} ${JSON.stringify(a.value)}`.toLowerCase().includes(t):!0)}}function hr(e){if(typeof e=="string")return e;try{return JSON.stringify(e)}catch{return String(e)}}var yn={};Wt(yn,{buildFlowWaterfallStages:()=>wa,render:()=>Vl,renderRagPipelineWaterfall:()=>ya,renderTestFlowPanel:()=>ks,renderWaterfallStages:()=>_s});var Co={running:["\u57F7\u884C\u4E2D","badge-info"],stopping:["\u505C\u6B62\u4E2D","badge-warn"],success:["\u5B8C\u6210","badge-ok"],interrupted:["\u5DF2\u4E2D\u6B62","badge-warn"],failed:["\u5931\u6557","badge-danger"],pending:["\u7B49\u5F85","badge-neutral"],skipped:["\u7565\u904E","badge-neutral"]},Po=new Set(["running","stopping"]);function da(e){let[t,s]=Co[e]||[e||"\u672A\u77E5","badge-neutral"];return`<span class="badge ${s}">${r(t)}</span>`}function la(e){return String(e).padStart(2,"0")}function ys(e=new Date){let t=e instanceof Date?e:new Date(e);return`RAG Benchmark ${t.getFullYear()}-${la(t.getMonth()+1)}-${la(t.getDate())} ${la(t.getHours())}:${la(t.getMinutes())}`}function ca(e){return Po.has(e)}function Jt(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?s.toFixed(3):t}function cs(e){if(e==null)return"\u2014";let t=Number(e);return Number.isFinite(t)?`${(t*100).toFixed(1)}%`:"\u2014"}function rs(e,t,s=""){return`<div class="bench-metric">
    <span class="summary-label">${r(e)}</span>
    <strong>${r(String(t))}</strong>
    ${s?`<small>${r(s)}</small>`:""}
  </div>`}function $r(e={}){let t=e.score_components||e,s=e.gate||{},a=String(s.status||""),n=a==="pass"?"Gate \u901A\u904E":a==="fail"?"Gate \u5931\u6557":a==="no_data"?"Gate \u7121\u8CC7\u6599":"";return`${n?`<span class="badge ${a==="pass"?"badge-ok":a==="fail"?"badge-danger":"badge-neutral"}">${r(n)}</span>`:""}<div class="bench-metrics">
    ${rs("Law Recall",cs(t.law_recall))}
    ${rs("Article Recall",cs(t.article_recall))}
    ${rs("Citation Valid",cs(t.citation_valid_rate))}
    ${rs("Judge",Jt(t.judge_overall))}
    ${rs("Human",Jt(t.human_overall))}
    ${rs("p50",ge(e.duration_p50_ms))}
    ${rs("p95",ge(e.duration_p95_ms))}
    ${rs("Success",`${d(e.success||0)} / ${d(e.total||0)}`)}
  </div>`}function yr(e={}){let t=Object.entries(e.stages||{}).filter(([s])=>s.startsWith("rag.")).slice(0,8);return t.length?`<div class="bench-stage-grid">${t.map(([s,a])=>`<div class="bench-stage">
      <span>${r(s.replace(/^rag\./,""))}</span>
      <strong>${ge(a.p50_ms)}</strong>
      <small>p95 ${ge(a.p95_ms)}</small>
    </div>`).join("")}</div>`:""}function wr(e){let t=e.summary||{},s=t.score_components||{};return`<span>Law ${cs(s.law_recall)}</span>
    <span>Article ${cs(s.article_recall)}</span>
    <span>Judge ${Jt(s.judge_overall)}</span>
    <span>p95 ${ge(t.duration_p95_ms)}</span>`}function _r(e){let t=e.summary||{},s=t.score_components||{};return JSON.stringify([s.law_recall,s.article_recall,s.judge_overall,t.duration_p95_ms])}function kr(e,t){let s=e.config||{};return`<button class="bench-run ${t?"is-active":""}" type="button" data-bench-action="open-run" data-run-id="${r(e.run_id)}">
    <span class="bench-run-head">
      <strong data-bench-slot="run-label">${r(e.label||"RAG Benchmark")}</strong>
      <span data-bench-slot="run-status" data-status="${r(e.status||"")}">${da(e.status)}</span>
      <span class="mono">${r(e.run_id.slice(0,10))}</span>
    </span>
    <span class="bench-run-meta">
      <span>${r(qe(e.started_at))}</span>
      <span data-bench-slot="run-completed">${d(e.completed_cases||0)} / ${d(e.total_cases||0)} \u984C</span>
      <span>${r(s.llm_model||"\u2014")}</span>
      <span>v${e.suite_version||1}</span>
    </span>
    <span class="bench-run-scores" data-bench-slot="run-scores" data-signature="${r(_r(e))}">${wr(e)}</span>
  </button>`}function nn(e,t=[]){let s=e.metrics||{},a=e.judge||{},n=e.human_review||{},i=s.scores||{},o=e.stage_ms||{},l=Object.entries(o).filter(([c])=>c.startsWith("rag.")).map(([c,p])=>`<span class="chip">${r(c)} ${ge(p)}</span>`).join(""),u=(e.law_sources||[]).map(c=>`<span class="chip">${r(c.law_name||"\u6CD5\u898F")} ${d((c.articles||[]).length)} \u689D</span>`).join("");return`<summary>
      <span class="bench-case-question">${r(e.question)}</span>
      ${da(e.status)}
      <span class="bench-case-time">${ge(e.duration_ms)}</span>
      <span class="bench-case-score">Det ${Jt(i.deterministic)} \xB7 Judge ${Jt(i.judge)} \xB7 Human ${Jt(i.human)}</span>
    </summary>
    <div class="bench-case-body">
      <div class="bench-case-meta">
        <span class="mono">fingerprint ${r((e.fingerprint||"").slice(0,20))}</span>
        <span>item #${e.item_id} \xB7 v${e.item_version}</span>
        <button class="btn btn-ghost btn-sm" type="button" data-bench-action="fingerprint-history" data-fingerprint="${r(e.fingerprint||"")}">${f("history",13)}<span>\u540C\u984C\u6B77\u53F2</span></button>
      </div>
      <div class="bench-case-stages">${l||'<span class="qb-muted">\u6C92\u6709 stage timing</span>'}</div>
      <div class="bench-case-metrics">
        <span>Law recall ${cs(s.law_recall)}</span>
        <span>Article recall ${cs(s.article_recall)}</span>
        <span>Citation ${s.citation_valid?"valid":"invalid"}</span>
        <span>Refusal ${s.refusal_correct===null?"\u2014":s.refusal_correct?"correct":"wrong"}</span>
      </div>
      <div class="chips">${u||'<span class="qb-muted">\u6C92\u6709\u6CD5\u898F\u4F86\u6E90</span>'}</div>
      <div class="bench-answer"><strong>\u56DE\u7B54</strong><p>${r(e.answer||"\u2014")}</p></div>
      <div class="bench-judge"><strong>LLM judge</strong><p>${r(a.rationale||a.reason||"\u2014")}</p><span>${[["correctness",a.correctness],["grounding",a.grounding],["citation",a.citation],["clarity",a.clarity],["overall",a.overall]].map(([c,p])=>`${c} ${p??"\u2014"}`).join(" \xB7 ")}</span></div>
      <form class="bench-human-form" data-bench-form="human" data-result-id="${e.id}">
        <div class="bench-human-grid">
          ${[["correctness","\u6B63\u78BA\u6027",n.scores?.correctness??4],["grounding","\u6709\u64DA\u6027",n.scores?.grounding??4],["citation","\u5F15\u7528",n.scores?.citation??4],["clarity","\u6E05\u695A",n.scores?.clarity??4],["overall","\u6574\u9AD4",n.overall??4]].map(([c,p,$])=>`<label class="field"><span class="field-label">${p} <span class="field-tag">1\u20135</span></span><input class="input" type="number" min="1" max="5" name="score_${c}" value="${r(String($))}" /></label>`).join("")}
        </div>
        <label class="field"><span class="field-label">\u4EBA\u5DE5\u6279\u6CE8</span><input class="input" name="comment" value="${r(n.comment||"")}" placeholder="\u56DE\u7B54\u54C1\u8CEA\u3001\u5F15\u7528\u6216\u4E8B\u5BE6\u932F\u8AA4" /></label>
        <button class="btn btn-secondary btn-sm" type="submit">${f("check",13)}<span>\u5132\u5B58\u4EBA\u5DE5\u8A55\u5206</span></button>
      </form>
      ${t.length?`<div class="bench-history"><strong>\u540C\u984C\u6B77\u53F2 \xB7 ${t.length} \u7B46</strong>${t.map(c=>`<div class="bench-history-row"><span>${r(qe(c.run?.started_at))}</span><span>${r(c.run?.config?.llm_model||"\u2014")}</span><span>Det ${Jt(c.metrics?.scores?.deterministic)}</span><span>Judge ${Jt(c.metrics?.scores?.judge)}</span><span>Human ${Jt(c.metrics?.scores?.human)}</span><span>${ge(c.duration_ms)}</span></div>`).join("")}</div>`:""}
    </div>`}function an(e,t=[]){return JSON.stringify([e.status,e.duration_ms,e.answer,e.metrics,e.judge,e.human_review,e.stage_ms,e.law_sources,t.map(s=>[s.id,s.duration_ms,s.metrics?.scores?.human,s.finished_at])])}function Sr(e,t=[]){return`<details class="bench-case" data-result-id="${e.id}">
    ${nn(e,t)}
  </details>`}function xr(e){return`${da(e.status)}
    <span class="mono">${r(e.run_id)}</span>
    ${ca(e.status)?`<button class="btn btn-secondary btn-sm" type="button" data-bench-action="stop" data-run-id="${r(e.run_id)}">${f("x",13)}<span>\u505C\u6B62</span></button>`:""}`}function Io(e,t){let s=e.cases||[];return`<section class="report-card bench-detail" data-run-id="${r(e.run_id)}">
    <div class="side-card-head">
      <span class="side-card-title">${f("activity",14)}${r(e.label||"RAG Benchmark")}</span>
      <div class="qb-actions" data-bench-detail-actions data-signature="${r((e.status||"")+":"+e.run_id)}">
        ${xr(e)}
      </div>
    </div>
    <div data-bench-detail="metrics">${$r(e.summary||{})}</div>
    <div data-bench-detail="stages">${yr(e.summary||{})}</div>
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
    <div class="bench-cases" data-bench-cases>${s.length?s.map(a=>Sr(a,t[a.fingerprint]||[])).join(""):Ie({tone:"info",title:"\u5C1A\u7121\u984C\u76EE\u7D50\u679C",text:"Benchmark \u57F7\u884C\u5F8C\u6703\u5728\u9019\u88E1\u986F\u793A\u9010\u984C\u7D50\u679C\u3002"})}</div>
  </section>`}function qr(e){return`<button class="btn btn-primary" type="submit" ${e?"disabled":""}>${f("play",14)}<span>${e?"Benchmark \u57F7\u884C\u4E2D":"\u57F7\u884C Benchmark"}</span></button>
    ${e?`<button class="btn btn-secondary" type="button" data-bench-action="stop" data-run-id="${r(e.run_id)}">${f("x",14)}<span>\u505C\u6B62</span></button>`:""}`}function Ar(e,t=[]){let s=Math.max(0,Number(e.total_cases)||0),a=Math.max(0,Math.min(s,Number(e.completed_cases)||0)),n=Date.now(),i=Date.parse(e.started_at||""),o=Number.isFinite(i)?Math.max(0,n-i):0,l=(t||[]).filter(m=>["success","failed"].includes(m.status)).map(m=>Number(m.duration_ms)||0).filter(m=>m>0),u=null;if(l.length)u=l.reduce((m,w)=>m+w,0)/l.length;else if(a>0){let m=Date.parse(e.updated_at||""),w=Number.isFinite(m)?m:i;Number.isFinite(w)&&w>i?u=(w-i)/a:o>0&&(u=o/a)}let c=(t||[]).find(m=>m.status==="running")||null,p=0;if(a<s&&u&&u>0){let m=c?Date.parse(c.started_at||""):NaN,w=Date.parse(e.updated_at||""),S=Number.isFinite(m)?m:w;Number.isFinite(S)&&(p=Math.max(0,Math.min(.95,(n-S)/u)))}let $=Math.min(s,a+p),v=s>0?Math.max(0,Math.min(100,$/s*100)):0,g=u===null?null:Math.max(0,s-$)*u;return{total:s,completed:a,elapsedMs:o,averageMs:u,progress:v,etaMs:g,ratePerMin:u?6e4/u:null,running:c}}function Mr(e){return e===null?"\u9810\u4F30\u5269\u9918\uFF1A\u8A08\u7B97\u4E2D\u2026":e<1e3?"\u9810\u4F30\u5269\u9918\uFF1A\u5373\u5C07\u5B8C\u6210":`\u9810\u4F30\u5269\u9918 ${ge(e)}`}function Lr(e,t=[]){let s=Ar(e,t),a=e.status==="stopping";return`<div class="bench-progress" data-bench-live data-run-id="${r(e.run_id)}">
    <div class="bench-progress-head">
      <span class="bench-progress-state"><span class="spinner" aria-hidden="true"></span><span data-bench-slot="progress-state">${a?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D"}</span></span>
      <strong data-bench-slot="progress-count">${d(s.completed)} / ${d(s.total)} \u984C</strong>
      <span data-bench-slot="progress-percent">${s.progress.toFixed(1)}%</span>
      <span class="bench-progress-eta" data-bench-slot="progress-eta">${Mr(s.etaMs)}</span>
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
  </div>`}function Bo(e){let t=e.models?.models||{},s=e.suites||[],a=Ds(e),n=e.selectedRun;return`<section class="report-card bench-card">
    <div class="side-card-head">
      <span class="side-card-title">${f("brain",14)}RAG Benchmark</span>
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
      <label class="field"><span class="field-label">Run \u6A19\u7C64</span><input class="input" name="label" value="${r(e.config.label||ys())}" /></label>
      <div class="qb-actions" data-bench-actions data-signature="${r(a?`${a.run_id}:${a.status}`:"")}">
        ${qr(a)}
      </div>
    </form>
    <div data-bench-live-wrap data-signature="${r(a?`${a.run_id}:${a.status}:${a.total_cases}`:"")}">${a?Lr(a,rn(e,a)):""}</div>
    <div class="bench-runs-head"><span class="summary-label">\u6B77\u53F2 Run</span><span class="qb-muted">\u540C\u984C\u76EE\u4EE5 fingerprint \u5C0D\u9F4A\uFF0C\u53EF\u5C55\u958B\u9010\u984C\u6BD4\u8F03</span></div>
    <div class="bench-runs" data-bench-runs>${(e.runs||[]).length?e.runs.map(i=>kr(i,n?.run_id===i.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>'}</div>
    ${n?Io(n,e.history):""}
  </section>`}function Ds(e){let t=(e.runs||[]).find(s=>ca(s.status));return t?e.selectedRun&&e.selectedRun.run_id===t.run_id?e.selectedRun.status&&!ca(e.selectedRun.status)?null:{...t,...e.selectedRun,summary:e.selectedRun.summary||t.summary||{},cases:e.selectedRun.cases||[]}:t:null}function rn(e,t){return!t||!e.selectedRun||e.selectedRun.run_id!==t.run_id?[]:e.selectedRun.cases||[]}function jr(e,{onNavigate:t=null}={}){let s={models:null,suites:[],runs:[],selectedRun:null,selectedSuiteId:null,history:{},indexVersion:null,config:{label:ys(),embedding_model:"",llm_model:"",judge_model:"",top_k:4,score_threshold:.35,repeats:1,enable_law_retrieval:!0,judge_enabled:!0},labelTouched:!1,loaded:!1,referenceLoaded:!1,loading:!1,loadAgain:!1,pendingRefreshAll:!1,activeRunId:"",refreshStream:null,tickTimer:null,renderSignature:"",forcedCaseIds:new Set},a=()=>e.querySelector("#performance-panel-benchmark"),n=E=>{let x=new FormData(E);return{label:String(x.get("label")||"").trim()||ys(),embedding_model:String(x.get("embedding_model")||""),llm_model:String(x.get("llm_model")||""),judge_model:String(x.get("judge_model")||""),top_k:Number(x.get("top_k")||4),score_threshold:Number(x.get("score_threshold")||.35),repeats:Number(x.get("repeats")||1),enable_law_retrieval:E.elements.enable_law_retrieval?.checked??!0,judge_enabled:E.elements.judge_enabled?.checked??!0}},i=()=>JSON.stringify({selectedRunId:s.selectedRun?.run_id||"",references:s.referenceLoaded?[s.indexVersion?.physical_collection||"",(s.models?.models?.embedding||[]).join(","),(s.models?.models?.llm||[]).join(","),(s.suites||[]).map(E=>`${E.id}:${E.name}:${E.item_count}:${E.version}:${E.status}`)]:null,runs:(s.runs||[]).map(E=>`${E.run_id}:${E.label||""}:${E.suite_version||1}`)}),o=()=>{let x=a()?.querySelector("[data-bench-live]"),C=Ds(s);if(!x||!C)return;let se=Ar(C,rn(s,C)),me=(ae,ee)=>{let ke=x.querySelector(`[data-bench-slot="${ae}"]`);ke&&ke.textContent!==ee&&(ke.textContent=ee)};me("progress-count",`${d(se.completed)} / ${d(se.total)} \u984C`),me("progress-percent",`${se.progress.toFixed(1)}%`),me("progress-eta",Mr(se.etaMs)),me("progress-rate",se.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${se.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`),me("progress-elapsed",`\u5DF2\u57F7\u884C ${ge(se.elapsedMs)}`),me("progress-average",se.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${ge(se.averageMs)}\uFF0F\u984C`),me("progress-state",C.status==="stopping"?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D");let V=x.querySelector('[data-bench-slot="progress-bar"]');V&&(V.setAttribute("aria-valuenow",se.progress.toFixed(1)),V.classList.toggle("is-waiting",se.completed===0));let Y=x.querySelector('[data-bench-slot="progress-fill"]');Y&&(Y.style.width=`${se.progress.toFixed(2)}%`)},l=E=>{let x=E.querySelector("[data-bench-actions]");if(!x)return;let C=Ds(s),se=C?`${C.run_id}:${C.status}`:"";x.dataset.signature!==se&&(x.dataset.signature=se,x.innerHTML=qr(C))},u=E=>{let x=E.querySelector("[data-bench-live-wrap]");if(!x)return;let C=Ds(s),se=C?`${C.run_id}:${C.status}:${C.total_cases}`:"";x.dataset.signature!==se&&(x.dataset.signature=se,x.innerHTML=C?Lr(C,rn(s,C)):"")},c=E=>{let x=E.querySelector("[data-bench-runs]");if(!x)return;let C=s.runs||[],se=[...x.querySelectorAll("[data-run-id]")].map(V=>V.dataset.runId),me=C.map(V=>V.run_id);if(se.join("|")!==me.join("|")){x.innerHTML=C.length?C.map(V=>kr(V,s.selectedRun?.run_id===V.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>';return}for(let V of C){let Y=x.querySelector(`[data-run-id="${V.run_id}"]`);if(!Y)continue;Y.classList.toggle("is-active",s.selectedRun?.run_id===V.run_id);let ae=Y.querySelector('[data-bench-slot="run-label"]');ae&&ae.textContent!==(V.label||"RAG Benchmark")&&(ae.textContent=V.label||"RAG Benchmark");let ee=Y.querySelector('[data-bench-slot="run-status"]');ee&&ee.dataset.status!==(V.status||"")&&(ee.dataset.status=V.status||"",ee.innerHTML=da(V.status));let ke=Y.querySelector('[data-bench-slot="run-completed"]');if(ke){let je=`${d(V.completed_cases||0)} / ${d(V.total_cases||0)} \u984C`;ke.textContent!==je&&(ke.textContent=je)}let H=Y.querySelector('[data-bench-slot="run-scores"]'),ve=_r(V);H&&H.dataset.signature!==ve&&(H.dataset.signature=ve,H.innerHTML=wr(V))}},p=E=>{let x=s.selectedRun;if(!x)return;let C=E.querySelector(`.bench-detail[data-run-id="${x.run_id}"]`);if(!C)return;let se=C.querySelector("[data-bench-detail-actions]");if(se){let H=`${x.status||""}:${x.run_id}`;se.dataset.signature!==H&&(se.dataset.signature=H,se.innerHTML=xr(x))}let me=C.querySelector('[data-bench-detail="metrics"]');if(me){let H=JSON.stringify(x.summary||{});me.dataset.signature!==H&&(me.dataset.signature=H,me.innerHTML=$r(x.summary||{}))}let V=C.querySelector('[data-bench-detail="stages"]');if(V){let H=JSON.stringify((x.summary||{}).stages||{});V.dataset.signature!==H&&(V.dataset.signature=H,V.innerHTML=yr(x.summary||{}))}let Y=C.querySelector("[data-bench-cases]");if(!Y)return;let ae=x.cases||[];if(!ae.length)return;let ee=Y.querySelector(".notice");ee&&ee.remove();let ke=new Map([...Y.querySelectorAll("details.bench-case")].map(H=>[Number(H.dataset.resultId),H]));for(let H of ae){let ve=s.history[H.fingerprint]||[],je=an(H,ve),xe=ke.get(Number(H.id));if(!xe){Y.insertAdjacentHTML("beforeend",Sr(H,ve)),xe=Y.lastElementChild,xe&&(xe._benchSignature=je);continue}if(xe._benchSignature===je||!s.forcedCaseIds.delete(Number(H.id))&&xe.contains(document.activeElement))continue;let De=xe.open;xe.innerHTML=nn(H,ve),xe.open=De,xe._benchSignature=je}},$=()=>{Ds(s)?s.tickTimer||(s.tickTimer=window.setInterval(o,1e3)):s.tickTimer&&(window.clearInterval(s.tickTimer),s.tickTimer=null)},v=()=>{let E=a();E&&(l(E),u(E),c(E),p(E),o(),$())},g=E=>{let x=s.selectedRun;if(!x)return;let C=E.querySelector('[data-bench-detail="metrics"]');C&&(C.dataset.signature=JSON.stringify(x.summary||{}));let se=E.querySelector('[data-bench-detail="stages"]');se&&(se.dataset.signature=JSON.stringify((x.summary||{}).stages||{}));let me=E.querySelector("[data-bench-cases]");if(!me)return;let V=new Map((x.cases||[]).map(Y=>[Number(Y.id),Y]));for(let Y of me.querySelectorAll("details.bench-case")){let ae=V.get(Number(Y.dataset.resultId));ae&&(Y._benchSignature=an(ae,s.history[ae.fingerprint]||[]))}},m=(E=!1)=>{let x=a();if(!x)return;let C=i();if(!E&&s.renderSignature===C){v();return}s.renderSignature=C,s.forcedCaseIds.clear(),x.innerHTML=Bo(s),g(x),v()},w=async({refreshAll:E=!1,runs:x=null}={})=>{if(s.loading){s.loadAgain=!0,s.pendingRefreshAll=s.pendingRefreshAll||E;return}s.loading=!0;try{if(!s.referenceLoaded||E){let[ee,ke]=await Promise.all([Q.benchmarkModels(),Q.benchmarkSuites()]);s.models=ee,s.suites=ke.suites||[],s.indexVersion=ee.index_version,s.referenceLoaded=!0,!s.selectedSuiteId&&s.suites.length&&(s.selectedSuiteId=s.suites[0].id),s.config.embedding_model||(s.config.embedding_model=ee.models?.embedding?.[0]||""),s.config.llm_model||(s.config.llm_model=ee.models?.llm?.[0]||""),s.config.judge_model||(s.config.judge_model=(ee.models?.llm||[]).find(H=>H!==s.config.llm_model)||"")}let C=x?{runs:x}:await Q.benchmarkRuns(30);s.runs=C.runs||[];let se=s.activeRunId,me=s.runs.find(ee=>ca(ee.status))||null;s.activeRunId=me?.run_id||"";let V=s.selectedRun?.run_id||"";V||(V=me?.run_id||s.runs[0]?.run_id||"");let Y=!!(s.selectedRun&&se&&s.selectedRun.run_id===se);V&&(!s.selectedRun||s.selectedRun.run_id!==V||V===me?.run_id||Y)?s.selectedRun=await Q.benchmarkRun(V,!0):V||(s.selectedRun=null),s.loaded=!0,m()}catch(C){if(!s.loaded){s.renderSignature="";let se=a();se&&(se.innerHTML=Ie({tone:"danger",title:"Benchmark \u8CC7\u6599\u8B80\u53D6\u5931\u6557",text:r(C.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")}))}}finally{if(s.loading=!1,s.loadAgain){let C=s.pendingRefreshAll;s.loadAgain=!1,s.pendingRefreshAll=!1,w({refreshAll:C})}}},S=()=>{s.refreshStream||(s.refreshStream=kt("benchmark",(E,x)=>{s.loading||w({runs:x?.snapshot?.runs||null})}))},M=async E=>{try{s.selectedRun=await Q.benchmarkRun(E,!0),m()}catch(x){N(x.message||"\u8B80\u53D6 benchmark run \u5931\u6557\u3002","danger")}},j=async E=>{!s.labelTouched&&E.elements.label&&(E.elements.label.value=ys());let x=n(E);s.config=x;let C=Number(E.elements.suite_id?.value||0);if(!C){N("\u8ACB\u5148\u9078\u64C7 benchmark \u984C\u5EAB\u3002","warn");return}try{await Q.startBenchmarkRun({suite_id:C,config:x,actor:"anonymous"}),N("Benchmark \u5DF2\u555F\u52D5\u3002","ok"),s.selectedRun=null,s.config.label=ys(),s.labelTouched=!1,await w()}catch(se){N(se.message||"Benchmark \u555F\u52D5\u5931\u6557\u3002","danger",8e3)}},B=async E=>{try{await Q.stopBenchmarkRun(E),N("\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info"),await w()}catch(x){N(x.message||"\u505C\u6B62\u5931\u6557\u3002","danger")}},U=async E=>{let x=Number(E.dataset.resultId||0),C=new FormData(E),se={};for(let me of["correctness","grounding","citation","clarity","overall"]){let V=Number(C.get(`score_${me}`));Number.isFinite(V)&&(se[me]=V)}try{await Q.reviewBenchmarkResult(x,{reviewer:"anonymous",scores:se,comment:String(C.get("comment")||"")}),N("\u4EBA\u5DE5\u8A55\u5206\u5DF2\u5132\u5B58\u3002","ok"),s.selectedRun&&(s.selectedRun=await Q.benchmarkRun(s.selectedRun.run_id,!0),s.forcedCaseIds.add(x)),m()}catch(me){N(me.message||"\u4EBA\u5DE5\u8A55\u5206\u5132\u5B58\u5931\u6557\u3002","danger")}},W=async E=>{if(E)try{let x=await Q.benchmarkFingerprintHistory(E,50);s.history[E]=x.cases||[];let C=s.selectedRun,se=a();if(!C||!se)return;let me=(C.cases||[]).filter(V=>V.fingerprint===E);for(let V of me){let Y=se.querySelector(`details.bench-case[data-result-id="${V.id}"]`);if(!Y)continue;let ae=Y.open;Y.innerHTML=nn(V,s.history[E]),Y.open=ae,Y._benchSignature=an(V,s.history[E])}}catch(x){N(x.message||"\u540C\u984C\u6B77\u53F2\u8B80\u53D6\u5931\u6557\u3002","danger")}},K=async E=>{let x=E.target.closest("[data-bench-action]");if(!x)return;let C=x.dataset.benchAction;C==="open-run"?await M(x.dataset.runId||""):C==="stop"?await B(x.dataset.runId||""):C==="fingerprint-history"&&await W(x.dataset.fingerprint||"")},ye=async E=>{let x=E.target.closest("[data-bench-form]");x&&(E.preventDefault(),x.dataset.benchForm==="run"?await j(x):x.dataset.benchForm==="human"&&await U(x))},pe=E=>{E&&(E.elements.label&&E.elements.label.value!==s.config.label&&(s.labelTouched=!0),s.config=n(E),E.elements.suite_id&&(s.selectedSuiteId=Number(E.elements.suite_id.value)||s.selectedSuiteId))},z=E=>{let x=E.target.closest('[data-bench-form="run"]');x&&pe(x)};return e.addEventListener("click",K),e.addEventListener("submit",ye),e.addEventListener("input",z),e.addEventListener("change",z),{show(){if(t&&t("benchmark"),!s.labelTouched){s.config.label=ys();let E=a()?.querySelector('input[name="label"]');E&&(E.value=s.config.label)}S(),w({refreshAll:!s.referenceLoaded})},refresh(){return S(),w({refreshAll:!0})},destroy(){e.removeEventListener("click",K),e.removeEventListener("submit",ye),e.removeEventListener("input",z),e.removeEventListener("change",z),s.refreshStream&&s.refreshStream(),s.refreshStream=null,s.tickTimer&&window.clearInterval(s.tickTimer)}}}var gn={};Wt(gn,{exportCsv:()=>ba,exportableResult:()=>va,render:()=>wl,renderReport:()=>ma,reportError:()=>fa,reportLoading:()=>Os});var Br=[10,25,50,100],Tr=500,Do=["law_name","law_level","law_category","law_modified_date","article_count"],Oo=["jid","court_normalized","title","jdate","matched_laws","citation_count"],Fo={A:"\u689D\u6587",C:"\u7AE0\u7BC0"};function ga(e){return e?.label||e?.id||"\u8CC7\u6599\u5EAB"}function ua(e,t){let s={};for(let a of e.fields||[]){let n=a.type==="checkbox"?!1:a.type==="multiselect"?[]:"",i=a.default===void 0?n:a.default;s[a.key]=Array.isArray(i)?[...i]:i}return{values:s,page:1,pageSize:t,result:null,sort:null,columnFilters:{},fuzzyTerms:[]}}function zo(e,t){let s=e.visibleWhen;if(!s)return!0;for(let[a,n]of Object.entries(s))if(Array.isArray(n)&&!n.map(String).includes(String(t[a]??"")))return!1;return!0}function mn(e,t){return(e.fields||[]).filter(s=>zo(s,t))}function Ho(e,t){return`filter-${e.id}-${t}`}function ds(e){return e==null?"":r(String(e))}function on(e,t,s){let a=s[t.key],n=Ho(e,t.key),i=t.help?`<span class="field-help">${r(t.help)}</span>`:"";if(t.type==="checkbox")return`<div class="field">
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
    </label>`;if(t.type==="select"){let l=(t.options||[]).map(u=>`<option value="${ds(u.value)}" ${String(u.value)===String(a??"")?"selected":""}>${r(u.label??u.value)}</option>`).join("");return`<div class="field">${o}
      <select class="select" id="${n}" name="${r(t.key)}">${l}</select>
      ${i}
    </div>`}if(t.type==="multiselect"){let l=new Set((Array.isArray(a)?a:[]).map(String)),u=(t.options||[]).map(c=>`<label class="multi-option">
          <input type="checkbox" name="${r(t.key)}" value="${ds(c.value)}" ${l.has(String(c.value))?"checked":""} />
          <span>${r(c.label??c.value)}</span>
        </label>`).join("");return`<div class="field">${o}
      <div class="multi-select">${u}</div>
      ${i}
    </div>`}return t.type==="number"?`<div class="field">${o}
      <input class="input" type="number" id="${n}" name="${r(t.key)}"
        value="${ds(a)}"
        ${t.min!==void 0?`min="${t.min}"`:""}
        ${t.max!==void 0?`max="${t.max}"`:""}
        step="${t.step??1}"
        placeholder="${ds(t.placeholder||"")}" />
      ${i}
    </div>`:t.type==="date"?`<div class="field">${o}
      <input class="input" type="date" id="${n}" name="${r(t.key)}"
        value="${ds(a)}" />
      ${i}
    </div>`:`<div class="field">${o}
    <input class="input" type="text" id="${n}" name="${r(t.key)}"
      value="${ds(a)}"
      placeholder="${ds(t.placeholder||"")}" />
    ${i}
  </div>`}function Nr(e,t,{focusTable:s=!1}={}){let a=mn(e,t.values),n=[];for(let i=0;i<a.length;i+=1){let o=a[i],l=a[i+1];o.type==="date"&&l&&l.type==="date"?(n.push(`<div class="field-row">${on(e,o,t.values)}${on(e,l,t.values)}</div>`),i+=1):n.push(on(e,o,t.values))}return`<form id="data-filter-form" autocomplete="off">
    <div class="filter-block">
      <div class="filter-head">
        <span class="filter-title">Metadata \u689D\u4EF6</span>
        <button class="filter-reset" type="button" data-action="reset">\u91CD\u8A2D</button>
      </div>
      <div class="filter-fields">${n.join("")}</div>
    </div>
    <div class="sidebar-actions">
      <button class="btn btn-primary" type="submit" id="run-query" ${s?'data-focus-table="true"':""}>
        ${f("search",15)}<span>\u57F7\u884C\u67E5\u8A62</span>
      </button>
    </div>
  </form>`}function pa(e,t,s){let a={...s.values};for(let n of mn(t,a))if(n.type==="checkbox"){let i=e.querySelector(`[name="${n.key}"]`);a[n.key]=!!i?.checked}else if(n.type==="multiselect")a[n.key]=Array.from(e.querySelectorAll(`[name="${n.key}"]:checked`)).map(i=>i.value);else{let i=e.querySelector(`[name="${n.key}"]`);a[n.key]=i?i.value:""}return a}function Dr(e,t){let s={};for(let a of mn(e,t.values)){let n=t.values[a.key];a.type==="checkbox"?s[a.key]=!!n:a.type==="multiselect"?s[a.key]=Array.isArray(n)?n:[]:a.type==="number"?s[a.key]=n===""||n===null?"":Number(n):s[a.key]=n??""}return s}function ln(e,t){let s=Dr(e,t);return Array.isArray(t.fuzzyTerms)&&t.fuzzyTerms.length&&(s.keywords=[...t.fuzzyTerms]),(e.id==="postgres"||e.id==="parquet")&&t.sort?.key&&(s.sort=`${t.sort.key}:${t.sort.direction}`,s.schema_preview=!0),t.columnFilters&&Object.keys(t.columnFilters).length>0&&(s.column_filters=t.columnFilters),s}function Uo(e){if(e.status==="operational")return"";let t=e.status==="unavailable"?"danger":e.status==="degraded"?"warn":"info";return`<div class="sidebar-notice">${Ie({tone:t,title:`${ga(e)} ${Ot(e.status).label}`,text:r(e.detail||"\u76EE\u524D\u7121\u6CD5\u4F7F\u7528\u9019\u500B\u8CC7\u6599\u4F86\u6E90\u3002")})}</div>`}function Qo(e,t){return`<label class="field data-source-field">
    <span class="field-label">\u8CC7\u6599\u4F86\u6E90</span>
    <select class="select" name="database">
      ${e.map(s=>{let a=Ot(s.status);return`<option value="${r(s.id)}" ${s.id===t?"selected":""}>${r(s.label)} \xB7 ${r(a.label)}</option>`}).join("")}
    </select>
  </label>`}function Er(e,t){return`<nav class="data-nav" aria-label="\u8CC7\u6599\u67E5\u8A62\u529F\u80FD">
    ${[{id:"law",label:"\u67E5\u8A62\u6CD5\u898F\u547D\u4EE4",hint:"Fuzzy \u6CD5\u898F\u540D\u7A31\u3001\u985E\u5225\u8207\u547D\u4EE4",icon:"file"},{id:"judgment",label:"\u67E5\u8A62\u5224\u6C7A",hint:"Fuzzy \u6CD5\u9662\u3001\u6848\u865F\u8207\u6848\u7531",icon:"layers"},{id:"schema",label:"\u8CC7\u6599\u5EAB Schema",hint:"\u8CC7\u6599\u8868\u3001\u6B04\u4F4D\u8207\u9810\u89BD",icon:"table"}].map(a=>{let n=a.id==="schema"?t==="schema":t==="query"&&e===a.id;return`<button class="data-nav-item${n?" is-active":""}" type="button"
          data-action="data-nav" data-tab="${a.id}" ${n?'aria-current="page"':""}>
          <span class="data-nav-icon">${f(a.icon,15)}</span>
          <span class="data-nav-copy">
            <strong>${r(a.label)}</strong>
            <small>${r(a.hint)}</small>
          </span>
        </button>`}).join("")}
  </nav>`}function Go(e,t,s){if(t.id!=="postgres"&&t.id!=="parquet")return"";let a=Array.isArray(s.fuzzyTerms)?s.fuzzyTerms:[],n=e==="law"?"Fuzzy \u6CD5\u898F\uFF0F\u547D\u4EE4":"Fuzzy \u5224\u6C7A",i=e==="law"?"\u8F38\u5165\u6CD5\u898F\u540D\u7A31\u6216\u76F8\u8FD1\u5B57\u2026":"\u8F38\u5165\u6CD5\u9662\u3001\u6848\u865F\u3001\u6848\u7531\u6216\u76F8\u8FD1\u5B57\u2026";return`<div class="data-fuzzy" data-data-fuzzy data-fuzzy-kind="${e}">
    <div class="data-fuzzy-head">
      <span class="filter-title">${n}</span>
      <span class="field-tag">\u591A\u689D\u4EF6 AND</span>
    </div>
    <div class="data-fuzzy-row">
      <div class="data-fuzzy-values">
        ${a.length?a.map(o=>`<span class="chip data-fuzzy-chip">${r(o)}<button class="data-fuzzy-remove" type="button" data-action="remove-fuzzy-term" data-term="${r(o)}" aria-label="\u79FB\u9664 ${r(o)}">${f("x",9)}</button></span>`).join(""):`<span class="data-fuzzy-placeholder">${i}</span>`}
      </div>
      <button class="data-fuzzy-add" type="button" data-action="open-fuzzy" aria-label="\u52A0\u5165 fuzzy \u689D\u4EF6" aria-haspopup="listbox">${f("plus",13)}</button>
    </div>
    <div class="data-fuzzy-popover" data-data-fuzzy-popover hidden>
      <input class="input" type="search" data-data-fuzzy-search placeholder="${i}" autocomplete="off" />
      <div class="data-fuzzy-results" data-data-fuzzy-results role="listbox" aria-live="polite"></div>
    </div>
  </div>`}function cn(e,t,s=""){let a=Array.isArray(e.tables)?e.tables:[],n=a.length?a.map(i=>`<button class="schema-item ${String(i.id)===String(s||"")?"is-selected":""}" type="button"
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
  </div>`}function Jo(e){return{postgres:"PostgreSQL \u67E5\u8A62\u4F7F\u7528\u53C3\u6578\u5316\u689D\u4EF6\u8207\u5206\u9801\uFF0C\u50C5\u8B80\u53D6\u8CC7\u6599\u3002",parquet:"Parquet \u67E5\u8A62\u76F4\u63A5\u6383\u63CF\u76EE\u524D\u6700\u65B0\u7684\u5FEB\u7167\uFF1B\u52FE\u9078\u539F\u59CB JSON \u6703\u589E\u52A0\u56DE\u50B3\u91CF\u8207\u6E32\u67D3\u6642\u9593\u3002",qdrant:"Qdrant \u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\uFF1B\u9700\u8981\u5148\u5B8C\u6210\u5411\u91CF\u7D22\u5F15\u3002\u6AA2\u7D22\u7D50\u679C\u53EA\u5305\u542B\u7D22\u5F15\u4E2D\u5BE6\u969B\u5B58\u5728\u7684\u5224\u6C7A\uFF0C\u4E0D\u6703\u7522\u751F\u865B\u69CB\u8CC7\u6599\u3002",indexeddb:"IndexedDB \u53EA\u5728\u9019\u500B\u700F\u89BD\u5668\u5167\u67E5\u8A62\uFF0C\u4E0D\u6703\u7D93\u904E\u4F3A\u670D\u5668\uFF1B\u6E05\u9664\u7DB2\u7AD9\u8CC7\u6599\u5F8C\u7D00\u9304\u6703\u6D88\u5931\u3002"}[e.id]||r(e.detail||"")}function Vo(e){return`<div class="report-empty">
    ${pt({iconName:"table",title:"\u67E5\u8A62\u5831\u8868\u6703\u986F\u793A\u5728\u9019\u88E1",text:r({postgres:"\u4F7F\u7528\u5DE6\u5074 fuzzy \u67E5\u8A62\u52A0\u5165\u6CD5\u898F\u6216\u5224\u6C7A\u689D\u4EF6\uFF0C\u518D\u8996\u9700\u8981\u5C55\u958B\u9032\u968E metadata \u689D\u4EF6\u3002",parquet:"\u4F7F\u7528\u5DE6\u5074 fuzzy \u67E5\u8A62\u52A0\u5165\u689D\u4EF6\uFF0C\u76F4\u63A5\u6383\u63CF\u539F\u59CB Parquet\uFF1B\u53EF\u5C55\u958B\u9032\u968E\u689D\u4EF6\u8ABF\u6574\u6B04\u4F4D\u3002",qdrant:"\u8F38\u5165\u8A9E\u610F\u67E5\u8A62\u5F8C\uFF0C\u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5DF2\u5EFA\u7ACB\u5411\u91CF\u7D22\u5F15\u7684\u5224\u6C7A\uFF1B\u672A\u7D22\u5F15\u6642\u6703\u660E\u78BA\u986F\u793A\u72C0\u614B\u3002",indexeddb:"\u67E5\u8A62\u5B58\u5728\u9019\u500B\u700F\u89BD\u5668\u7684\u63D0\u554F\u7D00\u9304\u8207\u8A2D\u5B9A\uFF0C\u4E0D\u9700\u8981\u4F3A\u670D\u5668\u3002"}[e.id]||"\u8A2D\u5B9A\u689D\u4EF6\u5F8C\u57F7\u884C\u67E5\u8A62\u3002")})}
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
  </div>`}function Os(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${r(ga(e))} \u67E5\u8A62\u4E2D</div>
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
  </div>`}function fa(e,t){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${r(ga(t))} \u67E5\u8A62\u5931\u6557</div>
        <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${Ie({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u67E5\u8A62\u7D50\u679C",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="retry">
          ${f("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function Wo(e){if(!e.length)return'<div class="report-empty-inline">\u9019\u6B21\u67E5\u8A62\u6C92\u6709\u53EF\u5448\u73FE\u7684\u5206\u5E03\u8CC7\u6599\u3002</div>';let t=Math.max(...e.map(s=>Number(s.value)||0),1);return`<div class="distribution">
    ${e.map(s=>{let a=Number(s.value)||0,n=Math.max(1.5,a/t*100);return`<div class="dist-row">
          <span class="dist-label" title="${r(s.label||"\u672A\u5206\u985E")}">${r(s.label||"\u672A\u5206\u985E")}</span>
          <span class="dist-track"><span class="dist-bar" style="width:${n.toFixed(1)}%"></span></span>
          <span class="dist-value">${d(a)}</span>
        </div>`}).join("")}
  </div>`}function Or(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="law_documents"}function Ko(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="judgment_documents"}function Yo(e){return e&&e.database==="qdrant"&&String(e.table||"").startsWith("judgment")}function Xo(e){let t=e._jid||e.jid;return t?`<button class="law-link judgment-link" type="button" data-action="open-judgment"
    data-jid="${r(String(t))}"
    title="\u6AA2\u8996\u300C${r(String(t))}\u300D\u7684\u5224\u6C7A\u539F\u6587">${r(String(t))}${f("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}var Zo={jid:"jid",court:"court",court_normalized:"court",title:"title",jdate:"jdate",matched_laws:"matched_laws",citation_count:"citation_count",full_text_length:"full_text_length"};function el(e,t,s,a=!1,n=!0,i=!1){let o=a?e.key:e.label||e.key,l=n?t?Zo[e.key]||e.key:i?e.key:null:null;if(!l)return`<th scope="col">${r(o)}</th>`;let u=s?.key===l,c=u?s.direction:null,p=c==="asc"?"ascending":c==="desc"?"descending":"none",$=c==="asc"?"\u2191":c==="desc"?"\u2193":"\u2195";return`<th scope="col" aria-sort="${p}">
    <button class="table-sort${u?" is-active":""}" type="button"
      data-action="sort-column" data-sort-key="${r(l)}"
      title="\u4F9D${r(o)}\u6392\u5E8F">
      <span>${r(o)}</span>
      <span class="table-sort-icon" aria-hidden="true">${$}</span>
    </button>
  </th>`}function tl(e,t){if(!Or(e)||!t)return null;let s=t._law_key||t.law_name;if(!s)return null;let a=e.meta?.dataset,n=t._law_source_type||(a&&a!=="all"?a:"");return{lawKey:String(s),sourceType:String(n||""),lawName:String(t.law_name||"")}}function sl(e,t,s){let a=e[t.key];return a==null||a===""?"\u2014":`<button class="law-link" type="button" data-action="open-law"
    data-law-key="${r(s.lawKey)}"
    data-law-source="${r(s.sourceType)}"
    data-law-name="${r(s.lawName)}"
    title="\u6AA2\u8996\u300C${r(String(a))}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${r(String(a))}${f("chevronRight",12,"law-link-icon")}</button>`}function Fr(e,{useColumnKeys:t=!1,sortable:s=!0,sortableAll:a=!1,searchValues:n=null,compact:i=!1}={}){let o=Array.isArray(e.columns)?e.columns:[],l=Array.isArray(e.rows)?e.rows:[],u=(e.page-1)*e.page_size,c=Or(e),p=Ko(e),$=Yo(e),v=e.meta?.sort||null,g=n?`<tr class="schema-search-row">
        <th scope="col" class="cell-index-head"></th>
        ${o.map(m=>`<th scope="col">
              <div class="schema-search-wrap">
                <input class="schema-search-input" type="search"
                  data-schema-search="${r(m.key)}"
                  value="${r(String(n[m.key]??""))}"
                  placeholder="\u641C\u5C0B ${r(m.key)}"
                  autocomplete="off" />
              </div>
            </th>`).join("")}
      </tr>`:"";return o.length?l.length?`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">${d(l.length)} rows \xB7 \u7B2C ${e.page} \u9801${c?" \xB7 \u9EDE\u9078\u6CD5\u898F\u540D\u7A31\u53EF\u6AA2\u8996\u5B8C\u6574\u689D\u6587":p?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u6B04\u4F4D\u6A19\u984C\u53EF\u6392\u5E8F":$?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u4F9D\u76F8\u4F3C\u5EA6\u6392\u5E8F":""}</span>
    </div>
    <div class="table-wrap">
      <table class="data-table${i?" is-compact":""}">
        <thead>${g}<tr>
          <th scope="col" class="cell-index-head">#</th>
          ${o.map(m=>el(m,p,v,t,s,a)).join("")}
        </tr></thead>
        <tbody>
          ${l.map((m,w)=>`<tr>
                <td class="cell-mono cell-empty cell-index">${u+w+1}</td>
                ${o.map(S=>{if((p||$)&&S.key==="jid")return`<td class="cell-jid">${Xo(m)}</td>`;let M=c&&S.key==="law_name"?tl(e,m):null;if(M)return`<td>${sl(m,S,M)}</td>`;let B={date:"cell-date",datetime:"cell-datetime",duration:"cell-duration",number:"cell-number"}[S.type];return`<td${B?` class="${B}"`:""}>${Zs(m[S.key],S.type||"text")}</td>`}).join("")}
              </tr>`).join("")}
        </tbody>
      </table>
    </div>`:`<div class="report-table-head">
        <span class="report-section-title">\u8CC7\u6599\u5217</span>
        <span class="muted" style="font-size:10px">0 rows</span>
      </div>
      ${pt({iconName:"filter",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u8CC7\u6599",text:"\u653E\u5BEC\u65E5\u671F\u5340\u9593\u3001\u964D\u4F4E\u689D\u6587\u6578\u4E0B\u9650\uFF0C\u6216\u6E05\u9664\u95DC\u9375\u5B57\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}`:`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">\u6B64\u8CC7\u6599\u4F86\u6E90\u6C92\u6709\u8868\u683C\u6B04\u4F4D</span>
    </div>`}function al(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,n=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${n} \u9801 \xB7
      \u986F\u793A ${d(i)}\u2013${d(o)} / ${d(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Br.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${f("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=n?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${f("chevronRight",13)}</button>
    </div>
  </div>`}function zr(e){return!Array.isArray(e)||!e.length?"":`<div class="warnings">${e.map(t=>`<div class="warning-line">${r(t)}</div>`).join("")}</div>`}function ma(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.columns)?e.columns:[],a=Array.isArray(e.summary)?e.summary:[],n=Array.isArray(e.distribution)?e.distribution:[],i=Number(e.total)||0,o=e.query_text||"",l=e.database||"",u=e.status||"ok",c=e.meta?.table_label||e.table||e.label||"query result";return`<div class="report-card" data-database="${r(l)}">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT \xB7 ${r(String(l).toUpperCase())}</div>
        <div class="report-title">
          ${r(e.label||l)}
          ${Ve(u)}
          <span class="chip">${r(c)}</span>
        </div>
        <div class="report-sub">
          ${d(i)} \u7B46\u7B26\u5408 \xB7
          ${ge(e.duration_ms)} \xB7
          ${r(String(l).toUpperCase())} / ${r(String(e.table||"\u2014"))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${f("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${f("file",14)}<span>JSON</span></button>
      </div>
    </div>

    ${e.message?`<div class="report-alert">${Ie({tone:u==="not_configured"?"info":u==="danger"?"danger":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r(e.message)})}</div>`:""}

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
        ${Wo(n)}
      </div>
      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5BE6\u969B\u67E5\u8A62\u8A9E\u53E5</span>
          <span class="muted" style="font-size:9.5px">${r(e.database==="indexeddb"?"client-side":"read-only")}</span>
        </div>
        <div class="query-box">
          <pre class="query-code">${r(o||"\u2014")}</pre>
          <button class="btn btn-secondary btn-sm btn-copy" type="button" data-action="copy-query">
            ${f("copy",12)}<span>\u8907\u88FD</span>
          </button>
        </div>
        ${zr(e.warnings)}
      </div>
    </div>

    ${s.length||t.length?Fr(e,{compact:!0,sortableAll:!0,searchValues:e.meta?.searchable?e.meta.column_filters||{}:null}):""}
    ${i||s.length?al({...e,total:i,page:Number(e.page)||1,page_size:Number(e.page_size)||25}):""}
  </div>`}function Rr(e){return`<div class="report-card schema-preview">
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
  </div>`}function dn(e,t,{columnFilters:s={},searchEnabled:a=!1}={}){let n=Array.isArray(e.columns)?e.columns:[],i=Array.isArray(e.rows)?e.rows:[],o=e.message?`<div class="report-alert">${Ie({tone:e.status==="ok"?"info":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r(e.message)})}</div>`:"";return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW \xB7 ${r(String(e.database||"").toUpperCase())}</div>
        <div class="report-title">
          ${r(t||e.table||"\u8CC7\u6599\u8868")}
          ${Ve(e.status||"ok")}
        </div>
        <div class="report-sub">
          ${r(String(e.database||""))} / ${r(String(e.table||"\u2014"))} \xB7 ${n.length} \u6B04\u4F4D \xB7 \u524D ${i.length} \u7B46
        </div>
      </div>
    </div>
    ${o}
    ${Fr({...e,page:1,page_size:10},{useColumnKeys:!0,sortable:!0,sortableAll:!0,searchValues:a?s:null})}
    ${zr(e.warnings)}
    <div class="schema-preview-footer">
      <span>\u9810\u89BD\u524D ${d(i.length)} \u7B46</span>
      <strong>\u5171 ${d(e.total)} \u7B46</strong>
    </div>
  </div>`}function Cr(e,t){return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW</div>
        <div class="report-title">${r(t||"\u8CC7\u6599\u8868")}</div>
        <div class="report-sub">\u7121\u6CD5\u8B80\u53D6\u8CC7\u6599\u8868\u9810\u89BD\u3002</div>
      </div>
    </div>
    ${Ie({tone:"danger",title:"\u8B80\u53D6\u5931\u6557",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
  </div>`}function nl(e){return`<div class="report-empty">
    ${pt({iconName:"table",title:"\u9078\u64C7\u8CC7\u6599\u8868\u9810\u89BD",text:`\u5F9E\u5DE6\u5074 ${ga(e)} \u7684 Schema \u6E05\u55AE\u9EDE\u9078\u8CC7\u6599\u8868\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6B04\u4F4D\u540D\u7A31\u3001\u524D 10 \u7B46\u8CC7\u6599\u8207\u7E3D\u7B46\u6578\u3002`})}
  </div>`}function un(e){return e.is_current===!0?Ve("ok","\u73FE\u884C"):e.law_abandon_note?Ve("empty","\u5DF2\u5EE2\u6B62"):e.is_current===!1?Ve("empty","\u6B77\u53F2\u7248\u672C"):Ve("not_configured","\u72C0\u614B\u672A\u63D0\u4F9B")}function tt(e,t){return`<div class="law-meta-item">
    <div class="law-meta-label">${r(e)}</div>
    <div class="law-meta-value">${t||"\u2014"}</div>
  </div>`}function us(e){return e?Dt(e):"\u2014"}function rl(e){return e?.meta?.metadata_source==="postgresql"?"PostgreSQL metadata":e?.meta?.metadata_source==="parquet"?"Parquet snapshot":"\u2014"}function pn(e,t){return t?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">${r(e)}</span>
    </div>
    <div class="law-text-block">${r(String(t).trim())}</div>
  </div>`:""}function il(e,t,{open:s=!1}={}){return t?`<details class="report-section law-disclosure" data-law-history ${s?"open":""}>
    <summary class="law-disclosure-summary">
      <span class="report-section-title">${r(e)}</span>
      <span class="law-disclosure-hint">\u9810\u8A2D\u6536\u5408 \xB7 \u9EDE\u64CA\u5C55\u958B</span>
      ${f("chevronDown",14,"law-disclosure-chevron")}
    </summary>
    <div class="law-text-block">${r(String(t).trim())}</div>
  </details>`:""}function ol(e){let t=Array.isArray(e)?e:[],s=t.map(a=>{let n=a?.name||a?.url||"";return n?a.url?`<a class="law-attachment" href="${r(a.url)}" target="_blank" rel="noopener noreferrer">
          ${f("file",12)}<span>${r(n)}</span>${f("external",11)}
        </a>`:`<span class="law-attachment">${f("file",12)}<span>${r(n)}</span></span>`:""}).filter(Boolean).join("");return s?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">\u9644\u4EF6</span>
      <span class="muted">${d(t.length)}</span>
    </div>
    <div class="law-attachment-list">${s}</div>
  </div>`:""}function Hr(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function ll(e){let t=Array.isArray(e.articles)?e.articles:[],s=t.filter(o=>o.article_type==="C").length,a=t.length-s,n=s?`${d(a)} \u689D \xB7 ${d(s)} \u7AE0\u7BC0`:`${d(a)} \u689D`,i=t.map(o=>{let l=String(o.article_content||"").trim();if(!l)return"";if(o.article_type==="C")return`<div class="law-chapter">${r(l)}</div>`;let u=Fo[o.article_type]||o.article_type;return`<article class="law-article"
        data-article-no="${r(Hr(o.article_no))}">
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
  </div>`}function cl(){return`<div class="law-jump-float">
    <input class="input law-article-jump-input law-jump-input"
      id="law-article-jump-float" type="text" inputmode="numeric"
      autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
    <button class="btn btn-secondary btn-sm" type="button"
      data-action="jump-article" data-jump-input="law-article-jump-float">\u8DF3\u81F3</button>
  </div>`}function ws(){return`<button class="btn btn-secondary btn-sm" type="button" data-action="back-to-results">
    ${f("chevronLeft",14)}<span>\u8FD4\u56DE\u67E5\u8A62\u7D50\u679C</span>
  </button>`}function dl(e){return`<div class="law-report">
    <div class="law-report-topbar">
      ${ws()}
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
  </div>`}function ul(e,t){return`<div class="law-report">
    <div class="law-report-topbar">
      ${ws()}
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
        ${Ie({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function pl(e){let t=Array.isArray(e.versions)?e.versions:[];if(t.length<1)return"";let s=e.selected_version_id??"";return`<label class="law-version-select">
    <span>\u689D\u6587\u7248\u672C</span>
    <select class="select" data-action="select-law-version" aria-label="\u9078\u64C7\u6CD5\u898F\u689D\u6587\u7248\u672C">
      ${t.map(a=>{let n=String(a.update_date||"").match(/\d{4}\/\d{1,2}\/\d{1,2}/)?.[0]||"",i=[`#${a.version_id}`,a.is_current?"\u76EE\u524D":"\u6B77\u53F2",n,a.article_count_for_law?`${d(a.article_count_for_law)} \u7B46`:"\u7121\u689D\u6587\u5FEB\u7167"].filter(Boolean).join(" \xB7 ");return`<option value="${r(a.version_id)}" ${String(a.version_id)===String(s)?"selected":""}>${r(i)}</option>`}).join("")}
    </select>
  </label>`}function ml(e){let t=e.change_summary||{},s=Object.values(t).reduce((o,l)=>o+(Number(l)||0),0),a=Array.isArray(e.changes)?e.changes:[];if(!e.changes_available&&!s)return"";let n={added:"\u65B0\u589E",modified:"\u4FEE\u6539",removed:"\u79FB\u9664"},i=["added","modified","removed"].map(o=>`${n[o]} ${d(t[o]||0)}`).join(" \xB7 ");return`<details class="report-section law-version-changes">
    <summary>
      <span class="report-section-title">\u7248\u672C\u8B8A\u66F4</span>
      <span class="muted">${r(i)}</span>
    </summary>
    <div class="law-version-change-list">
      ${a.length?a.slice(0,20).map(o=>{let l=o.change_type==="added"?"badge-ok":o.change_type==="removed"?"badge-danger":"badge-warn",u=o.before_content?`<details><summary>\u8B8A\u66F4\u524D</summary><pre>${r(o.before_content)}</pre></details>`:"",c=o.after_content?`<details><summary>\u8B8A\u66F4\u5F8C</summary><pre>${r(o.after_content)}</pre></details>`:"";return`<div class="law-version-change">
                  <div class="law-version-change-head">
                    <span class="badge ${l}">${r(n[o.change_type]||o.change_type)}</span>
                    <strong>${r(o.article_no||o.article_key)}</strong>
                  </div>
                  ${u}${c}
                </div>`}).join(""):'<div class="report-empty-inline">\u6B64\u7248\u672C\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u8B8A\u66F4\u3002</div>'}
      ${e.changes_truncated?'<div class="report-empty-inline">\u50C5\u986F\u793A\u524D 20 \u7B46\u8B8A\u66F4\uFF1BAPI \u56DE\u50B3\u4E0A\u9650 200 \u7B46\u3002</div>':""}
    </div>
  </details>`}function gl(e,{database:t="",lawPage:s=1,historyOpen:a=!1}={}){let n=Array.isArray(e.warnings)?e.warnings:[],i=e.law_name||e.law_key||"\u6CD5\u898F",o=(Array.isArray(e.articles)?e.articles:[]).filter(w=>w.article_type!=="C").length,l=rl(e),u=e.meta?.articles_source==="postgresql"?"PostgreSQL \u689D\u6587\u7248\u672C":e.meta?.articles_source==="parquet"?"Parquet \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",c=e.meta?.snapshot||"",p=e.meta?.articles_source==="postgresql"&&e.selected_version_id!==null&&e.selected_version_id!==void 0?`\u689D\u6587\u7248\u672C #${e.selected_version_id}`:"",$=[l,u,p,c].filter(Boolean).join(" \xB7 "),v=e.source_type==="law"?"\u6CD5\u5F8B":e.source_type==="order"?"\u547D\u4EE4":e.source_type||"\u2014",g=e.version||{},m=[tt("\u6CD5\u898F\u4F4D\u968E",r(e.law_level||"\u2014")),tt("\u6CD5\u898F\u985E\u5225",r(e.law_category||"\u2014")),tt("\u7570\u52D5\u65E5\u671F",us(e.law_modified_date)),tt("\u751F\u6548\u65E5\u671F",us(e.law_effective_date)),tt("\u689D\u6587\u6578",d(e.article_count)),tt("\u8CC7\u6599\u72C0\u614B",un(e)),tt("\u82F1\u8B6F\u540D\u7A31",r(e.eng_law_name||"\u2014")),tt("\u6CD5\u898F\u8B58\u5225",`<span class="mono">${r(e.law_key||"\u2014")}</span>`)];return g.first_seen_version_id!==null&&g.first_seen_version_id!==void 0&&m.push(tt("\u9996\u6B21\u6536\u9304\u7248\u672C",`#${r(g.first_seen_version_id)}`)),g.last_seen_version_id!==null&&g.last_seen_version_id!==void 0&&m.push(tt("\u6700\u5F8C\u6536\u9304\u7248\u672C",`#${r(g.last_seen_version_id)}`)),g.last_seen_at&&m.push(tt("\u6700\u5F8C\u6536\u9304\u6642\u9593",r(qe(g.last_seen_at)))),g.selected_version_id!==null&&g.selected_version_id!==void 0&&m.push(tt("\u689D\u6587\u7248\u672C",`#${r(g.selected_version_id)} \xB7 ${e.meta?.selected_version_is_current?"\u76EE\u524D":"\u6B77\u53F2"}`)),`<div class="law-report">
    <div class="law-report-topbar">
      ${ws()}
      <span class="law-report-origin" title="${r($)}">${r($)}</span>
    </div>
    <div class="report-card law-report-card" data-database="${r(t)}">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT \xB7 ${r(String(t||l).toUpperCase())}</div>
          <div class="report-title">
            ${r(i)}
            ${un(e)}
            <span class="chip">${r(v)}</span>
          </div>
          <div class="report-sub">
            ${r([e.law_level,e.law_category].filter(Boolean).join(" \xB7 ")||"\u2014")} \xB7 ${d(e.article_count)} \u689D \xB7 \u7570\u52D5 ${us(e.law_modified_date)}
          </div>
        </div>
        <div class="report-actions">
          ${pl(e)}
          ${e.law_url?`<a class="btn btn-secondary btn-sm" href="${r(e.law_url)}" target="_blank" rel="noopener noreferrer">${f("external",14)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:""}
        </div>
      </div>

      ${n.length?`<div class="report-alert">${Ie({tone:e.status==="degraded"?"warn":"info",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n.map(w=>r(w)).join("<br />")})}</div>`:""}

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u689D\u6587\u6578</div>
          <div class="summary-value">${d(e.article_count)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u7570\u52D5\u65E5\u671F</div>
          <div class="summary-value">${us(e.law_modified_date)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u6CD5\u898F\u4F4D\u968E</div>
          <div class="summary-value">${r(e.law_level||"\u2014")}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u76EE\u524D\u72C0\u614B</div>
          <div class="summary-value">${un(e)}</div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u6CD5\u898F\u8CC7\u8A0A</span>
          <span class="muted" style="font-size:9.5px">${r(l)}</span>
        </div>
        <div class="law-meta-grid">${m.join("")}</div>
      </div>

      ${ml(e)}
      ${pn("\u6CD5\u898F\u524D\u8A00",e.law_foreword)}
      ${il("\u6CD5\u898F\u6CBF\u9769",e.law_histories,{open:a})}
      ${pn("\u751F\u6548\u8AAA\u660E",e.law_effective_note)}
      ${pn("\u5EE2\u6B62\u8AAA\u660E",e.law_abandon_note)}
      ${ol(e.attachments)}
      ${ll(e)}
    </div>
    ${o>100?cl():""}
  </div>`}function fl(e){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${ws()}
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
  </div>`}function bl(e,t){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${ws()}
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
        ${Ie({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function vl(e){let t=String(e||"").trim();return t?`<button class="law-link judgment-citation-law" type="button"
    data-action="open-law"
    data-law-key="${r(t)}"
    data-law-source=""
    data-law-name="${r(t)}"
    title="\u6AA2\u8996\u300C${r(t)}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${r(t)}${f("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}function hl(e){let t=new Map;for(let s of Array.isArray(e.citations)?e.citations:[]){let a=String(s.law_name||"").trim();if(!a)continue;t.has(a)||t.set(a,new Set);let n=String(s.article_no||"").trim();n&&t.get(a).add(n)}return t.size?`<div class="judgment-citation-groups">
    ${[...t.entries()].map(([s,a])=>`<div class="judgment-citation-group">
          ${vl(s)}
          <span class="judgment-citation-articles">${[...a].map(n=>r(n)).join("\u3001")||"\u2014"}</span>
        </div>`).join("")}
  </div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5F15\u7528\u660E\u7D30\u3002</div>'}function $l(e,{database:t="postgres"}={}){let s=Array.isArray(e.matched_laws)?e.matched_laws:[],a=e.title||e.jid||"\u5224\u6C7A",n=String(e.full_text||""),i=Number(e.full_text_length)||n.length||0,o=["PostgreSQL \u5224\u6C7A\u6587\u4EF6",e.source_archive].filter(Boolean).join(" \xB7 "),l=[tt("\u6848\u865F",r(e.jid||"\u2014")),tt("\u5E74\u5EA6",r(e.jyear||"\u2014")),tt("\u5B57\u5225",r(e.jcase||"\u2014")),tt("\u865F\u78BC",r(e.jno||"\u2014")),tt("\u6CD5\u9662",r(e.court||"\u2014")),tt("\u6848\u7531",r(e.title||"\u2014")),tt("\u88C1\u5224\u65E5\u671F",us(e.jdate)),tt("\u4F86\u6E90\u58D3\u7E2E\u6A94",r(e.source_archive||"\u2014")),tt("\u5168\u6587\u9577\u5EA6",`${d(i)} \u5B57`),tt("\u5F15\u7528\u6578",d(e.citation_count))];return e.import_run_id!==null&&e.import_run_id!==void 0&&l.push(tt("\u532F\u5165 Run",`#${r(e.import_run_id)}`)),`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${ws()}
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
            ${r(e.court||"\u2014")} \xB7 ${us(e.jdate)} \xB7
            ${d(i)} \u5B57
          </div>
        </div>
        <div class="report-actions">
          ${e.pdf_url?`<a class="btn btn-secondary btn-sm" href="${r(e.pdf_url)}" target="_blank" rel="noopener noreferrer">${f("external",14)}<span>PDF</span></a>`:""}
        </div>
      </div>

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u88C1\u5224\u65E5\u671F</div>
          <div class="summary-value">${us(e.jdate)}</div>
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
        ${hl(e)}
      </div>

      <div class="report-section judgment-text-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5224\u6C7A\u539F\u6587</span>
          <span class="muted">${d(i)} \u5B57</span>
        </div>
        ${n?`<div class="judgment-fulltext">${r(n)}</div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5168\u6587\u3002</div>'}
      </div>
    </div>
  </div>`}function Pr(e){return`"${(e==null?"":typeof e=="object"?JSON.stringify(e):String(e)).replace(/"/g,'""')}"`}function ba(e){let t=e.columns||[],s=e.rows||[],a=[["#",...t.map(i=>i.label||i.key)].map(Pr).join(",")],n=((Number(e.page)||1)-1)*(Number(e.page_size)||25);return s.forEach((i,o)=>{a.push([n+o+1,...t.map(l=>i[l.key])].map(Pr).join(","))}),`\uFEFF${a.join(`\r
`)}`}function va(e){return{...e,rows:(e.rows||[]).map(t=>{let s={};for(let[a,n]of Object.entries(t))a.startsWith("_")||(s[a]=n);return s})}}function yl(e){return e==="rag"?"RAG \u63D0\u554F":e==="data"?"\u8CC7\u6599\u67E5\u8A62":e||"\u5176\u4ED6"}async function Ir(e,t){let s=performance.now(),a=Dr(e,t),n=String(a.store||"query_history"),i=String(a.keyword||""),o=t.page,l=t.pageSize,u=[],c=[],p=[],$=[];if(n==="audit_events"){try{let B=Number(await ns("audit.last_event_id",0))||0,U=await Q.versioningAudit({since_id:B,limit:500}),W=Array.isArray(U?.events)?U.events:[];W.length&&await fr(W.map(ye=>({...ye,dataset:"judgment"})));let K=Number(U?.latest_event_id||0);K>B&&await Bs("audit.last_event_id",K)}catch(B){u.push(`\u7248\u672C audit \u540C\u6B65\u5931\u6557\uFF1A${B.message||B}`)}c=(await br({keyword:i,limit:Tr})).map(B=>({created_at:B.created_at,dataset:B.dataset,issue_month:B.issue_month,change_type:B.change_type,jid:B.jid,detail:B.detail})),p=[{key:"created_at",label:"\u6642\u9593",type:"datetime"},{key:"dataset",label:"\u8CC7\u6599\u96C6",type:"text"},{key:"issue_month",label:"\u6708\u4EFD",type:"mono"},{key:"change_type",label:"\u8B8A\u66F4",type:"status"},{key:"jid",label:"\u6848\u865F",type:"mono"},{key:"detail",label:"\u6458\u8981",type:"longtext"}];let j=new Map;c.forEach(B=>j.set(B.change_type||"unknown",(j.get(B.change_type||"unknown")||0)+1)),$=Array.from(j.entries()).map(([B,U])=>({label:B,value:U})).sort((B,U)=>U.value-B.value)}else if(n==="settings"){c=(await vr({keyword:i})).map(B=>({key:B.key,value:hr(B.value),updated_at:B.updated_at})),p=[{key:"key",label:"\u8A2D\u5B9A\u9375",type:"mono"},{key:"value",label:"\u503C",type:"longtext"},{key:"updated_at",label:"\u66F4\u65B0\u6642\u9593",type:"datetime"}];let j=new Map;c.forEach(B=>{let U=String(B.key||"").split(".")[0]||"\u5176\u4ED6";j.set(U,(j.get(U)||0)+1)}),$=Array.from(j.entries()).map(([B,U])=>({label:B,value:U})).sort((B,U)=>U.value-B.value)}else{c=(await oa({keyword:i,limit:Tr})).map(B=>({kind:yl(B.kind),title:B.title,detail:B.detail,created_at:B.created_at})),p=[{key:"kind",label:"\u985E\u578B",type:"text"},{key:"title",label:"\u67E5\u8A62\u5167\u5BB9",type:"longtext"},{key:"detail",label:"\u6458\u8981",type:"longtext"},{key:"created_at",label:"\u6642\u9593",type:"datetime"}];let j=new Map;c.forEach(B=>j.set(B.kind,(j.get(B.kind)||0)+1)),$=Array.from(j.entries()).map(([B,U])=>({label:B,value:U})).sort((B,U)=>U.value-B.value)}let v=c.length,g=(o-1)*l,m=c.slice(g,g+l),w=Math.round(performance.now()-s),S=pr();return S&&u.push("IndexedDB \u7121\u6CD5\u4F7F\u7528\uFF0C\u8CC7\u6599\u66AB\u5B58\u5728\u8A18\u61B6\u9AD4\uFF0C\u91CD\u65B0\u6574\u7406\u5F8C\u6703\u6D88\u5931\u3002"),{database:"indexeddb",label:"IndexedDB",status:S?"degraded":"ok",message:S?"\u700F\u89BD\u5668\u4E0D\u5141\u8A31\u4F7F\u7528 IndexedDB\uFF0C\u672C\u9801\u6539\u7528\u8A18\u61B6\u9AD4\u66AB\u5B58\u3002":null,table:n,columns:p,rows:m,total:v,page:o,page_size:l,duration_ms:w,summary:[{label:"\u7B26\u5408\u7B46\u6578",value:String(v)},{label:"\u76EE\u524D\u9801\u9762",value:`${m.length} \u7B46`},{label:"\u5132\u5B58\u6A21\u5F0F",value:ia()==="indexeddb"?"IndexedDB":"\u8A18\u61B6\u9AD4"},{label:"\u67E5\u8A62\u8017\u6642",value:`${w} ms`}],distribution:$,query_text:`INDEXEDDB OPEN 'judgment-console'
OBJECT STORE '${n}'
FILTER ${i?`keyword \u2248 '${i}'`:"1 = 1"}
ORDER BY created_at DESC
LIMIT ${l} OFFSET ${g}`,warnings:u,meta:{store:n,filters:a,client_side:!0}}}async function wl(e,t){let s=!1,a=null,n=[],i="law",o=null,l={},u=0,c=25,p="query",$=null,v=null,g=0,m=[],w=null,S=-1,M=0,j=0,B=null,U=null,W=null;e.innerHTML=`<section class="page data-page">
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
          ${f("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
    <div class="processing-summary judgment-stats-cards" id="data-judgment-stats" aria-label="\u91D1\u878D\u6848\u4EF6\u4F54\u6BD4">
      ${zt(null,{loading:!0})}
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
  </section>`;let K=e.querySelector("#query-sidebar"),ye=e.querySelector("#data-nav"),pe=e.querySelector("#db-options-wrap"),z=e.querySelector("#filter-area"),E=e.querySelector("#schema-area"),x=e.querySelector("#query-main"),C=e.querySelector("#schema-suggest-popover"),se=e.querySelector("#catalog-meta"),me=e.querySelector("#refresh-catalog"),V=e.querySelector("#data-judgment-stats"),Y=k=>n.find(q=>q.id===k),ae=()=>Y(i)?.databases||[],ee=k=>ae().find(q=>q.id===k),ke=(k,q)=>`${k}:${q}`,H=(k,q=i)=>l[ke(q,k.id)],ve=(k,q)=>{Bs(k,q).catch(()=>{})},je=()=>{if(!a){se.textContent="CATALOG \xB7 \u96E2\u7DDA",se.className="badge badge-danger badge-mono";return}let k=ae(),q=k.filter(I=>I.available).length,L=Y(i);se.textContent=`CATALOG \xB7 ${L?.label||i} \xB7 ${q}/${k.length} \u53EF\u7528`,se.className="badge badge-neutral badge-mono"},xe=k=>{x.innerHTML=Vo(k)},at=()=>{let k=U?.returnScroll??W?.returnScroll;U=null,W=null;let q=ee(o),L=q?H(q):null;p==="schema"&&v?.result?x.innerHTML=dn(v.result,We(q,v.tableId),{columnFilters:v.columnFilters||{},searchEnabled:q.id==="postgres"||q.id==="parquet"}):L?.result?x.innerHTML=ma(L.result):q&&xe(q),typeof k=="number"&&window.requestAnimationFrame(()=>window.scrollTo({top:k,behavior:"smooth"}))},De=(k="law-article-jump")=>{let q=x.querySelector(`#${k}`),L=Hr(q?.value);if(!L){N("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),q?.focus();return}let J=[...x.querySelectorAll("[data-article-no]")].find(X=>X.dataset.articleNo===L);if(!J){N(`\u627E\u4E0D\u5230\u7B2C ${L} \u689D\u3002`,"warn");return}J.scrollIntoView({behavior:"instant",block:"center"}),J.classList.add("is-jump-target"),window.setTimeout(()=>J.classList.remove("is-jump-target"),2400)},Fe=async({lawKey:k,sourceType:q="",lawName:L="",versionId:I=""})=>{let J=ee(o),X=J?H(J):null,ue=p==="schema"?v?.result:null;if(!J||!X?.result&&!ue||!k)return;let Le=++u;U={seq:Le,lawKey:k,sourceType:q,lawName:L,versionId:I?String(I):"",page:1,detail:null,database:J.id,returnScroll:window.scrollY},W=null,x.innerHTML=dl(L||k),x.scrollIntoView({behavior:"smooth",block:"start"});try{let Te=await Q.lawDetail(k,q,U.versionId);if(s||!U||U.seq!==Le)return;U.detail=Te,U.page=1,x.innerHTML=gl(Te,{database:U.database,lawPage:U.page})}catch(Te){if(s||!U||U.seq!==Le)return;x.innerHTML=ul(Te,L||k),N(Te.message||"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868\u3002","danger")}},Ae=async({jid:k})=>{let q=ee(o),L=q?H(q):null,I=p==="schema"?v?.result:null;if(!q||!L?.result&&!I||!k)return;let J=++u;U=null;let X=q.id==="parquet"?"parquet":"postgres";W={seq:J,jid:k,detail:null,database:q.id,source:X,returnScroll:window.scrollY},x.innerHTML=fl(k),x.scrollIntoView({behavior:"smooth",block:"start"});try{let ue=await Q.judgmentDetail(k,X);if(s||!W||W.seq!==J)return;W.detail=ue,x.innerHTML=$l(ue,{database:W.database})}catch(ue){if(s||!W||W.seq!==J)return;x.innerHTML=bl(ue,k),N(ue.message||"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587\u3002","danger")}},Ue=(k,q)=>`${i}:${k.id}:${q}`,We=(k,q)=>(k.tables||[]).find(L=>L.id===q)?.label||q,lt=(k,q,{sort:L=null,columnFilters:I={}}={})=>{let J={column_filters:I};return k.id==="postgres"?(J.table=q,J.schema_preview=!0):k.id==="parquet"&&i==="judgment"?(J.table="judgment_documents",J.columns=Oo):k.id==="parquet"&&(J.dataset="all",J.columns=Do),L?.key&&(J.sort=`${L.key}:${L.direction}`),J},R=async(k,q,{sort:L=null,columnFilters:I={},quiet:J=!1}={})=>{if(!q)return;it();let X=Ue(k,q),ue=++g,Le=!!(J&&v?.result&&v.key===X);$={tableId:q},v={key:X,tableId:q,loading:!0,result:null,error:null,sort:L,columnFilters:I},Le?x.setAttribute("aria-busy","true"):(E.innerHTML=cn(k,Y(i)?.label||i,q),x.innerHTML=Rr(We(k,q)));try{let Te;if(k.id==="indexeddb"){let he=ua(k,10);he.values.store=q,he.page=1,Te=await Ir(k,he)}else k.id==="qdrant"?Te={database:"qdrant",label:"Qdrant",status:"not_configured",message:"Qdrant collection \u9700\u8981\u8A9E\u610F\u67E5\u8A62\uFF1BSchema \u50C5\u63D0\u4F9B collection \u540D\u7A31\uFF0C\u4E0D\u5217\u51FA\u524D 10 \u7B46\u8CC7\u6599\u3002",table:q,columns:[],rows:[],total:0,page:1,page_size:10,duration_ms:0,summary:[],distribution:[],query_text:"",warnings:[],meta:{}}:(Te=await Q.query({database:k.id,filters:lt(k,q,{sort:L,columnFilters:I}),page:1,pageSize:10}),L?.key&&(Te.meta={...Te.meta||{},sort:L}));if(s||ue!==g)return;v={key:X,tableId:q,loading:!1,result:Te,error:null,sort:L,columnFilters:I},x.removeAttribute("aria-busy"),p==="schema"&&$?.tableId===q&&(E.innerHTML=cn(k,Y(i)?.label||i,q),x.innerHTML=dn(Te,We(k,q),{columnFilters:I,searchEnabled:k.id==="postgres"||k.id==="parquet"}))}catch(Te){if(s||ue!==g)return;v={key:X,tableId:q,loading:!1,result:null,error:Te,sort:L,columnFilters:I},x.removeAttribute("aria-busy"),p==="schema"&&$?.tableId===q&&(x.innerHTML=Cr(Te,We(k,q)))}},O=()=>{let k=ee(o);if(!k)return null;if(p==="schema"&&v?.result)return{db:k,tableId:v.tableId,columnFilters:v.columnFilters||{},sort:v.sort||null,mode:"schema"};let q=k?H(k):null,L=q?.result;return L&&(k.id==="postgres"||k.id==="parquet")?{db:k,tableId:L.table,columnFilters:q.columnFilters||{},sort:q.sort||null,mode:"query"}:null},y=(k,q,L)=>{if(!k)return;let I=`${k.db.id}:${k.tableId}:${q}`,J=A.get(I);J&&(window.clearTimeout(J),A.delete(I)),it();let X={...k.columnFilters||{}},ue=String(L||"").trim();if(ue?X[q]=ue:delete X[q],k.mode==="schema"){R(k.db,k.tableId,{sort:k.sort,columnFilters:X,quiet:!0});return}let Le=H(k.db);Le.columnFilters=X,Le.page=1,Ke(1)},A=new Map,G=()=>{(!C||C.hidden)&&!m.length&&!w||(M+=1,m=[],w=null,S=-1,C&&(C.hidden=!0,C.innerHTML=""))},F=(k,q)=>{let L=String(k||""),I=L.toLocaleLowerCase(),J=String(q||"").toLocaleLowerCase(),X=new Array(L.length).fill(!1),ue=(ze,Xe)=>{for(let st=ze;st<ze+Xe;st+=1)st>=0&&st<X.length&&(X[st]=!0)},Le=I.indexOf(J);if(Le>=0)for(;Le>=0;)ue(Le,J.length),Le=I.indexOf(J,Le+J.length);else{let ze=[];for(let Xe of J.match(/[一-鿿]{2,}/g)||[])for(let st=0;st<Xe.length-1;st+=1)ze.push(Xe.slice(st,st+2));ze.push(...J.match(/[a-z0-9]+/g)||[]);for(let Xe of ze){let st=I.indexOf(Xe);for(;st>=0;)ue(st,Xe.length),st=I.indexOf(Xe,st+Xe.length)}}let Te="",he=0;for(;he<L.length;)if(X[he]){let ze=he;for(;ze<L.length&&X[ze];)ze+=1;Te+=`<mark>${r(L.slice(he,ze))}</mark>`,he=ze}else{let ze=he;for(;ze<L.length&&!X[ze];)ze+=1;Te+=r(L.slice(he,ze)),he=ze}return Te||r(L)},Ce=(k,q)=>{if(!C)return;let L=k.getBoundingClientRect(),I=Math.min(420,Math.max(220,L.width)),J=Math.min(360,34+q*30),X=L.bottom+4;X+J>window.innerHeight-8&&(X=Math.max(8,L.top-J-4));let ue=Math.min(window.innerWidth-I-8,Math.max(8,L.left));C.style.width=`${I}px`,C.style.left=`${ue}px`,C.style.top=`${X}px`},Ne=k=>{if(!C)return;let q=[...C.querySelectorAll(".schema-suggest-item")];q.length&&(S=Math.max(0,Math.min(q.length-1,k)),q.forEach((L,I)=>{L.classList.toggle("is-active",I===S)}),q[S].scrollIntoView({block:"nearest"}))},Pe=k=>{let q=m[k],L=w;!q||!L||(G(),y(L,L.column,q))},nt=async(k,q,L,I)=>{if(!k||!L.trim()){G();return}let J=++M;w={...k,column:q,input:I},S=-1;try{let X=await Q.schemaSuggest({database:k.db.id,table:k.tableId,column:q,query:L,limit:1e3});if(J!==M||document.activeElement!==I||!C)return;let ue=Array.isArray(X.values)?X.values:[];if(m=ue,!ue.length){G();return}let Le=Number(X.total)>ue.length?`\u5171 ${d(X.total)} \u500B\u7B26\u5408\uFF0C\u986F\u793A\u524D ${d(ue.length)} \u500B`:`\u5171 ${d(X.total)} \u500B\u7B26\u5408`;C.innerHTML=`<div class="schema-suggest-head">${r(Le)}</div>${ue.map((Te,he)=>`<button class="schema-suggest-item" type="button"
            data-schema-suggest-index="${he}"
            title="${r(Te)}">${F(Te,L)}</button>`).join("")}`,Ce(I,ue.length),C.hidden=!1}catch{G()}},it=()=>{let k=document.activeElement;k instanceof HTMLElement&&k.matches("[data-schema-search]")&&k.blur(),G()},rt=(k,{resetReport:q=!1}={})=>{it();let L=H(k);if(ye.innerHTML=Er(i,p),pe.innerHTML=Qo(ae(),k.id),p==="schema")z.hidden=!0,z.innerHTML="",E.hidden=!1,E.innerHTML=`<div class="schema-category-switch" role="tablist" aria-label="Schema \u985E\u5225">
        ${["law","judgment"].map(I=>{let J=n.find(X=>X.id===I);return J?`<button class="chip${i===I?" is-active":""}" type="button" role="tab" aria-selected="${i===I}" data-action="schema-category" data-category="${I}">${r(J.label)}</button>`:""}).join("")}
      </div>${cn(k,Y(i)?.label||i,$?.tableId||"")}`;else{E.hidden=!0,E.innerHTML="",z.hidden=!1;let I=Go(i,k,L),J=Nr(k,L);z.innerHTML=`${Uo(k)}${I?`${I}<details class="data-advanced"><summary>\u9032\u968E metadata \u689D\u4EF6</summary>${J}</details>`:J}<div class="sidebar-note">${Jo(k)}</div>`}if(je(),p==="schema"){let I=$?Ue(k,$.tableId):"";if(v&&v.key===I){let J=We(k,v.tableId);v.loading?x.innerHTML=Rr(J):v.error?x.innerHTML=Cr(v.error,J):x.innerHTML=dn(v.result,J,{columnFilters:v.columnFilters||{},searchEnabled:k.id==="postgres"||k.id==="parquet"})}else x.innerHTML=nl(k);return}q?xe(k):L.result?x.innerHTML=ma(L.result):xe(k)},Ge=(k,{persist:q=!0,resetReport:L=!1}={})=>{let I=ae(),J=I.find(ue=>ue.id===k)||I[0];if(!J)return;U=null,W=null,$=null,v=null,g+=1,o=J.id;let X=ke(i,J.id);l[X]||(l[X]=ua(J,c)),rt(J,{resetReport:L}),q&&(ve(`data.last_database.${i}`,J.id),ve("data.last_category",i))},Mt=(k,{persist:q=!0,resetReport:L=!0,databaseId:I=null}={})=>{let J=Y(k)||n[0];if(!J)return;i=J.id,U=null,W=null;let X=J.databases||[],ue=I&&X.find(Le=>Le.id===I)||X.find(Le=>Le.id===o)||X[0];if(o=ue?.id||null,!ue){ye.innerHTML=Er(i,p),pe.innerHTML=`<div class="sidebar-notice">${Ie({tone:"warn",title:"\u6C92\u6709\u53EF\u7528\u7684\u8CC7\u6599\u4F86\u6E90",text:"\u9019\u500B\u985E\u5225\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u5EAB\u9078\u9805\u3002"})}</div>`,z.innerHTML="",je();return}Ge(ue.id,{persist:!1,resetReport:L}),q&&(ve("data.last_category",J.id),ve(`data.last_database.${J.id}`,ue.id))},et=k=>{let q=H(k),L=z.querySelector("#data-filter-form");L&&(q.values=pa(L,k,q))},Ke=async(k=null,{quiet:q=!1}={})=>{let L=ee(o);if(!L)return;it();let I=H(L);et(L),k!==null&&(I.page=k),(!Number.isFinite(I.page)||I.page<1)&&(I.page=1);let J=++u;U=null,W=null;let X=x.querySelector(".report-card"),ue=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!X?x.setAttribute("aria-busy","true"):(x.removeAttribute("aria-busy"),x.innerHTML=Os(L));let Te=z.querySelector("#run-query");q||Me(Te,!0,"\u67E5\u8A62\u4E2D\u2026");try{let he;if(L.id==="indexeddb"?he=await Ir(L,I):he=await Q.query({database:L.id,filters:ln(L,I),page:I.page,pageSize:I.pageSize}),s||J!==u)return;if(he.meta={...he.meta||{},column_filters:I.columnFilters||{},searchable:L.id==="postgres"||L.id==="parquet",sort:I.sort||he.meta?.sort||null},I.result=he,I.page=Number(he.page)||I.page,I.pageSize=Number(he.page_size)||I.pageSize,x.removeAttribute("aria-busy"),x.innerHTML=ma(he),ue!==null){let Xe=x.querySelector("[data-page-size]");Xe&&(Xe.value=String(I.pageSize),Xe.focus({preventScroll:!0}))}let ze=Y(i)?.label||i;await Ps({kind:"data",title:`${ze} \xB7 ${L.label} \xB7 ${he.table||he.label||"query"}`,detail:`${d(he.total)} \u7B46 \xB7 ${ge(he.duration_ms)}`,payload:{category:i,database:L.id,filters:ln(L,I),page:I.page,page_size:I.pageSize}}),ve("data.last_query",{category:i,database:L.id,filters:ln(L,I),page:I.page,page_size:I.pageSize,at:new Date().toISOString()})}catch(he){if(s||J!==u)return;x.removeAttribute("aria-busy"),x.innerHTML=fa(he,L),N(he.message||"\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{!s&&J===u&&Me(Te,!1)}},Rt=(k,q)=>{let L=k?.querySelector("[data-data-fuzzy-results]");L&&(L.innerHTML=q.length?q.map(I=>`<button class="data-fuzzy-option" type="button" role="option" data-action="select-fuzzy-term" data-term="${r(I.value)}"><span>${r(I.label||I.value)}</span><small>${r(I.meta||"")}</small></button>`).join(""):'<div class="data-fuzzy-empty">\u6C92\u6709\u76F8\u8FD1\u7D50\u679C\uFF1B\u6309 Enter \u53EF\u76F4\u63A5\u52A0\u5165\u76EE\u524D\u8F38\u5165\u7684\u95DC\u9375\u5B57\u3002</div>')},te=async(k,q="")=>{if(!k)return;let L=ee(o),I=L?H(L):null;if(!I)return;let J=k.dataset.fuzzyKind||i,X=k.querySelector("[data-data-fuzzy-results]"),ue=++j;X&&(X.innerHTML='<div class="data-fuzzy-loading"><span class="spinner"></span><span>\u641C\u5C0B\u76F8\u8FD1\u7D50\u679C\u2026</span></div>');try{let Le=await Q.dataSuggest({kind:J,query:q,limit:12});if(ue!==j)return;let Te=(Le.suggestions||[]).filter(he=>!I.fuzzyTerms.includes(he.value));Rt(k,Te)}catch(Le){if(ue!==j)return;X&&(X.innerHTML=`<div class="data-fuzzy-empty">${r(Le.message||"\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},$e=(k,{focus:q=!1}={})=>{if(!k)return;let L=k.querySelector("[data-data-fuzzy-popover]"),I=k.querySelector("[data-data-fuzzy-search]");!L||!I||(L.hidden&&(L.hidden=!1,I.value="",te(k,"")),q&&(I.focus(),I.select()))},Qe=k=>{B&&(window.clearTimeout(B),B=null);let q=k?.querySelector("[data-data-fuzzy-popover]");q&&(q.hidden=!0)},Ye=async k=>{let q=ee(o);if(!q)return;let L=H(q),I=String(k||"").trim();!I||L.fuzzyTerms.includes(I)||(L.fuzzyTerms=[...L.fuzzyTerms,I],Qe(z.querySelector("[data-data-fuzzy]")),rt(q),await Ke(1))},Ct=async k=>{let q=ee(o);if(!q)return;let L=H(q),I=String(k||"").trim();L.fuzzyTerms=L.fuzzyTerms.filter(J=>J!==I),rt(q),await Ke(1)},Lt=async()=>{me.disabled=!0,Me(me,!0,"\u6574\u7406\u4E2D\u2026");try{let[k,q,L,I,J]=await Promise.all([Q.catalog(),ns("data.last_category","law"),ns("data.last_database.law","postgres"),ns("data.last_database.judgment","postgres"),ns("data.page_size",25)]);if(s)return;a=k,V&&(V.innerHTML=zt(a.judgment_stats)),n=Array.isArray(a.categories)?a.categories:[],c=Br.includes(Number(J))?Number(J):25;for(let he of n)for(let ze of he.databases||[]){let Xe=ke(he.id,ze.id);l[Xe]||(l[Xe]=ua(ze,c))}let X=n.find(he=>he.id===q)||n[0];if(!X){ye.innerHTML="",pe.innerHTML=`<div class="sidebar-notice">${Ie({tone:"danger",title:"\u6C92\u6709\u53EF\u7528\u7684\u5206\u985E",text:"Catalog \u6C92\u6709\u56DE\u50B3\u6CD5\u898F\u547D\u4EE4\u6216\u5224\u6C7A\u5206\u985E\u3002"})}</div>`;return}let ue=X.id==="judgment"?I:L;if(i=X.id,o=null,Mt(X.id,{persist:!1,resetReport:!0,databaseId:ue}),s)return;let Le=ee(o),Te=Le?H(Le):null;Le&&Te&&p==="query"&&!Te.result&&(Le.id==="postgres"||Le.id==="parquet")&&Ke(1),N("\u8CC7\u6599\u5EAB catalog \u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(k){if(s)return;a=null,n=[],ye.innerHTML="",V&&(V.innerHTML=zt(null)),je(),pe.innerHTML=`<div class="sidebar-notice">${Ie({tone:"danger",title:"\u7121\u6CD5\u8B80\u53D6 catalog",text:r(k.message||"\u8ACB\u78BA\u8A8D API \u662F\u5426\u555F\u52D5\u3002")})}
      <button class="btn btn-secondary btn-sm" type="button" id="catalog-retry" style="margin-top:10px">
        ${f("refresh",14)}<span>\u91CD\u8A66</span>
      </button></div>`,x.innerHTML=`<div class="report-empty">${pt({iconName:"server",title:"API \u76EE\u524D\u7121\u6CD5\u9023\u7DDA",text:"\u67E5\u8A62\u5831\u8868\u9700\u8981 FastAPI \u63D0\u4F9B catalog \u8207\u8CC7\u6599\u67E5\u8A62 API\u3002\u8ACB\u78BA\u8A8D judgment-web \u5DF2\u555F\u52D5\u3002"})}</div>`}finally{s||(me.disabled=!1,Me(me,!1))}};K.addEventListener("change",k=>{let q=k.target;if(q.name==="category"){Mt(q.value);return}if(q.name==="database"){Ge(q.value);let X=ee(o),ue=X?H(X):null;X&&ue&&!ue.result&&p==="query"&&(X.id==="postgres"||X.id==="parquet")&&Ke(1);return}let L=ee(o);if(!L)return;let I=H(L),J=z.querySelector("#data-filter-form");!J||!q.name||(I.values=pa(J,L,I),I.page=1,q.name==="table"&&(U=null,W=null,I.sort=null,I.columnFilters={},I.result=null,z.innerHTML=Nr(L,I),xe(L)))}),K.addEventListener("input",k=>{let q=k.target.closest("[data-data-fuzzy-search]");if(q){let X=q.closest("[data-data-fuzzy]");B&&window.clearTimeout(B),B=window.setTimeout(()=>{te(X,q.value)},160);return}let L=ee(o);if(!L)return;let I=z.querySelector("#data-filter-form");if(!I||!k.target.name||k.target.name==="table")return;let J=H(L);J.values=pa(I,L,J)}),K.addEventListener("keydown",k=>{let q=k.target.closest("[data-data-fuzzy-search]");if(!q)return;let L=q.closest("[data-data-fuzzy]");if(k.key==="Escape")k.preventDefault(),Qe(L),q.blur();else if(k.key==="Enter"){k.preventDefault();let I=L?.querySelector("[data-action='select-fuzzy-term']");I?I.click():Ye(q.value)}else k.key==="ArrowDown"&&(k.preventDefault(),L?.querySelector("[data-action='select-fuzzy-term']")?.focus())}),K.addEventListener("mouseover",k=>{let q=k.target.closest("[data-action='open-fuzzy']");q&&$e(q.closest("[data-data-fuzzy]"))}),K.addEventListener("mouseout",k=>{let q=k.target.closest("[data-data-fuzzy]");q&&(k.relatedTarget&&q.contains(k.relatedTarget)||Qe(q))}),K.addEventListener("submit",k=>{k.target.id==="data-filter-form"&&(k.preventDefault(),Ke(1))}),K.addEventListener("click",async k=>{let q=z.querySelector("[data-data-fuzzy] [data-data-fuzzy-popover]:not([hidden])")?.closest("[data-data-fuzzy]");q&&!k.target.closest("[data-data-fuzzy]")&&Qe(q);let L=k.target.closest("[data-action]"),I=L?.dataset.action;if(I==="data-nav"){let J=L.dataset.tab,X=ee(o);if(J==="schema"){if(p!=="schema"){if(X){let he=H(X),ze=z.querySelector("#data-filter-form");ze&&(he.values=pa(ze,X,he))}p="schema",X&&rt(X)}return}let ue=J==="judgment"?"judgment":"law";p==="schema"&&(p="query"),i!==ue?Mt(ue,{databaseId:o,resetReport:!1}):X&&rt(X);let Le=ee(o),Te=Le?H(Le):null;Le&&Te&&!Te.result&&(Le.id==="postgres"||Le.id==="parquet")&&Ke(1);return}if(I==="open-fuzzy"){$e(L.closest("[data-data-fuzzy]"),{focus:!0});return}if(I==="select-fuzzy-term"){await Ye(L.dataset.term);return}if(I==="remove-fuzzy-term"){await Ct(L.dataset.term);return}if(I==="schema-category"){p="schema",Mt(L.dataset.category||"law",{resetReport:!0});return}if(I==="select-schema-table"){let J=ee(o);if(!J)return;R(J,L.dataset.tableId||"");return}if(I==="reset"){let J=ee(o);if(!J)return;U=null,W=null;let X=H(J);l[ke(i,J.id)]=ua(J,X.pageSize),rt(J),xe(J),N("\u5DF2\u91CD\u8A2D\u9019\u500B\u8CC7\u6599\u5EAB\u7684\u67E5\u8A62\u689D\u4EF6\u3002","info",2400);return}k.target.closest("#catalog-retry")&&Lt()}),x.addEventListener("input",k=>{let q=k.target.closest("[data-schema-search]");if(!q)return;let L=O();if(!L)return;let I=q.dataset.schemaSearch||"",J=q.value,X=`${L.mode}:${L.db.id}:${L.tableId}:${I}`,ue=A.get(X);if(ue&&window.clearTimeout(ue),!J.trim()){A.delete(X),G(),y(L,I,"");return}let Le=window.setTimeout(()=>{A.delete(X),nt(L,I,J,q)},250);A.set(X,Le)}),x.addEventListener("keydown",k=>{let q=k.target.closest("[data-schema-search]");if(!q)return;let L=O();if(L){if(k.key==="Escape"){G();return}if(k.key==="ArrowDown"||k.key==="ArrowUp"){if(!C||C.hidden)return;k.preventDefault();let I=k.key==="ArrowDown"?1:-1;Ne(S<0?I>0?0:m.length-1:S+I);return}if(k.key==="Enter"){if(k.preventDefault(),C&&!C.hidden&&S>=0){Pe(S);return}y(L,q.dataset.schemaSearch||"",q.value)}}}),C?.addEventListener("mousedown",k=>{k.preventDefault()}),C?.addEventListener("click",k=>{let q=k.target.closest("[data-schema-suggest-index]");q&&Pe(Number(q.dataset.schemaSuggestIndex))});let Vt=k=>{k.target.closest("[data-schema-search]")||C?.contains(k.target)||G()};return document.addEventListener("click",Vt),window.addEventListener("scroll",G,{capture:!0,passive:!0}),window.addEventListener("resize",G),x.addEventListener("keydown",k=>{k.target.matches(".law-jump-input")&&k.key==="Enter"&&(k.preventDefault(),De(k.target.id))}),x.addEventListener("click",async k=>{let q=k.target.closest("[data-action]");if(!q)return;let L=q.dataset.action,I=ee(o),J=I?H(I):null,X=J?.result;if(L==="back-to-results"){at();return}if(L==="open-law"){Fe({lawKey:q.dataset.lawKey||"",sourceType:q.dataset.lawSource||"",lawName:q.dataset.lawName||""});return}if(L==="open-judgment"){Ae({jid:q.dataset.jid||""});return}if(L==="jump-article"){De(q.dataset.jumpInput||"law-article-jump");return}if(L==="sort-column"){let ue=q.dataset.sortKey||"";if(!ue||!I)return;if(p==="schema"&&v?.result){let he=v.sort,ze=ue==="jdate"||ue==="law_modified_date"||ue==="article_count"||ue==="citation_count"||ue==="full_text_length"||ue==="created_at"||ue==="updated_at",Xe=he?.key===ue?he.direction==="asc"?"desc":"asc":ze?"desc":"asc";R(I,v.tableId,{sort:{key:ue,direction:Xe},columnFilters:v.columnFilters||{},quiet:!0});return}if(!J)return;let Le=J.sort,Te=Le?.key===ue?Le.direction==="asc"?"desc":"asc":ue==="jdate"?"desc":"asc";J.sort={key:ue,direction:Te},Ke(1,{quiet:!0});return}if(L==="retry"){Ke(J?.page||1);return}if(X){if(L==="prev-page"){Ke(Math.max(1,Number(X.page)-1),{quiet:!0});return}if(L==="next-page"){let ue=Math.max(1,Math.ceil(Number(X.total)/Number(X.page_size)));Ke(Math.min(ue,Number(X.page)+1),{quiet:!0});return}if(L==="copy-query"){let ue=await fs(X.query_text||"");N(ue?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",ue?"ok":"warn");return}if(L==="export-json"){let ue=`${X.database}-${X.table||"query"}-page-${X.page}.json`;Ft(ue,JSON.stringify(va(X),null,2),"application/json;charset=utf-8"),N(`\u5DF2\u532F\u51FA ${ue}`,"ok");return}if(L==="export-csv"){let ue=`${X.database}-${X.table||"query"}-page-${X.page}.csv`;Ft(ue,ba(X),"text/csv;charset=utf-8"),N(`\u5DF2\u532F\u51FA ${ue}`,"ok")}}}),x.addEventListener("change",k=>{let q=k.target.closest("[data-action='select-law-version']");if(q&&U){Fe({lawKey:U.lawKey,sourceType:U.sourceType,lawName:U.lawName,versionId:q.value});return}if(!k.target.matches("[data-page-size]"))return;let L=ee(o);if(!L)return;let I=H(L);I.pageSize=Number(k.target.value)||25,I.page=1,ve("data.page_size",I.pageSize),Ke(1,{quiet:!0})}),me.addEventListener("click",()=>{Lt()}),await Lt(),t&&typeof t.setTitle=="function"&&t.setTitle("\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"),()=>{s=!0,B&&window.clearTimeout(B);for(let k of A.values())window.clearTimeout(k);A.clear(),G(),document.removeEventListener("click",Vt),window.removeEventListener("scroll",G,{capture:!0}),window.removeEventListener("resize",G)}}var Kr=[10,25,50,100],_l=[{value:"started_at:desc",label:"Timestamp \u65B0 \u2192 \u820A"},{value:"started_at:asc",label:"Timestamp \u820A \u2192 \u65B0"},{value:"duration_ms:desc",label:"\u8017\u6642\u591A \u2192 \u5C11"},{value:"duration_ms:asc",label:"\u8017\u6642\u5C11 \u2192 \u591A"}];function fn(){return{process:"",module:"",status:"",method:"",model:"",keyword:"",from_date:"",to_date:"",min_duration:"",sort:"started_at:desc"}}function kl(e,t=e){return`<option value="${r(e)}">${r(t)}</option>`}function Fs(e,t,s,a,n=""){return`<div class="field">
    <label class="field-label" for="performance-${e}">
      <span>${r(t)}</span>
      <span class="field-tag">${r(e)}</span>
    </label>
    <select class="select" id="performance-${e}" name="${r(e)}">
      ${kl("","\u5168\u90E8")}
      ${s.map(i=>`<option value="${r(i)}" ${String(i)===String(a)?"selected":""}>${r(i)}</option>`).join("")}
    </select>
    ${n?`<span class="field-help">${r(n)}</span>`:""}
  </div>`}function Sl(e,t){let s=_l.map(a=>`<option value="${a.value}" ${a.value===t.sort?"selected":""}>${a.label}</option>`).join("");return`
    ${Fs("process","\u7A0B\u5E8F",e.processes||[],t.process)}
    ${Fs("module","\u6A21\u7D44",e.modules||[],t.module)}
    ${Fs("model","\u6A21\u578B",e.models||[],t.model)}
    ${Fs("status","\u72C0\u614B",e.statuses||[],t.status)}
    ${Fs("method","\u65B9\u6CD5",e.methods||[],t.method)}
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
    </div>`}function Ur(){let e=document.getElementById("performance-filter-form");if(!e)return fn();let t=new FormData(e);return{process:String(t.get("process")||""),module:String(t.get("module")||""),status:String(t.get("status")||""),method:String(t.get("method")||""),model:String(t.get("model")||""),keyword:String(t.get("keyword")||"").trim(),from_date:String(t.get("from_date")||""),to_date:String(t.get("to_date")||""),min_duration:String(t.get("min_duration")||""),sort:String(t.get("sort")||"started_at:desc")}}function Qr(e){if(e==null)return"null";if(typeof e=="object")try{let t=JSON.stringify(e);return t.length>160?`${t.slice(0,157)}\u2026`:t}catch{return String(e)}return String(e)}function Gr(e){if(!e)return"";let t=new Date(e);if(Number.isNaN(t.getTime()))return"";let s=String(t.getHours()).padStart(2,"0"),a=String(t.getMinutes()).padStart(2,"0"),n=String(t.getSeconds()).padStart(2,"0"),i=String(t.getMilliseconds()).padStart(3,"0");return`${s}:${a}:${n}.${i}`}function xl(e,t){if(!e)return"";let s=new Date(e);return Number.isNaN(s.getTime())?"":new Date(s.getTime()+Math.max(0,Number(t)||0)).toISOString()}var ql=[{key:"parsing",label:"Parsing",hint:"\u8F38\u5165\u9577\u5EA6\u3001\u89E3\u6790\u6642\u9593",names:["rag.parse_question"],color:"#64748b"},{key:"embedding",label:"Embedding",hint:"Model\u3001Token\u3001Batch\u3001\u8017\u6642",names:["rag.embed_query"],color:"#3984c6"},{key:"qdrant",label:"Qdrant Search",hint:"Collection\u3001Filter\u3001Top K\u3001\u8017\u6642",names:["rag.qdrant_search"],color:"#d97706"},{key:"reranker",label:"Reranker",hint:"Model\u3001\u5019\u9078\u7B46\u6578\u3001\u8017\u6642",names:["rag.rerank"],color:"#8b5cf6"},{key:"context",label:"Context",hint:"Chunk \u6578\u3001Token \u6578\u3001\u8017\u6642",names:["rag.context"],fallbackNames:["rag.fetch_documents","rag.build_citations"],color:"#64748b"},{key:"llm",label:"LLM",hint:"Model\u3001Input/Output Token\u3001TTFT\u3001\u8017\u6642",names:["rag.llm_request"],color:"#16a34a"}],$a={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"};function Yr(e){let t=e?.metadata?.rag_response||{},s=String(t.status||e?.metadata?.rag_status||e?.status||"");return s==="operational"||s==="success"?{label:"Completed",tone:"ok"}:s==="retrieval_only"?{label:"Abstain",tone:"warn"}:s==="preview"?{label:"Preview",tone:"info"}:s==="failed"||s==="error"?{label:"Failed",tone:"danger"}:{label:s||"Unknown",tone:"idle"}}function bn(e){let t=Math.max(0,Number(e?.offset_ms)||0),s=Math.max(0,Number(e?.duration_ms)||0),a=Math.max(t,Number(e?.end_offset_ms)||t+s);return{...e,offset:t,end:a,duration:Math.max(s,a-t)}}function Xr(e,t=0){let s=Array.isArray(e?.segments)?[...e.segments].sort((p,$)=>Number(p.offset_ms||0)-Number($.offset_ms||0)):[],a=Math.max(Number(e?.total_ms)||0,Number(t)||0,...s.map(p=>bn(p).end),1),n=ql.map(p=>{let $=s.filter(w=>p.names.includes(w.name));!$.length&&p.fallbackNames&&($=s.filter(w=>p.fallbackNames.includes(w.name)));let v=$.map(bn),g=v.length?Math.min(...v.map(w=>w.offset)):null,m=v.length?Math.max(...v.map(w=>w.end)):null;return{...p,spans:v,start:g,end:m,duration:g===null?null:m-g}});for(let p of n){if(p.key!=="embedding"&&p.key!=="llm")continue;let $=[];for(let m of p.spans){let w=m.metadata||{},S=Number(w.load_duration_ms),M=Number.isFinite(S)&&S>0?S:0,j=Math.max(0,Number(m.duration)||0);$.push({...m,offset:m.offset,end:m.offset+M,duration:M,metadata:{...w,source_stage:p.label,model_load_ms:M,request_duration_ms:j,warm_duration_ms:Math.max(0,j-M),cold_start:M>=100},params:{...m.params||{},source_stage:p.label}})}if(!$.length)continue;let v=$.reduce((m,w)=>m+w.duration,0),g=p.spans.reduce((m,w)=>m+Math.max(0,Number(w.duration)||0),0);p.loadInfo={spans:$,total:v,requestTotal:g,ratio:g>0?Math.min(1,Math.max(0,v/g)):0}}let i=[...n],o=Math.max(0,...i.flatMap(p=>p.spans.map($=>$.end))),l=e?.metadata?.rag_response||{},u=Yr(e),c=Math.min(a,o);return i.push({key:"response",label:"Response",hint:"\u7E3D\u8017\u6642\u3001\u5F15\u7528\u6578\u3001\u6210\u529F\u6216 Abstain",color:"#0f766e",spans:[{offset:c,end:a,duration:Math.max(0,a-c),status:u.tone==="danger"?"error":"ok",metadata:l,params:{},started_at:e?.started_at,finished_at:e?.finished_at}],start:c,end:a,duration:Math.max(0,a-c),responseMetadata:l}),Al(i,a),{total:a,stages:i,response:l,traceStatus:u,requestId:e?.request_id||"",startedAt:e?.started_at,finishedAt:e?.finished_at,client:e?.client||{},models:Array.isArray(e?.summary?.models)?e.summary.models:[],hasLoad:i.some(p=>!!p.loadInfo)}}function Al(e,t){let s=e.reduce((i,o)=>i+Math.max(0,Number(o.duration)||0),0),a=s>0?t/s:1,n=0;for(let i of e){let o=Math.max(0,Number(i.duration)||0)*a;i.displayStart=n,i.displayDuration=o,i.displayEnd=n+o;let l=i.spans[0]||null,u=[],c=!1;if(l){let $=Math.max(0,Number(l.duration)||0),v=i.loadInfo?Math.max(0,Number(i.loadInfo.total)||0):0;if(i.loadInfo&&v>0&&i.spans.length===1&&$>0){let g=Math.min(l.end,l.offset+v),m=Math.max(0,g-l.offset),w=Math.max(0,l.end-g);if(m>0&&w>0){let S=xl(l.started_at,m),M={...l,offset:l.offset,end:g,duration:m,finished_at:S,metadata:{...l.metadata||{},source_stage:i.label,model_load_ms:m,request_duration_ms:$,warm_duration_ms:Math.max(0,$-m),cold_start:m>=100},params:{...l.params||{},source_stage:i.label}},j={...l,offset:g,end:l.end,duration:w,started_at:S,finished_at:l.finished_at};u.push({kind:"load",label:"Model Load",span:M,duration:m}),u.push({kind:"stage",label:`${i.label} \u63A8\u8AD6`,span:j,duration:w}),c=!0}}c||u.push({kind:"stage",label:i.label,span:l,duration:$})}i.detailSegments=u;let p=[];if(l&&o>0)if(c){let[$,v]=u,g=$.duration+v.duration,m=g>0?o*($.duration/g):0,w={...i,key:"model_load",label:`Model Load \xB7 ${i.label}`,spans:[$.span],duration:$.duration},S={...i,label:`${i.label} \u63A8\u8AD6`,spans:[v.span],duration:v.duration};p.push({offset:n,duration:m,color:"#0ea5e9",kind:"load",tip:ha(w,$.span)}),p.push({offset:n+m,duration:Math.max(0,o-m),color:i.color,kind:"stage",tip:ha(S,v.span,{includeLoad:!1})})}else p.push({offset:n,duration:o,color:i.color,kind:"stage",tip:ha(i,l)});i.displaySegments=p,n+=o}}function vn(e,{includeLoad:t=!0}={}){let s=[],a=(p,$)=>{$==null||$===""||s.push([p,String($)])},n=e.spans[0]||null;if(!n)return a("\u72C0\u614B","\u6B64\u7D00\u9304\u6C92\u6709\u9019\u500B span"),s;let i=n.params||{},o=n.metadata||{},l=Zr(n),u=hn(n),c=(p,$)=>{let v=Number(p?.load_duration_ms);if(!Number.isFinite(v))return;let g=Math.max(0,v);a("Model Load",ge(g)),a("\u51B7\u555F\u52D5",g>=100?"\u662F":"\u5426\uFF08\u71B1\u555F\u52D5\uFF09");let m=Math.max(0,Number($)||0);if(m>0){let w=Math.max(0,m-g);a("\u6263\u9664\u8F09\u5165\u5F8C",ge(w)),a("\u8F09\u5165\u5360\u6BD4",`${(g/m*100).toFixed(g/m>=.1?0:1)}%`)}};if(e.key==="response")return a("Trace \u72C0\u614B",e.responseMetadata.status||"\u2014"),a("Answer source",e.responseMetadata.answer_source||"\u2014"),a("Abstain",e.responseMetadata.abstain?"\u662F":"\u5426"),a("\u5F15\u7528\u7E3D\u6578",e.responseMetadata.citation_count??"\u2014"),a("\u5224\u6C7A\uFF0F\u6CD5\u898F\u5F15\u7528",`${e.responseMetadata.judgment_citations??"\u2014"} / ${e.responseMetadata.law_citations??"\u2014"}`),a("\u7E3D\u8017\u6642",ge(e.duration)),s;if(a("\u958B\u59CB",`${Gr(n.started_at)||"\u2014"} \xB7 +${n.offset.toFixed(1)} ms`),a("\u7D50\u675F",`${Gr(n.finished_at)||"\u2014"} \xB7 +${n.end.toFixed(1)} ms`),a("\u8017\u6642",ge(n.duration)),e.key==="parsing")a("\u8F38\u5165\u9577\u5EA6",o.input_length??i.input_length),a("\u6B63\u898F\u5316\u9577\u5EA6",o.normalized_length??i.normalized_length),a("\u79FB\u9664\u7A7A\u767D",o.trimmed_chars);else if(e.key==="embedding")a("Model",u||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.active_base_url||o.base_url),a("Input tokens",o.prompt_eval_count),a("Batch",o.batch),a("\u5411\u91CF\u7DAD\u5EA6",o.dimensions),a("Fallback",o.fallback_used?"\u662F":"\u5426"),t&&c(o,n.duration);else if(e.key==="qdrant")a("Collection",o.collection||i.collection),o.filter&&a("Filter",Qr(o.filter)),a("Top K",o.top_k??i.limit),a("Hits",o.hits),a("Unique judgments",o.unique_judgments),a("Top score",o.top_score);else if(e.key==="reranker")a("Model",u||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.base_url||i.url),a("Rerank \u72C0\u614B",o.status),a("Fallback",o.fallback_used?"\u662F":"\u5426"),a("\u5019\u9078\u7B46\u6578",o.candidates),a("\u9078\u7528\u7B46\u6578",o.selected),a("Top score",o.top_score),Array.isArray(o.errors)&&o.errors.length&&a("\u932F\u8AA4",o.errors.join(" \xB7 "));else if(e.key==="context")a("Chunks",o.chunks),a("\u5224\u6C7A chunks",o.judgment_chunks),a("\u6CD5\u898F chunks",o.law_chunks),a("Token \u4F30\u7B97",o.token_estimate),a("Context \u5B57\u5143",o.context_chars),a("\u6587\u4EF6\u6578",o.documents);else if(e.key==="llm")a("Model",u||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.base_url||i.url),a("Input tokens",o.input_tokens),a("Output tokens",o.output_tokens),a("TTFT",o.ttft_ms===null||o.ttft_ms===void 0?"\u2014":ge(o.ttft_ms)),a("API \u7E3D\u8017\u6642",o.total_duration_ms===null||o.total_duration_ms===void 0?"\u2014":ge(o.total_duration_ms)),t&&c(o,n.duration),a("Strict retry",o.strict?"\u662F":"\u5426");else if(e.key==="model_load"){if(a("Model",u||o.model||i.model),a("\u4E3B\u6A5F",l),a("\u4F86\u6E90\u968E\u6BB5",o.source_stage),a("\u51B7\u555F\u52D5",o.cold_start?"\u662F":"\u5426\uFF08\u71B1\u555F\u52D5\uFF09"),a("\u6A21\u578B\u547C\u53EB\u7E3D\u8017\u6642",o.request_duration_ms===null||o.request_duration_ms===void 0?"\u2014":ge(o.request_duration_ms)),a("\u8F09\u5165\u8017\u6642",o.model_load_ms===null||o.model_load_ms===void 0?"\u2014":ge(o.model_load_ms)),a("\u6263\u9664\u8F09\u5165\u5F8C\u6D41\u7A0B\u6642\u9593",o.warm_duration_ms===null||o.warm_duration_ms===void 0?"\u2014":ge(o.warm_duration_ms)),Number(o.request_duration_ms)>0&&Number(o.model_load_ms)>=0){let p=Number(o.model_load_ms)/Number(o.request_duration_ms)*100;a("\u8F09\u5165\u5360\u6BD4",`${p.toFixed(p>=10?0:1)}%`)}o.eval_duration_ms!==null&&o.eval_duration_ms!==void 0&&a("\u63A8\u8AD6\u8017\u6642",ge(o.eval_duration_ms))}else if(e.key==="segment"||e.key==="test_stage")if(a("Model",u||o.model||i.model),a("\u72C0\u614B",o.status||n.status),e.key==="test_stage")a("\u9032\u5EA6",o.progress===null||o.progress===void 0?"":`${Number(o.progress)||0}%`),n.error&&a("\u932F\u8AA4",n.error);else{n.error&&a("\u932F\u8AA4",n.error);for(let[p,$]of Object.entries(i).slice(0,10))a(p,Qr($))}return e.spans.length>1&&(e.key==="model_load"?a("\u5404\u6A21\u578B\u8F09\u5165",e.spans.map(p=>`${p.metadata?.source_stage||"model"} ${hn(p)} ${ge(p.metadata?.model_load_ms||0)}`).join(" \xB7 ")):(a("Span \u6578",e.spans.length),a("Span \u660E\u7D30",e.spans.map((p,$)=>`#${$+1} +${p.offset.toFixed(0)}ms/${ge(p.duration)}`).join(" \xB7 ")))),n.module&&a("Module",n.module),n.function&&a("Function",n.function),s}function Ml(e){let t=String(e||"").trim();if(!t)return"";try{return new URL(t.includes("://")?t:`http://${t}`).hostname||t}catch{return t}}function Zr(e){let t=e?.metadata||{},s=String(t.provider_name||"").trim();if(s)return s;let a=String(t.active_base_url||t.base_url||e?.params?.url||"").trim();return Ml(a)}function Ll(e){let t=e?.metadata||{};return String(t.model||e?.params?.model||"").trim()}function hn(e){let t=Zr(e),s=Ll(e);return s?t?`${t}:${s}`:s:""}function jl(e){let t=new Set;for(let s of e?.spans||[]){let a=hn(s);a&&t.add(a)}return[...t]}function ha(e,t,s={}){let a=vn({...e,spans:[t]},s);return[String(e.label||""),...a.map(([n,i])=>`${n}: ${i}`)].join(`
`)}function Tl(e,t){let s=e.spans||[],a=jl(e),n=Array.isArray(e.displaySegments)?e.displaySegments:null,i=7,o=Math.max(1,Math.min(4,s.length)),l=s.length>1,u=n?12:l?Math.max(12,o*i):12,c=n?n.map(S=>{if(Number(S.duration)<=0)return"";let M=Math.max(0,Math.min(100,S.offset/t*100)),j=Math.min(100-M,S.duration/t*100);return`<span class="rag-wf-bar is-sequential${S.kind==="load"?" is-load":""}" style="left:${M.toFixed(3)}%;width:${j.toFixed(4)}%;top:0;height:12px;--bar-color:${S.color}"
            data-rag-wf-tip="${r(S.tip)}"
            aria-label="${r(S.tip)}" role="img"></span>`}).join(""):s.slice(0,4).map((S,M)=>{if(Number(S.duration)<=0)return"";let j=Math.max(0,Math.min(100,S.offset/t*100)),B=Math.max(.35,Math.min(100-j,S.duration/t*100)),U=l?M*i:0,W=l?6:12,K=ha(e,S);return`<span class="rag-wf-bar" style="left:${j.toFixed(3)}%;width:${B.toFixed(3)}%;top:${U}px;height:${W}px"
            data-rag-wf-tip="${r(K)}"
            aria-label="${r(K)}" role="img"></span>`}).join(""),p=Array.isArray(e.detailSegments)?e.detailSegments:[],$=p.length>1?p.map(S=>{let M=S.kind==="load"?{...e,key:"model_load",label:`Model Load \xB7 ${e.label}`,spans:[S.span],duration:S.duration}:{...e,label:`${e.label} \u63A8\u8AD6`,spans:[S.span],duration:S.duration},j=vn(M,{includeLoad:S.kind!=="stage"});return`<div class="rag-wf-detail-group">
              <div class="rag-wf-detail-group-head">
                <strong>${r(S.label)}</strong>
                <span>${r(ge(S.duration))}</span>
              </div>
              <div class="rag-wf-detail-grid">${j.map(([B,U])=>`<span class="rag-wf-detail"><span>${r(B)}</span><strong>${r(U)}</strong></span>`).join("")}</div>
            </div>`}).join(""):"",v=vn(e).map(([S,M])=>`<span class="rag-wf-detail"><span>${r(S)}</span><strong>${r(M)}</strong></span>`).join(""),g=p.length>1?`<div class="rag-wf-details is-split">${$}</div>`:`<div class="rag-wf-details">${v}</div>`,m=s.length?s.some(S=>S.status==="error")?"is-error":"":"is-missing",w=s.length?ge(e.duration):"\u672A\u8A18\u9304";return`<details class="rag-wf-stage ${m}" style="--stage-color:${e.color}">
    <summary class="rag-wf-stage-summary">
      <span class="rag-wf-stage-head">
        <span class="rag-wf-stage-label">
          <i aria-hidden="true"></i>
          <span><strong>${r(e.label)}</strong><small>${r(e.hint)}</small>${a.length?`<small class="rag-wf-model-line">${r(a.join(" \xB7 "))}</small>`:""}</span>
        </span>
        <span class="rag-wf-stage-meta">${w} \xB7 ${s.length?`${s.length} span`:"\u2014"} <span class="rag-wf-chevron">${f("chevronRight",12)}</span></span>
      </span>
      <span class="rag-wf-track" style="height:${u}px">${c}</span>
    </summary>
    ${g}
  </details>`}function ei(e,t,s=!1){let a=e.response||{},n=e.client||{},i=e.models||[];return`<div class="rag-wf-summary">
      <span>\u7E3D\u8017\u6642 <strong>${r(ge(e.total))}</strong></span>
      <span>Server <strong>${r(ge(t))}</strong></span>
      ${n.total_ms?`<span>Client <strong>${r(ge(n.total_ms))}</strong></span>`:""}
      ${n.render_ms!==void 0?`<span>Render <strong>${r(ge(n.render_ms))}</strong></span>`:""}
      <span>\u5F15\u7528 <strong>${r(String(a.citation_count??"\u2014"))}</strong></span>
      <span>Abstain <strong>${a.abstain?"\u662F":"\u5426"}</strong></span>
      ${i.length?`<span>Model <strong>${r(i.join(" \xB7 "))}</strong></span>`:""}
      ${s?'<span class="rag-wf-updating">\u66F4\u65B0\u4E2D\u2026</span>':""}
    </div>`}function _s(e,t,s="\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\uFF0C\u67E5\u770B\u53C3\u6578\u3001Token\u3001TTFT\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u4F86\u6E90\u6578\u91CF\u3002Waterfall \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u5E73\u884C\u57F7\u884C\u7684 span \u6703\u4F9D\u5BE6\u969B\u6642\u9593\u91CD\u758A\u986F\u793A\u3002",{legend:a=""}={}){return`<div class="rag-wf-axis"><span>0 ms</span><span>${r(ge(t))}</span></div>
    ${a}
    <div class="rag-wf-stages">${(e||[]).map(n=>Tl(n,t)).join("")}</div>
    <p class="rag-wf-hint">${r(s)}</p>`}function ti(e){let t=(e.stages||[]).some(n=>n.loadInfo),s=t?'<div class="rag-wf-legend"><span><i class="is-load"></i>Model Load\uFF08\u968E\u6BB5 bar \u524D\u6BB5\uFF09</span></div>':"",a=t?"\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7D50\u675F\u5F8C\u63A5\u7E8C\u4E0B\u4E00\u968E\u6BB5\uFF1BEmbedding\uFF0FLLM \u7684\u85CD\u8272\u524D\u6BB5\u70BA Model Load\uFF0C\u5F8C\u6BB5\u70BA\u63A8\u8AD6\u3002\u5BE6\u969B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001Token \u8207\u8F09\u5165\u5360\u6BD4\u53EF\u5C55\u958B\u67E5\u770B\u3002":"\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7D50\u675F\u5F8C\u63A5\u7E8C\u4E0B\u4E00\u968E\u6BB5\u3002\u5BE6\u969B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207 Token \u53EF\u5C55\u958B\u67E5\u770B\u3002";return _s(e.stages,e.total,a,{legend:s})}function ya(e,{serverDurationMs:t=0,loading:s=!1,embedded:a=!1}={}){if(!e||typeof e!="object")return"";let n=Xr(e,t),i=n.traceStatus;return`<section class="report-card rag-wf-card${a?" rag-wf-embedded":""}">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${$a[i.tone]||$a.idle}">${r(i.label)}</span>
        </div>
        <div class="report-sub">Trace ID:
          <span class="mono">${r(n.requestId||"\u2014")}</span>
          \xB7 ${r(qe(n.startedAt))}
        </div>
      </div>
      <div class="rag-wf-actions">
        <a class="btn btn-secondary btn-sm" href="#/performance">
          ${f("activity",14)}<span>\u5B8C\u6574 Flow</span>
        </a>
      </div>
    </div>
    ${ei(n,t,s)}
    ${ti(n)}
  </section>`}var bt=null;function Nl(){return bt||(bt=document.createElement("div"),bt.className="rag-wf-tooltip",bt.hidden=!0,document.body.appendChild(bt),bt)}function $n(){bt&&(bt.hidden=!0)}function si(e){if(!bt||bt.hidden)return;let t=14,s=10,a=bt.getBoundingClientRect(),n=e.clientX+t,i=e.clientY+t;n+a.width>window.innerWidth-s&&(n=e.clientX-a.width-t),i+a.height>window.innerHeight-s&&(i=e.clientY-a.height-t),bt.style.left=`${Math.max(s,n)}px`,bt.style.top=`${Math.max(s,i)}px`}document.addEventListener("pointerover",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=Nl(),a=t.dataset.ragWfTip||"";a&&(s.textContent=a,s.hidden=!1,si(e))});document.addEventListener("pointermove",e=>{if(!(!bt||bt.hidden)){if(!e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]")){$n();return}si(e)}});document.addEventListener("pointerout",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=e.relatedTarget;s instanceof Node&&t.contains(s)||$n()});window.addEventListener("scroll",$n,{capture:!0,passive:!0});function El(e,t,s,a){if(a&&!e.length)return`<div class="report-card rag-wf-card">
      ${Ie({tone:"danger",title:"RAG Pipeline \u8B80\u53D6\u5931\u6557",text:r(a.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-rag-waterfall">${f("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;if(!e.length)return`<div class="report-card rag-wf-card">
      ${pt({iconName:"activity",title:s?"\u8B80\u53D6 RAG Pipeline\u2026":"\u5C1A\u7121 RAG Pipeline \u7D00\u9304",text:s?"\u6B63\u5728\u6574\u7406\u6700\u8FD1\u7684 RAG \u554F\u7B54 Trace\u3002":"\u7522\u751F\u65B0\u7684 RAG \u554F\u7B54\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A Parsing\u3001Embedding\u3001Qdrant\u3001Context\u3001LLM \u8207 Response \u7684 waterfall\u3002"})}
    </div>`;let n=e.find(c=>String(c.id)===String(t))||e[0],i=n.flow&&typeof n.flow=="object"?n.flow:{},o=Xr(i,n.duration_ms),l=o.traceStatus,u=e.map(c=>{let p=Yr(c.flow||{});return`<option value="${r(String(c.id))}" ${String(c.id)===String(n.id)?"selected":""}>#${r(String(c.id))} \xB7 ${r(qe(c.started_at))} \xB7 ${r(ge(c.duration_ms))} \xB7 ${r(p.label)}</option>`}).join("");return`<section class="report-card rag-wf-card">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${$a[l.tone]||$a.idle}">${r(l.label)}</span>
        </div>
        <div class="report-sub">Trace ID:
          <span class="mono">${r(o.requestId||n.request_id||"\u2014")}</span>
          \xB7 ${r(qe(n.started_at))}
        </div>
      </div>
      <div class="rag-wf-actions">
        <label class="rag-wf-select">Trace
          <select class="select" data-rag-trace-select aria-label="\u9078\u64C7 RAG Trace">${u}</select>
        </label>
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-rag-waterfall">
          ${f("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
    ${ei(o,n.duration_ms,s)}
    ${ti(o)}
  </section>`}function Rl(e){let t=Array.isArray(e?.segments)?e.segments:[],s=Array.isArray(e?.models)?e.models:[],a=e?.client||{},n=Math.max(...t.map(l=>Number(l.avg_ms)||0),1),i=a.samples?ge(a.avg_total_ms??0):"\u2014",o=a.samples?ge(a.avg_render_ms??0):"\u2014";return`<div class="perf-flow-stats">
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
                    <span class="perf-model-count">${d(l.value)} \u6B21${l.avg_ms?` \xB7 \u5E73\u5747 ${ge(l.avg_ms)}`:""}</span>
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
                    <span class="perf-seg-ms">${ge(l.avg_ms)}</span>
                  </div>`).join("")}</div>`:'<p class="muted" style="font-size:11px">\u5C1A\u7121\u5340\u6BB5\u8017\u6642\uFF1B\u9700\u6709\u542B flow \u7684\u65B0\u7D00\u9304\u3002</p>'}
      </div>
    </div>
  </div>`}function mt(e){let t=Math.max(0,Number(e)||0);if(!t)return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;let s=Math.round(t/1e3),a=Math.floor(s/3600),n=Math.floor(s%3600/60),i=s%60;return a?`${a}h ${String(n).padStart(2,"0")}m ${String(i).padStart(2,"0")}s`:n?`${n}m ${String(i).padStart(2,"0")}s`:`${(t/1e3).toFixed(1)}s`}function ai(e){let t=String(e?.task||"").trim();return t?t==="auto"?"\u81EA\u52D5\u63A5\u7E8C":`task ${t}`:"\u7D22\u5F15"}function Cl(e){let t=(e||[]).slice(-12);if(!t.length)return'<p class="muted" style="font-size:11px">\u5C1A\u7121\u7D22\u5F15\u7D00\u9304\u3002</p>';let s=Math.max(...t.map(a=>Number(a.points_per_second)||0),.1);return`<div class="index-run-bars">${t.map(a=>{let n=Number(a.points_per_second)||0,i=Math.max(2,n/s*100);return`<div class="index-run-row">
        <div class="index-run-label">
          <strong>${r(ai(a))}</strong>
          <span>${r(qe(a.started_at))}</span>
        </div>
        <div class="index-run-track" title="${r(`${d(a.indexed_count)} \u7B46 \xB7 ${mt(a.duration_ms)} \xB7 ${d(a.batch_count)} \u6279`)}">
          <span style="width:${i.toFixed(1)}%"></span>
        </div>
        <div class="index-run-value">
          <strong>${n.toFixed(1)}</strong><span>\u7B46/\u79D2</span>
          <em>${d(a.indexed_count)} \u7B46 \xB7 ${mt(a.duration_ms)}</em>
        </div>
      </div>`}).join("")}</div>`}function Pl(e){let t=(Array.isArray(e.time_breakdown)?e.time_breakdown:[]).map(s=>({...s,ms:Number(s.ms)||0,percent:Number(s.percent)||0})).filter(s=>s.ms>0);return t.length?`<div class="index-breakdown-bar">${t.map(s=>`<span class="index-seg index-seg-${r(s.key)}" style="width:${Math.max(.5,s.percent).toFixed(2)}%" title="${r(`${s.label} ${mt(s.ms)}\uFF08${s.percent.toFixed(1)}%\uFF09`)}"></span>`).join("")}</div>
    <div class="index-breakdown-legend">${t.map(s=>`<span class="index-legend-item">
            <i class="index-seg index-seg-${r(s.key)}"></i>
            <span>${r(s.label)}</span>
            <strong>${mt(s.ms)}</strong>
            <em>${s.percent.toFixed(1)}%</em>
          </span>`).join("")}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B\u968E\u6BB5\u8A08\u6642\uFF1B\u5F8C\u7E8C\u7D22\u5F15\u6703\u8A18\u9304 Ollama Embedding\u3001Qdrant Upsert \u8207 PostgreSQL \u7D22\u5F15\u7D00\u9304\u7684\u6642\u9593\u7D44\u6210\u3002</div>'}function Il(e,t){let s=(Array.isArray(e)?e:[]).map(M=>({elapsed:Math.max(0,Number(M.elapsed_s)||0),indexed:Math.max(0,Number(M.indexed)||0)})).filter(M=>M.indexed>0);if(s.length<2)return"";let a=Math.max(...s.map(M=>M.elapsed),(Number(t)||0)/1e3,1),n=Math.max(...s.map(M=>M.indexed),1),i=760,o=150,l=12,u=12,c=i-l*2,p=o-u*2,$=s.map(M=>[l+M.elapsed/a*c,o-u-M.indexed/n*p]),v=$.map(([M,j],B)=>`${B===0?"M":"L"}${M.toFixed(1)},${j.toFixed(1)}`).join(" "),g=`${v} L${$[$.length-1][0].toFixed(1)},${o-u} L${$[0][0].toFixed(1)},${o-u} Z`,m=Math.max(1,Math.ceil($.length/14)),w=$.map(([M,j],B)=>B%m===0||B===$.length-1?`<circle cx="${M.toFixed(1)}" cy="${j.toFixed(1)}" r="2.6" />`:"").join(""),S=[0,1,2,3].map(M=>{let j=u+p/3*M;return`<line x1="${l}" y1="${j.toFixed(1)}" x2="${i-l}" y2="${j.toFixed(1)}" class="index-chart-grid" />`}).join("");return`<div class="index-chart-card index-progress-card">
    <div class="index-chart-head">
      <span>\u672C\u6B21\u7D22\u5F15\u9032\u5EA6</span>
      <span>${d(n)} \u7B46 \xB7 ${mt(a*1e3)}</span>
    </div>
    <svg class="index-progress-svg" viewBox="0 0 ${i} ${o}" role="img" aria-label="\u7D22\u5F15\u9032\u5EA6\u6298\u7DDA\u5716">
      ${S}
      <path d="${g}" class="index-progress-area"></path>
      <path d="${v}" class="index-progress-line"></path>
      ${w}
      <line x1="${l}" y1="${o-u}" x2="${i-l}" y2="${o-u}" class="index-chart-axis"></line>
      <line x1="${l}" y1="${u}" x2="${l}" y2="${o-u}" class="index-chart-axis"></line>
    </svg>
    <div class="index-progress-labels">
      <span>0</span>
      <span>${mt(a*500)}</span>
      <span>${mt(a*1e3)}</span>
    </div>
  </div>`}function Bl(e){if(!e||!e.latest)return"";let t=e.latest,s=Array.isArray(e.runs)?e.runs:[],a=e.average||{},n=t.coverage||{},i=n.total_judgments>0?`${d(n.indexed_judgments)} / ${d(n.total_judgments)}\uFF08${(100*n.indexed_judgments/n.total_judgments).toFixed(1)}%\uFF09`:"\u2014",o=[{label:"\u7576\u6B21\u57F7\u884C\u7B46\u6578",value:d(t.indexed_count),note:`${d(t.batch_count)} \u6279 \xD7 ${d(t.batch_size)} \u7B46`},{label:"\u5E73\u5747\u6BCF\u79D2\u7B46\u6578",value:`${(Number(t.points_per_second)||0).toFixed(1)}`,note:"\u7B46/\u79D2"},{label:"\u7576\u6B21\u4F7F\u7528\u6642\u9593",value:mt(t.duration_ms),note:`${d(t.scanned_count)} \u7B46\u5DF2\u6383\u63CF`},{label:"\u5E73\u5747\u6BCF\u6279\u6642\u9593",value:mt(t.batch_avg_ms),note:t.batch_min_ms||t.batch_max_ms?`\u6700\u5FEB ${mt(t.batch_min_ms)} \xB7 \u6700\u6162 ${mt(t.batch_max_ms)}`:"\u4EE5\u7E3D\u8017\u6642 \xF7 \u6279\u6578\u8A08\u7B97"}];return`<section class="index-perf-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u7D22\u5F15\u6548\u80FD</div>
        <div class="index-perf-sub">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 \xB7 \u6700\u8FD1 ${d(e.run_count)} \u6B21\u57F7\u884C</div>
      </div>
      <span class="chip">${r(ai(t))}</span>
    </div>
    <div class="index-perf-summary">
      ${o.map(l=>`<div class="index-perf-stat">
            <div class="summary-label">${r(l.label)}</div>
            <div class="index-perf-value">${r(l.value)}</div>
            <div class="index-perf-note">${r(l.note)}</div>
          </div>`).join("")}
    </div>
    <div class="index-perf-meta">
      <span><strong>\u6700\u8FD1\u4E00\u6B21</strong> ${r(qe(t.started_at))}</span>
      <span><strong>batch</strong> ${d(t.batch_size)} \u7B46\uFF0F\u6279</span>
      <span><strong>embedding \u4E0A\u9650</strong> ${t.max_chars?`${d(t.max_chars)} \u5B57`:"\u2014"}</span>
      <span><strong>collection</strong> ${d(t.collection_points)} points</span>
      <span><strong>\u8986\u84CB\u7387</strong> ${r(i)}</span>
      <span><strong>\u5E73\u5747\u6BCF\u6B21\u57F7\u884C</strong> ${mt(a.duration_ms)} \xB7 ${(Number(a.points_per_second)||0).toFixed(1)} \u7B46/\u79D2</span>
    </div>
    <div class="index-charts">
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u8FD1\u7D22\u5F15\u541E\u5410</span>
          <span>\u7B46/\u79D2</span>
        </div>
        ${Cl(s)}
      </div>
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u65B0\u4E00\u6B21\u6642\u9593\u7D44\u6210</span>
          <span>${mt(t.duration_ms)}</span>
        </div>
        ${Pl(t)}
      </div>
    </div>
    ${Il(t.progress,t.duration_ms)}
  </section>`}var Jr=["#22d3ee","#a78bfa","#f59e0b","#ec4899","#3b82f6","#10b981","#f97316","#8b5cf6","#64748b"];function Vr(e){let t=String(e?.host||e?.url||"").trim(),s=e?.port?`:${e.port}`:"";return`${t||"\u2014"}${s}`}function Dl(e,t,s,a){if(a&&!e)return`<div class="report-card rag-wf-card">
      ${Ie({tone:"danger",title:"\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline \u8B80\u53D6\u5931\u6557",text:r(a.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-index-pipeline">${f("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;let n=Array.isArray(e?.runs)?e.runs:[];if(!n.length)return`<div class="report-card rag-wf-card">
      ${pt({iconName:"layers",title:s?"\u8B80\u53D6\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline\u2026":"\u5C1A\u7121\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline \u7D00\u9304",text:s?"\u6B63\u5728\u6574\u7406\u6700\u8FD1\u7684\u7248\u672C\u5316\u7D22\u5F15\u7D00\u9304\u3002":"\u57F7\u884C\u300CQdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u300D\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A host/model\u3001Blue-Green collection \u8207\u5404\u968E\u6BB5\u8017\u6642\u3002"})}
    </div>`;let i=n.find(j=>String(j.id)===String(t))||e?.latest||n[n.length-1],o=i?.pipeline&&typeof i.pipeline=="object"?i.pipeline:null,u=[...n].reverse().map(j=>{let B=Number(j.pipeline?.version_id||j.version_id||0),U=B?`v${String(B).padStart(3,"0")}`:"\u7D22\u5F15";return`<option value="${r(String(j.id))}" ${String(j.id)===String(i.id)?"selected":""}>${r(`${qe(j.started_at)} \xB7 ${U} \xB7 ${mt(j.duration_ms)}`)}</option>`}).join(""),c=Number(o?.version_id||i.version_id||0),p=c?`v${String(c).padStart(3,"0")}`:"\u2014",$=o?.host||{},v=Vr($),g=o?.model||i.model||"\u2014",m=Number(o?.total_ms)||Number(i.duration_ms)||0,w=Array.isArray(o?.stages)?o.stages:[],S=w.map((j,B)=>({...j,ms:Math.max(0,Number(j.duration_ms)||0),color:Jr[B%Jr.length]})).filter(j=>j.ms>0).map(j=>`<span class="index-pipeline-seg" style="width:${(j.ms/Math.max(1,m)*100).toFixed(2)}%;background:${r(j.color)}" title="${r(`${j.label} ${mt(j.ms)}`)}"></span>`).join(""),M=w.map((j,B)=>{let U=Math.max(0,Number(j.duration_ms)||0),W=m>0?U/m*100:0,K=j.host&&typeof j.host=="object"?j.host:null;return`<div class="index-pipeline-row">
        <span class="index-pipeline-step">${String(B+1).padStart(2,"0")}</span>
        <div class="index-pipeline-copy">
          <div class="index-pipeline-title">
            <strong>${r(j.label||j.key||"\u968E\u6BB5")}</strong>
            ${Ve(j.status||"success")}
          </div>
          <span class="index-pipeline-detail">${r(j.detail||"\u2014")}</span>
          ${K?`<span class="index-pipeline-host">${f("server",12)} ${r(Vr(K))} \xB7 ${r(j.model||g)}</span>`:""}
        </div>
        <div class="index-pipeline-time">
          <strong>${mt(U)}</strong>
          <span>${W.toFixed(1)}%</span>
        </div>
      </div>`}).join("");return`<section class="index-perf-panel index-pipeline-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</div>
        <div class="index-perf-sub">Blue-Green collection\u3001host/model \u8207\u968E\u6BB5\u8017\u6642</div>
      </div>
      <div class="index-pipeline-actions">
        <select class="select index-pipeline-select" data-index-pipeline-select aria-label="\u9078\u64C7\u7D22\u5F15 Pipeline \u7D00\u9304">${u}</select>
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-index-pipeline">${f("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span></button>
      </div>
    </div>
    ${o?`<div class="index-pipeline-meta">
            <span><strong>\u7248\u672C</strong> ${r(p)}</span>
            <span><strong>collection</strong> ${r(String(o.collection||"\u2014"))}</span>
            <span><strong>\u6A21\u5F0F</strong> ${r(String(o.build_mode||"\u2014"))}</span>
            <span><strong>\u672C\u6B21</strong> ${o.resumed?`\u63A5\u7E8C\uFF08\u5DF2\u7D22\u5F15 ${d(o.resumed_indexed)} \u7B46\uFF09`:"\u65B0\u5EFA\u7248\u672C"}</span>
            <span><strong>Host</strong> ${r(v)}</span>
            <span><strong>Model</strong> ${r(String(g))}</span>
            <span><strong>\u7E3D\u8017\u6642</strong> ${mt(m)}</span>
          </div>
          <div class="index-pipeline-bar">${S}</div>
          <div class="index-pipeline-list">${M}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B Pipeline \u968E\u6BB5\u8CC7\u6599\uFF1B\u4E0B\u4E00\u6B21 Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u6703\u8A18\u9304 host/model \u8207\u5404\u968E\u6BB5\u8017\u6642\u3002</div>'}
  </section>`}function Ol(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,n=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${n} \u9801 \xB7
      \u986F\u793A ${d(i)}\u2013${d(o)} / ${d(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Kr.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${f("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=n?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${f("chevronRight",13)}</button>
    </div>
  </div>`}function Fl(e){let t=String(e?.module||"");return t.includes("static")||t.includes("frontend")?"#65a30d":t.includes("judgment.rag")?"#8b5cf6":t.includes("judgment.web.app")?"#3b82f6":t.includes("judgment.web.query")?"#d97706":t.includes("judgment.judgment_index")?"#0d9488":"#64748b"}function zl(e){let t=bn(e),s=Math.max(0,Math.min(8,Number(e.depth)||0));return{key:"segment",label:`${"\u203A ".repeat(s)}${e.name||"unnamed"}`,hint:[e.module||"\u2014",e.function||"\u2014"].join(" \xB7 "),color:Fl(e),spans:[{...t,status:e.status||"ok",error:e.error,metadata:e.metadata||{},params:e.params||{},started_at:e.started_at,finished_at:e.finished_at}],start:t.offset,end:t.end,duration:t.duration}}function wa(e){return(e||[]).map(zl)}function Hl(e,t){let s=e.flow&&typeof e.flow=="object"?e.flow:null,a=Array.isArray(s?.segments)?[...s.segments].sort((v,g)=>Number(v.seq)-Number(g.seq)):[],n=s?.summary||{},i=Array.isArray(n.models)?n.models:[],o=s?.client||{},l=s?.metadata||{},u=l.question||"",c=l.answer||"",p=u||c?`<div class="perf-flow-qa">
          ${u?`<div class="perf-flow-qa-row"><strong>RAG \u554F\u984C</strong><span>${r(u)}</span></div>`:""}
          ${c?`<div class="perf-flow-qa-row"><strong>RAG \u7B54\u6848</strong><span>${r(c)}</span></div>`:""}
        </div>`:"",$=Math.max(Number(s?.total_ms)||0,Number(e.duration_ms)||0,...a.map(v=>(Number(v.offset_ms)||0)+(Number(v.duration_ms)||0)),1);return`<details class="perf-record" ${t===0?"open":""}>
    <summary class="perf-record-summary">
      <span class="perf-record-id">#${r(String(e.id))}</span>
      <span class="perf-record-main">
        <span class="perf-record-title">${r(e.process||"\u672A\u547D\u540D")}</span>
        <span class="perf-record-path mono">${r(e.method||"")} ${r(e.path||"")}</span>
      </span>
      <span class="perf-record-time">${qe(e.started_at)}</span>
      <span class="perf-record-duration">${ge(e.duration_ms)}</span>
      ${Ve(e.status)}
      <span class="perf-record-chevron">${f("chevronRight",14)}</span>
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
      ${p}
      ${i.length?`<div class="chips perf-record-models">${i.map(v=>`<span class="chip">${r(v)}</span>`).join("")}</div>`:""}
      ${a.length?_s(wa(a),$,"\u6B64 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B segment \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u53C3\u6578\u3001module\uFF0Ffunction\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u932F\u8AA4\u3002"):`<div class="perf-no-flow">\u6B64\u7D00\u9304\u6C92\u6709 flow \u660E\u7D30\uFF08\u53EF\u80FD\u662F\u820A\u8CC7\u6599\u6216 CLI \u7D00\u9304\uFF09\u3002${e.params_text&&e.params_text!=="{}"?`<pre>${r(e.params_text)}</pre>`:""}</div>`}
      ${s?`<details class="flow-json">
              <summary>Flow JSON \xB7 ${a.length} \u6BB5</summary>
              <pre>${r(JSON.stringify(s,null,2))}</pre>
            </details>`:""}
    </div>
  </details>`}var Wr={embedding:"Embedding",retrieval:"Qdrant \u6AA2\u7D22",rerank:"Reranker",context:"PostgreSQL \u53D6\u6587",llm:"LLM \u751F\u6210",validation:"\u5F15\u7528\u9A57\u8B49"};function Ul(e){return{pending:"\u7B49\u5F85",running:"\u57F7\u884C\u4E2D",success:"\u5B8C\u6210",partial:"\u90E8\u5206\u6210\u529F",failed:"\u5931\u6557",skipped:"\u7565\u904E"}[e]||e||"\u672A\u77E5"}var Ql={embedding:"#3984c6",retrieval:"#d97706",rerank:"#8b5cf6",context:"#64748b",llm:"#16a34a",validation:"#8b5cf6"};function Gl(e,t){let s=Date.parse(e.started_at||""),a=Date.now(),n=Array.isArray(e.stage_order)?[...e.stage_order]:Object.keys(Wr);for(let c of t)c.stage&&!n.includes(c.stage)&&n.push(c.stage);let i=[],o=0;for(let c of n){let p=t.filter(g=>g.stage===c);if(!p.length)continue;let $=p.map(g=>{let m=Date.parse(g.started_at||""),w=Number.isFinite(s)&&Number.isFinite(m)?Math.max(0,m-s):0,S=Math.max(0,Number(g.duration_ms)||0);g.status==="running"&&Number.isFinite(m)&&(S=Math.max(S,a-m));let M=w+S;return o=Math.max(o,M),{offset:w,end:M,duration:S,status:g.status==="failed"?"error":g.status==="running"?"running":"ok",started_at:g.started_at,finished_at:g.finished_at,error:g.error_message,metadata:{...g.details||{},model:g.model,status:g.status,progress:Number(g.progress)||0,module:g.module,function:g.function},params:{model:g.model}}}),v=$.reduce((g,m)=>g+m.duration,0);i.push({key:"test_stage",label:Wr[c]||c,hint:`${$.length} \u500B\u7A0B\u5E8F`,color:Ql[c]||"#64748b",spans:$,start:$.length?Math.min(...$.map(g=>g.offset)):null,end:$.length?Math.max(...$.map(g=>g.end)):null,duration:v})}let l=e.status==="running"&&Number.isFinite(s)?Math.max(0,a-s):0,u=Math.max(Number(e.total_ms)||0,l,o,1);return{stages:i,total:u}}function ks(e,t,s,a={}){let n=a.showHistory!==!1,i=[`<option value="" ${s?"":"selected"}>\u76EE\u524D\uFF0F\u6700\u65B0\u6E2C\u8A66</option>`,...(t||[]).map(M=>`<option value="${r(M.run_id)}" ${M.run_id===s?"selected":""}>${r(Ul(M.status))} \xB7 ${r((M.question||"\u672A\u547D\u540D").slice(0,28))} \xB7 ${r(qe(M.started_at))}</option>`)].join(""),o=n?`<label class="test-flow-select-label">\u6B77\u53F2
        <select class="select" id="test-run-select">${i}</select>
      </label>
      <button class="btn btn-secondary btn-sm" type="button" id="test-flow-refresh">
        ${f("refresh",13)}<span>\u66F4\u65B0</span>
      </button>`:`<a class="btn btn-secondary btn-sm" href="#/performance">
        ${f("activity",13)}<span>\u6B77\u53F2 Flow</span>
      </a>`,l=`<div class="test-flow-head">
    <div class="test-flow-heading">
      <div class="eyebrow">PERFORMANCE TEST FLOW</div>
      <div class="test-flow-title">\u6E2C\u8A66\u6D41\u7A0B ${e?Ve(e.status):""}</div>
      <div class="test-flow-question">${e?r(e.question||"\u672A\u547D\u540D\u6E2C\u8A66"):"\u5C1A\u7121\u6E2C\u8A66\u6D41\u7A0B\u3002\u8ACB\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u4E26\u5728 RAG \u9801\u63D0\u554F\u3002"}</div>
    </div>
    <div class="test-flow-actions">${o}</div>
  </div>`;if(!e)return`<div class="test-flow-panel card">${l}
      ${pt({iconName:"activity",title:"\u7B49\u5F85\u6E2C\u8A66\u6D41\u7A0B",text:"\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C\u6240\u6709\u53EF\u7528\u6A21\u578B\uFF0C\u4E26\u5728\u9019\u88E1\u5373\u6642\u986F\u793A\u6BCF\u500B\u968E\u6BB5\u7684\u9032\u5EA6\u3002"})}
    </div>`;let u=Array.isArray(e.steps)?e.steps:[],c=Gl(e,u),p=e.models||{},$=e.status==="running"?`${ge(c.total)}\uFF08\u4F30\u7B97\uFF09`:ge(e.total_ms),v=u.find(M=>M.stage==="llm"&&M.model===e.summary?.primary_model)||u.find(M=>M.stage==="llm"&&M.details?.answer_preview),g=String(v?.details?.provider_name||"").trim(),m=g&&e.summary?.primary_model?`${g}:${e.summary.primary_model}`:e.summary?.primary_model||"",w=e.answer||v?.details?.answer_preview||"",S=`<div class="test-flow-answer">
    <div class="test-flow-answer-head">
      <span>RAG \u5F15\u64CE\u7B54\u6848</span>
      ${m?`<span class="mono">${r(m)}</span>`:""}
    </div>
    <p>${w?r(w):e.status==="running"?"\u6E2C\u8A66\u9032\u884C\u4E2D\uFF0C\u5C1A\u672A\u7522\u751F\u6700\u7D42\u7B54\u6848\u3002":"\u6B64\u6E2C\u8A66\u6C92\u6709\u4FDD\u5B58\u53EF\u986F\u793A\u7684\u7B54\u6848\u3002"}</p>
  </div>`;return`<div class="test-flow-panel card">
    ${l}
    <div class="test-flow-meta">
      <span><strong>Run</strong> <span class="mono">${r(e.run_id)}</span></span>
      <span><strong>\u958B\u59CB</strong> ${r(qe(e.started_at))}</span>
      <span><strong>\u7E3D\u8017\u6642</strong> ${$}</span>
      <span><strong>Embedding</strong> ${Array.isArray(p.embedding)?p.embedding.length:0} \u500B</span>
      <span><strong>LLM</strong> ${Array.isArray(p.llm)?p.llm.length:0} \u500B</span>
      <span><strong>\u968E\u6BB5</strong> ${r(e.stage_label||e.stage||"\u2014")}</span>
    </div>
    ${S}
    ${c.stages.length?_s(c.stages,c.total,"\u6E2C\u8A66 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B\u7A0B\u5E8F\u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u6A21\u578B\u3001\u72C0\u614B\u3001\u9032\u5EA6\u3001module\uFF0Ffunction \u8207\u932F\u8AA4\u3002"):'<p class="muted">\u6B64\u6E2C\u8A66\u6C92\u6709\u5340\u6BB5\u8CC7\u6599\u3002</p>'}
    <div class="test-flow-foot">
      <span>${e.status==="running"?"\u6E2C\u8A66\u57F7\u884C\u4E2D\uFF1B\u6B64\u5716\u8868\u6703\u81EA\u52D5\u66F4\u65B0\u3002":n?"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u5F9E\u4E0A\u65B9\u300C\u6B77\u53F2\u300D\u9078\u55AE\u9084\u539F\u5176\u4ED6 Flow\u3002":"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u81F3\u6548\u80FD\u5831\u8868\u67E5\u770B\u6B77\u53F2 Flow\u3002"}</span>
      ${m?`<span class="mono">primary=${r(m)}</span>`:""}
    </div>
  </div>`}function Jl(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.summary)?e.summary:[],a=e.flow_stats||e.meta?.flow_stats||{},n=e.index_stats||null;return`<div class="report-card performance-flow-report" data-database="performance">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">PERFORMANCE FLOW REPORT</div>
        <div class="report-title">
          \u6548\u80FD\u5831\u8868 ${Ve(e.status||"ok")}
          <span class="chip">performance_records</span>
        </div>
        <div class="report-sub">
          ${d(e.total)} \u7B46\u7B26\u5408 \xB7 ${ge(e.duration_ms)} \xB7
          \u6BCF\u6B21\u57F7\u884C\u6309\u9215\u7684\u5B8C\u6574 Flow
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${f("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${f("file",14)}<span>JSON</span></button>
      </div>
    </div>
    ${s.length?`<div class="summary-strip">${s.map(i=>`<div class="summary-item">
                <div class="summary-label">${r(i.label)}</div>
                <div class="summary-value">${r(i.value)}</div>
              </div>`).join("")}</div>`:""}
    ${Bl(n)}
    ${Rl(a)}
    <div class="report-section-head perf-flow-list-head">
      <span class="report-section-title">Flow \u7D00\u9304</span>
      <span class="muted" style="font-size:9.5px">\u9EDE\u64CA\u5217\u5C55\u958B\u6A21\u7D44\u3001\u51FD\u6578\u3001\u53C3\u6578\u8207\u5340\u6BB5\u8017\u6642</span>
    </div>
    <div class="perf-record-list">
      ${t.length?t.map((i,o)=>Hl(i,o)).join(""):pt({iconName:"activity",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684 Flow",text:"\u653E\u5BEC\u65E5\u671F\u3001\u6A21\u578B\u6216\u8017\u6642\u689D\u4EF6\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}
    </div>
    ${Ol(e)}
    <details class="perf-query-details">
      <summary>\u67E5\u8A62\u8A9E\u53E5\u8207\u8B66\u544A</summary>
      <div class="query-box">
        <pre class="query-code">${r(e.query_text||"\u2014")}</pre>
        <button class="btn btn-secondary btn-sm btn-copy" type="button" data-action="copy-query">
          ${f("copy",12)}<span>\u8907\u88FD</span>
        </button>
      </div>
      ${Array.isArray(e.warnings)&&e.warnings.length?`<div class="warnings">${e.warnings.map(i=>`<div class="warning-line">${r(i)}</div>`).join("")}</div>`:""}
    </details>
  </div>`}async function Vl(e,t){let s=!1,a=fn(),n={processes:[],modules:[],statuses:[],methods:[],models:[]},i=1,o=25,l=null,u=[],c="",p=!1,$=null,v=!1,g=null,m="",w=!1,S=null,M=!1;e.innerHTML=`<section class="page data-page performance-page">
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
          ${f("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
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
            <span class="status-tab-icon">${f("activity",15)}</span>
            <span class="status-tab-copy"><strong>\u6548\u80FD\u7E3D\u89BD</strong><small>Flow\u3001\u5340\u6BB5\u8017\u6642\u8207\u7D22\u5F15\u6548\u80FD</small></span>
          </button>
          <button class="status-tab" type="button" data-performance-tab="pipeline">
            <span class="status-tab-icon">${f("activity",15)}</span>
            <span class="status-tab-copy"><strong>RAG Pipeline</strong><small>Span waterfall\u3001Token \u8207 TTFT</small></span>
          </button>
          <button class="status-tab" type="button" data-performance-tab="index-pipeline">
            <span class="status-tab-icon">${f("layers",15)}</span>
            <span class="status-tab-copy"><strong>\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</strong><small>Host\uFF0FModel\u3001Blue-Green \u8207\u968E\u6BB5\u8017\u6642</small></span>
          </button>
          <button class="status-tab" type="button" data-performance-tab="benchmark">
            <span class="status-tab-icon">${f("brain",15)}</span>
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
                    ${f("search",15)}<span>\u57F7\u884C\u67E5\u8A62</span>
                  </button>
                </div>
              </form>
              <div class="sidebar-note">Flow \u5BEB\u5165 PostgreSQL \u7684 performance_records.flow\uFF08JSON\uFF09\uFF0C\u9810\u8A2D\u4FDD\u7559\u81F3\u5C11 90 \u5929\uFF1B\u53EF\u4F9D\u6A21\u578B\u3001\u7A0B\u5E8F\u3001\u6A21\u7D44\u8207\u8017\u6642\u7BE9\u9078\u3002</div>
            </aside>
            <section class="query-main" id="performance-main" aria-label="\u6548\u80FD\u5831\u8868" aria-live="polite">
              <div id="performance-test-flow"></div>
              <div id="performance-report">${Os({label:"\u6548\u80FD\u5831\u8868"})}</div>
            </section>
          </div>
        </div>
        <div id="performance-panel-pipeline" hidden></div>
        <div id="performance-panel-index-pipeline" hidden></div>
        <div id="performance-panel-benchmark" hidden></div>
      </section>
    </div>
  </section>`;let j=e.querySelector("#performance-filter-fields"),B=e.querySelector("#performance-filter-form"),U=e.querySelector("#performance-test-flow"),W=e.querySelector("#performance-report"),K=e.querySelector("#performance-panel-pipeline"),ye=e.querySelector("#performance-panel-index-pipeline"),pe=e.querySelector("#performance-meta"),z=e.querySelector("#performance-refresh"),E=[...e.querySelectorAll("[data-performance-tab]")],x={overview:e.querySelector("#performance-panel-overview"),pipeline:e.querySelector("#performance-panel-pipeline"),"index-pipeline":e.querySelector("#performance-panel-index-pipeline"),benchmark:e.querySelector("#performance-panel-benchmark")},C="overview",se=y=>{C=y;for(let A of E){let G=A.dataset.performanceTab===y;A.classList.toggle("is-active",G),G?A.setAttribute("aria-current","page"):A.removeAttribute("aria-current")}for(let[A,G]of Object.entries(x))G&&(G.hidden=A!==y);y==="benchmark"?pe.textContent="BENCHMARK \xB7 RAG":y==="pipeline"?pe.textContent="PERFORMANCE \xB7 RAG WATERFALL":y==="index-pipeline"?pe.textContent="PERFORMANCE \xB7 INDEX PIPELINE":l&&(pe.textContent=`PERFORMANCE \xB7 ${d(l.total)} \u7B46`)},me=jr(e,{onNavigate:y=>se(y)}),V=()=>{K&&(K.innerHTML=El(u,c,p,$))},Y=async({force:y=!1}={})=>{if(!(s||p)){if(v&&!y){V();return}p=!0,u.length||V();try{let A=await Q.performance({keyword:"/api/rag"},1,50);if(s)return;let G=(Array.isArray(A.rows)?A.rows:[]).filter(F=>F.flow&&(String(F.path||"").includes("/api/rag")||String(F.process||"").includes("RAG")));u=G,(!c||!G.some(F=>String(F.id)===String(c)))&&(c=G[0]?String(G[0].id):""),$=null,v=!0}catch(A){if(s)return;$=A}finally{s||(p=!1,V())}}},ae=()=>{ye&&(ye.innerHTML=Dl(g,m,w,S))},ee=async({force:y=!1}={})=>{if(!(s||w)){if(M&&!y){ae();return}w=!0,g||ae();try{let A=await Q.performance({},1,1);if(s)return;g=A.index_pipeline||A.index_stats||null;let G=Array.isArray(g?.runs)?g.runs:[];(!m||!G.some(F=>String(F.id)===String(m)))&&(m=g?.latest?String(g.latest.id):""),S=null,M=!0}catch(A){if(s)return;S=A}finally{s||(w=!1,ae())}}},ke=y=>{se(y),y==="benchmark"&&me.show(),y==="pipeline"&&Y(),y==="index-pipeline"&&ee()};e.addEventListener("click",y=>{let A=y.target.closest("[data-performance-tab]");A&&ke(A.dataset.performanceTab||"overview")}),K?.addEventListener("change",y=>{y.target.matches("[data-rag-trace-select]")&&(c=String(y.target.value||""),V())}),K?.addEventListener("click",y=>{y.target.closest('[data-action="refresh-rag-waterfall"]')&&Y({force:!0})}),ye?.addEventListener("change",y=>{y.target.matches("[data-index-pipeline-select]")&&(m=String(y.target.value||""),ae())}),ye?.addEventListener("click",y=>{y.target.closest('[data-action="refresh-index-pipeline"]')&&ee({force:!0})});let H=null,ve=[],je="",xe=null,at="",De=()=>{j.innerHTML=Sl(n,a)},Fe=()=>{let y=JSON.stringify({selected:je,tick:H?.status==="running"?Math.floor(Date.now()/1e3):0,runs:ve.map(A=>`${A.run_id}:${A.status}`),run:H?{run_id:H.run_id,status:H.status,progress:H.progress,total_ms:H.total_ms,steps:(H.steps||[]).map(A=>`${A.stage}:${A.model}:${A.status}:${A.progress}:${A.duration_ms}`)}:null});y!==at&&(at=y,U.innerHTML=ks(H,ve,je))},Ae=async()=>{try{let y=await Q.testRuns(30);if(s)return;ve=Array.isArray(y.runs)?y.runs:[]}catch{if(s)return;ve=[]}},Ue=async(y=null)=>{try{let A=y&&!je?y:je?await Q.testRun(je):await Q.testRunCurrent();if(s)return;H=A.run||null,!je&&H&&H.status!=="running"&&!ve.some(G=>G.run_id===H.run_id)&&await Ae(),Fe()}catch{if(s)return;H=null,Fe()}},We=async(y=null)=>{s||je||await Ue(y)},lt=()=>{s||xe||(xe=kt("test-runs",(y,A)=>We(A?.snapshot||null)))};U.addEventListener("change",async y=>{y.target.id==="test-run-select"&&(je=String(y.target.value||""),await Ue())}),U.addEventListener("click",async y=>{y.target.closest("#test-flow-refresh")&&(je="",await Ae(),await Ue())});let R=async(y=i,{quiet:A=!1}={})=>{i=Math.max(1,Number(y)||1),a=Ur();let G=W.querySelector(".report-card"),F=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!G?W.setAttribute("aria-busy","true"):(W.removeAttribute("aria-busy"),W.innerHTML=Os({label:"\u6548\u80FD\u5831\u8868"}));let Ne=e.querySelector("#performance-run");A||Me(Ne,!0,"\u67E5\u8A62\u4E2D\u2026");try{let Pe=await Q.performance(a,i,o);if(s)return;if(l=Pe,Pe.index_pipeline){g=Pe.index_pipeline;let nt=Array.isArray(g.runs)?g.runs:[];(!m||!nt.some(it=>String(it.id)===String(m)))&&(m=g.latest?String(g.latest.id):""),M=!0,S=null}if(i=Number(Pe.page)||i,o=Number(Pe.page_size)||o,W.removeAttribute("aria-busy"),W.innerHTML=Jl(Pe),F!==null){let nt=W.querySelector("[data-page-size]");nt&&(nt.value=String(o),nt.focus({preventScroll:!0}))}pe.textContent=`PERFORMANCE \xB7 ${d(Pe.total)} \u7B46`,pe.className="badge badge-neutral badge-mono"}catch(Pe){if(s)return;W.removeAttribute("aria-busy"),W.innerHTML=fa(Pe,{label:"\u6548\u80FD\u5831\u8868"}),N(Pe.message||"\u6548\u80FD\u5831\u8868\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{s||Me(Ne,!1)}},O=async()=>{try{n=await Q.performanceOptions()}catch{n={processes:[],modules:[],statuses:[],methods:[],models:[]}}De()};return B.addEventListener("submit",y=>{y.preventDefault(),R(1)}),e.querySelector('[data-action="reset"]').addEventListener("click",()=>{a=fn(),i=1,De(),R(1)}),z.addEventListener("click",async()=>{if(C==="pipeline"){Me(z,!0,"\u6574\u7406\u4E2D\u2026");try{await Y({force:!0})}finally{s||Me(z,!1)}return}if(C==="index-pipeline"){Me(z,!0,"\u6574\u7406\u4E2D\u2026");try{await ee({force:!0})}finally{s||Me(z,!1)}return}if(C==="benchmark"){Me(z,!0,"\u6574\u7406\u4E2D\u2026");try{await me.refresh()}finally{s||Me(z,!1)}return}a=Ur(),z.disabled=!0,Me(z,!0,"\u6574\u7406\u4E2D\u2026"),await O(),await Ae(),s||await Ue(),s||await R(1),s||(z.disabled=!1,Me(z,!1))}),W.addEventListener("click",async y=>{let A=y.target.closest("[data-action]");if(!A||!l)return;let G=A.dataset.action;if(G==="retry"){R(i);return}if(G==="prev-page"){R(Math.max(1,Number(l.page)-1),{quiet:!0});return}if(G==="next-page"){let F=Math.max(1,Math.ceil(Number(l.total)/Number(l.page_size)));R(Math.min(F,Number(l.page)+1),{quiet:!0});return}if(G==="copy-query"){let F=await fs(l.query_text||"");N(F?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",F?"ok":"warn");return}if(G==="export-json"){let F=`performance-page-${l.page}.json`;Ft(F,JSON.stringify(va(l),null,2),"application/json;charset=utf-8"),N(`\u5DF2\u532F\u51FA ${F}`,"ok");return}if(G==="export-csv"){let F=`performance-page-${l.page}.csv`;Ft(F,ba(l),"text/csv;charset=utf-8"),N(`\u5DF2\u532F\u51FA ${F}`,"ok")}}),W.addEventListener("change",y=>{y.target.matches("[data-page-size]")&&(o=Number(y.target.value)||25,Kr.includes(o)||(o=25),R(1,{quiet:!0}))}),await Promise.allSettled([O(),Ae()]),s||(await Ue(),await R(1),lt()),t&&typeof t.setTitle=="function"&&t.setTitle("\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"),()=>{s=!0,xe&&xe(),me.destroy()}}var Wl=["\u91D1\u878D\u6D88\u8CBB\u8005\u4FDD\u8B77\u6CD5\u5982\u4F55\u8655\u7406\u91D1\u878D\u6D88\u8CBB\u722D\u8B70\uFF1F","\u8B49\u5238\u4EA4\u6613\u6CD5\u5C0D\u5167\u7DDA\u4EA4\u6613\u6709\u4EC0\u9EBC\u898F\u7BC4\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5438\u6536\u5B58\u6B3E\u8207\u6388\u4FE1\u6709\u54EA\u4E9B\u9650\u5236\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5F9E\u696D\u4EBA\u54E1\u6709\u90A3\u4E9B\u898F\u5B9A\uFF1F","\u4FDD\u96AA\u6CD5\u5C0D\u65BC\u696D\u52D9\u54E1\u4E0D\u7576\u62DB\u652C\u7684\u8CAC\u4EFB\u898F\u5B9A\uFF1F","\u9280\u884C\u6CD5\u6709\u591A\u5C11\u689D\u6587\uFF1F","\u8B49\u5238\u71DF\u696D\u54E1\u5E38\u89F8\u72AF\u4EC0\u9EBC\u6CD5\u898F\u6216\u547D\u4EE4\uFF1F","\u6709\u54EA\u4E9B\u6CD5\u898F\u662F\u548C\u58FD\u96AA\u53CA\u7522\u96AA\u76F8\u95DC\u7684\uFF1F"];function Kl(){return`<div class="answer-placeholder">
    <span class="empty-icon">${f("sparkles",26)}</span>
    <h2 class="empty-title">\u7B54\u6848\u53EA\u6703\u4F86\u81EA\u6AA2\u7D22\u5230\u7684\u5224\u6C7A\u53CA\u6CD5\u898F\u7247\u6BB5</h2>
    <p class="empty-text">\u9001\u51FA\u554F\u984C\u5F8C\uFF0C\u7CFB\u7D71\u6703\u5148\u4EE5 Qdrant \u6AA2\u7D22\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\u4E26\u6A19\u793A\u5F15\u7528\u7DE8\u865F\u3002
      \u82E5\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u660E\u78BA\u986F\u793A\u964D\u7D1A\u72C0\u614B\uFF0C\u4E0D\u6703\u6191\u7A7A\u751F\u6210\u7B54\u6848\u3002</p>
  </div>`}function wn(){return`<section class="card answer-card rag-empty-answer">${Kl()}</section>`}function ni(e,t){return`<div class="rag-turn">
    <div class="rag-user-bubble">${r(e)}</div>
    <section class="card rag-assistant-turn" data-rag-answer>${t}</section>
  </div>`}function Yl(e,t){return Promise.race([e,new Promise((s,a)=>{window.setTimeout(()=>a(new Error("pipeline lookup timed out")),t)})])}async function Xl(e){if(!e||e.pipeline_flow)return e;let t=String(e._client_request_id||e.request_id||"").trim();if(!t)return e;for(let s=0;s<3;s+=1){try{let a=await Yl(Q.performance({keyword:t},1,5),1800),n=(Array.isArray(a.rows)?a.rows:[]).find(i=>String(i.request_id||"")===t&&i.flow&&typeof i.flow=="object");if(n)return e.pipeline_flow=n.flow,e}catch{}s<2&&await new Promise(a=>window.setTimeout(a,250))}return e}function Zl(e){return{status:e.status,answer:e.answer,answer_source:e.answer_source,notice:e.notice,citations:Array.isArray(e.citations)?e.citations:[],judgments:Array.isArray(e.judgments)?e.judgments:[],law_sources:Array.isArray(e.law_sources)?e.law_sources:[],matched_terms:Array.isArray(e.matched_terms)?e.matched_terms:[],law_answer:e.law_answer,law_framework:e.law_framework,llm_model:e.llm_model,embedding_model:e.embedding_model,duration_ms:e.duration_ms,show_sources:e.show_sources,pipeline_flow:e.pipeline_flow||null,test_run:e.test_run||null,partial:!1,streaming:!1}}var ec={"http.request":"FastAPI \u63A5\u6536\u8ACB\u6C42","http.response":"\u56DE\u50B3\u7D50\u679C\u7D66\u524D\u7AEF","rag.answer_question":"RAG \u4E3B\u6D41\u7A0B","rag.coverage":"PostgreSQL \u7D22\u5F15\u8986\u84CB\u6AA2\u67E5","rag.law_retrieval":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22","rag.law_lookup":"\u6BD4\u5C0D\u554F\u984C\u4E2D\u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u540D\u7A31","rag.law_content":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u689D\u6587","rag.qdrant_precheck":"Qdrant collection \u6AA2\u67E5","rag.search":"RAG \u6AA2\u7D22","rag.embed_query":"Ollama embedding \u67E5\u8A62\u5411\u91CF","rag.qdrant_search":"Qdrant \u5411\u91CF\u641C\u5C0B","rag.fetch_documents":"PostgreSQL \u8B80\u53D6\u5224\u6C7A","rag.postgres_fetch":"PostgreSQL \u5224\u6C7A\u67E5\u8A62","rag.build_citations":"\u6574\u7406\u5F15\u7528\u8207\u5224\u6C7A\u7247\u6BB5","rag.extract_excerpt":"\u64F7\u53D6\u76F8\u95DC\u7247\u6BB5","rag.llm":"LLM \u56DE\u7B54\u751F\u6210","rag.llm_request":"Ollama LLM \u751F\u6210","rag.validate_citations":"\u9A57\u8B49\u5F15\u7528\u7DE8\u865F","rag.test_mode":"\u6E2C\u8A66\u6A21\u5F0F\u591A\u6A21\u578B\u6D41\u7A0B","rag.preview_fallback":"\u6CD5\u898F\u9810\u89BD\u964D\u7D1A"};function tc(e){let t=String(e?.name||""),s=e?.params||{},a=String(s.model||s.embedding_model||"").trim();return t==="rag.llm_request"?`Ollama run ${a||"LLM"}`:t==="rag.llm"?`LLM \u56DE\u7B54\u751F\u6210${a?` \xB7 ${a}`:""}`:t==="rag.embed_query"?`Ollama embedding \u67E5\u8A62\u5411\u91CF${a?` \xB7 ${a}`:""}`:ec[t]||t||"backend step"}function ri(e){return[e?.module,e?.function,e?.name].filter(Boolean).join(" \xB7 ")}function ii(e){let t=Number(e);return Number.isFinite(t)?`${d(Math.max(0,Math.round(t)))} ms`:"\u2014"}function _n(e,t){if(!e)return;e.classList.toggle("is-open",t);let s=e.querySelector("#rag-process-body"),a=e.querySelector(".rag-process-toggle");s&&(s.hidden=!t),a&&(a.setAttribute("aria-expanded",String(t)),a.title=t?"\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B":"\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B")}function sc(){return`<div class="rag-process is-open" id="rag-process">
    <div class="rag-process-control">
      <button type="button" class="rag-process-toggle" id="rag-process-toggle"
        aria-expanded="true" aria-controls="rag-process-body" title="\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B">
        <span class="rag-process-toggle-label-collapsed">\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B</span>
        <span class="rag-process-toggle-label-expanded">\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B</span>
        ${f("chevronDown",11)}
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
  </div>`}function ac(e){let t=e.querySelector("#rag-process"),s=t?.querySelector("#rag-process-list"),a=t?.querySelector("#rag-process-summary"),n=performance.now(),i=new Map,o=new Map,l=(g,m,w)=>{let S=g.querySelector(m);S&&(S.textContent=w)},u=g=>{if(g.failed){l(g.element,".rag-process-meta","\u5931\u6557");return}if(g.hasChildren){l(g.element,".rag-process-meta","");return}l(g.element,".rag-process-meta",ii(g.durationMs))},c=g=>{let m=g-1,w=[...i.values()].reverse();for(let S of w){if(m<0)break;S.depth<=m&&(S.hasChildren||(S.hasChildren=!0,S.element.dataset.hasChildren="true",S.finished&&u(S)),m=S.depth-1)}},p=g=>{if(!s)return null;let m=String(g?.seq??`step-${i.size+1}`),w=i.get(m);if(!w){let S=Math.max(0,Math.min(6,Number(g?.depth)||0));c(S);let M=document.createElement("div");M.className="rag-process-item is-running",M.dataset.processKey=m,M.style.setProperty("--depth",String(S)),M.innerHTML=`<span class="rag-process-dot"></span>
        <span class="rag-process-label"></span>
        <span class="rag-process-meta">\u57F7\u884C\u4E2D\u2026</span>`,s.appendChild(M),w={element:M,depth:S,hasChildren:!1,finished:!1,failed:!1,durationMs:0},i.set(m,w)}return l(w.element,".rag-process-label",tc(g)),w.element.title=ri(g),w};return{step:g=>{let m=g?.segment;if(!m)return;o.set(String(m.seq??m.name??o.size),{...m});let w=p(m);if(w){if(g.type==="segment_start"){w.element.classList.add("is-running"),l(w.element,".rag-process-meta","\u57F7\u884C\u4E2D\u2026");return}if(g.type==="segment_end"){let S=m.status==="error";w.element.classList.remove("is-running"),w.element.classList.toggle("is-error",S),w.finished=!0,w.failed=S,w.durationMs=Number(m.duration_ms)||0,u(w),w.element.title=[ri(m),S&&m.error||""].filter(Boolean).join(" \xB7 ")}}},finish:(g=!0)=>{if(!t)return"";t.querySelectorAll(".rag-process-item.is-running").forEach(M=>{M.classList.remove("is-running");let j=M.dataset.hasChildren==="true";l(M,".rag-process-meta",j?"":g?"\u5B8C\u6210":"\u4E2D\u65B7")});let m=s?.children.length||i.size,w=ii(Math.max(0,performance.now()-n));a&&(a.textContent=g?`\u5B8C\u6210 \xB7 ${m} \u6B65 \xB7 ${w}`:`\u5931\u6557 \xB7 ${m} \u6B65`);let S=[...o.values()].filter(M=>M?.name).sort((M,j)=>Number(M.offset_ms||0)-Number(j.offset_ms||0));if(s&&S.length){let M=Math.max(1,...S.map(j=>Number(j.end_offset_ms)||(Number(j.offset_ms)||0)+(Number(j.duration_ms)||0)));s.classList.add("is-waterfall"),s.innerHTML=_s(wa(S),M,"\u5F8C\u7AEF Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B span \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u53C3\u6578\u3001module\uFF0Ffunction\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u932F\u8AA4\u3002")}return t.classList.add("is-complete"),_n(t,!1),t.outerHTML},collapse:()=>_n(t,!1)}}function nc(e,t=!1){let s=t?"\u6E2C\u8A66\u6A21\u5F0F\uFF1A\u6B63\u5728\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207 LLM \u6A21\u578B\uFF0C\u53EF\u80FD\u9700\u8981\u6578\u5206\u9418\u2026":"\u6B63\u5728\u4EE5\u5411\u91CF\u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\u7247\u6BB5\u4E26\u751F\u6210\u56DE\u7B54\uFF1B\u5FEB\u901F\u6A21\u5F0F\u901A\u5E38 2\u201310 \u79D2\u2026";return`<div class="answer-head">
      <div class="answer-head-left">${f("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u4E2D</span>
      </div>
      <div class="answer-head-meta"><span class="spinner"></span></div>
      ${t?"":sc()}
    </div>
    <div class="answer-body">
      <p class="answer-text">${s}\u300C${r(e)}\u300D</p>
      <div class="skeleton skeleton-line" style="margin-top:22px;width:92%"></div>
      <div class="skeleton skeleton-line" style="width:76%"></div>
      <div class="skeleton skeleton-line" style="width:84%"></div>
    </div>`}function oi(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function ka(e,{lawKey:t="",sourceType:s="",label:a=""}={}){let n=String(e||"").trim();return n?`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${r(t||n)}"
    data-source-type="${r(s||"")}"
    title="\u9EDE\u64CA\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587">${r(a||n)}</button>`:""}function di(e){let t=String(e?.law_name||"").trim(),s=String(e?.article_no||"").replace(/\s+/g,"");if(!t||!s)return"";let a=(Array.isArray(e?.paragraphs)?e.paragraphs:[]).map(i=>String(i||"").trim()).filter(Boolean),n=`${t}${s}${a.join("\u3001")}`;return`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${r(t)}"
    data-source-type=""
    data-article-no="${r(s)}"
    title="\u9EDE\u64CA\u67E5\u770B ${r(n)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587">${r(n)}</button>`}function rc(e,t){let s=e.score===null||e.score===void 0?"":`\u76F8\u4F3C\u5EA6 ${Number(e.score).toFixed(4)}`,a=[e.court,e.jdate,s].filter(Boolean).map(c=>`<span>${r(c)}</span>`).join(""),n=(Array.isArray(e.law_citations)?e.law_citations:[]).map(c=>di(c)).filter(Boolean).slice(0,12).join(""),i=n||(Array.isArray(e.matched_laws)?e.matched_laws:[]).slice(0,5).map(c=>ka(c)).join(""),o=n?'<div class="citation-meta"><span>\u5224\u6C7A\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4</span></div>':"",l=e.jid?` data-action="open-parquet-judgment"
        data-jid="${r(e.jid)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A"
        aria-label="\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A ${r(e.jid)}"`:"",u=e.pdf_url?`<a class="citation-link" href="${r(e.pdf_url)}" target="_blank" rel="noopener noreferrer" title="\u958B\u555F\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF">\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF${f("external",11)}</a>`:"";return`<article class="citation">
    <span class="citation-index">[${e.index??t+1}]</span>
    <div class="citation-body">
      <div class="citation-head"${l}>
        <h4 class="citation-name">${r(e.jid||"\u672A\u77E5\u6848\u865F")}</h4>
        <div class="citation-meta">${a||"<span>\u5224\u6C7A metadata</span>"}</div>
        ${e.title?`<div class="citation-meta"><span>\u6848\u7531\uFF1A${r(e.title)}</span></div>`:""}
      </div>
      ${o}
      ${i?`<div class="chips" style="margin-top:8px">${i}</div>`:""}
      ${e.snippet?`<p class="citation-snippet">${r(e.snippet)}</p>`:""}
    </div>
    <div class="citation-links">${u}</div>
  </article>`}function ic(e,t){let s=[e.law_level,e.law_category,e.article_count?`${d(e.article_count)} \u689D`:""].filter(Boolean).map(o=>`<span>${r(o)}</span>`).join(""),a=e.law_url?`<a class="citation-link" href="${r(e.law_url)}" target="_blank" rel="noopener noreferrer">\u4F86\u6E90${f("external",11)}</a>`:"",n=e.law_key||e.law_name||"",i=n?` data-action="open-law-source"
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
  </article>`}function oc(e,t){let s=e.source_label||(e.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),a=e.law_level&&e.law_level!==s?e.law_level:"",n=[`<span class="badge ${e.source_type==="order"?"badge-warn":"badge-info"}">${r(s)}</span>`,a,e.law_category,e.article_count?`${d(e.article_count)} \u689D`:"",e.law_modified_date?`\u7570\u52D5 ${Dt(e.law_modified_date)}`:""].filter(Boolean).map(g=>`<span>${g}</span>`).join(""),i=e.first_promulgation?`<div class="citation-meta"><span>\u6700\u65E9\u5236\u5B9A\uFF1A${r(e.first_promulgation.roc_date)}\uFF08\u897F\u5143 ${r(e.first_promulgation.gregorian_date)}\uFF09</span></div>`:"",o=e.stats,l=o?`<div class="law-source-stats">
        <span>\u63D0\u53CA\u300C${r(o.entity||"")}\u300D\u7684\u5224\u6C7A ${d(o.judgment_count||0)} \u7B46</span>
        <span>\u672C\u6CD5\u898F\u88AB\u5F15\u7528 ${d(o.law_count||0)} \u6B21</span>
      </div>`:"",u=e.law_key||"",c=e.source_type||"",p=(Array.isArray(e.articles)?e.articles:[]).map(g=>{let m=String(g.article_no||"");return`<div class="law-source-article"${u&&m?` data-action="open-law-source"
        data-law-key="${r(u)}"
        data-source-type="${r(c)}"
        data-article-no="${r(m)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u9078\u67E5\u770B ${r(m)} \u7684\u5B8C\u6574\u5167\u5BB9"
        aria-label="\u958B\u555F ${r(e.law_name||"\u6CD5\u898F")} ${r(m)} \u7684\u5B8C\u6574\u689D\u6587"`:""}>
        <span class="law-source-article-no">${r(g.article_no||"\u689D\u6587")}</span>
        <p class="law-source-article-text">${r(g.article_content||"")}</p>
      </div>`}).join(""),$=e.law_url?`<a class="citation-link" href="${r(e.law_url)}" target="_blank" rel="noopener noreferrer">\u6CD5\u898F\u4F86\u6E90${f("external",11)}</a>`:"",v=e.law_key?` data-action="open-law-source"
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
      ${p}
    </div>
    <div class="citation-links">${$}</div>
  </article>`}function lc(e,t=150){let s=String(e||"").replace(/\s+/g," ").trim();return s?s.length>t?`${s.slice(0,t)}\u2026`:s:""}function cc(e,t){return!Array.isArray(e)||!e.length?`<p class="answer-text">${r(t)}</p>`:`<div class="law-answer-list">${e.map(s=>{let a=s.law_key||"",n=s.source_type||"",i=s.law_name||"\u672A\u547D\u540D\u6CD5\u898F",o=s.source_label||(n==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),l=Number(s.article_count||0),u=s.index!=null?`<span class="law-answer-index">[${r(String(s.index))}]</span>`:"",c=a?`<button class="law-answer-law" type="button"
            data-action="open-law-source"
            data-law-key="${r(a)}"
            data-source-type="${r(n)}"
            title="\u9EDE\u64CA\u958B\u555F ${r(i)} \u7684\u5B8C\u6574\u689D\u6587"
            aria-label="\u958B\u555F ${r(i)} \u7684\u5B8C\u6574\u689D\u6587">${r(i)}</button>`:`<strong>${r(i)}</strong>`,p=Array.isArray(s.articles)?s.articles:[],$=p.length?`<div class="law-answer-articles-label">\u76F8\u95DC\u689D\u6587</div>
          <div class="law-answer-articles">${p.map(v=>{let g=String(v.article_no||"").trim(),m=lc(v.article_content);return!a||!g?`<div class="law-answer-article is-static">
                  <span class="law-answer-article-no">${r(g||"\u689D\u6587")}</span>
                  <span class="law-answer-article-text">${r(m)}</span>
                </div>`:`<button class="law-answer-article" type="button"
                data-action="open-law-source"
                data-law-key="${r(a)}"
                data-source-type="${r(n)}"
                data-article-no="${r(g)}"
                title="\u9EDE\u64CA\u67E5\u770B ${r(g)} \u7684\u5B8C\u6574\u5167\u5BB9"
                aria-label="\u958B\u555F ${r(i)} ${r(g)} \u7684\u5B8C\u6574\u689D\u6587">
                <span class="law-answer-article-no">${r(g)}</span>
                <span class="law-answer-article-text">${r(m)}</span>
              </button>`}).join("")}</div>`:"";return`<div class="law-answer-source">
        <div class="law-answer-source-head">
          ${c}
          <span class="law-answer-source-meta">\uFF08${r(o)}\uFF0C${d(l)} \u689D\uFF09</span>
          ${u}
        </div>
        ${$}
      </div>`}).join("")}</div>`}function dc(e,t){if(!Array.isArray(e)||!e.length)return"";let s=new Map((Array.isArray(t)?t:[]).map(a=>[String(a.law_name||""),a]));return`<div class="answer-section-label" style="margin-top:18px">
      <span>\u547D\u4E2D\u8A5E\u5F59</span>
    </div>
    <div class="chips">${e.map(a=>{let n=s.get(String(a));return n?.law_key?ka(a,{lawKey:n.law_key,sourceType:n.source_type||""}):`<span class="chip">${r(a)}</span>`}).join("")}</div>`}function uc(e,t){if(!e)return"";let s=Array.isArray(e.providers)?e.providers:[],a=e.active||s.find(c=>c.active),n=String(e.status||""),i=String(e.model||"").trim(),o=a?`${a.name}:${i}`:n==="not_configured"?"\u672A\u555F\u7528":"\u7121\u53EF\u7528\u6A21\u578B",l=s.map(c=>{let p=c.status==="operational",$=!!c.active||c===a,v=`${c.name||"reranker"}:${i}`,g=$?"\u4F7F\u7528\u4E2D":p?c.role==="fallback"?"fallback":"\u4E3B\u8981":"\u96E2\u7DDA";return`<span class="rag-model-button is-static${$?" is-active":""}${p?"":" is-unavailable"}"
        title="${r(`${v} \xB7 ${c.url||""}`)}"
        aria-label="${r(`${v}\uFF0C${g}`)}">
        <span class="rag-model-state" aria-hidden="true"></span>
        <span>${r(v)}</span>
        <span class="rag-model-current">${r(g)}</span>
      </span>`}).join(""),u=s.length?"":'<p class="rag-model-empty">\u5C1A\u672A\u8A2D\u5B9A reranker URL\u3002</p>';return`<div class="rag-model-strip rag-model-strip-rerank">
    <div class="rag-model-strip-head">
      <span class="rag-model-strip-title">${f("layers",13)} Rerank models</span>
      ${i?`<span class="rag-model-strip-base mono">${r(i)}</span>`:""}
      <span class="rag-model-strip-current">\u76EE\u524D\uFF1A<strong>${r(o)}</strong></span>
      <button class="btn btn-ghost btn-sm rag-model-refresh" type="button"
        data-rag-action="refresh-rerank-models"
        ${t?"disabled":""}>
        ${f("refresh",12)}<span>${t?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u6A21\u578B"}</span>
      </button>
    </div>
    ${l?`<div class="rag-model-buttons">${l}</div>`:u}
    <p class="rag-model-hint">Reranker \u7531 llama.cpp \u63D0\u4F9B\uFF1B\u4E0D\u53EF\u7528\u6642\u6703\u56DE\u9000 Qdrant \u6392\u5E8F\u3002</p>
  </div>`}function _a({tone:e,title:t,text:s,models:a,currentModel:n,currentProviderName:i,baseUrl:o,modelState:l,untestedProviders:u=[],rerank:c=null,rerankRefreshing:p=!1,busy:$,refreshing:v}){let g=e==="ok"?"is-ok":e==="warn"?"is-warn":"is-info",m=e==="ok"?"check":e==="warn"?"alert":"info",w=e==="ok"?"badge-ok":e==="warn"?"badge-warn":"badge-info",S=Array.isArray(a)?a:[],M=[...new Set(S.map(K=>K.providerName).filter(Boolean))],j=n&&i?`${i}:${n}`:n,B=S.map(K=>{let ye=K.model===n&&(!i||K.providerName===i),pe=K.providerName?`${K.providerName}:${K.model}`:K.model;return`<button class="rag-model-button${ye?" is-active":""}" type="button" data-rag-model="${r(K.model)}"
        data-rag-provider="${r(K.hostId===null||K.hostId===void 0?"":String(K.hostId))}"
        title="${r(pe)}"
        aria-pressed="${ye}" ${$||v?"disabled":""}>
        <span class="rag-model-state" aria-hidden="true"></span>
        <span>${r(pe)}</span>
        ${ye?'<span class="rag-model-current">\u4F7F\u7528\u4E2D</span>':""}
      </button>`}).join(""),U=(l?.models||[]).filter(K=>K.status==="untested").length,W=l?U?`\u5C1A\u6709 ${d(U)} \u500B\u6A21\u578B\u672A\u6E2C\u8A66 chat \u80FD\u529B\uFF1B\u6309\u300C\u6AA2\u67E5\u6A21\u578B\u300D\u5F8C\u5373\u53EF\u5207\u63DB\u3002`:"\u76EE\u524D provider \u6C92\u6709\u53EF\u7528\u7684 chat \u6A21\u578B\u3002":"\u7121\u6CD5\u53D6\u5F97\u6A21\u578B\u6E05\u55AE\uFF1B\u8ACB\u78BA\u8A8D Ollama \u670D\u52D9\u662F\u5426\u555F\u52D5\u3002";return`<section class="rag-mode-card ${g}">
    <div class="rag-mode-head">
      <span class="rag-mode-icon" aria-hidden="true">${f(m,14)}</span>
      <div class="rag-mode-copy">
        <strong>${r(t)}</strong>
        <p>${r(s)}</p>
      </div>
      <span class="badge ${w}">${d(S.length)} \u500B chat model${M.length?` \xB7 ${M.length} \u53F0\u4E3B\u6A5F`:""}</span>
    </div>
    <div class="rag-model-strip">
      <div class="rag-model-strip-head">
        <span class="rag-model-strip-title">${f("brain",13)} Chat models</span>
        ${o?`<span class="rag-model-strip-base mono">${r(o)}</span>`:""}
        <span class="rag-model-strip-current">${j?`\u76EE\u524D\uFF1A<strong>${r(j)}</strong>`:"\u5C1A\u672A\u9078\u64C7"}</span>
        <button class="btn btn-ghost btn-sm rag-model-refresh" type="button"
          data-rag-action="refresh-chat-models"
          ${$||v?"disabled":""}>
          ${f("refresh",12)}<span>${v?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u6A21\u578B"}</span>
        </button>
      </div>
      ${B?`<div class="rag-model-buttons">${B}</div>
             <p class="rag-model-hint">\u9EDE\u9078\u6A21\u578B\u5207\u63DB\uFF1B\u5207\u63DB\u5F8C\u5957\u7528\u4E0B\u4E00\u6B21\u63D0\u554F\uFF0C\u4E0D\u5F71\u97FF\u5DF2\u5B8C\u6210\u7684\u56DE\u7B54\u3002</p>`:`<p class="rag-model-empty">${r(W)}</p>`}
      ${u.length?`<p class="rag-model-hint rag-model-untested-hint">${r(u.join("\u3001"))} \u5C1A\u6709\u6A21\u578B\u5C1A\u672A\u6AA2\u67E5 chat \u80FD\u529B\uFF1B\u8ACB\u6309\u300C\u6AA2\u67E5\u6A21\u578B\u300D\u3002</p>`:""}
    </div>
    ${uc(c,p)}
  </section>`}function ui(e){let t=Array.isArray(e.citations)?e.citations:[],s=Array.isArray(e.judgments)?e.judgments:[],a=Array.isArray(e.law_sources)?e.law_sources:[],n=Array.isArray(e.matched_terms)?e.matched_terms:[],i=e.status||"preview",o=!!e.partial,l=!!e.streaming,u=!!e.show_sources||!o,c=e.answer_source==="structured",p=String(e.law_answer||"").trim(),$=e.law_framework||null,v=Array.isArray($?.rows)?$.rows:[],g=Array.isArray($?.sources)?$.sources:[],m=v.length>0,w=!!p&&!c&&!m,S=s.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u5224\u6C7A \xB7 ${s.length} \u7B46</span>
        <span>vector retrieval \xB7 [\u7DE8\u865F] \u5C0D\u61C9\u56DE\u7B54\u5F15\u7528</span>
      </div>
      <div class="citation-list">${s.map((H,ve)=>rc(H,ve)).join("")}</div>`:"",M=a.length&&!w?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4 \xB7 ${a.length} \u7B46</span>
        <span>PostgreSQL metadata \xB7 Parquet \u689D\u6587</span>
      </div>
      <div class="citation-list">${a.map((H,ve)=>oc(H,ve)).join("")}</div>`:"",j=!s.length&&t.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F \xB7 ${t.length} \u7B46</span>
        <span>metadata match</span>
      </div>
      <div class="citation-list">${t.map((H,ve)=>ic(H,ve)).join("")}</div>`:"",B=u?S+M+j:"";!B&&!o&&!w&&!m&&(B=`<div class="answer-divider"></div>
      ${pt({iconName:"file",title:"\u6C92\u6709\u53EF\u5F15\u7528\u7684\u4F86\u6E90",text:i==="retrieval_only"?"\u76EE\u524D\u5DF2\u5EFA\u7ACB\u7684\u5411\u91CF\u7D22\u5F15\u4E2D\u6C92\u6709\u8DB3\u5920\u76F8\u4F3C\u7684\u5224\u6C7A\uFF0C\u4E5F\u6C92\u6709\u53EF\u5C0D\u61C9\u7684\u6CD5\u898F\u6216\u547D\u4EE4\u3002\u7CFB\u7D71\u4E0D\u6703\u5728\u6C92\u6709\u4F86\u6E90\u6642\u751F\u6210\u7B54\u6848\u3002":"\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u4E14\u554F\u984C\u4E2D\u6C92\u6709\u53EF\u76F4\u63A5\u5C0D\u61C9\u7684\u73FE\u884C\u6CD5\u898F\u540D\u7A31\u3002"})}`);let U=dc(n,a),W=e.test_run,K=String(e.llm_model||W?.primary_model||"").trim(),ye=String(e.embedding_model||"").trim(),pe=[K?`LLM\uFF1A${K}`:"",ye?`Embedding\uFF1A${ye}`:""].filter(Boolean).join(" \xB7 "),z=l||e.answer_source==="llm"?"LLM \u7D9C\u5408\u56DE\u7B54":"\u6AA2\u7D22\u7D50\u679C\u6458\u8981",E=m?`<div class="answer-block law-framework-block">
        <div class="answer-block-head">
          <span>${r($.title||"\u76F8\u95DC\u6CD5\u898F\u7684\u8CAC\u4EFB\u67B6\u69CB")}</span>
          <span>${v.length} \u689D</span>
        </div>
        <div class="table-wrap law-framework-table-wrap">
          <table class="data-table is-compact law-framework-table">
            <thead>
              <tr><th scope="col">\u6CD5\u898F</th><th scope="col">\u689D\u6587</th><th scope="col">\u898F\u7BC4\u91CD\u9EDE</th></tr>
            </thead>
            <tbody>
              ${v.map(H=>`<tr>
                    <td>${r(H.law_name||"\u2014")}</td>
                    <td class="cell-number">${r(H.article_no||"\u2014")}</td>
                    <td>${r(H.focus||"\u2014")}</td>
                  </tr>`).join("")}
            </tbody>
          </table>
        </div>
        ${g.length?`<div class="law-framework-sources">
                <span>\u6CD5\u898F\u4F86\u6E90</span>
                ${g.map(H=>{let ve=String(H?.law_name||H||"").trim(),je=H&&H.index!==null&&H.index!==void 0?` [${r(H.index)}]`:"";return ka(ve,{label:`${ve}${je}`})}).join("")}
              </div>`:""}
      </div>`:"",x=e.answer_source==="llm"&&K?`<span class="answer-model" title="${r(pe)}">${f("brain",11)}${r(K)}</span>`:c?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${f("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"",C=l?`${K||"LLM"} \xB7 \u751F\u6210\u4E2D`:x?K||"structured":"retrieval",se=W?`<div class="test-run-summary">
        <div class="test-run-summary-head">
          <span class="badge badge-warn">\u6E2C\u8A66\u6A21\u5F0F</span>
          ${Ve(W.status)}
          <span class="mono">${r(W.run_id||"")}</span>
        </div>
        <div class="test-run-summary-body">
          <span>Embedding ${Number(W.models?.embedding?.length||0)} \u500B</span>
          <span>LLM ${Number(W.models?.llm?.length||0)} \u500B</span>
          <span>\u4E3B\u56DE\u7B54 ${r(W.primary_model||"\u2014")}</span>
          <span>${Number(W.total_ms||0)} ms</span>
          <a href="#/performance">\u67E5\u770B\u6E2C\u8A66 Flow</a>
        </div>
      </div>`:"",me=e.pipeline_flow&&typeof e.pipeline_flow=="object"?e.pipeline_flow:null,V=!o&&me?ya(me,{serverDurationMs:Number(e.duration_ms)||0,embedded:!0}):"",ae=String(e.answer||"").trim()||(l?"\u6B63\u5728\u751F\u6210\u56DE\u7B54\u2026":o?"\u6B63\u5728\u6AA2\u7D22\u5224\u6C7A\u4E26\u751F\u6210 LLM \u56DE\u7B54\u2026":"\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u56DE\u7B54\u3002"),ee=l?" data-partial-answer":"",ke=l?" is-streaming":"";return`${E}
      ${w?`<div class="answer-block law-answer-block">
              <div class="answer-block-head">
                <span>\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22\u7D50\u679C</span>
                <span>${o&&!u?"\u6CD5\u898F\u8CC7\u6599\u5EAB":`${a.length} \u7B46\u4F86\u6E90`}</span>
              </div>
              <div class="law-answer-content">${cc(a,p)}</div>
            </div>`:""}
      <div class="answer-block">
        ${w||m?`<div class="answer-block-head">
                <span>${r(z)}</span>
                <span>${r(C)}</span>
              </div>`:""}
        <p class="answer-text${ke}"${ee}>${r(ae)}</p>
      </div>
      ${e.notice?`<div class="answer-notice">${r(e.notice)}</div>`:""}
      ${se}
      ${U}
      ${B}
      ${V}`}function li(e,t,s=""){let a=t.status||"preview",n=a==="operational"?"\u5B8C\u6210":a==="retrieval_only"?"\u50C5\u6AA2\u7D22\u7D50\u679C":a==="preview"?"\u6CD5\u898F\u9810\u89BD":a==="unavailable"||a==="not_configured"?"\u8CC7\u6599\u4E0D\u53EF\u7528":a==="degraded"?"\u964D\u7D1A":"\u5B8C\u6210",i=t.test_run,o=String(t.llm_model||i?.primary_model||"").trim(),l=String(t.embedding_model||"").trim(),u=[o?`LLM\uFF1A${o}`:"",l?`Embedding\uFF1A${l}`:""].filter(Boolean).join(" \xB7 "),c=t.answer_source==="structured",p=t.answer_source==="llm"&&o?`<span class="answer-model" title="${r(u)}">${f("brain",11)}${r(o)}</span>`:c?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${f("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"";return`<div class="answer-head">
      <div class="answer-head-left">${f("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u7D50\u679C</span>
      </div>
      <div class="answer-head-meta">
        ${Ve(a,n)}
        <span>${Number(t.duration_ms||0)} ms</span>
        ${p}
      </div>
      ${s}
    </div>
    <div class="answer-body">${ui(t)}</div>`}function pc(e,t=""){return`<div class="answer-head">
      <div class="answer-head-left">${f("alert",16)}
        <span class="answer-head-title">\u7121\u6CD5\u5B8C\u6210\u6AA2\u7D22</span>
      </div>
      ${t}
    </div>
    <div class="answer-body">
      ${Ie({tone:"danger",title:"\u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
    </div>`}function mc(e){let t=Array.isArray(e.turns)?e.turns:[],s=t.length?t[t.length-1].payload||{}:e.payload||{},a=Array.isArray(s.citations)?s.citations.length:0,n=Array.isArray(s.judgments)?s.judgments.length:0,i=Array.isArray(s.law_sources)?s.law_sources.length:0;return a+n+i}function gc(e,t,s,a=null){let n=e.id??s,i=mc(e),o=t.get(String(e.project_id||"")),l=Array.isArray(e.turns)?e.turns:[],u=e.updated_at||e.created_at,c=a!=null&&String(a)===String(n);return`<div class="rag-history-item${e.pinned?" is-pinned":""}${c?" is-active":""}">
    <button class="rag-history-open" type="button" data-history-open data-history-id="${r(String(n))}">
      <span class="history-question">${r(e.title||"\u672A\u547D\u540D\u63D0\u554F")}</span>
      <span class="history-meta">
        <span>${r(js(u))}</span>
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
        aria-pressed="${e.pinned?"true":"false"}">${f("pin",14)}</button>
      <button class="rag-history-more" type="button"
        data-rag-action="open-history-menu" data-history-id="${r(String(n))}"
        title="\u66F4\u591A\u64CD\u4F5C" aria-label="\u66F4\u591A\u64CD\u4F5C" aria-haspopup="menu" aria-expanded="false">${f("more",14)}</button>
    </div>
  </div>`}function ci(e,t,s){let a=new Map;for(let i of t){let o=String(i.project_id||"");o&&a.set(o,(a.get(o)||0)+1)}let n=[`<button class="rag-project${s?"":" is-active"}" type="button" data-rag-action="select-project" data-project-id="" aria-pressed="${s?"false":"true"}">
      <span class="rag-project-name">${f("grid",13)}<span>\u5168\u90E8</span></span>
      <span class="rag-project-count">${t.length}</span>
    </button>`];for(let i of e){let o=String(i.id),l=a.get(o)||0;n.push(`<button class="rag-project${s===o?" is-active":""}" type="button" data-rag-action="select-project" data-project-id="${r(o)}" aria-pressed="${s===o?"true":"false"}">
      <span class="rag-project-name">${f("folder",13)}<span>${r(i.name)}</span></span>
      <span class="rag-project-count">${l}</span>
    </button>`)}return e.length||n.push('<div class="rag-library-empty">\u5C1A\u672A\u5EFA\u7ACB\u5C08\u6848\u3002</div>'),n.push(`<div class="rag-project-add-wrap">
    <button class="rag-project-add" type="button" data-rag-action="show-project-form">${f("plus",13)}<span>\u5EFA\u7ACB\u5C08\u6848</span></button>
    <form class="rag-project-form" data-rag-form="project" hidden>
      <input class="input" type="text" name="project_name" maxlength="60" placeholder="\u5C08\u6848\u540D\u7A31" aria-label="\u5C08\u6848\u540D\u7A31" autocomplete="off" />
      <div class="rag-project-form-actions">
        <button class="btn btn-primary btn-sm" type="submit">\u5EFA\u7ACB</button>
        <button class="btn btn-ghost btn-sm" type="button" data-rag-action="cancel-project">\u53D6\u6D88</button>
      </div>
    </form>
  </div>`),n.join("")}async function fc(e){let t=!1,s=[],a=!1,n=[],i=!1,o="",l=8,u="",c=0,p=null,$=[],v=!1,g=!1,m={embedding:[],llm:[]},w=null,S=null,M=null,j=!1,B=!1,U=!1;e.innerHTML=`<section class="page rag-page">
    <div class="rag-layout">
      <aside class="rag-library" aria-label="\u5C0D\u8A71\u5EAB">
        <button class="rag-new-chat" type="button" data-rag-action="new-chat">
          <span class="rag-new-chat-mark">${f("plus",16)}</span>
          <span class="rag-new-chat-copy"><strong>\u65B0\u5C0D\u8A71</strong><small>\u958B\u59CB\u65B0\u7684\u6CD5\u5F8B\u6AA2\u7D22</small></span>
        </button>
        <div class="rag-library-context" id="rag-library-context" hidden></div>
        <section class="rag-library-section" data-rag-section="pinned">
          <button class="rag-library-head" type="button" data-rag-toggle="pinned" aria-expanded="true">
            <span class="rag-library-title">${f("pin",13)}\u5DF2\u91D8\u9078</span>
            <span class="rag-library-count" id="rag-pinned-count">0</span>
            ${f("chevronDown",12,"rag-library-chevron")}
          </button>
          <div class="rag-library-body" id="rag-pinned-body">
            <div class="rag-library-empty">\u5C1A\u7121\u91D8\u9078\u9805\u76EE\u3002</div>
          </div>
        </section>
        <section class="rag-library-section" data-rag-section="projects">
          <button class="rag-library-head" type="button" data-rag-toggle="projects" aria-expanded="true">
            <span class="rag-library-title">${f("folder",13)}\u5C08\u6848</span>
            <span class="rag-library-count" id="rag-projects-count">0</span>
            ${f("chevronDown",12,"rag-library-chevron")}
          </button>
          <div class="rag-library-body" id="rag-projects-body"></div>
        </section>
        <section class="rag-library-section rag-library-recent">
          <div class="rag-library-head is-static">
            <span class="rag-library-title">${f("history",13)}\u6700\u8FD1\u9805\u76EE <span class="rag-library-count" id="rag-recent-count">0</span></span>
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
      <div id="rag-mode-notice">${Ie({tone:"info",title:"RAG \u670D\u52D9\u72C0\u614B\u6AA2\u67E5\u4E2D",text:"\u6B63\u5728\u78BA\u8A8D Qdrant\u3001Embedding \u8207 LLM \u72C0\u614B\uFF1B\u6240\u6709\u56DE\u7B54\u90FD\u6703\u6A19\u793A\u53EF\u56DE\u6EAF\u7684\u4F86\u6E90\u3002"})}</div>
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
            ${f("sparkles",16)}<span>\u958B\u59CB\u6AA2\u7D22</span>
          </button>
        </div>
      </form>
      <div class="example-chips" id="example-chips" aria-label="\u7BC4\u4F8B\u554F\u984C">
        ${Wl.map(b=>`<button class="example-chip" type="button" data-question="${r(b)}">${r(b)}</button>`).join("")}
      </div>
    </header>

    <section class="rag-conversation" id="rag-conversation" aria-live="polite">
      <div class="rag-turns" id="rag-turns">
        ${wn()}
      </div>
      <form class="rag-followup" id="rag-followup-form" hidden>
        <label class="sr-only" for="rag-followup-question">\u7E7C\u7E8C\u63D0\u554F</label>
        <textarea class="rag-followup-input" id="rag-followup-question" name="question" rows="1"
          maxlength="500" placeholder="\u7E7C\u7E8C\u554F\u4E0B\u4E00\u500B\u554F\u984C\u2026" aria-label="\u7E7C\u7E8C\u63D0\u554F"></textarea>
        <div class="rag-followup-actions">
          <span class="rag-followup-hint"><kbd>Enter</kbd> \u9001\u51FA \xB7 <kbd>Shift</kbd> + <kbd>Enter</kbd> \u63DB\u884C</span>
          <button class="btn btn-primary" type="submit" id="rag-followup-submit">
            ${f("sparkles",15)}<span>\u7E7C\u7E8C\u6AA2\u7D22</span>
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
  </section>`;let W=e.querySelector("#rag-form"),K=e.querySelector("#rag-question"),ye=e.querySelector("#rag-submit"),pe=e.querySelector(".rag-page"),z=e.querySelector("#rag-turns"),E=e.querySelector("#rag-followup-form"),x=e.querySelector("#rag-followup-question"),C=e.querySelector("#rag-followup-submit"),se=e.querySelector("#rag-history"),me=e.querySelector("#rag-storage-note"),V=e.querySelector("#rag-clear-history"),Y=e.querySelector(".rag-library"),ae=e.querySelector("#rag-pinned-body"),ee=e.querySelector("#rag-projects-body"),ke=e.querySelector("#rag-pinned-count"),H=e.querySelector("#rag-projects-count"),ve=e.querySelector("#rag-recent-count"),je=e.querySelector("#rag-library-context"),xe=e.querySelector("#rag-test-mode"),at=e.querySelector("#rag-test-flow"),De=e.querySelector("#rag-history-menu"),Fe=e.querySelector("#rag-judgment-dialog"),Ae=e.querySelector("#rag-law-dialog"),Ue=()=>{document.documentElement.classList.toggle("dialog-open",!!e.querySelector("dialog[open]"))};Fe?.addEventListener("close",Ue),Ae?.addEventListener("close",Ue);let We=null,lt=null,R,O=null,y=null,A=()=>{K.style.height="auto",K.style.height=`${Math.min(K.scrollHeight,220)}px`},G=()=>{x.style.height="auto",x.style.height=`${Math.min(x.scrollHeight,160)}px`},F=b=>{v=!!b,pe.classList.toggle("has-conversation",v)},Ce=()=>{v&&(E.hidden=!1,G())},Ne=()=>{E.hidden=!0},Pe=()=>{De.hidden&&!y||(De.hidden=!0,De.innerHTML="",y&&y.setAttribute("aria-expanded","false"),O=null,y=null)},nt=(b,T)=>{let D=z.querySelector(".rag-empty-answer");D&&D.remove(),z.insertAdjacentHTML("beforeend",ni(b,T));let Z=z.lastElementChild,ce=Z?.querySelector("[data-rag-answer]");return window.requestAnimationFrame(()=>{Z?.scrollIntoView({behavior:"smooth",block:"start"})}),{turnElement:Z,answerElement:ce}},it=()=>{z.innerHTML=$.length?$.map(b=>ni(b.question,li(b.question,b.payload||{},""))).join(""):wn()},rt=b=>{let T=Array.isArray(b.turns)?b.turns:[];return T.length?(c+=1,Bt(),jt(null),p=b.id??null,$=T.map(D=>({...D})),u=$[$.length-1]?.question||"",F(!0),it(),Ce(),Ge(),Me(ye,!1),Me(C,!1),window.setTimeout(()=>{E.scrollIntoView({behavior:"smooth",block:"end"})},50),!0):!1},Ge=()=>{if(t)return;if(Pe(),!a){se.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',ae.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',ke.textContent="0",ve.textContent="0",i&&(ee.innerHTML=ci(n,[],o));return}let b=n.find(Ee=>String(Ee.id)===o)||null;o&&!b&&(o="");let T=new Map(n.map(Ee=>[String(Ee.id),Ee])),D=s.filter(Ee=>!!Ee.pinned),Z=s.filter(Ee=>!Ee.pinned),ce=o?Z.filter(Ee=>String(Ee.project_id||"")===o):Z,_e=ce.slice(0,l),He=(Ee,ot)=>gc(Ee,T,ot,p);ae.innerHTML=D.length?D.map(He).join(""):'<div class="rag-library-empty">\u5C1A\u7121\u91D8\u9078\u9805\u76EE\u3002\u5C07\u6700\u8FD1\u9805\u76EE\u91D8\u9078\u5F8C\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</div>',ee.innerHTML=ci(n,s,o),se.innerHTML=_e.length?_e.map(He).join(""):`<div class="rag-library-empty">${o?"\u9019\u500B\u5C08\u6848\u9084\u6C92\u6709\u672A\u91D8\u9078\u7684\u9805\u76EE\u3002":D.length?"\u6700\u8FD1\u7684\u9805\u76EE\u90FD\u5DF2\u91D8\u9078\u3002":"\u5C1A\u7121\u63D0\u554F\u7D00\u9304\u3002\u9001\u51FA\u7B2C\u4E00\u500B\u554F\u984C\u5F8C\u6703\u4FDD\u5B58\u5728\u6B64\u700F\u89BD\u5668\u3002"}</div>`,ce.length>l&&se.insertAdjacentHTML("beforeend",`<button class="rag-library-more" type="button" data-rag-action="more-recent">\u986F\u793A\u66F4\u591A \xB7 ${d(ce.length-l)} \u7B46</button>`),ke.textContent=String(D.length),H.textContent=String(n.length),ve.textContent=String(ce.length),b?(je.hidden=!1,je.innerHTML=`<span>${f("folder",12)}<strong>${r(b.name)}</strong></span><button type="button" data-rag-action="clear-project" title="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE" aria-label="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE">${f("x",12)}</button>`):(je.hidden=!0,je.innerHTML="")},Mt=async()=>{try{let b=await ns("rag.projects",[]);n=Array.isArray(b)?b.map(T=>({id:String(T?.id||""),name:String(T?.name||"").trim()})).filter(T=>T.id&&T.name):[]}catch{n=[]}i=!0,t||Ge()},et=b=>{o=String(b||""),l=8,Ge()},Ke=()=>{let b=ee.querySelector('[data-rag-form="project"]');b&&(b.hidden=!1,b.querySelector("input")?.focus())},Rt=()=>{let b=ee.querySelector('[data-rag-form="project"]');b&&(b.hidden=!0,b.reset())},te=async b=>{let T=b.elements.project_name,D=String(T?.value||"").trim();if(!D){N("\u8ACB\u8F38\u5165\u5C08\u6848\u540D\u7A31\u3002","warn"),T?.focus();return}if(n.some(ce=>ce.name.toLowerCase()===D.toLowerCase())){N("\u5DF2\u6709\u540C\u540D\u5C08\u6848\u3002","warn"),T?.focus();return}let Z=typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():`project-${Date.now()}-${Math.random().toString(16).slice(2)}`;n=[...n,{id:Z,name:D.slice(0,60),created_at:new Date().toISOString()}],o=Z,l=8,await Bs("rag.projects",n),Ge(),N(`\u5DF2\u5EFA\u7ACB\u5C08\u6848\u300C${D}\u300D\u3002`,"ok")},$e=async b=>{let T=s.find(ce=>String(ce.id)===String(b));if(!T)return;let D=!T.pinned;if(!await Is(T.id,{pinned:D})){N("\u7121\u6CD5\u66F4\u65B0\u91D8\u9078\u72C0\u614B\u3002","danger");return}T.pinned=D,Ge(),N(D?"\u5DF2\u91D8\u9078\u9805\u76EE\u3002":"\u5DF2\u53D6\u6D88\u91D8\u9078\u3002","ok")},Qe=()=>{c+=1,Bt(),jt(null),u="",p=null,$=[],F(!1),Ne(),z.innerHTML=wn(),K.value="",A(),x.value="",G(),Me(ye,!1),Me(C,!1),Ge(),Fe?.open&&Fe.close(),Ae?.open&&Ae.close(),K.focus(),window.scrollTo({top:0,behavior:"smooth"})},Ye=b=>{if(!b||De.hidden)return;let T=b.getBoundingClientRect(),D=De.getBoundingClientRect(),Z=6,ce=T.bottom+Z;ce+D.height>window.innerHeight-8&&(ce=Math.max(8,T.top-D.height-Z));let _e=T.right-D.width;_e=Math.max(8,Math.min(_e,window.innerWidth-D.width-8)),De.style.left=`${Math.round(_e)}px`,De.style.top=`${Math.round(ce)}px`},Ct=b=>{De.innerHTML=`
      <button type="button" role="menuitem" data-menu-action="rename">${f("edit",13)}<span>\u91CD\u65B0\u547D\u540D</span></button>
      <button type="button" role="menuitem" data-menu-action="toggle-pin">${f("pin",13)}<span>${b.pinned?"\u53D6\u6D88\u91D8\u9078":"\u91D8\u9078"}</span></button>
      <button type="button" role="menuitem" data-menu-action="share">${f("link",13)}<span>\u5206\u4EAB</span></button>
      <button type="button" role="menuitem" data-menu-action="move">${f("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></button>
      <div class="rag-history-menu-divider"></div>
      <button class="is-danger" type="button" role="menuitem" data-menu-action="delete">${f("trash",13)}<span>\u522A\u9664</span></button>`},Lt=b=>{let T=String(b.project_id||""),D=[{id:"",name:"\u672A\u5206\u985E"},...n.map(Z=>({id:String(Z.id),name:Z.name}))];De.innerHTML=`
      <div class="rag-history-menu-head">${f("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></div>
      ${D.map(Z=>`<button type="button" role="menuitem"
            data-menu-action="assign-project" data-project-id="${r(Z.id)}">
            <span class="rag-history-menu-check">${T===Z.id?f("check",12):""}</span>
            <span>${r(Z.name)}</span>
          </button>`).join("")}
      ${n.length?"":'<div class="rag-history-menu-note">\u5C1A\u672A\u5EFA\u7ACB\u5C08\u6848\uFF0C\u53EF\u5148\u5F9E\u5DE6\u5074\u5EFA\u7ACB\u3002</div>'}
      <div class="rag-history-menu-divider"></div>
      <button type="button" role="menuitem" data-menu-action="back">${f("chevronLeft",13)}<span>\u8FD4\u56DE</span></button>`},Vt=(b,T)=>{let D=s.find(Z=>String(Z.id)===String(T));D&&(Pe(),O=String(D.id),y=b,Ct(D),De.hidden=!1,b.setAttribute("aria-expanded","true"),Ye(b))},k=async b=>{let T=window.prompt("\u91CD\u65B0\u547D\u540D\u5C0D\u8A71",b.title||"");if(T===null)return;let D=T.trim();if(!D){N("\u540D\u7A31\u4E0D\u80FD\u7A7A\u767D\u3002","warn");return}if(D===b.title)return;if(!await Is(b.id,{title:D})){N("\u91CD\u65B0\u547D\u540D\u5931\u6557\u3002","danger");return}b.title=D,Ge(),N("\u5C0D\u8A71\u5DF2\u91CD\u65B0\u547D\u540D\u3002","ok")},q=async b=>{let T=Array.isArray(b.turns)?b.turns:[],D=[`# ${b.title||"\u672A\u547D\u540D\u5C0D\u8A71"}`,""];if(T.length)for(let ce of T){D.push("## \u554F\u984C","",ce.question||"",""),D.push("## \u56DE\u7B54","",ce.payload?.answer||"\uFF08\u6C92\u6709\u56DE\u7B54\u5167\u5BB9\uFF09","");let _e=Array.isArray(ce.payload?.law_sources)?ce.payload.law_sources.map(He=>He.law_name).filter(Boolean):[];_e.length&&D.push(`\u5F15\u7528\uFF1A${[...new Set(_e)].join("\u3001")}`,"")}else D.push(b.title||"");let Z=await fs(D.join(`
`));N(Z?"\u5C0D\u8A71\u5167\u5BB9\u5DF2\u8907\u88FD\uFF0C\u53EF\u76F4\u63A5\u8CBC\u4E0A\u5206\u4EAB\u3002":"\u7121\u6CD5\u8907\u88FD\u5C0D\u8A71\u5167\u5BB9\u3002",Z?"ok":"warn")},L=async b=>{if(!window.confirm(`\u522A\u9664\u5C0D\u8A71\u300C${b.title||"\u672A\u547D\u540D\u5C0D\u8A71"}\u300D\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002`))return;if(!await mr(b.id)){N("\u522A\u9664\u5931\u6557\u3002","danger");return}let D=p!==null&&String(p)===String(b.id);s=s.filter(Z=>String(Z.id)!==String(b.id)),D?Qe():Ge(),N("\u5C0D\u8A71\u5DF2\u522A\u9664\u3002","ok")},I=async(b,T)=>{if(!await Is(b.id,{project_id:T})){N("\u79FB\u81F3\u5C08\u6848\u5931\u6557\u3002","danger");return}b.project_id=T;let Z=n.find(ce=>String(ce.id)===String(T));Ge(),N(Z?`\u5DF2\u79FB\u81F3\u5C08\u6848\u300C${Z.name}\u300D\u3002`:"\u5DF2\u79FB\u51FA\u5C08\u6848\u3002","ok")},J=async b=>{let T=b.target.closest("[data-menu-action]");if(!T)return;let D=s.find(ce=>String(ce.id)===O);if(!D){Pe();return}let Z=T.dataset.menuAction;Z==="rename"?(Pe(),await k(D)):Z==="toggle-pin"?(Pe(),await $e(D.id)):Z==="share"?(Pe(),await q(D)):Z==="move"?(Lt(D),Ye(y)):Z==="assign-project"?(Pe(),await I(D,T.dataset.projectId||"")):Z==="back"?(Ct(D),Ye(y)):Z==="delete"&&(Pe(),await L(D))},X=b=>{De.hidden||(typeof b.composedPath=="function"?b.composedPath():[]).includes(De)||De.contains(b.target)||b.target.closest('[data-rag-action="open-history-menu"]')||Pe()},ue=b=>{b.key==="Escape"&&Pe()},Le=b=>{b.target instanceof Node&&De.contains(b.target)||Pe()},Te=async()=>{try{if(s=await oa({limit:120}),t)return;a=!0,Ge(),me.textContent=ia()==="indexeddb"?"\u63D0\u554F\u7D00\u9304\u5132\u5B58\u5728\u700F\u89BD\u5668 IndexedDB\uFF0C\u4E0D\u6703\u4E0A\u50B3\u5230\u4F3A\u670D\u5668\u3002":"\u700F\u89BD\u5668\u5132\u5B58\u4E0D\u53EF\u7528\uFF0C\u63D0\u554F\u7D00\u9304\u53EA\u4FDD\u7559\u5728\u672C\u6B21\u5DE5\u4F5C\u968E\u6BB5\u3002"}catch{if(t)return;s=[],a=!0,Ge(),se.innerHTML='<div class="rag-library-empty">\u7121\u6CD5\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u3002</div>'}},he=async(b,T,D,Z)=>{let ce=$,_e=p;ce.push({question:b,asked_at:new Date().toISOString(),payload:Zl(T)});let He=Array.isArray(T.citations)?T.citations:[],Ee=Array.isArray(T.judgments)?T.judgments:[],ot={question:b,status:T.status,citations:He.map(Be=>Be.law_name),judgments:Ee.map(Be=>Be.jid)},ut=`${T.status||"preview"} \xB7 ${ce.length} \u8F2A`,Oe=new Date().toISOString(),ht=Be=>{Z===c&&(p=Be)};if(_e){if(!await Is(_e,{turns:ce,detail:ut,payload:ot,updated_at:Oe})){let yt=await Ps({kind:"rag",title:ce[0]?.question||b,detail:ut,project_id:D,turns:ce,payload:ot,updated_at:Oe});ht(yt)}}else{let Be=await Ps({kind:"rag",title:ce[0]?.question||b,detail:ut,project_id:D,turns:ce,payload:ot,updated_at:Oe});ht(Be)}await Te()},ze=()=>(w?.services||[]).find(b=>b.id==="llm")||null,Xe=()=>{let b=e.querySelector("#rag-mode-notice");if(!b)return;let T=Array.isArray(S?.providers)?S.providers:[],D=[];for(let Be of T)if(!(!Be||!Array.isArray(Be.chat_models)))for(let yt of Be.chat_models)D.push({model:yt,providerName:String(Be.name||"").trim(),hostId:Be.host_id===null||Be.host_id===void 0?null:Number(Be.host_id)});if(!D.length&&Array.isArray(S?.chat_models)){let Be=String(S?.provider_name||"").trim(),yt=S?.provider?.host_id;for(let Je of S.chat_models)D.push({model:Je,providerName:Be,hostId:yt==null?null:Number(yt)})}let Z=T.filter(Be=>Array.isArray(Be?.models)&&Be.models.length>0&&(!Array.isArray(Be.chat_models)||Be.chat_models.length===0)).map(Be=>String(Be.name||"").trim()).filter(Boolean),ce=String(ze()?.model||"").trim(),_e=String(S?.base_url||"").trim(),He=String(S?.provider_name||"").trim(),Ee=w&&(w.services||[]).find(Be=>Be.id==="reranker")||null;if(!w){if(!M)return;b.innerHTML=_a({tone:"warn",title:"\u7121\u6CD5\u53D6\u5F97 RAG \u670D\u52D9\u72C0\u614B",text:M.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\uFF0C\u6216\u524D\u5F80\u7CFB\u7D71\u72C0\u614B\u9801\u67E5\u770B\u3002",models:D,currentModel:ce,currentProviderName:He,baseUrl:_e,modelState:S,untestedProviders:Z,rerank:Ee,rerankRefreshing:U,busy:j,refreshing:B});return}let ot=w.data||{},ut=(w.services||[]).find(Be=>Be.id==="rag"),Oe=Number(ot.judgment_indexed_count||0),ht=Number(ot.judgment_count||0);ut?.status==="operational"?b.innerHTML=_a({tone:"ok",title:"\u6AA2\u7D22\u8207\u56DE\u7B54\u5C31\u7DD2",text:`Qdrant\u3001Embedding \u8207 LLM \u5747\u53EF\u4F7F\u7528\uFF1B\u76EE\u524D\u7D22\u5F15\u6DB5\u84CB ${d(Oe)} / ${d(ht)} \u7B46\u5224\u6C7A\u3002\u56DE\u7B54\u4E0D\u662F\u6CD5\u5F8B\u610F\u898B\u3002`,models:D,currentModel:ce,currentProviderName:He,baseUrl:_e,modelState:S,untestedProviders:Z,rerank:Ee,rerankRefreshing:U,busy:j,refreshing:B}):ut?.status==="degraded"?b.innerHTML=_a({tone:"warn",title:"\u90E8\u5206 AI \u5143\u4EF6\u672A\u5C31\u7DD2",text:ut.detail||"RAG \u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u6AA2\u7D22\u7D50\u679C\u3002",models:D,currentModel:ce,currentProviderName:He,baseUrl:_e,modelState:S,untestedProviders:Z,rerank:Ee,rerankRefreshing:U,busy:j,refreshing:B}):b.innerHTML=_a({tone:"info",title:"\u5411\u91CF\u7D22\u5F15\u5C1A\u672A\u5C31\u7DD2 \xB7 \u4E0D\u662F\u6CD5\u5F8B\u610F\u898B",text:ut?.detail||"\u8A2D\u5B9A QDRANT_URL\u3001EMBEDDING_URL \u8207 LLM_URL \u4E26\u57F7\u884C judgment-index-vectors \u5F8C\u5373\u53EF\u555F\u7528\u5224\u6C7A\u6AA2\u7D22\u3002",models:D,currentModel:ce,currentProviderName:He,baseUrl:_e,modelState:S,untestedProviders:Z,rerank:Ee,rerankRefreshing:U,busy:j,refreshing:B})},st=async()=>{let[b,T]=await Promise.allSettled([Q.status(),Q.llmModels()]);t||(w=b.status==="fulfilled"?b.value:null,S=T.status==="fulfilled"?T.value:null,M=b.status==="rejected"?b.reason:null,Xe())},qs=async(b,T=null)=>{if(!b||j||B)return;let D=String(ze()?.model||"").trim(),Z=String(S?.provider_name||"").trim(),ce=(S?.providers||[]).find(Ee=>T!==null&&Ee?.host_id!==null&&Ee?.host_id!==void 0&&Number(Ee.host_id)===Number(T)),_e=String(ce?.name||(T===null?Z:"")).trim();if(b===D&&(!T||!_e||_e===Z))return;let He=_e?`${_e}:${b}`:b;j=!0,Xe();try{await Q.selectLlmModel(b,T),N(`\u5DF2\u5207\u63DB chat model\uFF1A${He}`,"ok",3500)}catch(Ee){N(Ee.message||"\u7121\u6CD5\u5207\u63DB chat model\u3002","danger",6e3)}finally{j=!1,t||await st()}},It=async()=>{if(!(B||j)){B=!0,Xe();try{await Q.testLlmModels(),N("\u5DF2\u66F4\u65B0 chat model \u6E05\u55AE\u3002","ok",3500)}catch(b){N(b.message||"\u7121\u6CD5\u6AA2\u67E5 chat model\u3002","danger",6e3)}finally{B=!1,t||await st()}}},Ea=async()=>{if(!U){U=!0,Xe();try{let b=await Q.status();if(t)return;w=b,M=null,N("\u5DF2\u66F4\u65B0 rerank model \u72C0\u614B\u3002","ok",3e3)}catch(b){N(b.message||"\u7121\u6CD5\u6AA2\u67E5 rerank model\u3002","danger",6e3)}finally{U=!1,t||Xe()}}},As=()=>{if(!xe)return;if(!g){xe.innerHTML="";return}let b=Array.isArray(m.embedding)?m.embedding.length:0,T=Array.isArray(m.llm)?m.llm.length:0;xe.innerHTML=Ie({tone:"warn",title:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F",text:`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${b} \u500B embedding \u8207 ${T} \u500B LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002\u6E2C\u8A66 Flow \u6703\u5728\u9801\u9762\u4E0B\u65B9\u5373\u6642\u986F\u793A\uFF0C\u4E5F\u53EF\u5230 <a href="#/tests">\u7CFB\u7D71\u6E2C\u8A66</a> \u6216 <a href="#/performance">\u6548\u80FD\u5831\u8868</a> \u67E5\u770B\u6B77\u53F2\u3002`})},Ra=async()=>{try{let b=await Q.testMode();if(t)return;g=!!b.enabled,m=b.models||{embedding:[],llm:[]},As()}catch{if(t)return;g=!1,As()}},Vs=b=>{g=!!b.detail?.enabled,m=b.detail?.models||{embedding:[],llm:[]},As()};window.addEventListener("judgment:test-mode",Vs);let jt=b=>{if(!at)return;lt=b||null;let T=JSON.stringify(b?{run_id:b.run_id,status:b.status,progress:b.progress,total_ms:b.total_ms,stage:b.stage,answer:b.answer||"",steps:(b.steps||[]).map(D=>`${D.stage}:${D.model}:${D.status}:${D.progress}:${D.duration_ms}`)}:null);T!==R&&(R=T,at.innerHTML=b?ks(b,[],"",{showHistory:!1}):"")},Bt=()=>{We&&(We(),We=null)},Ms=async(b=null)=>{if(!t)try{let T=b||await Q.testRunCurrent();if(t)return;let D=T.run;D&&D.status==="running"&&jt(D)}catch{}},Ls=()=>{t||We||(Ms(),We=kt("test-runs",(b,T)=>Ms(T?.snapshot||null)))},Ws=async b=>{if(!b){jt(null);return}try{let T=await Q.testRun(b);if(t)return;jt(T.run||null)}catch{t||N("\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF0C\u4F46\u7121\u6CD5\u8F09\u5165\u6E2C\u8A66 Flow\u3002","warn")}},h=async()=>{if(g)try{let b=await Q.testRunCurrent();if(t)return;b.run?.status==="running"&&(jt(b.run),Ls())}catch{}},_=0,P=(b,T)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">DB ORIGINAL JUDGMENT</div>
      <h2>${r(b)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-parquet-judgment" aria-label="\u95DC\u9589">${f("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${T}</div>`,de=b=>{let T=(Array.isArray(b.citations)?b.citations:[]).map(He=>di(He)).filter(Boolean).join(""),D=T||(Array.isArray(b.matched_laws)?b.matched_laws:[]).map(He=>ka(He)).join(""),Z=[b.court,b.jdate,b.title?`\u6848\u7531\uFF1A${b.title}`:"",b.full_text_length?`${d(b.full_text_length)} \u5B57`:"",b.citation_count?`\u5F15\u7528 ${d(b.citation_count)} \u7B46`:""].filter(Boolean).map(He=>`<span>${r(He)}</span>`).join(""),ce=b.parquet_generated_at?`DB \u5132\u5B58\u539F\u6587\uFF08\u539F\u59CB Parquet\uFF09\xB7 ${r(String(b.parquet_generated_at).replace("T"," ").slice(0,19))}`:"DB \u5132\u5B58\u539F\u6587",_e=b.pdf_url?`<a class="btn btn-secondary btn-sm" href="${r(b.pdf_url)}" target="_blank" rel="noopener noreferrer">${f("external",13)}<span>\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF</span></a>`:"";return P(b.jid||"\u5224\u6C7A\u5168\u6587",`<div class="judgment-dialog-meta">
        <span class="badge badge-info">${r(b.source==="parquet"?"DB \u5132\u5B58\u539F\u6587":"PostgreSQL")}</span>
        ${Z}
      </div>
      ${T?'<div class="citation-meta" style="margin-top:8px"><span>\u5224\u6C7A\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4</span></div>':""}
      ${D?`<div class="chips" style="margin:8px 0 10px">${D}</div>`:""}
      <div class="judgment-dialog-source">${ce}</div>
      <pre class="judgment-dialog-text">${r(b.full_text||"\u6B64\u5224\u6C7A\u6C92\u6709\u5168\u6587\u3002")}</pre>
      <div class="judgment-dialog-actions">
        ${_e}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-parquet-judgment">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},oe=async b=>{if(!Fe||!b)return;let T=++_;Fe.open||Fe.showModal(),Ue(),Fe.innerHTML=P("\u8B80\u53D6\u5224\u6C7A\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E DB \u5132\u5B58\u539F\u6587\u8B80\u53D6 ${r(b)}\u2026</span>
      </div>`);try{let D=await Q.judgmentDetail(b,"parquet");if(t||T!==_)return;Fe.innerHTML=de(D)}catch(D){if(t||T!==_)return;Fe.innerHTML=P("\u7121\u6CD5\u8B80\u53D6 DB \u539F\u6587\u5224\u6C7A",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${r(D.message||"\u627E\u4E0D\u5230\u5224\u6C7A\u5168\u6587\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u5DF2\u57F7\u884C <span class="mono">uv run judgment-import-judgments --raw-only</span>\uFF0C\u4E14\u539F\u59CB Parquet \u5B58\u5728\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-parquet-judgment">\u95DC\u9589</button>
        </div>`)}},ne=0,be=(b,T)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">LOCAL PARQUET LAW</div>
      <h2>${r(b)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-law-source" aria-label="\u95DC\u9589">${f("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${T}</div>`,re=(b,T="")=>{let D=String(b.selected_article_no||T||"").trim(),Z=!!D,ce=Array.isArray(b.articles)?b.articles:[],_e=ce.map(Pt=>{let Ca=String(Pt.article_content||"").trim();return Ca?Pt.article_type==="C"?`<div class="law-chapter">${r(Ca)}</div>`:`<article class="law-article" data-article-no="${r(oi(Pt.article_no))}">
          <div class="law-article-head">
            <span class="law-article-no">${r(Pt.article_no||"\u689D\u6587")}</span>
          </div>
          <div class="law-article-text">${r(Ca)}</div>
        </article>`:""}).join(""),He=(Array.isArray(b.warnings)?b.warnings:[]).map(Pt=>r(Pt)).join("<br />"),Ee=b.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F",ot=b.meta?.articles_source,ut=ot==="parquet"?"Parquet \u689D\u6587":ot==="postgresql"?"PostgreSQL \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",Oe=b.meta?.snapshot||"",ht=[b.law_level,b.law_category,b.article_count?`${d(b.article_count)} \u689D`:"",b.law_modified_date?`\u7570\u52D5 ${Dt(b.law_modified_date)}`:""].filter(Boolean).map(Pt=>`<span>${r(Pt)}</span>`).join(""),Be=b.law_url?`<a class="btn btn-secondary btn-sm" href="${r(b.law_url)}" target="_blank" rel="noopener noreferrer">${f("external",13)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:"",yt=!Z&&b.law_histories?`<details class="law-dialog-history">
          <summary>\u6CD5\u898F\u6CBF\u9769</summary>
          <div>${r(b.law_histories)}</div>
        </details>`:"",Je=Z?`<span class="badge badge-mono">${r(D)}</span>`:"",wt=!Z&&ce.length>1?`<div class="law-dialog-jump">
          <div class="law-article-jump">
            <input class="input law-article-jump-input law-jump-input"
              id="rag-law-article-jump" type="text" inputmode="numeric"
              autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
            <button class="btn btn-secondary btn-sm" type="button"
              data-action="jump-law-article"
              data-jump-input="rag-law-article-jump">\u8DF3\u81F3\u689D\u6587</button>
          </div>
        </div>`:"",xt=Z?`${b.law_name||b.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4"} \xB7 ${D}`:b.law_name||b.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4";return be(xt,`<div class="judgment-dialog-meta">
        <span class="badge ${b.source_type==="order"?"badge-warn":"badge-info"}">${r(Ee)}</span>
        ${Je}
        ${ht}
      </div>
      <div class="judgment-dialog-source">${r([ut,Oe].filter(Boolean).join(" \xB7 "))}</div>
      ${He?`<div class="law-dialog-warning">${He}</div>`:""}
      ${yt}
      ${wt}
      <div class="law-dialog-articles">${_e||`<div class="report-empty-inline">${Z?"\u9019\u689D\u689D\u6587\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u5167\u5BB9\u3002":"\u9019\u500B\u6CD5\u898F\uFF0F\u547D\u4EE4\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u3002"}</div>`}</div>
      <div class="judgment-dialog-actions">
        ${Be}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-law-source">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},ie=(b,T)=>{let D=b?.querySelector(`#${T}`),Z=oi(D?.value||"");if(!Z){N("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),D?.focus();return}let ce=[...b?.querySelectorAll("[data-article-no]")||[]].find(_e=>_e.dataset.articleNo===Z);if(!ce){N(`\u627E\u4E0D\u5230\u7B2C ${Z} \u689D\u3002`,"warn");return}ce.scrollIntoView({behavior:"instant",block:"center"}),ce.classList.add("is-jump-target"),window.setTimeout(()=>ce.classList.remove("is-jump-target"),2400)},fe=async(b,T="",D="")=>{if(!Ae||!b)return;let Z=++ne;Ae.open||Ae.showModal(),Ue(),Ae.innerHTML=be(D?"\u8B80\u53D6\u6CD5\u898F\u689D\u6587\u4E2D\u2026":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E\u672C\u5730 Parquet \u8B80\u53D6 ${r([b,D].filter(Boolean).join(" \xB7 "))} \u7684\u539F\u59CB\u689D\u6587\u2026</span>
      </div>`);try{let ce=await Q.lawDetail(b,T,"",D);if(t||Z!==ne)return;Ae.innerHTML=re(ce,D)}catch(ce){if(t||Z!==ne)return;Ae.innerHTML=be("\u7121\u6CD5\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u6587",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${r(ce.message||"\u627E\u4E0D\u5230\u689D\u6587\u5167\u5BB9\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u672C\u5730\u539F\u59CB\u6CD5\u898F Parquet \u5B58\u5728\uFF0C\u4E14 PostgreSQL metadata \u8207\u5176\u4E00\u81F4\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-law-source">\u95DC\u9589</button>
        </div>`)}};Ae?.addEventListener("click",b=>{let T=b.target.closest('[data-action="jump-law-article"]');if(T){ie(Ae,T.dataset.jumpInput||"rag-law-article-jump");return}if(b.target.closest('[data-action="close-law-source"]')){Ae.close();return}let D=Ae.getBoundingClientRect();(b.clientX<D.left||b.clientX>D.right||b.clientY<D.top||b.clientY>D.bottom)&&Ae.close()}),Ae?.addEventListener("keydown",b=>{!b.target.matches(".law-jump-input")||b.key!=="Enter"||(b.preventDefault(),ie(Ae,b.target.id))}),Fe?.addEventListener("click",b=>{let T=b.target.closest('[data-action="open-law-source"]');if(T){fe(T.dataset.lawKey||"",T.dataset.sourceType||"",T.dataset.articleNo||"");return}if(b.target.closest('[data-action="close-parquet-judgment"]')){Fe.close();return}let D=Fe.getBoundingClientRect();(b.clientX<D.left||b.clientX>D.right||b.clientY<D.top||b.clientY>D.bottom)&&Fe.close()}),z.addEventListener("click",b=>{let T=b.target.closest(".rag-process-toggle");if(T){let Z=T.closest(".rag-process"),ce=T.getAttribute("aria-expanded")==="true";_n(Z,!ce);return}let D=b.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(D){if(D.dataset.action==="open-law-source"){fe(D.dataset.lawKey||"",D.dataset.sourceType||"",D.dataset.articleNo||"");return}oe(D.dataset.jid||"")}}),z.addEventListener("keydown",b=>{if(b.key!=="Enter"&&b.key!==" ")return;let T=b.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(!(!T||T.closest("a, button"))){if(b.preventDefault(),T.dataset.action==="open-law-source"){fe(T.dataset.lawKey||"",T.dataset.sourceType||"",T.dataset.articleNo||"");return}oe(T.dataset.jid||"")}});let we=async(b,{fresh:T=!1,source:D="hero"}={})=>{let Z=b.trim();if(!Z){N("\u8ACB\u5148\u8F38\u5165\u554F\u984C\u3002","warn"),(D==="followup"?x:K).focus();return}(T||!v)&&(p=null,$=[],z.innerHTML="",Ge());let ce=++c,_e=()=>t||ce!==c,He=o;u=Z,F(!0),Ne(),D==="followup"?(x.value="",G()):(K.value="",A());let{answerElement:Ee}=nt(Z,nc(Z,g)),ot=g?null:ac(Ee);g?(jt(null),Ls()):(Bt(),jt(null)),Me(ye,!0,"\u6AA2\u7D22\u4E2D\u2026"),Me(C,!0,"\u6AA2\u7D22\u4E2D\u2026");let ut=null,Oe="",ht=Je=>{if(_e()||!Je?.partial)return;let wt=Ee.querySelector(".answer-body");if(!wt)return;ut=Je,Oe=String(Je.answer||""),wt.innerHTML=ui(Je),ot?.collapse?.();let xt=Ee.querySelector(".answer-head-title");xt&&(xt.textContent=Je.streaming?"LLM \u56DE\u7B54\u751F\u6210\u4E2D":"\u6CD5\u898F\u7D50\u679C\u5DF2\u986F\u793A")},Be=Je=>{if(_e()||!Je||!ut?.streaming)return;Oe+=Je;let wt=Ee.querySelector("[data-partial-answer]");wt&&(wt.textContent=Oe)},yt=()=>{if(_e()||!ut?.streaming)return;Oe="";let Je=Ee.querySelector("[data-partial-answer]");Je&&(Je.textContent="\u6B63\u5728\u91CD\u65B0\u751F\u6210\u56DE\u7B54\u2026")};try{let Je=g?await Q.rag(Z,{testMode:g}):await Q.ragStream(Z,{onStep:xt=>{_e()||ot?.step(xt)},onPartial:ht,onToken:Be,onTokenReset:yt});if(_e())return;Bt();let wt=ot?.finish(!0)||"";if(Ee.innerHTML=li(Z,Je,wt),Je.pipeline_flow||Xl(Je).then(()=>{if(_e()||!Je.pipeline_flow)return;let xt=Ee.querySelector(".answer-body");if(!xt||xt.querySelector(".rag-wf-card"))return;let Pt=ya(Je.pipeline_flow,{serverDurationMs:Number(Je.duration_ms)||0,embedded:!0});Pt&&xt.insertAdjacentHTML("beforeend",Pt)}),Je.test_run?.run_id?await Ws(Je.test_run.run_id):jt(null),await he(Z,Je,He,ce),_e())return;Ce()}catch(Je){if(_e())return;Bt();let wt=ot?.finish(!1)||"";Ee.innerHTML=pc(Je,wt),Ce(),N(Je.message||"\u6AA2\u7D22\u5931\u6557\u3002","danger")}finally{_e()||(Bt(),Me(ye,!1),Me(C,!1))}};W.addEventListener("submit",b=>{b.preventDefault(),we(K.value,{fresh:!0,source:"hero"})}),E.addEventListener("submit",b=>{b.preventDefault(),we(x.value,{fresh:!1,source:"followup"})}),K.addEventListener("input",A),K.addEventListener("keydown",b=>{b.key==="Enter"&&!b.shiftKey&&!b.isComposing&&(b.preventDefault(),W.requestSubmit())}),x.addEventListener("input",G),x.addEventListener("keydown",b=>{b.key==="Enter"&&!b.shiftKey&&!b.isComposing&&(b.preventDefault(),E.requestSubmit())}),e.querySelector("#example-chips").addEventListener("click",b=>{let T=b.target.closest("[data-question]");T&&(K.value=T.dataset.question,A(),W.requestSubmit())}),e.addEventListener("click",async b=>{let T=b.target.closest("[data-rag-model]");if(T){let D=T.dataset.ragProvider?Number(T.dataset.ragProvider):null;await qs(T.dataset.ragModel||"",Number.isFinite(D)?D:null);return}if(b.target.closest('[data-rag-action="refresh-rerank-models"]')){await Ea();return}b.target.closest('[data-rag-action="refresh-chat-models"]')&&await It()}),Y.addEventListener("click",async b=>{let T=b.target.closest("[data-rag-toggle]");if(T){let Ee=T.closest(".rag-library-section").classList.toggle("is-collapsed");T.setAttribute("aria-expanded",String(!Ee));return}let D=b.target.closest("[data-rag-action]"),Z=D?.dataset.ragAction||"";if(Z==="new-chat"){Qe();return}if(Z==="open-history-menu"){Vt(D,D.dataset.historyId);return}if(Z==="toggle-pin"){await $e(D.dataset.historyId);return}if(Z==="select-project"){et(D.dataset.projectId||"");return}if(Z==="show-project-form"){Ke();return}if(Z==="cancel-project"){Rt();return}if(Z==="more-recent"){l+=12,Ge();return}if(Z==="clear-project"){et("");return}let ce=b.target.closest("[data-history-open]");if(!ce)return;let _e=s.find(He=>String(He.id)===String(ce.dataset.historyId));_e&&(o=String(_e.project_id||""),Ge(),!rt(_e)&&(p=null,$=[],we(_e.title,{fresh:!0,source:"history"})))}),Y.addEventListener("submit",async b=>{let T=b.target.closest('[data-rag-form="project"]');T&&(b.preventDefault(),await te(T))}),De.addEventListener("click",J),document.addEventListener("click",X),document.addEventListener("keydown",ue),window.addEventListener("scroll",Le,{capture:!0,passive:!0}),window.addEventListener("resize",Pe),V.addEventListener("click",async()=>{if(!s.length){N("\u76EE\u524D\u6C92\u6709\u53EF\u6E05\u9664\u7684\u63D0\u554F\u7D00\u9304\u3002","info");return}window.confirm("\u78BA\u5B9A\u6E05\u9664\u9019\u500B\u700F\u89BD\u5668\u7684\u6240\u6709\u63D0\u554F\u7D00\u9304\uFF1F")&&(await gr(),await Te(),N("\u5DF2\u6E05\u9664\u672C\u6A5F\u63D0\u554F\u7D00\u9304\u3002","ok"))}),A(),await Promise.allSettled([st(),Te(),Mt(),Ra()]),await h();let Se="";try{Se=window.sessionStorage.getItem("judgment.pending_question")||"",window.sessionStorage.removeItem("judgment.pending_question")}catch{Se=""}return!Se&&typeof window.__judgmentPendingQuestion=="string"&&(Se=window.__judgmentPendingQuestion),delete window.__judgmentPendingQuestion,Se=String(Se||"").trim().slice(0,500),Se&&K&&(K.value=Se,A(),window.setTimeout(()=>{t||we(Se,{fresh:!0,source:"home"})},40)),()=>{t=!0,Bt(),Pe(),document.removeEventListener("click",X),document.removeEventListener("keydown",ue),window.removeEventListener("scroll",Le,{capture:!0}),window.removeEventListener("resize",Pe),document.documentElement.classList.remove("dialog-open"),window.removeEventListener("judgment:test-mode",Vs),u&&z.setAttribute("data-last-question",u)}}var Nn={};Wt(Nn,{render:()=>bd});var xn=new Set(["legal_index_versions","judgment_import","index_versions"]),pi=new Map,qn=new Set,bc={running:{label:"\u57F7\u884C\u4E2D",tone:"info"},success:{label:"\u5B8C\u6210",tone:"ok"},partial:{label:"\u90E8\u5206\u5B8C\u6210",tone:"warn"},update:{label:"\u66F4\u65B0",tone:"warn"},failed:{label:"\u5931\u6557",tone:"danger"},interrupted:{label:"\u5DF2\u4E2D\u6B62",tone:"warn"},stale:{label:"\u72C0\u614B\u5931\u6548",tone:"warn"},skipped:{label:"\u7565\u904E",tone:"idle"},pending:{label:"\u7B49\u5F85",tone:"idle"},idle:{label:"\u5F85\u547D",tone:"idle"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},operational:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},unavailable:{label:"\u7121\u6CD5\u53D6\u5F97",tone:"danger"},missing:{label:"\u5C1A\u7121\u7D00\u9304",tone:"idle"},error:{label:"\u8B80\u53D6\u5931\u6557",tone:"danger"},ok:{label:"\u6B63\u5E38",tone:"ok"},provided:{label:"\u5916\u90E8\u63D0\u4F9B",tone:"info"}},An=["download","parquet","postgres","qdrant"],vc={download:"\u4E0B\u8F09",parquet:"Parquet",postgres:"PostgreSQL",qdrant:"Qdrant"},hc={judgment:{download:["download"],parquet:["raw_parquet","extract"],postgres:["postgres"],qdrant:["qdrant"]},law:{download:["download"],parquet:["raw_parquet","parse"],postgres:["postgres"],qdrant:["qdrant"]},order:{download:["download"],parquet:["raw_parquet","parse"],postgres:["postgres"],qdrant:["qdrant"]}},mi={complete:"\u5B8C\u6210",incomplete:"\u672A\u5B8C\u6210",processing:"\u8655\u7406\u4E2D",empty:"\u7121\u8CC7\u6599",not_applicable:"\u5DF2\u53D6\u4EE3"},gi={complete:"is-green",incomplete:"is-red",processing:"is-gray",empty:"is-empty",not_applicable:"is-empty"};var Nt=new Map,Et="",ps="",fi={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},bi={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},$c={judgment:"\u5224\u6C7A",law:"\u6CD5\u898F",order:"\u547D\u4EE4",system:"\u7CFB\u7D71"};var vi={law_download:"law",order_download:"order",judgment_download:"judgment"},hi={law_download:"\u6CD5\u898F\u4E0B\u8F09",order_download:"\u547D\u4EE4\u4E0B\u8F09",judgment_download:"\u5224\u6C7A\u4E0B\u8F09"},yc={law_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",order_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",judgment_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u5224\u6C7A RAR \u55CE\uFF1F\uFF08\u4E0D\u6703\u81EA\u52D5\u532F\u5165 PostgreSQL \u6216\u5EFA\u7ACB Qdrant \u7D22\u5F15\uFF09"},wc={law_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u6CD5\u898F RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",order_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u547D\u4EE4 RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",judgment_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u53EA\u4E0B\u8F09\u5224\u6C7A RAR\u3002PostgreSQL\uFF0FParquet \u532F\u5165\u8207 Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\u300C\u5224\u6C7A\u532F\u5165\u300D\u6216\u5B8C\u6574\u8CC7\u6599\u66F4\u65B0\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_import:"\u6D41\u7A0B\u7BC4\u570D\uFF1ARAR \u2192 \u539F\u59CB\u8CC7\u6599\u6AA2\u67E5\uFF0FParquet \u5099\u4EFD \u2192 \u91D1\u878D\u6CD5\u898F\u7BE9\u9078 \u2192 PostgreSQL\u3002Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_parquet:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5F9E PostgreSQL \u532F\u51FA\u67E5\u8A62\u7528 Parquet \u5FEB\u7167\uFF1B\u4E0D\u5BEB\u5165 Qdrant\uFF0FIndexedDB\u3002",index_versions:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5EFA\u7ACB\u4E26\u9A57\u8B49\u65B0\u7684 Qdrant collection\uFF0C\u5B8C\u6210\u5F8C\u539F\u5B50\u5207\u63DB alias\uFF1BIndexedDB \u4E0D\u53C3\u8207\u3002"};function zs(e){return bc[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function vt(e,t){let s=zs(e);return`<span class="badge ${fi[s.tone]||fi.idle}"><span class="status-dot ${bi[s.tone]||bi.idle}"></span>${r(t||s.label)}</span>`}function At(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function $i(e){return e==null?"\u7121\u6CD5\u53D6\u5F97":d(e)}function Hs(e){return e&&e.color?String(e.color):"var(--accent)"}function _c(e,t=""){let s=e.percent===null||e.percent===void 0?null:Math.max(0,Math.min(100,Number(e.percent)||0)),a=e.status==="running"&&s===null,n=a?' aria-valuetext="\u9032\u5EA6\u672A\u77E5"':` aria-valuenow="${s??0}"`;return`<div class="processing-bar${a?" is-indeterminate":""}${t?` ${t}`:""}" role="progressbar" aria-valuemin="0" aria-valuemax="100"${n}>
    <span class="processing-bar-fill" style="width:${s??0}%;background:${r(Hs(e))}"></span>
  </div>`}function wi(e){let t=e.unit==="bytes"?"":e.unit||"\u7B46",s=e.current,a=e.total;return["skipped","pending","idle"].includes(e.status)?"\u2014":s==null?e.status==="running"?"\u9032\u884C\u4E2D":"\u2014":e.unit==="bytes"?a?`${Re(s)} / ${Re(a)}`:Re(s):a?`${d(s)} / ${d(a)} ${t}`:`${d(s)} ${t}`}function ms(e,t,s="",a=""){return`<div class="processing-summary-card">
    <span class="processing-summary-label">${r(e)}</span>
    <span class="processing-summary-value">${t}</span>
    ${s?`<span class="processing-summary-hint">${s}</span>`:""}
    ${a}
  </div>`}function kc(e){let t=e.database||{},s=e.index||{},a=e.local_archives||{},n=e.raw_backups||{},i=n.totals||{},o=e.state||{},l=e.capabilities||{},u=e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D",c=t.status==="operational",p=s.status==="operational",$=a.available!==!1,v=n.available!==!1,g=p?`${d(s.indexed)} / ${d(s.total)}`:vt(s.status||"unavailable"),m=p?`${At(s.percent)} \xB7 \u5C1A\u9918 ${d(s.remaining)} \u7B46`:r(s.error||"\u7121\u6CD5\u67E5\u8A62 Qdrant \u7D22\u5F15\u8986\u84CB\u7387\u3002"),w=$?`${d(a.unprocessed)} / ${d(a.total)}`:vt("unavailable"),S=$?`\u672A\u8655\u7406 / \u5168\u90E8 \xB7 ${Re(a.unprocessed_bytes)} \u5F85\u8655\u7406`:r(a.error||"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304\u3002");return`<div class="processing-summary">
    ${zt(Pc(e))}
    ${ms("\u8655\u7406\u72C0\u614B",vt(e.status||"unknown"),`${r(u)} \xB7 \u66F4\u65B0\u65BC <span data-processing-updated-at>\u2014</span>`)}
    ${ms("\u672A\u8655\u7406\u58D3\u7E2E\u6A94",r(w),S)}
    ${ms("\u539F\u59CB\u8CC7\u6599\u5099\u4EFD",v?`${d(n.count)} \u6A94`:vt("unavailable"),v?`\u5171 ${d(i.row_count)} \u7B46 \xB7 ${Re(i.compressed_bytes)}`:r(n.error||"\u7121\u6CD5\u6383\u63CF\u539F\u59CB\u8CC7\u6599\u5099\u4EFD\u3002"))}
    ${ms("PostgreSQL \u5224\u6C7A",c?d(t.judgment_count):vt("unavailable"),c?`\u6CD5\u898F ${$i(t.law_count)} \xB7 \u547D\u4EE4 ${$i(t.order_count)}`:r(t.error||"\u7121\u6CD5\u67E5\u8A62 PostgreSQL\u3002"))}
    ${ms("Qdrant \u7D22\u5F15",g,m)}
    ${ms("\u72C0\u614B\u6A94",vt(o.status||"missing"),o.updated_at?`\u66F4\u65B0\u65BC ${r(qe(o.updated_at))}`:r(o.detail||"\u5C1A\u7121\u8655\u7406\u72C0\u614B\u7D00\u9304\u3002"))}
    ${ms("\u5F85\u8655\u7406\u5DE5\u4F5C",l.can_start_update===!1?"\u66AB\u505C\u555F\u52D5":"\u53EF\u958B\u59CB\u66F4\u65B0",l.start_blocked_reason?r(l.start_blocked_reason):`\u672A\u8655\u7406 ${d(l.unprocessed_archives)} \u500B \xB7 \u7D22\u5F15\u5F85\u88DC ${d(l.index_backlog)} \u7B46${l.external_processes?` \xB7 \u5916\u90E8\u7A0B\u5E8F ${d(l.external_processes)} \u500B`:""}`)}
  </div>`}function Sc(e){let t=e.timeline||{},s=Array.isArray(t.stages)?t.stages:[],a=`<div class="report-section-head">
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
    </section>`;let n=s.map(o=>`<span class="processing-stack-segment" style="width:${Math.max(0,Number(o.percent)||0)}%;background:${r(o.color||"var(--accent)")}" title="${r(`${o.label} ${ge(o.duration_ms)} (${At(o.percent)})`)}"></span>`).join(""),i=s.map(o=>`<div class="processing-legend-item">
        <span class="processing-legend-swatch" style="background:${r(o.color||"var(--accent)")}"></span>
        <span class="processing-legend-label">${r(o.label)}</span>
        <span class="mono">${ge(o.duration_ms)}</span>
        <span class="processing-legend-percent mono">${At(o.percent)}</span>
        ${vt(o.status)}
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
  </section>`}function xc(e){let t=Array.isArray(e.recent_runs)?e.recent_runs:[],s=new Map((e.branches||[]).map(i=>[i.key,i.label])),a=`<div class="report-section-head">
    <div>
      <div class="report-kicker">RECENT RUNS</div>
      <h2 class="report-section-title">\u6700\u8FD1\u8655\u7406\u7D00\u9304</h2>
      <p class="processing-section-sub">\u5305\u542B\u8CC7\u6599\u66F4\u65B0\u3001\u5224\u6C7A\u4E0B\u8F09\u3001\u5224\u6C7A\u532F\u5165\u3001Parquet\u3001Qdrant \u8207\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E0B\u8F09\u3002</p>
    </div>
  </div>`;if(!t.length)return`<section class="report-card processing-card">
      <div class="report-head">${a}</div>
      <div class="report-section"><div class="processing-empty">\u5C1A\u7121\u8655\u7406\u7D00\u9304\u3002</div></div>
    </section>`;let n=t.map(i=>{let o=s.get(i.branch)||$c[i.branch]||i.branch||"\u2014";return`<div class="processing-run">
        <div class="processing-run-head">
          <span class="badge badge-neutral">${r(o)}</span>
          <strong>${r(i.title||"\u8655\u7406")}</strong>
          ${vt(i.status)}
          <span class="grow"></span>
          <span class="mono faint">${r(qe(i.finished_at||i.started_at))}</span>
          <span class="mono">${i.duration_ms?ge(i.duration_ms):"\u2014"}</span>
        </div>
        ${i.message?`<div class="processing-run-message">${r(i.message)}</div>`:""}
      </div>`}).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section"><div class="processing-run-list">${n}</div></div>
  </section>`}function qc(e){let t=Array.isArray(e.notices)?e.notices:[];return t.length?`<div class="processing-notices">${t.map(s=>Ie({tone:s.tone||"info",title:s.title,text:r(s.message||"")})).join("")}</div>`:""}function _i(e,t){if(e==="law"||e==="order")return t==="qdrant"?"legal_index_versions":`${e}_download`;if(e==="judgment"){if(t==="download")return"judgment_download";if(t==="parquet"||t==="postgres")return"judgment_import";if(t==="qdrant")return"index_versions"}return""}function Ln({month:e,year:t,monthNo:s,stageOrder:a,stageLabels:n,stageStatuses:i,overall:o,active:l,workflowForStage:u,stageProgress:c=null,variant:p="legacy"}){let $=i||{},v=String(e?.month||`${t}${String(s).padStart(2,"0")}`),g=e?.month_label||`${t}-${String(s).padStart(2,"0")}`,m=pe=>p==="index"&&pe==="processing"?"\u57F7\u884C\u4E2D":mi[pe]||mi.empty,w=pe=>{let z=$[pe]||"empty";if(p!=="index"||typeof c!="function"||!(z==="processing"||pe==="qdrant"&&z==="incomplete"))return null;let x=Number(c(pe,v,z));return Number.isFinite(x)?Math.max(0,Math.min(100,x)):null},S=a.map(pe=>{let z=$[pe]||"empty",E=w(pe),x=pe==="qdrant"&&z==="incomplete"&&E!==null&&E>0,C=x?"\u5DF2\u8655\u7406":m(z),se=!x&&E!==null&&E>0?` ${E.toFixed(1)}%`:"";return`${n[pe]||pe}\uFF1A${C}${se}`}).join(" \xB7 "),M=(e?.versions||[]).map(pe=>pe.version_code).filter(Boolean),j=[...new Set([...e?.files||[],...e?.local_files||[],...e?.imported_files||[]])].filter(Boolean),B=M.length?` \xB7 \u7248\u672C ${M.join("\u3001")}`:j.length?` \xB7 ${j.join("\u3001")}`:"",U=e?.detail?` \xB7 ${e.detail}`:"",W=e?`${g} \xB7 ${S}${B}${U}`:`${g} \xB7 \u7121\u8CC7\u6599`,K=p==="index"?o==="empty"?"is-empty":"is-neutral":gi[o]||"is-empty",ye=a.map(pe=>{let z=$[pe]||"empty",E=z==="incomplete"?u(pe):"",x=E?"button":"span",C=E?` type="button" data-timeline-workflow="${r(E)}"`:"",se=w(pe),me=pe==="qdrant"&&z==="incomplete"&&se!==null&&se>0,V=z==="processing"&&se!==null?` ${se.toFixed(1)}%`:"",Y=me?"\u5DF2\u8655\u7406":m(z),ae=z==="complete"?"is-complete":z==="processing"?"is-running":me?"is-partial":z==="incomplete"?"is-incomplete":"is-empty",ee=p==="index"?["index-month-block","processing-month-stage",`is-${pe}`,ae,E?"is-actionable":""]:["processing-month-stage",gi[z]||"is-empty",E?"is-actionable":""],ke=z==="processing"&&se!==null?` style="--stage-progress:${se.toFixed(1)}%"`:"";return`<${x} class="${ee.filter(Boolean).join(" ")}"${C}${ke} title="${r(`${n[pe]||pe}\uFF1A${Y}${V}${E?"\uFF08\u9EDE\u9078\u524D\u5F80\u8655\u7406\uFF09":""}`)}" aria-label="${r(`${g} ${n[pe]||pe} ${Y}${V}${E?"\uFF0C\u9EDE\u9078\u524D\u5F80\u8655\u7406":""}`)}"></${x}>`}).join("");return p==="index"?`<td class="judgment-month index-month index-month-are processing-month ${K}${l?" is-current":""}" data-month="${r(v)}" title="${r(W)}" aria-label="${r(W)}"${l?' aria-current="true"':""}>
    <span class="index-month-number">${s}</span>
    <span class="index-month-blocks">${ye}</span>
  </td>`:`<td class="judgment-month import-month processing-month${l?" is-current":""} is-${r(o)}" data-month="${r(v)}" title="${r(W)}" aria-label="${r(W)}"${l?' aria-current="true"':""}>
    <span class="processing-month-number">${s}</span>
    <span class="processing-month-stages">${ye}</span>
  </td>`}function Ac(e,t,s,a,n){return Ln({month:t,year:s,monthNo:a,stageOrder:An,stageLabels:vc,stageStatuses:t?.stages||{},overall:t?.overall||"empty",active:!!(t?.active||t?.overall==="processing"),workflowForStage:i=>_i(e.key,i),stageProgress:n,variant:"index"})}function Mc(e){let t=Array.isArray(e?.months)?e.months:[];if(!t.length)return`<section class="report-card processing-card import-files-card law-index-timeline-card">
      <div class="side-card-head">
        <span class="side-card-title">${f(e?.key==="order"?"file":"layers",14)}${r(e?.label||"\u6CD5\u898F\uFF0F\u547D\u4EE4")} \u7D22\u5F15\u7248\u672C\u6642\u9593\u8868</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u5C1A\u7121\u4E0B\u8F09\u7248\u672C\u6216\u7D22\u5F15\u7D00\u9304\u3002</div>
    </section>`;let s=new Map(t.map(p=>[String(p.month),p])),a=[...new Set(t.map(p=>p.year))].sort((p,$)=>$.localeCompare(p)),n=["download","prepared","indexed"],i=e.stage_labels||{download:"D \u4E0B\u8F09\u7248\u672C",prepared:"P \u8CC7\u6599\u5C31\u7DD2",indexed:"I \u7D22\u5F15\u8986\u84CB"},o=a.map(p=>{let $=Array.from({length:12},(v,g)=>{let m=g+1,w=`${p}${String(m).padStart(2,"0")}`,S=s.get(w);return Ln({month:S,year:p,monthNo:m,stageOrder:n,stageLabels:i,stageStatuses:S?.stages||{},overall:S?.overall||"empty",active:!!S?.active,workflowForStage:M=>M==="indexed"?"legal_index_versions":`${e.key}_download`})}).join("");return`<tr><th scope="row">${r(p)}</th>${$}</tr>`}).join(""),l=e.summary||{},u=e.current||{},c=u.month?`<div class="index-current-row">
        <span class="badge badge-info">${f("activity",11)}${r(u.label||"\u76EE\u524D\u7248\u672C")}</span>
        <strong class="mono">${r(u.month_label||qa(u.month))}</strong>
        <span class="mono">${r(u.file||"\u2014")}</span>
        <span class="index-current-copy">${r(u.detail||"")}</span>
      </div>`:"";return`<section class="report-card processing-card import-files-card law-index-timeline-card" data-law-index-timeline="${r(e.key||"")}">
    <div class="side-card-head">
      <span class="side-card-title">${f(e.key==="order"?"file":"layers",14)}${r(e.label||e.key||"")} \u7D22\u5F15\u7248\u672C\u6642\u9593\u8868</span>
      <span class="badge badge-neutral">${d(t.length)} \u500B\u6708</span>
    </div>
    <div class="judgment-months index-months">
      <div class="judgment-months-meta">
        <span class="badge badge-ok">\u5B8C\u6210 ${d(l.complete||0)}</span>
        <span class="badge badge-danger">\u672A\u5B8C\u6210 ${d(l.incomplete||0)}</span>
        <span class="badge badge-neutral">\u8655\u7406\u4E2D ${d(l.processing||0)}</span>
        <span class="badge badge-neutral">\u5DF2\u53D6\u4EE3 ${d(l.superseded||0)}</span>
        <span class="muted">\u5171 ${d(t.length)} \u500B\u6708</span>
      </div>
      ${c}
      <div class="judgment-months-scroll">
        <table class="judgment-months-table index-months-table processing-months-table">
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(p,$)=>`<th scope="col">${$+1}</th>`).join("")}</tr></thead>
          <tbody>${o}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">D\uFF1A\u4E0B\u8F09\u7248\u672C\uFF1BP\uFF1Araw Parquet + PostgreSQL \u5C31\u7DD2\uFF1BI\uFF1Aactive \u7D22\u5F15\u8986\u84CB\u3002\u820A\u7248\u672C\u986F\u793A\u300C\u5DF2\u53D6\u4EE3\u300D\uFF0C\u4E0D\u9700\u91CD\u5EFA\u7D22\u5F15\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u7248\u672C\u7DE8\u865F\u3001\u4E0B\u8F09\u6642\u9593\u8207\u7B46\u6578\u3002</p>
    </div>
  </section>`}function Lc(e){let t=Array.isArray(e)?e:[];return t.length?`<div class="law-index-timelines">${t.map(Mc).join("")}</div>`:""}function ki({activeMonth:e,activeArchive:t,activePhase:s="",processingMonth:a="",processingArchive:n="",stageLabels:i={}}){if(!e||!t)return"";let o=`${String(e).slice(0,4)}-${String(e).slice(4,6)}`,l=i[s]||(s?"\u6E96\u5099\u4E2D":""),u=`${String(a||"").slice(0,4)}-${String(a||"").slice(4,6)}`,c=!!a&&(a!==e||n!==t);return`<span class="badge badge-info">${f("activity",11)}\u76EE\u524D\u532F\u5165</span>
    <strong class="mono">${r(o)}</strong>
    <span class="mono">${r(t)}</span>
    ${l?`<span class="badge badge-neutral">${r(l)}</span>`:""}
    ${c?`<span class="processing-current-processing">
            <span class="faint">\u8655\u7406\u4E2D</span>
            <strong class="mono">${r(u)}</strong>
            <span class="mono">${r(n||"\u2014")}</span>
          </span>`:""}`}function jc(e,t,s,a){let n=Array.isArray(e.stage_order)&&e.stage_order.length?e.stage_order:["extract","raw_parquet","filter","postgres"],i=e.stage_labels||{extract:"RAR \u6AA2\u67E5\uFF0F\u89E3\u58D3\u7E2E",raw_parquet:"\u539F\u59CB\u8CC7\u6599\u6AA2\u67E5\uFF0FParquet \u5099\u4EFD",filter:"\u91D1\u878D\u6CD5\u898F\u7BE9\u9078",postgres:"PostgreSQL metadata"};return Ln({month:t,year:s,monthNo:a,stageOrder:n,stageLabels:i,stageStatuses:t?.import_stages||{},overall:t?.import_overall||"empty",active:!!t?.active,workflowForStage:()=>"judgment_import"})}function Tc(e,t,s,a){let n=[];for(let i=1;i<=12;i+=1){let o=`${t}${String(i).padStart(2,"0")}`;n.push(Ac(e,s.get(o),t,i,a))}return`<tr><th scope="row">${t}</th>${n.join("")}</tr>`}function Nc(e){let t=e?.models||{};return[["Embedding",t.embedding],["Rerank",t.rerank]].filter(([,s])=>s&&(s.label||s.model)).map(([s,a])=>{let n=a.label||[a.host,a.model].filter(Boolean).join(" ")||"\u2014",i=[`${s} \u4E3B\u6A5F\u8207\u6A21\u578B\uFF1A${n}`,a.url?`\u7AEF\u9EDE\uFF1A${a.url}`:"",s==="Rerank"&&a.enabled===!1?"RAG_RERANK_ENABLED=false":""].filter(Boolean).join(" \xB7 ");return`<span class="processing-timeline-model" title="${r(i)}">${s} <strong class="mono">${r(n)}</strong>${s==="Rerank"&&a.enabled===!1?' <span class="faint">\u672A\u555F\u7528</span>':""}</span>`}).join("")}function Ec(e,t,s){let a=Number(e?.total_months)||t.length||0,n=Number(s?.complete)||0,i=a>0?n/a*100:null,o=t.reduce((c,p)=>{let $=p?.stages||{};return c+An.filter(v=>!!$[v]&&$[v]!=="empty"&&$[v]!=="not_applicable").length},0),l=t.reduce((c,p)=>{let $=p?.stages||{};return c+An.filter(v=>$[v]==="complete").length},0);return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",d(n),"\u5DF2\u5B8C\u6210\u5168\u90E8\u56DB\u500B\u968E\u6BB5\u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",d(s?.incomplete||0),"\u4ECD\u6709\u81F3\u5C11\u4E00\u500B\u968E\u6BB5\u672A\u5B8C\u6210\u7684\u6708\u4EFD\u6578\u3002"],["\u6709\u66F4\u65B0\u6708\u4EFD",d(s?.update||0),"\u5075\u6E2C\u5230\u6709\u65B0\u8CC7\u6599\u53EF\u66F4\u65B0\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",d(a),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",At(i),"\u5B8C\u6210\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${d(l)} / ${d(o)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([c,p,$])=>`<span class="index-runtime-metric" title="${r($)}"><span>${r(c)}</span><strong>${r(p)}</strong></span>`).join("")}</div>`}function Rc(e,t){let s=new Map((Array.isArray(e?.workflows)?e.workflows:[]).map(p=>[String(p.id||""),p])),a=t.key==="judgment"?"index_versions":"legal_index_versions",i=s.get(a)?.index_runtime||{},o=p=>{if(p==null||p==="")return null;let $=Number(p);return Number.isFinite($)?Math.max(0,Math.min(100,$)):null},l=new Map((Array.isArray(i.months)?i.months:[]).map(p=>[String(p?.month||""),o(p?.percent)])),u=new Map(Object.entries(i.active_coverage||{}).map(([p,$])=>[String(p),o($?.percent)])),c=(p,$)=>{let v=s.get(String(p||""));if(!v)return null;let g=v.progress||{},m=Array.isArray(g.stages)?g.stages:[];for(let w of $){let S=m.find(j=>String(j.key)===w),M=o(S?.percent);if(M!==null)return M}return o(g.percent)};return(p,$,v)=>{let g=String($||"");if(p==="qdrant"){let S=l.get(g),M=u.get(g);if(v==="processing"){if(S!==null&&S>0)return S;if(M!==null&&M>0)return M}else return v==="incomplete"?S!==null&&S>0?S:M!==null&&M>0?M:0:null}let m=_i(t.key,p);if(!m)return null;let w=(hc[t.key]||{})[p]||[p];return c(m,w)}}function Cc(e){let t=Array.isArray(e.file_timelines)?e.file_timelines:[];return t.length?`<div class="processing-timeline-overview">${t.map(s=>{let a=Array.isArray(s.months)?s.months:[],n=new Map(a.map(p=>[String(p.month||""),p])),i=[...new Set(a.map(p=>Number(p.year)))].filter(p=>Number.isFinite(p)).sort((p,$)=>$-p),o=s.summary||{},l=s.current||null,u=Nc(s),c=Rc(e,s);return`<section class="report-card processing-card import-files-card processing-timeline-card" data-processing-timeline="${r(s.key||"")}">
        <div class="side-card-head index-runtime-head">
          <span class="side-card-title">${f(s.icon||"activity",14)}${r(s.title||`${s.label||""}\u8655\u7406\u6642\u9593\u8868`)}</span>
          ${Ec(s,a,o)}
        </div>
        ${u?`<div class="index-runtime-summary">${u}</div>`:""}
        ${l?`<div class="index-current-row">
                <span class="badge badge-info">${f("activity",11)}${r(l.label||"\u76EE\u524D")}</span>
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
                    <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(p,$)=>`<th scope="col">${$+1}</th>`).join("")}</tr></thead>
                    <tbody>${i.map(p=>Tc(s,p,n,c)).join("")}</tbody>
                  </table>
                </div>`:'<div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u3002</div>'}
          <p class="judgment-months-hint">${s.key==="judgment"?"\u5224\u6C7A\u4EE5\u88C1\u5224\u66F8\u6708\u4EFD\u986F\u793A\u3002":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u4EE5\u4F86\u6E90\u7248\u672C\u6708\u4EFD\u986F\u793A\u3002"}\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\u70BA\u4E0B\u8F09\u3001Parquet\u3001PostgreSQL\u3001Qdrant \u56DB\u500B\u968E\u6BB5\uFF1B\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\u5B8C\u6210\uFF0C\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u672A\u5B8C\u6210\uFF0CQdrant \u4E4B\u524D\u5DF2\u8655\u7406\u4F46\u5C1A\u672A\u5B8C\u6210\u6642\u4EE5\u6DE1\u6A59\u8272\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\uFF0C\u57F7\u884C\u4E2D\u7684\u65B9\u584A\u4EE5\u9032\u5EA6\u689D\u586B\u5145\uFF0C\u6DE1\u8272\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u7121\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u6216\u8272\u584A\u53EF\u67E5\u770B\u5404\u968E\u6BB5\u72C0\u614B\u8207\u9032\u5EA6\u3002</p>
        </div>
      </section>`}).join("")}</div>`:'<div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u8655\u7406\u6642\u9593\u8868\u3002</div>'}function Pc(e){return e.judgment_stats&&typeof e.judgment_stats=="object"?e.judgment_stats:{judgment_total:(e.raw_backups?.totals||{}).row_count,financial_total:(e.database||{}).judgment_count}}function yi(e,t=new Set){return`${qc(e)}
    ${kc(e)}
    ${Cc(e)}
    ${Sc(e)}
    ${xc(e)}`}function Ic(e,t){return`<div class="report-card processing-card">
    <div class="report-section">
      ${Ie({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B",text:r(e||"\u672A\u77E5\u932F\u8AA4")})}
      ${t?`<p class="processing-section-sub">\u4E0A\u6B21\u6210\u529F\u66F4\u65B0\uFF1A${r(qe(t.generated_at))}\u3002\u756B\u9762\u4E0A\u6C92\u6709\u986F\u793A\u66FF\u4EE3\u6216\u63A8\u6E2C\u7684\u9032\u5EA6\u3002</p>`:""}
      <div class="processing-error-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh">
          ${f("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
  </div>`}function Bc(e,t){if(e.nodeType!==t.nodeType||e.nodeName!==t.nodeName){e.replaceWith(t.cloneNode(!0));return}if(e.nodeType===Node.TEXT_NODE){e.nodeValue!==t.nodeValue&&(e.nodeValue=t.nodeValue);return}if(e.nodeType===Node.ELEMENT_NODE){for(let s of[...e.attributes])t.hasAttribute(s.name)||e.removeAttribute(s.name);for(let s of[...t.attributes])e.getAttribute(s.name)!==s.value&&e.setAttribute(s.name,s.value);t.hasAttribute("data-preserve-children")||Si(e,t)}}function Si(e,t){let s=[...e.childNodes],a=[...t.childNodes],n=Math.min(s.length,a.length);for(let i=0;i<n;i+=1)Bc(s[i],a[i]);for(let i=n;i<s.length;i+=1)s[i].remove();for(let i=n;i<a.length;i+=1)e.appendChild(a[i].cloneNode(!0))}function is(e,t){let s=document.createElement("template");s.innerHTML=t,Si(e,s.content)}var xi={overview:"activity",law_download:"layers",order_download:"file",judgment_download:"download",judgment_import:"database",judgment_parquet:"cube",index_versions:"brain",normalize_courts:"filter",backfill_law_articles:"history"};function Dc(e){let s=(Array.isArray(e.workflows)?e.workflows:[]).map(n=>{let i=n.active_run||null,o=i||n.last_run||null;return{...n,activeRun:i,lastRun:o,status:i?i.status||"running":n.update_available?"update":o?.status||"idle"}}),a=s.find(n=>n.id==="judgment_parquet");return[{id:"overview",label:"\u8655\u7406\u7E3D\u89BD",description:"\u76EE\u524D\u6D41\u7A0B\u3001\u58D3\u7E2E\u6A94\u8207\u6700\u8FD1\u57F7\u884C\u7D00\u9304",status:e.status||"idle",activeRun:null,lastRun:null},...s.filter(n=>n.id!=="judgment_parquet"),...a?[a]:[]]}function Sn(e,t){let s=Dc(e),a=new Set(["law_download","judgment_download","normalize_courts"]);return`<div class="status-sidebar-head">
      <div class="eyebrow">DATA WORKFLOWS</div>
      <div class="status-sidebar-title">\u8CC7\u6599\u6D41\u7A0B</div>
    </div>
    <nav class="status-tab-list" aria-label="\u8CC7\u6599\u8655\u7406\u5DE5\u4F5C\u6D41\u7A0B">
      ${s.map(n=>{let i=n.id===t,o=xi[n.id]||"terminal",l=a.has(n.id)?'<div class="status-tab-divider" role="separator" aria-hidden="true"></div>':"",u=Number(n.pending_count)||0,c=Number(n.update_count)||(n.update_available?u:0),p=n.update_available&&c>0&&!n.activeRun,$=[n.update_message||`${n.update_origin||"\u66F4\u65B0\u5075\u6E2C"}\u627E\u5230 ${d(c)} \u9805\u53EF\u66F4\u65B0\u5167\u5BB9`,n.update_origin?`\u4F86\u6E90\uFF1A${n.update_origin}`:"",n.update_mechanism?`\u6A5F\u5236\uFF1A${n.update_mechanism}`:""].filter(Boolean).join(" \xB7 ");return`${l}<button class="status-tab${i?" is-active":""}" type="button"
            data-processing-workflow="${r(n.id)}"
            ${i?'aria-current="page"':""}>
            <span class="status-tab-icon">${f(o,15)}</span>
            <span class="status-tab-copy">
              <strong>${r(n.label)}</strong>
              <small>${r(n.description||"")}</small>
            </span>
            ${p?`<span class="badge badge-warn badge-mono processing-update-count" title="${r($)}">${f("refresh",10)}${d(c)}</span>`:vt(n.status)}
          </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u57F7\u884C\u6A21\u5F0F</span>
      <span class="mono">${r(e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D")}</span>
    </div>`}function Oc(e){if(!e)return'<div class="processing-workflow-empty">\u5C1A\u672A\u57F7\u884C\u3002\u6309\u4E0B\u53F3\u5074\u6309\u9215\u958B\u59CB\u3002</div>';let t=e.meta||{};return`<div class="processing-workflow-run">
    <div class="processing-workflow-run-head">
      ${vt(e.status)}
      <span class="mono">${r(e.id||"\u2014")}</span>
    </div>
    <div class="processing-workflow-run-grid">
      <span>\u958B\u59CB</span><strong>${r(qe(e.started_at))}</strong>
      <span>\u8017\u6642</span><strong>${ge(e.duration_ms)}</strong>
      <span>\u8A0A\u606F</span><strong>${r(e.message||"\u2014")}</strong>
      ${t.log_path?`<span>\u65E5\u8A8C</span><strong class="mono">${r(t.log_path)}</strong>`:""}
    </div>
  </div>`}function Us(e){return`${e.year}-${String(e.month_no).padStart(2,"0")}`}function qi(e){let t={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"},s=e.status||"red";return[Us(e),t[s]||s,e.latest_fileset_id?`fileset ${e.latest_fileset_id}`:"",e.filename||"",e.local_filename&&e.local_filename!==e.filename?`\u672C\u6A5F\uFF1A${e.local_filename}`:""].filter(Boolean).join(" \xB7 ")}function Ai(e){if(!e.download_url)return"";let t=Us(e);return`<a class="judgment-month-download" href="${r(_t(e.download_url))}" target="_blank" rel="noreferrer" title="\u4E0B\u8F09 ${t} \u5224\u6C7A" aria-label="\u4E0B\u8F09 ${t} \u5224\u6C7A">${f("download",11)}</a>`}function Fc(e){let t=e.status||"red";return`<td class="judgment-month is-${r(t)}" data-judgment-month-key="${r(Us(e))}" title="${r(qi(e))}"><span>${e.month_no}</span>${Ai(e)}</td>`}function zc(e){return e?.off_hours_enabled===!0}function Mi(e){return`\u7DA0\u8272\uFF1A\u6700\u65B0\u7248\u5DF2\u4E0B\u8F09\u5230 raw_rar\uFF1B\u7070\u8272\uFF1A\u672C\u6A5F\u4ECD\u662F\u820A\u7248\uFF0C\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u6703\u66F4\u65B0\uFF1B\u7D05\u8272\uFF1A\u8A72\u6708\u4EFD\u7F3A\u5C11\u5224\u6C7A\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u958B\u555F\u4E0B\u8F09\u9023\u7D50\uFF08${zc(e)?"\u975E API \u6642\u6BB5\u4E5F\u53EF\u4E0B\u8F09\uFF0C\u5EFA\u8B70\u4E00\u6B21\u53EA\u4E0B\u8F09\u4E00\u500B\u6A94\u6848":"\u4E0B\u8F09\u9023\u7D50\u50C5\u5728 00:00\u201306:00 API \u6642\u6BB5\u53EF\u7528"}\uFF09\u3002\u5F85\u88DC\u9F4A\u6708\u4EFD\u6703\u512A\u5148\u4E0B\u8F09\uFF0C\u5168\u90E8\u88DC\u9F4A\u5F8C\u624D\u7531\u6700\u65B0\u6708\u4EFD\u5F80\u56DE\u9A57\u8B49\u65E2\u6709\u6A94\u6848\uFF1B\u4E2D\u65B7\u7684\u4E0B\u8F09\u6703\u4FDD\u7559 .part\uFF0C\u4F3A\u670D\u5668\u652F\u63F4 Range \u6642\u7E8C\u50B3\uFF0C\u5426\u5247\u5F9E\u96F6\u91CD\u65B0\u4E0B\u8F09\u3002\u9996\u6B21\u5B8C\u6574\u540C\u6B65\u53EF\u80FD\u9700\u4E0B\u8F09\u6578\u767E\u500B\u6708\u4EFD\uFF0C\u9810\u8A2D\u975E\u6642\u6BB5\u4E5F\u53EF\u7E8C\u50B3\uFF1B\u56B4\u683C\u6A21\u5F0F\u6703\u5728 00:00\u201306:00 \u4EE5\u5916\u505C\u6B62\u3002`}var Hc={completed:"\u5B8C\u6210",window_closed:"API \u6642\u6BB5\u7D50\u675F",deadline:"\u63A5\u8FD1 06:00\uFF0C\u4FDD\u7559\u5F85\u4E0B\u8F09\u6708\u4EFD",verification_window_closed:"API \u6642\u6BB5\u7D50\u675F\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",verification_deadline:"\u63A5\u8FD1 06:00\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",errors:"\u90E8\u5206\u6708\u4EFD\u4E0B\u8F09\u5931\u6557\uFF0C\u4E0B\u6B21\u91CD\u8A66",pending:"\u4ECD\u6709\u5F85\u4E0B\u8F09\u6708\u4EFD",check_only:"\u50C5\u6AA2\u67E5\uFF0C\u672A\u4E0B\u8F09",incremental:"\u589E\u91CF\u6AA2\u67E5\u5B8C\u6210",status_only:"\u50C5\u66F4\u65B0\u6708\u4EFD\u72C0\u614B",running:"\u57F7\u884C\u4E2D"};function Li(e){let t=e?.backfill||{},s=t.verification||{},a=t.last_run||{},n=Number(t.pending_count)||0,i=Number(t.failure_count)||0,o=String(t.resume_from_month||""),l="\u9A57\u8B49\uFF1A\u672A\u958B\u59CB";s.status==="completed"?l="\u9A57\u8B49\u5B8C\u6210":s.next_month?l=`\u9A57\u8B49\u7E8C\u50B3 ${s.next_month}`:s.status==="in_progress"&&(l="\u9A57\u8B49\u9032\u884C\u4E2D");let u=String(a.stop_reason||""),c=u?`\u4E0A\u6B21\u505C\u6B62\uFF1A${Hc[u]||u}`:"";return{pending:n,failures:i,resume:o,verificationText:l,lastText:c}}function Uc(e){let t=Li(e),s=t.pending>0?`\u5F85\u88DC\u9F4A ${d(t.pending)} \u500B\u6708${t.failures>0?`\uFF08${d(t.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708";return`<div class="judgment-backfill" data-judgment-backfill>
    <span class="badge ${t.pending>0?"badge-danger":"badge-ok"}" data-judgment-backfill-pending>${s}</span>
    <span class="badge badge-neutral" data-judgment-backfill-resume ${t.resume&&t.pending>0?"":"hidden"}>\u5F9E ${r(t.resume)} \u7E8C\u50B3</span>
    <span class="badge badge-info" data-judgment-backfill-verification>${r(t.verificationText)}</span>
    <span class="muted" data-judgment-backfill-last ${t.lastText?"":"hidden"}>${r(t.lastText)}</span>
  </div>`}function Qc(e,t){let s=Li(t),a=e.querySelector("[data-judgment-backfill-pending]");a&&(a.textContent=s.pending>0?`\u5F85\u88DC\u9F4A ${d(s.pending)} \u500B\u6708${s.failures>0?`\uFF08${d(s.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708",a.classList.toggle("badge-danger",s.pending>0),a.classList.toggle("badge-ok",s.pending===0));let n=e.querySelector("[data-judgment-backfill-resume]");if(n){let l=!!s.resume&&s.pending>0;n.hidden=!l,n.textContent=l?`\u5F9E ${s.resume} \u7E8C\u50B3`:""}let i=e.querySelector("[data-judgment-backfill-verification]");i&&(i.textContent=s.verificationText);let o=e.querySelector("[data-judgment-backfill-last]");o&&(o.hidden=!s.lastText,o.textContent=s.lastText)}function jn(){return'<div class="judgment-months-loading"><span class="spinner"></span><span>\u8B80\u53D6\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B\u2026</span></div>'}function Gc(e){if(e?.loading&&!e?.months?.length)return jn();if(e?.error&&!e?.months?.length)return Ie({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:r(e.error)});let t=Array.isArray(e?.months)?e.months:[];if(!t.length)return'<div class="processing-empty">\u5C1A\u672A\u6709\u6708\u4EFD\u72C0\u614B\uFF1B\u8ACB\u5148\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u3002</div>';let s=new Map(t.map(o=>[Us(o),o])),n=[...new Set(t.map(o=>o.year))].sort((o,l)=>l-o).map(o=>{let l=Array.from({length:12},(u,c)=>{let p=s.get(`${o}-${String(c+1).padStart(2,"0")}`);return p?Fc(p):`<td class="judgment-month is-empty"><span>${c+1}</span></td>`}).join("");return`<tr><th scope="row">${o}</th>${l}</tr>`}).join(""),i=e.summary||{};return`<div class="judgment-months">
    <div class="judgment-months-meta">
      <span class="badge badge-ok" data-judgment-summary="green">\u6700\u65B0\u7248 ${d(i.green||0)}</span>
      <span class="badge badge-neutral" data-judgment-summary="gray">\u820A\u7248 ${d(i.gray||0)}</span>
      <span class="badge badge-danger" data-judgment-summary="red">\u7F3A\u5931 ${d(i.red||0)}</span>
      <span class="muted" data-judgment-total>\u5171 ${d(e.total_months||t.length)} \u500B\u6708</span>
    </div>
    ${Uc(e)}
    <div class="judgment-months-scroll">
      <table class="judgment-months-table">
        <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(o,l)=>`<th scope="col">${l+1}</th>`).join("")}</tr></thead>
        <tbody>${n}</tbody>
      </table>
    </div>
    <p class="judgment-months-hint" data-judgment-hint>${r(Mi(e))}</p>
  </div>`}function Jc(e,t){let s=Array.isArray(t?.months)?t.months:[],a=t.summary||{},n={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"};e.querySelectorAll("[data-judgment-summary]").forEach(l=>{let u=l.dataset.judgmentSummary||"";l.textContent=`${n[u]||u} ${d(a[u]||0)}`});let i=e.querySelector("[data-judgment-total]");i&&(i.textContent=`\u5171 ${d(t.total_months||s.length)} \u500B\u6708`),Qc(e,t);let o=e.querySelector("[data-judgment-hint]");if(o){let l=Mi(t);o.textContent!==l&&(o.textContent=l)}for(let l of s){let u=Us(l),c=e.querySelector(`[data-judgment-month-key="${u}"]`);if(!c)continue;let p=l.status||"red";c.classList.contains(`is-${p}`)||(c.classList.remove("is-green","is-gray","is-red","is-empty"),c.classList.add(`is-${p}`));let $=qi(l);c.title!==$&&(c.title=$);let v=c.querySelector(".judgment-month-download");if(l.download_url){let g=_t(l.download_url);v?v.getAttribute("href")!==g&&(v.href=g):c.insertAdjacentHTML("beforeend",Ai(l))}else v&&v.remove()}}function Vc(e){let t=Array.isArray(e)?e:[];return t.length?`<div class="processing-workflow-history">
    ${t.map(s=>`<div class="processing-workflow-history-row">
          <span class="processing-workflow-history-status">${vt(s.status||"idle")}</span>
          <span class="mono">${r(qe(s.started_at))}</span>
          <span class="mono">${r(ge(s.duration_ms||0))}</span>
          <span class="processing-workflow-history-message">${r(s.message||"\u2014")}</span>
        </div>`).join("")}
  </div>`:'<div class="processing-workflow-empty">\u5C1A\u7121\u57F7\u884C\u7D00\u9304\u3002</div>'}function Wc(e){let t=Array.isArray(e.update_history)?e.update_history:[];if(!t.length)return'<div class="processing-workflow-empty">\u5C1A\u7121\u7248\u672C\u6AA2\u67E5\u7D00\u9304\u3002</div>';let s={up_to_date:["\u5DF2\u662F\u6700\u65B0","badge-ok"],update_available:["\u6709\u66F4\u65B0","badge-warn"],error:["\u6AA2\u67E5\u5931\u6557","badge-danger"]};return`<div class="processing-workflow-history">
    ${t.map(a=>{let[n,i]=s[a.status]||[a.status||"\u672A\u77E5","badge-neutral"],o=a.remote_content_length!=null?Re(a.remote_content_length):"\u2014",l=a.local_version_id?`v${a.local_version_id}`:"\u2014";return`<div class="processing-workflow-history-row">
          <span class="badge ${i}">${r(n)}</span>
          <span class="mono">${r(qe(a.checked_at))}</span>
          <span class="mono">\u9060\u7AEF ${r(o)}</span>
          <span class="mono">\u672C\u5730 ${r(l)}</span>
          <span class="processing-workflow-history-message">${r(a.message||"\u2014")}</span>
        </div>`}).join("")}
  </div>`}function xa(e){let t=String(e.key||""),s=zs(e.status);return[`data-stage-key="${r(t)}"`,`data-stage-label="${r(e.label||t)}"`,`data-stage-color="${r(Hs(e))}"`,`data-stage-status-key="${r(e.status||"idle")}"`,`data-stage-status="${r(s.label)}"`,`data-stage-percent="${r(At(e.percent))}"`,`data-stage-counts="${r(wi(e))}"`,`data-stage-duration="${r(Mn(e.duration_ms||0))}"`,`data-stage-contribution="${r(At(e.contribution_percent))}"`,`data-stage-message="${r(e.message||"")}"`].join(" ")}function Kc(e){let t=String(e.status||"idle");if(t!=="failed")return vt(t);let s=String(e.error||e.message||"\u968E\u6BB5\u57F7\u884C\u5931\u6557\u3002").trim(),a=String(e.resolution||"\u67E5\u770B .run \u76EE\u9304\u4E2D\u7684\u6700\u65B0\u65E5\u8A8C\u53D6\u5F97\u5B8C\u6574 traceback\uFF0C\u4FEE\u6B63\u5F8C\u91CD\u65B0\u57F7\u884C\u6B64\u6D41\u7A0B\u3002").trim(),n=`\u539F\u56E0\uFF1A${s}
\u5EFA\u8B70\uFF1A${a}`;return`<span class="badge badge-danger is-failure-tip" tabindex="0" aria-label="${r(n)}" data-failure-tip="${r(n)}"><span class="status-dot is-danger"></span>\u5931\u6557</span>`}function Yc(e){let t=String(e.status||"idle"),s=Number(e.financial_processed),a=Number(e.financial_matched),n=e.key==="filter"&&e.financial_processed!==null&&e.financial_processed!==void 0&&Number.isFinite(s)&&Number.isFinite(a)&&s>0,i=n?a/s*100:0,o=n?`<span class="processing-financial-ratio" title="\u91D1\u878D\u6848\u4EF6\u4F54\u6BD4\uFF1A\u672C\u6B21\u91D1\u878D\u6848\u4EF6\u6578 / \u672C\u6B21\u7D2F\u8A08\u5DF2\u8655\u7406\u539F\u59CB\u5224\u6C7A\u6578">
        <span class="processing-financial-ratio-count">\u91D1\u878D\u6848\u4EF6<strong class="mono">${d(a)}</strong></span>
        <span class="faint" aria-hidden="true">/</span>
        <span class="processing-financial-ratio-count">\u5168\u90E8\u6848\u4EF6<strong class="mono">${d(s)}</strong></span>
        <strong class="mono">\u91D1\u878D\u4F54\u6BD4${Math.round(i)}%</strong>
      </span>`:"",l=e.key==="postgres"&&e.total!==null&&e.total!==void 0?`\u7E3D\u8A08 ${d(e.total)} \u7B46`:wi(e),u=e.key==="filter"?String(e.message||"").replace(/\s*[，,]\s*命中\s*[\d,]+\s*筆。?\s*$/,"\u3002"):String(e.message||"");return`<div class="processing-workflow-stage${t==="running"?" is-running":""}" style="--stage-color:${r(Hs(e))}" ${xa(e)}>
    <div class="processing-workflow-stage-head">
      <span class="processing-workflow-stage-swatch"></span>
      <span class="processing-workflow-stage-label">${r(e.label||e.key||"\u968E\u6BB5")}</span>
      ${Kc(e)}
      <span class="processing-workflow-stage-percent mono">${At(e.percent)}</span>
    </div>
    ${_c(e)}
    <div class="processing-workflow-stage-meta">
      ${e.key==="filter"?"":`<span>${r(l)}</span>
      <span class="mono">${ge(e.duration_ms||0)}</span>`}
      <span class="processing-workflow-stage-message">${r(u||"\u2014")}</span>
      ${o}
    </div>
  </div>`}function Xc(e){let t=e.progress||{},s=Array.isArray(t.stages)?t.stages:[];if(!s.length)return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
      <div class="side-card-head">
        <span class="side-card-title">${f("activity",14)}\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C\u6B64\u6D41\u7A0B\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A host/model\u3001Blue-Green \u5EFA\u7F6E\u8207\u5404\u968E\u6BB5\u9032\u5EA6\u3002</div>
    </section>`;let a=new Map(s.map(y=>[String(y.key||""),y])),n=a.get("ollama")||{},i=a.get("qdrant")||{},o=a.get("validate")||{},l=e.index_runtime||{},u=l.summary||{},c=l.copy||{},p=l.current||{},$=l.embedding||{},v=$.selected||{},g=$.active||{},m=Number(l.expected_count||u.total||i.total||0),w=Number(u.indexed??i.current??0),S=m>0?Math.min(100,w/m*100):i.status==="success"?100:0,M=Number(c.total||0),j=Number(c.copied||0),B=M>0?Math.min(100,j/M*100):c.status==="success"?100:0,U=String(l.build_mode||""),W=String(t.run_status||""),K=!!W&&!["running","success","no_change"].includes(W),ye=String(c.status||(U==="reuse"?"pending":"skipped"));K&&ye==="pending"&&(ye="stale");let pe=String(o.status||"pending"),z=pe==="success"&&/alias 已切換/.test(String(o.message||"")),E=z?"success":pe==="failed"?"failed":W==="running"?"pending":"skipped",x=l.version_id?`v${String(l.version_id).padStart(3,"0")}`:"\u2014",C=g.host||v.host||g.url||v.url||"\u2014",se=g.port||v.port,me=se?`${C}:${se}`:String(C),V=g.model||v.model||l.model||"\u2014",Y=p.month?`${qa(p.month)}${p.preparing?"\uFF08\u6E96\u5099\u4E2D\uFF09":""}`:t.run_status==="running"?"\u6E96\u5099\u4E2D":"\u2014",ae=[{key:"probe",label:"Ollama \u4E3B\u6A5F\uFF0F\u6A21\u578B\u6E2C\u8A66",caption:"\u4E3B\u6A5F\uFF0F\u6A21\u578B\u3001\u9023\u7DDA\u6E2C\u8A66",color:"#22c55e",status:n.status||"pending",percent:Number(n.percent)||0,current:Number(n.current)||0,total:Number(n.total)||0,unit:"\u53F0",duration_ms:n.duration_ms,started_at:n.started_at,finished_at:n.finished_at,extraDetails:[["\u4E3B\u6A5F",me],["\u6A21\u578B",V],["\u6E2C\u8A66\u4E3B\u6A5F",`${d(n.current||0)} / ${d(n.total||0)} \u53F0`]],detail:`${d(n.current||0)} / ${d(n.total||0)} \u53F0 \xB7 ${me} \xB7 ${V}`},{key:"version",label:"\u5EFA\u7ACB\uFF0F\u63A5\u7E8C Blue-Green \u7248\u672C",caption:"Blue-Green \u7248\u672C\u3001collection",color:"#06b6d4",status:l.version_id?"success":"pending",percent:l.version_id?100:0,current:l.version_id?1:0,total:1,unit:"\u968E\u6BB5",duration_ms:l.version_duration_ms,started_at:null,finished_at:null,extraDetails:[["\u7248\u672C",x],["Collection",l.collection||"\u2014"],["\u6A21\u5F0F",U||"\u2014"]],detail:`${x} \xB7 ${l.collection||"\u2014"} \xB7 ${U||"\u2014"}`},{key:"copy",label:"\u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF",caption:"\u820A collection \u5411\u91CF\u8907\u88FD",color:"#f59e0b",status:ye,percent:B,current:j,total:M,unit:"points",duration_ms:c.duration_ms,started_at:c.started_at,finished_at:c.finished_at,extraDetails:[["\u5DF2\u8907\u88FD",`${d(j)} points`],["\u7E3D points",d(M)]],detail:M>0?`${d(j)} / ${d(M)} points \xB7 \u820A collection \u5411\u91CF`:ye==="skipped"?"\u672C\u6B21\u4E0D\u9700\u8907\u88FD\u820A\u5411\u91CF":ye==="stale"?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u5B8C\u6210\u8907\u88FD":"\u7B49\u5F85\u820A collection \u8907\u88FD"},{key:"index",label:"\u91D1\u878D\u5224\u6C7A\u5411\u91CF\u7D22\u5F15",caption:"\u91D1\u878D\u5224\u6C7A\u5411\u91CF\u3001\u6279\u6B21\u9032\u5EA6",color:"#a78bfa",status:i.status||"pending",percent:S,current:w,total:m,unit:"\u7B46",duration_ms:i.duration_ms,started_at:i.started_at||l.started_at,finished_at:i.finished_at,extraDetails:[["\u5DF2\u7D22\u5F15",`${d(w)} / ${d(m)} \u7B46`],["\u91CD\u7528",d(u.reused)],["\u65B0 embedding",d(u.embedded)],["\u76EE\u524D\u6708\u4EFD",Y]],detail:`${d(w)} / ${d(m)} \u7B46 \xB7 \u91CD\u7528 ${d(u.reused)} \xB7 \u65B0 embedding ${d(u.embedded)}`},{key:"validate",label:"\u9A57\u8B49\u65B0\u7248\u672C",caption:"\u7B46\u6578\u3001\u7DAD\u5EA6\u3001payload",color:"#eab308",status:pe,percent:pe==="success"?100:0,current:null,total:null,duration_ms:o.duration_ms,started_at:o.started_at,finished_at:o.finished_at,extraDetails:[["\u9A57\u8B49\u8A0A\u606F",o.message||"\u7B49\u5F85\u7D22\u5F15\u5B8C\u6210"]],detail:o.message||(K?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u9032\u884C\u9A57\u8B49\u3002":"\u7B49\u5F85\u7D22\u5F15\u5B8C\u6210\u5F8C\u9A57\u8B49\u7B46\u6578\u3001\u7DAD\u5EA6\u8207 payload\u3002")},{key:"activate",label:"\u5207\u63DB alias",caption:"judgments_current alias",color:"#3b82f6",status:E,percent:z?100:0,current:null,total:null,duration_ms:0,started_at:null,finished_at:null,extraDetails:[["\u76EE\u6A19 alias","judgments_current"]],detail:z?o.message:K?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u5207\u63DB alias\u3002":"\u9A57\u8B49\u901A\u904E\u5F8C\u5207\u63DB judgments_current\u3002"}],ee=ae.filter(y=>y.status!=="skipped"),ke=ee.length?ee.reduce((y,A)=>y+A.percent,0)/ee.length:0,H=ae.filter(y=>y.status==="success").length,ve=At(ke),je=Date.now(),xe=y=>{let A=Number(y.duration_ms)||0,G=Date.parse(y.started_at||"");if(y.status==="running"&&Number.isFinite(G))return Math.max(A,je-G);if(A>0)return A;let F=Date.parse(y.finished_at||"");return Number.isFinite(G)&&Number.isFinite(F)?Math.max(0,F-G):0},at=ae.map(y=>{let A=xe(y);return{...y,computedDuration:A,drawable:!["skipped","pending"].includes(y.status)}}),De=Math.max(at.reduce((y,A)=>y+(A.drawable?A.computedDuration:0),0),Number(t.duration_ms)||0,1),Fe=1.25,Ae=at.map(y=>y.drawable?Math.max(y.computedDuration/De*100,Fe):0),Ue=Ae.reduce((y,A)=>y+A,0),We=Ue>100?100/Ue:1,lt=0,O=at.map((y,A)=>{let G=Ae[A]*We,F=G>0?{start:lt,width:G}:null;return F&&(lt+=G),{...y,bar:F}}).map((y,A)=>{let G=[`is-${y.status}`,y.status==="failed"||y.status==="stale"?"is-error":"",["pending","skipped"].includes(y.status)?"is-missing":"",y.status==="running"?"is-running":""].filter(Boolean).join(" "),F=["pending","skipped"].includes(y.status)?"\u2014":Mn(y.computedDuration),Ce=y.status==="running"?` \xB7 ${At(y.percent)}`:"",Ne="";if(y.bar){let rt=Math.max(0,Math.min(100,y.bar.start)),Ge=Math.max(0,Math.min(100-rt,y.bar.width)),Mt=y.status==="success"?100:Math.max(0,Math.min(100,Number(y.percent)||0)),et=Ge*Mt/100,Ke=Ge-et,Rt=r(y.color);et>0&&(Ne+=`<span class="rag-wf-bar index-wf-bar is-sequential" style="left:${rt.toFixed(3)}%;width:${et.toFixed(4)}%;top:0;height:12px;--bar-color:${Rt}" aria-hidden="true"></span>`),Ke>1e-4&&(Ne+=`<span class="rag-wf-bar index-wf-bar is-hollow is-sequential" style="left:${(rt+et).toFixed(3)}%;width:${Ke.toFixed(4)}%;top:0;height:12px;--bar-color:${Rt}" aria-hidden="true"></span>`)}let Pe=[],nt=(rt,Ge)=>{Ge==null||Ge===""||Pe.push(`<span class="rag-wf-detail"><span>${r(rt)}</span><strong>${r(String(Ge))}</strong></span>`)};nt("\u72C0\u614B",zs(y.status).label),nt("\u958B\u59CB",y.started_at?qe(y.started_at):"\u2014"),nt("\u7D50\u675F",y.finished_at?qe(y.finished_at):"\u2014"),nt("\u8017\u6642",F),nt("\u9032\u5EA6",At(y.percent));for(let[rt,Ge]of y.extraDetails||[])nt(rt,Ge);nt("\u8AAA\u660E",y.detail);let it={...y,duration_ms:y.computedDuration,contribution_percent:ee.length?(Number(y.percent)||0)/ee.length:null,message:y.detail};return`<details class="rag-wf-stage index-wf-stage ${G}" data-index-stage="${r(y.key)}"${qn.has(y.key)?" open":""} style="--stage-color:${r(y.color)}" ${xa(it)}>
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="index-wf-step">${String(A+1).padStart(2,"0")}</span> ${r(y.label)}</strong><small>${r(y.caption||"")}</small></span>
            </span>
            <span class="rag-wf-stage-meta">${r(F)}${r(Ce)} \xB7 ${r(zs(y.status).label)} <span class="rag-wf-chevron">${f("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px">${Ne}</span>
        </summary>
        <div class="rag-wf-details">${Pe.join("")}</div>
      </details>`}).join("");return`<section class="report-card processing-card processing-workflow-progress-card index-wf-card" data-workflow-progress>
    <div class="side-card-head">
      <span class="side-card-title">${f("activity",14)}\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</span>
      <span class="badge ${t.run_status==="running"?"badge-info":"badge-neutral"}">${d(H)} / ${d(ee.length)} \u968E\u6BB5</span>
    </div>
    <div class="index-wf-summary">
      <span>\u6574\u9AD4 <strong class="mono">${ve}</strong></span>
      <span>\u7248\u672C <strong class="mono">${r(x)}</strong></span>
      <span>Collection <strong class="mono">${r(l.collection||"\u2014")}</strong></span>
      <span>\u6A21\u5F0F <strong>${r(U||"\u2014")}</strong></span>
      <span>Host <strong class="mono">${r(me)}</strong></span>
      <span>Model <strong class="mono">${r(V)}</strong></span>
      <span>\u76EE\u524D <strong>${r(Y)}</strong></span>
    </div>
    <div class="index-wf-chart">
      <div class="rag-wf-axis">
        <span>0 ms</span>
        <span>${De>0?r(Mn(De)):"\u2014"}</span>
      </div>
      <div class="rag-wf-stages">${O}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7684\u7D50\u675F\u5373\u4E0B\u4E00\u968E\u6BB5\u7684\u958B\u59CB\uFF1B\u5DF2\u5B8C\u6210\u968E\u6BB5\u586B\u6EFF\u984F\u8272\uFF0C\u9032\u884C\u4E2D\u6216\u672A\u5B8C\u6210\u968E\u6BB5\u53EA\u8457\u8272\u5DF2\u5B8C\u6210\u6BD4\u4F8B\uFF0C\u5176\u9918\u4EE5\u540C\u8272\u7A7A\u5FC3\u6846\u8868\u793A\uFF0C\u7B49\u5F85\u8207\u7565\u904E\u968E\u6BB5\u4E0D\u7E6A\u88FD bar\u3002\u6975\u77ED\u968E\u6BB5\u6703\u4EE5\u6700\u5C0F\u53EF\u898B\u5BEC\u5EA6\u5448\u73FE\u3002\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u9032\u5EA6\u8207\u8A73\u7D30\u6578\u64DA\u3002</p>
    </div>
    <div class="index-wf-overall">
      <div class="index-wf-overall-head">
        <span>\u6574\u9AD4\u9032\u5EA6</span>
        <span class="mono">${ve}</span>
      </div>
      <div class="index-wf-overall-track">
        <span style="width:${Math.max(0,Math.min(100,ke)).toFixed(1)}%"></span>
      </div>
    </div>
  </section>`}function Zc(e){if(e.id==="index_versions")return Xc(e);let t=e.progress||{},s=Array.isArray(t.stages)?t.stages:[];if(!s.length)return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
      <div class="side-card-head">
        <span class="side-card-title">${f("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C\u6B64\u6D41\u7A0B\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A\u5404\u968E\u6BB5\u8207\u6574\u9AD4\u9032\u5EA6\u3002</div>
    </section>`;let a=t.overall_percent,i=s.filter(v=>v.status!=="skipped").filter(v=>Number(v.contribution_percent)>0).map(v=>`<span class="processing-workflow-progress-segment" style="width:${Number(v.contribution_percent)||0}%;background:${r(Hs(v))}" ${xa(v)}></span>`).join(""),o=s.map(v=>`<div class="processing-workflow-progress-legend-item${v.status==="skipped"?" is-skipped":""}" ${xa(v)}>
        <span class="processing-workflow-progress-swatch" style="background:${r(Hs(v))}"></span>
        <span class="processing-workflow-progress-legend-label">${r(v.label||v.key||"\u968E\u6BB5")}</span>
        <span class="mono">${At(v.percent)}</span>
      </div>`).join(""),l=Number(t.completed_stages)||0,u=Number(t.total_stages)||0,c=s.filter(v=>v.status==="skipped").length,p=c?`\u5B8C\u6210 ${l} \xB7 \u7565\u904E ${c}`:`${l} / ${u} \u968E\u6BB5`,$=wc[e.id]||"";return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
    <div class="side-card-head">
      <span class="side-card-title">${f("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
      <span class="badge ${t.run_status==="running"?"badge-info":"badge-neutral"}">${p}</span>
    </div>
    <div class="processing-workflow-stage-list">${s.map(Yc).join("")}</div>
    <div class="processing-workflow-overall">
      <div class="processing-workflow-overall-head">
        <span>\u6574\u9AD4\u9032\u5EA6</span>
        <span class="mono">${At(a)}</span>
      </div>
      <div class="processing-workflow-progress-stack" role="img" aria-label="\u5404\u968E\u6BB5\u9032\u5EA6\u52A0\u7E3D">${i||'<span class="processing-workflow-progress-empty">\u5C1A\u7121\u53EF\u8A08\u7B97\u9032\u5EA6</span>'}</div>
      <div class="processing-workflow-progress-legend">${o}</div>
      <div class="processing-workflow-progress-hint">\u5C07\u6ED1\u9F20\u79FB\u5230\u4EFB\u4E00\u968E\u6BB5\u6216\u8272\u584A\uFF0C\u53EA\u6703\u4FDD\u7559\u8A72\u9805\u76EE\u4E26\u986F\u793A\u8AAA\u660E\uFF1B\u7565\u904E\u968E\u6BB5\u4E0D\u5217\u5165\u6574\u9AD4\u9032\u5EA6\u3002</div>
    </div>
    ${$?`<p class="processing-workflow-scope-note">${f("info",12)}<span>${r($)}</span></p>`:""}
  </section>`}function qa(e){let t=String(e||"");return t.length===6?`${t.slice(0,4)}-${t.slice(4)}`:t||"\u2014"}function ed(e,t){let s={primary:"\u4E3B\u8981",fallback:"\u5099\u63F4",provided:"\u5916\u90E8"},a=Array.isArray(e.models)?e.models:[],n=a.length?a.join("\u3001"):"\u2014";return`<div class="index-host-row${e.url&&e.url===t?" is-selected":""}">
    <div class="index-host-head">
      <span class="badge badge-neutral">${r(s[e.role]||e.role||"\u4E3B\u6A5F")}</span>
      <strong class="mono">${r(e.host||"\u2014")}:${r(e.port??"\u2014")}</strong>
      ${vt(e.status||"unavailable")}
      <span class="index-host-model">${r(e.model||"\u2014")}</span>
    </div>
    <div class="index-host-url mono">${r(e.url||"\u2014")}</div>
    <div class="index-host-models" title="${r(n)}">\u6A21\u578B\uFF1A${r(n)}</div>
    ${e.detail?`<div class="index-host-detail">${r(e.detail)}</div>`:""}
  </div>`}function td(e){let t=Array.isArray(e.months)?e.months:[],s=new Map;for(let n of t){let i=String(n.month||"");if(!/^\d{6}$/.test(i))continue;let o=s.get(i);o||(o={total:0,processed:0},s.set(i,o)),o.total+=Number(n.total)||0,o.processed+=Number(n.processed)||0}let a=0;for(let n of s.values())n.total>0&&n.processed>=n.total&&(a+=1);return{completed:a,total:s.size}}function sd(e){let t=Array.isArray(e.months)?e.months:[],s=e.current||{},a=e.active_coverage||{},n=new Map;for(let u of t){let c=String(u.month||"");if(!/^\d{6}$/.test(c))continue;let p=Number(c.slice(4,6));if(p<1||p>12)continue;let $=n.get(c);$||($={key:c,year:c.slice(0,4),monthNo:p,total:0,processed:0,activeTotal:0,activeProcessed:0,reused:0,embedded:0,archives:[],current:!1,preparing:!1,jid:""},n.set(c,$)),$.total+=Number(u.total)||0,$.processed+=Number(u.processed)||0;let v=a[c]||{};$.activeTotal=Math.max($.activeTotal,Number(v.total)||0),$.activeProcessed=Math.max($.activeProcessed,Number(v.processed)||0),$.reused+=Number(u.reused)||0,$.embedded+=Number(u.embedded)||0,u.archive&&$.archives.push(String(u.archive)),s.month===c&&(!s.archive||s.archive===u.archive)&&($.current=!0,$.preparing=!!s.preparing,$.jid=String(s.jid||""))}if(!n.size)return'<div class="processing-workflow-empty">\u5C1A\u7121\u53EF\u986F\u793A\u7684\u7D22\u5F15\u6708\u4EFD\uFF1B\u958B\u59CB\u7D22\u5F15\u5F8C\u6703\u4F9D\u6642\u9593\u5217\u51FA\u6708\u4EFD\u72C0\u614B\u3002</div>';let i={active:0,reuseComplete:0,reuseIncomplete:0,embedComplete:0,embedIncomplete:0};for(let u of n.values()){let c=u.total>0&&u.processed>=u.total,p=u.activeTotal>0&&u.activeProcessed>=u.activeTotal,$=u.embedded>0?"embed":u.reused>0||p?"reuse":"embed";u.kind=$,u.currentComplete=c,u.status=c?"green":u.processed>0?"red":p?"green":"gray",$==="reuse"?c?i.reuseComplete+=1:i.reuseIncomplete+=1:c?i.embedComplete+=1:i.embedIncomplete+=1,p&&(i.active+=1)}let l=[...new Set([...n.values()].map(u=>u.year))].sort((u,c)=>c.localeCompare(u)).map(u=>{let c=Array.from({length:12},(p,$)=>{let v=$+1,g=`${u}${String(v).padStart(2,"0")}`,m=n.get(g);if(!m)return`<td class="judgment-month is-empty"><span>${v}</span></td>`;let w=m.total?`${Math.min(100,Math.round(m.processed/m.total*1e3)/10)}%`:"\u2014",S=m.current&&e.run_status==="running",M=[`${m.year}-${String(m.monthNo).padStart(2,"0")}`,m.archives.join("\u3001")||"\u2014",`\u65B0\u7248\u672C ${d(m.processed)} / ${d(m.total)}\uFF08${w}\uFF09`,m.activeTotal>0?`active ${d(m.activeProcessed)} / ${d(m.activeTotal)}\uFF08${(100*m.activeProcessed/m.activeTotal).toFixed(1)}%\uFF09`:"",`\u91CD\u7528 ${d(m.reused)} \xB7 \u65B0 embedding ${d(m.embedded)}`,m.currentComplete?"":m.kind==="reuse"?"\u5F85\u5B8C\u6210\uFF1AR \u65E2\u6709\u5411\u91CF\u91CD\u7528":"\u5F85\u5B8C\u6210\uFF1AE \u65B0 embedding",m.current?`${S?m.preparing?"\u6E96\u5099\u7D22\u5F15":"\u76EE\u524D\u7D22\u5F15":"\u6700\u5F8C\u7D22\u5F15"}${m.jid?` \xB7 ${m.jid}`:""}`:""].filter(Boolean).join(" \xB7 "),j=m.activeTotal>0?Math.min(100,100*m.activeProcessed/m.activeTotal):0,B=m.total>0?Math.min(100,100*m.reused/m.total):0,U=m.total>0?Math.min(100,100*m.embedded/m.total):0,W=m.kind==="reuse"&&!m.currentComplete,K=m.kind==="embed"&&!m.currentComplete,ye=m.total?Math.min(100,100*m.processed/m.total):0,pe=S&&ye>0&&!m.currentComplete,z=pe?" is-progressing":"",E=pe?` style="--month-progress:${ye.toFixed(1)}%"`:"";return`<td class="judgment-month index-month index-month-are is-${m.status}${S?" is-active":""}${z}" title="${r(M)}"${E}${S?' aria-current="true"':""}><span class="index-month-number">${v}</span><span class="index-month-blocks" aria-hidden="true"><span class="index-month-block is-active" style="--fill:${j.toFixed(1)}%"></span><span class="index-month-block is-reuse${W?" is-incomplete":""}" style="--fill:${B.toFixed(1)}%"></span><span class="index-month-block is-embed${K?" is-incomplete":""}" style="--fill:${U.toFixed(1)}%"></span></span></td>`}).join("");return`<tr><th scope="row">${r(u)}</th>${c}</tr>`}).join("");return`<div class="judgment-months index-months">
    <div class="judgment-months-meta">
      <span class="badge badge-ok" title="A\uFF1A\u4E0A\u4E00\u500B\u6B63\u5F0F\u7248\u672C\u7684\u65E2\u6709\u8986\u84CB\uFF0C\u4E0D\u5217\u5165\u65B0\u7248\u672C\u5B8C\u6210\u6578">A \u57FA\u7DDA ${d(i.active)}</span>
      <span class="badge badge-reuse" title="R \u5B8C\u6210\uFF1A\u65B0\u7248\u672C\u5DF2\u5B8C\u6210\u4E14\u8A72\u6708\u5168\u90E8\u6CBF\u7528\u65E2\u6709\u5411\u91CF">R \u5B8C\u6210 ${d(i.reuseComplete)}</span>
      <span class="badge badge-reuse-outline" title="R \u672A\u5B8C\u6210\uFF1A\u8A72\u6708\u4ECD\u9700\u6216\u6B63\u5728\u9032\u884C\u65E2\u6709\u5411\u91CF\u91CD\u7528">R \u672A\u5B8C\u6210 ${d(i.reuseIncomplete)}</span>
      <span class="badge badge-embed" title="E \u5B8C\u6210\uFF1A\u65B0\u7248\u672C\u5DF2\u5B8C\u6210\u4E14\u8A72\u6708\u5305\u542B\u65B0 embedding">E \u5B8C\u6210 ${d(i.embedComplete)}</span>
      <span class="badge badge-embed-outline" title="E \u672A\u5B8C\u6210\uFF1A\u8A72\u6708\u4ECD\u9700\u6216\u6B63\u5728\u9032\u884C\u65B0 embedding">E \u672A\u5B8C\u6210 ${d(i.embedIncomplete)}</span>
      <span class="muted">\u5171 ${d(n.size)} \u500B\u6708</span>
    </div>
    <div class="index-month-are-key" aria-label="\u7D22\u5F15\u6708\u4EFD\u65B9\u683C\u5716\u4F8B">
      <span><i class="is-active"></i>A \xB7 \u4E0A\u4E00\u500B\u6B63\u5F0F\u7248\u672C\u65E2\u6709\u8986\u84CB\uFF0C\u4E0D\u5217\u5165\u672C\u6B21\u65B0\u7248\u672C\u5B8C\u6210\u6578</span>
      <span><i class="is-reuse"></i>R \xB7 \u672C\u6B21\u6CBF\u7528\u65E2\u6709\u5411\u91CF\uFF0C\u4E0D\u91CD\u65B0\u8A08\u7B97 embedding</span>
      <span><i class="is-embed"></i>E \xB7 \u672C\u6B21\u91CD\u65B0\u8A08\u7B97 embedding \u7684\u65B0\u589E\u6216\u8B8A\u66F4\u5411\u91CF</span>
      <span><i class="is-outline"></i>\u7A7A\u5FC3\u6846 \xB7 \u8A72\u6708 R\uFF0FE \u5C1A\u672A\u5B8C\u6210</span>
      <span><i class="is-progress"></i>\u9032\u884C\u4E2D \xB7 \u6708\u4EFD\u683C\u5E95\u8272\u986F\u793A\u8A72\u6708\u76EE\u524D\u9032\u5EA6</span>
    </div>
    <div class="judgment-months-scroll">
      <table class="judgment-months-table index-months-table">
        <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(u,c)=>`<th scope="col">${c+1}</th>`).join("")}</tr></thead>
        <tbody>${l}</tbody>
      </table>
    </div>
    <p class="judgment-months-hint">\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\u70BA A\uFF08\u4E0A\u4E00\u500B\u6B63\u5F0F\u7248\u672C\u65E2\u6709\u8986\u84CB\uFF09\u3001R\uFF08\u91CD\u7528\u5411\u91CF\uFF09\u3001E\uFF08\u65B0 embedding\uFF09\u3002A \u4E0D\u5217\u5165\u65B0\u7248\u672C\u5B8C\u6210\u6578\uFF0CR\uFF0FE \u624D\u662F\u672C\u6B21\u5EFA\u7F6E\u9032\u5EA6\uFF1B\u586B\u6EFF\u8868\u793A\u5B8C\u6210\uFF0C\u7A7A\u5FC3\u6846\u8868\u793A\u8A72\u6708 R\uFF0FE \u5C1A\u672A\u5B8C\u6210\u3002\u7DA0\u8272\uFF1A\u65B0\u7248\u672C\u5B8C\u6210\u6216 active \u57FA\u7DDA\uFF1B\u7070\u8272\uFF1A\u5C1A\u672A\u958B\u59CB\uFF1B\u7D05\u8272\uFF1A\u65B0\u7248\u672C\u8655\u7406\u4E2D\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u65B0\u7248\u672C\u8207 active \u7B46\u6578\u3001\u4F86\u6E90\u6A94\u6848\u8207\u76EE\u524D\u6848\u865F\u3002</p>
  </div>`}function ad(e){let t=e.import_timeline||{},s=Array.isArray(t.months)?t.months:[];if(!s.length)return`<section class="report-card processing-card import-files-card">
      <div class="side-card-head">
        <span class="side-card-title">${f("table",14)}\u532F\u5165\u6A94\u6848\u6642\u9593\u8868</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u5C1A\u672A\u53D6\u5F97\u5224\u6C7A\u4E0B\u8F09 manifest \u6216\u672C\u6A5F\u58D3\u7E2E\u6A94\uFF1B\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u5F8C\u6703\u986F\u793A\u6708\u4EFD\u72C0\u614B\u3002</div>
    </section>`;let a=new Map(s.map($=>[String($.month),$])),n=[...new Set(s.map($=>$.year))].sort(($,v)=>v-$),i=s.find($=>$.active),o=t.stage_summary||{},l=n.map($=>{let v=Array.from({length:12},(g,m)=>{let w=m+1,S=`${$}${String(w).padStart(2,"0")}`;return jc(t,a.get(S),$,w)}).join("");return`<tr><th scope="row">${r($)}</th>${v}</tr>`}).join(""),u=t.summary||{},c=t.stage_labels||{},p=i?`<div class="index-current-row">${ki({activeMonth:t.active_month||String(i.month||""),activeArchive:t.active_archive||i.active_archive||"",activePhase:t.active_phase||"",processingMonth:t.processing_month||"",processingArchive:t.processing_archive||"",stageLabels:c})}</div>`:"";return`<section class="report-card processing-card import-files-card" data-import-timeline="judgment">
    <div class="side-card-head">
      <span class="side-card-title">${f("table",14)}\u532F\u5165\u6A94\u6848\u6642\u9593\u8868</span>
      <span class="badge badge-neutral">${d(t.total_months||s.length)} \u500B\u6708</span>
    </div>
    <div class="judgment-months index-months">
      <div class="judgment-months-meta">
        <span class="badge badge-ok">\u5B8C\u6210 ${d(o.complete||0)}</span>
        <span class="badge badge-danger">\u672A\u5B8C\u6210 ${d(o.incomplete||0)}</span>
        <span class="badge badge-neutral">\u8655\u7406\u4E2D ${d(o.processing||0)}</span>
        <span class="badge badge-info">\u6709\u66F4\u65B0 ${d(u.gray||0)}</span>
        <span class="muted">\u5171 ${d(t.total_months||s.length)} \u500B\u6708</span>
      </div>
      ${p}
      <div class="judgment-months-scroll">
        <table class="judgment-months-table import-months-table processing-months-table">
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},($,v)=>`<th scope="col">${v+1}</th>`).join("")}</tr></thead>
          <tbody>${l}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\uFF1ARAR \u6AA2\u67E5\uFF0F\u89E3\u58D3\u7E2E\u3001\u539F\u59CB\u8CC7\u6599\u6AA2\u67E5\uFF0FParquet \u5099\u4EFD\u3001\u91D1\u878D\u6CD5\u898F\u7BE9\u9078\u3001PostgreSQL metadata\u3002\u539F\u59CB\u8CC7\u6599\u968E\u6BB5\u6703\u5148\u6AA2\u67E5\u65E2\u6709 Parquet\uFF0C\u53EF\u6CBF\u7528\u6642\u4E0D\u91CD\u65B0\u5099\u4EFD\uFF1B\u7F3A\u5C11\u6642\u6703\u986F\u793A\u300C\u5EFA\u7ACB YYYY-MM \u5099\u4EFD\u300D\uFF0C\u5B8C\u6210\u5F8C\u986F\u793A\u300C\u5DF2\u5EFA\u7ACB\u5099\u4EFD\u300D\u3002\u7BE9\u9078\u8207 PostgreSQL \u968E\u6BB5\u6703\u986F\u793A\u76EE\u524D\u8655\u7406\u7684\u6708\u4EFD\u8207 archive\u3002\u7DA0\u8272\uFF1A\u5DF2\u5B8C\u6210\uFF08\u542B\u5148\u524D run \u5DF2\u532F\u5165\u3001\u672C\u6B21\u5C1A\u672A\u91CD\u8DD1\uFF09\uFF1B\u7D05\u8272\uFF1A\u5C1A\u672A\u5B8C\u6210\u6216\u672C\u6B21\u6709\u5F85\u532F\u5165\u6A94\u6848\uFF1B\u7070\u8272\uFF1A\u672C\u6B21\u8655\u7406\u4E2D\uFF1B\u7A7A\u767D\uFF1A\u7121\u8CC7\u6599\u3002\u9EDE\u9078\u7D05\u8272\u968E\u6BB5\u53EF\u56DE\u5230\u5224\u6C7A\u532F\u5165\u6D41\u7A0B\u3002</p>
    </div>
  </section>`}function nd(e,t,s){let n=[t.run_id||e.active_run?.id||e.last_run?.id||"",t.version_id??"",t.collection||"",t.started_at||""].join("|"),i=Date.now(),o=pi.get(n);if(!o){let v=Date.parse(t.started_at||""),g=Date.parse(t.finished_at||""),m=Date.parse(t.updated_at||"");t.run_status!=="running"&&Number.isFinite(v)&&(Number.isFinite(g)||Number.isFinite(m))?o={at:v,indexed:0}:o={at:i,indexed:Math.max(0,s)},pi.set(n,o)}let l=Date.parse(t.finished_at||""),u=Date.parse(t.updated_at||""),c=t.run_status==="running"?i:Number.isFinite(l)?l:Number.isFinite(u)?u:i,p=Math.max(0,(c-Number(o.at||0))/1e3),$=Math.max(0,Number(s)-Number(o.indexed||0));return p<=0||$<=0?0:$/p}function Mn(e){let t=Number(e);return!Number.isFinite(t)||t<0?"\u2014":t>=36e5?ji(t):ge(t)}function ji(e){if(!Number.isFinite(e)||e<0)return"\u2014";let t=Math.max(0,Math.round(e/1e3)),s=Math.floor(t/3600),a=Math.floor(t%3600/60),n=t%60,i=String(n).padStart(2,"0");return s>0?`${s}h ${String(a).padStart(2,"0")}m ${i}s`:a>0?`${a}m ${i}s`:`${n}s`}function rd(e,t,s,a){let n=Date.parse(e.started_at||"");if(!Number.isFinite(n))return{elapsedMs:null,estimatedTotalMs:null,remainingMs:null,remainingCount:null};let i=e.run_status==="running",o=Date.parse(e.finished_at||""),l=Date.parse(e.updated_at||""),u=i?Date.now():Number.isFinite(o)?o:Number.isFinite(l)?l:Date.now(),c=Math.max(0,u-n),p=Number(s),$=Number(t);if(!Number.isFinite(p)||p<=0)return{elapsedMs:c,estimatedTotalMs:null,remainingMs:null,remainingCount:null};let v=Math.max(0,p-Math.max(0,Number.isFinite($)?$:0));if(v<=0)return{elapsedMs:c,estimatedTotalMs:c,remainingMs:0,remainingCount:0};if(!i||a<=0)return{elapsedMs:c,estimatedTotalMs:null,remainingMs:null,remainingCount:v};let g=v/a*1e3;return{elapsedMs:c,estimatedTotalMs:c+g,remainingMs:g,remainingCount:v}}function id(e){let t=e.index_runtime||{};if(!t.available)return`<section class="report-card processing-card index-runtime-card">
      <div class="side-card-head">
        <span class="side-card-title">${f("cloud",14)}Ollama \u9023\u7DDA\u6E2C\u8A66</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A\u6E2C\u8A66\u7684\u4E3B\u6A5F\u3001\u6A21\u578B\u8207\u9078\u7528\u7D50\u679C\u3002</div>
    </section>`;let s=!!t.coverage_only,a=t.embedding||{},n=Array.isArray(a.hosts)?a.hosts:[],i=a.selected||{},o=a.active||{},l=t.current||{},u=t.summary||{},c=Number(u.indexed??l.indexed??0),p=s?0:nd(e,t,c),$=td(t),v=s?null:rd(t,c,u.total,p),g=v?.remainingCount>0?`\u8207\u5269\u9918 ${d(v.remainingCount)} \u7B46`:"",m=p>0?`\u4F9D\u672C\u6B21\u5E73\u5747 ${p.toFixed(1)} \u7B46/\u79D2${g}\u4F30\u7B97\uFF1B\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002\u5BE6\u969B\u901F\u5EA6\u6703\u96A8 embedding \u8207\u6279\u6B21\u5927\u5C0F\u8B8A\u52D5\u3002`:"\u5C1A\u7121\u8DB3\u5920\u7684\u672C\u9801\u89C0\u5BDF\u8CC7\u6599\u53EF\u4F30\u7B97\uFF1B\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002",w=K=>r(ji(v?v[K]:null)),S=`<div class="index-runtime-metrics">
    <span class="index-runtime-metric" title="\u5DF2\u5B8C\u6210\u7D22\u5F15\u7684\u6708\u4EFD\u6578\uFF1B\u76EE\u524D\u8655\u7406\u4E2D\u7684\u6708\u4EFD\u4E0D\u5217\u5165\uFF0C\u7E3D\u6578\u70BA\u7D22\u5F15\u7BC4\u570D\u5167\u7684\u6709\u6548\u6708\u4EFD\u3002">
      <span>\u5DF2\u8655\u7406\u6708\u4EFD</span>
      <strong>${d($.completed)} / ${d($.total)}</strong>
    </span>
    <span class="index-runtime-metric" title="\u5DF2\u7D22\u5F15\u7B46\u6578 / \u7D22\u5F15\u7BC4\u570D\u7E3D\u7B46\u6578\u3002">
      <span>\u5DF2\u8655\u7406\u7B46\u6578</span>
      <strong>${d(c)} / ${d(u.total)}</strong>
    </span>
    <span class="index-runtime-metric" title="\u81EA\u672C\u6B21\u9801\u9762\u958B\u59CB\u89C0\u5BDF\u7684\u7D2F\u8A08\u5E73\u5747\uFF1B\u4E2D\u9014\u52A0\u5165\u4EE5\u9996\u6B21\u89C0\u5BDF\u6642\u9593\u8207\u7B46\u6578\u70BA\u57FA\u6E96\u3002\u5F8C\u6BB5\u82E5\u4EE5\u65B0 embedding \u70BA\u4E3B\uFF0C\u901F\u5EA6\u6703\u4E0B\u964D\u3002">
      <span>\u672C\u6B21\u5E73\u5747</span>
      <strong>${p>0?`${p.toFixed(1)} \u7B46/\u79D2`:"\u2014"}</strong>
    </span>
    <span class="index-runtime-metric" title="\u81EA\u672C\u6B21\u7D22\u5F15 run \u958B\u59CB\u6642\u9593 ${r(qe(t.started_at))} \u8D77\u7B97\uFF1B\u4E2D\u9014\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002">
      <span>Elapsed Time</span>
      <strong>${w("elapsedMs")}</strong>
    </span>
    <span class="index-runtime-metric" title="Elapsed Time \u52A0\u4E0A\u4F9D\u5269\u9918\u4EF6\u6578\u8207\u672C\u6B21\u5E73\u5747\u901F\u5EA6\u4F30\u7B97\u7684\u5269\u9918\u6642\u9593\uFF1B\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u5F9E 0 \u91CD\u65B0\u8A08\u6642\u3002">
      <span>Estimated Total</span>
      <strong>${w("estimatedTotalMs")}</strong>
    </span>
    <span class="index-runtime-metric" title="${r(m)}">
      <span>Time Remaining</span>
      <strong>${w("remainingMs")}</strong>
    </span>
  </div>`,M=i.url||"",j=o.url||"",B=n.map(K=>ed(K,M)).join(""),U=t.run_status==="running"?l.preparing?"\u6E96\u5099\u4E2D":"\u76EE\u524D\u8655\u7406":"\u6700\u5F8C\u8655\u7406",W=l.jid?`<div class="index-current-row">
        <span class="badge badge-info">${f("activity",11)}${U}</span>
        <strong class="mono">${r(qa(l.month))}</strong>
        <span class="mono">${r(l.archive||"\u2014")}</span>
        <span class="mono">${r(l.jid||"\u2014")}</span>
        <span class="index-current-copy">${r([l.court,l.title].filter(Boolean).join(" \xB7 ")||"\u2014")}</span>
        <span class="faint">${l.preparing?"\u6E96\u5099\u4E2D":`\u6279\u6B21 ${d(l.batch_size)} \u7B46`}</span>
      </div>`:"";return`<section class="report-card processing-card index-runtime-card"${s?" hidden":""}>
    <div class="side-card-head">
      <span class="side-card-title">${f("cloud",14)}Ollama \u9023\u7DDA\u6E2C\u8A66</span>
      ${vt(a.status||"idle")}
    </div>
    ${t.error?`<div class="processing-update-notice index-runtime-error">${f("alert",13)}<span>${r(t.error)}</span></div>`:""}
    <div class="index-selected-host">
      <span class="faint">\u6700\u5F8C\u9078\u7528</span>
      <strong class="mono">${r(i.url||"\u2014")}</strong>
      <span>${r(i.model||a.model||"\u2014")}</span>
      <span class="mono">port ${r(i.port??"\u2014")}</span>
      ${j&&j!==M?`<span class="badge badge-warn">\u76EE\u524D\u4F7F\u7528 ${r(j)}</span>`:""}
      ${o.using_fallback?'<span class="badge badge-warn">\u5DF2\u5207\u63DB\u5099\u63F4</span>':""}
    </div>
    <div class="index-host-list">${B||'<div class="processing-workflow-empty">\u6C92\u6709\u53EF\u986F\u793A\u7684\u4E3B\u6A5F\u6E2C\u8A66\u7D50\u679C\u3002</div>'}</div>
    ${a.tested_at?`<div class="index-runtime-foot">\u6E2C\u8A66\u6642\u9593 ${r(qe(a.tested_at))}</div>`:""}
  </section>
  <section class="report-card processing-card index-files-card">
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${f("table",14)}\u7D22\u5F15\u6A94\u6848\u6642\u9593\u8868</span>
      ${S}
    </div>
    <div class="index-runtime-summary">
      <span>\u7248\u672C <strong class="mono">v${r(t.version_id??"\u2014")}</strong></span>
      <span>Collection <code>${r(t.collection||"\u2014")}</code></span>
      <span>\u6A21\u5F0F <strong>${r(t.build_mode||"\u2014")}</strong></span>
      ${s?"":`<span>\u91CD\u7528 <strong class="mono">${d(u.reused)}</strong></span>
            <span>\u65B0 embedding <strong class="mono">${d(u.embedded)}</strong></span>`}
    </div>
    ${W}
    ${sd(t)}
    ${s?'<p class="judgment-months-hint index-coverage-note">\u76EE\u524D\u986F\u793A active collection \u7684\u6708\u4EFD\u7D22\u5F15\u8986\u84CB\uFF1B\u57F7\u884C Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u5F8C\u6703\u986F\u793A\u672C\u6B21 Ollama \u6E2C\u8A66\u8207\u5373\u6642\u9032\u5EA6\u3002</p>':""}
  </section>`}function od(e={}){let{storage:t,loading:s,error:a}=e;if(a)return`<section class="report-card processing-card index-storage-card">
      <div class="side-card-head">
        <span class="side-card-title">${f("database",14)}Qdrant \u5132\u5B58\u4F4D\u7F6E</span>
        <button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-index-storage">${f("refresh",12)}<span>\u91CD\u65B0\u6574\u7406</span></button>
      </div>
      <div class="processing-workflow-empty">${r(a)}</div>
    </section>`;if(!t)return`<section class="report-card processing-card index-storage-card">
      <div class="side-card-head">
        <span class="side-card-title">${f("database",14)}Qdrant \u5132\u5B58\u4F4D\u7F6E</span>
        <span class="badge badge-neutral">${s?"\u8B80\u53D6\u4E2D":"\u5C1A\u7121"}</span>
      </div>
      <div class="processing-workflow-empty">${s?"\u6B63\u5728\u53D6\u5F97 Docker \u5BB9\u5668\u8207 volume \u8CC7\u8A0A\u2026":"\u5207\u63DB\u5230\u6B64\u6D41\u7A0B\u5F8C\u6703\u8B80\u53D6 Qdrant \u5BB9\u5668\u8207 volume \u8CC7\u8A0A\u3002"}</div>
    </section>`;let n=t.qdrant_storage||{},o=(Array.isArray(t.databases)?t.databases:[]).find(p=>p.id==="qdrant")||{},l=n.volume_bytes??o.volume_bytes??null,u=n.points_count??o.points_count,c=n.segments_count??o.segments_count;return`<section class="report-card processing-card index-storage-card">
    <div class="side-card-head">
      <span class="side-card-title">${f("database",14)}Qdrant \u5132\u5B58\u4F4D\u7F6E</span>
      <button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-index-storage">${f("refresh",12)}<span>\u91CD\u65B0\u6574\u7406</span></button>
    </div>
    <div class="index-storage-grid">
      <span>Docker \u4E3B\u6A5F</span><strong>${r(n.host||"\u2014")} <span class="faint">(${r(n.docker_context||"default")})</span></strong>
      <span>Container</span><strong class="mono">${r(n.container||"judgment-qdrant")} \xB7 ${r(n.container_state||"unknown")}</strong>
      <span>Image</span><strong class="mono">${r(n.image||"\u2014")}</strong>
      <span>\u5BB9\u5668\u5167\u8DEF\u5F91</span><strong class="mono">${r(n.container_path||"\u2014")}</strong>
      <span>Docker volume</span><strong class="mono">${r(n.volume_name||"\u2014")}</strong>
      <span>Volume \u5BB9\u91CF</span><strong class="mono">${Re(l)}${n.volume_size?` \xB7 ${r(n.volume_size)}`:""}</strong>
      <span>Volume \u4F86\u6E90\u8DEF\u5F91</span><strong class="mono index-storage-path">${r(n.host_path||"\u2014")}</strong>
      <span>Collection</span><strong class="mono">${r(n.collection||o.collection||"\u2014")}</strong>
      <span>Alias</span><strong class="mono">${r(n.alias||"\u2014")}</strong>
      <span>Points\uFF0FSegments</span><strong class="mono">${d(u)} / ${d(c)}</strong>
    </div>
    <div class="index-runtime-foot">\u8CC7\u6599\u6642\u9593 ${r(qe(t.checked_at))}</div>
  </section>`}function Tn({badge:e="",lead:t="",rows:s=[],note:a=""}){return`<section class="report-card processing-card parquet-help-card workflow-help-card">
    <div class="side-card-head">
      <span class="side-card-title">${f("info",14)}\u529F\u80FD\u8AAA\u660E</span>
      ${e?`<span class="badge badge-neutral">${r(e)}</span>`:""}
    </div>
    <div class="parquet-help-body">
      <p class="parquet-help-lead">${t}</p>
      <div class="parquet-help-grid">${s.map(([n,i])=>`<span>${r(n)}</span><strong>${i}</strong>`).join("")}</div>
      ${a?`<p class="parquet-help-note">${a}</p>`:""}
    </div>
  </section>`}function ld(){return Tn({badge:"\u552F\u8B80\u532F\u51FA",lead:"\u5C07 PostgreSQL \u76EE\u524D\u6709\u6548\u7684\u5224\u6C7A\uFF08<code>judgment_documents.is_current = true</code>\uFF09\u532F\u51FA\u6210\u7368\u7ACB\u7684 Parquet \u5FEB\u7167\uFF0C\u4F9B\u96E2\u7DDA\u5206\u6790\u3001\u8CC7\u6599\u4EA4\u63DB\u6216\u4FDD\u5B58\u3002",rows:[["\u4F86\u6E90","PostgreSQL <code>judgment_documents</code>\uFF0C\u53EA\u542B\u76EE\u524D\u6709\u6548\u4E14\u5DF2\u547D\u4E2D\u91D1\u878D\u6CD5\u898F\u6E05\u55AE\u7684\u5224\u6C7A\u3002"],["\u8F38\u51FA",'<span class="mono">JUDGMENT_DATA_DIR/parquet/judgments/YYYYMMDD/HHMMSS-xxxxxxxx/judgments.parquet</span>'],["\u9644\u5E36\u6A94",'<span class="mono">\u540C\u76EE\u9304 manifest.json\uFF08\u7B46\u6578\u3001\u6A94\u6848\u5927\u5C0F\u3001\u6B04\u4F4D\u3001\u7522\u751F\u6642\u9593\uFF09</span>'],["\u5167\u5BB9","\u6848\u865F\u3001\u6CD5\u9662\u3001\u6848\u7531\u3001\u5168\u6587\u3001\u547D\u4E2D\u6CD5\u898F\u3001\u5F15\u7528\u3001\u4F86\u6E90\u58D3\u7E2E\u6A94\u8207\u6642\u9593\u6B04\u4F4D\uFF1B<code>citations</code> \u4EE5 JSON \u5B57\u4E32\u4FDD\u5B58\u3002"],["\u8207\u539F\u59CB Parquet","\u8CC7\u6599\u9801\u8207 <code>source=parquet</code> \u4F7F\u7528 <code>parquet/raw_judgments/.../raw.parquet</code>\uFF1B\u672C\u6D41\u7A0B\u7684 <code>parquet/judgments/...</code> \u662F\u53E6\u4E00\u500B\u6B63\u898F\u5316\u5FEB\u7167\u3002"],["\u4E0D\u6703","\u4E0D\u5BEB\u56DE PostgreSQL\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u820A\u5FEB\u7167\uFF1B\u53EA\u532F\u51FA current \u8CC7\u6599\uFF0C\u4E0D\u542B\u6B77\u53F2\u7248\u672C\u3002"],["\u4E2D\u65B7","\u6BCF\u6B21\u57F7\u884C\u5EFA\u7ACB\u65B0\u7684\u5B8C\u6574\u5FEB\u7167\uFF1B\u4E2D\u65B7\u5F8C\u91CD\u65B0\u57F7\u884C\u4E0D\u6703\u7E8C\u5BEB\u540C\u4E00\u500B Parquet \u6A94\u3002"]],note:"\u9069\u5408 DuckDB\u3001pandas\u3001Spark \u7B49\u96E2\u7DDA\u5206\u6790\uFF0C\u6216\u9700\u8981\u56FA\u5B9A\u6642\u9593\u9EDE\u7684\u53EF\u91CD\u73FE\u8CC7\u6599\u5FEB\u7167\u3002\u65E5\u5E38 RAG \u67E5\u8A62\u8207\u8CC7\u6599\u9801\u700F\u89BD\u4E0D\u9700\u8981\u57F7\u884C\u6B64\u6D41\u7A0B\u3002"})}function cd(){return Tn({badge:"PostgreSQL \u56DE\u586B",lead:"\u5C07\u5224\u6C7A\u7684 <code>court</code> \u8F49\u6210\u6A19\u6E96\u6CD5\u9662\u540D\u7A31\u4E26\u5BEB\u5165 <code>court_normalized</code>\uFF1B\u539F\u59CB <code>court</code> \u6703\u4FDD\u7559\u4F9B\u8FFD\u6EAF\u3002",rows:[["\u8655\u7406\u7BC4\u570D","\u9810\u8A2D\u53EA\u8655\u7406 <code>court_normalized</code> \u70BA\u7A7A\u7684\u8CC7\u6599\uFF1B\u5DF2\u6B63\u898F\u5316\u8CC7\u6599\u6703\u8DF3\u904E\uFF0C\u53EF\u7528 <code>--all</code> \u91CD\u65B0\u8A08\u7B97\u5168\u90E8\u3002"],["\u89E3\u6790\u9806\u5E8F","\u539F\u59CB\u6CD5\u9662\u503C\u958B\u982D\u7B26\u5408\u6A19\u6E96\u540D\u7A31 \u2192 \u5224\u6C7A\u5168\u6587\u524D 8,000 \u5B57\u6700\u65E9\u51FA\u73FE\u7684\u6CD5\u9662 \u2192 \u539F\u59CB\u6CD5\u9662\u503C\u4EFB\u610F\u4F4D\u7F6E\u7684\u6A19\u6E96\u540D\u7A31 \u2192 JID \u5B98\u65B9\u6CD5\u9662\u4EE3\u78BC\u3002"],["\u8F38\u51FA","\u5BEB\u5165 <code>judgment_documents.court_normalized</code>\uFF1B\u4E0D\u4FEE\u6539\u539F\u59CB <code>court</code>\u3001\u5168\u6587\u6216\u5176\u4ED6\u5224\u6C7A\u6B04\u4F4D\u3002"],["\u672A\u89E3\u6790","\u7121\u6CD5\u5224\u65B7\u6642\u4FDD\u7559\u7A7A\u503C\uFF0C\u4E0D\u731C\u6E2C\uFF1B\u6458\u8981\u6703\u5217\u51FA\u672A\u89E3\u6790\u7B46\u6578\u8207\u5E38\u898B\u6A23\u672C\u3002"],["\u5F71\u97FF","\u8CC7\u6599\u9801\u7684\u6CD5\u9662\u4E0B\u62C9\u3001\u7CBE\u78BA\u7BE9\u9078\u3001\u6392\u5E8F\u3001\u7D50\u679C\u6B04\u4F4D\u8207\u5224\u6C7A\u539F\u6587\u4F7F\u7528\u6B63\u898F\u5316\u540D\u7A31\uFF1BAPI \u4ECD\u56DE\u50B3 <code>court_raw</code>\u3002"],["\u4E0D\u6703","\u4E0D\u91CD\u65B0\u532F\u5165\u5224\u6C7A\u3001\u4E0D\u6539\u5168\u6587\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u8CC7\u6599\u3002"],["\u91CD\u8DD1","\u9810\u8A2D\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u898F\u5247\u66F4\u65B0\u5F8C\u53EF\u7528 <code>--all</code> \u91CD\u7B97\uFF0C\u6216\u5148\u7528 <code>--dry-run</code> \u7D71\u8A08\u3002"]],note:"\u9069\u5408\u5728\u5224\u6C7A\u532F\u5165\u5F8C\u3001\u6CD5\u9662\u540D\u7A31\u898F\u5247\u66F4\u65B0\u5F8C\uFF0C\u6216\u8CC7\u6599\u9801\u6CD5\u9662\u9078\u9805\u51FA\u73FE\u7F3A\u6F0F\u6642\u57F7\u884C\u3002\u7D50\u679C\u4E5F\u6703\u5BEB\u5165\u6548\u80FD\u7D00\u9304\u3002"})}function dd(){return Tn({badge:"\u689D\u6587\u6B77\u53F2\u5EFA\u6A94",lead:"\u70BA\u65E2\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u5EFA\u7ACB <code>law_article_versions</code> \u6B77\u53F2\u689D\u6587\u5FEB\u7167\u8207 <code>law_article_change_events</code> \u8B8A\u66F4\u7D00\u9304\uFF0C\u8B93\u8CC7\u6599\u9801\u80FD\u5207\u63DB\u6B77\u53F2\u7248\u672C\u4E26\u67E5\u770B\u689D\u6587\u5DEE\u7570\u3002",rows:[["\u4F86\u6E90","PostgreSQL \u6CD5\u898F\u7248\u672C\uFF0C\u4EE5\u53CA <code>LAW_DATA_DIR/raw_parquet</code> \u5167\u5C0D\u61C9\u7684\u539F\u59CB\u6CD5\u898F Parquet \u5FEB\u7167\u3002"],["\u5339\u914D\u65B9\u5F0F","\u4EE5 raw Parquet manifest \u7684 <code>zip_sha256</code>\uFF0F<code>raw_json_sha256</code> \u5C0D\u61C9\u6CD5\u898F\u7248\u672C\uFF0C\u4E0D\u731C\u6E2C\u5167\u5BB9\u3002"],["\u7522\u751F\u5167\u5BB9","<code>article_key</code>\uFF08\u689D\u6587\u985E\u578B\uFF0B\u689D\u865F\uFF09\u3001<code>content_hash</code>\u3001\u689D\u6587\u5168\u6587\u8207\u751F\u6548\u65E5\uFF1B\u8207\u524D\u4E00\u7248\u672C\u6BD4\u8F03\u5F8C\u8A18\u9304 <code>added</code>\uFF0F<code>modified</code>\uFF0F<code>removed</code>\u3002"],["\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB","\u5206\u9801\u4E0A\u65B9\u7684\u552F\u8B80\u6AA2\u67E5\u6703\u8B80\u53D6 <code>law_article_versions</code> \u8207\u539F\u59CB Parquet\uFF0C\u5224\u65B7\u7248\u672C\u662F\u5426\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\uFF1B\u6AA2\u67E5\u672C\u8EAB\u4E0D\u6703\u4FEE\u6539\u8CC7\u6599\u5EAB\u3002"],["\u53EF\u5EFA\u7ACB","\u627E\u5230\u5C0D\u61C9\u539F\u59CB Parquet \u7684\u7248\u672C\uFF0C\u53EF\u76F4\u63A5\u57F7\u884C\u6B64\u6D41\u7A0B\u5EFA\u7ACB\u689D\u6587\u6B77\u53F2\u3002"],["\u7F3A\u539F\u59CB\u6A94","\u627E\u4E0D\u5230\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u6A19\u793A\u7121\u6CD5\u5EFA\u7ACB\uFF0C\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD\uFF1B\u6B64\u6D41\u7A0B\u6703\u8DF3\u904E\u4E26\u5217\u5728 <code>missing_versions</code>\u3002"],["\u6AA2\u67E5\u7D50\u679C","\u5E74\u4EFD\xD7\u6708\u4EFD\u8868\u986F\u793A\u5DF2\u5EFA\u7ACB\uFF0F\u672A\u5EFA\u7ACB\uFF0F\u90E8\u5206\u5EFA\u7ACB\uFF1B\u4E0B\u65B9\u5217\u51FA\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3001\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u7248\u672C\u65E5\u671F\u8207\u53EF\u5EFA\u7ACB\u72C0\u614B\u3002\u76EE\u524D\u72C0\u614B\u4EE5\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u5361\u7247\u5373\u6642\u986F\u793A\u3002"],["\u8DF3\u904E\u689D\u4EF6","\u5DF2\u6709\u689D\u6587\u5FEB\u7167\u7684\u7248\u672C\u6703\u8DF3\u904E\uFF1B\u627E\u4E0D\u5230\u53EF\u8B80\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u5217\u5165 <code>missing_versions</code>\uFF0C\u4E0D\u5EFA\u7ACB\u865B\u69CB\u689D\u6587\u3002"],["\u4E0D\u6703","\u4E0D\u4E0B\u8F09\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u4E0D\u89E3\u6790\u65B0 ZIP\u3001\u4E0D\u4FEE\u6539 <code>law_documents</code> \u6216\u76EE\u524D\u7248\u672C\u3001\u4E0D\u66F4\u65B0 Qdrant\uFF0FIndexedDB\u3002"],["\u8F38\u51FA\u6458\u8981","\u7248\u672C\u6578\u3001\u8DF3\u904E\u7248\u672C\u6578\u3001\u7F3A\u5C11\u5FEB\u7167\u7248\u672C\u3001\u5BEB\u5165\u689D\u6587\u6578\u8207\u689D\u6587\u8B8A\u66F4\u4E8B\u4EF6\u6578\u3002"],["\u91CD\u8DD1","\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u5DF2\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u4E0D\u6703\u91CD\u8907\u63D2\u5165\u3002"]],note:"\u9069\u5408\u5F9E\u820A\u7248 schema \u5347\u7D1A\u3001\u65E2\u6709\u6CD5\u898F\u7248\u672C\u7F3A\u5C11\u6B77\u53F2\u689D\u6587\uFF0C\u6216\u8CC7\u6599\u9801\u6B77\u53F2\u689D\u6587\u7248\u672C\u8207\u8B8A\u66F4\u7D00\u9304\u4E0D\u5B8C\u6574\u6642\u57F7\u884C\u3002\u57F7\u884C\u524D\u53EF\u5148\u7528\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u78BA\u8A8D\u54EA\u4E9B\u7248\u672C\u53EF\u5EFA\u7ACB\u3001\u54EA\u4E9B\u7F3A\u539F\u59CB\u6A94\u3002"})}function ud(e={}){let t=e.courtCheck,s=!!e.courtCheckLoading,a=e.courtCheckError,n=`<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-court-check"${s?" disabled":""}>${f("refresh",12)}<span>${s?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31"}</span></button>`;if(a)return`<section class="report-card processing-card court-check-card">
      <div class="side-card-head">
        <span class="side-card-title">${f("search",14)}\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31</span>
        ${n}
      </div>
      <div class="processing-workflow-empty">${r(a)}</div>
    </section>`;if(!t)return`<section class="report-card processing-card court-check-card">
      <div class="side-card-head">
        <span class="side-card-title">${f("search",14)}\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31</span>
        ${n}
      </div>
      <div class="processing-workflow-empty">${s?'<span class="spinner" aria-hidden="true"></span> \u6B63\u5728\u6AA2\u67E5\u5404\u6708\u4EFD\u6CD5\u9662\u540D\u7A31\u2026':"\u9032\u5165\u6B64\u5206\u9801\u5F8C\u6703\u81EA\u52D5\u6AA2\u67E5\uFF1B\u4E5F\u53EF\u6309\u300C\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31\u300D\u91CD\u65B0\u8B80\u53D6\u3002"}</div>
    </section>`;let i=Array.isArray(t.months)?t.months:[],o=t.summary||{},l=t.totals||{};if(!i.length)return`<section class="report-card processing-card court-check-card">
      <div class="side-card-head">
        <span class="side-card-title">${f("search",14)}\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31</span>
        ${n}
      </div>
      <div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u53EF\u6AA2\u67E5\u7684\u5224\u6C7A\u8CC7\u6599\u3002</div>
    </section>`;let u={green:"\u5DF2\u6AA2\u67E5",red:"\u9700\u6B63\u898F\u5316\uFF08\u5B8C\u5168\u672A\u6AA2\u67E5\uFF09",gray:"\u9700\u6B63\u898F\u5316"},c=new Map(i.map(v=>[String(v.month),v])),$=[...new Set(i.map(v=>v.year))].sort((v,g)=>g-v).map(v=>{let g=Array.from({length:12},(m,w)=>{let S=w+1,M=`${v}${String(S).padStart(2,"0")}`,j=c.get(M);if(!j)return`<td class="judgment-month is-empty"><span>${S}</span></td>`;let B=u[j.status]?j.status:"red",U=[`${v}-${String(S).padStart(2,"0")}`,u[B],`\u7E3D ${d(j.total)} \u7B46`,`\u5DF2\u6AA2\u67E5 ${d(j.checked)} \u7B46`,`\u672A\u6AA2\u67E5 ${d(j.unchecked)} \u7B46`,j.invalid?`\u7121\u6548\u503C ${d(j.invalid)} \u7B46`:"",`\u6709\u6548 ${At(j.percent)}`].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month court-check-month is-${B==="gray"?"red":B}" title="${r(U)}"><span>${S}</span></td>`}).join("");return`<tr><th scope="row">${r(v)}</th>${g}</tr>`}).join("");return`<section class="report-card processing-card court-check-card">
    <div class="side-card-head">
      <span class="side-card-title">${f("search",14)}\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31</span>
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(v,g)=>`<th scope="col">${g+1}</th>`).join("")}</tr></thead>
          <tbody>${$}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u5168\u90E8\u5DF2\u6B63\u898F\u5316\uFF1B\u7D05\u8272\uFF1A\u9700\u6B63\u898F\u5316\uFF08\u542B\u5B8C\u5168\u672A\u6AA2\u67E5\u3001\u90E8\u5206\u672A\u6B63\u898F\u5316\u6216\u7121\u6548\u503C\uFF09\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u8CC7\u6599\u3002summary \u7684\u7D05\u8272\u6578\u5B57\u70BA\u9700\u6B63\u898F\u5316\u6708\u4EFD\u6578\uFF1B\u4E0B\u65B9\u660E\u7D30\u4ECD\u4FDD\u7559\u672A\u6AA2\u67E5\u8207\u7121\u6548\u503C\u7B46\u6578\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u8A73\u7D30\u7B46\u6578\u8207\u6709\u6548\u6BD4\u4F8B\u3002</p>
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${r(qe(t.checked_at))} \xB7 \u6A19\u6E96\u6CD5\u9662\u540D\u7A31 ${d(t.canonical_count)} \u500B</div>
    </div>
  </section>`}function pd(e={}){let t=e.lawVersionCheck,s=!!e.lawVersionCheckLoading,a=e.lawVersionCheckError,n=`<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-law-version-check"${s?" disabled":""}>${f("refresh",12)}<span>${s?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB"}</span></button>`;if(a)return`<section class="report-card processing-card law-version-card">
      <div class="side-card-head">
        <span class="side-card-title">${f("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
        ${n}
      </div>
      <div class="processing-workflow-empty">${r(a)}</div>
    </section>`;if(!t)return`<section class="report-card processing-card law-version-card">
      <div class="side-card-head">
        <span class="side-card-title">${f("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
        ${n}
      </div>
      <div class="processing-workflow-empty">${s?'<span class="spinner" aria-hidden="true"></span> \u6B63\u5728\u6AA2\u67E5\u7248\u672C\u8207\u6B77\u53F2\u689D\u6587\u2026':"\u9032\u5165\u6B64\u5206\u9801\u5F8C\u6703\u81EA\u52D5\u6AA2\u67E5\uFF1B\u4E5F\u53EF\u6309\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u91CD\u65B0\u8B80\u53D6\u3002"}</div>
    </section>`;let i=Array.isArray(t.months)?t.months:[],o=t.summary||{},l=t.totals||{};if(!i.length)return`<section class="report-card processing-card law-version-card">
      <div class="side-card-head">
        <span class="side-card-title">${f("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
        ${n}
      </div>
      <div class="processing-workflow-empty">\u8CC7\u6599\u5EAB\u76EE\u524D\u6C92\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u8CC7\u6599\u3002</div>
    </section>`;let u={green:"\u5DF2\u5EFA\u7ACB",red:"\u672A\u5EFA\u7ACB",gray:"\u90E8\u5206\u5EFA\u7ACB"},c=new Map(i.map(z=>[String(z.month),z])),$=[...new Set(i.map(z=>z.year))].sort((z,E)=>E-z).map(z=>{let E=Array.from({length:12},(x,C)=>{let se=C+1,me=`${z}${String(se).padStart(2,"0")}`,V=c.get(me);if(!V)return`<td class="judgment-month is-empty"><span>${se}</span></td>`;let Y=u[V.status]?V.status:"red",ae=[`${z}-${String(se).padStart(2,"0")}`,u[Y],`\u7248\u672C ${d(V.version_count)}\uFF08\u6CD5\u898F ${d(V.law_versions)}\uFF0F\u547D\u4EE4 ${d(V.order_versions)}\uFF09`,`\u5DF2\u5EFA\u7ACB ${d(V.backfilled_count)}`,`\u672A\u5EFA\u7ACB ${d(V.missing_count)}`,`\u9700\u5EFA\u7ACB ${d(V.needs_backfill_count)}\uFF08\u53EF\u5EFA\u7ACB ${d(V.backfillable_count)}\uFF0F\u7F3A\u539F\u59CB\u6A94 ${d(V.blocked_count)}\uFF09`,`\u689D\u6587\u5217 ${d(V.article_rows)} / \u9810\u671F ${d(V.article_count)}`,V.current?"\u76EE\u524D\u7248\u672C":"",V.versions?.length?`\u7248\u672C ${V.versions.map(ee=>`#${ee.version_id}`).join("\u3001")}`:""].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month law-version-month is-${Y}${V.current?" is-current":""}" title="${r(ae)}"><span>${se}</span></td>`}).join("");return`<tr><th scope="row">${r(z)}</th>${E}</tr>`}).join(""),v={law:"\u6CD5\u898F",order:"\u547D\u4EE4"},g=i.flatMap(z=>(z.versions||[]).filter(E=>E.needs_backfill).map(E=>({...E,month:z.month}))).sort((z,E)=>E.version_id-z.version_id),m=g.slice(0,20),w=m.map(z=>{let E=z.backfillable?"badge-info":z.blocked?"badge-danger":"badge-neutral",x=z.backfillable?"\u53EF\u5EFA\u7ACB":z.blocked?"\u7F3A\u539F\u59CB\u6A94":"\u5F85\u6AA2\u67E5";return`<div class="law-backfill-needed-row">
        <strong class="mono">#${z.version_id}</strong>
        <span class="badge ${E}">${x}</span>
        <span>${r(v[z.source_type]||z.source_type||"\u2014")}</span>
        <span class="mono">${r(z.update_date||z.month||"\u2014")}</span>
        <span class="law-backfill-needed-reason">${r(z.reason||"\u2014")}</span>
      </div>`}).join(""),S=g.length?`<div class="law-backfill-needed">
        <div class="law-backfill-needed-head">\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C <span class="badge badge-warn">${d(g.length)}</span></div>
        <div class="law-backfill-needed-list">${w}</div>
        ${g.length>m.length?`<div class="law-backfill-needed-more">\u53E6\u6709 ${d(g.length-m.length)} \u500B\u7248\u672C\u672A\u5217\u51FA</div>`:""}
      </div>`:'<div class="law-backfill-needed is-clear">\u76EE\u524D\u6C92\u6709\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3002</div>',M=Number(l.needs_backfill_versions)||0,j=Number(l.backfillable_versions)||0,B=Number(l.blocked_versions)||0,U=Number(l.backfilled_versions)||0,W=Number(l.versions)||0,K=M<=0?"ok":B>0?"danger":"warn",ye=M<=0?"\u4E0D\u9700\u8981\u5EFA\u7ACB":"\u9700\u8981\u5EFA\u7ACB",pe=M>0?`\u9700\u8981\u5EFA\u7ACB ${d(M)} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF1A\u53EF\u5EFA\u7ACB ${d(j)}\u3001\u7F3A\u539F\u59CB\u6A94 ${d(B)}\u3002\u5DF2\u6709\u6B77\u53F2\u689D\u6587 ${d(U)} \u500B\u7248\u672C${B>0?"\uFF1B\u7F3A\u539F\u59CB\u6A94\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD":""}\u3002`:`\u76EE\u524D ${d(W)} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`;return`<section class="report-card processing-card law-version-card">
    <div class="side-card-head">
      <span class="side-card-title">${f("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
      ${n}
    </div>
    <div class="law-version-check-status is-${K}" role="status" aria-live="polite">
      <span class="badge badge-${K}">${ye}</span>
      <span>${r(pe)}</span>
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(z,E)=>`<th scope="col">${E+1}</th>`).join("")}</tr></thead>
          <tbody>${$}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u8A72\u6708\u4EFD\u6240\u6709\u7248\u672C\u90FD\u6709\u6B77\u53F2\u689D\u6587\uFF1B\u7D05\u8272\uFF1A\u5B8C\u5168\u672A\u5EFA\u7ACB\uFF1B\u7070\u8272\uFF1A\u90E8\u5206\u7248\u672C\u5DF2\u5EFA\u7ACB\uFF1B\u5916\u6846\uFF1A\u76EE\u524D\u7248\u672C\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u7248\u672C\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u7248\u672C\u6578\u3001\u6CD5\u898F\uFF0F\u547D\u4EE4\u6578\u8207\u689D\u6587\u5217\u3002</p>
      ${S}
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${r(qe(t.checked_at))}</div>
    </div>
  </section>`}function md(){return`<div class="processing-ollama-loading">
    <span class="spinner" aria-hidden="true"></span>
    <span>\u6B63\u5728\u6AA2\u67E5 Ollama \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span>
  </div>`}function gd(e,t,s){let a=Array.isArray(e?.hosts)?e.hosts:[];if(s&&!a.length)return`${Ie({tone:"danger",title:"Ollama \u4E3B\u6A5F\u8B80\u53D6\u5931\u6557",text:r(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
    <div class="processing-ollama-empty">
      <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh-ollama">
        ${f("refresh",13)}<span>\u91CD\u65B0\u6AA2\u67E5</span>
      </button>
    </div>`;if(!a.length)return t?md():'<div class="processing-ollama-empty">\u5C1A\u672A\u8A2D\u5B9A Ollama \u4E3B\u6A5F\uFF1B\u8ACB\u5230\u300C\u7CFB\u7D71\u72C0\u614B \u2192 Model Provider\u300D\u65B0\u589E\u4E26\u9023\u63A5\u6A21\u578B\u3002</div>';let n=a.map((o,l)=>{let u=o.status==="operational",c=Array.isArray(o.models)?o.models:[],p=c.length?c.map(v=>`<span class="processing-ollama-model ${u?"is-online":"is-offline"}">${r(v.name||"")}</span>`).join(""):'<span class="processing-ollama-model is-offline">\u6C92\u6709\u53EF\u7528\u6A21\u578B</span>',$=[o.embedding_model?`<span class="processing-ollama-role ${u?"is-online":"is-offline"}">\u5D4C\u5165 \xB7 ${r(o.embedding_model)}</span>`:'<span class="processing-ollama-role is-offline">\u672A\u8A2D\u5B9A\u5D4C\u5165\u6A21\u578B</span>',o.chat_model?`<span class="processing-ollama-role is-offline">\u804A\u5929 \xB7 ${r(o.chat_model)}</span>`:""].filter(Boolean).join("");return`<article class="processing-ollama-host ${u?"is-online":"is-offline"}" data-ollama-host data-host-id="${Number(o.id)}">
        <span class="processing-ollama-handle" aria-hidden="true">${f("grid",14)}</span>
        <span class="processing-ollama-rank">${l+1}</span>
        <div class="processing-ollama-main">
          <div class="processing-ollama-title">
            <strong>${r(o.name||o.base_url||`\u4E3B\u6A5F #${o.id}`)}</strong>
            <span class="processing-ollama-status">${u?"\u53EF\u7528":"\u7121\u6CD5\u9023\u7DDA"}</span>
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
    <p class="processing-ollama-hint">\u62D6\u79FB\u6216\u4F7F\u7528\u7BAD\u982D\u8ABF\u6574 embedding \u512A\u5148\u9806\u5E8F\uFF1B\u76EE\u524D\u4E3B\u6A5F\u7121\u6CD5\u4F7F\u7528\u6642\uFF0C\u6703\u4F9D\u5E8F\u81EA\u52D5\u6539\u7528\u4E0B\u4E00\u53F0\uFF08\u5404\u53F0\u9700\u5177\u5099\u76F8\u540C\u7684 embedding \u6A21\u578B\uFF09\uFF0C\u76F4\u5230\u6709\u4E3B\u6A5F\u56DE\u50B3\u5411\u91CF\u3002</p>`}function fd(e,t={}){let s=e.active_run||null,a=s||e.last_run||null,n=Et===e.id,i=!!s||n,o=!!e.can_run&&!i,l=i?"\u6B64\u6D41\u7A0B\u6B63\u5728\u57F7\u884C\u4E2D\u3002":e.start_blocked_reason||"\u76EE\u524D\u6709\u5176\u4ED6\u8655\u7406\u7A0B\u5E8F\u57F7\u884C\u4E2D\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",u=Array.isArray(e.command)?e.command.join(" "):"",c=Number(e.update_count)||e.update_available&&Number(e.pending_count)||0,p=e.update_origin||"\u66F4\u65B0\u5075\u6E2C",$=e.update_mechanism||"\u65E2\u6709\u66F4\u65B0\u6AA2\u67E5\u7D00\u9304",v=e.update_message||e.update_status&&e.update_status.message||"\u627E\u5230\u53EF\u66F4\u65B0\u5167\u5BB9\u3002",g=e.update_status&&e.update_status.checked_at?qe(e.update_status.checked_at):"",m=e.progress||{},w=Array.isArray(m.stages)?m.stages:[],S=String(m.active_stage||""),M=w.find(K=>String(K.key||"")===S),j=(e.index_runtime&&e.index_runtime.current?e.index_runtime.current.month:"")||"",B=j?qa(j):M&&(M.label||M.key)||"",U=n&&!s?"\u555F\u52D5\u4E2D":"\u57F7\u884C\u4E2D",W=`<section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${f(xi[e.id]||"terminal",14)}\u57F7\u884C\u8CC7\u8A0A</span>
        <span class="badge badge-neutral badge-mono">${r(e.branch||"")}</span>
      </div>
      <div class="processing-workflow-command-grid">
        <span>\u7A0B\u5F0F</span><code>${r(e.program||"\u2014")}</code>
        <span>Shell\uFF0F\u5165\u53E3</span><code>${r(e.script||"\u2014")}</code>
        <span>\u5BE6\u969B\u547D\u4EE4</span><code class="processing-workflow-command">${r(u||"\u2014")}</code>
      </div>
      ${xn.has(e.id)?'<div class="processing-embedding-strip-slot" data-processing-embedding-strip data-preserve-children></div>':""}
      <div class="processing-workflow-actions">
        <button class="btn btn-primary btn-sm" type="button"
          data-processing-action="run-workflow"
          data-workflow-id="${r(e.id)}"
          ${o?"":"disabled"}
          ${o?"":`title="${r(l)}"`}>
          ${i?'<span class="spinner" aria-hidden="true"></span>':f("play",14)}<span>${i?U:"\u57F7\u884C\u6B64\u6D41\u7A0B"}</span>
        </button>
        ${["law_download","order_download","judgment_download"].includes(e.id)?`<button class="btn btn-secondary btn-sm" type="button"
                data-processing-action="check-updates"
                data-workflow-id="${r(e.id)}"
                ${i?"disabled":""}>
                ${f("refresh",14)}<span>\u6AA2\u67E5\u66F4\u65B0</span>
              </button>`:""}
        ${i?`<button class="btn btn-secondary btn-sm processing-stop" type="button"
                data-processing-action="stop">${f("x",14)}<span>\u4E2D\u6B62\u57F7\u884C</span></button>`:""}
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
      ${i?`<div class="processing-run-strip" data-processing-run-strip role="status">
              <span class="badge badge-info">${f("activity",11)}${U}</span>
              ${s&&s.id?`<span class="mono">${r(s.id)}</span>`:""}
              ${s&&s.started_at?`<span>\u958B\u59CB ${r(qe(s.started_at))}</span>`:""}
              ${B?`<span>\u76EE\u524D\u8655\u7406 <strong class="mono">${r(B)}</strong></span>`:""}
            </div>`:""}
      <div class="side-card-foot">
        \u57F7\u884C\u7D50\u679C\u6703\u5BEB\u5165\u5171\u7528\u8655\u7406\u72C0\u614B\u6A94\uFF0C\u53EF\u5F9E\u8655\u7406\u7E3D\u89BD\u67E5\u770B\u3002
      </div>
    </section>`;return`<div class="processing-workflow-panel">
    ${Ie({tone:"info",title:e.label,text:e.description||""})}
    ${e.update_available?`<div class="processing-update-notice" role="status">
            <span class="processing-update-notice-icon">${f("refresh",14)}</span>
            <span class="processing-update-notice-copy">
              <strong>${r(p)}\u5075\u6E2C\u5230\u53EF\u66F4\u65B0\u5167\u5BB9</strong>
              <span class="processing-update-mechanism">\u5075\u6E2C\u6A5F\u5236\uFF1A${r($)}${g?` \xB7 \u6AA2\u67E5\u6642\u9593 ${r(g)}`:""}</span>
              <span class="processing-update-message">${r(v)}</span>
            </span>
            ${c>0?`<span class="badge badge-warn badge-mono">${f("refresh",10)}${d(c)}</span>`:'<span class="badge badge-warn">\u53EF\u66F4\u65B0</span>'}
          </div>`:""}
    ${e.id==="legal_index_versions"?Lc(e.index_timelines):""}
    ${e.id==="normalize_courts"?W:""}
    ${e.id==="normalize_courts"?ud(t):""}
    ${e.id==="backfill_law_articles"?pd(t):""}
    ${e.id!=="normalize_courts"?W:""}
    ${Zc(e)}
    ${e.id==="judgment_parquet"?ld():""}
    ${e.id==="normalize_courts"?cd():""}
    ${e.id==="backfill_law_articles"?dd():""}
    ${e.id==="judgment_import"?ad(e):""}
    ${e.id==="index_versions"?id(e):""}
    ${e.id==="index_versions"?od(t):""}
    ${e.id==="judgment_download"?`<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${f("calendar",14)}\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B</span>
              <button class="btn btn-ghost btn-sm" type="button" title="\u91CD\u65B0\u6383\u63CF raw_rar \u76EE\u9304\u8207\u6708\u4EFD\u72C0\u614B" data-processing-action="refresh-judgment-months">${f("refresh",13)}<span>\u91CD\u65B0\u6574\u7406</span></button>
            </div>
            <div data-judgment-months-slot data-preserve-children>${jn()}</div>
          </section>`:""}
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${f("history",14)}\u6700\u8FD1\u57F7\u884C</span>
        ${vt(a?.status||"idle")}
      </div>
      ${Oc(a)}
    </section>
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${f("history",14)}\u57F7\u884C\u7D00\u9304</span>
        <span class="badge badge-neutral">\u6700\u8FD1 ${d((e.recent_runs||[]).length)} \u7B46</span>
      </div>
      ${Vc(e.recent_runs)}
    </section>
    ${["law_download","order_download","judgment_download"].includes(e.id)?`<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${f("search",14)}\u7248\u672C\u6AA2\u67E5\u7D00\u9304</span>
              <span class="badge badge-neutral">\u6700\u8FD1 ${d((e.update_history||[]).length)} \u7B46</span>
            </div>
            ${Wc(e)}
          </section>`:""}
  </div>`}function Sa(e,t,s={},a=new Set){if(t==="overview")return yi(e,a);let i=(Array.isArray(e.workflows)?e.workflows:[]).find(o=>o.id===t);return i?fd(i,s):yi(e,a)}async function bd(e){e.innerHTML=`<section class="page processing-page">
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
          ${f("x",14)}<span>\u505C\u6B62\u66F4\u65B0</span>
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
  </section>`;let t=e.querySelector(".processing-page"),s=e.querySelector("#processing-root"),a=e.querySelector("#processing-workflows"),n=e.querySelector("#processing-stop"),i=document.createElement("div");i.className="processing-stage-tooltip",i.hidden=!0,t.appendChild(i),Nt=new Map;let o=!1,l=!1,u=!1,c=null,p="",$="",v="overview",g=null,m=!1,w=null,S=null,M=!1,j=null,B=0,U=null,W=!1,K=null,ye=0,pe=null,z=!1,E=null,x=0,C=null,se=!1,me=null,V=0,Y=!1,ae=null,ee=!1,ke=!1,H="",ve=new Set,je=null,xe=null,at=-1,De="",Fe=0,Ae=0,Ue=null,We=[],lt=()=>({storage:S,loading:M,error:j,courtCheck:U,courtCheckLoading:W,courtCheckError:K,lawVersionCheck:pe,lawVersionCheckLoading:z,lawVersionCheckError:E}),R=()=>{if(v!=="judgment_download")return;let h=s.querySelector(".processing-workflow-panel");if(!h)return;h.querySelectorAll(".judgment-month.is-active").forEach(Oe=>{Oe.classList.remove("is-active"),Oe.removeAttribute("aria-current")});let _=h.querySelector("[data-judgment-progress]");if(!_)return;let P=g?.progress,oe=!!(c?.workflows||[]).find(Oe=>Oe.id==="judgment_download")?.active_run;if((!P||P.active===!1)&&!oe){_.hidden=!0,_.classList.remove("is-indeterminate");return}if(_.hidden=!1,!P||P.active===!1){let Oe=_.querySelector("[data-judgment-progress-phase]");Oe&&(Oe.textContent="\u6E96\u5099\u4E2D");let ht=_.querySelector("[data-judgment-progress-month]");ht&&(ht.textContent="\u2014");let Be=_.querySelector("[data-judgment-progress-filename]");Be&&(Be.textContent="\u7B49\u5F85\u4E0B\u8F09\u7A0B\u5E8F\u56DE\u5831\u9032\u5EA6\u2026",Be.title=""),_.classList.add("is-indeterminate");let yt=_.querySelector("[data-judgment-progress-bar]");yt&&(yt.style.width="");let Je=_.querySelector("[data-judgment-progress-percent]");Je&&(Je.textContent="\u2014");let wt=_.querySelector("[data-judgment-progress-size]");wt&&(wt.textContent="\u2014");let xt=_.querySelector("[data-judgment-progress-note]");xt&&(xt.textContent="\u5DF2\u555F\u52D5\uFF0C\u7B49\u5F85\u9032\u5EA6\u56DE\u5831");return}let be={preparing:"\u6E96\u5099\u4E2D",scanning:"\u6383\u63CF\u4E2D",checking:"\u6AA2\u67E5\u4E2D",downloading:"\u4E0B\u8F09\u4E2D",saving:"\u5132\u5B58\u4E2D",finalizing:"\u6574\u7406\u4E2D"}[P.phase]||"\u8655\u7406\u4E2D",re=_.querySelector("[data-judgment-progress-phase]");re&&(re.textContent=be);let ie=P.month||"",fe=_.querySelector("[data-judgment-progress-month]");fe&&(fe.textContent=ie||"\u2014");let we=P.filename||"",Se=_.querySelector("[data-judgment-progress-filename]");if(Se&&(Se.textContent=we||"\u2014",Se.title=we),ie){let Oe=h.querySelector(`[data-judgment-month-key="${ie}"]`);Oe&&(Oe.classList.add("is-active"),Oe.setAttribute("aria-current","true"))}let b=Number(P.bytes_written),T=Number(P.total_bytes),D=Number.isFinite(T)&&T>0,Z=null,ce=P.percent;ce!=null&&ce!==""&&Number.isFinite(Number(ce))?Z=Number(ce):D&&Number.isFinite(b)&&(Z=b/T*100);let _e=Z===null;_.classList.toggle("is-indeterminate",_e);let He=_.querySelector("[data-judgment-progress-bar]");He&&(He.style.width=_e?"":`${Math.min(100,Math.max(0,Z)).toFixed(1)}%`);let Ee=_.querySelector("[data-judgment-progress-percent]");if(Ee){let Oe=_e?null:Math.min(100,Math.max(0,Z));Ee.textContent=Oe===null?"\u2014":`${Oe.toFixed(Oe>=10?0:1)}%`}let ot=_.querySelector("[data-judgment-progress-size]");if(ot){let Oe=Number.isFinite(b)&&b>0?Re(b):"\u2014";ot.textContent=D?`${Oe} / ${Re(T)}`:Oe}let ut=_.querySelector("[data-judgment-progress-note]");if(ut){let Oe=[],ht=Number(P.candidate_index),Be=Number(P.candidate_total);Number.isFinite(ht)&&ht>0&&Number.isFinite(Be)&&Be>0&&Oe.push(`\u7B2C ${d(ht)} / ${d(Be)} \u500B\u6708`),P.fileset_id&&Oe.push(`fileset ${P.fileset_id}`),P.message&&P.phase!=="downloading"&&Oe.push(String(P.message)),ut.textContent=Oe.join(" \xB7 ")}},O=()=>{if(v!=="judgment_download")return;let h=s.querySelector("[data-judgment-months-slot]");if(h){let _=Array.isArray(g?.months)?g.months:[];w&&!g?(h.innerHTML=Ie({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:r(w)}),delete h.dataset.judgmentMonthCount):g?h.dataset.judgmentMonthCount!==String(_.length)?(h.innerHTML=Gc(g),h.dataset.judgmentMonthCount=String(_.length)):Jc(h,g):(h.querySelector(".judgment-months-loading")||(h.innerHTML=jn()),delete h.dataset.judgmentMonthCount)}R()},y=()=>{let h=Array.isArray(C?.hosts)?C.hosts:[];return JSON.stringify({loading:!h.length&&se,error:!h.length&&me?me.message||String(me):"",active:C?.active_host_id??null,hosts:h.map(_=>({id:_.id,name:_.name,url:_.base_url,status:_.status,detail:_.detail,embedding:_.embedding_model,chat:_.chat_model,models:(_.models||[]).map(P=>P.name)}))})},A=()=>{let h=s.querySelector("[data-processing-ollama]");if(!h||V)return;let _=y();h.dataset.ollamaSignature!==_&&(h.dataset.ollamaSignature=_,h.innerHTML=gd(C,se,C?null:me))},G=()=>{let _=((c?.sections||[]).find(P=>P.key==="legal")?.stages||[]).find(P=>P.key==="legal_qdrant");return String(_?.model?.label||"")},F=()=>{let h=s.querySelector("[data-processing-embedding-strip]");if(!h)return;let _=Array.isArray(C?.hosts)?C.hosts:[],P=[];for(let ie of _)if(ie.status==="operational")for(let fe of ie.models||[])Array.isArray(fe.capabilities)&&fe.capabilities.includes("embedding")&&P.push({hostId:Number(ie.id),model:fe.name,label:`${ie.name||ie.base_url||`\u4E3B\u6A5F ${ie.id}`}:${fe.name}`,baseUrl:ie.base_url||""});let de=G(),oe=_.find(ie=>Number(ie.id)===Number(C?.active_host_id)),ne=P.map(ie=>{let fe=ie.label===de;return`<button class="rag-model-button${fe?" is-active":""}" type="button"
        data-processing-action="select-embedding-model"
        data-host-id="${ie.hostId}"
        data-model="${r(ie.model)}"
        title="${r(ie.label)}"
        aria-pressed="${fe?"true":"false"}"
        ${ke?"disabled":""}>
        <span class="rag-model-state" aria-hidden="true"></span>
        <span>${r(ie.label)}</span>
        ${fe?'<span class="rag-model-current">\u4F7F\u7528\u4E2D</span>':""}
      </button>`});de&&!P.some(ie=>ie.label===de)&&ne.unshift(`<button class="rag-model-button is-active is-static" type="button" aria-pressed="true" disabled>
          <span class="rag-model-state" aria-hidden="true"></span>
          <span>${r(de)}</span>
          <span class="rag-model-current">\u4F7F\u7528\u4E2D</span>
        </button>`);let be=P.length?`<div class="rag-model-buttons">${ne.join("")}</div>`:`<p class="rag-model-empty">${se?"\u8B80\u53D6\u7DDA\u4E0A\u4E3B\u6A5F\u8207 Embedding model\u2026":me?`\u7121\u6CD5\u8B80\u53D6\u7DDA\u4E0A\u4E3B\u6A5F\uFF1A${r(me.message||String(me))}`:"\u76EE\u524D\u6C92\u6709\u53EF\u7528\u7684 Embedding model\u3002"}</p>`,re=`<div class="processing-embedding-strip rag-model-strip">
      <div class="rag-model-strip-head">
        <span class="rag-model-strip-title">${f("brain",13)} Embedding \u4E3B\u6A5F\uFF0F\u6A21\u578B</span>
        ${oe?.base_url?`<span class="rag-model-strip-base mono">${r(oe.base_url)}</span>`:""}
        <span class="rag-model-strip-current">\u76EE\u524D\uFF1A<strong>${r(de||"\u2014")}</strong></span>
        <button class="btn btn-ghost btn-sm rag-model-refresh" type="button"
          data-processing-action="refresh-embedding-models"
          ${se?"disabled":""}>
          ${f("refresh",12)}<span>\u6AA2\u67E5\u6A21\u578B</span>
        </button>
      </div>
      ${be}
      <p class="rag-model-hint">\u9EDE\u9078 <span class="mono">\u4E3B\u6A5F:\u6A21\u578B</span> \u5207\u63DB Embedding\uFF1B\u9078\u53D6\u5F8C\u6703\u6210\u70BA\u7B2C\u4E00\u512A\u5148\uFF0C\u5176\u4ED6\u4E3B\u6A5F\u4F9D\u5E8F\u4F5C\u70BA\u5099\u63F4\u3002\u5207\u63DB\u6A21\u578B\u5F8C\u65E2\u6709\u7D22\u5F15\u53EF\u80FD\u9700\u8981\u91CD\u5EFA\u3002</p>
    </div>`;h.innerHTML!==re&&(h.innerHTML=re)},Ce=h=>{let _=s.querySelector('[data-import-timeline="judgment"]');if(!_)return;let P=String(h?.active_month||""),de=String(h?.processing_month||"");_.querySelectorAll(".processing-month").forEach(we=>{let Se=!!P&&we.dataset.month===P;we.classList.toggle("is-current",Se),we.classList.toggle("is-processing-current",!!de&&we.dataset.month===de),Se?we.setAttribute("aria-current","true"):we.removeAttribute("aria-current")});let oe=_.querySelector(".index-current-row");if(!P||!h?.active_archive){oe&&oe.remove();return}let ne=c?.workflows?.find(we=>we.id==="judgment_import")?.import_timeline?.stage_labels||{},be=ki({activeMonth:P,activeArchive:h.active_archive,activePhase:h.active_phase||"",processingMonth:h.processing_month||"",processingArchive:h.processing_archive||"",stageLabels:ne});if(oe){oe.innerHTML=be;return}let re=_.querySelector(".judgment-months");if(!re)return;let ie=document.createElement("div");ie.className="index-current-row",ie.innerHTML=be;let fe=re.querySelector(".judgment-months-meta");fe?fe.insertAdjacentElement("afterend",ie):re.prepend(ie)},Ne=h=>{let _=Number(h?.state_mtime_ns);return Number.isFinite(_)?_:-1},Pe=h=>{let _=String(h?.active_month||"");return/^\d{6}$/.test(_)?Number(_):-1},nt=h=>{if(!h)return;let _=Ne(h);if(_>=0&&_<at){xe?.active_month&&Ce(xe);return}_>=0&&(at=_);let P=String(h.active_month||"");if(!!(h.run_id&&h.run_id===xe?.run_id)&&Pe(h)>=0&&Pe(h)<Pe(xe)){let oe={...h,active_month:xe.active_month,active_archive:xe.active_archive};xe=oe,Ce(oe);return}if(!P&&h.run_status==="running"){xe?.active_month&&xe?.run_id===h.run_id?Ce(xe):(xe=h,Ce(h));return}xe=h,Ce(h)},it=h=>{let _=h?.active_import;if(_){nt(_);return}xe?.active_month&&Ce(xe)},rt=()=>{o||je||(je=kt(["processing","judgment-download","system-usage","ollama","court-check","law-version-check"],(h,_)=>{if(!o){if(h==="processing"){_?.snapshot?.live?qs(_.snapshot):_?.snapshot?ze(_.snapshot,{silent:!0}):It({silent:!0});return}if(h==="judgment-download"){v==="judgment_download"&&Lt({quiet:!0,payload:_?.snapshot||null});return}if(h==="system-usage"){v==="index_versions"&&Vt({quiet:!0,force:!0,payload:_?.snapshot||null});return}if(h==="ollama"){xn.has(v)&&et({quiet:!0,payload:_?.snapshot||null});return}if(h==="court-check"){v==="normalize_courts"&&k({quiet:!0,force:!0,payload:_?.snapshot||null});return}h==="law-version-check"&&v==="backfill_law_articles"&&q({quiet:!0,force:!0,payload:_?.snapshot||null})}},{onProgress:(h,_)=>{if(h!=="processing")return;let P=_?.event;P&&st(P)},onError:()=>{c||It({silent:!0})}}))},Ge=()=>{je&&(je(),je=null)},Mt=async h=>{if(ke)return;let[_,...P]=String(h||"").split("|"),de=Number(_),oe=P.join("|");if(!de||!oe){F();return}let ne=(C?.hosts||[]).find(re=>Number(re.id)===de);if(!ne){F();return}let be=`${ne.name||ne.base_url||`\u4E3B\u6A5F ${ne.id}`}:${oe}`;if(be===G()){F();return}if(!window.confirm(`\u5207\u63DB Embedding \u70BA ${be}\uFF1F

\u5207\u63DB\u6A21\u578B\u5F8C\uFF0C\u65E2\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u8207\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u53EF\u80FD\u4E0D\u76F8\u5BB9\uFF0C\u9700\u8981\u91CD\u65B0\u5EFA\u7ACB\u7D22\u5F15\u3002`)){F();return}ke=!0,F();try{await Q.selectOllamaModel(de,{model:oe,role:"embedding"});let re=(C?.hosts||[]).map(fe=>Number(fe.id)),ie=[de,...re.filter(fe=>fe!==de)];await Q.reorderOllamaHosts(ie),N(`\u5DF2\u5207\u63DB Embedding \u70BA ${be}\u3002`,"ok",6e3),C=null,await et({quiet:!0}),await It({silent:!0})}catch(re){N(re.message||"\u7121\u6CD5\u5207\u63DB Embedding model\u3002","danger",7e3),await et({quiet:!0})}finally{ke=!1,F()}},et=async({quiet:h=!1,button:_=null,payload:P=null}={})=>{if(!(o||se)){se=!0,me=null,C||(A(),F()),_&&Me(_,!0,"\u6AA2\u67E5\u4E2D\u2026");try{let de=P||await Q.ollamaHosts();if(o)return;C=de}catch(de){if(o)return;me=de,h||N(de.message||"\u7121\u6CD5\u6AA2\u67E5 Ollama \u4E3B\u6A5F\u3002","danger",6e3)}finally{o||(se=!1,_&&Me(_,!1),A(),F())}}},Ke=async h=>{if(ee)return;let _=(C?.hosts||[]).map(ne=>Number(ne.id)),P=h.map(ne=>Number(ne));if(!P.length||P.length!==_.length||P.every((ne,be)=>ne===_[be])){A();return}ee=!0;let de=new Map((C?.hosts||[]).map(ne=>[Number(ne.id),ne])),oe=P.map(ne=>de.get(ne)).filter(Boolean);if(C&&oe.length===_.length){C={...C,hosts:oe,active_host_id:P[0]};let ne=s.querySelector("[data-processing-ollama]");ne&&(ne.dataset.ollamaSignature=""),A()}try{await Q.reorderOllamaHosts(P),N("\u5DF2\u66F4\u65B0 Ollama \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","ok",3500)}catch(ne){N(ne.message||"\u7121\u6CD5\u66F4\u65B0 Ollama \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","danger",6e3),await et({quiet:!0})}finally{ee=!1}},Rt=()=>{let h=s.querySelector("[data-processing-ollama]");h&&(h.dataset.ollamaSignature=""),A()},te=()=>{let h=ae;if(!h)return;if(s.querySelector(`[data-ollama-host][data-host-id="${h.hostId}"]`)?.classList.remove("is-dragging"),h.captureTarget?.hasPointerCapture?.(h.pointerId))try{h.captureTarget.releasePointerCapture(h.pointerId)}catch{}document.documentElement.classList.remove("processing-ollama-dragging"),window.removeEventListener("pointermove",$e),window.removeEventListener("pointerup",Qe),window.removeEventListener("pointercancel",Ye),ae=null,V=0},$e=h=>{let _=ae;if(!_||h.pointerId!==_.pointerId)return;if(!_.dragging){if(Math.hypot(h.clientX-_.startX,h.clientY-_.startY)<5)return;_.dragging=!0,V=_.hostId,Y=!1,s.querySelector(`[data-ollama-host][data-host-id="${_.hostId}"]`)?.classList.add("is-dragging"),document.documentElement.classList.add("processing-ollama-dragging")}h.preventDefault();let P=64;h.clientY<P?window.scrollBy(0,-12):h.clientY>window.innerHeight-P&&window.scrollBy(0,12);let de=s.querySelector("[data-ollama-list]"),oe=document.elementFromPoint(h.clientX,h.clientY)?.closest?.("[data-ollama-host]");if(!de||!oe||!de.contains(oe))return;let ne=de.querySelector(`[data-ollama-host][data-host-id="${_.hostId}"]`);if(!ne||ne===oe)return;let be=oe.getBoundingClientRect(),re=h.clientY>be.top+be.height/2;de.insertBefore(ne,re?oe.nextSibling:oe),Y=!0},Qe=h=>{let _=ae;if(!_||h.pointerId!==_.pointerId)return;let P=_.dragging,de=Y,oe=s.querySelector("[data-ollama-list]"),ne=P&&oe?[...oe.querySelectorAll("[data-ollama-host]")].map(be=>Number(be.dataset.hostId)):[];te(),P&&de&&ne.length&&Ke(ne)},Ye=()=>{let h=!!ae?.dragging;te(),h&&Rt()},Ct=h=>{if(h.button!==0||h.pointerType==="mouse"&&h.buttons!==1||ee||ae)return;let _=h.target.closest("[data-ollama-host]");if(!_||!s.contains(_)||h.target.closest("button")||h.pointerType==="touch"&&!h.target.closest(".processing-ollama-handle"))return;let P=Number(_.dataset.hostId)||0;if(P){h.preventDefault(),V=P,ae={hostId:P,pointerId:h.pointerId,startX:h.clientX,startY:h.clientY,dragging:!1,captureTarget:_};try{_.setPointerCapture(h.pointerId)}catch{}window.addEventListener("pointermove",$e,{passive:!1}),window.addEventListener("pointerup",Qe),window.addEventListener("pointercancel",Ye)}},Lt=async({quiet:h=!1,payload:_=null}={})=>{if(!m){m=!0,!g&&v==="judgment_download"&&O();try{g=_||await Q.judgmentDownloadStatus(),w=null}catch(P){w=P.message||"\u8B80\u53D6\u6708\u4EFD\u72C0\u614B\u5931\u6557\u3002",h||N(w,"danger",7e3)}finally{m=!1,v==="judgment_download"&&O()}}},Vt=async({quiet:h=!0,force:_=!1,payload:P=null}={})=>{if(!M&&!(!_&&S&&Date.now()-B<3e4)){M=!0;try{S=P||await Q.systemUsage(),j=null,B=Date.now()}catch(de){j=de.message||"\u7121\u6CD5\u53D6\u5F97 Qdrant \u5BB9\u5668\u8207 volume \u8CC7\u8A0A\u3002",h||N(j,"danger",7e3)}finally{M=!1,v==="index_versions"&&he()}}},k=async({quiet:h=!0,force:_=!1,payload:P=null}={})=>{if(!W&&!(!_&&U&&Date.now()-ye<6e4)){W=!0;try{U=P||await Q.checkCourts(),K=null,ye=Date.now()}catch(de){K=de.message||"\u7121\u6CD5\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31\u3002",h||N(K,"danger",7e3)}finally{W=!1,v==="normalize_courts"&&he()}}},q=async({quiet:h=!0,force:_=!1,button:P=null,payload:de=null}={})=>{if(!z&&!(!_&&pe&&Date.now()-x<6e4)){z=!0,P&&Me(P,!0,"\u6AA2\u67E5\u4E2D\u2026");try{if(pe=de||await Q.checkLawVersions(),E=null,x=Date.now(),!h){let oe=pe.totals||{},ne=Number(oe.needs_backfill_versions)||0,be=Number(oe.backfillable_versions)||0,re=Number(oe.blocked_versions)||0;ne>0?N(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u9700\u8981\u5EFA\u7ACB ${ne} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF08\u53EF\u5EFA\u7ACB ${be}\u3001\u7F3A\u539F\u59CB\u6A94 ${re}\uFF09\u3002`,re>0?"danger":"warn",7e3):N(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D ${Number(oe.versions)||0} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`,"ok",5e3)}}catch(oe){E=oe.message||"\u7121\u6CD5\u6AA2\u67E5\u689D\u6587\u6B77\u53F2\u72C0\u614B\u3002",h||N(E,"danger",7e3)}finally{z=!1,P&&Me(P,!1)}}},L=h=>Array.from(s.querySelectorAll("[data-stage-key]")).find(_=>_.dataset.stageKey===h)||null,I=h=>{if(!h)return;ve.add(h);let _=Array.from(s.querySelectorAll(".processing-wf-stage[data-processing-stage]")).find(P=>P.dataset.processingStage===h);_&&(_.open=!0,_.scrollIntoView({behavior:"smooth",block:"center"}))},J=()=>{H&&(H="",i.hidden=!0,s.querySelectorAll("[data-stage-key]").forEach(h=>{h.classList.remove("is-stage-hovered")}))},X=h=>{let _=h.dataset.stageKey||"";if(!_)return;H=_,s.querySelectorAll("[data-stage-key]").forEach(T=>{T.classList.toggle("is-stage-hovered",T.dataset.stageKey===_)});let P=h.dataset.stageStatusKey||"idle",de=h.dataset.stageStatus||zs(P).label,oe=h.dataset.stageColor||"var(--accent)",ne=Number(h.dataset.stageUpdate)||0,be=Number(h.dataset.stagePending)||0,re=h.dataset.stageContributionLabel||"\u6574\u9AD4\u5360\u6BD4";i.innerHTML=`<div class="processing-stage-tooltip-head">
      <span class="processing-stage-tooltip-swatch" style="background:${r(oe)}"></span>
      <strong>${r(h.dataset.stageLabel||_)}</strong>
      ${vt(P,de)}
    </div>
    <div class="processing-stage-tooltip-meta">
      <span>\u968E\u6BB5\u9032\u5EA6 <strong>${r(h.dataset.stagePercent||"\u2014")}</strong></span>
      <span>${r(re)} <strong>${r(h.dataset.stageContribution||"\u2014")}</strong></span>
      <span class="mono">${r(h.dataset.stageDuration||"\u2014")}</span>
    </div>
    <div class="processing-stage-tooltip-counts">${r(h.dataset.stageCounts||"\u2014")}</div>
    ${ne||be?`<div class="processing-stage-tooltip-badges">
            ${ne?`<span class="processing-wf-count is-update">${f("refresh",11)}<strong>${d(ne)}</strong><span>\u53EF\u66F4\u65B0</span></span>`:""}
            ${be?`<span class="processing-wf-count is-pending">${f("clock",11)}<strong>${d(be)}</strong><span>\u5F85\u57F7\u884C</span></span>`:""}
          </div>`:""}
    ${h.dataset.stageMessage?`<div class="processing-stage-tooltip-message">${r(h.dataset.stageMessage)}</div>`:""}`,i.hidden=!1;let ie=Math.min(300,Math.max(220,window.innerWidth-24));i.style.width=`${ie}px`;let fe=h.getBoundingClientRect(),we=Math.min(window.innerWidth-ie-12,Math.max(12,fe.left)),Se=fe.top-i.offsetHeight-10,b=Se>=12?Se:Math.min(window.innerHeight-i.offsetHeight-12,fe.bottom+10);i.style.left=`${we}px`,i.style.top=`${Math.max(12,b)}px`},ue=h=>{if(h.target.closest(".is-failure-tip")){J();return}if(h.target.closest(".processing-wf-rail"))return;let _=h.target.closest("[data-stage-key]");!_||!s.contains(_)||_.contains(h.relatedTarget)||X(_)},Le=h=>{let _=h.target.closest("[data-stage-key]");if(!_||!s.contains(_)||_.contains(h.relatedTarget))return;let P=h.relatedTarget?.closest?.("[data-stage-key]");P&&P.dataset.stageKey===_.dataset.stageKey||J()},Te=h=>{let _=h.capabilities||{};!u&&n&&(n.hidden=!_.can_stop_update)},he=()=>{if(!c)return;let h=Sa(c,v,lt(),ve);h!==p&&(is(s,h),p=h),O(),A(),F(),it(c)},ze=(h,{silent:_=!1}={})=>{if(o||!h)return;let P=Date.parse(h.generated_at||""),de=Date.parse(c?.generated_at||"");if(Number.isFinite(P)&&Number.isFinite(de)&&P<de)return;if(Et){let ie=(h.workflows||[]).find(we=>we.id===Et),fe=ie?.active_run?.id||ie?.last_run?.id||"";(ie?.active_run||fe&&fe!==ps)&&(Et="",ps="")}c=h;let oe=new Map;for(let ie of h.sections||[])for(let fe of ie.stages||[])oe.set(`${ie.key}-${fe.key}`,fe);for(let[ie,fe]of Nt){if(fe.kind!=="upgrade")continue;let we=oe.get(ie);if(we){if(we.phase==="failed"||we.phase==="running"&&we.percent!==null){Nt.delete(ie);continue}if(we.phase==="completed"){let Se=Date.parse(we.last_run?.started_at||"");Number.isFinite(Se)&&Se>=Number(fe.startedAt||0)-1e3&&Nt.delete(ie)}}}let ne=Sn(h,v);ne!==$&&(is(a,ne),$=ne);let be=Sa(h,v,lt(),ve);if(be!==p&&(is(s,be),p=be),O(),A(),H){let ie=L(H);ie?X(ie):J()}let re=s.querySelector("[data-processing-updated-at]");if(re){let ie=qe(h.generated_at);re.textContent!==ie&&(re.textContent=ie)}if(Te(h),F(),it(h),!C&&!se&&et({quiet:!0}),We.length){let ie=We.splice(0);for(let fe of ie)st(fe)}},Xe=h=>{if(Ue=h,typeof requestAnimationFrame>"u"){let _=Ue;Ue=null,_&&qs(_);return}Ae||(Ae=requestAnimationFrame(()=>{Ae=0;let _=Ue;Ue=null,_&&qs(_)}))},st=h=>{if(!h)return;if(!c){We.push(h),We.length>100&&We.shift();return}let _=String(h.run_id||""),P=Number(h.seq)||0;if(_&&_===De&&P>0&&P<=Fe)return;_&&_!==De&&(De=_,Fe=0),P>0&&(Fe=P);let de=String(h.workflow_id||"judgment_import"),oe=String(h.month||"").replace(/\D/g,"").slice(0,6),ne=(c.workflows||[]).find(Se=>Se.id===de);if(!ne)return;ne.progress||(ne.progress={stages:[]}),Array.isArray(ne.progress.stages)||(ne.progress.stages=[]);let be=String(h.stage||""),re=be?ne.progress.stages.find(Se=>String(Se.key)===be):null,ie=String(ne.progress.run_id||"")===String(h.run_id||"");if(re&&h.type==="stage_progress"){let Se=Number(h.current),b=Number(re.current);ie&&h.status==="running"&&Number.isFinite(Se)&&Number.isFinite(b)&&Se<b||(h.status&&(re.status=String(h.status)),h.current!==void 0&&(re.current=Number(h.current)||0),h.total!==void 0&&(re.total=Number(h.total)||0),h.percent!==void 0&&(re.percent=Number(h.percent)||0),h.message&&(re.message=String(h.message)))}if(re&&h.extra&&typeof h.extra=="object")for(let Se of["financial_processed","financial_matched","financial_percent"])h.extra[Se]!==void 0&&(re[Se]=Number(h.extra[Se])||0);if(h.type==="stage_progress"&&h.overall_percent!==void 0){let Se=Number(h.overall_percent)||0,b=Number(ne.progress.overall_percent)||0;ne.progress.overall_percent=ie?Math.max(b,Se):Se}h.type!=="run_finished"&&(ne.progress.run_status="running"),(h.type==="archive_started"||h.type==="stage_progress")&&!ne.active_run&&h.run_id&&(ne.active_run={id:h.run_id,status:"running",started_at:h.timestamp,message:h.message||""}),h.type==="run_finished"&&(ne.active_run=null,ne.progress.run_status=String(h.status||"success"),ne.can_run=!0);let fe=[];oe&&h.month_stages&&fe.push({month:oe,import_stages:h.month_stages,import_overall:h.month_overall||""});let we=null;if(h.type==="archive_started"&&oe){let Se=Date.parse(h.timestamp||"");we={active_month:oe,active_archive:h.archive,active_phase:h.stage||"filter",processing_month:oe,processing_archive:h.archive,run_id:h.run_id,run_status:"running",state_mtime_ns:Number.isFinite(Se)?Se*1e6:Date.now()*1e6}}else h.type==="run_finished"&&(we={...c.active_import||{},run_status:String(h.status||"success")});Xe({live:!0,generated_at:h.timestamp,workflows:[{id:de,active_run:ne.active_run,last_run:ne.last_run,progress:ne.progress,can_run:ne.can_run}],import_timeline_months:fe,active_import:we})},qs=h=>{if(o||!h||!c)return;let _=new Map((h.workflows||[]).map(re=>[re.id,re]));if(Et){let re=_.get(Et),ie=re?.active_run?.id||re?.last_run?.id||"";(re?.active_run||ie&&ie!==ps)&&(Et="",ps="")}for(let re of c.workflows||[]){let ie=_.get(re.id);if(ie){if("active_run"in ie&&(re.active_run=ie.active_run),"last_run"in ie&&(re.last_run=ie.last_run),Array.isArray(ie.recent_runs)&&(re.recent_runs=ie.recent_runs),"index_runtime"in ie){let fe=ie.index_runtime;fe&&!fe.active_coverage&&re.index_runtime?.active_coverage&&(fe.active_coverage=re.index_runtime.active_coverage),re.index_runtime=fe}if(ie.progress){let fe=ie.progress,we=re.progress;if(re.id==="judgment_import"&&we?.run_id&&we.run_id===fe.run_id){let Se=new Map((we.stages||[]).map(b=>[String(b.key),b]));for(let b of fe.stages||[]){let T=Se.get(String(b.key));T&&b.status==="running"&&Number(b.current)<Number(T.current)&&(b.current=T.current,b.total=T.total,b.percent=T.percent,b.message=T.message)}fe.overall_percent=Math.max(Number(we.overall_percent)||0,Number(fe.overall_percent)||0)}re.progress=fe}typeof ie.can_run=="boolean"&&(re.can_run=ie.can_run)}}let P=re=>{if(!re||!Array.isArray(h.import_timeline_months))return;let ie=new Map((re.months||[]).map(we=>[String(we.month),we]));for(let we of h.import_timeline_months){let Se=ie.get(String(we.month));Se&&(Se.import_stages={...Se.import_stages||{},...we.import_stages||{}},we.import_overall&&(Se.import_overall=we.import_overall))}let fe={complete:0,incomplete:0,processing:0,empty:0};for(let we of re.months||[]){let Se=String(we.import_overall||"empty");fe[Se]=Number(fe[Se]||0)+1}re.stage_summary=fe};(re=>{let ie=(re.workflows||[]).find(ce=>ce.id==="index_versions"),fe=ie?.index_runtime;if(!fe||!Array.isArray(fe.months))return;let we=(re.file_timelines||[]).find(ce=>ce.key==="judgment");if(!we||!Array.isArray(we.months))return;let Se=(ie.progress?.stages||[]).find(ce=>ce.key==="validate"),b=["success","no_change"].includes(String(fe.run_status||""))||String(fe.run_status||"")!=="running"&&/alias\s*已切換/.test(String(Se?.message||"")),T=String(fe.current?.month||""),D=new Map(we.months.map(ce=>[String(ce.month),ce]));for(let ce of fe.months){let _e=D.get(String(ce.month||""));if(!_e)continue;let He=_e.stages||(_e.stages={}),Ee=String(ce.status||"");Ee==="running"||String(ce.month)===T?(He.qdrant="processing",_e.overall="processing"):Ee==="success"&&He.qdrant!=="complete"&&(He.qdrant=b?"complete":"incomplete",_e.overall=b?"complete":"incomplete")}let Z={complete:0,incomplete:0,processing:0,empty:0,update:0};for(let ce of we.months){let _e=String(ce.overall||"empty");Z[_e]=Number(Z[_e]||0)+1,ce.has_update&&(Z.update+=1)}we.summary=Z})(c),P(c.import_timeline);for(let re of c.workflows||[])re.id==="judgment_import"&&P(re.import_timeline);h.active_import&&(c.active_import=h.active_import),h.mode&&(c.mode=h.mode),h.generated_at&&(c.generated_at=h.generated_at);let oe=Sn(c,v);oe!==$&&(is(a,oe),$=oe);let ne=Sa(c,v,lt(),ve);ne!==p&&(is(s,ne),p=ne),O(),A(),F(),it(c),Te(c);let be=s.querySelector("[data-processing-updated-at]");if(be&&h.generated_at){let re=qe(h.generated_at);be.textContent!==re&&(be.textContent=re)}},It=async({silent:h=!1}={})=>{if(!(o||l)){l=!0;try{let _=await Q.processing();ze(_,{silent:h})}catch(_){if(o)return;let P=Ic(_.message,c);P!==p&&(is(s,P),p=P),h||N(_.message||"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B\u3002","danger",6e3)}finally{l=!1}}},Ea=async(h,_="")=>{if(u)return;u=!0,Me(h,!0,"\u6AA2\u67E5\u4E2D\u2026");let P=vi[_]||"",de=String(h.dataset.sourceTypes||"").split(",").map(be=>be.trim()).filter(Boolean),oe=de.length?de:P?[P]:[],ne=h.dataset.stageId||"";ne&&(Nt.set(ne,{kind:"check",phase:"updating",startedAt:Date.now()}),he());try{let be=await Q.checkUpdates(oe);if(be&&be.checking)ne&&(Nt.delete(ne),he()),N("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u8ACB\u7A0D\u5F8C\u91CD\u65B0\u6574\u7406\u3002","info",6e3);else if(oe.length===1){let re=(be.sources||{})[oe[0]]||{},ie=hi[_]||(oe[0]==="judgment"?"\u5224\u6C7A":oe[0]==="law"?"\u6CD5\u898F":oe[0]==="order"?"\u547D\u4EE4":"\u8CC7\u6599");re.status==="error"?N(`${ie}\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF1A${re.message||"\u7121\u6CD5\u53D6\u5F97\u7DDA\u4E0A\u7248\u672C"}`,"danger",7e3):N(re.update_available?`${ie}\u7DDA\u4E0A\u5DF2\u6709\u66F4\u65B0\u7248\u672C\u3002`:`${ie}\u7DDA\u4E0A\u5DF2\u662F\u6700\u65B0\u7248\u672C\u3002`,re.update_available?"warn":"ok",6e3)}else if(oe.length>1){let re=be.sources||{},ie=oe.filter(we=>re[we]?.update_available),fe=oe.filter(we=>re[we]?.status==="error");fe.length?N(`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF0C\u4F46\u6709 ${fe.length} \u9805\u6AA2\u67E5\u5931\u6557\u3002`,"danger",7e3):N(ie.length?`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A${ie.length} \u9805\u6709\u66F4\u65B0\u3002`:"\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D\u7686\u70BA\u6700\u65B0\u3002",ie.length?"warn":"ok",6e3)}else{let re=Number(be.update_count)||0;N(re>0?`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A${re} \u9805\u6709\u66F4\u65B0\u3002`:"\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D\u7686\u70BA\u6700\u65B0\u3002",re>0?"warn":"ok",6e3)}ne&&(Nt.set(ne,{kind:"check",phase:"updated",startedAt:Date.now()}),he()),window.dispatchEvent(new CustomEvent("judgment:updates-changed")),await It({silent:!0})}catch(be){ne&&(Nt.delete(ne),he()),N(be.message||"\u66F4\u65B0\u6AA2\u67E5\u5931\u6557\u3002","danger",7e3)}finally{u=!1,Me(h,!1),c&&Te(c)}},As=async h=>{let _=vi[h]||"";if(!_)return!0;let P=null;try{P=await Q.checkUpdates([_])}catch(oe){return N(`\u7121\u6CD5\u5B8C\u6210\u7248\u672C\u6AA2\u67E5\uFF08${oe.message||"\u7DB2\u8DEF\u932F\u8AA4"}\uFF09\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002`,"warn",7e3),!0}if(!P||P.checking)return P&&P.checking&&N("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002","info",6e3),!0;let de=(P.sources||{})[_];if(!de)return!0;if(window.dispatchEvent(new CustomEvent("judgment:updates-changed")),de.status==="up_to_date"&&!de.update_available){let oe=hi[h]||"\u8CC7\u6599",ne=de.checked_at?`\uFF08${qe(de.checked_at)} \u6AA2\u67E5\uFF09`:"",be=yc[h]||"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u55CE\uFF1F";return window.confirm(`${oe}\u7DDA\u4E0A\u6AA2\u67E5\u70BA\u6700\u65B0\u7248\u672C${ne}\u3002

${be}`)}return de.status==="error"&&N("\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002","warn",6e3),!0},Ra=async(h,_)=>{if(u)return;u=!0;let P=(c?.workflows||[]).find(ne=>ne.id===_);ps=P?.active_run?.id||P?.last_run?.id||"",Et=_,Me(h,!0,"\u57F7\u884C\u4E2D"),he();let de=h.dataset.stageId||"",oe=!1;try{if(!await As(_))return;de&&(Nt.set(de,{kind:"upgrade",phase:"upgrading",startedAt:Date.now()}),he());let be;try{be=await Q.startProcessingWorkflow(_)}catch(re){throw de&&(Nt.delete(de),he()),re}oe=!0,N(`\u5DF2\u555F\u52D5\u300C${P?.label||_}\u300D\u6D41\u7A0B\u3002`,"ok",6e3),be&&be.run_id&&console.info("processing workflow started",be),window.dispatchEvent(new CustomEvent("judgment:updates-changed")),It({silent:!0}),window.setTimeout(()=>{Et===_&&(Et="",ps="",It({silent:!0}))},15e3)}catch(ne){N(ne.message||"\u7121\u6CD5\u555F\u52D5\u5DE5\u4F5C\u6D41\u7A0B\u3002","danger",7e3)}finally{u=!1,(!oe||Et!==_)&&(Et="",ps="",c?(Te(c),p="",he()):Me(h,!1))}},Vs=async h=>{if(!u){u=!0,Me(h,!0,"\u505C\u6B62\u4E2D\u2026");try{let _=await Q.stopProcessingUpdate();for(let[P,de]of Nt)de.kind==="upgrade"&&Nt.delete(P);he(),N(_.message||"\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info",6e3)}catch(_){N(_.message||"\u7121\u6CD5\u505C\u6B62\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{u=!1,Me(h,!1),c&&Te(c)}}},jt=h=>{let _=h.target.closest("[data-processing-action]");if(!_||_.disabled)return;_.closest(".processing-wf-rail")&&(h.preventDefault(),h.stopPropagation());let P=_.dataset.processingAction;if(P==="refresh")It({silent:!1});else if(P==="open-stage")I(_.dataset.stageId||"");else if(P==="refresh-judgment-months")Lt({quiet:!1});else if(P==="refresh-index-storage")Vt({quiet:!1,force:!0});else if(P==="refresh-court-check")k({quiet:!1,force:!0});else if(P==="refresh-law-version-check")q({quiet:!1,force:!0,button:_});else if(P==="refresh-ollama")et({quiet:!1,button:_});else if(P==="refresh-embedding-models")et({quiet:!1,button:_});else if(P==="select-embedding-model"){let de=_.dataset.hostId||"",oe=_.dataset.model||"";Mt(`${de}|${oe}`)}else if(P==="move-ollama-host"){let de=C?.hosts||[],oe=de.findIndex(ie=>Number(ie.id)===Number(_.dataset.hostId)),ne=_.dataset.direction,be=ne==="up"?oe-1:ne==="down"?oe+1:-1;if(oe<0||be<0||be>=de.length)return;let re=de.map(ie=>Number(ie.id));[re[oe],re[be]]=[re[be],re[oe]],Ke(re)}else if(P==="check-updates")Ea(_,_.dataset.workflowId||"");else if(P==="run-workflow"){let de=_.dataset.workflowId||"";Ra(_,de)}else P==="stop"&&Vs(_)},Bt=(h,{scroll:_=!1}={})=>{if(v=h||"overview",c){let P=Sn(c,v);is(a,P),$=P;let de=Sa(c,v,lt(),ve);if(is(s,de),p=de,O(),A(),F(),it(c),H){let oe=L(H);oe?X(oe):J()}_&&s.scrollIntoView({behavior:"smooth",block:"start"})}xn.has(v)&&et({quiet:!0}),v==="judgment_download"&&Lt({quiet:!0}),v==="index_versions"&&Vt({quiet:!0}),v==="normalize_courts"&&k({quiet:!0}),v==="backfill_law_articles"&&q({quiet:!0})},Ms=h=>{let _=h.target.closest("[data-processing-workflow]");_&&Bt(_.dataset.processingWorkflow||"overview")},Ls=h=>{let _=h.target.closest("[data-timeline-workflow]");_&&(h.preventDefault(),Bt(_.dataset.timelineWorkflow||"",{scroll:!0}))},Ws=h=>{let _=h.target.closest?.(".index-wf-stage[data-index-stage]");if(_&&s.contains(_)){let oe=_.dataset.indexStage||"";oe&&(_.open?qn.add(oe):qn.delete(oe));return}let P=h.target.closest?.(".processing-wf-stage[data-processing-stage]");if(!P||!s.contains(P))return;let de=P.dataset.processingStage||"";de&&(P.open?ve.add(de):ve.delete(de))};return t.addEventListener("click",jt),a.addEventListener("click",Ms),s.addEventListener("click",Ls),s.addEventListener("pointerover",ue),s.addEventListener("pointerout",Le),s.addEventListener("pointerdown",Ct),s.addEventListener("toggle",Ws,!0),window.addEventListener("scroll",J,{capture:!0,passive:!0}),rt(),typeof EventSource>"u"&&await It({silent:!1}),()=>{o=!0,Ge(),t.removeEventListener("click",jt),a.removeEventListener("click",Ms),s.removeEventListener("click",Ls),te(),s.removeEventListener("pointerover",ue),s.removeEventListener("pointerout",Le),s.removeEventListener("pointerdown",Ct),s.removeEventListener("toggle",Ws,!0),window.removeEventListener("scroll",J,{capture:!0})}}var In={};Wt(In,{render:()=>Kd});var En={draft:{label:"\u8349\u7A3F",badge:"badge-neutral"},pending_review:{label:"\u5F85\u5BE9",badge:"badge-warn"},changes_requested:{label:"\u9000\u56DE\u4FEE\u6539",badge:"badge-warn"},accepted:{label:"\u5DF2\u6838\u51C6",badge:"badge-ok"},rejected:{label:"\u5DF2\u62D2\u7D55",badge:"badge-danger"},retired:{label:"\u5DF2\u522A\u9664\uFF0F\u9000\u5F79",badge:"badge-neutral"}},Ut={law_concept:"\u6CD5\u898F\u6982\u5FF5",article_lookup:"\u6307\u5B9A\u689D\u6587",judgment_lookup:"\u5224\u6C7A\u6AA2\u7D22",structured:"\u7D50\u69CB\u5316\u554F\u984C",general:"\u4E00\u822C\u554F\u984C",refusal:"\u62D2\u7D55\u56DE\u7B54"},Ss={easy:"\u7C21\u55AE",medium:"\u4E2D\u7B49",hard:"\u56F0\u96E3"},Ti={smoke:"Smoke",core:"Core",full:"Full",holdout:"Holdout"};function Js(e){let t=En[e]||{label:e||"\u672A\u77E5",badge:"badge-neutral"};return`<span class="badge ${t.badge}">${r(t.label)}</span>`}function Rn(e){return String(e||"").split(`
`).map(t=>t.trim()).filter(Boolean)}function vd(e){return Rn(e).map(t=>{let[s,a]=t.split("|").map(n=>n.trim());return{law_name:s||"",source_type:a||""}})}function hd(e){return Rn(e).map(t=>{let[s,a]=t.split("|").map(n=>n.trim());return{law_name:s||"",article_no:a||""}})}function $d(e){return Rn(e).map(t=>({jid:t.trim()}))}function yd(e){return(e?.expected_laws||[]).map(t=>[t.law_name,t.source_type].filter(Boolean).join("|")).join(`
`)}function wd(e){return(e?.expected_articles||[]).map(t=>[t.law_name||t.law_key,t.article_no].filter(Boolean).join("|")).join(`
`)}function _d(e){return(e?.expected_judgments||[]).map(t=>t.jid).join(`
`)}function kd(e){return(e?.tags||[]).join(", ")}function Gs(e){return`<div class="qb-empty">${f("info",18)}<span>${r(e)}</span></div>`}function Cn(e){let t=(e.expected_laws||[]).map(i=>i.law_name).filter(Boolean),s=(e.expected_articles||[]).map(i=>`${i.law_name||""} ${i.article_no||""}`.trim()).filter(Boolean),a=(e.expected_judgments||[]).map(i=>i.jid).filter(Boolean),n=[...t.map(i=>`<span class="chip">${r(i)}</span>`),...s.map(i=>`<span class="chip">${r(i)}</span>`),...a.map(i=>`<span class="chip chip-mono">${r(i)}</span>`)];return n.length?`<div class="chips qb-labels">${n.join("")}</div>`:'<span class="qb-muted">\u5C1A\u672A\u6A19\u8A3B expected labels</span>'}function Pn(){return`<details class="qb-import">
    <summary>${f("upload",14)}JSON \u6279\u6B21\u532F\u5165</summary>
    <p class="qb-muted">\u683C\u5F0F\uFF1A<code>{"items":[{question, question_type, difficulty, expected_laws, expected_articles, expected_judgments, reference_answer, tags, rubric}]}</code>\u3002\u76F8\u540C\u984C\u76EE fingerprint \u9810\u8A2D\u66F4\u65B0\u3002</p>
    <textarea class="input" id="qb-import-json" rows="6" placeholder='{"items":[...]}'></textarea>
    <div class="qb-actions">
      <button class="btn btn-secondary btn-sm" type="button" data-qb-action="import-json">${f("upload",13)}<span>\u532F\u5165 JSON</span></button>
    </div>
  </details>`}function Sd(e){let t=e?.item||{},s=Array.isArray(e?.warnings)?e.warnings:[],a=Array.isArray(t.tags)?t.tags:[];return`<section class="report-card qb-card qb-ai-result">
    <div class="side-card-head">
      <span class="side-card-title">${f("sparkles",14)}Ollama \u5DF2\u5EFA\u7ACB\u984C\u76EE #${t.id}</span>
      ${Js(t.status)}
    </div>
    <div class="qb-ai-answer">
      <strong>${r(t.question||"")}</strong>
      <div class="qb-ai-meta">
        ${r(Ut[t.question_type]||t.question_type||"")}
        \xB7 ${r(Ss[t.difficulty]||t.difficulty||"")}
        \xB7 ${r(e?.model||"\u672C\u6A5F Ollama")}
      </div>
      ${Cn(t)}
      ${t.reference_answer?`<div class="qb-reference"><span class="summary-label">Ollama \u53C3\u8003\u7B54\u6848</span><p>${r(t.reference_answer)}</p></div>`:""}
      ${a.length?`<div class="chips">${a.map(n=>`<span class="chip">${r(n)}</span>`).join("")}</div>`:""}
      ${s.length?`<div class="qb-ai-warnings"><strong>\u9700\u8981\u6CE8\u610F</strong><ul>${s.map(n=>`<li>${r(n)}</li>`).join("")}</ul></div>`:""}
      <div class="qb-actions">
        <button class="btn btn-primary btn-sm" type="button" data-qb-action="review-ai-item">${f("shield",13)}<span>\u524D\u5F80\u9A57\u6536</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="reset-ai">${f("plus",13)}<span>\u518D\u65B0\u589E\u4E00\u984C</span></button>
      </div>
    </div>
    ${Pn()}
  </section>`}function xd(e){return e.aiResult?Sd(e.aiResult):`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${f("sparkles",14)}AI \u984C\u5EAB\u65B0\u589E</span>
      <span class="badge badge-neutral">\u672C\u6A5F Ollama</span>
    </div>
    <form class="qb-form qb-ai-form" data-qb-form="ai-create" id="qb-create-form">
      <label class="field qb-wide">
        <span class="field-label">\u984C\u76EE <span class="field-tag">question</span></span>
        <textarea class="input" name="question" rows="4" required placeholder="\u8F38\u5165\u554F\u984C\uFF0COllama \u6703\u56DE\u7B54\u4E26\u81EA\u52D5\u5224\u65B7\u984C\u578B\u3001\u96E3\u5EA6\u3001\u6CD5\u898F\uFF0F\u689D\u6587\u3001\u53C3\u8003\u7B54\u6848\u8207\u6A19\u7C64\u3002">${r(e.aiQuestion||"")}</textarea>
      </label>
      <p class="qb-form-hint">\u9001\u51FA\u5F8C\u7531\u672C\u6A5F Ollama \u56DE\u7B54\u4E26\u81EA\u52D5\u5EFA\u7ACB\u6B04\u4F4D\uFF1B\u984C\u76EE\u6703\u4EE5\u300C\u5F85\u5BE9\u300D\u5EFA\u7ACB\uFF0C\u4ECD\u9700\u4EBA\u5DE5\u8986\u6838\u5F8C\u624D\u6703\u6210\u70BA benchmark-ready\u3002</p>
      <div class="qb-actions">
        <button class="btn btn-primary" type="submit" ${e.aiLoading?"disabled":""}>${e.aiLoading?'<span class="spinner"></span><span>Ollama \u7522\u751F\u4E2D\u2026</span>':`${f("sparkles",14)}<span>\u8B93 Ollama \u7522\u751F\u4E26\u5EFA\u7ACB</span>`}</button>
        <button class="btn btn-secondary" type="button" data-qb-action="reset-ai" ${e.aiLoading?"disabled":""}>\u6E05\u9664</button>
      </div>
    </form>
    ${Pn()}
  </section>`}function qd(e){return`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${f("edit",14)}\u7DE8\u8F2F\u984C\u76EE #${e.id}</span>
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
          <select class="select" name="question_type">${Object.entries(Ut).map(([t,s])=>`<option value="${t}" ${e?.question_type===t?"selected":""}>${s}</option>`).join("")}</select>
        </label>
        <label class="field"><span class="field-label">\u96E3\u5EA6</span>
          <select class="select" name="difficulty">${Object.entries(Ss).map(([t,s])=>`<option value="${t}" ${e?.difficulty===t?"selected":""}>${s}</option>`).join("")}</select>
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
          <textarea class="input" name="expected_laws" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5&#10;\u9280\u884C\u6CD5|law">${r(yd(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u689D\u6587 <span class="field-tag">\u6CD5\u898F|\u7B2C 157-1 \u689D</span></span>
          <textarea class="input" name="expected_articles" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 157-1 \u689D&#10;\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 171 \u689D">${r(wd(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u5224\u6C7A <span class="field-tag">jid\uFF0C\u6BCF\u884C\u4E00\u7B46</span></span>
          <textarea class="input" name="expected_judgments" rows="3" placeholder="TPDM,113,\u91D1\u8A34,27,20241128,1">${r(_d(e))}</textarea>
        </label>
      </div>
      <label class="field"><span class="field-label">\u53C3\u8003\u7B54\u6848\uFF0Frubric \u8AAA\u660E</span>
        <textarea class="input" name="reference_answer" rows="4" placeholder="\u63D0\u4F9B\u7D66 LLM judge \u8207\u4EBA\u5DE5\u9A57\u6536\u53C3\u8003\uFF1B\u53EF\u7559\u7A7A\uFF0C\u4F46\u54C1\u8CEA\u8A55\u5206\u6703\u8F03\u5F31\u3002">${r(e?.reference_answer||"")}</textarea>
      </label>
      <div class="qb-form-grid">
        <label class="field"><span class="field-label">\u6A19\u7C64 <span class="field-tag">\u9017\u865F\u5206\u9694</span></span>
          <input class="input" name="tags" value="${r(kd(e))}" placeholder="\u5167\u7DDA\u4EA4\u6613, \u8B49\u5238\u4EA4\u6613\u6CD5" />
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
        <button class="btn btn-primary" type="submit">${f("check",14)}<span>\u5132\u5B58\u65B0\u7248\u672C</span></button>
        <button class="btn btn-secondary" type="button" data-qb-action="reset-create">\u6E05\u9664</button>
      </div>
      <div class="qb-form-hint">\u4FEE\u6539\u5DF2\u5B58\u5728\u7684\u984C\u76EE\u6703\u5EFA\u7ACB\u65B0\u7248\u672C\uFF1B\u5DF2\u6838\u51C6\u984C\u76EE\u4FEE\u6539\u5F8C\u6703\u56DE\u5230\u5F85\u5BE9\uFF0C\u9700\u91CD\u65B0\u9A57\u6536\u3002</div>
    </form>
    ${Pn()}
  </section>`}function Ad(e,t){return e?qd(e):xd(t)}function Md(e){let t=e.status==="retired"||!!e.deleted_at;return`<article class="qb-item" data-qb-item="${e.id}">
    <div class="qb-item-head">
      <span class="qb-id">#${e.id}</span>
      <div class="qb-item-title">
        <strong>${r(e.question)}</strong>
        <span class="qb-meta">
          ${r(Ut[e.question_type]||e.question_type)}
          \xB7 ${r(Ss[e.difficulty]||e.difficulty)}
          \xB7 v${e.version}
          ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
          ${e.benchmark_ready?' \xB7 <span class="qb-ready">Benchmark ready</span>':""}
        </span>
      </div>
      ${Js(e.status)}
    </div>
    <div class="qb-fingerprint mono">fingerprint ${r(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${Cn(e)}
    <div class="qb-item-foot">
      <span>\u66F4\u65B0 ${r(qe(e.updated_at))}</span>
      ${e.reviewed_by?`<span>\u5BE9\u6838 ${r(e.reviewed_by)}</span>`:""}
      ${e.review_comment?`<span class="qb-comment">${r(e.review_comment)}</span>`:""}
      <div class="qb-actions">
        ${t?`<button class="btn btn-primary btn-sm" type="button" data-qb-action="restore" data-id="${e.id}">${f("refresh",13)}<span>\u5FA9\u539F\u984C\u76EE</span></button>`:`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${f("edit",13)}<span>\u7DE8\u8F2F</span></button>
               ${["pending_review","changes_requested"].includes(e.status)?"":`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="submit-review" data-id="${e.id}">${f("upload",13)}<span>${e.status==="draft"?"\u9001\u5BE9":"\u91CD\u65B0\u9001\u5BE9"}</span></button>`}
               <button class="btn btn-secondary btn-sm" type="button" data-qb-action="review" data-id="${e.id}">${f("shield",13)}<span>\u9A57\u6536</span></button>
               <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${f("trash",13)}<span>\u522A\u9664</span></button>`}
      </div>
    </div>
  </article>`}function Ld(e){return`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${f("database",14)}\u984C\u5EAB\u7BA1\u7406</span>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="new">${f("plus",13)}<span>\u65B0\u589E</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="revalidate">${f("refresh",13)}<span>\u91CD\u65B0\u9A57\u8B49</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="export">${f("download",13)}<span>\u532F\u51FA JSON</span></button>
      </div>
    </div>
    <form class="qb-filters" data-qb-form="filter">
      <input class="input" name="query" type="search" placeholder="\u641C\u5C0B\u984C\u76EE\u6216\u53C3\u8003\u7B54\u6848" value="${r(e.filters.query)}" />
      <select class="select" name="status">
        <option value="">\u5168\u90E8\u72C0\u614B</option>
        ${Object.entries(En).map(([t,s])=>`<option value="${t}" ${e.filters.status===t?"selected":""}>${s.label}</option>`).join("")}
      </select>
      <select class="select" name="question_type">
        <option value="">\u5168\u90E8\u984C\u578B</option>
        ${Object.entries(Ut).map(([t,s])=>`<option value="${t}" ${e.filters.question_type===t?"selected":""}>${s}</option>`).join("")}
      </select>
      <select class="select" name="difficulty">
        <option value="">\u5168\u90E8\u96E3\u5EA6</option>
        ${Object.entries(Ss).map(([t,s])=>`<option value="${t}" ${e.filters.difficulty===t?"selected":""}>${s}</option>`).join("")}
      </select>
      <div class="qb-tag-filter" data-qb-tag-filter>
        <div class="qb-tag-values">
          ${e.filters.tags.length?e.filters.tags.map(t=>`<span class="chip qb-tag-chip">${r(t)}<button class="qb-tag-remove" type="button" data-qb-action="remove-tag" data-tag="${r(t)}" aria-label="\u79FB\u9664\u6A19\u7C64 ${r(t)}">${f("x",9)}</button></span>`).join(""):'<span class="qb-tag-placeholder">\u6A19\u7C64</span>'}
        </div>
        <button class="qb-tag-add" type="button" data-qb-action="open-tag-search" aria-label="\u52A0\u5165\u6A19\u7C64" aria-haspopup="listbox">${f("plus",13)}</button>
        ${e.filters.tags.map(t=>`<input type="hidden" name="tags" value="${r(t)}" />`).join("")}
        <div class="qb-tag-popover" data-qb-tag-popover hidden>
          <input class="input" type="search" data-qb-tag-search placeholder="\u8F38\u5165\u76F8\u8FD1\u5B57\u641C\u5C0B\u6A19\u7C64\u2026" autocomplete="off" />
          <div class="qb-tag-results" data-qb-tag-results role="listbox" aria-live="polite"></div>
        </div>
      </div>
      <button class="btn btn-primary btn-sm" type="submit">${f("search",13)}<span>\u7BE9\u9078</span></button>
    </form>
    <div class="qb-list">
      ${e.items.length?e.items.map(t=>Md(t)).join(""):Gs("\u76EE\u524D\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u984C\u76EE\u3002")}
    </div>
    <div class="qb-pagination">
      <span>\u5171 ${d(e.total)} \u984C</span>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="prev" ${e.offset<=0?"disabled":""}>\u4E0A\u4E00\u9801</button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="next" ${e.offset+e.limit>=e.total?"disabled":""}>\u4E0B\u4E00\u9801</button>
      </div>
    </div>
  </section>`}var Ei=[["queue","\u5F85\u5BE9\uFF0F\u9000\u56DE"],["accepted","\u5DF2\u6838\u51C6"],["rejected","\u5DF2\u62D2\u7D55"],["draft","\u8349\u7A3F"]];function jd(e){let t=e.stats||{};return{queue:Number(t.pending_review||0)+Number(t.changes_requested||0),accepted:Number(t.accepted||0),rejected:Number(t.rejected||0),draft:Number(t.draft||0)}}function Td(e,t){let s=e.reviewFilter||"queue",a={queue:{title:"\u76EE\u524D\u6C92\u6709\u5F85\u5BE9\u6216\u9000\u56DE\u4FEE\u6539\u7684\u984C\u76EE\u3002",text:t.accepted?`\u5DF2\u6709 ${d(t.accepted)} \u984C\u6838\u51C6\u3002\u65B0\u984C\u76EE\u5EFA\u7ACB\u5F8C\u6703\u81EA\u52D5\u9001\u5BE9\uFF0C\u4E5F\u53EF\u4EE5\u5207\u63DB\u5230\u300C\u5DF2\u6838\u51C6\u300D\u91CD\u65B0\u9A57\u6536\u65E2\u6709\u984C\u76EE\u3002`:"\u5EFA\u7ACB\u984C\u76EE\u5F8C\u6703\u9810\u8A2D\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\uFF1B\u82E5\u53EA\u60F3\u5148\u4FDD\u5B58\uFF0C\u5EFA\u7ACB\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5373\u53EF\u5B58\u6210\u8349\u7A3F\u3002"},accepted:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u6838\u51C6\u984C\u76EE\u3002",text:"\u984C\u76EE\u901A\u904E\u4EBA\u5DE5\u9A57\u6536\u5F8C\u6703\u5217\u5728\u9019\u88E1\uFF1B\u4E5F\u53EF\u4EE5\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u9001\u51FA\u9A57\u6536\u3002"},rejected:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u62D2\u7D55\u984C\u76EE\u3002",text:"\u88AB\u62D2\u7D55\u7684\u984C\u76EE\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u4E2D\uFF0C\u53EF\u4FEE\u6539\u5F8C\u91CD\u65B0\u9001\u5BE9\u3002"},draft:{title:"\u76EE\u524D\u6C92\u6709\u8349\u7A3F\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u984C\u76EE\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5C31\u6703\u5B58\u6210\u8349\u7A3F\uFF0C\u4E4B\u5F8C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002"}}[s]||{title:"\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u65B0\u984C\u76EE\u5F8C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"},n=[s!=="draft"?`<button class="btn btn-primary btn-sm" type="button" data-qb-action="new">${f("plus",13)}<span>\u65B0\u589E\u984C\u76EE</span></button>`:"",s==="queue"&&t.accepted?`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="review-filter" data-filter="accepted">${f("shield",13)}<span>\u67E5\u770B\u5DF2\u6838\u51C6 ${d(t.accepted)}</span></button>`:"",`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="go-manage">${f("database",13)}<span>\u524D\u5F80\u984C\u5EAB\u7BA1\u7406</span></button>`].filter(Boolean).join("");return`<div class="qb-empty qb-empty-block">
    <span class="qb-empty-icon">${f("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>${r(a.title)}</strong>
      <p>${r(a.text)}</p>
      <div class="qb-actions">${n}</div>
    </div>
  </div>`}function Nd(e){let t=Ei.find(([s])=>s===e);return t?t[1]:"\u5F85\u5BE9\uFF0F\u9000\u56DE"}function Ed(e,t){return`<button class="qb-review-item${t?" is-active":""}" type="button" data-qb-action="select-review-item" data-id="${e.id}" aria-pressed="${t?"true":"false"}">
    <span class="qb-review-item-top">
      <span class="qb-id">#${e.id}</span>
      <span class="qb-review-item-meta">
        ${r(Ut[e.question_type]||e.question_type)}
        \xB7 ${r(Ss[e.difficulty]||e.difficulty)}
        \xB7 v${e.version}
        ${e.benchmark_ready?" \xB7 Benchmark ready":""}
        ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
      </span>
      ${Js(e.status)}
    </span>
    <strong>${r(e.question)}</strong>
  </button>`}function Rd(e){return`<article class="qb-review-pane-card">
    <div class="qb-review-pane-head">
      <div class="qb-review-pane-title">
        <span class="qb-review-item-meta">#${e.id} \xB7 v${e.version} \xB7 ${r(Ut[e.question_type]||e.question_type)} \xB7 ${r(Ss[e.difficulty]||e.difficulty)}</span>
        <strong>${r(e.question)}</strong>
      </div>
      <div class="qb-review-pane-side">
        ${Js(e.status)}
        <div class="qb-actions">
          <button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${f("edit",13)}<span>\u7DE8\u8F2F</span></button>
          <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${f("trash",13)}<span>\u522A\u9664</span></button>
        </div>
      </div>
    </div>
    <div class="qb-fingerprint mono">fingerprint ${r(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${Cn(e)}
    ${e.review_comment?`<div class="qb-review-note"><span class="summary-label">\u6700\u8FD1\u6279\u6CE8${e.reviewed_by?` \xB7 ${r(e.reviewed_by)}`:""}</span><p>${r(e.review_comment)}</p></div>`:""}
    ${e.reference_answer?`<div class="qb-reference"><span class="summary-label">\u53C3\u8003\u7B54\u6848</span><p>${r(e.reference_answer)}</p></div>`:""}
    <form class="qb-review-form" data-qb-form="review" data-id="${e.id}">
      <div class="qb-score-grid">
        ${[["clarity","\u984C\u76EE\u6E05\u6670"],["labels","\u6CD5\u689D\u6A19\u6CE8"],["answer","\u53C3\u8003\u7B54\u6848"],["difficulty","\u96E3\u5EA6\u8207\u6A19\u7C64"],["overall","\u6574\u9AD4"]].map(([t,s])=>`<label class="field"><span class="field-label">${s} <span class="field-tag">1\u20135</span></span><input class="input" type="number" min="1" max="5" name="score_${t}" value="4" /></label>`).join("")}
      </div>
      <label class="field"><span class="field-label">\u6279\u6CE8</span><textarea class="input" name="comment" rows="3" placeholder="\u6A19\u8A3B\u7406\u7531\u3001\u9700\u8981\u4FEE\u6539\u7684\u6B04\u4F4D\uFF0C\u6216\u9A57\u6536\u7D50\u8AD6\u3002"></textarea></label>
      <div class="qb-actions qb-review-decisions">
        <button class="btn btn-primary btn-sm" type="button" data-qb-action="decide" data-decision="approved">${f("check",13)}<span>\u6838\u51C6</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="decide" data-decision="changes_requested">${f("edit",13)}<span>\u9000\u56DE\u4FEE\u6539</span></button>
        <button class="btn btn-ghost btn-sm" type="button" data-qb-action="decide" data-decision="rejected">${f("x",13)}<span>\u62D2\u7D55</span></button>
      </div>
    </form>
    ${e.reviews?.length?`<div class="qb-review-history"><span class="summary-label">\u5BE9\u6838\u7D00\u9304</span>${e.reviews.map(t=>`<div class="qb-review-row"><span>${r(t.reviewer||"\u533F\u540D")}</span>${Js(t.decision==="approved"?"accepted":t.decision)}<span>${r(qe(t.created_at))}</span><p>${r(t.comment||"\u2014")}</p></div>`).join("")}</div>`:""}
  </article>`}function Cd(){return`<div class="qb-empty qb-empty-block qb-review-placeholder">
    <span class="qb-empty-icon">${f("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>\u5F9E\u5DE6\u5074\u9078\u64C7\u984C\u76EE</strong>
      <p>\u9EDE\u9078\u984C\u76EE\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u984C\u5E79\u3001\u9810\u671F\u6A19\u8A3B\u3001\u53C3\u8003\u7B54\u6848\u8207\u6838\u51C6\u9078\u9805\u3002</p>
    </div>
  </div>`}function Pd(e){let t=e.reviewDetail,s=jd(e),a=e.reviewFilter||"queue",n=Ei.map(([l,u])=>`<button class="chip qb-review-tab${a===l?" is-active":""}" type="button" role="tab" aria-selected="${a===l?"true":"false"}" data-qb-action="review-filter" data-filter="${l}"><span>${u}</span><span class="qb-review-tab-count">${d(s[l]||0)}</span></button>`).join(""),i=e.reviewItems.length?e.reviewItems.map(l=>Ed(l,Number(t?.id)===Number(l.id))).join(""):`<div class="qb-empty qb-empty-compact">${f("info",16)}<span>\u76EE\u524D\u6C92\u6709${r(Nd(a))}\u984C\u76EE\u3002</span></div>`,o=t?Rd(t):e.reviewItems.length?Cd():Td(e,s);return`<section class="report-card qb-card qb-review-card">
    <div class="side-card-head">
      <span class="side-card-title">${f("shield",14)}\u984C\u5EAB\u4EBA\u5DE5\u9A57\u6536\u6279\u6CE8</span>
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
  </section>`}function Qs(e){if(e==null||e==="")return"";let t=Number(e);return Number.isFinite(t)?`${Math.round(t*100)}%`:""}function Id(e){if(!e||typeof e!="object")return"\u5F15\u7528";let t=String(e.jid||"").trim();if(t)return t;let s=String(e.law_name||"").trim(),a=String(e.article_no||"").trim(),n=`${s} ${a}`.trim();return n||String(e.title||e.text||"\u5F15\u7528").slice(0,80)}function Bd(e){let t=e?.metrics||{},s=t.scores||{},a=[["\u6CD5\u898F\u53EC\u56DE",Qs(t.law_recall)],["\u689D\u6587\u53EC\u56DE",Qs(t.article_recall)],["\u898F\u5247\u5206",Qs(s.deterministic)],["Judge",Qs(s.judge)],["\u4EBA\u5DE5",Qs(s.human)]].filter(([,n])=>n);return a.length?`<div class="qb-bank-stats">${a.map(([n,i])=>`<span class="qb-bank-stat"><span>${r(n)}</span><strong>${r(i)}</strong></span>`).join("")}</div>`:""}function Dd(e){let t=Array.isArray(e?.law_sources)?e.law_sources:[],s=Array.isArray(e?.citations)?e.citations:[],a=t.length?`<div class="qb-bank-sources">${t.map(i=>{let o=String(i.law_name||"\u672A\u547D\u540D\u6CD5\u898F"),l=(i.articles||[]).map(c=>String(c.article_no||"").trim()).filter(Boolean),u=`<strong>${r(o)}</strong>${l.length?`<small>${r(l.join("\u3001"))}</small>`:""}`;return i.law_url?`<a class="qb-bank-law" href="${r(i.law_url)}" target="_blank" rel="noreferrer">${u}</a>`:`<span class="qb-bank-law">${u}</span>`}).join("")}</div>`:"",n=s.length?`<div class="qb-bank-sources qb-bank-citations">${s.map(i=>`<span class="chip chip-mono">${r(Id(i))}</span>`).join("")}</div>`:"";return!a&&!n?"":`<div class="qb-bank-answer-block">
    <div class="qb-bank-section-label"><span>\u5F15\u7528\u4F86\u6E90</span><span>${d(t.length+s.length)} \u7B46</span></div>
    ${a}${n}
  </div>`}function Ri(e,t){if(!e)return`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${f("history",20)}</span>
      <strong>\u5C1A\u7121 RAG \u7B54\u6848</strong>
      <span>\u8DD1\u4E00\u6B21 Benchmark \u5F8C\uFF0C\u6700\u8FD1\u4E00\u6B21\u6210\u529F\u56DE\u7B54\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</span>
    </div>`;let s=Number(e.item_version||0),a=Number(t?.version||0),n=s&&a&&s!==a?`<span class="badge badge-warn">\u7B54\u6848 v${s} \xB7 \u984C\u76EE v${a}</span>`:"",i=e.answer_source==="llm"?"LLM \u751F\u6210":e.answer_source==="structured"?"\u6CD5\u898F\u8CC7\u6599\u5EAB":String(e.answer_source||"RAG");return`<div class="qb-bank-answer-meta">
      <span class="badge badge-ok"><span class="status-dot is-ok"></span>RAG \u5B8C\u6210</span>
      <span class="badge badge-neutral">${r(i)}</span>
      ${n}
      <span class="mono">${r(e.run_label||e.run_id||"")}</span>
      <span>${r(qe(e.finished_at))}</span>
      <span>${r(ge(e.duration_ms))}</span>
      ${e.llm_model?`<span class="mono">${r(e.llm_model)}</span>`:""}
    </div>
    <div class="qb-bank-answer-block">
      <div class="qb-bank-section-label"><span>\u56DE\u7B54</span><span>${d(String(e.answer||"").length)} \u5B57</span></div>
      <p class="qb-bank-answer-text">${r(String(e.answer||"").trim()||"\uFF08\u7A7A\u767D\u56DE\u7B54\uFF09")}</p>
    </div>
    ${Dd(e)}
    ${Bd(e)}`}function Ci(e,t){let s=e.selectedSuiteId,a=t&&e.suiteAnswers?.[String(s)]?.[String(t.id)]||null;return t?`<div class="qb-bank-answer-head">
      <div class="qb-bank-answer-heading">
        <span class="qb-bank-answer-kicker">${f("sparkles",12)}RAG \u6700\u8FD1\u4E00\u6B21\u7B54\u6848</span>
        <strong class="qb-bank-answer-question">#${t.id} ${r(t.question)}</strong>
      </div>
      ${a?`<span class="qb-bank-answer-state">${r(Ut[t.question_type]||t.question_type)} \xB7 v${t.version}</span>`:""}
    </div>
    ${Ri(a,t)}`:`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${f("cube",20)}</span>
      <strong>\u9078\u64C7\u984C\u76EE</strong>
      <span>\u5F9E\u5DE6\u5074\u6E05\u55AE\u9078\u64C7\u4E00\u984C\uFF0C\u67E5\u770B\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`}function Pi(e){return`<span class="qb-bank-actions">
    <button class="qb-bank-icon" type="button" data-qb-action="edit" data-id="${e.id}" title="\u7DE8\u8F2F\u984C\u76EE" aria-label="\u7DE8\u8F2F\u984C\u76EE #${e.id}">${f("edit",13)}</button>
    <button class="qb-bank-icon is-danger" type="button" data-qb-action="delete" data-id="${e.id}" title="\u5F9E\u984C\u5EAB\u79FB\u9664" aria-label="\u5F9E\u984C\u5EAB\u79FB\u9664 #${e.id}">${f("trash",13)}</button>
  </span>`}function Od(e,t,{selected:s,hasAnswer:a}){return`<div class="qb-bank-row${s?" is-active":""}" data-id="${e.id}">
    <button class="qb-bank-select" type="button" data-qb-action="select-bank-item" data-id="${e.id}" aria-pressed="${s?"true":"false"}">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <span class="qb-bank-item-copy">
        <strong>${r(e.question)}</strong>
        <small>${r(Ut[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${a?"\u5DF2\u6709 RAG \u7B54\u6848":"\u5C1A\u7121 RAG \u7B54\u6848"}</small>
      </span>
    </button>
    ${Pi(e)}
  </div>`}function Fd(e,t,s){return`<article class="qb-bank-full-item" data-id="${e.id}">
    <div class="qb-bank-full-head">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <div class="qb-bank-full-title">
        <strong>${r(e.question)}</strong>
        <small>${r(Ut[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${r(En[e.status]?.label||e.status||"")}</small>
      </div>
      ${Pi(e)}
    </div>
    ${Ri(s,e)}
  </article>`}function Ni(e){let t=e.editingSuite,s=Array.isArray(e.suites)?e.suites:[],a=s.find(g=>Number(g.id)===Number(e.selectedSuiteId))||s[0]||null,n=Array.isArray(a?.items)?a.items:[],i=e.suiteAnswers?.[String(a?.id)]||{},o=n.find(g=>Number(g.id)===Number(e.selectedBankItemId))||null,l=!!e.suiteAnswersLoading,u=String(e.suiteAnswersError||""),c=!!e.suiteManageOpen||!s.length,p=e.bankTab==="full"?"full":"split",$=s.length?`<div class="qb-bank-tabs" role="tablist" aria-label="Benchmark \u984C\u5EAB\u6AA2\u8996">
        <button class="qb-bank-tab${p==="split"?" is-active":""}" type="button" role="tab" aria-selected="${p==="split"?"true":"false"}" data-qb-action="bank-tab" data-tab="split">${f("grid",13)}<span>Benchmark \u984C\u5EAB</span><span class="badge badge-neutral">${d(n.length)}</span></button>
        <button class="qb-bank-tab${p==="full"?" is-active":""}" type="button" role="tab" aria-selected="${p==="full"?"true":"false"}" data-qb-action="bank-tab" data-tab="full">${f("table",13)}<span>\u984C\u5EAB\u5168\u5217\u8868</span><span class="badge badge-neutral">${d(n.length)}</span></button>
      </div>`:"",v="";if(!s.length)v=`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${f("cube",20)}</span>
      <strong>\u5C1A\u672A\u5EFA\u7ACB Benchmark \u984C\u5EAB</strong>
      <span>\u5C55\u958B\u4E0B\u65B9 Suite \u8A2D\u5B9A\u4E26\u5EFA\u7ACB\u984C\u5EAB\u5F8C\uFF0C\u5C31\u80FD\u5728\u9019\u88E1\u700F\u89BD\u984C\u76EE\u8207\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`;else if(l)v='<div class="qb-bank-loading"><span class="spinner" aria-hidden="true"></span><span>\u8B80\u53D6\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u4E2D\u2026</span></div>';else{let g=u?Ie({tone:"warn",title:"\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u8B80\u53D6\u5931\u6557",text:r(u)}):"";p==="full"?v=`${g}<div class="qb-bank-full" data-qb-bank-view="full">${n.length?n.map((m,w)=>Fd(m,w,i[String(m.id)]||null)).join(""):Gs("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>`:v=`${g}<div class="qb-bank-split" data-qb-bank-view="split">
        <div class="qb-bank-list" data-qb-bank-list>${n.length?n.map((m,w)=>Od(m,w,{selected:Number(m.id)===Number(o?.id),hasAnswer:!!i[String(m.id)]})).join(""):Gs("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>
        <div class="qb-bank-answer-pane" data-qb-bank-answer>${Ci(e,o)}</div>
      </div>`}return`<section class="report-card qb-card qb-bank-card">
    <div class="side-card-head qb-bank-head">
      <div class="qb-bank-heading">
        <span class="side-card-title">${f("cube",14)}Benchmark \u984C\u5EAB</span>
        <span class="qb-bank-sub">${a?`${r(a.name)} \xB7 v${a.version} \xB7 ${d(a.item_count)} \u984C`:"\u5C1A\u672A\u5EFA\u7ACB suite"}</span>
      </div>
      <div class="qb-bank-controls">
        ${s.length?`<label class="qb-suite-picker"><span>Suite</span><select class="select" data-qb-suite-select aria-label="\u9078\u64C7 benchmark suite">${s.map(g=>`<option value="${g.id}" ${Number(g.id)===Number(a?.id)?"selected":""}>${r(g.name)} \xB7 ${d(g.item_count)} \u984C</option>`).join("")}</select></label>`:""}
        ${a?`<span class="badge ${a.status==="frozen"?"badge-ok":"badge-neutral"}">${a.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>`:""}
      </div>
    </div>
    ${$}
    ${v}
    <details class="qb-suite-manage" ${c?"open":""}>
      <summary>${f("sliders",14)}Suite \u8A2D\u5B9A\u8207\u7248\u672C <span class="qb-muted">${d(s.length)} \u500B suite \xB7 ${d(e.ready.length)} \u984C benchmark-ready</span></summary>
      <div class="qb-suite-manage-body">
        <form class="qb-suite-form" data-qb-form="suite">
          <input type="hidden" name="suite_id" value="${t?.id||""}" />
          <div class="qb-form-grid">
            <label class="field"><span class="field-label">Suite \u540D\u7A31</span><input class="input" name="name" required value="${r(t?.name||"Pilot 30")}" /></label>
            <label class="field"><span class="field-label">\u7B49\u7D1A</span><select class="select" name="tier">${Object.entries(Ti).map(([g,m])=>`<option value="${g}" ${t?.tier===g?"selected":""}>${m}</option>`).join("")}</select></label>
          </div>
          <label class="field"><span class="field-label">\u8AAA\u660E</span><input class="input" name="description" value="${r(t?.description||"30 \u984C pilot\uFF1B\u7528\u65BC RAG benchmark \u8207\u9577\u671F\u540C\u984C\u6BD4\u8F03\u3002")}" /></label>
          <div class="qb-check-list">
            ${e.ready.length?e.ready.map(g=>{let m=t?t.items?.some(w=>Number(w.id)===Number(g.id)):!0;return`<label class="qb-check-row"><input type="checkbox" name="item_ids" value="${g.id}" ${m?"checked":""}/><span><strong>#${g.id}</strong> ${r(g.question)} <small>${r(Ut[g.question_type]||g.question_type)}</small></span></label>`}).join(""):Gs("\u6C92\u6709\u5DF2\u9A57\u6536\u4E14 benchmark-ready \u7684\u984C\u76EE\uFF1B\u8ACB\u5148\u5B8C\u6210\u4EBA\u5DE5\u9A57\u6536\u3002")}
          </div>
          <div class="qb-actions">
            <button class="btn btn-primary" type="submit">${f("check",14)}<span>${t?"\u5132\u5B58 suite":"\u5EFA\u7ACB suite"}</span></button>
            ${t?'<button class="btn btn-secondary" type="button" data-qb-action="suite-new">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
          </div>
        </form>
        <div class="qb-list">
          ${s.length?s.map(g=>`<article class="qb-suite">
            <div class="qb-item-head">
              <div class="qb-item-title"><strong>${r(g.name)}</strong><span class="qb-meta">${r(Ti[g.tier]||g.tier)} \xB7 v${g.version} \xB7 ${d(g.item_count)} \u984C</span></div>
              <span class="badge ${g.status==="frozen"?"badge-ok":"badge-neutral"}">${g.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>
            </div>
            <div class="qb-suite-items">${(g.items||[]).slice(0,8).map(m=>`<span class="chip">#${m.id} ${r(m.question.slice(0,22))}${m.question.length>22?"\u2026":""}</span>`).join("")}${g.item_count>8?`<span class="qb-muted">+${g.item_count-8}</span>`:""}</div>
            <div class="qb-actions">
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-edit" data-id="${g.id}">${f("edit",13)}<span>\u7DE8\u8F2F suite</span></button>
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-freeze" data-id="${g.id}">${f("shield",13)}<span>\u51CD\u7D50</span></button>
              <button class="btn btn-ghost btn-sm" type="button" data-qb-action="suite-delete" data-id="${g.id}">${f("trash",13)}<span>\u522A\u9664</span></button>
            </div>
          </article>`).join(""):Gs("\u5C1A\u672A\u5EFA\u7ACB benchmark suite\u3002")}
        </div>
      </div>
    </details>
  </section>`}function zd(e){let t={};for(let s of["clarity","labels","answer","difficulty","overall"]){let a=e.querySelector(`[name="score_${s}"]`),n=Number(a?.value);Number.isFinite(n)&&(t[s]=Math.max(1,Math.min(5,Math.round(n))))}return t}function Hd(e){let t=new FormData(e);return{question:String(t.get("question")||"").trim(),question_type:String(t.get("question_type")||"general"),difficulty:String(t.get("difficulty")||"medium"),visibility:String(t.get("visibility")||"shared"),expected_laws:vd(t.get("expected_laws")),expected_articles:hd(t.get("expected_articles")),expected_judgments:$d(t.get("expected_judgments")),reference_answer:String(t.get("reference_answer")||"").trim(),tags:String(t.get("tags")||"").split(",").map(s=>s.trim()).filter(Boolean),notes:String(t.get("notes")||"").trim(),rubric:{must_refuse:!!e.elements.must_refuse?.checked}}}function Ii(e,{onNavigate:t=null,onStats:s=null}={}){let a={create:"question-create",manage:"question-manage",suite:"benchmark-bank",review:"question-review"},n={tab:"",editing:null,editingFrom:"",editingSuite:null,aiQuestion:"",aiLoading:!1,aiResult:null,items:[],total:0,offset:0,limit:50,filters:{query:"",status:"",question_type:"",difficulty:"",tags:[]},stats:{},suites:[],ready:[],selectedSuiteId:null,selectedBankItemId:null,bankTab:"split",suiteAnswers:{},suiteAnswersLoading:!1,suiteAnswersError:"",suiteManageOpen:!1,reviewItems:[],reviewDetail:null,reviewFilter:"queue"},i=R=>e.querySelector(`#quality-panel-${a[R]}`),o=(R,O)=>{R&&(R.childElementCount?R.setAttribute("aria-busy","true"):R.innerHTML=`<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>${O}</span></div></section>`)},l=R=>{R?.removeAttribute("aria-busy")},u=0,c=null,p=()=>"anonymous",$=()=>{s&&s(n.stats)},v=R=>{t&&t(R),Y(R)},g=async()=>{try{n.stats=await Q.questionBankStats()}catch{n.stats={}}$()},m=()=>{let R=i("create");R&&(R.innerHTML=Ad(n.editing,n))},w=(R,O)=>{let y=R?.querySelector("[data-qb-tag-results]");y&&(y.innerHTML=O.length?O.map(A=>`<button class="qb-tag-option" type="button" role="option" data-qb-action="select-tag" data-tag="${r(A.tag)}"><span>${r(A.tag)}</span><small>${d(A.count)}</small></button>`).join(""):'<div class="qb-tag-empty">\u6C92\u6709\u5176\u4ED6\u76F8\u7B26\u6A19\u7C64</div>')},S=async(R,O="")=>{if(!R)return;let y=R.querySelector("[data-qb-tag-results]"),A=++u;y&&(y.innerHTML='<div class="qb-tag-loading"><span class="spinner"></span><span>\u641C\u5C0B\u6A19\u7C64\u2026</span></div>');try{let G=await Q.questionBankTags(O,12);if(A!==u)return;let F=(G.tags||[]).filter(Ce=>!n.filters.tags.includes(Ce.tag));w(R,F)}catch(G){if(A!==u)return;y&&(y.innerHTML=`<div class="qb-tag-empty">${r(G.message||"\u6A19\u7C64\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},M=(R,{focus:O=!1}={})=>{if(!R)return;let y=R.querySelector("[data-qb-tag-popover]"),A=R.querySelector("[data-qb-tag-search]");!y||!A||(y.hidden&&(y.hidden=!1,A.value="",S(R,"")),O&&(A.focus(),A.select()))},j=R=>{c&&(window.clearTimeout(c),c=null);let O=R?.querySelector("[data-qb-tag-popover]");O&&(O.hidden=!0)},B=async R=>{let O=String(R||"").trim();O&&(n.filters.tags.includes(O)?n.filters.tags=n.filters.tags.filter(y=>y!==O):n.filters.tags=[...n.filters.tags,O],n.offset=0,await x())},U=()=>{let R=Array.isArray(n.suites)?n.suites:[];if(!R.length)return n.selectedSuiteId=null,n.selectedBankItemId=null,null;let O=R.find(A=>Number(A.id)===Number(n.selectedSuiteId));O||(O=R[0],n.selectedSuiteId=O.id,n.selectedBankItemId=null);let y=Array.isArray(O.items)?O.items:[];return y.some(A=>Number(A.id)===Number(n.selectedBankItemId))||(n.selectedBankItemId=y[0]?.id??null),O},W=()=>{let R=i("suite");R&&(R.innerHTML=Ni(n))},K=0,ye=async(R,{force:O=!1}={})=>{if(!R)return;let y=++K;if(!O&&n.suiteAnswers[String(R)]){n.suiteAnswersLoading=!1,n.suiteAnswersError="",W();return}n.suiteAnswersLoading=!0,n.suiteAnswersError="",W();try{let A=await Q.benchmarkSuiteLatestAnswers(R);if(y!==K)return;n.suiteAnswers[String(R)]=A.answers||{}}catch(A){if(y!==K)return;n.suiteAnswersError=A.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}finally{y===K&&(n.suiteAnswersLoading=!1,W())}},pe=async R=>{n.selectedSuiteId=R,n.selectedBankItemId=null,n.suiteAnswersError="";let O=U();if(!O){W();return}await ye(O.id)},z=R=>{n.bankTab=R==="full"?"full":"split",W()},E=()=>{let R=i("suite");if(!R)return;let O=U(),A=(Array.isArray(O?.items)?O.items:[]).find(F=>Number(F.id)===Number(n.selectedBankItemId))||null;for(let F of R.querySelectorAll(".qb-bank-row")){let Ce=Number(F.dataset.id)===Number(n.selectedBankItemId);F.classList.toggle("is-active",Ce);let Ne=F.querySelector("[data-qb-action='select-bank-item']");Ne&&Ne.setAttribute("aria-pressed",Ce?"true":"false")}let G=R.querySelector("[data-qb-bank-answer]");G&&(G.innerHTML=Ci(n,A))},x=async()=>{let R=i("manage");if(R){c&&(window.clearTimeout(c),c=null),o(R,"\u8B80\u53D6\u984C\u5EAB\u4E2D\u2026");try{let O=await Q.questionBankItems({...n.filters,...n.filters.status==="retired"?{include_deleted:!0}:{}},n.limit,n.offset);n.items=O.items||[],n.total=Number(O.total||0),n.stats=O.stats||n.stats,l(R),R.innerHTML=Ld(n),$()}catch(O){l(R),R.innerHTML=`<section class="report-card qb-card">${Ie({tone:"danger",title:"\u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:r(O.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},C=async({refreshAnswers:R=!1}={})=>{let O=i("suite");if(O){o(O,"\u8B80\u53D6 benchmark \u984C\u5EAB\u4E2D\u2026");try{let[y,A]=await Promise.all([Q.benchmarkSuites(),Q.benchmarkReadyQuestions(300)]);n.suites=y.suites||[],n.ready=A.items||[];let G=U();if(n.suiteAnswersError="",n.suiteAnswersLoading=!1,G&&(R||!n.suiteAnswers[String(G.id)]))try{let F=await Q.benchmarkSuiteLatestAnswers(G.id);n.suiteAnswers[String(G.id)]=F.answers||{}}catch(F){n.suiteAnswersError=F.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}l(O),O.innerHTML=Ni(n)}catch(y){l(O),O.innerHTML=`<section class="report-card qb-card">${Ie({tone:"danger",title:"Benchmark \u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:r(y.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},se=()=>{let R=i("review");R&&(R.innerHTML=Pd(n))},me=async R=>{let O=n.reviewItems.find(A=>Number(A.id)===Number(R));if(!O)return;n.reviewDetail=O,se();let y=i("review")?.querySelector(".qb-review-detail-pane");y&&window.matchMedia("(max-width: 1020px)").matches&&y.scrollIntoView({behavior:"smooth",block:"start"});try{let A=await Q.questionBankItem(O.id);Number(n.reviewDetail?.id)===Number(O.id)&&(n.reviewDetail=A,se())}catch(A){N(A.message||"\u984C\u76EE\u5167\u5BB9\u8B80\u53D6\u5931\u6557\u3002","danger")}},V=async()=>{let R=i("review");if(!R)return;o(R,"\u8B80\u53D6\u9A57\u6536\u984C\u76EE\u4E2D\u2026");let O=n.reviewFilter||"queue",y=O==="queue"?["pending_review","changes_requested"]:O==="accepted"?["accepted"]:O==="rejected"?["rejected"]:["draft"];try{let A=await Promise.all(y.map(Ne=>Q.questionBankItems({status:Ne},200,0)));n.reviewItems=A.flatMap(Ne=>Ne.items||[]),n.stats=A[0]?.stats||n.stats;let G=Number(n.reviewDetail?.id||0),Ce=n.reviewItems.some(Ne=>Number(Ne.id)===G)?G:Number(n.reviewItems[0]?.id||0);n.reviewDetail=Ce?await Q.questionBankItem(Ce):null,l(R),se(),$()}catch(A){l(R),R.innerHTML=`<section class="report-card qb-card">${Ie({tone:"danger",title:"\u9A57\u6536\u984C\u76EE\u8B80\u53D6\u5931\u6557",text:r(A.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}};function Y(R){let O=n.tab;n.tab=R;for(let y of Object.keys(a)){let A=i(y);A&&(A.hidden=y!==R)}R==="create"?(O!=="create"&&!n.editing&&(n.aiQuestion="",n.aiResult=null),m()):R==="manage"?x():R==="suite"?C():R==="review"&&V()}let ae=R=>{let y=[...n.items,...n.reviewItems,...n.reviewDetail?[n.reviewDetail]:[]].find(G=>Number(G.id)===Number(R));n.reviewDetail=y||{id:Number(R)};let A=y?.status;["accepted","rejected","draft"].includes(A)?n.reviewFilter=A:A&&(n.reviewFilter="queue"),v("review")},ee=async R=>{let O=Hd(R),y=Number(R.elements.item_id?.value||0);y||(O.status=R.elements.submit_for_review?.checked?"pending_review":"draft");try{y?(await Q.updateQuestionBankItem(y,{...O,change_note:"\u984C\u5EAB\u7BA1\u7406\u4FEE\u6539"}),N("\u5DF2\u5EFA\u7ACB\u65B0\u7248\u672C\uFF0C\u72C0\u614B\u56DE\u5230\u5F85\u5BE9\u3002","ok")):(await Q.createQuestionBankItem(O),N(O.status==="draft"?"\u984C\u76EE\u5DF2\u5B58\u70BA\u8349\u7A3F\uFF0C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002":"\u984C\u76EE\u5DF2\u5EFA\u7ACB\u4E26\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok")),n.editing=null;let A=["manage","suite","review"].includes(n.editingFrom)?n.editingFrom:"manage";n.editingFrom="",n.suiteAnswers={},await g(),v(A)}catch(A){let G=A.detail||A.payload?.detail,F=G?.errors?.join(" \xB7 ")||G?.message||A.message||"\u984C\u76EE\u5132\u5B58\u5931\u6557\u3002";N(F,"danger",8e3)}},ke=async R=>{let O=String(new FormData(R).get("question")||"").trim();if(O.length<4){N("\u984C\u76EE\u81F3\u5C11\u9700\u8981 4 \u500B\u5B57\u3002","danger");return}n.aiQuestion=O,n.aiLoading=!0,n.aiResult=null,m();try{let y=await Q.createQuestionBankItemWithAI({question:O});n.aiResult=y,n.aiQuestion="",await g(),N(`Ollama \u5DF2\u5EFA\u7ACB\u984C\u76EE #${y.item.id}\uFF0C\u72C0\u614B\u70BA\u5F85\u5BE9\uFF0C\u8ACB\u4EBA\u5DE5\u8986\u6838\u3002`,"ok",8e3)}catch(y){let A=y.detail||y.payload?.detail,G=A?.errors?.join(" \xB7 ")||A?.message||y.message||"Ollama \u7522\u751F\u5931\u6557\u3002";N(G,"danger",12e3)}finally{n.aiLoading=!1,m()}},H=async(R,O)=>{let y=Number(R.dataset.id||0);if(y)try{await Q.reviewQuestionBankItem(y,{decision:O,reviewer:p(),rubric_scores:zd(R),comment:String(R.querySelector('[name="comment"]')?.value||"")}),N(O==="approved"?"\u984C\u76EE\u5DF2\u6838\u51C6\u3002":O==="changes_requested"?"\u5DF2\u9000\u56DE\u4FEE\u6539\u3002":"\u984C\u76EE\u5DF2\u62D2\u7D55\u3002",O==="approved"?"ok":"info"),await g(),await V()}catch(A){let G=A.detail||A.payload?.detail,F=G?.errors?.join(" \xB7 ")||G?.message||A.message||"\u9A57\u6536\u5931\u6557\u3002";N(F,"danger",8e3)}},ve=async R=>{let O=new FormData(R),y=Number(O.get("suite_id")||0),A=Array.from(R.querySelectorAll('input[name="item_ids"]:checked')).map(F=>Number(F.value)),G={name:String(O.get("name")||"").trim(),tier:String(O.get("tier")||"core"),description:String(O.get("description")||"").trim(),item_ids:A};try{y?(await Q.updateBenchmarkSuite(y,G),N("Benchmark \u984C\u5EAB\u5DF2\u66F4\u65B0\u3002","ok")):(await Q.createBenchmarkSuite(G),N("Benchmark \u984C\u5EAB\u5DF2\u5EFA\u7ACB\u3002","ok")),n.editingSuite=null,n.suiteManageOpen=!0,n.suiteAnswers={},await C()}catch(F){let Ce=F.detail||F.payload?.detail,Ne=Ce?.errors?.join(" \xB7 ")||Ce?.message||F.message||"Suite \u5132\u5B58\u5931\u6557\u3002";N(Ne,"danger",8e3)}},je=async R=>{let O=e.querySelector("[data-qb-tag-filter] [data-qb-tag-popover]:not([hidden])")?.closest("[data-qb-tag-filter]");O&&!R.target.closest("[data-qb-tag-filter]")&&j(O);let y=R.target.closest("[data-qb-action]")?.dataset.qbAction;if(!y)return;let A=R.target.closest("[data-qb-action]"),G=Number(A.dataset.id||0);if(y==="open-tag-search"){let F=A.closest("[data-qb-tag-filter]");M(F,{focus:!0});return}if(y==="select-tag"){await B(A.dataset.tag);return}if(y==="remove-tag"){await B(A.dataset.tag);return}if(y==="bank-tab"){z(A.dataset.tab);return}if(y==="select-bank-item"){n.selectedBankItemId=G,E();return}if(y==="new"){n.editing=null,n.editingFrom="",n.aiQuestion="",n.aiResult=null,n.aiLoading=!1,v("create");return}if(y==="reset-create"){n.editing=null,m();return}if(y==="reset-ai"){n.aiQuestion="",n.aiResult=null,n.aiLoading=!1,m();return}if(y==="edit"){let F=n.suites.find(Pe=>Number(Pe.id)===Number(n.selectedSuiteId)),Ne=[...n.items,...n.reviewItems,...F?.items||[],...n.reviewDetail?[n.reviewDetail]:[]].find(Pe=>Number(Pe.id)===G);if(!Ne)return;n.editing=Ne,n.editingFrom=n.tab,v("create");return}if(y==="review"){ae(G);return}if(y==="review-ai-item"){let F=n.aiResult?.item;if(!F)return;n.reviewFilter="queue",n.reviewDetail=F,v("review");return}if(y==="review-filter"){let F=String(A.dataset.filter||"queue");n.reviewFilter=["queue","accepted","rejected","draft"].includes(F)?F:"queue",n.reviewDetail=null,await V();return}if(y==="select-review-item"){await me(G);return}if(y==="go-manage"){v("manage");return}if(y==="submit-review"){try{await Q.submitQuestionBankItemForReview(G),N("\u5DF2\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok"),await g(),n.tab==="manage"?await x():n.tab==="review"&&await V()}catch(F){let Ce=F.detail||F.payload?.detail,Ne=Ce?.errors?.join(" \xB7 ")||Ce?.message||F.message||"\u9001\u5BE9\u5931\u6557\u3002";N(Ne,"danger",8e3)}return}if(y==="restore"){if(!window.confirm(`\u78BA\u5B9A\u5FA9\u539F\u984C\u76EE #${G}\uFF1F\u5FA9\u539F\u5F8C\u6703\u56DE\u5230\u5F85\u5BE9\u72C0\u614B\uFF0C\u9700\u91CD\u65B0\u9A57\u6536\u3002`))return;try{await Q.restoreQuestionBankItem(G),N("\u984C\u76EE\u5DF2\u5FA9\u539F\u4E26\u56DE\u5230\u5F85\u5BE9\u3002","ok"),await g(),await x()}catch(F){let Ce=F.detail||F.payload?.detail,Ne=Ce?.errors?.join(" \xB7 ")||Ce?.message||F.message||"\u5FA9\u539F\u5931\u6557\u3002";N(Ne,"danger",8e3)}return}if(y==="delete"){if(n.tab==="suite"){let F=U();if(!F||!(F.items||[]).find(Ne=>Number(Ne.id)===G)||!window.confirm(`\u78BA\u5B9A\u5F9E\u300C${F.name}\u300D\u79FB\u9664\u984C\u76EE #${G}\uFF1F\u984C\u76EE\u4ECD\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u7BA1\u7406\u4E2D\u3002`))return;try{await Q.removeBenchmarkSuiteItem(F.id,G),N("\u5DF2\u5F9E Benchmark \u984C\u5EAB\u79FB\u9664\u3002","info"),delete n.suiteAnswers[String(F.id)],Number(n.selectedBankItemId)===G&&(n.selectedBankItemId=null),await C()}catch(Ne){N(Ne.message||"\u79FB\u9664\u5931\u6557\u3002","danger")}return}if(!window.confirm(`\u78BA\u5B9A\u522A\u9664\u984C\u76EE #${G}\uFF1F\u984C\u76EE\u6703\u6A19\u8A18\u70BA retired\uFF0C\u6B77\u53F2 benchmark \u4ECD\u6703\u4FDD\u7559\u3002`))return;try{await Q.deleteQuestionBankItem(G),N("\u984C\u76EE\u5DF2\u522A\u9664\u3002","info"),await g(),n.tab==="review"?(n.reviewDetail=null,await V()):await x()}catch(F){N(F.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(y==="revalidate"){try{let F=await Q.revalidateQuestionBank();N(`\u5DF2\u91CD\u65B0\u9A57\u8B49 ${d(F.checked||0)} \u984C\uFF0C${d(F.stale||0)} \u984C\u9700\u91CD\u65B0\u9A57\u6536\u3002`,"info",7e3),await g(),await x()}catch(F){N(F.message||"\u91CD\u65B0\u9A57\u8B49\u5931\u6557\u3002","danger")}return}if(y==="export"){try{let F=await Q.exportQuestionBank({status:""});Ft(`judgment-question-bank-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(F,null,2),"application/json;charset=utf-8")}catch(F){N(F.message||"\u532F\u51FA\u5931\u6557\u3002","danger")}return}if(y==="import-json"){let F=e.querySelector("#qb-import-json");try{let Ce=JSON.parse(String(F?.value||"").trim()),Ne=await Q.importQuestionBank(Ce);N(`\u532F\u5165\u5B8C\u6210\uFF1A\u65B0\u589E ${Ne.created}\u3001\u66F4\u65B0 ${Ne.updated}\u3001\u932F\u8AA4 ${(Ne.errors||[]).length}\u3002`,(Ne.errors||[]).length?"warn":"ok",8e3),F&&(F.value=""),await g(),await x()}catch(Ce){N(Ce.message||"JSON \u532F\u5165\u5931\u6557\u3002","danger",8e3)}return}if(y==="prev"||y==="next"){n.offset=Math.max(0,n.offset+(y==="next"?n.limit:-n.limit)),await x();return}if(y==="suite-edit"){let F=n.suites.find(Ce=>Number(Ce.id)===G);if(!F)return;n.editingSuite=F,n.suiteManageOpen=!0,C();return}if(y==="suite-new"){n.editingSuite=null,n.suiteManageOpen=!0,C();return}if(y==="suite-freeze"){try{await Q.updateBenchmarkSuite(G,{freeze:!0}),N("Benchmark \u984C\u5EAB\u5DF2\u51CD\u7D50\u4E26\u5EFA\u7ACB\u65B0\u7248\u672C\u3002","ok"),n.editingSuite=null,n.suiteManageOpen=!0,await C()}catch(F){N(F.message||"\u51CD\u7D50\u5931\u6557\u3002","danger")}return}if(y==="suite-delete"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 benchmark \u984C\u5EAB #${G}\uFF1F\u6B77\u53F2 run \u4ECD\u6703\u4FDD\u7559 snapshot\u3002`))return;try{await Q.deleteBenchmarkSuite(G),N("Benchmark \u984C\u5EAB\u5DF2\u522A\u9664\u3002","info"),n.editingSuite=null,n.suiteAnswers={},n.suiteManageOpen=!0,await C()}catch(F){N(F.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(y==="decide"){let F=A.closest("form[data-qb-form='review']");F&&await H(F,String(A.dataset.decision||""))}},xe=async R=>{let O=R.target.closest("[data-qb-form]");if(!O)return;R.preventDefault();let y=O.dataset.qbForm;if(y==="create")await ee(O);else if(y==="ai-create")await ke(O);else if(y==="filter"){let A=new FormData(O);n.filters={query:String(A.get("query")||"").trim(),status:String(A.get("status")||""),question_type:String(A.get("question_type")||""),difficulty:String(A.get("difficulty")||""),tags:A.getAll("tags").map(G=>String(G).trim()).filter(Boolean)},n.offset=0,await x()}else y==="suite"&&await ve(O)},at=async R=>{let O=R.target.closest?.("form[data-qb-form='filter'] select");if(O){O.form.requestSubmit();return}let y=R.target.closest?.("[data-qb-suite-select]");if(!y)return;let A=Number(y.value||0);!A||A===Number(n.selectedSuiteId)||await pe(A)},De=R=>{let O=R.target;O?.matches?.(".qb-suite-manage")&&(n.suiteManageOpen=!!O.open)},Fe=R=>{let O=R.target.closest?.("[data-qb-action='open-tag-search']");O&&M(O.closest("[data-qb-tag-filter]"))},Ae=R=>{let O=R.target.closest?.("[data-qb-tag-filter]");O&&(R.relatedTarget&&O.contains(R.relatedTarget)||j(O))},Ue=R=>{let O=R.target.closest?.("[data-qb-tag-search]");if(!O)return;let y=O.closest("[data-qb-tag-filter]");c&&window.clearTimeout(c),c=window.setTimeout(()=>{S(y,O.value)},160)},We=R=>{let O=R.target.closest?.("[data-qb-tag-search]");if(!O)return;let y=O.closest("[data-qb-tag-filter]");R.key==="Escape"?(R.preventDefault(),j(y),O.blur()):R.key==="Enter"?(R.preventDefault(),y?.querySelector("[data-qb-action='select-tag']")?.click()):R.key==="ArrowDown"&&(R.preventDefault(),y?.querySelector("[data-qb-action='select-tag']")?.focus())};e.addEventListener("click",je),e.addEventListener("submit",xe),e.addEventListener("change",at),e.addEventListener("toggle",De,!0),e.addEventListener("mouseover",Fe),e.addEventListener("mouseout",Ae),e.addEventListener("input",Ue),e.addEventListener("keydown",We);let lt=async()=>{await g(),n.tab==="create"?m():n.tab==="manage"?await x():n.tab==="suite"?await C({refreshAnswers:!0}):n.tab==="review"&&await V()};return g(),{show:Y,refresh:lt,destroy(){c&&window.clearTimeout(c),e.removeEventListener("click",je),e.removeEventListener("submit",xe),e.removeEventListener("change",at),e.removeEventListener("toggle",De,!0),e.removeEventListener("mouseover",Fe),e.removeEventListener("mouseout",Ae),e.removeEventListener("input",Ue),e.removeEventListener("keydown",We)},getStats:()=>n.stats}}function Ma(e){if(e==null||e==="")return"\u2014";let t=Number(e);return Number.isFinite(t)?`${t.toFixed(t>=10?1:2)}%`:"\u2014"}function Bi(e){return e==null?"\u2014":d(e)}function Ud(e){return e.count?e.severity==="danger"?Ve("failed","\u9700\u8655\u7406"):e.severity==="warn"?Ve("warning","\u6CE8\u610F"):Ve("preview","\u63D0\u793A"):Ve("success","\u901A\u904E")}function Qd(e){return e.count?e.severity==="danger"?"is-danger":e.severity==="warn"?"is-warn":"is-info":"is-ok"}function Gd(e){let t=Number(e.count)||0,s=Math.max(0,Math.min(100,Number(e.percent)||0));return`<div class="quality-check ${Qd(e)}">
    <div class="quality-check-head">
      <span class="quality-check-label">${r(e.label)}</span>
      ${Ud(e)}
    </div>
    <div class="quality-check-value">
      <strong>${d(t)}</strong>
      <span>\u7B46</span>
      <em>${r(Ma(e.percent))}</em>
    </div>
    <div class="quality-check-desc">${r(e.description)}</div>
    <div class="quality-check-track" aria-hidden="true">
      <span style="width:${s}%"></span>
    </div>
  </div>`}function Aa(e,t,s){let a=Array.isArray(s)?s:[];if(!a.length)return`<div class="index-chart-card">
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
  </div>`}function Jd(e){let t=e.coverage||{},s=e.totals||{},a=e.source||{},n=t.postgres_diff,i=n==null?"\u2014":n===0?"\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u4E00\u81F4":`\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u76F8\u5DEE ${d(Math.abs(n))} \u7B46`,o=t.vector_indexed===null||t.vector_indexed===void 0?t.detail||"\u7121\u6CD5\u53D6\u5F97\u7D22\u5F15\u7D71\u8A08":`${d(t.vector_indexed)} / ${d(t.vector_total)} \xB7 ${t.model||"\u2014"}`;return`<div class="metric-grid quality-coverage-grid">
    <div class="metric-card">
      <div class="metric-label">${f("filter",13)}<span>\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D</span></div>
      <div class="metric-value">${d(s.matched_rows)}</div>
      <div class="metric-foot">citation_count &gt; 0\uFF1B\u5171 ${d(s.citation_total)} \u7B46\u5F15\u7528</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${f("database",13)}<span>PostgreSQL \u6536\u9304</span></div>
      <div class="metric-value">${Bi(t.postgres_judgments)}</div>
      <div class="metric-foot">${r(i)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${f("brain",13)}<span>\u5411\u91CF\u7D22\u5F15</span></div>
      <div class="metric-value">${r(Ma(t.vector_coverage_pct))}</div>
      <div class="metric-foot">${r(o)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${f("layers",13)}<span>DuckDB \u5019\u9078</span></div>
      <div class="metric-value">${Bi(a.candidate_total)}</div>
      <div class="metric-foot">${d(a.candidate_archive_count)} / ${d(a.archive_count)} \u500B manifest \u6709 candidate_count</div>
    </div>
  </div>`}function Vd(e){return e.length?`<div class="table-wrap">
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
              <td class="cell-number">${r(Ma(t.match_rate))}</td>
              <td class="cell-number">${d(t.short_text_rows)}</td>
              <td class="cell-number">${d(s)}</td>
              <td class="cell-number">${d(t.duplicate_content_rows)}</td>
              <td class="cell-date">${r(Dt(t.date_min))} \u2013 ${r(Dt(t.date_max))}</td>
            </tr>`}).join("")}
      </tbody>
    </table>
  </div>`:pt({iconName:"table",title:"\u6C92\u6709\u539F\u59CB Parquet \u6A94\u6848",text:"\u5B8C\u6210\u5224\u6C7A RAR \u532F\u5165\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6BCF\u500B\u58D3\u7E2E\u6A94\u7684 DuckDB \u7D71\u8A08\u3002"})}function Wd(e){let t=e.totals||{},s=e.source||{},a=Array.isArray(e.checks)?e.checks:[],n=e.summary||{},i=e.distributions||{},o=Array.isArray(e.warnings)?e.warnings:[],l=Re(s.compressed_bytes||0);return`<div class="report-card quality-report" data-database="quality">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">DUCKDB DATA QUALITY</div>
        <div class="report-title">
          \u539F\u59CB Parquet \u8CC7\u6599\u54C1\u8CEA ${Ve(e.status||"operational")}
          <span class="chip">raw.parquet</span>
        </div>
        <div class="report-sub">
          ${d(t.rows)} \u7B46 \xB7 ${d(s.raw_files)} \u500B\u6A94\u6848 \xB7
          ${l} \xB7 \u6383\u63CF ${ge(e.scan_ms||0)} \xB7
          ${r(qe(e.generated_at))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-quality">
          ${f("download",14)}<span>JSON</span>
        </button>
      </div>
    </div>
    ${o.length?`<div class="report-alert">${Ie({tone:"warn",title:"\u76EE\u524D\u9650\u5236\u8207\u5DEE\u7570",text:o.map(u=>r(u)).join("<br>")})}</div>`:""}
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
        <div class="summary-value">${r(Ma(t.match_rate))}</div>
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
      <div class="quality-checks">${a.map(Gd).join("")}</div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6536\u9304\u8986\u84CB</span>
        <span class="muted" style="font-size:9.5px">PostgreSQL \u8207\u5411\u91CF\u7D22\u5F15\u70BA\u5373\u6642\u67E5\u8A62\uFF0C\u4E0D\u662F\u5F9E Parquet \u63A8\u4F30</span>
      </div>
      ${Jd(e)}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6A94\u6848\u660E\u7D30</span>
        <span class="muted" style="font-size:9.5px">${d(s.archive_count)} \u500B\u539F\u59CB Parquet</span>
      </div>
      ${Vd(Array.isArray(e.archives)?e.archives:[])}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u5206\u5E03\u7D71\u8A08</span>
        <span class="muted" style="font-size:9.5px">DuckDB group by / unnest</span>
      </div>
      <div class="quality-dist-grid">
        ${Aa("\u6CD5\u9662","\u5224\u6C7A\u7B46\u6578",i.courts)}
        ${Aa("\u88C1\u5224\u5E74\u4EFD","\u5224\u6C7A\u7B46\u6578",i.years)}
        ${Aa("\u71B1\u9580\u6CD5\u898F","\u63D0\u53CA\u5224\u6C7A\u6578",i.laws)}
        ${Aa("\u71B1\u9580\u6848\u7531","\u5224\u6C7A\u7B46\u6578",i.titles)}
      </div>
    </div>
  </div>`}async function Kd(e){e.innerHTML=`<section class="page data-page quality-page">
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
          ${f("refresh",15)}<span>\u91CD\u65B0\u6383\u63CF</span>
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
            <span class="status-tab-icon">${f("activity",15)}</span>
            <span class="status-tab-copy"><strong>\u54C1\u8CEA\u7E3D\u89BD</strong><small>DuckDB \u539F\u59CB\u8CC7\u6599\u8207\u8986\u84CB\u6AA2\u67E5</small></span>
            <span class="badge badge-neutral" id="quality-badge-overview">\u2014</span>
          </button>
          <button class="status-tab" type="button" data-quality-tab="create">
            <span class="status-tab-icon">${f("plus",15)}</span>
            <span class="status-tab-copy"><strong>\u984C\u5EAB\u65B0\u589E</strong><small>Ollama \u81EA\u52D5\u51FA\u984C\u8207 JSON \u532F\u5165</small></span>
          </button>
          <button class="status-tab" type="button" data-quality-tab="manage">
            <span class="status-tab-icon">${f("database",15)}</span>
            <span class="status-tab-copy"><strong>\u984C\u5EAB\u7BA1\u7406</strong><small>\u7248\u672C\u3001\u72C0\u614B\u3001\u6A19\u7C64\u8207\u522A\u9664</small></span>
            <span class="badge badge-neutral" id="quality-badge-manage">\u2014</span>
          </button>
          <button class="status-tab" type="button" data-quality-tab="suite">
            <span class="status-tab-icon">${f("cube",15)}</span>
            <span class="status-tab-copy"><strong>Benchmark \u984C\u5EAB</strong><small>\u51CD\u7D50 suite \u8207 benchmark-ready \u984C\u76EE</small></span>
            <span class="badge badge-neutral" id="quality-badge-suite">\u2014</span>
          </button>
          <button class="status-tab" type="button" data-quality-tab="review">
            <span class="status-tab-icon">${f("shield",15)}</span>
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
  </section>`;let t=e.querySelector("#quality-content"),s=e.querySelector("#quality-refresh"),a=e.querySelector("#quality-meta"),n=[...e.querySelectorAll("[data-quality-tab]")],i={overview:e.querySelector("#quality-panel-overview"),create:e.querySelector("#quality-panel-question-create"),manage:e.querySelector("#quality-panel-question-manage"),suite:e.querySelector("#quality-panel-benchmark-bank"),review:e.querySelector("#quality-panel-question-review")},o=null,l="overview",u=()=>{if(!o)return;t.innerHTML=Wd(o),a.textContent=`DUCKDB \xB7 ${d(o.totals?.rows)} \u7B46 \xB7 ${ge(o.scan_ms||0)}`;let m=e.querySelector("#quality-badge-overview");m&&(m.textContent=d(o.totals?.rows||0))},c=m=>{l=m==="overview"?"overview":m;for(let w of n){let S=w.dataset.qualityTab===l;w.classList.toggle("is-active",S),S?w.setAttribute("aria-current","page"):w.removeAttribute("aria-current")}for(let[w,S]of Object.entries(i))S&&(S.hidden=w!==l);l!=="overview"?a.textContent="QUESTION BANK \xB7 \u984C\u5EAB\u5DE5\u4F5C\u5340":o&&u()},p=Ii(e,{onNavigate:m=>c(m),onStats:m=>{let w=m||{},S=e.querySelector("#quality-badge-manage"),M=e.querySelector("#quality-badge-suite"),j=e.querySelector("#quality-badge-review");S&&(S.textContent=d(w.total||0)),M&&(M.textContent=d(w.benchmark_ready||0)),j&&(j.textContent=d((w.pending_review||0)+(w.changes_requested||0)))}}),$=m=>{c(m),m!=="overview"&&p.show(m)},v=async()=>{Me(s,!0,"\u6383\u63CF\u4E2D\u2026");try{o=await Q.quality(),u()}catch(m){t.innerHTML=`<div class="report-card">
        <div class="report-head">
          <div class="report-title-group">
            <div class="report-kicker">DUCKDB DATA QUALITY</div>
            <div class="report-title">\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557</div>
            <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
          </div>
        </div>
        <div class="report-section">
          ${Ie({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u54C1\u8CEA\u7D71\u8A08",text:r(m.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
        </div>
      </div>`,a.textContent="DUCKDB \xB7 \u8B80\u53D6\u5931\u6557",N("\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}finally{Me(s,!1)}},g=async()=>{l==="overview"?await v():await p.refresh()};s.addEventListener("click",g),e.addEventListener("click",m=>{let w=m.target.closest("[data-quality-tab]");w&&$(w.dataset.qualityTab||"overview")}),t.addEventListener("click",m=>{!m.target.closest("[data-action='export-quality']")||!o||Ft(`judgment-quality-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(o,null,2),"application/json;charset=utf-8")}),c("overview"),await v()}var Dn={};Wt(Dn,{render:()=>Mu});var La={};Wt(La,{render:()=>Bn});var Di={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"};function Oi(e,t){let s=Array.isArray(t)?t:[];return`<div class="tests-model-group">
    <span class="tests-model-label">${r(e)}</span>
    <div class="tests-model-chips">${s.length?s.map(a=>`<span class="chip chip-mono">${r(a)}</span>`).join(""):'<span class="tests-model-empty">\u672A\u5075\u6E2C\u5230\u6A21\u578B</span>'}</div>
  </div>`}function Yd(e){let t=e?.supports_chat,s=t===!0?"badge-ok":t===!1?"badge-danger":"badge-neutral",a=t===!0?"\u652F\u63F4 chat":t===!1?"\u4E0D\u652F\u63F4 chat":"\u672A\u6E2C\u8A66",n=(Array.isArray(e?.capabilities)?e.capabilities:[]).map(i=>`<span class="chip chip-mono">${r(i)}</span>`).join("");return`<div class="tests-llm-row">
    <div class="tests-llm-model">
      <strong class="mono">${r(e?.model||"\u2014")}</strong>
      <small>${r(e?.detail||"")}</small>
    </div>
    <div class="tests-llm-meta">
      <span class="badge ${s}">${a}</span>
      ${e?.tested_now?'<span class="badge badge-info">\u672C\u6B21\u65B0\u6E2C</span>':""}
      ${n}
      <span class="tests-llm-time">${e?.tested_at?`\u6E2C\u8A66\u65BC ${r(qe(e.tested_at))}`:"\u5C1A\u7121\u6E2C\u8A66\u7D00\u9304"}</span>
    </div>
  </div>`}function Xd(e){let t=Array.isArray(e?.models)?e.models:[],s=e?.counts||{},a=Array.isArray(e?.failures)?e.failures:[];return{summary:e?`<span>Ollama <strong>${s.available??t.length}</strong> \u500B\u6A21\u578B</span>
      <span>\u652F\u63F4 chat <strong>${s.chat??0}</strong></span>
      <span>\u4E0D\u652F\u63F4 <strong>${s.unsupported??0}</strong></span>
      <span>\u672A\u6E2C\u8A66 <strong>${s.untested??0}</strong></span>
      <span>\u672C\u6B21\u65B0\u6E2C <strong>${(e.tested_now||[]).length}</strong></span>
      <span class="muted">${r(e.detail||"")}</span>`:"<span>\u6B63\u5728\u8B80\u53D6 Ollama \u6A21\u578B\u6E05\u55AE\u2026</span>",list:t.length?t.map(Yd).join(""):'<div class="tests-llm-empty">\u5C1A\u7121\u6A21\u578B\u8CC7\u6599\uFF1B\u8ACB\u78BA\u8A8D Ollama \u5DF2\u555F\u52D5\u4E26\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66\u3002</div>',failures:a.length?`<div class="tests-llm-failures">${a.map(i=>`<span><strong class="mono">${r(i.model||"\u2014")}</strong> ${r(i.detail||"\u6E2C\u8A66\u5931\u6557")}</span>`).join("")}</div>`:""}}function Zd(e){let t=String(e?.status||"degraded"),s=t==="operational"?"badge-ok":t==="disabled"?"badge-neutral":"badge-danger",a=Array.isArray(e?.scores)?e.scores.slice(0,4):[],n=Array.isArray(e?.results)?e.results[0]:null;return`<div class="tests-llm-row">
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
  </div>`}function eu(e){if(!e)return{summary:"<span>\u6B63\u5728\u8B80\u53D6 reranker \u72C0\u614B\u2026</span>",list:"",failures:""};let t=Array.isArray(e.providers)?e.providers:[],s=e.active||{},a=String(e.status||"degraded"),n=a==="operational"?"badge-ok":a==="not_configured"?"badge-neutral":"badge-danger",i=t.flatMap(o=>(o.errors||[]).map(l=>({model:o.url,detail:l})));return{summary:`<span>\u72C0\u614B <span class="badge ${n}">${r(a)}</span></span>
      <span>\u6A21\u578B <strong>${r(e.model||"\u2014")}</strong></span>
      <span>\u555F\u7528 <strong>${e.enabled?"true":"false"}</strong></span>
      ${s.url?`<span>\u4F5C\u7528\u4E2D <strong class="mono">${r(s.url)}</strong></span>`:""}
      <span class="muted">${r(e.detail||"")}</span>`,list:t.length?t.map(Zd).join(""):'<div class="tests-llm-empty">\u6C92\u6709\u8A2D\u5B9A RERANK_URL\uFF1B\u8ACB\u8A2D\u5B9A primary \u6216 fallback reranker\u3002</div>',failures:i.length?`<div class="tests-llm-failures">${i.map(o=>`<span><strong class="mono">${r(o.model||"\u2014")}</strong> ${r(o.detail||"\u6E2C\u8A66\u5931\u6557")}</span>`).join("")}</div>`:""}}function tu(e,t,s){return JSON.stringify({selected:s,runs:(t||[]).map(a=>`${a.run_id}:${a.status}`),run:e?{run_id:e.run_id,status:e.status,progress:e.progress,total_ms:e.total_ms,steps:(e.steps||[]).map(a=>`${a.stage}:${a.model}:${a.status}:${a.progress}:${a.duration_ms}`)}:null})}async function Bn(e,t,{embedded:s=!1}={}){let a=!1,n=!1,i={embedding:[],llm:[]},o=!1,l=null,u=!1,c=null,p=!1,$=null,v=[],g="",m=null,w="",S=`<div class="page-actions">
      <span class="badge badge-neutral badge-mono" id="tests-mode-badge">\u8B80\u53D6\u4E2D</span>
      <button class="btn btn-secondary" type="button" id="tests-refresh">
        ${f("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
      </button>
    </div>`,M=s?`<div class="tests-embed-head">
        <div>
          <div class="eyebrow">SYSTEM TEST</div>
          <div class="tests-embed-title">\u7CFB\u7D71\u6E2C\u8A66</div>
          <div class="tests-embed-copy">\u5F8C\u7AEF API \u9023\u7DDA\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u591A\u6A21\u578B\u6E2C\u8A66 Flow\u3002\u6E2C\u8A66\u6A21\u5F0F\u958B\u555F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207\u5177\u5099 chat \u80FD\u529B\u7684 LLM \u6A21\u578B\u3002</div>
        </div>
        ${S}
      </div>`:`<div class="page-header">
      <div>
        <div class="eyebrow">SYSTEM TEST</div>
        <h1 class="page-title">\u7CFB\u7D71\u6E2C\u8A66</h1>
        <p class="page-subtitle">\u5408\u4F75\u5F8C\u7AEF API \u9023\u7DDA\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u591A\u6A21\u578B\u6E2C\u8A66 Flow\u3002
          \u6E2C\u8A66\u6A21\u5F0F\u958B\u555F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207\u5177\u5099 chat \u80FD\u529B\u7684 LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002</p>
      </div>
      ${S}
    </div>`;e.innerHTML=`<section class="${s?"tests-page tests-page-embedded":"page tests-page"}">
    ${M}

    <div class="tests-grid">
      <section class="card tests-card tests-api-card" aria-labelledby="tests-api-title">
        <form class="api-dialog-form tests-api-form" id="tests-api-form" novalidate>
          <div class="api-dialog-head">
            <span class="api-dialog-icon" aria-hidden="true">${f("link",17)}</span>
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
              ${f("activity",14)}<span>\u6E2C\u8A66\u9023\u7DDA</span>
            </button>
            <span class="grow"></span>
            <button class="btn btn-ghost btn-sm" type="button" id="tests-api-reset">\u6062\u5FA9\u9810\u8A2D</button>
            <button class="btn btn-primary btn-sm" type="submit" id="tests-api-save">
              ${f("check",14)}<span>\u5132\u5B58\u4E26\u91CD\u65B0\u8F09\u5165</span>
            </button>
          </div>
        </form>
      </section>

      <section class="card tests-card" aria-labelledby="tests-mode-title">
        <div class="tests-card-head">
          <span class="tests-card-icon">${f("terminal",16)}</span>
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
            ${f("sparkles",13)}<span>\u524D\u5F80 RAG \u63D0\u554F</span>
          </a>
          <a class="btn btn-secondary btn-sm" href="#/performance">
            ${f("activity",13)}<span>\u6548\u80FD Flow</span>
          </a>
        </div>
        <div class="tests-status" id="tests-mode-status" role="status"></div>
      </section>
    </div>

    <section class="card tests-card tests-llm-card" aria-labelledby="tests-llm-title">
      <div class="tests-card-head">
        <span class="tests-card-icon">${f("brain",16)}</span>
        <div>
          <div class="tests-card-title" id="tests-llm-title">LLM \u670D\u52D9\u6E2C\u8A66</div>
          <div class="tests-card-copy">\u6AA2\u67E5 Ollama \u4E0A\u6BCF\u500B\u6A21\u578B\u662F\u5426\u652F\u63F4 chat\uFF0C\u4E26\u628A\u7D50\u679C\u5BEB\u5165\u80FD\u529B\u6E05\u55AE\uFF1B\u5DF2\u6709\u6E2C\u8A66\u7D00\u9304\u7684\u6A21\u578B\u4E0D\u6703\u91CD\u6E2C\u3002LLM \u6548\u80FD\u8A55\u4F30\u53EA\u6703\u7D0D\u5165\u652F\u63F4 chat \u7684\u6A21\u578B\u3002</div>
        </div>
      </div>
      <div class="tests-llm-head">
        <div class="tests-llm-summary" id="tests-llm-summary">\u6B63\u5728\u8B80\u53D6 Ollama \u6A21\u578B\u6E05\u55AE\u2026</div>
        <button class="btn btn-primary btn-sm" type="button" id="tests-llm-test">
          ${f("activity",14)}<span>\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66</span>
        </button>
      </div>
      <div class="tests-llm-list" id="tests-llm-list"></div>
      <div id="tests-llm-failures"></div>
      <div class="tests-status" id="tests-llm-status" role="status"></div>
    </section>

    <section class="card tests-card tests-llm-card" aria-labelledby="tests-rerank-title">
      <div class="tests-card-head">
        <span class="tests-card-icon">${f("filter",16)}</span>
        <div>
          <div class="tests-card-title" id="tests-rerank-title">Reranker \u670D\u52D9\u6E2C\u8A66</div>
          <div class="tests-card-copy">\u6AA2\u67E5 RAG_RERANK_ENABLED\u3001primary\uFF0Ffallback reranker \u5065\u5EB7\u72C0\u614B\uFF0C\u4E26\u4EE5\u5BE6\u969B rerank \u8ACB\u6C42\u9A57\u8B49\u6A21\u578B\u8207\u5206\u6578\u3002\u6E2C\u8A66\u4E0D\u6703\u4FEE\u6539\u7D22\u5F15\u6216\u9078\u53D6\u7D50\u679C\u3002</div>
        </div>
      </div>
      <div class="tests-llm-head">
        <div class="tests-llm-summary" id="tests-rerank-summary">\u6B63\u5728\u8B80\u53D6 reranker \u72C0\u614B\u2026</div>
        <button class="btn btn-primary btn-sm" type="button" id="tests-rerank-test">
          ${f("activity",14)}<span>\u57F7\u884C Reranker \u670D\u52D9\u6E2C\u8A66</span>
        </button>
      </div>
      <div class="tests-llm-list" id="tests-rerank-list"></div>
      <div id="tests-rerank-failures"></div>
      <div class="tests-status" id="tests-rerank-status" role="status"></div>
    </section>

    <div id="tests-flow"></div>
  </section>`;let j=e.querySelector("#tests-mode-badge"),B=e.querySelector("#tests-mode-toggle"),U=e.querySelector("#tests-mode-summary"),W=e.querySelector("#tests-mode-models"),K=e.querySelector("#tests-mode-status"),ye=e.querySelector("#tests-api-form"),pe=e.querySelector("#tests-api-input"),z=e.querySelector("#tests-api-preview"),E=e.querySelector("#tests-api-status"),x=e.querySelector("#tests-api-note"),C=e.querySelector("#tests-api-test"),se=e.querySelector("#tests-api-reset"),me=e.querySelector("#tests-api-save"),V=e.querySelector("#tests-refresh"),Y=e.querySelector("#tests-flow"),ae=e.querySelector("#tests-llm-summary"),ee=e.querySelector("#tests-llm-list"),ke=e.querySelector("#tests-llm-failures"),H=e.querySelector("#tests-llm-status"),ve=e.querySelector("#tests-llm-test"),je=e.querySelector("#tests-rerank-summary"),xe=e.querySelector("#tests-rerank-list"),at=e.querySelector("#tests-rerank-failures"),De=e.querySelector("#tests-rerank-status"),Fe=e.querySelector("#tests-rerank-test"),Ae=(te,$e,Qe="")=>{te&&(te.textContent=$e,te.className=`tests-status${Qe?` is-${Qe}`:""}`)},Ue=(te,$e="")=>{E&&(E.textContent=te,E.className=`api-dialog-status${$e?` is-${$e}`:""}`)},We=()=>Xt()==="query",lt=()=>{let te=Kt(pe.value);return te||(window.location.protocol==="file:"?Ia:"")},R=()=>{let te=lt(),$e=Yt(),Qe=Di[Xt()]||Xt()||"\u540C\u6E90";z.innerHTML=`\u76EE\u524D\u751F\u6548\uFF1A<strong>${r(os($e))}</strong>${$e?`\uFF08${r(Qe)}\uFF09`:""}<br />\u6B64\u4F4D\u5740\u7684\u5065\u5EB7\u6AA2\u67E5\uFF1A${r(_t("/api/health",te))}`},O=()=>{let te=Xt(),$e=`\u76EE\u524D\u4F86\u6E90\uFF1A${Di[te]||te||"\u540C\u6E90"}\u3002\u512A\u5148\u9806\u5E8F\u70BA ?api= \u2192 \u700F\u89BD\u5668\u5132\u5B58\u503C \u2192 config.js \u2192 \u540C\u6E90\u3002`,Qe="";te==="query"?(Qe="is-warn",$e="\u6B64\u9801\u7531\u7DB2\u5740\u7684 ?api= \u53C3\u6578\u6307\u5B9A\u5F8C\u7AEF\u4F4D\u5740\uFF0C\u5177\u6709\u6700\u9AD8\u512A\u5148\u9806\u5E8F\u3002\u5132\u5B58\u6216\u6062\u5FA9\u9810\u8A2D\u5728\u6B64\u9801\u4E0D\u6703\u751F\u6548\uFF1B\u8ACB\u5148\u79FB\u9664\u7DB2\u5740\u4E2D\u7684 api \u53C3\u6578\u3002"):Ks()?(Qe="is-warn",$e="\u6B64\u9801\u4E0D\u662F\u5F9E localhost \u958B\u555F\uFF0C\u4E14\u5C1A\u672A\u8A2D\u5B9A\u5F8C\u7AEF API\u3002\u8ACB\u586B\u5165 cloudflared \u7684 https:// \u4F4D\u5740\uFF0C\u6216\u90E8\u7F72\u6642\u5728 config.js \u6307\u5B9A apiBase\uFF1BHTTP \u4F4D\u5740\u6703\u88AB HTTPS \u9801\u9762\u963B\u64CB\u3002"):(te==="file-default"||window.location.protocol==="file:")&&($e="\u4EE5 file:// \u76F4\u63A5\u958B\u555F\u6642\uFF0C\u9810\u8A2D\u9023\u5230 http://127.0.0.1:9200\u3002\u82E5\u5F8C\u7AEF\u4F7F\u7528\u5176\u4ED6\u9023\u63A5\u57E0\uFF0C\u8ACB\u5728\u6B64\u4FEE\u6539\u4E26\u5132\u5B58\u3002"),x.textContent=$e,x.className=`api-dialog-note${Qe?` ${Qe}`:""}`;let Ye=te==="query";me.disabled=Ye,se.disabled=Ye,pe.readOnly=Ye},y=()=>{if(!Ba(pe.value))return Ue("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002","error"),pe.focus(),null;let te=lt();return window.location.protocol==="https:"&&/^http:\/\//i.test(te)&&!/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(te)?(Ue("HTTPS \u9801\u9762\u7121\u6CD5\u9023\u7DDA\u5230 HTTP API\uFF08mixed content\uFF09\u3002\u8ACB\u6539\u7528 cloudflared \u63D0\u4F9B\u7684 https:// \u4F4D\u5740\u3002","error"),pe.focus(),null):te},A=()=>{pe.value=Yt(),R(),O(),Ue("\u53EF\u5148\u6E2C\u8A66\u9023\u7DDA\uFF0C\u5132\u5B58\u5F8C\u9801\u9762\u6703\u91CD\u65B0\u8F09\u5165\u3002")},G=()=>{let te=Array.isArray(i.embedding)?i.embedding.length:0,$e=Array.isArray(i.llm)?i.llm.length:0;if(j&&(j.textContent=o?"\u5207\u63DB\u4E2D\u2026":n?"\u6E2C\u8A66\u6A21\u5F0F ON":"\u6E2C\u8A66\u6A21\u5F0F OFF",j.className=`badge badge-mono ${o?"badge-info":n?"badge-warn":"badge-neutral"}`),B){B.disabled=o,B.classList.toggle("is-on",n),B.classList.toggle("is-off",!n&&!o),B.classList.toggle("is-busy",o),B.setAttribute("aria-checked",n?"true":"false"),B.setAttribute("aria-busy",o?"true":"false"),B.setAttribute("aria-label",o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F":n?"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF0C\u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\uFF0C\u9EDE\u64CA\u958B\u555F"),B.title=o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F\u2026":n?"\u6E2C\u8A66\u6A21\u5F0F ON \xB7 \u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F OFF \xB7 \u9EDE\u64CA\u958B\u555F";let Qe=B.querySelector(".header-power-label");Qe&&(Qe.textContent=o?"\u2026":n?"ON":"OFF")}U&&(U.textContent=n?`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${te} \u500B embedding \u8207 ${$e} \u500B LLM \u6A21\u578B\u3002`:"\u76EE\u524D\u4F7F\u7528\u5FEB\u901F\u6A21\u5F0F\uFF1A\u55AE\u4E00 embedding \u8207 LLM\u3002"),W&&(W.innerHTML=Oi("Embedding",i.embedding)+Oi("LLM",i.llm))},F=async()=>{try{let te=await Q.testMode();if(a)return;n=!!te.enabled,i=te.models||{embedding:[],llm:[]},Ae(K,"")}catch(te){if(a)return;n=!1,i={embedding:[],llm:[]},Ae(K,te.message||"\u7121\u6CD5\u8B80\u53D6\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF API\u3002","error")}a||G()},Ce=async()=>{if(o)return;let te=!n;o=!0,G(),Ae(K,te?"\u6B63\u5728\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u2026":"\u6B63\u5728\u95DC\u9589\u6E2C\u8A66\u6A21\u5F0F\u2026");try{let $e=await Q.setTestMode(te);if(a)return;n=!!$e.enabled,i=$e.models||{embedding:[],llm:[]},window.dispatchEvent(new CustomEvent("judgment:test-mode",{detail:{enabled:n,models:i}}));let Qe=i.embedding?.length||0,Ye=i.llm?.length||0;Ae(K,n?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A\u4E0B\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C ${Qe} \u500B embedding \u8207 ${Ye} \u500B LLM \u6A21\u578B\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","ok"),N(n?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A${Qe} \u500B embedding\u3001${Ye} \u500B LLM\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002",n?"ok":"info",6e3),await Ke()}catch($e){a||(Ae(K,$e.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","error"),N($e.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","danger",6e3))}finally{o=!1,a||G()}},Ne=()=>{let te=Xd(l);if(ae&&(ae.innerHTML=te.summary),ee&&(ee.innerHTML=te.list),ke&&(ke.innerHTML=te.failures),ve){ve.disabled=u,ve.setAttribute("aria-busy",u?"true":"false");let $e=ve.querySelector("span");$e&&($e.textContent=u?"\u6E2C\u8A66\u4E2D\u2026":"\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66")}},Pe=async()=>{try{let te=await Q.llmModels();if(a)return;l=te,Ae(H,"")}catch(te){if(a)return;l=null,Ae(H,te.message||"\u7121\u6CD5\u8B80\u53D6 Ollama \u6A21\u578B\u6E05\u55AE\u3002","error")}a||Ne()},nt=async()=>{if(!u){u=!0,Ne(),Ae(H,"\u6B63\u5728\u6AA2\u67E5 Ollama \u6A21\u578B\u8207 chat \u80FD\u529B\u2026");try{let te=await Q.testLlmModels();if(a)return;l=te;let $e=te.tested_now?.length||0,Qe=te.chat_models?.length||0,Ye=te.failures?.length||0;Ae(H,`${$e?`\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u672C\u6B21\u65B0\u6E2C ${$e} \u500B\u6A21\u578B`:"\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u6C92\u6709\u65B0\u6A21\u578B"}\uFF0C\u76EE\u524D ${Qe} \u500B\u6A21\u578B\u652F\u63F4 chat${Ye?`\uFF1B${Ye} \u500B\u6A21\u578B\u66AB\u6642\u7121\u6CD5\u5224\u5B9A\uFF0C\u4E0B\u6B21\u6703\u91CD\u8A66`:""}\u3002`,Ye?"warn":"ok"),N($e?`LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u65B0\u589E ${$e} \u7B46\u80FD\u529B\u7D00\u9304\u3002`:"LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u6C92\u6709\u65B0\u6A21\u578B\u9700\u8981\u6E2C\u8A66\u3002",Ye?"warn":"ok",5e3),await F()}catch(te){a||(Ae(H,te.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","error"),N(te.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","danger",6e3))}finally{u=!1,a||Ne()}}},it=()=>{let te=eu(c);if(je&&(je.innerHTML=te.summary),xe&&(xe.innerHTML=te.list),at&&(at.innerHTML=te.failures),Fe){Fe.disabled=p,Fe.setAttribute("aria-busy",p?"true":"false");let $e=Fe.querySelector("span");$e&&($e.textContent=p?"\u6E2C\u8A66\u4E2D\u2026":"\u57F7\u884C Reranker \u670D\u52D9\u6E2C\u8A66")}},rt=async()=>{try{let te=await Q.rerankStatus();if(a)return;c=te,Ae(De,"")}catch(te){if(a)return;c=null,Ae(De,te.message||"\u7121\u6CD5\u8B80\u53D6 reranker \u72C0\u614B\u3002","error")}a||it()},Ge=async()=>{if(!p){p=!0,it(),Ae(De,"\u6B63\u5728\u5C0D primary\uFF0Ffallback reranker \u57F7\u884C\u5BE6\u969B rerank \u6E2C\u8A66\u2026");try{let te=await Q.testReranker();if(a)return;c=te;let $e=Array.isArray(te.providers)?te.providers:[],Qe=$e.filter(Ct=>Ct.status==="operational").length,Ye=$e.reduce((Ct,Lt)=>Ct+(Array.isArray(Lt.errors)?Lt.errors.length:0),0);Ae(De,Ye?`Reranker \u6E2C\u8A66\u5B8C\u6210\uFF1A${Qe} \u500B\u7AEF\u9EDE\u53EF\u7528\uFF0C${Ye} \u500B\u932F\u8AA4\uFF1B\u8A73\u7D30\u5206\u6578\u5DF2\u5217\u5728\u4E0A\u65B9\u3002`:`Reranker \u6E2C\u8A66\u5B8C\u6210\uFF1A${Qe} \u500B\u7AEF\u9EDE\u53EF\u7528\uFF0C\u6A21\u578B ${te.model||"\u2014"}\u3002`,Ye?"warn":"ok"),N(Ye?"Reranker \u90E8\u5206\u7AEF\u9EDE\u5931\u6557\uFF0C\u8ACB\u67E5\u770B\u6E2C\u8A66\u7D50\u679C\u3002":"Reranker \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\u3002",Ye?"warn":"ok",5e3)}catch(te){a||(Ae(De,te.message||"Reranker \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","error"),N(te.message||"Reranker \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","danger",6e3))}finally{p=!1,a||it()}}},Mt=()=>{if(!Y)return;let te=tu($,v,g);te!==w&&(w=te,Y.innerHTML=ks($,v,g))},et=async()=>{try{let te=await Q.testRuns(30);if(a)return;v=Array.isArray(te.runs)?te.runs:[]}catch{if(a)return;v=[]}},Ke=async(te=null)=>{try{let $e=te||(g?await Q.testRun(g):await Q.testRunCurrent());if(a)return;$=$e.run||null,!g&&$&&$.status!=="running"&&!v.some(Qe=>Qe.run_id===$.run_id)&&await et()}catch{if(a)return;$=null}a||Mt()};pe?.addEventListener("input",()=>{R(),Ue("\u5C1A\u672A\u6E2C\u8A66\u6B64\u4F4D\u5740\u3002")}),C?.addEventListener("click",async()=>{let te=y();if(te!==null){Me(C,!0,"\u6E2C\u8A66\u4E2D\u2026"),Ue(`\u6B63\u5728\u9023\u7DDA\u5230 ${os(te)||"\u540C\u6E90"}\u2026`);try{let $e=await Gn(te);if(a)return;Ue(`\u9023\u7DDA\u6210\u529F \xB7 v${$e.version} \xB7 ${$e.duration_ms} ms \xB7 GET ${_t("/api/health",te)}`,"ok")}catch($e){a||Ue($e.message||"\u9023\u7DDA\u6E2C\u8A66\u5931\u6557\u3002","error")}finally{a||Me(C,!1)}}}),ye?.addEventListener("submit",te=>{if(te.preventDefault(),We())return;let $e=y();$e!==null&&(za($e),N(`\u5F8C\u7AEF API \u5DF2\u8A2D\u70BA ${os($e)}\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026`,"ok",1600),window.setTimeout(()=>window.location.reload(),120))}),se?.addEventListener("click",()=>{We()||(za(""),N("\u5DF2\u6E05\u9664\u700F\u89BD\u5668\u5132\u5B58\u7684 API \u4F4D\u5740\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026","info",1600),window.setTimeout(()=>window.location.reload(),120))}),B?.addEventListener("click",Ce),ve?.addEventListener("click",nt),Fe?.addEventListener("click",Ge),Y?.addEventListener("change",async te=>{te.target.id==="test-run-select"&&(g=String(te.target.value||""),await Ke())}),Y?.addEventListener("click",async te=>{te.target.closest("#test-flow-refresh")&&(g="",await et(),await Ke())}),V?.addEventListener("click",async()=>{Me(V,!0,"\u66F4\u65B0\u4E2D\u2026"),A(),await Promise.allSettled([F(),et(),Pe(),rt()]),a||await Ke(),a||(Me(V,!1),N("\u7CFB\u7D71\u6E2C\u8A66\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200))});let Rt=te=>{n=!!te.detail?.enabled,i=te.detail?.models||{embedding:[],llm:[]},G()};return window.addEventListener("judgment:test-mode",Rt),A(),G(),Ne(),it(),await Promise.allSettled([F(),et(),Pe(),rt()]),await Ke(),m=kt("test-runs",async(te,$e)=>{a||document.hidden||g||await Ke($e?.snapshot||null)}),!s&&typeof t?.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"),()=>{a=!0,m&&m(),window.removeEventListener("judgment:test-mode",Rt)}}var Fi={frontend:"browser",backend:"server",database:"database",storage:"layers",vector:"cube",ai:"brain",default:"cpu"};var Ui={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90"},Qi=[{id:"overview",label:"\u670D\u52D9\u7E3D\u89BD",hint:"\u5065\u5EB7\u72C0\u614B\u8207\u8CC7\u6599\u91CF",icon:"activity"},{id:"tests",label:"\u7CFB\u7D71\u6E2C\u8A66",hint:"API\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u6A21\u578B Flow",icon:"terminal"},{id:"resources",label:"\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528",hint:"CPU\u3001RAM\u3001Docker\u3001\u786C\u789F",icon:"cpu"},{id:"local-model",label:"Model Provider",hint:"Ollama \u4E3B\u6A5F\u8207\u6A21\u578B",icon:"server"},{id:"architecture",label:"\u524D\u5F8C\u7AEF\u67B6\u69CB",hint:"Client \u2192 Data \u2192 AI",icon:"layers"},{id:"data",label:"\u8CC7\u6599\u7248\u672C",hint:"Parquet \u8207 PostgreSQL",icon:"database"},{id:"api",label:"API \u7AEF\u9EDE",hint:"REST \u8207 OpenAPI",icon:"terminal"},{id:"runs",label:"\u6700\u8FD1\u4E0B\u8F09",hint:"\u6CD5\u898F\uFF0F\u547D\u4EE4\u57F7\u884C\u7D00\u9304",icon:"history"}];function su(e){return e==="operational"?{label:"\u6838\u5FC3\u670D\u52D9\u6B63\u5E38",tone:"ok",headline:"\u6838\u5FC3\u8CC7\u6599\u7BA1\u7DDA\u904B\u4F5C\u4E2D",copy:"FastAPI\u3001PostgreSQL \u8207 Parquet \u5747\u53EF\u5B58\u53D6\u3002Qdrant\u3001Embedding \u8207 LLM \u6703\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u8A2D\u5B9A\u6216\u964D\u7D1A\u6642\u4E0D\u5F71\u97FF\u8CC7\u6599\u700F\u89BD\u8207\u67E5\u8A62\u5831\u8868\u3002"}:e==="degraded"?{label:"\u90E8\u5206\u670D\u52D9\u964D\u7D1A",tone:"warn",headline:"\u90E8\u5206\u670D\u52D9\u9700\u8981\u8A2D\u5B9A\u6216\u4FEE\u5FA9",copy:"\u6838\u5FC3\u8CC7\u6599\u670D\u52D9\u76EE\u524D\u672A\u5B8C\u5168\u53EF\u7528\u3002\u8ACB\u67E5\u770B\u4E0B\u65B9\u670D\u52D9\u5361\u7247\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u7684\u57F7\u884C\u7D00\u9304\uFF0C\u78BA\u8A8D PostgreSQL\u3001Parquet \u6216\u5916\u90E8\u670D\u52D9\u72C0\u614B\u3002"}:{label:Ot(e).label,tone:Ot(e).tone,headline:"\u76EE\u524D\u7121\u6CD5\u78BA\u8A8D\u7CFB\u7D71\u72C0\u614B",copy:"\u72C0\u614B API \u56DE\u50B3\u4E86\u975E\u9810\u671F\u7D50\u679C\u3002\u8ACB\u91CD\u65B0\u6574\u7406\uFF0C\u6216\u76F4\u63A5\u6AA2\u67E5 FastAPI \u670D\u52D9\u65E5\u8A8C\u3002"}}function au(e){let t=Ot(e.status),s=Fi[e.kind]||Fi.default,a=e.latency_ms===null||e.latency_ms===void 0?"":`<span class="service-latency">${d(e.latency_ms)} ms</span>`;return`<article class="service-card">
    <div class="service-top">
      <span class="service-icon">${f(s,14)}</span>
      <span class="service-name" title="${r(e.name)}">${r(e.name)}</span>
      <span class="service-kind">${r(e.kind||"")}</span>
    </div>
    <div class="service-status">
      <span class="status-dot ${t.tone==="ok"?"is-ok":t.tone==="warn"?"is-warn":t.tone==="danger"?"is-danger":"is-idle"}" aria-hidden="true"></span>
      ${r(t.label)}
      ${a}
    </div>
    <p class="service-detail" title="${r(e.detail||"")}">${r(e.detail||"")}</p>
  </article>`}function nu(e,t){return`<div class="arch-node ${e?"":"is-muted"}" ${e?"":'title="\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165"'}>${r(t)}</div>`}function ru(e,t){if(e==="IndexedDB")return ur();let a={PostgreSQL:"postgres",Parquet:"parquet",Qdrant:"qdrant",Embedding:"embedding",Retriever:"rag",Reranker:"reranker","RAG Engine":"rag",LLM:"llm"}[e];return a?t.find(i=>i.id===a)?.status==="operational":!0}function iu(e,t){let s=e?.layers||[];if(!s.length)return'<div class="report-empty-inline">\u72C0\u614B API \u672A\u63D0\u4F9B\u67B6\u69CB\u8CC7\u6599\u3002</div>';let a=s.map(i=>{let o=(i.nodes||[]).map(l=>nu(ru(l,t),l)).join("");return`<div class="arch-layer">
      <div class="arch-layer-label">${r(i.label||i.id)}</div>
      <div class="arch-nodes">${o}</div>
    </div>`}),n=[];return a.forEach((i,o)=>{o&&n.push(`<div class="arch-arrow" aria-hidden="true">${f("arrowRight",15)}</div>`),n.push(i)}),`<div class="arch-flow">${n.join("")}</div>
    <div class="arch-legend">
      <span><i class="legend-key is-live"></i>\u5DF2\u63A5\u5165\u4E14\u72C0\u614B\u6B63\u5E38</span>
      <span><i class="legend-key is-off"></i>\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165</span>
      <span>${f("info",12)} \u7BC0\u9EDE\u72C0\u614B\u4F86\u81EA\u4E3B\u670D\u52D9\u5065\u5EB7\u6AA2\u67E5</span>
    </div>`}function ou(e){return!Array.isArray(e)||!e.length?'<div class="report-empty-inline">\u6C92\u6709\u7AEF\u9EDE\u8CC7\u8A0A\u3002</div>':`<div class="endpoint-list">
    ${e.map(t=>`<div class="endpoint-row">
          <span class="endpoint-method">${r(t.method)}</span>
          <span class="endpoint-path" title="${r(t.path)}">${r(t.path)}</span>
          <span class="endpoint-label">${r(t.label||"")}</span>
        </div>`).join("")}
  </div>`}function Ze(e,t){return`<div class="detail-row">
    <span class="detail-label">${r(e)}</span>
    <span class="detail-value">${t}</span>
  </div>`}function lu(e){return e?`<div class="detail-list">
    ${Ze("\u7248\u672C ID",`<strong>#${d(e.id)}</strong>`)}
    ${Ze("\u8CC7\u6599\u985E\u578B",Ve("operational",e.source_type==="law"?"\u6CD5\u898F":"\u547D\u4EE4"))}
    ${Ze("\u4F86\u6E90\u66F4\u65B0\u65E5",`<strong>${r(e.update_date||"\u2014")}</strong>`)}
    ${Ze("\u6CD5\u898F / \u689D\u6587",`<strong>${d(e.law_count)} / ${d(e.article_count)}</strong>`)}
    ${Ze("\u4E0B\u8F09\u6642\u9593",`<span class="mono">${qe(e.downloaded_at)}</span>`)}
    ${Ze("Parquet",`<code title="${r(e.parquet_path||"")}">${r(e.parquet_path||"\u2014")}</code>`)}
  </div>`:'<div class="report-empty-inline">\u5C1A\u672A\u532F\u5165\u4EFB\u4F55\u8CC7\u6599\u7248\u672C\u3002</div>'}function cu(e){if(!Array.isArray(e)||!e.length)return pt({iconName:"history",title:"\u5C1A\u7121\u4E0B\u8F09\u57F7\u884C\u7D00\u9304",text:"\u57F7\u884C judgment-law-download \u5F8C\uFF0C\u6210\u529F\u3001\u7121\u8B8A\u66F4\u8207\u5931\u6557\u7684\u7D50\u679C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"});let t=[{key:"id",label:"Run",type:"number"},{key:"source_type",label:"\u985E\u578B",type:"source"},{key:"status",label:"\u72C0\u614B",type:"status"},{key:"started_at",label:"\u958B\u59CB\u6642\u9593",type:"datetime"},{key:"duration_ms",label:"\u8017\u6642",type:"duration"},{key:"law_count",label:"\u6CD5\u898F",type:"number"},{key:"article_count",label:"\u689D\u6587",type:"number"},{key:"error_message",label:"\u932F\u8AA4",type:"longtext"}];return`<div class="table-wrap" style="border-top:0;max-height:340px">
    <table class="data-table runs-table">
      <thead><tr>${t.map(s=>`<th scope="col">${r(s.label)}</th>`).join("")}</tr></thead>
      <tbody>
        ${e.map(s=>`<tr>${t.map(a=>`<td>${Zs(s[a.key],a.type)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </div>`}function du(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=new Map(s.map(w=>[w.id,w])),n=a.get("qdrant"),i=a.get("embedding"),o=a.get("rag"),l=a.get("llm"),u=Number(t.judgment_indexed_count||0),c=Number(t.judgment_count||0),p=c?(u/c*100).toFixed(1):"0.0",$=t.judgment_vector_points===null||t.judgment_vector_points===void 0?"\u2014":d(t.judgment_vector_points),v=Number(t.judgment_index_remaining||0),g=o?.status==="operational"?"RAG \u5C31\u7DD2":o?.status==="not_configured"?"\u672A\u8A2D\u5B9A":o?.status==="degraded"?"\u964D\u7D1A":"\u672A\u77E5",m=[["cube","Qdrant \u5411\u91CF\u7D22\u5F15",n],["layers",`Embedding\uFF08${t.judgment_vector_model||"\u2014"}\uFF09`,i],["brain","RAG \u56DE\u7B54\u7BA1\u7DDA",o],["sparkles","LLM \u6A21\u578B",l]];return`<section class="card data-section rag-index-card">
    <div class="side-card-head">
      <span class="side-card-title">${f("database",14)}RAG \u8CC7\u6599\u73FE\u6CC1</span>
      ${Ve(o?.status,g)}
    </div>
    <div class="side-card-body">
      <div class="mini-stats">
        <div class="mini-stat">
          <div class="mini-stat-value">${d(c)}</div>
          <div class="mini-stat-label">\u5224\u6C7A</div>
        </div>
        <div class="mini-stat">
          <div class="mini-stat-value">${d(u)}</div>
          <div class="mini-stat-label">\u5DF2\u7D22\u5F15</div>
        </div>
        <div class="mini-stat">
          <div class="mini-stat-value">${p}%</div>
          <div class="mini-stat-label">\u7D22\u5F15\u8986\u84CB</div>
        </div>
      </div>
      <div class="side-status-list">
        ${m.map(([w,S,M])=>`<div class="side-status-row">
              <span>${f(w,13)}${r(S)}</span>
              ${Ve(M?.status,M?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
            </div>`).join("")}
      </div>
      <div class="side-card-foot" style="padding:0;border:0;margin-top:10px">
        Collection\uFF1A${r(t.judgment_vector_collection||"\u2014")} \xB7
        ${$} points \xB7 \u5269\u9918 ${d(v)} \u7B46\u5F85\u7D22\u5F15
      </div>
    </div>
    <div class="side-card-foot">
      PostgreSQL \u5224\u6C7A\u6587\u4EF6\u3001Qdrant \u5411\u91CF\u7D22\u5F15\u8207 Ollama \u6A21\u578B\u72C0\u614B\u7686\u70BA\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u5C31\u7DD2\u6642\u6703\u660E\u78BA\u964D\u7D1A\u3002
    </div>
  </section>`}function uu(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=su(e.status),n=s.find(c=>c.id==="qdrant"),i=s.find(c=>c.id==="rag"),o=s.find(c=>c.id==="llm"),l=Xt(),u=Ui[l]||l;return`<section class="status-hero">
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
          <span>${f("clock",11)} \u6AA2\u67E5\u6642\u9593 ${qe(e.checked_at)} \xB7 ${r(js(e.checked_at))}</span>
          <span>${f("server",11)} ${s.length} \u500B\u670D\u52D9\u5143\u4EF6</span>
          <span>${f("database",11)} ${d(t.total_current)} \u7B46\u73FE\u884C\u8CC7\u6599</span>
          <span>${f("layers",11)} ${d(t.parquet_files)} \u500B\u539F\u59CB Parquet</span>
          <span title="API \u4F4D\u5740\u4F86\u6E90\uFF1A${r(u)}">${f("link",11)} ${r(os())}</span>
        </div>
      </div>
    </section>

    <div class="service-grid">${s.map(au).join("")}</div>

    ${du(e)}

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

    ${n?.status==="not_configured"||i?.status==="not_configured"||o?.status==="not_configured"?`<div class="data-section">${Ie({tone:"info",title:"\u90E8\u5206 AI \u5143\u4EF6\u5C1A\u672A\u8A2D\u5B9A",text:`Qdrant\uFF1A${r(n?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BRAG\uFF1A${r(i?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BLLM\uFF1A${r(o?.detail||"\u672A\u8A2D\u5B9A")}\u3002\u9019\u4E9B\u72C0\u614B\u4E0D\u6703\u88AB\u507D\u88DD\u6210\u53EF\u7528\u3002`})}</div>`:""}`}function pu(e){let t=Array.isArray(e.services)?e.services:[],s=e.architecture||{};return`<div class="data-section card architecture-card">
    <div class="section-head">
      <div>
        <div class="section-title">\u524D\u5F8C\u7AEF\u67B6\u69CB</div>
        <div class="section-sub">Client \u2192 Application \u2192 Data \u2192 Intelligence</div>
      </div>
      <span class="badge badge-neutral badge-mono">${d((s.flow||[]).length)} layers</span>
    </div>
    ${iu(s,t)}
  </div>`}function mu(e){let t=Xt(),s=Ui[t]||t,a=_t("/api/docs"),n=_t("/api/openapi.json");return`<div class="status-columns is-single">
    <section class="card">
      <div class="side-card-head">
        <span class="side-card-title">${f("terminal",14)}API \u7AEF\u9EDE</span>
        <a href="${r(a)}" target="_blank" rel="noopener noreferrer" class="chip"
          >OpenAPI ${f("external",11)}</a>
      </div>
      ${ou(e.endpoints)}
      <div class="side-card-foot">
        \u76EE\u524D API Base\uFF1A<code>${r(os())}</code>\uFF08${r(s)}\uFF09\u3002\u4E92\u52D5\u5F0F API \u6587\u4EF6\u4F4D\u65BC <a href="${r(a)}" target="_blank" rel="noopener noreferrer"><code>${r(a)}</code></a>\uFF0COpenAPI schema \u4F4D\u65BC <a href="${r(n)}" target="_blank" rel="noopener noreferrer"><code>${r(n)}</code></a>\u3002
      </div>
    </section>
  </div>`}function gu(e){let t=e.data||{},s=Number(t.judgment_indexed_count||0),a=Number(t.judgment_count||0),n=a?(s/a*100).toFixed(1):"0.0",i=Number(t.judgment_index_remaining||0);return`<div class="status-summary">
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
        <div class="metric-label">\u5224\u6C7A\u7D22\u5F15</div>
        <div class="metric-value">${d(t.judgment_indexed_count)}</div>
        <div class="metric-foot">/ ${d(t.judgment_count)} \u7B46\u5224\u6C7A \xB7 \u8986\u84CB ${n}%</div>
      </div>
    </div>
    <div class="status-columns is-single">
      <section class="card">
        <div class="side-card-head">
          <span class="side-card-title">${f("layers",14)}\u6700\u65B0\u8CC7\u6599\u7248\u672C</span>
          ${Ve("operational","Parquet")}
        </div>
        ${lu(t.last_version)}
        <div class="side-card-foot">
          \u539F\u59CB Parquet \u5408\u8A08 ${Re(t.parquet_bytes)}\uFF1BPostgreSQL \u4FDD\u5B58 metadata \u8207\u7248\u672C\u72C0\u614B\u3002
        </div>
      </section>
      <section class="card">
        <div class="side-card-head">
          <span class="side-card-title">${f("database",14)}\u8CC7\u6599\u96C6\u7D71\u8A08</span>
          <span class="badge badge-neutral badge-mono">${d(t.parquet_files)} FILES</span>
        </div>
        <div class="detail-list">
          ${Ze("\u73FE\u884C\u6CD5\u898F",`<strong>${d(t.law_count)}</strong>`)}
          ${Ze("\u73FE\u884C\u547D\u4EE4",`<strong>${d(t.order_count)}</strong>`)}
          ${Ze("\u689D\u6587\u7E3D\u6578",`<strong>${d(t.article_count)}</strong>`)}
          ${Ze("\u539F\u59CB Parquet",`<strong>${Re(t.parquet_bytes)}</strong>`)}
          ${Ze("\u5224\u6C7A\u6587\u4EF6",`<strong>${d(t.judgment_count)}</strong>`)}
          ${Ze("\u5411\u91CF\u7D22\u5F15",`<strong>${d(t.judgment_indexed_count)}</strong> / ${d(t.judgment_count)}\uFF08${d(t.judgment_vector_points)} points\uFF09`)}
          ${Ze("\u7D22\u5F15\u8986\u84CB",`<strong>${n}%</strong> \xB7 \u5269\u9918 ${d(i)} \u7B46`)}
          ${Ze("\u7D22\u5F15\u7248\u672C",`<strong>#${d(t.judgment_vector_version_id)}</strong> \xB7 ${r(t.judgment_vector_version_status||"legacy")}`)}
          ${Ze("Alias",`<code>${r(t.judgment_vector_alias||"\u2014")}</code> \u2192 <code>${r(t.judgment_vector_collection||"\u2014")}</code>`)}
          ${Ze("\u7D22\u5F15\u6A21\u578B",`<code>${r(t.judgment_vector_model||"\u2014")}</code>`)}
          ${Ze("\u6700\u8FD1\u7D22\u5F15",`<span class="mono">${qe(t.judgment_indexed_at)}</span>`)}
        </div>
      </section>
    </div>`}function fu(e){let t=e.data||{};return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${f("history",14)}\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C</span>
      <span class="badge badge-neutral badge-mono">${d(t.run_count)} TOTAL</span>
    </div>
    ${cu(e.recent_runs)}
  </section>`}function bu(e){let t=Number(e);return Number.isFinite(t)?t>=90?"is-danger":t>=70?"is-warn":"":""}function Gi(e,t=""){let s=Math.max(0,Math.min(100,Number(e)||0));return`<div class="resource-bar ${t}"><span style="width:${s}%"></span></div>`}function gs(e,t,s,a,n){let i=bu(n);return`<article class="resource-card">
    <div class="resource-card-head">
      <span class="resource-card-label">${f(t,14)}${r(e)}</span>
      <strong>${r(s)}</strong>
    </div>
    ${Gi(n,i)}
    <div class="resource-card-detail">${a}</div>
  </article>`}function vu(e){let t=e.docker||{};if(!t.available)return`<section class="card data-section">
      <div class="side-card-head">
        <span class="side-card-title">${f("layers",14)}Docker</span>
        ${Ve("not_configured","\u672A\u9023\u7DDA")}
      </div>
      <div class="report-empty-inline">${r(t.detail||"Docker daemon \u672A\u9023\u7DDA\u3002")}</div>
    </section>`;let s=[...t.containers||[]].sort((i,o)=>{let l=i.service?0:1,u=o.service?0:1;return l-u||String(i.name).localeCompare(String(o.name))}),a=s.map(i=>`<tr>
        <td><strong>${r(i.name||"\u2014")}</strong>${i.service?`<span class="badge badge-neutral badge-mono">${r(i.service)}</span>`:""}</td>
        <td>${Ve(i.state==="running"?"operational":"degraded",i.state||"\u2014")}</td>
        <td class="cell-number">${i.cpu_percent===null||i.cpu_percent===void 0?"\u2014":`${d(i.cpu_percent)}%`}</td>
        <td class="cell-number">${Re(i.memory_used)}${i.memory_limit?` / ${Re(i.memory_limit)}`:""}</td>
        <td class="mono">${r(i.net_io||"\u2014")}</td>
        <td class="mono">${r(i.block_io||"\u2014")}</td>
        <td class="cell-number">${d(i.pids)}</td>
      </tr>`).join(""),n=(t.system||[]).map(i=>`<span class="resource-docker-pill">
        <strong>${r(i.type||"\u2014")}</strong>
        <span>${d(i.count)} \xB7 ${r(i.size||"\u2014")}</span>
      </span>`).join("");return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${f("layers",14)}Docker \u5BB9\u5668\u4F7F\u7528\u8CC7\u6E90</span>
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
  </section>`}function hu(e){return`<div class="resource-section-head">
      <div>
        <div class="section-title">\u5404\u8CC7\u6599\u5EAB\u4F7F\u7528\u8CC7\u6E90</div>
        <div class="section-sub">\u5BB9\u5668 CPU\uFF0FRAM \u8207\u8CC7\u6599\u5EAB\u5167\u90E8\u5BB9\u91CF</div>
      </div>
    </div>
    <div class="resource-db-grid">${(Array.isArray(e.databases)?e.databases:[]).map(s=>{let a=s.id==="postgres",n=Array.isArray(s.tables)?s.tables:[],i=s.status==="operational"?"operational":s.status==="not_configured"?"not_configured":"degraded",o=a?`${Ze("\u8CC7\u6599\u5EAB",`<code>${r(s.database||"\u2014")}</code>`)}
           ${Ze("\u8CC7\u6599\u5EAB\u5927\u5C0F",`<strong>${Re(s.storage_bytes)}</strong>`)}
           ${Ze("Docker volume",`<strong>${Re(s.volume_bytes)}</strong>${s.volume_name?` <code>${r(s.volume_name)}</code>`:""}`)}
           ${Ze("\u9023\u7DDA\u6578",`<strong>${d(s.connections)}</strong>`)}`:`${Ze("Collection",`<code>${r(s.collection||"\u2014")}</code>`)}
           ${Ze("Docker volume",`<strong>${Re(s.volume_bytes)}</strong>${s.volume_name?` <code>${r(s.volume_name)}</code>`:""}`)}
           ${Ze("\u5411\u91CF\u9EDE\u6578",`<strong>${d(s.points_count)}</strong>`)}
           ${Ze("Collections",`<strong>${d(s.collections)}</strong>`)}
           ${Ze("Segments",`<strong>${d(s.segments_count)}</strong>`)}`;return`<article class="resource-db-card">
        <div class="resource-db-head">
          <div>
            <div class="resource-db-title">${r(s.name||"\u2014")}</div>
            <div class="resource-db-kind">${r(s.kind||"")}</div>
          </div>
          ${Ve(i)}
        </div>
        <div class="resource-db-metrics">
          <div><span>CPU</span><strong>${s.cpu_percent===null||s.cpu_percent===void 0?"\u2014":`${d(s.cpu_percent)}%`}</strong></div>
          <div><span>RAM</span><strong>${Re(s.memory_used)}</strong><small>${s.memory_limit?` / ${Re(s.memory_limit)}`:""}</small></div>
          <div><span>\u5BB9\u5668</span><strong class="mono">${r(s.container||"\u2014")}</strong><small>${r(s.container_status||"\u2014")}</small></div>
        </div>
        <div class="detail-list">${o}</div>
        ${n.length?`<div class="resource-table-wrap">
                <table class="data-table is-compact">
                  <thead><tr><th scope="col">\u8CC7\u6599\u8868</th><th scope="col">\u5927\u5C0F</th></tr></thead>
                  <tbody>${n.map(l=>`<tr>
                        <td class="mono">${r(l.name||"\u2014")}</td>
                        <td class="cell-number">${Re(l.bytes)}</td>
                      </tr>`).join("")}</tbody>
                </table>
              </div>`:""}
        <div class="side-card-foot">${r(s.detail||"")}</div>
      </article>`}).join("")}</div>`}function xs(e,t,s,a){let n=Number(t)||0,i=a?n/a*100:0;return`<div class="storage-row">
    <div class="storage-row-head">
      <span>${r(e)}</span>
      <strong>${Re(n)}</strong>
    </div>
    ${Gi(i)}
    <div class="storage-row-detail">${s}</div>
  </div>`}function $u(e){let t=e.storage||{},s=t.application||{},a=t.parquet||{},n=t.docker||{},i=t.volumes||{},o=i.postgres||{},l=i.qdrant||{},u=Number(t.judgment_total_bytes||0);return`<section class="card data-section storage-section">
    <div class="side-card-head">
      <span class="side-card-title">${f("database",14)}\u786C\u789F\u4F7F\u7528\u7D44\u6210</span>
      <span class="badge badge-neutral badge-mono">${Re(u)}</span>
    </div>
    <div class="storage-list">
      ${xs("\u524D\u7AEF",s.frontend_bytes,`<span class="mono">${r(s.frontend_path||"\u2014")}</span>`,u)}
      ${xs("\u5F8C\u7AEF",s.backend_bytes,`<span class="mono">${r(s.backend_path||"\u2014")}</span>`,u)}
      ${xs("Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5FEB\u53D6",n.layers_bytes,`Images ${Re(n.images_bytes)} \xB7 Containers ${Re(n.containers_bytes)} \xB7 Build cache ${Re(n.build_cache_bytes)}`,u)}
      ${xs("PostgreSQL volume",o.size_bytes,`<span class="mono">${r(o.name||"\u2014")}</span>`,u)}
      ${xs("Qdrant volume",l.size_bytes,`<span class="mono">${r(l.name||"\u2014")}</span>`,u)}
      ${xs("Parquet",a.total_bytes,`\u6CD5\u898F ${Re(a.law_bytes)} \xB7 \u5224\u6C7A ${Re(a.judgment_bytes)}`,u)}
    </div>
    <div class="storage-total">
      <span>Judgment \u5143\u4EF6\u5408\u8A08</span>
      <strong>${Re(u)}</strong>
    </div>
    <div class="side-card-foot">
      \u524D\u7AEF\uFF0B\u5F8C\u7AEF\u7A0B\u5F0F\u3001Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5EFA\u7F6E\u5FEB\u53D6\u3001PostgreSQL\uFF0FQdrant volume \u8207\u539F\u59CB Parquet\uFF1B\u4E0D\u542B .venv \u8207\u5176\u4ED6\u975E Judgment Docker volume\u3002
    </div>
  </section>`}function yu(e){let t=e.host||{},s=t.cpu||{},a=t.memory||{},n=t.swap||{},i=e.storage||{},o=i.filesystem||{},l=Number(i.judgment_total_bytes||0),u=Array.isArray(e.disk)?e.disk:[],c=u[0]||{},p=Number(o.total_bytes||c.total||0),$=p?l/p*100:0,v=[s.load_1,s.load_5,s.load_15].map(w=>w??"\u2014").join(" / "),g=t.uptime_seconds===null||t.uptime_seconds===void 0?"\u2014":ge(Number(t.uptime_seconds)*1e3),m=[c.label?gs("HDD \u5DF2\u4F7F\u7528","database",`${d(c.percent)}%`,`${Re(c.used)} / ${Re(c.total)} \xB7 \u5269\u9918 ${Re(c.free)}<br><span class="mono">${r(c.path||"")}</span>`,c.percent):"",l?gs("Judgment \u5143\u4EF6\u5408\u8A08","layers",Re(l),`\u7D04\u5360 HDD ${d($)}% \xB7 \u524D\u7AEF\uFF0F\u5F8C\u7AEF\uFF0FDocker\uFF0FDB volume\uFF0FParquet`,$):"",...u.slice(1).map(w=>gs(`\u786C\u789F \xB7 ${w.label}`,"layers",`${d(w.percent)}%`,`${Re(w.used)} / ${Re(w.total)} \xB7 \u5269\u9918 ${Re(w.free)}<br><span class="mono">${r(w.path||"")}</span>`,w.percent))].filter(Boolean).join("");return`<div class="resource-section-head">
      <div>
        <div class="eyebrow">SYSTEM RESOURCE USAGE</div>
        <div class="section-sub">\u66F4\u65B0\u6642\u9593 ${qe(e.checked_at)} \xB7 ${e.status==="operational"?"\u8CC7\u6E90\u8B80\u53D6\u6B63\u5E38":"\u90E8\u5206\u8CC7\u6E90\u964D\u7D1A"}</div>
      </div>
    </div>
    <div class="resource-grid">
      ${gs("CPU \u4F7F\u7528\u7387","cpu",`${d(s.percent)}%`,`${d(s.logical_cores)} \u908F\u8F2F\u6838\u5FC3 \xB7 ${d(s.physical_cores)} \u5BE6\u9AD4\u6838\u5FC3<br>Load ${r(v)}`,s.percent)}
      ${gs("\u8A18\u61B6\u9AD4","server",`${d(a.percent)}%`,`${Re(a.used)} / ${Re(a.total)} \xB7 \u53EF\u7528 ${Re(a.available)}`,a.percent)}
      ${gs("Swap","layers",`${d(n.percent)}%`,`${Re(n.used)} / ${Re(n.total)}`,n.percent)}
      ${gs("\u7A0B\u5E8F\u8207\u958B\u6A5F","activity",`${d(t.processes)} \u500B\u7A0B\u5E8F`,`\u958B\u6A5F ${r(g)}<br>${r(t.platform||"")}`,null)}
    </div>
    <div class="resource-grid resource-disk-grid">${m||'<div class="report-empty-inline">\u627E\u4E0D\u5230\u53EF\u8B80\u53D6\u7684\u78C1\u789F\u3002</div>'}</div>
    ${$u(e)}
    ${vu(e)}
    ${hu(e)}`}function zi(){return`<div class="resource-section-head">
      <div>
        <div class="skeleton skeleton-line" style="width:160px;height:18px"></div>
        <div class="skeleton skeleton-line" style="width:260px;margin-top:8px"></div>
      </div>
    </div>
    <div class="resource-grid">
      ${Array.from({length:4}).map(()=>'<div class="skeleton" style="height:120px;border-radius:var(--radius-md)"></div>').join("")}
    </div>
    <div class="skeleton" style="height:180px;margin-top:16px;border-radius:var(--radius-md)"></div>
    <div class="skeleton" style="height:220px;margin-top:16px;border-radius:var(--radius-md)"></div>`}function wu(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SYSTEM RESOURCE USAGE</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${Ie({tone:"danger",title:"\u8CC7\u6E90 API \u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-resources-retry">
          ${f("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function _u(e){return e.status==="operational"?{label:"\u5DF2\u9023\u7DDA",badge:"badge-ok"}:{label:"\u7121\u6CD5\u9023\u7DDA",badge:"badge-danger"}}function ku(e,t){let s=_u(e),a=Array.isArray(e.models)?e.models:[],n=a.length?a.map(i=>{let o=String(i.name||""),l=e.chat_model===o,u=e.embedding_model===o,c=i.size?Re(i.size):"",p=i.modified_at?qe(i.modified_at):"",$=new Set((i.capabilities||[]).map(g=>String(g||"").toLowerCase())),v=[];return i.supports_chat===!0&&v.push(["Chat","badge-ok"]),$.has("embedding")&&v.push(["Embedding","badge-info"]),$.has("vision")&&v.push(["Vision","badge-neutral"]),$.has("tools")&&v.push(["Tools","badge-neutral"]),$.has("thinking")&&v.push(["Thinking","badge-neutral"]),$.has("speech")&&v.push(["Speech","badge-warn"]),i.is_reranker&&v.push(["Reranker","badge-neutral"]),v.length||v.push([i.capability_status==="untested"?"\u672A\u6E2C\u8A66":"\u7121 chat \u80FD\u529B","badge-neutral"]),`<div class="ollama-model-row">
            <div class="ollama-model-main">
              <strong>${r(o)}</strong>
              <span class="ollama-model-meta">${[c,p].filter(Boolean).map(g=>r(g)).join(" \xB7 ")||"\u2014"}</span>
              <div class="ollama-model-capabilities">${v.map(([g,m])=>`<span class="badge ${m}">${r(g)}</span>`).join("")}</div>
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
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="edit-host" data-id="${e.id}">${f("edit",13)}<span>\u7DE8\u8F2F</span></button>
        <button class="btn btn-ghost btn-sm" type="button" data-ollama-action="delete-host" data-id="${e.id}">${f("trash",13)}<span>\u522A\u9664</span></button>
      </div>
    </div>
    <div class="ollama-model-list">${n}</div>
  </article>`}function Su(e,t,s,a){if(s)return`<div class="report-card">
      ${Ie({tone:"danger",title:"Model Provider \u8B80\u53D6\u5931\u6557",text:r(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="refresh-hosts">${f("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;let n=e||{hosts:[],active_host_id:null},i=Array.isArray(n.hosts)?n.hosts:[],o=a?i.find(c=>Number(c.id)===Number(a)):null,l=o?o.base_url.replace(new RegExp(`:${o.port}$`),""):"http://127.0.0.1",u=o?"\u5132\u5B58\u8B8A\u66F4":"\u65B0\u589E\u4E3B\u6A5F";return`<div class="report-card ollama-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">MODEL PROVIDER</div>
        <div class="report-title">Ollama \u4E3B\u6A5F\u8207\u6A21\u578B</div>
        <div class="report-sub">\u7BA1\u7406\u53EF\u7528\u7684 Ollama \u9023\u7DDA\u3001\u76EE\u524D\u4F7F\u7528\u7684\u4E3B\u6A5F\uFF0C\u4EE5\u53CA\u4E3B\u6A5F\u4E0A\u7684\u804A\u5929\uFF0F\u5D4C\u5165\u6A21\u578B\u3002\u6BCF\u6B21\u958B\u555F\u6B64\u9801\u90FD\u6703\u91CD\u65B0\u53D6\u5F97\u4E3B\u6A5F\u8207\u6A21\u578B\u5217\u8868\uFF1Bembedding \u4E3B\u6A5F\u7684\u512A\u5148\u9806\u5E8F\u53EF\u5230\u300C\u8CC7\u6599\u8655\u7406\u300D\u7684\u57F7\u884C\u8CC7\u8A0A\u5361\u7247\u62D6\u79FB\u8ABF\u6574\u3002</div>
      </div>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="check-capabilities">${f("shield",14)}<span>\u6AA2\u67E5\u6A21\u578B\u80FD\u529B</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="refresh-hosts">${f("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span></button>
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
          <button class="btn btn-primary btn-sm" type="submit">${f("check",13)}<span>${u}</span></button>
          ${o?'<button class="btn btn-ghost btn-sm" type="button" data-ollama-action="cancel-host-edit">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
        </div>
      </form>
      ${t?'<div class="ollama-loading"><span class="spinner"></span><span>\u8B80\u53D6 Ollama \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span></div>':i.length?`<div class="ollama-host-list">${i.map(c=>ku(c,a)).join("")}</div>`:pt({iconName:"server",title:"\u5C1A\u672A\u8A2D\u5B9A Ollama \u4E3B\u6A5F",text:"\u8ACB\u5728\u4E0A\u65B9\u8F38\u5165\u7DB2\u5740\u8207 Port \u65B0\u589E\uFF0C\u6216\u4F7F\u7528 .env \u7684\u9810\u8A2D\u9023\u7DDA\u3002"})}
      <p class="report-sub" style="margin-top:12px">\u8A2D\u70BA\u804A\u5929\u6216\u5D4C\u5165\u6A21\u578B\u5F8C\uFF0C\u7CFB\u7D71\u6703\u4F7F\u7528\u76EE\u524D\u4E3B\u6A5F\u7684\u5C0D\u61C9\u6A21\u578B\u57F7\u884C AI \u51FA\u984C\u8207 RAG\uFF1B\u672A\u8A2D\u5B9A\u6642\u6CBF\u7528 .env \u7684 LLM_MODEL\uFF0FEMBEDDING_MODEL\u3002</p>
    </div>
  </div>`}function xu(e,t,s){let a=e?.data||{},n=e?Ot(e.status):null,i=s?Ot(s.status):null,o={overview:n?`<span class="badge ${n.tone==="ok"?"badge-ok":n.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${r(n.label)}</span>`:"",resources:i?`<span class="badge ${i.tone==="ok"?"badge-ok":i.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${r(i.label)}</span>`:'<span class="badge badge-neutral badge-mono">\u672A\u8B80\u53D6</span>',data:`<span class="badge badge-neutral badge-mono">${d(a.version_count)}</span>`,tests:'<span class="badge badge-neutral badge-mono">TEST</span>',"local-model":'<span class="badge badge-neutral badge-mono">OLLAMA</span>',runs:`<span class="badge badge-neutral badge-mono">${d(a.run_count)}</span>`};return`<div class="status-sidebar-head">
      <div class="eyebrow">STATUS SECTIONS</div>
      <div class="status-sidebar-title">\u7CFB\u7D71\u5206\u985E</div>
    </div>
    <nav class="status-tab-list" aria-label="\u7CFB\u7D71\u72C0\u614B\u5206\u985E">
      ${Qi.map(l=>{let u=l.id===t;return`<button class="status-tab${u?" is-active":""}" type="button"
          data-status-tab="${l.id}" ${u?'aria-current="page"':""}>
          <span class="status-tab-icon">${f(l.icon,15)}</span>
          <span class="status-tab-copy">
            <strong>${r(l.label)}</strong>
            <small>${r(l.hint)}</small>
          </span>
          ${o[l.id]||""}
        </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u6AA2\u67E5\u6642\u9593</span>
      <span class="mono">${r(e?qe(e.checked_at):"\u2014")}</span>
    </div>`}function qu(e,t,s,a,n,i){if(e==="resources")return s?yu(s):a?zi():n?wu(n):zi();if(e==="local-model"){let o=i||{},l=!!o.loading||!o.hosts&&!o.error;return Su(o.hosts||null,l,o.error||null,o.editingId||null)}return e==="architecture"?pu(t):e==="api"?mu(t):e==="data"?gu(t):e==="runs"?fu(t):uu(t)}function Au(){return`<div class="status-hero">
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
    </div>`}function Hi(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">STATUS CHECK</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u5FEB\u53D6\u6216\u63A8\u6E2C\u7684\u670D\u52D9\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${Ie({tone:"danger",title:"\u72C0\u614B API \u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-retry">
          ${f("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}async function Mu(e,t){let s=!1,a=null,n=null,i="overview",o=null,l=!1,u=null,c=null,p=!1,$=null,v=null,g=!1,m=!1,w=null,S=0,M="",j="";e.innerHTML=`<section class="page status-page">
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
          ${f("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
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
      <section class="status-panel" id="status-content">${Au()}</section>
    </div>
  </section>`;let B=e.querySelector("#status-nav"),U=e.querySelector("#status-content"),W=e.querySelector("#refresh-status"),K=e.querySelector("#auto-refresh"),ye=()=>{if(S+=1,typeof w=="function")try{w()}catch{}w=null,g=!1,m=!1},pe=async()=>{let Y=++S;m=!0,j="",U.innerHTML="";try{let ae=await Bn(U,{setTitle:()=>{}},{embedded:!0});if(Y!==S||i!=="tests"){typeof ae=="function"&&ae();return}w=typeof ae=="function"?ae:null,g=!0}catch(ae){Y===S&&i==="tests"&&(U.innerHTML=Hi(ae))}finally{Y===S&&(m=!1)}},z=()=>{if(!n)return;let Y=xu(n,i,o);if(Y!==M&&(B.innerHTML=Y,M=Y),i==="tests"){!g&&!m&&pe();return}ye();let ae=qu(i,n,o,l,u,{hosts:c,loading:p,error:$,editingId:v});ae!==j&&(U.innerHTML=ae,j=ae)},E=async({quiet:Y=!1}={})=>{if(!l){l=!0,u=null,i==="resources"&&!o&&z();try{let ae=await Q.systemUsage();if(s)return;o=ae}catch(ae){if(s)return;u=ae,Y||N(ae.message||"\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90\u3002","danger")}finally{s||(l=!1,i==="resources"&&z())}}},x=async({quiet:Y=!1}={})=>{if(!p){p=!0,$=null,i==="local-model"&&!c&&z();try{let ae=await Q.ollamaHosts();if(s)return;c=ae}catch(ae){if(s)return;$=ae,Y||N(ae.message||"\u7121\u6CD5\u53D6\u5F97 Ollama \u4E3B\u6A5F\u3002","danger")}finally{s||(p=!1,i==="local-model"&&z())}}},C=async()=>{await x({quiet:!0}),await se({quiet:!0})},se=async({quiet:Y=!1,status:ae=null}={})=>{Y||(W.disabled=!0,Me(W,!0,"\u6AA2\u67E5\u4E2D\u2026"));try{let ee=ae||await Q.status();if(s)return;n=ee,z(),Y||N("\u670D\u52D9\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(ee){if(s)return;i!=="tests"&&(j="",U.innerHTML=Hi(ee)),Y||N(ee.message||"\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002","danger")}finally{s||(W.disabled=!1,Me(W,!1))}},me=async({quiet:Y=!1,status:ae=null}={})=>{if(await se({quiet:Y,status:ae}),i==="resources"&&await E({quiet:Y}),i==="local-model"&&await x({quiet:Y}),!Y&&i==="tests"){let ee=U.querySelector("#tests-refresh");ee&&ee.click()}};B.addEventListener("click",Y=>{let ae=Y.target.closest("[data-status-tab]");if(!ae)return;let ee=ae.dataset.statusTab;Qi.some(ke=>ke.id===ee)&&(i=ee,z(),i==="resources"&&!o&&!l&&E(),i==="local-model"&&x())}),U.addEventListener("click",Y=>{Y.target.closest("#status-retry")&&se(),Y.target.closest("#status-resources-retry")&&E()}),U.addEventListener("click",async Y=>{let ae=Y.target.closest("[data-ollama-action]");if(!ae)return;let ee=ae.dataset.ollamaAction,ke=Number(ae.dataset.id||0);if(ee==="refresh-hosts"){await x();return}if(ee==="edit-host"){v=ke,z(),e.querySelector(".ollama-host-form")?.scrollIntoView({behavior:"smooth",block:"center"});return}if(ee==="cancel-host-edit"){v=null,z();return}if(ee==="delete-host"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 Ollama \u4E3B\u6A5F #${ke}\uFF1F`))return;try{await Q.deleteOllamaHost(ke),Number(v)===ke&&(v=null),N("Ollama \u4E3B\u6A5F\u5DF2\u522A\u9664\u3002","info"),await C()}catch(H){N(H.message||"\u522A\u9664\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(ee==="activate-host"){try{await Q.activateOllamaHost(ke),N("\u5DF2\u5207\u63DB\u4F7F\u7528\u7684 Ollama \u4E3B\u6A5F\u3002","ok"),await C()}catch(H){N(H.message||"\u5207\u63DB\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(ee==="deactivate-host"){try{await Q.deactivateOllamaHosts(),N("\u5DF2\u505C\u7528\u6307\u5B9A\u7684 Ollama \u4E3B\u6A5F\uFF0C\u5C07\u6CBF\u7528 .env \u8A2D\u5B9A\u3002","info"),await C()}catch(H){N(H.message||"\u505C\u7528\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(ee==="check-capabilities"){Me(ae,!0,"\u6AA2\u67E5\u4E2D\u2026");try{await Q.checkOllamaCapabilities(),N("\u5DF2\u66F4\u65B0\u6240\u6709\u4E3B\u6A5F\u7684\u6A21\u578B\u80FD\u529B\u3002","ok",4e3),await C()}catch(H){N(H.message||"\u7121\u6CD5\u6AA2\u67E5\u6A21\u578B\u80FD\u529B\u3002","danger",7e3)}finally{Me(ae,!1)}return}if(ee==="select-model"||ee==="clear-model"){let H=String(ae.dataset.model||""),ve=String(ae.dataset.role||"");try{ee==="select-model"?(await Q.selectOllamaModel(ke,{model:H,role:ve}),N(`\u5DF2\u8A2D\u5B9A ${ve==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\uFF1A${H}`,"ok")):(await Q.clearOllamaModel(ke,{model:H,role:ve}),N(`\u5DF2\u53D6\u6D88 ${ve==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\u3002`,"info")),await C()}catch(je){N(je.message||"\u6A21\u578B\u8A2D\u5B9A\u5931\u6557\u3002","danger")}}}),U.addEventListener("submit",async Y=>{let ae=Y.target.closest("form[data-ollama-form='host']");if(!ae)return;Y.preventDefault();let ee=new FormData(ae),ke=Number(ee.get("host_id")||0),H={name:String(ee.get("name")||"").trim(),url:String(ee.get("url")||"").trim(),port:Number(ee.get("port")||11434)};try{ke?(await Q.updateOllamaHost(ke,H),N("Ollama \u4E3B\u6A5F\u5DF2\u66F4\u65B0\u3002","ok")):(await Q.addOllamaHost(H),N("Ollama \u4E3B\u6A5F\u5DF2\u65B0\u589E\u3002","ok")),v=null,await C()}catch(ve){let je=ve.detail||ve.payload?.detail,xe=je?.errors?.join(" \xB7 ")||je?.message||ve.message||"\u5132\u5B58\u4E3B\u6A5F\u5931\u6557\u3002";N(xe,"danger",8e3)}}),W.addEventListener("click",()=>me());let V=()=>{a&&(a(),a=null)};return K.addEventListener("change",()=>{V(),K.checked&&(a=kt("status",(Y,ae)=>{s||me({quiet:!0,status:ae?.snapshot||null})}),me({quiet:!0}),N("\u5DF2\u555F\u7528\u5F8C\u7AEF\u63A8\u9001\u81EA\u52D5\u66F4\u65B0\uFF08\u6BCF 30 \u79D2\uFF09\u3002","info",2200))}),await se({quiet:!0}),t&&typeof t.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"),()=>{s=!0,ye(),V()}}var Ji="home",Na={home:{page:sn,title:"Judgment RAG Console \xB7 \u6CD5\u898F\u8207\u5224\u6C7A\u6AA2\u7D22"},rag:{page:kn,title:"RAG \u63D0\u554F \xB7 Judgment RAG Console"},data:{page:gn,title:"\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"},quality:{page:In,title:"\u8CC7\u6599\u54C1\u8CEA \xB7 Judgment RAG Console"},performance:{page:yn,title:"\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"},processing:{page:Nn,title:"\u8CC7\u6599\u8655\u7406 \xB7 Judgment RAG Console"},status:{page:Dn,title:"\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"},tests:{page:La,title:"\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"}},On=document.getElementById("app-main"),ja=null,Ta=0;function zn(){let t=window.location.hash.replace(/^#\/?/,"").trim().split("/")[0]||Ji;return Object.prototype.hasOwnProperty.call(Na,t)?t:Ji}function Lu(e){document.querySelectorAll("[data-route]").forEach(t=>{let s=t.dataset.route===e;t.classList.toggle("is-active",s),s?t.setAttribute("aria-current","page"):t.removeAttribute("aria-current")})}function ju(e){return`<section class="page">
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
          <span class="notice-icon" aria-hidden="true">${f("alert",12)}</span>
          <div class="notice-body">
            <strong>\u7121\u6CD5\u5EFA\u7ACB\u9801\u9762</strong>
            <p>${r(e.message||"\u672A\u77E5\u932F\u8AA4")}</p>
          </div>
        </div>
        <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
          <button class="btn btn-secondary btn-sm" type="button" id="route-retry">
            ${f("refresh",14)}<span>\u91CD\u65B0\u8F09\u5165</span>
          </button>
        </div>
      </div>
    </div>
  </section>`}async function Fn(){let e=zn(),t=++Ta;if(Lu(e),window.location.hash!==`#/${e}`&&window.history.replaceState(null,"",`#/${e}`),typeof ja=="function"){try{ja()}catch{}ja=null}document.title=Na[e].title;let s={route:e,navigate(a){Na[a]&&(window.location.hash=`#/${a}`)},setTitle(a){t===Ta&&a&&(document.title=a)}};try{let a=Na[e].page.render(On,s);or(),window.scrollTo({top:0,behavior:"auto"}),On.focus({preventScroll:!0});let n=await a;if(t!==Ta){typeof n=="function"&&n();return}ja=typeof n=="function"?n:null}catch(a){if(t!==Ta)return;console.error("Failed to render route",e,a),On.innerHTML=ju(a);let n=document.getElementById("route-retry");n&&n.addEventListener("click",()=>Fn()),N("\u9801\u9762\u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}}function Tu(){document.addEventListener("keydown",e=>{if(e.key!=="/"||e.metaKey||e.ctrlKey||e.altKey)return;let t=document.activeElement;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable))return;let a=zn(),n=a==="home"?"home-question":a==="rag"?"rag-question":"";if(!n)return;let i=document.getElementById(n);i&&(e.preventDefault(),i.focus())})}function Nu(){let e=document.querySelector('[data-route="processing"]');if(!e)return;let t=e.querySelector(".nav-update-badge");t||(t=document.createElement("span"),t.className="nav-update-badge",t.hidden=!0,e.appendChild(t));let s=async(a=null)=>{try{let n=a||await Q.updatesStatus(),i=Number(n.update_count)||0;i>0?(t.textContent=String(i),t.title=`\u6CD5\u898F\uFF0F\u547D\u4EE4\uFF0F\u5224\u6C7A\u6709 ${i} \u9805\u66F4\u65B0`,t.hidden=!1):t.hidden=!0}catch{t.hidden=!0}};s(),kt("updates",(a,n)=>s(n?.snapshot||null)),window.addEventListener("judgment:updates-changed",()=>s())}function Vi(){cr(),Tu(),Nu(),window.addEventListener("hashchange",Fn),Fn(),Ks()&&window.setTimeout(()=>{zn()==="rag"&&(window.location.hash="#/tests")},700)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Vi):Vi();})();
