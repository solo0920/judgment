(()=>{var Ui=Object.defineProperty;var Wt=(e,t)=>{for(var s in t)Ui(e,s,{get:t[s],enumerable:!0})};var Ca="judgment.api_base",Pa="http://127.0.0.1:9200",pt=class extends Error{constructor(t,s=0,a=null){super(t),this.name="ApiError",this.status=s,this.detail=a}};function Fn(e){return["localhost","127.0.0.1","::1","[::1]"].includes(e)}function Kt(e){let t=String(e??"").trim();if(!t||t==="/")return"";t=t.replace(/\/+$/,""),!/^https?:\/\//i.test(t)&&!t.startsWith("/")&&(t=`${Fn(t.split(":")[0])?"http":"https"}://${t}`);try{let s=new URL(t,window.location.href);return s.protocol!=="http:"&&s.protocol!=="https:"?"":`${s.origin}${s.pathname==="/"?"":s.pathname.replace(/\/+$/,"")}`}catch{return t}}function Ia(e){let t=Kt(e);if(!t)return!0;try{let s=new URL(t);return s.protocol==="http:"||s.protocol==="https:"}catch{return!1}}function Ba(){try{let e=new URLSearchParams(window.location.search);return e.has("api")?Kt(e.get("api")):null}catch{return null}}function Oa(){try{let e=window.localStorage.getItem(Ca);return e===null?null:Kt(e)}catch{return null}}function Da(){let e=window.JUDGMENT_CONFIG&&window.JUDGMENT_CONFIG.apiBase;return Kt(e||"")}function Yt(){let e=Ba();if(e!==null)return e;let t=Oa();if(t!==null)return t;let s=Da();return s||(window.location.protocol==="file:"?Pa:"")}function Qi(){if(Ba()!==null)return!0;let e=Oa();return e!==null?!!e:!!Da()}function Xt(){return Ba()!==null?"query":Oa()!==null?"storage":Da()?"config":window.location.protocol==="file:"?"file-default":"same-origin"}function Ws(){return Qi()||window.location.protocol==="file:"||!window.JUDGMENT_CONFIG?!1:!Fn(window.location.hostname)}function Fa(e){let t=Kt(e);try{t?window.localStorage.setItem(Ca,t):window.localStorage.removeItem(Ca)}catch{}return t}function os(e=Yt()){return e||"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"}function yt(e,t=Yt()){return t?`${t}${e.startsWith("/")?e:`/${e}`}`:e}function wt(e,t,{onError:s=null,onProgress:a=null}={}){let n=(Array.isArray(e)?e:[e]).map(c=>String(c||"").trim()).filter(Boolean);if(!n.length||typeof EventSource>"u")return()=>{};let i=new EventSource(yt(`/api/events/stream?topic=${encodeURIComponent(n.join(","))}`)),o=0;i.onopen=()=>{o+=1};let l=c=>{let v={};try{v=JSON.parse(c.data||"{}")}catch{v={}}v.initial&&o<=1&&!v.snapshot||t?.(v.topic||n[0],v)},d=c=>{let v={};try{v=JSON.parse(c.data||"{}")}catch{v={}}a?.(v.topic||n[0],v)};return i.addEventListener("refresh",l),i.addEventListener("progress",d),i.onerror=()=>{s?.()},()=>{i.removeEventListener("refresh",l),i.removeEventListener("progress",d),i.close()}}function za(e){return`\u7121\u6CD5\u9023\u7DDA\u5230\u4F3A\u670D\u5668${e?`\uFF08${e}\uFF09`:""}\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u662F\u5426\u555F\u52D5\uFF0C\u6216\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u8A2D\u5B9A\u5F8C\u7AEF\u4F4D\u5740\u3002`}async function ie(e,t={}){let s=Yt(),a=new AbortController,n=t.timeout===void 0?3e4:t.timeout,i=n>0?window.setTimeout(()=>a.abort(),n):null,o=Date.now(),l=performance.now(),d=t.requestId||zn(),c={Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},"X-Judgment-Request-Id":d,"X-Judgment-Client-Started-At":String(o),...t.headers||{}},v;try{v=await fetch(yt(e,s),{...t,headers:c,signal:a.signal})}catch(w){throw w.name==="AbortError"?new pt("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new pt(za(s),0,w)}finally{i&&window.clearTimeout(i)}let $=null;if((v.headers.get("content-type")||"").includes("application/json"))try{$=await v.json()}catch{$=null}else try{$=await v.text()}catch{$=null}let g=performance.now(),p=v.headers.get("X-Judgment-Request-Id")||d;if(t.trackClient!==!1&&p){let w=Math.round(performance.now()-l);window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{Hn({request_id:p,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:w,render_ms:Math.max(0,Math.round(performance.now()-g)),status:v.ok?"success":"failed"})})})}if(!v.ok){let w=$&&typeof $=="object"?$.detail||$.message:$,k=typeof w=="string"&&w?w:`\u4F3A\u670D\u5668\u56DE\u61C9 ${v.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new pt(k,v.status,w)}return $}function zn(){try{if(window.crypto&&typeof window.crypto.randomUUID=="function")return window.crypto.randomUUID().replace(/-/g,"").slice(0,32)}catch{}return`req${Date.now().toString(36)}${Math.random().toString(36).slice(2,10)}`}function Hn(e){try{fetch(yt("/api/performance/client",Yt()),{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e),keepalive:!0}).catch(()=>{})}catch{}}async function Un(e){let t=Kt(e);if(!Ia(t))throw new pt("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002");let s=performance.now(),a=new AbortController,n=window.setTimeout(()=>a.abort(),1e4);try{let i=await fetch(yt("/api/health",t),{headers:{Accept:"application/json"},signal:a.signal});if(!i.ok)throw new pt(`API \u56DE\u61C9 ${i.status}\u3002`,i.status);let o=await i.json();return{base:t,version:o.version||"\u2014",duration_ms:Math.round(performance.now()-s)}}catch(i){throw i instanceof pt?i:i.name==="AbortError"?new pt("\u9023\u7DDA\u6E2C\u8A66\u903E\u6642\uFF0C\u8ACB\u78BA\u8A8D API \u4F4D\u5740\u8207\u7DB2\u8DEF\u3002",0,i):new pt(za(t),0,i)}finally{window.clearTimeout(n)}}var U={health(){return ie("/api/health")},status(){return ie("/api/status",{trackClient:!1})},ollamaHosts(){return ie("/api/ollama/hosts",{timeout:3e4,trackClient:!1})},addOllamaHost(e){return ie("/api/ollama/hosts",{method:"POST",body:JSON.stringify(e),timeout:3e4,trackClient:!1})},updateOllamaHost(e,t){return ie(`/api/ollama/hosts/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},deleteOllamaHost(e){return ie(`/api/ollama/hosts/${encodeURIComponent(e)}`,{method:"DELETE",timeout:3e4,trackClient:!1})},activateOllamaHost(e){return ie(`/api/ollama/hosts/${encodeURIComponent(e)}/activate`,{method:"POST",timeout:3e4,trackClient:!1})},deactivateOllamaHosts(){return ie("/api/ollama/hosts/deactivate",{method:"POST",timeout:3e4,trackClient:!1})},reorderOllamaHosts(e){return ie("/api/ollama/hosts/reorder",{method:"POST",body:JSON.stringify({host_ids:e}),timeout:3e4,trackClient:!1})},checkOllamaCapabilities(){return ie("/api/ollama/hosts/capabilities/test",{method:"POST",timeout:18e4,trackClient:!1})},selectOllamaModel(e,t){return ie(`/api/ollama/hosts/${encodeURIComponent(e)}/models/select`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},clearOllamaModel(e,t){return ie(`/api/ollama/hosts/${encodeURIComponent(e)}/models/clear`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},systemUsage(){return ie("/api/system-usage",{trackClient:!1})},indexVersions(){return ie("/api/index-versions",{trackClient:!1})},indexVersion(e){return ie(`/api/index-versions/${encodeURIComponent(e)}`,{trackClient:!1})},validateIndexVersion(e){return ie(`/api/index-versions/${encodeURIComponent(e)}/validate`,{method:"POST",trackClient:!1})},activateIndexVersion(e){return ie(`/api/index-versions/${encodeURIComponent(e)}/activate`,{method:"POST",trackClient:!1})},rollbackIndexVersion(){return ie("/api/index-versions/rollback",{method:"POST",trackClient:!1})},reconcileIndexAlias(e=!1){let t=new URLSearchParams({repair:e?"true":"false"});return ie(`/api/index-alias/reconcile?${t.toString()}`,{trackClient:!1})},catalog(){return ie("/api/catalog")},judgmentStats(){return ie("/api/judgment-stats")},query({database:e,filters:t,page:s=1,pageSize:a=25}){return ie("/api/query",{method:"POST",body:JSON.stringify({database:e,filters:t,page:s,page_size:a})})},dataSuggest({kind:e,query:t="",limit:s=12}){let a=new URLSearchParams({kind:e,query:t,limit:String(s)});return ie(`/api/data/suggest?${a.toString()}`,{timeout:45e3,trackClient:!1})},schemaSuggest({database:e,table:t,column:s,query:a,limit:n=1e3}){let i=new URLSearchParams({database:e,table:t,column:s,q:a||"",limit:String(n)});return ie(`/api/schema/suggest?${i.toString()}`,{timeout:3e4})},lawDetail(e,t="",s="",a=""){let n=new URLSearchParams({law_key:e});return t&&n.set("source_type",t),s&&n.set("version_id",String(s)),a&&n.set("article_no",String(a)),ie(`/api/law?${n.toString()}`,{timeout:45e3})},judgmentDetail(e,t=""){let s=new URLSearchParams({jid:e});return t&&s.set("source",t),ie(`/api/judgment?${s.toString()}`,{timeout:45e3})},testMode(){return ie("/api/test-mode",{trackClient:!1})},llmModels(){return ie("/api/llm/models",{timeout:6e4,trackClient:!1})},testLlmModels(){return ie("/api/llm/models/test",{method:"POST",timeout:12e4,trackClient:!1})},rerankStatus(){return ie("/api/rerank/status",{timeout:6e4,trackClient:!1})},testReranker(){return ie("/api/rerank/test",{method:"POST",timeout:12e4,trackClient:!1})},selectLlmModel(e,t=null){return ie("/api/llm/model",{method:"POST",body:JSON.stringify({model:e,host_id:t}),timeout:3e4,trackClient:!1})},setTestMode(e){return ie("/api/test-mode",{method:"POST",body:JSON.stringify({enabled:!!e}),trackClient:!1})},testRuns(e=20){let t=new URLSearchParams({limit:String(e)});return ie(`/api/test-runs?${t.toString()}`,{trackClient:!1})},testRunCurrent(){return ie("/api/test-runs/current",{trackClient:!1})},testRun(e){return ie(`/api/test-runs/${encodeURIComponent(e)}`,{trackClient:!1})},performanceOptions(){return ie("/api/performance/options",{trackClient:!1})},performance(e={},t=1,s=25){let a=new URLSearchParams;for(let[n,i]of Object.entries(e))i==null||i===""||a.set(n,String(i));return a.set("page",String(t)),a.set("page_size",String(s)),ie(`/api/performance?${a.toString()}`,{timeout:45e3,trackClient:!1})},quality(){return ie("/api/quality",{timeout:18e4,trackClient:!1})},processing(){return ie("/api/processing",{timeout:45e3,trackClient:!1})},processingActive(){return ie("/api/processing/active",{timeout:3e3,trackClient:!1})},judgmentDownloadStatus(){return ie("/api/judgment-download/status",{timeout:3e4,trackClient:!1})},versioningSummary(){return ie("/api/versioning/summary",{trackClient:!1})},updatesStatus(){return ie("/api/updates/status",{trackClient:!1})},checkCourts(){return ie("/api/courts/check",{timeout:6e4,trackClient:!1})},checkLawVersions(){return ie("/api/law-versions/check",{timeout:6e4,trackClient:!1})},checkUpdates(e=[]){let t=Array.isArray(e)&&e.length?{source_types:e}:{};return ie("/api/updates/check",{method:"POST",body:JSON.stringify(t),timeout:12e4,trackClient:!1})},versioningSnapshots(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.limit&&t.set("limit",String(e.limit)),ie(`/api/versioning/judgments/snapshots?${t.toString()}`,{trackClient:!1})},versioningChanges(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit)),ie(`/api/versioning/judgments/changes?${t.toString()}`,{trackClient:!1})},versioningJudgment(e){return ie(`/api/versioning/judgments/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVersion(e){return ie(`/api/versioning/judgments/versions/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVector(e,t){return ie(`/api/versioning/judgments/${encodeURIComponent(e)}/vectors/${encodeURIComponent(t)}`,{trackClient:!1})},versioningAudit(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit||500)),ie(`/api/versioning/audit?${t.toString()}`,{trackClient:!1})},questionBankStats(){return ie("/api/question-bank/stats",{trackClient:!1})},questionBankItems(e={},t=50,s=0){let a=new URLSearchParams;for(let[n,i]of Object.entries(e))if(!(i==null||i==="")){if(Array.isArray(i)){for(let o of i)o==null||o===""||a.append(n,String(o));continue}a.set(n,String(i))}return a.set("limit",String(t)),a.set("offset",String(s)),ie(`/api/question-bank/items?${a.toString()}`,{timeout:45e3,trackClient:!1})},questionBankTags(e="",t=12){let s=new URLSearchParams({query:e,limit:String(t)});return ie(`/api/question-bank/tags?${s.toString()}`,{timeout:45e3,trackClient:!1})},questionBankItem(e){return ie(`/api/question-bank/items/${encodeURIComponent(e)}`,{timeout:45e3,trackClient:!1})},createQuestionBankItem(e){return ie("/api/question-bank/items",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},createQuestionBankItemWithAI(e){return ie("/api/question-bank/ai-items",{method:"POST",body:JSON.stringify(e),timeout:42e4,trackClient:!1})},updateQuestionBankItem(e,t){return ie(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteQuestionBankItem(e){return ie(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},restoreQuestionBankItem(e){return ie(`/api/question-bank/items/${encodeURIComponent(e)}/restore`,{method:"POST",timeout:45e3,trackClient:!1})},submitQuestionBankItemForReview(e){return ie(`/api/question-bank/items/${encodeURIComponent(e)}/submit`,{method:"POST",timeout:45e3,trackClient:!1})},reviewQuestionBankItem(e,t){return ie(`/api/question-bank/items/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},importQuestionBank(e){return ie("/api/question-bank/import",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},exportQuestionBank({status:e="accepted"}={}){let t=new URLSearchParams({status:e});return ie(`/api/question-bank/export?${t.toString()}`,{timeout:45e3,trackClient:!1})},revalidateQuestionBank(){return ie("/api/question-bank/revalidate",{method:"POST",body:JSON.stringify({}),timeout:12e4,trackClient:!1})},benchmarkReadyQuestions(e=200){return ie(`/api/question-bank/benchmark-ready?limit=${e}`,{timeout:45e3,trackClient:!1})},benchmarkSuites(){return ie("/api/benchmark/suites",{timeout:45e3,trackClient:!1})},benchmarkSuiteLatestAnswers(e){return ie(`/api/benchmark/suites/${encodeURIComponent(e)}/latest-answers`,{timeout:45e3,trackClient:!1})},removeBenchmarkSuiteItem(e,t){return ie(`/api/benchmark/suites/${encodeURIComponent(e)}/items/${encodeURIComponent(t)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},createBenchmarkSuite(e){return ie("/api/benchmark/suites",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},updateBenchmarkSuite(e,t){return ie(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteBenchmarkSuite(e){return ie(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},benchmarkRuns(e=20){return ie(`/api/benchmark/runs?limit=${e}`,{timeout:45e3,trackClient:!1})},startBenchmarkRun(e){return ie("/api/benchmark/runs",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},benchmarkRun(e,t=!0){return ie(`/api/benchmark/runs/${encodeURIComponent(e)}?include_cases=${t}`,{timeout:45e3,trackClient:!1})},stopBenchmarkRun(e){return ie(`/api/benchmark/runs/${encodeURIComponent(e)}/stop`,{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},reviewBenchmarkResult(e,t){return ie(`/api/benchmark/results/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},benchmarkModels(){return ie("/api/benchmark/models",{timeout:45e3,trackClient:!1})},benchmarkFingerprintHistory(e,t=50){return ie(`/api/benchmark/fingerprints/${encodeURIComponent(e)}?limit=${t}`,{timeout:45e3,trackClient:!1})},processingPlan(){return ie("/api/processing/plan",{timeout:45e3,trackClient:!1})},startProcessingWorkflow(e){return ie(`/api/processing/workflows/${encodeURIComponent(e)}/run`,{method:"POST",body:JSON.stringify({})})},startProcessingUpdate(e=!1){return ie("/api/processing/update",{method:"POST",body:JSON.stringify({index:!!e}),timeout:45e3,trackClient:!1})},stopProcessingUpdate(){return ie("/api/processing/stop",{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},rag(e,t={}){return ie("/api/rag/query",{method:"POST",body:JSON.stringify({question:e}),timeout:t.testMode?0:3e5})},async ragStream(e,{testMode:t=!1,onStep:s=null,onPartial:a=null,onToken:n=null,onTokenReset:i=null}={}){let o=Yt(),l=new AbortController,d=t?0:3e5,c=d>0?window.setTimeout(()=>l.abort(),d):null,v=Date.now(),$=performance.now(),h=zn(),g={Accept:"text/event-stream","Content-Type":"application/json","X-Judgment-Request-Id":h,"X-Judgment-Client-Started-At":String(v)},p;try{p=await fetch(yt("/api/rag/query/stream",o),{method:"POST",headers:g,body:JSON.stringify({question:e}),signal:l.signal})}catch(G){throw G.name==="AbortError"?new pt("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new pt(za(o),0,G)}finally{c&&window.clearTimeout(c)}if(!p.ok){let G=null;try{G=await p.json()}catch{G=null}let Y=G&&typeof G=="object"&&G.detail?String(G.detail):`\u4F3A\u670D\u5668\u56DE\u61C9 ${p.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new pt(Y,p.status,G)}if(!p.body)throw new pt("\u4F3A\u670D\u5668\u6C92\u6709\u56DE\u50B3\u53EF\u8B80\u53D6\u7684\u6D41\u7A0B\u4E32\u6D41\u3002",0,null);let w=p.body.getReader(),k=new TextDecoder,L="",E=null,T=null;try{for(;;){let{value:G,done:Y}=await w.read();if(Y)break;L+=k.decode(G,{stream:!0});let ye=L.indexOf(`

`);for(;ye>=0;){let Ae=L.slice(0,ye).replace(/\r/g,"");L=L.slice(ye+2);let J="message",B=[];for(let S of Ae.split(`
`))S.startsWith("event:")?J=S.slice(6).trim():S.startsWith("data:")&&B.push(S.slice(5).trimStart());if(B.length){let S=null;try{S=JSON.parse(B.join(`
`))}catch{S=null}if(S)if(J==="step"&&typeof s=="function")try{s(S)}catch{}else if(J==="partial"){if(typeof a=="function")try{a(S)}catch{}}else if(J==="token"){if(typeof n=="function")try{n(String(S.text||""))}catch{}}else if(J==="token_reset"){if(typeof i=="function")try{i()}catch{}}else J==="result"?E=S:J==="error"&&(T=new pt(S.message||S.detail||"RAG \u6D41\u7A0B\u5931\u6557\u3002",0,S))}ye=L.indexOf(`

`)}}}finally{try{await w.cancel()}catch{}c&&window.clearTimeout(c)}if(T)throw T;if(!E)throw new pt("\u6D41\u7A0B\u4E32\u6D41\u7D50\u675F\uFF0C\u4F46\u6C92\u6709\u6536\u5230\u6700\u7D42\u56DE\u7B54\u3002",0,null);let H=Math.round(performance.now()-$);return Hn({request_id:h,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:H,render_ms:0,status:"success"}),E&&typeof E=="object"&&(E._client_request_id=h),E}};var Qn="judgment.theme",Ha="nvidia",Ks=[{id:"vercel",name:"Vercel",description:"\u9ED1\u767D\u7CBE\u6E96 \xB7 Geist \xB7 \u5E7E\u4F55\u7559\u767D",swatches:["#0070f3","#171717","#fafafa"],metaColor:"#ffffff"},{id:"apple",name:"Apple",description:"SF Pro \xB7 \u5927\u5713\u89D2 \xB7 \u6C89\u6D78\u7559\u767D",swatches:["#0066cc","#1d1d1f","#f5f5f7"],metaColor:"#fbfbfd"},{id:"meta",name:"Meta",description:"Optimistic \xB7 \u660E\u4EAE\u85CD \xB7 \u81A0\u56CA\u5143\u4EF6",swatches:["#0064e0","#0091ff","#f1f4f7"],metaColor:"#ffffff"},{id:"nvidia",name:"NVIDIA",description:"GPU \u7DA0 \xB7 \u9ED1\u5E95 \xB7 \u92B3\u5229\u76F4\u89D2",swatches:["#76b900","#000000","#f7f7f7"],metaColor:"#000000"},{id:"ibm",name:"IBM",description:"Carbon \xB7 Plex Sans \xB7 \u4F01\u696D\u85CD",swatches:["#0f62fe","#161616","#f4f4f4"],metaColor:"#161616"},{id:"stripe",name:"Stripe",description:"\u7D2B\u975B\u6F38\u5C64 \xB7 \u7CBE\u5BC6\u91D1\u878D\u611F",swatches:["#635bff","#ea2261","#f6f9fc"],metaColor:"#ffffff"},{id:"linear",name:"Linear",description:"\u6DF1\u7A7A\u9ED1 \xB7 \u975B\u7D2B \xB7 \u6975\u7C21\u7DDA\u689D",swatches:["#17171d","#5e6ad2","#e8e8ec"],metaColor:"#010102"},{id:"figma",name:"Figma",description:"\u591A\u5F69\u8272\u584A \xB7 \u5354\u4F5C\u611F \xB7 \u85CD\u8272\u7126\u9EDE",swatches:["#0d99ff","#a259ff","#0acf83"],metaColor:"#ffffff"},{id:"notion",name:"Notion",description:"\u6696\u767D\u7D19\u5F35 \xB7 \u896F\u7DDA\u6A19\u984C \xB7 \u77E5\u8B58\u5EAB",swatches:["#0075de","#191918","#f7f6f3"],metaColor:"#ffffff"},{id:"openai",name:"OpenAI",description:"\u6696\u7070\u756B\u5E03 \xB7 \u9ED1\u8272\u884C\u52D5 \xB7 \u7DA0\u8272\u8A0A\u865F",swatches:["#10a37f","#0d0d0d","#f9f9f7"],metaColor:"#f9f9f7"}],Ua=new Map(Ks.map(e=>[e.id,e]));function Gi(e){return Ua.has(e)}function Ji(e){return Ua.get(e)||Ua.get(Ha)}function Qa(){try{let e=window.localStorage.getItem(Qn);return Gi(e)?e:Ha}catch{return Ha}}function Ga(e,{persist:t=!0}={}){let s=Ji(e);document.documentElement.dataset.theme=s.id;let a=document.getElementById("theme-color-meta");if(a&&a.setAttribute("content",s.metaColor),document.querySelectorAll(".theme-option").forEach(n=>{let i=n.dataset.themeId===s.id;n.classList.toggle("is-active",i),n.setAttribute("aria-checked",i?"true":"false")}),t)try{window.localStorage.setItem(Qn,s.id)}catch{}return window.dispatchEvent(new CustomEvent("judgment:theme",{detail:{theme:s.id}})),s}var Vi={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},Wi={operational:{label:"\u6B63\u5E38",tone:"ok"},success:{label:"\u6210\u529F",tone:"ok"},ok:{label:"\u6B63\u5E38",tone:"ok"},healthy:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},warning:{label:"\u6CE8\u610F",tone:"warn"},empty:{label:"\u7121\u8CC7\u6599",tone:"warn"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},running:{label:"\u57F7\u884C\u4E2D",tone:"info"},pending:{label:"\u7B49\u5F85",tone:"idle"},skipped:{label:"\u7565\u904E",tone:"idle"},partial:{label:"\u90E8\u5206\u6210\u529F",tone:"warn"},preview:{label:"\u9810\u89BD\u6A21\u5F0F",tone:"info"},retrieval_only:{label:"\u50C5\u6AA2\u7D22\u7D50\u679C",tone:"warn"},not_indexed:{label:"\u5C1A\u672A\u7D22\u5F15",tone:"warn"},missing_query:{label:"\u7B49\u5F85\u67E5\u8A62",tone:"idle"},client_side:{label:"\u700F\u89BD\u5668\u7AEF",tone:"info"},not_configured:{label:"\u672A\u8A2D\u5B9A",tone:"idle"},unavailable:{label:"\u96E2\u7DDA",tone:"danger"},failed:{label:"\u5931\u6557",tone:"danger"},error:{label:"\u932F\u8AA4",tone:"danger"}},Ki={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},Yi={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},Gn={search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',send:'<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',refresh:'<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 4v5.5H15"/>',copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',check:'<path d="m5 12 4.2 4.2L19 6.5"/>',plus:'<path d="M12 5v14M5 12h14"/>',edit:'<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m13.5 7.5 3 3"/>',trash:'<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v5M14 11v5"/>',upload:'<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>',x:'<path d="m6 6 12 12M18 6 6 18"/>',external:'<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/>',message:'<path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H6l-3 2 1.3-4.2A8.5 8.5 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',history:'<path d="M3.2 12a8.8 8.8 0 1 0 2.8-6.3L3.2 8.5"/><path d="M3 3.5v5h5"/><path d="M12 7.5V12l3 1.8"/>',database:'<ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/><path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/>',layers:'<path d="m12 3 9 4.8-9 4.8-9-4.8L12 3Z"/><path d="m3 12.2 9 4.8 9-4.8"/><path d="m3 16.7 9 4.8 9-4.8"/>',cube:'<path d="m12 2.8 8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4L12 2.8Z"/><path d="m3.8 7.4 8.2 4.6 8.2-4.6"/><path d="M12 12v9.2"/>',browser:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6.5 6.5h.01"/>',download:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',chevronLeft:'<path d="m14.5 5-7 7 7 7"/>',chevronRight:'<path d="m9.5 5 7 7-7 7"/>',chevronDown:'<path d="m5 9 7 7 7-7"/>',arrowRight:'<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',alert:'<path d="M12 3 2.5 20.5h19L12 3Z"/><path d="M12 9v4.5"/><path d="M12 17.5h.01"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',sparkles:'<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"/>',table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M9 9.5V20M15 9.5V20"/>',sliders:'<path d="M4 7h8M16 7h4M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',palette:'<path d="M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h4a5 5 0 0 0 0-10h-4Z"/><circle cx="7.5" cy="10.5" r=".8" fill="currentColor" stroke="none"/><circle cx="10" cy="6.8" r=".8" fill="currentColor" stroke="none"/><circle cx="14.5" cy="6.8" r=".8" fill="currentColor" stroke="none"/>',server:'<rect x="3" y="4" width="18" height="6" rx="1.6"/><rect x="3" y="14" width="18" height="6" rx="1.6"/><path d="M7 7h.01M7 17h.01"/>',brain:'<path d="M9.7 4.2a2.8 2.8 0 0 0-3 2.8 2.8 2.8 0 0 0-1.1 5.2A2.9 2.9 0 0 0 7.8 18a2.9 2.9 0 0 0 3.9 2V4.2a2.8 2.8 0 0 0-2 0Z"/><path d="M14.3 4.2a2.8 2.8 0 0 1 3 2.8 2.8 2.8 0 0 1 1.1 5.2A2.9 2.9 0 0 1 16.2 18a2.9 2.9 0 0 1-3.9 2"/>',cloud:'<path d="M7 18.5h10.5a3.5 3.5 0 0 0 .4-7 5.5 5.5 0 0 0-10.6-1.3A4.2 4.2 0 0 0 7 18.5Z"/>',code:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',play:'<path d="M7 4.5v15l13-7.5-13-7.5Z"/>',file:'<path d="M6 2.8h8l4.5 4.5v13.9H6V2.8Z"/><path d="M14 2.8V7.5h5"/>',activity:'<path d="M3 12h4l2.2-5 4.1 10 2.2-5H21"/>',shield:'<path d="M12 2.8 20 6v6c0 4.7-3.2 8-8 9.2C7.2 20 4 16.7 4 12V6l8-3.2Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',terminal:'<path d="m5 7 5 5-5 5"/><path d="M12 17h7"/>',filter:'<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',link:'<path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10.2 5.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-1.4 1.4a5 5 0 0 0 7.1 7.1l1.2-1.2"/>',grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',pin:'<path d="M9 3.5h6l-1.1 5 2.6 2.6v2.4H7.5v-2.4L10.1 8.5 9 3.5Z"/><path d="M12 13.5v7"/>',more:'<circle cx="4.2" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="19.8" cy="12" r="2.6" fill="currentColor" stroke="none"/>',folder:'<path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h3.7l2 2H18a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5v-9Z"/>',cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9.5 9.5h5v5h-5z"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>'};function r(e){return String(e??"").replace(/[&<>"']/g,t=>Vi[t])}function m(e,t=16,s=""){let a=Gn[e]||Gn.info;return`<svg${s?` class="${r(s)}"`:""} width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a}</svg>`}function u(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?new Intl.NumberFormat("zh-TW").format(s):t}function Ne(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=["B","KB","MB","GB","TB"],a=0;for(;t>=1024&&a<s.length-1;)t/=1024,a+=1;return a===0?`${t.toFixed(0)} B`:`${t.toFixed(1)} ${s[a]}`}function Ja(e){if(e instanceof Date)return e;if(typeof e=="number"){let n=new Date(e);return Number.isNaN(n.getTime())?null:n}let t=String(e??"").trim();if(!t)return null;if(/^\d{8}$/.test(t))return new Date(Number(t.slice(0,4)),Number(t.slice(4,6))-1,Number(t.slice(6,8)));let s=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(t),a=new Date(s?`${t}Z`:t);return Number.isNaN(a.getTime())?null:a}function It(e){let t=Ja(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit"}).format(t):e?r(e):"\u2014"}function qe(e){let t=Ja(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1}).format(t):e?r(e):"\u2014"}function js(e){let t=Ja(e);if(!t)return"";let s=Date.now()-t.getTime();return s<45e3?"\u525B\u525B":s<36e5?`${Math.max(1,Math.round(s/6e4))} \u5206\u9418\u524D`:s<864e5?`${Math.round(s/36e5)} \u5C0F\u6642\u524D`:s<6048e5?`${Math.round(s/864e5)} \u5929\u524D`:It(t)}function me(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;if(t<6e4)return`${(t/1e3).toFixed(1)} s`;let s=Math.floor(t/6e4),a=Math.round(t%6e4/1e3);return`${s}m ${a}s`}function Bt(e){return Wi[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function Je(e,t){let s=Bt(e);return`<span class="badge ${Ki[s.tone]}"><span class="status-dot ${Yi[s.tone]}"></span>${r(t||s.label)}</span>`}function Xi(e){return e==="law"?'<span class="badge badge-info">\u6CD5\u898F</span>':e==="order"?'<span class="badge badge-neutral">\u547D\u4EE4</span>':e?`<span class="badge badge-neutral">${r(e)}</span>`:'<span class="cell-empty">\u2014</span>'}function Ys(e,t){let s=String(e??"");return s.length>t?`${s.slice(0,t)}\u2026`:s}function Xs(e,t="text"){if(e==null||e==="")return'<span class="cell-empty">\u2014</span>';switch(t){case"boolean":return e?'<span class="badge badge-ok">\u662F</span>':'<span class="badge badge-neutral">\u5426</span>';case"status":return Je(String(e));case"source":return Xi(String(e));case"number":return`<span class="mono">${u(e)}</span>`;case"duration":return`<span class="mono">${me(e)}</span>`;case"datetime":return`<span class="mono">${qe(e)}</span>`;case"date":return`<span class="mono">${It(e)}</span>`;case"url":{let s=String(e),a=Ys(s.replace(/^https?:\/\//,""),46);return`<span class="cell-url"><a href="${r(s)}" target="_blank" rel="noopener noreferrer" title="${r(s)}">${m("external",10)}${r(a)}</a></span>`}case"mono":{let s=String(e);return`<span class="cell-mono cell-truncate" title="${r(s)}">${r(Ys(s,54))}</span>`}case"longtext":{let s=String(e);return`<span class="cell-truncate" title="${r(s)}">${r(Ys(s,100))}</span>`}default:{let s=String(e);return`<span class="cell-truncate" title="${r(s)}">${r(Ys(s,90))}</span>`}}}function Ee({tone:e="info",title:t,text:s,iconName:a="info"}){let n=e==="ok"?"check":e==="danger"||e==="warn"?"alert":"i";return`<div class="notice notice-${e}" role="status">
    <span class="notice-icon" aria-hidden="true">${n==="i"?"i":m(n,12)}</span>
    <div class="notice-body">
      ${t?`<strong>${r(t)}</strong>`:""}
      ${s?`<p>${s}</p>`:""}
    </div>
  </div>`}function ct({iconName:e="search",title:t,text:s="",actions:a="",className:n=""}){return`<div class="empty-state ${n}">
    <span class="empty-icon">${m(e,24)}</span>
    <h3 class="empty-title">${r(t)}</h3>
    ${s?`<p class="empty-text">${s}</p>`:""}
    ${a?`<div class="empty-actions">${a}</div>`:""}
  </div>`}function ke(e,t,s="\u8655\u7406\u4E2D\u2026"){e&&(t?(e.dataset.idleHtml||(e.dataset.idleHtml=e.innerHTML),e.disabled=!0,e.classList.add("is-loading"),e.innerHTML=`<span class="spinner" aria-hidden="true"></span><span>${r(s)}</span>`):(e.disabled=!1,e.classList.remove("is-loading"),e.dataset.idleHtml&&(e.innerHTML=e.dataset.idleHtml,delete e.dataset.idleHtml)))}function M(e,t="info",s=4200){let a=document.getElementById("toast-region");if(!a)return null;let n={info:"i",ok:"\u2713",warn:"!",danger:"\xD7"},i=document.createElement("div");i.className=`toast toast-${t}`,i.setAttribute("role",t==="danger"?"alert":"status"),i.innerHTML=`<span class="toast-mark" aria-hidden="true">${n[t]||"i"}</span>
    <div class="toast-body">${r(e)}</div>
    <button class="toast-close" type="button" aria-label="\u95DC\u9589\u901A\u77E5">\xD7</button>`;let o=()=>{i.isConnected&&(i.classList.add("is-leaving"),window.setTimeout(()=>i.remove(),190))};return i.querySelector(".toast-close").addEventListener("click",o),a.appendChild(i),s>0&&window.setTimeout(o,s),i}async function fs(e){try{return await navigator.clipboard.writeText(e),!0}catch{let s=document.createElement("textarea");s.value=e,s.setAttribute("readonly",""),s.style.position="fixed",s.style.opacity="0",document.body.appendChild(s),s.select();let a=!1;try{a=document.execCommand("copy")}catch{a=!1}return s.remove(),a}}function Ot(e,t,s="text/plain;charset=utf-8"){let a=new Blob([t],{type:s}),n=URL.createObjectURL(a),i=document.createElement("a");i.href=n,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(n),1e3)}var Zs="judgment.fontSizes.v1",Xa="judgment.appearance",Xn=new Set(["light","dark","system"]),Jn="light",Ts=window.matchMedia("(prefers-color-scheme: dark)"),Zi="font-size",Es=[{id:"page-title",label:"\u9801\u9762\u6A19\u984C",hint:"\u5404\u9801\u6700\u4E0A\u65B9\u7684 h1 \u6A19\u984C",selectors:[".page-title"],defaultPx:40,min:20,max:72},{id:"home-title",label:"\u9996\u9801\u4E3B\u8996\u89BA\u6A19\u984C",hint:"\u9996\u9801\u6700\u5927\u7684\u4E3B\u6A19\u984C",selectors:[".home-title"],defaultPx:88,min:40,max:140},{id:"section-title",label:"\u5340\u584A\u6A19\u984C",hint:"\u5831\u8868\u3001\u5361\u7247\u8207\u5340\u584A\u6A19\u984C",selectors:[".section-title",".report-title",".side-card-title",".filter-title",".tests-card-title",".status-sidebar-title",".judgment-dialog-head h2"],defaultPx:16,min:10,max:36},{id:"body",label:"\u5167\u6587\u8207\u8AAA\u660E",hint:"\u6BB5\u843D\u3001\u56DE\u7B54\u3001\u8AAA\u660E\u8207\u6458\u8981\u6587\u5B57",selectors:[".answer-text",".page-subtitle",".report-sub",".home-lead",".empty-text",".notice-body p",".citation-snippet",".side-card-body",".detail-list",".field-help",".report-empty-inline",".processing-section-sub",".summary-value-text",".status-summary",".warnings",".law-dialog-warning"],defaultPx:14,min:8,max:28},{id:"table",label:"\u8868\u683C\u5167\u5BB9",hint:"\u8CC7\u6599\u8868\u683C\u7684\u8868\u982D\u8207\u5132\u5B58\u683C",selectors:[".data-table th",".data-table td"],defaultPx:12,min:8,max:24},{id:"meta",label:"\u6A19\u7C64\u8207\u8F14\u52A9\u6587\u5B57",hint:"badge\u3001chip\u3001\u6B04\u4F4D\u6A19\u7C64\u8207 metadata",selectors:[".badge",".chip",".citation-meta",".citation-index",".answer-section-label",".report-kicker",".report-section-title",".eyebrow",".field-label",".summary-label",".metric-label",".footer-bottom",".nav-update-badge"],defaultPx:10,min:7,max:20},{id:"button",label:"\u6309\u9215\u8207\u5C0E\u89BD",hint:"\u64CD\u4F5C\u6309\u9215\u3001\u9801\u9996\u5C0E\u89BD\u8207\u9023\u7D50",selectors:[".btn",".nav-link",".page-btn",".law-link",".judgment-link",".theme-option-name",".theme-option-desc"],defaultPx:13,min:9,max:24},{id:"form",label:"\u8868\u55AE\u8207\u8F38\u5165",hint:"\u8F38\u5165\u6846\u3001\u4E0B\u62C9\u9078\u55AE\u8207 textarea",selectors:["input","textarea","select",".input",".field-input"],defaultPx:14,min:9,max:28},{id:"mono",label:"\u7A0B\u5F0F\u78BC\u8207\u6578\u503C",hint:"\u7B49\u5BEC\u6587\u5B57\u3001\u67E5\u8A62\u8A9E\u53E5\u8207\u7D71\u8A08\u6578\u503C",selectors:[".mono",".cell-mono",".cell-number",".query-code","code",".metric-value",".summary-value",".perf-stat-value",".mini-stat-value"],defaultPx:13,min:8,max:30},{id:"law-page",label:"\u6CD5\u898F\u689D\u6587\uFF08\u9801\u9762\uFF09",hint:"\u6CD5\u898F\u6AA2\u7D22\u7D50\u679C\u8207\u6CD5\u898F\u4F86\u6E90\u5361\u689D\u6587",selectors:[".law-answer-article-text",".law-answer-article-no",".law-source-article-text",".law-source-article-no",".law-article-text",".law-article-no"],excludeAncestors:[".law-dialog"],defaultPx:12,min:9,max:28},{id:"law-dialog",label:"\u6CD5\u898F\u689D\u6587\uFF08\u5F48\u51FA\u8996\u7A97\uFF09",hint:"\u6309\u4E0B\u689D\u6587\u5F8C\u958B\u555F\u7684\u6CD5\u898F dialog",selectors:[".law-dialog .law-article-text",".law-dialog .law-article-no",".law-dialog .law-chapter"],defaultPx:16,min:10,max:32},{id:"judgment-dialog",label:"\u5224\u6C7A\u5168\u6587\uFF08\u5F48\u51FA\u8996\u7A97\uFF09",hint:"\u5224\u6C7A\u539F\u6587 dialog \u7684\u5168\u6587\u5340\u584A",selectors:[".judgment-dialog-text"],defaultPx:23,min:12,max:48}],hs=new Map(Es.map(e=>[e.id,e])),Ns=new WeakMap,Ut=sr(),vt={...Ut},Qt=er(),Va=new Set,vs=null,bs=null,mt=null,ls=null,Vn=null,Zt=Zi,es=!1,Wa=null,Ka=!1,ea="";function Zn(e,t,s){return Math.min(s,Math.max(t,e))}function Za(e){return Math.round(e*10)/10}function sa(e){return Number.isInteger(e)?String(e):e.toFixed(1)}function er(){try{let e=window.localStorage.getItem(Xa);return Xn.has(e)?e:Jn}catch{return Jn}}function eo(){return Qt==="system"?Ts.matches?"dark":"light":Qt}function tr(){document.querySelectorAll("[data-appearance-option]").forEach(e=>{let t=e.dataset.appearanceOption===Qt;e.classList.toggle("is-active",t),e.setAttribute("aria-pressed",t?"true":"false")})}function ta({persist:e=!1}={}){if(document.documentElement.dataset.appearance=eo(),document.documentElement.dataset.appearanceMode=Qt,tr(),e)try{window.localStorage.setItem(Xa,Qt)}catch{}}function to(e){Xn.has(e)&&(Qt=e,ta({persist:!0}))}function Wn(){Qt==="system"&&ta()}typeof Ts.addEventListener=="function"?Ts.addEventListener("change",Wn):typeof Ts.addListener=="function"&&Ts.addListener(Wn);function sr(){let e=null;try{e=JSON.parse(window.localStorage.getItem(Zs)||"null")}catch{e=null}if(!e||typeof e!="object"||Array.isArray(e))return{};let t={};for(let s of Es){let a=Number(e[s.id]);Number.isFinite(a)&&(t[s.id]=Za(Zn(a,s.min,s.max)))}return t}function so(){try{return Object.keys(Ut).length?window.localStorage.setItem(Zs,JSON.stringify(Ut)):window.localStorage.removeItem(Zs),!0}catch{return!1}}function Cs(e){let t=new Set;for(let s of e.selectors)document.querySelectorAll(s).forEach(a=>{a.closest(".settings-sidebar")||Array.isArray(e.excludeAncestors)&&e.excludeAncestors.some(n=>a.closest(n))||t.add(a)});return Array.from(t)}function ar(){if(!ea)return;let e=hs.get(ea);if(e)for(let t of Cs(e))t.classList.add("font-size-highlight")}function nr(e){if($s(),!hs.get(e))return;ea=e;let s=mt.querySelector(`.font-size-row[data-font-group="${e}"]`);s&&s.classList.add("is-previewing"),ar()}function $s(){ea="",mt.querySelectorAll(".font-size-row.is-previewing").forEach(e=>e.classList.remove("is-previewing")),document.querySelectorAll(".font-size-highlight").forEach(e=>e.classList.remove("font-size-highlight"))}function ao(e){if(Ns.has(e))return Ns.get(e);let t={inline:e.style.fontSize||"",computed:parseFloat(window.getComputedStyle(e).fontSize)||0};return Ns.set(e,t),t}function no(e){let t=Ns.get(e);t&&(t.inline?e.style.fontSize=t.inline:e.style.removeProperty("font-size"))}function ro(e){let t=vt[e.id];if(Number.isFinite(t))for(let s of Cs(e))ao(s),s.style.fontSize=`${t}px`}function io(e){for(let t of Cs(e))no(t)}function ts(){for(let e of Va){let t=hs.get(e);t&&io(t)}Va=new Set;for(let e of Es)Number.isFinite(vt[e.id])&&(ro(e),Va.add(e.id));ar()}function rr(){ts(),es&&Zt==="font-size"&&Rs()}function ir(){Ka||(Ka=!0,window.requestAnimationFrame(()=>{Ka=!1,ts()}))}function oo(){Wa||!document.body||(Wa=new MutationObserver(e=>{if(Object.keys(vt).length){for(let t of e)if(t.type==="childList"&&(t.addedNodes.length||t.removedNodes.length)){ir();return}}}),Wa.observe(document.body,{childList:!0,subtree:!0}))}function lo(e){let t=e.filter(s=>typeof s.getClientRects=="function"&&s.getClientRects().length);return t.length?t:e}function co(){let e=Es.filter(t=>Cs(t).length>0||Number.isFinite(vt[t.id]));return e.length?e:Es}function aa(e){let t=vt[e.id];if(Number.isFinite(t))return t;let a=lo(Cs(e)).map(o=>{let l=Ns.get(o);return l&&l.computed?l.computed:parseFloat(window.getComputedStyle(o).fontSize)||0}).filter(o=>o>0).sort((o,l)=>o-l);if(!a.length)return e.defaultPx;let n=Math.floor(a.length/2),i=a.length%2?a[n]:(a[n-1]+a[n])/2;return Za(i)}function uo(){let e=[{id:"font-size",label:"\u5B57\u578B\u5927\u5C0F",hint:"\u8ABF\u6574\u5404\u6587\u5B57\u5340\u584A",glyph:'<span class="settings-option-aa" aria-hidden="true">Aa</span>'},{id:"theme",label:"\u4ECB\u9762\u98A8\u683C",hint:"\u5207\u63DB\u54C1\u724C\u8996\u89BA\u8A9E\u8A00",glyph:m("palette",15)}];ls.innerHTML=e.map(t=>`<button class="settings-option${Zt===t.id?" is-active":""}" type="button" role="tab"
        data-settings-panel="${t.id}"
        aria-selected="${Zt===t.id?"true":"false"}">
        <span class="settings-option-icon">${t.glyph}</span>
        <span class="settings-option-copy">
          <strong>${r(t.label)}</strong>
          <small>${r(t.hint)}</small>
        </span>
        ${m("chevronRight",12,"settings-option-chevron")}
      </button>`).join("")}function Rs(){$s();let e=co(),t=e.map(s=>{let a=sa(aa(s));return`<section class="font-size-row" data-font-group="${s.id}">
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
    </section>`}).join("");mt.innerHTML=`<div class="settings-panel-head">
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
    </div>`}function po(){$s();let e=Qa(),t=Ks.map((n,i)=>{let o=n.swatches.map(l=>`<i style="--swatch:${r(l)}"></i>`).join("");return`<button class="theme-option${n.id===e?" is-active":""}" type="button" role="menuitemradio"
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
          aria-pressed="${Qt===n.id?"true":"false"}"
          title="${n.id==="system"?"\u8DDF\u96A8\u7CFB\u7D71\u660E\u6697":`${n.label}\u8272\u6A21\u5F0F`}">${n.label}</button>`).join("")}
  </div>`;mt.innerHTML=`<div class="settings-panel-head">
      <div>
        <h3>\u4ECB\u9762\u98A8\u683C</h3>
        <p>\u9078\u64C7\u4E3B\u63A7\u53F0\u7684\u54C1\u724C\u8996\u89BA\u8A9E\u8A00\uFF1B\u4E3B\u984C\u6703\u7ACB\u5373\u5957\u7528\u4E26\u4FDD\u7559\u3002</p>
      </div>
      <div class="settings-panel-head-actions">
        <span class="badge badge-info">${Ks.length} \u7A2E</span>
        ${a}
      </div>
    </div>
    <div class="settings-theme-list" role="menu" aria-label="\u4ECB\u9762\u98A8\u683C">${t}</div>`,tr()}function mo(){ls.querySelectorAll("[data-settings-panel]").forEach(e=>{let t=e.dataset.settingsPanel===Zt;e.classList.toggle("is-active",t),e.setAttribute("aria-selected",t?"true":"false")})}function en(e=Zt){Zt=e==="theme"?"theme":"font-size",mo(),Zt==="theme"?po():Rs()}function Kn(e,t,s){let a=Number(t);if(!Number.isFinite(a))return;let n=Za(Zn(a,e.min,e.max));vt[e.id]=n;let i=s?.querySelector(".font-size-slider");i&&(i.value=String(n));let o=s?.querySelector(".font-size-preview");o&&(o.style.fontSize=`${n}px`),ir()}function go(){mt.querySelectorAll(".font-size-row").forEach(e=>{let t=hs.get(e.dataset.fontGroup);if(!t)return;let s=vt[t.id]??aa(t),a=e.querySelector(".font-size-number-input");a&&(a.value=sa(s));let n=e.querySelector(".font-size-slider");n&&(n.value=String(s));let i=e.querySelector(".font-size-preview");i&&(i.style.fontSize=`${s}px`)})}function Yn(e){let t=e.target.closest(".font-size-row");if(!t)return;let s=hs.get(t.dataset.fontGroup);if(!s)return;let a=e.target.classList.contains("font-size-number-input");if(!(a&&e.target.value==="")){if(e.type==="input"&&a){let n=Number(e.target.value);if(!Number.isFinite(n))return;Kn(s,n,t);return}if(Kn(s,e.target.value,t),e.type==="input"){let n=t.querySelector(".font-size-number-input");n&&document.activeElement!==n&&(n.value=sa(vt[s.id]??aa(s)))}}}function fo(e){if(!e.target.classList.contains("font-size-number-input"))return;let t=e.target.closest(".font-size-row"),s=t?hs.get(t.dataset.fontGroup):null;if(!s)return;let a=vt[s.id]??aa(s);e.target.value=sa(a)}function bo(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||nr(t.dataset.fontGroup)}function vo(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||$s()}function ho(e){let t=e.target.closest(".font-size-row");t&&nr(t.dataset.fontGroup)}function $o(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||$s()}function yo(e){let t=e.target.closest("[data-settings-panel]");if(t){en(t.dataset.settingsPanel);return}let s=e.target.closest("[data-settings-action]");if(s){let i=s.dataset.settingsAction;if(i==="save"){Ut={...vt};let o=so();go(),M(o?"\u5B57\u578B\u5927\u5C0F\u5DF2\u5132\u5B58\u3002":"\u5B57\u578B\u5927\u5C0F\u5DF2\u5957\u7528\uFF0C\u4F46\u700F\u89BD\u5668\u7121\u6CD5\u5132\u5B58\u8A2D\u5B9A\u3002",o?"ok":"warn");return}if(i==="cancel"){vt={...Ut},ts(),Rs(),M("\u5DF2\u53D6\u6D88\u672A\u5132\u5B58\u7684\u5B57\u578B\u8B8A\u66F4\u3002","info");return}i==="reset"&&(vt={},ts(),Rs(),M("\u5DF2\u56DE\u5FA9\u9810\u8A2D\u5B57\u578B\uFF1B\u6309\u300C\u5132\u5B58\u300D\u4FDD\u7559\u8B8A\u66F4\u3002","info"));return}let a=e.target.closest("[data-appearance-option]");if(a){to(a.dataset.appearanceOption);return}let n=e.target.closest(".theme-option");n&&Ga(n.dataset.themeId)}function wo(){es||(es=!0,vt={...Ut},document.body.classList.add("settings-open"),vs.removeAttribute("inert"),vs.setAttribute("aria-hidden","false"),bs.setAttribute("aria-expanded","true"),en(Zt),ts(),window.requestAnimationFrame(()=>{let e=ls.querySelector(".settings-option.is-active")||ls.querySelector(".settings-option");e&&e.focus({preventScroll:!0})}))}function Ya({restoreFocus:e=!0}={}){es&&(es=!1,$s(),vt={...Ut},ts(),document.body.classList.remove("settings-open"),e&&bs.focus({preventScroll:!0}),vs.setAttribute("aria-hidden","true"),vs.setAttribute("inert",""),bs.setAttribute("aria-expanded","false"))}function or(){vs=document.getElementById("settings-sidebar"),bs=document.getElementById("settings-trigger"),mt=document.getElementById("settings-panel"),ls=document.getElementById("settings-options"),Vn=document.getElementById("settings-close"),!(!vs||!bs||!mt||!ls)&&(ta(),Ga(Qa(),{persist:!1}),uo(),Rs(),oo(),ts(),bs.addEventListener("click",()=>{es?Ya():wo()}),Vn?.addEventListener("click",()=>Ya()),ls.addEventListener("click",e=>{let t=e.target.closest("[data-settings-panel]");t&&en(t.dataset.settingsPanel)}),mt.addEventListener("click",yo),mt.addEventListener("input",Yn),mt.addEventListener("change",Yn),mt.addEventListener("blur",fo,!0),mt.addEventListener("pointerover",bo),mt.addEventListener("pointerout",vo),mt.addEventListener("focusin",ho),mt.addEventListener("focusout",$o),mt.addEventListener("keydown",e=>{e.key==="Enter"&&e.target.classList.contains("font-size-number-input")&&(e.preventDefault(),e.target.blur())}),document.addEventListener("keydown",e=>{e.key==="Escape"&&es&&Ya()}),window.addEventListener("storage",e=>{if(e.key===Xa){Qt=er(),ta();return}e.key===Zs&&(Ut=sr(),es||(vt={...Ut},ts()))}))}var tn={};Wt(tn,{render:()=>So});function _o(e){let t=e&&typeof e=="object"?e:{},s=t.judgment_total,a=t.financial_total,n=Number(s),i=Number(a),o=s!=null&&Number.isFinite(n)&&n>=0,l=a!=null&&Number.isFinite(i)&&i>=0;return{total:o?n:null,financial:l?i:null,ratio:o&&l&&n>0?i/n*100:null}}function Dt(e,{loading:t=!1}={}){let s=_o(e),a=t?"\u8B80\u53D6\u4E2D\u2026":u(s.total),n=t?"\u8B80\u53D6\u4E2D\u2026":u(s.financial),i=t?"\u8B80\u53D6\u4E2D\u2026":s.ratio===null?"\u2014":`${s.ratio.toFixed(1)}%`;return`<div class="processing-summary-card">
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
  </div>`}var lr=[{route:"rag",icon:"message",kicker:"RAG",title:"RAG \u63D0\u554F",summary:"\u7528\u81EA\u7136\u8A9E\u8A00\u627E\u5230\u6CD5\u898F\u8207\u5224\u6C7A\uFF0C\u7B54\u6848\u9644\u4E0A\u53EF\u56DE\u6EAF\u7684\u5F15\u7528\u4F86\u6E90\u3002",description:"Qdrant \u5411\u91CF\u6AA2\u7D22\u3001LLM \u751F\u6210\u56DE\u7B54\u3001\u5F15\u7528\u9A57\u8B49\u8207 pipeline waterfall\uFF0C\u90FD\u5728\u540C\u4E00\u500B\u5DE5\u4F5C\u5340\u5B8C\u6210\u3002",metric:"Citations first",tone:"feature"},{route:"data",icon:"database",kicker:"EXPLORE",title:"\u8CC7\u6599\u5EAB\u67E5\u8A62",summary:"\u8DE8 PostgreSQL\u3001Parquet\u3001Qdrant \u8207 IndexedDB \u63A2\u7D22\u8CC7\u6599\u3002",description:"\u4EE5 metadata\u3001SQL \u6216\u8A9E\u610F\u67E5\u8A62\u6AA2\u8996\u8CC7\u6599\u8868\uFF0C\u652F\u63F4\u5206\u9801\u3001\u6392\u5E8F\u8207 CSV\uFF0FJSON \u532F\u51FA\u3002",metric:"4 \u7A2E\u8CC7\u6599\u4F86\u6E90",tone:"blue"},{route:"quality",icon:"shield",kicker:"QUALITY",title:"\u8CC7\u6599\u54C1\u8CEA",summary:"\u7528 DuckDB \u76F4\u63A5\u6AA2\u67E5\u539F\u59CB\u5224\u6C7A\u8CC7\u6599\u7684\u5B8C\u6574\u6027\u3002",description:"\u6AA2\u67E5\u91CD\u8907\u3001\u7F3A\u6F0F\u3001\u5F15\u7528\u4E00\u81F4\u6027\u8207 archive \u7D71\u8A08\uFF0C\u4E26\u7DAD\u8B77\u984C\u5EAB\u8207 benchmark \u984C\u7D44\u3002",metric:"DuckDB native",tone:"green"},{route:"performance",icon:"activity",kicker:"OBSERVE",title:"\u6548\u80FD\u5831\u8868",summary:"\u5F9E\u55AE\u6B21\u8ACB\u6C42\u5230\u6574\u9AD4\u7D22\u5F15\uFF0C\u8FFD\u8E64\u6BCF\u4E00\u500B\u6642\u9593\u7247\u6BB5\u3002",description:"\u5B8C\u6574 Flow\u3001RAG Pipeline waterfall\u3001Token\u3001TTFT\u3001\u7D22\u5F15\u541E\u5410\u8207 RAG Benchmark \u4E00\u6B21\u770B\u5B8C\u3002",metric:"ms-level trace",tone:"amber"},{route:"processing",icon:"sliders",kicker:"PIPELINE",title:"\u8CC7\u6599\u8655\u7406",summary:"\u4E0B\u8F09\u3001\u532F\u5165\u3001\u5099\u4EFD\u3001\u7D22\u5F15\uFF0C\u96C6\u4E2D\u7BA1\u7406\u8CC7\u6599\u751F\u547D\u9031\u671F\u3002",description:"\u8FFD\u8E64\u6CD5\u898F\u3001\u547D\u4EE4\u8207\u5224\u6C7A\u6D41\u7A0B\uFF0C\u7BA1\u7406 Ollama \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u8207\u7DDA\u4E0A\u66F4\u65B0\u6AA2\u67E5\u3002",metric:"End-to-end",tone:"violet"},{route:"status",icon:"server",kicker:"STATUS",title:"\u7CFB\u7D71\u72C0\u614B",summary:"\u5373\u6642\u638C\u63E1\u6BCF\u4E00\u500B\u670D\u52D9\u8207\u57FA\u790E\u8A2D\u65BD\u7684\u904B\u4F5C\u72C0\u614B\u3002",description:"FastAPI\u3001PostgreSQL\u3001Qdrant\u3001Ollama\u3001Docker\uFF0Fvolume\u3001\u78C1\u789F\u8207\u8CC7\u6599\u7248\u672C\u3002",metric:"Live health",tone:"slate"},{route:"tests",icon:"check",kicker:"VERIFY",title:"\u7CFB\u7D71\u6E2C\u8A66",summary:"\u5728\u4E0A\u7DDA\u524D\u78BA\u8A8D API\u3001\u6A21\u578B\u8207\u6E2C\u8A66 Flow \u90FD\u6E96\u5099\u597D\u4E86\u3002",description:"\u8A2D\u5B9A API Base\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207 LLM chat \u80FD\u529B\uFF0C\u57F7\u884C\u591A\u6A21\u578B\u6E2C\u8A66\u4E26\u6AA2\u67E5\u7D50\u679C\u3002",metric:"Model ready",tone:"rose"}];function ko(e){return`<a class="home-tile tone-${r(e.tone)}" href="#/${e.route}">
    <span class="home-tile-watermark" aria-hidden="true">${m(e.icon,132)}</span>
    <span class="home-tile-head">
      <span class="home-tile-icon">${m(e.icon,22)}</span>
      <span class="home-tile-kicker">${r(e.kicker)}</span>
    </span>
    <span class="home-tile-copy">
      <strong>${r(e.title)}</strong>
      <span>${r(e.summary)}</span>
    </span>
    <span class="home-tile-foot">
      <span class="home-tile-metric">${r(e.metric)}</span>
      <span class="home-tile-cta">\u63A2\u7D22 ${m("arrowRight",13)}</span>
    </span>
  </a>`}async function So(e,t){let s=lr[0],a=lr.slice(1).map(ko).join("");e.innerHTML=`<section class="page home-page">
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
          <span>${m("shield",13)}\u53EF\u56DE\u6EAF\u5F15\u7528</span>
          <span>${m("database",13)}\u6CD5\u898F\uFF0B\u5224\u6C7A</span>
          <span>${m("activity",13)}Pipeline waterfall</span>
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
        ${Dt(null,{loading:!0})}
      </div>

      <a class="home-feature" href="#/${s.route}">
        <span class="home-feature-glow" aria-hidden="true"></span>
        <div class="home-feature-copy">
          <span class="home-feature-kicker">${r(s.kicker)} \xB7 ${r(s.metric)}</span>
          <h3>${r(s.title)}<br /><span>${r(s.summary)}</span></h3>
          <p>${r(s.description)}</p>
          <span class="home-feature-cta">\u958B\u59CB\u63D0\u554F ${m("arrowRight",14)}</span>
        </div>
        <div class="home-feature-art" aria-hidden="true">
          <span class="home-feature-orbit orbit-one"></span>
          <span class="home-feature-orbit orbit-two"></span>
          <span class="home-feature-core">${m(s.icon,46)}</span>
          <span class="home-feature-chip chip-qdrant">Qdrant</span>
          <span class="home-feature-chip chip-llm">LLM</span>
          <span class="home-feature-chip chip-cite">Citations</span>
        </div>
      </a>

      <div class="home-tile-grid">${a}</div>
    </div>

    <section class="home-trust" aria-label="\u7CFB\u7D71\u539F\u5247">
      <div class="home-trust-item">
        <span class="home-trust-icon">${m("shield",18)}</span>
        <strong>\u4F86\u6E90\u512A\u5148</strong>
        <p>\u56DE\u7B54\u53EA\u6839\u64DA\u6AA2\u7D22\u5230\u7684\u6CD5\u898F\u8207\u5224\u6C7A\u7247\u6BB5\u751F\u6210\uFF0C\u5F15\u7528\u7DE8\u865F\u53EF\u56DE\u5230\u539F\u59CB\u8CC7\u6599\u3002</p>
      </div>
      <div class="home-trust-item">
        <span class="home-trust-icon">${m("server",18)}</span>
        <strong>\u672C\u6A5F\u6A21\u578B</strong>
        <p>\u900F\u904E Ollama \u4F7F\u7528\u672C\u6A5F\u6216\u5340\u7DB2\u6A21\u578B\uFF0C\u6A21\u578B\u8207\u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u90FD\u53EF\u8ABF\u6574\u3002</p>
      </div>
      <div class="home-trust-item">
        <span class="home-trust-icon">${m("layers",18)}</span>
        <strong>\u7248\u672C\u53EF\u8FFD\u6EAF</strong>
        <p>\u6CD5\u898F\u3001\u5224\u6C7A\u8207\u5411\u91CF\u7D22\u5F15\u4FDD\u7559\u7248\u672C\u8207\u66F4\u65B0\u7D00\u9304\uFF0C\u8CC7\u6599\u8B8A\u66F4\u4E0D\u6703\u9ED8\u9ED8\u6D88\u5931\u3002</p>
      </div>
    </section>
  </section>`;let n=e.querySelector("#home-ask-form"),i=e.querySelector("#home-question"),o=()=>{let c=String(i?.value||"").trim().slice(0,500);if(!c){i?.focus();return}try{window.sessionStorage.setItem("judgment.pending_question",c)}catch{}window.__judgmentPendingQuestion=c,t&&typeof t.navigate=="function"?t.navigate("rag"):window.location.hash="#/rag"},l=()=>{i&&(i.style.height="auto",i.style.height=`${Math.min(i.scrollHeight,140)}px`)};i?.addEventListener("input",l),n?.addEventListener("submit",c=>{c.preventDefault(),o()}),i?.addEventListener("keydown",c=>{c.key==="Enter"&&!c.shiftKey&&!c.isComposing&&(c.preventDefault(),o())});let d=e.querySelector("#home-judgment-stats");U.judgmentStats().then(c=>{!d||!d.isConnected||(d.innerHTML=Dt(c))}).catch(()=>{!d||!d.isConnected||(d.innerHTML=Dt(null))}),l(),i?.focus({preventScroll:!0})}var _n={};Wt(_n,{render:()=>dc});var xo="judgment-console";var _t="query_history",ss="settings",as="audit_events";var it={history:[],settings:new Map,audit:[],nextId:1},na=null,ot=!("indexedDB"in window);function Ft(e){return new Promise((t,s)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>s(e.error)})}function qt(e){return new Promise((t,s)=>{e.oncomplete=()=>t(),e.onerror=()=>s(e.error),e.onabort=()=>s(e.error||new Error("transaction aborted"))})}function Lt(){return na||(na=new Promise((e,t)=>{if(!("indexedDB"in window)){ot=!0,t(new Error("IndexedDB is unavailable"));return}let s;try{s=window.indexedDB.open(xo,2)}catch(a){ot=!0,t(a);return}s.onupgradeneeded=()=>{let a=s.result;if(!a.objectStoreNames.contains(_t)){let n=a.createObjectStore(_t,{keyPath:"id",autoIncrement:!0});n.createIndex("created_at","created_at"),n.createIndex("kind","kind")}if(a.objectStoreNames.contains(ss)||a.createObjectStore(ss,{keyPath:"key"}),!a.objectStoreNames.contains(as)){let n=a.createObjectStore(as,{keyPath:"key"});n.createIndex("created_at","created_at"),n.createIndex("dataset","dataset"),n.createIndex("jid","jid"),n.createIndex("issue_month","issue_month")}},s.onsuccess=()=>{let a=s.result;a.onversionchange=()=>a.close(),e(a)},s.onerror=()=>{ot=!0,t(s.error||new Error("Unable to open IndexedDB"))},s.onblocked=()=>{ot=!0,t(new Error("IndexedDB upgrade blocked by another tab"))}}),na)}function cr(){return"indexedDB"in window}function dr(){return ot}function ra(){return ot?"memory":"indexeddb"}function qo(e){let t=e.created_at||new Date().toISOString();return{kind:e.kind||"query",title:String(e.title||""),detail:String(e.detail||""),payload:e.payload||{},turns:Array.isArray(e.turns)?e.turns:[],pinned:!!e.pinned,project_id:String(e.project_id||""),created_at:t,updated_at:e.updated_at||t}}async function Ao(){try{let t=(await Lt()).transaction(_t,"readwrite"),s=t.objectStore(_t),a=await Ft(s.count());if(a>120){let n=a-120,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let d=i.result;if(!d||n<=0){o();return}d.delete(),n-=1,d.continue()},i.onerror=()=>l(i.error)})}await qt(t)}catch{ot=!0}}async function Ps(e){let t=qo(e);try{let a=(await Lt()).transaction(_t,"readwrite"),n=a.objectStore(_t),i=await Ft(n.add(t));return await qt(a),await Ao(),i}catch{ot=!0;let a=it.nextId++;return it.history.push({id:a,...t}),it.history.length>120&&it.history.shift(),a}}async function Is(e,t={}){let s=Number(e);if(!Number.isFinite(s))return null;try{let n=(await Lt()).transaction(_t,"readwrite"),i=n.objectStore(_t),o=await Ft(i.get(s));if(!o)return await qt(n),null;let l={...o,...t,id:s};return await Ft(i.put(l)),await qt(n),l}catch{ot=!0;let n=it.history.findIndex(i=>Number(i.id)===s);return n===-1?null:(it.history[n]={...it.history[n],...t,id:s},it.history[n])}}async function ur(e){let t=Number(e);if(!Number.isFinite(t))return!1;try{let a=(await Lt()).transaction(_t,"readwrite");return a.objectStore(_t).delete(t),await qt(a),!0}catch{ot=!0;let a=it.history.findIndex(n=>Number(n.id)===t);return a===-1?!1:(it.history.splice(a,1),!0)}}async function ia({keyword:e="",limit:t=50}={}){let s=e.trim().toLowerCase();try{let n=(await Lt()).transaction(_t,"readonly"),i=n.objectStore(_t),o=await Ft(i.getAll());return await qt(n),o.filter(l=>s?`${l.kind} ${l.title} ${l.detail}`.toLowerCase().includes(s):!0).sort((l,d)=>String(d.updated_at||d.created_at).localeCompare(String(l.updated_at||l.created_at))).slice(0,t)}catch{return ot=!0,it.history.filter(n=>s?`${n.kind} ${n.title} ${n.detail}`.toLowerCase().includes(s):!0).slice().sort((n,i)=>String(i.updated_at||i.created_at).localeCompare(String(n.updated_at||n.created_at))).slice(0,t)}}async function pr(){try{let t=(await Lt()).transaction(_t,"readwrite");t.objectStore(_t).clear(),await qt(t)}catch{ot=!0}it.history=[]}function Mo(e){let t=Number(e.id??e.event_id??0)||0,s=String(e.dataset||e.kind||"judgment"),a=String(e.key||`${s}:${t||`${Date.now()}:${Math.random().toString(36).slice(2)}`}`),n=String(e.jid||""),i=String(e.issue_month||""),o=String(e.change_type||""),l=String(e.detected_at||e.created_at||new Date().toISOString());return{key:a,event_id:t,dataset:s,jid:n,issue_month:i,change_type:o,title:String(e.title||n||i||"\u7248\u672C\u8B8A\u66F4"),detail:String(e.detail||[o,i,n].filter(Boolean).join(" \xB7 ")),created_at:l,payload:e}}async function Lo(){try{let t=(await Lt()).transaction(as,"readwrite"),s=t.objectStore(as),a=await Ft(s.count());if(a>2e3){let n=a-2e3,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let d=i.result;if(!d||n<=0){o();return}d.delete(),n-=1,d.continue()},i.onerror=()=>l(i.error)})}await qt(t)}catch{ot=!0}}async function mr(e){let t=(Array.isArray(e)?e:[]).filter(s=>s&&typeof s=="object").map(Mo);if(!t.length)return 0;try{let a=(await Lt()).transaction(as,"readwrite"),n=a.objectStore(as);for(let i of t)await Ft(n.put(i));return await qt(a),await Lo(),t.length}catch{ot=!0;let a=new Map(it.audit.map(n=>[n.key,n]));for(let n of t)a.set(n.key,n);return it.audit=Array.from(a.values()).sort((n,i)=>String(i.created_at).localeCompare(String(n.created_at))).slice(0,2e3),t.length}}async function gr({keyword:e="",limit:t=200}={}){let s=e.trim().toLowerCase(),a=n=>s?`${n.dataset} ${n.jid} ${n.issue_month} ${n.change_type} ${n.detail}`.toLowerCase().includes(s):!0;try{let i=(await Lt()).transaction(as,"readonly"),o=i.objectStore(as),l=await Ft(o.getAll());return await qt(i),l.filter(a).sort((d,c)=>String(c.created_at).localeCompare(String(d.created_at))).slice(0,t)}catch{return ot=!0,it.audit.filter(a).slice().sort((i,o)=>String(o.created_at).localeCompare(String(i.created_at))).slice(0,t)}}async function Bs(e,t){let s={key:String(e),value:t,updated_at:new Date().toISOString()};try{let n=(await Lt()).transaction(ss,"readwrite");return n.objectStore(ss).put(s),await qt(n),s}catch{return ot=!0,it.settings.set(s.key,s),s}}async function ns(e,t=null){try{let a=(await Lt()).transaction(ss,"readonly"),n=a.objectStore(ss),i=await Ft(n.get(String(e)));return await qt(a),i?i.value:t}catch{ot=!0;let a=it.settings.get(String(e));return a?a.value:t}}async function fr({keyword:e=""}={}){let t=e.trim().toLowerCase();try{let a=(await Lt()).transaction(ss,"readonly"),n=a.objectStore(ss),i=await Ft(n.getAll());return await qt(a),i.filter(o=>t?`${o.key} ${JSON.stringify(o.value)}`.toLowerCase().includes(t):!0).sort((o,l)=>String(o.key).localeCompare(String(l.key)))}catch{return ot=!0,Array.from(it.settings.values()).filter(a=>t?`${a.key} ${JSON.stringify(a.value)}`.toLowerCase().includes(t):!0)}}function br(e){if(typeof e=="string")return e;try{return JSON.stringify(e)}catch{return String(e)}}var $n={};Wt($n,{buildFlowWaterfallStages:()=>ya,render:()=>Hl,renderRagPipelineWaterfall:()=>$a,renderTestFlowPanel:()=>ks,renderWaterfallStages:()=>_s});var jo={running:["\u57F7\u884C\u4E2D","badge-info"],stopping:["\u505C\u6B62\u4E2D","badge-warn"],success:["\u5B8C\u6210","badge-ok"],interrupted:["\u5DF2\u4E2D\u6B62","badge-warn"],failed:["\u5931\u6557","badge-danger"],pending:["\u7B49\u5F85","badge-neutral"],skipped:["\u7565\u904E","badge-neutral"]},To=new Set(["running","stopping"]);function ca(e){let[t,s]=jo[e]||[e||"\u672A\u77E5","badge-neutral"];return`<span class="badge ${s}">${r(t)}</span>`}function oa(e){return String(e).padStart(2,"0")}function ys(e=new Date){let t=e instanceof Date?e:new Date(e);return`RAG Benchmark ${t.getFullYear()}-${oa(t.getMonth()+1)}-${oa(t.getDate())} ${oa(t.getHours())}:${oa(t.getMinutes())}`}function la(e){return To.has(e)}function Gt(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?s.toFixed(3):t}function cs(e){if(e==null)return"\u2014";let t=Number(e);return Number.isFinite(t)?`${(t*100).toFixed(1)}%`:"\u2014"}function rs(e,t,s=""){return`<div class="bench-metric">
    <span class="summary-label">${r(e)}</span>
    <strong>${r(String(t))}</strong>
    ${s?`<small>${r(s)}</small>`:""}
  </div>`}function vr(e={}){let t=e.score_components||e,s=e.gate||{},a=String(s.status||""),n=a==="pass"?"Gate \u901A\u904E":a==="fail"?"Gate \u5931\u6557":a==="no_data"?"Gate \u7121\u8CC7\u6599":"";return`${n?`<span class="badge ${a==="pass"?"badge-ok":a==="fail"?"badge-danger":"badge-neutral"}">${r(n)}</span>`:""}<div class="bench-metrics">
    ${rs("Law Recall",cs(t.law_recall))}
    ${rs("Article Recall",cs(t.article_recall))}
    ${rs("Citation Valid",cs(t.citation_valid_rate))}
    ${rs("Judge",Gt(t.judge_overall))}
    ${rs("Human",Gt(t.human_overall))}
    ${rs("p50",me(e.duration_p50_ms))}
    ${rs("p95",me(e.duration_p95_ms))}
    ${rs("Success",`${u(e.success||0)} / ${u(e.total||0)}`)}
  </div>`}function hr(e={}){let t=Object.entries(e.stages||{}).filter(([s])=>s.startsWith("rag.")).slice(0,8);return t.length?`<div class="bench-stage-grid">${t.map(([s,a])=>`<div class="bench-stage">
      <span>${r(s.replace(/^rag\./,""))}</span>
      <strong>${me(a.p50_ms)}</strong>
      <small>p95 ${me(a.p95_ms)}</small>
    </div>`).join("")}</div>`:""}function $r(e){let t=e.summary||{},s=t.score_components||{};return`<span>Law ${cs(s.law_recall)}</span>
    <span>Article ${cs(s.article_recall)}</span>
    <span>Judge ${Gt(s.judge_overall)}</span>
    <span>p95 ${me(t.duration_p95_ms)}</span>`}function yr(e){let t=e.summary||{},s=t.score_components||{};return JSON.stringify([s.law_recall,s.article_recall,s.judge_overall,t.duration_p95_ms])}function wr(e,t){let s=e.config||{};return`<button class="bench-run ${t?"is-active":""}" type="button" data-bench-action="open-run" data-run-id="${r(e.run_id)}">
    <span class="bench-run-head">
      <strong data-bench-slot="run-label">${r(e.label||"RAG Benchmark")}</strong>
      <span data-bench-slot="run-status" data-status="${r(e.status||"")}">${ca(e.status)}</span>
      <span class="mono">${r(e.run_id.slice(0,10))}</span>
    </span>
    <span class="bench-run-meta">
      <span>${r(qe(e.started_at))}</span>
      <span data-bench-slot="run-completed">${u(e.completed_cases||0)} / ${u(e.total_cases||0)} \u984C</span>
      <span>${r(s.llm_model||"\u2014")}</span>
      <span>v${e.suite_version||1}</span>
    </span>
    <span class="bench-run-scores" data-bench-slot="run-scores" data-signature="${r(yr(e))}">${$r(e)}</span>
  </button>`}function an(e,t=[]){let s=e.metrics||{},a=e.judge||{},n=e.human_review||{},i=s.scores||{},o=e.stage_ms||{},l=Object.entries(o).filter(([c])=>c.startsWith("rag.")).map(([c,v])=>`<span class="chip">${r(c)} ${me(v)}</span>`).join(""),d=(e.law_sources||[]).map(c=>`<span class="chip">${r(c.law_name||"\u6CD5\u898F")} ${u((c.articles||[]).length)} \u689D</span>`).join("");return`<summary>
      <span class="bench-case-question">${r(e.question)}</span>
      ${ca(e.status)}
      <span class="bench-case-time">${me(e.duration_ms)}</span>
      <span class="bench-case-score">Det ${Gt(i.deterministic)} \xB7 Judge ${Gt(i.judge)} \xB7 Human ${Gt(i.human)}</span>
    </summary>
    <div class="bench-case-body">
      <div class="bench-case-meta">
        <span class="mono">fingerprint ${r((e.fingerprint||"").slice(0,20))}</span>
        <span>item #${e.item_id} \xB7 v${e.item_version}</span>
        <button class="btn btn-ghost btn-sm" type="button" data-bench-action="fingerprint-history" data-fingerprint="${r(e.fingerprint||"")}">${m("history",13)}<span>\u540C\u984C\u6B77\u53F2</span></button>
      </div>
      <div class="bench-case-stages">${l||'<span class="qb-muted">\u6C92\u6709 stage timing</span>'}</div>
      <div class="bench-case-metrics">
        <span>Law recall ${cs(s.law_recall)}</span>
        <span>Article recall ${cs(s.article_recall)}</span>
        <span>Citation ${s.citation_valid?"valid":"invalid"}</span>
        <span>Refusal ${s.refusal_correct===null?"\u2014":s.refusal_correct?"correct":"wrong"}</span>
      </div>
      <div class="chips">${d||'<span class="qb-muted">\u6C92\u6709\u6CD5\u898F\u4F86\u6E90</span>'}</div>
      <div class="bench-answer"><strong>\u56DE\u7B54</strong><p>${r(e.answer||"\u2014")}</p></div>
      <div class="bench-judge"><strong>LLM judge</strong><p>${r(a.rationale||a.reason||"\u2014")}</p><span>${[["correctness",a.correctness],["grounding",a.grounding],["citation",a.citation],["clarity",a.clarity],["overall",a.overall]].map(([c,v])=>`${c} ${v??"\u2014"}`).join(" \xB7 ")}</span></div>
      <form class="bench-human-form" data-bench-form="human" data-result-id="${e.id}">
        <div class="bench-human-grid">
          ${[["correctness","\u6B63\u78BA\u6027",n.scores?.correctness??4],["grounding","\u6709\u64DA\u6027",n.scores?.grounding??4],["citation","\u5F15\u7528",n.scores?.citation??4],["clarity","\u6E05\u695A",n.scores?.clarity??4],["overall","\u6574\u9AD4",n.overall??4]].map(([c,v,$])=>`<label class="field"><span class="field-label">${v} <span class="field-tag">1\u20135</span></span><input class="input" type="number" min="1" max="5" name="score_${c}" value="${r(String($))}" /></label>`).join("")}
        </div>
        <label class="field"><span class="field-label">\u4EBA\u5DE5\u6279\u6CE8</span><input class="input" name="comment" value="${r(n.comment||"")}" placeholder="\u56DE\u7B54\u54C1\u8CEA\u3001\u5F15\u7528\u6216\u4E8B\u5BE6\u932F\u8AA4" /></label>
        <button class="btn btn-secondary btn-sm" type="submit">${m("check",13)}<span>\u5132\u5B58\u4EBA\u5DE5\u8A55\u5206</span></button>
      </form>
      ${t.length?`<div class="bench-history"><strong>\u540C\u984C\u6B77\u53F2 \xB7 ${t.length} \u7B46</strong>${t.map(c=>`<div class="bench-history-row"><span>${r(qe(c.run?.started_at))}</span><span>${r(c.run?.config?.llm_model||"\u2014")}</span><span>Det ${Gt(c.metrics?.scores?.deterministic)}</span><span>Judge ${Gt(c.metrics?.scores?.judge)}</span><span>Human ${Gt(c.metrics?.scores?.human)}</span><span>${me(c.duration_ms)}</span></div>`).join("")}</div>`:""}
    </div>`}function sn(e,t=[]){return JSON.stringify([e.status,e.duration_ms,e.answer,e.metrics,e.judge,e.human_review,e.stage_ms,e.law_sources,t.map(s=>[s.id,s.duration_ms,s.metrics?.scores?.human,s.finished_at])])}function _r(e,t=[]){return`<details class="bench-case" data-result-id="${e.id}">
    ${an(e,t)}
  </details>`}function kr(e){return`${ca(e.status)}
    <span class="mono">${r(e.run_id)}</span>
    ${la(e.status)?`<button class="btn btn-secondary btn-sm" type="button" data-bench-action="stop" data-run-id="${r(e.run_id)}">${m("x",13)}<span>\u505C\u6B62</span></button>`:""}`}function No(e,t){let s=e.cases||[];return`<section class="report-card bench-detail" data-run-id="${r(e.run_id)}">
    <div class="side-card-head">
      <span class="side-card-title">${m("activity",14)}${r(e.label||"RAG Benchmark")}</span>
      <div class="qb-actions" data-bench-detail-actions data-signature="${r((e.status||"")+":"+e.run_id)}">
        ${kr(e)}
      </div>
    </div>
    <div data-bench-detail="metrics">${vr(e.summary||{})}</div>
    <div data-bench-detail="stages">${hr(e.summary||{})}</div>
    <div class="bench-run-config">
      <span><strong>Suite</strong> v${e.suite_version} \xB7 ${u((e.suite_snapshot?.items||[]).length)} \u984C</span>
      <span><strong>Embedding</strong> ${r(e.config?.embedding_model||"\u2014")}</span>
      <span><strong>LLM</strong> ${r(e.config?.llm_model||"\u2014")}</span>
      <span><strong>Judge</strong> ${r(e.config?.judge_model||"\u2014")}</span>
      <span><strong>Index</strong> ${r(e.index_version?.physical_collection||"\u2014")}</span>
      <span><strong>Top K</strong> ${r(String(e.config?.top_k??"\u2014"))}</span>
      <span><strong>Law retrieval</strong> ${e.config?.enable_law_retrieval?"on":"off"}</span>
      <span><strong>Config hash</strong> <span class="mono">${r((e.config_hash||"").slice(0,16))}</span></span>
    </div>
    <div class="bench-cases" data-bench-cases>${s.length?s.map(a=>_r(a,t[a.fingerprint]||[])).join(""):Ee({tone:"info",title:"\u5C1A\u7121\u984C\u76EE\u7D50\u679C",text:"Benchmark \u57F7\u884C\u5F8C\u6703\u5728\u9019\u88E1\u986F\u793A\u9010\u984C\u7D50\u679C\u3002"})}</div>
  </section>`}function Sr(e){return`<button class="btn btn-primary" type="submit" ${e?"disabled":""}>${m("play",14)}<span>${e?"Benchmark \u57F7\u884C\u4E2D":"\u57F7\u884C Benchmark"}</span></button>
    ${e?`<button class="btn btn-secondary" type="button" data-bench-action="stop" data-run-id="${r(e.run_id)}">${m("x",14)}<span>\u505C\u6B62</span></button>`:""}`}function xr(e,t=[]){let s=Math.max(0,Number(e.total_cases)||0),a=Math.max(0,Math.min(s,Number(e.completed_cases)||0)),n=Date.now(),i=Date.parse(e.started_at||""),o=Number.isFinite(i)?Math.max(0,n-i):0,l=(t||[]).filter(p=>["success","failed"].includes(p.status)).map(p=>Number(p.duration_ms)||0).filter(p=>p>0),d=null;if(l.length)d=l.reduce((p,w)=>p+w,0)/l.length;else if(a>0){let p=Date.parse(e.updated_at||""),w=Number.isFinite(p)?p:i;Number.isFinite(w)&&w>i?d=(w-i)/a:o>0&&(d=o/a)}let c=(t||[]).find(p=>p.status==="running")||null,v=0;if(a<s&&d&&d>0){let p=c?Date.parse(c.started_at||""):NaN,w=Date.parse(e.updated_at||""),k=Number.isFinite(p)?p:w;Number.isFinite(k)&&(v=Math.max(0,Math.min(.95,(n-k)/d)))}let $=Math.min(s,a+v),h=s>0?Math.max(0,Math.min(100,$/s*100)):0,g=d===null?null:Math.max(0,s-$)*d;return{total:s,completed:a,elapsedMs:o,averageMs:d,progress:h,etaMs:g,ratePerMin:d?6e4/d:null,running:c}}function qr(e){return e===null?"\u9810\u4F30\u5269\u9918\uFF1A\u8A08\u7B97\u4E2D\u2026":e<1e3?"\u9810\u4F30\u5269\u9918\uFF1A\u5373\u5C07\u5B8C\u6210":`\u9810\u4F30\u5269\u9918 ${me(e)}`}function Ar(e,t=[]){let s=xr(e,t),a=e.status==="stopping";return`<div class="bench-progress" data-bench-live data-run-id="${r(e.run_id)}">
    <div class="bench-progress-head">
      <span class="bench-progress-state"><span class="spinner" aria-hidden="true"></span><span data-bench-slot="progress-state">${a?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D"}</span></span>
      <strong data-bench-slot="progress-count">${u(s.completed)} / ${u(s.total)} \u984C</strong>
      <span data-bench-slot="progress-percent">${s.progress.toFixed(1)}%</span>
      <span class="bench-progress-eta" data-bench-slot="progress-eta">${qr(s.etaMs)}</span>
      <span data-bench-slot="progress-rate">${s.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${s.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`}</span>
    </div>
    <div class="processing-bar processing-bar-lg bench-progress-bar${s.completed===0?" is-waiting":""}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${s.progress.toFixed(1)}" data-bench-slot="progress-bar">
      <span class="processing-bar-fill" data-bench-slot="progress-fill" style="width:${s.progress.toFixed(2)}%"></span>
    </div>
    <div class="bench-progress-foot">
      <span data-bench-slot="progress-elapsed">\u5DF2\u57F7\u884C ${me(s.elapsedMs)}</span>
      <span data-bench-slot="progress-average">${s.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${me(s.averageMs)}\uFF0F\u984C`}</span>
      <span>\u5373\u6642\u9810\u4F30 \xB7 \u6BCF\u5B8C\u6210\u4E00\u984C\u6821\u6B63</span>
    </div>
  </div>`}function Eo(e){let t=e.models?.models||{},s=e.suites||[],a=Os(e),n=e.selectedRun;return`<section class="report-card bench-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("brain",14)}RAG Benchmark</span>
      <span class="badge ${e.indexVersion?.physical_collection?"badge-ok":"badge-warn"}">${r(e.indexVersion?.physical_collection||"\u7D22\u5F15\u672A\u8A2D\u5B9A")}</span>
    </div>
    <form class="bench-form" data-bench-form="run">
      <div class="bench-form-grid">
        <label class="field"><span class="field-label">Benchmark \u984C\u5EAB</span><select class="select" name="suite_id">${s.map(i=>`<option value="${i.id}" ${e.selectedSuiteId===i.id?"selected":""}>${r(i.name)} \xB7 ${u(i.item_count)} \u984C</option>`).join("")}</select></label>
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
        ${Sr(a)}
      </div>
    </form>
    <div data-bench-live-wrap data-signature="${r(a?`${a.run_id}:${a.status}:${a.total_cases}`:"")}">${a?Ar(a,nn(e,a)):""}</div>
    <div class="bench-runs-head"><span class="summary-label">\u6B77\u53F2 Run</span><span class="qb-muted">\u540C\u984C\u76EE\u4EE5 fingerprint \u5C0D\u9F4A\uFF0C\u53EF\u5C55\u958B\u9010\u984C\u6BD4\u8F03</span></div>
    <div class="bench-runs" data-bench-runs>${(e.runs||[]).length?e.runs.map(i=>wr(i,n?.run_id===i.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>'}</div>
    ${n?No(n,e.history):""}
  </section>`}function Os(e){let t=(e.runs||[]).find(s=>la(s.status));return t?e.selectedRun&&e.selectedRun.run_id===t.run_id?e.selectedRun.status&&!la(e.selectedRun.status)?null:{...t,...e.selectedRun,summary:e.selectedRun.summary||t.summary||{},cases:e.selectedRun.cases||[]}:t:null}function nn(e,t){return!t||!e.selectedRun||e.selectedRun.run_id!==t.run_id?[]:e.selectedRun.cases||[]}function Mr(e,{onNavigate:t=null}={}){let s={models:null,suites:[],runs:[],selectedRun:null,selectedSuiteId:null,history:{},indexVersion:null,config:{label:ys(),embedding_model:"",llm_model:"",judge_model:"",top_k:4,score_threshold:.35,repeats:1,enable_law_retrieval:!0,judge_enabled:!0},labelTouched:!1,loaded:!1,referenceLoaded:!1,loading:!1,loadAgain:!1,pendingRefreshAll:!1,activeRunId:"",refreshStream:null,tickTimer:null,renderSignature:"",forcedCaseIds:new Set},a=()=>e.querySelector("#performance-panel-benchmark"),n=B=>{let S=new FormData(B);return{label:String(S.get("label")||"").trim()||ys(),embedding_model:String(S.get("embedding_model")||""),llm_model:String(S.get("llm_model")||""),judge_model:String(S.get("judge_model")||""),top_k:Number(S.get("top_k")||4),score_threshold:Number(S.get("score_threshold")||.35),repeats:Number(S.get("repeats")||1),enable_law_retrieval:B.elements.enable_law_retrieval?.checked??!0,judge_enabled:B.elements.judge_enabled?.checked??!0}},i=()=>JSON.stringify({selectedRunId:s.selectedRun?.run_id||"",references:s.referenceLoaded?[s.indexVersion?.physical_collection||"",(s.models?.models?.embedding||[]).join(","),(s.models?.models?.llm||[]).join(","),(s.suites||[]).map(B=>`${B.id}:${B.name}:${B.item_count}:${B.version}:${B.status}`)]:null,runs:(s.runs||[]).map(B=>`${B.run_id}:${B.label||""}:${B.suite_version||1}`)}),o=()=>{let S=a()?.querySelector("[data-bench-live]"),C=Os(s);if(!S||!C)return;let ne=xr(C,nn(s,C)),ge=(ae,ee)=>{let _e=S.querySelector(`[data-bench-slot="${ae}"]`);_e&&_e.textContent!==ee&&(_e.textContent=ee)};ge("progress-count",`${u(ne.completed)} / ${u(ne.total)} \u984C`),ge("progress-percent",`${ne.progress.toFixed(1)}%`),ge("progress-eta",qr(ne.etaMs)),ge("progress-rate",ne.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${ne.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`),ge("progress-elapsed",`\u5DF2\u57F7\u884C ${me(ne.elapsedMs)}`),ge("progress-average",ne.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${me(ne.averageMs)}\uFF0F\u984C`),ge("progress-state",C.status==="stopping"?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D");let V=S.querySelector('[data-bench-slot="progress-bar"]');V&&(V.setAttribute("aria-valuenow",ne.progress.toFixed(1)),V.classList.toggle("is-waiting",ne.completed===0));let Z=S.querySelector('[data-bench-slot="progress-fill"]');Z&&(Z.style.width=`${ne.progress.toFixed(2)}%`)},l=B=>{let S=B.querySelector("[data-bench-actions]");if(!S)return;let C=Os(s),ne=C?`${C.run_id}:${C.status}`:"";S.dataset.signature!==ne&&(S.dataset.signature=ne,S.innerHTML=Sr(C))},d=B=>{let S=B.querySelector("[data-bench-live-wrap]");if(!S)return;let C=Os(s),ne=C?`${C.run_id}:${C.status}:${C.total_cases}`:"";S.dataset.signature!==ne&&(S.dataset.signature=ne,S.innerHTML=C?Ar(C,nn(s,C)):"")},c=B=>{let S=B.querySelector("[data-bench-runs]");if(!S)return;let C=s.runs||[],ne=[...S.querySelectorAll("[data-run-id]")].map(V=>V.dataset.runId),ge=C.map(V=>V.run_id);if(ne.join("|")!==ge.join("|")){S.innerHTML=C.length?C.map(V=>wr(V,s.selectedRun?.run_id===V.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>';return}for(let V of C){let Z=S.querySelector(`[data-run-id="${V.run_id}"]`);if(!Z)continue;Z.classList.toggle("is-active",s.selectedRun?.run_id===V.run_id);let ae=Z.querySelector('[data-bench-slot="run-label"]');ae&&ae.textContent!==(V.label||"RAG Benchmark")&&(ae.textContent=V.label||"RAG Benchmark");let ee=Z.querySelector('[data-bench-slot="run-status"]');ee&&ee.dataset.status!==(V.status||"")&&(ee.dataset.status=V.status||"",ee.innerHTML=ca(V.status));let _e=Z.querySelector('[data-bench-slot="run-completed"]');if(_e){let Me=`${u(V.completed_cases||0)} / ${u(V.total_cases||0)} \u984C`;_e.textContent!==Me&&(_e.textContent=Me)}let z=Z.querySelector('[data-bench-slot="run-scores"]'),be=yr(V);z&&z.dataset.signature!==be&&(z.dataset.signature=be,z.innerHTML=$r(V))}},v=B=>{let S=s.selectedRun;if(!S)return;let C=B.querySelector(`.bench-detail[data-run-id="${S.run_id}"]`);if(!C)return;let ne=C.querySelector("[data-bench-detail-actions]");if(ne){let z=`${S.status||""}:${S.run_id}`;ne.dataset.signature!==z&&(ne.dataset.signature=z,ne.innerHTML=kr(S))}let ge=C.querySelector('[data-bench-detail="metrics"]');if(ge){let z=JSON.stringify(S.summary||{});ge.dataset.signature!==z&&(ge.dataset.signature=z,ge.innerHTML=vr(S.summary||{}))}let V=C.querySelector('[data-bench-detail="stages"]');if(V){let z=JSON.stringify((S.summary||{}).stages||{});V.dataset.signature!==z&&(V.dataset.signature=z,V.innerHTML=hr(S.summary||{}))}let Z=C.querySelector("[data-bench-cases]");if(!Z)return;let ae=S.cases||[];if(!ae.length)return;let ee=Z.querySelector(".notice");ee&&ee.remove();let _e=new Map([...Z.querySelectorAll("details.bench-case")].map(z=>[Number(z.dataset.resultId),z]));for(let z of ae){let be=s.history[z.fingerprint]||[],Me=sn(z,be),pe=_e.get(Number(z.id));if(!pe){Z.insertAdjacentHTML("beforeend",_r(z,be)),pe=Z.lastElementChild,pe&&(pe._benchSignature=Me);continue}if(pe._benchSignature===Me||!s.forcedCaseIds.delete(Number(z.id))&&pe.contains(document.activeElement))continue;let Oe=pe.open;pe.innerHTML=an(z,be),pe.open=Oe,pe._benchSignature=Me}},$=()=>{Os(s)?s.tickTimer||(s.tickTimer=window.setInterval(o,1e3)):s.tickTimer&&(window.clearInterval(s.tickTimer),s.tickTimer=null)},h=()=>{let B=a();B&&(l(B),d(B),c(B),v(B),o(),$())},g=B=>{let S=s.selectedRun;if(!S)return;let C=B.querySelector('[data-bench-detail="metrics"]');C&&(C.dataset.signature=JSON.stringify(S.summary||{}));let ne=B.querySelector('[data-bench-detail="stages"]');ne&&(ne.dataset.signature=JSON.stringify((S.summary||{}).stages||{}));let ge=B.querySelector("[data-bench-cases]");if(!ge)return;let V=new Map((S.cases||[]).map(Z=>[Number(Z.id),Z]));for(let Z of ge.querySelectorAll("details.bench-case")){let ae=V.get(Number(Z.dataset.resultId));ae&&(Z._benchSignature=sn(ae,s.history[ae.fingerprint]||[]))}},p=(B=!1)=>{let S=a();if(!S)return;let C=i();if(!B&&s.renderSignature===C){h();return}s.renderSignature=C,s.forcedCaseIds.clear(),S.innerHTML=Eo(s),g(S),h()},w=async({refreshAll:B=!1,runs:S=null}={})=>{if(s.loading){s.loadAgain=!0,s.pendingRefreshAll=s.pendingRefreshAll||B;return}s.loading=!0;try{if(!s.referenceLoaded||B){let[ee,_e]=await Promise.all([U.benchmarkModels(),U.benchmarkSuites()]);s.models=ee,s.suites=_e.suites||[],s.indexVersion=ee.index_version,s.referenceLoaded=!0,!s.selectedSuiteId&&s.suites.length&&(s.selectedSuiteId=s.suites[0].id),s.config.embedding_model||(s.config.embedding_model=ee.models?.embedding?.[0]||""),s.config.llm_model||(s.config.llm_model=ee.models?.llm?.[0]||""),s.config.judge_model||(s.config.judge_model=(ee.models?.llm||[]).find(z=>z!==s.config.llm_model)||"")}let C=S?{runs:S}:await U.benchmarkRuns(30);s.runs=C.runs||[];let ne=s.activeRunId,ge=s.runs.find(ee=>la(ee.status))||null;s.activeRunId=ge?.run_id||"";let V=s.selectedRun?.run_id||"";V||(V=ge?.run_id||s.runs[0]?.run_id||"");let Z=!!(s.selectedRun&&ne&&s.selectedRun.run_id===ne);V&&(!s.selectedRun||s.selectedRun.run_id!==V||V===ge?.run_id||Z)?s.selectedRun=await U.benchmarkRun(V,!0):V||(s.selectedRun=null),s.loaded=!0,p()}catch(C){if(!s.loaded){s.renderSignature="";let ne=a();ne&&(ne.innerHTML=Ee({tone:"danger",title:"Benchmark \u8CC7\u6599\u8B80\u53D6\u5931\u6557",text:r(C.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")}))}}finally{if(s.loading=!1,s.loadAgain){let C=s.pendingRefreshAll;s.loadAgain=!1,s.pendingRefreshAll=!1,w({refreshAll:C})}}},k=()=>{s.refreshStream||(s.refreshStream=wt("benchmark",(B,S)=>{s.loading||w({runs:S?.snapshot?.runs||null})}))},L=async B=>{try{s.selectedRun=await U.benchmarkRun(B,!0),p()}catch(S){M(S.message||"\u8B80\u53D6 benchmark run \u5931\u6557\u3002","danger")}},E=async B=>{!s.labelTouched&&B.elements.label&&(B.elements.label.value=ys());let S=n(B);s.config=S;let C=Number(B.elements.suite_id?.value||0);if(!C){M("\u8ACB\u5148\u9078\u64C7 benchmark \u984C\u5EAB\u3002","warn");return}try{await U.startBenchmarkRun({suite_id:C,config:S,actor:"anonymous"}),M("Benchmark \u5DF2\u555F\u52D5\u3002","ok"),s.selectedRun=null,s.config.label=ys(),s.labelTouched=!1,await w()}catch(ne){M(ne.message||"Benchmark \u555F\u52D5\u5931\u6557\u3002","danger",8e3)}},T=async B=>{try{await U.stopBenchmarkRun(B),M("\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info"),await w()}catch(S){M(S.message||"\u505C\u6B62\u5931\u6557\u3002","danger")}},H=async B=>{let S=Number(B.dataset.resultId||0),C=new FormData(B),ne={};for(let ge of["correctness","grounding","citation","clarity","overall"]){let V=Number(C.get(`score_${ge}`));Number.isFinite(V)&&(ne[ge]=V)}try{await U.reviewBenchmarkResult(S,{reviewer:"anonymous",scores:ne,comment:String(C.get("comment")||"")}),M("\u4EBA\u5DE5\u8A55\u5206\u5DF2\u5132\u5B58\u3002","ok"),s.selectedRun&&(s.selectedRun=await U.benchmarkRun(s.selectedRun.run_id,!0),s.forcedCaseIds.add(S)),p()}catch(ge){M(ge.message||"\u4EBA\u5DE5\u8A55\u5206\u5132\u5B58\u5931\u6557\u3002","danger")}},G=async B=>{if(B)try{let S=await U.benchmarkFingerprintHistory(B,50);s.history[B]=S.cases||[];let C=s.selectedRun,ne=a();if(!C||!ne)return;let ge=(C.cases||[]).filter(V=>V.fingerprint===B);for(let V of ge){let Z=ne.querySelector(`details.bench-case[data-result-id="${V.id}"]`);if(!Z)continue;let ae=Z.open;Z.innerHTML=an(V,s.history[B]),Z.open=ae,Z._benchSignature=sn(V,s.history[B])}}catch(S){M(S.message||"\u540C\u984C\u6B77\u53F2\u8B80\u53D6\u5931\u6557\u3002","danger")}},Y=async B=>{let S=B.target.closest("[data-bench-action]");if(!S)return;let C=S.dataset.benchAction;C==="open-run"?await L(S.dataset.runId||""):C==="stop"?await T(S.dataset.runId||""):C==="fingerprint-history"&&await G(S.dataset.fingerprint||"")},ye=async B=>{let S=B.target.closest("[data-bench-form]");S&&(B.preventDefault(),S.dataset.benchForm==="run"?await E(S):S.dataset.benchForm==="human"&&await H(S))},Ae=B=>{B&&(B.elements.label&&B.elements.label.value!==s.config.label&&(s.labelTouched=!0),s.config=n(B),B.elements.suite_id&&(s.selectedSuiteId=Number(B.elements.suite_id.value)||s.selectedSuiteId))},J=B=>{let S=B.target.closest('[data-bench-form="run"]');S&&Ae(S)};return e.addEventListener("click",Y),e.addEventListener("submit",ye),e.addEventListener("input",J),e.addEventListener("change",J),{show(){if(t&&t("benchmark"),!s.labelTouched){s.config.label=ys();let B=a()?.querySelector('input[name="label"]');B&&(B.value=s.config.label)}k(),w({refreshAll:!s.referenceLoaded})},refresh(){return k(),w({refreshAll:!0})},destroy(){e.removeEventListener("click",Y),e.removeEventListener("submit",ye),e.removeEventListener("input",J),e.removeEventListener("change",J),s.refreshStream&&s.refreshStream(),s.refreshStream=null,s.tickTimer&&window.clearInterval(s.tickTimer)}}}var mn={};Wt(mn,{exportCsv:()=>fa,exportableResult:()=>ba,render:()=>bl,renderReport:()=>pa,reportError:()=>ga,reportLoading:()=>Ds});var Pr=[10,25,50,100],Lr=500,Ro=["law_name","law_level","law_category","law_modified_date","article_count"],Co=["jid","court_normalized","title","jdate","matched_laws","citation_count"],Po={A:"\u689D\u6587",C:"\u7AE0\u7BC0"};function ma(e){return e?.label||e?.id||"\u8CC7\u6599\u5EAB"}function da(e,t){let s={};for(let a of e.fields||[]){let n=a.type==="checkbox"?!1:a.type==="multiselect"?[]:"",i=a.default===void 0?n:a.default;s[a.key]=Array.isArray(i)?[...i]:i}return{values:s,page:1,pageSize:t,result:null,sort:null,columnFilters:{},fuzzyTerms:[]}}function Io(e,t){let s=e.visibleWhen;if(!s)return!0;for(let[a,n]of Object.entries(s))if(Array.isArray(n)&&!n.map(String).includes(String(t[a]??"")))return!1;return!0}function pn(e,t){return(e.fields||[]).filter(s=>Io(s,t))}function Bo(e,t){return`filter-${e.id}-${t}`}function ds(e){return e==null?"":r(String(e))}function rn(e,t,s){let a=s[t.key],n=Bo(e,t.key),i=t.help?`<span class="field-help">${r(t.help)}</span>`:"";if(t.type==="checkbox")return`<div class="field">
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
    </label>`;if(t.type==="select"){let l=(t.options||[]).map(d=>`<option value="${ds(d.value)}" ${String(d.value)===String(a??"")?"selected":""}>${r(d.label??d.value)}</option>`).join("");return`<div class="field">${o}
      <select class="select" id="${n}" name="${r(t.key)}">${l}</select>
      ${i}
    </div>`}if(t.type==="multiselect"){let l=new Set((Array.isArray(a)?a:[]).map(String)),d=(t.options||[]).map(c=>`<label class="multi-option">
          <input type="checkbox" name="${r(t.key)}" value="${ds(c.value)}" ${l.has(String(c.value))?"checked":""} />
          <span>${r(c.label??c.value)}</span>
        </label>`).join("");return`<div class="field">${o}
      <div class="multi-select">${d}</div>
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
  </div>`}function jr(e,t,{focusTable:s=!1}={}){let a=pn(e,t.values),n=[];for(let i=0;i<a.length;i+=1){let o=a[i],l=a[i+1];o.type==="date"&&l&&l.type==="date"?(n.push(`<div class="field-row">${rn(e,o,t.values)}${rn(e,l,t.values)}</div>`),i+=1):n.push(rn(e,o,t.values))}return`<form id="data-filter-form" autocomplete="off">
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
  </form>`}function ua(e,t,s){let a={...s.values};for(let n of pn(t,a))if(n.type==="checkbox"){let i=e.querySelector(`[name="${n.key}"]`);a[n.key]=!!i?.checked}else if(n.type==="multiselect")a[n.key]=Array.from(e.querySelectorAll(`[name="${n.key}"]:checked`)).map(i=>i.value);else{let i=e.querySelector(`[name="${n.key}"]`);a[n.key]=i?i.value:""}return a}function Ir(e,t){let s={};for(let a of pn(e,t.values)){let n=t.values[a.key];a.type==="checkbox"?s[a.key]=!!n:a.type==="multiselect"?s[a.key]=Array.isArray(n)?n:[]:a.type==="number"?s[a.key]=n===""||n===null?"":Number(n):s[a.key]=n??""}return s}function on(e,t){let s=Ir(e,t);return Array.isArray(t.fuzzyTerms)&&t.fuzzyTerms.length&&(s.keywords=[...t.fuzzyTerms]),(e.id==="postgres"||e.id==="parquet")&&t.sort?.key&&(s.sort=`${t.sort.key}:${t.sort.direction}`,s.schema_preview=!0),t.columnFilters&&Object.keys(t.columnFilters).length>0&&(s.column_filters=t.columnFilters),s}function Oo(e){if(e.status==="operational")return"";let t=e.status==="unavailable"?"danger":e.status==="degraded"?"warn":"info";return`<div class="sidebar-notice">${Ee({tone:t,title:`${ma(e)} ${Bt(e.status).label}`,text:r(e.detail||"\u76EE\u524D\u7121\u6CD5\u4F7F\u7528\u9019\u500B\u8CC7\u6599\u4F86\u6E90\u3002")})}</div>`}function Do(e,t){return`<label class="field data-source-field">
    <span class="field-label">\u8CC7\u6599\u4F86\u6E90</span>
    <select class="select" name="database">
      ${e.map(s=>{let a=Bt(s.status);return`<option value="${r(s.id)}" ${s.id===t?"selected":""}>${r(s.label)} \xB7 ${r(a.label)}</option>`}).join("")}
    </select>
  </label>`}function Tr(e,t){return`<nav class="data-nav" aria-label="\u8CC7\u6599\u67E5\u8A62\u529F\u80FD">
    ${[{id:"law",label:"\u67E5\u8A62\u6CD5\u898F\u547D\u4EE4",hint:"Fuzzy \u6CD5\u898F\u540D\u7A31\u3001\u985E\u5225\u8207\u547D\u4EE4",icon:"file"},{id:"judgment",label:"\u67E5\u8A62\u5224\u6C7A",hint:"Fuzzy \u6CD5\u9662\u3001\u6848\u865F\u8207\u6848\u7531",icon:"layers"},{id:"schema",label:"\u8CC7\u6599\u5EAB Schema",hint:"\u8CC7\u6599\u8868\u3001\u6B04\u4F4D\u8207\u9810\u89BD",icon:"table"}].map(a=>{let n=a.id==="schema"?t==="schema":t==="query"&&e===a.id;return`<button class="data-nav-item${n?" is-active":""}" type="button"
          data-action="data-nav" data-tab="${a.id}" ${n?'aria-current="page"':""}>
          <span class="data-nav-icon">${m(a.icon,15)}</span>
          <span class="data-nav-copy">
            <strong>${r(a.label)}</strong>
            <small>${r(a.hint)}</small>
          </span>
        </button>`}).join("")}
  </nav>`}function Fo(e,t,s){if(t.id!=="postgres"&&t.id!=="parquet")return"";let a=Array.isArray(s.fuzzyTerms)?s.fuzzyTerms:[],n=e==="law"?"Fuzzy \u6CD5\u898F\uFF0F\u547D\u4EE4":"Fuzzy \u5224\u6C7A",i=e==="law"?"\u8F38\u5165\u6CD5\u898F\u540D\u7A31\u6216\u76F8\u8FD1\u5B57\u2026":"\u8F38\u5165\u6CD5\u9662\u3001\u6848\u865F\u3001\u6848\u7531\u6216\u76F8\u8FD1\u5B57\u2026";return`<div class="data-fuzzy" data-data-fuzzy data-fuzzy-kind="${e}">
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
  </div>`}function ln(e,t,s=""){let a=Array.isArray(e.tables)?e.tables:[],n=a.length?a.map(i=>`<button class="schema-item ${String(i.id)===String(s||"")?"is-selected":""}" type="button"
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
  </div>`}function zo(e){return{postgres:"PostgreSQL \u67E5\u8A62\u4F7F\u7528\u53C3\u6578\u5316\u689D\u4EF6\u8207\u5206\u9801\uFF0C\u50C5\u8B80\u53D6\u8CC7\u6599\u3002",parquet:"Parquet \u67E5\u8A62\u76F4\u63A5\u6383\u63CF\u76EE\u524D\u6700\u65B0\u7684\u5FEB\u7167\uFF1B\u52FE\u9078\u539F\u59CB JSON \u6703\u589E\u52A0\u56DE\u50B3\u91CF\u8207\u6E32\u67D3\u6642\u9593\u3002",qdrant:"Qdrant \u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\uFF1B\u9700\u8981\u5148\u5B8C\u6210\u5411\u91CF\u7D22\u5F15\u3002\u6AA2\u7D22\u7D50\u679C\u53EA\u5305\u542B\u7D22\u5F15\u4E2D\u5BE6\u969B\u5B58\u5728\u7684\u5224\u6C7A\uFF0C\u4E0D\u6703\u7522\u751F\u865B\u69CB\u8CC7\u6599\u3002",indexeddb:"IndexedDB \u53EA\u5728\u9019\u500B\u700F\u89BD\u5668\u5167\u67E5\u8A62\uFF0C\u4E0D\u6703\u7D93\u904E\u4F3A\u670D\u5668\uFF1B\u6E05\u9664\u7DB2\u7AD9\u8CC7\u6599\u5F8C\u7D00\u9304\u6703\u6D88\u5931\u3002"}[e.id]||r(e.detail||"")}function Ho(e){return`<div class="report-empty">
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
  </div>`}function Ds(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${r(ma(e))} \u67E5\u8A62\u4E2D</div>
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
  </div>`}function ga(e,t){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${r(ma(t))} \u67E5\u8A62\u5931\u6557</div>
        <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${Ee({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u67E5\u8A62\u7D50\u679C",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="retry">
          ${m("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function Uo(e){if(!e.length)return'<div class="report-empty-inline">\u9019\u6B21\u67E5\u8A62\u6C92\u6709\u53EF\u5448\u73FE\u7684\u5206\u5E03\u8CC7\u6599\u3002</div>';let t=Math.max(...e.map(s=>Number(s.value)||0),1);return`<div class="distribution">
    ${e.map(s=>{let a=Number(s.value)||0,n=Math.max(1.5,a/t*100);return`<div class="dist-row">
          <span class="dist-label" title="${r(s.label||"\u672A\u5206\u985E")}">${r(s.label||"\u672A\u5206\u985E")}</span>
          <span class="dist-track"><span class="dist-bar" style="width:${n.toFixed(1)}%"></span></span>
          <span class="dist-value">${u(a)}</span>
        </div>`}).join("")}
  </div>`}function Br(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="law_documents"}function Qo(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="judgment_documents"}function Go(e){return e&&e.database==="qdrant"&&String(e.table||"").startsWith("judgment")}function Jo(e){let t=e._jid||e.jid;return t?`<button class="law-link judgment-link" type="button" data-action="open-judgment"
    data-jid="${r(String(t))}"
    title="\u6AA2\u8996\u300C${r(String(t))}\u300D\u7684\u5224\u6C7A\u539F\u6587">${r(String(t))}${m("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}var Vo={jid:"jid",court:"court",court_normalized:"court",title:"title",jdate:"jdate",matched_laws:"matched_laws",citation_count:"citation_count",full_text_length:"full_text_length"};function Wo(e,t,s,a=!1,n=!0,i=!1){let o=a?e.key:e.label||e.key,l=n?t?Vo[e.key]||e.key:i?e.key:null:null;if(!l)return`<th scope="col">${r(o)}</th>`;let d=s?.key===l,c=d?s.direction:null,v=c==="asc"?"ascending":c==="desc"?"descending":"none",$=c==="asc"?"\u2191":c==="desc"?"\u2193":"\u2195";return`<th scope="col" aria-sort="${v}">
    <button class="table-sort${d?" is-active":""}" type="button"
      data-action="sort-column" data-sort-key="${r(l)}"
      title="\u4F9D${r(o)}\u6392\u5E8F">
      <span>${r(o)}</span>
      <span class="table-sort-icon" aria-hidden="true">${$}</span>
    </button>
  </th>`}function Ko(e,t){if(!Br(e)||!t)return null;let s=t._law_key||t.law_name;if(!s)return null;let a=e.meta?.dataset,n=t._law_source_type||(a&&a!=="all"?a:"");return{lawKey:String(s),sourceType:String(n||""),lawName:String(t.law_name||"")}}function Yo(e,t,s){let a=e[t.key];return a==null||a===""?"\u2014":`<button class="law-link" type="button" data-action="open-law"
    data-law-key="${r(s.lawKey)}"
    data-law-source="${r(s.sourceType)}"
    data-law-name="${r(s.lawName)}"
    title="\u6AA2\u8996\u300C${r(String(a))}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${r(String(a))}${m("chevronRight",12,"law-link-icon")}</button>`}function Or(e,{useColumnKeys:t=!1,sortable:s=!0,sortableAll:a=!1,searchValues:n=null,compact:i=!1}={}){let o=Array.isArray(e.columns)?e.columns:[],l=Array.isArray(e.rows)?e.rows:[],d=(e.page-1)*e.page_size,c=Br(e),v=Qo(e),$=Go(e),h=e.meta?.sort||null,g=n?`<tr class="schema-search-row">
        <th scope="col" class="cell-index-head"></th>
        ${o.map(p=>`<th scope="col">
              <div class="schema-search-wrap">
                <input class="schema-search-input" type="search"
                  data-schema-search="${r(p.key)}"
                  value="${r(String(n[p.key]??""))}"
                  placeholder="\u641C\u5C0B ${r(p.key)}"
                  autocomplete="off" />
              </div>
            </th>`).join("")}
      </tr>`:"";return o.length?l.length?`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">${u(l.length)} rows \xB7 \u7B2C ${e.page} \u9801${c?" \xB7 \u9EDE\u9078\u6CD5\u898F\u540D\u7A31\u53EF\u6AA2\u8996\u5B8C\u6574\u689D\u6587":v?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u6B04\u4F4D\u6A19\u984C\u53EF\u6392\u5E8F":$?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u4F9D\u76F8\u4F3C\u5EA6\u6392\u5E8F":""}</span>
    </div>
    <div class="table-wrap">
      <table class="data-table${i?" is-compact":""}">
        <thead>${g}<tr>
          <th scope="col" class="cell-index-head">#</th>
          ${o.map(p=>Wo(p,v,h,t,s,a)).join("")}
        </tr></thead>
        <tbody>
          ${l.map((p,w)=>`<tr>
                <td class="cell-mono cell-empty cell-index">${d+w+1}</td>
                ${o.map(k=>{if((v||$)&&k.key==="jid")return`<td class="cell-jid">${Jo(p)}</td>`;let L=c&&k.key==="law_name"?Ko(e,p):null;if(L)return`<td>${Yo(p,k,L)}</td>`;let T={date:"cell-date",datetime:"cell-datetime",duration:"cell-duration",number:"cell-number"}[k.type];return`<td${T?` class="${T}"`:""}>${Xs(p[k.key],k.type||"text")}</td>`}).join("")}
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
    </div>`}function Xo(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,n=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${n} \u9801 \xB7
      \u986F\u793A ${u(i)}\u2013${u(o)} / ${u(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Pr.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${m("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=n?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${m("chevronRight",13)}</button>
    </div>
  </div>`}function Dr(e){return!Array.isArray(e)||!e.length?"":`<div class="warnings">${e.map(t=>`<div class="warning-line">${r(t)}</div>`).join("")}</div>`}function pa(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.columns)?e.columns:[],a=Array.isArray(e.summary)?e.summary:[],n=Array.isArray(e.distribution)?e.distribution:[],i=Number(e.total)||0,o=e.query_text||"",l=e.database||"",d=e.status||"ok",c=e.meta?.table_label||e.table||e.label||"query result";return`<div class="report-card" data-database="${r(l)}">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT \xB7 ${r(String(l).toUpperCase())}</div>
        <div class="report-title">
          ${r(e.label||l)}
          ${Je(d)}
          <span class="chip">${r(c)}</span>
        </div>
        <div class="report-sub">
          ${u(i)} \u7B46\u7B26\u5408 \xB7
          ${me(e.duration_ms)} \xB7
          ${r(String(l).toUpperCase())} / ${r(String(e.table||"\u2014"))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${m("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${m("file",14)}<span>JSON</span></button>
      </div>
    </div>

    ${e.message?`<div class="report-alert">${Ee({tone:d==="not_configured"?"info":d==="danger"?"danger":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r(e.message)})}</div>`:""}

    ${a.length?`<div class="summary-strip">
            ${a.slice(0,4).map(v=>`<div class="summary-item">
                  <div class="summary-label">${r(v.label)}</div>
                  <div class="summary-value">${r(v.value)}</div>
                </div>`).join("")}
          </div>`:""}

    <div class="report-grid">
      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u7D50\u679C\u5206\u5E03</span>
          <span class="muted" style="font-size:9.5px">${n.length} groups</span>
        </div>
        ${Uo(n)}
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
        ${Dr(e.warnings)}
      </div>
    </div>

    ${s.length||t.length?Or(e,{compact:!0,sortableAll:!0,searchValues:e.meta?.searchable?e.meta.column_filters||{}:null}):""}
    ${i||s.length?Xo({...e,total:i,page:Number(e.page)||1,page_size:Number(e.page_size)||25}):""}
  </div>`}function Nr(e){return`<div class="report-card schema-preview">
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
  </div>`}function cn(e,t,{columnFilters:s={},searchEnabled:a=!1}={}){let n=Array.isArray(e.columns)?e.columns:[],i=Array.isArray(e.rows)?e.rows:[],o=e.message?`<div class="report-alert">${Ee({tone:e.status==="ok"?"info":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r(e.message)})}</div>`:"";return`<div class="report-card schema-preview">
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
    ${Or({...e,page:1,page_size:10},{useColumnKeys:!0,sortable:!0,sortableAll:!0,searchValues:a?s:null})}
    ${Dr(e.warnings)}
    <div class="schema-preview-footer">
      <span>\u9810\u89BD\u524D ${u(i.length)} \u7B46</span>
      <strong>\u5171 ${u(e.total)} \u7B46</strong>
    </div>
  </div>`}function Er(e,t){return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW</div>
        <div class="report-title">${r(t||"\u8CC7\u6599\u8868")}</div>
        <div class="report-sub">\u7121\u6CD5\u8B80\u53D6\u8CC7\u6599\u8868\u9810\u89BD\u3002</div>
      </div>
    </div>
    ${Ee({tone:"danger",title:"\u8B80\u53D6\u5931\u6557",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
  </div>`}function Zo(e){return`<div class="report-empty">
    ${ct({iconName:"table",title:"\u9078\u64C7\u8CC7\u6599\u8868\u9810\u89BD",text:`\u5F9E\u5DE6\u5074 ${ma(e)} \u7684 Schema \u6E05\u55AE\u9EDE\u9078\u8CC7\u6599\u8868\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6B04\u4F4D\u540D\u7A31\u3001\u524D 10 \u7B46\u8CC7\u6599\u8207\u7E3D\u7B46\u6578\u3002`})}
  </div>`}function dn(e){return e.is_current===!0?Je("ok","\u73FE\u884C"):e.law_abandon_note?Je("empty","\u5DF2\u5EE2\u6B62"):e.is_current===!1?Je("empty","\u6B77\u53F2\u7248\u672C"):Je("not_configured","\u72C0\u614B\u672A\u63D0\u4F9B")}function Ze(e,t){return`<div class="law-meta-item">
    <div class="law-meta-label">${r(e)}</div>
    <div class="law-meta-value">${t||"\u2014"}</div>
  </div>`}function us(e){return e?It(e):"\u2014"}function el(e){return e?.meta?.metadata_source==="postgresql"?"PostgreSQL metadata":e?.meta?.metadata_source==="parquet"?"Parquet snapshot":"\u2014"}function un(e,t){return t?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">${r(e)}</span>
    </div>
    <div class="law-text-block">${r(String(t).trim())}</div>
  </div>`:""}function tl(e,t,{open:s=!1}={}){return t?`<details class="report-section law-disclosure" data-law-history ${s?"open":""}>
    <summary class="law-disclosure-summary">
      <span class="report-section-title">${r(e)}</span>
      <span class="law-disclosure-hint">\u9810\u8A2D\u6536\u5408 \xB7 \u9EDE\u64CA\u5C55\u958B</span>
      ${m("chevronDown",14,"law-disclosure-chevron")}
    </summary>
    <div class="law-text-block">${r(String(t).trim())}</div>
  </details>`:""}function sl(e){let t=Array.isArray(e)?e:[],s=t.map(a=>{let n=a?.name||a?.url||"";return n?a.url?`<a class="law-attachment" href="${r(a.url)}" target="_blank" rel="noopener noreferrer">
          ${m("file",12)}<span>${r(n)}</span>${m("external",11)}
        </a>`:`<span class="law-attachment">${m("file",12)}<span>${r(n)}</span></span>`:""}).filter(Boolean).join("");return s?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">\u9644\u4EF6</span>
      <span class="muted">${u(t.length)}</span>
    </div>
    <div class="law-attachment-list">${s}</div>
  </div>`:""}function Fr(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function al(e){let t=Array.isArray(e.articles)?e.articles:[],s=t.filter(o=>o.article_type==="C").length,a=t.length-s,n=s?`${u(a)} \u689D \xB7 ${u(s)} \u7AE0\u7BC0`:`${u(a)} \u689D`,i=t.map(o=>{let l=String(o.article_content||"").trim();if(!l)return"";if(o.article_type==="C")return`<div class="law-chapter">${r(l)}</div>`;let d=Po[o.article_type]||o.article_type;return`<article class="law-article"
        data-article-no="${r(Fr(o.article_no))}">
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
  </div>`}function nl(){return`<div class="law-jump-float">
    <input class="input law-article-jump-input law-jump-input"
      id="law-article-jump-float" type="text" inputmode="numeric"
      autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
    <button class="btn btn-secondary btn-sm" type="button"
      data-action="jump-article" data-jump-input="law-article-jump-float">\u8DF3\u81F3</button>
  </div>`}function ws(){return`<button class="btn btn-secondary btn-sm" type="button" data-action="back-to-results">
    ${m("chevronLeft",14)}<span>\u8FD4\u56DE\u67E5\u8A62\u7D50\u679C</span>
  </button>`}function rl(e){return`<div class="law-report">
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
  </div>`}function il(e,t){return`<div class="law-report">
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
        ${Ee({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function ol(e){let t=Array.isArray(e.versions)?e.versions:[];if(t.length<1)return"";let s=e.selected_version_id??"";return`<label class="law-version-select">
    <span>\u689D\u6587\u7248\u672C</span>
    <select class="select" data-action="select-law-version" aria-label="\u9078\u64C7\u6CD5\u898F\u689D\u6587\u7248\u672C">
      ${t.map(a=>{let n=String(a.update_date||"").match(/\d{4}\/\d{1,2}\/\d{1,2}/)?.[0]||"",i=[`#${a.version_id}`,a.is_current?"\u76EE\u524D":"\u6B77\u53F2",n,a.article_count_for_law?`${u(a.article_count_for_law)} \u7B46`:"\u7121\u689D\u6587\u5FEB\u7167"].filter(Boolean).join(" \xB7 ");return`<option value="${r(a.version_id)}" ${String(a.version_id)===String(s)?"selected":""}>${r(i)}</option>`}).join("")}
    </select>
  </label>`}function ll(e){let t=e.change_summary||{},s=Object.values(t).reduce((o,l)=>o+(Number(l)||0),0),a=Array.isArray(e.changes)?e.changes:[];if(!e.changes_available&&!s)return"";let n={added:"\u65B0\u589E",modified:"\u4FEE\u6539",removed:"\u79FB\u9664"},i=["added","modified","removed"].map(o=>`${n[o]} ${u(t[o]||0)}`).join(" \xB7 ");return`<details class="report-section law-version-changes">
    <summary>
      <span class="report-section-title">\u7248\u672C\u8B8A\u66F4</span>
      <span class="muted">${r(i)}</span>
    </summary>
    <div class="law-version-change-list">
      ${a.length?a.slice(0,20).map(o=>{let l=o.change_type==="added"?"badge-ok":o.change_type==="removed"?"badge-danger":"badge-warn",d=o.before_content?`<details><summary>\u8B8A\u66F4\u524D</summary><pre>${r(o.before_content)}</pre></details>`:"",c=o.after_content?`<details><summary>\u8B8A\u66F4\u5F8C</summary><pre>${r(o.after_content)}</pre></details>`:"";return`<div class="law-version-change">
                  <div class="law-version-change-head">
                    <span class="badge ${l}">${r(n[o.change_type]||o.change_type)}</span>
                    <strong>${r(o.article_no||o.article_key)}</strong>
                  </div>
                  ${d}${c}
                </div>`}).join(""):'<div class="report-empty-inline">\u6B64\u7248\u672C\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u8B8A\u66F4\u3002</div>'}
      ${e.changes_truncated?'<div class="report-empty-inline">\u50C5\u986F\u793A\u524D 20 \u7B46\u8B8A\u66F4\uFF1BAPI \u56DE\u50B3\u4E0A\u9650 200 \u7B46\u3002</div>':""}
    </div>
  </details>`}function cl(e,{database:t="",lawPage:s=1,historyOpen:a=!1}={}){let n=Array.isArray(e.warnings)?e.warnings:[],i=e.law_name||e.law_key||"\u6CD5\u898F",o=(Array.isArray(e.articles)?e.articles:[]).filter(w=>w.article_type!=="C").length,l=el(e),d=e.meta?.articles_source==="postgresql"?"PostgreSQL \u689D\u6587\u7248\u672C":e.meta?.articles_source==="parquet"?"Parquet \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",c=e.meta?.snapshot||"",v=e.meta?.articles_source==="postgresql"&&e.selected_version_id!==null&&e.selected_version_id!==void 0?`\u689D\u6587\u7248\u672C #${e.selected_version_id}`:"",$=[l,d,v,c].filter(Boolean).join(" \xB7 "),h=e.source_type==="law"?"\u6CD5\u5F8B":e.source_type==="order"?"\u547D\u4EE4":e.source_type||"\u2014",g=e.version||{},p=[Ze("\u6CD5\u898F\u4F4D\u968E",r(e.law_level||"\u2014")),Ze("\u6CD5\u898F\u985E\u5225",r(e.law_category||"\u2014")),Ze("\u7570\u52D5\u65E5\u671F",us(e.law_modified_date)),Ze("\u751F\u6548\u65E5\u671F",us(e.law_effective_date)),Ze("\u689D\u6587\u6578",u(e.article_count)),Ze("\u8CC7\u6599\u72C0\u614B",dn(e)),Ze("\u82F1\u8B6F\u540D\u7A31",r(e.eng_law_name||"\u2014")),Ze("\u6CD5\u898F\u8B58\u5225",`<span class="mono">${r(e.law_key||"\u2014")}</span>`)];return g.first_seen_version_id!==null&&g.first_seen_version_id!==void 0&&p.push(Ze("\u9996\u6B21\u6536\u9304\u7248\u672C",`#${r(g.first_seen_version_id)}`)),g.last_seen_version_id!==null&&g.last_seen_version_id!==void 0&&p.push(Ze("\u6700\u5F8C\u6536\u9304\u7248\u672C",`#${r(g.last_seen_version_id)}`)),g.last_seen_at&&p.push(Ze("\u6700\u5F8C\u6536\u9304\u6642\u9593",r(qe(g.last_seen_at)))),g.selected_version_id!==null&&g.selected_version_id!==void 0&&p.push(Ze("\u689D\u6587\u7248\u672C",`#${r(g.selected_version_id)} \xB7 ${e.meta?.selected_version_is_current?"\u76EE\u524D":"\u6B77\u53F2"}`)),`<div class="law-report">
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
            ${dn(e)}
            <span class="chip">${r(h)}</span>
          </div>
          <div class="report-sub">
            ${r([e.law_level,e.law_category].filter(Boolean).join(" \xB7 ")||"\u2014")} \xB7 ${u(e.article_count)} \u689D \xB7 \u7570\u52D5 ${us(e.law_modified_date)}
          </div>
        </div>
        <div class="report-actions">
          ${ol(e)}
          ${e.law_url?`<a class="btn btn-secondary btn-sm" href="${r(e.law_url)}" target="_blank" rel="noopener noreferrer">${m("external",14)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:""}
        </div>
      </div>

      ${n.length?`<div class="report-alert">${Ee({tone:e.status==="degraded"?"warn":"info",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n.map(w=>r(w)).join("<br />")})}</div>`:""}

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u689D\u6587\u6578</div>
          <div class="summary-value">${u(e.article_count)}</div>
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
          <div class="summary-value">${dn(e)}</div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u6CD5\u898F\u8CC7\u8A0A</span>
          <span class="muted" style="font-size:9.5px">${r(l)}</span>
        </div>
        <div class="law-meta-grid">${p.join("")}</div>
      </div>

      ${ll(e)}
      ${un("\u6CD5\u898F\u524D\u8A00",e.law_foreword)}
      ${tl("\u6CD5\u898F\u6CBF\u9769",e.law_histories,{open:a})}
      ${un("\u751F\u6548\u8AAA\u660E",e.law_effective_note)}
      ${un("\u5EE2\u6B62\u8AAA\u660E",e.law_abandon_note)}
      ${sl(e.attachments)}
      ${al(e)}
    </div>
    ${o>100?nl():""}
  </div>`}function dl(e){return`<div class="law-report judgment-report">
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
  </div>`}function ul(e,t){return`<div class="law-report judgment-report">
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
        ${Ee({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function pl(e){let t=String(e||"").trim();return t?`<button class="law-link judgment-citation-law" type="button"
    data-action="open-law"
    data-law-key="${r(t)}"
    data-law-source=""
    data-law-name="${r(t)}"
    title="\u6AA2\u8996\u300C${r(t)}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${r(t)}${m("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}function ml(e){let t=new Map;for(let s of Array.isArray(e.citations)?e.citations:[]){let a=String(s.law_name||"").trim();if(!a)continue;t.has(a)||t.set(a,new Set);let n=String(s.article_no||"").trim();n&&t.get(a).add(n)}return t.size?`<div class="judgment-citation-groups">
    ${[...t.entries()].map(([s,a])=>`<div class="judgment-citation-group">
          ${pl(s)}
          <span class="judgment-citation-articles">${[...a].map(n=>r(n)).join("\u3001")||"\u2014"}</span>
        </div>`).join("")}
  </div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5F15\u7528\u660E\u7D30\u3002</div>'}function gl(e,{database:t="postgres"}={}){let s=Array.isArray(e.matched_laws)?e.matched_laws:[],a=e.title||e.jid||"\u5224\u6C7A",n=String(e.full_text||""),i=Number(e.full_text_length)||n.length||0,o=["PostgreSQL \u5224\u6C7A\u6587\u4EF6",e.source_archive].filter(Boolean).join(" \xB7 "),l=[Ze("\u6848\u865F",r(e.jid||"\u2014")),Ze("\u5E74\u5EA6",r(e.jyear||"\u2014")),Ze("\u5B57\u5225",r(e.jcase||"\u2014")),Ze("\u865F\u78BC",r(e.jno||"\u2014")),Ze("\u6CD5\u9662",r(e.court||"\u2014")),Ze("\u6848\u7531",r(e.title||"\u2014")),Ze("\u88C1\u5224\u65E5\u671F",us(e.jdate)),Ze("\u4F86\u6E90\u58D3\u7E2E\u6A94",r(e.source_archive||"\u2014")),Ze("\u5168\u6587\u9577\u5EA6",`${u(i)} \u5B57`),Ze("\u5F15\u7528\u6578",u(e.citation_count))];return e.import_run_id!==null&&e.import_run_id!==void 0&&l.push(Ze("\u532F\u5165 Run",`#${r(e.import_run_id)}`)),`<div class="law-report judgment-report">
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
            ${u(i)} \u5B57
          </div>
        </div>
        <div class="report-actions">
          ${e.pdf_url?`<a class="btn btn-secondary btn-sm" href="${r(e.pdf_url)}" target="_blank" rel="noopener noreferrer">${m("external",14)}<span>PDF</span></a>`:""}
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
          <div class="summary-value">${u(s.length)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u5F15\u7528\u6578</div>
          <div class="summary-value">${u(e.citation_count)}</div>
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
          <span class="muted">${u(s.length)} \u6CD5\u898F \xB7 ${u(e.citation_count)} \u5F15\u7528</span>
        </div>
        ${ml(e)}
      </div>

      <div class="report-section judgment-text-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5224\u6C7A\u539F\u6587</span>
          <span class="muted">${u(i)} \u5B57</span>
        </div>
        ${n?`<div class="judgment-fulltext">${r(n)}</div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5168\u6587\u3002</div>'}
      </div>
    </div>
  </div>`}function Rr(e){return`"${(e==null?"":typeof e=="object"?JSON.stringify(e):String(e)).replace(/"/g,'""')}"`}function fa(e){let t=e.columns||[],s=e.rows||[],a=[["#",...t.map(i=>i.label||i.key)].map(Rr).join(",")],n=((Number(e.page)||1)-1)*(Number(e.page_size)||25);return s.forEach((i,o)=>{a.push([n+o+1,...t.map(l=>i[l.key])].map(Rr).join(","))}),`\uFEFF${a.join(`\r
`)}`}function ba(e){return{...e,rows:(e.rows||[]).map(t=>{let s={};for(let[a,n]of Object.entries(t))a.startsWith("_")||(s[a]=n);return s})}}function fl(e){return e==="rag"?"RAG \u63D0\u554F":e==="data"?"\u8CC7\u6599\u67E5\u8A62":e||"\u5176\u4ED6"}async function Cr(e,t){let s=performance.now(),a=Ir(e,t),n=String(a.store||"query_history"),i=String(a.keyword||""),o=t.page,l=t.pageSize,d=[],c=[],v=[],$=[];if(n==="audit_events"){try{let T=Number(await ns("audit.last_event_id",0))||0,H=await U.versioningAudit({since_id:T,limit:500}),G=Array.isArray(H?.events)?H.events:[];G.length&&await mr(G.map(ye=>({...ye,dataset:"judgment"})));let Y=Number(H?.latest_event_id||0);Y>T&&await Bs("audit.last_event_id",Y)}catch(T){d.push(`\u7248\u672C audit \u540C\u6B65\u5931\u6557\uFF1A${T.message||T}`)}c=(await gr({keyword:i,limit:Lr})).map(T=>({created_at:T.created_at,dataset:T.dataset,issue_month:T.issue_month,change_type:T.change_type,jid:T.jid,detail:T.detail})),v=[{key:"created_at",label:"\u6642\u9593",type:"datetime"},{key:"dataset",label:"\u8CC7\u6599\u96C6",type:"text"},{key:"issue_month",label:"\u6708\u4EFD",type:"mono"},{key:"change_type",label:"\u8B8A\u66F4",type:"status"},{key:"jid",label:"\u6848\u865F",type:"mono"},{key:"detail",label:"\u6458\u8981",type:"longtext"}];let E=new Map;c.forEach(T=>E.set(T.change_type||"unknown",(E.get(T.change_type||"unknown")||0)+1)),$=Array.from(E.entries()).map(([T,H])=>({label:T,value:H})).sort((T,H)=>H.value-T.value)}else if(n==="settings"){c=(await fr({keyword:i})).map(T=>({key:T.key,value:br(T.value),updated_at:T.updated_at})),v=[{key:"key",label:"\u8A2D\u5B9A\u9375",type:"mono"},{key:"value",label:"\u503C",type:"longtext"},{key:"updated_at",label:"\u66F4\u65B0\u6642\u9593",type:"datetime"}];let E=new Map;c.forEach(T=>{let H=String(T.key||"").split(".")[0]||"\u5176\u4ED6";E.set(H,(E.get(H)||0)+1)}),$=Array.from(E.entries()).map(([T,H])=>({label:T,value:H})).sort((T,H)=>H.value-T.value)}else{c=(await ia({keyword:i,limit:Lr})).map(T=>({kind:fl(T.kind),title:T.title,detail:T.detail,created_at:T.created_at})),v=[{key:"kind",label:"\u985E\u578B",type:"text"},{key:"title",label:"\u67E5\u8A62\u5167\u5BB9",type:"longtext"},{key:"detail",label:"\u6458\u8981",type:"longtext"},{key:"created_at",label:"\u6642\u9593",type:"datetime"}];let E=new Map;c.forEach(T=>E.set(T.kind,(E.get(T.kind)||0)+1)),$=Array.from(E.entries()).map(([T,H])=>({label:T,value:H})).sort((T,H)=>H.value-T.value)}let h=c.length,g=(o-1)*l,p=c.slice(g,g+l),w=Math.round(performance.now()-s),k=dr();return k&&d.push("IndexedDB \u7121\u6CD5\u4F7F\u7528\uFF0C\u8CC7\u6599\u66AB\u5B58\u5728\u8A18\u61B6\u9AD4\uFF0C\u91CD\u65B0\u6574\u7406\u5F8C\u6703\u6D88\u5931\u3002"),{database:"indexeddb",label:"IndexedDB",status:k?"degraded":"ok",message:k?"\u700F\u89BD\u5668\u4E0D\u5141\u8A31\u4F7F\u7528 IndexedDB\uFF0C\u672C\u9801\u6539\u7528\u8A18\u61B6\u9AD4\u66AB\u5B58\u3002":null,table:n,columns:v,rows:p,total:h,page:o,page_size:l,duration_ms:w,summary:[{label:"\u7B26\u5408\u7B46\u6578",value:String(h)},{label:"\u76EE\u524D\u9801\u9762",value:`${p.length} \u7B46`},{label:"\u5132\u5B58\u6A21\u5F0F",value:ra()==="indexeddb"?"IndexedDB":"\u8A18\u61B6\u9AD4"},{label:"\u67E5\u8A62\u8017\u6642",value:`${w} ms`}],distribution:$,query_text:`INDEXEDDB OPEN 'judgment-console'
OBJECT STORE '${n}'
FILTER ${i?`keyword \u2248 '${i}'`:"1 = 1"}
ORDER BY created_at DESC
LIMIT ${l} OFFSET ${g}`,warnings:d,meta:{store:n,filters:a,client_side:!0}}}async function bl(e,t){let s=!1,a=null,n=[],i="law",o=null,l={},d=0,c=25,v="query",$=null,h=null,g=0,p=[],w=null,k=-1,L=0,E=0,T=null,H=null,G=null;e.innerHTML=`<section class="page data-page">
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
      ${Dt(null,{loading:!0})}
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
  </section>`;let Y=e.querySelector("#query-sidebar"),ye=e.querySelector("#data-nav"),Ae=e.querySelector("#db-options-wrap"),J=e.querySelector("#filter-area"),B=e.querySelector("#schema-area"),S=e.querySelector("#query-main"),C=e.querySelector("#schema-suggest-popover"),ne=e.querySelector("#catalog-meta"),ge=e.querySelector("#refresh-catalog"),V=e.querySelector("#data-judgment-stats"),Z=_=>n.find(q=>q.id===_),ae=()=>Z(i)?.databases||[],ee=_=>ae().find(q=>q.id===_),_e=(_,q)=>`${_}:${q}`,z=(_,q=i)=>l[_e(q,_.id)],be=(_,q)=>{Bs(_,q).catch(()=>{})},Me=()=>{if(!a){ne.textContent="CATALOG \xB7 \u96E2\u7DDA",ne.className="badge badge-danger badge-mono";return}let _=ae(),q=_.filter(I=>I.available).length,A=Z(i);ne.textContent=`CATALOG \xB7 ${A?.label||i} \xB7 ${q}/${_.length} \u53EF\u7528`,ne.className="badge badge-neutral badge-mono"},pe=_=>{S.innerHTML=Ho(_)},tt=()=>{let _=H?.returnScroll??G?.returnScroll;H=null,G=null;let q=ee(o),A=q?z(q):null;v==="schema"&&h?.result?S.innerHTML=cn(h.result,Ye(q,h.tableId),{columnFilters:h.columnFilters||{},searchEnabled:q.id==="postgres"||q.id==="parquet"}):A?.result?S.innerHTML=pa(A.result):q&&pe(q),typeof _=="number"&&window.requestAnimationFrame(()=>window.scrollTo({top:_,behavior:"smooth"}))},Oe=(_="law-article-jump")=>{let q=S.querySelector(`#${_}`),A=Fr(q?.value);if(!A){M("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),q?.focus();return}let Q=[...S.querySelectorAll("[data-article-no]")].find(K=>K.dataset.articleNo===A);if(!Q){M(`\u627E\u4E0D\u5230\u7B2C ${A} \u689D\u3002`,"warn");return}Q.scrollIntoView({behavior:"instant",block:"center"}),Q.classList.add("is-jump-target"),window.setTimeout(()=>Q.classList.remove("is-jump-target"),2400)},He=async({lawKey:_,sourceType:q="",lawName:A="",versionId:I=""})=>{let Q=ee(o),K=Q?z(Q):null,ce=v==="schema"?h?.result:null;if(!Q||!K?.result&&!ce||!_)return;let Se=++d;H={seq:Se,lawKey:_,sourceType:q,lawName:A,versionId:I?String(I):"",page:1,detail:null,database:Q.id,returnScroll:window.scrollY},G=null,S.innerHTML=rl(A||_),S.scrollIntoView({behavior:"smooth",block:"start"});try{let je=await U.lawDetail(_,q,H.versionId);if(s||!H||H.seq!==Se)return;H.detail=je,H.page=1,S.innerHTML=cl(je,{database:H.database,lawPage:H.page})}catch(je){if(s||!H||H.seq!==Se)return;S.innerHTML=il(je,A||_),M(je.message||"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868\u3002","danger")}},Le=async({jid:_})=>{let q=ee(o),A=q?z(q):null,I=v==="schema"?h?.result:null;if(!q||!A?.result&&!I||!_)return;let Q=++d;H=null;let K=q.id==="parquet"?"parquet":"postgres";G={seq:Q,jid:_,detail:null,database:q.id,source:K,returnScroll:window.scrollY},S.innerHTML=dl(_),S.scrollIntoView({behavior:"smooth",block:"start"});try{let ce=await U.judgmentDetail(_,K);if(s||!G||G.seq!==Q)return;G.detail=ce,S.innerHTML=gl(ce,{database:G.database})}catch(ce){if(s||!G||G.seq!==Q)return;S.innerHTML=ul(ce,_),M(ce.message||"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587\u3002","danger")}},Qe=(_,q)=>`${i}:${_.id}:${q}`,Ye=(_,q)=>(_.tables||[]).find(A=>A.id===q)?.label||q,ft=(_,q,{sort:A=null,columnFilters:I={}}={})=>{let Q={column_filters:I};return _.id==="postgres"?(Q.table=q,Q.schema_preview=!0):_.id==="parquet"&&i==="judgment"?(Q.table="judgment_documents",Q.columns=Co):_.id==="parquet"&&(Q.dataset="all",Q.columns=Ro),A?.key&&(Q.sort=`${A.key}:${A.direction}`),Q},N=async(_,q,{sort:A=null,columnFilters:I={},quiet:Q=!1}={})=>{if(!q)return;nt();let K=Qe(_,q),ce=++g,Se=!!(Q&&h?.result&&h.key===K);$={tableId:q},h={key:K,tableId:q,loading:!0,result:null,error:null,sort:A,columnFilters:I},Se?S.setAttribute("aria-busy","true"):(B.innerHTML=ln(_,Z(i)?.label||i,q),S.innerHTML=Nr(Ye(_,q)));try{let je;if(_.id==="indexeddb"){let ve=da(_,10);ve.values.store=q,ve.page=1,je=await Cr(_,ve)}else _.id==="qdrant"?je={database:"qdrant",label:"Qdrant",status:"not_configured",message:"Qdrant collection \u9700\u8981\u8A9E\u610F\u67E5\u8A62\uFF1BSchema \u50C5\u63D0\u4F9B collection \u540D\u7A31\uFF0C\u4E0D\u5217\u51FA\u524D 10 \u7B46\u8CC7\u6599\u3002",table:q,columns:[],rows:[],total:0,page:1,page_size:10,duration_ms:0,summary:[],distribution:[],query_text:"",warnings:[],meta:{}}:(je=await U.query({database:_.id,filters:ft(_,q,{sort:A,columnFilters:I}),page:1,pageSize:10}),A?.key&&(je.meta={...je.meta||{},sort:A}));if(s||ce!==g)return;h={key:K,tableId:q,loading:!1,result:je,error:null,sort:A,columnFilters:I},S.removeAttribute("aria-busy"),v==="schema"&&$?.tableId===q&&(B.innerHTML=ln(_,Z(i)?.label||i,q),S.innerHTML=cn(je,Ye(_,q),{columnFilters:I,searchEnabled:_.id==="postgres"||_.id==="parquet"}))}catch(je){if(s||ce!==g)return;h={key:K,tableId:q,loading:!1,result:null,error:je,sort:A,columnFilters:I},S.removeAttribute("aria-busy"),v==="schema"&&$?.tableId===q&&(S.innerHTML=Er(je,Ye(_,q)))}},D=()=>{let _=ee(o);if(!_)return null;if(v==="schema"&&h?.result)return{db:_,tableId:h.tableId,columnFilters:h.columnFilters||{},sort:h.sort||null,mode:"schema"};let q=_?z(_):null,A=q?.result;return A&&(_.id==="postgres"||_.id==="parquet")?{db:_,tableId:A.table,columnFilters:q.columnFilters||{},sort:q.sort||null,mode:"query"}:null},x=(_,q,A)=>{if(!_)return;let I=`${_.db.id}:${_.tableId}:${q}`,Q=j.get(I);Q&&(window.clearTimeout(Q),j.delete(I)),nt();let K={..._.columnFilters||{}},ce=String(A||"").trim();if(ce?K[q]=ce:delete K[q],_.mode==="schema"){N(_.db,_.tableId,{sort:_.sort,columnFilters:K,quiet:!0});return}let Se=z(_.db);Se.columnFilters=K,Se.page=1,Xe(1)},j=new Map,W=()=>{(!C||C.hidden)&&!p.length&&!w||(L+=1,p=[],w=null,k=-1,C&&(C.hidden=!0,C.innerHTML=""))},F=(_,q)=>{let A=String(_||""),I=A.toLocaleLowerCase(),Q=String(q||"").toLocaleLowerCase(),K=new Array(A.length).fill(!1),ce=(Fe,We)=>{for(let et=Fe;et<Fe+We;et+=1)et>=0&&et<K.length&&(K[et]=!0)},Se=I.indexOf(Q);if(Se>=0)for(;Se>=0;)ce(Se,Q.length),Se=I.indexOf(Q,Se+Q.length);else{let Fe=[];for(let We of Q.match(/[一-鿿]{2,}/g)||[])for(let et=0;et<We.length-1;et+=1)Fe.push(We.slice(et,et+2));Fe.push(...Q.match(/[a-z0-9]+/g)||[]);for(let We of Fe){let et=I.indexOf(We);for(;et>=0;)ce(et,We.length),et=I.indexOf(We,et+We.length)}}let je="",ve=0;for(;ve<A.length;)if(K[ve]){let Fe=ve;for(;Fe<A.length&&K[Fe];)Fe+=1;je+=`<mark>${r(A.slice(ve,Fe))}</mark>`,ve=Fe}else{let Fe=ve;for(;Fe<A.length&&!K[Fe];)Fe+=1;je+=r(A.slice(ve,Fe)),ve=Fe}return je||r(A)},Ie=(_,q)=>{if(!C)return;let A=_.getBoundingClientRect(),I=Math.min(420,Math.max(220,A.width)),Q=Math.min(360,34+q*30),K=A.bottom+4;K+Q>window.innerHeight-8&&(K=Math.max(8,A.top-Q-4));let ce=Math.min(window.innerWidth-I-8,Math.max(8,A.left));C.style.width=`${I}px`,C.style.left=`${ce}px`,C.style.top=`${K}px`},Re=_=>{if(!C)return;let q=[...C.querySelectorAll(".schema-suggest-item")];q.length&&(k=Math.max(0,Math.min(q.length-1,_)),q.forEach((A,I)=>{A.classList.toggle("is-active",I===k)}),q[k].scrollIntoView({block:"nearest"}))},Be=_=>{let q=p[_],A=w;!q||!A||(W(),x(A,A.column,q))},kt=async(_,q,A,I)=>{if(!_||!A.trim()){W();return}let Q=++L;w={..._,column:q,input:I},k=-1;try{let K=await U.schemaSuggest({database:_.db.id,table:_.tableId,column:q,query:A,limit:1e3});if(Q!==L||document.activeElement!==I||!C)return;let ce=Array.isArray(K.values)?K.values:[];if(p=ce,!ce.length){W();return}let Se=Number(K.total)>ce.length?`\u5171 ${u(K.total)} \u500B\u7B26\u5408\uFF0C\u986F\u793A\u524D ${u(ce.length)} \u500B`:`\u5171 ${u(K.total)} \u500B\u7B26\u5408`;C.innerHTML=`<div class="schema-suggest-head">${r(Se)}</div>${ce.map((je,ve)=>`<button class="schema-suggest-item" type="button"
            data-schema-suggest-index="${ve}"
            title="${r(je)}">${F(je,A)}</button>`).join("")}`,Ie(I,ce.length),C.hidden=!1}catch{W()}},nt=()=>{let _=document.activeElement;_ instanceof HTMLElement&&_.matches("[data-schema-search]")&&_.blur(),W()},St=(_,{resetReport:q=!1}={})=>{nt();let A=z(_);if(ye.innerHTML=Tr(i,v),Ae.innerHTML=Do(ae(),_.id),v==="schema")J.hidden=!0,J.innerHTML="",B.hidden=!1,B.innerHTML=`<div class="schema-category-switch" role="tablist" aria-label="Schema \u985E\u5225">
        ${["law","judgment"].map(I=>{let Q=n.find(K=>K.id===I);return Q?`<button class="chip${i===I?" is-active":""}" type="button" role="tab" aria-selected="${i===I}" data-action="schema-category" data-category="${I}">${r(Q.label)}</button>`:""}).join("")}
      </div>${ln(_,Z(i)?.label||i,$?.tableId||"")}`;else{B.hidden=!0,B.innerHTML="",J.hidden=!1;let I=Fo(i,_,A),Q=jr(_,A);J.innerHTML=`${Oo(_)}${I?`${I}<details class="data-advanced"><summary>\u9032\u968E metadata \u689D\u4EF6</summary>${Q}</details>`:Q}<div class="sidebar-note">${zo(_)}</div>`}if(Me(),v==="schema"){let I=$?Qe(_,$.tableId):"";if(h&&h.key===I){let Q=Ye(_,h.tableId);h.loading?S.innerHTML=Nr(Q):h.error?S.innerHTML=Er(h.error,Q):S.innerHTML=cn(h.result,Q,{columnFilters:h.columnFilters||{},searchEnabled:_.id==="postgres"||_.id==="parquet"})}else S.innerHTML=Zo(_);return}q?pe(_):A.result?S.innerHTML=pa(A.result):pe(_)},st=(_,{persist:q=!0,resetReport:A=!1}={})=>{let I=ae(),Q=I.find(ce=>ce.id===_)||I[0];if(!Q)return;H=null,G=null,$=null,h=null,g+=1,o=Q.id;let K=_e(i,Q.id);l[K]||(l[K]=da(Q,c)),St(Q,{resetReport:A}),q&&(be(`data.last_database.${i}`,Q.id),be("data.last_category",i))},Rt=(_,{persist:q=!0,resetReport:A=!0,databaseId:I=null}={})=>{let Q=Z(_)||n[0];if(!Q)return;i=Q.id,H=null,G=null;let K=Q.databases||[],ce=I&&K.find(Se=>Se.id===I)||K.find(Se=>Se.id===o)||K[0];if(o=ce?.id||null,!ce){ye.innerHTML=Tr(i,v),Ae.innerHTML=`<div class="sidebar-notice">${Ee({tone:"warn",title:"\u6C92\u6709\u53EF\u7528\u7684\u8CC7\u6599\u4F86\u6E90",text:"\u9019\u500B\u985E\u5225\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u5EAB\u9078\u9805\u3002"})}</div>`,J.innerHTML="",Me();return}st(ce.id,{persist:!1,resetReport:A}),q&&(be("data.last_category",Q.id),be(`data.last_database.${Q.id}`,ce.id))},rt=_=>{let q=z(_),A=J.querySelector("#data-filter-form");A&&(q.values=ua(A,_,q))},Xe=async(_=null,{quiet:q=!1}={})=>{let A=ee(o);if(!A)return;nt();let I=z(A);rt(A),_!==null&&(I.page=_),(!Number.isFinite(I.page)||I.page<1)&&(I.page=1);let Q=++d;H=null,G=null;let K=S.querySelector(".report-card"),ce=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!K?S.setAttribute("aria-busy","true"):(S.removeAttribute("aria-busy"),S.innerHTML=Ds(A));let je=J.querySelector("#run-query");q||ke(je,!0,"\u67E5\u8A62\u4E2D\u2026");try{let ve;if(A.id==="indexeddb"?ve=await Cr(A,I):ve=await U.query({database:A.id,filters:on(A,I),page:I.page,pageSize:I.pageSize}),s||Q!==d)return;if(ve.meta={...ve.meta||{},column_filters:I.columnFilters||{},searchable:A.id==="postgres"||A.id==="parquet",sort:I.sort||ve.meta?.sort||null},I.result=ve,I.page=Number(ve.page)||I.page,I.pageSize=Number(ve.page_size)||I.pageSize,S.removeAttribute("aria-busy"),S.innerHTML=pa(ve),ce!==null){let We=S.querySelector("[data-page-size]");We&&(We.value=String(I.pageSize),We.focus({preventScroll:!0}))}let Fe=Z(i)?.label||i;await Ps({kind:"data",title:`${Fe} \xB7 ${A.label} \xB7 ${ve.table||ve.label||"query"}`,detail:`${u(ve.total)} \u7B46 \xB7 ${me(ve.duration_ms)}`,payload:{category:i,database:A.id,filters:on(A,I),page:I.page,page_size:I.pageSize}}),be("data.last_query",{category:i,database:A.id,filters:on(A,I),page:I.page,page_size:I.pageSize,at:new Date().toISOString()})}catch(ve){if(s||Q!==d)return;S.removeAttribute("aria-busy"),S.innerHTML=ga(ve,A),M(ve.message||"\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{!s&&Q===d&&ke(je,!1)}},Jt=(_,q)=>{let A=_?.querySelector("[data-data-fuzzy-results]");A&&(A.innerHTML=q.length?q.map(I=>`<button class="data-fuzzy-option" type="button" role="option" data-action="select-fuzzy-term" data-term="${r(I.value)}"><span>${r(I.label||I.value)}</span><small>${r(I.meta||"")}</small></button>`).join(""):'<div class="data-fuzzy-empty">\u6C92\u6709\u76F8\u8FD1\u7D50\u679C\uFF1B\u6309 Enter \u53EF\u76F4\u63A5\u52A0\u5165\u76EE\u524D\u8F38\u5165\u7684\u95DC\u9375\u5B57\u3002</div>')},X=async(_,q="")=>{if(!_)return;let A=ee(o),I=A?z(A):null;if(!I)return;let Q=_.dataset.fuzzyKind||i,K=_.querySelector("[data-data-fuzzy-results]"),ce=++E;K&&(K.innerHTML='<div class="data-fuzzy-loading"><span class="spinner"></span><span>\u641C\u5C0B\u76F8\u8FD1\u7D50\u679C\u2026</span></div>');try{let Se=await U.dataSuggest({kind:Q,query:q,limit:12});if(ce!==E)return;let je=(Se.suggestions||[]).filter(ve=>!I.fuzzyTerms.includes(ve.value));Jt(_,je)}catch(Se){if(ce!==E)return;K&&(K.innerHTML=`<div class="data-fuzzy-empty">${r(Se.message||"\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},$e=(_,{focus:q=!1}={})=>{if(!_)return;let A=_.querySelector("[data-data-fuzzy-popover]"),I=_.querySelector("[data-data-fuzzy-search]");!A||!I||(A.hidden&&(A.hidden=!1,I.value="",X(_,"")),q&&(I.focus(),I.select()))},ze=_=>{T&&(window.clearTimeout(T),T=null);let q=_?.querySelector("[data-data-fuzzy-popover]");q&&(q.hidden=!0)},Ve=async _=>{let q=ee(o);if(!q)return;let A=z(q),I=String(_||"").trim();!I||A.fuzzyTerms.includes(I)||(A.fuzzyTerms=[...A.fuzzyTerms,I],ze(J.querySelector("[data-data-fuzzy]")),St(q),await Xe(1))},Nt=async _=>{let q=ee(o);if(!q)return;let A=z(q),I=String(_||"").trim();A.fuzzyTerms=A.fuzzyTerms.filter(Q=>Q!==I),St(q),await Xe(1)},At=async()=>{ge.disabled=!0,ke(ge,!0,"\u6574\u7406\u4E2D\u2026");try{let[_,q,A,I,Q]=await Promise.all([U.catalog(),ns("data.last_category","law"),ns("data.last_database.law","postgres"),ns("data.last_database.judgment","postgres"),ns("data.page_size",25)]);if(s)return;a=_,V&&(V.innerHTML=Dt(a.judgment_stats)),n=Array.isArray(a.categories)?a.categories:[],c=Pr.includes(Number(Q))?Number(Q):25;for(let ve of n)for(let Fe of ve.databases||[]){let We=_e(ve.id,Fe.id);l[We]||(l[We]=da(Fe,c))}let K=n.find(ve=>ve.id===q)||n[0];if(!K){ye.innerHTML="",Ae.innerHTML=`<div class="sidebar-notice">${Ee({tone:"danger",title:"\u6C92\u6709\u53EF\u7528\u7684\u5206\u985E",text:"Catalog \u6C92\u6709\u56DE\u50B3\u6CD5\u898F\u547D\u4EE4\u6216\u5224\u6C7A\u5206\u985E\u3002"})}</div>`;return}let ce=K.id==="judgment"?I:A;if(i=K.id,o=null,Rt(K.id,{persist:!1,resetReport:!0,databaseId:ce}),s)return;let Se=ee(o),je=Se?z(Se):null;Se&&je&&v==="query"&&!je.result&&(Se.id==="postgres"||Se.id==="parquet")&&Xe(1),M("\u8CC7\u6599\u5EAB catalog \u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(_){if(s)return;a=null,n=[],ye.innerHTML="",V&&(V.innerHTML=Dt(null)),Me(),Ae.innerHTML=`<div class="sidebar-notice">${Ee({tone:"danger",title:"\u7121\u6CD5\u8B80\u53D6 catalog",text:r(_.message||"\u8ACB\u78BA\u8A8D API \u662F\u5426\u555F\u52D5\u3002")})}
      <button class="btn btn-secondary btn-sm" type="button" id="catalog-retry" style="margin-top:10px">
        ${m("refresh",14)}<span>\u91CD\u8A66</span>
      </button></div>`,S.innerHTML=`<div class="report-empty">${ct({iconName:"server",title:"API \u76EE\u524D\u7121\u6CD5\u9023\u7DDA",text:"\u67E5\u8A62\u5831\u8868\u9700\u8981 FastAPI \u63D0\u4F9B catalog \u8207\u8CC7\u6599\u67E5\u8A62 API\u3002\u8ACB\u78BA\u8A8D judgment-web \u5DF2\u555F\u52D5\u3002"})}</div>`}finally{s||(ge.disabled=!1,ke(ge,!1))}};Y.addEventListener("change",_=>{let q=_.target;if(q.name==="category"){Rt(q.value);return}if(q.name==="database"){st(q.value);let K=ee(o),ce=K?z(K):null;K&&ce&&!ce.result&&v==="query"&&(K.id==="postgres"||K.id==="parquet")&&Xe(1);return}let A=ee(o);if(!A)return;let I=z(A),Q=J.querySelector("#data-filter-form");!Q||!q.name||(I.values=ua(Q,A,I),I.page=1,q.name==="table"&&(H=null,G=null,I.sort=null,I.columnFilters={},I.result=null,J.innerHTML=jr(A,I),pe(A)))}),Y.addEventListener("input",_=>{let q=_.target.closest("[data-data-fuzzy-search]");if(q){let K=q.closest("[data-data-fuzzy]");T&&window.clearTimeout(T),T=window.setTimeout(()=>{X(K,q.value)},160);return}let A=ee(o);if(!A)return;let I=J.querySelector("#data-filter-form");if(!I||!_.target.name||_.target.name==="table")return;let Q=z(A);Q.values=ua(I,A,Q)}),Y.addEventListener("keydown",_=>{let q=_.target.closest("[data-data-fuzzy-search]");if(!q)return;let A=q.closest("[data-data-fuzzy]");if(_.key==="Escape")_.preventDefault(),ze(A),q.blur();else if(_.key==="Enter"){_.preventDefault();let I=A?.querySelector("[data-action='select-fuzzy-term']");I?I.click():Ve(q.value)}else _.key==="ArrowDown"&&(_.preventDefault(),A?.querySelector("[data-action='select-fuzzy-term']")?.focus())}),Y.addEventListener("mouseover",_=>{let q=_.target.closest("[data-action='open-fuzzy']");q&&$e(q.closest("[data-data-fuzzy]"))}),Y.addEventListener("mouseout",_=>{let q=_.target.closest("[data-data-fuzzy]");q&&(_.relatedTarget&&q.contains(_.relatedTarget)||ze(q))}),Y.addEventListener("submit",_=>{_.target.id==="data-filter-form"&&(_.preventDefault(),Xe(1))}),Y.addEventListener("click",async _=>{let q=J.querySelector("[data-data-fuzzy] [data-data-fuzzy-popover]:not([hidden])")?.closest("[data-data-fuzzy]");q&&!_.target.closest("[data-data-fuzzy]")&&ze(q);let A=_.target.closest("[data-action]"),I=A?.dataset.action;if(I==="data-nav"){let Q=A.dataset.tab,K=ee(o);if(Q==="schema"){if(v!=="schema"){if(K){let ve=z(K),Fe=J.querySelector("#data-filter-form");Fe&&(ve.values=ua(Fe,K,ve))}v="schema",K&&St(K)}return}let ce=Q==="judgment"?"judgment":"law";v==="schema"&&(v="query"),i!==ce?Rt(ce,{databaseId:o,resetReport:!1}):K&&St(K);let Se=ee(o),je=Se?z(Se):null;Se&&je&&!je.result&&(Se.id==="postgres"||Se.id==="parquet")&&Xe(1);return}if(I==="open-fuzzy"){$e(A.closest("[data-data-fuzzy]"),{focus:!0});return}if(I==="select-fuzzy-term"){await Ve(A.dataset.term);return}if(I==="remove-fuzzy-term"){await Nt(A.dataset.term);return}if(I==="schema-category"){v="schema",Rt(A.dataset.category||"law",{resetReport:!0});return}if(I==="select-schema-table"){let Q=ee(o);if(!Q)return;N(Q,A.dataset.tableId||"");return}if(I==="reset"){let Q=ee(o);if(!Q)return;H=null,G=null;let K=z(Q);l[_e(i,Q.id)]=da(Q,K.pageSize),St(Q),pe(Q),M("\u5DF2\u91CD\u8A2D\u9019\u500B\u8CC7\u6599\u5EAB\u7684\u67E5\u8A62\u689D\u4EF6\u3002","info",2400);return}_.target.closest("#catalog-retry")&&At()}),S.addEventListener("input",_=>{let q=_.target.closest("[data-schema-search]");if(!q)return;let A=D();if(!A)return;let I=q.dataset.schemaSearch||"",Q=q.value,K=`${A.mode}:${A.db.id}:${A.tableId}:${I}`,ce=j.get(K);if(ce&&window.clearTimeout(ce),!Q.trim()){j.delete(K),W(),x(A,I,"");return}let Se=window.setTimeout(()=>{j.delete(K),kt(A,I,Q,q)},250);j.set(K,Se)}),S.addEventListener("keydown",_=>{let q=_.target.closest("[data-schema-search]");if(!q)return;let A=D();if(A){if(_.key==="Escape"){W();return}if(_.key==="ArrowDown"||_.key==="ArrowUp"){if(!C||C.hidden)return;_.preventDefault();let I=_.key==="ArrowDown"?1:-1;Re(k<0?I>0?0:p.length-1:k+I);return}if(_.key==="Enter"){if(_.preventDefault(),C&&!C.hidden&&k>=0){Be(k);return}x(A,q.dataset.schemaSearch||"",q.value)}}}),C?.addEventListener("mousedown",_=>{_.preventDefault()}),C?.addEventListener("click",_=>{let q=_.target.closest("[data-schema-suggest-index]");q&&Be(Number(q.dataset.schemaSuggestIndex))});let Vt=_=>{_.target.closest("[data-schema-search]")||C?.contains(_.target)||W()};return document.addEventListener("click",Vt),window.addEventListener("scroll",W,{capture:!0,passive:!0}),window.addEventListener("resize",W),S.addEventListener("keydown",_=>{_.target.matches(".law-jump-input")&&_.key==="Enter"&&(_.preventDefault(),Oe(_.target.id))}),S.addEventListener("click",async _=>{let q=_.target.closest("[data-action]");if(!q)return;let A=q.dataset.action,I=ee(o),Q=I?z(I):null,K=Q?.result;if(A==="back-to-results"){tt();return}if(A==="open-law"){He({lawKey:q.dataset.lawKey||"",sourceType:q.dataset.lawSource||"",lawName:q.dataset.lawName||""});return}if(A==="open-judgment"){Le({jid:q.dataset.jid||""});return}if(A==="jump-article"){Oe(q.dataset.jumpInput||"law-article-jump");return}if(A==="sort-column"){let ce=q.dataset.sortKey||"";if(!ce||!I)return;if(v==="schema"&&h?.result){let ve=h.sort,Fe=ce==="jdate"||ce==="law_modified_date"||ce==="article_count"||ce==="citation_count"||ce==="full_text_length"||ce==="created_at"||ce==="updated_at",We=ve?.key===ce?ve.direction==="asc"?"desc":"asc":Fe?"desc":"asc";N(I,h.tableId,{sort:{key:ce,direction:We},columnFilters:h.columnFilters||{},quiet:!0});return}if(!Q)return;let Se=Q.sort,je=Se?.key===ce?Se.direction==="asc"?"desc":"asc":ce==="jdate"?"desc":"asc";Q.sort={key:ce,direction:je},Xe(1,{quiet:!0});return}if(A==="retry"){Xe(Q?.page||1);return}if(K){if(A==="prev-page"){Xe(Math.max(1,Number(K.page)-1),{quiet:!0});return}if(A==="next-page"){let ce=Math.max(1,Math.ceil(Number(K.total)/Number(K.page_size)));Xe(Math.min(ce,Number(K.page)+1),{quiet:!0});return}if(A==="copy-query"){let ce=await fs(K.query_text||"");M(ce?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",ce?"ok":"warn");return}if(A==="export-json"){let ce=`${K.database}-${K.table||"query"}-page-${K.page}.json`;Ot(ce,JSON.stringify(ba(K),null,2),"application/json;charset=utf-8"),M(`\u5DF2\u532F\u51FA ${ce}`,"ok");return}if(A==="export-csv"){let ce=`${K.database}-${K.table||"query"}-page-${K.page}.csv`;Ot(ce,fa(K),"text/csv;charset=utf-8"),M(`\u5DF2\u532F\u51FA ${ce}`,"ok")}}}),S.addEventListener("change",_=>{let q=_.target.closest("[data-action='select-law-version']");if(q&&H){He({lawKey:H.lawKey,sourceType:H.sourceType,lawName:H.lawName,versionId:q.value});return}if(!_.target.matches("[data-page-size]"))return;let A=ee(o);if(!A)return;let I=z(A);I.pageSize=Number(_.target.value)||25,I.page=1,be("data.page_size",I.pageSize),Xe(1,{quiet:!0})}),ge.addEventListener("click",()=>{At()}),await At(),t&&typeof t.setTitle=="function"&&t.setTitle("\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"),()=>{s=!0,T&&window.clearTimeout(T);for(let _ of j.values())window.clearTimeout(_);j.clear(),W(),document.removeEventListener("click",Vt),window.removeEventListener("scroll",W,{capture:!0}),window.removeEventListener("resize",W)}}var Vr=[10,25,50,100],vl=[{value:"started_at:desc",label:"Timestamp \u65B0 \u2192 \u820A"},{value:"started_at:asc",label:"Timestamp \u820A \u2192 \u65B0"},{value:"duration_ms:desc",label:"\u8017\u6642\u591A \u2192 \u5C11"},{value:"duration_ms:asc",label:"\u8017\u6642\u5C11 \u2192 \u591A"}];function gn(){return{process:"",module:"",status:"",method:"",model:"",keyword:"",from_date:"",to_date:"",min_duration:"",sort:"started_at:desc"}}function hl(e,t=e){return`<option value="${r(e)}">${r(t)}</option>`}function Fs(e,t,s,a,n=""){return`<div class="field">
    <label class="field-label" for="performance-${e}">
      <span>${r(t)}</span>
      <span class="field-tag">${r(e)}</span>
    </label>
    <select class="select" id="performance-${e}" name="${r(e)}">
      ${hl("","\u5168\u90E8")}
      ${s.map(i=>`<option value="${r(i)}" ${String(i)===String(a)?"selected":""}>${r(i)}</option>`).join("")}
    </select>
    ${n?`<span class="field-help">${r(n)}</span>`:""}
  </div>`}function $l(e,t){let s=vl.map(a=>`<option value="${a.value}" ${a.value===t.sort?"selected":""}>${a.label}</option>`).join("");return`
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
    </div>`}function zr(){let e=document.getElementById("performance-filter-form");if(!e)return gn();let t=new FormData(e);return{process:String(t.get("process")||""),module:String(t.get("module")||""),status:String(t.get("status")||""),method:String(t.get("method")||""),model:String(t.get("model")||""),keyword:String(t.get("keyword")||"").trim(),from_date:String(t.get("from_date")||""),to_date:String(t.get("to_date")||""),min_duration:String(t.get("min_duration")||""),sort:String(t.get("sort")||"started_at:desc")}}function Hr(e){if(e==null)return"null";if(typeof e=="object")try{let t=JSON.stringify(e);return t.length>160?`${t.slice(0,157)}\u2026`:t}catch{return String(e)}return String(e)}function Ur(e){if(!e)return"";let t=new Date(e);if(Number.isNaN(t.getTime()))return"";let s=String(t.getHours()).padStart(2,"0"),a=String(t.getMinutes()).padStart(2,"0"),n=String(t.getSeconds()).padStart(2,"0"),i=String(t.getMilliseconds()).padStart(3,"0");return`${s}:${a}:${n}.${i}`}function yl(e,t){if(!e)return"";let s=new Date(e);return Number.isNaN(s.getTime())?"":new Date(s.getTime()+Math.max(0,Number(t)||0)).toISOString()}var wl=[{key:"parsing",label:"Parsing",hint:"\u8F38\u5165\u9577\u5EA6\u3001\u89E3\u6790\u6642\u9593",names:["rag.parse_question"],color:"#64748b"},{key:"embedding",label:"Embedding",hint:"Model\u3001Token\u3001Batch\u3001\u8017\u6642",names:["rag.embed_query"],color:"#3984c6"},{key:"qdrant",label:"Qdrant Search",hint:"Collection\u3001Filter\u3001Top K\u3001\u8017\u6642",names:["rag.qdrant_search"],color:"#d97706"},{key:"reranker",label:"Reranker",hint:"Model\u3001\u5019\u9078\u7B46\u6578\u3001\u8017\u6642",names:["rag.rerank"],color:"#8b5cf6"},{key:"context",label:"Context",hint:"Chunk \u6578\u3001Token \u6578\u3001\u8017\u6642",names:["rag.context"],fallbackNames:["rag.fetch_documents","rag.build_citations"],color:"#64748b"},{key:"llm",label:"LLM",hint:"Model\u3001Input/Output Token\u3001TTFT\u3001\u8017\u6642",names:["rag.llm_request"],color:"#16a34a"}],ha={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"};function Wr(e){let t=e?.metadata?.rag_response||{},s=String(t.status||e?.metadata?.rag_status||e?.status||"");return s==="operational"||s==="success"?{label:"Completed",tone:"ok"}:s==="retrieval_only"?{label:"Abstain",tone:"warn"}:s==="preview"?{label:"Preview",tone:"info"}:s==="failed"||s==="error"?{label:"Failed",tone:"danger"}:{label:s||"Unknown",tone:"idle"}}function fn(e){let t=Math.max(0,Number(e?.offset_ms)||0),s=Math.max(0,Number(e?.duration_ms)||0),a=Math.max(t,Number(e?.end_offset_ms)||t+s);return{...e,offset:t,end:a,duration:Math.max(s,a-t)}}function Kr(e,t=0){let s=Array.isArray(e?.segments)?[...e.segments].sort((v,$)=>Number(v.offset_ms||0)-Number($.offset_ms||0)):[],a=Math.max(Number(e?.total_ms)||0,Number(t)||0,...s.map(v=>fn(v).end),1),n=wl.map(v=>{let $=s.filter(w=>v.names.includes(w.name));!$.length&&v.fallbackNames&&($=s.filter(w=>v.fallbackNames.includes(w.name)));let h=$.map(fn),g=h.length?Math.min(...h.map(w=>w.offset)):null,p=h.length?Math.max(...h.map(w=>w.end)):null;return{...v,spans:h,start:g,end:p,duration:g===null?null:p-g}});for(let v of n){if(v.key!=="embedding"&&v.key!=="llm")continue;let $=[];for(let p of v.spans){let w=p.metadata||{},k=Number(w.load_duration_ms),L=Number.isFinite(k)&&k>0?k:0,E=Math.max(0,Number(p.duration)||0);$.push({...p,offset:p.offset,end:p.offset+L,duration:L,metadata:{...w,source_stage:v.label,model_load_ms:L,request_duration_ms:E,warm_duration_ms:Math.max(0,E-L),cold_start:L>=100},params:{...p.params||{},source_stage:v.label}})}if(!$.length)continue;let h=$.reduce((p,w)=>p+w.duration,0),g=v.spans.reduce((p,w)=>p+Math.max(0,Number(w.duration)||0),0);v.loadInfo={spans:$,total:h,requestTotal:g,ratio:g>0?Math.min(1,Math.max(0,h/g)):0}}let i=[...n],o=Math.max(0,...i.flatMap(v=>v.spans.map($=>$.end))),l=e?.metadata?.rag_response||{},d=Wr(e),c=Math.min(a,o);return i.push({key:"response",label:"Response",hint:"\u7E3D\u8017\u6642\u3001\u5F15\u7528\u6578\u3001\u6210\u529F\u6216 Abstain",color:"#0f766e",spans:[{offset:c,end:a,duration:Math.max(0,a-c),status:d.tone==="danger"?"error":"ok",metadata:l,params:{},started_at:e?.started_at,finished_at:e?.finished_at}],start:c,end:a,duration:Math.max(0,a-c),responseMetadata:l}),_l(i,a),{total:a,stages:i,response:l,traceStatus:d,requestId:e?.request_id||"",startedAt:e?.started_at,finishedAt:e?.finished_at,client:e?.client||{},models:Array.isArray(e?.summary?.models)?e.summary.models:[],hasLoad:i.some(v=>!!v.loadInfo)}}function _l(e,t){let s=e.reduce((i,o)=>i+Math.max(0,Number(o.duration)||0),0),a=s>0?t/s:1,n=0;for(let i of e){let o=Math.max(0,Number(i.duration)||0)*a;i.displayStart=n,i.displayDuration=o,i.displayEnd=n+o;let l=i.spans[0]||null,d=[],c=!1;if(l){let $=Math.max(0,Number(l.duration)||0),h=i.loadInfo?Math.max(0,Number(i.loadInfo.total)||0):0;if(i.loadInfo&&h>0&&i.spans.length===1&&$>0){let g=Math.min(l.end,l.offset+h),p=Math.max(0,g-l.offset),w=Math.max(0,l.end-g);if(p>0&&w>0){let k=yl(l.started_at,p),L={...l,offset:l.offset,end:g,duration:p,finished_at:k,metadata:{...l.metadata||{},source_stage:i.label,model_load_ms:p,request_duration_ms:$,warm_duration_ms:Math.max(0,$-p),cold_start:p>=100},params:{...l.params||{},source_stage:i.label}},E={...l,offset:g,end:l.end,duration:w,started_at:k,finished_at:l.finished_at};d.push({kind:"load",label:"Model Load",span:L,duration:p}),d.push({kind:"stage",label:`${i.label} \u63A8\u8AD6`,span:E,duration:w}),c=!0}}c||d.push({kind:"stage",label:i.label,span:l,duration:$})}i.detailSegments=d;let v=[];if(l&&o>0)if(c){let[$,h]=d,g=$.duration+h.duration,p=g>0?o*($.duration/g):0,w={...i,key:"model_load",label:`Model Load \xB7 ${i.label}`,spans:[$.span],duration:$.duration},k={...i,label:`${i.label} \u63A8\u8AD6`,spans:[h.span],duration:h.duration};v.push({offset:n,duration:p,color:"#0ea5e9",kind:"load",tip:va(w,$.span)}),v.push({offset:n+p,duration:Math.max(0,o-p),color:i.color,kind:"stage",tip:va(k,h.span,{includeLoad:!1})})}else v.push({offset:n,duration:o,color:i.color,kind:"stage",tip:va(i,l)});i.displaySegments=v,n+=o}}function bn(e,{includeLoad:t=!0}={}){let s=[],a=(v,$)=>{$==null||$===""||s.push([v,String($)])},n=e.spans[0]||null;if(!n)return a("\u72C0\u614B","\u6B64\u7D00\u9304\u6C92\u6709\u9019\u500B span"),s;let i=n.params||{},o=n.metadata||{},l=Yr(n),d=vn(n),c=(v,$)=>{let h=Number(v?.load_duration_ms);if(!Number.isFinite(h))return;let g=Math.max(0,h);a("Model Load",me(g)),a("\u51B7\u555F\u52D5",g>=100?"\u662F":"\u5426\uFF08\u71B1\u555F\u52D5\uFF09");let p=Math.max(0,Number($)||0);if(p>0){let w=Math.max(0,p-g);a("\u6263\u9664\u8F09\u5165\u5F8C",me(w)),a("\u8F09\u5165\u5360\u6BD4",`${(g/p*100).toFixed(g/p>=.1?0:1)}%`)}};if(e.key==="response")return a("Trace \u72C0\u614B",e.responseMetadata.status||"\u2014"),a("Answer source",e.responseMetadata.answer_source||"\u2014"),a("Abstain",e.responseMetadata.abstain?"\u662F":"\u5426"),a("\u5F15\u7528\u7E3D\u6578",e.responseMetadata.citation_count??"\u2014"),a("\u5224\u6C7A\uFF0F\u6CD5\u898F\u5F15\u7528",`${e.responseMetadata.judgment_citations??"\u2014"} / ${e.responseMetadata.law_citations??"\u2014"}`),a("\u7E3D\u8017\u6642",me(e.duration)),s;if(a("\u958B\u59CB",`${Ur(n.started_at)||"\u2014"} \xB7 +${n.offset.toFixed(1)} ms`),a("\u7D50\u675F",`${Ur(n.finished_at)||"\u2014"} \xB7 +${n.end.toFixed(1)} ms`),a("\u8017\u6642",me(n.duration)),e.key==="parsing")a("\u8F38\u5165\u9577\u5EA6",o.input_length??i.input_length),a("\u6B63\u898F\u5316\u9577\u5EA6",o.normalized_length??i.normalized_length),a("\u79FB\u9664\u7A7A\u767D",o.trimmed_chars);else if(e.key==="embedding")a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.active_base_url||o.base_url),a("Input tokens",o.prompt_eval_count),a("Batch",o.batch),a("\u5411\u91CF\u7DAD\u5EA6",o.dimensions),a("Fallback",o.fallback_used?"\u662F":"\u5426"),t&&c(o,n.duration);else if(e.key==="qdrant")a("Collection",o.collection||i.collection),o.filter&&a("Filter",Hr(o.filter)),a("Top K",o.top_k??i.limit),a("Hits",o.hits),a("Unique judgments",o.unique_judgments),a("Top score",o.top_score);else if(e.key==="reranker")a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.base_url||i.url),a("Rerank \u72C0\u614B",o.status),a("Fallback",o.fallback_used?"\u662F":"\u5426"),a("\u5019\u9078\u7B46\u6578",o.candidates),a("\u9078\u7528\u7B46\u6578",o.selected),a("Top score",o.top_score),Array.isArray(o.errors)&&o.errors.length&&a("\u932F\u8AA4",o.errors.join(" \xB7 "));else if(e.key==="context")a("Chunks",o.chunks),a("\u5224\u6C7A chunks",o.judgment_chunks),a("\u6CD5\u898F chunks",o.law_chunks),a("Token \u4F30\u7B97",o.token_estimate),a("Context \u5B57\u5143",o.context_chars),a("\u6587\u4EF6\u6578",o.documents);else if(e.key==="llm")a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.base_url||i.url),a("Input tokens",o.input_tokens),a("Output tokens",o.output_tokens),a("TTFT",o.ttft_ms===null||o.ttft_ms===void 0?"\u2014":me(o.ttft_ms)),a("API \u7E3D\u8017\u6642",o.total_duration_ms===null||o.total_duration_ms===void 0?"\u2014":me(o.total_duration_ms)),t&&c(o,n.duration),a("Strict retry",o.strict?"\u662F":"\u5426");else if(e.key==="model_load"){if(a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("\u4F86\u6E90\u968E\u6BB5",o.source_stage),a("\u51B7\u555F\u52D5",o.cold_start?"\u662F":"\u5426\uFF08\u71B1\u555F\u52D5\uFF09"),a("\u6A21\u578B\u547C\u53EB\u7E3D\u8017\u6642",o.request_duration_ms===null||o.request_duration_ms===void 0?"\u2014":me(o.request_duration_ms)),a("\u8F09\u5165\u8017\u6642",o.model_load_ms===null||o.model_load_ms===void 0?"\u2014":me(o.model_load_ms)),a("\u6263\u9664\u8F09\u5165\u5F8C\u6D41\u7A0B\u6642\u9593",o.warm_duration_ms===null||o.warm_duration_ms===void 0?"\u2014":me(o.warm_duration_ms)),Number(o.request_duration_ms)>0&&Number(o.model_load_ms)>=0){let v=Number(o.model_load_ms)/Number(o.request_duration_ms)*100;a("\u8F09\u5165\u5360\u6BD4",`${v.toFixed(v>=10?0:1)}%`)}o.eval_duration_ms!==null&&o.eval_duration_ms!==void 0&&a("\u63A8\u8AD6\u8017\u6642",me(o.eval_duration_ms))}else if(e.key==="segment"||e.key==="test_stage")if(a("Model",d||o.model||i.model),a("\u72C0\u614B",o.status||n.status),e.key==="test_stage")a("\u9032\u5EA6",o.progress===null||o.progress===void 0?"":`${Number(o.progress)||0}%`),n.error&&a("\u932F\u8AA4",n.error);else{n.error&&a("\u932F\u8AA4",n.error);for(let[v,$]of Object.entries(i).slice(0,10))a(v,Hr($))}return e.spans.length>1&&(e.key==="model_load"?a("\u5404\u6A21\u578B\u8F09\u5165",e.spans.map(v=>`${v.metadata?.source_stage||"model"} ${vn(v)} ${me(v.metadata?.model_load_ms||0)}`).join(" \xB7 ")):(a("Span \u6578",e.spans.length),a("Span \u660E\u7D30",e.spans.map((v,$)=>`#${$+1} +${v.offset.toFixed(0)}ms/${me(v.duration)}`).join(" \xB7 ")))),n.module&&a("Module",n.module),n.function&&a("Function",n.function),s}function kl(e){let t=String(e||"").trim();if(!t)return"";try{return new URL(t.includes("://")?t:`http://${t}`).hostname||t}catch{return t}}function Yr(e){let t=e?.metadata||{},s=String(t.provider_name||"").trim();if(s)return s;let a=String(t.active_base_url||t.base_url||e?.params?.url||"").trim();return kl(a)}function Sl(e){let t=e?.metadata||{};return String(t.model||e?.params?.model||"").trim()}function vn(e){let t=Yr(e),s=Sl(e);return s?t?`${t}:${s}`:s:""}function xl(e){let t=new Set;for(let s of e?.spans||[]){let a=vn(s);a&&t.add(a)}return[...t]}function va(e,t,s={}){let a=bn({...e,spans:[t]},s);return[String(e.label||""),...a.map(([n,i])=>`${n}: ${i}`)].join(`
`)}function ql(e,t){let s=e.spans||[],a=xl(e),n=Array.isArray(e.displaySegments)?e.displaySegments:null,i=7,o=Math.max(1,Math.min(4,s.length)),l=s.length>1,d=n?12:l?Math.max(12,o*i):12,c=n?n.map(k=>{if(Number(k.duration)<=0)return"";let L=Math.max(0,Math.min(100,k.offset/t*100)),E=Math.min(100-L,k.duration/t*100);return`<span class="rag-wf-bar is-sequential${k.kind==="load"?" is-load":""}" style="left:${L.toFixed(3)}%;width:${E.toFixed(4)}%;top:0;height:12px;--bar-color:${k.color}"
            data-rag-wf-tip="${r(k.tip)}"
            aria-label="${r(k.tip)}" role="img"></span>`}).join(""):s.slice(0,4).map((k,L)=>{if(Number(k.duration)<=0)return"";let E=Math.max(0,Math.min(100,k.offset/t*100)),T=Math.max(.35,Math.min(100-E,k.duration/t*100)),H=l?L*i:0,G=l?6:12,Y=va(e,k);return`<span class="rag-wf-bar" style="left:${E.toFixed(3)}%;width:${T.toFixed(3)}%;top:${H}px;height:${G}px"
            data-rag-wf-tip="${r(Y)}"
            aria-label="${r(Y)}" role="img"></span>`}).join(""),v=Array.isArray(e.detailSegments)?e.detailSegments:[],$=v.length>1?v.map(k=>{let L=k.kind==="load"?{...e,key:"model_load",label:`Model Load \xB7 ${e.label}`,spans:[k.span],duration:k.duration}:{...e,label:`${e.label} \u63A8\u8AD6`,spans:[k.span],duration:k.duration},E=bn(L,{includeLoad:k.kind!=="stage"});return`<div class="rag-wf-detail-group">
              <div class="rag-wf-detail-group-head">
                <strong>${r(k.label)}</strong>
                <span>${r(me(k.duration))}</span>
              </div>
              <div class="rag-wf-detail-grid">${E.map(([T,H])=>`<span class="rag-wf-detail"><span>${r(T)}</span><strong>${r(H)}</strong></span>`).join("")}</div>
            </div>`}).join(""):"",h=bn(e).map(([k,L])=>`<span class="rag-wf-detail"><span>${r(k)}</span><strong>${r(L)}</strong></span>`).join(""),g=v.length>1?`<div class="rag-wf-details is-split">${$}</div>`:`<div class="rag-wf-details">${h}</div>`,p=s.length?s.some(k=>k.status==="error")?"is-error":"":"is-missing",w=s.length?me(e.duration):"\u672A\u8A18\u9304";return`<details class="rag-wf-stage ${p}" style="--stage-color:${e.color}">
    <summary class="rag-wf-stage-summary">
      <span class="rag-wf-stage-head">
        <span class="rag-wf-stage-label">
          <i aria-hidden="true"></i>
          <span><strong>${r(e.label)}</strong><small>${r(e.hint)}</small>${a.length?`<small class="rag-wf-model-line">${r(a.join(" \xB7 "))}</small>`:""}</span>
        </span>
        <span class="rag-wf-stage-meta">${w} \xB7 ${s.length?`${s.length} span`:"\u2014"} <span class="rag-wf-chevron">${m("chevronRight",12)}</span></span>
      </span>
      <span class="rag-wf-track" style="height:${d}px">${c}</span>
    </summary>
    ${g}
  </details>`}function Xr(e,t,s=!1){let a=e.response||{},n=e.client||{},i=e.models||[];return`<div class="rag-wf-summary">
      <span>\u7E3D\u8017\u6642 <strong>${r(me(e.total))}</strong></span>
      <span>Server <strong>${r(me(t))}</strong></span>
      ${n.total_ms?`<span>Client <strong>${r(me(n.total_ms))}</strong></span>`:""}
      ${n.render_ms!==void 0?`<span>Render <strong>${r(me(n.render_ms))}</strong></span>`:""}
      <span>\u5F15\u7528 <strong>${r(String(a.citation_count??"\u2014"))}</strong></span>
      <span>Abstain <strong>${a.abstain?"\u662F":"\u5426"}</strong></span>
      ${i.length?`<span>Model <strong>${r(i.join(" \xB7 "))}</strong></span>`:""}
      ${s?'<span class="rag-wf-updating">\u66F4\u65B0\u4E2D\u2026</span>':""}
    </div>`}function _s(e,t,s="\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\uFF0C\u67E5\u770B\u53C3\u6578\u3001Token\u3001TTFT\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u4F86\u6E90\u6578\u91CF\u3002Waterfall \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u5E73\u884C\u57F7\u884C\u7684 span \u6703\u4F9D\u5BE6\u969B\u6642\u9593\u91CD\u758A\u986F\u793A\u3002",{legend:a=""}={}){return`<div class="rag-wf-axis"><span>0 ms</span><span>${r(me(t))}</span></div>
    ${a}
    <div class="rag-wf-stages">${(e||[]).map(n=>ql(n,t)).join("")}</div>
    <p class="rag-wf-hint">${r(s)}</p>`}function Zr(e){let t=(e.stages||[]).some(n=>n.loadInfo),s=t?'<div class="rag-wf-legend"><span><i class="is-load"></i>Model Load\uFF08\u968E\u6BB5 bar \u524D\u6BB5\uFF09</span></div>':"",a=t?"\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7D50\u675F\u5F8C\u63A5\u7E8C\u4E0B\u4E00\u968E\u6BB5\uFF1BEmbedding\uFF0FLLM \u7684\u85CD\u8272\u524D\u6BB5\u70BA Model Load\uFF0C\u5F8C\u6BB5\u70BA\u63A8\u8AD6\u3002\u5BE6\u969B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001Token \u8207\u8F09\u5165\u5360\u6BD4\u53EF\u5C55\u958B\u67E5\u770B\u3002":"\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7D50\u675F\u5F8C\u63A5\u7E8C\u4E0B\u4E00\u968E\u6BB5\u3002\u5BE6\u969B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207 Token \u53EF\u5C55\u958B\u67E5\u770B\u3002";return _s(e.stages,e.total,a,{legend:s})}function $a(e,{serverDurationMs:t=0,loading:s=!1,embedded:a=!1}={}){if(!e||typeof e!="object")return"";let n=Kr(e,t),i=n.traceStatus;return`<section class="report-card rag-wf-card${a?" rag-wf-embedded":""}">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${ha[i.tone]||ha.idle}">${r(i.label)}</span>
        </div>
        <div class="report-sub">Trace ID:
          <span class="mono">${r(n.requestId||"\u2014")}</span>
          \xB7 ${r(qe(n.startedAt))}
        </div>
      </div>
      <div class="rag-wf-actions">
        <a class="btn btn-secondary btn-sm" href="#/performance">
          ${m("activity",14)}<span>\u5B8C\u6574 Flow</span>
        </a>
      </div>
    </div>
    ${Xr(n,t,s)}
    ${Zr(n)}
  </section>`}var gt=null;function Al(){return gt||(gt=document.createElement("div"),gt.className="rag-wf-tooltip",gt.hidden=!0,document.body.appendChild(gt),gt)}function hn(){gt&&(gt.hidden=!0)}function ei(e){if(!gt||gt.hidden)return;let t=14,s=10,a=gt.getBoundingClientRect(),n=e.clientX+t,i=e.clientY+t;n+a.width>window.innerWidth-s&&(n=e.clientX-a.width-t),i+a.height>window.innerHeight-s&&(i=e.clientY-a.height-t),gt.style.left=`${Math.max(s,n)}px`,gt.style.top=`${Math.max(s,i)}px`}document.addEventListener("pointerover",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=Al(),a=t.dataset.ragWfTip||"";a&&(s.textContent=a,s.hidden=!1,ei(e))});document.addEventListener("pointermove",e=>{if(!(!gt||gt.hidden)){if(!e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]")){hn();return}ei(e)}});document.addEventListener("pointerout",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=e.relatedTarget;s instanceof Node&&t.contains(s)||hn()});window.addEventListener("scroll",hn,{capture:!0,passive:!0});function Ml(e,t,s,a){if(a&&!e.length)return`<div class="report-card rag-wf-card">
      ${Ee({tone:"danger",title:"RAG Pipeline \u8B80\u53D6\u5931\u6557",text:r(a.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-rag-waterfall">${m("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;if(!e.length)return`<div class="report-card rag-wf-card">
      ${ct({iconName:"activity",title:s?"\u8B80\u53D6 RAG Pipeline\u2026":"\u5C1A\u7121 RAG Pipeline \u7D00\u9304",text:s?"\u6B63\u5728\u6574\u7406\u6700\u8FD1\u7684 RAG \u554F\u7B54 Trace\u3002":"\u7522\u751F\u65B0\u7684 RAG \u554F\u7B54\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A Parsing\u3001Embedding\u3001Qdrant\u3001Context\u3001LLM \u8207 Response \u7684 waterfall\u3002"})}
    </div>`;let n=e.find(c=>String(c.id)===String(t))||e[0],i=n.flow&&typeof n.flow=="object"?n.flow:{},o=Kr(i,n.duration_ms),l=o.traceStatus,d=e.map(c=>{let v=Wr(c.flow||{});return`<option value="${r(String(c.id))}" ${String(c.id)===String(n.id)?"selected":""}>#${r(String(c.id))} \xB7 ${r(qe(c.started_at))} \xB7 ${r(me(c.duration_ms))} \xB7 ${r(v.label)}</option>`}).join("");return`<section class="report-card rag-wf-card">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${ha[l.tone]||ha.idle}">${r(l.label)}</span>
        </div>
        <div class="report-sub">Trace ID:
          <span class="mono">${r(o.requestId||n.request_id||"\u2014")}</span>
          \xB7 ${r(qe(n.started_at))}
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
    ${Xr(o,n.duration_ms,s)}
    ${Zr(o)}
  </section>`}function Ll(e){let t=Array.isArray(e?.segments)?e.segments:[],s=Array.isArray(e?.models)?e.models:[],a=e?.client||{},n=Math.max(...t.map(l=>Number(l.avg_ms)||0),1),i=a.samples?me(a.avg_total_ms??0):"\u2014",o=a.samples?me(a.avg_render_ms??0):"\u2014";return`<div class="perf-flow-stats">
    <div class="perf-stat-grid">
      <div class="perf-stat">
        <span class="perf-stat-value">${u(e?.avg_segments??0)}</span>
        <span class="perf-stat-label">\u5E73\u5747\u6BB5\u6578\uFF08\u6A23\u672C\uFF09</span>
      </div>
      <div class="perf-stat">
        <span class="perf-stat-value">${u(e?.max_segments??0)}</span>
        <span class="perf-stat-label">\u6700\u5927\u6BB5\u6578</span>
      </div>
      <div class="perf-stat">
        <span class="perf-stat-value">${u(e?.sample_size??0)}</span>
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
                    <span class="perf-model-count">${u(l.value)} \u6B21${l.avg_ms?` \xB7 \u5E73\u5747 ${me(l.avg_ms)}`:""}</span>
                  </div>`).join("")}</div>`:'<p class="muted" style="font-size:11px">\u5C1A\u7121\u6A21\u578B\u8CC7\u6599\uFF1B\u65B0\u7684 Flow \u6703\u5F9E params.model \u81EA\u52D5\u5F59\u6574\u3002</p>'}
      </div>
      <div class="perf-flow-stat-panel">
        <div class="report-section-head">
          <span class="report-section-title">\u6700\u6162\u5340\u6BB5\uFF08\u5E73\u5747\uFF09</span>
          <span class="muted" style="font-size:9.5px">\u6700\u8FD1 ${u(e?.sample_size??0)} \u7B46</span>
        </div>
        ${t.length?`<div class="perf-seg-list">${t.slice(0,6).map(l=>`<div class="perf-seg-row">
                    <span class="perf-seg-name" title="${r(l.label)}">${r(l.label)}</span>
                    <span class="perf-seg-track"><span style="width:${Math.max(2,(Number(l.avg_ms)||0)/n*100).toFixed(1)}%"></span></span>
                    <span class="perf-seg-ms">${me(l.avg_ms)}</span>
                  </div>`).join("")}</div>`:'<p class="muted" style="font-size:11px">\u5C1A\u7121\u5340\u6BB5\u8017\u6642\uFF1B\u9700\u6709\u542B flow \u7684\u65B0\u7D00\u9304\u3002</p>'}
      </div>
    </div>
  </div>`}function dt(e){let t=Math.max(0,Number(e)||0);if(!t)return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;let s=Math.round(t/1e3),a=Math.floor(s/3600),n=Math.floor(s%3600/60),i=s%60;return a?`${a}h ${String(n).padStart(2,"0")}m ${String(i).padStart(2,"0")}s`:n?`${n}m ${String(i).padStart(2,"0")}s`:`${(t/1e3).toFixed(1)}s`}function ti(e){let t=String(e?.task||"").trim();return t?t==="auto"?"\u81EA\u52D5\u63A5\u7E8C":`task ${t}`:"\u7D22\u5F15"}function jl(e){let t=(e||[]).slice(-12);if(!t.length)return'<p class="muted" style="font-size:11px">\u5C1A\u7121\u7D22\u5F15\u7D00\u9304\u3002</p>';let s=Math.max(...t.map(a=>Number(a.points_per_second)||0),.1);return`<div class="index-run-bars">${t.map(a=>{let n=Number(a.points_per_second)||0,i=Math.max(2,n/s*100);return`<div class="index-run-row">
        <div class="index-run-label">
          <strong>${r(ti(a))}</strong>
          <span>${r(qe(a.started_at))}</span>
        </div>
        <div class="index-run-track" title="${r(`${u(a.indexed_count)} \u7B46 \xB7 ${dt(a.duration_ms)} \xB7 ${u(a.batch_count)} \u6279`)}">
          <span style="width:${i.toFixed(1)}%"></span>
        </div>
        <div class="index-run-value">
          <strong>${n.toFixed(1)}</strong><span>\u7B46/\u79D2</span>
          <em>${u(a.indexed_count)} \u7B46 \xB7 ${dt(a.duration_ms)}</em>
        </div>
      </div>`}).join("")}</div>`}function Tl(e){let t=(Array.isArray(e.time_breakdown)?e.time_breakdown:[]).map(s=>({...s,ms:Number(s.ms)||0,percent:Number(s.percent)||0})).filter(s=>s.ms>0);return t.length?`<div class="index-breakdown-bar">${t.map(s=>`<span class="index-seg index-seg-${r(s.key)}" style="width:${Math.max(.5,s.percent).toFixed(2)}%" title="${r(`${s.label} ${dt(s.ms)}\uFF08${s.percent.toFixed(1)}%\uFF09`)}"></span>`).join("")}</div>
    <div class="index-breakdown-legend">${t.map(s=>`<span class="index-legend-item">
            <i class="index-seg index-seg-${r(s.key)}"></i>
            <span>${r(s.label)}</span>
            <strong>${dt(s.ms)}</strong>
            <em>${s.percent.toFixed(1)}%</em>
          </span>`).join("")}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B\u968E\u6BB5\u8A08\u6642\uFF1B\u5F8C\u7E8C\u7D22\u5F15\u6703\u8A18\u9304 Ollama Embedding\u3001Qdrant Upsert \u8207 PostgreSQL \u7D22\u5F15\u7D00\u9304\u7684\u6642\u9593\u7D44\u6210\u3002</div>'}function Nl(e,t){let s=(Array.isArray(e)?e:[]).map(L=>({elapsed:Math.max(0,Number(L.elapsed_s)||0),indexed:Math.max(0,Number(L.indexed)||0)})).filter(L=>L.indexed>0);if(s.length<2)return"";let a=Math.max(...s.map(L=>L.elapsed),(Number(t)||0)/1e3,1),n=Math.max(...s.map(L=>L.indexed),1),i=760,o=150,l=12,d=12,c=i-l*2,v=o-d*2,$=s.map(L=>[l+L.elapsed/a*c,o-d-L.indexed/n*v]),h=$.map(([L,E],T)=>`${T===0?"M":"L"}${L.toFixed(1)},${E.toFixed(1)}`).join(" "),g=`${h} L${$[$.length-1][0].toFixed(1)},${o-d} L${$[0][0].toFixed(1)},${o-d} Z`,p=Math.max(1,Math.ceil($.length/14)),w=$.map(([L,E],T)=>T%p===0||T===$.length-1?`<circle cx="${L.toFixed(1)}" cy="${E.toFixed(1)}" r="2.6" />`:"").join(""),k=[0,1,2,3].map(L=>{let E=d+v/3*L;return`<line x1="${l}" y1="${E.toFixed(1)}" x2="${i-l}" y2="${E.toFixed(1)}" class="index-chart-grid" />`}).join("");return`<div class="index-chart-card index-progress-card">
    <div class="index-chart-head">
      <span>\u672C\u6B21\u7D22\u5F15\u9032\u5EA6</span>
      <span>${u(n)} \u7B46 \xB7 ${dt(a*1e3)}</span>
    </div>
    <svg class="index-progress-svg" viewBox="0 0 ${i} ${o}" role="img" aria-label="\u7D22\u5F15\u9032\u5EA6\u6298\u7DDA\u5716">
      ${k}
      <path d="${g}" class="index-progress-area"></path>
      <path d="${h}" class="index-progress-line"></path>
      ${w}
      <line x1="${l}" y1="${o-d}" x2="${i-l}" y2="${o-d}" class="index-chart-axis"></line>
      <line x1="${l}" y1="${d}" x2="${l}" y2="${o-d}" class="index-chart-axis"></line>
    </svg>
    <div class="index-progress-labels">
      <span>0</span>
      <span>${dt(a*500)}</span>
      <span>${dt(a*1e3)}</span>
    </div>
  </div>`}function El(e){if(!e||!e.latest)return"";let t=e.latest,s=Array.isArray(e.runs)?e.runs:[],a=e.average||{},n=t.coverage||{},i=n.total_judgments>0?`${u(n.indexed_judgments)} / ${u(n.total_judgments)}\uFF08${(100*n.indexed_judgments/n.total_judgments).toFixed(1)}%\uFF09`:"\u2014",o=[{label:"\u7576\u6B21\u57F7\u884C\u7B46\u6578",value:u(t.indexed_count),note:`${u(t.batch_count)} \u6279 \xD7 ${u(t.batch_size)} \u7B46`},{label:"\u5E73\u5747\u6BCF\u79D2\u7B46\u6578",value:`${(Number(t.points_per_second)||0).toFixed(1)}`,note:"\u7B46/\u79D2"},{label:"\u7576\u6B21\u4F7F\u7528\u6642\u9593",value:dt(t.duration_ms),note:`${u(t.scanned_count)} \u7B46\u5DF2\u6383\u63CF`},{label:"\u5E73\u5747\u6BCF\u6279\u6642\u9593",value:dt(t.batch_avg_ms),note:t.batch_min_ms||t.batch_max_ms?`\u6700\u5FEB ${dt(t.batch_min_ms)} \xB7 \u6700\u6162 ${dt(t.batch_max_ms)}`:"\u4EE5\u7E3D\u8017\u6642 \xF7 \u6279\u6578\u8A08\u7B97"}];return`<section class="index-perf-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u7D22\u5F15\u6548\u80FD</div>
        <div class="index-perf-sub">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 \xB7 \u6700\u8FD1 ${u(e.run_count)} \u6B21\u57F7\u884C</div>
      </div>
      <span class="chip">${r(ti(t))}</span>
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
      <span><strong>batch</strong> ${u(t.batch_size)} \u7B46\uFF0F\u6279</span>
      <span><strong>embedding \u4E0A\u9650</strong> ${t.max_chars?`${u(t.max_chars)} \u5B57`:"\u2014"}</span>
      <span><strong>collection</strong> ${u(t.collection_points)} points</span>
      <span><strong>\u8986\u84CB\u7387</strong> ${r(i)}</span>
      <span><strong>\u5E73\u5747\u6BCF\u6B21\u57F7\u884C</strong> ${dt(a.duration_ms)} \xB7 ${(Number(a.points_per_second)||0).toFixed(1)} \u7B46/\u79D2</span>
    </div>
    <div class="index-charts">
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u8FD1\u7D22\u5F15\u541E\u5410</span>
          <span>\u7B46/\u79D2</span>
        </div>
        ${jl(s)}
      </div>
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u65B0\u4E00\u6B21\u6642\u9593\u7D44\u6210</span>
          <span>${dt(t.duration_ms)}</span>
        </div>
        ${Tl(t)}
      </div>
    </div>
    ${Nl(t.progress,t.duration_ms)}
  </section>`}var Qr=["#22d3ee","#a78bfa","#f59e0b","#ec4899","#3b82f6","#10b981","#f97316","#8b5cf6","#64748b"];function Gr(e){let t=String(e?.host||e?.url||"").trim(),s=e?.port?`:${e.port}`:"";return`${t||"\u2014"}${s}`}function Rl(e,t,s,a){if(a&&!e)return`<div class="report-card rag-wf-card">
      ${Ee({tone:"danger",title:"\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline \u8B80\u53D6\u5931\u6557",text:r(a.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-index-pipeline">${m("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;let n=Array.isArray(e?.runs)?e.runs:[];if(!n.length)return`<div class="report-card rag-wf-card">
      ${ct({iconName:"layers",title:s?"\u8B80\u53D6\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline\u2026":"\u5C1A\u7121\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline \u7D00\u9304",text:s?"\u6B63\u5728\u6574\u7406\u6700\u8FD1\u7684\u7248\u672C\u5316\u7D22\u5F15\u7D00\u9304\u3002":"\u57F7\u884C\u300CQdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u300D\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A host/model\u3001Blue-Green collection \u8207\u5404\u968E\u6BB5\u8017\u6642\u3002"})}
    </div>`;let i=n.find(E=>String(E.id)===String(t))||e?.latest||n[n.length-1],o=i?.pipeline&&typeof i.pipeline=="object"?i.pipeline:null,d=[...n].reverse().map(E=>{let T=Number(E.pipeline?.version_id||E.version_id||0),H=T?`v${String(T).padStart(3,"0")}`:"\u7D22\u5F15";return`<option value="${r(String(E.id))}" ${String(E.id)===String(i.id)?"selected":""}>${r(`${qe(E.started_at)} \xB7 ${H} \xB7 ${dt(E.duration_ms)}`)}</option>`}).join(""),c=Number(o?.version_id||i.version_id||0),v=c?`v${String(c).padStart(3,"0")}`:"\u2014",$=o?.host||{},h=Gr($),g=o?.model||i.model||"\u2014",p=Number(o?.total_ms)||Number(i.duration_ms)||0,w=Array.isArray(o?.stages)?o.stages:[],k=w.map((E,T)=>({...E,ms:Math.max(0,Number(E.duration_ms)||0),color:Qr[T%Qr.length]})).filter(E=>E.ms>0).map(E=>`<span class="index-pipeline-seg" style="width:${(E.ms/Math.max(1,p)*100).toFixed(2)}%;background:${r(E.color)}" title="${r(`${E.label} ${dt(E.ms)}`)}"></span>`).join(""),L=w.map((E,T)=>{let H=Math.max(0,Number(E.duration_ms)||0),G=p>0?H/p*100:0,Y=E.host&&typeof E.host=="object"?E.host:null;return`<div class="index-pipeline-row">
        <span class="index-pipeline-step">${String(T+1).padStart(2,"0")}</span>
        <div class="index-pipeline-copy">
          <div class="index-pipeline-title">
            <strong>${r(E.label||E.key||"\u968E\u6BB5")}</strong>
            ${Je(E.status||"success")}
          </div>
          <span class="index-pipeline-detail">${r(E.detail||"\u2014")}</span>
          ${Y?`<span class="index-pipeline-host">${m("server",12)} ${r(Gr(Y))} \xB7 ${r(E.model||g)}</span>`:""}
        </div>
        <div class="index-pipeline-time">
          <strong>${dt(H)}</strong>
          <span>${G.toFixed(1)}%</span>
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
            <span><strong>\u7248\u672C</strong> ${r(v)}</span>
            <span><strong>collection</strong> ${r(String(o.collection||"\u2014"))}</span>
            <span><strong>\u6A21\u5F0F</strong> ${r(String(o.build_mode||"\u2014"))}</span>
            <span><strong>\u672C\u6B21</strong> ${o.resumed?`\u63A5\u7E8C\uFF08\u5DF2\u7D22\u5F15 ${u(o.resumed_indexed)} \u7B46\uFF09`:"\u65B0\u5EFA\u7248\u672C"}</span>
            <span><strong>Host</strong> ${r(h)}</span>
            <span><strong>Model</strong> ${r(String(g))}</span>
            <span><strong>\u7E3D\u8017\u6642</strong> ${dt(p)}</span>
          </div>
          <div class="index-pipeline-bar">${k}</div>
          <div class="index-pipeline-list">${L}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B Pipeline \u968E\u6BB5\u8CC7\u6599\uFF1B\u4E0B\u4E00\u6B21 Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u6703\u8A18\u9304 host/model \u8207\u5404\u968E\u6BB5\u8017\u6642\u3002</div>'}
  </section>`}function Cl(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,n=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${n} \u9801 \xB7
      \u986F\u793A ${u(i)}\u2013${u(o)} / ${u(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Vr.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${m("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=n?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${m("chevronRight",13)}</button>
    </div>
  </div>`}function Pl(e){let t=String(e?.module||"");return t.includes("static")||t.includes("frontend")?"#65a30d":t.includes("judgment.rag")?"#8b5cf6":t.includes("judgment.web.app")?"#3b82f6":t.includes("judgment.web.query")?"#d97706":t.includes("judgment.judgment_index")?"#0d9488":"#64748b"}function Il(e){let t=fn(e),s=Math.max(0,Math.min(8,Number(e.depth)||0));return{key:"segment",label:`${"\u203A ".repeat(s)}${e.name||"unnamed"}`,hint:[e.module||"\u2014",e.function||"\u2014"].join(" \xB7 "),color:Pl(e),spans:[{...t,status:e.status||"ok",error:e.error,metadata:e.metadata||{},params:e.params||{},started_at:e.started_at,finished_at:e.finished_at}],start:t.offset,end:t.end,duration:t.duration}}function ya(e){return(e||[]).map(Il)}function Bl(e,t){let s=e.flow&&typeof e.flow=="object"?e.flow:null,a=Array.isArray(s?.segments)?[...s.segments].sort((h,g)=>Number(h.seq)-Number(g.seq)):[],n=s?.summary||{},i=Array.isArray(n.models)?n.models:[],o=s?.client||{},l=s?.metadata||{},d=l.question||"",c=l.answer||"",v=d||c?`<div class="perf-flow-qa">
          ${d?`<div class="perf-flow-qa-row"><strong>RAG \u554F\u984C</strong><span>${r(d)}</span></div>`:""}
          ${c?`<div class="perf-flow-qa-row"><strong>RAG \u7B54\u6848</strong><span>${r(c)}</span></div>`:""}
        </div>`:"",$=Math.max(Number(s?.total_ms)||0,Number(e.duration_ms)||0,...a.map(h=>(Number(h.offset_ms)||0)+(Number(h.duration_ms)||0)),1);return`<details class="perf-record" ${t===0?"open":""}>
    <summary class="perf-record-summary">
      <span class="perf-record-id">#${r(String(e.id))}</span>
      <span class="perf-record-main">
        <span class="perf-record-title">${r(e.process||"\u672A\u547D\u540D")}</span>
        <span class="perf-record-path mono">${r(e.method||"")} ${r(e.path||"")}</span>
      </span>
      <span class="perf-record-time">${qe(e.started_at)}</span>
      <span class="perf-record-duration">${me(e.duration_ms)}</span>
      ${Je(e.status)}
      <span class="perf-record-chevron">${m("chevronRight",14)}</span>
    </summary>
    <div class="perf-record-body">
      <div class="perf-flow-meta">
        <span><strong>Request</strong> <span class="mono">${r(e.request_id||s?.request_id||"\u2014")}</span></span>
        <span><strong>Server</strong> ${me(e.duration_ms)}</span>
        ${o.total_ms?`<span><strong>Client \u5168\u6D41\u7A0B</strong> ${me(o.total_ms)}</span>`:""}
        ${o.render_ms!==void 0?`<span><strong>Render</strong> ${me(o.render_ms)}</span>`:""}
        <span><strong>Flow</strong> ${a.length} \u6BB5</span>
        ${a.length?"<span><strong>Waterfall</strong> \u6BCF\u500B segment \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\u3001\u53EF\u9EDE\u9078\u5C55\u958B\u53C3\u6578</span>":""}
      </div>
      ${v}
      ${i.length?`<div class="chips perf-record-models">${i.map(h=>`<span class="chip">${r(h)}</span>`).join("")}</div>`:""}
      ${a.length?_s(ya(a),$,"\u6B64 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B segment \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u53C3\u6578\u3001module\uFF0Ffunction\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u932F\u8AA4\u3002"):`<div class="perf-no-flow">\u6B64\u7D00\u9304\u6C92\u6709 flow \u660E\u7D30\uFF08\u53EF\u80FD\u662F\u820A\u8CC7\u6599\u6216 CLI \u7D00\u9304\uFF09\u3002${e.params_text&&e.params_text!=="{}"?`<pre>${r(e.params_text)}</pre>`:""}</div>`}
      ${s?`<details class="flow-json">
              <summary>Flow JSON \xB7 ${a.length} \u6BB5</summary>
              <pre>${r(JSON.stringify(s,null,2))}</pre>
            </details>`:""}
    </div>
  </details>`}var Jr={embedding:"Embedding",retrieval:"Qdrant \u6AA2\u7D22",rerank:"Reranker",context:"PostgreSQL \u53D6\u6587",llm:"LLM \u751F\u6210",validation:"\u5F15\u7528\u9A57\u8B49"};function Ol(e){return{pending:"\u7B49\u5F85",running:"\u57F7\u884C\u4E2D",success:"\u5B8C\u6210",partial:"\u90E8\u5206\u6210\u529F",failed:"\u5931\u6557",skipped:"\u7565\u904E"}[e]||e||"\u672A\u77E5"}var Dl={embedding:"#3984c6",retrieval:"#d97706",rerank:"#8b5cf6",context:"#64748b",llm:"#16a34a",validation:"#8b5cf6"};function Fl(e,t){let s=Date.parse(e.started_at||""),a=Date.now(),n=Array.isArray(e.stage_order)?[...e.stage_order]:Object.keys(Jr);for(let c of t)c.stage&&!n.includes(c.stage)&&n.push(c.stage);let i=[],o=0;for(let c of n){let v=t.filter(g=>g.stage===c);if(!v.length)continue;let $=v.map(g=>{let p=Date.parse(g.started_at||""),w=Number.isFinite(s)&&Number.isFinite(p)?Math.max(0,p-s):0,k=Math.max(0,Number(g.duration_ms)||0);g.status==="running"&&Number.isFinite(p)&&(k=Math.max(k,a-p));let L=w+k;return o=Math.max(o,L),{offset:w,end:L,duration:k,status:g.status==="failed"?"error":g.status==="running"?"running":"ok",started_at:g.started_at,finished_at:g.finished_at,error:g.error_message,metadata:{...g.details||{},model:g.model,status:g.status,progress:Number(g.progress)||0,module:g.module,function:g.function},params:{model:g.model}}}),h=$.reduce((g,p)=>g+p.duration,0);i.push({key:"test_stage",label:Jr[c]||c,hint:`${$.length} \u500B\u7A0B\u5E8F`,color:Dl[c]||"#64748b",spans:$,start:$.length?Math.min(...$.map(g=>g.offset)):null,end:$.length?Math.max(...$.map(g=>g.end)):null,duration:h})}let l=e.status==="running"&&Number.isFinite(s)?Math.max(0,a-s):0,d=Math.max(Number(e.total_ms)||0,l,o,1);return{stages:i,total:d}}function ks(e,t,s,a={}){let n=a.showHistory!==!1,i=[`<option value="" ${s?"":"selected"}>\u76EE\u524D\uFF0F\u6700\u65B0\u6E2C\u8A66</option>`,...(t||[]).map(L=>`<option value="${r(L.run_id)}" ${L.run_id===s?"selected":""}>${r(Ol(L.status))} \xB7 ${r((L.question||"\u672A\u547D\u540D").slice(0,28))} \xB7 ${r(qe(L.started_at))}</option>`)].join(""),o=n?`<label class="test-flow-select-label">\u6B77\u53F2
        <select class="select" id="test-run-select">${i}</select>
      </label>
      <button class="btn btn-secondary btn-sm" type="button" id="test-flow-refresh">
        ${m("refresh",13)}<span>\u66F4\u65B0</span>
      </button>`:`<a class="btn btn-secondary btn-sm" href="#/performance">
        ${m("activity",13)}<span>\u6B77\u53F2 Flow</span>
      </a>`,l=`<div class="test-flow-head">
    <div class="test-flow-heading">
      <div class="eyebrow">PERFORMANCE TEST FLOW</div>
      <div class="test-flow-title">\u6E2C\u8A66\u6D41\u7A0B ${e?Je(e.status):""}</div>
      <div class="test-flow-question">${e?r(e.question||"\u672A\u547D\u540D\u6E2C\u8A66"):"\u5C1A\u7121\u6E2C\u8A66\u6D41\u7A0B\u3002\u8ACB\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u4E26\u5728 RAG \u9801\u63D0\u554F\u3002"}</div>
    </div>
    <div class="test-flow-actions">${o}</div>
  </div>`;if(!e)return`<div class="test-flow-panel card">${l}
      ${ct({iconName:"activity",title:"\u7B49\u5F85\u6E2C\u8A66\u6D41\u7A0B",text:"\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C\u6240\u6709\u53EF\u7528\u6A21\u578B\uFF0C\u4E26\u5728\u9019\u88E1\u5373\u6642\u986F\u793A\u6BCF\u500B\u968E\u6BB5\u7684\u9032\u5EA6\u3002"})}
    </div>`;let d=Array.isArray(e.steps)?e.steps:[],c=Fl(e,d),v=e.models||{},$=e.status==="running"?`${me(c.total)}\uFF08\u4F30\u7B97\uFF09`:me(e.total_ms),h=d.find(L=>L.stage==="llm"&&L.model===e.summary?.primary_model)||d.find(L=>L.stage==="llm"&&L.details?.answer_preview),g=String(h?.details?.provider_name||"").trim(),p=g&&e.summary?.primary_model?`${g}:${e.summary.primary_model}`:e.summary?.primary_model||"",w=e.answer||h?.details?.answer_preview||"",k=`<div class="test-flow-answer">
    <div class="test-flow-answer-head">
      <span>RAG \u5F15\u64CE\u7B54\u6848</span>
      ${p?`<span class="mono">${r(p)}</span>`:""}
    </div>
    <p>${w?r(w):e.status==="running"?"\u6E2C\u8A66\u9032\u884C\u4E2D\uFF0C\u5C1A\u672A\u7522\u751F\u6700\u7D42\u7B54\u6848\u3002":"\u6B64\u6E2C\u8A66\u6C92\u6709\u4FDD\u5B58\u53EF\u986F\u793A\u7684\u7B54\u6848\u3002"}</p>
  </div>`;return`<div class="test-flow-panel card">
    ${l}
    <div class="test-flow-meta">
      <span><strong>Run</strong> <span class="mono">${r(e.run_id)}</span></span>
      <span><strong>\u958B\u59CB</strong> ${r(qe(e.started_at))}</span>
      <span><strong>\u7E3D\u8017\u6642</strong> ${$}</span>
      <span><strong>Embedding</strong> ${Array.isArray(v.embedding)?v.embedding.length:0} \u500B</span>
      <span><strong>LLM</strong> ${Array.isArray(v.llm)?v.llm.length:0} \u500B</span>
      <span><strong>\u968E\u6BB5</strong> ${r(e.stage_label||e.stage||"\u2014")}</span>
    </div>
    ${k}
    ${c.stages.length?_s(c.stages,c.total,"\u6E2C\u8A66 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B\u7A0B\u5E8F\u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u6A21\u578B\u3001\u72C0\u614B\u3001\u9032\u5EA6\u3001module\uFF0Ffunction \u8207\u932F\u8AA4\u3002"):'<p class="muted">\u6B64\u6E2C\u8A66\u6C92\u6709\u5340\u6BB5\u8CC7\u6599\u3002</p>'}
    <div class="test-flow-foot">
      <span>${e.status==="running"?"\u6E2C\u8A66\u57F7\u884C\u4E2D\uFF1B\u6B64\u5716\u8868\u6703\u81EA\u52D5\u66F4\u65B0\u3002":n?"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u5F9E\u4E0A\u65B9\u300C\u6B77\u53F2\u300D\u9078\u55AE\u9084\u539F\u5176\u4ED6 Flow\u3002":"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u81F3\u6548\u80FD\u5831\u8868\u67E5\u770B\u6B77\u53F2 Flow\u3002"}</span>
      ${p?`<span class="mono">primary=${r(p)}</span>`:""}
    </div>
  </div>`}function zl(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.summary)?e.summary:[],a=e.flow_stats||e.meta?.flow_stats||{},n=e.index_stats||null;return`<div class="report-card performance-flow-report" data-database="performance">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">PERFORMANCE FLOW REPORT</div>
        <div class="report-title">
          \u6548\u80FD\u5831\u8868 ${Je(e.status||"ok")}
          <span class="chip">performance_records</span>
        </div>
        <div class="report-sub">
          ${u(e.total)} \u7B46\u7B26\u5408 \xB7 ${me(e.duration_ms)} \xB7
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
    ${El(n)}
    ${Ll(a)}
    <div class="report-section-head perf-flow-list-head">
      <span class="report-section-title">Flow \u7D00\u9304</span>
      <span class="muted" style="font-size:9.5px">\u9EDE\u64CA\u5217\u5C55\u958B\u6A21\u7D44\u3001\u51FD\u6578\u3001\u53C3\u6578\u8207\u5340\u6BB5\u8017\u6642</span>
    </div>
    <div class="perf-record-list">
      ${t.length?t.map((i,o)=>Bl(i,o)).join(""):ct({iconName:"activity",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684 Flow",text:"\u653E\u5BEC\u65E5\u671F\u3001\u6A21\u578B\u6216\u8017\u6642\u689D\u4EF6\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}
    </div>
    ${Cl(e)}
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
  </div>`}async function Hl(e,t){let s=!1,a=gn(),n={processes:[],modules:[],statuses:[],methods:[],models:[]},i=1,o=25,l=null,d=[],c="",v=!1,$=null,h=!1,g=null,p="",w=!1,k=null,L=!1;e.innerHTML=`<section class="page data-page performance-page">
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
          <button class="status-tab" type="button" data-performance-tab="index-pipeline">
            <span class="status-tab-icon">${m("layers",15)}</span>
            <span class="status-tab-copy"><strong>\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</strong><small>Host\uFF0FModel\u3001Blue-Green \u8207\u968E\u6BB5\u8017\u6642</small></span>
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
              <div id="performance-report">${Ds({label:"\u6548\u80FD\u5831\u8868"})}</div>
            </section>
          </div>
        </div>
        <div id="performance-panel-pipeline" hidden></div>
        <div id="performance-panel-index-pipeline" hidden></div>
        <div id="performance-panel-benchmark" hidden></div>
      </section>
    </div>
  </section>`;let E=e.querySelector("#performance-filter-fields"),T=e.querySelector("#performance-filter-form"),H=e.querySelector("#performance-test-flow"),G=e.querySelector("#performance-report"),Y=e.querySelector("#performance-panel-pipeline"),ye=e.querySelector("#performance-panel-index-pipeline"),Ae=e.querySelector("#performance-meta"),J=e.querySelector("#performance-refresh"),B=[...e.querySelectorAll("[data-performance-tab]")],S={overview:e.querySelector("#performance-panel-overview"),pipeline:e.querySelector("#performance-panel-pipeline"),"index-pipeline":e.querySelector("#performance-panel-index-pipeline"),benchmark:e.querySelector("#performance-panel-benchmark")},C="overview",ne=x=>{C=x;for(let j of B){let W=j.dataset.performanceTab===x;j.classList.toggle("is-active",W),W?j.setAttribute("aria-current","page"):j.removeAttribute("aria-current")}for(let[j,W]of Object.entries(S))W&&(W.hidden=j!==x);x==="benchmark"?Ae.textContent="BENCHMARK \xB7 RAG":x==="pipeline"?Ae.textContent="PERFORMANCE \xB7 RAG WATERFALL":x==="index-pipeline"?Ae.textContent="PERFORMANCE \xB7 INDEX PIPELINE":l&&(Ae.textContent=`PERFORMANCE \xB7 ${u(l.total)} \u7B46`)},ge=Mr(e,{onNavigate:x=>ne(x)}),V=()=>{Y&&(Y.innerHTML=Ml(d,c,v,$))},Z=async({force:x=!1}={})=>{if(!(s||v)){if(h&&!x){V();return}v=!0,d.length||V();try{let j=await U.performance({keyword:"/api/rag"},1,50);if(s)return;let W=(Array.isArray(j.rows)?j.rows:[]).filter(F=>F.flow&&(String(F.path||"").includes("/api/rag")||String(F.process||"").includes("RAG")));d=W,(!c||!W.some(F=>String(F.id)===String(c)))&&(c=W[0]?String(W[0].id):""),$=null,h=!0}catch(j){if(s)return;$=j}finally{s||(v=!1,V())}}},ae=()=>{ye&&(ye.innerHTML=Rl(g,p,w,k))},ee=async({force:x=!1}={})=>{if(!(s||w)){if(L&&!x){ae();return}w=!0,g||ae();try{let j=await U.performance({},1,1);if(s)return;g=j.index_pipeline||j.index_stats||null;let W=Array.isArray(g?.runs)?g.runs:[];(!p||!W.some(F=>String(F.id)===String(p)))&&(p=g?.latest?String(g.latest.id):""),k=null,L=!0}catch(j){if(s)return;k=j}finally{s||(w=!1,ae())}}},_e=x=>{ne(x),x==="benchmark"&&ge.show(),x==="pipeline"&&Z(),x==="index-pipeline"&&ee()};e.addEventListener("click",x=>{let j=x.target.closest("[data-performance-tab]");j&&_e(j.dataset.performanceTab||"overview")}),Y?.addEventListener("change",x=>{x.target.matches("[data-rag-trace-select]")&&(c=String(x.target.value||""),V())}),Y?.addEventListener("click",x=>{x.target.closest('[data-action="refresh-rag-waterfall"]')&&Z({force:!0})}),ye?.addEventListener("change",x=>{x.target.matches("[data-index-pipeline-select]")&&(p=String(x.target.value||""),ae())}),ye?.addEventListener("click",x=>{x.target.closest('[data-action="refresh-index-pipeline"]')&&ee({force:!0})});let z=null,be=[],Me="",pe=null,tt="",Oe=()=>{E.innerHTML=$l(n,a)},He=()=>{let x=JSON.stringify({selected:Me,tick:z?.status==="running"?Math.floor(Date.now()/1e3):0,runs:be.map(j=>`${j.run_id}:${j.status}`),run:z?{run_id:z.run_id,status:z.status,progress:z.progress,total_ms:z.total_ms,steps:(z.steps||[]).map(j=>`${j.stage}:${j.model}:${j.status}:${j.progress}:${j.duration_ms}`)}:null});x!==tt&&(tt=x,H.innerHTML=ks(z,be,Me))},Le=async()=>{try{let x=await U.testRuns(30);if(s)return;be=Array.isArray(x.runs)?x.runs:[]}catch{if(s)return;be=[]}},Qe=async(x=null)=>{try{let j=x&&!Me?x:Me?await U.testRun(Me):await U.testRunCurrent();if(s)return;z=j.run||null,!Me&&z&&z.status!=="running"&&!be.some(W=>W.run_id===z.run_id)&&await Le(),He()}catch{if(s)return;z=null,He()}},Ye=async(x=null)=>{s||Me||await Qe(x)},ft=()=>{s||pe||(pe=wt("test-runs",(x,j)=>Ye(j?.snapshot||null)))};H.addEventListener("change",async x=>{x.target.id==="test-run-select"&&(Me=String(x.target.value||""),await Qe())}),H.addEventListener("click",async x=>{x.target.closest("#test-flow-refresh")&&(Me="",await Le(),await Qe())});let N=async(x=i,{quiet:j=!1}={})=>{i=Math.max(1,Number(x)||1),a=zr();let W=G.querySelector(".report-card"),F=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!W?G.setAttribute("aria-busy","true"):(G.removeAttribute("aria-busy"),G.innerHTML=Ds({label:"\u6548\u80FD\u5831\u8868"}));let Re=e.querySelector("#performance-run");j||ke(Re,!0,"\u67E5\u8A62\u4E2D\u2026");try{let Be=await U.performance(a,i,o);if(s)return;if(l=Be,Be.index_pipeline){g=Be.index_pipeline;let kt=Array.isArray(g.runs)?g.runs:[];(!p||!kt.some(nt=>String(nt.id)===String(p)))&&(p=g.latest?String(g.latest.id):""),L=!0,k=null}if(i=Number(Be.page)||i,o=Number(Be.page_size)||o,G.removeAttribute("aria-busy"),G.innerHTML=zl(Be),F!==null){let kt=G.querySelector("[data-page-size]");kt&&(kt.value=String(o),kt.focus({preventScroll:!0}))}Ae.textContent=`PERFORMANCE \xB7 ${u(Be.total)} \u7B46`,Ae.className="badge badge-neutral badge-mono"}catch(Be){if(s)return;G.removeAttribute("aria-busy"),G.innerHTML=ga(Be,{label:"\u6548\u80FD\u5831\u8868"}),M(Be.message||"\u6548\u80FD\u5831\u8868\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{s||ke(Re,!1)}},D=async()=>{try{n=await U.performanceOptions()}catch{n={processes:[],modules:[],statuses:[],methods:[],models:[]}}Oe()};return T.addEventListener("submit",x=>{x.preventDefault(),N(1)}),e.querySelector('[data-action="reset"]').addEventListener("click",()=>{a=gn(),i=1,Oe(),N(1)}),J.addEventListener("click",async()=>{if(C==="pipeline"){ke(J,!0,"\u6574\u7406\u4E2D\u2026");try{await Z({force:!0})}finally{s||ke(J,!1)}return}if(C==="index-pipeline"){ke(J,!0,"\u6574\u7406\u4E2D\u2026");try{await ee({force:!0})}finally{s||ke(J,!1)}return}if(C==="benchmark"){ke(J,!0,"\u6574\u7406\u4E2D\u2026");try{await ge.refresh()}finally{s||ke(J,!1)}return}a=zr(),J.disabled=!0,ke(J,!0,"\u6574\u7406\u4E2D\u2026"),await D(),await Le(),s||await Qe(),s||await N(1),s||(J.disabled=!1,ke(J,!1))}),G.addEventListener("click",async x=>{let j=x.target.closest("[data-action]");if(!j||!l)return;let W=j.dataset.action;if(W==="retry"){N(i);return}if(W==="prev-page"){N(Math.max(1,Number(l.page)-1),{quiet:!0});return}if(W==="next-page"){let F=Math.max(1,Math.ceil(Number(l.total)/Number(l.page_size)));N(Math.min(F,Number(l.page)+1),{quiet:!0});return}if(W==="copy-query"){let F=await fs(l.query_text||"");M(F?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",F?"ok":"warn");return}if(W==="export-json"){let F=`performance-page-${l.page}.json`;Ot(F,JSON.stringify(ba(l),null,2),"application/json;charset=utf-8"),M(`\u5DF2\u532F\u51FA ${F}`,"ok");return}if(W==="export-csv"){let F=`performance-page-${l.page}.csv`;Ot(F,fa(l),"text/csv;charset=utf-8"),M(`\u5DF2\u532F\u51FA ${F}`,"ok")}}),G.addEventListener("change",x=>{x.target.matches("[data-page-size]")&&(o=Number(x.target.value)||25,Vr.includes(o)||(o=25),N(1,{quiet:!0}))}),await Promise.allSettled([D(),Le()]),s||(await Qe(),await N(1),ft()),t&&typeof t.setTitle=="function"&&t.setTitle("\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"),()=>{s=!0,pe&&pe(),ge.destroy()}}var Ul=["\u91D1\u878D\u6D88\u8CBB\u8005\u4FDD\u8B77\u6CD5\u5982\u4F55\u8655\u7406\u91D1\u878D\u6D88\u8CBB\u722D\u8B70\uFF1F","\u8B49\u5238\u4EA4\u6613\u6CD5\u5C0D\u5167\u7DDA\u4EA4\u6613\u6709\u4EC0\u9EBC\u898F\u7BC4\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5438\u6536\u5B58\u6B3E\u8207\u6388\u4FE1\u6709\u54EA\u4E9B\u9650\u5236\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5F9E\u696D\u4EBA\u54E1\u6709\u90A3\u4E9B\u898F\u5B9A\uFF1F","\u4FDD\u96AA\u6CD5\u5C0D\u65BC\u696D\u52D9\u54E1\u4E0D\u7576\u62DB\u652C\u7684\u8CAC\u4EFB\u898F\u5B9A\uFF1F","\u9280\u884C\u6CD5\u6709\u591A\u5C11\u689D\u6587\uFF1F","\u8B49\u5238\u71DF\u696D\u54E1\u5E38\u89F8\u72AF\u4EC0\u9EBC\u6CD5\u898F\u6216\u547D\u4EE4\uFF1F","\u6709\u54EA\u4E9B\u6CD5\u898F\u662F\u548C\u58FD\u96AA\u53CA\u7522\u96AA\u76F8\u95DC\u7684\uFF1F"];function Ql(){return`<div class="answer-placeholder">
    <span class="empty-icon">${m("sparkles",26)}</span>
    <h2 class="empty-title">\u7B54\u6848\u53EA\u6703\u4F86\u81EA\u6AA2\u7D22\u5230\u7684\u5224\u6C7A\u53CA\u6CD5\u898F\u7247\u6BB5</h2>
    <p class="empty-text">\u9001\u51FA\u554F\u984C\u5F8C\uFF0C\u7CFB\u7D71\u6703\u5148\u4EE5 Qdrant \u6AA2\u7D22\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\u4E26\u6A19\u793A\u5F15\u7528\u7DE8\u865F\u3002
      \u82E5\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u660E\u78BA\u986F\u793A\u964D\u7D1A\u72C0\u614B\uFF0C\u4E0D\u6703\u6191\u7A7A\u751F\u6210\u7B54\u6848\u3002</p>
  </div>`}function yn(){return`<section class="card answer-card rag-empty-answer">${Ql()}</section>`}function si(e,t){return`<div class="rag-turn">
    <div class="rag-user-bubble">${r(e)}</div>
    <section class="card rag-assistant-turn" data-rag-answer>${t}</section>
  </div>`}function Gl(e,t){return Promise.race([e,new Promise((s,a)=>{window.setTimeout(()=>a(new Error("pipeline lookup timed out")),t)})])}async function Jl(e){if(!e||e.pipeline_flow)return e;let t=String(e._client_request_id||e.request_id||"").trim();if(!t)return e;for(let s=0;s<3;s+=1){try{let a=await Gl(U.performance({keyword:t},1,5),1800),n=(Array.isArray(a.rows)?a.rows:[]).find(i=>String(i.request_id||"")===t&&i.flow&&typeof i.flow=="object");if(n)return e.pipeline_flow=n.flow,e}catch{}s<2&&await new Promise(a=>window.setTimeout(a,250))}return e}function Vl(e){return{status:e.status,answer:e.answer,answer_source:e.answer_source,notice:e.notice,citations:Array.isArray(e.citations)?e.citations:[],judgments:Array.isArray(e.judgments)?e.judgments:[],law_sources:Array.isArray(e.law_sources)?e.law_sources:[],matched_terms:Array.isArray(e.matched_terms)?e.matched_terms:[],law_answer:e.law_answer,law_framework:e.law_framework,llm_model:e.llm_model,embedding_model:e.embedding_model,duration_ms:e.duration_ms,show_sources:e.show_sources,pipeline_flow:e.pipeline_flow||null,test_run:e.test_run||null,partial:!1,streaming:!1}}var Wl={"http.request":"FastAPI \u63A5\u6536\u8ACB\u6C42","http.response":"\u56DE\u50B3\u7D50\u679C\u7D66\u524D\u7AEF","rag.answer_question":"RAG \u4E3B\u6D41\u7A0B","rag.coverage":"PostgreSQL \u7D22\u5F15\u8986\u84CB\u6AA2\u67E5","rag.law_retrieval":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22","rag.law_lookup":"\u6BD4\u5C0D\u554F\u984C\u4E2D\u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u540D\u7A31","rag.law_content":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u689D\u6587","rag.qdrant_precheck":"Qdrant collection \u6AA2\u67E5","rag.search":"RAG \u6AA2\u7D22","rag.embed_query":"Ollama embedding \u67E5\u8A62\u5411\u91CF","rag.qdrant_search":"Qdrant \u5411\u91CF\u641C\u5C0B","rag.fetch_documents":"PostgreSQL \u8B80\u53D6\u5224\u6C7A","rag.postgres_fetch":"PostgreSQL \u5224\u6C7A\u67E5\u8A62","rag.build_citations":"\u6574\u7406\u5F15\u7528\u8207\u5224\u6C7A\u7247\u6BB5","rag.extract_excerpt":"\u64F7\u53D6\u76F8\u95DC\u7247\u6BB5","rag.llm":"LLM \u56DE\u7B54\u751F\u6210","rag.llm_request":"Ollama LLM \u751F\u6210","rag.validate_citations":"\u9A57\u8B49\u5F15\u7528\u7DE8\u865F","rag.test_mode":"\u6E2C\u8A66\u6A21\u5F0F\u591A\u6A21\u578B\u6D41\u7A0B","rag.preview_fallback":"\u6CD5\u898F\u9810\u89BD\u964D\u7D1A"};function Kl(e){let t=String(e?.name||""),s=e?.params||{},a=String(s.model||s.embedding_model||"").trim();return t==="rag.llm_request"?`Ollama run ${a||"LLM"}`:t==="rag.llm"?`LLM \u56DE\u7B54\u751F\u6210${a?` \xB7 ${a}`:""}`:t==="rag.embed_query"?`Ollama embedding \u67E5\u8A62\u5411\u91CF${a?` \xB7 ${a}`:""}`:Wl[t]||t||"backend step"}function ai(e){return[e?.module,e?.function,e?.name].filter(Boolean).join(" \xB7 ")}function ni(e){let t=Number(e);return Number.isFinite(t)?`${u(Math.max(0,Math.round(t)))} ms`:"\u2014"}function wn(e,t){if(!e)return;e.classList.toggle("is-open",t);let s=e.querySelector("#rag-process-body"),a=e.querySelector(".rag-process-toggle");s&&(s.hidden=!t),a&&(a.setAttribute("aria-expanded",String(t)),a.title=t?"\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B":"\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B")}function Yl(){return`<div class="rag-process is-open" id="rag-process">
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
  </div>`}function Xl(e){let t=e.querySelector("#rag-process"),s=t?.querySelector("#rag-process-list"),a=t?.querySelector("#rag-process-summary"),n=performance.now(),i=new Map,o=new Map,l=(g,p,w)=>{let k=g.querySelector(p);k&&(k.textContent=w)},d=g=>{if(g.failed){l(g.element,".rag-process-meta","\u5931\u6557");return}if(g.hasChildren){l(g.element,".rag-process-meta","");return}l(g.element,".rag-process-meta",ni(g.durationMs))},c=g=>{let p=g-1,w=[...i.values()].reverse();for(let k of w){if(p<0)break;k.depth<=p&&(k.hasChildren||(k.hasChildren=!0,k.element.dataset.hasChildren="true",k.finished&&d(k)),p=k.depth-1)}},v=g=>{if(!s)return null;let p=String(g?.seq??`step-${i.size+1}`),w=i.get(p);if(!w){let k=Math.max(0,Math.min(6,Number(g?.depth)||0));c(k);let L=document.createElement("div");L.className="rag-process-item is-running",L.dataset.processKey=p,L.style.setProperty("--depth",String(k)),L.innerHTML=`<span class="rag-process-dot"></span>
        <span class="rag-process-label"></span>
        <span class="rag-process-meta">\u57F7\u884C\u4E2D\u2026</span>`,s.appendChild(L),w={element:L,depth:k,hasChildren:!1,finished:!1,failed:!1,durationMs:0},i.set(p,w)}return l(w.element,".rag-process-label",Kl(g)),w.element.title=ai(g),w};return{step:g=>{let p=g?.segment;if(!p)return;o.set(String(p.seq??p.name??o.size),{...p});let w=v(p);if(w){if(g.type==="segment_start"){w.element.classList.add("is-running"),l(w.element,".rag-process-meta","\u57F7\u884C\u4E2D\u2026");return}if(g.type==="segment_end"){let k=p.status==="error";w.element.classList.remove("is-running"),w.element.classList.toggle("is-error",k),w.finished=!0,w.failed=k,w.durationMs=Number(p.duration_ms)||0,d(w),w.element.title=[ai(p),k&&p.error||""].filter(Boolean).join(" \xB7 ")}}},finish:(g=!0)=>{if(!t)return"";t.querySelectorAll(".rag-process-item.is-running").forEach(L=>{L.classList.remove("is-running");let E=L.dataset.hasChildren==="true";l(L,".rag-process-meta",E?"":g?"\u5B8C\u6210":"\u4E2D\u65B7")});let p=s?.children.length||i.size,w=ni(Math.max(0,performance.now()-n));a&&(a.textContent=g?`\u5B8C\u6210 \xB7 ${p} \u6B65 \xB7 ${w}`:`\u5931\u6557 \xB7 ${p} \u6B65`);let k=[...o.values()].filter(L=>L?.name).sort((L,E)=>Number(L.offset_ms||0)-Number(E.offset_ms||0));if(s&&k.length){let L=Math.max(1,...k.map(E=>Number(E.end_offset_ms)||(Number(E.offset_ms)||0)+(Number(E.duration_ms)||0)));s.classList.add("is-waterfall"),s.innerHTML=_s(ya(k),L,"\u5F8C\u7AEF Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B span \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u53C3\u6578\u3001module\uFF0Ffunction\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u932F\u8AA4\u3002")}return t.classList.add("is-complete"),wn(t,!1),t.outerHTML},collapse:()=>wn(t,!1)}}function Zl(e,t=!1){let s=t?"\u6E2C\u8A66\u6A21\u5F0F\uFF1A\u6B63\u5728\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207 LLM \u6A21\u578B\uFF0C\u53EF\u80FD\u9700\u8981\u6578\u5206\u9418\u2026":"\u6B63\u5728\u4EE5\u5411\u91CF\u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\u7247\u6BB5\u4E26\u751F\u6210\u56DE\u7B54\uFF1B\u5FEB\u901F\u6A21\u5F0F\u901A\u5E38 2\u201310 \u79D2\u2026";return`<div class="answer-head">
      <div class="answer-head-left">${m("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u4E2D</span>
      </div>
      <div class="answer-head-meta"><span class="spinner"></span></div>
      ${t?"":Yl()}
    </div>
    <div class="answer-body">
      <p class="answer-text">${s}\u300C${r(e)}\u300D</p>
      <div class="skeleton skeleton-line" style="margin-top:22px;width:92%"></div>
      <div class="skeleton skeleton-line" style="width:76%"></div>
      <div class="skeleton skeleton-line" style="width:84%"></div>
    </div>`}function ri(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function _a(e,{lawKey:t="",sourceType:s="",label:a=""}={}){let n=String(e||"").trim();return n?`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${r(t||n)}"
    data-source-type="${r(s||"")}"
    title="\u9EDE\u64CA\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587">${r(a||n)}</button>`:""}function li(e){let t=String(e?.law_name||"").trim(),s=String(e?.article_no||"").replace(/\s+/g,"");if(!t||!s)return"";let a=(Array.isArray(e?.paragraphs)?e.paragraphs:[]).map(i=>String(i||"").trim()).filter(Boolean),n=`${t}${s}${a.join("\u3001")}`;return`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${r(t)}"
    data-source-type=""
    data-article-no="${r(s)}"
    title="\u9EDE\u64CA\u67E5\u770B ${r(n)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587">${r(n)}</button>`}function ec(e,t){let s=e.score===null||e.score===void 0?"":`\u76F8\u4F3C\u5EA6 ${Number(e.score).toFixed(4)}`,a=[e.court,e.jdate,s].filter(Boolean).map(c=>`<span>${r(c)}</span>`).join(""),n=(Array.isArray(e.law_citations)?e.law_citations:[]).map(c=>li(c)).filter(Boolean).slice(0,12).join(""),i=n||(Array.isArray(e.matched_laws)?e.matched_laws:[]).slice(0,5).map(c=>_a(c)).join(""),o=n?'<div class="citation-meta"><span>\u5224\u6C7A\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4</span></div>':"",l=e.jid?` data-action="open-parquet-judgment"
        data-jid="${r(e.jid)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A"
        aria-label="\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A ${r(e.jid)}"`:"",d=e.pdf_url?`<a class="citation-link" href="${r(e.pdf_url)}" target="_blank" rel="noopener noreferrer" title="\u958B\u555F\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF">\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF${m("external",11)}</a>`:"";return`<article class="citation">
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
    <div class="citation-links">${d}</div>
  </article>`}function tc(e,t){let s=[e.law_level,e.law_category,e.article_count?`${u(e.article_count)} \u689D`:""].filter(Boolean).map(o=>`<span>${r(o)}</span>`).join(""),a=e.law_url?`<a class="citation-link" href="${r(e.law_url)}" target="_blank" rel="noopener noreferrer">\u4F86\u6E90${m("external",11)}</a>`:"",n=e.law_key||e.law_name||"",i=n?` data-action="open-law-source"
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
  </article>`}function sc(e,t){let s=e.source_label||(e.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),a=e.law_level&&e.law_level!==s?e.law_level:"",n=[`<span class="badge ${e.source_type==="order"?"badge-warn":"badge-info"}">${r(s)}</span>`,a,e.law_category,e.article_count?`${u(e.article_count)} \u689D`:"",e.law_modified_date?`\u7570\u52D5 ${It(e.law_modified_date)}`:""].filter(Boolean).map(g=>`<span>${g}</span>`).join(""),i=e.first_promulgation?`<div class="citation-meta"><span>\u6700\u65E9\u5236\u5B9A\uFF1A${r(e.first_promulgation.roc_date)}\uFF08\u897F\u5143 ${r(e.first_promulgation.gregorian_date)}\uFF09</span></div>`:"",o=e.stats,l=o?`<div class="law-source-stats">
        <span>\u63D0\u53CA\u300C${r(o.entity||"")}\u300D\u7684\u5224\u6C7A ${u(o.judgment_count||0)} \u7B46</span>
        <span>\u672C\u6CD5\u898F\u88AB\u5F15\u7528 ${u(o.law_count||0)} \u6B21</span>
      </div>`:"",d=e.law_key||"",c=e.source_type||"",v=(Array.isArray(e.articles)?e.articles:[]).map(g=>{let p=String(g.article_no||"");return`<div class="law-source-article"${d&&p?` data-action="open-law-source"
        data-law-key="${r(d)}"
        data-source-type="${r(c)}"
        data-article-no="${r(p)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u9078\u67E5\u770B ${r(p)} \u7684\u5B8C\u6574\u5167\u5BB9"
        aria-label="\u958B\u555F ${r(e.law_name||"\u6CD5\u898F")} ${r(p)} \u7684\u5B8C\u6574\u689D\u6587"`:""}>
        <span class="law-source-article-no">${r(g.article_no||"\u689D\u6587")}</span>
        <p class="law-source-article-text">${r(g.article_content||"")}</p>
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
      ${v}
    </div>
    <div class="citation-links">${$}</div>
  </article>`}function ac(e,t=150){let s=String(e||"").replace(/\s+/g," ").trim();return s?s.length>t?`${s.slice(0,t)}\u2026`:s:""}function nc(e,t){return!Array.isArray(e)||!e.length?`<p class="answer-text">${r(t)}</p>`:`<div class="law-answer-list">${e.map(s=>{let a=s.law_key||"",n=s.source_type||"",i=s.law_name||"\u672A\u547D\u540D\u6CD5\u898F",o=s.source_label||(n==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),l=Number(s.article_count||0),d=s.index!=null?`<span class="law-answer-index">[${r(String(s.index))}]</span>`:"",c=a?`<button class="law-answer-law" type="button"
            data-action="open-law-source"
            data-law-key="${r(a)}"
            data-source-type="${r(n)}"
            title="\u9EDE\u64CA\u958B\u555F ${r(i)} \u7684\u5B8C\u6574\u689D\u6587"
            aria-label="\u958B\u555F ${r(i)} \u7684\u5B8C\u6574\u689D\u6587">${r(i)}</button>`:`<strong>${r(i)}</strong>`,v=Array.isArray(s.articles)?s.articles:[],$=v.length?`<div class="law-answer-articles-label">\u76F8\u95DC\u689D\u6587</div>
          <div class="law-answer-articles">${v.map(h=>{let g=String(h.article_no||"").trim(),p=ac(h.article_content);return!a||!g?`<div class="law-answer-article is-static">
                  <span class="law-answer-article-no">${r(g||"\u689D\u6587")}</span>
                  <span class="law-answer-article-text">${r(p)}</span>
                </div>`:`<button class="law-answer-article" type="button"
                data-action="open-law-source"
                data-law-key="${r(a)}"
                data-source-type="${r(n)}"
                data-article-no="${r(g)}"
                title="\u9EDE\u64CA\u67E5\u770B ${r(g)} \u7684\u5B8C\u6574\u5167\u5BB9"
                aria-label="\u958B\u555F ${r(i)} ${r(g)} \u7684\u5B8C\u6574\u689D\u6587">
                <span class="law-answer-article-no">${r(g)}</span>
                <span class="law-answer-article-text">${r(p)}</span>
              </button>`}).join("")}</div>`:"";return`<div class="law-answer-source">
        <div class="law-answer-source-head">
          ${c}
          <span class="law-answer-source-meta">\uFF08${r(o)}\uFF0C${u(l)} \u689D\uFF09</span>
          ${d}
        </div>
        ${$}
      </div>`}).join("")}</div>`}function rc(e,t){if(!Array.isArray(e)||!e.length)return"";let s=new Map((Array.isArray(t)?t:[]).map(a=>[String(a.law_name||""),a]));return`<div class="answer-section-label" style="margin-top:18px">
      <span>\u547D\u4E2D\u8A5E\u5F59</span>
    </div>
    <div class="chips">${e.map(a=>{let n=s.get(String(a));return n?.law_key?_a(a,{lawKey:n.law_key,sourceType:n.source_type||""}):`<span class="chip">${r(a)}</span>`}).join("")}</div>`}function ic(e,t){if(!e)return"";let s=Array.isArray(e.providers)?e.providers:[],a=e.active||s.find(c=>c.active),n=String(e.status||""),i=String(e.model||"").trim(),o=a?`${a.name}:${i}`:n==="not_configured"?"\u672A\u555F\u7528":"\u7121\u53EF\u7528\u6A21\u578B",l=s.map(c=>{let v=c.status==="operational",$=!!c.active||c===a,h=`${c.name||"reranker"}:${i}`,g=$?"\u4F7F\u7528\u4E2D":v?c.role==="fallback"?"fallback":"\u4E3B\u8981":"\u96E2\u7DDA";return`<span class="rag-model-button is-static${$?" is-active":""}${v?"":" is-unavailable"}"
        title="${r(`${h} \xB7 ${c.url||""}`)}"
        aria-label="${r(`${h}\uFF0C${g}`)}">
        <span class="rag-model-state" aria-hidden="true"></span>
        <span>${r(h)}</span>
        <span class="rag-model-current">${r(g)}</span>
      </span>`}).join(""),d=s.length?"":'<p class="rag-model-empty">\u5C1A\u672A\u8A2D\u5B9A reranker URL\u3002</p>';return`<div class="rag-model-strip rag-model-strip-rerank">
    <div class="rag-model-strip-head">
      <span class="rag-model-strip-title">${m("layers",13)} Rerank models</span>
      ${i?`<span class="rag-model-strip-base mono">${r(i)}</span>`:""}
      <span class="rag-model-strip-current">\u76EE\u524D\uFF1A<strong>${r(o)}</strong></span>
      <button class="btn btn-ghost btn-sm rag-model-refresh" type="button"
        data-rag-action="refresh-rerank-models"
        ${t?"disabled":""}>
        ${m("refresh",12)}<span>${t?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u6A21\u578B"}</span>
      </button>
    </div>
    ${l?`<div class="rag-model-buttons">${l}</div>`:d}
    <p class="rag-model-hint">Reranker \u7531 llama.cpp \u63D0\u4F9B\uFF1B\u4E0D\u53EF\u7528\u6642\u6703\u56DE\u9000 Qdrant \u6392\u5E8F\u3002</p>
  </div>`}function wa({tone:e,title:t,text:s,models:a,currentModel:n,currentProviderName:i,baseUrl:o,modelState:l,untestedProviders:d=[],rerank:c=null,rerankRefreshing:v=!1,busy:$,refreshing:h}){let g=e==="ok"?"is-ok":e==="warn"?"is-warn":"is-info",p=e==="ok"?"check":e==="warn"?"alert":"info",w=e==="ok"?"badge-ok":e==="warn"?"badge-warn":"badge-info",k=Array.isArray(a)?a:[],L=[...new Set(k.map(Y=>Y.providerName).filter(Boolean))],E=n&&i?`${i}:${n}`:n,T=k.map(Y=>{let ye=Y.model===n&&(!i||Y.providerName===i),Ae=Y.providerName?`${Y.providerName}:${Y.model}`:Y.model;return`<button class="rag-model-button${ye?" is-active":""}" type="button" data-rag-model="${r(Y.model)}"
        data-rag-provider="${r(Y.hostId===null||Y.hostId===void 0?"":String(Y.hostId))}"
        title="${r(Ae)}"
        aria-pressed="${ye}" ${$||h?"disabled":""}>
        <span class="rag-model-state" aria-hidden="true"></span>
        <span>${r(Ae)}</span>
        ${ye?'<span class="rag-model-current">\u4F7F\u7528\u4E2D</span>':""}
      </button>`}).join(""),H=(l?.models||[]).filter(Y=>Y.status==="untested").length,G=l?H?`\u5C1A\u6709 ${u(H)} \u500B\u6A21\u578B\u672A\u6E2C\u8A66 chat \u80FD\u529B\uFF1B\u6309\u300C\u6AA2\u67E5\u6A21\u578B\u300D\u5F8C\u5373\u53EF\u5207\u63DB\u3002`:"\u76EE\u524D provider \u6C92\u6709\u53EF\u7528\u7684 chat \u6A21\u578B\u3002":"\u7121\u6CD5\u53D6\u5F97\u6A21\u578B\u6E05\u55AE\uFF1B\u8ACB\u78BA\u8A8D Ollama \u670D\u52D9\u662F\u5426\u555F\u52D5\u3002";return`<section class="rag-mode-card ${g}">
    <div class="rag-mode-head">
      <span class="rag-mode-icon" aria-hidden="true">${m(p,14)}</span>
      <div class="rag-mode-copy">
        <strong>${r(t)}</strong>
        <p>${r(s)}</p>
      </div>
      <span class="badge ${w}">${u(k.length)} \u500B chat model${L.length?` \xB7 ${L.length} \u53F0\u4E3B\u6A5F`:""}</span>
    </div>
    <div class="rag-model-strip">
      <div class="rag-model-strip-head">
        <span class="rag-model-strip-title">${m("brain",13)} Chat models</span>
        ${o?`<span class="rag-model-strip-base mono">${r(o)}</span>`:""}
        <span class="rag-model-strip-current">${E?`\u76EE\u524D\uFF1A<strong>${r(E)}</strong>`:"\u5C1A\u672A\u9078\u64C7"}</span>
        <button class="btn btn-ghost btn-sm rag-model-refresh" type="button"
          data-rag-action="refresh-chat-models"
          ${$||h?"disabled":""}>
          ${m("refresh",12)}<span>${h?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u6A21\u578B"}</span>
        </button>
      </div>
      ${T?`<div class="rag-model-buttons">${T}</div>
             <p class="rag-model-hint">\u9EDE\u9078\u6A21\u578B\u5207\u63DB\uFF1B\u5207\u63DB\u5F8C\u5957\u7528\u4E0B\u4E00\u6B21\u63D0\u554F\uFF0C\u4E0D\u5F71\u97FF\u5DF2\u5B8C\u6210\u7684\u56DE\u7B54\u3002</p>`:`<p class="rag-model-empty">${r(G)}</p>`}
      ${d.length?`<p class="rag-model-hint rag-model-untested-hint">${r(d.join("\u3001"))} \u5C1A\u6709\u6A21\u578B\u5C1A\u672A\u6AA2\u67E5 chat \u80FD\u529B\uFF1B\u8ACB\u6309\u300C\u6AA2\u67E5\u6A21\u578B\u300D\u3002</p>`:""}
    </div>
    ${ic(c,v)}
  </section>`}function ci(e){let t=Array.isArray(e.citations)?e.citations:[],s=Array.isArray(e.judgments)?e.judgments:[],a=Array.isArray(e.law_sources)?e.law_sources:[],n=Array.isArray(e.matched_terms)?e.matched_terms:[],i=e.status||"preview",o=!!e.partial,l=!!e.streaming,d=!!e.show_sources||!o,c=e.answer_source==="structured",v=String(e.law_answer||"").trim(),$=e.law_framework||null,h=Array.isArray($?.rows)?$.rows:[],g=Array.isArray($?.sources)?$.sources:[],p=h.length>0,w=!!v&&!c&&!p,k=s.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u5224\u6C7A \xB7 ${s.length} \u7B46</span>
        <span>vector retrieval \xB7 [\u7DE8\u865F] \u5C0D\u61C9\u56DE\u7B54\u5F15\u7528</span>
      </div>
      <div class="citation-list">${s.map((z,be)=>ec(z,be)).join("")}</div>`:"",L=a.length&&!w?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4 \xB7 ${a.length} \u7B46</span>
        <span>PostgreSQL metadata \xB7 Parquet \u689D\u6587</span>
      </div>
      <div class="citation-list">${a.map((z,be)=>sc(z,be)).join("")}</div>`:"",E=!s.length&&t.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F \xB7 ${t.length} \u7B46</span>
        <span>metadata match</span>
      </div>
      <div class="citation-list">${t.map((z,be)=>tc(z,be)).join("")}</div>`:"",T=d?k+L+E:"";!T&&!o&&!w&&!p&&(T=`<div class="answer-divider"></div>
      ${ct({iconName:"file",title:"\u6C92\u6709\u53EF\u5F15\u7528\u7684\u4F86\u6E90",text:i==="retrieval_only"?"\u76EE\u524D\u5DF2\u5EFA\u7ACB\u7684\u5411\u91CF\u7D22\u5F15\u4E2D\u6C92\u6709\u8DB3\u5920\u76F8\u4F3C\u7684\u5224\u6C7A\uFF0C\u4E5F\u6C92\u6709\u53EF\u5C0D\u61C9\u7684\u6CD5\u898F\u6216\u547D\u4EE4\u3002\u7CFB\u7D71\u4E0D\u6703\u5728\u6C92\u6709\u4F86\u6E90\u6642\u751F\u6210\u7B54\u6848\u3002":"\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u4E14\u554F\u984C\u4E2D\u6C92\u6709\u53EF\u76F4\u63A5\u5C0D\u61C9\u7684\u73FE\u884C\u6CD5\u898F\u540D\u7A31\u3002"})}`);let H=rc(n,a),G=e.test_run,Y=String(e.llm_model||G?.primary_model||"").trim(),ye=String(e.embedding_model||"").trim(),Ae=[Y?`LLM\uFF1A${Y}`:"",ye?`Embedding\uFF1A${ye}`:""].filter(Boolean).join(" \xB7 "),J=l||e.answer_source==="llm"?"LLM \u7D9C\u5408\u56DE\u7B54":"\u6AA2\u7D22\u7D50\u679C\u6458\u8981",B=p?`<div class="answer-block law-framework-block">
        <div class="answer-block-head">
          <span>${r($.title||"\u76F8\u95DC\u6CD5\u898F\u7684\u8CAC\u4EFB\u67B6\u69CB")}</span>
          <span>${h.length} \u689D</span>
        </div>
        <div class="table-wrap law-framework-table-wrap">
          <table class="data-table is-compact law-framework-table">
            <thead>
              <tr><th scope="col">\u6CD5\u898F</th><th scope="col">\u689D\u6587</th><th scope="col">\u898F\u7BC4\u91CD\u9EDE</th></tr>
            </thead>
            <tbody>
              ${h.map(z=>`<tr>
                    <td>${r(z.law_name||"\u2014")}</td>
                    <td class="cell-number">${r(z.article_no||"\u2014")}</td>
                    <td>${r(z.focus||"\u2014")}</td>
                  </tr>`).join("")}
            </tbody>
          </table>
        </div>
        ${g.length?`<div class="law-framework-sources">
                <span>\u6CD5\u898F\u4F86\u6E90</span>
                ${g.map(z=>{let be=String(z?.law_name||z||"").trim(),Me=z&&z.index!==null&&z.index!==void 0?` [${r(z.index)}]`:"";return _a(be,{label:`${be}${Me}`})}).join("")}
              </div>`:""}
      </div>`:"",S=e.answer_source==="llm"&&Y?`<span class="answer-model" title="${r(Ae)}">${m("brain",11)}${r(Y)}</span>`:c?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${m("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"",C=l?`${Y||"LLM"} \xB7 \u751F\u6210\u4E2D`:S?Y||"structured":"retrieval",ne=G?`<div class="test-run-summary">
        <div class="test-run-summary-head">
          <span class="badge badge-warn">\u6E2C\u8A66\u6A21\u5F0F</span>
          ${Je(G.status)}
          <span class="mono">${r(G.run_id||"")}</span>
        </div>
        <div class="test-run-summary-body">
          <span>Embedding ${Number(G.models?.embedding?.length||0)} \u500B</span>
          <span>LLM ${Number(G.models?.llm?.length||0)} \u500B</span>
          <span>\u4E3B\u56DE\u7B54 ${r(G.primary_model||"\u2014")}</span>
          <span>${Number(G.total_ms||0)} ms</span>
          <a href="#/performance">\u67E5\u770B\u6E2C\u8A66 Flow</a>
        </div>
      </div>`:"",ge=e.pipeline_flow&&typeof e.pipeline_flow=="object"?e.pipeline_flow:null,V=!o&&ge?$a(ge,{serverDurationMs:Number(e.duration_ms)||0,embedded:!0}):"",ae=String(e.answer||"").trim()||(l?"\u6B63\u5728\u751F\u6210\u56DE\u7B54\u2026":o?"\u6B63\u5728\u6AA2\u7D22\u5224\u6C7A\u4E26\u751F\u6210 LLM \u56DE\u7B54\u2026":"\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u56DE\u7B54\u3002"),ee=l?" data-partial-answer":"",_e=l?" is-streaming":"";return`${B}
      ${w?`<div class="answer-block law-answer-block">
              <div class="answer-block-head">
                <span>\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22\u7D50\u679C</span>
                <span>${o&&!d?"\u6CD5\u898F\u8CC7\u6599\u5EAB":`${a.length} \u7B46\u4F86\u6E90`}</span>
              </div>
              <div class="law-answer-content">${nc(a,v)}</div>
            </div>`:""}
      <div class="answer-block">
        ${w||p?`<div class="answer-block-head">
                <span>${r(J)}</span>
                <span>${r(C)}</span>
              </div>`:""}
        <p class="answer-text${_e}"${ee}>${r(ae)}</p>
      </div>
      ${e.notice?`<div class="answer-notice">${r(e.notice)}</div>`:""}
      ${ne}
      ${H}
      ${T}
      ${V}`}function ii(e,t,s=""){let a=t.status||"preview",n=a==="operational"?"\u5B8C\u6210":a==="retrieval_only"?"\u50C5\u6AA2\u7D22\u7D50\u679C":a==="preview"?"\u6CD5\u898F\u9810\u89BD":a==="unavailable"||a==="not_configured"?"\u8CC7\u6599\u4E0D\u53EF\u7528":a==="degraded"?"\u964D\u7D1A":"\u5B8C\u6210",i=t.test_run,o=String(t.llm_model||i?.primary_model||"").trim(),l=String(t.embedding_model||"").trim(),d=[o?`LLM\uFF1A${o}`:"",l?`Embedding\uFF1A${l}`:""].filter(Boolean).join(" \xB7 "),c=t.answer_source==="structured",v=t.answer_source==="llm"&&o?`<span class="answer-model" title="${r(d)}">${m("brain",11)}${r(o)}</span>`:c?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${m("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"";return`<div class="answer-head">
      <div class="answer-head-left">${m("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u7D50\u679C</span>
      </div>
      <div class="answer-head-meta">
        ${Je(a,n)}
        <span>${Number(t.duration_ms||0)} ms</span>
        ${v}
      </div>
      ${s}
    </div>
    <div class="answer-body">${ci(t)}</div>`}function oc(e,t=""){return`<div class="answer-head">
      <div class="answer-head-left">${m("alert",16)}
        <span class="answer-head-title">\u7121\u6CD5\u5B8C\u6210\u6AA2\u7D22</span>
      </div>
      ${t}
    </div>
    <div class="answer-body">
      ${Ee({tone:"danger",title:"\u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
    </div>`}function lc(e){let t=Array.isArray(e.turns)?e.turns:[],s=t.length?t[t.length-1].payload||{}:e.payload||{},a=Array.isArray(s.citations)?s.citations.length:0,n=Array.isArray(s.judgments)?s.judgments.length:0,i=Array.isArray(s.law_sources)?s.law_sources.length:0;return a+n+i}function cc(e,t,s,a=null){let n=e.id??s,i=lc(e),o=t.get(String(e.project_id||"")),l=Array.isArray(e.turns)?e.turns:[],d=e.updated_at||e.created_at,c=a!=null&&String(a)===String(n);return`<div class="rag-history-item${e.pinned?" is-pinned":""}${c?" is-active":""}">
    <button class="rag-history-open" type="button" data-history-open data-history-id="${r(String(n))}">
      <span class="history-question">${r(e.title||"\u672A\u547D\u540D\u63D0\u554F")}</span>
      <span class="history-meta">
        <span>${r(js(d))}</span>
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
  </div>`}function oi(e,t,s){let a=new Map;for(let i of t){let o=String(i.project_id||"");o&&a.set(o,(a.get(o)||0)+1)}let n=[`<button class="rag-project${s?"":" is-active"}" type="button" data-rag-action="select-project" data-project-id="" aria-pressed="${s?"false":"true"}">
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
  </div>`),n.join("")}async function dc(e){let t=!1,s=[],a=!1,n=[],i=!1,o="",l=8,d="",c=0,v=null,$=[],h=!1,g=!1,p={embedding:[],llm:[]},w=null,k=null,L=null,E=!1,T=!1,H=!1;e.innerHTML=`<section class="page rag-page">
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
            ${m("sparkles",16)}<span>\u958B\u59CB\u6AA2\u7D22</span>
          </button>
        </div>
      </form>
      <div class="example-chips" id="example-chips" aria-label="\u7BC4\u4F8B\u554F\u984C">
        ${Ul.map(f=>`<button class="example-chip" type="button" data-question="${r(f)}">${r(f)}</button>`).join("")}
      </div>
    </header>

    <section class="rag-conversation" id="rag-conversation" aria-live="polite">
      <div class="rag-turns" id="rag-turns">
        ${yn()}
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
  </section>`;let G=e.querySelector("#rag-form"),Y=e.querySelector("#rag-question"),ye=e.querySelector("#rag-submit"),Ae=e.querySelector(".rag-page"),J=e.querySelector("#rag-turns"),B=e.querySelector("#rag-followup-form"),S=e.querySelector("#rag-followup-question"),C=e.querySelector("#rag-followup-submit"),ne=e.querySelector("#rag-history"),ge=e.querySelector("#rag-storage-note"),V=e.querySelector("#rag-clear-history"),Z=e.querySelector(".rag-library"),ae=e.querySelector("#rag-pinned-body"),ee=e.querySelector("#rag-projects-body"),_e=e.querySelector("#rag-pinned-count"),z=e.querySelector("#rag-projects-count"),be=e.querySelector("#rag-recent-count"),Me=e.querySelector("#rag-library-context"),pe=e.querySelector("#rag-test-mode"),tt=e.querySelector("#rag-test-flow"),Oe=e.querySelector("#rag-history-menu"),He=e.querySelector("#rag-judgment-dialog"),Le=e.querySelector("#rag-law-dialog"),Qe=()=>{document.documentElement.classList.toggle("dialog-open",!!e.querySelector("dialog[open]"))};He?.addEventListener("close",Qe),Le?.addEventListener("close",Qe);let Ye=null,ft=null,N,D=null,x=null,j=()=>{Y.style.height="auto",Y.style.height=`${Math.min(Y.scrollHeight,220)}px`},W=()=>{S.style.height="auto",S.style.height=`${Math.min(S.scrollHeight,160)}px`},F=f=>{h=!!f,Ae.classList.toggle("has-conversation",h)},Ie=()=>{h&&(B.hidden=!1,W())},Re=()=>{B.hidden=!0},Be=()=>{Oe.hidden&&!x||(Oe.hidden=!0,Oe.innerHTML="",x&&x.setAttribute("aria-expanded","false"),D=null,x=null)},kt=(f,R)=>{let O=J.querySelector(".rag-empty-answer");O&&O.remove(),J.insertAdjacentHTML("beforeend",si(f,R));let te=J.lastElementChild,fe=te?.querySelector("[data-rag-answer]");return window.requestAnimationFrame(()=>{te?.scrollIntoView({behavior:"smooth",block:"start"})}),{turnElement:te,answerElement:fe}},nt=()=>{J.innerHTML=$.length?$.map(f=>si(f.question,ii(f.question,f.payload||{},""))).join(""):yn()},St=f=>{let R=Array.isArray(f.turns)?f.turns:[];return R.length?(c+=1,Pt(),Mt(null),v=f.id??null,$=R.map(O=>({...O})),d=$[$.length-1]?.question||"",F(!0),nt(),Ie(),st(),ke(ye,!1),ke(C,!1),window.setTimeout(()=>{B.scrollIntoView({behavior:"smooth",block:"end"})},50),!0):!1},st=()=>{if(t)return;if(Be(),!a){ne.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',ae.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',_e.textContent="0",be.textContent="0",i&&(ee.innerHTML=oi(n,[],o));return}let f=n.find(Ce=>String(Ce.id)===o)||null;o&&!f&&(o="");let R=new Map(n.map(Ce=>[String(Ce.id),Ce])),O=s.filter(Ce=>!!Ce.pinned),te=s.filter(Ce=>!Ce.pinned),fe=o?te.filter(Ce=>String(Ce.project_id||"")===o):te,xe=fe.slice(0,l),Ge=(Ce,at)=>cc(Ce,R,at,v);ae.innerHTML=O.length?O.map(Ge).join(""):'<div class="rag-library-empty">\u5C1A\u7121\u91D8\u9078\u9805\u76EE\u3002\u5C07\u6700\u8FD1\u9805\u76EE\u91D8\u9078\u5F8C\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</div>',ee.innerHTML=oi(n,s,o),ne.innerHTML=xe.length?xe.map(Ge).join(""):`<div class="rag-library-empty">${o?"\u9019\u500B\u5C08\u6848\u9084\u6C92\u6709\u672A\u91D8\u9078\u7684\u9805\u76EE\u3002":O.length?"\u6700\u8FD1\u7684\u9805\u76EE\u90FD\u5DF2\u91D8\u9078\u3002":"\u5C1A\u7121\u63D0\u554F\u7D00\u9304\u3002\u9001\u51FA\u7B2C\u4E00\u500B\u554F\u984C\u5F8C\u6703\u4FDD\u5B58\u5728\u6B64\u700F\u89BD\u5668\u3002"}</div>`,fe.length>l&&ne.insertAdjacentHTML("beforeend",`<button class="rag-library-more" type="button" data-rag-action="more-recent">\u986F\u793A\u66F4\u591A \xB7 ${u(fe.length-l)} \u7B46</button>`),_e.textContent=String(O.length),z.textContent=String(n.length),be.textContent=String(fe.length),f?(Me.hidden=!1,Me.innerHTML=`<span>${m("folder",12)}<strong>${r(f.name)}</strong></span><button type="button" data-rag-action="clear-project" title="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE" aria-label="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE">${m("x",12)}</button>`):(Me.hidden=!0,Me.innerHTML="")},Rt=async()=>{try{let f=await ns("rag.projects",[]);n=Array.isArray(f)?f.map(R=>({id:String(R?.id||""),name:String(R?.name||"").trim()})).filter(R=>R.id&&R.name):[]}catch{n=[]}i=!0,t||st()},rt=f=>{o=String(f||""),l=8,st()},Xe=()=>{let f=ee.querySelector('[data-rag-form="project"]');f&&(f.hidden=!1,f.querySelector("input")?.focus())},Jt=()=>{let f=ee.querySelector('[data-rag-form="project"]');f&&(f.hidden=!0,f.reset())},X=async f=>{let R=f.elements.project_name,O=String(R?.value||"").trim();if(!O){M("\u8ACB\u8F38\u5165\u5C08\u6848\u540D\u7A31\u3002","warn"),R?.focus();return}if(n.some(fe=>fe.name.toLowerCase()===O.toLowerCase())){M("\u5DF2\u6709\u540C\u540D\u5C08\u6848\u3002","warn"),R?.focus();return}let te=typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():`project-${Date.now()}-${Math.random().toString(16).slice(2)}`;n=[...n,{id:te,name:O.slice(0,60),created_at:new Date().toISOString()}],o=te,l=8,await Bs("rag.projects",n),st(),M(`\u5DF2\u5EFA\u7ACB\u5C08\u6848\u300C${O}\u300D\u3002`,"ok")},$e=async f=>{let R=s.find(fe=>String(fe.id)===String(f));if(!R)return;let O=!R.pinned;if(!await Is(R.id,{pinned:O})){M("\u7121\u6CD5\u66F4\u65B0\u91D8\u9078\u72C0\u614B\u3002","danger");return}R.pinned=O,st(),M(O?"\u5DF2\u91D8\u9078\u9805\u76EE\u3002":"\u5DF2\u53D6\u6D88\u91D8\u9078\u3002","ok")},ze=()=>{c+=1,Pt(),Mt(null),d="",v=null,$=[],F(!1),Re(),J.innerHTML=yn(),Y.value="",j(),S.value="",W(),ke(ye,!1),ke(C,!1),st(),He?.open&&He.close(),Le?.open&&Le.close(),Y.focus(),window.scrollTo({top:0,behavior:"smooth"})},Ve=f=>{if(!f||Oe.hidden)return;let R=f.getBoundingClientRect(),O=Oe.getBoundingClientRect(),te=6,fe=R.bottom+te;fe+O.height>window.innerHeight-8&&(fe=Math.max(8,R.top-O.height-te));let xe=R.right-O.width;xe=Math.max(8,Math.min(xe,window.innerWidth-O.width-8)),Oe.style.left=`${Math.round(xe)}px`,Oe.style.top=`${Math.round(fe)}px`},Nt=f=>{Oe.innerHTML=`
      <button type="button" role="menuitem" data-menu-action="rename">${m("edit",13)}<span>\u91CD\u65B0\u547D\u540D</span></button>
      <button type="button" role="menuitem" data-menu-action="toggle-pin">${m("pin",13)}<span>${f.pinned?"\u53D6\u6D88\u91D8\u9078":"\u91D8\u9078"}</span></button>
      <button type="button" role="menuitem" data-menu-action="share">${m("link",13)}<span>\u5206\u4EAB</span></button>
      <button type="button" role="menuitem" data-menu-action="move">${m("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></button>
      <div class="rag-history-menu-divider"></div>
      <button class="is-danger" type="button" role="menuitem" data-menu-action="delete">${m("trash",13)}<span>\u522A\u9664</span></button>`},At=f=>{let R=String(f.project_id||""),O=[{id:"",name:"\u672A\u5206\u985E"},...n.map(te=>({id:String(te.id),name:te.name}))];Oe.innerHTML=`
      <div class="rag-history-menu-head">${m("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></div>
      ${O.map(te=>`<button type="button" role="menuitem"
            data-menu-action="assign-project" data-project-id="${r(te.id)}">
            <span class="rag-history-menu-check">${R===te.id?m("check",12):""}</span>
            <span>${r(te.name)}</span>
          </button>`).join("")}
      ${n.length?"":'<div class="rag-history-menu-note">\u5C1A\u672A\u5EFA\u7ACB\u5C08\u6848\uFF0C\u53EF\u5148\u5F9E\u5DE6\u5074\u5EFA\u7ACB\u3002</div>'}
      <div class="rag-history-menu-divider"></div>
      <button type="button" role="menuitem" data-menu-action="back">${m("chevronLeft",13)}<span>\u8FD4\u56DE</span></button>`},Vt=(f,R)=>{let O=s.find(te=>String(te.id)===String(R));O&&(Be(),D=String(O.id),x=f,Nt(O),Oe.hidden=!1,f.setAttribute("aria-expanded","true"),Ve(f))},_=async f=>{let R=window.prompt("\u91CD\u65B0\u547D\u540D\u5C0D\u8A71",f.title||"");if(R===null)return;let O=R.trim();if(!O){M("\u540D\u7A31\u4E0D\u80FD\u7A7A\u767D\u3002","warn");return}if(O===f.title)return;if(!await Is(f.id,{title:O})){M("\u91CD\u65B0\u547D\u540D\u5931\u6557\u3002","danger");return}f.title=O,st(),M("\u5C0D\u8A71\u5DF2\u91CD\u65B0\u547D\u540D\u3002","ok")},q=async f=>{let R=Array.isArray(f.turns)?f.turns:[],O=[`# ${f.title||"\u672A\u547D\u540D\u5C0D\u8A71"}`,""];if(R.length)for(let fe of R){O.push("## \u554F\u984C","",fe.question||"",""),O.push("## \u56DE\u7B54","",fe.payload?.answer||"\uFF08\u6C92\u6709\u56DE\u7B54\u5167\u5BB9\uFF09","");let xe=Array.isArray(fe.payload?.law_sources)?fe.payload.law_sources.map(Ge=>Ge.law_name).filter(Boolean):[];xe.length&&O.push(`\u5F15\u7528\uFF1A${[...new Set(xe)].join("\u3001")}`,"")}else O.push(f.title||"");let te=await fs(O.join(`
`));M(te?"\u5C0D\u8A71\u5167\u5BB9\u5DF2\u8907\u88FD\uFF0C\u53EF\u76F4\u63A5\u8CBC\u4E0A\u5206\u4EAB\u3002":"\u7121\u6CD5\u8907\u88FD\u5C0D\u8A71\u5167\u5BB9\u3002",te?"ok":"warn")},A=async f=>{if(!window.confirm(`\u522A\u9664\u5C0D\u8A71\u300C${f.title||"\u672A\u547D\u540D\u5C0D\u8A71"}\u300D\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002`))return;if(!await ur(f.id)){M("\u522A\u9664\u5931\u6557\u3002","danger");return}let O=v!==null&&String(v)===String(f.id);s=s.filter(te=>String(te.id)!==String(f.id)),O?ze():st(),M("\u5C0D\u8A71\u5DF2\u522A\u9664\u3002","ok")},I=async(f,R)=>{if(!await Is(f.id,{project_id:R})){M("\u79FB\u81F3\u5C08\u6848\u5931\u6557\u3002","danger");return}f.project_id=R;let te=n.find(fe=>String(fe.id)===String(R));st(),M(te?`\u5DF2\u79FB\u81F3\u5C08\u6848\u300C${te.name}\u300D\u3002`:"\u5DF2\u79FB\u51FA\u5C08\u6848\u3002","ok")},Q=async f=>{let R=f.target.closest("[data-menu-action]");if(!R)return;let O=s.find(fe=>String(fe.id)===D);if(!O){Be();return}let te=R.dataset.menuAction;te==="rename"?(Be(),await _(O)):te==="toggle-pin"?(Be(),await $e(O.id)):te==="share"?(Be(),await q(O)):te==="move"?(At(O),Ve(x)):te==="assign-project"?(Be(),await I(O,R.dataset.projectId||"")):te==="back"?(Nt(O),Ve(x)):te==="delete"&&(Be(),await A(O))},K=f=>{Oe.hidden||(typeof f.composedPath=="function"?f.composedPath():[]).includes(Oe)||Oe.contains(f.target)||f.target.closest('[data-rag-action="open-history-menu"]')||Be()},ce=f=>{f.key==="Escape"&&Be()},Se=f=>{f.target instanceof Node&&Oe.contains(f.target)||Be()},je=async()=>{try{if(s=await ia({limit:120}),t)return;a=!0,st(),ge.textContent=ra()==="indexeddb"?"\u63D0\u554F\u7D00\u9304\u5132\u5B58\u5728\u700F\u89BD\u5668 IndexedDB\uFF0C\u4E0D\u6703\u4E0A\u50B3\u5230\u4F3A\u670D\u5668\u3002":"\u700F\u89BD\u5668\u5132\u5B58\u4E0D\u53EF\u7528\uFF0C\u63D0\u554F\u7D00\u9304\u53EA\u4FDD\u7559\u5728\u672C\u6B21\u5DE5\u4F5C\u968E\u6BB5\u3002"}catch{if(t)return;s=[],a=!0,st(),ne.innerHTML='<div class="rag-library-empty">\u7121\u6CD5\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u3002</div>'}},ve=async(f,R,O,te)=>{let fe=$,xe=v;fe.push({question:f,asked_at:new Date().toISOString(),payload:Vl(R)});let Ge=Array.isArray(R.citations)?R.citations:[],Ce=Array.isArray(R.judgments)?R.judgments:[],at={question:f,status:R.status,citations:Ge.map(Pe=>Pe.law_name),judgments:Ce.map(Pe=>Pe.jid)},lt=`${R.status||"preview"} \xB7 ${fe.length} \u8F2A`,De=new Date().toISOString(),bt=Pe=>{te===c&&(v=Pe)};if(xe){if(!await Is(xe,{turns:fe,detail:lt,payload:at,updated_at:De})){let ht=await Ps({kind:"rag",title:fe[0]?.question||f,detail:lt,project_id:O,turns:fe,payload:at,updated_at:De});bt(ht)}}else{let Pe=await Ps({kind:"rag",title:fe[0]?.question||f,detail:lt,project_id:O,turns:fe,payload:at,updated_at:De});bt(Pe)}await je()},Fe=()=>(w?.services||[]).find(f=>f.id==="llm")||null,We=()=>{let f=e.querySelector("#rag-mode-notice");if(!f)return;let R=Array.isArray(k?.providers)?k.providers:[],O=[];for(let Pe of R)if(!(!Pe||!Array.isArray(Pe.chat_models)))for(let ht of Pe.chat_models)O.push({model:ht,providerName:String(Pe.name||"").trim(),hostId:Pe.host_id===null||Pe.host_id===void 0?null:Number(Pe.host_id)});if(!O.length&&Array.isArray(k?.chat_models)){let Pe=String(k?.provider_name||"").trim(),ht=k?.provider?.host_id;for(let Ue of k.chat_models)O.push({model:Ue,providerName:Pe,hostId:ht==null?null:Number(ht)})}let te=R.filter(Pe=>Array.isArray(Pe?.models)&&Pe.models.length>0&&(!Array.isArray(Pe.chat_models)||Pe.chat_models.length===0)).map(Pe=>String(Pe.name||"").trim()).filter(Boolean),fe=String(Fe()?.model||"").trim(),xe=String(k?.base_url||"").trim(),Ge=String(k?.provider_name||"").trim(),Ce=w&&(w.services||[]).find(Pe=>Pe.id==="reranker")||null;if(!w){if(!L)return;f.innerHTML=wa({tone:"warn",title:"\u7121\u6CD5\u53D6\u5F97 RAG \u670D\u52D9\u72C0\u614B",text:L.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\uFF0C\u6216\u524D\u5F80\u7CFB\u7D71\u72C0\u614B\u9801\u67E5\u770B\u3002",models:O,currentModel:fe,currentProviderName:Ge,baseUrl:xe,modelState:k,untestedProviders:te,rerank:Ce,rerankRefreshing:H,busy:E,refreshing:T});return}let at=w.data||{},lt=(w.services||[]).find(Pe=>Pe.id==="rag"),De=Number(at.judgment_indexed_count||0),bt=Number(at.judgment_count||0);lt?.status==="operational"?f.innerHTML=wa({tone:"ok",title:"\u6AA2\u7D22\u8207\u56DE\u7B54\u5C31\u7DD2",text:`Qdrant\u3001Embedding \u8207 LLM \u5747\u53EF\u4F7F\u7528\uFF1B\u76EE\u524D\u7D22\u5F15\u6DB5\u84CB ${u(De)} / ${u(bt)} \u7B46\u5224\u6C7A\u3002\u56DE\u7B54\u4E0D\u662F\u6CD5\u5F8B\u610F\u898B\u3002`,models:O,currentModel:fe,currentProviderName:Ge,baseUrl:xe,modelState:k,untestedProviders:te,rerank:Ce,rerankRefreshing:H,busy:E,refreshing:T}):lt?.status==="degraded"?f.innerHTML=wa({tone:"warn",title:"\u90E8\u5206 AI \u5143\u4EF6\u672A\u5C31\u7DD2",text:lt.detail||"RAG \u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u6AA2\u7D22\u7D50\u679C\u3002",models:O,currentModel:fe,currentProviderName:Ge,baseUrl:xe,modelState:k,untestedProviders:te,rerank:Ce,rerankRefreshing:H,busy:E,refreshing:T}):f.innerHTML=wa({tone:"info",title:"\u5411\u91CF\u7D22\u5F15\u5C1A\u672A\u5C31\u7DD2 \xB7 \u4E0D\u662F\u6CD5\u5F8B\u610F\u898B",text:lt?.detail||"\u8A2D\u5B9A QDRANT_URL\u3001EMBEDDING_URL \u8207 LLM_URL \u4E26\u57F7\u884C judgment-index-vectors \u5F8C\u5373\u53EF\u555F\u7528\u5224\u6C7A\u6AA2\u7D22\u3002",models:O,currentModel:fe,currentProviderName:Ge,baseUrl:xe,modelState:k,untestedProviders:te,rerank:Ce,rerankRefreshing:H,busy:E,refreshing:T})},et=async()=>{let[f,R]=await Promise.allSettled([U.status(),U.llmModels()]);t||(w=f.status==="fulfilled"?f.value:null,k=R.status==="fulfilled"?R.value:null,L=f.status==="rejected"?f.reason:null,We())},qs=async(f,R=null)=>{if(!f||E||T)return;let O=String(Fe()?.model||"").trim(),te=String(k?.provider_name||"").trim(),fe=(k?.providers||[]).find(Ce=>R!==null&&Ce?.host_id!==null&&Ce?.host_id!==void 0&&Number(Ce.host_id)===Number(R)),xe=String(fe?.name||(R===null?te:"")).trim();if(f===O&&(!R||!xe||xe===te))return;let Ge=xe?`${xe}:${f}`:f;E=!0,We();try{await U.selectLlmModel(f,R),M(`\u5DF2\u5207\u63DB chat model\uFF1A${Ge}`,"ok",3500)}catch(Ce){M(Ce.message||"\u7121\u6CD5\u5207\u63DB chat model\u3002","danger",6e3)}finally{E=!1,t||await et()}},Ct=async()=>{if(!(T||E)){T=!0,We();try{await U.testLlmModels(),M("\u5DF2\u66F4\u65B0 chat model \u6E05\u55AE\u3002","ok",3500)}catch(f){M(f.message||"\u7121\u6CD5\u6AA2\u67E5 chat model\u3002","danger",6e3)}finally{T=!1,t||await et()}}},Na=async()=>{if(!H){H=!0,We();try{let f=await U.status();if(t)return;w=f,L=null,M("\u5DF2\u66F4\u65B0 rerank model \u72C0\u614B\u3002","ok",3e3)}catch(f){M(f.message||"\u7121\u6CD5\u6AA2\u67E5 rerank model\u3002","danger",6e3)}finally{H=!1,t||We()}}},As=()=>{if(!pe)return;if(!g){pe.innerHTML="";return}let f=Array.isArray(p.embedding)?p.embedding.length:0,R=Array.isArray(p.llm)?p.llm.length:0;pe.innerHTML=Ee({tone:"warn",title:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F",text:`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${f} \u500B embedding \u8207 ${R} \u500B LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002\u6E2C\u8A66 Flow \u6703\u5728\u9801\u9762\u4E0B\u65B9\u5373\u6642\u986F\u793A\uFF0C\u4E5F\u53EF\u5230 <a href="#/tests">\u7CFB\u7D71\u6E2C\u8A66</a> \u6216 <a href="#/performance">\u6548\u80FD\u5831\u8868</a> \u67E5\u770B\u6B77\u53F2\u3002`})},Ea=async()=>{try{let f=await U.testMode();if(t)return;g=!!f.enabled,p=f.models||{embedding:[],llm:[]},As()}catch{if(t)return;g=!1,As()}},Js=f=>{g=!!f.detail?.enabled,p=f.detail?.models||{embedding:[],llm:[]},As()};window.addEventListener("judgment:test-mode",Js);let Mt=f=>{if(!tt)return;ft=f||null;let R=JSON.stringify(f?{run_id:f.run_id,status:f.status,progress:f.progress,total_ms:f.total_ms,stage:f.stage,answer:f.answer||"",steps:(f.steps||[]).map(O=>`${O.stage}:${O.model}:${O.status}:${O.progress}:${O.duration_ms}`)}:null);R!==N&&(N=R,tt.innerHTML=f?ks(f,[],"",{showHistory:!1}):"")},Pt=()=>{Ye&&(Ye(),Ye=null)},Ms=async(f=null)=>{if(!t)try{let R=f||await U.testRunCurrent();if(t)return;let O=R.run;O&&O.status==="running"&&Mt(O)}catch{}},Ls=()=>{t||Ye||(Ms(),Ye=wt("test-runs",(f,R)=>Ms(R?.snapshot||null)))},Vs=async f=>{if(!f){Mt(null);return}try{let R=await U.testRun(f);if(t)return;Mt(R.run||null)}catch{t||M("\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF0C\u4F46\u7121\u6CD5\u8F09\u5165\u6E2C\u8A66 Flow\u3002","warn")}},b=async()=>{if(g)try{let f=await U.testRunCurrent();if(t)return;f.run?.status==="running"&&(Mt(f.run),Ls())}catch{}},y=0,P=(f,R)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">DB ORIGINAL JUDGMENT</div>
      <h2>${r(f)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-parquet-judgment" aria-label="\u95DC\u9589">${m("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${R}</div>`,de=f=>{let R=(Array.isArray(f.citations)?f.citations:[]).map(Ge=>li(Ge)).filter(Boolean).join(""),O=R||(Array.isArray(f.matched_laws)?f.matched_laws:[]).map(Ge=>_a(Ge)).join(""),te=[f.court,f.jdate,f.title?`\u6848\u7531\uFF1A${f.title}`:"",f.full_text_length?`${u(f.full_text_length)} \u5B57`:"",f.citation_count?`\u5F15\u7528 ${u(f.citation_count)} \u7B46`:""].filter(Boolean).map(Ge=>`<span>${r(Ge)}</span>`).join(""),fe=f.parquet_generated_at?`DB \u5132\u5B58\u539F\u6587\uFF08\u539F\u59CB Parquet\uFF09\xB7 ${r(String(f.parquet_generated_at).replace("T"," ").slice(0,19))}`:"DB \u5132\u5B58\u539F\u6587",xe=f.pdf_url?`<a class="btn btn-secondary btn-sm" href="${r(f.pdf_url)}" target="_blank" rel="noopener noreferrer">${m("external",13)}<span>\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF</span></a>`:"";return P(f.jid||"\u5224\u6C7A\u5168\u6587",`<div class="judgment-dialog-meta">
        <span class="badge badge-info">${r(f.source==="parquet"?"DB \u5132\u5B58\u539F\u6587":"PostgreSQL")}</span>
        ${te}
      </div>
      ${R?'<div class="citation-meta" style="margin-top:8px"><span>\u5224\u6C7A\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4</span></div>':""}
      ${O?`<div class="chips" style="margin:8px 0 10px">${O}</div>`:""}
      <div class="judgment-dialog-source">${fe}</div>
      <pre class="judgment-dialog-text">${r(f.full_text||"\u6B64\u5224\u6C7A\u6C92\u6709\u5168\u6587\u3002")}</pre>
      <div class="judgment-dialog-actions">
        ${xe}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-parquet-judgment">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},le=async f=>{if(!He||!f)return;let R=++y;He.open||He.showModal(),Qe(),He.innerHTML=P("\u8B80\u53D6\u5224\u6C7A\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E DB \u5132\u5B58\u539F\u6587\u8B80\u53D6 ${r(f)}\u2026</span>
      </div>`);try{let O=await U.judgmentDetail(f,"parquet");if(t||R!==y)return;He.innerHTML=de(O)}catch(O){if(t||R!==y)return;He.innerHTML=P("\u7121\u6CD5\u8B80\u53D6 DB \u539F\u6587\u5224\u6C7A",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${r(O.message||"\u627E\u4E0D\u5230\u5224\u6C7A\u5168\u6587\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u5DF2\u57F7\u884C <span class="mono">uv run judgment-import-judgments --raw-only</span>\uFF0C\u4E14\u539F\u59CB Parquet \u5B58\u5728\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-parquet-judgment">\u95DC\u9589</button>
        </div>`)}},se=0,re=(f,R)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">LOCAL PARQUET LAW</div>
      <h2>${r(f)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-law-source" aria-label="\u95DC\u9589">${m("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${R}</div>`,ue=(f,R="")=>{let O=String(f.selected_article_no||R||"").trim(),te=!!O,fe=Array.isArray(f.articles)?f.articles:[],xe=fe.map(Et=>{let Ra=String(Et.article_content||"").trim();return Ra?Et.article_type==="C"?`<div class="law-chapter">${r(Ra)}</div>`:`<article class="law-article" data-article-no="${r(ri(Et.article_no))}">
          <div class="law-article-head">
            <span class="law-article-no">${r(Et.article_no||"\u689D\u6587")}</span>
          </div>
          <div class="law-article-text">${r(Ra)}</div>
        </article>`:""}).join(""),Ge=(Array.isArray(f.warnings)?f.warnings:[]).map(Et=>r(Et)).join("<br />"),Ce=f.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F",at=f.meta?.articles_source,lt=at==="parquet"?"Parquet \u689D\u6587":at==="postgresql"?"PostgreSQL \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",De=f.meta?.snapshot||"",bt=[f.law_level,f.law_category,f.article_count?`${u(f.article_count)} \u689D`:"",f.law_modified_date?`\u7570\u52D5 ${It(f.law_modified_date)}`:""].filter(Boolean).map(Et=>`<span>${r(Et)}</span>`).join(""),Pe=f.law_url?`<a class="btn btn-secondary btn-sm" href="${r(f.law_url)}" target="_blank" rel="noopener noreferrer">${m("external",13)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:"",ht=!te&&f.law_histories?`<details class="law-dialog-history">
          <summary>\u6CD5\u898F\u6CBF\u9769</summary>
          <div>${r(f.law_histories)}</div>
        </details>`:"",Ue=te?`<span class="badge badge-mono">${r(O)}</span>`:"",$t=!te&&fe.length>1?`<div class="law-dialog-jump">
          <div class="law-article-jump">
            <input class="input law-article-jump-input law-jump-input"
              id="rag-law-article-jump" type="text" inputmode="numeric"
              autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
            <button class="btn btn-secondary btn-sm" type="button"
              data-action="jump-law-article"
              data-jump-input="rag-law-article-jump">\u8DF3\u81F3\u689D\u6587</button>
          </div>
        </div>`:"",xt=te?`${f.law_name||f.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4"} \xB7 ${O}`:f.law_name||f.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4";return re(xt,`<div class="judgment-dialog-meta">
        <span class="badge ${f.source_type==="order"?"badge-warn":"badge-info"}">${r(Ce)}</span>
        ${Ue}
        ${bt}
      </div>
      <div class="judgment-dialog-source">${r([lt,De].filter(Boolean).join(" \xB7 "))}</div>
      ${Ge?`<div class="law-dialog-warning">${Ge}</div>`:""}
      ${ht}
      ${$t}
      <div class="law-dialog-articles">${xe||`<div class="report-empty-inline">${te?"\u9019\u689D\u689D\u6587\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u5167\u5BB9\u3002":"\u9019\u500B\u6CD5\u898F\uFF0F\u547D\u4EE4\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u3002"}</div>`}</div>
      <div class="judgment-dialog-actions">
        ${Pe}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-law-source">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},oe=(f,R)=>{let O=f?.querySelector(`#${R}`),te=ri(O?.value||"");if(!te){M("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),O?.focus();return}let fe=[...f?.querySelectorAll("[data-article-no]")||[]].find(xe=>xe.dataset.articleNo===te);if(!fe){M(`\u627E\u4E0D\u5230\u7B2C ${te} \u689D\u3002`,"warn");return}fe.scrollIntoView({behavior:"instant",block:"center"}),fe.classList.add("is-jump-target"),window.setTimeout(()=>fe.classList.remove("is-jump-target"),2400)},he=async(f,R="",O="")=>{if(!Le||!f)return;let te=++se;Le.open||Le.showModal(),Qe(),Le.innerHTML=re(O?"\u8B80\u53D6\u6CD5\u898F\u689D\u6587\u4E2D\u2026":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E\u672C\u5730 Parquet \u8B80\u53D6 ${r([f,O].filter(Boolean).join(" \xB7 "))} \u7684\u539F\u59CB\u689D\u6587\u2026</span>
      </div>`);try{let fe=await U.lawDetail(f,R,"",O);if(t||te!==se)return;Le.innerHTML=ue(fe,O)}catch(fe){if(t||te!==se)return;Le.innerHTML=re("\u7121\u6CD5\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u6587",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${r(fe.message||"\u627E\u4E0D\u5230\u689D\u6587\u5167\u5BB9\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u672C\u5730\u539F\u59CB\u6CD5\u898F Parquet \u5B58\u5728\uFF0C\u4E14 PostgreSQL metadata \u8207\u5176\u4E00\u81F4\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-law-source">\u95DC\u9589</button>
        </div>`)}};Le?.addEventListener("click",f=>{let R=f.target.closest('[data-action="jump-law-article"]');if(R){oe(Le,R.dataset.jumpInput||"rag-law-article-jump");return}if(f.target.closest('[data-action="close-law-source"]')){Le.close();return}let O=Le.getBoundingClientRect();(f.clientX<O.left||f.clientX>O.right||f.clientY<O.top||f.clientY>O.bottom)&&Le.close()}),Le?.addEventListener("keydown",f=>{!f.target.matches(".law-jump-input")||f.key!=="Enter"||(f.preventDefault(),oe(Le,f.target.id))}),He?.addEventListener("click",f=>{let R=f.target.closest('[data-action="open-law-source"]');if(R){he(R.dataset.lawKey||"",R.dataset.sourceType||"",R.dataset.articleNo||"");return}if(f.target.closest('[data-action="close-parquet-judgment"]')){He.close();return}let O=He.getBoundingClientRect();(f.clientX<O.left||f.clientX>O.right||f.clientY<O.top||f.clientY>O.bottom)&&He.close()}),J.addEventListener("click",f=>{let R=f.target.closest(".rag-process-toggle");if(R){let te=R.closest(".rag-process"),fe=R.getAttribute("aria-expanded")==="true";wn(te,!fe);return}let O=f.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(O){if(O.dataset.action==="open-law-source"){he(O.dataset.lawKey||"",O.dataset.sourceType||"",O.dataset.articleNo||"");return}le(O.dataset.jid||"")}}),J.addEventListener("keydown",f=>{if(f.key!=="Enter"&&f.key!==" ")return;let R=f.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(!(!R||R.closest("a, button"))){if(f.preventDefault(),R.dataset.action==="open-law-source"){he(R.dataset.lawKey||"",R.dataset.sourceType||"",R.dataset.articleNo||"");return}le(R.dataset.jid||"")}});let Te=async(f,{fresh:R=!1,source:O="hero"}={})=>{let te=f.trim();if(!te){M("\u8ACB\u5148\u8F38\u5165\u554F\u984C\u3002","warn"),(O==="followup"?S:Y).focus();return}(R||!h)&&(v=null,$=[],J.innerHTML="",st());let fe=++c,xe=()=>t||fe!==c,Ge=o;d=te,F(!0),Re(),O==="followup"?(S.value="",W()):(Y.value="",j());let{answerElement:Ce}=kt(te,Zl(te,g)),at=g?null:Xl(Ce);g?(Mt(null),Ls()):(Pt(),Mt(null)),ke(ye,!0,"\u6AA2\u7D22\u4E2D\u2026"),ke(C,!0,"\u6AA2\u7D22\u4E2D\u2026");let lt=null,De="",bt=Ue=>{if(xe()||!Ue?.partial)return;let $t=Ce.querySelector(".answer-body");if(!$t)return;lt=Ue,De=String(Ue.answer||""),$t.innerHTML=ci(Ue),at?.collapse?.();let xt=Ce.querySelector(".answer-head-title");xt&&(xt.textContent=Ue.streaming?"LLM \u56DE\u7B54\u751F\u6210\u4E2D":"\u6CD5\u898F\u7D50\u679C\u5DF2\u986F\u793A")},Pe=Ue=>{if(xe()||!Ue||!lt?.streaming)return;De+=Ue;let $t=Ce.querySelector("[data-partial-answer]");$t&&($t.textContent=De)},ht=()=>{if(xe()||!lt?.streaming)return;De="";let Ue=Ce.querySelector("[data-partial-answer]");Ue&&(Ue.textContent="\u6B63\u5728\u91CD\u65B0\u751F\u6210\u56DE\u7B54\u2026")};try{let Ue=g?await U.rag(te,{testMode:g}):await U.ragStream(te,{onStep:xt=>{xe()||at?.step(xt)},onPartial:bt,onToken:Pe,onTokenReset:ht});if(xe())return;Pt();let $t=at?.finish(!0)||"";if(Ce.innerHTML=ii(te,Ue,$t),Ue.pipeline_flow||Jl(Ue).then(()=>{if(xe()||!Ue.pipeline_flow)return;let xt=Ce.querySelector(".answer-body");if(!xt||xt.querySelector(".rag-wf-card"))return;let Et=$a(Ue.pipeline_flow,{serverDurationMs:Number(Ue.duration_ms)||0,embedded:!0});Et&&xt.insertAdjacentHTML("beforeend",Et)}),Ue.test_run?.run_id?await Vs(Ue.test_run.run_id):Mt(null),await ve(te,Ue,Ge,fe),xe())return;Ie()}catch(Ue){if(xe())return;Pt();let $t=at?.finish(!1)||"";Ce.innerHTML=oc(Ue,$t),Ie(),M(Ue.message||"\u6AA2\u7D22\u5931\u6557\u3002","danger")}finally{xe()||(Pt(),ke(ye,!1),ke(C,!1))}};G.addEventListener("submit",f=>{f.preventDefault(),Te(Y.value,{fresh:!0,source:"hero"})}),B.addEventListener("submit",f=>{f.preventDefault(),Te(S.value,{fresh:!1,source:"followup"})}),Y.addEventListener("input",j),Y.addEventListener("keydown",f=>{f.key==="Enter"&&!f.shiftKey&&!f.isComposing&&(f.preventDefault(),G.requestSubmit())}),S.addEventListener("input",W),S.addEventListener("keydown",f=>{f.key==="Enter"&&!f.shiftKey&&!f.isComposing&&(f.preventDefault(),B.requestSubmit())}),e.querySelector("#example-chips").addEventListener("click",f=>{let R=f.target.closest("[data-question]");R&&(Y.value=R.dataset.question,j(),G.requestSubmit())}),e.addEventListener("click",async f=>{let R=f.target.closest("[data-rag-model]");if(R){let O=R.dataset.ragProvider?Number(R.dataset.ragProvider):null;await qs(R.dataset.ragModel||"",Number.isFinite(O)?O:null);return}if(f.target.closest('[data-rag-action="refresh-rerank-models"]')){await Na();return}f.target.closest('[data-rag-action="refresh-chat-models"]')&&await Ct()}),Z.addEventListener("click",async f=>{let R=f.target.closest("[data-rag-toggle]");if(R){let Ce=R.closest(".rag-library-section").classList.toggle("is-collapsed");R.setAttribute("aria-expanded",String(!Ce));return}let O=f.target.closest("[data-rag-action]"),te=O?.dataset.ragAction||"";if(te==="new-chat"){ze();return}if(te==="open-history-menu"){Vt(O,O.dataset.historyId);return}if(te==="toggle-pin"){await $e(O.dataset.historyId);return}if(te==="select-project"){rt(O.dataset.projectId||"");return}if(te==="show-project-form"){Xe();return}if(te==="cancel-project"){Jt();return}if(te==="more-recent"){l+=12,st();return}if(te==="clear-project"){rt("");return}let fe=f.target.closest("[data-history-open]");if(!fe)return;let xe=s.find(Ge=>String(Ge.id)===String(fe.dataset.historyId));xe&&(o=String(xe.project_id||""),st(),!St(xe)&&(v=null,$=[],Te(xe.title,{fresh:!0,source:"history"})))}),Z.addEventListener("submit",async f=>{let R=f.target.closest('[data-rag-form="project"]');R&&(f.preventDefault(),await X(R))}),Oe.addEventListener("click",Q),document.addEventListener("click",K),document.addEventListener("keydown",ce),window.addEventListener("scroll",Se,{capture:!0,passive:!0}),window.addEventListener("resize",Be),V.addEventListener("click",async()=>{if(!s.length){M("\u76EE\u524D\u6C92\u6709\u53EF\u6E05\u9664\u7684\u63D0\u554F\u7D00\u9304\u3002","info");return}window.confirm("\u78BA\u5B9A\u6E05\u9664\u9019\u500B\u700F\u89BD\u5668\u7684\u6240\u6709\u63D0\u554F\u7D00\u9304\uFF1F")&&(await pr(),await je(),M("\u5DF2\u6E05\u9664\u672C\u6A5F\u63D0\u554F\u7D00\u9304\u3002","ok"))}),j(),await Promise.allSettled([et(),je(),Rt(),Ea()]),await b();let we="";try{we=window.sessionStorage.getItem("judgment.pending_question")||"",window.sessionStorage.removeItem("judgment.pending_question")}catch{we=""}return!we&&typeof window.__judgmentPendingQuestion=="string"&&(we=window.__judgmentPendingQuestion),delete window.__judgmentPendingQuestion,we=String(we||"").trim().slice(0,500),we&&Y&&(Y.value=we,j(),window.setTimeout(()=>{t||Te(we,{fresh:!0,source:"home"})},40)),()=>{t=!0,Pt(),Be(),document.removeEventListener("click",K),document.removeEventListener("keydown",ce),window.removeEventListener("scroll",Se,{capture:!0}),window.removeEventListener("resize",Be),document.documentElement.classList.remove("dialog-open"),window.removeEventListener("judgment:test-mode",Js),d&&J.setAttribute("data-last-question",d)}}var jn={};Wt(jn,{render:()=>ld});var Sn=new Set(["legal_index_versions","judgment_import","index_versions"]),di=new Map,uc={running:{label:"\u57F7\u884C\u4E2D",tone:"info"},success:{label:"\u5B8C\u6210",tone:"ok"},partial:{label:"\u90E8\u5206\u5B8C\u6210",tone:"warn"},update:{label:"\u66F4\u65B0",tone:"warn"},failed:{label:"\u5931\u6557",tone:"danger"},interrupted:{label:"\u5DF2\u4E2D\u6B62",tone:"warn"},stale:{label:"\u72C0\u614B\u5931\u6548",tone:"warn"},skipped:{label:"\u7565\u904E",tone:"idle"},pending:{label:"\u7B49\u5F85",tone:"idle"},idle:{label:"\u5F85\u547D",tone:"idle"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},operational:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},unavailable:{label:"\u7121\u6CD5\u53D6\u5F97",tone:"danger"},missing:{label:"\u5C1A\u7121\u7D00\u9304",tone:"idle"},error:{label:"\u8B80\u53D6\u5931\u6557",tone:"danger"},ok:{label:"\u6B63\u5E38",tone:"ok"},provided:{label:"\u5916\u90E8\u63D0\u4F9B",tone:"info"}},pc=["download","parquet","postgres","qdrant"],mc={download:"\u4E0B\u8F09",parquet:"Parquet",postgres:"PostgreSQL",qdrant:"Qdrant"},Sa={complete:"\u5B8C\u6210",incomplete:"\u672A\u5B8C\u6210",processing:"\u8655\u7406\u4E2D",empty:"\u7121\u8CC7\u6599",not_applicable:"\u5DF2\u53D6\u4EE3"},vi={complete:"is-green",incomplete:"is-red",processing:"is-gray",empty:"is-empty",not_applicable:"is-empty"};var jt=new Map,Tt="",ps="",ui={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},pi={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},gc={judgment:"\u5224\u6C7A",law:"\u6CD5\u898F",order:"\u547D\u4EE4",system:"\u7CFB\u7D71"};var mi={law_download:"law",order_download:"order",judgment_download:"judgment"},gi={law_download:"\u6CD5\u898F\u4E0B\u8F09",order_download:"\u547D\u4EE4\u4E0B\u8F09",judgment_download:"\u5224\u6C7A\u4E0B\u8F09"},fc={law_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",order_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",judgment_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u5224\u6C7A RAR \u55CE\uFF1F\uFF08\u4E0D\u6703\u81EA\u52D5\u532F\u5165 PostgreSQL \u6216\u5EFA\u7ACB Qdrant \u7D22\u5F15\uFF09"},bc={law_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u6CD5\u898F RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",order_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u547D\u4EE4 RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",judgment_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u53EA\u4E0B\u8F09\u5224\u6C7A RAR\u3002PostgreSQL\uFF0FParquet \u532F\u5165\u8207 Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\u300C\u5224\u6C7A\u532F\u5165\u300D\u6216\u5B8C\u6574\u8CC7\u6599\u66F4\u65B0\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_import:"\u6D41\u7A0B\u7BC4\u570D\uFF1ARAR \u2192 \u539F\u59CB\u8CC7\u6599\u6AA2\u67E5\uFF0FParquet \u5099\u4EFD \u2192 \u91D1\u878D\u6CD5\u898F\u7BE9\u9078 \u2192 PostgreSQL\u3002Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_parquet:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5F9E PostgreSQL \u532F\u51FA\u67E5\u8A62\u7528 Parquet \u5FEB\u7167\uFF1B\u4E0D\u5BEB\u5165 Qdrant\uFF0FIndexedDB\u3002",index_versions:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5EFA\u7ACB\u4E26\u9A57\u8B49\u65B0\u7684 Qdrant collection\uFF0C\u5B8C\u6210\u5F8C\u539F\u5B50\u5207\u63DB alias\uFF1BIndexedDB \u4E0D\u53C3\u8207\u3002"};function qn(e){return uc[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function ut(e,t){let s=qn(e);return`<span class="badge ${ui[s.tone]||ui.idle}"><span class="status-dot ${pi[s.tone]||pi.idle}"></span>${r(t||s.label)}</span>`}function zt(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function fi(e){return e==null?"\u7121\u6CD5\u53D6\u5F97":u(e)}function zs(e){return e&&e.color?String(e.color):"var(--accent)"}function vc(e,t=""){let s=e.percent===null||e.percent===void 0?null:Math.max(0,Math.min(100,Number(e.percent)||0)),a=e.status==="running"&&s===null,n=a?' aria-valuetext="\u9032\u5EA6\u672A\u77E5"':` aria-valuenow="${s??0}"`;return`<div class="processing-bar${a?" is-indeterminate":""}${t?` ${t}`:""}" role="progressbar" aria-valuemin="0" aria-valuemax="100"${n}>
    <span class="processing-bar-fill" style="width:${s??0}%;background:${r(zs(e))}"></span>
  </div>`}function hi(e){let t=e.unit==="bytes"?"":e.unit||"\u7B46",s=e.current,a=e.total;return["skipped","pending","idle"].includes(e.status)?"\u2014":s==null?e.status==="running"?"\u9032\u884C\u4E2D":"\u2014":e.unit==="bytes"?a?`${Ne(s)} / ${Ne(a)}`:Ne(s):a?`${u(s)} / ${u(a)} ${t}`:`${u(s)} ${t}`}function ms(e,t,s="",a=""){return`<div class="processing-summary-card">
    <span class="processing-summary-label">${r(e)}</span>
    <span class="processing-summary-value">${t}</span>
    ${s?`<span class="processing-summary-hint">${s}</span>`:""}
    ${a}
  </div>`}function hc(e){let t=e.database||{},s=e.index||{},a=e.local_archives||{},n=e.raw_backups||{},i=n.totals||{},o=e.state||{},l=e.capabilities||{},d=e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D",c=t.status==="operational",v=s.status==="operational",$=a.available!==!1,h=n.available!==!1,g=v?`${u(s.indexed)} / ${u(s.total)}`:ut(s.status||"unavailable"),p=v?`${zt(s.percent)} \xB7 \u5C1A\u9918 ${u(s.remaining)} \u7B46`:r(s.error||"\u7121\u6CD5\u67E5\u8A62 Qdrant \u7D22\u5F15\u8986\u84CB\u7387\u3002"),w=$?`${u(a.unprocessed)} / ${u(a.total)}`:ut("unavailable"),k=$?`\u672A\u8655\u7406 / \u5168\u90E8 \xB7 ${Ne(a.unprocessed_bytes)} \u5F85\u8655\u7406`:r(a.error||"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304\u3002");return`<div class="processing-summary">
    ${Dt(jc(e))}
    ${ms("\u8655\u7406\u72C0\u614B",ut(e.status||"unknown"),`${r(d)} \xB7 \u66F4\u65B0\u65BC <span data-processing-updated-at>\u2014</span>`)}
    ${ms("\u672A\u8655\u7406\u58D3\u7E2E\u6A94",r(w),k)}
    ${ms("\u539F\u59CB\u8CC7\u6599\u5099\u4EFD",h?`${u(n.count)} \u6A94`:ut("unavailable"),h?`\u5171 ${u(i.row_count)} \u7B46 \xB7 ${Ne(i.compressed_bytes)}`:r(n.error||"\u7121\u6CD5\u6383\u63CF\u539F\u59CB\u8CC7\u6599\u5099\u4EFD\u3002"))}
    ${ms("PostgreSQL \u5224\u6C7A",c?u(t.judgment_count):ut("unavailable"),c?`\u6CD5\u898F ${fi(t.law_count)} \xB7 \u547D\u4EE4 ${fi(t.order_count)}`:r(t.error||"\u7121\u6CD5\u67E5\u8A62 PostgreSQL\u3002"))}
    ${ms("Qdrant \u7D22\u5F15",g,p)}
    ${ms("\u72C0\u614B\u6A94",ut(o.status||"missing"),o.updated_at?`\u66F4\u65B0\u65BC ${r(qe(o.updated_at))}`:r(o.detail||"\u5C1A\u7121\u8655\u7406\u72C0\u614B\u7D00\u9304\u3002"))}
    ${ms("\u5F85\u8655\u7406\u5DE5\u4F5C",l.can_start_update===!1?"\u66AB\u505C\u555F\u52D5":"\u53EF\u958B\u59CB\u66F4\u65B0",l.start_blocked_reason?r(l.start_blocked_reason):`\u672A\u8655\u7406 ${u(l.unprocessed_archives)} \u500B \xB7 \u7D22\u5F15\u5F85\u88DC ${u(l.index_backlog)} \u7B46${l.external_processes?` \xB7 \u5916\u90E8\u7A0B\u5E8F ${u(l.external_processes)} \u500B`:""}`)}
  </div>`}function $c(e){let t=e.timeline||{},s=Array.isArray(t.stages)?t.stages:[],a=`<div class="report-section-head">
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
    </section>`;let n=s.map(o=>`<span class="processing-stack-segment" style="width:${Math.max(0,Number(o.percent)||0)}%;background:${r(o.color||"var(--accent)")}" title="${r(`${o.label} ${me(o.duration_ms)} (${zt(o.percent)})`)}"></span>`).join(""),i=s.map(o=>`<div class="processing-legend-item">
        <span class="processing-legend-swatch" style="background:${r(o.color||"var(--accent)")}"></span>
        <span class="processing-legend-label">${r(o.label)}</span>
        <span class="mono">${me(o.duration_ms)}</span>
        <span class="processing-legend-percent mono">${zt(o.percent)}</span>
        ${ut(o.status)}
      </div>`).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section">
      <div class="processing-timeline-label">
        <span>${r(t.label||"\u968E\u6BB5\u8017\u6642")}</span>
        <span class="mono">\u7E3D\u8A08 ${me(t.total_ms)}</span>
      </div>
      <div class="processing-stack" role="img" aria-label="\u968E\u6BB5\u8017\u6642\u6BD4\u4F8B">${n}</div>
      <div class="processing-legend">${i}</div>
    </div>
  </section>`}function yc(e){let t=Array.isArray(e.recent_runs)?e.recent_runs:[],s=new Map((e.branches||[]).map(i=>[i.key,i.label])),a=`<div class="report-section-head">
    <div>
      <div class="report-kicker">RECENT RUNS</div>
      <h2 class="report-section-title">\u6700\u8FD1\u8655\u7406\u7D00\u9304</h2>
      <p class="processing-section-sub">\u5305\u542B\u8CC7\u6599\u66F4\u65B0\u3001\u5224\u6C7A\u4E0B\u8F09\u3001\u5224\u6C7A\u532F\u5165\u3001Parquet\u3001Qdrant \u8207\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E0B\u8F09\u3002</p>
    </div>
  </div>`;if(!t.length)return`<section class="report-card processing-card">
      <div class="report-head">${a}</div>
      <div class="report-section"><div class="processing-empty">\u5C1A\u7121\u8655\u7406\u7D00\u9304\u3002</div></div>
    </section>`;let n=t.map(i=>{let o=s.get(i.branch)||gc[i.branch]||i.branch||"\u2014";return`<div class="processing-run">
        <div class="processing-run-head">
          <span class="badge badge-neutral">${r(o)}</span>
          <strong>${r(i.title||"\u8655\u7406")}</strong>
          ${ut(i.status)}
          <span class="grow"></span>
          <span class="mono faint">${r(qe(i.finished_at||i.started_at))}</span>
          <span class="mono">${i.duration_ms?me(i.duration_ms):"\u2014"}</span>
        </div>
        ${i.message?`<div class="processing-run-message">${r(i.message)}</div>`:""}
      </div>`}).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section"><div class="processing-run-list">${n}</div></div>
  </section>`}function wc(e){let t=Array.isArray(e.notices)?e.notices:[];return t.length?`<div class="processing-notices">${t.map(s=>Ee({tone:s.tone||"info",title:s.title,text:r(s.message||"")})).join("")}</div>`:""}function _c(e,t){if(e==="law"||e==="order")return t==="qdrant"?"legal_index_versions":`${e}_download`;if(e==="judgment"){if(t==="download")return"judgment_download";if(t==="parquet"||t==="postgres")return"judgment_import";if(t==="qdrant")return"index_versions"}return""}function An({month:e,year:t,monthNo:s,stageOrder:a,stageLabels:n,stageStatuses:i,overall:o,active:l,workflowForStage:d}){let c=i||{},v=String(e?.month||`${t}${String(s).padStart(2,"0")}`),$=e?.month_label||`${t}-${String(s).padStart(2,"0")}`,h=a.map(T=>`${n[T]||T}\uFF1A${Sa[c[T]||"empty"]}`).join(" \xB7 "),g=(e?.versions||[]).map(T=>T.version_code).filter(Boolean),p=[...new Set([...e?.files||[],...e?.local_files||[],...e?.imported_files||[]])].filter(Boolean),w=g.length?` \xB7 \u7248\u672C ${g.join("\u3001")}`:p.length?` \xB7 ${p.join("\u3001")}`:"",k=e?.detail?` \xB7 ${e.detail}`:"",L=e?`${$} \xB7 ${h}${w}${k}`:`${$} \xB7 \u7121\u8CC7\u6599`,E=a.map(T=>{let H=c[T]||"empty",G=H==="incomplete"?d(T):"",Y=G?"button":"span",ye=G?` type="button" data-timeline-workflow="${r(G)}"`:"";return`<${Y} class="processing-month-stage ${vi[H]||"is-empty"}${G?" is-actionable":""}"${ye} title="${r(`${n[T]||T}\uFF1A${Sa[H]}${G?"\uFF08\u9EDE\u9078\u524D\u5F80\u8655\u7406\uFF09":""}`)}" aria-label="${r(`${$} ${n[T]||T} ${Sa[H]}${G?"\uFF0C\u9EDE\u9078\u524D\u5F80\u8655\u7406":""}`)}"></${Y}>`}).join("");return`<td class="judgment-month import-month processing-month${l?" is-current":""} is-${r(o)}" data-month="${r(v)}" title="${r(L)}" aria-label="${r(L)}"${l?' aria-current="true"':""}>
    <span class="processing-month-number">${s}</span>
    <span class="processing-month-stages">${E}</span>
  </td>`}function kc(e,t,s,a){return An({month:t,year:s,monthNo:a,stageOrder:pc,stageLabels:mc,stageStatuses:t?.stages||{},overall:t?.overall||"empty",active:!!t?.active,workflowForStage:n=>_c(e.key,n)})}function Sc(e){let t=Array.isArray(e?.months)?e.months:[];if(!t.length)return`<section class="report-card processing-card import-files-card law-index-timeline-card">
      <div class="side-card-head">
        <span class="side-card-title">${m(e?.key==="order"?"file":"layers",14)}${r(e?.label||"\u6CD5\u898F\uFF0F\u547D\u4EE4")} \u7D22\u5F15\u7248\u672C\u6642\u9593\u8868</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u5C1A\u7121\u4E0B\u8F09\u7248\u672C\u6216\u7D22\u5F15\u7D00\u9304\u3002</div>
    </section>`;let s=new Map(t.map(v=>[String(v.month),v])),a=[...new Set(t.map(v=>v.year))].sort((v,$)=>$.localeCompare(v)),n=["download","prepared","indexed"],i=e.stage_labels||{download:"D \u4E0B\u8F09\u7248\u672C",prepared:"P \u8CC7\u6599\u5C31\u7DD2",indexed:"I \u7D22\u5F15\u8986\u84CB"},o=a.map(v=>{let $=Array.from({length:12},(h,g)=>{let p=g+1,w=`${v}${String(p).padStart(2,"0")}`,k=s.get(w);return An({month:k,year:v,monthNo:p,stageOrder:n,stageLabels:i,stageStatuses:k?.stages||{},overall:k?.overall||"empty",active:!!k?.active,workflowForStage:L=>L==="indexed"?"legal_index_versions":`${e.key}_download`})}).join("");return`<tr><th scope="row">${r(v)}</th>${$}</tr>`}).join(""),l=e.summary||{},d=e.current||{},c=d.month?`<div class="index-current-row">
        <span class="badge badge-info">${m("activity",11)}${r(d.label||"\u76EE\u524D\u7248\u672C")}</span>
        <strong class="mono">${r(d.month_label||xa(d.month))}</strong>
        <span class="mono">${r(d.file||"\u2014")}</span>
        <span class="index-current-copy">${r(d.detail||"")}</span>
      </div>`:"";return`<section class="report-card processing-card import-files-card law-index-timeline-card" data-law-index-timeline="${r(e.key||"")}">
    <div class="side-card-head">
      <span class="side-card-title">${m(e.key==="order"?"file":"layers",14)}${r(e.label||e.key||"")} \u7D22\u5F15\u7248\u672C\u6642\u9593\u8868</span>
      <span class="badge badge-neutral">${u(t.length)} \u500B\u6708</span>
    </div>
    <div class="judgment-months index-months">
      <div class="judgment-months-meta">
        <span class="badge badge-ok">\u5B8C\u6210 ${u(l.complete||0)}</span>
        <span class="badge badge-danger">\u672A\u5B8C\u6210 ${u(l.incomplete||0)}</span>
        <span class="badge badge-neutral">\u8655\u7406\u4E2D ${u(l.processing||0)}</span>
        <span class="badge badge-neutral">\u5DF2\u53D6\u4EE3 ${u(l.superseded||0)}</span>
        <span class="muted">\u5171 ${u(t.length)} \u500B\u6708</span>
      </div>
      ${c}
      <div class="judgment-months-scroll">
        <table class="judgment-months-table index-months-table processing-months-table">
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(v,$)=>`<th scope="col">${$+1}</th>`).join("")}</tr></thead>
          <tbody>${o}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">D\uFF1A\u4E0B\u8F09\u7248\u672C\uFF1BP\uFF1Araw Parquet + PostgreSQL \u5C31\u7DD2\uFF1BI\uFF1Aactive \u7D22\u5F15\u8986\u84CB\u3002\u820A\u7248\u672C\u986F\u793A\u300C\u5DF2\u53D6\u4EE3\u300D\uFF0C\u4E0D\u9700\u91CD\u5EFA\u7D22\u5F15\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u7248\u672C\u7DE8\u865F\u3001\u4E0B\u8F09\u6642\u9593\u8207\u7B46\u6578\u3002</p>
    </div>
  </section>`}function xc(e){let t=Array.isArray(e)?e:[];return t.length?`<div class="law-index-timelines">${t.map(Sc).join("")}</div>`:""}function $i({activeMonth:e,activeArchive:t,activePhase:s="",processingMonth:a="",processingArchive:n="",stageLabels:i={}}){if(!e||!t)return"";let o=`${String(e).slice(0,4)}-${String(e).slice(4,6)}`,l=i[s]||(s?"\u6E96\u5099\u4E2D":""),d=`${String(a||"").slice(0,4)}-${String(a||"").slice(4,6)}`,c=!!a&&(a!==e||n!==t);return`<span class="badge badge-info">${m("activity",11)}\u76EE\u524D\u532F\u5165</span>
    <strong class="mono">${r(o)}</strong>
    <span class="mono">${r(t)}</span>
    ${l?`<span class="badge badge-neutral">${r(l)}</span>`:""}
    ${c?`<span class="processing-current-processing">
            <span class="faint">\u8655\u7406\u4E2D</span>
            <strong class="mono">${r(d)}</strong>
            <span class="mono">${r(n||"\u2014")}</span>
          </span>`:""}`}function qc(e,t,s,a){let n=Array.isArray(e.stage_order)&&e.stage_order.length?e.stage_order:["extract","raw_parquet","filter","postgres"],i=e.stage_labels||{extract:"RAR \u6AA2\u67E5\uFF0F\u89E3\u58D3\u7E2E",raw_parquet:"\u539F\u59CB\u8CC7\u6599\u6AA2\u67E5\uFF0FParquet \u5099\u4EFD",filter:"\u91D1\u878D\u6CD5\u898F\u7BE9\u9078",postgres:"PostgreSQL metadata"};return An({month:t,year:s,monthNo:a,stageOrder:n,stageLabels:i,stageStatuses:t?.import_stages||{},overall:t?.import_overall||"empty",active:!!t?.active,workflowForStage:()=>"judgment_import"})}function Ac(e,t,s){let a=[];for(let n=1;n<=12;n+=1){let i=`${t}${String(n).padStart(2,"0")}`;a.push(kc(e,s.get(i),t,n))}return`<tr><th scope="row">${t}</th>${a.join("")}</tr>`}function Mc(e){let t=e?.models||{},s=[["Embedding",t.embedding],["Rerank",t.rerank]].filter(([,a])=>a&&(a.label||a.model)).map(([a,n])=>{let i=n.label||[n.host,n.model].filter(Boolean).join(" ")||"\u2014",o=[`${a} \u4E3B\u6A5F\u8207\u6A21\u578B\uFF1A${i}`,n.url?`\u7AEF\u9EDE\uFF1A${n.url}`:"",a==="Rerank"&&n.enabled===!1?"RAG_RERANK_ENABLED=false":""].filter(Boolean).join(" \xB7 ");return`<span class="processing-timeline-model" title="${r(o)}"><span>${a}</span><strong class="mono">${r(i)}</strong>${a==="Rerank"&&n.enabled===!1?"<em>\u672A\u555F\u7528</em>":""}</span>`});return s.length?`<span class="processing-timeline-models">${s.join("")}</span>`:""}function Lc(e){let t=Array.isArray(e.file_timelines)?e.file_timelines:[];return t.length?`<div class="processing-timeline-overview">${t.map(s=>{let a=Array.isArray(s.months)?s.months:[],n=new Map(a.map(d=>[String(d.month||""),d])),i=[...new Set(a.map(d=>Number(d.year)))].filter(d=>Number.isFinite(d)).sort((d,c)=>c-d),o=s.summary||{},l=s.current||null;return`<section class="report-card processing-card import-files-card processing-timeline-card" data-processing-timeline="${r(s.key||"")}">
        <div class="side-card-head">
          <span class="processing-timeline-head-main">
            <span class="side-card-title">${m(s.icon||"activity",14)}${r(s.title||`${s.label||""}\u8655\u7406\u6642\u9593\u8868`)}</span>
            ${Mc(s)}
          </span>
          <span class="badge badge-neutral">${u(s.total_months||0)} \u500B\u6708</span>
        </div>
        <div class="judgment-months index-months">
          <div class="judgment-months-meta">
            <span class="badge badge-ok">\u5B8C\u6210 ${u(o.complete||0)}</span>
            <span class="badge badge-danger">\u672A\u5B8C\u6210 ${u(o.incomplete||0)}</span>
            <span class="badge badge-neutral">\u8655\u7406\u4E2D ${u(o.processing||0)}</span>
            <span class="badge badge-info">\u6709\u66F4\u65B0 ${u(o.update||0)}</span>
            <span class="muted">\u5171 ${u(s.total_months||0)} \u500B\u6708</span>
          </div>
          ${l?`<div class="index-current-row">
                  <span class="badge badge-info">${m("activity",11)}${r(l.label||"\u76EE\u524D")}</span>
                  <strong class="mono">${r(l.month_label||"\u2014")}</strong>
                  <span class="mono">${r(l.file||"\u2014")}</span>
                  ${l.detail?`<span class="muted">${r(l.detail)}</span>`:""}
                </div>`:""}
          ${a.length?`<div class="judgment-months-scroll">
                  <table class="judgment-months-table import-months-table processing-months-table">
                    <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(d,c)=>`<th scope="col">${c+1}</th>`).join("")}</tr></thead>
                    <tbody>${i.map(d=>Ac(s,d,n)).join("")}</tbody>
                  </table>
                </div>`:'<div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u3002</div>'}
          <div class="processing-timeline-key">
            ${["complete","incomplete","processing","empty"].map(d=>`<span><i class="processing-timeline-swatch ${vi[d]}"></i>${Sa[d]}</span>`).join("")}
            <span class="processing-timeline-key-order">\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\uFF1A\u4E0B\u8F09\uFF0FParquet\uFF0FPostgreSQL\uFF0FQdrant</span>
          </div>
          <p class="judgment-months-hint">${s.key==="judgment"?"\u5224\u6C7A\u4EE5\u88C1\u5224\u66F8\u6708\u4EFD\u986F\u793A\u3002":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u4EE5\u4F86\u6E90\u7248\u672C\u6708\u4EFD\u986F\u793A\u3002"}\u7DA0\u8272\uFF1A\u5B8C\u6210\uFF1B\u7D05\u8272\uFF1A\u672A\u5B8C\u6210\uFF1B\u7070\u8272\uFF1A\u8655\u7406\u4E2D\uFF1B\u7A7A\u767D\uFF1A\u7121\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u6216\u8272\u584A\u53EF\u67E5\u770B\u5404\u968E\u6BB5\u72C0\u614B\u3002</p>
        </div>
      </section>`}).join("")}</div>`:'<div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u8655\u7406\u6642\u9593\u8868\u3002</div>'}function jc(e){return e.judgment_stats&&typeof e.judgment_stats=="object"?e.judgment_stats:{judgment_total:(e.raw_backups?.totals||{}).row_count,financial_total:(e.database||{}).judgment_count}}function bi(e,t=new Set){return`${wc(e)}
    ${hc(e)}
    ${Lc(e)}
    ${$c(e)}
    ${yc(e)}`}function Tc(e,t){return`<div class="report-card processing-card">
    <div class="report-section">
      ${Ee({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B",text:r(e||"\u672A\u77E5\u932F\u8AA4")})}
      ${t?`<p class="processing-section-sub">\u4E0A\u6B21\u6210\u529F\u66F4\u65B0\uFF1A${r(qe(t.generated_at))}\u3002\u756B\u9762\u4E0A\u6C92\u6709\u986F\u793A\u66FF\u4EE3\u6216\u63A8\u6E2C\u7684\u9032\u5EA6\u3002</p>`:""}
      <div class="processing-error-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh">
          ${m("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
  </div>`}function Nc(e,t){if(e.nodeType!==t.nodeType||e.nodeName!==t.nodeName){e.replaceWith(t.cloneNode(!0));return}if(e.nodeType===Node.TEXT_NODE){e.nodeValue!==t.nodeValue&&(e.nodeValue=t.nodeValue);return}if(e.nodeType===Node.ELEMENT_NODE){for(let s of[...e.attributes])t.hasAttribute(s.name)||e.removeAttribute(s.name);for(let s of[...t.attributes])e.getAttribute(s.name)!==s.value&&e.setAttribute(s.name,s.value);t.hasAttribute("data-preserve-children")||yi(e,t)}}function yi(e,t){let s=[...e.childNodes],a=[...t.childNodes],n=Math.min(s.length,a.length);for(let i=0;i<n;i+=1)Nc(s[i],a[i]);for(let i=n;i<s.length;i+=1)s[i].remove();for(let i=n;i<a.length;i+=1)e.appendChild(a[i].cloneNode(!0))}function is(e,t){let s=document.createElement("template");s.innerHTML=t,yi(e,s.content)}var wi={overview:"activity",law_download:"layers",order_download:"file",judgment_download:"download",judgment_import:"database",judgment_parquet:"cube",index_versions:"brain",normalize_courts:"filter",backfill_law_articles:"history"};function Ec(e){let s=(Array.isArray(e.workflows)?e.workflows:[]).map(n=>{let i=n.active_run||null,o=i||n.last_run||null;return{...n,activeRun:i,lastRun:o,status:i?i.status||"running":n.update_available?"update":o?.status||"idle"}}),a=s.find(n=>n.id==="judgment_parquet");return[{id:"overview",label:"\u8655\u7406\u7E3D\u89BD",description:"\u76EE\u524D\u6D41\u7A0B\u3001\u58D3\u7E2E\u6A94\u8207\u6700\u8FD1\u57F7\u884C\u7D00\u9304",status:e.status||"idle",activeRun:null,lastRun:null},...s.filter(n=>n.id!=="judgment_parquet"),...a?[a]:[]]}function kn(e,t){let s=Ec(e),a=new Set(["law_download","judgment_download","normalize_courts"]);return`<div class="status-sidebar-head">
      <div class="eyebrow">DATA WORKFLOWS</div>
      <div class="status-sidebar-title">\u8CC7\u6599\u6D41\u7A0B</div>
    </div>
    <nav class="status-tab-list" aria-label="\u8CC7\u6599\u8655\u7406\u5DE5\u4F5C\u6D41\u7A0B">
      ${s.map(n=>{let i=n.id===t,o=wi[n.id]||"terminal",l=a.has(n.id)?'<div class="status-tab-divider" role="separator" aria-hidden="true"></div>':"",d=Number(n.pending_count)||0,c=Number(n.update_count)||(n.update_available?d:0),v=n.update_available&&c>0&&!n.activeRun,$=[n.update_message||`${n.update_origin||"\u66F4\u65B0\u5075\u6E2C"}\u627E\u5230 ${u(c)} \u9805\u53EF\u66F4\u65B0\u5167\u5BB9`,n.update_origin?`\u4F86\u6E90\uFF1A${n.update_origin}`:"",n.update_mechanism?`\u6A5F\u5236\uFF1A${n.update_mechanism}`:""].filter(Boolean).join(" \xB7 ");return`${l}<button class="status-tab${i?" is-active":""}" type="button"
            data-processing-workflow="${r(n.id)}"
            ${i?'aria-current="page"':""}>
            <span class="status-tab-icon">${m(o,15)}</span>
            <span class="status-tab-copy">
              <strong>${r(n.label)}</strong>
              <small>${r(n.description||"")}</small>
            </span>
            ${v?`<span class="badge badge-warn badge-mono processing-update-count" title="${r($)}">${m("refresh",10)}${u(c)}</span>`:ut(n.status)}
          </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u57F7\u884C\u6A21\u5F0F</span>
      <span class="mono">${r(e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D")}</span>
    </div>`}function Rc(e){if(!e)return'<div class="processing-workflow-empty">\u5C1A\u672A\u57F7\u884C\u3002\u6309\u4E0B\u53F3\u5074\u6309\u9215\u958B\u59CB\u3002</div>';let t=e.meta||{};return`<div class="processing-workflow-run">
    <div class="processing-workflow-run-head">
      ${ut(e.status)}
      <span class="mono">${r(e.id||"\u2014")}</span>
    </div>
    <div class="processing-workflow-run-grid">
      <span>\u958B\u59CB</span><strong>${r(qe(e.started_at))}</strong>
      <span>\u8017\u6642</span><strong>${me(e.duration_ms)}</strong>
      <span>\u8A0A\u606F</span><strong>${r(e.message||"\u2014")}</strong>
      ${t.log_path?`<span>\u65E5\u8A8C</span><strong class="mono">${r(t.log_path)}</strong>`:""}
    </div>
  </div>`}function Hs(e){return`${e.year}-${String(e.month_no).padStart(2,"0")}`}function _i(e){let t={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"},s=e.status||"red";return[Hs(e),t[s]||s,e.latest_fileset_id?`fileset ${e.latest_fileset_id}`:"",e.filename||"",e.local_filename&&e.local_filename!==e.filename?`\u672C\u6A5F\uFF1A${e.local_filename}`:""].filter(Boolean).join(" \xB7 ")}function ki(e){if(!e.download_url)return"";let t=Hs(e);return`<a class="judgment-month-download" href="${r(yt(e.download_url))}" target="_blank" rel="noreferrer" title="\u4E0B\u8F09 ${t} \u5224\u6C7A" aria-label="\u4E0B\u8F09 ${t} \u5224\u6C7A">${m("download",11)}</a>`}function Cc(e){let t=e.status||"red";return`<td class="judgment-month is-${r(t)}" data-judgment-month-key="${r(Hs(e))}" title="${r(_i(e))}"><span>${e.month_no}</span>${ki(e)}</td>`}function Pc(e){return e?.off_hours_enabled===!0}function Si(e){return`\u7DA0\u8272\uFF1A\u6700\u65B0\u7248\u5DF2\u4E0B\u8F09\u5230 raw_rar\uFF1B\u7070\u8272\uFF1A\u672C\u6A5F\u4ECD\u662F\u820A\u7248\uFF0C\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u6703\u66F4\u65B0\uFF1B\u7D05\u8272\uFF1A\u8A72\u6708\u4EFD\u7F3A\u5C11\u5224\u6C7A\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u958B\u555F\u4E0B\u8F09\u9023\u7D50\uFF08${Pc(e)?"\u975E API \u6642\u6BB5\u4E5F\u53EF\u4E0B\u8F09\uFF0C\u5EFA\u8B70\u4E00\u6B21\u53EA\u4E0B\u8F09\u4E00\u500B\u6A94\u6848":"\u4E0B\u8F09\u9023\u7D50\u50C5\u5728 00:00\u201306:00 API \u6642\u6BB5\u53EF\u7528"}\uFF09\u3002\u5F85\u88DC\u9F4A\u6708\u4EFD\u6703\u512A\u5148\u4E0B\u8F09\uFF0C\u5168\u90E8\u88DC\u9F4A\u5F8C\u624D\u7531\u6700\u65B0\u6708\u4EFD\u5F80\u56DE\u9A57\u8B49\u65E2\u6709\u6A94\u6848\uFF1B\u4E2D\u65B7\u7684\u4E0B\u8F09\u6703\u4FDD\u7559 .part\uFF0C\u4F3A\u670D\u5668\u652F\u63F4 Range \u6642\u7E8C\u50B3\uFF0C\u5426\u5247\u5F9E\u96F6\u91CD\u65B0\u4E0B\u8F09\u3002\u9996\u6B21\u5B8C\u6574\u540C\u6B65\u53EF\u80FD\u9700\u4E0B\u8F09\u6578\u767E\u500B\u6708\u4EFD\uFF0C\u9810\u8A2D\u975E\u6642\u6BB5\u4E5F\u53EF\u7E8C\u50B3\uFF1B\u56B4\u683C\u6A21\u5F0F\u6703\u5728 00:00\u201306:00 \u4EE5\u5916\u505C\u6B62\u3002`}var Ic={completed:"\u5B8C\u6210",window_closed:"API \u6642\u6BB5\u7D50\u675F",deadline:"\u63A5\u8FD1 06:00\uFF0C\u4FDD\u7559\u5F85\u4E0B\u8F09\u6708\u4EFD",verification_window_closed:"API \u6642\u6BB5\u7D50\u675F\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",verification_deadline:"\u63A5\u8FD1 06:00\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",errors:"\u90E8\u5206\u6708\u4EFD\u4E0B\u8F09\u5931\u6557\uFF0C\u4E0B\u6B21\u91CD\u8A66",pending:"\u4ECD\u6709\u5F85\u4E0B\u8F09\u6708\u4EFD",check_only:"\u50C5\u6AA2\u67E5\uFF0C\u672A\u4E0B\u8F09",incremental:"\u589E\u91CF\u6AA2\u67E5\u5B8C\u6210",status_only:"\u50C5\u66F4\u65B0\u6708\u4EFD\u72C0\u614B",running:"\u57F7\u884C\u4E2D"};function xi(e){let t=e?.backfill||{},s=t.verification||{},a=t.last_run||{},n=Number(t.pending_count)||0,i=Number(t.failure_count)||0,o=String(t.resume_from_month||""),l="\u9A57\u8B49\uFF1A\u672A\u958B\u59CB";s.status==="completed"?l="\u9A57\u8B49\u5B8C\u6210":s.next_month?l=`\u9A57\u8B49\u7E8C\u50B3 ${s.next_month}`:s.status==="in_progress"&&(l="\u9A57\u8B49\u9032\u884C\u4E2D");let d=String(a.stop_reason||""),c=d?`\u4E0A\u6B21\u505C\u6B62\uFF1A${Ic[d]||d}`:"";return{pending:n,failures:i,resume:o,verificationText:l,lastText:c}}function Bc(e){let t=xi(e),s=t.pending>0?`\u5F85\u88DC\u9F4A ${u(t.pending)} \u500B\u6708${t.failures>0?`\uFF08${u(t.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708";return`<div class="judgment-backfill" data-judgment-backfill>
    <span class="badge ${t.pending>0?"badge-danger":"badge-ok"}" data-judgment-backfill-pending>${s}</span>
    <span class="badge badge-neutral" data-judgment-backfill-resume ${t.resume&&t.pending>0?"":"hidden"}>\u5F9E ${r(t.resume)} \u7E8C\u50B3</span>
    <span class="badge badge-info" data-judgment-backfill-verification>${r(t.verificationText)}</span>
    <span class="muted" data-judgment-backfill-last ${t.lastText?"":"hidden"}>${r(t.lastText)}</span>
  </div>`}function Oc(e,t){let s=xi(t),a=e.querySelector("[data-judgment-backfill-pending]");a&&(a.textContent=s.pending>0?`\u5F85\u88DC\u9F4A ${u(s.pending)} \u500B\u6708${s.failures>0?`\uFF08${u(s.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708",a.classList.toggle("badge-danger",s.pending>0),a.classList.toggle("badge-ok",s.pending===0));let n=e.querySelector("[data-judgment-backfill-resume]");if(n){let l=!!s.resume&&s.pending>0;n.hidden=!l,n.textContent=l?`\u5F9E ${s.resume} \u7E8C\u50B3`:""}let i=e.querySelector("[data-judgment-backfill-verification]");i&&(i.textContent=s.verificationText);let o=e.querySelector("[data-judgment-backfill-last]");o&&(o.hidden=!s.lastText,o.textContent=s.lastText)}function Mn(){return'<div class="judgment-months-loading"><span class="spinner"></span><span>\u8B80\u53D6\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B\u2026</span></div>'}function Dc(e){if(e?.loading&&!e?.months?.length)return Mn();if(e?.error&&!e?.months?.length)return Ee({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:r(e.error)});let t=Array.isArray(e?.months)?e.months:[];if(!t.length)return'<div class="processing-empty">\u5C1A\u672A\u6709\u6708\u4EFD\u72C0\u614B\uFF1B\u8ACB\u5148\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u3002</div>';let s=new Map(t.map(o=>[Hs(o),o])),n=[...new Set(t.map(o=>o.year))].sort((o,l)=>l-o).map(o=>{let l=Array.from({length:12},(d,c)=>{let v=s.get(`${o}-${String(c+1).padStart(2,"0")}`);return v?Cc(v):`<td class="judgment-month is-empty"><span>${c+1}</span></td>`}).join("");return`<tr><th scope="row">${o}</th>${l}</tr>`}).join(""),i=e.summary||{};return`<div class="judgment-months">
    <div class="judgment-months-meta">
      <span class="badge badge-ok" data-judgment-summary="green">\u6700\u65B0\u7248 ${u(i.green||0)}</span>
      <span class="badge badge-neutral" data-judgment-summary="gray">\u820A\u7248 ${u(i.gray||0)}</span>
      <span class="badge badge-danger" data-judgment-summary="red">\u7F3A\u5931 ${u(i.red||0)}</span>
      <span class="muted" data-judgment-total>\u5171 ${u(e.total_months||t.length)} \u500B\u6708</span>
    </div>
    ${Bc(e)}
    <div class="judgment-months-scroll">
      <table class="judgment-months-table">
        <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(o,l)=>`<th scope="col">${l+1}</th>`).join("")}</tr></thead>
        <tbody>${n}</tbody>
      </table>
    </div>
    <p class="judgment-months-hint" data-judgment-hint>${r(Si(e))}</p>
  </div>`}function Fc(e,t){let s=Array.isArray(t?.months)?t.months:[],a=t.summary||{},n={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"};e.querySelectorAll("[data-judgment-summary]").forEach(l=>{let d=l.dataset.judgmentSummary||"";l.textContent=`${n[d]||d} ${u(a[d]||0)}`});let i=e.querySelector("[data-judgment-total]");i&&(i.textContent=`\u5171 ${u(t.total_months||s.length)} \u500B\u6708`),Oc(e,t);let o=e.querySelector("[data-judgment-hint]");if(o){let l=Si(t);o.textContent!==l&&(o.textContent=l)}for(let l of s){let d=Hs(l),c=e.querySelector(`[data-judgment-month-key="${d}"]`);if(!c)continue;let v=l.status||"red";c.classList.contains(`is-${v}`)||(c.classList.remove("is-green","is-gray","is-red","is-empty"),c.classList.add(`is-${v}`));let $=_i(l);c.title!==$&&(c.title=$);let h=c.querySelector(".judgment-month-download");if(l.download_url){let g=yt(l.download_url);h?h.getAttribute("href")!==g&&(h.href=g):c.insertAdjacentHTML("beforeend",ki(l))}else h&&h.remove()}}function zc(e){let t=Array.isArray(e)?e:[];return t.length?`<div class="processing-workflow-history">
    ${t.map(s=>`<div class="processing-workflow-history-row">
          <span class="processing-workflow-history-status">${ut(s.status||"idle")}</span>
          <span class="mono">${r(qe(s.started_at))}</span>
          <span class="mono">${r(me(s.duration_ms||0))}</span>
          <span class="processing-workflow-history-message">${r(s.message||"\u2014")}</span>
        </div>`).join("")}
  </div>`:'<div class="processing-workflow-empty">\u5C1A\u7121\u57F7\u884C\u7D00\u9304\u3002</div>'}function Hc(e){let t=Array.isArray(e.update_history)?e.update_history:[];if(!t.length)return'<div class="processing-workflow-empty">\u5C1A\u7121\u7248\u672C\u6AA2\u67E5\u7D00\u9304\u3002</div>';let s={up_to_date:["\u5DF2\u662F\u6700\u65B0","badge-ok"],update_available:["\u6709\u66F4\u65B0","badge-warn"],error:["\u6AA2\u67E5\u5931\u6557","badge-danger"]};return`<div class="processing-workflow-history">
    ${t.map(a=>{let[n,i]=s[a.status]||[a.status||"\u672A\u77E5","badge-neutral"],o=a.remote_content_length!=null?Ne(a.remote_content_length):"\u2014",l=a.local_version_id?`v${a.local_version_id}`:"\u2014";return`<div class="processing-workflow-history-row">
          <span class="badge ${i}">${r(n)}</span>
          <span class="mono">${r(qe(a.checked_at))}</span>
          <span class="mono">\u9060\u7AEF ${r(o)}</span>
          <span class="mono">\u672C\u5730 ${r(l)}</span>
          <span class="processing-workflow-history-message">${r(a.message||"\u2014")}</span>
        </div>`}).join("")}
  </div>`}function xn(e){let t=String(e.key||""),s=qn(e.status);return[`data-stage-key="${r(t)}"`,`data-stage-label="${r(e.label||t)}"`,`data-stage-color="${r(zs(e))}"`,`data-stage-status-key="${r(e.status||"idle")}"`,`data-stage-status="${r(s.label)}"`,`data-stage-percent="${r(zt(e.percent))}"`,`data-stage-counts="${r(hi(e))}"`,`data-stage-duration="${r(me(e.duration_ms||0))}"`,`data-stage-contribution="${r(zt(e.contribution_percent))}"`,`data-stage-message="${r(e.message||"")}"`].join(" ")}function Uc(e){let t=String(e.status||"idle");if(t!=="failed")return ut(t);let s=String(e.error||e.message||"\u968E\u6BB5\u57F7\u884C\u5931\u6557\u3002").trim(),a=String(e.resolution||"\u67E5\u770B .run \u76EE\u9304\u4E2D\u7684\u6700\u65B0\u65E5\u8A8C\u53D6\u5F97\u5B8C\u6574 traceback\uFF0C\u4FEE\u6B63\u5F8C\u91CD\u65B0\u57F7\u884C\u6B64\u6D41\u7A0B\u3002").trim(),n=`\u539F\u56E0\uFF1A${s}
\u5EFA\u8B70\uFF1A${a}`;return`<span class="badge badge-danger is-failure-tip" tabindex="0" aria-label="${r(n)}" data-failure-tip="${r(n)}"><span class="status-dot is-danger"></span>\u5931\u6557</span>`}function Qc(e){let t=String(e.status||"idle"),s=Number(e.financial_processed),a=Number(e.financial_matched),n=e.key==="filter"&&e.financial_processed!==null&&e.financial_processed!==void 0&&Number.isFinite(s)&&Number.isFinite(a)&&s>0,i=n?a/s*100:0,o=n?`<span class="processing-financial-ratio" title="\u91D1\u878D\u6848\u4EF6\u4F54\u6BD4\uFF1A\u672C\u6B21\u91D1\u878D\u6848\u4EF6\u6578 / \u672C\u6B21\u7D2F\u8A08\u5DF2\u8655\u7406\u539F\u59CB\u5224\u6C7A\u6578">
        <span class="processing-financial-ratio-count">\u91D1\u878D\u6848\u4EF6<strong class="mono">${u(a)}</strong></span>
        <span class="faint" aria-hidden="true">/</span>
        <span class="processing-financial-ratio-count">\u5168\u90E8\u6848\u4EF6<strong class="mono">${u(s)}</strong></span>
        <strong class="mono">\u91D1\u878D\u4F54\u6BD4${Math.round(i)}%</strong>
      </span>`:"",l=e.key==="postgres"&&e.total!==null&&e.total!==void 0?`\u7E3D\u8A08 ${u(e.total)} \u7B46`:hi(e),d=e.key==="filter"?String(e.message||"").replace(/\s*[，,]\s*命中\s*[\d,]+\s*筆。?\s*$/,"\u3002"):String(e.message||"");return`<div class="processing-workflow-stage${t==="running"?" is-running":""}" style="--stage-color:${r(zs(e))}" ${xn(e)}>
    <div class="processing-workflow-stage-head">
      <span class="processing-workflow-stage-swatch"></span>
      <span class="processing-workflow-stage-label">${r(e.label||e.key||"\u968E\u6BB5")}</span>
      ${Uc(e)}
      <span class="processing-workflow-stage-percent mono">${zt(e.percent)}</span>
    </div>
    ${vc(e)}
    <div class="processing-workflow-stage-meta">
      ${e.key==="filter"?"":`<span>${r(l)}</span>
      <span class="mono">${me(e.duration_ms||0)}</span>`}
      <span class="processing-workflow-stage-message">${r(d||"\u2014")}</span>
      ${o}
    </div>
  </div>`}function Gc(e){let t=e.progress||{},s=Array.isArray(t.stages)?t.stages:[];if(!s.length)return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
      <div class="side-card-head">
        <span class="side-card-title">${m("activity",14)}\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C\u6B64\u6D41\u7A0B\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A host/model\u3001Blue-Green \u5EFA\u7F6E\u8207\u5404\u968E\u6BB5\u9032\u5EA6\u3002</div>
    </section>`;let a=new Map(s.map(pe=>[String(pe.key||""),pe])),n=a.get("ollama")||{},i=a.get("qdrant")||{},o=a.get("validate")||{},l=e.index_runtime||{},d=l.summary||{},c=l.copy||{},v=l.current||{},$=l.embedding||{},h=$.selected||{},g=$.active||{},p=Number(l.expected_count||d.total||i.total||0),w=Number(d.indexed??i.current??0),k=p>0?Math.min(100,w/p*100):i.status==="success"?100:0,L=Number(c.total||0),E=Number(c.copied||0),T=L>0?Math.min(100,E/L*100):c.status==="success"?100:0,H=String(l.build_mode||""),G=String(t.run_status||""),Y=!!G&&!["running","success","no_change"].includes(G),ye=String(c.status||(H==="reuse"?"pending":"skipped"));Y&&ye==="pending"&&(ye="stale");let Ae=String(o.status||"pending"),J=Ae==="success"&&/alias 已切換/.test(String(o.message||"")),B=J?"success":Ae==="failed"?"failed":G==="running"?"pending":"skipped",S=l.version_id?`v${String(l.version_id).padStart(3,"0")}`:"\u2014",C=g.host||h.host||g.url||h.url||"\u2014",ne=g.port||h.port,ge=ne?`${C}:${ne}`:String(C),V=g.model||h.model||l.model||"\u2014",Z=v.month?`${xa(v.month)}${v.preparing?"\uFF08\u6E96\u5099\u4E2D\uFF09":""}`:t.run_status==="running"?"\u6E96\u5099\u4E2D":"\u2014",ae=[{key:"probe",label:"Ollama \u4E3B\u6A5F\uFF0F\u6A21\u578B\u6E2C\u8A66",color:"#22c55e",status:n.status||"pending",percent:Number(n.percent)||0,duration_ms:n.duration_ms,detail:`${u(n.current||0)} / ${u(n.total||0)} \u53F0 \xB7 ${ge} \xB7 ${V}`},{key:"version",label:"\u5EFA\u7ACB\uFF0F\u63A5\u7E8C Blue-Green \u7248\u672C",color:"#06b6d4",status:l.version_id?"success":"pending",percent:l.version_id?100:0,duration_ms:l.version_duration_ms,detail:`${S} \xB7 ${l.collection||"\u2014"} \xB7 ${H||"\u2014"}`},{key:"copy",label:"\u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF",color:"#f59e0b",status:ye,percent:T,duration_ms:c.duration_ms,detail:L>0?`${u(E)} / ${u(L)} points \xB7 \u820A collection \u5411\u91CF`:ye==="skipped"?"\u672C\u6B21\u4E0D\u9700\u8907\u88FD\u820A\u5411\u91CF":ye==="stale"?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u5B8C\u6210\u8907\u88FD":"\u7B49\u5F85\u820A collection \u8907\u88FD"},{key:"index",label:"\u91D1\u878D\u5224\u6C7A\u5411\u91CF\u7D22\u5F15",color:"#a78bfa",status:i.status||"pending",percent:k,duration_ms:i.duration_ms,detail:`${u(w)} / ${u(p)} \u7B46 \xB7 \u91CD\u7528 ${u(d.reused)} \xB7 \u65B0 embedding ${u(d.embedded)}`},{key:"validate",label:"\u9A57\u8B49\u65B0\u7248\u672C",color:"#eab308",status:Ae,percent:Ae==="success"?100:0,duration_ms:o.duration_ms,detail:o.message||(Y?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u9032\u884C\u9A57\u8B49\u3002":"\u7B49\u5F85\u7D22\u5F15\u5B8C\u6210\u5F8C\u9A57\u8B49\u7B46\u6578\u3001\u7DAD\u5EA6\u8207 payload\u3002")},{key:"activate",label:"\u5207\u63DB alias",color:"#3b82f6",status:B,percent:J?100:0,duration_ms:0,detail:J?o.message:Y?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u5207\u63DB alias\u3002":"\u9A57\u8B49\u901A\u904E\u5F8C\u5207\u63DB judgments_current\u3002"}],ee=ae.filter(pe=>pe.status!=="skipped"),_e=ee.length?ee.reduce((pe,tt)=>pe+tt.percent,0)/ee.length:0,z=ae.filter(pe=>pe.status==="success").length,be=zt(_e),Me=ae.map((pe,tt)=>`<div class="index-wf-row is-${r(pe.status)}">
        <div class="index-wf-rail">
          <span class="index-wf-dot" style="--stage-color:${r(pe.color)}"></span>
        </div>
        <div class="index-wf-body">
          <div class="index-wf-head">
            <span class="index-wf-step">${String(tt+1).padStart(2,"0")}</span>
            <strong>${r(pe.label)}</strong>
            ${ut(pe.status)}
            <span class="index-wf-duration mono">${pe.duration_ms?me(pe.duration_ms):"\u2014"}</span>
          </div>
          <div class="index-wf-track">
            <span style="width:${Math.max(0,Math.min(100,pe.percent)).toFixed(1)}%;background:${r(pe.color)}"></span>
          </div>
          <div class="index-wf-detail">${r(pe.detail)}</div>
        </div>
      </div>`).join("");return`<section class="report-card processing-card processing-workflow-progress-card index-wf-card" data-workflow-progress>
    <div class="side-card-head">
      <span class="side-card-title">${m("activity",14)}\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</span>
      <span class="badge ${t.run_status==="running"?"badge-info":"badge-neutral"}">${u(z)} / ${u(ee.length)} \u968E\u6BB5</span>
    </div>
    <div class="index-wf-summary">
      <span>\u6574\u9AD4 <strong class="mono">${be}</strong></span>
      <span>\u7248\u672C <strong class="mono">${r(S)}</strong></span>
      <span>Collection <strong class="mono">${r(l.collection||"\u2014")}</strong></span>
      <span>\u6A21\u5F0F <strong>${r(H||"\u2014")}</strong></span>
      <span>Host <strong class="mono">${r(ge)}</strong></span>
      <span>Model <strong class="mono">${r(V)}</strong></span>
      <span>\u76EE\u524D <strong>${r(Z)}</strong></span>
    </div>
    <div class="index-wf-list">${Me}</div>
    <div class="index-wf-overall">
      <div class="index-wf-overall-head">
        <span>\u6574\u9AD4\u9032\u5EA6</span>
        <span class="mono">${be}</span>
      </div>
      <div class="index-wf-overall-track">
        <span style="width:${Math.max(0,Math.min(100,_e)).toFixed(1)}%"></span>
      </div>
    </div>
  </section>`}function Jc(e){if(e.id==="index_versions")return Gc(e);let t=e.progress||{},s=Array.isArray(t.stages)?t.stages:[];if(!s.length)return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
      <div class="side-card-head">
        <span class="side-card-title">${m("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C\u6B64\u6D41\u7A0B\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A\u5404\u968E\u6BB5\u8207\u6574\u9AD4\u9032\u5EA6\u3002</div>
    </section>`;let a=t.overall_percent,i=s.filter(h=>h.status!=="skipped").filter(h=>Number(h.contribution_percent)>0).map(h=>`<span class="processing-workflow-progress-segment" style="width:${Number(h.contribution_percent)||0}%;background:${r(zs(h))}" ${xn(h)}></span>`).join(""),o=s.map(h=>`<div class="processing-workflow-progress-legend-item${h.status==="skipped"?" is-skipped":""}" ${xn(h)}>
        <span class="processing-workflow-progress-swatch" style="background:${r(zs(h))}"></span>
        <span class="processing-workflow-progress-legend-label">${r(h.label||h.key||"\u968E\u6BB5")}</span>
        <span class="mono">${zt(h.percent)}</span>
      </div>`).join(""),l=Number(t.completed_stages)||0,d=Number(t.total_stages)||0,c=s.filter(h=>h.status==="skipped").length,v=c?`\u5B8C\u6210 ${l} \xB7 \u7565\u904E ${c}`:`${l} / ${d} \u968E\u6BB5`,$=bc[e.id]||"";return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
    <div class="side-card-head">
      <span class="side-card-title">${m("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
      <span class="badge ${t.run_status==="running"?"badge-info":"badge-neutral"}">${v}</span>
    </div>
    <div class="processing-workflow-stage-list">${s.map(Qc).join("")}</div>
    <div class="processing-workflow-overall">
      <div class="processing-workflow-overall-head">
        <span>\u6574\u9AD4\u9032\u5EA6</span>
        <span class="mono">${zt(a)}</span>
      </div>
      <div class="processing-workflow-progress-stack" role="img" aria-label="\u5404\u968E\u6BB5\u9032\u5EA6\u52A0\u7E3D">${i||'<span class="processing-workflow-progress-empty">\u5C1A\u7121\u53EF\u8A08\u7B97\u9032\u5EA6</span>'}</div>
      <div class="processing-workflow-progress-legend">${o}</div>
      <div class="processing-workflow-progress-hint">\u5C07\u6ED1\u9F20\u79FB\u5230\u4EFB\u4E00\u968E\u6BB5\u6216\u8272\u584A\uFF0C\u53EA\u6703\u4FDD\u7559\u8A72\u9805\u76EE\u4E26\u986F\u793A\u8AAA\u660E\uFF1B\u7565\u904E\u968E\u6BB5\u4E0D\u5217\u5165\u6574\u9AD4\u9032\u5EA6\u3002</div>
    </div>
    ${$?`<p class="processing-workflow-scope-note">${m("info",12)}<span>${r($)}</span></p>`:""}
  </section>`}function xa(e){let t=String(e||"");return t.length===6?`${t.slice(0,4)}-${t.slice(4)}`:t||"\u2014"}function Vc(e,t){let s={primary:"\u4E3B\u8981",fallback:"\u5099\u63F4",provided:"\u5916\u90E8"},a=Array.isArray(e.models)?e.models:[],n=a.length?a.join("\u3001"):"\u2014";return`<div class="index-host-row${e.url&&e.url===t?" is-selected":""}">
    <div class="index-host-head">
      <span class="badge badge-neutral">${r(s[e.role]||e.role||"\u4E3B\u6A5F")}</span>
      <strong class="mono">${r(e.host||"\u2014")}:${r(e.port??"\u2014")}</strong>
      ${ut(e.status||"unavailable")}
      <span class="index-host-model">${r(e.model||"\u2014")}</span>
    </div>
    <div class="index-host-url mono">${r(e.url||"\u2014")}</div>
    <div class="index-host-models" title="${r(n)}">\u6A21\u578B\uFF1A${r(n)}</div>
    ${e.detail?`<div class="index-host-detail">${r(e.detail)}</div>`:""}
  </div>`}function Wc(e){let t=Array.isArray(e.months)?e.months:[],s=e.current||{},a=e.active_coverage||{},n=new Map;for(let d of t){let c=String(d.month||"");if(!/^\d{6}$/.test(c))continue;let v=Number(c.slice(4,6));if(v<1||v>12)continue;let $=n.get(c);$||($={key:c,year:c.slice(0,4),monthNo:v,total:0,processed:0,activeTotal:0,activeProcessed:0,reused:0,embedded:0,archives:[],current:!1,preparing:!1,jid:""},n.set(c,$)),$.total+=Number(d.total)||0,$.processed+=Number(d.processed)||0;let h=a[c]||{};$.activeTotal=Math.max($.activeTotal,Number(h.total)||0),$.activeProcessed=Math.max($.activeProcessed,Number(h.processed)||0),$.reused+=Number(d.reused)||0,$.embedded+=Number(d.embedded)||0,d.archive&&$.archives.push(String(d.archive)),s.month===c&&(!s.archive||s.archive===d.archive)&&($.current=!0,$.preparing=!!s.preparing,$.jid=String(s.jid||""))}if(!n.size)return'<div class="processing-workflow-empty">\u5C1A\u7121\u53EF\u986F\u793A\u7684\u7D22\u5F15\u6708\u4EFD\uFF1B\u958B\u59CB\u7D22\u5F15\u5F8C\u6703\u4F9D\u6642\u9593\u5217\u51FA\u6708\u4EFD\u72C0\u614B\u3002</div>';let i={active:0,reuseComplete:0,reuseIncomplete:0,embedComplete:0,embedIncomplete:0};for(let d of n.values()){let c=d.total>0&&d.processed>=d.total,v=d.activeTotal>0&&d.activeProcessed>=d.activeTotal,$=d.embedded>0?"embed":d.reused>0||v?"reuse":"embed";d.kind=$,d.currentComplete=c,d.status=c?"green":d.processed>0?"red":v?"green":"gray",$==="reuse"?c?i.reuseComplete+=1:i.reuseIncomplete+=1:c?i.embedComplete+=1:i.embedIncomplete+=1,v&&(i.active+=1)}let l=[...new Set([...n.values()].map(d=>d.year))].sort((d,c)=>c.localeCompare(d)).map(d=>{let c=Array.from({length:12},(v,$)=>{let h=$+1,g=`${d}${String(h).padStart(2,"0")}`,p=n.get(g);if(!p)return`<td class="judgment-month is-empty"><span>${h}</span></td>`;let w=p.total?`${Math.min(100,Math.round(p.processed/p.total*1e3)/10)}%`:"\u2014",k=p.current&&e.run_status==="running",L=[`${p.year}-${String(p.monthNo).padStart(2,"0")}`,p.archives.join("\u3001")||"\u2014",`\u65B0\u7248\u672C ${u(p.processed)} / ${u(p.total)}\uFF08${w}\uFF09`,p.activeTotal>0?`active ${u(p.activeProcessed)} / ${u(p.activeTotal)}\uFF08${(100*p.activeProcessed/p.activeTotal).toFixed(1)}%\uFF09`:"",`\u91CD\u7528 ${u(p.reused)} \xB7 \u65B0 embedding ${u(p.embedded)}`,p.currentComplete?"":p.kind==="reuse"?"\u5F85\u5B8C\u6210\uFF1AR \u65E2\u6709\u5411\u91CF\u91CD\u7528":"\u5F85\u5B8C\u6210\uFF1AE \u65B0 embedding",p.current?`${k?p.preparing?"\u6E96\u5099\u7D22\u5F15":"\u76EE\u524D\u7D22\u5F15":"\u6700\u5F8C\u7D22\u5F15"}${p.jid?` \xB7 ${p.jid}`:""}`:""].filter(Boolean).join(" \xB7 "),E=p.activeTotal>0?Math.min(100,100*p.activeProcessed/p.activeTotal):0,T=p.total>0?Math.min(100,100*p.reused/p.total):0,H=p.total>0?Math.min(100,100*p.embedded/p.total):0,G=p.kind==="reuse"&&!p.currentComplete,Y=p.kind==="embed"&&!p.currentComplete;return`<td class="judgment-month index-month index-month-are is-${p.status}${k?" is-active":""}" title="${r(L)}"${k?' aria-current="true"':""}><span class="index-month-number">${h}</span><span class="index-month-blocks" aria-hidden="true"><span class="index-month-block is-active" style="--fill:${E.toFixed(1)}%"></span><span class="index-month-block is-reuse${G?" is-incomplete":""}" style="--fill:${G?"0.0":T.toFixed(1)}%"></span><span class="index-month-block is-embed${Y?" is-incomplete":""}" style="--fill:${Y?"0.0":H.toFixed(1)}%"></span></span></td>`}).join("");return`<tr><th scope="row">${r(d)}</th>${c}</tr>`}).join("");return`<div class="judgment-months index-months">
    <div class="judgment-months-meta">
      <span class="badge badge-ok" title="A\uFF1A\u4E0A\u4E00\u500B\u6B63\u5F0F\u7248\u672C\u7684\u65E2\u6709\u8986\u84CB\uFF0C\u4E0D\u5217\u5165\u65B0\u7248\u672C\u5B8C\u6210\u6578">A \u57FA\u7DDA ${u(i.active)}</span>
      <span class="badge badge-reuse" title="R \u5B8C\u6210\uFF1A\u65B0\u7248\u672C\u5DF2\u5B8C\u6210\u4E14\u8A72\u6708\u5168\u90E8\u6CBF\u7528\u65E2\u6709\u5411\u91CF">R \u5B8C\u6210 ${u(i.reuseComplete)}</span>
      <span class="badge badge-reuse-outline" title="R \u672A\u5B8C\u6210\uFF1A\u8A72\u6708\u4ECD\u9700\u6216\u6B63\u5728\u9032\u884C\u65E2\u6709\u5411\u91CF\u91CD\u7528">R \u672A\u5B8C\u6210 ${u(i.reuseIncomplete)}</span>
      <span class="badge badge-embed" title="E \u5B8C\u6210\uFF1A\u65B0\u7248\u672C\u5DF2\u5B8C\u6210\u4E14\u8A72\u6708\u5305\u542B\u65B0 embedding">E \u5B8C\u6210 ${u(i.embedComplete)}</span>
      <span class="badge badge-embed-outline" title="E \u672A\u5B8C\u6210\uFF1A\u8A72\u6708\u4ECD\u9700\u6216\u6B63\u5728\u9032\u884C\u65B0 embedding">E \u672A\u5B8C\u6210 ${u(i.embedIncomplete)}</span>
      <span class="muted">\u5171 ${u(n.size)} \u500B\u6708</span>
    </div>
    <div class="index-month-are-key" aria-label="\u7D22\u5F15\u6708\u4EFD\u65B9\u683C\u5716\u4F8B">
      <span><i class="is-active"></i>A \xB7 \u4E0A\u4E00\u500B\u6B63\u5F0F\u7248\u672C\u65E2\u6709\u8986\u84CB\uFF0C\u4E0D\u5217\u5165\u672C\u6B21\u65B0\u7248\u672C\u5B8C\u6210\u6578</span>
      <span><i class="is-reuse"></i>R \xB7 \u672C\u6B21\u6CBF\u7528\u65E2\u6709\u5411\u91CF\uFF0C\u4E0D\u91CD\u65B0\u8A08\u7B97 embedding</span>
      <span><i class="is-embed"></i>E \xB7 \u672C\u6B21\u91CD\u65B0\u8A08\u7B97 embedding \u7684\u65B0\u589E\u6216\u8B8A\u66F4\u5411\u91CF</span>
      <span><i class="is-outline"></i>\u7A7A\u5FC3\u6846 \xB7 \u8A72\u6708 R\uFF0FE \u5C1A\u672A\u5B8C\u6210</span>
    </div>
    <div class="judgment-months-scroll">
      <table class="judgment-months-table index-months-table">
        <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(d,c)=>`<th scope="col">${c+1}</th>`).join("")}</tr></thead>
        <tbody>${l}</tbody>
      </table>
    </div>
    <p class="judgment-months-hint">\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\u70BA A\uFF08\u4E0A\u4E00\u500B\u6B63\u5F0F\u7248\u672C\u65E2\u6709\u8986\u84CB\uFF09\u3001R\uFF08\u91CD\u7528\u5411\u91CF\uFF09\u3001E\uFF08\u65B0 embedding\uFF09\u3002A \u4E0D\u5217\u5165\u65B0\u7248\u672C\u5B8C\u6210\u6578\uFF0CR\uFF0FE \u624D\u662F\u672C\u6B21\u5EFA\u7F6E\u9032\u5EA6\uFF1B\u586B\u6EFF\u8868\u793A\u5B8C\u6210\uFF0C\u7A7A\u5FC3\u6846\u8868\u793A\u8A72\u6708 R\uFF0FE \u5C1A\u672A\u5B8C\u6210\u3002\u7DA0\u8272\uFF1A\u65B0\u7248\u672C\u5B8C\u6210\u6216 active \u57FA\u7DDA\uFF1B\u7070\u8272\uFF1A\u5C1A\u672A\u958B\u59CB\uFF1B\u7D05\u8272\uFF1A\u65B0\u7248\u672C\u8655\u7406\u4E2D\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u65B0\u7248\u672C\u8207 active \u7B46\u6578\u3001\u4F86\u6E90\u6A94\u6848\u8207\u76EE\u524D\u6848\u865F\u3002</p>
  </div>`}function Kc(e){let t=e.import_timeline||{},s=Array.isArray(t.months)?t.months:[];if(!s.length)return`<section class="report-card processing-card import-files-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("table",14)}\u532F\u5165\u6A94\u6848\u6642\u9593\u8868</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u5C1A\u672A\u53D6\u5F97\u5224\u6C7A\u4E0B\u8F09 manifest \u6216\u672C\u6A5F\u58D3\u7E2E\u6A94\uFF1B\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u5F8C\u6703\u986F\u793A\u6708\u4EFD\u72C0\u614B\u3002</div>
    </section>`;let a=new Map(s.map($=>[String($.month),$])),n=[...new Set(s.map($=>$.year))].sort(($,h)=>h-$),i=s.find($=>$.active),o=t.stage_summary||{},l=n.map($=>{let h=Array.from({length:12},(g,p)=>{let w=p+1,k=`${$}${String(w).padStart(2,"0")}`;return qc(t,a.get(k),$,w)}).join("");return`<tr><th scope="row">${r($)}</th>${h}</tr>`}).join(""),d=t.summary||{},c=t.stage_labels||{},v=i?`<div class="index-current-row">${$i({activeMonth:t.active_month||String(i.month||""),activeArchive:t.active_archive||i.active_archive||"",activePhase:t.active_phase||"",processingMonth:t.processing_month||"",processingArchive:t.processing_archive||"",stageLabels:c})}</div>`:"";return`<section class="report-card processing-card import-files-card" data-import-timeline="judgment">
    <div class="side-card-head">
      <span class="side-card-title">${m("table",14)}\u532F\u5165\u6A94\u6848\u6642\u9593\u8868</span>
      <span class="badge badge-neutral">${u(t.total_months||s.length)} \u500B\u6708</span>
    </div>
    <div class="judgment-months index-months">
      <div class="judgment-months-meta">
        <span class="badge badge-ok">\u5B8C\u6210 ${u(o.complete||0)}</span>
        <span class="badge badge-danger">\u672A\u5B8C\u6210 ${u(o.incomplete||0)}</span>
        <span class="badge badge-neutral">\u8655\u7406\u4E2D ${u(o.processing||0)}</span>
        <span class="badge badge-info">\u6709\u66F4\u65B0 ${u(d.gray||0)}</span>
        <span class="muted">\u5171 ${u(t.total_months||s.length)} \u500B\u6708</span>
      </div>
      ${v}
      <div class="judgment-months-scroll">
        <table class="judgment-months-table import-months-table processing-months-table">
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},($,h)=>`<th scope="col">${h+1}</th>`).join("")}</tr></thead>
          <tbody>${l}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\uFF1ARAR \u6AA2\u67E5\uFF0F\u89E3\u58D3\u7E2E\u3001\u539F\u59CB\u8CC7\u6599\u6AA2\u67E5\uFF0FParquet \u5099\u4EFD\u3001\u91D1\u878D\u6CD5\u898F\u7BE9\u9078\u3001PostgreSQL metadata\u3002\u539F\u59CB\u8CC7\u6599\u968E\u6BB5\u6703\u5148\u6AA2\u67E5\u65E2\u6709 Parquet\uFF0C\u53EF\u6CBF\u7528\u6642\u4E0D\u91CD\u65B0\u5099\u4EFD\uFF1B\u7F3A\u5C11\u6642\u6703\u986F\u793A\u300C\u5EFA\u7ACB YYYY-MM \u5099\u4EFD\u300D\uFF0C\u5B8C\u6210\u5F8C\u986F\u793A\u300C\u5DF2\u5EFA\u7ACB\u5099\u4EFD\u300D\u3002\u7BE9\u9078\u8207 PostgreSQL \u968E\u6BB5\u6703\u986F\u793A\u76EE\u524D\u8655\u7406\u7684\u6708\u4EFD\u8207 archive\u3002\u7DA0\u8272\uFF1A\u5DF2\u5B8C\u6210\uFF08\u542B\u5148\u524D run \u5DF2\u532F\u5165\u3001\u672C\u6B21\u5C1A\u672A\u91CD\u8DD1\uFF09\uFF1B\u7D05\u8272\uFF1A\u5C1A\u672A\u5B8C\u6210\u6216\u672C\u6B21\u6709\u5F85\u532F\u5165\u6A94\u6848\uFF1B\u7070\u8272\uFF1A\u672C\u6B21\u8655\u7406\u4E2D\uFF1B\u7A7A\u767D\uFF1A\u7121\u8CC7\u6599\u3002\u9EDE\u9078\u7D05\u8272\u968E\u6BB5\u53EF\u56DE\u5230\u5224\u6C7A\u532F\u5165\u6D41\u7A0B\u3002</p>
    </div>
  </section>`}function Yc(e,t,s){let n=[t.run_id||e.active_run?.id||e.last_run?.id||"",t.version_id??"",t.collection||"",t.started_at||""].join("|"),i=Date.now(),o=di.get(n);if(!o){let h=Date.parse(t.started_at||""),g=Date.parse(t.finished_at||""),p=Date.parse(t.updated_at||"");t.run_status!=="running"&&Number.isFinite(h)&&(Number.isFinite(g)||Number.isFinite(p))?o={at:h,indexed:0}:o={at:i,indexed:Math.max(0,s)},di.set(n,o)}let l=Date.parse(t.finished_at||""),d=Date.parse(t.updated_at||""),c=t.run_status==="running"?i:Number.isFinite(l)?l:Number.isFinite(d)?d:i,v=Math.max(0,(c-Number(o.at||0))/1e3),$=Math.max(0,Number(s)-Number(o.indexed||0));return v<=0||$<=0?0:$/v}function Xc(e){let t=e.index_runtime||{};if(!t.available)return`<section class="report-card processing-card index-runtime-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("cloud",14)}Ollama \u9023\u7DDA\u6E2C\u8A66</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A\u6E2C\u8A66\u7684\u4E3B\u6A5F\u3001\u6A21\u578B\u8207\u9078\u7528\u7D50\u679C\u3002</div>
    </section>`;let s=!!t.coverage_only,a=t.embedding||{},n=Array.isArray(a.hosts)?a.hosts:[],i=a.selected||{},o=a.active||{},l=t.current||{},d=t.summary||{},c=Number(d.indexed??l.indexed??0),v=s?0:Yc(e,t,c),$=s?"":`<span class="badge badge-neutral index-runtime-rate" title="\u81EA\u672C\u6B21\u9801\u9762\u958B\u59CB\u89C0\u5BDF\u7684\u7D2F\u8A08\u5E73\u5747\uFF1B\u4E2D\u9014\u52A0\u5165\u4EE5\u9996\u6B21\u89C0\u5BDF\u6642\u9593\u8207\u7B46\u6578\u70BA\u57FA\u6E96\u3002\u5F8C\u6BB5\u82E5\u4EE5\u65B0 embedding \u70BA\u4E3B\uFF0C\u901F\u5EA6\u6703\u4E0B\u964D\u3002">\u672C\u6B21\u5E73\u5747 ${v>0?`${v.toFixed(1)} \u7B46/\u79D2`:"\u2014"}</span>`,h=i.url||"",g=o.url||"",p=n.map(L=>Vc(L,h)).join(""),w=t.run_status==="running"?l.preparing?"\u6E96\u5099\u4E2D":"\u76EE\u524D\u8655\u7406":"\u6700\u5F8C\u8655\u7406",k=l.jid?`<div class="index-current-row">
        <span class="badge badge-info">${m("activity",11)}${w}</span>
        <strong class="mono">${r(xa(l.month))}</strong>
        <span class="mono">${r(l.archive||"\u2014")}</span>
        <span class="mono">${r(l.jid||"\u2014")}</span>
        <span class="index-current-copy">${r([l.court,l.title].filter(Boolean).join(" \xB7 ")||"\u2014")}</span>
        <span class="faint">${l.preparing?"\u6E96\u5099\u4E2D":`\u6279\u6B21 ${u(l.batch_size)} \u7B46`}</span>
      </div>`:"";return`<section class="report-card processing-card index-runtime-card"${s?" hidden":""}>
    <div class="side-card-head">
      <span class="side-card-title">${m("cloud",14)}Ollama \u9023\u7DDA\u6E2C\u8A66</span>
      ${ut(a.status||"idle")}
    </div>
    ${t.error?`<div class="processing-update-notice index-runtime-error">${m("alert",13)}<span>${r(t.error)}</span></div>`:""}
    <div class="index-selected-host">
      <span class="faint">\u6700\u5F8C\u9078\u7528</span>
      <strong class="mono">${r(i.url||"\u2014")}</strong>
      <span>${r(i.model||a.model||"\u2014")}</span>
      <span class="mono">port ${r(i.port??"\u2014")}</span>
      ${g&&g!==h?`<span class="badge badge-warn">\u76EE\u524D\u4F7F\u7528 ${r(g)}</span>`:""}
      ${o.using_fallback?'<span class="badge badge-warn">\u5DF2\u5207\u63DB\u5099\u63F4</span>':""}
    </div>
    <div class="index-host-list">${p||'<div class="processing-workflow-empty">\u6C92\u6709\u53EF\u986F\u793A\u7684\u4E3B\u6A5F\u6E2C\u8A66\u7D50\u679C\u3002</div>'}</div>
    ${a.tested_at?`<div class="index-runtime-foot">\u6E2C\u8A66\u6642\u9593 ${r(qe(a.tested_at))}</div>`:""}
  </section>
  <section class="report-card processing-card index-files-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("table",14)}\u7D22\u5F15\u6A94\u6848\u6642\u9593\u8868</span>
      <span class="index-runtime-counts">
        <span class="badge badge-neutral">${u(d.indexed)} / ${u(d.total)} \u7B46</span>
        ${$}
      </span>
    </div>
    <div class="index-runtime-summary">
      <span>\u7248\u672C <strong class="mono">v${r(t.version_id??"\u2014")}</strong></span>
      <span>Collection <code>${r(t.collection||"\u2014")}</code></span>
      <span>\u6A21\u5F0F <strong>${r(t.build_mode||"\u2014")}</strong></span>
      ${s?"":`<span>\u91CD\u7528 <strong class="mono">${u(d.reused)}</strong></span>
            <span>\u65B0 embedding <strong class="mono">${u(d.embedded)}</strong></span>`}
    </div>
    ${k}
    ${Wc(t)}
    ${s?'<p class="judgment-months-hint index-coverage-note">\u76EE\u524D\u986F\u793A active collection \u7684\u6708\u4EFD\u7D22\u5F15\u8986\u84CB\uFF1B\u57F7\u884C Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u5F8C\u6703\u986F\u793A\u672C\u6B21 Ollama \u6E2C\u8A66\u8207\u5373\u6642\u9032\u5EA6\u3002</p>':""}
  </section>`}function Zc(e={}){let{storage:t,loading:s,error:a}=e;if(a)return`<section class="report-card processing-card index-storage-card">
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
    </section>`;let n=t.qdrant_storage||{},o=(Array.isArray(t.databases)?t.databases:[]).find(v=>v.id==="qdrant")||{},l=n.volume_bytes??o.volume_bytes??null,d=n.points_count??o.points_count,c=n.segments_count??o.segments_count;return`<section class="report-card processing-card index-storage-card">
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
      <span>Volume \u5BB9\u91CF</span><strong class="mono">${Ne(l)}${n.volume_size?` \xB7 ${r(n.volume_size)}`:""}</strong>
      <span>Volume \u4F86\u6E90\u8DEF\u5F91</span><strong class="mono index-storage-path">${r(n.host_path||"\u2014")}</strong>
      <span>Collection</span><strong class="mono">${r(n.collection||o.collection||"\u2014")}</strong>
      <span>Alias</span><strong class="mono">${r(n.alias||"\u2014")}</strong>
      <span>Points\uFF0FSegments</span><strong class="mono">${u(d)} / ${u(c)}</strong>
    </div>
    <div class="index-runtime-foot">\u8CC7\u6599\u6642\u9593 ${r(qe(t.checked_at))}</div>
  </section>`}function Ln({badge:e="",lead:t="",rows:s=[],note:a=""}){return`<section class="report-card processing-card parquet-help-card workflow-help-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("info",14)}\u529F\u80FD\u8AAA\u660E</span>
      ${e?`<span class="badge badge-neutral">${r(e)}</span>`:""}
    </div>
    <div class="parquet-help-body">
      <p class="parquet-help-lead">${t}</p>
      <div class="parquet-help-grid">${s.map(([n,i])=>`<span>${r(n)}</span><strong>${i}</strong>`).join("")}</div>
      ${a?`<p class="parquet-help-note">${a}</p>`:""}
    </div>
  </section>`}function ed(){return Ln({badge:"\u552F\u8B80\u532F\u51FA",lead:"\u5C07 PostgreSQL \u76EE\u524D\u6709\u6548\u7684\u5224\u6C7A\uFF08<code>judgment_documents.is_current = true</code>\uFF09\u532F\u51FA\u6210\u7368\u7ACB\u7684 Parquet \u5FEB\u7167\uFF0C\u4F9B\u96E2\u7DDA\u5206\u6790\u3001\u8CC7\u6599\u4EA4\u63DB\u6216\u4FDD\u5B58\u3002",rows:[["\u4F86\u6E90","PostgreSQL <code>judgment_documents</code>\uFF0C\u53EA\u542B\u76EE\u524D\u6709\u6548\u4E14\u5DF2\u547D\u4E2D\u91D1\u878D\u6CD5\u898F\u6E05\u55AE\u7684\u5224\u6C7A\u3002"],["\u8F38\u51FA",'<span class="mono">JUDGMENT_DATA_DIR/parquet/judgments/YYYYMMDD/HHMMSS-xxxxxxxx/judgments.parquet</span>'],["\u9644\u5E36\u6A94",'<span class="mono">\u540C\u76EE\u9304 manifest.json\uFF08\u7B46\u6578\u3001\u6A94\u6848\u5927\u5C0F\u3001\u6B04\u4F4D\u3001\u7522\u751F\u6642\u9593\uFF09</span>'],["\u5167\u5BB9","\u6848\u865F\u3001\u6CD5\u9662\u3001\u6848\u7531\u3001\u5168\u6587\u3001\u547D\u4E2D\u6CD5\u898F\u3001\u5F15\u7528\u3001\u4F86\u6E90\u58D3\u7E2E\u6A94\u8207\u6642\u9593\u6B04\u4F4D\uFF1B<code>citations</code> \u4EE5 JSON \u5B57\u4E32\u4FDD\u5B58\u3002"],["\u8207\u539F\u59CB Parquet","\u8CC7\u6599\u9801\u8207 <code>source=parquet</code> \u4F7F\u7528 <code>parquet/raw_judgments/.../raw.parquet</code>\uFF1B\u672C\u6D41\u7A0B\u7684 <code>parquet/judgments/...</code> \u662F\u53E6\u4E00\u500B\u6B63\u898F\u5316\u5FEB\u7167\u3002"],["\u4E0D\u6703","\u4E0D\u5BEB\u56DE PostgreSQL\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u820A\u5FEB\u7167\uFF1B\u53EA\u532F\u51FA current \u8CC7\u6599\uFF0C\u4E0D\u542B\u6B77\u53F2\u7248\u672C\u3002"],["\u4E2D\u65B7","\u6BCF\u6B21\u57F7\u884C\u5EFA\u7ACB\u65B0\u7684\u5B8C\u6574\u5FEB\u7167\uFF1B\u4E2D\u65B7\u5F8C\u91CD\u65B0\u57F7\u884C\u4E0D\u6703\u7E8C\u5BEB\u540C\u4E00\u500B Parquet \u6A94\u3002"]],note:"\u9069\u5408 DuckDB\u3001pandas\u3001Spark \u7B49\u96E2\u7DDA\u5206\u6790\uFF0C\u6216\u9700\u8981\u56FA\u5B9A\u6642\u9593\u9EDE\u7684\u53EF\u91CD\u73FE\u8CC7\u6599\u5FEB\u7167\u3002\u65E5\u5E38 RAG \u67E5\u8A62\u8207\u8CC7\u6599\u9801\u700F\u89BD\u4E0D\u9700\u8981\u57F7\u884C\u6B64\u6D41\u7A0B\u3002"})}function td(){return Ln({badge:"PostgreSQL \u56DE\u586B",lead:"\u5C07\u5224\u6C7A\u7684 <code>court</code> \u8F49\u6210\u6A19\u6E96\u6CD5\u9662\u540D\u7A31\u4E26\u5BEB\u5165 <code>court_normalized</code>\uFF1B\u539F\u59CB <code>court</code> \u6703\u4FDD\u7559\u4F9B\u8FFD\u6EAF\u3002",rows:[["\u8655\u7406\u7BC4\u570D","\u9810\u8A2D\u53EA\u8655\u7406 <code>court_normalized</code> \u70BA\u7A7A\u7684\u8CC7\u6599\uFF1B\u5DF2\u6B63\u898F\u5316\u8CC7\u6599\u6703\u8DF3\u904E\uFF0C\u53EF\u7528 <code>--all</code> \u91CD\u65B0\u8A08\u7B97\u5168\u90E8\u3002"],["\u89E3\u6790\u9806\u5E8F","\u539F\u59CB\u6CD5\u9662\u503C\u958B\u982D\u7B26\u5408\u6A19\u6E96\u540D\u7A31 \u2192 \u5224\u6C7A\u5168\u6587\u524D 8,000 \u5B57\u6700\u65E9\u51FA\u73FE\u7684\u6CD5\u9662 \u2192 \u539F\u59CB\u6CD5\u9662\u503C\u4EFB\u610F\u4F4D\u7F6E\u7684\u6A19\u6E96\u540D\u7A31 \u2192 JID \u5B98\u65B9\u6CD5\u9662\u4EE3\u78BC\u3002"],["\u8F38\u51FA","\u5BEB\u5165 <code>judgment_documents.court_normalized</code>\uFF1B\u4E0D\u4FEE\u6539\u539F\u59CB <code>court</code>\u3001\u5168\u6587\u6216\u5176\u4ED6\u5224\u6C7A\u6B04\u4F4D\u3002"],["\u672A\u89E3\u6790","\u7121\u6CD5\u5224\u65B7\u6642\u4FDD\u7559\u7A7A\u503C\uFF0C\u4E0D\u731C\u6E2C\uFF1B\u6458\u8981\u6703\u5217\u51FA\u672A\u89E3\u6790\u7B46\u6578\u8207\u5E38\u898B\u6A23\u672C\u3002"],["\u5F71\u97FF","\u8CC7\u6599\u9801\u7684\u6CD5\u9662\u4E0B\u62C9\u3001\u7CBE\u78BA\u7BE9\u9078\u3001\u6392\u5E8F\u3001\u7D50\u679C\u6B04\u4F4D\u8207\u5224\u6C7A\u539F\u6587\u4F7F\u7528\u6B63\u898F\u5316\u540D\u7A31\uFF1BAPI \u4ECD\u56DE\u50B3 <code>court_raw</code>\u3002"],["\u4E0D\u6703","\u4E0D\u91CD\u65B0\u532F\u5165\u5224\u6C7A\u3001\u4E0D\u6539\u5168\u6587\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u8CC7\u6599\u3002"],["\u91CD\u8DD1","\u9810\u8A2D\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u898F\u5247\u66F4\u65B0\u5F8C\u53EF\u7528 <code>--all</code> \u91CD\u7B97\uFF0C\u6216\u5148\u7528 <code>--dry-run</code> \u7D71\u8A08\u3002"]],note:"\u9069\u5408\u5728\u5224\u6C7A\u532F\u5165\u5F8C\u3001\u6CD5\u9662\u540D\u7A31\u898F\u5247\u66F4\u65B0\u5F8C\uFF0C\u6216\u8CC7\u6599\u9801\u6CD5\u9662\u9078\u9805\u51FA\u73FE\u7F3A\u6F0F\u6642\u57F7\u884C\u3002\u7D50\u679C\u4E5F\u6703\u5BEB\u5165\u6548\u80FD\u7D00\u9304\u3002"})}function sd(){return Ln({badge:"\u689D\u6587\u6B77\u53F2\u5EFA\u6A94",lead:"\u70BA\u65E2\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u5EFA\u7ACB <code>law_article_versions</code> \u6B77\u53F2\u689D\u6587\u5FEB\u7167\u8207 <code>law_article_change_events</code> \u8B8A\u66F4\u7D00\u9304\uFF0C\u8B93\u8CC7\u6599\u9801\u80FD\u5207\u63DB\u6B77\u53F2\u7248\u672C\u4E26\u67E5\u770B\u689D\u6587\u5DEE\u7570\u3002",rows:[["\u4F86\u6E90","PostgreSQL \u6CD5\u898F\u7248\u672C\uFF0C\u4EE5\u53CA <code>LAW_DATA_DIR/raw_parquet</code> \u5167\u5C0D\u61C9\u7684\u539F\u59CB\u6CD5\u898F Parquet \u5FEB\u7167\u3002"],["\u5339\u914D\u65B9\u5F0F","\u4EE5 raw Parquet manifest \u7684 <code>zip_sha256</code>\uFF0F<code>raw_json_sha256</code> \u5C0D\u61C9\u6CD5\u898F\u7248\u672C\uFF0C\u4E0D\u731C\u6E2C\u5167\u5BB9\u3002"],["\u7522\u751F\u5167\u5BB9","<code>article_key</code>\uFF08\u689D\u6587\u985E\u578B\uFF0B\u689D\u865F\uFF09\u3001<code>content_hash</code>\u3001\u689D\u6587\u5168\u6587\u8207\u751F\u6548\u65E5\uFF1B\u8207\u524D\u4E00\u7248\u672C\u6BD4\u8F03\u5F8C\u8A18\u9304 <code>added</code>\uFF0F<code>modified</code>\uFF0F<code>removed</code>\u3002"],["\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB","\u5206\u9801\u4E0A\u65B9\u7684\u552F\u8B80\u6AA2\u67E5\u6703\u8B80\u53D6 <code>law_article_versions</code> \u8207\u539F\u59CB Parquet\uFF0C\u5224\u65B7\u7248\u672C\u662F\u5426\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\uFF1B\u6AA2\u67E5\u672C\u8EAB\u4E0D\u6703\u4FEE\u6539\u8CC7\u6599\u5EAB\u3002"],["\u53EF\u5EFA\u7ACB","\u627E\u5230\u5C0D\u61C9\u539F\u59CB Parquet \u7684\u7248\u672C\uFF0C\u53EF\u76F4\u63A5\u57F7\u884C\u6B64\u6D41\u7A0B\u5EFA\u7ACB\u689D\u6587\u6B77\u53F2\u3002"],["\u7F3A\u539F\u59CB\u6A94","\u627E\u4E0D\u5230\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u6A19\u793A\u7121\u6CD5\u5EFA\u7ACB\uFF0C\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD\uFF1B\u6B64\u6D41\u7A0B\u6703\u8DF3\u904E\u4E26\u5217\u5728 <code>missing_versions</code>\u3002"],["\u6AA2\u67E5\u7D50\u679C","\u5E74\u4EFD\xD7\u6708\u4EFD\u8868\u986F\u793A\u5DF2\u5EFA\u7ACB\uFF0F\u672A\u5EFA\u7ACB\uFF0F\u90E8\u5206\u5EFA\u7ACB\uFF1B\u4E0B\u65B9\u5217\u51FA\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3001\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u7248\u672C\u65E5\u671F\u8207\u53EF\u5EFA\u7ACB\u72C0\u614B\u3002\u76EE\u524D\u72C0\u614B\u4EE5\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u5361\u7247\u5373\u6642\u986F\u793A\u3002"],["\u8DF3\u904E\u689D\u4EF6","\u5DF2\u6709\u689D\u6587\u5FEB\u7167\u7684\u7248\u672C\u6703\u8DF3\u904E\uFF1B\u627E\u4E0D\u5230\u53EF\u8B80\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u5217\u5165 <code>missing_versions</code>\uFF0C\u4E0D\u5EFA\u7ACB\u865B\u69CB\u689D\u6587\u3002"],["\u4E0D\u6703","\u4E0D\u4E0B\u8F09\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u4E0D\u89E3\u6790\u65B0 ZIP\u3001\u4E0D\u4FEE\u6539 <code>law_documents</code> \u6216\u76EE\u524D\u7248\u672C\u3001\u4E0D\u66F4\u65B0 Qdrant\uFF0FIndexedDB\u3002"],["\u8F38\u51FA\u6458\u8981","\u7248\u672C\u6578\u3001\u8DF3\u904E\u7248\u672C\u6578\u3001\u7F3A\u5C11\u5FEB\u7167\u7248\u672C\u3001\u5BEB\u5165\u689D\u6587\u6578\u8207\u689D\u6587\u8B8A\u66F4\u4E8B\u4EF6\u6578\u3002"],["\u91CD\u8DD1","\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u5DF2\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u4E0D\u6703\u91CD\u8907\u63D2\u5165\u3002"]],note:"\u9069\u5408\u5F9E\u820A\u7248 schema \u5347\u7D1A\u3001\u65E2\u6709\u6CD5\u898F\u7248\u672C\u7F3A\u5C11\u6B77\u53F2\u689D\u6587\uFF0C\u6216\u8CC7\u6599\u9801\u6B77\u53F2\u689D\u6587\u7248\u672C\u8207\u8B8A\u66F4\u7D00\u9304\u4E0D\u5B8C\u6574\u6642\u57F7\u884C\u3002\u57F7\u884C\u524D\u53EF\u5148\u7528\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u78BA\u8A8D\u54EA\u4E9B\u7248\u672C\u53EF\u5EFA\u7ACB\u3001\u54EA\u4E9B\u7F3A\u539F\u59CB\u6A94\u3002"})}function ad(e={}){let t=e.courtCheck,s=!!e.courtCheckLoading,a=e.courtCheckError,n=`<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-court-check"${s?" disabled":""}>${m("refresh",12)}<span>${s?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31"}</span></button>`;if(a)return`<section class="report-card processing-card court-check-card">
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
    </section>`;let d={green:"\u5DF2\u6AA2\u67E5",red:"\u9700\u6B63\u898F\u5316\uFF08\u5B8C\u5168\u672A\u6AA2\u67E5\uFF09",gray:"\u9700\u6B63\u898F\u5316"},c=new Map(i.map(h=>[String(h.month),h])),$=[...new Set(i.map(h=>h.year))].sort((h,g)=>g-h).map(h=>{let g=Array.from({length:12},(p,w)=>{let k=w+1,L=`${h}${String(k).padStart(2,"0")}`,E=c.get(L);if(!E)return`<td class="judgment-month is-empty"><span>${k}</span></td>`;let T=d[E.status]?E.status:"red",H=[`${h}-${String(k).padStart(2,"0")}`,d[T],`\u7E3D ${u(E.total)} \u7B46`,`\u5DF2\u6AA2\u67E5 ${u(E.checked)} \u7B46`,`\u672A\u6AA2\u67E5 ${u(E.unchecked)} \u7B46`,E.invalid?`\u7121\u6548\u503C ${u(E.invalid)} \u7B46`:"",`\u6709\u6548 ${zt(E.percent)}`].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month court-check-month is-${T==="gray"?"red":T}" title="${r(H)}"><span>${k}</span></td>`}).join("");return`<tr><th scope="row">${r(h)}</th>${g}</tr>`}).join("");return`<section class="report-card processing-card court-check-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("search",14)}\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31</span>
      ${n}
    </div>
    <div class="judgment-months">
      <div class="judgment-months-meta">
        <span class="badge badge-ok">\u5DF2\u6AA2\u67E5 ${u(o.green||0)}</span>
        <span class="badge badge-danger">\u9700\u6B63\u898F\u5316 ${u((o.red||0)+(o.gray||0))}</span>
        <span class="muted">\u5171 ${u(i.length)} \u500B\u6708</span>
      </div>
      <div class="index-runtime-summary">
        <span>\u5224\u6C7A\u7E3D\u6578 <strong class="mono">${u(l.total)}</strong></span>
        <span>\u5DF2\u6AA2\u67E5 <strong class="mono">${u(l.checked)}</strong></span>
        <span>\u672A\u6AA2\u67E5 <strong class="mono">${u(l.unchecked)}</strong></span>
        <span>\u7121\u6548\u503C <strong class="mono">${u(l.invalid)}</strong></span>
        <span>\u6709\u6548 <strong class="mono">${u(l.valid)}</strong></span>
      </div>
      <div class="judgment-months-scroll">
        <table class="judgment-months-table court-check-months-table">
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(h,g)=>`<th scope="col">${g+1}</th>`).join("")}</tr></thead>
          <tbody>${$}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u5168\u90E8\u5DF2\u6B63\u898F\u5316\uFF1B\u7D05\u8272\uFF1A\u9700\u6B63\u898F\u5316\uFF08\u542B\u5B8C\u5168\u672A\u6AA2\u67E5\u3001\u90E8\u5206\u672A\u6B63\u898F\u5316\u6216\u7121\u6548\u503C\uFF09\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u8CC7\u6599\u3002summary \u7684\u7D05\u8272\u6578\u5B57\u70BA\u9700\u6B63\u898F\u5316\u6708\u4EFD\u6578\uFF1B\u4E0B\u65B9\u660E\u7D30\u4ECD\u4FDD\u7559\u672A\u6AA2\u67E5\u8207\u7121\u6548\u503C\u7B46\u6578\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u8A73\u7D30\u7B46\u6578\u8207\u6709\u6548\u6BD4\u4F8B\u3002</p>
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${r(qe(t.checked_at))} \xB7 \u6A19\u6E96\u6CD5\u9662\u540D\u7A31 ${u(t.canonical_count)} \u500B</div>
    </div>
  </section>`}function nd(e={}){let t=e.lawVersionCheck,s=!!e.lawVersionCheckLoading,a=e.lawVersionCheckError,n=`<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-law-version-check"${s?" disabled":""}>${m("refresh",12)}<span>${s?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB"}</span></button>`;if(a)return`<section class="report-card processing-card law-version-card">
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
    </section>`;let d={green:"\u5DF2\u5EFA\u7ACB",red:"\u672A\u5EFA\u7ACB",gray:"\u90E8\u5206\u5EFA\u7ACB"},c=new Map(i.map(J=>[String(J.month),J])),$=[...new Set(i.map(J=>J.year))].sort((J,B)=>B-J).map(J=>{let B=Array.from({length:12},(S,C)=>{let ne=C+1,ge=`${J}${String(ne).padStart(2,"0")}`,V=c.get(ge);if(!V)return`<td class="judgment-month is-empty"><span>${ne}</span></td>`;let Z=d[V.status]?V.status:"red",ae=[`${J}-${String(ne).padStart(2,"0")}`,d[Z],`\u7248\u672C ${u(V.version_count)}\uFF08\u6CD5\u898F ${u(V.law_versions)}\uFF0F\u547D\u4EE4 ${u(V.order_versions)}\uFF09`,`\u5DF2\u5EFA\u7ACB ${u(V.backfilled_count)}`,`\u672A\u5EFA\u7ACB ${u(V.missing_count)}`,`\u9700\u5EFA\u7ACB ${u(V.needs_backfill_count)}\uFF08\u53EF\u5EFA\u7ACB ${u(V.backfillable_count)}\uFF0F\u7F3A\u539F\u59CB\u6A94 ${u(V.blocked_count)}\uFF09`,`\u689D\u6587\u5217 ${u(V.article_rows)} / \u9810\u671F ${u(V.article_count)}`,V.current?"\u76EE\u524D\u7248\u672C":"",V.versions?.length?`\u7248\u672C ${V.versions.map(ee=>`#${ee.version_id}`).join("\u3001")}`:""].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month law-version-month is-${Z}${V.current?" is-current":""}" title="${r(ae)}"><span>${ne}</span></td>`}).join("");return`<tr><th scope="row">${r(J)}</th>${B}</tr>`}).join(""),h={law:"\u6CD5\u898F",order:"\u547D\u4EE4"},g=i.flatMap(J=>(J.versions||[]).filter(B=>B.needs_backfill).map(B=>({...B,month:J.month}))).sort((J,B)=>B.version_id-J.version_id),p=g.slice(0,20),w=p.map(J=>{let B=J.backfillable?"badge-info":J.blocked?"badge-danger":"badge-neutral",S=J.backfillable?"\u53EF\u5EFA\u7ACB":J.blocked?"\u7F3A\u539F\u59CB\u6A94":"\u5F85\u6AA2\u67E5";return`<div class="law-backfill-needed-row">
        <strong class="mono">#${J.version_id}</strong>
        <span class="badge ${B}">${S}</span>
        <span>${r(h[J.source_type]||J.source_type||"\u2014")}</span>
        <span class="mono">${r(J.update_date||J.month||"\u2014")}</span>
        <span class="law-backfill-needed-reason">${r(J.reason||"\u2014")}</span>
      </div>`}).join(""),k=g.length?`<div class="law-backfill-needed">
        <div class="law-backfill-needed-head">\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C <span class="badge badge-warn">${u(g.length)}</span></div>
        <div class="law-backfill-needed-list">${w}</div>
        ${g.length>p.length?`<div class="law-backfill-needed-more">\u53E6\u6709 ${u(g.length-p.length)} \u500B\u7248\u672C\u672A\u5217\u51FA</div>`:""}
      </div>`:'<div class="law-backfill-needed is-clear">\u76EE\u524D\u6C92\u6709\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3002</div>',L=Number(l.needs_backfill_versions)||0,E=Number(l.backfillable_versions)||0,T=Number(l.blocked_versions)||0,H=Number(l.backfilled_versions)||0,G=Number(l.versions)||0,Y=L<=0?"ok":T>0?"danger":"warn",ye=L<=0?"\u4E0D\u9700\u8981\u5EFA\u7ACB":"\u9700\u8981\u5EFA\u7ACB",Ae=L>0?`\u9700\u8981\u5EFA\u7ACB ${u(L)} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF1A\u53EF\u5EFA\u7ACB ${u(E)}\u3001\u7F3A\u539F\u59CB\u6A94 ${u(T)}\u3002\u5DF2\u6709\u6B77\u53F2\u689D\u6587 ${u(H)} \u500B\u7248\u672C${T>0?"\uFF1B\u7F3A\u539F\u59CB\u6A94\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD":""}\u3002`:`\u76EE\u524D ${u(G)} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`;return`<section class="report-card processing-card law-version-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
      ${n}
    </div>
    <div class="law-version-check-status is-${Y}" role="status" aria-live="polite">
      <span class="badge badge-${Y}">${ye}</span>
      <span>${r(Ae)}</span>
    </div>
    <div class="judgment-months">
      <div class="judgment-months-meta">
        <span class="badge badge-ok">\u5DF2\u5EFA\u7ACB ${u(o.green||0)}</span>
        <span class="badge badge-danger">\u672A\u5EFA\u7ACB ${u(o.red||0)}</span>
        <span class="badge badge-neutral">\u90E8\u5206\u5EFA\u7ACB ${u(o.gray||0)}</span>
        <span class="muted">\u5171 ${u(i.length)} \u500B\u6708</span>
      </div>
      <div class="index-runtime-summary">
        <span>\u7248\u672C\u6578 <strong class="mono">${u(l.versions)}</strong></span>
        <span>\u5DF2\u5EFA\u7ACB\u7248\u672C <strong class="mono">${u(l.backfilled_versions)}</strong></span>
        <span>\u672A\u5EFA\u7ACB\u7248\u672C <strong class="mono">${u(l.missing_versions)}</strong></span>
        <span>\u9700\u5EFA\u7ACB\u7248\u672C <strong class="mono">${u(l.needs_backfill_versions)}</strong></span>
        <span>\u53EF\u5EFA\u7ACB <strong class="mono">${u(l.backfillable_versions)}</strong></span>
        <span>\u7F3A\u539F\u59CB\u6A94 <strong class="mono">${u(l.blocked_versions)}</strong></span>
        <span>\u689D\u6587\u5217 <strong class="mono">${u(l.article_rows)}</strong></span>
        <span>\u9810\u671F\u689D\u6587 <strong class="mono">${u(l.article_count)}</strong></span>
        <span>\u6CD5\u898F\u7B46\u6578 <strong class="mono">${u(l.law_count)}</strong></span>
      </div>
      <div class="judgment-months-scroll">
        <table class="judgment-months-table law-version-months-table">
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(J,B)=>`<th scope="col">${B+1}</th>`).join("")}</tr></thead>
          <tbody>${$}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u8A72\u6708\u4EFD\u6240\u6709\u7248\u672C\u90FD\u6709\u6B77\u53F2\u689D\u6587\uFF1B\u7D05\u8272\uFF1A\u5B8C\u5168\u672A\u5EFA\u7ACB\uFF1B\u7070\u8272\uFF1A\u90E8\u5206\u7248\u672C\u5DF2\u5EFA\u7ACB\uFF1B\u5916\u6846\uFF1A\u76EE\u524D\u7248\u672C\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u7248\u672C\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u7248\u672C\u6578\u3001\u6CD5\u898F\uFF0F\u547D\u4EE4\u6578\u8207\u689D\u6587\u5217\u3002</p>
      ${k}
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${r(qe(t.checked_at))}</div>
    </div>
  </section>`}function rd(){return`<div class="processing-ollama-loading">
    <span class="spinner" aria-hidden="true"></span>
    <span>\u6B63\u5728\u6AA2\u67E5 Ollama \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span>
  </div>`}function id(e,t,s){let a=Array.isArray(e?.hosts)?e.hosts:[];if(s&&!a.length)return`${Ee({tone:"danger",title:"Ollama \u4E3B\u6A5F\u8B80\u53D6\u5931\u6557",text:r(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
    <div class="processing-ollama-empty">
      <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh-ollama">
        ${m("refresh",13)}<span>\u91CD\u65B0\u6AA2\u67E5</span>
      </button>
    </div>`;if(!a.length)return t?rd():'<div class="processing-ollama-empty">\u5C1A\u672A\u8A2D\u5B9A Ollama \u4E3B\u6A5F\uFF1B\u8ACB\u5230\u300C\u7CFB\u7D71\u72C0\u614B \u2192 Model Provider\u300D\u65B0\u589E\u4E26\u9023\u63A5\u6A21\u578B\u3002</div>';let n=a.map((o,l)=>{let d=o.status==="operational",c=Array.isArray(o.models)?o.models:[],v=c.length?c.map(h=>`<span class="processing-ollama-model ${d?"is-online":"is-offline"}">${r(h.name||"")}</span>`).join(""):'<span class="processing-ollama-model is-offline">\u6C92\u6709\u53EF\u7528\u6A21\u578B</span>',$=[o.embedding_model?`<span class="processing-ollama-role ${d?"is-online":"is-offline"}">\u5D4C\u5165 \xB7 ${r(o.embedding_model)}</span>`:'<span class="processing-ollama-role is-offline">\u672A\u8A2D\u5B9A\u5D4C\u5165\u6A21\u578B</span>',o.chat_model?`<span class="processing-ollama-role is-offline">\u804A\u5929 \xB7 ${r(o.chat_model)}</span>`:""].filter(Boolean).join("");return`<article class="processing-ollama-host ${d?"is-online":"is-offline"}" data-ollama-host data-host-id="${Number(o.id)}">
        <span class="processing-ollama-handle" aria-hidden="true">${m("grid",14)}</span>
        <span class="processing-ollama-rank">${l+1}</span>
        <div class="processing-ollama-main">
          <div class="processing-ollama-title">
            <strong>${r(o.name||o.base_url||`\u4E3B\u6A5F #${o.id}`)}</strong>
            <span class="processing-ollama-status">${d?"\u53EF\u7528":"\u7121\u6CD5\u9023\u7DDA"}</span>
          </div>
          <span class="processing-ollama-url mono">${r(o.base_url||"\u2014")}</span>
          <div class="processing-ollama-models">${v}</div>
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
      <span>\u5171 ${u(a.length)} \u53F0\u4E3B\u6A5F</span>
      <span>\u7B2C\u4E00\u512A\u5148\uFF1A<strong>${r(i)}</strong></span>
      <span class="muted">${t?"\u91CD\u65B0\u6AA2\u67E5\u4E2D\u2026":"\u6BCF 30 \u79D2\u81EA\u52D5\u6AA2\u67E5"}</span>
    </div>
    <div class="processing-ollama-list" data-ollama-list>${n}</div>
    <p class="processing-ollama-hint">\u62D6\u79FB\u6216\u4F7F\u7528\u7BAD\u982D\u8ABF\u6574 embedding \u512A\u5148\u9806\u5E8F\uFF1B\u76EE\u524D\u4E3B\u6A5F\u7121\u6CD5\u4F7F\u7528\u6642\uFF0C\u6703\u4F9D\u5E8F\u81EA\u52D5\u6539\u7528\u4E0B\u4E00\u53F0\uFF08\u5404\u53F0\u9700\u5177\u5099\u76F8\u540C\u7684 embedding \u6A21\u578B\uFF09\uFF0C\u76F4\u5230\u6709\u4E3B\u6A5F\u56DE\u50B3\u5411\u91CF\u3002</p>`}function od(e,t={}){let s=e.active_run||null,a=s||e.last_run||null,n=Tt===e.id,i=!!s||n,o=!!e.can_run&&!i,l=i?"\u6B64\u6D41\u7A0B\u6B63\u5728\u57F7\u884C\u4E2D\u3002":e.start_blocked_reason||"\u76EE\u524D\u6709\u5176\u4ED6\u8655\u7406\u7A0B\u5E8F\u57F7\u884C\u4E2D\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",d=Array.isArray(e.command)?e.command.join(" "):"",c=Number(e.update_count)||e.update_available&&Number(e.pending_count)||0,v=e.update_origin||"\u66F4\u65B0\u5075\u6E2C",$=e.update_mechanism||"\u65E2\u6709\u66F4\u65B0\u6AA2\u67E5\u7D00\u9304",h=e.update_message||e.update_status&&e.update_status.message||"\u627E\u5230\u53EF\u66F4\u65B0\u5167\u5BB9\u3002",g=e.update_status&&e.update_status.checked_at?qe(e.update_status.checked_at):"",p=e.progress||{},w=Array.isArray(p.stages)?p.stages:[],k=String(p.active_stage||""),L=w.find(Y=>String(Y.key||"")===k),E=(e.index_runtime&&e.index_runtime.current?e.index_runtime.current.month:"")||"",T=E?xa(E):L&&(L.label||L.key)||"",H=n&&!s?"\u555F\u52D5\u4E2D":"\u57F7\u884C\u4E2D",G=`<section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${m(wi[e.id]||"terminal",14)}\u57F7\u884C\u8CC7\u8A0A</span>
        <span class="badge badge-neutral badge-mono">${r(e.branch||"")}</span>
      </div>
      <div class="processing-workflow-command-grid">
        <span>\u7A0B\u5F0F</span><code>${r(e.program||"\u2014")}</code>
        <span>Shell\uFF0F\u5165\u53E3</span><code>${r(e.script||"\u2014")}</code>
        <span>\u5BE6\u969B\u547D\u4EE4</span><code class="processing-workflow-command">${r(d||"\u2014")}</code>
      </div>
      ${Sn.has(e.id)?'<div class="processing-embedding-strip-slot" data-processing-embedding-strip data-preserve-children></div>':""}
      <div class="processing-workflow-actions">
        <button class="btn btn-primary btn-sm" type="button"
          data-processing-action="run-workflow"
          data-workflow-id="${r(e.id)}"
          ${o?"":"disabled"}
          ${o?"":`title="${r(l)}"`}>
          ${i?'<span class="spinner" aria-hidden="true"></span>':m("play",14)}<span>${i?H:"\u57F7\u884C\u6B64\u6D41\u7A0B"}</span>
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
              <span class="badge badge-info">${m("activity",11)}${H}</span>
              ${s&&s.id?`<span class="mono">${r(s.id)}</span>`:""}
              ${s&&s.started_at?`<span>\u958B\u59CB ${r(qe(s.started_at))}</span>`:""}
              ${T?`<span>\u76EE\u524D\u8655\u7406 <strong class="mono">${r(T)}</strong></span>`:""}
            </div>`:""}
      <div class="side-card-foot">
        \u57F7\u884C\u7D50\u679C\u6703\u5BEB\u5165\u5171\u7528\u8655\u7406\u72C0\u614B\u6A94\uFF0C\u53EF\u5F9E\u8655\u7406\u7E3D\u89BD\u67E5\u770B\u3002
      </div>
    </section>`;return`<div class="processing-workflow-panel">
    ${Ee({tone:"info",title:e.label,text:e.description||""})}
    ${e.update_available?`<div class="processing-update-notice" role="status">
            <span class="processing-update-notice-icon">${m("refresh",14)}</span>
            <span class="processing-update-notice-copy">
              <strong>${r(v)}\u5075\u6E2C\u5230\u53EF\u66F4\u65B0\u5167\u5BB9</strong>
              <span class="processing-update-mechanism">\u5075\u6E2C\u6A5F\u5236\uFF1A${r($)}${g?` \xB7 \u6AA2\u67E5\u6642\u9593 ${r(g)}`:""}</span>
              <span class="processing-update-message">${r(h)}</span>
            </span>
            ${c>0?`<span class="badge badge-warn badge-mono">${m("refresh",10)}${u(c)}</span>`:'<span class="badge badge-warn">\u53EF\u66F4\u65B0</span>'}
          </div>`:""}
    ${e.id==="legal_index_versions"?xc(e.index_timelines):""}
    ${e.id==="normalize_courts"?G:""}
    ${e.id==="normalize_courts"?ad(t):""}
    ${e.id==="backfill_law_articles"?nd(t):""}
    ${e.id!=="normalize_courts"?G:""}
    ${Jc(e)}
    ${e.id==="judgment_parquet"?ed():""}
    ${e.id==="normalize_courts"?td():""}
    ${e.id==="backfill_law_articles"?sd():""}
    ${e.id==="judgment_import"?Kc(e):""}
    ${e.id==="index_versions"?Xc(e):""}
    ${e.id==="index_versions"?Zc(t):""}
    ${e.id==="judgment_download"?`<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${m("calendar",14)}\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B</span>
              <button class="btn btn-ghost btn-sm" type="button" title="\u91CD\u65B0\u6383\u63CF raw_rar \u76EE\u9304\u8207\u6708\u4EFD\u72C0\u614B" data-processing-action="refresh-judgment-months">${m("refresh",13)}<span>\u91CD\u65B0\u6574\u7406</span></button>
            </div>
            <div data-judgment-months-slot data-preserve-children>${Mn()}</div>
          </section>`:""}
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("history",14)}\u6700\u8FD1\u57F7\u884C</span>
        ${ut(a?.status||"idle")}
      </div>
      ${Rc(a)}
    </section>
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("history",14)}\u57F7\u884C\u7D00\u9304</span>
        <span class="badge badge-neutral">\u6700\u8FD1 ${u((e.recent_runs||[]).length)} \u7B46</span>
      </div>
      ${zc(e.recent_runs)}
    </section>
    ${["law_download","order_download","judgment_download"].includes(e.id)?`<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${m("search",14)}\u7248\u672C\u6AA2\u67E5\u7D00\u9304</span>
              <span class="badge badge-neutral">\u6700\u8FD1 ${u((e.update_history||[]).length)} \u7B46</span>
            </div>
            ${Hc(e)}
          </section>`:""}
  </div>`}function ka(e,t,s={},a=new Set){if(t==="overview")return bi(e,a);let i=(Array.isArray(e.workflows)?e.workflows:[]).find(o=>o.id===t);return i?od(i,s):bi(e,a)}async function ld(e){e.innerHTML=`<section class="page processing-page">
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
  </section>`;let t=e.querySelector(".processing-page"),s=e.querySelector("#processing-root"),a=e.querySelector("#processing-workflows"),n=e.querySelector("#processing-stop"),i=document.createElement("div");i.className="processing-stage-tooltip",i.hidden=!0,t.appendChild(i),jt=new Map;let o=!1,l=!1,d=!1,c=null,v="",$="",h="overview",g=null,p=!1,w=null,k=null,L=!1,E=null,T=0,H=null,G=!1,Y=null,ye=0,Ae=null,J=!1,B=null,S=0,C=null,ne=!1,ge=null,V=0,Z=!1,ae=null,ee=!1,_e=!1,z="",be=new Set,Me=null,pe=null,tt=-1,Oe="",He=0,Le=0,Qe=null,Ye=[],ft=()=>({storage:k,loading:L,error:E,courtCheck:H,courtCheckLoading:G,courtCheckError:Y,lawVersionCheck:Ae,lawVersionCheckLoading:J,lawVersionCheckError:B}),N=()=>{if(h!=="judgment_download")return;let b=s.querySelector(".processing-workflow-panel");if(!b)return;b.querySelectorAll(".judgment-month.is-active").forEach(De=>{De.classList.remove("is-active"),De.removeAttribute("aria-current")});let y=b.querySelector("[data-judgment-progress]");if(!y)return;let P=g?.progress,le=!!(c?.workflows||[]).find(De=>De.id==="judgment_download")?.active_run;if((!P||P.active===!1)&&!le){y.hidden=!0,y.classList.remove("is-indeterminate");return}if(y.hidden=!1,!P||P.active===!1){let De=y.querySelector("[data-judgment-progress-phase]");De&&(De.textContent="\u6E96\u5099\u4E2D");let bt=y.querySelector("[data-judgment-progress-month]");bt&&(bt.textContent="\u2014");let Pe=y.querySelector("[data-judgment-progress-filename]");Pe&&(Pe.textContent="\u7B49\u5F85\u4E0B\u8F09\u7A0B\u5E8F\u56DE\u5831\u9032\u5EA6\u2026",Pe.title=""),y.classList.add("is-indeterminate");let ht=y.querySelector("[data-judgment-progress-bar]");ht&&(ht.style.width="");let Ue=y.querySelector("[data-judgment-progress-percent]");Ue&&(Ue.textContent="\u2014");let $t=y.querySelector("[data-judgment-progress-size]");$t&&($t.textContent="\u2014");let xt=y.querySelector("[data-judgment-progress-note]");xt&&(xt.textContent="\u5DF2\u555F\u52D5\uFF0C\u7B49\u5F85\u9032\u5EA6\u56DE\u5831");return}let re={preparing:"\u6E96\u5099\u4E2D",scanning:"\u6383\u63CF\u4E2D",checking:"\u6AA2\u67E5\u4E2D",downloading:"\u4E0B\u8F09\u4E2D",saving:"\u5132\u5B58\u4E2D",finalizing:"\u6574\u7406\u4E2D"}[P.phase]||"\u8655\u7406\u4E2D",ue=y.querySelector("[data-judgment-progress-phase]");ue&&(ue.textContent=re);let oe=P.month||"",he=y.querySelector("[data-judgment-progress-month]");he&&(he.textContent=oe||"\u2014");let Te=P.filename||"",we=y.querySelector("[data-judgment-progress-filename]");if(we&&(we.textContent=Te||"\u2014",we.title=Te),oe){let De=b.querySelector(`[data-judgment-month-key="${oe}"]`);De&&(De.classList.add("is-active"),De.setAttribute("aria-current","true"))}let f=Number(P.bytes_written),R=Number(P.total_bytes),O=Number.isFinite(R)&&R>0,te=null,fe=P.percent;fe!=null&&fe!==""&&Number.isFinite(Number(fe))?te=Number(fe):O&&Number.isFinite(f)&&(te=f/R*100);let xe=te===null;y.classList.toggle("is-indeterminate",xe);let Ge=y.querySelector("[data-judgment-progress-bar]");Ge&&(Ge.style.width=xe?"":`${Math.min(100,Math.max(0,te)).toFixed(1)}%`);let Ce=y.querySelector("[data-judgment-progress-percent]");if(Ce){let De=xe?null:Math.min(100,Math.max(0,te));Ce.textContent=De===null?"\u2014":`${De.toFixed(De>=10?0:1)}%`}let at=y.querySelector("[data-judgment-progress-size]");if(at){let De=Number.isFinite(f)&&f>0?Ne(f):"\u2014";at.textContent=O?`${De} / ${Ne(R)}`:De}let lt=y.querySelector("[data-judgment-progress-note]");if(lt){let De=[],bt=Number(P.candidate_index),Pe=Number(P.candidate_total);Number.isFinite(bt)&&bt>0&&Number.isFinite(Pe)&&Pe>0&&De.push(`\u7B2C ${u(bt)} / ${u(Pe)} \u500B\u6708`),P.fileset_id&&De.push(`fileset ${P.fileset_id}`),P.message&&P.phase!=="downloading"&&De.push(String(P.message)),lt.textContent=De.join(" \xB7 ")}},D=()=>{if(h!=="judgment_download")return;let b=s.querySelector("[data-judgment-months-slot]");if(b){let y=Array.isArray(g?.months)?g.months:[];w&&!g?(b.innerHTML=Ee({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:r(w)}),delete b.dataset.judgmentMonthCount):g?b.dataset.judgmentMonthCount!==String(y.length)?(b.innerHTML=Dc(g),b.dataset.judgmentMonthCount=String(y.length)):Fc(b,g):(b.querySelector(".judgment-months-loading")||(b.innerHTML=Mn()),delete b.dataset.judgmentMonthCount)}N()},x=()=>{let b=Array.isArray(C?.hosts)?C.hosts:[];return JSON.stringify({loading:!b.length&&ne,error:!b.length&&ge?ge.message||String(ge):"",active:C?.active_host_id??null,hosts:b.map(y=>({id:y.id,name:y.name,url:y.base_url,status:y.status,detail:y.detail,embedding:y.embedding_model,chat:y.chat_model,models:(y.models||[]).map(P=>P.name)}))})},j=()=>{let b=s.querySelector("[data-processing-ollama]");if(!b||V)return;let y=x();b.dataset.ollamaSignature!==y&&(b.dataset.ollamaSignature=y,b.innerHTML=id(C,ne,C?null:ge))},W=()=>{let y=((c?.sections||[]).find(P=>P.key==="legal")?.stages||[]).find(P=>P.key==="legal_qdrant");return String(y?.model?.label||"")},F=()=>{let b=s.querySelector("[data-processing-embedding-strip]");if(!b)return;let y=Array.isArray(C?.hosts)?C.hosts:[],P=[];for(let oe of y)if(oe.status==="operational")for(let he of oe.models||[])Array.isArray(he.capabilities)&&he.capabilities.includes("embedding")&&P.push({hostId:Number(oe.id),model:he.name,label:`${oe.name||oe.base_url||`\u4E3B\u6A5F ${oe.id}`}:${he.name}`,baseUrl:oe.base_url||""});let de=W(),le=y.find(oe=>Number(oe.id)===Number(C?.active_host_id)),se=P.map(oe=>{let he=oe.label===de;return`<button class="rag-model-button${he?" is-active":""}" type="button"
        data-processing-action="select-embedding-model"
        data-host-id="${oe.hostId}"
        data-model="${r(oe.model)}"
        title="${r(oe.label)}"
        aria-pressed="${he?"true":"false"}"
        ${_e?"disabled":""}>
        <span class="rag-model-state" aria-hidden="true"></span>
        <span>${r(oe.label)}</span>
        ${he?'<span class="rag-model-current">\u4F7F\u7528\u4E2D</span>':""}
      </button>`});de&&!P.some(oe=>oe.label===de)&&se.unshift(`<button class="rag-model-button is-active is-static" type="button" aria-pressed="true" disabled>
          <span class="rag-model-state" aria-hidden="true"></span>
          <span>${r(de)}</span>
          <span class="rag-model-current">\u4F7F\u7528\u4E2D</span>
        </button>`);let re=P.length?`<div class="rag-model-buttons">${se.join("")}</div>`:`<p class="rag-model-empty">${ne?"\u8B80\u53D6\u7DDA\u4E0A\u4E3B\u6A5F\u8207 Embedding model\u2026":ge?`\u7121\u6CD5\u8B80\u53D6\u7DDA\u4E0A\u4E3B\u6A5F\uFF1A${r(ge.message||String(ge))}`:"\u76EE\u524D\u6C92\u6709\u53EF\u7528\u7684 Embedding model\u3002"}</p>`,ue=`<div class="processing-embedding-strip rag-model-strip">
      <div class="rag-model-strip-head">
        <span class="rag-model-strip-title">${m("brain",13)} Embedding \u4E3B\u6A5F\uFF0F\u6A21\u578B</span>
        ${le?.base_url?`<span class="rag-model-strip-base mono">${r(le.base_url)}</span>`:""}
        <span class="rag-model-strip-current">\u76EE\u524D\uFF1A<strong>${r(de||"\u2014")}</strong></span>
        <button class="btn btn-ghost btn-sm rag-model-refresh" type="button"
          data-processing-action="refresh-embedding-models"
          ${ne?"disabled":""}>
          ${m("refresh",12)}<span>\u6AA2\u67E5\u6A21\u578B</span>
        </button>
      </div>
      ${re}
      <p class="rag-model-hint">\u9EDE\u9078 <span class="mono">\u4E3B\u6A5F:\u6A21\u578B</span> \u5207\u63DB Embedding\uFF1B\u9078\u53D6\u5F8C\u6703\u6210\u70BA\u7B2C\u4E00\u512A\u5148\uFF0C\u5176\u4ED6\u4E3B\u6A5F\u4F9D\u5E8F\u4F5C\u70BA\u5099\u63F4\u3002\u5207\u63DB\u6A21\u578B\u5F8C\u65E2\u6709\u7D22\u5F15\u53EF\u80FD\u9700\u8981\u91CD\u5EFA\u3002</p>
    </div>`;b.innerHTML!==ue&&(b.innerHTML=ue)},Ie=b=>{let y=s.querySelector('[data-import-timeline="judgment"]');if(!y)return;let P=String(b?.active_month||""),de=String(b?.processing_month||"");y.querySelectorAll(".processing-month").forEach(Te=>{let we=!!P&&Te.dataset.month===P;Te.classList.toggle("is-current",we),Te.classList.toggle("is-processing-current",!!de&&Te.dataset.month===de),we?Te.setAttribute("aria-current","true"):Te.removeAttribute("aria-current")});let le=y.querySelector(".index-current-row");if(!P||!b?.active_archive){le&&le.remove();return}let se=c?.workflows?.find(Te=>Te.id==="judgment_import")?.import_timeline?.stage_labels||{},re=$i({activeMonth:P,activeArchive:b.active_archive,activePhase:b.active_phase||"",processingMonth:b.processing_month||"",processingArchive:b.processing_archive||"",stageLabels:se});if(le){le.innerHTML=re;return}let ue=y.querySelector(".judgment-months");if(!ue)return;let oe=document.createElement("div");oe.className="index-current-row",oe.innerHTML=re;let he=ue.querySelector(".judgment-months-meta");he?he.insertAdjacentElement("afterend",oe):ue.prepend(oe)},Re=b=>{let y=Number(b?.state_mtime_ns);return Number.isFinite(y)?y:-1},Be=b=>{let y=String(b?.active_month||"");return/^\d{6}$/.test(y)?Number(y):-1},kt=b=>{if(!b)return;let y=Re(b);if(y>=0&&y<tt){pe?.active_month&&Ie(pe);return}y>=0&&(tt=y);let P=String(b.active_month||"");if(!!(b.run_id&&b.run_id===pe?.run_id)&&Be(b)>=0&&Be(b)<Be(pe)){let le={...b,active_month:pe.active_month,active_archive:pe.active_archive};pe=le,Ie(le);return}if(!P&&b.run_status==="running"){pe?.active_month&&pe?.run_id===b.run_id?Ie(pe):(pe=b,Ie(b));return}pe=b,Ie(b)},nt=b=>{let y=b?.active_import;if(y){kt(y);return}pe?.active_month&&Ie(pe)},St=()=>{o||Me||(Me=wt(["processing","judgment-download","system-usage","ollama","court-check","law-version-check"],(b,y)=>{if(!o){if(b==="processing"){y?.snapshot?.live?qs(y.snapshot):y?.snapshot?Fe(y.snapshot,{silent:!0}):Ct({silent:!0});return}if(b==="judgment-download"){h==="judgment_download"&&At({quiet:!0,payload:y?.snapshot||null});return}if(b==="system-usage"){h==="index_versions"&&Vt({quiet:!0,force:!0,payload:y?.snapshot||null});return}if(b==="ollama"){Sn.has(h)&&rt({quiet:!0,payload:y?.snapshot||null});return}if(b==="court-check"){h==="normalize_courts"&&_({quiet:!0,force:!0,payload:y?.snapshot||null});return}b==="law-version-check"&&h==="backfill_law_articles"&&q({quiet:!0,force:!0,payload:y?.snapshot||null})}},{onProgress:(b,y)=>{if(b!=="processing")return;let P=y?.event;P&&et(P)},onError:()=>{c||Ct({silent:!0})}}))},st=()=>{Me&&(Me(),Me=null)},Rt=async b=>{if(_e)return;let[y,...P]=String(b||"").split("|"),de=Number(y),le=P.join("|");if(!de||!le){F();return}let se=(C?.hosts||[]).find(ue=>Number(ue.id)===de);if(!se){F();return}let re=`${se.name||se.base_url||`\u4E3B\u6A5F ${se.id}`}:${le}`;if(re===W()){F();return}if(!window.confirm(`\u5207\u63DB Embedding \u70BA ${re}\uFF1F

\u5207\u63DB\u6A21\u578B\u5F8C\uFF0C\u65E2\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u8207\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u53EF\u80FD\u4E0D\u76F8\u5BB9\uFF0C\u9700\u8981\u91CD\u65B0\u5EFA\u7ACB\u7D22\u5F15\u3002`)){F();return}_e=!0,F();try{await U.selectOllamaModel(de,{model:le,role:"embedding"});let ue=(C?.hosts||[]).map(he=>Number(he.id)),oe=[de,...ue.filter(he=>he!==de)];await U.reorderOllamaHosts(oe),M(`\u5DF2\u5207\u63DB Embedding \u70BA ${re}\u3002`,"ok",6e3),C=null,await rt({quiet:!0}),await Ct({silent:!0})}catch(ue){M(ue.message||"\u7121\u6CD5\u5207\u63DB Embedding model\u3002","danger",7e3),await rt({quiet:!0})}finally{_e=!1,F()}},rt=async({quiet:b=!1,button:y=null,payload:P=null}={})=>{if(!(o||ne)){ne=!0,ge=null,C||(j(),F()),y&&ke(y,!0,"\u6AA2\u67E5\u4E2D\u2026");try{let de=P||await U.ollamaHosts();if(o)return;C=de}catch(de){if(o)return;ge=de,b||M(de.message||"\u7121\u6CD5\u6AA2\u67E5 Ollama \u4E3B\u6A5F\u3002","danger",6e3)}finally{o||(ne=!1,y&&ke(y,!1),j(),F())}}},Xe=async b=>{if(ee)return;let y=(C?.hosts||[]).map(se=>Number(se.id)),P=b.map(se=>Number(se));if(!P.length||P.length!==y.length||P.every((se,re)=>se===y[re])){j();return}ee=!0;let de=new Map((C?.hosts||[]).map(se=>[Number(se.id),se])),le=P.map(se=>de.get(se)).filter(Boolean);if(C&&le.length===y.length){C={...C,hosts:le,active_host_id:P[0]};let se=s.querySelector("[data-processing-ollama]");se&&(se.dataset.ollamaSignature=""),j()}try{await U.reorderOllamaHosts(P),M("\u5DF2\u66F4\u65B0 Ollama \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","ok",3500)}catch(se){M(se.message||"\u7121\u6CD5\u66F4\u65B0 Ollama \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","danger",6e3),await rt({quiet:!0})}finally{ee=!1}},Jt=()=>{let b=s.querySelector("[data-processing-ollama]");b&&(b.dataset.ollamaSignature=""),j()},X=()=>{let b=ae;if(!b)return;if(s.querySelector(`[data-ollama-host][data-host-id="${b.hostId}"]`)?.classList.remove("is-dragging"),b.captureTarget?.hasPointerCapture?.(b.pointerId))try{b.captureTarget.releasePointerCapture(b.pointerId)}catch{}document.documentElement.classList.remove("processing-ollama-dragging"),window.removeEventListener("pointermove",$e),window.removeEventListener("pointerup",ze),window.removeEventListener("pointercancel",Ve),ae=null,V=0},$e=b=>{let y=ae;if(!y||b.pointerId!==y.pointerId)return;if(!y.dragging){if(Math.hypot(b.clientX-y.startX,b.clientY-y.startY)<5)return;y.dragging=!0,V=y.hostId,Z=!1,s.querySelector(`[data-ollama-host][data-host-id="${y.hostId}"]`)?.classList.add("is-dragging"),document.documentElement.classList.add("processing-ollama-dragging")}b.preventDefault();let P=64;b.clientY<P?window.scrollBy(0,-12):b.clientY>window.innerHeight-P&&window.scrollBy(0,12);let de=s.querySelector("[data-ollama-list]"),le=document.elementFromPoint(b.clientX,b.clientY)?.closest?.("[data-ollama-host]");if(!de||!le||!de.contains(le))return;let se=de.querySelector(`[data-ollama-host][data-host-id="${y.hostId}"]`);if(!se||se===le)return;let re=le.getBoundingClientRect(),ue=b.clientY>re.top+re.height/2;de.insertBefore(se,ue?le.nextSibling:le),Z=!0},ze=b=>{let y=ae;if(!y||b.pointerId!==y.pointerId)return;let P=y.dragging,de=Z,le=s.querySelector("[data-ollama-list]"),se=P&&le?[...le.querySelectorAll("[data-ollama-host]")].map(re=>Number(re.dataset.hostId)):[];X(),P&&de&&se.length&&Xe(se)},Ve=()=>{let b=!!ae?.dragging;X(),b&&Jt()},Nt=b=>{if(b.button!==0||b.pointerType==="mouse"&&b.buttons!==1||ee||ae)return;let y=b.target.closest("[data-ollama-host]");if(!y||!s.contains(y)||b.target.closest("button")||b.pointerType==="touch"&&!b.target.closest(".processing-ollama-handle"))return;let P=Number(y.dataset.hostId)||0;if(P){b.preventDefault(),V=P,ae={hostId:P,pointerId:b.pointerId,startX:b.clientX,startY:b.clientY,dragging:!1,captureTarget:y};try{y.setPointerCapture(b.pointerId)}catch{}window.addEventListener("pointermove",$e,{passive:!1}),window.addEventListener("pointerup",ze),window.addEventListener("pointercancel",Ve)}},At=async({quiet:b=!1,payload:y=null}={})=>{if(!p){p=!0,!g&&h==="judgment_download"&&D();try{g=y||await U.judgmentDownloadStatus(),w=null}catch(P){w=P.message||"\u8B80\u53D6\u6708\u4EFD\u72C0\u614B\u5931\u6557\u3002",b||M(w,"danger",7e3)}finally{p=!1,h==="judgment_download"&&D()}}},Vt=async({quiet:b=!0,force:y=!1,payload:P=null}={})=>{if(!L&&!(!y&&k&&Date.now()-T<3e4)){L=!0;try{k=P||await U.systemUsage(),E=null,T=Date.now()}catch(de){E=de.message||"\u7121\u6CD5\u53D6\u5F97 Qdrant \u5BB9\u5668\u8207 volume \u8CC7\u8A0A\u3002",b||M(E,"danger",7e3)}finally{L=!1,h==="index_versions"&&ve()}}},_=async({quiet:b=!0,force:y=!1,payload:P=null}={})=>{if(!G&&!(!y&&H&&Date.now()-ye<6e4)){G=!0;try{H=P||await U.checkCourts(),Y=null,ye=Date.now()}catch(de){Y=de.message||"\u7121\u6CD5\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31\u3002",b||M(Y,"danger",7e3)}finally{G=!1,h==="normalize_courts"&&ve()}}},q=async({quiet:b=!0,force:y=!1,button:P=null,payload:de=null}={})=>{if(!J&&!(!y&&Ae&&Date.now()-S<6e4)){J=!0,P&&ke(P,!0,"\u6AA2\u67E5\u4E2D\u2026");try{if(Ae=de||await U.checkLawVersions(),B=null,S=Date.now(),!b){let le=Ae.totals||{},se=Number(le.needs_backfill_versions)||0,re=Number(le.backfillable_versions)||0,ue=Number(le.blocked_versions)||0;se>0?M(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u9700\u8981\u5EFA\u7ACB ${se} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF08\u53EF\u5EFA\u7ACB ${re}\u3001\u7F3A\u539F\u59CB\u6A94 ${ue}\uFF09\u3002`,ue>0?"danger":"warn",7e3):M(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D ${Number(le.versions)||0} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`,"ok",5e3)}}catch(le){B=le.message||"\u7121\u6CD5\u6AA2\u67E5\u689D\u6587\u6B77\u53F2\u72C0\u614B\u3002",b||M(B,"danger",7e3)}finally{J=!1,P&&ke(P,!1)}}},A=b=>Array.from(s.querySelectorAll("[data-stage-key]")).find(y=>y.dataset.stageKey===b)||null,I=b=>{if(!b)return;be.add(b);let y=Array.from(s.querySelectorAll(".processing-wf-stage[data-processing-stage]")).find(P=>P.dataset.processingStage===b);y&&(y.open=!0,y.scrollIntoView({behavior:"smooth",block:"center"}))},Q=()=>{z&&(z="",i.hidden=!0,s.querySelectorAll("[data-stage-key]").forEach(b=>{b.classList.remove("is-stage-hovered")}))},K=b=>{let y=b.dataset.stageKey||"";if(!y)return;z=y,s.querySelectorAll("[data-stage-key]").forEach(R=>{R.classList.toggle("is-stage-hovered",R.dataset.stageKey===y)});let P=b.dataset.stageStatusKey||"idle",de=b.dataset.stageStatus||qn(P).label,le=b.dataset.stageColor||"var(--accent)",se=Number(b.dataset.stageUpdate)||0,re=Number(b.dataset.stagePending)||0,ue=b.dataset.stageContributionLabel||"\u6574\u9AD4\u5360\u6BD4";i.innerHTML=`<div class="processing-stage-tooltip-head">
      <span class="processing-stage-tooltip-swatch" style="background:${r(le)}"></span>
      <strong>${r(b.dataset.stageLabel||y)}</strong>
      ${ut(P,de)}
    </div>
    <div class="processing-stage-tooltip-meta">
      <span>\u968E\u6BB5\u9032\u5EA6 <strong>${r(b.dataset.stagePercent||"\u2014")}</strong></span>
      <span>${r(ue)} <strong>${r(b.dataset.stageContribution||"\u2014")}</strong></span>
      <span class="mono">${r(b.dataset.stageDuration||"\u2014")}</span>
    </div>
    <div class="processing-stage-tooltip-counts">${r(b.dataset.stageCounts||"\u2014")}</div>
    ${se||re?`<div class="processing-stage-tooltip-badges">
            ${se?`<span class="processing-wf-count is-update">${m("refresh",11)}<strong>${u(se)}</strong><span>\u53EF\u66F4\u65B0</span></span>`:""}
            ${re?`<span class="processing-wf-count is-pending">${m("clock",11)}<strong>${u(re)}</strong><span>\u5F85\u57F7\u884C</span></span>`:""}
          </div>`:""}
    ${b.dataset.stageMessage?`<div class="processing-stage-tooltip-message">${r(b.dataset.stageMessage)}</div>`:""}`,i.hidden=!1;let oe=Math.min(300,Math.max(220,window.innerWidth-24));i.style.width=`${oe}px`;let he=b.getBoundingClientRect(),Te=Math.min(window.innerWidth-oe-12,Math.max(12,he.left)),we=he.top-i.offsetHeight-10,f=we>=12?we:Math.min(window.innerHeight-i.offsetHeight-12,he.bottom+10);i.style.left=`${Te}px`,i.style.top=`${Math.max(12,f)}px`},ce=b=>{if(b.target.closest(".is-failure-tip")){Q();return}if(b.target.closest(".processing-wf-rail"))return;let y=b.target.closest("[data-stage-key]");!y||!s.contains(y)||y.contains(b.relatedTarget)||K(y)},Se=b=>{let y=b.target.closest("[data-stage-key]");if(!y||!s.contains(y)||y.contains(b.relatedTarget))return;let P=b.relatedTarget?.closest?.("[data-stage-key]");P&&P.dataset.stageKey===y.dataset.stageKey||Q()},je=b=>{let y=b.capabilities||{};!d&&n&&(n.hidden=!y.can_stop_update)},ve=()=>{if(!c)return;let b=ka(c,h,ft(),be);b!==v&&(is(s,b),v=b),D(),j(),F(),nt(c)},Fe=(b,{silent:y=!1}={})=>{if(o||!b)return;let P=Date.parse(b.generated_at||""),de=Date.parse(c?.generated_at||"");if(Number.isFinite(P)&&Number.isFinite(de)&&P<de)return;if(Tt){let oe=(b.workflows||[]).find(Te=>Te.id===Tt),he=oe?.active_run?.id||oe?.last_run?.id||"";(oe?.active_run||he&&he!==ps)&&(Tt="",ps="")}c=b;let le=new Map;for(let oe of b.sections||[])for(let he of oe.stages||[])le.set(`${oe.key}-${he.key}`,he);for(let[oe,he]of jt){if(he.kind!=="upgrade")continue;let Te=le.get(oe);if(Te){if(Te.phase==="failed"||Te.phase==="running"&&Te.percent!==null){jt.delete(oe);continue}if(Te.phase==="completed"){let we=Date.parse(Te.last_run?.started_at||"");Number.isFinite(we)&&we>=Number(he.startedAt||0)-1e3&&jt.delete(oe)}}}let se=kn(b,h);se!==$&&(is(a,se),$=se);let re=ka(b,h,ft(),be);if(re!==v&&(is(s,re),v=re),D(),j(),z){let oe=A(z);oe?K(oe):Q()}let ue=s.querySelector("[data-processing-updated-at]");if(ue){let oe=qe(b.generated_at);ue.textContent!==oe&&(ue.textContent=oe)}if(je(b),F(),nt(b),!C&&!ne&&rt({quiet:!0}),Ye.length){let oe=Ye.splice(0);for(let he of oe)et(he)}},We=b=>{if(Qe=b,typeof requestAnimationFrame>"u"){let y=Qe;Qe=null,y&&qs(y);return}Le||(Le=requestAnimationFrame(()=>{Le=0;let y=Qe;Qe=null,y&&qs(y)}))},et=b=>{if(!b)return;if(!c){Ye.push(b),Ye.length>100&&Ye.shift();return}let y=String(b.run_id||""),P=Number(b.seq)||0;if(y&&y===Oe&&P>0&&P<=He)return;y&&y!==Oe&&(Oe=y,He=0),P>0&&(He=P);let de=String(b.workflow_id||"judgment_import"),le=String(b.month||"").replace(/\D/g,"").slice(0,6),se=(c.workflows||[]).find(we=>we.id===de);if(!se)return;se.progress||(se.progress={stages:[]}),Array.isArray(se.progress.stages)||(se.progress.stages=[]);let re=String(b.stage||""),ue=re?se.progress.stages.find(we=>String(we.key)===re):null,oe=String(se.progress.run_id||"")===String(b.run_id||"");if(ue&&b.type==="stage_progress"){let we=Number(b.current),f=Number(ue.current);oe&&b.status==="running"&&Number.isFinite(we)&&Number.isFinite(f)&&we<f||(b.status&&(ue.status=String(b.status)),b.current!==void 0&&(ue.current=Number(b.current)||0),b.total!==void 0&&(ue.total=Number(b.total)||0),b.percent!==void 0&&(ue.percent=Number(b.percent)||0),b.message&&(ue.message=String(b.message)))}if(ue&&b.extra&&typeof b.extra=="object")for(let we of["financial_processed","financial_matched","financial_percent"])b.extra[we]!==void 0&&(ue[we]=Number(b.extra[we])||0);if(b.type==="stage_progress"&&b.overall_percent!==void 0){let we=Number(b.overall_percent)||0,f=Number(se.progress.overall_percent)||0;se.progress.overall_percent=oe?Math.max(f,we):we}b.type!=="run_finished"&&(se.progress.run_status="running"),(b.type==="archive_started"||b.type==="stage_progress")&&!se.active_run&&b.run_id&&(se.active_run={id:b.run_id,status:"running",started_at:b.timestamp,message:b.message||""}),b.type==="run_finished"&&(se.active_run=null,se.progress.run_status=String(b.status||"success"),se.can_run=!0);let he=[];le&&b.month_stages&&he.push({month:le,import_stages:b.month_stages,import_overall:b.month_overall||""});let Te=null;if(b.type==="archive_started"&&le){let we=Date.parse(b.timestamp||"");Te={active_month:le,active_archive:b.archive,active_phase:b.stage||"filter",processing_month:le,processing_archive:b.archive,run_id:b.run_id,run_status:"running",state_mtime_ns:Number.isFinite(we)?we*1e6:Date.now()*1e6}}else b.type==="run_finished"&&(Te={...c.active_import||{},run_status:String(b.status||"success")});We({live:!0,generated_at:b.timestamp,workflows:[{id:de,active_run:se.active_run,last_run:se.last_run,progress:se.progress,can_run:se.can_run}],import_timeline_months:he,active_import:Te})},qs=b=>{if(o||!b||!c)return;let y=new Map((b.workflows||[]).map(re=>[re.id,re]));if(Tt){let re=y.get(Tt),ue=re?.active_run?.id||re?.last_run?.id||"";(re?.active_run||ue&&ue!==ps)&&(Tt="",ps="")}for(let re of c.workflows||[]){let ue=y.get(re.id);if(ue){if("active_run"in ue&&(re.active_run=ue.active_run),"last_run"in ue&&(re.last_run=ue.last_run),Array.isArray(ue.recent_runs)&&(re.recent_runs=ue.recent_runs),"index_runtime"in ue){let oe=ue.index_runtime;oe&&!oe.active_coverage&&re.index_runtime?.active_coverage&&(oe.active_coverage=re.index_runtime.active_coverage),re.index_runtime=oe}if(ue.progress){let oe=ue.progress,he=re.progress;if(re.id==="judgment_import"&&he?.run_id&&he.run_id===oe.run_id){let Te=new Map((he.stages||[]).map(we=>[String(we.key),we]));for(let we of oe.stages||[]){let f=Te.get(String(we.key));f&&we.status==="running"&&Number(we.current)<Number(f.current)&&(we.current=f.current,we.total=f.total,we.percent=f.percent,we.message=f.message)}oe.overall_percent=Math.max(Number(he.overall_percent)||0,Number(oe.overall_percent)||0)}re.progress=oe}typeof ue.can_run=="boolean"&&(re.can_run=ue.can_run)}}let P=re=>{if(!re||!Array.isArray(b.import_timeline_months))return;let ue=new Map((re.months||[]).map(he=>[String(he.month),he]));for(let he of b.import_timeline_months){let Te=ue.get(String(he.month));Te&&(Te.import_stages={...Te.import_stages||{},...he.import_stages||{}},he.import_overall&&(Te.import_overall=he.import_overall))}let oe={complete:0,incomplete:0,processing:0,empty:0};for(let he of re.months||[]){let Te=String(he.import_overall||"empty");oe[Te]=Number(oe[Te]||0)+1}re.stage_summary=oe};P(c.import_timeline);for(let re of c.workflows||[])re.id==="judgment_import"&&P(re.import_timeline);b.active_import&&(c.active_import=b.active_import),b.mode&&(c.mode=b.mode),b.generated_at&&(c.generated_at=b.generated_at);let de=kn(c,h);de!==$&&(is(a,de),$=de);let le=ka(c,h,ft(),be);le!==v&&(is(s,le),v=le),D(),j(),F(),nt(c),je(c);let se=s.querySelector("[data-processing-updated-at]");if(se&&b.generated_at){let re=qe(b.generated_at);se.textContent!==re&&(se.textContent=re)}},Ct=async({silent:b=!1}={})=>{if(!(o||l)){l=!0;try{let y=await U.processing();Fe(y,{silent:b})}catch(y){if(o)return;let P=Tc(y.message,c);P!==v&&(is(s,P),v=P),b||M(y.message||"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B\u3002","danger",6e3)}finally{l=!1}}},Na=async(b,y="")=>{if(d)return;d=!0,ke(b,!0,"\u6AA2\u67E5\u4E2D\u2026");let P=mi[y]||"",de=String(b.dataset.sourceTypes||"").split(",").map(re=>re.trim()).filter(Boolean),le=de.length?de:P?[P]:[],se=b.dataset.stageId||"";se&&(jt.set(se,{kind:"check",phase:"updating",startedAt:Date.now()}),ve());try{let re=await U.checkUpdates(le);if(re&&re.checking)se&&(jt.delete(se),ve()),M("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u8ACB\u7A0D\u5F8C\u91CD\u65B0\u6574\u7406\u3002","info",6e3);else if(le.length===1){let ue=(re.sources||{})[le[0]]||{},oe=gi[y]||(le[0]==="judgment"?"\u5224\u6C7A":le[0]==="law"?"\u6CD5\u898F":le[0]==="order"?"\u547D\u4EE4":"\u8CC7\u6599");ue.status==="error"?M(`${oe}\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF1A${ue.message||"\u7121\u6CD5\u53D6\u5F97\u7DDA\u4E0A\u7248\u672C"}`,"danger",7e3):M(ue.update_available?`${oe}\u7DDA\u4E0A\u5DF2\u6709\u66F4\u65B0\u7248\u672C\u3002`:`${oe}\u7DDA\u4E0A\u5DF2\u662F\u6700\u65B0\u7248\u672C\u3002`,ue.update_available?"warn":"ok",6e3)}else if(le.length>1){let ue=re.sources||{},oe=le.filter(Te=>ue[Te]?.update_available),he=le.filter(Te=>ue[Te]?.status==="error");he.length?M(`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF0C\u4F46\u6709 ${he.length} \u9805\u6AA2\u67E5\u5931\u6557\u3002`,"danger",7e3):M(oe.length?`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A${oe.length} \u9805\u6709\u66F4\u65B0\u3002`:"\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D\u7686\u70BA\u6700\u65B0\u3002",oe.length?"warn":"ok",6e3)}else{let ue=Number(re.update_count)||0;M(ue>0?`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A${ue} \u9805\u6709\u66F4\u65B0\u3002`:"\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D\u7686\u70BA\u6700\u65B0\u3002",ue>0?"warn":"ok",6e3)}se&&(jt.set(se,{kind:"check",phase:"updated",startedAt:Date.now()}),ve()),window.dispatchEvent(new CustomEvent("judgment:updates-changed")),await Ct({silent:!0})}catch(re){se&&(jt.delete(se),ve()),M(re.message||"\u66F4\u65B0\u6AA2\u67E5\u5931\u6557\u3002","danger",7e3)}finally{d=!1,ke(b,!1),c&&je(c)}},As=async b=>{let y=mi[b]||"";if(!y)return!0;let P=null;try{P=await U.checkUpdates([y])}catch(le){return M(`\u7121\u6CD5\u5B8C\u6210\u7248\u672C\u6AA2\u67E5\uFF08${le.message||"\u7DB2\u8DEF\u932F\u8AA4"}\uFF09\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002`,"warn",7e3),!0}if(!P||P.checking)return P&&P.checking&&M("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002","info",6e3),!0;let de=(P.sources||{})[y];if(!de)return!0;if(window.dispatchEvent(new CustomEvent("judgment:updates-changed")),de.status==="up_to_date"&&!de.update_available){let le=gi[b]||"\u8CC7\u6599",se=de.checked_at?`\uFF08${qe(de.checked_at)} \u6AA2\u67E5\uFF09`:"",re=fc[b]||"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u55CE\uFF1F";return window.confirm(`${le}\u7DDA\u4E0A\u6AA2\u67E5\u70BA\u6700\u65B0\u7248\u672C${se}\u3002

${re}`)}return de.status==="error"&&M("\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002","warn",6e3),!0},Ea=async(b,y)=>{if(d)return;d=!0;let P=(c?.workflows||[]).find(se=>se.id===y);ps=P?.active_run?.id||P?.last_run?.id||"",Tt=y,ke(b,!0,"\u57F7\u884C\u4E2D"),ve();let de=b.dataset.stageId||"",le=!1;try{if(!await As(y))return;de&&(jt.set(de,{kind:"upgrade",phase:"upgrading",startedAt:Date.now()}),ve());let re;try{re=await U.startProcessingWorkflow(y)}catch(ue){throw de&&(jt.delete(de),ve()),ue}le=!0,M(`\u5DF2\u555F\u52D5\u300C${P?.label||y}\u300D\u6D41\u7A0B\u3002`,"ok",6e3),re&&re.run_id&&console.info("processing workflow started",re),window.dispatchEvent(new CustomEvent("judgment:updates-changed")),Ct({silent:!0}),window.setTimeout(()=>{Tt===y&&(Tt="",ps="",Ct({silent:!0}))},15e3)}catch(se){M(se.message||"\u7121\u6CD5\u555F\u52D5\u5DE5\u4F5C\u6D41\u7A0B\u3002","danger",7e3)}finally{d=!1,(!le||Tt!==y)&&(Tt="",ps="",c?(je(c),v="",ve()):ke(b,!1))}},Js=async b=>{if(!d){d=!0,ke(b,!0,"\u505C\u6B62\u4E2D\u2026");try{let y=await U.stopProcessingUpdate();for(let[P,de]of jt)de.kind==="upgrade"&&jt.delete(P);ve(),M(y.message||"\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info",6e3)}catch(y){M(y.message||"\u7121\u6CD5\u505C\u6B62\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{d=!1,ke(b,!1),c&&je(c)}}},Mt=b=>{let y=b.target.closest("[data-processing-action]");if(!y||y.disabled)return;y.closest(".processing-wf-rail")&&(b.preventDefault(),b.stopPropagation());let P=y.dataset.processingAction;if(P==="refresh")Ct({silent:!1});else if(P==="open-stage")I(y.dataset.stageId||"");else if(P==="refresh-judgment-months")At({quiet:!1});else if(P==="refresh-index-storage")Vt({quiet:!1,force:!0});else if(P==="refresh-court-check")_({quiet:!1,force:!0});else if(P==="refresh-law-version-check")q({quiet:!1,force:!0,button:y});else if(P==="refresh-ollama")rt({quiet:!1,button:y});else if(P==="refresh-embedding-models")rt({quiet:!1,button:y});else if(P==="select-embedding-model"){let de=y.dataset.hostId||"",le=y.dataset.model||"";Rt(`${de}|${le}`)}else if(P==="move-ollama-host"){let de=C?.hosts||[],le=de.findIndex(oe=>Number(oe.id)===Number(y.dataset.hostId)),se=y.dataset.direction,re=se==="up"?le-1:se==="down"?le+1:-1;if(le<0||re<0||re>=de.length)return;let ue=de.map(oe=>Number(oe.id));[ue[le],ue[re]]=[ue[re],ue[le]],Xe(ue)}else if(P==="check-updates")Na(y,y.dataset.workflowId||"");else if(P==="run-workflow"){let de=y.dataset.workflowId||"";Ea(y,de)}else P==="stop"&&Js(y)},Pt=(b,{scroll:y=!1}={})=>{if(h=b||"overview",c){let P=kn(c,h);is(a,P),$=P;let de=ka(c,h,ft(),be);if(is(s,de),v=de,D(),j(),F(),nt(c),z){let le=A(z);le?K(le):Q()}y&&s.scrollIntoView({behavior:"smooth",block:"start"})}Sn.has(h)&&rt({quiet:!0}),h==="judgment_download"&&At({quiet:!0}),h==="index_versions"&&Vt({quiet:!0}),h==="normalize_courts"&&_({quiet:!0}),h==="backfill_law_articles"&&q({quiet:!0})},Ms=b=>{let y=b.target.closest("[data-processing-workflow]");y&&Pt(y.dataset.processingWorkflow||"overview")},Ls=b=>{let y=b.target.closest("[data-timeline-workflow]");y&&(b.preventDefault(),Pt(y.dataset.timelineWorkflow||"",{scroll:!0}))},Vs=b=>{let y=b.target.closest?.(".processing-wf-stage[data-processing-stage]");if(!y||!s.contains(y))return;let P=y.dataset.processingStage||"";P&&(y.open?be.add(P):be.delete(P))};return t.addEventListener("click",Mt),a.addEventListener("click",Ms),s.addEventListener("click",Ls),s.addEventListener("pointerover",ce),s.addEventListener("pointerout",Se),s.addEventListener("pointerdown",Nt),s.addEventListener("toggle",Vs,!0),window.addEventListener("scroll",Q,{capture:!0,passive:!0}),St(),typeof EventSource>"u"&&await Ct({silent:!1}),()=>{o=!0,st(),t.removeEventListener("click",Mt),a.removeEventListener("click",Ms),s.removeEventListener("click",Ls),X(),s.removeEventListener("pointerover",ce),s.removeEventListener("pointerout",Se),s.removeEventListener("pointerdown",Nt),s.removeEventListener("toggle",Vs,!0),window.removeEventListener("scroll",Q,{capture:!0})}}var Cn={};Wt(Cn,{render:()=>zd});var Tn={draft:{label:"\u8349\u7A3F",badge:"badge-neutral"},pending_review:{label:"\u5F85\u5BE9",badge:"badge-warn"},changes_requested:{label:"\u9000\u56DE\u4FEE\u6539",badge:"badge-warn"},accepted:{label:"\u5DF2\u6838\u51C6",badge:"badge-ok"},rejected:{label:"\u5DF2\u62D2\u7D55",badge:"badge-danger"},retired:{label:"\u5DF2\u522A\u9664\uFF0F\u9000\u5F79",badge:"badge-neutral"}},Ht={law_concept:"\u6CD5\u898F\u6982\u5FF5",article_lookup:"\u6307\u5B9A\u689D\u6587",judgment_lookup:"\u5224\u6C7A\u6AA2\u7D22",structured:"\u7D50\u69CB\u5316\u554F\u984C",general:"\u4E00\u822C\u554F\u984C",refusal:"\u62D2\u7D55\u56DE\u7B54"},Ss={easy:"\u7C21\u55AE",medium:"\u4E2D\u7B49",hard:"\u56F0\u96E3"},qi={smoke:"Smoke",core:"Core",full:"Full",holdout:"Holdout"};function Gs(e){let t=Tn[e]||{label:e||"\u672A\u77E5",badge:"badge-neutral"};return`<span class="badge ${t.badge}">${r(t.label)}</span>`}function Nn(e){return String(e||"").split(`
`).map(t=>t.trim()).filter(Boolean)}function cd(e){return Nn(e).map(t=>{let[s,a]=t.split("|").map(n=>n.trim());return{law_name:s||"",source_type:a||""}})}function dd(e){return Nn(e).map(t=>{let[s,a]=t.split("|").map(n=>n.trim());return{law_name:s||"",article_no:a||""}})}function ud(e){return Nn(e).map(t=>({jid:t.trim()}))}function pd(e){return(e?.expected_laws||[]).map(t=>[t.law_name,t.source_type].filter(Boolean).join("|")).join(`
`)}function md(e){return(e?.expected_articles||[]).map(t=>[t.law_name||t.law_key,t.article_no].filter(Boolean).join("|")).join(`
`)}function gd(e){return(e?.expected_judgments||[]).map(t=>t.jid).join(`
`)}function fd(e){return(e?.tags||[]).join(", ")}function Qs(e){return`<div class="qb-empty">${m("info",18)}<span>${r(e)}</span></div>`}function En(e){let t=(e.expected_laws||[]).map(i=>i.law_name).filter(Boolean),s=(e.expected_articles||[]).map(i=>`${i.law_name||""} ${i.article_no||""}`.trim()).filter(Boolean),a=(e.expected_judgments||[]).map(i=>i.jid).filter(Boolean),n=[...t.map(i=>`<span class="chip">${r(i)}</span>`),...s.map(i=>`<span class="chip">${r(i)}</span>`),...a.map(i=>`<span class="chip chip-mono">${r(i)}</span>`)];return n.length?`<div class="chips qb-labels">${n.join("")}</div>`:'<span class="qb-muted">\u5C1A\u672A\u6A19\u8A3B expected labels</span>'}function Rn(){return`<details class="qb-import">
    <summary>${m("upload",14)}JSON \u6279\u6B21\u532F\u5165</summary>
    <p class="qb-muted">\u683C\u5F0F\uFF1A<code>{"items":[{question, question_type, difficulty, expected_laws, expected_articles, expected_judgments, reference_answer, tags, rubric}]}</code>\u3002\u76F8\u540C\u984C\u76EE fingerprint \u9810\u8A2D\u66F4\u65B0\u3002</p>
    <textarea class="input" id="qb-import-json" rows="6" placeholder='{"items":[...]}'></textarea>
    <div class="qb-actions">
      <button class="btn btn-secondary btn-sm" type="button" data-qb-action="import-json">${m("upload",13)}<span>\u532F\u5165 JSON</span></button>
    </div>
  </details>`}function bd(e){let t=e?.item||{},s=Array.isArray(e?.warnings)?e.warnings:[],a=Array.isArray(t.tags)?t.tags:[];return`<section class="report-card qb-card qb-ai-result">
    <div class="side-card-head">
      <span class="side-card-title">${m("sparkles",14)}Ollama \u5DF2\u5EFA\u7ACB\u984C\u76EE #${t.id}</span>
      ${Gs(t.status)}
    </div>
    <div class="qb-ai-answer">
      <strong>${r(t.question||"")}</strong>
      <div class="qb-ai-meta">
        ${r(Ht[t.question_type]||t.question_type||"")}
        \xB7 ${r(Ss[t.difficulty]||t.difficulty||"")}
        \xB7 ${r(e?.model||"\u672C\u6A5F Ollama")}
      </div>
      ${En(t)}
      ${t.reference_answer?`<div class="qb-reference"><span class="summary-label">Ollama \u53C3\u8003\u7B54\u6848</span><p>${r(t.reference_answer)}</p></div>`:""}
      ${a.length?`<div class="chips">${a.map(n=>`<span class="chip">${r(n)}</span>`).join("")}</div>`:""}
      ${s.length?`<div class="qb-ai-warnings"><strong>\u9700\u8981\u6CE8\u610F</strong><ul>${s.map(n=>`<li>${r(n)}</li>`).join("")}</ul></div>`:""}
      <div class="qb-actions">
        <button class="btn btn-primary btn-sm" type="button" data-qb-action="review-ai-item">${m("shield",13)}<span>\u524D\u5F80\u9A57\u6536</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="reset-ai">${m("plus",13)}<span>\u518D\u65B0\u589E\u4E00\u984C</span></button>
      </div>
    </div>
    ${Rn()}
  </section>`}function vd(e){return e.aiResult?bd(e.aiResult):`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("sparkles",14)}AI \u984C\u5EAB\u65B0\u589E</span>
      <span class="badge badge-neutral">\u672C\u6A5F Ollama</span>
    </div>
    <form class="qb-form qb-ai-form" data-qb-form="ai-create" id="qb-create-form">
      <label class="field qb-wide">
        <span class="field-label">\u984C\u76EE <span class="field-tag">question</span></span>
        <textarea class="input" name="question" rows="4" required placeholder="\u8F38\u5165\u554F\u984C\uFF0COllama \u6703\u56DE\u7B54\u4E26\u81EA\u52D5\u5224\u65B7\u984C\u578B\u3001\u96E3\u5EA6\u3001\u6CD5\u898F\uFF0F\u689D\u6587\u3001\u53C3\u8003\u7B54\u6848\u8207\u6A19\u7C64\u3002">${r(e.aiQuestion||"")}</textarea>
      </label>
      <p class="qb-form-hint">\u9001\u51FA\u5F8C\u7531\u672C\u6A5F Ollama \u56DE\u7B54\u4E26\u81EA\u52D5\u5EFA\u7ACB\u6B04\u4F4D\uFF1B\u984C\u76EE\u6703\u4EE5\u300C\u5F85\u5BE9\u300D\u5EFA\u7ACB\uFF0C\u4ECD\u9700\u4EBA\u5DE5\u8986\u6838\u5F8C\u624D\u6703\u6210\u70BA benchmark-ready\u3002</p>
      <div class="qb-actions">
        <button class="btn btn-primary" type="submit" ${e.aiLoading?"disabled":""}>${e.aiLoading?'<span class="spinner"></span><span>Ollama \u7522\u751F\u4E2D\u2026</span>':`${m("sparkles",14)}<span>\u8B93 Ollama \u7522\u751F\u4E26\u5EFA\u7ACB</span>`}</button>
        <button class="btn btn-secondary" type="button" data-qb-action="reset-ai" ${e.aiLoading?"disabled":""}>\u6E05\u9664</button>
      </div>
    </form>
    ${Rn()}
  </section>`}function hd(e){return`<section class="report-card qb-card">
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
          <select class="select" name="question_type">${Object.entries(Ht).map(([t,s])=>`<option value="${t}" ${e?.question_type===t?"selected":""}>${s}</option>`).join("")}</select>
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
          <textarea class="input" name="expected_laws" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5&#10;\u9280\u884C\u6CD5|law">${r(pd(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u689D\u6587 <span class="field-tag">\u6CD5\u898F|\u7B2C 157-1 \u689D</span></span>
          <textarea class="input" name="expected_articles" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 157-1 \u689D&#10;\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 171 \u689D">${r(md(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u5224\u6C7A <span class="field-tag">jid\uFF0C\u6BCF\u884C\u4E00\u7B46</span></span>
          <textarea class="input" name="expected_judgments" rows="3" placeholder="TPDM,113,\u91D1\u8A34,27,20241128,1">${r(gd(e))}</textarea>
        </label>
      </div>
      <label class="field"><span class="field-label">\u53C3\u8003\u7B54\u6848\uFF0Frubric \u8AAA\u660E</span>
        <textarea class="input" name="reference_answer" rows="4" placeholder="\u63D0\u4F9B\u7D66 LLM judge \u8207\u4EBA\u5DE5\u9A57\u6536\u53C3\u8003\uFF1B\u53EF\u7559\u7A7A\uFF0C\u4F46\u54C1\u8CEA\u8A55\u5206\u6703\u8F03\u5F31\u3002">${r(e?.reference_answer||"")}</textarea>
      </label>
      <div class="qb-form-grid">
        <label class="field"><span class="field-label">\u6A19\u7C64 <span class="field-tag">\u9017\u865F\u5206\u9694</span></span>
          <input class="input" name="tags" value="${r(fd(e))}" placeholder="\u5167\u7DDA\u4EA4\u6613, \u8B49\u5238\u4EA4\u6613\u6CD5" />
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
    ${Rn()}
  </section>`}function $d(e,t){return e?hd(e):vd(t)}function yd(e){let t=e.status==="retired"||!!e.deleted_at;return`<article class="qb-item" data-qb-item="${e.id}">
    <div class="qb-item-head">
      <span class="qb-id">#${e.id}</span>
      <div class="qb-item-title">
        <strong>${r(e.question)}</strong>
        <span class="qb-meta">
          ${r(Ht[e.question_type]||e.question_type)}
          \xB7 ${r(Ss[e.difficulty]||e.difficulty)}
          \xB7 v${e.version}
          ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
          ${e.benchmark_ready?' \xB7 <span class="qb-ready">Benchmark ready</span>':""}
        </span>
      </div>
      ${Gs(e.status)}
    </div>
    <div class="qb-fingerprint mono">fingerprint ${r(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${En(e)}
    <div class="qb-item-foot">
      <span>\u66F4\u65B0 ${r(qe(e.updated_at))}</span>
      ${e.reviewed_by?`<span>\u5BE9\u6838 ${r(e.reviewed_by)}</span>`:""}
      ${e.review_comment?`<span class="qb-comment">${r(e.review_comment)}</span>`:""}
      <div class="qb-actions">
        ${t?`<button class="btn btn-primary btn-sm" type="button" data-qb-action="restore" data-id="${e.id}">${m("refresh",13)}<span>\u5FA9\u539F\u984C\u76EE</span></button>`:`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${m("edit",13)}<span>\u7DE8\u8F2F</span></button>
               ${["pending_review","changes_requested"].includes(e.status)?"":`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="submit-review" data-id="${e.id}">${m("upload",13)}<span>${e.status==="draft"?"\u9001\u5BE9":"\u91CD\u65B0\u9001\u5BE9"}</span></button>`}
               <button class="btn btn-secondary btn-sm" type="button" data-qb-action="review" data-id="${e.id}">${m("shield",13)}<span>\u9A57\u6536</span></button>
               <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${m("trash",13)}<span>\u522A\u9664</span></button>`}
      </div>
    </div>
  </article>`}function wd(e){return`<section class="report-card qb-card">
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
        ${Object.entries(Tn).map(([t,s])=>`<option value="${t}" ${e.filters.status===t?"selected":""}>${s.label}</option>`).join("")}
      </select>
      <select class="select" name="question_type">
        <option value="">\u5168\u90E8\u984C\u578B</option>
        ${Object.entries(Ht).map(([t,s])=>`<option value="${t}" ${e.filters.question_type===t?"selected":""}>${s}</option>`).join("")}
      </select>
      <select class="select" name="difficulty">
        <option value="">\u5168\u90E8\u96E3\u5EA6</option>
        ${Object.entries(Ss).map(([t,s])=>`<option value="${t}" ${e.filters.difficulty===t?"selected":""}>${s}</option>`).join("")}
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
      ${e.items.length?e.items.map(t=>yd(t)).join(""):Qs("\u76EE\u524D\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u984C\u76EE\u3002")}
    </div>
    <div class="qb-pagination">
      <span>\u5171 ${u(e.total)} \u984C</span>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="prev" ${e.offset<=0?"disabled":""}>\u4E0A\u4E00\u9801</button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="next" ${e.offset+e.limit>=e.total?"disabled":""}>\u4E0B\u4E00\u9801</button>
      </div>
    </div>
  </section>`}var Mi=[["queue","\u5F85\u5BE9\uFF0F\u9000\u56DE"],["accepted","\u5DF2\u6838\u51C6"],["rejected","\u5DF2\u62D2\u7D55"],["draft","\u8349\u7A3F"]];function _d(e){let t=e.stats||{};return{queue:Number(t.pending_review||0)+Number(t.changes_requested||0),accepted:Number(t.accepted||0),rejected:Number(t.rejected||0),draft:Number(t.draft||0)}}function kd(e,t){let s=e.reviewFilter||"queue",a={queue:{title:"\u76EE\u524D\u6C92\u6709\u5F85\u5BE9\u6216\u9000\u56DE\u4FEE\u6539\u7684\u984C\u76EE\u3002",text:t.accepted?`\u5DF2\u6709 ${u(t.accepted)} \u984C\u6838\u51C6\u3002\u65B0\u984C\u76EE\u5EFA\u7ACB\u5F8C\u6703\u81EA\u52D5\u9001\u5BE9\uFF0C\u4E5F\u53EF\u4EE5\u5207\u63DB\u5230\u300C\u5DF2\u6838\u51C6\u300D\u91CD\u65B0\u9A57\u6536\u65E2\u6709\u984C\u76EE\u3002`:"\u5EFA\u7ACB\u984C\u76EE\u5F8C\u6703\u9810\u8A2D\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\uFF1B\u82E5\u53EA\u60F3\u5148\u4FDD\u5B58\uFF0C\u5EFA\u7ACB\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5373\u53EF\u5B58\u6210\u8349\u7A3F\u3002"},accepted:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u6838\u51C6\u984C\u76EE\u3002",text:"\u984C\u76EE\u901A\u904E\u4EBA\u5DE5\u9A57\u6536\u5F8C\u6703\u5217\u5728\u9019\u88E1\uFF1B\u4E5F\u53EF\u4EE5\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u9001\u51FA\u9A57\u6536\u3002"},rejected:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u62D2\u7D55\u984C\u76EE\u3002",text:"\u88AB\u62D2\u7D55\u7684\u984C\u76EE\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u4E2D\uFF0C\u53EF\u4FEE\u6539\u5F8C\u91CD\u65B0\u9001\u5BE9\u3002"},draft:{title:"\u76EE\u524D\u6C92\u6709\u8349\u7A3F\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u984C\u76EE\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5C31\u6703\u5B58\u6210\u8349\u7A3F\uFF0C\u4E4B\u5F8C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002"}}[s]||{title:"\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u65B0\u984C\u76EE\u5F8C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"},n=[s!=="draft"?`<button class="btn btn-primary btn-sm" type="button" data-qb-action="new">${m("plus",13)}<span>\u65B0\u589E\u984C\u76EE</span></button>`:"",s==="queue"&&t.accepted?`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="review-filter" data-filter="accepted">${m("shield",13)}<span>\u67E5\u770B\u5DF2\u6838\u51C6 ${u(t.accepted)}</span></button>`:"",`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="go-manage">${m("database",13)}<span>\u524D\u5F80\u984C\u5EAB\u7BA1\u7406</span></button>`].filter(Boolean).join("");return`<div class="qb-empty qb-empty-block">
    <span class="qb-empty-icon">${m("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>${r(a.title)}</strong>
      <p>${r(a.text)}</p>
      <div class="qb-actions">${n}</div>
    </div>
  </div>`}function Sd(e){let t=Mi.find(([s])=>s===e);return t?t[1]:"\u5F85\u5BE9\uFF0F\u9000\u56DE"}function xd(e,t){return`<button class="qb-review-item${t?" is-active":""}" type="button" data-qb-action="select-review-item" data-id="${e.id}" aria-pressed="${t?"true":"false"}">
    <span class="qb-review-item-top">
      <span class="qb-id">#${e.id}</span>
      <span class="qb-review-item-meta">
        ${r(Ht[e.question_type]||e.question_type)}
        \xB7 ${r(Ss[e.difficulty]||e.difficulty)}
        \xB7 v${e.version}
        ${e.benchmark_ready?" \xB7 Benchmark ready":""}
        ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
      </span>
      ${Gs(e.status)}
    </span>
    <strong>${r(e.question)}</strong>
  </button>`}function qd(e){return`<article class="qb-review-pane-card">
    <div class="qb-review-pane-head">
      <div class="qb-review-pane-title">
        <span class="qb-review-item-meta">#${e.id} \xB7 v${e.version} \xB7 ${r(Ht[e.question_type]||e.question_type)} \xB7 ${r(Ss[e.difficulty]||e.difficulty)}</span>
        <strong>${r(e.question)}</strong>
      </div>
      <div class="qb-review-pane-side">
        ${Gs(e.status)}
        <div class="qb-actions">
          <button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${m("edit",13)}<span>\u7DE8\u8F2F</span></button>
          <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${m("trash",13)}<span>\u522A\u9664</span></button>
        </div>
      </div>
    </div>
    <div class="qb-fingerprint mono">fingerprint ${r(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${En(e)}
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
    ${e.reviews?.length?`<div class="qb-review-history"><span class="summary-label">\u5BE9\u6838\u7D00\u9304</span>${e.reviews.map(t=>`<div class="qb-review-row"><span>${r(t.reviewer||"\u533F\u540D")}</span>${Gs(t.decision==="approved"?"accepted":t.decision)}<span>${r(qe(t.created_at))}</span><p>${r(t.comment||"\u2014")}</p></div>`).join("")}</div>`:""}
  </article>`}function Ad(){return`<div class="qb-empty qb-empty-block qb-review-placeholder">
    <span class="qb-empty-icon">${m("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>\u5F9E\u5DE6\u5074\u9078\u64C7\u984C\u76EE</strong>
      <p>\u9EDE\u9078\u984C\u76EE\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u984C\u5E79\u3001\u9810\u671F\u6A19\u8A3B\u3001\u53C3\u8003\u7B54\u6848\u8207\u6838\u51C6\u9078\u9805\u3002</p>
    </div>
  </div>`}function Md(e){let t=e.reviewDetail,s=_d(e),a=e.reviewFilter||"queue",n=Mi.map(([l,d])=>`<button class="chip qb-review-tab${a===l?" is-active":""}" type="button" role="tab" aria-selected="${a===l?"true":"false"}" data-qb-action="review-filter" data-filter="${l}"><span>${d}</span><span class="qb-review-tab-count">${u(s[l]||0)}</span></button>`).join(""),i=e.reviewItems.length?e.reviewItems.map(l=>xd(l,Number(t?.id)===Number(l.id))).join(""):`<div class="qb-empty qb-empty-compact">${m("info",16)}<span>\u76EE\u524D\u6C92\u6709${r(Sd(a))}\u984C\u76EE\u3002</span></div>`,o=t?qd(t):e.reviewItems.length?Ad():kd(e,s);return`<section class="report-card qb-card qb-review-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("shield",14)}\u984C\u5EAB\u4EBA\u5DE5\u9A57\u6536\u6279\u6CE8</span>
      <span class="badge ${s.queue?"badge-warn":"badge-neutral"}">\u5F85\u5BE9 ${u(s.queue)}</span>
    </div>
    <p class="qb-review-hint">\u65B0\u984C\u76EE\u5EFA\u7ACB\u6216\u4FEE\u6539\u5F8C\u6703\u9032\u5165\u5F85\u5BE9\uFF1B\u9EDE\u9078\u5DE6\u5074\u984C\u76EE\u5373\u53EF\u5728\u53F3\u5074\u67E5\u770B\u5167\u5BB9\u3001\u6838\u51C6\u3001\u9000\u56DE\u6216\u522A\u9664\u3002</p>
    <div class="qb-review-split">
      <aside class="qb-review-list-pane" aria-label="\u9A57\u6536\u984C\u76EE\u6E05\u55AE">
        <div class="qb-review-tabs" role="tablist" aria-label="\u9A57\u6536\u72C0\u614B">${n}</div>
        <div class="qb-review-list">${i}</div>
      </aside>
      <section class="qb-review-detail-pane" aria-live="polite">${o}</section>
    </div>
  </section>`}function Us(e){if(e==null||e==="")return"";let t=Number(e);return Number.isFinite(t)?`${Math.round(t*100)}%`:""}function Ld(e){if(!e||typeof e!="object")return"\u5F15\u7528";let t=String(e.jid||"").trim();if(t)return t;let s=String(e.law_name||"").trim(),a=String(e.article_no||"").trim(),n=`${s} ${a}`.trim();return n||String(e.title||e.text||"\u5F15\u7528").slice(0,80)}function jd(e){let t=e?.metrics||{},s=t.scores||{},a=[["\u6CD5\u898F\u53EC\u56DE",Us(t.law_recall)],["\u689D\u6587\u53EC\u56DE",Us(t.article_recall)],["\u898F\u5247\u5206",Us(s.deterministic)],["Judge",Us(s.judge)],["\u4EBA\u5DE5",Us(s.human)]].filter(([,n])=>n);return a.length?`<div class="qb-bank-stats">${a.map(([n,i])=>`<span class="qb-bank-stat"><span>${r(n)}</span><strong>${r(i)}</strong></span>`).join("")}</div>`:""}function Td(e){let t=Array.isArray(e?.law_sources)?e.law_sources:[],s=Array.isArray(e?.citations)?e.citations:[],a=t.length?`<div class="qb-bank-sources">${t.map(i=>{let o=String(i.law_name||"\u672A\u547D\u540D\u6CD5\u898F"),l=(i.articles||[]).map(c=>String(c.article_no||"").trim()).filter(Boolean),d=`<strong>${r(o)}</strong>${l.length?`<small>${r(l.join("\u3001"))}</small>`:""}`;return i.law_url?`<a class="qb-bank-law" href="${r(i.law_url)}" target="_blank" rel="noreferrer">${d}</a>`:`<span class="qb-bank-law">${d}</span>`}).join("")}</div>`:"",n=s.length?`<div class="qb-bank-sources qb-bank-citations">${s.map(i=>`<span class="chip chip-mono">${r(Ld(i))}</span>`).join("")}</div>`:"";return!a&&!n?"":`<div class="qb-bank-answer-block">
    <div class="qb-bank-section-label"><span>\u5F15\u7528\u4F86\u6E90</span><span>${u(t.length+s.length)} \u7B46</span></div>
    ${a}${n}
  </div>`}function Li(e,t){if(!e)return`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${m("history",20)}</span>
      <strong>\u5C1A\u7121 RAG \u7B54\u6848</strong>
      <span>\u8DD1\u4E00\u6B21 Benchmark \u5F8C\uFF0C\u6700\u8FD1\u4E00\u6B21\u6210\u529F\u56DE\u7B54\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</span>
    </div>`;let s=Number(e.item_version||0),a=Number(t?.version||0),n=s&&a&&s!==a?`<span class="badge badge-warn">\u7B54\u6848 v${s} \xB7 \u984C\u76EE v${a}</span>`:"",i=e.answer_source==="llm"?"LLM \u751F\u6210":e.answer_source==="structured"?"\u6CD5\u898F\u8CC7\u6599\u5EAB":String(e.answer_source||"RAG");return`<div class="qb-bank-answer-meta">
      <span class="badge badge-ok"><span class="status-dot is-ok"></span>RAG \u5B8C\u6210</span>
      <span class="badge badge-neutral">${r(i)}</span>
      ${n}
      <span class="mono">${r(e.run_label||e.run_id||"")}</span>
      <span>${r(qe(e.finished_at))}</span>
      <span>${r(me(e.duration_ms))}</span>
      ${e.llm_model?`<span class="mono">${r(e.llm_model)}</span>`:""}
    </div>
    <div class="qb-bank-answer-block">
      <div class="qb-bank-section-label"><span>\u56DE\u7B54</span><span>${u(String(e.answer||"").length)} \u5B57</span></div>
      <p class="qb-bank-answer-text">${r(String(e.answer||"").trim()||"\uFF08\u7A7A\u767D\u56DE\u7B54\uFF09")}</p>
    </div>
    ${Td(e)}
    ${jd(e)}`}function ji(e,t){let s=e.selectedSuiteId,a=t&&e.suiteAnswers?.[String(s)]?.[String(t.id)]||null;return t?`<div class="qb-bank-answer-head">
      <div class="qb-bank-answer-heading">
        <span class="qb-bank-answer-kicker">${m("sparkles",12)}RAG \u6700\u8FD1\u4E00\u6B21\u7B54\u6848</span>
        <strong class="qb-bank-answer-question">#${t.id} ${r(t.question)}</strong>
      </div>
      ${a?`<span class="qb-bank-answer-state">${r(Ht[t.question_type]||t.question_type)} \xB7 v${t.version}</span>`:""}
    </div>
    ${Li(a,t)}`:`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${m("cube",20)}</span>
      <strong>\u9078\u64C7\u984C\u76EE</strong>
      <span>\u5F9E\u5DE6\u5074\u6E05\u55AE\u9078\u64C7\u4E00\u984C\uFF0C\u67E5\u770B\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`}function Ti(e){return`<span class="qb-bank-actions">
    <button class="qb-bank-icon" type="button" data-qb-action="edit" data-id="${e.id}" title="\u7DE8\u8F2F\u984C\u76EE" aria-label="\u7DE8\u8F2F\u984C\u76EE #${e.id}">${m("edit",13)}</button>
    <button class="qb-bank-icon is-danger" type="button" data-qb-action="delete" data-id="${e.id}" title="\u5F9E\u984C\u5EAB\u79FB\u9664" aria-label="\u5F9E\u984C\u5EAB\u79FB\u9664 #${e.id}">${m("trash",13)}</button>
  </span>`}function Nd(e,t,{selected:s,hasAnswer:a}){return`<div class="qb-bank-row${s?" is-active":""}" data-id="${e.id}">
    <button class="qb-bank-select" type="button" data-qb-action="select-bank-item" data-id="${e.id}" aria-pressed="${s?"true":"false"}">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <span class="qb-bank-item-copy">
        <strong>${r(e.question)}</strong>
        <small>${r(Ht[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${a?"\u5DF2\u6709 RAG \u7B54\u6848":"\u5C1A\u7121 RAG \u7B54\u6848"}</small>
      </span>
    </button>
    ${Ti(e)}
  </div>`}function Ed(e,t,s){return`<article class="qb-bank-full-item" data-id="${e.id}">
    <div class="qb-bank-full-head">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <div class="qb-bank-full-title">
        <strong>${r(e.question)}</strong>
        <small>${r(Ht[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${r(Tn[e.status]?.label||e.status||"")}</small>
      </div>
      ${Ti(e)}
    </div>
    ${Li(s,e)}
  </article>`}function Ai(e){let t=e.editingSuite,s=Array.isArray(e.suites)?e.suites:[],a=s.find(g=>Number(g.id)===Number(e.selectedSuiteId))||s[0]||null,n=Array.isArray(a?.items)?a.items:[],i=e.suiteAnswers?.[String(a?.id)]||{},o=n.find(g=>Number(g.id)===Number(e.selectedBankItemId))||null,l=!!e.suiteAnswersLoading,d=String(e.suiteAnswersError||""),c=!!e.suiteManageOpen||!s.length,v=e.bankTab==="full"?"full":"split",$=s.length?`<div class="qb-bank-tabs" role="tablist" aria-label="Benchmark \u984C\u5EAB\u6AA2\u8996">
        <button class="qb-bank-tab${v==="split"?" is-active":""}" type="button" role="tab" aria-selected="${v==="split"?"true":"false"}" data-qb-action="bank-tab" data-tab="split">${m("grid",13)}<span>Benchmark \u984C\u5EAB</span><span class="badge badge-neutral">${u(n.length)}</span></button>
        <button class="qb-bank-tab${v==="full"?" is-active":""}" type="button" role="tab" aria-selected="${v==="full"?"true":"false"}" data-qb-action="bank-tab" data-tab="full">${m("table",13)}<span>\u984C\u5EAB\u5168\u5217\u8868</span><span class="badge badge-neutral">${u(n.length)}</span></button>
      </div>`:"",h="";if(!s.length)h=`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${m("cube",20)}</span>
      <strong>\u5C1A\u672A\u5EFA\u7ACB Benchmark \u984C\u5EAB</strong>
      <span>\u5C55\u958B\u4E0B\u65B9 Suite \u8A2D\u5B9A\u4E26\u5EFA\u7ACB\u984C\u5EAB\u5F8C\uFF0C\u5C31\u80FD\u5728\u9019\u88E1\u700F\u89BD\u984C\u76EE\u8207\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`;else if(l)h='<div class="qb-bank-loading"><span class="spinner" aria-hidden="true"></span><span>\u8B80\u53D6\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u4E2D\u2026</span></div>';else{let g=d?Ee({tone:"warn",title:"\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u8B80\u53D6\u5931\u6557",text:r(d)}):"";v==="full"?h=`${g}<div class="qb-bank-full" data-qb-bank-view="full">${n.length?n.map((p,w)=>Ed(p,w,i[String(p.id)]||null)).join(""):Qs("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>`:h=`${g}<div class="qb-bank-split" data-qb-bank-view="split">
        <div class="qb-bank-list" data-qb-bank-list>${n.length?n.map((p,w)=>Nd(p,w,{selected:Number(p.id)===Number(o?.id),hasAnswer:!!i[String(p.id)]})).join(""):Qs("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>
        <div class="qb-bank-answer-pane" data-qb-bank-answer>${ji(e,o)}</div>
      </div>`}return`<section class="report-card qb-card qb-bank-card">
    <div class="side-card-head qb-bank-head">
      <div class="qb-bank-heading">
        <span class="side-card-title">${m("cube",14)}Benchmark \u984C\u5EAB</span>
        <span class="qb-bank-sub">${a?`${r(a.name)} \xB7 v${a.version} \xB7 ${u(a.item_count)} \u984C`:"\u5C1A\u672A\u5EFA\u7ACB suite"}</span>
      </div>
      <div class="qb-bank-controls">
        ${s.length?`<label class="qb-suite-picker"><span>Suite</span><select class="select" data-qb-suite-select aria-label="\u9078\u64C7 benchmark suite">${s.map(g=>`<option value="${g.id}" ${Number(g.id)===Number(a?.id)?"selected":""}>${r(g.name)} \xB7 ${u(g.item_count)} \u984C</option>`).join("")}</select></label>`:""}
        ${a?`<span class="badge ${a.status==="frozen"?"badge-ok":"badge-neutral"}">${a.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>`:""}
      </div>
    </div>
    ${$}
    ${h}
    <details class="qb-suite-manage" ${c?"open":""}>
      <summary>${m("sliders",14)}Suite \u8A2D\u5B9A\u8207\u7248\u672C <span class="qb-muted">${u(s.length)} \u500B suite \xB7 ${u(e.ready.length)} \u984C benchmark-ready</span></summary>
      <div class="qb-suite-manage-body">
        <form class="qb-suite-form" data-qb-form="suite">
          <input type="hidden" name="suite_id" value="${t?.id||""}" />
          <div class="qb-form-grid">
            <label class="field"><span class="field-label">Suite \u540D\u7A31</span><input class="input" name="name" required value="${r(t?.name||"Pilot 30")}" /></label>
            <label class="field"><span class="field-label">\u7B49\u7D1A</span><select class="select" name="tier">${Object.entries(qi).map(([g,p])=>`<option value="${g}" ${t?.tier===g?"selected":""}>${p}</option>`).join("")}</select></label>
          </div>
          <label class="field"><span class="field-label">\u8AAA\u660E</span><input class="input" name="description" value="${r(t?.description||"30 \u984C pilot\uFF1B\u7528\u65BC RAG benchmark \u8207\u9577\u671F\u540C\u984C\u6BD4\u8F03\u3002")}" /></label>
          <div class="qb-check-list">
            ${e.ready.length?e.ready.map(g=>{let p=t?t.items?.some(w=>Number(w.id)===Number(g.id)):!0;return`<label class="qb-check-row"><input type="checkbox" name="item_ids" value="${g.id}" ${p?"checked":""}/><span><strong>#${g.id}</strong> ${r(g.question)} <small>${r(Ht[g.question_type]||g.question_type)}</small></span></label>`}).join(""):Qs("\u6C92\u6709\u5DF2\u9A57\u6536\u4E14 benchmark-ready \u7684\u984C\u76EE\uFF1B\u8ACB\u5148\u5B8C\u6210\u4EBA\u5DE5\u9A57\u6536\u3002")}
          </div>
          <div class="qb-actions">
            <button class="btn btn-primary" type="submit">${m("check",14)}<span>${t?"\u5132\u5B58 suite":"\u5EFA\u7ACB suite"}</span></button>
            ${t?'<button class="btn btn-secondary" type="button" data-qb-action="suite-new">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
          </div>
        </form>
        <div class="qb-list">
          ${s.length?s.map(g=>`<article class="qb-suite">
            <div class="qb-item-head">
              <div class="qb-item-title"><strong>${r(g.name)}</strong><span class="qb-meta">${r(qi[g.tier]||g.tier)} \xB7 v${g.version} \xB7 ${u(g.item_count)} \u984C</span></div>
              <span class="badge ${g.status==="frozen"?"badge-ok":"badge-neutral"}">${g.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>
            </div>
            <div class="qb-suite-items">${(g.items||[]).slice(0,8).map(p=>`<span class="chip">#${p.id} ${r(p.question.slice(0,22))}${p.question.length>22?"\u2026":""}</span>`).join("")}${g.item_count>8?`<span class="qb-muted">+${g.item_count-8}</span>`:""}</div>
            <div class="qb-actions">
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-edit" data-id="${g.id}">${m("edit",13)}<span>\u7DE8\u8F2F suite</span></button>
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-freeze" data-id="${g.id}">${m("shield",13)}<span>\u51CD\u7D50</span></button>
              <button class="btn btn-ghost btn-sm" type="button" data-qb-action="suite-delete" data-id="${g.id}">${m("trash",13)}<span>\u522A\u9664</span></button>
            </div>
          </article>`).join(""):Qs("\u5C1A\u672A\u5EFA\u7ACB benchmark suite\u3002")}
        </div>
      </div>
    </details>
  </section>`}function Rd(e){let t={};for(let s of["clarity","labels","answer","difficulty","overall"]){let a=e.querySelector(`[name="score_${s}"]`),n=Number(a?.value);Number.isFinite(n)&&(t[s]=Math.max(1,Math.min(5,Math.round(n))))}return t}function Cd(e){let t=new FormData(e);return{question:String(t.get("question")||"").trim(),question_type:String(t.get("question_type")||"general"),difficulty:String(t.get("difficulty")||"medium"),visibility:String(t.get("visibility")||"shared"),expected_laws:cd(t.get("expected_laws")),expected_articles:dd(t.get("expected_articles")),expected_judgments:ud(t.get("expected_judgments")),reference_answer:String(t.get("reference_answer")||"").trim(),tags:String(t.get("tags")||"").split(",").map(s=>s.trim()).filter(Boolean),notes:String(t.get("notes")||"").trim(),rubric:{must_refuse:!!e.elements.must_refuse?.checked}}}function Ni(e,{onNavigate:t=null,onStats:s=null}={}){let a={create:"question-create",manage:"question-manage",suite:"benchmark-bank",review:"question-review"},n={tab:"",editing:null,editingFrom:"",editingSuite:null,aiQuestion:"",aiLoading:!1,aiResult:null,items:[],total:0,offset:0,limit:50,filters:{query:"",status:"",question_type:"",difficulty:"",tags:[]},stats:{},suites:[],ready:[],selectedSuiteId:null,selectedBankItemId:null,bankTab:"split",suiteAnswers:{},suiteAnswersLoading:!1,suiteAnswersError:"",suiteManageOpen:!1,reviewItems:[],reviewDetail:null,reviewFilter:"queue"},i=N=>e.querySelector(`#quality-panel-${a[N]}`),o=(N,D)=>{N&&(N.childElementCount?N.setAttribute("aria-busy","true"):N.innerHTML=`<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>${D}</span></div></section>`)},l=N=>{N?.removeAttribute("aria-busy")},d=0,c=null,v=()=>"anonymous",$=()=>{s&&s(n.stats)},h=N=>{t&&t(N),Z(N)},g=async()=>{try{n.stats=await U.questionBankStats()}catch{n.stats={}}$()},p=()=>{let N=i("create");N&&(N.innerHTML=$d(n.editing,n))},w=(N,D)=>{let x=N?.querySelector("[data-qb-tag-results]");x&&(x.innerHTML=D.length?D.map(j=>`<button class="qb-tag-option" type="button" role="option" data-qb-action="select-tag" data-tag="${r(j.tag)}"><span>${r(j.tag)}</span><small>${u(j.count)}</small></button>`).join(""):'<div class="qb-tag-empty">\u6C92\u6709\u5176\u4ED6\u76F8\u7B26\u6A19\u7C64</div>')},k=async(N,D="")=>{if(!N)return;let x=N.querySelector("[data-qb-tag-results]"),j=++d;x&&(x.innerHTML='<div class="qb-tag-loading"><span class="spinner"></span><span>\u641C\u5C0B\u6A19\u7C64\u2026</span></div>');try{let W=await U.questionBankTags(D,12);if(j!==d)return;let F=(W.tags||[]).filter(Ie=>!n.filters.tags.includes(Ie.tag));w(N,F)}catch(W){if(j!==d)return;x&&(x.innerHTML=`<div class="qb-tag-empty">${r(W.message||"\u6A19\u7C64\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},L=(N,{focus:D=!1}={})=>{if(!N)return;let x=N.querySelector("[data-qb-tag-popover]"),j=N.querySelector("[data-qb-tag-search]");!x||!j||(x.hidden&&(x.hidden=!1,j.value="",k(N,"")),D&&(j.focus(),j.select()))},E=N=>{c&&(window.clearTimeout(c),c=null);let D=N?.querySelector("[data-qb-tag-popover]");D&&(D.hidden=!0)},T=async N=>{let D=String(N||"").trim();D&&(n.filters.tags.includes(D)?n.filters.tags=n.filters.tags.filter(x=>x!==D):n.filters.tags=[...n.filters.tags,D],n.offset=0,await S())},H=()=>{let N=Array.isArray(n.suites)?n.suites:[];if(!N.length)return n.selectedSuiteId=null,n.selectedBankItemId=null,null;let D=N.find(j=>Number(j.id)===Number(n.selectedSuiteId));D||(D=N[0],n.selectedSuiteId=D.id,n.selectedBankItemId=null);let x=Array.isArray(D.items)?D.items:[];return x.some(j=>Number(j.id)===Number(n.selectedBankItemId))||(n.selectedBankItemId=x[0]?.id??null),D},G=()=>{let N=i("suite");N&&(N.innerHTML=Ai(n))},Y=0,ye=async(N,{force:D=!1}={})=>{if(!N)return;let x=++Y;if(!D&&n.suiteAnswers[String(N)]){n.suiteAnswersLoading=!1,n.suiteAnswersError="",G();return}n.suiteAnswersLoading=!0,n.suiteAnswersError="",G();try{let j=await U.benchmarkSuiteLatestAnswers(N);if(x!==Y)return;n.suiteAnswers[String(N)]=j.answers||{}}catch(j){if(x!==Y)return;n.suiteAnswersError=j.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}finally{x===Y&&(n.suiteAnswersLoading=!1,G())}},Ae=async N=>{n.selectedSuiteId=N,n.selectedBankItemId=null,n.suiteAnswersError="";let D=H();if(!D){G();return}await ye(D.id)},J=N=>{n.bankTab=N==="full"?"full":"split",G()},B=()=>{let N=i("suite");if(!N)return;let D=H(),j=(Array.isArray(D?.items)?D.items:[]).find(F=>Number(F.id)===Number(n.selectedBankItemId))||null;for(let F of N.querySelectorAll(".qb-bank-row")){let Ie=Number(F.dataset.id)===Number(n.selectedBankItemId);F.classList.toggle("is-active",Ie);let Re=F.querySelector("[data-qb-action='select-bank-item']");Re&&Re.setAttribute("aria-pressed",Ie?"true":"false")}let W=N.querySelector("[data-qb-bank-answer]");W&&(W.innerHTML=ji(n,j))},S=async()=>{let N=i("manage");if(N){c&&(window.clearTimeout(c),c=null),o(N,"\u8B80\u53D6\u984C\u5EAB\u4E2D\u2026");try{let D=await U.questionBankItems({...n.filters,...n.filters.status==="retired"?{include_deleted:!0}:{}},n.limit,n.offset);n.items=D.items||[],n.total=Number(D.total||0),n.stats=D.stats||n.stats,l(N),N.innerHTML=wd(n),$()}catch(D){l(N),N.innerHTML=`<section class="report-card qb-card">${Ee({tone:"danger",title:"\u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:r(D.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},C=async({refreshAnswers:N=!1}={})=>{let D=i("suite");if(D){o(D,"\u8B80\u53D6 benchmark \u984C\u5EAB\u4E2D\u2026");try{let[x,j]=await Promise.all([U.benchmarkSuites(),U.benchmarkReadyQuestions(300)]);n.suites=x.suites||[],n.ready=j.items||[];let W=H();if(n.suiteAnswersError="",n.suiteAnswersLoading=!1,W&&(N||!n.suiteAnswers[String(W.id)]))try{let F=await U.benchmarkSuiteLatestAnswers(W.id);n.suiteAnswers[String(W.id)]=F.answers||{}}catch(F){n.suiteAnswersError=F.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}l(D),D.innerHTML=Ai(n)}catch(x){l(D),D.innerHTML=`<section class="report-card qb-card">${Ee({tone:"danger",title:"Benchmark \u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:r(x.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},ne=()=>{let N=i("review");N&&(N.innerHTML=Md(n))},ge=async N=>{let D=n.reviewItems.find(j=>Number(j.id)===Number(N));if(!D)return;n.reviewDetail=D,ne();let x=i("review")?.querySelector(".qb-review-detail-pane");x&&window.matchMedia("(max-width: 1020px)").matches&&x.scrollIntoView({behavior:"smooth",block:"start"});try{let j=await U.questionBankItem(D.id);Number(n.reviewDetail?.id)===Number(D.id)&&(n.reviewDetail=j,ne())}catch(j){M(j.message||"\u984C\u76EE\u5167\u5BB9\u8B80\u53D6\u5931\u6557\u3002","danger")}},V=async()=>{let N=i("review");if(!N)return;o(N,"\u8B80\u53D6\u9A57\u6536\u984C\u76EE\u4E2D\u2026");let D=n.reviewFilter||"queue",x=D==="queue"?["pending_review","changes_requested"]:D==="accepted"?["accepted"]:D==="rejected"?["rejected"]:["draft"];try{let j=await Promise.all(x.map(Re=>U.questionBankItems({status:Re},200,0)));n.reviewItems=j.flatMap(Re=>Re.items||[]),n.stats=j[0]?.stats||n.stats;let W=Number(n.reviewDetail?.id||0),Ie=n.reviewItems.some(Re=>Number(Re.id)===W)?W:Number(n.reviewItems[0]?.id||0);n.reviewDetail=Ie?await U.questionBankItem(Ie):null,l(N),ne(),$()}catch(j){l(N),N.innerHTML=`<section class="report-card qb-card">${Ee({tone:"danger",title:"\u9A57\u6536\u984C\u76EE\u8B80\u53D6\u5931\u6557",text:r(j.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}};function Z(N){let D=n.tab;n.tab=N;for(let x of Object.keys(a)){let j=i(x);j&&(j.hidden=x!==N)}N==="create"?(D!=="create"&&!n.editing&&(n.aiQuestion="",n.aiResult=null),p()):N==="manage"?S():N==="suite"?C():N==="review"&&V()}let ae=N=>{let x=[...n.items,...n.reviewItems,...n.reviewDetail?[n.reviewDetail]:[]].find(W=>Number(W.id)===Number(N));n.reviewDetail=x||{id:Number(N)};let j=x?.status;["accepted","rejected","draft"].includes(j)?n.reviewFilter=j:j&&(n.reviewFilter="queue"),h("review")},ee=async N=>{let D=Cd(N),x=Number(N.elements.item_id?.value||0);x||(D.status=N.elements.submit_for_review?.checked?"pending_review":"draft");try{x?(await U.updateQuestionBankItem(x,{...D,change_note:"\u984C\u5EAB\u7BA1\u7406\u4FEE\u6539"}),M("\u5DF2\u5EFA\u7ACB\u65B0\u7248\u672C\uFF0C\u72C0\u614B\u56DE\u5230\u5F85\u5BE9\u3002","ok")):(await U.createQuestionBankItem(D),M(D.status==="draft"?"\u984C\u76EE\u5DF2\u5B58\u70BA\u8349\u7A3F\uFF0C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002":"\u984C\u76EE\u5DF2\u5EFA\u7ACB\u4E26\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok")),n.editing=null;let j=["manage","suite","review"].includes(n.editingFrom)?n.editingFrom:"manage";n.editingFrom="",n.suiteAnswers={},await g(),h(j)}catch(j){let W=j.detail||j.payload?.detail,F=W?.errors?.join(" \xB7 ")||W?.message||j.message||"\u984C\u76EE\u5132\u5B58\u5931\u6557\u3002";M(F,"danger",8e3)}},_e=async N=>{let D=String(new FormData(N).get("question")||"").trim();if(D.length<4){M("\u984C\u76EE\u81F3\u5C11\u9700\u8981 4 \u500B\u5B57\u3002","danger");return}n.aiQuestion=D,n.aiLoading=!0,n.aiResult=null,p();try{let x=await U.createQuestionBankItemWithAI({question:D});n.aiResult=x,n.aiQuestion="",await g(),M(`Ollama \u5DF2\u5EFA\u7ACB\u984C\u76EE #${x.item.id}\uFF0C\u72C0\u614B\u70BA\u5F85\u5BE9\uFF0C\u8ACB\u4EBA\u5DE5\u8986\u6838\u3002`,"ok",8e3)}catch(x){let j=x.detail||x.payload?.detail,W=j?.errors?.join(" \xB7 ")||j?.message||x.message||"Ollama \u7522\u751F\u5931\u6557\u3002";M(W,"danger",12e3)}finally{n.aiLoading=!1,p()}},z=async(N,D)=>{let x=Number(N.dataset.id||0);if(x)try{await U.reviewQuestionBankItem(x,{decision:D,reviewer:v(),rubric_scores:Rd(N),comment:String(N.querySelector('[name="comment"]')?.value||"")}),M(D==="approved"?"\u984C\u76EE\u5DF2\u6838\u51C6\u3002":D==="changes_requested"?"\u5DF2\u9000\u56DE\u4FEE\u6539\u3002":"\u984C\u76EE\u5DF2\u62D2\u7D55\u3002",D==="approved"?"ok":"info"),await g(),await V()}catch(j){let W=j.detail||j.payload?.detail,F=W?.errors?.join(" \xB7 ")||W?.message||j.message||"\u9A57\u6536\u5931\u6557\u3002";M(F,"danger",8e3)}},be=async N=>{let D=new FormData(N),x=Number(D.get("suite_id")||0),j=Array.from(N.querySelectorAll('input[name="item_ids"]:checked')).map(F=>Number(F.value)),W={name:String(D.get("name")||"").trim(),tier:String(D.get("tier")||"core"),description:String(D.get("description")||"").trim(),item_ids:j};try{x?(await U.updateBenchmarkSuite(x,W),M("Benchmark \u984C\u5EAB\u5DF2\u66F4\u65B0\u3002","ok")):(await U.createBenchmarkSuite(W),M("Benchmark \u984C\u5EAB\u5DF2\u5EFA\u7ACB\u3002","ok")),n.editingSuite=null,n.suiteManageOpen=!0,n.suiteAnswers={},await C()}catch(F){let Ie=F.detail||F.payload?.detail,Re=Ie?.errors?.join(" \xB7 ")||Ie?.message||F.message||"Suite \u5132\u5B58\u5931\u6557\u3002";M(Re,"danger",8e3)}},Me=async N=>{let D=e.querySelector("[data-qb-tag-filter] [data-qb-tag-popover]:not([hidden])")?.closest("[data-qb-tag-filter]");D&&!N.target.closest("[data-qb-tag-filter]")&&E(D);let x=N.target.closest("[data-qb-action]")?.dataset.qbAction;if(!x)return;let j=N.target.closest("[data-qb-action]"),W=Number(j.dataset.id||0);if(x==="open-tag-search"){let F=j.closest("[data-qb-tag-filter]");L(F,{focus:!0});return}if(x==="select-tag"){await T(j.dataset.tag);return}if(x==="remove-tag"){await T(j.dataset.tag);return}if(x==="bank-tab"){J(j.dataset.tab);return}if(x==="select-bank-item"){n.selectedBankItemId=W,B();return}if(x==="new"){n.editing=null,n.editingFrom="",n.aiQuestion="",n.aiResult=null,n.aiLoading=!1,h("create");return}if(x==="reset-create"){n.editing=null,p();return}if(x==="reset-ai"){n.aiQuestion="",n.aiResult=null,n.aiLoading=!1,p();return}if(x==="edit"){let F=n.suites.find(Be=>Number(Be.id)===Number(n.selectedSuiteId)),Re=[...n.items,...n.reviewItems,...F?.items||[],...n.reviewDetail?[n.reviewDetail]:[]].find(Be=>Number(Be.id)===W);if(!Re)return;n.editing=Re,n.editingFrom=n.tab,h("create");return}if(x==="review"){ae(W);return}if(x==="review-ai-item"){let F=n.aiResult?.item;if(!F)return;n.reviewFilter="queue",n.reviewDetail=F,h("review");return}if(x==="review-filter"){let F=String(j.dataset.filter||"queue");n.reviewFilter=["queue","accepted","rejected","draft"].includes(F)?F:"queue",n.reviewDetail=null,await V();return}if(x==="select-review-item"){await ge(W);return}if(x==="go-manage"){h("manage");return}if(x==="submit-review"){try{await U.submitQuestionBankItemForReview(W),M("\u5DF2\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok"),await g(),n.tab==="manage"?await S():n.tab==="review"&&await V()}catch(F){let Ie=F.detail||F.payload?.detail,Re=Ie?.errors?.join(" \xB7 ")||Ie?.message||F.message||"\u9001\u5BE9\u5931\u6557\u3002";M(Re,"danger",8e3)}return}if(x==="restore"){if(!window.confirm(`\u78BA\u5B9A\u5FA9\u539F\u984C\u76EE #${W}\uFF1F\u5FA9\u539F\u5F8C\u6703\u56DE\u5230\u5F85\u5BE9\u72C0\u614B\uFF0C\u9700\u91CD\u65B0\u9A57\u6536\u3002`))return;try{await U.restoreQuestionBankItem(W),M("\u984C\u76EE\u5DF2\u5FA9\u539F\u4E26\u56DE\u5230\u5F85\u5BE9\u3002","ok"),await g(),await S()}catch(F){let Ie=F.detail||F.payload?.detail,Re=Ie?.errors?.join(" \xB7 ")||Ie?.message||F.message||"\u5FA9\u539F\u5931\u6557\u3002";M(Re,"danger",8e3)}return}if(x==="delete"){if(n.tab==="suite"){let F=H();if(!F||!(F.items||[]).find(Re=>Number(Re.id)===W)||!window.confirm(`\u78BA\u5B9A\u5F9E\u300C${F.name}\u300D\u79FB\u9664\u984C\u76EE #${W}\uFF1F\u984C\u76EE\u4ECD\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u7BA1\u7406\u4E2D\u3002`))return;try{await U.removeBenchmarkSuiteItem(F.id,W),M("\u5DF2\u5F9E Benchmark \u984C\u5EAB\u79FB\u9664\u3002","info"),delete n.suiteAnswers[String(F.id)],Number(n.selectedBankItemId)===W&&(n.selectedBankItemId=null),await C()}catch(Re){M(Re.message||"\u79FB\u9664\u5931\u6557\u3002","danger")}return}if(!window.confirm(`\u78BA\u5B9A\u522A\u9664\u984C\u76EE #${W}\uFF1F\u984C\u76EE\u6703\u6A19\u8A18\u70BA retired\uFF0C\u6B77\u53F2 benchmark \u4ECD\u6703\u4FDD\u7559\u3002`))return;try{await U.deleteQuestionBankItem(W),M("\u984C\u76EE\u5DF2\u522A\u9664\u3002","info"),await g(),n.tab==="review"?(n.reviewDetail=null,await V()):await S()}catch(F){M(F.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(x==="revalidate"){try{let F=await U.revalidateQuestionBank();M(`\u5DF2\u91CD\u65B0\u9A57\u8B49 ${u(F.checked||0)} \u984C\uFF0C${u(F.stale||0)} \u984C\u9700\u91CD\u65B0\u9A57\u6536\u3002`,"info",7e3),await g(),await S()}catch(F){M(F.message||"\u91CD\u65B0\u9A57\u8B49\u5931\u6557\u3002","danger")}return}if(x==="export"){try{let F=await U.exportQuestionBank({status:""});Ot(`judgment-question-bank-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(F,null,2),"application/json;charset=utf-8")}catch(F){M(F.message||"\u532F\u51FA\u5931\u6557\u3002","danger")}return}if(x==="import-json"){let F=e.querySelector("#qb-import-json");try{let Ie=JSON.parse(String(F?.value||"").trim()),Re=await U.importQuestionBank(Ie);M(`\u532F\u5165\u5B8C\u6210\uFF1A\u65B0\u589E ${Re.created}\u3001\u66F4\u65B0 ${Re.updated}\u3001\u932F\u8AA4 ${(Re.errors||[]).length}\u3002`,(Re.errors||[]).length?"warn":"ok",8e3),F&&(F.value=""),await g(),await S()}catch(Ie){M(Ie.message||"JSON \u532F\u5165\u5931\u6557\u3002","danger",8e3)}return}if(x==="prev"||x==="next"){n.offset=Math.max(0,n.offset+(x==="next"?n.limit:-n.limit)),await S();return}if(x==="suite-edit"){let F=n.suites.find(Ie=>Number(Ie.id)===W);if(!F)return;n.editingSuite=F,n.suiteManageOpen=!0,C();return}if(x==="suite-new"){n.editingSuite=null,n.suiteManageOpen=!0,C();return}if(x==="suite-freeze"){try{await U.updateBenchmarkSuite(W,{freeze:!0}),M("Benchmark \u984C\u5EAB\u5DF2\u51CD\u7D50\u4E26\u5EFA\u7ACB\u65B0\u7248\u672C\u3002","ok"),n.editingSuite=null,n.suiteManageOpen=!0,await C()}catch(F){M(F.message||"\u51CD\u7D50\u5931\u6557\u3002","danger")}return}if(x==="suite-delete"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 benchmark \u984C\u5EAB #${W}\uFF1F\u6B77\u53F2 run \u4ECD\u6703\u4FDD\u7559 snapshot\u3002`))return;try{await U.deleteBenchmarkSuite(W),M("Benchmark \u984C\u5EAB\u5DF2\u522A\u9664\u3002","info"),n.editingSuite=null,n.suiteAnswers={},n.suiteManageOpen=!0,await C()}catch(F){M(F.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(x==="decide"){let F=j.closest("form[data-qb-form='review']");F&&await z(F,String(j.dataset.decision||""))}},pe=async N=>{let D=N.target.closest("[data-qb-form]");if(!D)return;N.preventDefault();let x=D.dataset.qbForm;if(x==="create")await ee(D);else if(x==="ai-create")await _e(D);else if(x==="filter"){let j=new FormData(D);n.filters={query:String(j.get("query")||"").trim(),status:String(j.get("status")||""),question_type:String(j.get("question_type")||""),difficulty:String(j.get("difficulty")||""),tags:j.getAll("tags").map(W=>String(W).trim()).filter(Boolean)},n.offset=0,await S()}else x==="suite"&&await be(D)},tt=async N=>{let D=N.target.closest?.("form[data-qb-form='filter'] select");if(D){D.form.requestSubmit();return}let x=N.target.closest?.("[data-qb-suite-select]");if(!x)return;let j=Number(x.value||0);!j||j===Number(n.selectedSuiteId)||await Ae(j)},Oe=N=>{let D=N.target;D?.matches?.(".qb-suite-manage")&&(n.suiteManageOpen=!!D.open)},He=N=>{let D=N.target.closest?.("[data-qb-action='open-tag-search']");D&&L(D.closest("[data-qb-tag-filter]"))},Le=N=>{let D=N.target.closest?.("[data-qb-tag-filter]");D&&(N.relatedTarget&&D.contains(N.relatedTarget)||E(D))},Qe=N=>{let D=N.target.closest?.("[data-qb-tag-search]");if(!D)return;let x=D.closest("[data-qb-tag-filter]");c&&window.clearTimeout(c),c=window.setTimeout(()=>{k(x,D.value)},160)},Ye=N=>{let D=N.target.closest?.("[data-qb-tag-search]");if(!D)return;let x=D.closest("[data-qb-tag-filter]");N.key==="Escape"?(N.preventDefault(),E(x),D.blur()):N.key==="Enter"?(N.preventDefault(),x?.querySelector("[data-qb-action='select-tag']")?.click()):N.key==="ArrowDown"&&(N.preventDefault(),x?.querySelector("[data-qb-action='select-tag']")?.focus())};e.addEventListener("click",Me),e.addEventListener("submit",pe),e.addEventListener("change",tt),e.addEventListener("toggle",Oe,!0),e.addEventListener("mouseover",He),e.addEventListener("mouseout",Le),e.addEventListener("input",Qe),e.addEventListener("keydown",Ye);let ft=async()=>{await g(),n.tab==="create"?p():n.tab==="manage"?await S():n.tab==="suite"?await C({refreshAnswers:!0}):n.tab==="review"&&await V()};return g(),{show:Z,refresh:ft,destroy(){c&&window.clearTimeout(c),e.removeEventListener("click",Me),e.removeEventListener("submit",pe),e.removeEventListener("change",tt),e.removeEventListener("toggle",Oe,!0),e.removeEventListener("mouseover",He),e.removeEventListener("mouseout",Le),e.removeEventListener("input",Qe),e.removeEventListener("keydown",Ye)},getStats:()=>n.stats}}function Aa(e){if(e==null||e==="")return"\u2014";let t=Number(e);return Number.isFinite(t)?`${t.toFixed(t>=10?1:2)}%`:"\u2014"}function Ei(e){return e==null?"\u2014":u(e)}function Pd(e){return e.count?e.severity==="danger"?Je("failed","\u9700\u8655\u7406"):e.severity==="warn"?Je("warning","\u6CE8\u610F"):Je("preview","\u63D0\u793A"):Je("success","\u901A\u904E")}function Id(e){return e.count?e.severity==="danger"?"is-danger":e.severity==="warn"?"is-warn":"is-info":"is-ok"}function Bd(e){let t=Number(e.count)||0,s=Math.max(0,Math.min(100,Number(e.percent)||0));return`<div class="quality-check ${Id(e)}">
    <div class="quality-check-head">
      <span class="quality-check-label">${r(e.label)}</span>
      ${Pd(e)}
    </div>
    <div class="quality-check-value">
      <strong>${u(t)}</strong>
      <span>\u7B46</span>
      <em>${r(Aa(e.percent))}</em>
    </div>
    <div class="quality-check-desc">${r(e.description)}</div>
    <div class="quality-check-track" aria-hidden="true">
      <span style="width:${s}%"></span>
    </div>
  </div>`}function qa(e,t,s){let a=Array.isArray(s)?s:[];if(!a.length)return`<div class="index-chart-card">
      <div class="index-chart-head"><span>${r(e)}</span><span>${r(t)}</span></div>
      <div class="index-chart-empty">DuckDB \u6383\u63CF\u5F8C\u6C92\u6709\u53EF\u5448\u73FE\u7684\u8CC7\u6599\u3002</div>
    </div>`;let n=Math.max(...a.map(i=>Number(i.value)||0),1);return`<div class="index-chart-card">
    <div class="index-chart-head"><span>${r(e)}</span><span>${r(t)}</span></div>
    <div class="distribution">
      ${a.map(i=>{let o=Number(i.value)||0,l=Math.max(1.5,o/n*100);return`<div class="dist-row">
            <span class="dist-label" title="${r(i.label||"\u672A\u5206\u985E")}">${r(i.label||"\u672A\u5206\u985E")}</span>
            <span class="dist-track"><span class="dist-bar" style="width:${l.toFixed(2)}%"></span></span>
            <span class="dist-value">${u(o)}</span>
          </div>`}).join("")}
    </div>
  </div>`}function Od(e){let t=e.coverage||{},s=e.totals||{},a=e.source||{},n=t.postgres_diff,i=n==null?"\u2014":n===0?"\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u4E00\u81F4":`\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u76F8\u5DEE ${u(Math.abs(n))} \u7B46`,o=t.vector_indexed===null||t.vector_indexed===void 0?t.detail||"\u7121\u6CD5\u53D6\u5F97\u7D22\u5F15\u7D71\u8A08":`${u(t.vector_indexed)} / ${u(t.vector_total)} \xB7 ${t.model||"\u2014"}`;return`<div class="metric-grid quality-coverage-grid">
    <div class="metric-card">
      <div class="metric-label">${m("filter",13)}<span>\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D</span></div>
      <div class="metric-value">${u(s.matched_rows)}</div>
      <div class="metric-foot">citation_count &gt; 0\uFF1B\u5171 ${u(s.citation_total)} \u7B46\u5F15\u7528</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${m("database",13)}<span>PostgreSQL \u6536\u9304</span></div>
      <div class="metric-value">${Ei(t.postgres_judgments)}</div>
      <div class="metric-foot">${r(i)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${m("brain",13)}<span>\u5411\u91CF\u7D22\u5F15</span></div>
      <div class="metric-value">${r(Aa(t.vector_coverage_pct))}</div>
      <div class="metric-foot">${r(o)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${m("layers",13)}<span>DuckDB \u5019\u9078</span></div>
      <div class="metric-value">${Ei(a.candidate_total)}</div>
      <div class="metric-foot">${u(a.candidate_archive_count)} / ${u(a.archive_count)} \u500B manifest \u6709 candidate_count</div>
    </div>
  </div>`}function Dd(e){return e.length?`<div class="table-wrap">
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
        ${e.map(t=>{let s=(Number(t.missing_court_rows)||0)+(Number(t.missing_normalized_rows)||0)+(Number(t.missing_date_rows)||0)+(Number(t.invalid_date_rows)||0)+(Number(t.missing_title_rows)||0),a=t.candidate_count===null||t.candidate_count===void 0?"\u2014":u(t.candidate_count);return`<tr>
              <td class="cell-jid">
                <span class="mono">${r(t.archive||"\u2014")}</span>
                ${t.version?`<span class="chip">v${r(t.version)}</span>`:""}
              </td>
              <td class="cell-number">${u(t.rows)}</td>
              <td class="cell-number">${a}</td>
              <td class="cell-number">${u(t.matched_rows)}</td>
              <td class="cell-number">${r(Aa(t.match_rate))}</td>
              <td class="cell-number">${u(t.short_text_rows)}</td>
              <td class="cell-number">${u(s)}</td>
              <td class="cell-number">${u(t.duplicate_content_rows)}</td>
              <td class="cell-date">${r(It(t.date_min))} \u2013 ${r(It(t.date_max))}</td>
            </tr>`}).join("")}
      </tbody>
    </table>
  </div>`:ct({iconName:"table",title:"\u6C92\u6709\u539F\u59CB Parquet \u6A94\u6848",text:"\u5B8C\u6210\u5224\u6C7A RAR \u532F\u5165\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6BCF\u500B\u58D3\u7E2E\u6A94\u7684 DuckDB \u7D71\u8A08\u3002"})}function Fd(e){let t=e.totals||{},s=e.source||{},a=Array.isArray(e.checks)?e.checks:[],n=e.summary||{},i=e.distributions||{},o=Array.isArray(e.warnings)?e.warnings:[],l=Ne(s.compressed_bytes||0);return`<div class="report-card quality-report" data-database="quality">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">DUCKDB DATA QUALITY</div>
        <div class="report-title">
          \u539F\u59CB Parquet \u8CC7\u6599\u54C1\u8CEA ${Je(e.status||"operational")}
          <span class="chip">raw.parquet</span>
        </div>
        <div class="report-sub">
          ${u(t.rows)} \u7B46 \xB7 ${u(s.raw_files)} \u500B\u6A94\u6848 \xB7
          ${l} \xB7 \u6383\u63CF ${me(e.scan_ms||0)} \xB7
          ${r(qe(e.generated_at))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-quality">
          ${m("download",14)}<span>JSON</span>
        </button>
      </div>
    </div>
    ${o.length?`<div class="report-alert">${Ee({tone:"warn",title:"\u76EE\u524D\u9650\u5236\u8207\u5DEE\u7570",text:o.map(d=>r(d)).join("<br>")})}</div>`:""}
    <div class="summary-strip quality-summary-strip">
      <div class="summary-item">
        <div class="summary-label">\u539F\u59CB\u7B46\u6578</div>
        <div class="summary-value">${u(t.rows)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">\u7CBE\u78BA\u547D\u4E2D</div>
        <div class="summary-value">${u(t.matched_rows)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">\u547D\u4E2D\u7387</div>
        <div class="summary-value">${r(Aa(t.match_rate))}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">\u91CD\u8907\u6848\u865F</div>
        <div class="summary-value">${u(t.duplicate_jid_rows)}</div>
      </div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u54C1\u8CEA\u6AA2\u67E5</span>
        <span class="muted" style="font-size:9.5px">
          ${u(n.ok_count)} \u9805\u901A\u904E \xB7
          ${u(n.warning_count)} \u9805\u6CE8\u610F \xB7
          ${u(n.danger_count)} \u9805\u9700\u8655\u7406 \xB7
          ${u(n.info_count)} \u9805\u63D0\u793A
        </span>
      </div>
      <div class="quality-checks">${a.map(Bd).join("")}</div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6536\u9304\u8986\u84CB</span>
        <span class="muted" style="font-size:9.5px">PostgreSQL \u8207\u5411\u91CF\u7D22\u5F15\u70BA\u5373\u6642\u67E5\u8A62\uFF0C\u4E0D\u662F\u5F9E Parquet \u63A8\u4F30</span>
      </div>
      ${Od(e)}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6A94\u6848\u660E\u7D30</span>
        <span class="muted" style="font-size:9.5px">${u(s.archive_count)} \u500B\u539F\u59CB Parquet</span>
      </div>
      ${Dd(Array.isArray(e.archives)?e.archives:[])}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u5206\u5E03\u7D71\u8A08</span>
        <span class="muted" style="font-size:9.5px">DuckDB group by / unnest</span>
      </div>
      <div class="quality-dist-grid">
        ${qa("\u6CD5\u9662","\u5224\u6C7A\u7B46\u6578",i.courts)}
        ${qa("\u88C1\u5224\u5E74\u4EFD","\u5224\u6C7A\u7B46\u6578",i.years)}
        ${qa("\u71B1\u9580\u6CD5\u898F","\u63D0\u53CA\u5224\u6C7A\u6578",i.laws)}
        ${qa("\u71B1\u9580\u6848\u7531","\u5224\u6C7A\u7B46\u6578",i.titles)}
      </div>
    </div>
  </div>`}async function zd(e){e.innerHTML=`<section class="page data-page quality-page">
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
  </section>`;let t=e.querySelector("#quality-content"),s=e.querySelector("#quality-refresh"),a=e.querySelector("#quality-meta"),n=[...e.querySelectorAll("[data-quality-tab]")],i={overview:e.querySelector("#quality-panel-overview"),create:e.querySelector("#quality-panel-question-create"),manage:e.querySelector("#quality-panel-question-manage"),suite:e.querySelector("#quality-panel-benchmark-bank"),review:e.querySelector("#quality-panel-question-review")},o=null,l="overview",d=()=>{if(!o)return;t.innerHTML=Fd(o),a.textContent=`DUCKDB \xB7 ${u(o.totals?.rows)} \u7B46 \xB7 ${me(o.scan_ms||0)}`;let p=e.querySelector("#quality-badge-overview");p&&(p.textContent=u(o.totals?.rows||0))},c=p=>{l=p==="overview"?"overview":p;for(let w of n){let k=w.dataset.qualityTab===l;w.classList.toggle("is-active",k),k?w.setAttribute("aria-current","page"):w.removeAttribute("aria-current")}for(let[w,k]of Object.entries(i))k&&(k.hidden=w!==l);l!=="overview"?a.textContent="QUESTION BANK \xB7 \u984C\u5EAB\u5DE5\u4F5C\u5340":o&&d()},v=Ni(e,{onNavigate:p=>c(p),onStats:p=>{let w=p||{},k=e.querySelector("#quality-badge-manage"),L=e.querySelector("#quality-badge-suite"),E=e.querySelector("#quality-badge-review");k&&(k.textContent=u(w.total||0)),L&&(L.textContent=u(w.benchmark_ready||0)),E&&(E.textContent=u((w.pending_review||0)+(w.changes_requested||0)))}}),$=p=>{c(p),p!=="overview"&&v.show(p)},h=async()=>{ke(s,!0,"\u6383\u63CF\u4E2D\u2026");try{o=await U.quality(),d()}catch(p){t.innerHTML=`<div class="report-card">
        <div class="report-head">
          <div class="report-title-group">
            <div class="report-kicker">DUCKDB DATA QUALITY</div>
            <div class="report-title">\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557</div>
            <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
          </div>
        </div>
        <div class="report-section">
          ${Ee({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u54C1\u8CEA\u7D71\u8A08",text:r(p.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
        </div>
      </div>`,a.textContent="DUCKDB \xB7 \u8B80\u53D6\u5931\u6557",M("\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}finally{ke(s,!1)}},g=async()=>{l==="overview"?await h():await v.refresh()};s.addEventListener("click",g),e.addEventListener("click",p=>{let w=p.target.closest("[data-quality-tab]");w&&$(w.dataset.qualityTab||"overview")}),t.addEventListener("click",p=>{!p.target.closest("[data-action='export-quality']")||!o||Ot(`judgment-quality-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(o,null,2),"application/json;charset=utf-8")}),c("overview"),await h()}var In={};Wt(In,{render:()=>yu});var Ma={};Wt(Ma,{render:()=>Pn});var Ri={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"};function Ci(e,t){let s=Array.isArray(t)?t:[];return`<div class="tests-model-group">
    <span class="tests-model-label">${r(e)}</span>
    <div class="tests-model-chips">${s.length?s.map(a=>`<span class="chip chip-mono">${r(a)}</span>`).join(""):'<span class="tests-model-empty">\u672A\u5075\u6E2C\u5230\u6A21\u578B</span>'}</div>
  </div>`}function Hd(e){let t=e?.supports_chat,s=t===!0?"badge-ok":t===!1?"badge-danger":"badge-neutral",a=t===!0?"\u652F\u63F4 chat":t===!1?"\u4E0D\u652F\u63F4 chat":"\u672A\u6E2C\u8A66",n=(Array.isArray(e?.capabilities)?e.capabilities:[]).map(i=>`<span class="chip chip-mono">${r(i)}</span>`).join("");return`<div class="tests-llm-row">
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
  </div>`}function Ud(e){let t=Array.isArray(e?.models)?e.models:[],s=e?.counts||{},a=Array.isArray(e?.failures)?e.failures:[];return{summary:e?`<span>Ollama <strong>${s.available??t.length}</strong> \u500B\u6A21\u578B</span>
      <span>\u652F\u63F4 chat <strong>${s.chat??0}</strong></span>
      <span>\u4E0D\u652F\u63F4 <strong>${s.unsupported??0}</strong></span>
      <span>\u672A\u6E2C\u8A66 <strong>${s.untested??0}</strong></span>
      <span>\u672C\u6B21\u65B0\u6E2C <strong>${(e.tested_now||[]).length}</strong></span>
      <span class="muted">${r(e.detail||"")}</span>`:"<span>\u6B63\u5728\u8B80\u53D6 Ollama \u6A21\u578B\u6E05\u55AE\u2026</span>",list:t.length?t.map(Hd).join(""):'<div class="tests-llm-empty">\u5C1A\u7121\u6A21\u578B\u8CC7\u6599\uFF1B\u8ACB\u78BA\u8A8D Ollama \u5DF2\u555F\u52D5\u4E26\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66\u3002</div>',failures:a.length?`<div class="tests-llm-failures">${a.map(i=>`<span><strong class="mono">${r(i.model||"\u2014")}</strong> ${r(i.detail||"\u6E2C\u8A66\u5931\u6557")}</span>`).join("")}</div>`:""}}function Qd(e){let t=String(e?.status||"degraded"),s=t==="operational"?"badge-ok":t==="disabled"?"badge-neutral":"badge-danger",a=Array.isArray(e?.scores)?e.scores.slice(0,4):[],n=Array.isArray(e?.results)?e.results[0]:null;return`<div class="tests-llm-row">
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
  </div>`}function Gd(e){if(!e)return{summary:"<span>\u6B63\u5728\u8B80\u53D6 reranker \u72C0\u614B\u2026</span>",list:"",failures:""};let t=Array.isArray(e.providers)?e.providers:[],s=e.active||{},a=String(e.status||"degraded"),n=a==="operational"?"badge-ok":a==="not_configured"?"badge-neutral":"badge-danger",i=t.flatMap(o=>(o.errors||[]).map(l=>({model:o.url,detail:l})));return{summary:`<span>\u72C0\u614B <span class="badge ${n}">${r(a)}</span></span>
      <span>\u6A21\u578B <strong>${r(e.model||"\u2014")}</strong></span>
      <span>\u555F\u7528 <strong>${e.enabled?"true":"false"}</strong></span>
      ${s.url?`<span>\u4F5C\u7528\u4E2D <strong class="mono">${r(s.url)}</strong></span>`:""}
      <span class="muted">${r(e.detail||"")}</span>`,list:t.length?t.map(Qd).join(""):'<div class="tests-llm-empty">\u6C92\u6709\u8A2D\u5B9A RERANK_URL\uFF1B\u8ACB\u8A2D\u5B9A primary \u6216 fallback reranker\u3002</div>',failures:i.length?`<div class="tests-llm-failures">${i.map(o=>`<span><strong class="mono">${r(o.model||"\u2014")}</strong> ${r(o.detail||"\u6E2C\u8A66\u5931\u6557")}</span>`).join("")}</div>`:""}}function Jd(e,t,s){return JSON.stringify({selected:s,runs:(t||[]).map(a=>`${a.run_id}:${a.status}`),run:e?{run_id:e.run_id,status:e.status,progress:e.progress,total_ms:e.total_ms,steps:(e.steps||[]).map(a=>`${a.stage}:${a.model}:${a.status}:${a.progress}:${a.duration_ms}`)}:null})}async function Pn(e,t,{embedded:s=!1}={}){let a=!1,n=!1,i={embedding:[],llm:[]},o=!1,l=null,d=!1,c=null,v=!1,$=null,h=[],g="",p=null,w="",k=`<div class="page-actions">
      <span class="badge badge-neutral badge-mono" id="tests-mode-badge">\u8B80\u53D6\u4E2D</span>
      <button class="btn btn-secondary" type="button" id="tests-refresh">
        ${m("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
      </button>
    </div>`,L=s?`<div class="tests-embed-head">
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
    ${L}

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
  </section>`;let E=e.querySelector("#tests-mode-badge"),T=e.querySelector("#tests-mode-toggle"),H=e.querySelector("#tests-mode-summary"),G=e.querySelector("#tests-mode-models"),Y=e.querySelector("#tests-mode-status"),ye=e.querySelector("#tests-api-form"),Ae=e.querySelector("#tests-api-input"),J=e.querySelector("#tests-api-preview"),B=e.querySelector("#tests-api-status"),S=e.querySelector("#tests-api-note"),C=e.querySelector("#tests-api-test"),ne=e.querySelector("#tests-api-reset"),ge=e.querySelector("#tests-api-save"),V=e.querySelector("#tests-refresh"),Z=e.querySelector("#tests-flow"),ae=e.querySelector("#tests-llm-summary"),ee=e.querySelector("#tests-llm-list"),_e=e.querySelector("#tests-llm-failures"),z=e.querySelector("#tests-llm-status"),be=e.querySelector("#tests-llm-test"),Me=e.querySelector("#tests-rerank-summary"),pe=e.querySelector("#tests-rerank-list"),tt=e.querySelector("#tests-rerank-failures"),Oe=e.querySelector("#tests-rerank-status"),He=e.querySelector("#tests-rerank-test"),Le=(X,$e,ze="")=>{X&&(X.textContent=$e,X.className=`tests-status${ze?` is-${ze}`:""}`)},Qe=(X,$e="")=>{B&&(B.textContent=X,B.className=`api-dialog-status${$e?` is-${$e}`:""}`)},Ye=()=>Xt()==="query",ft=()=>{let X=Kt(Ae.value);return X||(window.location.protocol==="file:"?Pa:"")},N=()=>{let X=ft(),$e=Yt(),ze=Ri[Xt()]||Xt()||"\u540C\u6E90";J.innerHTML=`\u76EE\u524D\u751F\u6548\uFF1A<strong>${r(os($e))}</strong>${$e?`\uFF08${r(ze)}\uFF09`:""}<br />\u6B64\u4F4D\u5740\u7684\u5065\u5EB7\u6AA2\u67E5\uFF1A${r(yt("/api/health",X))}`},D=()=>{let X=Xt(),$e=`\u76EE\u524D\u4F86\u6E90\uFF1A${Ri[X]||X||"\u540C\u6E90"}\u3002\u512A\u5148\u9806\u5E8F\u70BA ?api= \u2192 \u700F\u89BD\u5668\u5132\u5B58\u503C \u2192 config.js \u2192 \u540C\u6E90\u3002`,ze="";X==="query"?(ze="is-warn",$e="\u6B64\u9801\u7531\u7DB2\u5740\u7684 ?api= \u53C3\u6578\u6307\u5B9A\u5F8C\u7AEF\u4F4D\u5740\uFF0C\u5177\u6709\u6700\u9AD8\u512A\u5148\u9806\u5E8F\u3002\u5132\u5B58\u6216\u6062\u5FA9\u9810\u8A2D\u5728\u6B64\u9801\u4E0D\u6703\u751F\u6548\uFF1B\u8ACB\u5148\u79FB\u9664\u7DB2\u5740\u4E2D\u7684 api \u53C3\u6578\u3002"):Ws()?(ze="is-warn",$e="\u6B64\u9801\u4E0D\u662F\u5F9E localhost \u958B\u555F\uFF0C\u4E14\u5C1A\u672A\u8A2D\u5B9A\u5F8C\u7AEF API\u3002\u8ACB\u586B\u5165 cloudflared \u7684 https:// \u4F4D\u5740\uFF0C\u6216\u90E8\u7F72\u6642\u5728 config.js \u6307\u5B9A apiBase\uFF1BHTTP \u4F4D\u5740\u6703\u88AB HTTPS \u9801\u9762\u963B\u64CB\u3002"):(X==="file-default"||window.location.protocol==="file:")&&($e="\u4EE5 file:// \u76F4\u63A5\u958B\u555F\u6642\uFF0C\u9810\u8A2D\u9023\u5230 http://127.0.0.1:9200\u3002\u82E5\u5F8C\u7AEF\u4F7F\u7528\u5176\u4ED6\u9023\u63A5\u57E0\uFF0C\u8ACB\u5728\u6B64\u4FEE\u6539\u4E26\u5132\u5B58\u3002"),S.textContent=$e,S.className=`api-dialog-note${ze?` ${ze}`:""}`;let Ve=X==="query";ge.disabled=Ve,ne.disabled=Ve,Ae.readOnly=Ve},x=()=>{if(!Ia(Ae.value))return Qe("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002","error"),Ae.focus(),null;let X=ft();return window.location.protocol==="https:"&&/^http:\/\//i.test(X)&&!/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(X)?(Qe("HTTPS \u9801\u9762\u7121\u6CD5\u9023\u7DDA\u5230 HTTP API\uFF08mixed content\uFF09\u3002\u8ACB\u6539\u7528 cloudflared \u63D0\u4F9B\u7684 https:// \u4F4D\u5740\u3002","error"),Ae.focus(),null):X},j=()=>{Ae.value=Yt(),N(),D(),Qe("\u53EF\u5148\u6E2C\u8A66\u9023\u7DDA\uFF0C\u5132\u5B58\u5F8C\u9801\u9762\u6703\u91CD\u65B0\u8F09\u5165\u3002")},W=()=>{let X=Array.isArray(i.embedding)?i.embedding.length:0,$e=Array.isArray(i.llm)?i.llm.length:0;if(E&&(E.textContent=o?"\u5207\u63DB\u4E2D\u2026":n?"\u6E2C\u8A66\u6A21\u5F0F ON":"\u6E2C\u8A66\u6A21\u5F0F OFF",E.className=`badge badge-mono ${o?"badge-info":n?"badge-warn":"badge-neutral"}`),T){T.disabled=o,T.classList.toggle("is-on",n),T.classList.toggle("is-off",!n&&!o),T.classList.toggle("is-busy",o),T.setAttribute("aria-checked",n?"true":"false"),T.setAttribute("aria-busy",o?"true":"false"),T.setAttribute("aria-label",o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F":n?"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF0C\u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\uFF0C\u9EDE\u64CA\u958B\u555F"),T.title=o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F\u2026":n?"\u6E2C\u8A66\u6A21\u5F0F ON \xB7 \u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F OFF \xB7 \u9EDE\u64CA\u958B\u555F";let ze=T.querySelector(".header-power-label");ze&&(ze.textContent=o?"\u2026":n?"ON":"OFF")}H&&(H.textContent=n?`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${X} \u500B embedding \u8207 ${$e} \u500B LLM \u6A21\u578B\u3002`:"\u76EE\u524D\u4F7F\u7528\u5FEB\u901F\u6A21\u5F0F\uFF1A\u55AE\u4E00 embedding \u8207 LLM\u3002"),G&&(G.innerHTML=Ci("Embedding",i.embedding)+Ci("LLM",i.llm))},F=async()=>{try{let X=await U.testMode();if(a)return;n=!!X.enabled,i=X.models||{embedding:[],llm:[]},Le(Y,"")}catch(X){if(a)return;n=!1,i={embedding:[],llm:[]},Le(Y,X.message||"\u7121\u6CD5\u8B80\u53D6\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF API\u3002","error")}a||W()},Ie=async()=>{if(o)return;let X=!n;o=!0,W(),Le(Y,X?"\u6B63\u5728\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u2026":"\u6B63\u5728\u95DC\u9589\u6E2C\u8A66\u6A21\u5F0F\u2026");try{let $e=await U.setTestMode(X);if(a)return;n=!!$e.enabled,i=$e.models||{embedding:[],llm:[]},window.dispatchEvent(new CustomEvent("judgment:test-mode",{detail:{enabled:n,models:i}}));let ze=i.embedding?.length||0,Ve=i.llm?.length||0;Le(Y,n?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A\u4E0B\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C ${ze} \u500B embedding \u8207 ${Ve} \u500B LLM \u6A21\u578B\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","ok"),M(n?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A${ze} \u500B embedding\u3001${Ve} \u500B LLM\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002",n?"ok":"info",6e3),await Xe()}catch($e){a||(Le(Y,$e.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","error"),M($e.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","danger",6e3))}finally{o=!1,a||W()}},Re=()=>{let X=Ud(l);if(ae&&(ae.innerHTML=X.summary),ee&&(ee.innerHTML=X.list),_e&&(_e.innerHTML=X.failures),be){be.disabled=d,be.setAttribute("aria-busy",d?"true":"false");let $e=be.querySelector("span");$e&&($e.textContent=d?"\u6E2C\u8A66\u4E2D\u2026":"\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66")}},Be=async()=>{try{let X=await U.llmModels();if(a)return;l=X,Le(z,"")}catch(X){if(a)return;l=null,Le(z,X.message||"\u7121\u6CD5\u8B80\u53D6 Ollama \u6A21\u578B\u6E05\u55AE\u3002","error")}a||Re()},kt=async()=>{if(!d){d=!0,Re(),Le(z,"\u6B63\u5728\u6AA2\u67E5 Ollama \u6A21\u578B\u8207 chat \u80FD\u529B\u2026");try{let X=await U.testLlmModels();if(a)return;l=X;let $e=X.tested_now?.length||0,ze=X.chat_models?.length||0,Ve=X.failures?.length||0;Le(z,`${$e?`\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u672C\u6B21\u65B0\u6E2C ${$e} \u500B\u6A21\u578B`:"\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u6C92\u6709\u65B0\u6A21\u578B"}\uFF0C\u76EE\u524D ${ze} \u500B\u6A21\u578B\u652F\u63F4 chat${Ve?`\uFF1B${Ve} \u500B\u6A21\u578B\u66AB\u6642\u7121\u6CD5\u5224\u5B9A\uFF0C\u4E0B\u6B21\u6703\u91CD\u8A66`:""}\u3002`,Ve?"warn":"ok"),M($e?`LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u65B0\u589E ${$e} \u7B46\u80FD\u529B\u7D00\u9304\u3002`:"LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u6C92\u6709\u65B0\u6A21\u578B\u9700\u8981\u6E2C\u8A66\u3002",Ve?"warn":"ok",5e3),await F()}catch(X){a||(Le(z,X.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","error"),M(X.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","danger",6e3))}finally{d=!1,a||Re()}}},nt=()=>{let X=Gd(c);if(Me&&(Me.innerHTML=X.summary),pe&&(pe.innerHTML=X.list),tt&&(tt.innerHTML=X.failures),He){He.disabled=v,He.setAttribute("aria-busy",v?"true":"false");let $e=He.querySelector("span");$e&&($e.textContent=v?"\u6E2C\u8A66\u4E2D\u2026":"\u57F7\u884C Reranker \u670D\u52D9\u6E2C\u8A66")}},St=async()=>{try{let X=await U.rerankStatus();if(a)return;c=X,Le(Oe,"")}catch(X){if(a)return;c=null,Le(Oe,X.message||"\u7121\u6CD5\u8B80\u53D6 reranker \u72C0\u614B\u3002","error")}a||nt()},st=async()=>{if(!v){v=!0,nt(),Le(Oe,"\u6B63\u5728\u5C0D primary\uFF0Ffallback reranker \u57F7\u884C\u5BE6\u969B rerank \u6E2C\u8A66\u2026");try{let X=await U.testReranker();if(a)return;c=X;let $e=Array.isArray(X.providers)?X.providers:[],ze=$e.filter(Nt=>Nt.status==="operational").length,Ve=$e.reduce((Nt,At)=>Nt+(Array.isArray(At.errors)?At.errors.length:0),0);Le(Oe,Ve?`Reranker \u6E2C\u8A66\u5B8C\u6210\uFF1A${ze} \u500B\u7AEF\u9EDE\u53EF\u7528\uFF0C${Ve} \u500B\u932F\u8AA4\uFF1B\u8A73\u7D30\u5206\u6578\u5DF2\u5217\u5728\u4E0A\u65B9\u3002`:`Reranker \u6E2C\u8A66\u5B8C\u6210\uFF1A${ze} \u500B\u7AEF\u9EDE\u53EF\u7528\uFF0C\u6A21\u578B ${X.model||"\u2014"}\u3002`,Ve?"warn":"ok"),M(Ve?"Reranker \u90E8\u5206\u7AEF\u9EDE\u5931\u6557\uFF0C\u8ACB\u67E5\u770B\u6E2C\u8A66\u7D50\u679C\u3002":"Reranker \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\u3002",Ve?"warn":"ok",5e3)}catch(X){a||(Le(Oe,X.message||"Reranker \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","error"),M(X.message||"Reranker \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","danger",6e3))}finally{v=!1,a||nt()}}},Rt=()=>{if(!Z)return;let X=Jd($,h,g);X!==w&&(w=X,Z.innerHTML=ks($,h,g))},rt=async()=>{try{let X=await U.testRuns(30);if(a)return;h=Array.isArray(X.runs)?X.runs:[]}catch{if(a)return;h=[]}},Xe=async(X=null)=>{try{let $e=X||(g?await U.testRun(g):await U.testRunCurrent());if(a)return;$=$e.run||null,!g&&$&&$.status!=="running"&&!h.some(ze=>ze.run_id===$.run_id)&&await rt()}catch{if(a)return;$=null}a||Rt()};Ae?.addEventListener("input",()=>{N(),Qe("\u5C1A\u672A\u6E2C\u8A66\u6B64\u4F4D\u5740\u3002")}),C?.addEventListener("click",async()=>{let X=x();if(X!==null){ke(C,!0,"\u6E2C\u8A66\u4E2D\u2026"),Qe(`\u6B63\u5728\u9023\u7DDA\u5230 ${os(X)||"\u540C\u6E90"}\u2026`);try{let $e=await Un(X);if(a)return;Qe(`\u9023\u7DDA\u6210\u529F \xB7 v${$e.version} \xB7 ${$e.duration_ms} ms \xB7 GET ${yt("/api/health",X)}`,"ok")}catch($e){a||Qe($e.message||"\u9023\u7DDA\u6E2C\u8A66\u5931\u6557\u3002","error")}finally{a||ke(C,!1)}}}),ye?.addEventListener("submit",X=>{if(X.preventDefault(),Ye())return;let $e=x();$e!==null&&(Fa($e),M(`\u5F8C\u7AEF API \u5DF2\u8A2D\u70BA ${os($e)}\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026`,"ok",1600),window.setTimeout(()=>window.location.reload(),120))}),ne?.addEventListener("click",()=>{Ye()||(Fa(""),M("\u5DF2\u6E05\u9664\u700F\u89BD\u5668\u5132\u5B58\u7684 API \u4F4D\u5740\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026","info",1600),window.setTimeout(()=>window.location.reload(),120))}),T?.addEventListener("click",Ie),be?.addEventListener("click",kt),He?.addEventListener("click",st),Z?.addEventListener("change",async X=>{X.target.id==="test-run-select"&&(g=String(X.target.value||""),await Xe())}),Z?.addEventListener("click",async X=>{X.target.closest("#test-flow-refresh")&&(g="",await rt(),await Xe())}),V?.addEventListener("click",async()=>{ke(V,!0,"\u66F4\u65B0\u4E2D\u2026"),j(),await Promise.allSettled([F(),rt(),Be(),St()]),a||await Xe(),a||(ke(V,!1),M("\u7CFB\u7D71\u6E2C\u8A66\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200))});let Jt=X=>{n=!!X.detail?.enabled,i=X.detail?.models||{embedding:[],llm:[]},W()};return window.addEventListener("judgment:test-mode",Jt),j(),W(),Re(),nt(),await Promise.allSettled([F(),rt(),Be(),St()]),await Xe(),p=wt("test-runs",async(X,$e)=>{a||document.hidden||g||await Xe($e?.snapshot||null)}),!s&&typeof t?.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"),()=>{a=!0,p&&p(),window.removeEventListener("judgment:test-mode",Jt)}}var Pi={frontend:"browser",backend:"server",database:"database",storage:"layers",vector:"cube",ai:"brain",default:"cpu"};var Oi={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90"},Di=[{id:"overview",label:"\u670D\u52D9\u7E3D\u89BD",hint:"\u5065\u5EB7\u72C0\u614B\u8207\u8CC7\u6599\u91CF",icon:"activity"},{id:"tests",label:"\u7CFB\u7D71\u6E2C\u8A66",hint:"API\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u6A21\u578B Flow",icon:"terminal"},{id:"resources",label:"\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528",hint:"CPU\u3001RAM\u3001Docker\u3001\u786C\u789F",icon:"cpu"},{id:"local-model",label:"Model Provider",hint:"Ollama \u4E3B\u6A5F\u8207\u6A21\u578B",icon:"server"},{id:"architecture",label:"\u524D\u5F8C\u7AEF\u67B6\u69CB",hint:"Client \u2192 Data \u2192 AI",icon:"layers"},{id:"data",label:"\u8CC7\u6599\u7248\u672C",hint:"Parquet \u8207 PostgreSQL",icon:"database"},{id:"api",label:"API \u7AEF\u9EDE",hint:"REST \u8207 OpenAPI",icon:"terminal"},{id:"runs",label:"\u6700\u8FD1\u4E0B\u8F09",hint:"\u6CD5\u898F\uFF0F\u547D\u4EE4\u57F7\u884C\u7D00\u9304",icon:"history"}];function Vd(e){return e==="operational"?{label:"\u6838\u5FC3\u670D\u52D9\u6B63\u5E38",tone:"ok",headline:"\u6838\u5FC3\u8CC7\u6599\u7BA1\u7DDA\u904B\u4F5C\u4E2D",copy:"FastAPI\u3001PostgreSQL \u8207 Parquet \u5747\u53EF\u5B58\u53D6\u3002Qdrant\u3001Embedding \u8207 LLM \u6703\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u8A2D\u5B9A\u6216\u964D\u7D1A\u6642\u4E0D\u5F71\u97FF\u8CC7\u6599\u700F\u89BD\u8207\u67E5\u8A62\u5831\u8868\u3002"}:e==="degraded"?{label:"\u90E8\u5206\u670D\u52D9\u964D\u7D1A",tone:"warn",headline:"\u90E8\u5206\u670D\u52D9\u9700\u8981\u8A2D\u5B9A\u6216\u4FEE\u5FA9",copy:"\u6838\u5FC3\u8CC7\u6599\u670D\u52D9\u76EE\u524D\u672A\u5B8C\u5168\u53EF\u7528\u3002\u8ACB\u67E5\u770B\u4E0B\u65B9\u670D\u52D9\u5361\u7247\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u7684\u57F7\u884C\u7D00\u9304\uFF0C\u78BA\u8A8D PostgreSQL\u3001Parquet \u6216\u5916\u90E8\u670D\u52D9\u72C0\u614B\u3002"}:{label:Bt(e).label,tone:Bt(e).tone,headline:"\u76EE\u524D\u7121\u6CD5\u78BA\u8A8D\u7CFB\u7D71\u72C0\u614B",copy:"\u72C0\u614B API \u56DE\u50B3\u4E86\u975E\u9810\u671F\u7D50\u679C\u3002\u8ACB\u91CD\u65B0\u6574\u7406\uFF0C\u6216\u76F4\u63A5\u6AA2\u67E5 FastAPI \u670D\u52D9\u65E5\u8A8C\u3002"}}function Wd(e){let t=Bt(e.status),s=Pi[e.kind]||Pi.default,a=e.latency_ms===null||e.latency_ms===void 0?"":`<span class="service-latency">${u(e.latency_ms)} ms</span>`;return`<article class="service-card">
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
  </article>`}function Kd(e,t){return`<div class="arch-node ${e?"":"is-muted"}" ${e?"":'title="\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165"'}>${r(t)}</div>`}function Yd(e,t){if(e==="IndexedDB")return cr();let a={PostgreSQL:"postgres",Parquet:"parquet",Qdrant:"qdrant",Embedding:"embedding",Retriever:"rag",Reranker:"reranker","RAG Engine":"rag",LLM:"llm"}[e];return a?t.find(i=>i.id===a)?.status==="operational":!0}function Xd(e,t){let s=e?.layers||[];if(!s.length)return'<div class="report-empty-inline">\u72C0\u614B API \u672A\u63D0\u4F9B\u67B6\u69CB\u8CC7\u6599\u3002</div>';let a=s.map(i=>{let o=(i.nodes||[]).map(l=>Kd(Yd(l,t),l)).join("");return`<div class="arch-layer">
      <div class="arch-layer-label">${r(i.label||i.id)}</div>
      <div class="arch-nodes">${o}</div>
    </div>`}),n=[];return a.forEach((i,o)=>{o&&n.push(`<div class="arch-arrow" aria-hidden="true">${m("arrowRight",15)}</div>`),n.push(i)}),`<div class="arch-flow">${n.join("")}</div>
    <div class="arch-legend">
      <span><i class="legend-key is-live"></i>\u5DF2\u63A5\u5165\u4E14\u72C0\u614B\u6B63\u5E38</span>
      <span><i class="legend-key is-off"></i>\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165</span>
      <span>${m("info",12)} \u7BC0\u9EDE\u72C0\u614B\u4F86\u81EA\u4E3B\u670D\u52D9\u5065\u5EB7\u6AA2\u67E5</span>
    </div>`}function Zd(e){return!Array.isArray(e)||!e.length?'<div class="report-empty-inline">\u6C92\u6709\u7AEF\u9EDE\u8CC7\u8A0A\u3002</div>':`<div class="endpoint-list">
    ${e.map(t=>`<div class="endpoint-row">
          <span class="endpoint-method">${r(t.method)}</span>
          <span class="endpoint-path" title="${r(t.path)}">${r(t.path)}</span>
          <span class="endpoint-label">${r(t.label||"")}</span>
        </div>`).join("")}
  </div>`}function Ke(e,t){return`<div class="detail-row">
    <span class="detail-label">${r(e)}</span>
    <span class="detail-value">${t}</span>
  </div>`}function eu(e){return e?`<div class="detail-list">
    ${Ke("\u7248\u672C ID",`<strong>#${u(e.id)}</strong>`)}
    ${Ke("\u8CC7\u6599\u985E\u578B",Je("operational",e.source_type==="law"?"\u6CD5\u898F":"\u547D\u4EE4"))}
    ${Ke("\u4F86\u6E90\u66F4\u65B0\u65E5",`<strong>${r(e.update_date||"\u2014")}</strong>`)}
    ${Ke("\u6CD5\u898F / \u689D\u6587",`<strong>${u(e.law_count)} / ${u(e.article_count)}</strong>`)}
    ${Ke("\u4E0B\u8F09\u6642\u9593",`<span class="mono">${qe(e.downloaded_at)}</span>`)}
    ${Ke("Parquet",`<code title="${r(e.parquet_path||"")}">${r(e.parquet_path||"\u2014")}</code>`)}
  </div>`:'<div class="report-empty-inline">\u5C1A\u672A\u532F\u5165\u4EFB\u4F55\u8CC7\u6599\u7248\u672C\u3002</div>'}function tu(e){if(!Array.isArray(e)||!e.length)return ct({iconName:"history",title:"\u5C1A\u7121\u4E0B\u8F09\u57F7\u884C\u7D00\u9304",text:"\u57F7\u884C judgment-law-download \u5F8C\uFF0C\u6210\u529F\u3001\u7121\u8B8A\u66F4\u8207\u5931\u6557\u7684\u7D50\u679C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"});let t=[{key:"id",label:"Run",type:"number"},{key:"source_type",label:"\u985E\u578B",type:"source"},{key:"status",label:"\u72C0\u614B",type:"status"},{key:"started_at",label:"\u958B\u59CB\u6642\u9593",type:"datetime"},{key:"duration_ms",label:"\u8017\u6642",type:"duration"},{key:"law_count",label:"\u6CD5\u898F",type:"number"},{key:"article_count",label:"\u689D\u6587",type:"number"},{key:"error_message",label:"\u932F\u8AA4",type:"longtext"}];return`<div class="table-wrap" style="border-top:0;max-height:340px">
    <table class="data-table runs-table">
      <thead><tr>${t.map(s=>`<th scope="col">${r(s.label)}</th>`).join("")}</tr></thead>
      <tbody>
        ${e.map(s=>`<tr>${t.map(a=>`<td>${Xs(s[a.key],a.type)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </div>`}function su(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=new Map(s.map(w=>[w.id,w])),n=a.get("qdrant"),i=a.get("embedding"),o=a.get("rag"),l=a.get("llm"),d=Number(t.judgment_indexed_count||0),c=Number(t.judgment_count||0),v=c?(d/c*100).toFixed(1):"0.0",$=t.judgment_vector_points===null||t.judgment_vector_points===void 0?"\u2014":u(t.judgment_vector_points),h=Number(t.judgment_index_remaining||0),g=o?.status==="operational"?"RAG \u5C31\u7DD2":o?.status==="not_configured"?"\u672A\u8A2D\u5B9A":o?.status==="degraded"?"\u964D\u7D1A":"\u672A\u77E5",p=[["cube","Qdrant \u5411\u91CF\u7D22\u5F15",n],["layers",`Embedding\uFF08${t.judgment_vector_model||"\u2014"}\uFF09`,i],["brain","RAG \u56DE\u7B54\u7BA1\u7DDA",o],["sparkles","LLM \u6A21\u578B",l]];return`<section class="card data-section rag-index-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("database",14)}RAG \u8CC7\u6599\u73FE\u6CC1</span>
      ${Je(o?.status,g)}
    </div>
    <div class="side-card-body">
      <div class="mini-stats">
        <div class="mini-stat">
          <div class="mini-stat-value">${u(c)}</div>
          <div class="mini-stat-label">\u5224\u6C7A</div>
        </div>
        <div class="mini-stat">
          <div class="mini-stat-value">${u(d)}</div>
          <div class="mini-stat-label">\u5DF2\u7D22\u5F15</div>
        </div>
        <div class="mini-stat">
          <div class="mini-stat-value">${v}%</div>
          <div class="mini-stat-label">\u7D22\u5F15\u8986\u84CB</div>
        </div>
      </div>
      <div class="side-status-list">
        ${p.map(([w,k,L])=>`<div class="side-status-row">
              <span>${m(w,13)}${r(k)}</span>
              ${Je(L?.status,L?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
            </div>`).join("")}
      </div>
      <div class="side-card-foot" style="padding:0;border:0;margin-top:10px">
        Collection\uFF1A${r(t.judgment_vector_collection||"\u2014")} \xB7
        ${$} points \xB7 \u5269\u9918 ${u(h)} \u7B46\u5F85\u7D22\u5F15
      </div>
    </div>
    <div class="side-card-foot">
      PostgreSQL \u5224\u6C7A\u6587\u4EF6\u3001Qdrant \u5411\u91CF\u7D22\u5F15\u8207 Ollama \u6A21\u578B\u72C0\u614B\u7686\u70BA\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u5C31\u7DD2\u6642\u6703\u660E\u78BA\u964D\u7D1A\u3002
    </div>
  </section>`}function au(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=Vd(e.status),n=s.find(c=>c.id==="qdrant"),i=s.find(c=>c.id==="rag"),o=s.find(c=>c.id==="llm"),l=Xt(),d=Oi[l]||l;return`<section class="status-hero">
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
          <span>${m("clock",11)} \u6AA2\u67E5\u6642\u9593 ${qe(e.checked_at)} \xB7 ${r(js(e.checked_at))}</span>
          <span>${m("server",11)} ${s.length} \u500B\u670D\u52D9\u5143\u4EF6</span>
          <span>${m("database",11)} ${u(t.total_current)} \u7B46\u73FE\u884C\u8CC7\u6599</span>
          <span>${m("layers",11)} ${u(t.parquet_files)} \u500B\u539F\u59CB Parquet</span>
          <span title="API \u4F4D\u5740\u4F86\u6E90\uFF1A${r(d)}">${m("link",11)} ${r(os())}</span>
        </div>
      </div>
    </section>

    <div class="service-grid">${s.map(Wd).join("")}</div>

    ${su(e)}

    <div class="status-summary">
      <div class="metric-card">
        <div class="metric-label">\u73FE\u884C\u6CD5\u898F</div>
        <div class="metric-value">${u(t.law_count)}</div>
        <div class="metric-foot">source_type = law</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u73FE\u884C\u547D\u4EE4</div>
        <div class="metric-value">${u(t.order_count)}</div>
        <div class="metric-foot">source_type = order</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u689D\u6587\u7E3D\u6578</div>
        <div class="metric-value">${u(t.article_count)}</div>
        <div class="metric-foot">\u73FE\u884C\u7248\u672C\u5408\u8A08</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u8CC7\u6599\u7248\u672C</div>
        <div class="metric-value">${u(t.version_count)}</div>
        <div class="metric-foot">\u539F\u59CB Parquet \u7248\u672C</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u4E0B\u8F09\u57F7\u884C</div>
        <div class="metric-value">${u(t.run_count)}</div>
        <div class="metric-foot">\u542B\u6210\u529F\u3001\u7121\u8B8A\u66F4\u8207\u5931\u6557</div>
      </div>
    </div>

    ${n?.status==="not_configured"||i?.status==="not_configured"||o?.status==="not_configured"?`<div class="data-section">${Ee({tone:"info",title:"\u90E8\u5206 AI \u5143\u4EF6\u5C1A\u672A\u8A2D\u5B9A",text:`Qdrant\uFF1A${r(n?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BRAG\uFF1A${r(i?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BLLM\uFF1A${r(o?.detail||"\u672A\u8A2D\u5B9A")}\u3002\u9019\u4E9B\u72C0\u614B\u4E0D\u6703\u88AB\u507D\u88DD\u6210\u53EF\u7528\u3002`})}</div>`:""}`}function nu(e){let t=Array.isArray(e.services)?e.services:[],s=e.architecture||{};return`<div class="data-section card architecture-card">
    <div class="section-head">
      <div>
        <div class="section-title">\u524D\u5F8C\u7AEF\u67B6\u69CB</div>
        <div class="section-sub">Client \u2192 Application \u2192 Data \u2192 Intelligence</div>
      </div>
      <span class="badge badge-neutral badge-mono">${u((s.flow||[]).length)} layers</span>
    </div>
    ${Xd(s,t)}
  </div>`}function ru(e){let t=Xt(),s=Oi[t]||t,a=yt("/api/docs"),n=yt("/api/openapi.json");return`<div class="status-columns is-single">
    <section class="card">
      <div class="side-card-head">
        <span class="side-card-title">${m("terminal",14)}API \u7AEF\u9EDE</span>
        <a href="${r(a)}" target="_blank" rel="noopener noreferrer" class="chip"
          >OpenAPI ${m("external",11)}</a>
      </div>
      ${Zd(e.endpoints)}
      <div class="side-card-foot">
        \u76EE\u524D API Base\uFF1A<code>${r(os())}</code>\uFF08${r(s)}\uFF09\u3002\u4E92\u52D5\u5F0F API \u6587\u4EF6\u4F4D\u65BC <a href="${r(a)}" target="_blank" rel="noopener noreferrer"><code>${r(a)}</code></a>\uFF0COpenAPI schema \u4F4D\u65BC <a href="${r(n)}" target="_blank" rel="noopener noreferrer"><code>${r(n)}</code></a>\u3002
      </div>
    </section>
  </div>`}function iu(e){let t=e.data||{},s=Number(t.judgment_indexed_count||0),a=Number(t.judgment_count||0),n=a?(s/a*100).toFixed(1):"0.0",i=Number(t.judgment_index_remaining||0);return`<div class="status-summary">
      <div class="metric-card">
        <div class="metric-label">\u73FE\u884C\u6CD5\u898F</div>
        <div class="metric-value">${u(t.law_count)}</div>
        <div class="metric-foot">source_type = law</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u73FE\u884C\u547D\u4EE4</div>
        <div class="metric-value">${u(t.order_count)}</div>
        <div class="metric-foot">source_type = order</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u689D\u6587\u7E3D\u6578</div>
        <div class="metric-value">${u(t.article_count)}</div>
        <div class="metric-foot">\u73FE\u884C\u7248\u672C\u5408\u8A08</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u8CC7\u6599\u7248\u672C</div>
        <div class="metric-value">${u(t.version_count)}</div>
        <div class="metric-foot">\u539F\u59CB Parquet \u7248\u672C</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u5224\u6C7A\u7D22\u5F15</div>
        <div class="metric-value">${u(t.judgment_indexed_count)}</div>
        <div class="metric-foot">/ ${u(t.judgment_count)} \u7B46\u5224\u6C7A \xB7 \u8986\u84CB ${n}%</div>
      </div>
    </div>
    <div class="status-columns is-single">
      <section class="card">
        <div class="side-card-head">
          <span class="side-card-title">${m("layers",14)}\u6700\u65B0\u8CC7\u6599\u7248\u672C</span>
          ${Je("operational","Parquet")}
        </div>
        ${eu(t.last_version)}
        <div class="side-card-foot">
          \u539F\u59CB Parquet \u5408\u8A08 ${Ne(t.parquet_bytes)}\uFF1BPostgreSQL \u4FDD\u5B58 metadata \u8207\u7248\u672C\u72C0\u614B\u3002
        </div>
      </section>
      <section class="card">
        <div class="side-card-head">
          <span class="side-card-title">${m("database",14)}\u8CC7\u6599\u96C6\u7D71\u8A08</span>
          <span class="badge badge-neutral badge-mono">${u(t.parquet_files)} FILES</span>
        </div>
        <div class="detail-list">
          ${Ke("\u73FE\u884C\u6CD5\u898F",`<strong>${u(t.law_count)}</strong>`)}
          ${Ke("\u73FE\u884C\u547D\u4EE4",`<strong>${u(t.order_count)}</strong>`)}
          ${Ke("\u689D\u6587\u7E3D\u6578",`<strong>${u(t.article_count)}</strong>`)}
          ${Ke("\u539F\u59CB Parquet",`<strong>${Ne(t.parquet_bytes)}</strong>`)}
          ${Ke("\u5224\u6C7A\u6587\u4EF6",`<strong>${u(t.judgment_count)}</strong>`)}
          ${Ke("\u5411\u91CF\u7D22\u5F15",`<strong>${u(t.judgment_indexed_count)}</strong> / ${u(t.judgment_count)}\uFF08${u(t.judgment_vector_points)} points\uFF09`)}
          ${Ke("\u7D22\u5F15\u8986\u84CB",`<strong>${n}%</strong> \xB7 \u5269\u9918 ${u(i)} \u7B46`)}
          ${Ke("\u7D22\u5F15\u7248\u672C",`<strong>#${u(t.judgment_vector_version_id)}</strong> \xB7 ${r(t.judgment_vector_version_status||"legacy")}`)}
          ${Ke("Alias",`<code>${r(t.judgment_vector_alias||"\u2014")}</code> \u2192 <code>${r(t.judgment_vector_collection||"\u2014")}</code>`)}
          ${Ke("\u7D22\u5F15\u6A21\u578B",`<code>${r(t.judgment_vector_model||"\u2014")}</code>`)}
          ${Ke("\u6700\u8FD1\u7D22\u5F15",`<span class="mono">${qe(t.judgment_indexed_at)}</span>`)}
        </div>
      </section>
    </div>`}function ou(e){let t=e.data||{};return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${m("history",14)}\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C</span>
      <span class="badge badge-neutral badge-mono">${u(t.run_count)} TOTAL</span>
    </div>
    ${tu(e.recent_runs)}
  </section>`}function lu(e){let t=Number(e);return Number.isFinite(t)?t>=90?"is-danger":t>=70?"is-warn":"":""}function Fi(e,t=""){let s=Math.max(0,Math.min(100,Number(e)||0));return`<div class="resource-bar ${t}"><span style="width:${s}%"></span></div>`}function gs(e,t,s,a,n){let i=lu(n);return`<article class="resource-card">
    <div class="resource-card-head">
      <span class="resource-card-label">${m(t,14)}${r(e)}</span>
      <strong>${r(s)}</strong>
    </div>
    ${Fi(n,i)}
    <div class="resource-card-detail">${a}</div>
  </article>`}function cu(e){let t=e.docker||{};if(!t.available)return`<section class="card data-section">
      <div class="side-card-head">
        <span class="side-card-title">${m("layers",14)}Docker</span>
        ${Je("not_configured","\u672A\u9023\u7DDA")}
      </div>
      <div class="report-empty-inline">${r(t.detail||"Docker daemon \u672A\u9023\u7DDA\u3002")}</div>
    </section>`;let s=[...t.containers||[]].sort((i,o)=>{let l=i.service?0:1,d=o.service?0:1;return l-d||String(i.name).localeCompare(String(o.name))}),a=s.map(i=>`<tr>
        <td><strong>${r(i.name||"\u2014")}</strong>${i.service?`<span class="badge badge-neutral badge-mono">${r(i.service)}</span>`:""}</td>
        <td>${Je(i.state==="running"?"operational":"degraded",i.state||"\u2014")}</td>
        <td class="cell-number">${i.cpu_percent===null||i.cpu_percent===void 0?"\u2014":`${u(i.cpu_percent)}%`}</td>
        <td class="cell-number">${Ne(i.memory_used)}${i.memory_limit?` / ${Ne(i.memory_limit)}`:""}</td>
        <td class="mono">${r(i.net_io||"\u2014")}</td>
        <td class="mono">${r(i.block_io||"\u2014")}</td>
        <td class="cell-number">${u(i.pids)}</td>
      </tr>`).join(""),n=(t.system||[]).map(i=>`<span class="resource-docker-pill">
        <strong>${r(i.type||"\u2014")}</strong>
        <span>${u(i.count)} \xB7 ${r(i.size||"\u2014")}</span>
      </span>`).join("");return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${m("layers",14)}Docker \u5BB9\u5668\u4F7F\u7528\u8CC7\u6E90</span>
      <span class="badge badge-ok badge-mono">${u(s.length)} \u500B\u5BB9\u5668</span>
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
  </section>`}function du(e){return`<div class="resource-section-head">
      <div>
        <div class="section-title">\u5404\u8CC7\u6599\u5EAB\u4F7F\u7528\u8CC7\u6E90</div>
        <div class="section-sub">\u5BB9\u5668 CPU\uFF0FRAM \u8207\u8CC7\u6599\u5EAB\u5167\u90E8\u5BB9\u91CF</div>
      </div>
    </div>
    <div class="resource-db-grid">${(Array.isArray(e.databases)?e.databases:[]).map(s=>{let a=s.id==="postgres",n=Array.isArray(s.tables)?s.tables:[],i=s.status==="operational"?"operational":s.status==="not_configured"?"not_configured":"degraded",o=a?`${Ke("\u8CC7\u6599\u5EAB",`<code>${r(s.database||"\u2014")}</code>`)}
           ${Ke("\u8CC7\u6599\u5EAB\u5927\u5C0F",`<strong>${Ne(s.storage_bytes)}</strong>`)}
           ${Ke("Docker volume",`<strong>${Ne(s.volume_bytes)}</strong>${s.volume_name?` <code>${r(s.volume_name)}</code>`:""}`)}
           ${Ke("\u9023\u7DDA\u6578",`<strong>${u(s.connections)}</strong>`)}`:`${Ke("Collection",`<code>${r(s.collection||"\u2014")}</code>`)}
           ${Ke("Docker volume",`<strong>${Ne(s.volume_bytes)}</strong>${s.volume_name?` <code>${r(s.volume_name)}</code>`:""}`)}
           ${Ke("\u5411\u91CF\u9EDE\u6578",`<strong>${u(s.points_count)}</strong>`)}
           ${Ke("Collections",`<strong>${u(s.collections)}</strong>`)}
           ${Ke("Segments",`<strong>${u(s.segments_count)}</strong>`)}`;return`<article class="resource-db-card">
        <div class="resource-db-head">
          <div>
            <div class="resource-db-title">${r(s.name||"\u2014")}</div>
            <div class="resource-db-kind">${r(s.kind||"")}</div>
          </div>
          ${Je(i)}
        </div>
        <div class="resource-db-metrics">
          <div><span>CPU</span><strong>${s.cpu_percent===null||s.cpu_percent===void 0?"\u2014":`${u(s.cpu_percent)}%`}</strong></div>
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
      </article>`}).join("")}</div>`}function xs(e,t,s,a){let n=Number(t)||0,i=a?n/a*100:0;return`<div class="storage-row">
    <div class="storage-row-head">
      <span>${r(e)}</span>
      <strong>${Ne(n)}</strong>
    </div>
    ${Fi(i)}
    <div class="storage-row-detail">${s}</div>
  </div>`}function uu(e){let t=e.storage||{},s=t.application||{},a=t.parquet||{},n=t.docker||{},i=t.volumes||{},o=i.postgres||{},l=i.qdrant||{},d=Number(t.judgment_total_bytes||0);return`<section class="card data-section storage-section">
    <div class="side-card-head">
      <span class="side-card-title">${m("database",14)}\u786C\u789F\u4F7F\u7528\u7D44\u6210</span>
      <span class="badge badge-neutral badge-mono">${Ne(d)}</span>
    </div>
    <div class="storage-list">
      ${xs("\u524D\u7AEF",s.frontend_bytes,`<span class="mono">${r(s.frontend_path||"\u2014")}</span>`,d)}
      ${xs("\u5F8C\u7AEF",s.backend_bytes,`<span class="mono">${r(s.backend_path||"\u2014")}</span>`,d)}
      ${xs("Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5FEB\u53D6",n.layers_bytes,`Images ${Ne(n.images_bytes)} \xB7 Containers ${Ne(n.containers_bytes)} \xB7 Build cache ${Ne(n.build_cache_bytes)}`,d)}
      ${xs("PostgreSQL volume",o.size_bytes,`<span class="mono">${r(o.name||"\u2014")}</span>`,d)}
      ${xs("Qdrant volume",l.size_bytes,`<span class="mono">${r(l.name||"\u2014")}</span>`,d)}
      ${xs("Parquet",a.total_bytes,`\u6CD5\u898F ${Ne(a.law_bytes)} \xB7 \u5224\u6C7A ${Ne(a.judgment_bytes)}`,d)}
    </div>
    <div class="storage-total">
      <span>Judgment \u5143\u4EF6\u5408\u8A08</span>
      <strong>${Ne(d)}</strong>
    </div>
    <div class="side-card-foot">
      \u524D\u7AEF\uFF0B\u5F8C\u7AEF\u7A0B\u5F0F\u3001Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5EFA\u7F6E\u5FEB\u53D6\u3001PostgreSQL\uFF0FQdrant volume \u8207\u539F\u59CB Parquet\uFF1B\u4E0D\u542B .venv \u8207\u5176\u4ED6\u975E Judgment Docker volume\u3002
    </div>
  </section>`}function pu(e){let t=e.host||{},s=t.cpu||{},a=t.memory||{},n=t.swap||{},i=e.storage||{},o=i.filesystem||{},l=Number(i.judgment_total_bytes||0),d=Array.isArray(e.disk)?e.disk:[],c=d[0]||{},v=Number(o.total_bytes||c.total||0),$=v?l/v*100:0,h=[s.load_1,s.load_5,s.load_15].map(w=>w??"\u2014").join(" / "),g=t.uptime_seconds===null||t.uptime_seconds===void 0?"\u2014":me(Number(t.uptime_seconds)*1e3),p=[c.label?gs("HDD \u5DF2\u4F7F\u7528","database",`${u(c.percent)}%`,`${Ne(c.used)} / ${Ne(c.total)} \xB7 \u5269\u9918 ${Ne(c.free)}<br><span class="mono">${r(c.path||"")}</span>`,c.percent):"",l?gs("Judgment \u5143\u4EF6\u5408\u8A08","layers",Ne(l),`\u7D04\u5360 HDD ${u($)}% \xB7 \u524D\u7AEF\uFF0F\u5F8C\u7AEF\uFF0FDocker\uFF0FDB volume\uFF0FParquet`,$):"",...d.slice(1).map(w=>gs(`\u786C\u789F \xB7 ${w.label}`,"layers",`${u(w.percent)}%`,`${Ne(w.used)} / ${Ne(w.total)} \xB7 \u5269\u9918 ${Ne(w.free)}<br><span class="mono">${r(w.path||"")}</span>`,w.percent))].filter(Boolean).join("");return`<div class="resource-section-head">
      <div>
        <div class="eyebrow">SYSTEM RESOURCE USAGE</div>
        <div class="section-sub">\u66F4\u65B0\u6642\u9593 ${qe(e.checked_at)} \xB7 ${e.status==="operational"?"\u8CC7\u6E90\u8B80\u53D6\u6B63\u5E38":"\u90E8\u5206\u8CC7\u6E90\u964D\u7D1A"}</div>
      </div>
    </div>
    <div class="resource-grid">
      ${gs("CPU \u4F7F\u7528\u7387","cpu",`${u(s.percent)}%`,`${u(s.logical_cores)} \u908F\u8F2F\u6838\u5FC3 \xB7 ${u(s.physical_cores)} \u5BE6\u9AD4\u6838\u5FC3<br>Load ${r(h)}`,s.percent)}
      ${gs("\u8A18\u61B6\u9AD4","server",`${u(a.percent)}%`,`${Ne(a.used)} / ${Ne(a.total)} \xB7 \u53EF\u7528 ${Ne(a.available)}`,a.percent)}
      ${gs("Swap","layers",`${u(n.percent)}%`,`${Ne(n.used)} / ${Ne(n.total)}`,n.percent)}
      ${gs("\u7A0B\u5E8F\u8207\u958B\u6A5F","activity",`${u(t.processes)} \u500B\u7A0B\u5E8F`,`\u958B\u6A5F ${r(g)}<br>${r(t.platform||"")}`,null)}
    </div>
    <div class="resource-grid resource-disk-grid">${p||'<div class="report-empty-inline">\u627E\u4E0D\u5230\u53EF\u8B80\u53D6\u7684\u78C1\u789F\u3002</div>'}</div>
    ${uu(e)}
    ${cu(e)}
    ${du(e)}`}function Ii(){return`<div class="resource-section-head">
      <div>
        <div class="skeleton skeleton-line" style="width:160px;height:18px"></div>
        <div class="skeleton skeleton-line" style="width:260px;margin-top:8px"></div>
      </div>
    </div>
    <div class="resource-grid">
      ${Array.from({length:4}).map(()=>'<div class="skeleton" style="height:120px;border-radius:var(--radius-md)"></div>').join("")}
    </div>
    <div class="skeleton" style="height:180px;margin-top:16px;border-radius:var(--radius-md)"></div>
    <div class="skeleton" style="height:220px;margin-top:16px;border-radius:var(--radius-md)"></div>`}function mu(e){return`<div class="report-card">
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
          ${m("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function gu(e){return e.status==="operational"?{label:"\u5DF2\u9023\u7DDA",badge:"badge-ok"}:{label:"\u7121\u6CD5\u9023\u7DDA",badge:"badge-danger"}}function fu(e,t){let s=gu(e),a=Array.isArray(e.models)?e.models:[],n=a.length?a.map(i=>{let o=String(i.name||""),l=e.chat_model===o,d=e.embedding_model===o,c=i.size?Ne(i.size):"",v=i.modified_at?qe(i.modified_at):"",$=new Set((i.capabilities||[]).map(g=>String(g||"").toLowerCase())),h=[];return i.supports_chat===!0&&h.push(["Chat","badge-ok"]),$.has("embedding")&&h.push(["Embedding","badge-info"]),$.has("vision")&&h.push(["Vision","badge-neutral"]),$.has("tools")&&h.push(["Tools","badge-neutral"]),$.has("thinking")&&h.push(["Thinking","badge-neutral"]),$.has("speech")&&h.push(["Speech","badge-warn"]),i.is_reranker&&h.push(["Reranker","badge-neutral"]),h.length||h.push([i.capability_status==="untested"?"\u672A\u6E2C\u8A66":"\u7121 chat \u80FD\u529B","badge-neutral"]),`<div class="ollama-model-row">
            <div class="ollama-model-main">
              <strong>${r(o)}</strong>
              <span class="ollama-model-meta">${[c,v].filter(Boolean).map(g=>r(g)).join(" \xB7 ")||"\u2014"}</span>
              <div class="ollama-model-capabilities">${h.map(([g,p])=>`<span class="badge ${p}">${r(g)}</span>`).join("")}</div>
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
  </article>`}function bu(e,t,s,a){if(s)return`<div class="report-card">
      ${Ee({tone:"danger",title:"Model Provider \u8B80\u53D6\u5931\u6557",text:r(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="refresh-hosts">${m("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;let n=e||{hosts:[],active_host_id:null},i=Array.isArray(n.hosts)?n.hosts:[],o=a?i.find(c=>Number(c.id)===Number(a)):null,l=o?o.base_url.replace(new RegExp(`:${o.port}$`),""):"http://127.0.0.1",d=o?"\u5132\u5B58\u8B8A\u66F4":"\u65B0\u589E\u4E3B\u6A5F";return`<div class="report-card ollama-card">
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
          <input class="input" name="name" value="${r(o?.name||"")}" placeholder="\u4F8B\u5982\uFF1Ax570 Ollama" />
        </label>
        <label class="field"><span class="field-label">\u4E3B\u6A5F\u7DB2\u5740</span>
          <input class="input" name="url" value="${r(l)}" placeholder="http://127.0.0.1" required />
        </label>
        <label class="field"><span class="field-label">Port</span>
          <input class="input" name="port" type="number" min="1" max="65535" value="${o?.port||11434}" required />
        </label>
        <div class="ollama-host-form-actions">
          <button class="btn btn-primary btn-sm" type="submit">${m("check",13)}<span>${d}</span></button>
          ${o?'<button class="btn btn-ghost btn-sm" type="button" data-ollama-action="cancel-host-edit">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
        </div>
      </form>
      ${t?'<div class="ollama-loading"><span class="spinner"></span><span>\u8B80\u53D6 Ollama \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span></div>':i.length?`<div class="ollama-host-list">${i.map(c=>fu(c,a)).join("")}</div>`:ct({iconName:"server",title:"\u5C1A\u672A\u8A2D\u5B9A Ollama \u4E3B\u6A5F",text:"\u8ACB\u5728\u4E0A\u65B9\u8F38\u5165\u7DB2\u5740\u8207 Port \u65B0\u589E\uFF0C\u6216\u4F7F\u7528 .env \u7684\u9810\u8A2D\u9023\u7DDA\u3002"})}
      <p class="report-sub" style="margin-top:12px">\u8A2D\u70BA\u804A\u5929\u6216\u5D4C\u5165\u6A21\u578B\u5F8C\uFF0C\u7CFB\u7D71\u6703\u4F7F\u7528\u76EE\u524D\u4E3B\u6A5F\u7684\u5C0D\u61C9\u6A21\u578B\u57F7\u884C AI \u51FA\u984C\u8207 RAG\uFF1B\u672A\u8A2D\u5B9A\u6642\u6CBF\u7528 .env \u7684 LLM_MODEL\uFF0FEMBEDDING_MODEL\u3002</p>
    </div>
  </div>`}function vu(e,t,s){let a=e?.data||{},n=e?Bt(e.status):null,i=s?Bt(s.status):null,o={overview:n?`<span class="badge ${n.tone==="ok"?"badge-ok":n.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${r(n.label)}</span>`:"",resources:i?`<span class="badge ${i.tone==="ok"?"badge-ok":i.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${r(i.label)}</span>`:'<span class="badge badge-neutral badge-mono">\u672A\u8B80\u53D6</span>',data:`<span class="badge badge-neutral badge-mono">${u(a.version_count)}</span>`,tests:'<span class="badge badge-neutral badge-mono">TEST</span>',"local-model":'<span class="badge badge-neutral badge-mono">OLLAMA</span>',runs:`<span class="badge badge-neutral badge-mono">${u(a.run_count)}</span>`};return`<div class="status-sidebar-head">
      <div class="eyebrow">STATUS SECTIONS</div>
      <div class="status-sidebar-title">\u7CFB\u7D71\u5206\u985E</div>
    </div>
    <nav class="status-tab-list" aria-label="\u7CFB\u7D71\u72C0\u614B\u5206\u985E">
      ${Di.map(l=>{let d=l.id===t;return`<button class="status-tab${d?" is-active":""}" type="button"
          data-status-tab="${l.id}" ${d?'aria-current="page"':""}>
          <span class="status-tab-icon">${m(l.icon,15)}</span>
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
    </div>`}function hu(e,t,s,a,n,i){if(e==="resources")return s?pu(s):a?Ii():n?mu(n):Ii();if(e==="local-model"){let o=i||{},l=!!o.loading||!o.hosts&&!o.error;return bu(o.hosts||null,l,o.error||null,o.editingId||null)}return e==="architecture"?nu(t):e==="api"?ru(t):e==="data"?iu(t):e==="runs"?ou(t):au(t)}function $u(){return`<div class="status-hero">
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
    </div>`}function Bi(e){return`<div class="report-card">
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
          ${m("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}async function yu(e,t){let s=!1,a=null,n=null,i="overview",o=null,l=!1,d=null,c=null,v=!1,$=null,h=null,g=!1,p=!1,w=null,k=0,L="",E="";e.innerHTML=`<section class="page status-page">
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
      <section class="status-panel" id="status-content">${$u()}</section>
    </div>
  </section>`;let T=e.querySelector("#status-nav"),H=e.querySelector("#status-content"),G=e.querySelector("#refresh-status"),Y=e.querySelector("#auto-refresh"),ye=()=>{if(k+=1,typeof w=="function")try{w()}catch{}w=null,g=!1,p=!1},Ae=async()=>{let Z=++k;p=!0,E="",H.innerHTML="";try{let ae=await Pn(H,{setTitle:()=>{}},{embedded:!0});if(Z!==k||i!=="tests"){typeof ae=="function"&&ae();return}w=typeof ae=="function"?ae:null,g=!0}catch(ae){Z===k&&i==="tests"&&(H.innerHTML=Bi(ae))}finally{Z===k&&(p=!1)}},J=()=>{if(!n)return;let Z=vu(n,i,o);if(Z!==L&&(T.innerHTML=Z,L=Z),i==="tests"){!g&&!p&&Ae();return}ye();let ae=hu(i,n,o,l,d,{hosts:c,loading:v,error:$,editingId:h});ae!==E&&(H.innerHTML=ae,E=ae)},B=async({quiet:Z=!1}={})=>{if(!l){l=!0,d=null,i==="resources"&&!o&&J();try{let ae=await U.systemUsage();if(s)return;o=ae}catch(ae){if(s)return;d=ae,Z||M(ae.message||"\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90\u3002","danger")}finally{s||(l=!1,i==="resources"&&J())}}},S=async({quiet:Z=!1}={})=>{if(!v){v=!0,$=null,i==="local-model"&&!c&&J();try{let ae=await U.ollamaHosts();if(s)return;c=ae}catch(ae){if(s)return;$=ae,Z||M(ae.message||"\u7121\u6CD5\u53D6\u5F97 Ollama \u4E3B\u6A5F\u3002","danger")}finally{s||(v=!1,i==="local-model"&&J())}}},C=async()=>{await S({quiet:!0}),await ne({quiet:!0})},ne=async({quiet:Z=!1,status:ae=null}={})=>{Z||(G.disabled=!0,ke(G,!0,"\u6AA2\u67E5\u4E2D\u2026"));try{let ee=ae||await U.status();if(s)return;n=ee,J(),Z||M("\u670D\u52D9\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(ee){if(s)return;i!=="tests"&&(E="",H.innerHTML=Bi(ee)),Z||M(ee.message||"\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002","danger")}finally{s||(G.disabled=!1,ke(G,!1))}},ge=async({quiet:Z=!1,status:ae=null}={})=>{if(await ne({quiet:Z,status:ae}),i==="resources"&&await B({quiet:Z}),i==="local-model"&&await S({quiet:Z}),!Z&&i==="tests"){let ee=H.querySelector("#tests-refresh");ee&&ee.click()}};T.addEventListener("click",Z=>{let ae=Z.target.closest("[data-status-tab]");if(!ae)return;let ee=ae.dataset.statusTab;Di.some(_e=>_e.id===ee)&&(i=ee,J(),i==="resources"&&!o&&!l&&B(),i==="local-model"&&S())}),H.addEventListener("click",Z=>{Z.target.closest("#status-retry")&&ne(),Z.target.closest("#status-resources-retry")&&B()}),H.addEventListener("click",async Z=>{let ae=Z.target.closest("[data-ollama-action]");if(!ae)return;let ee=ae.dataset.ollamaAction,_e=Number(ae.dataset.id||0);if(ee==="refresh-hosts"){await S();return}if(ee==="edit-host"){h=_e,J(),e.querySelector(".ollama-host-form")?.scrollIntoView({behavior:"smooth",block:"center"});return}if(ee==="cancel-host-edit"){h=null,J();return}if(ee==="delete-host"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 Ollama \u4E3B\u6A5F #${_e}\uFF1F`))return;try{await U.deleteOllamaHost(_e),Number(h)===_e&&(h=null),M("Ollama \u4E3B\u6A5F\u5DF2\u522A\u9664\u3002","info"),await C()}catch(z){M(z.message||"\u522A\u9664\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(ee==="activate-host"){try{await U.activateOllamaHost(_e),M("\u5DF2\u5207\u63DB\u4F7F\u7528\u7684 Ollama \u4E3B\u6A5F\u3002","ok"),await C()}catch(z){M(z.message||"\u5207\u63DB\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(ee==="deactivate-host"){try{await U.deactivateOllamaHosts(),M("\u5DF2\u505C\u7528\u6307\u5B9A\u7684 Ollama \u4E3B\u6A5F\uFF0C\u5C07\u6CBF\u7528 .env \u8A2D\u5B9A\u3002","info"),await C()}catch(z){M(z.message||"\u505C\u7528\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(ee==="check-capabilities"){ke(ae,!0,"\u6AA2\u67E5\u4E2D\u2026");try{await U.checkOllamaCapabilities(),M("\u5DF2\u66F4\u65B0\u6240\u6709\u4E3B\u6A5F\u7684\u6A21\u578B\u80FD\u529B\u3002","ok",4e3),await C()}catch(z){M(z.message||"\u7121\u6CD5\u6AA2\u67E5\u6A21\u578B\u80FD\u529B\u3002","danger",7e3)}finally{ke(ae,!1)}return}if(ee==="select-model"||ee==="clear-model"){let z=String(ae.dataset.model||""),be=String(ae.dataset.role||"");try{ee==="select-model"?(await U.selectOllamaModel(_e,{model:z,role:be}),M(`\u5DF2\u8A2D\u5B9A ${be==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\uFF1A${z}`,"ok")):(await U.clearOllamaModel(_e,{model:z,role:be}),M(`\u5DF2\u53D6\u6D88 ${be==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\u3002`,"info")),await C()}catch(Me){M(Me.message||"\u6A21\u578B\u8A2D\u5B9A\u5931\u6557\u3002","danger")}}}),H.addEventListener("submit",async Z=>{let ae=Z.target.closest("form[data-ollama-form='host']");if(!ae)return;Z.preventDefault();let ee=new FormData(ae),_e=Number(ee.get("host_id")||0),z={name:String(ee.get("name")||"").trim(),url:String(ee.get("url")||"").trim(),port:Number(ee.get("port")||11434)};try{_e?(await U.updateOllamaHost(_e,z),M("Ollama \u4E3B\u6A5F\u5DF2\u66F4\u65B0\u3002","ok")):(await U.addOllamaHost(z),M("Ollama \u4E3B\u6A5F\u5DF2\u65B0\u589E\u3002","ok")),h=null,await C()}catch(be){let Me=be.detail||be.payload?.detail,pe=Me?.errors?.join(" \xB7 ")||Me?.message||be.message||"\u5132\u5B58\u4E3B\u6A5F\u5931\u6557\u3002";M(pe,"danger",8e3)}}),G.addEventListener("click",()=>ge());let V=()=>{a&&(a(),a=null)};return Y.addEventListener("change",()=>{V(),Y.checked&&(a=wt("status",(Z,ae)=>{s||ge({quiet:!0,status:ae?.snapshot||null})}),ge({quiet:!0}),M("\u5DF2\u555F\u7528\u5F8C\u7AEF\u63A8\u9001\u81EA\u52D5\u66F4\u65B0\uFF08\u6BCF 30 \u79D2\uFF09\u3002","info",2200))}),await ne({quiet:!0}),t&&typeof t.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"),()=>{s=!0,ye(),V()}}var zi="home",Ta={home:{page:tn,title:"Judgment RAG Console \xB7 \u6CD5\u898F\u8207\u5224\u6C7A\u6AA2\u7D22"},rag:{page:_n,title:"RAG \u63D0\u554F \xB7 Judgment RAG Console"},data:{page:mn,title:"\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"},quality:{page:Cn,title:"\u8CC7\u6599\u54C1\u8CEA \xB7 Judgment RAG Console"},performance:{page:$n,title:"\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"},processing:{page:jn,title:"\u8CC7\u6599\u8655\u7406 \xB7 Judgment RAG Console"},status:{page:In,title:"\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"},tests:{page:Ma,title:"\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"}},Bn=document.getElementById("app-main"),La=null,ja=0;function Dn(){let t=window.location.hash.replace(/^#\/?/,"").trim().split("/")[0]||zi;return Object.prototype.hasOwnProperty.call(Ta,t)?t:zi}function wu(e){document.querySelectorAll("[data-route]").forEach(t=>{let s=t.dataset.route===e;t.classList.toggle("is-active",s),s?t.setAttribute("aria-current","page"):t.removeAttribute("aria-current")})}function _u(e){return`<section class="page">
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
  </section>`}async function On(){let e=Dn(),t=++ja;if(wu(e),window.location.hash!==`#/${e}`&&window.history.replaceState(null,"",`#/${e}`),typeof La=="function"){try{La()}catch{}La=null}document.title=Ta[e].title;let s={route:e,navigate(a){Ta[a]&&(window.location.hash=`#/${a}`)},setTitle(a){t===ja&&a&&(document.title=a)}};try{let a=Ta[e].page.render(Bn,s);rr(),window.scrollTo({top:0,behavior:"auto"}),Bn.focus({preventScroll:!0});let n=await a;if(t!==ja){typeof n=="function"&&n();return}La=typeof n=="function"?n:null}catch(a){if(t!==ja)return;console.error("Failed to render route",e,a),Bn.innerHTML=_u(a);let n=document.getElementById("route-retry");n&&n.addEventListener("click",()=>On()),M("\u9801\u9762\u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}}function ku(){document.addEventListener("keydown",e=>{if(e.key!=="/"||e.metaKey||e.ctrlKey||e.altKey)return;let t=document.activeElement;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable))return;let a=Dn(),n=a==="home"?"home-question":a==="rag"?"rag-question":"";if(!n)return;let i=document.getElementById(n);i&&(e.preventDefault(),i.focus())})}function Su(){let e=document.querySelector('[data-route="processing"]');if(!e)return;let t=e.querySelector(".nav-update-badge");t||(t=document.createElement("span"),t.className="nav-update-badge",t.hidden=!0,e.appendChild(t));let s=async(a=null)=>{try{let n=a||await U.updatesStatus(),i=Number(n.update_count)||0;i>0?(t.textContent=String(i),t.title=`\u6CD5\u898F\uFF0F\u547D\u4EE4\uFF0F\u5224\u6C7A\u6709 ${i} \u9805\u66F4\u65B0`,t.hidden=!1):t.hidden=!0}catch{t.hidden=!0}};s(),wt("updates",(a,n)=>s(n?.snapshot||null)),window.addEventListener("judgment:updates-changed",()=>s())}function Hi(){or(),ku(),Su(),window.addEventListener("hashchange",On),On(),Ws()&&window.setTimeout(()=>{Dn()==="rag"&&(window.location.hash="#/tests")},700)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Hi):Hi();})();
