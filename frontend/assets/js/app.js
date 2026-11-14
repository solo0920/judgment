(()=>{var Oi=Object.defineProperty;var Ht=(e,t)=>{for(var s in t)Oi(e,s,{get:t[s],enumerable:!0})};var Ea="judgment.api_base",Ca="http://127.0.0.1:9200",it=class extends Error{constructor(t,s=0,a=null){super(t),this.name="ApiError",this.status=s,this.detail=a}};function Bn(e){return["localhost","127.0.0.1","::1","[::1]"].includes(e)}function Ut(e){let t=String(e??"").trim();if(!t||t==="/")return"";t=t.replace(/\/+$/,""),!/^https?:\/\//i.test(t)&&!t.startsWith("/")&&(t=`${Bn(t.split(":")[0])?"http":"https"}://${t}`);try{let s=new URL(t,window.location.href);return s.protocol!=="http:"&&s.protocol!=="https:"?"":`${s.origin}${s.pathname==="/"?"":s.pathname.replace(/\/+$/,"")}`}catch{return t}}function Ra(e){let t=Ut(e);if(!t)return!0;try{let s=new URL(t);return s.protocol==="http:"||s.protocol==="https:"}catch{return!1}}function Pa(){try{let e=new URLSearchParams(window.location.search);return e.has("api")?Ut(e.get("api")):null}catch{return null}}function Ia(){try{let e=window.localStorage.getItem(Ea);return e===null?null:Ut(e)}catch{return null}}function Ba(){let e=window.JUDGMENT_CONFIG&&window.JUDGMENT_CONFIG.apiBase;return Ut(e||"")}function Qt(){let e=Pa();if(e!==null)return e;let t=Ia();if(t!==null)return t;let s=Ba();return s||(window.location.protocol==="file:"?Ca:"")}function Di(){if(Pa()!==null)return!0;let e=Ia();return e!==null?!!e:!!Ba()}function Gt(){return Pa()!==null?"query":Ia()!==null?"storage":Ba()?"config":window.location.protocol==="file:"?"file-default":"same-origin"}function Vs(){return Di()||window.location.protocol==="file:"||!window.JUDGMENT_CONFIG?!1:!Bn(window.location.hostname)}function Oa(e){let t=Ut(e);try{t?window.localStorage.setItem(Ea,t):window.localStorage.removeItem(Ea)}catch{}return t}function ts(e=Qt()){return e||"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"}function ft(e,t=Qt()){return t?`${t}${e.startsWith("/")?e:`/${e}`}`:e}function bt(e,t,{onError:s=null,onProgress:a=null}={}){let n=(Array.isArray(e)?e:[e]).map(c=>String(c||"").trim()).filter(Boolean);if(!n.length||typeof EventSource>"u")return()=>{};let i=new EventSource(ft(`/api/events/stream?topic=${encodeURIComponent(n.join(","))}`)),o=0;i.onopen=()=>{o+=1};let l=c=>{let b={};try{b=JSON.parse(c.data||"{}")}catch{b={}}b.initial&&o<=1&&!b.snapshot||t?.(b.topic||n[0],b)},u=c=>{let b={};try{b=JSON.parse(c.data||"{}")}catch{b={}}a?.(b.topic||n[0],b)};return i.addEventListener("refresh",l),i.addEventListener("progress",u),i.onerror=()=>{s?.()},()=>{i.removeEventListener("refresh",l),i.removeEventListener("progress",u),i.close()}}function Da(e){return`\u7121\u6CD5\u9023\u7DDA\u5230\u4F3A\u670D\u5668${e?`\uFF08${e}\uFF09`:""}\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u662F\u5426\u555F\u52D5\uFF0C\u6216\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u8A2D\u5B9A\u5F8C\u7AEF\u4F4D\u5740\u3002`}async function ae(e,t={}){let s=Qt(),a=new AbortController,n=t.timeout===void 0?3e4:t.timeout,i=n>0?window.setTimeout(()=>a.abort(),n):null,o=Date.now(),l=performance.now(),u=t.requestId||On(),c={Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},"X-Judgment-Request-Id":u,"X-Judgment-Client-Started-At":String(o),...t.headers||{}},b;try{b=await fetch(ft(e,s),{...t,headers:c,signal:a.signal})}catch(_){throw _.name==="AbortError"?new it("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new it(Da(s),0,_)}finally{i&&window.clearTimeout(i)}let $=null;if((b.headers.get("content-type")||"").includes("application/json"))try{$=await b.json()}catch{$=null}else try{$=await b.text()}catch{$=null}let f=performance.now(),h=b.headers.get("X-Judgment-Request-Id")||u;if(t.trackClient!==!1&&h){let _=Math.round(performance.now()-l);window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{Dn({request_id:h,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:_,render_ms:Math.max(0,Math.round(performance.now()-f)),status:b.ok?"success":"failed"})})})}if(!b.ok){let _=$&&typeof $=="object"?$.detail||$.message:$,S=typeof _=="string"&&_?_:`\u4F3A\u670D\u5668\u56DE\u61C9 ${b.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new it(S,b.status,_)}return $}function On(){try{if(window.crypto&&typeof window.crypto.randomUUID=="function")return window.crypto.randomUUID().replace(/-/g,"").slice(0,32)}catch{}return`req${Date.now().toString(36)}${Math.random().toString(36).slice(2,10)}`}function Dn(e){try{fetch(ft("/api/performance/client",Qt()),{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e),keepalive:!0}).catch(()=>{})}catch{}}async function Fn(e){let t=Ut(e);if(!Ra(t))throw new it("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002");let s=performance.now(),a=new AbortController,n=window.setTimeout(()=>a.abort(),1e4);try{let i=await fetch(ft("/api/health",t),{headers:{Accept:"application/json"},signal:a.signal});if(!i.ok)throw new it(`API \u56DE\u61C9 ${i.status}\u3002`,i.status);let o=await i.json();return{base:t,version:o.version||"\u2014",duration_ms:Math.round(performance.now()-s)}}catch(i){throw i instanceof it?i:i.name==="AbortError"?new it("\u9023\u7DDA\u6E2C\u8A66\u903E\u6642\uFF0C\u8ACB\u78BA\u8A8D API \u4F4D\u5740\u8207\u7DB2\u8DEF\u3002",0,i):new it(Da(t),0,i)}finally{window.clearTimeout(n)}}var z={health(){return ae("/api/health")},status(){return ae("/api/status",{trackClient:!1})},ollamaHosts(){return ae("/api/ollama/hosts",{timeout:3e4,trackClient:!1})},addOllamaHost(e){return ae("/api/ollama/hosts",{method:"POST",body:JSON.stringify(e),timeout:3e4,trackClient:!1})},updateOllamaHost(e,t){return ae(`/api/ollama/hosts/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},deleteOllamaHost(e){return ae(`/api/ollama/hosts/${encodeURIComponent(e)}`,{method:"DELETE",timeout:3e4,trackClient:!1})},activateOllamaHost(e){return ae(`/api/ollama/hosts/${encodeURIComponent(e)}/activate`,{method:"POST",timeout:3e4,trackClient:!1})},deactivateOllamaHosts(){return ae("/api/ollama/hosts/deactivate",{method:"POST",timeout:3e4,trackClient:!1})},reorderOllamaHosts(e){return ae("/api/ollama/hosts/reorder",{method:"POST",body:JSON.stringify({host_ids:e}),timeout:3e4,trackClient:!1})},checkOllamaCapabilities(){return ae("/api/ollama/hosts/capabilities/test",{method:"POST",timeout:18e4,trackClient:!1})},selectOllamaModel(e,t){return ae(`/api/ollama/hosts/${encodeURIComponent(e)}/models/select`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},clearOllamaModel(e,t){return ae(`/api/ollama/hosts/${encodeURIComponent(e)}/models/clear`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},systemUsage(){return ae("/api/system-usage",{trackClient:!1})},indexVersions(){return ae("/api/index-versions",{trackClient:!1})},indexVersion(e){return ae(`/api/index-versions/${encodeURIComponent(e)}`,{trackClient:!1})},validateIndexVersion(e){return ae(`/api/index-versions/${encodeURIComponent(e)}/validate`,{method:"POST",trackClient:!1})},activateIndexVersion(e){return ae(`/api/index-versions/${encodeURIComponent(e)}/activate`,{method:"POST",trackClient:!1})},rollbackIndexVersion(){return ae("/api/index-versions/rollback",{method:"POST",trackClient:!1})},reconcileIndexAlias(e=!1){let t=new URLSearchParams({repair:e?"true":"false"});return ae(`/api/index-alias/reconcile?${t.toString()}`,{trackClient:!1})},catalog(){return ae("/api/catalog")},query({database:e,filters:t,page:s=1,pageSize:a=25}){return ae("/api/query",{method:"POST",body:JSON.stringify({database:e,filters:t,page:s,page_size:a})})},dataSuggest({kind:e,query:t="",limit:s=12}){let a=new URLSearchParams({kind:e,query:t,limit:String(s)});return ae(`/api/data/suggest?${a.toString()}`,{timeout:45e3,trackClient:!1})},schemaSuggest({database:e,table:t,column:s,query:a,limit:n=1e3}){let i=new URLSearchParams({database:e,table:t,column:s,q:a||"",limit:String(n)});return ae(`/api/schema/suggest?${i.toString()}`,{timeout:3e4})},lawDetail(e,t="",s="",a=""){let n=new URLSearchParams({law_key:e});return t&&n.set("source_type",t),s&&n.set("version_id",String(s)),a&&n.set("article_no",String(a)),ae(`/api/law?${n.toString()}`,{timeout:45e3})},judgmentDetail(e,t=""){let s=new URLSearchParams({jid:e});return t&&s.set("source",t),ae(`/api/judgment?${s.toString()}`,{timeout:45e3})},testMode(){return ae("/api/test-mode",{trackClient:!1})},llmModels(){return ae("/api/llm/models",{timeout:6e4,trackClient:!1})},testLlmModels(){return ae("/api/llm/models/test",{method:"POST",timeout:12e4,trackClient:!1})},selectLlmModel(e,t=null){return ae("/api/llm/model",{method:"POST",body:JSON.stringify({model:e,host_id:t}),timeout:3e4,trackClient:!1})},setTestMode(e){return ae("/api/test-mode",{method:"POST",body:JSON.stringify({enabled:!!e}),trackClient:!1})},testRuns(e=20){let t=new URLSearchParams({limit:String(e)});return ae(`/api/test-runs?${t.toString()}`,{trackClient:!1})},testRunCurrent(){return ae("/api/test-runs/current",{trackClient:!1})},testRun(e){return ae(`/api/test-runs/${encodeURIComponent(e)}`,{trackClient:!1})},performanceOptions(){return ae("/api/performance/options",{trackClient:!1})},performance(e={},t=1,s=25){let a=new URLSearchParams;for(let[n,i]of Object.entries(e))i==null||i===""||a.set(n,String(i));return a.set("page",String(t)),a.set("page_size",String(s)),ae(`/api/performance?${a.toString()}`,{timeout:45e3,trackClient:!1})},quality(){return ae("/api/quality",{timeout:18e4,trackClient:!1})},processing(){return ae("/api/processing",{timeout:45e3,trackClient:!1})},processingActive(){return ae("/api/processing/active",{timeout:3e3,trackClient:!1})},judgmentDownloadStatus(){return ae("/api/judgment-download/status",{timeout:3e4,trackClient:!1})},versioningSummary(){return ae("/api/versioning/summary",{trackClient:!1})},updatesStatus(){return ae("/api/updates/status",{trackClient:!1})},checkCourts(){return ae("/api/courts/check",{timeout:6e4,trackClient:!1})},checkLawVersions(){return ae("/api/law-versions/check",{timeout:6e4,trackClient:!1})},checkUpdates(e=[]){let t=Array.isArray(e)&&e.length?{source_types:e}:{};return ae("/api/updates/check",{method:"POST",body:JSON.stringify(t),timeout:12e4,trackClient:!1})},versioningSnapshots(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.limit&&t.set("limit",String(e.limit)),ae(`/api/versioning/judgments/snapshots?${t.toString()}`,{trackClient:!1})},versioningChanges(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit)),ae(`/api/versioning/judgments/changes?${t.toString()}`,{trackClient:!1})},versioningJudgment(e){return ae(`/api/versioning/judgments/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVersion(e){return ae(`/api/versioning/judgments/versions/${encodeURIComponent(e)}`,{trackClient:!1})},versioningVector(e,t){return ae(`/api/versioning/judgments/${encodeURIComponent(e)}/vectors/${encodeURIComponent(t)}`,{trackClient:!1})},versioningAudit(e={}){let t=new URLSearchParams;return e.issue_month&&t.set("issue_month",e.issue_month),e.since_id&&t.set("since_id",String(e.since_id)),e.limit&&t.set("limit",String(e.limit||500)),ae(`/api/versioning/audit?${t.toString()}`,{trackClient:!1})},questionBankStats(){return ae("/api/question-bank/stats",{trackClient:!1})},questionBankItems(e={},t=50,s=0){let a=new URLSearchParams;for(let[n,i]of Object.entries(e))if(!(i==null||i==="")){if(Array.isArray(i)){for(let o of i)o==null||o===""||a.append(n,String(o));continue}a.set(n,String(i))}return a.set("limit",String(t)),a.set("offset",String(s)),ae(`/api/question-bank/items?${a.toString()}`,{timeout:45e3,trackClient:!1})},questionBankTags(e="",t=12){let s=new URLSearchParams({query:e,limit:String(t)});return ae(`/api/question-bank/tags?${s.toString()}`,{timeout:45e3,trackClient:!1})},questionBankItem(e){return ae(`/api/question-bank/items/${encodeURIComponent(e)}`,{timeout:45e3,trackClient:!1})},createQuestionBankItem(e){return ae("/api/question-bank/items",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},createQuestionBankItemWithAI(e){return ae("/api/question-bank/ai-items",{method:"POST",body:JSON.stringify(e),timeout:42e4,trackClient:!1})},updateQuestionBankItem(e,t){return ae(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteQuestionBankItem(e){return ae(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},restoreQuestionBankItem(e){return ae(`/api/question-bank/items/${encodeURIComponent(e)}/restore`,{method:"POST",timeout:45e3,trackClient:!1})},submitQuestionBankItemForReview(e){return ae(`/api/question-bank/items/${encodeURIComponent(e)}/submit`,{method:"POST",timeout:45e3,trackClient:!1})},reviewQuestionBankItem(e,t){return ae(`/api/question-bank/items/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},importQuestionBank(e){return ae("/api/question-bank/import",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},exportQuestionBank({status:e="accepted"}={}){let t=new URLSearchParams({status:e});return ae(`/api/question-bank/export?${t.toString()}`,{timeout:45e3,trackClient:!1})},revalidateQuestionBank(){return ae("/api/question-bank/revalidate",{method:"POST",body:JSON.stringify({}),timeout:12e4,trackClient:!1})},benchmarkReadyQuestions(e=200){return ae(`/api/question-bank/benchmark-ready?limit=${e}`,{timeout:45e3,trackClient:!1})},benchmarkSuites(){return ae("/api/benchmark/suites",{timeout:45e3,trackClient:!1})},benchmarkSuiteLatestAnswers(e){return ae(`/api/benchmark/suites/${encodeURIComponent(e)}/latest-answers`,{timeout:45e3,trackClient:!1})},removeBenchmarkSuiteItem(e,t){return ae(`/api/benchmark/suites/${encodeURIComponent(e)}/items/${encodeURIComponent(t)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},createBenchmarkSuite(e){return ae("/api/benchmark/suites",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},updateBenchmarkSuite(e,t){return ae(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteBenchmarkSuite(e){return ae(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},benchmarkRuns(e=20){return ae(`/api/benchmark/runs?limit=${e}`,{timeout:45e3,trackClient:!1})},startBenchmarkRun(e){return ae("/api/benchmark/runs",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},benchmarkRun(e,t=!0){return ae(`/api/benchmark/runs/${encodeURIComponent(e)}?include_cases=${t}`,{timeout:45e3,trackClient:!1})},stopBenchmarkRun(e){return ae(`/api/benchmark/runs/${encodeURIComponent(e)}/stop`,{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},reviewBenchmarkResult(e,t){return ae(`/api/benchmark/results/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},benchmarkModels(){return ae("/api/benchmark/models",{timeout:45e3,trackClient:!1})},benchmarkFingerprintHistory(e,t=50){return ae(`/api/benchmark/fingerprints/${encodeURIComponent(e)}?limit=${t}`,{timeout:45e3,trackClient:!1})},processingPlan(){return ae("/api/processing/plan",{timeout:45e3,trackClient:!1})},startProcessingWorkflow(e){return ae(`/api/processing/workflows/${encodeURIComponent(e)}/run`,{method:"POST",body:JSON.stringify({})})},startProcessingUpdate(e=!1){return ae("/api/processing/update",{method:"POST",body:JSON.stringify({index:!!e}),timeout:45e3,trackClient:!1})},stopProcessingUpdate(){return ae("/api/processing/stop",{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},rag(e,t={}){return ae("/api/rag/query",{method:"POST",body:JSON.stringify({question:e}),timeout:t.testMode?0:3e5})},async ragStream(e,{testMode:t=!1,onStep:s=null,onPartial:a=null,onToken:n=null,onTokenReset:i=null}={}){let o=Qt(),l=new AbortController,u=t?0:3e5,c=u>0?window.setTimeout(()=>l.abort(),u):null,b=Date.now(),$=performance.now(),v=On(),f={Accept:"text/event-stream","Content-Type":"application/json","X-Judgment-Request-Id":v,"X-Judgment-Client-Started-At":String(b)},h;try{h=await fetch(ft("/api/rag/query/stream",o),{method:"POST",headers:f,body:JSON.stringify({question:e}),signal:l.signal})}catch(oe){throw oe.name==="AbortError"?new it("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new it(Da(o),0,oe)}finally{c&&window.clearTimeout(c)}if(!h.ok){let oe=null;try{oe=await h.json()}catch{oe=null}let te=oe&&typeof oe=="object"&&oe.detail?String(oe.detail):`\u4F3A\u670D\u5668\u56DE\u61C9 ${h.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new it(te,h.status,oe)}if(!h.body)throw new it("\u4F3A\u670D\u5668\u6C92\u6709\u56DE\u50B3\u53EF\u8B80\u53D6\u7684\u6D41\u7A0B\u4E32\u6D41\u3002",0,null);let _=h.body.getReader(),S=new TextDecoder,R="",O=null,I=null;try{for(;;){let{value:oe,done:te}=await _.read();if(te)break;R+=S.decode(oe,{stream:!0});let je=R.indexOf(`

`);for(;je>=0;){let De=R.slice(0,je).replace(/\r/g,"");R=R.slice(je+2);let X="message",P=[];for(let k of De.split(`
`))k.startsWith("event:")?X=k.slice(6).trim():k.startsWith("data:")&&P.push(k.slice(5).trimStart());if(P.length){let k=null;try{k=JSON.parse(P.join(`
`))}catch{k=null}if(k)if(X==="step"&&typeof s=="function")try{s(k)}catch{}else if(X==="partial"){if(typeof a=="function")try{a(k)}catch{}}else if(X==="token"){if(typeof n=="function")try{n(String(k.text||""))}catch{}}else if(X==="token_reset"){if(typeof i=="function")try{i()}catch{}}else X==="result"?O=k:X==="error"&&(I=new it(k.message||k.detail||"RAG \u6D41\u7A0B\u5931\u6557\u3002",0,k))}je=R.indexOf(`

`)}}}finally{try{await _.cancel()}catch{}c&&window.clearTimeout(c)}if(I)throw I;if(!O)throw new it("\u6D41\u7A0B\u4E32\u6D41\u7D50\u675F\uFF0C\u4F46\u6C92\u6709\u6536\u5230\u6700\u7D42\u56DE\u7B54\u3002",0,null);let Q=Math.round(performance.now()-$);return Dn({request_id:v,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:Q,render_ms:0,status:"success"}),O&&typeof O=="object"&&(O._client_request_id=v),O}};var zn="judgment.theme",Fa="nvidia",Ws=[{id:"vercel",name:"Vercel",description:"\u9ED1\u767D\u7CBE\u6E96 \xB7 Geist \xB7 \u5E7E\u4F55\u7559\u767D",swatches:["#0070f3","#171717","#fafafa"],metaColor:"#ffffff"},{id:"apple",name:"Apple",description:"SF Pro \xB7 \u5927\u5713\u89D2 \xB7 \u6C89\u6D78\u7559\u767D",swatches:["#0066cc","#1d1d1f","#f5f5f7"],metaColor:"#fbfbfd"},{id:"meta",name:"Meta",description:"Optimistic \xB7 \u660E\u4EAE\u85CD \xB7 \u81A0\u56CA\u5143\u4EF6",swatches:["#0064e0","#0091ff","#f1f4f7"],metaColor:"#ffffff"},{id:"nvidia",name:"NVIDIA",description:"GPU \u7DA0 \xB7 \u9ED1\u5E95 \xB7 \u92B3\u5229\u76F4\u89D2",swatches:["#76b900","#000000","#f7f7f7"],metaColor:"#000000"},{id:"ibm",name:"IBM",description:"Carbon \xB7 Plex Sans \xB7 \u4F01\u696D\u85CD",swatches:["#0f62fe","#161616","#f4f4f4"],metaColor:"#161616"},{id:"stripe",name:"Stripe",description:"\u7D2B\u975B\u6F38\u5C64 \xB7 \u7CBE\u5BC6\u91D1\u878D\u611F",swatches:["#635bff","#ea2261","#f6f9fc"],metaColor:"#ffffff"},{id:"linear",name:"Linear",description:"\u6DF1\u7A7A\u9ED1 \xB7 \u975B\u7D2B \xB7 \u6975\u7C21\u7DDA\u689D",swatches:["#17171d","#5e6ad2","#e8e8ec"],metaColor:"#010102"},{id:"figma",name:"Figma",description:"\u591A\u5F69\u8272\u584A \xB7 \u5354\u4F5C\u611F \xB7 \u85CD\u8272\u7126\u9EDE",swatches:["#0d99ff","#a259ff","#0acf83"],metaColor:"#ffffff"},{id:"notion",name:"Notion",description:"\u6696\u767D\u7D19\u5F35 \xB7 \u896F\u7DDA\u6A19\u984C \xB7 \u77E5\u8B58\u5EAB",swatches:["#0075de","#191918","#f7f6f3"],metaColor:"#ffffff"},{id:"openai",name:"OpenAI",description:"\u6696\u7070\u756B\u5E03 \xB7 \u9ED1\u8272\u884C\u52D5 \xB7 \u7DA0\u8272\u8A0A\u865F",swatches:["#10a37f","#0d0d0d","#f9f9f7"],metaColor:"#f9f9f7"}],za=new Map(Ws.map(e=>[e.id,e]));function Fi(e){return za.has(e)}function zi(e){return za.get(e)||za.get(Fa)}function Ha(){try{let e=window.localStorage.getItem(zn);return Fi(e)?e:Fa}catch{return Fa}}function Ua(e,{persist:t=!0}={}){let s=zi(e);document.documentElement.dataset.theme=s.id;let a=document.getElementById("theme-color-meta");if(a&&a.setAttribute("content",s.metaColor),document.querySelectorAll(".theme-option").forEach(n=>{let i=n.dataset.themeId===s.id;n.classList.toggle("is-active",i),n.setAttribute("aria-checked",i?"true":"false")}),t)try{window.localStorage.setItem(zn,s.id)}catch{}return window.dispatchEvent(new CustomEvent("judgment:theme",{detail:{theme:s.id}})),s}var Hi={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},Ui={operational:{label:"\u6B63\u5E38",tone:"ok"},success:{label:"\u6210\u529F",tone:"ok"},ok:{label:"\u6B63\u5E38",tone:"ok"},healthy:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},warning:{label:"\u6CE8\u610F",tone:"warn"},empty:{label:"\u7121\u8CC7\u6599",tone:"warn"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},running:{label:"\u57F7\u884C\u4E2D",tone:"info"},pending:{label:"\u7B49\u5F85",tone:"idle"},skipped:{label:"\u7565\u904E",tone:"idle"},partial:{label:"\u90E8\u5206\u6210\u529F",tone:"warn"},preview:{label:"\u9810\u89BD\u6A21\u5F0F",tone:"info"},retrieval_only:{label:"\u50C5\u6AA2\u7D22\u7D50\u679C",tone:"warn"},not_indexed:{label:"\u5C1A\u672A\u7D22\u5F15",tone:"warn"},missing_query:{label:"\u7B49\u5F85\u67E5\u8A62",tone:"idle"},client_side:{label:"\u700F\u89BD\u5668\u7AEF",tone:"info"},not_configured:{label:"\u672A\u8A2D\u5B9A",tone:"idle"},unavailable:{label:"\u96E2\u7DDA",tone:"danger"},failed:{label:"\u5931\u6557",tone:"danger"},error:{label:"\u932F\u8AA4",tone:"danger"}},Qi={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},Gi={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},Hn={search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',send:'<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',refresh:'<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 4v5.5H15"/>',copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',check:'<path d="m5 12 4.2 4.2L19 6.5"/>',plus:'<path d="M12 5v14M5 12h14"/>',edit:'<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m13.5 7.5 3 3"/>',trash:'<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v5M14 11v5"/>',upload:'<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>',x:'<path d="m6 6 12 12M18 6 6 18"/>',external:'<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/>',message:'<path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H6l-3 2 1.3-4.2A8.5 8.5 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',history:'<path d="M3.2 12a8.8 8.8 0 1 0 2.8-6.3L3.2 8.5"/><path d="M3 3.5v5h5"/><path d="M12 7.5V12l3 1.8"/>',database:'<ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/><path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/>',layers:'<path d="m12 3 9 4.8-9 4.8-9-4.8L12 3Z"/><path d="m3 12.2 9 4.8 9-4.8"/><path d="m3 16.7 9 4.8 9-4.8"/>',cube:'<path d="m12 2.8 8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4L12 2.8Z"/><path d="m3.8 7.4 8.2 4.6 8.2-4.6"/><path d="M12 12v9.2"/>',browser:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6.5 6.5h.01"/>',download:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',chevronLeft:'<path d="m14.5 5-7 7 7 7"/>',chevronRight:'<path d="m9.5 5 7 7-7 7"/>',chevronDown:'<path d="m5 9 7 7 7-7"/>',arrowRight:'<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',alert:'<path d="M12 3 2.5 20.5h19L12 3Z"/><path d="M12 9v4.5"/><path d="M12 17.5h.01"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',sparkles:'<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"/>',table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M9 9.5V20M15 9.5V20"/>',sliders:'<path d="M4 7h8M16 7h4M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',palette:'<path d="M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h4a5 5 0 0 0 0-10h-4Z"/><circle cx="7.5" cy="10.5" r=".8" fill="currentColor" stroke="none"/><circle cx="10" cy="6.8" r=".8" fill="currentColor" stroke="none"/><circle cx="14.5" cy="6.8" r=".8" fill="currentColor" stroke="none"/>',server:'<rect x="3" y="4" width="18" height="6" rx="1.6"/><rect x="3" y="14" width="18" height="6" rx="1.6"/><path d="M7 7h.01M7 17h.01"/>',brain:'<path d="M9.7 4.2a2.8 2.8 0 0 0-3 2.8 2.8 2.8 0 0 0-1.1 5.2A2.9 2.9 0 0 0 7.8 18a2.9 2.9 0 0 0 3.9 2V4.2a2.8 2.8 0 0 0-2 0Z"/><path d="M14.3 4.2a2.8 2.8 0 0 1 3 2.8 2.8 2.8 0 0 1 1.1 5.2A2.9 2.9 0 0 1 16.2 18a2.9 2.9 0 0 1-3.9 2"/>',cloud:'<path d="M7 18.5h10.5a3.5 3.5 0 0 0 .4-7 5.5 5.5 0 0 0-10.6-1.3A4.2 4.2 0 0 0 7 18.5Z"/>',code:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',play:'<path d="M7 4.5v15l13-7.5-13-7.5Z"/>',file:'<path d="M6 2.8h8l4.5 4.5v13.9H6V2.8Z"/><path d="M14 2.8V7.5h5"/>',activity:'<path d="M3 12h4l2.2-5 4.1 10 2.2-5H21"/>',shield:'<path d="M12 2.8 20 6v6c0 4.7-3.2 8-8 9.2C7.2 20 4 16.7 4 12V6l8-3.2Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',terminal:'<path d="m5 7 5 5-5 5"/><path d="M12 17h7"/>',filter:'<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',link:'<path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10.2 5.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-1.4 1.4a5 5 0 0 0 7.1 7.1l1.2-1.2"/>',grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',pin:'<path d="M9 3.5h6l-1.1 5 2.6 2.6v2.4H7.5v-2.4L10.1 8.5 9 3.5Z"/><path d="M12 13.5v7"/>',more:'<circle cx="4.2" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="19.8" cy="12" r="2.6" fill="currentColor" stroke="none"/>',folder:'<path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h3.7l2 2H18a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5v-9Z"/>',cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9.5 9.5h5v5h-5z"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>'};function r(e){return String(e??"").replace(/[&<>"']/g,t=>Hi[t])}function p(e,t=16,s=""){let a=Hn[e]||Hn.info;return`<svg${s?` class="${r(s)}"`:""} width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a}</svg>`}function d(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?new Intl.NumberFormat("zh-TW").format(s):t}function Le(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=["B","KB","MB","GB","TB"],a=0;for(;t>=1024&&a<s.length-1;)t/=1024,a+=1;return a===0?`${t.toFixed(0)} B`:`${t.toFixed(1)} ${s[a]}`}function Qa(e){if(e instanceof Date)return e;if(typeof e=="number"){let n=new Date(e);return Number.isNaN(n.getTime())?null:n}let t=String(e??"").trim();if(!t)return null;if(/^\d{8}$/.test(t))return new Date(Number(t.slice(0,4)),Number(t.slice(4,6))-1,Number(t.slice(6,8)));let s=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(t),a=new Date(s?`${t}Z`:t);return Number.isNaN(a.getTime())?null:a}function Lt(e){let t=Qa(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit"}).format(t):e?r(e):"\u2014"}function Me(e){let t=Qa(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1}).format(t):e?r(e):"\u2014"}function Ms(e){let t=Qa(e);if(!t)return"";let s=Date.now()-t.getTime();return s<45e3?"\u525B\u525B":s<36e5?`${Math.max(1,Math.round(s/6e4))} \u5206\u9418\u524D`:s<864e5?`${Math.round(s/36e5)} \u5C0F\u6642\u524D`:s<6048e5?`${Math.round(s/864e5)} \u5929\u524D`:Lt(t)}function be(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;if(t<6e4)return`${(t/1e3).toFixed(1)} s`;let s=Math.floor(t/6e4),a=Math.round(t%6e4/1e3);return`${s}m ${a}s`}function Mt(e){return Ui[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function He(e,t){let s=Mt(e);return`<span class="badge ${Qi[s.tone]}"><span class="status-dot ${Gi[s.tone]}"></span>${r(t||s.label)}</span>`}function Ji(e){return e==="law"?'<span class="badge badge-info">\u6CD5\u898F</span>':e==="order"?'<span class="badge badge-neutral">\u547D\u4EE4</span>':e?`<span class="badge badge-neutral">${r(e)}</span>`:'<span class="cell-empty">\u2014</span>'}function Ks(e,t){let s=String(e??"");return s.length>t?`${s.slice(0,t)}\u2026`:s}function Ys(e,t="text"){if(e==null||e==="")return'<span class="cell-empty">\u2014</span>';switch(t){case"boolean":return e?'<span class="badge badge-ok">\u662F</span>':'<span class="badge badge-neutral">\u5426</span>';case"status":return He(String(e));case"source":return Ji(String(e));case"number":return`<span class="mono">${d(e)}</span>`;case"duration":return`<span class="mono">${be(e)}</span>`;case"datetime":return`<span class="mono">${Me(e)}</span>`;case"date":return`<span class="mono">${Lt(e)}</span>`;case"url":{let s=String(e),a=Ks(s.replace(/^https?:\/\//,""),46);return`<span class="cell-url"><a href="${r(s)}" target="_blank" rel="noopener noreferrer" title="${r(s)}">${p("external",10)}${r(a)}</a></span>`}case"mono":{let s=String(e);return`<span class="cell-mono cell-truncate" title="${r(s)}">${r(Ks(s,54))}</span>`}case"longtext":{let s=String(e);return`<span class="cell-truncate" title="${r(s)}">${r(Ks(s,100))}</span>`}default:{let s=String(e);return`<span class="cell-truncate" title="${r(s)}">${r(Ks(s,90))}</span>`}}}function Re({tone:e="info",title:t,text:s,iconName:a="info"}){let n=e==="ok"?"check":e==="danger"||e==="warn"?"alert":"i";return`<div class="notice notice-${e}" role="status">
    <span class="notice-icon" aria-hidden="true">${n==="i"?"i":p(n,12)}</span>
    <div class="notice-body">
      ${t?`<strong>${r(t)}</strong>`:""}
      ${s?`<p>${s}</p>`:""}
    </div>
  </div>`}function ot({iconName:e="search",title:t,text:s="",actions:a="",className:n=""}){return`<div class="empty-state ${n}">
    <span class="empty-icon">${p(e,24)}</span>
    <h3 class="empty-title">${r(t)}</h3>
    ${s?`<p class="empty-text">${s}</p>`:""}
    ${a?`<div class="empty-actions">${a}</div>`:""}
  </div>`}function qe(e,t,s="\u8655\u7406\u4E2D\u2026"){e&&(t?(e.dataset.idleHtml||(e.dataset.idleHtml=e.innerHTML),e.disabled=!0,e.classList.add("is-loading"),e.innerHTML=`<span class="spinner" aria-hidden="true"></span><span>${r(s)}</span>`):(e.disabled=!1,e.classList.remove("is-loading"),e.dataset.idleHtml&&(e.innerHTML=e.dataset.idleHtml,delete e.dataset.idleHtml)))}function A(e,t="info",s=4200){let a=document.getElementById("toast-region");if(!a)return null;let n={info:"i",ok:"\u2713",warn:"!",danger:"\xD7"},i=document.createElement("div");i.className=`toast toast-${t}`,i.setAttribute("role",t==="danger"?"alert":"status"),i.innerHTML=`<span class="toast-mark" aria-hidden="true">${n[t]||"i"}</span>
    <div class="toast-body">${r(e)}</div>
    <button class="toast-close" type="button" aria-label="\u95DC\u9589\u901A\u77E5">\xD7</button>`;let o=()=>{i.isConnected&&(i.classList.add("is-leaving"),window.setTimeout(()=>i.remove(),190))};return i.querySelector(".toast-close").addEventListener("click",o),a.appendChild(i),s>0&&window.setTimeout(o,s),i}async function ps(e){try{return await navigator.clipboard.writeText(e),!0}catch{let s=document.createElement("textarea");s.value=e,s.setAttribute("readonly",""),s.style.position="fixed",s.style.opacity="0",document.body.appendChild(s),s.select();let a=!1;try{a=document.execCommand("copy")}catch{a=!1}return s.remove(),a}}function jt(e,t,s="text/plain;charset=utf-8"){let a=new Blob([t],{type:s}),n=URL.createObjectURL(a),i=document.createElement("a");i.href=n,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(n),1e3)}var Xs="judgment.fontSizes.v1",Ka="judgment.appearance",Wn=new Set(["light","dark","system"]),Un="light",js=window.matchMedia("(prefers-color-scheme: dark)"),Vi="font-size",Ns=[{id:"page-title",label:"\u9801\u9762\u6A19\u984C",hint:"\u5404\u9801\u6700\u4E0A\u65B9\u7684 h1 \u6A19\u984C",selectors:[".page-title"],defaultPx:40,min:20,max:72},{id:"home-title",label:"\u9996\u9801\u4E3B\u8996\u89BA\u6A19\u984C",hint:"\u9996\u9801\u6700\u5927\u7684\u4E3B\u6A19\u984C",selectors:[".home-title"],defaultPx:88,min:40,max:140},{id:"section-title",label:"\u5340\u584A\u6A19\u984C",hint:"\u5831\u8868\u3001\u5361\u7247\u8207\u5340\u584A\u6A19\u984C",selectors:[".section-title",".report-title",".side-card-title",".filter-title",".tests-card-title",".status-sidebar-title",".judgment-dialog-head h2"],defaultPx:16,min:10,max:36},{id:"body",label:"\u5167\u6587\u8207\u8AAA\u660E",hint:"\u6BB5\u843D\u3001\u56DE\u7B54\u3001\u8AAA\u660E\u8207\u6458\u8981\u6587\u5B57",selectors:[".answer-text",".page-subtitle",".report-sub",".home-lead",".empty-text",".notice-body p",".citation-snippet",".side-card-body",".detail-list",".field-help",".report-empty-inline",".processing-section-sub",".summary-value-text",".status-summary",".warnings",".law-dialog-warning"],defaultPx:14,min:8,max:28},{id:"table",label:"\u8868\u683C\u5167\u5BB9",hint:"\u8CC7\u6599\u8868\u683C\u7684\u8868\u982D\u8207\u5132\u5B58\u683C",selectors:[".data-table th",".data-table td"],defaultPx:12,min:8,max:24},{id:"meta",label:"\u6A19\u7C64\u8207\u8F14\u52A9\u6587\u5B57",hint:"badge\u3001chip\u3001\u6B04\u4F4D\u6A19\u7C64\u8207 metadata",selectors:[".badge",".chip",".citation-meta",".citation-index",".answer-section-label",".report-kicker",".report-section-title",".eyebrow",".field-label",".summary-label",".metric-label",".footer-bottom",".nav-update-badge"],defaultPx:10,min:7,max:20},{id:"button",label:"\u6309\u9215\u8207\u5C0E\u89BD",hint:"\u64CD\u4F5C\u6309\u9215\u3001\u9801\u9996\u5C0E\u89BD\u8207\u9023\u7D50",selectors:[".btn",".nav-link",".page-btn",".law-link",".judgment-link",".theme-option-name",".theme-option-desc"],defaultPx:13,min:9,max:24},{id:"form",label:"\u8868\u55AE\u8207\u8F38\u5165",hint:"\u8F38\u5165\u6846\u3001\u4E0B\u62C9\u9078\u55AE\u8207 textarea",selectors:["input","textarea","select",".input",".field-input"],defaultPx:14,min:9,max:28},{id:"mono",label:"\u7A0B\u5F0F\u78BC\u8207\u6578\u503C",hint:"\u7B49\u5BEC\u6587\u5B57\u3001\u67E5\u8A62\u8A9E\u53E5\u8207\u7D71\u8A08\u6578\u503C",selectors:[".mono",".cell-mono",".cell-number",".query-code","code",".metric-value",".summary-value",".perf-stat-value",".mini-stat-value"],defaultPx:13,min:8,max:30},{id:"law-page",label:"\u6CD5\u898F\u689D\u6587\uFF08\u9801\u9762\uFF09",hint:"\u6CD5\u898F\u6AA2\u7D22\u7D50\u679C\u8207\u6CD5\u898F\u4F86\u6E90\u5361\u689D\u6587",selectors:[".law-answer-article-text",".law-answer-article-no",".law-source-article-text",".law-source-article-no",".law-article-text",".law-article-no"],excludeAncestors:[".law-dialog"],defaultPx:12,min:9,max:28},{id:"law-dialog",label:"\u6CD5\u898F\u689D\u6587\uFF08\u5F48\u51FA\u8996\u7A97\uFF09",hint:"\u6309\u4E0B\u689D\u6587\u5F8C\u958B\u555F\u7684\u6CD5\u898F dialog",selectors:[".law-dialog .law-article-text",".law-dialog .law-article-no",".law-dialog .law-chapter"],defaultPx:16,min:10,max:32},{id:"judgment-dialog",label:"\u5224\u6C7A\u5168\u6587\uFF08\u5F48\u51FA\u8996\u7A97\uFF09",hint:"\u5224\u6C7A\u539F\u6587 dialog \u7684\u5168\u6587\u5340\u584A",selectors:[".judgment-dialog-text"],defaultPx:23,min:12,max:48}],fs=new Map(Ns.map(e=>[e.id,e])),Ts=new WeakMap,Ct=Zn(),pt={...Ct},Rt=Yn(),Ga=new Set,gs=null,ms=null,lt=null,ss=null,Qn=null,Jt=Vi,Vt=!1,Ja=null,Va=!1,Zs="";function Kn(e,t,s){return Math.min(s,Math.max(t,e))}function Ya(e){return Math.round(e*10)/10}function ta(e){return Number.isInteger(e)?String(e):e.toFixed(1)}function Yn(){try{let e=window.localStorage.getItem(Ka);return Wn.has(e)?e:Un}catch{return Un}}function Wi(){return Rt==="system"?js.matches?"dark":"light":Rt}function Xn(){document.querySelectorAll("[data-appearance-option]").forEach(e=>{let t=e.dataset.appearanceOption===Rt;e.classList.toggle("is-active",t),e.setAttribute("aria-pressed",t?"true":"false")})}function ea({persist:e=!1}={}){if(document.documentElement.dataset.appearance=Wi(),document.documentElement.dataset.appearanceMode=Rt,Xn(),e)try{window.localStorage.setItem(Ka,Rt)}catch{}}function Ki(e){Wn.has(e)&&(Rt=e,ea({persist:!0}))}function Gn(){Rt==="system"&&ea()}typeof js.addEventListener=="function"?js.addEventListener("change",Gn):typeof js.addListener=="function"&&js.addListener(Gn);function Zn(){let e=null;try{e=JSON.parse(window.localStorage.getItem(Xs)||"null")}catch{e=null}if(!e||typeof e!="object"||Array.isArray(e))return{};let t={};for(let s of Ns){let a=Number(e[s.id]);Number.isFinite(a)&&(t[s.id]=Ya(Kn(a,s.min,s.max)))}return t}function Yi(){try{return Object.keys(Ct).length?window.localStorage.setItem(Xs,JSON.stringify(Ct)):window.localStorage.removeItem(Xs),!0}catch{return!1}}function Cs(e){let t=new Set;for(let s of e.selectors)document.querySelectorAll(s).forEach(a=>{a.closest(".settings-sidebar")||Array.isArray(e.excludeAncestors)&&e.excludeAncestors.some(n=>a.closest(n))||t.add(a)});return Array.from(t)}function er(){if(!Zs)return;let e=fs.get(Zs);if(e)for(let t of Cs(e))t.classList.add("font-size-highlight")}function tr(e){if(bs(),!fs.get(e))return;Zs=e;let s=lt.querySelector(`.font-size-row[data-font-group="${e}"]`);s&&s.classList.add("is-previewing"),er()}function bs(){Zs="",lt.querySelectorAll(".font-size-row.is-previewing").forEach(e=>e.classList.remove("is-previewing")),document.querySelectorAll(".font-size-highlight").forEach(e=>e.classList.remove("font-size-highlight"))}function Xi(e){if(Ts.has(e))return Ts.get(e);let t={inline:e.style.fontSize||"",computed:parseFloat(window.getComputedStyle(e).fontSize)||0};return Ts.set(e,t),t}function Zi(e){let t=Ts.get(e);t&&(t.inline?e.style.fontSize=t.inline:e.style.removeProperty("font-size"))}function eo(e){let t=pt[e.id];if(Number.isFinite(t))for(let s of Cs(e))Xi(s),s.style.fontSize=`${t}px`}function to(e){for(let t of Cs(e))Zi(t)}function Wt(){for(let e of Ga){let t=fs.get(e);t&&to(t)}Ga=new Set;for(let e of Ns)Number.isFinite(pt[e.id])&&(eo(e),Ga.add(e.id));er()}function sr(){Wt(),Vt&&Jt==="font-size"&&Es()}function ar(){Va||(Va=!0,window.requestAnimationFrame(()=>{Va=!1,Wt()}))}function so(){Ja||!document.body||(Ja=new MutationObserver(e=>{if(Object.keys(pt).length){for(let t of e)if(t.type==="childList"&&(t.addedNodes.length||t.removedNodes.length)){ar();return}}}),Ja.observe(document.body,{childList:!0,subtree:!0}))}function ao(e){let t=e.filter(s=>typeof s.getClientRects=="function"&&s.getClientRects().length);return t.length?t:e}function no(){let e=Ns.filter(t=>Cs(t).length>0||Number.isFinite(pt[t.id]));return e.length?e:Ns}function sa(e){let t=pt[e.id];if(Number.isFinite(t))return t;let a=ao(Cs(e)).map(o=>{let l=Ts.get(o);return l&&l.computed?l.computed:parseFloat(window.getComputedStyle(o).fontSize)||0}).filter(o=>o>0).sort((o,l)=>o-l);if(!a.length)return e.defaultPx;let n=Math.floor(a.length/2),i=a.length%2?a[n]:(a[n-1]+a[n])/2;return Ya(i)}function ro(){let e=[{id:"font-size",label:"\u5B57\u578B\u5927\u5C0F",hint:"\u8ABF\u6574\u5404\u6587\u5B57\u5340\u584A",glyph:'<span class="settings-option-aa" aria-hidden="true">Aa</span>'},{id:"theme",label:"\u4ECB\u9762\u98A8\u683C",hint:"\u5207\u63DB\u54C1\u724C\u8996\u89BA\u8A9E\u8A00",glyph:p("palette",15)}];ss.innerHTML=e.map(t=>`<button class="settings-option${Jt===t.id?" is-active":""}" type="button" role="tab"
        data-settings-panel="${t.id}"
        aria-selected="${Jt===t.id?"true":"false"}">
        <span class="settings-option-icon">${t.glyph}</span>
        <span class="settings-option-copy">
          <strong>${r(t.label)}</strong>
          <small>${r(t.hint)}</small>
        </span>
        ${p("chevronRight",12,"settings-option-chevron")}
      </button>`).join("")}function Es(){bs();let e=no(),t=e.map(s=>{let a=ta(sa(s));return`<section class="font-size-row" data-font-group="${s.id}">
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
    </section>`}).join("");lt.innerHTML=`<div class="settings-panel-head">
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
    </div>`}function io(){bs();let e=Ha(),t=Ws.map((n,i)=>{let o=n.swatches.map(l=>`<i style="--swatch:${r(l)}"></i>`).join("");return`<button class="theme-option${n.id===e?" is-active":""}" type="button" role="menuitemradio"
      data-theme-id="${r(n.id)}"
      data-theme="${r(n.id)}"
      aria-checked="${n.id===e?"true":"false"}">
      <span class="theme-option-index">${String(i+1).padStart(2,"0")}</span>
      <span class="theme-option-body">
        <span class="theme-option-name">${r(n.name)}</span>
        <span class="theme-option-desc">${r(n.description)}</span>
      </span>
      <span class="theme-option-active-preview" aria-hidden="true">
        ${p("sliders",11)}
        <span>\u4F5C\u7528\u4E2D</span>
        <span class="theme-option-active-preview-badge">2</span>
      </span>
      <span class="theme-option-swatches" aria-hidden="true">${o}</span>
      <span class="theme-option-check" aria-hidden="true">${p("check",14)}</span>
    </button>`}).join(""),a=`<div class="appearance-switch" role="group" aria-label="\u660E\u6697\u6A21\u5F0F">
    ${[{id:"light",label:"\u4EAE"},{id:"dark",label:"\u6697"},{id:"system",label:"\u7CFB\u7D71"}].map(n=>`<button class="appearance-option" type="button"
          data-appearance-option="${n.id}"
          aria-pressed="${Rt===n.id?"true":"false"}"
          title="${n.id==="system"?"\u8DDF\u96A8\u7CFB\u7D71\u660E\u6697":`${n.label}\u8272\u6A21\u5F0F`}">${n.label}</button>`).join("")}
  </div>`;lt.innerHTML=`<div class="settings-panel-head">
      <div>
        <h3>\u4ECB\u9762\u98A8\u683C</h3>
        <p>\u9078\u64C7\u4E3B\u63A7\u53F0\u7684\u54C1\u724C\u8996\u89BA\u8A9E\u8A00\uFF1B\u4E3B\u984C\u6703\u7ACB\u5373\u5957\u7528\u4E26\u4FDD\u7559\u3002</p>
      </div>
      <div class="settings-panel-head-actions">
        <span class="badge badge-info">${Ws.length} \u7A2E</span>
        ${a}
      </div>
    </div>
    <div class="settings-theme-list" role="menu" aria-label="\u4ECB\u9762\u98A8\u683C">${t}</div>`,Xn()}function oo(){ss.querySelectorAll("[data-settings-panel]").forEach(e=>{let t=e.dataset.settingsPanel===Jt;e.classList.toggle("is-active",t),e.setAttribute("aria-selected",t?"true":"false")})}function Xa(e=Jt){Jt=e==="theme"?"theme":"font-size",oo(),Jt==="theme"?io():Es()}function Jn(e,t,s){let a=Number(t);if(!Number.isFinite(a))return;let n=Ya(Kn(a,e.min,e.max));pt[e.id]=n;let i=s?.querySelector(".font-size-slider");i&&(i.value=String(n));let o=s?.querySelector(".font-size-preview");o&&(o.style.fontSize=`${n}px`),ar()}function lo(){lt.querySelectorAll(".font-size-row").forEach(e=>{let t=fs.get(e.dataset.fontGroup);if(!t)return;let s=pt[t.id]??sa(t),a=e.querySelector(".font-size-number-input");a&&(a.value=ta(s));let n=e.querySelector(".font-size-slider");n&&(n.value=String(s));let i=e.querySelector(".font-size-preview");i&&(i.style.fontSize=`${s}px`)})}function Vn(e){let t=e.target.closest(".font-size-row");if(!t)return;let s=fs.get(t.dataset.fontGroup);if(!s)return;let a=e.target.classList.contains("font-size-number-input");if(!(a&&e.target.value==="")){if(e.type==="input"&&a){let n=Number(e.target.value);if(!Number.isFinite(n))return;Jn(s,n,t);return}if(Jn(s,e.target.value,t),e.type==="input"){let n=t.querySelector(".font-size-number-input");n&&document.activeElement!==n&&(n.value=ta(pt[s.id]??sa(s)))}}}function co(e){if(!e.target.classList.contains("font-size-number-input"))return;let t=e.target.closest(".font-size-row"),s=t?fs.get(t.dataset.fontGroup):null;if(!s)return;let a=pt[s.id]??sa(s);e.target.value=ta(a)}function uo(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||tr(t.dataset.fontGroup)}function po(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||bs()}function mo(e){let t=e.target.closest(".font-size-row");t&&tr(t.dataset.fontGroup)}function go(e){let t=e.target.closest(".font-size-row");!t||t.contains(e.relatedTarget)||bs()}function fo(e){let t=e.target.closest("[data-settings-panel]");if(t){Xa(t.dataset.settingsPanel);return}let s=e.target.closest("[data-settings-action]");if(s){let i=s.dataset.settingsAction;if(i==="save"){Ct={...pt};let o=Yi();lo(),A(o?"\u5B57\u578B\u5927\u5C0F\u5DF2\u5132\u5B58\u3002":"\u5B57\u578B\u5927\u5C0F\u5DF2\u5957\u7528\uFF0C\u4F46\u700F\u89BD\u5668\u7121\u6CD5\u5132\u5B58\u8A2D\u5B9A\u3002",o?"ok":"warn");return}if(i==="cancel"){pt={...Ct},Wt(),Es(),A("\u5DF2\u53D6\u6D88\u672A\u5132\u5B58\u7684\u5B57\u578B\u8B8A\u66F4\u3002","info");return}i==="reset"&&(pt={},Wt(),Es(),A("\u5DF2\u56DE\u5FA9\u9810\u8A2D\u5B57\u578B\uFF1B\u6309\u300C\u5132\u5B58\u300D\u4FDD\u7559\u8B8A\u66F4\u3002","info"));return}let a=e.target.closest("[data-appearance-option]");if(a){Ki(a.dataset.appearanceOption);return}let n=e.target.closest(".theme-option");n&&Ua(n.dataset.themeId)}function bo(){Vt||(Vt=!0,pt={...Ct},document.body.classList.add("settings-open"),gs.removeAttribute("inert"),gs.setAttribute("aria-hidden","false"),ms.setAttribute("aria-expanded","true"),Xa(Jt),Wt(),window.requestAnimationFrame(()=>{let e=ss.querySelector(".settings-option.is-active")||ss.querySelector(".settings-option");e&&e.focus({preventScroll:!0})}))}function Wa({restoreFocus:e=!0}={}){Vt&&(Vt=!1,bs(),pt={...Ct},Wt(),document.body.classList.remove("settings-open"),e&&ms.focus({preventScroll:!0}),gs.setAttribute("aria-hidden","true"),gs.setAttribute("inert",""),ms.setAttribute("aria-expanded","false"))}function nr(){gs=document.getElementById("settings-sidebar"),ms=document.getElementById("settings-trigger"),lt=document.getElementById("settings-panel"),ss=document.getElementById("settings-options"),Qn=document.getElementById("settings-close"),!(!gs||!ms||!lt||!ss)&&(ea(),Ua(Ha(),{persist:!1}),ro(),Es(),so(),Wt(),ms.addEventListener("click",()=>{Vt?Wa():bo()}),Qn?.addEventListener("click",()=>Wa()),ss.addEventListener("click",e=>{let t=e.target.closest("[data-settings-panel]");t&&Xa(t.dataset.settingsPanel)}),lt.addEventListener("click",fo),lt.addEventListener("input",Vn),lt.addEventListener("change",Vn),lt.addEventListener("blur",co,!0),lt.addEventListener("pointerover",uo),lt.addEventListener("pointerout",po),lt.addEventListener("focusin",mo),lt.addEventListener("focusout",go),lt.addEventListener("keydown",e=>{e.key==="Enter"&&e.target.classList.contains("font-size-number-input")&&(e.preventDefault(),e.target.blur())}),document.addEventListener("keydown",e=>{e.key==="Escape"&&Vt&&Wa()}),window.addEventListener("storage",e=>{if(e.key===Ka){Rt=Yn(),ea();return}e.key===Xs&&(Ct=Zn(),Vt||(pt={...Ct},Wt()))}))}var Za={};Ht(Za,{render:()=>ho});var rr=[{route:"rag",icon:"message",kicker:"RAG",title:"RAG \u63D0\u554F",summary:"\u7528\u81EA\u7136\u8A9E\u8A00\u627E\u5230\u6CD5\u898F\u8207\u5224\u6C7A\uFF0C\u7B54\u6848\u9644\u4E0A\u53EF\u56DE\u6EAF\u7684\u5F15\u7528\u4F86\u6E90\u3002",description:"Qdrant \u5411\u91CF\u6AA2\u7D22\u3001LLM \u751F\u6210\u56DE\u7B54\u3001\u5F15\u7528\u9A57\u8B49\u8207 pipeline waterfall\uFF0C\u90FD\u5728\u540C\u4E00\u500B\u5DE5\u4F5C\u5340\u5B8C\u6210\u3002",metric:"Citations first",tone:"feature"},{route:"data",icon:"database",kicker:"EXPLORE",title:"\u8CC7\u6599\u5EAB\u67E5\u8A62",summary:"\u8DE8 PostgreSQL\u3001Parquet\u3001Qdrant \u8207 IndexedDB \u63A2\u7D22\u8CC7\u6599\u3002",description:"\u4EE5 metadata\u3001SQL \u6216\u8A9E\u610F\u67E5\u8A62\u6AA2\u8996\u8CC7\u6599\u8868\uFF0C\u652F\u63F4\u5206\u9801\u3001\u6392\u5E8F\u8207 CSV\uFF0FJSON \u532F\u51FA\u3002",metric:"4 \u7A2E\u8CC7\u6599\u4F86\u6E90",tone:"blue"},{route:"quality",icon:"shield",kicker:"QUALITY",title:"\u8CC7\u6599\u54C1\u8CEA",summary:"\u7528 DuckDB \u76F4\u63A5\u6AA2\u67E5\u539F\u59CB\u5224\u6C7A\u8CC7\u6599\u7684\u5B8C\u6574\u6027\u3002",description:"\u6AA2\u67E5\u91CD\u8907\u3001\u7F3A\u6F0F\u3001\u5F15\u7528\u4E00\u81F4\u6027\u8207 archive \u7D71\u8A08\uFF0C\u4E26\u7DAD\u8B77\u984C\u5EAB\u8207 benchmark \u984C\u7D44\u3002",metric:"DuckDB native",tone:"green"},{route:"performance",icon:"activity",kicker:"OBSERVE",title:"\u6548\u80FD\u5831\u8868",summary:"\u5F9E\u55AE\u6B21\u8ACB\u6C42\u5230\u6574\u9AD4\u7D22\u5F15\uFF0C\u8FFD\u8E64\u6BCF\u4E00\u500B\u6642\u9593\u7247\u6BB5\u3002",description:"\u5B8C\u6574 Flow\u3001RAG Pipeline waterfall\u3001Token\u3001TTFT\u3001\u7D22\u5F15\u541E\u5410\u8207 RAG Benchmark \u4E00\u6B21\u770B\u5B8C\u3002",metric:"ms-level trace",tone:"amber"},{route:"processing",icon:"sliders",kicker:"PIPELINE",title:"\u8CC7\u6599\u8655\u7406",summary:"\u4E0B\u8F09\u3001\u532F\u5165\u3001\u5099\u4EFD\u3001\u7D22\u5F15\uFF0C\u96C6\u4E2D\u7BA1\u7406\u8CC7\u6599\u751F\u547D\u9031\u671F\u3002",description:"\u8FFD\u8E64\u6CD5\u898F\u3001\u547D\u4EE4\u8207\u5224\u6C7A\u6D41\u7A0B\uFF0C\u7BA1\u7406 Ollama \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u8207\u7DDA\u4E0A\u66F4\u65B0\u6AA2\u67E5\u3002",metric:"End-to-end",tone:"violet"},{route:"status",icon:"server",kicker:"STATUS",title:"\u7CFB\u7D71\u72C0\u614B",summary:"\u5373\u6642\u638C\u63E1\u6BCF\u4E00\u500B\u670D\u52D9\u8207\u57FA\u790E\u8A2D\u65BD\u7684\u904B\u4F5C\u72C0\u614B\u3002",description:"FastAPI\u3001PostgreSQL\u3001Qdrant\u3001Ollama\u3001Docker\uFF0Fvolume\u3001\u78C1\u789F\u8207\u8CC7\u6599\u7248\u672C\u3002",metric:"Live health",tone:"slate"},{route:"tests",icon:"check",kicker:"VERIFY",title:"\u7CFB\u7D71\u6E2C\u8A66",summary:"\u5728\u4E0A\u7DDA\u524D\u78BA\u8A8D API\u3001\u6A21\u578B\u8207\u6E2C\u8A66 Flow \u90FD\u6E96\u5099\u597D\u4E86\u3002",description:"\u8A2D\u5B9A API Base\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207 LLM chat \u80FD\u529B\uFF0C\u57F7\u884C\u591A\u6A21\u578B\u6E2C\u8A66\u4E26\u6AA2\u67E5\u7D50\u679C\u3002",metric:"Model ready",tone:"rose"}];function vo(e){return`<a class="home-tile tone-${r(e.tone)}" href="#/${e.route}">
    <span class="home-tile-watermark" aria-hidden="true">${p(e.icon,132)}</span>
    <span class="home-tile-head">
      <span class="home-tile-icon">${p(e.icon,22)}</span>
      <span class="home-tile-kicker">${r(e.kicker)}</span>
    </span>
    <span class="home-tile-copy">
      <strong>${r(e.title)}</strong>
      <span>${r(e.summary)}</span>
    </span>
    <span class="home-tile-foot">
      <span class="home-tile-metric">${r(e.metric)}</span>
      <span class="home-tile-cta">\u63A2\u7D22 ${p("arrowRight",13)}</span>
    </span>
  </a>`}async function ho(e,t){let s=rr[0],a=rr.slice(1).map(vo).join("");e.innerHTML=`<section class="page home-page">
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
              ${p("sparkles",16)}<span>\u958B\u59CB\u6AA2\u7D22</span>
            </button>
          </div>
          <div class="home-ask-help" id="home-ask-help">
            <span><kbd>Enter</kbd> \u9001\u51FA</span>
            <span><kbd>Shift</kbd> + <kbd>Enter</kbd> \u63DB\u884C</span>
            <span>\u9001\u51FA\u5F8C\u5728 RAG \u63D0\u554F\u4E2D\u958B\u555F</span>
          </div>
        </form>
        <div class="home-hero-meta">
          <span>${p("shield",13)}\u53EF\u56DE\u6EAF\u5F15\u7528</span>
          <span>${p("database",13)}\u6CD5\u898F\uFF0B\u5224\u6C7A</span>
          <span>${p("activity",13)}Pipeline waterfall</span>
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
          <span class="home-feature-kicker">${r(s.kicker)} \xB7 ${r(s.metric)}</span>
          <h3>${r(s.title)}<br /><span>${r(s.summary)}</span></h3>
          <p>${r(s.description)}</p>
          <span class="home-feature-cta">\u958B\u59CB\u63D0\u554F ${p("arrowRight",14)}</span>
        </div>
        <div class="home-feature-art" aria-hidden="true">
          <span class="home-feature-orbit orbit-one"></span>
          <span class="home-feature-orbit orbit-two"></span>
          <span class="home-feature-core">${p(s.icon,46)}</span>
          <span class="home-feature-chip chip-qdrant">Qdrant</span>
          <span class="home-feature-chip chip-llm">LLM</span>
          <span class="home-feature-chip chip-cite">Citations</span>
        </div>
      </a>

      <div class="home-tile-grid">${a}</div>
    </div>

    <section class="home-trust" aria-label="\u7CFB\u7D71\u539F\u5247">
      <div class="home-trust-item">
        <span class="home-trust-icon">${p("shield",18)}</span>
        <strong>\u4F86\u6E90\u512A\u5148</strong>
        <p>\u56DE\u7B54\u53EA\u6839\u64DA\u6AA2\u7D22\u5230\u7684\u6CD5\u898F\u8207\u5224\u6C7A\u7247\u6BB5\u751F\u6210\uFF0C\u5F15\u7528\u7DE8\u865F\u53EF\u56DE\u5230\u539F\u59CB\u8CC7\u6599\u3002</p>
      </div>
      <div class="home-trust-item">
        <span class="home-trust-icon">${p("server",18)}</span>
        <strong>\u672C\u6A5F\u6A21\u578B</strong>
        <p>\u900F\u904E Ollama \u4F7F\u7528\u672C\u6A5F\u6216\u5340\u7DB2\u6A21\u578B\uFF0C\u6A21\u578B\u8207\u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u90FD\u53EF\u8ABF\u6574\u3002</p>
      </div>
      <div class="home-trust-item">
        <span class="home-trust-icon">${p("layers",18)}</span>
        <strong>\u7248\u672C\u53EF\u8FFD\u6EAF</strong>
        <p>\u6CD5\u898F\u3001\u5224\u6C7A\u8207\u5411\u91CF\u7D22\u5F15\u4FDD\u7559\u7248\u672C\u8207\u66F4\u65B0\u7D00\u9304\uFF0C\u8CC7\u6599\u8B8A\u66F4\u4E0D\u6703\u9ED8\u9ED8\u6D88\u5931\u3002</p>
      </div>
    </section>
  </section>`;let n=e.querySelector("#home-ask-form"),i=e.querySelector("#home-question"),o=()=>{let u=String(i?.value||"").trim().slice(0,500);if(!u){i?.focus();return}try{window.sessionStorage.setItem("judgment.pending_question",u)}catch{}window.__judgmentPendingQuestion=u,t&&typeof t.navigate=="function"?t.navigate("rag"):window.location.hash="#/rag"},l=()=>{i&&(i.style.height="auto",i.style.height=`${Math.min(i.scrollHeight,140)}px`)};i?.addEventListener("input",l),n?.addEventListener("submit",u=>{u.preventDefault(),o()}),i?.addEventListener("keydown",u=>{u.key==="Enter"&&!u.shiftKey&&!u.isComposing&&(u.preventDefault(),o())}),l(),i?.focus({preventScroll:!0})}var yn={};Ht(yn,{render:()=>ac});var $o="judgment-console";var vt="query_history",Kt="settings",Yt="audit_events";var st={history:[],settings:new Map,audit:[],nextId:1},aa=null,at=!("indexedDB"in window);function Tt(e){return new Promise((t,s)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>s(e.error)})}function $t(e){return new Promise((t,s)=>{e.oncomplete=()=>t(),e.onerror=()=>s(e.error),e.onabort=()=>s(e.error||new Error("transaction aborted"))})}function _t(){return aa||(aa=new Promise((e,t)=>{if(!("indexedDB"in window)){at=!0,t(new Error("IndexedDB is unavailable"));return}let s;try{s=window.indexedDB.open($o,2)}catch(a){at=!0,t(a);return}s.onupgradeneeded=()=>{let a=s.result;if(!a.objectStoreNames.contains(vt)){let n=a.createObjectStore(vt,{keyPath:"id",autoIncrement:!0});n.createIndex("created_at","created_at"),n.createIndex("kind","kind")}if(a.objectStoreNames.contains(Kt)||a.createObjectStore(Kt,{keyPath:"key"}),!a.objectStoreNames.contains(Yt)){let n=a.createObjectStore(Yt,{keyPath:"key"});n.createIndex("created_at","created_at"),n.createIndex("dataset","dataset"),n.createIndex("jid","jid"),n.createIndex("issue_month","issue_month")}},s.onsuccess=()=>{let a=s.result;a.onversionchange=()=>a.close(),e(a)},s.onerror=()=>{at=!0,t(s.error||new Error("Unable to open IndexedDB"))},s.onblocked=()=>{at=!0,t(new Error("IndexedDB upgrade blocked by another tab"))}}),aa)}function ir(){return"indexedDB"in window}function or(){return at}function na(){return at?"memory":"indexeddb"}function yo(e){let t=e.created_at||new Date().toISOString();return{kind:e.kind||"query",title:String(e.title||""),detail:String(e.detail||""),payload:e.payload||{},turns:Array.isArray(e.turns)?e.turns:[],pinned:!!e.pinned,project_id:String(e.project_id||""),created_at:t,updated_at:e.updated_at||t}}async function wo(){try{let t=(await _t()).transaction(vt,"readwrite"),s=t.objectStore(vt),a=await Tt(s.count());if(a>120){let n=a-120,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let u=i.result;if(!u||n<=0){o();return}u.delete(),n-=1,u.continue()},i.onerror=()=>l(i.error)})}await $t(t)}catch{at=!0}}async function Rs(e){let t=yo(e);try{let a=(await _t()).transaction(vt,"readwrite"),n=a.objectStore(vt),i=await Tt(n.add(t));return await $t(a),await wo(),i}catch{at=!0;let a=st.nextId++;return st.history.push({id:a,...t}),st.history.length>120&&st.history.shift(),a}}async function Ps(e,t={}){let s=Number(e);if(!Number.isFinite(s))return null;try{let n=(await _t()).transaction(vt,"readwrite"),i=n.objectStore(vt),o=await Tt(i.get(s));if(!o)return await $t(n),null;let l={...o,...t,id:s};return await Tt(i.put(l)),await $t(n),l}catch{at=!0;let n=st.history.findIndex(i=>Number(i.id)===s);return n===-1?null:(st.history[n]={...st.history[n],...t,id:s},st.history[n])}}async function lr(e){let t=Number(e);if(!Number.isFinite(t))return!1;try{let a=(await _t()).transaction(vt,"readwrite");return a.objectStore(vt).delete(t),await $t(a),!0}catch{at=!0;let a=st.history.findIndex(n=>Number(n.id)===t);return a===-1?!1:(st.history.splice(a,1),!0)}}async function ra({keyword:e="",limit:t=50}={}){let s=e.trim().toLowerCase();try{let n=(await _t()).transaction(vt,"readonly"),i=n.objectStore(vt),o=await Tt(i.getAll());return await $t(n),o.filter(l=>s?`${l.kind} ${l.title} ${l.detail}`.toLowerCase().includes(s):!0).sort((l,u)=>String(u.updated_at||u.created_at).localeCompare(String(l.updated_at||l.created_at))).slice(0,t)}catch{return at=!0,st.history.filter(n=>s?`${n.kind} ${n.title} ${n.detail}`.toLowerCase().includes(s):!0).slice().sort((n,i)=>String(i.updated_at||i.created_at).localeCompare(String(n.updated_at||n.created_at))).slice(0,t)}}async function cr(){try{let t=(await _t()).transaction(vt,"readwrite");t.objectStore(vt).clear(),await $t(t)}catch{at=!0}st.history=[]}function _o(e){let t=Number(e.id??e.event_id??0)||0,s=String(e.dataset||e.kind||"judgment"),a=String(e.key||`${s}:${t||`${Date.now()}:${Math.random().toString(36).slice(2)}`}`),n=String(e.jid||""),i=String(e.issue_month||""),o=String(e.change_type||""),l=String(e.detected_at||e.created_at||new Date().toISOString());return{key:a,event_id:t,dataset:s,jid:n,issue_month:i,change_type:o,title:String(e.title||n||i||"\u7248\u672C\u8B8A\u66F4"),detail:String(e.detail||[o,i,n].filter(Boolean).join(" \xB7 ")),created_at:l,payload:e}}async function ko(){try{let t=(await _t()).transaction(Yt,"readwrite"),s=t.objectStore(Yt),a=await Tt(s.count());if(a>2e3){let n=a-2e3,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let u=i.result;if(!u||n<=0){o();return}u.delete(),n-=1,u.continue()},i.onerror=()=>l(i.error)})}await $t(t)}catch{at=!0}}async function dr(e){let t=(Array.isArray(e)?e:[]).filter(s=>s&&typeof s=="object").map(_o);if(!t.length)return 0;try{let a=(await _t()).transaction(Yt,"readwrite"),n=a.objectStore(Yt);for(let i of t)await Tt(n.put(i));return await $t(a),await ko(),t.length}catch{at=!0;let a=new Map(st.audit.map(n=>[n.key,n]));for(let n of t)a.set(n.key,n);return st.audit=Array.from(a.values()).sort((n,i)=>String(i.created_at).localeCompare(String(n.created_at))).slice(0,2e3),t.length}}async function ur({keyword:e="",limit:t=200}={}){let s=e.trim().toLowerCase(),a=n=>s?`${n.dataset} ${n.jid} ${n.issue_month} ${n.change_type} ${n.detail}`.toLowerCase().includes(s):!0;try{let i=(await _t()).transaction(Yt,"readonly"),o=i.objectStore(Yt),l=await Tt(o.getAll());return await $t(i),l.filter(a).sort((u,c)=>String(c.created_at).localeCompare(String(u.created_at))).slice(0,t)}catch{return at=!0,st.audit.filter(a).slice().sort((i,o)=>String(o.created_at).localeCompare(String(i.created_at))).slice(0,t)}}async function Is(e,t){let s={key:String(e),value:t,updated_at:new Date().toISOString()};try{let n=(await _t()).transaction(Kt,"readwrite");return n.objectStore(Kt).put(s),await $t(n),s}catch{return at=!0,st.settings.set(s.key,s),s}}async function Xt(e,t=null){try{let a=(await _t()).transaction(Kt,"readonly"),n=a.objectStore(Kt),i=await Tt(n.get(String(e)));return await $t(a),i?i.value:t}catch{at=!0;let a=st.settings.get(String(e));return a?a.value:t}}async function pr({keyword:e=""}={}){let t=e.trim().toLowerCase();try{let a=(await _t()).transaction(Kt,"readonly"),n=a.objectStore(Kt),i=await Tt(n.getAll());return await $t(a),i.filter(o=>t?`${o.key} ${JSON.stringify(o.value)}`.toLowerCase().includes(t):!0).sort((o,l)=>String(o.key).localeCompare(String(l.key)))}catch{return at=!0,Array.from(st.settings.values()).filter(a=>t?`${a.key} ${JSON.stringify(a.value)}`.toLowerCase().includes(t):!0)}}function mr(e){if(typeof e=="string")return e;try{return JSON.stringify(e)}catch{return String(e)}}var vn={};Ht(vn,{buildFlowWaterfallStages:()=>$a,render:()=>Pl,renderRagPipelineWaterfall:()=>ha,renderTestFlowPanel:()=>ys,renderWaterfallStages:()=>$s});var So={running:["\u57F7\u884C\u4E2D","badge-info"],stopping:["\u505C\u6B62\u4E2D","badge-warn"],success:["\u5B8C\u6210","badge-ok"],interrupted:["\u5DF2\u4E2D\u6B62","badge-warn"],failed:["\u5931\u6557","badge-danger"],pending:["\u7B49\u5F85","badge-neutral"],skipped:["\u7565\u904E","badge-neutral"]},xo=new Set(["running","stopping"]);function la(e){let[t,s]=So[e]||[e||"\u672A\u77E5","badge-neutral"];return`<span class="badge ${s}">${r(t)}</span>`}function ia(e){return String(e).padStart(2,"0")}function vs(e=new Date){let t=e instanceof Date?e:new Date(e);return`RAG Benchmark ${t.getFullYear()}-${ia(t.getMonth()+1)}-${ia(t.getDate())} ${ia(t.getHours())}:${ia(t.getMinutes())}`}function oa(e){return xo.has(e)}function Pt(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?s.toFixed(3):t}function as(e){if(e==null)return"\u2014";let t=Number(e);return Number.isFinite(t)?`${(t*100).toFixed(1)}%`:"\u2014"}function Zt(e,t,s=""){return`<div class="bench-metric">
    <span class="summary-label">${r(e)}</span>
    <strong>${r(String(t))}</strong>
    ${s?`<small>${r(s)}</small>`:""}
  </div>`}function gr(e={}){let t=e.score_components||e,s=e.gate||{},a=String(s.status||""),n=a==="pass"?"Gate \u901A\u904E":a==="fail"?"Gate \u5931\u6557":a==="no_data"?"Gate \u7121\u8CC7\u6599":"";return`${n?`<span class="badge ${a==="pass"?"badge-ok":a==="fail"?"badge-danger":"badge-neutral"}">${r(n)}</span>`:""}<div class="bench-metrics">
    ${Zt("Law Recall",as(t.law_recall))}
    ${Zt("Article Recall",as(t.article_recall))}
    ${Zt("Citation Valid",as(t.citation_valid_rate))}
    ${Zt("Judge",Pt(t.judge_overall))}
    ${Zt("Human",Pt(t.human_overall))}
    ${Zt("p50",be(e.duration_p50_ms))}
    ${Zt("p95",be(e.duration_p95_ms))}
    ${Zt("Success",`${d(e.success||0)} / ${d(e.total||0)}`)}
  </div>`}function fr(e={}){let t=Object.entries(e.stages||{}).filter(([s])=>s.startsWith("rag.")).slice(0,8);return t.length?`<div class="bench-stage-grid">${t.map(([s,a])=>`<div class="bench-stage">
      <span>${r(s.replace(/^rag\./,""))}</span>
      <strong>${be(a.p50_ms)}</strong>
      <small>p95 ${be(a.p95_ms)}</small>
    </div>`).join("")}</div>`:""}function br(e){let t=e.summary||{},s=t.score_components||{};return`<span>Law ${as(s.law_recall)}</span>
    <span>Article ${as(s.article_recall)}</span>
    <span>Judge ${Pt(s.judge_overall)}</span>
    <span>p95 ${be(t.duration_p95_ms)}</span>`}function vr(e){let t=e.summary||{},s=t.score_components||{};return JSON.stringify([s.law_recall,s.article_recall,s.judge_overall,t.duration_p95_ms])}function hr(e,t){let s=e.config||{};return`<button class="bench-run ${t?"is-active":""}" type="button" data-bench-action="open-run" data-run-id="${r(e.run_id)}">
    <span class="bench-run-head">
      <strong data-bench-slot="run-label">${r(e.label||"RAG Benchmark")}</strong>
      <span data-bench-slot="run-status" data-status="${r(e.status||"")}">${la(e.status)}</span>
      <span class="mono">${r(e.run_id.slice(0,10))}</span>
    </span>
    <span class="bench-run-meta">
      <span>${r(Me(e.started_at))}</span>
      <span data-bench-slot="run-completed">${d(e.completed_cases||0)} / ${d(e.total_cases||0)} \u984C</span>
      <span>${r(s.llm_model||"\u2014")}</span>
      <span>v${e.suite_version||1}</span>
    </span>
    <span class="bench-run-scores" data-bench-slot="run-scores" data-signature="${r(vr(e))}">${br(e)}</span>
  </button>`}function tn(e,t=[]){let s=e.metrics||{},a=e.judge||{},n=e.human_review||{},i=s.scores||{},o=e.stage_ms||{},l=Object.entries(o).filter(([c])=>c.startsWith("rag.")).map(([c,b])=>`<span class="chip">${r(c)} ${be(b)}</span>`).join(""),u=(e.law_sources||[]).map(c=>`<span class="chip">${r(c.law_name||"\u6CD5\u898F")} ${d((c.articles||[]).length)} \u689D</span>`).join("");return`<summary>
      <span class="bench-case-question">${r(e.question)}</span>
      ${la(e.status)}
      <span class="bench-case-time">${be(e.duration_ms)}</span>
      <span class="bench-case-score">Det ${Pt(i.deterministic)} \xB7 Judge ${Pt(i.judge)} \xB7 Human ${Pt(i.human)}</span>
    </summary>
    <div class="bench-case-body">
      <div class="bench-case-meta">
        <span class="mono">fingerprint ${r((e.fingerprint||"").slice(0,20))}</span>
        <span>item #${e.item_id} \xB7 v${e.item_version}</span>
        <button class="btn btn-ghost btn-sm" type="button" data-bench-action="fingerprint-history" data-fingerprint="${r(e.fingerprint||"")}">${p("history",13)}<span>\u540C\u984C\u6B77\u53F2</span></button>
      </div>
      <div class="bench-case-stages">${l||'<span class="qb-muted">\u6C92\u6709 stage timing</span>'}</div>
      <div class="bench-case-metrics">
        <span>Law recall ${as(s.law_recall)}</span>
        <span>Article recall ${as(s.article_recall)}</span>
        <span>Citation ${s.citation_valid?"valid":"invalid"}</span>
        <span>Refusal ${s.refusal_correct===null?"\u2014":s.refusal_correct?"correct":"wrong"}</span>
      </div>
      <div class="chips">${u||'<span class="qb-muted">\u6C92\u6709\u6CD5\u898F\u4F86\u6E90</span>'}</div>
      <div class="bench-answer"><strong>\u56DE\u7B54</strong><p>${r(e.answer||"\u2014")}</p></div>
      <div class="bench-judge"><strong>LLM judge</strong><p>${r(a.rationale||a.reason||"\u2014")}</p><span>${[["correctness",a.correctness],["grounding",a.grounding],["citation",a.citation],["clarity",a.clarity],["overall",a.overall]].map(([c,b])=>`${c} ${b??"\u2014"}`).join(" \xB7 ")}</span></div>
      <form class="bench-human-form" data-bench-form="human" data-result-id="${e.id}">
        <div class="bench-human-grid">
          ${[["correctness","\u6B63\u78BA\u6027",n.scores?.correctness??4],["grounding","\u6709\u64DA\u6027",n.scores?.grounding??4],["citation","\u5F15\u7528",n.scores?.citation??4],["clarity","\u6E05\u695A",n.scores?.clarity??4],["overall","\u6574\u9AD4",n.overall??4]].map(([c,b,$])=>`<label class="field"><span class="field-label">${b} <span class="field-tag">1\u20135</span></span><input class="input" type="number" min="1" max="5" name="score_${c}" value="${r(String($))}" /></label>`).join("")}
        </div>
        <label class="field"><span class="field-label">\u4EBA\u5DE5\u6279\u6CE8</span><input class="input" name="comment" value="${r(n.comment||"")}" placeholder="\u56DE\u7B54\u54C1\u8CEA\u3001\u5F15\u7528\u6216\u4E8B\u5BE6\u932F\u8AA4" /></label>
        <button class="btn btn-secondary btn-sm" type="submit">${p("check",13)}<span>\u5132\u5B58\u4EBA\u5DE5\u8A55\u5206</span></button>
      </form>
      ${t.length?`<div class="bench-history"><strong>\u540C\u984C\u6B77\u53F2 \xB7 ${t.length} \u7B46</strong>${t.map(c=>`<div class="bench-history-row"><span>${r(Me(c.run?.started_at))}</span><span>${r(c.run?.config?.llm_model||"\u2014")}</span><span>Det ${Pt(c.metrics?.scores?.deterministic)}</span><span>Judge ${Pt(c.metrics?.scores?.judge)}</span><span>Human ${Pt(c.metrics?.scores?.human)}</span><span>${be(c.duration_ms)}</span></div>`).join("")}</div>`:""}
    </div>`}function en(e,t=[]){return JSON.stringify([e.status,e.duration_ms,e.answer,e.metrics,e.judge,e.human_review,e.stage_ms,e.law_sources,t.map(s=>[s.id,s.duration_ms,s.metrics?.scores?.human,s.finished_at])])}function $r(e,t=[]){return`<details class="bench-case" data-result-id="${e.id}">
    ${tn(e,t)}
  </details>`}function yr(e){return`${la(e.status)}
    <span class="mono">${r(e.run_id)}</span>
    ${oa(e.status)?`<button class="btn btn-secondary btn-sm" type="button" data-bench-action="stop" data-run-id="${r(e.run_id)}">${p("x",13)}<span>\u505C\u6B62</span></button>`:""}`}function qo(e,t){let s=e.cases||[];return`<section class="report-card bench-detail" data-run-id="${r(e.run_id)}">
    <div class="side-card-head">
      <span class="side-card-title">${p("activity",14)}${r(e.label||"RAG Benchmark")}</span>
      <div class="qb-actions" data-bench-detail-actions data-signature="${r((e.status||"")+":"+e.run_id)}">
        ${yr(e)}
      </div>
    </div>
    <div data-bench-detail="metrics">${gr(e.summary||{})}</div>
    <div data-bench-detail="stages">${fr(e.summary||{})}</div>
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
    <div class="bench-cases" data-bench-cases>${s.length?s.map(a=>$r(a,t[a.fingerprint]||[])).join(""):Re({tone:"info",title:"\u5C1A\u7121\u984C\u76EE\u7D50\u679C",text:"Benchmark \u57F7\u884C\u5F8C\u6703\u5728\u9019\u88E1\u986F\u793A\u9010\u984C\u7D50\u679C\u3002"})}</div>
  </section>`}function wr(e){return`<button class="btn btn-primary" type="submit" ${e?"disabled":""}>${p("play",14)}<span>${e?"Benchmark \u57F7\u884C\u4E2D":"\u57F7\u884C Benchmark"}</span></button>
    ${e?`<button class="btn btn-secondary" type="button" data-bench-action="stop" data-run-id="${r(e.run_id)}">${p("x",14)}<span>\u505C\u6B62</span></button>`:""}`}function _r(e,t=[]){let s=Math.max(0,Number(e.total_cases)||0),a=Math.max(0,Math.min(s,Number(e.completed_cases)||0)),n=Date.now(),i=Date.parse(e.started_at||""),o=Number.isFinite(i)?Math.max(0,n-i):0,l=(t||[]).filter(h=>["success","failed"].includes(h.status)).map(h=>Number(h.duration_ms)||0).filter(h=>h>0),u=null;if(l.length)u=l.reduce((h,_)=>h+_,0)/l.length;else if(a>0){let h=Date.parse(e.updated_at||""),_=Number.isFinite(h)?h:i;Number.isFinite(_)&&_>i?u=(_-i)/a:o>0&&(u=o/a)}let c=(t||[]).find(h=>h.status==="running")||null,b=0;if(a<s&&u&&u>0){let h=c?Date.parse(c.started_at||""):NaN,_=Date.parse(e.updated_at||""),S=Number.isFinite(h)?h:_;Number.isFinite(S)&&(b=Math.max(0,Math.min(.95,(n-S)/u)))}let $=Math.min(s,a+b),v=s>0?Math.max(0,Math.min(100,$/s*100)):0,f=u===null?null:Math.max(0,s-$)*u;return{total:s,completed:a,elapsedMs:o,averageMs:u,progress:v,etaMs:f,ratePerMin:u?6e4/u:null,running:c}}function kr(e){return e===null?"\u9810\u4F30\u5269\u9918\uFF1A\u8A08\u7B97\u4E2D\u2026":e<1e3?"\u9810\u4F30\u5269\u9918\uFF1A\u5373\u5C07\u5B8C\u6210":`\u9810\u4F30\u5269\u9918 ${be(e)}`}function Sr(e,t=[]){let s=_r(e,t),a=e.status==="stopping";return`<div class="bench-progress" data-bench-live data-run-id="${r(e.run_id)}">
    <div class="bench-progress-head">
      <span class="bench-progress-state"><span class="spinner" aria-hidden="true"></span><span data-bench-slot="progress-state">${a?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D"}</span></span>
      <strong data-bench-slot="progress-count">${d(s.completed)} / ${d(s.total)} \u984C</strong>
      <span data-bench-slot="progress-percent">${s.progress.toFixed(1)}%</span>
      <span class="bench-progress-eta" data-bench-slot="progress-eta">${kr(s.etaMs)}</span>
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
  </div>`}function Ao(e){let t=e.models?.models||{},s=e.suites||[],a=Bs(e),n=e.selectedRun;return`<section class="report-card bench-card">
    <div class="side-card-head">
      <span class="side-card-title">${p("brain",14)}RAG Benchmark</span>
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
      <label class="field"><span class="field-label">Run \u6A19\u7C64</span><input class="input" name="label" value="${r(e.config.label||vs())}" /></label>
      <div class="qb-actions" data-bench-actions data-signature="${r(a?`${a.run_id}:${a.status}`:"")}">
        ${wr(a)}
      </div>
    </form>
    <div data-bench-live-wrap data-signature="${r(a?`${a.run_id}:${a.status}:${a.total_cases}`:"")}">${a?Sr(a,sn(e,a)):""}</div>
    <div class="bench-runs-head"><span class="summary-label">\u6B77\u53F2 Run</span><span class="qb-muted">\u540C\u984C\u76EE\u4EE5 fingerprint \u5C0D\u9F4A\uFF0C\u53EF\u5C55\u958B\u9010\u984C\u6BD4\u8F03</span></div>
    <div class="bench-runs" data-bench-runs>${(e.runs||[]).length?e.runs.map(i=>hr(i,n?.run_id===i.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>'}</div>
    ${n?qo(n,e.history):""}
  </section>`}function Bs(e){let t=(e.runs||[]).find(s=>oa(s.status));return t?e.selectedRun&&e.selectedRun.run_id===t.run_id?e.selectedRun.status&&!oa(e.selectedRun.status)?null:{...t,...e.selectedRun,summary:e.selectedRun.summary||t.summary||{},cases:e.selectedRun.cases||[]}:t:null}function sn(e,t){return!t||!e.selectedRun||e.selectedRun.run_id!==t.run_id?[]:e.selectedRun.cases||[]}function xr(e,{onNavigate:t=null}={}){let s={models:null,suites:[],runs:[],selectedRun:null,selectedSuiteId:null,history:{},indexVersion:null,config:{label:vs(),embedding_model:"",llm_model:"",judge_model:"",top_k:4,score_threshold:.35,repeats:1,enable_law_retrieval:!0,judge_enabled:!0},labelTouched:!1,loaded:!1,referenceLoaded:!1,loading:!1,loadAgain:!1,pendingRefreshAll:!1,activeRunId:"",refreshStream:null,tickTimer:null,renderSignature:"",forcedCaseIds:new Set},a=()=>e.querySelector("#performance-panel-benchmark"),n=P=>{let k=new FormData(P);return{label:String(k.get("label")||"").trim()||vs(),embedding_model:String(k.get("embedding_model")||""),llm_model:String(k.get("llm_model")||""),judge_model:String(k.get("judge_model")||""),top_k:Number(k.get("top_k")||4),score_threshold:Number(k.get("score_threshold")||.35),repeats:Number(k.get("repeats")||1),enable_law_retrieval:P.elements.enable_law_retrieval?.checked??!0,judge_enabled:P.elements.judge_enabled?.checked??!0}},i=()=>JSON.stringify({selectedRunId:s.selectedRun?.run_id||"",references:s.referenceLoaded?[s.indexVersion?.physical_collection||"",(s.models?.models?.embedding||[]).join(","),(s.models?.models?.llm||[]).join(","),(s.suites||[]).map(P=>`${P.id}:${P.name}:${P.item_count}:${P.version}:${P.status}`)]:null,runs:(s.runs||[]).map(P=>`${P.run_id}:${P.label||""}:${P.suite_version||1}`)}),o=()=>{let k=a()?.querySelector("[data-bench-live]"),M=Bs(s);if(!k||!M)return;let Z=_r(M,sn(s,M)),ue=(J,le)=>{let me=k.querySelector(`[data-bench-slot="${J}"]`);me&&me.textContent!==le&&(me.textContent=le)};ue("progress-count",`${d(Z.completed)} / ${d(Z.total)} \u984C`),ue("progress-percent",`${Z.progress.toFixed(1)}%`),ue("progress-eta",kr(Z.etaMs)),ue("progress-rate",Z.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${Z.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`),ue("progress-elapsed",`\u5DF2\u57F7\u884C ${be(Z.elapsedMs)}`),ue("progress-average",Z.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${be(Z.averageMs)}\uFF0F\u984C`),ue("progress-state",M.status==="stopping"?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D");let G=k.querySelector('[data-bench-slot="progress-bar"]');G&&(G.setAttribute("aria-valuenow",Z.progress.toFixed(1)),G.classList.toggle("is-waiting",Z.completed===0));let ee=k.querySelector('[data-bench-slot="progress-fill"]');ee&&(ee.style.width=`${Z.progress.toFixed(2)}%`)},l=P=>{let k=P.querySelector("[data-bench-actions]");if(!k)return;let M=Bs(s),Z=M?`${M.run_id}:${M.status}`:"";k.dataset.signature!==Z&&(k.dataset.signature=Z,k.innerHTML=wr(M))},u=P=>{let k=P.querySelector("[data-bench-live-wrap]");if(!k)return;let M=Bs(s),Z=M?`${M.run_id}:${M.status}:${M.total_cases}`:"";k.dataset.signature!==Z&&(k.dataset.signature=Z,k.innerHTML=M?Sr(M,sn(s,M)):"")},c=P=>{let k=P.querySelector("[data-bench-runs]");if(!k)return;let M=s.runs||[],Z=[...k.querySelectorAll("[data-run-id]")].map(G=>G.dataset.runId),ue=M.map(G=>G.run_id);if(Z.join("|")!==ue.join("|")){k.innerHTML=M.length?M.map(G=>hr(G,s.selectedRun?.run_id===G.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>';return}for(let G of M){let ee=k.querySelector(`[data-run-id="${G.run_id}"]`);if(!ee)continue;ee.classList.toggle("is-active",s.selectedRun?.run_id===G.run_id);let J=ee.querySelector('[data-bench-slot="run-label"]');J&&J.textContent!==(G.label||"RAG Benchmark")&&(J.textContent=G.label||"RAG Benchmark");let le=ee.querySelector('[data-bench-slot="run-status"]');le&&le.dataset.status!==(G.status||"")&&(le.dataset.status=G.status||"",le.innerHTML=la(G.status));let me=ee.querySelector('[data-bench-slot="run-completed"]');if(me){let Be=`${d(G.completed_cases||0)} / ${d(G.total_cases||0)} \u984C`;me.textContent!==Be&&(me.textContent=Be)}let K=ee.querySelector('[data-bench-slot="run-scores"]'),we=vr(G);K&&K.dataset.signature!==we&&(K.dataset.signature=we,K.innerHTML=br(G))}},b=P=>{let k=s.selectedRun;if(!k)return;let M=P.querySelector(`.bench-detail[data-run-id="${k.run_id}"]`);if(!M)return;let Z=M.querySelector("[data-bench-detail-actions]");if(Z){let K=`${k.status||""}:${k.run_id}`;Z.dataset.signature!==K&&(Z.dataset.signature=K,Z.innerHTML=yr(k))}let ue=M.querySelector('[data-bench-detail="metrics"]');if(ue){let K=JSON.stringify(k.summary||{});ue.dataset.signature!==K&&(ue.dataset.signature=K,ue.innerHTML=gr(k.summary||{}))}let G=M.querySelector('[data-bench-detail="stages"]');if(G){let K=JSON.stringify((k.summary||{}).stages||{});G.dataset.signature!==K&&(G.dataset.signature=K,G.innerHTML=fr(k.summary||{}))}let ee=M.querySelector("[data-bench-cases]");if(!ee)return;let J=k.cases||[];if(!J.length)return;let le=ee.querySelector(".notice");le&&le.remove();let me=new Map([...ee.querySelectorAll("details.bench-case")].map(K=>[Number(K.dataset.resultId),K]));for(let K of J){let we=s.history[K.fingerprint]||[],Be=en(K,we),ke=me.get(Number(K.id));if(!ke){ee.insertAdjacentHTML("beforeend",$r(K,we)),ke=ee.lastElementChild,ke&&(ke._benchSignature=Be);continue}if(ke._benchSignature===Be||!s.forcedCaseIds.delete(Number(K.id))&&ke.contains(document.activeElement))continue;let ie=ke.open;ke.innerHTML=tn(K,we),ke.open=ie,ke._benchSignature=Be}},$=()=>{Bs(s)?s.tickTimer||(s.tickTimer=window.setInterval(o,1e3)):s.tickTimer&&(window.clearInterval(s.tickTimer),s.tickTimer=null)},v=()=>{let P=a();P&&(l(P),u(P),c(P),b(P),o(),$())},f=P=>{let k=s.selectedRun;if(!k)return;let M=P.querySelector('[data-bench-detail="metrics"]');M&&(M.dataset.signature=JSON.stringify(k.summary||{}));let Z=P.querySelector('[data-bench-detail="stages"]');Z&&(Z.dataset.signature=JSON.stringify((k.summary||{}).stages||{}));let ue=P.querySelector("[data-bench-cases]");if(!ue)return;let G=new Map((k.cases||[]).map(ee=>[Number(ee.id),ee]));for(let ee of ue.querySelectorAll("details.bench-case")){let J=G.get(Number(ee.dataset.resultId));J&&(ee._benchSignature=en(J,s.history[J.fingerprint]||[]))}},h=(P=!1)=>{let k=a();if(!k)return;let M=i();if(!P&&s.renderSignature===M){v();return}s.renderSignature=M,s.forcedCaseIds.clear(),k.innerHTML=Ao(s),f(k),v()},_=async({refreshAll:P=!1,runs:k=null}={})=>{if(s.loading){s.loadAgain=!0,s.pendingRefreshAll=s.pendingRefreshAll||P;return}s.loading=!0;try{if(!s.referenceLoaded||P){let[le,me]=await Promise.all([z.benchmarkModels(),z.benchmarkSuites()]);s.models=le,s.suites=me.suites||[],s.indexVersion=le.index_version,s.referenceLoaded=!0,!s.selectedSuiteId&&s.suites.length&&(s.selectedSuiteId=s.suites[0].id),s.config.embedding_model||(s.config.embedding_model=le.models?.embedding?.[0]||""),s.config.llm_model||(s.config.llm_model=le.models?.llm?.[0]||""),s.config.judge_model||(s.config.judge_model=(le.models?.llm||[]).find(K=>K!==s.config.llm_model)||"")}let M=k?{runs:k}:await z.benchmarkRuns(30);s.runs=M.runs||[];let Z=s.activeRunId,ue=s.runs.find(le=>oa(le.status))||null;s.activeRunId=ue?.run_id||"";let G=s.selectedRun?.run_id||"";G||(G=ue?.run_id||s.runs[0]?.run_id||"");let ee=!!(s.selectedRun&&Z&&s.selectedRun.run_id===Z);G&&(!s.selectedRun||s.selectedRun.run_id!==G||G===ue?.run_id||ee)?s.selectedRun=await z.benchmarkRun(G,!0):G||(s.selectedRun=null),s.loaded=!0,h()}catch(M){if(!s.loaded){s.renderSignature="";let Z=a();Z&&(Z.innerHTML=Re({tone:"danger",title:"Benchmark \u8CC7\u6599\u8B80\u53D6\u5931\u6557",text:r(M.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")}))}}finally{if(s.loading=!1,s.loadAgain){let M=s.pendingRefreshAll;s.loadAgain=!1,s.pendingRefreshAll=!1,_({refreshAll:M})}}},S=()=>{s.refreshStream||(s.refreshStream=bt("benchmark",(P,k)=>{s.loading||_({runs:k?.snapshot?.runs||null})}))},R=async P=>{try{s.selectedRun=await z.benchmarkRun(P,!0),h()}catch(k){A(k.message||"\u8B80\u53D6 benchmark run \u5931\u6557\u3002","danger")}},O=async P=>{!s.labelTouched&&P.elements.label&&(P.elements.label.value=vs());let k=n(P);s.config=k;let M=Number(P.elements.suite_id?.value||0);if(!M){A("\u8ACB\u5148\u9078\u64C7 benchmark \u984C\u5EAB\u3002","warn");return}try{await z.startBenchmarkRun({suite_id:M,config:k,actor:"anonymous"}),A("Benchmark \u5DF2\u555F\u52D5\u3002","ok"),s.selectedRun=null,s.config.label=vs(),s.labelTouched=!1,await _()}catch(Z){A(Z.message||"Benchmark \u555F\u52D5\u5931\u6557\u3002","danger",8e3)}},I=async P=>{try{await z.stopBenchmarkRun(P),A("\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info"),await _()}catch(k){A(k.message||"\u505C\u6B62\u5931\u6557\u3002","danger")}},Q=async P=>{let k=Number(P.dataset.resultId||0),M=new FormData(P),Z={};for(let ue of["correctness","grounding","citation","clarity","overall"]){let G=Number(M.get(`score_${ue}`));Number.isFinite(G)&&(Z[ue]=G)}try{await z.reviewBenchmarkResult(k,{reviewer:"anonymous",scores:Z,comment:String(M.get("comment")||"")}),A("\u4EBA\u5DE5\u8A55\u5206\u5DF2\u5132\u5B58\u3002","ok"),s.selectedRun&&(s.selectedRun=await z.benchmarkRun(s.selectedRun.run_id,!0),s.forcedCaseIds.add(k)),h()}catch(ue){A(ue.message||"\u4EBA\u5DE5\u8A55\u5206\u5132\u5B58\u5931\u6557\u3002","danger")}},oe=async P=>{if(P)try{let k=await z.benchmarkFingerprintHistory(P,50);s.history[P]=k.cases||[];let M=s.selectedRun,Z=a();if(!M||!Z)return;let ue=(M.cases||[]).filter(G=>G.fingerprint===P);for(let G of ue){let ee=Z.querySelector(`details.bench-case[data-result-id="${G.id}"]`);if(!ee)continue;let J=ee.open;ee.innerHTML=tn(G,s.history[P]),ee.open=J,ee._benchSignature=en(G,s.history[P])}}catch(k){A(k.message||"\u540C\u984C\u6B77\u53F2\u8B80\u53D6\u5931\u6557\u3002","danger")}},te=async P=>{let k=P.target.closest("[data-bench-action]");if(!k)return;let M=k.dataset.benchAction;M==="open-run"?await R(k.dataset.runId||""):M==="stop"?await I(k.dataset.runId||""):M==="fingerprint-history"&&await oe(k.dataset.fingerprint||"")},je=async P=>{let k=P.target.closest("[data-bench-form]");k&&(P.preventDefault(),k.dataset.benchForm==="run"?await O(k):k.dataset.benchForm==="human"&&await Q(k))},De=P=>{P&&(P.elements.label&&P.elements.label.value!==s.config.label&&(s.labelTouched=!0),s.config=n(P),P.elements.suite_id&&(s.selectedSuiteId=Number(P.elements.suite_id.value)||s.selectedSuiteId))},X=P=>{let k=P.target.closest('[data-bench-form="run"]');k&&De(k)};return e.addEventListener("click",te),e.addEventListener("submit",je),e.addEventListener("input",X),e.addEventListener("change",X),{show(){if(t&&t("benchmark"),!s.labelTouched){s.config.label=vs();let P=a()?.querySelector('input[name="label"]');P&&(P.value=s.config.label)}S(),_({refreshAll:!s.referenceLoaded})},refresh(){return S(),_({refreshAll:!0})},destroy(){e.removeEventListener("click",te),e.removeEventListener("submit",je),e.removeEventListener("input",X),e.removeEventListener("change",X),s.refreshStream&&s.refreshStream(),s.refreshStream=null,s.tickTimer&&window.clearInterval(s.tickTimer)}}}var un={};Ht(un,{exportCsv:()=>ga,exportableResult:()=>fa,render:()=>dl,renderReport:()=>ua,reportError:()=>ma,reportLoading:()=>Os});var Er=[10,25,50,100],qr=500,Lo=["law_name","law_level","law_category","law_modified_date","article_count"],Mo=["jid","court_normalized","title","jdate","matched_laws","citation_count"],jo={A:"\u689D\u6587",C:"\u7AE0\u7BC0"};function pa(e){return e?.label||e?.id||"\u8CC7\u6599\u5EAB"}function ca(e,t){let s={};for(let a of e.fields||[]){let n=a.type==="checkbox"?!1:a.type==="multiselect"?[]:"",i=a.default===void 0?n:a.default;s[a.key]=Array.isArray(i)?[...i]:i}return{values:s,page:1,pageSize:t,result:null,sort:null,columnFilters:{},fuzzyTerms:[]}}function To(e,t){let s=e.visibleWhen;if(!s)return!0;for(let[a,n]of Object.entries(s))if(Array.isArray(n)&&!n.map(String).includes(String(t[a]??"")))return!1;return!0}function dn(e,t){return(e.fields||[]).filter(s=>To(s,t))}function No(e,t){return`filter-${e.id}-${t}`}function ns(e){return e==null?"":r(String(e))}function an(e,t,s){let a=s[t.key],n=No(e,t.key),i=t.help?`<span class="field-help">${r(t.help)}</span>`:"";if(t.type==="checkbox")return`<div class="field">
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
    </label>`;if(t.type==="select"){let l=(t.options||[]).map(u=>`<option value="${ns(u.value)}" ${String(u.value)===String(a??"")?"selected":""}>${r(u.label??u.value)}</option>`).join("");return`<div class="field">${o}
      <select class="select" id="${n}" name="${r(t.key)}">${l}</select>
      ${i}
    </div>`}if(t.type==="multiselect"){let l=new Set((Array.isArray(a)?a:[]).map(String)),u=(t.options||[]).map(c=>`<label class="multi-option">
          <input type="checkbox" name="${r(t.key)}" value="${ns(c.value)}" ${l.has(String(c.value))?"checked":""} />
          <span>${r(c.label??c.value)}</span>
        </label>`).join("");return`<div class="field">${o}
      <div class="multi-select">${u}</div>
      ${i}
    </div>`}return t.type==="number"?`<div class="field">${o}
      <input class="input" type="number" id="${n}" name="${r(t.key)}"
        value="${ns(a)}"
        ${t.min!==void 0?`min="${t.min}"`:""}
        ${t.max!==void 0?`max="${t.max}"`:""}
        step="${t.step??1}"
        placeholder="${ns(t.placeholder||"")}" />
      ${i}
    </div>`:t.type==="date"?`<div class="field">${o}
      <input class="input" type="date" id="${n}" name="${r(t.key)}"
        value="${ns(a)}" />
      ${i}
    </div>`:`<div class="field">${o}
    <input class="input" type="text" id="${n}" name="${r(t.key)}"
      value="${ns(a)}"
      placeholder="${ns(t.placeholder||"")}" />
    ${i}
  </div>`}function Ar(e,t,{focusTable:s=!1}={}){let a=dn(e,t.values),n=[];for(let i=0;i<a.length;i+=1){let o=a[i],l=a[i+1];o.type==="date"&&l&&l.type==="date"?(n.push(`<div class="field-row">${an(e,o,t.values)}${an(e,l,t.values)}</div>`),i+=1):n.push(an(e,o,t.values))}return`<form id="data-filter-form" autocomplete="off">
    <div class="filter-block">
      <div class="filter-head">
        <span class="filter-title">Metadata \u689D\u4EF6</span>
        <button class="filter-reset" type="button" data-action="reset">\u91CD\u8A2D</button>
      </div>
      <div class="filter-fields">${n.join("")}</div>
    </div>
    <div class="sidebar-actions">
      <button class="btn btn-primary" type="submit" id="run-query" ${s?'data-focus-table="true"':""}>
        ${p("search",15)}<span>\u57F7\u884C\u67E5\u8A62</span>
      </button>
    </div>
  </form>`}function da(e,t,s){let a={...s.values};for(let n of dn(t,a))if(n.type==="checkbox"){let i=e.querySelector(`[name="${n.key}"]`);a[n.key]=!!i?.checked}else if(n.type==="multiselect")a[n.key]=Array.from(e.querySelectorAll(`[name="${n.key}"]:checked`)).map(i=>i.value);else{let i=e.querySelector(`[name="${n.key}"]`);a[n.key]=i?i.value:""}return a}function Cr(e,t){let s={};for(let a of dn(e,t.values)){let n=t.values[a.key];a.type==="checkbox"?s[a.key]=!!n:a.type==="multiselect"?s[a.key]=Array.isArray(n)?n:[]:a.type==="number"?s[a.key]=n===""||n===null?"":Number(n):s[a.key]=n??""}return s}function nn(e,t){let s=Cr(e,t);return Array.isArray(t.fuzzyTerms)&&t.fuzzyTerms.length&&(s.keywords=[...t.fuzzyTerms]),(e.id==="postgres"||e.id==="parquet")&&t.sort?.key&&(s.sort=`${t.sort.key}:${t.sort.direction}`,s.schema_preview=!0),t.columnFilters&&Object.keys(t.columnFilters).length>0&&(s.column_filters=t.columnFilters),s}function Eo(e){if(e.status==="operational")return"";let t=e.status==="unavailable"?"danger":e.status==="degraded"?"warn":"info";return`<div class="sidebar-notice">${Re({tone:t,title:`${pa(e)} ${Mt(e.status).label}`,text:r(e.detail||"\u76EE\u524D\u7121\u6CD5\u4F7F\u7528\u9019\u500B\u8CC7\u6599\u4F86\u6E90\u3002")})}</div>`}function Co(e,t){return`<label class="field data-source-field">
    <span class="field-label">\u8CC7\u6599\u4F86\u6E90</span>
    <select class="select" name="database">
      ${e.map(s=>{let a=Mt(s.status);return`<option value="${r(s.id)}" ${s.id===t?"selected":""}>${r(s.label)} \xB7 ${r(a.label)}</option>`}).join("")}
    </select>
  </label>`}function Lr(e,t){return`<nav class="data-nav" aria-label="\u8CC7\u6599\u67E5\u8A62\u529F\u80FD">
    ${[{id:"law",label:"\u67E5\u8A62\u6CD5\u898F\u547D\u4EE4",hint:"Fuzzy \u6CD5\u898F\u540D\u7A31\u3001\u985E\u5225\u8207\u547D\u4EE4",icon:"file"},{id:"judgment",label:"\u67E5\u8A62\u5224\u6C7A",hint:"Fuzzy \u6CD5\u9662\u3001\u6848\u865F\u8207\u6848\u7531",icon:"layers"},{id:"schema",label:"\u8CC7\u6599\u5EAB Schema",hint:"\u8CC7\u6599\u8868\u3001\u6B04\u4F4D\u8207\u9810\u89BD",icon:"table"}].map(a=>{let n=a.id==="schema"?t==="schema":t==="query"&&e===a.id;return`<button class="data-nav-item${n?" is-active":""}" type="button"
          data-action="data-nav" data-tab="${a.id}" ${n?'aria-current="page"':""}>
          <span class="data-nav-icon">${p(a.icon,15)}</span>
          <span class="data-nav-copy">
            <strong>${r(a.label)}</strong>
            <small>${r(a.hint)}</small>
          </span>
        </button>`}).join("")}
  </nav>`}function Ro(e,t,s){if(t.id!=="postgres"&&t.id!=="parquet")return"";let a=Array.isArray(s.fuzzyTerms)?s.fuzzyTerms:[],n=e==="law"?"Fuzzy \u6CD5\u898F\uFF0F\u547D\u4EE4":"Fuzzy \u5224\u6C7A",i=e==="law"?"\u8F38\u5165\u6CD5\u898F\u540D\u7A31\u6216\u76F8\u8FD1\u5B57\u2026":"\u8F38\u5165\u6CD5\u9662\u3001\u6848\u865F\u3001\u6848\u7531\u6216\u76F8\u8FD1\u5B57\u2026";return`<div class="data-fuzzy" data-data-fuzzy data-fuzzy-kind="${e}">
    <div class="data-fuzzy-head">
      <span class="filter-title">${n}</span>
      <span class="field-tag">\u591A\u689D\u4EF6 AND</span>
    </div>
    <div class="data-fuzzy-row">
      <div class="data-fuzzy-values">
        ${a.length?a.map(o=>`<span class="chip data-fuzzy-chip">${r(o)}<button class="data-fuzzy-remove" type="button" data-action="remove-fuzzy-term" data-term="${r(o)}" aria-label="\u79FB\u9664 ${r(o)}">${p("x",9)}</button></span>`).join(""):`<span class="data-fuzzy-placeholder">${i}</span>`}
      </div>
      <button class="data-fuzzy-add" type="button" data-action="open-fuzzy" aria-label="\u52A0\u5165 fuzzy \u689D\u4EF6" aria-haspopup="listbox">${p("plus",13)}</button>
    </div>
    <div class="data-fuzzy-popover" data-data-fuzzy-popover hidden>
      <input class="input" type="search" data-data-fuzzy-search placeholder="${i}" autocomplete="off" />
      <div class="data-fuzzy-results" data-data-fuzzy-results role="listbox" aria-live="polite"></div>
    </div>
  </div>`}function rn(e,t,s=""){let a=Array.isArray(e.tables)?e.tables:[],n=a.length?a.map(i=>`<button class="schema-item ${String(i.id)===String(s||"")?"is-selected":""}" type="button"
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
  </div>`}function Po(e){return{postgres:"PostgreSQL \u67E5\u8A62\u4F7F\u7528\u53C3\u6578\u5316\u689D\u4EF6\u8207\u5206\u9801\uFF0C\u50C5\u8B80\u53D6\u8CC7\u6599\u3002",parquet:"Parquet \u67E5\u8A62\u76F4\u63A5\u6383\u63CF\u76EE\u524D\u6700\u65B0\u7684\u5FEB\u7167\uFF1B\u52FE\u9078\u539F\u59CB JSON \u6703\u589E\u52A0\u56DE\u50B3\u91CF\u8207\u6E32\u67D3\u6642\u9593\u3002",qdrant:"Qdrant \u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\uFF1B\u9700\u8981\u5148\u5B8C\u6210\u5411\u91CF\u7D22\u5F15\u3002\u6AA2\u7D22\u7D50\u679C\u53EA\u5305\u542B\u7D22\u5F15\u4E2D\u5BE6\u969B\u5B58\u5728\u7684\u5224\u6C7A\uFF0C\u4E0D\u6703\u7522\u751F\u865B\u69CB\u8CC7\u6599\u3002",indexeddb:"IndexedDB \u53EA\u5728\u9019\u500B\u700F\u89BD\u5668\u5167\u67E5\u8A62\uFF0C\u4E0D\u6703\u7D93\u904E\u4F3A\u670D\u5668\uFF1B\u6E05\u9664\u7DB2\u7AD9\u8CC7\u6599\u5F8C\u7D00\u9304\u6703\u6D88\u5931\u3002"}[e.id]||r(e.detail||"")}function Io(e){return`<div class="report-empty">
    ${ot({iconName:"table",title:"\u67E5\u8A62\u5831\u8868\u6703\u986F\u793A\u5728\u9019\u88E1",text:r({postgres:"\u4F7F\u7528\u5DE6\u5074 fuzzy \u67E5\u8A62\u52A0\u5165\u6CD5\u898F\u6216\u5224\u6C7A\u689D\u4EF6\uFF0C\u518D\u8996\u9700\u8981\u5C55\u958B\u9032\u968E metadata \u689D\u4EF6\u3002",parquet:"\u4F7F\u7528\u5DE6\u5074 fuzzy \u67E5\u8A62\u52A0\u5165\u689D\u4EF6\uFF0C\u76F4\u63A5\u6383\u63CF\u539F\u59CB Parquet\uFF1B\u53EF\u5C55\u958B\u9032\u968E\u689D\u4EF6\u8ABF\u6574\u6B04\u4F4D\u3002",qdrant:"\u8F38\u5165\u8A9E\u610F\u67E5\u8A62\u5F8C\uFF0C\u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5DF2\u5EFA\u7ACB\u5411\u91CF\u7D22\u5F15\u7684\u5224\u6C7A\uFF1B\u672A\u7D22\u5F15\u6642\u6703\u660E\u78BA\u986F\u793A\u72C0\u614B\u3002",indexeddb:"\u67E5\u8A62\u5B58\u5728\u9019\u500B\u700F\u89BD\u5668\u7684\u63D0\u554F\u7D00\u9304\u8207\u8A2D\u5B9A\uFF0C\u4E0D\u9700\u8981\u4F3A\u670D\u5668\u3002"}[e.id]||"\u8A2D\u5B9A\u689D\u4EF6\u5F8C\u57F7\u884C\u67E5\u8A62\u3002")})}
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
        <div class="report-title">${r(pa(e))} \u67E5\u8A62\u4E2D</div>
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
  </div>`}function ma(e,t){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${r(pa(t))} \u67E5\u8A62\u5931\u6557</div>
        <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${Re({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u67E5\u8A62\u7D50\u679C",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="retry">
          ${p("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function Bo(e){if(!e.length)return'<div class="report-empty-inline">\u9019\u6B21\u67E5\u8A62\u6C92\u6709\u53EF\u5448\u73FE\u7684\u5206\u5E03\u8CC7\u6599\u3002</div>';let t=Math.max(...e.map(s=>Number(s.value)||0),1);return`<div class="distribution">
    ${e.map(s=>{let a=Number(s.value)||0,n=Math.max(1.5,a/t*100);return`<div class="dist-row">
          <span class="dist-label" title="${r(s.label||"\u672A\u5206\u985E")}">${r(s.label||"\u672A\u5206\u985E")}</span>
          <span class="dist-track"><span class="dist-bar" style="width:${n.toFixed(1)}%"></span></span>
          <span class="dist-value">${d(a)}</span>
        </div>`}).join("")}
  </div>`}function Rr(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="law_documents"}function Oo(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="judgment_documents"}function Do(e){return e&&e.database==="qdrant"&&String(e.table||"").startsWith("judgment")}function Fo(e){let t=e._jid||e.jid;return t?`<button class="law-link judgment-link" type="button" data-action="open-judgment"
    data-jid="${r(String(t))}"
    title="\u6AA2\u8996\u300C${r(String(t))}\u300D\u7684\u5224\u6C7A\u539F\u6587">${r(String(t))}${p("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}var zo={jid:"jid",court:"court",court_normalized:"court",title:"title",jdate:"jdate",matched_laws:"matched_laws",citation_count:"citation_count",full_text_length:"full_text_length"};function Ho(e,t,s,a=!1,n=!0,i=!1){let o=a?e.key:e.label||e.key,l=n?t?zo[e.key]||e.key:i?e.key:null:null;if(!l)return`<th scope="col">${r(o)}</th>`;let u=s?.key===l,c=u?s.direction:null,b=c==="asc"?"ascending":c==="desc"?"descending":"none",$=c==="asc"?"\u2191":c==="desc"?"\u2193":"\u2195";return`<th scope="col" aria-sort="${b}">
    <button class="table-sort${u?" is-active":""}" type="button"
      data-action="sort-column" data-sort-key="${r(l)}"
      title="\u4F9D${r(o)}\u6392\u5E8F">
      <span>${r(o)}</span>
      <span class="table-sort-icon" aria-hidden="true">${$}</span>
    </button>
  </th>`}function Uo(e,t){if(!Rr(e)||!t)return null;let s=t._law_key||t.law_name;if(!s)return null;let a=e.meta?.dataset,n=t._law_source_type||(a&&a!=="all"?a:"");return{lawKey:String(s),sourceType:String(n||""),lawName:String(t.law_name||"")}}function Qo(e,t,s){let a=e[t.key];return a==null||a===""?"\u2014":`<button class="law-link" type="button" data-action="open-law"
    data-law-key="${r(s.lawKey)}"
    data-law-source="${r(s.sourceType)}"
    data-law-name="${r(s.lawName)}"
    title="\u6AA2\u8996\u300C${r(String(a))}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${r(String(a))}${p("chevronRight",12,"law-link-icon")}</button>`}function Pr(e,{useColumnKeys:t=!1,sortable:s=!0,sortableAll:a=!1,searchValues:n=null,compact:i=!1}={}){let o=Array.isArray(e.columns)?e.columns:[],l=Array.isArray(e.rows)?e.rows:[],u=(e.page-1)*e.page_size,c=Rr(e),b=Oo(e),$=Do(e),v=e.meta?.sort||null,f=n?`<tr class="schema-search-row">
        <th scope="col" class="cell-index-head"></th>
        ${o.map(h=>`<th scope="col">
              <div class="schema-search-wrap">
                <input class="schema-search-input" type="search"
                  data-schema-search="${r(h.key)}"
                  value="${r(String(n[h.key]??""))}"
                  placeholder="\u641C\u5C0B ${r(h.key)}"
                  autocomplete="off" />
              </div>
            </th>`).join("")}
      </tr>`:"";return o.length?l.length?`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">${d(l.length)} rows \xB7 \u7B2C ${e.page} \u9801${c?" \xB7 \u9EDE\u9078\u6CD5\u898F\u540D\u7A31\u53EF\u6AA2\u8996\u5B8C\u6574\u689D\u6587":b?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u6B04\u4F4D\u6A19\u984C\u53EF\u6392\u5E8F":$?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u4F9D\u76F8\u4F3C\u5EA6\u6392\u5E8F":""}</span>
    </div>
    <div class="table-wrap">
      <table class="data-table${i?" is-compact":""}">
        <thead>${f}<tr>
          <th scope="col" class="cell-index-head">#</th>
          ${o.map(h=>Ho(h,b,v,t,s,a)).join("")}
        </tr></thead>
        <tbody>
          ${l.map((h,_)=>`<tr>
                <td class="cell-mono cell-empty cell-index">${u+_+1}</td>
                ${o.map(S=>{if((b||$)&&S.key==="jid")return`<td class="cell-jid">${Fo(h)}</td>`;let R=c&&S.key==="law_name"?Uo(e,h):null;if(R)return`<td>${Qo(h,S,R)}</td>`;let I={date:"cell-date",datetime:"cell-datetime",duration:"cell-duration",number:"cell-number"}[S.type];return`<td${I?` class="${I}"`:""}>${Ys(h[S.key],S.type||"text")}</td>`}).join("")}
              </tr>`).join("")}
        </tbody>
      </table>
    </div>`:`<div class="report-table-head">
        <span class="report-section-title">\u8CC7\u6599\u5217</span>
        <span class="muted" style="font-size:10px">0 rows</span>
      </div>
      ${ot({iconName:"filter",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u8CC7\u6599",text:"\u653E\u5BEC\u65E5\u671F\u5340\u9593\u3001\u964D\u4F4E\u689D\u6587\u6578\u4E0B\u9650\uFF0C\u6216\u6E05\u9664\u95DC\u9375\u5B57\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}`:`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">\u6B64\u8CC7\u6599\u4F86\u6E90\u6C92\u6709\u8868\u683C\u6B04\u4F4D</span>
    </div>`}function Go(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,n=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${n} \u9801 \xB7
      \u986F\u793A ${d(i)}\u2013${d(o)} / ${d(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Er.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${p("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=n?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${p("chevronRight",13)}</button>
    </div>
  </div>`}function Ir(e){return!Array.isArray(e)||!e.length?"":`<div class="warnings">${e.map(t=>`<div class="warning-line">${r(t)}</div>`).join("")}</div>`}function ua(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.columns)?e.columns:[],a=Array.isArray(e.summary)?e.summary:[],n=Array.isArray(e.distribution)?e.distribution:[],i=Number(e.total)||0,o=e.query_text||"",l=e.database||"",u=e.status||"ok",c=e.meta?.table_label||e.table||e.label||"query result";return`<div class="report-card" data-database="${r(l)}">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT \xB7 ${r(String(l).toUpperCase())}</div>
        <div class="report-title">
          ${r(e.label||l)}
          ${He(u)}
          <span class="chip">${r(c)}</span>
        </div>
        <div class="report-sub">
          ${d(i)} \u7B46\u7B26\u5408 \xB7
          ${be(e.duration_ms)} \xB7
          ${r(String(l).toUpperCase())} / ${r(String(e.table||"\u2014"))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${p("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${p("file",14)}<span>JSON</span></button>
      </div>
    </div>

    ${e.message?`<div class="report-alert">${Re({tone:u==="not_configured"?"info":u==="danger"?"danger":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r(e.message)})}</div>`:""}

    ${a.length?`<div class="summary-strip">
            ${a.slice(0,4).map(b=>`<div class="summary-item">
                  <div class="summary-label">${r(b.label)}</div>
                  <div class="summary-value">${r(b.value)}</div>
                </div>`).join("")}
          </div>`:""}

    <div class="report-grid">
      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u7D50\u679C\u5206\u5E03</span>
          <span class="muted" style="font-size:9.5px">${n.length} groups</span>
        </div>
        ${Bo(n)}
      </div>
      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5BE6\u969B\u67E5\u8A62\u8A9E\u53E5</span>
          <span class="muted" style="font-size:9.5px">${r(e.database==="indexeddb"?"client-side":"read-only")}</span>
        </div>
        <div class="query-box">
          <pre class="query-code">${r(o||"\u2014")}</pre>
          <button class="btn btn-secondary btn-sm btn-copy" type="button" data-action="copy-query">
            ${p("copy",12)}<span>\u8907\u88FD</span>
          </button>
        </div>
        ${Ir(e.warnings)}
      </div>
    </div>

    ${s.length||t.length?Pr(e,{compact:!0,sortableAll:!0,searchValues:e.meta?.searchable?e.meta.column_filters||{}:null}):""}
    ${i||s.length?Go({...e,total:i,page:Number(e.page)||1,page_size:Number(e.page_size)||25}):""}
  </div>`}function Mr(e){return`<div class="report-card schema-preview">
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
  </div>`}function on(e,t,{columnFilters:s={},searchEnabled:a=!1}={}){let n=Array.isArray(e.columns)?e.columns:[],i=Array.isArray(e.rows)?e.rows:[],o=e.message?`<div class="report-alert">${Re({tone:e.status==="ok"?"info":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r(e.message)})}</div>`:"";return`<div class="report-card schema-preview">
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
    ${Pr({...e,page:1,page_size:10},{useColumnKeys:!0,sortable:!0,sortableAll:!0,searchValues:a?s:null})}
    ${Ir(e.warnings)}
    <div class="schema-preview-footer">
      <span>\u9810\u89BD\u524D ${d(i.length)} \u7B46</span>
      <strong>\u5171 ${d(e.total)} \u7B46</strong>
    </div>
  </div>`}function jr(e,t){return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW</div>
        <div class="report-title">${r(t||"\u8CC7\u6599\u8868")}</div>
        <div class="report-sub">\u7121\u6CD5\u8B80\u53D6\u8CC7\u6599\u8868\u9810\u89BD\u3002</div>
      </div>
    </div>
    ${Re({tone:"danger",title:"\u8B80\u53D6\u5931\u6557",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
  </div>`}function Jo(e){return`<div class="report-empty">
    ${ot({iconName:"table",title:"\u9078\u64C7\u8CC7\u6599\u8868\u9810\u89BD",text:`\u5F9E\u5DE6\u5074 ${pa(e)} \u7684 Schema \u6E05\u55AE\u9EDE\u9078\u8CC7\u6599\u8868\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6B04\u4F4D\u540D\u7A31\u3001\u524D 10 \u7B46\u8CC7\u6599\u8207\u7E3D\u7B46\u6578\u3002`})}
  </div>`}function ln(e){return e.is_current===!0?He("ok","\u73FE\u884C"):e.law_abandon_note?He("empty","\u5DF2\u5EE2\u6B62"):e.is_current===!1?He("empty","\u6B77\u53F2\u7248\u672C"):He("not_configured","\u72C0\u614B\u672A\u63D0\u4F9B")}function Ke(e,t){return`<div class="law-meta-item">
    <div class="law-meta-label">${r(e)}</div>
    <div class="law-meta-value">${t||"\u2014"}</div>
  </div>`}function rs(e){return e?Lt(e):"\u2014"}function Vo(e){return e?.meta?.metadata_source==="postgresql"?"PostgreSQL metadata":e?.meta?.metadata_source==="parquet"?"Parquet snapshot":"\u2014"}function cn(e,t){return t?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">${r(e)}</span>
    </div>
    <div class="law-text-block">${r(String(t).trim())}</div>
  </div>`:""}function Wo(e,t,{open:s=!1}={}){return t?`<details class="report-section law-disclosure" data-law-history ${s?"open":""}>
    <summary class="law-disclosure-summary">
      <span class="report-section-title">${r(e)}</span>
      <span class="law-disclosure-hint">\u9810\u8A2D\u6536\u5408 \xB7 \u9EDE\u64CA\u5C55\u958B</span>
      ${p("chevronDown",14,"law-disclosure-chevron")}
    </summary>
    <div class="law-text-block">${r(String(t).trim())}</div>
  </details>`:""}function Ko(e){let t=Array.isArray(e)?e:[],s=t.map(a=>{let n=a?.name||a?.url||"";return n?a.url?`<a class="law-attachment" href="${r(a.url)}" target="_blank" rel="noopener noreferrer">
          ${p("file",12)}<span>${r(n)}</span>${p("external",11)}
        </a>`:`<span class="law-attachment">${p("file",12)}<span>${r(n)}</span></span>`:""}).filter(Boolean).join("");return s?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">\u9644\u4EF6</span>
      <span class="muted">${d(t.length)}</span>
    </div>
    <div class="law-attachment-list">${s}</div>
  </div>`:""}function Br(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function Yo(e){let t=Array.isArray(e.articles)?e.articles:[],s=t.filter(o=>o.article_type==="C").length,a=t.length-s,n=s?`${d(a)} \u689D \xB7 ${d(s)} \u7AE0\u7BC0`:`${d(a)} \u689D`,i=t.map(o=>{let l=String(o.article_content||"").trim();if(!l)return"";if(o.article_type==="C")return`<div class="law-chapter">${r(l)}</div>`;let u=jo[o.article_type]||o.article_type;return`<article class="law-article"
        data-article-no="${r(Br(o.article_no))}">
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
  </div>`}function Xo(){return`<div class="law-jump-float">
    <input class="input law-article-jump-input law-jump-input"
      id="law-article-jump-float" type="text" inputmode="numeric"
      autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
    <button class="btn btn-secondary btn-sm" type="button"
      data-action="jump-article" data-jump-input="law-article-jump-float">\u8DF3\u81F3</button>
  </div>`}function hs(){return`<button class="btn btn-secondary btn-sm" type="button" data-action="back-to-results">
    ${p("chevronLeft",14)}<span>\u8FD4\u56DE\u67E5\u8A62\u7D50\u679C</span>
  </button>`}function Zo(e){return`<div class="law-report">
    <div class="law-report-topbar">
      ${hs()}
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
  </div>`}function el(e,t){return`<div class="law-report">
    <div class="law-report-topbar">
      ${hs()}
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
        ${Re({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function tl(e){let t=Array.isArray(e.versions)?e.versions:[];if(t.length<1)return"";let s=e.selected_version_id??"";return`<label class="law-version-select">
    <span>\u689D\u6587\u7248\u672C</span>
    <select class="select" data-action="select-law-version" aria-label="\u9078\u64C7\u6CD5\u898F\u689D\u6587\u7248\u672C">
      ${t.map(a=>{let n=String(a.update_date||"").match(/\d{4}\/\d{1,2}\/\d{1,2}/)?.[0]||"",i=[`#${a.version_id}`,a.is_current?"\u76EE\u524D":"\u6B77\u53F2",n,a.article_count_for_law?`${d(a.article_count_for_law)} \u7B46`:"\u7121\u689D\u6587\u5FEB\u7167"].filter(Boolean).join(" \xB7 ");return`<option value="${r(a.version_id)}" ${String(a.version_id)===String(s)?"selected":""}>${r(i)}</option>`}).join("")}
    </select>
  </label>`}function sl(e){let t=e.change_summary||{},s=Object.values(t).reduce((o,l)=>o+(Number(l)||0),0),a=Array.isArray(e.changes)?e.changes:[];if(!e.changes_available&&!s)return"";let n={added:"\u65B0\u589E",modified:"\u4FEE\u6539",removed:"\u79FB\u9664"},i=["added","modified","removed"].map(o=>`${n[o]} ${d(t[o]||0)}`).join(" \xB7 ");return`<details class="report-section law-version-changes">
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
  </details>`}function al(e,{database:t="",lawPage:s=1,historyOpen:a=!1}={}){let n=Array.isArray(e.warnings)?e.warnings:[],i=e.law_name||e.law_key||"\u6CD5\u898F",o=(Array.isArray(e.articles)?e.articles:[]).filter(_=>_.article_type!=="C").length,l=Vo(e),u=e.meta?.articles_source==="postgresql"?"PostgreSQL \u689D\u6587\u7248\u672C":e.meta?.articles_source==="parquet"?"Parquet \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",c=e.meta?.snapshot||"",b=e.meta?.articles_source==="postgresql"&&e.selected_version_id!==null&&e.selected_version_id!==void 0?`\u689D\u6587\u7248\u672C #${e.selected_version_id}`:"",$=[l,u,b,c].filter(Boolean).join(" \xB7 "),v=e.source_type==="law"?"\u6CD5\u5F8B":e.source_type==="order"?"\u547D\u4EE4":e.source_type||"\u2014",f=e.version||{},h=[Ke("\u6CD5\u898F\u4F4D\u968E",r(e.law_level||"\u2014")),Ke("\u6CD5\u898F\u985E\u5225",r(e.law_category||"\u2014")),Ke("\u7570\u52D5\u65E5\u671F",rs(e.law_modified_date)),Ke("\u751F\u6548\u65E5\u671F",rs(e.law_effective_date)),Ke("\u689D\u6587\u6578",d(e.article_count)),Ke("\u8CC7\u6599\u72C0\u614B",ln(e)),Ke("\u82F1\u8B6F\u540D\u7A31",r(e.eng_law_name||"\u2014")),Ke("\u6CD5\u898F\u8B58\u5225",`<span class="mono">${r(e.law_key||"\u2014")}</span>`)];return f.first_seen_version_id!==null&&f.first_seen_version_id!==void 0&&h.push(Ke("\u9996\u6B21\u6536\u9304\u7248\u672C",`#${r(f.first_seen_version_id)}`)),f.last_seen_version_id!==null&&f.last_seen_version_id!==void 0&&h.push(Ke("\u6700\u5F8C\u6536\u9304\u7248\u672C",`#${r(f.last_seen_version_id)}`)),f.last_seen_at&&h.push(Ke("\u6700\u5F8C\u6536\u9304\u6642\u9593",r(Me(f.last_seen_at)))),f.selected_version_id!==null&&f.selected_version_id!==void 0&&h.push(Ke("\u689D\u6587\u7248\u672C",`#${r(f.selected_version_id)} \xB7 ${e.meta?.selected_version_is_current?"\u76EE\u524D":"\u6B77\u53F2"}`)),`<div class="law-report">
    <div class="law-report-topbar">
      ${hs()}
      <span class="law-report-origin" title="${r($)}">${r($)}</span>
    </div>
    <div class="report-card law-report-card" data-database="${r(t)}">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT \xB7 ${r(String(t||l).toUpperCase())}</div>
          <div class="report-title">
            ${r(i)}
            ${ln(e)}
            <span class="chip">${r(v)}</span>
          </div>
          <div class="report-sub">
            ${r([e.law_level,e.law_category].filter(Boolean).join(" \xB7 ")||"\u2014")} \xB7 ${d(e.article_count)} \u689D \xB7 \u7570\u52D5 ${rs(e.law_modified_date)}
          </div>
        </div>
        <div class="report-actions">
          ${tl(e)}
          ${e.law_url?`<a class="btn btn-secondary btn-sm" href="${r(e.law_url)}" target="_blank" rel="noopener noreferrer">${p("external",14)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:""}
        </div>
      </div>

      ${n.length?`<div class="report-alert">${Re({tone:e.status==="degraded"?"warn":"info",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n.map(_=>r(_)).join("<br />")})}</div>`:""}

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u689D\u6587\u6578</div>
          <div class="summary-value">${d(e.article_count)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u7570\u52D5\u65E5\u671F</div>
          <div class="summary-value">${rs(e.law_modified_date)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u6CD5\u898F\u4F4D\u968E</div>
          <div class="summary-value">${r(e.law_level||"\u2014")}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u76EE\u524D\u72C0\u614B</div>
          <div class="summary-value">${ln(e)}</div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u6CD5\u898F\u8CC7\u8A0A</span>
          <span class="muted" style="font-size:9.5px">${r(l)}</span>
        </div>
        <div class="law-meta-grid">${h.join("")}</div>
      </div>

      ${sl(e)}
      ${cn("\u6CD5\u898F\u524D\u8A00",e.law_foreword)}
      ${Wo("\u6CD5\u898F\u6CBF\u9769",e.law_histories,{open:a})}
      ${cn("\u751F\u6548\u8AAA\u660E",e.law_effective_note)}
      ${cn("\u5EE2\u6B62\u8AAA\u660E",e.law_abandon_note)}
      ${Ko(e.attachments)}
      ${Yo(e)}
    </div>
    ${o>100?Xo():""}
  </div>`}function nl(e){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${hs()}
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
  </div>`}function rl(e,t){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${hs()}
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
        ${Re({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function il(e){let t=String(e||"").trim();return t?`<button class="law-link judgment-citation-law" type="button"
    data-action="open-law"
    data-law-key="${r(t)}"
    data-law-source=""
    data-law-name="${r(t)}"
    title="\u6AA2\u8996\u300C${r(t)}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${r(t)}${p("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}function ol(e){let t=new Map;for(let s of Array.isArray(e.citations)?e.citations:[]){let a=String(s.law_name||"").trim();if(!a)continue;t.has(a)||t.set(a,new Set);let n=String(s.article_no||"").trim();n&&t.get(a).add(n)}return t.size?`<div class="judgment-citation-groups">
    ${[...t.entries()].map(([s,a])=>`<div class="judgment-citation-group">
          ${il(s)}
          <span class="judgment-citation-articles">${[...a].map(n=>r(n)).join("\u3001")||"\u2014"}</span>
        </div>`).join("")}
  </div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5F15\u7528\u660E\u7D30\u3002</div>'}function ll(e,{database:t="postgres"}={}){let s=Array.isArray(e.matched_laws)?e.matched_laws:[],a=e.title||e.jid||"\u5224\u6C7A",n=String(e.full_text||""),i=Number(e.full_text_length)||n.length||0,o=["PostgreSQL \u5224\u6C7A\u6587\u4EF6",e.source_archive].filter(Boolean).join(" \xB7 "),l=[Ke("\u6848\u865F",r(e.jid||"\u2014")),Ke("\u5E74\u5EA6",r(e.jyear||"\u2014")),Ke("\u5B57\u5225",r(e.jcase||"\u2014")),Ke("\u865F\u78BC",r(e.jno||"\u2014")),Ke("\u6CD5\u9662",r(e.court||"\u2014")),Ke("\u6848\u7531",r(e.title||"\u2014")),Ke("\u88C1\u5224\u65E5\u671F",rs(e.jdate)),Ke("\u4F86\u6E90\u58D3\u7E2E\u6A94",r(e.source_archive||"\u2014")),Ke("\u5168\u6587\u9577\u5EA6",`${d(i)} \u5B57`),Ke("\u5F15\u7528\u6578",d(e.citation_count))];return e.import_run_id!==null&&e.import_run_id!==void 0&&l.push(Ke("\u532F\u5165 Run",`#${r(e.import_run_id)}`)),`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${hs()}
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
            ${r(e.court||"\u2014")} \xB7 ${rs(e.jdate)} \xB7
            ${d(i)} \u5B57
          </div>
        </div>
        <div class="report-actions">
          ${e.pdf_url?`<a class="btn btn-secondary btn-sm" href="${r(e.pdf_url)}" target="_blank" rel="noopener noreferrer">${p("external",14)}<span>PDF</span></a>`:""}
        </div>
      </div>

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u88C1\u5224\u65E5\u671F</div>
          <div class="summary-value">${rs(e.jdate)}</div>
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
        ${ol(e)}
      </div>

      <div class="report-section judgment-text-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5224\u6C7A\u539F\u6587</span>
          <span class="muted">${d(i)} \u5B57</span>
        </div>
        ${n?`<div class="judgment-fulltext">${r(n)}</div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5168\u6587\u3002</div>'}
      </div>
    </div>
  </div>`}function Tr(e){return`"${(e==null?"":typeof e=="object"?JSON.stringify(e):String(e)).replace(/"/g,'""')}"`}function ga(e){let t=e.columns||[],s=e.rows||[],a=[["#",...t.map(i=>i.label||i.key)].map(Tr).join(",")],n=((Number(e.page)||1)-1)*(Number(e.page_size)||25);return s.forEach((i,o)=>{a.push([n+o+1,...t.map(l=>i[l.key])].map(Tr).join(","))}),`\uFEFF${a.join(`\r
`)}`}function fa(e){return{...e,rows:(e.rows||[]).map(t=>{let s={};for(let[a,n]of Object.entries(t))a.startsWith("_")||(s[a]=n);return s})}}function cl(e){return e==="rag"?"RAG \u63D0\u554F":e==="data"?"\u8CC7\u6599\u67E5\u8A62":e||"\u5176\u4ED6"}async function Nr(e,t){let s=performance.now(),a=Cr(e,t),n=String(a.store||"query_history"),i=String(a.keyword||""),o=t.page,l=t.pageSize,u=[],c=[],b=[],$=[];if(n==="audit_events"){try{let I=Number(await Xt("audit.last_event_id",0))||0,Q=await z.versioningAudit({since_id:I,limit:500}),oe=Array.isArray(Q?.events)?Q.events:[];oe.length&&await dr(oe.map(je=>({...je,dataset:"judgment"})));let te=Number(Q?.latest_event_id||0);te>I&&await Is("audit.last_event_id",te)}catch(I){u.push(`\u7248\u672C audit \u540C\u6B65\u5931\u6557\uFF1A${I.message||I}`)}c=(await ur({keyword:i,limit:qr})).map(I=>({created_at:I.created_at,dataset:I.dataset,issue_month:I.issue_month,change_type:I.change_type,jid:I.jid,detail:I.detail})),b=[{key:"created_at",label:"\u6642\u9593",type:"datetime"},{key:"dataset",label:"\u8CC7\u6599\u96C6",type:"text"},{key:"issue_month",label:"\u6708\u4EFD",type:"mono"},{key:"change_type",label:"\u8B8A\u66F4",type:"status"},{key:"jid",label:"\u6848\u865F",type:"mono"},{key:"detail",label:"\u6458\u8981",type:"longtext"}];let O=new Map;c.forEach(I=>O.set(I.change_type||"unknown",(O.get(I.change_type||"unknown")||0)+1)),$=Array.from(O.entries()).map(([I,Q])=>({label:I,value:Q})).sort((I,Q)=>Q.value-I.value)}else if(n==="settings"){c=(await pr({keyword:i})).map(I=>({key:I.key,value:mr(I.value),updated_at:I.updated_at})),b=[{key:"key",label:"\u8A2D\u5B9A\u9375",type:"mono"},{key:"value",label:"\u503C",type:"longtext"},{key:"updated_at",label:"\u66F4\u65B0\u6642\u9593",type:"datetime"}];let O=new Map;c.forEach(I=>{let Q=String(I.key||"").split(".")[0]||"\u5176\u4ED6";O.set(Q,(O.get(Q)||0)+1)}),$=Array.from(O.entries()).map(([I,Q])=>({label:I,value:Q})).sort((I,Q)=>Q.value-I.value)}else{c=(await ra({keyword:i,limit:qr})).map(I=>({kind:cl(I.kind),title:I.title,detail:I.detail,created_at:I.created_at})),b=[{key:"kind",label:"\u985E\u578B",type:"text"},{key:"title",label:"\u67E5\u8A62\u5167\u5BB9",type:"longtext"},{key:"detail",label:"\u6458\u8981",type:"longtext"},{key:"created_at",label:"\u6642\u9593",type:"datetime"}];let O=new Map;c.forEach(I=>O.set(I.kind,(O.get(I.kind)||0)+1)),$=Array.from(O.entries()).map(([I,Q])=>({label:I,value:Q})).sort((I,Q)=>Q.value-I.value)}let v=c.length,f=(o-1)*l,h=c.slice(f,f+l),_=Math.round(performance.now()-s),S=or();return S&&u.push("IndexedDB \u7121\u6CD5\u4F7F\u7528\uFF0C\u8CC7\u6599\u66AB\u5B58\u5728\u8A18\u61B6\u9AD4\uFF0C\u91CD\u65B0\u6574\u7406\u5F8C\u6703\u6D88\u5931\u3002"),{database:"indexeddb",label:"IndexedDB",status:S?"degraded":"ok",message:S?"\u700F\u89BD\u5668\u4E0D\u5141\u8A31\u4F7F\u7528 IndexedDB\uFF0C\u672C\u9801\u6539\u7528\u8A18\u61B6\u9AD4\u66AB\u5B58\u3002":null,table:n,columns:b,rows:h,total:v,page:o,page_size:l,duration_ms:_,summary:[{label:"\u7B26\u5408\u7B46\u6578",value:String(v)},{label:"\u76EE\u524D\u9801\u9762",value:`${h.length} \u7B46`},{label:"\u5132\u5B58\u6A21\u5F0F",value:na()==="indexeddb"?"IndexedDB":"\u8A18\u61B6\u9AD4"},{label:"\u67E5\u8A62\u8017\u6642",value:`${_} ms`}],distribution:$,query_text:`INDEXEDDB OPEN 'judgment-console'
OBJECT STORE '${n}'
FILTER ${i?`keyword \u2248 '${i}'`:"1 = 1"}
ORDER BY created_at DESC
LIMIT ${l} OFFSET ${f}`,warnings:u,meta:{store:n,filters:a,client_side:!0}}}async function dl(e,t){let s=!1,a=null,n=[],i="law",o=null,l={},u=0,c=25,b="query",$=null,v=null,f=0,h=[],_=null,S=-1,R=0,O=0,I=null,Q=null,oe=null;e.innerHTML=`<section class="page data-page">
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
          ${p("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
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
  </section>`;let te=e.querySelector("#query-sidebar"),je=e.querySelector("#data-nav"),De=e.querySelector("#db-options-wrap"),X=e.querySelector("#filter-area"),P=e.querySelector("#schema-area"),k=e.querySelector("#query-main"),M=e.querySelector("#schema-suggest-popover"),Z=e.querySelector("#catalog-meta"),ue=e.querySelector("#refresh-catalog"),G=w=>n.find(x=>x.id===w),ee=()=>G(i)?.databases||[],J=w=>ee().find(x=>x.id===w),le=(w,x)=>`${w}:${x}`,me=(w,x=i)=>l[le(x,w.id)],K=(w,x)=>{Is(w,x).catch(()=>{})},we=()=>{if(!a){Z.textContent="CATALOG \xB7 \u96E2\u7DDA",Z.className="badge badge-danger badge-mono";return}let w=ee(),x=w.filter(T=>T.available).length,q=G(i);Z.textContent=`CATALOG \xB7 ${q?.label||i} \xB7 ${x}/${w.length} \u53EF\u7528`,Z.className="badge badge-neutral badge-mono"},Be=w=>{k.innerHTML=Io(w)},ke=()=>{let w=Q?.returnScroll??oe?.returnScroll;Q=null,oe=null;let x=J(o),q=x?me(x):null;b==="schema"&&v?.result?k.innerHTML=on(v.result,Ae(x,v.tableId),{columnFilters:v.columnFilters||{},searchEnabled:x.id==="postgres"||x.id==="parquet"}):q?.result?k.innerHTML=ua(q.result):x&&Be(x),typeof w=="number"&&window.requestAnimationFrame(()=>window.scrollTo({top:w,behavior:"smooth"}))},tt=(w="law-article-jump")=>{let x=k.querySelector(`#${w}`),q=Br(x?.value);if(!q){A("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),x?.focus();return}let H=[...k.querySelectorAll("[data-article-no]")].find(U=>U.dataset.articleNo===q);if(!H){A(`\u627E\u4E0D\u5230\u7B2C ${q} \u689D\u3002`,"warn");return}H.scrollIntoView({behavior:"instant",block:"center"}),H.classList.add("is-jump-target"),window.setTimeout(()=>H.classList.remove("is-jump-target"),2400)},ie=async({lawKey:w,sourceType:x="",lawName:q="",versionId:T=""})=>{let H=J(o),U=H?me(H):null,ne=b==="schema"?v?.result:null;if(!H||!U?.result&&!ne||!w)return;let Se=++u;Q={seq:Se,lawKey:w,sourceType:x,lawName:q,versionId:T?String(T):"",page:1,detail:null,database:H.id,returnScroll:window.scrollY},oe=null,k.innerHTML=Zo(q||w),k.scrollIntoView({behavior:"smooth",block:"start"});try{let Te=await z.lawDetail(w,x,Q.versionId);if(s||!Q||Q.seq!==Se)return;Q.detail=Te,Q.page=1,k.innerHTML=al(Te,{database:Q.database,lawPage:Q.page})}catch(Te){if(s||!Q||Q.seq!==Se)return;k.innerHTML=el(Te,q||w),A(Te.message||"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868\u3002","danger")}},$e=async({jid:w})=>{let x=J(o),q=x?me(x):null,T=b==="schema"?v?.result:null;if(!x||!q?.result&&!T||!w)return;let H=++u;Q=null;let U=x.id==="parquet"?"parquet":"postgres";oe={seq:H,jid:w,detail:null,database:x.id,source:U,returnScroll:window.scrollY},k.innerHTML=nl(w),k.scrollIntoView({behavior:"smooth",block:"start"});try{let ne=await z.judgmentDetail(w,U);if(s||!oe||oe.seq!==H)return;oe.detail=ne,k.innerHTML=ll(ne,{database:oe.database})}catch(ne){if(s||!oe||oe.seq!==H)return;k.innerHTML=rl(ne,w),A(ne.message||"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587\u3002","danger")}},_e=(w,x)=>`${i}:${w.id}:${x}`,Ae=(w,x)=>(w.tables||[]).find(q=>q.id===x)?.label||x,Ye=(w,x,{sort:q=null,columnFilters:T={}}={})=>{let H={column_filters:T};return w.id==="postgres"?(H.table=x,H.schema_preview=!0):w.id==="parquet"&&i==="judgment"?(H.table="judgment_documents",H.columns=Mo):w.id==="parquet"&&(H.dataset="all",H.columns=Lo),q?.key&&(H.sort=`${q.key}:${q.direction}`),H},nt=async(w,x,{sort:q=null,columnFilters:T={},quiet:H=!1}={})=>{if(!x)return;Ue();let U=_e(w,x),ne=++f,Se=!!(H&&v?.result&&v.key===U);$={tableId:x},v={key:U,tableId:x,loading:!0,result:null,error:null,sort:q,columnFilters:T},Se?k.setAttribute("aria-busy","true"):(P.innerHTML=rn(w,G(i)?.label||i,x),k.innerHTML=Mr(Ae(w,x)));try{let Te;if(w.id==="indexeddb"){let ye=ca(w,10);ye.values.store=x,ye.page=1,Te=await Nr(w,ye)}else w.id==="qdrant"?Te={database:"qdrant",label:"Qdrant",status:"not_configured",message:"Qdrant collection \u9700\u8981\u8A9E\u610F\u67E5\u8A62\uFF1BSchema \u50C5\u63D0\u4F9B collection \u540D\u7A31\uFF0C\u4E0D\u5217\u51FA\u524D 10 \u7B46\u8CC7\u6599\u3002",table:x,columns:[],rows:[],total:0,page:1,page_size:10,duration_ms:0,summary:[],distribution:[],query_text:"",warnings:[],meta:{}}:(Te=await z.query({database:w.id,filters:Ye(w,x,{sort:q,columnFilters:T}),page:1,pageSize:10}),q?.key&&(Te.meta={...Te.meta||{},sort:q}));if(s||ne!==f)return;v={key:U,tableId:x,loading:!1,result:Te,error:null,sort:q,columnFilters:T},k.removeAttribute("aria-busy"),b==="schema"&&$?.tableId===x&&(P.innerHTML=rn(w,G(i)?.label||i,x),k.innerHTML=on(Te,Ae(w,x),{columnFilters:T,searchEnabled:w.id==="postgres"||w.id==="parquet"}))}catch(Te){if(s||ne!==f)return;v={key:U,tableId:x,loading:!1,result:null,error:Te,sort:q,columnFilters:T},k.removeAttribute("aria-busy"),b==="schema"&&$?.tableId===x&&(k.innerHTML=jr(Te,Ae(w,x)))}},L=()=>{let w=J(o);if(!w)return null;if(b==="schema"&&v?.result)return{db:w,tableId:v.tableId,columnFilters:v.columnFilters||{},sort:v.sort||null,mode:"schema"};let x=w?me(w):null,q=x?.result;return q&&(w.id==="postgres"||w.id==="parquet")?{db:w,tableId:q.table,columnFilters:x.columnFilters||{},sort:x.sort||null,mode:"query"}:null},C=(w,x,q)=>{if(!w)return;let T=`${w.db.id}:${w.tableId}:${x}`,H=B.get(T);H&&(window.clearTimeout(H),B.delete(T)),Ue();let U={...w.columnFilters||{}},ne=String(q||"").trim();if(ne?U[x]=ne:delete U[x],w.mode==="schema"){nt(w.db,w.tableId,{sort:w.sort,columnFilters:U,quiet:!0});return}let Se=me(w.db);Se.columnFilters=U,Se.page=1,Je(1)},B=new Map,D=()=>{(!M||M.hidden)&&!h.length&&!_||(R+=1,h=[],_=null,S=-1,M&&(M.hidden=!0,M.innerHTML=""))},ve=(w,x)=>{let q=String(w||""),T=q.toLocaleLowerCase(),H=String(x||"").toLocaleLowerCase(),U=new Array(q.length).fill(!1),ne=(Ie,Ve)=>{for(let We=Ie;We<Ie+Ve;We+=1)We>=0&&We<U.length&&(U[We]=!0)},Se=T.indexOf(H);if(Se>=0)for(;Se>=0;)ne(Se,H.length),Se=T.indexOf(H,Se+H.length);else{let Ie=[];for(let Ve of H.match(/[一-鿿]{2,}/g)||[])for(let We=0;We<Ve.length-1;We+=1)Ie.push(Ve.slice(We,We+2));Ie.push(...H.match(/[a-z0-9]+/g)||[]);for(let Ve of Ie){let We=T.indexOf(Ve);for(;We>=0;)ne(We,Ve.length),We=T.indexOf(Ve,We+Ve.length)}}let Te="",ye=0;for(;ye<q.length;)if(U[ye]){let Ie=ye;for(;Ie<q.length&&U[Ie];)Ie+=1;Te+=`<mark>${r(q.slice(ye,Ie))}</mark>`,ye=Ie}else{let Ie=ye;for(;Ie<q.length&&!U[Ie];)Ie+=1;Te+=r(q.slice(ye,Ie)),ye=Ie}return Te||r(q)},V=(w,x)=>{if(!M)return;let q=w.getBoundingClientRect(),T=Math.min(420,Math.max(220,q.width)),H=Math.min(360,34+x*30),U=q.bottom+4;U+H>window.innerHeight-8&&(U=Math.max(8,q.top-H-4));let ne=Math.min(window.innerWidth-T-8,Math.max(8,q.left));M.style.width=`${T}px`,M.style.left=`${ne}px`,M.style.top=`${U}px`},Pe=w=>{if(!M)return;let x=[...M.querySelectorAll(".schema-suggest-item")];x.length&&(S=Math.max(0,Math.min(x.length-1,w)),x.forEach((q,T)=>{q.classList.toggle("is-active",T===S)}),x[S].scrollIntoView({block:"nearest"}))},F=w=>{let x=h[w],q=_;!x||!q||(D(),C(q,q.column,x))},ge=async(w,x,q,T)=>{if(!w||!q.trim()){D();return}let H=++R;_={...w,column:x,input:T},S=-1;try{let U=await z.schemaSuggest({database:w.db.id,table:w.tableId,column:x,query:q,limit:1e3});if(H!==R||document.activeElement!==T||!M)return;let ne=Array.isArray(U.values)?U.values:[];if(h=ne,!ne.length){D();return}let Se=Number(U.total)>ne.length?`\u5171 ${d(U.total)} \u500B\u7B26\u5408\uFF0C\u986F\u793A\u524D ${d(ne.length)} \u500B`:`\u5171 ${d(U.total)} \u500B\u7B26\u5408`;M.innerHTML=`<div class="schema-suggest-head">${r(Se)}</div>${ne.map((Te,ye)=>`<button class="schema-suggest-item" type="button"
            data-schema-suggest-index="${ye}"
            title="${r(Te)}">${ve(Te,q)}</button>`).join("")}`,V(T,ne.length),M.hidden=!1}catch{D()}},Ue=()=>{let w=document.activeElement;w instanceof HTMLElement&&w.matches("[data-schema-search]")&&w.blur(),D()},Ge=(w,{resetReport:x=!1}={})=>{Ue();let q=me(w);if(je.innerHTML=Lr(i,b),De.innerHTML=Co(ee(),w.id),b==="schema")X.hidden=!0,X.innerHTML="",P.hidden=!1,P.innerHTML=`<div class="schema-category-switch" role="tablist" aria-label="Schema \u985E\u5225">
        ${["law","judgment"].map(T=>{let H=n.find(U=>U.id===T);return H?`<button class="chip${i===T?" is-active":""}" type="button" role="tab" aria-selected="${i===T}" data-action="schema-category" data-category="${T}">${r(H.label)}</button>`:""}).join("")}
      </div>${rn(w,G(i)?.label||i,$?.tableId||"")}`;else{P.hidden=!0,P.innerHTML="",X.hidden=!1;let T=Ro(i,w,q),H=Ar(w,q);X.innerHTML=`${Eo(w)}${T?`${T}<details class="data-advanced"><summary>\u9032\u968E metadata \u689D\u4EF6</summary>${H}</details>`:H}<div class="sidebar-note">${Po(w)}</div>`}if(we(),b==="schema"){let T=$?_e(w,$.tableId):"";if(v&&v.key===T){let H=Ae(w,v.tableId);v.loading?k.innerHTML=Mr(H):v.error?k.innerHTML=jr(v.error,H):k.innerHTML=on(v.result,H,{columnFilters:v.columnFilters||{},searchEnabled:w.id==="postgres"||w.id==="parquet"})}else k.innerHTML=Jo(w);return}x?Be(w):q.result?k.innerHTML=ua(q.result):Be(w)},ls=(w,{persist:x=!0,resetReport:q=!1}={})=>{let T=ee(),H=T.find(ne=>ne.id===w)||T[0];if(!H)return;Q=null,oe=null,$=null,v=null,f+=1,o=H.id;let U=le(i,H.id);l[U]||(l[U]=ca(H,c)),Ge(H,{resetReport:q}),x&&(K(`data.last_database.${i}`,H.id),K("data.last_category",i))},Xe=(w,{persist:x=!0,resetReport:q=!0,databaseId:T=null}={})=>{let H=G(w)||n[0];if(!H)return;i=H.id,Q=null,oe=null;let U=H.databases||[],ne=T&&U.find(Se=>Se.id===T)||U.find(Se=>Se.id===o)||U[0];if(o=ne?.id||null,!ne){je.innerHTML=Lr(i,b),De.innerHTML=`<div class="sidebar-notice">${Re({tone:"warn",title:"\u6C92\u6709\u53EF\u7528\u7684\u8CC7\u6599\u4F86\u6E90",text:"\u9019\u500B\u985E\u5225\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u5EAB\u9078\u9805\u3002"})}</div>`,X.innerHTML="",we();return}ls(ne.id,{persist:!1,resetReport:q}),x&&(K("data.last_category",H.id),K(`data.last_database.${H.id}`,ne.id))},Ss=w=>{let x=me(w),q=X.querySelector("#data-filter-form");q&&(x.values=da(q,w,x))},Je=async(w=null,{quiet:x=!1}={})=>{let q=J(o);if(!q)return;Ue();let T=me(q);Ss(q),w!==null&&(T.page=w),(!Number.isFinite(T.page)||T.page<1)&&(T.page=1);let H=++u;Q=null,oe=null;let U=k.querySelector(".report-card"),ne=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!U?k.setAttribute("aria-busy","true"):(k.removeAttribute("aria-busy"),k.innerHTML=Os(q));let Te=X.querySelector("#run-query");x||qe(Te,!0,"\u67E5\u8A62\u4E2D\u2026");try{let ye;if(q.id==="indexeddb"?ye=await Nr(q,T):ye=await z.query({database:q.id,filters:nn(q,T),page:T.page,pageSize:T.pageSize}),s||H!==u)return;if(ye.meta={...ye.meta||{},column_filters:T.columnFilters||{},searchable:q.id==="postgres"||q.id==="parquet",sort:T.sort||ye.meta?.sort||null},T.result=ye,T.page=Number(ye.page)||T.page,T.pageSize=Number(ye.page_size)||T.pageSize,k.removeAttribute("aria-busy"),k.innerHTML=ua(ye),ne!==null){let Ve=k.querySelector("[data-page-size]");Ve&&(Ve.value=String(T.pageSize),Ve.focus({preventScroll:!0}))}let Ie=G(i)?.label||i;await Rs({kind:"data",title:`${Ie} \xB7 ${q.label} \xB7 ${ye.table||ye.label||"query"}`,detail:`${d(ye.total)} \u7B46 \xB7 ${be(ye.duration_ms)}`,payload:{category:i,database:q.id,filters:nn(q,T),page:T.page,page_size:T.pageSize}}),K("data.last_query",{category:i,database:q.id,filters:nn(q,T),page:T.page,page_size:T.pageSize,at:new Date().toISOString()})}catch(ye){if(s||H!==u)return;k.removeAttribute("aria-busy"),k.innerHTML=ma(ye,q),A(ye.message||"\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{!s&&H===u&&qe(Te,!1)}},cs=(w,x)=>{let q=w?.querySelector("[data-data-fuzzy-results]");q&&(q.innerHTML=x.length?x.map(T=>`<button class="data-fuzzy-option" type="button" role="option" data-action="select-fuzzy-term" data-term="${r(T.value)}"><span>${r(T.label||T.value)}</span><small>${r(T.meta||"")}</small></button>`).join(""):'<div class="data-fuzzy-empty">\u6C92\u6709\u76F8\u8FD1\u7D50\u679C\uFF1B\u6309 Enter \u53EF\u76F4\u63A5\u52A0\u5165\u76EE\u524D\u8F38\u5165\u7684\u95DC\u9375\u5B57\u3002</div>')},ds=async(w,x="")=>{if(!w)return;let q=J(o),T=q?me(q):null;if(!T)return;let H=w.dataset.fuzzyKind||i,U=w.querySelector("[data-data-fuzzy-results]"),ne=++O;U&&(U.innerHTML='<div class="data-fuzzy-loading"><span class="spinner"></span><span>\u641C\u5C0B\u76F8\u8FD1\u7D50\u679C\u2026</span></div>');try{let Se=await z.dataSuggest({kind:H,query:x,limit:12});if(ne!==O)return;let Te=(Se.suggestions||[]).filter(ye=>!T.fuzzyTerms.includes(ye.value));cs(w,Te)}catch(Se){if(ne!==O)return;U&&(U.innerHTML=`<div class="data-fuzzy-empty">${r(Se.message||"\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},Bt=(w,{focus:x=!1}={})=>{if(!w)return;let q=w.querySelector("[data-data-fuzzy-popover]"),T=w.querySelector("[data-data-fuzzy-search]");!q||!T||(q.hidden&&(q.hidden=!1,T.value="",ds(w,"")),x&&(T.focus(),T.select()))},qt=w=>{I&&(window.clearTimeout(I),I=null);let x=w?.querySelector("[data-data-fuzzy-popover]");x&&(x.hidden=!0)},Ot=async w=>{let x=J(o);if(!x)return;let q=me(x),T=String(w||"").trim();!T||q.fuzzyTerms.includes(T)||(q.fuzzyTerms=[...q.fuzzyTerms,T],qt(X.querySelector("[data-data-fuzzy]")),Ge(x),await Je(1))},Dt=async w=>{let x=J(o);if(!x)return;let q=me(x),T=String(w||"").trim();q.fuzzyTerms=q.fuzzyTerms.filter(H=>H!==T),Ge(x),await Je(1)},Et=async()=>{ue.disabled=!0,qe(ue,!0,"\u6574\u7406\u4E2D\u2026");try{let[w,x,q,T,H]=await Promise.all([z.catalog(),Xt("data.last_category","law"),Xt("data.last_database.law","postgres"),Xt("data.last_database.judgment","postgres"),Xt("data.page_size",25)]);if(s)return;a=w,n=Array.isArray(a.categories)?a.categories:[],c=Er.includes(Number(H))?Number(H):25;for(let ye of n)for(let Ie of ye.databases||[]){let Ve=le(ye.id,Ie.id);l[Ve]||(l[Ve]=ca(Ie,c))}let U=n.find(ye=>ye.id===x)||n[0];if(!U){je.innerHTML="",De.innerHTML=`<div class="sidebar-notice">${Re({tone:"danger",title:"\u6C92\u6709\u53EF\u7528\u7684\u5206\u985E",text:"Catalog \u6C92\u6709\u56DE\u50B3\u6CD5\u898F\u547D\u4EE4\u6216\u5224\u6C7A\u5206\u985E\u3002"})}</div>`;return}let ne=U.id==="judgment"?T:q;if(i=U.id,o=null,Xe(U.id,{persist:!1,resetReport:!0,databaseId:ne}),s)return;let Se=J(o),Te=Se?me(Se):null;Se&&Te&&b==="query"&&!Te.result&&(Se.id==="postgres"||Se.id==="parquet")&&Je(1),A("\u8CC7\u6599\u5EAB catalog \u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(w){if(s)return;a=null,n=[],je.innerHTML="",we(),De.innerHTML=`<div class="sidebar-notice">${Re({tone:"danger",title:"\u7121\u6CD5\u8B80\u53D6 catalog",text:r(w.message||"\u8ACB\u78BA\u8A8D API \u662F\u5426\u555F\u52D5\u3002")})}
      <button class="btn btn-secondary btn-sm" type="button" id="catalog-retry" style="margin-top:10px">
        ${p("refresh",14)}<span>\u91CD\u8A66</span>
      </button></div>`,k.innerHTML=`<div class="report-empty">${ot({iconName:"server",title:"API \u76EE\u524D\u7121\u6CD5\u9023\u7DDA",text:"\u67E5\u8A62\u5831\u8868\u9700\u8981 FastAPI \u63D0\u4F9B catalog \u8207\u8CC7\u6599\u67E5\u8A62 API\u3002\u8ACB\u78BA\u8A8D judgment-web \u5DF2\u555F\u52D5\u3002"})}</div>`}finally{s||(ue.disabled=!1,qe(ue,!1))}};te.addEventListener("change",w=>{let x=w.target;if(x.name==="category"){Xe(x.value);return}if(x.name==="database"){ls(x.value);let U=J(o),ne=U?me(U):null;U&&ne&&!ne.result&&b==="query"&&(U.id==="postgres"||U.id==="parquet")&&Je(1);return}let q=J(o);if(!q)return;let T=me(q),H=X.querySelector("#data-filter-form");!H||!x.name||(T.values=da(H,q,T),T.page=1,x.name==="table"&&(Q=null,oe=null,T.sort=null,T.columnFilters={},T.result=null,X.innerHTML=Ar(q,T),Be(q)))}),te.addEventListener("input",w=>{let x=w.target.closest("[data-data-fuzzy-search]");if(x){let U=x.closest("[data-data-fuzzy]");I&&window.clearTimeout(I),I=window.setTimeout(()=>{ds(U,x.value)},160);return}let q=J(o);if(!q)return;let T=X.querySelector("#data-filter-form");if(!T||!w.target.name||w.target.name==="table")return;let H=me(q);H.values=da(T,q,H)}),te.addEventListener("keydown",w=>{let x=w.target.closest("[data-data-fuzzy-search]");if(!x)return;let q=x.closest("[data-data-fuzzy]");if(w.key==="Escape")w.preventDefault(),qt(q),x.blur();else if(w.key==="Enter"){w.preventDefault();let T=q?.querySelector("[data-action='select-fuzzy-term']");T?T.click():Ot(x.value)}else w.key==="ArrowDown"&&(w.preventDefault(),q?.querySelector("[data-action='select-fuzzy-term']")?.focus())}),te.addEventListener("mouseover",w=>{let x=w.target.closest("[data-action='open-fuzzy']");x&&Bt(x.closest("[data-data-fuzzy]"))}),te.addEventListener("mouseout",w=>{let x=w.target.closest("[data-data-fuzzy]");x&&(w.relatedTarget&&x.contains(w.relatedTarget)||qt(x))}),te.addEventListener("submit",w=>{w.target.id==="data-filter-form"&&(w.preventDefault(),Je(1))}),te.addEventListener("click",async w=>{let x=X.querySelector("[data-data-fuzzy] [data-data-fuzzy-popover]:not([hidden])")?.closest("[data-data-fuzzy]");x&&!w.target.closest("[data-data-fuzzy]")&&qt(x);let q=w.target.closest("[data-action]"),T=q?.dataset.action;if(T==="data-nav"){let H=q.dataset.tab,U=J(o);if(H==="schema"){if(b!=="schema"){if(U){let ye=me(U),Ie=X.querySelector("#data-filter-form");Ie&&(ye.values=da(Ie,U,ye))}b="schema",U&&Ge(U)}return}let ne=H==="judgment"?"judgment":"law";b==="schema"&&(b="query"),i!==ne?Xe(ne,{databaseId:o,resetReport:!1}):U&&Ge(U);let Se=J(o),Te=Se?me(Se):null;Se&&Te&&!Te.result&&(Se.id==="postgres"||Se.id==="parquet")&&Je(1);return}if(T==="open-fuzzy"){Bt(q.closest("[data-data-fuzzy]"),{focus:!0});return}if(T==="select-fuzzy-term"){await Ot(q.dataset.term);return}if(T==="remove-fuzzy-term"){await Dt(q.dataset.term);return}if(T==="schema-category"){b="schema",Xe(q.dataset.category||"law",{resetReport:!0});return}if(T==="select-schema-table"){let H=J(o);if(!H)return;nt(H,q.dataset.tableId||"");return}if(T==="reset"){let H=J(o);if(!H)return;Q=null,oe=null;let U=me(H);l[le(i,H.id)]=ca(H,U.pageSize),Ge(H),Be(H),A("\u5DF2\u91CD\u8A2D\u9019\u500B\u8CC7\u6599\u5EAB\u7684\u67E5\u8A62\u689D\u4EF6\u3002","info",2400);return}w.target.closest("#catalog-retry")&&Et()}),k.addEventListener("input",w=>{let x=w.target.closest("[data-schema-search]");if(!x)return;let q=L();if(!q)return;let T=x.dataset.schemaSearch||"",H=x.value,U=`${q.mode}:${q.db.id}:${q.tableId}:${T}`,ne=B.get(U);if(ne&&window.clearTimeout(ne),!H.trim()){B.delete(U),D(),C(q,T,"");return}let Se=window.setTimeout(()=>{B.delete(U),ge(q,T,H,x)},250);B.set(U,Se)}),k.addEventListener("keydown",w=>{let x=w.target.closest("[data-schema-search]");if(!x)return;let q=L();if(q){if(w.key==="Escape"){D();return}if(w.key==="ArrowDown"||w.key==="ArrowUp"){if(!M||M.hidden)return;w.preventDefault();let T=w.key==="ArrowDown"?1:-1;Pe(S<0?T>0?0:h.length-1:S+T);return}if(w.key==="Enter"){if(w.preventDefault(),M&&!M.hidden&&S>=0){F(S);return}C(q,x.dataset.schemaSearch||"",x.value)}}}),M?.addEventListener("mousedown",w=>{w.preventDefault()}),M?.addEventListener("click",w=>{let x=w.target.closest("[data-schema-suggest-index]");x&&F(Number(x.dataset.schemaSuggestIndex))});let Ft=w=>{w.target.closest("[data-schema-search]")||M?.contains(w.target)||D()};return document.addEventListener("click",Ft),window.addEventListener("scroll",D,{capture:!0,passive:!0}),window.addEventListener("resize",D),k.addEventListener("keydown",w=>{w.target.matches(".law-jump-input")&&w.key==="Enter"&&(w.preventDefault(),tt(w.target.id))}),k.addEventListener("click",async w=>{let x=w.target.closest("[data-action]");if(!x)return;let q=x.dataset.action,T=J(o),H=T?me(T):null,U=H?.result;if(q==="back-to-results"){ke();return}if(q==="open-law"){ie({lawKey:x.dataset.lawKey||"",sourceType:x.dataset.lawSource||"",lawName:x.dataset.lawName||""});return}if(q==="open-judgment"){$e({jid:x.dataset.jid||""});return}if(q==="jump-article"){tt(x.dataset.jumpInput||"law-article-jump");return}if(q==="sort-column"){let ne=x.dataset.sortKey||"";if(!ne||!T)return;if(b==="schema"&&v?.result){let ye=v.sort,Ie=ne==="jdate"||ne==="law_modified_date"||ne==="article_count"||ne==="citation_count"||ne==="full_text_length"||ne==="created_at"||ne==="updated_at",Ve=ye?.key===ne?ye.direction==="asc"?"desc":"asc":Ie?"desc":"asc";nt(T,v.tableId,{sort:{key:ne,direction:Ve},columnFilters:v.columnFilters||{},quiet:!0});return}if(!H)return;let Se=H.sort,Te=Se?.key===ne?Se.direction==="asc"?"desc":"asc":ne==="jdate"?"desc":"asc";H.sort={key:ne,direction:Te},Je(1,{quiet:!0});return}if(q==="retry"){Je(H?.page||1);return}if(U){if(q==="prev-page"){Je(Math.max(1,Number(U.page)-1),{quiet:!0});return}if(q==="next-page"){let ne=Math.max(1,Math.ceil(Number(U.total)/Number(U.page_size)));Je(Math.min(ne,Number(U.page)+1),{quiet:!0});return}if(q==="copy-query"){let ne=await ps(U.query_text||"");A(ne?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",ne?"ok":"warn");return}if(q==="export-json"){let ne=`${U.database}-${U.table||"query"}-page-${U.page}.json`;jt(ne,JSON.stringify(fa(U),null,2),"application/json;charset=utf-8"),A(`\u5DF2\u532F\u51FA ${ne}`,"ok");return}if(q==="export-csv"){let ne=`${U.database}-${U.table||"query"}-page-${U.page}.csv`;jt(ne,ga(U),"text/csv;charset=utf-8"),A(`\u5DF2\u532F\u51FA ${ne}`,"ok")}}}),k.addEventListener("change",w=>{let x=w.target.closest("[data-action='select-law-version']");if(x&&Q){ie({lawKey:Q.lawKey,sourceType:Q.sourceType,lawName:Q.lawName,versionId:x.value});return}if(!w.target.matches("[data-page-size]"))return;let q=J(o);if(!q)return;let T=me(q);T.pageSize=Number(w.target.value)||25,T.page=1,K("data.page_size",T.pageSize),Je(1,{quiet:!0})}),ue.addEventListener("click",()=>{Et()}),await Et(),t&&typeof t.setTitle=="function"&&t.setTitle("\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"),()=>{s=!0,I&&window.clearTimeout(I);for(let w of B.values())window.clearTimeout(w);B.clear(),D(),document.removeEventListener("click",Ft),window.removeEventListener("scroll",D,{capture:!0}),window.removeEventListener("resize",D)}}var Hr=[10,25,50,100],ul=[{value:"started_at:desc",label:"Timestamp \u65B0 \u2192 \u820A"},{value:"started_at:asc",label:"Timestamp \u820A \u2192 \u65B0"},{value:"duration_ms:desc",label:"\u8017\u6642\u591A \u2192 \u5C11"},{value:"duration_ms:asc",label:"\u8017\u6642\u5C11 \u2192 \u591A"}];function pn(){return{process:"",module:"",status:"",method:"",model:"",keyword:"",from_date:"",to_date:"",min_duration:"",sort:"started_at:desc"}}function pl(e,t=e){return`<option value="${r(e)}">${r(t)}</option>`}function Ds(e,t,s,a,n=""){return`<div class="field">
    <label class="field-label" for="performance-${e}">
      <span>${r(t)}</span>
      <span class="field-tag">${r(e)}</span>
    </label>
    <select class="select" id="performance-${e}" name="${r(e)}">
      ${pl("","\u5168\u90E8")}
      ${s.map(i=>`<option value="${r(i)}" ${String(i)===String(a)?"selected":""}>${r(i)}</option>`).join("")}
    </select>
    ${n?`<span class="field-help">${r(n)}</span>`:""}
  </div>`}function ml(e,t){let s=ul.map(a=>`<option value="${a.value}" ${a.value===t.sort?"selected":""}>${a.label}</option>`).join("");return`
    ${Ds("process","\u7A0B\u5E8F",e.processes||[],t.process)}
    ${Ds("module","\u6A21\u7D44",e.modules||[],t.module)}
    ${Ds("model","\u6A21\u578B",e.models||[],t.model)}
    ${Ds("status","\u72C0\u614B",e.statuses||[],t.status)}
    ${Ds("method","\u65B9\u6CD5",e.methods||[],t.method)}
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
    </div>`}function Or(){let e=document.getElementById("performance-filter-form");if(!e)return pn();let t=new FormData(e);return{process:String(t.get("process")||""),module:String(t.get("module")||""),status:String(t.get("status")||""),method:String(t.get("method")||""),model:String(t.get("model")||""),keyword:String(t.get("keyword")||"").trim(),from_date:String(t.get("from_date")||""),to_date:String(t.get("to_date")||""),min_duration:String(t.get("min_duration")||""),sort:String(t.get("sort")||"started_at:desc")}}function Dr(e){if(e==null)return"null";if(typeof e=="object")try{let t=JSON.stringify(e);return t.length>160?`${t.slice(0,157)}\u2026`:t}catch{return String(e)}return String(e)}function Fr(e){if(!e)return"";let t=new Date(e);if(Number.isNaN(t.getTime()))return"";let s=String(t.getHours()).padStart(2,"0"),a=String(t.getMinutes()).padStart(2,"0"),n=String(t.getSeconds()).padStart(2,"0"),i=String(t.getMilliseconds()).padStart(3,"0");return`${s}:${a}:${n}.${i}`}function gl(e,t){if(!e)return"";let s=new Date(e);return Number.isNaN(s.getTime())?"":new Date(s.getTime()+Math.max(0,Number(t)||0)).toISOString()}var fl=[{key:"parsing",label:"Parsing",hint:"\u8F38\u5165\u9577\u5EA6\u3001\u89E3\u6790\u6642\u9593",names:["rag.parse_question"],color:"#64748b"},{key:"embedding",label:"Embedding",hint:"Model\u3001Token\u3001Batch\u3001\u8017\u6642",names:["rag.embed_query"],color:"#3984c6"},{key:"qdrant",label:"Qdrant Search",hint:"Collection\u3001Filter\u3001Top K\u3001\u8017\u6642",names:["rag.qdrant_search"],color:"#d97706"},{key:"reranker",label:"Reranker",hint:"Model\u3001\u5019\u9078\u7B46\u6578\u3001\u8017\u6642",names:["rag.rerank"],color:"#8b5cf6"},{key:"context",label:"Context",hint:"Chunk \u6578\u3001Token \u6578\u3001\u8017\u6642",names:["rag.context"],fallbackNames:["rag.fetch_documents","rag.build_citations"],color:"#64748b"},{key:"llm",label:"LLM",hint:"Model\u3001Input/Output Token\u3001TTFT\u3001\u8017\u6642",names:["rag.llm_request"],color:"#16a34a"}],va={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"};function Ur(e){let t=e?.metadata?.rag_response||{},s=String(t.status||e?.metadata?.rag_status||e?.status||"");return s==="operational"||s==="success"?{label:"Completed",tone:"ok"}:s==="retrieval_only"?{label:"Abstain",tone:"warn"}:s==="preview"?{label:"Preview",tone:"info"}:s==="failed"||s==="error"?{label:"Failed",tone:"danger"}:{label:s||"Unknown",tone:"idle"}}function mn(e){let t=Math.max(0,Number(e?.offset_ms)||0),s=Math.max(0,Number(e?.duration_ms)||0),a=Math.max(t,Number(e?.end_offset_ms)||t+s);return{...e,offset:t,end:a,duration:Math.max(s,a-t)}}function Qr(e,t=0){let s=Array.isArray(e?.segments)?[...e.segments].sort((b,$)=>Number(b.offset_ms||0)-Number($.offset_ms||0)):[],a=Math.max(Number(e?.total_ms)||0,Number(t)||0,...s.map(b=>mn(b).end),1),n=fl.map(b=>{let $=s.filter(_=>b.names.includes(_.name));!$.length&&b.fallbackNames&&($=s.filter(_=>b.fallbackNames.includes(_.name)));let v=$.map(mn),f=v.length?Math.min(...v.map(_=>_.offset)):null,h=v.length?Math.max(...v.map(_=>_.end)):null;return{...b,spans:v,start:f,end:h,duration:f===null?null:h-f}});for(let b of n){if(b.key!=="embedding"&&b.key!=="llm")continue;let $=[];for(let h of b.spans){let _=h.metadata||{},S=Number(_.load_duration_ms),R=Number.isFinite(S)&&S>0?S:0,O=Math.max(0,Number(h.duration)||0);$.push({...h,offset:h.offset,end:h.offset+R,duration:R,metadata:{..._,source_stage:b.label,model_load_ms:R,request_duration_ms:O,warm_duration_ms:Math.max(0,O-R),cold_start:R>=100},params:{...h.params||{},source_stage:b.label}})}if(!$.length)continue;let v=$.reduce((h,_)=>h+_.duration,0),f=b.spans.reduce((h,_)=>h+Math.max(0,Number(_.duration)||0),0);b.loadInfo={spans:$,total:v,requestTotal:f,ratio:f>0?Math.min(1,Math.max(0,v/f)):0}}let i=[...n],o=Math.max(0,...i.flatMap(b=>b.spans.map($=>$.end))),l=e?.metadata?.rag_response||{},u=Ur(e),c=Math.min(a,o);return i.push({key:"response",label:"Response",hint:"\u7E3D\u8017\u6642\u3001\u5F15\u7528\u6578\u3001\u6210\u529F\u6216 Abstain",color:"#0f766e",spans:[{offset:c,end:a,duration:Math.max(0,a-c),status:u.tone==="danger"?"error":"ok",metadata:l,params:{},started_at:e?.started_at,finished_at:e?.finished_at}],start:c,end:a,duration:Math.max(0,a-c),responseMetadata:l}),bl(i,a),{total:a,stages:i,response:l,traceStatus:u,requestId:e?.request_id||"",startedAt:e?.started_at,finishedAt:e?.finished_at,client:e?.client||{},models:Array.isArray(e?.summary?.models)?e.summary.models:[],hasLoad:i.some(b=>!!b.loadInfo)}}function bl(e,t){let s=e.reduce((i,o)=>i+Math.max(0,Number(o.duration)||0),0),a=s>0?t/s:1,n=0;for(let i of e){let o=Math.max(0,Number(i.duration)||0)*a;i.displayStart=n,i.displayDuration=o,i.displayEnd=n+o;let l=i.spans[0]||null,u=[],c=!1;if(l){let $=Math.max(0,Number(l.duration)||0),v=i.loadInfo?Math.max(0,Number(i.loadInfo.total)||0):0;if(i.loadInfo&&v>0&&i.spans.length===1&&$>0){let f=Math.min(l.end,l.offset+v),h=Math.max(0,f-l.offset),_=Math.max(0,l.end-f);if(h>0&&_>0){let S=gl(l.started_at,h),R={...l,offset:l.offset,end:f,duration:h,finished_at:S,metadata:{...l.metadata||{},source_stage:i.label,model_load_ms:h,request_duration_ms:$,warm_duration_ms:Math.max(0,$-h),cold_start:h>=100},params:{...l.params||{},source_stage:i.label}},O={...l,offset:f,end:l.end,duration:_,started_at:S,finished_at:l.finished_at};u.push({kind:"load",label:"Model Load",span:R,duration:h}),u.push({kind:"stage",label:`${i.label} \u63A8\u8AD6`,span:O,duration:_}),c=!0}}c||u.push({kind:"stage",label:i.label,span:l,duration:$})}i.detailSegments=u;let b=[];if(l&&o>0)if(c){let[$,v]=u,f=$.duration+v.duration,h=f>0?o*($.duration/f):0,_={...i,key:"model_load",label:`Model Load \xB7 ${i.label}`,spans:[$.span],duration:$.duration},S={...i,label:`${i.label} \u63A8\u8AD6`,spans:[v.span],duration:v.duration};b.push({offset:n,duration:h,color:"#0ea5e9",kind:"load",tip:ba(_,$.span)}),b.push({offset:n+h,duration:Math.max(0,o-h),color:i.color,kind:"stage",tip:ba(S,v.span,{includeLoad:!1})})}else b.push({offset:n,duration:o,color:i.color,kind:"stage",tip:ba(i,l)});i.displaySegments=b,n+=o}}function gn(e,{includeLoad:t=!0}={}){let s=[],a=(b,$)=>{$==null||$===""||s.push([b,String($)])},n=e.spans[0]||null;if(!n)return a("\u72C0\u614B","\u6B64\u7D00\u9304\u6C92\u6709\u9019\u500B span"),s;let i=n.params||{},o=n.metadata||{},l=Gr(n),u=fn(n),c=(b,$)=>{let v=Number(b?.load_duration_ms);if(!Number.isFinite(v))return;let f=Math.max(0,v);a("Model Load",be(f)),a("\u51B7\u555F\u52D5",f>=100?"\u662F":"\u5426\uFF08\u71B1\u555F\u52D5\uFF09");let h=Math.max(0,Number($)||0);if(h>0){let _=Math.max(0,h-f);a("\u6263\u9664\u8F09\u5165\u5F8C",be(_)),a("\u8F09\u5165\u5360\u6BD4",`${(f/h*100).toFixed(f/h>=.1?0:1)}%`)}};if(e.key==="response")return a("Trace \u72C0\u614B",e.responseMetadata.status||"\u2014"),a("Answer source",e.responseMetadata.answer_source||"\u2014"),a("Abstain",e.responseMetadata.abstain?"\u662F":"\u5426"),a("\u5F15\u7528\u7E3D\u6578",e.responseMetadata.citation_count??"\u2014"),a("\u5224\u6C7A\uFF0F\u6CD5\u898F\u5F15\u7528",`${e.responseMetadata.judgment_citations??"\u2014"} / ${e.responseMetadata.law_citations??"\u2014"}`),a("\u7E3D\u8017\u6642",be(e.duration)),s;if(a("\u958B\u59CB",`${Fr(n.started_at)||"\u2014"} \xB7 +${n.offset.toFixed(1)} ms`),a("\u7D50\u675F",`${Fr(n.finished_at)||"\u2014"} \xB7 +${n.end.toFixed(1)} ms`),a("\u8017\u6642",be(n.duration)),e.key==="parsing")a("\u8F38\u5165\u9577\u5EA6",o.input_length??i.input_length),a("\u6B63\u898F\u5316\u9577\u5EA6",o.normalized_length??i.normalized_length),a("\u79FB\u9664\u7A7A\u767D",o.trimmed_chars);else if(e.key==="embedding")a("Model",u||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.active_base_url||o.base_url),a("Input tokens",o.prompt_eval_count),a("Batch",o.batch),a("\u5411\u91CF\u7DAD\u5EA6",o.dimensions),a("Fallback",o.fallback_used?"\u662F":"\u5426"),t&&c(o,n.duration);else if(e.key==="qdrant")a("Collection",o.collection||i.collection),o.filter&&a("Filter",Dr(o.filter)),a("Top K",o.top_k??i.limit),a("Hits",o.hits),a("Unique judgments",o.unique_judgments),a("Top score",o.top_score);else if(e.key==="reranker")a("Model",u||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.base_url||i.url),a("Rerank \u72C0\u614B",o.status),a("Fallback",o.fallback_used?"\u662F":"\u5426"),a("\u5019\u9078\u7B46\u6578",o.candidates),a("\u9078\u7528\u7B46\u6578",o.selected),a("Top score",o.top_score),Array.isArray(o.errors)&&o.errors.length&&a("\u932F\u8AA4",o.errors.join(" \xB7 "));else if(e.key==="context")a("Chunks",o.chunks),a("\u5224\u6C7A chunks",o.judgment_chunks),a("\u6CD5\u898F chunks",o.law_chunks),a("Token \u4F30\u7B97",o.token_estimate),a("Context \u5B57\u5143",o.context_chars),a("\u6587\u4EF6\u6578",o.documents);else if(e.key==="llm")a("Model",u||o.model||i.model),a("\u4E3B\u6A5F",l),a("Endpoint",o.base_url||i.url),a("Input tokens",o.input_tokens),a("Output tokens",o.output_tokens),a("TTFT",o.ttft_ms===null||o.ttft_ms===void 0?"\u2014":be(o.ttft_ms)),a("API \u7E3D\u8017\u6642",o.total_duration_ms===null||o.total_duration_ms===void 0?"\u2014":be(o.total_duration_ms)),t&&c(o,n.duration),a("Strict retry",o.strict?"\u662F":"\u5426");else if(e.key==="model_load"){if(a("Model",u||o.model||i.model),a("\u4E3B\u6A5F",l),a("\u4F86\u6E90\u968E\u6BB5",o.source_stage),a("\u51B7\u555F\u52D5",o.cold_start?"\u662F":"\u5426\uFF08\u71B1\u555F\u52D5\uFF09"),a("\u6A21\u578B\u547C\u53EB\u7E3D\u8017\u6642",o.request_duration_ms===null||o.request_duration_ms===void 0?"\u2014":be(o.request_duration_ms)),a("\u8F09\u5165\u8017\u6642",o.model_load_ms===null||o.model_load_ms===void 0?"\u2014":be(o.model_load_ms)),a("\u6263\u9664\u8F09\u5165\u5F8C\u6D41\u7A0B\u6642\u9593",o.warm_duration_ms===null||o.warm_duration_ms===void 0?"\u2014":be(o.warm_duration_ms)),Number(o.request_duration_ms)>0&&Number(o.model_load_ms)>=0){let b=Number(o.model_load_ms)/Number(o.request_duration_ms)*100;a("\u8F09\u5165\u5360\u6BD4",`${b.toFixed(b>=10?0:1)}%`)}o.eval_duration_ms!==null&&o.eval_duration_ms!==void 0&&a("\u63A8\u8AD6\u8017\u6642",be(o.eval_duration_ms))}else if(e.key==="segment"||e.key==="test_stage")if(a("Model",u||o.model||i.model),a("\u72C0\u614B",o.status||n.status),e.key==="test_stage")a("\u9032\u5EA6",o.progress===null||o.progress===void 0?"":`${Number(o.progress)||0}%`),n.error&&a("\u932F\u8AA4",n.error);else{n.error&&a("\u932F\u8AA4",n.error);for(let[b,$]of Object.entries(i).slice(0,10))a(b,Dr($))}return e.spans.length>1&&(e.key==="model_load"?a("\u5404\u6A21\u578B\u8F09\u5165",e.spans.map(b=>`${b.metadata?.source_stage||"model"} ${fn(b)} ${be(b.metadata?.model_load_ms||0)}`).join(" \xB7 ")):(a("Span \u6578",e.spans.length),a("Span \u660E\u7D30",e.spans.map((b,$)=>`#${$+1} +${b.offset.toFixed(0)}ms/${be(b.duration)}`).join(" \xB7 ")))),n.module&&a("Module",n.module),n.function&&a("Function",n.function),s}function vl(e){let t=String(e||"").trim();if(!t)return"";try{return new URL(t.includes("://")?t:`http://${t}`).hostname||t}catch{return t}}function Gr(e){let t=e?.metadata||{},s=String(t.provider_name||"").trim();if(s)return s;let a=String(t.active_base_url||t.base_url||e?.params?.url||"").trim();return vl(a)}function hl(e){let t=e?.metadata||{};return String(t.model||e?.params?.model||"").trim()}function fn(e){let t=Gr(e),s=hl(e);return s?t?`${t}:${s}`:s:""}function $l(e){let t=new Set;for(let s of e?.spans||[]){let a=fn(s);a&&t.add(a)}return[...t]}function ba(e,t,s={}){let a=gn({...e,spans:[t]},s);return[String(e.label||""),...a.map(([n,i])=>`${n}: ${i}`)].join(`
`)}function yl(e,t){let s=e.spans||[],a=$l(e),n=Array.isArray(e.displaySegments)?e.displaySegments:null,i=7,o=Math.max(1,Math.min(4,s.length)),l=s.length>1,u=n?12:l?Math.max(12,o*i):12,c=n?n.map(S=>{if(Number(S.duration)<=0)return"";let R=Math.max(0,Math.min(100,S.offset/t*100)),O=Math.min(100-R,S.duration/t*100);return`<span class="rag-wf-bar is-sequential${S.kind==="load"?" is-load":""}" style="left:${R.toFixed(3)}%;width:${O.toFixed(4)}%;top:0;height:12px;--bar-color:${S.color}"
            data-rag-wf-tip="${r(S.tip)}"
            aria-label="${r(S.tip)}" role="img"></span>`}).join(""):s.slice(0,4).map((S,R)=>{if(Number(S.duration)<=0)return"";let O=Math.max(0,Math.min(100,S.offset/t*100)),I=Math.max(.35,Math.min(100-O,S.duration/t*100)),Q=l?R*i:0,oe=l?6:12,te=ba(e,S);return`<span class="rag-wf-bar" style="left:${O.toFixed(3)}%;width:${I.toFixed(3)}%;top:${Q}px;height:${oe}px"
            data-rag-wf-tip="${r(te)}"
            aria-label="${r(te)}" role="img"></span>`}).join(""),b=Array.isArray(e.detailSegments)?e.detailSegments:[],$=b.length>1?b.map(S=>{let R=S.kind==="load"?{...e,key:"model_load",label:`Model Load \xB7 ${e.label}`,spans:[S.span],duration:S.duration}:{...e,label:`${e.label} \u63A8\u8AD6`,spans:[S.span],duration:S.duration},O=gn(R,{includeLoad:S.kind!=="stage"});return`<div class="rag-wf-detail-group">
              <div class="rag-wf-detail-group-head">
                <strong>${r(S.label)}</strong>
                <span>${r(be(S.duration))}</span>
              </div>
              <div class="rag-wf-detail-grid">${O.map(([I,Q])=>`<span class="rag-wf-detail"><span>${r(I)}</span><strong>${r(Q)}</strong></span>`).join("")}</div>
            </div>`}).join(""):"",v=gn(e).map(([S,R])=>`<span class="rag-wf-detail"><span>${r(S)}</span><strong>${r(R)}</strong></span>`).join(""),f=b.length>1?`<div class="rag-wf-details is-split">${$}</div>`:`<div class="rag-wf-details">${v}</div>`,h=s.length?s.some(S=>S.status==="error")?"is-error":"":"is-missing",_=s.length?be(e.duration):"\u672A\u8A18\u9304";return`<details class="rag-wf-stage ${h}" style="--stage-color:${e.color}">
    <summary class="rag-wf-stage-summary">
      <span class="rag-wf-stage-head">
        <span class="rag-wf-stage-label">
          <i aria-hidden="true"></i>
          <span><strong>${r(e.label)}</strong><small>${r(e.hint)}</small>${a.length?`<small class="rag-wf-model-line">${r(a.join(" \xB7 "))}</small>`:""}</span>
        </span>
        <span class="rag-wf-stage-meta">${_} \xB7 ${s.length?`${s.length} span`:"\u2014"} <span class="rag-wf-chevron">${p("chevronRight",12)}</span></span>
      </span>
      <span class="rag-wf-track" style="height:${u}px">${c}</span>
    </summary>
    ${f}
  </details>`}function Jr(e,t,s=!1){let a=e.response||{},n=e.client||{},i=e.models||[];return`<div class="rag-wf-summary">
      <span>\u7E3D\u8017\u6642 <strong>${r(be(e.total))}</strong></span>
      <span>Server <strong>${r(be(t))}</strong></span>
      ${n.total_ms?`<span>Client <strong>${r(be(n.total_ms))}</strong></span>`:""}
      ${n.render_ms!==void 0?`<span>Render <strong>${r(be(n.render_ms))}</strong></span>`:""}
      <span>\u5F15\u7528 <strong>${r(String(a.citation_count??"\u2014"))}</strong></span>
      <span>Abstain <strong>${a.abstain?"\u662F":"\u5426"}</strong></span>
      ${i.length?`<span>Model <strong>${r(i.join(" \xB7 "))}</strong></span>`:""}
      ${s?'<span class="rag-wf-updating">\u66F4\u65B0\u4E2D\u2026</span>':""}
    </div>`}function $s(e,t,s="\u9EDE\u9078\u4EFB\u4E00\u968E\u6BB5\uFF0C\u67E5\u770B\u53C3\u6578\u3001Token\u3001TTFT\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u4F86\u6E90\u6578\u91CF\u3002Waterfall \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u5E73\u884C\u57F7\u884C\u7684 span \u6703\u4F9D\u5BE6\u969B\u6642\u9593\u91CD\u758A\u986F\u793A\u3002",{legend:a=""}={}){return`<div class="rag-wf-axis"><span>0 ms</span><span>${r(be(t))}</span></div>
    ${a}
    <div class="rag-wf-stages">${(e||[]).map(n=>yl(n,t)).join("")}</div>
    <p class="rag-wf-hint">${r(s)}</p>`}function Vr(e){let t=(e.stages||[]).some(n=>n.loadInfo),s=t?'<div class="rag-wf-legend"><span><i class="is-load"></i>Model Load\uFF08\u968E\u6BB5 bar \u524D\u6BB5\uFF09</span></div>':"",a=t?"\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7D50\u675F\u5F8C\u63A5\u7E8C\u4E0B\u4E00\u968E\u6BB5\uFF1BEmbedding\uFF0FLLM \u7684\u85CD\u8272\u524D\u6BB5\u70BA Model Load\uFF0C\u5F8C\u6BB5\u70BA\u63A8\u8AD6\u3002\u5BE6\u969B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u3001Token \u8207\u8F09\u5165\u5360\u6BD4\u53EF\u5C55\u958B\u67E5\u770B\u3002":"\u968E\u6BB5\u4F9D\u57F7\u884C\u9806\u5E8F\u7531\u5DE6\u81F3\u53F3\u6392\u5217\uFF0C\u4E0A\u4E00\u968E\u6BB5\u7D50\u675F\u5F8C\u63A5\u7E8C\u4E0B\u4E00\u968E\u6BB5\u3002\u5BE6\u969B\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207 Token \u53EF\u5C55\u958B\u67E5\u770B\u3002";return $s(e.stages,e.total,a,{legend:s})}function ha(e,{serverDurationMs:t=0,loading:s=!1,embedded:a=!1}={}){if(!e||typeof e!="object")return"";let n=Qr(e,t),i=n.traceStatus;return`<section class="report-card rag-wf-card${a?" rag-wf-embedded":""}">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${va[i.tone]||va.idle}">${r(i.label)}</span>
        </div>
        <div class="report-sub">Trace ID:
          <span class="mono">${r(n.requestId||"\u2014")}</span>
          \xB7 ${r(Me(n.startedAt))}
        </div>
      </div>
      <div class="rag-wf-actions">
        <a class="btn btn-secondary btn-sm" href="#/performance">
          ${p("activity",14)}<span>\u5B8C\u6574 Flow</span>
        </a>
      </div>
    </div>
    ${Jr(n,t,s)}
    ${Vr(n)}
  </section>`}var ct=null;function wl(){return ct||(ct=document.createElement("div"),ct.className="rag-wf-tooltip",ct.hidden=!0,document.body.appendChild(ct),ct)}function bn(){ct&&(ct.hidden=!0)}function Wr(e){if(!ct||ct.hidden)return;let t=14,s=10,a=ct.getBoundingClientRect(),n=e.clientX+t,i=e.clientY+t;n+a.width>window.innerWidth-s&&(n=e.clientX-a.width-t),i+a.height>window.innerHeight-s&&(i=e.clientY-a.height-t),ct.style.left=`${Math.max(s,n)}px`,ct.style.top=`${Math.max(s,i)}px`}document.addEventListener("pointerover",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=wl(),a=t.dataset.ragWfTip||"";a&&(s.textContent=a,s.hidden=!1,Wr(e))});document.addEventListener("pointermove",e=>{if(!(!ct||ct.hidden)){if(!e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]")){bn();return}Wr(e)}});document.addEventListener("pointerout",e=>{let t=e.target.closest?.(".rag-wf-bar[data-rag-wf-tip]");if(!t)return;let s=e.relatedTarget;s instanceof Node&&t.contains(s)||bn()});window.addEventListener("scroll",bn,{capture:!0,passive:!0});function _l(e,t,s,a){if(a&&!e.length)return`<div class="report-card rag-wf-card">
      ${Re({tone:"danger",title:"RAG Pipeline \u8B80\u53D6\u5931\u6557",text:r(a.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-rag-waterfall">${p("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;if(!e.length)return`<div class="report-card rag-wf-card">
      ${ot({iconName:"activity",title:s?"\u8B80\u53D6 RAG Pipeline\u2026":"\u5C1A\u7121 RAG Pipeline \u7D00\u9304",text:s?"\u6B63\u5728\u6574\u7406\u6700\u8FD1\u7684 RAG \u554F\u7B54 Trace\u3002":"\u7522\u751F\u65B0\u7684 RAG \u554F\u7B54\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A Parsing\u3001Embedding\u3001Qdrant\u3001Context\u3001LLM \u8207 Response \u7684 waterfall\u3002"})}
    </div>`;let n=e.find(c=>String(c.id)===String(t))||e[0],i=n.flow&&typeof n.flow=="object"?n.flow:{},o=Qr(i,n.duration_ms),l=o.traceStatus,u=e.map(c=>{let b=Ur(c.flow||{});return`<option value="${r(String(c.id))}" ${String(c.id)===String(n.id)?"selected":""}>#${r(String(c.id))} \xB7 ${r(Me(c.started_at))} \xB7 ${r(be(c.duration_ms))} \xB7 ${r(b.label)}</option>`}).join("");return`<section class="report-card rag-wf-card">
    <div class="rag-wf-head">
      <div class="report-title-group">
        <div class="report-kicker">RAG PIPELINE WATERFALL</div>
        <div class="report-title">Single Query Trace
          <span class="badge ${va[l.tone]||va.idle}">${r(l.label)}</span>
        </div>
        <div class="report-sub">Trace ID:
          <span class="mono">${r(o.requestId||n.request_id||"\u2014")}</span>
          \xB7 ${r(Me(n.started_at))}
        </div>
      </div>
      <div class="rag-wf-actions">
        <label class="rag-wf-select">Trace
          <select class="select" data-rag-trace-select aria-label="\u9078\u64C7 RAG Trace">${u}</select>
        </label>
        <button class="btn btn-secondary btn-sm" type="button" data-action="refresh-rag-waterfall">
          ${p("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
    ${Jr(o,n.duration_ms,s)}
    ${Vr(o)}
  </section>`}function kl(e){let t=Array.isArray(e?.segments)?e.segments:[],s=Array.isArray(e?.models)?e.models:[],a=e?.client||{},n=Math.max(...t.map(l=>Number(l.avg_ms)||0),1),i=a.samples?be(a.avg_total_ms??0):"\u2014",o=a.samples?be(a.avg_render_ms??0):"\u2014";return`<div class="perf-flow-stats">
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
                    <span class="perf-model-count">${d(l.value)} \u6B21${l.avg_ms?` \xB7 \u5E73\u5747 ${be(l.avg_ms)}`:""}</span>
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
                    <span class="perf-seg-ms">${be(l.avg_ms)}</span>
                  </div>`).join("")}</div>`:'<p class="muted" style="font-size:11px">\u5C1A\u7121\u5340\u6BB5\u8017\u6642\uFF1B\u9700\u6709\u542B flow \u7684\u65B0\u7D00\u9304\u3002</p>'}
      </div>
    </div>
  </div>`}function yt(e){let t=Math.max(0,Number(e)||0);if(!t)return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;let s=Math.round(t/1e3),a=Math.floor(s/3600),n=Math.floor(s%3600/60),i=s%60;return a?`${a}h ${String(n).padStart(2,"0")}m ${String(i).padStart(2,"0")}s`:n?`${n}m ${String(i).padStart(2,"0")}s`:`${(t/1e3).toFixed(1)}s`}function Kr(e){let t=String(e?.task||"").trim();return t?t==="auto"?"\u81EA\u52D5\u63A5\u7E8C":`task ${t}`:"\u7D22\u5F15"}function Sl(e){let t=(e||[]).slice(-12);if(!t.length)return'<p class="muted" style="font-size:11px">\u5C1A\u7121\u7D22\u5F15\u7D00\u9304\u3002</p>';let s=Math.max(...t.map(a=>Number(a.points_per_second)||0),.1);return`<div class="index-run-bars">${t.map(a=>{let n=Number(a.points_per_second)||0,i=Math.max(2,n/s*100);return`<div class="index-run-row">
        <div class="index-run-label">
          <strong>${r(Kr(a))}</strong>
          <span>${r(Me(a.started_at))}</span>
        </div>
        <div class="index-run-track" title="${r(`${d(a.indexed_count)} \u7B46 \xB7 ${yt(a.duration_ms)} \xB7 ${d(a.batch_count)} \u6279`)}">
          <span style="width:${i.toFixed(1)}%"></span>
        </div>
        <div class="index-run-value">
          <strong>${n.toFixed(1)}</strong><span>\u7B46/\u79D2</span>
          <em>${d(a.indexed_count)} \u7B46 \xB7 ${yt(a.duration_ms)}</em>
        </div>
      </div>`}).join("")}</div>`}function xl(e){let t=(Array.isArray(e.time_breakdown)?e.time_breakdown:[]).map(s=>({...s,ms:Number(s.ms)||0,percent:Number(s.percent)||0})).filter(s=>s.ms>0);return t.length?`<div class="index-breakdown-bar">${t.map(s=>`<span class="index-seg index-seg-${r(s.key)}" style="width:${Math.max(.5,s.percent).toFixed(2)}%" title="${r(`${s.label} ${yt(s.ms)}\uFF08${s.percent.toFixed(1)}%\uFF09`)}"></span>`).join("")}</div>
    <div class="index-breakdown-legend">${t.map(s=>`<span class="index-legend-item">
            <i class="index-seg index-seg-${r(s.key)}"></i>
            <span>${r(s.label)}</span>
            <strong>${yt(s.ms)}</strong>
            <em>${s.percent.toFixed(1)}%</em>
          </span>`).join("")}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B\u968E\u6BB5\u8A08\u6642\uFF1B\u5F8C\u7E8C\u7D22\u5F15\u6703\u8A18\u9304 Ollama Embedding\u3001Qdrant Upsert \u8207 PostgreSQL \u7D22\u5F15\u7D00\u9304\u7684\u6642\u9593\u7D44\u6210\u3002</div>'}function ql(e,t){let s=(Array.isArray(e)?e:[]).map(R=>({elapsed:Math.max(0,Number(R.elapsed_s)||0),indexed:Math.max(0,Number(R.indexed)||0)})).filter(R=>R.indexed>0);if(s.length<2)return"";let a=Math.max(...s.map(R=>R.elapsed),(Number(t)||0)/1e3,1),n=Math.max(...s.map(R=>R.indexed),1),i=760,o=150,l=12,u=12,c=i-l*2,b=o-u*2,$=s.map(R=>[l+R.elapsed/a*c,o-u-R.indexed/n*b]),v=$.map(([R,O],I)=>`${I===0?"M":"L"}${R.toFixed(1)},${O.toFixed(1)}`).join(" "),f=`${v} L${$[$.length-1][0].toFixed(1)},${o-u} L${$[0][0].toFixed(1)},${o-u} Z`,h=Math.max(1,Math.ceil($.length/14)),_=$.map(([R,O],I)=>I%h===0||I===$.length-1?`<circle cx="${R.toFixed(1)}" cy="${O.toFixed(1)}" r="2.6" />`:"").join(""),S=[0,1,2,3].map(R=>{let O=u+b/3*R;return`<line x1="${l}" y1="${O.toFixed(1)}" x2="${i-l}" y2="${O.toFixed(1)}" class="index-chart-grid" />`}).join("");return`<div class="index-chart-card index-progress-card">
    <div class="index-chart-head">
      <span>\u672C\u6B21\u7D22\u5F15\u9032\u5EA6</span>
      <span>${d(n)} \u7B46 \xB7 ${yt(a*1e3)}</span>
    </div>
    <svg class="index-progress-svg" viewBox="0 0 ${i} ${o}" role="img" aria-label="\u7D22\u5F15\u9032\u5EA6\u6298\u7DDA\u5716">
      ${S}
      <path d="${f}" class="index-progress-area"></path>
      <path d="${v}" class="index-progress-line"></path>
      ${_}
      <line x1="${l}" y1="${o-u}" x2="${i-l}" y2="${o-u}" class="index-chart-axis"></line>
      <line x1="${l}" y1="${u}" x2="${l}" y2="${o-u}" class="index-chart-axis"></line>
    </svg>
    <div class="index-progress-labels">
      <span>0</span>
      <span>${yt(a*500)}</span>
      <span>${yt(a*1e3)}</span>
    </div>
  </div>`}function Al(e){if(!e||!e.latest)return"";let t=e.latest,s=Array.isArray(e.runs)?e.runs:[],a=e.average||{},n=t.coverage||{},i=n.total_judgments>0?`${d(n.indexed_judgments)} / ${d(n.total_judgments)}\uFF08${(100*n.indexed_judgments/n.total_judgments).toFixed(1)}%\uFF09`:"\u2014",o=[{label:"\u7576\u6B21\u57F7\u884C\u7B46\u6578",value:d(t.indexed_count),note:`${d(t.batch_count)} \u6279 \xD7 ${d(t.batch_size)} \u7B46`},{label:"\u5E73\u5747\u6BCF\u79D2\u7B46\u6578",value:`${(Number(t.points_per_second)||0).toFixed(1)}`,note:"\u7B46/\u79D2"},{label:"\u7576\u6B21\u4F7F\u7528\u6642\u9593",value:yt(t.duration_ms),note:`${d(t.scanned_count)} \u7B46\u5DF2\u6383\u63CF`},{label:"\u5E73\u5747\u6BCF\u6279\u6642\u9593",value:yt(t.batch_avg_ms),note:t.batch_min_ms||t.batch_max_ms?`\u6700\u5FEB ${yt(t.batch_min_ms)} \xB7 \u6700\u6162 ${yt(t.batch_max_ms)}`:"\u4EE5\u7E3D\u8017\u6642 \xF7 \u6279\u6578\u8A08\u7B97"}];return`<section class="index-perf-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u7D22\u5F15\u6548\u80FD</div>
        <div class="index-perf-sub">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 \xB7 \u6700\u8FD1 ${d(e.run_count)} \u6B21\u57F7\u884C</div>
      </div>
      <span class="chip">${r(Kr(t))}</span>
    </div>
    <div class="index-perf-summary">
      ${o.map(l=>`<div class="index-perf-stat">
            <div class="summary-label">${r(l.label)}</div>
            <div class="index-perf-value">${r(l.value)}</div>
            <div class="index-perf-note">${r(l.note)}</div>
          </div>`).join("")}
    </div>
    <div class="index-perf-meta">
      <span><strong>\u6700\u8FD1\u4E00\u6B21</strong> ${r(Me(t.started_at))}</span>
      <span><strong>batch</strong> ${d(t.batch_size)} \u7B46\uFF0F\u6279</span>
      <span><strong>embedding \u4E0A\u9650</strong> ${t.max_chars?`${d(t.max_chars)} \u5B57`:"\u2014"}</span>
      <span><strong>collection</strong> ${d(t.collection_points)} points</span>
      <span><strong>\u8986\u84CB\u7387</strong> ${r(i)}</span>
      <span><strong>\u5E73\u5747\u6BCF\u6B21\u57F7\u884C</strong> ${yt(a.duration_ms)} \xB7 ${(Number(a.points_per_second)||0).toFixed(1)} \u7B46/\u79D2</span>
    </div>
    <div class="index-charts">
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u8FD1\u7D22\u5F15\u541E\u5410</span>
          <span>\u7B46/\u79D2</span>
        </div>
        ${Sl(s)}
      </div>
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u65B0\u4E00\u6B21\u6642\u9593\u7D44\u6210</span>
          <span>${yt(t.duration_ms)}</span>
        </div>
        ${xl(t)}
      </div>
    </div>
    ${ql(t.progress,t.duration_ms)}
  </section>`}function Ll(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,n=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${n} \u9801 \xB7
      \u986F\u793A ${d(i)}\u2013${d(o)} / ${d(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Hr.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${p("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=n?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${p("chevronRight",13)}</button>
    </div>
  </div>`}function Ml(e){let t=String(e?.module||"");return t.includes("static")||t.includes("frontend")?"#65a30d":t.includes("judgment.rag")?"#8b5cf6":t.includes("judgment.web.app")?"#3b82f6":t.includes("judgment.web.query")?"#d97706":t.includes("judgment.judgment_index")?"#0d9488":"#64748b"}function jl(e){let t=mn(e),s=Math.max(0,Math.min(8,Number(e.depth)||0));return{key:"segment",label:`${"\u203A ".repeat(s)}${e.name||"unnamed"}`,hint:[e.module||"\u2014",e.function||"\u2014"].join(" \xB7 "),color:Ml(e),spans:[{...t,status:e.status||"ok",error:e.error,metadata:e.metadata||{},params:e.params||{},started_at:e.started_at,finished_at:e.finished_at}],start:t.offset,end:t.end,duration:t.duration}}function $a(e){return(e||[]).map(jl)}function Tl(e,t){let s=e.flow&&typeof e.flow=="object"?e.flow:null,a=Array.isArray(s?.segments)?[...s.segments].sort((v,f)=>Number(v.seq)-Number(f.seq)):[],n=s?.summary||{},i=Array.isArray(n.models)?n.models:[],o=s?.client||{},l=s?.metadata||{},u=l.question||"",c=l.answer||"",b=u||c?`<div class="perf-flow-qa">
          ${u?`<div class="perf-flow-qa-row"><strong>RAG \u554F\u984C</strong><span>${r(u)}</span></div>`:""}
          ${c?`<div class="perf-flow-qa-row"><strong>RAG \u7B54\u6848</strong><span>${r(c)}</span></div>`:""}
        </div>`:"",$=Math.max(Number(s?.total_ms)||0,Number(e.duration_ms)||0,...a.map(v=>(Number(v.offset_ms)||0)+(Number(v.duration_ms)||0)),1);return`<details class="perf-record" ${t===0?"open":""}>
    <summary class="perf-record-summary">
      <span class="perf-record-id">#${r(String(e.id))}</span>
      <span class="perf-record-main">
        <span class="perf-record-title">${r(e.process||"\u672A\u547D\u540D")}</span>
        <span class="perf-record-path mono">${r(e.method||"")} ${r(e.path||"")}</span>
      </span>
      <span class="perf-record-time">${Me(e.started_at)}</span>
      <span class="perf-record-duration">${be(e.duration_ms)}</span>
      ${He(e.status)}
      <span class="perf-record-chevron">${p("chevronRight",14)}</span>
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
      ${b}
      ${i.length?`<div class="chips perf-record-models">${i.map(v=>`<span class="chip">${r(v)}</span>`).join("")}</div>`:""}
      ${a.length?$s($a(a),$,"\u6B64 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B segment \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u53C3\u6578\u3001module\uFF0Ffunction\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u932F\u8AA4\u3002"):`<div class="perf-no-flow">\u6B64\u7D00\u9304\u6C92\u6709 flow \u660E\u7D30\uFF08\u53EF\u80FD\u662F\u820A\u8CC7\u6599\u6216 CLI \u7D00\u9304\uFF09\u3002${e.params_text&&e.params_text!=="{}"?`<pre>${r(e.params_text)}</pre>`:""}</div>`}
      ${s?`<details class="flow-json">
              <summary>Flow JSON \xB7 ${a.length} \u6BB5</summary>
              <pre>${r(JSON.stringify(s,null,2))}</pre>
            </details>`:""}
    </div>
  </details>`}var zr={embedding:"Embedding",retrieval:"Qdrant \u6AA2\u7D22",context:"PostgreSQL \u53D6\u6587",llm:"LLM \u751F\u6210",validation:"\u5F15\u7528\u9A57\u8B49"};function Nl(e){return{pending:"\u7B49\u5F85",running:"\u57F7\u884C\u4E2D",success:"\u5B8C\u6210",partial:"\u90E8\u5206\u6210\u529F",failed:"\u5931\u6557",skipped:"\u7565\u904E"}[e]||e||"\u672A\u77E5"}var El={embedding:"#3984c6",retrieval:"#d97706",context:"#64748b",llm:"#16a34a",validation:"#8b5cf6"};function Cl(e,t){let s=Date.parse(e.started_at||""),a=Date.now(),n=Array.isArray(e.stage_order)?[...e.stage_order]:Object.keys(zr);for(let c of t)c.stage&&!n.includes(c.stage)&&n.push(c.stage);let i=[],o=0;for(let c of n){let b=t.filter(f=>f.stage===c);if(!b.length)continue;let $=b.map(f=>{let h=Date.parse(f.started_at||""),_=Number.isFinite(s)&&Number.isFinite(h)?Math.max(0,h-s):0,S=Math.max(0,Number(f.duration_ms)||0);f.status==="running"&&Number.isFinite(h)&&(S=Math.max(S,a-h));let R=_+S;return o=Math.max(o,R),{offset:_,end:R,duration:S,status:f.status==="failed"?"error":f.status==="running"?"running":"ok",started_at:f.started_at,finished_at:f.finished_at,error:f.error_message,metadata:{...f.details||{},model:f.model,status:f.status,progress:Number(f.progress)||0,module:f.module,function:f.function},params:{model:f.model}}}),v=$.reduce((f,h)=>f+h.duration,0);i.push({key:"test_stage",label:zr[c]||c,hint:`${$.length} \u500B\u7A0B\u5E8F`,color:El[c]||"#64748b",spans:$,start:$.length?Math.min(...$.map(f=>f.offset)):null,end:$.length?Math.max(...$.map(f=>f.end)):null,duration:v})}let l=e.status==="running"&&Number.isFinite(s)?Math.max(0,a-s):0,u=Math.max(Number(e.total_ms)||0,l,o,1);return{stages:i,total:u}}function ys(e,t,s,a={}){let n=a.showHistory!==!1,i=[`<option value="" ${s?"":"selected"}>\u76EE\u524D\uFF0F\u6700\u65B0\u6E2C\u8A66</option>`,...(t||[]).map(_=>`<option value="${r(_.run_id)}" ${_.run_id===s?"selected":""}>${r(Nl(_.status))} \xB7 ${r((_.question||"\u672A\u547D\u540D").slice(0,28))} \xB7 ${r(Me(_.started_at))}</option>`)].join(""),o=n?`<label class="test-flow-select-label">\u6B77\u53F2
        <select class="select" id="test-run-select">${i}</select>
      </label>
      <button class="btn btn-secondary btn-sm" type="button" id="test-flow-refresh">
        ${p("refresh",13)}<span>\u66F4\u65B0</span>
      </button>`:`<a class="btn btn-secondary btn-sm" href="#/performance">
        ${p("activity",13)}<span>\u6B77\u53F2 Flow</span>
      </a>`,l=`<div class="test-flow-head">
    <div class="test-flow-heading">
      <div class="eyebrow">PERFORMANCE TEST FLOW</div>
      <div class="test-flow-title">\u6E2C\u8A66\u6D41\u7A0B ${e?He(e.status):""}</div>
      <div class="test-flow-question">${e?r(e.question||"\u672A\u547D\u540D\u6E2C\u8A66"):"\u5C1A\u7121\u6E2C\u8A66\u6D41\u7A0B\u3002\u8ACB\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u4E26\u5728 RAG \u9801\u63D0\u554F\u3002"}</div>
    </div>
    <div class="test-flow-actions">${o}</div>
  </div>`;if(!e)return`<div class="test-flow-panel card">${l}
      ${ot({iconName:"activity",title:"\u7B49\u5F85\u6E2C\u8A66\u6D41\u7A0B",text:"\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C\u6240\u6709\u53EF\u7528\u6A21\u578B\uFF0C\u4E26\u5728\u9019\u88E1\u5373\u6642\u986F\u793A\u6BCF\u500B\u968E\u6BB5\u7684\u9032\u5EA6\u3002"})}
    </div>`;let u=Array.isArray(e.steps)?e.steps:[],c=Cl(e,u),b=e.models||{},$=e.status==="running"?`${be(c.total)}\uFF08\u4F30\u7B97\uFF09`:be(e.total_ms),v=u.find(_=>_.stage==="llm"&&_.model===e.summary?.primary_model)||u.find(_=>_.stage==="llm"&&_.details?.answer_preview),f=e.answer||v?.details?.answer_preview||"",h=`<div class="test-flow-answer">
    <div class="test-flow-answer-head">
      <span>RAG \u5F15\u64CE\u7B54\u6848</span>
      ${e.summary?.primary_model?`<span class="mono">${r(e.summary.primary_model)}</span>`:""}
    </div>
    <p>${f?r(f):e.status==="running"?"\u6E2C\u8A66\u9032\u884C\u4E2D\uFF0C\u5C1A\u672A\u7522\u751F\u6700\u7D42\u7B54\u6848\u3002":"\u6B64\u6E2C\u8A66\u6C92\u6709\u4FDD\u5B58\u53EF\u986F\u793A\u7684\u7B54\u6848\u3002"}</p>
  </div>`;return`<div class="test-flow-panel card">
    ${l}
    <div class="test-flow-meta">
      <span><strong>Run</strong> <span class="mono">${r(e.run_id)}</span></span>
      <span><strong>\u958B\u59CB</strong> ${r(Me(e.started_at))}</span>
      <span><strong>\u7E3D\u8017\u6642</strong> ${$}</span>
      <span><strong>Embedding</strong> ${Array.isArray(b.embedding)?b.embedding.length:0} \u500B</span>
      <span><strong>LLM</strong> ${Array.isArray(b.llm)?b.llm.length:0} \u500B</span>
      <span><strong>\u968E\u6BB5</strong> ${r(e.stage_label||e.stage||"\u2014")}</span>
    </div>
    ${h}
    ${c.stages.length?$s(c.stages,c.total,"\u6E2C\u8A66 Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B\u7A0B\u5E8F\u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u6A21\u578B\u3001\u72C0\u614B\u3001\u9032\u5EA6\u3001module\uFF0Ffunction \u8207\u932F\u8AA4\u3002"):'<p class="muted">\u6B64\u6E2C\u8A66\u6C92\u6709\u5340\u6BB5\u8CC7\u6599\u3002</p>'}
    <div class="test-flow-foot">
      <span>${e.status==="running"?"\u6E2C\u8A66\u57F7\u884C\u4E2D\uFF1B\u6B64\u5716\u8868\u6703\u81EA\u52D5\u66F4\u65B0\u3002":n?"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u5F9E\u4E0A\u65B9\u300C\u6B77\u53F2\u300D\u9078\u55AE\u9084\u539F\u5176\u4ED6 Flow\u3002":"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u81F3\u6548\u80FD\u5831\u8868\u67E5\u770B\u6B77\u53F2 Flow\u3002"}</span>
      ${e.summary?.primary_model?`<span class="mono">primary=${r(e.summary.primary_model)}</span>`:""}
    </div>
  </div>`}function Rl(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.summary)?e.summary:[],a=e.flow_stats||e.meta?.flow_stats||{},n=e.index_stats||null;return`<div class="report-card performance-flow-report" data-database="performance">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">PERFORMANCE FLOW REPORT</div>
        <div class="report-title">
          \u6548\u80FD\u5831\u8868 ${He(e.status||"ok")}
          <span class="chip">performance_records</span>
        </div>
        <div class="report-sub">
          ${d(e.total)} \u7B46\u7B26\u5408 \xB7 ${be(e.duration_ms)} \xB7
          \u6BCF\u6B21\u57F7\u884C\u6309\u9215\u7684\u5B8C\u6574 Flow
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${p("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${p("file",14)}<span>JSON</span></button>
      </div>
    </div>
    ${s.length?`<div class="summary-strip">${s.map(i=>`<div class="summary-item">
                <div class="summary-label">${r(i.label)}</div>
                <div class="summary-value">${r(i.value)}</div>
              </div>`).join("")}</div>`:""}
    ${Al(n)}
    ${kl(a)}
    <div class="report-section-head perf-flow-list-head">
      <span class="report-section-title">Flow \u7D00\u9304</span>
      <span class="muted" style="font-size:9.5px">\u9EDE\u64CA\u5217\u5C55\u958B\u6A21\u7D44\u3001\u51FD\u6578\u3001\u53C3\u6578\u8207\u5340\u6BB5\u8017\u6642</span>
    </div>
    <div class="perf-record-list">
      ${t.length?t.map((i,o)=>Tl(i,o)).join(""):ot({iconName:"activity",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684 Flow",text:"\u653E\u5BEC\u65E5\u671F\u3001\u6A21\u578B\u6216\u8017\u6642\u689D\u4EF6\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}
    </div>
    ${Ll(e)}
    <details class="perf-query-details">
      <summary>\u67E5\u8A62\u8A9E\u53E5\u8207\u8B66\u544A</summary>
      <div class="query-box">
        <pre class="query-code">${r(e.query_text||"\u2014")}</pre>
        <button class="btn btn-secondary btn-sm btn-copy" type="button" data-action="copy-query">
          ${p("copy",12)}<span>\u8907\u88FD</span>
        </button>
      </div>
      ${Array.isArray(e.warnings)&&e.warnings.length?`<div class="warnings">${e.warnings.map(i=>`<div class="warning-line">${r(i)}</div>`).join("")}</div>`:""}
    </details>
  </div>`}async function Pl(e,t){let s=!1,a=pn(),n={processes:[],modules:[],statuses:[],methods:[],models:[]},i=1,o=25,l=null,u=[],c="",b=!1,$=null,v=!1;e.innerHTML=`<section class="page data-page performance-page">
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
          ${p("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
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
            <span class="status-tab-icon">${p("activity",15)}</span>
            <span class="status-tab-copy"><strong>\u6548\u80FD\u7E3D\u89BD</strong><small>Flow\u3001\u5340\u6BB5\u8017\u6642\u8207\u7D22\u5F15\u6548\u80FD</small></span>
          </button>
          <button class="status-tab" type="button" data-performance-tab="pipeline">
            <span class="status-tab-icon">${p("activity",15)}</span>
            <span class="status-tab-copy"><strong>RAG Pipeline</strong><small>Span waterfall\u3001Token \u8207 TTFT</small></span>
          </button>
          <button class="status-tab" type="button" data-performance-tab="benchmark">
            <span class="status-tab-icon">${p("brain",15)}</span>
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
                    ${p("search",15)}<span>\u57F7\u884C\u67E5\u8A62</span>
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
        <div id="performance-panel-benchmark" hidden></div>
      </section>
    </div>
  </section>`;let f=e.querySelector("#performance-filter-fields"),h=e.querySelector("#performance-filter-form"),_=e.querySelector("#performance-test-flow"),S=e.querySelector("#performance-report"),R=e.querySelector("#performance-panel-pipeline"),O=e.querySelector("#performance-meta"),I=e.querySelector("#performance-refresh"),Q=[...e.querySelectorAll("[data-performance-tab]")],oe={overview:e.querySelector("#performance-panel-overview"),pipeline:e.querySelector("#performance-panel-pipeline"),benchmark:e.querySelector("#performance-panel-benchmark")},te="overview",je=ie=>{te=ie;for(let $e of Q){let _e=$e.dataset.performanceTab===ie;$e.classList.toggle("is-active",_e),_e?$e.setAttribute("aria-current","page"):$e.removeAttribute("aria-current")}for(let[$e,_e]of Object.entries(oe))_e&&(_e.hidden=$e!==ie);ie==="benchmark"?O.textContent="BENCHMARK \xB7 RAG":ie==="pipeline"?O.textContent="PERFORMANCE \xB7 RAG WATERFALL":l&&(O.textContent=`PERFORMANCE \xB7 ${d(l.total)} \u7B46`)},De=xr(e,{onNavigate:ie=>je(ie)}),X=()=>{R&&(R.innerHTML=_l(u,c,b,$))},P=async({force:ie=!1}={})=>{if(!(s||b)){if(v&&!ie){X();return}b=!0,u.length||X();try{let $e=await z.performance({keyword:"/api/rag"},1,50);if(s)return;let _e=(Array.isArray($e.rows)?$e.rows:[]).filter(Ae=>Ae.flow&&(String(Ae.path||"").includes("/api/rag")||String(Ae.process||"").includes("RAG")));u=_e,(!c||!_e.some(Ae=>String(Ae.id)===String(c)))&&(c=_e[0]?String(_e[0].id):""),$=null,v=!0}catch($e){if(s)return;$=$e}finally{s||(b=!1,X())}}},k=ie=>{je(ie),ie==="benchmark"&&De.show(),ie==="pipeline"&&P()};e.addEventListener("click",ie=>{let $e=ie.target.closest("[data-performance-tab]");$e&&k($e.dataset.performanceTab||"overview")}),R?.addEventListener("change",ie=>{ie.target.matches("[data-rag-trace-select]")&&(c=String(ie.target.value||""),X())}),R?.addEventListener("click",ie=>{ie.target.closest('[data-action="refresh-rag-waterfall"]')&&P({force:!0})});let M=null,Z=[],ue="",G=null,ee="",J=()=>{f.innerHTML=ml(n,a)},le=()=>{let ie=JSON.stringify({selected:ue,tick:M?.status==="running"?Math.floor(Date.now()/1e3):0,runs:Z.map($e=>`${$e.run_id}:${$e.status}`),run:M?{run_id:M.run_id,status:M.status,progress:M.progress,total_ms:M.total_ms,steps:(M.steps||[]).map($e=>`${$e.stage}:${$e.model}:${$e.status}:${$e.progress}:${$e.duration_ms}`)}:null});ie!==ee&&(ee=ie,_.innerHTML=ys(M,Z,ue))},me=async()=>{try{let ie=await z.testRuns(30);if(s)return;Z=Array.isArray(ie.runs)?ie.runs:[]}catch{if(s)return;Z=[]}},K=async(ie=null)=>{try{let $e=ie&&!ue?ie:ue?await z.testRun(ue):await z.testRunCurrent();if(s)return;M=$e.run||null,!ue&&M&&M.status!=="running"&&!Z.some(_e=>_e.run_id===M.run_id)&&await me(),le()}catch{if(s)return;M=null,le()}},we=async(ie=null)=>{s||ue||await K(ie)},Be=()=>{s||G||(G=bt("test-runs",(ie,$e)=>we($e?.snapshot||null)))};_.addEventListener("change",async ie=>{ie.target.id==="test-run-select"&&(ue=String(ie.target.value||""),await K())}),_.addEventListener("click",async ie=>{ie.target.closest("#test-flow-refresh")&&(ue="",await me(),await K())});let ke=async(ie=i,{quiet:$e=!1}={})=>{i=Math.max(1,Number(ie)||1),a=Or();let _e=S.querySelector(".report-card"),Ae=document.activeElement?.matches?.("[data-page-size]")?document.activeElement.value:null;!!_e?S.setAttribute("aria-busy","true"):(S.removeAttribute("aria-busy"),S.innerHTML=Os({label:"\u6548\u80FD\u5831\u8868"}));let nt=e.querySelector("#performance-run");$e||qe(nt,!0,"\u67E5\u8A62\u4E2D\u2026");try{let L=await z.performance(a,i,o);if(s)return;if(l=L,i=Number(L.page)||i,o=Number(L.page_size)||o,S.removeAttribute("aria-busy"),S.innerHTML=Rl(L),Ae!==null){let C=S.querySelector("[data-page-size]");C&&(C.value=String(o),C.focus({preventScroll:!0}))}O.textContent=`PERFORMANCE \xB7 ${d(L.total)} \u7B46`,O.className="badge badge-neutral badge-mono"}catch(L){if(s)return;S.removeAttribute("aria-busy"),S.innerHTML=ma(L,{label:"\u6548\u80FD\u5831\u8868"}),A(L.message||"\u6548\u80FD\u5831\u8868\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{s||qe(nt,!1)}},tt=async()=>{try{n=await z.performanceOptions()}catch{n={processes:[],modules:[],statuses:[],methods:[],models:[]}}J()};return h.addEventListener("submit",ie=>{ie.preventDefault(),ke(1)}),e.querySelector('[data-action="reset"]').addEventListener("click",()=>{a=pn(),i=1,J(),ke(1)}),I.addEventListener("click",async()=>{if(te==="pipeline"){qe(I,!0,"\u6574\u7406\u4E2D\u2026");try{await P({force:!0})}finally{s||qe(I,!1)}return}if(te==="benchmark"){qe(I,!0,"\u6574\u7406\u4E2D\u2026");try{await De.refresh()}finally{s||qe(I,!1)}return}a=Or(),I.disabled=!0,qe(I,!0,"\u6574\u7406\u4E2D\u2026"),await tt(),await me(),s||await K(),s||await ke(1),s||(I.disabled=!1,qe(I,!1))}),S.addEventListener("click",async ie=>{let $e=ie.target.closest("[data-action]");if(!$e||!l)return;let _e=$e.dataset.action;if(_e==="retry"){ke(i);return}if(_e==="prev-page"){ke(Math.max(1,Number(l.page)-1),{quiet:!0});return}if(_e==="next-page"){let Ae=Math.max(1,Math.ceil(Number(l.total)/Number(l.page_size)));ke(Math.min(Ae,Number(l.page)+1),{quiet:!0});return}if(_e==="copy-query"){let Ae=await ps(l.query_text||"");A(Ae?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",Ae?"ok":"warn");return}if(_e==="export-json"){let Ae=`performance-page-${l.page}.json`;jt(Ae,JSON.stringify(fa(l),null,2),"application/json;charset=utf-8"),A(`\u5DF2\u532F\u51FA ${Ae}`,"ok");return}if(_e==="export-csv"){let Ae=`performance-page-${l.page}.csv`;jt(Ae,ga(l),"text/csv;charset=utf-8"),A(`\u5DF2\u532F\u51FA ${Ae}`,"ok")}}),S.addEventListener("change",ie=>{ie.target.matches("[data-page-size]")&&(o=Number(ie.target.value)||25,Hr.includes(o)||(o=25),ke(1,{quiet:!0}))}),await Promise.allSettled([tt(),me()]),s||(await K(),await ke(1),Be()),t&&typeof t.setTitle=="function"&&t.setTitle("\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"),()=>{s=!0,G&&G(),De.destroy()}}var Il=["\u91D1\u878D\u6D88\u8CBB\u8005\u4FDD\u8B77\u6CD5\u5982\u4F55\u8655\u7406\u91D1\u878D\u6D88\u8CBB\u722D\u8B70\uFF1F","\u8B49\u5238\u4EA4\u6613\u6CD5\u5C0D\u5167\u7DDA\u4EA4\u6613\u6709\u4EC0\u9EBC\u898F\u7BC4\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5438\u6536\u5B58\u6B3E\u8207\u6388\u4FE1\u6709\u54EA\u4E9B\u9650\u5236\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5F9E\u696D\u4EBA\u54E1\u6709\u90A3\u4E9B\u898F\u5B9A\uFF1F","\u4FDD\u96AA\u6CD5\u5C0D\u65BC\u696D\u52D9\u54E1\u4E0D\u7576\u62DB\u652C\u7684\u8CAC\u4EFB\u898F\u5B9A\uFF1F","\u9280\u884C\u6CD5\u6709\u591A\u5C11\u689D\u6587\uFF1F","\u8B49\u5238\u71DF\u696D\u54E1\u5E38\u89F8\u72AF\u4EC0\u9EBC\u6CD5\u898F\u6216\u547D\u4EE4\uFF1F","\u6709\u54EA\u4E9B\u6CD5\u898F\u662F\u548C\u58FD\u96AA\u53CA\u7522\u96AA\u76F8\u95DC\u7684\uFF1F"];function Bl(){return`<div class="answer-placeholder">
    <span class="empty-icon">${p("sparkles",26)}</span>
    <h2 class="empty-title">\u7B54\u6848\u53EA\u6703\u4F86\u81EA\u6AA2\u7D22\u5230\u7684\u5224\u6C7A\u53CA\u6CD5\u898F\u7247\u6BB5</h2>
    <p class="empty-text">\u9001\u51FA\u554F\u984C\u5F8C\uFF0C\u7CFB\u7D71\u6703\u5148\u4EE5 Qdrant \u6AA2\u7D22\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\u4E26\u6A19\u793A\u5F15\u7528\u7DE8\u865F\u3002
      \u82E5\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u660E\u78BA\u986F\u793A\u964D\u7D1A\u72C0\u614B\uFF0C\u4E0D\u6703\u6191\u7A7A\u751F\u6210\u7B54\u6848\u3002</p>
  </div>`}function hn(){return`<section class="card answer-card rag-empty-answer">${Bl()}</section>`}function Yr(e,t){return`<div class="rag-turn">
    <div class="rag-user-bubble">${r(e)}</div>
    <section class="card rag-assistant-turn" data-rag-answer>${t}</section>
  </div>`}function Ol(e,t){return Promise.race([e,new Promise((s,a)=>{window.setTimeout(()=>a(new Error("pipeline lookup timed out")),t)})])}async function Dl(e){if(!e||e.pipeline_flow)return e;let t=String(e._client_request_id||e.request_id||"").trim();if(!t)return e;for(let s=0;s<3;s+=1){try{let a=await Ol(z.performance({keyword:t},1,5),1800),n=(Array.isArray(a.rows)?a.rows:[]).find(i=>String(i.request_id||"")===t&&i.flow&&typeof i.flow=="object");if(n)return e.pipeline_flow=n.flow,e}catch{}s<2&&await new Promise(a=>window.setTimeout(a,250))}return e}function Fl(e){return{status:e.status,answer:e.answer,answer_source:e.answer_source,notice:e.notice,citations:Array.isArray(e.citations)?e.citations:[],judgments:Array.isArray(e.judgments)?e.judgments:[],law_sources:Array.isArray(e.law_sources)?e.law_sources:[],matched_terms:Array.isArray(e.matched_terms)?e.matched_terms:[],law_answer:e.law_answer,law_framework:e.law_framework,llm_model:e.llm_model,embedding_model:e.embedding_model,duration_ms:e.duration_ms,show_sources:e.show_sources,pipeline_flow:e.pipeline_flow||null,test_run:e.test_run||null,partial:!1,streaming:!1}}var zl={"http.request":"FastAPI \u63A5\u6536\u8ACB\u6C42","http.response":"\u56DE\u50B3\u7D50\u679C\u7D66\u524D\u7AEF","rag.answer_question":"RAG \u4E3B\u6D41\u7A0B","rag.coverage":"PostgreSQL \u7D22\u5F15\u8986\u84CB\u6AA2\u67E5","rag.law_retrieval":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22","rag.law_lookup":"\u6BD4\u5C0D\u554F\u984C\u4E2D\u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u540D\u7A31","rag.law_content":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u689D\u6587","rag.qdrant_precheck":"Qdrant collection \u6AA2\u67E5","rag.search":"RAG \u6AA2\u7D22","rag.embed_query":"Ollama embedding \u67E5\u8A62\u5411\u91CF","rag.qdrant_search":"Qdrant \u5411\u91CF\u641C\u5C0B","rag.fetch_documents":"PostgreSQL \u8B80\u53D6\u5224\u6C7A","rag.postgres_fetch":"PostgreSQL \u5224\u6C7A\u67E5\u8A62","rag.build_citations":"\u6574\u7406\u5F15\u7528\u8207\u5224\u6C7A\u7247\u6BB5","rag.extract_excerpt":"\u64F7\u53D6\u76F8\u95DC\u7247\u6BB5","rag.llm":"LLM \u56DE\u7B54\u751F\u6210","rag.llm_request":"Ollama LLM \u751F\u6210","rag.validate_citations":"\u9A57\u8B49\u5F15\u7528\u7DE8\u865F","rag.test_mode":"\u6E2C\u8A66\u6A21\u5F0F\u591A\u6A21\u578B\u6D41\u7A0B","rag.preview_fallback":"\u6CD5\u898F\u9810\u89BD\u964D\u7D1A"};function Hl(e){let t=String(e?.name||""),s=e?.params||{},a=String(s.model||s.embedding_model||"").trim();return t==="rag.llm_request"?`Ollama run ${a||"LLM"}`:t==="rag.llm"?`LLM \u56DE\u7B54\u751F\u6210${a?` \xB7 ${a}`:""}`:t==="rag.embed_query"?`Ollama embedding \u67E5\u8A62\u5411\u91CF${a?` \xB7 ${a}`:""}`:zl[t]||t||"backend step"}function Xr(e){return[e?.module,e?.function,e?.name].filter(Boolean).join(" \xB7 ")}function Zr(e){let t=Number(e);return Number.isFinite(t)?`${d(Math.max(0,Math.round(t)))} ms`:"\u2014"}function $n(e,t){if(!e)return;e.classList.toggle("is-open",t);let s=e.querySelector("#rag-process-body"),a=e.querySelector(".rag-process-toggle");s&&(s.hidden=!t),a&&(a.setAttribute("aria-expanded",String(t)),a.title=t?"\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B":"\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B")}function Ul(){return`<div class="rag-process is-open" id="rag-process">
    <div class="rag-process-control">
      <button type="button" class="rag-process-toggle" id="rag-process-toggle"
        aria-expanded="true" aria-controls="rag-process-body" title="\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B">
        <span class="rag-process-toggle-label-collapsed">\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B</span>
        <span class="rag-process-toggle-label-expanded">\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B</span>
        ${p("chevronDown",11)}
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
  </div>`}function Ql(e){let t=e.querySelector("#rag-process"),s=t?.querySelector("#rag-process-list"),a=t?.querySelector("#rag-process-summary"),n=performance.now(),i=new Map,o=new Map,l=(f,h,_)=>{let S=f.querySelector(h);S&&(S.textContent=_)},u=f=>{if(f.failed){l(f.element,".rag-process-meta","\u5931\u6557");return}if(f.hasChildren){l(f.element,".rag-process-meta","");return}l(f.element,".rag-process-meta",Zr(f.durationMs))},c=f=>{let h=f-1,_=[...i.values()].reverse();for(let S of _){if(h<0)break;S.depth<=h&&(S.hasChildren||(S.hasChildren=!0,S.element.dataset.hasChildren="true",S.finished&&u(S)),h=S.depth-1)}},b=f=>{if(!s)return null;let h=String(f?.seq??`step-${i.size+1}`),_=i.get(h);if(!_){let S=Math.max(0,Math.min(6,Number(f?.depth)||0));c(S);let R=document.createElement("div");R.className="rag-process-item is-running",R.dataset.processKey=h,R.style.setProperty("--depth",String(S)),R.innerHTML=`<span class="rag-process-dot"></span>
        <span class="rag-process-label"></span>
        <span class="rag-process-meta">\u57F7\u884C\u4E2D\u2026</span>`,s.appendChild(R),_={element:R,depth:S,hasChildren:!1,finished:!1,failed:!1,durationMs:0},i.set(h,_)}return l(_.element,".rag-process-label",Hl(f)),_.element.title=Xr(f),_};return{step:f=>{let h=f?.segment;if(!h)return;o.set(String(h.seq??h.name??o.size),{...h});let _=b(h);if(_){if(f.type==="segment_start"){_.element.classList.add("is-running"),l(_.element,".rag-process-meta","\u57F7\u884C\u4E2D\u2026");return}if(f.type==="segment_end"){let S=h.status==="error";_.element.classList.remove("is-running"),_.element.classList.toggle("is-error",S),_.finished=!0,_.failed=S,_.durationMs=Number(h.duration_ms)||0,u(_),_.element.title=[Xr(h),S&&h.error||""].filter(Boolean).join(" \xB7 ")}}},finish:(f=!0)=>{if(!t)return"";t.querySelectorAll(".rag-process-item.is-running").forEach(R=>{R.classList.remove("is-running");let O=R.dataset.hasChildren==="true";l(R,".rag-process-meta",O?"":f?"\u5B8C\u6210":"\u4E2D\u65B7")});let h=s?.children.length||i.size,_=Zr(Math.max(0,performance.now()-n));a&&(a.textContent=f?`\u5B8C\u6210 \xB7 ${h} \u6B65 \xB7 ${_}`:`\u5931\u6557 \xB7 ${h} \u6B65`);let S=[...o.values()].filter(R=>R?.name).sort((R,O)=>Number(R.offset_ms||0)-Number(O.offset_ms||0));if(s&&S.length){let R=Math.max(1,...S.map(O=>Number(O.end_offset_ms)||(Number(O.offset_ms)||0)+(Number(O.duration_ms)||0)));s.classList.add("is-waterfall"),s.innerHTML=$s($a(S),R,"\u5F8C\u7AEF Flow \u4F7F\u7528\u8207 RAG Pipeline \u76F8\u540C\u7684 waterfall\uFF1B\u6BCF\u500B span \u4EE5\u7D55\u5C0D offset \u5B9A\u4F4D\uFF0C\u9EDE\u9078\u53EF\u67E5\u770B\u53C3\u6578\u3001module\uFF0Ffunction\u3001\u958B\u59CB\uFF0F\u7D50\u675F\u6642\u9593\u8207\u932F\u8AA4\u3002")}return t.classList.add("is-complete"),$n(t,!1),t.outerHTML},collapse:()=>$n(t,!1)}}function Gl(e,t=!1){let s=t?"\u6E2C\u8A66\u6A21\u5F0F\uFF1A\u6B63\u5728\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207 LLM \u6A21\u578B\uFF0C\u53EF\u80FD\u9700\u8981\u6578\u5206\u9418\u2026":"\u6B63\u5728\u4EE5\u5411\u91CF\u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\u7247\u6BB5\u4E26\u751F\u6210\u56DE\u7B54\uFF1B\u5FEB\u901F\u6A21\u5F0F\u901A\u5E38 2\u201310 \u79D2\u2026";return`<div class="answer-head">
      <div class="answer-head-left">${p("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u4E2D</span>
      </div>
      <div class="answer-head-meta"><span class="spinner"></span></div>
      ${t?"":Ul()}
    </div>
    <div class="answer-body">
      <p class="answer-text">${s}\u300C${r(e)}\u300D</p>
      <div class="skeleton skeleton-line" style="margin-top:22px;width:92%"></div>
      <div class="skeleton skeleton-line" style="width:76%"></div>
      <div class="skeleton skeleton-line" style="width:84%"></div>
    </div>`}function ei(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function wa(e,{lawKey:t="",sourceType:s="",label:a=""}={}){let n=String(e||"").trim();return n?`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${r(t||n)}"
    data-source-type="${r(s||"")}"
    title="\u9EDE\u64CA\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587">${r(a||n)}</button>`:""}function ai(e){let t=String(e?.law_name||"").trim(),s=String(e?.article_no||"").replace(/\s+/g,"");if(!t||!s)return"";let a=(Array.isArray(e?.paragraphs)?e.paragraphs:[]).map(i=>String(i||"").trim()).filter(Boolean),n=`${t}${s}${a.join("\u3001")}`;return`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${r(t)}"
    data-source-type=""
    data-article-no="${r(s)}"
    title="\u9EDE\u64CA\u67E5\u770B ${r(n)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${r(n)} \u7684\u5B8C\u6574\u689D\u6587">${r(n)}</button>`}function Jl(e,t){let s=e.score===null||e.score===void 0?"":`\u76F8\u4F3C\u5EA6 ${Number(e.score).toFixed(4)}`,a=[e.court,e.jdate,s].filter(Boolean).map(c=>`<span>${r(c)}</span>`).join(""),n=(Array.isArray(e.law_citations)?e.law_citations:[]).map(c=>ai(c)).filter(Boolean).slice(0,12).join(""),i=n||(Array.isArray(e.matched_laws)?e.matched_laws:[]).slice(0,5).map(c=>wa(c)).join(""),o=n?'<div class="citation-meta"><span>\u5224\u6C7A\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4</span></div>':"",l=e.jid?` data-action="open-parquet-judgment"
        data-jid="${r(e.jid)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A"
        aria-label="\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A ${r(e.jid)}"`:"",u=e.pdf_url?`<a class="citation-link" href="${r(e.pdf_url)}" target="_blank" rel="noopener noreferrer" title="\u958B\u555F\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF">\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF${p("external",11)}</a>`:"";return`<article class="citation">
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
  </article>`}function Vl(e,t){let s=[e.law_level,e.law_category,e.article_count?`${d(e.article_count)} \u689D`:""].filter(Boolean).map(o=>`<span>${r(o)}</span>`).join(""),a=e.law_url?`<a class="citation-link" href="${r(e.law_url)}" target="_blank" rel="noopener noreferrer">\u4F86\u6E90${p("external",11)}</a>`:"",n=e.law_key||e.law_name||"",i=n?` data-action="open-law-source"
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
  </article>`}function Wl(e,t){let s=e.source_label||(e.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),a=e.law_level&&e.law_level!==s?e.law_level:"",n=[`<span class="badge ${e.source_type==="order"?"badge-warn":"badge-info"}">${r(s)}</span>`,a,e.law_category,e.article_count?`${d(e.article_count)} \u689D`:"",e.law_modified_date?`\u7570\u52D5 ${Lt(e.law_modified_date)}`:""].filter(Boolean).map(f=>`<span>${f}</span>`).join(""),i=e.first_promulgation?`<div class="citation-meta"><span>\u6700\u65E9\u5236\u5B9A\uFF1A${r(e.first_promulgation.roc_date)}\uFF08\u897F\u5143 ${r(e.first_promulgation.gregorian_date)}\uFF09</span></div>`:"",o=e.stats,l=o?`<div class="law-source-stats">
        <span>\u63D0\u53CA\u300C${r(o.entity||"")}\u300D\u7684\u5224\u6C7A ${d(o.judgment_count||0)} \u7B46</span>
        <span>\u672C\u6CD5\u898F\u88AB\u5F15\u7528 ${d(o.law_count||0)} \u6B21</span>
      </div>`:"",u=e.law_key||"",c=e.source_type||"",b=(Array.isArray(e.articles)?e.articles:[]).map(f=>{let h=String(f.article_no||"");return`<div class="law-source-article"${u&&h?` data-action="open-law-source"
        data-law-key="${r(u)}"
        data-source-type="${r(c)}"
        data-article-no="${r(h)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u9078\u67E5\u770B ${r(h)} \u7684\u5B8C\u6574\u5167\u5BB9"
        aria-label="\u958B\u555F ${r(e.law_name||"\u6CD5\u898F")} ${r(h)} \u7684\u5B8C\u6574\u689D\u6587"`:""}>
        <span class="law-source-article-no">${r(f.article_no||"\u689D\u6587")}</span>
        <p class="law-source-article-text">${r(f.article_content||"")}</p>
      </div>`}).join(""),$=e.law_url?`<a class="citation-link" href="${r(e.law_url)}" target="_blank" rel="noopener noreferrer">\u6CD5\u898F\u4F86\u6E90${p("external",11)}</a>`:"",v=e.law_key?` data-action="open-law-source"
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
      ${b}
    </div>
    <div class="citation-links">${$}</div>
  </article>`}function Kl(e,t=150){let s=String(e||"").replace(/\s+/g," ").trim();return s?s.length>t?`${s.slice(0,t)}\u2026`:s:""}function Yl(e,t){return!Array.isArray(e)||!e.length?`<p class="answer-text">${r(t)}</p>`:`<div class="law-answer-list">${e.map(s=>{let a=s.law_key||"",n=s.source_type||"",i=s.law_name||"\u672A\u547D\u540D\u6CD5\u898F",o=s.source_label||(n==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),l=Number(s.article_count||0),u=s.index!=null?`<span class="law-answer-index">[${r(String(s.index))}]</span>`:"",c=a?`<button class="law-answer-law" type="button"
            data-action="open-law-source"
            data-law-key="${r(a)}"
            data-source-type="${r(n)}"
            title="\u9EDE\u64CA\u958B\u555F ${r(i)} \u7684\u5B8C\u6574\u689D\u6587"
            aria-label="\u958B\u555F ${r(i)} \u7684\u5B8C\u6574\u689D\u6587">${r(i)}</button>`:`<strong>${r(i)}</strong>`,b=Array.isArray(s.articles)?s.articles:[],$=b.length?`<div class="law-answer-articles-label">\u76F8\u95DC\u689D\u6587</div>
          <div class="law-answer-articles">${b.map(v=>{let f=String(v.article_no||"").trim(),h=Kl(v.article_content);return!a||!f?`<div class="law-answer-article is-static">
                  <span class="law-answer-article-no">${r(f||"\u689D\u6587")}</span>
                  <span class="law-answer-article-text">${r(h)}</span>
                </div>`:`<button class="law-answer-article" type="button"
                data-action="open-law-source"
                data-law-key="${r(a)}"
                data-source-type="${r(n)}"
                data-article-no="${r(f)}"
                title="\u9EDE\u64CA\u67E5\u770B ${r(f)} \u7684\u5B8C\u6574\u5167\u5BB9"
                aria-label="\u958B\u555F ${r(i)} ${r(f)} \u7684\u5B8C\u6574\u689D\u6587">
                <span class="law-answer-article-no">${r(f)}</span>
                <span class="law-answer-article-text">${r(h)}</span>
              </button>`}).join("")}</div>`:"";return`<div class="law-answer-source">
        <div class="law-answer-source-head">
          ${c}
          <span class="law-answer-source-meta">\uFF08${r(o)}\uFF0C${d(l)} \u689D\uFF09</span>
          ${u}
        </div>
        ${$}
      </div>`}).join("")}</div>`}function Xl(e,t){if(!Array.isArray(e)||!e.length)return"";let s=new Map((Array.isArray(t)?t:[]).map(a=>[String(a.law_name||""),a]));return`<div class="answer-section-label" style="margin-top:18px">
      <span>\u547D\u4E2D\u8A5E\u5F59</span>
    </div>
    <div class="chips">${e.map(a=>{let n=s.get(String(a));return n?.law_key?wa(a,{lawKey:n.law_key,sourceType:n.source_type||""}):`<span class="chip">${r(a)}</span>`}).join("")}</div>`}function Zl(e,t){if(!e)return"";let s=Array.isArray(e.providers)?e.providers:[],a=e.active||s.find(c=>c.active),n=String(e.status||""),i=String(e.model||"").trim(),o=a?`${a.name}:${i}`:n==="not_configured"?"\u672A\u555F\u7528":"\u7121\u53EF\u7528\u6A21\u578B",l=s.map(c=>{let b=c.status==="operational",$=!!c.active||c===a,v=`${c.name||"reranker"}:${i}`,f=$?"\u4F7F\u7528\u4E2D":b?c.role==="fallback"?"fallback":"\u4E3B\u8981":"\u96E2\u7DDA";return`<span class="rag-model-button is-static${$?" is-active":""}${b?"":" is-unavailable"}"
        title="${r(`${v} \xB7 ${c.url||""}`)}"
        aria-label="${r(`${v}\uFF0C${f}`)}">
        <span class="rag-model-state" aria-hidden="true"></span>
        <span>${r(v)}</span>
        <span class="rag-model-current">${r(f)}</span>
      </span>`}).join(""),u=s.length?"":'<p class="rag-model-empty">\u5C1A\u672A\u8A2D\u5B9A reranker URL\u3002</p>';return`<div class="rag-model-strip rag-model-strip-rerank">
    <div class="rag-model-strip-head">
      <span class="rag-model-strip-title">${p("layers",13)} Rerank models</span>
      ${i?`<span class="rag-model-strip-base mono">${r(i)}</span>`:""}
      <span class="rag-model-strip-current">\u76EE\u524D\uFF1A<strong>${r(o)}</strong></span>
      <button class="btn btn-ghost btn-sm rag-model-refresh" type="button"
        data-rag-action="refresh-rerank-models"
        ${t?"disabled":""}>
        ${p("refresh",12)}<span>${t?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u6A21\u578B"}</span>
      </button>
    </div>
    ${l?`<div class="rag-model-buttons">${l}</div>`:u}
    <p class="rag-model-hint">Reranker \u7531 llama.cpp \u63D0\u4F9B\uFF1B\u4E0D\u53EF\u7528\u6642\u6703\u56DE\u9000 Qdrant \u6392\u5E8F\u3002</p>
  </div>`}function ya({tone:e,title:t,text:s,models:a,currentModel:n,currentProviderName:i,baseUrl:o,modelState:l,untestedProviders:u=[],rerank:c=null,rerankRefreshing:b=!1,busy:$,refreshing:v}){let f=e==="ok"?"is-ok":e==="warn"?"is-warn":"is-info",h=e==="ok"?"check":e==="warn"?"alert":"info",_=e==="ok"?"badge-ok":e==="warn"?"badge-warn":"badge-info",S=Array.isArray(a)?a:[],R=[...new Set(S.map(te=>te.providerName).filter(Boolean))],O=n&&i?`${i}:${n}`:n,I=S.map(te=>{let je=te.model===n&&(!i||te.providerName===i),De=te.providerName?`${te.providerName}:${te.model}`:te.model;return`<button class="rag-model-button${je?" is-active":""}" type="button" data-rag-model="${r(te.model)}"
        data-rag-provider="${r(te.hostId===null||te.hostId===void 0?"":String(te.hostId))}"
        title="${r(De)}"
        aria-pressed="${je}" ${$||v?"disabled":""}>
        <span class="rag-model-state" aria-hidden="true"></span>
        <span>${r(De)}</span>
        ${je?'<span class="rag-model-current">\u4F7F\u7528\u4E2D</span>':""}
      </button>`}).join(""),Q=(l?.models||[]).filter(te=>te.status==="untested").length,oe=l?Q?`\u5C1A\u6709 ${d(Q)} \u500B\u6A21\u578B\u672A\u6E2C\u8A66 chat \u80FD\u529B\uFF1B\u6309\u300C\u6AA2\u67E5\u6A21\u578B\u300D\u5F8C\u5373\u53EF\u5207\u63DB\u3002`:"\u76EE\u524D provider \u6C92\u6709\u53EF\u7528\u7684 chat \u6A21\u578B\u3002":"\u7121\u6CD5\u53D6\u5F97\u6A21\u578B\u6E05\u55AE\uFF1B\u8ACB\u78BA\u8A8D Ollama \u670D\u52D9\u662F\u5426\u555F\u52D5\u3002";return`<section class="rag-mode-card ${f}">
    <div class="rag-mode-head">
      <span class="rag-mode-icon" aria-hidden="true">${p(h,14)}</span>
      <div class="rag-mode-copy">
        <strong>${r(t)}</strong>
        <p>${r(s)}</p>
      </div>
      <span class="badge ${_}">${d(S.length)} \u500B chat model${R.length?` \xB7 ${R.length} \u53F0\u4E3B\u6A5F`:""}</span>
    </div>
    <div class="rag-model-strip">
      <div class="rag-model-strip-head">
        <span class="rag-model-strip-title">${p("brain",13)} Chat models</span>
        ${o?`<span class="rag-model-strip-base mono">${r(o)}</span>`:""}
        <span class="rag-model-strip-current">${O?`\u76EE\u524D\uFF1A<strong>${r(O)}</strong>`:"\u5C1A\u672A\u9078\u64C7"}</span>
        <button class="btn btn-ghost btn-sm rag-model-refresh" type="button"
          data-rag-action="refresh-chat-models"
          ${$||v?"disabled":""}>
          ${p("refresh",12)}<span>${v?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u6A21\u578B"}</span>
        </button>
      </div>
      ${I?`<div class="rag-model-buttons">${I}</div>
             <p class="rag-model-hint">\u9EDE\u9078\u6A21\u578B\u5207\u63DB\uFF1B\u5207\u63DB\u5F8C\u5957\u7528\u4E0B\u4E00\u6B21\u63D0\u554F\uFF0C\u4E0D\u5F71\u97FF\u5DF2\u5B8C\u6210\u7684\u56DE\u7B54\u3002</p>`:`<p class="rag-model-empty">${r(oe)}</p>`}
      ${u.length?`<p class="rag-model-hint rag-model-untested-hint">${r(u.join("\u3001"))} \u5C1A\u6709\u6A21\u578B\u5C1A\u672A\u6AA2\u67E5 chat \u80FD\u529B\uFF1B\u8ACB\u6309\u300C\u6AA2\u67E5\u6A21\u578B\u300D\u3002</p>`:""}
    </div>
    ${Zl(c,b)}
  </section>`}function ni(e){let t=Array.isArray(e.citations)?e.citations:[],s=Array.isArray(e.judgments)?e.judgments:[],a=Array.isArray(e.law_sources)?e.law_sources:[],n=Array.isArray(e.matched_terms)?e.matched_terms:[],i=e.status||"preview",o=!!e.partial,l=!!e.streaming,u=!!e.show_sources||!o,c=e.answer_source==="structured",b=String(e.law_answer||"").trim(),$=e.law_framework||null,v=Array.isArray($?.rows)?$.rows:[],f=Array.isArray($?.sources)?$.sources:[],h=v.length>0,_=!!b&&!c&&!h,S=s.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u5224\u6C7A \xB7 ${s.length} \u7B46</span>
        <span>vector retrieval \xB7 [\u7DE8\u865F] \u5C0D\u61C9\u56DE\u7B54\u5F15\u7528</span>
      </div>
      <div class="citation-list">${s.map((K,we)=>Jl(K,we)).join("")}</div>`:"",R=a.length&&!_?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4 \xB7 ${a.length} \u7B46</span>
        <span>PostgreSQL metadata \xB7 Parquet \u689D\u6587</span>
      </div>
      <div class="citation-list">${a.map((K,we)=>Wl(K,we)).join("")}</div>`:"",O=!s.length&&t.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F \xB7 ${t.length} \u7B46</span>
        <span>metadata match</span>
      </div>
      <div class="citation-list">${t.map((K,we)=>Vl(K,we)).join("")}</div>`:"",I=u?S+R+O:"";!I&&!o&&!_&&!h&&(I=`<div class="answer-divider"></div>
      ${ot({iconName:"file",title:"\u6C92\u6709\u53EF\u5F15\u7528\u7684\u4F86\u6E90",text:i==="retrieval_only"?"\u76EE\u524D\u5DF2\u5EFA\u7ACB\u7684\u5411\u91CF\u7D22\u5F15\u4E2D\u6C92\u6709\u8DB3\u5920\u76F8\u4F3C\u7684\u5224\u6C7A\uFF0C\u4E5F\u6C92\u6709\u53EF\u5C0D\u61C9\u7684\u6CD5\u898F\u6216\u547D\u4EE4\u3002\u7CFB\u7D71\u4E0D\u6703\u5728\u6C92\u6709\u4F86\u6E90\u6642\u751F\u6210\u7B54\u6848\u3002":"\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u4E14\u554F\u984C\u4E2D\u6C92\u6709\u53EF\u76F4\u63A5\u5C0D\u61C9\u7684\u73FE\u884C\u6CD5\u898F\u540D\u7A31\u3002"})}`);let Q=Xl(n,a),oe=e.test_run,te=String(e.llm_model||oe?.primary_model||"").trim(),je=String(e.embedding_model||"").trim(),De=[te?`LLM\uFF1A${te}`:"",je?`Embedding\uFF1A${je}`:""].filter(Boolean).join(" \xB7 "),X=l||e.answer_source==="llm"?"LLM \u7D9C\u5408\u56DE\u7B54":"\u6AA2\u7D22\u7D50\u679C\u6458\u8981",P=h?`<div class="answer-block law-framework-block">
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
              ${v.map(K=>`<tr>
                    <td>${r(K.law_name||"\u2014")}</td>
                    <td class="cell-number">${r(K.article_no||"\u2014")}</td>
                    <td>${r(K.focus||"\u2014")}</td>
                  </tr>`).join("")}
            </tbody>
          </table>
        </div>
        ${f.length?`<div class="law-framework-sources">
                <span>\u6CD5\u898F\u4F86\u6E90</span>
                ${f.map(K=>{let we=String(K?.law_name||K||"").trim(),Be=K&&K.index!==null&&K.index!==void 0?` [${r(K.index)}]`:"";return wa(we,{label:`${we}${Be}`})}).join("")}
              </div>`:""}
      </div>`:"",k=e.answer_source==="llm"&&te?`<span class="answer-model" title="${r(De)}">${p("brain",11)}${r(te)}</span>`:c?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${p("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"",M=l?`${te||"LLM"} \xB7 \u751F\u6210\u4E2D`:k?te||"structured":"retrieval",Z=oe?`<div class="test-run-summary">
        <div class="test-run-summary-head">
          <span class="badge badge-warn">\u6E2C\u8A66\u6A21\u5F0F</span>
          ${He(oe.status)}
          <span class="mono">${r(oe.run_id||"")}</span>
        </div>
        <div class="test-run-summary-body">
          <span>Embedding ${Number(oe.models?.embedding?.length||0)} \u500B</span>
          <span>LLM ${Number(oe.models?.llm?.length||0)} \u500B</span>
          <span>\u4E3B\u56DE\u7B54 ${r(oe.primary_model||"\u2014")}</span>
          <span>${Number(oe.total_ms||0)} ms</span>
          <a href="#/performance">\u67E5\u770B\u6E2C\u8A66 Flow</a>
        </div>
      </div>`:"",ue=e.pipeline_flow&&typeof e.pipeline_flow=="object"?e.pipeline_flow:null,G=!o&&ue?ha(ue,{serverDurationMs:Number(e.duration_ms)||0,embedded:!0}):"",J=String(e.answer||"").trim()||(l?"\u6B63\u5728\u751F\u6210\u56DE\u7B54\u2026":o?"\u6B63\u5728\u6AA2\u7D22\u5224\u6C7A\u4E26\u751F\u6210 LLM \u56DE\u7B54\u2026":"\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u56DE\u7B54\u3002"),le=l?" data-partial-answer":"",me=l?" is-streaming":"";return`${P}
      ${_?`<div class="answer-block law-answer-block">
              <div class="answer-block-head">
                <span>\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22\u7D50\u679C</span>
                <span>${o&&!u?"\u6CD5\u898F\u8CC7\u6599\u5EAB":`${a.length} \u7B46\u4F86\u6E90`}</span>
              </div>
              <div class="law-answer-content">${Yl(a,b)}</div>
            </div>`:""}
      <div class="answer-block">
        ${_||h?`<div class="answer-block-head">
                <span>${r(X)}</span>
                <span>${r(M)}</span>
              </div>`:""}
        <p class="answer-text${me}"${le}>${r(J)}</p>
      </div>
      ${e.notice?`<div class="answer-notice">${r(e.notice)}</div>`:""}
      ${Z}
      ${Q}
      ${I}
      ${G}`}function ti(e,t,s=""){let a=t.status||"preview",n=a==="operational"?"\u5B8C\u6210":a==="retrieval_only"?"\u50C5\u6AA2\u7D22\u7D50\u679C":a==="preview"?"\u6CD5\u898F\u9810\u89BD":a==="unavailable"||a==="not_configured"?"\u8CC7\u6599\u4E0D\u53EF\u7528":a==="degraded"?"\u964D\u7D1A":"\u5B8C\u6210",i=t.test_run,o=String(t.llm_model||i?.primary_model||"").trim(),l=String(t.embedding_model||"").trim(),u=[o?`LLM\uFF1A${o}`:"",l?`Embedding\uFF1A${l}`:""].filter(Boolean).join(" \xB7 "),c=t.answer_source==="structured",b=t.answer_source==="llm"&&o?`<span class="answer-model" title="${r(u)}">${p("brain",11)}${r(o)}</span>`:c?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${p("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"";return`<div class="answer-head">
      <div class="answer-head-left">${p("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u7D50\u679C</span>
      </div>
      <div class="answer-head-meta">
        ${He(a,n)}
        <span>${Number(t.duration_ms||0)} ms</span>
        ${b}
      </div>
      ${s}
    </div>
    <div class="answer-body">${ni(t)}</div>`}function ec(e,t=""){return`<div class="answer-head">
      <div class="answer-head-left">${p("alert",16)}
        <span class="answer-head-title">\u7121\u6CD5\u5B8C\u6210\u6AA2\u7D22</span>
      </div>
      ${t}
    </div>
    <div class="answer-body">
      ${Re({tone:"danger",title:"\u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
    </div>`}function tc(e){let t=Array.isArray(e.turns)?e.turns:[],s=t.length?t[t.length-1].payload||{}:e.payload||{},a=Array.isArray(s.citations)?s.citations.length:0,n=Array.isArray(s.judgments)?s.judgments.length:0,i=Array.isArray(s.law_sources)?s.law_sources.length:0;return a+n+i}function sc(e,t,s,a=null){let n=e.id??s,i=tc(e),o=t.get(String(e.project_id||"")),l=Array.isArray(e.turns)?e.turns:[],u=e.updated_at||e.created_at,c=a!=null&&String(a)===String(n);return`<div class="rag-history-item${e.pinned?" is-pinned":""}${c?" is-active":""}">
    <button class="rag-history-open" type="button" data-history-open data-history-id="${r(String(n))}">
      <span class="history-question">${r(e.title||"\u672A\u547D\u540D\u63D0\u554F")}</span>
      <span class="history-meta">
        <span>${r(Ms(u))}</span>
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
        aria-pressed="${e.pinned?"true":"false"}">${p("pin",14)}</button>
      <button class="rag-history-more" type="button"
        data-rag-action="open-history-menu" data-history-id="${r(String(n))}"
        title="\u66F4\u591A\u64CD\u4F5C" aria-label="\u66F4\u591A\u64CD\u4F5C" aria-haspopup="menu" aria-expanded="false">${p("more",14)}</button>
    </div>
  </div>`}function si(e,t,s){let a=new Map;for(let i of t){let o=String(i.project_id||"");o&&a.set(o,(a.get(o)||0)+1)}let n=[`<button class="rag-project${s?"":" is-active"}" type="button" data-rag-action="select-project" data-project-id="" aria-pressed="${s?"false":"true"}">
      <span class="rag-project-name">${p("grid",13)}<span>\u5168\u90E8</span></span>
      <span class="rag-project-count">${t.length}</span>
    </button>`];for(let i of e){let o=String(i.id),l=a.get(o)||0;n.push(`<button class="rag-project${s===o?" is-active":""}" type="button" data-rag-action="select-project" data-project-id="${r(o)}" aria-pressed="${s===o?"true":"false"}">
      <span class="rag-project-name">${p("folder",13)}<span>${r(i.name)}</span></span>
      <span class="rag-project-count">${l}</span>
    </button>`)}return e.length||n.push('<div class="rag-library-empty">\u5C1A\u672A\u5EFA\u7ACB\u5C08\u6848\u3002</div>'),n.push(`<div class="rag-project-add-wrap">
    <button class="rag-project-add" type="button" data-rag-action="show-project-form">${p("plus",13)}<span>\u5EFA\u7ACB\u5C08\u6848</span></button>
    <form class="rag-project-form" data-rag-form="project" hidden>
      <input class="input" type="text" name="project_name" maxlength="60" placeholder="\u5C08\u6848\u540D\u7A31" aria-label="\u5C08\u6848\u540D\u7A31" autocomplete="off" />
      <div class="rag-project-form-actions">
        <button class="btn btn-primary btn-sm" type="submit">\u5EFA\u7ACB</button>
        <button class="btn btn-ghost btn-sm" type="button" data-rag-action="cancel-project">\u53D6\u6D88</button>
      </div>
    </form>
  </div>`),n.join("")}async function ac(e){let t=!1,s=[],a=!1,n=[],i=!1,o="",l=8,u="",c=0,b=null,$=[],v=!1,f=!1,h={embedding:[],llm:[]},_=null,S=null,R=null,O=!1,I=!1,Q=!1;e.innerHTML=`<section class="page rag-page">
    <div class="rag-layout">
      <aside class="rag-library" aria-label="\u5C0D\u8A71\u5EAB">
        <button class="rag-new-chat" type="button" data-rag-action="new-chat">
          <span class="rag-new-chat-mark">${p("plus",16)}</span>
          <span class="rag-new-chat-copy"><strong>\u65B0\u5C0D\u8A71</strong><small>\u958B\u59CB\u65B0\u7684\u6CD5\u5F8B\u6AA2\u7D22</small></span>
        </button>
        <div class="rag-library-context" id="rag-library-context" hidden></div>
        <section class="rag-library-section" data-rag-section="pinned">
          <button class="rag-library-head" type="button" data-rag-toggle="pinned" aria-expanded="true">
            <span class="rag-library-title">${p("pin",13)}\u5DF2\u91D8\u9078</span>
            <span class="rag-library-count" id="rag-pinned-count">0</span>
            ${p("chevronDown",12,"rag-library-chevron")}
          </button>
          <div class="rag-library-body" id="rag-pinned-body">
            <div class="rag-library-empty">\u5C1A\u7121\u91D8\u9078\u9805\u76EE\u3002</div>
          </div>
        </section>
        <section class="rag-library-section" data-rag-section="projects">
          <button class="rag-library-head" type="button" data-rag-toggle="projects" aria-expanded="true">
            <span class="rag-library-title">${p("folder",13)}\u5C08\u6848</span>
            <span class="rag-library-count" id="rag-projects-count">0</span>
            ${p("chevronDown",12,"rag-library-chevron")}
          </button>
          <div class="rag-library-body" id="rag-projects-body"></div>
        </section>
        <section class="rag-library-section rag-library-recent">
          <div class="rag-library-head is-static">
            <span class="rag-library-title">${p("history",13)}\u6700\u8FD1\u9805\u76EE <span class="rag-library-count" id="rag-recent-count">0</span></span>
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
      <div id="rag-mode-notice">${Re({tone:"info",title:"RAG \u670D\u52D9\u72C0\u614B\u6AA2\u67E5\u4E2D",text:"\u6B63\u5728\u78BA\u8A8D Qdrant\u3001Embedding \u8207 LLM \u72C0\u614B\uFF1B\u6240\u6709\u56DE\u7B54\u90FD\u6703\u6A19\u793A\u53EF\u56DE\u6EAF\u7684\u4F86\u6E90\u3002"})}</div>
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
            ${p("sparkles",16)}<span>\u958B\u59CB\u6AA2\u7D22</span>
          </button>
        </div>
      </form>
      <div class="example-chips" id="example-chips" aria-label="\u7BC4\u4F8B\u554F\u984C">
        ${Il.map(g=>`<button class="example-chip" type="button" data-question="${r(g)}">${r(g)}</button>`).join("")}
      </div>
    </header>

    <section class="rag-conversation" id="rag-conversation" aria-live="polite">
      <div class="rag-turns" id="rag-turns">
        ${hn()}
      </div>
      <form class="rag-followup" id="rag-followup-form" hidden>
        <label class="sr-only" for="rag-followup-question">\u7E7C\u7E8C\u63D0\u554F</label>
        <textarea class="rag-followup-input" id="rag-followup-question" name="question" rows="1"
          maxlength="500" placeholder="\u7E7C\u7E8C\u554F\u4E0B\u4E00\u500B\u554F\u984C\u2026" aria-label="\u7E7C\u7E8C\u63D0\u554F"></textarea>
        <div class="rag-followup-actions">
          <span class="rag-followup-hint"><kbd>Enter</kbd> \u9001\u51FA \xB7 <kbd>Shift</kbd> + <kbd>Enter</kbd> \u63DB\u884C</span>
          <button class="btn btn-primary" type="submit" id="rag-followup-submit">
            ${p("sparkles",15)}<span>\u7E7C\u7E8C\u6AA2\u7D22</span>
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
  </section>`;let oe=e.querySelector("#rag-form"),te=e.querySelector("#rag-question"),je=e.querySelector("#rag-submit"),De=e.querySelector(".rag-page"),X=e.querySelector("#rag-turns"),P=e.querySelector("#rag-followup-form"),k=e.querySelector("#rag-followup-question"),M=e.querySelector("#rag-followup-submit"),Z=e.querySelector("#rag-history"),ue=e.querySelector("#rag-storage-note"),G=e.querySelector("#rag-clear-history"),ee=e.querySelector(".rag-library"),J=e.querySelector("#rag-pinned-body"),le=e.querySelector("#rag-projects-body"),me=e.querySelector("#rag-pinned-count"),K=e.querySelector("#rag-projects-count"),we=e.querySelector("#rag-recent-count"),Be=e.querySelector("#rag-library-context"),ke=e.querySelector("#rag-test-mode"),tt=e.querySelector("#rag-test-flow"),ie=e.querySelector("#rag-history-menu"),$e=e.querySelector("#rag-judgment-dialog"),_e=e.querySelector("#rag-law-dialog"),Ae=()=>{document.documentElement.classList.toggle("dialog-open",!!e.querySelector("dialog[open]"))};$e?.addEventListener("close",Ae),_e?.addEventListener("close",Ae);let Ye=null,nt=null,L,C=null,B=null,D=()=>{te.style.height="auto",te.style.height=`${Math.min(te.scrollHeight,220)}px`},ve=()=>{k.style.height="auto",k.style.height=`${Math.min(k.scrollHeight,160)}px`},V=g=>{v=!!g,De.classList.toggle("has-conversation",v)},Pe=()=>{v&&(P.hidden=!1,ve())},F=()=>{P.hidden=!0},ge=()=>{ie.hidden&&!B||(ie.hidden=!0,ie.innerHTML="",B&&B.setAttribute("aria-expanded","false"),C=null,B=null)},Ue=(g,j)=>{let E=X.querySelector(".rag-empty-answer");E&&E.remove(),X.insertAdjacentHTML("beforeend",Yr(g,j));let Y=X.lastElementChild,fe=Y?.querySelector("[data-rag-answer]");return window.requestAnimationFrame(()=>{Y?.scrollIntoView({behavior:"smooth",block:"start"})}),{turnElement:Y,answerElement:fe}},Ge=()=>{X.innerHTML=$.length?$.map(g=>Yr(g.question,ti(g.question,g.payload||{},""))).join(""):hn()},ls=g=>{let j=Array.isArray(g.turns)?g.turns:[];return j.length?(c+=1,At(),wt(null),b=g.id??null,$=j.map(E=>({...E})),u=$[$.length-1]?.question||"",V(!0),Ge(),Pe(),Xe(),qe(je,!1),qe(M,!1),window.setTimeout(()=>{P.scrollIntoView({behavior:"smooth",block:"end"})},50),!0):!1},Xe=()=>{if(t)return;if(ge(),!a){Z.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',J.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',me.textContent="0",we.textContent="0",i&&(le.innerHTML=si(n,[],o));return}let g=n.find(Ee=>String(Ee.id)===o)||null;o&&!g&&(o="");let j=new Map(n.map(Ee=>[String(Ee.id),Ee])),E=s.filter(Ee=>!!Ee.pinned),Y=s.filter(Ee=>!Ee.pinned),fe=o?Y.filter(Ee=>String(Ee.project_id||"")===o):Y,xe=fe.slice(0,l),ze=(Ee,et)=>sc(Ee,j,et,b);J.innerHTML=E.length?E.map(ze).join(""):'<div class="rag-library-empty">\u5C1A\u7121\u91D8\u9078\u9805\u76EE\u3002\u5C07\u6700\u8FD1\u9805\u76EE\u91D8\u9078\u5F8C\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</div>',le.innerHTML=si(n,s,o),Z.innerHTML=xe.length?xe.map(ze).join(""):`<div class="rag-library-empty">${o?"\u9019\u500B\u5C08\u6848\u9084\u6C92\u6709\u672A\u91D8\u9078\u7684\u9805\u76EE\u3002":E.length?"\u6700\u8FD1\u7684\u9805\u76EE\u90FD\u5DF2\u91D8\u9078\u3002":"\u5C1A\u7121\u63D0\u554F\u7D00\u9304\u3002\u9001\u51FA\u7B2C\u4E00\u500B\u554F\u984C\u5F8C\u6703\u4FDD\u5B58\u5728\u6B64\u700F\u89BD\u5668\u3002"}</div>`,fe.length>l&&Z.insertAdjacentHTML("beforeend",`<button class="rag-library-more" type="button" data-rag-action="more-recent">\u986F\u793A\u66F4\u591A \xB7 ${d(fe.length-l)} \u7B46</button>`),me.textContent=String(E.length),K.textContent=String(n.length),we.textContent=String(fe.length),g?(Be.hidden=!1,Be.innerHTML=`<span>${p("folder",12)}<strong>${r(g.name)}</strong></span><button type="button" data-rag-action="clear-project" title="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE" aria-label="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE">${p("x",12)}</button>`):(Be.hidden=!0,Be.innerHTML="")},Ss=async()=>{try{let g=await Xt("rag.projects",[]);n=Array.isArray(g)?g.map(j=>({id:String(j?.id||""),name:String(j?.name||"").trim()})).filter(j=>j.id&&j.name):[]}catch{n=[]}i=!0,t||Xe()},Je=g=>{o=String(g||""),l=8,Xe()},cs=()=>{let g=le.querySelector('[data-rag-form="project"]');g&&(g.hidden=!1,g.querySelector("input")?.focus())},ds=()=>{let g=le.querySelector('[data-rag-form="project"]');g&&(g.hidden=!0,g.reset())},Bt=async g=>{let j=g.elements.project_name,E=String(j?.value||"").trim();if(!E){A("\u8ACB\u8F38\u5165\u5C08\u6848\u540D\u7A31\u3002","warn"),j?.focus();return}if(n.some(fe=>fe.name.toLowerCase()===E.toLowerCase())){A("\u5DF2\u6709\u540C\u540D\u5C08\u6848\u3002","warn"),j?.focus();return}let Y=typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():`project-${Date.now()}-${Math.random().toString(16).slice(2)}`;n=[...n,{id:Y,name:E.slice(0,60),created_at:new Date().toISOString()}],o=Y,l=8,await Is("rag.projects",n),Xe(),A(`\u5DF2\u5EFA\u7ACB\u5C08\u6848\u300C${E}\u300D\u3002`,"ok")},qt=async g=>{let j=s.find(fe=>String(fe.id)===String(g));if(!j)return;let E=!j.pinned;if(!await Ps(j.id,{pinned:E})){A("\u7121\u6CD5\u66F4\u65B0\u91D8\u9078\u72C0\u614B\u3002","danger");return}j.pinned=E,Xe(),A(E?"\u5DF2\u91D8\u9078\u9805\u76EE\u3002":"\u5DF2\u53D6\u6D88\u91D8\u9078\u3002","ok")},Ot=()=>{c+=1,At(),wt(null),u="",b=null,$=[],V(!1),F(),X.innerHTML=hn(),te.value="",D(),k.value="",ve(),qe(je,!1),qe(M,!1),Xe(),$e?.open&&$e.close(),_e?.open&&_e.close(),te.focus(),window.scrollTo({top:0,behavior:"smooth"})},Dt=g=>{if(!g||ie.hidden)return;let j=g.getBoundingClientRect(),E=ie.getBoundingClientRect(),Y=6,fe=j.bottom+Y;fe+E.height>window.innerHeight-8&&(fe=Math.max(8,j.top-E.height-Y));let xe=j.right-E.width;xe=Math.max(8,Math.min(xe,window.innerWidth-E.width-8)),ie.style.left=`${Math.round(xe)}px`,ie.style.top=`${Math.round(fe)}px`},Et=g=>{ie.innerHTML=`
      <button type="button" role="menuitem" data-menu-action="rename">${p("edit",13)}<span>\u91CD\u65B0\u547D\u540D</span></button>
      <button type="button" role="menuitem" data-menu-action="toggle-pin">${p("pin",13)}<span>${g.pinned?"\u53D6\u6D88\u91D8\u9078":"\u91D8\u9078"}</span></button>
      <button type="button" role="menuitem" data-menu-action="share">${p("link",13)}<span>\u5206\u4EAB</span></button>
      <button type="button" role="menuitem" data-menu-action="move">${p("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></button>
      <div class="rag-history-menu-divider"></div>
      <button class="is-danger" type="button" role="menuitem" data-menu-action="delete">${p("trash",13)}<span>\u522A\u9664</span></button>`},Ft=g=>{let j=String(g.project_id||""),E=[{id:"",name:"\u672A\u5206\u985E"},...n.map(Y=>({id:String(Y.id),name:Y.name}))];ie.innerHTML=`
      <div class="rag-history-menu-head">${p("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></div>
      ${E.map(Y=>`<button type="button" role="menuitem"
            data-menu-action="assign-project" data-project-id="${r(Y.id)}">
            <span class="rag-history-menu-check">${j===Y.id?p("check",12):""}</span>
            <span>${r(Y.name)}</span>
          </button>`).join("")}
      ${n.length?"":'<div class="rag-history-menu-note">\u5C1A\u672A\u5EFA\u7ACB\u5C08\u6848\uFF0C\u53EF\u5148\u5F9E\u5DE6\u5074\u5EFA\u7ACB\u3002</div>'}
      <div class="rag-history-menu-divider"></div>
      <button type="button" role="menuitem" data-menu-action="back">${p("chevronLeft",13)}<span>\u8FD4\u56DE</span></button>`},w=(g,j)=>{let E=s.find(Y=>String(Y.id)===String(j));E&&(ge(),C=String(E.id),B=g,Et(E),ie.hidden=!1,g.setAttribute("aria-expanded","true"),Dt(g))},x=async g=>{let j=window.prompt("\u91CD\u65B0\u547D\u540D\u5C0D\u8A71",g.title||"");if(j===null)return;let E=j.trim();if(!E){A("\u540D\u7A31\u4E0D\u80FD\u7A7A\u767D\u3002","warn");return}if(E===g.title)return;if(!await Ps(g.id,{title:E})){A("\u91CD\u65B0\u547D\u540D\u5931\u6557\u3002","danger");return}g.title=E,Xe(),A("\u5C0D\u8A71\u5DF2\u91CD\u65B0\u547D\u540D\u3002","ok")},q=async g=>{let j=Array.isArray(g.turns)?g.turns:[],E=[`# ${g.title||"\u672A\u547D\u540D\u5C0D\u8A71"}`,""];if(j.length)for(let fe of j){E.push("## \u554F\u984C","",fe.question||"",""),E.push("## \u56DE\u7B54","",fe.payload?.answer||"\uFF08\u6C92\u6709\u56DE\u7B54\u5167\u5BB9\uFF09","");let xe=Array.isArray(fe.payload?.law_sources)?fe.payload.law_sources.map(ze=>ze.law_name).filter(Boolean):[];xe.length&&E.push(`\u5F15\u7528\uFF1A${[...new Set(xe)].join("\u3001")}`,"")}else E.push(g.title||"");let Y=await ps(E.join(`
`));A(Y?"\u5C0D\u8A71\u5167\u5BB9\u5DF2\u8907\u88FD\uFF0C\u53EF\u76F4\u63A5\u8CBC\u4E0A\u5206\u4EAB\u3002":"\u7121\u6CD5\u8907\u88FD\u5C0D\u8A71\u5167\u5BB9\u3002",Y?"ok":"warn")},T=async g=>{if(!window.confirm(`\u522A\u9664\u5C0D\u8A71\u300C${g.title||"\u672A\u547D\u540D\u5C0D\u8A71"}\u300D\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002`))return;if(!await lr(g.id)){A("\u522A\u9664\u5931\u6557\u3002","danger");return}let E=b!==null&&String(b)===String(g.id);s=s.filter(Y=>String(Y.id)!==String(g.id)),E?Ot():Xe(),A("\u5C0D\u8A71\u5DF2\u522A\u9664\u3002","ok")},H=async(g,j)=>{if(!await Ps(g.id,{project_id:j})){A("\u79FB\u81F3\u5C08\u6848\u5931\u6557\u3002","danger");return}g.project_id=j;let Y=n.find(fe=>String(fe.id)===String(j));Xe(),A(Y?`\u5DF2\u79FB\u81F3\u5C08\u6848\u300C${Y.name}\u300D\u3002`:"\u5DF2\u79FB\u51FA\u5C08\u6848\u3002","ok")},U=async g=>{let j=g.target.closest("[data-menu-action]");if(!j)return;let E=s.find(fe=>String(fe.id)===C);if(!E){ge();return}let Y=j.dataset.menuAction;Y==="rename"?(ge(),await x(E)):Y==="toggle-pin"?(ge(),await qt(E.id)):Y==="share"?(ge(),await q(E)):Y==="move"?(Ft(E),Dt(B)):Y==="assign-project"?(ge(),await H(E,j.dataset.projectId||"")):Y==="back"?(Et(E),Dt(B)):Y==="delete"&&(ge(),await T(E))},ne=g=>{ie.hidden||(typeof g.composedPath=="function"?g.composedPath():[]).includes(ie)||ie.contains(g.target)||g.target.closest('[data-rag-action="open-history-menu"]')||ge()},Se=g=>{g.key==="Escape"&&ge()},Te=g=>{g.target instanceof Node&&ie.contains(g.target)||ge()},ye=async()=>{try{if(s=await ra({limit:120}),t)return;a=!0,Xe(),ue.textContent=na()==="indexeddb"?"\u63D0\u554F\u7D00\u9304\u5132\u5B58\u5728\u700F\u89BD\u5668 IndexedDB\uFF0C\u4E0D\u6703\u4E0A\u50B3\u5230\u4F3A\u670D\u5668\u3002":"\u700F\u89BD\u5668\u5132\u5B58\u4E0D\u53EF\u7528\uFF0C\u63D0\u554F\u7D00\u9304\u53EA\u4FDD\u7559\u5728\u672C\u6B21\u5DE5\u4F5C\u968E\u6BB5\u3002"}catch{if(t)return;s=[],a=!0,Xe(),Z.innerHTML='<div class="rag-library-empty">\u7121\u6CD5\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u3002</div>'}},Ie=async(g,j,E,Y)=>{let fe=$,xe=b;fe.push({question:g,asked_at:new Date().toISOString(),payload:Fl(j)});let ze=Array.isArray(j.citations)?j.citations:[],Ee=Array.isArray(j.judgments)?j.judgments:[],et={question:g,status:j.status,citations:ze.map(Ce=>Ce.law_name),judgments:Ee.map(Ce=>Ce.jid)},rt=`${j.status||"preview"} \xB7 ${fe.length} \u8F2A`,Oe=new Date().toISOString(),ut=Ce=>{Y===c&&(b=Ce)};if(xe){if(!await Ps(xe,{turns:fe,detail:rt,payload:et,updated_at:Oe})){let mt=await Rs({kind:"rag",title:fe[0]?.question||g,detail:rt,project_id:E,turns:fe,payload:et,updated_at:Oe});ut(mt)}}else{let Ce=await Rs({kind:"rag",title:fe[0]?.question||g,detail:rt,project_id:E,turns:fe,payload:et,updated_at:Oe});ut(Ce)}await ye()},Ve=()=>(_?.services||[]).find(g=>g.id==="llm")||null,We=()=>{let g=e.querySelector("#rag-mode-notice");if(!g)return;let j=Array.isArray(S?.providers)?S.providers:[],E=[];for(let Ce of j)if(!(!Ce||!Array.isArray(Ce.chat_models)))for(let mt of Ce.chat_models)E.push({model:mt,providerName:String(Ce.name||"").trim(),hostId:Ce.host_id===null||Ce.host_id===void 0?null:Number(Ce.host_id)});if(!E.length&&Array.isArray(S?.chat_models)){let Ce=String(S?.provider_name||"").trim(),mt=S?.provider?.host_id;for(let Fe of S.chat_models)E.push({model:Fe,providerName:Ce,hostId:mt==null?null:Number(mt)})}let Y=j.filter(Ce=>Array.isArray(Ce?.models)&&Ce.models.length>0&&(!Array.isArray(Ce.chat_models)||Ce.chat_models.length===0)).map(Ce=>String(Ce.name||"").trim()).filter(Boolean),fe=String(Ve()?.model||"").trim(),xe=String(S?.base_url||"").trim(),ze=String(S?.provider_name||"").trim(),Ee=_&&(_.services||[]).find(Ce=>Ce.id==="reranker")||null;if(!_){if(!R)return;g.innerHTML=ya({tone:"warn",title:"\u7121\u6CD5\u53D6\u5F97 RAG \u670D\u52D9\u72C0\u614B",text:R.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\uFF0C\u6216\u524D\u5F80\u7CFB\u7D71\u72C0\u614B\u9801\u67E5\u770B\u3002",models:E,currentModel:fe,currentProviderName:ze,baseUrl:xe,modelState:S,untestedProviders:Y,rerank:Ee,rerankRefreshing:Q,busy:O,refreshing:I});return}let et=_.data||{},rt=(_.services||[]).find(Ce=>Ce.id==="rag"),Oe=Number(et.judgment_indexed_count||0),ut=Number(et.judgment_count||0);rt?.status==="operational"?g.innerHTML=ya({tone:"ok",title:"\u6AA2\u7D22\u8207\u56DE\u7B54\u5C31\u7DD2",text:`Qdrant\u3001Embedding \u8207 LLM \u5747\u53EF\u4F7F\u7528\uFF1B\u76EE\u524D\u7D22\u5F15\u6DB5\u84CB ${d(Oe)} / ${d(ut)} \u7B46\u5224\u6C7A\u3002\u56DE\u7B54\u4E0D\u662F\u6CD5\u5F8B\u610F\u898B\u3002`,models:E,currentModel:fe,currentProviderName:ze,baseUrl:xe,modelState:S,untestedProviders:Y,rerank:Ee,rerankRefreshing:Q,busy:O,refreshing:I}):rt?.status==="degraded"?g.innerHTML=ya({tone:"warn",title:"\u90E8\u5206 AI \u5143\u4EF6\u672A\u5C31\u7DD2",text:rt.detail||"RAG \u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u6AA2\u7D22\u7D50\u679C\u3002",models:E,currentModel:fe,currentProviderName:ze,baseUrl:xe,modelState:S,untestedProviders:Y,rerank:Ee,rerankRefreshing:Q,busy:O,refreshing:I}):g.innerHTML=ya({tone:"info",title:"\u5411\u91CF\u7D22\u5F15\u5C1A\u672A\u5C31\u7DD2 \xB7 \u4E0D\u662F\u6CD5\u5F8B\u610F\u898B",text:rt?.detail||"\u8A2D\u5B9A QDRANT_URL\u3001EMBEDDING_URL \u8207 LLM_URL \u4E26\u57F7\u884C judgment-index-vectors \u5F8C\u5373\u53EF\u555F\u7528\u5224\u6C7A\u6AA2\u7D22\u3002",models:E,currentModel:fe,currentProviderName:ze,baseUrl:xe,modelState:S,untestedProviders:Y,rerank:Ee,rerankRefreshing:Q,busy:O,refreshing:I})},us=async()=>{let[g,j]=await Promise.allSettled([z.status(),z.llmModels()]);t||(_=g.status==="fulfilled"?g.value:null,S=j.status==="fulfilled"?j.value:null,R=g.status==="rejected"?g.reason:null,We())},xs=async(g,j=null)=>{if(!g||O||I)return;let E=String(Ve()?.model||"").trim(),Y=String(S?.provider_name||"").trim(),fe=(S?.providers||[]).find(Ee=>j!==null&&Ee?.host_id!==null&&Ee?.host_id!==void 0&&Number(Ee.host_id)===Number(j)),xe=String(fe?.name||(j===null?Y:"")).trim();if(g===E&&(!j||!xe||xe===Y))return;let ze=xe?`${xe}:${g}`:g;O=!0,We();try{await z.selectLlmModel(g,j),A(`\u5DF2\u5207\u63DB chat model\uFF1A${ze}`,"ok",3500)}catch(Ee){A(Ee.message||"\u7121\u6CD5\u5207\u63DB chat model\u3002","danger",6e3)}finally{O=!1,t||await us()}},zt=async()=>{if(!(I||O)){I=!0,We();try{await z.testLlmModels(),A("\u5DF2\u66F4\u65B0 chat model \u6E05\u55AE\u3002","ok",3500)}catch(g){A(g.message||"\u7121\u6CD5\u6AA2\u67E5 chat model\u3002","danger",6e3)}finally{I=!1,t||await us()}}},ja=async()=>{if(!Q){Q=!0,We();try{let g=await z.status();if(t)return;_=g,R=null,A("\u5DF2\u66F4\u65B0 rerank model \u72C0\u614B\u3002","ok",3e3)}catch(g){A(g.message||"\u7121\u6CD5\u6AA2\u67E5 rerank model\u3002","danger",6e3)}finally{Q=!1,t||We()}}},qs=()=>{if(!ke)return;if(!f){ke.innerHTML="";return}let g=Array.isArray(h.embedding)?h.embedding.length:0,j=Array.isArray(h.llm)?h.llm.length:0;ke.innerHTML=Re({tone:"warn",title:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F",text:`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${g} \u500B embedding \u8207 ${j} \u500B LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002\u6E2C\u8A66 Flow \u6703\u5728\u9801\u9762\u4E0B\u65B9\u5373\u6642\u986F\u793A\uFF0C\u4E5F\u53EF\u5230 <a href="#/tests">\u7CFB\u7D71\u6E2C\u8A66</a> \u6216 <a href="#/performance">\u6548\u80FD\u5831\u8868</a> \u67E5\u770B\u6B77\u53F2\u3002`})},Ta=async()=>{try{let g=await z.testMode();if(t)return;f=!!g.enabled,h=g.models||{embedding:[],llm:[]},qs()}catch{if(t)return;f=!1,qs()}},Gs=g=>{f=!!g.detail?.enabled,h=g.detail?.models||{embedding:[],llm:[]},qs()};window.addEventListener("judgment:test-mode",Gs);let wt=g=>{if(!tt)return;nt=g||null;let j=JSON.stringify(g?{run_id:g.run_id,status:g.status,progress:g.progress,total_ms:g.total_ms,stage:g.stage,answer:g.answer||"",steps:(g.steps||[]).map(E=>`${E.stage}:${E.model}:${E.status}:${E.progress}:${E.duration_ms}`)}:null);j!==L&&(L=j,tt.innerHTML=g?ys(g,[],"",{showHistory:!1}):"")},At=()=>{Ye&&(Ye(),Ye=null)},As=async(g=null)=>{if(!t)try{let j=g||await z.testRunCurrent();if(t)return;let E=j.run;E&&E.status==="running"&&wt(E)}catch{}},Ls=()=>{t||Ye||(As(),Ye=bt("test-runs",(g,j)=>As(j?.snapshot||null)))},Js=async g=>{if(!g){wt(null);return}try{let j=await z.testRun(g);if(t)return;wt(j.run||null)}catch{t||A("\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF0C\u4F46\u7121\u6CD5\u8F09\u5165\u6E2C\u8A66 Flow\u3002","warn")}},m=async()=>{if(f)try{let g=await z.testRunCurrent();if(t)return;g.run?.status==="running"&&(wt(g.run),Ls())}catch{}},y=0,N=(g,j)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">DB ORIGINAL JUDGMENT</div>
      <h2>${r(g)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-parquet-judgment" aria-label="\u95DC\u9589">${p("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${j}</div>`,re=g=>{let j=(Array.isArray(g.citations)?g.citations:[]).map(ze=>ai(ze)).filter(Boolean).join(""),E=j||(Array.isArray(g.matched_laws)?g.matched_laws:[]).map(ze=>wa(ze)).join(""),Y=[g.court,g.jdate,g.title?`\u6848\u7531\uFF1A${g.title}`:"",g.full_text_length?`${d(g.full_text_length)} \u5B57`:"",g.citation_count?`\u5F15\u7528 ${d(g.citation_count)} \u7B46`:""].filter(Boolean).map(ze=>`<span>${r(ze)}</span>`).join(""),fe=g.parquet_generated_at?`DB \u5132\u5B58\u539F\u6587\uFF08\u539F\u59CB Parquet\uFF09\xB7 ${r(String(g.parquet_generated_at).replace("T"," ").slice(0,19))}`:"DB \u5132\u5B58\u539F\u6587",xe=g.pdf_url?`<a class="btn btn-secondary btn-sm" href="${r(g.pdf_url)}" target="_blank" rel="noopener noreferrer">${p("external",13)}<span>\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF</span></a>`:"";return N(g.jid||"\u5224\u6C7A\u5168\u6587",`<div class="judgment-dialog-meta">
        <span class="badge badge-info">${r(g.source==="parquet"?"DB \u5132\u5B58\u539F\u6587":"PostgreSQL")}</span>
        ${Y}
      </div>
      ${j?'<div class="citation-meta" style="margin-top:8px"><span>\u5224\u6C7A\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4</span></div>':""}
      ${E?`<div class="chips" style="margin:8px 0 10px">${E}</div>`:""}
      <div class="judgment-dialog-source">${fe}</div>
      <pre class="judgment-dialog-text">${r(g.full_text||"\u6B64\u5224\u6C7A\u6C92\u6709\u5168\u6587\u3002")}</pre>
      <div class="judgment-dialog-actions">
        ${xe}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-parquet-judgment">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},W=async g=>{if(!$e||!g)return;let j=++y;$e.open||$e.showModal(),Ae(),$e.innerHTML=N("\u8B80\u53D6\u5224\u6C7A\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E DB \u5132\u5B58\u539F\u6587\u8B80\u53D6 ${r(g)}\u2026</span>
      </div>`);try{let E=await z.judgmentDetail(g,"parquet");if(t||j!==y)return;$e.innerHTML=re(E)}catch(E){if(t||j!==y)return;$e.innerHTML=N("\u7121\u6CD5\u8B80\u53D6 DB \u539F\u6587\u5224\u6C7A",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${r(E.message||"\u627E\u4E0D\u5230\u5224\u6C7A\u5168\u6587\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u5DF2\u57F7\u884C <span class="mono">uv run judgment-import-judgments --raw-only</span>\uFF0C\u4E14\u539F\u59CB Parquet \u5B58\u5728\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-parquet-judgment">\u95DC\u9589</button>
        </div>`)}},ce=0,se=(g,j)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">LOCAL PARQUET LAW</div>
      <h2>${r(g)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-law-source" aria-label="\u95DC\u9589">${p("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${j}</div>`,pe=(g,j="")=>{let E=String(g.selected_article_no||j||"").trim(),Y=!!E,fe=Array.isArray(g.articles)?g.articles:[],xe=fe.map(St=>{let Na=String(St.article_content||"").trim();return Na?St.article_type==="C"?`<div class="law-chapter">${r(Na)}</div>`:`<article class="law-article" data-article-no="${r(ei(St.article_no))}">
          <div class="law-article-head">
            <span class="law-article-no">${r(St.article_no||"\u689D\u6587")}</span>
          </div>
          <div class="law-article-text">${r(Na)}</div>
        </article>`:""}).join(""),ze=(Array.isArray(g.warnings)?g.warnings:[]).map(St=>r(St)).join("<br />"),Ee=g.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F",et=g.meta?.articles_source,rt=et==="parquet"?"Parquet \u689D\u6587":et==="postgresql"?"PostgreSQL \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",Oe=g.meta?.snapshot||"",ut=[g.law_level,g.law_category,g.article_count?`${d(g.article_count)} \u689D`:"",g.law_modified_date?`\u7570\u52D5 ${Lt(g.law_modified_date)}`:""].filter(Boolean).map(St=>`<span>${r(St)}</span>`).join(""),Ce=g.law_url?`<a class="btn btn-secondary btn-sm" href="${r(g.law_url)}" target="_blank" rel="noopener noreferrer">${p("external",13)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:"",mt=!Y&&g.law_histories?`<details class="law-dialog-history">
          <summary>\u6CD5\u898F\u6CBF\u9769</summary>
          <div>${r(g.law_histories)}</div>
        </details>`:"",Fe=Y?`<span class="badge badge-mono">${r(E)}</span>`:"",gt=!Y&&fe.length>1?`<div class="law-dialog-jump">
          <div class="law-article-jump">
            <input class="input law-article-jump-input law-jump-input"
              id="rag-law-article-jump" type="text" inputmode="numeric"
              autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
            <button class="btn btn-secondary btn-sm" type="button"
              data-action="jump-law-article"
              data-jump-input="rag-law-article-jump">\u8DF3\u81F3\u689D\u6587</button>
          </div>
        </div>`:"",ht=Y?`${g.law_name||g.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4"} \xB7 ${E}`:g.law_name||g.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4";return se(ht,`<div class="judgment-dialog-meta">
        <span class="badge ${g.source_type==="order"?"badge-warn":"badge-info"}">${r(Ee)}</span>
        ${Fe}
        ${ut}
      </div>
      <div class="judgment-dialog-source">${r([rt,Oe].filter(Boolean).join(" \xB7 "))}</div>
      ${ze?`<div class="law-dialog-warning">${ze}</div>`:""}
      ${mt}
      ${gt}
      <div class="law-dialog-articles">${xe||`<div class="report-empty-inline">${Y?"\u9019\u689D\u689D\u6587\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u5167\u5BB9\u3002":"\u9019\u500B\u6CD5\u898F\uFF0F\u547D\u4EE4\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u3002"}</div>`}</div>
      <div class="judgment-dialog-actions">
        ${Ce}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-law-source">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},de=(g,j)=>{let E=g?.querySelector(`#${j}`),Y=ei(E?.value||"");if(!Y){A("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),E?.focus();return}let fe=[...g?.querySelectorAll("[data-article-no]")||[]].find(xe=>xe.dataset.articleNo===Y);if(!fe){A(`\u627E\u4E0D\u5230\u7B2C ${Y} \u689D\u3002`,"warn");return}fe.scrollIntoView({behavior:"instant",block:"center"}),fe.classList.add("is-jump-target"),window.setTimeout(()=>fe.classList.remove("is-jump-target"),2400)},he=async(g,j="",E="")=>{if(!_e||!g)return;let Y=++ce;_e.open||_e.showModal(),Ae(),_e.innerHTML=se(E?"\u8B80\u53D6\u6CD5\u898F\u689D\u6587\u4E2D\u2026":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E\u672C\u5730 Parquet \u8B80\u53D6 ${r([g,E].filter(Boolean).join(" \xB7 "))} \u7684\u539F\u59CB\u689D\u6587\u2026</span>
      </div>`);try{let fe=await z.lawDetail(g,j,"",E);if(t||Y!==ce)return;_e.innerHTML=pe(fe,E)}catch(fe){if(t||Y!==ce)return;_e.innerHTML=se("\u7121\u6CD5\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u6587",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${r(fe.message||"\u627E\u4E0D\u5230\u689D\u6587\u5167\u5BB9\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u672C\u5730\u539F\u59CB\u6CD5\u898F Parquet \u5B58\u5728\uFF0C\u4E14 PostgreSQL metadata \u8207\u5176\u4E00\u81F4\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-law-source">\u95DC\u9589</button>
        </div>`)}};_e?.addEventListener("click",g=>{let j=g.target.closest('[data-action="jump-law-article"]');if(j){de(_e,j.dataset.jumpInput||"rag-law-article-jump");return}if(g.target.closest('[data-action="close-law-source"]')){_e.close();return}let E=_e.getBoundingClientRect();(g.clientX<E.left||g.clientX>E.right||g.clientY<E.top||g.clientY>E.bottom)&&_e.close()}),_e?.addEventListener("keydown",g=>{!g.target.matches(".law-jump-input")||g.key!=="Enter"||(g.preventDefault(),de(_e,g.target.id))}),$e?.addEventListener("click",g=>{let j=g.target.closest('[data-action="open-law-source"]');if(j){he(j.dataset.lawKey||"",j.dataset.sourceType||"",j.dataset.articleNo||"");return}if(g.target.closest('[data-action="close-parquet-judgment"]')){$e.close();return}let E=$e.getBoundingClientRect();(g.clientX<E.left||g.clientX>E.right||g.clientY<E.top||g.clientY>E.bottom)&&$e.close()}),X.addEventListener("click",g=>{let j=g.target.closest(".rag-process-toggle");if(j){let Y=j.closest(".rag-process"),fe=j.getAttribute("aria-expanded")==="true";$n(Y,!fe);return}let E=g.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(E){if(E.dataset.action==="open-law-source"){he(E.dataset.lawKey||"",E.dataset.sourceType||"",E.dataset.articleNo||"");return}W(E.dataset.jid||"")}}),X.addEventListener("keydown",g=>{if(g.key!=="Enter"&&g.key!==" ")return;let j=g.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(!(!j||j.closest("a, button"))){if(g.preventDefault(),j.dataset.action==="open-law-source"){he(j.dataset.lawKey||"",j.dataset.sourceType||"",j.dataset.articleNo||"");return}W(j.dataset.jid||"")}});let Ne=async(g,{fresh:j=!1,source:E="hero"}={})=>{let Y=g.trim();if(!Y){A("\u8ACB\u5148\u8F38\u5165\u554F\u984C\u3002","warn"),(E==="followup"?k:te).focus();return}(j||!v)&&(b=null,$=[],X.innerHTML="",Xe());let fe=++c,xe=()=>t||fe!==c,ze=o;u=Y,V(!0),F(),E==="followup"?(k.value="",ve()):(te.value="",D());let{answerElement:Ee}=Ue(Y,Gl(Y,f)),et=f?null:Ql(Ee);f?(wt(null),Ls()):(At(),wt(null)),qe(je,!0,"\u6AA2\u7D22\u4E2D\u2026"),qe(M,!0,"\u6AA2\u7D22\u4E2D\u2026");let rt=null,Oe="",ut=Fe=>{if(xe()||!Fe?.partial)return;let gt=Ee.querySelector(".answer-body");if(!gt)return;rt=Fe,Oe=String(Fe.answer||""),gt.innerHTML=ni(Fe),et?.collapse?.();let ht=Ee.querySelector(".answer-head-title");ht&&(ht.textContent=Fe.streaming?"LLM \u56DE\u7B54\u751F\u6210\u4E2D":"\u6CD5\u898F\u7D50\u679C\u5DF2\u986F\u793A")},Ce=Fe=>{if(xe()||!Fe||!rt?.streaming)return;Oe+=Fe;let gt=Ee.querySelector("[data-partial-answer]");gt&&(gt.textContent=Oe)},mt=()=>{if(xe()||!rt?.streaming)return;Oe="";let Fe=Ee.querySelector("[data-partial-answer]");Fe&&(Fe.textContent="\u6B63\u5728\u91CD\u65B0\u751F\u6210\u56DE\u7B54\u2026")};try{let Fe=f?await z.rag(Y,{testMode:f}):await z.ragStream(Y,{onStep:ht=>{xe()||et?.step(ht)},onPartial:ut,onToken:Ce,onTokenReset:mt});if(xe())return;At();let gt=et?.finish(!0)||"";if(Ee.innerHTML=ti(Y,Fe,gt),Fe.pipeline_flow||Dl(Fe).then(()=>{if(xe()||!Fe.pipeline_flow)return;let ht=Ee.querySelector(".answer-body");if(!ht||ht.querySelector(".rag-wf-card"))return;let St=ha(Fe.pipeline_flow,{serverDurationMs:Number(Fe.duration_ms)||0,embedded:!0});St&&ht.insertAdjacentHTML("beforeend",St)}),Fe.test_run?.run_id?await Js(Fe.test_run.run_id):wt(null),await Ie(Y,Fe,ze,fe),xe())return;Pe()}catch(Fe){if(xe())return;At();let gt=et?.finish(!1)||"";Ee.innerHTML=ec(Fe,gt),Pe(),A(Fe.message||"\u6AA2\u7D22\u5931\u6557\u3002","danger")}finally{xe()||(At(),qe(je,!1),qe(M,!1))}};oe.addEventListener("submit",g=>{g.preventDefault(),Ne(te.value,{fresh:!0,source:"hero"})}),P.addEventListener("submit",g=>{g.preventDefault(),Ne(k.value,{fresh:!1,source:"followup"})}),te.addEventListener("input",D),te.addEventListener("keydown",g=>{g.key==="Enter"&&!g.shiftKey&&!g.isComposing&&(g.preventDefault(),oe.requestSubmit())}),k.addEventListener("input",ve),k.addEventListener("keydown",g=>{g.key==="Enter"&&!g.shiftKey&&!g.isComposing&&(g.preventDefault(),P.requestSubmit())}),e.querySelector("#example-chips").addEventListener("click",g=>{let j=g.target.closest("[data-question]");j&&(te.value=j.dataset.question,D(),oe.requestSubmit())}),e.addEventListener("click",async g=>{let j=g.target.closest("[data-rag-model]");if(j){let E=j.dataset.ragProvider?Number(j.dataset.ragProvider):null;await xs(j.dataset.ragModel||"",Number.isFinite(E)?E:null);return}if(g.target.closest('[data-rag-action="refresh-rerank-models"]')){await ja();return}g.target.closest('[data-rag-action="refresh-chat-models"]')&&await zt()}),ee.addEventListener("click",async g=>{let j=g.target.closest("[data-rag-toggle]");if(j){let Ee=j.closest(".rag-library-section").classList.toggle("is-collapsed");j.setAttribute("aria-expanded",String(!Ee));return}let E=g.target.closest("[data-rag-action]"),Y=E?.dataset.ragAction||"";if(Y==="new-chat"){Ot();return}if(Y==="open-history-menu"){w(E,E.dataset.historyId);return}if(Y==="toggle-pin"){await qt(E.dataset.historyId);return}if(Y==="select-project"){Je(E.dataset.projectId||"");return}if(Y==="show-project-form"){cs();return}if(Y==="cancel-project"){ds();return}if(Y==="more-recent"){l+=12,Xe();return}if(Y==="clear-project"){Je("");return}let fe=g.target.closest("[data-history-open]");if(!fe)return;let xe=s.find(ze=>String(ze.id)===String(fe.dataset.historyId));xe&&(o=String(xe.project_id||""),Xe(),!ls(xe)&&(b=null,$=[],Ne(xe.title,{fresh:!0,source:"history"})))}),ee.addEventListener("submit",async g=>{let j=g.target.closest('[data-rag-form="project"]');j&&(g.preventDefault(),await Bt(j))}),ie.addEventListener("click",U),document.addEventListener("click",ne),document.addEventListener("keydown",Se),window.addEventListener("scroll",Te,{capture:!0,passive:!0}),window.addEventListener("resize",ge),G.addEventListener("click",async()=>{if(!s.length){A("\u76EE\u524D\u6C92\u6709\u53EF\u6E05\u9664\u7684\u63D0\u554F\u7D00\u9304\u3002","info");return}window.confirm("\u78BA\u5B9A\u6E05\u9664\u9019\u500B\u700F\u89BD\u5668\u7684\u6240\u6709\u63D0\u554F\u7D00\u9304\uFF1F")&&(await cr(),await ye(),A("\u5DF2\u6E05\u9664\u672C\u6A5F\u63D0\u554F\u7D00\u9304\u3002","ok"))}),D(),await Promise.allSettled([us(),ye(),Ss(),Ta()]),await m();let Ze="";try{Ze=window.sessionStorage.getItem("judgment.pending_question")||"",window.sessionStorage.removeItem("judgment.pending_question")}catch{Ze=""}return!Ze&&typeof window.__judgmentPendingQuestion=="string"&&(Ze=window.__judgmentPendingQuestion),delete window.__judgmentPendingQuestion,Ze=String(Ze||"").trim().slice(0,500),Ze&&te&&(te.value=Ze,D(),window.setTimeout(()=>{t||Ne(Ze,{fresh:!0,source:"home"})},40)),()=>{t=!0,At(),ge(),document.removeEventListener("click",ne),document.removeEventListener("keydown",Se),window.removeEventListener("scroll",Te,{capture:!0}),window.removeEventListener("resize",ge),document.documentElement.classList.remove("dialog-open"),window.removeEventListener("judgment:test-mode",Gs),u&&X.setAttribute("data-last-question",u)}}var An={};Ht(An,{render:()=>Yc});var _n=new Set(["legal_index_versions","judgment_import","index_versions"]),nc={running:{label:"\u57F7\u884C\u4E2D",tone:"info"},success:{label:"\u5B8C\u6210",tone:"ok"},partial:{label:"\u90E8\u5206\u5B8C\u6210",tone:"warn"},update:{label:"\u66F4\u65B0",tone:"warn"},failed:{label:"\u5931\u6557",tone:"danger"},interrupted:{label:"\u5DF2\u4E2D\u6B62",tone:"warn"},stale:{label:"\u72C0\u614B\u5931\u6548",tone:"warn"},skipped:{label:"\u7565\u904E",tone:"idle"},pending:{label:"\u7B49\u5F85",tone:"idle"},idle:{label:"\u5F85\u547D",tone:"idle"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},operational:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},unavailable:{label:"\u7121\u6CD5\u53D6\u5F97",tone:"danger"},missing:{label:"\u5C1A\u7121\u7D00\u9304",tone:"idle"},error:{label:"\u8B80\u53D6\u5931\u6557",tone:"danger"},ok:{label:"\u6B63\u5E38",tone:"ok"},provided:{label:"\u5916\u90E8\u63D0\u4F9B",tone:"info"}},rc=["download","parquet","postgres","qdrant"],ic={download:"\u4E0B\u8F09",parquet:"Parquet",postgres:"PostgreSQL",qdrant:"Qdrant"},ka={complete:"\u5B8C\u6210",incomplete:"\u672A\u5B8C\u6210",processing:"\u8655\u7406\u4E2D",empty:"\u7121\u8CC7\u6599",not_applicable:"\u5DF2\u53D6\u4EE3"},ui={complete:"is-green",incomplete:"is-red",processing:"is-gray",empty:"is-empty",not_applicable:"is-empty"};var kt=new Map,xt="",ws="",ri={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},ii={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},oc={judgment:"\u5224\u6C7A",law:"\u6CD5\u898F",order:"\u547D\u4EE4",system:"\u7CFB\u7D71"};var oi={law_download:"law",order_download:"order",judgment_download:"judgment"},li={law_download:"\u6CD5\u898F\u4E0B\u8F09",order_download:"\u547D\u4EE4\u4E0B\u8F09",judgment_download:"\u5224\u6C7A\u4E0B\u8F09"},lc={law_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",order_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u4E26\u6BD4\u5C0D\u55CE\uFF1F\u4E0B\u8F09\u5F8C\u6703\u5BEB\u5165\u539F\u59CB Parquet\uFF1B\u82E5\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u66F4\u65B0 PostgreSQL\u3002",judgment_download:"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u5224\u6C7A RAR \u55CE\uFF1F\uFF08\u4E0D\u6703\u81EA\u52D5\u532F\u5165 PostgreSQL \u6216\u5EFA\u7ACB Qdrant \u7D22\u5F15\uFF09"},cc={law_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u6CD5\u898F RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",order_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u4E0B\u8F09 ZIP \u2192 \u539F\u59CB Parquet\uFF1B\u5167\u5BB9\u6709\u8B8A\u66F4\u624D\u89E3\u6790\u689D\u6587\u4E26\u66F4\u65B0 PostgreSQL\u3002\u547D\u4EE4 RAG \u76F4\u63A5\u67E5\u8A62 PostgreSQL\uFF0C\u4E0D\u5BEB\u5165 Qdrant\uFF1BIndexedDB \u53EA\u4FDD\u5B58\u700F\u89BD\u5668\u63D0\u554F\u7D00\u9304\u3002",judgment_download:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u53EA\u4E0B\u8F09\u5224\u6C7A RAR\u3002PostgreSQL\uFF0FParquet \u532F\u5165\u8207 Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\u300C\u5224\u6C7A\u532F\u5165\u300D\u6216\u5B8C\u6574\u8CC7\u6599\u66F4\u65B0\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_import:"\u6D41\u7A0B\u7BC4\u570D\uFF1ARAR \u2192 \u539F\u59CB\u8CC7\u6599\u6AA2\u67E5\uFF0FParquet \u5099\u4EFD \u2192 \u91D1\u878D\u6CD5\u898F\u7BE9\u9078 \u2192 PostgreSQL\u3002Qdrant \u7D22\u5F15\u9700\u53E6\u57F7\u884C\uFF1BIndexedDB \u4E0D\u53C3\u8207\u8CC7\u6599\u7BA1\u7DDA\u3002",judgment_parquet:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5F9E PostgreSQL \u532F\u51FA\u67E5\u8A62\u7528 Parquet \u5FEB\u7167\uFF1B\u4E0D\u5BEB\u5165 Qdrant\uFF0FIndexedDB\u3002",index_versions:"\u6D41\u7A0B\u7BC4\u570D\uFF1A\u5EFA\u7ACB\u4E26\u9A57\u8B49\u65B0\u7684 Qdrant collection\uFF0C\u5B8C\u6210\u5F8C\u539F\u5B50\u5207\u63DB alias\uFF1BIndexedDB \u4E0D\u53C3\u8207\u3002"};function Sn(e){return nc[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function dt(e,t){let s=Sn(e);return`<span class="badge ${ri[s.tone]||ri.idle}"><span class="status-dot ${ii[s.tone]||ii.idle}"></span>${r(t||s.label)}</span>`}function It(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function ci(e){return e==null?"\u7121\u6CD5\u53D6\u5F97":d(e)}function Fs(e){return e&&e.color?String(e.color):"var(--accent)"}function dc(e,t=""){let s=e.percent===null||e.percent===void 0?null:Math.max(0,Math.min(100,Number(e.percent)||0)),a=e.status==="running"&&s===null,n=a?' aria-valuetext="\u9032\u5EA6\u672A\u77E5"':` aria-valuenow="${s??0}"`;return`<div class="processing-bar${a?" is-indeterminate":""}${t?` ${t}`:""}" role="progressbar" aria-valuemin="0" aria-valuemax="100"${n}>
    <span class="processing-bar-fill" style="width:${s??0}%;background:${r(Fs(e))}"></span>
  </div>`}function pi(e){let t=e.unit==="bytes"?"":e.unit||"\u7B46",s=e.current,a=e.total;return["skipped","pending","idle"].includes(e.status)?"\u2014":s==null?e.status==="running"?"\u9032\u884C\u4E2D":"\u2014":e.unit==="bytes"?a?`${Le(s)} / ${Le(a)}`:Le(s):a?`${d(s)} / ${d(a)} ${t}`:`${d(s)} ${t}`}function is(e,t,s="",a=""){return`<div class="processing-summary-card">
    <span class="processing-summary-label">${r(e)}</span>
    <span class="processing-summary-value">${t}</span>
    ${s?`<span class="processing-summary-hint">${s}</span>`:""}
    ${a}
  </div>`}function uc(e){let t=e.database||{},s=e.index||{},a=e.local_archives||{},n=e.raw_backups||{},i=n.totals||{},o=e.state||{},l=e.capabilities||{},u=e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D",c=t.status==="operational",b=s.status==="operational",$=a.available!==!1,v=n.available!==!1,f=b?`${d(s.indexed)} / ${d(s.total)}`:dt(s.status||"unavailable"),h=b?`${It(s.percent)} \xB7 \u5C1A\u9918 ${d(s.remaining)} \u7B46`:r(s.error||"\u7121\u6CD5\u67E5\u8A62 Qdrant \u7D22\u5F15\u8986\u84CB\u7387\u3002"),_=$?`${d(a.unprocessed)} / ${d(a.total)}`:dt("unavailable"),S=$?`\u672A\u8655\u7406 / \u5168\u90E8 \xB7 ${Le(a.unprocessed_bytes)} \u5F85\u8655\u7406`:r(a.error||"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304\u3002");return`<div class="processing-summary">
    ${is("\u8655\u7406\u72C0\u614B",dt(e.status||"unknown"),`${r(u)} \xB7 \u66F4\u65B0\u65BC <span data-processing-updated-at>\u2014</span>`)}
    ${is("\u672A\u8655\u7406\u58D3\u7E2E\u6A94",r(_),S)}
    ${is("\u539F\u59CB\u8CC7\u6599\u5099\u4EFD",v?`${d(n.count)} \u6A94`:dt("unavailable"),v?`\u5171 ${d(i.row_count)} \u7B46 \xB7 ${Le(i.compressed_bytes)}`:r(n.error||"\u7121\u6CD5\u6383\u63CF\u539F\u59CB\u8CC7\u6599\u5099\u4EFD\u3002"))}
    ${is("PostgreSQL \u5224\u6C7A",c?d(t.judgment_count):dt("unavailable"),c?`\u6CD5\u898F ${ci(t.law_count)} \xB7 \u547D\u4EE4 ${ci(t.order_count)}`:r(t.error||"\u7121\u6CD5\u67E5\u8A62 PostgreSQL\u3002"))}
    ${is("Qdrant \u7D22\u5F15",f,h)}
    ${is("\u72C0\u614B\u6A94",dt(o.status||"missing"),o.updated_at?`\u66F4\u65B0\u65BC ${r(Me(o.updated_at))}`:r(o.detail||"\u5C1A\u7121\u8655\u7406\u72C0\u614B\u7D00\u9304\u3002"))}
    ${is("\u5F85\u8655\u7406\u5DE5\u4F5C",l.can_start_update===!1?"\u66AB\u505C\u555F\u52D5":"\u53EF\u958B\u59CB\u66F4\u65B0",l.start_blocked_reason?r(l.start_blocked_reason):`\u672A\u8655\u7406 ${d(l.unprocessed_archives)} \u500B \xB7 \u7D22\u5F15\u5F85\u88DC ${d(l.index_backlog)} \u7B46${l.external_processes?` \xB7 \u5916\u90E8\u7A0B\u5E8F ${d(l.external_processes)} \u500B`:""}`)}
  </div>`}function pc(e){let t=e.timeline||{},s=Array.isArray(t.stages)?t.stages:[],a=`<div class="report-section-head">
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
    </section>`;let n=s.map(o=>`<span class="processing-stack-segment" style="width:${Math.max(0,Number(o.percent)||0)}%;background:${r(o.color||"var(--accent)")}" title="${r(`${o.label} ${be(o.duration_ms)} (${It(o.percent)})`)}"></span>`).join(""),i=s.map(o=>`<div class="processing-legend-item">
        <span class="processing-legend-swatch" style="background:${r(o.color||"var(--accent)")}"></span>
        <span class="processing-legend-label">${r(o.label)}</span>
        <span class="mono">${be(o.duration_ms)}</span>
        <span class="processing-legend-percent mono">${It(o.percent)}</span>
        ${dt(o.status)}
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
  </section>`}function mc(e){let t=Array.isArray(e.recent_runs)?e.recent_runs:[],s=new Map((e.branches||[]).map(i=>[i.key,i.label])),a=`<div class="report-section-head">
    <div>
      <div class="report-kicker">RECENT RUNS</div>
      <h2 class="report-section-title">\u6700\u8FD1\u8655\u7406\u7D00\u9304</h2>
      <p class="processing-section-sub">\u5305\u542B\u8CC7\u6599\u66F4\u65B0\u3001\u5224\u6C7A\u4E0B\u8F09\u3001\u5224\u6C7A\u532F\u5165\u3001Parquet\u3001Qdrant \u8207\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E0B\u8F09\u3002</p>
    </div>
  </div>`;if(!t.length)return`<section class="report-card processing-card">
      <div class="report-head">${a}</div>
      <div class="report-section"><div class="processing-empty">\u5C1A\u7121\u8655\u7406\u7D00\u9304\u3002</div></div>
    </section>`;let n=t.map(i=>{let o=s.get(i.branch)||oc[i.branch]||i.branch||"\u2014";return`<div class="processing-run">
        <div class="processing-run-head">
          <span class="badge badge-neutral">${r(o)}</span>
          <strong>${r(i.title||"\u8655\u7406")}</strong>
          ${dt(i.status)}
          <span class="grow"></span>
          <span class="mono faint">${r(Me(i.finished_at||i.started_at))}</span>
          <span class="mono">${i.duration_ms?be(i.duration_ms):"\u2014"}</span>
        </div>
        ${i.message?`<div class="processing-run-message">${r(i.message)}</div>`:""}
      </div>`}).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section"><div class="processing-run-list">${n}</div></div>
  </section>`}function gc(e){let t=Array.isArray(e.notices)?e.notices:[];return t.length?`<div class="processing-notices">${t.map(s=>Re({tone:s.tone||"info",title:s.title,text:r(s.message||"")})).join("")}</div>`:""}function fc(e,t){if(e==="law"||e==="order")return t==="qdrant"?"legal_index_versions":`${e}_download`;if(e==="judgment"){if(t==="download")return"judgment_download";if(t==="parquet"||t==="postgres")return"judgment_import";if(t==="qdrant")return"index_versions"}return""}function mi({month:e,year:t,monthNo:s,stageOrder:a,stageLabels:n,stageStatuses:i,overall:o,active:l,workflowForStage:u}){let c=i||{},b=String(e?.month||`${t}${String(s).padStart(2,"0")}`),$=e?.month_label||`${t}-${String(s).padStart(2,"0")}`,v=a.map(O=>`${n[O]||O}\uFF1A${ka[c[O]||"empty"]}`).join(" \xB7 "),f=(e?.versions||[]).map(O=>O.version_code).filter(Boolean),h=[...new Set([...e?.files||[],...e?.local_files||[],...e?.imported_files||[]])].filter(Boolean),_=f.length?` \xB7 \u7248\u672C ${f.join("\u3001")}`:h.length?` \xB7 ${h.join("\u3001")}`:"",S=e?`${$} \xB7 ${v}${_}`:`${$} \xB7 \u7121\u8CC7\u6599`,R=a.map(O=>{let I=c[O]||"empty",Q=I==="incomplete"?u(O):"",oe=Q?"button":"span",te=Q?` type="button" data-timeline-workflow="${r(Q)}"`:"";return`<${oe} class="processing-month-stage ${ui[I]||"is-empty"}${Q?" is-actionable":""}"${te} title="${r(`${n[O]||O}\uFF1A${ka[I]}${Q?"\uFF08\u9EDE\u9078\u524D\u5F80\u8655\u7406\uFF09":""}`)}" aria-label="${r(`${$} ${n[O]||O} ${ka[I]}${Q?"\uFF0C\u9EDE\u9078\u524D\u5F80\u8655\u7406":""}`)}"></${oe}>`}).join("");return`<td class="judgment-month import-month processing-month${l?" is-current":""} is-${r(o)}" data-month="${r(b)}" title="${r(S)}" aria-label="${r(S)}"${l?' aria-current="true"':""}>
    <span class="processing-month-number">${s}</span>
    <span class="processing-month-stages">${R}</span>
  </td>`}function bc(e,t,s,a){return mi({month:t,year:s,monthNo:a,stageOrder:rc,stageLabels:ic,stageStatuses:t?.stages||{},overall:t?.overall||"empty",active:!!t?.active,workflowForStage:n=>fc(e.key,n)})}function gi({activeMonth:e,activeArchive:t,activePhase:s="",processingMonth:a="",processingArchive:n="",stageLabels:i={}}){if(!e||!t)return"";let o=`${String(e).slice(0,4)}-${String(e).slice(4,6)}`,l=i[s]||(s?"\u6E96\u5099\u4E2D":""),u=`${String(a||"").slice(0,4)}-${String(a||"").slice(4,6)}`,c=!!a&&(a!==e||n!==t);return`<span class="badge badge-info">${p("activity",11)}\u76EE\u524D\u532F\u5165</span>
    <strong class="mono">${r(o)}</strong>
    <span class="mono">${r(t)}</span>
    ${l?`<span class="badge badge-neutral">${r(l)}</span>`:""}
    ${c?`<span class="processing-current-processing">
            <span class="faint">\u8655\u7406\u4E2D</span>
            <strong class="mono">${r(u)}</strong>
            <span class="mono">${r(n||"\u2014")}</span>
          </span>`:""}`}function vc(e,t,s,a){let n=Array.isArray(e.stage_order)&&e.stage_order.length?e.stage_order:["extract","raw_parquet","filter","postgres"],i=e.stage_labels||{extract:"RAR \u6AA2\u67E5\uFF0F\u89E3\u58D3\u7E2E",raw_parquet:"\u539F\u59CB\u8CC7\u6599\u6AA2\u67E5\uFF0FParquet \u5099\u4EFD",filter:"\u91D1\u878D\u6CD5\u898F\u7BE9\u9078",postgres:"PostgreSQL metadata"};return mi({month:t,year:s,monthNo:a,stageOrder:n,stageLabels:i,stageStatuses:t?.import_stages||{},overall:t?.import_overall||"empty",active:!!t?.active,workflowForStage:()=>"judgment_import"})}function hc(e,t,s){let a=[];for(let n=1;n<=12;n+=1){let i=`${t}${String(n).padStart(2,"0")}`;a.push(bc(e,s.get(i),t,n))}return`<tr><th scope="row">${t}</th>${a.join("")}</tr>`}function $c(e){let t=e?.models||{},s=[["Embedding",t.embedding],["Rerank",t.rerank]].filter(([,a])=>a&&(a.label||a.model)).map(([a,n])=>{let i=n.label||[n.host,n.model].filter(Boolean).join(" ")||"\u2014",o=[`${a} \u4E3B\u6A5F\u8207\u6A21\u578B\uFF1A${i}`,n.url?`\u7AEF\u9EDE\uFF1A${n.url}`:"",a==="Rerank"&&n.enabled===!1?"RAG_RERANK_ENABLED=false":""].filter(Boolean).join(" \xB7 ");return`<span class="processing-timeline-model" title="${r(o)}"><span>${a}</span><strong class="mono">${r(i)}</strong>${a==="Rerank"&&n.enabled===!1?"<em>\u672A\u555F\u7528</em>":""}</span>`});return s.length?`<span class="processing-timeline-models">${s.join("")}</span>`:""}function yc(e){let t=Array.isArray(e.file_timelines)?e.file_timelines:[];return t.length?`<div class="processing-timeline-overview">${t.map(s=>{let a=Array.isArray(s.months)?s.months:[],n=new Map(a.map(u=>[String(u.month||""),u])),i=[...new Set(a.map(u=>Number(u.year)))].filter(u=>Number.isFinite(u)).sort((u,c)=>c-u),o=s.summary||{},l=s.current||null;return`<section class="report-card processing-card import-files-card processing-timeline-card" data-processing-timeline="${r(s.key||"")}">
        <div class="side-card-head">
          <span class="processing-timeline-head-main">
            <span class="side-card-title">${p(s.icon||"activity",14)}${r(s.title||`${s.label||""}\u8655\u7406\u6642\u9593\u8868`)}</span>
            ${$c(s)}
          </span>
          <span class="badge badge-neutral">${d(s.total_months||0)} \u500B\u6708</span>
        </div>
        <div class="judgment-months index-months">
          <div class="judgment-months-meta">
            <span class="badge badge-ok">\u5B8C\u6210 ${d(o.complete||0)}</span>
            <span class="badge badge-danger">\u672A\u5B8C\u6210 ${d(o.incomplete||0)}</span>
            <span class="badge badge-neutral">\u8655\u7406\u4E2D ${d(o.processing||0)}</span>
            <span class="badge badge-info">\u6709\u66F4\u65B0 ${d(o.update||0)}</span>
            <span class="muted">\u5171 ${d(s.total_months||0)} \u500B\u6708</span>
          </div>
          ${l?`<div class="index-current-row">
                  <span class="badge badge-info">${p("activity",11)}${r(l.label||"\u76EE\u524D")}</span>
                  <strong class="mono">${r(l.month_label||"\u2014")}</strong>
                  <span class="mono">${r(l.file||"\u2014")}</span>
                  ${l.detail?`<span class="muted">${r(l.detail)}</span>`:""}
                </div>`:""}
          ${a.length?`<div class="judgment-months-scroll">
                  <table class="judgment-months-table import-months-table processing-months-table">
                    <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(u,c)=>`<th scope="col">${c+1}</th>`).join("")}</tr></thead>
                    <tbody>${i.map(u=>hc(s,u,n)).join("")}</tbody>
                  </table>
                </div>`:'<div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u3002</div>'}
          <div class="processing-timeline-key">
            ${["complete","incomplete","processing","empty"].map(u=>`<span><i class="processing-timeline-swatch ${ui[u]}"></i>${ka[u]}</span>`).join("")}
            <span class="processing-timeline-key-order">\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\uFF1A\u4E0B\u8F09\uFF0FParquet\uFF0FPostgreSQL\uFF0FQdrant</span>
          </div>
          <p class="judgment-months-hint">${s.key==="judgment"?"\u5224\u6C7A\u4EE5\u88C1\u5224\u66F8\u6708\u4EFD\u986F\u793A\u3002":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u4EE5\u4F86\u6E90\u7248\u672C\u6708\u4EFD\u986F\u793A\u3002"}\u7DA0\u8272\uFF1A\u5B8C\u6210\uFF1B\u7D05\u8272\uFF1A\u672A\u5B8C\u6210\uFF1B\u7070\u8272\uFF1A\u8655\u7406\u4E2D\uFF1B\u7A7A\u767D\uFF1A\u7121\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u6216\u8272\u584A\u53EF\u67E5\u770B\u5404\u968E\u6BB5\u72C0\u614B\u3002</p>
        </div>
      </section>`}).join("")}</div>`:'<div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u8655\u7406\u6642\u9593\u8868\u3002</div>'}function di(e,t=new Set){return`${gc(e)}
    ${uc(e)}
    ${yc(e)}
    ${pc(e)}
    ${mc(e)}`}function wc(e,t){return`<div class="report-card processing-card">
    <div class="report-section">
      ${Re({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B",text:r(e||"\u672A\u77E5\u932F\u8AA4")})}
      ${t?`<p class="processing-section-sub">\u4E0A\u6B21\u6210\u529F\u66F4\u65B0\uFF1A${r(Me(t.generated_at))}\u3002\u756B\u9762\u4E0A\u6C92\u6709\u986F\u793A\u66FF\u4EE3\u6216\u63A8\u6E2C\u7684\u9032\u5EA6\u3002</p>`:""}
      <div class="processing-error-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh">
          ${p("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
  </div>`}function _c(e,t){if(e.nodeType!==t.nodeType||e.nodeName!==t.nodeName){e.replaceWith(t.cloneNode(!0));return}if(e.nodeType===Node.TEXT_NODE){e.nodeValue!==t.nodeValue&&(e.nodeValue=t.nodeValue);return}if(e.nodeType===Node.ELEMENT_NODE){for(let s of[...e.attributes])t.hasAttribute(s.name)||e.removeAttribute(s.name);for(let s of[...t.attributes])e.getAttribute(s.name)!==s.value&&e.setAttribute(s.name,s.value);t.hasAttribute("data-preserve-children")||fi(e,t)}}function fi(e,t){let s=[...e.childNodes],a=[...t.childNodes],n=Math.min(s.length,a.length);for(let i=0;i<n;i+=1)_c(s[i],a[i]);for(let i=n;i<s.length;i+=1)s[i].remove();for(let i=n;i<a.length;i+=1)e.appendChild(a[i].cloneNode(!0))}function es(e,t){let s=document.createElement("template");s.innerHTML=t,fi(e,s.content)}var bi={overview:"activity",law_download:"layers",order_download:"file",judgment_download:"download",judgment_import:"database",judgment_parquet:"cube",index_versions:"brain",normalize_courts:"filter",backfill_law_articles:"history"};function kc(e){let s=(Array.isArray(e.workflows)?e.workflows:[]).map(n=>{let i=n.active_run||null,o=i||n.last_run||null;return{...n,activeRun:i,lastRun:o,status:i?i.status||"running":n.update_available?"update":o?.status||"idle"}}),a=s.find(n=>n.id==="judgment_parquet");return[{id:"overview",label:"\u8655\u7406\u7E3D\u89BD",description:"\u76EE\u524D\u6D41\u7A0B\u3001\u58D3\u7E2E\u6A94\u8207\u6700\u8FD1\u57F7\u884C\u7D00\u9304",status:e.status||"idle",activeRun:null,lastRun:null},...s.filter(n=>n.id!=="judgment_parquet"),...a?[a]:[]]}function wn(e,t){let s=kc(e),a=new Set(["law_download","judgment_download","normalize_courts"]);return`<div class="status-sidebar-head">
      <div class="eyebrow">DATA WORKFLOWS</div>
      <div class="status-sidebar-title">\u8CC7\u6599\u6D41\u7A0B</div>
    </div>
    <nav class="status-tab-list" aria-label="\u8CC7\u6599\u8655\u7406\u5DE5\u4F5C\u6D41\u7A0B">
      ${s.map(n=>{let i=n.id===t,o=bi[n.id]||"terminal";return`${a.has(n.id)?'<div class="status-tab-divider" role="separator" aria-hidden="true"></div>':""}<button class="status-tab${i?" is-active":""}" type="button"
            data-processing-workflow="${r(n.id)}"
            ${i?'aria-current="page"':""}>
            <span class="status-tab-icon">${p(o,15)}</span>
            <span class="status-tab-copy">
              <strong>${r(n.label)}</strong>
              <small>${r(n.description||"")}</small>
            </span>
            ${dt(n.status)}
          </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u57F7\u884C\u6A21\u5F0F</span>
      <span class="mono">${r(e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D")}</span>
    </div>`}function Sc(e){if(!e)return'<div class="processing-workflow-empty">\u5C1A\u672A\u57F7\u884C\u3002\u6309\u4E0B\u53F3\u5074\u6309\u9215\u958B\u59CB\u3002</div>';let t=e.meta||{};return`<div class="processing-workflow-run">
    <div class="processing-workflow-run-head">
      ${dt(e.status)}
      <span class="mono">${r(e.id||"\u2014")}</span>
    </div>
    <div class="processing-workflow-run-grid">
      <span>\u958B\u59CB</span><strong>${r(Me(e.started_at))}</strong>
      <span>\u8017\u6642</span><strong>${be(e.duration_ms)}</strong>
      <span>\u8A0A\u606F</span><strong>${r(e.message||"\u2014")}</strong>
      ${t.log_path?`<span>\u65E5\u8A8C</span><strong class="mono">${r(t.log_path)}</strong>`:""}
    </div>
  </div>`}function zs(e){return`${e.year}-${String(e.month_no).padStart(2,"0")}`}function vi(e){let t={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"},s=e.status||"red";return[zs(e),t[s]||s,e.latest_fileset_id?`fileset ${e.latest_fileset_id}`:"",e.filename||"",e.local_filename&&e.local_filename!==e.filename?`\u672C\u6A5F\uFF1A${e.local_filename}`:""].filter(Boolean).join(" \xB7 ")}function hi(e){if(!e.download_url)return"";let t=zs(e);return`<a class="judgment-month-download" href="${r(ft(e.download_url))}" target="_blank" rel="noreferrer" title="\u4E0B\u8F09 ${t} \u5224\u6C7A" aria-label="\u4E0B\u8F09 ${t} \u5224\u6C7A">${p("download",11)}</a>`}function xc(e){let t=e.status||"red";return`<td class="judgment-month is-${r(t)}" data-judgment-month-key="${r(zs(e))}" title="${r(vi(e))}"><span>${e.month_no}</span>${hi(e)}</td>`}function qc(e){return e?.off_hours_enabled===!0}function $i(e){return`\u7DA0\u8272\uFF1A\u6700\u65B0\u7248\u5DF2\u4E0B\u8F09\u5230 raw_rar\uFF1B\u7070\u8272\uFF1A\u672C\u6A5F\u4ECD\u662F\u820A\u7248\uFF0C\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u6703\u66F4\u65B0\uFF1B\u7D05\u8272\uFF1A\u8A72\u6708\u4EFD\u7F3A\u5C11\u5224\u6C7A\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u958B\u555F\u4E0B\u8F09\u9023\u7D50\uFF08${qc(e)?"\u975E API \u6642\u6BB5\u4E5F\u53EF\u4E0B\u8F09\uFF0C\u5EFA\u8B70\u4E00\u6B21\u53EA\u4E0B\u8F09\u4E00\u500B\u6A94\u6848":"\u4E0B\u8F09\u9023\u7D50\u50C5\u5728 00:00\u201306:00 API \u6642\u6BB5\u53EF\u7528"}\uFF09\u3002\u5F85\u88DC\u9F4A\u6708\u4EFD\u6703\u512A\u5148\u4E0B\u8F09\uFF0C\u5168\u90E8\u88DC\u9F4A\u5F8C\u624D\u7531\u6700\u65B0\u6708\u4EFD\u5F80\u56DE\u9A57\u8B49\u65E2\u6709\u6A94\u6848\uFF1B\u4E2D\u65B7\u7684\u4E0B\u8F09\u6703\u4FDD\u7559 .part\uFF0C\u4F3A\u670D\u5668\u652F\u63F4 Range \u6642\u7E8C\u50B3\uFF0C\u5426\u5247\u5F9E\u96F6\u91CD\u65B0\u4E0B\u8F09\u3002\u9996\u6B21\u5B8C\u6574\u540C\u6B65\u53EF\u80FD\u9700\u4E0B\u8F09\u6578\u767E\u500B\u6708\u4EFD\uFF0C\u9810\u8A2D\u975E\u6642\u6BB5\u4E5F\u53EF\u7E8C\u50B3\uFF1B\u56B4\u683C\u6A21\u5F0F\u6703\u5728 00:00\u201306:00 \u4EE5\u5916\u505C\u6B62\u3002`}var Ac={completed:"\u5B8C\u6210",window_closed:"API \u6642\u6BB5\u7D50\u675F",deadline:"\u63A5\u8FD1 06:00\uFF0C\u4FDD\u7559\u5F85\u4E0B\u8F09\u6708\u4EFD",verification_window_closed:"API \u6642\u6BB5\u7D50\u675F\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",verification_deadline:"\u63A5\u8FD1 06:00\uFF0C\u9A57\u8B49\u9032\u5EA6\u5DF2\u4FDD\u7559",errors:"\u90E8\u5206\u6708\u4EFD\u4E0B\u8F09\u5931\u6557\uFF0C\u4E0B\u6B21\u91CD\u8A66",pending:"\u4ECD\u6709\u5F85\u4E0B\u8F09\u6708\u4EFD",check_only:"\u50C5\u6AA2\u67E5\uFF0C\u672A\u4E0B\u8F09",incremental:"\u589E\u91CF\u6AA2\u67E5\u5B8C\u6210",status_only:"\u50C5\u66F4\u65B0\u6708\u4EFD\u72C0\u614B",running:"\u57F7\u884C\u4E2D"};function yi(e){let t=e?.backfill||{},s=t.verification||{},a=t.last_run||{},n=Number(t.pending_count)||0,i=Number(t.failure_count)||0,o=String(t.resume_from_month||""),l="\u9A57\u8B49\uFF1A\u672A\u958B\u59CB";s.status==="completed"?l="\u9A57\u8B49\u5B8C\u6210":s.next_month?l=`\u9A57\u8B49\u7E8C\u50B3 ${s.next_month}`:s.status==="in_progress"&&(l="\u9A57\u8B49\u9032\u884C\u4E2D");let u=String(a.stop_reason||""),c=u?`\u4E0A\u6B21\u505C\u6B62\uFF1A${Ac[u]||u}`:"";return{pending:n,failures:i,resume:o,verificationText:l,lastText:c}}function Lc(e){let t=yi(e),s=t.pending>0?`\u5F85\u88DC\u9F4A ${d(t.pending)} \u500B\u6708${t.failures>0?`\uFF08${d(t.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708";return`<div class="judgment-backfill" data-judgment-backfill>
    <span class="badge ${t.pending>0?"badge-danger":"badge-ok"}" data-judgment-backfill-pending>${s}</span>
    <span class="badge badge-neutral" data-judgment-backfill-resume ${t.resume&&t.pending>0?"":"hidden"}>\u5F9E ${r(t.resume)} \u7E8C\u50B3</span>
    <span class="badge badge-info" data-judgment-backfill-verification>${r(t.verificationText)}</span>
    <span class="muted" data-judgment-backfill-last ${t.lastText?"":"hidden"}>${r(t.lastText)}</span>
  </div>`}function Mc(e,t){let s=yi(t),a=e.querySelector("[data-judgment-backfill-pending]");a&&(a.textContent=s.pending>0?`\u5F85\u88DC\u9F4A ${d(s.pending)} \u500B\u6708${s.failures>0?`\uFF08${d(s.failures)} \u500B\u5931\u6557\uFF09`:""}`:"\u5F85\u88DC\u9F4A 0 \u500B\u6708",a.classList.toggle("badge-danger",s.pending>0),a.classList.toggle("badge-ok",s.pending===0));let n=e.querySelector("[data-judgment-backfill-resume]");if(n){let l=!!s.resume&&s.pending>0;n.hidden=!l,n.textContent=l?`\u5F9E ${s.resume} \u7E8C\u50B3`:""}let i=e.querySelector("[data-judgment-backfill-verification]");i&&(i.textContent=s.verificationText);let o=e.querySelector("[data-judgment-backfill-last]");o&&(o.hidden=!s.lastText,o.textContent=s.lastText)}function xn(){return'<div class="judgment-months-loading"><span class="spinner"></span><span>\u8B80\u53D6\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B\u2026</span></div>'}function jc(e){if(e?.loading&&!e?.months?.length)return xn();if(e?.error&&!e?.months?.length)return Re({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:r(e.error)});let t=Array.isArray(e?.months)?e.months:[];if(!t.length)return'<div class="processing-empty">\u5C1A\u672A\u6709\u6708\u4EFD\u72C0\u614B\uFF1B\u8ACB\u5148\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u3002</div>';let s=new Map(t.map(o=>[zs(o),o])),n=[...new Set(t.map(o=>o.year))].sort((o,l)=>l-o).map(o=>{let l=Array.from({length:12},(u,c)=>{let b=s.get(`${o}-${String(c+1).padStart(2,"0")}`);return b?xc(b):`<td class="judgment-month is-empty"><span>${c+1}</span></td>`}).join("");return`<tr><th scope="row">${o}</th>${l}</tr>`}).join(""),i=e.summary||{};return`<div class="judgment-months">
    <div class="judgment-months-meta">
      <span class="badge badge-ok" data-judgment-summary="green">\u6700\u65B0\u7248 ${d(i.green||0)}</span>
      <span class="badge badge-neutral" data-judgment-summary="gray">\u820A\u7248 ${d(i.gray||0)}</span>
      <span class="badge badge-danger" data-judgment-summary="red">\u7F3A\u5931 ${d(i.red||0)}</span>
      <span class="muted" data-judgment-total>\u5171 ${d(e.total_months||t.length)} \u500B\u6708</span>
    </div>
    ${Lc(e)}
    <div class="judgment-months-scroll">
      <table class="judgment-months-table">
        <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(o,l)=>`<th scope="col">${l+1}</th>`).join("")}</tr></thead>
        <tbody>${n}</tbody>
      </table>
    </div>
    <p class="judgment-months-hint" data-judgment-hint>${r($i(e))}</p>
  </div>`}function Tc(e,t){let s=Array.isArray(t?.months)?t.months:[],a=t.summary||{},n={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"};e.querySelectorAll("[data-judgment-summary]").forEach(l=>{let u=l.dataset.judgmentSummary||"";l.textContent=`${n[u]||u} ${d(a[u]||0)}`});let i=e.querySelector("[data-judgment-total]");i&&(i.textContent=`\u5171 ${d(t.total_months||s.length)} \u500B\u6708`),Mc(e,t);let o=e.querySelector("[data-judgment-hint]");if(o){let l=$i(t);o.textContent!==l&&(o.textContent=l)}for(let l of s){let u=zs(l),c=e.querySelector(`[data-judgment-month-key="${u}"]`);if(!c)continue;let b=l.status||"red";c.classList.contains(`is-${b}`)||(c.classList.remove("is-green","is-gray","is-red","is-empty"),c.classList.add(`is-${b}`));let $=vi(l);c.title!==$&&(c.title=$);let v=c.querySelector(".judgment-month-download");if(l.download_url){let f=ft(l.download_url);v?v.getAttribute("href")!==f&&(v.href=f):c.insertAdjacentHTML("beforeend",hi(l))}else v&&v.remove()}}function Nc(e){let t=Array.isArray(e)?e:[];return t.length?`<div class="processing-workflow-history">
    ${t.map(s=>`<div class="processing-workflow-history-row">
          <span class="processing-workflow-history-status">${dt(s.status||"idle")}</span>
          <span class="mono">${r(Me(s.started_at))}</span>
          <span class="mono">${r(be(s.duration_ms||0))}</span>
          <span class="processing-workflow-history-message">${r(s.message||"\u2014")}</span>
        </div>`).join("")}
  </div>`:'<div class="processing-workflow-empty">\u5C1A\u7121\u57F7\u884C\u7D00\u9304\u3002</div>'}function Ec(e){let t=Array.isArray(e.update_history)?e.update_history:[];if(!t.length)return'<div class="processing-workflow-empty">\u5C1A\u7121\u7248\u672C\u6AA2\u67E5\u7D00\u9304\u3002</div>';let s={up_to_date:["\u5DF2\u662F\u6700\u65B0","badge-ok"],update_available:["\u6709\u66F4\u65B0","badge-warn"],error:["\u6AA2\u67E5\u5931\u6557","badge-danger"]};return`<div class="processing-workflow-history">
    ${t.map(a=>{let[n,i]=s[a.status]||[a.status||"\u672A\u77E5","badge-neutral"],o=a.remote_content_length!=null?Le(a.remote_content_length):"\u2014",l=a.local_version_id?`v${a.local_version_id}`:"\u2014";return`<div class="processing-workflow-history-row">
          <span class="badge ${i}">${r(n)}</span>
          <span class="mono">${r(Me(a.checked_at))}</span>
          <span class="mono">\u9060\u7AEF ${r(o)}</span>
          <span class="mono">\u672C\u5730 ${r(l)}</span>
          <span class="processing-workflow-history-message">${r(a.message||"\u2014")}</span>
        </div>`}).join("")}
  </div>`}function kn(e){let t=String(e.key||""),s=Sn(e.status);return[`data-stage-key="${r(t)}"`,`data-stage-label="${r(e.label||t)}"`,`data-stage-color="${r(Fs(e))}"`,`data-stage-status-key="${r(e.status||"idle")}"`,`data-stage-status="${r(s.label)}"`,`data-stage-percent="${r(It(e.percent))}"`,`data-stage-counts="${r(pi(e))}"`,`data-stage-duration="${r(be(e.duration_ms||0))}"`,`data-stage-contribution="${r(It(e.contribution_percent))}"`,`data-stage-message="${r(e.message||"")}"`].join(" ")}function Cc(e){let t=String(e.status||"idle");if(t!=="failed")return dt(t);let s=String(e.error||e.message||"\u968E\u6BB5\u57F7\u884C\u5931\u6557\u3002").trim(),a=String(e.resolution||"\u67E5\u770B .run \u76EE\u9304\u4E2D\u7684\u6700\u65B0\u65E5\u8A8C\u53D6\u5F97\u5B8C\u6574 traceback\uFF0C\u4FEE\u6B63\u5F8C\u91CD\u65B0\u57F7\u884C\u6B64\u6D41\u7A0B\u3002").trim(),n=`\u539F\u56E0\uFF1A${s}
\u5EFA\u8B70\uFF1A${a}`;return`<span class="badge badge-danger is-failure-tip" tabindex="0" aria-label="${r(n)}" data-failure-tip="${r(n)}"><span class="status-dot is-danger"></span>\u5931\u6557</span>`}function Rc(e){return`<div class="processing-workflow-stage${String(e.status||"idle")==="running"?" is-running":""}" style="--stage-color:${r(Fs(e))}" ${kn(e)}>
    <div class="processing-workflow-stage-head">
      <span class="processing-workflow-stage-swatch"></span>
      <span class="processing-workflow-stage-label">${r(e.label||e.key||"\u968E\u6BB5")}</span>
      ${Cc(e)}
      <span class="processing-workflow-stage-percent mono">${It(e.percent)}</span>
    </div>
    ${dc(e)}
    <div class="processing-workflow-stage-meta">
      <span>${r(pi(e))}</span>
      <span class="mono">${be(e.duration_ms||0)}</span>
      <span class="processing-workflow-stage-message">${r(e.message||"\u2014")}</span>
    </div>
  </div>`}function Pc(e){if(xt===e.id)return"";let t=e.progress||{},s=Array.isArray(t.stages)?t.stages:[];if(!s.length)return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
      <div class="side-card-head">
        <span class="side-card-title">${p("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C\u6B64\u6D41\u7A0B\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A\u5404\u968E\u6BB5\u8207\u6574\u9AD4\u9032\u5EA6\u3002</div>
    </section>`;let a=t.overall_percent,i=s.filter(v=>v.status!=="skipped").filter(v=>Number(v.contribution_percent)>0).map(v=>`<span class="processing-workflow-progress-segment" style="width:${Number(v.contribution_percent)||0}%;background:${r(Fs(v))}" ${kn(v)}></span>`).join(""),o=s.map(v=>`<div class="processing-workflow-progress-legend-item${v.status==="skipped"?" is-skipped":""}" ${kn(v)}>
        <span class="processing-workflow-progress-swatch" style="background:${r(Fs(v))}"></span>
        <span class="processing-workflow-progress-legend-label">${r(v.label||v.key||"\u968E\u6BB5")}</span>
        <span class="mono">${It(v.percent)}</span>
      </div>`).join(""),l=Number(t.completed_stages)||0,u=Number(t.total_stages)||0,c=s.filter(v=>v.status==="skipped").length,b=c?`\u5B8C\u6210 ${l} \xB7 \u7565\u904E ${c}`:`${l} / ${u} \u968E\u6BB5`,$=cc[e.id]||"";return`<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
    <div class="side-card-head">
      <span class="side-card-title">${p("activity",14)}\u6D41\u7A0B\u9032\u5EA6</span>
      <span class="badge ${t.run_status==="running"?"badge-info":"badge-neutral"}">${b}</span>
    </div>
    <div class="processing-workflow-stage-list">${s.map(Rc).join("")}</div>
    <div class="processing-workflow-overall">
      <div class="processing-workflow-overall-head">
        <span>\u6574\u9AD4\u9032\u5EA6</span>
        <span class="mono">${It(a)}</span>
      </div>
      <div class="processing-workflow-progress-stack" role="img" aria-label="\u5404\u968E\u6BB5\u9032\u5EA6\u52A0\u7E3D">${i||'<span class="processing-workflow-progress-empty">\u5C1A\u7121\u53EF\u8A08\u7B97\u9032\u5EA6</span>'}</div>
      <div class="processing-workflow-progress-legend">${o}</div>
      <div class="processing-workflow-progress-hint">\u5C07\u6ED1\u9F20\u79FB\u5230\u4EFB\u4E00\u968E\u6BB5\u6216\u8272\u584A\uFF0C\u53EA\u6703\u4FDD\u7559\u8A72\u9805\u76EE\u4E26\u986F\u793A\u8AAA\u660E\uFF1B\u7565\u904E\u968E\u6BB5\u4E0D\u5217\u5165\u6574\u9AD4\u9032\u5EA6\u3002</div>
    </div>
    ${$?`<p class="processing-workflow-scope-note">${p("info",12)}<span>${r($)}</span></p>`:""}
  </section>`}function Ic(e){let t=String(e||"");return t.length===6?`${t.slice(0,4)}-${t.slice(4)}`:t||"\u2014"}function Bc(e,t){let s={primary:"\u4E3B\u8981",fallback:"\u5099\u63F4",provided:"\u5916\u90E8"},a=Array.isArray(e.models)?e.models:[],n=a.length?a.join("\u3001"):"\u2014";return`<div class="index-host-row${e.url&&e.url===t?" is-selected":""}">
    <div class="index-host-head">
      <span class="badge badge-neutral">${r(s[e.role]||e.role||"\u4E3B\u6A5F")}</span>
      <strong class="mono">${r(e.host||"\u2014")}:${r(e.port??"\u2014")}</strong>
      ${dt(e.status||"unavailable")}
      <span class="index-host-model">${r(e.model||"\u2014")}</span>
    </div>
    <div class="index-host-url mono">${r(e.url||"\u2014")}</div>
    <div class="index-host-models" title="${r(n)}">\u6A21\u578B\uFF1A${r(n)}</div>
    ${e.detail?`<div class="index-host-detail">${r(e.detail)}</div>`:""}
  </div>`}function Oc(e){let t=Array.isArray(e.months)?e.months:[],s=e.current||{},a=new Map;for(let l of t){let u=String(l.month||"");if(!/^\d{6}$/.test(u))continue;let c=Number(u.slice(4,6));if(c<1||c>12)continue;let b=a.get(u);b||(b={key:u,year:u.slice(0,4),monthNo:c,total:0,processed:0,reused:0,embedded:0,archives:[],current:!1,jid:""},a.set(u,b)),b.total+=Number(l.total)||0,b.processed+=Number(l.processed)||0,b.reused+=Number(l.reused)||0,b.embedded+=Number(l.embedded)||0,l.archive&&b.archives.push(String(l.archive)),s.month===u&&(!s.archive||s.archive===l.archive)&&(b.current=!0,b.jid=String(s.jid||""))}if(!a.size)return'<div class="processing-workflow-empty">\u5C1A\u7121\u53EF\u986F\u793A\u7684\u7D22\u5F15\u6708\u4EFD\uFF1B\u958B\u59CB\u7D22\u5F15\u5F8C\u6703\u4F9D\u6642\u9593\u5217\u51FA\u6708\u4EFD\u72C0\u614B\u3002</div>';let n={green:0,red:0,gray:0};for(let l of a.values())l.total>0&&l.processed>=l.total?(l.status="green",n.green+=1):l.processed>0?(l.status="red",n.red+=1):(l.status="gray",n.gray+=1);let o=[...new Set([...a.values()].map(l=>l.year))].sort((l,u)=>u.localeCompare(l)).map(l=>{let u=Array.from({length:12},(c,b)=>{let $=b+1,v=`${l}${String($).padStart(2,"0")}`,f=a.get(v);if(!f)return`<td class="judgment-month is-empty"><span>${$}</span></td>`;let h=f.total?`${Math.min(100,Math.round(f.processed/f.total*1e3)/10)}%`:"\u2014",_=f.current&&e.run_status==="running",S=[`${f.year}-${String(f.monthNo).padStart(2,"0")}`,f.archives.join("\u3001")||"\u2014",`\u5DF2\u8655\u7406 ${d(f.processed)} / ${d(f.total)}\uFF08${h}\uFF09`,`\u91CD\u7528 ${d(f.reused)} \xB7 \u65B0 embedding ${d(f.embedded)}`,f.current?`${_?"\u76EE\u524D\u7D22\u5F15":"\u6700\u5F8C\u7D22\u5F15"}${f.jid?` \xB7 ${f.jid}`:""}`:""].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month index-month is-${f.status}${_?" is-active":""}" title="${r(S)}"${_?' aria-current="true"':""}><span>${$}</span></td>`}).join("");return`<tr><th scope="row">${r(l)}</th>${u}</tr>`}).join("");return`<div class="judgment-months index-months">
    <div class="judgment-months-meta">
      <span class="badge badge-ok">\u5B8C\u6210 ${d(n.green)}</span>
      <span class="badge badge-danger">\u672A\u5B8C\u6210 ${d(n.red)}</span>
      <span class="badge badge-neutral">\u5F85\u7D22\u5F15 ${d(n.gray)}</span>
      <span class="muted">\u5171 ${d(a.size)} \u500B\u6708</span>
    </div>
    <div class="judgment-months-scroll">
      <table class="judgment-months-table index-months-table">
        <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(l,u)=>`<th scope="col">${u+1}</th>`).join("")}</tr></thead>
        <tbody>${o}</tbody>
      </table>
    </div>
    <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u7D22\u5F15\u5B8C\u6210\uFF1B\u7070\u8272\uFF1A\u65B0\u6A94\uFF0F\u5C1A\u672A\u7D22\u5F15\uFF1B\u7D05\u8272\uFF1A\u5DF2\u958B\u59CB\u4F46\u672A\u5B8C\u6210\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u4F86\u6E90\u6A94\u6848\u3001\u5DF2\u8655\u7406\u7B46\u6578\u8207\u76EE\u524D\u6848\u865F\u3002</p>
  </div>`}function Dc(e){let t=e.import_timeline||{},s=Array.isArray(t.months)?t.months:[];if(!s.length)return`<section class="report-card processing-card import-files-card">
      <div class="side-card-head">
        <span class="side-card-title">${p("table",14)}\u532F\u5165\u6A94\u6848\u6642\u9593\u8868</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u5C1A\u672A\u53D6\u5F97\u5224\u6C7A\u4E0B\u8F09 manifest \u6216\u672C\u6A5F\u58D3\u7E2E\u6A94\uFF1B\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u5F8C\u6703\u986F\u793A\u6708\u4EFD\u72C0\u614B\u3002</div>
    </section>`;let a=new Map(s.map($=>[String($.month),$])),n=[...new Set(s.map($=>$.year))].sort(($,v)=>v-$),i=s.find($=>$.active),o=t.stage_summary||{},l=n.map($=>{let v=Array.from({length:12},(f,h)=>{let _=h+1,S=`${$}${String(_).padStart(2,"0")}`;return vc(t,a.get(S),$,_)}).join("");return`<tr><th scope="row">${r($)}</th>${v}</tr>`}).join(""),u=t.summary||{},c=t.stage_labels||{},b=i?`<div class="index-current-row">${gi({activeMonth:t.active_month||String(i.month||""),activeArchive:t.active_archive||i.active_archive||"",activePhase:t.active_phase||"",processingMonth:t.processing_month||"",processingArchive:t.processing_archive||"",stageLabels:c})}</div>`:"";return`<section class="report-card processing-card import-files-card" data-import-timeline="judgment">
    <div class="side-card-head">
      <span class="side-card-title">${p("table",14)}\u532F\u5165\u6A94\u6848\u6642\u9593\u8868</span>
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
      ${b}
      <div class="judgment-months-scroll">
        <table class="judgment-months-table import-months-table processing-months-table">
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},($,v)=>`<th scope="col">${v+1}</th>`).join("")}</tr></thead>
          <tbody>${l}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u6BCF\u683C\u7531\u5DE6\u81F3\u53F3\uFF1ARAR \u6AA2\u67E5\uFF0F\u89E3\u58D3\u7E2E\u3001\u539F\u59CB\u8CC7\u6599\u6AA2\u67E5\uFF0FParquet \u5099\u4EFD\u3001\u91D1\u878D\u6CD5\u898F\u7BE9\u9078\u3001PostgreSQL metadata\u3002\u539F\u59CB\u8CC7\u6599\u968E\u6BB5\u6703\u5148\u6AA2\u67E5\u65E2\u6709 Parquet\uFF0C\u53EF\u6CBF\u7528\u6642\u4E0D\u91CD\u65B0\u5099\u4EFD\uFF1B\u7F3A\u5C11\u6642\u6703\u986F\u793A\u300C\u5EFA\u7ACB YYYY-MM \u5099\u4EFD\u300D\uFF0C\u5B8C\u6210\u5F8C\u986F\u793A\u300C\u5DF2\u5EFA\u7ACB\u5099\u4EFD\u300D\u3002\u7BE9\u9078\u8207 PostgreSQL \u968E\u6BB5\u6703\u986F\u793A\u76EE\u524D\u8655\u7406\u7684\u6708\u4EFD\u8207 archive\u3002\u7DA0\u8272\uFF1A\u5DF2\u5B8C\u6210\uFF08\u542B\u5148\u524D run \u5DF2\u532F\u5165\u3001\u672C\u6B21\u5C1A\u672A\u91CD\u8DD1\uFF09\uFF1B\u7D05\u8272\uFF1A\u5C1A\u672A\u5B8C\u6210\u6216\u672C\u6B21\u6709\u5F85\u532F\u5165\u6A94\u6848\uFF1B\u7070\u8272\uFF1A\u672C\u6B21\u8655\u7406\u4E2D\uFF1B\u7A7A\u767D\uFF1A\u7121\u8CC7\u6599\u3002\u9EDE\u9078\u7D05\u8272\u968E\u6BB5\u53EF\u56DE\u5230\u5224\u6C7A\u532F\u5165\u6D41\u7A0B\u3002</p>
    </div>
  </section>`}function Fc(e){let t=e.index_runtime||{};if(!t.available)return`<section class="report-card processing-card index-runtime-card">
      <div class="side-card-head">
        <span class="side-card-title">${p("cloud",14)}Ollama \u9023\u7DDA\u6E2C\u8A66</span>
        <span class="badge badge-neutral">\u5C1A\u7121</span>
      </div>
      <div class="processing-workflow-empty">\u57F7\u884C Qdrant \u7248\u672C\u5EFA\u7F6E\u5F8C\uFF0C\u6703\u5728\u9019\u88E1\u986F\u793A\u6E2C\u8A66\u7684\u4E3B\u6A5F\u3001\u6A21\u578B\u8207\u9078\u7528\u7D50\u679C\u3002</div>
    </section>`;let s=!!t.coverage_only,a=t.embedding||{},n=Array.isArray(a.hosts)?a.hosts:[],i=a.selected||{},o=a.active||{},l=t.current||{},u=t.summary||{},c=i.url||"",b=o.url||"",$=n.map(h=>Bc(h,c)).join(""),v=t.run_status==="running"?"\u76EE\u524D\u8655\u7406":"\u6700\u5F8C\u8655\u7406",f=l.jid?`<div class="index-current-row">
        <span class="badge badge-info">${p("activity",11)}${v}</span>
        <strong class="mono">${r(Ic(l.month))}</strong>
        <span class="mono">${r(l.archive||"\u2014")}</span>
        <span class="mono">${r(l.jid||"\u2014")}</span>
        <span class="index-current-copy">${r([l.court,l.title].filter(Boolean).join(" \xB7 ")||"\u2014")}</span>
        <span class="faint">\u6279\u6B21 ${d(l.batch_size)} \u7B46</span>
      </div>`:"";return`<section class="report-card processing-card index-runtime-card"${s?" hidden":""}>
    <div class="side-card-head">
      <span class="side-card-title">${p("cloud",14)}Ollama \u9023\u7DDA\u6E2C\u8A66</span>
      ${dt(a.status||"idle")}
    </div>
    ${t.error?`<div class="processing-update-notice index-runtime-error">${p("alert",13)}<span>${r(t.error)}</span></div>`:""}
    <div class="index-selected-host">
      <span class="faint">\u6700\u5F8C\u9078\u7528</span>
      <strong class="mono">${r(i.url||"\u2014")}</strong>
      <span>${r(i.model||a.model||"\u2014")}</span>
      <span class="mono">port ${r(i.port??"\u2014")}</span>
      ${b&&b!==c?`<span class="badge badge-warn">\u76EE\u524D\u4F7F\u7528 ${r(b)}</span>`:""}
      ${o.using_fallback?'<span class="badge badge-warn">\u5DF2\u5207\u63DB\u5099\u63F4</span>':""}
    </div>
    <div class="index-host-list">${$||'<div class="processing-workflow-empty">\u6C92\u6709\u53EF\u986F\u793A\u7684\u4E3B\u6A5F\u6E2C\u8A66\u7D50\u679C\u3002</div>'}</div>
    ${a.tested_at?`<div class="index-runtime-foot">\u6E2C\u8A66\u6642\u9593 ${r(Me(a.tested_at))}</div>`:""}
  </section>
  <section class="report-card processing-card index-files-card">
    <div class="side-card-head">
      <span class="side-card-title">${p("table",14)}\u7D22\u5F15\u6A94\u6848\u6642\u9593\u8868</span>
      <span class="badge badge-neutral">${d(u.indexed)} / ${d(u.total)} \u7B46</span>
    </div>
    <div class="index-runtime-summary">
      <span>\u7248\u672C <strong class="mono">v${r(t.version_id??"\u2014")}</strong></span>
      <span>Collection <code>${r(t.collection||"\u2014")}</code></span>
      <span>\u6A21\u5F0F <strong>${r(t.build_mode||"\u2014")}</strong></span>
      ${s?"":`<span>\u91CD\u7528 <strong class="mono">${d(u.reused)}</strong></span>
            <span>\u65B0 embedding <strong class="mono">${d(u.embedded)}</strong></span>`}
    </div>
    ${f}
    ${Oc(t)}
    ${s?'<p class="judgment-months-hint index-coverage-note">\u76EE\u524D\u986F\u793A active collection \u7684\u6708\u4EFD\u7D22\u5F15\u8986\u84CB\uFF1B\u57F7\u884C Qdrant \u7248\u672C\u5EFA\u7F6E\u5F8C\u6703\u986F\u793A\u672C\u6B21 Ollama \u6E2C\u8A66\u8207\u5373\u6642\u9032\u5EA6\u3002</p>':""}
  </section>`}function zc(e={}){let{storage:t,loading:s,error:a}=e;if(a)return`<section class="report-card processing-card index-storage-card">
      <div class="side-card-head">
        <span class="side-card-title">${p("database",14)}Qdrant \u5132\u5B58\u4F4D\u7F6E</span>
        <button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-index-storage">${p("refresh",12)}<span>\u91CD\u65B0\u6574\u7406</span></button>
      </div>
      <div class="processing-workflow-empty">${r(a)}</div>
    </section>`;if(!t)return`<section class="report-card processing-card index-storage-card">
      <div class="side-card-head">
        <span class="side-card-title">${p("database",14)}Qdrant \u5132\u5B58\u4F4D\u7F6E</span>
        <span class="badge badge-neutral">${s?"\u8B80\u53D6\u4E2D":"\u5C1A\u7121"}</span>
      </div>
      <div class="processing-workflow-empty">${s?"\u6B63\u5728\u53D6\u5F97 Docker \u5BB9\u5668\u8207 volume \u8CC7\u8A0A\u2026":"\u5207\u63DB\u5230\u6B64\u6D41\u7A0B\u5F8C\u6703\u8B80\u53D6 Qdrant \u5BB9\u5668\u8207 volume \u8CC7\u8A0A\u3002"}</div>
    </section>`;let n=t.qdrant_storage||{},o=(Array.isArray(t.databases)?t.databases:[]).find(b=>b.id==="qdrant")||{},l=n.volume_bytes??o.volume_bytes??null,u=n.points_count??o.points_count,c=n.segments_count??o.segments_count;return`<section class="report-card processing-card index-storage-card">
    <div class="side-card-head">
      <span class="side-card-title">${p("database",14)}Qdrant \u5132\u5B58\u4F4D\u7F6E</span>
      <button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-index-storage">${p("refresh",12)}<span>\u91CD\u65B0\u6574\u7406</span></button>
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
      <span>Points\uFF0FSegments</span><strong class="mono">${d(u)} / ${d(c)}</strong>
    </div>
    <div class="index-runtime-foot">\u8CC7\u6599\u6642\u9593 ${r(Me(t.checked_at))}</div>
  </section>`}function qn({badge:e="",lead:t="",rows:s=[],note:a=""}){return`<section class="report-card processing-card parquet-help-card workflow-help-card">
    <div class="side-card-head">
      <span class="side-card-title">${p("info",14)}\u529F\u80FD\u8AAA\u660E</span>
      ${e?`<span class="badge badge-neutral">${r(e)}</span>`:""}
    </div>
    <div class="parquet-help-body">
      <p class="parquet-help-lead">${t}</p>
      <div class="parquet-help-grid">${s.map(([n,i])=>`<span>${r(n)}</span><strong>${i}</strong>`).join("")}</div>
      ${a?`<p class="parquet-help-note">${a}</p>`:""}
    </div>
  </section>`}function Hc(){return qn({badge:"\u552F\u8B80\u532F\u51FA",lead:"\u5C07 PostgreSQL \u76EE\u524D\u6709\u6548\u7684\u5224\u6C7A\uFF08<code>judgment_documents.is_current = true</code>\uFF09\u532F\u51FA\u6210\u7368\u7ACB\u7684 Parquet \u5FEB\u7167\uFF0C\u4F9B\u96E2\u7DDA\u5206\u6790\u3001\u8CC7\u6599\u4EA4\u63DB\u6216\u4FDD\u5B58\u3002",rows:[["\u4F86\u6E90","PostgreSQL <code>judgment_documents</code>\uFF0C\u53EA\u542B\u76EE\u524D\u6709\u6548\u4E14\u5DF2\u547D\u4E2D\u91D1\u878D\u6CD5\u898F\u6E05\u55AE\u7684\u5224\u6C7A\u3002"],["\u8F38\u51FA",'<span class="mono">JUDGMENT_DATA_DIR/parquet/judgments/YYYYMMDD/HHMMSS-xxxxxxxx/judgments.parquet</span>'],["\u9644\u5E36\u6A94",'<span class="mono">\u540C\u76EE\u9304 manifest.json\uFF08\u7B46\u6578\u3001\u6A94\u6848\u5927\u5C0F\u3001\u6B04\u4F4D\u3001\u7522\u751F\u6642\u9593\uFF09</span>'],["\u5167\u5BB9","\u6848\u865F\u3001\u6CD5\u9662\u3001\u6848\u7531\u3001\u5168\u6587\u3001\u547D\u4E2D\u6CD5\u898F\u3001\u5F15\u7528\u3001\u4F86\u6E90\u58D3\u7E2E\u6A94\u8207\u6642\u9593\u6B04\u4F4D\uFF1B<code>citations</code> \u4EE5 JSON \u5B57\u4E32\u4FDD\u5B58\u3002"],["\u8207\u539F\u59CB Parquet","\u8CC7\u6599\u9801\u8207 <code>source=parquet</code> \u4F7F\u7528 <code>parquet/raw_judgments/.../raw.parquet</code>\uFF1B\u672C\u6D41\u7A0B\u7684 <code>parquet/judgments/...</code> \u662F\u53E6\u4E00\u500B\u6B63\u898F\u5316\u5FEB\u7167\u3002"],["\u4E0D\u6703","\u4E0D\u5BEB\u56DE PostgreSQL\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u820A\u5FEB\u7167\uFF1B\u53EA\u532F\u51FA current \u8CC7\u6599\uFF0C\u4E0D\u542B\u6B77\u53F2\u7248\u672C\u3002"],["\u4E2D\u65B7","\u6BCF\u6B21\u57F7\u884C\u5EFA\u7ACB\u65B0\u7684\u5B8C\u6574\u5FEB\u7167\uFF1B\u4E2D\u65B7\u5F8C\u91CD\u65B0\u57F7\u884C\u4E0D\u6703\u7E8C\u5BEB\u540C\u4E00\u500B Parquet \u6A94\u3002"]],note:"\u9069\u5408 DuckDB\u3001pandas\u3001Spark \u7B49\u96E2\u7DDA\u5206\u6790\uFF0C\u6216\u9700\u8981\u56FA\u5B9A\u6642\u9593\u9EDE\u7684\u53EF\u91CD\u73FE\u8CC7\u6599\u5FEB\u7167\u3002\u65E5\u5E38 RAG \u67E5\u8A62\u8207\u8CC7\u6599\u9801\u700F\u89BD\u4E0D\u9700\u8981\u57F7\u884C\u6B64\u6D41\u7A0B\u3002"})}function Uc(){return qn({badge:"PostgreSQL \u56DE\u586B",lead:"\u5C07\u5224\u6C7A\u7684 <code>court</code> \u8F49\u6210\u6A19\u6E96\u6CD5\u9662\u540D\u7A31\u4E26\u5BEB\u5165 <code>court_normalized</code>\uFF1B\u539F\u59CB <code>court</code> \u6703\u4FDD\u7559\u4F9B\u8FFD\u6EAF\u3002",rows:[["\u8655\u7406\u7BC4\u570D","\u9810\u8A2D\u53EA\u8655\u7406 <code>court_normalized</code> \u70BA\u7A7A\u7684\u8CC7\u6599\uFF1B\u5DF2\u6B63\u898F\u5316\u8CC7\u6599\u6703\u8DF3\u904E\uFF0C\u53EF\u7528 <code>--all</code> \u91CD\u65B0\u8A08\u7B97\u5168\u90E8\u3002"],["\u89E3\u6790\u9806\u5E8F","\u539F\u59CB\u6CD5\u9662\u503C\u958B\u982D\u7B26\u5408\u6A19\u6E96\u540D\u7A31 \u2192 \u5224\u6C7A\u5168\u6587\u524D 8,000 \u5B57\u6700\u65E9\u51FA\u73FE\u7684\u6CD5\u9662 \u2192 \u539F\u59CB\u6CD5\u9662\u503C\u4EFB\u610F\u4F4D\u7F6E\u7684\u6A19\u6E96\u540D\u7A31 \u2192 JID \u5B98\u65B9\u6CD5\u9662\u4EE3\u78BC\u3002"],["\u8F38\u51FA","\u5BEB\u5165 <code>judgment_documents.court_normalized</code>\uFF1B\u4E0D\u4FEE\u6539\u539F\u59CB <code>court</code>\u3001\u5168\u6587\u6216\u5176\u4ED6\u5224\u6C7A\u6B04\u4F4D\u3002"],["\u672A\u89E3\u6790","\u7121\u6CD5\u5224\u65B7\u6642\u4FDD\u7559\u7A7A\u503C\uFF0C\u4E0D\u731C\u6E2C\uFF1B\u6458\u8981\u6703\u5217\u51FA\u672A\u89E3\u6790\u7B46\u6578\u8207\u5E38\u898B\u6A23\u672C\u3002"],["\u5F71\u97FF","\u8CC7\u6599\u9801\u7684\u6CD5\u9662\u4E0B\u62C9\u3001\u7CBE\u78BA\u7BE9\u9078\u3001\u6392\u5E8F\u3001\u7D50\u679C\u6B04\u4F4D\u8207\u5224\u6C7A\u539F\u6587\u4F7F\u7528\u6B63\u898F\u5316\u540D\u7A31\uFF1BAPI \u4ECD\u56DE\u50B3 <code>court_raw</code>\u3002"],["\u4E0D\u6703","\u4E0D\u91CD\u65B0\u532F\u5165\u5224\u6C7A\u3001\u4E0D\u6539\u5168\u6587\u3001\u4E0D\u66F4\u65B0 Qdrant\u3001\u4E0D\u540C\u6B65 IndexedDB\u3001\u4E0D\u522A\u9664\u8CC7\u6599\u3002"],["\u91CD\u8DD1","\u9810\u8A2D\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u898F\u5247\u66F4\u65B0\u5F8C\u53EF\u7528 <code>--all</code> \u91CD\u7B97\uFF0C\u6216\u5148\u7528 <code>--dry-run</code> \u7D71\u8A08\u3002"]],note:"\u9069\u5408\u5728\u5224\u6C7A\u532F\u5165\u5F8C\u3001\u6CD5\u9662\u540D\u7A31\u898F\u5247\u66F4\u65B0\u5F8C\uFF0C\u6216\u8CC7\u6599\u9801\u6CD5\u9662\u9078\u9805\u51FA\u73FE\u7F3A\u6F0F\u6642\u57F7\u884C\u3002\u7D50\u679C\u4E5F\u6703\u5BEB\u5165\u6548\u80FD\u7D00\u9304\u3002"})}function Qc(){return qn({badge:"\u689D\u6587\u6B77\u53F2\u5EFA\u6A94",lead:"\u70BA\u65E2\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u5EFA\u7ACB <code>law_article_versions</code> \u6B77\u53F2\u689D\u6587\u5FEB\u7167\u8207 <code>law_article_change_events</code> \u8B8A\u66F4\u7D00\u9304\uFF0C\u8B93\u8CC7\u6599\u9801\u80FD\u5207\u63DB\u6B77\u53F2\u7248\u672C\u4E26\u67E5\u770B\u689D\u6587\u5DEE\u7570\u3002",rows:[["\u4F86\u6E90","PostgreSQL \u6CD5\u898F\u7248\u672C\uFF0C\u4EE5\u53CA <code>LAW_DATA_DIR/raw_parquet</code> \u5167\u5C0D\u61C9\u7684\u539F\u59CB\u6CD5\u898F Parquet \u5FEB\u7167\u3002"],["\u5339\u914D\u65B9\u5F0F","\u4EE5 raw Parquet manifest \u7684 <code>zip_sha256</code>\uFF0F<code>raw_json_sha256</code> \u5C0D\u61C9\u6CD5\u898F\u7248\u672C\uFF0C\u4E0D\u731C\u6E2C\u5167\u5BB9\u3002"],["\u7522\u751F\u5167\u5BB9","<code>article_key</code>\uFF08\u689D\u6587\u985E\u578B\uFF0B\u689D\u865F\uFF09\u3001<code>content_hash</code>\u3001\u689D\u6587\u5168\u6587\u8207\u751F\u6548\u65E5\uFF1B\u8207\u524D\u4E00\u7248\u672C\u6BD4\u8F03\u5F8C\u8A18\u9304 <code>added</code>\uFF0F<code>modified</code>\uFF0F<code>removed</code>\u3002"],["\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB","\u5206\u9801\u4E0A\u65B9\u7684\u552F\u8B80\u6AA2\u67E5\u6703\u8B80\u53D6 <code>law_article_versions</code> \u8207\u539F\u59CB Parquet\uFF0C\u5224\u65B7\u7248\u672C\u662F\u5426\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\uFF1B\u6AA2\u67E5\u672C\u8EAB\u4E0D\u6703\u4FEE\u6539\u8CC7\u6599\u5EAB\u3002"],["\u53EF\u5EFA\u7ACB","\u627E\u5230\u5C0D\u61C9\u539F\u59CB Parquet \u7684\u7248\u672C\uFF0C\u53EF\u76F4\u63A5\u57F7\u884C\u6B64\u6D41\u7A0B\u5EFA\u7ACB\u689D\u6587\u6B77\u53F2\u3002"],["\u7F3A\u539F\u59CB\u6A94","\u627E\u4E0D\u5230\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u6A19\u793A\u7121\u6CD5\u5EFA\u7ACB\uFF0C\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD\uFF1B\u6B64\u6D41\u7A0B\u6703\u8DF3\u904E\u4E26\u5217\u5728 <code>missing_versions</code>\u3002"],["\u6AA2\u67E5\u7D50\u679C","\u5E74\u4EFD\xD7\u6708\u4EFD\u8868\u986F\u793A\u5DF2\u5EFA\u7ACB\uFF0F\u672A\u5EFA\u7ACB\uFF0F\u90E8\u5206\u5EFA\u7ACB\uFF1B\u4E0B\u65B9\u5217\u51FA\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3001\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u7248\u672C\u65E5\u671F\u8207\u53EF\u5EFA\u7ACB\u72C0\u614B\u3002\u76EE\u524D\u72C0\u614B\u4EE5\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u5361\u7247\u5373\u6642\u986F\u793A\u3002"],["\u8DF3\u904E\u689D\u4EF6","\u5DF2\u6709\u689D\u6587\u5FEB\u7167\u7684\u7248\u672C\u6703\u8DF3\u904E\uFF1B\u627E\u4E0D\u5230\u53EF\u8B80\u539F\u59CB Parquet \u7684\u7248\u672C\u6703\u5217\u5165 <code>missing_versions</code>\uFF0C\u4E0D\u5EFA\u7ACB\u865B\u69CB\u689D\u6587\u3002"],["\u4E0D\u6703","\u4E0D\u4E0B\u8F09\u6CD5\u898F\uFF0F\u547D\u4EE4\u3001\u4E0D\u89E3\u6790\u65B0 ZIP\u3001\u4E0D\u4FEE\u6539 <code>law_documents</code> \u6216\u76EE\u524D\u7248\u672C\u3001\u4E0D\u66F4\u65B0 Qdrant\uFF0FIndexedDB\u3002"],["\u8F38\u51FA\u6458\u8981","\u7248\u672C\u6578\u3001\u8DF3\u904E\u7248\u672C\u6578\u3001\u7F3A\u5C11\u5FEB\u7167\u7248\u672C\u3001\u5BEB\u5165\u689D\u6587\u6578\u8207\u689D\u6587\u8B8A\u66F4\u4E8B\u4EF6\u6578\u3002"],["\u91CD\u8DD1","\u53EF\u91CD\u8907\u57F7\u884C\uFF1B\u5DF2\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u4E0D\u6703\u91CD\u8907\u63D2\u5165\u3002"]],note:"\u9069\u5408\u5F9E\u820A\u7248 schema \u5347\u7D1A\u3001\u65E2\u6709\u6CD5\u898F\u7248\u672C\u7F3A\u5C11\u6B77\u53F2\u689D\u6587\uFF0C\u6216\u8CC7\u6599\u9801\u6B77\u53F2\u689D\u6587\u7248\u672C\u8207\u8B8A\u66F4\u7D00\u9304\u4E0D\u5B8C\u6574\u6642\u57F7\u884C\u3002\u57F7\u884C\u524D\u53EF\u5148\u7528\u4E0A\u65B9\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u78BA\u8A8D\u54EA\u4E9B\u7248\u672C\u53EF\u5EFA\u7ACB\u3001\u54EA\u4E9B\u7F3A\u539F\u59CB\u6A94\u3002"})}function Gc(e={}){let t=e.courtCheck,s=!!e.courtCheckLoading,a=e.courtCheckError,n=`<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-court-check"${s?" disabled":""}>${p("refresh",12)}<span>${s?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31"}</span></button>`;if(a)return`<section class="report-card processing-card court-check-card">
      <div class="side-card-head">
        <span class="side-card-title">${p("search",14)}\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31</span>
        ${n}
      </div>
      <div class="processing-workflow-empty">${r(a)}</div>
    </section>`;if(!t)return`<section class="report-card processing-card court-check-card">
      <div class="side-card-head">
        <span class="side-card-title">${p("search",14)}\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31</span>
        ${n}
      </div>
      <div class="processing-workflow-empty">${s?'<span class="spinner" aria-hidden="true"></span> \u6B63\u5728\u6AA2\u67E5\u5404\u6708\u4EFD\u6CD5\u9662\u540D\u7A31\u2026':"\u9032\u5165\u6B64\u5206\u9801\u5F8C\u6703\u81EA\u52D5\u6AA2\u67E5\uFF1B\u4E5F\u53EF\u6309\u300C\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31\u300D\u91CD\u65B0\u8B80\u53D6\u3002"}</div>
    </section>`;let i=Array.isArray(t.months)?t.months:[],o=t.summary||{},l=t.totals||{};if(!i.length)return`<section class="report-card processing-card court-check-card">
      <div class="side-card-head">
        <span class="side-card-title">${p("search",14)}\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31</span>
        ${n}
      </div>
      <div class="processing-workflow-empty">\u76EE\u524D\u6C92\u6709\u53EF\u6AA2\u67E5\u7684\u5224\u6C7A\u8CC7\u6599\u3002</div>
    </section>`;let u={green:"\u5DF2\u6AA2\u67E5",red:"\u672A\u6AA2\u67E5",gray:"\u9700\u6B63\u898F\u5316"},c=new Map(i.map(v=>[String(v.month),v])),$=[...new Set(i.map(v=>v.year))].sort((v,f)=>f-v).map(v=>{let f=Array.from({length:12},(h,_)=>{let S=_+1,R=`${v}${String(S).padStart(2,"0")}`,O=c.get(R);if(!O)return`<td class="judgment-month is-empty"><span>${S}</span></td>`;let I=u[O.status]?O.status:"red",Q=[`${v}-${String(S).padStart(2,"0")}`,u[I],`\u7E3D ${d(O.total)} \u7B46`,`\u5DF2\u6AA2\u67E5 ${d(O.checked)} \u7B46`,`\u672A\u6AA2\u67E5 ${d(O.unchecked)} \u7B46`,O.invalid?`\u7121\u6548\u503C ${d(O.invalid)} \u7B46`:"",`\u6709\u6548 ${It(O.percent)}`].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month court-check-month is-${I}" title="${r(Q)}"><span>${S}</span></td>`}).join("");return`<tr><th scope="row">${r(v)}</th>${f}</tr>`}).join("");return`<section class="report-card processing-card court-check-card">
    <div class="side-card-head">
      <span class="side-card-title">${p("search",14)}\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31</span>
      ${n}
    </div>
    <div class="judgment-months">
      <div class="judgment-months-meta">
        <span class="badge badge-ok">\u5DF2\u6AA2\u67E5 ${d(o.green||0)}</span>
        <span class="badge badge-danger">\u672A\u6AA2\u67E5 ${d(o.red||0)}</span>
        <span class="badge badge-neutral">\u9700\u6B63\u898F\u5316 ${d(o.gray||0)}</span>
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(v,f)=>`<th scope="col">${f+1}</th>`).join("")}</tr></thead>
          <tbody>${$}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u5168\u90E8\u5DF2\u6B63\u898F\u5316\uFF1B\u7D05\u8272\uFF1A\u5B8C\u5168\u672A\u6AA2\u67E5\uFF1B\u7070\u8272\uFF1A\u90E8\u5206\u672A\u6B63\u898F\u5316\u6216\u6709\u7121\u6548\u503C\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u7B46\u6578\u8207\u6709\u6548\u6BD4\u4F8B\u3002</p>
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${r(Me(t.checked_at))} \xB7 \u6A19\u6E96\u6CD5\u9662\u540D\u7A31 ${d(t.canonical_count)} \u500B</div>
    </div>
  </section>`}function Jc(e={}){let t=e.lawVersionCheck,s=!!e.lawVersionCheckLoading,a=e.lawVersionCheckError,n=`<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-law-version-check"${s?" disabled":""}>${p("refresh",12)}<span>${s?"\u6AA2\u67E5\u4E2D\u2026":"\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB"}</span></button>`;if(a)return`<section class="report-card processing-card law-version-card">
      <div class="side-card-head">
        <span class="side-card-title">${p("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
        ${n}
      </div>
      <div class="processing-workflow-empty">${r(a)}</div>
    </section>`;if(!t)return`<section class="report-card processing-card law-version-card">
      <div class="side-card-head">
        <span class="side-card-title">${p("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
        ${n}
      </div>
      <div class="processing-workflow-empty">${s?'<span class="spinner" aria-hidden="true"></span> \u6B63\u5728\u6AA2\u67E5\u7248\u672C\u8207\u6B77\u53F2\u689D\u6587\u2026':"\u9032\u5165\u6B64\u5206\u9801\u5F8C\u6703\u81EA\u52D5\u6AA2\u67E5\uFF1B\u4E5F\u53EF\u6309\u300C\u6AA2\u67E5\u662F\u5426\u9700\u5EFA\u7ACB\u300D\u91CD\u65B0\u8B80\u53D6\u3002"}</div>
    </section>`;let i=Array.isArray(t.months)?t.months:[],o=t.summary||{},l=t.totals||{};if(!i.length)return`<section class="report-card processing-card law-version-card">
      <div class="side-card-head">
        <span class="side-card-title">${p("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
        ${n}
      </div>
      <div class="processing-workflow-empty">\u8CC7\u6599\u5EAB\u76EE\u524D\u6C92\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u7248\u672C\u8CC7\u6599\u3002</div>
    </section>`;let u={green:"\u5DF2\u5EFA\u7ACB",red:"\u672A\u5EFA\u7ACB",gray:"\u90E8\u5206\u5EFA\u7ACB"},c=new Map(i.map(X=>[String(X.month),X])),$=[...new Set(i.map(X=>X.year))].sort((X,P)=>P-X).map(X=>{let P=Array.from({length:12},(k,M)=>{let Z=M+1,ue=`${X}${String(Z).padStart(2,"0")}`,G=c.get(ue);if(!G)return`<td class="judgment-month is-empty"><span>${Z}</span></td>`;let ee=u[G.status]?G.status:"red",J=[`${X}-${String(Z).padStart(2,"0")}`,u[ee],`\u7248\u672C ${d(G.version_count)}\uFF08\u6CD5\u898F ${d(G.law_versions)}\uFF0F\u547D\u4EE4 ${d(G.order_versions)}\uFF09`,`\u5DF2\u5EFA\u7ACB ${d(G.backfilled_count)}`,`\u672A\u5EFA\u7ACB ${d(G.missing_count)}`,`\u9700\u5EFA\u7ACB ${d(G.needs_backfill_count)}\uFF08\u53EF\u5EFA\u7ACB ${d(G.backfillable_count)}\uFF0F\u7F3A\u539F\u59CB\u6A94 ${d(G.blocked_count)}\uFF09`,`\u689D\u6587\u5217 ${d(G.article_rows)} / \u9810\u671F ${d(G.article_count)}`,G.current?"\u76EE\u524D\u7248\u672C":"",G.versions?.length?`\u7248\u672C ${G.versions.map(le=>`#${le.version_id}`).join("\u3001")}`:""].filter(Boolean).join(" \xB7 ");return`<td class="judgment-month law-version-month is-${ee}${G.current?" is-current":""}" title="${r(J)}"><span>${Z}</span></td>`}).join("");return`<tr><th scope="row">${r(X)}</th>${P}</tr>`}).join(""),v={law:"\u6CD5\u898F",order:"\u547D\u4EE4"},f=i.flatMap(X=>(X.versions||[]).filter(P=>P.needs_backfill).map(P=>({...P,month:X.month}))).sort((X,P)=>P.version_id-X.version_id),h=f.slice(0,20),_=h.map(X=>{let P=X.backfillable?"badge-info":X.blocked?"badge-danger":"badge-neutral",k=X.backfillable?"\u53EF\u5EFA\u7ACB":X.blocked?"\u7F3A\u539F\u59CB\u6A94":"\u5F85\u6AA2\u67E5";return`<div class="law-backfill-needed-row">
        <strong class="mono">#${X.version_id}</strong>
        <span class="badge ${P}">${k}</span>
        <span>${r(v[X.source_type]||X.source_type||"\u2014")}</span>
        <span class="mono">${r(X.update_date||X.month||"\u2014")}</span>
        <span class="law-backfill-needed-reason">${r(X.reason||"\u2014")}</span>
      </div>`}).join(""),S=f.length?`<div class="law-backfill-needed">
        <div class="law-backfill-needed-head">\u9700\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C <span class="badge badge-warn">${d(f.length)}</span></div>
        <div class="law-backfill-needed-list">${_}</div>
        ${f.length>h.length?`<div class="law-backfill-needed-more">\u53E6\u6709 ${d(f.length-h.length)} \u500B\u7248\u672C\u672A\u5217\u51FA</div>`:""}
      </div>`:'<div class="law-backfill-needed is-clear">\u76EE\u524D\u6C92\u6709\u9700\u8981\u5EFA\u7ACB\u6B77\u53F2\u7684\u7248\u672C\u3002</div>',R=Number(l.needs_backfill_versions)||0,O=Number(l.backfillable_versions)||0,I=Number(l.blocked_versions)||0,Q=Number(l.backfilled_versions)||0,oe=Number(l.versions)||0,te=R<=0?"ok":I>0?"danger":"warn",je=R<=0?"\u4E0D\u9700\u8981\u5EFA\u7ACB":"\u9700\u8981\u5EFA\u7ACB",De=R>0?`\u9700\u8981\u5EFA\u7ACB ${d(R)} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF1A\u53EF\u5EFA\u7ACB ${d(O)}\u3001\u7F3A\u539F\u59CB\u6A94 ${d(I)}\u3002\u5DF2\u6709\u6B77\u53F2\u689D\u6587 ${d(Q)} \u500B\u7248\u672C${I>0?"\uFF1B\u7F3A\u539F\u59CB\u6A94\u9700\u5148\u88DC\u4E0B\u8F09\u6216\u5099\u4EFD":""}\u3002`:`\u76EE\u524D ${d(oe)} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`;return`<section class="report-card processing-card law-version-card">
    <div class="side-card-head">
      <span class="side-card-title">${p("database",14)}\u6AA2\u67E5\u689D\u6587\u6B77\u53F2</span>
      ${n}
    </div>
    <div class="law-version-check-status is-${te}" role="status" aria-live="polite">
      <span class="badge badge-${te}">${je}</span>
      <span>${r(De)}</span>
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
          <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(X,P)=>`<th scope="col">${P+1}</th>`).join("")}</tr></thead>
          <tbody>${$}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u8A72\u6708\u4EFD\u6240\u6709\u7248\u672C\u90FD\u6709\u6B77\u53F2\u689D\u6587\uFF1B\u7D05\u8272\uFF1A\u5B8C\u5168\u672A\u5EFA\u7ACB\uFF1B\u7070\u8272\uFF1A\u90E8\u5206\u7248\u672C\u5DF2\u5EFA\u7ACB\uFF1B\u5916\u6846\uFF1A\u76EE\u524D\u7248\u672C\uFF1B\u7A7A\u767D\uFF1A\u6C92\u6709\u8A72\u6708\u4EFD\u7248\u672C\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u67E5\u770B\u7248\u672C\u6578\u3001\u6CD5\u898F\uFF0F\u547D\u4EE4\u6578\u8207\u689D\u6587\u5217\u3002</p>
      ${S}
      <div class="index-runtime-foot">\u6AA2\u67E5\u6642\u9593 ${r(Me(t.checked_at))}</div>
    </div>
  </section>`}function Vc(){return`<div class="processing-ollama-loading">
    <span class="spinner" aria-hidden="true"></span>
    <span>\u6B63\u5728\u6AA2\u67E5 Ollama \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span>
  </div>`}function Wc(e,t,s){let a=Array.isArray(e?.hosts)?e.hosts:[];if(s&&!a.length)return`${Re({tone:"danger",title:"Ollama \u4E3B\u6A5F\u8B80\u53D6\u5931\u6557",text:r(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
    <div class="processing-ollama-empty">
      <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh-ollama">
        ${p("refresh",13)}<span>\u91CD\u65B0\u6AA2\u67E5</span>
      </button>
    </div>`;if(!a.length)return t?Vc():'<div class="processing-ollama-empty">\u5C1A\u672A\u8A2D\u5B9A Ollama \u4E3B\u6A5F\uFF1B\u8ACB\u5230\u300C\u7CFB\u7D71\u72C0\u614B \u2192 Model Provider\u300D\u65B0\u589E\u4E26\u9023\u63A5\u6A21\u578B\u3002</div>';let n=a.map((o,l)=>{let u=o.status==="operational",c=Array.isArray(o.models)?o.models:[],b=c.length?c.map(v=>`<span class="processing-ollama-model ${u?"is-online":"is-offline"}">${r(v.name||"")}</span>`).join(""):'<span class="processing-ollama-model is-offline">\u6C92\u6709\u53EF\u7528\u6A21\u578B</span>',$=[o.embedding_model?`<span class="processing-ollama-role ${u?"is-online":"is-offline"}">\u5D4C\u5165 \xB7 ${r(o.embedding_model)}</span>`:'<span class="processing-ollama-role is-offline">\u672A\u8A2D\u5B9A\u5D4C\u5165\u6A21\u578B</span>',o.chat_model?`<span class="processing-ollama-role is-offline">\u804A\u5929 \xB7 ${r(o.chat_model)}</span>`:""].filter(Boolean).join("");return`<article class="processing-ollama-host ${u?"is-online":"is-offline"}" data-ollama-host data-host-id="${Number(o.id)}">
        <span class="processing-ollama-handle" aria-hidden="true">${p("grid",14)}</span>
        <span class="processing-ollama-rank">${l+1}</span>
        <div class="processing-ollama-main">
          <div class="processing-ollama-title">
            <strong>${r(o.name||o.base_url||`\u4E3B\u6A5F #${o.id}`)}</strong>
            <span class="processing-ollama-status">${u?"\u53EF\u7528":"\u7121\u6CD5\u9023\u7DDA"}</span>
          </div>
          <span class="processing-ollama-url mono">${r(o.base_url||"\u2014")}</span>
          <div class="processing-ollama-models">${b}</div>
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
    <p class="processing-ollama-hint">\u62D6\u79FB\u6216\u4F7F\u7528\u7BAD\u982D\u8ABF\u6574 embedding \u512A\u5148\u9806\u5E8F\uFF1B\u76EE\u524D\u4E3B\u6A5F\u7121\u6CD5\u4F7F\u7528\u6642\uFF0C\u6703\u4F9D\u5E8F\u81EA\u52D5\u6539\u7528\u4E0B\u4E00\u53F0\uFF08\u5404\u53F0\u9700\u5177\u5099\u76F8\u540C\u7684 embedding \u6A21\u578B\uFF09\uFF0C\u76F4\u5230\u6709\u4E3B\u6A5F\u56DE\u50B3\u5411\u91CF\u3002</p>`}function Kc(e,t={}){let s=e.active_run||null,a=s||e.last_run||null,n=!!s||xt===e.id,i=!!e.can_run&&!n,o=Array.isArray(e.command)?e.command.join(" "):"";return`<div class="processing-workflow-panel">
    ${Re({tone:"info",title:e.label,text:e.description||""})}
    ${e.update_available?`<div class="processing-update-notice" role="status">
            ${p("refresh",13)}
            <span>${r(e.update_status&&e.update_status.message||"\u7DDA\u4E0A\u5075\u6E2C\u5230\u65B0\u7248")}</span>
            <span class="badge badge-warn">\u66F4\u65B0</span>
          </div>`:""}
    ${e.id==="normalize_courts"?Gc(t):""}
    ${e.id==="backfill_law_articles"?Jc(t):""}
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${p(bi[e.id]||"terminal",14)}\u57F7\u884C\u8CC7\u8A0A</span>
        <span class="badge badge-neutral badge-mono">${r(e.branch||"")}</span>
      </div>
      <div class="processing-workflow-command-grid">
        <span>\u7A0B\u5F0F</span><code>${r(e.program||"\u2014")}</code>
        <span>Shell\uFF0F\u5165\u53E3</span><code>${r(e.script||"\u2014")}</code>
        <span>\u5BE6\u969B\u547D\u4EE4</span><code class="processing-workflow-command">${r(o||"\u2014")}</code>
      </div>
      ${_n.has(e.id)?'<div class="processing-embedding-strip-slot" data-processing-embedding-strip data-preserve-children></div>':""}
      <div class="processing-workflow-actions">
        <button class="btn btn-primary btn-sm" type="button"
          data-processing-action="run-workflow"
          data-workflow-id="${r(e.id)}"
          ${i?"":"disabled"}>
          ${p("play",14)}<span>${n?"\u57F7\u884C\u4E2D":"\u57F7\u884C\u6B64\u6D41\u7A0B"}</span>
        </button>
        ${["law_download","order_download","judgment_download"].includes(e.id)?`<button class="btn btn-secondary btn-sm" type="button"
                data-processing-action="check-updates"
                data-workflow-id="${r(e.id)}">
                ${p("refresh",14)}<span>\u6AA2\u67E5\u66F4\u65B0</span>
              </button>`:""}
        ${s?`<button class="btn btn-secondary btn-sm processing-stop" type="button"
                data-processing-action="stop">${p("x",14)}<span>\u505C\u6B62</span></button>`:""}
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
    ${Pc(e)}
    ${e.id==="judgment_parquet"?Hc():""}
    ${e.id==="normalize_courts"?Uc():""}
    ${e.id==="backfill_law_articles"?Qc():""}
    ${e.id==="judgment_import"?Dc(e):""}
    ${e.id==="index_versions"?Fc(e):""}
    ${e.id==="index_versions"?zc(t):""}
    ${e.id==="judgment_download"?`<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${p("calendar",14)}\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B</span>
              <button class="btn btn-ghost btn-sm" type="button" title="\u91CD\u65B0\u6383\u63CF raw_rar \u76EE\u9304\u8207\u6708\u4EFD\u72C0\u614B" data-processing-action="refresh-judgment-months">${p("refresh",13)}<span>\u91CD\u65B0\u6574\u7406</span></button>
            </div>
            <div data-judgment-months-slot data-preserve-children>${xn()}</div>
          </section>`:""}
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${p("history",14)}\u6700\u8FD1\u57F7\u884C</span>
        ${dt(a?.status||"idle")}
      </div>
      ${Sc(a)}
    </section>
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${p("history",14)}\u57F7\u884C\u7D00\u9304</span>
        <span class="badge badge-neutral">\u6700\u8FD1 ${d((e.recent_runs||[]).length)} \u7B46</span>
      </div>
      ${Nc(e.recent_runs)}
    </section>
    ${["law_download","order_download","judgment_download"].includes(e.id)?`<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${p("search",14)}\u7248\u672C\u6AA2\u67E5\u7D00\u9304</span>
              <span class="badge badge-neutral">\u6700\u8FD1 ${d((e.update_history||[]).length)} \u7B46</span>
            </div>
            ${Ec(e)}
          </section>`:""}
  </div>`}function _a(e,t,s={},a=new Set){if(t==="overview")return di(e,a);let i=(Array.isArray(e.workflows)?e.workflows:[]).find(o=>o.id===t);return i?Kc(i,s):di(e,a)}async function Yc(e){e.innerHTML=`<section class="page processing-page">
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
          ${p("x",14)}<span>\u505C\u6B62\u66F4\u65B0</span>
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
  </section>`;let t=e.querySelector(".processing-page"),s=e.querySelector("#processing-root"),a=e.querySelector("#processing-workflows"),n=e.querySelector("#processing-stop"),i=document.createElement("div");i.className="processing-stage-tooltip",i.hidden=!0,t.appendChild(i),kt=new Map;let o=!1,l=!1,u=!1,c=null,b="",$="",v="overview",f=null,h=!1,_=null,S=null,R=!1,O=null,I=0,Q=null,oe=!1,te=null,je=0,De=null,X=!1,P=null,k=0,M=null,Z=!1,ue=null,G=0,ee=!1,J=null,le=!1,me=!1,K="",we=new Set,Be=null,ke=null,tt=-1,ie="",$e=0,_e=0,Ae=null,Ye=[],nt=()=>({storage:S,loading:R,error:O,courtCheck:Q,courtCheckLoading:oe,courtCheckError:te,lawVersionCheck:De,lawVersionCheckLoading:X,lawVersionCheckError:P}),L=()=>{if(v!=="judgment_download")return;let m=s.querySelector(".processing-workflow-panel");if(!m)return;m.querySelectorAll(".judgment-month.is-active").forEach(Oe=>{Oe.classList.remove("is-active"),Oe.removeAttribute("aria-current")});let y=m.querySelector("[data-judgment-progress]");if(!y)return;let N=f?.progress,W=!!(c?.workflows||[]).find(Oe=>Oe.id==="judgment_download")?.active_run;if((!N||N.active===!1)&&!W){y.hidden=!0,y.classList.remove("is-indeterminate");return}if(y.hidden=!1,!N||N.active===!1){let Oe=y.querySelector("[data-judgment-progress-phase]");Oe&&(Oe.textContent="\u6E96\u5099\u4E2D");let ut=y.querySelector("[data-judgment-progress-month]");ut&&(ut.textContent="\u2014");let Ce=y.querySelector("[data-judgment-progress-filename]");Ce&&(Ce.textContent="\u7B49\u5F85\u4E0B\u8F09\u7A0B\u5E8F\u56DE\u5831\u9032\u5EA6\u2026",Ce.title=""),y.classList.add("is-indeterminate");let mt=y.querySelector("[data-judgment-progress-bar]");mt&&(mt.style.width="");let Fe=y.querySelector("[data-judgment-progress-percent]");Fe&&(Fe.textContent="\u2014");let gt=y.querySelector("[data-judgment-progress-size]");gt&&(gt.textContent="\u2014");let ht=y.querySelector("[data-judgment-progress-note]");ht&&(ht.textContent="\u5DF2\u555F\u52D5\uFF0C\u7B49\u5F85\u9032\u5EA6\u56DE\u5831");return}let se={preparing:"\u6E96\u5099\u4E2D",scanning:"\u6383\u63CF\u4E2D",checking:"\u6AA2\u67E5\u4E2D",downloading:"\u4E0B\u8F09\u4E2D",saving:"\u5132\u5B58\u4E2D",finalizing:"\u6574\u7406\u4E2D"}[N.phase]||"\u8655\u7406\u4E2D",pe=y.querySelector("[data-judgment-progress-phase]");pe&&(pe.textContent=se);let de=N.month||"",he=y.querySelector("[data-judgment-progress-month]");he&&(he.textContent=de||"\u2014");let Ne=N.filename||"",Ze=y.querySelector("[data-judgment-progress-filename]");if(Ze&&(Ze.textContent=Ne||"\u2014",Ze.title=Ne),de){let Oe=m.querySelector(`[data-judgment-month-key="${de}"]`);Oe&&(Oe.classList.add("is-active"),Oe.setAttribute("aria-current","true"))}let g=Number(N.bytes_written),j=Number(N.total_bytes),E=Number.isFinite(j)&&j>0,Y=null,fe=N.percent;fe!=null&&fe!==""&&Number.isFinite(Number(fe))?Y=Number(fe):E&&Number.isFinite(g)&&(Y=g/j*100);let xe=Y===null;y.classList.toggle("is-indeterminate",xe);let ze=y.querySelector("[data-judgment-progress-bar]");ze&&(ze.style.width=xe?"":`${Math.min(100,Math.max(0,Y)).toFixed(1)}%`);let Ee=y.querySelector("[data-judgment-progress-percent]");if(Ee){let Oe=xe?null:Math.min(100,Math.max(0,Y));Ee.textContent=Oe===null?"\u2014":`${Oe.toFixed(Oe>=10?0:1)}%`}let et=y.querySelector("[data-judgment-progress-size]");if(et){let Oe=Number.isFinite(g)&&g>0?Le(g):"\u2014";et.textContent=E?`${Oe} / ${Le(j)}`:Oe}let rt=y.querySelector("[data-judgment-progress-note]");if(rt){let Oe=[],ut=Number(N.candidate_index),Ce=Number(N.candidate_total);Number.isFinite(ut)&&ut>0&&Number.isFinite(Ce)&&Ce>0&&Oe.push(`\u7B2C ${d(ut)} / ${d(Ce)} \u500B\u6708`),N.fileset_id&&Oe.push(`fileset ${N.fileset_id}`),N.message&&N.phase!=="downloading"&&Oe.push(String(N.message)),rt.textContent=Oe.join(" \xB7 ")}},C=()=>{if(v!=="judgment_download")return;let m=s.querySelector("[data-judgment-months-slot]");if(m){let y=Array.isArray(f?.months)?f.months:[];_&&!f?(m.innerHTML=Re({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:r(_)}),delete m.dataset.judgmentMonthCount):f?m.dataset.judgmentMonthCount!==String(y.length)?(m.innerHTML=jc(f),m.dataset.judgmentMonthCount=String(y.length)):Tc(m,f):(m.querySelector(".judgment-months-loading")||(m.innerHTML=xn()),delete m.dataset.judgmentMonthCount)}L()},B=()=>{let m=Array.isArray(M?.hosts)?M.hosts:[];return JSON.stringify({loading:!m.length&&Z,error:!m.length&&ue?ue.message||String(ue):"",active:M?.active_host_id??null,hosts:m.map(y=>({id:y.id,name:y.name,url:y.base_url,status:y.status,detail:y.detail,embedding:y.embedding_model,chat:y.chat_model,models:(y.models||[]).map(N=>N.name)}))})},D=()=>{let m=s.querySelector("[data-processing-ollama]");if(!m||G)return;let y=B();m.dataset.ollamaSignature!==y&&(m.dataset.ollamaSignature=y,m.innerHTML=Wc(M,Z,M?null:ue))},ve=()=>{let y=((c?.sections||[]).find(N=>N.key==="legal")?.stages||[]).find(N=>N.key==="legal_qdrant");return String(y?.model?.label||"")},V=()=>{let m=s.querySelector("[data-processing-embedding-strip]");if(!m)return;let y=Array.isArray(M?.hosts)?M.hosts:[],N=[];for(let de of y)if(de.status==="operational")for(let he of de.models||[])Array.isArray(he.capabilities)&&he.capabilities.includes("embedding")&&N.push({hostId:Number(de.id),model:he.name,label:`${de.name||de.base_url||`\u4E3B\u6A5F ${de.id}`}:${he.name}`,baseUrl:de.base_url||""});let re=ve(),W=y.find(de=>Number(de.id)===Number(M?.active_host_id)),ce=N.map(de=>{let he=de.label===re;return`<button class="rag-model-button${he?" is-active":""}" type="button"
        data-processing-action="select-embedding-model"
        data-host-id="${de.hostId}"
        data-model="${r(de.model)}"
        title="${r(de.label)}"
        aria-pressed="${he?"true":"false"}"
        ${me?"disabled":""}>
        <span class="rag-model-state" aria-hidden="true"></span>
        <span>${r(de.label)}</span>
        ${he?'<span class="rag-model-current">\u4F7F\u7528\u4E2D</span>':""}
      </button>`});re&&!N.some(de=>de.label===re)&&ce.unshift(`<button class="rag-model-button is-active is-static" type="button" aria-pressed="true" disabled>
          <span class="rag-model-state" aria-hidden="true"></span>
          <span>${r(re)}</span>
          <span class="rag-model-current">\u4F7F\u7528\u4E2D</span>
        </button>`);let se=N.length?`<div class="rag-model-buttons">${ce.join("")}</div>`:`<p class="rag-model-empty">${Z?"\u8B80\u53D6\u7DDA\u4E0A\u4E3B\u6A5F\u8207 Embedding model\u2026":ue?`\u7121\u6CD5\u8B80\u53D6\u7DDA\u4E0A\u4E3B\u6A5F\uFF1A${r(ue.message||String(ue))}`:"\u76EE\u524D\u6C92\u6709\u53EF\u7528\u7684 Embedding model\u3002"}</p>`,pe=`<div class="processing-embedding-strip rag-model-strip">
      <div class="rag-model-strip-head">
        <span class="rag-model-strip-title">${p("brain",13)} Embedding \u4E3B\u6A5F\uFF0F\u6A21\u578B</span>
        ${W?.base_url?`<span class="rag-model-strip-base mono">${r(W.base_url)}</span>`:""}
        <span class="rag-model-strip-current">\u76EE\u524D\uFF1A<strong>${r(re||"\u2014")}</strong></span>
        <button class="btn btn-ghost btn-sm rag-model-refresh" type="button"
          data-processing-action="refresh-embedding-models"
          ${Z?"disabled":""}>
          ${p("refresh",12)}<span>\u6AA2\u67E5\u6A21\u578B</span>
        </button>
      </div>
      ${se}
      <p class="rag-model-hint">\u9EDE\u9078 <span class="mono">\u4E3B\u6A5F:\u6A21\u578B</span> \u5207\u63DB Embedding\uFF1B\u9078\u53D6\u5F8C\u6703\u6210\u70BA\u7B2C\u4E00\u512A\u5148\uFF0C\u5176\u4ED6\u4E3B\u6A5F\u4F9D\u5E8F\u4F5C\u70BA\u5099\u63F4\u3002\u5207\u63DB\u6A21\u578B\u5F8C\u65E2\u6709\u7D22\u5F15\u53EF\u80FD\u9700\u8981\u91CD\u5EFA\u3002</p>
    </div>`;m.innerHTML!==pe&&(m.innerHTML=pe)},Pe=m=>{let y=s.querySelector('[data-import-timeline="judgment"]');if(!y)return;let N=String(m?.active_month||""),re=String(m?.processing_month||"");y.querySelectorAll(".processing-month").forEach(Ne=>{let Ze=!!N&&Ne.dataset.month===N;Ne.classList.toggle("is-current",Ze),Ne.classList.toggle("is-processing-current",!!re&&Ne.dataset.month===re),Ze?Ne.setAttribute("aria-current","true"):Ne.removeAttribute("aria-current")});let W=y.querySelector(".index-current-row");if(!N||!m?.active_archive){W&&W.remove();return}let ce=c?.workflows?.find(Ne=>Ne.id==="judgment_import")?.import_timeline?.stage_labels||{},se=gi({activeMonth:N,activeArchive:m.active_archive,activePhase:m.active_phase||"",processingMonth:m.processing_month||"",processingArchive:m.processing_archive||"",stageLabels:ce});if(W){W.innerHTML=se;return}let pe=y.querySelector(".judgment-months");if(!pe)return;let de=document.createElement("div");de.className="index-current-row",de.innerHTML=se;let he=pe.querySelector(".judgment-months-meta");he?he.insertAdjacentElement("afterend",de):pe.prepend(de)},F=m=>{let y=Number(m?.state_mtime_ns);return Number.isFinite(y)?y:-1},ge=m=>{let y=String(m?.active_month||"");return/^\d{6}$/.test(y)?Number(y):-1},Ue=m=>{if(!m)return;let y=F(m);if(y>=0&&y<tt){ke?.active_month&&Pe(ke);return}y>=0&&(tt=y);let N=String(m.active_month||"");if(!!(m.run_id&&m.run_id===ke?.run_id)&&ge(m)>=0&&ge(m)<ge(ke)){let W={...m,active_month:ke.active_month,active_archive:ke.active_archive};ke=W,Pe(W);return}if(!N&&m.run_status==="running"){ke?.active_month&&ke?.run_id===m.run_id?Pe(ke):(ke=m,Pe(m));return}ke=m,Pe(m)},Ge=m=>{let y=m?.active_import;if(y){Ue(y);return}ke?.active_month&&Pe(ke)},ls=()=>{o||Be||(Be=bt(["processing","judgment-download","system-usage","ollama","court-check","law-version-check"],(m,y)=>{if(!o){if(m==="processing"){y?.snapshot?.live?xs(y.snapshot):y?.snapshot?Ve(y.snapshot,{silent:!0}):zt({silent:!0});return}if(m==="judgment-download"){v==="judgment_download"&&Ft({quiet:!0,payload:y?.snapshot||null});return}if(m==="system-usage"){v==="index_versions"&&w({quiet:!0,force:!0,payload:y?.snapshot||null});return}if(m==="ollama"){_n.has(v)&&Je({quiet:!0,payload:y?.snapshot||null});return}if(m==="court-check"){v==="normalize_courts"&&x({quiet:!0,force:!0,payload:y?.snapshot||null});return}m==="law-version-check"&&v==="backfill_law_articles"&&q({quiet:!0,force:!0,payload:y?.snapshot||null})}},{onProgress:(m,y)=>{if(m!=="processing")return;let N=y?.event;N&&us(N)},onError:()=>{c||zt({silent:!0})}}))},Xe=()=>{Be&&(Be(),Be=null)},Ss=async m=>{if(me)return;let[y,...N]=String(m||"").split("|"),re=Number(y),W=N.join("|");if(!re||!W){V();return}let ce=(M?.hosts||[]).find(pe=>Number(pe.id)===re);if(!ce){V();return}let se=`${ce.name||ce.base_url||`\u4E3B\u6A5F ${ce.id}`}:${W}`;if(se===ve()){V();return}if(!window.confirm(`\u5207\u63DB Embedding \u70BA ${se}\uFF1F

\u5207\u63DB\u6A21\u578B\u5F8C\uFF0C\u65E2\u6709\u6CD5\u898F\uFF0F\u547D\u4EE4\u8207\u5224\u6C7A\u5411\u91CF\u7D22\u5F15\u53EF\u80FD\u4E0D\u76F8\u5BB9\uFF0C\u9700\u8981\u91CD\u65B0\u5EFA\u7ACB\u7D22\u5F15\u3002`)){V();return}me=!0,V();try{await z.selectOllamaModel(re,{model:W,role:"embedding"});let pe=(M?.hosts||[]).map(he=>Number(he.id)),de=[re,...pe.filter(he=>he!==re)];await z.reorderOllamaHosts(de),A(`\u5DF2\u5207\u63DB Embedding \u70BA ${se}\u3002`,"ok",6e3),M=null,await Je({quiet:!0}),await zt({silent:!0})}catch(pe){A(pe.message||"\u7121\u6CD5\u5207\u63DB Embedding model\u3002","danger",7e3),await Je({quiet:!0})}finally{me=!1,V()}},Je=async({quiet:m=!1,button:y=null,payload:N=null}={})=>{if(!(o||Z)){Z=!0,ue=null,M||(D(),V()),y&&qe(y,!0,"\u6AA2\u67E5\u4E2D\u2026");try{let re=N||await z.ollamaHosts();if(o)return;M=re}catch(re){if(o)return;ue=re,m||A(re.message||"\u7121\u6CD5\u6AA2\u67E5 Ollama \u4E3B\u6A5F\u3002","danger",6e3)}finally{o||(Z=!1,y&&qe(y,!1),D(),V())}}},cs=async m=>{if(le)return;let y=(M?.hosts||[]).map(ce=>Number(ce.id)),N=m.map(ce=>Number(ce));if(!N.length||N.length!==y.length||N.every((ce,se)=>ce===y[se])){D();return}le=!0;let re=new Map((M?.hosts||[]).map(ce=>[Number(ce.id),ce])),W=N.map(ce=>re.get(ce)).filter(Boolean);if(M&&W.length===y.length){M={...M,hosts:W,active_host_id:N[0]};let ce=s.querySelector("[data-processing-ollama]");ce&&(ce.dataset.ollamaSignature=""),D()}try{await z.reorderOllamaHosts(N),A("\u5DF2\u66F4\u65B0 Ollama \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","ok",3500)}catch(ce){A(ce.message||"\u7121\u6CD5\u66F4\u65B0 Ollama \u4E3B\u6A5F\u512A\u5148\u9806\u5E8F\u3002","danger",6e3),await Je({quiet:!0})}finally{le=!1}},ds=()=>{let m=s.querySelector("[data-processing-ollama]");m&&(m.dataset.ollamaSignature=""),D()},Bt=()=>{let m=J;if(!m)return;if(s.querySelector(`[data-ollama-host][data-host-id="${m.hostId}"]`)?.classList.remove("is-dragging"),m.captureTarget?.hasPointerCapture?.(m.pointerId))try{m.captureTarget.releasePointerCapture(m.pointerId)}catch{}document.documentElement.classList.remove("processing-ollama-dragging"),window.removeEventListener("pointermove",qt),window.removeEventListener("pointerup",Ot),window.removeEventListener("pointercancel",Dt),J=null,G=0},qt=m=>{let y=J;if(!y||m.pointerId!==y.pointerId)return;if(!y.dragging){if(Math.hypot(m.clientX-y.startX,m.clientY-y.startY)<5)return;y.dragging=!0,G=y.hostId,ee=!1,s.querySelector(`[data-ollama-host][data-host-id="${y.hostId}"]`)?.classList.add("is-dragging"),document.documentElement.classList.add("processing-ollama-dragging")}m.preventDefault();let N=64;m.clientY<N?window.scrollBy(0,-12):m.clientY>window.innerHeight-N&&window.scrollBy(0,12);let re=s.querySelector("[data-ollama-list]"),W=document.elementFromPoint(m.clientX,m.clientY)?.closest?.("[data-ollama-host]");if(!re||!W||!re.contains(W))return;let ce=re.querySelector(`[data-ollama-host][data-host-id="${y.hostId}"]`);if(!ce||ce===W)return;let se=W.getBoundingClientRect(),pe=m.clientY>se.top+se.height/2;re.insertBefore(ce,pe?W.nextSibling:W),ee=!0},Ot=m=>{let y=J;if(!y||m.pointerId!==y.pointerId)return;let N=y.dragging,re=ee,W=s.querySelector("[data-ollama-list]"),ce=N&&W?[...W.querySelectorAll("[data-ollama-host]")].map(se=>Number(se.dataset.hostId)):[];Bt(),N&&re&&ce.length&&cs(ce)},Dt=()=>{let m=!!J?.dragging;Bt(),m&&ds()},Et=m=>{if(m.button!==0||m.pointerType==="mouse"&&m.buttons!==1||le||J)return;let y=m.target.closest("[data-ollama-host]");if(!y||!s.contains(y)||m.target.closest("button")||m.pointerType==="touch"&&!m.target.closest(".processing-ollama-handle"))return;let N=Number(y.dataset.hostId)||0;if(N){m.preventDefault(),G=N,J={hostId:N,pointerId:m.pointerId,startX:m.clientX,startY:m.clientY,dragging:!1,captureTarget:y};try{y.setPointerCapture(m.pointerId)}catch{}window.addEventListener("pointermove",qt,{passive:!1}),window.addEventListener("pointerup",Ot),window.addEventListener("pointercancel",Dt)}},Ft=async({quiet:m=!1,payload:y=null}={})=>{if(!h){h=!0,!f&&v==="judgment_download"&&C();try{f=y||await z.judgmentDownloadStatus(),_=null}catch(N){_=N.message||"\u8B80\u53D6\u6708\u4EFD\u72C0\u614B\u5931\u6557\u3002",m||A(_,"danger",7e3)}finally{h=!1,v==="judgment_download"&&C()}}},w=async({quiet:m=!0,force:y=!1,payload:N=null}={})=>{if(!R&&!(!y&&S&&Date.now()-I<3e4)){R=!0;try{S=N||await z.systemUsage(),O=null,I=Date.now()}catch(re){O=re.message||"\u7121\u6CD5\u53D6\u5F97 Qdrant \u5BB9\u5668\u8207 volume \u8CC7\u8A0A\u3002",m||A(O,"danger",7e3)}finally{R=!1}}},x=async({quiet:m=!0,force:y=!1,payload:N=null}={})=>{if(!oe&&!(!y&&Q&&Date.now()-je<6e4)){oe=!0;try{Q=N||await z.checkCourts(),te=null,je=Date.now()}catch(re){te=re.message||"\u7121\u6CD5\u6AA2\u67E5\u6CD5\u9662\u540D\u7A31\u3002",m||A(te,"danger",7e3)}finally{oe=!1}}},q=async({quiet:m=!0,force:y=!1,button:N=null,payload:re=null}={})=>{if(!X&&!(!y&&De&&Date.now()-k<6e4)){X=!0,N&&qe(N,!0,"\u6AA2\u67E5\u4E2D\u2026");try{if(De=re||await z.checkLawVersions(),P=null,k=Date.now(),!m){let W=De.totals||{},ce=Number(W.needs_backfill_versions)||0,se=Number(W.backfillable_versions)||0,pe=Number(W.blocked_versions)||0;ce>0?A(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u9700\u8981\u5EFA\u7ACB ${ce} \u500B\u7248\u672C\u7684\u689D\u6587\u6B77\u53F2\uFF08\u53EF\u5EFA\u7ACB ${se}\u3001\u7F3A\u539F\u59CB\u6A94 ${pe}\uFF09\u3002`,pe>0?"danger":"warn",7e3):A(`\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D ${Number(W.versions)||0} \u500B\u7248\u672C\u90FD\u5DF2\u6709\u6B77\u53F2\u689D\u6587\uFF0C\u4E0D\u9700\u8981\u5EFA\u7ACB\u3002`,"ok",5e3)}}catch(W){P=W.message||"\u7121\u6CD5\u6AA2\u67E5\u689D\u6587\u6B77\u53F2\u72C0\u614B\u3002",m||A(P,"danger",7e3)}finally{X=!1,N&&qe(N,!1)}}},T=m=>Array.from(s.querySelectorAll("[data-stage-key]")).find(y=>y.dataset.stageKey===m)||null,H=m=>{if(!m)return;we.add(m);let y=Array.from(s.querySelectorAll(".processing-wf-stage[data-processing-stage]")).find(N=>N.dataset.processingStage===m);y&&(y.open=!0,y.scrollIntoView({behavior:"smooth",block:"center"}))},U=()=>{K&&(K="",i.hidden=!0,s.querySelectorAll("[data-workflow-progress]").forEach(m=>{m.classList.remove("is-stage-hovering")}),s.querySelectorAll("[data-stage-key]").forEach(m=>{m.classList.remove("is-stage-hovered")}))},ne=m=>{let y=m.dataset.stageKey||"";if(!y)return;K=y;let N=m.closest("[data-workflow-progress]");s.querySelectorAll("[data-workflow-progress]").forEach(E=>{E.classList.toggle("is-stage-hovering",E===N)}),s.querySelectorAll("[data-stage-key]").forEach(E=>{E.classList.toggle("is-stage-hovered",E.dataset.stageKey===y)});let re=m.dataset.stageStatusKey||"idle",W=m.dataset.stageStatus||Sn(re).label,ce=m.dataset.stageColor||"var(--accent)",se=Number(m.dataset.stageUpdate)||0,pe=Number(m.dataset.stagePending)||0,de=m.dataset.stageContributionLabel||"\u6574\u9AD4\u5360\u6BD4";i.innerHTML=`<div class="processing-stage-tooltip-head">
      <span class="processing-stage-tooltip-swatch" style="background:${r(ce)}"></span>
      <strong>${r(m.dataset.stageLabel||y)}</strong>
      ${dt(re,W)}
    </div>
    <div class="processing-stage-tooltip-meta">
      <span>\u968E\u6BB5\u9032\u5EA6 <strong>${r(m.dataset.stagePercent||"\u2014")}</strong></span>
      <span>${r(de)} <strong>${r(m.dataset.stageContribution||"\u2014")}</strong></span>
      <span class="mono">${r(m.dataset.stageDuration||"\u2014")}</span>
    </div>
    <div class="processing-stage-tooltip-counts">${r(m.dataset.stageCounts||"\u2014")}</div>
    ${se||pe?`<div class="processing-stage-tooltip-badges">
            ${se?`<span class="processing-wf-count is-update">${p("download",11)}<strong>${d(se)}</strong><span>\u7DDA\u4E0A\u66F4\u65B0</span></span>`:""}
            ${pe?`<span class="processing-wf-count is-pending">${p("clock",11)}<strong>${d(pe)}</strong><span>\u5F85\u57F7\u884C</span></span>`:""}
          </div>`:""}
    ${m.dataset.stageMessage?`<div class="processing-stage-tooltip-message">${r(m.dataset.stageMessage)}</div>`:""}`,i.hidden=!1;let he=Math.min(300,Math.max(220,window.innerWidth-24));i.style.width=`${he}px`;let Ne=m.getBoundingClientRect(),Ze=Math.min(window.innerWidth-he-12,Math.max(12,Ne.left)),g=Ne.top-i.offsetHeight-10,j=g>=12?g:Math.min(window.innerHeight-i.offsetHeight-12,Ne.bottom+10);i.style.left=`${Ze}px`,i.style.top=`${Math.max(12,j)}px`},Se=m=>{if(m.target.closest(".is-failure-tip")){U();return}if(m.target.closest(".processing-wf-rail"))return;let y=m.target.closest("[data-stage-key]");!y||!s.contains(y)||y.contains(m.relatedTarget)||ne(y)},Te=m=>{let y=m.target.closest("[data-stage-key]");if(!y||!s.contains(y)||y.contains(m.relatedTarget))return;let N=m.relatedTarget?.closest?.("[data-stage-key]");N&&N.dataset.stageKey===y.dataset.stageKey||U()},ye=m=>{let y=m.capabilities||{};!u&&n&&(n.hidden=!y.can_stop_update)},Ie=()=>{if(!c)return;let m=_a(c,v,nt(),we);m!==b&&(es(s,m),b=m),C(),D(),V(),Ge(c)},Ve=(m,{silent:y=!1}={})=>{if(o||!m)return;let N=Date.parse(m.generated_at||""),re=Date.parse(c?.generated_at||"");if(Number.isFinite(N)&&Number.isFinite(re)&&N<re)return;if(xt){let de=(m.workflows||[]).find(Ne=>Ne.id===xt),he=de?.active_run?.id||de?.last_run?.id||"";(de?.active_run||he&&he!==ws)&&(xt="",ws="")}c=m;let W=new Map;for(let de of m.sections||[])for(let he of de.stages||[])W.set(`${de.key}-${he.key}`,he);for(let[de,he]of kt){if(he.kind!=="upgrade")continue;let Ne=W.get(de);if(Ne){if(Ne.phase==="failed"||Ne.phase==="running"&&Ne.percent!==null){kt.delete(de);continue}if(Ne.phase==="completed"){let Ze=Date.parse(Ne.last_run?.started_at||"");Number.isFinite(Ze)&&Ze>=Number(he.startedAt||0)-1e3&&kt.delete(de)}}}let ce=wn(m,v);ce!==$&&(es(a,ce),$=ce);let se=_a(m,v,nt(),we);if(se!==b&&(es(s,se),b=se),C(),D(),K){let de=T(K);de?ne(de):U()}let pe=s.querySelector("[data-processing-updated-at]");if(pe){let de=Me(m.generated_at);pe.textContent!==de&&(pe.textContent=de)}if(ye(m),V(),Ge(m),!M&&!Z&&Je({quiet:!0}),Ye.length){let de=Ye.splice(0);for(let he of de)us(he)}},We=m=>{if(Ae=m,typeof requestAnimationFrame>"u"){let y=Ae;Ae=null,y&&xs(y);return}_e||(_e=requestAnimationFrame(()=>{_e=0;let y=Ae;Ae=null,y&&xs(y)}))},us=m=>{if(!m)return;if(!c){Ye.push(m),Ye.length>100&&Ye.shift();return}let y=String(m.run_id||""),N=Number(m.seq)||0;if(y&&y===ie&&N>0&&N<=$e)return;y&&y!==ie&&(ie=y,$e=0),N>0&&($e=N);let re=String(m.workflow_id||"judgment_import"),W=(c.workflows||[]).find(he=>he.id===re);if(!W)return;W.progress||(W.progress={stages:[]}),Array.isArray(W.progress.stages)||(W.progress.stages=[]);let ce=String(m.stage||""),se=ce?W.progress.stages.find(he=>String(he.key)===ce):null;if(se&&(m.status&&(se.status=String(m.status)),m.current!==void 0&&(se.current=Number(m.current)||0),m.total!==void 0&&(se.total=Number(m.total)||0),m.percent!==void 0&&(se.percent=Number(m.percent)||0),m.message&&(se.message=String(m.message))),m.overall_percent!==void 0&&(W.progress.overall_percent=Number(m.overall_percent)||0),m.type!=="run_finished"&&(W.progress.run_status="running"),(m.type==="archive_started"||m.type==="stage_progress")&&!W.active_run&&m.run_id&&(W.active_run={id:m.run_id,status:"running",started_at:m.timestamp,message:m.message||""}),m.type==="archive_completed")for(let he of W.progress.stages)(he.key==="filter"||he.key==="postgres")&&(he.status="success");m.type==="run_finished"&&(W.active_run=null,W.progress.run_status=String(m.status||"success"),W.can_run=!0);let pe=[];m.month&&m.month_stages&&pe.push({month:m.month,import_stages:m.month_stages,import_overall:m.month_overall||""});let de=null;if(m.type==="archive_started"&&m.month){let he=Date.parse(m.timestamp||"");de={active_month:m.month,active_archive:m.archive,active_phase:m.stage||"filter",processing_month:m.month,processing_archive:m.archive,run_id:m.run_id,run_status:"running",state_mtime_ns:Number.isFinite(he)?he*1e6:Date.now()*1e6}}else m.type==="run_finished"&&(de={...c.active_import||{},run_status:String(m.status||"success")});We({live:!0,generated_at:m.timestamp,workflows:[{id:re,active_run:W.active_run,last_run:W.last_run,progress:W.progress,can_run:W.can_run}],import_timeline_months:pe,active_import:de})},xs=m=>{if(o||!m||!c)return;let y=new Map((m.workflows||[]).map(se=>[se.id,se]));if(xt){let se=y.get(xt),pe=se?.active_run?.id||se?.last_run?.id||"";(se?.active_run||pe&&pe!==ws)&&(xt="",ws="")}for(let se of c.workflows||[]){let pe=y.get(se.id);pe&&("active_run"in pe&&(se.active_run=pe.active_run),"last_run"in pe&&(se.last_run=pe.last_run),Array.isArray(pe.recent_runs)&&(se.recent_runs=pe.recent_runs),pe.progress&&(se.progress=pe.progress),typeof pe.can_run=="boolean"&&(se.can_run=pe.can_run))}let N=se=>{if(!se||!Array.isArray(m.import_timeline_months))return;let pe=new Map((se.months||[]).map(he=>[String(he.month),he]));for(let he of m.import_timeline_months){let Ne=pe.get(String(he.month));Ne&&(Ne.import_stages={...Ne.import_stages||{},...he.import_stages||{}},he.import_overall&&(Ne.import_overall=he.import_overall))}let de={complete:0,incomplete:0,processing:0,empty:0};for(let he of se.months||[]){let Ne=String(he.import_overall||"empty");de[Ne]=Number(de[Ne]||0)+1}se.stage_summary=de};N(c.import_timeline);for(let se of c.workflows||[])se.id==="judgment_import"&&N(se.import_timeline);m.active_import&&(c.active_import=m.active_import),m.mode&&(c.mode=m.mode),m.generated_at&&(c.generated_at=m.generated_at);let re=wn(c,v);re!==$&&(es(a,re),$=re);let W=_a(c,v,nt(),we);W!==b&&(es(s,W),b=W),C(),D(),V(),Ge(c),ye(c);let ce=s.querySelector("[data-processing-updated-at]");if(ce&&m.generated_at){let se=Me(m.generated_at);ce.textContent!==se&&(ce.textContent=se)}},zt=async({silent:m=!1}={})=>{if(!(o||l)){l=!0;try{let y=await z.processing();Ve(y,{silent:m})}catch(y){if(o)return;let N=wc(y.message,c);N!==b&&(es(s,N),b=N),m||A(y.message||"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B\u3002","danger",6e3)}finally{l=!1}}},ja=async(m,y="")=>{if(u)return;u=!0,qe(m,!0,"\u6AA2\u67E5\u4E2D\u2026");let N=oi[y]||"",re=String(m.dataset.sourceTypes||"").split(",").map(se=>se.trim()).filter(Boolean),W=re.length?re:N?[N]:[],ce=m.dataset.stageId||"";ce&&(kt.set(ce,{kind:"check",phase:"updating",startedAt:Date.now()}),Ie());try{let se=await z.checkUpdates(W);if(se&&se.checking)ce&&(kt.delete(ce),Ie()),A("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u8ACB\u7A0D\u5F8C\u91CD\u65B0\u6574\u7406\u3002","info",6e3);else if(W.length===1){let pe=(se.sources||{})[W[0]]||{},de=li[y]||(W[0]==="judgment"?"\u5224\u6C7A":W[0]==="law"?"\u6CD5\u898F":W[0]==="order"?"\u547D\u4EE4":"\u8CC7\u6599");pe.status==="error"?A(`${de}\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF1A${pe.message||"\u7121\u6CD5\u53D6\u5F97\u7DDA\u4E0A\u7248\u672C"}`,"danger",7e3):A(pe.update_available?`${de}\u7DDA\u4E0A\u5DF2\u6709\u66F4\u65B0\u7248\u672C\u3002`:`${de}\u7DDA\u4E0A\u5DF2\u662F\u6700\u65B0\u7248\u672C\u3002`,pe.update_available?"warn":"ok",6e3)}else if(W.length>1){let pe=se.sources||{},de=W.filter(Ne=>pe[Ne]?.update_available),he=W.filter(Ne=>pe[Ne]?.status==="error");he.length?A(`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF0C\u4F46\u6709 ${he.length} \u9805\u6AA2\u67E5\u5931\u6557\u3002`,"danger",7e3):A(de.length?`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A${de.length} \u9805\u6709\u66F4\u65B0\u3002`:"\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D\u7686\u70BA\u6700\u65B0\u3002",de.length?"warn":"ok",6e3)}else{let pe=Number(se.update_count)||0;A(pe>0?`\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A${pe} \u9805\u6709\u66F4\u65B0\u3002`:"\u66F4\u65B0\u6AA2\u67E5\u5B8C\u6210\uFF1A\u76EE\u524D\u7686\u70BA\u6700\u65B0\u3002",pe>0?"warn":"ok",6e3)}ce&&(kt.set(ce,{kind:"check",phase:"updated",startedAt:Date.now()}),Ie()),window.dispatchEvent(new CustomEvent("judgment:updates-changed")),await zt({silent:!0})}catch(se){ce&&(kt.delete(ce),Ie()),A(se.message||"\u66F4\u65B0\u6AA2\u67E5\u5931\u6557\u3002","danger",7e3)}finally{u=!1,qe(m,!1),c&&ye(c)}},qs=async m=>{let y=oi[m]||"";if(!y)return!0;let N=null;try{N=await z.checkUpdates([y])}catch(W){return A(`\u7121\u6CD5\u5B8C\u6210\u7248\u672C\u6AA2\u67E5\uFF08${W.message||"\u7DB2\u8DEF\u932F\u8AA4"}\uFF09\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002`,"warn",7e3),!0}if(!N||N.checking)return N&&N.checking&&A("\u5DF2\u6709\u66F4\u65B0\u6AA2\u67E5\u6B63\u5728\u9032\u884C\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002","info",6e3),!0;let re=(N.sources||{})[y];if(!re)return!0;if(window.dispatchEvent(new CustomEvent("judgment:updates-changed")),re.status==="up_to_date"&&!re.update_available){let W=li[m]||"\u8CC7\u6599",ce=re.checked_at?`\uFF08${Me(re.checked_at)} \u6AA2\u67E5\uFF09`:"",se=lc[m]||"\u4ECD\u8981\u5F37\u5236\u91CD\u65B0\u4E0B\u8F09\u55CE\uFF1F";return window.confirm(`${W}\u7DDA\u4E0A\u6AA2\u67E5\u70BA\u6700\u65B0\u7248\u672C${ce}\u3002

${se}`)}return re.status==="error"&&A("\u7248\u672C\u6AA2\u67E5\u5931\u6557\uFF0C\u5C07\u76F4\u63A5\u57F7\u884C\u4E0B\u8F09\u3002","warn",6e3),!0},Ta=async(m,y)=>{if(u)return;u=!0;let N=(c?.workflows||[]).find(ce=>ce.id===y);ws=N?.active_run?.id||N?.last_run?.id||"",xt=y,qe(m,!0,"\u57F7\u884C\u4E2D"),s.querySelectorAll("[data-workflow-progress]").forEach(ce=>ce.remove());let re=m.dataset.stageId||"",W=!1;try{if(!await qs(y))return;re&&(kt.set(re,{kind:"upgrade",phase:"upgrading",startedAt:Date.now()}),Ie());let se;try{se=await z.startProcessingWorkflow(y)}catch(pe){throw re&&(kt.delete(re),Ie()),pe}W=!0,A("\u5DF2\u555F\u52D5\u5347\u7D1A\u5DE5\u4F5C\u6D41\u7A0B\u3002","ok",6e3),se&&se.run_id&&console.info("processing workflow started",se),window.dispatchEvent(new CustomEvent("judgment:updates-changed"))}catch(ce){A(ce.message||"\u7121\u6CD5\u555F\u52D5\u5DE5\u4F5C\u6D41\u7A0B\u3002","danger",7e3)}finally{u=!1,(!W||xt!==y)&&(xt="",ws="",c?(ye(c),b="",Ie()):qe(m,!1))}},Gs=async m=>{if(!u){u=!0,qe(m,!0,"\u505C\u6B62\u4E2D\u2026");try{let y=await z.stopProcessingUpdate();for(let[N,re]of kt)re.kind==="upgrade"&&kt.delete(N);Ie(),A(y.message||"\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info",6e3)}catch(y){A(y.message||"\u7121\u6CD5\u505C\u6B62\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{u=!1,qe(m,!1),c&&ye(c)}}},wt=m=>{let y=m.target.closest("[data-processing-action]");if(!y||y.disabled)return;y.closest(".processing-wf-rail")&&(m.preventDefault(),m.stopPropagation());let N=y.dataset.processingAction;if(N==="refresh")zt({silent:!1});else if(N==="open-stage")H(y.dataset.stageId||"");else if(N==="refresh-judgment-months")Ft({quiet:!1});else if(N==="refresh-index-storage")w({quiet:!1,force:!0});else if(N==="refresh-court-check")x({quiet:!1,force:!0});else if(N==="refresh-law-version-check")q({quiet:!1,force:!0,button:y});else if(N==="refresh-ollama")Je({quiet:!1,button:y});else if(N==="refresh-embedding-models")Je({quiet:!1,button:y});else if(N==="select-embedding-model"){let re=y.dataset.hostId||"",W=y.dataset.model||"";Ss(`${re}|${W}`)}else if(N==="move-ollama-host"){let re=M?.hosts||[],W=re.findIndex(de=>Number(de.id)===Number(y.dataset.hostId)),ce=y.dataset.direction,se=ce==="up"?W-1:ce==="down"?W+1:-1;if(W<0||se<0||se>=re.length)return;let pe=re.map(de=>Number(de.id));[pe[W],pe[se]]=[pe[se],pe[W]],cs(pe)}else if(N==="check-updates")ja(y,y.dataset.workflowId||"");else if(N==="run-workflow"){let re=y.dataset.workflowId||"";Ta(y,re)}else N==="stop"&&Gs(y)},At=(m,{scroll:y=!1}={})=>{if(v=m||"overview",c){let N=wn(c,v);es(a,N),$=N;let re=_a(c,v,nt(),we);if(es(s,re),b=re,C(),D(),V(),Ge(c),K){let W=T(K);W?ne(W):U()}y&&s.scrollIntoView({behavior:"smooth",block:"start"})}_n.has(v)&&Je({quiet:!0}),v==="judgment_download"&&Ft({quiet:!0}),v==="index_versions"&&w({quiet:!0}),v==="normalize_courts"&&x({quiet:!0}),v==="backfill_law_articles"&&q({quiet:!0})},As=m=>{let y=m.target.closest("[data-processing-workflow]");y&&At(y.dataset.processingWorkflow||"overview")},Ls=m=>{let y=m.target.closest("[data-timeline-workflow]");y&&(m.preventDefault(),At(y.dataset.timelineWorkflow||"",{scroll:!0}))},Js=m=>{let y=m.target.closest?.(".processing-wf-stage[data-processing-stage]");if(!y||!s.contains(y))return;let N=y.dataset.processingStage||"";N&&(y.open?we.add(N):we.delete(N))};return t.addEventListener("click",wt),a.addEventListener("click",As),s.addEventListener("click",Ls),s.addEventListener("pointerover",Se),s.addEventListener("pointerout",Te),s.addEventListener("pointerdown",Et),s.addEventListener("toggle",Js,!0),window.addEventListener("scroll",U,{capture:!0,passive:!0}),ls(),typeof EventSource>"u"&&await zt({silent:!1}),()=>{o=!0,Xe(),t.removeEventListener("click",wt),a.removeEventListener("click",As),s.removeEventListener("click",Ls),Bt(),s.removeEventListener("pointerover",Se),s.removeEventListener("pointerout",Te),s.removeEventListener("pointerdown",Et),s.removeEventListener("toggle",Js,!0),window.removeEventListener("scroll",U,{capture:!0})}}var Nn={};Ht(Nn,{render:()=>Td});var Ln={draft:{label:"\u8349\u7A3F",badge:"badge-neutral"},pending_review:{label:"\u5F85\u5BE9",badge:"badge-warn"},changes_requested:{label:"\u9000\u56DE\u4FEE\u6539",badge:"badge-warn"},accepted:{label:"\u5DF2\u6838\u51C6",badge:"badge-ok"},rejected:{label:"\u5DF2\u62D2\u7D55",badge:"badge-danger"},retired:{label:"\u5DF2\u522A\u9664\uFF0F\u9000\u5F79",badge:"badge-neutral"}},Nt={law_concept:"\u6CD5\u898F\u6982\u5FF5",article_lookup:"\u6307\u5B9A\u689D\u6587",judgment_lookup:"\u5224\u6C7A\u6AA2\u7D22",structured:"\u7D50\u69CB\u5316\u554F\u984C",general:"\u4E00\u822C\u554F\u984C",refusal:"\u62D2\u7D55\u56DE\u7B54"},_s={easy:"\u7C21\u55AE",medium:"\u4E2D\u7B49",hard:"\u56F0\u96E3"},wi={smoke:"Smoke",core:"Core",full:"Full",holdout:"Holdout"};function Qs(e){let t=Ln[e]||{label:e||"\u672A\u77E5",badge:"badge-neutral"};return`<span class="badge ${t.badge}">${r(t.label)}</span>`}function Mn(e){return String(e||"").split(`
`).map(t=>t.trim()).filter(Boolean)}function Xc(e){return Mn(e).map(t=>{let[s,a]=t.split("|").map(n=>n.trim());return{law_name:s||"",source_type:a||""}})}function Zc(e){return Mn(e).map(t=>{let[s,a]=t.split("|").map(n=>n.trim());return{law_name:s||"",article_no:a||""}})}function ed(e){return Mn(e).map(t=>({jid:t.trim()}))}function td(e){return(e?.expected_laws||[]).map(t=>[t.law_name,t.source_type].filter(Boolean).join("|")).join(`
`)}function sd(e){return(e?.expected_articles||[]).map(t=>[t.law_name||t.law_key,t.article_no].filter(Boolean).join("|")).join(`
`)}function ad(e){return(e?.expected_judgments||[]).map(t=>t.jid).join(`
`)}function nd(e){return(e?.tags||[]).join(", ")}function Us(e){return`<div class="qb-empty">${p("info",18)}<span>${r(e)}</span></div>`}function jn(e){let t=(e.expected_laws||[]).map(i=>i.law_name).filter(Boolean),s=(e.expected_articles||[]).map(i=>`${i.law_name||""} ${i.article_no||""}`.trim()).filter(Boolean),a=(e.expected_judgments||[]).map(i=>i.jid).filter(Boolean),n=[...t.map(i=>`<span class="chip">${r(i)}</span>`),...s.map(i=>`<span class="chip">${r(i)}</span>`),...a.map(i=>`<span class="chip chip-mono">${r(i)}</span>`)];return n.length?`<div class="chips qb-labels">${n.join("")}</div>`:'<span class="qb-muted">\u5C1A\u672A\u6A19\u8A3B expected labels</span>'}function Tn(){return`<details class="qb-import">
    <summary>${p("upload",14)}JSON \u6279\u6B21\u532F\u5165</summary>
    <p class="qb-muted">\u683C\u5F0F\uFF1A<code>{"items":[{question, question_type, difficulty, expected_laws, expected_articles, expected_judgments, reference_answer, tags, rubric}]}</code>\u3002\u76F8\u540C\u984C\u76EE fingerprint \u9810\u8A2D\u66F4\u65B0\u3002</p>
    <textarea class="input" id="qb-import-json" rows="6" placeholder='{"items":[...]}'></textarea>
    <div class="qb-actions">
      <button class="btn btn-secondary btn-sm" type="button" data-qb-action="import-json">${p("upload",13)}<span>\u532F\u5165 JSON</span></button>
    </div>
  </details>`}function rd(e){let t=e?.item||{},s=Array.isArray(e?.warnings)?e.warnings:[],a=Array.isArray(t.tags)?t.tags:[];return`<section class="report-card qb-card qb-ai-result">
    <div class="side-card-head">
      <span class="side-card-title">${p("sparkles",14)}Ollama \u5DF2\u5EFA\u7ACB\u984C\u76EE #${t.id}</span>
      ${Qs(t.status)}
    </div>
    <div class="qb-ai-answer">
      <strong>${r(t.question||"")}</strong>
      <div class="qb-ai-meta">
        ${r(Nt[t.question_type]||t.question_type||"")}
        \xB7 ${r(_s[t.difficulty]||t.difficulty||"")}
        \xB7 ${r(e?.model||"\u672C\u6A5F Ollama")}
      </div>
      ${jn(t)}
      ${t.reference_answer?`<div class="qb-reference"><span class="summary-label">Ollama \u53C3\u8003\u7B54\u6848</span><p>${r(t.reference_answer)}</p></div>`:""}
      ${a.length?`<div class="chips">${a.map(n=>`<span class="chip">${r(n)}</span>`).join("")}</div>`:""}
      ${s.length?`<div class="qb-ai-warnings"><strong>\u9700\u8981\u6CE8\u610F</strong><ul>${s.map(n=>`<li>${r(n)}</li>`).join("")}</ul></div>`:""}
      <div class="qb-actions">
        <button class="btn btn-primary btn-sm" type="button" data-qb-action="review-ai-item">${p("shield",13)}<span>\u524D\u5F80\u9A57\u6536</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="reset-ai">${p("plus",13)}<span>\u518D\u65B0\u589E\u4E00\u984C</span></button>
      </div>
    </div>
    ${Tn()}
  </section>`}function id(e){return e.aiResult?rd(e.aiResult):`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${p("sparkles",14)}AI \u984C\u5EAB\u65B0\u589E</span>
      <span class="badge badge-neutral">\u672C\u6A5F Ollama</span>
    </div>
    <form class="qb-form qb-ai-form" data-qb-form="ai-create" id="qb-create-form">
      <label class="field qb-wide">
        <span class="field-label">\u984C\u76EE <span class="field-tag">question</span></span>
        <textarea class="input" name="question" rows="4" required placeholder="\u8F38\u5165\u554F\u984C\uFF0COllama \u6703\u56DE\u7B54\u4E26\u81EA\u52D5\u5224\u65B7\u984C\u578B\u3001\u96E3\u5EA6\u3001\u6CD5\u898F\uFF0F\u689D\u6587\u3001\u53C3\u8003\u7B54\u6848\u8207\u6A19\u7C64\u3002">${r(e.aiQuestion||"")}</textarea>
      </label>
      <p class="qb-form-hint">\u9001\u51FA\u5F8C\u7531\u672C\u6A5F Ollama \u56DE\u7B54\u4E26\u81EA\u52D5\u5EFA\u7ACB\u6B04\u4F4D\uFF1B\u984C\u76EE\u6703\u4EE5\u300C\u5F85\u5BE9\u300D\u5EFA\u7ACB\uFF0C\u4ECD\u9700\u4EBA\u5DE5\u8986\u6838\u5F8C\u624D\u6703\u6210\u70BA benchmark-ready\u3002</p>
      <div class="qb-actions">
        <button class="btn btn-primary" type="submit" ${e.aiLoading?"disabled":""}>${e.aiLoading?'<span class="spinner"></span><span>Ollama \u7522\u751F\u4E2D\u2026</span>':`${p("sparkles",14)}<span>\u8B93 Ollama \u7522\u751F\u4E26\u5EFA\u7ACB</span>`}</button>
        <button class="btn btn-secondary" type="button" data-qb-action="reset-ai" ${e.aiLoading?"disabled":""}>\u6E05\u9664</button>
      </div>
    </form>
    ${Tn()}
  </section>`}function od(e){return`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${p("edit",14)}\u7DE8\u8F2F\u984C\u76EE #${e.id}</span>
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
          <select class="select" name="question_type">${Object.entries(Nt).map(([t,s])=>`<option value="${t}" ${e?.question_type===t?"selected":""}>${s}</option>`).join("")}</select>
        </label>
        <label class="field"><span class="field-label">\u96E3\u5EA6</span>
          <select class="select" name="difficulty">${Object.entries(_s).map(([t,s])=>`<option value="${t}" ${e?.difficulty===t?"selected":""}>${s}</option>`).join("")}</select>
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
          <textarea class="input" name="expected_laws" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5&#10;\u9280\u884C\u6CD5|law">${r(td(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u689D\u6587 <span class="field-tag">\u6CD5\u898F|\u7B2C 157-1 \u689D</span></span>
          <textarea class="input" name="expected_articles" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 157-1 \u689D&#10;\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 171 \u689D">${r(sd(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u5224\u6C7A <span class="field-tag">jid\uFF0C\u6BCF\u884C\u4E00\u7B46</span></span>
          <textarea class="input" name="expected_judgments" rows="3" placeholder="TPDM,113,\u91D1\u8A34,27,20241128,1">${r(ad(e))}</textarea>
        </label>
      </div>
      <label class="field"><span class="field-label">\u53C3\u8003\u7B54\u6848\uFF0Frubric \u8AAA\u660E</span>
        <textarea class="input" name="reference_answer" rows="4" placeholder="\u63D0\u4F9B\u7D66 LLM judge \u8207\u4EBA\u5DE5\u9A57\u6536\u53C3\u8003\uFF1B\u53EF\u7559\u7A7A\uFF0C\u4F46\u54C1\u8CEA\u8A55\u5206\u6703\u8F03\u5F31\u3002">${r(e?.reference_answer||"")}</textarea>
      </label>
      <div class="qb-form-grid">
        <label class="field"><span class="field-label">\u6A19\u7C64 <span class="field-tag">\u9017\u865F\u5206\u9694</span></span>
          <input class="input" name="tags" value="${r(nd(e))}" placeholder="\u5167\u7DDA\u4EA4\u6613, \u8B49\u5238\u4EA4\u6613\u6CD5" />
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
        <button class="btn btn-primary" type="submit">${p("check",14)}<span>\u5132\u5B58\u65B0\u7248\u672C</span></button>
        <button class="btn btn-secondary" type="button" data-qb-action="reset-create">\u6E05\u9664</button>
      </div>
      <div class="qb-form-hint">\u4FEE\u6539\u5DF2\u5B58\u5728\u7684\u984C\u76EE\u6703\u5EFA\u7ACB\u65B0\u7248\u672C\uFF1B\u5DF2\u6838\u51C6\u984C\u76EE\u4FEE\u6539\u5F8C\u6703\u56DE\u5230\u5F85\u5BE9\uFF0C\u9700\u91CD\u65B0\u9A57\u6536\u3002</div>
    </form>
    ${Tn()}
  </section>`}function ld(e,t){return e?od(e):id(t)}function cd(e){let t=e.status==="retired"||!!e.deleted_at;return`<article class="qb-item" data-qb-item="${e.id}">
    <div class="qb-item-head">
      <span class="qb-id">#${e.id}</span>
      <div class="qb-item-title">
        <strong>${r(e.question)}</strong>
        <span class="qb-meta">
          ${r(Nt[e.question_type]||e.question_type)}
          \xB7 ${r(_s[e.difficulty]||e.difficulty)}
          \xB7 v${e.version}
          ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
          ${e.benchmark_ready?' \xB7 <span class="qb-ready">Benchmark ready</span>':""}
        </span>
      </div>
      ${Qs(e.status)}
    </div>
    <div class="qb-fingerprint mono">fingerprint ${r(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${jn(e)}
    <div class="qb-item-foot">
      <span>\u66F4\u65B0 ${r(Me(e.updated_at))}</span>
      ${e.reviewed_by?`<span>\u5BE9\u6838 ${r(e.reviewed_by)}</span>`:""}
      ${e.review_comment?`<span class="qb-comment">${r(e.review_comment)}</span>`:""}
      <div class="qb-actions">
        ${t?`<button class="btn btn-primary btn-sm" type="button" data-qb-action="restore" data-id="${e.id}">${p("refresh",13)}<span>\u5FA9\u539F\u984C\u76EE</span></button>`:`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${p("edit",13)}<span>\u7DE8\u8F2F</span></button>
               ${["pending_review","changes_requested"].includes(e.status)?"":`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="submit-review" data-id="${e.id}">${p("upload",13)}<span>${e.status==="draft"?"\u9001\u5BE9":"\u91CD\u65B0\u9001\u5BE9"}</span></button>`}
               <button class="btn btn-secondary btn-sm" type="button" data-qb-action="review" data-id="${e.id}">${p("shield",13)}<span>\u9A57\u6536</span></button>
               <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${p("trash",13)}<span>\u522A\u9664</span></button>`}
      </div>
    </div>
  </article>`}function dd(e){return`<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${p("database",14)}\u984C\u5EAB\u7BA1\u7406</span>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="new">${p("plus",13)}<span>\u65B0\u589E</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="revalidate">${p("refresh",13)}<span>\u91CD\u65B0\u9A57\u8B49</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="export">${p("download",13)}<span>\u532F\u51FA JSON</span></button>
      </div>
    </div>
    <form class="qb-filters" data-qb-form="filter">
      <input class="input" name="query" type="search" placeholder="\u641C\u5C0B\u984C\u76EE\u6216\u53C3\u8003\u7B54\u6848" value="${r(e.filters.query)}" />
      <select class="select" name="status">
        <option value="">\u5168\u90E8\u72C0\u614B</option>
        ${Object.entries(Ln).map(([t,s])=>`<option value="${t}" ${e.filters.status===t?"selected":""}>${s.label}</option>`).join("")}
      </select>
      <select class="select" name="question_type">
        <option value="">\u5168\u90E8\u984C\u578B</option>
        ${Object.entries(Nt).map(([t,s])=>`<option value="${t}" ${e.filters.question_type===t?"selected":""}>${s}</option>`).join("")}
      </select>
      <select class="select" name="difficulty">
        <option value="">\u5168\u90E8\u96E3\u5EA6</option>
        ${Object.entries(_s).map(([t,s])=>`<option value="${t}" ${e.filters.difficulty===t?"selected":""}>${s}</option>`).join("")}
      </select>
      <div class="qb-tag-filter" data-qb-tag-filter>
        <div class="qb-tag-values">
          ${e.filters.tags.length?e.filters.tags.map(t=>`<span class="chip qb-tag-chip">${r(t)}<button class="qb-tag-remove" type="button" data-qb-action="remove-tag" data-tag="${r(t)}" aria-label="\u79FB\u9664\u6A19\u7C64 ${r(t)}">${p("x",9)}</button></span>`).join(""):'<span class="qb-tag-placeholder">\u6A19\u7C64</span>'}
        </div>
        <button class="qb-tag-add" type="button" data-qb-action="open-tag-search" aria-label="\u52A0\u5165\u6A19\u7C64" aria-haspopup="listbox">${p("plus",13)}</button>
        ${e.filters.tags.map(t=>`<input type="hidden" name="tags" value="${r(t)}" />`).join("")}
        <div class="qb-tag-popover" data-qb-tag-popover hidden>
          <input class="input" type="search" data-qb-tag-search placeholder="\u8F38\u5165\u76F8\u8FD1\u5B57\u641C\u5C0B\u6A19\u7C64\u2026" autocomplete="off" />
          <div class="qb-tag-results" data-qb-tag-results role="listbox" aria-live="polite"></div>
        </div>
      </div>
      <button class="btn btn-primary btn-sm" type="submit">${p("search",13)}<span>\u7BE9\u9078</span></button>
    </form>
    <div class="qb-list">
      ${e.items.length?e.items.map(t=>cd(t)).join(""):Us("\u76EE\u524D\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u984C\u76EE\u3002")}
    </div>
    <div class="qb-pagination">
      <span>\u5171 ${d(e.total)} \u984C</span>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="prev" ${e.offset<=0?"disabled":""}>\u4E0A\u4E00\u9801</button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="next" ${e.offset+e.limit>=e.total?"disabled":""}>\u4E0B\u4E00\u9801</button>
      </div>
    </div>
  </section>`}var ki=[["queue","\u5F85\u5BE9\uFF0F\u9000\u56DE"],["accepted","\u5DF2\u6838\u51C6"],["rejected","\u5DF2\u62D2\u7D55"],["draft","\u8349\u7A3F"]];function ud(e){let t=e.stats||{};return{queue:Number(t.pending_review||0)+Number(t.changes_requested||0),accepted:Number(t.accepted||0),rejected:Number(t.rejected||0),draft:Number(t.draft||0)}}function pd(e,t){let s=e.reviewFilter||"queue",a={queue:{title:"\u76EE\u524D\u6C92\u6709\u5F85\u5BE9\u6216\u9000\u56DE\u4FEE\u6539\u7684\u984C\u76EE\u3002",text:t.accepted?`\u5DF2\u6709 ${d(t.accepted)} \u984C\u6838\u51C6\u3002\u65B0\u984C\u76EE\u5EFA\u7ACB\u5F8C\u6703\u81EA\u52D5\u9001\u5BE9\uFF0C\u4E5F\u53EF\u4EE5\u5207\u63DB\u5230\u300C\u5DF2\u6838\u51C6\u300D\u91CD\u65B0\u9A57\u6536\u65E2\u6709\u984C\u76EE\u3002`:"\u5EFA\u7ACB\u984C\u76EE\u5F8C\u6703\u9810\u8A2D\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\uFF1B\u82E5\u53EA\u60F3\u5148\u4FDD\u5B58\uFF0C\u5EFA\u7ACB\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5373\u53EF\u5B58\u6210\u8349\u7A3F\u3002"},accepted:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u6838\u51C6\u984C\u76EE\u3002",text:"\u984C\u76EE\u901A\u904E\u4EBA\u5DE5\u9A57\u6536\u5F8C\u6703\u5217\u5728\u9019\u88E1\uFF1B\u4E5F\u53EF\u4EE5\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u9001\u51FA\u9A57\u6536\u3002"},rejected:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u62D2\u7D55\u984C\u76EE\u3002",text:"\u88AB\u62D2\u7D55\u7684\u984C\u76EE\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u4E2D\uFF0C\u53EF\u4FEE\u6539\u5F8C\u91CD\u65B0\u9001\u5BE9\u3002"},draft:{title:"\u76EE\u524D\u6C92\u6709\u8349\u7A3F\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u984C\u76EE\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5C31\u6703\u5B58\u6210\u8349\u7A3F\uFF0C\u4E4B\u5F8C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002"}}[s]||{title:"\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u65B0\u984C\u76EE\u5F8C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"},n=[s!=="draft"?`<button class="btn btn-primary btn-sm" type="button" data-qb-action="new">${p("plus",13)}<span>\u65B0\u589E\u984C\u76EE</span></button>`:"",s==="queue"&&t.accepted?`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="review-filter" data-filter="accepted">${p("shield",13)}<span>\u67E5\u770B\u5DF2\u6838\u51C6 ${d(t.accepted)}</span></button>`:"",`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="go-manage">${p("database",13)}<span>\u524D\u5F80\u984C\u5EAB\u7BA1\u7406</span></button>`].filter(Boolean).join("");return`<div class="qb-empty qb-empty-block">
    <span class="qb-empty-icon">${p("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>${r(a.title)}</strong>
      <p>${r(a.text)}</p>
      <div class="qb-actions">${n}</div>
    </div>
  </div>`}function md(e){let t=ki.find(([s])=>s===e);return t?t[1]:"\u5F85\u5BE9\uFF0F\u9000\u56DE"}function gd(e,t){return`<button class="qb-review-item${t?" is-active":""}" type="button" data-qb-action="select-review-item" data-id="${e.id}" aria-pressed="${t?"true":"false"}">
    <span class="qb-review-item-top">
      <span class="qb-id">#${e.id}</span>
      <span class="qb-review-item-meta">
        ${r(Nt[e.question_type]||e.question_type)}
        \xB7 ${r(_s[e.difficulty]||e.difficulty)}
        \xB7 v${e.version}
        ${e.benchmark_ready?" \xB7 Benchmark ready":""}
        ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
      </span>
      ${Qs(e.status)}
    </span>
    <strong>${r(e.question)}</strong>
  </button>`}function fd(e){return`<article class="qb-review-pane-card">
    <div class="qb-review-pane-head">
      <div class="qb-review-pane-title">
        <span class="qb-review-item-meta">#${e.id} \xB7 v${e.version} \xB7 ${r(Nt[e.question_type]||e.question_type)} \xB7 ${r(_s[e.difficulty]||e.difficulty)}</span>
        <strong>${r(e.question)}</strong>
      </div>
      <div class="qb-review-pane-side">
        ${Qs(e.status)}
        <div class="qb-actions">
          <button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${p("edit",13)}<span>\u7DE8\u8F2F</span></button>
          <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${p("trash",13)}<span>\u522A\u9664</span></button>
        </div>
      </div>
    </div>
    <div class="qb-fingerprint mono">fingerprint ${r(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${jn(e)}
    ${e.review_comment?`<div class="qb-review-note"><span class="summary-label">\u6700\u8FD1\u6279\u6CE8${e.reviewed_by?` \xB7 ${r(e.reviewed_by)}`:""}</span><p>${r(e.review_comment)}</p></div>`:""}
    ${e.reference_answer?`<div class="qb-reference"><span class="summary-label">\u53C3\u8003\u7B54\u6848</span><p>${r(e.reference_answer)}</p></div>`:""}
    <form class="qb-review-form" data-qb-form="review" data-id="${e.id}">
      <div class="qb-score-grid">
        ${[["clarity","\u984C\u76EE\u6E05\u6670"],["labels","\u6CD5\u689D\u6A19\u6CE8"],["answer","\u53C3\u8003\u7B54\u6848"],["difficulty","\u96E3\u5EA6\u8207\u6A19\u7C64"],["overall","\u6574\u9AD4"]].map(([t,s])=>`<label class="field"><span class="field-label">${s} <span class="field-tag">1\u20135</span></span><input class="input" type="number" min="1" max="5" name="score_${t}" value="4" /></label>`).join("")}
      </div>
      <label class="field"><span class="field-label">\u6279\u6CE8</span><textarea class="input" name="comment" rows="3" placeholder="\u6A19\u8A3B\u7406\u7531\u3001\u9700\u8981\u4FEE\u6539\u7684\u6B04\u4F4D\uFF0C\u6216\u9A57\u6536\u7D50\u8AD6\u3002"></textarea></label>
      <div class="qb-actions qb-review-decisions">
        <button class="btn btn-primary btn-sm" type="button" data-qb-action="decide" data-decision="approved">${p("check",13)}<span>\u6838\u51C6</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="decide" data-decision="changes_requested">${p("edit",13)}<span>\u9000\u56DE\u4FEE\u6539</span></button>
        <button class="btn btn-ghost btn-sm" type="button" data-qb-action="decide" data-decision="rejected">${p("x",13)}<span>\u62D2\u7D55</span></button>
      </div>
    </form>
    ${e.reviews?.length?`<div class="qb-review-history"><span class="summary-label">\u5BE9\u6838\u7D00\u9304</span>${e.reviews.map(t=>`<div class="qb-review-row"><span>${r(t.reviewer||"\u533F\u540D")}</span>${Qs(t.decision==="approved"?"accepted":t.decision)}<span>${r(Me(t.created_at))}</span><p>${r(t.comment||"\u2014")}</p></div>`).join("")}</div>`:""}
  </article>`}function bd(){return`<div class="qb-empty qb-empty-block qb-review-placeholder">
    <span class="qb-empty-icon">${p("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>\u5F9E\u5DE6\u5074\u9078\u64C7\u984C\u76EE</strong>
      <p>\u9EDE\u9078\u984C\u76EE\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u984C\u5E79\u3001\u9810\u671F\u6A19\u8A3B\u3001\u53C3\u8003\u7B54\u6848\u8207\u6838\u51C6\u9078\u9805\u3002</p>
    </div>
  </div>`}function vd(e){let t=e.reviewDetail,s=ud(e),a=e.reviewFilter||"queue",n=ki.map(([l,u])=>`<button class="chip qb-review-tab${a===l?" is-active":""}" type="button" role="tab" aria-selected="${a===l?"true":"false"}" data-qb-action="review-filter" data-filter="${l}"><span>${u}</span><span class="qb-review-tab-count">${d(s[l]||0)}</span></button>`).join(""),i=e.reviewItems.length?e.reviewItems.map(l=>gd(l,Number(t?.id)===Number(l.id))).join(""):`<div class="qb-empty qb-empty-compact">${p("info",16)}<span>\u76EE\u524D\u6C92\u6709${r(md(a))}\u984C\u76EE\u3002</span></div>`,o=t?fd(t):e.reviewItems.length?bd():pd(e,s);return`<section class="report-card qb-card qb-review-card">
    <div class="side-card-head">
      <span class="side-card-title">${p("shield",14)}\u984C\u5EAB\u4EBA\u5DE5\u9A57\u6536\u6279\u6CE8</span>
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
  </section>`}function Hs(e){if(e==null||e==="")return"";let t=Number(e);return Number.isFinite(t)?`${Math.round(t*100)}%`:""}function hd(e){if(!e||typeof e!="object")return"\u5F15\u7528";let t=String(e.jid||"").trim();if(t)return t;let s=String(e.law_name||"").trim(),a=String(e.article_no||"").trim(),n=`${s} ${a}`.trim();return n||String(e.title||e.text||"\u5F15\u7528").slice(0,80)}function $d(e){let t=e?.metrics||{},s=t.scores||{},a=[["\u6CD5\u898F\u53EC\u56DE",Hs(t.law_recall)],["\u689D\u6587\u53EC\u56DE",Hs(t.article_recall)],["\u898F\u5247\u5206",Hs(s.deterministic)],["Judge",Hs(s.judge)],["\u4EBA\u5DE5",Hs(s.human)]].filter(([,n])=>n);return a.length?`<div class="qb-bank-stats">${a.map(([n,i])=>`<span class="qb-bank-stat"><span>${r(n)}</span><strong>${r(i)}</strong></span>`).join("")}</div>`:""}function yd(e){let t=Array.isArray(e?.law_sources)?e.law_sources:[],s=Array.isArray(e?.citations)?e.citations:[],a=t.length?`<div class="qb-bank-sources">${t.map(i=>{let o=String(i.law_name||"\u672A\u547D\u540D\u6CD5\u898F"),l=(i.articles||[]).map(c=>String(c.article_no||"").trim()).filter(Boolean),u=`<strong>${r(o)}</strong>${l.length?`<small>${r(l.join("\u3001"))}</small>`:""}`;return i.law_url?`<a class="qb-bank-law" href="${r(i.law_url)}" target="_blank" rel="noreferrer">${u}</a>`:`<span class="qb-bank-law">${u}</span>`}).join("")}</div>`:"",n=s.length?`<div class="qb-bank-sources qb-bank-citations">${s.map(i=>`<span class="chip chip-mono">${r(hd(i))}</span>`).join("")}</div>`:"";return!a&&!n?"":`<div class="qb-bank-answer-block">
    <div class="qb-bank-section-label"><span>\u5F15\u7528\u4F86\u6E90</span><span>${d(t.length+s.length)} \u7B46</span></div>
    ${a}${n}
  </div>`}function Si(e,t){if(!e)return`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${p("history",20)}</span>
      <strong>\u5C1A\u7121 RAG \u7B54\u6848</strong>
      <span>\u8DD1\u4E00\u6B21 Benchmark \u5F8C\uFF0C\u6700\u8FD1\u4E00\u6B21\u6210\u529F\u56DE\u7B54\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</span>
    </div>`;let s=Number(e.item_version||0),a=Number(t?.version||0),n=s&&a&&s!==a?`<span class="badge badge-warn">\u7B54\u6848 v${s} \xB7 \u984C\u76EE v${a}</span>`:"",i=e.answer_source==="llm"?"LLM \u751F\u6210":e.answer_source==="structured"?"\u6CD5\u898F\u8CC7\u6599\u5EAB":String(e.answer_source||"RAG");return`<div class="qb-bank-answer-meta">
      <span class="badge badge-ok"><span class="status-dot is-ok"></span>RAG \u5B8C\u6210</span>
      <span class="badge badge-neutral">${r(i)}</span>
      ${n}
      <span class="mono">${r(e.run_label||e.run_id||"")}</span>
      <span>${r(Me(e.finished_at))}</span>
      <span>${r(be(e.duration_ms))}</span>
      ${e.llm_model?`<span class="mono">${r(e.llm_model)}</span>`:""}
    </div>
    <div class="qb-bank-answer-block">
      <div class="qb-bank-section-label"><span>\u56DE\u7B54</span><span>${d(String(e.answer||"").length)} \u5B57</span></div>
      <p class="qb-bank-answer-text">${r(String(e.answer||"").trim()||"\uFF08\u7A7A\u767D\u56DE\u7B54\uFF09")}</p>
    </div>
    ${yd(e)}
    ${$d(e)}`}function xi(e,t){let s=e.selectedSuiteId,a=t&&e.suiteAnswers?.[String(s)]?.[String(t.id)]||null;return t?`<div class="qb-bank-answer-head">
      <div class="qb-bank-answer-heading">
        <span class="qb-bank-answer-kicker">${p("sparkles",12)}RAG \u6700\u8FD1\u4E00\u6B21\u7B54\u6848</span>
        <strong class="qb-bank-answer-question">#${t.id} ${r(t.question)}</strong>
      </div>
      ${a?`<span class="qb-bank-answer-state">${r(Nt[t.question_type]||t.question_type)} \xB7 v${t.version}</span>`:""}
    </div>
    ${Si(a,t)}`:`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${p("cube",20)}</span>
      <strong>\u9078\u64C7\u984C\u76EE</strong>
      <span>\u5F9E\u5DE6\u5074\u6E05\u55AE\u9078\u64C7\u4E00\u984C\uFF0C\u67E5\u770B\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`}function qi(e){return`<span class="qb-bank-actions">
    <button class="qb-bank-icon" type="button" data-qb-action="edit" data-id="${e.id}" title="\u7DE8\u8F2F\u984C\u76EE" aria-label="\u7DE8\u8F2F\u984C\u76EE #${e.id}">${p("edit",13)}</button>
    <button class="qb-bank-icon is-danger" type="button" data-qb-action="delete" data-id="${e.id}" title="\u5F9E\u984C\u5EAB\u79FB\u9664" aria-label="\u5F9E\u984C\u5EAB\u79FB\u9664 #${e.id}">${p("trash",13)}</button>
  </span>`}function wd(e,t,{selected:s,hasAnswer:a}){return`<div class="qb-bank-row${s?" is-active":""}" data-id="${e.id}">
    <button class="qb-bank-select" type="button" data-qb-action="select-bank-item" data-id="${e.id}" aria-pressed="${s?"true":"false"}">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <span class="qb-bank-item-copy">
        <strong>${r(e.question)}</strong>
        <small>${r(Nt[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${a?"\u5DF2\u6709 RAG \u7B54\u6848":"\u5C1A\u7121 RAG \u7B54\u6848"}</small>
      </span>
    </button>
    ${qi(e)}
  </div>`}function _d(e,t,s){return`<article class="qb-bank-full-item" data-id="${e.id}">
    <div class="qb-bank-full-head">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <div class="qb-bank-full-title">
        <strong>${r(e.question)}</strong>
        <small>${r(Nt[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${r(Ln[e.status]?.label||e.status||"")}</small>
      </div>
      ${qi(e)}
    </div>
    ${Si(s,e)}
  </article>`}function _i(e){let t=e.editingSuite,s=Array.isArray(e.suites)?e.suites:[],a=s.find(f=>Number(f.id)===Number(e.selectedSuiteId))||s[0]||null,n=Array.isArray(a?.items)?a.items:[],i=e.suiteAnswers?.[String(a?.id)]||{},o=n.find(f=>Number(f.id)===Number(e.selectedBankItemId))||null,l=!!e.suiteAnswersLoading,u=String(e.suiteAnswersError||""),c=!!e.suiteManageOpen||!s.length,b=e.bankTab==="full"?"full":"split",$=s.length?`<div class="qb-bank-tabs" role="tablist" aria-label="Benchmark \u984C\u5EAB\u6AA2\u8996">
        <button class="qb-bank-tab${b==="split"?" is-active":""}" type="button" role="tab" aria-selected="${b==="split"?"true":"false"}" data-qb-action="bank-tab" data-tab="split">${p("grid",13)}<span>Benchmark \u984C\u5EAB</span><span class="badge badge-neutral">${d(n.length)}</span></button>
        <button class="qb-bank-tab${b==="full"?" is-active":""}" type="button" role="tab" aria-selected="${b==="full"?"true":"false"}" data-qb-action="bank-tab" data-tab="full">${p("table",13)}<span>\u984C\u5EAB\u5168\u5217\u8868</span><span class="badge badge-neutral">${d(n.length)}</span></button>
      </div>`:"",v="";if(!s.length)v=`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${p("cube",20)}</span>
      <strong>\u5C1A\u672A\u5EFA\u7ACB Benchmark \u984C\u5EAB</strong>
      <span>\u5C55\u958B\u4E0B\u65B9 Suite \u8A2D\u5B9A\u4E26\u5EFA\u7ACB\u984C\u5EAB\u5F8C\uFF0C\u5C31\u80FD\u5728\u9019\u88E1\u700F\u89BD\u984C\u76EE\u8207\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`;else if(l)v='<div class="qb-bank-loading"><span class="spinner" aria-hidden="true"></span><span>\u8B80\u53D6\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u4E2D\u2026</span></div>';else{let f=u?Re({tone:"warn",title:"\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u8B80\u53D6\u5931\u6557",text:r(u)}):"";b==="full"?v=`${f}<div class="qb-bank-full" data-qb-bank-view="full">${n.length?n.map((h,_)=>_d(h,_,i[String(h.id)]||null)).join(""):Us("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>`:v=`${f}<div class="qb-bank-split" data-qb-bank-view="split">
        <div class="qb-bank-list" data-qb-bank-list>${n.length?n.map((h,_)=>wd(h,_,{selected:Number(h.id)===Number(o?.id),hasAnswer:!!i[String(h.id)]})).join(""):Us("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>
        <div class="qb-bank-answer-pane" data-qb-bank-answer>${xi(e,o)}</div>
      </div>`}return`<section class="report-card qb-card qb-bank-card">
    <div class="side-card-head qb-bank-head">
      <div class="qb-bank-heading">
        <span class="side-card-title">${p("cube",14)}Benchmark \u984C\u5EAB</span>
        <span class="qb-bank-sub">${a?`${r(a.name)} \xB7 v${a.version} \xB7 ${d(a.item_count)} \u984C`:"\u5C1A\u672A\u5EFA\u7ACB suite"}</span>
      </div>
      <div class="qb-bank-controls">
        ${s.length?`<label class="qb-suite-picker"><span>Suite</span><select class="select" data-qb-suite-select aria-label="\u9078\u64C7 benchmark suite">${s.map(f=>`<option value="${f.id}" ${Number(f.id)===Number(a?.id)?"selected":""}>${r(f.name)} \xB7 ${d(f.item_count)} \u984C</option>`).join("")}</select></label>`:""}
        ${a?`<span class="badge ${a.status==="frozen"?"badge-ok":"badge-neutral"}">${a.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>`:""}
      </div>
    </div>
    ${$}
    ${v}
    <details class="qb-suite-manage" ${c?"open":""}>
      <summary>${p("sliders",14)}Suite \u8A2D\u5B9A\u8207\u7248\u672C <span class="qb-muted">${d(s.length)} \u500B suite \xB7 ${d(e.ready.length)} \u984C benchmark-ready</span></summary>
      <div class="qb-suite-manage-body">
        <form class="qb-suite-form" data-qb-form="suite">
          <input type="hidden" name="suite_id" value="${t?.id||""}" />
          <div class="qb-form-grid">
            <label class="field"><span class="field-label">Suite \u540D\u7A31</span><input class="input" name="name" required value="${r(t?.name||"Pilot 30")}" /></label>
            <label class="field"><span class="field-label">\u7B49\u7D1A</span><select class="select" name="tier">${Object.entries(wi).map(([f,h])=>`<option value="${f}" ${t?.tier===f?"selected":""}>${h}</option>`).join("")}</select></label>
          </div>
          <label class="field"><span class="field-label">\u8AAA\u660E</span><input class="input" name="description" value="${r(t?.description||"30 \u984C pilot\uFF1B\u7528\u65BC RAG benchmark \u8207\u9577\u671F\u540C\u984C\u6BD4\u8F03\u3002")}" /></label>
          <div class="qb-check-list">
            ${e.ready.length?e.ready.map(f=>{let h=t?t.items?.some(_=>Number(_.id)===Number(f.id)):!0;return`<label class="qb-check-row"><input type="checkbox" name="item_ids" value="${f.id}" ${h?"checked":""}/><span><strong>#${f.id}</strong> ${r(f.question)} <small>${r(Nt[f.question_type]||f.question_type)}</small></span></label>`}).join(""):Us("\u6C92\u6709\u5DF2\u9A57\u6536\u4E14 benchmark-ready \u7684\u984C\u76EE\uFF1B\u8ACB\u5148\u5B8C\u6210\u4EBA\u5DE5\u9A57\u6536\u3002")}
          </div>
          <div class="qb-actions">
            <button class="btn btn-primary" type="submit">${p("check",14)}<span>${t?"\u5132\u5B58 suite":"\u5EFA\u7ACB suite"}</span></button>
            ${t?'<button class="btn btn-secondary" type="button" data-qb-action="suite-new">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
          </div>
        </form>
        <div class="qb-list">
          ${s.length?s.map(f=>`<article class="qb-suite">
            <div class="qb-item-head">
              <div class="qb-item-title"><strong>${r(f.name)}</strong><span class="qb-meta">${r(wi[f.tier]||f.tier)} \xB7 v${f.version} \xB7 ${d(f.item_count)} \u984C</span></div>
              <span class="badge ${f.status==="frozen"?"badge-ok":"badge-neutral"}">${f.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>
            </div>
            <div class="qb-suite-items">${(f.items||[]).slice(0,8).map(h=>`<span class="chip">#${h.id} ${r(h.question.slice(0,22))}${h.question.length>22?"\u2026":""}</span>`).join("")}${f.item_count>8?`<span class="qb-muted">+${f.item_count-8}</span>`:""}</div>
            <div class="qb-actions">
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-edit" data-id="${f.id}">${p("edit",13)}<span>\u7DE8\u8F2F suite</span></button>
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-freeze" data-id="${f.id}">${p("shield",13)}<span>\u51CD\u7D50</span></button>
              <button class="btn btn-ghost btn-sm" type="button" data-qb-action="suite-delete" data-id="${f.id}">${p("trash",13)}<span>\u522A\u9664</span></button>
            </div>
          </article>`).join(""):Us("\u5C1A\u672A\u5EFA\u7ACB benchmark suite\u3002")}
        </div>
      </div>
    </details>
  </section>`}function kd(e){let t={};for(let s of["clarity","labels","answer","difficulty","overall"]){let a=e.querySelector(`[name="score_${s}"]`),n=Number(a?.value);Number.isFinite(n)&&(t[s]=Math.max(1,Math.min(5,Math.round(n))))}return t}function Sd(e){let t=new FormData(e);return{question:String(t.get("question")||"").trim(),question_type:String(t.get("question_type")||"general"),difficulty:String(t.get("difficulty")||"medium"),visibility:String(t.get("visibility")||"shared"),expected_laws:Xc(t.get("expected_laws")),expected_articles:Zc(t.get("expected_articles")),expected_judgments:ed(t.get("expected_judgments")),reference_answer:String(t.get("reference_answer")||"").trim(),tags:String(t.get("tags")||"").split(",").map(s=>s.trim()).filter(Boolean),notes:String(t.get("notes")||"").trim(),rubric:{must_refuse:!!e.elements.must_refuse?.checked}}}function Ai(e,{onNavigate:t=null,onStats:s=null}={}){let a={create:"question-create",manage:"question-manage",suite:"benchmark-bank",review:"question-review"},n={tab:"",editing:null,editingFrom:"",editingSuite:null,aiQuestion:"",aiLoading:!1,aiResult:null,items:[],total:0,offset:0,limit:50,filters:{query:"",status:"",question_type:"",difficulty:"",tags:[]},stats:{},suites:[],ready:[],selectedSuiteId:null,selectedBankItemId:null,bankTab:"split",suiteAnswers:{},suiteAnswersLoading:!1,suiteAnswersError:"",suiteManageOpen:!1,reviewItems:[],reviewDetail:null,reviewFilter:"queue"},i=L=>e.querySelector(`#quality-panel-${a[L]}`),o=(L,C)=>{L&&(L.childElementCount?L.setAttribute("aria-busy","true"):L.innerHTML=`<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>${C}</span></div></section>`)},l=L=>{L?.removeAttribute("aria-busy")},u=0,c=null,b=()=>"anonymous",$=()=>{s&&s(n.stats)},v=L=>{t&&t(L),ee(L)},f=async()=>{try{n.stats=await z.questionBankStats()}catch{n.stats={}}$()},h=()=>{let L=i("create");L&&(L.innerHTML=ld(n.editing,n))},_=(L,C)=>{let B=L?.querySelector("[data-qb-tag-results]");B&&(B.innerHTML=C.length?C.map(D=>`<button class="qb-tag-option" type="button" role="option" data-qb-action="select-tag" data-tag="${r(D.tag)}"><span>${r(D.tag)}</span><small>${d(D.count)}</small></button>`).join(""):'<div class="qb-tag-empty">\u6C92\u6709\u5176\u4ED6\u76F8\u7B26\u6A19\u7C64</div>')},S=async(L,C="")=>{if(!L)return;let B=L.querySelector("[data-qb-tag-results]"),D=++u;B&&(B.innerHTML='<div class="qb-tag-loading"><span class="spinner"></span><span>\u641C\u5C0B\u6A19\u7C64\u2026</span></div>');try{let ve=await z.questionBankTags(C,12);if(D!==u)return;let V=(ve.tags||[]).filter(Pe=>!n.filters.tags.includes(Pe.tag));_(L,V)}catch(ve){if(D!==u)return;B&&(B.innerHTML=`<div class="qb-tag-empty">${r(ve.message||"\u6A19\u7C64\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},R=(L,{focus:C=!1}={})=>{if(!L)return;let B=L.querySelector("[data-qb-tag-popover]"),D=L.querySelector("[data-qb-tag-search]");!B||!D||(B.hidden&&(B.hidden=!1,D.value="",S(L,"")),C&&(D.focus(),D.select()))},O=L=>{c&&(window.clearTimeout(c),c=null);let C=L?.querySelector("[data-qb-tag-popover]");C&&(C.hidden=!0)},I=async L=>{let C=String(L||"").trim();C&&(n.filters.tags.includes(C)?n.filters.tags=n.filters.tags.filter(B=>B!==C):n.filters.tags=[...n.filters.tags,C],n.offset=0,await k())},Q=()=>{let L=Array.isArray(n.suites)?n.suites:[];if(!L.length)return n.selectedSuiteId=null,n.selectedBankItemId=null,null;let C=L.find(D=>Number(D.id)===Number(n.selectedSuiteId));C||(C=L[0],n.selectedSuiteId=C.id,n.selectedBankItemId=null);let B=Array.isArray(C.items)?C.items:[];return B.some(D=>Number(D.id)===Number(n.selectedBankItemId))||(n.selectedBankItemId=B[0]?.id??null),C},oe=()=>{let L=i("suite");L&&(L.innerHTML=_i(n))},te=0,je=async(L,{force:C=!1}={})=>{if(!L)return;let B=++te;if(!C&&n.suiteAnswers[String(L)]){n.suiteAnswersLoading=!1,n.suiteAnswersError="",oe();return}n.suiteAnswersLoading=!0,n.suiteAnswersError="",oe();try{let D=await z.benchmarkSuiteLatestAnswers(L);if(B!==te)return;n.suiteAnswers[String(L)]=D.answers||{}}catch(D){if(B!==te)return;n.suiteAnswersError=D.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}finally{B===te&&(n.suiteAnswersLoading=!1,oe())}},De=async L=>{n.selectedSuiteId=L,n.selectedBankItemId=null,n.suiteAnswersError="";let C=Q();if(!C){oe();return}await je(C.id)},X=L=>{n.bankTab=L==="full"?"full":"split",oe()},P=()=>{let L=i("suite");if(!L)return;let C=Q(),D=(Array.isArray(C?.items)?C.items:[]).find(V=>Number(V.id)===Number(n.selectedBankItemId))||null;for(let V of L.querySelectorAll(".qb-bank-row")){let Pe=Number(V.dataset.id)===Number(n.selectedBankItemId);V.classList.toggle("is-active",Pe);let F=V.querySelector("[data-qb-action='select-bank-item']");F&&F.setAttribute("aria-pressed",Pe?"true":"false")}let ve=L.querySelector("[data-qb-bank-answer]");ve&&(ve.innerHTML=xi(n,D))},k=async()=>{let L=i("manage");if(L){c&&(window.clearTimeout(c),c=null),o(L,"\u8B80\u53D6\u984C\u5EAB\u4E2D\u2026");try{let C=await z.questionBankItems({...n.filters,...n.filters.status==="retired"?{include_deleted:!0}:{}},n.limit,n.offset);n.items=C.items||[],n.total=Number(C.total||0),n.stats=C.stats||n.stats,l(L),L.innerHTML=dd(n),$()}catch(C){l(L),L.innerHTML=`<section class="report-card qb-card">${Re({tone:"danger",title:"\u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:r(C.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},M=async({refreshAnswers:L=!1}={})=>{let C=i("suite");if(C){o(C,"\u8B80\u53D6 benchmark \u984C\u5EAB\u4E2D\u2026");try{let[B,D]=await Promise.all([z.benchmarkSuites(),z.benchmarkReadyQuestions(300)]);n.suites=B.suites||[],n.ready=D.items||[];let ve=Q();if(n.suiteAnswersError="",n.suiteAnswersLoading=!1,ve&&(L||!n.suiteAnswers[String(ve.id)]))try{let V=await z.benchmarkSuiteLatestAnswers(ve.id);n.suiteAnswers[String(ve.id)]=V.answers||{}}catch(V){n.suiteAnswersError=V.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}l(C),C.innerHTML=_i(n)}catch(B){l(C),C.innerHTML=`<section class="report-card qb-card">${Re({tone:"danger",title:"Benchmark \u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:r(B.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},Z=()=>{let L=i("review");L&&(L.innerHTML=vd(n))},ue=async L=>{let C=n.reviewItems.find(D=>Number(D.id)===Number(L));if(!C)return;n.reviewDetail=C,Z();let B=i("review")?.querySelector(".qb-review-detail-pane");B&&window.matchMedia("(max-width: 1020px)").matches&&B.scrollIntoView({behavior:"smooth",block:"start"});try{let D=await z.questionBankItem(C.id);Number(n.reviewDetail?.id)===Number(C.id)&&(n.reviewDetail=D,Z())}catch(D){A(D.message||"\u984C\u76EE\u5167\u5BB9\u8B80\u53D6\u5931\u6557\u3002","danger")}},G=async()=>{let L=i("review");if(!L)return;o(L,"\u8B80\u53D6\u9A57\u6536\u984C\u76EE\u4E2D\u2026");let C=n.reviewFilter||"queue",B=C==="queue"?["pending_review","changes_requested"]:C==="accepted"?["accepted"]:C==="rejected"?["rejected"]:["draft"];try{let D=await Promise.all(B.map(F=>z.questionBankItems({status:F},200,0)));n.reviewItems=D.flatMap(F=>F.items||[]),n.stats=D[0]?.stats||n.stats;let ve=Number(n.reviewDetail?.id||0),Pe=n.reviewItems.some(F=>Number(F.id)===ve)?ve:Number(n.reviewItems[0]?.id||0);n.reviewDetail=Pe?await z.questionBankItem(Pe):null,l(L),Z(),$()}catch(D){l(L),L.innerHTML=`<section class="report-card qb-card">${Re({tone:"danger",title:"\u9A57\u6536\u984C\u76EE\u8B80\u53D6\u5931\u6557",text:r(D.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}};function ee(L){let C=n.tab;n.tab=L;for(let B of Object.keys(a)){let D=i(B);D&&(D.hidden=B!==L)}L==="create"?(C!=="create"&&!n.editing&&(n.aiQuestion="",n.aiResult=null),h()):L==="manage"?k():L==="suite"?M():L==="review"&&G()}let J=L=>{let B=[...n.items,...n.reviewItems,...n.reviewDetail?[n.reviewDetail]:[]].find(ve=>Number(ve.id)===Number(L));n.reviewDetail=B||{id:Number(L)};let D=B?.status;["accepted","rejected","draft"].includes(D)?n.reviewFilter=D:D&&(n.reviewFilter="queue"),v("review")},le=async L=>{let C=Sd(L),B=Number(L.elements.item_id?.value||0);B||(C.status=L.elements.submit_for_review?.checked?"pending_review":"draft");try{B?(await z.updateQuestionBankItem(B,{...C,change_note:"\u984C\u5EAB\u7BA1\u7406\u4FEE\u6539"}),A("\u5DF2\u5EFA\u7ACB\u65B0\u7248\u672C\uFF0C\u72C0\u614B\u56DE\u5230\u5F85\u5BE9\u3002","ok")):(await z.createQuestionBankItem(C),A(C.status==="draft"?"\u984C\u76EE\u5DF2\u5B58\u70BA\u8349\u7A3F\uFF0C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002":"\u984C\u76EE\u5DF2\u5EFA\u7ACB\u4E26\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok")),n.editing=null;let D=["manage","suite","review"].includes(n.editingFrom)?n.editingFrom:"manage";n.editingFrom="",n.suiteAnswers={},await f(),v(D)}catch(D){let ve=D.detail||D.payload?.detail,V=ve?.errors?.join(" \xB7 ")||ve?.message||D.message||"\u984C\u76EE\u5132\u5B58\u5931\u6557\u3002";A(V,"danger",8e3)}},me=async L=>{let C=String(new FormData(L).get("question")||"").trim();if(C.length<4){A("\u984C\u76EE\u81F3\u5C11\u9700\u8981 4 \u500B\u5B57\u3002","danger");return}n.aiQuestion=C,n.aiLoading=!0,n.aiResult=null,h();try{let B=await z.createQuestionBankItemWithAI({question:C});n.aiResult=B,n.aiQuestion="",await f(),A(`Ollama \u5DF2\u5EFA\u7ACB\u984C\u76EE #${B.item.id}\uFF0C\u72C0\u614B\u70BA\u5F85\u5BE9\uFF0C\u8ACB\u4EBA\u5DE5\u8986\u6838\u3002`,"ok",8e3)}catch(B){let D=B.detail||B.payload?.detail,ve=D?.errors?.join(" \xB7 ")||D?.message||B.message||"Ollama \u7522\u751F\u5931\u6557\u3002";A(ve,"danger",12e3)}finally{n.aiLoading=!1,h()}},K=async(L,C)=>{let B=Number(L.dataset.id||0);if(B)try{await z.reviewQuestionBankItem(B,{decision:C,reviewer:b(),rubric_scores:kd(L),comment:String(L.querySelector('[name="comment"]')?.value||"")}),A(C==="approved"?"\u984C\u76EE\u5DF2\u6838\u51C6\u3002":C==="changes_requested"?"\u5DF2\u9000\u56DE\u4FEE\u6539\u3002":"\u984C\u76EE\u5DF2\u62D2\u7D55\u3002",C==="approved"?"ok":"info"),await f(),await G()}catch(D){let ve=D.detail||D.payload?.detail,V=ve?.errors?.join(" \xB7 ")||ve?.message||D.message||"\u9A57\u6536\u5931\u6557\u3002";A(V,"danger",8e3)}},we=async L=>{let C=new FormData(L),B=Number(C.get("suite_id")||0),D=Array.from(L.querySelectorAll('input[name="item_ids"]:checked')).map(V=>Number(V.value)),ve={name:String(C.get("name")||"").trim(),tier:String(C.get("tier")||"core"),description:String(C.get("description")||"").trim(),item_ids:D};try{B?(await z.updateBenchmarkSuite(B,ve),A("Benchmark \u984C\u5EAB\u5DF2\u66F4\u65B0\u3002","ok")):(await z.createBenchmarkSuite(ve),A("Benchmark \u984C\u5EAB\u5DF2\u5EFA\u7ACB\u3002","ok")),n.editingSuite=null,n.suiteManageOpen=!0,n.suiteAnswers={},await M()}catch(V){let Pe=V.detail||V.payload?.detail,F=Pe?.errors?.join(" \xB7 ")||Pe?.message||V.message||"Suite \u5132\u5B58\u5931\u6557\u3002";A(F,"danger",8e3)}},Be=async L=>{let C=e.querySelector("[data-qb-tag-filter] [data-qb-tag-popover]:not([hidden])")?.closest("[data-qb-tag-filter]");C&&!L.target.closest("[data-qb-tag-filter]")&&O(C);let B=L.target.closest("[data-qb-action]")?.dataset.qbAction;if(!B)return;let D=L.target.closest("[data-qb-action]"),ve=Number(D.dataset.id||0);if(B==="open-tag-search"){let V=D.closest("[data-qb-tag-filter]");R(V,{focus:!0});return}if(B==="select-tag"){await I(D.dataset.tag);return}if(B==="remove-tag"){await I(D.dataset.tag);return}if(B==="bank-tab"){X(D.dataset.tab);return}if(B==="select-bank-item"){n.selectedBankItemId=ve,P();return}if(B==="new"){n.editing=null,n.editingFrom="",n.aiQuestion="",n.aiResult=null,n.aiLoading=!1,v("create");return}if(B==="reset-create"){n.editing=null,h();return}if(B==="reset-ai"){n.aiQuestion="",n.aiResult=null,n.aiLoading=!1,h();return}if(B==="edit"){let V=n.suites.find(ge=>Number(ge.id)===Number(n.selectedSuiteId)),F=[...n.items,...n.reviewItems,...V?.items||[],...n.reviewDetail?[n.reviewDetail]:[]].find(ge=>Number(ge.id)===ve);if(!F)return;n.editing=F,n.editingFrom=n.tab,v("create");return}if(B==="review"){J(ve);return}if(B==="review-ai-item"){let V=n.aiResult?.item;if(!V)return;n.reviewFilter="queue",n.reviewDetail=V,v("review");return}if(B==="review-filter"){let V=String(D.dataset.filter||"queue");n.reviewFilter=["queue","accepted","rejected","draft"].includes(V)?V:"queue",n.reviewDetail=null,await G();return}if(B==="select-review-item"){await ue(ve);return}if(B==="go-manage"){v("manage");return}if(B==="submit-review"){try{await z.submitQuestionBankItemForReview(ve),A("\u5DF2\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok"),await f(),n.tab==="manage"?await k():n.tab==="review"&&await G()}catch(V){let Pe=V.detail||V.payload?.detail,F=Pe?.errors?.join(" \xB7 ")||Pe?.message||V.message||"\u9001\u5BE9\u5931\u6557\u3002";A(F,"danger",8e3)}return}if(B==="restore"){if(!window.confirm(`\u78BA\u5B9A\u5FA9\u539F\u984C\u76EE #${ve}\uFF1F\u5FA9\u539F\u5F8C\u6703\u56DE\u5230\u5F85\u5BE9\u72C0\u614B\uFF0C\u9700\u91CD\u65B0\u9A57\u6536\u3002`))return;try{await z.restoreQuestionBankItem(ve),A("\u984C\u76EE\u5DF2\u5FA9\u539F\u4E26\u56DE\u5230\u5F85\u5BE9\u3002","ok"),await f(),await k()}catch(V){let Pe=V.detail||V.payload?.detail,F=Pe?.errors?.join(" \xB7 ")||Pe?.message||V.message||"\u5FA9\u539F\u5931\u6557\u3002";A(F,"danger",8e3)}return}if(B==="delete"){if(n.tab==="suite"){let V=Q();if(!V||!(V.items||[]).find(F=>Number(F.id)===ve)||!window.confirm(`\u78BA\u5B9A\u5F9E\u300C${V.name}\u300D\u79FB\u9664\u984C\u76EE #${ve}\uFF1F\u984C\u76EE\u4ECD\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u7BA1\u7406\u4E2D\u3002`))return;try{await z.removeBenchmarkSuiteItem(V.id,ve),A("\u5DF2\u5F9E Benchmark \u984C\u5EAB\u79FB\u9664\u3002","info"),delete n.suiteAnswers[String(V.id)],Number(n.selectedBankItemId)===ve&&(n.selectedBankItemId=null),await M()}catch(F){A(F.message||"\u79FB\u9664\u5931\u6557\u3002","danger")}return}if(!window.confirm(`\u78BA\u5B9A\u522A\u9664\u984C\u76EE #${ve}\uFF1F\u984C\u76EE\u6703\u6A19\u8A18\u70BA retired\uFF0C\u6B77\u53F2 benchmark \u4ECD\u6703\u4FDD\u7559\u3002`))return;try{await z.deleteQuestionBankItem(ve),A("\u984C\u76EE\u5DF2\u522A\u9664\u3002","info"),await f(),n.tab==="review"?(n.reviewDetail=null,await G()):await k()}catch(V){A(V.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(B==="revalidate"){try{let V=await z.revalidateQuestionBank();A(`\u5DF2\u91CD\u65B0\u9A57\u8B49 ${d(V.checked||0)} \u984C\uFF0C${d(V.stale||0)} \u984C\u9700\u91CD\u65B0\u9A57\u6536\u3002`,"info",7e3),await f(),await k()}catch(V){A(V.message||"\u91CD\u65B0\u9A57\u8B49\u5931\u6557\u3002","danger")}return}if(B==="export"){try{let V=await z.exportQuestionBank({status:""});jt(`judgment-question-bank-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(V,null,2),"application/json;charset=utf-8")}catch(V){A(V.message||"\u532F\u51FA\u5931\u6557\u3002","danger")}return}if(B==="import-json"){let V=e.querySelector("#qb-import-json");try{let Pe=JSON.parse(String(V?.value||"").trim()),F=await z.importQuestionBank(Pe);A(`\u532F\u5165\u5B8C\u6210\uFF1A\u65B0\u589E ${F.created}\u3001\u66F4\u65B0 ${F.updated}\u3001\u932F\u8AA4 ${(F.errors||[]).length}\u3002`,(F.errors||[]).length?"warn":"ok",8e3),V&&(V.value=""),await f(),await k()}catch(Pe){A(Pe.message||"JSON \u532F\u5165\u5931\u6557\u3002","danger",8e3)}return}if(B==="prev"||B==="next"){n.offset=Math.max(0,n.offset+(B==="next"?n.limit:-n.limit)),await k();return}if(B==="suite-edit"){let V=n.suites.find(Pe=>Number(Pe.id)===ve);if(!V)return;n.editingSuite=V,n.suiteManageOpen=!0,M();return}if(B==="suite-new"){n.editingSuite=null,n.suiteManageOpen=!0,M();return}if(B==="suite-freeze"){try{await z.updateBenchmarkSuite(ve,{freeze:!0}),A("Benchmark \u984C\u5EAB\u5DF2\u51CD\u7D50\u4E26\u5EFA\u7ACB\u65B0\u7248\u672C\u3002","ok"),n.editingSuite=null,n.suiteManageOpen=!0,await M()}catch(V){A(V.message||"\u51CD\u7D50\u5931\u6557\u3002","danger")}return}if(B==="suite-delete"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 benchmark \u984C\u5EAB #${ve}\uFF1F\u6B77\u53F2 run \u4ECD\u6703\u4FDD\u7559 snapshot\u3002`))return;try{await z.deleteBenchmarkSuite(ve),A("Benchmark \u984C\u5EAB\u5DF2\u522A\u9664\u3002","info"),n.editingSuite=null,n.suiteAnswers={},n.suiteManageOpen=!0,await M()}catch(V){A(V.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(B==="decide"){let V=D.closest("form[data-qb-form='review']");V&&await K(V,String(D.dataset.decision||""))}},ke=async L=>{let C=L.target.closest("[data-qb-form]");if(!C)return;L.preventDefault();let B=C.dataset.qbForm;if(B==="create")await le(C);else if(B==="ai-create")await me(C);else if(B==="filter"){let D=new FormData(C);n.filters={query:String(D.get("query")||"").trim(),status:String(D.get("status")||""),question_type:String(D.get("question_type")||""),difficulty:String(D.get("difficulty")||""),tags:D.getAll("tags").map(ve=>String(ve).trim()).filter(Boolean)},n.offset=0,await k()}else B==="suite"&&await we(C)},tt=async L=>{let C=L.target.closest?.("form[data-qb-form='filter'] select");if(C){C.form.requestSubmit();return}let B=L.target.closest?.("[data-qb-suite-select]");if(!B)return;let D=Number(B.value||0);!D||D===Number(n.selectedSuiteId)||await De(D)},ie=L=>{let C=L.target;C?.matches?.(".qb-suite-manage")&&(n.suiteManageOpen=!!C.open)},$e=L=>{let C=L.target.closest?.("[data-qb-action='open-tag-search']");C&&R(C.closest("[data-qb-tag-filter]"))},_e=L=>{let C=L.target.closest?.("[data-qb-tag-filter]");C&&(L.relatedTarget&&C.contains(L.relatedTarget)||O(C))},Ae=L=>{let C=L.target.closest?.("[data-qb-tag-search]");if(!C)return;let B=C.closest("[data-qb-tag-filter]");c&&window.clearTimeout(c),c=window.setTimeout(()=>{S(B,C.value)},160)},Ye=L=>{let C=L.target.closest?.("[data-qb-tag-search]");if(!C)return;let B=C.closest("[data-qb-tag-filter]");L.key==="Escape"?(L.preventDefault(),O(B),C.blur()):L.key==="Enter"?(L.preventDefault(),B?.querySelector("[data-qb-action='select-tag']")?.click()):L.key==="ArrowDown"&&(L.preventDefault(),B?.querySelector("[data-qb-action='select-tag']")?.focus())};e.addEventListener("click",Be),e.addEventListener("submit",ke),e.addEventListener("change",tt),e.addEventListener("toggle",ie,!0),e.addEventListener("mouseover",$e),e.addEventListener("mouseout",_e),e.addEventListener("input",Ae),e.addEventListener("keydown",Ye);let nt=async()=>{await f(),n.tab==="create"?h():n.tab==="manage"?await k():n.tab==="suite"?await M({refreshAnswers:!0}):n.tab==="review"&&await G()};return f(),{show:ee,refresh:nt,destroy(){c&&window.clearTimeout(c),e.removeEventListener("click",Be),e.removeEventListener("submit",ke),e.removeEventListener("change",tt),e.removeEventListener("toggle",ie,!0),e.removeEventListener("mouseover",$e),e.removeEventListener("mouseout",_e),e.removeEventListener("input",Ae),e.removeEventListener("keydown",Ye)},getStats:()=>n.stats}}function xa(e){if(e==null||e==="")return"\u2014";let t=Number(e);return Number.isFinite(t)?`${t.toFixed(t>=10?1:2)}%`:"\u2014"}function Li(e){return e==null?"\u2014":d(e)}function xd(e){return e.count?e.severity==="danger"?He("failed","\u9700\u8655\u7406"):e.severity==="warn"?He("warning","\u6CE8\u610F"):He("preview","\u63D0\u793A"):He("success","\u901A\u904E")}function qd(e){return e.count?e.severity==="danger"?"is-danger":e.severity==="warn"?"is-warn":"is-info":"is-ok"}function Ad(e){let t=Number(e.count)||0,s=Math.max(0,Math.min(100,Number(e.percent)||0));return`<div class="quality-check ${qd(e)}">
    <div class="quality-check-head">
      <span class="quality-check-label">${r(e.label)}</span>
      ${xd(e)}
    </div>
    <div class="quality-check-value">
      <strong>${d(t)}</strong>
      <span>\u7B46</span>
      <em>${r(xa(e.percent))}</em>
    </div>
    <div class="quality-check-desc">${r(e.description)}</div>
    <div class="quality-check-track" aria-hidden="true">
      <span style="width:${s}%"></span>
    </div>
  </div>`}function Sa(e,t,s){let a=Array.isArray(s)?s:[];if(!a.length)return`<div class="index-chart-card">
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
  </div>`}function Ld(e){let t=e.coverage||{},s=e.totals||{},a=e.source||{},n=t.postgres_diff,i=n==null?"\u2014":n===0?"\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u4E00\u81F4":`\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u76F8\u5DEE ${d(Math.abs(n))} \u7B46`,o=t.vector_indexed===null||t.vector_indexed===void 0?t.detail||"\u7121\u6CD5\u53D6\u5F97\u7D22\u5F15\u7D71\u8A08":`${d(t.vector_indexed)} / ${d(t.vector_total)} \xB7 ${t.model||"\u2014"}`;return`<div class="metric-grid quality-coverage-grid">
    <div class="metric-card">
      <div class="metric-label">${p("filter",13)}<span>\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D</span></div>
      <div class="metric-value">${d(s.matched_rows)}</div>
      <div class="metric-foot">citation_count &gt; 0\uFF1B\u5171 ${d(s.citation_total)} \u7B46\u5F15\u7528</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${p("database",13)}<span>PostgreSQL \u6536\u9304</span></div>
      <div class="metric-value">${Li(t.postgres_judgments)}</div>
      <div class="metric-foot">${r(i)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${p("brain",13)}<span>\u5411\u91CF\u7D22\u5F15</span></div>
      <div class="metric-value">${r(xa(t.vector_coverage_pct))}</div>
      <div class="metric-foot">${r(o)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${p("layers",13)}<span>DuckDB \u5019\u9078</span></div>
      <div class="metric-value">${Li(a.candidate_total)}</div>
      <div class="metric-foot">${d(a.candidate_archive_count)} / ${d(a.archive_count)} \u500B manifest \u6709 candidate_count</div>
    </div>
  </div>`}function Md(e){return e.length?`<div class="table-wrap">
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
              <td class="cell-number">${r(xa(t.match_rate))}</td>
              <td class="cell-number">${d(t.short_text_rows)}</td>
              <td class="cell-number">${d(s)}</td>
              <td class="cell-number">${d(t.duplicate_content_rows)}</td>
              <td class="cell-date">${r(Lt(t.date_min))} \u2013 ${r(Lt(t.date_max))}</td>
            </tr>`}).join("")}
      </tbody>
    </table>
  </div>`:ot({iconName:"table",title:"\u6C92\u6709\u539F\u59CB Parquet \u6A94\u6848",text:"\u5B8C\u6210\u5224\u6C7A RAR \u532F\u5165\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6BCF\u500B\u58D3\u7E2E\u6A94\u7684 DuckDB \u7D71\u8A08\u3002"})}function jd(e){let t=e.totals||{},s=e.source||{},a=Array.isArray(e.checks)?e.checks:[],n=e.summary||{},i=e.distributions||{},o=Array.isArray(e.warnings)?e.warnings:[],l=Le(s.compressed_bytes||0);return`<div class="report-card quality-report" data-database="quality">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">DUCKDB DATA QUALITY</div>
        <div class="report-title">
          \u539F\u59CB Parquet \u8CC7\u6599\u54C1\u8CEA ${He(e.status||"operational")}
          <span class="chip">raw.parquet</span>
        </div>
        <div class="report-sub">
          ${d(t.rows)} \u7B46 \xB7 ${d(s.raw_files)} \u500B\u6A94\u6848 \xB7
          ${l} \xB7 \u6383\u63CF ${be(e.scan_ms||0)} \xB7
          ${r(Me(e.generated_at))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-quality">
          ${p("download",14)}<span>JSON</span>
        </button>
      </div>
    </div>
    ${o.length?`<div class="report-alert">${Re({tone:"warn",title:"\u76EE\u524D\u9650\u5236\u8207\u5DEE\u7570",text:o.map(u=>r(u)).join("<br>")})}</div>`:""}
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
        <div class="summary-value">${r(xa(t.match_rate))}</div>
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
      <div class="quality-checks">${a.map(Ad).join("")}</div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6536\u9304\u8986\u84CB</span>
        <span class="muted" style="font-size:9.5px">PostgreSQL \u8207\u5411\u91CF\u7D22\u5F15\u70BA\u5373\u6642\u67E5\u8A62\uFF0C\u4E0D\u662F\u5F9E Parquet \u63A8\u4F30</span>
      </div>
      ${Ld(e)}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6A94\u6848\u660E\u7D30</span>
        <span class="muted" style="font-size:9.5px">${d(s.archive_count)} \u500B\u539F\u59CB Parquet</span>
      </div>
      ${Md(Array.isArray(e.archives)?e.archives:[])}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u5206\u5E03\u7D71\u8A08</span>
        <span class="muted" style="font-size:9.5px">DuckDB group by / unnest</span>
      </div>
      <div class="quality-dist-grid">
        ${Sa("\u6CD5\u9662","\u5224\u6C7A\u7B46\u6578",i.courts)}
        ${Sa("\u88C1\u5224\u5E74\u4EFD","\u5224\u6C7A\u7B46\u6578",i.years)}
        ${Sa("\u71B1\u9580\u6CD5\u898F","\u63D0\u53CA\u5224\u6C7A\u6578",i.laws)}
        ${Sa("\u71B1\u9580\u6848\u7531","\u5224\u6C7A\u7B46\u6578",i.titles)}
      </div>
    </div>
  </div>`}async function Td(e){e.innerHTML=`<section class="page data-page quality-page">
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
          ${p("refresh",15)}<span>\u91CD\u65B0\u6383\u63CF</span>
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
            <span class="status-tab-icon">${p("activity",15)}</span>
            <span class="status-tab-copy"><strong>\u54C1\u8CEA\u7E3D\u89BD</strong><small>DuckDB \u539F\u59CB\u8CC7\u6599\u8207\u8986\u84CB\u6AA2\u67E5</small></span>
            <span class="badge badge-neutral" id="quality-badge-overview">\u2014</span>
          </button>
          <button class="status-tab" type="button" data-quality-tab="create">
            <span class="status-tab-icon">${p("plus",15)}</span>
            <span class="status-tab-copy"><strong>\u984C\u5EAB\u65B0\u589E</strong><small>Ollama \u81EA\u52D5\u51FA\u984C\u8207 JSON \u532F\u5165</small></span>
          </button>
          <button class="status-tab" type="button" data-quality-tab="manage">
            <span class="status-tab-icon">${p("database",15)}</span>
            <span class="status-tab-copy"><strong>\u984C\u5EAB\u7BA1\u7406</strong><small>\u7248\u672C\u3001\u72C0\u614B\u3001\u6A19\u7C64\u8207\u522A\u9664</small></span>
            <span class="badge badge-neutral" id="quality-badge-manage">\u2014</span>
          </button>
          <button class="status-tab" type="button" data-quality-tab="suite">
            <span class="status-tab-icon">${p("cube",15)}</span>
            <span class="status-tab-copy"><strong>Benchmark \u984C\u5EAB</strong><small>\u51CD\u7D50 suite \u8207 benchmark-ready \u984C\u76EE</small></span>
            <span class="badge badge-neutral" id="quality-badge-suite">\u2014</span>
          </button>
          <button class="status-tab" type="button" data-quality-tab="review">
            <span class="status-tab-icon">${p("shield",15)}</span>
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
  </section>`;let t=e.querySelector("#quality-content"),s=e.querySelector("#quality-refresh"),a=e.querySelector("#quality-meta"),n=[...e.querySelectorAll("[data-quality-tab]")],i={overview:e.querySelector("#quality-panel-overview"),create:e.querySelector("#quality-panel-question-create"),manage:e.querySelector("#quality-panel-question-manage"),suite:e.querySelector("#quality-panel-benchmark-bank"),review:e.querySelector("#quality-panel-question-review")},o=null,l="overview",u=()=>{if(!o)return;t.innerHTML=jd(o),a.textContent=`DUCKDB \xB7 ${d(o.totals?.rows)} \u7B46 \xB7 ${be(o.scan_ms||0)}`;let h=e.querySelector("#quality-badge-overview");h&&(h.textContent=d(o.totals?.rows||0))},c=h=>{l=h==="overview"?"overview":h;for(let _ of n){let S=_.dataset.qualityTab===l;_.classList.toggle("is-active",S),S?_.setAttribute("aria-current","page"):_.removeAttribute("aria-current")}for(let[_,S]of Object.entries(i))S&&(S.hidden=_!==l);l!=="overview"?a.textContent="QUESTION BANK \xB7 \u984C\u5EAB\u5DE5\u4F5C\u5340":o&&u()},b=Ai(e,{onNavigate:h=>c(h),onStats:h=>{let _=h||{},S=e.querySelector("#quality-badge-manage"),R=e.querySelector("#quality-badge-suite"),O=e.querySelector("#quality-badge-review");S&&(S.textContent=d(_.total||0)),R&&(R.textContent=d(_.benchmark_ready||0)),O&&(O.textContent=d((_.pending_review||0)+(_.changes_requested||0)))}}),$=h=>{c(h),h!=="overview"&&b.show(h)},v=async()=>{qe(s,!0,"\u6383\u63CF\u4E2D\u2026");try{o=await z.quality(),u()}catch(h){t.innerHTML=`<div class="report-card">
        <div class="report-head">
          <div class="report-title-group">
            <div class="report-kicker">DUCKDB DATA QUALITY</div>
            <div class="report-title">\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557</div>
            <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
          </div>
        </div>
        <div class="report-section">
          ${Re({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u54C1\u8CEA\u7D71\u8A08",text:r(h.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
        </div>
      </div>`,a.textContent="DUCKDB \xB7 \u8B80\u53D6\u5931\u6557",A("\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}finally{qe(s,!1)}},f=async()=>{l==="overview"?await v():await b.refresh()};s.addEventListener("click",f),e.addEventListener("click",h=>{let _=h.target.closest("[data-quality-tab]");_&&$(_.dataset.qualityTab||"overview")}),t.addEventListener("click",h=>{!h.target.closest("[data-action='export-quality']")||!o||jt(`judgment-quality-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(o,null,2),"application/json;charset=utf-8")}),c("overview"),await v()}var Cn={};Ht(Cn,{render:()=>ou});var qa={};Ht(qa,{render:()=>En});var Mi={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"};function ji(e,t){let s=Array.isArray(t)?t:[];return`<div class="tests-model-group">
    <span class="tests-model-label">${r(e)}</span>
    <div class="tests-model-chips">${s.length?s.map(a=>`<span class="chip chip-mono">${r(a)}</span>`).join(""):'<span class="tests-model-empty">\u672A\u5075\u6E2C\u5230\u6A21\u578B</span>'}</div>
  </div>`}function Nd(e){let t=e?.supports_chat,s=t===!0?"badge-ok":t===!1?"badge-danger":"badge-neutral",a=t===!0?"\u652F\u63F4 chat":t===!1?"\u4E0D\u652F\u63F4 chat":"\u672A\u6E2C\u8A66",n=(Array.isArray(e?.capabilities)?e.capabilities:[]).map(i=>`<span class="chip chip-mono">${r(i)}</span>`).join("");return`<div class="tests-llm-row">
    <div class="tests-llm-model">
      <strong class="mono">${r(e?.model||"\u2014")}</strong>
      <small>${r(e?.detail||"")}</small>
    </div>
    <div class="tests-llm-meta">
      <span class="badge ${s}">${a}</span>
      ${e?.tested_now?'<span class="badge badge-info">\u672C\u6B21\u65B0\u6E2C</span>':""}
      ${n}
      <span class="tests-llm-time">${e?.tested_at?`\u6E2C\u8A66\u65BC ${r(Me(e.tested_at))}`:"\u5C1A\u7121\u6E2C\u8A66\u7D00\u9304"}</span>
    </div>
  </div>`}function Ed(e){let t=Array.isArray(e?.models)?e.models:[],s=e?.counts||{},a=Array.isArray(e?.failures)?e.failures:[];return{summary:e?`<span>Ollama <strong>${s.available??t.length}</strong> \u500B\u6A21\u578B</span>
      <span>\u652F\u63F4 chat <strong>${s.chat??0}</strong></span>
      <span>\u4E0D\u652F\u63F4 <strong>${s.unsupported??0}</strong></span>
      <span>\u672A\u6E2C\u8A66 <strong>${s.untested??0}</strong></span>
      <span>\u672C\u6B21\u65B0\u6E2C <strong>${(e.tested_now||[]).length}</strong></span>
      <span class="muted">${r(e.detail||"")}</span>`:"<span>\u6B63\u5728\u8B80\u53D6 Ollama \u6A21\u578B\u6E05\u55AE\u2026</span>",list:t.length?t.map(Nd).join(""):'<div class="tests-llm-empty">\u5C1A\u7121\u6A21\u578B\u8CC7\u6599\uFF1B\u8ACB\u78BA\u8A8D Ollama \u5DF2\u555F\u52D5\u4E26\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66\u3002</div>',failures:a.length?`<div class="tests-llm-failures">${a.map(i=>`<span><strong class="mono">${r(i.model||"\u2014")}</strong> ${r(i.detail||"\u6E2C\u8A66\u5931\u6557")}</span>`).join("")}</div>`:""}}function Cd(e,t,s){return JSON.stringify({selected:s,runs:(t||[]).map(a=>`${a.run_id}:${a.status}`),run:e?{run_id:e.run_id,status:e.status,progress:e.progress,total_ms:e.total_ms,steps:(e.steps||[]).map(a=>`${a.stage}:${a.model}:${a.status}:${a.progress}:${a.duration_ms}`)}:null})}async function En(e,t,{embedded:s=!1}={}){let a=!1,n=!1,i={embedding:[],llm:[]},o=!1,l=null,u=!1,c=null,b=[],$="",v=null,f="",h=`<div class="page-actions">
      <span class="badge badge-neutral badge-mono" id="tests-mode-badge">\u8B80\u53D6\u4E2D</span>
      <button class="btn btn-secondary" type="button" id="tests-refresh">
        ${p("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
      </button>
    </div>`,_=s?`<div class="tests-embed-head">
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
    ${_}

    <div class="tests-grid">
      <section class="card tests-card tests-api-card" aria-labelledby="tests-api-title">
        <form class="api-dialog-form tests-api-form" id="tests-api-form" novalidate>
          <div class="api-dialog-head">
            <span class="api-dialog-icon" aria-hidden="true">${p("link",17)}</span>
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
              ${p("activity",14)}<span>\u6E2C\u8A66\u9023\u7DDA</span>
            </button>
            <span class="grow"></span>
            <button class="btn btn-ghost btn-sm" type="button" id="tests-api-reset">\u6062\u5FA9\u9810\u8A2D</button>
            <button class="btn btn-primary btn-sm" type="submit" id="tests-api-save">
              ${p("check",14)}<span>\u5132\u5B58\u4E26\u91CD\u65B0\u8F09\u5165</span>
            </button>
          </div>
        </form>
      </section>

      <section class="card tests-card" aria-labelledby="tests-mode-title">
        <div class="tests-card-head">
          <span class="tests-card-icon">${p("terminal",16)}</span>
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
            ${p("sparkles",13)}<span>\u524D\u5F80 RAG \u63D0\u554F</span>
          </a>
          <a class="btn btn-secondary btn-sm" href="#/performance">
            ${p("activity",13)}<span>\u6548\u80FD Flow</span>
          </a>
        </div>
        <div class="tests-status" id="tests-mode-status" role="status"></div>
      </section>
    </div>

    <section class="card tests-card tests-llm-card" aria-labelledby="tests-llm-title">
      <div class="tests-card-head">
        <span class="tests-card-icon">${p("brain",16)}</span>
        <div>
          <div class="tests-card-title" id="tests-llm-title">LLM \u670D\u52D9\u6E2C\u8A66</div>
          <div class="tests-card-copy">\u6AA2\u67E5 Ollama \u4E0A\u6BCF\u500B\u6A21\u578B\u662F\u5426\u652F\u63F4 chat\uFF0C\u4E26\u628A\u7D50\u679C\u5BEB\u5165\u80FD\u529B\u6E05\u55AE\uFF1B\u5DF2\u6709\u6E2C\u8A66\u7D00\u9304\u7684\u6A21\u578B\u4E0D\u6703\u91CD\u6E2C\u3002LLM \u6548\u80FD\u8A55\u4F30\u53EA\u6703\u7D0D\u5165\u652F\u63F4 chat \u7684\u6A21\u578B\u3002</div>
        </div>
      </div>
      <div class="tests-llm-head">
        <div class="tests-llm-summary" id="tests-llm-summary">\u6B63\u5728\u8B80\u53D6 Ollama \u6A21\u578B\u6E05\u55AE\u2026</div>
        <button class="btn btn-primary btn-sm" type="button" id="tests-llm-test">
          ${p("activity",14)}<span>\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66</span>
        </button>
      </div>
      <div class="tests-llm-list" id="tests-llm-list"></div>
      <div id="tests-llm-failures"></div>
      <div class="tests-status" id="tests-llm-status" role="status"></div>
    </section>

    <div id="tests-flow"></div>
  </section>`;let S=e.querySelector("#tests-mode-badge"),R=e.querySelector("#tests-mode-toggle"),O=e.querySelector("#tests-mode-summary"),I=e.querySelector("#tests-mode-models"),Q=e.querySelector("#tests-mode-status"),oe=e.querySelector("#tests-api-form"),te=e.querySelector("#tests-api-input"),je=e.querySelector("#tests-api-preview"),De=e.querySelector("#tests-api-status"),X=e.querySelector("#tests-api-note"),P=e.querySelector("#tests-api-test"),k=e.querySelector("#tests-api-reset"),M=e.querySelector("#tests-api-save"),Z=e.querySelector("#tests-refresh"),ue=e.querySelector("#tests-flow"),G=e.querySelector("#tests-llm-summary"),ee=e.querySelector("#tests-llm-list"),J=e.querySelector("#tests-llm-failures"),le=e.querySelector("#tests-llm-status"),me=e.querySelector("#tests-llm-test"),K=(F,ge,Ue="")=>{F&&(F.textContent=ge,F.className=`tests-status${Ue?` is-${Ue}`:""}`)},we=(F,ge="")=>{De&&(De.textContent=F,De.className=`api-dialog-status${ge?` is-${ge}`:""}`)},Be=()=>Gt()==="query",ke=()=>{let F=Ut(te.value);return F||(window.location.protocol==="file:"?Ca:"")},tt=()=>{let F=ke(),ge=Qt(),Ue=Mi[Gt()]||Gt()||"\u540C\u6E90";je.innerHTML=`\u76EE\u524D\u751F\u6548\uFF1A<strong>${r(ts(ge))}</strong>${ge?`\uFF08${r(Ue)}\uFF09`:""}<br />\u6B64\u4F4D\u5740\u7684\u5065\u5EB7\u6AA2\u67E5\uFF1A${r(ft("/api/health",F))}`},ie=()=>{let F=Gt(),ge=`\u76EE\u524D\u4F86\u6E90\uFF1A${Mi[F]||F||"\u540C\u6E90"}\u3002\u512A\u5148\u9806\u5E8F\u70BA ?api= \u2192 \u700F\u89BD\u5668\u5132\u5B58\u503C \u2192 config.js \u2192 \u540C\u6E90\u3002`,Ue="";F==="query"?(Ue="is-warn",ge="\u6B64\u9801\u7531\u7DB2\u5740\u7684 ?api= \u53C3\u6578\u6307\u5B9A\u5F8C\u7AEF\u4F4D\u5740\uFF0C\u5177\u6709\u6700\u9AD8\u512A\u5148\u9806\u5E8F\u3002\u5132\u5B58\u6216\u6062\u5FA9\u9810\u8A2D\u5728\u6B64\u9801\u4E0D\u6703\u751F\u6548\uFF1B\u8ACB\u5148\u79FB\u9664\u7DB2\u5740\u4E2D\u7684 api \u53C3\u6578\u3002"):Vs()?(Ue="is-warn",ge="\u6B64\u9801\u4E0D\u662F\u5F9E localhost \u958B\u555F\uFF0C\u4E14\u5C1A\u672A\u8A2D\u5B9A\u5F8C\u7AEF API\u3002\u8ACB\u586B\u5165 cloudflared \u7684 https:// \u4F4D\u5740\uFF0C\u6216\u90E8\u7F72\u6642\u5728 config.js \u6307\u5B9A apiBase\uFF1BHTTP \u4F4D\u5740\u6703\u88AB HTTPS \u9801\u9762\u963B\u64CB\u3002"):(F==="file-default"||window.location.protocol==="file:")&&(ge="\u4EE5 file:// \u76F4\u63A5\u958B\u555F\u6642\uFF0C\u9810\u8A2D\u9023\u5230 http://127.0.0.1:9200\u3002\u82E5\u5F8C\u7AEF\u4F7F\u7528\u5176\u4ED6\u9023\u63A5\u57E0\uFF0C\u8ACB\u5728\u6B64\u4FEE\u6539\u4E26\u5132\u5B58\u3002"),X.textContent=ge,X.className=`api-dialog-note${Ue?` ${Ue}`:""}`;let Ge=F==="query";M.disabled=Ge,k.disabled=Ge,te.readOnly=Ge},$e=()=>{if(!Ra(te.value))return we("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002","error"),te.focus(),null;let F=ke();return window.location.protocol==="https:"&&/^http:\/\//i.test(F)&&!/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(F)?(we("HTTPS \u9801\u9762\u7121\u6CD5\u9023\u7DDA\u5230 HTTP API\uFF08mixed content\uFF09\u3002\u8ACB\u6539\u7528 cloudflared \u63D0\u4F9B\u7684 https:// \u4F4D\u5740\u3002","error"),te.focus(),null):F},_e=()=>{te.value=Qt(),tt(),ie(),we("\u53EF\u5148\u6E2C\u8A66\u9023\u7DDA\uFF0C\u5132\u5B58\u5F8C\u9801\u9762\u6703\u91CD\u65B0\u8F09\u5165\u3002")},Ae=()=>{let F=Array.isArray(i.embedding)?i.embedding.length:0,ge=Array.isArray(i.llm)?i.llm.length:0;if(S&&(S.textContent=o?"\u5207\u63DB\u4E2D\u2026":n?"\u6E2C\u8A66\u6A21\u5F0F ON":"\u6E2C\u8A66\u6A21\u5F0F OFF",S.className=`badge badge-mono ${o?"badge-info":n?"badge-warn":"badge-neutral"}`),R){R.disabled=o,R.classList.toggle("is-on",n),R.classList.toggle("is-off",!n&&!o),R.classList.toggle("is-busy",o),R.setAttribute("aria-checked",n?"true":"false"),R.setAttribute("aria-busy",o?"true":"false"),R.setAttribute("aria-label",o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F":n?"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF0C\u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\uFF0C\u9EDE\u64CA\u958B\u555F"),R.title=o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F\u2026":n?"\u6E2C\u8A66\u6A21\u5F0F ON \xB7 \u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F OFF \xB7 \u9EDE\u64CA\u958B\u555F";let Ue=R.querySelector(".header-power-label");Ue&&(Ue.textContent=o?"\u2026":n?"ON":"OFF")}O&&(O.textContent=n?`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${F} \u500B embedding \u8207 ${ge} \u500B LLM \u6A21\u578B\u3002`:"\u76EE\u524D\u4F7F\u7528\u5FEB\u901F\u6A21\u5F0F\uFF1A\u55AE\u4E00 embedding \u8207 LLM\u3002"),I&&(I.innerHTML=ji("Embedding",i.embedding)+ji("LLM",i.llm))},Ye=async()=>{try{let F=await z.testMode();if(a)return;n=!!F.enabled,i=F.models||{embedding:[],llm:[]},K(Q,"")}catch(F){if(a)return;n=!1,i={embedding:[],llm:[]},K(Q,F.message||"\u7121\u6CD5\u8B80\u53D6\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF API\u3002","error")}a||Ae()},nt=async()=>{if(o)return;let F=!n;o=!0,Ae(),K(Q,F?"\u6B63\u5728\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u2026":"\u6B63\u5728\u95DC\u9589\u6E2C\u8A66\u6A21\u5F0F\u2026");try{let ge=await z.setTestMode(F);if(a)return;n=!!ge.enabled,i=ge.models||{embedding:[],llm:[]},window.dispatchEvent(new CustomEvent("judgment:test-mode",{detail:{enabled:n,models:i}}));let Ue=i.embedding?.length||0,Ge=i.llm?.length||0;K(Q,n?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A\u4E0B\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C ${Ue} \u500B embedding \u8207 ${Ge} \u500B LLM \u6A21\u578B\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","ok"),A(n?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A${Ue} \u500B embedding\u3001${Ge} \u500B LLM\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002",n?"ok":"info",6e3),await V()}catch(ge){a||(K(Q,ge.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","error"),A(ge.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","danger",6e3))}finally{o=!1,a||Ae()}},L=()=>{let F=Ed(l);if(G&&(G.innerHTML=F.summary),ee&&(ee.innerHTML=F.list),J&&(J.innerHTML=F.failures),me){me.disabled=u,me.setAttribute("aria-busy",u?"true":"false");let ge=me.querySelector("span");ge&&(ge.textContent=u?"\u6E2C\u8A66\u4E2D\u2026":"\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66")}},C=async()=>{try{let F=await z.llmModels();if(a)return;l=F,K(le,"")}catch(F){if(a)return;l=null,K(le,F.message||"\u7121\u6CD5\u8B80\u53D6 Ollama \u6A21\u578B\u6E05\u55AE\u3002","error")}a||L()},B=async()=>{if(!u){u=!0,L(),K(le,"\u6B63\u5728\u6AA2\u67E5 Ollama \u6A21\u578B\u8207 chat \u80FD\u529B\u2026");try{let F=await z.testLlmModels();if(a)return;l=F;let ge=F.tested_now?.length||0,Ue=F.chat_models?.length||0,Ge=F.failures?.length||0;K(le,`${ge?`\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u672C\u6B21\u65B0\u6E2C ${ge} \u500B\u6A21\u578B`:"\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u6C92\u6709\u65B0\u6A21\u578B"}\uFF0C\u76EE\u524D ${Ue} \u500B\u6A21\u578B\u652F\u63F4 chat${Ge?`\uFF1B${Ge} \u500B\u6A21\u578B\u66AB\u6642\u7121\u6CD5\u5224\u5B9A\uFF0C\u4E0B\u6B21\u6703\u91CD\u8A66`:""}\u3002`,Ge?"warn":"ok"),A(ge?`LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u65B0\u589E ${ge} \u7B46\u80FD\u529B\u7D00\u9304\u3002`:"LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u6C92\u6709\u65B0\u6A21\u578B\u9700\u8981\u6E2C\u8A66\u3002",Ge?"warn":"ok",5e3),await Ye()}catch(F){a||(K(le,F.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","error"),A(F.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","danger",6e3))}finally{u=!1,a||L()}}},D=()=>{if(!ue)return;let F=Cd(c,b,$);F!==f&&(f=F,ue.innerHTML=ys(c,b,$))},ve=async()=>{try{let F=await z.testRuns(30);if(a)return;b=Array.isArray(F.runs)?F.runs:[]}catch{if(a)return;b=[]}},V=async(F=null)=>{try{let ge=F||($?await z.testRun($):await z.testRunCurrent());if(a)return;c=ge.run||null,!$&&c&&c.status!=="running"&&!b.some(Ue=>Ue.run_id===c.run_id)&&await ve()}catch{if(a)return;c=null}a||D()};te?.addEventListener("input",()=>{tt(),we("\u5C1A\u672A\u6E2C\u8A66\u6B64\u4F4D\u5740\u3002")}),P?.addEventListener("click",async()=>{let F=$e();if(F!==null){qe(P,!0,"\u6E2C\u8A66\u4E2D\u2026"),we(`\u6B63\u5728\u9023\u7DDA\u5230 ${ts(F)||"\u540C\u6E90"}\u2026`);try{let ge=await Fn(F);if(a)return;we(`\u9023\u7DDA\u6210\u529F \xB7 v${ge.version} \xB7 ${ge.duration_ms} ms \xB7 GET ${ft("/api/health",F)}`,"ok")}catch(ge){a||we(ge.message||"\u9023\u7DDA\u6E2C\u8A66\u5931\u6557\u3002","error")}finally{a||qe(P,!1)}}}),oe?.addEventListener("submit",F=>{if(F.preventDefault(),Be())return;let ge=$e();ge!==null&&(Oa(ge),A(`\u5F8C\u7AEF API \u5DF2\u8A2D\u70BA ${ts(ge)}\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026`,"ok",1600),window.setTimeout(()=>window.location.reload(),120))}),k?.addEventListener("click",()=>{Be()||(Oa(""),A("\u5DF2\u6E05\u9664\u700F\u89BD\u5668\u5132\u5B58\u7684 API \u4F4D\u5740\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026","info",1600),window.setTimeout(()=>window.location.reload(),120))}),R?.addEventListener("click",nt),me?.addEventListener("click",B),ue?.addEventListener("change",async F=>{F.target.id==="test-run-select"&&($=String(F.target.value||""),await V())}),ue?.addEventListener("click",async F=>{F.target.closest("#test-flow-refresh")&&($="",await ve(),await V())}),Z?.addEventListener("click",async()=>{qe(Z,!0,"\u66F4\u65B0\u4E2D\u2026"),_e(),await Promise.allSettled([Ye(),ve(),C()]),a||await V(),a||(qe(Z,!1),A("\u7CFB\u7D71\u6E2C\u8A66\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200))});let Pe=F=>{n=!!F.detail?.enabled,i=F.detail?.models||{embedding:[],llm:[]},Ae()};return window.addEventListener("judgment:test-mode",Pe),_e(),Ae(),L(),await Promise.allSettled([Ye(),ve(),C()]),await V(),v=bt("test-runs",async(F,ge)=>{a||document.hidden||$||await V(ge?.snapshot||null)}),!s&&typeof t?.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"),()=>{a=!0,v&&v(),window.removeEventListener("judgment:test-mode",Pe)}}var Ti={frontend:"browser",backend:"server",database:"database",storage:"layers",vector:"cube",ai:"brain",default:"cpu"};var Ci={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90"},Ri=[{id:"overview",label:"\u670D\u52D9\u7E3D\u89BD",hint:"\u5065\u5EB7\u72C0\u614B\u8207\u8CC7\u6599\u91CF",icon:"activity"},{id:"tests",label:"\u7CFB\u7D71\u6E2C\u8A66",hint:"API\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u6A21\u578B Flow",icon:"terminal"},{id:"resources",label:"\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528",hint:"CPU\u3001RAM\u3001Docker\u3001\u786C\u789F",icon:"cpu"},{id:"local-model",label:"Model Provider",hint:"Ollama \u4E3B\u6A5F\u8207\u6A21\u578B",icon:"server"},{id:"architecture",label:"\u524D\u5F8C\u7AEF\u67B6\u69CB",hint:"Client \u2192 Data \u2192 AI",icon:"layers"},{id:"data",label:"\u8CC7\u6599\u7248\u672C",hint:"Parquet \u8207 PostgreSQL",icon:"database"},{id:"api",label:"API \u7AEF\u9EDE",hint:"REST \u8207 OpenAPI",icon:"terminal"},{id:"runs",label:"\u6700\u8FD1\u4E0B\u8F09",hint:"\u6CD5\u898F\uFF0F\u547D\u4EE4\u57F7\u884C\u7D00\u9304",icon:"history"}];function Rd(e){return e==="operational"?{label:"\u6838\u5FC3\u670D\u52D9\u6B63\u5E38",tone:"ok",headline:"\u6838\u5FC3\u8CC7\u6599\u7BA1\u7DDA\u904B\u4F5C\u4E2D",copy:"FastAPI\u3001PostgreSQL \u8207 Parquet \u5747\u53EF\u5B58\u53D6\u3002Qdrant\u3001Embedding \u8207 LLM \u6703\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u8A2D\u5B9A\u6216\u964D\u7D1A\u6642\u4E0D\u5F71\u97FF\u8CC7\u6599\u700F\u89BD\u8207\u67E5\u8A62\u5831\u8868\u3002"}:e==="degraded"?{label:"\u90E8\u5206\u670D\u52D9\u964D\u7D1A",tone:"warn",headline:"\u90E8\u5206\u670D\u52D9\u9700\u8981\u8A2D\u5B9A\u6216\u4FEE\u5FA9",copy:"\u6838\u5FC3\u8CC7\u6599\u670D\u52D9\u76EE\u524D\u672A\u5B8C\u5168\u53EF\u7528\u3002\u8ACB\u67E5\u770B\u4E0B\u65B9\u670D\u52D9\u5361\u7247\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u7684\u57F7\u884C\u7D00\u9304\uFF0C\u78BA\u8A8D PostgreSQL\u3001Parquet \u6216\u5916\u90E8\u670D\u52D9\u72C0\u614B\u3002"}:{label:Mt(e).label,tone:Mt(e).tone,headline:"\u76EE\u524D\u7121\u6CD5\u78BA\u8A8D\u7CFB\u7D71\u72C0\u614B",copy:"\u72C0\u614B API \u56DE\u50B3\u4E86\u975E\u9810\u671F\u7D50\u679C\u3002\u8ACB\u91CD\u65B0\u6574\u7406\uFF0C\u6216\u76F4\u63A5\u6AA2\u67E5 FastAPI \u670D\u52D9\u65E5\u8A8C\u3002"}}function Pd(e){let t=Mt(e.status),s=Ti[e.kind]||Ti.default,a=e.latency_ms===null||e.latency_ms===void 0?"":`<span class="service-latency">${d(e.latency_ms)} ms</span>`;return`<article class="service-card">
    <div class="service-top">
      <span class="service-icon">${p(s,14)}</span>
      <span class="service-name" title="${r(e.name)}">${r(e.name)}</span>
      <span class="service-kind">${r(e.kind||"")}</span>
    </div>
    <div class="service-status">
      <span class="status-dot ${t.tone==="ok"?"is-ok":t.tone==="warn"?"is-warn":t.tone==="danger"?"is-danger":"is-idle"}" aria-hidden="true"></span>
      ${r(t.label)}
      ${a}
    </div>
    <p class="service-detail" title="${r(e.detail||"")}">${r(e.detail||"")}</p>
  </article>`}function Id(e,t){return`<div class="arch-node ${e?"":"is-muted"}" ${e?"":'title="\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165"'}>${r(t)}</div>`}function Bd(e,t){if(e==="IndexedDB")return ir();let a={PostgreSQL:"postgres",Parquet:"parquet",Qdrant:"qdrant",Embedding:"embedding",Retriever:"rag",Reranker:"reranker","RAG Engine":"rag",LLM:"llm"}[e];return a?t.find(i=>i.id===a)?.status==="operational":!0}function Od(e,t){let s=e?.layers||[];if(!s.length)return'<div class="report-empty-inline">\u72C0\u614B API \u672A\u63D0\u4F9B\u67B6\u69CB\u8CC7\u6599\u3002</div>';let a=s.map(i=>{let o=(i.nodes||[]).map(l=>Id(Bd(l,t),l)).join("");return`<div class="arch-layer">
      <div class="arch-layer-label">${r(i.label||i.id)}</div>
      <div class="arch-nodes">${o}</div>
    </div>`}),n=[];return a.forEach((i,o)=>{o&&n.push(`<div class="arch-arrow" aria-hidden="true">${p("arrowRight",15)}</div>`),n.push(i)}),`<div class="arch-flow">${n.join("")}</div>
    <div class="arch-legend">
      <span><i class="legend-key is-live"></i>\u5DF2\u63A5\u5165\u4E14\u72C0\u614B\u6B63\u5E38</span>
      <span><i class="legend-key is-off"></i>\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165</span>
      <span>${p("info",12)} \u7BC0\u9EDE\u72C0\u614B\u4F86\u81EA\u4E3B\u670D\u52D9\u5065\u5EB7\u6AA2\u67E5</span>
    </div>`}function Dd(e){return!Array.isArray(e)||!e.length?'<div class="report-empty-inline">\u6C92\u6709\u7AEF\u9EDE\u8CC7\u8A0A\u3002</div>':`<div class="endpoint-list">
    ${e.map(t=>`<div class="endpoint-row">
          <span class="endpoint-method">${r(t.method)}</span>
          <span class="endpoint-path" title="${r(t.path)}">${r(t.path)}</span>
          <span class="endpoint-label">${r(t.label||"")}</span>
        </div>`).join("")}
  </div>`}function Qe(e,t){return`<div class="detail-row">
    <span class="detail-label">${r(e)}</span>
    <span class="detail-value">${t}</span>
  </div>`}function Fd(e){return e?`<div class="detail-list">
    ${Qe("\u7248\u672C ID",`<strong>#${d(e.id)}</strong>`)}
    ${Qe("\u8CC7\u6599\u985E\u578B",He("operational",e.source_type==="law"?"\u6CD5\u898F":"\u547D\u4EE4"))}
    ${Qe("\u4F86\u6E90\u66F4\u65B0\u65E5",`<strong>${r(e.update_date||"\u2014")}</strong>`)}
    ${Qe("\u6CD5\u898F / \u689D\u6587",`<strong>${d(e.law_count)} / ${d(e.article_count)}</strong>`)}
    ${Qe("\u4E0B\u8F09\u6642\u9593",`<span class="mono">${Me(e.downloaded_at)}</span>`)}
    ${Qe("Parquet",`<code title="${r(e.parquet_path||"")}">${r(e.parquet_path||"\u2014")}</code>`)}
  </div>`:'<div class="report-empty-inline">\u5C1A\u672A\u532F\u5165\u4EFB\u4F55\u8CC7\u6599\u7248\u672C\u3002</div>'}function zd(e){if(!Array.isArray(e)||!e.length)return ot({iconName:"history",title:"\u5C1A\u7121\u4E0B\u8F09\u57F7\u884C\u7D00\u9304",text:"\u57F7\u884C judgment-law-download \u5F8C\uFF0C\u6210\u529F\u3001\u7121\u8B8A\u66F4\u8207\u5931\u6557\u7684\u7D50\u679C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"});let t=[{key:"id",label:"Run",type:"number"},{key:"source_type",label:"\u985E\u578B",type:"source"},{key:"status",label:"\u72C0\u614B",type:"status"},{key:"started_at",label:"\u958B\u59CB\u6642\u9593",type:"datetime"},{key:"duration_ms",label:"\u8017\u6642",type:"duration"},{key:"law_count",label:"\u6CD5\u898F",type:"number"},{key:"article_count",label:"\u689D\u6587",type:"number"},{key:"error_message",label:"\u932F\u8AA4",type:"longtext"}];return`<div class="table-wrap" style="border-top:0;max-height:340px">
    <table class="data-table runs-table">
      <thead><tr>${t.map(s=>`<th scope="col">${r(s.label)}</th>`).join("")}</tr></thead>
      <tbody>
        ${e.map(s=>`<tr>${t.map(a=>`<td>${Ys(s[a.key],a.type)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </div>`}function Hd(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=new Map(s.map(_=>[_.id,_])),n=a.get("qdrant"),i=a.get("embedding"),o=a.get("rag"),l=a.get("llm"),u=Number(t.judgment_indexed_count||0),c=Number(t.judgment_count||0),b=c?(u/c*100).toFixed(1):"0.0",$=t.judgment_vector_points===null||t.judgment_vector_points===void 0?"\u2014":d(t.judgment_vector_points),v=Number(t.judgment_index_remaining||0),f=o?.status==="operational"?"RAG \u5C31\u7DD2":o?.status==="not_configured"?"\u672A\u8A2D\u5B9A":o?.status==="degraded"?"\u964D\u7D1A":"\u672A\u77E5",h=[["cube","Qdrant \u5411\u91CF\u7D22\u5F15",n],["layers",`Embedding\uFF08${t.judgment_vector_model||"\u2014"}\uFF09`,i],["brain","RAG \u56DE\u7B54\u7BA1\u7DDA",o],["sparkles","LLM \u6A21\u578B",l]];return`<section class="card data-section rag-index-card">
    <div class="side-card-head">
      <span class="side-card-title">${p("database",14)}RAG \u8CC7\u6599\u73FE\u6CC1</span>
      ${He(o?.status,f)}
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
          <div class="mini-stat-value">${b}%</div>
          <div class="mini-stat-label">\u7D22\u5F15\u8986\u84CB</div>
        </div>
      </div>
      <div class="side-status-list">
        ${h.map(([_,S,R])=>`<div class="side-status-row">
              <span>${p(_,13)}${r(S)}</span>
              ${He(R?.status,R?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
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
  </section>`}function Ud(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=Rd(e.status),n=s.find(c=>c.id==="qdrant"),i=s.find(c=>c.id==="rag"),o=s.find(c=>c.id==="llm"),l=Gt(),u=Ci[l]||l;return`<section class="status-hero">
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
          <span>${p("clock",11)} \u6AA2\u67E5\u6642\u9593 ${Me(e.checked_at)} \xB7 ${r(Ms(e.checked_at))}</span>
          <span>${p("server",11)} ${s.length} \u500B\u670D\u52D9\u5143\u4EF6</span>
          <span>${p("database",11)} ${d(t.total_current)} \u7B46\u73FE\u884C\u8CC7\u6599</span>
          <span>${p("layers",11)} ${d(t.parquet_files)} \u500B\u539F\u59CB Parquet</span>
          <span title="API \u4F4D\u5740\u4F86\u6E90\uFF1A${r(u)}">${p("link",11)} ${r(ts())}</span>
        </div>
      </div>
    </section>

    <div class="service-grid">${s.map(Pd).join("")}</div>

    ${Hd(e)}

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

    ${n?.status==="not_configured"||i?.status==="not_configured"||o?.status==="not_configured"?`<div class="data-section">${Re({tone:"info",title:"\u90E8\u5206 AI \u5143\u4EF6\u5C1A\u672A\u8A2D\u5B9A",text:`Qdrant\uFF1A${r(n?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BRAG\uFF1A${r(i?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BLLM\uFF1A${r(o?.detail||"\u672A\u8A2D\u5B9A")}\u3002\u9019\u4E9B\u72C0\u614B\u4E0D\u6703\u88AB\u507D\u88DD\u6210\u53EF\u7528\u3002`})}</div>`:""}`}function Qd(e){let t=Array.isArray(e.services)?e.services:[],s=e.architecture||{};return`<div class="data-section card architecture-card">
    <div class="section-head">
      <div>
        <div class="section-title">\u524D\u5F8C\u7AEF\u67B6\u69CB</div>
        <div class="section-sub">Client \u2192 Application \u2192 Data \u2192 Intelligence</div>
      </div>
      <span class="badge badge-neutral badge-mono">${d((s.flow||[]).length)} layers</span>
    </div>
    ${Od(s,t)}
  </div>`}function Gd(e){let t=Gt(),s=Ci[t]||t,a=ft("/api/docs"),n=ft("/api/openapi.json");return`<div class="status-columns is-single">
    <section class="card">
      <div class="side-card-head">
        <span class="side-card-title">${p("terminal",14)}API \u7AEF\u9EDE</span>
        <a href="${r(a)}" target="_blank" rel="noopener noreferrer" class="chip"
          >OpenAPI ${p("external",11)}</a>
      </div>
      ${Dd(e.endpoints)}
      <div class="side-card-foot">
        \u76EE\u524D API Base\uFF1A<code>${r(ts())}</code>\uFF08${r(s)}\uFF09\u3002\u4E92\u52D5\u5F0F API \u6587\u4EF6\u4F4D\u65BC <a href="${r(a)}" target="_blank" rel="noopener noreferrer"><code>${r(a)}</code></a>\uFF0COpenAPI schema \u4F4D\u65BC <a href="${r(n)}" target="_blank" rel="noopener noreferrer"><code>${r(n)}</code></a>\u3002
      </div>
    </section>
  </div>`}function Jd(e){let t=e.data||{},s=Number(t.judgment_indexed_count||0),a=Number(t.judgment_count||0),n=a?(s/a*100).toFixed(1):"0.0",i=Number(t.judgment_index_remaining||0);return`<div class="status-summary">
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
          <span class="side-card-title">${p("layers",14)}\u6700\u65B0\u8CC7\u6599\u7248\u672C</span>
          ${He("operational","Parquet")}
        </div>
        ${Fd(t.last_version)}
        <div class="side-card-foot">
          \u539F\u59CB Parquet \u5408\u8A08 ${Le(t.parquet_bytes)}\uFF1BPostgreSQL \u4FDD\u5B58 metadata \u8207\u7248\u672C\u72C0\u614B\u3002
        </div>
      </section>
      <section class="card">
        <div class="side-card-head">
          <span class="side-card-title">${p("database",14)}\u8CC7\u6599\u96C6\u7D71\u8A08</span>
          <span class="badge badge-neutral badge-mono">${d(t.parquet_files)} FILES</span>
        </div>
        <div class="detail-list">
          ${Qe("\u73FE\u884C\u6CD5\u898F",`<strong>${d(t.law_count)}</strong>`)}
          ${Qe("\u73FE\u884C\u547D\u4EE4",`<strong>${d(t.order_count)}</strong>`)}
          ${Qe("\u689D\u6587\u7E3D\u6578",`<strong>${d(t.article_count)}</strong>`)}
          ${Qe("\u539F\u59CB Parquet",`<strong>${Le(t.parquet_bytes)}</strong>`)}
          ${Qe("\u5224\u6C7A\u6587\u4EF6",`<strong>${d(t.judgment_count)}</strong>`)}
          ${Qe("\u5411\u91CF\u7D22\u5F15",`<strong>${d(t.judgment_indexed_count)}</strong> / ${d(t.judgment_count)}\uFF08${d(t.judgment_vector_points)} points\uFF09`)}
          ${Qe("\u7D22\u5F15\u8986\u84CB",`<strong>${n}%</strong> \xB7 \u5269\u9918 ${d(i)} \u7B46`)}
          ${Qe("\u7D22\u5F15\u7248\u672C",`<strong>#${d(t.judgment_vector_version_id)}</strong> \xB7 ${r(t.judgment_vector_version_status||"legacy")}`)}
          ${Qe("Alias",`<code>${r(t.judgment_vector_alias||"\u2014")}</code> \u2192 <code>${r(t.judgment_vector_collection||"\u2014")}</code>`)}
          ${Qe("\u7D22\u5F15\u6A21\u578B",`<code>${r(t.judgment_vector_model||"\u2014")}</code>`)}
          ${Qe("\u6700\u8FD1\u7D22\u5F15",`<span class="mono">${Me(t.judgment_indexed_at)}</span>`)}
        </div>
      </section>
    </div>`}function Vd(e){let t=e.data||{};return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${p("history",14)}\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C</span>
      <span class="badge badge-neutral badge-mono">${d(t.run_count)} TOTAL</span>
    </div>
    ${zd(e.recent_runs)}
  </section>`}function Wd(e){let t=Number(e);return Number.isFinite(t)?t>=90?"is-danger":t>=70?"is-warn":"":""}function Pi(e,t=""){let s=Math.max(0,Math.min(100,Number(e)||0));return`<div class="resource-bar ${t}"><span style="width:${s}%"></span></div>`}function os(e,t,s,a,n){let i=Wd(n);return`<article class="resource-card">
    <div class="resource-card-head">
      <span class="resource-card-label">${p(t,14)}${r(e)}</span>
      <strong>${r(s)}</strong>
    </div>
    ${Pi(n,i)}
    <div class="resource-card-detail">${a}</div>
  </article>`}function Kd(e){let t=e.docker||{};if(!t.available)return`<section class="card data-section">
      <div class="side-card-head">
        <span class="side-card-title">${p("layers",14)}Docker</span>
        ${He("not_configured","\u672A\u9023\u7DDA")}
      </div>
      <div class="report-empty-inline">${r(t.detail||"Docker daemon \u672A\u9023\u7DDA\u3002")}</div>
    </section>`;let s=[...t.containers||[]].sort((i,o)=>{let l=i.service?0:1,u=o.service?0:1;return l-u||String(i.name).localeCompare(String(o.name))}),a=s.map(i=>`<tr>
        <td><strong>${r(i.name||"\u2014")}</strong>${i.service?`<span class="badge badge-neutral badge-mono">${r(i.service)}</span>`:""}</td>
        <td>${He(i.state==="running"?"operational":"degraded",i.state||"\u2014")}</td>
        <td class="cell-number">${i.cpu_percent===null||i.cpu_percent===void 0?"\u2014":`${d(i.cpu_percent)}%`}</td>
        <td class="cell-number">${Le(i.memory_used)}${i.memory_limit?` / ${Le(i.memory_limit)}`:""}</td>
        <td class="mono">${r(i.net_io||"\u2014")}</td>
        <td class="mono">${r(i.block_io||"\u2014")}</td>
        <td class="cell-number">${d(i.pids)}</td>
      </tr>`).join(""),n=(t.system||[]).map(i=>`<span class="resource-docker-pill">
        <strong>${r(i.type||"\u2014")}</strong>
        <span>${d(i.count)} \xB7 ${r(i.size||"\u2014")}</span>
      </span>`).join("");return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${p("layers",14)}Docker \u5BB9\u5668\u4F7F\u7528\u8CC7\u6E90</span>
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
  </section>`}function Yd(e){return`<div class="resource-section-head">
      <div>
        <div class="section-title">\u5404\u8CC7\u6599\u5EAB\u4F7F\u7528\u8CC7\u6E90</div>
        <div class="section-sub">\u5BB9\u5668 CPU\uFF0FRAM \u8207\u8CC7\u6599\u5EAB\u5167\u90E8\u5BB9\u91CF</div>
      </div>
    </div>
    <div class="resource-db-grid">${(Array.isArray(e.databases)?e.databases:[]).map(s=>{let a=s.id==="postgres",n=Array.isArray(s.tables)?s.tables:[],i=s.status==="operational"?"operational":s.status==="not_configured"?"not_configured":"degraded",o=a?`${Qe("\u8CC7\u6599\u5EAB",`<code>${r(s.database||"\u2014")}</code>`)}
           ${Qe("\u8CC7\u6599\u5EAB\u5927\u5C0F",`<strong>${Le(s.storage_bytes)}</strong>`)}
           ${Qe("Docker volume",`<strong>${Le(s.volume_bytes)}</strong>${s.volume_name?` <code>${r(s.volume_name)}</code>`:""}`)}
           ${Qe("\u9023\u7DDA\u6578",`<strong>${d(s.connections)}</strong>`)}`:`${Qe("Collection",`<code>${r(s.collection||"\u2014")}</code>`)}
           ${Qe("Docker volume",`<strong>${Le(s.volume_bytes)}</strong>${s.volume_name?` <code>${r(s.volume_name)}</code>`:""}`)}
           ${Qe("\u5411\u91CF\u9EDE\u6578",`<strong>${d(s.points_count)}</strong>`)}
           ${Qe("Collections",`<strong>${d(s.collections)}</strong>`)}
           ${Qe("Segments",`<strong>${d(s.segments_count)}</strong>`)}`;return`<article class="resource-db-card">
        <div class="resource-db-head">
          <div>
            <div class="resource-db-title">${r(s.name||"\u2014")}</div>
            <div class="resource-db-kind">${r(s.kind||"")}</div>
          </div>
          ${He(i)}
        </div>
        <div class="resource-db-metrics">
          <div><span>CPU</span><strong>${s.cpu_percent===null||s.cpu_percent===void 0?"\u2014":`${d(s.cpu_percent)}%`}</strong></div>
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
      </article>`}).join("")}</div>`}function ks(e,t,s,a){let n=Number(t)||0,i=a?n/a*100:0;return`<div class="storage-row">
    <div class="storage-row-head">
      <span>${r(e)}</span>
      <strong>${Le(n)}</strong>
    </div>
    ${Pi(i)}
    <div class="storage-row-detail">${s}</div>
  </div>`}function Xd(e){let t=e.storage||{},s=t.application||{},a=t.parquet||{},n=t.docker||{},i=t.volumes||{},o=i.postgres||{},l=i.qdrant||{},u=Number(t.judgment_total_bytes||0);return`<section class="card data-section storage-section">
    <div class="side-card-head">
      <span class="side-card-title">${p("database",14)}\u786C\u789F\u4F7F\u7528\u7D44\u6210</span>
      <span class="badge badge-neutral badge-mono">${Le(u)}</span>
    </div>
    <div class="storage-list">
      ${ks("\u524D\u7AEF",s.frontend_bytes,`<span class="mono">${r(s.frontend_path||"\u2014")}</span>`,u)}
      ${ks("\u5F8C\u7AEF",s.backend_bytes,`<span class="mono">${r(s.backend_path||"\u2014")}</span>`,u)}
      ${ks("Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5FEB\u53D6",n.layers_bytes,`Images ${Le(n.images_bytes)} \xB7 Containers ${Le(n.containers_bytes)} \xB7 Build cache ${Le(n.build_cache_bytes)}`,u)}
      ${ks("PostgreSQL volume",o.size_bytes,`<span class="mono">${r(o.name||"\u2014")}</span>`,u)}
      ${ks("Qdrant volume",l.size_bytes,`<span class="mono">${r(l.name||"\u2014")}</span>`,u)}
      ${ks("Parquet",a.total_bytes,`\u6CD5\u898F ${Le(a.law_bytes)} \xB7 \u5224\u6C7A ${Le(a.judgment_bytes)}`,u)}
    </div>
    <div class="storage-total">
      <span>Judgment \u5143\u4EF6\u5408\u8A08</span>
      <strong>${Le(u)}</strong>
    </div>
    <div class="side-card-foot">
      \u524D\u7AEF\uFF0B\u5F8C\u7AEF\u7A0B\u5F0F\u3001Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5EFA\u7F6E\u5FEB\u53D6\u3001PostgreSQL\uFF0FQdrant volume \u8207\u539F\u59CB Parquet\uFF1B\u4E0D\u542B .venv \u8207\u5176\u4ED6\u975E Judgment Docker volume\u3002
    </div>
  </section>`}function Zd(e){let t=e.host||{},s=t.cpu||{},a=t.memory||{},n=t.swap||{},i=e.storage||{},o=i.filesystem||{},l=Number(i.judgment_total_bytes||0),u=Array.isArray(e.disk)?e.disk:[],c=u[0]||{},b=Number(o.total_bytes||c.total||0),$=b?l/b*100:0,v=[s.load_1,s.load_5,s.load_15].map(_=>_??"\u2014").join(" / "),f=t.uptime_seconds===null||t.uptime_seconds===void 0?"\u2014":be(Number(t.uptime_seconds)*1e3),h=[c.label?os("HDD \u5DF2\u4F7F\u7528","database",`${d(c.percent)}%`,`${Le(c.used)} / ${Le(c.total)} \xB7 \u5269\u9918 ${Le(c.free)}<br><span class="mono">${r(c.path||"")}</span>`,c.percent):"",l?os("Judgment \u5143\u4EF6\u5408\u8A08","layers",Le(l),`\u7D04\u5360 HDD ${d($)}% \xB7 \u524D\u7AEF\uFF0F\u5F8C\u7AEF\uFF0FDocker\uFF0FDB volume\uFF0FParquet`,$):"",...u.slice(1).map(_=>os(`\u786C\u789F \xB7 ${_.label}`,"layers",`${d(_.percent)}%`,`${Le(_.used)} / ${Le(_.total)} \xB7 \u5269\u9918 ${Le(_.free)}<br><span class="mono">${r(_.path||"")}</span>`,_.percent))].filter(Boolean).join("");return`<div class="resource-section-head">
      <div>
        <div class="eyebrow">SYSTEM RESOURCE USAGE</div>
        <div class="section-sub">\u66F4\u65B0\u6642\u9593 ${Me(e.checked_at)} \xB7 ${e.status==="operational"?"\u8CC7\u6E90\u8B80\u53D6\u6B63\u5E38":"\u90E8\u5206\u8CC7\u6E90\u964D\u7D1A"}</div>
      </div>
    </div>
    <div class="resource-grid">
      ${os("CPU \u4F7F\u7528\u7387","cpu",`${d(s.percent)}%`,`${d(s.logical_cores)} \u908F\u8F2F\u6838\u5FC3 \xB7 ${d(s.physical_cores)} \u5BE6\u9AD4\u6838\u5FC3<br>Load ${r(v)}`,s.percent)}
      ${os("\u8A18\u61B6\u9AD4","server",`${d(a.percent)}%`,`${Le(a.used)} / ${Le(a.total)} \xB7 \u53EF\u7528 ${Le(a.available)}`,a.percent)}
      ${os("Swap","layers",`${d(n.percent)}%`,`${Le(n.used)} / ${Le(n.total)}`,n.percent)}
      ${os("\u7A0B\u5E8F\u8207\u958B\u6A5F","activity",`${d(t.processes)} \u500B\u7A0B\u5E8F`,`\u958B\u6A5F ${r(f)}<br>${r(t.platform||"")}`,null)}
    </div>
    <div class="resource-grid resource-disk-grid">${h||'<div class="report-empty-inline">\u627E\u4E0D\u5230\u53EF\u8B80\u53D6\u7684\u78C1\u789F\u3002</div>'}</div>
    ${Xd(e)}
    ${Kd(e)}
    ${Yd(e)}`}function Ni(){return`<div class="resource-section-head">
      <div>
        <div class="skeleton skeleton-line" style="width:160px;height:18px"></div>
        <div class="skeleton skeleton-line" style="width:260px;margin-top:8px"></div>
      </div>
    </div>
    <div class="resource-grid">
      ${Array.from({length:4}).map(()=>'<div class="skeleton" style="height:120px;border-radius:var(--radius-md)"></div>').join("")}
    </div>
    <div class="skeleton" style="height:180px;margin-top:16px;border-radius:var(--radius-md)"></div>
    <div class="skeleton" style="height:220px;margin-top:16px;border-radius:var(--radius-md)"></div>`}function eu(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SYSTEM RESOURCE USAGE</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${Re({tone:"danger",title:"\u8CC7\u6E90 API \u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-resources-retry">
          ${p("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function tu(e){return e.status==="operational"?{label:"\u5DF2\u9023\u7DDA",badge:"badge-ok"}:{label:"\u7121\u6CD5\u9023\u7DDA",badge:"badge-danger"}}function su(e,t){let s=tu(e),a=Array.isArray(e.models)?e.models:[],n=a.length?a.map(i=>{let o=String(i.name||""),l=e.chat_model===o,u=e.embedding_model===o,c=i.size?Le(i.size):"",b=i.modified_at?Me(i.modified_at):"",$=new Set((i.capabilities||[]).map(f=>String(f||"").toLowerCase())),v=[];return i.supports_chat===!0&&v.push(["Chat","badge-ok"]),$.has("embedding")&&v.push(["Embedding","badge-info"]),$.has("vision")&&v.push(["Vision","badge-neutral"]),$.has("tools")&&v.push(["Tools","badge-neutral"]),$.has("thinking")&&v.push(["Thinking","badge-neutral"]),$.has("speech")&&v.push(["Speech","badge-warn"]),i.is_reranker&&v.push(["Reranker","badge-neutral"]),v.length||v.push([i.capability_status==="untested"?"\u672A\u6E2C\u8A66":"\u7121 chat \u80FD\u529B","badge-neutral"]),`<div class="ollama-model-row">
            <div class="ollama-model-main">
              <strong>${r(o)}</strong>
              <span class="ollama-model-meta">${[c,b].filter(Boolean).map(f=>r(f)).join(" \xB7 ")||"\u2014"}</span>
              <div class="ollama-model-capabilities">${v.map(([f,h])=>`<span class="badge ${h}">${r(f)}</span>`).join("")}</div>
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
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="edit-host" data-id="${e.id}">${p("edit",13)}<span>\u7DE8\u8F2F</span></button>
        <button class="btn btn-ghost btn-sm" type="button" data-ollama-action="delete-host" data-id="${e.id}">${p("trash",13)}<span>\u522A\u9664</span></button>
      </div>
    </div>
    <div class="ollama-model-list">${n}</div>
  </article>`}function au(e,t,s,a){if(s)return`<div class="report-card">
      ${Re({tone:"danger",title:"Model Provider \u8B80\u53D6\u5931\u6557",text:r(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="refresh-hosts">${p("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;let n=e||{hosts:[],active_host_id:null},i=Array.isArray(n.hosts)?n.hosts:[],o=a?i.find(c=>Number(c.id)===Number(a)):null,l=o?o.base_url.replace(new RegExp(`:${o.port}$`),""):"http://127.0.0.1",u=o?"\u5132\u5B58\u8B8A\u66F4":"\u65B0\u589E\u4E3B\u6A5F";return`<div class="report-card ollama-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">MODEL PROVIDER</div>
        <div class="report-title">Ollama \u4E3B\u6A5F\u8207\u6A21\u578B</div>
        <div class="report-sub">\u7BA1\u7406\u53EF\u7528\u7684 Ollama \u9023\u7DDA\u3001\u76EE\u524D\u4F7F\u7528\u7684\u4E3B\u6A5F\uFF0C\u4EE5\u53CA\u4E3B\u6A5F\u4E0A\u7684\u804A\u5929\uFF0F\u5D4C\u5165\u6A21\u578B\u3002\u6BCF\u6B21\u958B\u555F\u6B64\u9801\u90FD\u6703\u91CD\u65B0\u53D6\u5F97\u4E3B\u6A5F\u8207\u6A21\u578B\u5217\u8868\uFF1Bembedding \u4E3B\u6A5F\u7684\u512A\u5148\u9806\u5E8F\u53EF\u5230\u300C\u8CC7\u6599\u8655\u7406\u300D\u7684\u57F7\u884C\u8CC7\u8A0A\u5361\u7247\u62D6\u79FB\u8ABF\u6574\u3002</div>
      </div>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="check-capabilities">${p("shield",14)}<span>\u6AA2\u67E5\u6A21\u578B\u80FD\u529B</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="refresh-hosts">${p("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span></button>
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
          <button class="btn btn-primary btn-sm" type="submit">${p("check",13)}<span>${u}</span></button>
          ${o?'<button class="btn btn-ghost btn-sm" type="button" data-ollama-action="cancel-host-edit">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
        </div>
      </form>
      ${t?'<div class="ollama-loading"><span class="spinner"></span><span>\u8B80\u53D6 Ollama \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span></div>':i.length?`<div class="ollama-host-list">${i.map(c=>su(c,a)).join("")}</div>`:ot({iconName:"server",title:"\u5C1A\u672A\u8A2D\u5B9A Ollama \u4E3B\u6A5F",text:"\u8ACB\u5728\u4E0A\u65B9\u8F38\u5165\u7DB2\u5740\u8207 Port \u65B0\u589E\uFF0C\u6216\u4F7F\u7528 .env \u7684\u9810\u8A2D\u9023\u7DDA\u3002"})}
      <p class="report-sub" style="margin-top:12px">\u8A2D\u70BA\u804A\u5929\u6216\u5D4C\u5165\u6A21\u578B\u5F8C\uFF0C\u7CFB\u7D71\u6703\u4F7F\u7528\u76EE\u524D\u4E3B\u6A5F\u7684\u5C0D\u61C9\u6A21\u578B\u57F7\u884C AI \u51FA\u984C\u8207 RAG\uFF1B\u672A\u8A2D\u5B9A\u6642\u6CBF\u7528 .env \u7684 LLM_MODEL\uFF0FEMBEDDING_MODEL\u3002</p>
    </div>
  </div>`}function nu(e,t,s){let a=e?.data||{},n=e?Mt(e.status):null,i=s?Mt(s.status):null,o={overview:n?`<span class="badge ${n.tone==="ok"?"badge-ok":n.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${r(n.label)}</span>`:"",resources:i?`<span class="badge ${i.tone==="ok"?"badge-ok":i.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${r(i.label)}</span>`:'<span class="badge badge-neutral badge-mono">\u672A\u8B80\u53D6</span>',data:`<span class="badge badge-neutral badge-mono">${d(a.version_count)}</span>`,tests:'<span class="badge badge-neutral badge-mono">TEST</span>',"local-model":'<span class="badge badge-neutral badge-mono">OLLAMA</span>',runs:`<span class="badge badge-neutral badge-mono">${d(a.run_count)}</span>`};return`<div class="status-sidebar-head">
      <div class="eyebrow">STATUS SECTIONS</div>
      <div class="status-sidebar-title">\u7CFB\u7D71\u5206\u985E</div>
    </div>
    <nav class="status-tab-list" aria-label="\u7CFB\u7D71\u72C0\u614B\u5206\u985E">
      ${Ri.map(l=>{let u=l.id===t;return`<button class="status-tab${u?" is-active":""}" type="button"
          data-status-tab="${l.id}" ${u?'aria-current="page"':""}>
          <span class="status-tab-icon">${p(l.icon,15)}</span>
          <span class="status-tab-copy">
            <strong>${r(l.label)}</strong>
            <small>${r(l.hint)}</small>
          </span>
          ${o[l.id]||""}
        </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u6AA2\u67E5\u6642\u9593</span>
      <span class="mono">${r(e?Me(e.checked_at):"\u2014")}</span>
    </div>`}function ru(e,t,s,a,n,i){if(e==="resources")return s?Zd(s):a?Ni():n?eu(n):Ni();if(e==="local-model"){let o=i||{},l=!!o.loading||!o.hosts&&!o.error;return au(o.hosts||null,l,o.error||null,o.editingId||null)}return e==="architecture"?Qd(t):e==="api"?Gd(t):e==="data"?Jd(t):e==="runs"?Vd(t):Ud(t)}function iu(){return`<div class="status-hero">
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
    </div>`}function Ei(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">STATUS CHECK</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u5FEB\u53D6\u6216\u63A8\u6E2C\u7684\u670D\u52D9\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${Re({tone:"danger",title:"\u72C0\u614B API \u8ACB\u6C42\u5931\u6557",text:r(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-retry">
          ${p("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}async function ou(e,t){let s=!1,a=null,n=null,i="overview",o=null,l=!1,u=null,c=null,b=!1,$=null,v=null,f=!1,h=!1,_=null,S=0,R="",O="";e.innerHTML=`<section class="page status-page">
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
          ${p("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
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
      <section class="status-panel" id="status-content">${iu()}</section>
    </div>
  </section>`;let I=e.querySelector("#status-nav"),Q=e.querySelector("#status-content"),oe=e.querySelector("#refresh-status"),te=e.querySelector("#auto-refresh"),je=()=>{if(S+=1,typeof _=="function")try{_()}catch{}_=null,f=!1,h=!1},De=async()=>{let ee=++S;h=!0,O="",Q.innerHTML="";try{let J=await En(Q,{setTitle:()=>{}},{embedded:!0});if(ee!==S||i!=="tests"){typeof J=="function"&&J();return}_=typeof J=="function"?J:null,f=!0}catch(J){ee===S&&i==="tests"&&(Q.innerHTML=Ei(J))}finally{ee===S&&(h=!1)}},X=()=>{if(!n)return;let ee=nu(n,i,o);if(ee!==R&&(I.innerHTML=ee,R=ee),i==="tests"){!f&&!h&&De();return}je();let J=ru(i,n,o,l,u,{hosts:c,loading:b,error:$,editingId:v});J!==O&&(Q.innerHTML=J,O=J)},P=async({quiet:ee=!1}={})=>{if(!l){l=!0,u=null,i==="resources"&&!o&&X();try{let J=await z.systemUsage();if(s)return;o=J}catch(J){if(s)return;u=J,ee||A(J.message||"\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90\u3002","danger")}finally{s||(l=!1,i==="resources"&&X())}}},k=async({quiet:ee=!1}={})=>{if(!b){b=!0,$=null,i==="local-model"&&!c&&X();try{let J=await z.ollamaHosts();if(s)return;c=J}catch(J){if(s)return;$=J,ee||A(J.message||"\u7121\u6CD5\u53D6\u5F97 Ollama \u4E3B\u6A5F\u3002","danger")}finally{s||(b=!1,i==="local-model"&&X())}}},M=async()=>{await k({quiet:!0}),await Z({quiet:!0})},Z=async({quiet:ee=!1,status:J=null}={})=>{ee||(oe.disabled=!0,qe(oe,!0,"\u6AA2\u67E5\u4E2D\u2026"));try{let le=J||await z.status();if(s)return;n=le,X(),ee||A("\u670D\u52D9\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(le){if(s)return;i!=="tests"&&(O="",Q.innerHTML=Ei(le)),ee||A(le.message||"\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002","danger")}finally{s||(oe.disabled=!1,qe(oe,!1))}},ue=async({quiet:ee=!1,status:J=null}={})=>{if(await Z({quiet:ee,status:J}),i==="resources"&&await P({quiet:ee}),i==="local-model"&&await k({quiet:ee}),!ee&&i==="tests"){let le=Q.querySelector("#tests-refresh");le&&le.click()}};I.addEventListener("click",ee=>{let J=ee.target.closest("[data-status-tab]");if(!J)return;let le=J.dataset.statusTab;Ri.some(me=>me.id===le)&&(i=le,X(),i==="resources"&&!o&&!l&&P(),i==="local-model"&&k())}),Q.addEventListener("click",ee=>{ee.target.closest("#status-retry")&&Z(),ee.target.closest("#status-resources-retry")&&P()}),Q.addEventListener("click",async ee=>{let J=ee.target.closest("[data-ollama-action]");if(!J)return;let le=J.dataset.ollamaAction,me=Number(J.dataset.id||0);if(le==="refresh-hosts"){await k();return}if(le==="edit-host"){v=me,X(),e.querySelector(".ollama-host-form")?.scrollIntoView({behavior:"smooth",block:"center"});return}if(le==="cancel-host-edit"){v=null,X();return}if(le==="delete-host"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 Ollama \u4E3B\u6A5F #${me}\uFF1F`))return;try{await z.deleteOllamaHost(me),Number(v)===me&&(v=null),A("Ollama \u4E3B\u6A5F\u5DF2\u522A\u9664\u3002","info"),await M()}catch(K){A(K.message||"\u522A\u9664\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(le==="activate-host"){try{await z.activateOllamaHost(me),A("\u5DF2\u5207\u63DB\u4F7F\u7528\u7684 Ollama \u4E3B\u6A5F\u3002","ok"),await M()}catch(K){A(K.message||"\u5207\u63DB\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(le==="deactivate-host"){try{await z.deactivateOllamaHosts(),A("\u5DF2\u505C\u7528\u6307\u5B9A\u7684 Ollama \u4E3B\u6A5F\uFF0C\u5C07\u6CBF\u7528 .env \u8A2D\u5B9A\u3002","info"),await M()}catch(K){A(K.message||"\u505C\u7528\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(le==="check-capabilities"){qe(J,!0,"\u6AA2\u67E5\u4E2D\u2026");try{await z.checkOllamaCapabilities(),A("\u5DF2\u66F4\u65B0\u6240\u6709\u4E3B\u6A5F\u7684\u6A21\u578B\u80FD\u529B\u3002","ok",4e3),await M()}catch(K){A(K.message||"\u7121\u6CD5\u6AA2\u67E5\u6A21\u578B\u80FD\u529B\u3002","danger",7e3)}finally{qe(J,!1)}return}if(le==="select-model"||le==="clear-model"){let K=String(J.dataset.model||""),we=String(J.dataset.role||"");try{le==="select-model"?(await z.selectOllamaModel(me,{model:K,role:we}),A(`\u5DF2\u8A2D\u5B9A ${we==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\uFF1A${K}`,"ok")):(await z.clearOllamaModel(me,{model:K,role:we}),A(`\u5DF2\u53D6\u6D88 ${we==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\u3002`,"info")),await M()}catch(Be){A(Be.message||"\u6A21\u578B\u8A2D\u5B9A\u5931\u6557\u3002","danger")}}}),Q.addEventListener("submit",async ee=>{let J=ee.target.closest("form[data-ollama-form='host']");if(!J)return;ee.preventDefault();let le=new FormData(J),me=Number(le.get("host_id")||0),K={name:String(le.get("name")||"").trim(),url:String(le.get("url")||"").trim(),port:Number(le.get("port")||11434)};try{me?(await z.updateOllamaHost(me,K),A("Ollama \u4E3B\u6A5F\u5DF2\u66F4\u65B0\u3002","ok")):(await z.addOllamaHost(K),A("Ollama \u4E3B\u6A5F\u5DF2\u65B0\u589E\u3002","ok")),v=null,await M()}catch(we){let Be=we.detail||we.payload?.detail,ke=Be?.errors?.join(" \xB7 ")||Be?.message||we.message||"\u5132\u5B58\u4E3B\u6A5F\u5931\u6557\u3002";A(ke,"danger",8e3)}}),oe.addEventListener("click",()=>ue());let G=()=>{a&&(a(),a=null)};return te.addEventListener("change",()=>{G(),te.checked&&(a=bt("status",(ee,J)=>{s||ue({quiet:!0,status:J?.snapshot||null})}),ue({quiet:!0}),A("\u5DF2\u555F\u7528\u5F8C\u7AEF\u63A8\u9001\u81EA\u52D5\u66F4\u65B0\uFF08\u6BCF 30 \u79D2\uFF09\u3002","info",2200))}),await Z({quiet:!0}),t&&typeof t.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"),()=>{s=!0,je(),G()}}var Ii="home",Ma={home:{page:Za,title:"Judgment RAG Console \xB7 \u6CD5\u898F\u8207\u5224\u6C7A\u6AA2\u7D22"},rag:{page:yn,title:"RAG \u63D0\u554F \xB7 Judgment RAG Console"},data:{page:un,title:"\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"},quality:{page:Nn,title:"\u8CC7\u6599\u54C1\u8CEA \xB7 Judgment RAG Console"},performance:{page:vn,title:"\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"},processing:{page:An,title:"\u8CC7\u6599\u8655\u7406 \xB7 Judgment RAG Console"},status:{page:Cn,title:"\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"},tests:{page:qa,title:"\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"}},Rn=document.getElementById("app-main"),Aa=null,La=0;function In(){let t=window.location.hash.replace(/^#\/?/,"").trim().split("/")[0]||Ii;return Object.prototype.hasOwnProperty.call(Ma,t)?t:Ii}function lu(e){document.querySelectorAll("[data-route]").forEach(t=>{let s=t.dataset.route===e;t.classList.toggle("is-active",s),s?t.setAttribute("aria-current","page"):t.removeAttribute("aria-current")})}function cu(e){return`<section class="page">
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
          <span class="notice-icon" aria-hidden="true">${p("alert",12)}</span>
          <div class="notice-body">
            <strong>\u7121\u6CD5\u5EFA\u7ACB\u9801\u9762</strong>
            <p>${r(e.message||"\u672A\u77E5\u932F\u8AA4")}</p>
          </div>
        </div>
        <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
          <button class="btn btn-secondary btn-sm" type="button" id="route-retry">
            ${p("refresh",14)}<span>\u91CD\u65B0\u8F09\u5165</span>
          </button>
        </div>
      </div>
    </div>
  </section>`}async function Pn(){let e=In(),t=++La;if(lu(e),window.location.hash!==`#/${e}`&&window.history.replaceState(null,"",`#/${e}`),typeof Aa=="function"){try{Aa()}catch{}Aa=null}document.title=Ma[e].title;let s={route:e,navigate(a){Ma[a]&&(window.location.hash=`#/${a}`)},setTitle(a){t===La&&a&&(document.title=a)}};try{let a=Ma[e].page.render(Rn,s);sr(),window.scrollTo({top:0,behavior:"auto"}),Rn.focus({preventScroll:!0});let n=await a;if(t!==La){typeof n=="function"&&n();return}Aa=typeof n=="function"?n:null}catch(a){if(t!==La)return;console.error("Failed to render route",e,a),Rn.innerHTML=cu(a);let n=document.getElementById("route-retry");n&&n.addEventListener("click",()=>Pn()),A("\u9801\u9762\u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}}function du(){document.addEventListener("keydown",e=>{if(e.key!=="/"||e.metaKey||e.ctrlKey||e.altKey)return;let t=document.activeElement;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable))return;let a=In(),n=a==="home"?"home-question":a==="rag"?"rag-question":"";if(!n)return;let i=document.getElementById(n);i&&(e.preventDefault(),i.focus())})}function uu(){let e=document.querySelector('[data-route="processing"]');if(!e)return;let t=e.querySelector(".nav-update-badge");t||(t=document.createElement("span"),t.className="nav-update-badge",t.hidden=!0,e.appendChild(t));let s=async(a=null)=>{try{let n=a||await z.updatesStatus(),i=Number(n.update_count)||0;i>0?(t.textContent=String(i),t.title=`\u6CD5\u898F\uFF0F\u547D\u4EE4\uFF0F\u5224\u6C7A\u6709 ${i} \u9805\u66F4\u65B0`,t.hidden=!1):t.hidden=!0}catch{t.hidden=!0}};s(),bt("updates",(a,n)=>s(n?.snapshot||null)),window.addEventListener("judgment:updates-changed",()=>s())}function Bi(){nr(),du(),uu(),window.addEventListener("hashchange",Pn),Pn(),Vs()&&window.setTimeout(()=>{In()==="rag"&&(window.location.hash="#/tests")},700)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Bi):Bi();})();
