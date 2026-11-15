(()=>{var io=Object.defineProperty;var Zt=(e,t)=>{for(var s in t)io(e,s,{get:t[s],enumerable:!0})};var Oa="judgment.api_base",Ba="http://127.0.0.1:9200",bt=class extends Error{constructor(t,s=0,a=null){super(t),this.name="ApiError",this.status=s,this.detail=a}};function Wn(e){return["localhost","127.0.0.1","::1","[::1]"].includes(e)}function es(e){let t=String(e??"").trim();if(!t||t==="/")return"";t=t.replace(/\/+$/,""),!/^https?:\/\//i.test(t)&&!t.startsWith("/")&&(t=`${Wn(t.split(":")[0])?"http":"https"}://${t}`);try{let s=new URL(t,window.location.href);return s.protocol!=="http:"&&s.protocol!=="https:"?"":`${s.origin}${s.pathname==="/"?"":s.pathname.replace(/\/+$/,"")}`}catch{return t}}function Fa(e){let t=es(e);if(!t)return!0;try{let s=new URL(t);return s.protocol==="http:"||s.protocol==="https:"}catch{return!1}}function Ha(){try{let e=new URLSearchParams(window.location.search);return e.has("api")?es(e.get("api")):null}catch{return null}}function za(){try{let e=window.localStorage.getItem(Oa);return e===null?null:es(e)}catch{return null}}function Ua(){let e=window.JUDGMENT_CONFIG&&window.JUDGMENT_CONFIG.apiBase;return es(e||"")}function ts(){let e=Ha();if(e!==null)return e;let t=za();if(t!==null)return t;let s=Ua();return s||(window.location.protocol==="file:"?Ba:"")}function oo(){if(Ha()!==null)return!0;let e=za();return e!==null?!!e:!!Ua()}function ss(){return Ha()!==null?"query":za()!==null?"storage":Ua()?"config":window.location.protocol==="file:"?"file-default":"same-origin"}function ea(){return oo()||window.location.protocol==="file:"||!window.JUDGMENT_CONFIG?!1:!Wn(window.location.hostname)}function Qa(e){let t=es(e);try{t?window.localStorage.setItem(Oa,t):window.localStorage.removeItem(Oa)}catch{}return t}function as(e=ts()){return e||"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"}function St(e,t=ts()){return t?`${t}${e.startsWith("/")?e:`/${e}`}`:e}function xt(e,t,{onError:s=null,onProgress:a=null}={}){let n=(Array.isArray(e)?e:[e]).map(c=>String(c||"").trim()).filter(Boolean);if(!n.length||typeof EventSource>"u")return()=>{};let i=new EventSource(St(`/api/events/stream?topic=${encodeURIComponent(n.join(","))}`)),o=0;i.onopen=()=>{o+=1};let l=c=>{let m={};try{m=JSON.parse(c.data||"{}")}catch{m={}}m.initial&&o<=1&&!m.snapshot||t?.(m.topic||n[0],m)},u=c=>{let m={};try{m=JSON.parse(c.data||"{}")}catch{m={}}a?.(m.topic||n[0],m)};return i.addEventListener("refresh",l),i.addEventListener("progress",u),i.onerror=()=>{s?.()},()=>{i.removeEventListener("refresh",l),i.removeEventListener("progress",u),i.close()}}function Ga(e){return`\u7121\u6CD5\u9023\u7DDA\u5230\u4F3A\u670D\u5668${e?`\uFF08${e}\uFF09`:""}\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u662F\u5426\u555F\u52D5\uFF0C\u6216\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u8A2D\u5B9A\u5F8C\u7AEF\u4F4D\u5740\u3002`}async function oe(e,t={}){let s=ts(),a=new AbortController,n=t.timeout===void 0?3e4:t.timeout,i=n>0?window.setTimeout(()=>a.abort(),n):null,o=Date.now(),l=performance.now(),u=t.requestId||Vn(),c={Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},"X-Judgment-Request-Id":u,"X-Judgment-Client-Started-At":String(o),...t.headers||{}},m;try{m=await fetch(St(e,s),{...t,headers:c,signal:a.signal})}catch(y){throw y.name==="AbortError"?new bt("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new bt(Ga(s),0,y)}finally{i&&window.clearTimeout(i)}let $=null;if((m.headers.get("content-type")||"").includes("application/json"))try{$=await m.json()}catch{$=null}else try{$=await m.text()}catch{$=null}let p=performance.now(),g=m.headers.get("X-Judgment-Request-Id")||u;if(t.trackClient!==!1&&g){let y=Math.round(performance.now()-l);window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{Kn({request_id:g,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:y,render_ms:Math.max(0,Math.round(performance.now()-p)),status:m.ok?"success":"failed"})})})}if(!m.ok){let y=$&&typeof $=="object"?$.detail||$.message:$,_=typeof y=="string"&&y?y:`\u4F3A\u670D\u5668\u56DE\u61C9 ${m.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new bt(_,m.status,y)}return $}function Vn(){try{if(window.crypto&&typeof window.crypto.randomUUID=="function")return window.crypto.randomUUID().replace(/-/g,"").slice(0,32)}catch{}return`req${Date.now().toString(36)}${Math.random().toString(36).slice(2,10)}`}function Kn(e){try{fetch(St("/api/performance/client",ts()),{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e),keepalive:!0}).catch(()=>{})}catch{}}async function Yn(e){let t=es(e);if(!Fa(t))throw new bt("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002");let s=performance.now(),a=new AbortController,n=window.setTimeout(()=>a.abort(),1e4);try{let i=await fetch(St("/api/health",t),{headers:{Accept:"application/json"},signal:a.signal});if(!i.ok)throw new bt(`API \u56DE\u61C9 ${i.status}\u3002`,i.status);let o=await i.json();return{base:t,version:o.version||"\u2014",duration_ms:Math.round(performance.now()-s)}}catch(i){throw i instanceof bt?i:i.name==="AbortError"?new bt("\u9023\u7DDA\u6E2C\u8A66\u903E\u6642\uFF0C\u8ACB\u78BA\u8A8D API \u4F4D\u5740\u8207\u7DB2\u8DEF\u3002",0,i):new bt(Ga(t),0,i)}finally{window.clearTimeout(n)}}var K={health(){return oe("/api/health")},status(){return oe("/api/status",{trackClient:!1})},ollamaHosts(){return oe("/api/ollama/hosts",{timeout:3e4,trackClient:!1})},addOllamaHost(e){return oe("/api/ollama/hosts",{method:"POST",body:JSON.stringify(e),timeout:3e4,trackClient:!1})},updateOllamaHost(e,t){return oe(`/api/ollama/hosts/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},deleteOllamaHost(e){return oe(`/api/ollama/hosts/${encodeURIComponent(e)}`,{method:"DELETE",timeout:3e4,trackClient:!1})},activateOllamaHost(e){return oe(`/api/ollama/hosts/${encodeURIComponent(e)}/activate`,{method:"POST",timeout:3e4,trackClient:!1})},deactivateOllamaHosts(){return oe("/api/ollama/hosts/deactivate",{method:"POST",timeout:3e4,trackClient:!1})},reorderOllamaHosts(e){return oe("/api/ollama/hosts/reorder",{method:"POST",body:JSON.stringify({host_ids:e}),timeout:3e4,trackClient:!1})},checkOllamaCapabilities(){return oe("/api/ollama/hosts/capabilities/test",{method:"POST",timeout:18e4,trackClient:!1})},selectOllamaModel(e,t){return oe(`/api/ollama/hosts/${encodeURIComponent(e)}/models/select`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},clearOllamaModel(e,t){return oe(`/api/ollama/hosts/${encodeURIComponent(e)}/models/clear`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},systemUsage(){return oe("/api/system-usage",{trackClient:!1})},indexVersions(){return oe("/api/index-versions",{trackClient:!1})},indexVersion(e){return oe(`/api/index-versions/${encodeURIComponent(e)}`,{trackClient:!1})},validateIndexVersion(e){return oe(`/api/index-versions/${encodeURIComponent(e)}/validate`,{method:"POST",trackClient:!1})},activateIndexVersion(e){return oe(`/api/index-versions/${encodeURIComponent(e)}/activate`,{method:"POST",trackClient:!1})},rollbackIndexVersion(){return oe("/api/index-versions/rollback",{method:"POST",trackClient:!1})},reconcileIndexAlias(e=!1){let t=new URLSearchParams({repair:e?"true":"false"});return oe(`/api/index-alias/reconcile?${t.toString()}`,{trackClient:!1})},catalog(){return oe("/api/catalog")},judgmentStats(){return oe("/api/judgment-stats")},query({database:e,filters:t,page:s=1,pageSize:a=25}){return oe("/api/query",{method:"POST",body:JSON.stringify({database:e,filters:t,page:s,page_size:a})})},dataSuggest({kind:e,query:t="",limit:s=12}){let a=new URLSearchParams({kind:e,query:t,limit:String(s)});return oe(`/api/data/suggest?${a.toString()}`,{timeout:45e3,trackClient:!1})},schemaSuggest({database:e,table:t,column:s,query:a,limit:n=1e3}){let i=new URLSearchParams({database:e,table:t,column:s,q:a||"",limit:String(n)});return oe(`/api/schema/suggest?${i.toString()}`,{timeout:3e4})},lawDetail(e,t="",s="",a=""){let n=new URLSearchParams({law_key:e});return t&&n.set("source_type",t),s&&n.set("version_id",String(s)),a&&n.set("article_no",String(a)),oe(`/api/law?${n.toString()}`,{timeout:45e3})},judgmentDetail(e,t=""){let s=new URLSearchParams({jid:e});return t&&s.set("source",t),oe(`/api/judgment?${s.toString()}`,{timeout:45e3})},testMode(){return oe("/api/test-mode",{trackClient:!1})},llmModels(){return oe("/api/llm/models",{timeout:6e4,trackClient:!1})},testLlmModels(){return oe("/api/llm/models/test",{method:"POST",timeout:12e4,trackClient:!1})},rerankStatus(){return oe("/api/rerank/status",{timeout:6e4,trackClient:!1})},testReranker(){return oe("/api/rerank/test",{method:"POST",timeout:12e4,trackClient:!1})},selectLlmModel(e,t=null){return oe("/api/llm/model",{method:"POST",body:JSON.stringify({model:e,host_id:t}),timeout:3e4,trackClient:!1})},setTestMode(e){return oe("/api/test-mode",{method:"POST",body:JSON.stringify({enabled:!!e}),trackClient:!1})},testRuns(e=20){let t=new URLSearchParams({limit:String(e)});return oe(`/api/test-runs?${t.toString()}`,{trackClient:!1})},testRunCurrent(){return oe("/api/test-runs/current",{trackClient:!1})},testRun(e){return oe(`/api/test-runs/${encodeURIComponent(e)}`,{trackClient:!1})},performanceOptions(){return oe("/api/performance/options",{trackClient:!1})},performance(e={},t=1,s=25){let a=new URLSearchParams;for(let[n,i]of Object.entries(e))i==null||i===""||a.set(n,String(i));return a.set("page",String(t)),a.set("page_size",String(s)),oe(`/api/performance?${a.toString()}`,{timeout:45e3,trackClient:!1})},quality(){return oe("/api/quality",{timeout:18e4,trackClient:!1})},processing(){return oe("/api/processing",{timeout:45e3,trackClient:!1})},processingActive(){return oe("/api/processing/active",{timeout:3e3,trackClient:!1})},judgmentDownloadStatus(){return oe("/api/judgment-download/status",{timeout:3e4,trackClient:!1})},versioningSummary(){return oe("/api/versioning/summary",{trackClient:!1})},updatesStatus(){return oe("/api/updates/status",{trackClient:!1})},checkCourts(){return oe("/api/courts/check",{timeout:6e4,trackClient:!1})},checkLawVersions(){return oe("/api/law-versions/check",{timeout:6e4,trackClient:!1})},checkUpdates(e=[]){let t=Array.isArray(e)&&e.length?{source_types:e}:{};return oe("/api/updates/check",{method:"POST",body:JSON.stringify(t),timeout:12e4,trackClient:!1})},versioningSnapshots(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.limit&&t.set("limit",String(e.limit)),oe(`/api/versioning/judgments/snapshots?${t.toString()}`,{trackClient:!1})},versioningChanges(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit)),oe(`/api/versioning/judgments/changes?${t.toString()}`,{trackClient:!1})},versioningJudgment(e){return oe(`/api/versioning/judgments/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVersion(e){return oe(`/api/versioning/judgments/versions/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVector(e,t){return oe(`/api/versioning/judgments/${encodeURIComponent(e)}/vectors/${encodeURIComponent(t)}`,{trackClient:!1})},versioningAudit(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit||500)),oe(`/api/versioning/audit?${t.toString()}`,{trackClient:!1})},questionBankStats(){return oe("/api/question-bank/stats",{trackClient:!1})},questionBankItems(e={},t=50,s=0){let a=new URLSearchParams;for(let[n,i]of Object.entries(e))if(!(i==null||i==="")){if(Array.isArray(i)){for(let o of i)o==null||o===""||a.append(n,String(o));continue}a.set(n,String(i))}return a.set("limit",String(t)),a.set("offset",String(s)),oe(`/api/question-bank/items?${a.toString()}`,{timeout:45e3,trackClient:!1})},questionBankTags(e="",t=12){let s=new URLSearchParams({query:e,limit:String(t)});return oe(`/api/question-bank/tags?${s.toString()}`,{timeout:45e3,trackClient:!1})},questionBankItem(e){return oe(`/api/question-bank/items/${encodeURIComponent(e)}`,{timeout:45e3,trackClient:!1})},createQuestionBankItem(e){return oe("/api/question-bank/items",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},createQuestionBankItemWithAI(e){return oe("/api/question-bank/ai-items",{method:"POST",body:JSON.stringify(e),timeout:42e4,trackClient:!1})},updateQuestionBankItem(e,t){return oe(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteQuestionBankItem(e){return oe(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},restoreQuestionBankItem(e){return oe(`/api/question-bank/items/${encodeURIComponent(e)}/restore`,{method:"POST",timeout:45e3,trackClient:!1})},submitQuestionBankItemForReview(e){return oe(`/api/question-bank/items/${encodeURIComponent(e)}/submit`,{method:"POST",timeout:45e3,trackClient:!1})},reviewQuestionBankItem(e,t){return oe(`/api/question-bank/items/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},importQuestionBank(e){return oe("/api/question-bank/import",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},exportQuestionBank({status:e="accepted"}={}){let t=new URLSearchParams({status:e});return oe(`/api/question-bank/export?${t.toString()}`,{timeout:45e3,trackClient:!1})},revalidateQuestionBank(){return oe("/api/question-bank/revalidate",{method:"POST",body:JSON.stringify({}),timeout:12e4,trackClient:!1})},benchmarkReadyQuestions(e=200){return oe(`/api/question-bank/benchmark-ready?limit=${e}`,{timeout:45e3,trackClient:!1})},benchmarkSuites(){return oe("/api/benchmark/suites",{timeout:45e3,trackClient:!1})},benchmarkSuiteLatestAnswers(e){return oe(`/api/benchmark/suites/${encodeURIComponent(e)}/latest-answers`,{timeout:45e3,trackClient:!1})},removeBenchmarkSuiteItem(e,t){return oe(`/api/benchmark/suites/${encodeURIComponent(e)}/items/${encodeURIComponent(t)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},createBenchmarkSuite(e){return oe("/api/benchmark/suites",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},updateBenchmarkSuite(e,t){return oe(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteBenchmarkSuite(e){return oe(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},benchmarkRuns(e=20){return oe(`/api/benchmark/runs?limit=${e}`,{timeout:45e3,trackClient:!1})},startBenchmarkRun(e){return oe("/api/benchmark/runs",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},benchmarkRun(e,t=!0){return oe(`/api/benchmark/runs/${encodeURIComponent(e)}?include_cases=${t}`,{timeout:45e3,trackClient:!1})},stopBenchmarkRun(e){return oe(`/api/benchmark/runs/${encodeURIComponent(e)}/stop`,{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},reviewBenchmarkResult(e,t){return oe(`/api/benchmark/results/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},benchmarkModels(){return oe("/api/benchmark/models",{timeout:45e3,trackClient:!1})},benchmarkFingerprintHistory(e,t=50){return oe(`/api/benchmark/fingerprints/${encodeURIComponent(e)}?limit=${t}`,{timeout:45e3,trackClient:!1})},processingPlan(){return oe("/api/processing/plan",{timeout:45e3,trackClient:!1})},startProcessingWorkflow(e){return oe(`/api/processing/workflows/${encodeURIComponent(e)}/run`,{method:"POST",body:JSON.stringify({})})},startProcessingUpdate(e=!1){return oe("/api/processing/update",{method:"POST",body:JSON.stringify({index:!!e}),timeout:45e3,trackClient:!1})},stopProcessingUpdate(){return oe("/api/processing/stop",{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},rag(e,t={}){return oe("/api/rag/query",{method:"POST",body:JSON.stringify({question:e}),timeout:t.testMode?0:3e5})},async ragStream(e,{testMode:t=!1,onStep:s=null,onPartial:a=null,onToken:n=null,onTokenReset:i=null}={}){let o=ts(),l=new AbortController,u=t?0:3e5,c=u>0?window.setTimeout(()=>l.abort(),u):null,m=Date.now(),$=performance.now(),b=Vn(),p={Accept:"text/event-stream","Content-Type":"application/json","X-Judgment-Request-Id":b,"X-Judgment-Client-Started-At":String(m)},g;try{g=await fetch(St("/api/rag/query/stream",o),{method:"POST",headers:p,body:JSON.stringify({question:e}),signal:l.signal})}catch(V){throw V.name==="AbortError"?new bt("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new bt(Ga(o),0,V)}finally{c&&window.clearTimeout(c)}if(!g.ok){let V=null;try{V=await g.json()}catch{V=null}let J=V&&typeof V=="object"&&V.detail?String(V.detail):`\u4F3A\u670D\u5668\u56DE\u61C9 ${g.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new bt(J,g.status,V)}if(!g.body)throw new bt("\u4F3A\u670D\u5668\u6C92\u6709\u56DE\u50B3\u53EF\u8B80\u53D6\u7684\u6D41\u7A0B\u4E32\u6D41\u3002",0,null);let y=g.body.getReader(),_=new TextDecoder,q="",M=null,A=null;try{for(;;){let{value:V,done:J}=await y.read();if(J)break;q+=_.decode(V,{stream:!0});let ke=q.indexOf(`

`);for(;ke>=0;){let Se=q.slice(0,ke).replace(/\r/g,"");q=q.slice(ke+2);let F="message",T=[];for(let S of Se.split(`
`))S.startsWith("event:")?F=S.slice(6).trim():S.startsWith("data:")&&T.push(S.slice(5).trimStart());if(T.length){let S=null;try{S=JSON.parse(T.join(`
`))}catch{S=null}if(S)if(F==="step"&&typeof s=="function")try{s(S)}catch{}else if(F==="partial"){if(typeof a=="function")try{a(S)}catch{}}else if(F==="token"){if(typeof n=="function")try{n(String(S.text||""))}catch{}}else if(F==="token_reset"){if(typeof i=="function")try{i()}catch{}}else F==="result"?M=S:F==="error"&&(A=new bt(S.message||S.detail||"RAG \u6D41\u7A0B\u5931\u6557\u3002",0,S))}ke=q.indexOf(`

`)}}}finally{try{await y.cancel()}catch{}c&&window.clearTimeout(c)}if(A)throw A;if(!M)throw new bt("\u6D41\u7A0B\u4E32\u6D41\u7D50\u675F\uFF0C\u4F46\u6C92\u6709\u6536\u5230\u6700\u7D42\u56DE\u7B54\u3002",0,null);let U=Math.round(performance.now()-$);return Kn({request_id:b,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:U,render_ms:0,status:"success"}),M&&typeof M=="object"&&(M._client_request_id=b),M}};var Xn="judgment.theme",Ja="nvidia",ta=[{id:"vercel",name:"Vercel",description:"\u9ED1\u767D\u7CBE\u6E96 \xB7 Geist \xB7 \u5E7E\u4F55\u7559\u767D",swatches:["#0070f3","#171717","#fafafa"],metaColor:"#ffffff"},{id:"apple",name:"Apple",description:"SF Pro \xB7 \u5927\u5713\u89D2 \xB7 \u6C89\u6D78\u7559\u767D",swatches:["#0066cc","#1d1d1f","#f5f5f7"],metaColor:"#fbfbfd"},{id:"meta",name:"Meta",description:"Optimistic \xB7 \u660E\u4EAE\u85CD \xB7 \u81A0\u56CA\u5143\u4EF6",swatches:["#0064e0","#0091ff","#f1f4f7"],metaColor:"#ffffff"},{id:"nvidia",name:"NVIDIA",description:"GPU \u7DA0 \xB7 \u9ED1\u5E95 \xB7 \u92B3\u5229\u76F4\u89D2",swatches:["#76b900","#000000","#f7f7f7"],metaColor:"#000000"},{id:"ibm",name:"IBM",description:"Carbon \xB7 Plex Sans \xB7 \u4F01\u696D\u85CD",swatches:["#0f62fe","#161616","#f4f4f4"],metaColor:"#161616"},{id:"stripe",name:"Stripe",description:"\u7D2B\u975B\u6F38\u5C64 \xB7 \u7CBE\u5BC6\u91D1\u878D\u611F",swatches:["#635bff","#ea2261","#f6f9fc"],metaColor:"#ffffff"},{id:"linear",name:"Linear",description:"\u6DF1\u7A7A\u9ED1 \xB7 \u975B\u7D2B \xB7 \u6975\u7C21\u7DDA\u689D",swatches:["#17171d","#5e6ad2","#e8e8ec"],metaColor:"#010102"},{id:"figma",name:"Figma",description:"\u591A\u5F69\u8272\u584A \xB7 \u5354\u4F5C\u611F \xB7 \u85CD\u8272\u7126\u9EDE",swatches:["#0d99ff","#a259ff","#0acf83"],metaColor:"#ffffff"},{id:"notion",name:"Notion",description:"\u6696\u767D\u7D19\u5F35 \xB7 \u896F\u7DDA\u6A19\u984C \xB7 \u77E5\u8B58\u5EAB",swatches:["#0075de","#191918","#f7f6f3"],metaColor:"#ffffff"},{id:"openai",name:"OpenAI",description:"\u6696\u7070\u756B\u5E03 \xB7 \u9ED1\u8272\u884C\u52D5 \xB7 \u7DA0\u8272\u8A0A\u865F",swatches:["#10a37f","#0d0d0d","#f9f9f7"],metaColor:"#f9f9f7"}],Wa=new Map(ta.map(e=>[e.id,e]));function lo(e){return Wa.has(e)}function co(e){return Wa.get(e)||Wa.get(Ja)}function Va(){try{let e=window.localStorage.getItem(Xn);return lo(e)?e:Ja}catch{return Ja}}function Ka(e,{persist:t=!0}={}){let s=co(e);document.documentElement.dataset.theme=s.id;let a=document.getElementById("theme-color-meta");if(a&&a.setAttribute("content",s.metaColor),document.querySelectorAll(".theme-option").forEach(n=>{let i=n.dataset.themeId===s.id;n.classList.toggle("is-active",i),n.setAttribute("aria-checked",i?"true":"false")}),t)try{window.localStorage.setItem(Xn,s.id)}catch{}return window.dispatchEvent(new CustomEvent("judgment:theme",{detail:{theme:s.id}})),s}var uo={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},po={operational:{label:"\u6B63\u5E38",tone:"ok"},success:{label:"\u6210\u529F",tone:"ok"},ok:{label:"\u6B63\u5E38",tone:"ok"},healthy:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},warning:{label:"\u6CE8\u610F",tone:"warn"},empty:{label:"\u7121\u8CC7\u6599",tone:"warn"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},running:{label:"\u57F7\u884C\u4E2D",tone:"info"},pending:{label:"\u7B49\u5F85",tone:"idle"},skipped:{label:"\u7565\u904E",tone:"idle"},partial:{label:"\u90E8\u5206\u6210\u529F",tone:"warn"},preview:{label:"\u9810\u89BD\u6A21\u5F0F",tone:"info"},retrieval_only:{label:"\u50C5\u6AA2\u7D22\u7D50\u679C",tone:"warn"},not_indexed:{label:"\u5C1A\u672A\u7D22\u5F15",tone:"warn"},missing_query:{label:"\u7B49\u5F85\u67E5\u8A62",tone:"idle"},client_side:{label:"\u700F\u89BD\u5668\u7AEF",tone:"info"},not_configured:{label:"\u672A\u8A2D\u5B9A",tone:"idle"},unavailable:{label:"\u96E2\u7DDA",tone:"danger"},failed:{label:"\u5931\u6557",tone:"danger"},error:{label:"\u932F\u8AA4",tone:"danger"}},mo={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},go={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},Zn={search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',send:'<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',refresh:'<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 4v5.5H15"/>',copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',check:'<path d="m5 12 4.2 4.2L19 6.5"/>',plus:'<path d="M12 5v14M5 12h14"/>',edit:'<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m13.5 7.5 3 3"/>',trash:'<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v5M14 11v5"/>',upload:'<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>',x:'<path d="m6 6 12 12M18 6 6 18"/>',external:'<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/>',message:'<path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H6l-3 2 1.3-4.2A8.5 8.5 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',history:'<path d="M3.2 12a8.8 8.8 0 1 0 2.8-6.3L3.2 8.5"/><path d="M3 3.5v5h5"/><path d="M12 7.5V12l3 1.8"/>',database:'<ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/><path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/>',layers:'<path d="m12 3 9 4.8-9 4.8-9-4.8L12 3Z"/><path d="m3 12.2 9 4.8 9-4.8"/><path d="m3 16.7 9 4.8 9-4.8"/>',cube:'<path d="m12 2.8 8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4L12 2.8Z"/><path d="m3.8 7.4 8.2 4.6 8.2-4.6"/><path d="M12 12v9.2"/>',browser:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6.5 6.5h.01"/>',download:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',chevronLeft:'<path d="m14.5 5-7 7 7 7"/>',chevronRight:'<path d="m9.5 5 7 7-7 7"/>',chevronDown:'<path d="m5 9 7 7 7-7"/>',arrowRight:'<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',alert:'<path d="M12 3 2.5 20.5h19L12 3Z"/><path d="M12 9v4.5"/><path d="M12 17.5h.01"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',sparkles:'<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"/>',table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M9 9.5V20M15 9.5V20"/>',sliders:'<path d="M4 7h8M16 7h4M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',palette:'<path d="M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h4a5 5 0 0 0 0-10h-4Z"/><circle cx="7.5" cy="10.5" r=".8" fill="currentColor" stroke="none"/><circle cx="10" cy="6.8" r=".8" fill="currentColor" stroke="none"/><circle cx="14.5" cy="6.8" r=".8" fill="currentColor" stroke="none"/>',server:'<rect x="3" y="4" width="18" height="6" rx="1.6"/><rect x="3" y="14" width="18" height="6" rx="1.6"/><path d="M7 7h.01M7 17h.01"/>',brain:'<path d="M9.7 4.2a2.8 2.8 0 0 0-3 2.8 2.8 2.8 0 0 0-1.1 5.2A2.9 2.9 0 0 0 7.8 18a2.9 2.9 0 0 0 3.9 2V4.2a2.8 2.8 0 0 0-2 0Z"/><path d="M14.3 4.2a2.8 2.8 0 0 1 3 2.8 2.8 2.8 0 0 1 1.1 5.2A2.9 2.9 0 0 1 16.2 18a2.9 2.9 0 0 1-3.9 2"/>',cloud:'<path d="M7 18.5h10.5a3.5 3.5 0 0 0 .4-7 5.5 5.5 0 0 0-10.6-1.3A4.2 4.2 0 0 0 7 18.5Z"/>',code:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',play:'<path d="M7 4.5v15l13-7.5-13-7.5Z"/>',file:'<path d="M6 2.8h8l4.5 4.5v13.9H6V2.8Z"/><path d="M14 2.8V7.5h5"/>',activity:'<path d="M3 12h4l2.2-5 4.1 10 2.2-5H21"/>',shield:'<path d="M12 2.8 20 6v6c0 4.7-3.2 8-8 9.2C7.2 20 4 16.7 4 12V6l8-3.2Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',terminal:'<path d="m5 7 5 5-5 5"/><path d="M12 17h7"/>',filter:'<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',link:'<path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10.2 5.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-1.4 1.4a5 5 0 0 0 7.1 7.1l1.2-1.2"/>',grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',pin:'<path d="M9 3.5h6l-1.1 5 2.6 2.6v2.4H7.5v-2.4L10.1 8.5 9 3.5Z"/><path d="M12 13.5v7"/>',more:'<circle cx="4.2" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="19.8" cy="12" r="2.6" fill="currentColor" stroke="none"/>',folder:'<path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h3.7l2 2H18a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5v-9Z"/>',cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9.5 9.5h5v5h-5z"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>'};function r(e){return String(e??"").replace(/[&<>"']/g,t=>uo[t])}function f(e,t=16,s=""){let a=Zn[e]||Zn.info;return`<svg${s?` class="${r(s)}"`:""} width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a}</svg>`}function d(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?new Intl.NumberFormat("zh-TW").format(s):t}function Ie(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=["B","KB","MB","GB","TB"],a=0;for(;t>=1024&&a<s.length-1;)t/=1024,a+=1;return a===0?`${t.toFixed(0)} B`:`${t.toFixed(1)} ${s[a]}`}function Ya(e){if(e instanceof Date)return e;if(typeof e=="number"){let n=new Date(e);return Number.isNaN(n.getTime())?null:n}let t=String(e??"").trim();if(!t)return null;if(/^\d{8}$/.test(t))return new Date(Number(t.slice(0,4)),Number(t.slice(4,6))-1,Number(t.slice(6,8)));let s=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(t),a=new Date(s?`${t}Z`:t);return Number.isNaN(a.getTime())?null:a}function zt(e){let t=Ya(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit"}).format(t):e?r(e):"\u2014"}function $e(e){let t=Ya(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1}).format(t):e?r(e):"\u2014"}function Es(e){let t=Ya(e);if(!t)return"";let s=Date.now()-t.getTime();return s<45e3?"\u525B\u525B":s<36e5?`${Math.max(1,Math.round(s/6e4))} \u5206\u9418\u524D`:s<864e5?`${Math.round(s/36e5)} \u5C0F\u6642\u524D`:s<6048e5?`${Math.round(s/864e5)} \u5929\u524D`:zt(t)}function fe(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;if(t<6e4)return`${(t/1e3).toFixed(1)} s`;let s=Math.floor(t/6e4),a=Math.round(t%6e4/1e3);return`${s}m ${a}s`}function Et(e){return po[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function Ye(e,t){let s=Et(e);return`<span class="badge ${mo[s.tone]}"><span class="status-dot ${go[s.tone]}"></span>${r(t||s.label)}</span>`}function fo(e){return e==="law"?'<span class="badge badge-info">\u6CD5\u898F</span>':e==="order"?'<span class="badge badge-neutral">\u547D\u4EE4</span>':e?`<span class="badge badge-neutral">${r(e)}</span>`:'<span class="cell-empty">\u2014</span>'}function sa(e,t){let s=String(e??"");return s.length>t?`${s.slice(0,t)}\u2026`:s}function aa(e,t="text"){if(e==null||e==="")return'<span class="cell-empty">\u2014</span>';switch(t){case"boolean":return e?'<span class="badge badge-ok">\u662F</span>':'<span class="badge badge-neutral">\u5426</span>';case"status":return Ye(String(e));case"source":return fo(String(e));case"number":return`<span class="mono">${d(e)}</span>`;case"duration":return`<span class="mono">${fe(e)}</span>`;case"datetime":return`<span class="mono">${$e(e)}</span>`;case"date":return`<span class="mono">${zt(e)}</span>`;case"url":{let s=String(e),a=sa(s.replace(/^https?:\/\//,""),46);return`<span class="cell-url"><a href="${r(s)}" target="_blank" rel="noopener noreferrer" title="${r(s)}">${f("external",10)}${r(a)}</a></span>`}case"mono":{let s=String(e);return`<span class="cell-mono cell-truncate" title="${r(s)}">${r(sa(s,54))}</span>`}case"longtext":{let s=String(e);return`<span class="cell-truncate" title="${r(s)}">${r(sa(s,100))}</span>`}default:{let s=String(e);return`<span class="cell-truncate" title="${r(s)}">${r(sa(s,90))}</span>`}}}function He({tone:e="info",title:t,text:s,iconName:a="info"}){let n=e==="ok"?"check":e==="danger"||e==="warn"?"alert":"i";return`<div class="notice notice-${e}" role="status">
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
  </div>`}function Ne(e,t,s="\u8655\u7406\u4E2D\u2026"){e&&(t?(e.dataset.idleHtml||(e.dataset.idleHtml=e.innerHTML),e.disabled=!0,e.classList.add("is-loading"),e.innerHTML=`<span class="spinner" aria-hidden="true"></span><span>${r(s)}</span>`):(e.disabled=!1,e.classList.remove("is-loading"),e.dataset.idleHtml&&(e.innerHTML=e.dataset.idleHtml,delete e.dataset.idleHtml)))}function C(e,t="info",s=4200){let a=document.getElementById("toast-region");if(!a)return null;let n={info:"i",ok:"\u2713",warn:"!",danger:"\xD7"},i=document.createElement("div");i.className=`toast toast-${t}`,i.setAttribute("role",t==="danger"?"alert":"status"),i.innerHTML=`<span class="toast-mark" aria-hidden="true">${n[t]||"i"}</span>
    <div class="toast-body">${r(e)}</div>
    <button class="toast-close" type="button" aria-label="\u95DC\u9589\u901A\u77E5">\xD7</button>`;let o=()=>{i.isConnected&&(i.classList.add("is-leaving"),window.setTimeout(()=>i.remove(),190))};return i.querySelector(".toast-close").addEventListener("click",o),a.appendChild(i),s>0&&window.setTimeout(o,s),i}async function hs(e){try{return await navigator.clipboard.writeText(e),!0}catch{let s=document.createElement("textarea");s.value=e,s.setAttribute("readonly",""),s.style.position="fixed",s.style.opacity="0",document.body.appendChild(s),s.select();let a=!1;try{a=document.execCommand("copy")}catch{a=!1}return s.remove(),a}}function Ut(e,t,s="text/plain;charset=utf-8"){let a=new Blob([t],{type:s}),n=URL.createObjectURL(a),i=document.createElement("a");i.href=n,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(n),1e3)}var na="judgment.fontSizes.v1",sn="judgment.appearance",rr=new Set(["light","dark","system"]),er="light",Rs=window.matchMedia("(prefers-color-scheme: dark)"),bo="font-size",Ps=[{id:"page-title",label:"\u9801\u9762\u6A19\u984C",hint:"\u5404\u9801\u6700\u4E0A\u65B9\u7684 h1 \u6A19\u984C",selectors:[".page-title"],defaultPx:40,min:20,max:72},{id:"home-title",label:"\u9996\u9801\u4E3B\u8996\u89BA\u6A19\u984C",hint:"\u9996\u9801\u6700\u5927\u7684\u4E3B\u6A19\u984C",selectors:[".home-title"],defaultPx:88,min:40,max:140},{id:"section-title",label:"\u5340\u584A\u6A19\u984C",hint:"\u5831\u8868\u3001\u5361\u7247\u8207\u5340\u584A\u6A19\u984C",selectors:[".section-title",".report-title",".side-card-title",".filter-title",".tests-card-title",".status-sidebar-title",".judgment-dialog-head h2"],defaultPx:16,min:10,max:36},{id:"body",label:"\u5167\u6587\u8207\u8AAA\u660E",hint:"\u6BB5\u843D\u3001\u56DE\u7B54\u3001\u8AAA\u660E\u8207\u6458\u8981\u6587\u5B57",selectors:[".answer-text",".page-subtitle",".report-sub",".home-lead",".empty-text",".notice-body p",".citation-snippet",".side-card-body",".detail-list",".field-help",".report-empty-inline",".processing-section-sub",".summary-value-text",".status-summary",".warnings",".law-dialog-warning"],defaultPx:14,min:8,max:28},{id:"table",label:"\u8868\u683C\u5167\u5BB9",hint:"\u8CC7\u6599\u8868\u683C\u7684\u8868\u982D\u8207\u5132\u5B58\u683C",selectors:[".data-table th",".data-table td"],defaultPx:12,min:8,max:24},{id:"meta",label:"\u6A19\u7C64\u8207\u8F14\u52A9\u6587\u5B57",hint:"badge\u3001chip\u3001\u6B04\u4F4D\u6A19\u7C64\u8207 metadata",selectors:[".badge",".chip",".citation-meta",".citation-index",".answer-section-label",".report-kicker",".report-section-title",".eyebrow",".field-label",".summary-label",".metric-label",".footer-bottom",".nav-update-badge"],defaultPx:10,min:7,max:20},{id:"button",label:"\u6309\u9215\u8207\u5C0E\u89BD",hint:"\u64CD\u4F5C\u6309\u9215\u3001\u9801\u9996\u5C0E\u89BD\u8207\u9023\u7D50",selectors:[".btn",".nav-link",".page-btn",".law-link",".judgment-link",".theme-option-name",".theme-option-desc"],defaultPx:13,min:9,max:24},{id:"form",label:"\u8868\u55AE\u8207\u8F38\u5165",hint:"\u8F38\u5165\u6846\u3001\u4E0B\u62C9\u9078\u55AE\u8207 textarea",selectors:["input","textarea","select",".input",".field-input"],defaultPx:14,min:9,max:28},{id:"mono",label:"\u7A0B\u5F0F\u78BC\u8207\u6578\u503C",hint:"\u7B49\u5BEC\u6587\u5B57\u3001\u67E5\u8A62\u8A9E\u53E5\u8207\u7D71\u8A08\u6578\u503C",selectors:[".mono",".cell-mono",".cell-number",".query-code","code",".metric-value",".summary-value",".perf-stat-value",".mini-stat-value"],defaultPx:13,min:8,max:30},{id:"law-page",label:"\u6CD5\u898F\u689D\u6587\uFF08\u9801\u9762\uFF09",hint:"\u6CD5\u898F\u6AA2\u7D22\u7D50\u679C\u8207\u6CD5\u898F\u4F86\u6E90\u5361\u689D\u6587",selectors:[".law-answer-article-text",".law-answer-article-no",".law-source-article-text",".law-source-article-no",".law-article-text",".law-article-no"],excludeAncestors:[".law-dialog"],defaultPx:12,min:9,max:28},{id:"law-dialog",label:"\u6CD5\u898F\u689D\u6587\uFF08\u5F48\u51FA\u8996\u7A97\uFF09",hint:"\u6309\u4E0B\u689D\u6587\u5F8C\u958B\u555F\u7684\u6CD5\u898F dialog",selectors:[".law-dialog .law-article-text",".law-dialog .law-article-no",".law-dialog .law-chapter"],defaultPx:16,min:10,max:32},{id:"judgment-dialog",label:"\u5224\u6C7A\u5168\u6587\uFF08\u5F48\u51FA\u8996\u7A97\uFF09",hint:"\u5224\u6C7A\u539F\u6587 dialog \u7684\u5168\u6587\u5340\u584A",selectors:[".judgment-dialog-text"],defaultPx:23,min:12,max:48}],ws=new Map(Ps.map(e=>[e.id,e])),Cs=new WeakMap,Jt=cr(),yt={...Jt},Wt=or(),Xa=new Set,ys=null,$s=null,vt=null,us=null,tr=null,ns=bo,rs=!1,Za=null,en=!1,ra="";function ir(e,t,s){return Math.min(s,Math.max(t,e))}function an(e){return Math.round(e*10)/10}function oa(e){return Number.isInteger(e)?String(e):e.toFixed(1)}function or(){try{let e=window.localStorage.getItem(sn);return rr.has(e)?e:er}catch{return er}}function vo(){return Wt==="system"?Rs.matches?"dark":"light":Wt}function lr(){document.querySelectorAll("[data-appearance-option]").forEach(e=>{let t=e.dataset.appearanceOption===Wt;e.classList.toggle("is-active",t),e.setAttribute("aria-pressed",t?"true":"false")})}function ia({persist:e=!1}={}){if(document.documentElement.dataset.appearance=vo(),document.documentElement.dataset.appearanceMode=Wt,lr(),e)try{window.localStorage.setItem(sn,Wt)}catch{}}function ho(e){rr.has(e)&&(Wt=e,ia({persist:!0}))}function sr(){Wt==="system"&&ia()}typeof Rs.addEventListener=="function"?Rs.addEventListener("change",sr):typeof Rs.addListener=="function"&&Rs.addListener(sr);function cr(){let e=null;try{e=JSON.parse(window.localStorage.getItem(na)||"null")}catch{e=null}if(!e||typeof e!="object"||Array.isArray(e))return{};let t={};for(let s of Ps){let a=Number(e[s.id]);Number.isFinite(a)&&(t[s.id]=an(ir(a,s.min,s.max)))}return t}function $o(){try{return Object.keys(Jt).length?window.localStorage.setItem(na,JSON.stringify(Jt)):window.localStorage.removeItem(na),!0}catch{return!1}}function Ds(e){let t=new Set;for(let s of e.selectors)document.querySelectorAll(s).forEach(a=>{a.closest(".settings-sidebar")||Array.isArray(e.excludeAncestors)&&e.excludeAncestors.some(n=>a.closest(n))||t.add(a)});return Array.from(t)}function dr(){if(!ra)return;let e=ws.get(ra);if(e)for(let t of Ds(e))t.classList.add("font-size-highlight")}function ur(e){if(_s(),!ws.get(e))return;ra=e;let s=vt.querySelector(`.font-size-row[data-font-group="${e}"]`);s&&s.classList.add("is-previewing"),dr()}function _s(){ra="",vt.querySelectorAll(".font-size-row.is-previewing").forEach(e=>e.classList.remove("is-previewing")),document.querySelectorAll(".font-size-highlight").forEach(e=>e.classList.remove("font-size-highlight"))}function yo(e){if(Cs.has(e))return Cs.get(e);let t={inline:e.style.fontSize||"",computed:parseFloat(window.getComputedStyle(e).fontSize)||0};return Cs.set(e,t),t}function wo(e){let t=Cs.get(e);t&&(t.inline?e.style.fontSize=t.inline:e.style.removeProperty("font-size"))}function _o(e){let t=yt[e.id];if(Number.isFinite(t))for(let s of Ds(e))yo(s),s.style.fontSize=`${t}px`}function ko(e){for(let t of Ds(e))wo(t)}function is(){for(let e of Xa){let t=ws.get(e);t&&ko(t)}Xa=new Set;for(let e of Ps)Number.isFinite(yt[e.id])&&(_o(e),Xa.add(e.id));dr()}function pr(){is(),rs&&ns==="font-size"&&Is()}function mr(){en||(en=!0,window.requestAnimationFrame(()=>{en=!1,is()}))}function So(){Za||!document.body||(Za=new MutationObserver(e=>{if(Object.keys(yt).length){for(let t of e)if(t.type==="childList"&&(t.addedNodes.length||t.removedNodes.length)){mr();return}}}),Za.observe(document.body,{childList:!0,subtree:!0}))}function xo(e){let t=e.filter(s=>typeof s.getClientRects=="function"&&s.getClientRects().length);return t.length?t:e}function Ao(){let e=Ps.filter(t=>Ds(t).length>0||Number.isFinite(yt[t.id]));return e.length?e:Ps}function la(e){let t=yt[e.id];if(Number.isFinite(t))return t;let a=xo(Ds(e)).map(o=>{let l=Cs.get(o);return l&&l.computed?l.computed:parseFloat(window.getComputedStyle(o).fontSize)||0}).filter(o=>o>0).sort((o,l)=>o-l);if(!a.length)return e.defaultPx;let n=Math.floor(a.length/2),i=a.length%2?a[n]:(a[n-1]+a[n])/2;return an(i)}function qo(){let e=[{id:"font-size",label:"\u5B57\u578B\u5927\u5C0F",hint:"\u8ABF\u6574\u5404\u6587\u5B57\u5340\u584A",glyph:'<span class="settings-option-aa" aria-hidden="true">Aa</span>'},{id:"theme",label:"\u4ECB\u9762\u98A8\u683C",hint:"\u5207\u63DB\u54C1\u724C\u8996\u89BA\u8A9E\u8A00",glyph:f("palette",15)}];us.innerHTML=e.map(t=>`<button class="settings-option${ns===t.id?" is-active":""}" type="button" role="tab"
        data-settings-panel="${t.id}"
        aria-selected="${ns===t.id?"true":"false"}">
        <span class="settings-option-icon">${t.glyph}</span>
        <span class="settings-option-copy">
          <strong>${r(t.label)}</strong>
          <small>${r(t.hint)}</small>
        </span>
        ${f("chevronRight",12,"settings-option-chevron")}
      </button>`).join("")}function Is(){_s();let e=Ao(),t=e.map(s=>{let a=oa(la(s));return`<section class="font-size-row" data-font-group="${s.id}">
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
    </div>`}function Mo(){_s();let e=Va(),t=ta.map((n,i)=>{let o=n.swatches.map(l=>`<i style="--swatch:${r(l)}"></i>`).join("");return`<button class="theme-option${n.id===e?" is-active":""}" type="button" role="menuitemradio"
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
          aria-pressed="${Wt===n.id?"true":"false"}"
          title="${n.id==="system"?"\u8DDF\u96A8\u7CFB\u7D71\u660E\u6697":`${n.label}\u8272\u6A21\u5F0F`}">${n.label}</button>`).join("")}
  </div>`;vt.innerHTML=`<div class="settings-panel-head">
      <div>
        <h3>\u4ECB\u9762\u98A8\u683C</h3>
        <p>\u9078\u64C7\u4E3B\u63A7\u53F0\u7684\u54C1\u724C\u8996\u89BA\u8A9E\u8A00\uFF1B\u4E3B\u984C\u6703\u7ACB\u5373\u5957\u7528\u4E26\u4FDD\u7559\u3002</p>
      </div>
      <div class="settings-panel-head-actions">
        <span class="badge badge-info">${ta.length} \u7A2E</span>
        ${a}
      </div>
    </div>
    <div class="settings-theme-list" role="menu" aria-label="\u4ECB\u9762\u98A8\u683C">${t}</div>`,lr()}function Lo(){us.querySelectorAll("[data-settings-panel]").forEach(e=>{let t=e.dataset.settingsPanel===ns;e.classList.toggle("is-active",t),e.setAttribute("aria-selected",t?"true":"false")})}function nn(e=ns){ns=e==="theme"?"theme":"font-size",Lo(),ns==="theme"?Mo():Is()}function ar(e,t,s){let a=Number(t);if(!Number.isFinite(a))return;let n=an(ir(a,e.min,e.max));yt[e.id]=n;let i=s?.querySelector(".font-size-slider");i&&(i.value=String(n));let o=s?.querySelector(".font-size-preview");o&&(o.style.fontSize=`${n}px`),mr()}function jo(){vt.querySelectorAll(".font-size-row").forEach(e=>{let t=ws.get(e.dataset.fontGroup);if(!t)return;let s=yt[t.id]??la(t),a=e.querySelector(".font-size-number-input");a&&(a.value=oa(s));let n=e.querySelector(".font-size-slider");n&&(n.value=String(s));let i=e.querySelector(".font-size-preview");i&&(i.style.fontSize=`${s}px`)})}function nr(e){let t=e.target.closest(".font-size-row");if(!t)return;let s=ws.get(t.dataset.fontGroup);if(!s)return;let a=e.target.classList.contains("font-size-number-input");if(!(a&&e.target.value==="")){if(e.type==="input"&&a){let n=Number(e.target.value);if(!Number.isFinite(n))return;ar(s,n,t);return}if(ar(s,e.target.value,t),e.type==="input"){let n=t.querySelector(".font-size-number-input");n&&document.activeElement!==n&&(n.value=oa(yt[s.id]??la(s)))}}}function To(e){if(!e.target.classList.contains("font-size-number-input"))return;let t=e.target.closest(".font-size-row"),s=t?ws.get(t.dataset.fontGroup):null;if(!s)return;let a=yt[s.id]??la(s);e.target.value=oa(a)}function No(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||ur(t.dataset.fontGroup)}function Eo(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||_s()}function Ro(e){let t=e.target.closest(".font-size-row");t&&ur(t.dataset.fontGroup)}function Co(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||_s()}function Po(e){let t=e.target.closest("[data-settings-panel]");if(t){nn(t.dataset.settingsPanel);return}let s=e.target.closest("[data-settings-action]");if(s){let i=s.dataset.settingsAction;if(i==="save"){Jt={...yt};let o=$o();jo(),C(o?"\u5B57\u578B\u5927\u5C0F\u5DF2\u5132\u5B58\u3002":"\u5B57\u578B\u5927\u5C0F\u5DF2\u5957\u7528\uFF0C\u4F46\u700F\u89BD\u5668\u7121\u6CD5\u5132\u5B58\u8A2D\u5B9A\u3002",o?"ok":"warn");return}if(i==="cancel"){yt={...Jt},is(),Is(),C("\u5DF2\u53D6\u6D88\u672A\u5132\u5B58\u7684\u5B57\u578B\u8B8A\u66F4\u3002","info");return}i==="reset"&&(yt={},is(),Is(),C("\u5DF2\u56DE\u5FA9\u9810\u8A2D\u5B57\u578B\uFF1B\u6309\u300C\u5132\u5B58\u300D\u4FDD\u7559\u8B8A\u66F4\u3002","info"));return}let a=e.target.closest("[data-appearance-option]");if(a){ho(a.dataset.appearanceOption);return}let n=e.target.closest(".theme-option");n&&Ka(n.dataset.themeId)}function Io(){rs||(rs=!0,yt={...Jt},document.body.classList.add("settings-open"),ys.removeAttribute("inert"),ys.setAttribute("aria-hidden","false"),$s.setAttribute("aria-expanded","true"),nn(ns),is(),window.requestAnimationFrame(()=>{let e=us.querySelector(".settings-option.is-active")||us.querySelector(".settings-option");e&&e.focus({preventScroll:!0})}))}function tn({restoreFocus:e=!0}={}){rs&&(rs=!1,_s(),yt={...Jt},is(),document.body.classList.remove("settings-open"),e&&$s.focus({preventScroll:!0}),ys.setAttribute("aria-hidden","true"),ys.setAttribute("inert",""),$s.setAttribute("aria-expanded","false"))}function gr(){ys=document.getElementById("settings-sidebar"),$s=document.getElementById("settings-trigger"),vt=document.getElementById("settings-panel"),us=document.getElementById("settings-options"),tr=document.getElementById("settings-close"),!(!ys||!$s||!vt||!us)&&(ia(),Ka(Va(),{persist:!1}),qo(),Is(),So(),is(),$s.addEventListener("click",()=>{rs?tn():Io()}),tr?.addEventListener("click",()=>tn()),us.addEventListener("click",e=>{let t=e.target.closest("[data-settings-panel]");t&&nn(t.dataset.settingsPanel)}),vt.addEventListener("click",Po),vt.addEventListener("input",nr),vt.addEventListener("change",nr),vt.addEventListener("blur",To,!0),vt.addEventListener("pointerover",No),vt.addEventListener("pointerout",Eo),vt.addEventListener("focusin",Ro),vt.addEventListener("focusout",Co),vt.addEventListener("keydown",e=>{e.key==="Enter"&&e.target.classList.contains("font-size-number-input")&&(e.preventDefault(),e.target.blur())}),document.addEventListener("keydown",e=>{e.key==="Escape"&&rs&&tn()}),window.addEventListener("storage",e=>{if(e.key===sn){Wt=or(),ia();return}e.key===na&&(Jt=cr(),rs||(yt={...Jt},is()))}))}var rn={};Zt(rn,{render:()=>Bo});function Do(e){let t=e&&typeof e=="object"?e:{},s=t.judgment_total,a=t.financial_total,n=Number(s),i=Number(a),o=s!=null&&Number.isFinite(n)&&n>=0,l=a!=null&&Number.isFinite(i)&&i>=0;return{total:o?n:null,financial:l?i:null,ratio:o&&l&&n>0?i/n*100:null}}function Qt(e,{loading:t=!1}={}){let s=Do(e),a=t?"\u8B80\u53D6\u4E2D\u2026":d(s.total),n=t?"\u8B80\u53D6\u4E2D\u2026":d(s.financial),i=t?"\u8B80\u53D6\u4E2D\u2026":s.ratio===null?"\u2014":`${s.ratio.toFixed(1)}%`;return`<div class="processing-summary-card">
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
  </div>`}var fr=[{route:"rag",icon:"message",kicker:"RAG",title:"RAG \u63D0\u554F",summary:"\u7528\u81EA\u7136\u8A9E\u8A00\u627E\u5230\u6CD5\u898F\u8207\u5224\u6C7A\uFF0C\u7B54\u6848\u9644\u4E0A\u53EF\u56DE\u6EAF\u7684\u5F15\u7528\u4F86\u6E90\u3002",description:"Qdrant \u5411\u91CF\u6AA2\u7D22\u3001LLM \u751F\u6210\u56DE\u7B54\u3001\u5F15\u7528\u9A57\u8B49\u8207 pipeline waterfall\uFF0C\u90FD\u5728\u540C\u4E00\u500B\u5DE5\u4F5C\u5340\u5B8C\u6210\u3002",metric:"Citations first",tone:"feature"},{route:"data",icon:"database",kicker:"EXPLORE",title:"\u8CC7\u6599\u5EAB\u67E5\u8A62",summary:"\u8DE8 PostgreSQL\u3001Parquet\u3001Qdrant \u8207 IndexedDB \u63A2\u7D22\u8CC7\u6599\u3002",description:"\u4EE5 metadata\u3001SQL \u6216\u8A9E\u610F\u67E5\u8A62\u6AA2\u8996\u8CC7\u6599\u8868\uFF0C\u652F\u63F4\u5206\u9801\u3001\u6392\u5E8F\u8207 CSV\uFF0FJSON \u532F\u51FA\u3002",metric:"4 \u7A2E\u8CC7\u6599\u4F86\u6E90",tone:"blue"},{route:"quality",icon:"shield",kicker:"QUALITY",title:"\u8CC7\u6599\u54C1\u8CEA",summary:"\u7528 DuckDB \u76F4\u63A5\u6AA2\u67E5\u539F\u59CB\u5224\u6C7A\u8CC7\u6599\u7684\u5B8C\u6574\u6027\u3002",description:"\u6AA2\u67E5\u91CD\u8907\u3001\u7F3A\u6F0F\u3001\u5F15\u7528\u4E00\u81F4\u6027\u8207 archive \u7D71\u8A08\uFF0C\u4E26\u7DAD\u8B77\u984C\u5EAB\u8207 benchmark \u984C\u7D44\u3002",metric:"DuckDB native",tone:"green"},{route:"performance",icon:"activity",kicker:"OBSERVE",title:"\u6548\u80FD\u5831\u8868",summary:"\u5F9E\u55AE\u6B21\u8ACB\u6C42\u5230\u6574\u9AD4\u7D22\u5F15\uFF0C\u8FFD\u8E64\u6BCF\u4E00\u500B\u6642\u9593\u7247\u6BB5\u3002",description:"\u5B8C\u6574 Flow\u3001RAG Pipeline waterfall\u3001Token\u3001TTFT\u3001\u7D22\u5F15\u541E\u5410\u8207 RAG Benchmark \u4E00\u6B21\u770B\u5B8C\u3002",metric:"ms-level trace",tone:"amber"},{route:"processing",icon:"sliders",kicker:"PIPELINE",title:"\u8CC7\u6599\u8655\u7406",summary:"\u4E0B\u8F09\u3001\u532F\u5165\u3001\u5099\u4EFD\u3001\u7D22\u5F15\uFF0C\u96C6\u4E2D\u7BA1\u7406\u8CC7\u6599\u751F\u547D\u9031\u671F\u3002",description:"\u8FFD\u8E64\u6CD5\u898F\u3001\u547D\u4EE4\u8207\u5224\u6C7A\u6D41\u7A0B\uFF0C\u7BA1\u7406 Ollama \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u8207\u7DDA\u4E0A\u66F4\u65B0\u6AA2\u67E5\u3002",metric:"End-to-end",tone:"violet"},{route:"status",icon:"server",kicker:"STATUS",title:"\u7CFB\u7D71\u72C0\u614B",summary:"\u5373\u6642\u638C\u63E1\u6BCF\u4E00\u500B\u670D\u52D9\u8207\u57FA\u790E\u8A2D\u65BD\u7684\u904B\u4F5C\u72C0\u614B\u3002",description:"FastAPI\u3001PostgreSQL\u3001Qdrant\u3001Ollama\u3001Docker\uFF0Fvolume\u3001\u78C1\u789F\u8207\u8CC7\u6599\u7248\u672C\u3002",metric:"Live health",tone:"slate"},{route:"tests",icon:"check",kicker:"VERIFY",title:"\u7CFB\u7D71\u6E2C\u8A66",summary:"\u5728\u4E0A\u7DDA\u524D\u78BA\u8A8D API\u3001\u6A21\u578B\u8207\u6E2C\u8A66 Flow \u90FD\u6E96\u5099\u597D\u4E86\u3002",description:"\u8A2D\u5B9A API Base\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207 LLM chat \u80FD\u529B\uFF0C\u57F7\u884C\u591A\u6A21\u578B\u6E2C\u8A66\u4E26\u6AA2\u67E5\u7D50\u679C\u3002",metric:"Model ready",tone:"rose"}];function Oo(e){return`<a class="home-tile tone-${r(e.tone)}" href="#/${e.route}">
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
  </a>`}async function Bo(e,t){let s=fr[0],a=fr.slice(1).map(Oo).join("");e.innerHTML=`<section class="page home-page">
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
        ${Qt(null,{loading:!0})}
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
  </section>`;let n=e.querySelector("#home-ask-form"),i=e.querySelector("#home-question"),o=()=>{let c=String(i?.value||"").trim().slice(0,500);if(!c){i?.focus();return}try{window.sessionStorage.setItem("judgment.pending_question",c)}catch{}window.__judgmentPendingQuestion=c,t&&typeof t.navigate=="function"?t.navigate("rag"):window.location.hash="#/rag"},l=()=>{i&&(i.style.height="auto",i.style.height=`${Math.min(i.scrollHeight,140)}px`)};i?.addEventListener("input",l),n?.addEventListener("submit",c=>{c.preventDefault(),o()}),i?.addEventListener("keydown",c=>{c.key==="Enter"&&!c.shiftKey&&!c.isComposing&&(c.preventDefault(),o())});let u=e.querySelector("#home-judgment-stats");K.judgmentStats().then(c=>{!u||!u.isConnected||(u.innerHTML=Qt(c))}).catch(()=>{!u||!u.isConnected||(u.innerHTML=Qt(null))}),l(),i?.focus({preventScroll:!0})}var An={};Zt(An,{render:()=>xc});var br="judgment-console";var mt="query_history",Ot="settings",Bt="audit_events";var at={history:[],settings:new Map,audit:[],nextId:1},ca=null,ct=!("indexedDB"in window);function Mt(e){return new Promise((t,s)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>s(e.error)})}function At(e){return new Promise((t,s)=>{e.oncomplete=()=>t(),e.onerror=()=>s(e.error),e.onabort=()=>s(e.error||new Error("transaction aborted"))})}function Lt(){return ca||(ca=new Promise((e,t)=>{if(!("indexedDB"in window)){ct=!0,t(new Error("IndexedDB is unavailable"));return}let s;try{s=window.indexedDB.open(br,2)}catch(a){ct=!0,t(a);return}s.onupgradeneeded=()=>{let a=s.result;if(!a.objectStoreNames.contains(mt)){let n=a.createObjectStore(mt,{keyPath:"id",autoIncrement:!0});n.createIndex("created_at","created_at"),n.createIndex("kind","kind")}if(a.objectStoreNames.contains(Ot)||a.createObjectStore(Ot,{keyPath:"key"}),!a.objectStoreNames.contains(Bt)){let n=a.createObjectStore(Bt,{keyPath:"key"});n.createIndex("created_at","created_at"),n.createIndex("dataset","dataset"),n.createIndex("jid","jid"),n.createIndex("issue_month","issue_month")}},s.onsuccess=()=>{let a=s.result;a.onversionchange=()=>a.close(),e(a)},s.onerror=()=>{ct=!0,t(s.error||new Error("Unable to open IndexedDB"))},s.onblocked=()=>{ct=!0,t(new Error("IndexedDB upgrade blocked by another tab"))}}),ca)}function vr(){return"indexedDB"in window}function hr(){return ct}function Os(){return ct?"memory":"indexeddb"}function Fo(e){let t=e.created_at||new Date().toISOString();return{kind:e.kind||"query",title:String(e.title||""),detail:String(e.detail||""),payload:e.payload||{},turns:Array.isArray(e.turns)?e.turns:[],pinned:!!e.pinned,project_id:String(e.project_id||""),created_at:t,updated_at:e.updated_at||t}}async function Ho(){try{let t=(await Lt()).transaction(mt,"readwrite"),s=t.objectStore(mt),a=await Mt(s.count());if(a>120){let n=a-120,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let u=i.result;if(!u||n<=0){o();return}u.delete(),n-=1,u.continue()},i.onerror=()=>l(i.error)})}await At(t)}catch{ct=!0}}async function Bs(e){let t=Fo(e);try{let a=(await Lt()).transaction(mt,"readwrite"),n=a.objectStore(mt),i=await Mt(n.add(t));return await At(a),await Ho(),i}catch{ct=!0;let a=at.nextId++;return at.history.push({id:a,...t}),at.history.length>120&&at.history.shift(),a}}async function Fs(e,t={}){let s=Number(e);if(!Number.isFinite(s))return null;try{let n=(await Lt()).transaction(mt,"readwrite"),i=n.objectStore(mt),o=await Mt(i.get(s));if(!o)return await At(n),null;let l={...o,...t,id:s};return await Mt(i.put(l)),await At(n),l}catch{ct=!0;let n=at.history.findIndex(i=>Number(i.id)===s);return n===-1?null:(at.history[n]={...at.history[n],...t,id:s},at.history[n])}}async function $r(e){let t=Number(e);if(!Number.isFinite(t))return!1;try{let a=(await Lt()).transaction(mt,"readwrite");return a.objectStore(mt).delete(t),await At(a),!0}catch{ct=!0;let a=at.history.findIndex(n=>Number(n.id)===t);return a===-1?!1:(at.history.splice(a,1),!0)}}async function da({keyword:e="",limit:t=50}={}){let s=e.trim().toLowerCase();try{let n=(await Lt()).transaction(mt,"readonly"),i=n.objectStore(mt),o=await Mt(i.getAll());return await At(n),o.filter(l=>s?`${l.kind} ${l.title} ${l.detail}`.toLowerCase().includes(s):!0).sort((l,u)=>String(u.updated_at||u.created_at).localeCompare(String(l.updated_at||l.created_at))).slice(0,t)}catch{return ct=!0,at.history.filter(n=>s?`${n.kind} ${n.title} ${n.detail}`.toLowerCase().includes(s):!0).slice().sort((n,i)=>String(i.updated_at||i.created_at).localeCompare(String(n.updated_at||n.created_at))).slice(0,t)}}async function yr(){try{let t=(await Lt()).transaction(mt,"readwrite");t.objectStore(mt).clear(),await At(t)}catch{ct=!0}at.history=[]}function zo(e){let t=Number(e.id??e.event_id??0)||0,s=String(e.dataset||e.kind||"judgment"),a=String(e.key||`${s}:${t||`${Date.now()}:${Math.random().toString(36).slice(2)}`}`),n=String(e.jid||""),i=String(e.issue_month||""),o=String(e.change_type||""),l=String(e.detected_at||e.created_at||new Date().toISOString());return{key:a,event_id:t,dataset:s,jid:n,issue_month:i,change_type:o,title:String(e.title||n||i||"\u7248\u672C\u8B8A\u66F4"),detail:String(e.detail||[o,i,n].filter(Boolean).join(" \xB7 ")),created_at:l,payload:e}}async function Uo(){try{let t=(await Lt()).transaction(Bt,"readwrite"),s=t.objectStore(Bt),a=await Mt(s.count());if(a>2e3){let n=a-2e3,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let u=i.result;if(!u||n<=0){o();return}u.delete(),n-=1,u.continue()},i.onerror=()=>l(i.error)})}await At(t)}catch{ct=!0}}async function wr(e){let t=(Array.isArray(e)?e:[]).filter(s=>s&&typeof s=="object").map(zo);if(!t.length)return 0;try{let a=(await Lt()).transaction(Bt,"readwrite"),n=a.objectStore(Bt);for(let i of t)await Mt(n.put(i));return await At(a),await Uo(),t.length}catch{ct=!0;let a=new Map(at.audit.map(n=>[n.key,n]));for(let n of t)a.set(n.key,n);return at.audit=Array.from(a.values()).sort((n,i)=>String(i.created_at).localeCompare(String(n.created_at))).slice(0,2e3),t.length}}async function _r({keyword:e="",limit:t=200}={}){let s=e.trim().toLowerCase(),a=n=>s?`${n.dataset} ${n.jid} ${n.issue_month} ${n.change_type} ${n.detail}`.toLowerCase().includes(s):!0;try{let i=(await Lt()).transaction(Bt,"readonly"),o=i.objectStore(Bt),l=await Mt(o.getAll());return await At(i),l.filter(a).sort((u,c)=>String(c.created_at).localeCompare(String(u.created_at))).slice(0,t)}catch{return ct=!0,at.audit.filter(a).slice().sort((i,o)=>String(o.created_at).localeCompare(String(i.created_at))).slice(0,t)}}async function kr(){let e={name:br,version:2,supported:"indexedDB"in window,mode:Os(),degraded:ct,stores:[mt,Ot,Bt],caps:{history:120,audit:2e3},usage_bytes:null,quota_bytes:null};if(typeof navigator<"u"&&navigator.storage?.estimate)try{let t=await navigator.storage.estimate();e.usage_bytes=Number.isFinite(t.usage)?t.usage:null,e.quota_bytes=Number.isFinite(t.quota)?t.quota:null}catch{}try{let s=(await Lt()).transaction([mt,Ot,Bt],"readonly"),a=At(s),[n,i,o]=await Promise.all([Mt(s.objectStore(mt).count()),Mt(s.objectStore(Ot).count()),Mt(s.objectStore(Bt).count()),a]);return{...e,available:!0,counts:{query_history:n,settings:i,audit_events:o},total:n+i+o}}catch{return ct=!0,{...e,available:!1,degraded:!0,mode:"memory",counts:{query_history:at.history.length,settings:at.settings.size,audit_events:at.audit.length},total:at.history.length+at.settings.size+at.audit.length}}}async function Hs(e,t){let s={key:String(e),value:t,updated_at:new Date().toISOString()};try{let n=(await Lt()).transaction(Ot,"readwrite");return n.objectStore(Ot).put(s),await At(n),s}catch{return ct=!0,at.settings.set(s.key,s),s}}async function os(e,t=null){try{let a=(await Lt()).transaction(Ot,"readonly"),n=a.objectStore(Ot),i=await Mt(n.get(String(e)));return await At(a),i?i.value:t}catch{ct=!0;let a=at.settings.get(String(e));return a?a.value:t}}async function Sr({keyword:e=""}={}){let t=e.trim().toLowerCase();try{let a=(await Lt()).transaction(Ot,"readonly"),n=a.objectStore(Ot),i=await Mt(n.getAll());return await At(a),i.filter(o=>t?`${o.key} ${JSON.stringify(o.value)}`.toLowerCase().includes(t):!0).sort((o,l)=>String(o.key).localeCompare(String(l.key)))}catch{return ct=!0,Array.from(at.settings.values()).filter(a=>t?`${a.key} ${JSON.stringify(a.value)}`.toLowerCase().includes(t):!0)}}function xr(e){if(typeof e=="string")return e;try{return JSON.stringify(e)}catch{return String(e)}}var kn={};Zt(kn,{buildFlowWaterfallStages:()=>Sa,render:()=>nc,renderRagPipelineWaterfall:()=>ka,renderTestFlowPanel:()=>As,renderWaterfallStages:()=>xs});var Qo={running:["\u57F7\u884C\u4E2D","badge-info"],stopping:["\u505C\u6B62\u4E2D","badge-warn"],success:["\u5B8C\u6210","badge-ok"],interrupted:["\u5DF2\u4E2D\u6B62","badge-warn"],failed:["\u5931\u6557","badge-danger"],pending:["\u7B49\u5F85","badge-neutral"],skipped:["\u7565\u904E","badge-neutral"]},Go=new Set(["running","stopping"]);function ma(e){let[t,s]=Qo[e]||[e||"\u672A\u77E5","badge-neutral"];return`<span class="badge ${s}">${r(t)}</span>`}function ua(e){return String(e).padStart(2,"0")}function ks(e=new Date){let t=e instanceof Date?e:new Date(e);return`RAG Benchmark ${t.getFullYear()}-${ua(t.getMonth()+1)}-${ua(t.getDate())} ${ua(t.getHours())}:${ua(t.getMinutes())}`}function pa(e){return Go.has(e)}function Vt(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?s.toFixed(3):t}function ps(e){if(e==null)return"\u2014";let t=Number(e);return Number.isFinite(t)?`${(t*100).toFixed(1)}%`:"\u2014"}function ls(e,t,s=""){return`<div class="bench-metric">
    <span class="summary-label">${r(e)}</span>
    <strong>${r(String(t))}</strong>
    ${s?`<small>${r(s)}</small>`:""}
  </div>`}function Ar(e={}){let t=e.score_components||e,s=e.gate||{},a=String(s.status||""),n=a==="pass"?"Gate \u901A\u904E":a==="fail"?"Gate \u5931\u6557":a==="no_data"?"Gate \u7121\u8CC7\u6599":"";return`${n?`<span class="badge ${a==="pass"?"badge-ok":a==="fail"?"badge-danger":"badge-neutral"}">${r(n)}</span>`:""}<div class="bench-metrics">
    ${ls("Law Recall",ps(t.law_recall))}
    ${ls("Article Recall",ps(t.article_recall))}
    ${ls("Citation Valid",ps(t.citation_valid_rate))}
    ${ls("Judge",Vt(t.judge_overall))}
    ${ls("Human",Vt(t.human_overall))}
    ${ls("p50",fe(e.duration_p50_ms))}
    ${ls("p95",fe(e.duration_p95_ms))}
    ${ls("Success",`${d(e.success||0)} / ${d(e.total||0)}`)}
  </div>`}function qr(e={}){let t=Object.entries(e.stages||{}).filter(([s])=>s.startsWith("rag.")).slice(0,8);return t.length?`<div class="bench-stage-grid">${t.map(([s,a])=>`<div class="bench-stage">
      <span>${r(s.replace(/^rag\./,""))}</span>
      <strong>${fe(a.p50_ms)}</strong>
      <small>p95 ${fe(a.p95_ms)}</small>
    </div>`).join("")}</div>`:""}function Mr(e){let t=e.summary||{},s=t.score_components||{};return`<span>Law ${ps(s.law_recall)}</span>
    <span>Article ${ps(s.article_recall)}</span>
    <span>Judge ${Vt(s.judge_overall)}</span>
    <span>p95 ${fe(t.duration_p95_ms)}</span>`}function Lr(e){let t=e.summary||{},s=t.score_components||{};return JSON.stringify([s.law_recall,s.article_recall,s.judge_overall,t.duration_p95_ms])}function jr(e,t){let s=e.config||{};return`<button class="bench-run ${t?"is-active":""}" type="button" data-bench-action="open-run" data-run-id="${r(e.run_id)}">
    <span class="bench-run-head">
      <strong data-bench-slot="run-label">${r(e.label||"RAG Benchmark")}</strong>
      <span data-bench-slot="run-status" data-status="${r(e.status||"")}">${ma(e.status)}</span>
      <span class="mono">${r(e.run_id.slice(0,10))}</span>
    </span>
    <span class="bench-run-meta">
      <span>${r($e(e.started_at))}</span>
      <span data-bench-slot="run-completed">${d(e.completed_cases||0)} / ${d(e.total_cases||0)} \u984C</span>
      <span>${r(s.llm_model||"\u2014")}</span>
      <span>v${e.suite_version||1}</span>
    </span>
    <span class="bench-run-scores" data-bench-slot="run-scores" data-signature="${r(Lr(e))}">${Mr(e)}</span>
  </button>`}function ln(e,t=[]){let s=e.metrics||{},a=e.judge||{},n=e.human_review||{},i=s.scores||{},o=e.stage_ms||{},l=Object.entries(o).filter(([c])=>c.startsWith("rag.")).map(([c,m])=>`<span class="chip">${r(c)} ${fe(m)}</span>`).join(""),u=(e.law_sources||[]).map(c=>`<span class="chip">${r(c.law_name||"\u6CD5\u898F")} ${d((c.articles||[]).length)} \u689D</span>`).join("");return`<summary>
      <span class="bench-case-question">${r(e.question)}</span>
      ${ma(e.status)}
      <span class="bench-case-time">${fe(e.duration_ms)}</span>
      <span class="bench-case-score">Det ${Vt(i.deterministic)} \xB7 Judge ${Vt(i.judge)} \xB7 Human ${Vt(i.human)}</span>
    </summary>
    <div class="bench-case-body">
      <div class="bench-case-meta">
        <span class="mono">fingerprint ${r((e.fingerprint||"").slice(0,20))}</span>
        <span>item #${e.item_id} \xB7 v${e.item_version}</span>
        <button class="btn btn-ghost btn-sm" type="button" data-bench-action="fingerprint-history" data-fingerprint="${r(e.fingerprint||"")}">${f("history",13)}<span>\u540C\u984C\u6B77\u53F2</span></button>
      </div>
      <div class="bench-case-stages">${l||'<span class="qb-muted">\u6C92\u6709 stage timing</span>'}</div>
      <div class="bench-case-metrics">
        <span>Law recall ${ps(s.law_recall)}</span>
        <span>Article recall ${ps(s.article_recall)}</span>
        <span>Citation ${s.citation_valid?"valid":"invalid"}</span>
        <span>Refusal ${s.refusal_correct===null?"\u2014":s.refusal_correct?"correct":"wrong"}</span>
      </div>
      <div class="chips">${u||'<span class="qb-muted">\u6C92\u6709\u6CD5\u898F\u4F86\u6E90</span>'}</div>
      <div class="bench-answer"><strong>\u56DE\u7B54</strong><p>${r(e.answer||"\u2014")}</p></div>
      <div class="bench-judge"><strong>LLM judge</strong><p>${r(a.rationale||a.reason||"\u2014")}</p><span>${[["correctness",a.correctness],["grounding",a.grounding],["citation",a.citation],["clarity",a.clarity],["overall",a.overall]].map(([c,m])=>`${c} ${m??"\u2014"}`).join(" \xB7 ")}</span></div>
      <form class="bench-human-form" data-bench-form="human" data-result-id="${e.id}">
        <div class="bench-human-grid">
          ${[["correctness","\u6B63\u78BA\u6027",n.scores?.correctness??4],["grounding","\u6709\u64DA\u6027",n.scores?.grounding??4],["citation","\u5F15\u7528",n.scores?.citation??4],["clarity","\u6E05\u695A",n.scores?.clarity??4],["overall","\u6574\u9AD4",n.overall??4]].map(([c,m,$])=>`<label class="field"><span class="field-label">${m} <span class="field-tag">1\u20135</span></span><input class="input" type="number" min="1" max="5" name="score_${c}" value="${r(String($))}" /></label>`).join("")}
        </div>
        <label class="field"><span class="field-label">\u4EBA\u5DE5\u6279\u6CE8</span><input class="input" name="comment" value="${r(n.comment||"")}" placeholder="\u56DE\u7B54\u54C1\u8CEA\u3001\u5F15\u7528\u6216\u4E8B\u5BE6\u932F\u8AA4" /></label>
        <button class="btn btn-secondary btn-sm" type="submit">${f("check",13)}<span>\u5132\u5B58\u4EBA\u5DE5\u8A55\u5206</span></button>
      </form>
      ${t.length?`<div class="bench-history"><strong>\u540C\u984C\u6B77\u53F2 \xB7 ${t.length} \u7B46</strong>${t.map(c=>`<div class="bench-history-row"><span>${r($e(c.run?.started_at))}</span><span>${r(c.run?.config?.llm_model||"\u2014")}</span><span>Det ${Vt(c.metrics?.scores?.deterministic)}</span><span>Judge ${Vt(c.metrics?.scores?.judge)}</span><span>Human ${Vt(c.metrics?.scores?.human)}</span><span>${fe(c.duration_ms)}</span></div>`).join("")}</div>`:""}
    </div>`}function on(e,t=[]){return JSON.stringify([e.status,e.duration_ms,e.answer,e.metrics,e.judge,e.human_review,e.stage_ms,e.law_sources,t.map(s=>[s.id,s.duration_ms,s.metrics?.scores?.human,s.finished_at])])}function Tr(e,t=[]){return`<details class="bench-case" data-result-id="${e.id}">
    ${ln(e,t)}
  </details>`}function Nr(e){return`${ma(e.status)}
    <span class="mono">${r(e.run_id)}</span>
    ${pa(e.status)?`<button class="btn btn-secondary btn-sm" type="button" data-bench-action="stop" data-run-id="${r(e.run_id)}">${f("x",13)}<span>\u505C\u6B62</span></button>`:""}`}function Jo(e,t){let s=e.cases||[];return`<section class="report-card bench-detail" data-run-id="${r(e.run_id)}">
    <div class="side-card-head">
      <span class="side-card-title">${f("activity",14)}${r(e.label||"RAG Benchmark")}</span>
      <div class="qb-actions" data-bench-detail-actions data-signature="${r((e.status||"")+":"+e.run_id)}">
        ${Nr(e)}
      </div>
    </div>
    <div data-bench-detail="metrics">${Ar(e.summary||{})}</div>
    <div data-bench-detail="stages">${qr(e.summary||{})}</div>
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
    <div class="bench-cases" data-bench-cases>${s.length?s.map(a=>Tr(a,t[a.fingerprint]||[])).join(""):He({tone:"info",title:"\u5C1A\u7121\u984C\u76EE\u7D50\u679C",text:"Benchmark \u57F7\u884C\u5F8C\u6703\u5728\u9019\u88E1\u986F\u793A\u9010\u984C\u7D50\u679C\u3002"})}</div>
  </section>`}function Er(e){return`<button class="btn btn-primary" type="submit" ${e?"disabled":""}>${f("play",14)}<span>${e?"Benchmark \u57F7\u884C\u4E2D":"\u57F7\u884C Benchmark"}</span></button>
    ${e?`<button class="btn btn-secondary" type="button" data-bench-action="stop" data-run-id="${r(e.run_id)}">${f("x",14)}<span>\u505C\u6B62</span></button>`:""}`}function Rr(e,t=[]){let s=Math.max(0,Number(e.total_cases)||0),a=Math.max(0,Math.min(s,Number(e.completed_cases)||0)),n=Date.now(),i=Date.parse(e.started_at||""),o=Number.isFinite(i)?Math.max(0,n-i):0,l=(t||[]).filter(g=>["success","failed"].includes(g.status)).map(g=>Number(g.duration_ms)||0).filter(g=>g>0),u=null;if(l.length)u=l.reduce((g,y)=>g+y,0)/l.length;else if(a>0){let g=Date.parse(e.updated_at||""),y=Number.isFinite(g)?g:i;Number.isFinite(y)&&y>i?u=(y-i)/a:o>0&&(u=o/a)}let c=(t||[]).find(g=>g.status==="running")||null,m=0;if(a<s&&u&&u>0){let g=c?Date.parse(c.started_at||""):NaN,y=Date.parse(e.updated_at||""),_=Number.isFinite(g)?g:y;Number.isFinite(_)&&(m=Math.max(0,Math.min(.95,(n-_)/u)))}let $=Math.min(s,a+m),b=s>0?Math.max(0,Math.min(100,$/s*100)):0,p=u===null?null:Math.max(0,s-$)*u;return{total:s,completed:a,elapsedMs:o,averageMs:u,progress:b,etaMs:p,ratePerMin:u?6e4/u:null,running:c}}function Cr(e){return e===null?"\u9810\u4F30\u5269\u9918\uFF1A\u8A08\u7B97\u4E2D\u2026":e<1e3?"\u9810\u4F30\u5269\u9918\uFF1A\u5373\u5C07\u5B8C\u6210":`\u9810\u4F30\u5269\u9918 ${fe(e)}`}function Pr(e,t=[]){let s=Rr(e,t),a=e.status==="stopping";return`<div class="bench-progress" data-bench-live data-run-id="${r(e.run_id)}">
    <div class="bench-progress-head">
      <span class="bench-progress-state"><span class="spinner" aria-hidden="true"></span><span data-bench-slot="progress-state">${a?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D"}</span></span>
      <strong data-bench-slot="progress-count">${d(s.completed)} / ${d(s.total)} \u984C</strong>
      <span data-bench-slot="progress-percent">${s.progress.toFixed(1)}%</span>
      <span class="bench-progress-eta" data-bench-slot="progress-eta">${Cr(s.etaMs)}</span>
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
  </div>`}function Wo(e){let t=e.models?.models||{},s=e.suites||[],a=zs(e),n=e.selectedRun;return`<section class="report-card bench-card">
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
      <label class="field"><span class="field-label">Run \u6A19\u7C64</span><input class="input" name="label" value="${r(e.config.label||ks())}" /></label>
      <div class="qb-actions" data-bench-actions data-signature="${r(a?`${a.run_id}:${a.status}`:"")}">
        ${Er(a)}
      </div>
    </form>
    <div data-bench-live-wrap data-signature="${r(a?`${a.run_id}:${a.status}:${a.total_cases}`:"")}">${a?Pr(a,cn(e,a)):""}</div>
    <div class="bench-runs-head"><span class="summary-label">\u6B77\u53F2 Run</span><span class="qb-muted">\u540C\u984C\u76EE\u4EE5 fingerprint \u5C0D\u9F4A\uFF0C\u53EF\u5C55\u958B\u9010\u984C\u6BD4\u8F03</span></div>
    <div class="bench-runs" data-bench-runs>${(e.runs||[]).length?e.runs.map(i=>jr(i,n?.run_id===i.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>'}</div>
    ${n?Jo(n,e.history):""}
  </section>`}function zs(e){let t=(e.runs||[]).find(s=>pa(s.status));return t?e.selectedRun&&e.selectedRun.run_id===t.run_id?e.selectedRun.status&&!pa(e.selectedRun.status)?null:{...t,...e.selectedRun,summary:e.selectedRun.summary||t.summary||{},cases:e.selectedRun.cases||[]}:t:null}function cn(e,t){return!t||!e.selectedRun||e.selectedRun.run_id!==t.run_id?[]:e.selectedRun.cases||[]}function Ir(e,{onNavigate:t=null}={}){let s={models:null,suites:[],runs:[],selectedRun:null,selectedSuiteId:null,history:{},indexVersion:null,config:{label:ks(),embedding_model:"",llm_model:"",judge_model:"",top_k:4,score_threshold:.35,repeats:1,enable_law_retrieval:!0,judge_enabled:!0},labelTouched:!1,loaded:!1,referenceLoaded:!1,loading:!1,loadAgain:!1,pendingRefreshAll:!1,activeRunId:"",refreshStream:null,tickTimer:null,renderSignature:"",forcedCaseIds:new Set},a=()=>e.querySelector("#performance-panel-benchmark"),n=T=>{let S=new FormData(T);return{label:String(S.get("label")||"").trim()||ks(),embedding_model:String(S.get("embedding_model")||""),llm_model:String(S.get("llm_model")||""),judge_model:String(S.get("judge_model")||""),top_k:Number(S.get("top_k")||4),score_threshold:Number(S.get("score_threshold")||.35),repeats:Number(S.get("repeats")||1),enable_law_retrieval:T.elements.enable_law_retrieval?.checked??!0,judge_enabled:T.elements.judge_enabled?.checked??!0}},i=()=>JSON.stringify({selectedRunId:s.selectedRun?.run_id||"",references:s.referenceLoaded?[s.indexVersion?.physical_collection||"",(s.models?.models?.embedding||[]).join(","),(s.models?.models?.llm||[]).join(","),(s.suites||[]).map(T=>`${T.id}:${T.name}:${T.item_count}:${T.version}:${T.status}`)]:null,runs:(s.runs||[]).map(T=>`${T.run_id}:${T.label||""}:${T.suite_version||1}`)}),o=()=>{let S=a()?.querySelector("[data-bench-live]"),E=zs(s);if(!S||!E)return;let se=Rr(E,cn(s,E)),le=(ye,I)=>{let we=S.querySelector(`[data-bench-slot="${ye}"]`);we&&we.textContent!==I&&(we.textContent=I)};le("progress-count",`${d(se.completed)} / ${d(se.total)} \u984C`),le("progress-percent",`${se.progress.toFixed(1)}%`),le("progress-eta",Cr(se.etaMs)),le("progress-rate",se.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${se.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`),le("progress-elapsed",`\u5DF2\u57F7\u884C ${fe(se.elapsedMs)}`),le("progress-average",se.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${fe(se.averageMs)}\uFF0F\u984C`),le("progress-state",E.status==="stopping"?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D");let Q=S.querySelector('[data-bench-slot="progress-bar"]');Q&&(Q.setAttribute("aria-valuenow",se.progress.toFixed(1)),Q.classList.toggle("is-waiting",se.completed===0));let pe=S.querySelector('[data-bench-slot="progress-fill"]');pe&&(pe.style.width=`${se.progress.toFixed(2)}%`)},l=T=>{let S=T.querySelector("[data-bench-actions]");if(!S)return;let E=zs(s),se=E?`${E.run_id}:${E.status}`:"";S.dataset.signature!==se&&(S.dataset.signature=se,S.innerHTML=Er(E))},u=T=>{let S=T.querySelector("[data-bench-live-wrap]");if(!S)return;let E=zs(s),se=E?`${E.run_id}:${E.status}:${E.total_cases}`:"";S.dataset.signature!==se&&(S.dataset.signature=se,S.innerHTML=E?Pr(E,cn(s,E)):"")},c=T=>{let S=T.querySelector("[data-bench-runs]");if(!S)return;let E=s.runs||[],se=[...S.querySelectorAll("[data-run-id]")].map(Q=>Q.dataset.runId),le=E.map(Q=>Q.run_id);if(se.join("|")!==le.join("|")){S.innerHTML=E.length?E.map(Q=>jr(Q,s.selectedRun?.run_id===Q.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>';return}for(let Q of E){let pe=S.querySelector(`[data-run-id="${Q.run_id}"]`);if(!pe)continue;pe.classList.toggle("is-active",s.selectedRun?.run_id===Q.run_id);let ye=pe.querySelector('[data-bench-slot="run-label"]');ye&&ye.textContent!==(Q.label||"RAG Benchmark")&&(ye.textContent=Q.label||"RAG Benchmark");let I=pe.querySelector('[data-bench-slot="run-status"]');I&&I.dataset.status!==(Q.status||"")&&(I.dataset.status=Q.status||"",I.innerHTML=ma(Q.status));let we=pe.querySelector('[data-bench-slot="run-completed"]');if(we){let Te=`${d(Q.completed_cases||0)} / ${d(Q.total_cases||0)} \u984C`;we.textContent!==Te&&(we.textContent=Te)}let G=pe.querySelector('[data-bench-slot="run-scores"]'),he=Lr(Q);G&&G.dataset.signature!==he&&(G.dataset.signature=he,G.innerHTML=Mr(Q))}},m=T=>{let S=s.selectedRun;if(!S)return;let E=T.querySelector(`.bench-detail[data-run-id="${S.run_id}"]`);if(!E)return;let se=E.querySelector("[data-bench-detail-actions]");if(se){let G=`${S.status||""}:${S.run_id}`;se.dataset.signature!==G&&(se.dataset.signature=G,se.innerHTML=Nr(S))}let le=E.querySelector('[data-bench-detail="metrics"]');if(le){let G=JSON.stringify(S.summary||{});le.dataset.signature!==G&&(le.dataset.signature=G,le.innerHTML=Ar(S.summary||{}))}let Q=E.querySelector('[data-bench-detail="stages"]');if(Q){let G=JSON.stringify((S.summary||{}).stages||{});Q.dataset.signature!==G&&(Q.dataset.signature=G,Q.innerHTML=qr(S.summary||{}))}let pe=E.querySelector("[data-bench-cases]");if(!pe)return;let ye=S.cases||[];if(!ye.length)return;let I=pe.querySelector(".notice");I&&I.remove();let we=new Map([...pe.querySelectorAll("details.bench-case")].map(G=>[Number(G.dataset.resultId),G]));for(let G of ye){let he=s.history[G.fingerprint]||[],Te=on(G,he),ne=we.get(Number(G.id));if(!ne){pe.insertAdjacentHTML("beforeend",Tr(G,he)),ne=pe.lastElementChild,ne&&(ne._benchSignature=Te);continue}if(ne._benchSignature===Te||!s.forcedCaseIds.delete(Number(G.id))&&ne.contains(document.activeElement))continue;let ge=ne.open;ne.innerHTML=ln(G,he),ne.open=ge,ne._benchSignature=Te}},$=()=>{zs(s)?s.tickTimer||(s.tickTimer=window.setInterval(o,1e3)):s.tickTimer&&(window.clearInterval(s.tickTimer),s.tickTimer=null)},b=()=>{let T=a();T&&(l(T),u(T),c(T),m(T),o(),$())},p=T=>{let S=s.selectedRun;if(!S)return;let E=T.querySelector('[data-bench-detail="metrics"]');E&&(E.dataset.signature=JSON.stringify(S.summary||{}));let se=T.querySelector('[data-bench-detail="stages"]');se&&(se.dataset.signature=JSON.stringify((S.summary||{}).stages||{}));let le=T.querySelector("[data-bench-cases]");if(!le)return;let Q=new Map((S.cases||[]).map(pe=>[Number(pe.id),pe]));for(let pe of le.querySelectorAll("details.bench-case")){let ye=Q.get(Number(pe.dataset.resultId));ye&&(pe._benchSignature=on(ye,s.history[ye.fingerprint]||[]))}},g=(T=!1)=>{let S=a();if(!S)return;let E=i();if(!T&&s.renderSignature===E){b();return}s.renderSignature=E,s.forcedCaseIds.clear(),S.innerHTML=Wo(s),p(S),b()},y=async({refreshAll:T=!1,runs:S=null}={})=>{if(s.loading){s.loadAgain=!0,s.pendingRefreshAll=s.pendingRefreshAll||T;return}s.loading=!0;try{if(!s.referenceLoaded||T){let[I,we]=await Promise.all([K.benchmarkModels(),K.benchmarkSuites()]);s.models=I,s.suites=we.suites||[],s.indexVersion=I.index_version,s.referenceLoaded=!0,!s.selectedSuiteId&&s.suites.length&&(s.selectedSuiteId=s.suites[0].id),s.config.embedding_model||(s.config.embedding_model=I.models?.embedding?.[0]||""),s.config.llm_model||(s.config.llm_model=I.models?.llm?.[0]||""),s.config.judge_model||(s.config.judge_model=(I.models?.llm||[]).find(G=>G!==s.config.llm_model)||"")}let E=S?{runs:S}:await K.benchmarkRuns(30);s.runs=E.runs||[];let se=s.activeRunId,le=s.runs.find(I=>pa(I.status))||null;s.activeRunId=le?.run_id||"";let Q=s.selectedRun?.run_id||"";Q||(Q=le?.run_id||s.runs[0]?.run_id||"");let pe=!!(s.selectedRun&&se&&s.selectedRun.run_id===se);Q&&(!s.selectedRun||s.selectedRun.run_id!==Q||Q===le?.run_id||pe)?s.selectedRun=await K.benchmarkRun(Q,!0):Q||(s.selectedRun=null),s.loaded=!0,g()}catch(E){if(!s.loaded){s.renderSignature="";let se=a();se&&(se.innerHTML=He({tone:"danger",title:"Benchmark \u8CC7\u6599\u8B80\u53D6\u5931\u6557",text:r(E.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")}))}}finally{if(s.loading=!1,s.loadAgain){let E=s.pendingRefreshAll;s.loadAgain=!1,s.pendingRefreshAll=!1,y({refreshAll:E})}}},_=()=>{s.refreshStream||(s.refreshStream=xt("benchmark",(T,S)=>{s.loading||y({runs:S?.snapshot?.runs||null})}))},q=async T=>{try{s.selectedRun=await K.benchmarkRun(T,!0),g()}catch(S){C(S.message||"\u8B80\u53D6 benchmark run \u5931\u6557\u3002","danger")}},M=async T=>{!s.labelTouched&&T.elements.label&&(T.elements.label.value=ks());let S=n(T);s.config=S;let E=Number(T.elements.suite_id?.value||0);if(!E){C("\u8ACB\u5148\u9078\u64C7 benchmark \u984C\u5EAB\u3002","warn");return}try{await K.startBenchmarkRun({suite_id:E,config:S,actor:"anonymous"}),C("Benchmark \u5DF2\u555F\u52D5\u3002","ok"),s.selectedRun=null,s.config.label=ks(),s.labelTouched=!1,await y()}catch(se){C(se.message||"Benchmark \u555F\u52D5\u5931\u6557\u3002","danger",8e3)}},A=async T=>{try{await K.stopBenchmarkRun(T),C("\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info"),await y()}catch(S){C(S.message||"\u505C\u6B62\u5931\u6557\u3002","danger")}},U=async T=>{let S=Number(T.dataset.resultId||0),E=new FormData(T),se={};for(let le of["correctness","grounding","citation","clarity","overall"]){let Q=Number(E.get(`score_${le}`));Number.isFinite(Q)&&(se[le]=Q)}try{await K.reviewBenchmarkResult(S,{reviewer:"anonymous",scores:se,comment:String(E.get("comment")||"")}),C("\u4EBA\u5DE5\u8A55\u5206\u5DF2\u5132\u5B58\u3002","ok"),s.selectedRun&&(s.selectedRun=await K.benchmarkRun(s.selectedRun.run_id,!0),s.forcedCaseIds.add(S)),g()}catch(le){C(le.message||"\u4EBA\u5DE5\u8A55\u5206\u5132\u5B58\u5931\u6557\u3002","danger")}},V=async T=>{if(T)try{let S=await K.benchmarkFingerprintHistory(T,50);s.history[T]=S.cases||[];let E=s.selectedRun,se=a();if(!E||!se)return;let le=(E.cases||[]).filter(Q=>Q.fingerprint===T);for(let Q of le){let pe=se.querySelector(`details.bench-case[data-result-id="${Q.id}"]`);if(!pe)continue;let ye=pe.open;pe.innerHTML=ln(Q,s.history[T]),pe.open=ye,pe._benchSignature=on(Q,s.history[T])}}catch(S){C(S.message||"\u540C\u984C\u6B77\u53F2\u8B80\u53D6\u5931\u6557\u3002","danger")}},J=async T=>{let S=T.target.closest("[data-bench-action]");if(!S)return;let E=S.dataset.benchAction;E==="open-run"?await q(S.dataset.runId||""):E==="stop"?await A(S.dataset.runId||""):E==="fingerprint-history"&&await V(S.dataset.fingerprint||"")},ke=async T=>{let S=T.target.closest("[data-bench-form]");S&&(T.preventDefault(),S.dataset.benchForm==="run"?await M(S):S.dataset.benchForm==="human"&&await U(S))},Se=T=>{T&&(T.elements.label&&T.elements.label.value!==s.config.label&&(s.labelTouched=!0),s.config=n(T),T.elements.suite_id&&(s.selectedSuiteId=Number(T.elements.suite_id.value)||s.selectedSuiteId))},F=T=>{let S=T.target.closest('[data-bench-form="run"]');S&&Se(S)};return e.addEventListener("click",J),e.addEventListener("submit",ke),e.addEventListener("input",F),e.addEventListener("change",F),{show(){if(t&&t("benchmark"),!s.labelTouched){s.config.label=ks();let T=a()?.querySelector('input[name="label"]');T&&(T.value=s.config.label)}_(),y({refreshAll:!s.referenceLoaded})},refresh(){return _(),y({refreshAll:!0})},destroy(){e.removeEventListener("click",J),e.removeEventListener("submit",ke),e.removeEventListener("input",F),e.removeEventListener("change",F),s.refreshStream&&s.refreshStream(),s.refreshStream=null,s.tickTimer&&window.clearInterval(s.tickTimer)}}}var vn={};Zt(vn,{exportCsv:()=>$a,exportableResult:()=>ya,render:()=>Tl,renderReport:()=>ba,reportError:()=>ha,reportLoading:()=>Us});var Qr=[10,25,50,100],Dr=500,Vo=["law_name","law_level","law_category","law_modified_date","article_count"],Ko=["jid","court_normalized","title","jdate","matched_laws","citation_count"],Yo={A:"\u689D\u6587",C:"\u7AE0\u7BC0"};function va(e){return e?.label||e?.id||"\u8CC7\u6599\u5EAB"}function ga(e,t){let s={};for(let a of e.fields||[]){let n=a.type==="checkbox"?!1:a.type==="multiselect"?[]:"",i=a.default===void 0?n:a.default;s[a.key]=Array.isArray(i)?[...i]:i}return{values:s,page:1,pageSize:t,result:null,sort:null,columnFilters:{},fuzzyTerms:[]}}function Xo(e,t){let s=e.visibleWhen;if(!s)return!0;for(let[a,n]of Object.entries(s))if(Array.isArray(n)&&!n.map(String).includes(String(t[a]??"")))return!1;return!0}function bn(e,t){return(e.fields||[]).filter(s=>Xo(s,t))}function Zo(e,t){return`filter-${e.id}-${t}`}function ms(e){return e==null?"":r(String(e))}function dn(e,t,s){let a=s[t.key],n=Zo(e,t.key),i=t.help?`<span class="field-help">${r(t.help)}</span>`:"";if(t.type==="checkbox")return`<div class="field">
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
    </label>`;if(t.type==="select"){let l=(t.options||[]).map(u=>`<option value="${ms(u.value)}" ${String(u.value)===String(a??"")?"selected":""}>${r(u.label??u.value)}</option>`).join("");return`<div class="field">${o}
      <select class="select" id="${n}" name="${r(t.key)}">${l}</select>
      ${i}
    </div>`}if(t.type==="multiselect"){let l=new Set((Array.isArray(a)?a:[]).map(String)),u=(t.options||[]).map(c=>`<label class="multi-option">
          <input type="checkbox" name="${r(t.key)}" value="${ms(c.value)}" ${l.has(String(c.value))?"checked":""} />
          <span>${r(c.label??c.value)}</span>
        </label>`).join("");return`<div class="field">${o}
      <div class="multi-select">${u}</div>
      ${i}
    </div>`}return t.type==="number"?`<div class="field">${o}
      <input class="input" type="number" id="${n}" name="${r(t.key)}"
        value="${ms(a)}"
        ${t.min!==void 0?`min="${t.min}"`:""}
        ${t.max!==void 0?`max="${t.max}"`:""}
        step="${t.step??1}"
        placeholder="${ms(t.placeholder||"")}" />
      ${i}
    </div>`:t.type==="date"?`<div class="field">${o}
      <input class="input" type="date" id="${n}" name="${r(t.key)}"
        value="${ms(a)}" />
      ${i}
    </div>`:`<div class="field">${o}
    <input class="input" type="text" id="${n}" name="${r(t.key)}"
      value="${ms(a)}"
      placeholder="${ms(t.placeholder||"")}" />
    ${i}
  </div>`}function Or(e,t,{focusTable:s=!1}={}){let a=bn(e,t.values),n=[];for(let i=0;i<a.length;i+=1){let o=a[i],l=a[i+1];o.type==="date"&&l&&l.type==="date"?(n.push(`<div class="field-row">${dn(e,o,t.values)}${dn(e,l,t.values)}</div>`),i+=1):n.push(dn(e,o,t.values))}return`<form id="data-filter-form" autocomplete="off">
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
  </form>`}function fa(e,t,s){let a={...s.values};for(let n of bn(t,a))if(n.type==="checkbox"){let i=e.querySelector(`[name="${n.key}"]`);a[n.key]=!!i?.checked}else if(n.type==="multiselect")a[n.key]=Array.from(e.querySelectorAll(`[name="${n.key}"]:checked`)).map(i=>i.value);else{let i=e.querySelector(`[name="${n.key}"]`);a[n.key]=i?i.value:""}return a}function Gr(e,t){let s={};for(let a of bn(e,t.values)){let n=t.values[a.key];a.type==="checkbox"?s[a.key]=!!n:a.type==="multiselect"?s[a.key]=Array.isArray(n)?n:[]:a.type==="number"?s[a.key]=n===""||n===null?"":Number(n):s[a.key]=n??""}return s}function un(e,t){let s=Gr(e,t);return Array.isArray(t.fuzzyTerms)&&t.fuzzyTerms.length&&(s.keywords=[...t.fuzzyTerms]),(e.id==="postgres"||e.id==="parquet")&&t.sort?.key&&(s.sort=`${t.sort.key}:${t.sort.direction}`,s.schema_preview=!0),t.columnFilters&&Object.keys(t.columnFilters).length>0&&(s.column_filters=t.columnFilters),s}function el(e){if(e.status==="operational")return"";let t=e.status==="unavailable"?"danger":e.status==="degraded"?"warn":"info";return`<div class="sidebar-notice">${He({tone:t,title:`${va(e)} ${Et(e.status).label}`,text:r(e.detail||"\u76EE\u524D\u7121\u6CD5\u4F7F\u7528\u9019\u500B\u8CC7\u6599\u4F86\u6E90\u3002")})}</div>`}function tl(e,t){return`<label class="field data-source-field">
    <span class="field-label">\u8CC7\u6599\u4F86\u6E90</span>
    <select class="select" name="database">
      ${e.map(s=>{let a=Et(s.status);return`<option value="${r(s.id)}" ${s.id===t?"selected":""}>${r(s.label)} \xB7 ${r(a.label)}</option>`}).join("")}
    </select>
  </label>`}function Br(e,t){return`<nav class="data-nav" aria-label="\u8CC7\u6599\u67E5\u8A62\u529F\u80FD">
    ${[{id:"law",label:"\u67E5\u8A62\u6CD5\u898F\u547D\u4EE4",hint:"Fuzzy \u6CD5\u898F\u540D\u7A31\u3001\u985E\u5225\u8207\u547D\u4EE4",icon:"file"},{id:"judgment",label:"\u67E5\u8A62\u5224\u6C7A",hint:"Fuzzy \u6CD5\u9662\u3001\u6848\u865F\u8207\u6848\u7531",icon:"layers"},{id:"schema",label:"\u8CC7\u6599\u5EAB Schema",hint:"\u8CC7\u6599\u8868\u3001\u6B04\u4F4D\u8207\u9810\u89BD",icon:"table"}].map(a=>{let n=a.id==="schema"?t==="schema":t==="query"&&e===a.id;return`<button class="data-nav-item${n?" is-active":""}" type="button"
          data-action="data-nav" data-tab="${a.id}" ${n?'aria-current="page"':""}>
          <span class="data-nav-icon">${f(a.icon,15)}</span>
          <span class="data-nav-copy">
            <strong>${r(a.label)}</strong>
            <small>${r(a.hint)}</small>
          </span>
        </button>`}).join("")}
  </nav>`}function sl(e,t,s){if(t.id!=="postgres"&&t.id!=="parquet")return"";let a=Array.isArray(s.fuzzyTerms)?s.fuzzyTerms:[],n=e==="law"?"Fuzzy \u6CD5\u898F\uFF0F\u547D\u4EE4":"Fuzzy \u5224\u6C7A",i=e==="law"?"\u8F38\u5165\u6CD5\u898F\u540D\u7A31\u6216\u76F8\u8FD1\u5B57\u2026":"\u8F38\u5165\u6CD5\u9662\u3001\u6848\u865F\u3001\u6848\u7531\u6216\u76F8\u8FD1\u5B57\u2026";return`<div class="data-fuzzy" data-data-fuzzy data-fuzzy-kind="${e}">
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
  </div>`}function pn(e,t,s=""){let a=Array.isArray(e.tables)?e.tables:[],n=a.length?a.map(i=>`<button class="schema-item ${String(i.id)===String(s||"")?"is-selected":""}" type="button"
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
  </div>`}function al(e){return{postgres:"PostgreSQL \u67E5\u8A62\u4F7F\u7528\u53C3\u6578\u5316\u689D\u4EF6\u8207\u5206\u9801\uFF0C\u50C5\u8B80\u53D6\u8CC7\u6599\u3002",parquet:"Parquet \u67E5\u8A62\u76F4\u63A5\u6383\u63CF\u76EE\u524D\u6700\u65B0\u7684\u5FEB\u7167\uFF1B\u52FE\u9078\u539F\u59CB JSON \u6703\u589E\u52A0\u56DE\u50B3\u91CF\u8207\u6E32\u67D3\u6642\u9593\u3002",qdrant:"Qdrant \u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\uFF1B\u9700\u8981\u5148\u5B8C\u6210\u5411\u91CF\u7D22\u5F15\u3002\u6AA2\u7D22\u7D50\u679C\u53EA\u5305\u542B\u7D22\u5F15\u4E2D\u5BE6\u969B\u5B58\u5728\u7684\u5224\u6C7A\uFF0C\u4E0D\u6703\u7522\u751F\u865B\u69CB\u8CC7\u6599\u3002",indexeddb:"IndexedDB \u53EA\u5728\u9019\u500B\u700F\u89BD\u5668\u5167\u67E5\u8A62\uFF0C\u4E0D\u6703\u7D93\u904E\u4F3A\u670D\u5668\uFF1B\u6E05\u9664\u7DB2\u7AD9\u8CC7\u6599\u5F8C\u7D00\u9304\u6703\u6D88\u5931\u3002"}[e.id]||r(e.detail||"")}function nl(e){return`<div class="report-empty">
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
  </div>`}function Us(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${r(va(e))} \u67E5\u8A62\u4E2D</div>
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
  </div>`}function ha(e,t){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${r(va(t))} \u67E5\u8A62\u5931\u6557</div>
        <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${He({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u67E5\u8A62\u7D50\u679C",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="retry">
          ${f("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function rl(e){if(!e.length)return'<div class="report-empty-inline">\u9019\u6B21\u67E5\u8A62\u6C92\u6709\u53EF\u5448\u73FE\u7684\u5206\u5E03\u8CC7\u6599\u3002</div>';let t=Math.max(...e.map(s=>Number(s.value)||0),1);return`<div class="distribution">
    ${e.map(s=>{let a=Number(s.value)||0,n=Math.max(1.5,a/t*100);return`<div class="dist-row">
          <span class="dist-label" title="${r(s.label||"\u672A\u5206\u985E")}">${r(s.label||"\u672A\u5206\u985E")}</span>
          <span class="dist-track"><span class="dist-bar" style="width:${n.toFixed(1)}%"></span></span>
          <span class="dist-value">${d(a)}</span>
        </div>`}).join("")}
  </div>`}function Jr(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="law_documents"}function il(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="judgment_documents"}function ol(e){return e&&e.database==="qdrant"&&String(e.table||"").startsWith("judgment")}function ll(e){let t=e._jid||e.jid;return t?`<button class="law-link judgment-link" type="button" data-action="open-judgment"
    data-jid="${r(String(t))}"
    title="\u6AA2\u8996\u300C${r(String(t))}\u300D\u7684\u5224\u6C7A\u539F\u6587">${r(String(t))}${f("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}var cl={jid:"jid",court:"court",court_normalized:"court",title:"title",jdate:"jdate",matched_laws:"matched_laws",citation_count:"citation_count",full_text_length:"full_text_length"};function dl(e,t,s,a=!1,n=!0,i=!1){let o=a?e.key:e.label||e.key,l=n?t?cl[e.key]||e.key:i?e.key:null:null;if(!l)return`<th scope="col">${r(o)}</th>`;let u=s?.key===l,c=u?s.direction:null,m=c==="asc"?"ascending":c==="desc"?"descending":"none",$=c==="asc"?"\u2191":c==="desc"?"\u2193":"\u2195";return`<th scope="col" aria-sort="${m}">
    <button class="table-sort${u?" is-active":""}" type="button"
      data-action="sort-column" data-sort-key="${r(l)}"
      title="\u4F9D${r(o)}\u6392\u5E8F">
      <span>${r(o)}</span>
      <span class="table-sort-icon" aria-hidden="true">${$}</span>
    </button>
  </th>`}function ul(e,t){if(!Jr(e)||!t)return null;let s=t._law_key||t.law_name;if(!s)return null;let a=e.meta?.dataset,n=t._law_source_type||(a&&a!=="all"?a:"");return{lawKey:String(s),sourceType:String(n||""),lawName:String(t.law_name||"")}}function pl(e,t,s){let a=e[t.key];return a==null||a===""?"\u2014":`<button class="law-link" type="button" data-action="open-law"
    data-law-key="${r(s.lawKey)}"
    data-law-source="${r(s.sourceType)}"
    data-law-name="${r(s.lawName)}"
    title="\u6AA2\u8996\u300C${r(String(a))}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${r(String(a))}${f("chevronRight",12,"law-link-icon")}</button>`}function Wr(e,{useColumnKeys:t=!1,sortable:s=!0,sortableAll:a=!1,searchValues:n=null,compact:i=!1}={}){let o=Array.isArray(e.columns)?e.columns:[],l=Array.isArray(e.rows)?e.rows:[],u=(e.page-1)*e.page_size,c=Jr(e),m=il(e),$=ol(e),b=e.meta?.sort||null,p=n?`<tr class="schema-search-row">
        <th scope="col" class="cell-index-head"></th>
        ${o.map(g=>`<th scope="col">
              <div class="schema-search-wrap">
                <input class="schema-search-input" type="search"
                  data-schema-search="${r(g.key)}"
                  value="${r(String(n[g.key]??""))}"
                  placeholder="\u641C\u5C0B ${r(g.key)}"
                  autocomplete="off" />
              </div>
            </th>`).join("")}
      </tr>`:"";return o.length?l.length?`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">${d(l.length)} rows \xB7 \u7B2C ${e.page} \u9801${c?" \xB7 \u9EDE\u9078\u6CD5\u898F\u540D\u7A31\u53EF\u6AA2\u8996\u5B8C\u6574\u689D\u6587":m?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u6B04\u4F4D\u6A19\u984C\u53EF\u6392\u5E8F":$?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u4F9D\u76F8\u4F3C\u5EA6\u6392\u5E8F":""}</span>
    </div>
    <div class="table-wrap">
      <table class="data-table${i?" is-compact":""}">
        <thead>${p}<tr>
          <th scope="col" class="cell-index-head">#</th>
          ${o.map(g=>dl(g,m,b,t,s,a)).join("")}
        </tr></thead>
        <tbody>
          ${l.map((g,y)=>`<tr>
                <td class="cell-mono cell-empty cell-index">${u+y+1}</td>
                ${o.map(_=>{if((m||$)&&_.key==="jid")return`<td class="cell-jid">${ll(g)}</td>`;let q=c&&_.key==="law_name"?ul(e,g):null;if(q)return`<td>${pl(g,_,q)}</td>`;let A={date:"cell-date",datetime:"cell-datetime",duration:"cell-duration",number:"cell-number"}[_.type];return`<td${A?` class="${A}"`:""}>${aa(g[_.key],_.type||"text")}</td>`}).join("")}
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
    </div>`}function ml(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,n=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${n} \u9801 \xB7
      \u986F\u793A ${d(i)}\u2013${d(o)} / ${d(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Qr.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${f("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=n?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${f("chevronRight",13)}</button>
    </div>
  </div>`}function Vr(e){return!Array.isArray(e)||!e.length?"":`<div class="warnings">${e.map(t=>`<div class="warning-line">${r(t)}</div>`).join("")}</div>`}function ba(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.columns)?e.columns:[],a=Array.isArray(e.summary)?e.summary:[],n=Array.isArray(e.distribution)?e.distribution:[],i=Number(e.total)||0,o=e.query_text||"",l=e.database||"",u=e.status||"ok",c=e.meta?.table_label||e.table||e.label||"query result";return`<div class="report-card" data-database="${r(l)}">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT \xB7 ${r(String(l).toUpperCase())}</div>
        <div class="report-title">
          ${r(e.label||l)}
          ${Ye(u)}
          <span class="chip">${r(c)}</span>
        </div>
        <div class="report-sub">
          ${d(i)} \u7B46\u7B26\u5408 \xB7
          ${fe(e.duration_ms)} \xB7
          ${r(String(l).toUpperCase())} / ${r(String(e.table||"\u2014"))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${f("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${f("file",14)}<span>JSON</span></button>
      </div>
    </div>

    ${e.message?`<div class="report-alert">${He({tone:u==="not_configured"?"info":u==="danger"?"danger":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r(e.message)})}</div>`:""}

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
        ${rl(n)}
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
        ${Vr(e.warnings)}
      </div>
    </div>

    ${s.length||t.length?Wr(e,{compact:!0,sortableAll:!0,searchValues:e.meta?.searchable?e.meta.column_filters||{}:null}):""}
    ${i||s.length?ml({...e,total:i,page:Number(e.page)||1,page_size:Number(e.page_size)||25}):""}
  </div>`}function Fr(e){return`<div class="report-card schema-preview">
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
  </div>`}function mn(e,t,{columnFilters:s={},searchEnabled:a=!1}={}){let n=Array.isArray(e.columns)?e.columns:[],i=Array.isArray(e.rows)?e.rows:[],o=e.message?`<div class="report-alert">${He({tone:e.status==="ok"?"info":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r(e.message)})}</div>`:"";return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW \xB7 ${r(String(e.database||"").toUpperCase())}</div>
        <div class="report-title">
          ${r(t||e.table||"\u8CC7\u6599\u8868")}
          ${Ye(e.status||"ok")}
        </div>
        <div class="report-sub">
          ${r(String(e.database||""))} / ${r(String(e.table||"\u2014"))} \xB7 ${n.length} \u6B04\u4F4D \xB7 \u524D ${i.length} \u7B46
        </div>
      </div>
    </div>
    ${o}
    ${Wr({...e,page:1,page_size:10},{useColumnKeys:!0,sortable:!0,sortableAll:!0,searchValues:a?s:null})}
    ${Vr(e.warnings)}
    <div class="schema-preview-footer">
      <span>\u9810\u89BD\u524D ${d(i.length)} \u7B46</span>
      <strong>\u5171 ${d(e.total)} \u7B46</strong>
    </div>
  </div>`}function Hr(e,t){return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW</div>
        <div class="report-title">${r(t||"\u8CC7\u6599\u8868")}</div>
        <div class="report-sub">\u7121\u6CD5\u8B80\u53D6\u8CC7\u6599\u8868\u9810\u89BD\u3002</div>
      </div>
    </div>
    ${He({tone:"danger",title:"\u8B80\u53D6\u5931\u6557",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
  </div>`}function gl(e){return`<div class="report-empty">
    ${pt({iconName:"table",title:"\u9078\u64C7\u8CC7\u6599\u8868\u9810\u89BD",text:`\u5F9E\u5DE6\u5074 ${va(e)} \u7684 Schema \u6E05\u55AE\u9EDE\u9078\u8CC7\u6599\u8868\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6B04\u4F4D\u540D\u7A31\u3001\u524D 10 \u7B46\u8CC7\u6599\u8207\u7E3D\u7B46\u6578\u3002`})}
  </div>`}function gn(e){return e.is_current===!0?Ye("ok","\u73FE\u884C"):e.law_abandon_note?Ye("empty","\u5DF2\u5EE2\u6B62"):e.is_current===!1?Ye("empty","\u6B77\u53F2\u7248\u672C"):Ye("not_configured","\u72C0\u614B\u672A\u63D0\u4F9B")}function rt(e,t){return`<div class="law-meta-item">
    <div class="law-meta-label">${r(e)}</div>
    <div class="law-meta-value">${t||"\u2014"}</div>
  </div>`}function gs(e){return e?zt(e):"\u2014"}function fl(e){return e?.meta?.metadata_source==="postgresql"?"PostgreSQL metadata":e?.meta?.metadata_source==="parquet"?"Parquet snapshot":"\u2014"}function fn(e,t){return t?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">${r(e)}</span>
    </div>
    <div class="law-text-block">${r(String(t).trim())}</div>
  </div>`:""}function bl(e,t,{open:s=!1}={}){return t?`<details class="report-section law-disclosure" data-law-history ${s?"open":""}>
    <summary class="law-disclosure-summary">
      <span class="report-section-title">${r(e)}</span>
      <span class="law-disclosure-hint">\u9810\u8A2D\u6536\u5408 \xB7 \u9EDE\u64CA\u5C55\u958B</span>
      ${f("chevronDown",14,"law-disclosure-chevron")}
    </summary>
    <div class="law-text-block">${r(String(t).trim())}</div>
  </details>`:""}function vl(e){let t=Array.isArray(e)?e:[],s=t.map(a=>{let n=a?.name||a?.url||"";return n?a.url?`<a class="law-attachment" href="${r(a.url)}" target="_blank" rel="noopener noreferrer">
          ${f("file",12)}<span>${r(n)}</span>${f("external",11)}
        </a>`:`<span class="law-attachment">${f("file",12)}<span>${r(n)}</span></span>`:""}).filter(Boolean).join("");return s?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">\u9644\u4EF6</span>
      <span class="muted">${d(t.length)}</span>
    </div>
    <div class="law-attachment-list">${s}</div>
  </div>`:""}function Kr(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function hl(e){let t=Array.isArray(e.articles)?e.articles:[],s=t.filter(o=>o.article_type==="C").length,a=t.length-s,n=s?`${d(a)} \u689D \xB7 ${d(s)} \u7AE0\u7BC0`:`${d(a)} \u689D`,i=t.map(o=>{let l=String(o.article_content||"").trim();if(!l)return"";if(o.article_type==="C")return`<div class="law-chapter">${r(l)}</div>`;let u=Yo[o.article_type]||o.article_type;return`<article class="law-article"
        data-article-no="${r(Kr(o.article_no))}">
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
  </div>`}function $l(){return`<div class="law-jump-float">
    <input class="input law-article-jump-input law-jump-input"
      id="law-article-jump-float" type="text" inputmode="numeric"
      autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
    <button class="btn btn-secondary btn-sm" type="button"
      data-action="jump-article" data-jump-input="law-article-jump-float">\u8DF3\u81F3</button>
  </div>`}function Ss(){return`<button class="btn btn-secondary btn-sm" type="button" data-action="back-to-results">
    ${f("chevronLeft",14)}<span>\u8FD4\u56DE\u67E5\u8A62\u7D50\u679C</span>
  </button>`}function yl(e){return`<div class="law-report">
    <div class="law-report-topbar">
      ${Ss()}
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
  </div>`}function wl(e,t){return`<div class="law-report">
    <div class="law-report-topbar">
      ${Ss()}
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
        ${He({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function _l(e){let t=Array.isArray(e.versions)?e.versions:[];if(t.length<1)return"";let s=e.selected_version_id??"";return`<label class="law-version-select">
    <span>\u689D\u6587\u7248\u672C</span>
    <select class="select" data-action="select-law-version" aria-label="\u9078\u64C7\u6CD5\u898F\u689D\u6587\u7248\u672C">
      ${t.map(a=>{let n=String(a.update_date||"").match(/\d{4}\/\d{1,2}\/\d{1,2}/)?.[0]||"",i=[`#${a.version_id}`,a.is_current?"\u76EE\u524D":"\u6B77\u53F2",n,a.article_count_for_law?`${d(a.article_count_for_law)} \u7B46`:"\u7121\u689D\u6587\u5FEB\u7167"].filter(Boolean).join(" \xB7 ");return`<option value="${r(a.version_id)}" ${String(a.version_id)===String(s)?"selected":""}>${r(i)}</option>`}).join("")}
    </select>
  </label>`}function kl(e){let t=e.change_summary||{},s=Object.values(t).reduce((o,l)=>o+(Number(l)||0),0),a=Array.isArray(e.changes)?e.changes:[];if(!e.changes_available&&!s)return"";let n={added:"\u65B0\u589E",modified:"\u4FEE\u6539",removed:"\u79FB\u9664"},i=["added","modified","removed"].map(o=>`${n[o]} ${d(t[o]||0)}`).join(" \xB7 ");return`<details class="report-section law-version-changes">
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
  </details>`}function Sl(e,{database:t="",lawPage:s=1,historyOpen:a=!1}={}){let n=Array.isArray(e.warnings)?e.warnings:[],i=e.law_name||e.law_key||"\u6CD5\u898F",o=(Array.isArray(e.articles)?e.articles:[]).filter(y=>y.article_type!=="C").length,l=fl(e),u=e.meta?.articles_source==="postgresql"?"PostgreSQL \u689D\u6587\u7248\u672C":e.meta?.articles_source==="parquet"?"Parquet \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",c=e.meta?.snapshot||"",m=e.meta?.articles_source==="postgresql"&&e.selected_version_id!==null&&e.selected_version_id!==void 0?`\u689D\u6587\u7248\u672C #${e.selected_version_id}`:"",$=[l,u,m,c].filter(Boolean).join(" \xB7 "),b=e.source_type==="law"?"\u6CD5\u5F8B":e.source_type==="order"?"\u547D\u4EE4":e.source_type||"\u2014",p=e.version||{},g=[rt("\u6CD5\u898F\u4F4D\u968E",r(e.law_level||"\u2014")),rt("\u6CD5\u898F\u985E\u5225",r(e.law_category||"\u2014")),rt("\u7570\u52D5\u65E5\u671F",gs(e.law_modified_date)),rt("\u751F\u6548\u65E5\u671F",gs(e.law_effective_date)),rt("\u689D\u6587\u6578",d(e.article_count)),rt("\u8CC7\u6599\u72C0\u614B",gn(e)),rt("\u82F1\u8B6F\u540D\u7A31",r(e.eng_law_name||"\u2014")),rt("\u6CD5\u898F\u8B58\u5225",`<span class="mono">${r(e.law_key||"\u2014")}</span>`)];return p.first_seen_version_id!==null&&p.first_seen_version_id!==void 0&&g.push(rt("\u9996\u6B21\u6536\u9304\u7248\u672C",`#${r(p.first_seen_version_id)}`)),p.last_seen_version_id!==null&&p.last_seen_version_id!==void 0&&g.push(rt("\u6700\u5F8C\u6536\u9304\u7248\u672C",`#${r(p.last_seen_version_id)}`)),p.last_seen_at&&g.push(rt("\u6700\u5F8C\u6536\u9304\u6642\u9593",r($e(p.last_seen_at)))),p.selected_version_id!==null&&p.selected_version_id!==void 0&&g.push(rt("\u689D\u6587\u7248\u672C",`#${r(p.selected_version_id)} \xB7 ${e.meta?.selected_version_is_current?"\u76EE\u524D":"\u6B77\u53F2"}`)),`<div class="law-report">
    <div class="law-report-topbar">
      ${Ss()}
      <span class="law-report-origin" title="${r($)}">${r($)}</span>
    </div>
    <div class="report-card law-report-card" data-database="${r(t)}">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT \xB7 ${r(String(t||l).toUpperCase())}</div>
          <div class="report-title">
            ${r(i)}
            ${gn(e)}
            <span class="chip">${r(b)}</span>
          </div>
          <div class="report-sub">
            ${r([e.law_level,e.law_category].filter(Boolean).join(" \xB7 ")||"\u2014")} \xB7 ${d(e.article_count)} \u689D \xB7 \u7570\u52D5 ${gs(e.law_modified_date)}
          </div>
        </div>
        <div class="report-actions">
          ${_l(e)}
          ${e.law_url?`<a class="btn btn-secondary btn-sm" href="${r(e.law_url)}" target="_blank" rel="noopener noreferrer">${f("external",14)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:""}
        </div>
      </div>

      ${n.length?`<div class="report-alert">${He({tone:e.status==="degraded"?"warn":"info",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n.map(y=>r(y)).join("<br />")})}</div>`:""}

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u689D\u6587\u6578</div>
          <div class="summary-value">${d(e.article_count)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u7570\u52D5\u65E5\u671F</div>
          <div class="summary-value">${gs(e.law_modified_date)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u6CD5\u898F\u4F4D\u968E</div>
          <div class="summary-value">${r(e.law_level||"\u2014")}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u76EE\u524D\u72C0\u614B</div>
          <div class="summary-value">${gn(e)}</div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u6CD5\u898F\u8CC7\u8A0A</span>
          <span class="muted" style="font-size:9.5px">${r(l)}</span>
        </div>
        <div class="law-meta-grid">${g.join("")}</div>
      </div>

      ${kl(e)}
      ${fn("\u6CD5\u898F\u524D\u8A00",e.law_foreword)}
      ${bl("\u6CD5\u898F\u6CBF\u9769",e.law_histories,{open:a})}
      ${fn("\u751F\u6548\u8AAA\u660E",e.law_effective_note)}
      ${fn("\u5EE2\u6B62\u8AAA\u660E",e.law_abandon_note)}
      ${vl(e.attachments)}
      ${hl(e)}
    </div>
    ${o>100?$l():""}
  </div>`}function xl(e){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${Ss()}
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
  </div>`}function Al(e,t){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${Ss()}
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
        ${He({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function ql(e){let t=String(e||"").trim();return t?`<button class="law-link judgment-citation-law" type="button"
    data-action="open-law"
    data-law-key="${r(t)}"
    data-law-source=""
    data-law-name="${r(t)}"
    title="\u6AA2\u8996\u300C${r(t)}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${r(t)}${f("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}function Ml(e){let t=new Map;for(let s of Array.isArray(e.citations)?e.citations:[]){let a=String(s.law_name||"").trim();if(!a)continue;t.has(a)||t.set(a,new Set);let n=String(s.article_no||"").trim();n&&t.get(a).add(n)}return t.size?`<div class="judgment-citation-groups">
    ${[...t.entries()].map(([s,a])=>`<div class="judgment-citation-group">
          ${ql(s)}
          <span class="judgment-citation-articles">${[...a].map(n=>r(n)).join("\u3001")||"\u2014"}</span>
        </div>`).join("")}
  </div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5F15\u7528\u660E\u7D30\u3002</div>'}function Ll(e,{database:t="postgres"}={}){let s=Array.isArray(e.matched_laws)?e.matched_laws:[],a=e.title||e.jid||"\u5224\u6C7A",n=String(e.full_text||""),i=Number(e.full_text_length)||n.length||0,o=["PostgreSQL \u5224\u6C7A\u6587\u4EF6",e.source_archive].filter(Boolean).join(" \xB7 "),l=[rt("\u6848\u865F",r(e.jid||"\u2014")),rt("\u5E74\u5EA6",r(e.jyear||"\u2014")),rt("\u5B57\u5225",r(e.jcase||"\u2014")),rt("\u865F\u78BC",r(e.jno||"\u2014")),rt("\u6CD5\u9662",r(e.court||"\u2014")),rt("\u6848\u7531",r(e.title||"\u2014")),rt("\u88C1\u5224\u65E5\u671F",gs(e.jdate)),rt("\u4F86\u6E90\u58D3\u7E2E\u6A94",r(e.source_archive||"\u2014")),rt("\u5168\u6587\u9577\u5EA6",`${d(i)} \u5B57`),rt("\u5F15\u7528\u6578",d(e.citation_count))];return e.import_run_id!==null&&e.import_run_id!==void 0&&l.push(rt("\u532F\u5165 Run",`#${r(e.import_run_id)}`)),`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${Ss()}
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
            ${r(e.court||"\u2014")} \xB7 ${gs(e.jdate)} \xB7
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
          <div class="summary-value">${gs(e.jdate)}</div>
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
        ${Ml(e)}
      </div>

      <div class="report-section judgment-text-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5224\u6C7A\u539F\u6587</span>
          <span class="muted">${d(i)} \u5B57</span>
        </div>
        ${n?`<div class="judgment-fulltext">${r(n)}</div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5168\u6587\u3002</div>'}
      </div>
    </div>
  </div>`}function zr(e){return`"${(e==null?"":typeof e=="object"?JSON.stringify(e):String(e)).replace(/"/g,'""')}"`}function $a(e){let t=e.columns||[],s=e.rows||[],a=[["#",...t.map(i=>i.label||i.key)].map(zr).join(",")],n=((Number(e.page)||1)-1)*(Number(e.page_size)||25);return s.forEach((i,o)=>{a.push([n+o+1,...t.map(l=>i[l.key])].map(zr).join(","))}),`\uFEFF${a.join(`\r
`)}`}function ya(e){return{...e,rows:(e.rows||[]).map(t=>{let s={};for(let[a,n]of Object.entries(t))a.startsWith("_")||(s[a]=n);return s})}}function jl(e){return e==="rag"?"RAG \u63D0\u554F":e==="data"?"\u8CC7\u6599\u67E5\u8A62":e||"\u5176\u4ED6"}async function Ur(e,t){let s=performance.now(),a=Gr(e,t),n=String(a.store||"query_history"),i=String(a.keyword||""),o=t.page,l=t.pageSize,u=[],c=[],m=[],$=[];if(n==="audit_events"){try{let A=Number(await os("audit.last_event_id",0))||0,U=await K.versioningAudit({since_id:A,limit:500}),V=Array.isArray(U?.events)?U.events:[];V.length&&await wr(V.map(ke=>({...ke,dataset:"judgment"})));let J=Number(U?.latest_event_id||0);J>A&&await Hs("audit.last_event_id",J)}catch(A){u.push(`\u7248\u672C audit \u540C\u6B65\u5931\u6557\uFF1A${A.message||A}`)}c=(await _r({keyword:i,limit:Dr})).map(A=>({created_at:A.created_at,dataset:A.dataset,issue_month:A.issue_month,change_type:A.change_type,jid:A.jid,detail:A.detail})),m=[{key:"created_at",label:"\u6642\u9593",type:"datetime"},{key:"dataset",label:"\u8CC7\u6599\u96C6",type:"text"},{key:"issue_month",label:"\u6708\u4EFD",type:"mono"},{key:"change_type",label:"\u8B8A\u66F4",type:"status"},{key:"jid",label:"\u6848\u865F",type:"mono"},{key:"detail",label:"\u6458\u8981",type:"longtext"}];let M=new Map;c.forEach(A=>M.set(A.change_type||"unknown",(M.get(A.change_type||"unknown")||0)+1)),$=Array.from(M.entries()).map(([A,U])=>({label:A,value:U})).sort((A,U)=>U.value-A.value)}else if(n==="settings"){c=(await Sr({keyword:i})).map(A=>({key:A.key,value:xr(A.value),updated_at:A.updated_at})),m=[{key:"key",label:"\u8A2D\u5B9A\u9375",type:"mono"},{key:"value",label:"\u503C",type:"longtext"},{key:"updated_at",label:"\u66F4\u65B0\u6642\u9593",type:"datetime"}];let M=new Map;c.forEach(A=>{let U=String(A.key||"").split(".")[0]||"\u5176\u4ED6";M.set(U,(M.get(U)||0)+1)}),$=Array.from(M.entries()).map(([A,U])=>({label:A,value:U})).sort((A,U)=>U.value-A.value)}else{c=(await da({keyword:i,limit:Dr})).map(A=>({kind:jl(A.kind),title:A.title,detail:A.detail,created_at:A.created_at})),m=[{key:"kind",label:"\u985E\u578B",type:"text"},{key:"title",label:"\u67E5\u8A62\u5167\u5BB9",type:"longtext"},{key:"detail",label:"\u6458\u8981",type:"longtext"},{key:"created_at",label:"\u6642\u9593",type:"datetime"}];let M=new Map;c.forEach(A=>M.set(A.kind,(M.get(A.kind)||0)+1)),$=Array.from(M.entries()).map(([A,U])=>({label:A,value:U})).sort((A,U)=>U.value-A.value)}let b=c.length,p=(o-1)*l,g=c.slice(p,p+l),y=Math.round(performance.now()-s),_=hr();return _&&u.push("IndexedDB \u7121\u6CD5\u4F7F\u7528\uFF0C\u8CC7\u6599\u66AB\u5B58\u5728\u8A18\u61B6\u9AD4\uFF0C\u91CD\u65B0\u6574\u7406\u5F8C\u6703\u6D88\u5931\u3002"),{database:"indexeddb",label:"IndexedDB",status:_?"degraded":"ok",message:_?"\u700F\u89BD\u5668\u4E0D\u5141\u8A31\u4F7F\u7528 IndexedDB\uFF0C\u672C\u9801\u6539\u7528\u8A18\u61B6\u9AD4\u66AB\u5B58\u3002":null,table:n,columns:m,rows:g,total:b,page:o,page_size:l,duration_ms:y,summary:[{label:"\u7B26\u5408\u7B46\u6578",value:String(b)},{label:"\u76EE\u524D\u9801\u9762",value:`${g.length} \u7B46`},{label:"\u5132\u5B58\u6A21\u5F0F",value:Os()==="indexeddb"?"IndexedDB":"\u8A18\u61B6\u9AD4"},{label:"\u67E5\u8A62\u8017\u6642",value:`${y} ms`}],distribution:$,query_text:`INDEXEDDB OPEN 'judgment-console'
OBJECT STORE '${n}'
FILTER ${i?`keyword \u2248 '${i}'`:"1 = 1"}
ORDER BY created_at DESC
LIMIT ${l} OFFSET ${p}`,warnings:u,meta:{store:n,filters:a,client_side:!0}}}async function Tl(e,t){let s=!1,a=null,n=[],i="law",o=null,l={},u=0,c=25,m="query",$=null,b=null,p=0,g=[],y=null,_=-1,q=0,M=0,A=null,U=null,V=null;e.innerHTML=`<section class="page data-page">
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
      ${Qt(null,{loading:!0})}
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
  </section>`;let J=e.querySelector("#query-sidebar"),ke=e.querySelector("#data-nav"),Se=e.querySelector("#db-options-wrap"),F=e.querySelector("#filter-area"),T=e.querySelector("#schema-area"),S=e.querySelector("#query-main"),E=e.querySelector("#schema-suggest-popover"),se=e.querySelector("#catalog-meta"),le=e.querySelector("#refresh-catalog"),Q=e.querySelector("#data-judgment-stats"),pe=x=>n.find(L=>L.id===x),ye=()=>pe(i)?.databases||[],I=x=>ye().find(L=>L.id===x),we=(x,L)=>`${x}:${L}`,G=(x,L=i)=>l[we(L,x.id)],he=(x,L)=>{Hs(x,L).catch(()=>{})},Te=()=>{if(!a){se.textContent="CATALOG \xB7 \u96E2\u7DDA",se.className="badge badge-danger badge-mono";return}let x=ye(),L=x.filter(O=>O.available).length,N=pe(i);se.textContent=`CATALOG \xB7 ${N?.label||i} \xB7 ${L}/${x.length} \u53EF\u7528`,se.className="badge badge-neutral badge-mono"},ne=x=>{S.innerHTML=nl(x)},me=()=>{let x=U?.returnScroll??V?.returnScroll;U=null,V=null;let L=I(o),N=L?G(L):null;m==="schema"&&b?.result?S.innerHTML=mn(b.result,Fe(L,b.tableId),{columnFilters:b.columnFilters||{},searchEnabled:L.id==="postgres"||L.id==="parquet"}):N?.result?S.innerHTML=ba(N.result):L&&ne(L),typeof x=="number"&&window.requestAnimationFrame(()=>window.scrollTo({top:x,behavior:"smooth"}))},ge=(x="law-article-jump")=>{let L=S.querySelector(`#${x}`),N=Kr(L?.value);if(!N){C("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),L?.focus();return}let Y=[...S.querySelectorAll("[data-article-no]")].find(X=>X.dataset.articleNo===N);if(!Y){C(`\u627E\u4E0D\u5230\u7B2C ${N} \u689D\u3002`,"warn");return}Y.scrollIntoView({behavior:"instant",block:"center"}),Y.classList.add("is-jump-target"),window.setTimeout(()=>Y.classList.remove("is-jump-target"),2400)},Le=async({lawKey:x,sourceType:L="",lawName:N="",versionId:O=""})=>{let Y=I(o),X=Y?G(Y):null,ue=m==="schema"?b?.result:null;if(!Y||!X?.result&&!ue||!x)return;let Re=++u;U={seq:Re,lawKey:x,sourceType:L,lawName:N,versionId:O?String(O):"",page:1,detail:null,database:Y.id,returnScroll:window.scrollY},V=null,S.innerHTML=yl(N||x),S.scrollIntoView({behavior:"smooth",block:"start"});try{let De=await K.lawDetail(x,L,U.versionId);if(s||!U||U.seq!==Re)return;U.detail=De,U.page=1,S.innerHTML=Sl(De,{database:U.database,lawPage:U.page})}catch(De){if(s||!U||U.seq!==Re)return;S.innerHTML=wl(De,N||x),C(De.message||"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868\u3002","danger")}},be=async({jid:x})=>{let L=I(o),N=L?G(L):null,O=m==="schema"?b?.result:null;if(!L||!N?.result&&!O||!x)return;let Y=++u;U=null;let X=L.id==="parquet"?"parquet":"postgres";V={seq:Y,jid:x,detail:null,database:L.id,source:X,returnScroll:window.scrollY},S.innerHTML=xl(x),S.scrollIntoView({behavior:"smooth",block:"start"});try{let ue=await K.judgmentDetail(x,X);if(s||!V||V.seq!==Y)return;V.detail=ue,S.innerHTML=Ll(ue,{database:V.database})}catch(ue){if(s||!V||V.seq!==Y)return;S.innerHTML=Al(ue,x),C(ue.message||"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587\u3002","danger")}},Ee=(x,L)=>`${i}:${x.id}:${L}`,Fe=(x,L)=>(x.tables||[]).find(N=>N.id===L)?.label||L,et=(x,L,{sort:N=null,columnFilters:O={}}={})=>{let Y={column_filters:O};return x.id==="postgres"?(Y.table=L,Y.schema_preview=!0):x.id==="parquet"&&i==="judgment"?(Y.table="judgment_documents",Y.columns=Ko):x.id==="parquet"&&(Y.dataset="all",Y.columns=Vo),N?.key&&(Y.sort=`${N.key}:${N.direction}`),Y},P=async(x,L,{sort:N=null,columnFilters:O={},quiet:Y=!1}={})=>{if(!L)return;lt();let X=Ee(x,L),ue=++p,Re=!!(Y&&b?.result&&b.key===X);$={tableId:L},b={key:X,tableId:L,loading:!0,result:null,error:null,sort:N,columnFilters:O},Re?S.setAttribute("aria-busy","true"):(T.innerHTML=pn(x,pe(i)?.label||i,L),S.innerHTML=Fr(Fe(x,L)));try{let De;if(x.id==="indexeddb"){let xe=ga(x,10);xe.values.store=L,xe.page=1,De=await Ur(x,xe)}else x.id==="qdrant"?De={database:"qdrant",label:"Qdrant",status:"not_configured",message:"Qdrant collection \u9700\u8981\u8A9E\u610F\u67E5\u8A62\uFF1BSchema \u50C5\u63D0\u4F9B collection \u540D\u7A31\uFF0C\u4E0D\u5217\u51FA\u524D 10 \u7B46\u8CC7\u6599\u3002",table:L,columns:[],rows:[],total:0,page:1,page_size:10,duration_ms:0,summary:[],distribution:[],query_text:"",warnings:[],meta:{}}:(De=await K.query({database:x.id,filters:et(x,L,{sort:N,columnFilters:O}),page:1,pageSize:10}),N?.key&&(De.meta={...De.meta||{},sort:N}));if(s||ue!==p)return;b={key:X,tableId:L,loading:!1,result:De,error:null,sort:N,columnFilters:O},S.removeAttribute("aria-busy"),m==="schema"&&$?.tableId===L&&(T.innerHTML=pn(x,pe(i)?.label||i,L),S.innerHTML=mn(De,Fe(x,L),{columnFilters:O,searchEnabled:x.id==="postgres"||x.id==="parquet"}))}catch(De){if(s||ue!==p)return;b={key:X,tableId:L,loading:!1,result:null,error:De,sort:N,columnFilters:O},S.removeAttribute("aria-busy"),m==="schema"&&$?.tableId===L&&(S.innerHTML=Hr(De,Fe(x,L)))}},B=()=>{let x=I(o);if(!x)return null;if(m==="schema"&&b?.result)return{db:x,tableId:b.tableId,columnFilters:b.columnFilters||{},sort:b.sort||null,mode:"schema"};let L=x?G(x):null,N=L?.result;return N&&(x.id==="postgres"||x.id==="parquet")?{db:x,tableId:N.table,columnFilters:L.columnFilters||{},sort:L.sort||null,mode:"query"}:null},w=(x,L,N)=>{if(!x)return;let O=`${x.db.id}:${x.tableId}:${L}`,Y=j.get(O);Y&&(window.clearTimeout(Y),j.delete(O)),lt();let X={...x.columnFilters||{}},ue=String(N||"").trim();if(ue?X[L]=ue:delete X[L],x.mode==="schema"){P(x.db,x.tableId,{sort:x.sort,columnFilters:X,quiet:!0});return}let Re=G(x.db);Re.columnFilters=X,Re.page=1,Xe(1)},j=new Map,W=()=>{(!E||E.hidden)&&!g.length&&!y||(q+=1,g=[],y=null,_=-1,E&&(E.hidden=!0,E.innerHTML=""))},H=(x,L)=>{let N=String(x||""),O=N.toLocaleLowerCase(),Y=String(L||"").toLocaleLowerCase(),X=new Array(N.length).fill(!1),ue=(Ge,tt)=>{for(let it=Ge;it<Ge+tt;it+=1)it>=0&&it<X.length&&(X[it]=!0)},Re=O.indexOf(Y);if(Re>=0)for(;Re>=0;)ue(Re,Y.length),Re=O.indexOf(Y,Re+Y.length);else{let Ge=[];for(let tt of Y.match(/[一-鿿]{2,}/g)||[])for(let it=0;it<tt.length-1;it+=1)Ge.push(tt.slice(it,it+2));Ge.push(...Y.match(/[a-z0-9]+/g)||[]);for(let tt of Ge){let it=O.indexOf(tt);for(;it>=0;)ue(it,tt.length),it=O.indexOf(tt,it+tt.length)}}let De="",xe=0;for(;xe<N.length;)if(X[xe]){let Ge=xe;for(;Ge<N.length&&X[Ge];)Ge+=1;De+=`<mark>${r(N.slice(xe,Ge))}</mark>`,xe=Ge}else{let Ge=xe;for(;Ge<N.length&&!X[Ge];)Ge+=1;De+=r(N.slice(xe,Ge)),xe=Ge}return De||r(N)},Oe=(x,L)=>{if(!E)return;let N=x.getBoundingClientRect(),O=Math.min(420,Math.max(220,N.width)),Y=Math.min(360,34+L*30),X=N.bottom+4;X+Y>window.innerHeight-8&&(X=Math.max(8,N.top-Y-4));let ue=Math.min(window.innerWidth-O-8,Math.max(8,N.left));E.style.width=`${O}px`,E.style.left=`${ue}px`,E.style.top=`${X}px`},Ce=x=>{if(!E)return;let L=[...E.querySelectorAll(".schema-suggest-item")];L.length&&(_=Math.max(0,Math.min(L.length-1,x)),L.forEach((N,O)=>{N.classList.toggle("is-active",O===_)}),L[_].scrollIntoView({block:"nearest"}))},Pe=x=>{let L=g[x],N=y;!L||!N||(W(),w(N,N.column,L))},st=async(x,L,N,O)=>{if(!x||!N.trim()){W();return}let Y=++q;y={...x,column:L,input:O},_=-1;try{let X=await K.schemaSuggest({database:x.db.id,table:x.tableId,column:L,query:N,limit:1e3});if(Y!==q||document.activeElement!==O||!E)return;let ue=Array.isArray(X.values)?X.values:[];if(g=ue,!ue.length){W();return}let Re=Number(X.total)>ue.length?`\u5171 ${d(X.total)} \u500B\u7B26\u5408\uFF0C\u986F\u793A\u524D ${d(ue.length)} \u500B`:`\u5171 ${d(X.total)} \u500B\u7B26\u5408`;E.innerHTML=`<div class="schema-suggest-head">${r(Re)}</div>${ue.map((De,xe)=>`<button class="schema-suggest-item" type="button"
            data-schema-suggest-index="${xe}"
            title="${r(De)}">${H(De,N)}</button>`).join("")}`,Oe(O,ue.length),E.hidden=!1}catch{W()}},lt=()=>{let x=document.activeElement;x instanceof HTMLElement&&x.matches("[data-schema-search]")&&x.blur(),W()},ot=(x,{resetReport:L=!1}={})=>{lt();let N=G(x);if(ke.innerHTML=Br(i,m),Se.innerHTML=tl(ye(),x.id),m==="schema")F.hidden=!0,F.innerHTML="",T.hidden=!1,T.innerHTML=`<div class="schema-category-switch" role="tablist" aria-label="Schema \u985E\u5225">
        ${["law","judgment"].map(O=>{let Y=n.find(X=>X.id===O);return Y?`<button class="chip${i===O?" is-active":""}" type="button" role="tab" aria-selected="${i===O}" data-action="schema-category" data-category="${O}">${r(Y.label)}</button>`:""}).join("")}
      </div>${pn(x,pe(i)?.label||i,$?.tableId||"")}`;else{T.hidden=!0,T.innerHTML="",F.hidden=!1;let O=sl(i,x,N),Y=Or(x,N);F.innerHTML=`${el(x)}${O?`${O}<details class="data-advanced"><summary>\u9032\u968E metadata \u689D\u4EF6</summary>${Y}</details>`:Y}<div class="sidebar-note">${al(x)}</div>`}if(Te(),m==="schema"){let O=$?Ee(x,$.tableId):"";if(b&&b.key===O){let Y=Fe(x,b.tableId);b.loading?S.innerHTML=Fr(Y):b.error?S.innerHTML=Hr(b.error,Y):S.innerHTML=mn(b.result,Y,{columnFilters:b.columnFilters||{},searchEnabled:x.id==="postgres"||x.id==="parquet"})}else S.innerHTML=gl(x);return}L?ne(x):N.result?S.innerHTML=ba(N.result):ne(x)},Ve=(x,{persist:L=!0,resetReport:N=!1}={})=>{let O=ye(),Y=O.find(ue=>ue.id===x)||O[0];if(!Y)return;U=null,V=null,$=null,b=null,p+=1,o=Y.id;let X=we(i,Y.id);l[X]||(l[X]=ga(Y,c)),ot(Y,{resetReport:N}),L&&(he(`data.last_database.${i}`,Y.id),he("data.last_category",i))},jt=(x,{persist:L=!0,resetReport:N=!0,databaseId:O=null}={})=>{let Y=pe(x)||n[0];if(!Y)return;i=Y.id,U=null,V=null;let X=Y.databases||[],ue=O&&X.find(Re=>Re.id===O)||X.find(Re=>Re.id===o)||X[0];if(o=ue?.id||null,!ue){ke.innerHTML=Br(i,m),Se.innerHTML=`<div class="sidebar-notice">${He({tone:"warn",title:"\u6C92\u6709\u53EF\u7528\u7684\u8CC7\u6599\u4F86\u6E90",text:"\u9019\u500B\u985E\u5225\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u5EAB\u9078\u9805\u3002"})}</div>`,F.innerHTML="",Te();return}Ve(ue.id,{persist:!1,resetReport:N}),L&&(he("data.last_category",Y.id),he(`data.last_database.${Y.id}`,ue.id))},nt=x=>{let L=G(x),N=F.querySelector("#data-filter-form");N&&(L.values=fa(N,x,L))},Xe=async(x=null,{quiet:L=!1}={})=>{let N=I(o);if(!N)return;lt();let O=G(N);nt(N),x!==null&&(O.page=x),(!Number.isFinite(O.page)||O.page<1)&&(O.page=1);let Y=++u;U=null,V=null;let X=S.querySelector(".report-card"),ue=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!X?S.setAttribute("aria-busy","true"):(S.removeAttribute("aria-busy"),S.innerHTML=Us(N));let De=F.querySelector("#run-query");L||Ne(De,!0,"\u67E5\u8A62\u4E2D\u2026");try{let xe;if(N.id==="indexeddb"?xe=await Ur(N,O):xe=await K.query({database:N.id,filters:un(N,O),page:O.page,pageSize:O.pageSize}),s||Y!==u)return;if(xe.meta={...xe.meta||{},column_filters:O.columnFilters||{},searchable:N.id==="postgres"||N.id==="parquet",sort:O.sort||xe.meta?.sort||null},O.result=xe,O.page=Number(xe.page)||O.page,O.pageSize=Number(xe.page_size)||O.pageSize,S.removeAttribute("aria-busy"),S.innerHTML=ba(xe),ue!==null){let tt=S.querySelector("[data-page-size]");tt&&(tt.value=String(O.pageSize),tt.focus({preventScroll:!0}))}let Ge=pe(i)?.label||i;await Bs({kind:"data",title:`${Ge} \xB7 ${N.label} \xB7 ${xe.table||xe.label||"query"}`,detail:`${d(xe.total)} \u7B46 \xB7 ${fe(xe.duration_ms)}`,payload:{category:i,database:N.id,filters:un(N,O),page:O.page,page_size:O.pageSize}}),he("data.last_query",{category:i,database:N.id,filters:un(N,O),page:O.page,page_size:O.pageSize,at:new Date().toISOString()})}catch(xe){if(s||Y!==u)return;S.removeAttribute("aria-busy"),S.innerHTML=ha(xe,N),C(xe.message||"\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{!s&&Y===u&&Ne(De,!1)}},Pt=(x,L)=>{let N=x?.querySelector("[data-data-fuzzy-results]");N&&(N.innerHTML=L.length?L.map(O=>`<button class="data-fuzzy-option" type="button" role="option" data-action="select-fuzzy-term" data-term="${r(O.value)}"><span>${r(O.label||O.value)}</span><small>${r(O.meta||"")}</small></button>`).join(""):'<div class="data-fuzzy-empty">\u6C92\u6709\u76F8\u8FD1\u7D50\u679C\uFF1B\u6309 Enter \u53EF\u76F4\u63A5\u52A0\u5165\u76EE\u524D\u8F38\u5165\u7684\u95DC\u9375\u5B57\u3002</div>')},te=async(x,L="")=>{if(!x)return;let N=I(o),O=N?G(N):null;if(!O)return;let Y=x.dataset.fuzzyKind||i,X=x.querySelector("[data-data-fuzzy-results]"),ue=++M;X&&(X.innerHTML='<div class="data-fuzzy-loading"><span class="spinner"></span><span>\u641C\u5C0B\u76F8\u8FD1\u7D50\u679C\u2026</span></div>');try{let Re=await K.dataSuggest({kind:Y,query:L,limit:12});if(ue!==M)return;let De=(Re.suggestions||[]).filter(xe=>!O.fuzzyTerms.includes(xe.value));Pt(x,De)}catch(Re){if(ue!==M)return;X&&(X.innerHTML=`<div class="data-fuzzy-empty">${r(Re.message||"\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},Ae=(x,{focus:L=!1}={})=>{if(!x)return;let N=x.querySelector("[data-data-fuzzy-popover]"),O=x.querySelector("[data-data-fuzzy-search]");!N||!O||(N.hidden&&(N.hidden=!1,O.value="",te(x,"")),L&&(O.focus(),O.select()))},We=x=>{A&&(window.clearTimeout(A),A=null);let L=x?.querySelector("[data-data-fuzzy-popover]");L&&(L.hidden=!0)},Ze=async x=>{let L=I(o);if(!L)return;let N=G(L),O=String(x||"").trim();!O||N.fuzzyTerms.includes(O)||(N.fuzzyTerms=[...N.fuzzyTerms,O],We(F.querySelector("[data-data-fuzzy]")),ot(L),await Xe(1))},It=async x=>{let L=I(o);if(!L)return;let N=G(L),O=String(x||"").trim();N.fuzzyTerms=N.fuzzyTerms.filter(Y=>Y!==O),ot(L),await Xe(1)},Tt=async()=>{le.disabled=!0,Ne(le,!0,"\u6574\u7406\u4E2D\u2026");try{let[x,L,N,O,Y]=await Promise.all([K.catalog(),os("data.last_category","law"),os("data.last_database.law","postgres"),os("data.last_database.judgment","postgres"),os("data.page_size",25)]);if(s)return;a=x,Q&&(Q.innerHTML=Qt(a.judgment_stats)),n=Array.isArray(a.categories)?a.categories:[],c=Qr.includes(Number(Y))?Number(Y):25;for(let xe of n)for(let Ge of xe.databases||[]){let tt=we(xe.id,Ge.id);l[tt]||(l[tt]=ga(Ge,c))}let X=n.find(xe=>xe.id===L)||n[0];if(!X){ke.innerHTML="",Se.innerHTML=`<div class="sidebar-notice">${He({tone:"danger",title:"\u6C92\u6709\u53EF\u7528\u7684\u5206\u985E",text:"Catalog \u6C92\u6709\u56DE\u50B3\u6CD5\u898F\u547D\u4EE4\u6216\u5224\u6C7A\u5206\u985E\u3002"})}</div>`;return}let ue=X.id==="judgment"?O:N;if(i=X.id,o=null,jt(X.id,{persist:!1,resetReport:!0,databaseId:ue}),s)return;let Re=I(o),De=Re?G(Re):null;Re&&De&&m==="query"&&!De.result&&(Re.id==="postgres"||Re.id==="parquet")&&Xe(1),C("\u8CC7\u6599\u5EAB catalog \u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(x){if(s)return;a=null,n=[],ke.innerHTML="",Q&&(Q.innerHTML=Qt(null)),Te(),Se.innerHTML=`<div class="sidebar-notice">${He({tone:"danger",title:"\u7121\u6CD5\u8B80\u53D6 catalog",text:r(x.message||"\u8ACB\u78BA\u8A8D API \u662F\u5426\u555F\u52D5\u3002")})}
      <button class="btn btn-secondary btn-sm" type="button" id="catalog-retry" style="margin-top:10px">
        ${f("refresh",14)}<span>\u91CD\u8A66</span>
      </button></div>`,S.innerHTML=`<div class="report-empty">${pt({iconName:"server",title:"API \u76EE\u524D\u7121\u6CD5\u9023\u7DDA",text:"\u67E5\u8A62\u5831\u8868\u9700\u8981 FastAPI \u63D0\u4F9B catalog \u8207\u8CC7\u6599\u67E5\u8A62 API\u3002\u8ACB\u78BA\u8A8D judgment-web \u5DF2\u555F\u52D5\u3002"})}</div>`}finally{s||(le.disabled=!1,Ne(le,!1))}};J.addEventListener("change",x=>{let L=x.target;if(L.name==="category"){jt(L.value);return}if(L.name==="database"){Ve(L.value);let X=I(o),ue=X?G(X):null;X&&ue&&!ue.result&&m==="query"&&(X.id==="postgres"||X.id==="parquet")&&Xe(1);return}let N=I(o);if(!N)return;let O=G(N),Y=F.querySelector("#data-filter-form");!Y||!L.name||(O.values=fa(Y,N,O),O.page=1,L.name==="table"&&(U=null,V=null,O.sort=null,O.columnFilters={},O.result=null,F.innerHTML=Or(N,O),ne(N)))}),J.addEventListener("input",x=>{let L=x.target.closest("[data-data-fuzzy-search]");if(L){let X=L.closest("[data-data-fuzzy]");A&&window.clearTimeout(A),A=window.setTimeout(()=>{te(X,L.value)},160);return}let N=I(o);if(!N)return;let O=F.querySelector("#data-filter-form");if(!O||!x.target.name||x.target.name==="table")return;let Y=G(N);Y.values=fa(O,N,Y)}),J.addEventListener("keydown",x=>{let L=x.target.closest("[data-data-fuzzy-search]");if(!L)return;let N=L.closest("[data-data-fuzzy]");if(x.key==="Escape")x.preventDefault(),We(N),L.blur();else if(x.key==="Enter"){x.preventDefault();let O=N?.querySelector("[data-action='select-fuzzy-term']");O?O.click():Ze(L.value)}else x.key==="ArrowDown"&&(x.preventDefault(),N?.querySelector("[data-action='select-fuzzy-term']")?.focus())}),J.addEventListener("mouseover",x=>{let L=x.target.closest("[data-action='open-fuzzy']");L&&Ae(L.closest("[data-data-fuzzy]"))}),J.addEventListener("mouseout",x=>{let L=x.target.closest("[data-data-fuzzy]");L&&(x.relatedTarget&&L.contains(x.relatedTarget)||We(L))}),J.addEventListener("submit",x=>{x.target.id==="data-filter-form"&&(x.preventDefault(),Xe(1))}),J.addEventListener("click",async x=>{let L=F.querySelector("[data-data-fuzzy] [data-data-fuzzy-popover]:not([hidden])")?.closest("[data-data-fuzzy]");L&&!x.target.closest("[data-data-fuzzy]")&&We(L);let N=x.target.closest("[data-action]"),O=N?.dataset.action;if(O==="data-nav"){let Y=N.dataset.tab,X=I(o);if(Y==="schema"){if(m!=="schema"){if(X){let xe=G(X),Ge=F.querySelector("#data-filter-form");Ge&&(xe.values=fa(Ge,X,xe))}m="schema",X&&ot(X)}return}let ue=Y==="judgment"?"judgment":"law";m==="schema"&&(m="query"),i!==ue?jt(ue,{databaseId:o,resetReport:!1}):X&&ot(X);let Re=I(o),De=Re?G(Re):null;Re&&De&&!De.result&&(Re.id==="postgres"||Re.id==="parquet")&&Xe(1);return}if(O==="open-fuzzy"){Ae(N.closest("[data-data-fuzzy]"),{focus:!0});return}if(O==="select-fuzzy-term"){await Ze(N.dataset.term);return}if(O==="remove-fuzzy-term"){await It(N.dataset.term);return}if(O==="schema-category"){m="schema",jt(N.dataset.category||"law",{resetReport:!0});return}if(O==="select-schema-table"){let Y=I(o);if(!Y)return;P(Y,N.dataset.tableId||"");return}if(O==="reset"){let Y=I(o);if(!Y)return;U=null,V=null;let X=G(Y);l[we(i,Y.id)]=ga(Y,X.pageSize),ot(Y),ne(Y),C("\u5DF2\u91CD\u8A2D\u9019\u500B\u8CC7\u6599\u5EAB\u7684\u67E5\u8A62\u689D\u4EF6\u3002","info",2400);return}x.target.closest("#catalog-retry")&&Tt()}),S.addEventListener("input",x=>{let L=x.target.closest("[data-schema-search]");if(!L)return;let N=B();if(!N)return;let O=L.dataset.schemaSearch||"",Y=L.value,X=`${N.mode}:${N.db.id}:${N.tableId}:${O}`,ue=j.get(X);if(ue&&window.clearTimeout(ue),!Y.trim()){j.delete(X),W(),w(N,O,"");return}let Re=window.setTimeout(()=>{j.delete(X),st(N,O,Y,L)},250);j.set(X,Re)}),S.addEventListener("keydown",x=>{let L=x.target.closest("[data-schema-search]");if(!L)return;let N=B();if(N){if(x.key==="Escape"){W();return}if(x.key==="ArrowDown"||x.key==="ArrowUp"){if(!E||E.hidden)return;x.preventDefault();let O=x.key==="ArrowDown"?1:-1;Ce(_<0?O>0?0:g.length-1:_+O);return}if(x.key==="Enter"){if(x.preventDefault(),E&&!E.hidden&&_>=0){Pe(_);return}w(N,L.dataset.schemaSearch||"",L.value)}}}),E?.addEventListener("mousedown",x=>{x.preventDefault()}),E?.addEventListener("click",x=>{let L=x.target.closest("[data-schema-suggest-index]");L&&Pe(Number(L.dataset.schemaSuggestIndex))});let Xt=x=>{x.target.closest("[data-schema-search]")||E?.contains(x.target)||W()};return document.addEventListener("click",Xt),window.addEventListener("scroll",W,{capture:!0,passive:!0}),window.addEventListener("resize",W),S.addEventListener("keydown",x=>{x.target.matches(".law-jump-input")&&x.key==="Enter"&&(x.preventDefault(),ge(x.target.id))}),S.addEventListener("click",async x=>{let L=x.target.closest("[data-action]");if(!L)return;let N=L.dataset.action,O=I(o),Y=O?G(O):null,X=Y?.result;if(N==="back-to-results"){me();return}if(N==="open-law"){Le({lawKey:L.dataset.lawKey||"",sourceType:L.dataset.lawSource||"",lawName:L.dataset.lawName||""});return}if(N==="open-judgment"){be({jid:L.dataset.jid||""});return}if(N==="jump-article"){ge(L.dataset.jumpInput||"law-article-jump");return}if(N==="sort-column"){let ue=L.dataset.sortKey||"";if(!ue||!O)return;if(m==="schema"&&b?.result){let xe=b.sort,Ge=ue==="jdate"||ue==="law_modified_date"||ue==="article_count"||ue==="citation_count"||ue==="full_text_length"||ue==="created_at"||ue==="updated_at",tt=xe?.key===ue?xe.direction==="asc"?"desc":"asc":Ge?"desc":"asc";P(O,b.tableId,{sort:{key:ue,direction:tt},columnFilters:b.columnFilters||{},quiet:!0});return}if(!Y)return;let Re=Y.sort,De=Re?.key===ue?Re.direction==="asc"?"desc":"asc":ue==="jdate"?"desc":"asc";Y.sort={key:ue,direction:De},Xe(1,{quiet:!0});return}if(N==="retry"){Xe(Y?.page||1);return}if(X){if(N==="prev-page"){Xe(Math.max(1,Number(X.page)-1),{quiet:!0});return}if(N==="next-page"){let ue=Math.max(1,Math.ceil(Number(X.total)/Number(X.page_size)));Xe(Math.min(ue,Number(X.page)+1),{quiet:!0});return}if(N==="copy-query"){let ue=await hs(X.query_text||"");C(ue?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",ue?"ok":"warn");return}if(N==="export-json"){let ue=`${X.database}-${X.table||"query"}-page-${X.page}.json`;Ut(ue,JSON.stringify(ya(X),null,2),"application/json;charset=utf-8"),C(`\u5DF2\u532F\u51FA ${ue}`,"ok");return}if(N==="export-csv"){let ue=`${X.database}-${X.table||"query"}-page-${X.page}.csv`;Ut(ue,$a(X),"text/csv;charset=utf-8"),C(`\u5DF2\u532F\u51FA ${ue}`,"ok")}}}),S.addEventListener("change",x=>{let L=x.target.closest("[data-action='select-law-version']");if(L&&U){Le({lawKey:U.lawKey,sourceType:U.sourceType,lawName:U.lawName,versionId:L.value});return}if(!x.target.matches("[data-page-size]"))return;let N=I(o);if(!N)return;let O=G(N);O.pageSize=Number(x.target.value)||25,O.page=1,he("data.page_size",O.pageSize),Xe(1,{quiet:!0})}),le.addEventListener("click",()=>{Tt()}),await Tt(),t&&typeof t.setTitle=="function"&&t.setTitle("\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"),()=>{s=!0,A&&window.clearTimeout(A);for(let x of j.values())window.clearTimeout(x);j.clear(),W(),document.removeEventListener("click",Xt),window.removeEventListener("scroll",W,{capture:!0}),window.removeEventListener("resize",W)}}var ai=[10,25,50,100],Nl=[{value:"started_at:desc",label:"Timestamp \u65B0 \u2192 \u820A"},{value:"started_at:asc",label:"Timestamp \u820A \u2192 \u65B0"},{value:"duration_ms:desc",label:"\u8017\u6642\u591A \u2192 \u5C11"},{value:"duration_ms:asc",label:"\u8017\u6642\u5C11 \u2192 \u591A"}];function hn(){return{process:"",module:"",status:"",method:"",model:"",keyword:"",from_date:"",to_date:"",min_duration:"",sort:"started_at:desc"}}function El(e,t=e){return`<option value="${r(e)}">${r(t)}</option>`}function Qs(e,t,s,a,n=""){return`<div class="field">
    <label class="field-label" for="performance-${e}">
      <span>${r(t)}</span>
      <span class="field-tag">${r(e)}</span>
    </label>
    <select class="select" id="performance-${e}" name="${r(e)}">
      ${El("","\u5168\u90E8")}
      ${s.map(i=>`<option value="${r(i)}" ${String(i)===String(a)?"selected":""}>${r(i)}</option>`).join("")}
    </select>
    ${n?`<span class="field-help">${r(n)}</span>`:""}
  </div>`}function Rl(e,t){let s=Nl.map(a=>`<option value="${a.value}" ${a.value===t.sort?"selected":""}>${a.label}</option>`).join("");return`
    ${Qs("process","\u7A0B\u5E8F",e.processes||[],t.process)}
    ${Qs("module","\u6A21\u7D44",e.modules||[],t.module)}
    ${Qs("model","\u6A21\u578B",e.models||[],t.model)}
    ${Qs("status","\u72C0\u614B",e.statuses||[],t.status)}
    ${Qs("method","\u65B9\u6CD5",e.methods||[],t.method)}
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
    </div>`}function Yr(){let e=document.getElementById("performance-filter-form");if(!e)return hn();let t=new FormData(e);return{process:String(t.get("process")||""),module:String(t.get("module")||""),status:String(t.get("status")||""),method:String(t.get("method")||""),model:String(t.get("model")||""),keyword:String(t.get("keyword")||"").trim(),from_date:String(t.get("from_date")||""),to_date:String(t.get("to_date")||""),min_duration:String(t.get("min_duration")||""),sort:String(t.get("sort")||"started_at:desc")}}function Xr(e){if(e==null)return"null";if(typeof e=="object")try{let t=JSON.stringify(e);return t.length>160?`${t.slice(0,157)}\u2026`:t}catch{return String(e)}return String(e)}function Zr(e){if(!e)return"";let t=new Date(e);if(Number.isNaN(t.getTime()))return"";let s=String(t.getHours()).padStart(2,"0"),a=String(t.getMinutes()).padStart(2,"0"),n=String(t.getSeconds()).padStart(2,"0"),i=String(t.getMilliseconds()).padStart(3,"0");return`${s}:${a}:${n}.${i}`}function Cl(e,t){if(!e)return"";let s=new Date(e);return Number.isNaN(s.getTime())?"":new Date(s.getTime()+Math.max(0,Number(t)||0)).toISOString()}var Pl=[{key:"parsing",label:"Parsing",hint:"\u8F38\u5165\u9577\u5EA6\u3001\u89E3\u6790\u6642\u9593",names:["rag.parse_question"],color:"#64748b"},{key:"embedding",label:"Embedding",hint:"Model\u3001Token\u3001Batch\u3001\u8017\u6642",names:["rag.embed_query"],color:"#3984c6"},{key:"qdrant",label:"Qdrant Search",hint:"Collection\u3001Filter\u3001Top K\u3001\u8017\u6642",names:["rag.qdrant_search"],color:"#d97706"},{key:"reranker",label:"Reranker",hint:"Model\u3001\u5019\u9078\u7B46\u6578\u3001\u8017\u6642",names:["rag.rerank"],color:"#8b5cf6"},{key:"context",label:"Context",hint:"Chunk \u6578\u3001Token \u6578\u3001\u8017\u6642",names:["rag.context"],fallbackNames:["rag.fetch_documents","rag.build_citations"],color:"#64748b"},{key:"llm",label:"LLM",hint:"Model\u3001Input/Output Token\u3001TTFT\u3001\u8017\u6642",names:["rag.llm_request"],color:"#16a34a"}],_a={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"};function ni(e){let t=e?.metadata?.rag_response||{},s=String(t.status||e?.metadata?.rag_status||e?.status||"");return s==="operational"||s==="success"?{label:"Completed",tone:"ok"}:s==="retrieval_only"?{label:"Abstain",tone:"warn"}:s==="preview"?{label:"Preview",tone:"info"}:s==="failed"||s==="error"?{label:"Failed",tone:"danger"}:{label:s||"Unknown",tone:"idle"}}function $n(e){let t=Math.max(0,Number(e?.offset_ms)||0),s=Math.max(0,Number(e?.duration_ms)||0),a=Math.max(t,Number(e?.end_offset_ms)||t+s);return{...e,offset:t,end:a,duration:Math.max(s,a-t)}}function ri(e,t=0){let s=Array.isArray(e?.segments)?[...e.segments].sort((m,$)=>Number(m.offset_ms||0)-Number($.offset_ms||0)):[],a=Math.max(Number(e?.total_ms)||0,Number(t)||0,...s.map(m=>$n(m).end),1),n=Pl.map(m=>{let $=s.filter(y=>m.names.includes(y.name));!$.length&&m.fallbackNames&&($=s.filter(y=>m.fallbackNames.includes(y.name)));let b=$.map($n),p=b.length?Math.min(...b.map(y=>y.offset)):null,g=b.length?Math.max(...b.map(y=>y.end)):null;return{...m,spans:b,start:p,end:g,duration:p===null?null:g-p}});for(let m of n){if(m.key!=="embedding"&&m.key!=="llm")continue;let $=[];for(let g of m.spans){let y=g.metadata||{},_=Number(y.load_duration_ms),q=Number.isFinite(_)&&_>0?_:0,M=Math.max(0,Number(g.duration)||0);$.push({...g,offset:g.offset,end:g.offset+q,duration:q,metadata:{...y,source_stage:m.label,model_load_ms:q,request_duration_ms:M,warm_duration_ms:Math.max(0,M-q),cold_start:q>=100},params:{...g.params||{},source_stage:m.label}})}if(!$.length)continue;let b=$.reduce((g,y)=>g+y.duration,0),p=m.spans.reduce((g,y)=>g+Math.max(0,Number(y.duration)||0),0);m.loadInfo={spans:$,total:b,requestTotal:p,ratio:p>0?Math.min(1,Math.max(0,b/p)):0}}let i=[...n],o=Math.max(0,...i.flatMap(m=>m.spans.map($=>$.end))),l=e?.metadata?.rag_response||{},u=ni(e),c=Math.min(a,o);return i.push({key:"response",label:"Response",hint:"\u7E3D\u8017\u6642\u3001\u5F15\u7528\u6578\u3001\u6210\u529F\u6216 Abstain",color:"#0f766e",spans:[{offset:c,end:a,duration:Math.max(0,a-c),status:u.tone==="danger"?"error":"ok",metadata:l,params:{},started_at:e?.started_at,finished_at:e?.finished_at}],start:c,end:a,duration:Math.max(0,a-c),responseMetadata:l}),Il(i,a),{total:a,stages:i,response:l,traceStatus:u,requestId:e?.request_id||"",startedAt:e?.started_at,finishedAt:e?.finished_at,client:e?.client||{},models:Array.isArray(e?.summary?.models)?e.summary.models:[],hasLoad:i.some(m=>!!m.loadInfo)}}function Il(e,t){let s=e.reduce((i,o)=>i+Math.max(0,Number(o.duration)||0),0),a=s>0?t/s:1,n=0;for(let i of e){let o=Math.max(0,Number(i.duration)||0)*a;i.displayStart=n,i.displayDuration=o,i.displayEnd=n+o;let l=i.spans[0]||null,u=[],c=!1;if(l){let $=Math.max(0,Number(l.duration)||0),b=i.loadInfo?Math.max(0,Number(i.loadInfo.total)||0):0;if(i.loadInfo&&b>0&&i.spans.length===1&&$>0){let p=Math.min(l.end,l.offset+b),g=Math.max(0,p-l.offset),y=Math.max(0,l.end-p);if(g>0&&y>0){let _=Cl(l.started_at,g),q={...l,offset:l.offset,end:p,duration:g,finished_at:_,metadata:{...l.metadata||{},source_stage:i.label,model_load_ms:g,request_duration_ms:$,warm_duration_ms:Math.max(0,$-g),cold_start:g>=100},params:{...l.params||{},source_stage:i.label}},M={...l,offset:p,end:l.end,duration:y,started_at:_,finished_at:l.finished_at};u.push({kind:"load",label:"Model Load",span:q,duration:g}),u.push({kind:"stage",label:`${i.label} \u63A8\u8AD6`,span:M,duration:y}),c=!0}}c||u.push({kind:"stage",label:i.label,span:l,duration:$})}i.detailSegments=u;let m=[];if(l&&o>0)if(c){let[$,b]=u,p=$.duration+b.duration,g=p>0?o*($.duration/p):0,y={...i,key:"model_load",label:`Model Load \xB7 ${i.label}`,spans:[$.span],duration:$.duration},_={...i,label:`${i.label} \u63A8\u8AD6`,spans:[b.span],duration:b.duration};m.push({offset:n,duration:g,color:"#0ea5e9",kind:"load",tip:wa(y,$.span)}),m.push({offset:n+g,duration:Math.max(0,o-g),color:i.color,kind:"stage",tip:wa(_,b.span,{includeLoad:!1})})}else m.push({offset:n,duration:o,color:i.color,kind:"stage",tip:wa(i,l)});i.displaySegments=m,n+=o}}function yn(e,{includeLoad:t=!0}={}){let s=[],a=(m,$)=>{$==null||$===""||s.push([m,String($)])},n=e.spans[0]||null;if(!n)return a("\u72C0\u614B","\u6B64\u7D00\u9304\u6C92\u6709\u9019\u500B span"),s;let i=n.params||{},o=n.metadata||{},l=ii(n),u=wn(n),c=(m,$)=>{let b=Number(m?.load_duration_ms);if(!Number.isFinite(b))return;let p=Math.max(0,b);a("Model Load",fe(p)),a("\u51B7\u555F\u52D5",p>=100?"\u662F":"\u5426\uFF08\u71B1\u555F\u52D5\uFF09");let g=Math.max(0,Number($)||0);if(g>0){let y=Math.max(0,g-p);a("\u6263\u9664\u8F09\u5165\u5F8C",fe(y)),a("\u8F09\u5165\u5360\u6BD4",`${(p/g*100).toFixed(p/g>=.1?0:1)}%`)}};if(e.key==="response")return a("Trace \u72C0\u614B",e.responseMetadata.status||"\u2014"),a("Answer source",e.responseMetadata.answer_source||"\u2014"),a("Abstain",e.responseMetadata.abstain?"\u662F":"\u5426"),a("\u5F15\u7528\u7E3D\u6578",e.responseMetadata.citation_count??"\u2014"),a("\u5224\u6C7A\uFF0F\u6CD5\u898F\u5F15\u7528",`${e.responseMetadata.judgment_citations??"\u2014"} / ${e.responseMetadata.law_citations??"\u2014"}`),a("\u7E3D\u8017\u6642",fe(e.duration)),s;if(a("\u958B\u59CB",`${Zr(n.started_at)||"\u2014"} \xB7 +${n.offset.toFixed(1)} ms`),a("\u7D50\u675F",`${Zr(n.finished_at)||"\u2014"} \xB7 +${n.end.toFixed(1)} ms`),a("\u8017\u6642",fe(n.duration)),e.key==="parsing")a("\u8F38\u5165\u9577\u5EA6",o.input_length??i.input_length),a("\u6B63\u898F\u5316\u9577\u5EA6",o.normalized_length??i.normalized_length),a("\u79FB\u9664\u7A7A\u767D",o.trimmed_chars);else if(e.key==="embedding")a("Model",u||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.active_base_url||o.base_url),a("Input tokens",o.prompt_eval_count),a("Batch",o.batch),a("\u5411\u91CF\u7DAD\u5EA6",o.dimensions),a("Fallback",o.fallback_used?"\u662F":"\u5426"),t&&c(o,n.duration);else if(e.key==="qdrant")a("Collection",o.collection||i.collection),o.filter&&a("Filter",Xr(o.filter)),a("Top K",o.top_k??i.limit),a("Hits",o.hits),a("Unique judgments",o.unique_judgments),a("Top score",o.top_score);else if(e.key==="reranker")a("Model",u||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.base_url||i.url),a("Rerank \u72C0\u614B",o.status),a("Fallback",o.fallback_used?"\u662F":"\u5426"),a("\u5019\u9078\u7B46\u6578",o.candidates),a("\u9078\u7528\u7B46\u6578",o.selected),a("Top score",o.top_score),Array.isArray(o.errors)&&o.errors.length&&a("\u932F\u8AA4",o.errors.join(" \xB7 "));else if(e.key==="context")a("Chunks",o.chunks),a("\u5224\u6C7A chunks",o.judgment_chunks),a("\u6CD5\u898F chunks",o.law_chunks),a("Token \u4F30\u7B97",o.token_estimate),a("Context \u5B57\u5143",o.context_chars),a("\u6587\u4EF6\u6578",o.documents);else if(e.key==="llm")a("Model",u||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.base_url||i.url),a("Input tokens",o.input_tokens),a("Output tokens",o.output_tokens),a("TTFT",o.ttft_ms===null||o.ttft_ms===void 0?"\u2014":fe(o.ttft_ms)),a("API \u7E3D\u8017\u6642",o.total_duration_ms===null||o.total_duration_ms===void 0?"\u2014":fe(o.total_duration_ms)),t&&c(o,n.duration),a("Strict retry",o.strict?"\u662F":"\u5426");else if(e.key==="model_load"){if(a("Model",u||o.model||i.model),a("\u4E3B\u6A5F",l),a("\u4F86\u6E90\u968E\u6BB5",o.source_stage),a("\u51B7\u555F\u52D5",o.cold_start?"\u662F":"\u5426\uFF08\u71B1\u555F\u52D5\uFF09"),a("\u6A21\u578B\u547C\u53EB\u7E3D\u8017\u6642",o.request_duration_ms===null||o.request_duration_ms===void 0?"\u2014":fe(o.request_duration_ms)),a("\u8F09\u5165\u8017\u6642",o.model_load_ms===null||o.model_load_ms===void 0?"\u2014":fe(o.model_load_ms)),a("\u6263\u9664\u8F09\u5165\u5F8C\u6D41\u7A0B\u6642\u9593",o.warm_duration_ms===null||o.warm_duration_ms===void 0?"\u2014":fe(o.warm_duration_ms)),Number(o.request_duration_ms)>0&&Number(o.model_load_ms)>=0){let m=Number(o.model_load_ms)/Number(o.request_duration_ms)*100;a("\u8F09\u5165\u5360\u6BD4",`${m.toFixed(m>=10?0:1)}%`)}o.eval_duration_ms!==null&&o.eval_duration_ms!==void 0&&a("\u63A8\u8AD6\u8017\u6642",fe(o.eval_duration_ms))}else if(e.key==="segment"||e.key==="test_stage")if(a("Model",u||o.model||i.model),a("\u72C0\u614B",o.status||n.status),e.key==="test_stage")a("\u9032\u5EA6",o.progress===null||o.progress===void 0?"":`${Number(o.progress)||0}%`),n.error&&a("\u932F\u8AA4",n.error);else{n.error&&a("\u932F\u8AA4",n.error);for(let[m,$]of Object.entries(i).slice(0,10))a(m,Xr($))}return e.spans.length>1&&(e.key==="model_load"?a("\u5404\u6A21\u578B\u8F09\u5165",e.spans.map(m=>`${m.metadata?.source_stage||"model"} ${wn(m)} ${fe(m.metadata?.model_load_ms||0)}`).join(" \xB7 ")):(a("Span \u6578",e.spans.length),a("Span \u660E\u7D30",e.spans.map((m,$)=>`#${$+1} +${m.offset.toFixed(0)}ms/${fe(m.duration)}`).join(" \xB7 ")))),n.module&&a("Module",n.module),n.function&&a("Function",n.function),s}function Dl(e){let t=String(e||"").trim();if(!t)return"";try{return new URL(t.includes("://")?t:`http://${t}`).hostname||t}catch{return t}}function ii(e){let t=e?.metadata||{},s=String(t.provider_name||"").trim();if(s)return s;let a=String(t.active_base_url||t.base_url||e?.params?.url||"").trim();return Dl(a)}function Ol(e){let t=e?.metadata||{};return String(t.model||e?.params?.model||"").trim()}function wn(e){let t=ii(e),s=Ol(e);return s?t?`${t}:${s}`:s:""}function Bl(e){let t=new Set;for(let s of e?.spans||[]){let a=wn(s);a&&t.add(a)}return[...t]}function wa(e,t,s={}){let a=yn({...e,spans:[t]},s);return[String(e.label||""),...a.map(([n,i])=>`${n}: ${i}`)].join(`
`)}function Fl(e,t){let s=e.spans||[],a=Bl(e),n=Array.isArray(e.displaySegments)?e.displaySegments:null,i=7,o=Math.max(1,Math.min(4,s.length)),l=s.length>1,u=n?12:l?Math.max(12,o*i):12,c=n?n.map(_=>{if(Number(_.duration)<=0)return"";let q=Math.max(0,Math.min(100,_.offset/t*100)),M=Math.min(100-q,_.duration/t*100);return`<span class="rag-wf-bar is-sequential${_.kind==="load"?" is-load":""}" style="left:${q.toFixed(3)}%;width:${M.toFixed(4)}%;top:0;height:12px;--bar-color:${_.color}"
            data-rag-wf-tip="${r(_.tip)}"
            aria-label="${r(_.tip)}" role="img"></span>`}).join(""):s.slice(0,4).map((_,q)=>{if(Number(_.duration)<=0)return"";let M=Math.max(0,Math.min(100,_.offset/t*100)),A=Math.max(.35,Math.min(100-M,_.duration/t*100)),U=l?q*i:0,V=l?6:12,J=wa(e,_);return`<span class="rag-wf-bar" style="left:${M.toFixed(3)}%;width:${A.toFixed(3)}%;top:${U}px;height:${V}px"
            data-rag-wf-tip="${r(J)}"
            aria-label="${r(J)}" role="img"></span>`}).join(""),m=Array.isArray(e.detailSegments)?e.detailSegments:[],$=m.length>1?m.map(_=>{let q=_.kind==="load"?{...e,key:"model_load",label:`Model Load \xB7 ${e.label}`,spans:[_.span],duration:_.duration}:{...e,label:`${e.label} \u63A8\u8AD6`,spans:[_.span],duration:_.duration},M=yn(q,{includeLoad:_.kind!=="stage"});return`<div class="rag-wf-detail-group">
              <div class="rag-wf-detail-group-head">
                <strong>${r(_.label)}</strong>
                <span>${r(fe(_.duration))}</span>
              </div>
              <div class="rag-wf-detail-grid">${M.map(([A,U])=>`<span class="rag-wf-detail"><span>${r(A)}</span><strong>${r(U)}</strong></span>`).join("")}</div>
            </div>`}).join(""):"",b=yn(e).map(([_,q])=>`<span class="rag-wf-detail"><span>${r(_)}</span><strong>${r(q)}</strong></span>`).join(""),p=m.length>1?`<div class="rag-wf-details is-split">${$}</div>`:`<div class="rag-wf-details">${b}</div>`,g=s.length?s.some(_=>_.status==="error")?"is-error":"":"is-missing",y=s.length?fe(e.duration):"\u672A\u8A18\u9304";return`<details class="rag-wf-stage ${g}" style="--stage-color:${e.color}">
    <summary class="rag-wf-stage-summary">
      <span class="rag-wf-stage-head">
        <span class="rag-wf-stage-label">
          <i aria-hidden="true"></i>
          <span><strong>${r(e.label)}</strong><small>${r(e.hint)}</small>${a.length?`<small class="rag-wf-model-line">${r(a.join(" \xB7 "))}</small>`:""}</span>
        </span>
        <span class="rag-wf-stage-meta">${y} \xB7 ${s.length?`${s.length} span`:"\u2014"} <span class="rag-wf-chevron">${f("chevronRight",12)}</span></span>
      </span>
      <span class="rag-wf-track" style="height:${u}px">${c}</span>
    </summary>
    ${p}
  </details>`}function oi(e,t,s=!1){let a=e.response||{},n=e.client||{},i=e.models||[];return`<div class="rag-wf-summary">
      <span>\u7E3D\u8017\u6642 <strong>${r(fe(e.total))}</strong></span>
      <span>Server <strong>${r(fe(t))}</strong></span>
      ${n.total_ms?`<span>Client <strong>${r(fe(n.total_ms))}</strong></span>`:""}
      ${n.render_ms!==void 0?`<span>Render <strong>${r(fe(n.render_ms))}</strong></span>`:""}
      <span>\u5F15\u7528 <strong>${r(String(a.citation_count??"\u2014"))}</strong></span>
      <span>Abstain <strong>${a.abstain?"\u662F":"\u5426"}</strong></span>
      ${i.length?`<span>Model <strong>${r(i.join(" \xB7 "))}</strong></span>`:""}
      ${s?'<span class="rag-wf-updating">\u66F4\u65B0\u4E2D\u2026</span>':""}
    </div>`}function xs(e,t,s="\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\uFF0C\u67E5\u770B\u53C3\u6578\u3001Token\u3001TTFT\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u4F86\u6E90\u6578\u91CF\u3002Waterfall \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u5E73\u884C\u57F7\u884C\u7684 span \u6703\u4F9D\u5BE6\u969B\u6642\u9593\u91CD\u758A\u986F\u793A\u3002",{legend:a=""}={}){return`<div class="rag-wf-axis"><span>0 ms</span><span>${r(fe(t))}</span></div>
    ${a}
    <div class="rag-wf-stages">${(e||[]).map(n=>Fl(n,t)).join("")}</div>
    <p class="rag-wf-hint">${r(s)}</p>`}function li(e){let t=(e.stages||[]).some(n=>n.loadInfo),s=t?'<div class="rag-wf-legend"><span><i class="is-load"></i>Model Load\uFF08\u968E\u6BB5 bar \u524D\u6BB5\uFF09</span></div>':"",a=t?"\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7D50\u675F\u5F8C\u63A5\u7E8C\u4E0B\u4E00\u968E\u6BB5\uFF1BEmbedding\uFF0FLLM \u7684\u85CD\u8272\u524D\u6BB5\u70BA Model Load\uFF0C\u5F8C\u6BB5\u70BA\u63A8\u8AD6\u3002\u5BE6\u969B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001Token \u8207\u8F09\u5165\u5360\u6BD4\u53EF\u5C55\u958B\u67E5\u770B\u3002":"\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7D50\u675F\u5F8C\u63A5\u7E8C\u4E0B\u4E00\u968E\u6BB5\u3002\u5BE6\u969B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207 Token \u53EF\u5C55\u958B\u67E5\u770B\u3002";return xs(e.stages,e.total,a,{legend:s})}function ka(e,{serverDurationMs:t=0,loading:s=!1,embedded:a=!1}={}){if(!e||typeof e!="object")return"";let n=ri(e,t),i=n.traceStatus;return`<section class="report-card rag-wf-card${a?" rag-wf-embedded":""}">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${_a[i.tone]||_a.idle}">${r(i.label)}</span>
        </div>
        <div class="report-sub">Trace ID:
          <span class="mono">${r(n.requestId||"\u2014")}</span>
          \xB7 ${r($e(n.startedAt))}
        </div>
      </div>
      <div class="rag-wf-actions">
        <a class="btn btn-secondary btn-sm" href="#/performance">
          ${f("activity",14)}<span>\u5B8C\u6574 Flow</span>
        </a>
      </div>
    </div>
    ${oi(n,t,s)}
    ${li(n)}
  </section>`}var ht=null;function Hl(){return ht||(ht=document.createElement("div"),ht.className="rag-wf-tooltip",ht.hidden=!0,document.body.appendChild(ht),ht)}function _n(){ht&&(ht.hidden=!0)}function ci(e){if(!ht||ht.hidden)return;let t=14,s=10,a=ht.getBoundingClientRect(),n=e.clientX+t,i=e.clientY+t;n+a.width>window.innerWidth-s&&(n=e.clientX-a.width-t),i+a.height>window.innerHeight-s&&(i=e.clientY-a.height-t),ht.style.left=`${Math.max(s,n)}px`,ht.style.top=`${Math.max(s,i)}px`}document.addEventListener("pointerover",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=Hl(),a=t.dataset.ragWfTip||"";a&&(s.textContent=a,s.hidden=!1,ci(e))});document.addEventListener("pointermove",e=>{if(!(!ht||ht.hidden)){if(!e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]")){_n();return}ci(e)}});document.addEventListener("pointerout",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=e.relatedTarget;s instanceof Node&&t.contains(s)||_n()});window.addEventListener("scroll",_n,{capture:!0,passive:!0});function zl(e,t,s,a){if(a&&!e.length)return`<div class="report-card rag-wf-card">
      ${He({tone:"danger",title:"RAG Pipeline \u8B80\u53D6\u5931\u6557",text:r(a.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-rag-waterfall">${f("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;if(!e.length)return`<div class="report-card rag-wf-card">
      ${pt({iconName:"activity",title:s?"\u8B80\u53D6 RAG Pipeline\u2026":"\u5C1A\u7121 RAG Pipeline \u7D00\u9304",text:s?"\u6B63\u5728\u6574\u7406\u6700\u8FD1\u7684 RAG \u554F\u7B54 Trace\u3002":"\u7522\u751F\u65B0\u7684 RAG \u554F\u7B54\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A Parsing\u3001Embedding\u3001Qdrant\u3001Context\u3001LLM \u8207 Response \u7684 waterfall\u3002"})}
    </div>`;let n=e.find(c=>String(c.id)===String(t))||e[0],i=n.flow&&typeof n.flow=="object"?n.flow:{},o=ri(i,n.duration_ms),l=o.traceStatus,u=e.map(c=>{let m=ni(c.flow||{});return`<option value="${r(String(c.id))}" ${String(c.id)===String(n.id)?"selected":""}>#${r(String(c.id))} \xB7 ${r($e(c.started_at))} \xB7 ${r(fe(c.duration_ms))} \xB7 ${r(m.label)}</option>`}).join("");return`<section class="report-card rag-wf-card">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${_a[l.tone]||_a.idle}">${r(l.label)}</span>
        </div>
        <div class="report-sub">Trace ID:
          <span class="mono">${r(o.requestId||n.request_id||"\u2014")}</span>
          \xB7 ${r($e(n.started_at))}
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
    ${oi(o,n.duration_ms,s)}
    ${li(o)}
  </section>`}function Ul(e){let t=Array.isArray(e?.segments)?e.segments:[],s=Array.isArray(e?.models)?e.models:[],a=e?.client||{},n=Math.max(...t.map(l=>Number(l.avg_ms)||0),1),i=a.samples?fe(a.avg_total_ms??0):"\u2014",o=a.samples?fe(a.avg_render_ms??0):"\u2014";return`<div class="perf-flow-stats">
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
                    <span class="perf-model-count">${d(l.value)} \u6B21${l.avg_ms?` \xB7 \u5E73\u5747 ${fe(l.avg_ms)}`:""}</span>
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
                    <span class="perf-seg-ms">${fe(l.avg_ms)}</span>
                  </div>`).join("")}</div>`:'<p class="muted" style="font-size:11px">\u5C1A\u7121\u5340\u6BB5\u8017\u6642\uFF1B\u9700\u6709\u542B flow \u7684\u65B0\u7D00\u9304\u3002</p>'}
      </div>
    </div>
  </div>`}function gt(e){let t=Math.max(0,Number(e)||0);if(!t)return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;let s=Math.round(t/1e3),a=Math.floor(s/3600),n=Math.floor(s%3600/60),i=s%60;return a?`${a}h ${String(n).padStart(2,"0")}m ${String(i).padStart(2,"0")}s`:n?`${n}m ${String(i).padStart(2,"0")}s`:`${(t/1e3).toFixed(1)}s`}function di(e){let t=String(e?.task||"").trim();return t?t==="auto"?"\u81EA\u52D5\u63A5\u7E8C":`task ${t}`:"\u7D22\u5F15"}function Ql(e){let t=(e||[]).slice(-12);if(!t.length)return'<p class="muted" style="font-size:11px">\u5C1A\u7121\u7D22\u5F15\u7D00\u9304\u3002</p>';let s=Math.max(...t.map(a=>Number(a.points_per_second)||0),.1);return`<div class="index-run-bars">${t.map(a=>{let n=Number(a.points_per_second)||0,i=Math.max(2,n/s*100);return`<div class="index-run-row">
        <div class="index-run-label">
          <strong>${r(di(a))}</strong>
          <span>${r($e(a.started_at))}</span>
        </div>
        <div class="index-run-track" title="${r(`${d(a.indexed_count)} \u7B46 \xB7 ${gt(a.duration_ms)} \xB7 ${d(a.batch_count)} \u6279`)}">
          <span style="width:${i.toFixed(1)}%"></span>
        </div>
        <div class="index-run-value">
          <strong>${n.toFixed(1)}</strong><span>\u7B46/\u79D2</span>
          <em>${d(a.indexed_count)} \u7B46 \xB7 ${gt(a.duration_ms)}</em>
        </div>
      </div>`}).join("")}</div>`}function Gl(e){let t=(Array.isArray(e.time_breakdown)?e.time_breakdown:[]).map(s=>({...s,ms:Number(s.ms)||0,percent:Number(s.percent)||0})).filter(s=>s.ms>0);return t.length?`<div class="index-breakdown-bar">${t.map(s=>`<span class="index-seg index-seg-${r(s.key)}" style="width:${Math.max(.5,s.percent).toFixed(2)}%" title="${r(`${s.label} ${gt(s.ms)}\uFF08${s.percent.toFixed(1)}%\uFF09`)}"></span>`).join("")}</div>
    <div class="index-breakdown-legend">${t.map(s=>`<span class="index-legend-item">
            <i class="index-seg index-seg-${r(s.key)}"></i>
            <span>${r(s.label)}</span>
            <strong>${gt(s.ms)}</strong>
            <em>${s.percent.toFixed(1)}%</em>
          </span>`).join("")}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B\u968E\u6BB5\u8A08\u6642\uFF1B\u5F8C\u7E8C\u7D22\u5F15\u6703\u8A18\u9304 Ollama Embedding\u3001Qdrant Upsert \u8207 PostgreSQL \u7D22\u5F15\u7D00\u9304\u7684\u6642\u9593\u7D44\u6210\u3002</div>'}function Jl(e,t){let s=(Array.isArray(e)?e:[]).map(q=>({elapsed:Math.max(0,Number(q.elapsed_s)||0),indexed:Math.max(0,Number(q.indexed)||0)})).filter(q=>q.indexed>0);if(s.length<2)return"";let a=Math.max(...s.map(q=>q.elapsed),(Number(t)||0)/1e3,1),n=Math.max(...s.map(q=>q.indexed),1),i=760,o=150,l=12,u=12,c=i-l*2,m=o-u*2,$=s.map(q=>[l+q.elapsed/a*c,o-u-q.indexed/n*m]),b=$.map(([q,M],A)=>`${A===0?"M":"L"}${q.toFixed(1)},${M.toFixed(1)}`).join(" "),p=`${b} L${$[$.length-1][0].toFixed(1)},${o-u} L${$[0][0].toFixed(1)},${o-u} Z`,g=Math.max(1,Math.ceil($.length/14)),y=$.map(([q,M],A)=>A%g===0||A===$.length-1?`<circle cx="${q.toFixed(1)}" cy="${M.toFixed(1)}" r="2.6" />`:"").join(""),_=[0,1,2,3].map(q=>{let M=u+m/3*q;return`<line x1="${l}" y1="${M.toFixed(1)}" x2="${i-l}" y2="${M.toFixed(1)}" class="index-chart-grid" />`}).join("");return`<div class="index-chart-card index-progress-card">
    <div class="index-chart-head">
      <span>\u672C\u6B21\u7D22\u5F15\u9032\u5EA6</span>
      <span>${d(n)} \u7B46 \xB7 ${gt(a*1e3)}</span>
    </div>
    <svg class="index-progress-svg" viewBox="0 0 ${i} ${o}" role="img" aria-label="\u7D22\u5F15\u9032\u5EA6\u6298\u7DDA\u5716">
      ${_}
      <path d="${p}" class="index-progress-area"></path>
      <path d="${b}" class="index-progress-line"></path>
      ${y}
      <line x1="${l}" y1="${o-u}" x2="${i-l}" y2="${o-u}" class="index-chart-axis"></line>
      <line x1="${l}" y1="${u}" x2="${l}" y2="${o-u}" class="index-chart-axis"></line>
    </svg>
    <div class="index-progress-labels">
      <span>0</span>
      <span>${gt(a*500)}</span>
      <span>${gt(a*1e3)}</span>
    </div>
  </div>`}function Wl(e){if(!e||!e.latest)return"";let t=e.latest,s=Array.isArray(e.runs)?e.runs:[],a=e.average||{},n=t.coverage||{},i=n.total_judgments>0?`${d(n.indexed_judgments)} / ${d(n.total_judgments)}\uFF08${(100*n.indexed_judgments/n.total_judgments).toFixed(1)}%\uFF09`:"\u2014",o=[{label:"\u7576\u6B21\u57F7\u884C\u7B46\u6578",value:d(t.indexed_count),note:`${d(t.batch_count)} \u6279 \xD7 ${d(t.batch_size)} \u7B46`},{label:"\u5E73\u5747\u6BCF\u79D2\u7B46\u6578",value:`${(Number(t.points_per_second)||0).toFixed(1)}`,note:"\u7B46/\u79D2"},{label:"\u7576\u6B21\u4F7F\u7528\u6642\u9593",value:gt(t.duration_ms),note:`${d(t.scanned_count)} \u7B46\u5DF2\u6383\u63CF`},{label:"\u5E73\u5747\u6BCF\u6279\u6642\u9593",value:gt(t.batch_avg_ms),note:t.batch_min_ms||t.batch_max_ms?`\u6700\u5FEB ${gt(t.batch_min_ms)} \xB7 \u6700\u6162 ${gt(t.batch_max_ms)}`:"\u4EE5\u7E3D\u8017\u6642 \xF7 \u6279\u6578\u8A08\u7B97"}];return`<section class="index-perf-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u7D22\u5F15\u6548\u80FD</div>
        <div class="index-perf-sub">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 \xB7 \u6700\u8FD1 ${d(e.run_count)} \u6B21\u57F7\u884C</div>
      </div>
      <span class="chip">${r(di(t))}</span>
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
      <span><strong>batch</strong> ${d(t.batch_size)} \u7B46\uFF0F\u6279</span>
      <span><strong>embedding \u4E0A\u9650</strong> ${t.max_chars?`${d(t.max_chars)} \u5B57`:"\u2014"}</span>
      <span><strong>collection</strong> ${d(t.collection_points)} points</span>
      <span><strong>\u8986\u84CB\u7387</strong> ${r(i)}</span>
      <span><strong>\u5E73\u5747\u6BCF\u6B21\u57F7\u884C</strong> ${gt(a.duration_ms)} \xB7 ${(Number(a.points_per_second)||0).toFixed(1)} \u7B46/\u79D2</span>
    </div>
    <div class="index-charts">
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u8FD1\u7D22\u5F15\u541E\u5410</span>
          <span>\u7B46/\u79D2</span>
        </div>
        ${Ql(s)}
      </div>
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u65B0\u4E00\u6B21\u6642\u9593\u7D44\u6210</span>
          <span>${gt(t.duration_ms)}</span>
        </div>
        ${Gl(t)}
      </div>
    </div>
    ${Jl(t.progress,t.duration_ms)}
  </section>`}var ei=["#22d3ee","#a78bfa","#f59e0b","#ec4899","#3b82f6","#10b981","#f97316","#8b5cf6","#64748b"];function ti(e){let t=String(e?.host||e?.url||"").trim(),s=e?.port?`:${e.port}`:"";return`${t||"\u2014"}${s}`}function Vl(e,t,s,a){if(a&&!e)return`<div class="report-card rag-wf-card">
      ${He({tone:"danger",title:"\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline \u8B80\u53D6\u5931\u6557",text:r(a.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-index-pipeline">${f("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;let n=Array.isArray(e?.runs)?e.runs:[];if(!n.length)return`<div class="report-card rag-wf-card">
      ${pt({iconName:"layers",title:s?"\u8B80\u53D6\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline\u2026":"\u5C1A\u7121\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline \u7D00\u9304",text:s?"\u6B63\u5728\u6574\u7406\u6700\u8FD1\u7684\u7248\u672C\u5316\u7D22\u5F15\u7D00\u9304\u3002":"\u57F7\u884C\u300CQdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u300D\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A host/model\u3001Blue-Green collection \u8207\u5404\u968E\u6BB5\u8017\u6642\u3002"})}
    </div>`;let i=n.find(M=>String(M.id)===String(t))||e?.latest||n[n.length-1],o=i?.pipeline&&typeof i.pipeline=="object"?i.pipeline:null,u=[...n].reverse().map(M=>{let A=Number(M.pipeline?.version_id||M.version_id||0),U=A?`v${String(A).padStart(3,"0")}`:"\u7D22\u5F15";return`<option value="${r(String(M.id))}" ${String(M.id)===String(i.id)?"selected":""}>${r(`${$e(M.started_at)} \xB7 ${U} \xB7 ${gt(M.duration_ms)}`)}</option>`}).join(""),c=Number(o?.version_id||i.version_id||0),m=c?`v${String(c).padStart(3,"0")}`:"\u2014",$=o?.host||{},b=ti($),p=o?.model||i.model||"\u2014",g=Number(o?.total_ms)||Number(i.duration_ms)||0,y=Array.isArray(o?.stages)?o.stages:[],_=y.map((M,A)=>({...M,ms:Math.max(0,Number(M.duration_ms)||0),color:ei[A%ei.length]})).filter(M=>M.ms>0).map(M=>`<span class="index-pipeline-seg" style="width:${(M.ms/Math.max(1,g)*100).toFixed(2)}%;background:${r(M.color)}" title="${r(`${M.label} ${gt(M.ms)}`)}"></span>`).join(""),q=y.map((M,A)=>{let U=Math.max(0,Number(M.duration_ms)||0),V=g>0?U/g*100:0,J=M.host&&typeof M.host=="object"?M.host:null;return`<div class="index-pipeline-row">
        <span class="index-pipeline-step">${String(A+1).padStart(2,"0")}</span>
        <div class="index-pipeline-copy">
          <div class="index-pipeline-title">
            <strong>${r(M.label||M.key||"\u968E\u6BB5")}</strong>
            ${Ye(M.status||"success")}
          </div>
          <span class="index-pipeline-detail">${r(M.detail||"\u2014")}</span>
          ${J?`<span class="index-pipeline-host">${f("server",12)} ${r(ti(J))} \xB7 ${r(M.model||p)}</span>`:""}
        </div>
        <div class="index-pipeline-time">
          <strong>${gt(U)}</strong>
          <span>${V.toFixed(1)}%</span>
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
            <span><strong>\u7248\u672C</strong> ${r(m)}</span>
            <span><strong>collection</strong> ${r(String(o.collection||"\u2014"))}</span>
            <span><strong>\u6A21\u5F0F</strong> ${r(String(o.build_mode||"\u2014"))}</span>
            <span><strong>\u672C\u6B21</strong> ${o.resumed?`\u63A5\u7E8C\uFF08\u5DF2\u7D22\u5F15 ${d(o.resumed_indexed)} \u7B46\uFF09`:"\u65B0\u5EFA\u7248\u672C"}</span>
            <span><strong>Host</strong> ${r(b)}</span>
            <span><strong>Model</strong> ${r(String(p))}</span>
            <span><strong>\u7E3D\u8017\u6642</strong> ${gt(g)}</span>
          </div>
          <div class="index-pipeline-bar">${_}</div>
          <div class="index-pipeline-list">${q}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B Pipeline \u968E\u6BB5\u8CC7\u6599\uFF1B\u4E0B\u4E00\u6B21 Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u6703\u8A18\u9304 host/model \u8207\u5404\u968E\u6BB5\u8017\u6642\u3002</div>'}
  </section>`}function Kl(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,n=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${n} \u9801 \xB7
      \u986F\u793A ${d(i)}\u2013${d(o)} / ${d(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${ai.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${f("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=n?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${f("chevronRight",13)}</button>
    </div>
  </div>`}function Yl(e){let t=String(e?.module||"");return t.includes("static")||t.includes("frontend")?"#65a30d":t.includes("judgment.rag")?"#8b5cf6":t.includes("judgment.web.app")?"#3b82f6":t.includes("judgment.web.query")?"#d97706":t.includes("judgment.judgment_index")?"#0d9488":"#64748b"}function Xl(e){let t=$n(e),s=Math.max(0,Math.min(8,Number(e.depth)||0));return{key:"segment",label:`${"\u203A ".repeat(s)}${e.name||"unnamed"}`,hint:[e.module||"\u2014",e.function||"\u2014"].join(" \xB7 "),color:Yl(e),spans:[{...t,status:e.status||"ok",error:e.error,metadata:e.metadata||{},params:e.params||{},started_at:e.started_at,finished_at:e.finished_at}],start:t.offset,end:t.end,duration:t.duration}}function Sa(e){return(e||[]).map(Xl)}function Zl(e,t){let s=e.flow&&typeof e.flow=="object"?e.flow:null,a=Array.isArray(s?.segments)?[...s.segments].sort((b,p)=>Number(b.seq)-Number(p.seq)):[],n=s?.summary||{},i=Array.isArray(n.models)?n.models:[],o=s?.client||{},l=s?.metadata||{},u=l.question||"",c=l.answer||"",m=u||c?`<div class="perf-flow-qa">
          ${u?`<div class="perf-flow-qa-row"><strong>RAG \u554F\u984C</strong><span>${r(u)}</span></div>`:""}
          ${c?`<div class="perf-flow-qa-row"><strong>RAG \u7B54\u6848</strong><span>${r(c)}</span></div>`:""}
        </div>`:"",$=Math.max(Number(s?.total_ms)||0,Number(e.duration_ms)||0,...a.map(b=>(Number(b.offset_ms)||0)+(Number(b.duration_ms)||0)),1);return`<details class="perf-record" ${t===0?"open":""}>
    <summary class="perf-record-summary">
      <span class="perf-record-id">#${r(String(e.id))}</span>
      <span class="perf-record-main">
        <span class="perf-record-title">${r(e.process||"\u672A\u547D\u540D")}</span>
        <span class="perf-record-path mono">${r(e.method||"")} ${r(e.path||"")}</span>
      </span>
      <span class="perf-record-time">${$e(e.started_at)}</span>
      <span class="perf-record-duration">${fe(e.duration_ms)}</span>
      ${Ye(e.status)}
      <span class="perf-record-chevron">${f("chevronRight",14)}</span>
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
      ${m}
      ${i.length?`<div class="chips perf-record-models">${i.map(b=>`<span class="chip">${r(b)}</span>`).join("")}</div>`:""}
      ${a.length?xs(Sa(a),$,"\u6B64 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B segment \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u53C3\u6578\u3001module\uFF0Ffunction\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u932F\u8AA4\u3002"):`<div class="perf-no-flow">\u6B64\u7D00\u9304\u6C92\u6709 flow \u660E\u7D30\uFF08\u53EF\u80FD\u662F\u820A\u8CC7\u6599\u6216 CLI \u7D00\u9304\uFF09\u3002${e.params_text&&e.params_text!=="{}"?`<pre>${r(e.params_text)}</pre>`:""}</div>`}
      ${s?`<details class="flow-json">
              <summary>Flow JSON \xB7 ${a.length} \u6BB5</summary>
              <pre>${r(JSON.stringify(s,null,2))}</pre>
            </details>`:""}
    </div>
  </details>`}var si={embedding:"Embedding",retrieval:"Qdrant \u6AA2\u7D22",rerank:"Reranker",context:"PostgreSQL \u53D6\u6587",llm:"LLM \u751F\u6210",validation:"\u5F15\u7528\u9A57\u8B49"};function ec(e){return{pending:"\u7B49\u5F85",running:"\u57F7\u884C\u4E2D",success:"\u5B8C\u6210",partial:"\u90E8\u5206\u6210\u529F",failed:"\u5931\u6557",skipped:"\u7565\u904E"}[e]||e||"\u672A\u77E5"}var tc={embedding:"#3984c6",retrieval:"#d97706",rerank:"#8b5cf6",context:"#64748b",llm:"#16a34a",validation:"#8b5cf6"};function sc(e,t){let s=Date.parse(e.started_at||""),a=Date.now(),n=Array.isArray(e.stage_order)?[...e.stage_order]:Object.keys(si);for(let c of t)c.stage&&!n.includes(c.stage)&&n.push(c.stage);let i=[],o=0;for(let c of n){let m=t.filter(p=>p.stage===c);if(!m.length)continue;let $=m.map(p=>{let g=Date.parse(p.started_at||""),y=Number.isFinite(s)&&Number.isFinite(g)?Math.max(0,g-s):0,_=Math.max(0,Number(p.duration_ms)||0);p.status==="running"&&Number.isFinite(g)&&(_=Math.max(_,a-g));let q=y+_;return o=Math.max(o,q),{offset:y,end:q,duration:_,status:p.status==="failed"?"error":p.status==="running"?"running":"ok",started_at:p.started_at,finished_at:p.finished_at,error:p.error_message,metadata:{...p.details||{},model:p.model,status:p.status,progress:Number(p.progress)||0,module:p.module,function:p.function},params:{model:p.model}}}),b=$.reduce((p,g)=>p+g.duration,0);i.push({key:"test_stage",label:si[c]||c,hint:`${$.length} \u500B\u7A0B\u5E8F`,color:tc[c]||"#64748b",spans:$,start:$.length?Math.min(...$.map(p=>p.offset)):null,end:$.length?Math.max(...$.map(p=>p.end)):null,duration:b})}let l=e.status==="running"&&Number.isFinite(s)?Math.max(0,a-s):0,u=Math.max(Number(e.total_ms)||0,l,o,1);return{stages:i,total:u}}function As(e,t,s,a={}){let n=a.showHistory!==!1,i=[`<option value="" ${s?"":"selected"}>\u76EE\u524D\uFF0F\u6700\u65B0\u6E2C\u8A66</option>`,...(t||[]).map(q=>`<option value="${r(q.run_id)}" ${q.run_id===s?"selected":""}>${r(ec(q.status))} \xB7 ${r((q.question||"\u672A\u547D\u540D").slice(0,28))} \xB7 ${r($e(q.started_at))}</option>`)].join(""),o=n?`<label class="test-flow-select-label">\u6B77\u53F2
        <select class="select" id="test-run-select">${i}</select>
      </label>
      <button class="btn btn-secondary btn-sm" type="button" id="test-flow-refresh">
        ${f("refresh",13)}<span>\u66F4\u65B0</span>
      </button>`:`<a class="btn btn-secondary btn-sm" href="#/performance">
        ${f("activity",13)}<span>\u6B77\u53F2 Flow</span>
      </a>`,l=`<div class="test-flow-head">
    <div class="test-flow-heading">
      <div class="eyebrow">PERFORMANCE TEST FLOW</div>
      <div class="test-flow-title">\u6E2C\u8A66\u6D41\u7A0B ${e?Ye(e.status):""}</div>
      <div class="test-flow-question">${e?r(e.question||"\u672A\u547D\u540D\u6E2C\u8A66"):"\u5C1A\u7121\u6E2C\u8A66\u6D41\u7A0B\u3002\u8ACB\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u4E26\u5728 RAG \u9801\u63D0\u554F\u3002"}</div>
    </div>
    <div class="test-flow-actions">${o}</div>
  </div>`;if(!e)return`<div class="test-flow-panel card">${l}
      ${pt({iconName:"activity",title:"\u7B49\u5F85\u6E2C\u8A66\u6D41\u7A0B",text:"\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C\u6240\u6709\u53EF\u7528\u6A21\u578B\uFF0C\u4E26\u5728\u9019\u88E1\u5373\u6642\u986F\u793A\u6BCF\u500B\u968E\u6BB5\u7684\u9032\u5EA6\u3002"})}
    </div>`;let u=Array.isArray(e.steps)?e.steps:[],c=sc(e,u),m=e.models||{},$=e.status==="running"?`${fe(c.total)}\uFF08\u4F30\u7B97\uFF09`:fe(e.total_ms),b=u.find(q=>q.stage==="llm"&&q.model===e.summary?.primary_model)||u.find(q=>q.stage==="llm"&&q.details?.answer_preview),p=String(b?.details?.provider_name||"").trim(),g=p&&e.summary?.primary_model?`${p}:${e.summary.primary_model}`:e.summary?.primary_model||"",y=e.answer||b?.details?.answer_preview||"",_=`<div class="test-flow-answer">
    <div class="test-flow-answer-head">
      <span>RAG \u5F15\u64CE\u7B54\u6848</span>
      ${g?`<span class="mono">${r(g)}</span>`:""}
    </div>
    <p>${y?r(y):e.status==="running"?"\u6E2C\u8A66\u9032\u884C\u4E2D\uFF0C\u5C1A\u672A\u7522\u751F\u6700\u7D42\u7B54\u6848\u3002":"\u6B64\u6E2C\u8A66\u6C92\u6709\u4FDD\u5B58\u53EF\u986F\u793A\u7684\u7B54\u6848\u3002"}</p>
  </div>`;return`<div class="test-flow-panel card">
    ${l}
    <div class="test-flow-meta">
      <span><strong>Run</strong> <span class="mono">${r(e.run_id)}</span></span>
      <span><strong>\u958B\u59CB</strong> ${r($e(e.started_at))}</span>
      <span><strong>\u7E3D\u8017\u6642</strong> ${$}</span>
      <span><strong>Embedding</strong> ${Array.isArray(m.embedding)?m.embedding.length:0} \u500B</span>
      <span><strong>LLM</strong> ${Array.isArray(m.llm)?m.llm.length:0} \u500B</span>
      <span><strong>\u968E\u6BB5</strong> ${r(e.stage_label||e.stage||"\u2014")}</span>
    </div>
    ${_}
    ${c.stages.length?xs(c.stages,c.total,"\u6E2C\u8A66 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B\u7A0B\u5E8F\u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u6A21\u578B\u3001\u72C0\u614B\u3001\u9032\u5EA6\u3001module\uFF0Ffunction \u8207\u932F\u8AA4\u3002"):'<p class="muted">\u6B64\u6E2C\u8A66\u6C92\u6709\u5340\u6BB5\u8CC7\u6599\u3002</p>'}
    <div class="test-flow-foot">
      <span>${e.status==="running"?"\u6E2C\u8A66\u57F7\u884C\u4E2D\uFF1B\u6B64\u5716\u8868\u6703\u81EA\u52D5\u66F4\u65B0\u3002":n?"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u5F9E\u4E0A\u65B9\u300C\u6B77\u53F2\u300D\u9078\u55AE\u9084\u539F\u5176\u4ED6 Flow\u3002":"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u81F3\u6548\u80FD\u5831\u8868\u67E5\u770B\u6B77\u53F2 Flow\u3002"}</span>
      ${g?`<span class="mono">primary=${r(g)}</span>`:""}
    </div>
  </div>`}function ac(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.summary)?e.summary:[],a=e.flow_stats||e.meta?.flow_stats||{},n=e.index_stats||null;return`<div class="report-card performance-flow-report" data-database="performance">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">PERFORMANCE FLOW REPORT</div>
        <div class="report-title">
          \u6548\u80FD\u5831\u8868 ${Ye(e.status||"ok")}
          <span class="chip">performance_records</span>
        </div>
        <div class="report-sub">
          ${d(e.total)} \u7B46\u7B26\u5408 \xB7 ${fe(e.duration_ms)} \xB7
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
    ${Wl(n)}
    ${Ul(a)}
    <div class="report-section-head perf-flow-list-head">
      <span class="report-section-title">Flow \u7D00\u9304</span>
      <span class="muted" style="font-size:9.5px">\u9EDE\u64CA\u5217\u5C55\u958B\u6A21\u7D44\u3001\u51FD\u6578\u3001\u53C3\u6578\u8207\u5340\u6BB5\u8017\u6642</span>
    </div>
    <div class="perf-record-list">
      ${t.length?t.map((i,o)=>Zl(i,o)).join(""):pt({iconName:"activity",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684 Flow",text:"\u653E\u5BEC\u65E5\u671F\u3001\u6A21\u578B\u6216\u8017\u6642\u689D\u4EF6\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}
    </div>
    ${Kl(e)}
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
  </div>`}async function nc(e,t){let s=!1,a=hn(),n={processes:[],modules:[],statuses:[],methods:[],models:[]},i=1,o=25,l=null,u=[],c="",m=!1,$=null,b=!1,p=null,g="",y=!1,_=null,q=!1;e.innerHTML=`<section class="page data-page performance-page">
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
              <div id="performance-report">${Us({label:"\u6548\u80FD\u5831\u8868"})}</div>
            </section>
          </div>
        </div>
        <div id="performance-panel-pipeline" hidden></div>
        <div id="performance-panel-index-pipeline" hidden></div>
        <div id="performance-panel-benchmark" hidden></div>
      </section>
    </div>
  </section>`;let M=e.querySelector("#performance-filter-fields"),A=e.querySelector("#performance-filter-form"),U=e.querySelector("#performance-test-flow"),V=e.querySelector("#performance-report"),J=e.querySelector("#performance-panel-pipeline"),ke=e.querySelector("#performance-panel-index-pipeline"),Se=e.querySelector("#performance-meta"),F=e.querySelector("#performance-refresh"),T=[...e.querySelectorAll("[data-performance-tab]")],S={overview:e.querySelector("#performance-panel-overview"),pipeline:e.querySelector("#performance-panel-pipeline"),"index-pipeline":e.querySelector("#performance-panel-index-pipeline"),benchmark:e.querySelector("#performance-panel-benchmark")},E="overview",se=w=>{E=w;for(let j of T){let W=j.dataset.performanceTab===w;j.classList.toggle("is-active",W),W?j.setAttribute("aria-current","page"):j.removeAttribute("aria-current")}for(let[j,W]of Object.entries(S))W&&(W.hidden=j!==w);w==="benchmark"?Se.textContent="BENCHMARK \xB7 RAG":w==="pipeline"?Se.textContent="PERFORMANCE \xB7 RAG WATERFALL":w==="index-pipeline"?Se.textContent="PERFORMANCE \xB7 INDEX PIPELINE":l&&(Se.textContent=`PERFORMANCE \xB7 ${d(l.total)} \u7B46`)},le=Ir(e,{onNavigate:w=>se(w)}),Q=()=>{J&&(J.innerHTML=zl(u,c,m,$))},pe=async({force:w=!1}={})=>{if(!(s||m)){if(b&&!w){Q();return}m=!0,u.length||Q();try{let j=await K.performance({keyword:"/api/rag"},1,50);if(s)return;let W=(Array.isArray(j.rows)?j.rows:[]).filter(H=>H.flow&&(String(H.path||"").includes("/api/rag")||String(H.process||"").includes("RAG")));u=W,(!c||!W.some(H=>String(H.id)===String(c)))&&(c=W[0]?String(W[0].id):""),$=null,b=!0}catch(j){if(s)return;$=j}finally{s||(m=!1,Q())}}},ye=()=>{ke&&(ke.innerHTML=Vl(p,g,y,_))},I=async({force:w=!1}={})=>{if(!(s||y)){if(q&&!w){ye();return}y=!0,p||ye();try{let j=await K.performance({},1,1);if(s)return;p=j.index_pipeline||j.index_stats||null;let W=Array.isArray(p?.runs)?p.runs:[];(!g||!W.some(H=>String(H.id)===String(g)))&&(g=p?.latest?String(p.latest.id):""),_=null,q=!0}catch(j){if(s)return;_=j}finally{s||(y=!1,ye())}}},we=w=>{se(w),w==="benchmark"&&le.show(),w==="pipeline"&&pe(),w==="index-pipeline"&&I()};e.addEventListener("click",w=>{let j=w.target.closest("[data-performance-tab]");j&&we(j.dataset.performanceTab||"overview")}),J?.addEventListener("change",w=>{w.target.matches("[data-rag-trace-select]")&&(c=String(w.target.value||""),Q())}),J?.addEventListener("click",w=>{w.target.closest('[data-action="refresh-rag-waterfall"]')&&pe({force:!0})}),ke?.addEventListener("change",w=>{w.target.matches("[data-index-pipeline-select]")&&(g=String(w.target.value||""),ye())}),ke?.addEventListener("click",w=>{w.target.closest('[data-action="refresh-index-pipeline"]')&&I({force:!0})});let G=null,he=[],Te="",ne=null,me="",ge=()=>{M.innerHTML=Rl(n,a)},Le=()=>{let w=JSON.stringify({selected:Te,tick:G?.status==="running"?Math.floor(Date.now()/1e3):0,runs:he.map(j=>`${j.run_id}:${j.status}`),run:G?{run_id:G.run_id,status:G.status,progress:G.progress,total_ms:G.total_ms,steps:(G.steps||[]).map(j=>`${j.stage}:${j.model}:${j.status}:${j.progress}:${j.duration_ms}`)}:null});w!==me&&(me=w,U.innerHTML=As(G,he,Te))},be=async()=>{try{let w=await K.testRuns(30);if(s)return;he=Array.isArray(w.runs)?w.runs:[]}catch{if(s)return;he=[]}},Ee=async(w=null)=>{try{let j=w&&!Te?w:Te?await K.testRun(Te):await K.testRunCurrent();if(s)return;G=j.run||null,!Te&&G&&G.status!=="running"&&!he.some(W=>W.run_id===G.run_id)&&await be(),Le()}catch{if(s)return;G=null,Le()}},Fe=async(w=null)=>{s||Te||await Ee(w)},et=()=>{s||ne||(ne=xt("test-runs",(w,j)=>Fe(j?.snapshot||null)))};U.addEventListener("change",async w=>{w.target.id==="test-run-select"&&(Te=String(w.target.value||""),await Ee())}),U.addEventListener("click",async w=>{w.target.closest("#test-flow-refresh")&&(Te="",await be(),await Ee())});let P=async(w=i,{quiet:j=!1}={})=>{i=Math.max(1,Number(w)||1),a=Yr();let W=V.querySelector(".report-card"),H=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!W?V.setAttribute("aria-busy","true"):(V.removeAttribute("aria-busy"),V.innerHTML=Us({label:"\u6548\u80FD\u5831\u8868"}));let Ce=e.querySelector("#performance-run");j||Ne(Ce,!0,"\u67E5\u8A62\u4E2D\u2026");try{let Pe=await K.performance(a,i,o);if(s)return;if(l=Pe,Pe.index_pipeline){p=Pe.index_pipeline;let st=Array.isArray(p.runs)?p.runs:[];(!g||!st.some(lt=>String(lt.id)===String(g)))&&(g=p.latest?String(p.latest.id):""),q=!0,_=null}if(i=Number(Pe.page)||i,o=Number(Pe.page_size)||o,V.removeAttribute("aria-busy"),V.innerHTML=ac(Pe),H!==null){let st=V.querySelector("[data-page-size]");st&&(st.value=String(o),st.focus({preventScroll:!0}))}Se.textContent=`PERFORMANCE \xB7 ${d(Pe.total)} \u7B46`,Se.className="badge badge-neutral badge-mono"}catch(Pe){if(s)return;V.removeAttribute("aria-busy"),V.innerHTML=ha(Pe,{label:"\u6548\u80FD\u5831\u8868"}),C(Pe.message||"\u6548\u80FD\u5831\u8868\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{s||Ne(Ce,!1)}},B=async()=>{try{n=await K.performanceOptions()}catch{n={processes:[],modules:[],statuses:[],methods:[],models:[]}}ge()};return A.addEventListener("submit",w=>{w.preventDefault(),P(1)}),e.querySelector('[data-action="reset"]').addEventListener("click",()=>{a=hn(),i=1,ge(),P(1)}),F.addEventListener("click",async()=>{if(E==="pipeline"){Ne(F,!0,"\u6574\u7406\u4E2D\u2026");try{await pe({force:!0})}finally{s||Ne(F,!1)}return}if(E==="index-pipeline"){Ne(F,!0,"\u6574\u7406\u4E2D\u2026");try{await I({force:!0})}finally{s||Ne(F,!1)}return}if(E==="benchmark"){Ne(F,!0,"\u6574\u7406\u4E2D\u2026");try{await le.refresh()}finally{s||Ne(F,!1)}return}a=Yr(),F.disabled=!0,Ne(F,!0,"\u6574\u7406\u4E2D\u2026"),await B(),await be(),s||await Ee(),s||await P(1),s||(F.disabled=!1,Ne(F,!1))}),V.addEventListener("click",async w=>{let j=w.target.closest("[data-action]");if(!j||!l)return;let W=j.dataset.action;if(W==="retry"){P(i);return}if(W==="prev-page"){P(Math.max(1,Number(l.page)-1),{quiet:!0});return}if(W==="next-page"){let H=Math.max(1,Math.ceil(Number(l.total)/Number(l.page_size)));P(Math.min(H,Number(l.page)+1),{quiet:!0});return}if(W==="copy-query"){let H=await hs(l.query_text||"");C(H?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",H?"ok":"warn");return}if(W==="export-json"){let H=`performance-page-${l.page}.json`;Ut(H,JSON.stringify(ya(l),null,2),"application/json;charset=utf-8"),C(`\u5DF2\u532F\u51FA ${H}`,"ok");return}if(W==="export-csv"){let H=`performance-page-${l.page}.csv`;Ut(H,$a(l),"text/csv;charset=utf-8"),C(`\u5DF2\u532F\u51FA ${H}`,"ok")}}),V.addEventListener("change",w=>{w.target.matches("[data-page-size]")&&(o=Number(w.target.value)||25,ai.includes(o)||(o=25),P(1,{quiet:!0}))}),await Promise.allSettled([B(),be()]),s||(await Ee(),await P(1),et()),t&&typeof t.setTitle=="function"&&t.setTitle("\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"),()=>{s=!0,ne&&ne(),le.destroy()}}var rc=["\u91D1\u878D\u6D88\u8CBB\u8005\u4FDD\u8B77\u6CD5\u5982\u4F55\u8655\u7406\u91D1\u878D\u6D88\u8CBB\u722D\u8B70\uFF1F","\u8B49\u5238\u4EA4\u6613\u6CD5\u5C0D\u5167\u7DDA\u4EA4\u6613\u6709\u4EC0\u9EBC\u898F\u7BC4\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5438\u6536\u5B58\u6B3E\u8207\u6388\u4FE1\u6709\u54EA\u4E9B\u9650\u5236\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5F9E\u696D\u4EBA\u54E1\u6709\u90A3\u4E9B\u898F\u5B9A\uFF1F","\u4FDD\u96AA\u6CD5\u5C0D\u65BC\u696D\u52D9\u54E1\u4E0D\u7576\u62DB\u652C\u7684\u8CAC\u4EFB\u898F\u5B9A\uFF1F","\u9280\u884C\u6CD5\u6709\u591A\u5C11\u689D\u6587\uFF1F","\u8B49\u5238\u71DF\u696D\u54E1\u5E38\u89F8\u72AF\u4EC0\u9EBC\u6CD5\u898F\u6216\u547D\u4EE4\uFF1F","\u6709\u54EA\u4E9B\u6CD5\u898F\u662F\u548C\u58FD\u96AA\u53CA\u7522\u96AA\u76F8\u95DC\u7684\uFF1F"];function ic(){return`<div class="answer-placeholder">
    <span class="empty-icon">${f("sparkles",26)}</span>
    <h2 class="empty-title">\u7B54\u6848\u53EA\u6703\u4F86\u81EA\u6AA2\u7D22\u5230\u7684\u5224\u6C7A\u53CA\u6CD5\u898F\u7247\u6BB5</h2>
    <p class="empty-text">\u9001\u51FA\u554F\u984C\u5F8C\uFF0C\u7CFB\u7D71\u6703\u5148\u4EE5 Qdrant \u6AA2\u7D22\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\u4E26\u6A19\u793A\u5F15\u7528\u7DE8\u865F\u3002
      \u82E5\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u660E\u78BA\u986F\u793A\u964D\u7D1A\u72C0\u614B\uFF0C\u4E0D\u6703\u6191\u7A7A\u751F\u6210\u7B54\u6848\u3002</p>
  </div>`}function Sn(){return`<section class="card answer-card rag-empty-answer">${ic()}</section>`}function ui(e,t){return`<div class="rag-turn">
    <div class="rag-user-bubble">${r(e)}</div>
    <section class="card rag-assistant-turn" data-rag-answer>${t}</section>
  </div>`}function oc(e,t){return Promise.race([e,new Promise((s,a)=>{window.setTimeout(()=>a(new Error("pipeline lookup timed out")),t)})])}async function lc(e){if(!e||e.pipeline_flow)return e;let t=String(e._client_request_id||e.request_id||"").trim();if(!t)return e;for(let s=0;s<3;s+=1){try{let a=await oc(K.performance({keyword:t},1,5),1800),n=(Array.isArray(a.rows)?a.rows:[]).find(i=>String(i.request_id||"")===t&&i.flow&&typeof i.flow=="object");if(n)return e.pipeline_flow=n.flow,e}catch{}s<2&&await new Promise(a=>window.setTimeout(a,250))}return e}function cc(e){return{status:e.status,answer:e.answer,answer_source:e.answer_source,notice:e.notice,citations:Array.isArray(e.citations)?e.citations:[],judgments:Array.isArray(e.judgments)?e.judgments:[],law_sources:Array.isArray(e.law_sources)?e.law_sources:[],matched_terms:Array.isArray(e.matched_terms)?e.matched_terms:[],law_answer:e.law_answer,law_framework:e.law_framework,llm_model:e.llm_model,embedding_model:e.embedding_model,duration_ms:e.duration_ms,show_sources:e.show_sources,pipeline_flow:e.pipeline_flow||null,test_run:e.test_run||null,partial:!1,streaming:!1}}var dc={"http.request":"FastAPI \u63A5\u6536\u8ACB\u6C42","http.response":"\u56DE\u50B3\u7D50\u679C\u7D66\u524D\u7AEF","rag.answer_question":"RAG \u4E3B\u6D41\u7A0B","rag.coverage":"PostgreSQL \u7D22\u5F15\u8986\u84CB\u6AA2\u67E5","rag.law_retrieval":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22","rag.law_lookup":"\u6BD4\u5C0D\u554F\u984C\u4E2D\u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u540D\u7A31","rag.law_content":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u689D\u6587","rag.qdrant_precheck":"Qdrant collection \u6AA2\u67E5","rag.search":"RAG \u6AA2\u7D22","rag.embed_query":"Ollama embedding \u67E5\u8A62\u5411\u91CF","rag.qdrant_search":"Qdrant \u5411\u91CF\u641C\u5C0B","rag.fetch_documents":"PostgreSQL \u8B80\u53D6\u5224\u6C7A","rag.postgres_fetch":"PostgreSQL \u5224\u6C7A\u67E5\u8A62","rag.build_citations":"\u6574\u7406\u5F15\u7528\u8207\u5224\u6C7A\u7247\u6BB5","rag.extract_excerpt":"\u64F7\u53D6\u76F8\u95DC\u7247\u6BB5","rag.llm":"LLM \u56DE\u7B54\u751F\u6210","rag.llm_request":"Ollama LLM \u751F\u6210","rag.validate_citations":"\u9A57\u8B49\u5F15\u7528\u7DE8\u865F","rag.test_mode":"\u6E2C\u8A66\u6A21\u5F0F\u591A\u6A21\u578B\u6D41\u7A0B","rag.preview_fallback":"\u6CD5\u898F\u9810\u89BD\u964D\u7D1A"};function uc(e){let t=String(e?.name||""),s=e?.params||{},a=String(s.model||s.embedding_model||"").trim();return t==="rag.llm_request"?`Ollama run ${a||"LLM"}`:t==="rag.llm"?`LLM \u56DE\u7B54\u751F\u6210${a?` \xB7 ${a}`:""}`:t==="rag.embed_query"?`Ollama embedding \u67E5\u8A62\u5411\u91CF${a?` \xB7 ${a}`:""}`:dc[t]||t||"backend step"}function pi(e){return[e?.module,e?.function,e?.name].filter(Boolean).join(" \xB7 ")}function mi(e){let t=Number(e);return Number.isFinite(t)?`${d(Math.max(0,Math.round(t)))} ms`:"\u2014"}function xn(e,t){if(!e)return;e.classList.toggle("is-open",t);let s=e.querySelector("#rag-process-body"),a=e.querySelector(".rag-process-toggle");s&&(s.hidden=!t),a&&(a.setAttribute("aria-expanded",String(t)),a.title=t?"\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B":"\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B")}function pc(){return`<div class="rag-process is-open" id="rag-process">
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
  </div>`}function mc(e){let t=e.querySelector("#rag-process"),s=t?.querySelector("#rag-process-list"),a=t?.querySelector("#rag-process-summary"),n=performance.now(),i=new Map,o=new Map,l=(p,g,y)=>{let _=p.querySelector(g);_&&(_.textContent=y)},u=p=>{if(p.failed){l(p.element,".rag-process-meta","\u5931\u6557");return}if(p.hasChildren){l(p.element,".rag-process-meta","");return}l(p.element,".rag-process-meta",mi(p.durationMs))},c=p=>{let g=p-1,y=[...i.values()].reverse();for(let _ of y){if(g<0)break;_.depth<=g&&(_.hasChildren||(_.hasChildren=!0,_.element.dataset.hasChildren="true",_.finished&&u(_)),g=_.depth-1)}},m=p=>{if(!s)return null;let g=String(p?.seq??`step-${i.size+1}`),y=i.get(g);if(!y){let _=Math.max(0,Math.min(6,Number(p?.depth)||0));c(_);let q=document.createElement("div");q.className="rag-process-item is-running",q.dataset.processKey=g,q.style.setProperty("--depth",String(_)),q.innerHTML=`<span class="rag-process-dot"></span>
        <span class="rag-process-label"></span>
        <span class="rag-process-meta">\u57F7\u884C\u4E2D\u2026</span>`,s.appendChild(q),y={element:q,depth:_,hasChildren:!1,finished:!1,failed:!1,durationMs:0},i.set(g,y)}return l(y.element,".rag-process-label",uc(p)),y.element.title=pi(p),y};return{step:p=>{let g=p?.segment;if(!g)return;o.set(String(g.seq??g.name??o.size),{...g});let y=m(g);if(y){if(p.type==="segment_start"){y.element.classList.add("is-running"),l(y.element,".rag-process-meta","\u57F7\u884C\u4E2D\u2026");return}if(p.type==="segment_end"){let _=g.status==="error";y.element.classList.remove("is-running"),y.element.classList.toggle("is-error",_),y.finished=!0,y.failed=_,y.durationMs=Number(g.duration_ms)||0,u(y),y.element.title=[pi(g),_&&g.error||""].filter(Boolean).join(" \xB7 ")}}},finish:(p=!0)=>{if(!t)return"";t.querySelectorAll(".rag-process-item.is-running").forEach(q=>{q.classList.remove("is-running");let M=q.dataset.hasChildren==="true";l(q,".rag-process-meta",M?"":p?"\u5B8C\u6210":"\u4E2D\u65B7")});let g=s?.children.length||i.size,y=mi(Math.max(0,performance.now()-n));a&&(a.textContent=p?`\u5B8C\u6210 \xB7 ${g} \u6B65 \xB7 ${y}`:`\u5931\u6557 \xB7 ${g} \u6B65`);let _=[...o.values()].filter(q=>q?.name).sort((q,M)=>Number(q.offset_ms||0)-Number(M.offset_ms||0));if(s&&_.length){let q=Math.max(1,..._.map(M=>Number(M.end_offset_ms)||(Number(M.offset_ms)||0)+(Number(M.duration_ms)||0)));s.classList.add("is-waterfall"),s.innerHTML=xs(Sa(_),q,"\u5F8C\u7AEF Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B span \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u53C3\u6578\u3001module\uFF0Ffunction\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u932F\u8AA4\u3002")}return t.classList.add("is-complete"),xn(t,!1),t.outerHTML},collapse:()=>xn(t,!1)}}function gc(e,t=!1){let s=t?"\u6E2C\u8A66\u6A21\u5F0F\uFF1A\u6B63\u5728\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207 LLM \u6A21\u578B\uFF0C\u53EF\u80FD\u9700\u8981\u6578\u5206\u9418\u2026":"\u6B63\u5728\u4EE5\u5411\u91CF\u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\u7247\u6BB5\u4E26\u751F\u6210\u56DE\u7B54\uFF1B\u5FEB\u901F\u6A21\u5F0F\u901A\u5E38 2\u201310 \u79D2\u2026";return`<div class="answer-head">
      <div class="answer-head-left">${f("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u4E2D</span>
      </div>
      <div class="answer-head-meta"><span class="spinner"></span></div>
      ${t?"":pc()}
    </div>
    <div class="answer-body">
      <p class="answer-text">${s}\u300C${r(e)}\u300D</p>
      <div class="skeleton skeleton-line" style="margin-top:22px;width:92%"></div>
      <div class="skeleton skeleton-line" style="width:76%"></div>
      <div class="skeleton skeleton-line" style="width:84%"></div>
    </div>`}function gi(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function Aa(e,{lawKey:t="",sourceType:s="",label:a=""}={}){let n=String(e||"").trim();return n?`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${r(t||n)}"
    data-source-type="${r(s||"")}"
    title="\u9EDE\u64CA\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587">${r(a||n)}</button>`:""}function vi(e){let t=String(e?.law_name||"").trim(),s=String(e?.article_no||"").replace(/\s+/g,"");if(!t||!s)return"";let a=(Array.isArray(e?.paragraphs)?e.paragraphs:[]).map(i=>String(i||"").trim()).filter(Boolean),n=`${t}${s}${a.join("\u3001")}`;return`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${r(t)}"
    data-source-type=""
    data-article-no="${r(s)}"
    title="\u9EDE\u64CA\u67E5\u770B ${r(n)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587">${r(n)}</button>`}function fc(e,t){let s=e.score===null||e.score===void 0?"":`\u76F8\u4F3C\u5EA6 ${Number(e.score).toFixed(4)}`,a=[e.court,e.jdate,s].filter(Boolean).map(c=>`<span>${r(c)}</span>`).join(""),n=(Array.isArray(e.law_citations)?e.law_citations:[]).map(c=>vi(c)).filter(Boolean).slice(0,12).join(""),i=n||(Array.isArray(e.matched_laws)?e.matched_laws:[]).slice(0,5).map(c=>Aa(c)).join(""),o=n?'<div class="citation-meta"><span>\u5224\u6C7A\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4</span></div>':"",l=e.jid?` data-action="open-parquet-judgment"
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
  </article>`}function bc(e,t){let s=[e.law_level,e.law_category,e.article_count?`${d(e.article_count)} \u689D`:""].filter(Boolean).map(o=>`<span>${r(o)}</span>`).join(""),a=e.law_url?`<a class="citation-link" href="${r(e.law_url)}" target="_blank" rel="noopener noreferrer">\u4F86\u6E90${f("external",11)}</a>`:"",n=e.law_key||e.law_name||"",i=n?` data-action="open-law-source"
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
  </article>`}function vc(e,t){let s=e.source_label||(e.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),a=e.law_level&&e.law_level!==s?e.law_level:"",n=[`<span class="badge ${e.source_type==="order"?"badge-warn":"badge-info"}">${r(s)}</span>`,a,e.law_category,e.article_count?`${d(e.article_count)} \u689D`:"",e.law_modified_date?`\u7570\u52D5 ${zt(e.law_modified_date)}`:""].filter(Boolean).map(p=>`<span>${p}</span>`).join(""),i=e.first_promulgation?`<div class="citation-meta"><span>\u6700\u65E9\u5236\u5B9A\uFF1A${r(e.first_promulgation.roc_date)}\uFF08\u897F\u5143 ${r(e.first_promulgation.gregorian_date)}\uFF09</span></div>`:"",o=e.stats,l=o?`<div class="law-source-stats">
        <span>\u63D0\u53CA\u300C${r(o.entity||"")}\u300D\u7684\u5224\u6C7A ${d(o.judgment_count||0)} \u7B46</span>
        <span>\u672C\u6CD5\u898F\u88AB\u5F15\u7528 ${d(o.law_count||0)} \u6B21</span>
      </div>`:"",u=e.law_key||"",c=e.source_type||"",m=(Array.isArray(e.articles)?e.articles:[]).map(p=>{let g=String(p.article_no||"");return`<div class="law-source-article"${u&&g?` data-action="open-law-source"
        data-law-key="${r(u)}"
        data-source-type="${r(c)}"
        data-article-no="${r(g)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u9078\u67E5\u770B ${r(g)} \u7684\u5B8C\u6574\u5167\u5BB9"
        aria-label="\u958B\u555F ${r(e.law_name||"\u6CD5\u898F")} ${r(g)} \u7684\u5B8C\u6574\u689D\u6587"`:""}>
        <span class="law-source-article-no">${r(p.article_no||"\u689D\u6587")}</span>
        <p class="law-source-article-text">${r(p.article_content||"")}</p>
      </div>`}).join(""),$=e.law_url?`<a class="citation-link" href="${r(e.law_url)}" target="_blank" rel="noopener noreferrer">\u6CD5\u898F\u4F86\u6E90${f("external",11)}</a>`:"",b=e.law_key?` data-action="open-law-source"
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
    <div class="citation-links">${$}</div>
  </article>`}function hc(e,t=150){let s=String(e||"").replace(/\s+/g," ").trim();return s?s.length>t?`${s.slice(0,t)}\u2026`:s:""}function $c(e,t){return!Array.isArray(e)||!e.length?`<p class="answer-text">${r(t)}</p>`:`<div class="law-answer-list">${e.map(s=>{let a=s.law_key||"",n=s.source_type||"",i=s.law_name||"\u672A\u547D\u540D\u6CD5\u898F",o=s.source_label||(n==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),l=Number(s.article_count||0),u=s.index!=null?`<span class="law-answer-index">[${r(String(s.index))}]</span>`:"",c=a?`<button class="law-answer-law" type="button"
            data-action="open-law-source"
            data-law-key="${r(a)}"
            data-source-type="${r(n)}"
            title="\u9EDE\u64CA\u958B\u555F ${r(i)} \u7684\u5B8C\u6574\u689D\u6587"
            aria-label="\u958B\u555F ${r(i)} \u7684\u5B8C\u6574\u689D\u6587">${r(i)}</button>`:`<strong>${r(i)}</strong>`,m=Array.isArray(s.articles)?s.articles:[],$=m.length?`<div class="law-answer-articles-label">\u76F8\u95DC\u689D\u6587</div>
          <div class="law-answer-articles">${m.map(b=>{let p=String(b.article_no||"").trim(),g=hc(b.article_content);return!a||!p?`<div class="law-answer-article is-static">
                  <span class="law-answer-article-no">${r(p||"\u689D\u6587")}</span>
                  <span class="law-answer-article-text">${r(g)}</span>
                </div>`:`<button class="law-answer-article" type="button"
                data-action="open-law-source"
                data-law-key="${r(a)}"
                data-source-type="${r(n)}"
                data-article-no="${r(p)}"
                title="\u9EDE\u64CA\u67E5\u770B ${r(p)} \u7684\u5B8C\u6574\u5167\u5BB9"
                aria-label="\u958B\u555F ${r(i)} ${r(p)} \u7684\u5B8C\u6574\u689D\u6587">
                <span class="law-answer-article-no">${r(p)}</span>
                <span class="law-answer-article-text">${r(g)}</span>
              </button>`}).join("")}</div>`:"";return`<div class="law-answer-source">
        <div class="law-answer-source-head">
          ${c}
          <span class="law-answer-source-meta">\uFF08${r(o)}\uFF0C${d(l)} \u689D\uFF09</span>
          ${u}
        </div>
        ${$}
      </div>`}).join("")}</div>`}function yc(e,t){if(!Array.isArray(e)||!e.length)return"";let s=new Map((Array.isArray(t)?t:[]).map(a=>[String(a.law_name||""),a]));return`<div class="answer-section-label" style="margin-top:18px">
      <span>\u547D\u4E2D\u8A5E\u5F59</span>
    </div>
    <div class="chips">${e.map(a=>{let n=s.get(String(a));return n?.law_key?Aa(a,{lawKey:n.law_key,sourceType:n.source_type||""}):`<span class="chip">${r(a)}</span>`}).join("")}</div>`}function wc(e,t){if(!e)return"";let s=Array.isArray(e.providers)?e.providers:[],a=e.active||s.find(c=>c.active),n=String(e.status||""),i=String(e.model||"").trim(),o=a?`${a.name}:${i}`:n==="not_configured"?"\u672A\u555F\u7528":"\u7121\u53EF\u7528\u6A21\u578B",l=s.map(c=>{let m=c.status==="operational",$=!!c.active||c===a,b=`${c.name||"reranker"}:${i}`,p=$?"\u4F7F\u7528\u4E2D":m?c.role==="fallback"?"fallback":"\u4E3B\u8981":"\u96E2\u7DDA";return`<span class="rag-model-button is-static${$?" is-active":""}${m?"":" is-unavailable"}"
        title="${r(`${b} \xB7 ${c.url||""}`)}"
        aria-label="${r(`${b}\uFF0C${p}`)}">
        <span class="rag-model-state" aria-hidden="true"></span>
        <span>${r(b)}</span>
        <span class="rag-model-current">${r(p)}</span>
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
  </div>`}function xa({tone:e,title:t,text:s,models:a,currentModel:n,currentProviderName:i,baseUrl:o,modelState:l,untestedProviders:u=[],rerank:c=null,rerankRefreshing:m=!1,busy:$,refreshing:b}){let p=e==="ok"?"is-ok":e==="warn"?"is-warn":"is-info",g=e==="ok"?"check":e==="warn"?"alert":"info",y=e==="ok"?"badge-ok":e==="warn"?"badge-warn":"badge-info",_=Array.isArray(a)?a:[],q=[...new Set(_.map(J=>J.providerName).filter(Boolean))],M=n&&i?`${i}:${n}`:n,A=_.map(J=>{let ke=J.model===n&&(!i||J.providerName===i),Se=J.providerName?`${J.providerName}:${J.model}`:J.model;return`<button class="rag-model-button${ke?" is-active":""}" type="button" data-rag-model="${r(J.model)}"
        data-rag-provider="${r(J.hostId===null||J.hostId===void 0?"":String(J.hostId))}"
        title="${r(Se)}"
        aria-pressed="${ke}" ${$||b?"disabled":""}>
        <span class="rag-model-state" aria-hidden="true"></span>
        <span>${r(Se)}</span>
        ${ke?'<span class="rag-model-current">\u4F7F\u7528\u4E2D</span>':""}
      </button>`}).join(""),U=(l?.models||[]).filter(J=>J.status==="untested").length,V=l?U?`\u5C1A\u6709 ${d(U)} \u500B\u6A21\u578B\u672A\u6E2C\u8A66 chat \u80FD\u529B\uFF1B\u6309\u300C\u6AA2\u67E5\u6A21\u578B\u300D\u5F8C\u5373\u53EF\u5207\u63DB\u3002`:"\u76EE\u524D provider \u6C92\u6709\u53EF\u7528\u7684 chat \u6A21\u578B\u3002":"\u7121\u6CD5\u53D6\u5F97\u6A21\u578B\u6E05\u55AE\uFF1B\u8ACB\u78BA\u8A8D Ollama \u670D\u52D9\u662F\u5426\u555F\u52D5\u3002";return`<section class="rag-mode-card ${p}">
    <div class="rag-mode-head">
      <span class="rag-mode-icon" aria-hidden="true">${f(g,14)}</span>
      <div class="rag-mode-copy">
        <strong>${r(t)}</strong>
        <p>${r(s)}</p>
      </div>
      <span class="badge ${y}">${d(_.length)} \u500B chat model${q.length?` \xB7 ${q.length} \u53F0\u4E3B\u6A5F`:""}</span>
    </div>
    <div class="rag-model-strip">
      <div class="rag-model-strip-head">
        <span class="rag-model-strip-title">${f("brain",13)} Chat models</span>
        ${o?`<span class="rag-model-strip-base mono">${r(o)}</span>`:""}
        <span class="rag-model-strip-current">${M?`\u76EE\u524D\uFF1A<strong>${r(M)}</strong>`:"\u5C1A\u672A\u9078\u64C7"}</span>
        <button class="btn btn-ghost btn-sm rag-model-refresh" type="button"
          data-rag-action="refresh-chat-models"
          ${$||b?"disabled":""}>
          ${f("refresh",12)}<span>${b?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u6A21\u578B"}</span>
        </button>
      </div>
      ${A?`<div class="rag-model-buttons">${A}</div>
             <p class="rag-model-hint">\u9EDE\u9078\u6A21\u578B\u5207\u63DB\uFF1B\u5207\u63DB\u5F8C\u5957\u7528\u4E0B\u4E00\u6B21\u63D0\u554F\uFF0C\u4E0D\u5F71\u97FF\u5DF2\u5B8C\u6210\u7684\u56DE\u7B54\u3002</p>`:`<p class="rag-model-empty">${r(V)}</p>`}
      ${u.length?`<p class="rag-model-hint rag-model-untested-hint">${r(u.join("\u3001"))} \u5C1A\u6709\u6A21\u578B\u5C1A\u672A\u6AA2\u67E5 chat \u80FD\u529B\uFF1B\u8ACB\u6309\u300C\u6AA2\u67E5\u6A21\u578B\u300D\u3002</p>`:""}
    </div>
    ${wc(c,m)}
  </section>`}function hi(e){let t=Array.isArray(e.citations)?e.citations:[],s=Array.isArray(e.judgments)?e.judgments:[],a=Array.isArray(e.law_sources)?e.law_sources:[],n=Array.isArray(e.matched_terms)?e.matched_terms:[],i=e.status||"preview",o=!!e.partial,l=!!e.streaming,u=!!e.show_sources||!o,c=e.answer_source==="structured",m=String(e.law_answer||"").trim(),$=e.law_framework||null,b=Array.isArray($?.rows)?$.rows:[],p=Array.isArray($?.sources)?$.sources:[],g=b.length>0,y=!!m&&!c&&!g,_=s.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u5224\u6C7A \xB7 ${s.length} \u7B46</span>
        <span>vector retrieval \xB7 [\u7DE8\u865F] \u5C0D\u61C9\u56DE\u7B54\u5F15\u7528</span>
      </div>
      <div class="citation-list">${s.map((G,he)=>fc(G,he)).join("")}</div>`:"",q=a.length&&!y?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4 \xB7 ${a.length} \u7B46</span>
        <span>PostgreSQL metadata \xB7 Parquet \u689D\u6587</span>
      </div>
      <div class="citation-list">${a.map((G,he)=>vc(G,he)).join("")}</div>`:"",M=!s.length&&t.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F \xB7 ${t.length} \u7B46</span>
        <span>metadata match</span>
      </div>
      <div class="citation-list">${t.map((G,he)=>bc(G,he)).join("")}</div>`:"",A=u?_+q+M:"";!A&&!o&&!y&&!g&&(A=`<div class="answer-divider"></div>
      ${pt({iconName:"file",title:"\u6C92\u6709\u53EF\u5F15\u7528\u7684\u4F86\u6E90",text:i==="retrieval_only"?"\u76EE\u524D\u5DF2\u5EFA\u7ACB\u7684\u5411\u91CF\u7D22\u5F15\u4E2D\u6C92\u6709\u8DB3\u5920\u76F8\u4F3C\u7684\u5224\u6C7A\uFF0C\u4E5F\u6C92\u6709\u53EF\u5C0D\u61C9\u7684\u6CD5\u898F\u6216\u547D\u4EE4\u3002\u7CFB\u7D71\u4E0D\u6703\u5728\u6C92\u6709\u4F86\u6E90\u6642\u751F\u6210\u7B54\u6848\u3002":"\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u4E14\u554F\u984C\u4E2D\u6C92\u6709\u53EF\u76F4\u63A5\u5C0D\u61C9\u7684\u73FE\u884C\u6CD5\u898F\u540D\u7A31\u3002"})}`);let U=yc(n,a),V=e.test_run,J=String(e.llm_model||V?.primary_model||"").trim(),ke=String(e.embedding_model||"").trim(),Se=[J?`LLM\uFF1A${J}`:"",ke?`Embedding\uFF1A${ke}`:""].filter(Boolean).join(" \xB7 "),F=l||e.answer_source==="llm"?"LLM \u7D9C\u5408\u56DE\u7B54":"\u6AA2\u7D22\u7D50\u679C\u6458\u8981",T=g?`<div class="answer-block law-framework-block">
        <div class="answer-block-head">
          <span>${r($.title||"\u76F8\u95DC\u6CD5\u898F\u7684\u8CAC\u4EFB\u67B6\u69CB")}</span>
          <span>${b.length} \u689D</span>
        </div>
        <div class="table-wrap law-framework-table-wrap">
          <table class="data-table is-compact law-framework-table">
            <thead>
              <tr><th scope="col">\u6CD5\u898F</th><th scope="col">\u689D\u6587</th><th scope="col">\u898F\u7BC4\u91CD\u9EDE</th></tr>
            </thead>
            <tbody>
              ${b.map(G=>`<tr>
                    <td>${r(G.law_name||"\u2014")}</td>
                    <td class="cell-number">${r(G.article_no||"\u2014")}</td>
                    <td>${r(G.focus||"\u2014")}</td>
                  </tr>`).join("")}
            </tbody>
          </table>
        </div>
        ${p.length?`<div class="law-framework-sources">
                <span>\u6CD5\u898F\u4F86\u6E90</span>
                ${p.map(G=>{let he=String(G?.law_name||G||"").trim(),Te=G&&G.index!==null&&G.index!==void 0?` [${r(G.index)}]`:"";return Aa(he,{label:`${he}${Te}`})}).join("")}
              </div>`:""}
      </div>`:"",S=e.answer_source==="llm"&&J?`<span class="answer-model" title="${r(Se)}">${f("brain",11)}${r(J)}</span>`:c?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${f("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"",E=l?`${J||"LLM"} \xB7 \u751F\u6210\u4E2D`:S?J||"structured":"retrieval",se=V?`<div class="test-run-summary">
        <div class="test-run-summary-head">
          <span class="badge badge-warn">\u6E2C\u8A66\u6A21\u5F0F</span>
          ${Ye(V.status)}
          <span class="mono">${r(V.run_id||"")}</span>
        </div>
        <div class="test-run-summary-body">
          <span>Embedding ${Number(V.models?.embedding?.length||0)} \u500B</span>
          <span>LLM ${Number(V.models?.llm?.length||0)} \u500B</span>
          <span>\u4E3B\u56DE\u7B54 ${r(V.primary_model||"\u2014")}</span>
          <span>${Number(V.total_ms||0)} ms</span>
          <a href="#/performance">\u67E5\u770B\u6E2C\u8A66 Flow</a>
        </div>
      </div>`:"",le=e.pipeline_flow&&typeof e.pipeline_flow=="object"?e.pipeline_flow:null,Q=!o&&le?ka(le,{serverDurationMs:Number(e.duration_ms)||0,embedded:!0}):"",ye=String(e.answer||"").trim()||(l?"\u6B63\u5728\u751F\u6210\u56DE\u7B54\u2026":o?"\u6B63\u5728\u6AA2\u7D22\u5224\u6C7A\u4E26\u751F\u6210 LLM \u56DE\u7B54\u2026":"\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u56DE\u7B54\u3002"),I=l?" data-partial-answer":"",we=l?" is-streaming":"";return`${T}
      ${y?`<div class="answer-block law-answer-block">
              <div class="answer-block-head">
                <span>\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22\u7D50\u679C</span>
                <span>${o&&!u?"\u6CD5\u898F\u8CC7\u6599\u5EAB":`${a.length} \u7B46\u4F86\u6E90`}</span>
              </div>
              <div class="law-answer-content">${$c(a,m)}</div>
            </div>`:""}
      <div class="answer-block">
        ${y||g?`<div class="answer-block-head">
                <span>${r(F)}</span>
                <span>${r(E)}</span>
              </div>`:""}
        <p class="answer-text${we}"${I}>${r(ye)}</p>
      </div>
      ${e.notice?`<div class="answer-notice">${r(e.notice)}</div>`:""}
      ${se}
      ${U}
      ${A}
      ${Q}`}function fi(e,t,s=""){let a=t.status||"preview",n=a==="operational"?"\u5B8C\u6210":a==="retrieval_only"?"\u50C5\u6AA2\u7D22\u7D50\u679C":a==="preview"?"\u6CD5\u898F\u9810\u89BD":a==="unavailable"||a==="not_configured"?"\u8CC7\u6599\u4E0D\u53EF\u7528":a==="degraded"?"\u964D\u7D1A":"\u5B8C\u6210",i=t.test_run,o=String(t.llm_model||i?.primary_model||"").trim(),l=String(t.embedding_model||"").trim(),u=[o?`LLM\uFF1A${o}`:"",l?`Embedding\uFF1A${l}`:""].filter(Boolean).join(" \xB7 "),c=t.answer_source==="structured",m=t.answer_source==="llm"&&o?`<span class="answer-model" title="${r(u)}">${f("brain",11)}${r(o)}</span>`:c?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${f("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"";return`<div class="answer-head">
      <div class="answer-head-left">${f("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u7D50\u679C</span>
      </div>
      <div class="answer-head-meta">
        ${Ye(a,n)}
        <span>${Number(t.duration_ms||0)} ms</span>
        ${m}
      </div>
      ${s}
    </div>
    <div class="answer-body">${hi(t)}</div>`}function _c(e,t=""){return`<div class="answer-head">
      <div class="answer-head-left">${f("alert",16)}
        <span class="answer-head-title">\u7121\u6CD5\u5B8C\u6210\u6AA2\u7D22</span>
      </div>
      ${t}
    </div>
    <div class="answer-body">
      ${He({tone:"danger",title:"\u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
    </div>`}function kc(e){let t=Array.isArray(e.turns)?e.turns:[],s=t.length?t[t.length-1].payload||{}:e.payload||{},a=Array.isArray(s.citations)?s.citations.length:0,n=Array.isArray(s.judgments)?s.judgments.length:0,i=Array.isArray(s.law_sources)?s.law_sources.length:0;return a+n+i}function Sc(e,t,s,a=null){let n=e.id??s,i=kc(e),o=t.get(String(e.project_id||"")),l=Array.isArray(e.turns)?e.turns:[],u=e.updated_at||e.created_at,c=a!=null&&String(a)===String(n);return`<div class="rag-history-item${e.pinned?" is-pinned":""}${c?" is-active":""}">
    <button class="rag-history-open" type="button" data-history-open data-history-id="${r(String(n))}">
      <span class="history-question">${r(e.title||"\u672A\u547D\u540D\u63D0\u554F")}</span>
      <span class="history-meta">
        <span>${r(Es(u))}</span>
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
  </div>`}function bi(e,t,s){let a=new Map;for(let i of t){let o=String(i.project_id||"");o&&a.set(o,(a.get(o)||0)+1)}let n=[`<button class="rag-project${s?"":" is-active"}" type="button" data-rag-action="select-project" data-project-id="" aria-pressed="${s?"false":"true"}">
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
  </div>`),n.join("")}async function xc(e){let t=!1,s=[],a=!1,n=[],i=!1,o="",l=8,u="",c=0,m=null,$=[],b=!1,p=!1,g={embedding:[],llm:[]},y=null,_=null,q=null,M=!1,A=!1,U=!1;e.innerHTML=`<section class="page rag-page">
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
      <div id="rag-mode-notice">${He({tone:"info",title:"RAG \u670D\u52D9\u72C0\u614B\u6AA2\u67E5\u4E2D",text:"\u6B63\u5728\u78BA\u8A8D Qdrant\u3001Embedding \u8207 LLM \u72C0\u614B\uFF1B\u6240\u6709\u56DE\u7B54\u90FD\u6703\u6A19\u793A\u53EF\u56DE\u6EAF\u7684\u4F86\u6E90\u3002"})}</div>
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
        ${rc.map(v=>`<button class="example-chip" type="button" data-question="${r(v)}">${r(v)}</button>`).join("")}
      </div>
    </header>

    <section class="rag-conversation" id="rag-conversation" aria-live="polite">
      <div class="rag-turns" id="rag-turns">
        ${Sn()}
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
  </section>`;let V=e.querySelector("#rag-form"),J=e.querySelector("#rag-question"),ke=e.querySelector("#rag-submit"),Se=e.querySelector(".rag-page"),F=e.querySelector("#rag-turns"),T=e.querySelector("#rag-followup-form"),S=e.querySelector("#rag-followup-question"),E=e.querySelector("#rag-followup-submit"),se=e.querySelector("#rag-history"),le=e.querySelector("#rag-storage-note"),Q=e.querySelector("#rag-clear-history"),pe=e.querySelector(".rag-library"),ye=e.querySelector("#rag-pinned-body"),I=e.querySelector("#rag-projects-body"),we=e.querySelector("#rag-pinned-count"),G=e.querySelector("#rag-projects-count"),he=e.querySelector("#rag-recent-count"),Te=e.querySelector("#rag-library-context"),ne=e.querySelector("#rag-test-mode"),me=e.querySelector("#rag-test-flow"),ge=e.querySelector("#rag-history-menu"),Le=e.querySelector("#rag-judgment-dialog"),be=e.querySelector("#rag-law-dialog"),Ee=()=>{document.documentElement.classList.toggle("dialog-open",!!e.querySelector("dialog[open]"))};Le?.addEventListener("close",Ee),be?.addEventListener("close",Ee);let Fe=null,et=null,P,B=null,w=null,j=()=>{J.style.height="auto",J.style.height=`${Math.min(J.scrollHeight,220)}px`},W=()=>{S.style.height="auto",S.style.height=`${Math.min(S.scrollHeight,160)}px`},H=v=>{b=!!v,Se.classList.toggle("has-conversation",b)},Oe=()=>{b&&(T.hidden=!1,W())},Ce=()=>{T.hidden=!0},Pe=()=>{ge.hidden&&!w||(ge.hidden=!0,ge.innerHTML="",w&&w.setAttribute("aria-expanded","false"),B=null,w=null)},st=(v,R)=>{let z=F.querySelector(".rag-empty-answer");z&&z.remove(),F.insertAdjacentHTML("beforeend",ui(v,R));let ee=F.lastElementChild,ce=ee?.querySelector("[data-rag-answer]");return window.requestAnimationFrame(()=>{ee?.scrollIntoView({behavior:"smooth",block:"start"})}),{turnElement:ee,answerElement:ce}},lt=()=>{F.innerHTML=$.length?$.map(v=>ui(v.question,fi(v.question,v.payload||{},""))).join(""):Sn()},ot=v=>{let R=Array.isArray(v.turns)?v.turns:[];return R.length?(c+=1,Ht(),Nt(null),m=v.id??null,$=R.map(z=>({...z})),u=$[$.length-1]?.question||"",H(!0),lt(),Oe(),Ve(),Ne(ke,!1),Ne(E,!1),window.setTimeout(()=>{T.scrollIntoView({behavior:"smooth",block:"end"})},50),!0):!1},Ve=()=>{if(t)return;if(Pe(),!a){se.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',ye.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',we.textContent="0",he.textContent="0",i&&(I.innerHTML=bi(n,[],o));return}let v=n.find(Be=>String(Be.id)===o)||null;o&&!v&&(o="");let R=new Map(n.map(Be=>[String(Be.id),Be])),z=s.filter(Be=>!!Be.pinned),ee=s.filter(Be=>!Be.pinned),ce=o?ee.filter(Be=>String(Be.project_id||"")===o):ee,Me=ce.slice(0,l),Je=(Be,dt)=>Sc(Be,R,dt,m);ye.innerHTML=z.length?z.map(Je).join(""):'<div class="rag-library-empty">\u5C1A\u7121\u91D8\u9078\u9805\u76EE\u3002\u5C07\u6700\u8FD1\u9805\u76EE\u91D8\u9078\u5F8C\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</div>',I.innerHTML=bi(n,s,o),se.innerHTML=Me.length?Me.map(Je).join(""):`<div class="rag-library-empty">${o?"\u9019\u500B\u5C08\u6848\u9084\u6C92\u6709\u672A\u91D8\u9078\u7684\u9805\u76EE\u3002":z.length?"\u6700\u8FD1\u7684\u9805\u76EE\u90FD\u5DF2\u91D8\u9078\u3002":"\u5C1A\u7121\u63D0\u554F\u7D00\u9304\u3002\u9001\u51FA\u7B2C\u4E00\u500B\u554F\u984C\u5F8C\u6703\u4FDD\u5B58\u5728\u6B64\u700F\u89BD\u5668\u3002"}</div>`,ce.length>l&&se.insertAdjacentHTML("beforeend",`<button class="rag-library-more" type="button" data-rag-action="more-recent">\u986F\u793A\u66F4\u591A \xB7 ${d(ce.length-l)} \u7B46</button>`),we.textContent=String(z.length),G.textContent=String(n.length),he.textContent=String(ce.length),v?(Te.hidden=!1,Te.innerHTML=`<span>${f("folder",12)}<strong>${r(v.name)}</strong></span><button type="button" data-rag-action="clear-project" title="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE" aria-label="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE">${f("x",12)}</button>`):(Te.hidden=!0,Te.innerHTML="")},jt=async()=>{try{let v=await os("rag.projects",[]);n=Array.isArray(v)?v.map(R=>({id:String(R?.id||""),name:String(R?.name||"").trim()})).filter(R=>R.id&&R.name):[]}catch{n=[]}i=!0,t||Ve()},nt=v=>{o=String(v||""),l=8,Ve()},Xe=()=>{let v=I.querySelector('[data-rag-form="project"]');v&&(v.hidden=!1,v.querySelector("input")?.focus())},Pt=()=>{let v=I.querySelector('[data-rag-form="project"]');v&&(v.hidden=!0,v.reset())},te=async v=>{let R=v.elements.project_name,z=String(R?.value||"").trim();if(!z){C("\u8ACB\u8F38\u5165\u5C08\u6848\u540D\u7A31\u3002","warn"),R?.focus();return}if(n.some(ce=>ce.name.toLowerCase()===z.toLowerCase())){C("\u5DF2\u6709\u540C\u540D\u5C08\u6848\u3002","warn"),R?.focus();return}let ee=typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():`project-${Date.now()}-${Math.random().toString(16).slice(2)}`;n=[...n,{id:ee,name:z.slice(0,60),created_at:new Date().toISOString()}],o=ee,l=8,await Hs("rag.projects",n),Ve(),C(`\u5DF2\u5EFA\u7ACB\u5C08\u6848\u300C${z}\u300D\u3002`,"ok")},Ae=async v=>{let R=s.find(ce=>String(ce.id)===String(v));if(!R)return;let z=!R.pinned;if(!await Fs(R.id,{pinned:z})){C("\u7121\u6CD5\u66F4\u65B0\u91D8\u9078\u72C0\u614B\u3002","danger");return}R.pinned=z,Ve(),C(z?"\u5DF2\u91D8\u9078\u9805\u76EE\u3002":"\u5DF2\u53D6\u6D88\u91D8\u9078\u3002","ok")},We=()=>{c+=1,Ht(),Nt(null),u="",m=null,$=[],H(!1),Ce(),F.innerHTML=Sn(),J.value="",j(),S.value="",W(),Ne(ke,!1),Ne(E,!1),Ve(),Le?.open&&Le.close(),be?.open&&be.close(),J.focus(),window.scrollTo({top:0,behavior:"smooth"})},Ze=v=>{if(!v||ge.hidden)return;let R=v.getBoundingClientRect(),z=ge.getBoundingClientRect(),ee=6,ce=R.bottom+ee;ce+z.height>window.innerHeight-8&&(ce=Math.max(8,R.top-z.height-ee));let Me=R.right-z.width;Me=Math.max(8,Math.min(Me,window.innerWidth-z.width-8)),ge.style.left=`${Math.round(Me)}px`,ge.style.top=`${Math.round(ce)}px`},It=v=>{ge.innerHTML=`
      <button type="button" role="menuitem" data-menu-action="rename">${f("edit",13)}<span>\u91CD\u65B0\u547D\u540D</span></button>
      <button type="button" role="menuitem" data-menu-action="toggle-pin">${f("pin",13)}<span>${v.pinned?"\u53D6\u6D88\u91D8\u9078":"\u91D8\u9078"}</span></button>
      <button type="button" role="menuitem" data-menu-action="share">${f("link",13)}<span>\u5206\u4EAB</span></button>
      <button type="button" role="menuitem" data-menu-action="move">${f("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></button>
      <div class="rag-history-menu-divider"></div>
      <button class="is-danger" type="button" role="menuitem" data-menu-action="delete">${f("trash",13)}<span>\u522A\u9664</span></button>`},Tt=v=>{let R=String(v.project_id||""),z=[{id:"",name:"\u672A\u5206\u985E"},...n.map(ee=>({id:String(ee.id),name:ee.name}))];ge.innerHTML=`
      <div class="rag-history-menu-head">${f("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></div>
      ${z.map(ee=>`<button type="button" role="menuitem"
            data-menu-action="assign-project" data-project-id="${r(ee.id)}">
            <span class="rag-history-menu-check">${R===ee.id?f("check",12):""}</span>
            <span>${r(ee.name)}</span>
          </button>`).join("")}
      ${n.length?"":'<div class="rag-history-menu-note">\u5C1A\u672A\u5EFA\u7ACB\u5C08\u6848\uFF0C\u53EF\u5148\u5F9E\u5DE6\u5074\u5EFA\u7ACB\u3002</div>'}
      <div class="rag-history-menu-divider"></div>
      <button type="button" role="menuitem" data-menu-action="back">${f("chevronLeft",13)}<span>\u8FD4\u56DE</span></button>`},Xt=(v,R)=>{let z=s.find(ee=>String(ee.id)===String(R));z&&(Pe(),B=String(z.id),w=v,It(z),ge.hidden=!1,v.setAttribute("aria-expanded","true"),Ze(v))},x=async v=>{let R=window.prompt("\u91CD\u65B0\u547D\u540D\u5C0D\u8A71",v.title||"");if(R===null)return;let z=R.trim();if(!z){C("\u540D\u7A31\u4E0D\u80FD\u7A7A\u767D\u3002","warn");return}if(z===v.title)return;if(!await Fs(v.id,{title:z})){C("\u91CD\u65B0\u547D\u540D\u5931\u6557\u3002","danger");return}v.title=z,Ve(),C("\u5C0D\u8A71\u5DF2\u91CD\u65B0\u547D\u540D\u3002","ok")},L=async v=>{let R=Array.isArray(v.turns)?v.turns:[],z=[`# ${v.title||"\u672A\u547D\u540D\u5C0D\u8A71"}`,""];if(R.length)for(let ce of R){z.push("## \u554F\u984C","",ce.question||"",""),z.push("## \u56DE\u7B54","",ce.payload?.answer||"\uFF08\u6C92\u6709\u56DE\u7B54\u5167\u5BB9\uFF09","");let Me=Array.isArray(ce.payload?.law_sources)?ce.payload.law_sources.map(Je=>Je.law_name).filter(Boolean):[];Me.length&&z.push(`\u5F15\u7528\uFF1A${[...new Set(Me)].join("\u3001")}`,"")}else z.push(v.title||"");let ee=await hs(z.join(`
`));C(ee?"\u5C0D\u8A71\u5167\u5BB9\u5DF2\u8907\u88FD\uFF0C\u53EF\u76F4\u63A5\u8CBC\u4E0A\u5206\u4EAB\u3002":"\u7121\u6CD5\u8907\u88FD\u5C0D\u8A71\u5167\u5BB9\u3002",ee?"ok":"warn")},N=async v=>{if(!window.confirm(`\u522A\u9664\u5C0D\u8A71\u300C${v.title||"\u672A\u547D\u540D\u5C0D\u8A71"}\u300D\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002`))return;if(!await $r(v.id)){C("\u522A\u9664\u5931\u6557\u3002","danger");return}let z=m!==null&&String(m)===String(v.id);s=s.filter(ee=>String(ee.id)!==String(v.id)),z?We():Ve(),C("\u5C0D\u8A71\u5DF2\u522A\u9664\u3002","ok")},O=async(v,R)=>{if(!await Fs(v.id,{project_id:R})){C("\u79FB\u81F3\u5C08\u6848\u5931\u6557\u3002","danger");return}v.project_id=R;let ee=n.find(ce=>String(ce.id)===String(R));Ve(),C(ee?`\u5DF2\u79FB\u81F3\u5C08\u6848\u300C${ee.name}\u300D\u3002`:"\u5DF2\u79FB\u51FA\u5C08\u6848\u3002","ok")},Y=async v=>{let R=v.target.closest("[data-menu-action]");if(!R)return;let z=s.find(ce=>String(ce.id)===B);if(!z){Pe();return}let ee=R.dataset.menuAction;ee==="rename"?(Pe(),await x(z)):ee==="toggle-pin"?(Pe(),await Ae(z.id)):ee==="share"?(Pe(),await L(z)):ee==="move"?(Tt(z),Ze(w)):ee==="assign-project"?(Pe(),await O(z,R.dataset.projectId||"")):ee==="back"?(It(z),Ze(w)):ee==="delete"&&(Pe(),await N(z))},X=v=>{ge.hidden||(typeof v.composedPath=="function"?v.composedPath():[]).includes(ge)||ge.contains(v.target)||v.target.closest('[data-rag-action="open-history-menu"]')||Pe()},ue=v=>{v.key==="Escape"&&Pe()},Re=v=>{v.target instanceof Node&&ge.contains(v.target)||Pe()},De=async()=>{try{if(s=await da({limit:120}),t)return;a=!0,Ve(),le.textContent=Os()==="indexeddb"?"\u63D0\u554F\u7D00\u9304\u5132\u5B58\u5728\u700F\u89BD\u5668 IndexedDB\uFF0C\u4E0D\u6703\u4E0A\u50B3\u5230\u4F3A\u670D\u5668\u3002":"\u700F\u89BD\u5668\u5132\u5B58\u4E0D\u53EF\u7528\uFF0C\u63D0\u554F\u7D00\u9304\u53EA\u4FDD\u7559\u5728\u672C\u6B21\u5DE5\u4F5C\u968E\u6BB5\u3002"}catch{if(t)return;s=[],a=!0,Ve(),se.innerHTML='<div class="rag-library-empty">\u7121\u6CD5\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u3002</div>'}},xe=async(v,R,z,ee)=>{let ce=$,Me=m;ce.push({question:v,asked_at:new Date().toISOString(),payload:cc(R)});let Je=Array.isArray(R.citations)?R.citations:[],Be=Array.isArray(R.judgments)?R.judgments:[],dt={question:v,status:R.status,citations:Je.map(ze=>ze.law_name),judgments:Be.map(ze=>ze.jid)},ut=`${R.status||"preview"} \xB7 ${ce.length} \u8F2A`,Qe=new Date().toISOString(),$t=ze=>{ee===c&&(m=ze)};if(Me){if(!await Fs(Me,{turns:ce,detail:ut,payload:dt,updated_at:Qe})){let _t=await Bs({kind:"rag",title:ce[0]?.question||v,detail:ut,project_id:z,turns:ce,payload:dt,updated_at:Qe});$t(_t)}}else{let ze=await Bs({kind:"rag",title:ce[0]?.question||v,detail:ut,project_id:z,turns:ce,payload:dt,updated_at:Qe});$t(ze)}await De()},Ge=()=>(y?.services||[]).find(v=>v.id==="llm")||null,tt=()=>{let v=e.querySelector("#rag-mode-notice");if(!v)return;let R=Array.isArray(_?.providers)?_.providers:[],z=[];for(let ze of R)if(!(!ze||!Array.isArray(ze.chat_models)))for(let _t of ze.chat_models)z.push({model:_t,providerName:String(ze.name||"").trim(),hostId:ze.host_id===null||ze.host_id===void 0?null:Number(ze.host_id)});if(!z.length&&Array.isArray(_?.chat_models)){let ze=String(_?.provider_name||"").trim(),_t=_?.provider?.host_id;for(let Ke of _.chat_models)z.push({model:Ke,providerName:ze,hostId:_t==null?null:Number(_t)})}let ee=R.filter(ze=>Array.isArray(ze?.models)&&ze.models.length>0&&(!Array.isArray(ze.chat_models)||ze.chat_models.length===0)).map(ze=>String(ze.name||"").trim()).filter(Boolean),ce=String(Ge()?.model||"").trim(),Me=String(_?.base_url||"").trim(),Je=String(_?.provider_name||"").trim(),Be=y&&(y.services||[]).find(ze=>ze.id==="reranker")||null;if(!y){if(!q)return;v.innerHTML=xa({tone:"warn",title:"\u7121\u6CD5\u53D6\u5F97 RAG \u670D\u52D9\u72C0\u614B",text:q.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\uFF0C\u6216\u524D\u5F80\u7CFB\u7D71\u72C0\u614B\u9801\u67E5\u770B\u3002",models:z,currentModel:ce,currentProviderName:Je,baseUrl:Me,modelState:_,untestedProviders:ee,rerank:Be,rerankRefreshing:U,busy:M,refreshing:A});return}let dt=y.data||{},ut=(y.services||[]).find(ze=>ze.id==="rag"),Qe=Number(dt.judgment_indexed_count||0),$t=Number(dt.judgment_count||0);ut?.status==="operational"?v.innerHTML=xa({tone:"ok",title:"\u6AA2\u7D22\u8207\u56DE\u7B54\u5C31\u7DD2",text:`Qdrant\u3001Embedding \u8207 LLM \u5747\u53EF\u4F7F\u7528\uFF1B\u76EE\u524D\u7D22\u5F15\u6DB5\u84CB ${d(Qe)} / ${d($t)} \u7B46\u5224\u6C7A\u3002\u56DE\u7B54\u4E0D\u662F\u6CD5\u5F8B\u610F\u898B\u3002`,models:z,currentModel:ce,currentProviderName:Je,baseUrl:Me,modelState:_,untestedProviders:ee,rerank:Be,rerankRefreshing:U,busy:M,refreshing:A}):ut?.status==="degraded"?v.innerHTML=xa({tone:"warn",title:"\u90E8\u5206 AI \u5143\u4EF6\u672A\u5C31\u7DD2",text:ut.detail||"RAG \u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u6AA2\u7D22\u7D50\u679C\u3002",models:z,currentModel:ce,currentProviderName:Je,baseUrl:Me,modelState:_,untestedProviders:ee,rerank:Be,rerankRefreshing:U,busy:M,refreshing:A}):v.innerHTML=xa({tone:"info",title:"\u5411\u91CF\u7D22\u5F15\u5C1A\u672A\u5C31\u7DD2 \xB7 \u4E0D\u662F\u6CD5\u5F8B\u610F\u898B",text:ut?.detail||"\u8A2D\u5B9A QDRANT_URL\u3001EMBEDDING_URL \u8207 LLM_URL \u4E26\u57F7\u884C judgment-index-vectors \u5F8C\u5373\u53EF\u555F\u7528\u5224\u6C7A\u6AA2\u7D22\u3002",models:z,currentModel:ce,currentProviderName:Je,baseUrl:Me,modelState:_,untestedProviders:ee,rerank:Be,rerankRefreshing:U,busy:M,refreshing:A})},it=async()=>{let[v,R]=await Promise.allSettled([K.status(),K.llmModels()]);t||(y=v.status==="fulfilled"?v.value:null,_=R.status==="fulfilled"?R.value:null,q=v.status==="rejected"?v.reason:null,tt())},Ls=async(v,R=null)=>{if(!v||M||A)return;let z=String(Ge()?.model||"").trim(),ee=String(_?.provider_name||"").trim(),ce=(_?.providers||[]).find(Be=>R!==null&&Be?.host_id!==null&&Be?.host_id!==void 0&&Number(Be.host_id)===Number(R)),Me=String(ce?.name||(R===null?ee:"")).trim();if(v===z&&(!R||!Me||Me===ee))return;let Je=Me?`${Me}:${v}`:v;M=!0,tt();try{await K.selectLlmModel(v,R),C(`\u5DF2\u5207\u63DB chat model\uFF1A${Je}`,"ok",3500)}catch(Be){C(Be.message||"\u7121\u6CD5\u5207\u63DB chat model\u3002","danger",6e3)}finally{M=!1,t||await it()}},Ft=async()=>{if(!(A||M)){A=!0,tt();try{await K.testLlmModels(),C("\u5DF2\u66F4\u65B0 chat model \u6E05\u55AE\u3002","ok",3500)}catch(v){C(v.message||"\u7121\u6CD5\u6AA2\u67E5 chat model\u3002","danger",6e3)}finally{A=!1,t||await it()}}},Pa=async()=>{if(!U){U=!0,tt();try{let v=await K.status();if(t)return;y=v,q=null,C("\u5DF2\u66F4\u65B0 rerank model \u72C0\u614B\u3002","ok",3e3)}catch(v){C(v.message||"\u7121\u6CD5\u6AA2\u67E5 rerank model\u3002","danger",6e3)}finally{U=!1,t||tt()}}},js=()=>{if(!ne)return;if(!p){ne.innerHTML="";return}let v=Array.isArray(g.embedding)?g.embedding.length:0,R=Array.isArray(g.llm)?g.llm.length:0;ne.innerHTML=He({tone:"warn",title:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F",text:`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${v} \u500B embedding \u8207 ${R} \u500B LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002\u6E2C\u8A66 Flow \u6703\u5728\u9801\u9762\u4E0B\u65B9\u5373\u6642\u986F\u793A\uFF0C\u4E5F\u53EF\u5230 <a href="#/tests">\u7CFB\u7D71\u6E2C\u8A66</a> \u6216 <a href="#/performance">\u6548\u80FD\u5831\u8868</a> \u67E5\u770B\u6B77\u53F2\u3002`})},Ia=async()=>{try{let v=await K.testMode();if(t)return;p=!!v.enabled,g=v.models||{embedding:[],llm:[]},js()}catch{if(t)return;p=!1,js()}},Xs=v=>{p=!!v.detail?.enabled,g=v.detail?.models||{embedding:[],llm:[]},js()};window.addEventListener("judgment:test-mode",Xs);let Nt=v=>{if(!me)return;et=v||null;let R=JSON.stringify(v?{run_id:v.run_id,status:v.status,progress:v.progress,total_ms:v.total_ms,stage:v.stage,answer:v.answer||"",steps:(v.steps||[]).map(z=>`${z.stage}:${z.model}:${z.status}:${z.progress}:${z.duration_ms}`)}:null);R!==P&&(P=R,me.innerHTML=v?As(v,[],"",{showHistory:!1}):"")},Ht=()=>{Fe&&(Fe(),Fe=null)},Ts=async(v=null)=>{if(!t)try{let R=v||await K.testRunCurrent();if(t)return;let z=R.run;z&&z.status==="running"&&Nt(z)}catch{}},Ns=()=>{t||Fe||(Ts(),Fe=xt("test-runs",(v,R)=>Ts(R?.snapshot||null)))},Zs=async v=>{if(!v){Nt(null);return}try{let R=await K.testRun(v);if(t)return;Nt(R.run||null)}catch{t||C("\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF0C\u4F46\u7121\u6CD5\u8F09\u5165\u6E2C\u8A66 Flow\u3002","warn")}},h=async()=>{if(p)try{let v=await K.testRunCurrent();if(t)return;v.run?.status==="running"&&(Nt(v.run),Ns())}catch{}},k=0,D=(v,R)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">DB ORIGINAL JUDGMENT</div>
      <h2>${r(v)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-parquet-judgment" aria-label="\u95DC\u9589">${f("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${R}</div>`,de=v=>{let R=(Array.isArray(v.citations)?v.citations:[]).map(Je=>vi(Je)).filter(Boolean).join(""),z=R||(Array.isArray(v.matched_laws)?v.matched_laws:[]).map(Je=>Aa(Je)).join(""),ee=[v.court,v.jdate,v.title?`\u6848\u7531\uFF1A${v.title}`:"",v.full_text_length?`${d(v.full_text_length)} \u5B57`:"",v.citation_count?`\u5F15\u7528 ${d(v.citation_count)} \u7B46`:""].filter(Boolean).map(Je=>`<span>${r(Je)}</span>`).join(""),ce=v.parquet_generated_at?`DB \u5132\u5B58\u539F\u6587\uFF08\u539F\u59CB Parquet\uFF09\xB7 ${r(String(v.parquet_generated_at).replace("T"," ").slice(0,19))}`:"DB \u5132\u5B58\u539F\u6587",Me=v.pdf_url?`<a class="btn btn-secondary btn-sm" href="${r(v.pdf_url)}" target="_blank" rel="noopener noreferrer">${f("external",13)}<span>\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF</span></a>`:"";return D(v.jid||"\u5224\u6C7A\u5168\u6587",`<div class="judgment-dialog-meta">
        <span class="badge badge-info">${r(v.source==="parquet"?"DB \u5132\u5B58\u539F\u6587":"PostgreSQL")}</span>
        ${ee}
      </div>
      ${R?'<div class="citation-meta" style="margin-top:8px"><span>\u5224\u6C7A\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4</span></div>':""}
      ${z?`<div class="chips" style="margin:8px 0 10px">${z}</div>`:""}
      <div class="judgment-dialog-source">${ce}</div>
      <pre class="judgment-dialog-text">${r(v.full_text||"\u6B64\u5224\u6C7A\u6C92\u6709\u5168\u6587\u3002")}</pre>
      <div class="judgment-dialog-actions">
        ${Me}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-parquet-judgment">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},ie=async v=>{if(!Le||!v)return;let R=++k;Le.open||Le.showModal(),Ee(),Le.innerHTML=D("\u8B80\u53D6\u5224\u6C7A\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E DB \u5132\u5B58\u539F\u6587\u8B80\u53D6 ${r(v)}\u2026</span>
      </div>`);try{let z=await K.judgmentDetail(v,"parquet");if(t||R!==k)return;Le.innerHTML=de(z)}catch(z){if(t||R!==k)return;Le.innerHTML=D("\u7121\u6CD5\u8B80\u53D6 DB \u539F\u6587\u5224\u6C7A",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${r(z.message||"\u627E\u4E0D\u5230\u5224\u6C7A\u5168\u6587\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u5DF2\u57F7\u884C <span class="mono">uv run judgment-import-judgments --raw-only</span>\uFF0C\u4E14\u539F\u59CB Parquet \u5B58\u5728\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-parquet-judgment">\u95DC\u9589</button>
        </div>`)}},Z=0,_e=(v,R)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">LOCAL PARQUET LAW</div>
      <h2>${r(v)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-law-source" aria-label="\u95DC\u9589">${f("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${R}</div>`,ae=(v,R="")=>{let z=String(v.selected_article_no||R||"").trim(),ee=!!z,ce=Array.isArray(v.articles)?v.articles:[],Me=ce.map(Dt=>{let Da=String(Dt.article_content||"").trim();return Da?Dt.article_type==="C"?`<div class="law-chapter">${r(Da)}</div>`:`<article class="law-article" data-article-no="${r(gi(Dt.article_no))}">
          <div class="law-article-head">
            <span class="law-article-no">${r(Dt.article_no||"\u689D\u6587")}</span>
          </div>
          <div class="law-article-text">${r(Da)}</div>
        </article>`:""}).join(""),Je=(Array.isArray(v.warnings)?v.warnings:[]).map(Dt=>r(Dt)).join("<br />"),Be=v.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F",dt=v.meta?.articles_source,ut=dt==="parquet"?"Parquet \u689D\u6587":dt==="postgresql"?"PostgreSQL \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",Qe=v.meta?.snapshot||"",$t=[v.law_level,v.law_category,v.article_count?`${d(v.article_count)} \u689D`:"",v.law_modified_date?`\u7570\u52D5 ${zt(v.law_modified_date)}`:""].filter(Boolean).map(Dt=>`<span>${r(Dt)}</span>`).join(""),ze=v.law_url?`<a class="btn btn-secondary btn-sm" href="${r(v.law_url)}" target="_blank" rel="noopener noreferrer">${f("external",13)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:"",_t=!ee&&v.law_histories?`<details class="law-dialog-history">
          <summary>\u6CD5\u898F\u6CBF\u9769</summary>
          <div>${r(v.law_histories)}</div>
        </details>`:"",Ke=ee?`<span class="badge badge-mono">${r(z)}</span>`:"",kt=!ee&&ce.length>1?`<div class="law-dialog-jump">
          <div class="law-article-jump">
            <input class="input law-article-jump-input law-jump-input"
              id="rag-law-article-jump" type="text" inputmode="numeric"
              autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
            <button class="btn btn-secondary btn-sm" type="button"
              data-action="jump-law-article"
              data-jump-input="rag-law-article-jump">\u8DF3\u81F3\u689D\u6587</button>
          </div>
        </div>`:"",qt=ee?`${v.law_name||v.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4"} \xB7 ${z}`:v.law_name||v.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4";return _e(qt,`<div class="judgment-dialog-meta">
        <span class="badge ${v.source_type==="order"?"badge-warn":"badge-info"}">${r(Be)}</span>
        ${Ke}
        ${$t}
      </div>
      <div class="judgment-dialog-source">${r([ut,Qe].filter(Boolean).join(" \xB7 "))}</div>
      ${Je?`<div class="law-dialog-warning">${Je}</div>`:""}
      ${_t}
      ${kt}
      <div class="law-dialog-articles">${Me||`<div class="report-empty-inline">${ee?"\u9019\u689D\u689D\u6587\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u5167\u5BB9\u3002":"\u9019\u500B\u6CD5\u898F\uFF0F\u547D\u4EE4\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u3002"}</div>`}</div>
      <div class="judgment-dialog-actions">
        ${ze}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-law-source">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},re=(v,R)=>{let z=v?.querySelector(`#${R}`),ee=gi(z?.value||"");if(!ee){C("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),z?.focus();return}let ce=[...v?.querySelectorAll("[data-article-no]")||[]].find(Me=>Me.dataset.articleNo===ee);if(!ce){C(`\u627E\u4E0D\u5230\u7B2C ${ee} \u689D\u3002`,"warn");return}ce.scrollIntoView({behavior:"instant",block:"center"}),ce.classList.add("is-jump-target"),window.setTimeout(()=>ce.classList.remove("is-jump-target"),2400)},ve=async(v,R="",z="")=>{if(!be||!v)return;let ee=++Z;be.open||be.showModal(),Ee(),be.innerHTML=_e(z?"\u8B80\u53D6\u6CD5\u898F\u689D\u6587\u4E2D\u2026":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E\u672C\u5730 Parquet \u8B80\u53D6 ${r([v,z].filter(Boolean).join(" \xB7 "))} \u7684\u539F\u59CB\u689D\u6587\u2026</span>
      </div>`);try{let ce=await K.lawDetail(v,R,"",z);if(t||ee!==Z)return;be.innerHTML=ae(ce,z)}catch(ce){if(t||ee!==Z)return;be.innerHTML=_e("\u7121\u6CD5\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u6587",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${r(ce.message||"\u627E\u4E0D\u5230\u689D\u6587\u5167\u5BB9\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u672C\u5730\u539F\u59CB\u6CD5\u898F Parquet \u5B58\u5728\uFF0C\u4E14 PostgreSQL metadata \u8207\u5176\u4E00\u81F4\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-law-source">\u95DC\u9589</button>
        </div>`)}};be?.addEventListener("click",v=>{let R=v.target.closest('[data-action="jump-law-article"]');if(R){re(be,R.dataset.jumpInput||"rag-law-article-jump");return}if(v.target.closest('[data-action="close-law-source"]')){be.close();return}let z=be.getBoundingClientRect();(v.clientX<z.left||v.clientX>z.right||v.clientY<z.top||v.clientY>z.bottom)&&be.close()}),be?.addEventListener("keydown",v=>{!v.target.matches(".law-jump-input")||v.key!=="Enter"||(v.preventDefault(),re(be,v.target.id))}),Le?.addEventListener("click",v=>{let R=v.target.closest('[data-action="open-law-source"]');if(R){ve(R.dataset.lawKey||"",R.dataset.sourceType||"",R.dataset.articleNo||"");return}if(v.target.closest('[data-action="close-parquet-judgment"]')){Le.close();return}let z=Le.getBoundingClientRect();(v.clientX<z.left||v.clientX>z.right||v.clientY<z.top||v.clientY>z.bottom)&&Le.close()}),F.addEventListener("click",v=>{let R=v.target.closest(".rag-process-toggle");if(R){let ee=R.closest(".rag-process"),ce=R.getAttribute("aria-expanded")==="true";xn(ee,!ce);return}let z=v.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(z){if(z.dataset.action==="open-law-source"){ve(z.dataset.lawKey||"",z.dataset.sourceType||"",z.dataset.articleNo||"");return}ie(z.dataset.jid||"")}}),F.addEventListener("keydown",v=>{if(v.key!=="Enter"&&v.key!==" ")return;let R=v.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(!(!R||R.closest("a, button"))){if(v.preventDefault(),R.dataset.action==="open-law-source"){ve(R.dataset.lawKey||"",R.dataset.sourceType||"",R.dataset.articleNo||"");return}ie(R.dataset.jid||"")}});let qe=async(v,{fresh:R=!1,source:z="hero"}={})=>{let ee=v.trim();if(!ee){C("\u8ACB\u5148\u8F38\u5165\u554F\u984C\u3002","warn"),(z==="followup"?S:J).focus();return}(R||!b)&&(m=null,$=[],F.innerHTML="",Ve());let ce=++c,Me=()=>t||ce!==c,Je=o;u=ee,H(!0),Ce(),z==="followup"?(S.value="",W()):(J.value="",j());let{answerElement:Be}=st(ee,gc(ee,p)),dt=p?null:mc(Be);p?(Nt(null),Ns()):(Ht(),Nt(null)),Ne(ke,!0,"\u6AA2\u7D22\u4E2D\u2026"),Ne(E,!0,"\u6AA2\u7D22\u4E2D\u2026");let ut=null,Qe="",$t=Ke=>{if(Me()||!Ke?.partial)return;let kt=Be.querySelector(".answer-body");if(!kt)return;ut=Ke,Qe=String(Ke.answer||""),kt.innerHTML=hi(Ke),dt?.collapse?.();let qt=Be.querySelector(".answer-head-title");qt&&(qt.textContent=Ke.streaming?"LLM \u56DE\u7B54\u751F\u6210\u4E2D":"\u6CD5\u898F\u7D50\u679C\u5DF2\u986F\u793A")},ze=Ke=>{if(Me()||!Ke||!ut?.streaming)return;Qe+=Ke;let kt=Be.querySelector("[data-partial-answer]");kt&&(kt.textContent=Qe)},_t=()=>{if(Me()||!ut?.streaming)return;Qe="";let Ke=Be.querySelector("[data-partial-answer]");Ke&&(Ke.textContent="\u6B63\u5728\u91CD\u65B0\u751F\u6210\u56DE\u7B54\u2026")};try{let Ke=p?await K.rag(ee,{testMode:p}):await K.ragStream(ee,{onStep:qt=>{Me()||dt?.step(qt)},onPartial:$t,onToken:ze,onTokenReset:_t});if(Me())return;Ht();let kt=dt?.finish(!0)||"";if(Be.innerHTML=fi(ee,Ke,kt),Ke.pipeline_flow||lc(Ke).then(()=>{if(Me()||!Ke.pipeline_flow)return;let qt=Be.querySelector(".answer-body");if(!qt||qt.querySelector(".rag-wf-card"))return;let Dt=ka(Ke.pipeline_flow,{serverDurationMs:Number(Ke.duration_ms)||0,embedded:!0});Dt&&qt.insertAdjacentHTML("beforeend",Dt)}),Ke.test_run?.run_id?await Zs(Ke.test_run.run_id):Nt(null),await xe(ee,Ke,Je,ce),Me())return;Oe()}catch(Ke){if(Me())return;Ht();let kt=dt?.finish(!1)||"";Be.innerHTML=_c(Ke,kt),Oe(),C(Ke.message||"\u6AA2\u7D22\u5931\u6557\u3002","danger")}finally{Me()||(Ht(),Ne(ke,!1),Ne(E,!1))}};V.addEventListener("submit",v=>{v.preventDefault(),qe(J.value,{fresh:!0,source:"hero"})}),T.addEventListener("submit",v=>{v.preventDefault(),qe(S.value,{fresh:!1,source:"followup"})}),J.addEventListener("input",j),J.addEventListener("keydown",v=>{v.key==="Enter"&&!v.shiftKey&&!v.isComposing&&(v.preventDefault(),V.requestSubmit())}),S.addEventListener("input",W),S.addEventListener("keydown",v=>{v.key==="Enter"&&!v.shiftKey&&!v.isComposing&&(v.preventDefault(),T.requestSubmit())}),e.querySelector("#example-chips").addEventListener("click",v=>{let R=v.target.closest("[data-question]");R&&(J.value=R.dataset.question,j(),V.requestSubmit())}),e.addEventListener("click",async v=>{let R=v.target.closest("[data-rag-model]");if(R){let z=R.dataset.ragProvider?Number(R.dataset.ragProvider):null;await Ls(R.dataset.ragModel||"",Number.isFinite(z)?z:null);return}if(v.target.closest('[data-rag-action="refresh-rerank-models"]')){await Pa();return}v.target.closest('[data-rag-action="refresh-chat-models"]')&&await Ft()}),pe.addEventListener("click",async v=>{let R=v.target.closest("[data-rag-toggle]");if(R){let Be=R.closest(".rag-library-section").classList.toggle("is-collapsed");R.setAttribute("aria-expanded",String(!Be));return}let z=v.target.closest("[data-rag-action]"),ee=z?.dataset.ragAction||"";if(ee==="new-chat"){We();return}if(ee==="open-history-menu"){Xt(z,z.dataset.historyId);return}if(ee==="toggle-pin"){await Ae(z.dataset.historyId);return}if(ee==="select-project"){nt(z.dataset.projectId||"");return}if(ee==="show-project-form"){Xe();return}if(ee==="cancel-project"){Pt();return}if(ee==="more-recent"){l+=12,Ve();return}if(ee==="clear-project"){nt("");return}let ce=v.target.closest("[data-history-open]");if(!ce)return;let Me=s.find(Je=>String(Je.id)===String(ce.dataset.historyId));Me&&(o=String(Me.project_id||""),Ve(),!ot(Me)&&(m=null,$=[],qe(Me.title,{fresh:!0,source:"history"})))}),pe.addEventListener("submit",async v=>{let R=v.target.closest('[data-rag-form="project"]');R&&(v.preventDefault(),await te(R))}),ge.addEventListener("click",Y),document.addEventListener("click",X),document.addEventListener("keydown",ue),window.addEventListener("scroll",Re,{capture:!0,passive:!0}),window.addEventListener("resize",Pe),Q.addEventListener("click",async()=>{if(!s.length){C("\u76EE\u524D\u6C92\u6709\u53EF\u6E05\u9664\u7684\u63D0\u554F\u7D00\u9304\u3002","info");return}window.confirm("\u78BA\u5B9A\u6E05\u9664\u9019\u500B\u700F\u89BD\u5668\u7684\u6240\u6709\u63D0\u554F\u7D00\u9304\uFF1F")&&(await yr(),await De(),C("\u5DF2\u6E05\u9664\u672C\u6A5F\u63D0\u554F\u7D00\u9304\u3002","ok"))}),j(),await Promise.allSettled([it(),De(),jt(),Ia()]),await h();let je="";try{je=window.sessionStorage.getItem("judgment.pending_question")||"",window.sessionStorage.removeItem("judgment.pending_question")}catch{je=""}return!je&&typeof window.__judgmentPendingQuestion=="string"&&(je=window.__judgmentPendingQuestion),delete window.__judgmentPendingQuestion,je=String(je||"").trim().slice(0,500),je&&J&&(J.value=je,j(),window.setTimeout(()=>{t||qe(je,{fresh:!0,source:"home"})},40)),()=>{t=!0,Ht(),Pe(),document.removeEventListener("click",X),document.removeEventListener("keydown",ue),window.removeEventListener("scroll",Re,{capture:!0}),window.removeEventListener("resize",Pe),document.documentElement.classList.remove("dialog-open"),window.removeEventListener("judgment:test-mode",Xs),u&&F.setAttribute("data-last-question",u)}}var Pn={};Zt(Pn,{render:()=>qd});var Mn=new Set(["legal_index_versions","judgment_import","index_versions"]),$i=new Map,Ln=new Set,jn=new Set,Ac={running:{label:"\u57F7\u884C\u4E2D",tone:"info"},success:{label:"\u5B8C\u6210",tone:"ok"},partial:{label:"\u90E8\u5206\u5B8C\u6210",tone:"warn"},update:{label:"\u66F4\u65B0",tone:"warn"},failed:{label:"\u5931\u6557",tone:"danger"},interrupted:{label:"\u5DF2\u4E2D\u6B62",tone:"warn"},stale:{label:"\u72C0\u614B\u5931\u6548",tone:"warn"},skipped:{label:"\u7565\u904E",tone:"idle"},pending:{label:"\u7B49\u5F85",tone:"idle"},idle:{label:"\u5F85\u547D",tone:"idle"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},operational:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},unavailable:{label:"\u7121\u6CD5\u53D6\u5F97",tone:"danger"},missing:{label:"\u5C1A\u7121\u7D00\u9304",tone:"idle"},error:{label:"\u8B80\u53D6\u5931\u6557",tone:"danger"},ok:{label:"\u6B63\u5E38",tone:"ok"},provided:{label:"\u5916\u90E8\u63D0\u4F9B",tone:"info"}},Tn=["download","parquet","postgres","qdrant"],qc={download:"\u4E0B\u8F09",parquet:"Parquet",postgres:"PostgreSQL",qdrant:"Qdrant"},Mc={judgment:{download:["download"],parquet:["raw_parquet","extract"],postgres:["postgres"],qdrant:["qdrant"]},law:{download:["download"],parquet:["raw_parquet","parse"],postgres:["postgres"],qdrant:["qdrant"]},order:{download:["download"],parquet:["raw_parquet","parse"],postgres:["postgres"],qdrant:["qdrant"]}},yi={complete:"\u5B8C\u6210",incomplete:"\u672A\u5B8C\u6210",processing:"\u8655\u7406\u4E2D",empty:"\u7121\u8CC7\u6599",not_applicable:"\u5DF2\u53D6\u4EE3"},wi={complete:"is-green",incomplete:"is-red",processing:"is-gray",empty:"is-empty",not_applicable:"is-empty"};var Rt=new Map,Ct="",fs="",_i={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},ki={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},Lc={judgment:"\u5224\u6C7A",law:"\u6CD5\u898F",order:"\u547D\u4EE4",system:"\u7CFB\u7D71"};var Si={law_download:"law",order_download:"order",judgment_download:"judgment"},xi={law_download:"\u6CD5\u898F\u4E0B\u8F09",order_download:"\u547D\u4EE4\u4E0B\u8F09",judgment_download:"\u5224\u6C7A\u4E0B\u8F09"},jc={law_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",order_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",judgment_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u5224\u6C7A RAR \u55CE\uFF1F\uFF08\u4E0D\u6703\u81EA\u52D5\u532F\u5165 PostgreSQL \u6216\u5EFA\u7ACB Qdrant \u7D22\u5F15\uFF09"},Tc={law_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u6CD5\u898F RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",order_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u547D\u4EE4 RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",judgment_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u53EA\u4E0B\u8F09\u5224\u6C7A RAR\u3002PostgreSQL\uFF0FParquet \u532F\u5165\u8207 Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\u300C\u5224\u6C7A\u532F\u5165\u300D\u6216\u5B8C\u6574\u8CC7\u6599\u66F4\u65B0\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_import:"\u6D41\u7A0B\u7BC4\u570D\uFF1ARAR \u2192 \u539F\u59CB\u8CC7\u6599\u6AA2\u67E5\uFF0FParquet \u5099\u4EFD \u2192 \u91D1\u878D\u6CD5\u898F\u7BE9\u9078 \u2192 PostgreSQL\u3002Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_parquet:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5F9E PostgreSQL \u532F\u51FA\u67E5\u8A62\u7528 Parquet \u5FEB\u7167\uFF1B\u4E0D\u5BEB\u5165 Qdrant\uFF0FIndexedDB\u3002",index_versions:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5EFA\u7ACB\u4E26\u9A57\u8B49\u65B0\u7684 Qdrant collection\uFF0C\u5B8C\u6210\u5F8C\u539F\u5B50\u5207\u63DB alias\uFF1BIndexedDB \u4E0D\u53C3\u8207\u3002"};function ds(e){return Ac[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function wt(e,t){let s=ds(e);return`<span class="badge ${_i[s.tone]||_i.idle}"><span class="status-dot ${ki[s.tone]||ki.idle}"></span>${r(t||s.label)}</span>`}function ft(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function Ai(e){return e==null?"\u7121\u6CD5\u53D6\u5F97":d(e)}function Mi(e){return e&&e.color?String(e.color):"var(--accent)"}function Nn(e){let t=e.unit==="bytes"?"":e.unit||"\u7B46",s=e.current,a=e.total;return["skipped","pending","idle"].includes(e.status)?"\u2014":s==null?e.status==="running"?"\u9032\u884C\u4E2D":"\u2014":e.unit==="bytes"?a?`${Ie(s)} / ${Ie(a)}`:Ie(s):a?`${d(s)} / ${d(a)} ${t}`:`${d(s)} ${t}`}function bs(e,t,s="",a=""){return`<div class="processing-summary-card">
    <span class="processing-summary-label">${r(e)}</span>
    <span class="processing-summary-value">${t}</span>
    ${s?`<span class="processing-summary-hint">${s}</span>`:""}
    ${a}
  </div>`}function Nc(e){let t=e.database||{},s=e.index||{},a=e.local_archives||{},n=e.raw_backups||{},i=n.totals||{},o=e.state||{},l=e.capabilities||{},u=e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D",c=t.status==="operational",m=s.status==="operational",$=a.available!==!1,b=n.available!==!1,p=m?`${d(s.indexed)} / ${d(s.total)}`:wt(s.status||"unavailable"),g=m?`${ft(s.percent)} \xB7 \u5C1A\u9918 ${d(s.remaining)} \u7B46`:r(s.error||"\u7121\u6CD5\u67E5\u8A62 Qdrant \u7D22\u5F15\u8986\u84CB\u7387\u3002"),y=$?`${d(a.unprocessed)} / ${d(a.total)}`:wt("unavailable"),_=$?`\u672A\u8655\u7406 / \u5168\u90E8 \xB7 ${Ie(a.unprocessed_bytes)} \u5F85\u8655\u7406`:r(a.error||"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304\u3002");return`<div class="processing-summary">
    ${Qt(Gc(e))}
    ${bs("\u8655\u7406\u72C0\u614B",wt(e.status||"unknown"),`${r(u)} \xB7 \u66F4\u65B0\u65BC <span data-processing-updated-at>\u2014</span>`)}
    ${bs("\u672A\u8655\u7406\u58D3\u7E2E\u6A94",r(y),_)}
    ${bs("\u539F\u59CB\u8CC7\u6599\u5099\u4EFD",b?`${d(n.count)} \u6A94`:wt("unavailable"),b?`\u5171 ${d(i.row_count)} \u7B46 \xB7 ${Ie(i.compressed_bytes)}`:r(n.error||"\u7121\u6CD5\u6383\u63CF\u539F\u59CB\u8CC7\u6599\u5099\u4EFD\u3002"))}
    ${bs("PostgreSQL \u5224\u6C7A",c?d(t.judgment_count):wt("unavailable"),c?`\u6CD5\u898F ${Ai(t.law_count)} \xB7 \u547D\u4EE4 ${Ai(t.order_count)}`:r(t.error||"\u7121\u6CD5\u67E5\u8A62 PostgreSQL\u3002"))}
    ${bs("Qdrant \u7D22\u5F15",p,g)}
    ${bs("\u72C0\u614B\u6A94",wt(o.status||"missing"),o.updated_at?`\u66F4\u65B0\u65BC ${r($e(o.updated_at))}`:r(o.detail||"\u5C1A\u7121\u8655\u7406\u72C0\u614B\u7D00\u9304\u3002"))}
    ${bs("\u5F85\u8655\u7406\u5DE5\u4F5C",l.can_start_update===!1?"\u66AB\u505C\u555F\u52D5":"\u53EF\u958B\u59CB\u66F4\u65B0",l.start_blocked_reason?r(l.start_blocked_reason):`\u672A\u8655\u7406 ${d(l.unprocessed_archives)} \u500B \xB7 \u7D22\u5F15\u5F85\u88DC ${d(l.index_backlog)} \u7B46${l.external_processes?` \xB7 \u5916\u90E8\u7A0B\u5E8F ${d(l.external_processes)} \u500B`:""}`)}
  </div>`}function Ec(e){let t=e.timeline||{},s=Array.isArray(t.stages)?t.stages:[],a=`<div class="report-section-head">
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
    </section>`;let n=s.map(o=>`<span class="processing-stack-segment" style="width:${Math.max(0,Number(o.percent)||0)}%;background:${r(o.color||"var(--accent)")}" title="${r(`${o.label} ${fe(o.duration_ms)} (${ft(o.percent)})`)}"></span>`).join(""),i=s.map(o=>`<div class="processing-legend-item">
        <span class="processing-legend-swatch" style="background:${r(o.color||"var(--accent)")}"></span>
        <span class="processing-legend-label">${r(o.label)}</span>
        <span class="mono">${fe(o.duration_ms)}</span>
        <span class="processing-legend-percent mono">${ft(o.percent)}</span>
        ${wt(o.status)}
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
  </section>`}function Rc(e){let t=Array.isArray(e.recent_runs)?e.recent_runs:[],s=new Map((e.branches||[]).map(i=>[i.key,i.label])),a=`<div class="report-section-head">
    <div>
      <div class="report-kicker">RECENT RUNS</div>
      <h2 class="report-section-title">\u6700\u8FD1\u8655\u7406\u7D00\u9304</h2>
      <p class="processing-section-sub">\u5305\u542B\u8CC7\u6599\u66F4\u65B0\u3001\u5224\u6C7A\u4E0B\u8F09\u3001\u5224\u6C7A\u532F\u5165\u3001Parquet\u3001Qdrant \u8207\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E0B\u8F09\u3002</p>
    </div>
  </div>`;if(!t.length)return`<section class="report-card processing-card">
      <div class="report-head">${a}</div>
      <div class="report-section"><div class="processing-empty">\u5C1A\u7121\u8655\u7406\u7D00\u9304\u3002</div></div>
    </section>`;let n=t.map(i=>{let o=s.get(i.branch)||Lc[i.branch]||i.branch||"\u2014";return`<div class="processing-run">
        <div class="processing-run-head">
          <span class="badge badge-neutral">${r(o)}</span>
          <strong>${r(i.title||"\u8655\u7406")}</strong>
          ${wt(i.status)}
          <span class="grow"></span>
          <span class="mono faint">${r($e(i.finished_at||i.started_at))}</span>
          <span class="mono">${i.duration_ms?fe(i.duration_ms):"\u2014"}</span>
        </div>
        ${i.message?`<div class="processing-run-message">${r(i.message)}</div>`:""}
      </div>`}).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section"><div class="processing-run-list">${n}</div></div>
  </section>`}function Cc(e){let t=Array.isArray(e.notices)?e.notices:[];return t.length?`<div class="processing-notices">${t.map(s=>He({tone:s.tone||"info",title:s.title,text:r(s.message||"")})).join("")}</div>`:""}function Li(e,t){if(e==="law"||e==="order")return t==="qdrant"?"legal_index_versions":`${e}_download`;if(e==="judgment"){if(t==="download")return"judgment_download";if(t==="parquet"||t==="postgres")return"judgment_import";if(t==="qdrant")return"index_versions"}return""}function En({month:e,year:t,monthNo:s,stageOrder:a,stageLabels:n,stageStatuses:i,overall:o,active:l,workflowForStage:u,stageProgress:c=null,variant:m="legacy"}){let $=i||{},b=m==="index"||m==="import",p=String(e?.month||`${t}${String(s).padStart(2,"0")}`),g=e?.month_label||`${t}-${String(s).padStart(2,"0")}`,y=F=>b&&F==="processing"?"\u57F7\u884C\u4E2D":yi[F]||yi.empty,_=F=>{let T=$[F]||"empty";if(m!=="index"||typeof c!="function"||!(T==="processing"||F==="qdrant"&&T==="incomplete"))return null;let E=Number(c(F,p,T));return Number.isFinite(E)?Math.max(0,Math.min(100,E)):null},q=a.map(F=>{let T=$[F]||"empty",S=_(F),E=F==="qdrant"&&T==="incomplete"&&S!==null&&S>0,se=E?"\u5DF2\u8655\u7406":y(T),le=!E&&S!==null&&S>0?` ${S.toFixed(1)}%`:"";return`${n[F]||F}\uFF1A${se}${le}`}).join(" \xB7 "),M=(e?.versions||[]).map(F=>F.version_code).filter(Boolean),A=[...new Set([...e?.files||[],...e?.local_files||[],...e?.imported_files||[]])].filter(Boolean),U=M.length?` \xB7 \u7248\u672C ${M.join("\u3001")}`:A.length?` \xB7 ${A.join("\u3001")}`:"",V=e?.detail?` \xB7 ${e.detail}`:"",J=e?`${g} \xB7 ${q}${U}${V}`:`${g} \xB7 \u7121\u8CC7\u6599`,ke=b?o==="empty"?"is-empty":"is-neutral":wi[o]||"is-empty",Se=a.map(F=>{let T=$[F]||"empty",S=T==="incomplete"?u(F):"",E=S?"button":"span",se=S?` type="button" data-timeline-workflow="${r(S)}"`:"",le=_(F),Q=F==="qdrant"&&T==="incomplete"&&le!==null&&le>0,pe=T==="processing"&&le!==null?` ${le.toFixed(1)}%`:"",ye=Q?"\u5DF2\u8655\u7406":y(T),I=T==="complete"?"is-complete":T==="processing"?"is-running":Q?"is-partial":T==="incomplete"?"is-incomplete":"is-empty",we=b?["index-month-block","processing-month-stage",`is-${F}`,I,S?"is-actionable":""]:["processing-month-stage",wi[T]||"is-empty",S?"is-actionable":""],G=T==="processing"&&le!==null?` style="--stage-progress:${le.toFixed(1)}%"`:"";return`<${E} class="${we.filter(Boolean).join(" ")}"${se}${G} title="${r(`${n[F]||F}\uFF1A${ye}${pe}${S?"\uFF08\u9EDE\u9078\u524D\u5F80\u8655\u7406\uFF09":""}`)}" aria-label="${r(`${g} ${n[F]||F} ${ye}${pe}${S?"\uFF0C\u9EDE\u9078\u524D\u5F80\u8655\u7406":""}`)}"></${E}>`}).join("");return b?`<td class="judgment-month index-month index-month-are processing-month ${ke}${l?" is-current":""}" data-month="${r(p)}" title="${r(J)}" aria-label="${r(J)}"${l?' aria-current="true"':""}>
    <span class="index-month-number">${s}</span>
    <span class="index-month-blocks">${Se}</span>
  </td>`:`<td class="judgment-month import-month processing-month${l?" is-current":""} is-${r(o)}" data-month="${r(p)}" title="${r(J)}" aria-label="${r(J)}"${l?' aria-current="true"':""}>
    <span class="processing-month-number">${s}</span>
    <span class="processing-month-stages">${Se}</span>
  </td>`}function Pc(e,t,s,a,n){return En({month:t,year:s,monthNo:a,stageOrder:Tn,stageLabels:qc,stageStatuses:t?.stages||{},overall:t?.overall||"empty",active:!!(t?.active||t?.overall==="processing"),workflowForStage:i=>Li(e.key,i),stageProgress:n,variant:"index"})}function Ic(e,t,s){let a=Number(e?.total_months)||t.length||0,n=Number(s?.complete)||0,i=Number(s?.incomplete)||0,o=Number(s?.superseded)||0,l=a>0?(n+o)/a*100:null,u=["download","prepared","indexed"],c=0,m=0;for(let b of t){let p=b?.stages||{};for(let g of u){let y=p[g];!y||y==="empty"||y==="not_applicable"||(c+=1,y==="complete"&&(m+=1))}}return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",d(n),"\u5DF2\u5B8C\u6210 D\uFF0FP\uFF0FI \u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",d(i+(Number(s?.processing)||0)),"\u4ECD\u6709\u968E\u6BB5\u672A\u5B8C\u6210\u6216\u6B63\u5728\u8655\u7406\u7684\u6708\u4EFD\u6578\u3002"],["\u5DF2\u53D6\u4EE3\u6708\u4EFD",d(o),"\u820A\u7248\u672C\u5DF2\u88AB\u76EE\u524D\u7248\u672C\u53D6\u4EE3\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",d(a),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",ft(l),"\u5B8C\u6210\u6216\u5DF2\u53D6\u4EE3\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${d(m)} / ${d(c)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([b,p,g])=>`<span class="index-runtime-metric" title="${r(g)}"><span>${r(b)}</span><strong>${r(p)}</strong></span>`).join("")}</div>`}function Dc(e,t,s,a){let n=Number(e?.total_months)||t.length||0,i=Number(s?.complete)||0,o=Number(s?.incomplete)||0,l=Number(s?.processing)||0,u=Number(a?.gray)||0,c=n>0?i/n*100:null,m=0,$=0;for(let p of t){let g=p?.import_stages||{};for(let y of["extract","raw_parquet","filter","postgres"]){let _=g[y];!_||_==="empty"||(m+=1,_==="complete"&&($+=1))}}return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",d(i),"\u56DB\u500B\u532F\u5165\u968E\u6BB5\u90FD\u5B8C\u6210\u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",d(o+l),"\u4ECD\u6709\u968E\u6BB5\u672A\u5B8C\u6210\u6216\u6B63\u5728\u8655\u7406\u7684\u6708\u4EFD\u6578\uFF08\u542B\u8655\u7406\u4E2D\uFF09\u3002"],["\u6709\u66F4\u65B0\u6708\u4EFD",d(u),"\u5075\u6E2C\u5230\u6709\u65B0\u8CC7\u6599\u53EF\u66F4\u65B0\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",d(n),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",ft(c),"\u5B8C\u6210\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${d($)} / ${d(m)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([p,g,y])=>`<span class="index-runtime-metric" title="${r(y)}"><span>${r(p)}</span><strong>${r(g)}</strong></span>`).join("")}</div>`}function Oc(e,{titleSuffix:t="\u7D22\u5F15\u7248\u672C\u6642\u9593\u8868"}={}){let s=`${r(e?.label||"\u6CD5\u898F\uFF0F\u547D\u4EE4")} ${r(t)}`,a=Array.isArray(e?.months)?e.months:[];if(!a.length)return`<section class="report-card processing-card import-files-card law-index-timeline-card">
      <div class="side-card-head">
        <span class="side-card-title">${f(e?.key==="order"?"file":"layers",14)}${s}</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u5C1A\u7121\u4E0B\u8F09\u7248\u672C\u6216\u7D22\u5F15\u7D00\u9304\u3002</div>
    </section>`;let n=new Map(a.map(b=>[String(b.month),b])),i=[...new Set(a.map(b=>b.year))].sort((b,p)=>String(p).localeCompare(String(b))),o=["download","prepared","indexed"],l=e.stage_labels||{download:"D \u4E0B\u8F09\u7248\u672C",prepared:"P \u8CC7\u6599\u5C31\u7DD2",indexed:"I \u7D22\u5F15\u8986\u84CB"},u=e.summary||{},c=e.current||{},m=i.map(b=>{let p=Array.from({length:12},(g,y)=>{let _=y+1,q=`${b}${String(_).padStart(2,"0")}`,M=n.get(q);return En({month:M,year:b,monthNo:_,stageOrder:o,stageLabels:l,stageStatuses:M?.stages||{},overall:M?.overall||"empty",active:!!M?.active,workflowForStage:A=>A==="indexed"?"legal_index_versions":`${e.key}_download`,variant:"index"})}).join("");return`<tr><th scope="row">${r(b)}</th>${p}</tr>`}).join(""),$=c.month?`<div class="index-current-row">
        <span class="badge badge-info">${f("activity",11)}${r(c.label||"\u76EE\u524D\u7248\u672C")}</span>
        <strong class="mono">${r(c.month_label||Ma(c.month))}</strong>
        <span class="mono">${r(c.file||"\u2014")}</span>
        <span class="index-current-copy">${r(c.detail||"")}</span>
      </div>`:"";return`<section class="report-card processing-card import-files-card law-index-timeline-card" data-law-index-timeline="${r(e.key||"")}">
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${f(e.key==="order"?"file":"layers",14)}${s}</span>
      ${Ic(e,a,u)}
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
        <span><i class="processing-timeline-swatch is-hollow-state"></i>\u672A\u5B8C\u6210</span>
        <span><i class="processing-timeline-swatch is-progress-state"></i>\u57F7\u884C\u4E2D\uFF08\u9032\u5EA6\u689D\uFF09</span>
        <span><i class="processing-timeline-swatch is-empty"></i>\u7121\u8CC7\u6599\uFF0F\u5DF2\u53D6\u4EE3</span>
      </div>
      <div class="judgment-months-scroll">
        <table class="judgment-months-table index-months-table processing-months-table">
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(b,p)=>`<th scope="col">${p+1}</th>`).join("")}</tr></thead>
          <tbody>${m}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">D\uFF1A\u4E0B\u8F09\u7248\u672C\uFF1BP\uFF1Araw Parquet + PostgreSQL \u5C31\u7DD2\uFF1BI\uFF1Aactive \u7D22\u5F15\u8986\u84CB\uFF08\u7531\u6CD5\u898F\uFF0F\u547D\u4EE4\u7D22\u5F15\u6D41\u7A0B\u7DAD\u8B77\uFF09\u3002\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\u5B8C\u6210\uFF0C\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u672A\u5B8C\u6210\uFF0C\u57F7\u884C\u4E2D\u7684\u65B9\u584A\u4EE5\u9032\u5EA6\u689D\u586B\u5145\uFF0C\u6DE1\u8272\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u7121\u8CC7\u6599\u6216\u5DF2\u53D6\u4EE3\u3002\u820A\u7248\u672C\u986F\u793A\u300C\u5DF2\u53D6\u4EE3\u300D\uFF0C\u4E0D\u9700\u91CD\u5EFA\u7D22\u5F15\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u7248\u672C\u7DE8\u865F\u3001\u4E0B\u8F09\u6642\u9593\u8207\u7B46\u6578\u3002</p>
    </div>
  </section>`}function Bc(e,t={}){let s=Array.isArray(e)?e:[];return s.length?`<div class="law-index-timelines">${s.map(a=>Oc(a,t)).join("")}</div>`:""}function ji({activeMonth:e,activeArchive:t,activePhase:s="",processingMonth:a="",processingArchive:n="",stageLabels:i={}}){if(!e||!t)return"";let o=`${String(e).slice(0,4)}-${String(e).slice(4,6)}`,l=i[s]||(s?"\u6E96\u5099\u4E2D":""),u=`${String(a||"").slice(0,4)}-${String(a||"").slice(4,6)}`,c=!!a&&(a!==e||n!==t);return`<span class="badge badge-info">${f("activity",11)}\u76EE\u524D\u532F\u5165</span>
    <strong class="mono">${r(o)}</strong>
    <span class="mono">${r(t)}</span>
    ${l?`<span class="badge badge-neutral">${r(l)}</span>`:""}
    ${c?`<span class="processing-current-processing">
            <span class="faint">\u8655\u7406\u4E2D</span>
            <strong class="mono">${r(u)}</strong>
            <span class="mono">${r(n||"\u2014")}</span>
          </span>`:""}`}function Fc(e,t,s,a){let n=[];for(let i=1;i<=12;i+=1){let o=`${t}${String(i).padStart(2,"0")}`;n.push(Pc(e,s.get(o),t,i,a))}return`<tr><th scope="row">${t}</th>${n.join("")}</tr>`}function Hc(e){let t=e?.models||{};return[["Embedding",t.embedding],["Rerank",t.rerank]].filter(([,s])=>s&&(s.label||s.model)).map(([s,a])=>{let n=a.label||[a.host,a.model].filter(Boolean).join(" ")||"\u2014",i=[`${s} \u4E3B\u6A5F\u8207\u6A21\u578B\uFF1A${n}`,a.url?`\u7AEF\u9EDE\uFF1A${a.url}`:"",s==="Rerank"&&a.enabled===!1?"RAG_RERANK_ENABLED=false":""].filter(Boolean).join(" \xB7 ");return`<span class="processing-timeline-model" title="${r(i)}">${s} <strong class="mono">${r(n)}</strong>${s==="Rerank"&&a.enabled===!1?' <span class="faint">\u672A\u555F\u7528</span>':""}</span>`}).join("")}function zc(e,t,s){let a=Number(e?.total_months)||t.length||0,n=Number(s?.complete)||0,i=a>0?n/a*100:null,o=t.reduce((m,$)=>{let b=$?.stages||{};return m+Tn.filter(p=>!!b[p]&&b[p]!=="empty"&&b[p]!=="not_applicable").length},0),l=t.reduce((m,$)=>{let b=$?.stages||{};return m+Tn.filter(p=>b[p]==="complete").length},0),u=(Number(s?.incomplete)||0)+(Number(s?.processing)||0);return`<div class="index-runtime-metrics">${[["\u5B8C\u6210\u6708\u4EFD",d(n),"\u5DF2\u5B8C\u6210\u5168\u90E8\u56DB\u500B\u968E\u6BB5\u7684\u6708\u4EFD\u6578\u3002"],["\u672A\u5B8C\u6210\u6708\u4EFD",d(u),"\u4ECD\u6709\u81F3\u5C11\u4E00\u500B\u968E\u6BB5\u672A\u5B8C\u6210\u6216\u6B63\u5728\u8655\u7406\u7684\u6708\u4EFD\u6578\u3002"],["\u6709\u66F4\u65B0\u6708\u4EFD",d(s?.update||0),"\u5075\u6E2C\u5230\u6709\u65B0\u8CC7\u6599\u53EF\u66F4\u65B0\u7684\u6708\u4EFD\u6578\u3002"],["\u7E3D\u6708\u4EFD",d(a),"\u6642\u9593\u8868\u6DB5\u84CB\u7684\u6708\u4EFD\u7E3D\u6578\u3002"],["\u5B8C\u6210\u7387",ft(i),"\u5B8C\u6210\u6708\u4EFD \xF7 \u7E3D\u6708\u4EFD\u3002"],["\u5B8C\u6210\u968E\u6BB5",`${d(l)} / ${d(o)}`,"\u6709\u8CC7\u6599\u4E14\u9700\u8655\u7406\u7684\u968E\u6BB5\u65B9\u683C\u4E2D\uFF0C\u5DF2\u5B8C\u6210\u7684\u65B9\u683C\u6578 / \u7E3D\u65B9\u683C\u6578\u3002"]].map(([m,$,b])=>`<span class="index-runtime-metric" title="${r(b)}"><span>${r(m)}</span><strong>${r($)}</strong></span>`).join("")}</div>`}function Uc(e,t){let s=new Map((Array.isArray(e?.workflows)?e.workflows:[]).map(m=>[String(m.id||""),m])),a=t.key==="judgment"?"index_versions":"legal_index_versions",i=s.get(a)?.index_runtime||{},o=m=>{if(m==null||m==="")return null;let $=Number(m);return Number.isFinite($)?Math.max(0,Math.min(100,$)):null},l=new Map((Array.isArray(i.months)?i.months:[]).map(m=>[String(m?.month||""),o(m?.percent)])),u=new Map(Object.entries(i.active_coverage||{}).map(([m,$])=>[String(m),o($?.percent)])),c=(m,$)=>{let b=s.get(String(m||""));if(!b)return null;let p=b.progress||{},g=Array.isArray(p.stages)?p.stages:[];for(let y of $){let _=g.find(M=>String(M.key)===y),q=o(_?.percent);if(q!==null)return q}return o(p.percent)};return(m,$,b)=>{let p=String($||"");if(m==="qdrant"){let _=l.get(p),q=u.get(p);if(b==="processing"){if(_!==null&&_>0)return _;if(q!==null&&q>0)return q}else return b==="incomplete"?_!==null&&_>0?_:q!==null&&q>0?q:0:null}let g=Li(t.key,m);if(!g)return null;let y=(Mc[t.key]||{})[m]||[m];return c(g,y)}}function Qc(e){let t=Array.isArray(e.file_timelines)?e.file_timelines:[];return t.length?`<div class="processing-timeline-overview">${t.map(s=>{let a=Array.isArray(s.months)?s.months:[],n=new Map(a.map(m=>[String(m.month||""),m])),i=[...new Set(a.map(m=>Number(m.year)))].filter(m=>Number.isFinite(m)).sort((m,$)=>$-m),o=s.summary||{},l=s.current||null,u=Hc(s),c=Uc(e,s);return`<section class="report-card processing-card import-files-card processing-timeline-card" data-processing-timeline="${r(s.key||"")}">
        <div class="side-card-head index-runtime-head">
          <span class="side-card-title">${f(s.icon||"activity",14)}${r(s.title||`${s.label||""}\u8655\u7406\u6642\u9593\u8868`)}</span>
          ${zc(s,a,o)}
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
                    <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(m,$)=>`<th scope="col">${$+1}</th>`).join("")}</tr></thead>
                    <tbody>${i.map(m=>Fc(s,m,n,c)).join("")}</tbody>
                  </table>
                </div>`:'<div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u3002</div>'}
          <p class="judgment-months-hint">${s.key==="judgment"?"\u5224\u6C7A\u4EE5\u88C1\u5224\u66F8\u6708\u4EFD\u986F\u793A\u3002":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u4EE5\u4F86\u6E90\u7248\u672C\u6708\u4EFD\u986F\u793A\u3002"}\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\u70BA\u4E0B\u8F09\u3001Parquet\u3001PostgreSQL\u3001Qdrant \u56DB\u500B\u968E\u6BB5\uFF1B\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\u5B8C\u6210\uFF0C\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u672A\u5B8C\u6210\uFF0CQdrant \u4E4B\u524D\u5DF2\u8655\u7406\u4F46\u5C1A\u672A\u5B8C\u6210\u6642\u4EE5\u6DE1\u6A59\u8272\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\uFF0C\u57F7\u884C\u4E2D\u7684\u65B9\u584A\u4EE5\u9032\u5EA6\u689D\u586B\u5145\uFF0C\u6DE1\u8272\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u7121\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u6216\u8272\u584A\u53EF\u67E5\u770B\u5404\u968E\u6BB5\u72C0\u614B\u8207\u9032\u5EA6\u3002</p>
        </div>
      </section>`}).join("")}</div>`:'<div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u8655\u7406\u6642\u9593\u8868\u3002</div>'}function Gc(e){return e.judgment_stats&&typeof e.judgment_stats=="object"?e.judgment_stats:{judgment_total:(e.raw_backups?.totals||{}).row_count,financial_total:(e.database||{}).judgment_count}}function qi(e,t=new Set){return`${Cc(e)}
    ${Nc(e)}
    ${Qc(e)}
    ${Ec(e)}
    ${Rc(e)}`}function Jc(e,t){return`<div class="report-card processing-card">
    <div class="report-section">
      ${He({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B",text:r(e||"\u672A\u77E5\u932F\u8AA4")})}
      ${t?`<p class="processing-section-sub">\u4E0A\u6B21\u6210\u529F\u66F4\u65B0\uFF1A${r($e(t.generated_at))}\u3002\u756B\u9762\u4E0A\u6C92\u6709\u986F\u793A\u66FF\u4EE3\u6216\u63A8\u6E2C\u7684\u9032\u5EA6\u3002</p>`:""}
      <div class="processing-error-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh">
          ${f("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
  </div>`}function Wc(e,t){if(e.nodeType!==t.nodeType||e.nodeName!==t.nodeName){e.replaceWith(t.cloneNode(!0));return}if(e.nodeType===Node.TEXT_NODE){e.nodeValue!==t.nodeValue&&(e.nodeValue=t.nodeValue);return}if(e.nodeType===Node.ELEMENT_NODE){for(let s of[...e.attributes])t.hasAttribute(s.name)||e.removeAttribute(s.name);for(let s of[...t.attributes])e.getAttribute(s.name)!==s.value&&e.setAttribute(s.name,s.value);t.hasAttribute("data-preserve-children")||Ti(e,t)}}function Ti(e,t){let s=[...e.childNodes],a=[...t.childNodes],n=Math.min(s.length,a.length);for(let i=0;i<n;i+=1)Wc(s[i],a[i]);for(let i=n;i<s.length;i+=1)s[i].remove();for(let i=n;i<a.length;i+=1)e.appendChild(a[i].cloneNode(!0))}function cs(e,t){let s=document.createElement("template");s.innerHTML=t,Ti(e,s.content)}var Ni={overview:"activity",law_download:"layers",order_download:"file",judgment_download:"download",judgment_import:"database",judgment_parquet:"cube",index_versions:"brain",normalize_courts:"filter",backfill_law_articles:"history"};function Vc(e){let s=(Array.isArray(e.workflows)?e.workflows:[]).map(n=>{let i=n.active_run||null,o=i||n.last_run||null;return{...n,activeRun:i,lastRun:o,status:i?i.status||"running":n.update_available?"update":o?.status||"idle"}}),a=s.find(n=>n.id==="judgment_parquet");return[{id:"overview",label:"\u8655\u7406\u7E3D\u89BD",description:"\u76EE\u524D\u6D41\u7A0B\u3001\u58D3\u7E2E\u6A94\u8207\u6700\u8FD1\u57F7\u884C\u7D00\u9304",status:e.status||"idle",activeRun:null,lastRun:null},...s.filter(n=>n.id!=="judgment_parquet"),...a?[a]:[]]}function qn(e,t){let s=Vc(e),a=new Set(["law_download","judgment_download","normalize_courts"]);return`<div class="status-sidebar-head">
      <div class="eyebrow">DATA WORKFLOWS</div>
      <div class="status-sidebar-title">\u8CC7\u6599\u6D41\u7A0B</div>
    </div>
    <nav class="status-tab-list" aria-label="\u8CC7\u6599\u8655\u7406\u5DE5\u4F5C\u6D41\u7A0B">
      ${s.map(n=>{let i=n.id===t,o=Ni[n.id]||"terminal",l=a.has(n.id)?'<div class="status-tab-divider" role="separator" aria-hidden="true"></div>':"",u=Number(n.pending_count)||0,c=Number(n.update_count)||(n.update_available?u:0),m=n.update_available&&c>0&&!n.activeRun,$=[n.update_message||`${n.update_origin||"\u66F4\u65B0\u5075\u6E2C"}\u627E\u5230 ${d(c)} \u9805\u53EF\u66F4\u65B0\u5167\u5BB9`,n.update_origin?`\u4F86\u6E90\uFF1A${n.update_origin}`:"",n.update_mechanism?`\u6A5F\u5236\uFF1A${n.update_mechanism}`:""].filter(Boolean).join(" \xB7 ");return`${l}<button class="status-tab${i?" is-active":""}" type="button"
            data-processing-workflow="${r(n.id)}"
            ${i?'aria-current="page"':""}>
            <span class="status-tab-icon">${f(o,15)}</span>
            <span class="status-tab-copy">
              <strong>${r(n.label)}</strong>
              <small>${r(n.description||"")}</small>
            </span>
            ${m?`<span class="badge badge-warn badge-mono processing-update-count" title="${r($)}">${f("refresh",10)}${d(c)}</span>`:wt(n.status)}
          </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u57F7\u884C\u6A21\u5F0F</span>
      <span class="mono">${r(e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D")}</span>
    </div>`}function Kc(e){if(!e)return'<div class="processing-workflow-empty">\u5C1A\u672A\u57F7\u884C\u3002\u6309\u4E0B\u53F3\u5074\u6309\u9215\u958B\u59CB\u3002</div>';let t=e.meta||{};return`<div class="processing-workflow-run">
    <div class="processing-workflow-run-head">
      ${wt(e.status)}
      <span class="mono">${r(e.id||"\u2014")}</span>
    </div>
    <div class="processing-workflow-run-grid">
      <span>\u958B\u59CB</span><strong>${r($e(e.started_at))}</strong>
      <span>\u8017\u6642</span><strong>${fe(e.duration_ms)}</strong>
      <span>\u8A0A\u606F</span><strong>${r(e.message||"\u2014")}</strong>
      ${t.log_path?`<span>\u65E5\u8A8C</span><strong class="mono">${r(t.log_path)}</strong>`:""}
    </div>
  </div>`}function Js(e){return`${e.year}-${String(e.month_no).padStart(2,"0")}`}function Ei(e){let t={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"},s=e.status||"red";return[Js(e),t[s]||s,e.latest_fileset_id?`fileset ${e.latest_fileset_id}`:"",e.filename||"",e.local_filename&&e.local_filename!==e.filename?`\u672C\u6A5F\uFF1A${e.local_filename}`:""].filter(Boolean).join(" \xB7 ")}function Ri(e){if(!e.download_url)return"";let t=Js(e);return`<a class="judgment-month-download" href="${r(St(e.download_url))}" target="_blank" rel="noreferrer" title="\u4E0B\u8F09 ${t} \u5224\u6C7A" aria-label="\u4E0B\u8F09 ${t} \u5224\u6C7A">${f("download",11)}</a>`}function Yc(e){let t=e.status||"red";return`<td class="judgment-month is-${r(t)}" data-judgment-month-key="${r(Js(e))}" title="${r(Ei(e))}"><span>${e.month_no}</span>${Ri(e)}</td>`}function Xc(e){return e?.off_hours_enabled===!0}function Ci(e){return`\u7DA0\u8272\uFF1A\u6700\u65B0\u7248\u5DF2\u4E0B\u8F09\u5230 raw_rar\uFF1B\u7070\u8272\uFF1A\u672C\u6A5F\u4ECD\u662F\u820A\u7248\uFF0C\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u6703\u66F4\u65B0\uFF1B\u7D05\u8272\uFF1A\u8A72\u6708\u4EFD\u7F3A\u5C11\u5224\u6C7A\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u958B\u555F\u4E0B\u8F09\u9023\u7D50\uFF08${Xc(e)?"\u975E API \u6642\u6BB5\u4E5F\u53EF\u4E0B\u8F09\uFF0C\u5EFA\u8B70\u4E00\u6B21\u53EA\u4E0B\u8F09\u4E00\u500B\u6A94\u6848":"\u4E0B\u8F09\u9023\u7D50\u50C5\u5728 00:00\u201306:00 API \u6642\u6BB5\u53EF\u7528"}\uFF09\u3002\u5F85\u88DC\u9F4A\u6708\u4EFD\u6703\u512A\u5148\u4E0B\u8F09\uFF0C\u5168\u90E8\u88DC\u9F4A\u5F8C\u624D\u7531\u6700\u65B0\u6708\u4EFD\u5F80\u56DE\u9A57\u8B49\u65E2\u6709\u6A94\u6848\uFF1B\u4E2D\u65B7\u7684\u4E0B\u8F09\u6703\u4FDD\u7559 .part\uFF0C\u4F3A\u670D\u5668\u652F\u63F4 Range \u6642\u7E8C\u50B3\uFF0C\u5426\u5247\u5F9E\u96F6\u91CD\u65B0\u4E0B\u8F09\u3002\u9996\u6B21\u5B8C\u6574\u540C\u6B65\u53EF\u80FD\u9700\u4E0B\u8F09\u6578\u767E\u500B\u6708\u4EFD\uFF0C\u9810\u8A2D\u975E\u6642\u6BB5\u4E5F\u53EF\u7E8C\u50B3\uFF1B\u56B4\u683C\u6A21\u5F0F\u6703\u5728 00:00\u201306:00 \u4EE5\u5916\u505C\u6B62\u3002`}var Zc={completed:"\u5B8C\u6210",window_closed:"API \u6642\u6BB5\u7D50\u675F",deadline:"\u63A5\u8FD1 06:00\uFF0C\u4FDD\u7559\u5F85\u4E0B\u8F09\u6708\u4EFD",verification_window_closed:"API \u6642\u6BB5\u7D50\u675F\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",verification_deadline:"\u63A5\u8FD1 06:00\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",errors:"\u90E8\u5206\u6708\u4EFD\u4E0B\u8F09\u5931\u6557\uFF0C\u4E0B\u6B21\u91CD\u8A66",pending:"\u4ECD\u6709\u5F85\u4E0B\u8F09\u6708\u4EFD",check_only:"\u50C5\u6AA2\u67E5\uFF0C\u672A\u4E0B\u8F09",incremental:"\u589E\u91CF\u6AA2\u67E5\u5B8C\u6210",status_only:"\u50C5\u66F4\u65B0\u6708\u4EFD\u72C0\u614B",running:"\u57F7\u884C\u4E2D"};function Pi(e){let t=e?.backfill||{},s=t.verification||{},a=t.last_run||{},n=Number(t.pending_count)||0,i=Number(t.failure_count)||0,o=String(t.resume_from_month||""),l="\u9A57\u8B49\uFF1A\u672A\u958B\u59CB";s.status==="completed"?l="\u9A57\u8B49\u5B8C\u6210":s.next_month?l=`\u9A57\u8B49\u7E8C\u50B3 ${s.next_month}`:s.status==="in_progress"&&(l="\u9A57\u8B49\u9032\u884C\u4E2D");let u=String(a.stop_reason||""),c=u?`\u4E0A\u6B21\u505C\u6B62\uFF1A${Zc[u]||u}`:"";return{pending:n,failures:i,resume:o,verificationText:l,lastText:c}}function ed(e){let t=Pi(e),s=t.pending>0?`\u5F85\u88DC\u9F4A ${d(t.pending)} \u500B\u6708${t.failures>0?`\uFF08${d(t.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708";return`<div class="judgment-backfill" data-judgment-backfill>
    <span class="badge ${t.pending>0?"badge-danger":"badge-ok"}" data-judgment-backfill-pending>${s}</span>
    <span class="badge badge-neutral" data-judgment-backfill-resume ${t.resume&&t.pending>0?"":"hidden"}>\u5F9E ${r(t.resume)} \u7E8C\u50B3</span>
    <span class="badge badge-info" data-judgment-backfill-verification>${r(t.verificationText)}</span>
    <span class="muted" data-judgment-backfill-last ${t.lastText?"":"hidden"}>${r(t.lastText)}</span>
  </div>`}function td(e,t){let s=Pi(t),a=e.querySelector("[data-judgment-backfill-pending]");a&&(a.textContent=s.pending>0?`\u5F85\u88DC\u9F4A ${d(s.pending)} \u500B\u6708${s.failures>0?`\uFF08${d(s.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708",a.classList.toggle("badge-danger",s.pending>0),a.classList.toggle("badge-ok",s.pending===0));let n=e.querySelector("[data-judgment-backfill-resume]");if(n){let l=!!s.resume&&s.pending>0;n.hidden=!l,n.textContent=l?`\u5F9E ${s.resume} \u7E8C\u50B3`:""}let i=e.querySelector("[data-judgment-backfill-verification]");i&&(i.textContent=s.verificationText);let o=e.querySelector("[data-judgment-backfill-last]");o&&(o.hidden=!s.lastText,o.textContent=s.lastText)}function Rn(){return'<div class="judgment-months-loading"><span class="spinner"></span><span>\u8B80\u53D6\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B\u2026</span></div>'}function sd(e){if(e?.loading&&!e?.months?.length)return Rn();if(e?.error&&!e?.months?.length)return He({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:r(e.error)});let t=Array.isArray(e?.months)?e.months:[];if(!t.length)return'<div class="processing-empty">\u5C1A\u672A\u6709\u6708\u4EFD\u72C0\u614B\uFF1B\u8ACB\u5148\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u3002</div>';let s=new Map(t.map(o=>[Js(o),o])),n=[...new Set(t.map(o=>o.year))].sort((o,l)=>l-o).map(o=>{let l=Array.from({length:12},(u,c)=>{let m=s.get(`${o}-${String(c+1).padStart(2,"0")}`);return m?Yc(m):`<td class="judgment-month is-empty"><span>${c+1}</span></td>`}).join("");return`<tr><th scope="row">${o}</th>${l}</tr>`}).join(""),i=e.summary||{};return`<div class="judgment-months">
    <div class="judgment-months-meta">
      <span class="badge badge-ok" data-judgment-summary="green">\u6700\u65B0\u7248 ${d(i.green||0)}</span>
      <span class="badge badge-neutral" data-judgment-summary="gray">\u820A\u7248 ${d(i.gray||0)}</span>
      <span class="badge badge-danger" data-judgment-summary="red">\u7F3A\u5931 ${d(i.red||0)}</span>
      <span class="muted" data-judgment-total>\u5171 ${d(e.total_months||t.length)} \u500B\u6708</span>
    </div>
    ${ed(e)}
    <div class="judgment-months-scroll">
      <table class="judgment-months-table">
        <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(o,l)=>`<th scope="col">${l+1}</th>`).join("")}</tr></thead>
        <tbody>${n}</tbody>
      </table>
    </div>
    <p class="judgment-months-hint" data-judgment-hint>${r(Ci(e))}</p>
  </div>`}function ad(e,t){let s=Array.isArray(t?.months)?t.months:[],a=t.summary||{},n={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"};e.querySelectorAll("[data-judgment-summary]").forEach(l=>{let u=l.dataset.judgmentSummary||"";l.textContent=`${n[u]||u} ${d(a[u]||0)}`});let i=e.querySelector("[data-judgment-total]");i&&(i.textContent=`\u5171 ${d(t.total_months||s.length)} \u500B\u6708`),td(e,t);let o=e.querySelector("[data-judgment-hint]");if(o){let l=Ci(t);o.textContent!==l&&(o.textContent=l)}for(let l of s){let u=Js(l),c=e.querySelector(`[data-judgment-month-key="${u}"]`);if(!c)continue;let m=l.status||"red";c.classList.contains(`is-${m}`)||(c.classList.remove("is-green","is-gray","is-red","is-empty"),c.classList.add(`is-${m}`));let $=Ei(l);c.title!==$&&(c.title=$);let b=c.querySelector(".judgment-month-download");if(l.download_url){let p=St(l.download_url);b?b.getAttribute("href")!==p&&(b.href=p):c.insertAdjacentHTML("beforeend",Ri(l))}else b&&b.remove()}}function nd(e){let t=Array.isArray(e)?e:[];return t.length?`<div class="processing-workflow-history">
    ${t.map(s=>`<div class="processing-workflow-history-row">
          <span class="processing-workflow-history-status">${wt(s.status||"idle")}</span>
          <span class="mono">${r($e(s.started_at))}</span>
          <span class="mono">${r(fe(s.duration_ms||0))}</span>
          <span class="processing-workflow-history-message">${r(s.message||"\u2014")}</span>
        </div>`).join("")}
  </div>`:'<div class="processing-workflow-empty">\u5C1A\u7121\u57F7\u884C\u7D00\u9304\u3002</div>'}function rd(e){let t=Array.isArray(e.update_history)?e.update_history:[];if(!t.length)return'<div class="processing-workflow-empty">\u5C1A\u7121\u7248\u672C\u6AA2\u67E5\u7D00\u9304\u3002</div>';let s={up_to_date:["\u5DF2\u662F\u6700\u65B0","badge-ok"],update_available:["\u6709\u66F4\u65B0","badge-warn"],error:["\u6AA2\u67E5\u5931\u6557","badge-danger"]};return`<div class="processing-workflow-history">
    ${t.map(a=>{let[n,i]=s[a.status]||[a.status||"\u672A\u77E5","badge-neutral"],o=a.remote_content_length!=null?Ie(a.remote_content_length):"\u2014",l=a.local_version_id?`v${a.local_version_id}`:"\u2014";return`<div class="processing-workflow-history-row">
          <span class="badge ${i}">${r(n)}</span>
          <span class="mono">${r($e(a.checked_at))}</span>
          <span class="mono">\u9060\u7AEF ${r(o)}</span>
          <span class="mono">\u672C\u5730 ${r(l)}</span>
          <span class="processing-workflow-history-message">${r(a.message||"\u2014")}</span>
        </div>`}).join("")}
  </div>`}function Ii(e){let t=String(e.key||""),s=ds(e.status);return[`data-stage-key="${r(t)}"`,`data-stage-label="${r(e.label||t)}"`,`data-stage-color="${r(Mi(e))}"`,`data-stage-status-key="${r(e.status||"idle")}"`,`data-stage-status="${r(s.label)}"`,`data-stage-percent="${r(ft(e.percent))}"`,`data-stage-counts="${r(Nn(e))}"`,`data-stage-duration="${r(Gs(e.duration_ms||0))}"`,`data-stage-contribution="${r(ft(e.contribution_percent))}"`,`data-stage-message="${r(e.message||"")}"`].join(" ")}function id(e,t=Date.now()){let s=String(e.status||"idle"),a=Number(e.duration_ms)||0,n=Date.parse(e.started_at||"");if(s==="running"&&Number.isFinite(n))return Math.max(a,t-n);if(a>0)return a;let i=Date.parse(e.finished_at||"");return Number.isFinite(n)&&Number.isFinite(i)?Math.max(0,i-n):0}function Di(e){if(e.key!=="filter")return null;let t=Number(e.financial_processed),s=Number(e.financial_matched);return e.financial_processed===null||e.financial_processed===void 0||!Number.isFinite(t)||!Number.isFinite(s)||t<=0?null:{processed:t,matched:s,percent:Math.round(s/t*100)}}function od(e){let t=String(e.status||"idle"),s=[],a=Number(e.total);if(e.key==="postgres"&&["success","no_change"].includes(t)&&Number.isFinite(a)&&a>0)s.push(`\u7E3D\u8A08 ${d(a)} \u7B46`);else{let i=Nn(e);i!=="\u2014"&&s.push(i)}let n=Di(e);return n&&s.push(`\u91D1\u878D\u4F54\u6BD4 ${n.percent}%`),s.join(" \xB7 ")}function ld(e,t){let s=String(e.status||"idle"),a=[],n=(l,u,{always:c=!1}={})=>{let m=u==null?"":String(u).trim();!c&&!m||a.push(`<span class="rag-wf-detail"><span>${r(l)}</span><strong>${r(m||"\u2014")}</strong></span>`)};n("\u72C0\u614B",ds(s).label,{always:!0}),n("\u958B\u59CB",e.started_at?$e(e.started_at):"\u2014",{always:!0}),n("\u7D50\u675F",e.finished_at?$e(e.finished_at):"\u2014",{always:!0}),n("\u8017\u6642",t,{always:!0}),n("\u9032\u5EA6",ft(e.percent),{always:!0});let i=Nn(e);n("\u8CC7\u6599\u91CF",i!=="\u2014"?i:"");let o=Di(e);return o&&(n("\u91D1\u878D\u6848\u4EF6",`${d(o.matched)} \u7B46`),n("\u5168\u90E8\u6848\u4EF6",`${d(o.processed)} \u7B46`),n("\u91D1\u878D\u4F54\u6BD4",`${o.percent}%`)),n("\u6574\u9AD4\u5360\u6BD4",ft(e.contribution_percent)),s==="failed"||s==="stale"?(n("\u539F\u56E0",e.error||e.message||"\u968E\u6BB5\u57F7\u884C\u5931\u6557\u3002"),n("\u5EFA\u8B70",e.resolution||"\u67E5\u770B .run \u76EE\u9304\u4E2D\u7684\u6700\u65B0\u65E5\u8A8C\u53D6\u5F97\u5B8C\u6574 traceback\uFF0C\u4FEE\u6B63\u5F8C\u91CD\u65B0\u57F7\u884C\u6B64\u6D41\u7A0B\u3002")):n("\u8AAA\u660E",e.message),a.join("")}function cd(e){let t=e.progress||{},s=Array.isArray(t.stages)?t.stages:[];if(!s.length)return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
      <div class="side-card-head">
        <span class="side-card-title">${f("activity",14)}\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C\u6B64\u6D41\u7A0B\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A host/model\u3001Blue-Green \u5EFA\u7F6E\u8207\u5404\u968E\u6BB5\u9032\u5EA6\u3002</div>
    </section>`;let a=new Map(s.map(w=>[String(w.key||""),w])),n=a.get("ollama")||{},i=a.get("qdrant")||{},o=a.get("validate")||{},l=e.index_runtime||{},u=l.summary||{},c=l.copy||{},m=l.current||{},$=l.embedding||{},b=$.selected||{},p=$.active||{},g=Number(l.expected_count||u.total||i.total||0),y=Number(u.indexed??i.current??0),_=g>0?Math.min(100,y/g*100):i.status==="success"?100:0,q=Number(c.total||0),M=Number(c.copied||0),A=q>0?Math.min(100,M/q*100):c.status==="success"?100:0,U=String(l.build_mode||""),V=String(t.run_status||""),J=!!V&&!["running","success","no_change"].includes(V),ke=String(c.status||(U==="reuse"?"pending":"skipped"));J&&ke==="pending"&&(ke="stale");let Se=String(o.status||"pending"),F=Se==="success"&&/alias 已切換/.test(String(o.message||"")),T=F?"success":Se==="failed"?"failed":V==="running"?"pending":"skipped",S=l.version_id?`v${String(l.version_id).padStart(3,"0")}`:"\u2014",E=p.host||b.host||p.url||b.url||"\u2014",se=p.port||b.port,le=se?`${E}:${se}`:String(E),Q=p.model||b.model||l.model||"\u2014",pe=m.month?`${Ma(m.month)}${m.preparing?"\uFF08\u6E96\u5099\u4E2D\uFF09":""}`:t.run_status==="running"?"\u6E96\u5099\u4E2D":"\u2014",ye=[{key:"probe",label:"Ollama \u4E3B\u6A5F\uFF0F\u6A21\u578B\u6E2C\u8A66",caption:"\u4E3B\u6A5F\uFF0F\u6A21\u578B\u3001\u9023\u7DDA\u6E2C\u8A66",color:"#22c55e",status:n.status||"pending",percent:Number(n.percent)||0,current:Number(n.current)||0,total:Number(n.total)||0,unit:"\u53F0",duration_ms:n.duration_ms,started_at:n.started_at,finished_at:n.finished_at,extraDetails:[["\u4E3B\u6A5F",le],["\u6A21\u578B",Q],["\u6E2C\u8A66\u4E3B\u6A5F",`${d(n.current||0)} / ${d(n.total||0)} \u53F0`]],detail:`${d(n.current||0)} / ${d(n.total||0)} \u53F0 \xB7 ${le} \xB7 ${Q}`},{key:"version",label:"\u5EFA\u7ACB\uFF0F\u63A5\u7E8C Blue-Green \u7248\u672C",caption:"Blue-Green \u7248\u672C\u3001collection",color:"#06b6d4",status:l.version_id?"success":"pending",percent:l.version_id?100:0,current:l.version_id?1:0,total:1,unit:"\u968E\u6BB5",duration_ms:l.version_duration_ms,started_at:null,finished_at:null,extraDetails:[["\u7248\u672C",S],["Collection",l.collection||"\u2014"],["\u6A21\u5F0F",U||"\u2014"]],detail:`${S} \xB7 ${l.collection||"\u2014"} \xB7 ${U||"\u2014"}`},{key:"copy",label:"\u8907\u88FD\u53EF\u91CD\u7528\u5411\u91CF",caption:"\u820A collection \u5411\u91CF\u8907\u88FD",color:"#f59e0b",status:ke,percent:A,current:M,total:q,unit:"points",duration_ms:c.duration_ms,started_at:c.started_at,finished_at:c.finished_at,extraDetails:[["\u5DF2\u8907\u88FD",`${d(M)} points`],["\u7E3D points",d(q)]],detail:q>0?`${d(M)} / ${d(q)} points \xB7 \u820A collection \u5411\u91CF`:ke==="skipped"?"\u672C\u6B21\u4E0D\u9700\u8907\u88FD\u820A\u5411\u91CF":ke==="stale"?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u5B8C\u6210\u8907\u88FD":"\u7B49\u5F85\u820A collection \u8907\u88FD"},{key:"index",label:"\u91D1\u878D\u5224\u6C7A\u5411\u91CF\u7D22\u5F15",caption:"\u91D1\u878D\u5224\u6C7A\u5411\u91CF\u3001\u6279\u6B21\u9032\u5EA6",color:"#a78bfa",status:i.status||"pending",percent:_,current:y,total:g,unit:"\u7B46",duration_ms:i.duration_ms,started_at:i.started_at||l.started_at,finished_at:i.finished_at,extraDetails:[["\u5DF2\u7D22\u5F15",`${d(y)} / ${d(g)} \u7B46`],["\u91CD\u7528",d(u.reused)],["\u65B0 embedding",d(u.embedded)],["\u76EE\u524D\u6708\u4EFD",pe]],detail:`${d(y)} / ${d(g)} \u7B46 \xB7 \u91CD\u7528 ${d(u.reused)} \xB7 \u65B0 embedding ${d(u.embedded)}`},{key:"validate",label:"\u9A57\u8B49\u65B0\u7248\u672C",caption:"\u7B46\u6578\u3001\u7DAD\u5EA6\u3001payload",color:"#eab308",status:Se,percent:Se==="success"?100:0,current:null,total:null,duration_ms:o.duration_ms,started_at:o.started_at,finished_at:o.finished_at,extraDetails:[["\u9A57\u8B49\u8A0A\u606F",o.message||"\u7B49\u5F85\u7D22\u5F15\u5B8C\u6210"]],detail:o.message||(J?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u9032\u884C\u9A57\u8B49\u3002":"\u7B49\u5F85\u7D22\u5F15\u5B8C\u6210\u5F8C\u9A57\u8B49\u7B46\u6578\u3001\u7DAD\u5EA6\u8207 payload\u3002")},{key:"activate",label:"\u5207\u63DB alias",caption:"judgments_current alias",color:"#3b82f6",status:T,percent:F?100:0,current:null,total:null,duration_ms:0,started_at:null,finished_at:null,extraDetails:[["\u76EE\u6A19 alias","judgments_current"]],detail:F?o.message:J?"\u4E0A\u6B21\u57F7\u884C\u4E2D\u6B62\uFF0C\u672A\u5207\u63DB alias\u3002":"\u9A57\u8B49\u901A\u904E\u5F8C\u5207\u63DB judgments_current\u3002"}],I=ye.filter(w=>w.status!=="skipped"),we=I.length?I.reduce((w,j)=>w+j.percent,0)/I.length:0,G=ye.filter(w=>w.status==="success").length,he=ft(we),Te=Date.now(),ne=w=>{let j=Number(w.duration_ms)||0,W=Date.parse(w.started_at||"");if(w.status==="running"&&Number.isFinite(W))return Math.max(j,Te-W);if(j>0)return j;let H=Date.parse(w.finished_at||"");return Number.isFinite(W)&&Number.isFinite(H)?Math.max(0,H-W):0},me=ye.map(w=>{let j=ne(w);return{...w,computedDuration:j,drawable:!["skipped","pending"].includes(w.status)}}),ge=Math.max(me.reduce((w,j)=>w+(j.drawable?j.computedDuration:0),0),Number(t.duration_ms)||0,1),Le=1.25,be=me.map(w=>w.drawable?Math.max(w.computedDuration/ge*100,Le):0),Ee=be.reduce((w,j)=>w+j,0),Fe=Ee>100?100/Ee:1,et=0,B=me.map((w,j)=>{let W=be[j]*Fe,H=W>0?{start:et,width:W}:null;return H&&(et+=W),{...w,bar:H}}).map((w,j)=>{let W=[`is-${w.status}`,w.status==="failed"||w.status==="stale"?"is-error":"",["pending","skipped"].includes(w.status)?"is-missing":"",w.status==="running"?"is-running":""].filter(Boolean).join(" "),H=["pending","skipped"].includes(w.status)?"\u2014":Gs(w.computedDuration),Oe=w.status==="running"?` \xB7 ${ft(w.percent)}`:"",Ce="";if(w.bar){let ot=Math.max(0,Math.min(100,w.bar.start)),Ve=Math.max(0,Math.min(100-ot,w.bar.width)),jt=w.status==="success"?100:Math.max(0,Math.min(100,Number(w.percent)||0)),nt=Ve*jt/100,Xe=Ve-nt,Pt=r(w.color);nt>0&&(Ce+=`<span class="rag-wf-bar index-wf-bar is-sequential" style="left:${ot.toFixed(3)}%;width:${nt.toFixed(4)}%;top:0;height:12px;--bar-color:${Pt}" aria-hidden="true"></span>`),Xe>1e-4&&(Ce+=`<span class="rag-wf-bar index-wf-bar is-hollow is-sequential" style="left:${(ot+nt).toFixed(3)}%;width:${Xe.toFixed(4)}%;top:0;height:12px;--bar-color:${Pt}" aria-hidden="true"></span>`)}let Pe=[],st=(ot,Ve)=>{Ve==null||Ve===""||Pe.push(`<span class="rag-wf-detail"><span>${r(ot)}</span><strong>${r(String(Ve))}</strong></span>`)};st("\u72C0\u614B",ds(w.status).label),st("\u958B\u59CB",w.started_at?$e(w.started_at):"\u2014"),st("\u7D50\u675F",w.finished_at?$e(w.finished_at):"\u2014"),st("\u8017\u6642",H),st("\u9032\u5EA6",ft(w.percent));for(let[ot,Ve]of w.extraDetails||[])st(ot,Ve);st("\u8AAA\u660E",w.detail);let lt={...w,duration_ms:w.computedDuration,contribution_percent:I.length?(Number(w.percent)||0)/I.length:null,message:w.detail};return`<details class="rag-wf-stage index-wf-stage ${W}" data-index-stage="${r(w.key)}"${Ln.has(w.key)?" open":""} style="--stage-color:${r(w.color)}" ${Ii(lt)}>
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="index-wf-step">${String(j+1).padStart(2,"0")}</span> ${r(w.label)}</strong><small>${r(w.caption||"")}</small></span>
            </span>
            <span class="rag-wf-stage-meta">${r(H)}${r(Oe)} \xB7 ${r(ds(w.status).label)} <span class="rag-wf-chevron">${f("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px">${Ce}</span>
        </summary>
        <div class="rag-wf-details">${Pe.join("")}</div>
      </details>`}).join("");return`<section class="report-card processing-card processing-workflow-progress-card index-wf-card" data-workflow-progress>
    <div class="side-card-head">
      <span class="side-card-title">${f("activity",14)}\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 Pipeline</span>
      <span class="badge ${t.run_status==="running"?"badge-info":"badge-neutral"}">${d(G)} / ${d(I.length)} \u968E\u6BB5</span>
    </div>
    <div class="index-wf-summary">
      <span>\u6574\u9AD4 <strong class="mono">${he}</strong></span>
      <span>\u7248\u672C <strong class="mono">${r(S)}</strong></span>
      <span>Collection <strong class="mono">${r(l.collection||"\u2014")}</strong></span>
      <span>\u6A21\u5F0F <strong>${r(U||"\u2014")}</strong></span>
      <span>Host <strong class="mono">${r(le)}</strong></span>
      <span>Model <strong class="mono">${r(Q)}</strong></span>
      <span>\u76EE\u524D <strong>${r(pe)}</strong></span>
    </div>
    <div class="index-wf-chart">
      <div class="rag-wf-axis">
        <span>0 ms</span>
        <span>${ge>0?r(Gs(ge)):"\u2014"}</span>
      </div>
      <div class="rag-wf-stages">${B}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7684\u7D50\u675F\u5373\u4E0B\u4E00\u968E\u6BB5\u7684\u958B\u59CB\uFF1B\u5DF2\u5B8C\u6210\u968E\u6BB5\u586B\u6EFF\u984F\u8272\uFF0C\u9032\u884C\u4E2D\u6216\u672A\u5B8C\u6210\u968E\u6BB5\u53EA\u8457\u8272\u5DF2\u5B8C\u6210\u6BD4\u4F8B\uFF0C\u5176\u9918\u4EE5\u540C\u8272\u7A7A\u5FC3\u6846\u8868\u793A\uFF0C\u7B49\u5F85\u8207\u7565\u904E\u968E\u6BB5\u4E0D\u7E6A\u88FD bar\u3002\u6975\u77ED\u968E\u6BB5\u6703\u4EE5\u6700\u5C0F\u53EF\u898B\u5BEC\u5EA6\u5448\u73FE\u3002\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u9032\u5EA6\u8207\u8A73\u7D30\u6578\u64DA\u3002</p>
    </div>
    <div class="index-wf-overall">
      <div class="index-wf-overall-head">
        <span>\u6574\u9AD4\u9032\u5EA6</span>
        <span class="mono">${he}</span>
      </div>
      <div class="index-wf-overall-track">
        <span style="width:${Math.max(0,Math.min(100,we)).toFixed(1)}%"></span>
      </div>
    </div>
  </section>`}function dd(e){if(e.id==="index_versions")return cd(e);let t=e.progress||{},s=Array.isArray(t.stages)?t.stages:[];if(!s.length)return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
      <div class="side-card-head">
        <span class="side-card-title">${f("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C\u6B64\u6D41\u7A0B\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A\u5404\u968E\u6BB5\u8207\u6574\u9AD4\u9032\u5EA6\u3002</div>
    </section>`;let a=Date.now(),n=s.map(I=>{let we=String(I.status||"idle");return{...I,status:we,computedDuration:id(I,a),drawable:!["pending","skipped","idle"].includes(we)}}),i=n.filter(I=>I.status!=="skipped"),o=n.filter(I=>I.drawable).reduce((I,we)=>I+we.computedDuration,0),l=Math.max(o,Number(t.duration_ms)||0,1),u=n.some(I=>I.computedDuration>0),c=1.25,m=n.map(I=>I.drawable?Math.max(I.computedDuration/l*100,c):0),$=m.reduce((I,we)=>I+we,0),b=$>100?100/$:1,p=0,g=n.map((I,we)=>{let G=m[we]*b,he=I.drawable?{start:p,width:G}:null;return he&&(p+=G),{...I,bar:he}}),y=n.filter(I=>["success","no_change"].includes(I.status)).length,_=n.find(I=>I.status==="running"),q=n.filter(I=>I.status==="running").length,M=n.filter(I=>["pending","idle"].includes(I.status)).length,A=n.filter(I=>I.status==="skipped").length,U=i.length||Number(t.total_stages)||0,V=t.overall_percent,J=V==null||V===""?null:Number(V),ke=Number.isFinite(J)?ft(J):"\u2014",Se=u?Gs(l):"\u2014",F=String(t.run_status||""),T=F?ds(F).label:"\u2014",S=_&&(_.label||_.key)||"\u2014",E=n.map(I=>Date.parse(I.started_at||"")).filter(I=>Number.isFinite(I)),se=n.map(I=>Date.parse(I.finished_at||"")).filter(I=>Number.isFinite(I)),le=E.length?new Date(Math.min(...E)).toISOString():null,Q=_?null:se.length?new Date(Math.max(...se)).toISOString():null,pe=g.map((I,we)=>{let G=I.status,he=["failed","stale","interrupted"].includes(G),Te=[`is-${G}`,he?"is-error":"",["pending","skipped","idle"].includes(G)?"is-missing":"",G==="running"?"is-running":""].filter(Boolean).join(" "),ne=I.drawable?Gs(I.computedDuration):"\u2014",me=ds(G).label,ge=G==="failed"?`\u539F\u56E0\uFF1A${String(I.error||I.message||"\u968E\u6BB5\u57F7\u884C\u5931\u6557\u3002").trim()}
\u5EFA\u8B70\uFF1A${String(I.resolution||"\u67E5\u770B .run \u76EE\u9304\u4E2D\u7684\u6700\u65B0\u65E5\u8A8C\u53D6\u5F97\u5B8C\u6574 traceback\uFF0C\u4FEE\u6B63\u5F8C\u91CD\u65B0\u57F7\u884C\u6B64\u6D41\u7A0B\u3002").trim()}`:"",Le=ge?`<span class="badge badge-danger is-failure-tip" tabindex="0" aria-label="${r(ge)}" data-failure-tip="${r(ge)}"><span class="status-dot is-danger"></span>\u5931\u6557</span>`:r(me),be=Mi(I),Ee=he?"var(--danger)":be,Fe=G==="running"?` \xB7 ${ft(I.percent)}`:"",et="";if(I.bar){let H=Math.max(0,Math.min(100,I.bar.start)),Oe=Math.max(0,Math.min(100-H,I.bar.width)),Ce=["success","no_change"].includes(G)?100:Math.max(0,Math.min(100,Number(I.percent)||0)),Pe=Oe*Ce/100,st=Oe-Pe;Pe>0&&(et+=`<span class="rag-wf-bar workflow-wf-bar is-sequential" style="left:${H.toFixed(3)}%;width:${Pe.toFixed(4)}%;top:0;height:12px;--bar-color:${r(Ee)}" aria-hidden="true"></span>`),st>1e-4&&(et+=`<span class="rag-wf-bar workflow-wf-bar is-hollow is-sequential" style="left:${(H+Pe).toFixed(3)}%;width:${st.toFixed(4)}%;top:0;height:12px;--bar-color:${r(Ee)}" aria-hidden="true"></span>`)}let P=I.label||I.key||"\u968E\u6BB5",B=od(I),w=`${P}\uFF1A${me}\uFF0C${G==="running"?`\u9032\u5EA6 ${ft(I.percent)}\uFF0C`:""}\u8017\u6642 ${ne}`,j={...I,duration_ms:I.computedDuration,message:ge||I.message||B||""},W=`${e.id}:${I.key||we}`;return`<details class="rag-wf-stage workflow-wf-stage ${Te}" data-workflow-wf-stage="${r(W)}"${jn.has(W)?" open":""} style="--stage-color:${r(be)}" ${Ii(j)}>
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="workflow-wf-step">${String(we+1).padStart(2,"0")}</span> ${r(P)}</strong>${B?`<small>${r(B)}</small>`:""}</span>
            </span>
            <span class="rag-wf-stage-meta">${r(ne)}${r(Fe)} \xB7 ${Le} <span class="rag-wf-chevron">${f("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px" role="img" aria-label="${r(w)}">${et}</span>
        </summary>
        <div class="rag-wf-details">${ld(I,ne)}</div>
      </details>`}).join(""),ye=Tc[e.id]||"";return`<section class="report-card processing-card processing-workflow-progress-card workflow-wf-card" data-workflow-progress>
    <div class="side-card-head index-runtime-head workflow-wf-head">
      <span class="side-card-title">${f("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
      <div class="index-runtime-metrics workflow-wf-metrics">
        <span class="index-runtime-metric" title="\u5DF2\u5B8C\u6210\u5168\u90E8\u968E\u6BB5\u7684\u6578\u91CF\u3002"><span>\u5B8C\u6210\u968E\u6BB5</span><strong>${y} / ${U}</strong></span>
        <span class="index-runtime-metric" title="\u76EE\u524D\u57F7\u884C\u4E2D\u7684\u968E\u6BB5\u6578\u91CF\u3002"><span>\u57F7\u884C\u4E2D</span><strong>${q}</strong></span>
        <span class="index-runtime-metric" title="\u5C1A\u672A\u958B\u59CB\u7684\u968E\u6BB5\u6578\u91CF\u3002"><span>\u7B49\u5F85</span><strong>${M}</strong></span>
        <span class="index-runtime-metric" title="\u672C\u6B21\u6D41\u7A0B\u4E0D\u9700\u8981\u57F7\u884C\u7684\u968E\u6BB5\u6578\u91CF\u3002"><span>\u7565\u904E</span><strong>${A}</strong></span>
        <span class="index-runtime-metric" title="\u5404\u968E\u6BB5\u8017\u6642\u5408\u8A08\u3002"><span>\u7E3D\u8017\u6642</span><strong>${r(Se)}</strong></span>
        <span class="index-runtime-metric" title="\u5404\u53C3\u8207\u968E\u6BB5\u5B8C\u6210\u6BD4\u4F8B\u7684\u5E73\u5747\u3002"><span>\u6574\u9AD4\u9032\u5EA6</span><strong>${ke}</strong></span>
      </div>
    </div>
    <div class="workflow-wf-summary">
      <span>\u57F7\u884C <strong>${r(T)}</strong></span>
      <span>\u958B\u59CB <strong>${le?r($e(le)):"\u2014"}</strong></span>
      <span>\u7D50\u675F <strong>${_?"\u9032\u884C\u4E2D":Q?r($e(Q)):"\u2014"}</strong></span>
      <span>\u76EE\u524D <strong>${r(S)}</strong></span>
      <span>Run <strong class="mono">${r(t.run_id||"\u2014")}</strong></span>
    </div>
    <div class="workflow-wf-chart">
      <div class="rag-wf-axis">
        <span>0 ms</span>
        <span>${r(Se)}</span>
      </div>
      <div class="rag-wf-legend workflow-wf-legend" aria-label="\u968E\u6BB5\u72C0\u614B\u5716\u4F8B">
        <span><i class="is-solid-state"></i>\u5B8C\u6210</span>
        <span><i class="is-hollow-state"></i>\u672A\u5B8C\u6210</span>
        <span><i class="is-progress-state"></i>\u57F7\u884C\u4E2D\uFF08\u9032\u5EA6\u689D\uFF09</span>
        <span><i class="is-empty-state"></i>\u7B49\u5F85\uFF0F\u7565\u904E</span>
      </div>
      <div class="rag-wf-stages">${pe}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7684\u7D50\u675F\u5373\u4E0B\u4E00\u968E\u6BB5\u7684\u958B\u59CB\uFF1B\u5DF2\u5B8C\u6210\u968E\u6BB5\u586B\u6EFF\u984F\u8272\uFF0C\u57F7\u884C\u4E2D\u6216\u672A\u5B8C\u6210\u968E\u6BB5\u53EA\u8457\u8272\u5DF2\u5B8C\u6210\u6BD4\u4F8B\uFF0C\u5176\u9918\u4EE5\u540C\u8272\u7A7A\u5FC3\u6846\u8868\u793A\uFF0C\u7B49\u5F85\u8207\u7565\u904E\u968E\u6BB5\u4E0D\u7E6A\u88FD bar\u3002\u6975\u77ED\u968E\u6BB5\u6703\u4EE5\u6700\u5C0F\u53EF\u898B\u5BEC\u5EA6\u5448\u73FE\u3002\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u9032\u5EA6\u8207\u8A73\u7D30\u6578\u64DA\u3002</p>
    </div>
    <div class="workflow-wf-overall">
      <div class="workflow-wf-overall-head">
        <span>\u6574\u9AD4\u9032\u5EA6</span>
        <span class="mono">${ke}</span>
      </div>
      <div class="workflow-wf-overall-track">
        <span style="width:${Math.max(0,Math.min(100,Number.isFinite(J)?J:0)).toFixed(1)}%"></span>
      </div>
    </div>
    ${ye?`<p class="processing-workflow-scope-note">${f("info",12)}<span>${r(ye)}</span></p>`:""}
  </section>`}function Ma(e){let t=String(e||"");return t.length===6?`${t.slice(0,4)}-${t.slice(4)}`:t||"\u2014"}function ud(e,t){let s={primary:"\u4E3B\u8981",fallback:"\u5099\u63F4",provided:"\u5916\u90E8"},a=Array.isArray(e.models)?e.models:[],n=a.length?a.join("\u3001"):"\u2014";return`<div class="index-host-row${e.url&&e.url===t?" is-selected":""}">
    <div class="index-host-head">
      <span class="badge badge-neutral">${r(s[e.role]||e.role||"\u4E3B\u6A5F")}</span>
      <strong class="mono">${r(e.host||"\u2014")}:${r(e.port??"\u2014")}</strong>
      ${wt(e.status||"unavailable")}
      <span class="index-host-model">${r(e.model||"\u2014")}</span>
    </div>
    <div class="index-host-url mono">${r(e.url||"\u2014")}</div>
    <div class="index-host-models" title="${r(n)}">\u6A21\u578B\uFF1A${r(n)}</div>
    ${e.detail?`<div class="index-host-detail">${r(e.detail)}</div>`:""}
  </div>`}function pd(e){let t=Array.isArray(e.months)?e.months:[],s=new Map;for(let n of t){let i=String(n.month||"");if(!/^\d{6}$/.test(i))continue;let o=s.get(i);o||(o={total:0,processed:0},s.set(i,o)),o.total+=Number(n.total)||0,o.processed+=Number(n.processed)||0}let a=0;for(let n of s.values())n.total>0&&n.processed>=n.total&&(a+=1);return{completed:a,total:s.size}}function md(e){let t=Array.isArray(e.months)?e.months:[],s=e.current||{},a=e.active_coverage||{},n=new Map;for(let u of t){let c=String(u.month||"");if(!/^\d{6}$/.test(c))continue;let m=Number(c.slice(4,6));if(m<1||m>12)continue;let $=n.get(c);$||($={key:c,year:c.slice(0,4),monthNo:m,total:0,processed:0,activeTotal:0,activeProcessed:0,reused:0,embedded:0,archives:[],current:!1,preparing:!1,jid:""},n.set(c,$)),$.total+=Number(u.total)||0,$.processed+=Number(u.processed)||0;let b=a[c]||{};$.activeTotal=Math.max($.activeTotal,Number(b.total)||0),$.activeProcessed=Math.max($.activeProcessed,Number(b.processed)||0),$.reused+=Number(u.reused)||0,$.embedded+=Number(u.embedded)||0,u.archive&&$.archives.push(String(u.archive)),s.month===c&&(!s.archive||s.archive===u.archive)&&($.current=!0,$.preparing=!!s.preparing,$.jid=String(s.jid||""))}if(!n.size)return'<div class="processing-workflow-empty">\u5C1A\u7121\u53EF\u986F\u793A\u7684\u7D22\u5F15\u6708\u4EFD\uFF1B\u958B\u59CB\u7D22\u5F15\u5F8C\u6703\u4F9D\u6642\u9593\u5217\u51FA\u6708\u4EFD\u72C0\u614B\u3002</div>';let i={active:0,reuseComplete:0,reuseIncomplete:0,embedComplete:0,embedIncomplete:0};for(let u of n.values()){let c=u.total>0&&u.processed>=u.total,m=u.activeTotal>0&&u.activeProcessed>=u.activeTotal,$=u.embedded>0?"embed":u.reused>0||m?"reuse":"embed";u.kind=$,u.currentComplete=c,u.status=c?"green":u.processed>0?"red":m?"green":"gray",$==="reuse"?c?i.reuseComplete+=1:i.reuseIncomplete+=1:c?i.embedComplete+=1:i.embedIncomplete+=1,m&&(i.active+=1)}let l=[...new Set([...n.values()].map(u=>u.year))].sort((u,c)=>c.localeCompare(u)).map(u=>{let c=Array.from({length:12},(m,$)=>{let b=$+1,p=`${u}${String(b).padStart(2,"0")}`,g=n.get(p);if(!g)return`<td class="judgment-month is-empty"><span>${b}</span></td>`;let y=g.total?`${Math.min(100,Math.round(g.processed/g.total*1e3)/10)}%`:"\u2014",_=g.current&&e.run_status==="running",q=[`${g.year}-${String(g.monthNo).padStart(2,"0")}`,g.archives.join("\u3001")||"\u2014",`\u65B0\u7248\u672C ${d(g.processed)} / ${d(g.total)}\uFF08${y}\uFF09`,g.activeTotal>0?`active ${d(g.activeProcessed)} / ${d(g.activeTotal)}\uFF08${(100*g.activeProcessed/g.activeTotal).toFixed(1)}%\uFF09`:"",`\u91CD\u7528 ${d(g.reused)} \xB7 \u65B0 embedding ${d(g.embedded)}`,g.currentComplete?"":g.kind==="reuse"?"\u5F85\u5B8C\u6210\uFF1AR \u65E2\u6709\u5411\u91CF\u91CD\u7528":"\u5F85\u5B8C\u6210\uFF1AE \u65B0 embedding",g.current?`${_?g.preparing?"\u6E96\u5099\u7D22\u5F15":"\u76EE\u524D\u7D22\u5F15":"\u6700\u5F8C\u7D22\u5F15"}${g.jid?` \xB7 ${g.jid}`:""}`:""].filter(Boolean).join(" \xB7 "),M=g.activeTotal>0?Math.min(100,100*g.activeProcessed/g.activeTotal):0,A=g.total>0?Math.min(100,100*g.reused/g.total):0,U=g.total>0?Math.min(100,100*g.embedded/g.total):0,V=g.kind==="reuse"&&!g.currentComplete,J=g.kind==="embed"&&!g.currentComplete;return`<td class="judgment-month index-month index-month-are is-${g.status}${_?" is-active":""}" title="${r(q)}"${_?' aria-current="true"':""}><span class="index-month-number">${b}</span><span class="index-month-blocks" aria-hidden="true"><span class="index-month-block is-active" style="--fill:${M.toFixed(1)}%"></span><span class="index-month-block is-reuse${V?" is-incomplete":""}" style="--fill:${A.toFixed(1)}%"></span><span class="index-month-block is-embed${J?" is-incomplete":""}" style="--fill:${U.toFixed(1)}%"></span></span></td>`}).join("");return`<tr><th scope="row">${r(u)}</th>${c}</tr>`}).join("");return`<div class="judgment-months index-months">
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
      <span><i class="is-current"></i>\u76EE\u524D\u7D22\u5F15\u6708\u4EFD \xB7 \u4EE5\u5916\u6846\u6A19\u793A\uFF0Cpadding \u4E0D\u4F7F\u7528\u5E95\u8272</span>
    </div>
    <div class="judgment-months-scroll">
      <table class="judgment-months-table index-months-table">
        <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(u,c)=>`<th scope="col">${c+1}</th>`).join("")}</tr></thead>
        <tbody>${l}</tbody>
      </table>
    </div>
    <p class="judgment-months-hint">\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\u70BA A\uFF08\u4E0A\u4E00\u500B\u6B63\u5F0F\u7248\u672C\u65E2\u6709\u8986\u84CB\uFF09\u3001R\uFF08\u91CD\u7528\u5411\u91CF\uFF09\u3001E\uFF08\u65B0 embedding\uFF09\u3002A \u4E0D\u5217\u5165\u65B0\u7248\u672C\u5B8C\u6210\u6578\uFF0CR\uFF0FE \u624D\u662F\u672C\u6B21\u5EFA\u7F6E\u9032\u5EA6\uFF1B\u586B\u6EFF\u8868\u793A\u5B8C\u6210\uFF0C\u7A7A\u5FC3\u6846\u8868\u793A\u8A72\u6708 R\uFF0FE \u5C1A\u672A\u5B8C\u6210\u3002\u7DA0\u8272\uFF1A\u65B0\u7248\u672C\u5B8C\u6210\u6216 active \u57FA\u7DDA\uFF1B\u7070\u8272\uFF1A\u5C1A\u672A\u958B\u59CB\uFF1B\u76EE\u524D\u7D22\u5F15\u6708\u4EFD\u4EE5\u5916\u6846\u6A19\u793A\uFF0Cpadding \u4E0D\u4F7F\u7528\u5E95\u8272\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u65B0\u7248\u672C\u8207 active \u7B46\u6578\u3001\u4F86\u6E90\u6A94\u6848\u8207\u76EE\u524D\u6848\u865F\u3002</p>
  </div>`}function gd(e){let t=e.import_timeline||{},s=Array.isArray(t.months)?t.months:[];if(!s.length)return`<section class="report-card processing-card import-files-card">
      <div class="side-card-head">
        <span class="side-card-title">${f("table",14)}\u532F\u5165\u6A94\u6848\u6642\u9593\u8868</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u5C1A\u672A\u53D6\u5F97\u5224\u6C7A\u4E0B\u8F09 manifest \u6216\u672C\u6A5F\u58D3\u7E2E\u6A94\uFF1B\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u5F8C\u6703\u986F\u793A\u6708\u4EFD\u72C0\u614B\u3002</div>
    </section>`;let a=new Map(s.map(b=>[String(b.month),b])),n=[...new Set(s.map(b=>b.year))].sort((b,p)=>p-b),i=["extract","raw_parquet","filter","postgres"],o=t.stage_labels||{},l=n.map(b=>{let p=Array.from({length:12},(g,y)=>{let _=y+1,q=`${b}${String(_).padStart(2,"0")}`,M=a.get(q);return En({month:M,year:b,monthNo:_,stageOrder:i,stageLabels:o,stageStatuses:M?.import_stages||{},overall:M?.import_overall||"empty",active:!!M?.active,workflowForStage:()=>"judgment_import",variant:"import"})}).join("");return`<tr><th scope="row">${r(b)}</th>${p}</tr>`}).join(""),u=t.summary||{},c=t.stage_summary||{},m=s.find(b=>b.active),$=m?`<div class="index-current-row">${ji({activeMonth:t.active_month||String(m.month||""),activeArchive:t.active_archive||m.active_archive||"",activePhase:t.active_phase||"",processingMonth:t.processing_month||"",processingArchive:t.processing_archive||"",stageLabels:o})}</div>`:"";return`<section class="report-card processing-card import-files-card" data-import-timeline="judgment">
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${f("table",14)}\u532F\u5165\u6A94\u6848\u6642\u9593\u8868</span>
      ${Dc(t,s,c,u)}
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
        <span><i class="processing-timeline-swatch is-hollow-state"></i>\u672A\u5B8C\u6210</span>
        <span><i class="processing-timeline-swatch is-progress-state"></i>\u57F7\u884C\u4E2D\uFF08\u9032\u5EA6\u689D\uFF09</span>
        <span><i class="processing-timeline-swatch is-empty"></i>\u7121\u8CC7\u6599</span>
      </div>
      <div class="judgment-months-scroll">
        <table class="judgment-months-table import-months-table index-months-table processing-months-table">
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(b,p)=>`<th scope="col">${p+1}</th>`).join("")}</tr></thead>
          <tbody>${l}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\uFF1ARAR \u6AA2\u67E5\uFF0F\u89E3\u58D3\u7E2E\u3001\u539F\u59CB\u8CC7\u6599\u6AA2\u67E5\uFF0FParquet \u5099\u4EFD\u3001\u91D1\u878D\u6CD5\u898F\u7BE9\u9078\u3001PostgreSQL metadata\u3002\u5BE6\u5FC3\u65B9\u584A\u8868\u793A\u5B8C\u6210\uFF1B\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u5C1A\u672A\u5B8C\u6210\uFF1B\u57F7\u884C\u4E2D\u7684\u65B9\u584A\u4EE5\u6DE1\u8272\u5782\u76F4\u9032\u5EA6\u689D\u8868\u793A\uFF1B\u6DE1\u8272\u7A7A\u5FC3\u65B9\u584A\u8868\u793A\u7121\u8CC7\u6599\u3002\u539F\u59CB\u8CC7\u6599\u968E\u6BB5\u6703\u5148\u6AA2\u67E5\u65E2\u6709 Parquet\uFF0C\u53EF\u6CBF\u7528\u6642\u4E0D\u91CD\u65B0\u5099\u4EFD\uFF1B\u7F3A\u5C11\u6642\u6703\u986F\u793A\u300C\u5EFA\u7ACB YYYY-MM \u5099\u4EFD\u300D\uFF0C\u5B8C\u6210\u5F8C\u986F\u793A\u300C\u5DF2\u5EFA\u7ACB\u5099\u4EFD\u300D\u3002\u7BE9\u9078\u8207 PostgreSQL \u968E\u6BB5\u6703\u986F\u793A\u76EE\u524D\u8655\u7406\u7684\u6708\u4EFD\u8207 archive\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u56DB\u500B\u968E\u6BB5\u7684\u72C0\u614B\u3001\u672C\u6A5F\u58D3\u7E2E\u6A94\u8207\u5DF2\u532F\u5165\u6A94\u540D\u3002</p>
    </div>
  </section>`}function fd(e,t,s){let n=[t.run_id||e.active_run?.id||e.last_run?.id||"",t.version_id??"",t.collection||"",t.started_at||""].join("|"),i=Date.now(),o=$i.get(n);if(!o){let b=Date.parse(t.started_at||""),p=Date.parse(t.finished_at||""),g=Date.parse(t.updated_at||"");t.run_status!=="running"&&Number.isFinite(b)&&(Number.isFinite(p)||Number.isFinite(g))?o={at:b,indexed:0}:o={at:i,indexed:Math.max(0,s)},$i.set(n,o)}let l=Date.parse(t.finished_at||""),u=Date.parse(t.updated_at||""),c=t.run_status==="running"?i:Number.isFinite(l)?l:Number.isFinite(u)?u:i,m=Math.max(0,(c-Number(o.at||0))/1e3),$=Math.max(0,Number(s)-Number(o.indexed||0));return m<=0||$<=0?0:$/m}function Gs(e){let t=Number(e);return!Number.isFinite(t)||t<0?"\u2014":t>=36e5?Oi(t):fe(t)}function Oi(e){if(!Number.isFinite(e)||e<0)return"\u2014";let t=Math.max(0,Math.round(e/1e3)),s=Math.floor(t/3600),a=Math.floor(t%3600/60),n=t%60,i=String(n).padStart(2,"0");return s>0?`${s}h ${String(a).padStart(2,"0")}m ${i}s`:a>0?`${a}m ${i}s`:`${n}s`}function bd(e,t,s,a){let n=Date.parse(e.started_at||"");if(!Number.isFinite(n))return{elapsedMs:null,estimatedTotalMs:null,remainingMs:null,remainingCount:null};let i=e.run_status==="running",o=Date.parse(e.finished_at||""),l=Date.parse(e.updated_at||""),u=i?Date.now():Number.isFinite(o)?o:Number.isFinite(l)?l:Date.now(),c=Math.max(0,u-n),m=Number(s),$=Number(t);if(!Number.isFinite(m)||m<=0)return{elapsedMs:c,estimatedTotalMs:null,remainingMs:null,remainingCount:null};let b=Math.max(0,m-Math.max(0,Number.isFinite($)?$:0));if(b<=0)return{elapsedMs:c,estimatedTotalMs:c,remainingMs:0,remainingCount:0};if(!i||a<=0)return{elapsedMs:c,estimatedTotalMs:null,remainingMs:null,remainingCount:b};let p=b/a*1e3;return{elapsedMs:c,estimatedTotalMs:c+p,remainingMs:p,remainingCount:b}}function vd(e){let t=e.index_runtime||{};if(!t.available)return`<section class="report-card processing-card index-runtime-card">
      <div class="side-card-head">
        <span class="side-card-title">${f("cloud",14)}Ollama \u9023\u7DDA\u6E2C\u8A66</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A\u6E2C\u8A66\u7684\u4E3B\u6A5F\u3001\u6A21\u578B\u8207\u9078\u7528\u7D50\u679C\u3002</div>
    </section>`;let s=!!t.coverage_only,a=t.embedding||{},n=Array.isArray(a.hosts)?a.hosts:[],i=a.selected||{},o=a.active||{},l=t.current||{},u=t.summary||{},c=Number(u.indexed??l.indexed??0),m=s?0:fd(e,t,c),$=pd(t),b=s?null:bd(t,c,u.total,m),p=b?.remainingCount>0?`\u8207\u5269\u9918 ${d(b.remainingCount)} \u7B46`:"",g=m>0?`\u4F9D\u672C\u6B21\u5E73\u5747 ${m.toFixed(1)} \u7B46/\u79D2${p}\u4F30\u7B97\uFF1B\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002\u5BE6\u969B\u901F\u5EA6\u6703\u96A8 embedding \u8207\u6279\u6B21\u5927\u5C0F\u8B8A\u52D5\u3002`:"\u5C1A\u7121\u8DB3\u5920\u7684\u672C\u9801\u89C0\u5BDF\u8CC7\u6599\u53EF\u4F30\u7B97\uFF1B\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002",y=J=>r(Oi(b?b[J]:null)),_=`<div class="index-runtime-metrics">
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
      <strong>${m>0?`${m.toFixed(1)} \u7B46/\u79D2`:"\u2014"}</strong>
    </span>
    <span class="index-runtime-metric" title="\u81EA\u672C\u6B21\u7D22\u5F15 run \u958B\u59CB\u6642\u9593 ${r($e(t.started_at))} \u8D77\u7B97\uFF1B\u4E2D\u9014\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u91CD\u65B0\u8A08\u6642\u3002">
      <span>Elapsed Time</span>
      <strong>${y("elapsedMs")}</strong>
    </span>
    <span class="index-runtime-metric" title="Elapsed Time \u52A0\u4E0A\u4F9D\u5269\u9918\u4EF6\u6578\u8207\u672C\u6B21\u5E73\u5747\u901F\u5EA6\u4F30\u7B97\u7684\u5269\u9918\u6642\u9593\uFF1B\u505C\u6B62\u5F8C\u91CD\u65B0\u57F7\u884C\u6703\u5F9E 0 \u91CD\u65B0\u8A08\u6642\u3002">
      <span>Estimated Total</span>
      <strong>${y("estimatedTotalMs")}</strong>
    </span>
    <span class="index-runtime-metric" title="${r(g)}">
      <span>Time Remaining</span>
      <strong>${y("remainingMs")}</strong>
    </span>
  </div>`,q=i.url||"",M=o.url||"",A=n.map(J=>ud(J,q)).join(""),U=t.run_status==="running"?l.preparing?"\u6E96\u5099\u4E2D":"\u76EE\u524D\u8655\u7406":"\u6700\u5F8C\u8655\u7406",V=l.jid?`<div class="index-current-row">
        <span class="badge badge-info">${f("activity",11)}${U}</span>
        <strong class="mono">${r(Ma(l.month))}</strong>
        <span class="mono">${r(l.archive||"\u2014")}</span>
        <span class="mono">${r(l.jid||"\u2014")}</span>
        <span class="index-current-copy">${r([l.court,l.title].filter(Boolean).join(" \xB7 ")||"\u2014")}</span>
        <span class="faint">${l.preparing?"\u6E96\u5099\u4E2D":`\u6279\u6B21 ${d(l.batch_size)} \u7B46`}</span>
      </div>`:"";return`<section class="report-card processing-card index-runtime-card"${s?" hidden":""}>
    <div class="side-card-head">
      <span class="side-card-title">${f("cloud",14)}Ollama \u9023\u7DDA\u6E2C\u8A66</span>
      ${wt(a.status||"idle")}
    </div>
    ${t.error?`<div class="processing-update-notice index-runtime-error">${f("alert",13)}<span>${r(t.error)}</span></div>`:""}
    <div class="index-selected-host">
      <span class="faint">\u6700\u5F8C\u9078\u7528</span>
      <strong class="mono">${r(i.url||"\u2014")}</strong>
      <span>${r(i.model||a.model||"\u2014")}</span>
      <span class="mono">port ${r(i.port??"\u2014")}</span>
      ${M&&M!==q?`<span class="badge badge-warn">\u76EE\u524D\u4F7F\u7528 ${r(M)}</span>`:""}
      ${o.using_fallback?'<span class="badge badge-warn">\u5DF2\u5207\u63DB\u5099\u63F4</span>':""}
    </div>
    <div class="index-host-list">${A||'<div class="processing-workflow-empty">\u6C92\u6709\u53EF\u986F\u793A\u7684\u4E3B\u6A5F\u6E2C\u8A66\u7D50\u679C\u3002</div>'}</div>
    ${a.tested_at?`<div class="index-runtime-foot">\u6E2C\u8A66\u6642\u9593 ${r($e(a.tested_at))}</div>`:""}
  </section>
  <section class="report-card processing-card index-files-card">
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${f("table",14)}\u7D22\u5F15\u6A94\u6848\u6642\u9593\u8868</span>
      ${_}
    </div>
    <div class="index-runtime-summary">
      <span>\u7248\u672C <strong class="mono">v${r(t.version_id??"\u2014")}</strong></span>
      <span>Collection <code>${r(t.collection||"\u2014")}</code></span>
      <span>\u6A21\u5F0F <strong>${r(t.build_mode||"\u2014")}</strong></span>
      ${s?"":`<span>\u91CD\u7528 <strong class="mono">${d(u.reused)}</strong></span>
            <span>\u65B0 embedding <strong class="mono">${d(u.embedded)}</strong></span>`}
    </div>
    ${V}
    ${md(t)}
    ${s?'<p class="judgment-months-hint index-coverage-note">\u76EE\u524D\u986F\u793A active collection \u7684\u6708\u4EFD\u7D22\u5F15\u8986\u84CB\uFF1B\u57F7\u884C Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u5F8C\u6703\u986F\u793A\u672C\u6B21 Ollama \u6E2C\u8A66\u8207\u5373\u6642\u9032\u5EA6\u3002</p>':""}
  </section>`}function hd(e={}){let{storage:t,loading:s,error:a}=e;if(a)return`<section class="report-card processing-card index-storage-card">
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
    </section>`;let n=t.qdrant_storage||{},o=(Array.isArray(t.databases)?t.databases:[]).find(m=>m.id==="qdrant")||{},l=n.volume_bytes??o.volume_bytes??null,u=n.points_count??o.points_count,c=n.segments_count??o.segments_count;return`<section class="report-card processing-card index-storage-card">
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
      <span>Volume \u5BB9\u91CF</span><strong class="mono">${Ie(l)}${n.volume_size?` \xB7 ${r(n.volume_size)}`:""}</strong>
      <span>Volume \u4F86\u6E90\u8DEF\u5F91</span><strong class="mono index-storage-path">${r(n.host_path||"\u2014")}</strong>
      <span>Collection</span><strong class="mono">${r(n.collection||o.collection||"\u2014")}</strong>
      <span>Alias</span><strong class="mono">${r(n.alias||"\u2014")}</strong>
      <span>Points\uFF0FSegments</span><strong class="mono">${d(u)} / ${d(c)}</strong>
    </div>
    <div class="index-runtime-foot">\u8CC7\u6599\u6642\u9593 ${r($e(t.checked_at))}</div>
  </section>`}function Cn({badge:e="",lead:t="",rows:s=[],note:a=""}){return`<section class="report-card processing-card parquet-help-card workflow-help-card">
    <div class="side-card-head">
      <span class="side-card-title">${f("info",14)}\u529F\u80FD\u8AAA\u660E</span>
      ${e?`<span class="badge badge-neutral">${r(e)}</span>`:""}
    </div>
    <div class="parquet-help-body">
      <p class="parquet-help-lead">${t}</p>
      <div class="parquet-help-grid">${s.map(([n,i])=>`<span>${r(n)}</span><strong>${i}</strong>`).join("")}</div>
      ${a?`<p class="parquet-help-note">${a}</p>`:""}
    </div>
  </section>`}function $d(){return Cn({badge:"\u552F\u8B80\u532F\u51FA",lead:"\u5C07 PostgreSQL \u76EE\u524D\u6709\u6548\u7684\u5224\u6C7A\uFF08<code>judgment_documents.is_current = true</code>\uFF09\u532F\u51FA\u6210\u7368\u7ACB\u7684 Parquet \u5FEB\u7167\uFF0C\u4F9B\u96E2\u7DDA\u5206\u6790\u3001\u8CC7\u6599\u4EA4\u63DB\u6216\u4FDD\u5B58\u3002",rows:[["\u4F86\u6E90","PostgreSQL <code>judgment_documents</code>\uFF0C\u53EA\u542B\u76EE\u524D\u6709\u6548\u4E14\u5DF2\u547D\u4E2D\u91D1\u878D\u6CD5\u898F\u6E05\u55AE\u7684\u5224\u6C7A\u3002"],["\u8F38\u51FA",'<span class="mono">JUDGMENT_DATA_DIR/parquet/judgments/YYYYMMDD/HHMMSS-xxxxxxxx/judgments.parquet</span>'],["\u9644\u5E36\u6A94",'<span class="mono">\u540C\u76EE\u9304 manifest.json\uFF08\u7B46\u6578\u3001\u6A94\u6848\u5927\u5C0F\u3001\u6B04\u4F4D\u3001\u7522\u751F\u6642\u9593\uFF09</span>'],["\u5167\u5BB9","\u6848\u865F\u3001\u6CD5\u9662\u3001\u6848\u7531\u3001\u5168\u6587\u3001\u547D\u4E2D\u6CD5\u898F\u3001\u5F15\u7528\u3001\u4F86\u6E90\u58D3\u7E2E\u6A94\u8207\u6642\u9593\u6B04\u4F4D\uFF1B<code>citations</code> \u4EE5 JSON \u5B57\u4E32\u4FDD\u5B58\u3002"],["\u8207\u539F\u59CB Parquet","\u8CC7\u6599\u9801\u8207 <code>source=parquet</code> \u4F7F\u7528 <code>parquet/raw_judgments/.../raw.parquet</code>\uFF1B\u672C\u6D41\u7A0B\u7684 <code>parquet/judgments/...</code> \u662F\u53E6\u4E00\u500B\u6B63\u898F\u5316\u5FEB\u7167\u3002"],["\u4E0D\u6703","\u4E0D\u5BEB\u56DE PostgreSQL\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u820A\u5FEB\u7167\uFF1B\u53EA\u532F\u51FA current \u8CC7\u6599\uFF0C\u4E0D\u542B\u6B77\u53F2\u7248\u672C\u3002"],["\u4E2D\u65B7","\u6BCF\u6B21\u57F7\u884C\u5EFA\u7ACB\u65B0\u7684\u5B8C\u6574\u5FEB\u7167\uFF1B\u4E2D\u65B7\u5F8C\u91CD\u65B0\u57F7\u884C\u4E0D\u6703\u7E8C\u5BEB\u540C\u4E00\u500B Parquet \u6A94\u3002"]],note:"\u9069\u5408 DuckDB\u3001pandas\u3001Spark \u7B49\u96E2\u7DDA\u5206\u6790\uFF0C\u6216\u9700\u8981\u56FA\u5B9A\u6642\u9593\u9EDE\u7684\u53EF\u91CD\u73FE\u8CC7\u6599\u5FEB\u7167\u3002\u65E5\u5E38 RAG \u67E5\u8A62\u8207\u8CC7\u6599\u9801\u700F\u89BD\u4E0D\u9700\u8981\u57F7\u884C\u6B64\u6D41\u7A0B\u3002"})}function yd(){return Cn({badge:"PostgreSQL \u56DE\u586B",lead:"\u5C07\u5224\u6C7A\u7684 <code>court</code> \u8F49\u6210\u6A19\u6E96\u6CD5\u9662\u540D\u7A31\u4E26\u5BEB\u5165 <code>court_normalized</code>\uFF1B\u539F\u59CB <code>court</code> \u6703\u4FDD\u7559\u4F9B\u8FFD\u6EAF\u3002",rows:[["\u8655\u7406\u7BC4\u570D","\u9810\u8A2D\u53EA\u8655\u7406 <code>court_normalized</code> \u70BA\u7A7A\u7684\u8CC7\u6599\uFF1B\u5DF2\u6B63\u898F\u5316\u8CC7\u6599\u6703\u8DF3\u904E\uFF0C\u53EF\u7528 <code>--all</code> \u91CD\u65B0\u8A08\u7B97\u5168\u90E8\u3002"],["\u89E3\u6790\u9806\u5E8F","\u539F\u59CB\u6CD5\u9662\u503C\u958B\u982D\u7B26\u5408\u6A19\u6E96\u540D\u7A31 \u2192 \u5224\u6C7A\u5168\u6587\u524D 8,000 \u5B57\u6700\u65E9\u51FA\u73FE\u7684\u6CD5\u9662 \u2192 \u539F\u59CB\u6CD5\u9662\u503C\u4EFB\u610F\u4F4D\u7F6E\u7684\u6A19\u6E96\u540D\u7A31 \u2192 JID \u5B98\u65B9\u6CD5\u9662\u4EE3\u78BC\u3002"],["\u8F38\u51FA","\u5BEB\u5165 <code>judgment_documents.court_normalized</code>\uFF1B\u4E0D\u4FEE\u6539\u539F\u59CB <code>court</code>\u3001\u5168\u6587\u6216\u5176\u4ED6\u5224\u6C7A\u6B04\u4F4D\u3002"],["\u672A\u89E3\u6790","\u7121\u6CD5\u5224\u65B7\u6642\u4FDD\u7559\u7A7A\u503C\uFF0C\u4E0D\u731C\u6E2C\uFF1B\u6458\u8981\u6703\u5217\u51FA\u672A\u89E3\u6790\u7B46\u6578\u8207\u5E38\u898B\u6A23\u672C\u3002"],["\u5F71\u97FF","\u8CC7\u6599\u9801\u7684\u6CD5\u9662\u4E0B\u62C9\u3001\u7CBE\u78BA\u7BE9\u9078\u3001\u6392\u5E8F\u3001\u7D50\u679C\u6B04\u4F4D\u8207\u5224\u6C7A\u539F\u6587\u4F7F\u7528\u6B63\u898F\u5316\u540D\u7A31\uFF1BAPI \u4ECD\u56DE\u50B3 <code>court_raw</code>\u3002"],["\u4E0D\u6703","\u4E0D\u91CD\u65B0\u532F\u5165\u5224\u6C7A\u3001\u4E0D\u6539\u5168\u6587\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u8CC7\u6599\u3002"],["\u91CD\u8DD1","\u9810\u8A2D\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u898F\u5247\u66F4\u65B0\u5F8C\u53EF\u7528 <code>--all</code> \u91CD\u7B97\uFF0C\u6216\u5148\u7528 <code>--dry-run</code> \u7D71\u8A08\u3002"]],note:"\u9069\u5408\u5728\u5224\u6C7A\u532F\u5165\u5F8C\u3001\u6CD5\u9662\u540D\u7A31\u898F\u5247\u66F4\u65B0\u5F8C\uFF0C\u6216\u8CC7\u6599\u9801\u6CD5\u9662\u9078\u9805\u51FA\u73FE\u7F3A\u6F0F\u6642\u57F7\u884C\u3002\u7D50\u679C\u4E5F\u6703\u5BEB\u5165\u6548\u80FD\u7D00\u9304\u3002"})}function wd(){return Cn({badge:"\u689D\u6587\u6B77\u53F2\u5EFA\u6A94",lead:"\u70BA\u65E2\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u5EFA\u7ACB <code>law_article_versions</code> \u6B77\u53F2\u689D\u6587\u5FEB\u7167\u8207 <code>law_article_change_events</code> \u8B8A\u66F4\u7D00\u9304\uFF0C\u8B93\u8CC7\u6599\u9801\u80FD\u5207\u63DB\u6B77\u53F2\u7248\u672C\u4E26\u67E5\u770B\u689D\u6587\u5DEE\u7570\u3002",rows:[["\u4F86\u6E90","PostgreSQL \u6CD5\u898F\u7248\u672C\uFF0C\u4EE5\u53CA <code>LAW_DATA_DIR/raw_parquet</code> \u5167\u5C0D\u61C9\u7684\u539F\u59CB\u6CD5\u898F Parquet \u5FEB\u7167\u3002"],["\u5339\u914D\u65B9\u5F0F","\u4EE5 raw Parquet manifest \u7684 <code>zip_sha256</code>\uFF0F<code>raw_json_sha256</code> \u5C0D\u61C9\u6CD5\u898F\u7248\u672C\uFF0C\u4E0D\u731C\u6E2C\u5167\u5BB9\u3002"],["\u7522\u751F\u5167\u5BB9","<code>article_key</code>\uFF08\u689D\u6587\u985E\u578B\uFF0B\u689D\u865F\uFF09\u3001<code>content_hash</code>\u3001\u689D\u6587\u5168\u6587\u8207\u751F\u6548\u65E5\uFF1B\u8207\u524D\u4E00\u7248\u672C\u6BD4\u8F03\u5F8C\u8A18\u9304 <code>added</code>\uFF0F<code>modified</code>\uFF0F<code>removed</code>\u3002"],["\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB","\u5206\u9801\u4E0A\u65B9\u7684\u552F\u8B80\u6AA2\u67E5\u6703\u8B80\u53D6 <code>law_article_versions</code> \u8207\u539F\u59CB Parquet\uFF0C\u5224\u65B7\u7248\u672C\u662F\u5426\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\uFF1B\u6AA2\u67E5\u672C\u8EAB\u4E0D\u6703\u4FEE\u6539\u8CC7\u6599\u5EAB\u3002"],["\u53EF\u5EFA\u7ACB","\u627E\u5230\u5C0D\u61C9\u539F\u59CB Parquet \u7684\u7248\u672C\uFF0C\u53EF\u76F4\u63A5\u57F7\u884C\u6B64\u6D41\u7A0B\u5EFA\u7ACB\u689D\u6587\u6B77\u53F2\u3002"],["\u7F3A\u539F\u59CB\u6A94","\u627E\u4E0D\u5230\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u6A19\u793A\u7121\u6CD5\u5EFA\u7ACB\uFF0C\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD\uFF1B\u6B64\u6D41\u7A0B\u6703\u8DF3\u904E\u4E26\u5217\u5728 <code>missing_versions</code>\u3002"],["\u6AA2\u67E5\u7D50\u679C","\u5E74\u4EFD\xD7\u6708\u4EFD\u8868\u986F\u793A\u5DF2\u5EFA\u7ACB\uFF0F\u672A\u5EFA\u7ACB\uFF0F\u90E8\u5206\u5EFA\u7ACB\uFF1B\u4E0B\u65B9\u5217\u51FA\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3001\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u7248\u672C\u65E5\u671F\u8207\u53EF\u5EFA\u7ACB\u72C0\u614B\u3002\u76EE\u524D\u72C0\u614B\u4EE5\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u5361\u7247\u5373\u6642\u986F\u793A\u3002"],["\u8DF3\u904E\u689D\u4EF6","\u5DF2\u6709\u689D\u6587\u5FEB\u7167\u7684\u7248\u672C\u6703\u8DF3\u904E\uFF1B\u627E\u4E0D\u5230\u53EF\u8B80\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u5217\u5165 <code>missing_versions</code>\uFF0C\u4E0D\u5EFA\u7ACB\u865B\u69CB\u689D\u6587\u3002"],["\u4E0D\u6703","\u4E0D\u4E0B\u8F09\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u4E0D\u89E3\u6790\u65B0 ZIP\u3001\u4E0D\u4FEE\u6539 <code>law_documents</code> \u6216\u76EE\u524D\u7248\u672C\u3001\u4E0D\u66F4\u65B0 Qdrant\uFF0FIndexedDB\u3002"],["\u8F38\u51FA\u6458\u8981","\u7248\u672C\u6578\u3001\u8DF3\u904E\u7248\u672C\u6578\u3001\u7F3A\u5C11\u5FEB\u7167\u7248\u672C\u3001\u5BEB\u5165\u689D\u6587\u6578\u8207\u689D\u6587\u8B8A\u66F4\u4E8B\u4EF6\u6578\u3002"],["\u91CD\u8DD1","\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u5DF2\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u4E0D\u6703\u91CD\u8907\u63D2\u5165\u3002"]],note:"\u9069\u5408\u5F9E\u820A\u7248 schema \u5347\u7D1A\u3001\u65E2\u6709\u6CD5\u898F\u7248\u672C\u7F3A\u5C11\u6B77\u53F2\u689D\u6587\uFF0C\u6216\u8CC7\u6599\u9801\u6B77\u53F2\u689D\u6587\u7248\u672C\u8207\u8B8A\u66F4\u7D00\u9304\u4E0D\u5B8C\u6574\u6642\u57F7\u884C\u3002\u57F7\u884C\u524D\u53EF\u5148\u7528\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u78BA\u8A8D\u54EA\u4E9B\u7248\u672C\u53EF\u5EFA\u7ACB\u3001\u54EA\u4E9B\u7F3A\u539F\u59CB\u6A94\u3002"})}function _d(e={}){let t=e.courtCheck,s=!!e.courtCheckLoading,a=e.courtCheckError,n=`<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-court-check"${s?" disabled":""}>${f("refresh",12)}<span>${s?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31"}</span></button>`;if(a)return`<section class="report-card processing-card court-check-card">
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
    </section>`;let u={green:"\u5DF2\u6AA2\u67E5",red:"\u9700\u6B63\u898F\u5316\uFF08\u5B8C\u5168\u672A\u6AA2\u67E5\uFF09",gray:"\u9700\u6B63\u898F\u5316"},c=new Map(i.map(b=>[String(b.month),b])),$=[...new Set(i.map(b=>b.year))].sort((b,p)=>p-b).map(b=>{let p=Array.from({length:12},(g,y)=>{let _=y+1,q=`${b}${String(_).padStart(2,"0")}`,M=c.get(q);if(!M)return`<td class="judgment-month is-empty"><span>${_}</span></td>`;let A=u[M.status]?M.status:"red",U=[`${b}-${String(_).padStart(2,"0")}`,u[A],`\u7E3D ${d(M.total)} \u7B46`,`\u5DF2\u6AA2\u67E5 ${d(M.checked)} \u7B46`,`\u672A\u6AA2\u67E5 ${d(M.unchecked)} \u7B46`,M.invalid?`\u7121\u6548\u503C ${d(M.invalid)} \u7B46`:"",`\u6709\u6548 ${ft(M.percent)}`].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month court-check-month is-${A==="gray"?"red":A}" title="${r(U)}"><span>${_}</span></td>`}).join("");return`<tr><th scope="row">${r(b)}</th>${p}</tr>`}).join("");return`<section class="report-card processing-card court-check-card">
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(b,p)=>`<th scope="col">${p+1}</th>`).join("")}</tr></thead>
          <tbody>${$}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u5168\u90E8\u5DF2\u6B63\u898F\u5316\uFF1B\u7D05\u8272\uFF1A\u9700\u6B63\u898F\u5316\uFF08\u542B\u5B8C\u5168\u672A\u6AA2\u67E5\u3001\u90E8\u5206\u672A\u6B63\u898F\u5316\u6216\u7121\u6548\u503C\uFF09\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u8CC7\u6599\u3002summary \u7684\u7D05\u8272\u6578\u5B57\u70BA\u9700\u6B63\u898F\u5316\u6708\u4EFD\u6578\uFF1B\u4E0B\u65B9\u660E\u7D30\u4ECD\u4FDD\u7559\u672A\u6AA2\u67E5\u8207\u7121\u6548\u503C\u7B46\u6578\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u8A73\u7D30\u7B46\u6578\u8207\u6709\u6548\u6BD4\u4F8B\u3002</p>
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${r($e(t.checked_at))} \xB7 \u6A19\u6E96\u6CD5\u9662\u540D\u7A31 ${d(t.canonical_count)} \u500B</div>
    </div>
  </section>`}function kd(e={}){let t=e.lawVersionCheck,s=!!e.lawVersionCheckLoading,a=e.lawVersionCheckError,n=`<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-law-version-check"${s?" disabled":""}>${f("refresh",12)}<span>${s?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB"}</span></button>`;if(a)return`<section class="report-card processing-card law-version-card">
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
    </section>`;let u={green:"\u5DF2\u5EFA\u7ACB",red:"\u672A\u5EFA\u7ACB",gray:"\u90E8\u5206\u5EFA\u7ACB"},c=new Map(i.map(F=>[String(F.month),F])),$=[...new Set(i.map(F=>F.year))].sort((F,T)=>T-F).map(F=>{let T=Array.from({length:12},(S,E)=>{let se=E+1,le=`${F}${String(se).padStart(2,"0")}`,Q=c.get(le);if(!Q)return`<td class="judgment-month is-empty"><span>${se}</span></td>`;let pe=u[Q.status]?Q.status:"red",ye=[`${F}-${String(se).padStart(2,"0")}`,u[pe],`\u7248\u672C ${d(Q.version_count)}\uFF08\u6CD5\u898F ${d(Q.law_versions)}\uFF0F\u547D\u4EE4 ${d(Q.order_versions)}\uFF09`,`\u5DF2\u5EFA\u7ACB ${d(Q.backfilled_count)}`,`\u672A\u5EFA\u7ACB ${d(Q.missing_count)}`,`\u9700\u5EFA\u7ACB ${d(Q.needs_backfill_count)}\uFF08\u53EF\u5EFA\u7ACB ${d(Q.backfillable_count)}\uFF0F\u7F3A\u539F\u59CB\u6A94 ${d(Q.blocked_count)}\uFF09`,`\u689D\u6587\u5217 ${d(Q.article_rows)} / \u9810\u671F ${d(Q.article_count)}`,Q.current?"\u76EE\u524D\u7248\u672C":"",Q.versions?.length?`\u7248\u672C ${Q.versions.map(I=>`#${I.version_id}`).join("\u3001")}`:""].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month law-version-month is-${pe}${Q.current?" is-current":""}" title="${r(ye)}"><span>${se}</span></td>`}).join("");return`<tr><th scope="row">${r(F)}</th>${T}</tr>`}).join(""),b={law:"\u6CD5\u898F",order:"\u547D\u4EE4"},p=i.flatMap(F=>(F.versions||[]).filter(T=>T.needs_backfill).map(T=>({...T,month:F.month}))).sort((F,T)=>T.version_id-F.version_id),g=p.slice(0,20),y=g.map(F=>{let T=F.backfillable?"badge-info":F.blocked?"badge-danger":"badge-neutral",S=F.backfillable?"\u53EF\u5EFA\u7ACB":F.blocked?"\u7F3A\u539F\u59CB\u6A94":"\u5F85\u6AA2\u67E5";return`<div class="law-backfill-needed-row">
        <strong class="mono">#${F.version_id}</strong>
        <span class="badge ${T}">${S}</span>
        <span>${r(b[F.source_type]||F.source_type||"\u2014")}</span>
        <span class="mono">${r(F.update_date||F.month||"\u2014")}</span>
        <span class="law-backfill-needed-reason">${r(F.reason||"\u2014")}</span>
      </div>`}).join(""),_=p.length?`<div class="law-backfill-needed">
        <div class="law-backfill-needed-head">\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C <span class="badge badge-warn">${d(p.length)}</span></div>
        <div class="law-backfill-needed-list">${y}</div>
        ${p.length>g.length?`<div class="law-backfill-needed-more">\u53E6\u6709 ${d(p.length-g.length)} \u500B\u7248\u672C\u672A\u5217\u51FA</div>`:""}
      </div>`:'<div class="law-backfill-needed is-clear">\u76EE\u524D\u6C92\u6709\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3002</div>',q=Number(l.needs_backfill_versions)||0,M=Number(l.backfillable_versions)||0,A=Number(l.blocked_versions)||0,U=Number(l.backfilled_versions)||0,V=Number(l.versions)||0,J=q<=0?"ok":A>0?"danger":"warn",ke=q<=0?"\u4E0D\u9700\u8981\u5EFA\u7ACB":"\u9700\u8981\u5EFA\u7ACB",Se=q>0?`\u9700\u8981\u5EFA\u7ACB ${d(q)} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF1A\u53EF\u5EFA\u7ACB ${d(M)}\u3001\u7F3A\u539F\u59CB\u6A94 ${d(A)}\u3002\u5DF2\u6709\u6B77\u53F2\u689D\u6587 ${d(U)} \u500B\u7248\u672C${A>0?"\uFF1B\u7F3A\u539F\u59CB\u6A94\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD":""}\u3002`:`\u76EE\u524D ${d(V)} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`;return`<section class="report-card processing-card law-version-card">
    <div class="side-card-head">
      <span class="side-card-title">${f("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
      ${n}
    </div>
    <div class="law-version-check-status is-${J}" role="status" aria-live="polite">
      <span class="badge badge-${J}">${ke}</span>
      <span>${r(Se)}</span>
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(F,T)=>`<th scope="col">${T+1}</th>`).join("")}</tr></thead>
          <tbody>${$}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u8A72\u6708\u4EFD\u6240\u6709\u7248\u672C\u90FD\u6709\u6B77\u53F2\u689D\u6587\uFF1B\u7D05\u8272\uFF1A\u5B8C\u5168\u672A\u5EFA\u7ACB\uFF1B\u7070\u8272\uFF1A\u90E8\u5206\u7248\u672C\u5DF2\u5EFA\u7ACB\uFF1B\u5916\u6846\uFF1A\u76EE\u524D\u7248\u672C\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u7248\u672C\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u7248\u672C\u6578\u3001\u6CD5\u898F\uFF0F\u547D\u4EE4\u6578\u8207\u689D\u6587\u5217\u3002</p>
      ${_}
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${r($e(t.checked_at))}</div>
    </div>
  </section>`}function Sd(){return`<div class="processing-ollama-loading">
    <span class="spinner" aria-hidden="true"></span>
    <span>\u6B63\u5728\u6AA2\u67E5 Ollama \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span>
  </div>`}function xd(e,t,s){let a=Array.isArray(e?.hosts)?e.hosts:[];if(s&&!a.length)return`${He({tone:"danger",title:"Ollama \u4E3B\u6A5F\u8B80\u53D6\u5931\u6557",text:r(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
    <div class="processing-ollama-empty">
      <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh-ollama">
        ${f("refresh",13)}<span>\u91CD\u65B0\u6AA2\u67E5</span>
      </button>
    </div>`;if(!a.length)return t?Sd():'<div class="processing-ollama-empty">\u5C1A\u672A\u8A2D\u5B9A Ollama \u4E3B\u6A5F\uFF1B\u8ACB\u5230\u300C\u7CFB\u7D71\u72C0\u614B \u2192 Model Provider\u300D\u65B0\u589E\u4E26\u9023\u63A5\u6A21\u578B\u3002</div>';let n=a.map((o,l)=>{let u=o.status==="operational",c=Array.isArray(o.models)?o.models:[],m=c.length?c.map(b=>`<span class="processing-ollama-model ${u?"is-online":"is-offline"}">${r(b.name||"")}</span>`).join(""):'<span class="processing-ollama-model is-offline">\u6C92\u6709\u53EF\u7528\u6A21\u578B</span>',$=[o.embedding_model?`<span class="processing-ollama-role ${u?"is-online":"is-offline"}">\u5D4C\u5165 \xB7 ${r(o.embedding_model)}</span>`:'<span class="processing-ollama-role is-offline">\u672A\u8A2D\u5B9A\u5D4C\u5165\u6A21\u578B</span>',o.chat_model?`<span class="processing-ollama-role is-offline">\u804A\u5929 \xB7 ${r(o.chat_model)}</span>`:""].filter(Boolean).join("");return`<article class="processing-ollama-host ${u?"is-online":"is-offline"}" data-ollama-host data-host-id="${Number(o.id)}">
        <span class="processing-ollama-handle" aria-hidden="true">${f("grid",14)}</span>
        <span class="processing-ollama-rank">${l+1}</span>
        <div class="processing-ollama-main">
          <div class="processing-ollama-title">
            <strong>${r(o.name||o.base_url||`\u4E3B\u6A5F #${o.id}`)}</strong>
            <span class="processing-ollama-status">${u?"\u53EF\u7528":"\u7121\u6CD5\u9023\u7DDA"}</span>
          </div>
          <span class="processing-ollama-url mono">${r(o.base_url||"\u2014")}</span>
          <div class="processing-ollama-models">${m}</div>
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
    <p class="processing-ollama-hint">\u62D6\u79FB\u6216\u4F7F\u7528\u7BAD\u982D\u8ABF\u6574 embedding \u512A\u5148\u9806\u5E8F\uFF1B\u76EE\u524D\u4E3B\u6A5F\u7121\u6CD5\u4F7F\u7528\u6642\uFF0C\u6703\u4F9D\u5E8F\u81EA\u52D5\u6539\u7528\u4E0B\u4E00\u53F0\uFF08\u5404\u53F0\u9700\u5177\u5099\u76F8\u540C\u7684 embedding \u6A21\u578B\uFF09\uFF0C\u76F4\u5230\u6709\u4E3B\u6A5F\u56DE\u50B3\u5411\u91CF\u3002</p>`}function Ad(e,t={}){let s=e.active_run||null,a=s||e.last_run||null,n=Ct===e.id,i=!!s||n,o=!!e.can_run&&!i,l=i?"\u6B64\u6D41\u7A0B\u6B63\u5728\u57F7\u884C\u4E2D\u3002":e.start_blocked_reason||"\u76EE\u524D\u6709\u5176\u4ED6\u8655\u7406\u7A0B\u5E8F\u57F7\u884C\u4E2D\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",u=Array.isArray(e.command)?e.command.join(" "):"",c=Number(e.update_count)||e.update_available&&Number(e.pending_count)||0,m=e.update_origin||"\u66F4\u65B0\u5075\u6E2C",$=e.update_mechanism||"\u65E2\u6709\u66F4\u65B0\u6AA2\u67E5\u7D00\u9304",b=e.update_message||e.update_status&&e.update_status.message||"\u627E\u5230\u53EF\u66F4\u65B0\u5167\u5BB9\u3002",p=e.update_status&&e.update_status.checked_at?$e(e.update_status.checked_at):"",g=e.progress||{},y=Array.isArray(g.stages)?g.stages:[],_=String(g.active_stage||""),q=y.find(J=>String(J.key||"")===_),M=(e.index_runtime&&e.index_runtime.current?e.index_runtime.current.month:"")||"",A=M?Ma(M):q&&(q.label||q.key)||"",U=n&&!s?"\u555F\u52D5\u4E2D":"\u57F7\u884C\u4E2D",V=`<section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${f(Ni[e.id]||"terminal",14)}\u57F7\u884C\u8CC7\u8A0A</span>
        <span class="badge badge-neutral badge-mono">${r(e.branch||"")}</span>
      </div>
      <div class="processing-workflow-command-grid">
        <span>\u7A0B\u5F0F</span><code>${r(e.program||"\u2014")}</code>
        <span>Shell\uFF0F\u5165\u53E3</span><code>${r(e.script||"\u2014")}</code>
        <span>\u5BE6\u969B\u547D\u4EE4</span><code class="processing-workflow-command">${r(u||"\u2014")}</code>
      </div>
      ${Mn.has(e.id)?'<div class="processing-embedding-strip-slot" data-processing-embedding-strip data-preserve-children></div>':""}
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
              ${s&&s.started_at?`<span>\u958B\u59CB ${r($e(s.started_at))}</span>`:""}
              ${A?`<span>\u76EE\u524D\u8655\u7406 <strong class="mono">${r(A)}</strong></span>`:""}
            </div>`:""}
      <div class="side-card-foot">
        \u57F7\u884C\u7D50\u679C\u6703\u5BEB\u5165\u5171\u7528\u8655\u7406\u72C0\u614B\u6A94\uFF0C\u53EF\u5F9E\u8655\u7406\u7E3D\u89BD\u67E5\u770B\u3002
      </div>
    </section>`;return`<div class="processing-workflow-panel">
    ${He({tone:"info",title:e.label,text:e.description||""})}
    ${e.update_available?`<div class="processing-update-notice" role="status">
            <span class="processing-update-notice-icon">${f("refresh",14)}</span>
            <span class="processing-update-notice-copy">
              <strong>${r(m)}\u5075\u6E2C\u5230\u53EF\u66F4\u65B0\u5167\u5BB9</strong>
              <span class="processing-update-mechanism">\u5075\u6E2C\u6A5F\u5236\uFF1A${r($)}${p?` \xB7 \u6AA2\u67E5\u6642\u9593 ${r(p)}`:""}</span>
              <span class="processing-update-message">${r(b)}</span>
            </span>
            ${c>0?`<span class="badge badge-warn badge-mono">${f("refresh",10)}${d(c)}</span>`:'<span class="badge badge-warn">\u53EF\u66F4\u65B0</span>'}
          </div>`:""}
    ${["legal_index_versions","law_download","order_download"].includes(e.id)?Bc(e.index_timelines,{titleSuffix:e.id==="legal_index_versions"?"\u7D22\u5F15\u7248\u672C\u6642\u9593\u8868":"\u4E0B\u8F09\u6642\u9593\u8868"}):""}
    ${e.id==="normalize_courts"?V:""}
    ${e.id==="normalize_courts"?_d(t):""}
    ${e.id==="backfill_law_articles"?kd(t):""}
    ${e.id!=="normalize_courts"?V:""}
    ${dd(e)}
    ${e.id==="judgment_parquet"?$d():""}
    ${e.id==="normalize_courts"?yd():""}
    ${e.id==="backfill_law_articles"?wd():""}
    ${e.id==="judgment_import"?gd(e):""}
    ${e.id==="index_versions"?vd(e):""}
    ${e.id==="index_versions"?hd(t):""}
    ${e.id==="judgment_download"?`<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${f("calendar",14)}\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B</span>
              <button class="btn btn-ghost btn-sm" type="button" title="\u91CD\u65B0\u6383\u63CF raw_rar \u76EE\u9304\u8207\u6708\u4EFD\u72C0\u614B" data-processing-action="refresh-judgment-months">${f("refresh",13)}<span>\u91CD\u65B0\u6574\u7406</span></button>
            </div>
            <div data-judgment-months-slot data-preserve-children>${Rn()}</div>
          </section>`:""}
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${f("history",14)}\u6700\u8FD1\u57F7\u884C</span>
        ${wt(a?.status||"idle")}
      </div>
      ${Kc(a)}
    </section>
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${f("history",14)}\u57F7\u884C\u7D00\u9304</span>
        <span class="badge badge-neutral">\u6700\u8FD1 ${d((e.recent_runs||[]).length)} \u7B46</span>
      </div>
      ${nd(e.recent_runs)}
    </section>
    ${["law_download","order_download","judgment_download"].includes(e.id)?`<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${f("search",14)}\u7248\u672C\u6AA2\u67E5\u7D00\u9304</span>
              <span class="badge badge-neutral">\u6700\u8FD1 ${d((e.update_history||[]).length)} \u7B46</span>
            </div>
            ${rd(e)}
          </section>`:""}
  </div>`}function qa(e,t,s={},a=new Set){if(t==="overview")return qi(e,a);let i=(Array.isArray(e.workflows)?e.workflows:[]).find(o=>o.id===t);return i?Ad(i,s):qi(e,a)}async function qd(e){e.innerHTML=`<section class="page processing-page">
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
  </section>`;let t=e.querySelector(".processing-page"),s=e.querySelector("#processing-root"),a=e.querySelector("#processing-workflows"),n=e.querySelector("#processing-stop"),i=document.createElement("div");i.className="processing-stage-tooltip",i.hidden=!0,t.appendChild(i),Rt=new Map;let o=!1,l=!1,u=!1,c=null,m="",$="",b="overview",p=null,g=!1,y=null,_=null,q=!1,M=null,A=0,U=null,V=!1,J=null,ke=0,Se=null,F=!1,T=null,S=0,E=null,se=!1,le=null,Q=0,pe=!1,ye=null,I=!1,we=!1,G="",he=new Set,Te=null,ne=null,me=-1,ge="",Le=0,be=0,Ee=null,Fe=[],et=()=>({storage:_,loading:q,error:M,courtCheck:U,courtCheckLoading:V,courtCheckError:J,lawVersionCheck:Se,lawVersionCheckLoading:F,lawVersionCheckError:T}),P=()=>{if(b!=="judgment_download")return;let h=s.querySelector(".processing-workflow-panel");if(!h)return;h.querySelectorAll(".judgment-month.is-active").forEach(Qe=>{Qe.classList.remove("is-active"),Qe.removeAttribute("aria-current")});let k=h.querySelector("[data-judgment-progress]");if(!k)return;let D=p?.progress,ie=!!(c?.workflows||[]).find(Qe=>Qe.id==="judgment_download")?.active_run;if((!D||D.active===!1)&&!ie){k.hidden=!0,k.classList.remove("is-indeterminate");return}if(k.hidden=!1,!D||D.active===!1){let Qe=k.querySelector("[data-judgment-progress-phase]");Qe&&(Qe.textContent="\u6E96\u5099\u4E2D");let $t=k.querySelector("[data-judgment-progress-month]");$t&&($t.textContent="\u2014");let ze=k.querySelector("[data-judgment-progress-filename]");ze&&(ze.textContent="\u7B49\u5F85\u4E0B\u8F09\u7A0B\u5E8F\u56DE\u5831\u9032\u5EA6\u2026",ze.title=""),k.classList.add("is-indeterminate");let _t=k.querySelector("[data-judgment-progress-bar]");_t&&(_t.style.width="");let Ke=k.querySelector("[data-judgment-progress-percent]");Ke&&(Ke.textContent="\u2014");let kt=k.querySelector("[data-judgment-progress-size]");kt&&(kt.textContent="\u2014");let qt=k.querySelector("[data-judgment-progress-note]");qt&&(qt.textContent="\u5DF2\u555F\u52D5\uFF0C\u7B49\u5F85\u9032\u5EA6\u56DE\u5831");return}let _e={preparing:"\u6E96\u5099\u4E2D",scanning:"\u6383\u63CF\u4E2D",checking:"\u6AA2\u67E5\u4E2D",downloading:"\u4E0B\u8F09\u4E2D",saving:"\u5132\u5B58\u4E2D",finalizing:"\u6574\u7406\u4E2D"}[D.phase]||"\u8655\u7406\u4E2D",ae=k.querySelector("[data-judgment-progress-phase]");ae&&(ae.textContent=_e);let re=D.month||"",ve=k.querySelector("[data-judgment-progress-month]");ve&&(ve.textContent=re||"\u2014");let qe=D.filename||"",je=k.querySelector("[data-judgment-progress-filename]");if(je&&(je.textContent=qe||"\u2014",je.title=qe),re){let Qe=h.querySelector(`[data-judgment-month-key="${re}"]`);Qe&&(Qe.classList.add("is-active"),Qe.setAttribute("aria-current","true"))}let v=Number(D.bytes_written),R=Number(D.total_bytes),z=Number.isFinite(R)&&R>0,ee=null,ce=D.percent;ce!=null&&ce!==""&&Number.isFinite(Number(ce))?ee=Number(ce):z&&Number.isFinite(v)&&(ee=v/R*100);let Me=ee===null;k.classList.toggle("is-indeterminate",Me);let Je=k.querySelector("[data-judgment-progress-bar]");Je&&(Je.style.width=Me?"":`${Math.min(100,Math.max(0,ee)).toFixed(1)}%`);let Be=k.querySelector("[data-judgment-progress-percent]");if(Be){let Qe=Me?null:Math.min(100,Math.max(0,ee));Be.textContent=Qe===null?"\u2014":`${Qe.toFixed(Qe>=10?0:1)}%`}let dt=k.querySelector("[data-judgment-progress-size]");if(dt){let Qe=Number.isFinite(v)&&v>0?Ie(v):"\u2014";dt.textContent=z?`${Qe} / ${Ie(R)}`:Qe}let ut=k.querySelector("[data-judgment-progress-note]");if(ut){let Qe=[],$t=Number(D.candidate_index),ze=Number(D.candidate_total);Number.isFinite($t)&&$t>0&&Number.isFinite(ze)&&ze>0&&Qe.push(`\u7B2C ${d($t)} / ${d(ze)} \u500B\u6708`),D.fileset_id&&Qe.push(`fileset ${D.fileset_id}`),D.message&&D.phase!=="downloading"&&Qe.push(String(D.message)),ut.textContent=Qe.join(" \xB7 ")}},B=()=>{if(b!=="judgment_download")return;let h=s.querySelector("[data-judgment-months-slot]");if(h){let k=Array.isArray(p?.months)?p.months:[];y&&!p?(h.innerHTML=He({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:r(y)}),delete h.dataset.judgmentMonthCount):p?h.dataset.judgmentMonthCount!==String(k.length)?(h.innerHTML=sd(p),h.dataset.judgmentMonthCount=String(k.length)):ad(h,p):(h.querySelector(".judgment-months-loading")||(h.innerHTML=Rn()),delete h.dataset.judgmentMonthCount)}P()},w=()=>{let h=Array.isArray(E?.hosts)?E.hosts:[];return JSON.stringify({loading:!h.length&&se,error:!h.length&&le?le.message||String(le):"",active:E?.active_host_id??null,hosts:h.map(k=>({id:k.id,name:k.name,url:k.base_url,status:k.status,detail:k.detail,embedding:k.embedding_model,chat:k.chat_model,models:(k.models||[]).map(D=>D.name)}))})},j=()=>{let h=s.querySelector("[data-processing-ollama]");if(!h||Q)return;let k=w();h.dataset.ollamaSignature!==k&&(h.dataset.ollamaSignature=k,h.innerHTML=xd(E,se,E?null:le))},W=()=>{let k=((c?.sections||[]).find(D=>D.key==="legal")?.stages||[]).find(D=>D.key==="legal_qdrant");return String(k?.model?.label||"")},H=()=>{let h=s.querySelector("[data-processing-embedding-strip]");if(!h)return;let k=Array.isArray(E?.hosts)?E.hosts:[],D=[];for(let re of k)if(re.status==="operational")for(let ve of re.models||[])Array.isArray(ve.capabilities)&&ve.capabilities.includes("embedding")&&D.push({hostId:Number(re.id),model:ve.name,label:`${re.name||re.base_url||`\u4E3B\u6A5F ${re.id}`}:${ve.name}`,baseUrl:re.base_url||""});let de=W(),ie=k.find(re=>Number(re.id)===Number(E?.active_host_id)),Z=D.map(re=>{let ve=re.label===de;return`<button class="rag-model-button${ve?" is-active":""}" type="button"
        data-processing-action="select-embedding-model"
        data-host-id="${re.hostId}"
        data-model="${r(re.model)}"
        title="${r(re.label)}"
        aria-pressed="${ve?"true":"false"}"
        ${we?"disabled":""}>
        <span class="rag-model-state" aria-hidden="true"></span>
        <span>${r(re.label)}</span>
        ${ve?'<span class="rag-model-current">\u4F7F\u7528\u4E2D</span>':""}
      </button>`});de&&!D.some(re=>re.label===de)&&Z.unshift(`<button class="rag-model-button is-active is-static" type="button" aria-pressed="true" disabled>
          <span class="rag-model-state" aria-hidden="true"></span>
          <span>${r(de)}</span>
          <span class="rag-model-current">\u4F7F\u7528\u4E2D</span>
        </button>`);let _e=D.length?`<div class="rag-model-buttons">${Z.join("")}</div>`:`<p class="rag-model-empty">${se?"\u8B80\u53D6\u7DDA\u4E0A\u4E3B\u6A5F\u8207 Embedding model\u2026":le?`\u7121\u6CD5\u8B80\u53D6\u7DDA\u4E0A\u4E3B\u6A5F\uFF1A${r(le.message||String(le))}`:"\u76EE\u524D\u6C92\u6709\u53EF\u7528\u7684 Embedding model\u3002"}</p>`,ae=`<div class="processing-embedding-strip rag-model-strip">
      <div class="rag-model-strip-head">
        <span class="rag-model-strip-title">${f("brain",13)} Embedding \u4E3B\u6A5F\uFF0F\u6A21\u578B</span>
        ${ie?.base_url?`<span class="rag-model-strip-base mono">${r(ie.base_url)}</span>`:""}
        <span class="rag-model-strip-current">\u76EE\u524D\uFF1A<strong>${r(de||"\u2014")}</strong></span>
        <button class="btn btn-ghost btn-sm rag-model-refresh" type="button"
          data-processing-action="refresh-embedding-models"
          ${se?"disabled":""}>
          ${f("refresh",12)}<span>\u6AA2\u67E5\u6A21\u578B</span>
        </button>
      </div>
      ${_e}
      <p class="rag-model-hint">\u9EDE\u9078 <span class="mono">\u4E3B\u6A5F:\u6A21\u578B</span> \u5207\u63DB Embedding\uFF1B\u9078\u53D6\u5F8C\u6703\u6210\u70BA\u7B2C\u4E00\u512A\u5148\uFF0C\u5176\u4ED6\u4E3B\u6A5F\u4F9D\u5E8F\u4F5C\u70BA\u5099\u63F4\u3002\u5207\u63DB\u6A21\u578B\u5F8C\u65E2\u6709\u7D22\u5F15\u53EF\u80FD\u9700\u8981\u91CD\u5EFA\u3002</p>
    </div>`;h.innerHTML!==ae&&(h.innerHTML=ae)},Oe=h=>{let k=s.querySelector('[data-import-timeline="judgment"]');if(!k)return;let D=String(h?.active_month||""),de=String(h?.processing_month||"");k.querySelectorAll(".processing-month").forEach(qe=>{let je=!!D&&qe.dataset.month===D;qe.classList.toggle("is-current",je),qe.classList.toggle("is-processing-current",!!de&&qe.dataset.month===de),je?qe.setAttribute("aria-current","true"):qe.removeAttribute("aria-current")});let ie=k.querySelector(".index-current-row");if(!D||!h?.active_archive){ie&&ie.remove();return}let Z=c?.workflows?.find(qe=>qe.id==="judgment_import")?.import_timeline?.stage_labels||{},_e=ji({activeMonth:D,activeArchive:h.active_archive,activePhase:h.active_phase||"",processingMonth:h.processing_month||"",processingArchive:h.processing_archive||"",stageLabels:Z});if(ie){ie.innerHTML=_e;return}let ae=document.createElement("div");ae.className="index-current-row",ae.innerHTML=_e;let re=k.querySelector(":scope > .side-card-head");if(re){re.insertAdjacentElement("afterend",ae);return}let ve=k.querySelector(".judgment-months");ve&&ve.prepend(ae)},Ce=h=>{let k=Number(h?.state_mtime_ns);return Number.isFinite(k)?k:-1},Pe=h=>{let k=String(h?.active_month||"");return/^\d{6}$/.test(k)?Number(k):-1},st=h=>{if(!h)return;let k=Ce(h);if(k>=0&&k<me){ne?.active_month&&Oe(ne);return}k>=0&&(me=k);let D=String(h.active_month||"");if(!!(h.run_id&&h.run_id===ne?.run_id)&&Pe(h)>=0&&Pe(h)<Pe(ne)){let ie={...h,active_month:ne.active_month,active_archive:ne.active_archive};ne=ie,Oe(ie);return}if(!D&&h.run_status==="running"){ne?.active_month&&ne?.run_id===h.run_id?Oe(ne):(ne=h,Oe(h));return}ne=h,Oe(h)},lt=h=>{let k=h?.active_import;if(k){st(k);return}ne?.active_month&&Oe(ne)},ot=()=>{o||Te||(Te=xt(["processing","judgment-download","system-usage","ollama","court-check","law-version-check"],(h,k)=>{if(!o){if(h==="processing"){k?.snapshot?.live?Ls(k.snapshot):k?.snapshot?Ge(k.snapshot,{silent:!0}):Ft({silent:!0});return}if(h==="judgment-download"){b==="judgment_download"&&Tt({quiet:!0,payload:k?.snapshot||null});return}if(h==="system-usage"){b==="index_versions"&&Xt({quiet:!0,force:!0,payload:k?.snapshot||null});return}if(h==="ollama"){Mn.has(b)&&nt({quiet:!0,payload:k?.snapshot||null});return}if(h==="court-check"){b==="normalize_courts"&&x({quiet:!0,force:!0,payload:k?.snapshot||null});return}h==="law-version-check"&&b==="backfill_law_articles"&&L({quiet:!0,force:!0,payload:k?.snapshot||null})}},{onProgress:(h,k)=>{if(h!=="processing")return;let D=k?.event;D&&it(D)},onError:()=>{c||Ft({silent:!0})}}))},Ve=()=>{Te&&(Te(),Te=null)},jt=async h=>{if(we)return;let[k,...D]=String(h||"").split("|"),de=Number(k),ie=D.join("|");if(!de||!ie){H();return}let Z=(E?.hosts||[]).find(ae=>Number(ae.id)===de);if(!Z){H();return}let _e=`${Z.name||Z.base_url||`\u4E3B\u6A5F ${Z.id}`}:${ie}`;if(_e===W()){H();return}if(!window.confirm(`\u5207\u63DB Embedding \u70BA ${_e}\uFF1F

\u5207\u63DB\u6A21\u578B\u5F8C\uFF0C\u65E2\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u8207\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u53EF\u80FD\u4E0D\u76F8\u5BB9\uFF0C\u9700\u8981\u91CD\u65B0\u5EFA\u7ACB\u7D22\u5F15\u3002`)){H();return}we=!0,H();try{await K.selectOllamaModel(de,{model:ie,role:"embedding"});let ae=(E?.hosts||[]).map(ve=>Number(ve.id)),re=[de,...ae.filter(ve=>ve!==de)];await K.reorderOllamaHosts(re),C(`\u5DF2\u5207\u63DB Embedding \u70BA ${_e}\u3002`,"ok",6e3),E=null,await nt({quiet:!0}),await Ft({silent:!0})}catch(ae){C(ae.message||"\u7121\u6CD5\u5207\u63DB Embedding model\u3002","danger",7e3),await nt({quiet:!0})}finally{we=!1,H()}},nt=async({quiet:h=!1,button:k=null,payload:D=null}={})=>{if(!(o||se)){se=!0,le=null,E||(j(),H()),k&&Ne(k,!0,"\u6AA2\u67E5\u4E2D\u2026");try{let de=D||await K.ollamaHosts();if(o)return;E=de}catch(de){if(o)return;le=de,h||C(de.message||"\u7121\u6CD5\u6AA2\u67E5 Ollama \u4E3B\u6A5F\u3002","danger",6e3)}finally{o||(se=!1,k&&Ne(k,!1),j(),H())}}},Xe=async h=>{if(I)return;let k=(E?.hosts||[]).map(Z=>Number(Z.id)),D=h.map(Z=>Number(Z));if(!D.length||D.length!==k.length||D.every((Z,_e)=>Z===k[_e])){j();return}I=!0;let de=new Map((E?.hosts||[]).map(Z=>[Number(Z.id),Z])),ie=D.map(Z=>de.get(Z)).filter(Boolean);if(E&&ie.length===k.length){E={...E,hosts:ie,active_host_id:D[0]};let Z=s.querySelector("[data-processing-ollama]");Z&&(Z.dataset.ollamaSignature=""),j()}try{await K.reorderOllamaHosts(D),C("\u5DF2\u66F4\u65B0 Ollama \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","ok",3500)}catch(Z){C(Z.message||"\u7121\u6CD5\u66F4\u65B0 Ollama \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","danger",6e3),await nt({quiet:!0})}finally{I=!1}},Pt=()=>{let h=s.querySelector("[data-processing-ollama]");h&&(h.dataset.ollamaSignature=""),j()},te=()=>{let h=ye;if(!h)return;if(s.querySelector(`[data-ollama-host][data-host-id="${h.hostId}"]`)?.classList.remove("is-dragging"),h.captureTarget?.hasPointerCapture?.(h.pointerId))try{h.captureTarget.releasePointerCapture(h.pointerId)}catch{}document.documentElement.classList.remove("processing-ollama-dragging"),window.removeEventListener("pointermove",Ae),window.removeEventListener("pointerup",We),window.removeEventListener("pointercancel",Ze),ye=null,Q=0},Ae=h=>{let k=ye;if(!k||h.pointerId!==k.pointerId)return;if(!k.dragging){if(Math.hypot(h.clientX-k.startX,h.clientY-k.startY)<5)return;k.dragging=!0,Q=k.hostId,pe=!1,s.querySelector(`[data-ollama-host][data-host-id="${k.hostId}"]`)?.classList.add("is-dragging"),document.documentElement.classList.add("processing-ollama-dragging")}h.preventDefault();let D=64;h.clientY<D?window.scrollBy(0,-12):h.clientY>window.innerHeight-D&&window.scrollBy(0,12);let de=s.querySelector("[data-ollama-list]"),ie=document.elementFromPoint(h.clientX,h.clientY)?.closest?.("[data-ollama-host]");if(!de||!ie||!de.contains(ie))return;let Z=de.querySelector(`[data-ollama-host][data-host-id="${k.hostId}"]`);if(!Z||Z===ie)return;let _e=ie.getBoundingClientRect(),ae=h.clientY>_e.top+_e.height/2;de.insertBefore(Z,ae?ie.nextSibling:ie),pe=!0},We=h=>{let k=ye;if(!k||h.pointerId!==k.pointerId)return;let D=k.dragging,de=pe,ie=s.querySelector("[data-ollama-list]"),Z=D&&ie?[...ie.querySelectorAll("[data-ollama-host]")].map(_e=>Number(_e.dataset.hostId)):[];te(),D&&de&&Z.length&&Xe(Z)},Ze=()=>{let h=!!ye?.dragging;te(),h&&Pt()},It=h=>{if(h.button!==0||h.pointerType==="mouse"&&h.buttons!==1||I||ye)return;let k=h.target.closest("[data-ollama-host]");if(!k||!s.contains(k)||h.target.closest("button")||h.pointerType==="touch"&&!h.target.closest(".processing-ollama-handle"))return;let D=Number(k.dataset.hostId)||0;if(D){h.preventDefault(),Q=D,ye={hostId:D,pointerId:h.pointerId,startX:h.clientX,startY:h.clientY,dragging:!1,captureTarget:k};try{k.setPointerCapture(h.pointerId)}catch{}window.addEventListener("pointermove",Ae,{passive:!1}),window.addEventListener("pointerup",We),window.addEventListener("pointercancel",Ze)}},Tt=async({quiet:h=!1,payload:k=null}={})=>{if(!g){g=!0,!p&&b==="judgment_download"&&B();try{p=k||await K.judgmentDownloadStatus(),y=null}catch(D){y=D.message||"\u8B80\u53D6\u6708\u4EFD\u72C0\u614B\u5931\u6557\u3002",h||C(y,"danger",7e3)}finally{g=!1,b==="judgment_download"&&B()}}},Xt=async({quiet:h=!0,force:k=!1,payload:D=null}={})=>{if(!q&&!(!k&&_&&Date.now()-A<3e4)){q=!0;try{_=D||await K.systemUsage(),M=null,A=Date.now()}catch(de){M=de.message||"\u7121\u6CD5\u53D6\u5F97 Qdrant \u5BB9\u5668\u8207 volume \u8CC7\u8A0A\u3002",h||C(M,"danger",7e3)}finally{q=!1,b==="index_versions"&&xe()}}},x=async({quiet:h=!0,force:k=!1,payload:D=null}={})=>{if(!V&&!(!k&&U&&Date.now()-ke<6e4)){V=!0;try{U=D||await K.checkCourts(),J=null,ke=Date.now()}catch(de){J=de.message||"\u7121\u6CD5\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31\u3002",h||C(J,"danger",7e3)}finally{V=!1,b==="normalize_courts"&&xe()}}},L=async({quiet:h=!0,force:k=!1,button:D=null,payload:de=null}={})=>{if(!F&&!(!k&&Se&&Date.now()-S<6e4)){F=!0,D&&Ne(D,!0,"\u6AA2\u67E5\u4E2D\u2026");try{if(Se=de||await K.checkLawVersions(),T=null,S=Date.now(),!h){let ie=Se.totals||{},Z=Number(ie.needs_backfill_versions)||0,_e=Number(ie.backfillable_versions)||0,ae=Number(ie.blocked_versions)||0;Z>0?C(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u9700\u8981\u5EFA\u7ACB ${Z} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF08\u53EF\u5EFA\u7ACB ${_e}\u3001\u7F3A\u539F\u59CB\u6A94 ${ae}\uFF09\u3002`,ae>0?"danger":"warn",7e3):C(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D ${Number(ie.versions)||0} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`,"ok",5e3)}}catch(ie){T=ie.message||"\u7121\u6CD5\u6AA2\u67E5\u689D\u6587\u6B77\u53F2\u72C0\u614B\u3002",h||C(T,"danger",7e3)}finally{F=!1,D&&Ne(D,!1)}}},N=h=>Array.from(s.querySelectorAll("[data-stage-key]")).find(k=>k.dataset.stageKey===h)||null,O=h=>{if(!h)return;he.add(h);let k=Array.from(s.querySelectorAll(".processing-wf-stage[data-processing-stage]")).find(D=>D.dataset.processingStage===h);k&&(k.open=!0,k.scrollIntoView({behavior:"smooth",block:"center"}))},Y=()=>{G&&(G="",i.hidden=!0,s.querySelectorAll("[data-stage-key]").forEach(h=>{h.classList.remove("is-stage-hovered")}))},X=h=>{let k=h.dataset.stageKey||"";if(!k)return;G=k,s.querySelectorAll("[data-stage-key]").forEach(R=>{R.classList.toggle("is-stage-hovered",R.dataset.stageKey===k)});let D=h.dataset.stageStatusKey||"idle",de=h.dataset.stageStatus||ds(D).label,ie=h.dataset.stageColor||"var(--accent)",Z=Number(h.dataset.stageUpdate)||0,_e=Number(h.dataset.stagePending)||0,ae=h.dataset.stageContributionLabel||"\u6574\u9AD4\u5360\u6BD4";i.innerHTML=`<div class="processing-stage-tooltip-head">
      <span class="processing-stage-tooltip-swatch" style="background:${r(ie)}"></span>
      <strong>${r(h.dataset.stageLabel||k)}</strong>
      ${wt(D,de)}
    </div>
    <div class="processing-stage-tooltip-meta">
      <span>\u968E\u6BB5\u9032\u5EA6 <strong>${r(h.dataset.stagePercent||"\u2014")}</strong></span>
      <span>${r(ae)} <strong>${r(h.dataset.stageContribution||"\u2014")}</strong></span>
      <span class="mono">${r(h.dataset.stageDuration||"\u2014")}</span>
    </div>
    <div class="processing-stage-tooltip-counts">${r(h.dataset.stageCounts||"\u2014")}</div>
    ${Z||_e?`<div class="processing-stage-tooltip-badges">
            ${Z?`<span class="processing-wf-count is-update">${f("refresh",11)}<strong>${d(Z)}</strong><span>\u53EF\u66F4\u65B0</span></span>`:""}
            ${_e?`<span class="processing-wf-count is-pending">${f("clock",11)}<strong>${d(_e)}</strong><span>\u5F85\u57F7\u884C</span></span>`:""}
          </div>`:""}
    ${h.dataset.stageMessage?`<div class="processing-stage-tooltip-message">${r(h.dataset.stageMessage)}</div>`:""}`,i.hidden=!1;let re=Math.min(300,Math.max(220,window.innerWidth-24));i.style.width=`${re}px`;let ve=h.getBoundingClientRect(),qe=Math.min(window.innerWidth-re-12,Math.max(12,ve.left)),je=ve.top-i.offsetHeight-10,v=je>=12?je:Math.min(window.innerHeight-i.offsetHeight-12,ve.bottom+10);i.style.left=`${qe}px`,i.style.top=`${Math.max(12,v)}px`},ue=h=>{if(h.target.closest(".is-failure-tip")){Y();return}if(h.target.closest(".processing-wf-rail"))return;let k=h.target.closest("[data-stage-key]");!k||!s.contains(k)||k.contains(h.relatedTarget)||X(k)},Re=h=>{let k=h.target.closest("[data-stage-key]");if(!k||!s.contains(k)||k.contains(h.relatedTarget))return;let D=h.relatedTarget?.closest?.("[data-stage-key]");D&&D.dataset.stageKey===k.dataset.stageKey||Y()},De=h=>{let k=h.capabilities||{};!u&&n&&(n.hidden=!k.can_stop_update)},xe=()=>{if(!c)return;let h=qa(c,b,et(),he);h!==m&&(cs(s,h),m=h),B(),j(),H(),lt(c)},Ge=(h,{silent:k=!1}={})=>{if(o||!h)return;let D=Date.parse(h.generated_at||""),de=Date.parse(c?.generated_at||"");if(Number.isFinite(D)&&Number.isFinite(de)&&D<de)return;if(Ct){let re=(h.workflows||[]).find(qe=>qe.id===Ct),ve=re?.active_run?.id||re?.last_run?.id||"";(re?.active_run||ve&&ve!==fs)&&(Ct="",fs="")}c=h;let ie=new Map;for(let re of h.sections||[])for(let ve of re.stages||[])ie.set(`${re.key}-${ve.key}`,ve);for(let[re,ve]of Rt){if(ve.kind!=="upgrade")continue;let qe=ie.get(re);if(qe){if(qe.phase==="failed"||qe.phase==="running"&&qe.percent!==null){Rt.delete(re);continue}if(qe.phase==="completed"){let je=Date.parse(qe.last_run?.started_at||"");Number.isFinite(je)&&je>=Number(ve.startedAt||0)-1e3&&Rt.delete(re)}}}let Z=qn(h,b);Z!==$&&(cs(a,Z),$=Z);let _e=qa(h,b,et(),he);if(_e!==m&&(cs(s,_e),m=_e),B(),j(),G){let re=N(G);re?X(re):Y()}let ae=s.querySelector("[data-processing-updated-at]");if(ae){let re=$e(h.generated_at);ae.textContent!==re&&(ae.textContent=re)}if(De(h),H(),lt(h),!E&&!se&&nt({quiet:!0}),Fe.length){let re=Fe.splice(0);for(let ve of re)it(ve)}},tt=h=>{if(Ee=h,typeof requestAnimationFrame>"u"){let k=Ee;Ee=null,k&&Ls(k);return}be||(be=requestAnimationFrame(()=>{be=0;let k=Ee;Ee=null,k&&Ls(k)}))},it=h=>{if(!h)return;if(!c){Fe.push(h),Fe.length>100&&Fe.shift();return}let k=String(h.run_id||""),D=Number(h.seq)||0;if(k&&k===ge&&D>0&&D<=Le)return;k&&k!==ge&&(ge=k,Le=0),D>0&&(Le=D);let de=String(h.workflow_id||"judgment_import"),ie=String(h.month||"").replace(/\D/g,"").slice(0,6),Z=(c.workflows||[]).find(je=>je.id===de);if(!Z)return;Z.progress||(Z.progress={stages:[]}),Array.isArray(Z.progress.stages)||(Z.progress.stages=[]);let _e=String(h.stage||""),ae=_e?Z.progress.stages.find(je=>String(je.key)===_e):null,re=String(Z.progress.run_id||"")===String(h.run_id||"");if(ae&&h.type==="stage_progress"){let je=Number(h.current),v=Number(ae.current);re&&h.status==="running"&&Number.isFinite(je)&&Number.isFinite(v)&&je<v||(h.status&&(ae.status=String(h.status)),h.current!==void 0&&(ae.current=Number(h.current)||0),h.total!==void 0&&(ae.total=Number(h.total)||0),h.percent!==void 0&&(ae.percent=Number(h.percent)||0),h.message&&(ae.message=String(h.message)))}if(ae&&h.extra&&typeof h.extra=="object")for(let je of["financial_processed","financial_matched","financial_percent"])h.extra[je]!==void 0&&(ae[je]=Number(h.extra[je])||0);if(h.type==="stage_progress"&&h.overall_percent!==void 0){let je=Number(h.overall_percent)||0,v=Number(Z.progress.overall_percent)||0;Z.progress.overall_percent=re?Math.max(v,je):je}h.type!=="run_finished"&&(Z.progress.run_status="running"),(h.type==="archive_started"||h.type==="stage_progress")&&!Z.active_run&&h.run_id&&(Z.active_run={id:h.run_id,status:"running",started_at:h.timestamp,message:h.message||""}),h.type==="run_finished"&&(Z.active_run=null,Z.progress.run_status=String(h.status||"success"),Z.can_run=!0);let ve=[];ie&&h.month_stages&&ve.push({month:ie,import_stages:h.month_stages,import_overall:h.month_overall||""});let qe=null;if(h.type==="archive_started"&&ie){let je=Date.parse(h.timestamp||"");qe={active_month:ie,active_archive:h.archive,active_phase:h.stage||"filter",processing_month:ie,processing_archive:h.archive,run_id:h.run_id,run_status:"running",state_mtime_ns:Number.isFinite(je)?je*1e6:Date.now()*1e6}}else h.type==="run_finished"&&(qe={...c.active_import||{},run_status:String(h.status||"success")});tt({live:!0,generated_at:h.timestamp,workflows:[{id:de,active_run:Z.active_run,last_run:Z.last_run,progress:Z.progress,can_run:Z.can_run}],import_timeline_months:ve,active_import:qe})},Ls=h=>{if(o||!h||!c)return;let k=new Map((h.workflows||[]).map(ae=>[ae.id,ae]));if(Ct){let ae=k.get(Ct),re=ae?.active_run?.id||ae?.last_run?.id||"";(ae?.active_run||re&&re!==fs)&&(Ct="",fs="")}for(let ae of c.workflows||[]){let re=k.get(ae.id);if(re){if("active_run"in re&&(ae.active_run=re.active_run),"last_run"in re&&(ae.last_run=re.last_run),Array.isArray(re.recent_runs)&&(ae.recent_runs=re.recent_runs),"index_runtime"in re){let ve=re.index_runtime;ve&&!ve.active_coverage&&ae.index_runtime?.active_coverage&&(ve.active_coverage=ae.index_runtime.active_coverage),ae.index_runtime=ve}if(re.progress){let ve=re.progress,qe=ae.progress;if(ae.id==="judgment_import"&&qe?.run_id&&qe.run_id===ve.run_id){let je=new Map((qe.stages||[]).map(v=>[String(v.key),v]));for(let v of ve.stages||[]){let R=je.get(String(v.key));R&&v.status==="running"&&Number(v.current)<Number(R.current)&&(v.current=R.current,v.total=R.total,v.percent=R.percent,v.message=R.message)}ve.overall_percent=Math.max(Number(qe.overall_percent)||0,Number(ve.overall_percent)||0)}ae.progress=ve}typeof re.can_run=="boolean"&&(ae.can_run=re.can_run)}}let D=ae=>{if(!ae||!Array.isArray(h.import_timeline_months))return;let re=new Map((ae.months||[]).map(qe=>[String(qe.month),qe]));for(let qe of h.import_timeline_months){let je=re.get(String(qe.month));je&&(je.import_stages={...je.import_stages||{},...qe.import_stages||{}},qe.import_overall&&(je.import_overall=qe.import_overall))}let ve={complete:0,incomplete:0,processing:0,empty:0};for(let qe of ae.months||[]){let je=String(qe.import_overall||"empty");ve[je]=Number(ve[je]||0)+1}ae.stage_summary=ve};(ae=>{let re=(ae.workflows||[]).find(ce=>ce.id==="index_versions"),ve=re?.index_runtime;if(!ve||!Array.isArray(ve.months))return;let qe=(ae.file_timelines||[]).find(ce=>ce.key==="judgment");if(!qe||!Array.isArray(qe.months))return;let je=(re.progress?.stages||[]).find(ce=>ce.key==="validate"),v=["success","no_change"].includes(String(ve.run_status||""))||String(ve.run_status||"")!=="running"&&/alias\s*已切換/.test(String(je?.message||"")),R=String(ve.current?.month||""),z=new Map(qe.months.map(ce=>[String(ce.month),ce]));for(let ce of ve.months){let Me=z.get(String(ce.month||""));if(!Me)continue;let Je=Me.stages||(Me.stages={}),Be=String(ce.status||"");Be==="running"||String(ce.month)===R?(Je.qdrant="processing",Me.overall="processing"):Be==="success"&&Je.qdrant!=="complete"&&(Je.qdrant=v?"complete":"incomplete",Me.overall=v?"complete":"incomplete")}let ee={complete:0,incomplete:0,processing:0,empty:0,update:0};for(let ce of qe.months){let Me=String(ce.overall||"empty");ee[Me]=Number(ee[Me]||0)+1,ce.has_update&&(ee.update+=1)}qe.summary=ee})(c),D(c.import_timeline);for(let ae of c.workflows||[])ae.id==="judgment_import"&&D(ae.import_timeline);h.active_import&&(c.active_import=h.active_import),h.mode&&(c.mode=h.mode),h.generated_at&&(c.generated_at=h.generated_at);let ie=qn(c,b);ie!==$&&(cs(a,ie),$=ie);let Z=qa(c,b,et(),he);Z!==m&&(cs(s,Z),m=Z),B(),j(),H(),lt(c),De(c);let _e=s.querySelector("[data-processing-updated-at]");if(_e&&h.generated_at){let ae=$e(h.generated_at);_e.textContent!==ae&&(_e.textContent=ae)}},Ft=async({silent:h=!1}={})=>{if(!(o||l)){l=!0;try{let k=await K.processing();Ge(k,{silent:h})}catch(k){if(o)return;let D=Jc(k.message,c);D!==m&&(cs(s,D),m=D),h||C(k.message||"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B\u3002","danger",6e3)}finally{l=!1}}},Pa=async(h,k="")=>{if(u)return;u=!0,Ne(h,!0,"\u6AA2\u67E5\u4E2D\u2026");let D=Si[k]||"",de=String(h.dataset.sourceTypes||"").split(",").map(_e=>_e.trim()).filter(Boolean),ie=de.length?de:D?[D]:[],Z=h.dataset.stageId||"";Z&&(Rt.set(Z,{kind:"check",phase:"updating",startedAt:Date.now()}),xe());try{let _e=await K.checkUpdates(ie);if(_e&&_e.checking)Z&&(Rt.delete(Z),xe()),C("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u8ACB\u7A0D\u5F8C\u91CD\u65B0\u6574\u7406\u3002","info",6e3);else if(ie.length===1){let ae=(_e.sources||{})[ie[0]]||{},re=xi[k]||(ie[0]==="judgment"?"\u5224\u6C7A":ie[0]==="law"?"\u6CD5\u898F":ie[0]==="order"?"\u547D\u4EE4":"\u8CC7\u6599");ae.status==="error"?C(`${re}\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF1A${ae.message||"\u7121\u6CD5\u53D6\u5F97\u7DDA\u4E0A\u7248\u672C"}`,"danger",7e3):C(ae.update_available?`${re}\u7DDA\u4E0A\u5DF2\u6709\u66F4\u65B0\u7248\u672C\u3002`:`${re}\u7DDA\u4E0A\u5DF2\u662F\u6700\u65B0\u7248\u672C\u3002`,ae.update_available?"warn":"ok",6e3)}else if(ie.length>1){let ae=_e.sources||{},re=ie.filter(qe=>ae[qe]?.update_available),ve=ie.filter(qe=>ae[qe]?.status==="error");ve.length?C(`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF0C\u4F46\u6709 ${ve.length} \u9805\u6AA2\u67E5\u5931\u6557\u3002`,"danger",7e3):C(re.length?`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A${re.length} \u9805\u6709\u66F4\u65B0\u3002`:"\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D\u7686\u70BA\u6700\u65B0\u3002",re.length?"warn":"ok",6e3)}else{let ae=Number(_e.update_count)||0;C(ae>0?`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A${ae} \u9805\u6709\u66F4\u65B0\u3002`:"\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D\u7686\u70BA\u6700\u65B0\u3002",ae>0?"warn":"ok",6e3)}Z&&(Rt.set(Z,{kind:"check",phase:"updated",startedAt:Date.now()}),xe()),window.dispatchEvent(new CustomEvent("judgment:updates-changed")),await Ft({silent:!0})}catch(_e){Z&&(Rt.delete(Z),xe()),C(_e.message||"\u66F4\u65B0\u6AA2\u67E5\u5931\u6557\u3002","danger",7e3)}finally{u=!1,Ne(h,!1),c&&De(c)}},js=async h=>{let k=Si[h]||"";if(!k)return!0;let D=null;try{D=await K.checkUpdates([k])}catch(ie){return C(`\u7121\u6CD5\u5B8C\u6210\u7248\u672C\u6AA2\u67E5\uFF08${ie.message||"\u7DB2\u8DEF\u932F\u8AA4"}\uFF09\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002`,"warn",7e3),!0}if(!D||D.checking)return D&&D.checking&&C("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002","info",6e3),!0;let de=(D.sources||{})[k];if(!de)return!0;if(window.dispatchEvent(new CustomEvent("judgment:updates-changed")),de.status==="up_to_date"&&!de.update_available){let ie=xi[h]||"\u8CC7\u6599",Z=de.checked_at?`\uFF08${$e(de.checked_at)} \u6AA2\u67E5\uFF09`:"",_e=jc[h]||"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u55CE\uFF1F";return window.confirm(`${ie}\u7DDA\u4E0A\u6AA2\u67E5\u70BA\u6700\u65B0\u7248\u672C${Z}\u3002

${_e}`)}return de.status==="error"&&C("\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002","warn",6e3),!0},Ia=async(h,k)=>{if(u)return;u=!0;let D=(c?.workflows||[]).find(Z=>Z.id===k);fs=D?.active_run?.id||D?.last_run?.id||"",Ct=k,Ne(h,!0,"\u57F7\u884C\u4E2D"),xe();let de=h.dataset.stageId||"",ie=!1;try{if(!await js(k))return;de&&(Rt.set(de,{kind:"upgrade",phase:"upgrading",startedAt:Date.now()}),xe());let _e;try{_e=await K.startProcessingWorkflow(k)}catch(ae){throw de&&(Rt.delete(de),xe()),ae}ie=!0,C(`\u5DF2\u555F\u52D5\u300C${D?.label||k}\u300D\u6D41\u7A0B\u3002`,"ok",6e3),_e&&_e.run_id&&console.info("processing workflow started",_e),window.dispatchEvent(new CustomEvent("judgment:updates-changed")),Ft({silent:!0}),window.setTimeout(()=>{Ct===k&&(Ct="",fs="",Ft({silent:!0}))},15e3)}catch(Z){C(Z.message||"\u7121\u6CD5\u555F\u52D5\u5DE5\u4F5C\u6D41\u7A0B\u3002","danger",7e3)}finally{u=!1,(!ie||Ct!==k)&&(Ct="",fs="",c?(De(c),m="",xe()):Ne(h,!1))}},Xs=async h=>{if(!u){u=!0,Ne(h,!0,"\u505C\u6B62\u4E2D\u2026");try{let k=await K.stopProcessingUpdate();for(let[D,de]of Rt)de.kind==="upgrade"&&Rt.delete(D);xe(),C(k.message||"\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info",6e3)}catch(k){C(k.message||"\u7121\u6CD5\u505C\u6B62\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{u=!1,Ne(h,!1),c&&De(c)}}},Nt=h=>{let k=h.target.closest("[data-processing-action]");if(!k||k.disabled)return;k.closest(".processing-wf-rail")&&(h.preventDefault(),h.stopPropagation());let D=k.dataset.processingAction;if(D==="refresh")Ft({silent:!1});else if(D==="open-stage")O(k.dataset.stageId||"");else if(D==="refresh-judgment-months")Tt({quiet:!1});else if(D==="refresh-index-storage")Xt({quiet:!1,force:!0});else if(D==="refresh-court-check")x({quiet:!1,force:!0});else if(D==="refresh-law-version-check")L({quiet:!1,force:!0,button:k});else if(D==="refresh-ollama")nt({quiet:!1,button:k});else if(D==="refresh-embedding-models")nt({quiet:!1,button:k});else if(D==="select-embedding-model"){let de=k.dataset.hostId||"",ie=k.dataset.model||"";jt(`${de}|${ie}`)}else if(D==="move-ollama-host"){let de=E?.hosts||[],ie=de.findIndex(re=>Number(re.id)===Number(k.dataset.hostId)),Z=k.dataset.direction,_e=Z==="up"?ie-1:Z==="down"?ie+1:-1;if(ie<0||_e<0||_e>=de.length)return;let ae=de.map(re=>Number(re.id));[ae[ie],ae[_e]]=[ae[_e],ae[ie]],Xe(ae)}else if(D==="check-updates")Pa(k,k.dataset.workflowId||"");else if(D==="run-workflow"){let de=k.dataset.workflowId||"";Ia(k,de)}else D==="stop"&&Xs(k)},Ht=(h,{scroll:k=!1}={})=>{if(b=h||"overview",c){let D=qn(c,b);cs(a,D),$=D;let de=qa(c,b,et(),he);if(cs(s,de),m=de,B(),j(),H(),lt(c),G){let ie=N(G);ie?X(ie):Y()}k&&s.scrollIntoView({behavior:"smooth",block:"start"})}Mn.has(b)&&nt({quiet:!0}),b==="judgment_download"&&Tt({quiet:!0}),b==="index_versions"&&Xt({quiet:!0}),b==="normalize_courts"&&x({quiet:!0}),b==="backfill_law_articles"&&L({quiet:!0})},Ts=h=>{let k=h.target.closest("[data-processing-workflow]");k&&Ht(k.dataset.processingWorkflow||"overview")},Ns=h=>{let k=h.target.closest("[data-timeline-workflow]");k&&(h.preventDefault(),Ht(k.dataset.timelineWorkflow||"",{scroll:!0}))},Zs=h=>{let k=h.target.closest?.(".index-wf-stage[data-index-stage]");if(k&&s.contains(k)){let Z=k.dataset.indexStage||"";Z&&(k.open?Ln.add(Z):Ln.delete(Z));return}let D=h.target.closest?.(".workflow-wf-stage[data-workflow-wf-stage]");if(D&&s.contains(D)){let Z=D.dataset.workflowWfStage||"";Z&&(D.open?jn.add(Z):jn.delete(Z));return}let de=h.target.closest?.(".processing-wf-stage[data-processing-stage]");if(!de||!s.contains(de))return;let ie=de.dataset.processingStage||"";ie&&(de.open?he.add(ie):he.delete(ie))};return t.addEventListener("click",Nt),a.addEventListener("click",Ts),s.addEventListener("click",Ns),s.addEventListener("pointerover",ue),s.addEventListener("pointerout",Re),s.addEventListener("pointerdown",It),s.addEventListener("toggle",Zs,!0),window.addEventListener("scroll",Y,{capture:!0,passive:!0}),ot(),typeof EventSource>"u"&&await Ft({silent:!1}),()=>{o=!0,Ve(),t.removeEventListener("click",Nt),a.removeEventListener("click",Ts),s.removeEventListener("click",Ns),te(),s.removeEventListener("pointerover",ue),s.removeEventListener("pointerout",Re),s.removeEventListener("pointerdown",It),s.removeEventListener("toggle",Zs,!0),window.removeEventListener("scroll",Y,{capture:!0})}}var Fn={};Zt(Fn,{render:()=>ou});var In={draft:{label:"\u8349\u7A3F",badge:"badge-neutral"},pending_review:{label:"\u5F85\u5BE9",badge:"badge-warn"},changes_requested:{label:"\u9000\u56DE\u4FEE\u6539",badge:"badge-warn"},accepted:{label:"\u5DF2\u6838\u51C6",badge:"badge-ok"},rejected:{label:"\u5DF2\u62D2\u7D55",badge:"badge-danger"},retired:{label:"\u5DF2\u522A\u9664\uFF0F\u9000\u5F79",badge:"badge-neutral"}},Gt={law_concept:"\u6CD5\u898F\u6982\u5FF5",article_lookup:"\u6307\u5B9A\u689D\u6587",judgment_lookup:"\u5224\u6C7A\u6AA2\u7D22",structured:"\u7D50\u69CB\u5316\u554F\u984C",general:"\u4E00\u822C\u554F\u984C",refusal:"\u62D2\u7D55\u56DE\u7B54"},qs={easy:"\u7C21\u55AE",medium:"\u4E2D\u7B49",hard:"\u56F0\u96E3"},Bi={smoke:"Smoke",core:"Core",full:"Full",holdout:"Holdout"};function Ks(e){let t=In[e]||{label:e||"\u672A\u77E5",badge:"badge-neutral"};return`<span class="badge ${t.badge}">${r(t.label)}</span>`}function Dn(e){return String(e||"").split(`
`).map(t=>t.trim()).filter(Boolean)}function Md(e){return Dn(e).map(t=>{let[s,a]=t.split("|").map(n=>n.trim());return{law_name:s||"",source_type:a||""}})}function Ld(e){return Dn(e).map(t=>{let[s,a]=t.split("|").map(n=>n.trim());return{law_name:s||"",article_no:a||""}})}function jd(e){return Dn(e).map(t=>({jid:t.trim()}))}function Td(e){return(e?.expected_laws||[]).map(t=>[t.law_name,t.source_type].filter(Boolean).join("|")).join(`
`)}function Nd(e){return(e?.expected_articles||[]).map(t=>[t.law_name||t.law_key,t.article_no].filter(Boolean).join("|")).join(`
`)}function Ed(e){return(e?.expected_judgments||[]).map(t=>t.jid).join(`
`)}function Rd(e){return(e?.tags||[]).join(", ")}function Vs(e){return`<div class="qb-empty">${f("info",18)}<span>${r(e)}</span></div>`}function On(e){let t=(e.expected_laws||[]).map(i=>i.law_name).filter(Boolean),s=(e.expected_articles||[]).map(i=>`${i.law_name||""} ${i.article_no||""}`.trim()).filter(Boolean),a=(e.expected_judgments||[]).map(i=>i.jid).filter(Boolean),n=[...t.map(i=>`<span class="chip">${r(i)}</span>`),...s.map(i=>`<span class="chip">${r(i)}</span>`),...a.map(i=>`<span class="chip chip-mono">${r(i)}</span>`)];return n.length?`<div class="chips qb-labels">${n.join("")}</div>`:'<span class="qb-muted">\u5C1A\u672A\u6A19\u8A3B expected labels</span>'}function Bn(){return`<details class="qb-import">
    <summary>${f("upload",14)}JSON \u6279\u6B21\u532F\u5165</summary>
    <p class="qb-muted">\u683C\u5F0F\uFF1A<code>{"items":[{question, question_type, difficulty, expected_laws, expected_articles, expected_judgments, reference_answer, tags, rubric}]}</code>\u3002\u76F8\u540C\u984C\u76EE fingerprint \u9810\u8A2D\u66F4\u65B0\u3002</p>
    <textarea class="input" id="qb-import-json" rows="6" placeholder='{"items":[...]}'></textarea>
    <div class="qb-actions">
      <button class="btn btn-secondary btn-sm" type="button" data-qb-action="import-json">${f("upload",13)}<span>\u532F\u5165 JSON</span></button>
    </div>
  </details>`}function Cd(e){let t=e?.item||{},s=Array.isArray(e?.warnings)?e.warnings:[],a=Array.isArray(t.tags)?t.tags:[];return`<section class="report-card qb-card qb-ai-result">
    <div class="side-card-head">
      <span class="side-card-title">${f("sparkles",14)}Ollama \u5DF2\u5EFA\u7ACB\u984C\u76EE #${t.id}</span>
      ${Ks(t.status)}
    </div>
    <div class="qb-ai-answer">
      <strong>${r(t.question||"")}</strong>
      <div class="qb-ai-meta">
        ${r(Gt[t.question_type]||t.question_type||"")}
        \xB7 ${r(qs[t.difficulty]||t.difficulty||"")}
        \xB7 ${r(e?.model||"\u672C\u6A5F Ollama")}
      </div>
      ${On(t)}
      ${t.reference_answer?`<div class="qb-reference"><span class="summary-label">Ollama \u53C3\u8003\u7B54\u6848</span><p>${r(t.reference_answer)}</p></div>`:""}
      ${a.length?`<div class="chips">${a.map(n=>`<span class="chip">${r(n)}</span>`).join("")}</div>`:""}
      ${s.length?`<div class="qb-ai-warnings"><strong>\u9700\u8981\u6CE8\u610F</strong><ul>${s.map(n=>`<li>${r(n)}</li>`).join("")}</ul></div>`:""}
      <div class="qb-actions">
        <button class="btn btn-primary btn-sm" type="button" data-qb-action="review-ai-item">${f("shield",13)}<span>\u524D\u5F80\u9A57\u6536</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="reset-ai">${f("plus",13)}<span>\u518D\u65B0\u589E\u4E00\u984C</span></button>
      </div>
    </div>
    ${Bn()}
  </section>`}function Pd(e){return e.aiResult?Cd(e.aiResult):`<section class="report-card qb-card">
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
    ${Bn()}
  </section>`}function Id(e){return`<section class="report-card qb-card">
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
          <select class="select" name="question_type">${Object.entries(Gt).map(([t,s])=>`<option value="${t}" ${e?.question_type===t?"selected":""}>${s}</option>`).join("")}</select>
        </label>
        <label class="field"><span class="field-label">\u96E3\u5EA6</span>
          <select class="select" name="difficulty">${Object.entries(qs).map(([t,s])=>`<option value="${t}" ${e?.difficulty===t?"selected":""}>${s}</option>`).join("")}</select>
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
          <textarea class="input" name="expected_laws" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5&#10;\u9280\u884C\u6CD5|law">${r(Td(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u689D\u6587 <span class="field-tag">\u6CD5\u898F|\u7B2C 157-1 \u689D</span></span>
          <textarea class="input" name="expected_articles" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 157-1 \u689D&#10;\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 171 \u689D">${r(Nd(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u5224\u6C7A <span class="field-tag">jid\uFF0C\u6BCF\u884C\u4E00\u7B46</span></span>
          <textarea class="input" name="expected_judgments" rows="3" placeholder="TPDM,113,\u91D1\u8A34,27,20241128,1">${r(Ed(e))}</textarea>
        </label>
      </div>
      <label class="field"><span class="field-label">\u53C3\u8003\u7B54\u6848\uFF0Frubric \u8AAA\u660E</span>
        <textarea class="input" name="reference_answer" rows="4" placeholder="\u63D0\u4F9B\u7D66 LLM judge \u8207\u4EBA\u5DE5\u9A57\u6536\u53C3\u8003\uFF1B\u53EF\u7559\u7A7A\uFF0C\u4F46\u54C1\u8CEA\u8A55\u5206\u6703\u8F03\u5F31\u3002">${r(e?.reference_answer||"")}</textarea>
      </label>
      <div class="qb-form-grid">
        <label class="field"><span class="field-label">\u6A19\u7C64 <span class="field-tag">\u9017\u865F\u5206\u9694</span></span>
          <input class="input" name="tags" value="${r(Rd(e))}" placeholder="\u5167\u7DDA\u4EA4\u6613, \u8B49\u5238\u4EA4\u6613\u6CD5" />
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
    ${Bn()}
  </section>`}function Dd(e,t){return e?Id(e):Pd(t)}function Od(e){let t=e.status==="retired"||!!e.deleted_at;return`<article class="qb-item" data-qb-item="${e.id}">
    <div class="qb-item-head">
      <span class="qb-id">#${e.id}</span>
      <div class="qb-item-title">
        <strong>${r(e.question)}</strong>
        <span class="qb-meta">
          ${r(Gt[e.question_type]||e.question_type)}
          \xB7 ${r(qs[e.difficulty]||e.difficulty)}
          \xB7 v${e.version}
          ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
          ${e.benchmark_ready?' \xB7 <span class="qb-ready">Benchmark ready</span>':""}
        </span>
      </div>
      ${Ks(e.status)}
    </div>
    <div class="qb-fingerprint mono">fingerprint ${r(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${On(e)}
    <div class="qb-item-foot">
      <span>\u66F4\u65B0 ${r($e(e.updated_at))}</span>
      ${e.reviewed_by?`<span>\u5BE9\u6838 ${r(e.reviewed_by)}</span>`:""}
      ${e.review_comment?`<span class="qb-comment">${r(e.review_comment)}</span>`:""}
      <div class="qb-actions">
        ${t?`<button class="btn btn-primary btn-sm" type="button" data-qb-action="restore" data-id="${e.id}">${f("refresh",13)}<span>\u5FA9\u539F\u984C\u76EE</span></button>`:`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${f("edit",13)}<span>\u7DE8\u8F2F</span></button>
               ${["pending_review","changes_requested"].includes(e.status)?"":`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="submit-review" data-id="${e.id}">${f("upload",13)}<span>${e.status==="draft"?"\u9001\u5BE9":"\u91CD\u65B0\u9001\u5BE9"}</span></button>`}
               <button class="btn btn-secondary btn-sm" type="button" data-qb-action="review" data-id="${e.id}">${f("shield",13)}<span>\u9A57\u6536</span></button>
               <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${f("trash",13)}<span>\u522A\u9664</span></button>`}
      </div>
    </div>
  </article>`}function Bd(e){return`<section class="report-card qb-card">
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
        ${Object.entries(In).map(([t,s])=>`<option value="${t}" ${e.filters.status===t?"selected":""}>${s.label}</option>`).join("")}
      </select>
      <select class="select" name="question_type">
        <option value="">\u5168\u90E8\u984C\u578B</option>
        ${Object.entries(Gt).map(([t,s])=>`<option value="${t}" ${e.filters.question_type===t?"selected":""}>${s}</option>`).join("")}
      </select>
      <select class="select" name="difficulty">
        <option value="">\u5168\u90E8\u96E3\u5EA6</option>
        ${Object.entries(qs).map(([t,s])=>`<option value="${t}" ${e.filters.difficulty===t?"selected":""}>${s}</option>`).join("")}
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
      ${e.items.length?e.items.map(t=>Od(t)).join(""):Vs("\u76EE\u524D\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u984C\u76EE\u3002")}
    </div>
    <div class="qb-pagination">
      <span>\u5171 ${d(e.total)} \u984C</span>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="prev" ${e.offset<=0?"disabled":""}>\u4E0A\u4E00\u9801</button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="next" ${e.offset+e.limit>=e.total?"disabled":""}>\u4E0B\u4E00\u9801</button>
      </div>
    </div>
  </section>`}var Hi=[["queue","\u5F85\u5BE9\uFF0F\u9000\u56DE"],["accepted","\u5DF2\u6838\u51C6"],["rejected","\u5DF2\u62D2\u7D55"],["draft","\u8349\u7A3F"]];function Fd(e){let t=e.stats||{};return{queue:Number(t.pending_review||0)+Number(t.changes_requested||0),accepted:Number(t.accepted||0),rejected:Number(t.rejected||0),draft:Number(t.draft||0)}}function Hd(e,t){let s=e.reviewFilter||"queue",a={queue:{title:"\u76EE\u524D\u6C92\u6709\u5F85\u5BE9\u6216\u9000\u56DE\u4FEE\u6539\u7684\u984C\u76EE\u3002",text:t.accepted?`\u5DF2\u6709 ${d(t.accepted)} \u984C\u6838\u51C6\u3002\u65B0\u984C\u76EE\u5EFA\u7ACB\u5F8C\u6703\u81EA\u52D5\u9001\u5BE9\uFF0C\u4E5F\u53EF\u4EE5\u5207\u63DB\u5230\u300C\u5DF2\u6838\u51C6\u300D\u91CD\u65B0\u9A57\u6536\u65E2\u6709\u984C\u76EE\u3002`:"\u5EFA\u7ACB\u984C\u76EE\u5F8C\u6703\u9810\u8A2D\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\uFF1B\u82E5\u53EA\u60F3\u5148\u4FDD\u5B58\uFF0C\u5EFA\u7ACB\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5373\u53EF\u5B58\u6210\u8349\u7A3F\u3002"},accepted:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u6838\u51C6\u984C\u76EE\u3002",text:"\u984C\u76EE\u901A\u904E\u4EBA\u5DE5\u9A57\u6536\u5F8C\u6703\u5217\u5728\u9019\u88E1\uFF1B\u4E5F\u53EF\u4EE5\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u9001\u51FA\u9A57\u6536\u3002"},rejected:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u62D2\u7D55\u984C\u76EE\u3002",text:"\u88AB\u62D2\u7D55\u7684\u984C\u76EE\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u4E2D\uFF0C\u53EF\u4FEE\u6539\u5F8C\u91CD\u65B0\u9001\u5BE9\u3002"},draft:{title:"\u76EE\u524D\u6C92\u6709\u8349\u7A3F\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u984C\u76EE\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5C31\u6703\u5B58\u6210\u8349\u7A3F\uFF0C\u4E4B\u5F8C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002"}}[s]||{title:"\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u65B0\u984C\u76EE\u5F8C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"},n=[s!=="draft"?`<button class="btn btn-primary btn-sm" type="button" data-qb-action="new">${f("plus",13)}<span>\u65B0\u589E\u984C\u76EE</span></button>`:"",s==="queue"&&t.accepted?`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="review-filter" data-filter="accepted">${f("shield",13)}<span>\u67E5\u770B\u5DF2\u6838\u51C6 ${d(t.accepted)}</span></button>`:"",`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="go-manage">${f("database",13)}<span>\u524D\u5F80\u984C\u5EAB\u7BA1\u7406</span></button>`].filter(Boolean).join("");return`<div class="qb-empty qb-empty-block">
    <span class="qb-empty-icon">${f("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>${r(a.title)}</strong>
      <p>${r(a.text)}</p>
      <div class="qb-actions">${n}</div>
    </div>
  </div>`}function zd(e){let t=Hi.find(([s])=>s===e);return t?t[1]:"\u5F85\u5BE9\uFF0F\u9000\u56DE"}function Ud(e,t){return`<button class="qb-review-item${t?" is-active":""}" type="button" data-qb-action="select-review-item" data-id="${e.id}" aria-pressed="${t?"true":"false"}">
    <span class="qb-review-item-top">
      <span class="qb-id">#${e.id}</span>
      <span class="qb-review-item-meta">
        ${r(Gt[e.question_type]||e.question_type)}
        \xB7 ${r(qs[e.difficulty]||e.difficulty)}
        \xB7 v${e.version}
        ${e.benchmark_ready?" \xB7 Benchmark ready":""}
        ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
      </span>
      ${Ks(e.status)}
    </span>
    <strong>${r(e.question)}</strong>
  </button>`}function Qd(e){return`<article class="qb-review-pane-card">
    <div class="qb-review-pane-head">
      <div class="qb-review-pane-title">
        <span class="qb-review-item-meta">#${e.id} \xB7 v${e.version} \xB7 ${r(Gt[e.question_type]||e.question_type)} \xB7 ${r(qs[e.difficulty]||e.difficulty)}</span>
        <strong>${r(e.question)}</strong>
      </div>
      <div class="qb-review-pane-side">
        ${Ks(e.status)}
        <div class="qb-actions">
          <button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${f("edit",13)}<span>\u7DE8\u8F2F</span></button>
          <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${f("trash",13)}<span>\u522A\u9664</span></button>
        </div>
      </div>
    </div>
    <div class="qb-fingerprint mono">fingerprint ${r(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${On(e)}
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
    ${e.reviews?.length?`<div class="qb-review-history"><span class="summary-label">\u5BE9\u6838\u7D00\u9304</span>${e.reviews.map(t=>`<div class="qb-review-row"><span>${r(t.reviewer||"\u533F\u540D")}</span>${Ks(t.decision==="approved"?"accepted":t.decision)}<span>${r($e(t.created_at))}</span><p>${r(t.comment||"\u2014")}</p></div>`).join("")}</div>`:""}
  </article>`}function Gd(){return`<div class="qb-empty qb-empty-block qb-review-placeholder">
    <span class="qb-empty-icon">${f("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>\u5F9E\u5DE6\u5074\u9078\u64C7\u984C\u76EE</strong>
      <p>\u9EDE\u9078\u984C\u76EE\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u984C\u5E79\u3001\u9810\u671F\u6A19\u8A3B\u3001\u53C3\u8003\u7B54\u6848\u8207\u6838\u51C6\u9078\u9805\u3002</p>
    </div>
  </div>`}function Jd(e){let t=e.reviewDetail,s=Fd(e),a=e.reviewFilter||"queue",n=Hi.map(([l,u])=>`<button class="chip qb-review-tab${a===l?" is-active":""}" type="button" role="tab" aria-selected="${a===l?"true":"false"}" data-qb-action="review-filter" data-filter="${l}"><span>${u}</span><span class="qb-review-tab-count">${d(s[l]||0)}</span></button>`).join(""),i=e.reviewItems.length?e.reviewItems.map(l=>Ud(l,Number(t?.id)===Number(l.id))).join(""):`<div class="qb-empty qb-empty-compact">${f("info",16)}<span>\u76EE\u524D\u6C92\u6709${r(zd(a))}\u984C\u76EE\u3002</span></div>`,o=t?Qd(t):e.reviewItems.length?Gd():Hd(e,s);return`<section class="report-card qb-card qb-review-card">
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
  </section>`}function Ws(e){if(e==null||e==="")return"";let t=Number(e);return Number.isFinite(t)?`${Math.round(t*100)}%`:""}function Wd(e){if(!e||typeof e!="object")return"\u5F15\u7528";let t=String(e.jid||"").trim();if(t)return t;let s=String(e.law_name||"").trim(),a=String(e.article_no||"").trim(),n=`${s} ${a}`.trim();return n||String(e.title||e.text||"\u5F15\u7528").slice(0,80)}function Vd(e){let t=e?.metrics||{},s=t.scores||{},a=[["\u6CD5\u898F\u53EC\u56DE",Ws(t.law_recall)],["\u689D\u6587\u53EC\u56DE",Ws(t.article_recall)],["\u898F\u5247\u5206",Ws(s.deterministic)],["Judge",Ws(s.judge)],["\u4EBA\u5DE5",Ws(s.human)]].filter(([,n])=>n);return a.length?`<div class="qb-bank-stats">${a.map(([n,i])=>`<span class="qb-bank-stat"><span>${r(n)}</span><strong>${r(i)}</strong></span>`).join("")}</div>`:""}function Kd(e){let t=Array.isArray(e?.law_sources)?e.law_sources:[],s=Array.isArray(e?.citations)?e.citations:[],a=t.length?`<div class="qb-bank-sources">${t.map(i=>{let o=String(i.law_name||"\u672A\u547D\u540D\u6CD5\u898F"),l=(i.articles||[]).map(c=>String(c.article_no||"").trim()).filter(Boolean),u=`<strong>${r(o)}</strong>${l.length?`<small>${r(l.join("\u3001"))}</small>`:""}`;return i.law_url?`<a class="qb-bank-law" href="${r(i.law_url)}" target="_blank" rel="noreferrer">${u}</a>`:`<span class="qb-bank-law">${u}</span>`}).join("")}</div>`:"",n=s.length?`<div class="qb-bank-sources qb-bank-citations">${s.map(i=>`<span class="chip chip-mono">${r(Wd(i))}</span>`).join("")}</div>`:"";return!a&&!n?"":`<div class="qb-bank-answer-block">
    <div class="qb-bank-section-label"><span>\u5F15\u7528\u4F86\u6E90</span><span>${d(t.length+s.length)} \u7B46</span></div>
    ${a}${n}
  </div>`}function zi(e,t){if(!e)return`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${f("history",20)}</span>
      <strong>\u5C1A\u7121 RAG \u7B54\u6848</strong>
      <span>\u8DD1\u4E00\u6B21 Benchmark \u5F8C\uFF0C\u6700\u8FD1\u4E00\u6B21\u6210\u529F\u56DE\u7B54\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</span>
    </div>`;let s=Number(e.item_version||0),a=Number(t?.version||0),n=s&&a&&s!==a?`<span class="badge badge-warn">\u7B54\u6848 v${s} \xB7 \u984C\u76EE v${a}</span>`:"",i=e.answer_source==="llm"?"LLM \u751F\u6210":e.answer_source==="structured"?"\u6CD5\u898F\u8CC7\u6599\u5EAB":String(e.answer_source||"RAG");return`<div class="qb-bank-answer-meta">
      <span class="badge badge-ok"><span class="status-dot is-ok"></span>RAG \u5B8C\u6210</span>
      <span class="badge badge-neutral">${r(i)}</span>
      ${n}
      <span class="mono">${r(e.run_label||e.run_id||"")}</span>
      <span>${r($e(e.finished_at))}</span>
      <span>${r(fe(e.duration_ms))}</span>
      ${e.llm_model?`<span class="mono">${r(e.llm_model)}</span>`:""}
    </div>
    <div class="qb-bank-answer-block">
      <div class="qb-bank-section-label"><span>\u56DE\u7B54</span><span>${d(String(e.answer||"").length)} \u5B57</span></div>
      <p class="qb-bank-answer-text">${r(String(e.answer||"").trim()||"\uFF08\u7A7A\u767D\u56DE\u7B54\uFF09")}</p>
    </div>
    ${Kd(e)}
    ${Vd(e)}`}function Ui(e,t){let s=e.selectedSuiteId,a=t&&e.suiteAnswers?.[String(s)]?.[String(t.id)]||null;return t?`<div class="qb-bank-answer-head">
      <div class="qb-bank-answer-heading">
        <span class="qb-bank-answer-kicker">${f("sparkles",12)}RAG \u6700\u8FD1\u4E00\u6B21\u7B54\u6848</span>
        <strong class="qb-bank-answer-question">#${t.id} ${r(t.question)}</strong>
      </div>
      ${a?`<span class="qb-bank-answer-state">${r(Gt[t.question_type]||t.question_type)} \xB7 v${t.version}</span>`:""}
    </div>
    ${zi(a,t)}`:`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${f("cube",20)}</span>
      <strong>\u9078\u64C7\u984C\u76EE</strong>
      <span>\u5F9E\u5DE6\u5074\u6E05\u55AE\u9078\u64C7\u4E00\u984C\uFF0C\u67E5\u770B\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`}function Qi(e){return`<span class="qb-bank-actions">
    <button class="qb-bank-icon" type="button" data-qb-action="edit" data-id="${e.id}" title="\u7DE8\u8F2F\u984C\u76EE" aria-label="\u7DE8\u8F2F\u984C\u76EE #${e.id}">${f("edit",13)}</button>
    <button class="qb-bank-icon is-danger" type="button" data-qb-action="delete" data-id="${e.id}" title="\u5F9E\u984C\u5EAB\u79FB\u9664" aria-label="\u5F9E\u984C\u5EAB\u79FB\u9664 #${e.id}">${f("trash",13)}</button>
  </span>`}function Yd(e,t,{selected:s,hasAnswer:a}){return`<div class="qb-bank-row${s?" is-active":""}" data-id="${e.id}">
    <button class="qb-bank-select" type="button" data-qb-action="select-bank-item" data-id="${e.id}" aria-pressed="${s?"true":"false"}">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <span class="qb-bank-item-copy">
        <strong>${r(e.question)}</strong>
        <small>${r(Gt[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${a?"\u5DF2\u6709 RAG \u7B54\u6848":"\u5C1A\u7121 RAG \u7B54\u6848"}</small>
      </span>
    </button>
    ${Qi(e)}
  </div>`}function Xd(e,t,s){return`<article class="qb-bank-full-item" data-id="${e.id}">
    <div class="qb-bank-full-head">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <div class="qb-bank-full-title">
        <strong>${r(e.question)}</strong>
        <small>${r(Gt[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${r(In[e.status]?.label||e.status||"")}</small>
      </div>
      ${Qi(e)}
    </div>
    ${zi(s,e)}
  </article>`}function Fi(e){let t=e.editingSuite,s=Array.isArray(e.suites)?e.suites:[],a=s.find(p=>Number(p.id)===Number(e.selectedSuiteId))||s[0]||null,n=Array.isArray(a?.items)?a.items:[],i=e.suiteAnswers?.[String(a?.id)]||{},o=n.find(p=>Number(p.id)===Number(e.selectedBankItemId))||null,l=!!e.suiteAnswersLoading,u=String(e.suiteAnswersError||""),c=!!e.suiteManageOpen||!s.length,m=e.bankTab==="full"?"full":"split",$=s.length?`<div class="qb-bank-tabs" role="tablist" aria-label="Benchmark \u984C\u5EAB\u6AA2\u8996">
        <button class="qb-bank-tab${m==="split"?" is-active":""}" type="button" role="tab" aria-selected="${m==="split"?"true":"false"}" data-qb-action="bank-tab" data-tab="split">${f("grid",13)}<span>Benchmark \u984C\u5EAB</span><span class="badge badge-neutral">${d(n.length)}</span></button>
        <button class="qb-bank-tab${m==="full"?" is-active":""}" type="button" role="tab" aria-selected="${m==="full"?"true":"false"}" data-qb-action="bank-tab" data-tab="full">${f("table",13)}<span>\u984C\u5EAB\u5168\u5217\u8868</span><span class="badge badge-neutral">${d(n.length)}</span></button>
      </div>`:"",b="";if(!s.length)b=`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${f("cube",20)}</span>
      <strong>\u5C1A\u672A\u5EFA\u7ACB Benchmark \u984C\u5EAB</strong>
      <span>\u5C55\u958B\u4E0B\u65B9 Suite \u8A2D\u5B9A\u4E26\u5EFA\u7ACB\u984C\u5EAB\u5F8C\uFF0C\u5C31\u80FD\u5728\u9019\u88E1\u700F\u89BD\u984C\u76EE\u8207\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`;else if(l)b='<div class="qb-bank-loading"><span class="spinner" aria-hidden="true"></span><span>\u8B80\u53D6\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u4E2D\u2026</span></div>';else{let p=u?He({tone:"warn",title:"\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u8B80\u53D6\u5931\u6557",text:r(u)}):"";m==="full"?b=`${p}<div class="qb-bank-full" data-qb-bank-view="full">${n.length?n.map((g,y)=>Xd(g,y,i[String(g.id)]||null)).join(""):Vs("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>`:b=`${p}<div class="qb-bank-split" data-qb-bank-view="split">
        <div class="qb-bank-list" data-qb-bank-list>${n.length?n.map((g,y)=>Yd(g,y,{selected:Number(g.id)===Number(o?.id),hasAnswer:!!i[String(g.id)]})).join(""):Vs("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>
        <div class="qb-bank-answer-pane" data-qb-bank-answer>${Ui(e,o)}</div>
      </div>`}return`<section class="report-card qb-card qb-bank-card">
    <div class="side-card-head qb-bank-head">
      <div class="qb-bank-heading">
        <span class="side-card-title">${f("cube",14)}Benchmark \u984C\u5EAB</span>
        <span class="qb-bank-sub">${a?`${r(a.name)} \xB7 v${a.version} \xB7 ${d(a.item_count)} \u984C`:"\u5C1A\u672A\u5EFA\u7ACB suite"}</span>
      </div>
      <div class="qb-bank-controls">
        ${s.length?`<label class="qb-suite-picker"><span>Suite</span><select class="select" data-qb-suite-select aria-label="\u9078\u64C7 benchmark suite">${s.map(p=>`<option value="${p.id}" ${Number(p.id)===Number(a?.id)?"selected":""}>${r(p.name)} \xB7 ${d(p.item_count)} \u984C</option>`).join("")}</select></label>`:""}
        ${a?`<span class="badge ${a.status==="frozen"?"badge-ok":"badge-neutral"}">${a.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>`:""}
      </div>
    </div>
    ${$}
    ${b}
    <details class="qb-suite-manage" ${c?"open":""}>
      <summary>${f("sliders",14)}Suite \u8A2D\u5B9A\u8207\u7248\u672C <span class="qb-muted">${d(s.length)} \u500B suite \xB7 ${d(e.ready.length)} \u984C benchmark-ready</span></summary>
      <div class="qb-suite-manage-body">
        <form class="qb-suite-form" data-qb-form="suite">
          <input type="hidden" name="suite_id" value="${t?.id||""}" />
          <div class="qb-form-grid">
            <label class="field"><span class="field-label">Suite \u540D\u7A31</span><input class="input" name="name" required value="${r(t?.name||"Pilot 30")}" /></label>
            <label class="field"><span class="field-label">\u7B49\u7D1A</span><select class="select" name="tier">${Object.entries(Bi).map(([p,g])=>`<option value="${p}" ${t?.tier===p?"selected":""}>${g}</option>`).join("")}</select></label>
          </div>
          <label class="field"><span class="field-label">\u8AAA\u660E</span><input class="input" name="description" value="${r(t?.description||"30 \u984C pilot\uFF1B\u7528\u65BC RAG benchmark \u8207\u9577\u671F\u540C\u984C\u6BD4\u8F03\u3002")}" /></label>
          <div class="qb-check-list">
            ${e.ready.length?e.ready.map(p=>{let g=t?t.items?.some(y=>Number(y.id)===Number(p.id)):!0;return`<label class="qb-check-row"><input type="checkbox" name="item_ids" value="${p.id}" ${g?"checked":""}/><span><strong>#${p.id}</strong> ${r(p.question)} <small>${r(Gt[p.question_type]||p.question_type)}</small></span></label>`}).join(""):Vs("\u6C92\u6709\u5DF2\u9A57\u6536\u4E14 benchmark-ready \u7684\u984C\u76EE\uFF1B\u8ACB\u5148\u5B8C\u6210\u4EBA\u5DE5\u9A57\u6536\u3002")}
          </div>
          <div class="qb-actions">
            <button class="btn btn-primary" type="submit">${f("check",14)}<span>${t?"\u5132\u5B58 suite":"\u5EFA\u7ACB suite"}</span></button>
            ${t?'<button class="btn btn-secondary" type="button" data-qb-action="suite-new">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
          </div>
        </form>
        <div class="qb-list">
          ${s.length?s.map(p=>`<article class="qb-suite">
            <div class="qb-item-head">
              <div class="qb-item-title"><strong>${r(p.name)}</strong><span class="qb-meta">${r(Bi[p.tier]||p.tier)} \xB7 v${p.version} \xB7 ${d(p.item_count)} \u984C</span></div>
              <span class="badge ${p.status==="frozen"?"badge-ok":"badge-neutral"}">${p.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>
            </div>
            <div class="qb-suite-items">${(p.items||[]).slice(0,8).map(g=>`<span class="chip">#${g.id} ${r(g.question.slice(0,22))}${g.question.length>22?"\u2026":""}</span>`).join("")}${p.item_count>8?`<span class="qb-muted">+${p.item_count-8}</span>`:""}</div>
            <div class="qb-actions">
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-edit" data-id="${p.id}">${f("edit",13)}<span>\u7DE8\u8F2F suite</span></button>
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-freeze" data-id="${p.id}">${f("shield",13)}<span>\u51CD\u7D50</span></button>
              <button class="btn btn-ghost btn-sm" type="button" data-qb-action="suite-delete" data-id="${p.id}">${f("trash",13)}<span>\u522A\u9664</span></button>
            </div>
          </article>`).join(""):Vs("\u5C1A\u672A\u5EFA\u7ACB benchmark suite\u3002")}
        </div>
      </div>
    </details>
  </section>`}function Zd(e){let t={};for(let s of["clarity","labels","answer","difficulty","overall"]){let a=e.querySelector(`[name="score_${s}"]`),n=Number(a?.value);Number.isFinite(n)&&(t[s]=Math.max(1,Math.min(5,Math.round(n))))}return t}function eu(e){let t=new FormData(e);return{question:String(t.get("question")||"").trim(),question_type:String(t.get("question_type")||"general"),difficulty:String(t.get("difficulty")||"medium"),visibility:String(t.get("visibility")||"shared"),expected_laws:Md(t.get("expected_laws")),expected_articles:Ld(t.get("expected_articles")),expected_judgments:jd(t.get("expected_judgments")),reference_answer:String(t.get("reference_answer")||"").trim(),tags:String(t.get("tags")||"").split(",").map(s=>s.trim()).filter(Boolean),notes:String(t.get("notes")||"").trim(),rubric:{must_refuse:!!e.elements.must_refuse?.checked}}}function Gi(e,{onNavigate:t=null,onStats:s=null}={}){let a={create:"question-create",manage:"question-manage",suite:"benchmark-bank",review:"question-review"},n={tab:"",editing:null,editingFrom:"",editingSuite:null,aiQuestion:"",aiLoading:!1,aiResult:null,items:[],total:0,offset:0,limit:50,filters:{query:"",status:"",question_type:"",difficulty:"",tags:[]},stats:{},suites:[],ready:[],selectedSuiteId:null,selectedBankItemId:null,bankTab:"split",suiteAnswers:{},suiteAnswersLoading:!1,suiteAnswersError:"",suiteManageOpen:!1,reviewItems:[],reviewDetail:null,reviewFilter:"queue"},i=P=>e.querySelector(`#quality-panel-${a[P]}`),o=(P,B)=>{P&&(P.childElementCount?P.setAttribute("aria-busy","true"):P.innerHTML=`<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>${B}</span></div></section>`)},l=P=>{P?.removeAttribute("aria-busy")},u=0,c=null,m=()=>"anonymous",$=()=>{s&&s(n.stats)},b=P=>{t&&t(P),pe(P)},p=async()=>{try{n.stats=await K.questionBankStats()}catch{n.stats={}}$()},g=()=>{let P=i("create");P&&(P.innerHTML=Dd(n.editing,n))},y=(P,B)=>{let w=P?.querySelector("[data-qb-tag-results]");w&&(w.innerHTML=B.length?B.map(j=>`<button class="qb-tag-option" type="button" role="option" data-qb-action="select-tag" data-tag="${r(j.tag)}"><span>${r(j.tag)}</span><small>${d(j.count)}</small></button>`).join(""):'<div class="qb-tag-empty">\u6C92\u6709\u5176\u4ED6\u76F8\u7B26\u6A19\u7C64</div>')},_=async(P,B="")=>{if(!P)return;let w=P.querySelector("[data-qb-tag-results]"),j=++u;w&&(w.innerHTML='<div class="qb-tag-loading"><span class="spinner"></span><span>\u641C\u5C0B\u6A19\u7C64\u2026</span></div>');try{let W=await K.questionBankTags(B,12);if(j!==u)return;let H=(W.tags||[]).filter(Oe=>!n.filters.tags.includes(Oe.tag));y(P,H)}catch(W){if(j!==u)return;w&&(w.innerHTML=`<div class="qb-tag-empty">${r(W.message||"\u6A19\u7C64\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},q=(P,{focus:B=!1}={})=>{if(!P)return;let w=P.querySelector("[data-qb-tag-popover]"),j=P.querySelector("[data-qb-tag-search]");!w||!j||(w.hidden&&(w.hidden=!1,j.value="",_(P,"")),B&&(j.focus(),j.select()))},M=P=>{c&&(window.clearTimeout(c),c=null);let B=P?.querySelector("[data-qb-tag-popover]");B&&(B.hidden=!0)},A=async P=>{let B=String(P||"").trim();B&&(n.filters.tags.includes(B)?n.filters.tags=n.filters.tags.filter(w=>w!==B):n.filters.tags=[...n.filters.tags,B],n.offset=0,await S())},U=()=>{let P=Array.isArray(n.suites)?n.suites:[];if(!P.length)return n.selectedSuiteId=null,n.selectedBankItemId=null,null;let B=P.find(j=>Number(j.id)===Number(n.selectedSuiteId));B||(B=P[0],n.selectedSuiteId=B.id,n.selectedBankItemId=null);let w=Array.isArray(B.items)?B.items:[];return w.some(j=>Number(j.id)===Number(n.selectedBankItemId))||(n.selectedBankItemId=w[0]?.id??null),B},V=()=>{let P=i("suite");P&&(P.innerHTML=Fi(n))},J=0,ke=async(P,{force:B=!1}={})=>{if(!P)return;let w=++J;if(!B&&n.suiteAnswers[String(P)]){n.suiteAnswersLoading=!1,n.suiteAnswersError="",V();return}n.suiteAnswersLoading=!0,n.suiteAnswersError="",V();try{let j=await K.benchmarkSuiteLatestAnswers(P);if(w!==J)return;n.suiteAnswers[String(P)]=j.answers||{}}catch(j){if(w!==J)return;n.suiteAnswersError=j.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}finally{w===J&&(n.suiteAnswersLoading=!1,V())}},Se=async P=>{n.selectedSuiteId=P,n.selectedBankItemId=null,n.suiteAnswersError="";let B=U();if(!B){V();return}await ke(B.id)},F=P=>{n.bankTab=P==="full"?"full":"split",V()},T=()=>{let P=i("suite");if(!P)return;let B=U(),j=(Array.isArray(B?.items)?B.items:[]).find(H=>Number(H.id)===Number(n.selectedBankItemId))||null;for(let H of P.querySelectorAll(".qb-bank-row")){let Oe=Number(H.dataset.id)===Number(n.selectedBankItemId);H.classList.toggle("is-active",Oe);let Ce=H.querySelector("[data-qb-action='select-bank-item']");Ce&&Ce.setAttribute("aria-pressed",Oe?"true":"false")}let W=P.querySelector("[data-qb-bank-answer]");W&&(W.innerHTML=Ui(n,j))},S=async()=>{let P=i("manage");if(P){c&&(window.clearTimeout(c),c=null),o(P,"\u8B80\u53D6\u984C\u5EAB\u4E2D\u2026");try{let B=await K.questionBankItems({...n.filters,...n.filters.status==="retired"?{include_deleted:!0}:{}},n.limit,n.offset);n.items=B.items||[],n.total=Number(B.total||0),n.stats=B.stats||n.stats,l(P),P.innerHTML=Bd(n),$()}catch(B){l(P),P.innerHTML=`<section class="report-card qb-card">${He({tone:"danger",title:"\u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:r(B.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},E=async({refreshAnswers:P=!1}={})=>{let B=i("suite");if(B){o(B,"\u8B80\u53D6 benchmark \u984C\u5EAB\u4E2D\u2026");try{let[w,j]=await Promise.all([K.benchmarkSuites(),K.benchmarkReadyQuestions(300)]);n.suites=w.suites||[],n.ready=j.items||[];let W=U();if(n.suiteAnswersError="",n.suiteAnswersLoading=!1,W&&(P||!n.suiteAnswers[String(W.id)]))try{let H=await K.benchmarkSuiteLatestAnswers(W.id);n.suiteAnswers[String(W.id)]=H.answers||{}}catch(H){n.suiteAnswersError=H.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}l(B),B.innerHTML=Fi(n)}catch(w){l(B),B.innerHTML=`<section class="report-card qb-card">${He({tone:"danger",title:"Benchmark \u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:r(w.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},se=()=>{let P=i("review");P&&(P.innerHTML=Jd(n))},le=async P=>{let B=n.reviewItems.find(j=>Number(j.id)===Number(P));if(!B)return;n.reviewDetail=B,se();let w=i("review")?.querySelector(".qb-review-detail-pane");w&&window.matchMedia("(max-width: 1020px)").matches&&w.scrollIntoView({behavior:"smooth",block:"start"});try{let j=await K.questionBankItem(B.id);Number(n.reviewDetail?.id)===Number(B.id)&&(n.reviewDetail=j,se())}catch(j){C(j.message||"\u984C\u76EE\u5167\u5BB9\u8B80\u53D6\u5931\u6557\u3002","danger")}},Q=async()=>{let P=i("review");if(!P)return;o(P,"\u8B80\u53D6\u9A57\u6536\u984C\u76EE\u4E2D\u2026");let B=n.reviewFilter||"queue",w=B==="queue"?["pending_review","changes_requested"]:B==="accepted"?["accepted"]:B==="rejected"?["rejected"]:["draft"];try{let j=await Promise.all(w.map(Ce=>K.questionBankItems({status:Ce},200,0)));n.reviewItems=j.flatMap(Ce=>Ce.items||[]),n.stats=j[0]?.stats||n.stats;let W=Number(n.reviewDetail?.id||0),Oe=n.reviewItems.some(Ce=>Number(Ce.id)===W)?W:Number(n.reviewItems[0]?.id||0);n.reviewDetail=Oe?await K.questionBankItem(Oe):null,l(P),se(),$()}catch(j){l(P),P.innerHTML=`<section class="report-card qb-card">${He({tone:"danger",title:"\u9A57\u6536\u984C\u76EE\u8B80\u53D6\u5931\u6557",text:r(j.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}};function pe(P){let B=n.tab;n.tab=P;for(let w of Object.keys(a)){let j=i(w);j&&(j.hidden=w!==P)}P==="create"?(B!=="create"&&!n.editing&&(n.aiQuestion="",n.aiResult=null),g()):P==="manage"?S():P==="suite"?E():P==="review"&&Q()}let ye=P=>{let w=[...n.items,...n.reviewItems,...n.reviewDetail?[n.reviewDetail]:[]].find(W=>Number(W.id)===Number(P));n.reviewDetail=w||{id:Number(P)};let j=w?.status;["accepted","rejected","draft"].includes(j)?n.reviewFilter=j:j&&(n.reviewFilter="queue"),b("review")},I=async P=>{let B=eu(P),w=Number(P.elements.item_id?.value||0);w||(B.status=P.elements.submit_for_review?.checked?"pending_review":"draft");try{w?(await K.updateQuestionBankItem(w,{...B,change_note:"\u984C\u5EAB\u7BA1\u7406\u4FEE\u6539"}),C("\u5DF2\u5EFA\u7ACB\u65B0\u7248\u672C\uFF0C\u72C0\u614B\u56DE\u5230\u5F85\u5BE9\u3002","ok")):(await K.createQuestionBankItem(B),C(B.status==="draft"?"\u984C\u76EE\u5DF2\u5B58\u70BA\u8349\u7A3F\uFF0C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002":"\u984C\u76EE\u5DF2\u5EFA\u7ACB\u4E26\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok")),n.editing=null;let j=["manage","suite","review"].includes(n.editingFrom)?n.editingFrom:"manage";n.editingFrom="",n.suiteAnswers={},await p(),b(j)}catch(j){let W=j.detail||j.payload?.detail,H=W?.errors?.join(" \xB7 ")||W?.message||j.message||"\u984C\u76EE\u5132\u5B58\u5931\u6557\u3002";C(H,"danger",8e3)}},we=async P=>{let B=String(new FormData(P).get("question")||"").trim();if(B.length<4){C("\u984C\u76EE\u81F3\u5C11\u9700\u8981 4 \u500B\u5B57\u3002","danger");return}n.aiQuestion=B,n.aiLoading=!0,n.aiResult=null,g();try{let w=await K.createQuestionBankItemWithAI({question:B});n.aiResult=w,n.aiQuestion="",await p(),C(`Ollama \u5DF2\u5EFA\u7ACB\u984C\u76EE #${w.item.id}\uFF0C\u72C0\u614B\u70BA\u5F85\u5BE9\uFF0C\u8ACB\u4EBA\u5DE5\u8986\u6838\u3002`,"ok",8e3)}catch(w){let j=w.detail||w.payload?.detail,W=j?.errors?.join(" \xB7 ")||j?.message||w.message||"Ollama \u7522\u751F\u5931\u6557\u3002";C(W,"danger",12e3)}finally{n.aiLoading=!1,g()}},G=async(P,B)=>{let w=Number(P.dataset.id||0);if(w)try{await K.reviewQuestionBankItem(w,{decision:B,reviewer:m(),rubric_scores:Zd(P),comment:String(P.querySelector('[name="comment"]')?.value||"")}),C(B==="approved"?"\u984C\u76EE\u5DF2\u6838\u51C6\u3002":B==="changes_requested"?"\u5DF2\u9000\u56DE\u4FEE\u6539\u3002":"\u984C\u76EE\u5DF2\u62D2\u7D55\u3002",B==="approved"?"ok":"info"),await p(),await Q()}catch(j){let W=j.detail||j.payload?.detail,H=W?.errors?.join(" \xB7 ")||W?.message||j.message||"\u9A57\u6536\u5931\u6557\u3002";C(H,"danger",8e3)}},he=async P=>{let B=new FormData(P),w=Number(B.get("suite_id")||0),j=Array.from(P.querySelectorAll('input[name="item_ids"]:checked')).map(H=>Number(H.value)),W={name:String(B.get("name")||"").trim(),tier:String(B.get("tier")||"core"),description:String(B.get("description")||"").trim(),item_ids:j};try{w?(await K.updateBenchmarkSuite(w,W),C("Benchmark \u984C\u5EAB\u5DF2\u66F4\u65B0\u3002","ok")):(await K.createBenchmarkSuite(W),C("Benchmark \u984C\u5EAB\u5DF2\u5EFA\u7ACB\u3002","ok")),n.editingSuite=null,n.suiteManageOpen=!0,n.suiteAnswers={},await E()}catch(H){let Oe=H.detail||H.payload?.detail,Ce=Oe?.errors?.join(" \xB7 ")||Oe?.message||H.message||"Suite \u5132\u5B58\u5931\u6557\u3002";C(Ce,"danger",8e3)}},Te=async P=>{let B=e.querySelector("[data-qb-tag-filter] [data-qb-tag-popover]:not([hidden])")?.closest("[data-qb-tag-filter]");B&&!P.target.closest("[data-qb-tag-filter]")&&M(B);let w=P.target.closest("[data-qb-action]")?.dataset.qbAction;if(!w)return;let j=P.target.closest("[data-qb-action]"),W=Number(j.dataset.id||0);if(w==="open-tag-search"){let H=j.closest("[data-qb-tag-filter]");q(H,{focus:!0});return}if(w==="select-tag"){await A(j.dataset.tag);return}if(w==="remove-tag"){await A(j.dataset.tag);return}if(w==="bank-tab"){F(j.dataset.tab);return}if(w==="select-bank-item"){n.selectedBankItemId=W,T();return}if(w==="new"){n.editing=null,n.editingFrom="",n.aiQuestion="",n.aiResult=null,n.aiLoading=!1,b("create");return}if(w==="reset-create"){n.editing=null,g();return}if(w==="reset-ai"){n.aiQuestion="",n.aiResult=null,n.aiLoading=!1,g();return}if(w==="edit"){let H=n.suites.find(Pe=>Number(Pe.id)===Number(n.selectedSuiteId)),Ce=[...n.items,...n.reviewItems,...H?.items||[],...n.reviewDetail?[n.reviewDetail]:[]].find(Pe=>Number(Pe.id)===W);if(!Ce)return;n.editing=Ce,n.editingFrom=n.tab,b("create");return}if(w==="review"){ye(W);return}if(w==="review-ai-item"){let H=n.aiResult?.item;if(!H)return;n.reviewFilter="queue",n.reviewDetail=H,b("review");return}if(w==="review-filter"){let H=String(j.dataset.filter||"queue");n.reviewFilter=["queue","accepted","rejected","draft"].includes(H)?H:"queue",n.reviewDetail=null,await Q();return}if(w==="select-review-item"){await le(W);return}if(w==="go-manage"){b("manage");return}if(w==="submit-review"){try{await K.submitQuestionBankItemForReview(W),C("\u5DF2\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok"),await p(),n.tab==="manage"?await S():n.tab==="review"&&await Q()}catch(H){let Oe=H.detail||H.payload?.detail,Ce=Oe?.errors?.join(" \xB7 ")||Oe?.message||H.message||"\u9001\u5BE9\u5931\u6557\u3002";C(Ce,"danger",8e3)}return}if(w==="restore"){if(!window.confirm(`\u78BA\u5B9A\u5FA9\u539F\u984C\u76EE #${W}\uFF1F\u5FA9\u539F\u5F8C\u6703\u56DE\u5230\u5F85\u5BE9\u72C0\u614B\uFF0C\u9700\u91CD\u65B0\u9A57\u6536\u3002`))return;try{await K.restoreQuestionBankItem(W),C("\u984C\u76EE\u5DF2\u5FA9\u539F\u4E26\u56DE\u5230\u5F85\u5BE9\u3002","ok"),await p(),await S()}catch(H){let Oe=H.detail||H.payload?.detail,Ce=Oe?.errors?.join(" \xB7 ")||Oe?.message||H.message||"\u5FA9\u539F\u5931\u6557\u3002";C(Ce,"danger",8e3)}return}if(w==="delete"){if(n.tab==="suite"){let H=U();if(!H||!(H.items||[]).find(Ce=>Number(Ce.id)===W)||!window.confirm(`\u78BA\u5B9A\u5F9E\u300C${H.name}\u300D\u79FB\u9664\u984C\u76EE #${W}\uFF1F\u984C\u76EE\u4ECD\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u7BA1\u7406\u4E2D\u3002`))return;try{await K.removeBenchmarkSuiteItem(H.id,W),C("\u5DF2\u5F9E Benchmark \u984C\u5EAB\u79FB\u9664\u3002","info"),delete n.suiteAnswers[String(H.id)],Number(n.selectedBankItemId)===W&&(n.selectedBankItemId=null),await E()}catch(Ce){C(Ce.message||"\u79FB\u9664\u5931\u6557\u3002","danger")}return}if(!window.confirm(`\u78BA\u5B9A\u522A\u9664\u984C\u76EE #${W}\uFF1F\u984C\u76EE\u6703\u6A19\u8A18\u70BA retired\uFF0C\u6B77\u53F2 benchmark \u4ECD\u6703\u4FDD\u7559\u3002`))return;try{await K.deleteQuestionBankItem(W),C("\u984C\u76EE\u5DF2\u522A\u9664\u3002","info"),await p(),n.tab==="review"?(n.reviewDetail=null,await Q()):await S()}catch(H){C(H.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(w==="revalidate"){try{let H=await K.revalidateQuestionBank();C(`\u5DF2\u91CD\u65B0\u9A57\u8B49 ${d(H.checked||0)} \u984C\uFF0C${d(H.stale||0)} \u984C\u9700\u91CD\u65B0\u9A57\u6536\u3002`,"info",7e3),await p(),await S()}catch(H){C(H.message||"\u91CD\u65B0\u9A57\u8B49\u5931\u6557\u3002","danger")}return}if(w==="export"){try{let H=await K.exportQuestionBank({status:""});Ut(`judgment-question-bank-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(H,null,2),"application/json;charset=utf-8")}catch(H){C(H.message||"\u532F\u51FA\u5931\u6557\u3002","danger")}return}if(w==="import-json"){let H=e.querySelector("#qb-import-json");try{let Oe=JSON.parse(String(H?.value||"").trim()),Ce=await K.importQuestionBank(Oe);C(`\u532F\u5165\u5B8C\u6210\uFF1A\u65B0\u589E ${Ce.created}\u3001\u66F4\u65B0 ${Ce.updated}\u3001\u932F\u8AA4 ${(Ce.errors||[]).length}\u3002`,(Ce.errors||[]).length?"warn":"ok",8e3),H&&(H.value=""),await p(),await S()}catch(Oe){C(Oe.message||"JSON \u532F\u5165\u5931\u6557\u3002","danger",8e3)}return}if(w==="prev"||w==="next"){n.offset=Math.max(0,n.offset+(w==="next"?n.limit:-n.limit)),await S();return}if(w==="suite-edit"){let H=n.suites.find(Oe=>Number(Oe.id)===W);if(!H)return;n.editingSuite=H,n.suiteManageOpen=!0,E();return}if(w==="suite-new"){n.editingSuite=null,n.suiteManageOpen=!0,E();return}if(w==="suite-freeze"){try{await K.updateBenchmarkSuite(W,{freeze:!0}),C("Benchmark \u984C\u5EAB\u5DF2\u51CD\u7D50\u4E26\u5EFA\u7ACB\u65B0\u7248\u672C\u3002","ok"),n.editingSuite=null,n.suiteManageOpen=!0,await E()}catch(H){C(H.message||"\u51CD\u7D50\u5931\u6557\u3002","danger")}return}if(w==="suite-delete"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 benchmark \u984C\u5EAB #${W}\uFF1F\u6B77\u53F2 run \u4ECD\u6703\u4FDD\u7559 snapshot\u3002`))return;try{await K.deleteBenchmarkSuite(W),C("Benchmark \u984C\u5EAB\u5DF2\u522A\u9664\u3002","info"),n.editingSuite=null,n.suiteAnswers={},n.suiteManageOpen=!0,await E()}catch(H){C(H.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(w==="decide"){let H=j.closest("form[data-qb-form='review']");H&&await G(H,String(j.dataset.decision||""))}},ne=async P=>{let B=P.target.closest("[data-qb-form]");if(!B)return;P.preventDefault();let w=B.dataset.qbForm;if(w==="create")await I(B);else if(w==="ai-create")await we(B);else if(w==="filter"){let j=new FormData(B);n.filters={query:String(j.get("query")||"").trim(),status:String(j.get("status")||""),question_type:String(j.get("question_type")||""),difficulty:String(j.get("difficulty")||""),tags:j.getAll("tags").map(W=>String(W).trim()).filter(Boolean)},n.offset=0,await S()}else w==="suite"&&await he(B)},me=async P=>{let B=P.target.closest?.("form[data-qb-form='filter'] select");if(B){B.form.requestSubmit();return}let w=P.target.closest?.("[data-qb-suite-select]");if(!w)return;let j=Number(w.value||0);!j||j===Number(n.selectedSuiteId)||await Se(j)},ge=P=>{let B=P.target;B?.matches?.(".qb-suite-manage")&&(n.suiteManageOpen=!!B.open)},Le=P=>{let B=P.target.closest?.("[data-qb-action='open-tag-search']");B&&q(B.closest("[data-qb-tag-filter]"))},be=P=>{let B=P.target.closest?.("[data-qb-tag-filter]");B&&(P.relatedTarget&&B.contains(P.relatedTarget)||M(B))},Ee=P=>{let B=P.target.closest?.("[data-qb-tag-search]");if(!B)return;let w=B.closest("[data-qb-tag-filter]");c&&window.clearTimeout(c),c=window.setTimeout(()=>{_(w,B.value)},160)},Fe=P=>{let B=P.target.closest?.("[data-qb-tag-search]");if(!B)return;let w=B.closest("[data-qb-tag-filter]");P.key==="Escape"?(P.preventDefault(),M(w),B.blur()):P.key==="Enter"?(P.preventDefault(),w?.querySelector("[data-qb-action='select-tag']")?.click()):P.key==="ArrowDown"&&(P.preventDefault(),w?.querySelector("[data-qb-action='select-tag']")?.focus())};e.addEventListener("click",Te),e.addEventListener("submit",ne),e.addEventListener("change",me),e.addEventListener("toggle",ge,!0),e.addEventListener("mouseover",Le),e.addEventListener("mouseout",be),e.addEventListener("input",Ee),e.addEventListener("keydown",Fe);let et=async()=>{await p(),n.tab==="create"?g():n.tab==="manage"?await S():n.tab==="suite"?await E({refreshAnswers:!0}):n.tab==="review"&&await Q()};return p(),{show:pe,refresh:et,destroy(){c&&window.clearTimeout(c),e.removeEventListener("click",Te),e.removeEventListener("submit",ne),e.removeEventListener("change",me),e.removeEventListener("toggle",ge,!0),e.removeEventListener("mouseover",Le),e.removeEventListener("mouseout",be),e.removeEventListener("input",Ee),e.removeEventListener("keydown",Fe)},getStats:()=>n.stats}}function ja(e){if(e==null||e==="")return"\u2014";let t=Number(e);return Number.isFinite(t)?`${t.toFixed(t>=10?1:2)}%`:"\u2014"}function Ji(e){return e==null?"\u2014":d(e)}function tu(e){return e.count?e.severity==="danger"?Ye("failed","\u9700\u8655\u7406"):e.severity==="warn"?Ye("warning","\u6CE8\u610F"):Ye("preview","\u63D0\u793A"):Ye("success","\u901A\u904E")}function su(e){return e.count?e.severity==="danger"?"is-danger":e.severity==="warn"?"is-warn":"is-info":"is-ok"}function au(e){let t=Number(e.count)||0,s=Math.max(0,Math.min(100,Number(e.percent)||0));return`<div class="quality-check ${su(e)}">
    <div class="quality-check-head">
      <span class="quality-check-label">${r(e.label)}</span>
      ${tu(e)}
    </div>
    <div class="quality-check-value">
      <strong>${d(t)}</strong>
      <span>\u7B46</span>
      <em>${r(ja(e.percent))}</em>
    </div>
    <div class="quality-check-desc">${r(e.description)}</div>
    <div class="quality-check-track" aria-hidden="true">
      <span style="width:${s}%"></span>
    </div>
  </div>`}function La(e,t,s){let a=Array.isArray(s)?s:[];if(!a.length)return`<div class="index-chart-card">
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
  </div>`}function nu(e){let t=e.coverage||{},s=e.totals||{},a=e.source||{},n=t.postgres_diff,i=n==null?"\u2014":n===0?"\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u4E00\u81F4":`\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u76F8\u5DEE ${d(Math.abs(n))} \u7B46`,o=t.vector_indexed===null||t.vector_indexed===void 0?t.detail||"\u7121\u6CD5\u53D6\u5F97\u7D22\u5F15\u7D71\u8A08":`${d(t.vector_indexed)} / ${d(t.vector_total)} \xB7 ${t.model||"\u2014"}`;return`<div class="metric-grid quality-coverage-grid">
    <div class="metric-card">
      <div class="metric-label">${f("filter",13)}<span>\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D</span></div>
      <div class="metric-value">${d(s.matched_rows)}</div>
      <div class="metric-foot">citation_count &gt; 0\uFF1B\u5171 ${d(s.citation_total)} \u7B46\u5F15\u7528</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${f("database",13)}<span>PostgreSQL \u6536\u9304</span></div>
      <div class="metric-value">${Ji(t.postgres_judgments)}</div>
      <div class="metric-foot">${r(i)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${f("brain",13)}<span>\u5411\u91CF\u7D22\u5F15</span></div>
      <div class="metric-value">${r(ja(t.vector_coverage_pct))}</div>
      <div class="metric-foot">${r(o)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${f("layers",13)}<span>DuckDB \u5019\u9078</span></div>
      <div class="metric-value">${Ji(a.candidate_total)}</div>
      <div class="metric-foot">${d(a.candidate_archive_count)} / ${d(a.archive_count)} \u500B manifest \u6709 candidate_count</div>
    </div>
  </div>`}function ru(e){return e.length?`<div class="table-wrap">
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
              <td class="cell-number">${r(ja(t.match_rate))}</td>
              <td class="cell-number">${d(t.short_text_rows)}</td>
              <td class="cell-number">${d(s)}</td>
              <td class="cell-number">${d(t.duplicate_content_rows)}</td>
              <td class="cell-date">${r(zt(t.date_min))} \u2013 ${r(zt(t.date_max))}</td>
            </tr>`}).join("")}
      </tbody>
    </table>
  </div>`:pt({iconName:"table",title:"\u6C92\u6709\u539F\u59CB Parquet \u6A94\u6848",text:"\u5B8C\u6210\u5224\u6C7A RAR \u532F\u5165\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6BCF\u500B\u58D3\u7E2E\u6A94\u7684 DuckDB \u7D71\u8A08\u3002"})}function iu(e){let t=e.totals||{},s=e.source||{},a=Array.isArray(e.checks)?e.checks:[],n=e.summary||{},i=e.distributions||{},o=Array.isArray(e.warnings)?e.warnings:[],l=Ie(s.compressed_bytes||0);return`<div class="report-card quality-report" data-database="quality">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">DUCKDB DATA QUALITY</div>
        <div class="report-title">
          \u539F\u59CB Parquet \u8CC7\u6599\u54C1\u8CEA ${Ye(e.status||"operational")}
          <span class="chip">raw.parquet</span>
        </div>
        <div class="report-sub">
          ${d(t.rows)} \u7B46 \xB7 ${d(s.raw_files)} \u500B\u6A94\u6848 \xB7
          ${l} \xB7 \u6383\u63CF ${fe(e.scan_ms||0)} \xB7
          ${r($e(e.generated_at))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-quality">
          ${f("download",14)}<span>JSON</span>
        </button>
      </div>
    </div>
    ${o.length?`<div class="report-alert">${He({tone:"warn",title:"\u76EE\u524D\u9650\u5236\u8207\u5DEE\u7570",text:o.map(u=>r(u)).join("<br>")})}</div>`:""}
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
        <div class="summary-value">${r(ja(t.match_rate))}</div>
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
      <div class="quality-checks">${a.map(au).join("")}</div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6536\u9304\u8986\u84CB</span>
        <span class="muted" style="font-size:9.5px">PostgreSQL \u8207\u5411\u91CF\u7D22\u5F15\u70BA\u5373\u6642\u67E5\u8A62\uFF0C\u4E0D\u662F\u5F9E Parquet \u63A8\u4F30</span>
      </div>
      ${nu(e)}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6A94\u6848\u660E\u7D30</span>
        <span class="muted" style="font-size:9.5px">${d(s.archive_count)} \u500B\u539F\u59CB Parquet</span>
      </div>
      ${ru(Array.isArray(e.archives)?e.archives:[])}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u5206\u5E03\u7D71\u8A08</span>
        <span class="muted" style="font-size:9.5px">DuckDB group by / unnest</span>
      </div>
      <div class="quality-dist-grid">
        ${La("\u6CD5\u9662","\u5224\u6C7A\u7B46\u6578",i.courts)}
        ${La("\u88C1\u5224\u5E74\u4EFD","\u5224\u6C7A\u7B46\u6578",i.years)}
        ${La("\u71B1\u9580\u6CD5\u898F","\u63D0\u53CA\u5224\u6C7A\u6578",i.laws)}
        ${La("\u71B1\u9580\u6848\u7531","\u5224\u6C7A\u7B46\u6578",i.titles)}
      </div>
    </div>
  </div>`}async function ou(e){e.innerHTML=`<section class="page data-page quality-page">
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
  </section>`;let t=e.querySelector("#quality-content"),s=e.querySelector("#quality-refresh"),a=e.querySelector("#quality-meta"),n=[...e.querySelectorAll("[data-quality-tab]")],i={overview:e.querySelector("#quality-panel-overview"),create:e.querySelector("#quality-panel-question-create"),manage:e.querySelector("#quality-panel-question-manage"),suite:e.querySelector("#quality-panel-benchmark-bank"),review:e.querySelector("#quality-panel-question-review")},o=null,l="overview",u=()=>{if(!o)return;t.innerHTML=iu(o),a.textContent=`DUCKDB \xB7 ${d(o.totals?.rows)} \u7B46 \xB7 ${fe(o.scan_ms||0)}`;let g=e.querySelector("#quality-badge-overview");g&&(g.textContent=d(o.totals?.rows||0))},c=g=>{l=g==="overview"?"overview":g;for(let y of n){let _=y.dataset.qualityTab===l;y.classList.toggle("is-active",_),_?y.setAttribute("aria-current","page"):y.removeAttribute("aria-current")}for(let[y,_]of Object.entries(i))_&&(_.hidden=y!==l);l!=="overview"?a.textContent="QUESTION BANK \xB7 \u984C\u5EAB\u5DE5\u4F5C\u5340":o&&u()},m=Gi(e,{onNavigate:g=>c(g),onStats:g=>{let y=g||{},_=e.querySelector("#quality-badge-manage"),q=e.querySelector("#quality-badge-suite"),M=e.querySelector("#quality-badge-review");_&&(_.textContent=d(y.total||0)),q&&(q.textContent=d(y.benchmark_ready||0)),M&&(M.textContent=d((y.pending_review||0)+(y.changes_requested||0)))}}),$=g=>{c(g),g!=="overview"&&m.show(g)},b=async()=>{Ne(s,!0,"\u6383\u63CF\u4E2D\u2026");try{o=await K.quality(),u()}catch(g){t.innerHTML=`<div class="report-card">
        <div class="report-head">
          <div class="report-title-group">
            <div class="report-kicker">DUCKDB DATA QUALITY</div>
            <div class="report-title">\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557</div>
            <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
          </div>
        </div>
        <div class="report-section">
          ${He({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u54C1\u8CEA\u7D71\u8A08",text:r(g.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
        </div>
      </div>`,a.textContent="DUCKDB \xB7 \u8B80\u53D6\u5931\u6557",C("\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}finally{Ne(s,!1)}},p=async()=>{l==="overview"?await b():await m.refresh()};s.addEventListener("click",p),e.addEventListener("click",g=>{let y=g.target.closest("[data-quality-tab]");y&&$(y.dataset.qualityTab||"overview")}),t.addEventListener("click",g=>{!g.target.closest("[data-action='export-quality']")||!o||Ut(`judgment-quality-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(o,null,2),"application/json;charset=utf-8")}),c("overview"),await b()}var Un={};Zt(Un,{render:()=>Hu});var Ta={};Zt(Ta,{render:()=>Hn});var Wi={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"};function Vi(e,t){let s=Array.isArray(t)?t:[];return`<div class="tests-model-group">
    <span class="tests-model-label">${r(e)}</span>
    <div class="tests-model-chips">${s.length?s.map(a=>`<span class="chip chip-mono">${r(a)}</span>`).join(""):'<span class="tests-model-empty">\u672A\u5075\u6E2C\u5230\u6A21\u578B</span>'}</div>
  </div>`}function lu(e){let t=e?.supports_chat,s=t===!0?"badge-ok":t===!1?"badge-danger":"badge-neutral",a=t===!0?"\u652F\u63F4 chat":t===!1?"\u4E0D\u652F\u63F4 chat":"\u672A\u6E2C\u8A66",n=(Array.isArray(e?.capabilities)?e.capabilities:[]).map(i=>`<span class="chip chip-mono">${r(i)}</span>`).join("");return`<div class="tests-llm-row">
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
  </div>`}function cu(e){let t=Array.isArray(e?.models)?e.models:[],s=e?.counts||{},a=Array.isArray(e?.failures)?e.failures:[];return{summary:e?`<span>Ollama <strong>${s.available??t.length}</strong> \u500B\u6A21\u578B</span>
      <span>\u652F\u63F4 chat <strong>${s.chat??0}</strong></span>
      <span>\u4E0D\u652F\u63F4 <strong>${s.unsupported??0}</strong></span>
      <span>\u672A\u6E2C\u8A66 <strong>${s.untested??0}</strong></span>
      <span>\u672C\u6B21\u65B0\u6E2C <strong>${(e.tested_now||[]).length}</strong></span>
      <span class="muted">${r(e.detail||"")}</span>`:"<span>\u6B63\u5728\u8B80\u53D6 Ollama \u6A21\u578B\u6E05\u55AE\u2026</span>",list:t.length?t.map(lu).join(""):'<div class="tests-llm-empty">\u5C1A\u7121\u6A21\u578B\u8CC7\u6599\uFF1B\u8ACB\u78BA\u8A8D Ollama \u5DF2\u555F\u52D5\u4E26\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66\u3002</div>',failures:a.length?`<div class="tests-llm-failures">${a.map(i=>`<span><strong class="mono">${r(i.model||"\u2014")}</strong> ${r(i.detail||"\u6E2C\u8A66\u5931\u6557")}</span>`).join("")}</div>`:""}}function du(e){let t=String(e?.status||"degraded"),s=t==="operational"?"badge-ok":t==="disabled"?"badge-neutral":"badge-danger",a=Array.isArray(e?.scores)?e.scores.slice(0,4):[],n=Array.isArray(e?.results)?e.results[0]:null;return`<div class="tests-llm-row">
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
  </div>`}function uu(e){if(!e)return{summary:"<span>\u6B63\u5728\u8B80\u53D6 reranker \u72C0\u614B\u2026</span>",list:"",failures:""};let t=Array.isArray(e.providers)?e.providers:[],s=e.active||{},a=String(e.status||"degraded"),n=a==="operational"?"badge-ok":a==="not_configured"?"badge-neutral":"badge-danger",i=t.flatMap(o=>(o.errors||[]).map(l=>({model:o.url,detail:l})));return{summary:`<span>\u72C0\u614B <span class="badge ${n}">${r(a)}</span></span>
      <span>\u6A21\u578B <strong>${r(e.model||"\u2014")}</strong></span>
      <span>\u555F\u7528 <strong>${e.enabled?"true":"false"}</strong></span>
      ${s.url?`<span>\u4F5C\u7528\u4E2D <strong class="mono">${r(s.url)}</strong></span>`:""}
      <span class="muted">${r(e.detail||"")}</span>`,list:t.length?t.map(du).join(""):'<div class="tests-llm-empty">\u6C92\u6709\u8A2D\u5B9A RERANK_URL\uFF1B\u8ACB\u8A2D\u5B9A primary \u6216 fallback reranker\u3002</div>',failures:i.length?`<div class="tests-llm-failures">${i.map(o=>`<span><strong class="mono">${r(o.model||"\u2014")}</strong> ${r(o.detail||"\u6E2C\u8A66\u5931\u6557")}</span>`).join("")}</div>`:""}}function pu(e,t,s){return JSON.stringify({selected:s,runs:(t||[]).map(a=>`${a.run_id}:${a.status}`),run:e?{run_id:e.run_id,status:e.status,progress:e.progress,total_ms:e.total_ms,steps:(e.steps||[]).map(a=>`${a.stage}:${a.model}:${a.status}:${a.progress}:${a.duration_ms}`)}:null})}async function Hn(e,t,{embedded:s=!1}={}){let a=!1,n=!1,i={embedding:[],llm:[]},o=!1,l=null,u=!1,c=null,m=!1,$=null,b=[],p="",g=null,y="",_=`<div class="page-actions">
      <span class="badge badge-neutral badge-mono" id="tests-mode-badge">\u8B80\u53D6\u4E2D</span>
      <button class="btn btn-secondary" type="button" id="tests-refresh">
        ${f("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
      </button>
    </div>`,q=s?`<div class="tests-embed-head">
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
    ${q}

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
  </section>`;let M=e.querySelector("#tests-mode-badge"),A=e.querySelector("#tests-mode-toggle"),U=e.querySelector("#tests-mode-summary"),V=e.querySelector("#tests-mode-models"),J=e.querySelector("#tests-mode-status"),ke=e.querySelector("#tests-api-form"),Se=e.querySelector("#tests-api-input"),F=e.querySelector("#tests-api-preview"),T=e.querySelector("#tests-api-status"),S=e.querySelector("#tests-api-note"),E=e.querySelector("#tests-api-test"),se=e.querySelector("#tests-api-reset"),le=e.querySelector("#tests-api-save"),Q=e.querySelector("#tests-refresh"),pe=e.querySelector("#tests-flow"),ye=e.querySelector("#tests-llm-summary"),I=e.querySelector("#tests-llm-list"),we=e.querySelector("#tests-llm-failures"),G=e.querySelector("#tests-llm-status"),he=e.querySelector("#tests-llm-test"),Te=e.querySelector("#tests-rerank-summary"),ne=e.querySelector("#tests-rerank-list"),me=e.querySelector("#tests-rerank-failures"),ge=e.querySelector("#tests-rerank-status"),Le=e.querySelector("#tests-rerank-test"),be=(te,Ae,We="")=>{te&&(te.textContent=Ae,te.className=`tests-status${We?` is-${We}`:""}`)},Ee=(te,Ae="")=>{T&&(T.textContent=te,T.className=`api-dialog-status${Ae?` is-${Ae}`:""}`)},Fe=()=>ss()==="query",et=()=>{let te=es(Se.value);return te||(window.location.protocol==="file:"?Ba:"")},P=()=>{let te=et(),Ae=ts(),We=Wi[ss()]||ss()||"\u540C\u6E90";F.innerHTML=`\u76EE\u524D\u751F\u6548\uFF1A<strong>${r(as(Ae))}</strong>${Ae?`\uFF08${r(We)}\uFF09`:""}<br />\u6B64\u4F4D\u5740\u7684\u5065\u5EB7\u6AA2\u67E5\uFF1A${r(St("/api/health",te))}`},B=()=>{let te=ss(),Ae=`\u76EE\u524D\u4F86\u6E90\uFF1A${Wi[te]||te||"\u540C\u6E90"}\u3002\u512A\u5148\u9806\u5E8F\u70BA ?api= \u2192 \u700F\u89BD\u5668\u5132\u5B58\u503C \u2192 config.js \u2192 \u540C\u6E90\u3002`,We="";te==="query"?(We="is-warn",Ae="\u6B64\u9801\u7531\u7DB2\u5740\u7684 ?api= \u53C3\u6578\u6307\u5B9A\u5F8C\u7AEF\u4F4D\u5740\uFF0C\u5177\u6709\u6700\u9AD8\u512A\u5148\u9806\u5E8F\u3002\u5132\u5B58\u6216\u6062\u5FA9\u9810\u8A2D\u5728\u6B64\u9801\u4E0D\u6703\u751F\u6548\uFF1B\u8ACB\u5148\u79FB\u9664\u7DB2\u5740\u4E2D\u7684 api \u53C3\u6578\u3002"):ea()?(We="is-warn",Ae="\u6B64\u9801\u4E0D\u662F\u5F9E localhost \u958B\u555F\uFF0C\u4E14\u5C1A\u672A\u8A2D\u5B9A\u5F8C\u7AEF API\u3002\u8ACB\u586B\u5165 cloudflared \u7684 https:// \u4F4D\u5740\uFF0C\u6216\u90E8\u7F72\u6642\u5728 config.js \u6307\u5B9A apiBase\uFF1BHTTP \u4F4D\u5740\u6703\u88AB HTTPS \u9801\u9762\u963B\u64CB\u3002"):(te==="file-default"||window.location.protocol==="file:")&&(Ae="\u4EE5 file:// \u76F4\u63A5\u958B\u555F\u6642\uFF0C\u9810\u8A2D\u9023\u5230 http://127.0.0.1:9200\u3002\u82E5\u5F8C\u7AEF\u4F7F\u7528\u5176\u4ED6\u9023\u63A5\u57E0\uFF0C\u8ACB\u5728\u6B64\u4FEE\u6539\u4E26\u5132\u5B58\u3002"),S.textContent=Ae,S.className=`api-dialog-note${We?` ${We}`:""}`;let Ze=te==="query";le.disabled=Ze,se.disabled=Ze,Se.readOnly=Ze},w=()=>{if(!Fa(Se.value))return Ee("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002","error"),Se.focus(),null;let te=et();return window.location.protocol==="https:"&&/^http:\/\//i.test(te)&&!/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(te)?(Ee("HTTPS \u9801\u9762\u7121\u6CD5\u9023\u7DDA\u5230 HTTP API\uFF08mixed content\uFF09\u3002\u8ACB\u6539\u7528 cloudflared \u63D0\u4F9B\u7684 https:// \u4F4D\u5740\u3002","error"),Se.focus(),null):te},j=()=>{Se.value=ts(),P(),B(),Ee("\u53EF\u5148\u6E2C\u8A66\u9023\u7DDA\uFF0C\u5132\u5B58\u5F8C\u9801\u9762\u6703\u91CD\u65B0\u8F09\u5165\u3002")},W=()=>{let te=Array.isArray(i.embedding)?i.embedding.length:0,Ae=Array.isArray(i.llm)?i.llm.length:0;if(M&&(M.textContent=o?"\u5207\u63DB\u4E2D\u2026":n?"\u6E2C\u8A66\u6A21\u5F0F ON":"\u6E2C\u8A66\u6A21\u5F0F OFF",M.className=`badge badge-mono ${o?"badge-info":n?"badge-warn":"badge-neutral"}`),A){A.disabled=o,A.classList.toggle("is-on",n),A.classList.toggle("is-off",!n&&!o),A.classList.toggle("is-busy",o),A.setAttribute("aria-checked",n?"true":"false"),A.setAttribute("aria-busy",o?"true":"false"),A.setAttribute("aria-label",o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F":n?"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF0C\u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\uFF0C\u9EDE\u64CA\u958B\u555F"),A.title=o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F\u2026":n?"\u6E2C\u8A66\u6A21\u5F0F ON \xB7 \u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F OFF \xB7 \u9EDE\u64CA\u958B\u555F";let We=A.querySelector(".header-power-label");We&&(We.textContent=o?"\u2026":n?"ON":"OFF")}U&&(U.textContent=n?`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${te} \u500B embedding \u8207 ${Ae} \u500B LLM \u6A21\u578B\u3002`:"\u76EE\u524D\u4F7F\u7528\u5FEB\u901F\u6A21\u5F0F\uFF1A\u55AE\u4E00 embedding \u8207 LLM\u3002"),V&&(V.innerHTML=Vi("Embedding",i.embedding)+Vi("LLM",i.llm))},H=async()=>{try{let te=await K.testMode();if(a)return;n=!!te.enabled,i=te.models||{embedding:[],llm:[]},be(J,"")}catch(te){if(a)return;n=!1,i={embedding:[],llm:[]},be(J,te.message||"\u7121\u6CD5\u8B80\u53D6\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF API\u3002","error")}a||W()},Oe=async()=>{if(o)return;let te=!n;o=!0,W(),be(J,te?"\u6B63\u5728\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u2026":"\u6B63\u5728\u95DC\u9589\u6E2C\u8A66\u6A21\u5F0F\u2026");try{let Ae=await K.setTestMode(te);if(a)return;n=!!Ae.enabled,i=Ae.models||{embedding:[],llm:[]},window.dispatchEvent(new CustomEvent("judgment:test-mode",{detail:{enabled:n,models:i}}));let We=i.embedding?.length||0,Ze=i.llm?.length||0;be(J,n?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A\u4E0B\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C ${We} \u500B embedding \u8207 ${Ze} \u500B LLM \u6A21\u578B\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","ok"),C(n?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A${We} \u500B embedding\u3001${Ze} \u500B LLM\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002",n?"ok":"info",6e3),await Xe()}catch(Ae){a||(be(J,Ae.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","error"),C(Ae.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","danger",6e3))}finally{o=!1,a||W()}},Ce=()=>{let te=cu(l);if(ye&&(ye.innerHTML=te.summary),I&&(I.innerHTML=te.list),we&&(we.innerHTML=te.failures),he){he.disabled=u,he.setAttribute("aria-busy",u?"true":"false");let Ae=he.querySelector("span");Ae&&(Ae.textContent=u?"\u6E2C\u8A66\u4E2D\u2026":"\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66")}},Pe=async()=>{try{let te=await K.llmModels();if(a)return;l=te,be(G,"")}catch(te){if(a)return;l=null,be(G,te.message||"\u7121\u6CD5\u8B80\u53D6 Ollama \u6A21\u578B\u6E05\u55AE\u3002","error")}a||Ce()},st=async()=>{if(!u){u=!0,Ce(),be(G,"\u6B63\u5728\u6AA2\u67E5 Ollama \u6A21\u578B\u8207 chat \u80FD\u529B\u2026");try{let te=await K.testLlmModels();if(a)return;l=te;let Ae=te.tested_now?.length||0,We=te.chat_models?.length||0,Ze=te.failures?.length||0;be(G,`${Ae?`\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u672C\u6B21\u65B0\u6E2C ${Ae} \u500B\u6A21\u578B`:"\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u6C92\u6709\u65B0\u6A21\u578B"}\uFF0C\u76EE\u524D ${We} \u500B\u6A21\u578B\u652F\u63F4 chat${Ze?`\uFF1B${Ze} \u500B\u6A21\u578B\u66AB\u6642\u7121\u6CD5\u5224\u5B9A\uFF0C\u4E0B\u6B21\u6703\u91CD\u8A66`:""}\u3002`,Ze?"warn":"ok"),C(Ae?`LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u65B0\u589E ${Ae} \u7B46\u80FD\u529B\u7D00\u9304\u3002`:"LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u6C92\u6709\u65B0\u6A21\u578B\u9700\u8981\u6E2C\u8A66\u3002",Ze?"warn":"ok",5e3),await H()}catch(te){a||(be(G,te.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","error"),C(te.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","danger",6e3))}finally{u=!1,a||Ce()}}},lt=()=>{let te=uu(c);if(Te&&(Te.innerHTML=te.summary),ne&&(ne.innerHTML=te.list),me&&(me.innerHTML=te.failures),Le){Le.disabled=m,Le.setAttribute("aria-busy",m?"true":"false");let Ae=Le.querySelector("span");Ae&&(Ae.textContent=m?"\u6E2C\u8A66\u4E2D\u2026":"\u57F7\u884C Reranker \u670D\u52D9\u6E2C\u8A66")}},ot=async()=>{try{let te=await K.rerankStatus();if(a)return;c=te,be(ge,"")}catch(te){if(a)return;c=null,be(ge,te.message||"\u7121\u6CD5\u8B80\u53D6 reranker \u72C0\u614B\u3002","error")}a||lt()},Ve=async()=>{if(!m){m=!0,lt(),be(ge,"\u6B63\u5728\u5C0D primary\uFF0Ffallback reranker \u57F7\u884C\u5BE6\u969B rerank \u6E2C\u8A66\u2026");try{let te=await K.testReranker();if(a)return;c=te;let Ae=Array.isArray(te.providers)?te.providers:[],We=Ae.filter(It=>It.status==="operational").length,Ze=Ae.reduce((It,Tt)=>It+(Array.isArray(Tt.errors)?Tt.errors.length:0),0);be(ge,Ze?`Reranker \u6E2C\u8A66\u5B8C\u6210\uFF1A${We} \u500B\u7AEF\u9EDE\u53EF\u7528\uFF0C${Ze} \u500B\u932F\u8AA4\uFF1B\u8A73\u7D30\u5206\u6578\u5DF2\u5217\u5728\u4E0A\u65B9\u3002`:`Reranker \u6E2C\u8A66\u5B8C\u6210\uFF1A${We} \u500B\u7AEF\u9EDE\u53EF\u7528\uFF0C\u6A21\u578B ${te.model||"\u2014"}\u3002`,Ze?"warn":"ok"),C(Ze?"Reranker \u90E8\u5206\u7AEF\u9EDE\u5931\u6557\uFF0C\u8ACB\u67E5\u770B\u6E2C\u8A66\u7D50\u679C\u3002":"Reranker \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\u3002",Ze?"warn":"ok",5e3)}catch(te){a||(be(ge,te.message||"Reranker \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","error"),C(te.message||"Reranker \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","danger",6e3))}finally{m=!1,a||lt()}}},jt=()=>{if(!pe)return;let te=pu($,b,p);te!==y&&(y=te,pe.innerHTML=As($,b,p))},nt=async()=>{try{let te=await K.testRuns(30);if(a)return;b=Array.isArray(te.runs)?te.runs:[]}catch{if(a)return;b=[]}},Xe=async(te=null)=>{try{let Ae=te||(p?await K.testRun(p):await K.testRunCurrent());if(a)return;$=Ae.run||null,!p&&$&&$.status!=="running"&&!b.some(We=>We.run_id===$.run_id)&&await nt()}catch{if(a)return;$=null}a||jt()};Se?.addEventListener("input",()=>{P(),Ee("\u5C1A\u672A\u6E2C\u8A66\u6B64\u4F4D\u5740\u3002")}),E?.addEventListener("click",async()=>{let te=w();if(te!==null){Ne(E,!0,"\u6E2C\u8A66\u4E2D\u2026"),Ee(`\u6B63\u5728\u9023\u7DDA\u5230 ${as(te)||"\u540C\u6E90"}\u2026`);try{let Ae=await Yn(te);if(a)return;Ee(`\u9023\u7DDA\u6210\u529F \xB7 v${Ae.version} \xB7 ${Ae.duration_ms} ms \xB7 GET ${St("/api/health",te)}`,"ok")}catch(Ae){a||Ee(Ae.message||"\u9023\u7DDA\u6E2C\u8A66\u5931\u6557\u3002","error")}finally{a||Ne(E,!1)}}}),ke?.addEventListener("submit",te=>{if(te.preventDefault(),Fe())return;let Ae=w();Ae!==null&&(Qa(Ae),C(`\u5F8C\u7AEF API \u5DF2\u8A2D\u70BA ${as(Ae)}\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026`,"ok",1600),window.setTimeout(()=>window.location.reload(),120))}),se?.addEventListener("click",()=>{Fe()||(Qa(""),C("\u5DF2\u6E05\u9664\u700F\u89BD\u5668\u5132\u5B58\u7684 API \u4F4D\u5740\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026","info",1600),window.setTimeout(()=>window.location.reload(),120))}),A?.addEventListener("click",Oe),he?.addEventListener("click",st),Le?.addEventListener("click",Ve),pe?.addEventListener("change",async te=>{te.target.id==="test-run-select"&&(p=String(te.target.value||""),await Xe())}),pe?.addEventListener("click",async te=>{te.target.closest("#test-flow-refresh")&&(p="",await nt(),await Xe())}),Q?.addEventListener("click",async()=>{Ne(Q,!0,"\u66F4\u65B0\u4E2D\u2026"),j(),await Promise.allSettled([H(),nt(),Pe(),ot()]),a||await Xe(),a||(Ne(Q,!1),C("\u7CFB\u7D71\u6E2C\u8A66\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200))});let Pt=te=>{n=!!te.detail?.enabled,i=te.detail?.models||{embedding:[],llm:[]},W()};return window.addEventListener("judgment:test-mode",Pt),j(),W(),Ce(),lt(),await Promise.allSettled([H(),nt(),Pe(),ot()]),await Xe(),g=xt("test-runs",async(te,Ae)=>{a||document.hidden||p||await Xe(Ae?.snapshot||null)}),!s&&typeof t?.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"),()=>{a=!0,g&&g(),window.removeEventListener("judgment:test-mode",Pt)}}var Ki={frontend:"browser",backend:"server",database:"database",storage:"layers",vector:"cube",ai:"brain",default:"cpu"};var eo={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90"},zn=new Set,to=[{id:"overview",label:"\u670D\u52D9\u7E3D\u89BD",hint:"\u5065\u5EB7\u72C0\u614B\u8207\u8CC7\u6599\u91CF",icon:"activity"},{id:"tests",label:"\u7CFB\u7D71\u6E2C\u8A66",hint:"API\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u6A21\u578B Flow",icon:"terminal"},{id:"resources",label:"\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528",hint:"CPU\u3001RAM\u3001Docker\u3001\u786C\u789F",icon:"cpu"},{id:"local-model",label:"Model Provider",hint:"Ollama \u4E3B\u6A5F\u8207\u6A21\u578B",icon:"server"},{id:"architecture",label:"\u524D\u5F8C\u7AEF\u67B6\u69CB",hint:"Client \u2192 API \u2192 Pipeline \u2192 Data",icon:"layers"},{id:"data",label:"\u8CC7\u6599\u7248\u672C",hint:"Parquet \u8207 PostgreSQL",icon:"database"},{id:"api",label:"API \u7AEF\u9EDE",hint:"REST \u8207 OpenAPI",icon:"terminal"},{id:"runs",label:"\u6700\u8FD1\u4E0B\u8F09",hint:"\u6CD5\u898F\uFF0F\u547D\u4EE4\u57F7\u884C\u7D00\u9304",icon:"history"}],Ys=[{id:"system",label:"\u7CFB\u7D71\u8207\u5373\u6642\u72C0\u614B",icon:"activity",prefixes:["/api/health","/api/status","/api/system-usage","/api/events/stream","/api/processing/events/status","/api/docs","/api/openapi.json"]},{id:"processing",label:"\u8CC7\u6599\u8655\u7406\u8207\u66F4\u65B0",icon:"database",prefixes:["/api/processing","/api/judgment-download","/api/updates","/api/courts","/api/law-versions"]},{id:"data",label:"\u67E5\u8A62\u8207\u8CC7\u6599",icon:"search",prefixes:["/api/query","/api/data","/api/judgment","/api/law","/api/schema","/api/catalog","/api/judgment-stats","/api/quality"]},{id:"rag",label:"RAG \u554F\u7B54",icon:"message",prefixes:["/api/rag"]},{id:"index",label:"\u7248\u672C\u8207\u7D22\u5F15",icon:"layers",prefixes:["/api/index-versions","/api/index-alias","/api/versioning"]},{id:"models",label:"\u6A21\u578B\u8207\u670D\u52D9",icon:"brain",prefixes:["/api/ollama","/api/llm","/api/rerank","/api/test-mode"]},{id:"tests",label:"\u6E2C\u8A66\u8207\u6548\u80FD",icon:"activity",prefixes:["/api/test-runs","/api/performance"]},{id:"question-bank",label:"\u984C\u5EAB",icon:"file",prefixes:["/api/question-bank"]},{id:"benchmark",label:"Benchmark",icon:"grid",prefixes:["/api/benchmark"]},{id:"other",label:"\u5176\u4ED6",icon:"terminal",prefixes:[]}];function mu(e){return e==="operational"?{label:"\u6838\u5FC3\u670D\u52D9\u6B63\u5E38",tone:"ok",headline:"\u6838\u5FC3\u8CC7\u6599\u7BA1\u7DDA\u904B\u4F5C\u4E2D",copy:"FastAPI\u3001PostgreSQL \u8207 Parquet \u5747\u53EF\u5B58\u53D6\u3002Qdrant\u3001Embedding \u8207 LLM \u6703\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u8A2D\u5B9A\u6216\u964D\u7D1A\u6642\u4E0D\u5F71\u97FF\u8CC7\u6599\u700F\u89BD\u8207\u67E5\u8A62\u5831\u8868\u3002"}:e==="degraded"?{label:"\u90E8\u5206\u670D\u52D9\u964D\u7D1A",tone:"warn",headline:"\u90E8\u5206\u670D\u52D9\u9700\u8981\u8A2D\u5B9A\u6216\u4FEE\u5FA9",copy:"\u6838\u5FC3\u8CC7\u6599\u670D\u52D9\u76EE\u524D\u672A\u5B8C\u5168\u53EF\u7528\u3002\u8ACB\u67E5\u770B\u4E0B\u65B9\u670D\u52D9\u5361\u7247\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u7684\u57F7\u884C\u7D00\u9304\uFF0C\u78BA\u8A8D PostgreSQL\u3001Parquet \u6216\u5916\u90E8\u670D\u52D9\u72C0\u614B\u3002"}:{label:Et(e).label,tone:Et(e).tone,headline:"\u76EE\u524D\u7121\u6CD5\u78BA\u8A8D\u7CFB\u7D71\u72C0\u614B",copy:"\u72C0\u614B API \u56DE\u50B3\u4E86\u975E\u9810\u671F\u7D50\u679C\u3002\u8ACB\u91CD\u65B0\u6574\u7406\uFF0C\u6216\u76F4\u63A5\u6AA2\u67E5 FastAPI \u670D\u52D9\u65E5\u8A8C\u3002"}}function gu(e){let t=Et(e.status),s=Ki[e.kind]||Ki.default,a=e.latency_ms===null||e.latency_ms===void 0?"":`<span class="service-latency">${d(e.latency_ms)} ms</span>`;return`<article class="service-card">
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
  </article>`}function fu(e,t){let s=typeof e=="string"?{label:e}:e||{},a=String(s.label||"\u2014"),n=s.service?t.find(l=>l.id===s.service):null,i=n?n.status==="operational":a==="IndexedDB"?vr():!0,o=[s.detail||"",n?`\u72C0\u614B\uFF1A${Et(n.status).label}`:""].filter(Boolean).join(" \xB7 ");return`<div class="arch-node ${i?"":"is-muted"}" title="${r(o||(i?a:"\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165"))}">
    <strong>${r(a)}</strong>
    ${s.detail?`<span class="arch-node-detail">${r(s.detail)}</span>`:""}
  </div>`}function bu(e,t){let s=e?.layers||[];if(!s.length)return'<div class="report-empty-inline">\u72C0\u614B API \u672A\u63D0\u4F9B\u67B6\u69CB\u8CC7\u6599\u3002</div>';let a=s.map(i=>{let o=(i.nodes||[]).map(l=>fu(l,t)).join("");return`<div class="arch-layer">
      <div class="arch-layer-label">${r(i.label||i.id)}</div>
      <div class="arch-nodes">${o}</div>
    </div>`}),n=[];return a.forEach((i,o)=>{o&&n.push(`<div class="arch-arrow" aria-hidden="true">${f("arrowRight",15)}</div>`),n.push(i)}),`<div class="arch-flow">${n.join("")}</div>
    <div class="arch-legend">
      <span><i class="legend-key is-live"></i>\u5DF2\u63A5\u5165\u4E14\u72C0\u614B\u6B63\u5E38</span>
      <span><i class="legend-key is-off"></i>\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165</span>
      <span>${f("info",12)} \u7BC0\u9EDE\u72C0\u614B\u4F86\u81EA\u4E3B\u670D\u52D9\u5065\u5EB7\u6AA2\u67E5</span>
    </div>
    ${vu()}`}function vu(){return`<figure class="arch-diagram">
    <figcaption class="arch-diagram-head">
      <span class="section-title">\u6D41\u7A0B\u65B9\u5411\u793A\u610F\u5716</span>
      <span class="section-sub">\u76EE\u524D\u5C08\u6848\u7684\u8ACB\u6C42\u3001SSE\u3001RAG\u3001\u8655\u7406\u6D41\u7A0B\u3001\u80CC\u666F\u6392\u7A0B\u8207\u8CC7\u6599\uFF0F\u6A21\u578B\u670D\u52D9\u65B9\u5411\uFF1B\u5716\u8868\u53EF\u6C34\u5E73\u6372\u52D5</span>
    </figcaption>
    <div class="arch-diagram-scroll">
      <svg class="arch-diagram-svg" viewBox="0 0 1180 740" role="img" aria-labelledby="arch-flow-title arch-flow-desc">
        <title id="arch-flow-title">Judgment RAG Console \u524D\u5F8C\u7AEF\u6D41\u7A0B\u65B9\u5411\u793A\u610F\u5716</title>
        <desc id="arch-flow-desc">\u700F\u89BD\u5668 RAG Console \u900F\u904E REST \u8207 SSE \u9023\u7DDA FastAPI 9200\uFF1BFastAPI \u547C\u53EB RAG Orchestrator\u3001Processing Runtime\u3001Scheduler \u8207 Power Agent\u3002RAG \u8207\u8655\u7406\u6D41\u7A0B\u8B80\u5BEB PostgreSQL\u3001Qdrant\u3001Parquet \u8207 Ollama Embedding\u3001Reranker\u3001LLM\u3002\u700F\u89BD\u5668\u53E6\u4EE5 IndexedDB \u4FDD\u5B58\u63D0\u554F\u6B77\u53F2\u8207\u7A3D\u6838\u8CC7\u6599\u3002</desc>
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
        <text class="arch-diagram-node-title" x="872" y="364">Ollama Embedding</text>
        <text class="arch-diagram-node-sub" x="872" y="383">bge-m3 \xB7 1,024 dims \xB7 x570\uFF0Flocal fallback</text>

        <rect class="arch-diagram-node" x="858" y="420" width="286" height="64" rx="9"></rect>
        <text class="arch-diagram-node-title" x="872" y="444">Reranker</text>
        <text class="arch-diagram-node-sub" x="872" y="463">bge-reranker-v2-m3 \xB7 primary\uFF0Ffallback</text>

        <rect class="arch-diagram-node" x="858" y="500" width="286" height="64" rx="9"></rect>
        <text class="arch-diagram-node-title" x="872" y="524">Ollama LLM</text>
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
      <span><b>\u2464</b> RAG \u8B80\u5BEB PostgreSQL\u3001Qdrant \u8207 Ollama \u6A21\u578B</span>
      <span><b>\u2465</b> \u8655\u7406\u6D41\u7A0B\u8B80\u5BEB Parquet\u3001PostgreSQL\u3001Qdrant</span>
      <span><b>\u2466</b> Scheduler\uFF0FCLI \u89F8\u767C\u6279\u6B21\u5DE5\u4F5C</span>
      <span><b>\u2467</b> \u700F\u89BD\u5668 IndexedDB \u672C\u5730\u4FDD\u5B58</span>
    </div>
  </figure>`}function so(e){let t=String(e||""),s=a=>t===a||t.startsWith(`${a}/`);for(let a of Ys)if(a.prefixes.some(s))return a;return Ys[Ys.length-1]}function hu(e){return`is-${String(e||"get").toLowerCase()}`}function $u(e){return`<div class="endpoint-row${e.deprecated?" is-deprecated":""}">
    <span class="endpoint-method ${hu(e.method)}">${r(e.method||"GET")}</span>
    <span class="endpoint-path" title="${r(e.path||"")}">${r(e.path||"")}</span>
    <span class="endpoint-label">${r(e.label||"")}</span>
  </div>`}function yu(e){if(!Array.isArray(e)||!e.length)return'<div class="report-empty-inline">\u6C92\u6709\u7AEF\u9EDE\u8CC7\u8A0A\u3002</div>';let t=new Map(Ys.map(s=>[s.id,{group:s,endpoints:[]}]));for(let s of e){let a=so(s.path),n=t.get(a.id);n&&n.endpoints.push(s)}return`<div class="api-endpoint-groups">${Ys.map(s=>{let n=t.get(s.id)?.endpoints||[];return n.length?(n.sort((i,o)=>String(i.path).localeCompare(String(o.path))||String(i.method).localeCompare(String(o.method))),`<section class="card api-endpoint-group">
        <div class="side-card-head">
          <span class="side-card-title">${f(s.icon,14)}${r(s.label)}</span>
          <span class="badge badge-neutral badge-mono">${d(n.length)}</span>
        </div>
        <div class="endpoint-list">${n.map($u).join("")}</div>
      </section>`):""}).join("")}</div>`}function Kt(e,t){return`<div class="detail-row">
    <span class="detail-label">${r(e)}</span>
    <span class="detail-value">${t}</span>
  </div>`}function Ue(e,t,{mono:s=!1,wide:a=!1}={}){return`<div class="data-version-fact${a?" is-wide":""}">
    <span>${r(e)}</span>
    <strong class="${s?"mono":""}">${r(String(t??"\u2014"))}</strong>
  </div>`}function Yi(e,t,s,a=""){let n=t==null?null:Math.max(0,Math.min(100,Number(t)||0));return`<div class="data-version-coverage ${a}">
    <div class="data-version-coverage-head">
      <span>${r(e)}</span>
      <strong>${Na(n)}</strong>
    </div>
    <div class="data-version-coverage-track"><span style="width:${n===null?0:n.toFixed(1)}%"></span></div>
    <div class="data-version-coverage-foot">${r(s)}</div>
  </div>`}function wu(e){if(!Array.isArray(e)||!e.length)return pt({iconName:"history",title:"\u5C1A\u7121\u4E0B\u8F09\u57F7\u884C\u7D00\u9304",text:"\u57F7\u884C judgment-law-download \u5F8C\uFF0C\u6210\u529F\u3001\u7121\u8B8A\u66F4\u8207\u5931\u6557\u7684\u7D50\u679C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"});let t=[{key:"id",label:"Run",type:"number"},{key:"source_type",label:"\u985E\u578B",type:"source"},{key:"status",label:"\u72C0\u614B",type:"status"},{key:"started_at",label:"\u958B\u59CB\u6642\u9593",type:"datetime"},{key:"duration_ms",label:"\u8017\u6642",type:"duration"},{key:"law_count",label:"\u6CD5\u898F",type:"number"},{key:"article_count",label:"\u689D\u6587",type:"number"},{key:"error_message",label:"\u932F\u8AA4",type:"longtext"}];return`<div class="table-wrap" style="border-top:0;max-height:340px">
    <table class="data-table runs-table">
      <thead><tr>${t.map(s=>`<th scope="col">${r(s.label)}</th>`).join("")}</tr></thead>
      <tbody>
        ${e.map(s=>`<tr>${t.map(a=>`<td>${aa(s[a.key],a.type)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </div>`}function _u(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=new Map(s.map(y=>[y.id,y])),n=a.get("qdrant"),i=a.get("embedding"),o=a.get("rag"),l=a.get("llm"),u=Number(t.judgment_indexed_count||0),c=Number(t.judgment_count||0),m=c?(u/c*100).toFixed(1):"0.0",$=t.judgment_vector_points===null||t.judgment_vector_points===void 0?"\u2014":d(t.judgment_vector_points),b=Number(t.judgment_index_remaining||0),p=o?.status==="operational"?"RAG \u5C31\u7DD2":o?.status==="not_configured"?"\u672A\u8A2D\u5B9A":o?.status==="degraded"?"\u964D\u7D1A":"\u672A\u77E5",g=[["cube","Qdrant \u5411\u91CF\u7D22\u5F15",n],["layers",`Embedding\uFF08${t.judgment_vector_model||"\u2014"}\uFF09`,i],["brain","RAG \u56DE\u7B54\u7BA1\u7DDA",o],["sparkles","LLM \u6A21\u578B",l]];return`<section class="card data-section rag-index-card">
    <div class="side-card-head">
      <span class="side-card-title">${f("database",14)}RAG \u8CC7\u6599\u73FE\u6CC1</span>
      ${Ye(o?.status,p)}
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
          <div class="mini-stat-value">${m}%</div>
          <div class="mini-stat-label">\u7D22\u5F15\u8986\u84CB</div>
        </div>
      </div>
      <div class="side-status-list">
        ${g.map(([y,_,q])=>`<div class="side-status-row">
              <span>${f(y,13)}${r(_)}</span>
              ${Ye(q?.status,q?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
            </div>`).join("")}
      </div>
      <div class="side-card-foot" style="padding:0;border:0;margin-top:10px">
        Collection\uFF1A${r(t.judgment_vector_collection||"\u2014")} \xB7
        ${$} points \xB7 \u5269\u9918 ${d(b)} \u7B46\u5F85\u7D22\u5F15
      </div>
    </div>
    <div class="side-card-foot">
      PostgreSQL \u5224\u6C7A\u6587\u4EF6\u3001Qdrant \u5411\u91CF\u7D22\u5F15\u8207 Ollama \u6A21\u578B\u72C0\u614B\u7686\u70BA\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u5C31\u7DD2\u6642\u6703\u660E\u78BA\u964D\u7D1A\u3002
    </div>
  </section>`}function Na(e){let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function Yt(e){return Math.max(0,Number(e?.duration_ms)||0)}function ku(e,t){let s=e?.pipeline&&typeof e.pipeline=="object"?e.pipeline:null,a=Array.isArray(s?.stages)?s.stages:[],n=Number(s?.total_ms)||a.reduce((b,p)=>b+Yt(p),0),i=Math.max(0,Number(t?.initMs)||0),o=Math.max(0,Number(t?.requestMs)||0),l=Math.max(o,n),u=Math.max(0,l-n),c=[],m=t?.requestStartedAt||e?.checked_at||null,$=t?.requestFinishedAt||e?.checked_at||null;if(i>.5&&c.push({key:"page-init",label:"\u9801\u9762\u521D\u59CB\u5316",caption:"\u5EFA\u7ACB\u670D\u52D9\u7E3D\u89BD\u9AA8\u67B6\u8207\u5C0E\u89BD",color:"#64748b",status:"success",duration_ms:i,started_at:t?.initStartedAt||m,finished_at:m,message:"\u700F\u89BD\u5668\u5EFA\u7ACB\u9801\u9762\u3001\u8F09\u5165\u6A21\u7D44\u4E26\u6E96\u5099\u8ACB\u6C42\u3002"}),a.length){u>.5&&c.push({key:"http",label:"HTTP \u50B3\u8F38\uFF0F\u6392\u968A",caption:"\u700F\u89BD\u5668 \u2192 FastAPI",color:"#94a3b8",status:"success",duration_ms:u,started_at:m,finished_at:$,message:"\u5305\u542B\u9023\u7DDA\u3001\u8ACB\u6C42\u6392\u968A\u8207\u56DE\u61C9\u50B3\u8F38\u3002"}),c.push(...a);let b=a.reduce((g,y)=>g+Yt(y),0),p=Math.max(0,n-b);p>.5&&c.push({key:"server-assemble",label:"\u4F3A\u670D\u5668\u5F59\u6574",caption:"\u72C0\u614B\u56DE\u61C9\u7D44\u88DD",color:"#cbd5e1",status:"success",duration_ms:p,started_at:a[a.length-1]?.finished_at||m,finished_at:$,message:"\u7D44\u88DD\u670D\u52D9\u3001\u8CC7\u6599\u91CF\u8207\u67B6\u69CB payload\u3002"})}else c.push({key:"status-request",label:"GET /api/status",caption:"\u670D\u52D9\u72C0\u614B\u8207\u8CC7\u6599\u91CF",color:"#64748b",status:"success",duration_ms:l,started_at:m,finished_at:$,message:"\u5F8C\u7AEF\u672A\u63D0\u4F9B\u968E\u6BB5\u660E\u7D30\uFF1B\u986F\u793A\u6574\u9AD4\u8ACB\u6C42\u6642\u9593\u3002"});return{total_ms:i+l,started_at:t?.initStartedAt||m,finished_at:$,stages:c,server_ms:n,request_ms:l,transport_ms:u,init_ms:i,detailed:!!s}}function Su(e){let t=e?.page_pipeline,s=Array.isArray(t?.stages)?t.stages:[];if(!t||!s.length)return"";let a=Math.max(0,Number(t.total_ms)||s.reduce((A,U)=>A+Yt(U),0)),n=Math.max(a,s.reduce((A,U)=>A+Yt(U),0),1),i=1.25,o=s.filter(A=>String(A.status||"success")!=="skipped"),l=s.filter(A=>["success","no_change"].includes(String(A.status||"success"))).length,u=s.filter(A=>A.status==="failed").length,c=s.reduce((A,U)=>Yt(U)>Yt(A)?U:A,s[0]),m=Math.max(0,Number(t.server_ms)||Number(e?.pipeline?.total_ms)||0),$=Math.max(0,Number(t.transport_ms)||0),b=Math.max(0,Number(t.init_ms)||0),p=s.map(A=>String(A.status||"success")==="skipped"?0:Math.max(Yt(A)/n*100,i)),g=p.reduce((A,U)=>A+U,0),y=g>100?100/g:1,_=0,q=s.map((A,U)=>{let V=String(A.status||"success"),J=V==="skipped",ke=A.label||A.key||`\u968E\u6BB5 ${U+1}`,Se=A.caption||"",F=Yt(A),T=J?"\u2014":fe(F),S=n>0?F/n*100:0,E=J?0:p[U]*y,se=_;J||(_+=E);let le=A.color||"#64748b",Q=V==="failed"?"var(--danger)":le,pe=[`is-${V}`,V==="failed"?"is-error":"",J?"is-missing":""].filter(Boolean).join(" "),ye=E>0?`<span class="rag-wf-bar status-wf-bar is-sequential" style="left:${se.toFixed(3)}%;width:${E.toFixed(4)}%;top:0;height:12px;--bar-color:${r(Q)}" aria-hidden="true"></span>`:"",I=J?"\u7565\u904E":V==="failed"?"\u5931\u6557":"\u5B8C\u6210",we=`${t.label||"status"}:${A.key||U}`,G=[["\u72C0\u614B",I,!0],["\u958B\u59CB",A.started_at?$e(A.started_at):"\u2014",!0],["\u7D50\u675F",A.finished_at?$e(A.finished_at):"\u2014",!0],["\u8017\u6642",T,!0],["\u5360\u6574\u9AD4",Na(S),!0],["\u8AAA\u660E",A.message||"",!1]].map(([he,Te,ne])=>ne||Te?`<span class="rag-wf-detail"><span>${r(he)}</span><strong>${r(String(Te||"\u2014"))}</strong></span>`:"").join("");return`<details class="rag-wf-stage status-wf-stage ${pe}" data-status-wf-stage="${r(we)}"${zn.has(we)?" open":""} style="--stage-color:${r(le)}">
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="status-wf-step">${String(U+1).padStart(2,"0")}</span> ${r(ke)}</strong>${Se?`<small>${r(Se)}</small>`:""}</span>
            </span>
            <span class="rag-wf-stage-meta">${r(T)} \xB7 ${r(I)} <span class="rag-wf-chevron">${f("chevronRight",12)}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px" role="img" aria-label="${r(`${ke}\uFF1A${I}\uFF0C\u8017\u6642 ${T}\uFF0C\u5360\u6574\u9AD4 ${Na(S)}`)}">${ye}</span>
        </summary>
        <div class="rag-wf-details">${G}</div>
      </details>`}).join(""),M=t.detailed?"\u5F8C\u7AEF /api/status \u968E\u6BB5\u660E\u7D30":"\u5F8C\u7AEF\u672A\u63D0\u4F9B\u968E\u6BB5\u660E\u7D30\uFF0C\u986F\u793A\u6574\u9AD4\u8ACB\u6C42\u6642\u9593";return`<section class="report-card status-wf-card" data-status-pipeline>
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${f("activity",14)}\u670D\u52D9\u7E3D\u89BD\u8F09\u5165 Pipeline</span>
      <div class="index-runtime-metrics">
        <span class="index-runtime-metric" title="\u672C\u6B21\u9801\u9762\u521D\u59CB\u5316\u5230\u72C0\u614B\u56DE\u61C9\u5B8C\u6210\u7684\u7E3D\u6642\u9593\u3002"><span>\u7E3D\u8017\u6642</span><strong>${r(fe(a))}</strong></span>
        <span class="index-runtime-metric" title="\u5F8C\u7AEF /api/status \u6AA2\u67E5\u968E\u6BB5\u7684\u5408\u8A08\u6642\u9593\u3002"><span>Server</span><strong>${r(fe(m))}</strong></span>
        <span class="index-runtime-metric" title="\u700F\u89BD\u5668\u8ACB\u6C42\u6642\u9593\u6263\u6389\u5F8C\u7AEF\u6AA2\u67E5\u5F8C\u7684\u50B3\u8F38\u8207\u6392\u968A\u6642\u9593\u3002"><span>HTTP \u50B3\u8F38</span><strong>${r(fe($))}</strong></span>
        <span class="index-runtime-metric" title="\u700F\u89BD\u5668\u5EFA\u7ACB\u9801\u9762\u9AA8\u67B6\u8207\u8F09\u5165\u6A21\u7D44\u7684\u6642\u9593\u3002"><span>\u9801\u9762\u521D\u59CB\u5316</span><strong>${r(fe(b))}</strong></span>
        <span class="index-runtime-metric" title="\u8017\u6642\u6700\u9577\u7684\u6AA2\u67E5\u968E\u6BB5\u3002"><span>\u6700\u6162\u968E\u6BB5</span><strong>${r(`${c?.label||"\u2014"} \xB7 ${fe(Yt(c))}`)}</strong></span>
        <span class="index-runtime-metric" title="\u5B8C\u6210\u7684\u6AA2\u67E5\u968E\u6BB5\u6578 / \u7E3D\u968E\u6BB5\u6578\uFF1B\u5931\u6557\u968E\u6BB5\u6703\u4EE5\u7D05\u8272\u6A19\u793A\u3002"><span>\u5B8C\u6210\u968E\u6BB5</span><strong>${d(l)} / ${d(s.length)}${u?` \xB7 \u5931\u6557 ${d(u)}`:""}</strong></span>
      </div>
    </div>
    <div class="status-wf-summary">
      <span>\u6AA2\u67E5 <strong>${r($e(e.checked_at))}</strong></span>
      <span>API <strong class="mono">${r(as())}</strong></span>
      <span>\u7248\u672C <strong class="mono">v${r(e.version||"\u2014")}</strong></span>
      <span>\u74B0\u5883 <strong>${r(e.environment||"\u2014")}</strong></span>
      <span>${r(M)}</span>
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
      <div class="rag-wf-stages">${q}</div>
      <p class="rag-wf-hint">\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u63A5\u7E8C\u6392\u5217\uFF0C\u986F\u793A\u672C\u6B21\u958B\u555F\u670D\u52D9\u7E3D\u89BD\u7684\u9801\u9762\u521D\u59CB\u5316\u3001HTTP \u5F80\u8FD4\u3001\u5F8C\u7AEF\u6AA2\u67E5\u8207\u56DE\u61C9\u5F59\u6574\u3002\u5B8C\u6210\u968E\u6BB5\u586B\u6EFF\u984F\u8272\uFF0C\u5931\u6557\u968E\u6BB5\u4EE5\u7D05\u8272\u6A19\u793A\uFF0C\u7565\u904E\u968E\u6BB5\u4E0D\u7E6A\u88FD bar\uFF1B\u6975\u77ED\u968E\u6BB5\u4FDD\u7559\u6700\u5C0F\u53EF\u898B\u5BEC\u5EA6\u3002\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\u53EF\u67E5\u770B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001\u8017\u6642\u8207\u8AAA\u660E\u3002</p>
    </div>
  </section>`}function xu(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=mu(e.status),n=s.find(c=>c.id==="qdrant"),i=s.find(c=>c.id==="rag"),o=s.find(c=>c.id==="llm"),l=ss(),u=eo[l]||l;return`<section class="status-hero">
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
          <span>${f("clock",11)} \u6AA2\u67E5\u6642\u9593 ${$e(e.checked_at)} \xB7 ${r(Es(e.checked_at))}</span>
          <span>${f("server",11)} ${s.length} \u500B\u670D\u52D9\u5143\u4EF6</span>
          <span>${f("database",11)} ${d(t.total_current)} \u7B46\u73FE\u884C\u8CC7\u6599</span>
          <span>${f("layers",11)} ${d(t.parquet_files)} \u500B\u539F\u59CB Parquet</span>
          <span title="API \u4F4D\u5740\u4F86\u6E90\uFF1A${r(u)}">${f("link",11)} ${r(as())}</span>
        </div>
      </div>
    </section>

    ${Su(e)}

    <div class="service-grid">${s.map(gu).join("")}</div>

    ${_u(e)}

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

    ${n?.status==="not_configured"||i?.status==="not_configured"||o?.status==="not_configured"?`<div class="data-section">${He({tone:"info",title:"\u90E8\u5206 AI \u5143\u4EF6\u5C1A\u672A\u8A2D\u5B9A",text:`Qdrant\uFF1A${r(n?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BRAG\uFF1A${r(i?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BLLM\uFF1A${r(o?.detail||"\u672A\u8A2D\u5B9A")}\u3002\u9019\u4E9B\u72C0\u614B\u4E0D\u6703\u88AB\u507D\u88DD\u6210\u53EF\u7528\u3002`})}</div>`:""}`}function Au(e){let t=Array.isArray(e.services)?e.services:[],s=e.architecture||{};return`<div class="data-section card architecture-card">
    <div class="section-head">
      <div>
        <div class="section-title">\u524D\u5F8C\u7AEF\u67B6\u69CB</div>
        <div class="section-sub">Client \u2192 Application \u2192 Pipelines \u2192 Data \xB7 \u6700\u65B0\u5C08\u6848\u5143\u4EF6\u8207\u5373\u6642\u5065\u5EB7\u72C0\u614B</div>
      </div>
      <span class="badge badge-neutral badge-mono">${d((s.flow||[]).length)} layers</span>
    </div>
    ${bu(s,t)}
  </div>`}function qu(e){let t=Array.isArray(e.endpoints)?e.endpoints:[],s=ss(),a=eo[s]||s,n=St("/api/docs"),i=St("/api/openapi.json"),o=new Set(t.map(c=>so(c.path).id)),l=t.reduce((c,m)=>{let $=String(m.method||"GET").toUpperCase();return c[$]=(c[$]||0)+1,c},{}),u=["GET","POST","PATCH","PUT","DELETE"].filter(c=>l[c]).map(c=>`${c} ${d(l[c])}`).join(" \xB7 ");return`<section class="status-hero api-endpoint-hero">
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
          <span>${f("server",11)} API Base <span class="mono">${r(as())}</span>\uFF08${r(a)}\uFF09</span>
          <span>${f("terminal",11)} ${r(u||"\u2014")}</span>
          <span>${f("clock",11)} \u66F4\u65B0\u6642\u9593 ${$e(e.checked_at)}</span>
        </div>
      </div>
      <div class="api-endpoint-actions">
        <a class="btn btn-secondary btn-sm" href="${r(n)}" target="_blank" rel="noopener noreferrer">${f("external",13)}<span>Swagger UI</span></a>
        <a class="btn btn-ghost btn-sm" href="${r(i)}" target="_blank" rel="noopener noreferrer">OpenAPI JSON ${f("external",11)}</a>
      </div>
    </section>
    ${yu(t)}
    <p class="status-footnote">\u7AEF\u9EDE\u7531 FastAPI route table \u52D5\u614B\u7522\u751F\uFF1B\u4E92\u52D5\u5F0F\u6587\u4EF6\u4F4D\u65BC <a href="${r(n)}" target="_blank" rel="noopener noreferrer"><code>${r(n)}</code></a>\uFF0COpenAPI schema \u4F4D\u65BC <a href="${r(i)}" target="_blank" rel="noopener noreferrer"><code>${r(i)}</code></a>\u3002\u7AEF\u9EDE\u8B8A\u66F4\u5F8C\u91CD\u65B0\u6574\u7406\u6B64\u9801\u5373\u53EF\u53D6\u5F97\u6700\u65B0\u6E05\u55AE\u3002</p>`}function Mu(e,t={}){let s=e.data||{},a=t.info||null,n=a?.counts||{},i=Number(s.judgment_indexed_count||0),o=Number(s.judgment_count||0),l=Number(s.judgment_index_remaining??Math.max(0,o-i)),u=Number(s.judgment_index_pending??l)||0,c=Number(s.judgment_index_changed||0),m=Number(s.judgment_index_stale||0),$=o>0?Math.max(0,Math.min(100,i/o*100)):null,b=Na($),p=s.judgment_index_fresh===!1||u>0||String(s.judgment_index_staleness?.status||"")==="stale",g=p?"is-warn":"",y=s.last_version||{},_=s.last_run||{},q=y.source_type==="law"?"\u6CD5\u898F":y.source_type==="order"?"\u547D\u4EE4":"\u2014",M=y.version_code?String(y.version_code):y.id?`#${d(y.id)}`:"\u2014",A=Number(s.legal_article_indexed_count||s.legal_index?.points_count||0),U=Number(s.legal_article_count||s.legal_index?.article_count||0),V=U>0?Math.max(0,Math.min(100,A/U*100)):null,J=s.legal_article_stale===!0||String(s.legal_index?.status||"")==="stale",ke=J?"is-warn":"",Se=s.judgment_vector_alias||"\u2014",F=s.judgment_vector_collection||"\u2014",T=s.legal_article_vector_alias||s.legal_index?.alias||"\u2014",S=s.legal_article_vector_collection||s.legal_index?.collection||"\u2014",E=p?"\u5224\u6C7A\u7D22\u5F15\u5F85\u66F4\u65B0":"\u8CC7\u6599\u7248\u672C\u4E00\u81F4",se=p?`\u5224\u6C7A\u7D22\u5F15\u5C1A\u7F3A ${d(u)} \u7B46`:"\u5224\u6C7A\u8CC7\u6599\u8207\u5411\u91CF\u7D22\u5F15\u4E00\u81F4",le=p?`PostgreSQL \u76EE\u524D\u6709 ${d(o)} \u7B46\u5224\u6C7A\uFF0CQdrant ${F} \u5DF2\u7D22\u5F15 ${d(i)} \u7B46\uFF1B\u5C1A\u6709 ${d(u)} \u7B46\u5F85\u7D22\u5F15\u3002`:"PostgreSQL \u8207 Qdrant \u5224\u6C7A\u7B46\u6578\u4E00\u81F4\uFF1B\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u8207\u7D22\u5F15\u72C0\u614B\u540C\u6B65\u3002",Q=Et(_.status||"idle").label,pe=_.finished_at||_.started_at;return`<section class="status-hero data-version-hero">
      <div class="status-hero-main">
        <div class="overall-row">
          <span class="overall-badge ${g}">
            <span class="status-dot ${p?"is-warn":"is-ok"}" aria-hidden="true"></span>
            ${r(E)}
          </span>
          <span class="badge badge-neutral badge-mono">${d(s.version_count)} \u500B\u8CC7\u6599\u7248\u672C</span>
          <span class="badge badge-neutral">${r(q)} \u6700\u65B0\u7248\u672C ${r(M)}</span>
        </div>
        <h2 class="status-headline">${r(se)}</h2>
        <p class="status-copy">${r(le)}</p>
        <div class="status-meta">
          <span>${f("clock",11)} \u6AA2\u67E5\u6642\u9593 ${$e(e.checked_at)}</span>
          <span>${f("database",11)} \u73FE\u884C\u8CC7\u6599 ${d(s.total_current)} \u7B46</span>
          <span>${f("layers",11)} \u539F\u59CB Parquet ${d(s.parquet_files)} \u500B \xB7 ${Ie(s.parquet_bytes)}</span>
          <span title="Qdrant alias \u8207\u76EE\u524D\u7248\u672C collection">${f("link",11)} <span class="mono">${r(Se)} \u2192 ${r(F)}</span></span>
        </div>
      </div>
      <div class="data-version-ring ${g}" style="--coverage:${$===null?0:$.toFixed(1)}%">
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
        <div class="metric-foot">${d(s.parquet_files)} \u500B\u539F\u59CB Parquet \xB7 ${Ie(s.parquet_bytes)}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u5224\u6C7A\u6587\u4EF6</div>
        <div class="metric-value">${d(s.judgment_count)}</div>
        <div class="metric-foot">PostgreSQL current</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Qdrant \u5224\u6C7A\u5411\u91CF\u7D22\u5F15</div>
        <div class="metric-value">${d(s.judgment_indexed_count)}</div>
        <div class="metric-foot">${b} \xB7 \u5269\u9918 ${d(u)} \u7B46</div>
      </div>
    </div>

    <div class="status-columns data-version-grid">
      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${f("database",14)}PostgreSQL \u8CC7\u6599\u7248\u672C</span>
          ${Ye(y.is_current?"operational":"degraded",y.is_current?"CURRENT":"HISTORY")}
        </div>
        ${y.id?`<div class="index-current-row">
                <span class="badge badge-info">${f("activity",11)}${r(q)} ${r(M)}</span>
                <strong class="mono">${$e(y.downloaded_at)}</strong>
                <span class="index-current-copy" title="${r(y.parquet_path||"")}">${r(y.parquet_path||"\u2014")}</span>
              </div>
              <div class="data-version-facts">
                ${Ue("\u8CC7\u6599\u7248\u672C\u7E3D\u6578",d(s.version_count),{mono:!0})}
                ${Ue("\u4E0B\u8F09\u57F7\u884C\u7E3D\u6578",d(s.run_count),{mono:!0})}
                ${Ue("\u7248\u672C ID",`#${d(y.id)}`,{mono:!0})}
                ${Ue("\u8CC7\u6599\u985E\u578B",q)}
                ${Ue("\u4F86\u6E90\u66F4\u65B0\u65E5",y.update_date||"\u2014")}
                ${Ue(`${q}\uFF0F\u689D\u6587`,`${d(y.law_count)} / ${d(y.article_count)}`)}
                ${Ue("\u4E0B\u8F09\u6642\u9593",$e(y.downloaded_at),{mono:!0})}
                ${Ue("\u8CC7\u6599\u72C0\u614B",y.is_current?"current":"history",{mono:!0})}
                ${Ue("Parquet \u6A94\u6848",y.parquet_path||"\u2014",{mono:!0,wide:!0})}
              </div>`:'<div class="report-empty-inline">\u5C1A\u672A\u532F\u5165\u4EFB\u4F55\u8CC7\u6599\u7248\u672C\u3002</div>'}
      </section>

      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${f("browser",14)}IndexedDB \u672C\u6A5F\u8CC7\u6599</span>
          <span class="badge ${a?.available?"badge-ok":"badge-neutral"} badge-mono">${r(a?.mode==="memory"?"MEMORY":a?"INDEXEDDB":"LOADING")}</span>
        </div>
        ${a?`<div class="index-current-row">
                <span class="badge badge-info">${f("database",11)}${r(a.name||"judgment-console")} v${d(a.version)}</span>
                <strong class="mono">${d(a.total)} \u7B46</strong>
                <span class="index-current-copy">${d(n.query_history)} \u5247\u63D0\u554F \xB7 ${d(n.audit_events)} \u7B46\u7A3D\u6838 \xB7 ${d(n.settings)} \u9805\u8A2D\u5B9A</span>
              </div>
              <div class="data-version-facts">
                ${Ue("Schema \u7248\u672C",`v${d(a.version)}`,{mono:!0})}
                ${Ue("\u5132\u5B58\u6A21\u5F0F",a.mode||"\u2014",{mono:!0})}
                ${Ue("query_history",`${d(n.query_history)} / ${d(a.caps?.history)}`,{mono:!0})}
                ${Ue("audit_events",`${d(n.audit_events)} / ${d(a.caps?.audit)}`,{mono:!0})}
                ${Ue("settings",d(n.settings),{mono:!0})}
                ${Ue("\u7E3D\u7D00\u9304\u6578",d(a.total),{mono:!0})}
                ${Ue("\u5DF2\u7528\u5BB9\u91CF",Ie(a.usage_bytes),{mono:!0})}
                ${Ue("\u53EF\u7528\u914D\u984D",Ie(a.quota_bytes),{mono:!0})}
              </div>
              <p class="data-version-note">${f("info",12)}
                IndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u7AEF\u63D0\u554F\u6B77\u53F2\u3001\u8A2D\u5B9A\u8207\u7248\u672C\u7A3D\u6838\u4E8B\u4EF6\uFF1B\u4F3A\u670D\u5668\u8CC7\u6599\u4EE5 PostgreSQL \u8207 Parquet \u70BA\u6E96\u3002
              </p>`:`<div class="report-empty-inline">${t.loading||!t.error?"\u6B63\u5728\u8B80\u53D6\u700F\u89BD\u5668 IndexedDB\u2026":r(t.error?.message||"IndexedDB \u5C1A\u7121\u8CC7\u6599\u6216\u7121\u6CD5\u8B80\u53D6\u3002")}</div>`}
      </section>

      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${f("brain",14)}Qdrant \u5224\u6C7A\u5411\u91CF\u7D22\u5F15</span>
          ${Ye(p?"degraded":"operational",p?"\u5F85\u66F4\u65B0":"\u4E00\u81F4")}
        </div>
        <div class="index-current-row">
          <span class="badge badge-info">${f("link",11)}Alias</span>
          <strong class="mono">${r(Se)}</strong>
          <span class="mono">\u2192 ${r(F)}</span>
          <span class="index-current-copy">v#${d(s.judgment_vector_version_id)} \xB7 ${r(s.judgment_vector_model||"\u2014")}</span>
        </div>
        ${Yi("\u7D22\u5F15\u8986\u84CB",$,`\u5DF2\u7D22\u5F15 ${d(i)} / ${d(o)} \u7B46 \xB7 \u5269\u9918 ${d(u)} \u7B46`,g)}
        <div class="data-version-facts">
          ${Ue("Qdrant points",d(s.judgment_vector_points),{mono:!0})}
          ${Ue("\u7D22\u5F15\u7248\u672C",`#${d(s.judgment_vector_version_id)} \xB7 ${s.judgment_vector_version_status||"legacy"}`,{mono:!0})}
          ${Ue("\u524D\u4E00\u7248\u672C",s.judgment_vector_previous_version_id?`#${d(s.judgment_vector_previous_version_id)}`:"\u2014",{mono:!0})}
          ${Ue("\u5F85\u88DC\uFF0F\u8B8A\u66F4\uFF0F\u5931\u6548",`${d(u)} / ${d(c)} / ${d(m)}`)}
          ${Ue("\u6700\u8FD1\u7D22\u5F15",$e(s.judgment_indexed_at),{mono:!0})}
          ${Ue("\u6A21\u578B",s.judgment_vector_model||"\u2014",{mono:!0})}
        </div>
        ${u>0?`<p class="data-version-note is-warn">${f("info",12)}\u5C1A\u6709 ${d(u)} \u7B46\u5224\u6C7A\u5C1A\u672A\u7D22\u5F15\uFF1B\u8ACB\u81F3\u300C\u8CC7\u6599\u8655\u7406 \u2192 Qdrant\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u7248\u672C\u5EFA\u7F6E\u300D\u63A5\u7E8C\u88DC\u9F4A\u3002</p>`:""}
      </section>

      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${f("shield",14)}Qdrant \u6CD5\u898F\uFF0F\u547D\u4EE4\u5411\u91CF\u7D22\u5F15</span>
          ${Ye(J?"degraded":"operational",J?"\u5F85\u66F4\u65B0":"\u4E00\u81F4")}
        </div>
        <div class="index-current-row">
          <span class="badge badge-info">${f("link",11)}Alias</span>
          <strong class="mono">${r(T)}</strong>
          <span class="mono">\u2192 ${r(S)}</span>
          <span class="index-current-copy">v#${d(s.legal_article_vector_version_id||s.legal_index?.version_id)}</span>
        </div>
        ${Yi("\u689D\u6587\u7D22\u5F15\u8986\u84CB",V,`\u5DF2\u7D22\u5F15 ${d(A)} / ${d(U)} \u689D`,ke)}
        <div class="data-version-facts">
          ${Ue("Qdrant points",d(A),{mono:!0})}
          ${Ue("\u73FE\u884C\u689D\u6587",d(U),{mono:!0})}
          ${Ue("\u5411\u91CF\u7DAD\u5EA6",d(s.legal_index?.dimension),{mono:!0})}
          ${Ue("\u6700\u8FD1\u7D22\u5F15",$e(s.legal_article_indexed_at||s.legal_index?.indexed_at),{mono:!0})}
          ${Ue("\u7D22\u5F15\u72C0\u614B",J?"stale":"fresh",{mono:!0})}
          ${Ue("Collection",S,{mono:!0})}
        </div>
      </section>

      <section class="card data-version-card is-wide-grid">
        <div class="side-card-head">
          <span class="side-card-title">${f("folder",14)}Parquet \u8207\u57F7\u884C\u72C0\u614B</span>
          <span class="badge badge-neutral badge-mono">${d(s.parquet_files)} FILES</span>
        </div>
        <div class="data-version-facts">
          ${Ue("\u539F\u59CB Parquet \u6A94\u6848",d(s.parquet_files),{mono:!0})}
          ${Ue("\u5408\u8A08\u5BB9\u91CF",Ie(s.parquet_bytes),{mono:!0})}
          ${Ue("PostgreSQL \u73FE\u884C\u8CC7\u6599",d(s.total_current),{mono:!0})}
          ${Ue("\u8CC7\u6599\u7248\u672C\u7E3D\u6578",d(s.version_count),{mono:!0})}
          ${Ue("\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C",_.status?Q:"\u2014")}
          ${Ue("\u6700\u8FD1\u57F7\u884C\u6642\u9593",pe?$e(pe):"\u2014",{mono:!0})}
          ${Ue("\u6700\u8FD1\u57F7\u884C\u8017\u6642",_.duration_ms?fe(_.duration_ms):"\u2014",{mono:!0})}
          ${Ue("\u6700\u8FD1\u57F7\u884C\u7248\u672C",_.version_id?`#${d(_.version_id)}`:"\u2014",{mono:!0})}
        </div>
        <p class="data-version-note">${f("info",12)}
          \u539F\u59CB Parquet \u4FDD\u7559 raw\uFF0Fdelta \u8207 manifest\uFF1BPostgreSQL \u63D0\u4F9B current metadata \u8207\u7248\u672C\u72C0\u614B\uFF1BQdrant \u53EA\u4FDD\u5B58\u5411\u91CF\u8207 payload\u3002
        </p>
      </section>
    </div>`}function Lu(e){let t=e.data||{};return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${f("history",14)}\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C</span>
      <span class="badge badge-neutral badge-mono">${d(t.run_count)} TOTAL</span>
    </div>
    ${wu(e.recent_runs)}
  </section>`}function ju(e){let t=Number(e);return Number.isFinite(t)?t>=90?"is-danger":t>=70?"is-warn":"":""}function ao(e,t=""){let s=Math.max(0,Math.min(100,Number(e)||0));return`<div class="resource-bar ${t}"><span style="width:${s}%"></span></div>`}function vs(e,t,s,a,n){let i=ju(n);return`<article class="resource-card">
    <div class="resource-card-head">
      <span class="resource-card-label">${f(t,14)}${r(e)}</span>
      <strong>${r(s)}</strong>
    </div>
    ${ao(n,i)}
    <div class="resource-card-detail">${a}</div>
  </article>`}function Tu(e){let t=e.docker||{};if(!t.available)return`<section class="card data-section">
      <div class="side-card-head">
        <span class="side-card-title">${f("layers",14)}Docker</span>
        ${Ye("not_configured","\u672A\u9023\u7DDA")}
      </div>
      <div class="report-empty-inline">${r(t.detail||"Docker daemon \u672A\u9023\u7DDA\u3002")}</div>
    </section>`;let s=[...t.containers||[]].sort((i,o)=>{let l=i.service?0:1,u=o.service?0:1;return l-u||String(i.name).localeCompare(String(o.name))}),a=s.map(i=>`<tr>
        <td><strong>${r(i.name||"\u2014")}</strong>${i.service?`<span class="badge badge-neutral badge-mono">${r(i.service)}</span>`:""}</td>
        <td>${Ye(i.state==="running"?"operational":"degraded",i.state||"\u2014")}</td>
        <td class="cell-number">${i.cpu_percent===null||i.cpu_percent===void 0?"\u2014":`${d(i.cpu_percent)}%`}</td>
        <td class="cell-number">${Ie(i.memory_used)}${i.memory_limit?` / ${Ie(i.memory_limit)}`:""}</td>
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
  </section>`}function Nu(e){return`<div class="resource-section-head">
      <div>
        <div class="section-title">\u5404\u8CC7\u6599\u5EAB\u4F7F\u7528\u8CC7\u6E90</div>
        <div class="section-sub">\u5BB9\u5668 CPU\uFF0FRAM \u8207\u8CC7\u6599\u5EAB\u5167\u90E8\u5BB9\u91CF</div>
      </div>
    </div>
    <div class="resource-db-grid">${(Array.isArray(e.databases)?e.databases:[]).map(s=>{let a=s.id==="postgres",n=Array.isArray(s.tables)?s.tables:[],i=s.status==="operational"?"operational":s.status==="not_configured"?"not_configured":"degraded",o=a?`${Kt("\u8CC7\u6599\u5EAB",`<code>${r(s.database||"\u2014")}</code>`)}
           ${Kt("\u8CC7\u6599\u5EAB\u5927\u5C0F",`<strong>${Ie(s.storage_bytes)}</strong>`)}
           ${Kt("Docker volume",`<strong>${Ie(s.volume_bytes)}</strong>${s.volume_name?` <code>${r(s.volume_name)}</code>`:""}`)}
           ${Kt("\u9023\u7DDA\u6578",`<strong>${d(s.connections)}</strong>`)}`:`${Kt("Collection",`<code>${r(s.collection||"\u2014")}</code>`)}
           ${Kt("Docker volume",`<strong>${Ie(s.volume_bytes)}</strong>${s.volume_name?` <code>${r(s.volume_name)}</code>`:""}`)}
           ${Kt("\u5411\u91CF\u9EDE\u6578",`<strong>${d(s.points_count)}</strong>`)}
           ${Kt("Collections",`<strong>${d(s.collections)}</strong>`)}
           ${Kt("Segments",`<strong>${d(s.segments_count)}</strong>`)}`;return`<article class="resource-db-card">
        <div class="resource-db-head">
          <div>
            <div class="resource-db-title">${r(s.name||"\u2014")}</div>
            <div class="resource-db-kind">${r(s.kind||"")}</div>
          </div>
          ${Ye(i)}
        </div>
        <div class="resource-db-metrics">
          <div><span>CPU</span><strong>${s.cpu_percent===null||s.cpu_percent===void 0?"\u2014":`${d(s.cpu_percent)}%`}</strong></div>
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
      </article>`}).join("")}</div>`}function Ms(e,t,s,a){let n=Number(t)||0,i=a?n/a*100:0;return`<div class="storage-row">
    <div class="storage-row-head">
      <span>${r(e)}</span>
      <strong>${Ie(n)}</strong>
    </div>
    ${ao(i)}
    <div class="storage-row-detail">${s}</div>
  </div>`}function Eu(e){let t=e.storage||{},s=t.application||{},a=t.parquet||{},n=t.docker||{},i=t.volumes||{},o=i.postgres||{},l=i.qdrant||{},u=Number(t.judgment_total_bytes||0);return`<section class="card data-section storage-section">
    <div class="side-card-head">
      <span class="side-card-title">${f("database",14)}\u786C\u789F\u4F7F\u7528\u7D44\u6210</span>
      <span class="badge badge-neutral badge-mono">${Ie(u)}</span>
    </div>
    <div class="storage-list">
      ${Ms("\u524D\u7AEF",s.frontend_bytes,`<span class="mono">${r(s.frontend_path||"\u2014")}</span>`,u)}
      ${Ms("\u5F8C\u7AEF",s.backend_bytes,`<span class="mono">${r(s.backend_path||"\u2014")}</span>`,u)}
      ${Ms("Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5FEB\u53D6",n.layers_bytes,`Images ${Ie(n.images_bytes)} \xB7 Containers ${Ie(n.containers_bytes)} \xB7 Build cache ${Ie(n.build_cache_bytes)}`,u)}
      ${Ms("PostgreSQL volume",o.size_bytes,`<span class="mono">${r(o.name||"\u2014")}</span>`,u)}
      ${Ms("Qdrant volume",l.size_bytes,`<span class="mono">${r(l.name||"\u2014")}</span>`,u)}
      ${Ms("Parquet",a.total_bytes,`\u6CD5\u898F ${Ie(a.law_bytes)} \xB7 \u5224\u6C7A ${Ie(a.judgment_bytes)}`,u)}
    </div>
    <div class="storage-total">
      <span>Judgment \u5143\u4EF6\u5408\u8A08</span>
      <strong>${Ie(u)}</strong>
    </div>
    <div class="side-card-foot">
      \u524D\u7AEF\uFF0B\u5F8C\u7AEF\u7A0B\u5F0F\u3001Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5EFA\u7F6E\u5FEB\u53D6\u3001PostgreSQL\uFF0FQdrant volume \u8207\u539F\u59CB Parquet\uFF1B\u4E0D\u542B .venv \u8207\u5176\u4ED6\u975E Judgment Docker volume\u3002
    </div>
  </section>`}function Ru(e){let t=e.host||{},s=t.cpu||{},a=t.memory||{},n=t.swap||{},i=e.storage||{},o=i.filesystem||{},l=Number(i.judgment_total_bytes||0),u=Array.isArray(e.disk)?e.disk:[],c=u[0]||{},m=Number(o.total_bytes||c.total||0),$=m?l/m*100:0,b=[s.load_1,s.load_5,s.load_15].map(y=>y??"\u2014").join(" / "),p=t.uptime_seconds===null||t.uptime_seconds===void 0?"\u2014":fe(Number(t.uptime_seconds)*1e3),g=[c.label?vs("HDD \u5DF2\u4F7F\u7528","database",`${d(c.percent)}%`,`${Ie(c.used)} / ${Ie(c.total)} \xB7 \u5269\u9918 ${Ie(c.free)}<br><span class="mono">${r(c.path||"")}</span>`,c.percent):"",l?vs("Judgment \u5143\u4EF6\u5408\u8A08","layers",Ie(l),`\u7D04\u5360 HDD ${d($)}% \xB7 \u524D\u7AEF\uFF0F\u5F8C\u7AEF\uFF0FDocker\uFF0FDB volume\uFF0FParquet`,$):"",...u.slice(1).map(y=>vs(`\u786C\u789F \xB7 ${y.label}`,"layers",`${d(y.percent)}%`,`${Ie(y.used)} / ${Ie(y.total)} \xB7 \u5269\u9918 ${Ie(y.free)}<br><span class="mono">${r(y.path||"")}</span>`,y.percent))].filter(Boolean).join("");return`<div class="resource-section-head">
      <div>
        <div class="eyebrow">SYSTEM RESOURCE USAGE</div>
        <div class="section-sub">\u66F4\u65B0\u6642\u9593 ${$e(e.checked_at)} \xB7 ${e.status==="operational"?"\u8CC7\u6E90\u8B80\u53D6\u6B63\u5E38":"\u90E8\u5206\u8CC7\u6E90\u964D\u7D1A"}</div>
      </div>
    </div>
    <div class="resource-grid">
      ${vs("CPU \u4F7F\u7528\u7387","cpu",`${d(s.percent)}%`,`${d(s.logical_cores)} \u908F\u8F2F\u6838\u5FC3 \xB7 ${d(s.physical_cores)} \u5BE6\u9AD4\u6838\u5FC3<br>Load ${r(b)}`,s.percent)}
      ${vs("\u8A18\u61B6\u9AD4","server",`${d(a.percent)}%`,`${Ie(a.used)} / ${Ie(a.total)} \xB7 \u53EF\u7528 ${Ie(a.available)}`,a.percent)}
      ${vs("Swap","layers",`${d(n.percent)}%`,`${Ie(n.used)} / ${Ie(n.total)}`,n.percent)}
      ${vs("\u7A0B\u5E8F\u8207\u958B\u6A5F","activity",`${d(t.processes)} \u500B\u7A0B\u5E8F`,`\u958B\u6A5F ${r(p)}<br>${r(t.platform||"")}`,null)}
    </div>
    <div class="resource-grid resource-disk-grid">${g||'<div class="report-empty-inline">\u627E\u4E0D\u5230\u53EF\u8B80\u53D6\u7684\u78C1\u789F\u3002</div>'}</div>
    ${Eu(e)}
    ${Tu(e)}
    ${Nu(e)}`}function Xi(){return`<div class="resource-section-head">
      <div>
        <div class="skeleton skeleton-line" style="width:160px;height:18px"></div>
        <div class="skeleton skeleton-line" style="width:260px;margin-top:8px"></div>
      </div>
    </div>
    <div class="resource-grid">
      ${Array.from({length:4}).map(()=>'<div class="skeleton" style="height:120px;border-radius:var(--radius-md)"></div>').join("")}
    </div>
    <div class="skeleton" style="height:180px;margin-top:16px;border-radius:var(--radius-md)"></div>
    <div class="skeleton" style="height:220px;margin-top:16px;border-radius:var(--radius-md)"></div>`}function Cu(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SYSTEM RESOURCE USAGE</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${He({tone:"danger",title:"\u8CC7\u6E90 API \u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-resources-retry">
          ${f("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function Pu(e){return e.status==="operational"?{label:"\u5DF2\u9023\u7DDA",badge:"badge-ok"}:{label:"\u7121\u6CD5\u9023\u7DDA",badge:"badge-danger"}}function Iu(e,t){let s=Pu(e),a=Array.isArray(e.models)?e.models:[],n=a.length?a.map(i=>{let o=String(i.name||""),l=e.chat_model===o,u=e.embedding_model===o,c=i.size?Ie(i.size):"",m=i.modified_at?$e(i.modified_at):"",$=new Set((i.capabilities||[]).map(p=>String(p||"").toLowerCase())),b=[];return i.supports_chat===!0&&b.push(["Chat","badge-ok"]),$.has("embedding")&&b.push(["Embedding","badge-info"]),$.has("vision")&&b.push(["Vision","badge-neutral"]),$.has("tools")&&b.push(["Tools","badge-neutral"]),$.has("thinking")&&b.push(["Thinking","badge-neutral"]),$.has("speech")&&b.push(["Speech","badge-warn"]),i.is_reranker&&b.push(["Reranker","badge-neutral"]),b.length||b.push([i.capability_status==="untested"?"\u672A\u6E2C\u8A66":"\u7121 chat \u80FD\u529B","badge-neutral"]),`<div class="ollama-model-row">
            <div class="ollama-model-main">
              <strong>${r(o)}</strong>
              <span class="ollama-model-meta">${[c,m].filter(Boolean).map(p=>r(p)).join(" \xB7 ")||"\u2014"}</span>
              <div class="ollama-model-capabilities">${b.map(([p,g])=>`<span class="badge ${g}">${r(p)}</span>`).join("")}</div>
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
  </article>`}function Du(e,t,s,a){if(s)return`<div class="report-card">
      ${He({tone:"danger",title:"Model Provider \u8B80\u53D6\u5931\u6557",text:r(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
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
      ${t?'<div class="ollama-loading"><span class="spinner"></span><span>\u8B80\u53D6 Ollama \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span></div>':i.length?`<div class="ollama-host-list">${i.map(c=>Iu(c,a)).join("")}</div>`:pt({iconName:"server",title:"\u5C1A\u672A\u8A2D\u5B9A Ollama \u4E3B\u6A5F",text:"\u8ACB\u5728\u4E0A\u65B9\u8F38\u5165\u7DB2\u5740\u8207 Port \u65B0\u589E\uFF0C\u6216\u4F7F\u7528 .env \u7684\u9810\u8A2D\u9023\u7DDA\u3002"})}
      <p class="report-sub" style="margin-top:12px">\u8A2D\u70BA\u804A\u5929\u6216\u5D4C\u5165\u6A21\u578B\u5F8C\uFF0C\u7CFB\u7D71\u6703\u4F7F\u7528\u76EE\u524D\u4E3B\u6A5F\u7684\u5C0D\u61C9\u6A21\u578B\u57F7\u884C AI \u51FA\u984C\u8207 RAG\uFF1B\u672A\u8A2D\u5B9A\u6642\u6CBF\u7528 .env \u7684 LLM_MODEL\uFF0FEMBEDDING_MODEL\u3002</p>
    </div>
  </div>`}function Ou(e,t,s){let a=e?.data||{},n=e?Et(e.status):null,i=s?Et(s.status):null,o={overview:n?`<span class="badge ${n.tone==="ok"?"badge-ok":n.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${r(n.label)}</span>`:"",resources:i?`<span class="badge ${i.tone==="ok"?"badge-ok":i.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${r(i.label)}</span>`:'<span class="badge badge-neutral badge-mono">\u672A\u8B80\u53D6</span>',data:`<span class="badge badge-neutral badge-mono">${d(a.version_count)}</span>`,tests:'<span class="badge badge-neutral badge-mono">TEST</span>',"local-model":'<span class="badge badge-neutral badge-mono">OLLAMA</span>',runs:`<span class="badge badge-neutral badge-mono">${d(a.run_count)}</span>`};return`<div class="status-sidebar-head">
      <div class="eyebrow">STATUS SECTIONS</div>
      <div class="status-sidebar-title">\u7CFB\u7D71\u5206\u985E</div>
    </div>
    <nav class="status-tab-list" aria-label="\u7CFB\u7D71\u72C0\u614B\u5206\u985E">
      ${to.map(l=>{let u=l.id===t;return`<button class="status-tab${u?" is-active":""}" type="button"
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
      <span class="mono">${r(e?$e(e.checked_at):"\u2014")}</span>
    </div>`}function Bu(e,t,s,a,n,i,o){if(e==="resources")return s?Ru(s):a?Xi():n?Cu(n):Xi();if(e==="local-model"){let l=i||{},u=!!l.loading||!l.hosts&&!l.error;return Du(l.hosts||null,u,l.error||null,l.editingId||null)}return e==="architecture"?Au(t):e==="api"?qu(t):e==="data"?Mu(t,o):e==="runs"?Lu(t):xu(t)}function Fu(){return`<div class="status-hero">
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
    </div>`}function Zi(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">STATUS CHECK</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u5FEB\u53D6\u6216\u63A8\u6E2C\u7684\u670D\u52D9\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${He({tone:"danger",title:"\u72C0\u614B API \u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-retry">
          ${f("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}async function Hu(e,t){let s=!1,a=null,n=null,i="overview",o=null,l=!1,u=null,c=null,m=!1,$=null,b=null,p=null,g=!1,y=null,_=!1,q=!1,M=null,A=0,U="",V="",J=performance.now(),ke=new Date().toISOString(),Se=!1;e.innerHTML=`<section class="page status-page">
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
      <section class="status-panel" id="status-content">${Fu()}</section>
    </div>
  </section>`;let F=e.querySelector("#status-nav"),T=e.querySelector("#status-content"),S=e.querySelector("#refresh-status"),E=e.querySelector("#auto-refresh"),se=()=>{if(A+=1,typeof M=="function")try{M()}catch{}M=null,_=!1,q=!1},le=async()=>{let ne=++A;q=!0,V="",T.innerHTML="";try{let me=await Hn(T,{setTitle:()=>{}},{embedded:!0});if(ne!==A||i!=="tests"){typeof me=="function"&&me();return}M=typeof me=="function"?me:null,_=!0}catch(me){ne===A&&i==="tests"&&(T.innerHTML=Zi(me))}finally{ne===A&&(q=!1)}},Q=()=>{if(!n)return;let ne=Ou(n,i,o);if(ne!==U&&(F.innerHTML=ne,U=ne),i==="tests"){!_&&!q&&le();return}se();let me=Bu(i,n,o,l,u,{hosts:c,loading:m,error:$,editingId:b},{info:p,loading:g,error:y});me!==V&&(T.innerHTML=me,V=me)},pe=async({quiet:ne=!1}={})=>{if(!l){l=!0,u=null,i==="resources"&&!o&&Q();try{let me=await K.systemUsage();if(s)return;o=me}catch(me){if(s)return;u=me,ne||C(me.message||"\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90\u3002","danger")}finally{s||(l=!1,i==="resources"&&Q())}}},ye=async({quiet:ne=!1}={})=>{if(!g){g=!0,y=null,i==="data"&&!p&&Q();try{let me=await kr();if(s)return;p=me}catch(me){if(s)return;y=me,ne||C(me.message||"\u7121\u6CD5\u8B80\u53D6 IndexedDB\u3002","danger")}finally{s||(g=!1,i==="data"&&Q())}}},I=async({quiet:ne=!1}={})=>{if(!m){m=!0,$=null,i==="local-model"&&!c&&Q();try{let me=await K.ollamaHosts();if(s)return;c=me}catch(me){if(s)return;$=me,ne||C(me.message||"\u7121\u6CD5\u53D6\u5F97 Ollama \u4E3B\u6A5F\u3002","danger")}finally{s||(m=!1,i==="local-model"&&Q())}}},we=async()=>{await I({quiet:!0}),await G({quiet:!0})},G=async({quiet:ne=!1,status:me=null}={})=>{ne||(S.disabled=!0,Ne(S,!0,"\u6AA2\u67E5\u4E2D\u2026"));let ge=performance.now(),Le=new Date().toISOString(),be=ge,Ee=Le;try{let Fe=me||await K.status();if(be=performance.now(),Ee=new Date().toISOString(),s)return;let et=!me&&!Se?Math.max(0,ge-J):0;Fe.page_pipeline=Fe.pipeline||!n?.page_pipeline?ku(Fe,{initMs:et,initStartedAt:ke,requestStartedAt:Le,requestFinishedAt:Ee,requestMs:be-ge}):n.page_pipeline,Se=!0,n=Fe,Q(),ne||C("\u670D\u52D9\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(Fe){if(s)return;i!=="tests"&&(V="",T.innerHTML=Zi(Fe)),ne||C(Fe.message||"\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002","danger")}finally{s||(S.disabled=!1,Ne(S,!1))}},he=async({quiet:ne=!1,status:me=null}={})=>{if(await G({quiet:ne,status:me}),i==="resources"&&await pe({quiet:ne}),i==="local-model"&&await I({quiet:ne}),!ne&&i==="tests"){let ge=T.querySelector("#tests-refresh");ge&&ge.click()}};F.addEventListener("click",ne=>{let me=ne.target.closest("[data-status-tab]");if(!me)return;let ge=me.dataset.statusTab;to.some(Le=>Le.id===ge)&&(i=ge,Q(),i==="resources"&&!o&&!l&&pe(),i==="data"&&!p&&!g&&ye(),i==="local-model"&&I())}),T.addEventListener("click",ne=>{ne.target.closest("#status-retry")&&G(),ne.target.closest("#status-resources-retry")&&pe()}),T.addEventListener("click",async ne=>{let me=ne.target.closest("[data-ollama-action]");if(!me)return;let ge=me.dataset.ollamaAction,Le=Number(me.dataset.id||0);if(ge==="refresh-hosts"){await I();return}if(ge==="edit-host"){b=Le,Q(),e.querySelector(".ollama-host-form")?.scrollIntoView({behavior:"smooth",block:"center"});return}if(ge==="cancel-host-edit"){b=null,Q();return}if(ge==="delete-host"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 Ollama \u4E3B\u6A5F #${Le}\uFF1F`))return;try{await K.deleteOllamaHost(Le),Number(b)===Le&&(b=null),C("Ollama \u4E3B\u6A5F\u5DF2\u522A\u9664\u3002","info"),await we()}catch(be){C(be.message||"\u522A\u9664\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(ge==="activate-host"){try{await K.activateOllamaHost(Le),C("\u5DF2\u5207\u63DB\u4F7F\u7528\u7684 Ollama \u4E3B\u6A5F\u3002","ok"),await we()}catch(be){C(be.message||"\u5207\u63DB\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(ge==="deactivate-host"){try{await K.deactivateOllamaHosts(),C("\u5DF2\u505C\u7528\u6307\u5B9A\u7684 Ollama \u4E3B\u6A5F\uFF0C\u5C07\u6CBF\u7528 .env \u8A2D\u5B9A\u3002","info"),await we()}catch(be){C(be.message||"\u505C\u7528\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(ge==="check-capabilities"){Ne(me,!0,"\u6AA2\u67E5\u4E2D\u2026");try{await K.checkOllamaCapabilities(),C("\u5DF2\u66F4\u65B0\u6240\u6709\u4E3B\u6A5F\u7684\u6A21\u578B\u80FD\u529B\u3002","ok",4e3),await we()}catch(be){C(be.message||"\u7121\u6CD5\u6AA2\u67E5\u6A21\u578B\u80FD\u529B\u3002","danger",7e3)}finally{Ne(me,!1)}return}if(ge==="select-model"||ge==="clear-model"){let be=String(me.dataset.model||""),Ee=String(me.dataset.role||"");try{ge==="select-model"?(await K.selectOllamaModel(Le,{model:be,role:Ee}),C(`\u5DF2\u8A2D\u5B9A ${Ee==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\uFF1A${be}`,"ok")):(await K.clearOllamaModel(Le,{model:be,role:Ee}),C(`\u5DF2\u53D6\u6D88 ${Ee==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\u3002`,"info")),await we()}catch(Fe){C(Fe.message||"\u6A21\u578B\u8A2D\u5B9A\u5931\u6557\u3002","danger")}}}),T.addEventListener("submit",async ne=>{let me=ne.target.closest("form[data-ollama-form='host']");if(!me)return;ne.preventDefault();let ge=new FormData(me),Le=Number(ge.get("host_id")||0),be={name:String(ge.get("name")||"").trim(),url:String(ge.get("url")||"").trim(),port:Number(ge.get("port")||11434)};try{Le?(await K.updateOllamaHost(Le,be),C("Ollama \u4E3B\u6A5F\u5DF2\u66F4\u65B0\u3002","ok")):(await K.addOllamaHost(be),C("Ollama \u4E3B\u6A5F\u5DF2\u65B0\u589E\u3002","ok")),b=null,await we()}catch(Ee){let Fe=Ee.detail||Ee.payload?.detail,et=Fe?.errors?.join(" \xB7 ")||Fe?.message||Ee.message||"\u5132\u5B58\u4E3B\u6A5F\u5931\u6557\u3002";C(et,"danger",8e3)}}),T.addEventListener("toggle",ne=>{let me=ne.target.closest?.(".status-wf-stage[data-status-wf-stage]");if(!me||!T.contains(me))return;let ge=me.dataset.statusWfStage||"";ge&&(me.open?zn.add(ge):zn.delete(ge))},!0),S.addEventListener("click",()=>he());let Te=()=>{a&&(a(),a=null)};return E.addEventListener("change",()=>{Te(),E.checked&&(a=xt("status",(ne,me)=>{s||he({quiet:!0,status:me?.snapshot||null})}),he({quiet:!0}),C("\u5DF2\u555F\u7528\u5F8C\u7AEF\u63A8\u9001\u81EA\u52D5\u66F4\u65B0\uFF08\u6BCF 30 \u79D2\uFF09\u3002","info",2200))}),await G({quiet:!0}),ye({quiet:!0}),t&&typeof t.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"),()=>{s=!0,se(),Te()}}var no="home",Ca={home:{page:rn,title:"Judgment RAG Console \xB7 \u6CD5\u898F\u8207\u5224\u6C7A\u6AA2\u7D22"},rag:{page:An,title:"RAG \u63D0\u554F \xB7 Judgment RAG Console"},data:{page:vn,title:"\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"},quality:{page:Fn,title:"\u8CC7\u6599\u54C1\u8CEA \xB7 Judgment RAG Console"},performance:{page:kn,title:"\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"},processing:{page:Pn,title:"\u8CC7\u6599\u8655\u7406 \xB7 Judgment RAG Console"},status:{page:Un,title:"\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"},tests:{page:Ta,title:"\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"}},Qn=document.getElementById("app-main"),Ea=null,Ra=0;function Jn(){let t=window.location.hash.replace(/^#\/?/,"").trim().split("/")[0]||no;return Object.prototype.hasOwnProperty.call(Ca,t)?t:no}function zu(e){document.querySelectorAll("[data-route]").forEach(t=>{let s=t.dataset.route===e;t.classList.toggle("is-active",s),s?t.setAttribute("aria-current","page"):t.removeAttribute("aria-current")})}function Uu(e){return`<section class="page">
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
  </section>`}async function Gn(){let e=Jn(),t=++Ra;if(zu(e),window.location.hash!==`#/${e}`&&window.history.replaceState(null,"",`#/${e}`),typeof Ea=="function"){try{Ea()}catch{}Ea=null}document.title=Ca[e].title;let s={route:e,navigate(a){Ca[a]&&(window.location.hash=`#/${a}`)},setTitle(a){t===Ra&&a&&(document.title=a)}};try{let a=Ca[e].page.render(Qn,s);pr(),window.scrollTo({top:0,behavior:"auto"}),Qn.focus({preventScroll:!0});let n=await a;if(t!==Ra){typeof n=="function"&&n();return}Ea=typeof n=="function"?n:null}catch(a){if(t!==Ra)return;console.error("Failed to render route",e,a),Qn.innerHTML=Uu(a);let n=document.getElementById("route-retry");n&&n.addEventListener("click",()=>Gn()),C("\u9801\u9762\u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}}function Qu(){document.addEventListener("keydown",e=>{if(e.key!=="/"||e.metaKey||e.ctrlKey||e.altKey)return;let t=document.activeElement;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable))return;let a=Jn(),n=a==="home"?"home-question":a==="rag"?"rag-question":"";if(!n)return;let i=document.getElementById(n);i&&(e.preventDefault(),i.focus())})}function Gu(){let e=document.querySelector('[data-route="processing"]');if(!e)return;let t=e.querySelector(".nav-update-badge");t||(t=document.createElement("span"),t.className="nav-update-badge",t.hidden=!0,e.appendChild(t));let s=async(a=null)=>{try{let n=a||await K.updatesStatus(),i=Number(n.update_count)||0;i>0?(t.textContent=String(i),t.title=`\u6CD5\u898F\uFF0F\u547D\u4EE4\uFF0F\u5224\u6C7A\u6709 ${i} \u9805\u66F4\u65B0`,t.hidden=!1):t.hidden=!0}catch{t.hidden=!0}};s(),xt("updates",(a,n)=>s(n?.snapshot||null)),window.addEventListener("judgment:updates-changed",()=>s())}function ro(){gr(),Qu(),Gu(),window.addEventListener("hashchange",Gn),Gn(),ea()&&window.setTimeout(()=>{Jn()==="rag"&&(window.location.hash="#/tests")},700)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",ro):ro();})();
