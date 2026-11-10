(()=>{var tr=Object.defineProperty;var ft=(e,t)=>{for(var s in t)tr(e,s,{get:t[s],enumerable:!0})};var Is="judgment.api_base",Ps="http://127.0.0.1:9200",Oe=class extends Error{constructor(t,s=0,a=null){super(t),this.name="ApiError",this.status=s,this.detail=a}};function _a(e){return["localhost","127.0.0.1","::1","[::1]"].includes(e)}function ct(e){let t=String(e??"").trim();if(!t||t==="/")return"";t=t.replace(/\/+$/,""),!/^https?:\/\//i.test(t)&&!t.startsWith("/")&&(t=`${_a(t.split(":")[0])?"http":"https"}://${t}`);try{let s=new URL(t,window.location.href);return s.protocol!=="http:"&&s.protocol!=="https:"?"":`${s.origin}${s.pathname==="/"?"":s.pathname.replace(/\/+$/,"")}`}catch{return t}}function Bs(e){let t=ct(e);if(!t)return!0;try{let s=new URL(t);return s.protocol==="http:"||s.protocol==="https:"}catch{return!1}}function Os(){try{let e=new URLSearchParams(window.location.search);return e.has("api")?ct(e.get("api")):null}catch{return null}}function Ds(){try{let e=window.localStorage.getItem(Is);return e===null?null:ct(e)}catch{return null}}function Fs(){let e=window.JUDGMENT_CONFIG&&window.JUDGMENT_CONFIG.apiBase;return ct(e||"")}function dt(){let e=Os();if(e!==null)return e;let t=Ds();if(t!==null)return t;let s=Fs();return s||(window.location.protocol==="file:"?Ps:"")}function sr(){if(Os()!==null)return!0;let e=Ds();return e!==null?!!e:!!Fs()}function ut(){return Os()!==null?"query":Ds()!==null?"storage":Fs()?"config":window.location.protocol==="file:"?"file-default":"same-origin"}function ts(){return sr()||window.location.protocol==="file:"||!window.JUDGMENT_CONFIG?!1:!_a(window.location.hostname)}function Hs(e){let t=ct(e);try{t?window.localStorage.setItem(Is,t):window.localStorage.removeItem(Is)}catch{}return t}function bt(e=dt()){return e||"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"}function Ve(e,t=dt()){return t?`${t}${e.startsWith("/")?e:`/${e}`}`:e}function zs(e){return`\u7121\u6CD5\u9023\u7DDA\u5230\u4F3A\u670D\u5668${e?`\uFF08${e}\uFF09`:""}\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u662F\u5426\u555F\u52D5\uFF0C\u6216\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u8A2D\u5B9A\u5F8C\u7AEF\u4F4D\u5740\u3002`}async function ee(e,t={}){let s=dt(),a=new AbortController,r=t.timeout===void 0?3e4:t.timeout,i=r>0?window.setTimeout(()=>a.abort(),r):null,o=Date.now(),l=performance.now(),m=t.requestId||ka(),b={Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},"X-Judgment-Request-Id":m,"X-Judgment-Client-Started-At":String(o),...t.headers||{}},y;try{y=await fetch(Ve(e,s),{...t,headers:b,signal:a.signal})}catch(k){throw k.name==="AbortError"?new Oe("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new Oe(zs(s),0,k)}finally{i&&window.clearTimeout(i)}let v=null;if((y.headers.get("content-type")||"").includes("application/json"))try{v=await y.json()}catch{v=null}else try{v=await y.text()}catch{v=null}let _=performance.now(),g=y.headers.get("X-Judgment-Request-Id")||m;if(t.trackClient!==!1&&g){let k=Math.round(performance.now()-l);window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{Sa({request_id:g,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:k,render_ms:Math.max(0,Math.round(performance.now()-_)),status:y.ok?"success":"failed"})})})}if(!y.ok){let k=v&&typeof v=="object"?v.detail||v.message:v,F=typeof k=="string"&&k?k:`\u4F3A\u670D\u5668\u56DE\u61C9 ${y.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new Oe(F,y.status,k)}return v}function ka(){try{if(window.crypto&&typeof window.crypto.randomUUID=="function")return window.crypto.randomUUID().replace(/-/g,"").slice(0,32)}catch{}return`req${Date.now().toString(36)}${Math.random().toString(36).slice(2,10)}`}function Sa(e){try{fetch(Ve("/api/performance/client",dt()),{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e),keepalive:!0}).catch(()=>{})}catch{}}async function qa(e){let t=ct(e);if(!Bs(t))throw new Oe("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002");let s=performance.now(),a=new AbortController,r=window.setTimeout(()=>a.abort(),1e4);try{let i=await fetch(Ve("/api/health",t),{headers:{Accept:"application/json"},signal:a.signal});if(!i.ok)throw new Oe(`API \u56DE\u61C9 ${i.status}\u3002`,i.status);let o=await i.json();return{base:t,version:o.version||"\u2014",duration_ms:Math.round(performance.now()-s)}}catch(i){throw i instanceof Oe?i:i.name==="AbortError"?new Oe("\u9023\u7DDA\u6E2C\u8A66\u903E\u6642\uFF0C\u8ACB\u78BA\u8A8D API \u4F4D\u5740\u8207\u7DB2\u8DEF\u3002",0,i):new Oe(zs(t),0,i)}finally{window.clearTimeout(r)}}var U={health(){return ee("/api/health")},status(){return ee("/api/status",{trackClient:!1})},ollamaHosts(){return ee("/api/ollama/hosts",{timeout:3e4,trackClient:!1})},addOllamaHost(e){return ee("/api/ollama/hosts",{method:"POST",body:JSON.stringify(e),timeout:3e4,trackClient:!1})},updateOllamaHost(e,t){return ee(`/api/ollama/hosts/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},deleteOllamaHost(e){return ee(`/api/ollama/hosts/${encodeURIComponent(e)}`,{method:"DELETE",timeout:3e4,trackClient:!1})},activateOllamaHost(e){return ee(`/api/ollama/hosts/${encodeURIComponent(e)}/activate`,{method:"POST",timeout:3e4,trackClient:!1})},deactivateOllamaHosts(){return ee("/api/ollama/hosts/deactivate",{method:"POST",timeout:3e4,trackClient:!1})},selectOllamaModel(e,t){return ee(`/api/ollama/hosts/${encodeURIComponent(e)}/models/select`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},clearOllamaModel(e,t){return ee(`/api/ollama/hosts/${encodeURIComponent(e)}/models/clear`,{method:"POST",body:JSON.stringify(t),timeout:3e4,trackClient:!1})},systemUsage(){return ee("/api/system-usage",{trackClient:!1})},indexVersions(){return ee("/api/index-versions",{trackClient:!1})},indexVersion(e){return ee(`/api/index-versions/${encodeURIComponent(e)}`,{trackClient:!1})},validateIndexVersion(e){return ee(`/api/index-versions/${encodeURIComponent(e)}/validate`,{method:"POST",trackClient:!1})},activateIndexVersion(e){return ee(`/api/index-versions/${encodeURIComponent(e)}/activate`,{method:"POST",trackClient:!1})},rollbackIndexVersion(){return ee("/api/index-versions/rollback",{method:"POST",trackClient:!1})},reconcileIndexAlias(e=!1){let t=new URLSearchParams({repair:e?"true":"false"});return ee(`/api/index-alias/reconcile?${t.toString()}`,{trackClient:!1})},catalog(){return ee("/api/catalog")},query({database:e,filters:t,page:s=1,pageSize:a=25}){return ee("/api/query",{method:"POST",body:JSON.stringify({database:e,filters:t,page:s,page_size:a})})},dataSuggest({kind:e,query:t="",limit:s=12}){let a=new URLSearchParams({kind:e,query:t,limit:String(s)});return ee(`/api/data/suggest?${a.toString()}`,{timeout:45e3,trackClient:!1})},schemaSuggest({database:e,table:t,column:s,query:a,limit:r=1e3}){let i=new URLSearchParams({database:e,table:t,column:s,q:a||"",limit:String(r)});return ee(`/api/schema/suggest?${i.toString()}`,{timeout:3e4})},lawDetail(e,t="",s="",a=""){let r=new URLSearchParams({law_key:e});return t&&r.set("source_type",t),s&&r.set("version_id",String(s)),a&&r.set("article_no",String(a)),ee(`/api/law?${r.toString()}`,{timeout:45e3})},judgmentDetail(e,t=""){let s=new URLSearchParams({jid:e});return t&&s.set("source",t),ee(`/api/judgment?${s.toString()}`,{timeout:45e3})},testMode(){return ee("/api/test-mode",{trackClient:!1})},llmModels(){return ee("/api/llm/models",{timeout:6e4,trackClient:!1})},testLlmModels(){return ee("/api/llm/models/test",{method:"POST",timeout:12e4,trackClient:!1})},setTestMode(e){return ee("/api/test-mode",{method:"POST",body:JSON.stringify({enabled:!!e}),trackClient:!1})},testRuns(e=20){let t=new URLSearchParams({limit:String(e)});return ee(`/api/test-runs?${t.toString()}`,{trackClient:!1})},testRunCurrent(){return ee("/api/test-runs/current",{trackClient:!1})},testRun(e){return ee(`/api/test-runs/${encodeURIComponent(e)}`,{trackClient:!1})},performanceOptions(){return ee("/api/performance/options",{trackClient:!1})},performance(e={},t=1,s=25){let a=new URLSearchParams;for(let[r,i]of Object.entries(e))i==null||i===""||a.set(r,String(i));return a.set("page",String(t)),a.set("page_size",String(s)),ee(`/api/performance?${a.toString()}`,{timeout:45e3,trackClient:!1})},quality(){return ee("/api/quality",{timeout:18e4,trackClient:!1})},processing(){return ee("/api/processing",{timeout:45e3,trackClient:!1})},judgmentDownloadStatus(){return ee("/api/judgment-download/status",{timeout:3e4,trackClient:!1})},questionBankStats(){return ee("/api/question-bank/stats",{trackClient:!1})},questionBankItems(e={},t=50,s=0){let a=new URLSearchParams;for(let[r,i]of Object.entries(e))if(!(i==null||i==="")){if(Array.isArray(i)){for(let o of i)o==null||o===""||a.append(r,String(o));continue}a.set(r,String(i))}return a.set("limit",String(t)),a.set("offset",String(s)),ee(`/api/question-bank/items?${a.toString()}`,{timeout:45e3,trackClient:!1})},questionBankTags(e="",t=12){let s=new URLSearchParams({query:e,limit:String(t)});return ee(`/api/question-bank/tags?${s.toString()}`,{timeout:45e3,trackClient:!1})},questionBankItem(e){return ee(`/api/question-bank/items/${encodeURIComponent(e)}`,{timeout:45e3,trackClient:!1})},createQuestionBankItem(e){return ee("/api/question-bank/items",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},createQuestionBankItemWithAI(e){return ee("/api/question-bank/ai-items",{method:"POST",body:JSON.stringify(e),timeout:42e4,trackClient:!1})},updateQuestionBankItem(e,t){return ee(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteQuestionBankItem(e){return ee(`/api/question-bank/items/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},restoreQuestionBankItem(e){return ee(`/api/question-bank/items/${encodeURIComponent(e)}/restore`,{method:"POST",timeout:45e3,trackClient:!1})},submitQuestionBankItemForReview(e){return ee(`/api/question-bank/items/${encodeURIComponent(e)}/submit`,{method:"POST",timeout:45e3,trackClient:!1})},reviewQuestionBankItem(e,t){return ee(`/api/question-bank/items/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},importQuestionBank(e){return ee("/api/question-bank/import",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},exportQuestionBank({status:e="accepted"}={}){let t=new URLSearchParams({status:e});return ee(`/api/question-bank/export?${t.toString()}`,{timeout:45e3,trackClient:!1})},revalidateQuestionBank(){return ee("/api/question-bank/revalidate",{method:"POST",body:JSON.stringify({}),timeout:12e4,trackClient:!1})},benchmarkReadyQuestions(e=200){return ee(`/api/question-bank/benchmark-ready?limit=${e}`,{timeout:45e3,trackClient:!1})},benchmarkSuites(){return ee("/api/benchmark/suites",{timeout:45e3,trackClient:!1})},benchmarkSuiteLatestAnswers(e){return ee(`/api/benchmark/suites/${encodeURIComponent(e)}/latest-answers`,{timeout:45e3,trackClient:!1})},removeBenchmarkSuiteItem(e,t){return ee(`/api/benchmark/suites/${encodeURIComponent(e)}/items/${encodeURIComponent(t)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},createBenchmarkSuite(e){return ee("/api/benchmark/suites",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},updateBenchmarkSuite(e,t){return ee(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"PATCH",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},deleteBenchmarkSuite(e){return ee(`/api/benchmark/suites/${encodeURIComponent(e)}`,{method:"DELETE",timeout:45e3,trackClient:!1})},benchmarkRuns(e=20){return ee(`/api/benchmark/runs?limit=${e}`,{timeout:45e3,trackClient:!1})},startBenchmarkRun(e){return ee("/api/benchmark/runs",{method:"POST",body:JSON.stringify(e),timeout:45e3,trackClient:!1})},benchmarkRun(e,t=!0){return ee(`/api/benchmark/runs/${encodeURIComponent(e)}?include_cases=${t}`,{timeout:45e3,trackClient:!1})},stopBenchmarkRun(e){return ee(`/api/benchmark/runs/${encodeURIComponent(e)}/stop`,{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},reviewBenchmarkResult(e,t){return ee(`/api/benchmark/results/${encodeURIComponent(e)}/review`,{method:"POST",body:JSON.stringify(t),timeout:45e3,trackClient:!1})},benchmarkModels(){return ee("/api/benchmark/models",{timeout:45e3,trackClient:!1})},benchmarkFingerprintHistory(e,t=50){return ee(`/api/benchmark/fingerprints/${encodeURIComponent(e)}?limit=${t}`,{timeout:45e3,trackClient:!1})},processingPlan(){return ee("/api/processing/plan",{timeout:45e3,trackClient:!1})},startProcessingWorkflow(e){return ee(`/api/processing/workflows/${encodeURIComponent(e)}/run`,{method:"POST",body:JSON.stringify({})})},startProcessingUpdate(e=!1){return ee("/api/processing/update",{method:"POST",body:JSON.stringify({index:!!e}),timeout:45e3,trackClient:!1})},stopProcessingUpdate(){return ee("/api/processing/stop",{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},rag(e,t={}){return ee("/api/rag/query",{method:"POST",body:JSON.stringify({question:e}),timeout:t.testMode?0:3e5})},async ragStream(e,{testMode:t=!1,onStep:s=null,onPartial:a=null,onToken:r=null,onTokenReset:i=null}={}){let o=dt(),l=new AbortController,m=t?0:3e5,b=m>0?window.setTimeout(()=>l.abort(),m):null,y=Date.now(),v=performance.now(),w=ka(),_={Accept:"text/event-stream","Content-Type":"application/json","X-Judgment-Request-Id":w,"X-Judgment-Client-Started-At":String(y)},g;try{g=await fetch(Ve("/api/rag/query/stream",o),{method:"POST",headers:_,body:JSON.stringify({question:e}),signal:l.signal})}catch(ae){throw ae.name==="AbortError"?new Oe("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new Oe(zs(o),0,ae)}finally{b&&window.clearTimeout(b)}if(!g.ok){let ae=null;try{ae=await g.json()}catch{ae=null}let oe=ae&&typeof ae=="object"&&ae.detail?String(ae.detail):`\u4F3A\u670D\u5668\u56DE\u61C9 ${g.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new Oe(oe,g.status,ae)}if(!g.body)throw new Oe("\u4F3A\u670D\u5668\u6C92\u6709\u56DE\u50B3\u53EF\u8B80\u53D6\u7684\u6D41\u7A0B\u4E32\u6D41\u3002",0,null);let k=g.body.getReader(),F=new TextDecoder,Y="",K=null,X=null;try{for(;;){let{value:ae,done:oe}=await k.read();if(oe)break;Y+=F.decode(ae,{stream:!0});let le=Y.indexOf(`

`);for(;le>=0;){let $e=Y.slice(0,le).replace(/\r/g,"");Y=Y.slice(le+2);let ie="message",j=[];for(let $ of $e.split(`
`))$.startsWith("event:")?ie=$.slice(6).trim():$.startsWith("data:")&&j.push($.slice(5).trimStart());if(j.length){let $=null;try{$=JSON.parse(j.join(`
`))}catch{$=null}if($)if(ie==="step"&&typeof s=="function")try{s($)}catch{}else if(ie==="partial"){if(typeof a=="function")try{a($)}catch{}}else if(ie==="token"){if(typeof r=="function")try{r(String($.text||""))}catch{}}else if(ie==="token_reset"){if(typeof i=="function")try{i()}catch{}}else ie==="result"?K=$:ie==="error"&&(X=new Oe($.message||$.detail||"RAG \u6D41\u7A0B\u5931\u6557\u3002",0,$))}le=Y.indexOf(`

`)}}}finally{try{await k.cancel()}catch{}b&&window.clearTimeout(b)}if(X)throw X;if(!K)throw new Oe("\u6D41\u7A0B\u4E32\u6D41\u7D50\u675F\uFF0C\u4F46\u6C92\u6709\u6536\u5230\u6700\u7D42\u56DE\u7B54\u3002",0,null);let W=Math.round(performance.now()-v);return Sa({request_id:w,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:W,render_ms:0,status:"success"}),K}};var ar={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},nr={operational:{label:"\u6B63\u5E38",tone:"ok"},success:{label:"\u6210\u529F",tone:"ok"},ok:{label:"\u6B63\u5E38",tone:"ok"},healthy:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},warning:{label:"\u6CE8\u610F",tone:"warn"},empty:{label:"\u7121\u8CC7\u6599",tone:"warn"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},running:{label:"\u57F7\u884C\u4E2D",tone:"info"},pending:{label:"\u7B49\u5F85",tone:"idle"},skipped:{label:"\u7565\u904E",tone:"idle"},partial:{label:"\u90E8\u5206\u6210\u529F",tone:"warn"},preview:{label:"\u9810\u89BD\u6A21\u5F0F",tone:"info"},retrieval_only:{label:"\u50C5\u6AA2\u7D22\u7D50\u679C",tone:"warn"},not_indexed:{label:"\u5C1A\u672A\u7D22\u5F15",tone:"warn"},missing_query:{label:"\u7B49\u5F85\u67E5\u8A62",tone:"idle"},client_side:{label:"\u700F\u89BD\u5668\u7AEF",tone:"info"},not_configured:{label:"\u672A\u8A2D\u5B9A",tone:"idle"},unavailable:{label:"\u96E2\u7DDA",tone:"danger"},failed:{label:"\u5931\u6557",tone:"danger"},error:{label:"\u932F\u8AA4",tone:"danger"}},rr={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},ir={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},xa={search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',send:'<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',refresh:'<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 4v5.5H15"/>',copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',check:'<path d="m5 12 4.2 4.2L19 6.5"/>',plus:'<path d="M12 5v14M5 12h14"/>',edit:'<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m13.5 7.5 3 3"/>',trash:'<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v5M14 11v5"/>',upload:'<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>',x:'<path d="m6 6 12 12M18 6 6 18"/>',external:'<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/>',message:'<path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H6l-3 2 1.3-4.2A8.5 8.5 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',history:'<path d="M3.2 12a8.8 8.8 0 1 0 2.8-6.3L3.2 8.5"/><path d="M3 3.5v5h5"/><path d="M12 7.5V12l3 1.8"/>',database:'<ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/><path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/>',layers:'<path d="m12 3 9 4.8-9 4.8-9-4.8L12 3Z"/><path d="m3 12.2 9 4.8 9-4.8"/><path d="m3 16.7 9 4.8 9-4.8"/>',cube:'<path d="m12 2.8 8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4L12 2.8Z"/><path d="m3.8 7.4 8.2 4.6 8.2-4.6"/><path d="M12 12v9.2"/>',browser:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6.5 6.5h.01"/>',download:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',chevronLeft:'<path d="m14.5 5-7 7 7 7"/>',chevronRight:'<path d="m9.5 5 7 7-7 7"/>',chevronDown:'<path d="m5 9 7 7 7-7"/>',arrowRight:'<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',alert:'<path d="M12 3 2.5 20.5h19L12 3Z"/><path d="M12 9v4.5"/><path d="M12 17.5h.01"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',sparkles:'<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"/>',table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M9 9.5V20M15 9.5V20"/>',sliders:'<path d="M4 7h8M16 7h4M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',server:'<rect x="3" y="4" width="18" height="6" rx="1.6"/><rect x="3" y="14" width="18" height="6" rx="1.6"/><path d="M7 7h.01M7 17h.01"/>',brain:'<path d="M9.7 4.2a2.8 2.8 0 0 0-3 2.8 2.8 2.8 0 0 0-1.1 5.2A2.9 2.9 0 0 0 7.8 18a2.9 2.9 0 0 0 3.9 2V4.2a2.8 2.8 0 0 0-2 0Z"/><path d="M14.3 4.2a2.8 2.8 0 0 1 3 2.8 2.8 2.8 0 0 1 1.1 5.2A2.9 2.9 0 0 1 16.2 18a2.9 2.9 0 0 1-3.9 2"/>',cloud:'<path d="M7 18.5h10.5a3.5 3.5 0 0 0 .4-7 5.5 5.5 0 0 0-10.6-1.3A4.2 4.2 0 0 0 7 18.5Z"/>',code:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',play:'<path d="M7 4.5v15l13-7.5-13-7.5Z"/>',file:'<path d="M6 2.8h8l4.5 4.5v13.9H6V2.8Z"/><path d="M14 2.8V7.5h5"/>',activity:'<path d="M3 12h4l2.2-5 4.1 10 2.2-5H21"/>',shield:'<path d="M12 2.8 20 6v6c0 4.7-3.2 8-8 9.2C7.2 20 4 16.7 4 12V6l8-3.2Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',terminal:'<path d="m5 7 5 5-5 5"/><path d="M12 17h7"/>',filter:'<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',link:'<path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10.2 5.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-1.4 1.4a5 5 0 0 0 7.1 7.1l1.2-1.2"/>',grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',pin:'<path d="M9 3.5h6l-1.1 5 2.6 2.6v2.4H7.5v-2.4L10.1 8.5 9 3.5Z"/><path d="M12 13.5v7"/>',more:'<circle cx="4.2" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="19.8" cy="12" r="2.6" fill="currentColor" stroke="none"/>',folder:'<path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h3.7l2 2H18a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5v-9Z"/>',cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9.5 9.5h5v5h-5z"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>'};function n(e){return String(e??"").replace(/[&<>"']/g,t=>ar[t])}function u(e,t=16,s=""){let a=xa[e]||xa.info;return`<svg${s?` class="${n(s)}"`:""} width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a}</svg>`}function c(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?new Intl.NumberFormat("zh-TW").format(s):t}function ue(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=["B","KB","MB","GB","TB"],a=0;for(;t>=1024&&a<s.length-1;)t/=1024,a+=1;return a===0?`${t.toFixed(0)} B`:`${t.toFixed(1)} ${s[a]}`}function Us(e){if(e instanceof Date)return e;if(typeof e=="number"){let r=new Date(e);return Number.isNaN(r.getTime())?null:r}let t=String(e??"").trim();if(!t)return null;if(/^\d{8}$/.test(t))return new Date(Number(t.slice(0,4)),Number(t.slice(4,6))-1,Number(t.slice(6,8)));let s=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(t),a=new Date(s?`${t}Z`:t);return Number.isNaN(a.getTime())?null:a}function Ze(e){let t=Us(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit"}).format(t):e?n(e):"\u2014"}function ve(e){let t=Us(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1}).format(t):e?n(e):"\u2014"}function Lt(e){let t=Us(e);if(!t)return"";let s=Date.now()-t.getTime();return s<45e3?"\u525B\u525B":s<36e5?`${Math.max(1,Math.round(s/6e4))} \u5206\u9418\u524D`:s<864e5?`${Math.round(s/36e5)} \u5C0F\u6642\u524D`:s<6048e5?`${Math.round(s/864e5)} \u5929\u524D`:Ze(t)}function ne(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;if(t<6e4)return`${(t/1e3).toFixed(1)} s`;let s=Math.floor(t/6e4),a=Math.round(t%6e4/1e3);return`${s}m ${a}s`}function et(e){return nr[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function ke(e,t){let s=et(e);return`<span class="badge ${rr[s.tone]}"><span class="status-dot ${ir[s.tone]}"></span>${n(t||s.label)}</span>`}function or(e){return e==="law"?'<span class="badge badge-info">\u6CD5\u898F</span>':e==="order"?'<span class="badge badge-neutral">\u547D\u4EE4</span>':e?`<span class="badge badge-neutral">${n(e)}</span>`:'<span class="cell-empty">\u2014</span>'}function ss(e,t){let s=String(e??"");return s.length>t?`${s.slice(0,t)}\u2026`:s}function as(e,t="text"){if(e==null||e==="")return'<span class="cell-empty">\u2014</span>';switch(t){case"boolean":return e?'<span class="badge badge-ok">\u662F</span>':'<span class="badge badge-neutral">\u5426</span>';case"status":return ke(String(e));case"source":return or(String(e));case"number":return`<span class="mono">${c(e)}</span>`;case"duration":return`<span class="mono">${ne(e)}</span>`;case"datetime":return`<span class="mono">${ve(e)}</span>`;case"date":return`<span class="mono">${Ze(e)}</span>`;case"url":{let s=String(e),a=ss(s.replace(/^https?:\/\//,""),46);return`<span class="cell-url"><a href="${n(s)}" target="_blank" rel="noopener noreferrer" title="${n(s)}">${u("external",10)}${n(a)}</a></span>`}case"mono":{let s=String(e);return`<span class="cell-mono cell-truncate" title="${n(s)}">${n(ss(s,54))}</span>`}case"longtext":{let s=String(e);return`<span class="cell-truncate" title="${n(s)}">${n(ss(s,100))}</span>`}default:{let s=String(e);return`<span class="cell-truncate" title="${n(s)}">${n(ss(s,90))}</span>`}}}function pe({tone:e="info",title:t,text:s,iconName:a="info"}){let r=e==="ok"?"check":e==="danger"||e==="warn"?"alert":"i";return`<div class="notice notice-${e}" role="status">
    <span class="notice-icon" aria-hidden="true">${r==="i"?"i":u(r,12)}</span>
    <div class="notice-body">
      ${t?`<strong>${n(t)}</strong>`:""}
      ${s?`<p>${s}</p>`:""}
    </div>
  </div>`}function Fe({iconName:e="search",title:t,text:s="",actions:a="",className:r=""}){return`<div class="empty-state ${r}">
    <span class="empty-icon">${u(e,24)}</span>
    <h3 class="empty-title">${n(t)}</h3>
    ${s?`<p class="empty-text">${s}</p>`:""}
    ${a?`<div class="empty-actions">${a}</div>`:""}
  </div>`}function ge(e,t,s="\u8655\u7406\u4E2D\u2026"){e&&(t?(e.dataset.idleHtml||(e.dataset.idleHtml=e.innerHTML),e.disabled=!0,e.classList.add("is-loading"),e.innerHTML=`<span class="spinner" aria-hidden="true"></span><span>${n(s)}</span>`):(e.disabled=!1,e.classList.remove("is-loading"),e.dataset.idleHtml&&(e.innerHTML=e.dataset.idleHtml,delete e.dataset.idleHtml)))}function M(e,t="info",s=4200){let a=document.getElementById("toast-region");if(!a)return null;let r={info:"i",ok:"\u2713",warn:"!",danger:"\xD7"},i=document.createElement("div");i.className=`toast toast-${t}`,i.setAttribute("role",t==="danger"?"alert":"status"),i.innerHTML=`<span class="toast-mark" aria-hidden="true">${r[t]||"i"}</span>
    <div class="toast-body">${n(e)}</div>
    <button class="toast-close" type="button" aria-label="\u95DC\u9589\u901A\u77E5">\xD7</button>`;let o=()=>{i.isConnected&&(i.classList.add("is-leaving"),window.setTimeout(()=>i.remove(),190))};return i.querySelector(".toast-close").addEventListener("click",o),a.appendChild(i),s>0&&window.setTimeout(o,s),i}async function Mt(e){try{return await navigator.clipboard.writeText(e),!0}catch{let s=document.createElement("textarea");s.value=e,s.setAttribute("readonly",""),s.style.position="fixed",s.style.opacity="0",document.body.appendChild(s),s.select();let a=!1;try{a=document.execCommand("copy")}catch{a=!1}return s.remove(),a}}function tt(e,t,s="text/plain;charset=utf-8"){let a=new Blob([t],{type:s}),r=URL.createObjectURL(a),i=document.createElement("a");i.href=r,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(r),1e3)}var La="judgment.theme",Js="nvidia",Ma=[{id:"vercel",name:"Vercel",description:"\u9ED1\u767D\u7CBE\u6E96 \xB7 Geist \xB7 \u5E7E\u4F55\u7559\u767D",swatches:["#171717","#0070f3","#fafafa"],metaColor:"#ffffff"},{id:"apple",name:"Apple",description:"SF Pro \xB7 \u5927\u5713\u89D2 \xB7 \u6C89\u6D78\u7559\u767D",swatches:["#1d1d1f","#0071e3","#f5f5f7"],metaColor:"#fbfbfd"},{id:"meta",name:"Meta",description:"Optimistic \xB7 \u660E\u4EAE\u85CD \xB7 \u81A0\u56CA\u5143\u4EF6",swatches:["#0064e0","#0091ff","#f1f4f7"],metaColor:"#ffffff"},{id:"nvidia",name:"NVIDIA",description:"GPU \u7DA0 \xB7 \u9ED1\u5E95 \xB7 \u92B3\u5229\u76F4\u89D2",swatches:["#76b900","#000000","#f7f7f7"],metaColor:"#000000"},{id:"ibm",name:"IBM",description:"Carbon \xB7 Plex Sans \xB7 \u4F01\u696D\u85CD",swatches:["#0f62fe","#161616","#f4f4f4"],metaColor:"#161616"},{id:"stripe",name:"Stripe",description:"\u7D2B\u975B\u6F38\u5C64 \xB7 \u7CBE\u5BC6\u91D1\u878D\u611F",swatches:["#635bff","#ea2261","#f6f9fc"],metaColor:"#ffffff"},{id:"linear",name:"Linear",description:"\u6DF1\u7A7A\u9ED1 \xB7 \u975B\u7D2B \xB7 \u6975\u7C21\u7DDA\u689D",swatches:["#5e6ad2","#010102","#e8e8ec"],metaColor:"#010102"},{id:"figma",name:"Figma",description:"\u591A\u5F69\u8272\u584A \xB7 \u5354\u4F5C\u611F \xB7 \u85CD\u8272\u7126\u9EDE",swatches:["#f24e1e","#a259ff","#0acf83"],metaColor:"#ffffff"},{id:"notion",name:"Notion",description:"\u6696\u767D\u7D19\u5F35 \xB7 \u896F\u7DDA\u6A19\u984C \xB7 \u77E5\u8B58\u5EAB",swatches:["#191918","#0075de","#f7f6f3"],metaColor:"#ffffff"},{id:"openai",name:"OpenAI",description:"\u6696\u7070\u756B\u5E03 \xB7 \u9ED1\u8272\u884C\u52D5 \xB7 \u7DA0\u8272\u8A0A\u865F",swatches:["#10a37f","#0d0d0d","#f9f9f7"],metaColor:"#f9f9f7"}],Qs=new Map(Ma.map(e=>[e.id,e]));function lr(e){return Qs.has(e)}function cr(e){return Qs.get(e)||Qs.get(Js)}function dr(){try{let e=window.localStorage.getItem(La);return lr(e)?e:Js}catch{return Js}}function Aa(e,{persist:t=!0}={}){let s=cr(e);document.documentElement.dataset.theme=s.id;let a=document.getElementById("theme-color-meta");if(a&&a.setAttribute("content",s.metaColor),document.querySelectorAll(".theme-option").forEach(r=>{let i=r.dataset.themeId===s.id;r.classList.toggle("is-active",i),r.setAttribute("aria-checked",i?"true":"false")}),t)try{window.localStorage.setItem(La,s.id)}catch{}return window.dispatchEvent(new CustomEvent("judgment:theme",{detail:{theme:s.id}})),s}function ur(e){let t=Ma.map((s,a)=>{let r=s.swatches.map(i=>`<i style="--swatch:${n(i)}"></i>`).join("");return`<button class="theme-option" type="button" role="menuitemradio"
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
    </div>${t}`}function ja(){let e=document.getElementById("style-picker"),t=document.getElementById("style-trigger"),s=document.getElementById("style-menu");if(!e||!t||!s)return;ur(s),Aa(dr(),{persist:!1});let a=()=>Array.from(s.querySelectorAll(".theme-option")),r=()=>{s.hidden=!1,t.setAttribute("aria-expanded","true");let o=s.querySelector(".theme-option.is-active")||a()[0];o&&o.focus()},i=({restoreFocus:o=!1}={})=>{s.hidden||(s.hidden=!0,t.setAttribute("aria-expanded","false"),o&&t.focus())};t.addEventListener("click",()=>{s.hidden?r():i({restoreFocus:!0})}),t.addEventListener("keydown",o=>{(o.key==="ArrowDown"||o.key==="ArrowUp")&&(o.preventDefault(),r())}),s.addEventListener("click",o=>{let l=o.target.closest(".theme-option");l&&(Aa(l.dataset.themeId),i({restoreFocus:!0}))}),s.addEventListener("keydown",o=>{let l=a(),m=l.indexOf(document.activeElement);if(o.key==="Escape"){o.preventDefault(),i({restoreFocus:!0});return}if(o.key==="ArrowDown"||o.key==="ArrowUp"){o.preventDefault();let b=o.key==="ArrowDown"?1:-1,y=l[(m+b+l.length)%l.length];y&&y.focus();return}if(o.key==="Home"||o.key==="End"){o.preventDefault();let b=o.key==="Home"?l[0]:l[l.length-1];b&&b.focus()}}),document.addEventListener("pointerdown",o=>{e.contains(o.target)||i()}),document.addEventListener("keydown",o=>{o.key==="Escape"&&i()})}var la={};ft(la,{render:()=>Fi});var pr="judgment-console";var Qe="query_history",pt="settings";var He={history:[],settings:new Map,nextId:1},ns=null,ze=!("indexedDB"in window);function vt(e){return new Promise((t,s)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>s(e.error)})}function st(e){return new Promise((t,s)=>{e.oncomplete=()=>t(),e.onerror=()=>s(e.error),e.onabort=()=>s(e.error||new Error("transaction aborted"))})}function rt(){return ns||(ns=new Promise((e,t)=>{if(!("indexedDB"in window)){ze=!0,t(new Error("IndexedDB is unavailable"));return}let s;try{s=window.indexedDB.open(pr,1)}catch(a){ze=!0,t(a);return}s.onupgradeneeded=()=>{let a=s.result;if(!a.objectStoreNames.contains(Qe)){let r=a.createObjectStore(Qe,{keyPath:"id",autoIncrement:!0});r.createIndex("created_at","created_at"),r.createIndex("kind","kind")}a.objectStoreNames.contains(pt)||a.createObjectStore(pt,{keyPath:"key"})},s.onsuccess=()=>{let a=s.result;a.onversionchange=()=>a.close(),e(a)},s.onerror=()=>{ze=!0,t(s.error||new Error("Unable to open IndexedDB"))},s.onblocked=()=>{ze=!0,t(new Error("IndexedDB upgrade blocked by another tab"))}}),ns)}function Ta(){return"indexedDB"in window}function Ea(){return ze}function rs(){return ze?"memory":"indexeddb"}function mr(e){let t=e.created_at||new Date().toISOString();return{kind:e.kind||"query",title:String(e.title||""),detail:String(e.detail||""),payload:e.payload||{},turns:Array.isArray(e.turns)?e.turns:[],pinned:!!e.pinned,project_id:String(e.project_id||""),created_at:t,updated_at:e.updated_at||t}}async function gr(){try{let t=(await rt()).transaction(Qe,"readwrite"),s=t.objectStore(Qe),a=await vt(s.count());if(a>120){let r=a-120,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let m=i.result;if(!m||r<=0){o();return}m.delete(),r-=1,m.continue()},i.onerror=()=>l(i.error)})}await st(t)}catch{ze=!0}}async function Dt(e){let t=mr(e);try{let a=(await rt()).transaction(Qe,"readwrite"),r=a.objectStore(Qe),i=await vt(r.add(t));return await st(a),await gr(),i}catch{ze=!0;let a=He.nextId++;return He.history.push({id:a,...t}),He.history.length>120&&He.history.shift(),a}}async function Ft(e,t={}){let s=Number(e);if(!Number.isFinite(s))return null;try{let r=(await rt()).transaction(Qe,"readwrite"),i=r.objectStore(Qe),o=await vt(i.get(s));if(!o)return await st(r),null;let l={...o,...t,id:s};return await vt(i.put(l)),await st(r),l}catch{ze=!0;let r=He.history.findIndex(i=>Number(i.id)===s);return r===-1?null:(He.history[r]={...He.history[r],...t,id:s},He.history[r])}}async function Na(e){let t=Number(e);if(!Number.isFinite(t))return!1;try{let a=(await rt()).transaction(Qe,"readwrite");return a.objectStore(Qe).delete(t),await st(a),!0}catch{ze=!0;let a=He.history.findIndex(r=>Number(r.id)===t);return a===-1?!1:(He.history.splice(a,1),!0)}}async function is({keyword:e="",limit:t=50}={}){let s=e.trim().toLowerCase();try{let r=(await rt()).transaction(Qe,"readonly"),i=r.objectStore(Qe),o=await vt(i.getAll());return await st(r),o.filter(l=>s?`${l.kind} ${l.title} ${l.detail}`.toLowerCase().includes(s):!0).sort((l,m)=>String(m.updated_at||m.created_at).localeCompare(String(l.updated_at||l.created_at))).slice(0,t)}catch{return ze=!0,He.history.filter(r=>s?`${r.kind} ${r.title} ${r.detail}`.toLowerCase().includes(s):!0).slice().sort((r,i)=>String(i.updated_at||i.created_at).localeCompare(String(r.updated_at||r.created_at))).slice(0,t)}}async function Ca(){try{let t=(await rt()).transaction(Qe,"readwrite");t.objectStore(Qe).clear(),await st(t)}catch{ze=!0}He.history=[]}async function os(e,t){let s={key:String(e),value:t,updated_at:new Date().toISOString()};try{let r=(await rt()).transaction(pt,"readwrite");return r.objectStore(pt).put(s),await st(r),s}catch{return ze=!0,He.settings.set(s.key,s),s}}async function ht(e,t=null){try{let a=(await rt()).transaction(pt,"readonly"),r=a.objectStore(pt),i=await vt(r.get(String(e)));return await st(a),i?i.value:t}catch{ze=!0;let a=He.settings.get(String(e));return a?a.value:t}}async function Ra({keyword:e=""}={}){let t=e.trim().toLowerCase();try{let a=(await rt()).transaction(pt,"readonly"),r=a.objectStore(pt),i=await vt(r.getAll());return await st(a),i.filter(o=>t?`${o.key} ${JSON.stringify(o.value)}`.toLowerCase().includes(t):!0).sort((o,l)=>String(o.key).localeCompare(String(l.key)))}catch{return ze=!0,Array.from(He.settings.values()).filter(a=>t?`${a.key} ${JSON.stringify(a.value)}`.toLowerCase().includes(t):!0)}}function Ia(e){if(typeof e=="string")return e;try{return JSON.stringify(e)}catch{return String(e)}}var ra={};ft(ra,{render:()=>ki,renderTestFlowPanel:()=>Et});var fr={running:["\u57F7\u884C\u4E2D","badge-info"],stopping:["\u505C\u6B62\u4E2D","badge-warn"],success:["\u5B8C\u6210","badge-ok"],interrupted:["\u5DF2\u4E2D\u6B62","badge-warn"],failed:["\u5931\u6557","badge-danger"],pending:["\u7B49\u5F85","badge-neutral"],skipped:["\u7565\u904E","badge-neutral"]},br=new Set(["running","stopping"]);function cs(e){let[t,s]=fr[e]||[e||"\u672A\u77E5","badge-neutral"];return`<span class="badge ${s}">${n(t)}</span>`}function ls(e){return String(e).padStart(2,"0")}function jt(e=new Date){let t=e instanceof Date?e:new Date(e);return`RAG Benchmark ${t.getFullYear()}-${ls(t.getMonth()+1)}-${ls(t.getDate())} ${ls(t.getHours())}:${ls(t.getMinutes())}`}function zt(e){return br.has(e)}function it(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?s.toFixed(3):t}function yt(e){if(e==null)return"\u2014";let t=Number(e);return Number.isFinite(t)?`${(t*100).toFixed(1)}%`:"\u2014"}function mt(e,t,s=""){return`<div class="bench-metric">
    <span class="summary-label">${n(e)}</span>
    <strong>${n(String(t))}</strong>
    ${s?`<small>${n(s)}</small>`:""}
  </div>`}function Pa(e={}){let t=e.score_components||e;return`<div class="bench-metrics">
    ${mt("Law Recall",yt(t.law_recall))}
    ${mt("Article Recall",yt(t.article_recall))}
    ${mt("Citation Valid",yt(t.citation_valid_rate))}
    ${mt("Judge",it(t.judge_overall))}
    ${mt("Human",it(t.human_overall))}
    ${mt("p50",ne(e.duration_p50_ms))}
    ${mt("p95",ne(e.duration_p95_ms))}
    ${mt("Success",`${c(e.success||0)} / ${c(e.total||0)}`)}
  </div>`}function Ba(e={}){let t=Object.entries(e.stages||{}).filter(([s])=>s.startsWith("rag.")).slice(0,8);return t.length?`<div class="bench-stage-grid">${t.map(([s,a])=>`<div class="bench-stage">
      <span>${n(s.replace(/^rag\./,""))}</span>
      <strong>${ne(a.p50_ms)}</strong>
      <small>p95 ${ne(a.p95_ms)}</small>
    </div>`).join("")}</div>`:""}function Oa(e){let t=e.summary||{},s=t.score_components||{};return`<span>Law ${yt(s.law_recall)}</span>
    <span>Article ${yt(s.article_recall)}</span>
    <span>Judge ${it(s.judge_overall)}</span>
    <span>p95 ${ne(t.duration_p95_ms)}</span>`}function Da(e){let t=e.summary||{},s=t.score_components||{};return JSON.stringify([s.law_recall,s.article_recall,s.judge_overall,t.duration_p95_ms])}function Fa(e,t){let s=e.config||{};return`<button class="bench-run ${t?"is-active":""}" type="button" data-bench-action="open-run" data-run-id="${n(e.run_id)}">
    <span class="bench-run-head">
      <strong data-bench-slot="run-label">${n(e.label||"RAG Benchmark")}</strong>
      <span data-bench-slot="run-status" data-status="${n(e.status||"")}">${cs(e.status)}</span>
      <span class="mono">${n(e.run_id.slice(0,10))}</span>
    </span>
    <span class="bench-run-meta">
      <span>${n(ve(e.started_at))}</span>
      <span data-bench-slot="run-completed">${c(e.completed_cases||0)} / ${c(e.total_cases||0)} \u984C</span>
      <span>${n(s.llm_model||"\u2014")}</span>
      <span>v${e.suite_version||1}</span>
    </span>
    <span class="bench-run-scores" data-bench-slot="run-scores" data-signature="${n(Da(e))}">${Oa(e)}</span>
  </button>`}function Vs(e,t=[]){let s=e.metrics||{},a=e.judge||{},r=e.human_review||{},i=s.scores||{},o=e.stage_ms||{},l=Object.entries(o).filter(([b])=>b.startsWith("rag.")).map(([b,y])=>`<span class="chip">${n(b)} ${ne(y)}</span>`).join(""),m=(e.law_sources||[]).map(b=>`<span class="chip">${n(b.law_name||"\u6CD5\u898F")} ${c((b.articles||[]).length)} \u689D</span>`).join("");return`<summary>
      <span class="bench-case-question">${n(e.question)}</span>
      ${cs(e.status)}
      <span class="bench-case-time">${ne(e.duration_ms)}</span>
      <span class="bench-case-score">Det ${it(i.deterministic)} \xB7 Judge ${it(i.judge)} \xB7 Human ${it(i.human)}</span>
    </summary>
    <div class="bench-case-body">
      <div class="bench-case-meta">
        <span class="mono">fingerprint ${n((e.fingerprint||"").slice(0,20))}</span>
        <span>item #${e.item_id} \xB7 v${e.item_version}</span>
        <button class="btn btn-ghost btn-sm" type="button" data-bench-action="fingerprint-history" data-fingerprint="${n(e.fingerprint||"")}">${u("history",13)}<span>\u540C\u984C\u6B77\u53F2</span></button>
      </div>
      <div class="bench-case-stages">${l||'<span class="qb-muted">\u6C92\u6709 stage timing</span>'}</div>
      <div class="bench-case-metrics">
        <span>Law recall ${yt(s.law_recall)}</span>
        <span>Article recall ${yt(s.article_recall)}</span>
        <span>Citation ${s.citation_valid?"valid":"invalid"}</span>
        <span>Refusal ${s.refusal_correct===null?"\u2014":s.refusal_correct?"correct":"wrong"}</span>
      </div>
      <div class="chips">${m||'<span class="qb-muted">\u6C92\u6709\u6CD5\u898F\u4F86\u6E90</span>'}</div>
      <div class="bench-answer"><strong>\u56DE\u7B54</strong><p>${n(e.answer||"\u2014")}</p></div>
      <div class="bench-judge"><strong>LLM judge</strong><p>${n(a.rationale||a.reason||"\u2014")}</p><span>${[["correctness",a.correctness],["grounding",a.grounding],["citation",a.citation],["clarity",a.clarity],["overall",a.overall]].map(([b,y])=>`${b} ${y??"\u2014"}`).join(" \xB7 ")}</span></div>
      <form class="bench-human-form" data-bench-form="human" data-result-id="${e.id}">
        <div class="bench-human-grid">
          ${[["correctness","\u6B63\u78BA\u6027",r.scores?.correctness??4],["grounding","\u6709\u64DA\u6027",r.scores?.grounding??4],["citation","\u5F15\u7528",r.scores?.citation??4],["clarity","\u6E05\u695A",r.scores?.clarity??4],["overall","\u6574\u9AD4",r.overall??4]].map(([b,y,v])=>`<label class="field"><span class="field-label">${y} <span class="field-tag">1\u20135</span></span><input class="input" type="number" min="1" max="5" name="score_${b}" value="${n(String(v))}" /></label>`).join("")}
        </div>
        <label class="field"><span class="field-label">\u4EBA\u5DE5\u6279\u6CE8</span><input class="input" name="comment" value="${n(r.comment||"")}" placeholder="\u56DE\u7B54\u54C1\u8CEA\u3001\u5F15\u7528\u6216\u4E8B\u5BE6\u932F\u8AA4" /></label>
        <button class="btn btn-secondary btn-sm" type="submit">${u("check",13)}<span>\u5132\u5B58\u4EBA\u5DE5\u8A55\u5206</span></button>
      </form>
      ${t.length?`<div class="bench-history"><strong>\u540C\u984C\u6B77\u53F2 \xB7 ${t.length} \u7B46</strong>${t.map(b=>`<div class="bench-history-row"><span>${n(ve(b.run?.started_at))}</span><span>${n(b.run?.config?.llm_model||"\u2014")}</span><span>Det ${it(b.metrics?.scores?.deterministic)}</span><span>Judge ${it(b.metrics?.scores?.judge)}</span><span>Human ${it(b.metrics?.scores?.human)}</span><span>${ne(b.duration_ms)}</span></div>`).join("")}</div>`:""}
    </div>`}function Gs(e,t=[]){return JSON.stringify([e.status,e.duration_ms,e.answer,e.metrics,e.judge,e.human_review,e.stage_ms,e.law_sources,t.map(s=>[s.id,s.duration_ms,s.metrics?.scores?.human,s.finished_at])])}function Ha(e,t=[]){return`<details class="bench-case" data-result-id="${e.id}">
    ${Vs(e,t)}
  </details>`}function za(e){return`${cs(e.status)}
    <span class="mono">${n(e.run_id)}</span>
    ${zt(e.status)?`<button class="btn btn-secondary btn-sm" type="button" data-bench-action="stop" data-run-id="${n(e.run_id)}">${u("x",13)}<span>\u505C\u6B62</span></button>`:""}`}function vr(e,t){let s=e.cases||[];return`<section class="report-card bench-detail" data-run-id="${n(e.run_id)}">
    <div class="side-card-head">
      <span class="side-card-title">${u("activity",14)}${n(e.label||"RAG Benchmark")}</span>
      <div class="qb-actions" data-bench-detail-actions data-signature="${n((e.status||"")+":"+e.run_id)}">
        ${za(e)}
      </div>
    </div>
    <div data-bench-detail="metrics">${Pa(e.summary||{})}</div>
    <div data-bench-detail="stages">${Ba(e.summary||{})}</div>
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
    <div class="bench-cases" data-bench-cases>${s.length?s.map(a=>Ha(a,t[a.fingerprint]||[])).join(""):pe({tone:"info",title:"\u5C1A\u7121\u984C\u76EE\u7D50\u679C",text:"Benchmark \u57F7\u884C\u5F8C\u6703\u5728\u9019\u88E1\u986F\u793A\u9010\u984C\u7D50\u679C\u3002"})}</div>
  </section>`}function Ua(e){return`<button class="btn btn-primary" type="submit" ${e?"disabled":""}>${u("play",14)}<span>${e?"Benchmark \u57F7\u884C\u4E2D":"\u57F7\u884C Benchmark"}</span></button>
    ${e?`<button class="btn btn-secondary" type="button" data-bench-action="stop" data-run-id="${n(e.run_id)}">${u("x",14)}<span>\u505C\u6B62</span></button>`:""}`}function Ja(e,t=[]){let s=Math.max(0,Number(e.total_cases)||0),a=Math.max(0,Math.min(s,Number(e.completed_cases)||0)),r=Date.now(),i=Date.parse(e.started_at||""),o=Number.isFinite(i)?Math.max(0,r-i):0,l=(t||[]).filter(g=>["success","failed"].includes(g.status)).map(g=>Number(g.duration_ms)||0).filter(g=>g>0),m=null;if(l.length)m=l.reduce((g,k)=>g+k,0)/l.length;else if(a>0){let g=Date.parse(e.updated_at||""),k=Number.isFinite(g)?g:i;Number.isFinite(k)&&k>i?m=(k-i)/a:o>0&&(m=o/a)}let b=(t||[]).find(g=>g.status==="running")||null,y=0;if(a<s&&m&&m>0){let g=b?Date.parse(b.started_at||""):NaN,k=Date.parse(e.updated_at||""),F=Number.isFinite(g)?g:k;Number.isFinite(F)&&(y=Math.max(0,Math.min(.95,(r-F)/m)))}let v=Math.min(s,a+y),w=s>0?Math.max(0,Math.min(100,v/s*100)):0,_=m===null?null:Math.max(0,s-v)*m;return{total:s,completed:a,elapsedMs:o,averageMs:m,progress:w,etaMs:_,ratePerMin:m?6e4/m:null,running:b}}function Qa(e){return e===null?"\u9810\u4F30\u5269\u9918\uFF1A\u8A08\u7B97\u4E2D\u2026":e<1e3?"\u9810\u4F30\u5269\u9918\uFF1A\u5373\u5C07\u5B8C\u6210":`\u9810\u4F30\u5269\u9918 ${ne(e)}`}function Ga(e,t=[]){let s=Ja(e,t),a=e.status==="stopping";return`<div class="bench-progress" data-bench-live data-run-id="${n(e.run_id)}">
    <div class="bench-progress-head">
      <span class="bench-progress-state"><span class="spinner" aria-hidden="true"></span><span data-bench-slot="progress-state">${a?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D"}</span></span>
      <strong data-bench-slot="progress-count">${c(s.completed)} / ${c(s.total)} \u984C</strong>
      <span data-bench-slot="progress-percent">${s.progress.toFixed(1)}%</span>
      <span class="bench-progress-eta" data-bench-slot="progress-eta">${Qa(s.etaMs)}</span>
      <span data-bench-slot="progress-rate">${s.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${s.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`}</span>
    </div>
    <div class="processing-bar processing-bar-lg bench-progress-bar${s.completed===0?" is-waiting":""}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${s.progress.toFixed(1)}" data-bench-slot="progress-bar">
      <span class="processing-bar-fill" data-bench-slot="progress-fill" style="width:${s.progress.toFixed(2)}%"></span>
    </div>
    <div class="bench-progress-foot">
      <span data-bench-slot="progress-elapsed">\u5DF2\u57F7\u884C ${ne(s.elapsedMs)}</span>
      <span data-bench-slot="progress-average">${s.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${ne(s.averageMs)}\uFF0F\u984C`}</span>
      <span>\u5373\u6642\u9810\u4F30 \xB7 \u6BCF\u5B8C\u6210\u4E00\u984C\u6821\u6B63</span>
    </div>
  </div>`}function hr(e){let t=e.models?.models||{},s=e.suites||[],a=Ht(e),r=e.selectedRun;return`<section class="report-card bench-card">
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
      <label class="field"><span class="field-label">Run \u6A19\u7C64</span><input class="input" name="label" value="${n(e.config.label||jt())}" /></label>
      <div class="qb-actions" data-bench-actions data-signature="${n(a?`${a.run_id}:${a.status}`:"")}">
        ${Ua(a)}
      </div>
    </form>
    <div data-bench-live-wrap data-signature="${n(a?`${a.run_id}:${a.status}:${a.total_cases}`:"")}">${a?Ga(a,Ws(e,a)):""}</div>
    <div class="bench-runs-head"><span class="summary-label">\u6B77\u53F2 Run</span><span class="qb-muted">\u540C\u984C\u76EE\u4EE5 fingerprint \u5C0D\u9F4A\uFF0C\u53EF\u5C55\u958B\u9010\u984C\u6BD4\u8F03</span></div>
    <div class="bench-runs" data-bench-runs>${(e.runs||[]).length?e.runs.map(i=>Fa(i,r?.run_id===i.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>'}</div>
    ${r?vr(r,e.history):""}
  </section>`}function Ht(e){let t=(e.runs||[]).find(s=>zt(s.status));return t?e.selectedRun&&e.selectedRun.run_id===t.run_id?e.selectedRun.status&&!zt(e.selectedRun.status)?null:{...t,...e.selectedRun,summary:e.selectedRun.summary||t.summary||{},cases:e.selectedRun.cases||[]}:t:null}function Ws(e,t){return!t||!e.selectedRun||e.selectedRun.run_id!==t.run_id?[]:e.selectedRun.cases||[]}function Va(e,{onNavigate:t=null}={}){let s={models:null,suites:[],runs:[],selectedRun:null,selectedSuiteId:null,history:{},indexVersion:null,config:{label:jt(),embedding_model:"",llm_model:"",judge_model:"",top_k:4,score_threshold:.35,repeats:1,enable_law_retrieval:!0,judge_enabled:!0},labelTouched:!1,loaded:!1,referenceLoaded:!1,loading:!1,loadAgain:!1,pendingRefreshAll:!1,activeRunId:"",pollTimer:null,tickTimer:null,renderSignature:"",forcedCaseIds:new Set},a=()=>e.querySelector("#performance-panel-benchmark"),r=j=>{let $=new FormData(j);return{label:String($.get("label")||"").trim()||jt(),embedding_model:String($.get("embedding_model")||""),llm_model:String($.get("llm_model")||""),judge_model:String($.get("judge_model")||""),top_k:Number($.get("top_k")||4),score_threshold:Number($.get("score_threshold")||.35),repeats:Number($.get("repeats")||1),enable_law_retrieval:j.elements.enable_law_retrieval?.checked??!0,judge_enabled:j.elements.judge_enabled?.checked??!0}},i=()=>JSON.stringify({selectedRunId:s.selectedRun?.run_id||"",references:s.referenceLoaded?[s.indexVersion?.physical_collection||"",(s.models?.models?.embedding||[]).join(","),(s.models?.models?.llm||[]).join(","),(s.suites||[]).map(j=>`${j.id}:${j.name}:${j.item_count}:${j.version}:${j.status}`)]:null,runs:(s.runs||[]).map(j=>`${j.run_id}:${j.label||""}:${j.suite_version||1}`)}),o=()=>{let $=a()?.querySelector("[data-bench-live]"),B=Ht(s);if(!$||!B)return;let D=Ja(B,Ws(s,B)),x=(R,Q)=>{let z=$.querySelector(`[data-bench-slot="${R}"]`);z&&z.textContent!==Q&&(z.textContent=Q)};x("progress-count",`${c(D.completed)} / ${c(D.total)} \u984C`),x("progress-percent",`${D.progress.toFixed(1)}%`),x("progress-eta",Qa(D.etaMs)),x("progress-rate",D.ratePerMin===null?"\u901F\u5EA6\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u7D04 ${D.ratePerMin.toFixed(1)} \u984C\uFF0F\u5206`),x("progress-elapsed",`\u5DF2\u57F7\u884C ${ne(D.elapsedMs)}`),x("progress-average",D.averageMs===null?"\u5E73\u5747\uFF1A\u8A08\u7B97\u4E2D\u2026":`\u5E73\u5747 ${ne(D.averageMs)}\uFF0F\u984C`),x("progress-state",B.status==="stopping"?"\u6B63\u5728\u505C\u6B62":"\u57F7\u884C\u4E2D");let S=$.querySelector('[data-bench-slot="progress-bar"]');S&&(S.setAttribute("aria-valuenow",D.progress.toFixed(1)),S.classList.toggle("is-waiting",D.completed===0));let q=$.querySelector('[data-bench-slot="progress-fill"]');q&&(q.style.width=`${D.progress.toFixed(2)}%`)},l=j=>{let $=j.querySelector("[data-bench-actions]");if(!$)return;let B=Ht(s),D=B?`${B.run_id}:${B.status}`:"";$.dataset.signature!==D&&($.dataset.signature=D,$.innerHTML=Ua(B))},m=j=>{let $=j.querySelector("[data-bench-live-wrap]");if(!$)return;let B=Ht(s),D=B?`${B.run_id}:${B.status}:${B.total_cases}`:"";$.dataset.signature!==D&&($.dataset.signature=D,$.innerHTML=B?Ga(B,Ws(s,B)):"")},b=j=>{let $=j.querySelector("[data-bench-runs]");if(!$)return;let B=s.runs||[],D=[...$.querySelectorAll("[data-run-id]")].map(S=>S.dataset.runId),x=B.map(S=>S.run_id);if(D.join("|")!==x.join("|")){$.innerHTML=B.length?B.map(S=>Fa(S,s.selectedRun?.run_id===S.run_id)).join(""):'<div class="qb-empty">\u5C1A\u7121 benchmark \u57F7\u884C\u7D00\u9304\u3002</div>';return}for(let S of B){let q=$.querySelector(`[data-run-id="${S.run_id}"]`);if(!q)continue;q.classList.toggle("is-active",s.selectedRun?.run_id===S.run_id);let R=q.querySelector('[data-bench-slot="run-label"]');R&&R.textContent!==(S.label||"RAG Benchmark")&&(R.textContent=S.label||"RAG Benchmark");let Q=q.querySelector('[data-bench-slot="run-status"]');Q&&Q.dataset.status!==(S.status||"")&&(Q.dataset.status=S.status||"",Q.innerHTML=cs(S.status));let z=q.querySelector('[data-bench-slot="run-completed"]');if(z){let Se=`${c(S.completed_cases||0)} / ${c(S.total_cases||0)} \u984C`;z.textContent!==Se&&(z.textContent=Se)}let te=q.querySelector('[data-bench-slot="run-scores"]'),me=Da(S);te&&te.dataset.signature!==me&&(te.dataset.signature=me,te.innerHTML=Oa(S))}},y=j=>{let $=s.selectedRun;if(!$)return;let B=j.querySelector(`.bench-detail[data-run-id="${$.run_id}"]`);if(!B)return;let D=B.querySelector("[data-bench-detail-actions]");if(D){let te=`${$.status||""}:${$.run_id}`;D.dataset.signature!==te&&(D.dataset.signature=te,D.innerHTML=za($))}let x=B.querySelector('[data-bench-detail="metrics"]');if(x){let te=JSON.stringify($.summary||{});x.dataset.signature!==te&&(x.dataset.signature=te,x.innerHTML=Pa($.summary||{}))}let S=B.querySelector('[data-bench-detail="stages"]');if(S){let te=JSON.stringify(($.summary||{}).stages||{});S.dataset.signature!==te&&(S.dataset.signature=te,S.innerHTML=Ba($.summary||{}))}let q=B.querySelector("[data-bench-cases]");if(!q)return;let R=$.cases||[];if(!R.length)return;let Q=q.querySelector(".notice");Q&&Q.remove();let z=new Map([...q.querySelectorAll("details.bench-case")].map(te=>[Number(te.dataset.resultId),te]));for(let te of R){let me=s.history[te.fingerprint]||[],Se=Gs(te,me),xe=z.get(Number(te.id));if(!xe){q.insertAdjacentHTML("beforeend",Ha(te,me)),xe=q.lastElementChild,xe&&(xe._benchSignature=Se);continue}if(xe._benchSignature===Se||!s.forcedCaseIds.delete(Number(te.id))&&xe.contains(document.activeElement))continue;let Re=xe.open;xe.innerHTML=Vs(te,me),xe.open=Re,xe._benchSignature=Se}},v=()=>{Ht(s)?s.tickTimer||(s.tickTimer=window.setInterval(o,1e3)):s.tickTimer&&(window.clearInterval(s.tickTimer),s.tickTimer=null)},w=()=>{let j=a();j&&(l(j),m(j),b(j),y(j),o(),v())},_=j=>{let $=s.selectedRun;if(!$)return;let B=j.querySelector('[data-bench-detail="metrics"]');B&&(B.dataset.signature=JSON.stringify($.summary||{}));let D=j.querySelector('[data-bench-detail="stages"]');D&&(D.dataset.signature=JSON.stringify(($.summary||{}).stages||{}));let x=j.querySelector("[data-bench-cases]");if(!x)return;let S=new Map(($.cases||[]).map(q=>[Number(q.id),q]));for(let q of x.querySelectorAll("details.bench-case")){let R=S.get(Number(q.dataset.resultId));R&&(q._benchSignature=Gs(R,s.history[R.fingerprint]||[]))}},g=(j=!1)=>{let $=a();if(!$)return;let B=i();if(!j&&s.renderSignature===B){w();return}s.renderSignature=B,s.forcedCaseIds.clear(),$.innerHTML=hr(s),_($),w()},k=async({refreshAll:j=!1}={})=>{if(s.loading){s.loadAgain=!0,s.pendingRefreshAll=s.pendingRefreshAll||j;return}s.loading=!0;try{if(!s.referenceLoaded||j){let[R,Q]=await Promise.all([U.benchmarkModels(),U.benchmarkSuites()]);s.models=R,s.suites=Q.suites||[],s.indexVersion=R.index_version,s.referenceLoaded=!0,!s.selectedSuiteId&&s.suites.length&&(s.selectedSuiteId=s.suites[0].id),s.config.embedding_model||(s.config.embedding_model=R.models?.embedding?.[0]||""),s.config.llm_model||(s.config.llm_model=R.models?.llm?.[0]||""),s.config.judge_model||(s.config.judge_model=(R.models?.llm||[]).find(z=>z!==s.config.llm_model)||"")}let $=await U.benchmarkRuns(30);s.runs=$.runs||[];let B=s.activeRunId,D=s.runs.find(R=>zt(R.status))||null;s.activeRunId=D?.run_id||"";let x=s.selectedRun?.run_id||"";x||(x=D?.run_id||s.runs[0]?.run_id||"");let S=!!(s.selectedRun&&B&&s.selectedRun.run_id===B);x&&(!s.selectedRun||s.selectedRun.run_id!==x||x===D?.run_id||S)?s.selectedRun=await U.benchmarkRun(x,!0):x||(s.selectedRun=null),s.loaded=!0,g()}catch($){if(!s.loaded){s.renderSignature="";let B=a();B&&(B.innerHTML=pe({tone:"danger",title:"Benchmark \u8CC7\u6599\u8B80\u53D6\u5931\u6557",text:n($.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")}))}}finally{if(s.loading=!1,s.loadAgain){let $=s.pendingRefreshAll;s.loadAgain=!1,s.pendingRefreshAll=!1,k({refreshAll:$})}else F()}},F=()=>{s.pollTimer&&window.clearTimeout(s.pollTimer),s.pollTimer=null,(s.runs||[]).some(j=>zt(j.status))&&(s.pollTimer=window.setTimeout(()=>{k()},2500))},Y=async j=>{try{s.selectedRun=await U.benchmarkRun(j,!0),g(),F()}catch($){M($.message||"\u8B80\u53D6 benchmark run \u5931\u6557\u3002","danger")}},K=async j=>{!s.labelTouched&&j.elements.label&&(j.elements.label.value=jt());let $=r(j);s.config=$;let B=Number(j.elements.suite_id?.value||0);if(!B){M("\u8ACB\u5148\u9078\u64C7 benchmark \u984C\u5EAB\u3002","warn");return}try{await U.startBenchmarkRun({suite_id:B,config:$,actor:"anonymous"}),M("Benchmark \u5DF2\u555F\u52D5\u3002","ok"),s.selectedRun=null,s.config.label=jt(),s.labelTouched=!1,await k()}catch(D){M(D.message||"Benchmark \u555F\u52D5\u5931\u6557\u3002","danger",8e3)}},X=async j=>{try{await U.stopBenchmarkRun(j),M("\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info"),await k()}catch($){M($.message||"\u505C\u6B62\u5931\u6557\u3002","danger")}},W=async j=>{let $=Number(j.dataset.resultId||0),B=new FormData(j),D={};for(let x of["correctness","grounding","citation","clarity","overall"]){let S=Number(B.get(`score_${x}`));Number.isFinite(S)&&(D[x]=S)}try{await U.reviewBenchmarkResult($,{reviewer:"anonymous",scores:D,comment:String(B.get("comment")||"")}),M("\u4EBA\u5DE5\u8A55\u5206\u5DF2\u5132\u5B58\u3002","ok"),s.selectedRun&&(s.selectedRun=await U.benchmarkRun(s.selectedRun.run_id,!0),s.forcedCaseIds.add($)),g()}catch(x){M(x.message||"\u4EBA\u5DE5\u8A55\u5206\u5132\u5B58\u5931\u6557\u3002","danger")}},ae=async j=>{if(j)try{let $=await U.benchmarkFingerprintHistory(j,50);s.history[j]=$.cases||[];let B=s.selectedRun,D=a();if(!B||!D)return;let x=(B.cases||[]).filter(S=>S.fingerprint===j);for(let S of x){let q=D.querySelector(`details.bench-case[data-result-id="${S.id}"]`);if(!q)continue;let R=q.open;q.innerHTML=Vs(S,s.history[j]),q.open=R,q._benchSignature=Gs(S,s.history[j])}}catch($){M($.message||"\u540C\u984C\u6B77\u53F2\u8B80\u53D6\u5931\u6557\u3002","danger")}},oe=async j=>{let $=j.target.closest("[data-bench-action]");if(!$)return;let B=$.dataset.benchAction;B==="open-run"?await Y($.dataset.runId||""):B==="stop"?await X($.dataset.runId||""):B==="fingerprint-history"&&await ae($.dataset.fingerprint||"")},le=async j=>{let $=j.target.closest("[data-bench-form]");$&&(j.preventDefault(),$.dataset.benchForm==="run"?await K($):$.dataset.benchForm==="human"&&await W($))},$e=j=>{j&&(j.elements.label&&j.elements.label.value!==s.config.label&&(s.labelTouched=!0),s.config=r(j),j.elements.suite_id&&(s.selectedSuiteId=Number(j.elements.suite_id.value)||s.selectedSuiteId))},ie=j=>{let $=j.target.closest('[data-bench-form="run"]');$&&$e($)};return e.addEventListener("click",oe),e.addEventListener("submit",le),e.addEventListener("input",ie),e.addEventListener("change",ie),{show(){if(t&&t("benchmark"),!s.labelTouched){s.config.label=jt();let j=a()?.querySelector('input[name="label"]');j&&(j.value=s.config.label)}k({refreshAll:!s.referenceLoaded})},refresh(){return k({refreshAll:!0})},destroy(){e.removeEventListener("click",oe),e.removeEventListener("submit",le),e.removeEventListener("input",ie),e.removeEventListener("change",ie),s.pollTimer&&window.clearTimeout(s.pollTimer),s.tickTimer&&window.clearInterval(s.tickTimer)}}}var aa={};ft(aa,{exportCsv:()=>fs,exportableResult:()=>bs,render:()=>si,renderReport:()=>ps,reportError:()=>gs,reportLoading:()=>Ut});var tn=[10,25,50,100],yr=500,$r=["law_name","law_level","law_category","law_modified_date","article_count"],wr=["jid","court_normalized","title","jdate","matched_laws","citation_count"],_r={A:"\u689D\u6587",C:"\u7AE0\u7BC0"};function ms(e){return e?.label||e?.id||"\u8CC7\u6599\u5EAB"}function ds(e,t){let s={};for(let a of e.fields||[]){let r=a.type==="checkbox"?!1:a.type==="multiselect"?[]:"",i=a.default===void 0?r:a.default;s[a.key]=Array.isArray(i)?[...i]:i}return{values:s,page:1,pageSize:t,result:null,sort:null,columnFilters:{},fuzzyTerms:[]}}function kr(e,t){let s=e.visibleWhen;if(!s)return!0;for(let[a,r]of Object.entries(s))if(Array.isArray(r)&&!r.map(String).includes(String(t[a]??"")))return!1;return!0}function sa(e,t){return(e.fields||[]).filter(s=>kr(s,t))}function Sr(e,t){return`filter-${e.id}-${t}`}function $t(e){return e==null?"":n(String(e))}function Ks(e,t,s){let a=s[t.key],r=Sr(e,t.key),i=t.help?`<span class="field-help">${n(t.help)}</span>`:"";if(t.type==="checkbox")return`<div class="field">
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
    </label>`;if(t.type==="select"){let l=(t.options||[]).map(m=>`<option value="${$t(m.value)}" ${String(m.value)===String(a??"")?"selected":""}>${n(m.label??m.value)}</option>`).join("");return`<div class="field">${o}
      <select class="select" id="${r}" name="${n(t.key)}">${l}</select>
      ${i}
    </div>`}if(t.type==="multiselect"){let l=new Set((Array.isArray(a)?a:[]).map(String)),m=(t.options||[]).map(b=>`<label class="multi-option">
          <input type="checkbox" name="${n(t.key)}" value="${$t(b.value)}" ${l.has(String(b.value))?"checked":""} />
          <span>${n(b.label??b.value)}</span>
        </label>`).join("");return`<div class="field">${o}
      <div class="multi-select">${m}</div>
      ${i}
    </div>`}return t.type==="number"?`<div class="field">${o}
      <input class="input" type="number" id="${r}" name="${n(t.key)}"
        value="${$t(a)}"
        ${t.min!==void 0?`min="${t.min}"`:""}
        ${t.max!==void 0?`max="${t.max}"`:""}
        step="${t.step??1}"
        placeholder="${$t(t.placeholder||"")}" />
      ${i}
    </div>`:t.type==="date"?`<div class="field">${o}
      <input class="input" type="date" id="${r}" name="${n(t.key)}"
        value="${$t(a)}" />
      ${i}
    </div>`:`<div class="field">${o}
    <input class="input" type="text" id="${r}" name="${n(t.key)}"
      value="${$t(a)}"
      placeholder="${$t(t.placeholder||"")}" />
    ${i}
  </div>`}function Wa(e,t,{focusTable:s=!1}={}){let a=sa(e,t.values),r=[];for(let i=0;i<a.length;i+=1){let o=a[i],l=a[i+1];o.type==="date"&&l&&l.type==="date"?(r.push(`<div class="field-row">${Ks(e,o,t.values)}${Ks(e,l,t.values)}</div>`),i+=1):r.push(Ks(e,o,t.values))}return`<form id="data-filter-form" autocomplete="off">
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
  </form>`}function us(e,t,s){let a={...s.values};for(let r of sa(t,a))if(r.type==="checkbox"){let i=e.querySelector(`[name="${r.key}"]`);a[r.key]=!!i?.checked}else if(r.type==="multiselect")a[r.key]=Array.from(e.querySelectorAll(`[name="${r.key}"]:checked`)).map(i=>i.value);else{let i=e.querySelector(`[name="${r.key}"]`);a[r.key]=i?i.value:""}return a}function sn(e,t){let s={};for(let a of sa(e,t.values)){let r=t.values[a.key];a.type==="checkbox"?s[a.key]=!!r:a.type==="multiselect"?s[a.key]=Array.isArray(r)?r:[]:a.type==="number"?s[a.key]=r===""||r===null?"":Number(r):s[a.key]=r??""}return s}function Ys(e,t){let s=sn(e,t);return Array.isArray(t.fuzzyTerms)&&t.fuzzyTerms.length&&(s.keywords=[...t.fuzzyTerms]),(e.id==="postgres"||e.id==="parquet")&&t.sort?.key&&(s.sort=`${t.sort.key}:${t.sort.direction}`,s.schema_preview=!0),t.columnFilters&&Object.keys(t.columnFilters).length>0&&(s.column_filters=t.columnFilters),s}function qr(e){if(e.status==="operational")return"";let t=e.status==="unavailable"?"danger":e.status==="degraded"?"warn":"info";return`<div class="sidebar-notice">${pe({tone:t,title:`${ms(e)} ${et(e.status).label}`,text:n(e.detail||"\u76EE\u524D\u7121\u6CD5\u4F7F\u7528\u9019\u500B\u8CC7\u6599\u4F86\u6E90\u3002")})}</div>`}function xr(e,t){return`<label class="field data-source-field">
    <span class="field-label">\u8CC7\u6599\u4F86\u6E90</span>
    <select class="select" name="database">
      ${e.map(s=>{let a=et(s.status);return`<option value="${n(s.id)}" ${s.id===t?"selected":""}>${n(s.label)} \xB7 ${n(a.label)}</option>`}).join("")}
    </select>
  </label>`}function Ka(e,t){return`<nav class="data-nav" aria-label="\u8CC7\u6599\u67E5\u8A62\u529F\u80FD">
    ${[{id:"law",label:"\u67E5\u8A62\u6CD5\u898F\u547D\u4EE4",hint:"Fuzzy \u6CD5\u898F\u540D\u7A31\u3001\u985E\u5225\u8207\u547D\u4EE4",icon:"file"},{id:"judgment",label:"\u67E5\u8A62\u5224\u6C7A",hint:"Fuzzy \u6CD5\u9662\u3001\u6848\u865F\u8207\u6848\u7531",icon:"layers"},{id:"schema",label:"\u8CC7\u6599\u5EAB Schema",hint:"\u8CC7\u6599\u8868\u3001\u6B04\u4F4D\u8207\u9810\u89BD",icon:"table"}].map(a=>{let r=a.id==="schema"?t==="schema":t==="query"&&e===a.id;return`<button class="data-nav-item${r?" is-active":""}" type="button"
          data-action="data-nav" data-tab="${a.id}" ${r?'aria-current="page"':""}>
          <span class="data-nav-icon">${u(a.icon,15)}</span>
          <span class="data-nav-copy">
            <strong>${n(a.label)}</strong>
            <small>${n(a.hint)}</small>
          </span>
        </button>`}).join("")}
  </nav>`}function Ar(e,t,s){if(t.id!=="postgres"&&t.id!=="parquet")return"";let a=Array.isArray(s.fuzzyTerms)?s.fuzzyTerms:[],r=e==="law"?"Fuzzy \u6CD5\u898F\uFF0F\u547D\u4EE4":"Fuzzy \u5224\u6C7A",i=e==="law"?"\u8F38\u5165\u6CD5\u898F\u540D\u7A31\u6216\u76F8\u8FD1\u5B57\u2026":"\u8F38\u5165\u6CD5\u9662\u3001\u6848\u865F\u3001\u6848\u7531\u6216\u76F8\u8FD1\u5B57\u2026";return`<div class="data-fuzzy" data-data-fuzzy data-fuzzy-kind="${e}">
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
  </div>`}function Xs(e,t,s=""){let a=Array.isArray(e.tables)?e.tables:[],r=a.length?a.map(i=>`<button class="schema-item ${String(i.id)===String(s||"")?"is-selected":""}" type="button"
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
  </div>`}function Lr(e){return{postgres:"PostgreSQL \u67E5\u8A62\u4F7F\u7528\u53C3\u6578\u5316\u689D\u4EF6\u8207\u5206\u9801\uFF0C\u50C5\u8B80\u53D6\u8CC7\u6599\u3002",parquet:"Parquet \u67E5\u8A62\u76F4\u63A5\u6383\u63CF\u76EE\u524D\u6700\u65B0\u7684\u5FEB\u7167\uFF1B\u52FE\u9078\u539F\u59CB JSON \u6703\u589E\u52A0\u56DE\u50B3\u91CF\u8207\u6E32\u67D3\u6642\u9593\u3002",qdrant:"Qdrant \u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\uFF1B\u9700\u8981\u5148\u5B8C\u6210\u5411\u91CF\u7D22\u5F15\u3002\u6AA2\u7D22\u7D50\u679C\u53EA\u5305\u542B\u7D22\u5F15\u4E2D\u5BE6\u969B\u5B58\u5728\u7684\u5224\u6C7A\uFF0C\u4E0D\u6703\u7522\u751F\u865B\u69CB\u8CC7\u6599\u3002",indexeddb:"IndexedDB \u53EA\u5728\u9019\u500B\u700F\u89BD\u5668\u5167\u67E5\u8A62\uFF0C\u4E0D\u6703\u7D93\u904E\u4F3A\u670D\u5668\uFF1B\u6E05\u9664\u7DB2\u7AD9\u8CC7\u6599\u5F8C\u7D00\u9304\u6703\u6D88\u5931\u3002"}[e.id]||n(e.detail||"")}function Mr(e){return`<div class="report-empty">
    ${Fe({iconName:"table",title:"\u67E5\u8A62\u5831\u8868\u6703\u986F\u793A\u5728\u9019\u88E1",text:n({postgres:"\u4F7F\u7528\u5DE6\u5074 fuzzy \u67E5\u8A62\u52A0\u5165\u6CD5\u898F\u6216\u5224\u6C7A\u689D\u4EF6\uFF0C\u518D\u8996\u9700\u8981\u5C55\u958B\u9032\u968E metadata \u689D\u4EF6\u3002",parquet:"\u4F7F\u7528\u5DE6\u5074 fuzzy \u67E5\u8A62\u52A0\u5165\u689D\u4EF6\uFF0C\u76F4\u63A5\u6383\u63CF\u539F\u59CB Parquet\uFF1B\u53EF\u5C55\u958B\u9032\u968E\u689D\u4EF6\u8ABF\u6574\u6B04\u4F4D\u3002",qdrant:"\u8F38\u5165\u8A9E\u610F\u67E5\u8A62\u5F8C\uFF0C\u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5DF2\u5EFA\u7ACB\u5411\u91CF\u7D22\u5F15\u7684\u5224\u6C7A\uFF1B\u672A\u7D22\u5F15\u6642\u6703\u660E\u78BA\u986F\u793A\u72C0\u614B\u3002",indexeddb:"\u67E5\u8A62\u5B58\u5728\u9019\u500B\u700F\u89BD\u5668\u7684\u63D0\u554F\u7D00\u9304\u8207\u8A2D\u5B9A\uFF0C\u4E0D\u9700\u8981\u4F3A\u670D\u5668\u3002"}[e.id]||"\u8A2D\u5B9A\u689D\u4EF6\u5F8C\u57F7\u884C\u67E5\u8A62\u3002")})}
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
  </div>`}function Ut(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${n(ms(e))} \u67E5\u8A62\u4E2D</div>
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
  </div>`}function gs(e,t){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${n(ms(t))} \u67E5\u8A62\u5931\u6557</div>
        <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${pe({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u67E5\u8A62\u7D50\u679C",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="retry">
          ${u("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function jr(e){if(!e.length)return'<div class="report-empty-inline">\u9019\u6B21\u67E5\u8A62\u6C92\u6709\u53EF\u5448\u73FE\u7684\u5206\u5E03\u8CC7\u6599\u3002</div>';let t=Math.max(...e.map(s=>Number(s.value)||0),1);return`<div class="distribution">
    ${e.map(s=>{let a=Number(s.value)||0,r=Math.max(1.5,a/t*100);return`<div class="dist-row">
          <span class="dist-label" title="${n(s.label||"\u672A\u5206\u985E")}">${n(s.label||"\u672A\u5206\u985E")}</span>
          <span class="dist-track"><span class="dist-bar" style="width:${r.toFixed(1)}%"></span></span>
          <span class="dist-value">${c(a)}</span>
        </div>`}).join("")}
  </div>`}function an(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="law_documents"}function Tr(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="judgment_documents"}function Er(e){return e&&e.database==="qdrant"&&String(e.table||"").startsWith("judgment")}function Nr(e){let t=e._jid||e.jid;return t?`<button class="law-link judgment-link" type="button" data-action="open-judgment"
    data-jid="${n(String(t))}"
    title="\u6AA2\u8996\u300C${n(String(t))}\u300D\u7684\u5224\u6C7A\u539F\u6587">${n(String(t))}${u("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}var Cr={jid:"jid",court:"court",court_normalized:"court",title:"title",jdate:"jdate",matched_laws:"matched_laws",citation_count:"citation_count",full_text_length:"full_text_length"};function Rr(e,t,s,a=!1,r=!0,i=!1){let o=a?e.key:e.label||e.key,l=r?t?Cr[e.key]||e.key:i?e.key:null:null;if(!l)return`<th scope="col">${n(o)}</th>`;let m=s?.key===l,b=m?s.direction:null,y=b==="asc"?"ascending":b==="desc"?"descending":"none",v=b==="asc"?"\u2191":b==="desc"?"\u2193":"\u2195";return`<th scope="col" aria-sort="${y}">
    <button class="table-sort${m?" is-active":""}" type="button"
      data-action="sort-column" data-sort-key="${n(l)}"
      title="\u4F9D${n(o)}\u6392\u5E8F">
      <span>${n(o)}</span>
      <span class="table-sort-icon" aria-hidden="true">${v}</span>
    </button>
  </th>`}function Ir(e,t){if(!an(e)||!t)return null;let s=t._law_key||t.law_name;if(!s)return null;let a=e.meta?.dataset,r=t._law_source_type||(a&&a!=="all"?a:"");return{lawKey:String(s),sourceType:String(r||""),lawName:String(t.law_name||"")}}function Pr(e,t,s){let a=e[t.key];return a==null||a===""?"\u2014":`<button class="law-link" type="button" data-action="open-law"
    data-law-key="${n(s.lawKey)}"
    data-law-source="${n(s.sourceType)}"
    data-law-name="${n(s.lawName)}"
    title="\u6AA2\u8996\u300C${n(String(a))}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${n(String(a))}${u("chevronRight",12,"law-link-icon")}</button>`}function nn(e,{useColumnKeys:t=!1,sortable:s=!0,sortableAll:a=!1,searchValues:r=null,compact:i=!1}={}){let o=Array.isArray(e.columns)?e.columns:[],l=Array.isArray(e.rows)?e.rows:[],m=(e.page-1)*e.page_size,b=an(e),y=Tr(e),v=Er(e),w=e.meta?.sort||null,_=r?`<tr class="schema-search-row">
        <th scope="col" class="cell-index-head"></th>
        ${o.map(g=>`<th scope="col">
              <div class="schema-search-wrap">
                <input class="schema-search-input" type="search"
                  data-schema-search="${n(g.key)}"
                  value="${n(String(r[g.key]??""))}"
                  placeholder="\u641C\u5C0B ${n(g.key)}"
                  autocomplete="off" />
              </div>
            </th>`).join("")}
      </tr>`:"";return o.length?l.length?`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">${c(l.length)} rows \xB7 \u7B2C ${e.page} \u9801${b?" \xB7 \u9EDE\u9078\u6CD5\u898F\u540D\u7A31\u53EF\u6AA2\u8996\u5B8C\u6574\u689D\u6587":y?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u6B04\u4F4D\u6A19\u984C\u53EF\u6392\u5E8F":v?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u4F9D\u76F8\u4F3C\u5EA6\u6392\u5E8F":""}</span>
    </div>
    <div class="table-wrap">
      <table class="data-table${i?" is-compact":""}">
        <thead>${_}<tr>
          <th scope="col" class="cell-index-head">#</th>
          ${o.map(g=>Rr(g,y,w,t,s,a)).join("")}
        </tr></thead>
        <tbody>
          ${l.map((g,k)=>`<tr>
                <td class="cell-mono cell-empty cell-index">${m+k+1}</td>
                ${o.map(F=>{if((y||v)&&F.key==="jid")return`<td class="cell-jid">${Nr(g)}</td>`;let Y=b&&F.key==="law_name"?Ir(e,g):null;if(Y)return`<td>${Pr(g,F,Y)}</td>`;let X={date:"cell-date",datetime:"cell-datetime",duration:"cell-duration",number:"cell-number"}[F.type];return`<td${X?` class="${X}"`:""}>${as(g[F.key],F.type||"text")}</td>`}).join("")}
              </tr>`).join("")}
        </tbody>
      </table>
    </div>`:`<div class="report-table-head">
        <span class="report-section-title">\u8CC7\u6599\u5217</span>
        <span class="muted" style="font-size:10px">0 rows</span>
      </div>
      ${Fe({iconName:"filter",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u8CC7\u6599",text:"\u653E\u5BEC\u65E5\u671F\u5340\u9593\u3001\u964D\u4F4E\u689D\u6587\u6578\u4E0B\u9650\uFF0C\u6216\u6E05\u9664\u95DC\u9375\u5B57\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}`:`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">\u6B64\u8CC7\u6599\u4F86\u6E90\u6C92\u6709\u8868\u683C\u6B04\u4F4D</span>
    </div>`}function Br(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,r=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${r} \u9801 \xB7
      \u986F\u793A ${c(i)}\u2013${c(o)} / ${c(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${tn.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${u("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=r?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${u("chevronRight",13)}</button>
    </div>
  </div>`}function rn(e){return!Array.isArray(e)||!e.length?"":`<div class="warnings">${e.map(t=>`<div class="warning-line">${n(t)}</div>`).join("")}</div>`}function ps(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.columns)?e.columns:[],a=Array.isArray(e.summary)?e.summary:[],r=Array.isArray(e.distribution)?e.distribution:[],i=Number(e.total)||0,o=e.query_text||"",l=e.database||"",m=e.status||"ok",b=e.meta?.table_label||e.table||e.label||"query result";return`<div class="report-card" data-database="${n(l)}">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT \xB7 ${n(String(l).toUpperCase())}</div>
        <div class="report-title">
          ${n(e.label||l)}
          ${ke(m)}
          <span class="chip">${n(b)}</span>
        </div>
        <div class="report-sub">
          ${c(i)} \u7B46\u7B26\u5408 \xB7
          ${ne(e.duration_ms)} \xB7
          ${n(String(l).toUpperCase())} / ${n(String(e.table||"\u2014"))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${u("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${u("file",14)}<span>JSON</span></button>
      </div>
    </div>

    ${e.message?`<div class="report-alert">${pe({tone:m==="not_configured"?"info":m==="danger"?"danger":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n(e.message)})}</div>`:""}

    ${a.length?`<div class="summary-strip">
            ${a.slice(0,4).map(y=>`<div class="summary-item">
                  <div class="summary-label">${n(y.label)}</div>
                  <div class="summary-value">${n(y.value)}</div>
                </div>`).join("")}
          </div>`:""}

    <div class="report-grid">
      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u7D50\u679C\u5206\u5E03</span>
          <span class="muted" style="font-size:9.5px">${r.length} groups</span>
        </div>
        ${jr(r)}
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
        ${rn(e.warnings)}
      </div>
    </div>

    ${s.length||t.length?nn(e,{compact:!0,sortableAll:!0,searchValues:e.meta?.searchable?e.meta.column_filters||{}:null}):""}
    ${i||s.length?Br({...e,total:i,page:Number(e.page)||1,page_size:Number(e.page_size)||25}):""}
  </div>`}function Ya(e){return`<div class="report-card schema-preview">
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
  </div>`}function Zs(e,t,{columnFilters:s={},searchEnabled:a=!1}={}){let r=Array.isArray(e.columns)?e.columns:[],i=Array.isArray(e.rows)?e.rows:[],o=e.message?`<div class="report-alert">${pe({tone:e.status==="ok"?"info":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n(e.message)})}</div>`:"";return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW \xB7 ${n(String(e.database||"").toUpperCase())}</div>
        <div class="report-title">
          ${n(t||e.table||"\u8CC7\u6599\u8868")}
          ${ke(e.status||"ok")}
        </div>
        <div class="report-sub">
          ${n(String(e.database||""))} / ${n(String(e.table||"\u2014"))} \xB7 ${r.length} \u6B04\u4F4D \xB7 \u524D ${i.length} \u7B46
        </div>
      </div>
    </div>
    ${o}
    ${nn({...e,page:1,page_size:10},{useColumnKeys:!0,sortable:!0,sortableAll:!0,searchValues:a?s:null})}
    ${rn(e.warnings)}
    <div class="schema-preview-footer">
      <span>\u9810\u89BD\u524D ${c(i.length)} \u7B46</span>
      <strong>\u5171 ${c(e.total)} \u7B46</strong>
    </div>
  </div>`}function Xa(e,t){return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW</div>
        <div class="report-title">${n(t||"\u8CC7\u6599\u8868")}</div>
        <div class="report-sub">\u7121\u6CD5\u8B80\u53D6\u8CC7\u6599\u8868\u9810\u89BD\u3002</div>
      </div>
    </div>
    ${pe({tone:"danger",title:"\u8B80\u53D6\u5931\u6557",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
  </div>`}function Or(e){return`<div class="report-empty">
    ${Fe({iconName:"table",title:"\u9078\u64C7\u8CC7\u6599\u8868\u9810\u89BD",text:`\u5F9E\u5DE6\u5074 ${ms(e)} \u7684 Schema \u6E05\u55AE\u9EDE\u9078\u8CC7\u6599\u8868\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6B04\u4F4D\u540D\u7A31\u3001\u524D 10 \u7B46\u8CC7\u6599\u8207\u7E3D\u7B46\u6578\u3002`})}
  </div>`}function ea(e){return e.is_current===!0?ke("ok","\u73FE\u884C"):e.law_abandon_note?ke("empty","\u5DF2\u5EE2\u6B62"):e.is_current===!1?ke("empty","\u6B77\u53F2\u7248\u672C"):ke("not_configured","\u72C0\u614B\u672A\u63D0\u4F9B")}function Me(e,t){return`<div class="law-meta-item">
    <div class="law-meta-label">${n(e)}</div>
    <div class="law-meta-value">${t||"\u2014"}</div>
  </div>`}function wt(e){return e?Ze(e):"\u2014"}function Dr(e){return e?.meta?.metadata_source==="postgresql"?"PostgreSQL metadata":e?.meta?.metadata_source==="parquet"?"Parquet snapshot":"\u2014"}function ta(e,t){return t?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">${n(e)}</span>
    </div>
    <div class="law-text-block">${n(String(t).trim())}</div>
  </div>`:""}function Fr(e,t,{open:s=!1}={}){return t?`<details class="report-section law-disclosure" data-law-history ${s?"open":""}>
    <summary class="law-disclosure-summary">
      <span class="report-section-title">${n(e)}</span>
      <span class="law-disclosure-hint">\u9810\u8A2D\u6536\u5408 \xB7 \u9EDE\u64CA\u5C55\u958B</span>
      ${u("chevronDown",14,"law-disclosure-chevron")}
    </summary>
    <div class="law-text-block">${n(String(t).trim())}</div>
  </details>`:""}function Hr(e){let t=Array.isArray(e)?e:[],s=t.map(a=>{let r=a?.name||a?.url||"";return r?a.url?`<a class="law-attachment" href="${n(a.url)}" target="_blank" rel="noopener noreferrer">
          ${u("file",12)}<span>${n(r)}</span>${u("external",11)}
        </a>`:`<span class="law-attachment">${u("file",12)}<span>${n(r)}</span></span>`:""}).filter(Boolean).join("");return s?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">\u9644\u4EF6</span>
      <span class="muted">${c(t.length)}</span>
    </div>
    <div class="law-attachment-list">${s}</div>
  </div>`:""}function on(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function zr(e){let t=Array.isArray(e.articles)?e.articles:[],s=t.filter(o=>o.article_type==="C").length,a=t.length-s,r=s?`${c(a)} \u689D \xB7 ${c(s)} \u7AE0\u7BC0`:`${c(a)} \u689D`,i=t.map(o=>{let l=String(o.article_content||"").trim();if(!l)return"";if(o.article_type==="C")return`<div class="law-chapter">${n(l)}</div>`;let m=_r[o.article_type]||o.article_type;return`<article class="law-article"
        data-article-no="${n(on(o.article_no))}">
        <div class="law-article-head">
          <span class="law-article-no">${n(o.article_no||"\u689D\u6587")}</span>
          ${m&&m!=="\u689D\u6587"?`<span class="chip">${n(m)}</span>`:""}
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
  </div>`}function Ur(){return`<div class="law-jump-float">
    <input class="input law-article-jump-input law-jump-input"
      id="law-article-jump-float" type="text" inputmode="numeric"
      autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
    <button class="btn btn-secondary btn-sm" type="button"
      data-action="jump-article" data-jump-input="law-article-jump-float">\u8DF3\u81F3</button>
  </div>`}function Tt(){return`<button class="btn btn-secondary btn-sm" type="button" data-action="back-to-results">
    ${u("chevronLeft",14)}<span>\u8FD4\u56DE\u67E5\u8A62\u7D50\u679C</span>
  </button>`}function Jr(e){return`<div class="law-report">
    <div class="law-report-topbar">
      ${Tt()}
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
  </div>`}function Qr(e,t){return`<div class="law-report">
    <div class="law-report-topbar">
      ${Tt()}
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
        ${pe({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function Gr(e){let t=Array.isArray(e.versions)?e.versions:[];if(t.length<1)return"";let s=e.selected_version_id??"";return`<label class="law-version-select">
    <span>\u689D\u6587\u7248\u672C</span>
    <select class="select" data-action="select-law-version" aria-label="\u9078\u64C7\u6CD5\u898F\u689D\u6587\u7248\u672C">
      ${t.map(a=>{let r=String(a.update_date||"").match(/\d{4}\/\d{1,2}\/\d{1,2}/)?.[0]||"",i=[`#${a.version_id}`,a.is_current?"\u76EE\u524D":"\u6B77\u53F2",r,a.article_count_for_law?`${c(a.article_count_for_law)} \u7B46`:"\u7121\u689D\u6587\u5FEB\u7167"].filter(Boolean).join(" \xB7 ");return`<option value="${n(a.version_id)}" ${String(a.version_id)===String(s)?"selected":""}>${n(i)}</option>`}).join("")}
    </select>
  </label>`}function Vr(e){let t=e.change_summary||{},s=Object.values(t).reduce((o,l)=>o+(Number(l)||0),0),a=Array.isArray(e.changes)?e.changes:[];if(!e.changes_available&&!s)return"";let r={added:"\u65B0\u589E",modified:"\u4FEE\u6539",removed:"\u79FB\u9664"},i=["added","modified","removed"].map(o=>`${r[o]} ${c(t[o]||0)}`).join(" \xB7 ");return`<details class="report-section law-version-changes">
    <summary>
      <span class="report-section-title">\u7248\u672C\u8B8A\u66F4</span>
      <span class="muted">${n(i)}</span>
    </summary>
    <div class="law-version-change-list">
      ${a.length?a.slice(0,20).map(o=>{let l=o.change_type==="added"?"badge-ok":o.change_type==="removed"?"badge-danger":"badge-warn",m=o.before_content?`<details><summary>\u8B8A\u66F4\u524D</summary><pre>${n(o.before_content)}</pre></details>`:"",b=o.after_content?`<details><summary>\u8B8A\u66F4\u5F8C</summary><pre>${n(o.after_content)}</pre></details>`:"";return`<div class="law-version-change">
                  <div class="law-version-change-head">
                    <span class="badge ${l}">${n(r[o.change_type]||o.change_type)}</span>
                    <strong>${n(o.article_no||o.article_key)}</strong>
                  </div>
                  ${m}${b}
                </div>`}).join(""):'<div class="report-empty-inline">\u6B64\u7248\u672C\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u8B8A\u66F4\u3002</div>'}
      ${e.changes_truncated?'<div class="report-empty-inline">\u50C5\u986F\u793A\u524D 20 \u7B46\u8B8A\u66F4\uFF1BAPI \u56DE\u50B3\u4E0A\u9650 200 \u7B46\u3002</div>':""}
    </div>
  </details>`}function Wr(e,{database:t="",lawPage:s=1,historyOpen:a=!1}={}){let r=Array.isArray(e.warnings)?e.warnings:[],i=e.law_name||e.law_key||"\u6CD5\u898F",o=(Array.isArray(e.articles)?e.articles:[]).filter(k=>k.article_type!=="C").length,l=Dr(e),m=e.meta?.articles_source==="postgresql"?"PostgreSQL \u689D\u6587\u7248\u672C":e.meta?.articles_source==="parquet"?"Parquet \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",b=e.meta?.snapshot||"",y=e.meta?.articles_source==="postgresql"&&e.selected_version_id!==null&&e.selected_version_id!==void 0?`\u689D\u6587\u7248\u672C #${e.selected_version_id}`:"",v=[l,m,y,b].filter(Boolean).join(" \xB7 "),w=e.source_type==="law"?"\u6CD5\u5F8B":e.source_type==="order"?"\u547D\u4EE4":e.source_type||"\u2014",_=e.version||{},g=[Me("\u6CD5\u898F\u4F4D\u968E",n(e.law_level||"\u2014")),Me("\u6CD5\u898F\u985E\u5225",n(e.law_category||"\u2014")),Me("\u7570\u52D5\u65E5\u671F",wt(e.law_modified_date)),Me("\u751F\u6548\u65E5\u671F",wt(e.law_effective_date)),Me("\u689D\u6587\u6578",c(e.article_count)),Me("\u8CC7\u6599\u72C0\u614B",ea(e)),Me("\u82F1\u8B6F\u540D\u7A31",n(e.eng_law_name||"\u2014")),Me("\u6CD5\u898F\u8B58\u5225",`<span class="mono">${n(e.law_key||"\u2014")}</span>`)];return _.first_seen_version_id!==null&&_.first_seen_version_id!==void 0&&g.push(Me("\u9996\u6B21\u6536\u9304\u7248\u672C",`#${n(_.first_seen_version_id)}`)),_.last_seen_version_id!==null&&_.last_seen_version_id!==void 0&&g.push(Me("\u6700\u5F8C\u6536\u9304\u7248\u672C",`#${n(_.last_seen_version_id)}`)),_.last_seen_at&&g.push(Me("\u6700\u5F8C\u6536\u9304\u6642\u9593",n(ve(_.last_seen_at)))),_.selected_version_id!==null&&_.selected_version_id!==void 0&&g.push(Me("\u689D\u6587\u7248\u672C",`#${n(_.selected_version_id)} \xB7 ${e.meta?.selected_version_is_current?"\u76EE\u524D":"\u6B77\u53F2"}`)),`<div class="law-report">
    <div class="law-report-topbar">
      ${Tt()}
      <span class="law-report-origin" title="${n(v)}">${n(v)}</span>
    </div>
    <div class="report-card law-report-card" data-database="${n(t)}">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT \xB7 ${n(String(t||l).toUpperCase())}</div>
          <div class="report-title">
            ${n(i)}
            ${ea(e)}
            <span class="chip">${n(w)}</span>
          </div>
          <div class="report-sub">
            ${n([e.law_level,e.law_category].filter(Boolean).join(" \xB7 ")||"\u2014")} \xB7 ${c(e.article_count)} \u689D \xB7 \u7570\u52D5 ${wt(e.law_modified_date)}
          </div>
        </div>
        <div class="report-actions">
          ${Gr(e)}
          ${e.law_url?`<a class="btn btn-secondary btn-sm" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">${u("external",14)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:""}
        </div>
      </div>

      ${r.length?`<div class="report-alert">${pe({tone:e.status==="degraded"?"warn":"info",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r.map(k=>n(k)).join("<br />")})}</div>`:""}

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u689D\u6587\u6578</div>
          <div class="summary-value">${c(e.article_count)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u7570\u52D5\u65E5\u671F</div>
          <div class="summary-value">${wt(e.law_modified_date)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u6CD5\u898F\u4F4D\u968E</div>
          <div class="summary-value">${n(e.law_level||"\u2014")}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u76EE\u524D\u72C0\u614B</div>
          <div class="summary-value">${ea(e)}</div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u6CD5\u898F\u8CC7\u8A0A</span>
          <span class="muted" style="font-size:9.5px">${n(l)}</span>
        </div>
        <div class="law-meta-grid">${g.join("")}</div>
      </div>

      ${Vr(e)}
      ${ta("\u6CD5\u898F\u524D\u8A00",e.law_foreword)}
      ${Fr("\u6CD5\u898F\u6CBF\u9769",e.law_histories,{open:a})}
      ${ta("\u751F\u6548\u8AAA\u660E",e.law_effective_note)}
      ${ta("\u5EE2\u6B62\u8AAA\u660E",e.law_abandon_note)}
      ${Hr(e.attachments)}
      ${zr(e)}
    </div>
    ${o>100?Ur():""}
  </div>`}function Kr(e){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${Tt()}
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
  </div>`}function Yr(e,t){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${Tt()}
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
        ${pe({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function Xr(e){let t=String(e||"").trim();return t?`<button class="law-link judgment-citation-law" type="button"
    data-action="open-law"
    data-law-key="${n(t)}"
    data-law-source=""
    data-law-name="${n(t)}"
    title="\u6AA2\u8996\u300C${n(t)}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${n(t)}${u("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}function Zr(e){let t=new Map;for(let s of Array.isArray(e.citations)?e.citations:[]){let a=String(s.law_name||"").trim();if(!a)continue;t.has(a)||t.set(a,new Set);let r=String(s.article_no||"").trim();r&&t.get(a).add(r)}return t.size?`<div class="judgment-citation-groups">
    ${[...t.entries()].map(([s,a])=>`<div class="judgment-citation-group">
          ${Xr(s)}
          <span class="judgment-citation-articles">${[...a].map(r=>n(r)).join("\u3001")||"\u2014"}</span>
        </div>`).join("")}
  </div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5F15\u7528\u660E\u7D30\u3002</div>'}function ei(e,{database:t="postgres"}={}){let s=Array.isArray(e.matched_laws)?e.matched_laws:[],a=e.title||e.jid||"\u5224\u6C7A",r=String(e.full_text||""),i=Number(e.full_text_length)||r.length||0,o=["PostgreSQL \u5224\u6C7A\u6587\u4EF6",e.source_archive].filter(Boolean).join(" \xB7 "),l=[Me("\u6848\u865F",n(e.jid||"\u2014")),Me("\u5E74\u5EA6",n(e.jyear||"\u2014")),Me("\u5B57\u5225",n(e.jcase||"\u2014")),Me("\u865F\u78BC",n(e.jno||"\u2014")),Me("\u6CD5\u9662",n(e.court||"\u2014")),Me("\u6848\u7531",n(e.title||"\u2014")),Me("\u88C1\u5224\u65E5\u671F",wt(e.jdate)),Me("\u4F86\u6E90\u58D3\u7E2E\u6A94",n(e.source_archive||"\u2014")),Me("\u5168\u6587\u9577\u5EA6",`${c(i)} \u5B57`),Me("\u5F15\u7528\u6578",c(e.citation_count))];return e.import_run_id!==null&&e.import_run_id!==void 0&&l.push(Me("\u532F\u5165 Run",`#${n(e.import_run_id)}`)),`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${Tt()}
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
            ${n(e.court||"\u2014")} \xB7 ${wt(e.jdate)} \xB7
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
          <div class="summary-value">${wt(e.jdate)}</div>
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
        ${Zr(e)}
      </div>

      <div class="report-section judgment-text-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5224\u6C7A\u539F\u6587</span>
          <span class="muted">${c(i)} \u5B57</span>
        </div>
        ${r?`<div class="judgment-fulltext">${n(r)}</div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5168\u6587\u3002</div>'}
      </div>
    </div>
  </div>`}function Za(e){return`"${(e==null?"":typeof e=="object"?JSON.stringify(e):String(e)).replace(/"/g,'""')}"`}function fs(e){let t=e.columns||[],s=e.rows||[],a=[["#",...t.map(i=>i.label||i.key)].map(Za).join(",")],r=((Number(e.page)||1)-1)*(Number(e.page_size)||25);return s.forEach((i,o)=>{a.push([r+o+1,...t.map(l=>i[l.key])].map(Za).join(","))}),`\uFEFF${a.join(`\r
`)}`}function bs(e){return{...e,rows:(e.rows||[]).map(t=>{let s={};for(let[a,r]of Object.entries(t))a.startsWith("_")||(s[a]=r);return s})}}function ti(e){return e==="rag"?"RAG \u63D0\u554F":e==="data"?"\u8CC7\u6599\u67E5\u8A62":e||"\u5176\u4ED6"}async function en(e,t){let s=performance.now(),a=sn(e,t),r=String(a.store||"query_history"),i=String(a.keyword||""),o=t.page,l=t.pageSize,m=[],b=[],y=[],v=[];if(r==="settings"){b=(await Ra({keyword:i})).map(X=>({key:X.key,value:Ia(X.value),updated_at:X.updated_at})),y=[{key:"key",label:"\u8A2D\u5B9A\u9375",type:"mono"},{key:"value",label:"\u503C",type:"longtext"},{key:"updated_at",label:"\u66F4\u65B0\u6642\u9593",type:"datetime"}];let K=new Map;b.forEach(X=>{let W=String(X.key||"").split(".")[0]||"\u5176\u4ED6";K.set(W,(K.get(W)||0)+1)}),v=Array.from(K.entries()).map(([X,W])=>({label:X,value:W})).sort((X,W)=>W.value-X.value)}else{b=(await is({keyword:i,limit:yr})).map(X=>({kind:ti(X.kind),title:X.title,detail:X.detail,created_at:X.created_at})),y=[{key:"kind",label:"\u985E\u578B",type:"text"},{key:"title",label:"\u67E5\u8A62\u5167\u5BB9",type:"longtext"},{key:"detail",label:"\u6458\u8981",type:"longtext"},{key:"created_at",label:"\u6642\u9593",type:"datetime"}];let K=new Map;b.forEach(X=>K.set(X.kind,(K.get(X.kind)||0)+1)),v=Array.from(K.entries()).map(([X,W])=>({label:X,value:W})).sort((X,W)=>W.value-X.value)}let w=b.length,_=(o-1)*l,g=b.slice(_,_+l),k=Math.round(performance.now()-s),F=Ea();return F&&m.push("IndexedDB \u7121\u6CD5\u4F7F\u7528\uFF0C\u8CC7\u6599\u66AB\u5B58\u5728\u8A18\u61B6\u9AD4\uFF0C\u91CD\u65B0\u6574\u7406\u5F8C\u6703\u6D88\u5931\u3002"),{database:"indexeddb",label:"IndexedDB",status:F?"degraded":"ok",message:F?"\u700F\u89BD\u5668\u4E0D\u5141\u8A31\u4F7F\u7528 IndexedDB\uFF0C\u672C\u9801\u6539\u7528\u8A18\u61B6\u9AD4\u66AB\u5B58\u3002":null,table:r,columns:y,rows:g,total:w,page:o,page_size:l,duration_ms:k,summary:[{label:"\u7B26\u5408\u7B46\u6578",value:String(w)},{label:"\u76EE\u524D\u9801\u9762",value:`${g.length} \u7B46`},{label:"\u5132\u5B58\u6A21\u5F0F",value:rs()==="indexeddb"?"IndexedDB":"\u8A18\u61B6\u9AD4"},{label:"\u67E5\u8A62\u8017\u6642",value:`${k} ms`}],distribution:v,query_text:`INDEXEDDB OPEN 'judgment-console'
OBJECT STORE '${r}'
FILTER ${i?`keyword \u2248 '${i}'`:"1 = 1"}
ORDER BY created_at DESC
LIMIT ${l} OFFSET ${_}`,warnings:m,meta:{store:r,filters:a,client_side:!0}}}async function si(e,t){let s=!1,a=null,r=[],i="law",o=null,l={},m=0,b=25,y="query",v=null,w=null,_=0,g=[],k=null,F=-1,Y=0,K=0,X=null,W=null,ae=null;e.innerHTML=`<section class="page data-page">
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
  </section>`;let oe=e.querySelector("#query-sidebar"),le=e.querySelector("#data-nav"),$e=e.querySelector("#db-options-wrap"),ie=e.querySelector("#filter-area"),j=e.querySelector("#schema-area"),$=e.querySelector("#query-main"),B=e.querySelector("#schema-suggest-popover"),D=e.querySelector("#catalog-meta"),x=e.querySelector("#refresh-catalog"),S=p=>r.find(f=>f.id===p),q=()=>S(i)?.databases||[],R=p=>q().find(f=>f.id===p),Q=(p,f)=>`${p}:${f}`,z=(p,f=i)=>l[Q(f,p.id)],te=(p,f)=>{os(p,f).catch(()=>{})},me=()=>{if(!a){D.textContent="CATALOG \xB7 \u96E2\u7DDA",D.className="badge badge-danger badge-mono";return}let p=q(),f=p.filter(E=>E.available).length,h=S(i);D.textContent=`CATALOG \xB7 ${h?.label||i} \xB7 ${f}/${p.length} \u53EF\u7528`,D.className="badge badge-neutral badge-mono"},Se=p=>{$.innerHTML=Mr(p)},xe=()=>{let p=W?.returnScroll??ae?.returnScroll;W=null,ae=null;let f=R(o),h=f?z(f):null;y==="schema"&&w?.result?$.innerHTML=Zs(w.result,Te(f,w.tableId),{columnFilters:w.columnFilters||{},searchEnabled:f.id==="postgres"||f.id==="parquet"}):h?.result?$.innerHTML=ps(h.result):f&&Se(f),typeof p=="number"&&window.requestAnimationFrame(()=>window.scrollTo({top:p,behavior:"smooth"}))},Je=(p="law-article-jump")=>{let f=$.querySelector(`#${p}`),h=on(f?.value);if(!h){M("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),f?.focus();return}let I=[...$.querySelectorAll("[data-article-no]")].find(C=>C.dataset.articleNo===h);if(!I){M(`\u627E\u4E0D\u5230\u7B2C ${h} \u689D\u3002`,"warn");return}I.scrollIntoView({behavior:"instant",block:"center"}),I.classList.add("is-jump-target"),window.setTimeout(()=>I.classList.remove("is-jump-target"),2400)},Re=async({lawKey:p,sourceType:f="",lawName:h="",versionId:E=""})=>{let I=R(o),C=I?z(I):null,G=y==="schema"?w?.result:null;if(!I||!C?.result&&!G||!p)return;let de=++m;W={seq:de,lawKey:p,sourceType:f,lawName:h,versionId:E?String(E):"",page:1,detail:null,database:I.id,returnScroll:window.scrollY},ae=null,$.innerHTML=Jr(h||p),$.scrollIntoView({behavior:"smooth",block:"start"});try{let he=await U.lawDetail(p,f,W.versionId);if(s||!W||W.seq!==de)return;W.detail=he,W.page=1,$.innerHTML=Wr(he,{database:W.database,lawPage:W.page})}catch(he){if(s||!W||W.seq!==de)return;$.innerHTML=Qr(he,h||p),M(he.message||"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868\u3002","danger")}},je=async({jid:p})=>{let f=R(o),h=f?z(f):null,E=y==="schema"?w?.result:null;if(!f||!h?.result&&!E||!p)return;let I=++m;W=null;let C=f.id==="parquet"?"parquet":"postgres";ae={seq:I,jid:p,detail:null,database:f.id,source:C,returnScroll:window.scrollY},$.innerHTML=Kr(p),$.scrollIntoView({behavior:"smooth",block:"start"});try{let G=await U.judgmentDetail(p,C);if(s||!ae||ae.seq!==I)return;ae.detail=G,$.innerHTML=ei(G,{database:ae.database})}catch(G){if(s||!ae||ae.seq!==I)return;$.innerHTML=Yr(G,p),M(G.message||"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587\u3002","danger")}},Ne=(p,f)=>`${i}:${p.id}:${f}`,Te=(p,f)=>(p.tables||[]).find(h=>h.id===f)?.label||f,A=(p,f,{sort:h=null,columnFilters:E={}}={})=>{let I={column_filters:E};return p.id==="postgres"?(I.table=f,I.schema_preview=!0):p.id==="parquet"&&i==="judgment"?(I.table="judgment_documents",I.columns=wr):p.id==="parquet"&&(I.dataset="all",I.columns=$r),h?.key&&(I.sort=`${h.key}:${h.direction}`),I},L=async(p,f,{sort:h=null,columnFilters:E={}}={})=>{if(!f)return;qe();let I=Ne(p,f),C=++_;v={tableId:f},w={key:I,tableId:f,loading:!0,result:null,error:null,sort:h,columnFilters:E},j.innerHTML=Xs(p,S(i)?.label||i,f),$.innerHTML=Ya(Te(p,f));try{let G;if(p.id==="indexeddb"){let de=ds(p,10);de.values.store=f,de.page=1,G=await en(p,de)}else p.id==="qdrant"?G={database:"qdrant",label:"Qdrant",status:"not_configured",message:"Qdrant collection \u9700\u8981\u8A9E\u610F\u67E5\u8A62\uFF1BSchema \u50C5\u63D0\u4F9B collection \u540D\u7A31\uFF0C\u4E0D\u5217\u51FA\u524D 10 \u7B46\u8CC7\u6599\u3002",table:f,columns:[],rows:[],total:0,page:1,page_size:10,duration_ms:0,summary:[],distribution:[],query_text:"",warnings:[],meta:{}}:(G=await U.query({database:p.id,filters:A(p,f,{sort:h,columnFilters:E}),page:1,pageSize:10}),h?.key&&(G.meta={...G.meta||{},sort:h}));if(s||C!==_)return;w={key:I,tableId:f,loading:!1,result:G,error:null,sort:h,columnFilters:E},y==="schema"&&v?.tableId===f&&(j.innerHTML=Xs(p,S(i)?.label||i,f),$.innerHTML=Zs(G,Te(p,f),{columnFilters:E,searchEnabled:p.id==="postgres"||p.id==="parquet"}))}catch(G){if(s||C!==_)return;w={key:I,tableId:f,loading:!1,result:null,error:G,sort:h,columnFilters:E},y==="schema"&&v?.tableId===f&&($.innerHTML=Xa(G,Te(p,f)))}},N=()=>{let p=R(o);if(!p)return null;if(y==="schema"&&w?.result)return{db:p,tableId:w.tableId,columnFilters:w.columnFilters||{},sort:w.sort||null,mode:"schema"};let f=p?z(p):null,h=f?.result;return h&&(p.id==="postgres"||p.id==="parquet")?{db:p,tableId:h.table,columnFilters:f.columnFilters||{},sort:f.sort||null,mode:"query"}:null},O=(p,f,h)=>{if(!p)return;let E=`${p.db.id}:${p.tableId}:${f}`,I=se.get(E);I&&(window.clearTimeout(I),se.delete(E)),qe();let C={...p.columnFilters||{}},G=String(h||"").trim();if(G?C[f]=G:delete C[f],p.mode==="schema"){L(p.db,p.tableId,{sort:p.sort,columnFilters:C});return}let de=z(p.db);de.columnFilters=C,de.page=1,De(1)},se=new Map,H=()=>{Y+=1,g=[],k=null,F=-1,B&&(B.hidden=!0,B.innerHTML="")},fe=(p,f)=>{let h=String(p||""),E=h.toLocaleLowerCase(),I=String(f||"").toLocaleLowerCase(),C=new Array(h.length).fill(!1),G=(we,Be)=>{for(let Pe=we;Pe<we+Be;Pe+=1)Pe>=0&&Pe<C.length&&(C[Pe]=!0)},de=E.indexOf(I);if(de>=0)for(;de>=0;)G(de,I.length),de=E.indexOf(I,de+I.length);else{let we=[];for(let Be of I.match(/[一-鿿]{2,}/g)||[])for(let Pe=0;Pe<Be.length-1;Pe+=1)we.push(Be.slice(Pe,Pe+2));we.push(...I.match(/[a-z0-9]+/g)||[]);for(let Be of we){let Pe=E.indexOf(Be);for(;Pe>=0;)G(Pe,Be.length),Pe=E.indexOf(Be,Pe+Be.length)}}let he="",ye=0;for(;ye<h.length;)if(C[ye]){let we=ye;for(;we<h.length&&C[we];)we+=1;he+=`<mark>${n(h.slice(ye,we))}</mark>`,ye=we}else{let we=ye;for(;we<h.length&&!C[we];)we+=1;he+=n(h.slice(ye,we)),ye=we}return he||n(h)},Z=(p,f)=>{if(!B)return;let h=p.getBoundingClientRect(),E=Math.min(420,Math.max(220,h.width)),I=Math.min(360,34+f*30),C=h.bottom+4;C+I>window.innerHeight-8&&(C=Math.max(8,h.top-I-4));let G=Math.min(window.innerWidth-E-8,Math.max(8,h.left));B.style.width=`${E}px`,B.style.left=`${G}px`,B.style.top=`${C}px`},Ie=p=>{if(!B)return;let f=[...B.querySelectorAll(".schema-suggest-item")];f.length&&(F=Math.max(0,Math.min(f.length-1,p)),f.forEach((h,E)=>{h.classList.toggle("is-active",E===F)}),f[F].scrollIntoView({block:"nearest"}))},J=p=>{let f=g[p],h=k;!f||!h||(H(),O(h,h.column,f))},ce=async(p,f,h,E)=>{if(!p||!h.trim()){H();return}let I=++Y;k={...p,column:f,input:E},F=-1;try{let C=await U.schemaSuggest({database:p.db.id,table:p.tableId,column:f,query:h,limit:1e3});if(I!==Y||document.activeElement!==E||!B)return;let G=Array.isArray(C.values)?C.values:[];if(g=G,!G.length){H();return}let de=Number(C.total)>G.length?`\u5171 ${c(C.total)} \u500B\u7B26\u5408\uFF0C\u986F\u793A\u524D ${c(G.length)} \u500B`:`\u5171 ${c(C.total)} \u500B\u7B26\u5408`;B.innerHTML=`<div class="schema-suggest-head">${n(de)}</div>${G.map((he,ye)=>`<button class="schema-suggest-item" type="button"
            data-schema-suggest-index="${ye}"
            title="${n(he)}">${fe(he,h)}</button>`).join("")}`,Z(E,G.length),B.hidden=!1}catch{H()}},qe=()=>{let p=document.activeElement;p instanceof HTMLElement&&p.matches("[data-schema-search]")&&p.blur(),H()},Le=(p,{resetReport:f=!1}={})=>{qe();let h=z(p);if(le.innerHTML=Ka(i,y),$e.innerHTML=xr(q(),p.id),y==="schema")ie.hidden=!0,ie.innerHTML="",j.hidden=!1,j.innerHTML=`<div class="schema-category-switch" role="tablist" aria-label="Schema \u985E\u5225">
        ${["law","judgment"].map(E=>{let I=r.find(C=>C.id===E);return I?`<button class="chip${i===E?" is-active":""}" type="button" role="tab" aria-selected="${i===E}" data-action="schema-category" data-category="${E}">${n(I.label)}</button>`:""}).join("")}
      </div>${Xs(p,S(i)?.label||i,v?.tableId||"")}`;else{j.hidden=!0,j.innerHTML="",ie.hidden=!1;let E=Ar(i,p,h),I=Wa(p,h);ie.innerHTML=`${qr(p)}${E?`${E}<details class="data-advanced"><summary>\u9032\u968E metadata \u689D\u4EF6</summary>${I}</details>`:I}<div class="sidebar-note">${Lr(p)}</div>`}if(me(),y==="schema"){let E=v?Ne(p,v.tableId):"";if(w&&w.key===E){let I=Te(p,w.tableId);w.loading?$.innerHTML=Ya(I):w.error?$.innerHTML=Xa(w.error,I):$.innerHTML=Zs(w.result,I,{columnFilters:w.columnFilters||{},searchEnabled:p.id==="postgres"||p.id==="parquet"})}else $.innerHTML=Or(p);return}f?Se(p):h.result?$.innerHTML=ps(h.result):Se(p)},ot=(p,{persist:f=!0,resetReport:h=!1}={})=>{let E=q(),I=E.find(G=>G.id===p)||E[0];if(!I)return;W=null,ae=null,v=null,w=null,_+=1,o=I.id;let C=Q(i,I.id);l[C]||(l[C]=ds(I,b)),Le(I,{resetReport:h}),f&&(te(`data.last_database.${i}`,I.id),te("data.last_category",i))},gt=(p,{persist:f=!0,resetReport:h=!0,databaseId:E=null}={})=>{let I=S(p)||r[0];if(!I)return;i=I.id,W=null,ae=null;let C=I.databases||[],G=E&&C.find(de=>de.id===E)||C.find(de=>de.id===o)||C[0];if(o=G?.id||null,!G){le.innerHTML=Ka(i,y),$e.innerHTML=`<div class="sidebar-notice">${pe({tone:"warn",title:"\u6C92\u6709\u53EF\u7528\u7684\u8CC7\u6599\u4F86\u6E90",text:"\u9019\u500B\u985E\u5225\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u5EAB\u9078\u9805\u3002"})}</div>`,ie.innerHTML="",me();return}ot(G.id,{persist:!1,resetReport:h}),f&&(te("data.last_category",I.id),te(`data.last_database.${I.id}`,G.id))},It=p=>{let f=z(p),h=ie.querySelector("#data-filter-form");h&&(f.values=us(h,p,f))},De=async(p=null)=>{let f=R(o);if(!f)return;qe();let h=z(f);It(f),p!==null&&(h.page=p),(!Number.isFinite(h.page)||h.page<1)&&(h.page=1);let E=++m;W=null,ae=null,$.innerHTML=Ut(f);let I=ie.querySelector("#run-query");ge(I,!0,"\u67E5\u8A62\u4E2D\u2026");try{let C;if(f.id==="indexeddb"?C=await en(f,h):C=await U.query({database:f.id,filters:Ys(f,h),page:h.page,pageSize:h.pageSize}),s||E!==m)return;C.meta={...C.meta||{},column_filters:h.columnFilters||{},searchable:f.id==="postgres"||f.id==="parquet",sort:h.sort||C.meta?.sort||null},h.result=C,h.page=Number(C.page)||h.page,h.pageSize=Number(C.page_size)||h.pageSize,$.innerHTML=ps(C);let G=S(i)?.label||i;await Dt({kind:"data",title:`${G} \xB7 ${f.label} \xB7 ${C.table||C.label||"query"}`,detail:`${c(C.total)} \u7B46 \xB7 ${ne(C.duration_ms)}`,payload:{category:i,database:f.id,filters:Ys(f,h),page:h.page,page_size:h.pageSize}}),te("data.last_query",{category:i,database:f.id,filters:Ys(f,h),page:h.page,page_size:h.pageSize,at:new Date().toISOString()})}catch(C){if(s||E!==m)return;$.innerHTML=gs(C,f),M(C.message||"\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{!s&&E===m&&ge(I,!1)}},As=(p,f)=>{let h=p?.querySelector("[data-data-fuzzy-results]");h&&(h.innerHTML=f.length?f.map(E=>`<button class="data-fuzzy-option" type="button" role="option" data-action="select-fuzzy-term" data-term="${n(E.value)}"><span>${n(E.label||E.value)}</span><small>${n(E.meta||"")}</small></button>`).join(""):'<div class="data-fuzzy-empty">\u6C92\u6709\u76F8\u8FD1\u7D50\u679C\uFF1B\u6309 Enter \u53EF\u76F4\u63A5\u52A0\u5165\u76EE\u524D\u8F38\u5165\u7684\u95DC\u9375\u5B57\u3002</div>')},Xt=async(p,f="")=>{if(!p)return;let h=R(o),E=h?z(h):null;if(!E)return;let I=p.dataset.fuzzyKind||i,C=p.querySelector("[data-data-fuzzy-results]"),G=++K;C&&(C.innerHTML='<div class="data-fuzzy-loading"><span class="spinner"></span><span>\u641C\u5C0B\u76F8\u8FD1\u7D50\u679C\u2026</span></div>');try{let de=await U.dataSuggest({kind:I,query:f,limit:12});if(G!==K)return;let he=(de.suggestions||[]).filter(ye=>!E.fuzzyTerms.includes(ye.value));As(p,he)}catch(de){if(G!==K)return;C&&(C.innerHTML=`<div class="data-fuzzy-empty">${n(de.message||"\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},Zt=(p,{focus:f=!1}={})=>{if(!p)return;let h=p.querySelector("[data-data-fuzzy-popover]"),E=p.querySelector("[data-data-fuzzy-search]");!h||!E||(h.hidden&&(h.hidden=!1,E.value="",Xt(p,"")),f&&(E.focus(),E.select()))},qt=p=>{X&&(window.clearTimeout(X),X=null);let f=p?.querySelector("[data-data-fuzzy-popover]");f&&(f.hidden=!0)},es=async p=>{let f=R(o);if(!f)return;let h=z(f),E=String(p||"").trim();!E||h.fuzzyTerms.includes(E)||(h.fuzzyTerms=[...h.fuzzyTerms,E],qt(ie.querySelector("[data-data-fuzzy]")),Le(f),await De(1))},Ls=async p=>{let f=R(o);if(!f)return;let h=z(f),E=String(p||"").trim();h.fuzzyTerms=h.fuzzyTerms.filter(I=>I!==E),Le(f),await De(1)},Pt=async()=>{x.disabled=!0,ge(x,!0,"\u6574\u7406\u4E2D\u2026");try{let[p,f,h,E,I]=await Promise.all([U.catalog(),ht("data.last_category","law"),ht("data.last_database.law","postgres"),ht("data.last_database.judgment","postgres"),ht("data.page_size",25)]);if(s)return;a=p,r=Array.isArray(a.categories)?a.categories:[],b=tn.includes(Number(I))?Number(I):25;for(let ye of r)for(let we of ye.databases||[]){let Be=Q(ye.id,we.id);l[Be]||(l[Be]=ds(we,b))}let C=r.find(ye=>ye.id===f)||r[0];if(!C){le.innerHTML="",$e.innerHTML=`<div class="sidebar-notice">${pe({tone:"danger",title:"\u6C92\u6709\u53EF\u7528\u7684\u5206\u985E",text:"Catalog \u6C92\u6709\u56DE\u50B3\u6CD5\u898F\u547D\u4EE4\u6216\u5224\u6C7A\u5206\u985E\u3002"})}</div>`;return}let G=C.id==="judgment"?E:h;if(i=C.id,o=null,gt(C.id,{persist:!1,resetReport:!0,databaseId:G}),s)return;let de=R(o),he=de?z(de):null;de&&he&&y==="query"&&!he.result&&(de.id==="postgres"||de.id==="parquet")&&De(1),M("\u8CC7\u6599\u5EAB catalog \u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(p){if(s)return;a=null,r=[],le.innerHTML="",me(),$e.innerHTML=`<div class="sidebar-notice">${pe({tone:"danger",title:"\u7121\u6CD5\u8B80\u53D6 catalog",text:n(p.message||"\u8ACB\u78BA\u8A8D API \u662F\u5426\u555F\u52D5\u3002")})}
      <button class="btn btn-secondary btn-sm" type="button" id="catalog-retry" style="margin-top:10px">
        ${u("refresh",14)}<span>\u91CD\u8A66</span>
      </button></div>`,$.innerHTML=`<div class="report-empty">${Fe({iconName:"server",title:"API \u76EE\u524D\u7121\u6CD5\u9023\u7DDA",text:"\u67E5\u8A62\u5831\u8868\u9700\u8981 FastAPI \u63D0\u4F9B catalog \u8207\u8CC7\u6599\u67E5\u8A62 API\u3002\u8ACB\u78BA\u8A8D judgment-web \u5DF2\u555F\u52D5\u3002"})}</div>`}finally{s||(x.disabled=!1,ge(x,!1))}};oe.addEventListener("change",p=>{let f=p.target;if(f.name==="category"){gt(f.value);return}if(f.name==="database"){ot(f.value);let C=R(o),G=C?z(C):null;C&&G&&!G.result&&y==="query"&&(C.id==="postgres"||C.id==="parquet")&&De(1);return}let h=R(o);if(!h)return;let E=z(h),I=ie.querySelector("#data-filter-form");!I||!f.name||(E.values=us(I,h,E),E.page=1,f.name==="table"&&(W=null,ae=null,E.sort=null,E.columnFilters={},E.result=null,ie.innerHTML=Wa(h,E),Se(h)))}),oe.addEventListener("input",p=>{let f=p.target.closest("[data-data-fuzzy-search]");if(f){let C=f.closest("[data-data-fuzzy]");X&&window.clearTimeout(X),X=window.setTimeout(()=>{Xt(C,f.value)},160);return}let h=R(o);if(!h)return;let E=ie.querySelector("#data-filter-form");if(!E||!p.target.name||p.target.name==="table")return;let I=z(h);I.values=us(E,h,I)}),oe.addEventListener("keydown",p=>{let f=p.target.closest("[data-data-fuzzy-search]");if(!f)return;let h=f.closest("[data-data-fuzzy]");if(p.key==="Escape")p.preventDefault(),qt(h),f.blur();else if(p.key==="Enter"){p.preventDefault();let E=h?.querySelector("[data-action='select-fuzzy-term']");E?E.click():es(f.value)}else p.key==="ArrowDown"&&(p.preventDefault(),h?.querySelector("[data-action='select-fuzzy-term']")?.focus())}),oe.addEventListener("mouseover",p=>{let f=p.target.closest("[data-action='open-fuzzy']");f&&Zt(f.closest("[data-data-fuzzy]"))}),oe.addEventListener("mouseout",p=>{let f=p.target.closest("[data-data-fuzzy]");f&&(p.relatedTarget&&f.contains(p.relatedTarget)||qt(f))}),oe.addEventListener("submit",p=>{p.target.id==="data-filter-form"&&(p.preventDefault(),De(1))}),oe.addEventListener("click",async p=>{let f=ie.querySelector("[data-data-fuzzy] [data-data-fuzzy-popover]:not([hidden])")?.closest("[data-data-fuzzy]");f&&!p.target.closest("[data-data-fuzzy]")&&qt(f);let h=p.target.closest("[data-action]"),E=h?.dataset.action;if(E==="data-nav"){let I=h.dataset.tab,C=R(o);if(I==="schema"){if(y!=="schema"){if(C){let ye=z(C),we=ie.querySelector("#data-filter-form");we&&(ye.values=us(we,C,ye))}y="schema",C&&Le(C)}return}let G=I==="judgment"?"judgment":"law";y==="schema"&&(y="query"),i!==G?gt(G,{databaseId:o,resetReport:!1}):C&&Le(C);let de=R(o),he=de?z(de):null;de&&he&&!he.result&&(de.id==="postgres"||de.id==="parquet")&&De(1);return}if(E==="open-fuzzy"){Zt(h.closest("[data-data-fuzzy]"),{focus:!0});return}if(E==="select-fuzzy-term"){await es(h.dataset.term);return}if(E==="remove-fuzzy-term"){await Ls(h.dataset.term);return}if(E==="schema-category"){y="schema",gt(h.dataset.category||"law",{resetReport:!0});return}if(E==="select-schema-table"){let I=R(o);if(!I)return;L(I,h.dataset.tableId||"");return}if(E==="reset"){let I=R(o);if(!I)return;W=null,ae=null;let C=z(I);l[Q(i,I.id)]=ds(I,C.pageSize),Le(I),Se(I),M("\u5DF2\u91CD\u8A2D\u9019\u500B\u8CC7\u6599\u5EAB\u7684\u67E5\u8A62\u689D\u4EF6\u3002","info",2400);return}p.target.closest("#catalog-retry")&&Pt()}),$.addEventListener("input",p=>{let f=p.target.closest("[data-schema-search]");if(!f)return;let h=N();if(!h)return;let E=f.dataset.schemaSearch||"",I=f.value,C=`${h.mode}:${h.db.id}:${h.tableId}:${E}`,G=se.get(C);if(G&&window.clearTimeout(G),!I.trim()){se.delete(C),H(),O(h,E,"");return}let de=window.setTimeout(()=>{se.delete(C),ce(h,E,I,f)},250);se.set(C,de)}),$.addEventListener("keydown",p=>{let f=p.target.closest("[data-schema-search]");if(!f)return;let h=N();if(h){if(p.key==="Escape"){H();return}if(p.key==="ArrowDown"||p.key==="ArrowUp"){if(!B||B.hidden)return;p.preventDefault();let E=p.key==="ArrowDown"?1:-1;Ie(F<0?E>0?0:g.length-1:F+E);return}if(p.key==="Enter"){if(p.preventDefault(),B&&!B.hidden&&F>=0){J(F);return}O(h,f.dataset.schemaSearch||"",f.value)}}}),B?.addEventListener("mousedown",p=>{p.preventDefault()}),B?.addEventListener("click",p=>{let f=p.target.closest("[data-schema-suggest-index]");f&&J(Number(f.dataset.schemaSuggestIndex))});let Bt=p=>{p.target.closest("[data-schema-search]")||B?.contains(p.target)||H()};return document.addEventListener("click",Bt),window.addEventListener("scroll",H,!0),window.addEventListener("resize",H),$.addEventListener("keydown",p=>{p.target.matches(".law-jump-input")&&p.key==="Enter"&&(p.preventDefault(),Je(p.target.id))}),$.addEventListener("click",async p=>{let f=p.target.closest("[data-action]");if(!f)return;let h=f.dataset.action,E=R(o),I=E?z(E):null,C=I?.result;if(h==="back-to-results"){xe();return}if(h==="open-law"){Re({lawKey:f.dataset.lawKey||"",sourceType:f.dataset.lawSource||"",lawName:f.dataset.lawName||""});return}if(h==="open-judgment"){je({jid:f.dataset.jid||""});return}if(h==="jump-article"){Je(f.dataset.jumpInput||"law-article-jump");return}if(h==="sort-column"){let G=f.dataset.sortKey||"";if(!G||!E)return;if(y==="schema"&&w?.result){let ye=w.sort,we=G==="jdate"||G==="law_modified_date"||G==="article_count"||G==="citation_count"||G==="full_text_length"||G==="created_at"||G==="updated_at",Be=ye?.key===G?ye.direction==="asc"?"desc":"asc":we?"desc":"asc";L(E,w.tableId,{sort:{key:G,direction:Be},columnFilters:w.columnFilters||{}});return}if(!I)return;let de=I.sort,he=de?.key===G?de.direction==="asc"?"desc":"asc":G==="jdate"?"desc":"asc";I.sort={key:G,direction:he},De(1);return}if(h==="retry"){De(I?.page||1);return}if(C){if(h==="prev-page"){De(Math.max(1,Number(C.page)-1));return}if(h==="next-page"){let G=Math.max(1,Math.ceil(Number(C.total)/Number(C.page_size)));De(Math.min(G,Number(C.page)+1));return}if(h==="copy-query"){let G=await Mt(C.query_text||"");M(G?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",G?"ok":"warn");return}if(h==="export-json"){let G=`${C.database}-${C.table||"query"}-page-${C.page}.json`;tt(G,JSON.stringify(bs(C),null,2),"application/json;charset=utf-8"),M(`\u5DF2\u532F\u51FA ${G}`,"ok");return}if(h==="export-csv"){let G=`${C.database}-${C.table||"query"}-page-${C.page}.csv`;tt(G,fs(C),"text/csv;charset=utf-8"),M(`\u5DF2\u532F\u51FA ${G}`,"ok")}}}),$.addEventListener("change",p=>{let f=p.target.closest("[data-action='select-law-version']");if(f&&W){Re({lawKey:W.lawKey,sourceType:W.sourceType,lawName:W.lawName,versionId:f.value});return}if(!p.target.matches("[data-page-size]"))return;let h=R(o);if(!h)return;let E=z(h);E.pageSize=Number(p.target.value)||25,E.page=1,te("data.page_size",E.pageSize),De(1)}),x.addEventListener("click",()=>{Pt()}),await Pt(),t&&typeof t.setTitle=="function"&&t.setTitle("\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"),()=>{s=!0,X&&window.clearTimeout(X);for(let p of se.values())window.clearTimeout(p);se.clear(),H(),document.removeEventListener("click",Bt),window.removeEventListener("scroll",H,!0),window.removeEventListener("resize",H)}}var dn=[10,25,50,100],ai=[{value:"started_at:desc",label:"Timestamp \u65B0 \u2192 \u820A"},{value:"started_at:asc",label:"Timestamp \u820A \u2192 \u65B0"},{value:"duration_ms:desc",label:"\u8017\u6642\u591A \u2192 \u5C11"},{value:"duration_ms:asc",label:"\u8017\u6642\u5C11 \u2192 \u591A"}];function na(){return{process:"",module:"",status:"",method:"",model:"",keyword:"",from_date:"",to_date:"",min_duration:"",sort:"started_at:desc"}}function ni(e,t=e){return`<option value="${n(e)}">${n(t)}</option>`}function Jt(e,t,s,a,r=""){return`<div class="field">
    <label class="field-label" for="performance-${e}">
      <span>${n(t)}</span>
      <span class="field-tag">${n(e)}</span>
    </label>
    <select class="select" id="performance-${e}" name="${n(e)}">
      ${ni("","\u5168\u90E8")}
      ${s.map(i=>`<option value="${n(i)}" ${String(i)===String(a)?"selected":""}>${n(i)}</option>`).join("")}
    </select>
    ${r?`<span class="field-help">${n(r)}</span>`:""}
  </div>`}function ri(e,t){let s=ai.map(a=>`<option value="${a.value}" ${a.value===t.sort?"selected":""}>${a.label}</option>`).join("");return`
    ${Jt("process","\u7A0B\u5E8F",e.processes||[],t.process)}
    ${Jt("module","\u6A21\u7D44",e.modules||[],t.module)}
    ${Jt("model","\u6A21\u578B",e.models||[],t.model)}
    ${Jt("status","\u72C0\u614B",e.statuses||[],t.status)}
    ${Jt("method","\u65B9\u6CD5",e.methods||[],t.method)}
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
    </div>`}function ln(){let e=document.getElementById("performance-filter-form");if(!e)return na();let t=new FormData(e);return{process:String(t.get("process")||""),module:String(t.get("module")||""),status:String(t.get("status")||""),method:String(t.get("method")||""),model:String(t.get("model")||""),keyword:String(t.get("keyword")||"").trim(),from_date:String(t.get("from_date")||""),to_date:String(t.get("to_date")||""),min_duration:String(t.get("min_duration")||""),sort:String(t.get("sort")||"started_at:desc")}}function un(e){if(e==null)return"null";if(typeof e=="object")try{let t=JSON.stringify(e);return t.length>160?`${t.slice(0,157)}\u2026`:t}catch{return String(e)}return String(e)}function ii(e){if(!e)return"";let t=new Date(e);if(Number.isNaN(t.getTime()))return"";let s=String(t.getHours()).padStart(2,"0"),a=String(t.getMinutes()).padStart(2,"0"),r=String(t.getSeconds()).padStart(2,"0"),i=String(t.getMilliseconds()).padStart(3,"0");return`${s}:${a}:${r}.${i}`}function oi(e){let t=String(e?.module||"");return t.includes("static")||t.includes("frontend")?"is-client":t.includes("judgment.rag")?"is-rag":t.includes("judgment.web.app")?"is-api":t.includes("judgment.web.query")?"is-data":t.includes("judgment.judgment_index")?"is-index":"is-other"}function li(e){let t=new Map(e.map(a=>[a.seq,a.parent_seq])),s=new Map;for(let a of e){if(Number.isInteger(a.depth)){s.set(a.seq,a.depth);continue}let r=0,i=a.parent_seq,o=0;for(;i&&t.has(i)&&o<20;)r+=1,i=t.get(i),o+=1;s.set(a.seq,r)}return s}function ci(e){let t=Object.entries(e||{});if(!t.length)return'<span class="muted">\u7121\u53C3\u6578</span>';let s=t.slice(0,8),a=t.length-s.length;return`<div class="flow-param-list">${s.map(([r,i])=>`<span class="flow-param">
        <span class="flow-param-key">${n(r)}</span>
        <span class="flow-param-value">${n(un(i))}</span>
      </span>`).join("")}${a>0?`<span class="flow-param-more">+${a}</span>`:""}</div>`}function di(e){let t=new Map,s=Math.max(0,Number(e[0]?.offset_ms)||0);return e.forEach((a,r)=>{let i=Math.max(0,Number(a.offset_ms)||0),o=Math.max(0,Number(a.duration_ms)||0),l=e[r+1],m=l?Math.max(i,Number(l.offset_ms)||i):null,b=m===null?i+o:m,y=Math.max(0,b-i),v=Math.max(0,b-s);t.set(a.seq,{offset:i,duration:o,lap:y,cumulative:v})}),t}function ui(e,t,s,a){let r=a.get(e.seq)||{},i=Math.max(0,Number(r.duration)||0),o=Math.max(0,Number(r.offset)||0),l=Math.max(0,Number(r.lap)||0),m=Math.max(0,Number(r.cumulative)||0),b=Math.max(t,o+i,1),y=Math.min(100,o/b*100),v=Math.min(100-y,Math.max(.6,l/b*100)),w=s.get(e.seq)||0,g=ii(e.started_at)||`+${o.toFixed(0)} ms`,k=e.started_at?`\u958B\u59CB\uFF1A${ve(e.started_at)} \xB7 +${o.toFixed(1)} ms`:`\u958B\u59CB\uFF1A+${o.toFixed(1)} ms`;return`<div class="flow-segment ${e.status==="error"?"is-error":""}" style="--depth:${Math.min(w,8)}">
    <div class="flow-segment-head">
      <span class="flow-seq">#${n(String(e.seq??"\u2014"))}</span>
      <span class="flow-segment-name">${n(e.name||"unnamed")}</span>
      <span class="flow-segment-start" title="${n(k)}">${n(g)}</span>
      <span class="flow-segment-duration" title="\u8DDD\u4E0B\u4E00\u9EDE ${ne(l)}\uFF1B\u7D2F\u8A08 ${ne(m)}">${ne(l)}</span>
      <span class="flow-segment-span" title="\u5F9E\u7B2C\u4E00\u9EDE\u5230\u672C\u9EDE\u7D50\u675F\u7684\u7D2F\u8A08\u6642\u9593">\u7D2F\u8A08 ${ne(m)}</span>
    </div>
    <div class="flow-segment-loc">
      <span class="flow-segment-loc-text">${n(e.module||"\u2014")}<span class="flow-segment-dot">\xB7</span>${n(e.function||"\u2014")}</span>
      <span class="flow-segment-mobile-cum" title="\u5F9E\u7B2C\u4E00\u9EDE\u5230\u672C\u9EDE\u7D50\u675F\u7684\u7D2F\u8A08\u6642\u9593">\u7D2F\u8A08 ${ne(m)}</span>
    </div>
    <div class="flow-track" title="\u958B\u59CB +${o.toFixed(1)} ms \xB7 \u8DDD\u4E0B\u4E00\u9EDE ${ne(l)} \xB7 \u7D2F\u8A08 ${ne(m)}">
      <span class="flow-bar ${oi(e)}" style="left:${y.toFixed(2)}%;width:${v.toFixed(2)}%"></span>
    </div>
    ${ci(e.params)}
    ${e.error?`<div class="flow-segment-error">${n(e.error)}</div>`:""}
  </div>`}function pi(e){let t=Array.isArray(e?.segments)?e.segments:[],s=Array.isArray(e?.models)?e.models:[],a=e?.client||{},r=Math.max(...t.map(l=>Number(l.avg_ms)||0),1),i=a.samples?ne(a.avg_total_ms??0):"\u2014",o=a.samples?ne(a.avg_render_ms??0):"\u2014";return`<div class="perf-flow-stats">
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
                    <span class="perf-model-count">${c(l.value)} \u6B21${l.avg_ms?` \xB7 \u5E73\u5747 ${ne(l.avg_ms)}`:""}</span>
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
                    <span class="perf-seg-ms">${ne(l.avg_ms)}</span>
                  </div>`).join("")}</div>`:'<p class="muted" style="font-size:11px">\u5C1A\u7121\u5340\u6BB5\u8017\u6642\uFF1B\u9700\u6709\u542B flow \u7684\u65B0\u7D00\u9304\u3002</p>'}
      </div>
    </div>
  </div>`}function We(e){let t=Math.max(0,Number(e)||0);if(!t)return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;let s=Math.round(t/1e3),a=Math.floor(s/3600),r=Math.floor(s%3600/60),i=s%60;return a?`${a}h ${String(r).padStart(2,"0")}m ${String(i).padStart(2,"0")}s`:r?`${r}m ${String(i).padStart(2,"0")}s`:`${(t/1e3).toFixed(1)}s`}function pn(e){let t=String(e?.task||"").trim();return t?t==="auto"?"\u81EA\u52D5\u63A5\u7E8C":`task ${t}`:"\u7D22\u5F15"}function mi(e){let t=(e||[]).slice(-12);if(!t.length)return'<p class="muted" style="font-size:11px">\u5C1A\u7121\u7D22\u5F15\u7D00\u9304\u3002</p>';let s=Math.max(...t.map(a=>Number(a.points_per_second)||0),.1);return`<div class="index-run-bars">${t.map(a=>{let r=Number(a.points_per_second)||0,i=Math.max(2,r/s*100);return`<div class="index-run-row">
        <div class="index-run-label">
          <strong>${n(pn(a))}</strong>
          <span>${n(ve(a.started_at))}</span>
        </div>
        <div class="index-run-track" title="${n(`${c(a.indexed_count)} \u7B46 \xB7 ${We(a.duration_ms)} \xB7 ${c(a.batch_count)} \u6279`)}">
          <span style="width:${i.toFixed(1)}%"></span>
        </div>
        <div class="index-run-value">
          <strong>${r.toFixed(1)}</strong><span>\u7B46/\u79D2</span>
          <em>${c(a.indexed_count)} \u7B46 \xB7 ${We(a.duration_ms)}</em>
        </div>
      </div>`}).join("")}</div>`}function gi(e){let t=(Array.isArray(e.time_breakdown)?e.time_breakdown:[]).map(s=>({...s,ms:Number(s.ms)||0,percent:Number(s.percent)||0})).filter(s=>s.ms>0);return t.length?`<div class="index-breakdown-bar">${t.map(s=>`<span class="index-seg index-seg-${n(s.key)}" style="width:${Math.max(.5,s.percent).toFixed(2)}%" title="${n(`${s.label} ${We(s.ms)}\uFF08${s.percent.toFixed(1)}%\uFF09`)}"></span>`).join("")}</div>
    <div class="index-breakdown-legend">${t.map(s=>`<span class="index-legend-item">
            <i class="index-seg index-seg-${n(s.key)}"></i>
            <span>${n(s.label)}</span>
            <strong>${We(s.ms)}</strong>
            <em>${s.percent.toFixed(1)}%</em>
          </span>`).join("")}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B\u968E\u6BB5\u8A08\u6642\uFF1B\u5F8C\u7E8C\u7D22\u5F15\u6703\u8A18\u9304 Ollama Embedding\u3001Qdrant Upsert \u8207 PostgreSQL \u7D22\u5F15\u7D00\u9304\u7684\u6642\u9593\u7D44\u6210\u3002</div>'}function fi(e,t){let s=(Array.isArray(e)?e:[]).map(Y=>({elapsed:Math.max(0,Number(Y.elapsed_s)||0),indexed:Math.max(0,Number(Y.indexed)||0)})).filter(Y=>Y.indexed>0);if(s.length<2)return"";let a=Math.max(...s.map(Y=>Y.elapsed),(Number(t)||0)/1e3,1),r=Math.max(...s.map(Y=>Y.indexed),1),i=760,o=150,l=12,m=12,b=i-l*2,y=o-m*2,v=s.map(Y=>[l+Y.elapsed/a*b,o-m-Y.indexed/r*y]),w=v.map(([Y,K],X)=>`${X===0?"M":"L"}${Y.toFixed(1)},${K.toFixed(1)}`).join(" "),_=`${w} L${v[v.length-1][0].toFixed(1)},${o-m} L${v[0][0].toFixed(1)},${o-m} Z`,g=Math.max(1,Math.ceil(v.length/14)),k=v.map(([Y,K],X)=>X%g===0||X===v.length-1?`<circle cx="${Y.toFixed(1)}" cy="${K.toFixed(1)}" r="2.6" />`:"").join(""),F=[0,1,2,3].map(Y=>{let K=m+y/3*Y;return`<line x1="${l}" y1="${K.toFixed(1)}" x2="${i-l}" y2="${K.toFixed(1)}" class="index-chart-grid" />`}).join("");return`<div class="index-chart-card index-progress-card">
    <div class="index-chart-head">
      <span>\u672C\u6B21\u7D22\u5F15\u9032\u5EA6</span>
      <span>${c(r)} \u7B46 \xB7 ${We(a*1e3)}</span>
    </div>
    <svg class="index-progress-svg" viewBox="0 0 ${i} ${o}" role="img" aria-label="\u7D22\u5F15\u9032\u5EA6\u6298\u7DDA\u5716">
      ${F}
      <path d="${_}" class="index-progress-area"></path>
      <path d="${w}" class="index-progress-line"></path>
      ${k}
      <line x1="${l}" y1="${o-m}" x2="${i-l}" y2="${o-m}" class="index-chart-axis"></line>
      <line x1="${l}" y1="${m}" x2="${l}" y2="${o-m}" class="index-chart-axis"></line>
    </svg>
    <div class="index-progress-labels">
      <span>0</span>
      <span>${We(a*500)}</span>
      <span>${We(a*1e3)}</span>
    </div>
  </div>`}function bi(e){if(!e||!e.latest)return"";let t=e.latest,s=Array.isArray(e.runs)?e.runs:[],a=e.average||{},r=t.coverage||{},i=r.total_judgments>0?`${c(r.indexed_judgments)} / ${c(r.total_judgments)}\uFF08${(100*r.indexed_judgments/r.total_judgments).toFixed(1)}%\uFF09`:"\u2014",o=[{label:"\u7576\u6B21\u57F7\u884C\u7B46\u6578",value:c(t.indexed_count),note:`${c(t.batch_count)} \u6279 \xD7 ${c(t.batch_size)} \u7B46`},{label:"\u5E73\u5747\u6BCF\u79D2\u7B46\u6578",value:`${(Number(t.points_per_second)||0).toFixed(1)}`,note:"\u7B46/\u79D2"},{label:"\u7576\u6B21\u4F7F\u7528\u6642\u9593",value:We(t.duration_ms),note:`${c(t.scanned_count)} \u7B46\u5DF2\u6383\u63CF`},{label:"\u5E73\u5747\u6BCF\u6279\u6642\u9593",value:We(t.batch_avg_ms),note:t.batch_min_ms||t.batch_max_ms?`\u6700\u5FEB ${We(t.batch_min_ms)} \xB7 \u6700\u6162 ${We(t.batch_max_ms)}`:"\u4EE5\u7E3D\u8017\u6642 \xF7 \u6279\u6578\u8A08\u7B97"}];return`<section class="index-perf-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u7D22\u5F15\u6548\u80FD</div>
        <div class="index-perf-sub">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 \xB7 \u6700\u8FD1 ${c(e.run_count)} \u6B21\u57F7\u884C</div>
      </div>
      <span class="chip">${n(pn(t))}</span>
    </div>
    <div class="index-perf-summary">
      ${o.map(l=>`<div class="index-perf-stat">
            <div class="summary-label">${n(l.label)}</div>
            <div class="index-perf-value">${n(l.value)}</div>
            <div class="index-perf-note">${n(l.note)}</div>
          </div>`).join("")}
    </div>
    <div class="index-perf-meta">
      <span><strong>\u6700\u8FD1\u4E00\u6B21</strong> ${n(ve(t.started_at))}</span>
      <span><strong>batch</strong> ${c(t.batch_size)} \u7B46\uFF0F\u6279</span>
      <span><strong>embedding \u4E0A\u9650</strong> ${t.max_chars?`${c(t.max_chars)} \u5B57`:"\u2014"}</span>
      <span><strong>collection</strong> ${c(t.collection_points)} points</span>
      <span><strong>\u8986\u84CB\u7387</strong> ${n(i)}</span>
      <span><strong>\u5E73\u5747\u6BCF\u6B21\u57F7\u884C</strong> ${We(a.duration_ms)} \xB7 ${(Number(a.points_per_second)||0).toFixed(1)} \u7B46/\u79D2</span>
    </div>
    <div class="index-charts">
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u8FD1\u7D22\u5F15\u541E\u5410</span>
          <span>\u7B46/\u79D2</span>
        </div>
        ${mi(s)}
      </div>
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u65B0\u4E00\u6B21\u6642\u9593\u7D44\u6210</span>
          <span>${We(t.duration_ms)}</span>
        </div>
        ${gi(t)}
      </div>
    </div>
    ${fi(t.progress,t.duration_ms)}
  </section>`}function vi(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,r=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${r} \u9801 \xB7
      \u986F\u793A ${c(i)}\u2013${c(o)} / ${c(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${dn.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${u("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=r?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${u("chevronRight",13)}</button>
    </div>
  </div>`}function hi(e,t){let s=e.flow&&typeof e.flow=="object"?e.flow:null,a=Array.isArray(s?.segments)?[...s.segments].sort((g,k)=>Number(g.seq)-Number(k.seq)):[],r=s?.summary||{},i=Array.isArray(r.models)?r.models:[],o=s?.client||{},l=s?.metadata||{},m=l.question||"",b=l.answer||"",y=m||b?`<div class="perf-flow-qa">
          ${m?`<div class="perf-flow-qa-row"><strong>RAG \u554F\u984C</strong><span>${n(m)}</span></div>`:""}
          ${b?`<div class="perf-flow-qa-row"><strong>RAG \u7B54\u6848</strong><span>${n(b)}</span></div>`:""}
        </div>`:"",v=Math.max(Number(s?.total_ms)||0,Number(e.duration_ms)||0,...a.map(g=>(Number(g.offset_ms)||0)+(Number(g.duration_ms)||0)),1),w=li(a),_=di(a);return`<details class="perf-record" ${t===0?"open":""}>
    <summary class="perf-record-summary">
      <span class="perf-record-id">#${n(String(e.id))}</span>
      <span class="perf-record-main">
        <span class="perf-record-title">${n(e.process||"\u672A\u547D\u540D")}</span>
        <span class="perf-record-path mono">${n(e.method||"")} ${n(e.path||"")}</span>
      </span>
      <span class="perf-record-time">${ve(e.started_at)}</span>
      <span class="perf-record-duration">${ne(e.duration_ms)}</span>
      ${ke(e.status)}
      <span class="perf-record-chevron">${u("chevronRight",14)}</span>
    </summary>
    <div class="perf-record-body">
      <div class="perf-flow-meta">
        <span><strong>Request</strong> <span class="mono">${n(e.request_id||s?.request_id||"\u2014")}</span></span>
        <span><strong>Server</strong> ${ne(e.duration_ms)}</span>
        ${o.total_ms?`<span><strong>Client \u5168\u6D41\u7A0B</strong> ${ne(o.total_ms)}</span>`:""}
        ${o.render_ms!==void 0?`<span><strong>Render</strong> ${ne(o.render_ms)}</span>`:""}
        <span><strong>Flow</strong> ${a.length} \u6BB5</span>
        ${a.length?"<span><strong>\u9EDE\u4F4D</strong> \u5340\u9593\uFF1D\u4E0B\u4E00\u9EDE\u958B\u59CB\uFF0D\u672C\u9EDE\u958B\u59CB\uFF1B\u7D2F\u8A08\uFF1D\u7B2C\u4E00\u9EDE\u5230\u672C\u9EDE\u7D50\u675F\uFF0C\u6700\u5F8C\u4E00\u9EDE\u70BA\u7E3D\u6642\u9593</span>":""}
      </div>
      ${y}
      ${i.length?`<div class="chips perf-record-models">${i.map(g=>`<span class="chip">${n(g)}</span>`).join("")}</div>`:""}
      ${a.length?`<div class="flow-axis"><span>0 ms</span><span>${ne(v)}</span></div>
            <div class="flow-timeline">${a.map(g=>ui(g,v,w,_)).join("")}</div>`:`<div class="perf-no-flow">\u6B64\u7D00\u9304\u6C92\u6709 flow \u660E\u7D30\uFF08\u53EF\u80FD\u662F\u820A\u8CC7\u6599\u6216 CLI \u7D00\u9304\uFF09\u3002${e.params_text&&e.params_text!=="{}"?`<pre>${n(e.params_text)}</pre>`:""}</div>`}
      ${s?`<details class="flow-json">
              <summary>Flow JSON \xB7 ${a.length} \u6BB5</summary>
              <pre>${n(JSON.stringify(s,null,2))}</pre>
            </details>`:""}
    </div>
  </details>`}var Qt={embedding:"Embedding",retrieval:"Qdrant \u6AA2\u7D22",context:"PostgreSQL \u53D6\u6587",llm:"LLM \u751F\u6210",validation:"\u5F15\u7528\u9A57\u8B49"},cn={embedding:"EMB",retrieval:"\u6AA2\u7D22",context:"\u53D6\u6587",llm:"LLM",validation:"\u9A57\u8B49",overhead:"\u5176\u4ED6"};function mn(e){return{pending:"\u7B49\u5F85",running:"\u57F7\u884C\u4E2D",success:"\u5B8C\u6210",partial:"\u90E8\u5206\u6210\u529F",failed:"\u5931\u6557",skipped:"\u7565\u904E"}[e]||e||"\u672A\u77E5"}function yi(e){let t=String(e.status||"pending"),s=Math.max(0,Math.min(100,Number(e.progress)||0)),a=t==="pending"?0:t==="running"?Math.max(s,12):100,r=t==="running"?"\u57F7\u884C\u4E2D\u2026":t==="pending"?"\u7B49\u5F85":e.duration_ms?ne(e.duration_ms):mn(t);return`<div class="test-flow-step is-${n(t)}">
    <div class="test-flow-step-head">
      <span class="test-flow-model" title="${n(e.model||"")}">${n(e.model||"\u2014")}</span>
      <span class="test-flow-step-meta">${n(r)}</span>
    </div>
    <div class="test-flow-step-loc">${n(e.module||"\u2014")}<span class="flow-segment-dot">\xB7</span>${n(e.function||"\u2014")}</div>
    <div class="test-flow-track">
      <span class="test-flow-bar" style="width:${a}%"></span>
    </div>
    ${e.error_message?`<div class="test-flow-error">${n(e.error_message)}</div>`:""}
    ${e.details&&Object.keys(e.details).length?`<div class="test-flow-details">${n(Object.entries(e.details).slice(0,4).map(([i,o])=>`${i}=${un(o)}`).join(" \xB7 "))}</div>`:""}
  </div>`}function $i(e,t){if(!t.length)return"";let s=t.reduce((a,r)=>a+(Number(r.progress)||0),0)/t.length;return`<section class="test-flow-stage">
    <div class="test-flow-stage-head">
      <span class="test-flow-stage-title">${n(Qt[e]||e)}</span>
      <span class="test-flow-stage-meta">${t.length} \u500B\u7A0B\u5E8F \xB7 ${Math.round(s)}%</span>
    </div>
    <div class="test-flow-stage-steps">${t.map(yi).join("")}</div>
  </section>`}function gn(e,t){let s=Date.now(),a=new Map;for(let v of t){let w=Number(v.duration_ms)||0;if(v.status==="running"&&v.started_at){let _=Date.parse(v.started_at);Number.isFinite(_)&&(w=Math.max(w,s-_))}a.set(v.stage,(a.get(v.stage)||0)+w)}let r=Array.isArray(e.stage_order)?e.stage_order:Object.keys(Qt),i=[],o=new Set;for(let v of r)t.some(w=>w.stage===v)&&(o.add(v),i.push({stage:v,label:Qt[v]||v,short:cn[v]||v,duration:a.get(v)||0}));for(let[v,w]of a)o.has(v)||i.push({stage:v,label:Qt[v]||v,short:cn[v]||v,duration:w});let l=i.reduce((v,w)=>v+w.duration,0),m=Number(e.total_ms)||0,b=Math.max(l,m),y=Math.max(0,b-l);return y>1&&i.push({stage:"overhead",label:"\u5176\u4ED6\uFF0F\u6392\u7A0B",short:"\u5176\u4ED6",duration:y}),{entries:i,total:b||l,stepTotal:l}}function wi(e,t){let{entries:s,total:a}=gn(e,t),r=s.filter(o=>o.duration>0).map(o=>{let l=a?o.duration/a*100:0;return`<span class="test-flow-time-seg stage-${n(o.stage)}" style="width:${l.toFixed(2)}%" title="${n(o.label)} \xB7 ${ne(o.duration)}\uFF08${l.toFixed(1)}%\uFF09">${l>=8?n(o.short):""}</span>`}).join(""),i=s.map(o=>{let l=a?o.duration/a*100:0;return`<span class="test-flow-legend-item">
        <i class="test-flow-dot stage-${n(o.stage)}"></i>
        <span>${n(o.label)}</span>
        <strong>${ne(o.duration)}</strong>
        <em>${l.toFixed(1)}%</em>
      </span>`}).join("");return`<div class="test-flow-time">
    <div class="test-flow-total-head">
      <span>\u7E3D\u6D41\u7A0B\u6642\u9593\uFF08\u4F9D\u968E\u6BB5\uFF09</span>
      <span>${ne(a)}${e.status==="running"?" \xB7 \u4F30\u7B97\u4E2D":""}</span>
    </div>
    <div class="test-flow-time-bar">
      ${r||'<span class="test-flow-time-empty">\u5C1A\u7121\u968E\u6BB5\u8017\u6642</span>'}
    </div>
    <div class="test-flow-legend">${i}</div>
    ${e.status==="running"?'<div class="test-flow-time-note">\u57F7\u884C\u4E2D\u7684\u968E\u6BB5\u4EE5\u958B\u59CB\u6642\u9593\u4F30\u7B97\uFF1B\u5B8C\u6210\u5F8C\u4EE5\u4F3A\u670D\u5668\u56DE\u5831\u7684 duration \u70BA\u6E96\u3002</div>':""}
  </div>`}function Et(e,t,s,a={}){let r=a.showHistory!==!1,i=[`<option value="" ${s?"":"selected"}>\u76EE\u524D\uFF0F\u6700\u65B0\u6E2C\u8A66</option>`,...(t||[]).map(K=>`<option value="${n(K.run_id)}" ${K.run_id===s?"selected":""}>${n(mn(K.status))} \xB7 ${n((K.question||"\u672A\u547D\u540D").slice(0,28))} \xB7 ${n(ve(K.started_at))}</option>`)].join(""),o=r?`<label class="test-flow-select-label">\u6B77\u53F2
        <select class="select" id="test-run-select">${i}</select>
      </label>
      <button class="btn btn-secondary btn-sm" type="button" id="test-flow-refresh">
        ${u("refresh",13)}<span>\u66F4\u65B0</span>
      </button>`:`<a class="btn btn-secondary btn-sm" href="#/performance">
        ${u("activity",13)}<span>\u6B77\u53F2 Flow</span>
      </a>`,l=`<div class="test-flow-head">
    <div class="test-flow-heading">
      <div class="eyebrow">PERFORMANCE TEST FLOW</div>
      <div class="test-flow-title">\u6E2C\u8A66\u6D41\u7A0B ${e?ke(e.status):""}</div>
      <div class="test-flow-question">${e?n(e.question||"\u672A\u547D\u540D\u6E2C\u8A66"):"\u5C1A\u7121\u6E2C\u8A66\u6D41\u7A0B\u3002\u8ACB\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u4E26\u5728 RAG \u9801\u63D0\u554F\u3002"}</div>
    </div>
    <div class="test-flow-actions">${o}</div>
  </div>`;if(!e)return`<div class="test-flow-panel card">${l}
      ${Fe({iconName:"activity",title:"\u7B49\u5F85\u6E2C\u8A66\u6D41\u7A0B",text:"\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C\u6240\u6709\u53EF\u7528\u6A21\u578B\uFF0C\u4E26\u5728\u9019\u88E1\u5373\u6642\u986F\u793A\u6BCF\u500B\u968E\u6BB5\u7684\u9032\u5EA6\u3002"})}
    </div>`;let m=Array.isArray(e.steps)?e.steps:[],b=new Map;for(let K of m)b.has(K.stage)||b.set(K.stage,[]),b.get(K.stage).push(K);let v=(Array.isArray(e.stage_order)?e.stage_order:Object.keys(Qt)).map(K=>$i(K,b.get(K)||[])).join(""),w=e.models||{},_=gn(e,m),g=e.status==="running"?`${ne(_.total)}\uFF08\u4F30\u7B97\uFF09`:ne(e.total_ms),k=m.find(K=>K.stage==="llm"&&K.model===e.summary?.primary_model)||m.find(K=>K.stage==="llm"&&K.details?.answer_preview),F=e.answer||k?.details?.answer_preview||"",Y=`<div class="test-flow-answer">
    <div class="test-flow-answer-head">
      <span>RAG \u5F15\u64CE\u7B54\u6848</span>
      ${e.summary?.primary_model?`<span class="mono">${n(e.summary.primary_model)}</span>`:""}
    </div>
    <p>${F?n(F):e.status==="running"?"\u6E2C\u8A66\u9032\u884C\u4E2D\uFF0C\u5C1A\u672A\u7522\u751F\u6700\u7D42\u7B54\u6848\u3002":"\u6B64\u6E2C\u8A66\u6C92\u6709\u4FDD\u5B58\u53EF\u986F\u793A\u7684\u7B54\u6848\u3002"}</p>
  </div>`;return`<div class="test-flow-panel card">
    ${l}
    <div class="test-flow-meta">
      <span><strong>Run</strong> <span class="mono">${n(e.run_id)}</span></span>
      <span><strong>\u958B\u59CB</strong> ${n(ve(e.started_at))}</span>
      <span><strong>\u7E3D\u8017\u6642</strong> ${g}</span>
      <span><strong>Embedding</strong> ${Array.isArray(w.embedding)?w.embedding.length:0} \u500B</span>
      <span><strong>LLM</strong> ${Array.isArray(w.llm)?w.llm.length:0} \u500B</span>
      <span><strong>\u968E\u6BB5</strong> ${n(e.stage_label||e.stage||"\u2014")}</span>
    </div>
    ${Y}
    <div class="test-flow-stages">${v||'<p class="muted">\u6B64\u6E2C\u8A66\u6C92\u6709\u5340\u6BB5\u8CC7\u6599\u3002</p>'}</div>
    <div class="test-flow-total">
      <div class="test-flow-total-head">
        <span>\u7E3D\u6D41\u7A0B\u9032\u5EA6</span>
        <span>${Number(e.progress)||0}%</span>
      </div>
      <div class="test-flow-track is-total ${e.status==="running"?"is-running":""}">
        <span class="test-flow-bar is-total" style="width:${Math.max(0,Math.min(100,Number(e.progress)||0))}%"></span>
      </div>
    </div>
    ${wi(e,m)}
    <div class="test-flow-foot">
      <span>${e.status==="running"?"\u6E2C\u8A66\u57F7\u884C\u4E2D\uFF1B\u6B64\u5716\u8868\u6703\u81EA\u52D5\u66F4\u65B0\u3002":r?"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u5F9E\u4E0A\u65B9\u300C\u6B77\u53F2\u300D\u9078\u55AE\u9084\u539F\u5176\u4ED6 Flow\u3002":"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u81F3\u6548\u80FD\u5831\u8868\u67E5\u770B\u6B77\u53F2 Flow\u3002"}</span>
      ${e.summary?.primary_model?`<span class="mono">primary=${n(e.summary.primary_model)}</span>`:""}
    </div>
  </div>`}function _i(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.summary)?e.summary:[],a=e.flow_stats||e.meta?.flow_stats||{},r=e.index_stats||null;return`<div class="report-card performance-flow-report" data-database="performance">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">PERFORMANCE FLOW REPORT</div>
        <div class="report-title">
          \u6548\u80FD\u5831\u8868 ${ke(e.status||"ok")}
          <span class="chip">performance_records</span>
        </div>
        <div class="report-sub">
          ${c(e.total)} \u7B46\u7B26\u5408 \xB7 ${ne(e.duration_ms)} \xB7
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
    ${bi(r)}
    ${pi(a)}
    <div class="report-section-head perf-flow-list-head">
      <span class="report-section-title">Flow \u7D00\u9304</span>
      <span class="muted" style="font-size:9.5px">\u9EDE\u64CA\u5217\u5C55\u958B\u6A21\u7D44\u3001\u51FD\u6578\u3001\u53C3\u6578\u8207\u5340\u6BB5\u8017\u6642</span>
    </div>
    <div class="perf-record-list">
      ${t.length?t.map((i,o)=>hi(i,o)).join(""):Fe({iconName:"activity",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684 Flow",text:"\u653E\u5BEC\u65E5\u671F\u3001\u6A21\u578B\u6216\u8017\u6642\u689D\u4EF6\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}
    </div>
    ${vi(e)}
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
  </div>`}async function ki(e,t){let s=!1,a=na(),r={processes:[],modules:[],statuses:[],methods:[],models:[]},i=1,o=25,l=null;e.innerHTML=`<section class="page data-page performance-page">
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
              <div id="performance-report">${Ut({label:"\u6548\u80FD\u5831\u8868"})}</div>
            </section>
          </div>
        </div>
        <div id="performance-panel-benchmark" hidden></div>
      </section>
    </div>
  </section>`;let m=e.querySelector("#performance-filter-fields"),b=e.querySelector("#performance-filter-form"),y=e.querySelector("#performance-test-flow"),v=e.querySelector("#performance-report"),w=e.querySelector("#performance-meta"),_=e.querySelector("#performance-refresh"),g=[...e.querySelectorAll("[data-performance-tab]")],k={overview:e.querySelector("#performance-panel-overview"),benchmark:e.querySelector("#performance-panel-benchmark")},F="overview",Y=q=>{F=q;for(let R of g){let Q=R.dataset.performanceTab===q;R.classList.toggle("is-active",Q),Q?R.setAttribute("aria-current","page"):R.removeAttribute("aria-current")}for(let[R,Q]of Object.entries(k))Q&&(Q.hidden=R!==q);q==="benchmark"&&(w.textContent="BENCHMARK \xB7 RAG")},K=Va(e,{onNavigate:q=>Y(q)}),X=q=>{Y(q),q==="benchmark"&&K.show()};e.addEventListener("click",q=>{let R=q.target.closest("[data-performance-tab]");R&&X(R.dataset.performanceTab||"overview")});let W=null,ae=[],oe="",le=null,$e="",ie=()=>{m.innerHTML=ri(r,a)},j=()=>{let q=JSON.stringify({selected:oe,tick:W?.status==="running"?Math.floor(Date.now()/1e3):0,runs:ae.map(R=>`${R.run_id}:${R.status}`),run:W?{run_id:W.run_id,status:W.status,progress:W.progress,steps:(W.steps||[]).map(R=>`${R.stage}:${R.model}:${R.status}:${R.progress}`)}:null});q!==$e&&($e=q,y.innerHTML=Et(W,ae,oe))},$=async()=>{try{let q=await U.testRuns(30);if(s)return;ae=Array.isArray(q.runs)?q.runs:[]}catch{if(s)return;ae=[]}},B=async()=>{try{let q=oe?await U.testRun(oe):await U.testRunCurrent();if(s)return;W=q.run||null,!oe&&W&&W.status!=="running"&&!ae.some(R=>R.run_id===W.run_id)&&await $(),j()}catch{if(s)return;W=null,j()}},D=async()=>{s||(oe||await B(),s||(le=window.setTimeout(D,1500)))};y.addEventListener("change",async q=>{q.target.id==="test-run-select"&&(oe=String(q.target.value||""),await B())}),y.addEventListener("click",async q=>{q.target.closest("#test-flow-refresh")&&(oe="",await $(),await B())});let x=async(q=i)=>{i=Math.max(1,Number(q)||1),a=ln(),v.innerHTML=Ut({label:"\u6548\u80FD\u5831\u8868"});let R=e.querySelector("#performance-run");ge(R,!0,"\u67E5\u8A62\u4E2D\u2026");try{let Q=await U.performance(a,i,o);if(s)return;l=Q,i=Number(Q.page)||i,o=Number(Q.page_size)||o,v.innerHTML=_i(Q),w.textContent=`PERFORMANCE \xB7 ${c(Q.total)} \u7B46`,w.className="badge badge-neutral badge-mono"}catch(Q){if(s)return;v.innerHTML=gs(Q,{label:"\u6548\u80FD\u5831\u8868"}),M(Q.message||"\u6548\u80FD\u5831\u8868\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{s||ge(R,!1)}},S=async()=>{try{r=await U.performanceOptions()}catch{r={processes:[],modules:[],statuses:[],methods:[],models:[]}}ie()};return b.addEventListener("submit",q=>{q.preventDefault(),x(1)}),e.querySelector('[data-action="reset"]').addEventListener("click",()=>{a=na(),i=1,ie(),x(1)}),_.addEventListener("click",async()=>{if(F==="benchmark"){ge(_,!0,"\u6574\u7406\u4E2D\u2026");try{await K.refresh()}finally{s||ge(_,!1)}return}a=ln(),_.disabled=!0,ge(_,!0,"\u6574\u7406\u4E2D\u2026"),await S(),await $(),s||await B(),s||await x(1),s||(_.disabled=!1,ge(_,!1))}),v.addEventListener("click",async q=>{let R=q.target.closest("[data-action]");if(!R||!l)return;let Q=R.dataset.action;if(Q==="retry"){x(i);return}if(Q==="prev-page"){x(Math.max(1,Number(l.page)-1));return}if(Q==="next-page"){let z=Math.max(1,Math.ceil(Number(l.total)/Number(l.page_size)));x(Math.min(z,Number(l.page)+1));return}if(Q==="copy-query"){let z=await Mt(l.query_text||"");M(z?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",z?"ok":"warn");return}if(Q==="export-json"){let z=`performance-page-${l.page}.json`;tt(z,JSON.stringify(bs(l),null,2),"application/json;charset=utf-8"),M(`\u5DF2\u532F\u51FA ${z}`,"ok");return}if(Q==="export-csv"){let z=`performance-page-${l.page}.csv`;tt(z,fs(l),"text/csv;charset=utf-8"),M(`\u5DF2\u532F\u51FA ${z}`,"ok")}}),v.addEventListener("change",q=>{q.target.matches("[data-page-size]")&&(o=Number(q.target.value)||25,dn.includes(o)||(o=25),x(1))}),await Promise.allSettled([S(),$()]),s||(await B(),await x(1),D()),t&&typeof t.setTitle=="function"&&t.setTitle("\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"),()=>{s=!0,le&&window.clearTimeout(le),K.destroy()}}var Si=["\u91D1\u878D\u6D88\u8CBB\u8005\u4FDD\u8B77\u6CD5\u5982\u4F55\u8655\u7406\u91D1\u878D\u6D88\u8CBB\u722D\u8B70\uFF1F","\u8B49\u5238\u4EA4\u6613\u6CD5\u5C0D\u5167\u7DDA\u4EA4\u6613\u6709\u4EC0\u9EBC\u898F\u7BC4\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5438\u6536\u5B58\u6B3E\u8207\u6388\u4FE1\u6709\u54EA\u4E9B\u9650\u5236\uFF1F","\u4FDD\u96AA\u6CD5\u5C0D\u65BC\u696D\u52D9\u54E1\u4E0D\u7576\u62DB\u652C\u7684\u8CAC\u4EFB\u898F\u5B9A\uFF1F","\u9280\u884C\u6CD5\u6709\u591A\u5C11\u689D\u6587\uFF1F","\u8B49\u5238\u71DF\u696D\u54E1\u5E38\u89F8\u72AF\u4EC0\u9EBC\u6CD5\u898F\u6216\u547D\u4EE4\uFF1F","\u6709\u54EA\u4E9B\u6CD5\u898F\u662F\u548C\u58FD\u96AA\u53CA\u7522\u96AA\u76F8\u95DC\u7684\uFF1F"];function qi(){return`<div class="answer-placeholder">
    <span class="empty-icon">${u("sparkles",26)}</span>
    <h2 class="empty-title">\u7B54\u6848\u53EA\u6703\u4F86\u81EA\u6AA2\u7D22\u5230\u7684\u5224\u6C7A\u53CA\u6CD5\u898F\u7247\u6BB5</h2>
    <p class="empty-text">\u9001\u51FA\u554F\u984C\u5F8C\uFF0C\u7CFB\u7D71\u6703\u5148\u4EE5 Qdrant \u6AA2\u7D22\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\u4E26\u6A19\u793A\u5F15\u7528\u7DE8\u865F\u3002
      \u82E5\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u660E\u78BA\u986F\u793A\u964D\u7D1A\u72C0\u614B\uFF0C\u4E0D\u6703\u6191\u7A7A\u751F\u6210\u7B54\u6848\u3002</p>
  </div>`}function ia(){return`<section class="card answer-card rag-empty-answer">${qi()}</section>`}function fn(e,t){return`<div class="rag-turn">
    <div class="rag-user-bubble">${n(e)}</div>
    <section class="card rag-assistant-turn" data-rag-answer>${t}</section>
  </div>`}function xi(e){return{status:e.status,answer:e.answer,answer_source:e.answer_source,notice:e.notice,citations:Array.isArray(e.citations)?e.citations:[],judgments:Array.isArray(e.judgments)?e.judgments:[],law_sources:Array.isArray(e.law_sources)?e.law_sources:[],matched_terms:Array.isArray(e.matched_terms)?e.matched_terms:[],law_answer:e.law_answer,law_framework:e.law_framework,llm_model:e.llm_model,embedding_model:e.embedding_model,duration_ms:e.duration_ms,show_sources:e.show_sources,test_run:e.test_run||null,partial:!1,streaming:!1}}var Ai={"http.request":"FastAPI \u63A5\u6536\u8ACB\u6C42","http.response":"\u56DE\u50B3\u7D50\u679C\u7D66\u524D\u7AEF","rag.answer_question":"RAG \u4E3B\u6D41\u7A0B","rag.coverage":"PostgreSQL \u7D22\u5F15\u8986\u84CB\u6AA2\u67E5","rag.law_retrieval":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22","rag.law_lookup":"\u6BD4\u5C0D\u554F\u984C\u4E2D\u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u540D\u7A31","rag.law_content":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u689D\u6587","rag.qdrant_precheck":"Qdrant collection \u6AA2\u67E5","rag.search":"RAG \u6AA2\u7D22","rag.embed_query":"Ollama embedding \u67E5\u8A62\u5411\u91CF","rag.qdrant_search":"Qdrant \u5411\u91CF\u641C\u5C0B","rag.fetch_documents":"PostgreSQL \u8B80\u53D6\u5224\u6C7A","rag.postgres_fetch":"PostgreSQL \u5224\u6C7A\u67E5\u8A62","rag.build_citations":"\u6574\u7406\u5F15\u7528\u8207\u5224\u6C7A\u7247\u6BB5","rag.extract_excerpt":"\u64F7\u53D6\u76F8\u95DC\u7247\u6BB5","rag.llm":"LLM \u56DE\u7B54\u751F\u6210","rag.llm_request":"Ollama LLM \u751F\u6210","rag.validate_citations":"\u9A57\u8B49\u5F15\u7528\u7DE8\u865F","rag.test_mode":"\u6E2C\u8A66\u6A21\u5F0F\u591A\u6A21\u578B\u6D41\u7A0B","rag.preview_fallback":"\u6CD5\u898F\u9810\u89BD\u964D\u7D1A"};function Li(e){let t=String(e?.name||""),s=e?.params||{},a=String(s.model||s.embedding_model||"").trim();return t==="rag.llm_request"?`Ollama run ${a||"LLM"}`:t==="rag.llm"?`LLM \u56DE\u7B54\u751F\u6210${a?` \xB7 ${a}`:""}`:t==="rag.embed_query"?`Ollama embedding \u67E5\u8A62\u5411\u91CF${a?` \xB7 ${a}`:""}`:Ai[t]||t||"backend step"}function bn(e){return[e?.module,e?.function,e?.name].filter(Boolean).join(" \xB7 ")}function vn(e){let t=Number(e);return Number.isFinite(t)?`${c(Math.max(0,Math.round(t)))} ms`:"\u2014"}function oa(e,t){if(!e)return;e.classList.toggle("is-open",t);let s=e.querySelector("#rag-process-body"),a=e.querySelector(".rag-process-toggle");s&&(s.hidden=!t),a&&(a.setAttribute("aria-expanded",String(t)),a.title=t?"\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B":"\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B")}function Mi(){return`<div class="rag-process is-open" id="rag-process">
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
  </div>`}function ji(e){let t=e.querySelector("#rag-process"),s=t?.querySelector("#rag-process-list"),a=t?.querySelector("#rag-process-summary"),r=performance.now(),i=new Map,o=(w,_,g)=>{let k=w.querySelector(_);k&&(k.textContent=g)},l=w=>{if(w.failed){o(w.element,".rag-process-meta","\u5931\u6557");return}if(w.hasChildren){o(w.element,".rag-process-meta","");return}o(w.element,".rag-process-meta",vn(w.durationMs))},m=w=>{let _=w-1,g=[...i.values()].reverse();for(let k of g){if(_<0)break;k.depth<=_&&(k.hasChildren||(k.hasChildren=!0,k.element.dataset.hasChildren="true",k.finished&&l(k)),_=k.depth-1)}},b=w=>{if(!s)return null;let _=String(w?.seq??`step-${i.size+1}`),g=i.get(_);if(!g){let k=Math.max(0,Math.min(6,Number(w?.depth)||0));m(k);let F=document.createElement("div");F.className="rag-process-item is-running",F.dataset.processKey=_,F.style.setProperty("--depth",String(k)),F.innerHTML=`<span class="rag-process-dot"></span>
        <span class="rag-process-label"></span>
        <span class="rag-process-meta">\u57F7\u884C\u4E2D\u2026</span>`,s.appendChild(F),g={element:F,depth:k,hasChildren:!1,finished:!1,failed:!1,durationMs:0},i.set(_,g)}return o(g.element,".rag-process-label",Li(w)),g.element.title=bn(w),g};return{step:w=>{let _=w?.segment;if(!_)return;let g=b(_);if(g){if(w.type==="segment_start"){g.element.classList.add("is-running"),o(g.element,".rag-process-meta","\u57F7\u884C\u4E2D\u2026");return}if(w.type==="segment_end"){let k=_.status==="error";g.element.classList.remove("is-running"),g.element.classList.toggle("is-error",k),g.finished=!0,g.failed=k,g.durationMs=Number(_.duration_ms)||0,l(g),g.element.title=[bn(_),k&&_.error||""].filter(Boolean).join(" \xB7 ")}}},finish:(w=!0)=>{if(!t)return"";t.querySelectorAll(".rag-process-item.is-running").forEach(k=>{k.classList.remove("is-running");let F=k.dataset.hasChildren==="true";o(k,".rag-process-meta",F?"":w?"\u5B8C\u6210":"\u4E2D\u65B7")});let _=s?.children.length||i.size,g=vn(Math.max(0,performance.now()-r));return a&&(a.textContent=w?`\u5B8C\u6210 \xB7 ${_} \u6B65 \xB7 ${g}`:`\u5931\u6557 \xB7 ${_} \u6B65`),t.classList.add("is-complete"),oa(t,!1),t.outerHTML},collapse:()=>oa(t,!1)}}function Ti(e,t=!1){let s=t?"\u6E2C\u8A66\u6A21\u5F0F\uFF1A\u6B63\u5728\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207 LLM \u6A21\u578B\uFF0C\u53EF\u80FD\u9700\u8981\u6578\u5206\u9418\u2026":"\u6B63\u5728\u4EE5\u5411\u91CF\u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\u7247\u6BB5\u4E26\u751F\u6210\u56DE\u7B54\uFF1B\u5FEB\u901F\u6A21\u5F0F\u901A\u5E38 2\u201310 \u79D2\u2026";return`<div class="answer-head">
      <div class="answer-head-left">${u("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u4E2D</span>
      </div>
      <div class="answer-head-meta"><span class="spinner"></span></div>
      ${t?"":Mi()}
    </div>
    <div class="answer-body">
      <p class="answer-text">${s}\u300C${n(e)}\u300D</p>
      <div class="skeleton skeleton-line" style="margin-top:22px;width:92%"></div>
      <div class="skeleton skeleton-line" style="width:76%"></div>
      <div class="skeleton skeleton-line" style="width:84%"></div>
    </div>`}function hn(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function vs(e,{lawKey:t="",sourceType:s="",label:a=""}={}){let r=String(e||"").trim();return r?`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${n(t||r)}"
    data-source-type="${n(s||"")}"
    title="\u9EDE\u64CA\u958B\u555F ${n(r)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${n(r)} \u7684\u5B8C\u6574\u689D\u6587">${n(a||r)}</button>`:""}function Ei(e,t){let s=e.score===null||e.score===void 0?"":`\u76F8\u4F3C\u5EA6 ${Number(e.score).toFixed(4)}`,a=[e.court,e.jdate,s].filter(Boolean).map(l=>`<span>${n(l)}</span>`).join(""),r=(Array.isArray(e.matched_laws)?e.matched_laws:[]).slice(0,5).map(l=>vs(l)).join(""),i=e.jid?` data-action="open-parquet-judgment"
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
  </article>`}function Ni(e,t){let s=[e.law_level,e.law_category,e.article_count?`${c(e.article_count)} \u689D`:""].filter(Boolean).map(o=>`<span>${n(o)}</span>`).join(""),a=e.law_url?`<a class="citation-link" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">\u4F86\u6E90${u("external",11)}</a>`:"",r=e.law_key||e.law_name||"",i=r?` data-action="open-law-source"
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
  </article>`}function Ci(e,t){let s=e.source_label||(e.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),a=e.law_level&&e.law_level!==s?e.law_level:"",r=[`<span class="badge ${e.source_type==="order"?"badge-warn":"badge-info"}">${n(s)}</span>`,a,e.law_category,e.article_count?`${c(e.article_count)} \u689D`:"",e.law_modified_date?`\u7570\u52D5 ${Ze(e.law_modified_date)}`:""].filter(Boolean).map(_=>`<span>${_}</span>`).join(""),i=e.first_promulgation?`<div class="citation-meta"><span>\u6700\u65E9\u5236\u5B9A\uFF1A${n(e.first_promulgation.roc_date)}\uFF08\u897F\u5143 ${n(e.first_promulgation.gregorian_date)}\uFF09</span></div>`:"",o=e.stats,l=o?`<div class="law-source-stats">
        <span>\u63D0\u53CA\u300C${n(o.entity||"")}\u300D\u7684\u5224\u6C7A ${c(o.judgment_count||0)} \u7B46</span>
        <span>\u672C\u6CD5\u898F\u88AB\u5F15\u7528 ${c(o.law_count||0)} \u6B21</span>
      </div>`:"",m=e.law_key||"",b=e.source_type||"",y=(Array.isArray(e.articles)?e.articles:[]).map(_=>{let g=String(_.article_no||"");return`<div class="law-source-article"${m&&g?` data-action="open-law-source"
        data-law-key="${n(m)}"
        data-source-type="${n(b)}"
        data-article-no="${n(g)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u9078\u67E5\u770B ${n(g)} \u7684\u5B8C\u6574\u5167\u5BB9"
        aria-label="\u958B\u555F ${n(e.law_name||"\u6CD5\u898F")} ${n(g)} \u7684\u5B8C\u6574\u689D\u6587"`:""}>
        <span class="law-source-article-no">${n(_.article_no||"\u689D\u6587")}</span>
        <p class="law-source-article-text">${n(_.article_content||"")}</p>
      </div>`}).join(""),v=e.law_url?`<a class="citation-link" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">\u6CD5\u898F\u4F86\u6E90${u("external",11)}</a>`:"",w=e.law_key?` data-action="open-law-source"
        data-law-key="${n(e.law_key)}"
        data-source-type="${n(e.source_type||"")}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F\u672C\u5730 Parquet \u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u59CB\u689D\u6587"
        aria-label="\u958B\u555F ${n(e.law_name||"\u6CD5\u898F")} \u539F\u59CB\u689D\u6587"`:"";return`<article class="citation law-source">
    <span class="citation-index">${String(e.index??t+1).padStart(2,"0")}</span>
    <div class="citation-body"${w}>
      <h4 class="citation-name">${n(e.law_name||"\u672A\u547D\u540D\u6CD5\u898F")}</h4>
      <div class="citation-meta">${r}</div>
      ${i}
      ${l}
      ${y}
    </div>
    <div class="citation-links">${v}</div>
  </article>`}function Ri(e,t=150){let s=String(e||"").replace(/\s+/g," ").trim();return s?s.length>t?`${s.slice(0,t)}\u2026`:s:""}function Ii(e,t){return!Array.isArray(e)||!e.length?`<p class="answer-text">${n(t)}</p>`:`<div class="law-answer-list">${e.map(s=>{let a=s.law_key||"",r=s.source_type||"",i=s.law_name||"\u672A\u547D\u540D\u6CD5\u898F",o=s.source_label||(r==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),l=Number(s.article_count||0),m=s.index!=null?`<span class="law-answer-index">[${n(String(s.index))}]</span>`:"",b=a?`<button class="law-answer-law" type="button"
            data-action="open-law-source"
            data-law-key="${n(a)}"
            data-source-type="${n(r)}"
            title="\u9EDE\u64CA\u958B\u555F ${n(i)} \u7684\u5B8C\u6574\u689D\u6587"
            aria-label="\u958B\u555F ${n(i)} \u7684\u5B8C\u6574\u689D\u6587">${n(i)}</button>`:`<strong>${n(i)}</strong>`,y=Array.isArray(s.articles)?s.articles:[],v=y.length?`<div class="law-answer-articles-label">\u76F8\u95DC\u689D\u6587</div>
          <div class="law-answer-articles">${y.map(w=>{let _=String(w.article_no||"").trim(),g=Ri(w.article_content);return!a||!_?`<div class="law-answer-article is-static">
                  <span class="law-answer-article-no">${n(_||"\u689D\u6587")}</span>
                  <span class="law-answer-article-text">${n(g)}</span>
                </div>`:`<button class="law-answer-article" type="button"
                data-action="open-law-source"
                data-law-key="${n(a)}"
                data-source-type="${n(r)}"
                data-article-no="${n(_)}"
                title="\u9EDE\u64CA\u67E5\u770B ${n(_)} \u7684\u5B8C\u6574\u5167\u5BB9"
                aria-label="\u958B\u555F ${n(i)} ${n(_)} \u7684\u5B8C\u6574\u689D\u6587">
                <span class="law-answer-article-no">${n(_)}</span>
                <span class="law-answer-article-text">${n(g)}</span>
              </button>`}).join("")}</div>`:"";return`<div class="law-answer-source">
        <div class="law-answer-source-head">
          ${b}
          <span class="law-answer-source-meta">\uFF08${n(o)}\uFF0C${c(l)} \u689D\uFF09</span>
          ${m}
        </div>
        ${v}
      </div>`}).join("")}</div>`}function Pi(e,t){if(!Array.isArray(e)||!e.length)return"";let s=new Map((Array.isArray(t)?t:[]).map(a=>[String(a.law_name||""),a]));return`<div class="answer-section-label" style="margin-top:18px">
      <span>\u547D\u4E2D\u8A5E\u5F59</span>
    </div>
    <div class="chips">${e.map(a=>{let r=s.get(String(a));return r?.law_key?vs(a,{lawKey:r.law_key,sourceType:r.source_type||""}):`<span class="chip">${n(a)}</span>`}).join("")}</div>`}function wn(e){let t=Array.isArray(e.citations)?e.citations:[],s=Array.isArray(e.judgments)?e.judgments:[],a=Array.isArray(e.law_sources)?e.law_sources:[],r=Array.isArray(e.matched_terms)?e.matched_terms:[],i=e.status||"preview",o=!!e.partial,l=!!e.streaming,m=!!e.show_sources||!o,b=s.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u5224\u6C7A \xB7 ${s.length} \u7B46</span>
        <span>vector retrieval \xB7 [\u7DE8\u865F] \u5C0D\u61C9\u56DE\u7B54\u5F15\u7528</span>
      </div>
      <div class="citation-list">${s.map((Q,z)=>Ei(Q,z)).join("")}</div>`:"",y=a.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4 \xB7 ${a.length} \u7B46</span>
        <span>PostgreSQL metadata \xB7 Parquet \u689D\u6587</span>
      </div>
      <div class="citation-list">${a.map((Q,z)=>Ci(Q,z)).join("")}</div>`:"",v=!s.length&&t.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F \xB7 ${t.length} \u7B46</span>
        <span>metadata match</span>
      </div>
      <div class="citation-list">${t.map((Q,z)=>Ni(Q,z)).join("")}</div>`:"",w=m?b+y+v:"";!w&&!o&&(w=`<div class="answer-divider"></div>
      ${Fe({iconName:"file",title:"\u6C92\u6709\u53EF\u5F15\u7528\u7684\u4F86\u6E90",text:i==="retrieval_only"?"\u76EE\u524D\u5DF2\u5EFA\u7ACB\u7684\u5411\u91CF\u7D22\u5F15\u4E2D\u6C92\u6709\u8DB3\u5920\u76F8\u4F3C\u7684\u5224\u6C7A\uFF0C\u4E5F\u6C92\u6709\u53EF\u5C0D\u61C9\u7684\u6CD5\u898F\u6216\u547D\u4EE4\u3002\u7CFB\u7D71\u4E0D\u6703\u5728\u6C92\u6709\u4F86\u6E90\u6642\u751F\u6210\u7B54\u6848\u3002":"\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u4E14\u554F\u984C\u4E2D\u6C92\u6709\u53EF\u76F4\u63A5\u5C0D\u61C9\u7684\u73FE\u884C\u6CD5\u898F\u540D\u7A31\u3002"})}`);let _=Pi(r,a),g=e.test_run,k=String(e.llm_model||g?.primary_model||"").trim(),F=String(e.embedding_model||"").trim(),Y=[k?`LLM\uFF1A${k}`:"",F?`Embedding\uFF1A${F}`:""].filter(Boolean).join(" \xB7 "),K=e.answer_source==="structured",X=String(e.law_answer||"").trim(),W=e.law_framework||null,ae=Array.isArray(W?.rows)?W.rows:[],oe=Array.isArray(W?.sources)?W.sources:[],le=ae.length>0,$e=!!X&&!K&&!le,ie=l||e.answer_source==="llm"?"LLM \u7D9C\u5408\u56DE\u7B54":"\u6AA2\u7D22\u7D50\u679C\u6458\u8981",j=le?`<div class="answer-block law-framework-block">
        <div class="answer-block-head">
          <span>${n(W.title||"\u76F8\u95DC\u6CD5\u898F\u7684\u8CAC\u4EFB\u67B6\u69CB")}</span>
          <span>${ae.length} \u689D</span>
        </div>
        <div class="table-wrap law-framework-table-wrap">
          <table class="data-table is-compact law-framework-table">
            <thead>
              <tr><th scope="col">\u6CD5\u898F</th><th scope="col">\u689D\u6587</th><th scope="col">\u898F\u7BC4\u91CD\u9EDE</th></tr>
            </thead>
            <tbody>
              ${ae.map(Q=>`<tr>
                    <td>${n(Q.law_name||"\u2014")}</td>
                    <td class="cell-number">${n(Q.article_no||"\u2014")}</td>
                    <td>${n(Q.focus||"\u2014")}</td>
                  </tr>`).join("")}
            </tbody>
          </table>
        </div>
        ${oe.length?`<div class="law-framework-sources">
                <span>\u6CD5\u898F\u4F86\u6E90</span>
                ${oe.map(Q=>{let z=String(Q?.law_name||Q||"").trim(),te=Q&&Q.index!==null&&Q.index!==void 0?` [${n(Q.index)}]`:"";return vs(z,{label:`${z}${te}`})}).join("")}
              </div>`:""}
      </div>`:"",$=e.answer_source==="llm"&&k?`<span class="answer-model" title="${n(Y)}">${u("brain",11)}${n(k)}</span>`:K?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${u("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"",B=l?`${k||"LLM"} \xB7 \u751F\u6210\u4E2D`:$?k||"structured":"retrieval",D=g?`<div class="test-run-summary">
        <div class="test-run-summary-head">
          <span class="badge badge-warn">\u6E2C\u8A66\u6A21\u5F0F</span>
          ${ke(g.status)}
          <span class="mono">${n(g.run_id||"")}</span>
        </div>
        <div class="test-run-summary-body">
          <span>Embedding ${Number(g.models?.embedding?.length||0)} \u500B</span>
          <span>LLM ${Number(g.models?.llm?.length||0)} \u500B</span>
          <span>\u4E3B\u56DE\u7B54 ${n(g.primary_model||"\u2014")}</span>
          <span>${Number(g.total_ms||0)} ms</span>
          <a href="#/performance">\u67E5\u770B\u6E2C\u8A66 Flow</a>
        </div>
      </div>`:"",S=String(e.answer||"").trim()||(l?"\u6B63\u5728\u751F\u6210\u56DE\u7B54\u2026":o?"\u6B63\u5728\u6AA2\u7D22\u5224\u6C7A\u4E26\u751F\u6210 LLM \u56DE\u7B54\u2026":"\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u56DE\u7B54\u3002"),q=l?" data-partial-answer":"",R=l?" is-streaming":"";return`${j}
      ${$e?`<div class="answer-block law-answer-block">
              <div class="answer-block-head">
                <span>\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22\u7D50\u679C</span>
                <span>${o&&!m?"\u6CD5\u898F\u8CC7\u6599\u5EAB":`${a.length} \u7B46\u4F86\u6E90`}</span>
              </div>
              <div class="law-answer-content">${Ii(a,X)}</div>
            </div>`:""}
      <div class="answer-block">
        ${$e||le?`<div class="answer-block-head">
                <span>${n(ie)}</span>
                <span>${n(B)}</span>
              </div>`:""}
        <p class="answer-text${R}"${q}>${n(S)}</p>
      </div>
      ${e.notice?`<div class="answer-notice">${n(e.notice)}</div>`:""}
      ${D}
      ${_}
      ${w}`}function yn(e,t,s=""){let a=t.status||"preview",r=a==="operational"?"\u5B8C\u6210":a==="retrieval_only"?"\u50C5\u6AA2\u7D22\u7D50\u679C":a==="preview"?"\u6CD5\u898F\u9810\u89BD":a==="unavailable"||a==="not_configured"?"\u8CC7\u6599\u4E0D\u53EF\u7528":a==="degraded"?"\u964D\u7D1A":"\u5B8C\u6210",i=t.test_run,o=String(t.llm_model||i?.primary_model||"").trim(),l=String(t.embedding_model||"").trim(),m=[o?`LLM\uFF1A${o}`:"",l?`Embedding\uFF1A${l}`:""].filter(Boolean).join(" \xB7 "),b=t.answer_source==="structured",y=t.answer_source==="llm"&&o?`<span class="answer-model" title="${n(m)}">${u("brain",11)}${n(o)}</span>`:b?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${u("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"";return`<div class="answer-head">
      <div class="answer-head-left">${u("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u7D50\u679C</span>
      </div>
      <div class="answer-head-meta">
        ${ke(a,r)}
        <span>${Number(t.duration_ms||0)} ms</span>
        ${y}
      </div>
      ${s}
    </div>
    <div class="answer-body">${wn(t)}</div>`}function Bi(e,t=""){return`<div class="answer-head">
      <div class="answer-head-left">${u("alert",16)}
        <span class="answer-head-title">\u7121\u6CD5\u5B8C\u6210\u6AA2\u7D22</span>
      </div>
      ${t}
    </div>
    <div class="answer-body">
      ${pe({tone:"danger",title:"\u8ACB\u6C42\u5931\u6557",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
    </div>`}function Oi(e){let t=Array.isArray(e.turns)?e.turns:[],s=t.length?t[t.length-1].payload||{}:e.payload||{},a=Array.isArray(s.citations)?s.citations.length:0,r=Array.isArray(s.judgments)?s.judgments.length:0,i=Array.isArray(s.law_sources)?s.law_sources.length:0;return a+r+i}function Di(e,t,s,a=null){let r=e.id??s,i=Oi(e),o=t.get(String(e.project_id||"")),l=Array.isArray(e.turns)?e.turns:[],m=e.updated_at||e.created_at,b=a!=null&&String(a)===String(r);return`<div class="rag-history-item${e.pinned?" is-pinned":""}${b?" is-active":""}">
    <button class="rag-history-open" type="button" data-history-open data-history-id="${n(String(r))}">
      <span class="history-question">${n(e.title||"\u672A\u547D\u540D\u63D0\u554F")}</span>
      <span class="history-meta">
        <span>${n(Lt(m))}</span>
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
  </div>`}function $n(e,t,s){let a=new Map;for(let i of t){let o=String(i.project_id||"");o&&a.set(o,(a.get(o)||0)+1)}let r=[`<button class="rag-project${s?"":" is-active"}" type="button" data-rag-action="select-project" data-project-id="" aria-pressed="${s?"false":"true"}">
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
  </div>`),r.join("")}async function Fi(e){let t=!1,s=[],a=!1,r=[],i=!1,o="",l=8,m="",b=0,y=null,v=[],w=!1,_=!1,g={embedding:[],llm:[]};e.innerHTML=`<section class="page rag-page">
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
        <header class="rag-hero">
      <span class="eyebrow">JUDGMENT \xB7 LEGAL RAG</span>
      <h1 class="rag-title">\u8B93\u6BCF\u4E00\u500B\u7B54\u6848\uFF0C\u90FD\u80FD\u56DE\u5230\u6CD5\u898F\u8207\u5224\u6C7A</h1>
      <p class="rag-lead">\u4EE5\u91D1\u878D\u6CD5\u898F\u7684\u73FE\u884C\u689D\u6587\u8207\u5224\u6C7A\u7247\u6BB5\u70BA\u6AA2\u7D22\u57FA\u790E\u3002
        \u5148\u5F9E Qdrant \u6AA2\u7D22\u76F8\u4F3C\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\uFF1B\u82E5\u7D22\u5F15\u6216\u6A21\u578B\u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u53EF\u9A57\u8B49\u7684\u6AA2\u7D22\u7D50\u679C\u3002</p>
      <div id="rag-mode-notice">${pe({tone:"info",title:"RAG \u670D\u52D9\u72C0\u614B\u6AA2\u67E5\u4E2D",text:"\u6B63\u5728\u78BA\u8A8D Qdrant\u3001Embedding \u8207 LLM \u72C0\u614B\uFF1B\u6240\u6709\u56DE\u7B54\u90FD\u6703\u6A19\u793A\u53EF\u56DE\u6EAF\u7684\u4F86\u6E90\u3002"})}</div>
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
        ${Si.map(d=>`<button class="example-chip" type="button" data-question="${n(d)}">${n(d)}</button>`).join("")}
      </div>
    </header>

    <section class="rag-conversation" id="rag-conversation" aria-live="polite">
      <div class="rag-turns" id="rag-turns">
        ${ia()}
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
  </section>`;let k=e.querySelector("#rag-form"),F=e.querySelector("#rag-question"),Y=e.querySelector("#rag-submit"),K=e.querySelector(".rag-page"),X=e.querySelector("#rag-turns"),W=e.querySelector("#rag-followup-form"),ae=e.querySelector("#rag-followup-question"),oe=e.querySelector("#rag-followup-submit"),le=e.querySelector("#rag-history"),$e=e.querySelector("#rag-storage-note"),ie=e.querySelector("#rag-clear-history"),j=e.querySelector(".rag-library"),$=e.querySelector("#rag-pinned-body"),B=e.querySelector("#rag-projects-body"),D=e.querySelector("#rag-pinned-count"),x=e.querySelector("#rag-projects-count"),S=e.querySelector("#rag-recent-count"),q=e.querySelector("#rag-library-context"),R=e.querySelector("#rag-test-mode"),Q=e.querySelector("#rag-test-flow"),z=e.querySelector("#rag-history-menu"),te=e.querySelector("#rag-judgment-dialog"),me=e.querySelector("#rag-law-dialog"),Se=()=>{document.documentElement.classList.toggle("dialog-open",!!e.querySelector("dialog[open]"))};te?.addEventListener("close",Se),me?.addEventListener("close",Se);let xe=null,Je=null,Re=null,je=null,Ne=()=>{F.style.height="auto",F.style.height=`${Math.min(F.scrollHeight,220)}px`},Te=()=>{ae.style.height="auto",ae.style.height=`${Math.min(ae.scrollHeight,160)}px`},A=d=>{w=!!d,K.classList.toggle("has-conversation",w)},L=()=>{w&&(W.hidden=!1,Te())},N=()=>{W.hidden=!0},O=()=>{z.hidden&&!je||(z.hidden=!0,z.innerHTML="",je&&je.setAttribute("aria-expanded","false"),Re=null,je=null)},se=(d,T)=>{let P=X.querySelector(".rag-empty-answer");P&&P.remove(),X.insertAdjacentHTML("beforeend",fn(d,T));let V=X.lastElementChild,re=V?.querySelector("[data-rag-answer]");return window.requestAnimationFrame(()=>{V?.scrollIntoView({behavior:"smooth",block:"start"})}),{turnElement:V,answerElement:re}},H=()=>{X.innerHTML=v.length?v.map(d=>fn(d.question,yn(d.question,d.payload||{},""))).join(""):ia()},fe=d=>{let T=Array.isArray(d.turns)?d.turns:[];return T.length?(b+=1,ye(),he(null),y=d.id??null,v=T.map(P=>({...P})),m=v[v.length-1]?.question||"",A(!0),H(),L(),Z(),ge(Y,!1),ge(oe,!1),window.setTimeout(()=>{W.scrollIntoView({behavior:"smooth",block:"end"})},50),!0):!1},Z=()=>{if(t)return;if(O(),!a){le.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',$.innerHTML='<div class="rag-library-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>',D.textContent="0",S.textContent="0",i&&(B.innerHTML=$n(r,[],o));return}let d=r.find(_e=>String(_e.id)===o)||null;o&&!d&&(o="");let T=new Map(r.map(_e=>[String(_e.id),_e])),P=s.filter(_e=>!!_e.pinned),V=s.filter(_e=>!_e.pinned),re=o?V.filter(_e=>String(_e.project_id||"")===o):V,be=re.slice(0,l),Ce=(_e,Ge)=>Di(_e,T,Ge,y);$.innerHTML=P.length?P.map(Ce).join(""):'<div class="rag-library-empty">\u5C1A\u7121\u91D8\u9078\u9805\u76EE\u3002\u5C07\u6700\u8FD1\u9805\u76EE\u91D8\u9078\u5F8C\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</div>',B.innerHTML=$n(r,s,o),le.innerHTML=be.length?be.map(Ce).join(""):`<div class="rag-library-empty">${o?"\u9019\u500B\u5C08\u6848\u9084\u6C92\u6709\u672A\u91D8\u9078\u7684\u9805\u76EE\u3002":P.length?"\u6700\u8FD1\u7684\u9805\u76EE\u90FD\u5DF2\u91D8\u9078\u3002":"\u5C1A\u7121\u63D0\u554F\u7D00\u9304\u3002\u9001\u51FA\u7B2C\u4E00\u500B\u554F\u984C\u5F8C\u6703\u4FDD\u5B58\u5728\u6B64\u700F\u89BD\u5668\u3002"}</div>`,re.length>l&&le.insertAdjacentHTML("beforeend",`<button class="rag-library-more" type="button" data-rag-action="more-recent">\u986F\u793A\u66F4\u591A \xB7 ${c(re.length-l)} \u7B46</button>`),D.textContent=String(P.length),x.textContent=String(r.length),S.textContent=String(re.length),d?(q.hidden=!1,q.innerHTML=`<span>${u("folder",12)}<strong>${n(d.name)}</strong></span><button type="button" data-rag-action="clear-project" title="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE" aria-label="\u8FD4\u56DE\u5168\u90E8\u9805\u76EE">${u("x",12)}</button>`):(q.hidden=!0,q.innerHTML="")},Ie=async()=>{try{let d=await ht("rag.projects",[]);r=Array.isArray(d)?d.map(T=>({id:String(T?.id||""),name:String(T?.name||"").trim()})).filter(T=>T.id&&T.name):[]}catch{r=[]}i=!0,t||Z()},J=d=>{o=String(d||""),l=8,Z()},ce=()=>{let d=B.querySelector('[data-rag-form="project"]');d&&(d.hidden=!1,d.querySelector("input")?.focus())},qe=()=>{let d=B.querySelector('[data-rag-form="project"]');d&&(d.hidden=!0,d.reset())},Le=async d=>{let T=d.elements.project_name,P=String(T?.value||"").trim();if(!P){M("\u8ACB\u8F38\u5165\u5C08\u6848\u540D\u7A31\u3002","warn"),T?.focus();return}if(r.some(re=>re.name.toLowerCase()===P.toLowerCase())){M("\u5DF2\u6709\u540C\u540D\u5C08\u6848\u3002","warn"),T?.focus();return}let V=typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():`project-${Date.now()}-${Math.random().toString(16).slice(2)}`;r=[...r,{id:V,name:P.slice(0,60),created_at:new Date().toISOString()}],o=V,l=8,await os("rag.projects",r),Z(),M(`\u5DF2\u5EFA\u7ACB\u5C08\u6848\u300C${P}\u300D\u3002`,"ok")},ot=async d=>{let T=s.find(re=>String(re.id)===String(d));if(!T)return;let P=!T.pinned;if(!await Ft(T.id,{pinned:P})){M("\u7121\u6CD5\u66F4\u65B0\u91D8\u9078\u72C0\u614B\u3002","danger");return}T.pinned=P,Z(),M(P?"\u5DF2\u91D8\u9078\u9805\u76EE\u3002":"\u5DF2\u53D6\u6D88\u91D8\u9078\u3002","ok")},gt=()=>{b+=1,ye(),he(null),m="",y=null,v=[],A(!1),N(),X.innerHTML=ia(),F.value="",Ne(),ae.value="",Te(),ge(Y,!1),ge(oe,!1),Z(),te?.open&&te.close(),me?.open&&me.close(),F.focus(),window.scrollTo({top:0,behavior:"smooth"})},It=d=>{if(!d||z.hidden)return;let T=d.getBoundingClientRect(),P=z.getBoundingClientRect(),V=6,re=T.bottom+V;re+P.height>window.innerHeight-8&&(re=Math.max(8,T.top-P.height-V));let be=T.right-P.width;be=Math.max(8,Math.min(be,window.innerWidth-P.width-8)),z.style.left=`${Math.round(be)}px`,z.style.top=`${Math.round(re)}px`},De=d=>{z.innerHTML=`
      <button type="button" role="menuitem" data-menu-action="rename">${u("edit",13)}<span>\u91CD\u65B0\u547D\u540D</span></button>
      <button type="button" role="menuitem" data-menu-action="toggle-pin">${u("pin",13)}<span>${d.pinned?"\u53D6\u6D88\u91D8\u9078":"\u91D8\u9078"}</span></button>
      <button type="button" role="menuitem" data-menu-action="share">${u("link",13)}<span>\u5206\u4EAB</span></button>
      <button type="button" role="menuitem" data-menu-action="move">${u("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></button>
      <div class="rag-history-menu-divider"></div>
      <button class="is-danger" type="button" role="menuitem" data-menu-action="delete">${u("trash",13)}<span>\u522A\u9664</span></button>`},As=d=>{let T=String(d.project_id||""),P=[{id:"",name:"\u672A\u5206\u985E"},...r.map(V=>({id:String(V.id),name:V.name}))];z.innerHTML=`
      <div class="rag-history-menu-head">${u("folder",13)}<span>\u79FB\u81F3\u5C08\u6848</span></div>
      ${P.map(V=>`<button type="button" role="menuitem"
            data-menu-action="assign-project" data-project-id="${n(V.id)}">
            <span class="rag-history-menu-check">${T===V.id?u("check",12):""}</span>
            <span>${n(V.name)}</span>
          </button>`).join("")}
      ${r.length?"":'<div class="rag-history-menu-note">\u5C1A\u672A\u5EFA\u7ACB\u5C08\u6848\uFF0C\u53EF\u5148\u5F9E\u5DE6\u5074\u5EFA\u7ACB\u3002</div>'}
      <div class="rag-history-menu-divider"></div>
      <button type="button" role="menuitem" data-menu-action="back">${u("chevronLeft",13)}<span>\u8FD4\u56DE</span></button>`},Xt=(d,T)=>{let P=s.find(V=>String(V.id)===String(T));P&&(O(),Re=String(P.id),je=d,De(P),z.hidden=!1,d.setAttribute("aria-expanded","true"),It(d))},Zt=async d=>{let T=window.prompt("\u91CD\u65B0\u547D\u540D\u5C0D\u8A71",d.title||"");if(T===null)return;let P=T.trim();if(!P){M("\u540D\u7A31\u4E0D\u80FD\u7A7A\u767D\u3002","warn");return}if(P===d.title)return;if(!await Ft(d.id,{title:P})){M("\u91CD\u65B0\u547D\u540D\u5931\u6557\u3002","danger");return}d.title=P,Z(),M("\u5C0D\u8A71\u5DF2\u91CD\u65B0\u547D\u540D\u3002","ok")},qt=async d=>{let T=Array.isArray(d.turns)?d.turns:[],P=[`# ${d.title||"\u672A\u547D\u540D\u5C0D\u8A71"}`,""];if(T.length)for(let re of T){P.push("## \u554F\u984C","",re.question||"",""),P.push("## \u56DE\u7B54","",re.payload?.answer||"\uFF08\u6C92\u6709\u56DE\u7B54\u5167\u5BB9\uFF09","");let be=Array.isArray(re.payload?.law_sources)?re.payload.law_sources.map(Ce=>Ce.law_name).filter(Boolean):[];be.length&&P.push(`\u5F15\u7528\uFF1A${[...new Set(be)].join("\u3001")}`,"")}else P.push(d.title||"");let V=await Mt(P.join(`
`));M(V?"\u5C0D\u8A71\u5167\u5BB9\u5DF2\u8907\u88FD\uFF0C\u53EF\u76F4\u63A5\u8CBC\u4E0A\u5206\u4EAB\u3002":"\u7121\u6CD5\u8907\u88FD\u5C0D\u8A71\u5167\u5BB9\u3002",V?"ok":"warn")},es=async d=>{if(!window.confirm(`\u522A\u9664\u5C0D\u8A71\u300C${d.title||"\u672A\u547D\u540D\u5C0D\u8A71"}\u300D\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002`))return;if(!await Na(d.id)){M("\u522A\u9664\u5931\u6557\u3002","danger");return}let P=y!==null&&String(y)===String(d.id);s=s.filter(V=>String(V.id)!==String(d.id)),P?gt():Z(),M("\u5C0D\u8A71\u5DF2\u522A\u9664\u3002","ok")},Ls=async(d,T)=>{if(!await Ft(d.id,{project_id:T})){M("\u79FB\u81F3\u5C08\u6848\u5931\u6557\u3002","danger");return}d.project_id=T;let V=r.find(re=>String(re.id)===String(T));Z(),M(V?`\u5DF2\u79FB\u81F3\u5C08\u6848\u300C${V.name}\u300D\u3002`:"\u5DF2\u79FB\u51FA\u5C08\u6848\u3002","ok")},Pt=async d=>{let T=d.target.closest("[data-menu-action]");if(!T)return;let P=s.find(re=>String(re.id)===Re);if(!P){O();return}let V=T.dataset.menuAction;V==="rename"?(O(),await Zt(P)):V==="toggle-pin"?(O(),await ot(P.id)):V==="share"?(O(),await qt(P)):V==="move"?(As(P),It(je)):V==="assign-project"?(O(),await Ls(P,T.dataset.projectId||"")):V==="back"?(De(P),It(je)):V==="delete"&&(O(),await es(P))},Bt=d=>{z.hidden||(typeof d.composedPath=="function"?d.composedPath():[]).includes(z)||z.contains(d.target)||d.target.closest('[data-rag-action="open-history-menu"]')||O()},p=d=>{d.key==="Escape"&&O()},f=d=>{d.target instanceof Node&&z.contains(d.target)||O()},h=async()=>{try{if(s=await is({limit:120}),t)return;a=!0,Z(),$e.textContent=rs()==="indexeddb"?"\u63D0\u554F\u7D00\u9304\u5132\u5B58\u5728\u700F\u89BD\u5668 IndexedDB\uFF0C\u4E0D\u6703\u4E0A\u50B3\u5230\u4F3A\u670D\u5668\u3002":"\u700F\u89BD\u5668\u5132\u5B58\u4E0D\u53EF\u7528\uFF0C\u63D0\u554F\u7D00\u9304\u53EA\u4FDD\u7559\u5728\u672C\u6B21\u5DE5\u4F5C\u968E\u6BB5\u3002"}catch{if(t)return;s=[],a=!0,Z(),le.innerHTML='<div class="rag-library-empty">\u7121\u6CD5\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u3002</div>'}},E=async(d,T,P,V)=>{let re=v,be=y;re.push({question:d,asked_at:new Date().toISOString(),payload:xi(T)});let Ce=Array.isArray(T.citations)?T.citations:[],_e=Array.isArray(T.judgments)?T.judgments:[],Ge={question:d,status:T.status,citations:Ce.map(Ke=>Ke.law_name),judgments:_e.map(Ke=>Ke.jid)},nt=`${T.status||"preview"} \xB7 ${re.length} \u8F2A`,Xe=new Date().toISOString(),xt=Ke=>{V===b&&(y=Ke)};if(be){if(!await Ft(be,{turns:re,detail:nt,payload:Ge,updated_at:Xe})){let Ot=await Dt({kind:"rag",title:re[0]?.question||d,detail:nt,project_id:P,turns:re,payload:Ge,updated_at:Xe});xt(Ot)}}else{let Ke=await Dt({kind:"rag",title:re[0]?.question||d,detail:nt,project_id:P,turns:re,payload:Ge,updated_at:Xe});xt(Ke)}await h()},I=async()=>{try{let d=await U.status();if(t)return;let T=d.data||{},V=new Map((d.services||[]).map(_e=>[_e.id,_e])).get("rag"),re=Number(T.judgment_indexed_count||0),be=Number(T.judgment_count||0),Ce=e.querySelector("#rag-mode-notice");if(!Ce)return;V?.status==="operational"?Ce.innerHTML=pe({tone:"ok",title:"\u6AA2\u7D22\u8207\u56DE\u7B54\u5C31\u7DD2",text:`Qdrant\u3001Embedding \u8207 LLM \u5747\u53EF\u4F7F\u7528\uFF1B\u76EE\u524D\u7D22\u5F15\u6DB5\u84CB ${c(re)} / ${c(be)} \u7B46\u5224\u6C7A\u3002\u56DE\u7B54\u4E0D\u662F\u6CD5\u5F8B\u610F\u898B\u3002`}):V?.status==="degraded"?Ce.innerHTML=pe({tone:"warn",title:"\u90E8\u5206 AI \u5143\u4EF6\u672A\u5C31\u7DD2",text:n(V.detail||"RAG \u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u6AA2\u7D22\u7D50\u679C\u3002")}):Ce.innerHTML=pe({tone:"info",title:"\u5411\u91CF\u7D22\u5F15\u5C1A\u672A\u5C31\u7DD2 \xB7 \u4E0D\u662F\u6CD5\u5F8B\u610F\u898B",text:n(V?.detail||"\u8A2D\u5B9A QDRANT_URL\u3001EMBEDDING_URL \u8207 LLM_URL \u4E26\u57F7\u884C judgment-index-vectors \u5F8C\u5373\u53EF\u555F\u7528\u5224\u6C7A\u6AA2\u7D22\u3002")})}catch(d){if(t)return;let T=e.querySelector("#rag-mode-notice");T&&(T.innerHTML=pe({tone:"warn",title:"\u7121\u6CD5\u53D6\u5F97 RAG \u670D\u52D9\u72C0\u614B",text:n(d.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\uFF0C\u6216\u524D\u5F80\u7CFB\u7D71\u72C0\u614B\u9801\u67E5\u770B\u3002")}))}},C=()=>{if(!R)return;if(!_){R.innerHTML="";return}let d=Array.isArray(g.embedding)?g.embedding.length:0,T=Array.isArray(g.llm)?g.llm.length:0;R.innerHTML=pe({tone:"warn",title:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F",text:`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${d} \u500B embedding \u8207 ${T} \u500B LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002\u6E2C\u8A66 Flow \u6703\u5728\u9801\u9762\u4E0B\u65B9\u5373\u6642\u986F\u793A\uFF0C\u4E5F\u53EF\u5230 <a href="#/tests">\u7CFB\u7D71\u6E2C\u8A66</a> \u6216 <a href="#/performance">\u6548\u80FD\u5831\u8868</a> \u67E5\u770B\u6B77\u53F2\u3002`})},G=async()=>{try{let d=await U.testMode();if(t)return;_=!!d.enabled,g=d.models||{embedding:[],llm:[]},C()}catch{if(t)return;_=!1,C()}},de=d=>{_=!!d.detail?.enabled,g=d.detail?.models||{embedding:[],llm:[]},C()};window.addEventListener("judgment:test-mode",de);let he=d=>{Q&&(Je=d||null,Q.innerHTML=d?Et(d,[],"",{showHistory:!1}):"")},ye=()=>{xe&&(window.clearTimeout(xe),xe=null)},we=()=>{ye();let d=async()=>{if(!t){try{let T=await U.testRunCurrent();if(t)return;let P=T.run;P&&P.status==="running"&&he(P)}catch{}t||(xe=window.setTimeout(d,1500))}};d()},Be=async d=>{if(!d){he(null);return}try{let T=await U.testRun(d);if(t)return;he(T.run||null)}catch{t||M("\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF0C\u4F46\u7121\u6CD5\u8F09\u5165\u6E2C\u8A66 Flow\u3002","warn")}},Pe=async()=>{if(_)try{let d=await U.testRunCurrent();if(t)return;d.run?.status==="running"&&(he(d.run),we())}catch{}},Ms=0,js=(d,T)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">DB ORIGINAL JUDGMENT</div>
      <h2>${n(d)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-parquet-judgment" aria-label="\u95DC\u9589">${u("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${T}</div>`,Zn=d=>{let T=(Array.isArray(d.matched_laws)?d.matched_laws:[]).map(be=>vs(be)).join(""),P=[d.court,d.jdate,d.title?`\u6848\u7531\uFF1A${d.title}`:"",d.full_text_length?`${c(d.full_text_length)} \u5B57`:"",d.citation_count?`\u5F15\u7528 ${c(d.citation_count)} \u7B46`:""].filter(Boolean).map(be=>`<span>${n(be)}</span>`).join(""),V=d.parquet_generated_at?`DB \u5132\u5B58\u539F\u6587\uFF08\u539F\u59CB Parquet\uFF09\xB7 ${n(String(d.parquet_generated_at).replace("T"," ").slice(0,19))}`:"DB \u5132\u5B58\u539F\u6587",re=d.pdf_url?`<a class="btn btn-secondary btn-sm" href="${n(d.pdf_url)}" target="_blank" rel="noopener noreferrer">${u("external",13)}<span>\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF</span></a>`:"";return js(d.jid||"\u5224\u6C7A\u5168\u6587",`<div class="judgment-dialog-meta">
        <span class="badge badge-info">${n(d.source==="parquet"?"DB \u5132\u5B58\u539F\u6587":"PostgreSQL")}</span>
        ${P}
      </div>
      ${T?`<div class="chips" style="margin:8px 0 10px">${T}</div>`:""}
      <div class="judgment-dialog-source">${V}</div>
      <pre class="judgment-dialog-text">${n(d.full_text||"\u6B64\u5224\u6C7A\u6C92\u6709\u5168\u6587\u3002")}</pre>
      <div class="judgment-dialog-actions">
        ${re}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-parquet-judgment">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},$a=async d=>{if(!te||!d)return;let T=++Ms;te.open||te.showModal(),Se(),te.innerHTML=js("\u8B80\u53D6\u5224\u6C7A\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E DB \u5132\u5B58\u539F\u6587\u8B80\u53D6 ${n(d)}\u2026</span>
      </div>`);try{let P=await U.judgmentDetail(d,"parquet");if(t||T!==Ms)return;te.innerHTML=Zn(P)}catch(P){if(t||T!==Ms)return;te.innerHTML=js("\u7121\u6CD5\u8B80\u53D6 DB \u539F\u6587\u5224\u6C7A",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${n(P.message||"\u627E\u4E0D\u5230\u5224\u6C7A\u5168\u6587\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u5DF2\u57F7\u884C <span class="mono">uv run judgment-import-judgments --raw-only</span>\uFF0C\u4E14\u539F\u59CB Parquet \u5B58\u5728\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-parquet-judgment">\u95DC\u9589</button>
        </div>`)}},Ts=0,Es=(d,T)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">LOCAL PARQUET LAW</div>
      <h2>${n(d)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-law-source" aria-label="\u95DC\u9589">${u("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${T}</div>`,er=(d,T="")=>{let P=String(d.selected_article_no||T||"").trim(),V=!!P,re=Array.isArray(d.articles)?d.articles:[],be=re.map(lt=>{let Rs=String(lt.article_content||"").trim();return Rs?lt.article_type==="C"?`<div class="law-chapter">${n(Rs)}</div>`:`<article class="law-article" data-article-no="${n(hn(lt.article_no))}">
          <div class="law-article-head">
            <span class="law-article-no">${n(lt.article_no||"\u689D\u6587")}</span>
          </div>
          <div class="law-article-text">${n(Rs)}</div>
        </article>`:""}).join(""),Ce=(Array.isArray(d.warnings)?d.warnings:[]).map(lt=>n(lt)).join("<br />"),_e=d.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F",Ge=d.meta?.articles_source,nt=Ge==="parquet"?"Parquet \u689D\u6587":Ge==="postgresql"?"PostgreSQL \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",Xe=d.meta?.snapshot||"",xt=[d.law_level,d.law_category,d.article_count?`${c(d.article_count)} \u689D`:"",d.law_modified_date?`\u7570\u52D5 ${Ze(d.law_modified_date)}`:""].filter(Boolean).map(lt=>`<span>${n(lt)}</span>`).join(""),Ke=d.law_url?`<a class="btn btn-secondary btn-sm" href="${n(d.law_url)}" target="_blank" rel="noopener noreferrer">${u("external",13)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:"",Ot=!V&&d.law_histories?`<details class="law-dialog-history">
          <summary>\u6CD5\u898F\u6CBF\u9769</summary>
          <div>${n(d.law_histories)}</div>
        </details>`:"",Ee=V?`<span class="badge badge-mono">${n(P)}</span>`:"",Ye=!V&&re.length>1?`<div class="law-dialog-jump">
          <div class="law-article-jump">
            <input class="input law-article-jump-input law-jump-input"
              id="rag-law-article-jump" type="text" inputmode="numeric"
              autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
            <button class="btn btn-secondary btn-sm" type="button"
              data-action="jump-law-article"
              data-jump-input="rag-law-article-jump">\u8DF3\u81F3\u689D\u6587</button>
          </div>
        </div>`:"",At=V?`${d.law_name||d.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4"} \xB7 ${P}`:d.law_name||d.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4";return Es(At,`<div class="judgment-dialog-meta">
        <span class="badge ${d.source_type==="order"?"badge-warn":"badge-info"}">${n(_e)}</span>
        ${Ee}
        ${xt}
      </div>
      <div class="judgment-dialog-source">${n([nt,Xe].filter(Boolean).join(" \xB7 "))}</div>
      ${Ce?`<div class="law-dialog-warning">${Ce}</div>`:""}
      ${Ot}
      ${Ye}
      <div class="law-dialog-articles">${be||`<div class="report-empty-inline">${V?"\u9019\u689D\u689D\u6587\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u5167\u5BB9\u3002":"\u9019\u500B\u6CD5\u898F\uFF0F\u547D\u4EE4\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u3002"}</div>`}</div>
      <div class="judgment-dialog-actions">
        ${Ke}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-law-source">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},wa=(d,T)=>{let P=d?.querySelector(`#${T}`),V=hn(P?.value||"");if(!V){M("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),P?.focus();return}let re=[...d?.querySelectorAll("[data-article-no]")||[]].find(be=>be.dataset.articleNo===V);if(!re){M(`\u627E\u4E0D\u5230\u7B2C ${V} \u689D\u3002`,"warn");return}re.scrollIntoView({behavior:"instant",block:"center"}),re.classList.add("is-jump-target"),window.setTimeout(()=>re.classList.remove("is-jump-target"),2400)},Ns=async(d,T="",P="")=>{if(!me||!d)return;let V=++Ts;me.open||me.showModal(),Se(),me.innerHTML=Es(P?"\u8B80\u53D6\u6CD5\u898F\u689D\u6587\u4E2D\u2026":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E\u672C\u5730 Parquet \u8B80\u53D6 ${n([d,P].filter(Boolean).join(" \xB7 "))} \u7684\u539F\u59CB\u689D\u6587\u2026</span>
      </div>`);try{let re=await U.lawDetail(d,T,"",P);if(t||V!==Ts)return;me.innerHTML=er(re,P)}catch(re){if(t||V!==Ts)return;me.innerHTML=Es("\u7121\u6CD5\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u6587",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${n(re.message||"\u627E\u4E0D\u5230\u689D\u6587\u5167\u5BB9\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u672C\u5730\u539F\u59CB\u6CD5\u898F Parquet \u5B58\u5728\uFF0C\u4E14 PostgreSQL metadata \u8207\u5176\u4E00\u81F4\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-law-source">\u95DC\u9589</button>
        </div>`)}};me?.addEventListener("click",d=>{let T=d.target.closest('[data-action="jump-law-article"]');if(T){wa(me,T.dataset.jumpInput||"rag-law-article-jump");return}if(d.target.closest('[data-action="close-law-source"]')){me.close();return}let P=me.getBoundingClientRect();(d.clientX<P.left||d.clientX>P.right||d.clientY<P.top||d.clientY>P.bottom)&&me.close()}),me?.addEventListener("keydown",d=>{!d.target.matches(".law-jump-input")||d.key!=="Enter"||(d.preventDefault(),wa(me,d.target.id))}),te?.addEventListener("click",d=>{let T=d.target.closest('[data-action="open-law-source"]');if(T){Ns(T.dataset.lawKey||"",T.dataset.sourceType||"",T.dataset.articleNo||"");return}if(d.target.closest('[data-action="close-parquet-judgment"]')){te.close();return}let P=te.getBoundingClientRect();(d.clientX<P.left||d.clientX>P.right||d.clientY<P.top||d.clientY>P.bottom)&&te.close()}),X.addEventListener("click",d=>{let T=d.target.closest(".rag-process-toggle");if(T){let V=T.closest(".rag-process"),re=T.getAttribute("aria-expanded")==="true";oa(V,!re);return}let P=d.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(P){if(P.dataset.action==="open-law-source"){Ns(P.dataset.lawKey||"",P.dataset.sourceType||"",P.dataset.articleNo||"");return}$a(P.dataset.jid||"")}}),X.addEventListener("keydown",d=>{if(d.key!=="Enter"&&d.key!==" ")return;let T=d.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(!(!T||T.closest("a, button"))){if(d.preventDefault(),T.dataset.action==="open-law-source"){Ns(T.dataset.lawKey||"",T.dataset.sourceType||"",T.dataset.articleNo||"");return}$a(T.dataset.jid||"")}});let Cs=async(d,{fresh:T=!1,source:P="hero"}={})=>{let V=d.trim();if(!V){M("\u8ACB\u5148\u8F38\u5165\u554F\u984C\u3002","warn"),(P==="followup"?ae:F).focus();return}(T||!w)&&(y=null,v=[],X.innerHTML="",Z());let re=++b,be=()=>t||re!==b,Ce=o;m=V,A(!0),N(),P==="followup"?(ae.value="",Te()):(F.value="",Ne());let{answerElement:_e}=se(V,Ti(V,_)),Ge=_?null:ji(_e);_?(he(null),we()):(ye(),he(null)),ge(Y,!0,"\u6AA2\u7D22\u4E2D\u2026"),ge(oe,!0,"\u6AA2\u7D22\u4E2D\u2026");let nt=null,Xe="",xt=Ee=>{if(be()||!Ee?.partial)return;let Ye=_e.querySelector(".answer-body");if(!Ye)return;nt=Ee,Xe=String(Ee.answer||""),Ye.innerHTML=wn(Ee),Ge?.collapse?.();let At=_e.querySelector(".answer-head-title");At&&(At.textContent=Ee.streaming?"LLM \u56DE\u7B54\u751F\u6210\u4E2D":"\u6CD5\u898F\u7D50\u679C\u5DF2\u986F\u793A")},Ke=Ee=>{if(be()||!Ee||!nt?.streaming)return;Xe+=Ee;let Ye=_e.querySelector("[data-partial-answer]");Ye&&(Ye.textContent=Xe)},Ot=()=>{if(be()||!nt?.streaming)return;Xe="";let Ee=_e.querySelector("[data-partial-answer]");Ee&&(Ee.textContent="\u6B63\u5728\u91CD\u65B0\u751F\u6210\u56DE\u7B54\u2026")};try{let Ee=_?await U.rag(V,{testMode:_}):await U.ragStream(V,{onStep:At=>{be()||Ge?.step(At)},onPartial:xt,onToken:Ke,onTokenReset:Ot});if(be())return;ye();let Ye=Ge?.finish(!0)||"";if(_e.innerHTML=yn(V,Ee,Ye),Ee.test_run?.run_id?await Be(Ee.test_run.run_id):he(null),await E(V,Ee,Ce,re),be())return;L()}catch(Ee){if(be())return;ye();let Ye=Ge?.finish(!1)||"";_e.innerHTML=Bi(Ee,Ye),L(),M(Ee.message||"\u6AA2\u7D22\u5931\u6557\u3002","danger")}finally{be()||(ye(),ge(Y,!1),ge(oe,!1))}};return k.addEventListener("submit",d=>{d.preventDefault(),Cs(F.value,{fresh:!0,source:"hero"})}),W.addEventListener("submit",d=>{d.preventDefault(),Cs(ae.value,{fresh:!1,source:"followup"})}),F.addEventListener("input",Ne),F.addEventListener("keydown",d=>{d.key==="Enter"&&!d.shiftKey&&!d.isComposing&&(d.preventDefault(),k.requestSubmit())}),ae.addEventListener("input",Te),ae.addEventListener("keydown",d=>{d.key==="Enter"&&!d.shiftKey&&!d.isComposing&&(d.preventDefault(),W.requestSubmit())}),e.querySelector("#example-chips").addEventListener("click",d=>{let T=d.target.closest("[data-question]");T&&(F.value=T.dataset.question,Ne(),k.requestSubmit())}),j.addEventListener("click",async d=>{let T=d.target.closest("[data-rag-toggle]");if(T){let _e=T.closest(".rag-library-section").classList.toggle("is-collapsed");T.setAttribute("aria-expanded",String(!_e));return}let P=d.target.closest("[data-rag-action]"),V=P?.dataset.ragAction||"";if(V==="new-chat"){gt();return}if(V==="open-history-menu"){Xt(P,P.dataset.historyId);return}if(V==="toggle-pin"){await ot(P.dataset.historyId);return}if(V==="select-project"){J(P.dataset.projectId||"");return}if(V==="show-project-form"){ce();return}if(V==="cancel-project"){qe();return}if(V==="more-recent"){l+=12,Z();return}if(V==="clear-project"){J("");return}let re=d.target.closest("[data-history-open]");if(!re)return;let be=s.find(Ce=>String(Ce.id)===String(re.dataset.historyId));be&&(o=String(be.project_id||""),Z(),!fe(be)&&(y=null,v=[],Cs(be.title,{fresh:!0,source:"history"})))}),j.addEventListener("submit",async d=>{let T=d.target.closest('[data-rag-form="project"]');T&&(d.preventDefault(),await Le(T))}),z.addEventListener("click",Pt),document.addEventListener("click",Bt),document.addEventListener("keydown",p),window.addEventListener("scroll",f,!0),window.addEventListener("resize",O),ie.addEventListener("click",async()=>{if(!s.length){M("\u76EE\u524D\u6C92\u6709\u53EF\u6E05\u9664\u7684\u63D0\u554F\u7D00\u9304\u3002","info");return}window.confirm("\u78BA\u5B9A\u6E05\u9664\u9019\u500B\u700F\u89BD\u5668\u7684\u6240\u6709\u63D0\u554F\u7D00\u9304\uFF1F")&&(await Ca(),await h(),M("\u5DF2\u6E05\u9664\u672C\u6A5F\u63D0\u554F\u7D00\u9304\u3002","ok"))}),Ne(),await Promise.allSettled([I(),h(),Ie(),G()]),await Pe(),()=>{t=!0,ye(),O(),document.removeEventListener("click",Bt),document.removeEventListener("keydown",p),window.removeEventListener("scroll",f,!0),window.removeEventListener("resize",O),document.documentElement.classList.remove("dialog-open"),window.removeEventListener("judgment:test-mode",de),m&&X.setAttribute("data-last-question",m)}}var da={};ft(da,{render:()=>ho});var Hi=2e3,zi={running:{label:"\u57F7\u884C\u4E2D",tone:"info"},success:{label:"\u5B8C\u6210",tone:"ok"},failed:{label:"\u5931\u6557",tone:"danger"},interrupted:{label:"\u5DF2\u4E2D\u6B62",tone:"warn"},stale:{label:"\u72C0\u614B\u5931\u6548",tone:"warn"},skipped:{label:"\u7565\u904E",tone:"idle"},pending:{label:"\u7B49\u5F85",tone:"idle"},idle:{label:"\u5F85\u547D",tone:"idle"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},operational:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},unavailable:{label:"\u7121\u6CD5\u53D6\u5F97",tone:"danger"},missing:{label:"\u5C1A\u7121\u7D00\u9304",tone:"idle"},error:{label:"\u8B80\u53D6\u5931\u6557",tone:"danger"},ok:{label:"\u6B63\u5E38",tone:"ok"}},_n={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},kn={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},Mn={judgment:"\u5224\u6C7A",law:"\u6CD5\u898F",order:"\u547D\u4EE4",system:"\u7CFB\u7D71"},hs={judgment:"#a78bfa",law:"#22d3ee",order:"#f472b6",system:"#94a3b8"},Ui={extract:"file",raw_parquet:"cube",filter:"filter",postgres:"database",qdrant:"brain",download:"download",parse:"sliders"},Ji={raw_parquet:"\u539F\u59CB Parquet",postgres:"PostgreSQL"};function Gt(e){return zi[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function Ue(e,t){let s=Gt(e);return`<span class="badge ${_n[s.tone]||_n.idle}"><span class="status-dot ${kn[s.tone]||kn.idle}"></span>${n(t||s.label)}</span>`}function kt(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function Sn(e){return e==null?"\u7121\u6CD5\u53D6\u5F97":c(e)}function Nt(e){return e&&e.color?String(e.color):"var(--accent)"}function ys(e,t=""){let s=e.percent===null||e.percent===void 0?null:Math.max(0,Math.min(100,Number(e.percent)||0)),a=e.status==="running"&&s===null,r=a?' aria-valuetext="\u9032\u5EA6\u672A\u77E5"':` aria-valuenow="${s??0}"`;return`<div class="processing-bar${a?" is-indeterminate":""}${t?` ${t}`:""}" role="progressbar" aria-valuemin="0" aria-valuemax="100"${r}>
    <span class="processing-bar-fill" style="width:${s??0}%;background:${n(Nt(e))}"></span>
  </div>`}function Qi(e){let t=e.unit==="bytes"?"":e.unit||"\u7B46",s=e.current,a=e.total;return s==null?e.status==="running"?"\u9032\u884C\u4E2D":"\u2014":e.unit==="bytes"?a?`${ue(s)} / ${ue(a)}`:ue(s):a?`${c(s)} / ${c(a)} ${t}`:`${c(s)} ${t}`}function Gi(e){let t=[`<span>${n(Qi(e))}</span>`];return e.percent===null||e.percent===void 0?e.status==="running"&&t.push('<span class="mono">\u9032\u5EA6\u672A\u77E5</span>'):t.push(`<span class="mono">${kt(e.percent)}</span>`),e.duration_ms&&t.push(`<span class="mono">${ne(e.duration_ms)}</span>`),t.join("")}function Vi(e){let s=(Array.isArray(e.stats)?e.stats:[]).map(r=>`<span class="processing-stage-stat"><span>${n(r.label)}</span><strong>${n(r.value)}</strong></span>`),a=e.coverage;return a&&a.indexed!==null&&a.indexed!==void 0&&a.total!==null&&a.total!==void 0&&s.push(`<span class="processing-stage-stat"><span>\u7D22\u5F15\u8986\u84CB</span><strong>${c(a.indexed)} / ${c(a.total)}</strong></span>`),s.length?`<div class="processing-stage-stats">${s.join("")}</div>`:""}function Wi(e,{compact:t=!1,step:s=null}={}){let a=Gt(e.status),r=e.status==="running";return`<div class="processing-stage${t?" is-compact":""} is-${a.tone}${r?" is-live":""}" style="--stage-color:${n(Nt(e))}"${r?' aria-current="step"':""}>
    <div class="processing-stage-head">
      ${s===null?"":`<span class="processing-stage-step">${String(s).padStart(2,"0")}</span>`}
      <span class="processing-stage-swatch" style="background:${n(Nt(e))}"></span>
      <span class="processing-stage-label">${n(e.label||e.key)}</span>
      ${Ue(e.status)}
    </div>
    ${ys(e)}
    <div class="processing-stage-meta">${Gi(e)}</div>
    ${e.message?`<div class="processing-stage-message" title="${n(e.message)}">${n(e.message)}</div>`:""}
    ${t?"":Vi(e)}
  </div>`}function jn(e){let t=Gt(e);return`<span class="flow-status is-${t.tone}"><span class="flow-status-dot"></span>${n(t.label)}</span>`}function qn(e,t){return t==null||t===""?"\u2014":e.unit==="bytes"?ue(t):c(t)}function Ki(e){let t=[{label:"\u76EE\u524D",value:qn(e,e.current)},{label:"\u7E3D\u91CF",value:qn(e,e.total)},{label:"\u767E\u5206\u6BD4",value:e.percent===null||e.percent===void 0?e.status==="running"?"\u8A08\u7B97\u4E2D":"\u2014":kt(e.percent)},{label:"\u8017\u6642",value:e.duration_ms?ne(e.duration_ms):"\u2014"}],s=Array.isArray(e.stats)?e.stats:[];for(let r of s){if(t.length>=6)break;r&&r.label&&r.value&&t.push({label:String(r.label),value:String(r.value)})}let a=e.coverage;return a&&a.indexed!==null&&a.indexed!==void 0&&a.total!==null&&a.total!==void 0&&!t.some(r=>r.label==="\u7D22\u5F15\u8986\u84CB")&&t.push({label:"\u7D22\u5F15\u8986\u84CB",value:`${c(a.indexed)} / ${c(a.total)}`}),t}function Yi(e,t){let s=Gt(e.status),a=e.status==="running",r=Ki(e);return`<article class="flow-node is-${s.tone}${a?" is-live":""}" style="--stage-color:${n(Nt(e))}"${a?' aria-current="step"':""}>
    <div class="flow-node-head">
      <span class="flow-node-icon">${u(Ui[e.key]||"cube",14)}</span>
      <div class="flow-node-heading">
        <span class="flow-node-kicker">STEP ${String(t+1).padStart(2,"0")}</span>
        <strong>${n(Ji[e.key]||e.label||e.key)}</strong>
      </div>
      ${jn(e.status)}
    </div>
    <div class="flow-node-body">
      ${ys(e,"flow-progress")}
      <div class="flow-node-props">${r.map(i=>`<div class="flow-prop"><span>${n(i.label)}</span><strong>${n(i.value)}</strong></div>`).join("")}</div>
      ${e.message?`<div class="flow-node-note" title="${n(e.message)}">${n(e.message)}</div>`:""}
    </div>
  </article>`}function Xi(e,t,s,a){let r=Nt(e),i=a||"#8b5cf6",o=e.status==="running",l=`${s}-${t}`,m=`flow-gradient-${l}`,b=`flow-marker-${l}`,y=t%2===0?"M2 60 C8 42 16 78 22 60":"M2 60 C8 78 16 42 22 60";return`<div class="flow-link${o?" is-live":""}" style="color:${n(r)}" aria-hidden="true">
    <svg viewBox="0 0 28 120" width="28" height="120" fill="none">
      <defs>
        <linearGradient id="${m}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="${n(i)}"/>
          <stop offset="1" stop-color="${n(r)}"/>
        </linearGradient>
        <marker id="${b}" viewBox="0 0 8 8" refX="6.2" refY="4" markerWidth="4.6" markerHeight="4.6" orient="auto">
          <path d="M0 0 8 4 0 8Z" fill="${n(r)}"/>
        </marker>
      </defs>
      <path class="flow-link-line" d="${y}" stroke="url(#${m})" stroke-width="1.7" stroke-linecap="round" marker-end="url(#${b})"/>
      <circle class="flow-link-port" cx="2" cy="60" r="3.6" stroke="${n(i)}" stroke-width="1.5"/>
      <circle class="flow-link-port" cx="26" cy="60" r="3.6" stroke="${n(r)}" stroke-width="1.5"/>
    </svg>
  </div>`}function Tn(e){if(!e)return"";let t=[];return e.started_at&&t.push(`\u958B\u59CB ${ve(e.started_at)}`),e.duration_ms&&t.push(`\u8017\u6642 ${ne(e.duration_ms)}`),e.pid&&t.push(`PID ${e.pid}`),t.join(" \xB7 ")}function Zi(e,{active:t,focus:s,status:a,runLine:r,runningStage:i}){let o=e.label||Mn[e.key]||e.key;return`<div class="flow-source${t?" is-live":""}" style="--branch-accent:${hs[e.key]||hs.system}">
    <div class="flow-source-head">
      <span class="flow-source-icon">${u(e.icon||"database",15)}</span>
      <div class="flow-node-heading">
        <span class="flow-node-kicker">SOURCE</span>
        <strong>${n(o)}</strong>
      </div>
      ${jn(a)}
    </div>
    <div class="flow-source-body">
      <p class="flow-source-desc">${n(e.description||"")}</p>
      <div class="flow-source-meta">${r}</div>
      ${i?`<div class="flow-source-current"><span class="flow-current-dot"></span>\u76EE\u524D\u968E\u6BB5\uFF1A<strong>${n(i.label||i.key)}</strong></div>`:""}
      ${s&&s.message?`<div class="flow-source-note" title="${n(s.message)}">${n(s.message)}</div>`:""}
    </div>
  </div>`}function eo(e){let t=e.active_run,s=t||e.focus_run||e.last_run,a=t?"running":s?s.status:"idle",r=s?n(Tn(s)||Lt(s.started_at||s.finished_at)):"\u5C1A\u7121\u57F7\u884C\u7D00\u9304",i=Array.isArray(e.stages)?e.stages:[],o=i.find(v=>v.status==="running"),l=hs[e.key]||hs.system,m=String(e.key||"branch").replace(/[^a-zA-Z0-9_-]/g,""),b=Zi(e,{active:t,focus:s,status:a,runLine:r,runningStage:o}),y=i.length?i.map((v,w)=>{let _=w?Nt(i[w-1]):l;return`${Xi(v,w,m,_)}${Yi(v,w)}`}).join(""):'<div class="flow-empty">\u6C92\u6709\u53EF\u986F\u793A\u7684\u968E\u6BB5\u3002</div>';return`<article class="flow-lane" style="--branch-accent:${l}"><div class="flow-row">${b}${y}</div></article>`}function to(e){return`<div class="flow-canvas-open">
    <div class="processing-branches">${(Array.isArray(e.branches)?e.branches:[]).map(eo).join("")}</div>
  </div>`}function _t(e,t,s="",a=""){return`<div class="processing-summary-card">
    <span class="processing-summary-label">${n(e)}</span>
    <span class="processing-summary-value">${t}</span>
    ${s?`<span class="processing-summary-hint">${s}</span>`:""}
    ${a}
  </div>`}function so(e){let t=e.database||{},s=e.index||{},a=e.local_archives||{},r=e.raw_backups||{},i=r.totals||{},o=e.state||{},l=e.capabilities||{},m=e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D",b=t.status==="operational",y=s.status==="operational",v=a.available!==!1,w=r.available!==!1,_=y?`${c(s.indexed)} / ${c(s.total)}`:Ue(s.status||"unavailable"),g=y?`${kt(s.percent)} \xB7 \u5C1A\u9918 ${c(s.remaining)} \u7B46`:n(s.error||"\u7121\u6CD5\u67E5\u8A62 Qdrant \u7D22\u5F15\u8986\u84CB\u7387\u3002"),k=v?`${c(a.unprocessed)} / ${c(a.total)}`:Ue("unavailable"),F=v?`\u672A\u8655\u7406 / \u5168\u90E8 \xB7 ${ue(a.unprocessed_bytes)} \u5F85\u8655\u7406`:n(a.error||"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304\u3002");return`<div class="processing-summary">
    ${_t("\u8655\u7406\u72C0\u614B",Ue(e.status||"unknown"),`${n(m)} \xB7 \u66F4\u65B0\u65BC <span data-processing-updated-at>\u2014</span>`)}
    ${_t("\u672A\u8655\u7406\u58D3\u7E2E\u6A94",n(k),F)}
    ${_t("\u539F\u59CB Parquet \u5099\u4EFD",w?`${c(r.count)} \u6A94`:Ue("unavailable"),w?`\u5171 ${c(i.row_count)} \u7B46 \xB7 ${ue(i.compressed_bytes)}`:n(r.error||"\u7121\u6CD5\u6383\u63CF\u539F\u59CB Parquet \u5099\u4EFD\u3002"))}
    ${_t("PostgreSQL \u5224\u6C7A",b?c(t.judgment_count):Ue("unavailable"),b?`\u6CD5\u898F ${Sn(t.law_count)} \xB7 \u547D\u4EE4 ${Sn(t.order_count)}`:n(t.error||"\u7121\u6CD5\u67E5\u8A62 PostgreSQL\u3002"))}
    ${_t("Qdrant \u7D22\u5F15",_,g)}
    ${_t("\u72C0\u614B\u6A94",Ue(o.status||"missing"),o.updated_at?`\u66F4\u65B0\u65BC ${n(ve(o.updated_at))}`:n(o.detail||"\u5C1A\u7121\u8655\u7406\u72C0\u614B\u7D00\u9304\u3002"))}
    ${_t("\u5F85\u8655\u7406\u5DE5\u4F5C",l.can_start_update===!1?"\u66AB\u505C\u555F\u52D5":"\u53EF\u958B\u59CB\u66F4\u65B0",l.start_blocked_reason?n(l.start_blocked_reason):`\u672A\u8655\u7406 ${c(l.unprocessed_archives)} \u500B \xB7 \u7D22\u5F15\u5F85\u88DC ${c(l.index_backlog)} \u7B46${l.external_processes?` \xB7 \u5916\u90E8\u7A0B\u5E8F ${c(l.external_processes)} \u500B`:""}`)}
  </div>`}function ao(e){if(e.available===!1)return pe({tone:"warn",title:"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304",text:n(e.error||"\u7121\u6CD5\u6383\u63CF .rar \u6A94\u6848\u3002")});let t=Number(e.total)||0,s=Number(e.processed)||0,a=Number(e.unprocessed)||0,r=t?100*s/t:null;return`<div class="processing-archive-summary">
    <div class="processing-archive-summary-head">
      <span class="mono">${n(e.data_dir||"")}</span>
      <span>${c(s)} / ${c(t)} \u5DF2\u8655\u7406 \xB7 ${c(a)} \u5F85\u8655\u7406 \xB7 ${ue(e.unprocessed_bytes)} \u5F85\u8655\u7406</span>
    </div>
    ${ys({percent:r,status:a?"pending":"success",color:"var(--success)"},"processing-bar-lg")}
    <div class="processing-archive-summary-meta">
      <span>\u58D3\u7E2E\u6A94\u532F\u5165\u8986\u84CB ${kt(r)}</span>
      <span>\u5168\u90E8 ${ue(e.total_bytes)}</span>
    </div>
  </div>`}function no(e){let t=e.stages||{},a=["extract","filter","postgres"].map(r=>t[r]).filter(Boolean).map(r=>Wi(r,{compact:!0}));return a.length?`<div class="processing-archive-stages">${a.join("")}</div>`:""}function ro(e){let t=e.status||"pending",s=t==="running",a=e.percent===null||e.percent===void 0?null:Math.max(0,Math.min(100,Number(e.percent)||0)),r=s&&a===null,i=[];return e.message&&i.push(e.message),e.error&&i.push(e.error),(e.scanned||e.matched||e.stored)&&i.push(`\u6383\u63CF ${c(e.scanned)} \xB7 \u547D\u4E2D ${c(e.matched)} \xB7 \u5BEB\u5165 ${c(e.stored)}`),`<div class="processing-archive is-${Gt(t).tone}">
    <div class="processing-archive-head">
      <span class="processing-archive-name mono">${n(e.name)}</span>
      <div class="processing-archive-bar-wrap">
        ${ys({percent:a,status:t,color:s?"var(--accent)":"var(--success)"})}
      </div>
      <span class="processing-archive-percent mono">${r?"\u9032\u884C\u4E2D":kt(a)}</span>
      ${Ue(t)}
      <span class="processing-archive-size faint">${ue(e.size_bytes)}</span>
    </div>
    ${no(e)}
    ${i.length?`<div class="processing-archive-note">${i.map(o=>`<span>${n(o)}</span>`).join("")}</div>`:""}
  </div>`}function io(e){let t=e.archives||{},s=e.local_archives||{},a=Array.isArray(t.items)?t.items:[],r=t.run,i=`<div class="report-section-head">
    <div>
      <div class="report-kicker">ARCHIVE PIPELINE</div>
      <h2 class="report-section-title">\u5224\u6C7A\u58D3\u7E2E\u6A94</h2>
      <p class="processing-section-sub">\u6BCF\u500B\u58D3\u7E2E\u6A94\u540D\u7A31\u5F8C\u65B9\u5373\u6642\u986F\u793A\u8655\u7406\u9032\u5EA6\uFF1B\u672A\u53D6\u5F97\u53EF\u8A08\u7B97\u7684\u7E3D\u91CF\u6642\u6A19\u793A\u300C\u9032\u5EA6\u672A\u77E5\u300D\uFF0C\u4E0D\u4EE5\u63A8\u6E2C\u6578\u503C\u4EE3\u66FF\u3002</p>
    </div>
  </div>`,o=t.source==="run"?`${Ue(r?r.status:"idle")} <span>\u76EE\u524D\u986F\u793A ${r?n(r.title||"\u5224\u6C7A\u532F\u5165"):"\u6700\u8FD1\u4E00\u6B21\u532F\u5165"} \u7684\u9010\u6A94\u9032\u5EA6${r&&r.started_at?` \xB7 ${n(Tn(r))}`:""}</span>`:t.external?`${Ue("running")} <span>${n(t.note||"\u5916\u90E8\u532F\u5165\u7A0B\u5E8F\u672A\u5BEB\u5165\u9010\u6A94\u72C0\u614B\uFF1B\u4EE5\u4E0B\u70BA PostgreSQL \u8986\u84CB\u7387\u3002")}</span>`:'<span class="faint">\u76EE\u524D\u6C92\u6709\u53EF\u8B80\u53D6\u7684\u532F\u5165 run \u72C0\u614B\uFF1B\u4EE5\u4E0B\u4EE5 PostgreSQL \u7684 source_archive \u5224\u5B9A\u662F\u5426\u5DF2\u8655\u7406\u3002</span>';return`<section class="report-card processing-card">
    <div class="report-head">${i}</div>
    <div class="report-section">
      ${ao(s)}
      <div class="processing-archive-run">${o}</div>
      ${a.length?`<div class="processing-archive-list">${a.map(ro).join("")}</div>`:`<div class="processing-empty">\u627E\u4E0D\u5230 .rar \u58D3\u7E2E\u6A94\uFF1B\u8ACB\u78BA\u8A8D ${n(s.data_dir||"\u5224\u6C7A\u8CC7\u6599\u76EE\u9304")}\u3002</div>`}
    </div>
  </section>`}function oo(e){let t=e.timeline||{},s=Array.isArray(t.stages)?t.stages:[],a=`<div class="report-section-head">
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
    </section>`;let r=s.map(o=>`<span class="processing-stack-segment" style="width:${Math.max(0,Number(o.percent)||0)}%;background:${n(o.color||"var(--accent)")}" title="${n(`${o.label} ${ne(o.duration_ms)} (${kt(o.percent)})`)}"></span>`).join(""),i=s.map(o=>`<div class="processing-legend-item">
        <span class="processing-legend-swatch" style="background:${n(o.color||"var(--accent)")}"></span>
        <span class="processing-legend-label">${n(o.label)}</span>
        <span class="mono">${ne(o.duration_ms)}</span>
        <span class="processing-legend-percent mono">${kt(o.percent)}</span>
        ${Ue(o.status)}
      </div>`).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section">
      <div class="processing-timeline-label">
        <span>${n(t.label||"\u968E\u6BB5\u8017\u6642")}</span>
        <span class="mono">\u7E3D\u8A08 ${ne(t.total_ms)}</span>
      </div>
      <div class="processing-stack" role="img" aria-label="\u968E\u6BB5\u8017\u6642\u6BD4\u4F8B">${r}</div>
      <div class="processing-legend">${i}</div>
    </div>
  </section>`}function lo(e){let t=Array.isArray(e.recent_runs)?e.recent_runs:[],s=new Map((e.branches||[]).map(i=>[i.key,i.label])),a=`<div class="report-section-head">
    <div>
      <div class="report-kicker">RECENT RUNS</div>
      <h2 class="report-section-title">\u6700\u8FD1\u8655\u7406\u7D00\u9304</h2>
      <p class="processing-section-sub">\u5305\u542B\u8CC7\u6599\u66F4\u65B0\u3001\u5224\u6C7A\u4E0B\u8F09\u3001\u5224\u6C7A\u532F\u5165\u3001Parquet\u3001Qdrant \u8207\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E0B\u8F09\u3002</p>
    </div>
  </div>`;if(!t.length)return`<section class="report-card processing-card">
      <div class="report-head">${a}</div>
      <div class="report-section"><div class="processing-empty">\u5C1A\u7121\u8655\u7406\u7D00\u9304\u3002</div></div>
    </section>`;let r=t.map(i=>{let o=s.get(i.branch)||Mn[i.branch]||i.branch||"\u2014";return`<div class="processing-run">
        <div class="processing-run-head">
          <span class="badge badge-neutral">${n(o)}</span>
          <strong>${n(i.title||"\u8655\u7406")}</strong>
          ${Ue(i.status)}
          <span class="grow"></span>
          <span class="mono faint">${n(ve(i.finished_at||i.started_at))}</span>
          <span class="mono">${i.duration_ms?ne(i.duration_ms):"\u2014"}</span>
        </div>
        ${i.message?`<div class="processing-run-message">${n(i.message)}</div>`:""}
      </div>`}).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section"><div class="processing-run-list">${r}</div></div>
  </section>`}function co(e){let t=Array.isArray(e.notices)?e.notices:[];return t.length?`<div class="processing-notices">${t.map(s=>pe({tone:s.tone||"info",title:s.title,text:n(s.message||"")})).join("")}</div>`:""}function xn(e){return`${co(e)}
    ${so(e)}
    <section class="processing-flow-section">
      <div class="processing-section-head">
        <div>
          <div class="report-kicker">PIPELINE CANVAS</div>
          <h2 class="report-section-title">\u8655\u7406\u6D41\u7A0B</h2>
          <p class="processing-section-sub">\u5224\u6C7A\u3001\u6CD5\u898F\u3001\u547D\u4EE4\u4E09\u689D\u6D41\u7A0B\u5373\u6642\u53CD\u6620\u76EE\u524D\u57F7\u884C\u968E\u6BB5\uFF1B\u66F2\u7DDA\u7531\u4F86\u6E90\u7BC0\u9EDE\u9023\u5230\u5404\u968E\u6BB5\uFF0C\u767C\u5149\u7BC0\u9EDE\u8207\u6D41\u52D5\u66F2\u7DDA\u8868\u793A\u76EE\u524D\u57F7\u884C\u4F4D\u7F6E\u3002</p>
        </div>
      </div>
      ${to(e)}
    </section>
    ${io(e)}
    ${oo(e)}
    ${lo(e)}`}function uo(e,t){return`<div class="report-card processing-card">
    <div class="report-section">
      ${pe({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B",text:n(e||"\u672A\u77E5\u932F\u8AA4")})}
      ${t?`<p class="processing-section-sub">\u4E0A\u6B21\u6210\u529F\u66F4\u65B0\uFF1A${n(ve(t.generated_at))}\u3002\u756B\u9762\u4E0A\u6C92\u6709\u986F\u793A\u66FF\u4EE3\u6216\u63A8\u6E2C\u7684\u9032\u5EA6\u3002</p>`:""}
      <div class="processing-error-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh">
          ${u("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
  </div>`}var En={overview:"activity",full_update:"download",law_download:"layers",order_download:"file",judgment_download:"download",judgment_import:"database",judgment_parquet:"cube",index_versions:"brain",normalize_courts:"filter",backfill_law_articles:"history"};function po(e){let t=Array.isArray(e.workflows)?e.workflows:[];return[{id:"overview",label:"\u8655\u7406\u7E3D\u89BD",description:"\u76EE\u524D\u6D41\u7A0B\u3001\u58D3\u7E2E\u6A94\u8207\u6700\u8FD1\u57F7\u884C\u7D00\u9304",status:e.status||"idle",activeRun:null,lastRun:null},...t.map(s=>{let a=s.active_run||null,r=a||s.last_run||null;return{...s,activeRun:a,lastRun:r,status:r?.status||"idle"}})]}function An(e,t){return`<div class="status-sidebar-head">
      <div class="eyebrow">DATA WORKFLOWS</div>
      <div class="status-sidebar-title">\u8CC7\u6599\u6D41\u7A0B</div>
    </div>
    <nav class="status-tab-list" aria-label="\u8CC7\u6599\u8655\u7406\u5DE5\u4F5C\u6D41\u7A0B">
      ${po(e).map(a=>{let r=a.id===t,i=En[a.id]||"terminal";return`<button class="status-tab${r?" is-active":""}" type="button"
            data-processing-workflow="${n(a.id)}"
            ${r?'aria-current="page"':""}>
            <span class="status-tab-icon">${u(i,15)}</span>
            <span class="status-tab-copy">
              <strong>${n(a.label)}</strong>
              <small>${n(a.description||"")}</small>
            </span>
            ${Ue(a.status)}
          </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u57F7\u884C\u6A21\u5F0F</span>
      <span class="mono">${n(e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D")}</span>
    </div>`}function mo(e){if(!e)return'<div class="processing-workflow-empty">\u5C1A\u672A\u57F7\u884C\u3002\u6309\u4E0B\u53F3\u5074\u6309\u9215\u958B\u59CB\u3002</div>';let t=e.meta||{};return`<div class="processing-workflow-run">
    <div class="processing-workflow-run-head">
      ${Ue(e.status)}
      <span class="mono">${n(e.id||"\u2014")}</span>
    </div>
    <div class="processing-workflow-run-grid">
      <span>\u958B\u59CB</span><strong>${n(ve(e.started_at))}</strong>
      <span>\u8017\u6642</span><strong>${ne(e.duration_ms)}</strong>
      <span>\u8A0A\u606F</span><strong>${n(e.message||"\u2014")}</strong>
      ${t.log_path?`<span>\u65E5\u8A8C</span><strong class="mono">${n(t.log_path)}</strong>`:""}
    </div>
  </div>`}function Vt(e){return`${e.year}-${String(e.month_no).padStart(2,"0")}`}function Nn(e){let t={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"},s=e.status||"red";return[Vt(e),t[s]||s,e.latest_fileset_id?`fileset ${e.latest_fileset_id}`:"",e.filename||"",e.local_filename&&e.local_filename!==e.filename?`\u672C\u6A5F\uFF1A${e.local_filename}`:""].filter(Boolean).join(" \xB7 ")}function Cn(e){if(!e.download_url)return"";let t=Vt(e);return`<a class="judgment-month-download" href="${n(Ve(e.download_url))}" target="_blank" rel="noreferrer" title="\u4E0B\u8F09 ${t} \u5224\u6C7A\uFF08API 00:00\u201306:00\uFF09" aria-label="\u4E0B\u8F09 ${t} \u5224\u6C7A">${u("download",11)}</a>`}function go(e){let t=e.status||"red";return`<td class="judgment-month is-${n(t)}" data-judgment-month-key="${n(Vt(e))}" title="${n(Nn(e))}"><span>${e.month_no}</span>${Cn(e)}</td>`}function ca(){return'<div class="judgment-months-loading"><span class="spinner"></span><span>\u8B80\u53D6\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B\u2026</span></div>'}function fo(e){if(e?.loading&&!e?.months?.length)return ca();if(e?.error&&!e?.months?.length)return pe({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:n(e.error)});let t=Array.isArray(e?.months)?e.months:[];if(!t.length)return'<div class="processing-empty">\u5C1A\u672A\u6709\u6708\u4EFD\u72C0\u614B\uFF1B\u8ACB\u5148\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u3002</div>';let s=new Map(t.map(o=>[Vt(o),o])),r=[...new Set(t.map(o=>o.year))].sort((o,l)=>l-o).map(o=>{let l=Array.from({length:12},(m,b)=>{let y=s.get(`${o}-${String(b+1).padStart(2,"0")}`);return y?go(y):`<td class="judgment-month is-empty"><span>${b+1}</span></td>`}).join("");return`<tr><th scope="row">${o}</th>${l}</tr>`}).join(""),i=e.summary||{};return`<div class="judgment-months">
    <div class="judgment-months-meta">
      <span class="badge badge-ok" data-judgment-summary="green">\u6700\u65B0\u7248 ${c(i.green||0)}</span>
      <span class="badge badge-neutral" data-judgment-summary="gray">\u820A\u7248 ${c(i.gray||0)}</span>
      <span class="badge badge-danger" data-judgment-summary="red">\u7F3A\u5931 ${c(i.red||0)}</span>
      <span class="muted" data-judgment-total>\u5171 ${c(e.total_months||t.length)} \u500B\u6708</span>
    </div>
    <div class="judgment-months-scroll">
      <table class="judgment-months-table">
        <thead><tr><th scope="col">\u5E74\u4EFD</th>${Array.from({length:12},(o,l)=>`<th scope="col">${l+1}</th>`).join("")}</tr></thead>
        <tbody>${r}</tbody>
      </table>
    </div>
    <p class="judgment-months-hint">\u7DA0\u8272\uFF1A\u6700\u65B0\u7248\u5DF2\u4E0B\u8F09\u5230 raw_rar\uFF1B\u7070\u8272\uFF1A\u672C\u6A5F\u4ECD\u662F\u820A\u7248\uFF0C\u57F7\u884C\u5224\u6C7A\u4E0B\u8F09\u6703\u66F4\u65B0\uFF1B\u7D05\u8272\uFF1A\u8A72\u6708\u4EFD\u7F3A\u5C11\u5224\u6C7A\u8CC7\u6599\u3002\u6ED1\u9F20\u79FB\u5230\u6708\u4EFD\u53EF\u958B\u555F\u4E0B\u8F09\u9023\u7D50\uFF08\u9700 00:00\u201306:00 API \u6642\u6BB5\uFF09\u3002\u9996\u6B21\u5B8C\u6574\u540C\u6B65\u53EF\u80FD\u9700\u4E0B\u8F09\u6578\u767E\u500B\u6708\u4EFD\uFF0C\u6703\u8DE8\u591A\u500B 00:00\u201306:00 \u6642\u6BB5\u7E8C\u50B3\u3002</p>
  </div>`}function bo(e,t){let s=Array.isArray(t?.months)?t.months:[],a=t.summary||{},r={green:"\u6700\u65B0\u7248",gray:"\u820A\u7248",red:"\u7F3A\u5931"};e.querySelectorAll("[data-judgment-summary]").forEach(o=>{let l=o.dataset.judgmentSummary||"";o.textContent=`${r[l]||l} ${c(a[l]||0)}`});let i=e.querySelector("[data-judgment-total]");i&&(i.textContent=`\u5171 ${c(t.total_months||s.length)} \u500B\u6708`);for(let o of s){let l=Vt(o),m=e.querySelector(`[data-judgment-month-key="${l}"]`);if(!m)continue;let b=o.status||"red";m.classList.contains(`is-${b}`)||(m.classList.remove("is-green","is-gray","is-red","is-empty"),m.classList.add(`is-${b}`));let y=Nn(o);m.title!==y&&(m.title=y);let v=m.querySelector(".judgment-month-download");if(o.download_url){let w=Ve(o.download_url);v?v.getAttribute("href")!==w&&(v.href=w):m.insertAdjacentHTML("beforeend",Cn(o))}else v&&v.remove()}}function vo(e){let t=e.active_run||null,s=t||e.last_run||null,a=!!t,r=!!e.can_run&&!a,i=e.id==="full_update",o=Array.isArray(e.command)?e.command.join(" "):"";return`<div class="processing-workflow-panel">
    ${pe({tone:"info",title:e.label,text:e.description||""})}
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${u(En[e.id]||"terminal",14)}\u57F7\u884C\u8CC7\u8A0A</span>
        <span class="badge badge-neutral badge-mono">${n(e.branch||"")}</span>
      </div>
      <div class="processing-workflow-command-grid">
        <span>\u7A0B\u5F0F</span><code>${n(e.program||"\u2014")}</code>
        <span>Shell\uFF0F\u5165\u53E3</span><code>${n(e.script||"\u2014")}</code>
        <span>\u5BE6\u969B\u547D\u4EE4</span><code class="processing-workflow-command">${n(o||"\u2014")}</code>
      </div>
      <div class="processing-workflow-actions">
        <button class="btn btn-primary btn-sm" type="button"
          data-processing-action="run-workflow"
          data-workflow-id="${n(e.id)}"
          ${r?"":"disabled"}>
          ${u("play",14)}<span>${a?"\u57F7\u884C\u4E2D":i?"\u57F7\u884C\u8CC7\u6599\u66F4\u65B0":"\u57F7\u884C\u6B64\u6D41\u7A0B"}</span>
        </button>
        ${t?`<button class="btn btn-secondary btn-sm processing-stop" type="button"
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
      <div class="side-card-foot">
        ${i?"\u6703\u4F9D\u5E8F\u57F7\u884C\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E0B\u8F09\u3001\u5224\u6C7A\u532F\u5165\u8207\u53EF\u9078\u7684 Qdrant \u7D22\u5F15\u3002":"\u57F7\u884C\u7D50\u679C\u6703\u5BEB\u5165\u5171\u7528\u8655\u7406\u72C0\u614B\u6A94\uFF0C\u53EF\u5F9E\u8655\u7406\u7E3D\u89BD\u67E5\u770B\u3002"}
      </div>
    </section>
    ${e.id==="judgment_download"?`<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${u("calendar",14)}\u6708\u4EFD\u4E0B\u8F09\u72C0\u614B</span>
              <button class="btn btn-ghost btn-sm" type="button" title="\u91CD\u65B0\u6383\u63CF raw_rar \u76EE\u9304\u8207\u6708\u4EFD\u72C0\u614B" data-processing-action="refresh-judgment-months">${u("refresh",13)}<span>\u91CD\u65B0\u6574\u7406</span></button>
            </div>
            <div data-judgment-months-slot>${ca()}</div>
          </section>`:""}
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${u("history",14)}\u6700\u8FD1\u57F7\u884C</span>
        ${Ue(s?.status||"idle")}
      </div>
      ${mo(s)}
    </section>
  </div>`}function Ln(e,t){if(t==="overview")return xn(e);let a=(Array.isArray(e.workflows)?e.workflows:[]).find(r=>r.id===t);return a?vo(a):xn(e)}async function ho(e){e.innerHTML=`<section class="page processing-page">
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
  </section>`;let t=e.querySelector(".processing-page"),s=e.querySelector("#processing-root"),a=e.querySelector("#processing-workflows"),r=e.querySelector("#processing-update"),i=e.querySelector("#processing-stop"),o=e.querySelector("#processing-refresh"),l=e.querySelector("#processing-index-toggle"),m=!1,b=!1,y=!1,v=null,w="",_="",g="overview",k=null,F=!1,Y=null,K=null,X=()=>{if(g!=="judgment_download")return;let x=s.querySelector(".processing-workflow-panel");if(!x)return;x.querySelectorAll(".judgment-month.is-active").forEach(Z=>{Z.classList.remove("is-active"),Z.removeAttribute("aria-current")});let S=x.querySelector("[data-judgment-progress]");if(!S)return;let q=k?.progress,Q=!!(v?.workflows||[]).find(Z=>Z.id==="judgment_download")?.active_run;if((!q||q.active===!1)&&!Q){S.hidden=!0,S.classList.remove("is-indeterminate");return}if(S.hidden=!1,!q||q.active===!1){let Z=S.querySelector("[data-judgment-progress-phase]");Z&&(Z.textContent="\u6E96\u5099\u4E2D");let Ie=S.querySelector("[data-judgment-progress-month]");Ie&&(Ie.textContent="\u2014");let J=S.querySelector("[data-judgment-progress-filename]");J&&(J.textContent="\u7B49\u5F85\u4E0B\u8F09\u7A0B\u5E8F\u56DE\u5831\u9032\u5EA6\u2026",J.title=""),S.classList.add("is-indeterminate");let ce=S.querySelector("[data-judgment-progress-bar]");ce&&(ce.style.width="");let qe=S.querySelector("[data-judgment-progress-percent]");qe&&(qe.textContent="\u2014");let Le=S.querySelector("[data-judgment-progress-size]");Le&&(Le.textContent="\u2014");let ot=S.querySelector("[data-judgment-progress-note]");ot&&(ot.textContent="\u5DF2\u555F\u52D5\uFF0C\u7B49\u5F85\u9032\u5EA6\u56DE\u5831");return}let te={preparing:"\u6E96\u5099\u4E2D",scanning:"\u6383\u63CF\u4E2D",checking:"\u6AA2\u67E5\u4E2D",downloading:"\u4E0B\u8F09\u4E2D",saving:"\u5132\u5B58\u4E2D",finalizing:"\u6574\u7406\u4E2D"}[q.phase]||"\u8655\u7406\u4E2D",me=S.querySelector("[data-judgment-progress-phase]");me&&(me.textContent=te);let Se=q.month||"",xe=S.querySelector("[data-judgment-progress-month]");xe&&(xe.textContent=Se||"\u2014");let Je=q.filename||"",Re=S.querySelector("[data-judgment-progress-filename]");if(Re&&(Re.textContent=Je||"\u2014",Re.title=Je),Se){let Z=x.querySelector(`[data-judgment-month-key="${Se}"]`);Z&&(Z.classList.add("is-active"),Z.setAttribute("aria-current","true"))}let je=Number(q.bytes_written),Ne=Number(q.total_bytes),Te=Number.isFinite(Ne)&&Ne>0,A=null,L=q.percent;L!=null&&L!==""&&Number.isFinite(Number(L))?A=Number(L):Te&&Number.isFinite(je)&&(A=je/Ne*100);let N=A===null;S.classList.toggle("is-indeterminate",N);let O=S.querySelector("[data-judgment-progress-bar]");O&&(O.style.width=N?"":`${Math.min(100,Math.max(0,A)).toFixed(1)}%`);let se=S.querySelector("[data-judgment-progress-percent]");if(se){let Z=N?null:Math.min(100,Math.max(0,A));se.textContent=Z===null?"\u2014":`${Z.toFixed(Z>=10?0:1)}%`}let H=S.querySelector("[data-judgment-progress-size]");if(H){let Z=Number.isFinite(je)&&je>0?ue(je):"\u2014";H.textContent=Te?`${Z} / ${ue(Ne)}`:Z}let fe=S.querySelector("[data-judgment-progress-note]");if(fe){let Z=[],Ie=Number(q.candidate_index),J=Number(q.candidate_total);Number.isFinite(Ie)&&Ie>0&&Number.isFinite(J)&&J>0&&Z.push(`\u7B2C ${c(Ie)} / ${c(J)} \u500B\u6708`),q.fileset_id&&Z.push(`fileset ${q.fileset_id}`),q.message&&q.phase!=="downloading"&&Z.push(String(q.message)),fe.textContent=Z.join(" \xB7 ")}},W=()=>{if(g!=="judgment_download")return;let x=s.querySelector("[data-judgment-months-slot]");if(x){let S=Array.isArray(k?.months)?k.months:[];Y&&!k?(x.innerHTML=pe({tone:"danger",title:"\u6708\u4EFD\u72C0\u614B\u8B80\u53D6\u5931\u6557",text:n(Y)}),delete x.dataset.judgmentMonthCount):k?x.dataset.judgmentMonthCount!==String(S.length)?(x.innerHTML=fo(k),x.dataset.judgmentMonthCount=String(S.length)):bo(x,k):(x.querySelector(".judgment-months-loading")||(x.innerHTML=ca()),delete x.dataset.judgmentMonthCount)}X()},ae=async({quiet:x=!1}={})=>{if(!F){F=!0,!k&&g==="judgment_download"&&W();try{k=await U.judgmentDownloadStatus(),Y=null}catch(S){Y=S.message||"\u8B80\u53D6\u6708\u4EFD\u72C0\u614B\u5931\u6557\u3002",x||M(Y,"danger",7e3)}finally{F=!1,g==="judgment_download"&&W()}}},oe=x=>{let S=x.capabilities||{},q=!!(l&&l.checked),R=q?S.can_start_update_with_index!==!1:S.can_start_update!==!1,Q=q&&S.index_blocked_reason||S.start_blocked_reason;if(!y){r.disabled=!R,r.title=Q||"\u6AA2\u67E5\u7DDA\u4E0A\u6CD5\u898F\uFF0F\u547D\u4EE4\uFF0C\u4E26\u8655\u7406\u672A\u532F\u5165\u7684\u5224\u6C7A\u58D3\u7E2E\u6A94\u3002";let z=r.querySelector("[data-update-label]");z&&(z.textContent=R?"\u8CC7\u6599\u66F4\u65B0":S.active_update_id?"\u66F4\u65B0\u57F7\u884C\u4E2D":"\u8655\u7406\u7A0B\u5E8F\u57F7\u884C\u4E2D"),i.hidden=!S.can_stop_update,l&&(l.disabled=S.can_start_update===!1)}},le=async({silent:x=!1}={})=>{if(!(m||b)){b=!0,x||ge(o,!0,"\u66F4\u65B0\u4E2D\u2026");try{let S=await U.processing();if(m)return;v=S;let q=An(S,g);q!==_&&(a.innerHTML=q,_=q);let R=Ln(S,g);R!==w&&(s.innerHTML=R,w=R),W();let Q=s.querySelector("[data-processing-updated-at]");if(Q){let z=ve(S.generated_at);Q.textContent!==z&&(Q.textContent=z)}oe(S),g==="judgment_download"&&ae({quiet:!0})}catch(S){if(m)return;let q=uo(S.message,v);q!==w&&(s.innerHTML=q,w=q),x||M(S.message||"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B\u3002","danger",6e3)}finally{b=!1,x||ge(o,!1)}}},$e=async x=>{if(!y){y=!0,ge(x,!0,"\u555F\u52D5\u4E2D\u2026");try{let S=!!(l&&l.checked),q=await U.startProcessingUpdate(S);M(`\u5DF2\u555F\u52D5\u8CC7\u6599\u66F4\u65B0${S?"\uFF0C\u5B8C\u6210\u5F8C\u63A5\u7E8C Qdrant \u7D22\u5F15":""}\u3002`,"ok",6e3),q&&q.run_id&&console.info("processing update started",q),await le({silent:!0})}catch(S){M(S.message||"\u7121\u6CD5\u555F\u52D5\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{y=!1,ge(x,!1),v&&oe(v)}}},ie=async(x,S)=>{if(!y){y=!0,ge(x,!0,"\u555F\u52D5\u4E2D\u2026");try{let q=await U.startProcessingWorkflow(S);M("\u5DF2\u555F\u52D5\u5DE5\u4F5C\u6D41\u7A0B\u3002","ok",6e3),q&&q.run_id&&console.info("processing workflow started",q),await le({silent:!0})}catch(q){M(q.message||"\u7121\u6CD5\u555F\u52D5\u5DE5\u4F5C\u6D41\u7A0B\u3002","danger",7e3)}finally{y=!1,ge(x,!1),v&&oe(v)}}},j=async x=>{if(!y){y=!0,ge(x,!0,"\u505C\u6B62\u4E2D\u2026");try{let S=await U.stopProcessingUpdate();M(S.message||"\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info",6e3),await le({silent:!0})}catch(S){M(S.message||"\u7121\u6CD5\u505C\u6B62\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{y=!1,ge(x,!1),v&&oe(v)}}},$=x=>{let S=x.target.closest("[data-processing-action]");if(!S||S.disabled)return;let q=S.dataset.processingAction;if(q==="refresh")le({silent:!1});else if(q==="refresh-judgment-months")ae({quiet:!1});else if(q==="update")$e(S);else if(q==="run-workflow"){let R=S.dataset.workflowId||"";R==="full_update"?$e(S):ie(S,R)}else q==="stop"&&j(S)},B=x=>{x.target===l&&v&&oe(v)},D=x=>{let S=x.target.closest("[data-processing-workflow]");if(S){if(g=S.dataset.processingWorkflow||"overview",v){let q=An(v,g);a.innerHTML=q,_=q;let R=Ln(v,g);s.innerHTML=R,w=R,W()}g==="judgment_download"&&ae({quiet:!0})}};return t.addEventListener("click",$),a.addEventListener("click",D),l&&l.addEventListener("change",B),await le({silent:!1}),K=window.setInterval(()=>{document.hidden||le({silent:!0})},Hi),()=>{m=!0,K!==null&&window.clearInterval(K),t.removeEventListener("click",$),a.removeEventListener("click",D),l&&l.removeEventListener("change",B)}}var fa={};ft(fa,{render:()=>Xo});var ua={draft:{label:"\u8349\u7A3F",badge:"badge-neutral"},pending_review:{label:"\u5F85\u5BE9",badge:"badge-warn"},changes_requested:{label:"\u9000\u56DE\u4FEE\u6539",badge:"badge-warn"},accepted:{label:"\u5DF2\u6838\u51C6",badge:"badge-ok"},rejected:{label:"\u5DF2\u62D2\u7D55",badge:"badge-danger"},retired:{label:"\u5DF2\u522A\u9664\uFF0F\u9000\u5F79",badge:"badge-neutral"}},at={law_concept:"\u6CD5\u898F\u6982\u5FF5",article_lookup:"\u6307\u5B9A\u689D\u6587",judgment_lookup:"\u5224\u6C7A\u6AA2\u7D22",structured:"\u7D50\u69CB\u5316\u554F\u984C",general:"\u4E00\u822C\u554F\u984C",refusal:"\u62D2\u7D55\u56DE\u7B54"},Ct={easy:"\u7C21\u55AE",medium:"\u4E2D\u7B49",hard:"\u56F0\u96E3"},Rn={smoke:"Smoke",core:"Core",full:"Full",holdout:"Holdout"};function Yt(e){let t=ua[e]||{label:e||"\u672A\u77E5",badge:"badge-neutral"};return`<span class="badge ${t.badge}">${n(t.label)}</span>`}function pa(e){return String(e||"").split(`
`).map(t=>t.trim()).filter(Boolean)}function yo(e){return pa(e).map(t=>{let[s,a]=t.split("|").map(r=>r.trim());return{law_name:s||"",source_type:a||""}})}function $o(e){return pa(e).map(t=>{let[s,a]=t.split("|").map(r=>r.trim());return{law_name:s||"",article_no:a||""}})}function wo(e){return pa(e).map(t=>({jid:t.trim()}))}function _o(e){return(e?.expected_laws||[]).map(t=>[t.law_name,t.source_type].filter(Boolean).join("|")).join(`
`)}function ko(e){return(e?.expected_articles||[]).map(t=>[t.law_name||t.law_key,t.article_no].filter(Boolean).join("|")).join(`
`)}function So(e){return(e?.expected_judgments||[]).map(t=>t.jid).join(`
`)}function qo(e){return(e?.tags||[]).join(", ")}function Kt(e){return`<div class="qb-empty">${u("info",18)}<span>${n(e)}</span></div>`}function ma(e){let t=(e.expected_laws||[]).map(i=>i.law_name).filter(Boolean),s=(e.expected_articles||[]).map(i=>`${i.law_name||""} ${i.article_no||""}`.trim()).filter(Boolean),a=(e.expected_judgments||[]).map(i=>i.jid).filter(Boolean),r=[...t.map(i=>`<span class="chip">${n(i)}</span>`),...s.map(i=>`<span class="chip">${n(i)}</span>`),...a.map(i=>`<span class="chip chip-mono">${n(i)}</span>`)];return r.length?`<div class="chips qb-labels">${r.join("")}</div>`:'<span class="qb-muted">\u5C1A\u672A\u6A19\u8A3B expected labels</span>'}function ga(){return`<details class="qb-import">
    <summary>${u("upload",14)}JSON \u6279\u6B21\u532F\u5165</summary>
    <p class="qb-muted">\u683C\u5F0F\uFF1A<code>{"items":[{question, question_type, difficulty, expected_laws, expected_articles, expected_judgments, reference_answer, tags, rubric}]}</code>\u3002\u76F8\u540C\u984C\u76EE fingerprint \u9810\u8A2D\u66F4\u65B0\u3002</p>
    <textarea class="input" id="qb-import-json" rows="6" placeholder='{"items":[...]}'></textarea>
    <div class="qb-actions">
      <button class="btn btn-secondary btn-sm" type="button" data-qb-action="import-json">${u("upload",13)}<span>\u532F\u5165 JSON</span></button>
    </div>
  </details>`}function xo(e){let t=e?.item||{},s=Array.isArray(e?.warnings)?e.warnings:[],a=Array.isArray(t.tags)?t.tags:[];return`<section class="report-card qb-card qb-ai-result">
    <div class="side-card-head">
      <span class="side-card-title">${u("sparkles",14)}Ollama \u5DF2\u5EFA\u7ACB\u984C\u76EE #${t.id}</span>
      ${Yt(t.status)}
    </div>
    <div class="qb-ai-answer">
      <strong>${n(t.question||"")}</strong>
      <div class="qb-ai-meta">
        ${n(at[t.question_type]||t.question_type||"")}
        \xB7 ${n(Ct[t.difficulty]||t.difficulty||"")}
        \xB7 ${n(e?.model||"\u672C\u6A5F Ollama")}
      </div>
      ${ma(t)}
      ${t.reference_answer?`<div class="qb-reference"><span class="summary-label">Ollama \u53C3\u8003\u7B54\u6848</span><p>${n(t.reference_answer)}</p></div>`:""}
      ${a.length?`<div class="chips">${a.map(r=>`<span class="chip">${n(r)}</span>`).join("")}</div>`:""}
      ${s.length?`<div class="qb-ai-warnings"><strong>\u9700\u8981\u6CE8\u610F</strong><ul>${s.map(r=>`<li>${n(r)}</li>`).join("")}</ul></div>`:""}
      <div class="qb-actions">
        <button class="btn btn-primary btn-sm" type="button" data-qb-action="review-ai-item">${u("shield",13)}<span>\u524D\u5F80\u9A57\u6536</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="reset-ai">${u("plus",13)}<span>\u518D\u65B0\u589E\u4E00\u984C</span></button>
      </div>
    </div>
    ${ga()}
  </section>`}function Ao(e){return e.aiResult?xo(e.aiResult):`<section class="report-card qb-card">
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
    ${ga()}
  </section>`}function Lo(e){return`<section class="report-card qb-card">
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
          <select class="select" name="question_type">${Object.entries(at).map(([t,s])=>`<option value="${t}" ${e?.question_type===t?"selected":""}>${s}</option>`).join("")}</select>
        </label>
        <label class="field"><span class="field-label">\u96E3\u5EA6</span>
          <select class="select" name="difficulty">${Object.entries(Ct).map(([t,s])=>`<option value="${t}" ${e?.difficulty===t?"selected":""}>${s}</option>`).join("")}</select>
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
          <textarea class="input" name="expected_laws" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5&#10;\u9280\u884C\u6CD5|law">${n(_o(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u689D\u6587 <span class="field-tag">\u6CD5\u898F|\u7B2C 157-1 \u689D</span></span>
          <textarea class="input" name="expected_articles" rows="3" placeholder="\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 157-1 \u689D&#10;\u8B49\u5238\u4EA4\u6613\u6CD5|\u7B2C 171 \u689D">${n(ko(e))}</textarea>
        </label>
        <label class="field"><span class="field-label">\u9810\u671F\u5224\u6C7A <span class="field-tag">jid\uFF0C\u6BCF\u884C\u4E00\u7B46</span></span>
          <textarea class="input" name="expected_judgments" rows="3" placeholder="TPDM,113,\u91D1\u8A34,27,20241128,1">${n(So(e))}</textarea>
        </label>
      </div>
      <label class="field"><span class="field-label">\u53C3\u8003\u7B54\u6848\uFF0Frubric \u8AAA\u660E</span>
        <textarea class="input" name="reference_answer" rows="4" placeholder="\u63D0\u4F9B\u7D66 LLM judge \u8207\u4EBA\u5DE5\u9A57\u6536\u53C3\u8003\uFF1B\u53EF\u7559\u7A7A\uFF0C\u4F46\u54C1\u8CEA\u8A55\u5206\u6703\u8F03\u5F31\u3002">${n(e?.reference_answer||"")}</textarea>
      </label>
      <div class="qb-form-grid">
        <label class="field"><span class="field-label">\u6A19\u7C64 <span class="field-tag">\u9017\u865F\u5206\u9694</span></span>
          <input class="input" name="tags" value="${n(qo(e))}" placeholder="\u5167\u7DDA\u4EA4\u6613, \u8B49\u5238\u4EA4\u6613\u6CD5" />
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
    ${ga()}
  </section>`}function Mo(e,t){return e?Lo(e):Ao(t)}function jo(e){let t=e.status==="retired"||!!e.deleted_at;return`<article class="qb-item" data-qb-item="${e.id}">
    <div class="qb-item-head">
      <span class="qb-id">#${e.id}</span>
      <div class="qb-item-title">
        <strong>${n(e.question)}</strong>
        <span class="qb-meta">
          ${n(at[e.question_type]||e.question_type)}
          \xB7 ${n(Ct[e.difficulty]||e.difficulty)}
          \xB7 v${e.version}
          ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
          ${e.benchmark_ready?' \xB7 <span class="qb-ready">Benchmark ready</span>':""}
        </span>
      </div>
      ${Yt(e.status)}
    </div>
    <div class="qb-fingerprint mono">fingerprint ${n(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${ma(e)}
    <div class="qb-item-foot">
      <span>\u66F4\u65B0 ${n(ve(e.updated_at))}</span>
      ${e.reviewed_by?`<span>\u5BE9\u6838 ${n(e.reviewed_by)}</span>`:""}
      ${e.review_comment?`<span class="qb-comment">${n(e.review_comment)}</span>`:""}
      <div class="qb-actions">
        ${t?`<button class="btn btn-primary btn-sm" type="button" data-qb-action="restore" data-id="${e.id}">${u("refresh",13)}<span>\u5FA9\u539F\u984C\u76EE</span></button>`:`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${u("edit",13)}<span>\u7DE8\u8F2F</span></button>
               ${["pending_review","changes_requested"].includes(e.status)?"":`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="submit-review" data-id="${e.id}">${u("upload",13)}<span>${e.status==="draft"?"\u9001\u5BE9":"\u91CD\u65B0\u9001\u5BE9"}</span></button>`}
               <button class="btn btn-secondary btn-sm" type="button" data-qb-action="review" data-id="${e.id}">${u("shield",13)}<span>\u9A57\u6536</span></button>
               <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${u("trash",13)}<span>\u522A\u9664</span></button>`}
      </div>
    </div>
  </article>`}function To(e){return`<section class="report-card qb-card">
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
        ${Object.entries(ua).map(([t,s])=>`<option value="${t}" ${e.filters.status===t?"selected":""}>${s.label}</option>`).join("")}
      </select>
      <select class="select" name="question_type">
        <option value="">\u5168\u90E8\u984C\u578B</option>
        ${Object.entries(at).map(([t,s])=>`<option value="${t}" ${e.filters.question_type===t?"selected":""}>${s}</option>`).join("")}
      </select>
      <select class="select" name="difficulty">
        <option value="">\u5168\u90E8\u96E3\u5EA6</option>
        ${Object.entries(Ct).map(([t,s])=>`<option value="${t}" ${e.filters.difficulty===t?"selected":""}>${s}</option>`).join("")}
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
      ${e.items.length?e.items.map(t=>jo(t)).join(""):Kt("\u76EE\u524D\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u984C\u76EE\u3002")}
    </div>
    <div class="qb-pagination">
      <span>\u5171 ${c(e.total)} \u984C</span>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="prev" ${e.offset<=0?"disabled":""}>\u4E0A\u4E00\u9801</button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="next" ${e.offset+e.limit>=e.total?"disabled":""}>\u4E0B\u4E00\u9801</button>
      </div>
    </div>
  </section>`}var Pn=[["queue","\u5F85\u5BE9\uFF0F\u9000\u56DE"],["accepted","\u5DF2\u6838\u51C6"],["rejected","\u5DF2\u62D2\u7D55"],["draft","\u8349\u7A3F"]];function Eo(e){let t=e.stats||{};return{queue:Number(t.pending_review||0)+Number(t.changes_requested||0),accepted:Number(t.accepted||0),rejected:Number(t.rejected||0),draft:Number(t.draft||0)}}function No(e,t){let s=e.reviewFilter||"queue",a={queue:{title:"\u76EE\u524D\u6C92\u6709\u5F85\u5BE9\u6216\u9000\u56DE\u4FEE\u6539\u7684\u984C\u76EE\u3002",text:t.accepted?`\u5DF2\u6709 ${c(t.accepted)} \u984C\u6838\u51C6\u3002\u65B0\u984C\u76EE\u5EFA\u7ACB\u5F8C\u6703\u81EA\u52D5\u9001\u5BE9\uFF0C\u4E5F\u53EF\u4EE5\u5207\u63DB\u5230\u300C\u5DF2\u6838\u51C6\u300D\u91CD\u65B0\u9A57\u6536\u65E2\u6709\u984C\u76EE\u3002`:"\u5EFA\u7ACB\u984C\u76EE\u5F8C\u6703\u9810\u8A2D\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\uFF1B\u82E5\u53EA\u60F3\u5148\u4FDD\u5B58\uFF0C\u5EFA\u7ACB\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5373\u53EF\u5B58\u6210\u8349\u7A3F\u3002"},accepted:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u6838\u51C6\u984C\u76EE\u3002",text:"\u984C\u76EE\u901A\u904E\u4EBA\u5DE5\u9A57\u6536\u5F8C\u6703\u5217\u5728\u9019\u88E1\uFF1B\u4E5F\u53EF\u4EE5\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u9001\u51FA\u9A57\u6536\u3002"},rejected:{title:"\u76EE\u524D\u6C92\u6709\u5DF2\u62D2\u7D55\u984C\u76EE\u3002",text:"\u88AB\u62D2\u7D55\u7684\u984C\u76EE\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u4E2D\uFF0C\u53EF\u4FEE\u6539\u5F8C\u91CD\u65B0\u9001\u5BE9\u3002"},draft:{title:"\u76EE\u524D\u6C92\u6709\u8349\u7A3F\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u984C\u76EE\u6642\u53D6\u6D88\u52FE\u9078\u300C\u7ACB\u5373\u9001\u5BE9\u300D\u5C31\u6703\u5B58\u6210\u8349\u7A3F\uFF0C\u4E4B\u5F8C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002"}}[s]||{title:"\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002",text:"\u5EFA\u7ACB\u65B0\u984C\u76EE\u5F8C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"},r=[s!=="draft"?`<button class="btn btn-primary btn-sm" type="button" data-qb-action="new">${u("plus",13)}<span>\u65B0\u589E\u984C\u76EE</span></button>`:"",s==="queue"&&t.accepted?`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="review-filter" data-filter="accepted">${u("shield",13)}<span>\u67E5\u770B\u5DF2\u6838\u51C6 ${c(t.accepted)}</span></button>`:"",`<button class="btn btn-secondary btn-sm" type="button" data-qb-action="go-manage">${u("database",13)}<span>\u524D\u5F80\u984C\u5EAB\u7BA1\u7406</span></button>`].filter(Boolean).join("");return`<div class="qb-empty qb-empty-block">
    <span class="qb-empty-icon">${u("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>${n(a.title)}</strong>
      <p>${n(a.text)}</p>
      <div class="qb-actions">${r}</div>
    </div>
  </div>`}function Co(e){let t=Pn.find(([s])=>s===e);return t?t[1]:"\u5F85\u5BE9\uFF0F\u9000\u56DE"}function Ro(e,t){return`<button class="qb-review-item${t?" is-active":""}" type="button" data-qb-action="select-review-item" data-id="${e.id}" aria-pressed="${t?"true":"false"}">
    <span class="qb-review-item-top">
      <span class="qb-id">#${e.id}</span>
      <span class="qb-review-item-meta">
        ${n(at[e.question_type]||e.question_type)}
        \xB7 ${n(Ct[e.difficulty]||e.difficulty)}
        \xB7 v${e.version}
        ${e.benchmark_ready?" \xB7 Benchmark ready":""}
        ${e.stale?' \xB7 <span class="qb-stale">\u5F85\u91CD\u65B0\u9A57\u6536</span>':""}
      </span>
      ${Yt(e.status)}
    </span>
    <strong>${n(e.question)}</strong>
  </button>`}function Io(e){return`<article class="qb-review-pane-card">
    <div class="qb-review-pane-head">
      <div class="qb-review-pane-title">
        <span class="qb-review-item-meta">#${e.id} \xB7 v${e.version} \xB7 ${n(at[e.question_type]||e.question_type)} \xB7 ${n(Ct[e.difficulty]||e.difficulty)}</span>
        <strong>${n(e.question)}</strong>
      </div>
      <div class="qb-review-pane-side">
        ${Yt(e.status)}
        <div class="qb-actions">
          <button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${e.id}">${u("edit",13)}<span>\u7DE8\u8F2F</span></button>
          <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${e.id}">${u("trash",13)}<span>\u522A\u9664</span></button>
        </div>
      </div>
    </div>
    <div class="qb-fingerprint mono">fingerprint ${n(e.fingerprint?.slice(0,16)||"\u2014")}</div>
    ${ma(e)}
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
    ${e.reviews?.length?`<div class="qb-review-history"><span class="summary-label">\u5BE9\u6838\u7D00\u9304</span>${e.reviews.map(t=>`<div class="qb-review-row"><span>${n(t.reviewer||"\u533F\u540D")}</span>${Yt(t.decision==="approved"?"accepted":t.decision)}<span>${n(ve(t.created_at))}</span><p>${n(t.comment||"\u2014")}</p></div>`).join("")}</div>`:""}
  </article>`}function Po(){return`<div class="qb-empty qb-empty-block qb-review-placeholder">
    <span class="qb-empty-icon">${u("info",18)}</span>
    <div class="qb-empty-copy">
      <strong>\u5F9E\u5DE6\u5074\u9078\u64C7\u984C\u76EE</strong>
      <p>\u9EDE\u9078\u984C\u76EE\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u984C\u5E79\u3001\u9810\u671F\u6A19\u8A3B\u3001\u53C3\u8003\u7B54\u6848\u8207\u6838\u51C6\u9078\u9805\u3002</p>
    </div>
  </div>`}function Bo(e){let t=e.reviewDetail,s=Eo(e),a=e.reviewFilter||"queue",r=Pn.map(([l,m])=>`<button class="chip qb-review-tab${a===l?" is-active":""}" type="button" role="tab" aria-selected="${a===l?"true":"false"}" data-qb-action="review-filter" data-filter="${l}"><span>${m}</span><span class="qb-review-tab-count">${c(s[l]||0)}</span></button>`).join(""),i=e.reviewItems.length?e.reviewItems.map(l=>Ro(l,Number(t?.id)===Number(l.id))).join(""):`<div class="qb-empty qb-empty-compact">${u("info",16)}<span>\u76EE\u524D\u6C92\u6709${n(Co(a))}\u984C\u76EE\u3002</span></div>`,o=t?Io(t):e.reviewItems.length?Po():No(e,s);return`<section class="report-card qb-card qb-review-card">
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
  </section>`}function Wt(e){if(e==null||e==="")return"";let t=Number(e);return Number.isFinite(t)?`${Math.round(t*100)}%`:""}function Oo(e){if(!e||typeof e!="object")return"\u5F15\u7528";let t=String(e.jid||"").trim();if(t)return t;let s=String(e.law_name||"").trim(),a=String(e.article_no||"").trim(),r=`${s} ${a}`.trim();return r||String(e.title||e.text||"\u5F15\u7528").slice(0,80)}function Do(e){let t=e?.metrics||{},s=t.scores||{},a=[["\u6CD5\u898F\u53EC\u56DE",Wt(t.law_recall)],["\u689D\u6587\u53EC\u56DE",Wt(t.article_recall)],["\u898F\u5247\u5206",Wt(s.deterministic)],["Judge",Wt(s.judge)],["\u4EBA\u5DE5",Wt(s.human)]].filter(([,r])=>r);return a.length?`<div class="qb-bank-stats">${a.map(([r,i])=>`<span class="qb-bank-stat"><span>${n(r)}</span><strong>${n(i)}</strong></span>`).join("")}</div>`:""}function Fo(e){let t=Array.isArray(e?.law_sources)?e.law_sources:[],s=Array.isArray(e?.citations)?e.citations:[],a=t.length?`<div class="qb-bank-sources">${t.map(i=>{let o=String(i.law_name||"\u672A\u547D\u540D\u6CD5\u898F"),l=(i.articles||[]).map(b=>String(b.article_no||"").trim()).filter(Boolean),m=`<strong>${n(o)}</strong>${l.length?`<small>${n(l.join("\u3001"))}</small>`:""}`;return i.law_url?`<a class="qb-bank-law" href="${n(i.law_url)}" target="_blank" rel="noreferrer">${m}</a>`:`<span class="qb-bank-law">${m}</span>`}).join("")}</div>`:"",r=s.length?`<div class="qb-bank-sources qb-bank-citations">${s.map(i=>`<span class="chip chip-mono">${n(Oo(i))}</span>`).join("")}</div>`:"";return!a&&!r?"":`<div class="qb-bank-answer-block">
    <div class="qb-bank-section-label"><span>\u5F15\u7528\u4F86\u6E90</span><span>${c(t.length+s.length)} \u7B46</span></div>
    ${a}${r}
  </div>`}function Bn(e,t){if(!e)return`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${u("history",20)}</span>
      <strong>\u5C1A\u7121 RAG \u7B54\u6848</strong>
      <span>\u8DD1\u4E00\u6B21 Benchmark \u5F8C\uFF0C\u6700\u8FD1\u4E00\u6B21\u6210\u529F\u56DE\u7B54\u6703\u986F\u793A\u5728\u9019\u88E1\u3002</span>
    </div>`;let s=Number(e.item_version||0),a=Number(t?.version||0),r=s&&a&&s!==a?`<span class="badge badge-warn">\u7B54\u6848 v${s} \xB7 \u984C\u76EE v${a}</span>`:"",i=e.answer_source==="llm"?"LLM \u751F\u6210":e.answer_source==="structured"?"\u6CD5\u898F\u8CC7\u6599\u5EAB":String(e.answer_source||"RAG");return`<div class="qb-bank-answer-meta">
      <span class="badge badge-ok"><span class="status-dot is-ok"></span>RAG \u5B8C\u6210</span>
      <span class="badge badge-neutral">${n(i)}</span>
      ${r}
      <span class="mono">${n(e.run_label||e.run_id||"")}</span>
      <span>${n(ve(e.finished_at))}</span>
      <span>${n(ne(e.duration_ms))}</span>
      ${e.llm_model?`<span class="mono">${n(e.llm_model)}</span>`:""}
    </div>
    <div class="qb-bank-answer-block">
      <div class="qb-bank-section-label"><span>\u56DE\u7B54</span><span>${c(String(e.answer||"").length)} \u5B57</span></div>
      <p class="qb-bank-answer-text">${n(String(e.answer||"").trim()||"\uFF08\u7A7A\u767D\u56DE\u7B54\uFF09")}</p>
    </div>
    ${Fo(e)}
    ${Do(e)}`}function On(e,t){let s=e.selectedSuiteId,a=t&&e.suiteAnswers?.[String(s)]?.[String(t.id)]||null;return t?`<div class="qb-bank-answer-head">
      <div class="qb-bank-answer-heading">
        <span class="qb-bank-answer-kicker">${u("sparkles",12)}RAG \u6700\u8FD1\u4E00\u6B21\u7B54\u6848</span>
        <strong class="qb-bank-answer-question">#${t.id} ${n(t.question)}</strong>
      </div>
      ${a?`<span class="qb-bank-answer-state">${n(at[t.question_type]||t.question_type)} \xB7 v${t.version}</span>`:""}
    </div>
    ${Bn(a,t)}`:`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${u("cube",20)}</span>
      <strong>\u9078\u64C7\u984C\u76EE</strong>
      <span>\u5F9E\u5DE6\u5074\u6E05\u55AE\u9078\u64C7\u4E00\u984C\uFF0C\u67E5\u770B\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`}function Dn(e){return`<span class="qb-bank-actions">
    <button class="qb-bank-icon" type="button" data-qb-action="edit" data-id="${e.id}" title="\u7DE8\u8F2F\u984C\u76EE" aria-label="\u7DE8\u8F2F\u984C\u76EE #${e.id}">${u("edit",13)}</button>
    <button class="qb-bank-icon is-danger" type="button" data-qb-action="delete" data-id="${e.id}" title="\u5F9E\u984C\u5EAB\u79FB\u9664" aria-label="\u5F9E\u984C\u5EAB\u79FB\u9664 #${e.id}">${u("trash",13)}</button>
  </span>`}function Ho(e,t,{selected:s,hasAnswer:a}){return`<div class="qb-bank-row${s?" is-active":""}" data-id="${e.id}">
    <button class="qb-bank-select" type="button" data-qb-action="select-bank-item" data-id="${e.id}" aria-pressed="${s?"true":"false"}">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <span class="qb-bank-item-copy">
        <strong>${n(e.question)}</strong>
        <small>${n(at[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${a?"\u5DF2\u6709 RAG \u7B54\u6848":"\u5C1A\u7121 RAG \u7B54\u6848"}</small>
      </span>
    </button>
    ${Dn(e)}
  </div>`}function zo(e,t,s){return`<article class="qb-bank-full-item" data-id="${e.id}">
    <div class="qb-bank-full-head">
      <span class="qb-bank-index">${String(t+1).padStart(2,"0")}</span>
      <div class="qb-bank-full-title">
        <strong>${n(e.question)}</strong>
        <small>${n(at[e.question_type]||e.question_type)} \xB7 v${e.version} \xB7 ${n(ua[e.status]?.label||e.status||"")}</small>
      </div>
      ${Dn(e)}
    </div>
    ${Bn(s,e)}
  </article>`}function In(e){let t=e.editingSuite,s=Array.isArray(e.suites)?e.suites:[],a=s.find(_=>Number(_.id)===Number(e.selectedSuiteId))||s[0]||null,r=Array.isArray(a?.items)?a.items:[],i=e.suiteAnswers?.[String(a?.id)]||{},o=r.find(_=>Number(_.id)===Number(e.selectedBankItemId))||null,l=!!e.suiteAnswersLoading,m=String(e.suiteAnswersError||""),b=!!e.suiteManageOpen||!s.length,y=e.bankTab==="full"?"full":"split",v=s.length?`<div class="qb-bank-tabs" role="tablist" aria-label="Benchmark \u984C\u5EAB\u6AA2\u8996">
        <button class="qb-bank-tab${y==="split"?" is-active":""}" type="button" role="tab" aria-selected="${y==="split"?"true":"false"}" data-qb-action="bank-tab" data-tab="split">${u("grid",13)}<span>Benchmark \u984C\u5EAB</span><span class="badge badge-neutral">${c(r.length)}</span></button>
        <button class="qb-bank-tab${y==="full"?" is-active":""}" type="button" role="tab" aria-selected="${y==="full"?"true":"false"}" data-qb-action="bank-tab" data-tab="full">${u("table",13)}<span>\u984C\u5EAB\u5168\u5217\u8868</span><span class="badge badge-neutral">${c(r.length)}</span></button>
      </div>`:"",w="";if(!s.length)w=`<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${u("cube",20)}</span>
      <strong>\u5C1A\u672A\u5EFA\u7ACB Benchmark \u984C\u5EAB</strong>
      <span>\u5C55\u958B\u4E0B\u65B9 Suite \u8A2D\u5B9A\u4E26\u5EFA\u7ACB\u984C\u5EAB\u5F8C\uFF0C\u5C31\u80FD\u5728\u9019\u88E1\u700F\u89BD\u984C\u76EE\u8207\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u3002</span>
    </div>`;else if(l)w='<div class="qb-bank-loading"><span class="spinner" aria-hidden="true"></span><span>\u8B80\u53D6\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u4E2D\u2026</span></div>';else{let _=m?pe({tone:"warn",title:"\u6700\u8FD1\u4E00\u6B21 RAG \u7B54\u6848\u8B80\u53D6\u5931\u6557",text:n(m)}):"";y==="full"?w=`${_}<div class="qb-bank-full" data-qb-bank-view="full">${r.length?r.map((g,k)=>zo(g,k,i[String(g.id)]||null)).join(""):Kt("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>`:w=`${_}<div class="qb-bank-split" data-qb-bank-view="split">
        <div class="qb-bank-list" data-qb-bank-list>${r.length?r.map((g,k)=>Ho(g,k,{selected:Number(g.id)===Number(o?.id),hasAnswer:!!i[String(g.id)]})).join(""):Kt("\u9019\u500B benchmark \u984C\u5EAB\u76EE\u524D\u6C92\u6709\u984C\u76EE\u3002")}</div>
        <div class="qb-bank-answer-pane" data-qb-bank-answer>${On(e,o)}</div>
      </div>`}return`<section class="report-card qb-card qb-bank-card">
    <div class="side-card-head qb-bank-head">
      <div class="qb-bank-heading">
        <span class="side-card-title">${u("cube",14)}Benchmark \u984C\u5EAB</span>
        <span class="qb-bank-sub">${a?`${n(a.name)} \xB7 v${a.version} \xB7 ${c(a.item_count)} \u984C`:"\u5C1A\u672A\u5EFA\u7ACB suite"}</span>
      </div>
      <div class="qb-bank-controls">
        ${s.length?`<label class="qb-suite-picker"><span>Suite</span><select class="select" data-qb-suite-select aria-label="\u9078\u64C7 benchmark suite">${s.map(_=>`<option value="${_.id}" ${Number(_.id)===Number(a?.id)?"selected":""}>${n(_.name)} \xB7 ${c(_.item_count)} \u984C</option>`).join("")}</select></label>`:""}
        ${a?`<span class="badge ${a.status==="frozen"?"badge-ok":"badge-neutral"}">${a.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>`:""}
      </div>
    </div>
    ${v}
    ${w}
    <details class="qb-suite-manage" ${b?"open":""}>
      <summary>${u("sliders",14)}Suite \u8A2D\u5B9A\u8207\u7248\u672C <span class="qb-muted">${c(s.length)} \u500B suite \xB7 ${c(e.ready.length)} \u984C benchmark-ready</span></summary>
      <div class="qb-suite-manage-body">
        <form class="qb-suite-form" data-qb-form="suite">
          <input type="hidden" name="suite_id" value="${t?.id||""}" />
          <div class="qb-form-grid">
            <label class="field"><span class="field-label">Suite \u540D\u7A31</span><input class="input" name="name" required value="${n(t?.name||"Pilot 30")}" /></label>
            <label class="field"><span class="field-label">\u7B49\u7D1A</span><select class="select" name="tier">${Object.entries(Rn).map(([_,g])=>`<option value="${_}" ${t?.tier===_?"selected":""}>${g}</option>`).join("")}</select></label>
          </div>
          <label class="field"><span class="field-label">\u8AAA\u660E</span><input class="input" name="description" value="${n(t?.description||"30 \u984C pilot\uFF1B\u7528\u65BC RAG benchmark \u8207\u9577\u671F\u540C\u984C\u6BD4\u8F03\u3002")}" /></label>
          <div class="qb-check-list">
            ${e.ready.length?e.ready.map(_=>{let g=t?t.items?.some(k=>Number(k.id)===Number(_.id)):!0;return`<label class="qb-check-row"><input type="checkbox" name="item_ids" value="${_.id}" ${g?"checked":""}/><span><strong>#${_.id}</strong> ${n(_.question)} <small>${n(at[_.question_type]||_.question_type)}</small></span></label>`}).join(""):Kt("\u6C92\u6709\u5DF2\u9A57\u6536\u4E14 benchmark-ready \u7684\u984C\u76EE\uFF1B\u8ACB\u5148\u5B8C\u6210\u4EBA\u5DE5\u9A57\u6536\u3002")}
          </div>
          <div class="qb-actions">
            <button class="btn btn-primary" type="submit">${u("check",14)}<span>${t?"\u5132\u5B58 suite":"\u5EFA\u7ACB suite"}</span></button>
            ${t?'<button class="btn btn-secondary" type="button" data-qb-action="suite-new">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
          </div>
        </form>
        <div class="qb-list">
          ${s.length?s.map(_=>`<article class="qb-suite">
            <div class="qb-item-head">
              <div class="qb-item-title"><strong>${n(_.name)}</strong><span class="qb-meta">${n(Rn[_.tier]||_.tier)} \xB7 v${_.version} \xB7 ${c(_.item_count)} \u984C</span></div>
              <span class="badge ${_.status==="frozen"?"badge-ok":"badge-neutral"}">${_.status==="frozen"?"\u5DF2\u51CD\u7D50":"\u8349\u7A3F"}</span>
            </div>
            <div class="qb-suite-items">${(_.items||[]).slice(0,8).map(g=>`<span class="chip">#${g.id} ${n(g.question.slice(0,22))}${g.question.length>22?"\u2026":""}</span>`).join("")}${_.item_count>8?`<span class="qb-muted">+${_.item_count-8}</span>`:""}</div>
            <div class="qb-actions">
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-edit" data-id="${_.id}">${u("edit",13)}<span>\u7DE8\u8F2F suite</span></button>
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-freeze" data-id="${_.id}">${u("shield",13)}<span>\u51CD\u7D50</span></button>
              <button class="btn btn-ghost btn-sm" type="button" data-qb-action="suite-delete" data-id="${_.id}">${u("trash",13)}<span>\u522A\u9664</span></button>
            </div>
          </article>`).join(""):Kt("\u5C1A\u672A\u5EFA\u7ACB benchmark suite\u3002")}
        </div>
      </div>
    </details>
  </section>`}function Uo(e){let t={};for(let s of["clarity","labels","answer","difficulty","overall"]){let a=e.querySelector(`[name="score_${s}"]`),r=Number(a?.value);Number.isFinite(r)&&(t[s]=Math.max(1,Math.min(5,Math.round(r))))}return t}function Jo(e){let t=new FormData(e);return{question:String(t.get("question")||"").trim(),question_type:String(t.get("question_type")||"general"),difficulty:String(t.get("difficulty")||"medium"),visibility:String(t.get("visibility")||"shared"),expected_laws:yo(t.get("expected_laws")),expected_articles:$o(t.get("expected_articles")),expected_judgments:wo(t.get("expected_judgments")),reference_answer:String(t.get("reference_answer")||"").trim(),tags:String(t.get("tags")||"").split(",").map(s=>s.trim()).filter(Boolean),notes:String(t.get("notes")||"").trim(),rubric:{must_refuse:!!e.elements.must_refuse?.checked}}}function Fn(e,{onNavigate:t=null,onStats:s=null}={}){let a={create:"question-create",manage:"question-manage",suite:"benchmark-bank",review:"question-review"},r={tab:"",editing:null,editingFrom:"",editingSuite:null,aiQuestion:"",aiLoading:!1,aiResult:null,items:[],total:0,offset:0,limit:50,filters:{query:"",status:"",question_type:"",difficulty:"",tags:[]},stats:{},suites:[],ready:[],selectedSuiteId:null,selectedBankItemId:null,bankTab:"split",suiteAnswers:{},suiteAnswersLoading:!1,suiteAnswersError:"",suiteManageOpen:!1,reviewItems:[],reviewDetail:null,reviewFilter:"queue"},i=A=>e.querySelector(`#quality-panel-${a[A]}`),o=0,l=null,m=()=>"anonymous",b=()=>{s&&s(r.stats)},y=A=>{t&&t(A),x(A)},v=async()=>{try{r.stats=await U.questionBankStats()}catch{r.stats={}}b()},w=()=>{let A=i("create");A&&(A.innerHTML=Mo(r.editing,r))},_=(A,L)=>{let N=A?.querySelector("[data-qb-tag-results]");N&&(N.innerHTML=L.length?L.map(O=>`<button class="qb-tag-option" type="button" role="option" data-qb-action="select-tag" data-tag="${n(O.tag)}"><span>${n(O.tag)}</span><small>${c(O.count)}</small></button>`).join(""):'<div class="qb-tag-empty">\u6C92\u6709\u5176\u4ED6\u76F8\u7B26\u6A19\u7C64</div>')},g=async(A,L="")=>{if(!A)return;let N=A.querySelector("[data-qb-tag-results]"),O=++o;N&&(N.innerHTML='<div class="qb-tag-loading"><span class="spinner"></span><span>\u641C\u5C0B\u6A19\u7C64\u2026</span></div>');try{let se=await U.questionBankTags(L,12);if(O!==o)return;let H=(se.tags||[]).filter(fe=>!r.filters.tags.includes(fe.tag));_(A,H)}catch(se){if(O!==o)return;N&&(N.innerHTML=`<div class="qb-tag-empty">${n(se.message||"\u6A19\u7C64\u641C\u5C0B\u5931\u6557\u3002")}</div>`)}},k=(A,{focus:L=!1}={})=>{if(!A)return;let N=A.querySelector("[data-qb-tag-popover]"),O=A.querySelector("[data-qb-tag-search]");!N||!O||(N.hidden&&(N.hidden=!1,O.value="",g(A,"")),L&&(O.focus(),O.select()))},F=A=>{l&&(window.clearTimeout(l),l=null);let L=A?.querySelector("[data-qb-tag-popover]");L&&(L.hidden=!0)},Y=async A=>{let L=String(A||"").trim();L&&(r.filters.tags.includes(L)?r.filters.tags=r.filters.tags.filter(N=>N!==L):r.filters.tags=[...r.filters.tags,L],r.offset=0,await ie())},K=()=>{let A=Array.isArray(r.suites)?r.suites:[];if(!A.length)return r.selectedSuiteId=null,r.selectedBankItemId=null,null;let L=A.find(O=>Number(O.id)===Number(r.selectedSuiteId));L||(L=A[0],r.selectedSuiteId=L.id,r.selectedBankItemId=null);let N=Array.isArray(L.items)?L.items:[];return N.some(O=>Number(O.id)===Number(r.selectedBankItemId))||(r.selectedBankItemId=N[0]?.id??null),L},X=()=>{let A=i("suite");A&&(A.innerHTML=In(r))},W=0,ae=async(A,{force:L=!1}={})=>{if(!A)return;let N=++W;if(!L&&r.suiteAnswers[String(A)]){r.suiteAnswersLoading=!1,r.suiteAnswersError="",X();return}r.suiteAnswersLoading=!0,r.suiteAnswersError="",X();try{let O=await U.benchmarkSuiteLatestAnswers(A);if(N!==W)return;r.suiteAnswers[String(A)]=O.answers||{}}catch(O){if(N!==W)return;r.suiteAnswersError=O.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}finally{N===W&&(r.suiteAnswersLoading=!1,X())}},oe=async A=>{r.selectedSuiteId=A,r.selectedBankItemId=null,r.suiteAnswersError="";let L=K();if(!L){X();return}await ae(L.id)},le=A=>{r.bankTab=A==="full"?"full":"split",X()},$e=()=>{let A=i("suite");if(!A)return;let L=K(),O=(Array.isArray(L?.items)?L.items:[]).find(H=>Number(H.id)===Number(r.selectedBankItemId))||null;for(let H of A.querySelectorAll(".qb-bank-row")){let fe=Number(H.dataset.id)===Number(r.selectedBankItemId);H.classList.toggle("is-active",fe);let Z=H.querySelector("[data-qb-action='select-bank-item']");Z&&Z.setAttribute("aria-pressed",fe?"true":"false")}let se=A.querySelector("[data-qb-bank-answer]");se&&(se.innerHTML=On(r,O))},ie=async()=>{let A=i("manage");if(A){l&&(window.clearTimeout(l),l=null),A.innerHTML='<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>\u8B80\u53D6\u984C\u5EAB\u4E2D\u2026</span></div></section>';try{let L=await U.questionBankItems({...r.filters,...r.filters.status==="retired"?{include_deleted:!0}:{}},r.limit,r.offset);r.items=L.items||[],r.total=Number(L.total||0),r.stats=L.stats||r.stats,A.innerHTML=To(r),b()}catch(L){A.innerHTML=`<section class="report-card qb-card">${pe({tone:"danger",title:"\u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:n(L.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},j=async({refreshAnswers:A=!1}={})=>{let L=i("suite");if(L){L.innerHTML='<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>\u8B80\u53D6 benchmark \u984C\u5EAB\u4E2D\u2026</span></div></section>';try{let[N,O]=await Promise.all([U.benchmarkSuites(),U.benchmarkReadyQuestions(300)]);r.suites=N.suites||[],r.ready=O.items||[];let se=K();if(r.suiteAnswersError="",r.suiteAnswersLoading=!1,se&&(A||!r.suiteAnswers[String(se.id)]))try{let H=await U.benchmarkSuiteLatestAnswers(se.id);r.suiteAnswers[String(se.id)]=H.answers||{}}catch(H){r.suiteAnswersError=H.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"}L.innerHTML=In(r)}catch(N){L.innerHTML=`<section class="report-card qb-card">${pe({tone:"danger",title:"Benchmark \u984C\u5EAB\u8B80\u53D6\u5931\u6557",text:n(N.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}}},$=()=>{let A=i("review");A&&(A.innerHTML=Bo(r))},B=async A=>{let L=r.reviewItems.find(O=>Number(O.id)===Number(A));if(!L)return;r.reviewDetail=L,$();let N=i("review")?.querySelector(".qb-review-detail-pane");N&&window.matchMedia("(max-width: 1020px)").matches&&N.scrollIntoView({behavior:"smooth",block:"start"});try{let O=await U.questionBankItem(L.id);Number(r.reviewDetail?.id)===Number(L.id)&&(r.reviewDetail=O,$())}catch(O){M(O.message||"\u984C\u76EE\u5167\u5BB9\u8B80\u53D6\u5931\u6557\u3002","danger")}},D=async()=>{let A=i("review");if(!A)return;A.innerHTML='<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>\u8B80\u53D6\u9A57\u6536\u984C\u76EE\u4E2D\u2026</span></div></section>';let L=r.reviewFilter||"queue",N=L==="queue"?["pending_review","changes_requested"]:L==="accepted"?["accepted"]:L==="rejected"?["rejected"]:["draft"];try{let O=await Promise.all(N.map(Z=>U.questionBankItems({status:Z},200,0)));r.reviewItems=O.flatMap(Z=>Z.items||[]),r.stats=O[0]?.stats||r.stats;let se=Number(r.reviewDetail?.id||0),fe=r.reviewItems.some(Z=>Number(Z.id)===se)?se:Number(r.reviewItems[0]?.id||0);r.reviewDetail=fe?await U.questionBankItem(fe):null,$(),b()}catch(O){A.innerHTML=`<section class="report-card qb-card">${pe({tone:"danger",title:"\u9A57\u6536\u984C\u76EE\u8B80\u53D6\u5931\u6557",text:n(O.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}</section>`}};function x(A){let L=r.tab;r.tab=A;for(let N of Object.keys(a)){let O=i(N);O&&(O.hidden=N!==A)}A==="create"?(L!=="create"&&!r.editing&&(r.aiQuestion="",r.aiResult=null),w()):A==="manage"?ie():A==="suite"?j():A==="review"&&D()}let S=A=>{let N=[...r.items,...r.reviewItems,...r.reviewDetail?[r.reviewDetail]:[]].find(se=>Number(se.id)===Number(A));r.reviewDetail=N||{id:Number(A)};let O=N?.status;["accepted","rejected","draft"].includes(O)?r.reviewFilter=O:O&&(r.reviewFilter="queue"),y("review")},q=async A=>{let L=Jo(A),N=Number(A.elements.item_id?.value||0);N||(L.status=A.elements.submit_for_review?.checked?"pending_review":"draft");try{N?(await U.updateQuestionBankItem(N,{...L,change_note:"\u984C\u5EAB\u7BA1\u7406\u4FEE\u6539"}),M("\u5DF2\u5EFA\u7ACB\u65B0\u7248\u672C\uFF0C\u72C0\u614B\u56DE\u5230\u5F85\u5BE9\u3002","ok")):(await U.createQuestionBankItem(L),M(L.status==="draft"?"\u984C\u76EE\u5DF2\u5B58\u70BA\u8349\u7A3F\uFF0C\u53EF\u5728\u984C\u5EAB\u7BA1\u7406\u6309\u300C\u9001\u5BE9\u300D\u3002":"\u984C\u76EE\u5DF2\u5EFA\u7ACB\u4E26\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok")),r.editing=null;let O=["manage","suite","review"].includes(r.editingFrom)?r.editingFrom:"manage";r.editingFrom="",r.suiteAnswers={},await v(),y(O)}catch(O){let se=O.detail||O.payload?.detail,H=se?.errors?.join(" \xB7 ")||se?.message||O.message||"\u984C\u76EE\u5132\u5B58\u5931\u6557\u3002";M(H,"danger",8e3)}},R=async A=>{let L=String(new FormData(A).get("question")||"").trim();if(L.length<4){M("\u984C\u76EE\u81F3\u5C11\u9700\u8981 4 \u500B\u5B57\u3002","danger");return}r.aiQuestion=L,r.aiLoading=!0,r.aiResult=null,w();try{let N=await U.createQuestionBankItemWithAI({question:L});r.aiResult=N,r.aiQuestion="",await v(),M(`Ollama \u5DF2\u5EFA\u7ACB\u984C\u76EE #${N.item.id}\uFF0C\u72C0\u614B\u70BA\u5F85\u5BE9\uFF0C\u8ACB\u4EBA\u5DE5\u8986\u6838\u3002`,"ok",8e3)}catch(N){let O=N.detail||N.payload?.detail,se=O?.errors?.join(" \xB7 ")||O?.message||N.message||"Ollama \u7522\u751F\u5931\u6557\u3002";M(se,"danger",12e3)}finally{r.aiLoading=!1,w()}},Q=async(A,L)=>{let N=Number(A.dataset.id||0);if(N)try{await U.reviewQuestionBankItem(N,{decision:L,reviewer:m(),rubric_scores:Uo(A),comment:String(A.querySelector('[name="comment"]')?.value||"")}),M(L==="approved"?"\u984C\u76EE\u5DF2\u6838\u51C6\u3002":L==="changes_requested"?"\u5DF2\u9000\u56DE\u4FEE\u6539\u3002":"\u984C\u76EE\u5DF2\u62D2\u7D55\u3002",L==="approved"?"ok":"info"),await v(),await D()}catch(O){let se=O.detail||O.payload?.detail,H=se?.errors?.join(" \xB7 ")||se?.message||O.message||"\u9A57\u6536\u5931\u6557\u3002";M(H,"danger",8e3)}},z=async A=>{let L=new FormData(A),N=Number(L.get("suite_id")||0),O=Array.from(A.querySelectorAll('input[name="item_ids"]:checked')).map(H=>Number(H.value)),se={name:String(L.get("name")||"").trim(),tier:String(L.get("tier")||"core"),description:String(L.get("description")||"").trim(),item_ids:O};try{N?(await U.updateBenchmarkSuite(N,se),M("Benchmark \u984C\u5EAB\u5DF2\u66F4\u65B0\u3002","ok")):(await U.createBenchmarkSuite(se),M("Benchmark \u984C\u5EAB\u5DF2\u5EFA\u7ACB\u3002","ok")),r.editingSuite=null,r.suiteManageOpen=!0,r.suiteAnswers={},await j()}catch(H){let fe=H.detail||H.payload?.detail,Z=fe?.errors?.join(" \xB7 ")||fe?.message||H.message||"Suite \u5132\u5B58\u5931\u6557\u3002";M(Z,"danger",8e3)}},te=async A=>{let L=e.querySelector("[data-qb-tag-filter] [data-qb-tag-popover]:not([hidden])")?.closest("[data-qb-tag-filter]");L&&!A.target.closest("[data-qb-tag-filter]")&&F(L);let N=A.target.closest("[data-qb-action]")?.dataset.qbAction;if(!N)return;let O=A.target.closest("[data-qb-action]"),se=Number(O.dataset.id||0);if(N==="open-tag-search"){let H=O.closest("[data-qb-tag-filter]");k(H,{focus:!0});return}if(N==="select-tag"){await Y(O.dataset.tag);return}if(N==="remove-tag"){await Y(O.dataset.tag);return}if(N==="bank-tab"){le(O.dataset.tab);return}if(N==="select-bank-item"){r.selectedBankItemId=se,$e();return}if(N==="new"){r.editing=null,r.editingFrom="",r.aiQuestion="",r.aiResult=null,r.aiLoading=!1,y("create");return}if(N==="reset-create"){r.editing=null,w();return}if(N==="reset-ai"){r.aiQuestion="",r.aiResult=null,r.aiLoading=!1,w();return}if(N==="edit"){let H=r.suites.find(Ie=>Number(Ie.id)===Number(r.selectedSuiteId)),Z=[...r.items,...r.reviewItems,...H?.items||[],...r.reviewDetail?[r.reviewDetail]:[]].find(Ie=>Number(Ie.id)===se);if(!Z)return;r.editing=Z,r.editingFrom=r.tab,y("create");return}if(N==="review"){S(se);return}if(N==="review-ai-item"){let H=r.aiResult?.item;if(!H)return;r.reviewFilter="queue",r.reviewDetail=H,y("review");return}if(N==="review-filter"){let H=String(O.dataset.filter||"queue");r.reviewFilter=["queue","accepted","rejected","draft"].includes(H)?H:"queue",r.reviewDetail=null,await D();return}if(N==="select-review-item"){await B(se);return}if(N==="go-manage"){y("manage");return}if(N==="submit-review"){try{await U.submitQuestionBankItemForReview(se),M("\u5DF2\u9001\u4EA4\u4EBA\u5DE5\u9A57\u6536\u3002","ok"),await v(),r.tab==="manage"?await ie():r.tab==="review"&&await D()}catch(H){let fe=H.detail||H.payload?.detail,Z=fe?.errors?.join(" \xB7 ")||fe?.message||H.message||"\u9001\u5BE9\u5931\u6557\u3002";M(Z,"danger",8e3)}return}if(N==="restore"){if(!window.confirm(`\u78BA\u5B9A\u5FA9\u539F\u984C\u76EE #${se}\uFF1F\u5FA9\u539F\u5F8C\u6703\u56DE\u5230\u5F85\u5BE9\u72C0\u614B\uFF0C\u9700\u91CD\u65B0\u9A57\u6536\u3002`))return;try{await U.restoreQuestionBankItem(se),M("\u984C\u76EE\u5DF2\u5FA9\u539F\u4E26\u56DE\u5230\u5F85\u5BE9\u3002","ok"),await v(),await ie()}catch(H){let fe=H.detail||H.payload?.detail,Z=fe?.errors?.join(" \xB7 ")||fe?.message||H.message||"\u5FA9\u539F\u5931\u6557\u3002";M(Z,"danger",8e3)}return}if(N==="delete"){if(r.tab==="suite"){let H=K();if(!H||!(H.items||[]).find(Z=>Number(Z.id)===se)||!window.confirm(`\u78BA\u5B9A\u5F9E\u300C${H.name}\u300D\u79FB\u9664\u984C\u76EE #${se}\uFF1F\u984C\u76EE\u4ECD\u6703\u4FDD\u7559\u5728\u984C\u5EAB\u7BA1\u7406\u4E2D\u3002`))return;try{await U.removeBenchmarkSuiteItem(H.id,se),M("\u5DF2\u5F9E Benchmark \u984C\u5EAB\u79FB\u9664\u3002","info"),delete r.suiteAnswers[String(H.id)],Number(r.selectedBankItemId)===se&&(r.selectedBankItemId=null),await j()}catch(Z){M(Z.message||"\u79FB\u9664\u5931\u6557\u3002","danger")}return}if(!window.confirm(`\u78BA\u5B9A\u522A\u9664\u984C\u76EE #${se}\uFF1F\u984C\u76EE\u6703\u6A19\u8A18\u70BA retired\uFF0C\u6B77\u53F2 benchmark \u4ECD\u6703\u4FDD\u7559\u3002`))return;try{await U.deleteQuestionBankItem(se),M("\u984C\u76EE\u5DF2\u522A\u9664\u3002","info"),await v(),r.tab==="review"?(r.reviewDetail=null,await D()):await ie()}catch(H){M(H.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(N==="revalidate"){try{let H=await U.revalidateQuestionBank();M(`\u5DF2\u91CD\u65B0\u9A57\u8B49 ${c(H.checked||0)} \u984C\uFF0C${c(H.stale||0)} \u984C\u9700\u91CD\u65B0\u9A57\u6536\u3002`,"info",7e3),await v(),await ie()}catch(H){M(H.message||"\u91CD\u65B0\u9A57\u8B49\u5931\u6557\u3002","danger")}return}if(N==="export"){try{let H=await U.exportQuestionBank({status:""});tt(`judgment-question-bank-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(H,null,2),"application/json;charset=utf-8")}catch(H){M(H.message||"\u532F\u51FA\u5931\u6557\u3002","danger")}return}if(N==="import-json"){let H=e.querySelector("#qb-import-json");try{let fe=JSON.parse(String(H?.value||"").trim()),Z=await U.importQuestionBank(fe);M(`\u532F\u5165\u5B8C\u6210\uFF1A\u65B0\u589E ${Z.created}\u3001\u66F4\u65B0 ${Z.updated}\u3001\u932F\u8AA4 ${(Z.errors||[]).length}\u3002`,(Z.errors||[]).length?"warn":"ok",8e3),H&&(H.value=""),await v(),await ie()}catch(fe){M(fe.message||"JSON \u532F\u5165\u5931\u6557\u3002","danger",8e3)}return}if(N==="prev"||N==="next"){r.offset=Math.max(0,r.offset+(N==="next"?r.limit:-r.limit)),await ie();return}if(N==="suite-edit"){let H=r.suites.find(fe=>Number(fe.id)===se);if(!H)return;r.editingSuite=H,r.suiteManageOpen=!0,j();return}if(N==="suite-new"){r.editingSuite=null,r.suiteManageOpen=!0,j();return}if(N==="suite-freeze"){try{await U.updateBenchmarkSuite(se,{freeze:!0}),M("Benchmark \u984C\u5EAB\u5DF2\u51CD\u7D50\u4E26\u5EFA\u7ACB\u65B0\u7248\u672C\u3002","ok"),r.editingSuite=null,r.suiteManageOpen=!0,await j()}catch(H){M(H.message||"\u51CD\u7D50\u5931\u6557\u3002","danger")}return}if(N==="suite-delete"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 benchmark \u984C\u5EAB #${se}\uFF1F\u6B77\u53F2 run \u4ECD\u6703\u4FDD\u7559 snapshot\u3002`))return;try{await U.deleteBenchmarkSuite(se),M("Benchmark \u984C\u5EAB\u5DF2\u522A\u9664\u3002","info"),r.editingSuite=null,r.suiteAnswers={},r.suiteManageOpen=!0,await j()}catch(H){M(H.message||"\u522A\u9664\u5931\u6557\u3002","danger")}return}if(N==="decide"){let H=O.closest("form[data-qb-form='review']");H&&await Q(H,String(O.dataset.decision||""))}},me=async A=>{let L=A.target.closest("[data-qb-form]");if(!L)return;A.preventDefault();let N=L.dataset.qbForm;if(N==="create")await q(L);else if(N==="ai-create")await R(L);else if(N==="filter"){let O=new FormData(L);r.filters={query:String(O.get("query")||"").trim(),status:String(O.get("status")||""),question_type:String(O.get("question_type")||""),difficulty:String(O.get("difficulty")||""),tags:O.getAll("tags").map(se=>String(se).trim()).filter(Boolean)},r.offset=0,await ie()}else N==="suite"&&await z(L)},Se=async A=>{let L=A.target.closest?.("form[data-qb-form='filter'] select");if(L){L.form.requestSubmit();return}let N=A.target.closest?.("[data-qb-suite-select]");if(!N)return;let O=Number(N.value||0);!O||O===Number(r.selectedSuiteId)||await oe(O)},xe=A=>{let L=A.target;L?.matches?.(".qb-suite-manage")&&(r.suiteManageOpen=!!L.open)},Je=A=>{let L=A.target.closest?.("[data-qb-action='open-tag-search']");L&&k(L.closest("[data-qb-tag-filter]"))},Re=A=>{let L=A.target.closest?.("[data-qb-tag-filter]");L&&(A.relatedTarget&&L.contains(A.relatedTarget)||F(L))},je=A=>{let L=A.target.closest?.("[data-qb-tag-search]");if(!L)return;let N=L.closest("[data-qb-tag-filter]");l&&window.clearTimeout(l),l=window.setTimeout(()=>{g(N,L.value)},160)},Ne=A=>{let L=A.target.closest?.("[data-qb-tag-search]");if(!L)return;let N=L.closest("[data-qb-tag-filter]");A.key==="Escape"?(A.preventDefault(),F(N),L.blur()):A.key==="Enter"?(A.preventDefault(),N?.querySelector("[data-qb-action='select-tag']")?.click()):A.key==="ArrowDown"&&(A.preventDefault(),N?.querySelector("[data-qb-action='select-tag']")?.focus())};e.addEventListener("click",te),e.addEventListener("submit",me),e.addEventListener("change",Se),e.addEventListener("toggle",xe,!0),e.addEventListener("mouseover",Je),e.addEventListener("mouseout",Re),e.addEventListener("input",je),e.addEventListener("keydown",Ne);let Te=async()=>{await v(),r.tab==="create"?w():r.tab==="manage"?await ie():r.tab==="suite"?await j({refreshAnswers:!0}):r.tab==="review"&&await D()};return v(),{show:x,refresh:Te,destroy(){l&&window.clearTimeout(l),e.removeEventListener("click",te),e.removeEventListener("submit",me),e.removeEventListener("change",Se),e.removeEventListener("toggle",xe,!0),e.removeEventListener("mouseover",Je),e.removeEventListener("mouseout",Re),e.removeEventListener("input",je),e.removeEventListener("keydown",Ne)},getStats:()=>r.stats}}function ws(e){if(e==null||e==="")return"\u2014";let t=Number(e);return Number.isFinite(t)?`${t.toFixed(t>=10?1:2)}%`:"\u2014"}function Hn(e){return e==null?"\u2014":c(e)}function Qo(e){return e.count?e.severity==="danger"?ke("failed","\u9700\u8655\u7406"):e.severity==="warn"?ke("warning","\u6CE8\u610F"):ke("preview","\u63D0\u793A"):ke("success","\u901A\u904E")}function Go(e){return e.count?e.severity==="danger"?"is-danger":e.severity==="warn"?"is-warn":"is-info":"is-ok"}function Vo(e){let t=Number(e.count)||0,s=Math.max(0,Math.min(100,Number(e.percent)||0));return`<div class="quality-check ${Go(e)}">
    <div class="quality-check-head">
      <span class="quality-check-label">${n(e.label)}</span>
      ${Qo(e)}
    </div>
    <div class="quality-check-value">
      <strong>${c(t)}</strong>
      <span>\u7B46</span>
      <em>${n(ws(e.percent))}</em>
    </div>
    <div class="quality-check-desc">${n(e.description)}</div>
    <div class="quality-check-track" aria-hidden="true">
      <span style="width:${s}%"></span>
    </div>
  </div>`}function $s(e,t,s){let a=Array.isArray(s)?s:[];if(!a.length)return`<div class="index-chart-card">
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
  </div>`}function Wo(e){let t=e.coverage||{},s=e.totals||{},a=e.source||{},r=t.postgres_diff,i=r==null?"\u2014":r===0?"\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u4E00\u81F4":`\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u76F8\u5DEE ${c(Math.abs(r))} \u7B46`,o=t.vector_indexed===null||t.vector_indexed===void 0?t.detail||"\u7121\u6CD5\u53D6\u5F97\u7D22\u5F15\u7D71\u8A08":`${c(t.vector_indexed)} / ${c(t.vector_total)} \xB7 ${t.model||"\u2014"}`;return`<div class="metric-grid quality-coverage-grid">
    <div class="metric-card">
      <div class="metric-label">${u("filter",13)}<span>\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D</span></div>
      <div class="metric-value">${c(s.matched_rows)}</div>
      <div class="metric-foot">citation_count &gt; 0\uFF1B\u5171 ${c(s.citation_total)} \u7B46\u5F15\u7528</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${u("database",13)}<span>PostgreSQL \u6536\u9304</span></div>
      <div class="metric-value">${Hn(t.postgres_judgments)}</div>
      <div class="metric-foot">${n(i)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${u("brain",13)}<span>\u5411\u91CF\u7D22\u5F15</span></div>
      <div class="metric-value">${n(ws(t.vector_coverage_pct))}</div>
      <div class="metric-foot">${n(o)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${u("layers",13)}<span>DuckDB \u5019\u9078</span></div>
      <div class="metric-value">${Hn(a.candidate_total)}</div>
      <div class="metric-foot">${c(a.candidate_archive_count)} / ${c(a.archive_count)} \u500B manifest \u6709 candidate_count</div>
    </div>
  </div>`}function Ko(e){return e.length?`<div class="table-wrap">
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
              <td class="cell-number">${n(ws(t.match_rate))}</td>
              <td class="cell-number">${c(t.short_text_rows)}</td>
              <td class="cell-number">${c(s)}</td>
              <td class="cell-number">${c(t.duplicate_content_rows)}</td>
              <td class="cell-date">${n(Ze(t.date_min))} \u2013 ${n(Ze(t.date_max))}</td>
            </tr>`}).join("")}
      </tbody>
    </table>
  </div>`:Fe({iconName:"table",title:"\u6C92\u6709\u539F\u59CB Parquet \u6A94\u6848",text:"\u5B8C\u6210\u5224\u6C7A RAR \u532F\u5165\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6BCF\u500B\u58D3\u7E2E\u6A94\u7684 DuckDB \u7D71\u8A08\u3002"})}function Yo(e){let t=e.totals||{},s=e.source||{},a=Array.isArray(e.checks)?e.checks:[],r=e.summary||{},i=e.distributions||{},o=Array.isArray(e.warnings)?e.warnings:[],l=ue(s.compressed_bytes||0);return`<div class="report-card quality-report" data-database="quality">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">DUCKDB DATA QUALITY</div>
        <div class="report-title">
          \u539F\u59CB Parquet \u8CC7\u6599\u54C1\u8CEA ${ke(e.status||"operational")}
          <span class="chip">raw.parquet</span>
        </div>
        <div class="report-sub">
          ${c(t.rows)} \u7B46 \xB7 ${c(s.raw_files)} \u500B\u6A94\u6848 \xB7
          ${l} \xB7 \u6383\u63CF ${ne(e.scan_ms||0)} \xB7
          ${n(ve(e.generated_at))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-quality">
          ${u("download",14)}<span>JSON</span>
        </button>
      </div>
    </div>
    ${o.length?`<div class="report-alert">${pe({tone:"warn",title:"\u76EE\u524D\u9650\u5236\u8207\u5DEE\u7570",text:o.map(m=>n(m)).join("<br>")})}</div>`:""}
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
        <div class="summary-value">${n(ws(t.match_rate))}</div>
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
      <div class="quality-checks">${a.map(Vo).join("")}</div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6536\u9304\u8986\u84CB</span>
        <span class="muted" style="font-size:9.5px">PostgreSQL \u8207\u5411\u91CF\u7D22\u5F15\u70BA\u5373\u6642\u67E5\u8A62\uFF0C\u4E0D\u662F\u5F9E Parquet \u63A8\u4F30</span>
      </div>
      ${Wo(e)}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6A94\u6848\u660E\u7D30</span>
        <span class="muted" style="font-size:9.5px">${c(s.archive_count)} \u500B\u539F\u59CB Parquet</span>
      </div>
      ${Ko(Array.isArray(e.archives)?e.archives:[])}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u5206\u5E03\u7D71\u8A08</span>
        <span class="muted" style="font-size:9.5px">DuckDB group by / unnest</span>
      </div>
      <div class="quality-dist-grid">
        ${$s("\u6CD5\u9662","\u5224\u6C7A\u7B46\u6578",i.courts)}
        ${$s("\u88C1\u5224\u5E74\u4EFD","\u5224\u6C7A\u7B46\u6578",i.years)}
        ${$s("\u71B1\u9580\u6CD5\u898F","\u63D0\u53CA\u5224\u6C7A\u6578",i.laws)}
        ${$s("\u71B1\u9580\u6848\u7531","\u5224\u6C7A\u7B46\u6578",i.titles)}
      </div>
    </div>
  </div>`}async function Xo(e){e.innerHTML=`<section class="page data-page quality-page">
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
  </section>`;let t=e.querySelector("#quality-content"),s=e.querySelector("#quality-refresh"),a=e.querySelector("#quality-meta"),r=[...e.querySelectorAll("[data-quality-tab]")],i={overview:e.querySelector("#quality-panel-overview"),create:e.querySelector("#quality-panel-question-create"),manage:e.querySelector("#quality-panel-question-manage"),suite:e.querySelector("#quality-panel-benchmark-bank"),review:e.querySelector("#quality-panel-question-review")},o=null,l="overview",m=()=>{if(!o)return;t.innerHTML=Yo(o),a.textContent=`DUCKDB \xB7 ${c(o.totals?.rows)} \u7B46 \xB7 ${ne(o.scan_ms||0)}`;let g=e.querySelector("#quality-badge-overview");g&&(g.textContent=c(o.totals?.rows||0))},b=g=>{l=g==="overview"?"overview":g;for(let k of r){let F=k.dataset.qualityTab===l;k.classList.toggle("is-active",F),F?k.setAttribute("aria-current","page"):k.removeAttribute("aria-current")}for(let[k,F]of Object.entries(i))F&&(F.hidden=k!==l);l!=="overview"?a.textContent="QUESTION BANK \xB7 \u984C\u5EAB\u5DE5\u4F5C\u5340":o&&m()},y=Fn(e,{onNavigate:g=>b(g),onStats:g=>{let k=g||{},F=e.querySelector("#quality-badge-manage"),Y=e.querySelector("#quality-badge-suite"),K=e.querySelector("#quality-badge-review");F&&(F.textContent=c(k.total||0)),Y&&(Y.textContent=c(k.benchmark_ready||0)),K&&(K.textContent=c((k.pending_review||0)+(k.changes_requested||0)))}}),v=g=>{b(g),g!=="overview"&&y.show(g)},w=async()=>{ge(s,!0,"\u6383\u63CF\u4E2D\u2026");try{o=await U.quality(),m()}catch(g){t.innerHTML=`<div class="report-card">
        <div class="report-head">
          <div class="report-title-group">
            <div class="report-kicker">DUCKDB DATA QUALITY</div>
            <div class="report-title">\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557</div>
            <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
          </div>
        </div>
        <div class="report-section">
          ${pe({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u54C1\u8CEA\u7D71\u8A08",text:n(g.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
        </div>
      </div>`,a.textContent="DUCKDB \xB7 \u8B80\u53D6\u5931\u6557",M("\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}finally{ge(s,!1)}},_=async()=>{l==="overview"?await w():await y.refresh()};s.addEventListener("click",_),e.addEventListener("click",g=>{let k=g.target.closest("[data-quality-tab]");k&&v(k.dataset.qualityTab||"overview")}),t.addEventListener("click",g=>{!g.target.closest("[data-action='export-quality']")||!o||tt(`judgment-quality-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(o,null,2),"application/json;charset=utf-8")}),b("overview"),await w()}var va={};ft(va,{render:()=>Ll});var _s={};ft(_s,{render:()=>ba});var zn={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"};function Un(e,t){let s=Array.isArray(t)?t:[];return`<div class="tests-model-group">
    <span class="tests-model-label">${n(e)}</span>
    <div class="tests-model-chips">${s.length?s.map(a=>`<span class="chip chip-mono">${n(a)}</span>`).join(""):'<span class="tests-model-empty">\u672A\u5075\u6E2C\u5230\u6A21\u578B</span>'}</div>
  </div>`}function Zo(e){let t=e?.supports_chat,s=t===!0?"badge-ok":t===!1?"badge-danger":"badge-neutral",a=t===!0?"\u652F\u63F4 chat":t===!1?"\u4E0D\u652F\u63F4 chat":"\u672A\u6E2C\u8A66",r=(Array.isArray(e?.capabilities)?e.capabilities:[]).map(i=>`<span class="chip chip-mono">${n(i)}</span>`).join("");return`<div class="tests-llm-row">
    <div class="tests-llm-model">
      <strong class="mono">${n(e?.model||"\u2014")}</strong>
      <small>${n(e?.detail||"")}</small>
    </div>
    <div class="tests-llm-meta">
      <span class="badge ${s}">${a}</span>
      ${e?.tested_now?'<span class="badge badge-info">\u672C\u6B21\u65B0\u6E2C</span>':""}
      ${r}
      <span class="tests-llm-time">${e?.tested_at?`\u6E2C\u8A66\u65BC ${n(ve(e.tested_at))}`:"\u5C1A\u7121\u6E2C\u8A66\u7D00\u9304"}</span>
    </div>
  </div>`}function el(e){let t=Array.isArray(e?.models)?e.models:[],s=e?.counts||{},a=Array.isArray(e?.failures)?e.failures:[];return{summary:e?`<span>Ollama <strong>${s.available??t.length}</strong> \u500B\u6A21\u578B</span>
      <span>\u652F\u63F4 chat <strong>${s.chat??0}</strong></span>
      <span>\u4E0D\u652F\u63F4 <strong>${s.unsupported??0}</strong></span>
      <span>\u672A\u6E2C\u8A66 <strong>${s.untested??0}</strong></span>
      <span>\u672C\u6B21\u65B0\u6E2C <strong>${(e.tested_now||[]).length}</strong></span>
      <span class="muted">${n(e.detail||"")}</span>`:"<span>\u6B63\u5728\u8B80\u53D6 Ollama \u6A21\u578B\u6E05\u55AE\u2026</span>",list:t.length?t.map(Zo).join(""):'<div class="tests-llm-empty">\u5C1A\u7121\u6A21\u578B\u8CC7\u6599\uFF1B\u8ACB\u78BA\u8A8D Ollama \u5DF2\u555F\u52D5\u4E26\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66\u3002</div>',failures:a.length?`<div class="tests-llm-failures">${a.map(i=>`<span><strong class="mono">${n(i.model||"\u2014")}</strong> ${n(i.detail||"\u6E2C\u8A66\u5931\u6557")}</span>`).join("")}</div>`:""}}function tl(e,t,s){return JSON.stringify({selected:s,runs:(t||[]).map(a=>`${a.run_id}:${a.status}`),run:e?{run_id:e.run_id,status:e.status,progress:e.progress,steps:(e.steps||[]).map(a=>`${a.stage}:${a.model}:${a.status}:${a.progress}`)}:null})}async function ba(e,t,{embedded:s=!1}={}){let a=!1,r=!1,i={embedding:[],llm:[]},o=!1,l=null,m=!1,b=null,y=[],v="",w=null,_="",g=`<div class="page-actions">
      <span class="badge badge-neutral badge-mono" id="tests-mode-badge">\u8B80\u53D6\u4E2D</span>
      <button class="btn btn-secondary" type="button" id="tests-refresh">
        ${u("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
      </button>
    </div>`,k=s?`<div class="tests-embed-head">
        <div>
          <div class="eyebrow">SYSTEM TEST</div>
          <div class="tests-embed-title">\u7CFB\u7D71\u6E2C\u8A66</div>
          <div class="tests-embed-copy">\u5F8C\u7AEF API \u9023\u7DDA\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u591A\u6A21\u578B\u6E2C\u8A66 Flow\u3002\u6E2C\u8A66\u6A21\u5F0F\u958B\u555F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207\u5177\u5099 chat \u80FD\u529B\u7684 LLM \u6A21\u578B\u3002</div>
        </div>
        ${g}
      </div>`:`<div class="page-header">
      <div>
        <div class="eyebrow">SYSTEM TEST</div>
        <h1 class="page-title">\u7CFB\u7D71\u6E2C\u8A66</h1>
        <p class="page-subtitle">\u5408\u4F75\u5F8C\u7AEF API \u9023\u7DDA\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u591A\u6A21\u578B\u6E2C\u8A66 Flow\u3002
          \u6E2C\u8A66\u6A21\u5F0F\u958B\u555F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207\u5177\u5099 chat \u80FD\u529B\u7684 LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002</p>
      </div>
      ${g}
    </div>`;e.innerHTML=`<section class="${s?"tests-page tests-page-embedded":"page tests-page"}">
    ${k}

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
  </section>`;let F=e.querySelector("#tests-mode-badge"),Y=e.querySelector("#tests-mode-toggle"),K=e.querySelector("#tests-mode-summary"),X=e.querySelector("#tests-mode-models"),W=e.querySelector("#tests-mode-status"),ae=e.querySelector("#tests-api-form"),oe=e.querySelector("#tests-api-input"),le=e.querySelector("#tests-api-preview"),$e=e.querySelector("#tests-api-status"),ie=e.querySelector("#tests-api-note"),j=e.querySelector("#tests-api-test"),$=e.querySelector("#tests-api-reset"),B=e.querySelector("#tests-api-save"),D=e.querySelector("#tests-refresh"),x=e.querySelector("#tests-flow"),S=e.querySelector("#tests-llm-summary"),q=e.querySelector("#tests-llm-list"),R=e.querySelector("#tests-llm-failures"),Q=e.querySelector("#tests-llm-status"),z=e.querySelector("#tests-llm-test"),te=(J,ce,qe="")=>{J&&(J.textContent=ce,J.className=`tests-status${qe?` is-${qe}`:""}`)},me=(J,ce="")=>{$e&&($e.textContent=J,$e.className=`api-dialog-status${ce?` is-${ce}`:""}`)},Se=()=>ut()==="query",xe=()=>{let J=ct(oe.value);return J||(window.location.protocol==="file:"?Ps:"")},Je=()=>{let J=xe(),ce=dt(),qe=zn[ut()]||ut()||"\u540C\u6E90";le.innerHTML=`\u76EE\u524D\u751F\u6548\uFF1A<strong>${n(bt(ce))}</strong>${ce?`\uFF08${n(qe)}\uFF09`:""}<br />\u6B64\u4F4D\u5740\u7684\u5065\u5EB7\u6AA2\u67E5\uFF1A${n(Ve("/api/health",J))}`},Re=()=>{let J=ut(),ce=`\u76EE\u524D\u4F86\u6E90\uFF1A${zn[J]||J||"\u540C\u6E90"}\u3002\u512A\u5148\u9806\u5E8F\u70BA ?api= \u2192 \u700F\u89BD\u5668\u5132\u5B58\u503C \u2192 config.js \u2192 \u540C\u6E90\u3002`,qe="";J==="query"?(qe="is-warn",ce="\u6B64\u9801\u7531\u7DB2\u5740\u7684 ?api= \u53C3\u6578\u6307\u5B9A\u5F8C\u7AEF\u4F4D\u5740\uFF0C\u5177\u6709\u6700\u9AD8\u512A\u5148\u9806\u5E8F\u3002\u5132\u5B58\u6216\u6062\u5FA9\u9810\u8A2D\u5728\u6B64\u9801\u4E0D\u6703\u751F\u6548\uFF1B\u8ACB\u5148\u79FB\u9664\u7DB2\u5740\u4E2D\u7684 api \u53C3\u6578\u3002"):ts()?(qe="is-warn",ce="\u6B64\u9801\u4E0D\u662F\u5F9E localhost \u958B\u555F\uFF0C\u4E14\u5C1A\u672A\u8A2D\u5B9A\u5F8C\u7AEF API\u3002\u8ACB\u586B\u5165 cloudflared \u7684 https:// \u4F4D\u5740\uFF0C\u6216\u90E8\u7F72\u6642\u5728 config.js \u6307\u5B9A apiBase\uFF1BHTTP \u4F4D\u5740\u6703\u88AB HTTPS \u9801\u9762\u963B\u64CB\u3002"):(J==="file-default"||window.location.protocol==="file:")&&(ce="\u4EE5 file:// \u76F4\u63A5\u958B\u555F\u6642\uFF0C\u9810\u8A2D\u9023\u5230 http://127.0.0.1:9200\u3002\u82E5\u5F8C\u7AEF\u4F7F\u7528\u5176\u4ED6\u9023\u63A5\u57E0\uFF0C\u8ACB\u5728\u6B64\u4FEE\u6539\u4E26\u5132\u5B58\u3002"),ie.textContent=ce,ie.className=`api-dialog-note${qe?` ${qe}`:""}`;let Le=J==="query";B.disabled=Le,$.disabled=Le,oe.readOnly=Le},je=()=>{if(!Bs(oe.value))return me("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002","error"),oe.focus(),null;let J=xe();return window.location.protocol==="https:"&&/^http:\/\//i.test(J)&&!/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(J)?(me("HTTPS \u9801\u9762\u7121\u6CD5\u9023\u7DDA\u5230 HTTP API\uFF08mixed content\uFF09\u3002\u8ACB\u6539\u7528 cloudflared \u63D0\u4F9B\u7684 https:// \u4F4D\u5740\u3002","error"),oe.focus(),null):J},Ne=()=>{oe.value=dt(),Je(),Re(),me("\u53EF\u5148\u6E2C\u8A66\u9023\u7DDA\uFF0C\u5132\u5B58\u5F8C\u9801\u9762\u6703\u91CD\u65B0\u8F09\u5165\u3002")},Te=()=>{let J=Array.isArray(i.embedding)?i.embedding.length:0,ce=Array.isArray(i.llm)?i.llm.length:0;if(F&&(F.textContent=o?"\u5207\u63DB\u4E2D\u2026":r?"\u6E2C\u8A66\u6A21\u5F0F ON":"\u6E2C\u8A66\u6A21\u5F0F OFF",F.className=`badge badge-mono ${o?"badge-info":r?"badge-warn":"badge-neutral"}`),Y){Y.disabled=o,Y.classList.toggle("is-on",r),Y.classList.toggle("is-off",!r&&!o),Y.classList.toggle("is-busy",o),Y.setAttribute("aria-checked",r?"true":"false"),Y.setAttribute("aria-busy",o?"true":"false"),Y.setAttribute("aria-label",o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F":r?"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF0C\u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\uFF0C\u9EDE\u64CA\u958B\u555F"),Y.title=o?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F\u2026":r?"\u6E2C\u8A66\u6A21\u5F0F ON \xB7 \u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F OFF \xB7 \u9EDE\u64CA\u958B\u555F";let qe=Y.querySelector(".header-power-label");qe&&(qe.textContent=o?"\u2026":r?"ON":"OFF")}K&&(K.textContent=r?`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${J} \u500B embedding \u8207 ${ce} \u500B LLM \u6A21\u578B\u3002`:"\u76EE\u524D\u4F7F\u7528\u5FEB\u901F\u6A21\u5F0F\uFF1A\u55AE\u4E00 embedding \u8207 LLM\u3002"),X&&(X.innerHTML=Un("Embedding",i.embedding)+Un("LLM",i.llm))},A=async()=>{try{let J=await U.testMode();if(a)return;r=!!J.enabled,i=J.models||{embedding:[],llm:[]},te(W,"")}catch(J){if(a)return;r=!1,i={embedding:[],llm:[]},te(W,J.message||"\u7121\u6CD5\u8B80\u53D6\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF API\u3002","error")}a||Te()},L=async()=>{if(o)return;let J=!r;o=!0,Te(),te(W,J?"\u6B63\u5728\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u2026":"\u6B63\u5728\u95DC\u9589\u6E2C\u8A66\u6A21\u5F0F\u2026");try{let ce=await U.setTestMode(J);if(a)return;r=!!ce.enabled,i=ce.models||{embedding:[],llm:[]},window.dispatchEvent(new CustomEvent("judgment:test-mode",{detail:{enabled:r,models:i}}));let qe=i.embedding?.length||0,Le=i.llm?.length||0;te(W,r?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A\u4E0B\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C ${qe} \u500B embedding \u8207 ${Le} \u500B LLM \u6A21\u578B\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","ok"),M(r?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A${qe} \u500B embedding\u3001${Le} \u500B LLM\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002",r?"ok":"info",6e3),await Z()}catch(ce){a||(te(W,ce.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","error"),M(ce.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","danger",6e3))}finally{o=!1,a||Te()}},N=()=>{let J=el(l);if(S&&(S.innerHTML=J.summary),q&&(q.innerHTML=J.list),R&&(R.innerHTML=J.failures),z){z.disabled=m,z.setAttribute("aria-busy",m?"true":"false");let ce=z.querySelector("span");ce&&(ce.textContent=m?"\u6E2C\u8A66\u4E2D\u2026":"\u57F7\u884C LLM \u670D\u52D9\u6E2C\u8A66")}},O=async()=>{try{let J=await U.llmModels();if(a)return;l=J,te(Q,"")}catch(J){if(a)return;l=null,te(Q,J.message||"\u7121\u6CD5\u8B80\u53D6 Ollama \u6A21\u578B\u6E05\u55AE\u3002","error")}a||N()},se=async()=>{if(!m){m=!0,N(),te(Q,"\u6B63\u5728\u6AA2\u67E5 Ollama \u6A21\u578B\u8207 chat \u80FD\u529B\u2026");try{let J=await U.testLlmModels();if(a)return;l=J;let ce=J.tested_now?.length||0,qe=J.chat_models?.length||0,Le=J.failures?.length||0;te(Q,`${ce?`\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u672C\u6B21\u65B0\u6E2C ${ce} \u500B\u6A21\u578B`:"\u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF1A\u6C92\u6709\u65B0\u6A21\u578B"}\uFF0C\u76EE\u524D ${qe} \u500B\u6A21\u578B\u652F\u63F4 chat${Le?`\uFF1B${Le} \u500B\u6A21\u578B\u66AB\u6642\u7121\u6CD5\u5224\u5B9A\uFF0C\u4E0B\u6B21\u6703\u91CD\u8A66`:""}\u3002`,Le?"warn":"ok"),M(ce?`LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u65B0\u589E ${ce} \u7B46\u80FD\u529B\u7D00\u9304\u3002`:"LLM \u670D\u52D9\u6E2C\u8A66\u5B8C\u6210\uFF0C\u6C92\u6709\u65B0\u6A21\u578B\u9700\u8981\u6E2C\u8A66\u3002",Le?"warn":"ok",5e3),await A()}catch(J){a||(te(Q,J.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","error"),M(J.message||"LLM \u670D\u52D9\u6E2C\u8A66\u5931\u6557\u3002","danger",6e3))}finally{m=!1,a||N()}}},H=()=>{if(!x)return;let J=tl(b,y,v);J!==_&&(_=J,x.innerHTML=Et(b,y,v))},fe=async()=>{try{let J=await U.testRuns(30);if(a)return;y=Array.isArray(J.runs)?J.runs:[]}catch{if(a)return;y=[]}},Z=async()=>{try{let J=v?await U.testRun(v):await U.testRunCurrent();if(a)return;b=J.run||null,!v&&b&&b.status!=="running"&&!y.some(ce=>ce.run_id===b.run_id)&&await fe()}catch{if(a)return;b=null}a||H()};oe?.addEventListener("input",()=>{Je(),me("\u5C1A\u672A\u6E2C\u8A66\u6B64\u4F4D\u5740\u3002")}),j?.addEventListener("click",async()=>{let J=je();if(J!==null){ge(j,!0,"\u6E2C\u8A66\u4E2D\u2026"),me(`\u6B63\u5728\u9023\u7DDA\u5230 ${bt(J)||"\u540C\u6E90"}\u2026`);try{let ce=await qa(J);if(a)return;me(`\u9023\u7DDA\u6210\u529F \xB7 v${ce.version} \xB7 ${ce.duration_ms} ms \xB7 GET ${Ve("/api/health",J)}`,"ok")}catch(ce){a||me(ce.message||"\u9023\u7DDA\u6E2C\u8A66\u5931\u6557\u3002","error")}finally{a||ge(j,!1)}}}),ae?.addEventListener("submit",J=>{if(J.preventDefault(),Se())return;let ce=je();ce!==null&&(Hs(ce),M(`\u5F8C\u7AEF API \u5DF2\u8A2D\u70BA ${bt(ce)}\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026`,"ok",1600),window.setTimeout(()=>window.location.reload(),120))}),$?.addEventListener("click",()=>{Se()||(Hs(""),M("\u5DF2\u6E05\u9664\u700F\u89BD\u5668\u5132\u5B58\u7684 API \u4F4D\u5740\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026","info",1600),window.setTimeout(()=>window.location.reload(),120))}),Y?.addEventListener("click",L),z?.addEventListener("click",se),x?.addEventListener("change",async J=>{J.target.id==="test-run-select"&&(v=String(J.target.value||""),await Z())}),x?.addEventListener("click",async J=>{J.target.closest("#test-flow-refresh")&&(v="",await fe(),await Z())}),D?.addEventListener("click",async()=>{ge(D,!0,"\u66F4\u65B0\u4E2D\u2026"),Ne(),await Promise.allSettled([A(),fe(),O()]),a||await Z(),a||(ge(D,!1),M("\u7CFB\u7D71\u6E2C\u8A66\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200))});let Ie=J=>{r=!!J.detail?.enabled,i=J.detail?.models||{embedding:[],llm:[]},Te()};return window.addEventListener("judgment:test-mode",Ie),Ne(),Te(),N(),await Promise.allSettled([A(),fe(),O()]),await Z(),w=window.setInterval(async()=>{a||document.hidden||v||await Z()},2500),!s&&typeof t?.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"),()=>{a=!0,w&&window.clearInterval(w),window.removeEventListener("judgment:test-mode",Ie)}}var Jn={frontend:"browser",backend:"server",database:"database",storage:"layers",vector:"cube",ai:"brain",default:"cpu"};var Vn={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90"},Wn=[{id:"overview",label:"\u670D\u52D9\u7E3D\u89BD",hint:"\u5065\u5EB7\u72C0\u614B\u8207\u8CC7\u6599\u91CF",icon:"activity"},{id:"tests",label:"\u7CFB\u7D71\u6E2C\u8A66",hint:"API\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u6A21\u578B Flow",icon:"terminal"},{id:"resources",label:"\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528",hint:"CPU\u3001RAM\u3001Docker\u3001\u786C\u789F",icon:"cpu"},{id:"local-model",label:"Local Model",hint:"Ollama \u4E3B\u6A5F\u8207\u6A21\u578B",icon:"server"},{id:"architecture",label:"\u524D\u5F8C\u7AEF\u67B6\u69CB",hint:"Client \u2192 Data \u2192 AI",icon:"layers"},{id:"data",label:"\u8CC7\u6599\u7248\u672C",hint:"Parquet \u8207 PostgreSQL",icon:"database"},{id:"api",label:"API \u7AEF\u9EDE",hint:"REST \u8207 OpenAPI",icon:"terminal"},{id:"runs",label:"\u6700\u8FD1\u4E0B\u8F09",hint:"\u6CD5\u898F\uFF0F\u547D\u4EE4\u57F7\u884C\u7D00\u9304",icon:"history"}];function sl(e){return e==="operational"?{label:"\u6838\u5FC3\u670D\u52D9\u6B63\u5E38",tone:"ok",headline:"\u6838\u5FC3\u8CC7\u6599\u7BA1\u7DDA\u904B\u4F5C\u4E2D",copy:"FastAPI\u3001PostgreSQL \u8207 Parquet \u5747\u53EF\u5B58\u53D6\u3002Qdrant\u3001Embedding \u8207 LLM \u6703\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u8A2D\u5B9A\u6216\u964D\u7D1A\u6642\u4E0D\u5F71\u97FF\u8CC7\u6599\u700F\u89BD\u8207\u67E5\u8A62\u5831\u8868\u3002"}:e==="degraded"?{label:"\u90E8\u5206\u670D\u52D9\u964D\u7D1A",tone:"warn",headline:"\u90E8\u5206\u670D\u52D9\u9700\u8981\u8A2D\u5B9A\u6216\u4FEE\u5FA9",copy:"\u6838\u5FC3\u8CC7\u6599\u670D\u52D9\u76EE\u524D\u672A\u5B8C\u5168\u53EF\u7528\u3002\u8ACB\u67E5\u770B\u4E0B\u65B9\u670D\u52D9\u5361\u7247\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u7684\u57F7\u884C\u7D00\u9304\uFF0C\u78BA\u8A8D PostgreSQL\u3001Parquet \u6216\u5916\u90E8\u670D\u52D9\u72C0\u614B\u3002"}:{label:et(e).label,tone:et(e).tone,headline:"\u76EE\u524D\u7121\u6CD5\u78BA\u8A8D\u7CFB\u7D71\u72C0\u614B",copy:"\u72C0\u614B API \u56DE\u50B3\u4E86\u975E\u9810\u671F\u7D50\u679C\u3002\u8ACB\u91CD\u65B0\u6574\u7406\uFF0C\u6216\u76F4\u63A5\u6AA2\u67E5 FastAPI \u670D\u52D9\u65E5\u8A8C\u3002"}}function al(e){let t=et(e.status),s=Jn[e.kind]||Jn.default,a=e.latency_ms===null||e.latency_ms===void 0?"":`<span class="service-latency">${c(e.latency_ms)} ms</span>`;return`<article class="service-card">
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
  </article>`}function nl(e,t){return`<div class="arch-node ${e?"":"is-muted"}" ${e?"":'title="\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165"'}>${n(t)}</div>`}function rl(e,t){if(e==="IndexedDB")return Ta();let a={PostgreSQL:"postgres",Parquet:"parquet",Qdrant:"qdrant",Embedding:"embedding",Retriever:"rag","RAG Engine":"rag",LLM:"llm"}[e];return a?t.find(i=>i.id===a)?.status==="operational":!0}function il(e,t){let s=e?.layers||[];if(!s.length)return'<div class="report-empty-inline">\u72C0\u614B API \u672A\u63D0\u4F9B\u67B6\u69CB\u8CC7\u6599\u3002</div>';let a=s.map(i=>{let o=(i.nodes||[]).map(l=>nl(rl(l,t),l)).join("");return`<div class="arch-layer">
      <div class="arch-layer-label">${n(i.label||i.id)}</div>
      <div class="arch-nodes">${o}</div>
    </div>`}),r=[];return a.forEach((i,o)=>{o&&r.push(`<div class="arch-arrow" aria-hidden="true">${u("arrowRight",15)}</div>`),r.push(i)}),`<div class="arch-flow">${r.join("")}</div>
    <div class="arch-legend">
      <span><i class="legend-key is-live"></i>\u5DF2\u63A5\u5165\u4E14\u72C0\u614B\u6B63\u5E38</span>
      <span><i class="legend-key is-off"></i>\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165</span>
      <span>${u("info",12)} \u7BC0\u9EDE\u72C0\u614B\u4F86\u81EA\u4E3B\u670D\u52D9\u5065\u5EB7\u6AA2\u67E5</span>
    </div>`}function ol(e){return!Array.isArray(e)||!e.length?'<div class="report-empty-inline">\u6C92\u6709\u7AEF\u9EDE\u8CC7\u8A0A\u3002</div>':`<div class="endpoint-list">
    ${e.map(t=>`<div class="endpoint-row">
          <span class="endpoint-method">${n(t.method)}</span>
          <span class="endpoint-path" title="${n(t.path)}">${n(t.path)}</span>
          <span class="endpoint-label">${n(t.label||"")}</span>
        </div>`).join("")}
  </div>`}function Ae(e,t){return`<div class="detail-row">
    <span class="detail-label">${n(e)}</span>
    <span class="detail-value">${t}</span>
  </div>`}function ll(e){return e?`<div class="detail-list">
    ${Ae("\u7248\u672C ID",`<strong>#${c(e.id)}</strong>`)}
    ${Ae("\u8CC7\u6599\u985E\u578B",ke("operational",e.source_type==="law"?"\u6CD5\u898F":"\u547D\u4EE4"))}
    ${Ae("\u4F86\u6E90\u66F4\u65B0\u65E5",`<strong>${n(e.update_date||"\u2014")}</strong>`)}
    ${Ae("\u6CD5\u898F / \u689D\u6587",`<strong>${c(e.law_count)} / ${c(e.article_count)}</strong>`)}
    ${Ae("\u4E0B\u8F09\u6642\u9593",`<span class="mono">${ve(e.downloaded_at)}</span>`)}
    ${Ae("Parquet",`<code title="${n(e.parquet_path||"")}">${n(e.parquet_path||"\u2014")}</code>`)}
  </div>`:'<div class="report-empty-inline">\u5C1A\u672A\u532F\u5165\u4EFB\u4F55\u8CC7\u6599\u7248\u672C\u3002</div>'}function cl(e){if(!Array.isArray(e)||!e.length)return Fe({iconName:"history",title:"\u5C1A\u7121\u4E0B\u8F09\u57F7\u884C\u7D00\u9304",text:"\u57F7\u884C judgment-law-download \u5F8C\uFF0C\u6210\u529F\u3001\u7121\u8B8A\u66F4\u8207\u5931\u6557\u7684\u7D50\u679C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"});let t=[{key:"id",label:"Run",type:"number"},{key:"source_type",label:"\u985E\u578B",type:"source"},{key:"status",label:"\u72C0\u614B",type:"status"},{key:"started_at",label:"\u958B\u59CB\u6642\u9593",type:"datetime"},{key:"duration_ms",label:"\u8017\u6642",type:"duration"},{key:"law_count",label:"\u6CD5\u898F",type:"number"},{key:"article_count",label:"\u689D\u6587",type:"number"},{key:"error_message",label:"\u932F\u8AA4",type:"longtext"}];return`<div class="table-wrap" style="border-top:0;max-height:340px">
    <table class="data-table runs-table">
      <thead><tr>${t.map(s=>`<th scope="col">${n(s.label)}</th>`).join("")}</tr></thead>
      <tbody>
        ${e.map(s=>`<tr>${t.map(a=>`<td>${as(s[a.key],a.type)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </div>`}function dl(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=new Map(s.map(k=>[k.id,k])),r=a.get("qdrant"),i=a.get("embedding"),o=a.get("rag"),l=a.get("llm"),m=Number(t.judgment_indexed_count||0),b=Number(t.judgment_count||0),y=b?(m/b*100).toFixed(1):"0.0",v=t.judgment_vector_points===null||t.judgment_vector_points===void 0?"\u2014":c(t.judgment_vector_points),w=Number(t.judgment_index_remaining||0),_=o?.status==="operational"?"RAG \u5C31\u7DD2":o?.status==="not_configured"?"\u672A\u8A2D\u5B9A":o?.status==="degraded"?"\u964D\u7D1A":"\u672A\u77E5",g=[["cube","Qdrant \u5411\u91CF\u7D22\u5F15",r],["layers",`Embedding\uFF08${t.judgment_vector_model||"\u2014"}\uFF09`,i],["brain","RAG \u56DE\u7B54\u7BA1\u7DDA",o],["sparkles","LLM \u6A21\u578B",l]];return`<section class="card data-section rag-index-card">
    <div class="side-card-head">
      <span class="side-card-title">${u("database",14)}RAG \u8CC7\u6599\u73FE\u6CC1</span>
      ${ke(o?.status,_)}
    </div>
    <div class="side-card-body">
      <div class="mini-stats">
        <div class="mini-stat">
          <div class="mini-stat-value">${c(b)}</div>
          <div class="mini-stat-label">\u5224\u6C7A</div>
        </div>
        <div class="mini-stat">
          <div class="mini-stat-value">${c(m)}</div>
          <div class="mini-stat-label">\u5DF2\u7D22\u5F15</div>
        </div>
        <div class="mini-stat">
          <div class="mini-stat-value">${y}%</div>
          <div class="mini-stat-label">\u7D22\u5F15\u8986\u84CB</div>
        </div>
      </div>
      <div class="side-status-list">
        ${g.map(([k,F,Y])=>`<div class="side-status-row">
              <span>${u(k,13)}${n(F)}</span>
              ${ke(Y?.status,Y?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
            </div>`).join("")}
      </div>
      <div class="side-card-foot" style="padding:0;border:0;margin-top:10px">
        Collection\uFF1A${n(t.judgment_vector_collection||"\u2014")} \xB7
        ${v} points \xB7 \u5269\u9918 ${c(w)} \u7B46\u5F85\u7D22\u5F15
      </div>
    </div>
    <div class="side-card-foot">
      PostgreSQL \u5224\u6C7A\u6587\u4EF6\u3001Qdrant \u5411\u91CF\u7D22\u5F15\u8207 Ollama \u6A21\u578B\u72C0\u614B\u7686\u70BA\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u5C31\u7DD2\u6642\u6703\u660E\u78BA\u964D\u7D1A\u3002
    </div>
  </section>`}function ul(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=sl(e.status),r=s.find(b=>b.id==="qdrant"),i=s.find(b=>b.id==="rag"),o=s.find(b=>b.id==="llm"),l=ut(),m=Vn[l]||l;return`<section class="status-hero">
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
          <span>${u("clock",11)} \u6AA2\u67E5\u6642\u9593 ${ve(e.checked_at)} \xB7 ${n(Lt(e.checked_at))}</span>
          <span>${u("server",11)} ${s.length} \u500B\u670D\u52D9\u5143\u4EF6</span>
          <span>${u("database",11)} ${c(t.total_current)} \u7B46\u73FE\u884C\u8CC7\u6599</span>
          <span>${u("layers",11)} ${c(t.parquet_files)} \u500B\u539F\u59CB Parquet</span>
          <span title="API \u4F4D\u5740\u4F86\u6E90\uFF1A${n(m)}">${u("link",11)} ${n(bt())}</span>
        </div>
      </div>
    </section>

    <div class="service-grid">${s.map(al).join("")}</div>

    ${dl(e)}

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

    ${r?.status==="not_configured"||i?.status==="not_configured"||o?.status==="not_configured"?`<div class="data-section">${pe({tone:"info",title:"\u90E8\u5206 AI \u5143\u4EF6\u5C1A\u672A\u8A2D\u5B9A",text:`Qdrant\uFF1A${n(r?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BRAG\uFF1A${n(i?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BLLM\uFF1A${n(o?.detail||"\u672A\u8A2D\u5B9A")}\u3002\u9019\u4E9B\u72C0\u614B\u4E0D\u6703\u88AB\u507D\u88DD\u6210\u53EF\u7528\u3002`})}</div>`:""}`}function pl(e){let t=Array.isArray(e.services)?e.services:[],s=e.architecture||{};return`<div class="data-section card architecture-card">
    <div class="section-head">
      <div>
        <div class="section-title">\u524D\u5F8C\u7AEF\u67B6\u69CB</div>
        <div class="section-sub">Client \u2192 Application \u2192 Data \u2192 Intelligence</div>
      </div>
      <span class="badge badge-neutral badge-mono">${c((s.flow||[]).length)} layers</span>
    </div>
    ${il(s,t)}
  </div>`}function ml(e){let t=ut(),s=Vn[t]||t,a=Ve("/api/docs"),r=Ve("/api/openapi.json");return`<div class="status-columns is-single">
    <section class="card">
      <div class="side-card-head">
        <span class="side-card-title">${u("terminal",14)}API \u7AEF\u9EDE</span>
        <a href="${n(a)}" target="_blank" rel="noopener noreferrer" class="chip"
          >OpenAPI ${u("external",11)}</a>
      </div>
      ${ol(e.endpoints)}
      <div class="side-card-foot">
        \u76EE\u524D API Base\uFF1A<code>${n(bt())}</code>\uFF08${n(s)}\uFF09\u3002\u4E92\u52D5\u5F0F API \u6587\u4EF6\u4F4D\u65BC <a href="${n(a)}" target="_blank" rel="noopener noreferrer"><code>${n(a)}</code></a>\uFF0COpenAPI schema \u4F4D\u65BC <a href="${n(r)}" target="_blank" rel="noopener noreferrer"><code>${n(r)}</code></a>\u3002
      </div>
    </section>
  </div>`}function gl(e){let t=e.data||{},s=Number(t.judgment_indexed_count||0),a=Number(t.judgment_count||0),r=a?(s/a*100).toFixed(1):"0.0",i=Number(t.judgment_index_remaining||0);return`<div class="status-summary">
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
          ${ke("operational","Parquet")}
        </div>
        ${ll(t.last_version)}
        <div class="side-card-foot">
          \u539F\u59CB Parquet \u5408\u8A08 ${ue(t.parquet_bytes)}\uFF1BPostgreSQL \u4FDD\u5B58 metadata \u8207\u7248\u672C\u72C0\u614B\u3002
        </div>
      </section>
      <section class="card">
        <div class="side-card-head">
          <span class="side-card-title">${u("database",14)}\u8CC7\u6599\u96C6\u7D71\u8A08</span>
          <span class="badge badge-neutral badge-mono">${c(t.parquet_files)} FILES</span>
        </div>
        <div class="detail-list">
          ${Ae("\u73FE\u884C\u6CD5\u898F",`<strong>${c(t.law_count)}</strong>`)}
          ${Ae("\u73FE\u884C\u547D\u4EE4",`<strong>${c(t.order_count)}</strong>`)}
          ${Ae("\u689D\u6587\u7E3D\u6578",`<strong>${c(t.article_count)}</strong>`)}
          ${Ae("\u539F\u59CB Parquet",`<strong>${ue(t.parquet_bytes)}</strong>`)}
          ${Ae("\u5224\u6C7A\u6587\u4EF6",`<strong>${c(t.judgment_count)}</strong>`)}
          ${Ae("\u5411\u91CF\u7D22\u5F15",`<strong>${c(t.judgment_indexed_count)}</strong> / ${c(t.judgment_count)}\uFF08${c(t.judgment_vector_points)} points\uFF09`)}
          ${Ae("\u7D22\u5F15\u8986\u84CB",`<strong>${r}%</strong> \xB7 \u5269\u9918 ${c(i)} \u7B46`)}
          ${Ae("\u7D22\u5F15\u7248\u672C",`<strong>#${c(t.judgment_vector_version_id)}</strong> \xB7 ${n(t.judgment_vector_version_status||"legacy")}`)}
          ${Ae("Alias",`<code>${n(t.judgment_vector_alias||"\u2014")}</code> \u2192 <code>${n(t.judgment_vector_collection||"\u2014")}</code>`)}
          ${Ae("\u7D22\u5F15\u6A21\u578B",`<code>${n(t.judgment_vector_model||"\u2014")}</code>`)}
          ${Ae("\u6700\u8FD1\u7D22\u5F15",`<span class="mono">${ve(t.judgment_indexed_at)}</span>`)}
        </div>
      </section>
    </div>`}function fl(e){let t=e.data||{};return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${u("history",14)}\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C</span>
      <span class="badge badge-neutral badge-mono">${c(t.run_count)} TOTAL</span>
    </div>
    ${cl(e.recent_runs)}
  </section>`}function bl(e){let t=Number(e);return Number.isFinite(t)?t>=90?"is-danger":t>=70?"is-warn":"":""}function Kn(e,t=""){let s=Math.max(0,Math.min(100,Number(e)||0));return`<div class="resource-bar ${t}"><span style="width:${s}%"></span></div>`}function St(e,t,s,a,r){let i=bl(r);return`<article class="resource-card">
    <div class="resource-card-head">
      <span class="resource-card-label">${u(t,14)}${n(e)}</span>
      <strong>${n(s)}</strong>
    </div>
    ${Kn(r,i)}
    <div class="resource-card-detail">${a}</div>
  </article>`}function vl(e){let t=e.docker||{};if(!t.available)return`<section class="card data-section">
      <div class="side-card-head">
        <span class="side-card-title">${u("layers",14)}Docker</span>
        ${ke("not_configured","\u672A\u9023\u7DDA")}
      </div>
      <div class="report-empty-inline">${n(t.detail||"Docker daemon \u672A\u9023\u7DDA\u3002")}</div>
    </section>`;let s=[...t.containers||[]].sort((i,o)=>{let l=i.service?0:1,m=o.service?0:1;return l-m||String(i.name).localeCompare(String(o.name))}),a=s.map(i=>`<tr>
        <td><strong>${n(i.name||"\u2014")}</strong>${i.service?`<span class="badge badge-neutral badge-mono">${n(i.service)}</span>`:""}</td>
        <td>${ke(i.state==="running"?"operational":"degraded",i.state||"\u2014")}</td>
        <td class="cell-number">${i.cpu_percent===null||i.cpu_percent===void 0?"\u2014":`${c(i.cpu_percent)}%`}</td>
        <td class="cell-number">${ue(i.memory_used)}${i.memory_limit?` / ${ue(i.memory_limit)}`:""}</td>
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
  </section>`}function hl(e){return`<div class="resource-section-head">
      <div>
        <div class="section-title">\u5404\u8CC7\u6599\u5EAB\u4F7F\u7528\u8CC7\u6E90</div>
        <div class="section-sub">\u5BB9\u5668 CPU\uFF0FRAM \u8207\u8CC7\u6599\u5EAB\u5167\u90E8\u5BB9\u91CF</div>
      </div>
    </div>
    <div class="resource-db-grid">${(Array.isArray(e.databases)?e.databases:[]).map(s=>{let a=s.id==="postgres",r=Array.isArray(s.tables)?s.tables:[],i=s.status==="operational"?"operational":s.status==="not_configured"?"not_configured":"degraded",o=a?`${Ae("\u8CC7\u6599\u5EAB",`<code>${n(s.database||"\u2014")}</code>`)}
           ${Ae("\u8CC7\u6599\u5EAB\u5927\u5C0F",`<strong>${ue(s.storage_bytes)}</strong>`)}
           ${Ae("Docker volume",`<strong>${ue(s.volume_bytes)}</strong>${s.volume_name?` <code>${n(s.volume_name)}</code>`:""}`)}
           ${Ae("\u9023\u7DDA\u6578",`<strong>${c(s.connections)}</strong>`)}`:`${Ae("Collection",`<code>${n(s.collection||"\u2014")}</code>`)}
           ${Ae("Docker volume",`<strong>${ue(s.volume_bytes)}</strong>${s.volume_name?` <code>${n(s.volume_name)}</code>`:""}`)}
           ${Ae("\u5411\u91CF\u9EDE\u6578",`<strong>${c(s.points_count)}</strong>`)}
           ${Ae("Collections",`<strong>${c(s.collections)}</strong>`)}
           ${Ae("Segments",`<strong>${c(s.segments_count)}</strong>`)}`;return`<article class="resource-db-card">
        <div class="resource-db-head">
          <div>
            <div class="resource-db-title">${n(s.name||"\u2014")}</div>
            <div class="resource-db-kind">${n(s.kind||"")}</div>
          </div>
          ${ke(i)}
        </div>
        <div class="resource-db-metrics">
          <div><span>CPU</span><strong>${s.cpu_percent===null||s.cpu_percent===void 0?"\u2014":`${c(s.cpu_percent)}%`}</strong></div>
          <div><span>RAM</span><strong>${ue(s.memory_used)}</strong><small>${s.memory_limit?` / ${ue(s.memory_limit)}`:""}</small></div>
          <div><span>\u5BB9\u5668</span><strong class="mono">${n(s.container||"\u2014")}</strong><small>${n(s.container_status||"\u2014")}</small></div>
        </div>
        <div class="detail-list">${o}</div>
        ${r.length?`<div class="resource-table-wrap">
                <table class="data-table is-compact">
                  <thead><tr><th scope="col">\u8CC7\u6599\u8868</th><th scope="col">\u5927\u5C0F</th></tr></thead>
                  <tbody>${r.map(l=>`<tr>
                        <td class="mono">${n(l.name||"\u2014")}</td>
                        <td class="cell-number">${ue(l.bytes)}</td>
                      </tr>`).join("")}</tbody>
                </table>
              </div>`:""}
        <div class="side-card-foot">${n(s.detail||"")}</div>
      </article>`}).join("")}</div>`}function Rt(e,t,s,a){let r=Number(t)||0,i=a?r/a*100:0;return`<div class="storage-row">
    <div class="storage-row-head">
      <span>${n(e)}</span>
      <strong>${ue(r)}</strong>
    </div>
    ${Kn(i)}
    <div class="storage-row-detail">${s}</div>
  </div>`}function yl(e){let t=e.storage||{},s=t.application||{},a=t.parquet||{},r=t.docker||{},i=t.volumes||{},o=i.postgres||{},l=i.qdrant||{},m=Number(t.judgment_total_bytes||0);return`<section class="card data-section storage-section">
    <div class="side-card-head">
      <span class="side-card-title">${u("database",14)}\u786C\u789F\u4F7F\u7528\u7D44\u6210</span>
      <span class="badge badge-neutral badge-mono">${ue(m)}</span>
    </div>
    <div class="storage-list">
      ${Rt("\u524D\u7AEF",s.frontend_bytes,`<span class="mono">${n(s.frontend_path||"\u2014")}</span>`,m)}
      ${Rt("\u5F8C\u7AEF",s.backend_bytes,`<span class="mono">${n(s.backend_path||"\u2014")}</span>`,m)}
      ${Rt("Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5FEB\u53D6",r.layers_bytes,`Images ${ue(r.images_bytes)} \xB7 Containers ${ue(r.containers_bytes)} \xB7 Build cache ${ue(r.build_cache_bytes)}`,m)}
      ${Rt("PostgreSQL volume",o.size_bytes,`<span class="mono">${n(o.name||"\u2014")}</span>`,m)}
      ${Rt("Qdrant volume",l.size_bytes,`<span class="mono">${n(l.name||"\u2014")}</span>`,m)}
      ${Rt("Parquet",a.total_bytes,`\u6CD5\u898F ${ue(a.law_bytes)} \xB7 \u5224\u6C7A ${ue(a.judgment_bytes)}`,m)}
    </div>
    <div class="storage-total">
      <span>Judgment \u5143\u4EF6\u5408\u8A08</span>
      <strong>${ue(m)}</strong>
    </div>
    <div class="side-card-foot">
      \u524D\u7AEF\uFF0B\u5F8C\u7AEF\u7A0B\u5F0F\u3001Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5EFA\u7F6E\u5FEB\u53D6\u3001PostgreSQL\uFF0FQdrant volume \u8207\u539F\u59CB Parquet\uFF1B\u4E0D\u542B .venv \u8207\u5176\u4ED6\u975E Judgment Docker volume\u3002
    </div>
  </section>`}function $l(e){let t=e.host||{},s=t.cpu||{},a=t.memory||{},r=t.swap||{},i=e.storage||{},o=i.filesystem||{},l=Number(i.judgment_total_bytes||0),m=Array.isArray(e.disk)?e.disk:[],b=m[0]||{},y=Number(o.total_bytes||b.total||0),v=y?l/y*100:0,w=[s.load_1,s.load_5,s.load_15].map(k=>k??"\u2014").join(" / "),_=t.uptime_seconds===null||t.uptime_seconds===void 0?"\u2014":ne(Number(t.uptime_seconds)*1e3),g=[b.label?St("HDD \u5DF2\u4F7F\u7528","database",`${c(b.percent)}%`,`${ue(b.used)} / ${ue(b.total)} \xB7 \u5269\u9918 ${ue(b.free)}<br><span class="mono">${n(b.path||"")}</span>`,b.percent):"",l?St("Judgment \u5143\u4EF6\u5408\u8A08","layers",ue(l),`\u7D04\u5360 HDD ${c(v)}% \xB7 \u524D\u7AEF\uFF0F\u5F8C\u7AEF\uFF0FDocker\uFF0FDB volume\uFF0FParquet`,v):"",...m.slice(1).map(k=>St(`\u786C\u789F \xB7 ${k.label}`,"layers",`${c(k.percent)}%`,`${ue(k.used)} / ${ue(k.total)} \xB7 \u5269\u9918 ${ue(k.free)}<br><span class="mono">${n(k.path||"")}</span>`,k.percent))].filter(Boolean).join("");return`<div class="resource-section-head">
      <div>
        <div class="eyebrow">SYSTEM RESOURCE USAGE</div>
        <div class="section-sub">\u66F4\u65B0\u6642\u9593 ${ve(e.checked_at)} \xB7 ${e.status==="operational"?"\u8CC7\u6E90\u8B80\u53D6\u6B63\u5E38":"\u90E8\u5206\u8CC7\u6E90\u964D\u7D1A"}</div>
      </div>
    </div>
    <div class="resource-grid">
      ${St("CPU \u4F7F\u7528\u7387","cpu",`${c(s.percent)}%`,`${c(s.logical_cores)} \u908F\u8F2F\u6838\u5FC3 \xB7 ${c(s.physical_cores)} \u5BE6\u9AD4\u6838\u5FC3<br>Load ${n(w)}`,s.percent)}
      ${St("\u8A18\u61B6\u9AD4","server",`${c(a.percent)}%`,`${ue(a.used)} / ${ue(a.total)} \xB7 \u53EF\u7528 ${ue(a.available)}`,a.percent)}
      ${St("Swap","layers",`${c(r.percent)}%`,`${ue(r.used)} / ${ue(r.total)}`,r.percent)}
      ${St("\u7A0B\u5E8F\u8207\u958B\u6A5F","activity",`${c(t.processes)} \u500B\u7A0B\u5E8F`,`\u958B\u6A5F ${n(_)}<br>${n(t.platform||"")}`,null)}
    </div>
    <div class="resource-grid resource-disk-grid">${g||'<div class="report-empty-inline">\u627E\u4E0D\u5230\u53EF\u8B80\u53D6\u7684\u78C1\u789F\u3002</div>'}</div>
    ${yl(e)}
    ${vl(e)}
    ${hl(e)}`}function Qn(){return`<div class="resource-section-head">
      <div>
        <div class="skeleton skeleton-line" style="width:160px;height:18px"></div>
        <div class="skeleton skeleton-line" style="width:260px;margin-top:8px"></div>
      </div>
    </div>
    <div class="resource-grid">
      ${Array.from({length:4}).map(()=>'<div class="skeleton" style="height:120px;border-radius:var(--radius-md)"></div>').join("")}
    </div>
    <div class="skeleton" style="height:180px;margin-top:16px;border-radius:var(--radius-md)"></div>
    <div class="skeleton" style="height:220px;margin-top:16px;border-radius:var(--radius-md)"></div>`}function wl(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SYSTEM RESOURCE USAGE</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${pe({tone:"danger",title:"\u8CC7\u6E90 API \u8ACB\u6C42\u5931\u6557",text:n(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-resources-retry">
          ${u("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function _l(e){return e.status==="operational"?{label:"\u5DF2\u9023\u7DDA",badge:"badge-ok"}:{label:"\u7121\u6CD5\u9023\u7DDA",badge:"badge-danger"}}function kl(e,t){let s=_l(e),a=Array.isArray(e.models)?e.models:[],r=a.length?a.map(i=>{let o=String(i.name||""),l=e.chat_model===o,m=e.embedding_model===o,b=i.size?ue(i.size):"",y=i.modified_at?ve(i.modified_at):"";return`<div class="ollama-model-row">
            <div class="ollama-model-main">
              <strong>${n(o)}</strong>
              <span class="ollama-model-meta">${[b,y].filter(Boolean).map(v=>n(v)).join(" \xB7 ")||"\u2014"}</span>
            </div>
            <div class="ollama-model-roles">
              ${l?'<span class="badge badge-ok">\u804A\u5929</span>':""}
              ${m?'<span class="badge badge-ok">\u5D4C\u5165</span>':""}
            </div>
            <div class="ollama-model-actions">
              <button class="btn btn-ghost btn-sm" type="button" data-ollama-action="${l?"clear-model":"select-model"}" data-id="${e.id}" data-model="${n(o)}" data-role="chat">
                ${l?"\u65B7\u958B\u804A\u5929":"\u9023\u63A5\u804A\u5929"}
              </button>
              <button class="btn btn-ghost btn-sm" type="button" data-ollama-action="${m?"clear-model":"select-model"}" data-id="${e.id}" data-model="${n(o)}" data-role="embedding">
                ${m?"\u65B7\u958B\u5D4C\u5165":"\u9023\u63A5\u5D4C\u5165"}
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
  </article>`}function Sl(e,t,s,a){if(s)return`<div class="report-card">
      ${pe({tone:"danger",title:"Local Model \u8B80\u53D6\u5931\u6557",text:n(s.message||"\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u670D\u52D9\u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="refresh-hosts">${u("refresh",14)}<span>\u91CD\u8A66</span></button>
      </div>
    </div>`;let r=e||{hosts:[],active_host_id:null},i=Array.isArray(r.hosts)?r.hosts:[],o=a?i.find(b=>Number(b.id)===Number(a)):null,l=o?o.base_url.replace(new RegExp(`:${o.port}$`),""):"http://127.0.0.1",m=o?"\u5132\u5B58\u8B8A\u66F4":"\u65B0\u589E\u4E3B\u6A5F";return`<div class="report-card ollama-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">LOCAL MODEL</div>
        <div class="report-title">Ollama \u4E3B\u6A5F\u8207\u6A21\u578B</div>
        <div class="report-sub">\u7BA1\u7406\u53EF\u7528\u7684 Ollama \u9023\u7DDA\u3001\u76EE\u524D\u4F7F\u7528\u7684\u4E3B\u6A5F\uFF0C\u4EE5\u53CA\u4E3B\u6A5F\u4E0A\u7684\u804A\u5929\uFF0F\u5D4C\u5165\u6A21\u578B\u3002\u6BCF\u6B21\u958B\u555F\u6B64\u9801\u90FD\u6703\u91CD\u65B0\u53D6\u5F97\u4E3B\u6A5F\u8207\u6A21\u578B\u5217\u8868\u3002</div>
      </div>
      <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="refresh-hosts">${u("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span></button>
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
          <button class="btn btn-primary btn-sm" type="submit">${u("check",13)}<span>${m}</span></button>
          ${o?'<button class="btn btn-ghost btn-sm" type="button" data-ollama-action="cancel-host-edit">\u53D6\u6D88\u7DE8\u8F2F</button>':""}
        </div>
      </form>
      ${t?'<div class="ollama-loading"><span class="spinner"></span><span>\u8B80\u53D6 Ollama \u4E3B\u6A5F\u8207\u6A21\u578B\u2026</span></div>':i.length?`<div class="ollama-host-list">${i.map(b=>kl(b,a)).join("")}</div>`:Fe({iconName:"server",title:"\u5C1A\u672A\u8A2D\u5B9A Ollama \u4E3B\u6A5F",text:"\u8ACB\u5728\u4E0A\u65B9\u8F38\u5165\u7DB2\u5740\u8207 Port \u65B0\u589E\uFF0C\u6216\u4F7F\u7528 .env \u7684\u9810\u8A2D\u9023\u7DDA\u3002"})}
      <p class="report-sub" style="margin-top:12px">\u8A2D\u70BA\u804A\u5929\u6216\u5D4C\u5165\u6A21\u578B\u5F8C\uFF0C\u7CFB\u7D71\u6703\u4F7F\u7528\u76EE\u524D\u4E3B\u6A5F\u7684\u5C0D\u61C9\u6A21\u578B\u57F7\u884C AI \u51FA\u984C\u8207 RAG\uFF1B\u672A\u8A2D\u5B9A\u6642\u6CBF\u7528 .env \u7684 LLM_MODEL\uFF0FEMBEDDING_MODEL\u3002</p>
    </div>
  </div>`}function ql(e,t,s){let a=e?.data||{},r=e?et(e.status):null,i=s?et(s.status):null,o={overview:r?`<span class="badge ${r.tone==="ok"?"badge-ok":r.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${n(r.label)}</span>`:"",resources:i?`<span class="badge ${i.tone==="ok"?"badge-ok":i.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${n(i.label)}</span>`:'<span class="badge badge-neutral badge-mono">\u672A\u8B80\u53D6</span>',data:`<span class="badge badge-neutral badge-mono">${c(a.version_count)}</span>`,tests:'<span class="badge badge-neutral badge-mono">TEST</span>',"local-model":'<span class="badge badge-neutral badge-mono">OLLAMA</span>',runs:`<span class="badge badge-neutral badge-mono">${c(a.run_count)}</span>`};return`<div class="status-sidebar-head">
      <div class="eyebrow">STATUS SECTIONS</div>
      <div class="status-sidebar-title">\u7CFB\u7D71\u5206\u985E</div>
    </div>
    <nav class="status-tab-list" aria-label="\u7CFB\u7D71\u72C0\u614B\u5206\u985E">
      ${Wn.map(l=>{let m=l.id===t;return`<button class="status-tab${m?" is-active":""}" type="button"
          data-status-tab="${l.id}" ${m?'aria-current="page"':""}>
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
      <span class="mono">${n(e?ve(e.checked_at):"\u2014")}</span>
    </div>`}function xl(e,t,s,a,r,i){if(e==="resources")return s?$l(s):a?Qn():r?wl(r):Qn();if(e==="local-model"){let o=i||{},l=!!o.loading||!o.hosts&&!o.error;return Sl(o.hosts||null,l,o.error||null,o.editingId||null)}return e==="architecture"?pl(t):e==="api"?ml(t):e==="data"?gl(t):e==="runs"?fl(t):ul(t)}function Al(){return`<div class="status-hero">
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
    </div>`}function Gn(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">STATUS CHECK</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u5FEB\u53D6\u6216\u63A8\u6E2C\u7684\u670D\u52D9\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${pe({tone:"danger",title:"\u72C0\u614B API \u8ACB\u6C42\u5931\u6557",text:n(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-retry">
          ${u("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}async function Ll(e,t){let s=!1,a=null,r=null,i="overview",o=null,l=!1,m=null,b=null,y=!1,v=null,w=null,_=!1,g=!1,k=null,F=0;e.innerHTML=`<section class="page status-page">
    <div class="page-header">
      <div>
        <div class="eyebrow">OBSERVABILITY</div>
        <h1 class="page-title">\u7CFB\u7D71\u67B6\u69CB\u8207\u670D\u52D9\u72C0\u614B</h1>
        <p class="page-subtitle">\u6AA2\u8996\u524D\u7AEF\u3001FastAPI\u3001PostgreSQL\u3001Parquet \u8207 AI \u5143\u4EF6\u7684\u5373\u6642\u5065\u5EB7\u72C0\u614B\uFF0C
          \u4E26\u5F9E\u5DE6\u5074\u5206\u985E\u5207\u63DB\u670D\u52D9\u7E3D\u89BD\u3001\u7CFB\u7D71\u6E2C\u8A66\u3001Local Model\u3001\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528\u3001\u67B6\u69CB\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u4E0B\u8F09\u7D00\u9304\u3002</p>
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
      <section class="status-panel" id="status-content">${Al()}</section>
    </div>
  </section>`;let Y=e.querySelector("#status-nav"),K=e.querySelector("#status-content"),X=e.querySelector("#refresh-status"),W=e.querySelector("#auto-refresh"),ae=()=>{if(F+=1,typeof k=="function")try{k()}catch{}k=null,_=!1,g=!1},oe=async()=>{let D=++F;g=!0,K.innerHTML="";try{let x=await ba(K,{setTitle:()=>{}},{embedded:!0});if(D!==F||i!=="tests"){typeof x=="function"&&x();return}k=typeof x=="function"?x:null,_=!0}catch(x){D===F&&i==="tests"&&(K.innerHTML=Gn(x))}finally{D===F&&(g=!1)}},le=()=>{if(r){if(Y.innerHTML=ql(r,i,o),i==="tests"){!_&&!g&&oe();return}ae(),K.innerHTML=xl(i,r,o,l,m,{hosts:b,loading:y,error:v,editingId:w})}},$e=async({quiet:D=!1}={})=>{if(!l){l=!0,m=null,i==="resources"&&le();try{let x=await U.systemUsage();if(s)return;o=x}catch(x){if(s)return;m=x,D||M(x.message||"\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90\u3002","danger")}finally{s||(l=!1,i==="resources"&&le())}}},ie=async({quiet:D=!1}={})=>{if(!y){y=!0,v=null,i==="local-model"&&le();try{let x=await U.ollamaHosts();if(s)return;b=x}catch(x){if(s)return;v=x,D||M(x.message||"\u7121\u6CD5\u53D6\u5F97 Ollama \u4E3B\u6A5F\u3002","danger")}finally{s||(y=!1,i==="local-model"&&le())}}},j=async()=>{await ie({quiet:!0}),await $({quiet:!0})},$=async({quiet:D=!1}={})=>{D||(X.disabled=!0,ge(X,!0,"\u6AA2\u67E5\u4E2D\u2026"));try{let x=await U.status();if(s)return;r=x,le(),D||M("\u670D\u52D9\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(x){if(s)return;i!=="tests"&&(K.innerHTML=Gn(x)),D||M(x.message||"\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002","danger")}finally{s||(X.disabled=!1,ge(X,!1))}},B=async({quiet:D=!1}={})=>{if(await $({quiet:D}),i==="resources"&&await $e({quiet:D}),i==="local-model"&&await ie({quiet:D}),!D&&i==="tests"){let x=K.querySelector("#tests-refresh");x&&x.click()}};return Y.addEventListener("click",D=>{let x=D.target.closest("[data-status-tab]");if(!x)return;let S=x.dataset.statusTab;Wn.some(q=>q.id===S)&&(i=S,le(),i==="resources"&&!o&&!l&&$e(),i==="local-model"&&ie())}),K.addEventListener("click",D=>{D.target.closest("#status-retry")&&$(),D.target.closest("#status-resources-retry")&&$e()}),K.addEventListener("click",async D=>{let x=D.target.closest("[data-ollama-action]");if(!x)return;let S=x.dataset.ollamaAction,q=Number(x.dataset.id||0);if(S==="refresh-hosts"){await ie();return}if(S==="edit-host"){w=q,le(),e.querySelector(".ollama-host-form")?.scrollIntoView({behavior:"smooth",block:"center"});return}if(S==="cancel-host-edit"){w=null,le();return}if(S==="delete-host"){if(!window.confirm(`\u78BA\u5B9A\u522A\u9664 Ollama \u4E3B\u6A5F #${q}\uFF1F`))return;try{await U.deleteOllamaHost(q),Number(w)===q&&(w=null),M("Ollama \u4E3B\u6A5F\u5DF2\u522A\u9664\u3002","info"),await j()}catch(R){M(R.message||"\u522A\u9664\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(S==="activate-host"){try{await U.activateOllamaHost(q),M("\u5DF2\u5207\u63DB\u4F7F\u7528\u7684 Ollama \u4E3B\u6A5F\u3002","ok"),await j()}catch(R){M(R.message||"\u5207\u63DB\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(S==="deactivate-host"){try{await U.deactivateOllamaHosts(),M("\u5DF2\u505C\u7528\u6307\u5B9A\u7684 Ollama \u4E3B\u6A5F\uFF0C\u5C07\u6CBF\u7528 .env \u8A2D\u5B9A\u3002","info"),await j()}catch(R){M(R.message||"\u505C\u7528\u4E3B\u6A5F\u5931\u6557\u3002","danger")}return}if(S==="select-model"||S==="clear-model"){let R=String(x.dataset.model||""),Q=String(x.dataset.role||"");try{S==="select-model"?(await U.selectOllamaModel(q,{model:R,role:Q}),M(`\u5DF2\u8A2D\u5B9A ${Q==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\uFF1A${R}`,"ok")):(await U.clearOllamaModel(q,{model:R,role:Q}),M(`\u5DF2\u53D6\u6D88 ${Q==="chat"?"\u804A\u5929":"\u5D4C\u5165"}\u6A21\u578B\u3002`,"info")),await j()}catch(z){M(z.message||"\u6A21\u578B\u8A2D\u5B9A\u5931\u6557\u3002","danger")}}}),K.addEventListener("submit",async D=>{let x=D.target.closest("form[data-ollama-form='host']");if(!x)return;D.preventDefault();let S=new FormData(x),q=Number(S.get("host_id")||0),R={name:String(S.get("name")||"").trim(),url:String(S.get("url")||"").trim(),port:Number(S.get("port")||11434)};try{q?(await U.updateOllamaHost(q,R),M("Ollama \u4E3B\u6A5F\u5DF2\u66F4\u65B0\u3002","ok")):(await U.addOllamaHost(R),M("Ollama \u4E3B\u6A5F\u5DF2\u65B0\u589E\u3002","ok")),w=null,await j()}catch(Q){let z=Q.detail||Q.payload?.detail,te=z?.errors?.join(" \xB7 ")||z?.message||Q.message||"\u5132\u5B58\u4E3B\u6A5F\u5931\u6557\u3002";M(te,"danger",8e3)}}),X.addEventListener("click",()=>B()),W.addEventListener("change",()=>{a&&(window.clearInterval(a),a=null),W.checked&&(a=window.setInterval(()=>B({quiet:!0}),3e4),M("\u5DF2\u555F\u7528\u6BCF 30 \u79D2\u81EA\u52D5\u66F4\u65B0\u3002","info",2200))}),await $({quiet:!0}),t&&typeof t.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"),()=>{s=!0,ae(),a&&window.clearInterval(a)}}var Yn="rag",xs={rag:{page:la,title:"RAG \u63D0\u554F \xB7 Judgment RAG Console"},data:{page:aa,title:"\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"},quality:{page:fa,title:"\u8CC7\u6599\u54C1\u8CEA \xB7 Judgment RAG Console"},performance:{page:ra,title:"\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"},processing:{page:da,title:"\u8CC7\u6599\u8655\u7406 \xB7 Judgment RAG Console"},status:{page:va,title:"\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"},tests:{page:_s,title:"\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"}},ks=document.getElementById("app-main"),Ss=null,qs=0;function Ml(){return`<div class="page-loading" aria-live="polite">
    <div class="skeleton skeleton-title"></div>
    <div class="skeleton skeleton-subtitle"></div>
    <div class="skeleton-grid">
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
    </div>
  </div>`}function ya(){let t=window.location.hash.replace(/^#\/?/,"").trim().split("/")[0]||Yn;return Object.prototype.hasOwnProperty.call(xs,t)?t:Yn}function jl(e){document.querySelectorAll("[data-route]").forEach(t=>{let s=t.dataset.route===e;t.classList.toggle("is-active",s),s?t.setAttribute("aria-current","page"):t.removeAttribute("aria-current")})}function Tl(e){return`<section class="page">
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
  </section>`}async function ha(){let e=ya(),t=++qs;if(jl(e),window.location.hash!==`#/${e}`&&window.history.replaceState(null,"",`#/${e}`),typeof Ss=="function"){try{Ss()}catch{}Ss=null}document.title=xs[e].title,ks.innerHTML=Ml(),ks.focus({preventScroll:!0}),window.scrollTo({top:0,behavior:"auto"});let s={route:e,navigate(a){xs[a]&&(window.location.hash=`#/${a}`)},setTitle(a){t===qs&&a&&(document.title=a)}};try{let a=await xs[e].page.render(ks,s);if(t!==qs){typeof a=="function"&&a();return}Ss=typeof a=="function"?a:null}catch(a){if(t!==qs)return;console.error("Failed to render route",e,a),ks.innerHTML=Tl(a);let r=document.getElementById("route-retry");r&&r.addEventListener("click",()=>ha()),M("\u9801\u9762\u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}}function El(){document.addEventListener("keydown",e=>{if(e.key!=="/"||e.metaKey||e.ctrlKey||e.altKey)return;let t=document.activeElement;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable)||ya()!=="rag")return;let a=document.getElementById("rag-question");a&&(e.preventDefault(),a.focus())})}function Xn(){ja(),El(),window.addEventListener("hashchange",ha),ha(),ts()&&window.setTimeout(()=>{ya()!=="tests"&&(window.location.hash="#/tests")},700)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Xn):Xn();})();
