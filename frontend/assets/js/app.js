(()=>{var Ui=Object.defineProperty;var Jt=(e,t)=>{for(var s in t)Ui(e,s,{get:t[s],enumerable:!0})};var Ca="judgment.api_base",Ra="http://127.0.0.1:9200",lt=class extends Error{constructor(t,s=0,a=null){super(t),this.name="ApiError",this.status=s,this.detail=a}};function Fn(e){return["localhost","127.0.0.1","::1","[::1]"].includes(e)}function Vt(e){let t=String(e??"").trim();if(!t||t==="/")return"";t=t.replace(/\/+$/,""),!/^https?:\/\//i.test(t)&&!t.startsWith("/")&&(t=`${Fn(t.split(":")[0])?"http":"https"}://${t}`);try{let s=new URL(t,window.location.href);return s.protocol!=="http:"&&s.protocol!=="https:"?"":`${s.origin}${s.pathname==="/"?"":s.pathname.replace(/\/+$/,"")}`}catch{return t}}function Pa(e){let t=Vt(e);if(!t)return!0;try{let s=new URL(t);return s.protocol==="http:"||s.protocol==="https:"}catch{return!1}}function Ia(){try{let e=new URLSearchParams(window.location.search);return e.has("api")?Vt(e.get("api")):null}catch{return null}}function Ba(){try{let e=window.localStorage.getItem(Ca);return e===null?null:Vt(e)}catch{return null}}function Oa(){let e=window.JUDGMENT_CONFIG&&window.JUDGMENT_CONFIG.apiBase;return Vt(e||"")}function Wt(){let e=Ia();if(e!==null)return e;let t=Ba();if(t!==null)return t;let s=Oa();return s||(window.location.protocol==="file:"?Ra:"")}function Qi(){if(Ia()!==null)return!0;let e=Ba();return e!==null?!!e:!!Oa()}function Kt(){return Ia()!==null?"query":Ba()!==null?"storage":Oa()?"config":window.location.protocol==="file:"?"file-default":"same-origin"}function Ws(){return Qi()||window.location.protocol==="file:"||!window.JUDGMENT_CONFIG?!1:!Fn(window.location.hostname)}function Da(e){let t=Vt(e);try{t?window.localStorage.setItem(Ca,t):window.localStorage.removeItem(Ca)}catch{}return t}function is(e=Wt()){return e||"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"}function bt(e,t=Wt()){return t?`${t}${e.startsWith("/")?e:`/${e}`}`:e}function vt(e,t,{onError:s=null,onProgress:a=null}={}){let n=(Array.isArray(e)?e:[e]).map(c=>String(c||"").trim()).filter(Boolean);if(!n.length||typeof EventSource>"u")return()=>{};let i=new EventSource(bt(`/api/events/stream?topic=${encodeURIComponent(n.join(","))}`)),o=0;i.onopen=()=>{o+=1};let l=c=>{let v={};try{v=JSON.parse(c.data||"{}")}catch{v={}}v.initial&&o<=1&&!v.snapshot||t?.(v.topic||n[0],v)},d=c=>{let v={};try{v=JSON.parse(c.data||"{}")}catch{v={}}a?.(v.topic||n[0],v)};return i.addEventListener("refresh",l),i.addEventListener("progress",d),i.onerror=()=>{s?.()},()=>{i.removeEventListener("refresh",l),i.removeEventListener("progress",d),i.close()}}function Fa(e){return`\u7121\u6CD5\u9023\u7DDA\u5230\u4F3A\u670D\u5668${e?`\uFF08${e}\uFF09`:""}\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u662F\u5426\u555F\u52D5\uFF0C\u6216\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u8A2D\u5B9A\u5F8C\u7AEF\u4F4D\u5740\u3002`}async function oe(e,t={}){let s=Wt(),a=new AbortController,n=t.timeout===void 0?3e4:t.timeout,i=n>0?window.setTimeout(()=>a.abort(),n):null,o=Date.now(),l=performance.now(),d=t.requestId||zn(),c={Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},"X-Judgment-Request-Id":d,"X-Judgment-Client-Started-At":String(o),...t.headers||{}},v;try{v=await fetch(bt(e,s),{...t,headers:c,signal:a.signal})}catch(y){throw y.name==="AbortError"?new lt("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new lt(Fa(s),0,y)}finally{i&&window.clearTimeout(i)}let $=null;if((v.headers.get("content-type")||"").includes("application/json"))try{$=await v.json()}catch{$=null}else try{$=await v.text()}catch{$=null}let f=performance.now(),p=v.headers.get("X-Judgment-Request-Id")||d;if(t.trackClient!==!1&&p){let y=Math.round(performance.now()-l);window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{Hn({request_id:p,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:y,render_ms:Math.max(0,Math.round(performance.now()-f)),status:v.ok?"success":"failed"})})})}if(!v.ok){let y=$&&typeof $=="object"?$.detail||$.message:$,S=typeof y=="string"&&y?y:`\u4F3A\u670D\u5668\u56DE\u61C9 ${v.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new lt(S,v.status,y)}return $}function zn(){try{if(window.crypto&&typeof window.crypto.randomUUID=="function")return window.crypto.randomUUID().replace(/-/g,"").slice(0,32)}catch{}return`req${Date.now().toString(36)}${Math.random().toString(36).slice(2,10)}`}function Hn(e){try{fetch(bt("/api/performance/client",Wt()),{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e),keepalive:!0}).catch(()=>{})}catch{}}async function Un(e){let t=Vt(e);if(!Pa(t))throw new lt("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002");let s=performance.now(),a=new AbortController,n=window.setTimeout(()=>a.abort(),1e4);try{let i=await fetch(bt("/api/health",t),{headers:{Accept:"application/json"},signal:a.signal});if(!i.ok)throw new lt(`API \u56DE\u61C9 ${i.status}\u3002`,i.status);let o=await i.json();return{base:t,version:o.version||"\u2014",duration_ms:Math.round(performance.now()-s)}}catch(i){throw i instanceof lt?i:i.name==="AbortError"?new lt("\u9023\u7DDA\u6E2C\u8A66\u903E\u6642\uFF0C\u8ACB\u78BA\u8A8D API \u4F4D\u5740\u8207\u7DB2\u8DEF\u3002",0,i):new lt(Fa(t),0,i)}finally{window.clearTimeout(n)}}var Q={health(){return oe("/api/health")},status(){return oe("/api/status",{trackClient:!1})},ollamaHosts(){return oe("/api/ollama/hosts",{timeout:3e4,trackClient:!1})},addOllamaHost(e){return oe("/api/ollama/hosts",{method:"POST",body:JSON.stringify(e),timeout:3e4,trackClient:!1})},updateOllamaHost(e,t){return oe(`/api/ollama/hosts/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},deleteOllamaHost(e){return oe(`/api/ollama/hosts/${encodeURIComponent(e)}`,{method:"DELETE",timeout:3e4,trackClient:!1})},activateOllamaHost(e){return oe(`/api/ollama/hosts/${encodeURIComponent(e)}/activate`,{method:"POST",timeout:3e4,trackClient:!1})},deactivateOllamaHosts(){return oe("/api/ollama/hosts/deactivate",{method:"POST",timeout:3e4,trackClient:!1})},reorderOllamaHosts(e){return oe("/api/ollama/hosts/reorder",{method:"POST",body:JSON.stringify({host_ids:e}),timeout:3e4,trackClient:!1})},checkOllamaCapabilities(){return oe("/api/ollama/hosts/capabilities/test",{method:"POST",timeout:18e4,trackClient:!1})},selectOllamaModel(e,t){return oe(`/api/ollama/hosts/${encodeURIComponent(e)}/models/select`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},clearOllamaModel(e,t){return oe(`/api/ollama/hosts/${encodeURIComponent(e)}/models/clear`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},systemUsage(){return oe("/api/system-usage",{trackClient:!1})},indexVersions(){return oe("/api/index-versions",{trackClient:!1})},indexVersion(e){return oe(`/api/index-versions/${encodeURIComponent(e)}`,{trackClient:!1})},validateIndexVersion(e){return oe(`/api/index-versions/${encodeURIComponent(e)}/validate`,{method:"POST",trackClient:!1})},activateIndexVersion(e){return oe(`/api/index-versions/${encodeURIComponent(e)}/activate`,{method:"POST",trackClient:!1})},rollbackIndexVersion(){return oe("/api/index-versions/rollback",{method:"POST",trackClient:!1})},reconcileIndexAlias(e=!1){let t=new URLSearchParams({repair:e?"true":"false"});return oe(`/api/index-alias/reconcile?${t.toString()}`,{trackClient:!1})},catalog(){return oe("/api/catalog")},judgmentStats(){return oe("/api/judgment-stats")},query({database:e,filters:t,page:s=1,pageSize:a=25}){return oe("/api/query",{method:"POST",body:JSON.stringify({database:e,filters:t,page:s,page_size:a})})},dataSuggest({kind:e,query:t="",limit:s=12}){let a=new URLSearchParams({kind:e,query:t,limit:String(s)});return oe(`/api/data/suggest?${a.toString()}`,{timeout:45e3,trackClient:!1})},schemaSuggest({database:e,table:t,column:s,query:a,limit:n=1e3}){let i=new URLSearchParams({database:e,table:t,column:s,q:a||"",limit:String(n)});return oe(`/api/schema/suggest?${i.toString()}`,{timeout:3e4})},lawDetail(e,t="",s="",a=""){let n=new URLSearchParams({law_key:e});return t&&n.set("source_type",t),s&&n.set("version_id",String(s)),a&&n.set("article_no",String(a)),oe(`/api/law?${n.toString()}`,{timeout:45e3})},judgmentDetail(e,t=""){let s=new URLSearchParams({jid:e});return t&&s.set("source",t),oe(`/api/judgment?${s.toString()}`,{timeout:45e3})},testMode(){return oe("/api/test-mode",{trackClient:!1})},llmModels(){return oe("/api/llm/models",{timeout:6e4,trackClient:!1})},testLlmModels(){return oe("/api/llm/models/test",{method:"POST",timeout:12e4,trackClient:!1})},selectLlmModel(e,t=null){return oe("/api/llm/model",{method:"POST",body:JSON.stringify({model:e,host_id:t}),timeout:3e4,trackClient:!1})},setTestMode(e){return oe("/api/test-mode",{method:"POST",body:JSON.stringify({enabled:!!e}),trackClient:!1})},testRuns(e=20){let t=new URLSearchParams({limit:String(e)});return oe(`/api/test-runs?${t.toString()}`,{trackClient:!1})},testRunCurrent(){return oe("/api/test-runs/current",{trackClient:!1})},testRun(e){return oe(`/api/test-runs/${encodeURIComponent(e)}`,{trackClient:!1})},performanceOptions(){return oe("/api/performance/options",{trackClient:!1})},performance(e={},t=1,s=25){let a=new URLSearchParams;for(let[n,i]of Object.entries(e))i==null||i===""||a.set(n,String(i));return a.set("page",String(t)),a.set("page_size",String(s)),oe(`/api/performance?${a.toString()}`,{timeout:45e3,trackClient:!1})},quality(){return oe("/api/quality",{timeout:18e4,trackClient:!1})},processing(){return oe("/api/processing",{timeout:45e3,trackClient:!1})},processingActive(){return oe("/api/processing/active",{timeout:3e3,trackClient:!1})},judgmentDownloadStatus(){return oe("/api/judgment-download/status",{timeout:3e4,trackClient:!1})},versioningSummary(){return oe("/api/versioning/summary",{trackClient:!1})},updatesStatus(){return oe("/api/updates/status",{trackClient:!1})},checkCourts(){return oe("/api/courts/check",{timeout:6e4,trackClient:!1})},checkLawVersions(){return oe("/api/law-versions/check",{timeout:6e4,trackClient:!1})},checkUpdates(e=[]){let t=Array.isArray(e)&&e.length?{source_types:e}:{};return oe("/api/updates/check",{method:"POST",body:JSON.stringify(t),timeout:12e4,trackClient:!1})},versioningSnapshots(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.limit&&t.set("limit",String(e.limit)),oe(`/api/versioning/judgments/snapshots?${t.toString()}`,{trackClient:!1})},versioningChanges(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit)),oe(`/api/versioning/judgments/changes?${t.toString()}`,{trackClient:!1})},versioningJudgment(e){return oe(`/api/versioning/judgments/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVersion(e){return oe(`/api/versioning/judgments/versions/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVector(e,t){return oe(`/api/versioning/judgments/${encodeURIComponent(e)}/vectors/${encodeURIComponent(t)}`,{trackClient:!1})},versioningAudit(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit||500)),oe(`/api/versioning/audit?${t.toString()}`,{trackClient:!1})},questionBankStats(){return oe("/api/question-bank/stats",{trackClient:!1})},questionBankItems(e={},t=50,s=0){let a=new URLSearchParams;for(let[n,i]of Object.entries(e))if(!(i==null||i==="")){if(Array.isArray(i)){for(let o of i)o==null||o===""||a.append(n,String(o));continue}a.set(n,String(i))}return a.set("limit",String(t)),a.set("offset",String(s)),oe(`/api/question-bank/items?${a.toString()}`,{timeout:45e3,trackClient:!1})},questionBankTags(e="",t=12){let s=new URLSearchParams({query:e,limit:String(t)});return oe(`/api/question-bank/tags?${s.toString()}`,{timeout:45e3,trackClient:!1})},questionBankItem(e){return oe(`/api/question-bank/items/${encodeURIComponent(e)}`,{timeout:45e3,trackClient:!1})},createQuestionBankItem(e){return oe("/api/question-bank/items",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},createQuestionBankItemWithAI(e){return oe("/api/question-bank/ai-items",{method:"POST",body:JSON.stringify(e),timeout:42e4,trackClient:!1})},updateQuestionBankItem(e,t){return oe(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteQuestionBankItem(e){return oe(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},restoreQuestionBankItem(e){return oe(`/api/question-bank/items/${encodeURIComponent(e)}/restore`,{method:"POST",timeout:45e3,trackClient:!1})},submitQuestionBankItemForReview(e){return oe(`/api/question-bank/items/${encodeURIComponent(e)}/submit`,{method:"POST",timeout:45e3,trackClient:!1})},reviewQuestionBankItem(e,t){return oe(`/api/question-bank/items/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},importQuestionBank(e){return oe("/api/question-bank/import",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},exportQuestionBank({status:e="accepted"}={}){let t=new URLSearchParams({status:e});return oe(`/api/question-bank/export?${t.toString()}`,{timeout:45e3,trackClient:!1})},revalidateQuestionBank(){return oe("/api/question-bank/revalidate",{method:"POST",body:JSON.stringify({}),timeout:12e4,trackClient:!1})},benchmarkReadyQuestions(e=200){return oe(`/api/question-bank/benchmark-ready?limit=${e}`,{timeout:45e3,trackClient:!1})},benchmarkSuites(){return oe("/api/benchmark/suites",{timeout:45e3,trackClient:!1})},benchmarkSuiteLatestAnswers(e){return oe(`/api/benchmark/suites/${encodeURIComponent(e)}/latest-answers`,{timeout:45e3,trackClient:!1})},removeBenchmarkSuiteItem(e,t){return oe(`/api/benchmark/suites/${encodeURIComponent(e)}/items/${encodeURIComponent(t)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},createBenchmarkSuite(e){return oe("/api/benchmark/suites",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},updateBenchmarkSuite(e,t){return oe(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteBenchmarkSuite(e){return oe(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},benchmarkRuns(e=20){return oe(`/api/benchmark/runs?limit=${e}`,{timeout:45e3,trackClient:!1})},startBenchmarkRun(e){return oe("/api/benchmark/runs",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},benchmarkRun(e,t=!0){return oe(`/api/benchmark/runs/${encodeURIComponent(e)}?include_cases=${t}`,{timeout:45e3,trackClient:!1})},stopBenchmarkRun(e){return oe(`/api/benchmark/runs/${encodeURIComponent(e)}/stop`,{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},reviewBenchmarkResult(e,t){return oe(`/api/benchmark/results/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},benchmarkModels(){return oe("/api/benchmark/models",{timeout:45e3,trackClient:!1})},benchmarkFingerprintHistory(e,t=50){return oe(`/api/benchmark/fingerprints/${encodeURIComponent(e)}?limit=${t}`,{timeout:45e3,trackClient:!1})},processingPlan(){return oe("/api/processing/plan",{timeout:45e3,trackClient:!1})},startProcessingWorkflow(e){return oe(`/api/processing/workflows/${encodeURIComponent(e)}/run`,{method:"POST",body:JSON.stringify({})})},startProcessingUpdate(e=!1){return oe("/api/processing/update",{method:"POST",body:JSON.stringify({index:!!e}),timeout:45e3,trackClient:!1})},stopProcessingUpdate(){return oe("/api/processing/stop",{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},rag(e,t={}){return oe("/api/rag/query",{method:"POST",body:JSON.stringify({question:e}),timeout:t.testMode?0:3e5})},async ragStream(e,{testMode:t=!1,onStep:s=null,onPartial:a=null,onToken:n=null,onTokenReset:i=null}={}){let o=Wt(),l=new AbortController,d=t?0:3e5,c=d>0?window.setTimeout(()=>l.abort(),d):null,v=Date.now(),$=performance.now(),h=zn(),f={Accept:"text/event-stream","Content-Type":"application/json","X-Judgment-Request-Id":h,"X-Judgment-Client-Started-At":String(v)},p;try{p=await fetch(bt("/api/rag/query/stream",o),{method:"POST",headers:f,body:JSON.stringify({question:e}),signal:l.signal})}catch(V){throw V.name==="AbortError"?new lt("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new lt(Fa(o),0,V)}finally{c&&window.clearTimeout(c)}if(!p.ok){let V=null;try{V=await p.json()}catch{V=null}let Y=V&&typeof V=="object"&&V.detail?String(V.detail):`\u4F3A\u670D\u5668\u56DE\u61C9 ${p.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new lt(Y,p.status,V)}if(!p.body)throw new lt("\u4F3A\u670D\u5668\u6C92\u6709\u56DE\u50B3\u53EF\u8B80\u53D6\u7684\u6D41\u7A0B\u4E32\u6D41\u3002",0,null);let y=p.body.getReader(),S=new TextDecoder,N="",E=null,I=null;try{for(;;){let{value:V,done:Y}=await y.read();if(Y)break;N+=S.decode(V,{stream:!0});let ye=N.indexOf(`

`);for(;ye>=0;){let Te=N.slice(0,ye).replace(/\r/g,"");N=N.slice(ye+2);let J="message",B=[];for(let k of Te.split(`
`))k.startsWith("event:")?J=k.slice(6).trim():k.startsWith("data:")&&B.push(k.slice(5).trimStart());if(B.length){let k=null;try{k=JSON.parse(B.join(`
`))}catch{k=null}if(k)if(J==="step"&&typeof s=="function")try{s(k)}catch{}else if(J==="partial"){if(typeof a=="function")try{a(k)}catch{}}else if(J==="token"){if(typeof n=="function")try{n(String(k.text||""))}catch{}}else if(J==="token_reset"){if(typeof i=="function")try{i()}catch{}}else J==="result"?E=k:J==="error"&&(I=new lt(k.message||k.detail||"RAG \u6D41\u7A0B\u5931\u6557\u3002",0,k))}ye=N.indexOf(`

`)}}}finally{try{await y.cancel()}catch{}c&&window.clearTimeout(c)}if(I)throw I;if(!E)throw new lt("\u6D41\u7A0B\u4E32\u6D41\u7D50\u675F\uFF0C\u4F46\u6C92\u6709\u6536\u5230\u6700\u7D42\u56DE\u7B54\u3002",0,null);let H=Math.round(performance.now()-$);return Hn({request_id:h,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:H,render_ms:0,status:"success"}),E&&typeof E=="object"&&(E._client_request_id=h),E}};var Qn="judgment.theme",za="nvidia",Ks=[{id:"vercel",name:"Vercel",description:"\u9ED1\u767D\u7CBE\u6E96 \xB7 Geist \xB7 \u5E7E\u4F55\u7559\u767D",swatches:["#0070f3","#171717","#fafafa"],metaColor:"#ffffff"},{id:"apple",name:"Apple",description:"SF Pro \xB7 \u5927\u5713\u89D2 \xB7 \u6C89\u6D78\u7559\u767D",swatches:["#0066cc","#1d1d1f","#f5f5f7"],metaColor:"#fbfbfd"},{id:"meta",name:"Meta",description:"Optimistic \xB7 \u660E\u4EAE\u85CD \xB7 \u81A0\u56CA\u5143\u4EF6",swatches:["#0064e0","#0091ff","#f1f4f7"],metaColor:"#ffffff"},{id:"nvidia",name:"NVIDIA",description:"GPU \u7DA0 \xB7 \u9ED1\u5E95 \xB7 \u92B3\u5229\u76F4\u89D2",swatches:["#76b900","#000000","#f7f7f7"],metaColor:"#000000"},{id:"ibm",name:"IBM",description:"Carbon \xB7 Plex Sans \xB7 \u4F01\u696D\u85CD",swatches:["#0f62fe","#161616","#f4f4f4"],metaColor:"#161616"},{id:"stripe",name:"Stripe",description:"\u7D2B\u975B\u6F38\u5C64 \xB7 \u7CBE\u5BC6\u91D1\u878D\u611F",swatches:["#635bff","#ea2261","#f6f9fc"],metaColor:"#ffffff"},{id:"linear",name:"Linear",description:"\u6DF1\u7A7A\u9ED1 \xB7 \u975B\u7D2B \xB7 \u6975\u7C21\u7DDA\u689D",swatches:["#17171d","#5e6ad2","#e8e8ec"],metaColor:"#010102"},{id:"figma",name:"Figma",description:"\u591A\u5F69\u8272\u584A \xB7 \u5354\u4F5C\u611F \xB7 \u85CD\u8272\u7126\u9EDE",swatches:["#0d99ff","#a259ff","#0acf83"],metaColor:"#ffffff"},{id:"notion",name:"Notion",description:"\u6696\u767D\u7D19\u5F35 \xB7 \u896F\u7DDA\u6A19\u984C \xB7 \u77E5\u8B58\u5EAB",swatches:["#0075de","#191918","#f7f6f3"],metaColor:"#ffffff"},{id:"openai",name:"OpenAI",description:"\u6696\u7070\u756B\u5E03 \xB7 \u9ED1\u8272\u884C\u52D5 \xB7 \u7DA0\u8272\u8A0A\u865F",swatches:["#10a37f","#0d0d0d","#f9f9f7"],metaColor:"#f9f9f7"}],Ha=new Map(Ks.map(e=>[e.id,e]));function Gi(e){return Ha.has(e)}function Ji(e){return Ha.get(e)||Ha.get(za)}function Ua(){try{let e=window.localStorage.getItem(Qn);return Gi(e)?e:za}catch{return za}}function Qa(e,{persist:t=!0}={}){let s=Ji(e);document.documentElement.dataset.theme=s.id;let a=document.getElementById("theme-color-meta");if(a&&a.setAttribute("content",s.metaColor),document.querySelectorAll(".theme-option").forEach(n=>{let i=n.dataset.themeId===s.id;n.classList.toggle("is-active",i),n.setAttribute("aria-checked",i?"true":"false")}),t)try{window.localStorage.setItem(Qn,s.id)}catch{}return window.dispatchEvent(new CustomEvent("judgment:theme",{detail:{theme:s.id}})),s}var Vi={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},Wi={operational:{label:"\u6B63\u5E38",tone:"ok"},success:{label:"\u6210\u529F",tone:"ok"},ok:{label:"\u6B63\u5E38",tone:"ok"},healthy:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},warning:{label:"\u6CE8\u610F",tone:"warn"},empty:{label:"\u7121\u8CC7\u6599",tone:"warn"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},running:{label:"\u57F7\u884C\u4E2D",tone:"info"},pending:{label:"\u7B49\u5F85",tone:"idle"},skipped:{label:"\u7565\u904E",tone:"idle"},partial:{label:"\u90E8\u5206\u6210\u529F",tone:"warn"},preview:{label:"\u9810\u89BD\u6A21\u5F0F",tone:"info"},retrieval_only:{label:"\u50C5\u6AA2\u7D22\u7D50\u679C",tone:"warn"},not_indexed:{label:"\u5C1A\u672A\u7D22\u5F15",tone:"warn"},missing_query:{label:"\u7B49\u5F85\u67E5\u8A62",tone:"idle"},client_side:{label:"\u700F\u89BD\u5668\u7AEF",tone:"info"},not_configured:{label:"\u672A\u8A2D\u5B9A",tone:"idle"},unavailable:{label:"\u96E2\u7DDA",tone:"danger"},failed:{label:"\u5931\u6557",tone:"danger"},error:{label:"\u932F\u8AA4",tone:"danger"}},Ki={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},Yi={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},Gn={search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',send:'<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',refresh:'<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 4v5.5H15"/>',copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',check:'<path d="m5 12 4.2 4.2L19 6.5"/>',plus:'<path d="M12 5v14M5 12h14"/>',edit:'<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m13.5 7.5 3 3"/>',trash:'<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v5M14 11v5"/>',upload:'<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>',x:'<path d="m6 6 12 12M18 6 6 18"/>',external:'<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/>',message:'<path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H6l-3 2 1.3-4.2A8.5 8.5 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',history:'<path d="M3.2 12a8.8 8.8 0 1 0 2.8-6.3L3.2 8.5"/><path d="M3 3.5v5h5"/><path d="M12 7.5V12l3 1.8"/>',database:'<ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/><path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/>',layers:'<path d="m12 3 9 4.8-9 4.8-9-4.8L12 3Z"/><path d="m3 12.2 9 4.8 9-4.8"/><path d="m3 16.7 9 4.8 9-4.8"/>',cube:'<path d="m12 2.8 8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4L12 2.8Z"/><path d="m3.8 7.4 8.2 4.6 8.2-4.6"/><path d="M12 12v9.2"/>',browser:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6.5 6.5h.01"/>',download:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',chevronLeft:'<path d="m14.5 5-7 7 7 7"/>',chevronRight:'<path d="m9.5 5 7 7-7 7"/>',chevronDown:'<path d="m5 9 7 7 7-7"/>',arrowRight:'<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',alert:'<path d="M12 3 2.5 20.5h19L12 3Z"/><path d="M12 9v4.5"/><path d="M12 17.5h.01"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',sparkles:'<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"/>',table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M9 9.5V20M15 9.5V20"/>',sliders:'<path d="M4 7h8M16 7h4M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',palette:'<path d="M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h4a5 5 0 0 0 0-10h-4Z"/><circle cx="7.5" cy="10.5" r=".8" fill="currentColor" stroke="none"/><circle cx="10" cy="6.8" r=".8" fill="currentColor" stroke="none"/><circle cx="14.5" cy="6.8" r=".8" fill="currentColor" stroke="none"/>',server:'<rect x="3" y="4" width="18" height="6" rx="1.6"/><rect x="3" y="14" width="18" height="6" rx="1.6"/><path d="M7 7h.01M7 17h.01"/>',brain:'<path d="M9.7 4.2a2.8 2.8 0 0 0-3 2.8 2.8 2.8 0 0 0-1.1 5.2A2.9 2.9 0 0 0 7.8 18a2.9 2.9 0 0 0 3.9 2V4.2a2.8 2.8 0 0 0-2 0Z"/><path d="M14.3 4.2a2.8 2.8 0 0 1 3 2.8 2.8 2.8 0 0 1 1.1 5.2A2.9 2.9 0 0 1 16.2 18a2.9 2.9 0 0 1-3.9 2"/>',cloud:'<path d="M7 18.5h10.5a3.5 3.5 0 0 0 .4-7 5.5 5.5 0 0 0-10.6-1.3A4.2 4.2 0 0 0 7 18.5Z"/>',code:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',play:'<path d="M7 4.5v15l13-7.5-13-7.5Z"/>',file:'<path d="M6 2.8h8l4.5 4.5v13.9H6V2.8Z"/><path d="M14 2.8V7.5h5"/>',activity:'<path d="M3 12h4l2.2-5 4.1 10 2.2-5H21"/>',shield:'<path d="M12 2.8 20 6v6c0 4.7-3.2 8-8 9.2C7.2 20 4 16.7 4 12V6l8-3.2Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',terminal:'<path d="m5 7 5 5-5 5"/><path d="M12 17h7"/>',filter:'<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',link:'<path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10.2 5.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-1.4 1.4a5 5 0 0 0 7.1 7.1l1.2-1.2"/>',grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',pin:'<path d="M9 3.5h6l-1.1 5 2.6 2.6v2.4H7.5v-2.4L10.1 8.5 9 3.5Z"/><path d="M12 13.5v7"/>',more:'<circle cx="4.2" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="19.8" cy="12" r="2.6" fill="currentColor" stroke="none"/>',folder:'<path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h3.7l2 2H18a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5v-9Z"/>',cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9.5 9.5h5v5h-5z"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>'};function r(e){return String(e??"").replace(/[&<>"']/g,t=>Vi[t])}function m(e,t=16,s=""){let a=Gn[e]||Gn.info;return`<svg${s?` class="${r(s)}"`:""} width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a}</svg>`}function u(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?new Intl.NumberFormat("zh-TW").format(s):t}function Le(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=["B","KB","MB","GB","TB"],a=0;for(;t>=1024&&a<s.length-1;)t/=1024,a+=1;return a===0?`${t.toFixed(0)} B`:`${t.toFixed(1)} ${s[a]}`}function Ga(e){if(e instanceof Date)return e;if(typeof e=="number"){let n=new Date(e);return Number.isNaN(n.getTime())?null:n}let t=String(e??"").trim();if(!t)return null;if(/^\d{8}$/.test(t))return new Date(Number(t.slice(0,4)),Number(t.slice(4,6))-1,Number(t.slice(6,8)));let s=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(t),a=new Date(s?`${t}Z`:t);return Number.isNaN(a.getTime())?null:a}function Lt(e){let t=Ga(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit"}).format(t):e?r(e):"\u2014"}function je(e){let t=Ga(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1}).format(t):e?r(e):"\u2014"}function Ls(e){let t=Ga(e);if(!t)return"";let s=Date.now()-t.getTime();return s<45e3?"\u525B\u525B":s<36e5?`${Math.max(1,Math.round(s/6e4))} \u5206\u9418\u524D`:s<864e5?`${Math.round(s/36e5)} \u5C0F\u6642\u524D`:s<6048e5?`${Math.round(s/864e5)} \u5929\u524D`:Lt(t)}function fe(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;if(t<6e4)return`${(t/1e3).toFixed(1)} s`;let s=Math.floor(t/6e4),a=Math.round(t%6e4/1e3);return`${s}m ${a}s`}function Tt(e){return Wi[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function He(e,t){let s=Tt(e);return`<span class="badge ${Ki[s.tone]}"><span class="status-dot ${Yi[s.tone]}"></span>${r(t||s.label)}</span>`}function Xi(e){return e==="law"?'<span class="badge badge-info">\u6CD5\u898F</span>':e==="order"?'<span class="badge badge-neutral">\u547D\u4EE4</span>':e?`<span class="badge badge-neutral">${r(e)}</span>`:'<span class="cell-empty">\u2014</span>'}function Ys(e,t){let s=String(e??"");return s.length>t?`${s.slice(0,t)}\u2026`:s}function Xs(e,t="text"){if(e==null||e==="")return'<span class="cell-empty">\u2014</span>';switch(t){case"boolean":return e?'<span class="badge badge-ok">\u662F</span>':'<span class="badge badge-neutral">\u5426</span>';case"status":return He(String(e));case"source":return Xi(String(e));case"number":return`<span class="mono">${u(e)}</span>`;case"duration":return`<span class="mono">${fe(e)}</span>`;case"datetime":return`<span class="mono">${je(e)}</span>`;case"date":return`<span class="mono">${Lt(e)}</span>`;case"url":{let s=String(e),a=Ys(s.replace(/^https?:\/\//,""),46);return`<span class="cell-url"><a href="${r(s)}" target="_blank" rel="noopener noreferrer" title="${r(s)}">${m("external",10)}${r(a)}</a></span>`}case"mono":{let s=String(e);return`<span class="cell-mono cell-truncate" title="${r(s)}">${r(Ys(s,54))}</span>`}case"longtext":{let s=String(e);return`<span class="cell-truncate" title="${r(s)}">${r(Ys(s,100))}</span>`}default:{let s=String(e);return`<span class="cell-truncate" title="${r(s)}">${r(Ys(s,90))}</span>`}}}function Ne({tone:e="info",title:t,text:s,iconName:a="info"}){let n=e==="ok"?"check":e==="danger"||e==="warn"?"alert":"i";return`<div class="notice notice-${e}" role="status">
    <span class="notice-icon" aria-hidden="true">${n==="i"?"i":m(n,12)}</span>
    <div class="notice-body">
      ${t?`<strong>${r(t)}</strong>`:""}
      ${s?`<p>${s}</p>`:""}
    </div>
  </div>`}function rt({iconName:e="search",title:t,text:s="",actions:a="",className:n=""}){return`<div class="empty-state ${n}">
    <span class="empty-icon">${m(e,24)}</span>
    <h3 class="empty-title">${r(t)}</h3>
    ${s?`<p class="empty-text">${s}</p>`:""}
    ${a?`<div class="empty-actions">${a}</div>`:""}
  </div>`}function ke(e,t,s="\u8655\u7406\u4E2D\u2026"){e&&(t?(e.dataset.idleHtml||(e.dataset.idleHtml=e.innerHTML),e.disabled=!0,e.classList.add("is-loading"),e.innerHTML=`<span class="spinner" aria-hidden="true"></span><span>${r(s)}</span>`):(e.disabled=!1,e.classList.remove("is-loading"),e.dataset.idleHtml&&(e.innerHTML=e.dataset.idleHtml,delete e.dataset.idleHtml)))}function M(e,t="info",s=4200){let a=document.getElementById("toast-region");if(!a)return null;let n={info:"i",ok:"\u2713",warn:"!",danger:"\xD7"},i=document.createElement("div");i.className=`toast toast-${t}`,i.setAttribute("role",t==="danger"?"alert":"status"),i.innerHTML=`<span class="toast-mark" aria-hidden="true">${n[t]||"i"}</span>
    <div class="toast-body">${r(e)}</div>
    <button class="toast-close" type="button" aria-label="\u95DC\u9589\u901A\u77E5">\xD7</button>`;let o=()=>{i.isConnected&&(i.classList.add("is-leaving"),window.setTimeout(()=>i.remove(),190))};return i.querySelector(".toast-close").addEventListener("click",o),a.appendChild(i),s>0&&window.setTimeout(o,s),i}async function ms(e){try{return await navigator.clipboard.writeText(e),!0}catch{let s=document.createElement("textarea");s.value=e,s.setAttribute("readonly",""),s.style.position="fixed",s.style.opacity="0",document.body.appendChild(s),s.select();let a=!1;try{a=document.execCommand("copy")}catch{a=!1}return s.remove(),a}}function Nt(e,t,s="text/plain;charset=utf-8"){let a=new Blob([t],{type:s}),n=URL.createObjectURL(a),i=document.createElement("a");i.href=n,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(n),1e3)}var Zs="judgment.fontSizes.v1",Ya="judgment.appearance",Xn=new Set(["light","dark","system"]),Jn="light",Ts=window.matchMedia("(prefers-color-scheme: dark)"),Zi="font-size",Es=[{id:"page-title",label:"\u9801\u9762\u6A19\u984C",hint:"\u5404\u9801\u6700\u4E0A\u65B9\u7684 h1 \u6A19\u984C",selectors:[".page-title"],defaultPx:40,min:20,max:72},{id:"home-title",label:"\u9996\u9801\u4E3B\u8996\u89BA\u6A19\u984C",hint:"\u9996\u9801\u6700\u5927\u7684\u4E3B\u6A19\u984C",selectors:[".home-title"],defaultPx:88,min:40,max:140},{id:"section-title",label:"\u5340\u584A\u6A19\u984C",hint:"\u5831\u8868\u3001\u5361\u7247\u8207\u5340\u584A\u6A19\u984C",selectors:[".section-title",".report-title",".side-card-title",".filter-title",".tests-card-title",".status-sidebar-title",".judgment-dialog-head h2"],defaultPx:16,min:10,max:36},{id:"body",label:"\u5167\u6587\u8207\u8AAA\u660E",hint:"\u6BB5\u843D\u3001\u56DE\u7B54\u3001\u8AAA\u660E\u8207\u6458\u8981\u6587\u5B57",selectors:[".answer-text",".page-subtitle",".report-sub",".home-lead",".empty-text",".notice-body p",".citation-snippet",".side-card-body",".detail-list",".field-help",".report-empty-inline",".processing-section-sub",".summary-value-text",".status-summary",".warnings",".law-dialog-warning"],defaultPx:14,min:8,max:28},{id:"table",label:"\u8868\u683C\u5167\u5BB9",hint:"\u8CC7\u6599\u8868\u683C\u7684\u8868\u982D\u8207\u5132\u5B58\u683C",selectors:[".data-table th",".data-table td"],defaultPx:12,min:8,max:24},{id:"meta",label:"\u6A19\u7C64\u8207\u8F14\u52A9\u6587\u5B57",hint:"badge\u3001chip\u3001\u6B04\u4F4D\u6A19\u7C64\u8207 metadata",selectors:[".badge",".chip",".citation-meta",".citation-index",".answer-section-label",".report-kicker",".report-section-title",".eyebrow",".field-label",".summary-label",".metric-label",".footer-bottom",".nav-update-badge"],defaultPx:10,min:7,max:20},{id:"button",label:"\u6309\u9215\u8207\u5C0E\u89BD",hint:"\u64CD\u4F5C\u6309\u9215\u3001\u9801\u9996\u5C0E\u89BD\u8207\u9023\u7D50",selectors:[".btn",".nav-link",".page-btn",".law-link",".judgment-link",".theme-option-name",".theme-option-desc"],defaultPx:13,min:9,max:24},{id:"form",label:"\u8868\u55AE\u8207\u8F38\u5165",hint:"\u8F38\u5165\u6846\u3001\u4E0B\u62C9\u9078\u55AE\u8207 textarea",selectors:["input","textarea","select",".input",".field-input"],defaultPx:14,min:9,max:28},{id:"mono",label:"\u7A0B\u5F0F\u78BC\u8207\u6578\u503C",hint:"\u7B49\u5BEC\u6587\u5B57\u3001\u67E5\u8A62\u8A9E\u53E5\u8207\u7D71\u8A08\u6578\u503C",selectors:[".mono",".cell-mono",".cell-number",".query-code","code",".metric-value",".summary-value",".perf-stat-value",".mini-stat-value"],defaultPx:13,min:8,max:30},{id:"law-page",label:"\u6CD5\u898F\u689D\u6587\uFF08\u9801\u9762\uFF09",hint:"\u6CD5\u898F\u6AA2\u7D22\u7D50\u679C\u8207\u6CD5\u898F\u4F86\u6E90\u5361\u689D\u6587",selectors:[".law-answer-article-text",".law-answer-article-no",".law-source-article-text",".law-source-article-no",".law-article-text",".law-article-no"],excludeAncestors:[".law-dialog"],defaultPx:12,min:9,max:28},{id:"law-dialog",label:"\u6CD5\u898F\u689D\u6587\uFF08\u5F48\u51FA\u8996\u7A97\uFF09",hint:"\u6309\u4E0B\u689D\u6587\u5F8C\u958B\u555F\u7684\u6CD5\u898F dialog",selectors:[".law-dialog .law-article-text",".law-dialog .law-article-no",".law-dialog .law-chapter"],defaultPx:16,min:10,max:32},{id:"judgment-dialog",label:"\u5224\u6C7A\u5168\u6587\uFF08\u5F48\u51FA\u8996\u7A97\uFF09",hint:"\u5224\u6C7A\u539F\u6587 dialog \u7684\u5168\u6587\u5340\u584A",selectors:[".judgment-dialog-text"],defaultPx:23,min:12,max:48}],bs=new Map(Es.map(e=>[e.id,e])),Ns=new WeakMap,Ot=sr(),pt={...Ot},Dt=er(),Ja=new Set,fs=null,gs=null,ct=null,os=null,Vn=null,Yt=Zi,Xt=!1,Va=null,Wa=!1,ea="";function Zn(e,t,s){return Math.min(s,Math.max(t,e))}function Xa(e){return Math.round(e*10)/10}function sa(e){return Number.isInteger(e)?String(e):e.toFixed(1)}function er(){try{let e=window.localStorage.getItem(Ya);return Xn.has(e)?e:Jn}catch{return Jn}}function eo(){return Dt==="system"?Ts.matches?"dark":"light":Dt}function tr(){document.querySelectorAll("[data-appearance-option]").forEach(e=>{let t=e.dataset.appearanceOption===Dt;e.classList.toggle("is-active",t),e.setAttribute("aria-pressed",t?"true":"false")})}function ta({persist:e=!1}={}){if(document.documentElement.dataset.appearance=eo(),document.documentElement.dataset.appearanceMode=Dt,tr(),e)try{window.localStorage.setItem(Ya,Dt)}catch{}}function to(e){Xn.has(e)&&(Dt=e,ta({persist:!0}))}function Wn(){Dt==="system"&&ta()}typeof Ts.addEventListener=="function"?Ts.addEventListener("change",Wn):typeof Ts.addListener=="function"&&Ts.addListener(Wn);function sr(){let e=null;try{e=JSON.parse(window.localStorage.getItem(Zs)||"null")}catch{e=null}if(!e||typeof e!="object"||Array.isArray(e))return{};let t={};for(let s of Es){let a=Number(e[s.id]);Number.isFinite(a)&&(t[s.id]=Xa(Zn(a,s.min,s.max)))}return t}function so(){try{return Object.keys(Ot).length?window.localStorage.setItem(Zs,JSON.stringify(Ot)):window.localStorage.removeItem(Zs),!0}catch{return!1}}function Rs(e){let t=new Set;for(let s of e.selectors)document.querySelectorAll(s).forEach(a=>{a.closest(".settings-sidebar")||Array.isArray(e.excludeAncestors)&&e.excludeAncestors.some(n=>a.closest(n))||t.add(a)});return Array.from(t)}function ar(){if(!ea)return;let e=bs.get(ea);if(e)for(let t of Rs(e))t.classList.add("font-size-highlight")}function nr(e){if(vs(),!bs.get(e))return;ea=e;let s=ct.querySelector(`.font-size-row[data-font-group="${e}"]`);s&&s.classList.add("is-previewing"),ar()}function vs(){ea="",ct.querySelectorAll(".font-size-row.is-previewing").forEach(e=>e.classList.remove("is-previewing")),document.querySelectorAll(".font-size-highlight").forEach(e=>e.classList.remove("font-size-highlight"))}function ao(e){if(Ns.has(e))return Ns.get(e);let t={inline:e.style.fontSize||"",computed:parseFloat(window.getComputedStyle(e).fontSize)||0};return Ns.set(e,t),t}function no(e){let t=Ns.get(e);t&&(t.inline?e.style.fontSize=t.inline:e.style.removeProperty("font-size"))}function ro(e){let t=pt[e.id];if(Number.isFinite(t))for(let s of Rs(e))ao(s),s.style.fontSize=`${t}px`}function io(e){for(let t of Rs(e))no(t)}function Zt(){for(let e of Ja){let t=bs.get(e);t&&io(t)}Ja=new Set;for(let e of Es)Number.isFinite(pt[e.id])&&(ro(e),Ja.add(e.id));ar()}function rr(){Zt(),Xt&&Yt==="font-size"&&Cs()}function ir(){Wa||(Wa=!0,window.requestAnimationFrame(()=>{Wa=!1,Zt()}))}function oo(){Va||!document.body||(Va=new MutationObserver(e=>{if(Object.keys(pt).length){for(let t of e)if(t.type==="childList"&&(t.addedNodes.length||t.removedNodes.length)){ir();return}}}),Va.observe(document.body,{childList:!0,subtree:!0}))}function lo(e){let t=e.filter(s=>typeof s.getClientRects=="function"&&s.getClientRects().length);return t.length?t:e}function co(){let e=Es.filter(t=>Rs(t).length>0||Number.isFinite(pt[t.id]));return e.length?e:Es}function aa(e){let t=pt[e.id];if(Number.isFinite(t))return t;let a=lo(Rs(e)).map(o=>{let l=Ns.get(o);return l&&l.computed?l.computed:parseFloat(window.getComputedStyle(o).fontSize)||0}).filter(o=>o>0).sort((o,l)=>o-l);if(!a.length)return e.defaultPx;let n=Math.floor(a.length/2),i=a.length%2?a[n]:(a[n-1]+a[n])/2;return Xa(i)}function uo(){let e=[{id:"font-size",label:"\u5B57\u578B\u5927\u5C0F",hint:"\u8ABF\u6574\u5404\u6587\u5B57\u5340\u584A",glyph:'<span class="settings-option-aa" aria-hidden="true">Aa</span>'},{id:"theme",label:"\u4ECB\u9762\u98A8\u683C",hint:"\u5207\u63DB\u54C1\u724C\u8996\u89BA\u8A9E\u8A00",glyph:m("palette",15)}];os.innerHTML=e.map(t=>`<button class="settings-option${Yt===t.id?" is-active":""}" type="button" role="tab"
        data-settings-panel="${t.id}"
        aria-selected="${Yt===t.id?"true":"false"}">
        <span class="settings-option-icon">${t.glyph}</span>
        <span class="settings-option-copy">
          <strong>${r(t.label)}</strong>
          <small>${r(t.hint)}</small>
        </span>
        ${m("chevronRight",12,"settings-option-chevron")}
      </button>`).join("")}function Cs(){vs();let e=co(),t=e.map(s=>{let a=sa(aa(s));return`<section class="font-size-row" data-font-group="${s.id}">
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
    </section>`}).join("");ct.innerHTML=`<div class="settings-panel-head">
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
    </div>`}function po(){vs();let e=Ua(),t=Ks.map((n,i)=>{let o=n.swatches.map(l=>`<i style="--swatch:${r(l)}"></i>`).join("");return`<button class="theme-option${n.id===e?" is-active":""}" type="button" role="menuitemradio"
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
          aria-pressed="${Dt===n.id?"true":"false"}"
          title="${n.id==="system"?"\u8DDF\u96A8\u7CFB\u7D71\u660E\u6697":`${n.label}\u8272\u6A21\u5F0F`}">${n.label}</button>`).join("")}
  </div>`;ct.innerHTML=`<div class="settings-panel-head">
      <div>
        <h3>\u4ECB\u9762\u98A8\u683C</h3>
        <p>\u9078\u64C7\u4E3B\u63A7\u53F0\u7684\u54C1\u724C\u8996\u89BA\u8A9E\u8A00\uFF1B\u4E3B\u984C\u6703\u7ACB\u5373\u5957\u7528\u4E26\u4FDD\u7559\u3002</p>
      </div>
      <div class="settings-panel-head-actions">
        <span class="badge badge-info">${Ks.length} \u7A2E</span>
        ${a}
      </div>
    </div>
    <div class="settings-theme-list" role="menu" aria-label="\u4ECB\u9762\u98A8\u683C">${t}</div>`,tr()}function mo(){os.querySelectorAll("[data-settings-panel]").forEach(e=>{let t=e.dataset.settingsPanel===Yt;e.classList.toggle("is-active",t),e.setAttribute("aria-selected",t?"true":"false")})}function Za(e=Yt){Yt=e==="theme"?"theme":"font-size",mo(),Yt==="theme"?po():Cs()}function Kn(e,t,s){let a=Number(t);if(!Number.isFinite(a))return;let n=Xa(Zn(a,e.min,e.max));pt[e.id]=n;let i=s?.querySelector(".font-size-slider");i&&(i.value=String(n));let o=s?.querySelector(".font-size-preview");o&&(o.style.fontSize=`${n}px`),ir()}function go(){ct.querySelectorAll(".font-size-row").forEach(e=>{let t=bs.get(e.dataset.fontGroup);if(!t)return;let s=pt[t.id]??aa(t),a=e.querySelector(".font-size-number-input");a&&(a.value=sa(s));let n=e.querySelector(".font-size-slider");n&&(n.value=String(s));let i=e.querySelector(".font-size-preview");i&&(i.style.fontSize=`${s}px`)})}function Yn(e){let t=e.target.closest(".font-size-row");if(!t)return;let s=bs.get(t.dataset.fontGroup);if(!s)return;let a=e.target.classList.contains("font-size-number-input");if(!(a&&e.target.value==="")){if(e.type==="input"&&a){let n=Number(e.target.value);if(!Number.isFinite(n))return;Kn(s,n,t);return}if(Kn(s,e.target.value,t),e.type==="input"){let n=t.querySelector(".font-size-number-input");n&&document.activeElement!==n&&(n.value=sa(pt[s.id]??aa(s)))}}}function fo(e){if(!e.target.classList.contains("font-size-number-input"))return;let t=e.target.closest(".font-size-row"),s=t?bs.get(t.dataset.fontGroup):null;if(!s)return;let a=pt[s.id]??aa(s);e.target.value=sa(a)}function bo(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||nr(t.dataset.fontGroup)}function vo(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||vs()}function ho(e){let t=e.target.closest(".font-size-row");t&&nr(t.dataset.fontGroup)}function $o(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||vs()}function yo(e){let t=e.target.closest("[data-settings-panel]");if(t){Za(t.dataset.settingsPanel);return}let s=e.target.closest("[data-settings-action]");if(s){let i=s.dataset.settingsAction;if(i==="save"){Ot={...pt};let o=so();go(),M(o?"\u5B57\u578B\u5927\u5C0F\u5DF2\u5132\u5B58\u3002":"\u5B57\u578B\u5927\u5C0F\u5DF2\u5957\u7528\uFF0C\u4F46\u700F\u89BD\u5668\u7121\u6CD5\u5132\u5B58\u8A2D\u5B9A\u3002",o?"ok":"warn");return}if(i==="cancel"){pt={...Ot},Zt(),Cs(),M("\u5DF2\u53D6\u6D88\u672A\u5132\u5B58\u7684\u5B57\u578B\u8B8A\u66F4\u3002","info");return}i==="reset"&&(pt={},Zt(),Cs(),M("\u5DF2\u56DE\u5FA9\u9810\u8A2D\u5B57\u578B\uFF1B\u6309\u300C\u5132\u5B58\u300D\u4FDD\u7559\u8B8A\u66F4\u3002","info"));return}let a=e.target.closest("[data-appearance-option]");if(a){to(a.dataset.appearanceOption);return}let n=e.target.closest(".theme-option");n&&Qa(n.dataset.themeId)}function wo(){Xt||(Xt=!0,pt={...Ot},document.body.classList.add("settings-open"),fs.removeAttribute("inert"),fs.setAttribute("aria-hidden","false"),gs.setAttribute("aria-expanded","true"),Za(Yt),Zt(),window.requestAnimationFrame(()=>{let e=os.querySelector(".settings-option.is-active")||os.querySelector(".settings-option");e&&e.focus({preventScroll:!0})}))}function Ka({restoreFocus:e=!0}={}){Xt&&(Xt=!1,vs(),pt={...Ot},Zt(),document.body.classList.remove("settings-open"),e&&gs.focus({preventScroll:!0}),fs.setAttribute("aria-hidden","true"),fs.setAttribute("inert",""),gs.setAttribute("aria-expanded","false"))}function or(){fs=document.getElementById("settings-sidebar"),gs=document.getElementById("settings-trigger"),ct=document.getElementById("settings-panel"),os=document.getElementById("settings-options"),Vn=document.getElementById("settings-close"),!(!fs||!gs||!ct||!os)&&(ta(),Qa(Ua(),{persist:!1}),uo(),Cs(),oo(),Zt(),gs.addEventListener("click",()=>{Xt?Ka():wo()}),Vn?.addEventListener("click",()=>Ka()),os.addEventListener("click",e=>{let t=e.target.closest("[data-settings-panel]");t&&Za(t.dataset.settingsPanel)}),ct.addEventListener("click",yo),ct.addEventListener("input",Yn),ct.addEventListener("change",Yn),ct.addEventListener("blur",fo,!0),ct.addEventListener("pointerover",bo),ct.addEventListener("pointerout",vo),ct.addEventListener("focusin",ho),ct.addEventListener("focusout",$o),ct.addEventListener("keydown",e=>{e.key==="Enter"&&e.target.classList.contains("font-size-number-input")&&(e.preventDefault(),e.target.blur())}),document.addEventListener("keydown",e=>{e.key==="Escape"&&Xt&&Ka()}),window.addEventListener("storage",e=>{if(e.key===Ya){Dt=er(),ta();return}e.key===Zs&&(Ot=sr(),Xt||(pt={...Ot},Zt()))}))}var en={};Jt(en,{render:()=>So});function _o(e){let t=e&&typeof e=="object"?e:{},s=t.judgment_total,a=t.financial_total,n=Number(s),i=Number(a),o=s!=null&&Number.isFinite(n)&&n>=0,l=a!=null&&Number.isFinite(i)&&i>=0;return{total:o?n:null,financial:l?i:null,ratio:o&&l&&n>0?i/n*100:null}}function Et(e,{loading:t=!1}={}){let s=_o(e),a=t?"\u8B80\u53D6\u4E2D\u2026":u(s.total),n=t?"\u8B80\u53D6\u4E2D\u2026":u(s.financial),i=t?"\u8B80\u53D6\u4E2D\u2026":s.ratio===null?"\u2014":`${s.ratio.toFixed(1)}%`;return`<div class="processing-summary-card">
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
        ${Et(null,{loading:!0})}
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
  </section>`;let n=e.querySelector("#home-ask-form"),i=e.querySelector("#home-question"),o=()=>{let c=String(i?.value||"").trim().slice(0,500);if(!c){i?.focus();return}try{window.sessionStorage.setItem("judgment.pending_question",c)}catch{}window.__judgmentPendingQuestion=c,t&&typeof t.navigate=="function"?t.navigate("rag"):window.location.hash="#/rag"},l=()=>{i&&(i.style.height="auto",i.style.height=`${Math.min(i.scrollHeight,140)}px`)};i?.addEventListener("input",l),n?.addEventListener("submit",c=>{c.preventDefault(),o()}),i?.addEventListener("keydown",c=>{c.key==="Enter"&&!c.shiftKey&&!c.isComposing&&(c.preventDefault(),o())});let d=e.querySelector("#home-judgment-stats");Q.judgmentStats().then(c=>{!d||!d.isConnected||(d.innerHTML=Et(c))}).catch(()=>{!d||!d.isConnected||(d.innerHTML=Et(null))}),l(),i?.focus({preventScroll:!0})}var wn={};Jt(wn,{render:()=>dc});var xo="judgment-console";var ht="query_history",es="settings",ts="audit_events";var tt={history:[],settings:new Map,audit:[],nextId:1},na=null,st=!("indexedDB"in window);function Ct(e){return new Promise((t,s)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>s(e.error)})}function wt(e){return new Promise((t,s)=>{e.oncomplete=()=>t(),e.onerror=()=>s(e.error),e.onabort=()=>s(e.error||new Error("transaction aborted"))})}function kt(){return na||(na=new Promise((e,t)=>{if(!("indexedDB"in window)){st=!0,t(new Error("IndexedDB is unavailable"));return}let s;try{s=window.indexedDB.open(xo,2)}catch(a){st=!0,t(a);return}s.onupgradeneeded=()=>{let a=s.result;if(!a.objectStoreNames.contains(ht)){let n=a.createObjectStore(ht,{keyPath:"id",autoIncrement:!0});n.createIndex("created_at","created_at"),n.createIndex("kind","kind")}if(a.objectStoreNames.contains(es)||a.createObjectStore(es,{keyPath:"key"}),!a.objectStoreNames.contains(ts)){let n=a.createObjectStore(ts,{keyPath:"key"});n.createIndex("created_at","created_at"),n.createIndex("dataset","dataset"),n.createIndex("jid","jid"),n.createIndex("issue_month","issue_month")}},s.onsuccess=()=>{let a=s.result;a.onversionchange=()=>a.close(),e(a)},s.onerror=()=>{st=!0,t(s.error||new Error("Unable to open IndexedDB"))},s.onblocked=()=>{st=!0,t(new Error("IndexedDB upgrade blocked by another tab"))}}),na)}function cr(){return"indexedDB"in window}function dr(){return st}function ra(){return st?"memory":"indexeddb"}function qo(e){let t=e.created_at||new Date().toISOString();return{kind:e.kind||"query",title:String(e.title||""),detail:String(e.detail||""),payload:e.payload||{},turns:Array.isArray(e.turns)?e.turns:[],pinned:!!e.pinned,project_id:String(e.project_id||""),created_at:t,updated_at:e.updated_at||t}}async function Ao(){try{let t=(await kt()).transaction(ht,"readwrite"),s=t.objectStore(ht),a=await Ct(s.count());if(a>120){let n=a-120,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let d=i.result;if(!d||n<=0){o();return}d.delete(),n-=1,d.continue()},i.onerror=()=>l(i.error)})}await wt(t)}catch{st=!0}}async function Ps(e){let t=qo(e);try{let a=(await kt()).transaction(ht,"readwrite"),n=a.objectStore(ht),i=await Ct(n.add(t));return await wt(a),await Ao(),i}catch{st=!0;let a=tt.nextId++;return tt.history.push({id:a,...t}),tt.history.length>120&&tt.history.shift(),a}}async function Is(e,t={}){let s=Number(e);if(!Number.isFinite(s))return null;try{let n=(await kt()).transaction(ht,"readwrite"),i=n.objectStore(ht),o=await Ct(i.get(s));if(!o)return await wt(n),null;let l={...o,...t,id:s};return await Ct(i.put(l)),await wt(n),l}catch{st=!0;let n=tt.history.findIndex(i=>Number(i.id)===s);return n===-1?null:(tt.history[n]={...tt.history[n],...t,id:s},tt.history[n])}}async function ur(e){let t=Number(e);if(!Number.isFinite(t))return!1;try{let a=(await kt()).transaction(ht,"readwrite");return a.objectStore(ht).delete(t),await wt(a),!0}catch{st=!0;let a=tt.history.findIndex(n=>Number(n.id)===t);return a===-1?!1:(tt.history.splice(a,1),!0)}}async function ia({keyword:e="",limit:t=50}={}){let s=e.trim().toLowerCase();try{let n=(await kt()).transaction(ht,"readonly"),i=n.objectStore(ht),o=await Ct(i.getAll());return await wt(n),o.filter(l=>s?`${l.kind} ${l.title} ${l.detail}`.toLowerCase().includes(s):!0).sort((l,d)=>String(d.updated_at||d.created_at).localeCompare(String(l.updated_at||l.created_at))).slice(0,t)}catch{return st=!0,tt.history.filter(n=>s?`${n.kind} ${n.title} ${n.detail}`.toLowerCase().includes(s):!0).slice().sort((n,i)=>String(i.updated_at||i.created_at).localeCompare(String(n.updated_at||n.created_at))).slice(0,t)}}async function pr(){try{let t=(await kt()).transaction(ht,"readwrite");t.objectStore(ht).clear(),await wt(t)}catch{st=!0}tt.history=[]}function Mo(e){let t=Number(e.id??e.event_id??0)||0,s=String(e.dataset||e.kind||"judgment"),a=String(e.key||`${s}:${t||`${Date.now()}:${Math.random().toString(36).slice(2)}`}`),n=String(e.jid||""),i=String(e.issue_month||""),o=String(e.change_type||""),l=String(e.detected_at||e.created_at||new Date().toISOString());return{key:a,event_id:t,dataset:s,jid:n,issue_month:i,change_type:o,title:String(e.title||n||i||"\u7248\u672C\u8B8A\u66F4"),detail:String(e.detail||[o,i,n].filter(Boolean).join(" \xB7 ")),created_at:l,payload:e}}async function jo(){try{let t=(await kt()).transaction(ts,"readwrite"),s=t.objectStore(ts),a=await Ct(s.count());if(a>2e3){let n=a-2e3,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let d=i.result;if(!d||n<=0){o();return}d.delete(),n-=1,d.continue()},i.onerror=()=>l(i.error)})}await wt(t)}catch{st=!0}}async function mr(e){let t=(Array.isArray(e)?e:[]).filter(s=>s&&typeof s=="object").map(Mo);if(!t.length)return 0;try{let a=(await kt()).transaction(ts,"readwrite"),n=a.objectStore(ts);for(let i of t)await Ct(n.put(i));return await wt(a),await jo(),t.length}catch{st=!0;let a=new Map(tt.audit.map(n=>[n.key,n]));for(let n of t)a.set(n.key,n);return tt.audit=Array.from(a.values()).sort((n,i)=>String(i.created_at).localeCompare(String(n.created_at))).slice(0,2e3),t.length}}async function gr({keyword:e="",limit:t=200}={}){let s=e.trim().toLowerCase(),a=n=>s?`${n.dataset} ${n.jid} ${n.issue_month} ${n.change_type} ${n.detail}`.toLowerCase().includes(s):!0;try{let i=(await kt()).transaction(ts,"readonly"),o=i.objectStore(ts),l=await Ct(o.getAll());return await wt(i),l.filter(a).sort((d,c)=>String(c.created_at).localeCompare(String(d.created_at))).slice(0,t)}catch{return st=!0,tt.audit.filter(a).slice().sort((i,o)=>String(o.created_at).localeCompare(String(i.created_at))).slice(0,t)}}async function Bs(e,t){let s={key:String(e),value:t,updated_at:new Date().toISOString()};try{let n=(await kt()).transaction(es,"readwrite");return n.objectStore(es).put(s),await wt(n),s}catch{return st=!0,tt.settings.set(s.key,s),s}}async function ss(e,t=null){try{let a=(await kt()).transaction(es,"readonly"),n=a.objectStore(es),i=await Ct(n.get(String(e)));return await wt(a),i?i.value:t}catch{st=!0;let a=tt.settings.get(String(e));return a?a.value:t}}async function fr({keyword:e=""}={}){let t=e.trim().toLowerCase();try{let a=(await kt()).transaction(es,"readonly"),n=a.objectStore(es),i=await Ct(n.getAll());return await wt(a),i.filter(o=>t?`${o.key} ${JSON.stringify(o.value)}`.toLowerCase().includes(t):!0).sort((o,l)=>String(o.key).localeCompare(String(l.key)))}catch{return st=!0,Array.from(tt.settings.values()).filter(a=>t?`${a.key} ${JSON.stringify(a.value)}`.toLowerCase().includes(t):!0)}}function br(e){if(typeof e=="string")return e;try{return JSON.stringify(e)}catch{return String(e)}}var hn={};Jt(hn,{buildFlowWaterfallStages:()=>ya,render:()=>Hl,renderRagPipelineWaterfall:()=>$a,renderTestFlowPanel:()=>ws,renderWaterfallStages:()=>ys});var Lo={running:["\u57F7\u884C\u4E2D","badge-info"],stopping:["\u505C\u6B62\u4E2D","badge-warn"],success:["\u5B8C\u6210","badge-ok"],interrupted:["\u5DF2\u4E2D\u6B62","badge-warn"],failed:["\u5931\u6557","badge-danger"],pending:["\u7B49\u5F85","badge-neutral"],skipped:["\u7565\u904E","badge-neutral"]},To=new Set(["running","stopping"]);function ca(e){let[t,s]=Lo[e]||[e||"\u672A\u77E5","badge-neutral"];return`<span class="badge ${s}">${r(t)}</span>`}function oa(e){return String(e).padStart(2,"0")}function hs(e=new Date){let t=e instanceof Date?e:new Date(e);return`RAG Benchmark ${t.getFullYear()}-${oa(t.getMonth()+1)}-${oa(t.getDate())} ${oa(t.getHours())}:${oa(t.getMinutes())}`}function la(e){return To.has(e)}function Ft(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?s.toFixed(3):t}function ls(e){if(e==null)return"\u2014";let t=Number(e);return Number.isFinite(t)?`${(t*100).toFixed(1)}%`:"\u2014"}function as(e,t,s=""){return`<div class="bench-metric">
    <span class="summary-label">${r(e)}</span>
    <strong>${r(String(t))}</strong>
    ${s?`<small>${r(s)}</small>`:""}
  </div>`}function vr(e={}){let t=e.score_components||e,s=e.gate||{},a=String(s.status||""),n=a==="pass"?"Gate \u901A\u904E":a==="fail"?"Gate \u5931\u6557":a==="no_data"?"Gate \u7121\u8CC7\u6599":"";return`${n?`<span class="badge ${a==="pass"?"badge-ok":a==="fail"?"badge-danger":"badge-neutral"}">${r(n)}</span>`:""}<div class="bench-metrics">
    ${as("Law Recall",ls(t.law_recall))}
    ${as("Article Recall",ls(t.article_recall))}
    ${as("Citation Valid",ls(t.citation_valid_rate))}
    ${as("Judge",Ft(t.judge_overall))}
    ${as("Human",Ft(t.human_overall))}
    ${as("p50",fe(e.duration_p50_ms))}
    ${as("p95",fe(e.duration_p95_ms))}
    ${as("Success",`${u(e.success||0)} / ${u(e.total||0)}`)}
  </div>`}function hr(e={}){let t=Object.entries(e.stages||{}).filter(([s])=>s.startsWith("rag.")).slice(0,8);return t.length?`<div class="bench-stage-grid">${t.map(([s,a])=>`<div class="bench-stage">
      <span>${r(s.replace(/^rag\./,""))}</span>
      <strong>${fe(a.p50_ms)}</strong>
      <small>p95 ${fe(a.p95_ms)}</small>
    </div>`).join("")}</div>`:""}function $r(e){let t=e.summary||{},s=t.score_components||{};return`<span>Law ${ls(s.law_recall)}</span>
    <span>Article ${ls(s.article_recall)}</span>
    <span>Judge ${Ft(s.judge_overall)}</span>
    <span>p95 ${fe(t.duration_p95_ms)}</span>`}function yr(e){let t=e.summary||{},s=t.score_components||{};return JSON.stringify([s.law_recall,s.article_recall,s.judge_overall,t.duration_p95_ms])}function wr(e,t){let s=e.config||{};return`<button class="bench-run ${t?"is-active":""}" type="button" data-bench-action="open-run" data-run-id="${r(e.run_id)}">
    <span class="bench-run-head">
      <strong data-bench-slot="run-label">${r(e.label||"RAG Benchmark")}</strong>
      <span data-bench-slot="run-status" data-status="${r(e.status||"")}">${ca(e.status)}</span>
      <span class="mono">${r(e.run_id.slice(0,10))}</span>
    </span>
    <span class="bench-run-meta">
      <span>${r(je(e.started_at))}</span>
      <span data-bench-slot="run-completed">${u(e.completed_cases||0)} / ${u(e.total_cases||0)} \u984C</span>
      <span>${r(s.llm_model||"\u2014")}</span>
      <span>v${e.suite_version||1}</span>
    </span>
    <span class="bench-run-scores" data-bench-slot="run-scores" data-signature="${r(yr(e))}">${$r(e)}</span>
  </button>`}function sn(e,t=[]){let s=e.metrics||{},a=e.judge||{},n=e.human_review||{},i=s.scores||{},o=e.stage_ms||{},l=Object.entries(o).filter(([c])=>c.startsWith("rag.")).map(([c,v])=>`<span class="chip">${r(c)} ${fe(v)}</span>`).join(""),d=(e.law_sources||[]).map(c=>`<span class="chip">${r(c.law_name||"\u6CD5\u898F")} ${u((c.articles||[]).length)} \u689D</span>`).join("");return`<summary>
      <span class="bench-case-question">${r(e.question)}</span>
      ${ca(e.status)}
      <span class="bench-case-time">${fe(e.duration_ms)}</span>
      <span class="bench-case-score">Det ${Ft(i.deterministic)} \xB7 Judge ${Ft(i.judge)} \xB7 Human ${Ft(i.human)}</span>
    </summary>
    <div class="bench-case-body">
      <div class="bench-case-meta">
        <span class="mono">fingerprint ${r((e.fingerprint||"").slice(0,20))}</span>
        <span>item #${e.item_id} \xB7 v${e.item_version}</span>
        <button class="btn btn-ghost btn-sm" type="button" data-bench-action="fingerprint-history" data-fingerprint="${r(e.fingerprint||"")}">${m("history",13)}<span>\u540C\u984C\u6B77\u53F2</span></button>
      </div>
      <div class="bench-case-stages">${l||'<span class="qb-muted">\u6C92\u6709 stage timing</span>'}</div>
      <div class="bench-case-metrics">
        <span>Law recall ${ls(s.law_recall)}</span>
        <span>Article recall ${ls(s.article_recall)}</span>
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
      ${t.length?`<div class="bench-history"><strong>\u540C\u984C\u6B77\u53F2 \xB7 ${t.length} \u7B46</strong>${t.map(c=>`<div class="bench-history-row"><span>${r(je(c.run?.started_at))}</span><span>${r(c.run?.config?.llm_model||"\u2014")}</span><span>Det ${Ft(c.metrics?.scores?.deterministic)}</span><span>Judge ${Ft(c.metrics?.scores?.judge)}</span><span>Human ${Ft(c.metrics?.scores?.human)}</span><span>${fe(c.duration_ms)}</span></div>`).join("")}</div>`:""}
    </div>`}function tn(e,t=[]){return JSON.stringify([e.status,e.duration_ms,e.answer,e.metrics,e.judge,e.human_review,e.stage_ms,e.law_sources,t.map(s=>[s.id,s.duration_ms,s.metrics?.scores?.human,s.finished_at])])}function _r(e,t=[]){return`<details class="bench-case" data-result-id="${e.id}">
    ${sn(e,t)}
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
    <div class="bench-cases" data-bench-cases>${s.length?s.map(a=>_r(a,t[a.fingerprint]||[])).join(""):Ne({tone:"info",title:"\u5C1A\u7121\u984C\u76EE\u7D50\u679C",text:"Benchmark \u57F7\u884C\u5F8C\u6703\u5728\u9019\u88E1\u986F\u793A\u9010\u984C\u7D50\u679C\u3002"})}</div>
  </section>`}function Sr(e){return`<button class="btn btn-primary" type="submit" ${e?"disabled":""}>${m("play",14)}<span>${e?"Benchmark \u57F7\u884C\u4E2D":"\u57F7\u884C Benchmark"}</span></button>
    ${e?`<button class="btn btn-secondary" type="button" data-bench-action="stop" data-run-id="${r(e.run_id)}">${m("x",14)}<span>\u505C\u6B62</span></button>`:""}`}function xr(e,t=[]){let s=Math.max(0,Number(e.total_cases)||0),a=Math.max(0,Math.min(s,Number(e.completed_cases)||0)),n=Date.now(),i=Date.parse(e.started_at||""),o=Number.isFinite(i)?Math.max(0,n-i):0,l=(t||[]).filter(p=>["success","failed"].includes(p.status)).map(p=>Number(p.duration_ms)||0).filter(p=>p>0),d=null;if(l.length)d=l.reduce((p,y)=>p+y,0)/l.length;else if(a>0){let p=Date.parse(e.updated_at||""),y=Number.isFinite(p)?p:i;Number.isFinite(y)&&y>i?d=(y-i)/a:o>0&&(d=o/a)}let c=(t||[]).find(p=>p.status==="running")||null,v=0;if(a<s&&d&&d>0){let p=c?Date.parse(c.started_at||""):NaN,y=Date.parse(e.updated_at||""),S=Number.isFinite(p)?p:y;Number.isFinite(S)&&(v=Math.max(0,Math.min(.95,(n-S)/d)))}let $=Math.min(s,a+v),h=s>0?Math.max(0,Math.min(100,$/s*100)):0,f=d===null?null:Math.max(0,s-$)*d;return{total:s,completed:a,elapsedMs:o,averageMs:d,progress:h,etaMs:f,ratePerMin:d?6e4/d:null,running:c}}function qr(e){return e===null?"\u9810\u4F30\u5269\u9918\uFF1A\u8A08\u7B97\u4E2D\u2026":e<1e3?"\u9810\u4F30\u5269\u9918\uFF1A\u5373\u5C07\u5B8C\u6210":`\u9810\u4F30\u5269\u9918 ${fe(e)}`}function Ar(e,t=[]){let s=xr(e,t),a=e.status==="stopping";return`<div class="bench-progress" data-bench-live data-run-id="${r(e.run_id)}">
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
      <span data-bench-slot="progress-elapsed">\u5DF2\u57F7\u884C ${fe(s.elapsedMs)}</span>
      <span data-bench-slot="progress-average">${s.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${fe(s.averageMs)}\uFF0F\u984C`}</span>
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
      <label class="field"><span class="field-label">Run \u6A19\u7C64</span><input class="input" name="label" value="${r(e.config.label||hs())}" /></label>
      <div class="qb-actions" data-bench-actions data-signature="${r(a?`${a.run_id}:${a.status}`:"")}">
        ${Sr(a)}
      </div>
    </form>
    <div data-bench-live-wrap data-signature="${r(a?`${a.run_id}:${a.status}:${a.total_cases}`:"")}">${a?Ar(a,an(e,a)):""}</div>
    <div class="bench-runs-head"><span class="summary-label">\u6B77\u53F2 Run</span><span class="qb-muted">\u540C\u984C\u76EE\u4EE5 fingerprint \u5C0D\u9F4A\uFF0C\u53EF\u5C55\u958B\u9010\u984C\u6BD4\u8F03</span></div>
    <div class="bench-runs" data-bench-runs>${(e.runs||[]).length?e.runs.map(i=>wr(i,n?.run_id===i.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>'}</div>
    ${n?No(n,e.history):""}
  </section>`}function Os(e){let t=(e.runs||[]).find(s=>la(s.status));return t?e.selectedRun&&e.selectedRun.run_id===t.run_id?e.selectedRun.status&&!la(e.selectedRun.status)?null:{...t,...e.selectedRun,summary:e.selectedRun.summary||t.summary||{},cases:e.selectedRun.cases||[]}:t:null}function an(e,t){return!t||!e.selectedRun||e.selectedRun.run_id!==t.run_id?[]:e.selectedRun.cases||[]}function Mr(e,{onNavigate:t=null}={}){let s={models:null,suites:[],runs:[],selectedRun:null,selectedSuiteId:null,history:{},indexVersion:null,config:{label:hs(),embedding_model:"",llm_model:"",judge_model:"",top_k:4,score_threshold:.35,repeats:1,enable_law_retrieval:!0,judge_enabled:!0},labelTouched:!1,loaded:!1,referenceLoaded:!1,loading:!1,loadAgain:!1,pendingRefreshAll:!1,activeRunId:"",refreshStream:null,tickTimer:null,renderSignature:"",forcedCaseIds:new Set},a=()=>e.querySelector("#performance-panel-benchmark"),n=B=>{let k=new FormData(B);return{label:String(k.get("label")||"").trim()||hs(),embedding_model:String(k.get("embedding_model")||""),llm_model:String(k.get("llm_model")||""),judge_model:String(k.get("judge_model")||""),top_k:Number(k.get("top_k")||4),score_threshold:Number(k.get("score_threshold")||.35),repeats:Number(k.get("repeats")||1),enable_law_retrieval:B.elements.enable_law_retrieval?.checked??!0,judge_enabled:B.elements.judge_enabled?.checked??!0}},i=()=>JSON.stringify({selectedRunId:s.selectedRun?.run_id||"",references:s.referenceLoaded?[s.indexVersion?.physical_collection||"",(s.models?.models?.embedding||[]).join(","),(s.models?.models?.llm||[]).join(","),(s.suites||[]).map(B=>`${B.id}:${B.name}:${B.item_count}:${B.version}:${B.status}`)]:null,runs:(s.runs||[]).map(B=>`${B.run_id}:${B.label||""}:${B.suite_version||1}`)}),o=()=>{let k=a()?.querySelector("[data-bench-live]"),C=Os(s);if(!k||!C)return;let ne=xr(C,an(s,C)),me=(ae,Z)=>{let we=k.querySelector(`[data-bench-slot="${ae}"]`);we&&we.textContent!==Z&&(we.textContent=Z)};me("progress-count",`${u(ne.completed)} / ${u(ne.total)} \u984C`),me("progress-percent",`${ne.progress.toFixed(1)}%`),me("progress-eta",qr(ne.etaMs)),me("progress-rate",ne.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${ne.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`),me("progress-elapsed",`\u5DF2\u57F7\u884C ${fe(ne.elapsedMs)}`),me("progress-average",ne.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${fe(ne.averageMs)}\uFF0F\u984C`),me("progress-state",C.status==="stopping"?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D");let W=k.querySelector('[data-bench-slot="progress-bar"]');W&&(W.setAttribute("aria-valuenow",ne.progress.toFixed(1)),W.classList.toggle("is-waiting",ne.completed===0));let ee=k.querySelector('[data-bench-slot="progress-fill"]');ee&&(ee.style.width=`${ne.progress.toFixed(2)}%`)},l=B=>{let k=B.querySelector("[data-bench-actions]");if(!k)return;let C=Os(s),ne=C?`${C.run_id}:${C.status}`:"";k.dataset.signature!==ne&&(k.dataset.signature=ne,k.innerHTML=Sr(C))},d=B=>{let k=B.querySelector("[data-bench-live-wrap]");if(!k)return;let C=Os(s),ne=C?`${C.run_id}:${C.status}:${C.total_cases}`:"";k.dataset.signature!==ne&&(k.dataset.signature=ne,k.innerHTML=C?Ar(C,an(s,C)):"")},c=B=>{let k=B.querySelector("[data-bench-runs]");if(!k)return;let C=s.runs||[],ne=[...k.querySelectorAll("[data-run-id]")].map(W=>W.dataset.runId),me=C.map(W=>W.run_id);if(ne.join("|")!==me.join("|")){k.innerHTML=C.length?C.map(W=>wr(W,s.selectedRun?.run_id===W.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>';return}for(let W of C){let ee=k.querySelector(`[data-run-id="${W.run_id}"]`);if(!ee)continue;ee.classList.toggle("is-active",s.selectedRun?.run_id===W.run_id);let ae=ee.querySelector('[data-bench-slot="run-label"]');ae&&ae.textContent!==(W.label||"RAG Benchmark")&&(ae.textContent=W.label||"RAG Benchmark");let Z=ee.querySelector('[data-bench-slot="run-status"]');Z&&Z.dataset.status!==(W.status||"")&&(Z.dataset.status=W.status||"",Z.innerHTML=ca(W.status));let we=ee.querySelector('[data-bench-slot="run-completed"]');if(we){let qe=`${u(W.completed_cases||0)} / ${u(W.total_cases||0)} \u984C`;we.textContent!==qe&&(we.textContent=qe)}let z=ee.querySelector('[data-bench-slot="run-scores"]'),ve=yr(W);z&&z.dataset.signature!==ve&&(z.dataset.signature=ve,z.innerHTML=$r(W))}},v=B=>{let k=s.selectedRun;if(!k)return;let C=B.querySelector(`.bench-detail[data-run-id="${k.run_id}"]`);if(!C)return;let ne=C.querySelector("[data-bench-detail-actions]");if(ne){let z=`${k.status||""}:${k.run_id}`;ne.dataset.signature!==z&&(ne.dataset.signature=z,ne.innerHTML=kr(k))}let me=C.querySelector('[data-bench-detail="metrics"]');if(me){let z=JSON.stringify(k.summary||{});me.dataset.signature!==z&&(me.dataset.signature=z,me.innerHTML=vr(k.summary||{}))}let W=C.querySelector('[data-bench-detail="stages"]');if(W){let z=JSON.stringify((k.summary||{}).stages||{});W.dataset.signature!==z&&(W.dataset.signature=z,W.innerHTML=hr(k.summary||{}))}let ee=C.querySelector("[data-bench-cases]");if(!ee)return;let ae=k.cases||[];if(!ae.length)return;let Z=ee.querySelector(".notice");Z&&Z.remove();let we=new Map([...ee.querySelectorAll("details.bench-case")].map(z=>[Number(z.dataset.resultId),z]));for(let z of ae){let ve=s.history[z.fingerprint]||[],qe=tn(z,ve),ge=we.get(Number(z.id));if(!ge){ee.insertAdjacentHTML("beforeend",_r(z,ve)),ge=ee.lastElementChild,ge&&(ge._benchSignature=qe);continue}if(ge._benchSignature===qe||!s.forcedCaseIds.delete(Number(z.id))&&ge.contains(document.activeElement))continue;let Oe=ge.open;ge.innerHTML=sn(z,ve),ge.open=Oe,ge._benchSignature=qe}},$=()=>{Os(s)?s.tickTimer||(s.tickTimer=window.setInterval(o,1e3)):s.tickTimer&&(window.clearInterval(s.tickTimer),s.tickTimer=null)},h=()=>{let B=a();B&&(l(B),d(B),c(B),v(B),o(),$())},f=B=>{let k=s.selectedRun;if(!k)return;let C=B.querySelector('[data-bench-detail="metrics"]');C&&(C.dataset.signature=JSON.stringify(k.summary||{}));let ne=B.querySelector('[data-bench-detail="stages"]');ne&&(ne.dataset.signature=JSON.stringify((k.summary||{}).stages||{}));let me=B.querySelector("[data-bench-cases]");if(!me)return;let W=new Map((k.cases||[]).map(ee=>[Number(ee.id),ee]));for(let ee of me.querySelectorAll("details.bench-case")){let ae=W.get(Number(ee.dataset.resultId));ae&&(ee._benchSignature=tn(ae,s.history[ae.fingerprint]||[]))}},p=(B=!1)=>{let k=a();if(!k)return;let C=i();if(!B&&s.renderSignature===C){h();return}s.renderSignature=C,s.forcedCaseIds.clear(),k.innerHTML=Eo(s),f(k),h()},y=async({refreshAll:B=!1,runs:k=null}={})=>{if(s.loading){s.loadAgain=!0,s.pendingRefreshAll=s.pendingRefreshAll||B;return}s.loading=!0;try{if(!s.referenceLoaded||B){let[Z,we]=await Promise.all([Q.benchmarkModels(),Q.benchmarkSuites()]);s.models=Z,s.suites=we.suites||[],s.indexVersion=Z.index_version,s.referenceLoaded=!0,!s.selectedSuiteId&&s.suites.length&&(s.selectedSuiteId=s.suites[0].id),s.config.embedding_model||(s.config.embedding_model=Z.models?.embedding?.[0]||""),s.config.llm_model||(s.config.llm_model=Z.models?.llm?.[0]||""),s.config.judge_model||(s.config.judge_model=(Z.models?.llm||[]).find(z=>z!==s.config.llm_model)||"")}let C=k?{runs:k}:await Q.benchmarkRuns(30);s.runs=C.runs||[];let ne=s.activeRunId,me=s.runs.find(Z=>la(Z.status))||null;s.activeRunId=me?.run_id||"";let W=s.selectedRun?.run_id||"";W||(W=me?.run_id||s.runs[0]?.run_id||"");let ee=!!(s.selectedRun&&ne&&s.selectedRun.run_id===ne);W&&(!s.selectedRun||s.selectedRun.run_id!==W||W===me?.run_id||ee)?s.selectedRun=await Q.benchmarkRun(W,!0):W||(s.selectedRun=null),s.loaded=!0,p()}catch(C){if(!s.loaded){s.renderSignature="";let ne=a();ne&&(ne.innerHTML=Ne({tone:"danger",title:"Benchmark \u8CC7\u6599\u8B80\u53D6\u5931\u6557",text:r(C.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")}))}}finally{if(s.loading=!1,s.loadAgain){let C=s.pendingRefreshAll;s.loadAgain=!1,s.pendingRefreshAll=!1,y({refreshAll:C})}}},S=()=>{s.refreshStream||(s.refreshStream=vt("benchmark",(B,k)=>{s.loading||y({runs:k?.snapshot?.runs||null})}))},N=async B=>{try{s.selectedRun=await Q.benchmarkRun(B,!0),p()}catch(k){M(k.message||"\u8B80\u53D6 benchmark run \u5931\u6557\u3002","danger")}},E=async B=>{!s.labelTouched&&B.elements.label&&(B.elements.label.value=hs());let k=n(B);s.config=k;let C=Number(B.elements.suite_id?.value||0);if(!C){M("\u8ACB\u5148\u9078\u64C7 benchmark \u984C\u5EAB\u3002","warn");return}try{await Q.startBenchmarkRun({suite_id:C,config:k,actor:"anonymous"}),M("Benchmark \u5DF2\u555F\u52D5\u3002","ok"),s.selectedRun=null,s.config.label=hs(),s.labelTouched=!1,await y()}catch(ne){M(ne.message||"Benchmark \u555F\u52D5\u5931\u6557\u3002","danger",8e3)}},I=async B=>{try{await Q.stopBenchmarkRun(B),M("\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info"),await y()}catch(k){M(k.message||"\u505C\u6B62\u5931\u6557\u3002","danger")}},H=async B=>{let k=Number(B.dataset.resultId||0),C=new FormData(B),ne={};for(let me of["correctness","grounding","citation","clarity","overall"]){let W=Number(C.get(`score_${me}`));Number.isFinite(W)&&(ne[me]=W)}try{await Q.reviewBenchmarkResult(k,{reviewer:"anonymous",scores:ne,comment:String(C.get("comment")||"")}),M("\u4EBA\u5DE5\u8A55\u5206\u5DF2\u5132\u5B58\u3002","ok"),s.selectedRun&&(s.selectedRun=await Q.benchmarkRun(s.selectedRun.run_id,!0),s.forcedCaseIds.add(k)),p()}catch(me){M(me.message||"\u4EBA\u5DE5\u8A55\u5206\u5132\u5B58\u5931\u6557\u3002","danger")}},V=async B=>{if(B)try{let k=await Q.benchmarkFingerprintHistory(B,50);s.history[B]=k.cases||[];let C=s.selectedRun,ne=a();if(!C||!ne)return;let me=(C.cases||[]).filter(W=>W.fingerprint===B);for(let W of me){let ee=ne.querySelector(`details.bench-case[data-result-id="${W.id}"]`);if(!ee)continue;let ae=ee.open;ee.innerHTML=sn(W,s.history[B]),ee.open=ae,ee._benchSignature=tn(W,s.history[B])}}catch(k){M(k.message||"\u540C\u984C\u6B77\u53F2\u8B80\u53D6\u5931\u6557\u3002","danger")}},Y=async B=>{let k=B.target.closest("[data-bench-action]");if(!k)return;let C=k.dataset.benchAction;C==="open-run"?await N(k.dataset.runId||""):C==="stop"?await I(k.dataset.runId||""):C==="fingerprint-history"&&await V(k.dataset.fingerprint||"")},ye=async B=>{let k=B.target.closest("[data-bench-form]");k&&(B.preventDefault(),k.dataset.benchForm==="run"?await E(k):k.dataset.benchForm==="human"&&await H(k))},Te=B=>{B&&(B.elements.label&&B.elements.label.value!==s.config.label&&(s.labelTouched=!0),s.config=n(B),B.elements.suite_id&&(s.selectedSuiteId=Number(B.elements.suite_id.value)||s.selectedSuiteId))},J=B=>{let k=B.target.closest('[data-bench-form="run"]');k&&Te(k)};return e.addEventListener("click",Y),e.addEventListener("submit",ye),e.addEventListener("input",J),e.addEventListener("change",J),{show(){if(t&&t("benchmark"),!s.labelTouched){s.config.label=hs();let B=a()?.querySelector('input[name="label"]');B&&(B.value=s.config.label)}S(),y({refreshAll:!s.referenceLoaded})},refresh(){return S(),y({refreshAll:!0})},destroy(){e.removeEventListener("click",Y),e.removeEventListener("submit",ye),e.removeEventListener("input",J),e.removeEventListener("change",J),s.refreshStream&&s.refreshStream(),s.refreshStream=null,s.tickTimer&&window.clearInterval(s.tickTimer)}}}var pn={};Jt(pn,{exportCsv:()=>fa,exportableResult:()=>ba,render:()=>bl,renderReport:()=>pa,reportError:()=>ga,reportLoading:()=>Ds});var Pr=[10,25,50,100],jr=500,Co=["law_name","law_level","law_category","law_modified_date","article_count"],Ro=["jid","court_normalized","title","jdate","matched_laws","citation_count"],Po={A:"\u689D\u6587",C:"\u7AE0\u7BC0"};function ma(e){return e?.label||e?.id||"\u8CC7\u6599\u5EAB"}function da(e,t){let s={};for(let a of e.fields||[]){let n=a.type==="checkbox"?!1:a.type==="multiselect"?[]:"",i=a.default===void 0?n:a.default;s[a.key]=Array.isArray(i)?[...i]:i}return{values:s,page:1,pageSize:t,result:null,sort:null,columnFilters:{},fuzzyTerms:[]}}function Io(e,t){let s=e.visibleWhen;if(!s)return!0;for(let[a,n]of Object.entries(s))if(Array.isArray(n)&&!n.map(String).includes(String(t[a]??"")))return!1;return!0}function un(e,t){return(e.fields||[]).filter(s=>Io(s,t))}function Bo(e,t){return`filter-${e.id}-${t}`}function cs(e){return e==null?"":r(String(e))}function nn(e,t,s){let a=s[t.key],n=Bo(e,t.key),i=t.help?`<span class="field-help">${r(t.help)}</span>`:"";if(t.type==="checkbox")return`<div class="field">
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
    </label>`;if(t.type==="select"){let l=(t.options||[]).map(d=>`<option value="${cs(d.value)}" ${String(d.value)===String(a??"")?"selected":""}>${r(d.label??d.value)}</option>`).join("");return`<div class="field">${o}
      <select class="select" id="${n}" name="${r(t.key)}">${l}</select>
      ${i}
    </div>`}if(t.type==="multiselect"){let l=new Set((Array.isArray(a)?a:[]).map(String)),d=(t.options||[]).map(c=>`<label class="multi-option">
          <input type="checkbox" name="${r(t.key)}" value="${cs(c.value)}" ${l.has(String(c.value))?"checked":""} />
          <span>${r(c.label??c.value)}</span>
        </label>`).join("");return`<div class="field">${o}
      <div class="multi-select">${d}</div>
      ${i}
    </div>`}return t.type==="number"?`<div class="field">${o}
      <input class="input" type="number" id="${n}" name="${r(t.key)}"
        value="${cs(a)}"
        ${t.min!==void 0?`min="${t.min}"`:""}
        ${t.max!==void 0?`max="${t.max}"`:""}
        step="${t.step??1}"
        placeholder="${cs(t.placeholder||"")}" />
      ${i}
    </div>`:t.type==="date"?`<div class="field">${o}
      <input class="input" type="date" id="${n}" name="${r(t.key)}"
        value="${cs(a)}" />
      ${i}
    </div>`:`<div class="field">${o}
    <input class="input" type="text" id="${n}" name="${r(t.key)}"
      value="${cs(a)}"
      placeholder="${cs(t.placeholder||"")}" />
    ${i}
  </div>`}function Lr(e,t,{focusTable:s=!1}={}){let a=un(e,t.values),n=[];for(let i=0;i<a.length;i+=1){let o=a[i],l=a[i+1];o.type==="date"&&l&&l.type==="date"?(n.push(`<div class="field-row">${nn(e,o,t.values)}${nn(e,l,t.values)}</div>`),i+=1):n.push(nn(e,o,t.values))}return`<form id="data-filter-form" autocomplete="off">
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
  </form>`}function ua(e,t,s){let a={...s.values};for(let n of un(t,a))if(n.type==="checkbox"){let i=e.querySelector(`[name="${n.key}"]`);a[n.key]=!!i?.checked}else if(n.type==="multiselect")a[n.key]=Array.from(e.querySelectorAll(`[name="${n.key}"]:checked`)).map(i=>i.value);else{let i=e.querySelector(`[name="${n.key}"]`);a[n.key]=i?i.value:""}return a}function Ir(e,t){let s={};for(let a of un(e,t.values)){let n=t.values[a.key];a.type==="checkbox"?s[a.key]=!!n:a.type==="multiselect"?s[a.key]=Array.isArray(n)?n:[]:a.type==="number"?s[a.key]=n===""||n===null?"":Number(n):s[a.key]=n??""}return s}function rn(e,t){let s=Ir(e,t);return Array.isArray(t.fuzzyTerms)&&t.fuzzyTerms.length&&(s.keywords=[...t.fuzzyTerms]),(e.id==="postgres"||e.id==="parquet")&&t.sort?.key&&(s.sort=`${t.sort.key}:${t.sort.direction}`,s.schema_preview=!0),t.columnFilters&&Object.keys(t.columnFilters).length>0&&(s.column_filters=t.columnFilters),s}function Oo(e){if(e.status==="operational")return"";let t=e.status==="unavailable"?"danger":e.status==="degraded"?"warn":"info";return`<div class="sidebar-notice">${Ne({tone:t,title:`${ma(e)} ${Tt(e.status).label}`,text:r(e.detail||"\u76EE\u524D\u7121\u6CD5\u4F7F\u7528\u9019\u500B\u8CC7\u6599\u4F86\u6E90\u3002")})}</div>`}function Do(e,t){return`<label class="field data-source-field">
    <span class="field-label">\u8CC7\u6599\u4F86\u6E90</span>
    <select class="select" name="database">
      ${e.map(s=>{let a=Tt(s.status);return`<option value="${r(s.id)}" ${s.id===t?"selected":""}>${r(s.label)} \xB7 ${r(a.label)}</option>`}).join("")}
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
  </div>`}function on(e,t,s=""){let a=Array.isArray(e.tables)?e.tables:[],n=a.length?a.map(i=>`<button class="schema-item ${String(i.id)===String(s||"")?"is-selected":""}" type="button"
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
    ${rt({iconName:"table",title:"\u67E5\u8A62\u5831\u8868\u6703\u986F\u793A\u5728\u9019\u88E1",text:r({postgres:"\u4F7F\u7528\u5DE6\u5074 fuzzy \u67E5\u8A62\u52A0\u5165\u6CD5\u898F\u6216\u5224\u6C7A\u689D\u4EF6\uFF0C\u518D\u8996\u9700\u8981\u5C55\u958B\u9032\u968E metadata \u689D\u4EF6\u3002",parquet:"\u4F7F\u7528\u5DE6\u5074 fuzzy \u67E5\u8A62\u52A0\u5165\u689D\u4EF6\uFF0C\u76F4\u63A5\u6383\u63CF\u539F\u59CB Parquet\uFF1B\u53EF\u5C55\u958B\u9032\u968E\u689D\u4EF6\u8ABF\u6574\u6B04\u4F4D\u3002",qdrant:"\u8F38\u5165\u8A9E\u610F\u67E5\u8A62\u5F8C\uFF0C\u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5DF2\u5EFA\u7ACB\u5411\u91CF\u7D22\u5F15\u7684\u5224\u6C7A\uFF1B\u672A\u7D22\u5F15\u6642\u6703\u660E\u78BA\u986F\u793A\u72C0\u614B\u3002",indexeddb:"\u67E5\u8A62\u5B58\u5728\u9019\u500B\u700F\u89BD\u5668\u7684\u63D0\u554F\u7D00\u9304\u8207\u8A2D\u5B9A\uFF0C\u4E0D\u9700\u8981\u4F3A\u670D\u5668\u3002"}[e.id]||"\u8A2D\u5B9A\u689D\u4EF6\u5F8C\u57F7\u884C\u67E5\u8A62\u3002")})}
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
      ${Ne({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u67E5\u8A62\u7D50\u679C",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
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
    title="\u6AA2\u8996\u300C${r(String(a))}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${r(String(a))}${m("chevronRight",12,"law-link-icon")}</button>`}function Or(e,{useColumnKeys:t=!1,sortable:s=!0,sortableAll:a=!1,searchValues:n=null,compact:i=!1}={}){let o=Array.isArray(e.columns)?e.columns:[],l=Array.isArray(e.rows)?e.rows:[],d=(e.page-1)*e.page_size,c=Br(e),v=Qo(e),$=Go(e),h=e.meta?.sort||null,f=n?`<tr class="schema-search-row">
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
        <thead>${f}<tr>
          <th scope="col" class="cell-index-head">#</th>
          ${o.map(p=>Wo(p,v,h,t,s,a)).join("")}
        </tr></thead>
        <tbody>
          ${l.map((p,y)=>`<tr>
                <td class="cell-mono cell-empty cell-index">${d+y+1}</td>
                ${o.map(S=>{if((v||$)&&S.key==="jid")return`<td class="cell-jid">${Jo(p)}</td>`;let N=c&&S.key==="law_name"?Ko(e,p):null;if(N)return`<td>${Yo(p,S,N)}</td>`;let I={date:"cell-date",datetime:"cell-datetime",duration:"cell-duration",number:"cell-number"}[S.type];return`<td${I?` class="${I}"`:""}>${Xs(p[S.key],S.type||"text")}</td>`}).join("")}
              </tr>`).join("")}
        </tbody>
      </table>
    </div>`:`<div class="report-table-head">
        <span class="report-section-title">\u8CC7\u6599\u5217</span>
        <span class="muted" style="font-size:10px">0 rows</span>
      </div>
      ${rt({iconName:"filter",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u8CC7\u6599",text:"\u653E\u5BEC\u65E5\u671F\u5340\u9593\u3001\u964D\u4F4E\u689D\u6587\u6578\u4E0B\u9650\uFF0C\u6216\u6E05\u9664\u95DC\u9375\u5B57\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}`:`<div class="report-table-head">
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
          ${He(d)}
          <span class="chip">${r(c)}</span>
        </div>
        <div class="report-sub">
          ${u(i)} \u7B46\u7B26\u5408 \xB7
          ${fe(e.duration_ms)} \xB7
          ${r(String(l).toUpperCase())} / ${r(String(e.table||"\u2014"))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${m("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${m("file",14)}<span>JSON</span></button>
      </div>
    </div>

    ${e.message?`<div class="report-alert">${Ne({tone:d==="not_configured"?"info":d==="danger"?"danger":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r(e.message)})}</div>`:""}

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
  </div>`}function ln(e,t,{columnFilters:s={},searchEnabled:a=!1}={}){let n=Array.isArray(e.columns)?e.columns:[],i=Array.isArray(e.rows)?e.rows:[],o=e.message?`<div class="report-alert">${Ne({tone:e.status==="ok"?"info":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r(e.message)})}</div>`:"";return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW \xB7 ${r(String(e.database||"").toUpperCase())}</div>
        <div class="report-title">
          ${r(t||e.table||"\u8CC7\u6599\u8868")}
          ${He(e.status||"ok")}
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
    ${Ne({tone:"danger",title:"\u8B80\u53D6\u5931\u6557",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
  </div>`}function Zo(e){return`<div class="report-empty">
    ${rt({iconName:"table",title:"\u9078\u64C7\u8CC7\u6599\u8868\u9810\u89BD",text:`\u5F9E\u5DE6\u5074 ${ma(e)} \u7684 Schema \u6E05\u55AE\u9EDE\u9078\u8CC7\u6599\u8868\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6B04\u4F4D\u540D\u7A31\u3001\u524D 10 \u7B46\u8CC7\u6599\u8207\u7E3D\u7B46\u6578\u3002`})}
  </div>`}function cn(e){return e.is_current===!0?He("ok","\u73FE\u884C"):e.law_abandon_note?He("empty","\u5DF2\u5EE2\u6B62"):e.is_current===!1?He("empty","\u6B77\u53F2\u7248\u672C"):He("not_configured","\u72C0\u614B\u672A\u63D0\u4F9B")}function Ke(e,t){return`<div class="law-meta-item">
    <div class="law-meta-label">${r(e)}</div>
    <div class="law-meta-value">${t||"\u2014"}</div>
  </div>`}function ds(e){return e?Lt(e):"\u2014"}function el(e){return e?.meta?.metadata_source==="postgresql"?"PostgreSQL metadata":e?.meta?.metadata_source==="parquet"?"Parquet snapshot":"\u2014"}function dn(e,t){return t?`<div class="report-section">
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
  </div>`}function $s(){return`<button class="btn btn-secondary btn-sm" type="button" data-action="back-to-results">
    ${m("chevronLeft",14)}<span>\u8FD4\u56DE\u67E5\u8A62\u7D50\u679C</span>
  </button>`}function rl(e){return`<div class="law-report">
    <div class="law-report-topbar">
      ${$s()}
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
      ${$s()}
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
        ${Ne({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
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
  </details>`}function cl(e,{database:t="",lawPage:s=1,historyOpen:a=!1}={}){let n=Array.isArray(e.warnings)?e.warnings:[],i=e.law_name||e.law_key||"\u6CD5\u898F",o=(Array.isArray(e.articles)?e.articles:[]).filter(y=>y.article_type!=="C").length,l=el(e),d=e.meta?.articles_source==="postgresql"?"PostgreSQL \u689D\u6587\u7248\u672C":e.meta?.articles_source==="parquet"?"Parquet \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",c=e.meta?.snapshot||"",v=e.meta?.articles_source==="postgresql"&&e.selected_version_id!==null&&e.selected_version_id!==void 0?`\u689D\u6587\u7248\u672C #${e.selected_version_id}`:"",$=[l,d,v,c].filter(Boolean).join(" \xB7 "),h=e.source_type==="law"?"\u6CD5\u5F8B":e.source_type==="order"?"\u547D\u4EE4":e.source_type||"\u2014",f=e.version||{},p=[Ke("\u6CD5\u898F\u4F4D\u968E",r(e.law_level||"\u2014")),Ke("\u6CD5\u898F\u985E\u5225",r(e.law_category||"\u2014")),Ke("\u7570\u52D5\u65E5\u671F",ds(e.law_modified_date)),Ke("\u751F\u6548\u65E5\u671F",ds(e.law_effective_date)),Ke("\u689D\u6587\u6578",u(e.article_count)),Ke("\u8CC7\u6599\u72C0\u614B",cn(e)),Ke("\u82F1\u8B6F\u540D\u7A31",r(e.eng_law_name||"\u2014")),Ke("\u6CD5\u898F\u8B58\u5225",`<span class="mono">${r(e.law_key||"\u2014")}</span>`)];return f.first_seen_version_id!==null&&f.first_seen_version_id!==void 0&&p.push(Ke("\u9996\u6B21\u6536\u9304\u7248\u672C",`#${r(f.first_seen_version_id)}`)),f.last_seen_version_id!==null&&f.last_seen_version_id!==void 0&&p.push(Ke("\u6700\u5F8C\u6536\u9304\u7248\u672C",`#${r(f.last_seen_version_id)}`)),f.last_seen_at&&p.push(Ke("\u6700\u5F8C\u6536\u9304\u6642\u9593",r(je(f.last_seen_at)))),f.selected_version_id!==null&&f.selected_version_id!==void 0&&p.push(Ke("\u689D\u6587\u7248\u672C",`#${r(f.selected_version_id)} \xB7 ${e.meta?.selected_version_is_current?"\u76EE\u524D":"\u6B77\u53F2"}`)),`<div class="law-report">
    <div class="law-report-topbar">
      ${$s()}
      <span class="law-report-origin" title="${r($)}">${r($)}</span>
    </div>
    <div class="report-card law-report-card" data-database="${r(t)}">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT \xB7 ${r(String(t||l).toUpperCase())}</div>
          <div class="report-title">
            ${r(i)}
            ${cn(e)}
            <span class="chip">${r(h)}</span>
          </div>
          <div class="report-sub">
            ${r([e.law_level,e.law_category].filter(Boolean).join(" \xB7 ")||"\u2014")} \xB7 ${u(e.article_count)} \u689D \xB7 \u7570\u52D5 ${ds(e.law_modified_date)}
          </div>
        </div>
        <div class="report-actions">
          ${ol(e)}
          ${e.law_url?`<a class="btn btn-secondary btn-sm" href="${r(e.law_url)}" target="_blank" rel="noopener noreferrer">${m("external",14)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:""}
        </div>
      </div>

      ${n.length?`<div class="report-alert">${Ne({tone:e.status==="degraded"?"warn":"info",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n.map(y=>r(y)).join("<br />")})}</div>`:""}

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u689D\u6587\u6578</div>
          <div class="summary-value">${u(e.article_count)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u7570\u52D5\u65E5\u671F</div>
          <div class="summary-value">${ds(e.law_modified_date)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u6CD5\u898F\u4F4D\u968E</div>
          <div class="summary-value">${r(e.law_level||"\u2014")}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u76EE\u524D\u72C0\u614B</div>
          <div class="summary-value">${cn(e)}</div>
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
      ${dn("\u6CD5\u898F\u524D\u8A00",e.law_foreword)}
      ${tl("\u6CD5\u898F\u6CBF\u9769",e.law_histories,{open:a})}
      ${dn("\u751F\u6548\u8AAA\u660E",e.law_effective_note)}
      ${dn("\u5EE2\u6B62\u8AAA\u660E",e.law_abandon_note)}
      ${sl(e.attachments)}
      ${al(e)}
    </div>
    ${o>100?nl():""}
  </div>`}function dl(e){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${$s()}
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
      ${$s()}
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
        ${Ne({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
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
  </div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5F15\u7528\u660E\u7D30\u3002</div>'}function gl(e,{database:t="postgres"}={}){let s=Array.isArray(e.matched_laws)?e.matched_laws:[],a=e.title||e.jid||"\u5224\u6C7A",n=String(e.full_text||""),i=Number(e.full_text_length)||n.length||0,o=["PostgreSQL \u5224\u6C7A\u6587\u4EF6",e.source_archive].filter(Boolean).join(" \xB7 "),l=[Ke("\u6848\u865F",r(e.jid||"\u2014")),Ke("\u5E74\u5EA6",r(e.jyear||"\u2014")),Ke("\u5B57\u5225",r(e.jcase||"\u2014")),Ke("\u865F\u78BC",r(e.jno||"\u2014")),Ke("\u6CD5\u9662",r(e.court||"\u2014")),Ke("\u6848\u7531",r(e.title||"\u2014")),Ke("\u88C1\u5224\u65E5\u671F",ds(e.jdate)),Ke("\u4F86\u6E90\u58D3\u7E2E\u6A94",r(e.source_archive||"\u2014")),Ke("\u5168\u6587\u9577\u5EA6",`${u(i)} \u5B57`),Ke("\u5F15\u7528\u6578",u(e.citation_count))];return e.import_run_id!==null&&e.import_run_id!==void 0&&l.push(Ke("\u532F\u5165 Run",`#${r(e.import_run_id)}`)),`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${$s()}
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
            ${r(e.court||"\u2014")} \xB7 ${ds(e.jdate)} \xB7
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
          <div class="summary-value">${ds(e.jdate)}</div>
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
  </div>`}function Cr(e){return`"${(e==null?"":typeof e=="object"?JSON.stringify(e):String(e)).replace(/"/g,'""')}"`}function fa(e){let t=e.columns||[],s=e.rows||[],a=[["#",...t.map(i=>i.label||i.key)].map(Cr).join(",")],n=((Number(e.page)||1)-1)*(Number(e.page_size)||25);return s.forEach((i,o)=>{a.push([n+o+1,...t.map(l=>i[l.key])].map(Cr).join(","))}),`\uFEFF${a.join(`\r
`)}`}function ba(e){return{...e,rows:(e.rows||[]).map(t=>{let s={};for(let[a,n]of Object.entries(t))a.startsWith("_")||(s[a]=n);return s})}}function fl(e){return e==="rag"?"RAG \u63D0\u554F":e==="data"?"\u8CC7\u6599\u67E5\u8A62":e||"\u5176\u4ED6"}async function Rr(e,t){let s=performance.now(),a=Ir(e,t),n=String(a.store||"query_history"),i=String(a.keyword||""),o=t.page,l=t.pageSize,d=[],c=[],v=[],$=[];if(n==="audit_events"){try{let I=Number(await ss("audit.last_event_id",0))||0,H=await Q.versioningAudit({since_id:I,limit:500}),V=Array.isArray(H?.events)?H.events:[];V.length&&await mr(V.map(ye=>({...ye,dataset:"judgment"})));let Y=Number(H?.latest_event_id||0);Y>I&&await Bs("audit.last_event_id",Y)}catch(I){d.push(`\u7248\u672C audit \u540C\u6B65\u5931\u6557\uFF1A${I.message||I}`)}c=(await gr({keyword:i,limit:jr})).map(I=>({created_at:I.created_at,dataset:I.dataset,issue_month:I.issue_month,change_type:I.change_type,jid:I.jid,detail:I.detail})),v=[{key:"created_at",label:"\u6642\u9593",type:"datetime"},{key:"dataset",label:"\u8CC7\u6599\u96C6",type:"text"},{key:"issue_month",label:"\u6708\u4EFD",type:"mono"},{key:"change_type",label:"\u8B8A\u66F4",type:"status"},{key:"jid",label:"\u6848\u865F",type:"mono"},{key:"detail",label:"\u6458\u8981",type:"longtext"}];let E=new Map;c.forEach(I=>E.set(I.change_type||"unknown",(E.get(I.change_type||"unknown")||0)+1)),$=Array.from(E.entries()).map(([I,H])=>({label:I,value:H})).sort((I,H)=>H.value-I.value)}else if(n==="settings"){c=(await fr({keyword:i})).map(I=>({key:I.key,value:br(I.value),updated_at:I.updated_at})),v=[{key:"key",label:"\u8A2D\u5B9A\u9375",type:"mono"},{key:"value",label:"\u503C",type:"longtext"},{key:"updated_at",label:"\u66F4\u65B0\u6642\u9593",type:"datetime"}];let E=new Map;c.forEach(I=>{let H=String(I.key||"").split(".")[0]||"\u5176\u4ED6";E.set(H,(E.get(H)||0)+1)}),$=Array.from(E.entries()).map(([I,H])=>({label:I,value:H})).sort((I,H)=>H.value-I.value)}else{c=(await ia({keyword:i,limit:jr})).map(I=>({kind:fl(I.kind),title:I.title,detail:I.detail,created_at:I.created_at})),v=[{key:"kind",label:"\u985E\u578B",type:"text"},{key:"title",label:"\u67E5\u8A62\u5167\u5BB9",type:"longtext"},{key:"detail",label:"\u6458\u8981",type:"longtext"},{key:"created_at",label:"\u6642\u9593",type:"datetime"}];let E=new Map;c.forEach(I=>E.set(I.kind,(E.get(I.kind)||0)+1)),$=Array.from(E.entries()).map(([I,H])=>({label:I,value:H})).sort((I,H)=>H.value-I.value)}let h=c.length,f=(o-1)*l,p=c.slice(f,f+l),y=Math.round(performance.now()-s),S=dr();return S&&d.push("IndexedDB \u7121\u6CD5\u4F7F\u7528\uFF0C\u8CC7\u6599\u66AB\u5B58\u5728\u8A18\u61B6\u9AD4\uFF0C\u91CD\u65B0\u6574\u7406\u5F8C\u6703\u6D88\u5931\u3002"),{database:"indexeddb",label:"IndexedDB",status:S?"degraded":"ok",message:S?"\u700F\u89BD\u5668\u4E0D\u5141\u8A31\u4F7F\u7528 IndexedDB\uFF0C\u672C\u9801\u6539\u7528\u8A18\u61B6\u9AD4\u66AB\u5B58\u3002":null,table:n,columns:v,rows:p,total:h,page:o,page_size:l,duration_ms:y,summary:[{label:"\u7B26\u5408\u7B46\u6578",value:String(h)},{label:"\u76EE\u524D\u9801\u9762",value:`${p.length} \u7B46`},{label:"\u5132\u5B58\u6A21\u5F0F",value:ra()==="indexeddb"?"IndexedDB":"\u8A18\u61B6\u9AD4"},{label:"\u67E5\u8A62\u8017\u6642",value:`${y} ms`}],distribution:$,query_text:`INDEXEDDB OPEN 'judgment-console'
OBJECT STORE '${n}'
FILTER ${i?`keyword \u2248 '${i}'`:"1 = 1"}
ORDER BY created_at DESC
LIMIT ${l} OFFSET ${f}`,warnings:d,meta:{store:n,filters:a,client_side:!0}}}async function bl(e,t){let s=!1,a=null,n=[],i="law",o=null,l={},d=0,c=25,v="query",$=null,h=null,f=0,p=[],y=null,S=-1,N=0,E=0,I=null,H=null,V=null;e.innerHTML=`<section class="page data-page">
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
      ${Et(null,{loading:!0})}
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
  </section>`;let Y=e.querySelector("#query-sidebar"),ye=e.querySelector("#data-nav"),Te=e.querySelector("#db-options-wrap"),J=e.querySelector("#filter-area"),B=e.querySelector("#schema-area"),k=e.querySelector("#query-main"),C=e.querySelector("#schema-suggest-popover"),ne=e.querySelector("#catalog-meta"),me=e.querySelector("#refresh-catalog"),W=e.querySelector("#data-judgment-stats"),ee=_=>n.find(q=>q.id===_),ae=()=>ee(i)?.databases||[],Z=_=>ae().find(q=>q.id===_),we=(_,q)=>`${_}:${q}`,z=(_,q=i)=>l[we(q,_.id)],ve=(_,q)=>{Bs(_,q).catch(()=>{})},qe=()=>{if(!a){ne.textContent="CATALOG \xB7 \u96E2\u7DDA",ne.className="badge badge-danger badge-mono";return}let _=ae(),q=_.filter(R=>R.available).length,A=ee(i);ne.textContent=`CATALOG \xB7 ${A?.label||i} \xB7 ${q}/${_.length} \u53EF\u7528`,ne.className="badge badge-neutral badge-mono"},ge=_=>{k.innerHTML=Ho(_)},Xe=()=>{let _=H?.returnScroll??V?.returnScroll;H=null,V=null;let q=Z(o),A=q?z(q):null;v==="schema"&&h?.result?k.innerHTML=ln(h.result,Ge(q,h.tableId),{columnFilters:h.columnFilters||{},searchEnabled:q.id==="postgres"||q.id==="parquet"}):A?.result?k.innerHTML=pa(A.result):q&&ge(q),typeof _=="number"&&window.requestAnimationFrame(()=>window.scrollTo({top:_,behavior:"smooth"}))},Oe=(_="law-article-jump")=>{let q=k.querySelector(`#${_}`),A=Fr(q?.value);if(!A){M("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),q?.focus();return}let U=[...k.querySelectorAll("[data-article-no]")].find(K=>K.dataset.articleNo===A);if(!U){M(`\u627E\u4E0D\u5230\u7B2C ${A} \u689D\u3002`,"warn");return}U.scrollIntoView({behavior:"instant",block:"center"}),U.classList.add("is-jump-target"),window.setTimeout(()=>U.classList.remove("is-jump-target"),2400)},Ue=async({lawKey:_,sourceType:q="",lawName:A="",versionId:R=""})=>{let U=Z(o),K=U?z(U):null,de=v==="schema"?h?.result:null;if(!U||!K?.result&&!de||!_)return;let Se=++d;H={seq:Se,lawKey:_,sourceType:q,lawName:A,versionId:R?String(R):"",page:1,detail:null,database:U.id,returnScroll:window.scrollY},V=null,k.innerHTML=rl(A||_),k.scrollIntoView({behavior:"smooth",block:"start"});try{let Ae=await Q.lawDetail(_,q,H.versionId);if(s||!H||H.seq!==Se)return;H.detail=Ae,H.page=1,k.innerHTML=cl(Ae,{database:H.database,lawPage:H.page})}catch(Ae){if(s||!H||H.seq!==Se)return;k.innerHTML=il(Ae,A||_),M(Ae.message||"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868\u3002","danger")}},Be=async({jid:_})=>{let q=Z(o),A=q?z(q):null,R=v==="schema"?h?.result:null;if(!q||!A?.result&&!R||!_)return;let U=++d;H=null;let K=q.id==="parquet"?"parquet":"postgres";V={seq:U,jid:_,detail:null,database:q.id,source:K,returnScroll:window.scrollY},k.innerHTML=dl(_),k.scrollIntoView({behavior:"smooth",block:"start"});try{let de=await Q.judgmentDetail(_,K);if(s||!V||V.seq!==U)return;V.detail=de,k.innerHTML=gl(de,{database:V.database})}catch(de){if(s||!V||V.seq!==U)return;k.innerHTML=ul(de,_),M(de.message||"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587\u3002","danger")}},Qe=(_,q)=>`${i}:${_.id}:${q}`,Ge=(_,q)=>(_.tables||[]).find(A=>A.id===q)?.label||q,mt=(_,q,{sort:A=null,columnFilters:R={}}={})=>{let U={column_filters:R};return _.id==="postgres"?(U.table=q,U.schema_preview=!0):_.id==="parquet"&&i==="judgment"?(U.table="judgment_documents",U.columns=Ro):_.id==="parquet"&&(U.dataset="all",U.columns=Co),A?.key&&(U.sort=`${A.key}:${A.direction}`),U},j=async(_,q,{sort:A=null,columnFilters:R={},quiet:U=!1}={})=>{if(!q)return;We();let K=Qe(_,q),de=++f,Se=!!(U&&h?.result&&h.key===K);$={tableId:q},h={key:K,tableId:q,loading:!0,result:null,error:null,sort:A,columnFilters:R},Se?k.setAttribute("aria-busy","true"):(B.innerHTML=on(_,ee(i)?.label||i,q),k.innerHTML=Nr(Ge(_,q)));try{let Ae;if(_.id==="indexeddb"){let $e=da(_,10);$e.values.store=q,$e.page=1,Ae=await Rr(_,$e)}else _.id==="qdrant"?Ae={database:"qdrant",label:"Qdrant",status:"not_configured",message:"Qdrant collection \u9700\u8981\u8A9E\u610F\u67E5\u8A62\uFF1BSchema \u50C5\u63D0\u4F9B collection \u540D\u7A31\uFF0C\u4E0D\u5217\u51FA\u524D 10 \u7B46\u8CC7\u6599\u3002",table:q,columns:[],rows:[],total:0,page:1,page_size:10,duration_ms:0,summary:[],distribution:[],query_text:"",warnings:[],meta:{}}:(Ae=await Q.query({database:_.id,filters:mt(_,q,{sort:A,columnFilters:R}),page:1,pageSize:10}),A?.key&&(Ae.meta={...Ae.meta||{},sort:A}));if(s||de!==f)return;h={key:K,tableId:q,loading:!1,result:Ae,error:null,sort:A,columnFilters:R},k.removeAttribute("aria-busy"),v==="schema"&&$?.tableId===q&&(B.innerHTML=on(_,ee(i)?.label||i,q),k.innerHTML=ln(Ae,Ge(_,q),{columnFilters:R,searchEnabled:_.id==="postgres"||_.id==="parquet"}))}catch(Ae){if(s||de!==f)return;h={key:K,tableId:q,loading:!1,result:null,error:Ae,sort:A,columnFilters:R},k.removeAttribute("aria-busy"),v==="schema"&&$?.tableId===q&&(k.innerHTML=Er(Ae,Ge(_,q)))}},O=()=>{let _=Z(o);if(!_)return null;if(v==="schema"&&h?.result)return{db:_,tableId:h.tableId,columnFilters:h.columnFilters||{},sort:h.sort||null,mode:"schema"};let q=_?z(_):null,A=q?.result;return A&&(_.id==="postgres"||_.id==="parquet")?{db:_,tableId:A.table,columnFilters:q.columnFilters||{},sort:q.sort||null,mode:"query"}:null},x=(_,q,A)=>{if(!_)return;let R=`${_.db.id}:${_.tableId}:${q}`,U=L.get(R);U&&(window.clearTimeout(U),L.delete(R)),We();let K={..._.columnFilters||{}},de=String(A||"").trim();if(de?K[q]=de:delete K[q],_.mode==="schema"){j(_.db,_.tableId,{sort:_.sort,columnFilters:K,quiet:!0});return}let Se=z(_.db);Se.columnFilters=K,Se.page=1,at(1)},L=new Map,X=()=>{(!C||C.hidden)&&!p.length&&!y||(N+=1,p=[],y=null,S=-1,C&&(C.hidden=!0,C.innerHTML=""))},F=(_,q)=>{let A=String(_||""),R=A.toLocaleLowerCase(),U=String(q||"").toLocaleLowerCase(),K=new Array(A.length).fill(!1),de=(Ie,Je)=>{for(let Ye=Ie;Ye<Ie+Je;Ye+=1)Ye>=0&&Ye<K.length&&(K[Ye]=!0)},Se=R.indexOf(U);if(Se>=0)for(;Se>=0;)de(Se,U.length),Se=R.indexOf(U,Se+U.length);else{let Ie=[];for(let Je of U.match(/[一-鿿]{2,}/g)||[])for(let Ye=0;Ye<Je.length-1;Ye+=1)Ie.push(Je.slice(Ye,Ye+2));Ie.push(...U.match(/[a-z0-9]+/g)||[]);for(let Je of Ie){let Ye=R.indexOf(Je);for(;Ye>=0;)de(Ye,Je.length),Ye=R.indexOf(Je,Ye+Je.length)}}let Ae="",$e=0;for(;$e<A.length;)if(K[$e]){let Ie=$e;for(;Ie<A.length&&K[Ie];)Ie+=1;Ae+=`<mark>${r(A.slice($e,Ie))}</mark>`,$e=Ie}else{let Ie=$e;for(;Ie<A.length&&!K[Ie];)Ie+=1;Ae+=r(A.slice($e,Ie)),$e=Ie}return Ae||r(A)},Ee=(_,q)=>{if(!C)return;let A=_.getBoundingClientRect(),R=Math.min(420,Math.max(220,A.width)),U=Math.min(360,34+q*30),K=A.bottom+4;K+U>window.innerHeight-8&&(K=Math.max(8,A.top-U-4));let de=Math.min(window.innerWidth-R-8,Math.max(8,A.left));C.style.width=`${R}px`,C.style.left=`${de}px`,C.style.top=`${K}px`},G=_=>{if(!C)return;let q=[...C.querySelectorAll(".schema-suggest-item")];q.length&&(S=Math.max(0,Math.min(q.length-1,_)),q.forEach((A,R)=>{A.classList.toggle("is-active",R===S)}),q[S].scrollIntoView({block:"nearest"}))},ce=_=>{let q=p[_],A=y;!q||!A||(X(),x(A,A.column,q))},De=async(_,q,A,R)=>{if(!_||!A.trim()){X();return}let U=++N;y={..._,column:q,input:R},S=-1;try{let K=await Q.schemaSuggest({database:_.db.id,table:_.tableId,column:q,query:A,limit:1e3});if(U!==N||document.activeElement!==R||!C)return;let de=Array.isArray(K.values)?K.values:[];if(p=de,!de.length){X();return}let Se=Number(K.total)>de.length?`\u5171 ${u(K.total)} \u500B\u7B26\u5408\uFF0C\u986F\u793A\u524D ${u(de.length)} \u500B`:`\u5171 ${u(K.total)} \u500B\u7B26\u5408`;C.innerHTML=`<div class="schema-suggest-head">${r(Se)}</div>${de.map((Ae,$e)=>`<button class="schema-suggest-item" type="button"
            data-schema-suggest-index="${$e}"
            title="${r(Ae)}">${F(Ae,A)}</button>`).join("")}`,Ee(R,de.length),C.hidden=!1}catch{X()}},We=()=>{let _=document.activeElement;_ instanceof HTMLElement&&_.matches("[data-schema-search]")&&_.blur(),X()},At=(_,{resetReport:q=!1}={})=>{We();let A=z(_);if(ye.innerHTML=Tr(i,v),Te.innerHTML=Do(ae(),_.id),v==="schema")J.hidden=!0,J.innerHTML="",B.hidden=!1,B.innerHTML=`<div class="schema-category-switch" role="tablist" aria-label="Schema \u985E\u5225">
        ${["law","judgment"].map(R=>{let U=n.find(K=>K.id===R);return U?`<button class="chip${i===R?" is-active":""}" type="button" role="tab" aria-selected="${i===R}" data-action="schema-category" data-category="${R}">${r(U.label)}</button>`:""}).join("")}
      </div>${on(_,ee(i)?.label||i,$?.tableId||"")}`;else{B.hidden=!0,B.innerHTML="",J.hidden=!1;let R=Fo(i,_,A),U=Lr(_,A);J.innerHTML=`${Oo(_)}${R?`${R}<details class="data-advanced"><summary>\u9032\u968E metadata \u689D\u4EF6</summary>${U}</details>`:U}<div class="sidebar-note">${zo(_)}</div>`}if(qe(),v==="schema"){let R=$?Qe(_,$.tableId):"";if(h&&h.key===R){let U=Ge(_,h.tableId);h.loading?k.innerHTML=Nr(U):h.error?k.innerHTML=Er(h.error,U):k.innerHTML=ln(h.result,U,{columnFilters:h.columnFilters||{},searchEnabled:_.id==="postgres"||_.id==="parquet"})}else k.innerHTML=Zo(_);return}q?ge(_):A.result?k.innerHTML=pa(A.result):ge(_)},Ze=(_,{persist:q=!0,resetReport:A=!1}={})=>{let R=ae(),U=R.find(de=>de.id===_)||R[0];if(!U)return;H=null,V=null,$=null,h=null,f+=1,o=U.id;let K=we(i,U.id);l[K]||(l[K]=da(U,c)),At(U,{resetReport:A}),q&&(ve(`data.last_database.${i}`,U.id),ve("data.last_category",i))},zt=(_,{persist:q=!0,resetReport:A=!0,databaseId:R=null}={})=>{let U=ee(_)||n[0];if(!U)return;i=U.id,H=null,V=null;let K=U.databases||[],de=R&&K.find(Se=>Se.id===R)||K.find(Se=>Se.id===o)||K[0];if(o=de?.id||null,!de){ye.innerHTML=Tr(i,v),Te.innerHTML=`<div class="sidebar-notice">${Ne({tone:"warn",title:"\u6C92\u6709\u53EF\u7528\u7684\u8CC7\u6599\u4F86\u6E90",text:"\u9019\u500B\u985E\u5225\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u5EAB\u9078\u9805\u3002"})}</div>`,J.innerHTML="",qe();return}Ze(de.id,{persist:!1,resetReport:A}),q&&(ve("data.last_category",U.id),ve(`data.last_database.${U.id}`,de.id))},$t=_=>{let q=z(_),A=J.querySelector("#data-filter-form");A&&(q.values=ua(A,_,q))},at=async(_=null,{quiet:q=!1}={})=>{let A=Z(o);if(!A)return;We();let R=z(A);$t(A),_!==null&&(R.page=_),(!Number.isFinite(R.page)||R.page<1)&&(R.page=1);let U=++d;H=null,V=null;let K=k.querySelector(".report-card"),de=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!K?k.setAttribute("aria-busy","true"):(k.removeAttribute("aria-busy"),k.innerHTML=Ds(A));let Ae=J.querySelector("#run-query");q||ke(Ae,!0,"\u67E5\u8A62\u4E2D\u2026");try{let $e;if(A.id==="indexeddb"?$e=await Rr(A,R):$e=await Q.query({database:A.id,filters:rn(A,R),page:R.page,pageSize:R.pageSize}),s||U!==d)return;if($e.meta={...$e.meta||{},column_filters:R.columnFilters||{},searchable:A.id==="postgres"||A.id==="parquet",sort:R.sort||$e.meta?.sort||null},R.result=$e,R.page=Number($e.page)||R.page,R.pageSize=Number($e.page_size)||R.pageSize,k.removeAttribute("aria-busy"),k.innerHTML=pa($e),de!==null){let Je=k.querySelector("[data-page-size]");Je&&(Je.value=String(R.pageSize),Je.focus({preventScroll:!0}))}let Ie=ee(i)?.label||i;await Ps({kind:"data",title:`${Ie} \xB7 ${A.label} \xB7 ${$e.table||$e.label||"query"}`,detail:`${u($e.total)} \u7B46 \xB7 ${fe($e.duration_ms)}`,payload:{category:i,database:A.id,filters:rn(A,R),page:R.page,page_size:R.pageSize}}),ve("data.last_query",{category:i,database:A.id,filters:rn(A,R),page:R.page,page_size:R.pageSize,at:new Date().toISOString()})}catch($e){if(s||U!==d)return;k.removeAttribute("aria-busy"),k.innerHTML=ga($e,A),M($e.message||"\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{!s&&U===d&&ke(Ae,!1)}},xs=(_,q)=>{let A=_?.querySelector("[data-data-fuzzy-results]");A&&(A.innerHTML=q.length?q.map(R=>`<button class="data-fuzzy-option" type="button" role="option" data-action="select-fuzzy-term" data-term="${r(R.value)}"><span>${r(R.label||R.value)}</span><small>${r(R.meta||"")}</small></button>`).join(""):'<div class="data-fuzzy-empty">\u6C92\u6709\u76F8\u8FD1\u7D50\u679C\uFF1B\u6309 Enter \u53EF\u76F4\u63A5\u52A0\u5165\u76EE\u524D\u8F38\u5165\u7684\u95DC\u9375\u5B57\u3002</div>')},Ht=async(_,q="")=>{if(!_)return;let A=Z(o),R=A?z(A):null;if(!R)return;let U=_.dataset.fuzzyKind||i,K=_.querySelector("[data-data-fuzzy-results]"),de=++E;K&&(K.innerHTML='<div class="data-fuzzy-loading"><span class="spinner"></span><span>\u641C\u5C0B\u76F8\u8FD1\u7D50\u679C\u2026</span></div>');try{let Se=await Q.dataSuggest({kind:U,query:q,limit:12});if(de!==E)return;let Ae=(Se.suggestions||[]).filter($e=>!R.fuzzyTerms.includes($e.value));xs(_,Ae)}catch(Se){if(de!==E)return;K&&(K.innerHTML=`<div class="data-fuzzy-empty">${r(Se.message||"\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},Ut=(_,{focus:q=!1}={})=>{if(!_)return;let A=_.querySelector("[data-data-fuzzy-popover]"),R=_.querySelector("[data-data-fuzzy-search]");!A||!R||(A.hidden&&(A.hidden=!1,R.value="",Ht(_,"")),q&&(R.focus(),R.select()))},Mt=_=>{I&&(window.clearTimeout(I),I=null);let q=_?.querySelector("[data-data-fuzzy-popover]");q&&(q.hidden=!0)},It=async _=>{let q=Z(o);if(!q)return;let A=z(q),R=String(_||"").trim();!R||A.fuzzyTerms.includes(R)||(A.fuzzyTerms=[...A.fuzzyTerms,R],Mt(J.querySelector("[data-data-fuzzy]")),At(q),await at(1))},rs=async _=>{let q=Z(o);if(!q)return;let A=z(q),R=String(_||"").trim();A.fuzzyTerms=A.fuzzyTerms.filter(U=>U!==R),At(q),await at(1)},Bt=async()=>{me.disabled=!0,ke(me,!0,"\u6574\u7406\u4E2D\u2026");try{let[_,q,A,R,U]=await Promise.all([Q.catalog(),ss("data.last_category","law"),ss("data.last_database.law","postgres"),ss("data.last_database.judgment","postgres"),ss("data.page_size",25)]);if(s)return;a=_,W&&(W.innerHTML=Et(a.judgment_stats)),n=Array.isArray(a.categories)?a.categories:[],c=Pr.includes(Number(U))?Number(U):25;for(let $e of n)for(let Ie of $e.databases||[]){let Je=we($e.id,Ie.id);l[Je]||(l[Je]=da(Ie,c))}let K=n.find($e=>$e.id===q)||n[0];if(!K){ye.innerHTML="",Te.innerHTML=`<div class="sidebar-notice">${Ne({tone:"danger",title:"\u6C92\u6709\u53EF\u7528\u7684\u5206\u985E",text:"Catalog \u6C92\u6709\u56DE\u50B3\u6CD5\u898F\u547D\u4EE4\u6216\u5224\u6C7A\u5206\u985E\u3002"})}</div>`;return}let de=K.id==="judgment"?R:A;if(i=K.id,o=null,zt(K.id,{persist:!1,resetReport:!0,databaseId:de}),s)return;let Se=Z(o),Ae=Se?z(Se):null;Se&&Ae&&v==="query"&&!Ae.result&&(Se.id==="postgres"||Se.id==="parquet")&&at(1),M("\u8CC7\u6599\u5EAB catalog \u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(_){if(s)return;a=null,n=[],ye.innerHTML="",W&&(W.innerHTML=Et(null)),qe(),Te.innerHTML=`<div class="sidebar-notice">${Ne({tone:"danger",title:"\u7121\u6CD5\u8B80\u53D6 catalog",text:r(_.message||"\u8ACB\u78BA\u8A8D API \u662F\u5426\u555F\u52D5\u3002")})}
      <button class="btn btn-secondary btn-sm" type="button" id="catalog-retry" style="margin-top:10px">
        ${m("refresh",14)}<span>\u91CD\u8A66</span>
      </button></div>`,k.innerHTML=`<div class="report-empty">${rt({iconName:"server",title:"API \u76EE\u524D\u7121\u6CD5\u9023\u7DDA",text:"\u67E5\u8A62\u5831\u8868\u9700\u8981 FastAPI \u63D0\u4F9B catalog \u8207\u8CC7\u6599\u67E5\u8A62 API\u3002\u8ACB\u78BA\u8A8D judgment-web \u5DF2\u555F\u52D5\u3002"})}</div>`}finally{s||(me.disabled=!1,ke(me,!1))}};Y.addEventListener("change",_=>{let q=_.target;if(q.name==="category"){zt(q.value);return}if(q.name==="database"){Ze(q.value);let K=Z(o),de=K?z(K):null;K&&de&&!de.result&&v==="query"&&(K.id==="postgres"||K.id==="parquet")&&at(1);return}let A=Z(o);if(!A)return;let R=z(A),U=J.querySelector("#data-filter-form");!U||!q.name||(R.values=ua(U,A,R),R.page=1,q.name==="table"&&(H=null,V=null,R.sort=null,R.columnFilters={},R.result=null,J.innerHTML=Lr(A,R),ge(A)))}),Y.addEventListener("input",_=>{let q=_.target.closest("[data-data-fuzzy-search]");if(q){let K=q.closest("[data-data-fuzzy]");I&&window.clearTimeout(I),I=window.setTimeout(()=>{Ht(K,q.value)},160);return}let A=Z(o);if(!A)return;let R=J.querySelector("#data-filter-form");if(!R||!_.target.name||_.target.name==="table")return;let U=z(A);U.values=ua(R,A,U)}),Y.addEventListener("keydown",_=>{let q=_.target.closest("[data-data-fuzzy-search]");if(!q)return;let A=q.closest("[data-data-fuzzy]");if(_.key==="Escape")_.preventDefault(),Mt(A),q.blur();else if(_.key==="Enter"){_.preventDefault();let R=A?.querySelector("[data-action='select-fuzzy-term']");R?R.click():It(q.value)}else _.key==="ArrowDown"&&(_.preventDefault(),A?.querySelector("[data-action='select-fuzzy-term']")?.focus())}),Y.addEventListener("mouseover",_=>{let q=_.target.closest("[data-action='open-fuzzy']");q&&Ut(q.closest("[data-data-fuzzy]"))}),Y.addEventListener("mouseout",_=>{let q=_.target.closest("[data-data-fuzzy]");q&&(_.relatedTarget&&q.contains(_.relatedTarget)||Mt(q))}),Y.addEventListener("submit",_=>{_.target.id==="data-filter-form"&&(_.preventDefault(),at(1))}),Y.addEventListener("click",async _=>{let q=J.querySelector("[data-data-fuzzy] [data-data-fuzzy-popover]:not([hidden])")?.closest("[data-data-fuzzy]");q&&!_.target.closest("[data-data-fuzzy]")&&Mt(q);let A=_.target.closest("[data-action]"),R=A?.dataset.action;if(R==="data-nav"){let U=A.dataset.tab,K=Z(o);if(U==="schema"){if(v!=="schema"){if(K){let $e=z(K),Ie=J.querySelector("#data-filter-form");Ie&&($e.values=ua(Ie,K,$e))}v="schema",K&&At(K)}return}let de=U==="judgment"?"judgment":"law";v==="schema"&&(v="query"),i!==de?zt(de,{databaseId:o,resetReport:!1}):K&&At(K);let Se=Z(o),Ae=Se?z(Se):null;Se&&Ae&&!Ae.result&&(Se.id==="postgres"||Se.id==="parquet")&&at(1);return}if(R==="open-fuzzy"){Ut(A.closest("[data-data-fuzzy]"),{focus:!0});return}if(R==="select-fuzzy-term"){await It(A.dataset.term);return}if(R==="remove-fuzzy-term"){await rs(A.dataset.term);return}if(R==="schema-category"){v="schema",zt(A.dataset.category||"law",{resetReport:!0});return}if(R==="select-schema-table"){let U=Z(o);if(!U)return;j(U,A.dataset.tableId||"");return}if(R==="reset"){let U=Z(o);if(!U)return;H=null,V=null;let K=z(U);l[we(i,U.id)]=da(U,K.pageSize),At(U),ge(U),M("\u5DF2\u91CD\u8A2D\u9019\u500B\u8CC7\u6599\u5EAB\u7684\u67E5\u8A62\u689D\u4EF6\u3002","info",2400);return}_.target.closest("#catalog-retry")&&Bt()}),k.addEventListener("input",_=>{let q=_.target.closest("[data-schema-search]");if(!q)return;let A=O();if(!A)return;let R=q.dataset.schemaSearch||"",U=q.value,K=`${A.mode}:${A.db.id}:${A.tableId}:${R}`,de=L.get(K);if(de&&window.clearTimeout(de),!U.trim()){L.delete(K),X(),x(A,R,"");return}let Se=window.setTimeout(()=>{L.delete(K),De(A,R,U,q)},250);L.set(K,Se)}),k.addEventListener("keydown",_=>{let q=_.target.closest("[data-schema-search]");if(!q)return;let A=O();if(A){if(_.key==="Escape"){X();return}if(_.key==="ArrowDown"||_.key==="ArrowUp"){if(!C||C.hidden)return;_.preventDefault();let R=_.key==="ArrowDown"?1:-1;G(S<0?R>0?0:p.length-1:S+R);return}if(_.key==="Enter"){if(_.preventDefault(),C&&!C.hidden&&S>=0){ce(S);return}x(A,q.dataset.schemaSearch||"",q.value)}}}),C?.addEventListener("mousedown",_=>{_.preventDefault()}),C?.addEventListener("click",_=>{let q=_.target.closest("[data-schema-suggest-index]");q&&ce(Number(q.dataset.schemaSuggestIndex))});let Qt=_=>{_.target.closest("[data-schema-search]")||C?.contains(_.target)||X()};return document.addEventListener("click",Qt),window.addEventListener("scroll",X,{capture:!0,passive:!0}),window.addEventListener("resize",X),k.addEventListener("keydown",_=>{_.target.matches(".law-jump-input")&&_.key==="Enter"&&(_.preventDefault(),Oe(_.target.id))}),k.addEventListener("click",async _=>{let q=_.target.closest("[data-action]");if(!q)return;let A=q.dataset.action,R=Z(o),U=R?z(R):null,K=U?.result;if(A==="back-to-results"){Xe();return}if(A==="open-law"){Ue({lawKey:q.dataset.lawKey||"",sourceType:q.dataset.lawSource||"",lawName:q.dataset.lawName||""});return}if(A==="open-judgment"){Be({jid:q.dataset.jid||""});return}if(A==="jump-article"){Oe(q.dataset.jumpInput||"law-article-jump");return}if(A==="sort-column"){let de=q.dataset.sortKey||"";if(!de||!R)return;if(v==="schema"&&h?.result){let $e=h.sort,Ie=de==="jdate"||de==="law_modified_date"||de==="article_count"||de==="citation_count"||de==="full_text_length"||de==="created_at"||de==="updated_at",Je=$e?.key===de?$e.direction==="asc"?"desc":"asc":Ie?"desc":"asc";j(R,h.tableId,{sort:{key:de,direction:Je},columnFilters:h.columnFilters||{},quiet:!0});return}if(!U)return;let Se=U.sort,Ae=Se?.key===de?Se.direction==="asc"?"desc":"asc":de==="jdate"?"desc":"asc";U.sort={key:de,direction:Ae},at(1,{quiet:!0});return}if(A==="retry"){at(U?.page||1);return}if(K){if(A==="prev-page"){at(Math.max(1,Number(K.page)-1),{quiet:!0});return}if(A==="next-page"){let de=Math.max(1,Math.ceil(Number(K.total)/Number(K.page_size)));at(Math.min(de,Number(K.page)+1),{quiet:!0});return}if(A==="copy-query"){let de=await ms(K.query_text||"");M(de?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",de?"ok":"warn");return}if(A==="export-json"){let de=`${K.database}-${K.table||"query"}-page-${K.page}.json`;Nt(de,JSON.stringify(ba(K),null,2),"application/json;charset=utf-8"),M(`\u5DF2\u532F\u51FA ${de}`,"ok");return}if(A==="export-csv"){let de=`${K.database}-${K.table||"query"}-page-${K.page}.csv`;Nt(de,fa(K),"text/csv;charset=utf-8"),M(`\u5DF2\u532F\u51FA ${de}`,"ok")}}}),k.addEventListener("change",_=>{let q=_.target.closest("[data-action='select-law-version']");if(q&&H){Ue({lawKey:H.lawKey,sourceType:H.sourceType,lawName:H.lawName,versionId:q.value});return}if(!_.target.matches("[data-page-size]"))return;let A=Z(o);if(!A)return;let R=z(A);R.pageSize=Number(_.target.value)||25,R.page=1,ve("data.page_size",R.pageSize),at(1,{quiet:!0})}),me.addEventListener("click",()=>{Bt()}),await Bt(),t&&typeof t.setTitle=="function"&&t.setTitle("\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"),()=>{s=!0,I&&window.clearTimeout(I);for(let _ of L.values())window.clearTimeout(_);L.clear(),X(),document.removeEventListener("click",Qt),window.removeEventListener("scroll",X,{capture:!0}),window.removeEventListener("resize",X)}}var Vr=[10,25,50,100],vl=[{value:"started_at:desc",label:"Timestamp \u65B0 \u2192 \u820A"},{value:"started_at:asc",label:"Timestamp \u820A \u2192 \u65B0"},{value:"duration_ms:desc",label:"\u8017\u6642\u591A \u2192 \u5C11"},{value:"duration_ms:asc",label:"\u8017\u6642\u5C11 \u2192 \u591A"}];function mn(){return{process:"",module:"",status:"",method:"",model:"",keyword:"",from_date:"",to_date:"",min_duration:"",sort:"started_at:desc"}}function hl(e,t=e){return`<option value="${r(e)}">${r(t)}</option>`}function Fs(e,t,s,a,n=""){return`<div class="field">
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
    </div>`}function zr(){let e=document.getElementById("performance-filter-form");if(!e)return mn();let t=new FormData(e);return{process:String(t.get("process")||""),module:String(t.get("module")||""),status:String(t.get("status")||""),method:String(t.get("method")||""),model:String(t.get("model")||""),keyword:String(t.get("keyword")||"").trim(),from_date:String(t.get("from_date")||""),to_date:String(t.get("to_date")||""),min_duration:String(t.get("min_duration")||""),sort:String(t.get("sort")||"started_at:desc")}}function Hr(e){if(e==null)return"null";if(typeof e=="object")try{let t=JSON.stringify(e);return t.length>160?`${t.slice(0,157)}\u2026`:t}catch{return String(e)}return String(e)}function Ur(e){if(!e)return"";let t=new Date(e);if(Number.isNaN(t.getTime()))return"";let s=String(t.getHours()).padStart(2,"0"),a=String(t.getMinutes()).padStart(2,"0"),n=String(t.getSeconds()).padStart(2,"0"),i=String(t.getMilliseconds()).padStart(3,"0");return`${s}:${a}:${n}.${i}`}function yl(e,t){if(!e)return"";let s=new Date(e);return Number.isNaN(s.getTime())?"":new Date(s.getTime()+Math.max(0,Number(t)||0)).toISOString()}var wl=[{key:"parsing",label:"Parsing",hint:"\u8F38\u5165\u9577\u5EA6\u3001\u89E3\u6790\u6642\u9593",names:["rag.parse_question"],color:"#64748b"},{key:"embedding",label:"Embedding",hint:"Model\u3001Token\u3001Batch\u3001\u8017\u6642",names:["rag.embed_query"],color:"#3984c6"},{key:"qdrant",label:"Qdrant Search",hint:"Collection\u3001Filter\u3001Top K\u3001\u8017\u6642",names:["rag.qdrant_search"],color:"#d97706"},{key:"reranker",label:"Reranker",hint:"Model\u3001\u5019\u9078\u7B46\u6578\u3001\u8017\u6642",names:["rag.rerank"],color:"#8b5cf6"},{key:"context",label:"Context",hint:"Chunk \u6578\u3001Token \u6578\u3001\u8017\u6642",names:["rag.context"],fallbackNames:["rag.fetch_documents","rag.build_citations"],color:"#64748b"},{key:"llm",label:"LLM",hint:"Model\u3001Input/Output Token\u3001TTFT\u3001\u8017\u6642",names:["rag.llm_request"],color:"#16a34a"}],ha={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"};function Wr(e){let t=e?.metadata?.rag_response||{},s=String(t.status||e?.metadata?.rag_status||e?.status||"");return s==="operational"||s==="success"?{label:"Completed",tone:"ok"}:s==="retrieval_only"?{label:"Abstain",tone:"warn"}:s==="preview"?{label:"Preview",tone:"info"}:s==="failed"||s==="error"?{label:"Failed",tone:"danger"}:{label:s||"Unknown",tone:"idle"}}function gn(e){let t=Math.max(0,Number(e?.offset_ms)||0),s=Math.max(0,Number(e?.duration_ms)||0),a=Math.max(t,Number(e?.end_offset_ms)||t+s);return{...e,offset:t,end:a,duration:Math.max(s,a-t)}}function Kr(e,t=0){let s=Array.isArray(e?.segments)?[...e.segments].sort((v,$)=>Number(v.offset_ms||0)-Number($.offset_ms||0)):[],a=Math.max(Number(e?.total_ms)||0,Number(t)||0,...s.map(v=>gn(v).end),1),n=wl.map(v=>{let $=s.filter(y=>v.names.includes(y.name));!$.length&&v.fallbackNames&&($=s.filter(y=>v.fallbackNames.includes(y.name)));let h=$.map(gn),f=h.length?Math.min(...h.map(y=>y.offset)):null,p=h.length?Math.max(...h.map(y=>y.end)):null;return{...v,spans:h,start:f,end:p,duration:f===null?null:p-f}});for(let v of n){if(v.key!=="embedding"&&v.key!=="llm")continue;let $=[];for(let p of v.spans){let y=p.metadata||{},S=Number(y.load_duration_ms),N=Number.isFinite(S)&&S>0?S:0,E=Math.max(0,Number(p.duration)||0);$.push({...p,offset:p.offset,end:p.offset+N,duration:N,metadata:{...y,source_stage:v.label,model_load_ms:N,request_duration_ms:E,warm_duration_ms:Math.max(0,E-N),cold_start:N>=100},params:{...p.params||{},source_stage:v.label}})}if(!$.length)continue;let h=$.reduce((p,y)=>p+y.duration,0),f=v.spans.reduce((p,y)=>p+Math.max(0,Number(y.duration)||0),0);v.loadInfo={spans:$,total:h,requestTotal:f,ratio:f>0?Math.min(1,Math.max(0,h/f)):0}}let i=[...n],o=Math.max(0,...i.flatMap(v=>v.spans.map($=>$.end))),l=e?.metadata?.rag_response||{},d=Wr(e),c=Math.min(a,o);return i.push({key:"response",label:"Response",hint:"\u7E3D\u8017\u6642\u3001\u5F15\u7528\u6578\u3001\u6210\u529F\u6216 Abstain",color:"#0f766e",spans:[{offset:c,end:a,duration:Math.max(0,a-c),status:d.tone==="danger"?"error":"ok",metadata:l,params:{},started_at:e?.started_at,finished_at:e?.finished_at}],start:c,end:a,duration:Math.max(0,a-c),responseMetadata:l}),_l(i,a),{total:a,stages:i,response:l,traceStatus:d,requestId:e?.request_id||"",startedAt:e?.started_at,finishedAt:e?.finished_at,client:e?.client||{},models:Array.isArray(e?.summary?.models)?e.summary.models:[],hasLoad:i.some(v=>!!v.loadInfo)}}function _l(e,t){let s=e.reduce((i,o)=>i+Math.max(0,Number(o.duration)||0),0),a=s>0?t/s:1,n=0;for(let i of e){let o=Math.max(0,Number(i.duration)||0)*a;i.displayStart=n,i.displayDuration=o,i.displayEnd=n+o;let l=i.spans[0]||null,d=[],c=!1;if(l){let $=Math.max(0,Number(l.duration)||0),h=i.loadInfo?Math.max(0,Number(i.loadInfo.total)||0):0;if(i.loadInfo&&h>0&&i.spans.length===1&&$>0){let f=Math.min(l.end,l.offset+h),p=Math.max(0,f-l.offset),y=Math.max(0,l.end-f);if(p>0&&y>0){let S=yl(l.started_at,p),N={...l,offset:l.offset,end:f,duration:p,finished_at:S,metadata:{...l.metadata||{},source_stage:i.label,model_load_ms:p,request_duration_ms:$,warm_duration_ms:Math.max(0,$-p),cold_start:p>=100},params:{...l.params||{},source_stage:i.label}},E={...l,offset:f,end:l.end,duration:y,started_at:S,finished_at:l.finished_at};d.push({kind:"load",label:"Model Load",span:N,duration:p}),d.push({kind:"stage",label:`${i.label} \u63A8\u8AD6`,span:E,duration:y}),c=!0}}c||d.push({kind:"stage",label:i.label,span:l,duration:$})}i.detailSegments=d;let v=[];if(l&&o>0)if(c){let[$,h]=d,f=$.duration+h.duration,p=f>0?o*($.duration/f):0,y={...i,key:"model_load",label:`Model Load \xB7 ${i.label}`,spans:[$.span],duration:$.duration},S={...i,label:`${i.label} \u63A8\u8AD6`,spans:[h.span],duration:h.duration};v.push({offset:n,duration:p,color:"#0ea5e9",kind:"load",tip:va(y,$.span)}),v.push({offset:n+p,duration:Math.max(0,o-p),color:i.color,kind:"stage",tip:va(S,h.span,{includeLoad:!1})})}else v.push({offset:n,duration:o,color:i.color,kind:"stage",tip:va(i,l)});i.displaySegments=v,n+=o}}function fn(e,{includeLoad:t=!0}={}){let s=[],a=(v,$)=>{$==null||$===""||s.push([v,String($)])},n=e.spans[0]||null;if(!n)return a("\u72C0\u614B","\u6B64\u7D00\u9304\u6C92\u6709\u9019\u500B span"),s;let i=n.params||{},o=n.metadata||{},l=Yr(n),d=bn(n),c=(v,$)=>{let h=Number(v?.load_duration_ms);if(!Number.isFinite(h))return;let f=Math.max(0,h);a("Model Load",fe(f)),a("\u51B7\u555F\u52D5",f>=100?"\u662F":"\u5426\uFF08\u71B1\u555F\u52D5\uFF09");let p=Math.max(0,Number($)||0);if(p>0){let y=Math.max(0,p-f);a("\u6263\u9664\u8F09\u5165\u5F8C",fe(y)),a("\u8F09\u5165\u5360\u6BD4",`${(f/p*100).toFixed(f/p>=.1?0:1)}%`)}};if(e.key==="response")return a("Trace \u72C0\u614B",e.responseMetadata.status||"\u2014"),a("Answer source",e.responseMetadata.answer_source||"\u2014"),a("Abstain",e.responseMetadata.abstain?"\u662F":"\u5426"),a("\u5F15\u7528\u7E3D\u6578",e.responseMetadata.citation_count??"\u2014"),a("\u5224\u6C7A\uFF0F\u6CD5\u898F\u5F15\u7528",`${e.responseMetadata.judgment_citations??"\u2014"} / ${e.responseMetadata.law_citations??"\u2014"}`),a("\u7E3D\u8017\u6642",fe(e.duration)),s;if(a("\u958B\u59CB",`${Ur(n.started_at)||"\u2014"} \xB7 +${n.offset.toFixed(1)} ms`),a("\u7D50\u675F",`${Ur(n.finished_at)||"\u2014"} \xB7 +${n.end.toFixed(1)} ms`),a("\u8017\u6642",fe(n.duration)),e.key==="parsing")a("\u8F38\u5165\u9577\u5EA6",o.input_length??i.input_length),a("\u6B63\u898F\u5316\u9577\u5EA6",o.normalized_length??i.normalized_length),a("\u79FB\u9664\u7A7A\u767D",o.trimmed_chars);else if(e.key==="embedding")a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.active_base_url||o.base_url),a("Input tokens",o.prompt_eval_count),a("Batch",o.batch),a("\u5411\u91CF\u7DAD\u5EA6",o.dimensions),a("Fallback",o.fallback_used?"\u662F":"\u5426"),t&&c(o,n.duration);else if(e.key==="qdrant")a("Collection",o.collection||i.collection),o.filter&&a("Filter",Hr(o.filter)),a("Top K",o.top_k??i.limit),a("Hits",o.hits),a("Unique judgments",o.unique_judgments),a("Top score",o.top_score);else if(e.key==="reranker")a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.base_url||i.url),a("Rerank \u72C0\u614B",o.status),a("Fallback",o.fallback_used?"\u662F":"\u5426"),a("\u5019\u9078\u7B46\u6578",o.candidates),a("\u9078\u7528\u7B46\u6578",o.selected),a("Top score",o.top_score),Array.isArray(o.errors)&&o.errors.length&&a("\u932F\u8AA4",o.errors.join(" \xB7 "));else if(e.key==="context")a("Chunks",o.chunks),a("\u5224\u6C7A chunks",o.judgment_chunks),a("\u6CD5\u898F chunks",o.law_chunks),a("Token \u4F30\u7B97",o.token_estimate),a("Context \u5B57\u5143",o.context_chars),a("\u6587\u4EF6\u6578",o.documents);else if(e.key==="llm")a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.base_url||i.url),a("Input tokens",o.input_tokens),a("Output tokens",o.output_tokens),a("TTFT",o.ttft_ms===null||o.ttft_ms===void 0?"\u2014":fe(o.ttft_ms)),a("API \u7E3D\u8017\u6642",o.total_duration_ms===null||o.total_duration_ms===void 0?"\u2014":fe(o.total_duration_ms)),t&&c(o,n.duration),a("Strict retry",o.strict?"\u662F":"\u5426");else if(e.key==="model_load"){if(a("Model",d||o.model||i.model),a("\u4E3B\u6A5F",l),a("\u4F86\u6E90\u968E\u6BB5",o.source_stage),a("\u51B7\u555F\u52D5",o.cold_start?"\u662F":"\u5426\uFF08\u71B1\u555F\u52D5\uFF09"),a("\u6A21\u578B\u547C\u53EB\u7E3D\u8017\u6642",o.request_duration_ms===null||o.request_duration_ms===void 0?"\u2014":fe(o.request_duration_ms)),a("\u8F09\u5165\u8017\u6642",o.model_load_ms===null||o.model_load_ms===void 0?"\u2014":fe(o.model_load_ms)),a("\u6263\u9664\u8F09\u5165\u5F8C\u6D41\u7A0B\u6642\u9593",o.warm_duration_ms===null||o.warm_duration_ms===void 0?"\u2014":fe(o.warm_duration_ms)),Number(o.request_duration_ms)>0&&Number(o.model_load_ms)>=0){let v=Number(o.model_load_ms)/Number(o.request_duration_ms)*100;a("\u8F09\u5165\u5360\u6BD4",`${v.toFixed(v>=10?0:1)}%`)}o.eval_duration_ms!==null&&o.eval_duration_ms!==void 0&&a("\u63A8\u8AD6\u8017\u6642",fe(o.eval_duration_ms))}else if(e.key==="segment"||e.key==="test_stage")if(a("Model",d||o.model||i.model),a("\u72C0\u614B",o.status||n.status),e.key==="test_stage")a("\u9032\u5EA6",o.progress===null||o.progress===void 0?"":`${Number(o.progress)||0}%`),n.error&&a("\u932F\u8AA4",n.error);else{n.error&&a("\u932F\u8AA4",n.error);for(let[v,$]of Object.entries(i).slice(0,10))a(v,Hr($))}return e.spans.length>1&&(e.key==="model_load"?a("\u5404\u6A21\u578B\u8F09\u5165",e.spans.map(v=>`${v.metadata?.source_stage||"model"} ${bn(v)} ${fe(v.metadata?.model_load_ms||0)}`).join(" \xB7 ")):(a("Span \u6578",e.spans.length),a("Span \u660E\u7D30",e.spans.map((v,$)=>`#${$+1} +${v.offset.toFixed(0)}ms/${fe(v.duration)}`).join(" \xB7 ")))),n.module&&a("Module",n.module),n.function&&a("Function",n.function),s}function kl(e){let t=String(e||"").trim();if(!t)return"";try{return new URL(t.includes("://")?t:`http://${t}`).hostname||t}catch{return t}}function Yr(e){let t=e?.metadata||{},s=String(t.provider_name||"").trim();if(s)return s;let a=String(t.active_base_url||t.base_url||e?.params?.url||"").trim();return kl(a)}function Sl(e){let t=e?.metadata||{};return String(t.model||e?.params?.model||"").trim()}function bn(e){let t=Yr(e),s=Sl(e);return s?t?`${t}:${s}`:s:""}function xl(e){let t=new Set;for(let s of e?.spans||[]){let a=bn(s);a&&t.add(a)}return[...t]}function va(e,t,s={}){let a=fn({...e,spans:[t]},s);return[String(e.label||""),...a.map(([n,i])=>`${n}: ${i}`)].join(`
`)}function ql(e,t){let s=e.spans||[],a=xl(e),n=Array.isArray(e.displaySegments)?e.displaySegments:null,i=7,o=Math.max(1,Math.min(4,s.length)),l=s.length>1,d=n?12:l?Math.max(12,o*i):12,c=n?n.map(S=>{if(Number(S.duration)<=0)return"";let N=Math.max(0,Math.min(100,S.offset/t*100)),E=Math.min(100-N,S.duration/t*100);return`<span class="rag-wf-bar is-sequential${S.kind==="load"?" is-load":""}" style="left:${N.toFixed(3)}%;width:${E.toFixed(4)}%;top:0;height:12px;--bar-color:${S.color}"
            data-rag-wf-tip="${r(S.tip)}"
            aria-label="${r(S.tip)}" role="img"></span>`}).join(""):s.slice(0,4).map((S,N)=>{if(Number(S.duration)<=0)return"";let E=Math.max(0,Math.min(100,S.offset/t*100)),I=Math.max(.35,Math.min(100-E,S.duration/t*100)),H=l?N*i:0,V=l?6:12,Y=va(e,S);return`<span class="rag-wf-bar" style="left:${E.toFixed(3)}%;width:${I.toFixed(3)}%;top:${H}px;height:${V}px"
            data-rag-wf-tip="${r(Y)}"
            aria-label="${r(Y)}" role="img"></span>`}).join(""),v=Array.isArray(e.detailSegments)?e.detailSegments:[],$=v.length>1?v.map(S=>{let N=S.kind==="load"?{...e,key:"model_load",label:`Model Load \xB7 ${e.label}`,spans:[S.span],duration:S.duration}:{...e,label:`${e.label} \u63A8\u8AD6`,spans:[S.span],duration:S.duration},E=fn(N,{includeLoad:S.kind!=="stage"});return`<div class="rag-wf-detail-group">
              <div class="rag-wf-detail-group-head">
                <strong>${r(S.label)}</strong>
                <span>${r(fe(S.duration))}</span>
              </div>
              <div class="rag-wf-detail-grid">${E.map(([I,H])=>`<span class="rag-wf-detail"><span>${r(I)}</span><strong>${r(H)}</strong></span>`).join("")}</div>
            </div>`}).join(""):"",h=fn(e).map(([S,N])=>`<span class="rag-wf-detail"><span>${r(S)}</span><strong>${r(N)}</strong></span>`).join(""),f=v.length>1?`<div class="rag-wf-details is-split">${$}</div>`:`<div class="rag-wf-details">${h}</div>`,p=s.length?s.some(S=>S.status==="error")?"is-error":"":"is-missing",y=s.length?fe(e.duration):"\u672A\u8A18\u9304";return`<details class="rag-wf-stage ${p}" style="--stage-color:${e.color}">
    <summary class="rag-wf-stage-summary">
      <span class="rag-wf-stage-head">
        <span class="rag-wf-stage-label">
          <i aria-hidden="true"></i>
          <span><strong>${r(e.label)}</strong><small>${r(e.hint)}</small>${a.length?`<small class="rag-wf-model-line">${r(a.join(" \xB7 "))}</small>`:""}</span>
        </span>
        <span class="rag-wf-stage-meta">${y} \xB7 ${s.length?`${s.length} span`:"\u2014"} <span class="rag-wf-chevron">${m("chevronRight",12)}</span></span>
      </span>
      <span class="rag-wf-track" style="height:${d}px">${c}</span>
    </summary>
    ${f}
  </details>`}function Xr(e,t,s=!1){let a=e.response||{},n=e.client||{},i=e.models||[];return`<div class="rag-wf-summary">
      <span>\u7E3D\u8017\u6642 <strong>${r(fe(e.total))}</strong></span>
      <span>Server <strong>${r(fe(t))}</strong></span>
      ${n.total_ms?`<span>Client <strong>${r(fe(n.total_ms))}</strong></span>`:""}
      ${n.render_ms!==void 0?`<span>Render <strong>${r(fe(n.render_ms))}</strong></span>`:""}
      <span>\u5F15\u7528 <strong>${r(String(a.citation_count??"\u2014"))}</strong></span>
      <span>Abstain <strong>${a.abstain?"\u662F":"\u5426"}</strong></span>
      ${i.length?`<span>Model <strong>${r(i.join(" \xB7 "))}</strong></span>`:""}
      ${s?'<span class="rag-wf-updating">\u66F4\u65B0\u4E2D\u2026</span>':""}
    </div>`}function ys(e,t,s="\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\uFF0C\u67E5\u770B\u53C3\u6578\u3001Token\u3001TTFT\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u4F86\u6E90\u6578\u91CF\u3002Waterfall \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u5E73\u884C\u57F7\u884C\u7684 span \u6703\u4F9D\u5BE6\u969B\u6642\u9593\u91CD\u758A\u986F\u793A\u3002",{legend:a=""}={}){return`<div class="rag-wf-axis"><span>0 ms</span><span>${r(fe(t))}</span></div>
    ${a}
    <div class="rag-wf-stages">${(e||[]).map(n=>ql(n,t)).join("")}</div>
    <p class="rag-wf-hint">${r(s)}</p>`}function Zr(e){let t=(e.stages||[]).some(n=>n.loadInfo),s=t?'<div class="rag-wf-legend"><span><i class="is-load"></i>Model Load\uFF08\u968E\u6BB5 bar \u524D\u6BB5\uFF09</span></div>':"",a=t?"\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7D50\u675F\u5F8C\u63A5\u7E8C\u4E0B\u4E00\u968E\u6BB5\uFF1BEmbedding\uFF0FLLM \u7684\u85CD\u8272\u524D\u6BB5\u70BA Model Load\uFF0C\u5F8C\u6BB5\u70BA\u63A8\u8AD6\u3002\u5BE6\u969B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001Token \u8207\u8F09\u5165\u5360\u6BD4\u53EF\u5C55\u958B\u67E5\u770B\u3002":"\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7D50\u675F\u5F8C\u63A5\u7E8C\u4E0B\u4E00\u968E\u6BB5\u3002\u5BE6\u969B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207 Token \u53EF\u5C55\u958B\u67E5\u770B\u3002";return ys(e.stages,e.total,a,{legend:s})}function $a(e,{serverDurationMs:t=0,loading:s=!1,embedded:a=!1}={}){if(!e||typeof e!="object")return"";let n=Kr(e,t),i=n.traceStatus;return`<section class="report-card rag-wf-card${a?" rag-wf-embedded":""}">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${ha[i.tone]||ha.idle}">${r(i.label)}</span>
        </div>
        <div class="report-sub">Trace ID:
          <span class="mono">${r(n.requestId||"\u2014")}</span>
          \xB7 ${r(je(n.startedAt))}
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
  </section>`}var dt=null;function Al(){return dt||(dt=document.createElement("div"),dt.className="rag-wf-tooltip",dt.hidden=!0,document.body.appendChild(dt),dt)}function vn(){dt&&(dt.hidden=!0)}function ei(e){if(!dt||dt.hidden)return;let t=14,s=10,a=dt.getBoundingClientRect(),n=e.clientX+t,i=e.clientY+t;n+a.width>window.innerWidth-s&&(n=e.clientX-a.width-t),i+a.height>window.innerHeight-s&&(i=e.clientY-a.height-t),dt.style.left=`${Math.max(s,n)}px`,dt.style.top=`${Math.max(s,i)}px`}document.addEventListener("pointerover",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=Al(),a=t.dataset.ragWfTip||"";a&&(s.textContent=a,s.hidden=!1,ei(e))});document.addEventListener("pointermove",e=>{if(!(!dt||dt.hidden)){if(!e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]")){vn();return}ei(e)}});document.addEventListener("pointerout",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=e.relatedTarget;s instanceof Node&&t.contains(s)||vn()});window.addEventListener("scroll",vn,{capture:!0,passive:!0});function Ml(e,t,s,a){if(a&&!e.length)return`<div class="report-card rag-wf-card">
      ${Ne({tone:"danger",title:"RAG Pipeline \u8B80\u53D6\u5931\u6557",text:r(a.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-rag-waterfall">${m("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;if(!e.length)return`<div class="report-card rag-wf-card">
      ${rt({iconName:"activity",title:s?"\u8B80\u53D6 RAG Pipeline\u2026":"\u5C1A\u7121 RAG Pipeline \u7D00\u9304",text:s?"\u6B63\u5728\u6574\u7406\u6700\u8FD1\u7684 RAG \u554F\u7B54 Trace\u3002":"\u7522\u751F\u65B0\u7684 RAG \u554F\u7B54\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A Parsing\u3001Embedding\u3001Qdrant\u3001Context\u3001LLM \u8207 Response \u7684 waterfall\u3002"})}
    </div>`;let n=e.find(c=>String(c.id)===String(t))||e[0],i=n.flow&&typeof n.flow=="object"?n.flow:{},o=Kr(i,n.duration_ms),l=o.traceStatus,d=e.map(c=>{let v=Wr(c.flow||{});return`<option value="${r(String(c.id))}" ${String(c.id)===String(n.id)?"selected":""}>#${r(String(c.id))} \xB7 ${r(je(c.started_at))} \xB7 ${r(fe(c.duration_ms))} \xB7 ${r(v.label)}</option>`}).join("");return`<section class="report-card rag-wf-card">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${ha[l.tone]||ha.idle}">${r(l.label)}</span>
        </div>
        <div class="report-sub">Trace ID:
          <span class="mono">${r(o.requestId||n.request_id||"\u2014")}</span>
          \xB7 ${r(je(n.started_at))}
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
  </section>`}function jl(e){let t=Array.isArray(e?.segments)?e.segments:[],s=Array.isArray(e?.models)?e.models:[],a=e?.client||{},n=Math.max(...t.map(l=>Number(l.avg_ms)||0),1),i=a.samples?fe(a.avg_total_ms??0):"\u2014",o=a.samples?fe(a.avg_render_ms??0):"\u2014";return`<div class="perf-flow-stats">
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
                    <span class="perf-model-count">${u(l.value)} \u6B21${l.avg_ms?` \xB7 \u5E73\u5747 ${fe(l.avg_ms)}`:""}</span>
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
                    <span class="perf-seg-ms">${fe(l.avg_ms)}</span>
                  </div>`).join("")}</div>`:'<p class="muted" style="font-size:11px">\u5C1A\u7121\u5340\u6BB5\u8017\u6642\uFF1B\u9700\u6709\u542B flow \u7684\u65B0\u7D00\u9304\u3002</p>'}
      </div>
    </div>
  </div>`}function it(e){let t=Math.max(0,Number(e)||0);if(!t)return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;let s=Math.round(t/1e3),a=Math.floor(s/3600),n=Math.floor(s%3600/60),i=s%60;return a?`${a}h ${String(n).padStart(2,"0")}m ${String(i).padStart(2,"0")}s`:n?`${n}m ${String(i).padStart(2,"0")}s`:`${(t/1e3).toFixed(1)}s`}function ti(e){let t=String(e?.task||"").trim();return t?t==="auto"?"\u81EA\u52D5\u63A5\u7E8C":`task ${t}`:"\u7D22\u5F15"}function Ll(e){let t=(e||[]).slice(-12);if(!t.length)return'<p class="muted" style="font-size:11px">\u5C1A\u7121\u7D22\u5F15\u7D00\u9304\u3002</p>';let s=Math.max(...t.map(a=>Number(a.points_per_second)||0),.1);return`<div class="index-run-bars">${t.map(a=>{let n=Number(a.points_per_second)||0,i=Math.max(2,n/s*100);return`<div class="index-run-row">
        <div class="index-run-label">
          <strong>${r(ti(a))}</strong>
          <span>${r(je(a.started_at))}</span>
        </div>
        <div class="index-run-track" title="${r(`${u(a.indexed_count)} \u7B46 \xB7 ${it(a.duration_ms)} \xB7 ${u(a.batch_count)} \u6279`)}">
          <span style="width:${i.toFixed(1)}%"></span>
        </div>
        <div class="index-run-value">
          <strong>${n.toFixed(1)}</strong><span>\u7B46/\u79D2</span>
          <em>${u(a.indexed_count)} \u7B46 \xB7 ${it(a.duration_ms)}</em>
        </div>
      </div>`}).join("")}</div>`}function Tl(e){let t=(Array.isArray(e.time_breakdown)?e.time_breakdown:[]).map(s=>({...s,ms:Number(s.ms)||0,percent:Number(s.percent)||0})).filter(s=>s.ms>0);return t.length?`<div class="index-breakdown-bar">${t.map(s=>`<span class="index-seg index-seg-${r(s.key)}" style="width:${Math.max(.5,s.percent).toFixed(2)}%" title="${r(`${s.label} ${it(s.ms)}\uFF08${s.percent.toFixed(1)}%\uFF09`)}"></span>`).join("")}</div>
    <div class="index-breakdown-legend">${t.map(s=>`<span class="index-legend-item">
            <i class="index-seg index-seg-${r(s.key)}"></i>
            <span>${r(s.label)}</span>
            <strong>${it(s.ms)}</strong>
            <em>${s.percent.toFixed(1)}%</em>
          </span>`).join("")}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B\u968E\u6BB5\u8A08\u6642\uFF1B\u5F8C\u7E8C\u7D22\u5F15\u6703\u8A18\u9304 Ollama Embedding\u3001Qdrant Upsert \u8207 PostgreSQL \u7D22\u5F15\u7D00\u9304\u7684\u6642\u9593\u7D44\u6210\u3002</div>'}function Nl(e,t){let s=(Array.isArray(e)?e:[]).map(N=>({elapsed:Math.max(0,Number(N.elapsed_s)||0),indexed:Math.max(0,Number(N.indexed)||0)})).filter(N=>N.indexed>0);if(s.length<2)return"";let a=Math.max(...s.map(N=>N.elapsed),(Number(t)||0)/1e3,1),n=Math.max(...s.map(N=>N.indexed),1),i=760,o=150,l=12,d=12,c=i-l*2,v=o-d*2,$=s.map(N=>[l+N.elapsed/a*c,o-d-N.indexed/n*v]),h=$.map(([N,E],I)=>`${I===0?"M":"L"}${N.toFixed(1)},${E.toFixed(1)}`).join(" "),f=`${h} L${$[$.length-1][0].toFixed(1)},${o-d} L${$[0][0].toFixed(1)},${o-d} Z`,p=Math.max(1,Math.ceil($.length/14)),y=$.map(([N,E],I)=>I%p===0||I===$.length-1?`<circle cx="${N.toFixed(1)}" cy="${E.toFixed(1)}" r="2.6" />`:"").join(""),S=[0,1,2,3].map(N=>{let E=d+v/3*N;return`<line x1="${l}" y1="${E.toFixed(1)}" x2="${i-l}" y2="${E.toFixed(1)}" class="index-chart-grid" />`}).join("");return`<div class="index-chart-card index-progress-card">
    <div class="index-chart-head">
      <span>\u672C\u6B21\u7D22\u5F15\u9032\u5EA6</span>
      <span>${u(n)} \u7B46 \xB7 ${it(a*1e3)}</span>
    </div>
    <svg class="index-progress-svg" viewBox="0 0 ${i} ${o}" role="img" aria-label="\u7D22\u5F15\u9032\u5EA6\u6298\u7DDA\u5716">
      ${S}
      <path d="${f}" class="index-progress-area"></path>
      <path d="${h}" class="index-progress-line"></path>
      ${y}
      <line x1="${l}" y1="${o-d}" x2="${i-l}" y2="${o-d}" class="index-chart-axis"></line>
      <line x1="${l}" y1="${d}" x2="${l}" y2="${o-d}" class="index-chart-axis"></line>
    </svg>
    <div class="index-progress-labels">
      <span>0</span>
      <span>${it(a*500)}</span>
      <span>${it(a*1e3)}</span>
    </div>
  </div>`}function El(e){if(!e||!e.latest)return"";let t=e.latest,s=Array.isArray(e.runs)?e.runs:[],a=e.average||{},n=t.coverage||{},i=n.total_judgments>0?`${u(n.indexed_judgments)} / ${u(n.total_judgments)}\uFF08${(100*n.indexed_judgments/n.total_judgments).toFixed(1)}%\uFF09`:"\u2014",o=[{label:"\u7576\u6B21\u57F7\u884C\u7B46\u6578",value:u(t.indexed_count),note:`${u(t.batch_count)} \u6279 \xD7 ${u(t.batch_size)} \u7B46`},{label:"\u5E73\u5747\u6BCF\u79D2\u7B46\u6578",value:`${(Number(t.points_per_second)||0).toFixed(1)}`,note:"\u7B46/\u79D2"},{label:"\u7576\u6B21\u4F7F\u7528\u6642\u9593",value:it(t.duration_ms),note:`${u(t.scanned_count)} \u7B46\u5DF2\u6383\u63CF`},{label:"\u5E73\u5747\u6BCF\u6279\u6642\u9593",value:it(t.batch_avg_ms),note:t.batch_min_ms||t.batch_max_ms?`\u6700\u5FEB ${it(t.batch_min_ms)} \xB7 \u6700\u6162 ${it(t.batch_max_ms)}`:"\u4EE5\u7E3D\u8017\u6642 \xF7 \u6279\u6578\u8A08\u7B97"}];return`<section class="index-perf-panel">
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
      <span><strong>\u6700\u8FD1\u4E00\u6B21</strong> ${r(je(t.started_at))}</span>
      <span><strong>batch</strong> ${u(t.batch_size)} \u7B46\uFF0F\u6279</span>
      <span><strong>embedding \u4E0A\u9650</strong> ${t.max_chars?`${u(t.max_chars)} \u5B57`:"\u2014"}</span>
      <span><strong>collection</strong> ${u(t.collection_points)} points</span>
      <span><strong>\u8986\u84CB\u7387</strong> ${r(i)}</span>
      <span><strong>\u5E73\u5747\u6BCF\u6B21\u57F7\u884C</strong> ${it(a.duration_ms)} \xB7 ${(Number(a.points_per_second)||0).toFixed(1)} \u7B46/\u79D2</span>
    </div>
    <div class="index-charts">
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u8FD1\u7D22\u5F15\u541E\u5410</span>
          <span>\u7B46/\u79D2</span>
        </div>
        ${Ll(s)}
      </div>
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u65B0\u4E00\u6B21\u6642\u9593\u7D44\u6210</span>
          <span>${it(t.duration_ms)}</span>
        </div>
        ${Tl(t)}
      </div>
    </div>
    ${Nl(t.progress,t.duration_ms)}
  </section>`}var Qr=["#22d3ee","#a78bfa","#f59e0b","#ec4899","#3b82f6","#10b981","#f97316","#8b5cf6","#64748b"];function Gr(e){let t=String(e?.host||e?.url||"").trim(),s=e?.port?`:${e.port}`:"";return`${t||"\u2014"}${s}`}function Cl(e,t,s,a){if(a&&!e)return`<div class="report-card rag-wf-card">
      ${Ne({tone:"danger",title:"\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline \u8B80\u53D6\u5931\u6557",text:r(a.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-index-pipeline">${m("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;let n=Array.isArray(e?.runs)?e.runs:[];if(!n.length)return`<div class="report-card rag-wf-card">
      ${rt({iconName:"layers",title:s?"\u8B80\u53D6\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline\u2026":"\u5C1A\u7121\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline \u7D00\u9304",text:s?"\u6B63\u5728\u6574\u7406\u6700\u8FD1\u7684\u7248\u672C\u5316\u7D22\u5F15\u7D00\u9304\u3002":"\u57F7\u884C\u300CQdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u300D\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A host/model\u3001Blue-Green collection \u8207\u5404\u968E\u6BB5\u8017\u6642\u3002"})}
    </div>`;let i=n.find(E=>String(E.id)===String(t))||e?.latest||n[n.length-1],o=i?.pipeline&&typeof i.pipeline=="object"?i.pipeline:null,d=[...n].reverse().map(E=>{let I=Number(E.pipeline?.version_id||E.version_id||0),H=I?`v${String(I).padStart(3,"0")}`:"\u7D22\u5F15";return`<option value="${r(String(E.id))}" ${String(E.id)===String(i.id)?"selected":""}>${r(`${je(E.started_at)} \xB7 ${H} \xB7 ${it(E.duration_ms)}`)}</option>`}).join(""),c=Number(o?.version_id||i.version_id||0),v=c?`v${String(c).padStart(3,"0")}`:"\u2014",$=o?.host||{},h=Gr($),f=o?.model||i.model||"\u2014",p=Number(o?.total_ms)||Number(i.duration_ms)||0,y=Array.isArray(o?.stages)?o.stages:[],S=y.map((E,I)=>({...E,ms:Math.max(0,Number(E.duration_ms)||0),color:Qr[I%Qr.length]})).filter(E=>E.ms>0).map(E=>`<span class="index-pipeline-seg" style="width:${(E.ms/Math.max(1,p)*100).toFixed(2)}%;background:${r(E.color)}" title="${r(`${E.label} ${it(E.ms)}`)}"></span>`).join(""),N=y.map((E,I)=>{let H=Math.max(0,Number(E.duration_ms)||0),V=p>0?H/p*100:0,Y=E.host&&typeof E.host=="object"?E.host:null;return`<div class="index-pipeline-row">
        <span class="index-pipeline-step">${String(I+1).padStart(2,"0")}</span>
        <div class="index-pipeline-copy">
          <div class="index-pipeline-title">
            <strong>${r(E.label||E.key||"\u968E\u6BB5")}</strong>
            ${He(E.status||"success")}
          </div>
          <span class="index-pipeline-detail">${r(E.detail||"\u2014")}</span>
          ${Y?`<span class="index-pipeline-host">${m("server",12)} ${r(Gr(Y))} \xB7 ${r(E.model||f)}</span>`:""}
        </div>
        <div class="index-pipeline-time">
          <strong>${it(H)}</strong>
          <span>${V.toFixed(1)}%</span>
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
            <span><strong>Model</strong> ${r(String(f))}</span>
            <span><strong>\u7E3D\u8017\u6642</strong> ${it(p)}</span>
          </div>
          <div class="index-pipeline-bar">${S}</div>
          <div class="index-pipeline-list">${N}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B Pipeline \u968E\u6BB5\u8CC7\u6599\uFF1B\u4E0B\u4E00\u6B21 Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u6703\u8A18\u9304 host/model \u8207\u5404\u968E\u6BB5\u8017\u6642\u3002</div>'}
  </section>`}function Rl(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,n=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
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
  </div>`}function Pl(e){let t=String(e?.module||"");return t.includes("static")||t.includes("frontend")?"#65a30d":t.includes("judgment.rag")?"#8b5cf6":t.includes("judgment.web.app")?"#3b82f6":t.includes("judgment.web.query")?"#d97706":t.includes("judgment.judgment_index")?"#0d9488":"#64748b"}function Il(e){let t=gn(e),s=Math.max(0,Math.min(8,Number(e.depth)||0));return{key:"segment",label:`${"\u203A ".repeat(s)}${e.name||"unnamed"}`,hint:[e.module||"\u2014",e.function||"\u2014"].join(" \xB7 "),color:Pl(e),spans:[{...t,status:e.status||"ok",error:e.error,metadata:e.metadata||{},params:e.params||{},started_at:e.started_at,finished_at:e.finished_at}],start:t.offset,end:t.end,duration:t.duration}}function ya(e){return(e||[]).map(Il)}function Bl(e,t){let s=e.flow&&typeof e.flow=="object"?e.flow:null,a=Array.isArray(s?.segments)?[...s.segments].sort((h,f)=>Number(h.seq)-Number(f.seq)):[],n=s?.summary||{},i=Array.isArray(n.models)?n.models:[],o=s?.client||{},l=s?.metadata||{},d=l.question||"",c=l.answer||"",v=d||c?`<div class="perf-flow-qa">
          ${d?`<div class="perf-flow-qa-row"><strong>RAG \u554F\u984C</strong><span>${r(d)}</span></div>`:""}
          ${c?`<div class="perf-flow-qa-row"><strong>RAG \u7B54\u6848</strong><span>${r(c)}</span></div>`:""}
        </div>`:"",$=Math.max(Number(s?.total_ms)||0,Number(e.duration_ms)||0,...a.map(h=>(Number(h.offset_ms)||0)+(Number(h.duration_ms)||0)),1);return`<details class="perf-record" ${t===0?"open":""}>
    <summary class="perf-record-summary">
      <span class="perf-record-id">#${r(String(e.id))}</span>
      <span class="perf-record-main">
        <span class="perf-record-title">${r(e.process||"\u672A\u547D\u540D")}</span>
        <span class="perf-record-path mono">${r(e.method||"")} ${r(e.path||"")}</span>
      </span>
      <span class="perf-record-time">${je(e.started_at)}</span>
      <span class="perf-record-duration">${fe(e.duration_ms)}</span>
      ${He(e.status)}
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
      ${v}
      ${i.length?`<div class="chips perf-record-models">${i.map(h=>`<span class="chip">${r(h)}</span>`).join("")}</div>`:""}
      ${a.length?ys(ya(a),$,"\u6B64 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B segment \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u53C3\u6578\u3001module\uFF0Ffunction\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u932F\u8AA4\u3002"):`<div class="perf-no-flow">\u6B64\u7D00\u9304\u6C92\u6709 flow \u660E\u7D30\uFF08\u53EF\u80FD\u662F\u820A\u8CC7\u6599\u6216 CLI \u7D00\u9304\uFF09\u3002${e.params_text&&e.params_text!=="{}"?`<pre>${r(e.params_text)}</pre>`:""}</div>`}
      ${s?`<details class="flow-json">
              <summary>Flow JSON \xB7 ${a.length} \u6BB5</summary>
              <pre>${r(JSON.stringify(s,null,2))}</pre>
            </details>`:""}
    </div>
  </details>`}var Jr={embedding:"Embedding",retrieval:"Qdrant \u6AA2\u7D22",context:"PostgreSQL \u53D6\u6587",llm:"LLM \u751F\u6210",validation:"\u5F15\u7528\u9A57\u8B49"};function Ol(e){return{pending:"\u7B49\u5F85",running:"\u57F7\u884C\u4E2D",success:"\u5B8C\u6210",partial:"\u90E8\u5206\u6210\u529F",failed:"\u5931\u6557",skipped:"\u7565\u904E"}[e]||e||"\u672A\u77E5"}var Dl={embedding:"#3984c6",retrieval:"#d97706",context:"#64748b",llm:"#16a34a",validation:"#8b5cf6"};function Fl(e,t){let s=Date.parse(e.started_at||""),a=Date.now(),n=Array.isArray(e.stage_order)?[...e.stage_order]:Object.keys(Jr);for(let c of t)c.stage&&!n.includes(c.stage)&&n.push(c.stage);let i=[],o=0;for(let c of n){let v=t.filter(f=>f.stage===c);if(!v.length)continue;let $=v.map(f=>{let p=Date.parse(f.started_at||""),y=Number.isFinite(s)&&Number.isFinite(p)?Math.max(0,p-s):0,S=Math.max(0,Number(f.duration_ms)||0);f.status==="running"&&Number.isFinite(p)&&(S=Math.max(S,a-p));let N=y+S;return o=Math.max(o,N),{offset:y,end:N,duration:S,status:f.status==="failed"?"error":f.status==="running"?"running":"ok",started_at:f.started_at,finished_at:f.finished_at,error:f.error_message,metadata:{...f.details||{},model:f.model,status:f.status,progress:Number(f.progress)||0,module:f.module,function:f.function},params:{model:f.model}}}),h=$.reduce((f,p)=>f+p.duration,0);i.push({key:"test_stage",label:Jr[c]||c,hint:`${$.length} \u500B\u7A0B\u5E8F`,color:Dl[c]||"#64748b",spans:$,start:$.length?Math.min(...$.map(f=>f.offset)):null,end:$.length?Math.max(...$.map(f=>f.end)):null,duration:h})}let l=e.status==="running"&&Number.isFinite(s)?Math.max(0,a-s):0,d=Math.max(Number(e.total_ms)||0,l,o,1);return{stages:i,total:d}}function ws(e,t,s,a={}){let n=a.showHistory!==!1,i=[`<option value="" ${s?"":"selected"}>\u76EE\u524D\uFF0F\u6700\u65B0\u6E2C\u8A66</option>`,...(t||[]).map(y=>`<option value="${r(y.run_id)}" ${y.run_id===s?"selected":""}>${r(Ol(y.status))} \xB7 ${r((y.question||"\u672A\u547D\u540D").slice(0,28))} \xB7 ${r(je(y.started_at))}</option>`)].join(""),o=n?`<label class="test-flow-select-label">\u6B77\u53F2
        <select class="select" id="test-run-select">${i}</select>
      </label>
      <button class="btn btn-secondary btn-sm" type="button" id="test-flow-refresh">
        ${m("refresh",13)}<span>\u66F4\u65B0</span>
      </button>`:`<a class="btn btn-secondary btn-sm" href="#/performance">
        ${m("activity",13)}<span>\u6B77\u53F2 Flow</span>
      </a>`,l=`<div class="test-flow-head">
    <div class="test-flow-heading">
      <div class="eyebrow">PERFORMANCE TEST FLOW</div>
      <div class="test-flow-title">\u6E2C\u8A66\u6D41\u7A0B ${e?He(e.status):""}</div>
      <div class="test-flow-question">${e?r(e.question||"\u672A\u547D\u540D\u6E2C\u8A66"):"\u5C1A\u7121\u6E2C\u8A66\u6D41\u7A0B\u3002\u8ACB\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u4E26\u5728 RAG \u9801\u63D0\u554F\u3002"}</div>
    </div>
    <div class="test-flow-actions">${o}</div>
  </div>`;if(!e)return`<div class="test-flow-panel card">${l}
      ${rt({iconName:"activity",title:"\u7B49\u5F85\u6E2C\u8A66\u6D41\u7A0B",text:"\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C\u6240\u6709\u53EF\u7528\u6A21\u578B\uFF0C\u4E26\u5728\u9019\u88E1\u5373\u6642\u986F\u793A\u6BCF\u500B\u968E\u6BB5\u7684\u9032\u5EA6\u3002"})}
    </div>`;let d=Array.isArray(e.steps)?e.steps:[],c=Fl(e,d),v=e.models||{},$=e.status==="running"?`${fe(c.total)}\uFF08\u4F30\u7B97\uFF09`:fe(e.total_ms),h=d.find(y=>y.stage==="llm"&&y.model===e.summary?.primary_model)||d.find(y=>y.stage==="llm"&&y.details?.answer_preview),f=e.answer||h?.details?.answer_preview||"",p=`<div class="test-flow-answer">
    <div class="test-flow-answer-head">
      <span>RAG \u5F15\u64CE\u7B54\u6848</span>
      ${e.summary?.primary_model?`<span class="mono">${r(e.summary.primary_model)}</span>`:""}
    </div>
    <p>${f?r(f):e.status==="running"?"\u6E2C\u8A66\u9032\u884C\u4E2D\uFF0C\u5C1A\u672A\u7522\u751F\u6700\u7D42\u7B54\u6848\u3002":"\u6B64\u6E2C\u8A66\u6C92\u6709\u4FDD\u5B58\u53EF\u986F\u793A\u7684\u7B54\u6848\u3002"}</p>
  </div>`;return`<div class="test-flow-panel card">
    ${l}
    <div class="test-flow-meta">
      <span><strong>Run</strong> <span class="mono">${r(e.run_id)}</span></span>
      <span><strong>\u958B\u59CB</strong> ${r(je(e.started_at))}</span>
      <span><strong>\u7E3D\u8017\u6642</strong> ${$}</span>
      <span><strong>Embedding</strong> ${Array.isArray(v.embedding)?v.embedding.length:0} \u500B</span>
      <span><strong>LLM</strong> ${Array.isArray(v.llm)?v.llm.length:0} \u500B</span>
      <span><strong>\u968E\u6BB5</strong> ${r(e.stage_label||e.stage||"\u2014")}</span>
    </div>
    ${p}
    ${c.stages.length?ys(c.stages,c.total,"\u6E2C\u8A66 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B\u7A0B\u5E8F\u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u6A21\u578B\u3001\u72C0\u614B\u3001\u9032\u5EA6\u3001module\uFF0Ffunction \u8207\u932F\u8AA4\u3002"):'<p class="muted">\u6B64\u6E2C\u8A66\u6C92\u6709\u5340\u6BB5\u8CC7\u6599\u3002</p>'}
    <div class="test-flow-foot">
      <span>${e.status==="running"?"\u6E2C\u8A66\u57F7\u884C\u4E2D\uFF1B\u6B64\u5716\u8868\u6703\u81EA\u52D5\u66F4\u65B0\u3002":n?"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u5F9E\u4E0A\u65B9\u300C\u6B77\u53F2\u300D\u9078\u55AE\u9084\u539F\u5176\u4ED6 Flow\u3002":"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u81F3\u6548\u80FD\u5831\u8868\u67E5\u770B\u6B77\u53F2 Flow\u3002"}</span>
      ${e.summary?.primary_model?`<span class="mono">primary=${r(e.summary.primary_model)}</span>`:""}
    </div>
  </div>`}function zl(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.summary)?e.summary:[],a=e.flow_stats||e.meta?.flow_stats||{},n=e.index_stats||null;return`<div class="report-card performance-flow-report" data-database="performance">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">PERFORMANCE FLOW REPORT</div>
        <div class="report-title">
          \u6548\u80FD\u5831\u8868 ${He(e.status||"ok")}
          <span class="chip">performance_records</span>
        </div>
        <div class="report-sub">
          ${u(e.total)} \u7B46\u7B26\u5408 \xB7 ${fe(e.duration_ms)} \xB7
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
    ${jl(a)}
    <div class="report-section-head perf-flow-list-head">
      <span class="report-section-title">Flow \u7D00\u9304</span>
      <span class="muted" style="font-size:9.5px">\u9EDE\u64CA\u5217\u5C55\u958B\u6A21\u7D44\u3001\u51FD\u6578\u3001\u53C3\u6578\u8207\u5340\u6BB5\u8017\u6642</span>
    </div>
    <div class="perf-record-list">
      ${t.length?t.map((i,o)=>Bl(i,o)).join(""):rt({iconName:"activity",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684 Flow",text:"\u653E\u5BEC\u65E5\u671F\u3001\u6A21\u578B\u6216\u8017\u6642\u689D\u4EF6\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}
    </div>
    ${Rl(e)}
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
  </div>`}async function Hl(e,t){let s=!1,a=mn(),n={processes:[],modules:[],statuses:[],methods:[],models:[]},i=1,o=25,l=null,d=[],c="",v=!1,$=null,h=!1,f=null,p="",y=!1,S=null,N=!1;e.innerHTML=`<section class="page data-page performance-page">
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
  </section>`;let E=e.querySelector("#performance-filter-fields"),I=e.querySelector("#performance-filter-form"),H=e.querySelector("#performance-test-flow"),V=e.querySelector("#performance-report"),Y=e.querySelector("#performance-panel-pipeline"),ye=e.querySelector("#performance-panel-index-pipeline"),Te=e.querySelector("#performance-meta"),J=e.querySelector("#performance-refresh"),B=[...e.querySelectorAll("[data-performance-tab]")],k={overview:e.querySelector("#performance-panel-overview"),pipeline:e.querySelector("#performance-panel-pipeline"),"index-pipeline":e.querySelector("#performance-panel-index-pipeline"),benchmark:e.querySelector("#performance-panel-benchmark")},C="overview",ne=x=>{C=x;for(let L of B){let X=L.dataset.performanceTab===x;L.classList.toggle("is-active",X),X?L.setAttribute("aria-current","page"):L.removeAttribute("aria-current")}for(let[L,X]of Object.entries(k))X&&(X.hidden=L!==x);x==="benchmark"?Te.textContent="BENCHMARK \xB7 RAG":x==="pipeline"?Te.textContent="PERFORMANCE \xB7 RAG WATERFALL":x==="index-pipeline"?Te.textContent="PERFORMANCE \xB7 INDEX PIPELINE":l&&(Te.textContent=`PERFORMANCE \xB7 ${u(l.total)} \u7B46`)},me=Mr(e,{onNavigate:x=>ne(x)}),W=()=>{Y&&(Y.innerHTML=Ml(d,c,v,$))},ee=async({force:x=!1}={})=>{if(!(s||v)){if(h&&!x){W();return}v=!0,d.length||W();try{let L=await Q.performance({keyword:"/api/rag"},1,50);if(s)return;let X=(Array.isArray(L.rows)?L.rows:[]).filter(F=>F.flow&&(String(F.path||"").includes("/api/rag")||String(F.process||"").includes("RAG")));d=X,(!c||!X.some(F=>String(F.id)===String(c)))&&(c=X[0]?String(X[0].id):""),$=null,h=!0}catch(L){if(s)return;$=L}finally{s||(v=!1,W())}}},ae=()=>{ye&&(ye.innerHTML=Cl(f,p,y,S))},Z=async({force:x=!1}={})=>{if(!(s||y)){if(N&&!x){ae();return}y=!0,f||ae();try{let L=await Q.performance({},1,1);if(s)return;f=L.index_pipeline||L.index_stats||null;let X=Array.isArray(f?.runs)?f.runs:[];(!p||!X.some(F=>String(F.id)===String(p)))&&(p=f?.latest?String(f.latest.id):""),S=null,N=!0}catch(L){if(s)return;S=L}finally{s||(y=!1,ae())}}},we=x=>{ne(x),x==="benchmark"&&me.show(),x==="pipeline"&&ee(),x==="index-pipeline"&&Z()};e.addEventListener("click",x=>{let L=x.target.closest("[data-performance-tab]");L&&we(L.dataset.performanceTab||"overview")}),Y?.addEventListener("change",x=>{x.target.matches("[data-rag-trace-select]")&&(c=String(x.target.value||""),W())}),Y?.addEventListener("click",x=>{x.target.closest('[data-action="refresh-rag-waterfall"]')&&ee({force:!0})}),ye?.addEventListener("change",x=>{x.target.matches("[data-index-pipeline-select]")&&(p=String(x.target.value||""),ae())}),ye?.addEventListener("click",x=>{x.target.closest('[data-action="refresh-index-pipeline"]')&&Z({force:!0})});let z=null,ve=[],qe="",ge=null,Xe="",Oe=()=>{E.innerHTML=$l(n,a)},Ue=()=>{let x=JSON.stringify({selected:qe,tick:z?.status==="running"?Math.floor(Date.now()/1e3):0,runs:ve.map(L=>`${L.run_id}:${L.status}`),run:z?{run_id:z.run_id,status:z.status,progress:z.progress,total_ms:z.total_ms,steps:(z.steps||[]).map(L=>`${L.stage}:${L.model}:${L.status}:${L.progress}:${L.duration_ms}`)}:null});x!==Xe&&(Xe=x,H.innerHTML=ws(z,ve,qe))},Be=async()=>{try{let x=await Q.testRuns(30);if(s)return;ve=Array.isArray(x.runs)?x.runs:[]}catch{if(s)return;ve=[]}},Qe=async(x=null)=>{try{let L=x&&!qe?x:qe?await Q.testRun(qe):await Q.testRunCurrent();if(s)return;z=L.run||null,!qe&&z&&z.status!=="running"&&!ve.some(X=>X.run_id===z.run_id)&&await Be(),Ue()}catch{if(s)return;z=null,Ue()}},Ge=async(x=null)=>{s||qe||await Qe(x)},mt=()=>{s||ge||(ge=vt("test-runs",(x,L)=>Ge(L?.snapshot||null)))};H.addEventListener("change",async x=>{x.target.id==="test-run-select"&&(qe=String(x.target.value||""),await Qe())}),H.addEventListener("click",async x=>{x.target.closest("#test-flow-refresh")&&(qe="",await Be(),await Qe())});let j=async(x=i,{quiet:L=!1}={})=>{i=Math.max(1,Number(x)||1),a=zr();let X=V.querySelector(".report-card"),F=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!X?V.setAttribute("aria-busy","true"):(V.removeAttribute("aria-busy"),V.innerHTML=Ds({label:"\u6548\u80FD\u5831\u8868"}));let G=e.querySelector("#performance-run");L||ke(G,!0,"\u67E5\u8A62\u4E2D\u2026");try{let ce=await Q.performance(a,i,o);if(s)return;if(l=ce,ce.index_pipeline){f=ce.index_pipeline;let De=Array.isArray(f.runs)?f.runs:[];(!p||!De.some(We=>String(We.id)===String(p)))&&(p=f.latest?String(f.latest.id):""),N=!0,S=null}if(i=Number(ce.page)||i,o=Number(ce.page_size)||o,V.removeAttribute("aria-busy"),V.innerHTML=zl(ce),F!==null){let De=V.querySelector("[data-page-size]");De&&(De.value=String(o),De.focus({preventScroll:!0}))}Te.textContent=`PERFORMANCE \xB7 ${u(ce.total)} \u7B46`,Te.className="badge badge-neutral badge-mono"}catch(ce){if(s)return;V.removeAttribute("aria-busy"),V.innerHTML=ga(ce,{label:"\u6548\u80FD\u5831\u8868"}),M(ce.message||"\u6548\u80FD\u5831\u8868\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{s||ke(G,!1)}},O=async()=>{try{n=await Q.performanceOptions()}catch{n={processes:[],modules:[],statuses:[],methods:[],models:[]}}Oe()};return I.addEventListener("submit",x=>{x.preventDefault(),j(1)}),e.querySelector('[data-action="reset"]').addEventListener("click",()=>{a=mn(),i=1,Oe(),j(1)}),J.addEventListener("click",async()=>{if(C==="pipeline"){ke(J,!0,"\u6574\u7406\u4E2D\u2026");try{await ee({force:!0})}finally{s||ke(J,!1)}return}if(C==="index-pipeline"){ke(J,!0,"\u6574\u7406\u4E2D\u2026");try{await Z({force:!0})}finally{s||ke(J,!1)}return}if(C==="benchmark"){ke(J,!0,"\u6574\u7406\u4E2D\u2026");try{await me.refresh()}finally{s||ke(J,!1)}return}a=zr(),J.disabled=!0,ke(J,!0,"\u6574\u7406\u4E2D\u2026"),await O(),await Be(),s||await Qe(),s||await j(1),s||(J.disabled=!1,ke(J,!1))}),V.addEventListener("click",async x=>{let L=x.target.closest("[data-action]");if(!L||!l)return;let X=L.dataset.action;if(X==="retry"){j(i);return}if(X==="prev-page"){j(Math.max(1,Number(l.page)-1),{quiet:!0});return}if(X==="next-page"){let F=Math.max(1,Math.ceil(Number(l.total)/Number(l.page_size)));j(Math.min(F,Number(l.page)+1),{quiet:!0});return}if(X==="copy-query"){let F=await ms(l.query_text||"");M(F?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",F?"ok":"warn");return}if(X==="export-json"){let F=`performance-page-${l.page}.json`;Nt(F,JSON.stringify(ba(l),null,2),"application/json;charset=utf-8"),M(`\u5DF2\u532F\u51FA ${F}`,"ok");return}if(X==="export-csv"){let F=`performance-page-${l.page}.csv`;Nt(F,fa(l),"text/csv;charset=utf-8"),M(`\u5DF2\u532F\u51FA ${F}`,"ok")}}),V.addEventListener("change",x=>{x.target.matches("[data-page-size]")&&(o=Number(x.target.value)||25,Vr.includes(o)||(o=25),j(1,{quiet:!0}))}),await Promise.allSettled([O(),Be()]),s||(await Qe(),await j(1),mt()),t&&typeof t.setTitle=="function"&&t.setTitle("\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"),()=>{s=!0,ge&&ge(),me.destroy()}}var Ul=["\u91D1\u878D\u6D88\u8CBB\u8005\u4FDD\u8B77\u6CD5\u5982\u4F55\u8655\u7406\u91D1\u878D\u6D88\u8CBB\u722D\u8B70\uFF1F","\u8B49\u5238\u4EA4\u6613\u6CD5\u5C0D\u5167\u7DDA\u4EA4\u6613\u6709\u4EC0\u9EBC\u898F\u7BC4\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5438\u6536\u5B58\u6B3E\u8207\u6388\u4FE1\u6709\u54EA\u4E9B\u9650\u5236\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5F9E\u696D\u4EBA\u54E1\u6709\u90A3\u4E9B\u898F\u5B9A\uFF1F","\u4FDD\u96AA\u6CD5\u5C0D\u65BC\u696D\u52D9\u54E1\u4E0D\u7576\u62DB\u652C\u7684\u8CAC\u4EFB\u898F\u5B9A\uFF1F","\u9280\u884C\u6CD5\u6709\u591A\u5C11\u689D\u6587\uFF1F","\u8B49\u5238\u71DF\u696D\u54E1\u5E38\u89F8\u72AF\u4EC0\u9EBC\u6CD5\u898F\u6216\u547D\u4EE4\uFF1F","\u6709\u54EA\u4E9B\u6CD5\u898F\u662F\u548C\u58FD\u96AA\u53CA\u7522\u96AA\u76F8\u95DC\u7684\uFF1F"];function Ql(){return`<div class="answer-placeholder">
    <span class="empty-icon">${m("sparkles",26)}</span>
    <h2 class="empty-title">\u7B54\u6848\u53EA\u6703\u4F86\u81EA\u6AA2\u7D22\u5230\u7684\u5224\u6C7A\u53CA\u6CD5\u898F\u7247\u6BB5</h2>
    <p class="empty-text">\u9001\u51FA\u554F\u984C\u5F8C\uFF0C\u7CFB\u7D71\u6703\u5148\u4EE5 Qdrant \u6AA2\u7D22\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\u4E26\u6A19\u793A\u5F15\u7528\u7DE8\u865F\u3002
      \u82E5\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u660E\u78BA\u986F\u793A\u964D\u7D1A\u72C0\u614B\uFF0C\u4E0D\u6703\u6191\u7A7A\u751F\u6210\u7B54\u6848\u3002</p>
  </div>`}function $n(){return`<section class="card answer-card rag-empty-answer">${Ql()}</section>`}function si(e,t){return`<div class="rag-turn">
    <div class="rag-user-bubble">${r(e)}</div>
    <section class="card rag-assistant-turn" data-rag-answer>${t}</section>
  </div>`}function Gl(e,t){return Promise.race([e,new Promise((s,a)=>{window.setTimeout(()=>a(new Error("pipeline lookup timed out")),t)})])}async function Jl(e){if(!e||e.pipeline_flow)return e;let t=String(e._client_request_id||e.request_id||"").trim();if(!t)return e;for(let s=0;s<3;s+=1){try{let a=await Gl(Q.performance({keyword:t},1,5),1800),n=(Array.isArray(a.rows)?a.rows:[]).find(i=>String(i.request_id||"")===t&&i.flow&&typeof i.flow=="object");if(n)return e.pipeline_flow=n.flow,e}catch{}s<2&&await new Promise(a=>window.setTimeout(a,250))}return e}function Vl(e){return{status:e.status,answer:e.answer,answer_source:e.answer_source,notice:e.notice,citations:Array.isArray(e.citations)?e.citations:[],judgments:Array.isArray(e.judgments)?e.judgments:[],law_sources:Array.isArray(e.law_sources)?e.law_sources:[],matched_terms:Array.isArray(e.matched_terms)?e.matched_terms:[],law_answer:e.law_answer,law_framework:e.law_framework,llm_model:e.llm_model,embedding_model:e.embedding_model,duration_ms:e.duration_ms,show_sources:e.show_sources,pipeline_flow:e.pipeline_flow||null,test_run:e.test_run||null,partial:!1,streaming:!1}}var Wl={"http.request":"FastAPI \u63A5\u6536\u8ACB\u6C42","http.response":"\u56DE\u50B3\u7D50\u679C\u7D66\u524D\u7AEF","rag.answer_question":"RAG \u4E3B\u6D41\u7A0B","rag.coverage":"PostgreSQL \u7D22\u5F15\u8986\u84CB\u6AA2\u67E5","rag.law_retrieval":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22","rag.law_lookup":"\u6BD4\u5C0D\u554F\u984C\u4E2D\u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u540D\u7A31","rag.law_content":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u689D\u6587","rag.qdrant_precheck":"Qdrant collection \u6AA2\u67E5","rag.search":"RAG \u6AA2\u7D22","rag.embed_query":"Ollama embedding \u67E5\u8A62\u5411\u91CF","rag.qdrant_search":"Qdrant \u5411\u91CF\u641C\u5C0B","rag.fetch_documents":"PostgreSQL \u8B80\u53D6\u5224\u6C7A","rag.postgres_fetch":"PostgreSQL \u5224\u6C7A\u67E5\u8A62","rag.build_citations":"\u6574\u7406\u5F15\u7528\u8207\u5224\u6C7A\u7247\u6BB5","rag.extract_excerpt":"\u64F7\u53D6\u76F8\u95DC\u7247\u6BB5","rag.llm":"LLM \u56DE\u7B54\u751F\u6210","rag.llm_request":"Ollama LLM \u751F\u6210","rag.validate_citations":"\u9A57\u8B49\u5F15\u7528\u7DE8\u865F","rag.test_mode":"\u6E2C\u8A66\u6A21\u5F0F\u591A\u6A21\u578B\u6D41\u7A0B","rag.preview_fallback":"\u6CD5\u898F\u9810\u89BD\u964D\u7D1A"};function Kl(e){let t=String(e?.name||""),s=e?.params||{},a=String(s.model||s.embedding_model||"").trim();return t==="rag.llm_request"?`Ollama run ${a||"LLM"}`:t==="rag.llm"?`LLM \u56DE\u7B54\u751F\u6210${a?` \xB7 ${a}`:""}`:t==="rag.embed_query"?`Ollama embedding \u67E5\u8A62\u5411\u91CF${a?` \xB7 ${a}`:""}`:Wl[t]||t||"backend step"}function ai(e){return[e?.module,e?.function,e?.name].filter(Boolean).join(" \xB7 ")}function ni(e){let t=Number(e);return Number.isFinite(t)?`${u(Math.max(0,Math.round(t)))} ms`:"\u2014"}function yn(e,t){if(!e)return;e.classList.toggle("is-open",t);let s=e.querySelector("#rag-process-body"),a=e.querySelector(".rag-process-toggle");s&&(s.hidden=!t),a&&(a.setAttribute("aria-expanded",String(t)),a.title=t?"\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B":"\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B")}function Yl(){return`<div class="rag-process is-open" id="rag-process">
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
  </div>`}function Xl(e){let t=e.querySelector("#rag-process"),s=t?.querySelector("#rag-process-list"),a=t?.querySelector("#rag-process-summary"),n=performance.now(),i=new Map,o=new Map,l=(f,p,y)=>{let S=f.querySelector(p);S&&(S.textContent=y)},d=f=>{if(f.failed){l(f.element,".rag-process-meta","\u5931\u6557");return}if(f.hasChildren){l(f.element,".rag-process-meta","");return}l(f.element,".rag-process-meta",ni(f.durationMs))},c=f=>{let p=f-1,y=[...i.values()].reverse();for(let S of y){if(p<0)break;S.depth<=p&&(S.hasChildren||(S.hasChildren=!0,S.element.dataset.hasChildren="true",S.finished&&d(S)),p=S.depth-1)}},v=f=>{if(!s)return null;let p=String(f?.seq??`step-${i.size+1}`),y=i.get(p);if(!y){let S=Math.max(0,Math.min(6,Number(f?.depth)||0));c(S);let N=document.createElement("div");N.className="rag-process-item is-running",N.dataset.processKey=p,N.style.setProperty("--depth",String(S)),N.innerHTML=`<span class="rag-process-dot"></span>
        <span class="rag-process-label"></span>
        <span class="rag-process-meta">\u57F7\u884C\u4E2D\u2026</span>`,s.appendChild(N),y={element:N,depth:S,hasChildren:!1,finished:!1,failed:!1,durationMs:0},i.set(p,y)}return l(y.element,".rag-process-label",Kl(f)),y.element.title=ai(f),y};return{step:f=>{let p=f?.segment;if(!p)return;o.set(String(p.seq??p.name??o.size),{...p});let y=v(p);if(y){if(f.type==="segment_start"){y.element.classList.add("is-running"),l(y.element,".rag-process-meta","\u57F7\u884C\u4E2D\u2026");return}if(f.type==="segment_end"){let S=p.status==="error";y.element.classList.remove("is-running"),y.element.classList.toggle("is-error",S),y.finished=!0,y.failed=S,y.durationMs=Number(p.duration_ms)||0,d(y),y.element.title=[ai(p),S&&p.error||""].filter(Boolean).join(" \xB7 ")}}},finish:(f=!0)=>{if(!t)return"";t.querySelectorAll(".rag-process-item.is-running").forEach(N=>{N.classList.remove("is-running");let E=N.dataset.hasChildren==="true";l(N,".rag-process-meta",E?"":f?"\u5B8C\u6210":"\u4E2D\u65B7")});let p=s?.children.length||i.size,y=ni(Math.max(0,performance.now()-n));a&&(a.textContent=f?`\u5B8C\u6210 \xB7 ${p} \u6B65 \xB7 ${y}`:`\u5931\u6557 \xB7 ${p} \u6B65`);let S=[...o.values()].filter(N=>N?.name).sort((N,E)=>Number(N.offset_ms||0)-Number(E.offset_ms||0));if(s&&S.length){let N=Math.max(1,...S.map(E=>Number(E.end_offset_ms)||(Number(E.offset_ms)||0)+(Number(E.duration_ms)||0)));s.classList.add("is-waterfall"),s.innerHTML=ys(ya(S),N,"\u5F8C\u7AEF Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B span \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u53C3\u6578\u3001module\uFF0Ffunction\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u932F\u8AA4\u3002")}return t.classList.add("is-complete"),yn(t,!1),t.outerHTML},collapse:()=>yn(t,!1)}}function Zl(e,t=!1){let s=t?"\u6E2C\u8A66\u6A21\u5F0F\uFF1A\u6B63\u5728\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207 LLM \u6A21\u578B\uFF0C\u53EF\u80FD\u9700\u8981\u6578\u5206\u9418\u2026":"\u6B63\u5728\u4EE5\u5411\u91CF\u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\u7247\u6BB5\u4E26\u751F\u6210\u56DE\u7B54\uFF1B\u5FEB\u901F\u6A21\u5F0F\u901A\u5E38 2\u201310 \u79D2\u2026";return`<div class="answer-head">
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
  </article>`}function sc(e,t){let s=e.source_label||(e.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),a=e.law_level&&e.law_level!==s?e.law_level:"",n=[`<span class="badge ${e.source_type==="order"?"badge-warn":"badge-info"}">${r(s)}</span>`,a,e.law_category,e.article_count?`${u(e.article_count)} \u689D`:"",e.law_modified_date?`\u7570\u52D5 ${Lt(e.law_modified_date)}`:""].filter(Boolean).map(f=>`<span>${f}</span>`).join(""),i=e.first_promulgation?`<div class="citation-meta"><span>\u6700\u65E9\u5236\u5B9A\uFF1A${r(e.first_promulgation.roc_date)}\uFF08\u897F\u5143 ${r(e.first_promulgation.gregorian_date)}\uFF09</span></div>`:"",o=e.stats,l=o?`<div class="law-source-stats">
        <span>\u63D0\u53CA\u300C${r(o.entity||"")}\u300D\u7684\u5224\u6C7A ${u(o.judgment_count||0)} \u7B46</span>
        <span>\u672C\u6CD5\u898F\u88AB\u5F15\u7528 ${u(o.law_count||0)} \u6B21</span>
      </div>`:"",d=e.law_key||"",c=e.source_type||"",v=(Array.isArray(e.articles)?e.articles:[]).map(f=>{let p=String(f.article_no||"");return`<div class="law-source-article"${d&&p?` data-action="open-law-source"
        data-law-key="${r(d)}"
        data-source-type="${r(c)}"
        data-article-no="${r(p)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u9078\u67E5\u770B ${r(p)} \u7684\u5B8C\u6574\u5167\u5BB9"
        aria-label="\u958B\u555F ${r(e.law_name||"\u6CD5\u898F")} ${r(p)} \u7684\u5B8C\u6574\u689D\u6587"`:""}>
        <span class="law-source-article-no">${r(f.article_no||"\u689D\u6587")}</span>
        <p class="law-source-article-text">${r(f.article_content||"")}</p>
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
          <div class="law-answer-articles">${v.map(h=>{let f=String(h.article_no||"").trim(),p=ac(h.article_content);return!a||!f?`<div class="law-answer-article is-static">
                  <span class="law-answer-article-no">${r(f||"\u689D\u6587")}</span>
                  <span class="law-answer-article-text">${r(p)}</span>
                </div>`:`<button class="law-answer-article" type="button"
                data-action="open-law-source"
                data-law-key="${r(a)}"
                data-source-type="${r(n)}"
                data-article-no="${r(f)}"
                title="\u9EDE\u64CA\u67E5\u770B ${r(f)} \u7684\u5B8C\u6574\u5167\u5BB9"
                aria-label="\u958B\u555F ${r(i)} ${r(f)} \u7684\u5B8C\u6574\u689D\u6587">
                <span class="law-answer-article-no">${r(f)}</span>
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
    <div class="chips">${e.map(a=>{let n=s.get(String(a));return n?.law_key?_a(a,{lawKey:n.law_key,sourceType:n.source_type||""}):`<span class="chip">${r(a)}</span>`}).join("")}</div>`}function ic(e,t){if(!e)return"";let s=Array.isArray(e.providers)?e.providers:[],a=e.active||s.find(c=>c.active),n=String(e.status||""),i=String(e.model||"").trim(),o=a?`${a.name}:${i}`:n==="not_configured"?"\u672A\u555F\u7528":"\u7121\u53EF\u7528\u6A21\u578B",l=s.map(c=>{let v=c.status==="operational",$=!!c.active||c===a,h=`${c.name||"reranker"}:${i}`,f=$?"\u4F7F\u7528\u4E2D":v?c.role==="fallback"?"fallback":"\u4E3B\u8981":"\u96E2\u7DDA";return`<span class="rag-model-button is-static${$?" is-active":""}${v?"":" is-unavailable"}"
        title="${r(`${h} \xB7 ${c.url||""}`)}"
        aria-label="${r(`${h}\uFF0C${f}`)}">
        <span class="rag-model-state" aria-hidden="true"></span>
        <span>${r(h)}</span>
        <span class="rag-model-current">${r(f)}</span>
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
  </div>`}function wa({tone:e,title:t,text:s,models:a,currentModel:n,currentProviderName:i,baseUrl:o,modelState:l,untestedProviders:d=[],rerank:c=null,rerankRefreshing:v=!1,busy:$,refreshing:h}){let f=e==="ok"?"is-ok":e==="warn"?"is-warn":"is-info",p=e==="ok"?"check":e==="warn"?"alert":"info",y=e==="ok"?"badge-ok":e==="warn"?"badge-warn":"badge-info",S=Array.isArray(a)?a:[],N=[...new Set(S.map(Y=>Y.providerName).filter(Boolean))],E=n&&i?`${i}:${n}`:n,I=S.map(Y=>{let ye=Y.model===n&&(!i||Y.providerName===i),Te=Y.providerName?`${Y.providerName}:${Y.model}`:Y.model;return`<button class="rag-model-button${ye?" is-active":""}" type="button" data-rag-model="${r(Y.model)}"
        data-rag-provider="${r(Y.hostId===null||Y.hostId===void 0?"":String(Y.hostId))}"
        title="${r(Te)}"
        aria-pressed="${ye}" ${$||h?"disabled":""}>
        <span class="rag-model-state" aria-hidden="true"></span>
        <span>${r(Te)}</span>
        ${ye?'<span class="rag-model-current">\u4F7F\u7528\u4E2D</span>':""}
      </button>`}).join(""),H=(l?.models||[]).filter(Y=>Y.status==="untested").length,V=l?H?`\u5C1A\u6709 ${u(H)} \u500B\u6A21\u578B\u672A\u6E2C\u8A66 chat \u80FD\u529B\uFF1B\u6309\u300C\u6AA2\u67E5\u6A21\u578B\u300D\u5F8C\u5373\u53EF\u5207\u63DB\u3002`:"\u76EE\u524D provider \u6C92\u6709\u53EF\u7528\u7684 chat \u6A21\u578B\u3002":"\u7121\u6CD5\u53D6\u5F97\u6A21\u578B\u6E05\u55AE\uFF1B\u8ACB\u78BA\u8A8D Ollama \u670D\u52D9\u662F\u5426\u555F\u52D5\u3002";return`<section class="rag-mode-card ${f}">
    <div class="rag-mode-head">
      <span class="rag-mode-icon" aria-hidden="true">${m(p,14)}</span>
      <div class="rag-mode-copy">
        <strong>${r(t)}</strong>
        <p>${r(s)}</p>
      </div>
      <span class="badge ${y}">${u(S.length)} \u500B chat model${N.length?` \xB7 ${N.length} \u53F0\u4E3B\u6A5F`:""}</span>
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
      ${I?`<div class="rag-model-buttons">${I}</div>
             <p class="rag-model-hint">\u9EDE\u9078\u6A21\u578B\u5207\u63DB\uFF1B\u5207\u63DB\u5F8C\u5957\u7528\u4E0B\u4E00\u6B21\u63D0\u554F\uFF0C\u4E0D\u5F71\u97FF\u5DF2\u5B8C\u6210\u7684\u56DE\u7B54\u3002</p>`:`<p class="rag-model-empty">${r(V)}</p>`}
      ${d.length?`<p class="rag-model-hint rag-model-untested-hint">${r(d.join("\u3001"))} \u5C1A\u6709\u6A21\u578B\u5C1A\u672A\u6AA2\u67E5 chat \u80FD\u529B\uFF1B\u8ACB\u6309\u300C\u6AA2\u67E5\u6A21\u578B\u300D\u3002</p>`:""}
    </div>
    ${ic(c,v)}
  </section>`}function ci(e){let t=Array.isArray(e.citations)?e.citations:[],s=Array.isArray(e.judgments)?e.judgments:[],a=Array.isArray(e.law_sources)?e.law_sources:[],n=Array.isArray(e.matched_terms)?e.matched_terms:[],i=e.status||"preview",o=!!e.partial,l=!!e.streaming,d=!!e.show_sources||!o,c=e.answer_source==="structured",v=String(e.law_answer||"").trim(),$=e.law_framework||null,h=Array.isArray($?.rows)?$.rows:[],f=Array.isArray($?.sources)?$.sources:[],p=h.length>0,y=!!v&&!c&&!p,S=s.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u5224\u6C7A \xB7 ${s.length} \u7B46</span>
        <span>vector retrieval \xB7 [\u7DE8\u865F] \u5C0D\u61C9\u56DE\u7B54\u5F15\u7528</span>
      </div>
      <div class="citation-list">${s.map((z,ve)=>ec(z,ve)).join("")}</div>`:"",N=a.length&&!y?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4 \xB7 ${a.length} \u7B46</span>
        <span>PostgreSQL metadata \xB7 Parquet \u689D\u6587</span>
      </div>
      <div class="citation-list">${a.map((z,ve)=>sc(z,ve)).join("")}</div>`:"",E=!s.length&&t.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F \xB7 ${t.length} \u7B46</span>
        <span>metadata match</span>
      </div>
      <div class="citation-list">${t.map((z,ve)=>tc(z,ve)).join("")}</div>`:"",I=d?S+N+E:"";!I&&!o&&!y&&!p&&(I=`<div class="answer-divider"></div>
      ${rt({iconName:"file",title:"\u6C92\u6709\u53EF\u5F15\u7528\u7684\u4F86\u6E90",text:i==="retrieval_only"?"\u76EE\u524D\u5DF2\u5EFA\u7ACB\u7684\u5411\u91CF\u7D22\u5F15\u4E2D\u6C92\u6709\u8DB3\u5920\u76F8\u4F3C\u7684\u5224\u6C7A\uFF0C\u4E5F\u6C92\u6709\u53EF\u5C0D\u61C9\u7684\u6CD5\u898F\u6216\u547D\u4EE4\u3002\u7CFB\u7D71\u4E0D\u6703\u5728\u6C92\u6709\u4F86\u6E90\u6642\u751F\u6210\u7B54\u6848\u3002":"\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u4E14\u554F\u984C\u4E2D\u6C92\u6709\u53EF\u76F4\u63A5\u5C0D\u61C9\u7684\u73FE\u884C\u6CD5\u898F\u540D\u7A31\u3002"})}`);let H=rc(n,a),V=e.test_run,Y=String(e.llm_model||V?.primary_model||"").trim(),ye=String(e.embedding_model||"").trim(),Te=[Y?`LLM\uFF1A${Y}`:"",ye?`Embedding\uFF1A${ye}`:""].filter(Boolean).join(" \xB7 "),J=l||e.answer_source==="llm"?"LLM \u7D9C\u5408\u56DE\u7B54":"\u6AA2\u7D22\u7D50\u679C\u6458\u8981",B=p?`<div class="answer-block law-framework-block">
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
        ${f.length?`<div class="law-framework-sources">
                <span>\u6CD5\u898F\u4F86\u6E90</span>
                ${f.map(z=>{let ve=String(z?.law_name||z||"").trim(),qe=z&&z.index!==null&&z.index!==void 0?` [${r(z.index)}]`:"";return _a(ve,{label:`${ve}${qe}`})}).join("")}
              </div>`:""}
      </div>`:"",k=e.answer_source==="llm"&&Y?`<span class="answer-model" title="${r(Te)}">${m("brain",11)}${r(Y)}</span>`:c?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${m("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"",C=l?`${Y||"LLM"} \xB7 \u751F\u6210\u4E2D`:k?Y||"structured":"retrieval",ne=V?`<div class="test-run-summary">
        <div class="test-run-summary-head">
          <span class="badge badge-warn">\u6E2C\u8A66\u6A21\u5F0F</span>
          ${He(V.status)}
          <span class="mono">${r(V.run_id||"")}</span>
        </div>
        <div class="test-run-summary-body">
          <span>Embedding ${Number(V.models?.embedding?.length||0)} \u500B</span>
          <span>LLM ${Number(V.models?.llm?.length||0)} \u500B</span>
          <span>\u4E3B\u56DE\u7B54 ${r(V.primary_model||"\u2014")}</span>
          <span>${Number(V.total_ms||0)} ms</span>
          <a href="#/performance">\u67E5\u770B\u6E2C\u8A66 Flow</a>
        </div>
      </div>`:"",me=e.pipeline_flow&&typeof e.pipeline_flow=="object"?e.pipeline_flow:null,W=!o&&me?$a(me,{serverDurationMs:Number(e.duration_ms)||0,embedded:!0}):"",ae=String(e.answer||"").trim()||(l?"\u6B63\u5728\u751F\u6210\u56DE\u7B54\u2026":o?"\u6B63\u5728\u6AA2\u7D22\u5224\u6C7A\u4E26\u751F\u6210 LLM \u56DE\u7B54\u2026":"\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u56DE\u7B54\u3002"),Z=l?" data-partial-answer":"",we=l?" is-streaming":"";return`${B}
      ${y?`<div class="answer-block law-answer-block">
              <div class="answer-block-head">
                <span>\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22\u7D50\u679C</span>
                <span>${o&&!d?"\u6CD5\u898F\u8CC7\u6599\u5EAB":`${a.length} \u7B46\u4F86\u6E90`}</span>
              </div>
              <div class="law-answer-content">${nc(a,v)}</div>
            </div>`:""}
      <div class="answer-block">
        ${y||p?`<div class="answer-block-head">
                <span>${r(J)}</span>
                <span>${r(C)}</span>
              </div>`:""}
        <p class="answer-text${we}"${Z}>${r(ae)}</p>
      </div>
      ${e.notice?`<div class="answer-notice">${r(e.notice)}</div>`:""}
      ${ne}
      ${H}
      ${I}
      ${W}`}function ii(e,t,s=""){let a=t.status||"preview",n=a==="operational"?"\u5B8C\u6210":a==="retrieval_only"?"\u50C5\u6AA2\u7D22\u7D50\u679C":a==="preview"?"\u6CD5\u898F\u9810\u89BD":a==="unavailable"||a==="not_configured"?"\u8CC7\u6599\u4E0D\u53EF\u7528":a==="degraded"?"\u964D\u7D1A":"\u5B8C\u6210",i=t.test_run,o=String(t.llm_model||i?.primary_model||"").trim(),l=String(t.embedding_model||"").trim(),d=[o?`LLM\uFF1A${o}`:"",l?`Embedding\uFF1A${l}`:""].filter(Boolean).join(" \xB7 "),c=t.answer_source==="structured",v=t.answer_source==="llm"&&o?`<span class="answer-model" title="${r(d)}">${m("brain",11)}${r(o)}</span>`:c?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${m("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"";return`<div class="answer-head">
      <div class="answer-head-left">${m("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u7D50\u679C</span>
      </div>
      <div class="answer-head-meta">
        ${He(a,n)}
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
      ${Ne({tone:"danger",title:"\u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
    </div>`}function lc(e){let t=Array.isArray(e.turns)?e.turns:[],s=t.length?t[t.length-1].payload||{}:e.payload||{},a=Array.isArray(s.citations)?s.citations.length:0,n=Array.isArray(s.judgments)?s.judgments.length:0,i=Array.isArray(s.law_sources)?s.law_sources.length:0;return a+n+i}function cc(e,t,s,a=null){let n=e.id??s,i=lc(e),o=t.get(String(e.project_id||"")),l=Array.isArray(e.turns)?e.turns:[],d=e.updated_at||e.created_at,c=a!=null&&String(a)===String(n);return`<div class="rag-history-item${e.pinned?" is-pinned":""}${c?" is-active":""}">
    <button class="rag-history-open" type="button" data-history-open data-history-id="${r(String(n))}">
      <span class="history-question">${r(e.title||"\u672A\u547D\u540D\u63D0\u554F")}</span>
      <span class="history-meta">
        <span>${r(Ls(d))}</span>
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
  </div>`),n.join("")}async function dc(e){let t=!1,s=[],a=!1,n=[],i=!1,o="",l=8,d="",c=0,v=null,$=[],h=!1,f=!1,p={embedding:[],llm:[]},y=null,S=null,N=null,E=!1,I=!1,H=!1;e.innerHTML=`<section class="page rag-page">
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
      <div id="rag-mode-notice">${Ne({tone:"info",title:"RAG \u670D\u52D9\u72C0\u614B\u6AA2\u67E5\u4E2D",text:"\u6B63\u5728\u78BA\u8A8D Qdrant\u3001Embedding \u8207 LLM \u72C0\u614B\uFF1B\u6240\u6709\u56DE\u7B54\u90FD\u6703\u6A19\u793A\u53EF\u56DE\u6EAF\u7684\u4F86\u6E90\u3002"})}</div>
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
        ${Ul.map(g=>`<button class="example-chip" type="button" data-question="${r(g)}">${r(g)}</button>`).join("")}
      </div>
    </header>

    <section class="rag-conversation" id="rag-conversation" aria-live="polite">
      <div class="rag-turns" id="rag-turns">
        ${$n()}
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
  </section>`;let V=e.querySelector("#rag-form"),Y=e.querySelector("#rag-question"),ye=e.querySelector("#rag-submit"),Te=e.querySelector(".rag-page"),J=e.querySelector("#rag-turns"),B=e.querySelector("#rag-followup-form"),k=e.querySelector("#rag-followup-question"),C=e.querySelector("#rag-followup-submit"),ne=e.querySelector("#rag-history"),me=e.querySelector("#rag-storage-note"),W=e.querySelector("#rag-clear-history"),ee=e.querySelector(".rag-library"),ae=e.querySelector("#rag-pinned-body"),Z=e.querySelector("#rag-projects-body"),we=e.querySelector("#rag-pinned-count"),z=e.querySelector("#rag-projects-count"),ve=e.querySelector("#rag-recent-count"),qe=e.querySelector("#rag-library-context"),ge=e.querySelector("#rag-test-mode"),Xe=e.querySelector("#rag-test-flow"),Oe=e.querySelector("#rag-history-menu"),Ue=e.querySelector("#rag-judgment-dialog"),Be=e.querySelector("#rag-law-dialog"),Qe=()=>{document.documentElement.classList.toggle("dialog-open",!!e.querySelector("dialog[open]"))};Ue?.addEventListener("close",Qe),Be?.addEventListener("close",Qe);let Ge=null,mt=null,j,O=null,x=null,L=()=>{Y.style.height="auto",Y.style.height=`${Math.min(Y.scrollHeight,220)}px`},X=()=>{k.style.height="auto",k.style.height=`${Math.min(k.scrollHeight,160)}px`},F=g=>{h=!!g,Te.classList.toggle("has-conversation",h)},Ee=()=>{h&&(B.hidden=!1,X())},G=()=>{B.hidden=!0},ce=()=>{Oe.hidden&&!x||(Oe.hidden=!0,Oe.innerHTML="",x&&x.setAttribute("aria-expanded","false"),O=null,x=null)},De=(g,T)=>{let D=J.querySelector(".rag-empty-answer");D&&D.remove(),J.insertAdjacentHTML("beforeend",si(g,T));let se=J.lastElementChild,be=se?.querySelector("[data-rag-answer]");return window.requestAnimationFrame(()=>{se?.scrollIntoView({behavior:"smooth",block:"start"})}),{turnElement:se,answerElement:be}},We=()=>{J.innerHTML=$.length?$.map(g=>si(g.question,ii(g.question,g.payload||{},""))).join(""):$n()},At=g=>{let T=Array.isArray(g.turns)?g.turns:[];return T.length?(c+=1,jt(),_t(null),v=g.id??null,$=T.map(D=>({...D})),d=$[$.length-1]?.question||"",F(!0),We(),Ee(),Ze(),ke(ye,!1),ke(C,!1),window.setTimeout(()=>{B.scrollIntoView({behavior:"smooth",block:"end"})},50),!0):!1},Ze=()=>{if(t)return;if(ce(),!a){ne.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',ae.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',we.textContent="0",ve.textContent="0",i&&(Z.innerHTML=oi(n,[],o));return}let g=n.find(Ce=>String(Ce.id)===o)||null;o&&!g&&(o="");let T=new Map(n.map(Ce=>[String(Ce.id),Ce])),D=s.filter(Ce=>!!Ce.pinned),se=s.filter(Ce=>!Ce.pinned),be=o?se.filter(Ce=>String(Ce.project_id||"")===o):se,xe=be.slice(0,l),ze=(Ce,et)=>cc(Ce,T,et,v);ae.innerHTML=D.length?D.map(ze).join(""):'<div class="rag-library-empty">\u5C1A\u7121\u91D8\u9078\u9805\u76EE\u3002\u5C07\u6700\u8FD1\u9805\u76EE\u91D8\u9078\u5F8C\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</div>',Z.innerHTML=oi(n,s,o),ne.innerHTML=xe.length?xe.map(ze).join(""):`<div class="rag-library-empty">${o?"\u9019\u500B\u5C08\u6848\u9084\u6C92\u6709\u672A\u91D8\u9078\u7684\u9805\u76EE\u3002":D.length?"\u6700\u8FD1\u7684\u9805\u76EE\u90FD\u5DF2\u91D8\u9078\u3002":"\u5C1A\u7121\u63D0\u554F\u7D00\u9304\u3002\u9001\u51FA\u7B2C\u4E00\u500B\u554F\u984C\u5F8C\u6703\u4FDD\u5B58\u5728\u6B64\u700F\u89BD\u5668\u3002"}</div>`,be.length>l&&ne.insertAdjacentHTML("beforeend",`<button class="rag-library-more" type="button" data-rag-action="more-recent">\u986F\u793A\u66F4\u591A \xB7 ${u(be.length-l)} \u7B46</button>`),we.textContent=String(D.length),z.textContent=String(n.length),ve.textContent=String(be.length),g?(qe.hidden=!1,qe.innerHTML=`<span>${m("folder",12)}<strong>${r(g.name)}</strong></span><button type="button" data-rag-action="clear-project" title="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE" aria-label="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE">${m("x",12)}</button>`):(qe.hidden=!0,qe.innerHTML="")},zt=async()=>{try{let g=await ss("rag.projects",[]);n=Array.isArray(g)?g.map(T=>({id:String(T?.id||""),name:String(T?.name||"").trim()})).filter(T=>T.id&&T.name):[]}catch{n=[]}i=!0,t||Ze()},$t=g=>{o=String(g||""),l=8,Ze()},at=()=>{let g=Z.querySelector('[data-rag-form="project"]');g&&(g.hidden=!1,g.querySelector("input")?.focus())},xs=()=>{let g=Z.querySelector('[data-rag-form="project"]');g&&(g.hidden=!0,g.reset())},Ht=async g=>{let T=g.elements.project_name,D=String(T?.value||"").trim();if(!D){M("\u8ACB\u8F38\u5165\u5C08\u6848\u540D\u7A31\u3002","warn"),T?.focus();return}if(n.some(be=>be.name.toLowerCase()===D.toLowerCase())){M("\u5DF2\u6709\u540C\u540D\u5C08\u6848\u3002","warn"),T?.focus();return}let se=typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():`project-${Date.now()}-${Math.random().toString(16).slice(2)}`;n=[...n,{id:se,name:D.slice(0,60),created_at:new Date().toISOString()}],o=se,l=8,await Bs("rag.projects",n),Ze(),M(`\u5DF2\u5EFA\u7ACB\u5C08\u6848\u300C${D}\u300D\u3002`,"ok")},Ut=async g=>{let T=s.find(be=>String(be.id)===String(g));if(!T)return;let D=!T.pinned;if(!await Is(T.id,{pinned:D})){M("\u7121\u6CD5\u66F4\u65B0\u91D8\u9078\u72C0\u614B\u3002","danger");return}T.pinned=D,Ze(),M(D?"\u5DF2\u91D8\u9078\u9805\u76EE\u3002":"\u5DF2\u53D6\u6D88\u91D8\u9078\u3002","ok")},Mt=()=>{c+=1,jt(),_t(null),d="",v=null,$=[],F(!1),G(),J.innerHTML=$n(),Y.value="",L(),k.value="",X(),ke(ye,!1),ke(C,!1),Ze(),Ue?.open&&Ue.close(),Be?.open&&Be.close(),Y.focus(),window.scrollTo({top:0,behavior:"smooth"})},It=g=>{if(!g||Oe.hidden)return;let T=g.getBoundingClientRect(),D=Oe.getBoundingClientRect(),se=6,be=T.bottom+se;be+D.height>window.innerHeight-8&&(be=Math.max(8,T.top-D.height-se));let xe=T.right-D.width;xe=Math.max(8,Math.min(xe,window.innerWidth-D.width-8)),Oe.style.left=`${Math.round(xe)}px`,Oe.style.top=`${Math.round(be)}px`},rs=g=>{Oe.innerHTML=`
      <button type="button" role="menuitem" data-menu-action="rename">${m("edit",13)}<span>\u91CD\u65B0\u547D\u540D</span></button>
      <button type="button" role="menuitem" data-menu-action="toggle-pin">${m("pin",13)}<span>${g.pinned?"\u53D6\u6D88\u91D8\u9078":"\u91D8\u9078"}</span></button>
      <button type="button" role="menuitem" data-menu-action="share">${m("link",13)}<span>\u5206\u4EAB</span></button>
      <button type="button" role="menuitem" data-menu-action="move">${m("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></button>
      <div class="rag-history-menu-divider"></div>
      <button class="is-danger" type="button" role="menuitem" data-menu-action="delete">${m("trash",13)}<span>\u522A\u9664</span></button>`},Bt=g=>{let T=String(g.project_id||""),D=[{id:"",name:"\u672A\u5206\u985E"},...n.map(se=>({id:String(se.id),name:se.name}))];Oe.innerHTML=`
      <div class="rag-history-menu-head">${m("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></div>
      ${D.map(se=>`<button type="button" role="menuitem"
            data-menu-action="assign-project" data-project-id="${r(se.id)}">
            <span class="rag-history-menu-check">${T===se.id?m("check",12):""}</span>
            <span>${r(se.name)}</span>
          </button>`).join("")}
      ${n.length?"":'<div class="rag-history-menu-note">\u5C1A\u672A\u5EFA\u7ACB\u5C08\u6848\uFF0C\u53EF\u5148\u5F9E\u5DE6\u5074\u5EFA\u7ACB\u3002</div>'}
      <div class="rag-history-menu-divider"></div>
      <button type="button" role="menuitem" data-menu-action="back">${m("chevronLeft",13)}<span>\u8FD4\u56DE</span></button>`},Qt=(g,T)=>{let D=s.find(se=>String(se.id)===String(T));D&&(ce(),O=String(D.id),x=g,rs(D),Oe.hidden=!1,g.setAttribute("aria-expanded","true"),It(g))},_=async g=>{let T=window.prompt("\u91CD\u65B0\u547D\u540D\u5C0D\u8A71",g.title||"");if(T===null)return;let D=T.trim();if(!D){M("\u540D\u7A31\u4E0D\u80FD\u7A7A\u767D\u3002","warn");return}if(D===g.title)return;if(!await Is(g.id,{title:D})){M("\u91CD\u65B0\u547D\u540D\u5931\u6557\u3002","danger");return}g.title=D,Ze(),M("\u5C0D\u8A71\u5DF2\u91CD\u65B0\u547D\u540D\u3002","ok")},q=async g=>{let T=Array.isArray(g.turns)?g.turns:[],D=[`# ${g.title||"\u672A\u547D\u540D\u5C0D\u8A71"}`,""];if(T.length)for(let be of T){D.push("## \u554F\u984C","",be.question||"",""),D.push("## \u56DE\u7B54","",be.payload?.answer||"\uFF08\u6C92\u6709\u56DE\u7B54\u5167\u5BB9\uFF09","");let xe=Array.isArray(be.payload?.law_sources)?be.payload.law_sources.map(ze=>ze.law_name).filter(Boolean):[];xe.length&&D.push(`\u5F15\u7528\uFF1A${[...new Set(xe)].join("\u3001")}`,"")}else D.push(g.title||"");let se=await ms(D.join(`
`));M(se?"\u5C0D\u8A71\u5167\u5BB9\u5DF2\u8907\u88FD\uFF0C\u53EF\u76F4\u63A5\u8CBC\u4E0A\u5206\u4EAB\u3002":"\u7121\u6CD5\u8907\u88FD\u5C0D\u8A71\u5167\u5BB9\u3002",se?"ok":"warn")},A=async g=>{if(!window.confirm(`\u522A\u9664\u5C0D\u8A71\u300C${g.title||"\u672A\u547D\u540D\u5C0D\u8A71"}\u300D\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002`))return;if(!await ur(g.id)){M("\u522A\u9664\u5931\u6557\u3002","danger");return}let D=v!==null&&String(v)===String(g.id);s=s.filter(se=>String(se.id)!==String(g.id)),D?Mt():Ze(),M("\u5C0D\u8A71\u5DF2\u522A\u9664\u3002","ok")},R=async(g,T)=>{if(!await Is(g.id,{project_id:T})){M("\u79FB\u81F3\u5C08\u6848\u5931\u6557\u3002","danger");return}g.project_id=T;let se=n.find(be=>String(be.id)===String(T));Ze(),M(se?`\u5DF2\u79FB\u81F3\u5C08\u6848\u300C${se.name}\u300D\u3002`:"\u5DF2\u79FB\u51FA\u5C08\u6848\u3002","ok")},U=async g=>{let T=g.target.closest("[data-menu-action]");if(!T)return;let D=s.find(be=>String(be.id)===O);if(!D){ce();return}let se=T.dataset.menuAction;se==="rename"?(ce(),await _(D)):se==="toggle-pin"?(ce(),await Ut(D.id)):se==="share"?(ce(),await q(D)):se==="move"?(Bt(D),It(x)):se==="assign-project"?(ce(),await R(D,T.dataset.projectId||"")):se==="back"?(rs(D),It(x)):se==="delete"&&(ce(),await A(D))},K=g=>{Oe.hidden||(typeof g.composedPath=="function"?g.composedPath():[]).includes(Oe)||Oe.contains(g.target)||g.target.closest('[data-rag-action="open-history-menu"]')||ce()},de=g=>{g.key==="Escape"&&ce()},Se=g=>{g.target instanceof Node&&Oe.contains(g.target)||ce()},Ae=async()=>{try{if(s=await ia({limit:120}),t)return;a=!0,Ze(),me.textContent=ra()==="indexeddb"?"\u63D0\u554F\u7D00\u9304\u5132\u5B58\u5728\u700F\u89BD\u5668 IndexedDB\uFF0C\u4E0D\u6703\u4E0A\u50B3\u5230\u4F3A\u670D\u5668\u3002":"\u700F\u89BD\u5668\u5132\u5B58\u4E0D\u53EF\u7528\uFF0C\u63D0\u554F\u7D00\u9304\u53EA\u4FDD\u7559\u5728\u672C\u6B21\u5DE5\u4F5C\u968E\u6BB5\u3002"}catch{if(t)return;s=[],a=!0,Ze(),ne.innerHTML='<div class="rag-library-empty">\u7121\u6CD5\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u3002</div>'}},$e=async(g,T,D,se)=>{let be=$,xe=v;be.push({question:g,asked_at:new Date().toISOString(),payload:Vl(T)});let ze=Array.isArray(T.citations)?T.citations:[],Ce=Array.isArray(T.judgments)?T.judgments:[],et={question:g,status:T.status,citations:ze.map(Re=>Re.law_name),judgments:Ce.map(Re=>Re.jid)},nt=`${T.status||"preview"} \xB7 ${be.length} \u8F2A`,Pe=new Date().toISOString(),ut=Re=>{se===c&&(v=Re)};if(xe){if(!await Is(xe,{turns:be,detail:nt,payload:et,updated_at:Pe})){let gt=await Ps({kind:"rag",title:be[0]?.question||g,detail:nt,project_id:D,turns:be,payload:et,updated_at:Pe});ut(gt)}}else{let Re=await Ps({kind:"rag",title:be[0]?.question||g,detail:nt,project_id:D,turns:be,payload:et,updated_at:Pe});ut(Re)}await Ae()},Ie=()=>(y?.services||[]).find(g=>g.id==="llm")||null,Je=()=>{let g=e.querySelector("#rag-mode-notice");if(!g)return;let T=Array.isArray(S?.providers)?S.providers:[],D=[];for(let Re of T)if(!(!Re||!Array.isArray(Re.chat_models)))for(let gt of Re.chat_models)D.push({model:gt,providerName:String(Re.name||"").trim(),hostId:Re.host_id===null||Re.host_id===void 0?null:Number(Re.host_id)});if(!D.length&&Array.isArray(S?.chat_models)){let Re=String(S?.provider_name||"").trim(),gt=S?.provider?.host_id;for(let Fe of S.chat_models)D.push({model:Fe,providerName:Re,hostId:gt==null?null:Number(gt)})}let se=T.filter(Re=>Array.isArray(Re?.models)&&Re.models.length>0&&(!Array.isArray(Re.chat_models)||Re.chat_models.length===0)).map(Re=>String(Re.name||"").trim()).filter(Boolean),be=String(Ie()?.model||"").trim(),xe=String(S?.base_url||"").trim(),ze=String(S?.provider_name||"").trim(),Ce=y&&(y.services||[]).find(Re=>Re.id==="reranker")||null;if(!y){if(!N)return;g.innerHTML=wa({tone:"warn",title:"\u7121\u6CD5\u53D6\u5F97 RAG \u670D\u52D9\u72C0\u614B",text:N.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\uFF0C\u6216\u524D\u5F80\u7CFB\u7D71\u72C0\u614B\u9801\u67E5\u770B\u3002",models:D,currentModel:be,currentProviderName:ze,baseUrl:xe,modelState:S,untestedProviders:se,rerank:Ce,rerankRefreshing:H,busy:E,refreshing:I});return}let et=y.data||{},nt=(y.services||[]).find(Re=>Re.id==="rag"),Pe=Number(et.judgment_indexed_count||0),ut=Number(et.judgment_count||0);nt?.status==="operational"?g.innerHTML=wa({tone:"ok",title:"\u6AA2\u7D22\u8207\u56DE\u7B54\u5C31\u7DD2",text:`Qdrant\u3001Embedding \u8207 LLM \u5747\u53EF\u4F7F\u7528\uFF1B\u76EE\u524D\u7D22\u5F15\u6DB5\u84CB ${u(Pe)} / ${u(ut)} \u7B46\u5224\u6C7A\u3002\u56DE\u7B54\u4E0D\u662F\u6CD5\u5F8B\u610F\u898B\u3002`,models:D,currentModel:be,currentProviderName:ze,baseUrl:xe,modelState:S,untestedProviders:se,rerank:Ce,rerankRefreshing:H,busy:E,refreshing:I}):nt?.status==="degraded"?g.innerHTML=wa({tone:"warn",title:"\u90E8\u5206 AI \u5143\u4EF6\u672A\u5C31\u7DD2",text:nt.detail||"RAG \u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u6AA2\u7D22\u7D50\u679C\u3002",models:D,currentModel:be,currentProviderName:ze,baseUrl:xe,modelState:S,untestedProviders:se,rerank:Ce,rerankRefreshing:H,busy:E,refreshing:I}):g.innerHTML=wa({tone:"info",title:"\u5411\u91CF\u7D22\u5F15\u5C1A\u672A\u5C31\u7DD2 \xB7 \u4E0D\u662F\u6CD5\u5F8B\u610F\u898B",text:nt?.detail||"\u8A2D\u5B9A QDRANT_URL\u3001EMBEDDING_URL \u8207 LLM_URL \u4E26\u57F7\u884C judgment-index-vectors \u5F8C\u5373\u53EF\u555F\u7528\u5224\u6C7A\u6AA2\u7D22\u3002",models:D,currentModel:be,currentProviderName:ze,baseUrl:xe,modelState:S,untestedProviders:se,rerank:Ce,rerankRefreshing:H,busy:E,refreshing:I})},Ye=async()=>{let[g,T]=await Promise.allSettled([Q.status(),Q.llmModels()]);t||(y=g.status==="fulfilled"?g.value:null,S=T.status==="fulfilled"?T.value:null,N=g.status==="rejected"?g.reason:null,Je())},qs=async(g,T=null)=>{if(!g||E||I)return;let D=String(Ie()?.model||"").trim(),se=String(S?.provider_name||"").trim(),be=(S?.providers||[]).find(Ce=>T!==null&&Ce?.host_id!==null&&Ce?.host_id!==void 0&&Number(Ce.host_id)===Number(T)),xe=String(be?.name||(T===null?se:"")).trim();if(g===D&&(!T||!xe||xe===se))return;let ze=xe?`${xe}:${g}`:g;E=!0,Je();try{await Q.selectLlmModel(g,T),M(`\u5DF2\u5207\u63DB chat model\uFF1A${ze}`,"ok",3500)}catch(Ce){M(Ce.message||"\u7121\u6CD5\u5207\u63DB chat model\u3002","danger",6e3)}finally{E=!1,t||await Ye()}},Gt=async()=>{if(!(I||E)){I=!0,Je();try{await Q.testLlmModels(),M("\u5DF2\u66F4\u65B0 chat model \u6E05\u55AE\u3002","ok",3500)}catch(g){M(g.message||"\u7121\u6CD5\u6AA2\u67E5 chat model\u3002","danger",6e3)}finally{I=!1,t||await Ye()}}},Ta=async()=>{if(!H){H=!0,Je();try{let g=await Q.status();if(t)return;y=g,N=null,M("\u5DF2\u66F4\u65B0 rerank model \u72C0\u614B\u3002","ok",3e3)}catch(g){M(g.message||"\u7121\u6CD5\u6AA2\u67E5 rerank model\u3002","danger",6e3)}finally{H=!1,t||Je()}}},As=()=>{if(!ge)return;if(!f){ge.innerHTML="";return}let g=Array.isArray(p.embedding)?p.embedding.length:0,T=Array.isArray(p.llm)?p.llm.length:0;ge.innerHTML=Ne({tone:"warn",title:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F",text:`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${g} \u500B embedding \u8207 ${T} \u500B LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002\u6E2C\u8A66 Flow \u6703\u5728\u9801\u9762\u4E0B\u65B9\u5373\u6642\u986F\u793A\uFF0C\u4E5F\u53EF\u5230 <a href="#/tests">\u7CFB\u7D71\u6E2C\u8A66</a> \u6216 <a href="#/performance">\u6548\u80FD\u5831\u8868</a> \u67E5\u770B\u6B77\u53F2\u3002`})},Na=async()=>{try{let g=await Q.testMode();if(t)return;f=!!g.enabled,p=g.models||{embedding:[],llm:[]},As()}catch{if(t)return;f=!1,As()}},Js=g=>{f=!!g.detail?.enabled,p=g.detail?.models||{embedding:[],llm:[]},As()};window.addEventListener("judgment:test-mode",Js);let _t=g=>{if(!Xe)return;mt=g||null;let T=JSON.stringify(g?{run_id:g.run_id,status:g.status,progress:g.progress,total_ms:g.total_ms,stage:g.stage,answer:g.answer||"",steps:(g.steps||[]).map(D=>`${D.stage}:${D.model}:${D.status}:${D.progress}:${D.duration_ms}`)}:null);T!==j&&(j=T,Xe.innerHTML=g?ws(g,[],"",{showHistory:!1}):"")},jt=()=>{Ge&&(Ge(),Ge=null)},Ms=async(g=null)=>{if(!t)try{let T=g||await Q.testRunCurrent();if(t)return;let D=T.run;D&&D.status==="running"&&_t(D)}catch{}},js=()=>{t||Ge||(Ms(),Ge=vt("test-runs",(g,T)=>Ms(T?.snapshot||null)))},Vs=async g=>{if(!g){_t(null);return}try{let T=await Q.testRun(g);if(t)return;_t(T.run||null)}catch{t||M("\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF0C\u4F46\u7121\u6CD5\u8F09\u5165\u6E2C\u8A66 Flow\u3002","warn")}},b=async()=>{if(f)try{let g=await Q.testRunCurrent();if(t)return;g.run?.status==="running"&&(_t(g.run),js())}catch{}},w=0,P=(g,T)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">DB ORIGINAL JUDGMENT</div>
      <h2>${r(g)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-parquet-judgment" aria-label="\u95DC\u9589">${m("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${T}</div>`,ue=g=>{let T=(Array.isArray(g.citations)?g.citations:[]).map(ze=>li(ze)).filter(Boolean).join(""),D=T||(Array.isArray(g.matched_laws)?g.matched_laws:[]).map(ze=>_a(ze)).join(""),se=[g.court,g.jdate,g.title?`\u6848\u7531\uFF1A${g.title}`:"",g.full_text_length?`${u(g.full_text_length)} \u5B57`:"",g.citation_count?`\u5F15\u7528 ${u(g.citation_count)} \u7B46`:""].filter(Boolean).map(ze=>`<span>${r(ze)}</span>`).join(""),be=g.parquet_generated_at?`DB \u5132\u5B58\u539F\u6587\uFF08\u539F\u59CB Parquet\uFF09\xB7 ${r(String(g.parquet_generated_at).replace("T"," ").slice(0,19))}`:"DB \u5132\u5B58\u539F\u6587",xe=g.pdf_url?`<a class="btn btn-secondary btn-sm" href="${r(g.pdf_url)}" target="_blank" rel="noopener noreferrer">${m("external",13)}<span>\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF</span></a>`:"";return P(g.jid||"\u5224\u6C7A\u5168\u6587",`<div class="judgment-dialog-meta">
        <span class="badge badge-info">${r(g.source==="parquet"?"DB \u5132\u5B58\u539F\u6587":"PostgreSQL")}</span>
        ${se}
      </div>
      ${T?'<div class="citation-meta" style="margin-top:8px"><span>\u5224\u6C7A\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4</span></div>':""}
      ${D?`<div class="chips" style="margin:8px 0 10px">${D}</div>`:""}
      <div class="judgment-dialog-source">${be}</div>
      <pre class="judgment-dialog-text">${r(g.full_text||"\u6B64\u5224\u6C7A\u6C92\u6709\u5168\u6587\u3002")}</pre>
      <div class="judgment-dialog-actions">
        ${xe}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-parquet-judgment">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},le=async g=>{if(!Ue||!g)return;let T=++w;Ue.open||Ue.showModal(),Qe(),Ue.innerHTML=P("\u8B80\u53D6\u5224\u6C7A\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E DB \u5132\u5B58\u539F\u6587\u8B80\u53D6 ${r(g)}\u2026</span>
      </div>`);try{let D=await Q.judgmentDetail(g,"parquet");if(t||T!==w)return;Ue.innerHTML=ue(D)}catch(D){if(t||T!==w)return;Ue.innerHTML=P("\u7121\u6CD5\u8B80\u53D6 DB \u539F\u6587\u5224\u6C7A",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${r(D.message||"\u627E\u4E0D\u5230\u5224\u6C7A\u5168\u6587\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u5DF2\u57F7\u884C <span class="mono">uv run judgment-import-judgments --raw-only</span>\uFF0C\u4E14\u539F\u59CB Parquet \u5B58\u5728\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-parquet-judgment">\u95DC\u9589</button>
        </div>`)}},te=0,re=(g,T)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">LOCAL PARQUET LAW</div>
      <h2>${r(g)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-law-source" aria-label="\u95DC\u9589">${m("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${T}</div>`,pe=(g,T="")=>{let D=String(g.selected_article_no||T||"").trim(),se=!!D,be=Array.isArray(g.articles)?g.articles:[],xe=be.map(xt=>{let Ea=String(xt.article_content||"").trim();return Ea?xt.article_type==="C"?`<div class="law-chapter">${r(Ea)}</div>`:`<article class="law-article" data-article-no="${r(ri(xt.article_no))}">
          <div class="law-article-head">
            <span class="law-article-no">${r(xt.article_no||"\u689D\u6587")}</span>
          </div>
          <div class="law-article-text">${r(Ea)}</div>
        </article>`:""}).join(""),ze=(Array.isArray(g.warnings)?g.warnings:[]).map(xt=>r(xt)).join("<br />"),Ce=g.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F",et=g.meta?.articles_source,nt=et==="parquet"?"Parquet \u689D\u6587":et==="postgresql"?"PostgreSQL \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",Pe=g.meta?.snapshot||"",ut=[g.law_level,g.law_category,g.article_count?`${u(g.article_count)} \u689D`:"",g.law_modified_date?`\u7570\u52D5 ${Lt(g.law_modified_date)}`:""].filter(Boolean).map(xt=>`<span>${r(xt)}</span>`).join(""),Re=g.law_url?`<a class="btn btn-secondary btn-sm" href="${r(g.law_url)}" target="_blank" rel="noopener noreferrer">${m("external",13)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:"",gt=!se&&g.law_histories?`<details class="law-dialog-history">
          <summary>\u6CD5\u898F\u6CBF\u9769</summary>
          <div>${r(g.law_histories)}</div>
        </details>`:"",Fe=se?`<span class="badge badge-mono">${r(D)}</span>`:"",ft=!se&&be.length>1?`<div class="law-dialog-jump">
          <div class="law-article-jump">
            <input class="input law-article-jump-input law-jump-input"
              id="rag-law-article-jump" type="text" inputmode="numeric"
              autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
            <button class="btn btn-secondary btn-sm" type="button"
              data-action="jump-law-article"
              data-jump-input="rag-law-article-jump">\u8DF3\u81F3\u689D\u6587</button>
          </div>
        </div>`:"",yt=se?`${g.law_name||g.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4"} \xB7 ${D}`:g.law_name||g.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4";return re(yt,`<div class="judgment-dialog-meta">
        <span class="badge ${g.source_type==="order"?"badge-warn":"badge-info"}">${r(Ce)}</span>
        ${Fe}
        ${ut}
      </div>
      <div class="judgment-dialog-source">${r([nt,Pe].filter(Boolean).join(" \xB7 "))}</div>
      ${ze?`<div class="law-dialog-warning">${ze}</div>`:""}
      ${gt}
      ${ft}
      <div class="law-dialog-articles">${xe||`<div class="report-empty-inline">${se?"\u9019\u689D\u689D\u6587\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u5167\u5BB9\u3002":"\u9019\u500B\u6CD5\u898F\uFF0F\u547D\u4EE4\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u3002"}</div>`}</div>
      <div class="judgment-dialog-actions">
        ${Re}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-law-source">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},ie=(g,T)=>{let D=g?.querySelector(`#${T}`),se=ri(D?.value||"");if(!se){M("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),D?.focus();return}let be=[...g?.querySelectorAll("[data-article-no]")||[]].find(xe=>xe.dataset.articleNo===se);if(!be){M(`\u627E\u4E0D\u5230\u7B2C ${se} \u689D\u3002`,"warn");return}be.scrollIntoView({behavior:"instant",block:"center"}),be.classList.add("is-jump-target"),window.setTimeout(()=>be.classList.remove("is-jump-target"),2400)},he=async(g,T="",D="")=>{if(!Be||!g)return;let se=++te;Be.open||Be.showModal(),Qe(),Be.innerHTML=re(D?"\u8B80\u53D6\u6CD5\u898F\u689D\u6587\u4E2D\u2026":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E\u672C\u5730 Parquet \u8B80\u53D6 ${r([g,D].filter(Boolean).join(" \xB7 "))} \u7684\u539F\u59CB\u689D\u6587\u2026</span>
      </div>`);try{let be=await Q.lawDetail(g,T,"",D);if(t||se!==te)return;Be.innerHTML=pe(be,D)}catch(be){if(t||se!==te)return;Be.innerHTML=re("\u7121\u6CD5\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u6587",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${r(be.message||"\u627E\u4E0D\u5230\u689D\u6587\u5167\u5BB9\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u672C\u5730\u539F\u59CB\u6CD5\u898F Parquet \u5B58\u5728\uFF0C\u4E14 PostgreSQL metadata \u8207\u5176\u4E00\u81F4\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-law-source">\u95DC\u9589</button>
        </div>`)}};Be?.addEventListener("click",g=>{let T=g.target.closest('[data-action="jump-law-article"]');if(T){ie(Be,T.dataset.jumpInput||"rag-law-article-jump");return}if(g.target.closest('[data-action="close-law-source"]')){Be.close();return}let D=Be.getBoundingClientRect();(g.clientX<D.left||g.clientX>D.right||g.clientY<D.top||g.clientY>D.bottom)&&Be.close()}),Be?.addEventListener("keydown",g=>{!g.target.matches(".law-jump-input")||g.key!=="Enter"||(g.preventDefault(),ie(Be,g.target.id))}),Ue?.addEventListener("click",g=>{let T=g.target.closest('[data-action="open-law-source"]');if(T){he(T.dataset.lawKey||"",T.dataset.sourceType||"",T.dataset.articleNo||"");return}if(g.target.closest('[data-action="close-parquet-judgment"]')){Ue.close();return}let D=Ue.getBoundingClientRect();(g.clientX<D.left||g.clientX>D.right||g.clientY<D.top||g.clientY>D.bottom)&&Ue.close()}),J.addEventListener("click",g=>{let T=g.target.closest(".rag-process-toggle");if(T){let se=T.closest(".rag-process"),be=T.getAttribute("aria-expanded")==="true";yn(se,!be);return}let D=g.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(D){if(D.dataset.action==="open-law-source"){he(D.dataset.lawKey||"",D.dataset.sourceType||"",D.dataset.articleNo||"");return}le(D.dataset.jid||"")}}),J.addEventListener("keydown",g=>{if(g.key!=="Enter"&&g.key!==" ")return;let T=g.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(!(!T||T.closest("a, button"))){if(g.preventDefault(),T.dataset.action==="open-law-source"){he(T.dataset.lawKey||"",T.dataset.sourceType||"",T.dataset.articleNo||"");return}le(T.dataset.jid||"")}});let Me=async(g,{fresh:T=!1,source:D="hero"}={})=>{let se=g.trim();if(!se){M("\u8ACB\u5148\u8F38\u5165\u554F\u984C\u3002","warn"),(D==="followup"?k:Y).focus();return}(T||!h)&&(v=null,$=[],J.innerHTML="",Ze());let be=++c,xe=()=>t||be!==c,ze=o;d=se,F(!0),G(),D==="followup"?(k.value="",X()):(Y.value="",L());let{answerElement:Ce}=De(se,Zl(se,f)),et=f?null:Xl(Ce);f?(_t(null),js()):(jt(),_t(null)),ke(ye,!0,"\u6AA2\u7D22\u4E2D\u2026"),ke(C,!0,"\u6AA2\u7D22\u4E2D\u2026");let nt=null,Pe="",ut=Fe=>{if(xe()||!Fe?.partial)return;let ft=Ce.querySelector(".answer-body");if(!ft)return;nt=Fe,Pe=String(Fe.answer||""),ft.innerHTML=ci(Fe),et?.collapse?.();let yt=Ce.querySelector(".answer-head-title");yt&&(yt.textContent=Fe.streaming?"LLM \u56DE\u7B54\u751F\u6210\u4E2D":"\u6CD5\u898F\u7D50\u679C\u5DF2\u986F\u793A")},Re=Fe=>{if(xe()||!Fe||!nt?.streaming)return;Pe+=Fe;let ft=Ce.querySelector("[data-partial-answer]");ft&&(ft.textContent=Pe)},gt=()=>{if(xe()||!nt?.streaming)return;Pe="";let Fe=Ce.querySelector("[data-partial-answer]");Fe&&(Fe.textContent="\u6B63\u5728\u91CD\u65B0\u751F\u6210\u56DE\u7B54\u2026")};try{let Fe=f?await Q.rag(se,{testMode:f}):await Q.ragStream(se,{onStep:yt=>{xe()||et?.step(yt)},onPartial:ut,onToken:Re,onTokenReset:gt});if(xe())return;jt();let ft=et?.finish(!0)||"";if(Ce.innerHTML=ii(se,Fe,ft),Fe.pipeline_flow||Jl(Fe).then(()=>{if(xe()||!Fe.pipeline_flow)return;let yt=Ce.querySelector(".answer-body");if(!yt||yt.querySelector(".rag-wf-card"))return;let xt=$a(Fe.pipeline_flow,{serverDurationMs:Number(Fe.duration_ms)||0,embedded:!0});xt&&yt.insertAdjacentHTML("beforeend",xt)}),Fe.test_run?.run_id?await Vs(Fe.test_run.run_id):_t(null),await $e(se,Fe,ze,be),xe())return;Ee()}catch(Fe){if(xe())return;jt();let ft=et?.finish(!1)||"";Ce.innerHTML=oc(Fe,ft),Ee(),M(Fe.message||"\u6AA2\u7D22\u5931\u6557\u3002","danger")}finally{xe()||(jt(),ke(ye,!1),ke(C,!1))}};V.addEventListener("submit",g=>{g.preventDefault(),Me(Y.value,{fresh:!0,source:"hero"})}),B.addEventListener("submit",g=>{g.preventDefault(),Me(k.value,{fresh:!1,source:"followup"})}),Y.addEventListener("input",L),Y.addEventListener("keydown",g=>{g.key==="Enter"&&!g.shiftKey&&!g.isComposing&&(g.preventDefault(),V.requestSubmit())}),k.addEventListener("input",X),k.addEventListener("keydown",g=>{g.key==="Enter"&&!g.shiftKey&&!g.isComposing&&(g.preventDefault(),B.requestSubmit())}),e.querySelector("#example-chips").addEventListener("click",g=>{let T=g.target.closest("[data-question]");T&&(Y.value=T.dataset.question,L(),V.requestSubmit())}),e.addEventListener("click",async g=>{let T=g.target.closest("[data-rag-model]");if(T){let D=T.dataset.ragProvider?Number(T.dataset.ragProvider):null;await qs(T.dataset.ragModel||"",Number.isFinite(D)?D:null);return}if(g.target.closest('[data-rag-action="refresh-rerank-models"]')){await Ta();return}g.target.closest('[data-rag-action="refresh-chat-models"]')&&await Gt()}),ee.addEventListener("click",async g=>{let T=g.target.closest("[data-rag-toggle]");if(T){let Ce=T.closest(".rag-library-section").classList.toggle("is-collapsed");T.setAttribute("aria-expanded",String(!Ce));return}let D=g.target.closest("[data-rag-action]"),se=D?.dataset.ragAction||"";if(se==="new-chat"){Mt();return}if(se==="open-history-menu"){Qt(D,D.dataset.historyId);return}if(se==="toggle-pin"){await Ut(D.dataset.historyId);return}if(se==="select-project"){$t(D.dataset.projectId||"");return}if(se==="show-project-form"){at();return}if(se==="cancel-project"){xs();return}if(se==="more-recent"){l+=12,Ze();return}if(se==="clear-project"){$t("");return}let be=g.target.closest("[data-history-open]");if(!be)return;let xe=s.find(ze=>String(ze.id)===String(be.dataset.historyId));xe&&(o=String(xe.project_id||""),Ze(),!At(xe)&&(v=null,$=[],Me(xe.title,{fresh:!0,source:"history"})))}),ee.addEventListener("submit",async g=>{let T=g.target.closest('[data-rag-form="project"]');T&&(g.preventDefault(),await Ht(T))}),Oe.addEventListener("click",U),document.addEventListener("click",K),document.addEventListener("keydown",de),window.addEventListener("scroll",Se,{capture:!0,passive:!0}),window.addEventListener("resize",ce),W.addEventListener("click",async()=>{if(!s.length){M("\u76EE\u524D\u6C92\u6709\u53EF\u6E05\u9664\u7684\u63D0\u554F\u7D00\u9304\u3002","info");return}window.confirm("\u78BA\u5B9A\u6E05\u9664\u9019\u500B\u700F\u89BD\u5668\u7684\u6240\u6709\u63D0\u554F\u7D00\u9304\uFF1F")&&(await pr(),await Ae(),M("\u5DF2\u6E05\u9664\u672C\u6A5F\u63D0\u554F\u7D00\u9304\u3002","ok"))}),L(),await Promise.allSettled([Ye(),Ae(),zt(),Na()]),await b();let _e="";try{_e=window.sessionStorage.getItem("judgment.pending_question")||"",window.sessionStorage.removeItem("judgment.pending_question")}catch{_e=""}return!_e&&typeof window.__judgmentPendingQuestion=="string"&&(_e=window.__judgmentPendingQuestion),delete window.__judgmentPendingQuestion,_e=String(_e||"").trim().slice(0,500),_e&&Y&&(Y.value=_e,L(),window.setTimeout(()=>{t||Me(_e,{fresh:!0,source:"home"})},40)),()=>{t=!0,jt(),ce(),document.removeEventListener("click",K),document.removeEventListener("keydown",de),window.removeEventListener("scroll",Se,{capture:!0}),window.removeEventListener("resize",ce),document.documentElement.classList.remove("dialog-open"),window.removeEventListener("judgment:test-mode",Js),d&&J.setAttribute("data-last-question",d)}}var Ln={};Jt(Ln,{render:()=>ld});var kn=new Set(["legal_index_versions","judgment_import","index_versions"]),di=new Map,uc={running:{label:"\u57F7\u884C\u4E2D",tone:"info"},success:{label:"\u5B8C\u6210",tone:"ok"},partial:{label:"\u90E8\u5206\u5B8C\u6210",tone:"warn"},update:{label:"\u66F4\u65B0",tone:"warn"},failed:{label:"\u5931\u6557",tone:"danger"},interrupted:{label:"\u5DF2\u4E2D\u6B62",tone:"warn"},stale:{label:"\u72C0\u614B\u5931\u6548",tone:"warn"},skipped:{label:"\u7565\u904E",tone:"idle"},pending:{label:"\u7B49\u5F85",tone:"idle"},idle:{label:"\u5F85\u547D",tone:"idle"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},operational:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},unavailable:{label:"\u7121\u6CD5\u53D6\u5F97",tone:"danger"},missing:{label:"\u5C1A\u7121\u7D00\u9304",tone:"idle"},error:{label:"\u8B80\u53D6\u5931\u6557",tone:"danger"},ok:{label:"\u6B63\u5E38",tone:"ok"},provided:{label:"\u5916\u90E8\u63D0\u4F9B",tone:"info"}},pc=["download","parquet","postgres","qdrant"],mc={download:"\u4E0B\u8F09",parquet:"Parquet",postgres:"PostgreSQL",qdrant:"Qdrant"},Sa={complete:"\u5B8C\u6210",incomplete:"\u672A\u5B8C\u6210",processing:"\u8655\u7406\u4E2D",empty:"\u7121\u8CC7\u6599",not_applicable:"\u5DF2\u53D6\u4EE3"},vi={complete:"is-green",incomplete:"is-red",processing:"is-gray",empty:"is-empty",not_applicable:"is-empty"};var St=new Map,qt="",_s="",ui={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},pi={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},gc={judgment:"\u5224\u6C7A",law:"\u6CD5\u898F",order:"\u547D\u4EE4",system:"\u7CFB\u7D71"};var mi={law_download:"law",order_download:"order",judgment_download:"judgment"},gi={law_download:"\u6CD5\u898F\u4E0B\u8F09",order_download:"\u547D\u4EE4\u4E0B\u8F09",judgment_download:"\u5224\u6C7A\u4E0B\u8F09"},fc={law_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",order_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",judgment_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u5224\u6C7A RAR \u55CE\uFF1F\uFF08\u4E0D\u6703\u81EA\u52D5\u532F\u5165 PostgreSQL \u6216\u5EFA\u7ACB Qdrant \u7D22\u5F15\uFF09"},bc={law_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u6CD5\u898F RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",order_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u547D\u4EE4 RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",judgment_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u53EA\u4E0B\u8F09\u5224\u6C7A RAR\u3002PostgreSQL\uFF0FParquet \u532F\u5165\u8207 Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\u300C\u5224\u6C7A\u532F\u5165\u300D\u6216\u5B8C\u6574\u8CC7\u6599\u66F4\u65B0\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_import:"\u6D41\u7A0B\u7BC4\u570D\uFF1ARAR \u2192 \u539F\u59CB\u8CC7\u6599\u6AA2\u67E5\uFF0FParquet \u5099\u4EFD \u2192 \u91D1\u878D\u6CD5\u898F\u7BE9\u9078 \u2192 PostgreSQL\u3002Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_parquet:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5F9E PostgreSQL \u532F\u51FA\u67E5\u8A62\u7528 Parquet \u5FEB\u7167\uFF1B\u4E0D\u5BEB\u5165 Qdrant\uFF0FIndexedDB\u3002",index_versions:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5EFA\u7ACB\u4E26\u9A57\u8B49\u65B0\u7684 Qdrant collection\uFF0C\u5B8C\u6210\u5F8C\u539F\u5B50\u5207\u63DB alias\uFF1BIndexedDB \u4E0D\u53C3\u8207\u3002"};function xn(e){return uc[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function ot(e,t){let s=xn(e);return`<span class="badge ${ui[s.tone]||ui.idle}"><span class="status-dot ${pi[s.tone]||pi.idle}"></span>${r(t||s.label)}</span>`}function Rt(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function fi(e){return e==null?"\u7121\u6CD5\u53D6\u5F97":u(e)}function zs(e){return e&&e.color?String(e.color):"var(--accent)"}function vc(e,t=""){let s=e.percent===null||e.percent===void 0?null:Math.max(0,Math.min(100,Number(e.percent)||0)),a=e.status==="running"&&s===null,n=a?' aria-valuetext="\u9032\u5EA6\u672A\u77E5"':` aria-valuenow="${s??0}"`;return`<div class="processing-bar${a?" is-indeterminate":""}${t?` ${t}`:""}" role="progressbar" aria-valuemin="0" aria-valuemax="100"${n}>
    <span class="processing-bar-fill" style="width:${s??0}%;background:${r(zs(e))}"></span>
  </div>`}function hi(e){let t=e.unit==="bytes"?"":e.unit||"\u7B46",s=e.current,a=e.total;return["skipped","pending","idle"].includes(e.status)?"\u2014":s==null?e.status==="running"?"\u9032\u884C\u4E2D":"\u2014":e.unit==="bytes"?a?`${Le(s)} / ${Le(a)}`:Le(s):a?`${u(s)} / ${u(a)} ${t}`:`${u(s)} ${t}`}function us(e,t,s="",a=""){return`<div class="processing-summary-card">
    <span class="processing-summary-label">${r(e)}</span>
    <span class="processing-summary-value">${t}</span>
    ${s?`<span class="processing-summary-hint">${s}</span>`:""}
    ${a}
  </div>`}function hc(e){let t=e.database||{},s=e.index||{},a=e.local_archives||{},n=e.raw_backups||{},i=n.totals||{},o=e.state||{},l=e.capabilities||{},d=e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D",c=t.status==="operational",v=s.status==="operational",$=a.available!==!1,h=n.available!==!1,f=v?`${u(s.indexed)} / ${u(s.total)}`:ot(s.status||"unavailable"),p=v?`${Rt(s.percent)} \xB7 \u5C1A\u9918 ${u(s.remaining)} \u7B46`:r(s.error||"\u7121\u6CD5\u67E5\u8A62 Qdrant \u7D22\u5F15\u8986\u84CB\u7387\u3002"),y=$?`${u(a.unprocessed)} / ${u(a.total)}`:ot("unavailable"),S=$?`\u672A\u8655\u7406 / \u5168\u90E8 \xB7 ${Le(a.unprocessed_bytes)} \u5F85\u8655\u7406`:r(a.error||"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304\u3002");return`<div class="processing-summary">
    ${Et(Lc(e))}
    ${us("\u8655\u7406\u72C0\u614B",ot(e.status||"unknown"),`${r(d)} \xB7 \u66F4\u65B0\u65BC <span data-processing-updated-at>\u2014</span>`)}
    ${us("\u672A\u8655\u7406\u58D3\u7E2E\u6A94",r(y),S)}
    ${us("\u539F\u59CB\u8CC7\u6599\u5099\u4EFD",h?`${u(n.count)} \u6A94`:ot("unavailable"),h?`\u5171 ${u(i.row_count)} \u7B46 \xB7 ${Le(i.compressed_bytes)}`:r(n.error||"\u7121\u6CD5\u6383\u63CF\u539F\u59CB\u8CC7\u6599\u5099\u4EFD\u3002"))}
    ${us("PostgreSQL \u5224\u6C7A",c?u(t.judgment_count):ot("unavailable"),c?`\u6CD5\u898F ${fi(t.law_count)} \xB7 \u547D\u4EE4 ${fi(t.order_count)}`:r(t.error||"\u7121\u6CD5\u67E5\u8A62 PostgreSQL\u3002"))}
    ${us("Qdrant \u7D22\u5F15",f,p)}
    ${us("\u72C0\u614B\u6A94",ot(o.status||"missing"),o.updated_at?`\u66F4\u65B0\u65BC ${r(je(o.updated_at))}`:r(o.detail||"\u5C1A\u7121\u8655\u7406\u72C0\u614B\u7D00\u9304\u3002"))}
    ${us("\u5F85\u8655\u7406\u5DE5\u4F5C",l.can_start_update===!1?"\u66AB\u505C\u555F\u52D5":"\u53EF\u958B\u59CB\u66F4\u65B0",l.start_blocked_reason?r(l.start_blocked_reason):`\u672A\u8655\u7406 ${u(l.unprocessed_archives)} \u500B \xB7 \u7D22\u5F15\u5F85\u88DC ${u(l.index_backlog)} \u7B46${l.external_processes?` \xB7 \u5916\u90E8\u7A0B\u5E8F ${u(l.external_processes)} \u500B`:""}`)}
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
    </section>`;let n=s.map(o=>`<span class="processing-stack-segment" style="width:${Math.max(0,Number(o.percent)||0)}%;background:${r(o.color||"var(--accent)")}" title="${r(`${o.label} ${fe(o.duration_ms)} (${Rt(o.percent)})`)}"></span>`).join(""),i=s.map(o=>`<div class="processing-legend-item">
        <span class="processing-legend-swatch" style="background:${r(o.color||"var(--accent)")}"></span>
        <span class="processing-legend-label">${r(o.label)}</span>
        <span class="mono">${fe(o.duration_ms)}</span>
        <span class="processing-legend-percent mono">${Rt(o.percent)}</span>
        ${ot(o.status)}
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
          ${ot(i.status)}
          <span class="grow"></span>
          <span class="mono faint">${r(je(i.finished_at||i.started_at))}</span>
          <span class="mono">${i.duration_ms?fe(i.duration_ms):"\u2014"}</span>
        </div>
        ${i.message?`<div class="processing-run-message">${r(i.message)}</div>`:""}
      </div>`}).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section"><div class="processing-run-list">${n}</div></div>
  </section>`}function wc(e){let t=Array.isArray(e.notices)?e.notices:[];return t.length?`<div class="processing-notices">${t.map(s=>Ne({tone:s.tone||"info",title:s.title,text:r(s.message||"")})).join("")}</div>`:""}function _c(e,t){if(e==="law"||e==="order")return t==="qdrant"?"legal_index_versions":`${e}_download`;if(e==="judgment"){if(t==="download")return"judgment_download";if(t==="parquet"||t==="postgres")return"judgment_import";if(t==="qdrant")return"index_versions"}return""}function qn({month:e,year:t,monthNo:s,stageOrder:a,stageLabels:n,stageStatuses:i,overall:o,active:l,workflowForStage:d}){let c=i||{},v=String(e?.month||`${t}${String(s).padStart(2,"0")}`),$=e?.month_label||`${t}-${String(s).padStart(2,"0")}`,h=a.map(I=>`${n[I]||I}\uFF1A${Sa[c[I]||"empty"]}`).join(" \xB7 "),f=(e?.versions||[]).map(I=>I.version_code).filter(Boolean),p=[...new Set([...e?.files||[],...e?.local_files||[],...e?.imported_files||[]])].filter(Boolean),y=f.length?` \xB7 \u7248\u672C ${f.join("\u3001")}`:p.length?` \xB7 ${p.join("\u3001")}`:"",S=e?.detail?` \xB7 ${e.detail}`:"",N=e?`${$} \xB7 ${h}${y}${S}`:`${$} \xB7 \u7121\u8CC7\u6599`,E=a.map(I=>{let H=c[I]||"empty",V=H==="incomplete"?d(I):"",Y=V?"button":"span",ye=V?` type="button" data-timeline-workflow="${r(V)}"`:"";return`<${Y} class="processing-month-stage ${vi[H]||"is-empty"}${V?" is-actionable":""}"${ye} title="${r(`${n[I]||I}\uFF1A${Sa[H]}${V?"\uFF08\u9EDE\u9078\u524D\u5F80\u8655\u7406\uFF09":""}`)}" aria-label="${r(`${$} ${n[I]||I} ${Sa[H]}${V?"\uFF0C\u9EDE\u9078\u524D\u5F80\u8655\u7406":""}`)}"></${Y}>`}).join("");return`<td class="judgment-month import-month processing-month${l?" is-current":""} is-${r(o)}" data-month="${r(v)}" title="${r(N)}" aria-label="${r(N)}"${l?' aria-current="true"':""}>
    <span class="processing-month-number">${s}</span>
    <span class="processing-month-stages">${E}</span>
  </td>`}function kc(e,t,s,a){return qn({month:t,year:s,monthNo:a,stageOrder:pc,stageLabels:mc,stageStatuses:t?.stages||{},overall:t?.overall||"empty",active:!!t?.active,workflowForStage:n=>_c(e.key,n)})}function Sc(e){let t=Array.isArray(e?.months)?e.months:[];if(!t.length)return`<section class="report-card processing-card import-files-card law-index-timeline-card">
      <div class="side-card-head">
        <span class="side-card-title">${m(e?.key==="order"?"file":"layers",14)}${r(e?.label||"\u6CD5\u898F\uFF0F\u547D\u4EE4")} \u7D22\u5F15\u7248\u672C\u6642\u9593\u8868</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u5C1A\u7121\u4E0B\u8F09\u7248\u672C\u6216\u7D22\u5F15\u7D00\u9304\u3002</div>
    </section>`;let s=new Map(t.map(v=>[String(v.month),v])),a=[...new Set(t.map(v=>v.year))].sort((v,$)=>$.localeCompare(v)),n=["download","prepared","indexed"],i=e.stage_labels||{download:"D \u4E0B\u8F09\u7248\u672C",prepared:"P \u8CC7\u6599\u5C31\u7DD2",indexed:"I \u7D22\u5F15\u8986\u84CB"},o=a.map(v=>{let $=Array.from({length:12},(h,f)=>{let p=f+1,y=`${v}${String(p).padStart(2,"0")}`,S=s.get(y);return qn({month:S,year:v,monthNo:p,stageOrder:n,stageLabels:i,stageStatuses:S?.stages||{},overall:S?.overall||"empty",active:!!S?.active,workflowForStage:N=>N==="indexed"?"legal_index_versions":`${e.key}_download`})}).join("");return`<tr><th scope="row">${r(v)}</th>${$}</tr>`}).join(""),l=e.summary||{},d=e.current||{},c=d.month?`<div class="index-current-row">
        <span class="badge badge-info">${m("activity",11)}${r(d.label||"\u76EE\u524D\u7248\u672C")}</span>
        <strong class="mono">${r(d.month_label||Mn(d.month))}</strong>
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
          </span>`:""}`}function qc(e,t,s,a){let n=Array.isArray(e.stage_order)&&e.stage_order.length?e.stage_order:["extract","raw_parquet","filter","postgres"],i=e.stage_labels||{extract:"RAR \u6AA2\u67E5\uFF0F\u89E3\u58D3\u7E2E",raw_parquet:"\u539F\u59CB\u8CC7\u6599\u6AA2\u67E5\uFF0FParquet \u5099\u4EFD",filter:"\u91D1\u878D\u6CD5\u898F\u7BE9\u9078",postgres:"PostgreSQL metadata"};return qn({month:t,year:s,monthNo:a,stageOrder:n,stageLabels:i,stageStatuses:t?.import_stages||{},overall:t?.import_overall||"empty",active:!!t?.active,workflowForStage:()=>"judgment_import"})}function Ac(e,t,s){let a=[];for(let n=1;n<=12;n+=1){let i=`${t}${String(n).padStart(2,"0")}`;a.push(kc(e,s.get(i),t,n))}return`<tr><th scope="row">${t}</th>${a.join("")}</tr>`}function Mc(e){let t=e?.models||{},s=[["Embedding",t.embedding],["Rerank",t.rerank]].filter(([,a])=>a&&(a.label||a.model)).map(([a,n])=>{let i=n.label||[n.host,n.model].filter(Boolean).join(" ")||"\u2014",o=[`${a} \u4E3B\u6A5F\u8207\u6A21\u578B\uFF1A${i}`,n.url?`\u7AEF\u9EDE\uFF1A${n.url}`:"",a==="Rerank"&&n.enabled===!1?"RAG_RERANK_ENABLED=false":""].filter(Boolean).join(" \xB7 ");return`<span class="processing-timeline-model" title="${r(o)}"><span>${a}</span><strong class="mono">${r(i)}</strong>${a==="Rerank"&&n.enabled===!1?"<em>\u672A\u555F\u7528</em>":""}</span>`});return s.length?`<span class="processing-timeline-models">${s.join("")}</span>`:""}function jc(e){let t=Array.isArray(e.file_timelines)?e.file_timelines:[];return t.length?`<div class="processing-timeline-overview">${t.map(s=>{let a=Array.isArray(s.months)?s.months:[],n=new Map(a.map(d=>[String(d.month||""),d])),i=[...new Set(a.map(d=>Number(d.year)))].filter(d=>Number.isFinite(d)).sort((d,c)=>c-d),o=s.summary||{},l=s.current||null;return`<section class="report-card processing-card import-files-card processing-timeline-card" data-processing-timeline="${r(s.key||"")}">
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
      </section>`}).join("")}</div>`:'<div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u8655\u7406\u6642\u9593\u8868\u3002</div>'}function Lc(e){return e.judgment_stats&&typeof e.judgment_stats=="object"?e.judgment_stats:{judgment_total:(e.raw_backups?.totals||{}).row_count,financial_total:(e.database||{}).judgment_count}}function bi(e,t=new Set){return`${wc(e)}
    ${hc(e)}
    ${jc(e)}
    ${$c(e)}
    ${yc(e)}`}function Tc(e,t){return`<div class="report-card processing-card">
    <div class="report-section">
      ${Ne({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B",text:r(e||"\u672A\u77E5\u932F\u8AA4")})}
      ${t?`<p class="processing-section-sub">\u4E0A\u6B21\u6210\u529F\u66F4\u65B0\uFF1A${r(je(t.generated_at))}\u3002\u756B\u9762\u4E0A\u6C92\u6709\u986F\u793A\u66FF\u4EE3\u6216\u63A8\u6E2C\u7684\u9032\u5EA6\u3002</p>`:""}
      <div class="processing-error-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh">
          ${m("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
  </div>`}function Nc(e,t){if(e.nodeType!==t.nodeType||e.nodeName!==t.nodeName){e.replaceWith(t.cloneNode(!0));return}if(e.nodeType===Node.TEXT_NODE){e.nodeValue!==t.nodeValue&&(e.nodeValue=t.nodeValue);return}if(e.nodeType===Node.ELEMENT_NODE){for(let s of[...e.attributes])t.hasAttribute(s.name)||e.removeAttribute(s.name);for(let s of[...t.attributes])e.getAttribute(s.name)!==s.value&&e.setAttribute(s.name,s.value);t.hasAttribute("data-preserve-children")||yi(e,t)}}function yi(e,t){let s=[...e.childNodes],a=[...t.childNodes],n=Math.min(s.length,a.length);for(let i=0;i<n;i+=1)Nc(s[i],a[i]);for(let i=n;i<s.length;i+=1)s[i].remove();for(let i=n;i<a.length;i+=1)e.appendChild(a[i].cloneNode(!0))}function ns(e,t){let s=document.createElement("template");s.innerHTML=t,yi(e,s.content)}var wi={overview:"activity",law_download:"layers",order_download:"file",judgment_download:"download",judgment_import:"database",judgment_parquet:"cube",index_versions:"brain",normalize_courts:"filter",backfill_law_articles:"history"};function Ec(e){let s=(Array.isArray(e.workflows)?e.workflows:[]).map(n=>{let i=n.active_run||null,o=i||n.last_run||null;return{...n,activeRun:i,lastRun:o,status:i?i.status||"running":n.update_available?"update":o?.status||"idle"}}),a=s.find(n=>n.id==="judgment_parquet");return[{id:"overview",label:"\u8655\u7406\u7E3D\u89BD",description:"\u76EE\u524D\u6D41\u7A0B\u3001\u58D3\u7E2E\u6A94\u8207\u6700\u8FD1\u57F7\u884C\u7D00\u9304",status:e.status||"idle",activeRun:null,lastRun:null},...s.filter(n=>n.id!=="judgment_parquet"),...a?[a]:[]]}function _n(e,t){let s=Ec(e),a=new Set(["law_download","judgment_download","normalize_courts"]);return`<div class="status-sidebar-head">
      <div class="eyebrow">DATA WORKFLOWS</div>
      <div class="status-sidebar-title">\u8CC7\u6599\u6D41\u7A0B</div>
    </div>
    <nav class="status-tab-list" aria-label="\u8CC7\u6599\u8655\u7406\u5DE5\u4F5C\u6D41\u7A0B">
      ${s.map(n=>{let i=n.id===t,o=wi[n.id]||"terminal";return`${a.has(n.id)?'<div class="status-tab-divider" role="separator" aria-hidden="true"></div>':""}<button class="status-tab${i?" is-active":""}" type="button"
            data-processing-workflow="${r(n.id)}"
            ${i?'aria-current="page"':""}>
            <span class="status-tab-icon">${m(o,15)}</span>
            <span class="status-tab-copy">
              <strong>${r(n.label)}</strong>
              <small>${r(n.description||"")}</small>
            </span>
            ${ot(n.status)}
          </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u57F7\u884C\u6A21\u5F0F</span>
      <span class="mono">${r(e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D")}</span>
    </div>`}function Cc(e){if(!e)return'<div class="processing-workflow-empty">\u5C1A\u672A\u57F7\u884C\u3002\u6309\u4E0B\u53F3\u5074\u6309\u9215\u958B\u59CB\u3002</div>';let t=e.meta||{};return`<div class="processing-workflow-run">
    <div class="processing-workflow-run-head">
      ${ot(e.status)}
      <span class="mono">${r(e.id||"\u2014")}</span>
    </div>
    <div class="processing-workflow-run-grid">
      <span>\u958B\u59CB</span><strong>${r(je(e.started_at))}</strong>
      <span>\u8017\u6642</span><strong>${fe(e.duration_ms)}</strong>
      <span>\u8A0A\u606F</span><strong>${r(e.message||"\u2014")}</strong>
      ${t.log_path?`<span>\u65E5\u8A8C</span><strong class="mono">${r(t.log_path)}</strong>`:""}
    </div>
  </div>`}function Hs(e){return`${e.year}-${String(e.month_no).padStart(2,"0")}`}function _i(e){let t={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"},s=e.status||"red";return[Hs(e),t[s]||s,e.latest_fileset_id?`fileset ${e.latest_fileset_id}`:"",e.filename||"",e.local_filename&&e.local_filename!==e.filename?`\u672C\u6A5F\uFF1A${e.local_filename}`:""].filter(Boolean).join(" \xB7 ")}function ki(e){if(!e.download_url)return"";let t=Hs(e);return`<a class="judgment-month-download" href="${r(bt(e.download_url))}" target="_blank" rel="noreferrer" title="\u4E0B\u8F09 ${t} \u5224\u6C7A" aria-label="\u4E0B\u8F09 ${t} \u5224\u6C7A">${m("download",11)}</a>`}function Rc(e){let t=e.status||"red";return`<td class="judgment-month is-${r(t)}" data-judgment-month-key="${r(Hs(e))}" title="${r(_i(e))}"><span>${e.month_no}</span>${ki(e)}</td>`}function Pc(e){return e?.off_hours_enabled===!0}function Si(e){return`\u7DA0\u8272\uFF1A\u6700\u65B0\u7248\u5DF2\u4E0B\u8F09\u5230 raw_rar\uFF1B\u7070\u8272\uFF1A\u672C\u6A5F\u4ECD\u662F\u820A\u7248\uFF0C\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u6703\u66F4\u65B0\uFF1B\u7D05\u8272\uFF1A\u8A72\u6708\u4EFD\u7F3A\u5C11\u5224\u6C7A\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u958B\u555F\u4E0B\u8F09\u9023\u7D50\uFF08${Pc(e)?"\u975E API \u6642\u6BB5\u4E5F\u53EF\u4E0B\u8F09\uFF0C\u5EFA\u8B70\u4E00\u6B21\u53EA\u4E0B\u8F09\u4E00\u500B\u6A94\u6848":"\u4E0B\u8F09\u9023\u7D50\u50C5\u5728 00:00\u201306:00 API \u6642\u6BB5\u53EF\u7528"}\uFF09\u3002\u5F85\u88DC\u9F4A\u6708\u4EFD\u6703\u512A\u5148\u4E0B\u8F09\uFF0C\u5168\u90E8\u88DC\u9F4A\u5F8C\u624D\u7531\u6700\u65B0\u6708\u4EFD\u5F80\u56DE\u9A57\u8B49\u65E2\u6709\u6A94\u6848\uFF1B\u4E2D\u65B7\u7684\u4E0B\u8F09\u6703\u4FDD\u7559 .part\uFF0C\u4F3A\u670D\u5668\u652F\u63F4 Range \u6642\u7E8C\u50B3\uFF0C\u5426\u5247\u5F9E\u96F6\u91CD\u65B0\u4E0B\u8F09\u3002\u9996\u6B21\u5B8C\u6574\u540C\u6B65\u53EF\u80FD\u9700\u4E0B\u8F09\u6578\u767E\u500B\u6708\u4EFD\uFF0C\u9810\u8A2D\u975E\u6642\u6BB5\u4E5F\u53EF\u7E8C\u50B3\uFF1B\u56B4\u683C\u6A21\u5F0F\u6703\u5728 00:00\u201306:00 \u4EE5\u5916\u505C\u6B62\u3002`}var Ic={completed:"\u5B8C\u6210",window_closed:"API \u6642\u6BB5\u7D50\u675F",deadline:"\u63A5\u8FD1 06:00\uFF0C\u4FDD\u7559\u5F85\u4E0B\u8F09\u6708\u4EFD",verification_window_closed:"API \u6642\u6BB5\u7D50\u675F\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",verification_deadline:"\u63A5\u8FD1 06:00\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",errors:"\u90E8\u5206\u6708\u4EFD\u4E0B\u8F09\u5931\u6557\uFF0C\u4E0B\u6B21\u91CD\u8A66",pending:"\u4ECD\u6709\u5F85\u4E0B\u8F09\u6708\u4EFD",check_only:"\u50C5\u6AA2\u67E5\uFF0C\u672A\u4E0B\u8F09",incremental:"\u589E\u91CF\u6AA2\u67E5\u5B8C\u6210",status_only:"\u50C5\u66F4\u65B0\u6708\u4EFD\u72C0\u614B",running:"\u57F7\u884C\u4E2D"};function xi(e){let t=e?.backfill||{},s=t.verification||{},a=t.last_run||{},n=Number(t.pending_count)||0,i=Number(t.failure_count)||0,o=String(t.resume_from_month||""),l="\u9A57\u8B49\uFF1A\u672A\u958B\u59CB";s.status==="completed"?l="\u9A57\u8B49\u5B8C\u6210":s.next_month?l=`\u9A57\u8B49\u7E8C\u50B3 ${s.next_month}`:s.status==="in_progress"&&(l="\u9A57\u8B49\u9032\u884C\u4E2D");let d=String(a.stop_reason||""),c=d?`\u4E0A\u6B21\u505C\u6B62\uFF1A${Ic[d]||d}`:"";return{pending:n,failures:i,resume:o,verificationText:l,lastText:c}}function Bc(e){let t=xi(e),s=t.pending>0?`\u5F85\u88DC\u9F4A ${u(t.pending)} \u500B\u6708${t.failures>0?`\uFF08${u(t.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708";return`<div class="judgment-backfill" data-judgment-backfill>
    <span class="badge ${t.pending>0?"badge-danger":"badge-ok"}" data-judgment-backfill-pending>${s}</span>
    <span class="badge badge-neutral" data-judgment-backfill-resume ${t.resume&&t.pending>0?"":"hidden"}>\u5F9E ${r(t.resume)} \u7E8C\u50B3</span>
    <span class="badge badge-info" data-judgment-backfill-verification>${r(t.verificationText)}</span>
    <span class="muted" data-judgment-backfill-last ${t.lastText?"":"hidden"}>${r(t.lastText)}</span>
  </div>`}function Oc(e,t){let s=xi(t),a=e.querySelector("[data-judgment-backfill-pending]");a&&(a.textContent=s.pending>0?`\u5F85\u88DC\u9F4A ${u(s.pending)} \u500B\u6708${s.failures>0?`\uFF08${u(s.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708",a.classList.toggle("badge-danger",s.pending>0),a.classList.toggle("badge-ok",s.pending===0));let n=e.querySelector("[data-judgment-backfill-resume]");if(n){let l=!!s.resume&&s.pending>0;n.hidden=!l,n.textContent=l?`\u5F9E ${s.resume} \u7E8C\u50B3`:""}let i=e.querySelector("[data-judgment-backfill-verification]");i&&(i.textContent=s.verificationText);let o=e.querySelector("[data-judgment-backfill-last]");o&&(o.hidden=!s.lastText,o.textContent=s.lastText)}function An(){return'<div class="judgment-months-loading"><span class="spinner"></span><span>\u8B80\u53D6\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B\u2026</span></div>'}function Dc(e){if(e?.loading&&!e?.months?.length)return An();if(e?.error&&!e?.months?.length)return Ne({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:r(e.error)});let t=Array.isArray(e?.months)?e.months:[];if(!t.length)return'<div class="processing-empty">\u5C1A\u672A\u6709\u6708\u4EFD\u72C0\u614B\uFF1B\u8ACB\u5148\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u3002</div>';let s=new Map(t.map(o=>[Hs(o),o])),n=[...new Set(t.map(o=>o.year))].sort((o,l)=>l-o).map(o=>{let l=Array.from({length:12},(d,c)=>{let v=s.get(`${o}-${String(c+1).padStart(2,"0")}`);return v?Rc(v):`<td class="judgment-month is-empty"><span>${c+1}</span></td>`}).join("");return`<tr><th scope="row">${o}</th>${l}</tr>`}).join(""),i=e.summary||{};return`<div class="judgment-months">
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
  </div>`}function Fc(e,t){let s=Array.isArray(t?.months)?t.months:[],a=t.summary||{},n={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"};e.querySelectorAll("[data-judgment-summary]").forEach(l=>{let d=l.dataset.judgmentSummary||"";l.textContent=`${n[d]||d} ${u(a[d]||0)}`});let i=e.querySelector("[data-judgment-total]");i&&(i.textContent=`\u5171 ${u(t.total_months||s.length)} \u500B\u6708`),Oc(e,t);let o=e.querySelector("[data-judgment-hint]");if(o){let l=Si(t);o.textContent!==l&&(o.textContent=l)}for(let l of s){let d=Hs(l),c=e.querySelector(`[data-judgment-month-key="${d}"]`);if(!c)continue;let v=l.status||"red";c.classList.contains(`is-${v}`)||(c.classList.remove("is-green","is-gray","is-red","is-empty"),c.classList.add(`is-${v}`));let $=_i(l);c.title!==$&&(c.title=$);let h=c.querySelector(".judgment-month-download");if(l.download_url){let f=bt(l.download_url);h?h.getAttribute("href")!==f&&(h.href=f):c.insertAdjacentHTML("beforeend",ki(l))}else h&&h.remove()}}function zc(e){let t=Array.isArray(e)?e:[];return t.length?`<div class="processing-workflow-history">
    ${t.map(s=>`<div class="processing-workflow-history-row">
          <span class="processing-workflow-history-status">${ot(s.status||"idle")}</span>
          <span class="mono">${r(je(s.started_at))}</span>
          <span class="mono">${r(fe(s.duration_ms||0))}</span>
          <span class="processing-workflow-history-message">${r(s.message||"\u2014")}</span>
        </div>`).join("")}
  </div>`:'<div class="processing-workflow-empty">\u5C1A\u7121\u57F7\u884C\u7D00\u9304\u3002</div>'}function Hc(e){let t=Array.isArray(e.update_history)?e.update_history:[];if(!t.length)return'<div class="processing-workflow-empty">\u5C1A\u7121\u7248\u672C\u6AA2\u67E5\u7D00\u9304\u3002</div>';let s={up_to_date:["\u5DF2\u662F\u6700\u65B0","badge-ok"],update_available:["\u6709\u66F4\u65B0","badge-warn"],error:["\u6AA2\u67E5\u5931\u6557","badge-danger"]};return`<div class="processing-workflow-history">
    ${t.map(a=>{let[n,i]=s[a.status]||[a.status||"\u672A\u77E5","badge-neutral"],o=a.remote_content_length!=null?Le(a.remote_content_length):"\u2014",l=a.local_version_id?`v${a.local_version_id}`:"\u2014";return`<div class="processing-workflow-history-row">
          <span class="badge ${i}">${r(n)}</span>
          <span class="mono">${r(je(a.checked_at))}</span>
          <span class="mono">\u9060\u7AEF ${r(o)}</span>
          <span class="mono">\u672C\u5730 ${r(l)}</span>
          <span class="processing-workflow-history-message">${r(a.message||"\u2014")}</span>
        </div>`}).join("")}
  </div>`}function Sn(e){let t=String(e.key||""),s=xn(e.status);return[`data-stage-key="${r(t)}"`,`data-stage-label="${r(e.label||t)}"`,`data-stage-color="${r(zs(e))}"`,`data-stage-status-key="${r(e.status||"idle")}"`,`data-stage-status="${r(s.label)}"`,`data-stage-percent="${r(Rt(e.percent))}"`,`data-stage-counts="${r(hi(e))}"`,`data-stage-duration="${r(fe(e.duration_ms||0))}"`,`data-stage-contribution="${r(Rt(e.contribution_percent))}"`,`data-stage-message="${r(e.message||"")}"`].join(" ")}function Uc(e){let t=String(e.status||"idle");if(t!=="failed")return ot(t);let s=String(e.error||e.message||"\u968E\u6BB5\u57F7\u884C\u5931\u6557\u3002").trim(),a=String(e.resolution||"\u67E5\u770B .run \u76EE\u9304\u4E2D\u7684\u6700\u65B0\u65E5\u8A8C\u53D6\u5F97\u5B8C\u6574 traceback\uFF0C\u4FEE\u6B63\u5F8C\u91CD\u65B0\u57F7\u884C\u6B64\u6D41\u7A0B\u3002").trim(),n=`\u539F\u56E0\uFF1A${s}
\u5EFA\u8B70\uFF1A${a}`;return`<span class="badge badge-danger is-failure-tip" tabindex="0" aria-label="${r(n)}" data-failure-tip="${r(n)}"><span class="status-dot is-danger"></span>\u5931\u6557</span>`}function Qc(e){let t=String(e.status||"idle"),s=Number(e.financial_processed),a=Number(e.financial_matched),n=e.key==="filter"&&e.financial_processed!==null&&e.financial_processed!==void 0&&Number.isFinite(s)&&Number.isFinite(a)&&s>0,i=n?a/s*100:0,o=n?`<span class="processing-financial-ratio" title="\u91D1\u878D\u6848\u4EF6\u4F54\u6BD4\uFF1A\u672C\u6B21\u91D1\u878D\u6848\u4EF6\u6578 / \u672C\u6B21\u7D2F\u8A08\u5DF2\u8655\u7406\u539F\u59CB\u5224\u6C7A\u6578">
        <span class="processing-financial-ratio-count">\u91D1\u878D\u6848\u4EF6<strong class="mono">${u(a)}</strong></span>
        <span class="faint" aria-hidden="true">/</span>
        <span class="processing-financial-ratio-count">\u5168\u90E8\u6848\u4EF6<strong class="mono">${u(s)}</strong></span>
        <strong class="mono">\u91D1\u878D\u4F54\u6BD4${Math.round(i)}%</strong>
      </span>`:"",l=e.key==="postgres"&&e.total!==null&&e.total!==void 0?`\u7E3D\u8A08 ${u(e.total)} \u7B46`:hi(e),d=e.key==="filter"?String(e.message||"").replace(/\s*[，,]\s*命中\s*[\d,]+\s*筆。?\s*$/,"\u3002"):String(e.message||"");return`<div class="processing-workflow-stage${t==="running"?" is-running":""}" style="--stage-color:${r(zs(e))}" ${Sn(e)}>
    <div class="processing-workflow-stage-head">
      <span class="processing-workflow-stage-swatch"></span>
      <span class="processing-workflow-stage-label">${r(e.label||e.key||"\u968E\u6BB5")}</span>
      ${Uc(e)}
      <span class="processing-workflow-stage-percent mono">${Rt(e.percent)}</span>
    </div>
    ${vc(e)}
    <div class="processing-workflow-stage-meta">
      ${e.key==="filter"?"":`<span>${r(l)}</span>
      <span class="mono">${fe(e.duration_ms||0)}</span>`}
      <span class="processing-workflow-stage-message">${r(d||"\u2014")}</span>
      ${o}
    </div>
  </div>`}function Gc(e){let t=e.progress||{},s=Array.isArray(t.stages)?t.stages:[];if(!s.length)return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
      <div class="side-card-head">
        <span class="side-card-title">${m("activity",14)}\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C\u6B64\u6D41\u7A0B\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A host/model\u3001Blue-Green \u5EFA\u7F6E\u8207\u5404\u968E\u6BB5\u9032\u5EA6\u3002</div>
    </section>`;let a=new Map(s.map(ge=>[String(ge.key||""),ge])),n=a.get("ollama")||{},i=a.get("qdrant")||{},o=a.get("validate")||{},l=e.index_runtime||{},d=l.summary||{},c=l.copy||{},v=l.current||{},$=l.embedding||{},h=$.selected||{},f=$.active||{},p=Number(l.expected_count||d.total||i.total||0),y=Number(d.indexed??i.current??0),S=p>0?Math.min(100,y/p*100):i.status==="success"?100:0,N=Number(c.total||0),E=Number(c.copied||0),I=N>0?Math.min(100,E/N*100):c.status==="success"?100:0,H=String(l.build_mode||""),V=String(t.run_status||""),Y=!!V&&!["running","success","no_change"].includes(V),ye=String(c.status||(H==="reuse"?"pending":"skipped"));Y&&ye==="pending"&&(ye="stale");let Te=String(o.status||"pending"),J=Te==="success"&&/alias 已切換/.test(String(o.message||"")),B=J?"success":Te==="failed"?"failed":V==="running"?"pending":"skipped",k=l.version_id?`v${String(l.version_id).padStart(3,"0")}`:"\u2014",C=f.host||h.host||f.url||h.url||"\u2014",ne=f.port||h.port,me=ne?`${C}:${ne}`:String(C),W=f.model||h.model||l.model||"\u2014",ee=v.month?`${Mn(v.month)}${v.preparing?"\uFF08\u6E96\u5099\u4E2D\uFF09":""}`:t.run_status==="running"?"\u6E96\u5099\u4E2D":"\u2014",ae=[{key:"probe",label:"Ollama \u4E3B\u6A5F\uFF0F\u6A21\u578B\u6E2C\u8A66",color:"#22c55e",status:n.status||"pending",percent:Number(n.percent)||0,duration_ms:n.duration_ms,detail:`${u(n.current||0)} / ${u(n.total||0)} \u53F0 \xB7 ${me} \xB7 ${W}`},{key:"version",label:"\u5EFA\u7ACB\uFF0F\u63A5\u7E8C Blue-Green \u7248\u672C",color:"#06b6d4",status:l.version_id?"success":"pending",percent:l.version_id?100:0,duration_ms:l.version_duration_ms,detail:`${k} \xB7 ${l.collection||"\u2014"} \xB7 ${H||"\u2014"}`},{key:"copy",label:"\u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF",color:"#f59e0b",status:ye,percent:I,duration_ms:c.duration_ms,detail:N>0?`${u(E)} / ${u(N)} points \xB7 \u820A collection \u5411\u91CF`:ye==="skipped"?"\u672C\u6B21\u4E0D\u9700\u8907\u88FD\u820A\u5411\u91CF":ye==="stale"?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u5B8C\u6210\u8907\u88FD":"\u7B49\u5F85\u820A collection \u8907\u88FD"},{key:"index",label:"\u91D1\u878D\u5224\u6C7A\u5411\u91CF\u7D22\u5F15",color:"#a78bfa",status:i.status||"pending",percent:S,duration_ms:i.duration_ms,detail:`${u(y)} / ${u(p)} \u7B46 \xB7 \u91CD\u7528 ${u(d.reused)} \xB7 \u65B0 embedding ${u(d.embedded)}`},{key:"validate",label:"\u9A57\u8B49\u65B0\u7248\u672C",color:"#eab308",status:Te,percent:Te==="success"?100:0,duration_ms:o.duration_ms,detail:o.message||(Y?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u9032\u884C\u9A57\u8B49\u3002":"\u7B49\u5F85\u7D22\u5F15\u5B8C\u6210\u5F8C\u9A57\u8B49\u7B46\u6578\u3001\u7DAD\u5EA6\u8207 payload\u3002")},{key:"activate",label:"\u5207\u63DB alias",color:"#3b82f6",status:B,percent:J?100:0,duration_ms:0,detail:J?o.message:Y?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u5207\u63DB alias\u3002":"\u9A57\u8B49\u901A\u904E\u5F8C\u5207\u63DB judgments_current\u3002"}],Z=ae.filter(ge=>ge.status!=="skipped"),we=Z.length?Z.reduce((ge,Xe)=>ge+Xe.percent,0)/Z.length:0,z=ae.filter(ge=>ge.status==="success").length,ve=Rt(we),qe=ae.map((ge,Xe)=>`<div class="index-wf-row is-${r(ge.status)}">
        <div class="index-wf-rail">
          <span class="index-wf-dot" style="--stage-color:${r(ge.color)}"></span>
        </div>
        <div class="index-wf-body">
          <div class="index-wf-head">
            <span class="index-wf-step">${String(Xe+1).padStart(2,"0")}</span>
            <strong>${r(ge.label)}</strong>
            ${ot(ge.status)}
            <span class="index-wf-duration mono">${ge.duration_ms?fe(ge.duration_ms):"\u2014"}</span>
          </div>
          <div class="index-wf-track">
            <span style="width:${Math.max(0,Math.min(100,ge.percent)).toFixed(1)}%;background:${r(ge.color)}"></span>
          </div>
          <div class="index-wf-detail">${r(ge.detail)}</div>
        </div>
      </div>`).join("");return`<section class="report-card processing-card processing-workflow-progress-card index-wf-card" data-workflow-progress>
    <div class="side-card-head">
      <span class="side-card-title">${m("activity",14)}\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</span>
      <span class="badge ${t.run_status==="running"?"badge-info":"badge-neutral"}">${u(z)} / ${u(Z.length)} \u968E\u6BB5</span>
    </div>
    <div class="index-wf-summary">
      <span>\u6574\u9AD4 <strong class="mono">${ve}</strong></span>
      <span>\u7248\u672C <strong class="mono">${r(k)}</strong></span>
      <span>Collection <strong class="mono">${r(l.collection||"\u2014")}</strong></span>
      <span>\u6A21\u5F0F <strong>${r(H||"\u2014")}</strong></span>
      <span>Host <strong class="mono">${r(me)}</strong></span>
      <span>Model <strong class="mono">${r(W)}</strong></span>
      <span>\u76EE\u524D <strong>${r(ee)}</strong></span>
    </div>
    <div class="index-wf-list">${qe}</div>
    <div class="index-wf-overall">
      <div class="index-wf-overall-head">
        <span>\u6574\u9AD4\u9032\u5EA6</span>
        <span class="mono">${ve}</span>
      </div>
      <div class="index-wf-overall-track">
        <span style="width:${Math.max(0,Math.min(100,we)).toFixed(1)}%"></span>
      </div>
    </div>
  </section>`}function Jc(e){if(qt===e.id)return"";if(e.id==="index_versions")return Gc(e);let t=e.progress||{},s=Array.isArray(t.stages)?t.stages:[];if(!s.length)return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
      <div class="side-card-head">
        <span class="side-card-title">${m("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C\u6B64\u6D41\u7A0B\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A\u5404\u968E\u6BB5\u8207\u6574\u9AD4\u9032\u5EA6\u3002</div>
    </section>`;let a=t.overall_percent,i=s.filter(h=>h.status!=="skipped").filter(h=>Number(h.contribution_percent)>0).map(h=>`<span class="processing-workflow-progress-segment" style="width:${Number(h.contribution_percent)||0}%;background:${r(zs(h))}" ${Sn(h)}></span>`).join(""),o=s.map(h=>`<div class="processing-workflow-progress-legend-item${h.status==="skipped"?" is-skipped":""}" ${Sn(h)}>
        <span class="processing-workflow-progress-swatch" style="background:${r(zs(h))}"></span>
        <span class="processing-workflow-progress-legend-label">${r(h.label||h.key||"\u968E\u6BB5")}</span>
        <span class="mono">${Rt(h.percent)}</span>
      </div>`).join(""),l=Number(t.completed_stages)||0,d=Number(t.total_stages)||0,c=s.filter(h=>h.status==="skipped").length,v=c?`\u5B8C\u6210 ${l} \xB7 \u7565\u904E ${c}`:`${l} / ${d} \u968E\u6BB5`,$=bc[e.id]||"";return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
    <div class="side-card-head">
      <span class="side-card-title">${m("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
      <span class="badge ${t.run_status==="running"?"badge-info":"badge-neutral"}">${v}</span>
    </div>
    <div class="processing-workflow-stage-list">${s.map(Qc).join("")}</div>
    <div class="processing-workflow-overall">
      <div class="processing-workflow-overall-head">
        <span>\u6574\u9AD4\u9032\u5EA6</span>
        <span class="mono">${Rt(a)}</span>
      </div>
      <div class="processing-workflow-progress-stack" role="img" aria-label="\u5404\u968E\u6BB5\u9032\u5EA6\u52A0\u7E3D">${i||'<span class="processing-workflow-progress-empty">\u5C1A\u7121\u53EF\u8A08\u7B97\u9032\u5EA6</span>'}</div>
      <div class="processing-workflow-progress-legend">${o}</div>
      <div class="processing-workflow-progress-hint">\u5C07\u6ED1\u9F20\u79FB\u5230\u4EFB\u4E00\u968E\u6BB5\u6216\u8272\u584A\uFF0C\u53EA\u6703\u4FDD\u7559\u8A72\u9805\u76EE\u4E26\u986F\u793A\u8AAA\u660E\uFF1B\u7565\u904E\u968E\u6BB5\u4E0D\u5217\u5165\u6574\u9AD4\u9032\u5EA6\u3002</div>
    </div>
    ${$?`<p class="processing-workflow-scope-note">${m("info",12)}<span>${r($)}</span></p>`:""}
  </section>`}function Mn(e){let t=String(e||"");return t.length===6?`${t.slice(0,4)}-${t.slice(4)}`:t||"\u2014"}function Vc(e,t){let s={primary:"\u4E3B\u8981",fallback:"\u5099\u63F4",provided:"\u5916\u90E8"},a=Array.isArray(e.models)?e.models:[],n=a.length?a.join("\u3001"):"\u2014";return`<div class="index-host-row${e.url&&e.url===t?" is-selected":""}">
    <div class="index-host-head">
      <span class="badge badge-neutral">${r(s[e.role]||e.role||"\u4E3B\u6A5F")}</span>
      <strong class="mono">${r(e.host||"\u2014")}:${r(e.port??"\u2014")}</strong>
      ${ot(e.status||"unavailable")}
      <span class="index-host-model">${r(e.model||"\u2014")}</span>
    </div>
    <div class="index-host-url mono">${r(e.url||"\u2014")}</div>
    <div class="index-host-models" title="${r(n)}">\u6A21\u578B\uFF1A${r(n)}</div>
    ${e.detail?`<div class="index-host-detail">${r(e.detail)}</div>`:""}
  </div>`}function Wc(e){let t=Array.isArray(e.months)?e.months:[],s=e.current||{},a=e.active_coverage||{},n=new Map;for(let d of t){let c=String(d.month||"");if(!/^\d{6}$/.test(c))continue;let v=Number(c.slice(4,6));if(v<1||v>12)continue;let $=n.get(c);$||($={key:c,year:c.slice(0,4),monthNo:v,total:0,processed:0,activeTotal:0,activeProcessed:0,reused:0,embedded:0,archives:[],current:!1,preparing:!1,jid:""},n.set(c,$)),$.total+=Number(d.total)||0,$.processed+=Number(d.processed)||0;let h=a[c]||{};$.activeTotal=Math.max($.activeTotal,Number(h.total)||0),$.activeProcessed=Math.max($.activeProcessed,Number(h.processed)||0),$.reused+=Number(d.reused)||0,$.embedded+=Number(d.embedded)||0,d.archive&&$.archives.push(String(d.archive)),s.month===c&&(!s.archive||s.archive===d.archive)&&($.current=!0,$.preparing=!!s.preparing,$.jid=String(s.jid||""))}if(!n.size)return'<div class="processing-workflow-empty">\u5C1A\u7121\u53EF\u986F\u793A\u7684\u7D22\u5F15\u6708\u4EFD\uFF1B\u958B\u59CB\u7D22\u5F15\u5F8C\u6703\u4F9D\u6642\u9593\u5217\u51FA\u6708\u4EFD\u72C0\u614B\u3002</div>';let i={active:0,reuseComplete:0,reuseIncomplete:0,embedComplete:0,embedIncomplete:0};for(let d of n.values()){let c=d.total>0&&d.processed>=d.total,v=d.activeTotal>0&&d.activeProcessed>=d.activeTotal,$=d.embedded>0?"embed":d.reused>0||v?"reuse":"embed";d.kind=$,d.currentComplete=c,d.status=c?"green":d.processed>0?"red":v?"green":"gray",$==="reuse"?c?i.reuseComplete+=1:i.reuseIncomplete+=1:c?i.embedComplete+=1:i.embedIncomplete+=1,v&&(i.active+=1)}let l=[...new Set([...n.values()].map(d=>d.year))].sort((d,c)=>c.localeCompare(d)).map(d=>{let c=Array.from({length:12},(v,$)=>{let h=$+1,f=`${d}${String(h).padStart(2,"0")}`,p=n.get(f);if(!p)return`<td class="judgment-month is-empty"><span>${h}</span></td>`;let y=p.total?`${Math.min(100,Math.round(p.processed/p.total*1e3)/10)}%`:"\u2014",S=p.current&&e.run_status==="running",N=[`${p.year}-${String(p.monthNo).padStart(2,"0")}`,p.archives.join("\u3001")||"\u2014",`\u65B0\u7248\u672C ${u(p.processed)} / ${u(p.total)}\uFF08${y}\uFF09`,p.activeTotal>0?`active ${u(p.activeProcessed)} / ${u(p.activeTotal)}\uFF08${(100*p.activeProcessed/p.activeTotal).toFixed(1)}%\uFF09`:"",`\u91CD\u7528 ${u(p.reused)} \xB7 \u65B0 embedding ${u(p.embedded)}`,p.currentComplete?"":p.kind==="reuse"?"\u5F85\u5B8C\u6210\uFF1AR \u65E2\u6709\u5411\u91CF\u91CD\u7528":"\u5F85\u5B8C\u6210\uFF1AE \u65B0 embedding",p.current?`${S?p.preparing?"\u6E96\u5099\u7D22\u5F15":"\u76EE\u524D\u7D22\u5F15":"\u6700\u5F8C\u7D22\u5F15"}${p.jid?` \xB7 ${p.jid}`:""}`:""].filter(Boolean).join(" \xB7 "),E=p.activeTotal>0?Math.min(100,100*p.activeProcessed/p.activeTotal):0,I=p.total>0?Math.min(100,100*p.reused/p.total):0,H=p.total>0?Math.min(100,100*p.embedded/p.total):0,V=p.kind==="reuse"&&!p.currentComplete,Y=p.kind==="embed"&&!p.currentComplete;return`<td class="judgment-month index-month index-month-are is-${p.status}${S?" is-active":""}" title="${r(N)}"${S?' aria-current="true"':""}><span class="index-month-number">${h}</span><span class="index-month-blocks" aria-hidden="true"><span class="index-month-block is-active" style="--fill:${E.toFixed(1)}%"></span><span class="index-month-block is-reuse${V?" is-incomplete":""}" style="--fill:${V?"0.0":I.toFixed(1)}%"></span><span class="index-month-block is-embed${Y?" is-incomplete":""}" style="--fill:${Y?"0.0":H.toFixed(1)}%"></span></span></td>`}).join("");return`<tr><th scope="row">${r(d)}</th>${c}</tr>`}).join("");return`<div class="judgment-months index-months">
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
    </section>`;let a=new Map(s.map($=>[String($.month),$])),n=[...new Set(s.map($=>$.year))].sort(($,h)=>h-$),i=s.find($=>$.active),o=t.stage_summary||{},l=n.map($=>{let h=Array.from({length:12},(f,p)=>{let y=p+1,S=`${$}${String(y).padStart(2,"0")}`;return qc(t,a.get(S),$,y)}).join("");return`<tr><th scope="row">${r($)}</th>${h}</tr>`}).join(""),d=t.summary||{},c=t.stage_labels||{},v=i?`<div class="index-current-row">${$i({activeMonth:t.active_month||String(i.month||""),activeArchive:t.active_archive||i.active_archive||"",activePhase:t.active_phase||"",processingMonth:t.processing_month||"",processingArchive:t.processing_archive||"",stageLabels:c})}</div>`:"";return`<section class="report-card processing-card import-files-card" data-import-timeline="judgment">
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
  </section>`}function Yc(e,t,s){let n=[t.run_id||e.active_run?.id||e.last_run?.id||"",t.version_id??"",t.collection||"",t.started_at||""].join("|"),i=Date.now(),o=di.get(n);if(!o){let h=Date.parse(t.started_at||""),f=Date.parse(t.finished_at||""),p=Date.parse(t.updated_at||"");t.run_status!=="running"&&Number.isFinite(h)&&(Number.isFinite(f)||Number.isFinite(p))?o={at:h,indexed:0}:o={at:i,indexed:Math.max(0,s)},di.set(n,o)}let l=Date.parse(t.finished_at||""),d=Date.parse(t.updated_at||""),c=t.run_status==="running"?i:Number.isFinite(l)?l:Number.isFinite(d)?d:i,v=Math.max(0,(c-Number(o.at||0))/1e3),$=Math.max(0,Number(s)-Number(o.indexed||0));return v<=0||$<=0?0:$/v}function Xc(e){let t=e.index_runtime||{};if(!t.available)return`<section class="report-card processing-card index-runtime-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("cloud",14)}Ollama \u9023\u7DDA\u6E2C\u8A66</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A\u6E2C\u8A66\u7684\u4E3B\u6A5F\u3001\u6A21\u578B\u8207\u9078\u7528\u7D50\u679C\u3002</div>
    </section>`;let s=!!t.coverage_only,a=t.embedding||{},n=Array.isArray(a.hosts)?a.hosts:[],i=a.selected||{},o=a.active||{},l=t.current||{},d=t.summary||{},c=Number(d.indexed??l.indexed??0),v=s?0:Yc(e,t,c),$=s?"":`<span class="badge badge-neutral index-runtime-rate" title="\u81EA\u672C\u6B21\u9801\u9762\u958B\u59CB\u89C0\u5BDF\u7684\u7D2F\u8A08\u5E73\u5747\uFF1B\u4E2D\u9014\u52A0\u5165\u4EE5\u9996\u6B21\u89C0\u5BDF\u6642\u9593\u8207\u7B46\u6578\u70BA\u57FA\u6E96\u3002\u5F8C\u6BB5\u82E5\u4EE5\u65B0 embedding \u70BA\u4E3B\uFF0C\u901F\u5EA6\u6703\u4E0B\u964D\u3002">\u672C\u6B21\u5E73\u5747 ${v>0?`${v.toFixed(1)} \u7B46/\u79D2`:"\u2014"}</span>`,h=i.url||"",f=o.url||"",p=n.map(N=>Vc(N,h)).join(""),y=t.run_status==="running"?l.preparing?"\u6E96\u5099\u4E2D":"\u76EE\u524D\u8655\u7406":"\u6700\u5F8C\u8655\u7406",S=l.jid?`<div class="index-current-row">
        <span class="badge badge-info">${m("activity",11)}${y}</span>
        <strong class="mono">${r(Mn(l.month))}</strong>
        <span class="mono">${r(l.archive||"\u2014")}</span>
        <span class="mono">${r(l.jid||"\u2014")}</span>
        <span class="index-current-copy">${r([l.court,l.title].filter(Boolean).join(" \xB7 ")||"\u2014")}</span>
        <span class="faint">${l.preparing?"\u6E96\u5099\u4E2D":`\u6279\u6B21 ${u(l.batch_size)} \u7B46`}</span>
      </div>`:"";return`<section class="report-card processing-card index-runtime-card"${s?" hidden":""}>
    <div class="side-card-head">
      <span class="side-card-title">${m("cloud",14)}Ollama \u9023\u7DDA\u6E2C\u8A66</span>
      ${ot(a.status||"idle")}
    </div>
    ${t.error?`<div class="processing-update-notice index-runtime-error">${m("alert",13)}<span>${r(t.error)}</span></div>`:""}
    <div class="index-selected-host">
      <span class="faint">\u6700\u5F8C\u9078\u7528</span>
      <strong class="mono">${r(i.url||"\u2014")}</strong>
      <span>${r(i.model||a.model||"\u2014")}</span>
      <span class="mono">port ${r(i.port??"\u2014")}</span>
      ${f&&f!==h?`<span class="badge badge-warn">\u76EE\u524D\u4F7F\u7528 ${r(f)}</span>`:""}
      ${o.using_fallback?'<span class="badge badge-warn">\u5DF2\u5207\u63DB\u5099\u63F4</span>':""}
    </div>
    <div class="index-host-list">${p||'<div class="processing-workflow-empty">\u6C92\u6709\u53EF\u986F\u793A\u7684\u4E3B\u6A5F\u6E2C\u8A66\u7D50\u679C\u3002</div>'}</div>
    ${a.tested_at?`<div class="index-runtime-foot">\u6E2C\u8A66\u6642\u9593 ${r(je(a.tested_at))}</div>`:""}
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
    ${S}
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
      <span>Volume \u5BB9\u91CF</span><strong class="mono">${Le(l)}${n.volume_size?` \xB7 ${r(n.volume_size)}`:""}</strong>
      <span>Volume \u4F86\u6E90\u8DEF\u5F91</span><strong class="mono index-storage-path">${r(n.host_path||"\u2014")}</strong>
      <span>Collection</span><strong class="mono">${r(n.collection||o.collection||"\u2014")}</strong>
      <span>Alias</span><strong class="mono">${r(n.alias||"\u2014")}</strong>
      <span>Points\uFF0FSegments</span><strong class="mono">${u(d)} / ${u(c)}</strong>
    </div>
    <div class="index-runtime-foot">\u8CC7\u6599\u6642\u9593 ${r(je(t.checked_at))}</div>
  </section>`}function jn({badge:e="",lead:t="",rows:s=[],note:a=""}){return`<section class="report-card processing-card parquet-help-card workflow-help-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("info",14)}\u529F\u80FD\u8AAA\u660E</span>
      ${e?`<span class="badge badge-neutral">${r(e)}</span>`:""}
    </div>
    <div class="parquet-help-body">
      <p class="parquet-help-lead">${t}</p>
      <div class="parquet-help-grid">${s.map(([n,i])=>`<span>${r(n)}</span><strong>${i}</strong>`).join("")}</div>
      ${a?`<p class="parquet-help-note">${a}</p>`:""}
    </div>
  </section>`}function ed(){return jn({badge:"\u552F\u8B80\u532F\u51FA",lead:"\u5C07 PostgreSQL \u76EE\u524D\u6709\u6548\u7684\u5224\u6C7A\uFF08<code>judgment_documents.is_current = true</code>\uFF09\u532F\u51FA\u6210\u7368\u7ACB\u7684 Parquet \u5FEB\u7167\uFF0C\u4F9B\u96E2\u7DDA\u5206\u6790\u3001\u8CC7\u6599\u4EA4\u63DB\u6216\u4FDD\u5B58\u3002",rows:[["\u4F86\u6E90","PostgreSQL <code>judgment_documents</code>\uFF0C\u53EA\u542B\u76EE\u524D\u6709\u6548\u4E14\u5DF2\u547D\u4E2D\u91D1\u878D\u6CD5\u898F\u6E05\u55AE\u7684\u5224\u6C7A\u3002"],["\u8F38\u51FA",'<span class="mono">JUDGMENT_DATA_DIR/parquet/judgments/YYYYMMDD/HHMMSS-xxxxxxxx/judgments.parquet</span>'],["\u9644\u5E36\u6A94",'<span class="mono">\u540C\u76EE\u9304 manifest.json\uFF08\u7B46\u6578\u3001\u6A94\u6848\u5927\u5C0F\u3001\u6B04\u4F4D\u3001\u7522\u751F\u6642\u9593\uFF09</span>'],["\u5167\u5BB9","\u6848\u865F\u3001\u6CD5\u9662\u3001\u6848\u7531\u3001\u5168\u6587\u3001\u547D\u4E2D\u6CD5\u898F\u3001\u5F15\u7528\u3001\u4F86\u6E90\u58D3\u7E2E\u6A94\u8207\u6642\u9593\u6B04\u4F4D\uFF1B<code>citations</code> \u4EE5 JSON \u5B57\u4E32\u4FDD\u5B58\u3002"],["\u8207\u539F\u59CB Parquet","\u8CC7\u6599\u9801\u8207 <code>source=parquet</code> \u4F7F\u7528 <code>parquet/raw_judgments/.../raw.parquet</code>\uFF1B\u672C\u6D41\u7A0B\u7684 <code>parquet/judgments/...</code> \u662F\u53E6\u4E00\u500B\u6B63\u898F\u5316\u5FEB\u7167\u3002"],["\u4E0D\u6703","\u4E0D\u5BEB\u56DE PostgreSQL\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u820A\u5FEB\u7167\uFF1B\u53EA\u532F\u51FA current \u8CC7\u6599\uFF0C\u4E0D\u542B\u6B77\u53F2\u7248\u672C\u3002"],["\u4E2D\u65B7","\u6BCF\u6B21\u57F7\u884C\u5EFA\u7ACB\u65B0\u7684\u5B8C\u6574\u5FEB\u7167\uFF1B\u4E2D\u65B7\u5F8C\u91CD\u65B0\u57F7\u884C\u4E0D\u6703\u7E8C\u5BEB\u540C\u4E00\u500B Parquet \u6A94\u3002"]],note:"\u9069\u5408 DuckDB\u3001pandas\u3001Spark \u7B49\u96E2\u7DDA\u5206\u6790\uFF0C\u6216\u9700\u8981\u56FA\u5B9A\u6642\u9593\u9EDE\u7684\u53EF\u91CD\u73FE\u8CC7\u6599\u5FEB\u7167\u3002\u65E5\u5E38 RAG \u67E5\u8A62\u8207\u8CC7\u6599\u9801\u700F\u89BD\u4E0D\u9700\u8981\u57F7\u884C\u6B64\u6D41\u7A0B\u3002"})}function td(){return jn({badge:"PostgreSQL \u56DE\u586B",lead:"\u5C07\u5224\u6C7A\u7684 <code>court</code> \u8F49\u6210\u6A19\u6E96\u6CD5\u9662\u540D\u7A31\u4E26\u5BEB\u5165 <code>court_normalized</code>\uFF1B\u539F\u59CB <code>court</code> \u6703\u4FDD\u7559\u4F9B\u8FFD\u6EAF\u3002",rows:[["\u8655\u7406\u7BC4\u570D","\u9810\u8A2D\u53EA\u8655\u7406 <code>court_normalized</code> \u70BA\u7A7A\u7684\u8CC7\u6599\uFF1B\u5DF2\u6B63\u898F\u5316\u8CC7\u6599\u6703\u8DF3\u904E\uFF0C\u53EF\u7528 <code>--all</code> \u91CD\u65B0\u8A08\u7B97\u5168\u90E8\u3002"],["\u89E3\u6790\u9806\u5E8F","\u539F\u59CB\u6CD5\u9662\u503C\u958B\u982D\u7B26\u5408\u6A19\u6E96\u540D\u7A31 \u2192 \u5224\u6C7A\u5168\u6587\u524D 8,000 \u5B57\u6700\u65E9\u51FA\u73FE\u7684\u6CD5\u9662 \u2192 \u539F\u59CB\u6CD5\u9662\u503C\u4EFB\u610F\u4F4D\u7F6E\u7684\u6A19\u6E96\u540D\u7A31 \u2192 JID \u5B98\u65B9\u6CD5\u9662\u4EE3\u78BC\u3002"],["\u8F38\u51FA","\u5BEB\u5165 <code>judgment_documents.court_normalized</code>\uFF1B\u4E0D\u4FEE\u6539\u539F\u59CB <code>court</code>\u3001\u5168\u6587\u6216\u5176\u4ED6\u5224\u6C7A\u6B04\u4F4D\u3002"],["\u672A\u89E3\u6790","\u7121\u6CD5\u5224\u65B7\u6642\u4FDD\u7559\u7A7A\u503C\uFF0C\u4E0D\u731C\u6E2C\uFF1B\u6458\u8981\u6703\u5217\u51FA\u672A\u89E3\u6790\u7B46\u6578\u8207\u5E38\u898B\u6A23\u672C\u3002"],["\u5F71\u97FF","\u8CC7\u6599\u9801\u7684\u6CD5\u9662\u4E0B\u62C9\u3001\u7CBE\u78BA\u7BE9\u9078\u3001\u6392\u5E8F\u3001\u7D50\u679C\u6B04\u4F4D\u8207\u5224\u6C7A\u539F\u6587\u4F7F\u7528\u6B63\u898F\u5316\u540D\u7A31\uFF1BAPI \u4ECD\u56DE\u50B3 <code>court_raw</code>\u3002"],["\u4E0D\u6703","\u4E0D\u91CD\u65B0\u532F\u5165\u5224\u6C7A\u3001\u4E0D\u6539\u5168\u6587\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u8CC7\u6599\u3002"],["\u91CD\u8DD1","\u9810\u8A2D\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u898F\u5247\u66F4\u65B0\u5F8C\u53EF\u7528 <code>--all</code> \u91CD\u7B97\uFF0C\u6216\u5148\u7528 <code>--dry-run</code> \u7D71\u8A08\u3002"]],note:"\u9069\u5408\u5728\u5224\u6C7A\u532F\u5165\u5F8C\u3001\u6CD5\u9662\u540D\u7A31\u898F\u5247\u66F4\u65B0\u5F8C\uFF0C\u6216\u8CC7\u6599\u9801\u6CD5\u9662\u9078\u9805\u51FA\u73FE\u7F3A\u6F0F\u6642\u57F7\u884C\u3002\u7D50\u679C\u4E5F\u6703\u5BEB\u5165\u6548\u80FD\u7D00\u9304\u3002"})}function sd(){return jn({badge:"\u689D\u6587\u6B77\u53F2\u5EFA\u6A94",lead:"\u70BA\u65E2\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u5EFA\u7ACB <code>law_article_versions</code> \u6B77\u53F2\u689D\u6587\u5FEB\u7167\u8207 <code>law_article_change_events</code> \u8B8A\u66F4\u7D00\u9304\uFF0C\u8B93\u8CC7\u6599\u9801\u80FD\u5207\u63DB\u6B77\u53F2\u7248\u672C\u4E26\u67E5\u770B\u689D\u6587\u5DEE\u7570\u3002",rows:[["\u4F86\u6E90","PostgreSQL \u6CD5\u898F\u7248\u672C\uFF0C\u4EE5\u53CA <code>LAW_DATA_DIR/raw_parquet</code> \u5167\u5C0D\u61C9\u7684\u539F\u59CB\u6CD5\u898F Parquet \u5FEB\u7167\u3002"],["\u5339\u914D\u65B9\u5F0F","\u4EE5 raw Parquet manifest \u7684 <code>zip_sha256</code>\uFF0F<code>raw_json_sha256</code> \u5C0D\u61C9\u6CD5\u898F\u7248\u672C\uFF0C\u4E0D\u731C\u6E2C\u5167\u5BB9\u3002"],["\u7522\u751F\u5167\u5BB9","<code>article_key</code>\uFF08\u689D\u6587\u985E\u578B\uFF0B\u689D\u865F\uFF09\u3001<code>content_hash</code>\u3001\u689D\u6587\u5168\u6587\u8207\u751F\u6548\u65E5\uFF1B\u8207\u524D\u4E00\u7248\u672C\u6BD4\u8F03\u5F8C\u8A18\u9304 <code>added</code>\uFF0F<code>modified</code>\uFF0F<code>removed</code>\u3002"],["\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB","\u5206\u9801\u4E0A\u65B9\u7684\u552F\u8B80\u6AA2\u67E5\u6703\u8B80\u53D6 <code>law_article_versions</code> \u8207\u539F\u59CB Parquet\uFF0C\u5224\u65B7\u7248\u672C\u662F\u5426\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\uFF1B\u6AA2\u67E5\u672C\u8EAB\u4E0D\u6703\u4FEE\u6539\u8CC7\u6599\u5EAB\u3002"],["\u53EF\u5EFA\u7ACB","\u627E\u5230\u5C0D\u61C9\u539F\u59CB Parquet \u7684\u7248\u672C\uFF0C\u53EF\u76F4\u63A5\u57F7\u884C\u6B64\u6D41\u7A0B\u5EFA\u7ACB\u689D\u6587\u6B77\u53F2\u3002"],["\u7F3A\u539F\u59CB\u6A94","\u627E\u4E0D\u5230\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u6A19\u793A\u7121\u6CD5\u5EFA\u7ACB\uFF0C\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD\uFF1B\u6B64\u6D41\u7A0B\u6703\u8DF3\u904E\u4E26\u5217\u5728 <code>missing_versions</code>\u3002"],["\u6AA2\u67E5\u7D50\u679C","\u5E74\u4EFD\xD7\u6708\u4EFD\u8868\u986F\u793A\u5DF2\u5EFA\u7ACB\uFF0F\u672A\u5EFA\u7ACB\uFF0F\u90E8\u5206\u5EFA\u7ACB\uFF1B\u4E0B\u65B9\u5217\u51FA\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3001\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u7248\u672C\u65E5\u671F\u8207\u53EF\u5EFA\u7ACB\u72C0\u614B\u3002\u76EE\u524D\u72C0\u614B\u4EE5\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u5361\u7247\u5373\u6642\u986F\u793A\u3002"],["\u8DF3\u904E\u689D\u4EF6","\u5DF2\u6709\u689D\u6587\u5FEB\u7167\u7684\u7248\u672C\u6703\u8DF3\u904E\uFF1B\u627E\u4E0D\u5230\u53EF\u8B80\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u5217\u5165 <code>missing_versions</code>\uFF0C\u4E0D\u5EFA\u7ACB\u865B\u69CB\u689D\u6587\u3002"],["\u4E0D\u6703","\u4E0D\u4E0B\u8F09\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u4E0D\u89E3\u6790\u65B0 ZIP\u3001\u4E0D\u4FEE\u6539 <code>law_documents</code> \u6216\u76EE\u524D\u7248\u672C\u3001\u4E0D\u66F4\u65B0 Qdrant\uFF0FIndexedDB\u3002"],["\u8F38\u51FA\u6458\u8981","\u7248\u672C\u6578\u3001\u8DF3\u904E\u7248\u672C\u6578\u3001\u7F3A\u5C11\u5FEB\u7167\u7248\u672C\u3001\u5BEB\u5165\u689D\u6587\u6578\u8207\u689D\u6587\u8B8A\u66F4\u4E8B\u4EF6\u6578\u3002"],["\u91CD\u8DD1","\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u5DF2\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u4E0D\u6703\u91CD\u8907\u63D2\u5165\u3002"]],note:"\u9069\u5408\u5F9E\u820A\u7248 schema \u5347\u7D1A\u3001\u65E2\u6709\u6CD5\u898F\u7248\u672C\u7F3A\u5C11\u6B77\u53F2\u689D\u6587\uFF0C\u6216\u8CC7\u6599\u9801\u6B77\u53F2\u689D\u6587\u7248\u672C\u8207\u8B8A\u66F4\u7D00\u9304\u4E0D\u5B8C\u6574\u6642\u57F7\u884C\u3002\u57F7\u884C\u524D\u53EF\u5148\u7528\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u78BA\u8A8D\u54EA\u4E9B\u7248\u672C\u53EF\u5EFA\u7ACB\u3001\u54EA\u4E9B\u7F3A\u539F\u59CB\u6A94\u3002"})}function ad(e={}){let t=e.courtCheck,s=!!e.courtCheckLoading,a=e.courtCheckError,n=`<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-court-check"${s?" disabled":""}>${m("refresh",12)}<span>${s?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31"}</span></button>`;if(a)return`<section class="report-card processing-card court-check-card">
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
    </section>`;let d={green:"\u5DF2\u6AA2\u67E5",red:"\u672A\u6AA2\u67E5",gray:"\u9700\u6B63\u898F\u5316"},c=new Map(i.map(h=>[String(h.month),h])),$=[...new Set(i.map(h=>h.year))].sort((h,f)=>f-h).map(h=>{let f=Array.from({length:12},(p,y)=>{let S=y+1,N=`${h}${String(S).padStart(2,"0")}`,E=c.get(N);if(!E)return`<td class="judgment-month is-empty"><span>${S}</span></td>`;let I=d[E.status]?E.status:"red",H=[`${h}-${String(S).padStart(2,"0")}`,d[I],`\u7E3D ${u(E.total)} \u7B46`,`\u5DF2\u6AA2\u67E5 ${u(E.checked)} \u7B46`,`\u672A\u6AA2\u67E5 ${u(E.unchecked)} \u7B46`,E.invalid?`\u7121\u6548\u503C ${u(E.invalid)} \u7B46`:"",`\u6709\u6548 ${Rt(E.percent)}`].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month court-check-month is-${I}" title="${r(H)}"><span>${S}</span></td>`}).join("");return`<tr><th scope="row">${r(h)}</th>${f}</tr>`}).join("");return`<section class="report-card processing-card court-check-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("search",14)}\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31</span>
      ${n}
    </div>
    <div class="judgment-months">
      <div class="judgment-months-meta">
        <span class="badge badge-ok">\u5DF2\u6AA2\u67E5 ${u(o.green||0)}</span>
        <span class="badge badge-danger">\u672A\u6AA2\u67E5 ${u(o.red||0)}</span>
        <span class="badge badge-neutral">\u9700\u6B63\u898F\u5316 ${u(o.gray||0)}</span>
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(h,f)=>`<th scope="col">${f+1}</th>`).join("")}</tr></thead>
          <tbody>${$}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u5168\u90E8\u5DF2\u6B63\u898F\u5316\uFF1B\u7D05\u8272\uFF1A\u5B8C\u5168\u672A\u6AA2\u67E5\uFF1B\u7070\u8272\uFF1A\u90E8\u5206\u672A\u6B63\u898F\u5316\u6216\u6709\u7121\u6548\u503C\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u7B46\u6578\u8207\u6709\u6548\u6BD4\u4F8B\u3002</p>
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${r(je(t.checked_at))} \xB7 \u6A19\u6E96\u6CD5\u9662\u540D\u7A31 ${u(t.canonical_count)} \u500B</div>
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
    </section>`;let d={green:"\u5DF2\u5EFA\u7ACB",red:"\u672A\u5EFA\u7ACB",gray:"\u90E8\u5206\u5EFA\u7ACB"},c=new Map(i.map(J=>[String(J.month),J])),$=[...new Set(i.map(J=>J.year))].sort((J,B)=>B-J).map(J=>{let B=Array.from({length:12},(k,C)=>{let ne=C+1,me=`${J}${String(ne).padStart(2,"0")}`,W=c.get(me);if(!W)return`<td class="judgment-month is-empty"><span>${ne}</span></td>`;let ee=d[W.status]?W.status:"red",ae=[`${J}-${String(ne).padStart(2,"0")}`,d[ee],`\u7248\u672C ${u(W.version_count)}\uFF08\u6CD5\u898F ${u(W.law_versions)}\uFF0F\u547D\u4EE4 ${u(W.order_versions)}\uFF09`,`\u5DF2\u5EFA\u7ACB ${u(W.backfilled_count)}`,`\u672A\u5EFA\u7ACB ${u(W.missing_count)}`,`\u9700\u5EFA\u7ACB ${u(W.needs_backfill_count)}\uFF08\u53EF\u5EFA\u7ACB ${u(W.backfillable_count)}\uFF0F\u7F3A\u539F\u59CB\u6A94 ${u(W.blocked_count)}\uFF09`,`\u689D\u6587\u5217 ${u(W.article_rows)} / \u9810\u671F ${u(W.article_count)}`,W.current?"\u76EE\u524D\u7248\u672C":"",W.versions?.length?`\u7248\u672C ${W.versions.map(Z=>`#${Z.version_id}`).join("\u3001")}`:""].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month law-version-month is-${ee}${W.current?" is-current":""}" title="${r(ae)}"><span>${ne}</span></td>`}).join("");return`<tr><th scope="row">${r(J)}</th>${B}</tr>`}).join(""),h={law:"\u6CD5\u898F",order:"\u547D\u4EE4"},f=i.flatMap(J=>(J.versions||[]).filter(B=>B.needs_backfill).map(B=>({...B,month:J.month}))).sort((J,B)=>B.version_id-J.version_id),p=f.slice(0,20),y=p.map(J=>{let B=J.backfillable?"badge-info":J.blocked?"badge-danger":"badge-neutral",k=J.backfillable?"\u53EF\u5EFA\u7ACB":J.blocked?"\u7F3A\u539F\u59CB\u6A94":"\u5F85\u6AA2\u67E5";return`<div class="law-backfill-needed-row">
        <strong class="mono">#${J.version_id}</strong>
        <span class="badge ${B}">${k}</span>
        <span>${r(h[J.source_type]||J.source_type||"\u2014")}</span>
        <span class="mono">${r(J.update_date||J.month||"\u2014")}</span>
        <span class="law-backfill-needed-reason">${r(J.reason||"\u2014")}</span>
      </div>`}).join(""),S=f.length?`<div class="law-backfill-needed">
        <div class="law-backfill-needed-head">\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C <span class="badge badge-warn">${u(f.length)}</span></div>
        <div class="law-backfill-needed-list">${y}</div>
        ${f.length>p.length?`<div class="law-backfill-needed-more">\u53E6\u6709 ${u(f.length-p.length)} \u500B\u7248\u672C\u672A\u5217\u51FA</div>`:""}
      </div>`:'<div class="law-backfill-needed is-clear">\u76EE\u524D\u6C92\u6709\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3002</div>',N=Number(l.needs_backfill_versions)||0,E=Number(l.backfillable_versions)||0,I=Number(l.blocked_versions)||0,H=Number(l.backfilled_versions)||0,V=Number(l.versions)||0,Y=N<=0?"ok":I>0?"danger":"warn",ye=N<=0?"\u4E0D\u9700\u8981\u5EFA\u7ACB":"\u9700\u8981\u5EFA\u7ACB",Te=N>0?`\u9700\u8981\u5EFA\u7ACB ${u(N)} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF1A\u53EF\u5EFA\u7ACB ${u(E)}\u3001\u7F3A\u539F\u59CB\u6A94 ${u(I)}\u3002\u5DF2\u6709\u6B77\u53F2\u689D\u6587 ${u(H)} \u500B\u7248\u672C${I>0?"\uFF1B\u7F3A\u539F\u59CB\u6A94\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD":""}\u3002`:`\u76EE\u524D ${u(V)} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`;return`<section class="report-card processing-card law-version-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
      ${n}
    </div>
    <div class="law-version-check-status is-${Y}" role="status" aria-live="polite">
      <span class="badge badge-${Y}">${ye}</span>
      <span>${r(Te)}</span>
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
      ${S}
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${r(je(t.checked_at))}</div>
    </div>
  </section>`}function rd(){return`<div class="processing-ollama-loading">
    <span class="spinner" aria-hidden="true"></span>
    <span>\u6B63\u5728\u6AA2\u67E5 Ollama \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span>
  </div>`}function id(e,t,s){let a=Array.isArray(e?.hosts)?e.hosts:[];if(s&&!a.length)return`${Ne({tone:"danger",title:"Ollama \u4E3B\u6A5F\u8B80\u53D6\u5931\u6557",text:r(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
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
    <p class="processing-ollama-hint">\u62D6\u79FB\u6216\u4F7F\u7528\u7BAD\u982D\u8ABF\u6574 embedding \u512A\u5148\u9806\u5E8F\uFF1B\u76EE\u524D\u4E3B\u6A5F\u7121\u6CD5\u4F7F\u7528\u6642\uFF0C\u6703\u4F9D\u5E8F\u81EA\u52D5\u6539\u7528\u4E0B\u4E00\u53F0\uFF08\u5404\u53F0\u9700\u5177\u5099\u76F8\u540C\u7684 embedding \u6A21\u578B\uFF09\uFF0C\u76F4\u5230\u6709\u4E3B\u6A5F\u56DE\u50B3\u5411\u91CF\u3002</p>`}function od(e,t={}){let s=e.active_run||null,a=s||e.last_run||null,n=!!s||qt===e.id,i=!!e.can_run&&!n,o=Array.isArray(e.command)?e.command.join(" "):"";return`<div class="processing-workflow-panel">
    ${Ne({tone:"info",title:e.label,text:e.description||""})}
    ${e.update_available?`<div class="processing-update-notice" role="status">
            ${m("refresh",13)}
            <span>${r(e.update_status&&e.update_status.message||"\u7DDA\u4E0A\u5075\u6E2C\u5230\u65B0\u7248")}</span>
            <span class="badge badge-warn">\u66F4\u65B0</span>
          </div>`:""}
    ${e.id==="legal_index_versions"?xc(e.index_timelines):""}
    ${e.id==="normalize_courts"?ad(t):""}
    ${e.id==="backfill_law_articles"?nd(t):""}
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${m(wi[e.id]||"terminal",14)}\u57F7\u884C\u8CC7\u8A0A</span>
        <span class="badge badge-neutral badge-mono">${r(e.branch||"")}</span>
      </div>
      <div class="processing-workflow-command-grid">
        <span>\u7A0B\u5F0F</span><code>${r(e.program||"\u2014")}</code>
        <span>Shell\uFF0F\u5165\u53E3</span><code>${r(e.script||"\u2014")}</code>
        <span>\u5BE6\u969B\u547D\u4EE4</span><code class="processing-workflow-command">${r(o||"\u2014")}</code>
      </div>
      ${kn.has(e.id)?'<div class="processing-embedding-strip-slot" data-processing-embedding-strip data-preserve-children></div>':""}
      <div class="processing-workflow-actions">
        <button class="btn btn-primary btn-sm" type="button"
          data-processing-action="run-workflow"
          data-workflow-id="${r(e.id)}"
          ${i?"":"disabled"}>
          ${m("play",14)}<span>${n?"\u57F7\u884C\u4E2D":"\u57F7\u884C\u6B64\u6D41\u7A0B"}</span>
        </button>
        ${["law_download","order_download","judgment_download"].includes(e.id)?`<button class="btn btn-secondary btn-sm" type="button"
                data-processing-action="check-updates"
                data-workflow-id="${r(e.id)}">
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
      <div class="side-card-foot">
        \u57F7\u884C\u7D50\u679C\u6703\u5BEB\u5165\u5171\u7528\u8655\u7406\u72C0\u614B\u6A94\uFF0C\u53EF\u5F9E\u8655\u7406\u7E3D\u89BD\u67E5\u770B\u3002
      </div>
    </section>
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
            <div data-judgment-months-slot data-preserve-children>${An()}</div>
          </section>`:""}
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${m("history",14)}\u6700\u8FD1\u57F7\u884C</span>
        ${ot(a?.status||"idle")}
      </div>
      ${Cc(a)}
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
  </section>`;let t=e.querySelector(".processing-page"),s=e.querySelector("#processing-root"),a=e.querySelector("#processing-workflows"),n=e.querySelector("#processing-stop"),i=document.createElement("div");i.className="processing-stage-tooltip",i.hidden=!0,t.appendChild(i),St=new Map;let o=!1,l=!1,d=!1,c=null,v="",$="",h="overview",f=null,p=!1,y=null,S=null,N=!1,E=null,I=0,H=null,V=!1,Y=null,ye=0,Te=null,J=!1,B=null,k=0,C=null,ne=!1,me=null,W=0,ee=!1,ae=null,Z=!1,we=!1,z="",ve=new Set,qe=null,ge=null,Xe=-1,Oe="",Ue=0,Be=0,Qe=null,Ge=[],mt=()=>({storage:S,loading:N,error:E,courtCheck:H,courtCheckLoading:V,courtCheckError:Y,lawVersionCheck:Te,lawVersionCheckLoading:J,lawVersionCheckError:B}),j=()=>{if(h!=="judgment_download")return;let b=s.querySelector(".processing-workflow-panel");if(!b)return;b.querySelectorAll(".judgment-month.is-active").forEach(Pe=>{Pe.classList.remove("is-active"),Pe.removeAttribute("aria-current")});let w=b.querySelector("[data-judgment-progress]");if(!w)return;let P=f?.progress,le=!!(c?.workflows||[]).find(Pe=>Pe.id==="judgment_download")?.active_run;if((!P||P.active===!1)&&!le){w.hidden=!0,w.classList.remove("is-indeterminate");return}if(w.hidden=!1,!P||P.active===!1){let Pe=w.querySelector("[data-judgment-progress-phase]");Pe&&(Pe.textContent="\u6E96\u5099\u4E2D");let ut=w.querySelector("[data-judgment-progress-month]");ut&&(ut.textContent="\u2014");let Re=w.querySelector("[data-judgment-progress-filename]");Re&&(Re.textContent="\u7B49\u5F85\u4E0B\u8F09\u7A0B\u5E8F\u56DE\u5831\u9032\u5EA6\u2026",Re.title=""),w.classList.add("is-indeterminate");let gt=w.querySelector("[data-judgment-progress-bar]");gt&&(gt.style.width="");let Fe=w.querySelector("[data-judgment-progress-percent]");Fe&&(Fe.textContent="\u2014");let ft=w.querySelector("[data-judgment-progress-size]");ft&&(ft.textContent="\u2014");let yt=w.querySelector("[data-judgment-progress-note]");yt&&(yt.textContent="\u5DF2\u555F\u52D5\uFF0C\u7B49\u5F85\u9032\u5EA6\u56DE\u5831");return}let re={preparing:"\u6E96\u5099\u4E2D",scanning:"\u6383\u63CF\u4E2D",checking:"\u6AA2\u67E5\u4E2D",downloading:"\u4E0B\u8F09\u4E2D",saving:"\u5132\u5B58\u4E2D",finalizing:"\u6574\u7406\u4E2D"}[P.phase]||"\u8655\u7406\u4E2D",pe=w.querySelector("[data-judgment-progress-phase]");pe&&(pe.textContent=re);let ie=P.month||"",he=w.querySelector("[data-judgment-progress-month]");he&&(he.textContent=ie||"\u2014");let Me=P.filename||"",_e=w.querySelector("[data-judgment-progress-filename]");if(_e&&(_e.textContent=Me||"\u2014",_e.title=Me),ie){let Pe=b.querySelector(`[data-judgment-month-key="${ie}"]`);Pe&&(Pe.classList.add("is-active"),Pe.setAttribute("aria-current","true"))}let g=Number(P.bytes_written),T=Number(P.total_bytes),D=Number.isFinite(T)&&T>0,se=null,be=P.percent;be!=null&&be!==""&&Number.isFinite(Number(be))?se=Number(be):D&&Number.isFinite(g)&&(se=g/T*100);let xe=se===null;w.classList.toggle("is-indeterminate",xe);let ze=w.querySelector("[data-judgment-progress-bar]");ze&&(ze.style.width=xe?"":`${Math.min(100,Math.max(0,se)).toFixed(1)}%`);let Ce=w.querySelector("[data-judgment-progress-percent]");if(Ce){let Pe=xe?null:Math.min(100,Math.max(0,se));Ce.textContent=Pe===null?"\u2014":`${Pe.toFixed(Pe>=10?0:1)}%`}let et=w.querySelector("[data-judgment-progress-size]");if(et){let Pe=Number.isFinite(g)&&g>0?Le(g):"\u2014";et.textContent=D?`${Pe} / ${Le(T)}`:Pe}let nt=w.querySelector("[data-judgment-progress-note]");if(nt){let Pe=[],ut=Number(P.candidate_index),Re=Number(P.candidate_total);Number.isFinite(ut)&&ut>0&&Number.isFinite(Re)&&Re>0&&Pe.push(`\u7B2C ${u(ut)} / ${u(Re)} \u500B\u6708`),P.fileset_id&&Pe.push(`fileset ${P.fileset_id}`),P.message&&P.phase!=="downloading"&&Pe.push(String(P.message)),nt.textContent=Pe.join(" \xB7 ")}},O=()=>{if(h!=="judgment_download")return;let b=s.querySelector("[data-judgment-months-slot]");if(b){let w=Array.isArray(f?.months)?f.months:[];y&&!f?(b.innerHTML=Ne({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:r(y)}),delete b.dataset.judgmentMonthCount):f?b.dataset.judgmentMonthCount!==String(w.length)?(b.innerHTML=Dc(f),b.dataset.judgmentMonthCount=String(w.length)):Fc(b,f):(b.querySelector(".judgment-months-loading")||(b.innerHTML=An()),delete b.dataset.judgmentMonthCount)}j()},x=()=>{let b=Array.isArray(C?.hosts)?C.hosts:[];return JSON.stringify({loading:!b.length&&ne,error:!b.length&&me?me.message||String(me):"",active:C?.active_host_id??null,hosts:b.map(w=>({id:w.id,name:w.name,url:w.base_url,status:w.status,detail:w.detail,embedding:w.embedding_model,chat:w.chat_model,models:(w.models||[]).map(P=>P.name)}))})},L=()=>{let b=s.querySelector("[data-processing-ollama]");if(!b||W)return;let w=x();b.dataset.ollamaSignature!==w&&(b.dataset.ollamaSignature=w,b.innerHTML=id(C,ne,C?null:me))},X=()=>{let w=((c?.sections||[]).find(P=>P.key==="legal")?.stages||[]).find(P=>P.key==="legal_qdrant");return String(w?.model?.label||"")},F=()=>{let b=s.querySelector("[data-processing-embedding-strip]");if(!b)return;let w=Array.isArray(C?.hosts)?C.hosts:[],P=[];for(let ie of w)if(ie.status==="operational")for(let he of ie.models||[])Array.isArray(he.capabilities)&&he.capabilities.includes("embedding")&&P.push({hostId:Number(ie.id),model:he.name,label:`${ie.name||ie.base_url||`\u4E3B\u6A5F ${ie.id}`}:${he.name}`,baseUrl:ie.base_url||""});let ue=X(),le=w.find(ie=>Number(ie.id)===Number(C?.active_host_id)),te=P.map(ie=>{let he=ie.label===ue;return`<button class="rag-model-button${he?" is-active":""}" type="button"
        data-processing-action="select-embedding-model"
        data-host-id="${ie.hostId}"
        data-model="${r(ie.model)}"
        title="${r(ie.label)}"
        aria-pressed="${he?"true":"false"}"
        ${we?"disabled":""}>
        <span class="rag-model-state" aria-hidden="true"></span>
        <span>${r(ie.label)}</span>
        ${he?'<span class="rag-model-current">\u4F7F\u7528\u4E2D</span>':""}
      </button>`});ue&&!P.some(ie=>ie.label===ue)&&te.unshift(`<button class="rag-model-button is-active is-static" type="button" aria-pressed="true" disabled>
          <span class="rag-model-state" aria-hidden="true"></span>
          <span>${r(ue)}</span>
          <span class="rag-model-current">\u4F7F\u7528\u4E2D</span>
        </button>`);let re=P.length?`<div class="rag-model-buttons">${te.join("")}</div>`:`<p class="rag-model-empty">${ne?"\u8B80\u53D6\u7DDA\u4E0A\u4E3B\u6A5F\u8207 Embedding model\u2026":me?`\u7121\u6CD5\u8B80\u53D6\u7DDA\u4E0A\u4E3B\u6A5F\uFF1A${r(me.message||String(me))}`:"\u76EE\u524D\u6C92\u6709\u53EF\u7528\u7684 Embedding model\u3002"}</p>`,pe=`<div class="processing-embedding-strip rag-model-strip">
      <div class="rag-model-strip-head">
        <span class="rag-model-strip-title">${m("brain",13)} Embedding \u4E3B\u6A5F\uFF0F\u6A21\u578B</span>
        ${le?.base_url?`<span class="rag-model-strip-base mono">${r(le.base_url)}</span>`:""}
        <span class="rag-model-strip-current">\u76EE\u524D\uFF1A<strong>${r(ue||"\u2014")}</strong></span>
        <button class="btn btn-ghost btn-sm rag-model-refresh" type="button"
          data-processing-action="refresh-embedding-models"
          ${ne?"disabled":""}>
          ${m("refresh",12)}<span>\u6AA2\u67E5\u6A21\u578B</span>
        </button>
      </div>
      ${re}
      <p class="rag-model-hint">\u9EDE\u9078 <span class="mono">\u4E3B\u6A5F:\u6A21\u578B</span> \u5207\u63DB Embedding\uFF1B\u9078\u53D6\u5F8C\u6703\u6210\u70BA\u7B2C\u4E00\u512A\u5148\uFF0C\u5176\u4ED6\u4E3B\u6A5F\u4F9D\u5E8F\u4F5C\u70BA\u5099\u63F4\u3002\u5207\u63DB\u6A21\u578B\u5F8C\u65E2\u6709\u7D22\u5F15\u53EF\u80FD\u9700\u8981\u91CD\u5EFA\u3002</p>
    </div>`;b.innerHTML!==pe&&(b.innerHTML=pe)},Ee=b=>{let w=s.querySelector('[data-import-timeline="judgment"]');if(!w)return;let P=String(b?.active_month||""),ue=String(b?.processing_month||"");w.querySelectorAll(".processing-month").forEach(Me=>{let _e=!!P&&Me.dataset.month===P;Me.classList.toggle("is-current",_e),Me.classList.toggle("is-processing-current",!!ue&&Me.dataset.month===ue),_e?Me.setAttribute("aria-current","true"):Me.removeAttribute("aria-current")});let le=w.querySelector(".index-current-row");if(!P||!b?.active_archive){le&&le.remove();return}let te=c?.workflows?.find(Me=>Me.id==="judgment_import")?.import_timeline?.stage_labels||{},re=$i({activeMonth:P,activeArchive:b.active_archive,activePhase:b.active_phase||"",processingMonth:b.processing_month||"",processingArchive:b.processing_archive||"",stageLabels:te});if(le){le.innerHTML=re;return}let pe=w.querySelector(".judgment-months");if(!pe)return;let ie=document.createElement("div");ie.className="index-current-row",ie.innerHTML=re;let he=pe.querySelector(".judgment-months-meta");he?he.insertAdjacentElement("afterend",ie):pe.prepend(ie)},G=b=>{let w=Number(b?.state_mtime_ns);return Number.isFinite(w)?w:-1},ce=b=>{let w=String(b?.active_month||"");return/^\d{6}$/.test(w)?Number(w):-1},De=b=>{if(!b)return;let w=G(b);if(w>=0&&w<Xe){ge?.active_month&&Ee(ge);return}w>=0&&(Xe=w);let P=String(b.active_month||"");if(!!(b.run_id&&b.run_id===ge?.run_id)&&ce(b)>=0&&ce(b)<ce(ge)){let le={...b,active_month:ge.active_month,active_archive:ge.active_archive};ge=le,Ee(le);return}if(!P&&b.run_status==="running"){ge?.active_month&&ge?.run_id===b.run_id?Ee(ge):(ge=b,Ee(b));return}ge=b,Ee(b)},We=b=>{let w=b?.active_import;if(w){De(w);return}ge?.active_month&&Ee(ge)},At=()=>{o||qe||(qe=vt(["processing","judgment-download","system-usage","ollama","court-check","law-version-check"],(b,w)=>{if(!o){if(b==="processing"){w?.snapshot?.live?qs(w.snapshot):w?.snapshot?Ie(w.snapshot,{silent:!0}):Gt({silent:!0});return}if(b==="judgment-download"){h==="judgment_download"&&Bt({quiet:!0,payload:w?.snapshot||null});return}if(b==="system-usage"){h==="index_versions"&&Qt({quiet:!0,force:!0,payload:w?.snapshot||null});return}if(b==="ollama"){kn.has(h)&&$t({quiet:!0,payload:w?.snapshot||null});return}if(b==="court-check"){h==="normalize_courts"&&_({quiet:!0,force:!0,payload:w?.snapshot||null});return}b==="law-version-check"&&h==="backfill_law_articles"&&q({quiet:!0,force:!0,payload:w?.snapshot||null})}},{onProgress:(b,w)=>{if(b!=="processing")return;let P=w?.event;P&&Ye(P)},onError:()=>{c||Gt({silent:!0})}}))},Ze=()=>{qe&&(qe(),qe=null)},zt=async b=>{if(we)return;let[w,...P]=String(b||"").split("|"),ue=Number(w),le=P.join("|");if(!ue||!le){F();return}let te=(C?.hosts||[]).find(pe=>Number(pe.id)===ue);if(!te){F();return}let re=`${te.name||te.base_url||`\u4E3B\u6A5F ${te.id}`}:${le}`;if(re===X()){F();return}if(!window.confirm(`\u5207\u63DB Embedding \u70BA ${re}\uFF1F

\u5207\u63DB\u6A21\u578B\u5F8C\uFF0C\u65E2\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u8207\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u53EF\u80FD\u4E0D\u76F8\u5BB9\uFF0C\u9700\u8981\u91CD\u65B0\u5EFA\u7ACB\u7D22\u5F15\u3002`)){F();return}we=!0,F();try{await Q.selectOllamaModel(ue,{model:le,role:"embedding"});let pe=(C?.hosts||[]).map(he=>Number(he.id)),ie=[ue,...pe.filter(he=>he!==ue)];await Q.reorderOllamaHosts(ie),M(`\u5DF2\u5207\u63DB Embedding \u70BA ${re}\u3002`,"ok",6e3),C=null,await $t({quiet:!0}),await Gt({silent:!0})}catch(pe){M(pe.message||"\u7121\u6CD5\u5207\u63DB Embedding model\u3002","danger",7e3),await $t({quiet:!0})}finally{we=!1,F()}},$t=async({quiet:b=!1,button:w=null,payload:P=null}={})=>{if(!(o||ne)){ne=!0,me=null,C||(L(),F()),w&&ke(w,!0,"\u6AA2\u67E5\u4E2D\u2026");try{let ue=P||await Q.ollamaHosts();if(o)return;C=ue}catch(ue){if(o)return;me=ue,b||M(ue.message||"\u7121\u6CD5\u6AA2\u67E5 Ollama \u4E3B\u6A5F\u3002","danger",6e3)}finally{o||(ne=!1,w&&ke(w,!1),L(),F())}}},at=async b=>{if(Z)return;let w=(C?.hosts||[]).map(te=>Number(te.id)),P=b.map(te=>Number(te));if(!P.length||P.length!==w.length||P.every((te,re)=>te===w[re])){L();return}Z=!0;let ue=new Map((C?.hosts||[]).map(te=>[Number(te.id),te])),le=P.map(te=>ue.get(te)).filter(Boolean);if(C&&le.length===w.length){C={...C,hosts:le,active_host_id:P[0]};let te=s.querySelector("[data-processing-ollama]");te&&(te.dataset.ollamaSignature=""),L()}try{await Q.reorderOllamaHosts(P),M("\u5DF2\u66F4\u65B0 Ollama \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","ok",3500)}catch(te){M(te.message||"\u7121\u6CD5\u66F4\u65B0 Ollama \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","danger",6e3),await $t({quiet:!0})}finally{Z=!1}},xs=()=>{let b=s.querySelector("[data-processing-ollama]");b&&(b.dataset.ollamaSignature=""),L()},Ht=()=>{let b=ae;if(!b)return;if(s.querySelector(`[data-ollama-host][data-host-id="${b.hostId}"]`)?.classList.remove("is-dragging"),b.captureTarget?.hasPointerCapture?.(b.pointerId))try{b.captureTarget.releasePointerCapture(b.pointerId)}catch{}document.documentElement.classList.remove("processing-ollama-dragging"),window.removeEventListener("pointermove",Ut),window.removeEventListener("pointerup",Mt),window.removeEventListener("pointercancel",It),ae=null,W=0},Ut=b=>{let w=ae;if(!w||b.pointerId!==w.pointerId)return;if(!w.dragging){if(Math.hypot(b.clientX-w.startX,b.clientY-w.startY)<5)return;w.dragging=!0,W=w.hostId,ee=!1,s.querySelector(`[data-ollama-host][data-host-id="${w.hostId}"]`)?.classList.add("is-dragging"),document.documentElement.classList.add("processing-ollama-dragging")}b.preventDefault();let P=64;b.clientY<P?window.scrollBy(0,-12):b.clientY>window.innerHeight-P&&window.scrollBy(0,12);let ue=s.querySelector("[data-ollama-list]"),le=document.elementFromPoint(b.clientX,b.clientY)?.closest?.("[data-ollama-host]");if(!ue||!le||!ue.contains(le))return;let te=ue.querySelector(`[data-ollama-host][data-host-id="${w.hostId}"]`);if(!te||te===le)return;let re=le.getBoundingClientRect(),pe=b.clientY>re.top+re.height/2;ue.insertBefore(te,pe?le.nextSibling:le),ee=!0},Mt=b=>{let w=ae;if(!w||b.pointerId!==w.pointerId)return;let P=w.dragging,ue=ee,le=s.querySelector("[data-ollama-list]"),te=P&&le?[...le.querySelectorAll("[data-ollama-host]")].map(re=>Number(re.dataset.hostId)):[];Ht(),P&&ue&&te.length&&at(te)},It=()=>{let b=!!ae?.dragging;Ht(),b&&xs()},rs=b=>{if(b.button!==0||b.pointerType==="mouse"&&b.buttons!==1||Z||ae)return;let w=b.target.closest("[data-ollama-host]");if(!w||!s.contains(w)||b.target.closest("button")||b.pointerType==="touch"&&!b.target.closest(".processing-ollama-handle"))return;let P=Number(w.dataset.hostId)||0;if(P){b.preventDefault(),W=P,ae={hostId:P,pointerId:b.pointerId,startX:b.clientX,startY:b.clientY,dragging:!1,captureTarget:w};try{w.setPointerCapture(b.pointerId)}catch{}window.addEventListener("pointermove",Ut,{passive:!1}),window.addEventListener("pointerup",Mt),window.addEventListener("pointercancel",It)}},Bt=async({quiet:b=!1,payload:w=null}={})=>{if(!p){p=!0,!f&&h==="judgment_download"&&O();try{f=w||await Q.judgmentDownloadStatus(),y=null}catch(P){y=P.message||"\u8B80\u53D6\u6708\u4EFD\u72C0\u614B\u5931\u6557\u3002",b||M(y,"danger",7e3)}finally{p=!1,h==="judgment_download"&&O()}}},Qt=async({quiet:b=!0,force:w=!1,payload:P=null}={})=>{if(!N&&!(!w&&S&&Date.now()-I<3e4)){N=!0;try{S=P||await Q.systemUsage(),E=null,I=Date.now()}catch(ue){E=ue.message||"\u7121\u6CD5\u53D6\u5F97 Qdrant \u5BB9\u5668\u8207 volume \u8CC7\u8A0A\u3002",b||M(E,"danger",7e3)}finally{N=!1}}},_=async({quiet:b=!0,force:w=!1,payload:P=null}={})=>{if(!V&&!(!w&&H&&Date.now()-ye<6e4)){V=!0;try{H=P||await Q.checkCourts(),Y=null,ye=Date.now()}catch(ue){Y=ue.message||"\u7121\u6CD5\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31\u3002",b||M(Y,"danger",7e3)}finally{V=!1}}},q=async({quiet:b=!0,force:w=!1,button:P=null,payload:ue=null}={})=>{if(!J&&!(!w&&Te&&Date.now()-k<6e4)){J=!0,P&&ke(P,!0,"\u6AA2\u67E5\u4E2D\u2026");try{if(Te=ue||await Q.checkLawVersions(),B=null,k=Date.now(),!b){let le=Te.totals||{},te=Number(le.needs_backfill_versions)||0,re=Number(le.backfillable_versions)||0,pe=Number(le.blocked_versions)||0;te>0?M(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u9700\u8981\u5EFA\u7ACB ${te} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF08\u53EF\u5EFA\u7ACB ${re}\u3001\u7F3A\u539F\u59CB\u6A94 ${pe}\uFF09\u3002`,pe>0?"danger":"warn",7e3):M(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D ${Number(le.versions)||0} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`,"ok",5e3)}}catch(le){B=le.message||"\u7121\u6CD5\u6AA2\u67E5\u689D\u6587\u6B77\u53F2\u72C0\u614B\u3002",b||M(B,"danger",7e3)}finally{J=!1,P&&ke(P,!1)}}},A=b=>Array.from(s.querySelectorAll("[data-stage-key]")).find(w=>w.dataset.stageKey===b)||null,R=b=>{if(!b)return;ve.add(b);let w=Array.from(s.querySelectorAll(".processing-wf-stage[data-processing-stage]")).find(P=>P.dataset.processingStage===b);w&&(w.open=!0,w.scrollIntoView({behavior:"smooth",block:"center"}))},U=()=>{z&&(z="",i.hidden=!0,s.querySelectorAll("[data-stage-key]").forEach(b=>{b.classList.remove("is-stage-hovered")}))},K=b=>{let w=b.dataset.stageKey||"";if(!w)return;z=w,s.querySelectorAll("[data-stage-key]").forEach(T=>{T.classList.toggle("is-stage-hovered",T.dataset.stageKey===w)});let P=b.dataset.stageStatusKey||"idle",ue=b.dataset.stageStatus||xn(P).label,le=b.dataset.stageColor||"var(--accent)",te=Number(b.dataset.stageUpdate)||0,re=Number(b.dataset.stagePending)||0,pe=b.dataset.stageContributionLabel||"\u6574\u9AD4\u5360\u6BD4";i.innerHTML=`<div class="processing-stage-tooltip-head">
      <span class="processing-stage-tooltip-swatch" style="background:${r(le)}"></span>
      <strong>${r(b.dataset.stageLabel||w)}</strong>
      ${ot(P,ue)}
    </div>
    <div class="processing-stage-tooltip-meta">
      <span>\u968E\u6BB5\u9032\u5EA6 <strong>${r(b.dataset.stagePercent||"\u2014")}</strong></span>
      <span>${r(pe)} <strong>${r(b.dataset.stageContribution||"\u2014")}</strong></span>
      <span class="mono">${r(b.dataset.stageDuration||"\u2014")}</span>
    </div>
    <div class="processing-stage-tooltip-counts">${r(b.dataset.stageCounts||"\u2014")}</div>
    ${te||re?`<div class="processing-stage-tooltip-badges">
            ${te?`<span class="processing-wf-count is-update">${m("download",11)}<strong>${u(te)}</strong><span>\u7DDA\u4E0A\u66F4\u65B0</span></span>`:""}
            ${re?`<span class="processing-wf-count is-pending">${m("clock",11)}<strong>${u(re)}</strong><span>\u5F85\u57F7\u884C</span></span>`:""}
          </div>`:""}
    ${b.dataset.stageMessage?`<div class="processing-stage-tooltip-message">${r(b.dataset.stageMessage)}</div>`:""}`,i.hidden=!1;let ie=Math.min(300,Math.max(220,window.innerWidth-24));i.style.width=`${ie}px`;let he=b.getBoundingClientRect(),Me=Math.min(window.innerWidth-ie-12,Math.max(12,he.left)),_e=he.top-i.offsetHeight-10,g=_e>=12?_e:Math.min(window.innerHeight-i.offsetHeight-12,he.bottom+10);i.style.left=`${Me}px`,i.style.top=`${Math.max(12,g)}px`},de=b=>{if(b.target.closest(".is-failure-tip")){U();return}if(b.target.closest(".processing-wf-rail"))return;let w=b.target.closest("[data-stage-key]");!w||!s.contains(w)||w.contains(b.relatedTarget)||K(w)},Se=b=>{let w=b.target.closest("[data-stage-key]");if(!w||!s.contains(w)||w.contains(b.relatedTarget))return;let P=b.relatedTarget?.closest?.("[data-stage-key]");P&&P.dataset.stageKey===w.dataset.stageKey||U()},Ae=b=>{let w=b.capabilities||{};!d&&n&&(n.hidden=!w.can_stop_update)},$e=()=>{if(!c)return;let b=ka(c,h,mt(),ve);b!==v&&(ns(s,b),v=b),O(),L(),F(),We(c)},Ie=(b,{silent:w=!1}={})=>{if(o||!b)return;let P=Date.parse(b.generated_at||""),ue=Date.parse(c?.generated_at||"");if(Number.isFinite(P)&&Number.isFinite(ue)&&P<ue)return;if(qt){let ie=(b.workflows||[]).find(Me=>Me.id===qt),he=ie?.active_run?.id||ie?.last_run?.id||"";(ie?.active_run||he&&he!==_s)&&(qt="",_s="")}c=b;let le=new Map;for(let ie of b.sections||[])for(let he of ie.stages||[])le.set(`${ie.key}-${he.key}`,he);for(let[ie,he]of St){if(he.kind!=="upgrade")continue;let Me=le.get(ie);if(Me){if(Me.phase==="failed"||Me.phase==="running"&&Me.percent!==null){St.delete(ie);continue}if(Me.phase==="completed"){let _e=Date.parse(Me.last_run?.started_at||"");Number.isFinite(_e)&&_e>=Number(he.startedAt||0)-1e3&&St.delete(ie)}}}let te=_n(b,h);te!==$&&(ns(a,te),$=te);let re=ka(b,h,mt(),ve);if(re!==v&&(ns(s,re),v=re),O(),L(),z){let ie=A(z);ie?K(ie):U()}let pe=s.querySelector("[data-processing-updated-at]");if(pe){let ie=je(b.generated_at);pe.textContent!==ie&&(pe.textContent=ie)}if(Ae(b),F(),We(b),!C&&!ne&&$t({quiet:!0}),Ge.length){let ie=Ge.splice(0);for(let he of ie)Ye(he)}},Je=b=>{if(Qe=b,typeof requestAnimationFrame>"u"){let w=Qe;Qe=null,w&&qs(w);return}Be||(Be=requestAnimationFrame(()=>{Be=0;let w=Qe;Qe=null,w&&qs(w)}))},Ye=b=>{if(!b)return;if(!c){Ge.push(b),Ge.length>100&&Ge.shift();return}let w=String(b.run_id||""),P=Number(b.seq)||0;if(w&&w===Oe&&P>0&&P<=Ue)return;w&&w!==Oe&&(Oe=w,Ue=0),P>0&&(Ue=P);let ue=String(b.workflow_id||"judgment_import"),le=String(b.month||"").replace(/\D/g,"").slice(0,6),te=(c.workflows||[]).find(_e=>_e.id===ue);if(!te)return;te.progress||(te.progress={stages:[]}),Array.isArray(te.progress.stages)||(te.progress.stages=[]);let re=String(b.stage||""),pe=re?te.progress.stages.find(_e=>String(_e.key)===re):null,ie=String(te.progress.run_id||"")===String(b.run_id||"");if(pe&&b.type==="stage_progress"){let _e=Number(b.current),g=Number(pe.current);ie&&b.status==="running"&&Number.isFinite(_e)&&Number.isFinite(g)&&_e<g||(b.status&&(pe.status=String(b.status)),b.current!==void 0&&(pe.current=Number(b.current)||0),b.total!==void 0&&(pe.total=Number(b.total)||0),b.percent!==void 0&&(pe.percent=Number(b.percent)||0),b.message&&(pe.message=String(b.message)))}if(pe&&b.extra&&typeof b.extra=="object")for(let _e of["financial_processed","financial_matched","financial_percent"])b.extra[_e]!==void 0&&(pe[_e]=Number(b.extra[_e])||0);if(b.type==="stage_progress"&&b.overall_percent!==void 0){let _e=Number(b.overall_percent)||0,g=Number(te.progress.overall_percent)||0;te.progress.overall_percent=ie?Math.max(g,_e):_e}b.type!=="run_finished"&&(te.progress.run_status="running"),(b.type==="archive_started"||b.type==="stage_progress")&&!te.active_run&&b.run_id&&(te.active_run={id:b.run_id,status:"running",started_at:b.timestamp,message:b.message||""}),b.type==="run_finished"&&(te.active_run=null,te.progress.run_status=String(b.status||"success"),te.can_run=!0);let he=[];le&&b.month_stages&&he.push({month:le,import_stages:b.month_stages,import_overall:b.month_overall||""});let Me=null;if(b.type==="archive_started"&&le){let _e=Date.parse(b.timestamp||"");Me={active_month:le,active_archive:b.archive,active_phase:b.stage||"filter",processing_month:le,processing_archive:b.archive,run_id:b.run_id,run_status:"running",state_mtime_ns:Number.isFinite(_e)?_e*1e6:Date.now()*1e6}}else b.type==="run_finished"&&(Me={...c.active_import||{},run_status:String(b.status||"success")});Je({live:!0,generated_at:b.timestamp,workflows:[{id:ue,active_run:te.active_run,last_run:te.last_run,progress:te.progress,can_run:te.can_run}],import_timeline_months:he,active_import:Me})},qs=b=>{if(o||!b||!c)return;let w=new Map((b.workflows||[]).map(re=>[re.id,re]));if(qt){let re=w.get(qt),pe=re?.active_run?.id||re?.last_run?.id||"";(re?.active_run||pe&&pe!==_s)&&(qt="",_s="")}for(let re of c.workflows||[]){let pe=w.get(re.id);if(pe){if("active_run"in pe&&(re.active_run=pe.active_run),"last_run"in pe&&(re.last_run=pe.last_run),Array.isArray(pe.recent_runs)&&(re.recent_runs=pe.recent_runs),"index_runtime"in pe){let ie=pe.index_runtime;ie&&!ie.active_coverage&&re.index_runtime?.active_coverage&&(ie.active_coverage=re.index_runtime.active_coverage),re.index_runtime=ie}if(pe.progress){let ie=pe.progress,he=re.progress;if(re.id==="judgment_import"&&he?.run_id&&he.run_id===ie.run_id){let Me=new Map((he.stages||[]).map(_e=>[String(_e.key),_e]));for(let _e of ie.stages||[]){let g=Me.get(String(_e.key));g&&_e.status==="running"&&Number(_e.current)<Number(g.current)&&(_e.current=g.current,_e.total=g.total,_e.percent=g.percent,_e.message=g.message)}ie.overall_percent=Math.max(Number(he.overall_percent)||0,Number(ie.overall_percent)||0)}re.progress=ie}typeof pe.can_run=="boolean"&&(re.can_run=pe.can_run)}}let P=re=>{if(!re||!Array.isArray(b.import_timeline_months))return;let pe=new Map((re.months||[]).map(he=>[String(he.month),he]));for(let he of b.import_timeline_months){let Me=pe.get(String(he.month));Me&&(Me.import_stages={...Me.import_stages||{},...he.import_stages||{}},he.import_overall&&(Me.import_overall=he.import_overall))}let ie={complete:0,incomplete:0,processing:0,empty:0};for(let he of re.months||[]){let Me=String(he.import_overall||"empty");ie[Me]=Number(ie[Me]||0)+1}re.stage_summary=ie};P(c.import_timeline);for(let re of c.workflows||[])re.id==="judgment_import"&&P(re.import_timeline);b.active_import&&(c.active_import=b.active_import),b.mode&&(c.mode=b.mode),b.generated_at&&(c.generated_at=b.generated_at);let ue=_n(c,h);ue!==$&&(ns(a,ue),$=ue);let le=ka(c,h,mt(),ve);le!==v&&(ns(s,le),v=le),O(),L(),F(),We(c),Ae(c);let te=s.querySelector("[data-processing-updated-at]");if(te&&b.generated_at){let re=je(b.generated_at);te.textContent!==re&&(te.textContent=re)}},Gt=async({silent:b=!1}={})=>{if(!(o||l)){l=!0;try{let w=await Q.processing();Ie(w,{silent:b})}catch(w){if(o)return;let P=Tc(w.message,c);P!==v&&(ns(s,P),v=P),b||M(w.message||"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B\u3002","danger",6e3)}finally{l=!1}}},Ta=async(b,w="")=>{if(d)return;d=!0,ke(b,!0,"\u6AA2\u67E5\u4E2D\u2026");let P=mi[w]||"",ue=String(b.dataset.sourceTypes||"").split(",").map(re=>re.trim()).filter(Boolean),le=ue.length?ue:P?[P]:[],te=b.dataset.stageId||"";te&&(St.set(te,{kind:"check",phase:"updating",startedAt:Date.now()}),$e());try{let re=await Q.checkUpdates(le);if(re&&re.checking)te&&(St.delete(te),$e()),M("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u8ACB\u7A0D\u5F8C\u91CD\u65B0\u6574\u7406\u3002","info",6e3);else if(le.length===1){let pe=(re.sources||{})[le[0]]||{},ie=gi[w]||(le[0]==="judgment"?"\u5224\u6C7A":le[0]==="law"?"\u6CD5\u898F":le[0]==="order"?"\u547D\u4EE4":"\u8CC7\u6599");pe.status==="error"?M(`${ie}\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF1A${pe.message||"\u7121\u6CD5\u53D6\u5F97\u7DDA\u4E0A\u7248\u672C"}`,"danger",7e3):M(pe.update_available?`${ie}\u7DDA\u4E0A\u5DF2\u6709\u66F4\u65B0\u7248\u672C\u3002`:`${ie}\u7DDA\u4E0A\u5DF2\u662F\u6700\u65B0\u7248\u672C\u3002`,pe.update_available?"warn":"ok",6e3)}else if(le.length>1){let pe=re.sources||{},ie=le.filter(Me=>pe[Me]?.update_available),he=le.filter(Me=>pe[Me]?.status==="error");he.length?M(`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF0C\u4F46\u6709 ${he.length} \u9805\u6AA2\u67E5\u5931\u6557\u3002`,"danger",7e3):M(ie.length?`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A${ie.length} \u9805\u6709\u66F4\u65B0\u3002`:"\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D\u7686\u70BA\u6700\u65B0\u3002",ie.length?"warn":"ok",6e3)}else{let pe=Number(re.update_count)||0;M(pe>0?`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A${pe} \u9805\u6709\u66F4\u65B0\u3002`:"\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D\u7686\u70BA\u6700\u65B0\u3002",pe>0?"warn":"ok",6e3)}te&&(St.set(te,{kind:"check",phase:"updated",startedAt:Date.now()}),$e()),window.dispatchEvent(new CustomEvent("judgment:updates-changed")),await Gt({silent:!0})}catch(re){te&&(St.delete(te),$e()),M(re.message||"\u66F4\u65B0\u6AA2\u67E5\u5931\u6557\u3002","danger",7e3)}finally{d=!1,ke(b,!1),c&&Ae(c)}},As=async b=>{let w=mi[b]||"";if(!w)return!0;let P=null;try{P=await Q.checkUpdates([w])}catch(le){return M(`\u7121\u6CD5\u5B8C\u6210\u7248\u672C\u6AA2\u67E5\uFF08${le.message||"\u7DB2\u8DEF\u932F\u8AA4"}\uFF09\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002`,"warn",7e3),!0}if(!P||P.checking)return P&&P.checking&&M("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002","info",6e3),!0;let ue=(P.sources||{})[w];if(!ue)return!0;if(window.dispatchEvent(new CustomEvent("judgment:updates-changed")),ue.status==="up_to_date"&&!ue.update_available){let le=gi[b]||"\u8CC7\u6599",te=ue.checked_at?`\uFF08${je(ue.checked_at)} \u6AA2\u67E5\uFF09`:"",re=fc[b]||"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u55CE\uFF1F";return window.confirm(`${le}\u7DDA\u4E0A\u6AA2\u67E5\u70BA\u6700\u65B0\u7248\u672C${te}\u3002

${re}`)}return ue.status==="error"&&M("\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002","warn",6e3),!0},Na=async(b,w)=>{if(d)return;d=!0;let P=(c?.workflows||[]).find(te=>te.id===w);_s=P?.active_run?.id||P?.last_run?.id||"",qt=w,ke(b,!0,"\u57F7\u884C\u4E2D"),s.querySelectorAll("[data-workflow-progress]").forEach(te=>te.remove());let ue=b.dataset.stageId||"",le=!1;try{if(!await As(w))return;ue&&(St.set(ue,{kind:"upgrade",phase:"upgrading",startedAt:Date.now()}),$e());let re;try{re=await Q.startProcessingWorkflow(w)}catch(pe){throw ue&&(St.delete(ue),$e()),pe}le=!0,M("\u5DF2\u555F\u52D5\u5347\u7D1A\u5DE5\u4F5C\u6D41\u7A0B\u3002","ok",6e3),re&&re.run_id&&console.info("processing workflow started",re),window.dispatchEvent(new CustomEvent("judgment:updates-changed"))}catch(te){M(te.message||"\u7121\u6CD5\u555F\u52D5\u5DE5\u4F5C\u6D41\u7A0B\u3002","danger",7e3)}finally{d=!1,(!le||qt!==w)&&(qt="",_s="",c?(Ae(c),v="",$e()):ke(b,!1))}},Js=async b=>{if(!d){d=!0,ke(b,!0,"\u505C\u6B62\u4E2D\u2026");try{let w=await Q.stopProcessingUpdate();for(let[P,ue]of St)ue.kind==="upgrade"&&St.delete(P);$e(),M(w.message||"\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info",6e3)}catch(w){M(w.message||"\u7121\u6CD5\u505C\u6B62\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{d=!1,ke(b,!1),c&&Ae(c)}}},_t=b=>{let w=b.target.closest("[data-processing-action]");if(!w||w.disabled)return;w.closest(".processing-wf-rail")&&(b.preventDefault(),b.stopPropagation());let P=w.dataset.processingAction;if(P==="refresh")Gt({silent:!1});else if(P==="open-stage")R(w.dataset.stageId||"");else if(P==="refresh-judgment-months")Bt({quiet:!1});else if(P==="refresh-index-storage")Qt({quiet:!1,force:!0});else if(P==="refresh-court-check")_({quiet:!1,force:!0});else if(P==="refresh-law-version-check")q({quiet:!1,force:!0,button:w});else if(P==="refresh-ollama")$t({quiet:!1,button:w});else if(P==="refresh-embedding-models")$t({quiet:!1,button:w});else if(P==="select-embedding-model"){let ue=w.dataset.hostId||"",le=w.dataset.model||"";zt(`${ue}|${le}`)}else if(P==="move-ollama-host"){let ue=C?.hosts||[],le=ue.findIndex(ie=>Number(ie.id)===Number(w.dataset.hostId)),te=w.dataset.direction,re=te==="up"?le-1:te==="down"?le+1:-1;if(le<0||re<0||re>=ue.length)return;let pe=ue.map(ie=>Number(ie.id));[pe[le],pe[re]]=[pe[re],pe[le]],at(pe)}else if(P==="check-updates")Ta(w,w.dataset.workflowId||"");else if(P==="run-workflow"){let ue=w.dataset.workflowId||"";Na(w,ue)}else P==="stop"&&Js(w)},jt=(b,{scroll:w=!1}={})=>{if(h=b||"overview",c){let P=_n(c,h);ns(a,P),$=P;let ue=ka(c,h,mt(),ve);if(ns(s,ue),v=ue,O(),L(),F(),We(c),z){let le=A(z);le?K(le):U()}w&&s.scrollIntoView({behavior:"smooth",block:"start"})}kn.has(h)&&$t({quiet:!0}),h==="judgment_download"&&Bt({quiet:!0}),h==="index_versions"&&Qt({quiet:!0}),h==="normalize_courts"&&_({quiet:!0}),h==="backfill_law_articles"&&q({quiet:!0})},Ms=b=>{let w=b.target.closest("[data-processing-workflow]");w&&jt(w.dataset.processingWorkflow||"overview")},js=b=>{let w=b.target.closest("[data-timeline-workflow]");w&&(b.preventDefault(),jt(w.dataset.timelineWorkflow||"",{scroll:!0}))},Vs=b=>{let w=b.target.closest?.(".processing-wf-stage[data-processing-stage]");if(!w||!s.contains(w))return;let P=w.dataset.processingStage||"";P&&(w.open?ve.add(P):ve.delete(P))};return t.addEventListener("click",_t),a.addEventListener("click",Ms),s.addEventListener("click",js),s.addEventListener("pointerover",de),s.addEventListener("pointerout",Se),s.addEventListener("pointerdown",rs),s.addEventListener("toggle",Vs,!0),window.addEventListener("scroll",U,{capture:!0,passive:!0}),At(),typeof EventSource>"u"&&await Gt({silent:!1}),()=>{o=!0,Ze(),t.removeEventListener("click",_t),a.removeEventListener("click",Ms),s.removeEventListener("click",js),Ht(),s.removeEventListener("pointerover",de),s.removeEventListener("pointerout",Se),s.removeEventListener("pointerdown",rs),s.removeEventListener("toggle",Vs,!0),window.removeEventListener("scroll",U,{capture:!0})}}var Rn={};Jt(Rn,{render:()=>zd});var Tn={draft:{label:"\u8349\u7A3F",badge:"badge-neutral"},pending_review:{label:"\u5F85\u5BE9",badge:"badge-warn"},changes_requested:{label:"\u9000\u56DE\u4FEE\u6539",badge:"badge-warn"},accepted:{label:"\u5DF2\u6838\u51C6",badge:"badge-ok"},rejected:{label:"\u5DF2\u62D2\u7D55",badge:"badge-danger"},retired:{label:"\u5DF2\u522A\u9664\uFF0F\u9000\u5F79",badge:"badge-neutral"}},Pt={law_concept:"\u6CD5\u898F\u6982\u5FF5",article_lookup:"\u6307\u5B9A\u689D\u6587",judgment_lookup:"\u5224\u6C7A\u6AA2\u7D22",structured:"\u7D50\u69CB\u5316\u554F\u984C",general:"\u4E00\u822C\u554F\u984C",refusal:"\u62D2\u7D55\u56DE\u7B54"},ks={easy:"\u7C21\u55AE",medium:"\u4E2D\u7B49",hard:"\u56F0\u96E3"},qi={smoke:"Smoke",core:"Core",full:"Full",holdout:"Holdout"};function Gs(e){let t=Tn[e]||{label:e||"\u672A\u77E5",badge:"badge-neutral"};return`<span class="badge ${t.badge}">${r(t.label)}</span>`}function Nn(e){return String(e||"").split(`
`).map(t=>t.trim()).filter(Boolean)}function cd(e){return Nn(e).map(t=>{let[s,a]=t.split("|").map(n=>n.trim());return{law_name:s||"",source_type:a||""}})}function dd(e){return Nn(e).map(t=>{let[s,a]=t.split("|").map(n=>n.trim());return{law_name:s||"",article_no:a||""}})}function ud(e){return Nn(e).map(t=>({jid:t.trim()}))}function pd(e){return(e?.expected_laws||[]).map(t=>[t.law_name,t.source_type].filter(Boolean).join("|")).join(`
`)}function md(e){return(e?.expected_articles||[]).map(t=>[t.law_name||t.law_key,t.article_no].filter(Boolean).join("|")).join(`
`)}function gd(e){return(e?.expected_judgments||[]).map(t=>t.jid).join(`
`)}function fd(e){return(e?.tags||[]).join(", ")}function Qs(e){return`<div class="qb-empty">${m("info",18)}<span>${r(e)}</span></div>`}function En(e){let t=(e.expected_laws||[]).map(i=>i.law_name).filter(Boolean),s=(e.expected_articles||[]).map(i=>`${i.law_name||""} ${i.article_no||""}`.trim()).filter(Boolean),a=(e.expected_judgments||[]).map(i=>i.jid).filter(Boolean),n=[...t.map(i=>`<span class="chip">${r(i)}</span>`),...s.map(i=>`<span class="chip">${r(i)}</span>`),...a.map(i=>`<span class="chip chip-mono">${r(i)}</span>`)];return n.length?`<div class="chips qb-labels">${n.join("")}</div>`:'<span class="qb-muted">\u5C1A\u672A\u6A19\u8A3B expected labels</span>'}function Cn(){return`<details class="qb-import">
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
        ${r(Pt[t.question_type]||t.question_type||"")}
        \xB7 ${r(ks[t.difficulty]||t.difficulty||"")}
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
    ${Cn()}
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
    ${Cn()}
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
          <select class="select" name="question_type">${Object.entries(Pt).map(([t,s])=>`<option value="${t}" ${e?.question_type===t?"selected":""}>${s}</option>`).join("")}</select>
        </label>
        <label class="field"><span class="field-label">\u96E3\u5EA6</span>
          <select class="select" name="difficulty">${Object.entries(ks).map(([t,s])=>`<option value="${t}" ${e?.difficulty===t?"selected":""}>${s}</option>`).join("")}</select>
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
    ${Cn()}
  </section>`}function $d(e,t){return e?hd(e):vd(t)}function yd(e){let t=e.status==="retired"||!!e.deleted_at;return`<article class="qb-item" data-qb-item="${e.id}">
    <div class="qb-item-head">
      <span class="qb-id">#${e.id}</span>
      <div class="qb-item-title">
        <strong>${r(e.question)}</strong>
        <span class="qb-meta">
          ${r(Pt[e.question_type]||e.question_type)}
          \xB7 ${r(ks[e.difficulty]||e.difficulty)}
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
      <span>\u66F4\u65B0 ${r(je(e.updated_at))}</span>
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
        ${Object.entries(Pt).map(([t,s])=>`<option value="${t}" ${e.filters.question_type===t?"selected":""}>${s}</option>`).join("")}
      </select>
      <select class="select" name="difficulty">
        <option value="">\u5168\u90E8\u96E3\u5EA6</option>
        ${Object.entries(ks).map(([t,s])=>`<option value="${t}" ${e.filters.difficulty===t?"selected":""}>${s}</option>`).join("")}
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
        ${r(Pt[e.question_type]||e.question_type)}
        \xB7 ${r(ks[e.difficulty]||e.difficulty)}
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
        <span class="qb-review-item-meta">#${e.id} \xB7 v${e.version} \xB7 ${r(Pt[e.question_type]||e.question_type)} \xB7 ${r(ks[e.difficulty]||e.difficulty)}</span>
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
    ${e.reviews?.length?`<div class="qb-review-history"><span class="summary-label">\u5BE9\u6838\u7D00\u9304</span>${e.reviews.map(t=>`<div class="qb-review-row"><span>${r(t.reviewer||"\u533F\u540D")}</span>${Gs(t.decision==="approved"?"accepted":t.decision)}<span>${r(je(t.created_at))}</span><p>${r(t.comment||"\u2014")}</p></div>`).join("")}</div>`:""}
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
  </section>`}function Us(e){if(e==null||e==="")return"";let t=Number(e);return Number.isFinite(t)?`${Math.round(t*100)}%`:""}function jd(e){if(!e||typeof e!="object")return"\u5F15\u7528";let t=String(e.jid||"").trim();if(t)return t;let s=String(e.law_name||"").trim(),a=String(e.article_no||"").trim(),n=`${s} ${a}`.trim();return n||String(e.title||e.text||"\u5F15\u7528").slice(0,80)}function Ld(e){let t=e?.metrics||{},s=t.scores||{},a=[["\u6CD5\u898F\u53EC\u56DE",Us(t.law_recall)],["\u689D\u6587\u53EC\u56DE",Us(t.article_recall)],["\u898F\u5247\u5206",Us(s.deterministic)],["Judge",Us(s.judge)],["\u4EBA\u5DE5",Us(s.human)]].filter(([,n])=>n);return a.length?`<div class="qb-bank-stats">${a.map(([n,i])=>`<span class="qb-bank-stat"><span>${r(n)}</span><strong>${r(i)}</strong></span>`).join("")}</div>`:""}function Td(e){let t=Array.isArray(e?.law_sources)?e.law_sources:[],s=Array.isArray(e?.citations)?e.citations:[],a=t.length?`<div class="qb-bank-sources">${t.map(i=>{let o=String(i.law_name||"\u672A\u547D\u540D\u6CD5\u898F"),l=(i.articles||[]).map(c=>String(c.article_no||"").trim()).filter(Boolean),d=`<strong>${r(o)}</strong>${l.length?`<small>${r(l.join("\u3001"))}</small>`:""}`;return i.law_url?`<a class="qb-bank-law" href="${r(i.law_url)}" target="_blank" rel="noreferrer">${d}</a>`:`<span class="qb-bank-law">${d}</span>`}).join("")}</div>`:"",n=s.length?`<div class="qb-bank-sources qb-bank-citations">${s.map(i=>`<span class="chip chip-mono">${r(jd(i))}</span>`).join("")}</div>`:"";return!a&&!n?"":`<div class="qb-bank-answer-block">
    <div class="qb-bank-section-label"><span>\u5F15\u7528\u4F86\u6E90</span><span>${u(t.length+s.length)} \u7B46</span></div>
    ${a}${n}
  </div>`}function ji(e,t){if(!e)return`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${m("history",20)}</span>
      <strong>\u5C1A\u7121 RAG \u7B54\u6848</strong>
      <span>\u8DD1\u4E00\u6B21 Benchmark \u5F8C\uFF0C\u6700\u8FD1\u4E00\u6B21\u6210\u529F\u56DE\u7B54\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</span>
    </div>`;let s=Number(e.item_version||0),a=Number(t?.version||0),n=s&&a&&s!==a?`<span class="badge badge-warn">\u7B54\u6848 v${s} \xB7 \u984C\u76EE v${a}</span>`:"",i=e.answer_source==="llm"?"LLM \u751F\u6210":e.answer_source==="structured"?"\u6CD5\u898F\u8CC7\u6599\u5EAB":String(e.answer_source||"RAG");return`<div class="qb-bank-answer-meta">
      <span class="badge badge-ok"><span class="status-dot is-ok"></span>RAG \u5B8C\u6210</span>
      <span class="badge badge-neutral">${r(i)}</span>
      ${n}
      <span class="mono">${r(e.run_label||e.run_id||"")}</span>
      <span>${r(je(e.finished_at))}</span>
      <span>${r(fe(e.duration_ms))}</span>
      ${e.llm_model?`<span class="mono">${r(e.llm_model)}</span>`:""}
    </div>
    <div class="qb-bank-answer-block">
      <div class="qb-bank-section-label"><span>\u56DE\u7B54</span><span>${u(String(e.answer||"").length)} \u5B57</span></div>
      <p class="qb-bank-answer-text">${r(String(e.answer||"").trim()||"\uFF08\u7A7A\u767D\u56DE\u7B54\uFF09")}</p>
    </div>
    ${Td(e)}
    ${Ld(e)}`}function Li(e,t){let s=e.selectedSuiteId,a=t&&e.suiteAnswers?.[String(s)]?.[String(t.id)]||null;return t?`<div class="qb-bank-answer-head">
      <div class="qb-bank-answer-heading">
        <span class="qb-bank-answer-kicker">${m("sparkles",12)}RAG \u6700\u8FD1\u4E00\u6B21\u7B54\u6848</span>
        <strong class="qb-bank-answer-question">#${t.id} ${r(t.question)}</strong>
      </div>
      ${a?`<span class="qb-bank-answer-state">${r(Pt[t.question_type]||t.question_type)} \xB7 v${t.version}</span>`:""}
    </div>
    ${ji(a,t)}`:`<div class="qb-bank-empty">
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
        <small>${r(Pt[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${a?"\u5DF2\u6709 RAG \u7B54\u6848":"\u5C1A\u7121 RAG \u7B54\u6848"}</small>
      </span>
    </button>
    ${Ti(e)}
  </div>`}function Ed(e,t,s){return`<article class="qb-bank-full-item" data-id="${e.id}">
    <div class="qb-bank-full-head">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <div class="qb-bank-full-title">
        <strong>${r(e.question)}</strong>
        <small>${r(Pt[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${r(Tn[e.status]?.label||e.status||"")}</small>
      </div>
      ${Ti(e)}
    </div>
    ${ji(s,e)}
  </article>`}function Ai(e){let t=e.editingSuite,s=Array.isArray(e.suites)?e.suites:[],a=s.find(f=>Number(f.id)===Number(e.selectedSuiteId))||s[0]||null,n=Array.isArray(a?.items)?a.items:[],i=e.suiteAnswers?.[String(a?.id)]||{},o=n.find(f=>Number(f.id)===Number(e.selectedBankItemId))||null,l=!!e.suiteAnswersLoading,d=String(e.suiteAnswersError||""),c=!!e.suiteManageOpen||!s.length,v=e.bankTab==="full"?"full":"split",$=s.length?`<div class="qb-bank-tabs" role="tablist" aria-label="Benchmark \u984C\u5EAB\u6AA2\u8996">
        <button class="qb-bank-tab${v==="split"?" is-active":""}" type="button" role="tab" aria-selected="${v==="split"?"true":"false"}" data-qb-action="bank-tab" data-tab="split">${m("grid",13)}<span>Benchmark \u984C\u5EAB</span><span class="badge badge-neutral">${u(n.length)}</span></button>
        <button class="qb-bank-tab${v==="full"?" is-active":""}" type="button" role="tab" aria-selected="${v==="full"?"true":"false"}" data-qb-action="bank-tab" data-tab="full">${m("table",13)}<span>\u984C\u5EAB\u5168\u5217\u8868</span><span class="badge badge-neutral">${u(n.length)}</span></button>
      </div>`:"",h="";if(!s.length)h=`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${m("cube",20)}</span>
      <strong>\u5C1A\u672A\u5EFA\u7ACB Benchmark \u984C\u5EAB</strong>
      <span>\u5C55\u958B\u4E0B\u65B9 Suite \u8A2D\u5B9A\u4E26\u5EFA\u7ACB\u984C\u5EAB\u5F8C\uFF0C\u5C31\u80FD\u5728\u9019\u88E1\u700F\u89BD\u984C\u76EE\u8207\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`;else if(l)h='<div class="qb-bank-loading"><span class="spinner" aria-hidden="true"></span><span>\u8B80\u53D6\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u4E2D\u2026</span></div>';else{let f=d?Ne({tone:"warn",title:"\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u8B80\u53D6\u5931\u6557",text:r(d)}):"";v==="full"?h=`${f}<div class="qb-bank-full" data-qb-bank-view="full">${n.length?n.map((p,y)=>Ed(p,y,i[String(p.id)]||null)).join(""):Qs("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>`:h=`${f}<div class="qb-bank-split" data-qb-bank-view="split">
        <div class="qb-bank-list" data-qb-bank-list>${n.length?n.map((p,y)=>Nd(p,y,{selected:Number(p.id)===Number(o?.id),hasAnswer:!!i[String(p.id)]})).join(""):Qs("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>
        <div class="qb-bank-answer-pane" data-qb-bank-answer>${Li(e,o)}</div>
      </div>`}return`<section class="report-card qb-card qb-bank-card">
    <div class="side-card-head qb-bank-head">
      <div class="qb-bank-heading">
        <span class="side-card-title">${m("cube",14)}Benchmark \u984C\u5EAB</span>
        <span class="qb-bank-sub">${a?`${r(a.name)} \xB7 v${a.version} \xB7 ${u(a.item_count)} \u984C`:"\u5C1A\u672A\u5EFA\u7ACB suite"}</span>
      </div>
      <div class="qb-bank-controls">
        ${s.length?`<label class="qb-suite-picker"><span>Suite</span><select class="select" data-qb-suite-select aria-label="\u9078\u64C7 benchmark suite">${s.map(f=>`<option value="${f.id}" ${Number(f.id)===Number(a?.id)?"selected":""}>${r(f.name)} \xB7 ${u(f.item_count)} \u984C</option>`).join("")}</select></label>`:""}
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
            <label class="field"><span class="field-label">\u7B49\u7D1A</span><select class="select" name="tier">${Object.entries(qi).map(([f,p])=>`<option value="${f}" ${t?.tier===f?"selected":""}>${p}</option>`).join("")}</select></label>
          </div>
          <label class="field"><span class="field-label">\u8AAA\u660E</span><input class="input" name="description" value="${r(t?.description||"30 \u984C pilot\uFF1B\u7528\u65BC RAG benchmark \u8207\u9577\u671F\u540C\u984C\u6BD4\u8F03\u3002")}" /></label>
          <div class="qb-check-list">
            ${e.ready.length?e.ready.map(f=>{let p=t?t.items?.some(y=>Number(y.id)===Number(f.id)):!0;return`<label class="qb-check-row"><input type="checkbox" name="item_ids" value="${f.id}" ${p?"checked":""}/><span><strong>#${f.id}</strong> ${r(f.question)} <small>${r(Pt[f.question_type]||f.question_type)}</small></span></label>`}).join(""):Qs("\u6C92\u6709\u5DF2\u9A57\u6536\u4E14 benchmark-ready \u7684\u984C\u76EE\uFF1B\u8ACB\u5148\u5B8C\u6210\u4EBA\u5DE5\u9A57\u6536\u3002")}
          </div>
          <div class="qb-actions">
            <button class="btn btn-primary" type="submit">${m("check",14)}<span>${t?"\u5132\u5B58 suite":"\u5EFA\u7ACB suite"}</span></button>
            ${t?'<button class="btn btn-secondary" type="button" data-qb-action="suite-new">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
          </div>
        </form>
        <div class="qb-list">
          ${s.length?s.map(f=>`<article class="qb-suite">
            <div class="qb-item-head">
              <div class="qb-item-title"><strong>${r(f.name)}</strong><span class="qb-meta">${r(qi[f.tier]||f.tier)} \xB7 v${f.version} \xB7 ${u(f.item_count)} \u984C</span></div>
              <span class="badge ${f.status==="frozen"?"badge-ok":"badge-neutral"}">${f.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>
            </div>
            <div class="qb-suite-items">${(f.items||[]).slice(0,8).map(p=>`<span class="chip">#${p.id} ${r(p.question.slice(0,22))}${p.question.length>22?"\u2026":""}</span>`).join("")}${f.item_count>8?`<span class="qb-muted">+${f.item_count-8}</span>`:""}</div>
            <div class="qb-actions">
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-edit" data-id="${f.id}">${m("edit",13)}<span>\u7DE8\u8F2F suite</span></button>
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-freeze" data-id="${f.id}">${m("shield",13)}<span>\u51CD\u7D50</span></button>
              <button class="btn btn-ghost btn-sm" type="button" data-qb-action="suite-delete" data-id="${f.id}">${m("trash",13)}<span>\u522A\u9664</span></button>
            </div>
          </article>`).join(""):Qs("\u5C1A\u672A\u5EFA\u7ACB benchmark suite\u3002")}
        </div>
      </div>
    </details>
  </section>`}function Cd(e){let t={};for(let s of["clarity","labels","answer","difficulty","overall"]){let a=e.querySelector(`[name="score_${s}"]`),n=Number(a?.value);Number.isFinite(n)&&(t[s]=Math.max(1,Math.min(5,Math.round(n))))}return t}function Rd(e){let t=new FormData(e);return{question:String(t.get("question")||"").trim(),question_type:String(t.get("question_type")||"general"),difficulty:String(t.get("difficulty")||"medium"),visibility:String(t.get("visibility")||"shared"),expected_laws:cd(t.get("expected_laws")),expected_articles:dd(t.get("expected_articles")),expected_judgments:ud(t.get("expected_judgments")),reference_answer:String(t.get("reference_answer")||"").trim(),tags:String(t.get("tags")||"").split(",").map(s=>s.trim()).filter(Boolean),notes:String(t.get("notes")||"").trim(),rubric:{must_refuse:!!e.elements.must_refuse?.checked}}}function Ni(e,{onNavigate:t=null,onStats:s=null}={}){let a={create:"question-create",manage:"question-manage",suite:"benchmark-bank",review:"question-review"},n={tab:"",editing:null,editingFrom:"",editingSuite:null,aiQuestion:"",aiLoading:!1,aiResult:null,items:[],total:0,offset:0,limit:50,filters:{query:"",status:"",question_type:"",difficulty:"",tags:[]},stats:{},suites:[],ready:[],selectedSuiteId:null,selectedBankItemId:null,bankTab:"split",suiteAnswers:{},suiteAnswersLoading:!1,suiteAnswersError:"",suiteManageOpen:!1,reviewItems:[],reviewDetail:null,reviewFilter:"queue"},i=j=>e.querySelector(`#quality-panel-${a[j]}`),o=(j,O)=>{j&&(j.childElementCount?j.setAttribute("aria-busy","true"):j.innerHTML=`<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>${O}</span></div></section>`)},l=j=>{j?.removeAttribute("aria-busy")},d=0,c=null,v=()=>"anonymous",$=()=>{s&&s(n.stats)},h=j=>{t&&t(j),ee(j)},f=async()=>{try{n.stats=await Q.questionBankStats()}catch{n.stats={}}$()},p=()=>{let j=i("create");j&&(j.innerHTML=$d(n.editing,n))},y=(j,O)=>{let x=j?.querySelector("[data-qb-tag-results]");x&&(x.innerHTML=O.length?O.map(L=>`<button class="qb-tag-option" type="button" role="option" data-qb-action="select-tag" data-tag="${r(L.tag)}"><span>${r(L.tag)}</span><small>${u(L.count)}</small></button>`).join(""):'<div class="qb-tag-empty">\u6C92\u6709\u5176\u4ED6\u76F8\u7B26\u6A19\u7C64</div>')},S=async(j,O="")=>{if(!j)return;let x=j.querySelector("[data-qb-tag-results]"),L=++d;x&&(x.innerHTML='<div class="qb-tag-loading"><span class="spinner"></span><span>\u641C\u5C0B\u6A19\u7C64\u2026</span></div>');try{let X=await Q.questionBankTags(O,12);if(L!==d)return;let F=(X.tags||[]).filter(Ee=>!n.filters.tags.includes(Ee.tag));y(j,F)}catch(X){if(L!==d)return;x&&(x.innerHTML=`<div class="qb-tag-empty">${r(X.message||"\u6A19\u7C64\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},N=(j,{focus:O=!1}={})=>{if(!j)return;let x=j.querySelector("[data-qb-tag-popover]"),L=j.querySelector("[data-qb-tag-search]");!x||!L||(x.hidden&&(x.hidden=!1,L.value="",S(j,"")),O&&(L.focus(),L.select()))},E=j=>{c&&(window.clearTimeout(c),c=null);let O=j?.querySelector("[data-qb-tag-popover]");O&&(O.hidden=!0)},I=async j=>{let O=String(j||"").trim();O&&(n.filters.tags.includes(O)?n.filters.tags=n.filters.tags.filter(x=>x!==O):n.filters.tags=[...n.filters.tags,O],n.offset=0,await k())},H=()=>{let j=Array.isArray(n.suites)?n.suites:[];if(!j.length)return n.selectedSuiteId=null,n.selectedBankItemId=null,null;let O=j.find(L=>Number(L.id)===Number(n.selectedSuiteId));O||(O=j[0],n.selectedSuiteId=O.id,n.selectedBankItemId=null);let x=Array.isArray(O.items)?O.items:[];return x.some(L=>Number(L.id)===Number(n.selectedBankItemId))||(n.selectedBankItemId=x[0]?.id??null),O},V=()=>{let j=i("suite");j&&(j.innerHTML=Ai(n))},Y=0,ye=async(j,{force:O=!1}={})=>{if(!j)return;let x=++Y;if(!O&&n.suiteAnswers[String(j)]){n.suiteAnswersLoading=!1,n.suiteAnswersError="",V();return}n.suiteAnswersLoading=!0,n.suiteAnswersError="",V();try{let L=await Q.benchmarkSuiteLatestAnswers(j);if(x!==Y)return;n.suiteAnswers[String(j)]=L.answers||{}}catch(L){if(x!==Y)return;n.suiteAnswersError=L.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}finally{x===Y&&(n.suiteAnswersLoading=!1,V())}},Te=async j=>{n.selectedSuiteId=j,n.selectedBankItemId=null,n.suiteAnswersError="";let O=H();if(!O){V();return}await ye(O.id)},J=j=>{n.bankTab=j==="full"?"full":"split",V()},B=()=>{let j=i("suite");if(!j)return;let O=H(),L=(Array.isArray(O?.items)?O.items:[]).find(F=>Number(F.id)===Number(n.selectedBankItemId))||null;for(let F of j.querySelectorAll(".qb-bank-row")){let Ee=Number(F.dataset.id)===Number(n.selectedBankItemId);F.classList.toggle("is-active",Ee);let G=F.querySelector("[data-qb-action='select-bank-item']");G&&G.setAttribute("aria-pressed",Ee?"true":"false")}let X=j.querySelector("[data-qb-bank-answer]");X&&(X.innerHTML=Li(n,L))},k=async()=>{let j=i("manage");if(j){c&&(window.clearTimeout(c),c=null),o(j,"\u8B80\u53D6\u984C\u5EAB\u4E2D\u2026");try{let O=await Q.questionBankItems({...n.filters,...n.filters.status==="retired"?{include_deleted:!0}:{}},n.limit,n.offset);n.items=O.items||[],n.total=Number(O.total||0),n.stats=O.stats||n.stats,l(j),j.innerHTML=wd(n),$()}catch(O){l(j),j.innerHTML=`<section class="report-card qb-card">${Ne({tone:"danger",title:"\u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:r(O.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},C=async({refreshAnswers:j=!1}={})=>{let O=i("suite");if(O){o(O,"\u8B80\u53D6 benchmark \u984C\u5EAB\u4E2D\u2026");try{let[x,L]=await Promise.all([Q.benchmarkSuites(),Q.benchmarkReadyQuestions(300)]);n.suites=x.suites||[],n.ready=L.items||[];let X=H();if(n.suiteAnswersError="",n.suiteAnswersLoading=!1,X&&(j||!n.suiteAnswers[String(X.id)]))try{let F=await Q.benchmarkSuiteLatestAnswers(X.id);n.suiteAnswers[String(X.id)]=F.answers||{}}catch(F){n.suiteAnswersError=F.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}l(O),O.innerHTML=Ai(n)}catch(x){l(O),O.innerHTML=`<section class="report-card qb-card">${Ne({tone:"danger",title:"Benchmark \u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:r(x.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},ne=()=>{let j=i("review");j&&(j.innerHTML=Md(n))},me=async j=>{let O=n.reviewItems.find(L=>Number(L.id)===Number(j));if(!O)return;n.reviewDetail=O,ne();let x=i("review")?.querySelector(".qb-review-detail-pane");x&&window.matchMedia("(max-width: 1020px)").matches&&x.scrollIntoView({behavior:"smooth",block:"start"});try{let L=await Q.questionBankItem(O.id);Number(n.reviewDetail?.id)===Number(O.id)&&(n.reviewDetail=L,ne())}catch(L){M(L.message||"\u984C\u76EE\u5167\u5BB9\u8B80\u53D6\u5931\u6557\u3002","danger")}},W=async()=>{let j=i("review");if(!j)return;o(j,"\u8B80\u53D6\u9A57\u6536\u984C\u76EE\u4E2D\u2026");let O=n.reviewFilter||"queue",x=O==="queue"?["pending_review","changes_requested"]:O==="accepted"?["accepted"]:O==="rejected"?["rejected"]:["draft"];try{let L=await Promise.all(x.map(G=>Q.questionBankItems({status:G},200,0)));n.reviewItems=L.flatMap(G=>G.items||[]),n.stats=L[0]?.stats||n.stats;let X=Number(n.reviewDetail?.id||0),Ee=n.reviewItems.some(G=>Number(G.id)===X)?X:Number(n.reviewItems[0]?.id||0);n.reviewDetail=Ee?await Q.questionBankItem(Ee):null,l(j),ne(),$()}catch(L){l(j),j.innerHTML=`<section class="report-card qb-card">${Ne({tone:"danger",title:"\u9A57\u6536\u984C\u76EE\u8B80\u53D6\u5931\u6557",text:r(L.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}};function ee(j){let O=n.tab;n.tab=j;for(let x of Object.keys(a)){let L=i(x);L&&(L.hidden=x!==j)}j==="create"?(O!=="create"&&!n.editing&&(n.aiQuestion="",n.aiResult=null),p()):j==="manage"?k():j==="suite"?C():j==="review"&&W()}let ae=j=>{let x=[...n.items,...n.reviewItems,...n.reviewDetail?[n.reviewDetail]:[]].find(X=>Number(X.id)===Number(j));n.reviewDetail=x||{id:Number(j)};let L=x?.status;["accepted","rejected","draft"].includes(L)?n.reviewFilter=L:L&&(n.reviewFilter="queue"),h("review")},Z=async j=>{let O=Rd(j),x=Number(j.elements.item_id?.value||0);x||(O.status=j.elements.submit_for_review?.checked?"pending_review":"draft");try{x?(await Q.updateQuestionBankItem(x,{...O,change_note:"\u984C\u5EAB\u7BA1\u7406\u4FEE\u6539"}),M("\u5DF2\u5EFA\u7ACB\u65B0\u7248\u672C\uFF0C\u72C0\u614B\u56DE\u5230\u5F85\u5BE9\u3002","ok")):(await Q.createQuestionBankItem(O),M(O.status==="draft"?"\u984C\u76EE\u5DF2\u5B58\u70BA\u8349\u7A3F\uFF0C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002":"\u984C\u76EE\u5DF2\u5EFA\u7ACB\u4E26\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok")),n.editing=null;let L=["manage","suite","review"].includes(n.editingFrom)?n.editingFrom:"manage";n.editingFrom="",n.suiteAnswers={},await f(),h(L)}catch(L){let X=L.detail||L.payload?.detail,F=X?.errors?.join(" \xB7 ")||X?.message||L.message||"\u984C\u76EE\u5132\u5B58\u5931\u6557\u3002";M(F,"danger",8e3)}},we=async j=>{let O=String(new FormData(j).get("question")||"").trim();if(O.length<4){M("\u984C\u76EE\u81F3\u5C11\u9700\u8981 4 \u500B\u5B57\u3002","danger");return}n.aiQuestion=O,n.aiLoading=!0,n.aiResult=null,p();try{let x=await Q.createQuestionBankItemWithAI({question:O});n.aiResult=x,n.aiQuestion="",await f(),M(`Ollama \u5DF2\u5EFA\u7ACB\u984C\u76EE #${x.item.id}\uFF0C\u72C0\u614B\u70BA\u5F85\u5BE9\uFF0C\u8ACB\u4EBA\u5DE5\u8986\u6838\u3002`,"ok",8e3)}catch(x){let L=x.detail||x.payload?.detail,X=L?.errors?.join(" \xB7 ")||L?.message||x.message||"Ollama \u7522\u751F\u5931\u6557\u3002";M(X,"danger",12e3)}finally{n.aiLoading=!1,p()}},z=async(j,O)=>{let x=Number(j.dataset.id||0);if(x)try{await Q.reviewQuestionBankItem(x,{decision:O,reviewer:v(),rubric_scores:Cd(j),comment:String(j.querySelector('[name="comment"]')?.value||"")}),M(O==="approved"?"\u984C\u76EE\u5DF2\u6838\u51C6\u3002":O==="changes_requested"?"\u5DF2\u9000\u56DE\u4FEE\u6539\u3002":"\u984C\u76EE\u5DF2\u62D2\u7D55\u3002",O==="approved"?"ok":"info"),await f(),await W()}catch(L){let X=L.detail||L.payload?.detail,F=X?.errors?.join(" \xB7 ")||X?.message||L.message||"\u9A57\u6536\u5931\u6557\u3002";M(F,"danger",8e3)}},ve=async j=>{let O=new FormData(j),x=Number(O.get("suite_id")||0),L=Array.from(j.querySelectorAll('input[name="item_ids"]:checked')).map(F=>Number(F.value)),X={name:String(O.get("name")||"").trim(),tier:String(O.get("tier")||"core"),description:String(O.get("description")||"").trim(),item_ids:L};try{x?(await Q.updateBenchmarkSuite(x,X),M("Benchmark \u984C\u5EAB\u5DF2\u66F4\u65B0\u3002","ok")):(await Q.createBenchmarkSuite(X),M("Benchmark \u984C\u5EAB\u5DF2\u5EFA\u7ACB\u3002","ok")),n.editingSuite=null,n.suiteManageOpen=!0,n.suiteAnswers={},await C()}catch(F){let Ee=F.detail||F.payload?.detail,G=Ee?.errors?.join(" \xB7 ")||Ee?.message||F.message||"Suite \u5132\u5B58\u5931\u6557\u3002";M(G,"danger",8e3)}},qe=async j=>{let O=e.querySelector("[data-qb-tag-filter] [data-qb-tag-popover]:not([hidden])")?.closest("[data-qb-tag-filter]");O&&!j.target.closest("[data-qb-tag-filter]")&&E(O);let x=j.target.closest("[data-qb-action]")?.dataset.qbAction;if(!x)return;let L=j.target.closest("[data-qb-action]"),X=Number(L.dataset.id||0);if(x==="open-tag-search"){let F=L.closest("[data-qb-tag-filter]");N(F,{focus:!0});return}if(x==="select-tag"){await I(L.dataset.tag);return}if(x==="remove-tag"){await I(L.dataset.tag);return}if(x==="bank-tab"){J(L.dataset.tab);return}if(x==="select-bank-item"){n.selectedBankItemId=X,B();return}if(x==="new"){n.editing=null,n.editingFrom="",n.aiQuestion="",n.aiResult=null,n.aiLoading=!1,h("create");return}if(x==="reset-create"){n.editing=null,p();return}if(x==="reset-ai"){n.aiQuestion="",n.aiResult=null,n.aiLoading=!1,p();return}if(x==="edit"){let F=n.suites.find(ce=>Number(ce.id)===Number(n.selectedSuiteId)),G=[...n.items,...n.reviewItems,...F?.items||[],...n.reviewDetail?[n.reviewDetail]:[]].find(ce=>Number(ce.id)===X);if(!G)return;n.editing=G,n.editingFrom=n.tab,h("create");return}if(x==="review"){ae(X);return}if(x==="review-ai-item"){let F=n.aiResult?.item;if(!F)return;n.reviewFilter="queue",n.reviewDetail=F,h("review");return}if(x==="review-filter"){let F=String(L.dataset.filter||"queue");n.reviewFilter=["queue","accepted","rejected","draft"].includes(F)?F:"queue",n.reviewDetail=null,await W();return}if(x==="select-review-item"){await me(X);return}if(x==="go-manage"){h("manage");return}if(x==="submit-review"){try{await Q.submitQuestionBankItemForReview(X),M("\u5DF2\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok"),await f(),n.tab==="manage"?await k():n.tab==="review"&&await W()}catch(F){let Ee=F.detail||F.payload?.detail,G=Ee?.errors?.join(" \xB7 ")||Ee?.message||F.message||"\u9001\u5BE9\u5931\u6557\u3002";M(G,"danger",8e3)}return}if(x==="restore"){if(!window.confirm(`\u78BA\u5B9A\u5FA9\u539F\u984C\u76EE #${X}\uFF1F\u5FA9\u539F\u5F8C\u6703\u56DE\u5230\u5F85\u5BE9\u72C0\u614B\uFF0C\u9700\u91CD\u65B0\u9A57\u6536\u3002`))return;try{await Q.restoreQuestionBankItem(X),M("\u984C\u76EE\u5DF2\u5FA9\u539F\u4E26\u56DE\u5230\u5F85\u5BE9\u3002","ok"),await f(),await k()}catch(F){let Ee=F.detail||F.payload?.detail,G=Ee?.errors?.join(" \xB7 ")||Ee?.message||F.message||"\u5FA9\u539F\u5931\u6557\u3002";M(G,"danger",8e3)}return}if(x==="delete"){if(n.tab==="suite"){let F=H();if(!F||!(F.items||[]).find(G=>Number(G.id)===X)||!window.confirm(`\u78BA\u5B9A\u5F9E\u300C${F.name}\u300D\u79FB\u9664\u984C\u76EE #${X}\uFF1F\u984C\u76EE\u4ECD\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u7BA1\u7406\u4E2D\u3002`))return;try{await Q.removeBenchmarkSuiteItem(F.id,X),M("\u5DF2\u5F9E Benchmark \u984C\u5EAB\u79FB\u9664\u3002","info"),delete n.suiteAnswers[String(F.id)],Number(n.selectedBankItemId)===X&&(n.selectedBankItemId=null),await C()}catch(G){M(G.message||"\u79FB\u9664\u5931\u6557\u3002","danger")}return}if(!window.confirm(`\u78BA\u5B9A\u522A\u9664\u984C\u76EE #${X}\uFF1F\u984C\u76EE\u6703\u6A19\u8A18\u70BA retired\uFF0C\u6B77\u53F2 benchmark \u4ECD\u6703\u4FDD\u7559\u3002`))return;try{await Q.deleteQuestionBankItem(X),M("\u984C\u76EE\u5DF2\u522A\u9664\u3002","info"),await f(),n.tab==="review"?(n.reviewDetail=null,await W()):await k()}catch(F){M(F.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(x==="revalidate"){try{let F=await Q.revalidateQuestionBank();M(`\u5DF2\u91CD\u65B0\u9A57\u8B49 ${u(F.checked||0)} \u984C\uFF0C${u(F.stale||0)} \u984C\u9700\u91CD\u65B0\u9A57\u6536\u3002`,"info",7e3),await f(),await k()}catch(F){M(F.message||"\u91CD\u65B0\u9A57\u8B49\u5931\u6557\u3002","danger")}return}if(x==="export"){try{let F=await Q.exportQuestionBank({status:""});Nt(`judgment-question-bank-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(F,null,2),"application/json;charset=utf-8")}catch(F){M(F.message||"\u532F\u51FA\u5931\u6557\u3002","danger")}return}if(x==="import-json"){let F=e.querySelector("#qb-import-json");try{let Ee=JSON.parse(String(F?.value||"").trim()),G=await Q.importQuestionBank(Ee);M(`\u532F\u5165\u5B8C\u6210\uFF1A\u65B0\u589E ${G.created}\u3001\u66F4\u65B0 ${G.updated}\u3001\u932F\u8AA4 ${(G.errors||[]).length}\u3002`,(G.errors||[]).length?"warn":"ok",8e3),F&&(F.value=""),await f(),await k()}catch(Ee){M(Ee.message||"JSON \u532F\u5165\u5931\u6557\u3002","danger",8e3)}return}if(x==="prev"||x==="next"){n.offset=Math.max(0,n.offset+(x==="next"?n.limit:-n.limit)),await k();return}if(x==="suite-edit"){let F=n.suites.find(Ee=>Number(Ee.id)===X);if(!F)return;n.editingSuite=F,n.suiteManageOpen=!0,C();return}if(x==="suite-new"){n.editingSuite=null,n.suiteManageOpen=!0,C();return}if(x==="suite-freeze"){try{await Q.updateBenchmarkSuite(X,{freeze:!0}),M("Benchmark \u984C\u5EAB\u5DF2\u51CD\u7D50\u4E26\u5EFA\u7ACB\u65B0\u7248\u672C\u3002","ok"),n.editingSuite=null,n.suiteManageOpen=!0,await C()}catch(F){M(F.message||"\u51CD\u7D50\u5931\u6557\u3002","danger")}return}if(x==="suite-delete"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 benchmark \u984C\u5EAB #${X}\uFF1F\u6B77\u53F2 run \u4ECD\u6703\u4FDD\u7559 snapshot\u3002`))return;try{await Q.deleteBenchmarkSuite(X),M("Benchmark \u984C\u5EAB\u5DF2\u522A\u9664\u3002","info"),n.editingSuite=null,n.suiteAnswers={},n.suiteManageOpen=!0,await C()}catch(F){M(F.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(x==="decide"){let F=L.closest("form[data-qb-form='review']");F&&await z(F,String(L.dataset.decision||""))}},ge=async j=>{let O=j.target.closest("[data-qb-form]");if(!O)return;j.preventDefault();let x=O.dataset.qbForm;if(x==="create")await Z(O);else if(x==="ai-create")await we(O);else if(x==="filter"){let L=new FormData(O);n.filters={query:String(L.get("query")||"").trim(),status:String(L.get("status")||""),question_type:String(L.get("question_type")||""),difficulty:String(L.get("difficulty")||""),tags:L.getAll("tags").map(X=>String(X).trim()).filter(Boolean)},n.offset=0,await k()}else x==="suite"&&await ve(O)},Xe=async j=>{let O=j.target.closest?.("form[data-qb-form='filter'] select");if(O){O.form.requestSubmit();return}let x=j.target.closest?.("[data-qb-suite-select]");if(!x)return;let L=Number(x.value||0);!L||L===Number(n.selectedSuiteId)||await Te(L)},Oe=j=>{let O=j.target;O?.matches?.(".qb-suite-manage")&&(n.suiteManageOpen=!!O.open)},Ue=j=>{let O=j.target.closest?.("[data-qb-action='open-tag-search']");O&&N(O.closest("[data-qb-tag-filter]"))},Be=j=>{let O=j.target.closest?.("[data-qb-tag-filter]");O&&(j.relatedTarget&&O.contains(j.relatedTarget)||E(O))},Qe=j=>{let O=j.target.closest?.("[data-qb-tag-search]");if(!O)return;let x=O.closest("[data-qb-tag-filter]");c&&window.clearTimeout(c),c=window.setTimeout(()=>{S(x,O.value)},160)},Ge=j=>{let O=j.target.closest?.("[data-qb-tag-search]");if(!O)return;let x=O.closest("[data-qb-tag-filter]");j.key==="Escape"?(j.preventDefault(),E(x),O.blur()):j.key==="Enter"?(j.preventDefault(),x?.querySelector("[data-qb-action='select-tag']")?.click()):j.key==="ArrowDown"&&(j.preventDefault(),x?.querySelector("[data-qb-action='select-tag']")?.focus())};e.addEventListener("click",qe),e.addEventListener("submit",ge),e.addEventListener("change",Xe),e.addEventListener("toggle",Oe,!0),e.addEventListener("mouseover",Ue),e.addEventListener("mouseout",Be),e.addEventListener("input",Qe),e.addEventListener("keydown",Ge);let mt=async()=>{await f(),n.tab==="create"?p():n.tab==="manage"?await k():n.tab==="suite"?await C({refreshAnswers:!0}):n.tab==="review"&&await W()};return f(),{show:ee,refresh:mt,destroy(){c&&window.clearTimeout(c),e.removeEventListener("click",qe),e.removeEventListener("submit",ge),e.removeEventListener("change",Xe),e.removeEventListener("toggle",Oe,!0),e.removeEventListener("mouseover",Ue),e.removeEventListener("mouseout",Be),e.removeEventListener("input",Qe),e.removeEventListener("keydown",Ge)},getStats:()=>n.stats}}function qa(e){if(e==null||e==="")return"\u2014";let t=Number(e);return Number.isFinite(t)?`${t.toFixed(t>=10?1:2)}%`:"\u2014"}function Ei(e){return e==null?"\u2014":u(e)}function Pd(e){return e.count?e.severity==="danger"?He("failed","\u9700\u8655\u7406"):e.severity==="warn"?He("warning","\u6CE8\u610F"):He("preview","\u63D0\u793A"):He("success","\u901A\u904E")}function Id(e){return e.count?e.severity==="danger"?"is-danger":e.severity==="warn"?"is-warn":"is-info":"is-ok"}function Bd(e){let t=Number(e.count)||0,s=Math.max(0,Math.min(100,Number(e.percent)||0));return`<div class="quality-check ${Id(e)}">
    <div class="quality-check-head">
      <span class="quality-check-label">${r(e.label)}</span>
      ${Pd(e)}
    </div>
    <div class="quality-check-value">
      <strong>${u(t)}</strong>
      <span>\u7B46</span>
      <em>${r(qa(e.percent))}</em>
    </div>
    <div class="quality-check-desc">${r(e.description)}</div>
    <div class="quality-check-track" aria-hidden="true">
      <span style="width:${s}%"></span>
    </div>
  </div>`}function xa(e,t,s){let a=Array.isArray(s)?s:[];if(!a.length)return`<div class="index-chart-card">
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
      <div class="metric-value">${r(qa(t.vector_coverage_pct))}</div>
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
              <td class="cell-number">${r(qa(t.match_rate))}</td>
              <td class="cell-number">${u(t.short_text_rows)}</td>
              <td class="cell-number">${u(s)}</td>
              <td class="cell-number">${u(t.duplicate_content_rows)}</td>
              <td class="cell-date">${r(Lt(t.date_min))} \u2013 ${r(Lt(t.date_max))}</td>
            </tr>`}).join("")}
      </tbody>
    </table>
  </div>`:rt({iconName:"table",title:"\u6C92\u6709\u539F\u59CB Parquet \u6A94\u6848",text:"\u5B8C\u6210\u5224\u6C7A RAR \u532F\u5165\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6BCF\u500B\u58D3\u7E2E\u6A94\u7684 DuckDB \u7D71\u8A08\u3002"})}function Fd(e){let t=e.totals||{},s=e.source||{},a=Array.isArray(e.checks)?e.checks:[],n=e.summary||{},i=e.distributions||{},o=Array.isArray(e.warnings)?e.warnings:[],l=Le(s.compressed_bytes||0);return`<div class="report-card quality-report" data-database="quality">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">DUCKDB DATA QUALITY</div>
        <div class="report-title">
          \u539F\u59CB Parquet \u8CC7\u6599\u54C1\u8CEA ${He(e.status||"operational")}
          <span class="chip">raw.parquet</span>
        </div>
        <div class="report-sub">
          ${u(t.rows)} \u7B46 \xB7 ${u(s.raw_files)} \u500B\u6A94\u6848 \xB7
          ${l} \xB7 \u6383\u63CF ${fe(e.scan_ms||0)} \xB7
          ${r(je(e.generated_at))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-quality">
          ${m("download",14)}<span>JSON</span>
        </button>
      </div>
    </div>
    ${o.length?`<div class="report-alert">${Ne({tone:"warn",title:"\u76EE\u524D\u9650\u5236\u8207\u5DEE\u7570",text:o.map(d=>r(d)).join("<br>")})}</div>`:""}
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
        <div class="summary-value">${r(qa(t.match_rate))}</div>
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
        ${xa("\u6CD5\u9662","\u5224\u6C7A\u7B46\u6578",i.courts)}
        ${xa("\u88C1\u5224\u5E74\u4EFD","\u5224\u6C7A\u7B46\u6578",i.years)}
        ${xa("\u71B1\u9580\u6CD5\u898F","\u63D0\u53CA\u5224\u6C7A\u6578",i.laws)}
        ${xa("\u71B1\u9580\u6848\u7531","\u5224\u6C7A\u7B46\u6578",i.titles)}
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
  </section>`;let t=e.querySelector("#quality-content"),s=e.querySelector("#quality-refresh"),a=e.querySelector("#quality-meta"),n=[...e.querySelectorAll("[data-quality-tab]")],i={overview:e.querySelector("#quality-panel-overview"),create:e.querySelector("#quality-panel-question-create"),manage:e.querySelector("#quality-panel-question-manage"),suite:e.querySelector("#quality-panel-benchmark-bank"),review:e.querySelector("#quality-panel-question-review")},o=null,l="overview",d=()=>{if(!o)return;t.innerHTML=Fd(o),a.textContent=`DUCKDB \xB7 ${u(o.totals?.rows)} \u7B46 \xB7 ${fe(o.scan_ms||0)}`;let p=e.querySelector("#quality-badge-overview");p&&(p.textContent=u(o.totals?.rows||0))},c=p=>{l=p==="overview"?"overview":p;for(let y of n){let S=y.dataset.qualityTab===l;y.classList.toggle("is-active",S),S?y.setAttribute("aria-current","page"):y.removeAttribute("aria-current")}for(let[y,S]of Object.entries(i))S&&(S.hidden=y!==l);l!=="overview"?a.textContent="QUESTION BANK \xB7 \u984C\u5EAB\u5DE5\u4F5C\u5340":o&&d()},v=Ni(e,{onNavigate:p=>c(p),onStats:p=>{let y=p||{},S=e.querySelector("#quality-badge-manage"),N=e.querySelector("#quality-badge-suite"),E=e.querySelector("#quality-badge-review");S&&(S.textContent=u(y.total||0)),N&&(N.textContent=u(y.benchmark_ready||0)),E&&(E.textContent=u((y.pending_review||0)+(y.changes_requested||0)))}}),$=p=>{c(p),p!=="overview"&&v.show(p)},h=async()=>{ke(s,!0,"\u6383\u63CF\u4E2D\u2026");try{o=await Q.quality(),d()}catch(p){t.innerHTML=`<div class="report-card">
        <div class="report-head">
          <div class="report-title-group">
            <div class="report-kicker">DUCKDB DATA QUALITY</div>
            <div class="report-title">\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557</div>
            <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
          </div>
        </div>
        <div class="report-section">
          ${Ne({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u54C1\u8CEA\u7D71\u8A08",text:r(p.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
        </div>
      </div>`,a.textContent="DUCKDB \xB7 \u8B80\u53D6\u5931\u6557",M("\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}finally{ke(s,!1)}},f=async()=>{l==="overview"?await h():await v.refresh()};s.addEventListener("click",f),e.addEventListener("click",p=>{let y=p.target.closest("[data-quality-tab]");y&&$(y.dataset.qualityTab||"overview")}),t.addEventListener("click",p=>{!p.target.closest("[data-action='export-quality']")||!o||Nt(`judgment-quality-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(o,null,2),"application/json;charset=utf-8")}),c("overview"),await h()}var In={};Jt(In,{render:()=>hu});var Aa={};Jt(Aa,{render:()=>Pn});var Ci={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"};function Ri(e,t){let s=Array.isArray(t)?t:[];return`<div class="tests-model-group">
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
      <span class="tests-llm-time">${e?.tested_at?`\u6E2C\u8A66\u65BC ${r(je(e.tested_at))}`:"\u5C1A\u7121\u6E2C\u8A66\u7D00\u9304"}</span>
    </div>
  </div>`}function Ud(e){let t=Array.isArray(e?.models)?e.models:[],s=e?.counts||{},a=Array.isArray(e?.failures)?e.failures:[];return{summary:e?`<span>Ollama <strong>${s.available??t.length}</strong> \u500B\u6A21\u578B</span>
      <span>\u652F\u63F4 chat <strong>${s.chat??0}</strong></span>
      <span>\u4E0D\u652F\u63F4 <strong>${s.unsupported??0}</strong></span>
      <span>\u672A\u6E2C\u8A66 <strong>${s.untested??0}</strong></span>
      <span>\u672C\u6B21\u65B0\u6E2C <strong>${(e.tested_now||[]).length}</strong></span>
      <span class="muted">${r(e.detail||"")}</span>`:"<span>\u6B63\u5728\u8B80\u53D6 Ollama \u6A21\u578B\u6E05\u55AE\u2026</span>",list:t.length?t.map(Hd).join(""):'<div class="tests-llm-empty">\u5C1A\u7121\u6A21\u578B\u8CC7\u6599\uFF1B\u8ACB\u78BA\u8A8D Ollama \u5DF2\u555F\u52D5\u4E26\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66\u3002</div>',failures:a.length?`<div class="tests-llm-failures">${a.map(i=>`<span><strong class="mono">${r(i.model||"\u2014")}</strong> ${r(i.detail||"\u6E2C\u8A66\u5931\u6557")}</span>`).join("")}</div>`:""}}function Qd(e,t,s){return JSON.stringify({selected:s,runs:(t||[]).map(a=>`${a.run_id}:${a.status}`),run:e?{run_id:e.run_id,status:e.status,progress:e.progress,total_ms:e.total_ms,steps:(e.steps||[]).map(a=>`${a.stage}:${a.model}:${a.status}:${a.progress}:${a.duration_ms}`)}:null})}async function Pn(e,t,{embedded:s=!1}={}){let a=!1,n=!1,i={embedding:[],llm:[]},o=!1,l=null,d=!1,c=null,v=[],$="",h=null,f="",p=`<div class="page-actions">
      <span class="badge badge-neutral badge-mono" id="tests-mode-badge">\u8B80\u53D6\u4E2D</span>
      <button class="btn btn-secondary" type="button" id="tests-refresh">
        ${m("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
      </button>
    </div>`,y=s?`<div class="tests-embed-head">
        <div>
          <div class="eyebrow">SYSTEM TEST</div>
          <div class="tests-embed-title">\u7CFB\u7D71\u6E2C\u8A66</div>
          <div class="tests-embed-copy">\u5F8C\u7AEF API \u9023\u7DDA\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u591A\u6A21\u578B\u6E2C\u8A66 Flow\u3002\u6E2C\u8A66\u6A21\u5F0F\u958B\u555F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207\u5177\u5099 chat \u80FD\u529B\u7684 LLM \u6A21\u578B\u3002</div>
        </div>
        ${p}
      </div>`:`<div class="page-header">
      <div>
        <div class="eyebrow">SYSTEM TEST</div>
        <h1 class="page-title">\u7CFB\u7D71\u6E2C\u8A66</h1>
        <p class="page-subtitle">\u5408\u4F75\u5F8C\u7AEF API \u9023\u7DDA\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u591A\u6A21\u578B\u6E2C\u8A66 Flow\u3002
          \u6E2C\u8A66\u6A21\u5F0F\u958B\u555F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207\u5177\u5099 chat \u80FD\u529B\u7684 LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002</p>
      </div>
      ${p}
    </div>`;e.innerHTML=`<section class="${s?"tests-page tests-page-embedded":"page tests-page"}">
    ${y}

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
  </section>`;let S=e.querySelector("#tests-mode-badge"),N=e.querySelector("#tests-mode-toggle"),E=e.querySelector("#tests-mode-summary"),I=e.querySelector("#tests-mode-models"),H=e.querySelector("#tests-mode-status"),V=e.querySelector("#tests-api-form"),Y=e.querySelector("#tests-api-input"),ye=e.querySelector("#tests-api-preview"),Te=e.querySelector("#tests-api-status"),J=e.querySelector("#tests-api-note"),B=e.querySelector("#tests-api-test"),k=e.querySelector("#tests-api-reset"),C=e.querySelector("#tests-api-save"),ne=e.querySelector("#tests-refresh"),me=e.querySelector("#tests-flow"),W=e.querySelector("#tests-llm-summary"),ee=e.querySelector("#tests-llm-list"),ae=e.querySelector("#tests-llm-failures"),Z=e.querySelector("#tests-llm-status"),we=e.querySelector("#tests-llm-test"),z=(G,ce,De="")=>{G&&(G.textContent=ce,G.className=`tests-status${De?` is-${De}`:""}`)},ve=(G,ce="")=>{Te&&(Te.textContent=G,Te.className=`api-dialog-status${ce?` is-${ce}`:""}`)},qe=()=>Kt()==="query",ge=()=>{let G=Vt(Y.value);return G||(window.location.protocol==="file:"?Ra:"")},Xe=()=>{let G=ge(),ce=Wt(),De=Ci[Kt()]||Kt()||"\u540C\u6E90";ye.innerHTML=`\u76EE\u524D\u751F\u6548\uFF1A<strong>${r(is(ce))}</strong>${ce?`\uFF08${r(De)}\uFF09`:""}<br />\u6B64\u4F4D\u5740\u7684\u5065\u5EB7\u6AA2\u67E5\uFF1A${r(bt("/api/health",G))}`},Oe=()=>{let G=Kt(),ce=`\u76EE\u524D\u4F86\u6E90\uFF1A${Ci[G]||G||"\u540C\u6E90"}\u3002\u512A\u5148\u9806\u5E8F\u70BA ?api= \u2192 \u700F\u89BD\u5668\u5132\u5B58\u503C \u2192 config.js \u2192 \u540C\u6E90\u3002`,De="";G==="query"?(De="is-warn",ce="\u6B64\u9801\u7531\u7DB2\u5740\u7684 ?api= \u53C3\u6578\u6307\u5B9A\u5F8C\u7AEF\u4F4D\u5740\uFF0C\u5177\u6709\u6700\u9AD8\u512A\u5148\u9806\u5E8F\u3002\u5132\u5B58\u6216\u6062\u5FA9\u9810\u8A2D\u5728\u6B64\u9801\u4E0D\u6703\u751F\u6548\uFF1B\u8ACB\u5148\u79FB\u9664\u7DB2\u5740\u4E2D\u7684 api \u53C3\u6578\u3002"):Ws()?(De="is-warn",ce="\u6B64\u9801\u4E0D\u662F\u5F9E localhost \u958B\u555F\uFF0C\u4E14\u5C1A\u672A\u8A2D\u5B9A\u5F8C\u7AEF API\u3002\u8ACB\u586B\u5165 cloudflared \u7684 https:// \u4F4D\u5740\uFF0C\u6216\u90E8\u7F72\u6642\u5728 config.js \u6307\u5B9A apiBase\uFF1BHTTP \u4F4D\u5740\u6703\u88AB HTTPS \u9801\u9762\u963B\u64CB\u3002"):(G==="file-default"||window.location.protocol==="file:")&&(ce="\u4EE5 file:// \u76F4\u63A5\u958B\u555F\u6642\uFF0C\u9810\u8A2D\u9023\u5230 http://127.0.0.1:9200\u3002\u82E5\u5F8C\u7AEF\u4F7F\u7528\u5176\u4ED6\u9023\u63A5\u57E0\uFF0C\u8ACB\u5728\u6B64\u4FEE\u6539\u4E26\u5132\u5B58\u3002"),J.textContent=ce,J.className=`api-dialog-note${De?` ${De}`:""}`;let We=G==="query";C.disabled=We,k.disabled=We,Y.readOnly=We},Ue=()=>{if(!Pa(Y.value))return ve("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002","error"),Y.focus(),null;let G=ge();return window.location.protocol==="https:"&&/^http:\/\//i.test(G)&&!/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(G)?(ve("HTTPS \u9801\u9762\u7121\u6CD5\u9023\u7DDA\u5230 HTTP API\uFF08mixed content\uFF09\u3002\u8ACB\u6539\u7528 cloudflared \u63D0\u4F9B\u7684 https:// \u4F4D\u5740\u3002","error"),Y.focus(),null):G},Be=()=>{Y.value=Wt(),Xe(),Oe(),ve("\u53EF\u5148\u6E2C\u8A66\u9023\u7DDA\uFF0C\u5132\u5B58\u5F8C\u9801\u9762\u6703\u91CD\u65B0\u8F09\u5165\u3002")},Qe=()=>{let G=Array.isArray(i.embedding)?i.embedding.length:0,ce=Array.isArray(i.llm)?i.llm.length:0;if(S&&(S.textContent=o?"\u5207\u63DB\u4E2D\u2026":n?"\u6E2C\u8A66\u6A21\u5F0F ON":"\u6E2C\u8A66\u6A21\u5F0F OFF",S.className=`badge badge-mono ${o?"badge-info":n?"badge-warn":"badge-neutral"}`),N){N.disabled=o,N.classList.toggle("is-on",n),N.classList.toggle("is-off",!n&&!o),N.classList.toggle("is-busy",o),N.setAttribute("aria-checked",n?"true":"false"),N.setAttribute("aria-busy",o?"true":"false"),N.setAttribute("aria-label",o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F":n?"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF0C\u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\uFF0C\u9EDE\u64CA\u958B\u555F"),N.title=o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F\u2026":n?"\u6E2C\u8A66\u6A21\u5F0F ON \xB7 \u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F OFF \xB7 \u9EDE\u64CA\u958B\u555F";let De=N.querySelector(".header-power-label");De&&(De.textContent=o?"\u2026":n?"ON":"OFF")}E&&(E.textContent=n?`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${G} \u500B embedding \u8207 ${ce} \u500B LLM \u6A21\u578B\u3002`:"\u76EE\u524D\u4F7F\u7528\u5FEB\u901F\u6A21\u5F0F\uFF1A\u55AE\u4E00 embedding \u8207 LLM\u3002"),I&&(I.innerHTML=Ri("Embedding",i.embedding)+Ri("LLM",i.llm))},Ge=async()=>{try{let G=await Q.testMode();if(a)return;n=!!G.enabled,i=G.models||{embedding:[],llm:[]},z(H,"")}catch(G){if(a)return;n=!1,i={embedding:[],llm:[]},z(H,G.message||"\u7121\u6CD5\u8B80\u53D6\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF API\u3002","error")}a||Qe()},mt=async()=>{if(o)return;let G=!n;o=!0,Qe(),z(H,G?"\u6B63\u5728\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u2026":"\u6B63\u5728\u95DC\u9589\u6E2C\u8A66\u6A21\u5F0F\u2026");try{let ce=await Q.setTestMode(G);if(a)return;n=!!ce.enabled,i=ce.models||{embedding:[],llm:[]},window.dispatchEvent(new CustomEvent("judgment:test-mode",{detail:{enabled:n,models:i}}));let De=i.embedding?.length||0,We=i.llm?.length||0;z(H,n?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A\u4E0B\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C ${De} \u500B embedding \u8207 ${We} \u500B LLM \u6A21\u578B\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","ok"),M(n?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A${De} \u500B embedding\u3001${We} \u500B LLM\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002",n?"ok":"info",6e3),await F()}catch(ce){a||(z(H,ce.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","error"),M(ce.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","danger",6e3))}finally{o=!1,a||Qe()}},j=()=>{let G=Ud(l);if(W&&(W.innerHTML=G.summary),ee&&(ee.innerHTML=G.list),ae&&(ae.innerHTML=G.failures),we){we.disabled=d,we.setAttribute("aria-busy",d?"true":"false");let ce=we.querySelector("span");ce&&(ce.textContent=d?"\u6E2C\u8A66\u4E2D\u2026":"\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66")}},O=async()=>{try{let G=await Q.llmModels();if(a)return;l=G,z(Z,"")}catch(G){if(a)return;l=null,z(Z,G.message||"\u7121\u6CD5\u8B80\u53D6 Ollama \u6A21\u578B\u6E05\u55AE\u3002","error")}a||j()},x=async()=>{if(!d){d=!0,j(),z(Z,"\u6B63\u5728\u6AA2\u67E5 Ollama \u6A21\u578B\u8207 chat \u80FD\u529B\u2026");try{let G=await Q.testLlmModels();if(a)return;l=G;let ce=G.tested_now?.length||0,De=G.chat_models?.length||0,We=G.failures?.length||0;z(Z,`${ce?`\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u672C\u6B21\u65B0\u6E2C ${ce} \u500B\u6A21\u578B`:"\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u6C92\u6709\u65B0\u6A21\u578B"}\uFF0C\u76EE\u524D ${De} \u500B\u6A21\u578B\u652F\u63F4 chat${We?`\uFF1B${We} \u500B\u6A21\u578B\u66AB\u6642\u7121\u6CD5\u5224\u5B9A\uFF0C\u4E0B\u6B21\u6703\u91CD\u8A66`:""}\u3002`,We?"warn":"ok"),M(ce?`LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u65B0\u589E ${ce} \u7B46\u80FD\u529B\u7D00\u9304\u3002`:"LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u6C92\u6709\u65B0\u6A21\u578B\u9700\u8981\u6E2C\u8A66\u3002",We?"warn":"ok",5e3),await Ge()}catch(G){a||(z(Z,G.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","error"),M(G.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","danger",6e3))}finally{d=!1,a||j()}}},L=()=>{if(!me)return;let G=Qd(c,v,$);G!==f&&(f=G,me.innerHTML=ws(c,v,$))},X=async()=>{try{let G=await Q.testRuns(30);if(a)return;v=Array.isArray(G.runs)?G.runs:[]}catch{if(a)return;v=[]}},F=async(G=null)=>{try{let ce=G||($?await Q.testRun($):await Q.testRunCurrent());if(a)return;c=ce.run||null,!$&&c&&c.status!=="running"&&!v.some(De=>De.run_id===c.run_id)&&await X()}catch{if(a)return;c=null}a||L()};Y?.addEventListener("input",()=>{Xe(),ve("\u5C1A\u672A\u6E2C\u8A66\u6B64\u4F4D\u5740\u3002")}),B?.addEventListener("click",async()=>{let G=Ue();if(G!==null){ke(B,!0,"\u6E2C\u8A66\u4E2D\u2026"),ve(`\u6B63\u5728\u9023\u7DDA\u5230 ${is(G)||"\u540C\u6E90"}\u2026`);try{let ce=await Un(G);if(a)return;ve(`\u9023\u7DDA\u6210\u529F \xB7 v${ce.version} \xB7 ${ce.duration_ms} ms \xB7 GET ${bt("/api/health",G)}`,"ok")}catch(ce){a||ve(ce.message||"\u9023\u7DDA\u6E2C\u8A66\u5931\u6557\u3002","error")}finally{a||ke(B,!1)}}}),V?.addEventListener("submit",G=>{if(G.preventDefault(),qe())return;let ce=Ue();ce!==null&&(Da(ce),M(`\u5F8C\u7AEF API \u5DF2\u8A2D\u70BA ${is(ce)}\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026`,"ok",1600),window.setTimeout(()=>window.location.reload(),120))}),k?.addEventListener("click",()=>{qe()||(Da(""),M("\u5DF2\u6E05\u9664\u700F\u89BD\u5668\u5132\u5B58\u7684 API \u4F4D\u5740\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026","info",1600),window.setTimeout(()=>window.location.reload(),120))}),N?.addEventListener("click",mt),we?.addEventListener("click",x),me?.addEventListener("change",async G=>{G.target.id==="test-run-select"&&($=String(G.target.value||""),await F())}),me?.addEventListener("click",async G=>{G.target.closest("#test-flow-refresh")&&($="",await X(),await F())}),ne?.addEventListener("click",async()=>{ke(ne,!0,"\u66F4\u65B0\u4E2D\u2026"),Be(),await Promise.allSettled([Ge(),X(),O()]),a||await F(),a||(ke(ne,!1),M("\u7CFB\u7D71\u6E2C\u8A66\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200))});let Ee=G=>{n=!!G.detail?.enabled,i=G.detail?.models||{embedding:[],llm:[]},Qe()};return window.addEventListener("judgment:test-mode",Ee),Be(),Qe(),j(),await Promise.allSettled([Ge(),X(),O()]),await F(),h=vt("test-runs",async(G,ce)=>{a||document.hidden||$||await F(ce?.snapshot||null)}),!s&&typeof t?.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"),()=>{a=!0,h&&h(),window.removeEventListener("judgment:test-mode",Ee)}}var Pi={frontend:"browser",backend:"server",database:"database",storage:"layers",vector:"cube",ai:"brain",default:"cpu"};var Oi={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90"},Di=[{id:"overview",label:"\u670D\u52D9\u7E3D\u89BD",hint:"\u5065\u5EB7\u72C0\u614B\u8207\u8CC7\u6599\u91CF",icon:"activity"},{id:"tests",label:"\u7CFB\u7D71\u6E2C\u8A66",hint:"API\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u6A21\u578B Flow",icon:"terminal"},{id:"resources",label:"\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528",hint:"CPU\u3001RAM\u3001Docker\u3001\u786C\u789F",icon:"cpu"},{id:"local-model",label:"Model Provider",hint:"Ollama \u4E3B\u6A5F\u8207\u6A21\u578B",icon:"server"},{id:"architecture",label:"\u524D\u5F8C\u7AEF\u67B6\u69CB",hint:"Client \u2192 Data \u2192 AI",icon:"layers"},{id:"data",label:"\u8CC7\u6599\u7248\u672C",hint:"Parquet \u8207 PostgreSQL",icon:"database"},{id:"api",label:"API \u7AEF\u9EDE",hint:"REST \u8207 OpenAPI",icon:"terminal"},{id:"runs",label:"\u6700\u8FD1\u4E0B\u8F09",hint:"\u6CD5\u898F\uFF0F\u547D\u4EE4\u57F7\u884C\u7D00\u9304",icon:"history"}];function Gd(e){return e==="operational"?{label:"\u6838\u5FC3\u670D\u52D9\u6B63\u5E38",tone:"ok",headline:"\u6838\u5FC3\u8CC7\u6599\u7BA1\u7DDA\u904B\u4F5C\u4E2D",copy:"FastAPI\u3001PostgreSQL \u8207 Parquet \u5747\u53EF\u5B58\u53D6\u3002Qdrant\u3001Embedding \u8207 LLM \u6703\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u8A2D\u5B9A\u6216\u964D\u7D1A\u6642\u4E0D\u5F71\u97FF\u8CC7\u6599\u700F\u89BD\u8207\u67E5\u8A62\u5831\u8868\u3002"}:e==="degraded"?{label:"\u90E8\u5206\u670D\u52D9\u964D\u7D1A",tone:"warn",headline:"\u90E8\u5206\u670D\u52D9\u9700\u8981\u8A2D\u5B9A\u6216\u4FEE\u5FA9",copy:"\u6838\u5FC3\u8CC7\u6599\u670D\u52D9\u76EE\u524D\u672A\u5B8C\u5168\u53EF\u7528\u3002\u8ACB\u67E5\u770B\u4E0B\u65B9\u670D\u52D9\u5361\u7247\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u7684\u57F7\u884C\u7D00\u9304\uFF0C\u78BA\u8A8D PostgreSQL\u3001Parquet \u6216\u5916\u90E8\u670D\u52D9\u72C0\u614B\u3002"}:{label:Tt(e).label,tone:Tt(e).tone,headline:"\u76EE\u524D\u7121\u6CD5\u78BA\u8A8D\u7CFB\u7D71\u72C0\u614B",copy:"\u72C0\u614B API \u56DE\u50B3\u4E86\u975E\u9810\u671F\u7D50\u679C\u3002\u8ACB\u91CD\u65B0\u6574\u7406\uFF0C\u6216\u76F4\u63A5\u6AA2\u67E5 FastAPI \u670D\u52D9\u65E5\u8A8C\u3002"}}function Jd(e){let t=Tt(e.status),s=Pi[e.kind]||Pi.default,a=e.latency_ms===null||e.latency_ms===void 0?"":`<span class="service-latency">${u(e.latency_ms)} ms</span>`;return`<article class="service-card">
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
  </article>`}function Vd(e,t){return`<div class="arch-node ${e?"":"is-muted"}" ${e?"":'title="\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165"'}>${r(t)}</div>`}function Wd(e,t){if(e==="IndexedDB")return cr();let a={PostgreSQL:"postgres",Parquet:"parquet",Qdrant:"qdrant",Embedding:"embedding",Retriever:"rag",Reranker:"reranker","RAG Engine":"rag",LLM:"llm"}[e];return a?t.find(i=>i.id===a)?.status==="operational":!0}function Kd(e,t){let s=e?.layers||[];if(!s.length)return'<div class="report-empty-inline">\u72C0\u614B API \u672A\u63D0\u4F9B\u67B6\u69CB\u8CC7\u6599\u3002</div>';let a=s.map(i=>{let o=(i.nodes||[]).map(l=>Vd(Wd(l,t),l)).join("");return`<div class="arch-layer">
      <div class="arch-layer-label">${r(i.label||i.id)}</div>
      <div class="arch-nodes">${o}</div>
    </div>`}),n=[];return a.forEach((i,o)=>{o&&n.push(`<div class="arch-arrow" aria-hidden="true">${m("arrowRight",15)}</div>`),n.push(i)}),`<div class="arch-flow">${n.join("")}</div>
    <div class="arch-legend">
      <span><i class="legend-key is-live"></i>\u5DF2\u63A5\u5165\u4E14\u72C0\u614B\u6B63\u5E38</span>
      <span><i class="legend-key is-off"></i>\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165</span>
      <span>${m("info",12)} \u7BC0\u9EDE\u72C0\u614B\u4F86\u81EA\u4E3B\u670D\u52D9\u5065\u5EB7\u6AA2\u67E5</span>
    </div>`}function Yd(e){return!Array.isArray(e)||!e.length?'<div class="report-empty-inline">\u6C92\u6709\u7AEF\u9EDE\u8CC7\u8A0A\u3002</div>':`<div class="endpoint-list">
    ${e.map(t=>`<div class="endpoint-row">
          <span class="endpoint-method">${r(t.method)}</span>
          <span class="endpoint-path" title="${r(t.path)}">${r(t.path)}</span>
          <span class="endpoint-label">${r(t.label||"")}</span>
        </div>`).join("")}
  </div>`}function Ve(e,t){return`<div class="detail-row">
    <span class="detail-label">${r(e)}</span>
    <span class="detail-value">${t}</span>
  </div>`}function Xd(e){return e?`<div class="detail-list">
    ${Ve("\u7248\u672C ID",`<strong>#${u(e.id)}</strong>`)}
    ${Ve("\u8CC7\u6599\u985E\u578B",He("operational",e.source_type==="law"?"\u6CD5\u898F":"\u547D\u4EE4"))}
    ${Ve("\u4F86\u6E90\u66F4\u65B0\u65E5",`<strong>${r(e.update_date||"\u2014")}</strong>`)}
    ${Ve("\u6CD5\u898F / \u689D\u6587",`<strong>${u(e.law_count)} / ${u(e.article_count)}</strong>`)}
    ${Ve("\u4E0B\u8F09\u6642\u9593",`<span class="mono">${je(e.downloaded_at)}</span>`)}
    ${Ve("Parquet",`<code title="${r(e.parquet_path||"")}">${r(e.parquet_path||"\u2014")}</code>`)}
  </div>`:'<div class="report-empty-inline">\u5C1A\u672A\u532F\u5165\u4EFB\u4F55\u8CC7\u6599\u7248\u672C\u3002</div>'}function Zd(e){if(!Array.isArray(e)||!e.length)return rt({iconName:"history",title:"\u5C1A\u7121\u4E0B\u8F09\u57F7\u884C\u7D00\u9304",text:"\u57F7\u884C judgment-law-download \u5F8C\uFF0C\u6210\u529F\u3001\u7121\u8B8A\u66F4\u8207\u5931\u6557\u7684\u7D50\u679C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"});let t=[{key:"id",label:"Run",type:"number"},{key:"source_type",label:"\u985E\u578B",type:"source"},{key:"status",label:"\u72C0\u614B",type:"status"},{key:"started_at",label:"\u958B\u59CB\u6642\u9593",type:"datetime"},{key:"duration_ms",label:"\u8017\u6642",type:"duration"},{key:"law_count",label:"\u6CD5\u898F",type:"number"},{key:"article_count",label:"\u689D\u6587",type:"number"},{key:"error_message",label:"\u932F\u8AA4",type:"longtext"}];return`<div class="table-wrap" style="border-top:0;max-height:340px">
    <table class="data-table runs-table">
      <thead><tr>${t.map(s=>`<th scope="col">${r(s.label)}</th>`).join("")}</tr></thead>
      <tbody>
        ${e.map(s=>`<tr>${t.map(a=>`<td>${Xs(s[a.key],a.type)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </div>`}function eu(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=new Map(s.map(y=>[y.id,y])),n=a.get("qdrant"),i=a.get("embedding"),o=a.get("rag"),l=a.get("llm"),d=Number(t.judgment_indexed_count||0),c=Number(t.judgment_count||0),v=c?(d/c*100).toFixed(1):"0.0",$=t.judgment_vector_points===null||t.judgment_vector_points===void 0?"\u2014":u(t.judgment_vector_points),h=Number(t.judgment_index_remaining||0),f=o?.status==="operational"?"RAG \u5C31\u7DD2":o?.status==="not_configured"?"\u672A\u8A2D\u5B9A":o?.status==="degraded"?"\u964D\u7D1A":"\u672A\u77E5",p=[["cube","Qdrant \u5411\u91CF\u7D22\u5F15",n],["layers",`Embedding\uFF08${t.judgment_vector_model||"\u2014"}\uFF09`,i],["brain","RAG \u56DE\u7B54\u7BA1\u7DDA",o],["sparkles","LLM \u6A21\u578B",l]];return`<section class="card data-section rag-index-card">
    <div class="side-card-head">
      <span class="side-card-title">${m("database",14)}RAG \u8CC7\u6599\u73FE\u6CC1</span>
      ${He(o?.status,f)}
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
        ${p.map(([y,S,N])=>`<div class="side-status-row">
              <span>${m(y,13)}${r(S)}</span>
              ${He(N?.status,N?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
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
  </section>`}function tu(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=Gd(e.status),n=s.find(c=>c.id==="qdrant"),i=s.find(c=>c.id==="rag"),o=s.find(c=>c.id==="llm"),l=Kt(),d=Oi[l]||l;return`<section class="status-hero">
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
          <span>${m("clock",11)} \u6AA2\u67E5\u6642\u9593 ${je(e.checked_at)} \xB7 ${r(Ls(e.checked_at))}</span>
          <span>${m("server",11)} ${s.length} \u500B\u670D\u52D9\u5143\u4EF6</span>
          <span>${m("database",11)} ${u(t.total_current)} \u7B46\u73FE\u884C\u8CC7\u6599</span>
          <span>${m("layers",11)} ${u(t.parquet_files)} \u500B\u539F\u59CB Parquet</span>
          <span title="API \u4F4D\u5740\u4F86\u6E90\uFF1A${r(d)}">${m("link",11)} ${r(is())}</span>
        </div>
      </div>
    </section>

    <div class="service-grid">${s.map(Jd).join("")}</div>

    ${eu(e)}

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

    ${n?.status==="not_configured"||i?.status==="not_configured"||o?.status==="not_configured"?`<div class="data-section">${Ne({tone:"info",title:"\u90E8\u5206 AI \u5143\u4EF6\u5C1A\u672A\u8A2D\u5B9A",text:`Qdrant\uFF1A${r(n?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BRAG\uFF1A${r(i?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BLLM\uFF1A${r(o?.detail||"\u672A\u8A2D\u5B9A")}\u3002\u9019\u4E9B\u72C0\u614B\u4E0D\u6703\u88AB\u507D\u88DD\u6210\u53EF\u7528\u3002`})}</div>`:""}`}function su(e){let t=Array.isArray(e.services)?e.services:[],s=e.architecture||{};return`<div class="data-section card architecture-card">
    <div class="section-head">
      <div>
        <div class="section-title">\u524D\u5F8C\u7AEF\u67B6\u69CB</div>
        <div class="section-sub">Client \u2192 Application \u2192 Data \u2192 Intelligence</div>
      </div>
      <span class="badge badge-neutral badge-mono">${u((s.flow||[]).length)} layers</span>
    </div>
    ${Kd(s,t)}
  </div>`}function au(e){let t=Kt(),s=Oi[t]||t,a=bt("/api/docs"),n=bt("/api/openapi.json");return`<div class="status-columns is-single">
    <section class="card">
      <div class="side-card-head">
        <span class="side-card-title">${m("terminal",14)}API \u7AEF\u9EDE</span>
        <a href="${r(a)}" target="_blank" rel="noopener noreferrer" class="chip"
          >OpenAPI ${m("external",11)}</a>
      </div>
      ${Yd(e.endpoints)}
      <div class="side-card-foot">
        \u76EE\u524D API Base\uFF1A<code>${r(is())}</code>\uFF08${r(s)}\uFF09\u3002\u4E92\u52D5\u5F0F API \u6587\u4EF6\u4F4D\u65BC <a href="${r(a)}" target="_blank" rel="noopener noreferrer"><code>${r(a)}</code></a>\uFF0COpenAPI schema \u4F4D\u65BC <a href="${r(n)}" target="_blank" rel="noopener noreferrer"><code>${r(n)}</code></a>\u3002
      </div>
    </section>
  </div>`}function nu(e){let t=e.data||{},s=Number(t.judgment_indexed_count||0),a=Number(t.judgment_count||0),n=a?(s/a*100).toFixed(1):"0.0",i=Number(t.judgment_index_remaining||0);return`<div class="status-summary">
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
          ${He("operational","Parquet")}
        </div>
        ${Xd(t.last_version)}
        <div class="side-card-foot">
          \u539F\u59CB Parquet \u5408\u8A08 ${Le(t.parquet_bytes)}\uFF1BPostgreSQL \u4FDD\u5B58 metadata \u8207\u7248\u672C\u72C0\u614B\u3002
        </div>
      </section>
      <section class="card">
        <div class="side-card-head">
          <span class="side-card-title">${m("database",14)}\u8CC7\u6599\u96C6\u7D71\u8A08</span>
          <span class="badge badge-neutral badge-mono">${u(t.parquet_files)} FILES</span>
        </div>
        <div class="detail-list">
          ${Ve("\u73FE\u884C\u6CD5\u898F",`<strong>${u(t.law_count)}</strong>`)}
          ${Ve("\u73FE\u884C\u547D\u4EE4",`<strong>${u(t.order_count)}</strong>`)}
          ${Ve("\u689D\u6587\u7E3D\u6578",`<strong>${u(t.article_count)}</strong>`)}
          ${Ve("\u539F\u59CB Parquet",`<strong>${Le(t.parquet_bytes)}</strong>`)}
          ${Ve("\u5224\u6C7A\u6587\u4EF6",`<strong>${u(t.judgment_count)}</strong>`)}
          ${Ve("\u5411\u91CF\u7D22\u5F15",`<strong>${u(t.judgment_indexed_count)}</strong> / ${u(t.judgment_count)}\uFF08${u(t.judgment_vector_points)} points\uFF09`)}
          ${Ve("\u7D22\u5F15\u8986\u84CB",`<strong>${n}%</strong> \xB7 \u5269\u9918 ${u(i)} \u7B46`)}
          ${Ve("\u7D22\u5F15\u7248\u672C",`<strong>#${u(t.judgment_vector_version_id)}</strong> \xB7 ${r(t.judgment_vector_version_status||"legacy")}`)}
          ${Ve("Alias",`<code>${r(t.judgment_vector_alias||"\u2014")}</code> \u2192 <code>${r(t.judgment_vector_collection||"\u2014")}</code>`)}
          ${Ve("\u7D22\u5F15\u6A21\u578B",`<code>${r(t.judgment_vector_model||"\u2014")}</code>`)}
          ${Ve("\u6700\u8FD1\u7D22\u5F15",`<span class="mono">${je(t.judgment_indexed_at)}</span>`)}
        </div>
      </section>
    </div>`}function ru(e){let t=e.data||{};return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${m("history",14)}\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C</span>
      <span class="badge badge-neutral badge-mono">${u(t.run_count)} TOTAL</span>
    </div>
    ${Zd(e.recent_runs)}
  </section>`}function iu(e){let t=Number(e);return Number.isFinite(t)?t>=90?"is-danger":t>=70?"is-warn":"":""}function Fi(e,t=""){let s=Math.max(0,Math.min(100,Number(e)||0));return`<div class="resource-bar ${t}"><span style="width:${s}%"></span></div>`}function ps(e,t,s,a,n){let i=iu(n);return`<article class="resource-card">
    <div class="resource-card-head">
      <span class="resource-card-label">${m(t,14)}${r(e)}</span>
      <strong>${r(s)}</strong>
    </div>
    ${Fi(n,i)}
    <div class="resource-card-detail">${a}</div>
  </article>`}function ou(e){let t=e.docker||{};if(!t.available)return`<section class="card data-section">
      <div class="side-card-head">
        <span class="side-card-title">${m("layers",14)}Docker</span>
        ${He("not_configured","\u672A\u9023\u7DDA")}
      </div>
      <div class="report-empty-inline">${r(t.detail||"Docker daemon \u672A\u9023\u7DDA\u3002")}</div>
    </section>`;let s=[...t.containers||[]].sort((i,o)=>{let l=i.service?0:1,d=o.service?0:1;return l-d||String(i.name).localeCompare(String(o.name))}),a=s.map(i=>`<tr>
        <td><strong>${r(i.name||"\u2014")}</strong>${i.service?`<span class="badge badge-neutral badge-mono">${r(i.service)}</span>`:""}</td>
        <td>${He(i.state==="running"?"operational":"degraded",i.state||"\u2014")}</td>
        <td class="cell-number">${i.cpu_percent===null||i.cpu_percent===void 0?"\u2014":`${u(i.cpu_percent)}%`}</td>
        <td class="cell-number">${Le(i.memory_used)}${i.memory_limit?` / ${Le(i.memory_limit)}`:""}</td>
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
  </section>`}function lu(e){return`<div class="resource-section-head">
      <div>
        <div class="section-title">\u5404\u8CC7\u6599\u5EAB\u4F7F\u7528\u8CC7\u6E90</div>
        <div class="section-sub">\u5BB9\u5668 CPU\uFF0FRAM \u8207\u8CC7\u6599\u5EAB\u5167\u90E8\u5BB9\u91CF</div>
      </div>
    </div>
    <div class="resource-db-grid">${(Array.isArray(e.databases)?e.databases:[]).map(s=>{let a=s.id==="postgres",n=Array.isArray(s.tables)?s.tables:[],i=s.status==="operational"?"operational":s.status==="not_configured"?"not_configured":"degraded",o=a?`${Ve("\u8CC7\u6599\u5EAB",`<code>${r(s.database||"\u2014")}</code>`)}
           ${Ve("\u8CC7\u6599\u5EAB\u5927\u5C0F",`<strong>${Le(s.storage_bytes)}</strong>`)}
           ${Ve("Docker volume",`<strong>${Le(s.volume_bytes)}</strong>${s.volume_name?` <code>${r(s.volume_name)}</code>`:""}`)}
           ${Ve("\u9023\u7DDA\u6578",`<strong>${u(s.connections)}</strong>`)}`:`${Ve("Collection",`<code>${r(s.collection||"\u2014")}</code>`)}
           ${Ve("Docker volume",`<strong>${Le(s.volume_bytes)}</strong>${s.volume_name?` <code>${r(s.volume_name)}</code>`:""}`)}
           ${Ve("\u5411\u91CF\u9EDE\u6578",`<strong>${u(s.points_count)}</strong>`)}
           ${Ve("Collections",`<strong>${u(s.collections)}</strong>`)}
           ${Ve("Segments",`<strong>${u(s.segments_count)}</strong>`)}`;return`<article class="resource-db-card">
        <div class="resource-db-head">
          <div>
            <div class="resource-db-title">${r(s.name||"\u2014")}</div>
            <div class="resource-db-kind">${r(s.kind||"")}</div>
          </div>
          ${He(i)}
        </div>
        <div class="resource-db-metrics">
          <div><span>CPU</span><strong>${s.cpu_percent===null||s.cpu_percent===void 0?"\u2014":`${u(s.cpu_percent)}%`}</strong></div>
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
      </article>`}).join("")}</div>`}function Ss(e,t,s,a){let n=Number(t)||0,i=a?n/a*100:0;return`<div class="storage-row">
    <div class="storage-row-head">
      <span>${r(e)}</span>
      <strong>${Le(n)}</strong>
    </div>
    ${Fi(i)}
    <div class="storage-row-detail">${s}</div>
  </div>`}function cu(e){let t=e.storage||{},s=t.application||{},a=t.parquet||{},n=t.docker||{},i=t.volumes||{},o=i.postgres||{},l=i.qdrant||{},d=Number(t.judgment_total_bytes||0);return`<section class="card data-section storage-section">
    <div class="side-card-head">
      <span class="side-card-title">${m("database",14)}\u786C\u789F\u4F7F\u7528\u7D44\u6210</span>
      <span class="badge badge-neutral badge-mono">${Le(d)}</span>
    </div>
    <div class="storage-list">
      ${Ss("\u524D\u7AEF",s.frontend_bytes,`<span class="mono">${r(s.frontend_path||"\u2014")}</span>`,d)}
      ${Ss("\u5F8C\u7AEF",s.backend_bytes,`<span class="mono">${r(s.backend_path||"\u2014")}</span>`,d)}
      ${Ss("Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5FEB\u53D6",n.layers_bytes,`Images ${Le(n.images_bytes)} \xB7 Containers ${Le(n.containers_bytes)} \xB7 Build cache ${Le(n.build_cache_bytes)}`,d)}
      ${Ss("PostgreSQL volume",o.size_bytes,`<span class="mono">${r(o.name||"\u2014")}</span>`,d)}
      ${Ss("Qdrant volume",l.size_bytes,`<span class="mono">${r(l.name||"\u2014")}</span>`,d)}
      ${Ss("Parquet",a.total_bytes,`\u6CD5\u898F ${Le(a.law_bytes)} \xB7 \u5224\u6C7A ${Le(a.judgment_bytes)}`,d)}
    </div>
    <div class="storage-total">
      <span>Judgment \u5143\u4EF6\u5408\u8A08</span>
      <strong>${Le(d)}</strong>
    </div>
    <div class="side-card-foot">
      \u524D\u7AEF\uFF0B\u5F8C\u7AEF\u7A0B\u5F0F\u3001Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5EFA\u7F6E\u5FEB\u53D6\u3001PostgreSQL\uFF0FQdrant volume \u8207\u539F\u59CB Parquet\uFF1B\u4E0D\u542B .venv \u8207\u5176\u4ED6\u975E Judgment Docker volume\u3002
    </div>
  </section>`}function du(e){let t=e.host||{},s=t.cpu||{},a=t.memory||{},n=t.swap||{},i=e.storage||{},o=i.filesystem||{},l=Number(i.judgment_total_bytes||0),d=Array.isArray(e.disk)?e.disk:[],c=d[0]||{},v=Number(o.total_bytes||c.total||0),$=v?l/v*100:0,h=[s.load_1,s.load_5,s.load_15].map(y=>y??"\u2014").join(" / "),f=t.uptime_seconds===null||t.uptime_seconds===void 0?"\u2014":fe(Number(t.uptime_seconds)*1e3),p=[c.label?ps("HDD \u5DF2\u4F7F\u7528","database",`${u(c.percent)}%`,`${Le(c.used)} / ${Le(c.total)} \xB7 \u5269\u9918 ${Le(c.free)}<br><span class="mono">${r(c.path||"")}</span>`,c.percent):"",l?ps("Judgment \u5143\u4EF6\u5408\u8A08","layers",Le(l),`\u7D04\u5360 HDD ${u($)}% \xB7 \u524D\u7AEF\uFF0F\u5F8C\u7AEF\uFF0FDocker\uFF0FDB volume\uFF0FParquet`,$):"",...d.slice(1).map(y=>ps(`\u786C\u789F \xB7 ${y.label}`,"layers",`${u(y.percent)}%`,`${Le(y.used)} / ${Le(y.total)} \xB7 \u5269\u9918 ${Le(y.free)}<br><span class="mono">${r(y.path||"")}</span>`,y.percent))].filter(Boolean).join("");return`<div class="resource-section-head">
      <div>
        <div class="eyebrow">SYSTEM RESOURCE USAGE</div>
        <div class="section-sub">\u66F4\u65B0\u6642\u9593 ${je(e.checked_at)} \xB7 ${e.status==="operational"?"\u8CC7\u6E90\u8B80\u53D6\u6B63\u5E38":"\u90E8\u5206\u8CC7\u6E90\u964D\u7D1A"}</div>
      </div>
    </div>
    <div class="resource-grid">
      ${ps("CPU \u4F7F\u7528\u7387","cpu",`${u(s.percent)}%`,`${u(s.logical_cores)} \u908F\u8F2F\u6838\u5FC3 \xB7 ${u(s.physical_cores)} \u5BE6\u9AD4\u6838\u5FC3<br>Load ${r(h)}`,s.percent)}
      ${ps("\u8A18\u61B6\u9AD4","server",`${u(a.percent)}%`,`${Le(a.used)} / ${Le(a.total)} \xB7 \u53EF\u7528 ${Le(a.available)}`,a.percent)}
      ${ps("Swap","layers",`${u(n.percent)}%`,`${Le(n.used)} / ${Le(n.total)}`,n.percent)}
      ${ps("\u7A0B\u5E8F\u8207\u958B\u6A5F","activity",`${u(t.processes)} \u500B\u7A0B\u5E8F`,`\u958B\u6A5F ${r(f)}<br>${r(t.platform||"")}`,null)}
    </div>
    <div class="resource-grid resource-disk-grid">${p||'<div class="report-empty-inline">\u627E\u4E0D\u5230\u53EF\u8B80\u53D6\u7684\u78C1\u789F\u3002</div>'}</div>
    ${cu(e)}
    ${ou(e)}
    ${lu(e)}`}function Ii(){return`<div class="resource-section-head">
      <div>
        <div class="skeleton skeleton-line" style="width:160px;height:18px"></div>
        <div class="skeleton skeleton-line" style="width:260px;margin-top:8px"></div>
      </div>
    </div>
    <div class="resource-grid">
      ${Array.from({length:4}).map(()=>'<div class="skeleton" style="height:120px;border-radius:var(--radius-md)"></div>').join("")}
    </div>
    <div class="skeleton" style="height:180px;margin-top:16px;border-radius:var(--radius-md)"></div>
    <div class="skeleton" style="height:220px;margin-top:16px;border-radius:var(--radius-md)"></div>`}function uu(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SYSTEM RESOURCE USAGE</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${Ne({tone:"danger",title:"\u8CC7\u6E90 API \u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-resources-retry">
          ${m("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function pu(e){return e.status==="operational"?{label:"\u5DF2\u9023\u7DDA",badge:"badge-ok"}:{label:"\u7121\u6CD5\u9023\u7DDA",badge:"badge-danger"}}function mu(e,t){let s=pu(e),a=Array.isArray(e.models)?e.models:[],n=a.length?a.map(i=>{let o=String(i.name||""),l=e.chat_model===o,d=e.embedding_model===o,c=i.size?Le(i.size):"",v=i.modified_at?je(i.modified_at):"",$=new Set((i.capabilities||[]).map(f=>String(f||"").toLowerCase())),h=[];return i.supports_chat===!0&&h.push(["Chat","badge-ok"]),$.has("embedding")&&h.push(["Embedding","badge-info"]),$.has("vision")&&h.push(["Vision","badge-neutral"]),$.has("tools")&&h.push(["Tools","badge-neutral"]),$.has("thinking")&&h.push(["Thinking","badge-neutral"]),$.has("speech")&&h.push(["Speech","badge-warn"]),i.is_reranker&&h.push(["Reranker","badge-neutral"]),h.length||h.push([i.capability_status==="untested"?"\u672A\u6E2C\u8A66":"\u7121 chat \u80FD\u529B","badge-neutral"]),`<div class="ollama-model-row">
            <div class="ollama-model-main">
              <strong>${r(o)}</strong>
              <span class="ollama-model-meta">${[c,v].filter(Boolean).map(f=>r(f)).join(" \xB7 ")||"\u2014"}</span>
              <div class="ollama-model-capabilities">${h.map(([f,p])=>`<span class="badge ${p}">${r(f)}</span>`).join("")}</div>
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
  </article>`}function gu(e,t,s,a){if(s)return`<div class="report-card">
      ${Ne({tone:"danger",title:"Model Provider \u8B80\u53D6\u5931\u6557",text:r(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
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
      ${t?'<div class="ollama-loading"><span class="spinner"></span><span>\u8B80\u53D6 Ollama \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span></div>':i.length?`<div class="ollama-host-list">${i.map(c=>mu(c,a)).join("")}</div>`:rt({iconName:"server",title:"\u5C1A\u672A\u8A2D\u5B9A Ollama \u4E3B\u6A5F",text:"\u8ACB\u5728\u4E0A\u65B9\u8F38\u5165\u7DB2\u5740\u8207 Port \u65B0\u589E\uFF0C\u6216\u4F7F\u7528 .env \u7684\u9810\u8A2D\u9023\u7DDA\u3002"})}
      <p class="report-sub" style="margin-top:12px">\u8A2D\u70BA\u804A\u5929\u6216\u5D4C\u5165\u6A21\u578B\u5F8C\uFF0C\u7CFB\u7D71\u6703\u4F7F\u7528\u76EE\u524D\u4E3B\u6A5F\u7684\u5C0D\u61C9\u6A21\u578B\u57F7\u884C AI \u51FA\u984C\u8207 RAG\uFF1B\u672A\u8A2D\u5B9A\u6642\u6CBF\u7528 .env \u7684 LLM_MODEL\uFF0FEMBEDDING_MODEL\u3002</p>
    </div>
  </div>`}function fu(e,t,s){let a=e?.data||{},n=e?Tt(e.status):null,i=s?Tt(s.status):null,o={overview:n?`<span class="badge ${n.tone==="ok"?"badge-ok":n.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${r(n.label)}</span>`:"",resources:i?`<span class="badge ${i.tone==="ok"?"badge-ok":i.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${r(i.label)}</span>`:'<span class="badge badge-neutral badge-mono">\u672A\u8B80\u53D6</span>',data:`<span class="badge badge-neutral badge-mono">${u(a.version_count)}</span>`,tests:'<span class="badge badge-neutral badge-mono">TEST</span>',"local-model":'<span class="badge badge-neutral badge-mono">OLLAMA</span>',runs:`<span class="badge badge-neutral badge-mono">${u(a.run_count)}</span>`};return`<div class="status-sidebar-head">
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
      <span class="mono">${r(e?je(e.checked_at):"\u2014")}</span>
    </div>`}function bu(e,t,s,a,n,i){if(e==="resources")return s?du(s):a?Ii():n?uu(n):Ii();if(e==="local-model"){let o=i||{},l=!!o.loading||!o.hosts&&!o.error;return gu(o.hosts||null,l,o.error||null,o.editingId||null)}return e==="architecture"?su(t):e==="api"?au(t):e==="data"?nu(t):e==="runs"?ru(t):tu(t)}function vu(){return`<div class="status-hero">
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
      ${Ne({tone:"danger",title:"\u72C0\u614B API \u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-retry">
          ${m("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}async function hu(e,t){let s=!1,a=null,n=null,i="overview",o=null,l=!1,d=null,c=null,v=!1,$=null,h=null,f=!1,p=!1,y=null,S=0,N="",E="";e.innerHTML=`<section class="page status-page">
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
      <section class="status-panel" id="status-content">${vu()}</section>
    </div>
  </section>`;let I=e.querySelector("#status-nav"),H=e.querySelector("#status-content"),V=e.querySelector("#refresh-status"),Y=e.querySelector("#auto-refresh"),ye=()=>{if(S+=1,typeof y=="function")try{y()}catch{}y=null,f=!1,p=!1},Te=async()=>{let ee=++S;p=!0,E="",H.innerHTML="";try{let ae=await Pn(H,{setTitle:()=>{}},{embedded:!0});if(ee!==S||i!=="tests"){typeof ae=="function"&&ae();return}y=typeof ae=="function"?ae:null,f=!0}catch(ae){ee===S&&i==="tests"&&(H.innerHTML=Bi(ae))}finally{ee===S&&(p=!1)}},J=()=>{if(!n)return;let ee=fu(n,i,o);if(ee!==N&&(I.innerHTML=ee,N=ee),i==="tests"){!f&&!p&&Te();return}ye();let ae=bu(i,n,o,l,d,{hosts:c,loading:v,error:$,editingId:h});ae!==E&&(H.innerHTML=ae,E=ae)},B=async({quiet:ee=!1}={})=>{if(!l){l=!0,d=null,i==="resources"&&!o&&J();try{let ae=await Q.systemUsage();if(s)return;o=ae}catch(ae){if(s)return;d=ae,ee||M(ae.message||"\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90\u3002","danger")}finally{s||(l=!1,i==="resources"&&J())}}},k=async({quiet:ee=!1}={})=>{if(!v){v=!0,$=null,i==="local-model"&&!c&&J();try{let ae=await Q.ollamaHosts();if(s)return;c=ae}catch(ae){if(s)return;$=ae,ee||M(ae.message||"\u7121\u6CD5\u53D6\u5F97 Ollama \u4E3B\u6A5F\u3002","danger")}finally{s||(v=!1,i==="local-model"&&J())}}},C=async()=>{await k({quiet:!0}),await ne({quiet:!0})},ne=async({quiet:ee=!1,status:ae=null}={})=>{ee||(V.disabled=!0,ke(V,!0,"\u6AA2\u67E5\u4E2D\u2026"));try{let Z=ae||await Q.status();if(s)return;n=Z,J(),ee||M("\u670D\u52D9\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(Z){if(s)return;i!=="tests"&&(E="",H.innerHTML=Bi(Z)),ee||M(Z.message||"\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002","danger")}finally{s||(V.disabled=!1,ke(V,!1))}},me=async({quiet:ee=!1,status:ae=null}={})=>{if(await ne({quiet:ee,status:ae}),i==="resources"&&await B({quiet:ee}),i==="local-model"&&await k({quiet:ee}),!ee&&i==="tests"){let Z=H.querySelector("#tests-refresh");Z&&Z.click()}};I.addEventListener("click",ee=>{let ae=ee.target.closest("[data-status-tab]");if(!ae)return;let Z=ae.dataset.statusTab;Di.some(we=>we.id===Z)&&(i=Z,J(),i==="resources"&&!o&&!l&&B(),i==="local-model"&&k())}),H.addEventListener("click",ee=>{ee.target.closest("#status-retry")&&ne(),ee.target.closest("#status-resources-retry")&&B()}),H.addEventListener("click",async ee=>{let ae=ee.target.closest("[data-ollama-action]");if(!ae)return;let Z=ae.dataset.ollamaAction,we=Number(ae.dataset.id||0);if(Z==="refresh-hosts"){await k();return}if(Z==="edit-host"){h=we,J(),e.querySelector(".ollama-host-form")?.scrollIntoView({behavior:"smooth",block:"center"});return}if(Z==="cancel-host-edit"){h=null,J();return}if(Z==="delete-host"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 Ollama \u4E3B\u6A5F #${we}\uFF1F`))return;try{await Q.deleteOllamaHost(we),Number(h)===we&&(h=null),M("Ollama \u4E3B\u6A5F\u5DF2\u522A\u9664\u3002","info"),await C()}catch(z){M(z.message||"\u522A\u9664\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(Z==="activate-host"){try{await Q.activateOllamaHost(we),M("\u5DF2\u5207\u63DB\u4F7F\u7528\u7684 Ollama \u4E3B\u6A5F\u3002","ok"),await C()}catch(z){M(z.message||"\u5207\u63DB\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(Z==="deactivate-host"){try{await Q.deactivateOllamaHosts(),M("\u5DF2\u505C\u7528\u6307\u5B9A\u7684 Ollama \u4E3B\u6A5F\uFF0C\u5C07\u6CBF\u7528 .env \u8A2D\u5B9A\u3002","info"),await C()}catch(z){M(z.message||"\u505C\u7528\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(Z==="check-capabilities"){ke(ae,!0,"\u6AA2\u67E5\u4E2D\u2026");try{await Q.checkOllamaCapabilities(),M("\u5DF2\u66F4\u65B0\u6240\u6709\u4E3B\u6A5F\u7684\u6A21\u578B\u80FD\u529B\u3002","ok",4e3),await C()}catch(z){M(z.message||"\u7121\u6CD5\u6AA2\u67E5\u6A21\u578B\u80FD\u529B\u3002","danger",7e3)}finally{ke(ae,!1)}return}if(Z==="select-model"||Z==="clear-model"){let z=String(ae.dataset.model||""),ve=String(ae.dataset.role||"");try{Z==="select-model"?(await Q.selectOllamaModel(we,{model:z,role:ve}),M(`\u5DF2\u8A2D\u5B9A ${ve==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\uFF1A${z}`,"ok")):(await Q.clearOllamaModel(we,{model:z,role:ve}),M(`\u5DF2\u53D6\u6D88 ${ve==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\u3002`,"info")),await C()}catch(qe){M(qe.message||"\u6A21\u578B\u8A2D\u5B9A\u5931\u6557\u3002","danger")}}}),H.addEventListener("submit",async ee=>{let ae=ee.target.closest("form[data-ollama-form='host']");if(!ae)return;ee.preventDefault();let Z=new FormData(ae),we=Number(Z.get("host_id")||0),z={name:String(Z.get("name")||"").trim(),url:String(Z.get("url")||"").trim(),port:Number(Z.get("port")||11434)};try{we?(await Q.updateOllamaHost(we,z),M("Ollama \u4E3B\u6A5F\u5DF2\u66F4\u65B0\u3002","ok")):(await Q.addOllamaHost(z),M("Ollama \u4E3B\u6A5F\u5DF2\u65B0\u589E\u3002","ok")),h=null,await C()}catch(ve){let qe=ve.detail||ve.payload?.detail,ge=qe?.errors?.join(" \xB7 ")||qe?.message||ve.message||"\u5132\u5B58\u4E3B\u6A5F\u5931\u6557\u3002";M(ge,"danger",8e3)}}),V.addEventListener("click",()=>me());let W=()=>{a&&(a(),a=null)};return Y.addEventListener("change",()=>{W(),Y.checked&&(a=vt("status",(ee,ae)=>{s||me({quiet:!0,status:ae?.snapshot||null})}),me({quiet:!0}),M("\u5DF2\u555F\u7528\u5F8C\u7AEF\u63A8\u9001\u81EA\u52D5\u66F4\u65B0\uFF08\u6BCF 30 \u79D2\uFF09\u3002","info",2200))}),await ne({quiet:!0}),t&&typeof t.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"),()=>{s=!0,ye(),W()}}var zi="home",La={home:{page:en,title:"Judgment RAG Console \xB7 \u6CD5\u898F\u8207\u5224\u6C7A\u6AA2\u7D22"},rag:{page:wn,title:"RAG \u63D0\u554F \xB7 Judgment RAG Console"},data:{page:pn,title:"\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"},quality:{page:Rn,title:"\u8CC7\u6599\u54C1\u8CEA \xB7 Judgment RAG Console"},performance:{page:hn,title:"\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"},processing:{page:Ln,title:"\u8CC7\u6599\u8655\u7406 \xB7 Judgment RAG Console"},status:{page:In,title:"\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"},tests:{page:Aa,title:"\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"}},Bn=document.getElementById("app-main"),Ma=null,ja=0;function Dn(){let t=window.location.hash.replace(/^#\/?/,"").trim().split("/")[0]||zi;return Object.prototype.hasOwnProperty.call(La,t)?t:zi}function $u(e){document.querySelectorAll("[data-route]").forEach(t=>{let s=t.dataset.route===e;t.classList.toggle("is-active",s),s?t.setAttribute("aria-current","page"):t.removeAttribute("aria-current")})}function yu(e){return`<section class="page">
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
  </section>`}async function On(){let e=Dn(),t=++ja;if($u(e),window.location.hash!==`#/${e}`&&window.history.replaceState(null,"",`#/${e}`),typeof Ma=="function"){try{Ma()}catch{}Ma=null}document.title=La[e].title;let s={route:e,navigate(a){La[a]&&(window.location.hash=`#/${a}`)},setTitle(a){t===ja&&a&&(document.title=a)}};try{let a=La[e].page.render(Bn,s);rr(),window.scrollTo({top:0,behavior:"auto"}),Bn.focus({preventScroll:!0});let n=await a;if(t!==ja){typeof n=="function"&&n();return}Ma=typeof n=="function"?n:null}catch(a){if(t!==ja)return;console.error("Failed to render route",e,a),Bn.innerHTML=yu(a);let n=document.getElementById("route-retry");n&&n.addEventListener("click",()=>On()),M("\u9801\u9762\u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}}function wu(){document.addEventListener("keydown",e=>{if(e.key!=="/"||e.metaKey||e.ctrlKey||e.altKey)return;let t=document.activeElement;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable))return;let a=Dn(),n=a==="home"?"home-question":a==="rag"?"rag-question":"";if(!n)return;let i=document.getElementById(n);i&&(e.preventDefault(),i.focus())})}function _u(){let e=document.querySelector('[data-route="processing"]');if(!e)return;let t=e.querySelector(".nav-update-badge");t||(t=document.createElement("span"),t.className="nav-update-badge",t.hidden=!0,e.appendChild(t));let s=async(a=null)=>{try{let n=a||await Q.updatesStatus(),i=Number(n.update_count)||0;i>0?(t.textContent=String(i),t.title=`\u6CD5\u898F\uFF0F\u547D\u4EE4\uFF0F\u5224\u6C7A\u6709 ${i} \u9805\u66F4\u65B0`,t.hidden=!1):t.hidden=!0}catch{t.hidden=!0}};s(),vt("updates",(a,n)=>s(n?.snapshot||null)),window.addEventListener("judgment:updates-changed",()=>s())}function Hi(){or(),wu(),_u(),window.addEventListener("hashchange",On),On(),Ws()&&window.setTimeout(()=>{Dn()==="rag"&&(window.location.hash="#/tests")},700)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Hi):Hi();})();
