(()=>{var ka=Object.defineProperty;var Je=(e,t)=>{for(var s in t)ka(e,s,{get:t[s],enumerable:!0})};var Ot="judgment.api_base",Ft="http://127.0.0.1:9200",ge=class extends Error{constructor(t,s=0,a=null){super(t),this.name="ApiError",this.status=s,this.detail=a}};function bs(e){return["localhost","127.0.0.1","::1","[::1]"].includes(e)}function Fe(e){let t=String(e??"").trim();if(!t||t==="/")return"";t=t.replace(/\/+$/,""),!/^https?:\/\//i.test(t)&&!t.startsWith("/")&&(t=`${bs(t.split(":")[0])?"http":"https"}://${t}`);try{let s=new URL(t,window.location.href);return s.protocol!=="http:"&&s.protocol!=="https:"?"":`${s.origin}${s.pathname==="/"?"":s.pathname.replace(/\/+$/,"")}`}catch{return t}}function Ht(e){let t=Fe(e);if(!t)return!0;try{let s=new URL(t);return s.protocol==="http:"||s.protocol==="https:"}catch{return!1}}function Ut(){try{let e=new URLSearchParams(window.location.search);return e.has("api")?Fe(e.get("api")):null}catch{return null}}function zt(){try{let e=window.localStorage.getItem(Ot);return e===null?null:Fe(e)}catch{return null}}function Gt(){let e=window.JUDGMENT_CONFIG&&window.JUDGMENT_CONFIG.apiBase;return Fe(e||"")}function He(){let e=Ut();if(e!==null)return e;let t=zt();if(t!==null)return t;let s=Gt();return s||(window.location.protocol==="file:"?Ft:"")}function xa(){if(Ut()!==null)return!0;let e=zt();return e!==null?!!e:!!Gt()}function Ue(){return Ut()!==null?"query":zt()!==null?"storage":Gt()?"config":window.location.protocol==="file:"?"file-default":"same-origin"}function gt(){return xa()||window.location.protocol==="file:"||!window.JUDGMENT_CONFIG?!1:!bs(window.location.hostname)}function Qt(e){let t=Fe(e);try{t?window.localStorage.setItem(Ot,t):window.localStorage.removeItem(Ot)}catch{}return t}function Ve(e=He()){return e||"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"}function Ce(e,t=He()){return t?`${t}${e.startsWith("/")?e:`/${e}`}`:e}function Jt(e){return`\u7121\u6CD5\u9023\u7DDA\u5230\u4F3A\u670D\u5668${e?`\uFF08${e}\uFF09`:""}\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u662F\u5426\u555F\u52D5\uFF0C\u6216\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u8A2D\u5B9A\u5F8C\u7AEF\u4F4D\u5740\u3002`}async function se(e,t={}){let s=He(),a=new AbortController,r=t.timeout===void 0?3e4:t.timeout,i=r>0?window.setTimeout(()=>a.abort(),r):null,o=Date.now(),l=performance.now(),m=t.requestId||hs(),h={Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},"X-Judgment-Request-Id":m,"X-Judgment-Client-Started-At":String(o),...t.headers||{}},w;try{w=await fetch(Ce(e,s),{...t,headers:h,signal:a.signal})}catch(y){throw y.name==="AbortError"?new ge("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new ge(Jt(s),0,y)}finally{i&&window.clearTimeout(i)}let f=null;if((w.headers.get("content-type")||"").includes("application/json"))try{f=await w.json()}catch{f=null}else try{f=await w.text()}catch{f=null}let x=performance.now(),b=w.headers.get("X-Judgment-Request-Id")||m;if(t.trackClient!==!1&&b){let y=Math.round(performance.now()-l);window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{$s({request_id:b,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:y,render_ms:Math.max(0,Math.round(performance.now()-x)),status:w.ok?"success":"failed"})})})}if(!w.ok){let y=f&&typeof f=="object"?f.detail||f.message:f,C=typeof y=="string"&&y?y:`\u4F3A\u670D\u5668\u56DE\u61C9 ${w.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new ge(C,w.status,y)}return f}function hs(){try{if(window.crypto&&typeof window.crypto.randomUUID=="function")return window.crypto.randomUUID().replace(/-/g,"").slice(0,32)}catch{}return`req${Date.now().toString(36)}${Math.random().toString(36).slice(2,10)}`}function $s(e){try{fetch(Ce("/api/performance/client",He()),{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e),keepalive:!0}).catch(()=>{})}catch{}}async function ys(e){let t=Fe(e);if(!Ht(t))throw new ge("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002");let s=performance.now(),a=new AbortController,r=window.setTimeout(()=>a.abort(),1e4);try{let i=await fetch(Ce("/api/health",t),{headers:{Accept:"application/json"},signal:a.signal});if(!i.ok)throw new ge(`API \u56DE\u61C9 ${i.status}\u3002`,i.status);let o=await i.json();return{base:t,version:o.version||"\u2014",duration_ms:Math.round(performance.now()-s)}}catch(i){throw i instanceof ge?i:i.name==="AbortError"?new ge("\u9023\u7DDA\u6E2C\u8A66\u903E\u6642\uFF0C\u8ACB\u78BA\u8A8D API \u4F4D\u5740\u8207\u7DB2\u8DEF\u3002",0,i):new ge(Jt(t),0,i)}finally{window.clearTimeout(r)}}var U={health(){return se("/api/health")},status(){return se("/api/status",{trackClient:!1})},systemUsage(){return se("/api/system-usage",{trackClient:!1})},indexVersions(){return se("/api/index-versions",{trackClient:!1})},indexVersion(e){return se(`/api/index-versions/${encodeURIComponent(e)}`,{trackClient:!1})},validateIndexVersion(e){return se(`/api/index-versions/${encodeURIComponent(e)}/validate`,{method:"POST",trackClient:!1})},activateIndexVersion(e){return se(`/api/index-versions/${encodeURIComponent(e)}/activate`,{method:"POST",trackClient:!1})},rollbackIndexVersion(){return se("/api/index-versions/rollback",{method:"POST",trackClient:!1})},reconcileIndexAlias(e=!1){let t=new URLSearchParams({repair:e?"true":"false"});return se(`/api/index-alias/reconcile?${t.toString()}`,{trackClient:!1})},catalog(){return se("/api/catalog")},query({database:e,filters:t,page:s=1,pageSize:a=25}){return se("/api/query",{method:"POST",body:JSON.stringify({database:e,filters:t,page:s,page_size:a})})},schemaSuggest({database:e,table:t,column:s,query:a,limit:r=1e3}){let i=new URLSearchParams({database:e,table:t,column:s,q:a||"",limit:String(r)});return se(`/api/schema/suggest?${i.toString()}`,{timeout:3e4})},lawDetail(e,t="",s="",a=""){let r=new URLSearchParams({law_key:e});return t&&r.set("source_type",t),s&&r.set("version_id",String(s)),a&&r.set("article_no",String(a)),se(`/api/law?${r.toString()}`,{timeout:45e3})},judgmentDetail(e,t=""){let s=new URLSearchParams({jid:e});return t&&s.set("source",t),se(`/api/judgment?${s.toString()}`,{timeout:45e3})},testMode(){return se("/api/test-mode",{trackClient:!1})},setTestMode(e){return se("/api/test-mode",{method:"POST",body:JSON.stringify({enabled:!!e}),trackClient:!1})},testRuns(e=20){let t=new URLSearchParams({limit:String(e)});return se(`/api/test-runs?${t.toString()}`,{trackClient:!1})},testRunCurrent(){return se("/api/test-runs/current",{trackClient:!1})},testRun(e){return se(`/api/test-runs/${encodeURIComponent(e)}`,{trackClient:!1})},performanceOptions(){return se("/api/performance/options",{trackClient:!1})},performance(e={},t=1,s=25){let a=new URLSearchParams;for(let[r,i]of Object.entries(e))i==null||i===""||a.set(r,String(i));return a.set("page",String(t)),a.set("page_size",String(s)),se(`/api/performance?${a.toString()}`,{timeout:45e3,trackClient:!1})},quality(){return se("/api/quality",{timeout:18e4,trackClient:!1})},processing(){return se("/api/processing",{timeout:45e3,trackClient:!1})},processingPlan(){return se("/api/processing/plan",{timeout:45e3,trackClient:!1})},startProcessingWorkflow(e){return se(`/api/processing/workflows/${encodeURIComponent(e)}/run`,{method:"POST",body:JSON.stringify({})})},startProcessingUpdate(e=!1){return se("/api/processing/update",{method:"POST",body:JSON.stringify({index:!!e}),timeout:45e3,trackClient:!1})},stopProcessingUpdate(){return se("/api/processing/stop",{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},rag(e,t={}){return se("/api/rag/query",{method:"POST",body:JSON.stringify({question:e}),timeout:t.testMode?0:3e5})},async ragStream(e,{testMode:t=!1,onStep:s=null,onPartial:a=null,onToken:r=null,onTokenReset:i=null}={}){let o=He(),l=new AbortController,m=t?0:3e5,h=m>0?window.setTimeout(()=>l.abort(),m):null,w=Date.now(),f=performance.now(),v=hs(),x={Accept:"text/event-stream","Content-Type":"application/json","X-Judgment-Request-Id":v,"X-Judgment-Client-Started-At":String(w)},b;try{b=await fetch(Ce("/api/rag/query/stream",o),{method:"POST",headers:x,body:JSON.stringify({question:e}),signal:l.signal})}catch(Q){throw Q.name==="AbortError"?new ge("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new ge(Jt(o),0,Q)}finally{h&&window.clearTimeout(h)}if(!b.ok){let Q=null;try{Q=await b.json()}catch{Q=null}let Z=Q&&typeof Q=="object"&&Q.detail?String(Q.detail):`\u4F3A\u670D\u5668\u56DE\u61C9 ${b.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new ge(Z,b.status,Q)}if(!b.body)throw new ge("\u4F3A\u670D\u5668\u6C92\u6709\u56DE\u50B3\u53EF\u8B80\u53D6\u7684\u6D41\u7A0B\u4E32\u6D41\u3002",0,null);let y=b.body.getReader(),C=new TextDecoder,L="",_=null,E=null;try{for(;;){let{value:Q,done:Z}=await y.read();if(Z)break;L+=C.decode(Q,{stream:!0});let ie=L.indexOf(`

`);for(;ie>=0;){let I=L.slice(0,ie).replace(/\r/g,"");L=L.slice(ie+2);let P="message",k=[];for(let T of I.split(`
`))T.startsWith("event:")?P=T.slice(6).trim():T.startsWith("data:")&&k.push(T.slice(5).trimStart());if(k.length){let T=null;try{T=JSON.parse(k.join(`
`))}catch{T=null}if(T)if(P==="step"&&typeof s=="function")try{s(T)}catch{}else if(P==="partial"){if(typeof a=="function")try{a(T)}catch{}}else if(P==="token"){if(typeof r=="function")try{r(String(T.text||""))}catch{}}else if(P==="token_reset"){if(typeof i=="function")try{i()}catch{}}else P==="result"?_=T:P==="error"&&(E=new ge(T.message||T.detail||"RAG \u6D41\u7A0B\u5931\u6557\u3002",0,T))}ie=L.indexOf(`

`)}}}finally{try{await y.cancel()}catch{}h&&window.clearTimeout(h)}if(E)throw E;if(!_)throw new ge("\u6D41\u7A0B\u4E32\u6D41\u7D50\u675F\uFF0C\u4F46\u6C92\u6709\u6536\u5230\u6700\u7D42\u56DE\u7B54\u3002",0,null);let z=Math.round(performance.now()-f);return $s({request_id:v,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:z,render_ms:0,status:"success"}),_}};var Sa={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},Aa={operational:{label:"\u6B63\u5E38",tone:"ok"},success:{label:"\u6210\u529F",tone:"ok"},ok:{label:"\u6B63\u5E38",tone:"ok"},healthy:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},warning:{label:"\u6CE8\u610F",tone:"warn"},empty:{label:"\u7121\u8CC7\u6599",tone:"warn"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},running:{label:"\u57F7\u884C\u4E2D",tone:"info"},pending:{label:"\u7B49\u5F85",tone:"idle"},skipped:{label:"\u7565\u904E",tone:"idle"},partial:{label:"\u90E8\u5206\u6210\u529F",tone:"warn"},preview:{label:"\u9810\u89BD\u6A21\u5F0F",tone:"info"},retrieval_only:{label:"\u50C5\u6AA2\u7D22\u7D50\u679C",tone:"warn"},not_indexed:{label:"\u5C1A\u672A\u7D22\u5F15",tone:"warn"},missing_query:{label:"\u7B49\u5F85\u67E5\u8A62",tone:"idle"},client_side:{label:"\u700F\u89BD\u5668\u7AEF",tone:"info"},not_configured:{label:"\u672A\u8A2D\u5B9A",tone:"idle"},unavailable:{label:"\u96E2\u7DDA",tone:"danger"},failed:{label:"\u5931\u6557",tone:"danger"},error:{label:"\u932F\u8AA4",tone:"danger"}},La={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},Ma={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},ws={search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',send:'<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',refresh:'<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 4v5.5H15"/>',copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',check:'<path d="m5 12 4.2 4.2L19 6.5"/>',x:'<path d="m6 6 12 12M18 6 6 18"/>',external:'<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/>',message:'<path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H6l-3 2 1.3-4.2A8.5 8.5 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',history:'<path d="M3.2 12a8.8 8.8 0 1 0 2.8-6.3L3.2 8.5"/><path d="M3 3.5v5h5"/><path d="M12 7.5V12l3 1.8"/>',database:'<ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/><path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/>',layers:'<path d="m12 3 9 4.8-9 4.8-9-4.8L12 3Z"/><path d="m3 12.2 9 4.8 9-4.8"/><path d="m3 16.7 9 4.8 9-4.8"/>',cube:'<path d="m12 2.8 8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4L12 2.8Z"/><path d="m3.8 7.4 8.2 4.6 8.2-4.6"/><path d="M12 12v9.2"/>',browser:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6.5 6.5h.01"/>',download:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',chevronLeft:'<path d="m14.5 5-7 7 7 7"/>',chevronRight:'<path d="m9.5 5 7 7-7 7"/>',chevronDown:'<path d="m5 9 7 7 7-7"/>',arrowRight:'<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',alert:'<path d="M12 3 2.5 20.5h19L12 3Z"/><path d="M12 9v4.5"/><path d="M12 17.5h.01"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',sparkles:'<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"/>',table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M9 9.5V20M15 9.5V20"/>',sliders:'<path d="M4 7h8M16 7h4M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',server:'<rect x="3" y="4" width="18" height="6" rx="1.6"/><rect x="3" y="14" width="18" height="6" rx="1.6"/><path d="M7 7h.01M7 17h.01"/>',brain:'<path d="M9.7 4.2a2.8 2.8 0 0 0-3 2.8 2.8 2.8 0 0 0-1.1 5.2A2.9 2.9 0 0 0 7.8 18a2.9 2.9 0 0 0 3.9 2V4.2a2.8 2.8 0 0 0-2 0Z"/><path d="M14.3 4.2a2.8 2.8 0 0 1 3 2.8 2.8 2.8 0 0 1 1.1 5.2A2.9 2.9 0 0 1 16.2 18a2.9 2.9 0 0 1-3.9 2"/>',cloud:'<path d="M7 18.5h10.5a3.5 3.5 0 0 0 .4-7 5.5 5.5 0 0 0-10.6-1.3A4.2 4.2 0 0 0 7 18.5Z"/>',code:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',play:'<path d="M7 4.5v15l13-7.5-13-7.5Z"/>',file:'<path d="M6 2.8h8l4.5 4.5v13.9H6V2.8Z"/><path d="M14 2.8V7.5h5"/>',activity:'<path d="M3 12h4l2.2-5 4.1 10 2.2-5H21"/>',shield:'<path d="M12 2.8 20 6v6c0 4.7-3.2 8-8 9.2C7.2 20 4 16.7 4 12V6l8-3.2Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',terminal:'<path d="m5 7 5 5-5 5"/><path d="M12 17h7"/>',filter:'<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',link:'<path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10.2 5.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-1.4 1.4a5 5 0 0 0 7.1 7.1l1.2-1.2"/>',grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9.5 9.5h5v5h-5z"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>'};function n(e){return String(e??"").replace(/[&<>"']/g,t=>Sa[t])}function $(e,t=16,s=""){let a=ws[e]||ws.info;return`<svg${s?` class="${n(s)}"`:""} width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a}</svg>`}function c(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?new Intl.NumberFormat("zh-TW").format(s):t}function O(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=["B","KB","MB","GB","TB"],a=0;for(;t>=1024&&a<s.length-1;)t/=1024,a+=1;return a===0?`${t.toFixed(0)} B`:`${t.toFixed(1)} ${s[a]}`}function Vt(e){if(e instanceof Date)return e;if(typeof e=="number"){let r=new Date(e);return Number.isNaN(r.getTime())?null:r}let t=String(e??"").trim();if(!t)return null;if(/^\d{8}$/.test(t))return new Date(Number(t.slice(0,4)),Number(t.slice(4,6))-1,Number(t.slice(6,8)));let s=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(t),a=new Date(s?`${t}Z`:t);return Number.isNaN(a.getTime())?null:a}function Ne(e){let t=Vt(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit"}).format(t):e?n(e):"\u2014"}function ne(e){let t=Vt(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1}).format(t):e?n(e):"\u2014"}function st(e){let t=Vt(e);if(!t)return"";let s=Date.now()-t.getTime();return s<45e3?"\u525B\u525B":s<36e5?`${Math.max(1,Math.round(s/6e4))} \u5206\u9418\u524D`:s<864e5?`${Math.round(s/36e5)} \u5C0F\u6642\u524D`:s<6048e5?`${Math.round(s/864e5)} \u5929\u524D`:Ne(t)}function F(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;if(t<6e4)return`${(t/1e3).toFixed(1)} s`;let s=Math.floor(t/6e4),a=Math.round(t%6e4/1e3);return`${s}m ${a}s`}function Re(e){return Aa[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function Y(e,t){let s=Re(e);return`<span class="badge ${La[s.tone]}"><span class="status-dot ${Ma[s.tone]}"></span>${n(t||s.label)}</span>`}function Ta(e){return e==="law"?'<span class="badge badge-info">\u6CD5\u898F</span>':e==="order"?'<span class="badge badge-neutral">\u547D\u4EE4</span>':e?`<span class="badge badge-neutral">${n(e)}</span>`:'<span class="cell-empty">\u2014</span>'}function ft(e,t){let s=String(e??"");return s.length>t?`${s.slice(0,t)}\u2026`:s}function bt(e,t="text"){if(e==null||e==="")return'<span class="cell-empty">\u2014</span>';switch(t){case"boolean":return e?'<span class="badge badge-ok">\u662F</span>':'<span class="badge badge-neutral">\u5426</span>';case"status":return Y(String(e));case"source":return Ta(String(e));case"number":return`<span class="mono">${c(e)}</span>`;case"duration":return`<span class="mono">${F(e)}</span>`;case"datetime":return`<span class="mono">${ne(e)}</span>`;case"date":return`<span class="mono">${Ne(e)}</span>`;case"url":{let s=String(e),a=ft(s.replace(/^https?:\/\//,""),46);return`<span class="cell-url"><a href="${n(s)}" target="_blank" rel="noopener noreferrer" title="${n(s)}">${$("external",10)}${n(a)}</a></span>`}case"mono":{let s=String(e);return`<span class="cell-mono cell-truncate" title="${n(s)}">${n(ft(s,54))}</span>`}case"longtext":{let s=String(e);return`<span class="cell-truncate" title="${n(s)}">${n(ft(s,100))}</span>`}default:{let s=String(e);return`<span class="cell-truncate" title="${n(s)}">${n(ft(s,90))}</span>`}}}function X({tone:e="info",title:t,text:s,iconName:a="info"}){let r=e==="ok"?"check":e==="danger"||e==="warn"?"alert":"i";return`<div class="notice notice-${e}" role="status">
    <span class="notice-icon" aria-hidden="true">${r==="i"?"i":$(r,12)}</span>
    <div class="notice-body">
      ${t?`<strong>${n(t)}</strong>`:""}
      ${s?`<p>${s}</p>`:""}
    </div>
  </div>`}function we({iconName:e="search",title:t,text:s="",actions:a="",className:r=""}){return`<div class="empty-state ${r}">
    <span class="empty-icon">${$(e,24)}</span>
    <h3 class="empty-title">${n(t)}</h3>
    ${s?`<p class="empty-text">${s}</p>`:""}
    ${a?`<div class="empty-actions">${a}</div>`:""}
  </div>`}function W(e,t,s="\u8655\u7406\u4E2D\u2026"){e&&(t?(e.dataset.idleHtml||(e.dataset.idleHtml=e.innerHTML),e.disabled=!0,e.classList.add("is-loading"),e.innerHTML=`<span class="spinner" aria-hidden="true"></span><span>${n(s)}</span>`):(e.disabled=!1,e.classList.remove("is-loading"),e.dataset.idleHtml&&(e.innerHTML=e.dataset.idleHtml,delete e.dataset.idleHtml)))}function D(e,t="info",s=4200){let a=document.getElementById("toast-region");if(!a)return null;let r={info:"i",ok:"\u2713",warn:"!",danger:"\xD7"},i=document.createElement("div");i.className=`toast toast-${t}`,i.setAttribute("role",t==="danger"?"alert":"status"),i.innerHTML=`<span class="toast-mark" aria-hidden="true">${r[t]||"i"}</span>
    <div class="toast-body">${n(e)}</div>
    <button class="toast-close" type="button" aria-label="\u95DC\u9589\u901A\u77E5">\xD7</button>`;let o=()=>{i.isConnected&&(i.classList.add("is-leaving"),window.setTimeout(()=>i.remove(),190))};return i.querySelector(".toast-close").addEventListener("click",o),a.appendChild(i),s>0&&window.setTimeout(o,s),i}async function ht(e){try{return await navigator.clipboard.writeText(e),!0}catch{let s=document.createElement("textarea");s.value=e,s.setAttribute("readonly",""),s.style.position="fixed",s.style.opacity="0",document.body.appendChild(s),s.select();let a=!1;try{a=document.execCommand("copy")}catch{a=!1}return s.remove(),a}}function ze(e,t,s="text/plain;charset=utf-8"){let a=new Blob([t],{type:s}),r=URL.createObjectURL(a),i=document.createElement("a");i.href=r,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(r),1e3)}var ks="judgment.theme",Wt="nvidia",xs=[{id:"vercel",name:"Vercel",description:"\u9ED1\u767D\u7CBE\u6E96 \xB7 Geist \xB7 \u5E7E\u4F55\u7559\u767D",swatches:["#171717","#0070f3","#fafafa"],metaColor:"#ffffff"},{id:"apple",name:"Apple",description:"SF Pro \xB7 \u5927\u5713\u89D2 \xB7 \u6C89\u6D78\u7559\u767D",swatches:["#1d1d1f","#0071e3","#f5f5f7"],metaColor:"#fbfbfd"},{id:"meta",name:"Meta",description:"Optimistic \xB7 \u660E\u4EAE\u85CD \xB7 \u81A0\u56CA\u5143\u4EF6",swatches:["#0064e0","#0091ff","#f1f4f7"],metaColor:"#ffffff"},{id:"nvidia",name:"NVIDIA",description:"GPU \u7DA0 \xB7 \u9ED1\u5E95 \xB7 \u92B3\u5229\u76F4\u89D2",swatches:["#76b900","#000000","#f7f7f7"],metaColor:"#000000"},{id:"ibm",name:"IBM",description:"Carbon \xB7 Plex Sans \xB7 \u4F01\u696D\u85CD",swatches:["#0f62fe","#161616","#f4f4f4"],metaColor:"#161616"},{id:"stripe",name:"Stripe",description:"\u7D2B\u975B\u6F38\u5C64 \xB7 \u7CBE\u5BC6\u91D1\u878D\u611F",swatches:["#635bff","#ea2261","#f6f9fc"],metaColor:"#ffffff"},{id:"linear",name:"Linear",description:"\u6DF1\u7A7A\u9ED1 \xB7 \u975B\u7D2B \xB7 \u6975\u7C21\u7DDA\u689D",swatches:["#5e6ad2","#010102","#e8e8ec"],metaColor:"#010102"},{id:"figma",name:"Figma",description:"\u591A\u5F69\u8272\u584A \xB7 \u5354\u4F5C\u611F \xB7 \u85CD\u8272\u7126\u9EDE",swatches:["#f24e1e","#a259ff","#0acf83"],metaColor:"#ffffff"},{id:"notion",name:"Notion",description:"\u6696\u767D\u7D19\u5F35 \xB7 \u896F\u7DDA\u6A19\u984C \xB7 \u77E5\u8B58\u5EAB",swatches:["#191918","#0075de","#f7f6f3"],metaColor:"#ffffff"},{id:"openai",name:"OpenAI",description:"\u6696\u7070\u756B\u5E03 \xB7 \u9ED1\u8272\u884C\u52D5 \xB7 \u7DA0\u8272\u8A0A\u865F",swatches:["#10a37f","#0d0d0d","#f9f9f7"],metaColor:"#f9f9f7"}],Kt=new Map(xs.map(e=>[e.id,e]));function qa(e){return Kt.has(e)}function ja(e){return Kt.get(e)||Kt.get(Wt)}function Ea(){try{let e=window.localStorage.getItem(ks);return qa(e)?e:Wt}catch{return Wt}}function _s(e,{persist:t=!0}={}){let s=ja(e);document.documentElement.dataset.theme=s.id;let a=document.getElementById("theme-color-meta");a&&a.setAttribute("content",s.metaColor);let r=document.getElementById("theme-label");r&&(r.textContent=s.name);let i=document.getElementById("theme-swatches");if(i&&(i.innerHTML=s.swatches.map(o=>`<i class="style-swatch" style="--swatch:${n(o)}"></i>`).join("")),document.querySelectorAll(".theme-option").forEach(o=>{let l=o.dataset.themeId===s.id;o.classList.toggle("is-active",l),o.setAttribute("aria-checked",l?"true":"false")}),t)try{window.localStorage.setItem(ks,s.id)}catch{}return window.dispatchEvent(new CustomEvent("judgment:theme",{detail:{theme:s.id}})),s}function Pa(e){let t=xs.map((s,a)=>{let r=s.swatches.map(i=>`<i style="--swatch:${n(i)}"></i>`).join("");return`<button class="theme-option" type="button" role="menuitemradio"
        data-theme-id="${s.id}" aria-checked="false">
        <span class="theme-option-index">${String(a+1).padStart(2,"0")}</span>
        <span class="theme-option-body">
          <span class="theme-option-name">${n(s.name)}</span>
          <span class="theme-option-desc">${n(s.description)}</span>
        </span>
        <span class="theme-option-swatches" aria-hidden="true">${r}</span>
        <span class="theme-option-check" aria-hidden="true">${$("check",14)}</span>
      </button>`}).join("");e.innerHTML=`<div class="style-menu-head">
      <strong>\u9078\u64C7\u4ECB\u9762\u98A8\u683C</strong>
      <span>10 \u7A2E\u79D1\u6280\u54C1\u724C\u8A9E\u8A00</span>
    </div>${t}`}function Ss(){let e=document.getElementById("style-picker"),t=document.getElementById("style-trigger"),s=document.getElementById("style-menu");if(!e||!t||!s)return;Pa(s),_s(Ea(),{persist:!1});let a=()=>Array.from(s.querySelectorAll(".theme-option")),r=()=>{s.hidden=!1,t.setAttribute("aria-expanded","true");let o=s.querySelector(".theme-option.is-active")||a()[0];o&&o.focus()},i=({restoreFocus:o=!1}={})=>{s.hidden||(s.hidden=!0,t.setAttribute("aria-expanded","false"),o&&t.focus())};t.addEventListener("click",()=>{s.hidden?r():i({restoreFocus:!0})}),t.addEventListener("keydown",o=>{(o.key==="ArrowDown"||o.key==="ArrowUp")&&(o.preventDefault(),r())}),s.addEventListener("click",o=>{let l=o.target.closest(".theme-option");l&&(_s(l.dataset.themeId),i({restoreFocus:!0}))}),s.addEventListener("keydown",o=>{let l=a(),m=l.indexOf(document.activeElement);if(o.key==="Escape"){o.preventDefault(),i({restoreFocus:!0});return}if(o.key==="ArrowDown"||o.key==="ArrowUp"){o.preventDefault();let h=o.key==="ArrowDown"?1:-1,w=l[(m+h+l.length)%l.length];w&&w.focus();return}if(o.key==="Home"||o.key==="End"){o.preventDefault();let h=o.key==="Home"?l[0]:l[l.length-1];h&&h.focus()}}),document.addEventListener("pointerdown",o=>{e.contains(o.target)||i()}),document.addEventListener("keydown",o=>{o.key==="Escape"&&i()})}var cs={};Je(cs,{render:()=>ar});var Ca="judgment-console";var Ie="query_history",Ge="settings";var Be={history:[],settings:new Map,nextId:1},$t=null,_e=!("indexedDB"in window);function ot(e){return new Promise((t,s)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>s(e.error)})}function We(e){return new Promise((t,s)=>{e.oncomplete=()=>t(),e.onerror=()=>s(e.error),e.onabort=()=>s(e.error||new Error("transaction aborted"))})}function Ke(){return $t||($t=new Promise((e,t)=>{if(!("indexedDB"in window)){_e=!0,t(new Error("IndexedDB is unavailable"));return}let s;try{s=window.indexedDB.open(Ca,1)}catch(a){_e=!0,t(a);return}s.onupgradeneeded=()=>{let a=s.result;if(!a.objectStoreNames.contains(Ie)){let r=a.createObjectStore(Ie,{keyPath:"id",autoIncrement:!0});r.createIndex("created_at","created_at"),r.createIndex("kind","kind")}a.objectStoreNames.contains(Ge)||a.createObjectStore(Ge,{keyPath:"key"})},s.onsuccess=()=>{let a=s.result;a.onversionchange=()=>a.close(),e(a)},s.onerror=()=>{_e=!0,t(s.error||new Error("Unable to open IndexedDB"))},s.onblocked=()=>{_e=!0,t(new Error("IndexedDB upgrade blocked by another tab"))}}),$t)}function As(){return"indexedDB"in window}function Ls(){return _e}function yt(){return _e?"memory":"indexeddb"}function Na(e){let t=e.created_at||new Date().toISOString();return{kind:e.kind||"query",title:String(e.title||""),detail:String(e.detail||""),payload:e.payload||{},created_at:t}}async function Ra(){try{let t=(await Ke()).transaction(Ie,"readwrite"),s=t.objectStore(Ie),a=await ot(s.count());if(a>120){let r=a-120,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let m=i.result;if(!m||r<=0){o();return}m.delete(),r-=1,m.continue()},i.onerror=()=>l(i.error)})}await We(t)}catch{_e=!0}}async function wt(e){let t=Na(e);try{let a=(await Ke()).transaction(Ie,"readwrite"),r=a.objectStore(Ie),i=await ot(r.add(t));return await We(a),await Ra(),i}catch{_e=!0;let a=Be.nextId++;return Be.history.push({id:a,...t}),Be.history.length>120&&Be.history.shift(),a}}async function _t({keyword:e="",limit:t=50}={}){let s=e.trim().toLowerCase();try{let r=(await Ke()).transaction(Ie,"readonly"),i=r.objectStore(Ie),o=await ot(i.getAll());return await We(r),o.filter(l=>s?`${l.kind} ${l.title} ${l.detail}`.toLowerCase().includes(s):!0).sort((l,m)=>String(m.created_at).localeCompare(String(l.created_at))).slice(0,t)}catch{return _e=!0,Be.history.filter(r=>s?`${r.kind} ${r.title} ${r.detail}`.toLowerCase().includes(s):!0).slice().sort((r,i)=>String(i.created_at).localeCompare(String(r.created_at))).slice(0,t)}}async function Ms(){try{let t=(await Ke()).transaction(Ie,"readwrite");t.objectStore(Ie).clear(),await We(t)}catch{_e=!0}Be.history=[]}async function Ts(e,t){let s={key:String(e),value:t,updated_at:new Date().toISOString()};try{let r=(await Ke()).transaction(Ge,"readwrite");return r.objectStore(Ge).put(s),await We(r),s}catch{return _e=!0,Be.settings.set(s.key,s),s}}async function lt(e,t=null){try{let a=(await Ke()).transaction(Ge,"readonly"),r=a.objectStore(Ge),i=await ot(r.get(String(e)));return await We(a),i?i.value:t}catch{_e=!0;let a=Be.settings.get(String(e));return a?a.value:t}}async function qs({keyword:e=""}={}){let t=e.trim().toLowerCase();try{let a=(await Ke()).transaction(Ge,"readonly"),r=a.objectStore(Ge),i=await ot(r.getAll());return await We(a),i.filter(o=>t?`${o.key} ${JSON.stringify(o.value)}`.toLowerCase().includes(t):!0).sort((o,l)=>String(o.key).localeCompare(String(l.key)))}catch{return _e=!0,Array.from(Be.settings.values()).filter(a=>t?`${a.key} ${JSON.stringify(a.value)}`.toLowerCase().includes(t):!0)}}function js(e){if(typeof e=="string")return e;try{return JSON.stringify(e)}catch{return String(e)}}var os={};Je(os,{render:()=>On,renderTestFlowPanel:()=>nt});var rs={};Je(rs,{exportCsv:()=>Mt,exportableResult:()=>Tt,render:()=>$n,renderReport:()=>St,reportError:()=>Lt,reportLoading:()=>ct});var Bs=[10,25,50,100],Ia=500,Da=["law_name","law_level","law_category","law_modified_date","article_count"],Ba=["jid","court_normalized","title","jdate","matched_laws","citation_count"],Oa={A:"\u689D\u6587",C:"\u7AE0\u7BC0"};function At(e){return e?.label||e?.id||"\u8CC7\u6599\u5EAB"}function kt(e,t){let s={};for(let a of e.fields||[]){let r=a.type==="checkbox"?!1:a.type==="multiselect"?[]:"",i=a.default===void 0?r:a.default;s[a.key]=Array.isArray(i)?[...i]:i}return{values:s,page:1,pageSize:t,result:null,sort:null,columnFilters:{}}}function Fa(e,t){let s=e.visibleWhen;if(!s)return!0;for(let[a,r]of Object.entries(s))if(Array.isArray(r)&&!r.map(String).includes(String(t[a]??"")))return!1;return!0}function ns(e,t){return(e.fields||[]).filter(s=>Fa(s,t))}function Ha(e,t){return`filter-${e.id}-${t}`}function Ye(e){return e==null?"":n(String(e))}function Yt(e,t,s){let a=s[t.key],r=Ha(e,t.key),i=t.help?`<span class="field-help">${n(t.help)}</span>`:"";if(t.type==="checkbox")return`<div class="field">
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
    </label>`;if(t.type==="select"){let l=(t.options||[]).map(m=>`<option value="${Ye(m.value)}" ${String(m.value)===String(a??"")?"selected":""}>${n(m.label??m.value)}</option>`).join("");return`<div class="field">${o}
      <select class="select" id="${r}" name="${n(t.key)}">${l}</select>
      ${i}
    </div>`}if(t.type==="multiselect"){let l=new Set((Array.isArray(a)?a:[]).map(String)),m=(t.options||[]).map(h=>`<label class="multi-option">
          <input type="checkbox" name="${n(t.key)}" value="${Ye(h.value)}" ${l.has(String(h.value))?"checked":""} />
          <span>${n(h.label??h.value)}</span>
        </label>`).join("");return`<div class="field">${o}
      <div class="multi-select">${m}</div>
      ${i}
    </div>`}return t.type==="number"?`<div class="field">${o}
      <input class="input" type="number" id="${r}" name="${n(t.key)}"
        value="${Ye(a)}"
        ${t.min!==void 0?`min="${t.min}"`:""}
        ${t.max!==void 0?`max="${t.max}"`:""}
        step="${t.step??1}"
        placeholder="${Ye(t.placeholder||"")}" />
      ${i}
    </div>`:t.type==="date"?`<div class="field">${o}
      <input class="input" type="date" id="${r}" name="${n(t.key)}"
        value="${Ye(a)}" />
      ${i}
    </div>`:`<div class="field">${o}
    <input class="input" type="text" id="${r}" name="${n(t.key)}"
      value="${Ye(a)}"
      placeholder="${Ye(t.placeholder||"")}" />
    ${i}
  </div>`}function Xt(e,t,{focusTable:s=!1}={}){let a=ns(e,t.values),r=[];for(let i=0;i<a.length;i+=1){let o=a[i],l=a[i+1];o.type==="date"&&l&&l.type==="date"?(r.push(`<div class="field-row">${Yt(e,o,t.values)}${Yt(e,l,t.values)}</div>`),i+=1):r.push(Yt(e,o,t.values))}return`<form id="data-filter-form" autocomplete="off">
    <div class="filter-block">
      <div class="filter-head">
        <span class="filter-title">Metadata \u689D\u4EF6</span>
        <button class="filter-reset" type="button" data-action="reset">\u91CD\u8A2D</button>
      </div>
      <div class="filter-fields">${r.join("")}</div>
    </div>
    <div class="sidebar-actions">
      <button class="btn btn-primary" type="submit" id="run-query" ${s?'data-focus-table="true"':""}>
        ${$("search",15)}<span>\u57F7\u884C\u67E5\u8A62</span>
      </button>
    </div>
  </form>`}function xt(e,t,s){let a={...s.values};for(let r of ns(t,a))if(r.type==="checkbox"){let i=e.querySelector(`[name="${r.key}"]`);a[r.key]=!!i?.checked}else if(r.type==="multiselect")a[r.key]=Array.from(e.querySelectorAll(`[name="${r.key}"]:checked`)).map(i=>i.value);else{let i=e.querySelector(`[name="${r.key}"]`);a[r.key]=i?i.value:""}return a}function Os(e,t){let s={};for(let a of ns(e,t.values)){let r=t.values[a.key];a.type==="checkbox"?s[a.key]=!!r:a.type==="multiselect"?s[a.key]=Array.isArray(r)?r:[]:a.type==="number"?s[a.key]=r===""||r===null?"":Number(r):s[a.key]=r??""}return s}function Zt(e,t){let s=Os(e,t);return(e.id==="postgres"||e.id==="parquet")&&t.sort?.key&&(s.sort=`${t.sort.key}:${t.sort.direction}`,s.schema_preview=!0),t.columnFilters&&Object.keys(t.columnFilters).length>0&&(s.column_filters=t.columnFilters),s}function Es(e){if(e.status==="operational")return"";let t=e.status==="unavailable"?"danger":e.status==="degraded"?"warn":"info";return`<div class="sidebar-notice">${X({tone:t,title:`${At(e)} ${Re(e.status).label}`,text:n(e.detail||"\u76EE\u524D\u7121\u6CD5\u4F7F\u7528\u9019\u500B\u8CC7\u6599\u4F86\u6E90\u3002")})}</div>`}function Ua(e,t){return`<div class="db-options" role="radiogroup" aria-label="\u9078\u64C7\u8CC7\u6599\u5EAB">
    ${e.map(s=>{let a=Re(s.status);return`<label class="db-option">
          <input type="radio" name="database" value="${n(s.id)}" ${s.id===t?"checked":""} />
          <span class="db-option-body">
            <span class="db-option-top">
              <span class="db-option-name">${n(s.label)}</span>
              <span class="db-option-radio" aria-hidden="true"></span>
            </span>
            <span class="db-option-desc">${n(s.description||"")}</span>
            <span class="db-option-state">
              <span class="status-dot ${a.tone==="ok"?"is-ok":a.tone==="warn"?"is-warn":a.tone==="danger"?"is-danger":"is-idle"}" aria-hidden="true"></span>
              ${n(s.shortLabel||a.label)} \xB7 ${n(a.label)}
            </span>
          </span>
        </label>`}).join("")}
  </div>`}function za(e){return`<div class="sidebar-view-switch" role="tablist" aria-label="\u67E5\u8A62\u6216 schema">
    <button class="sidebar-view-button ${e==="query"?"is-active":""}"
      type="button" role="tab" aria-selected="${e==="query"}"
      data-action="sidebar-view" data-view="query">${$("search",13)}<span>\u67E5\u8A62</span></button>
    <button class="sidebar-view-button ${e==="schema"?"is-active":""}"
      type="button" role="tab" aria-selected="${e==="schema"}"
      data-action="sidebar-view" data-view="schema">${$("table",13)}<span>Schema</span></button>
  </div>`}function es(e,t,s=""){let a=Array.isArray(e.tables)?e.tables:[],r=a.length?a.map(i=>`<button class="schema-item ${String(i.id)===String(s||"")?"is-selected":""}" type="button"
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
  </div>`}function Ps(e,t){return`<div class="category-options" role="radiogroup" aria-label="\u8CC7\u6599\u985E\u578B">
    ${e.map(s=>{let a=s.id===t,r=s.id==="judgment"&&s.count!==void 0?`${c(s.count)} \u7B46\u5DF2\u7BE9\u9078\u5224\u6C7A`:s.description||"";return`<label class="category-option${a?" is-selected":""}">
          <input type="radio" name="category" value="${n(s.id)}" ${a?"checked":""} />
          <span class="category-option-body">
            <span class="category-option-label">${n(s.label)}</span>
            <span class="category-option-desc">${n(r)}</span>
          </span>
        </label>`}).join("")}
  </div>`}function Cs(e){return{postgres:"PostgreSQL \u67E5\u8A62\u4F7F\u7528\u53C3\u6578\u5316\u689D\u4EF6\u8207\u5206\u9801\uFF0C\u50C5\u8B80\u53D6\u8CC7\u6599\u3002",parquet:"Parquet \u67E5\u8A62\u76F4\u63A5\u6383\u63CF\u76EE\u524D\u6700\u65B0\u7684\u5FEB\u7167\uFF1B\u52FE\u9078\u539F\u59CB JSON \u6703\u589E\u52A0\u56DE\u50B3\u91CF\u8207\u6E32\u67D3\u6642\u9593\u3002",qdrant:"Qdrant \u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\uFF1B\u9700\u8981\u5148\u5B8C\u6210\u5411\u91CF\u7D22\u5F15\u3002\u6AA2\u7D22\u7D50\u679C\u53EA\u5305\u542B\u7D22\u5F15\u4E2D\u5BE6\u969B\u5B58\u5728\u7684\u5224\u6C7A\uFF0C\u4E0D\u6703\u7522\u751F\u865B\u69CB\u8CC7\u6599\u3002",indexeddb:"IndexedDB \u53EA\u5728\u9019\u500B\u700F\u89BD\u5668\u5167\u67E5\u8A62\uFF0C\u4E0D\u6703\u7D93\u904E\u4F3A\u670D\u5668\uFF1B\u6E05\u9664\u7DB2\u7AD9\u8CC7\u6599\u5F8C\u7D00\u9304\u6703\u6D88\u5931\u3002"}[e.id]||n(e.detail||"")}function Ga(e){return`<div class="report-empty">
    ${we({iconName:"table",title:"\u67E5\u8A62\u5831\u8868\u6703\u986F\u793A\u5728\u9019\u88E1",text:n({postgres:"\u9078\u64C7\u8CC7\u6599\u8868\u8207 metadata \u689D\u4EF6\uFF0C\u57F7\u884C\u5F8C\u6703\u7522\u751F SQL\u3001\u6458\u8981\u3001\u5206\u5E03\u8207\u8CC7\u6599\u5217\u3002",parquet:"\u9078\u64C7\u8CC7\u6599\u96C6\u8207\u56DE\u50B3\u6B04\u4F4D\uFF0C\u76F4\u63A5\u6383\u63CF\u539F\u59CB Parquet\u3002",qdrant:"\u8F38\u5165\u8A9E\u610F\u67E5\u8A62\u5F8C\uFF0C\u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5DF2\u5EFA\u7ACB\u5411\u91CF\u7D22\u5F15\u7684\u5224\u6C7A\uFF1B\u672A\u7D22\u5F15\u6642\u6703\u660E\u78BA\u986F\u793A\u72C0\u614B\u3002",indexeddb:"\u67E5\u8A62\u5B58\u5728\u9019\u500B\u700F\u89BD\u5668\u7684\u63D0\u554F\u7D00\u9304\u8207\u8A2D\u5B9A\uFF0C\u4E0D\u9700\u8981\u4F3A\u670D\u5668\u3002"}[e.id]||"\u8A2D\u5B9A\u689D\u4EF6\u5F8C\u57F7\u884C\u67E5\u8A62\u3002")})}
    <div class="query-hint-grid">
      <div class="query-hint">
        <strong>01 \xB7 \u9078\u64C7\u8CC7\u6599\u5EAB</strong>
        <span>\u4F7F\u7528\u5DE6\u5074 radio \u5207\u63DB PostgreSQL\u3001Parquet\u3001Qdrant \u6216 IndexedDB\u3002</span>
      </div>
      <div class="query-hint">
        <strong>02 \xB7 \u8A2D\u5B9A metadata</strong>
        <span>\u6B04\u4F4D\u6703\u4F9D\u8CC7\u6599\u5EAB\u8207\u8CC7\u6599\u8868\u52D5\u614B\u6539\u8B8A\uFF0C\u91CD\u8A2D\u53EF\u56DE\u5230\u9810\u8A2D\u503C\u3002</span>
      </div>
      <div class="query-hint">
        <strong>03 \xB7 \u57F7\u884C\u67E5\u8A62</strong>
        <span>\u53F3\u5074\u7522\u751F\u6458\u8981\u3001\u5206\u5E03\u3001\u5BE6\u969B\u67E5\u8A62\u8A9E\u53E5\u8207\u53EF\u532F\u51FA\u7684\u8CC7\u6599\u8868\u3002</span>
      </div>
    </div>
  </div>`}function ct(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${n(At(e))} \u67E5\u8A62\u4E2D</div>
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
  </div>`}function Lt(e,t){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${n(At(t))} \u67E5\u8A62\u5931\u6557</div>
        <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${X({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u67E5\u8A62\u7D50\u679C",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="retry">
          ${$("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function Qa(e){if(!e.length)return'<div class="report-empty-inline">\u9019\u6B21\u67E5\u8A62\u6C92\u6709\u53EF\u5448\u73FE\u7684\u5206\u5E03\u8CC7\u6599\u3002</div>';let t=Math.max(...e.map(s=>Number(s.value)||0),1);return`<div class="distribution">
    ${e.map(s=>{let a=Number(s.value)||0,r=Math.max(1.5,a/t*100);return`<div class="dist-row">
          <span class="dist-label" title="${n(s.label||"\u672A\u5206\u985E")}">${n(s.label||"\u672A\u5206\u985E")}</span>
          <span class="dist-track"><span class="dist-bar" style="width:${r.toFixed(1)}%"></span></span>
          <span class="dist-value">${c(a)}</span>
        </div>`}).join("")}
  </div>`}function Fs(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="law_documents"}function Ja(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="judgment_documents"}function Va(e){return e&&e.database==="qdrant"&&String(e.table||"").startsWith("judgment")}function Wa(e){let t=e._jid||e.jid;return t?`<button class="law-link judgment-link" type="button" data-action="open-judgment"
    data-jid="${n(String(t))}"
    title="\u6AA2\u8996\u300C${n(String(t))}\u300D\u7684\u5224\u6C7A\u539F\u6587">${n(String(t))}${$("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}var Ka={jid:"jid",court:"court",court_normalized:"court",title:"title",jdate:"jdate",matched_laws:"matched_laws",citation_count:"citation_count",full_text_length:"full_text_length"};function Ya(e,t,s,a=!1,r=!0,i=!1){let o=a?e.key:e.label||e.key,l=r?t?Ka[e.key]||e.key:i?e.key:null:null;if(!l)return`<th scope="col">${n(o)}</th>`;let m=s?.key===l,h=m?s.direction:null,w=h==="asc"?"ascending":h==="desc"?"descending":"none",f=h==="asc"?"\u2191":h==="desc"?"\u2193":"\u2195";return`<th scope="col" aria-sort="${w}">
    <button class="table-sort${m?" is-active":""}" type="button"
      data-action="sort-column" data-sort-key="${n(l)}"
      title="\u4F9D${n(o)}\u6392\u5E8F">
      <span>${n(o)}</span>
      <span class="table-sort-icon" aria-hidden="true">${f}</span>
    </button>
  </th>`}function Xa(e,t){if(!Fs(e)||!t)return null;let s=t._law_key||t.law_name;if(!s)return null;let a=e.meta?.dataset,r=t._law_source_type||(a&&a!=="all"?a:"");return{lawKey:String(s),sourceType:String(r||""),lawName:String(t.law_name||"")}}function Za(e,t,s){let a=e[t.key];return a==null||a===""?"\u2014":`<button class="law-link" type="button" data-action="open-law"
    data-law-key="${n(s.lawKey)}"
    data-law-source="${n(s.sourceType)}"
    data-law-name="${n(s.lawName)}"
    title="\u6AA2\u8996\u300C${n(String(a))}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${n(String(a))}${$("chevronRight",12,"law-link-icon")}</button>`}function Hs(e,{useColumnKeys:t=!1,sortable:s=!0,sortableAll:a=!1,searchValues:r=null,compact:i=!1}={}){let o=Array.isArray(e.columns)?e.columns:[],l=Array.isArray(e.rows)?e.rows:[],m=(e.page-1)*e.page_size,h=Fs(e),w=Ja(e),f=Va(e),v=e.meta?.sort||null,x=r?`<tr class="schema-search-row">
        <th scope="col" class="cell-index-head"></th>
        ${o.map(b=>`<th scope="col">
              <div class="schema-search-wrap">
                <input class="schema-search-input" type="search"
                  data-schema-search="${n(b.key)}"
                  value="${n(String(r[b.key]??""))}"
                  placeholder="\u641C\u5C0B ${n(b.key)}"
                  autocomplete="off" />
              </div>
            </th>`).join("")}
      </tr>`:"";return o.length?l.length?`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">${c(l.length)} rows \xB7 \u7B2C ${e.page} \u9801${h?" \xB7 \u9EDE\u9078\u6CD5\u898F\u540D\u7A31\u53EF\u6AA2\u8996\u5B8C\u6574\u689D\u6587":w?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u6B04\u4F4D\u6A19\u984C\u53EF\u6392\u5E8F":f?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u4F9D\u76F8\u4F3C\u5EA6\u6392\u5E8F":""}</span>
    </div>
    <div class="table-wrap">
      <table class="data-table${i?" is-compact":""}">
        <thead>${x}<tr>
          <th scope="col" class="cell-index-head">#</th>
          ${o.map(b=>Ya(b,w,v,t,s,a)).join("")}
        </tr></thead>
        <tbody>
          ${l.map((b,y)=>`<tr>
                <td class="cell-mono cell-empty cell-index">${m+y+1}</td>
                ${o.map(C=>{if((w||f)&&C.key==="jid")return`<td class="cell-jid">${Wa(b)}</td>`;let L=h&&C.key==="law_name"?Xa(e,b):null;if(L)return`<td>${Za(b,C,L)}</td>`;let E={date:"cell-date",datetime:"cell-datetime",duration:"cell-duration",number:"cell-number"}[C.type];return`<td${E?` class="${E}"`:""}>${bt(b[C.key],C.type||"text")}</td>`}).join("")}
              </tr>`).join("")}
        </tbody>
      </table>
    </div>`:`<div class="report-table-head">
        <span class="report-section-title">\u8CC7\u6599\u5217</span>
        <span class="muted" style="font-size:10px">0 rows</span>
      </div>
      ${we({iconName:"filter",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u8CC7\u6599",text:"\u653E\u5BEC\u65E5\u671F\u5340\u9593\u3001\u964D\u4F4E\u689D\u6587\u6578\u4E0B\u9650\uFF0C\u6216\u6E05\u9664\u95DC\u9375\u5B57\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}`:`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">\u6B64\u8CC7\u6599\u4F86\u6E90\u6C92\u6709\u8868\u683C\u6B04\u4F4D</span>
    </div>`}function en(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,r=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${r} \u9801 \xB7
      \u986F\u793A ${c(i)}\u2013${c(o)} / ${c(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Bs.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${$("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=r?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${$("chevronRight",13)}</button>
    </div>
  </div>`}function Us(e){return!Array.isArray(e)||!e.length?"":`<div class="warnings">${e.map(t=>`<div class="warning-line">${n(t)}</div>`).join("")}</div>`}function St(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.columns)?e.columns:[],a=Array.isArray(e.summary)?e.summary:[],r=Array.isArray(e.distribution)?e.distribution:[],i=Number(e.total)||0,o=e.query_text||"",l=e.database||"",m=e.status||"ok",h=e.meta?.table_label||e.table||e.label||"query result";return`<div class="report-card" data-database="${n(l)}">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT \xB7 ${n(String(l).toUpperCase())}</div>
        <div class="report-title">
          ${n(e.label||l)}
          ${Y(m)}
          <span class="chip">${n(h)}</span>
        </div>
        <div class="report-sub">
          ${c(i)} \u7B46\u7B26\u5408 \xB7
          ${F(e.duration_ms)} \xB7
          ${n(String(l).toUpperCase())} / ${n(String(e.table||"\u2014"))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${$("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${$("file",14)}<span>JSON</span></button>
      </div>
    </div>

    ${e.message?`<div class="report-alert">${X({tone:m==="not_configured"?"info":m==="danger"?"danger":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n(e.message)})}</div>`:""}

    ${a.length?`<div class="summary-strip">
            ${a.slice(0,4).map(w=>`<div class="summary-item">
                  <div class="summary-label">${n(w.label)}</div>
                  <div class="summary-value">${n(w.value)}</div>
                </div>`).join("")}
          </div>`:""}

    <div class="report-grid">
      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u7D50\u679C\u5206\u5E03</span>
          <span class="muted" style="font-size:9.5px">${r.length} groups</span>
        </div>
        ${Qa(r)}
      </div>
      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5BE6\u969B\u67E5\u8A62\u8A9E\u53E5</span>
          <span class="muted" style="font-size:9.5px">${n(e.database==="indexeddb"?"client-side":"read-only")}</span>
        </div>
        <div class="query-box">
          <pre class="query-code">${n(o||"\u2014")}</pre>
          <button class="btn btn-secondary btn-sm btn-copy" type="button" data-action="copy-query">
            ${$("copy",12)}<span>\u8907\u88FD</span>
          </button>
        </div>
        ${Us(e.warnings)}
      </div>
    </div>

    ${s.length||t.length?Hs(e,{compact:!0,sortableAll:!0,searchValues:e.meta?.searchable?e.meta.column_filters||{}:null}):""}
    ${i||s.length?en({...e,total:i,page:Number(e.page)||1,page_size:Number(e.page_size)||25}):""}
  </div>`}function Ns(e){return`<div class="report-card schema-preview">
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
  </div>`}function ts(e,t,{columnFilters:s={},searchEnabled:a=!1}={}){let r=Array.isArray(e.columns)?e.columns:[],i=Array.isArray(e.rows)?e.rows:[],o=e.message?`<div class="report-alert">${X({tone:e.status==="ok"?"info":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n(e.message)})}</div>`:"";return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW \xB7 ${n(String(e.database||"").toUpperCase())}</div>
        <div class="report-title">
          ${n(t||e.table||"\u8CC7\u6599\u8868")}
          ${Y(e.status||"ok")}
        </div>
        <div class="report-sub">
          ${n(String(e.database||""))} / ${n(String(e.table||"\u2014"))} \xB7 ${r.length} \u6B04\u4F4D \xB7 \u524D ${i.length} \u7B46
        </div>
      </div>
    </div>
    ${o}
    ${Hs({...e,page:1,page_size:10},{useColumnKeys:!0,sortable:!0,sortableAll:!0,searchValues:a?s:null})}
    ${Us(e.warnings)}
    <div class="schema-preview-footer">
      <span>\u9810\u89BD\u524D ${c(i.length)} \u7B46</span>
      <strong>\u5171 ${c(e.total)} \u7B46</strong>
    </div>
  </div>`}function Rs(e,t){return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW</div>
        <div class="report-title">${n(t||"\u8CC7\u6599\u8868")}</div>
        <div class="report-sub">\u7121\u6CD5\u8B80\u53D6\u8CC7\u6599\u8868\u9810\u89BD\u3002</div>
      </div>
    </div>
    ${X({tone:"danger",title:"\u8B80\u53D6\u5931\u6557",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
  </div>`}function tn(e){return`<div class="report-empty">
    ${we({iconName:"table",title:"\u9078\u64C7\u8CC7\u6599\u8868\u9810\u89BD",text:`\u5F9E\u5DE6\u5074 ${At(e)} \u7684 Schema \u6E05\u55AE\u9EDE\u9078\u8CC7\u6599\u8868\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6B04\u4F4D\u540D\u7A31\u3001\u524D 10 \u7B46\u8CC7\u6599\u8207\u7E3D\u7B46\u6578\u3002`})}
  </div>`}function ss(e){return e.is_current===!0?Y("ok","\u73FE\u884C"):e.law_abandon_note?Y("empty","\u5DF2\u5EE2\u6B62"):e.is_current===!1?Y("empty","\u6B77\u53F2\u7248\u672C"):Y("not_configured","\u72C0\u614B\u672A\u63D0\u4F9B")}function oe(e,t){return`<div class="law-meta-item">
    <div class="law-meta-label">${n(e)}</div>
    <div class="law-meta-value">${t||"\u2014"}</div>
  </div>`}function Xe(e){return e?Ne(e):"\u2014"}function sn(e){return e?.meta?.metadata_source==="postgresql"?"PostgreSQL metadata":e?.meta?.metadata_source==="parquet"?"Parquet snapshot":"\u2014"}function as(e,t){return t?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">${n(e)}</span>
    </div>
    <div class="law-text-block">${n(String(t).trim())}</div>
  </div>`:""}function an(e,t,{open:s=!1}={}){return t?`<details class="report-section law-disclosure" data-law-history ${s?"open":""}>
    <summary class="law-disclosure-summary">
      <span class="report-section-title">${n(e)}</span>
      <span class="law-disclosure-hint">\u9810\u8A2D\u6536\u5408 \xB7 \u9EDE\u64CA\u5C55\u958B</span>
      ${$("chevronDown",14,"law-disclosure-chevron")}
    </summary>
    <div class="law-text-block">${n(String(t).trim())}</div>
  </details>`:""}function nn(e){let t=Array.isArray(e)?e:[],s=t.map(a=>{let r=a?.name||a?.url||"";return r?a.url?`<a class="law-attachment" href="${n(a.url)}" target="_blank" rel="noopener noreferrer">
          ${$("file",12)}<span>${n(r)}</span>${$("external",11)}
        </a>`:`<span class="law-attachment">${$("file",12)}<span>${n(r)}</span></span>`:""}).filter(Boolean).join("");return s?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">\u9644\u4EF6</span>
      <span class="muted">${c(t.length)}</span>
    </div>
    <div class="law-attachment-list">${s}</div>
  </div>`:""}function zs(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function rn(e){let t=Array.isArray(e.articles)?e.articles:[],s=t.filter(o=>o.article_type==="C").length,a=t.length-s,r=s?`${c(a)} \u689D \xB7 ${c(s)} \u7AE0\u7BC0`:`${c(a)} \u689D`,i=t.map(o=>{let l=String(o.article_content||"").trim();if(!l)return"";if(o.article_type==="C")return`<div class="law-chapter">${n(l)}</div>`;let m=Oa[o.article_type]||o.article_type;return`<article class="law-article"
        data-article-no="${n(zs(o.article_no))}">
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
  </div>`}function on(){return`<div class="law-jump-float">
    <input class="input law-article-jump-input law-jump-input"
      id="law-article-jump-float" type="text" inputmode="numeric"
      autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
    <button class="btn btn-secondary btn-sm" type="button"
      data-action="jump-article" data-jump-input="law-article-jump-float">\u8DF3\u81F3</button>
  </div>`}function at(){return`<button class="btn btn-secondary btn-sm" type="button" data-action="back-to-results">
    ${$("chevronLeft",14)}<span>\u8FD4\u56DE\u67E5\u8A62\u7D50\u679C</span>
  </button>`}function ln(e){return`<div class="law-report">
    <div class="law-report-topbar">
      ${at()}
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
  </div>`}function cn(e,t){return`<div class="law-report">
    <div class="law-report-topbar">
      ${at()}
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
        ${X({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function dn(e){let t=Array.isArray(e.versions)?e.versions:[];if(t.length<1)return"";let s=e.selected_version_id??"";return`<label class="law-version-select">
    <span>\u689D\u6587\u7248\u672C</span>
    <select class="select" data-action="select-law-version" aria-label="\u9078\u64C7\u6CD5\u898F\u689D\u6587\u7248\u672C">
      ${t.map(a=>{let r=String(a.update_date||"").match(/\d{4}\/\d{1,2}\/\d{1,2}/)?.[0]||"",i=[`#${a.version_id}`,a.is_current?"\u76EE\u524D":"\u6B77\u53F2",r,a.article_count_for_law?`${c(a.article_count_for_law)} \u7B46`:"\u7121\u689D\u6587\u5FEB\u7167"].filter(Boolean).join(" \xB7 ");return`<option value="${n(a.version_id)}" ${String(a.version_id)===String(s)?"selected":""}>${n(i)}</option>`}).join("")}
    </select>
  </label>`}function un(e){let t=e.change_summary||{},s=Object.values(t).reduce((o,l)=>o+(Number(l)||0),0),a=Array.isArray(e.changes)?e.changes:[];if(!e.changes_available&&!s)return"";let r={added:"\u65B0\u589E",modified:"\u4FEE\u6539",removed:"\u79FB\u9664"},i=["added","modified","removed"].map(o=>`${r[o]} ${c(t[o]||0)}`).join(" \xB7 ");return`<details class="report-section law-version-changes">
    <summary>
      <span class="report-section-title">\u7248\u672C\u8B8A\u66F4</span>
      <span class="muted">${n(i)}</span>
    </summary>
    <div class="law-version-change-list">
      ${a.length?a.slice(0,20).map(o=>{let l=o.change_type==="added"?"badge-ok":o.change_type==="removed"?"badge-danger":"badge-warn",m=o.before_content?`<details><summary>\u8B8A\u66F4\u524D</summary><pre>${n(o.before_content)}</pre></details>`:"",h=o.after_content?`<details><summary>\u8B8A\u66F4\u5F8C</summary><pre>${n(o.after_content)}</pre></details>`:"";return`<div class="law-version-change">
                  <div class="law-version-change-head">
                    <span class="badge ${l}">${n(r[o.change_type]||o.change_type)}</span>
                    <strong>${n(o.article_no||o.article_key)}</strong>
                  </div>
                  ${m}${h}
                </div>`}).join(""):'<div class="report-empty-inline">\u6B64\u7248\u672C\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u8B8A\u66F4\u3002</div>'}
      ${e.changes_truncated?'<div class="report-empty-inline">\u50C5\u986F\u793A\u524D 20 \u7B46\u8B8A\u66F4\uFF1BAPI \u56DE\u50B3\u4E0A\u9650 200 \u7B46\u3002</div>':""}
    </div>
  </details>`}function pn(e,{database:t="",lawPage:s=1,historyOpen:a=!1}={}){let r=Array.isArray(e.warnings)?e.warnings:[],i=e.law_name||e.law_key||"\u6CD5\u898F",o=(Array.isArray(e.articles)?e.articles:[]).filter(y=>y.article_type!=="C").length,l=sn(e),m=e.meta?.articles_source==="postgresql"?"PostgreSQL \u689D\u6587\u7248\u672C":e.meta?.articles_source==="parquet"?"Parquet \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",h=e.meta?.snapshot||"",w=e.meta?.articles_source==="postgresql"&&e.selected_version_id!==null&&e.selected_version_id!==void 0?`\u689D\u6587\u7248\u672C #${e.selected_version_id}`:"",f=[l,m,w,h].filter(Boolean).join(" \xB7 "),v=e.source_type==="law"?"\u6CD5\u5F8B":e.source_type==="order"?"\u547D\u4EE4":e.source_type||"\u2014",x=e.version||{},b=[oe("\u6CD5\u898F\u4F4D\u968E",n(e.law_level||"\u2014")),oe("\u6CD5\u898F\u985E\u5225",n(e.law_category||"\u2014")),oe("\u7570\u52D5\u65E5\u671F",Xe(e.law_modified_date)),oe("\u751F\u6548\u65E5\u671F",Xe(e.law_effective_date)),oe("\u689D\u6587\u6578",c(e.article_count)),oe("\u8CC7\u6599\u72C0\u614B",ss(e)),oe("\u82F1\u8B6F\u540D\u7A31",n(e.eng_law_name||"\u2014")),oe("\u6CD5\u898F\u8B58\u5225",`<span class="mono">${n(e.law_key||"\u2014")}</span>`)];return x.first_seen_version_id!==null&&x.first_seen_version_id!==void 0&&b.push(oe("\u9996\u6B21\u6536\u9304\u7248\u672C",`#${n(x.first_seen_version_id)}`)),x.last_seen_version_id!==null&&x.last_seen_version_id!==void 0&&b.push(oe("\u6700\u5F8C\u6536\u9304\u7248\u672C",`#${n(x.last_seen_version_id)}`)),x.last_seen_at&&b.push(oe("\u6700\u5F8C\u6536\u9304\u6642\u9593",n(ne(x.last_seen_at)))),x.selected_version_id!==null&&x.selected_version_id!==void 0&&b.push(oe("\u689D\u6587\u7248\u672C",`#${n(x.selected_version_id)} \xB7 ${e.meta?.selected_version_is_current?"\u76EE\u524D":"\u6B77\u53F2"}`)),`<div class="law-report">
    <div class="law-report-topbar">
      ${at()}
      <span class="law-report-origin" title="${n(f)}">${n(f)}</span>
    </div>
    <div class="report-card law-report-card" data-database="${n(t)}">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT \xB7 ${n(String(t||l).toUpperCase())}</div>
          <div class="report-title">
            ${n(i)}
            ${ss(e)}
            <span class="chip">${n(v)}</span>
          </div>
          <div class="report-sub">
            ${n([e.law_level,e.law_category].filter(Boolean).join(" \xB7 ")||"\u2014")} \xB7 ${c(e.article_count)} \u689D \xB7 \u7570\u52D5 ${Xe(e.law_modified_date)}
          </div>
        </div>
        <div class="report-actions">
          ${dn(e)}
          ${e.law_url?`<a class="btn btn-secondary btn-sm" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">${$("external",14)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:""}
        </div>
      </div>

      ${r.length?`<div class="report-alert">${X({tone:e.status==="degraded"?"warn":"info",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r.map(y=>n(y)).join("<br />")})}</div>`:""}

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u689D\u6587\u6578</div>
          <div class="summary-value">${c(e.article_count)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u7570\u52D5\u65E5\u671F</div>
          <div class="summary-value">${Xe(e.law_modified_date)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u6CD5\u898F\u4F4D\u968E</div>
          <div class="summary-value">${n(e.law_level||"\u2014")}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u76EE\u524D\u72C0\u614B</div>
          <div class="summary-value">${ss(e)}</div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u6CD5\u898F\u8CC7\u8A0A</span>
          <span class="muted" style="font-size:9.5px">${n(l)}</span>
        </div>
        <div class="law-meta-grid">${b.join("")}</div>
      </div>

      ${un(e)}
      ${as("\u6CD5\u898F\u524D\u8A00",e.law_foreword)}
      ${an("\u6CD5\u898F\u6CBF\u9769",e.law_histories,{open:a})}
      ${as("\u751F\u6548\u8AAA\u660E",e.law_effective_note)}
      ${as("\u5EE2\u6B62\u8AAA\u660E",e.law_abandon_note)}
      ${nn(e.attachments)}
      ${rn(e)}
    </div>
    ${o>100?on():""}
  </div>`}function mn(e){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${at()}
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
  </div>`}function vn(e,t){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${at()}
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
        ${X({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function gn(e){let t=String(e||"").trim();return t?`<button class="law-link judgment-citation-law" type="button"
    data-action="open-law"
    data-law-key="${n(t)}"
    data-law-source=""
    data-law-name="${n(t)}"
    title="\u6AA2\u8996\u300C${n(t)}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${n(t)}${$("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}function fn(e){let t=new Map;for(let s of Array.isArray(e.citations)?e.citations:[]){let a=String(s.law_name||"").trim();if(!a)continue;t.has(a)||t.set(a,new Set);let r=String(s.article_no||"").trim();r&&t.get(a).add(r)}return t.size?`<div class="judgment-citation-groups">
    ${[...t.entries()].map(([s,a])=>`<div class="judgment-citation-group">
          ${gn(s)}
          <span class="judgment-citation-articles">${[...a].map(r=>n(r)).join("\u3001")||"\u2014"}</span>
        </div>`).join("")}
  </div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5F15\u7528\u660E\u7D30\u3002</div>'}function bn(e,{database:t="postgres"}={}){let s=Array.isArray(e.matched_laws)?e.matched_laws:[],a=e.title||e.jid||"\u5224\u6C7A",r=String(e.full_text||""),i=Number(e.full_text_length)||r.length||0,o=["PostgreSQL \u5224\u6C7A\u6587\u4EF6",e.source_archive].filter(Boolean).join(" \xB7 "),l=[oe("\u6848\u865F",n(e.jid||"\u2014")),oe("\u5E74\u5EA6",n(e.jyear||"\u2014")),oe("\u5B57\u5225",n(e.jcase||"\u2014")),oe("\u865F\u78BC",n(e.jno||"\u2014")),oe("\u6CD5\u9662",n(e.court||"\u2014")),oe("\u6848\u7531",n(e.title||"\u2014")),oe("\u88C1\u5224\u65E5\u671F",Xe(e.jdate)),oe("\u4F86\u6E90\u58D3\u7E2E\u6A94",n(e.source_archive||"\u2014")),oe("\u5168\u6587\u9577\u5EA6",`${c(i)} \u5B57`),oe("\u5F15\u7528\u6578",c(e.citation_count))];return e.import_run_id!==null&&e.import_run_id!==void 0&&l.push(oe("\u532F\u5165 Run",`#${n(e.import_run_id)}`)),`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${at()}
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
            ${n(e.court||"\u2014")} \xB7 ${Xe(e.jdate)} \xB7
            ${c(i)} \u5B57
          </div>
        </div>
        <div class="report-actions">
          ${e.pdf_url?`<a class="btn btn-secondary btn-sm" href="${n(e.pdf_url)}" target="_blank" rel="noopener noreferrer">${$("external",14)}<span>PDF</span></a>`:""}
        </div>
      </div>

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u88C1\u5224\u65E5\u671F</div>
          <div class="summary-value">${Xe(e.jdate)}</div>
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
        ${fn(e)}
      </div>

      <div class="report-section judgment-text-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5224\u6C7A\u539F\u6587</span>
          <span class="muted">${c(i)} \u5B57</span>
        </div>
        ${r?`<div class="judgment-fulltext">${n(r)}</div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5168\u6587\u3002</div>'}
      </div>
    </div>
  </div>`}function Is(e){return`"${(e==null?"":typeof e=="object"?JSON.stringify(e):String(e)).replace(/"/g,'""')}"`}function Mt(e){let t=e.columns||[],s=e.rows||[],a=[["#",...t.map(i=>i.label||i.key)].map(Is).join(",")],r=((Number(e.page)||1)-1)*(Number(e.page_size)||25);return s.forEach((i,o)=>{a.push([r+o+1,...t.map(l=>i[l.key])].map(Is).join(","))}),`\uFEFF${a.join(`\r
`)}`}function Tt(e){return{...e,rows:(e.rows||[]).map(t=>{let s={};for(let[a,r]of Object.entries(t))a.startsWith("_")||(s[a]=r);return s})}}function hn(e){return e==="rag"?"RAG \u63D0\u554F":e==="data"?"\u8CC7\u6599\u67E5\u8A62":e||"\u5176\u4ED6"}async function Ds(e,t){let s=performance.now(),a=Os(e,t),r=String(a.store||"query_history"),i=String(a.keyword||""),o=t.page,l=t.pageSize,m=[],h=[],w=[],f=[];if(r==="settings"){h=(await qs({keyword:i})).map(E=>({key:E.key,value:js(E.value),updated_at:E.updated_at})),w=[{key:"key",label:"\u8A2D\u5B9A\u9375",type:"mono"},{key:"value",label:"\u503C",type:"longtext"},{key:"updated_at",label:"\u66F4\u65B0\u6642\u9593",type:"datetime"}];let _=new Map;h.forEach(E=>{let z=String(E.key||"").split(".")[0]||"\u5176\u4ED6";_.set(z,(_.get(z)||0)+1)}),f=Array.from(_.entries()).map(([E,z])=>({label:E,value:z})).sort((E,z)=>z.value-E.value)}else{h=(await _t({keyword:i,limit:Ia})).map(E=>({kind:hn(E.kind),title:E.title,detail:E.detail,created_at:E.created_at})),w=[{key:"kind",label:"\u985E\u578B",type:"text"},{key:"title",label:"\u67E5\u8A62\u5167\u5BB9",type:"longtext"},{key:"detail",label:"\u6458\u8981",type:"longtext"},{key:"created_at",label:"\u6642\u9593",type:"datetime"}];let _=new Map;h.forEach(E=>_.set(E.kind,(_.get(E.kind)||0)+1)),f=Array.from(_.entries()).map(([E,z])=>({label:E,value:z})).sort((E,z)=>z.value-E.value)}let v=h.length,x=(o-1)*l,b=h.slice(x,x+l),y=Math.round(performance.now()-s),C=Ls();return C&&m.push("IndexedDB \u7121\u6CD5\u4F7F\u7528\uFF0C\u8CC7\u6599\u66AB\u5B58\u5728\u8A18\u61B6\u9AD4\uFF0C\u91CD\u65B0\u6574\u7406\u5F8C\u6703\u6D88\u5931\u3002"),{database:"indexeddb",label:"IndexedDB",status:C?"degraded":"ok",message:C?"\u700F\u89BD\u5668\u4E0D\u5141\u8A31\u4F7F\u7528 IndexedDB\uFF0C\u672C\u9801\u6539\u7528\u8A18\u61B6\u9AD4\u66AB\u5B58\u3002":null,table:r,columns:w,rows:b,total:v,page:o,page_size:l,duration_ms:y,summary:[{label:"\u7B26\u5408\u7B46\u6578",value:String(v)},{label:"\u76EE\u524D\u9801\u9762",value:`${b.length} \u7B46`},{label:"\u5132\u5B58\u6A21\u5F0F",value:yt()==="indexeddb"?"IndexedDB":"\u8A18\u61B6\u9AD4"},{label:"\u67E5\u8A62\u8017\u6642",value:`${y} ms`}],distribution:f,query_text:`INDEXEDDB OPEN 'judgment-console'
OBJECT STORE '${r}'
FILTER ${i?`keyword \u2248 '${i}'`:"1 = 1"}
ORDER BY created_at DESC
LIMIT ${l} OFFSET ${x}`,warnings:m,meta:{store:r,filters:a,client_side:!0}}}async function $n(e,t){let s=!1,a=null,r=[],i="law",o=null,l={},m=0,h=25,w="query",f=null,v=null,x=0,b=[],y=null,C=-1,L=0,_=null,E=null;e.innerHTML=`<section class="page data-page">
    <div class="page-header">
      <div class="data-page-heading">
        <div class="eyebrow">DATA EXPLORER</div>
        <div class="data-title-line">
          <h1 class="page-title">\u8CC7\u6599\u5EAB\u67E5\u8A62\u8207\u5831\u8868</h1>
          <p class="page-subtitle data-page-subtitle">\u5F9E\u5DE6\u5074\u5207\u63DB\u300C\u6CD5\u898F\u547D\u4EE4\u300D\u6216\u300C\u5224\u6C7A\u300D\uFF0C\u518D\u9078\u64C7\u8CC7\u6599\u5EAB\u8207\u8CC7\u6599\u8868\uFF1B\u5224\u6C7A\u53EA\u5305\u542B\u547D\u4E2D\u91D1\u878D\u6CD5\u898F\u6E05\u55AE\u7684\u6587\u4EF6\u3002</p>
        </div>
      </div>
      <div class="page-actions">
        <span class="badge badge-neutral badge-mono" id="catalog-meta">CATALOG \xB7 \u8B80\u53D6\u4E2D</span>
        <button class="btn btn-secondary" type="button" id="refresh-catalog">
          ${$("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
    <div class="data-layout">
      <aside class="card query-sidebar" id="query-sidebar" aria-label="\u67E5\u8A62\u689D\u4EF6">
        <div id="category-switch"></div>
        <div id="db-options-wrap">
          <div style="padding:16px">
            <div class="skeleton skeleton-line" style="width:86%"></div>
            <div class="skeleton skeleton-line" style="width:62%"></div>
          </div>
        </div>
        <div id="sidebar-view-switch"></div>
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
  </section>`;let z=e.querySelector("#query-sidebar"),Q=e.querySelector("#category-switch"),Z=e.querySelector("#db-options-wrap"),ie=e.querySelector("#sidebar-view-switch"),I=e.querySelector("#filter-area"),P=e.querySelector("#schema-area"),k=e.querySelector("#query-main"),T=e.querySelector("#schema-suggest-popover"),B=e.querySelector("#catalog-meta"),J=e.querySelector("#refresh-catalog"),$e=d=>r.find(p=>p.id===d),qe=()=>$e(i)?.databases||[],ue=d=>qe().find(p=>p.id===d),ye=(d,p)=>`${d}:${p}`,H=(d,p=i)=>l[ye(p,d.id)],ce=(d,p)=>{Ts(d,p).catch(()=>{})},je=()=>{if(!a){B.textContent="CATALOG \xB7 \u96E2\u7DDA",B.className="badge badge-danger badge-mono";return}let d=qe(),p=d.filter(S=>S.available).length,g=$e(i);B.textContent=`CATALOG \xB7 ${g?.label||i} \xB7 ${p}/${d.length} \u53EF\u7528`,B.className="badge badge-neutral badge-mono"},Se=d=>{k.innerHTML=Ga(d)},Ee=()=>{let d=_?.returnScroll??E?.returnScroll;_=null,E=null;let p=ue(o),g=p?H(p):null;w==="schema"&&v?.result?k.innerHTML=ts(v.result,u(p,v.tableId),{columnFilters:v.columnFilters||{},searchEnabled:p.id==="postgres"||p.id==="parquet"}):g?.result?k.innerHTML=St(g.result):p&&Se(p),typeof d=="number"&&window.requestAnimationFrame(()=>window.scrollTo({top:d,behavior:"smooth"}))},Ae=(d="law-article-jump")=>{let p=k.querySelector(`#${d}`),g=zs(p?.value);if(!g){D("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),p?.focus();return}let M=[...k.querySelectorAll("[data-article-no]")].find(A=>A.dataset.articleNo===g);if(!M){D(`\u627E\u4E0D\u5230\u7B2C ${g} \u689D\u3002`,"warn");return}M.scrollIntoView({behavior:"instant",block:"center"}),M.classList.add("is-jump-target"),window.setTimeout(()=>M.classList.remove("is-jump-target"),2400)},Oe=async({lawKey:d,sourceType:p="",lawName:g="",versionId:S=""})=>{let M=ue(o),A=M?H(M):null,j=w==="schema"?v?.result:null;if(!M||!A?.result&&!j||!d)return;let K=++m;_={seq:K,lawKey:d,sourceType:p,lawName:g,versionId:S?String(S):"",page:1,detail:null,database:M.id,returnScroll:window.scrollY},E=null,k.innerHTML=ln(g||d),k.scrollIntoView({behavior:"smooth",block:"start"});try{let pe=await U.lawDetail(d,p,_.versionId);if(s||!_||_.seq!==K)return;_.detail=pe,_.page=1,k.innerHTML=pn(pe,{database:_.database,lawPage:_.page})}catch(pe){if(s||!_||_.seq!==K)return;k.innerHTML=cn(pe,g||d),D(pe.message||"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868\u3002","danger")}},N=async({jid:d})=>{let p=ue(o),g=p?H(p):null,S=w==="schema"?v?.result:null;if(!p||!g?.result&&!S||!d)return;let M=++m;_=null;let A=p.id==="parquet"?"parquet":"postgres";E={seq:M,jid:d,detail:null,database:p.id,source:A,returnScroll:window.scrollY},k.innerHTML=mn(d),k.scrollIntoView({behavior:"smooth",block:"start"});try{let j=await U.judgmentDetail(d,A);if(s||!E||E.seq!==M)return;E.detail=j,k.innerHTML=bn(j,{database:E.database})}catch(j){if(s||!E||E.seq!==M)return;k.innerHTML=vn(j,d),D(j.message||"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587\u3002","danger")}},G=(d,p)=>`${i}:${d.id}:${p}`,u=(d,p)=>(d.tables||[]).find(g=>g.id===p)?.label||p,q=(d,p,{sort:g=null,columnFilters:S={}}={})=>{let M={column_filters:S};return d.id==="postgres"?(M.table=p,M.schema_preview=!0):d.id==="parquet"&&i==="judgment"?(M.table="judgment_documents",M.columns=Ba):d.id==="parquet"&&(M.dataset="all",M.columns=Da),g?.key&&(M.sort=`${g.key}:${g.direction}`),M},R=async(d,p,{sort:g=null,columnFilters:S={}}={})=>{if(!p)return;Me();let M=G(d,p),A=++x;f={tableId:p},v={key:M,tableId:p,loading:!0,result:null,error:null,sort:g,columnFilters:S},P.innerHTML=es(d,$e(i)?.label||i,p),k.innerHTML=Ns(u(d,p));try{let j;if(d.id==="indexeddb"){let K=kt(d,10);K.values.store=p,K.page=1,j=await Ds(d,K)}else d.id==="qdrant"?j={database:"qdrant",label:"Qdrant",status:"not_configured",message:"Qdrant collection \u9700\u8981\u8A9E\u610F\u67E5\u8A62\uFF1BSchema \u50C5\u63D0\u4F9B collection \u540D\u7A31\uFF0C\u4E0D\u5217\u51FA\u524D 10 \u7B46\u8CC7\u6599\u3002",table:p,columns:[],rows:[],total:0,page:1,page_size:10,duration_ms:0,summary:[],distribution:[],query_text:"",warnings:[],meta:{}}:(j=await U.query({database:d.id,filters:q(d,p,{sort:g,columnFilters:S}),page:1,pageSize:10}),g?.key&&(j.meta={...j.meta||{},sort:g}));if(s||A!==x)return;v={key:M,tableId:p,loading:!1,result:j,error:null,sort:g,columnFilters:S},w==="schema"&&f?.tableId===p&&(P.innerHTML=es(d,$e(i)?.label||i,p),k.innerHTML=ts(j,u(d,p),{columnFilters:S,searchEnabled:d.id==="postgres"||d.id==="parquet"}))}catch(j){if(s||A!==x)return;v={key:M,tableId:p,loading:!1,result:null,error:j,sort:g,columnFilters:S},w==="schema"&&f?.tableId===p&&(k.innerHTML=Rs(j,u(d,p)))}},te=()=>{let d=ue(o);if(!d)return null;if(w==="schema"&&v?.result)return{db:d,tableId:v.tableId,columnFilters:v.columnFilters||{},sort:v.sort||null,mode:"schema"};let p=d?H(d):null,g=p?.result;return g&&(d.id==="postgres"||d.id==="parquet")?{db:d,tableId:g.table,columnFilters:p.columnFilters||{},sort:p.sort||null,mode:"query"}:null},ae=(d,p,g)=>{if(!d)return;let S=`${d.db.id}:${d.tableId}:${p}`,M=ee.get(S);M&&(window.clearTimeout(M),ee.delete(S)),Me();let A={...d.columnFilters||{}},j=String(g||"").trim();if(j?A[p]=j:delete A[p],d.mode==="schema"){R(d.db,d.tableId,{sort:d.sort,columnFilters:A});return}let K=H(d.db);K.columnFilters=A,K.page=1,me(1)},ee=new Map,le=()=>{L+=1,b=[],y=null,C=-1,T&&(T.hidden=!0,T.innerHTML="")},De=(d,p)=>{let g=String(d||""),S=g.toLocaleLowerCase(),M=String(p||"").toLocaleLowerCase(),A=new Array(g.length).fill(!1),j=(de,Te)=>{for(let be=de;be<de+Te;be+=1)be>=0&&be<A.length&&(A[be]=!0)},K=S.indexOf(M);if(K>=0)for(;K>=0;)j(K,M.length),K=S.indexOf(M,K+M.length);else{let de=[];for(let Te of M.match(/[一-鿿]{2,}/g)||[])for(let be=0;be<Te.length-1;be+=1)de.push(Te.slice(be,be+2));de.push(...M.match(/[a-z0-9]+/g)||[]);for(let Te of de){let be=S.indexOf(Te);for(;be>=0;)j(be,Te.length),be=S.indexOf(Te,be+Te.length)}}let pe="",ve=0;for(;ve<g.length;)if(A[ve]){let de=ve;for(;de<g.length&&A[de];)de+=1;pe+=`<mark>${n(g.slice(ve,de))}</mark>`,ve=de}else{let de=ve;for(;de<g.length&&!A[de];)de+=1;pe+=n(g.slice(ve,de)),ve=de}return pe||n(g)},V=(d,p)=>{if(!T)return;let g=d.getBoundingClientRect(),S=Math.min(420,Math.max(220,g.width)),M=Math.min(360,34+p*30),A=g.bottom+4;A+M>window.innerHeight-8&&(A=Math.max(8,g.top-M-4));let j=Math.min(window.innerWidth-S-8,Math.max(8,g.left));T.style.width=`${S}px`,T.style.left=`${j}px`,T.style.top=`${A}px`},fe=d=>{if(!T)return;let p=[...T.querySelectorAll(".schema-suggest-item")];p.length&&(C=Math.max(0,Math.min(p.length-1,d)),p.forEach((g,S)=>{g.classList.toggle("is-active",S===C)}),p[C].scrollIntoView({block:"nearest"}))},xe=d=>{let p=b[d],g=y;!p||!g||(le(),ae(g,g.column,p))},Le=async(d,p,g,S)=>{if(!d||!g.trim()){le();return}let M=++L;y={...d,column:p,input:S},C=-1;try{let A=await U.schemaSuggest({database:d.db.id,table:d.tableId,column:p,query:g,limit:1e3});if(M!==L||document.activeElement!==S||!T)return;let j=Array.isArray(A.values)?A.values:[];if(b=j,!j.length){le();return}let K=Number(A.total)>j.length?`\u5171 ${c(A.total)} \u500B\u7B26\u5408\uFF0C\u986F\u793A\u524D ${c(j.length)} \u500B`:`\u5171 ${c(A.total)} \u500B\u7B26\u5408`;T.innerHTML=`<div class="schema-suggest-head">${n(K)}</div>${j.map((pe,ve)=>`<button class="schema-suggest-item" type="button"
            data-schema-suggest-index="${ve}"
            title="${n(pe)}">${De(pe,g)}</button>`).join("")}`,V(S,j.length),T.hidden=!1}catch{le()}},Me=()=>{let d=document.activeElement;d instanceof HTMLElement&&d.matches("[data-schema-search]")&&d.blur(),le()},Pe=(d,{resetReport:p=!1}={})=>{Me();let g=H(d);if(Q.innerHTML=Ps(r,i),Z.innerHTML=Ua(qe(),d.id),ie.innerHTML=za(w),w==="schema"?(I.hidden=!0,I.innerHTML="",P.hidden=!1,P.innerHTML=es(d,$e(i)?.label||i,f?.tableId||"")):(P.hidden=!0,P.innerHTML="",I.hidden=!1,I.innerHTML=`${Es(d)}${Xt(d,g)}<div class="sidebar-note">${Cs(d)}</div>`),je(),w==="schema"){let S=f?G(d,f.tableId):"";if(v&&v.key===S){let M=u(d,v.tableId);v.loading?k.innerHTML=Ns(M):v.error?k.innerHTML=Rs(v.error,M):k.innerHTML=ts(v.result,M,{columnFilters:v.columnFilters||{},searchEnabled:d.id==="postgres"||d.id==="parquet"})}else k.innerHTML=tn(d);return}p?Se(d):g.result?k.innerHTML=St(g.result):Se(d)},mt=(d,{persist:p=!0,resetReport:g=!1}={})=>{let S=qe(),M=S.find(j=>j.id===d)||S[0];if(!M)return;_=null,E=null,f=null,v=null,x+=1,o=M.id;let A=ye(i,M.id);l[A]||(l[A]=kt(M,h)),Pe(M,{resetReport:g}),p&&(ce(`data.last_database.${i}`,M.id),ce("data.last_category",i))},vt=(d,{persist:p=!0,resetReport:g=!0,databaseId:S=null}={})=>{let M=$e(d)||r[0];if(!M)return;i=M.id,_=null,E=null;let A=M.databases||[],j=S&&A.find(K=>K.id===S)||A.find(K=>K.id===o)||A[0];if(o=j?.id||null,!j){Q.innerHTML=Ps(r,i),Z.innerHTML=`<div class="sidebar-notice">${X({tone:"warn",title:"\u6C92\u6709\u53EF\u7528\u7684\u8CC7\u6599\u4F86\u6E90",text:"\u9019\u500B\u985E\u5225\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u5EAB\u9078\u9805\u3002"})}</div>`,I.innerHTML="",je();return}mt(j.id,{persist:!1,resetReport:g}),p&&(ce("data.last_category",M.id),ce(`data.last_database.${M.id}`,j.id))},Bt=d=>{let p=H(d),g=I.querySelector("#data-filter-form");g&&(p.values=xt(g,d,p))},me=async(d=null)=>{let p=ue(o);if(!p)return;Me();let g=H(p);Bt(p),d!==null&&(g.page=d),(!Number.isFinite(g.page)||g.page<1)&&(g.page=1);let S=++m;_=null,E=null,k.innerHTML=ct(p);let M=I.querySelector("#run-query");W(M,!0,"\u67E5\u8A62\u4E2D\u2026");try{let A;if(p.id==="indexeddb"?A=await Ds(p,g):A=await U.query({database:p.id,filters:Zt(p,g),page:g.page,pageSize:g.pageSize}),s||S!==m)return;A.meta={...A.meta||{},column_filters:g.columnFilters||{},searchable:p.id==="postgres"||p.id==="parquet",sort:g.sort||A.meta?.sort||null},g.result=A,g.page=Number(A.page)||g.page,g.pageSize=Number(A.page_size)||g.pageSize,k.innerHTML=St(A);let j=$e(i)?.label||i;await wt({kind:"data",title:`${j} \xB7 ${p.label} \xB7 ${A.table||A.label||"query"}`,detail:`${c(A.total)} \u7B46 \xB7 ${F(A.duration_ms)}`,payload:{category:i,database:p.id,filters:Zt(p,g),page:g.page,page_size:g.pageSize}}),ce("data.last_query",{category:i,database:p.id,filters:Zt(p,g),page:g.page,page_size:g.pageSize,at:new Date().toISOString()})}catch(A){if(s||S!==m)return;k.innerHTML=Lt(A,p),D(A.message||"\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{!s&&S===m&&W(M,!1)}},Qe=async()=>{J.disabled=!0,W(J,!0,"\u6574\u7406\u4E2D\u2026");try{let[d,p,g,S,M]=await Promise.all([U.catalog(),lt("data.last_category","law"),lt("data.last_database.law","postgres"),lt("data.last_database.judgment","postgres"),lt("data.page_size",25)]);if(s)return;a=d,r=Array.isArray(a.categories)?a.categories:[],h=Bs.includes(Number(M))?Number(M):25;for(let K of r)for(let pe of K.databases||[]){let ve=ye(K.id,pe.id);l[ve]||(l[ve]=kt(pe,h))}let A=r.find(K=>K.id===p)||r[0];if(!A){Q.innerHTML="",Z.innerHTML=`<div class="sidebar-notice">${X({tone:"danger",title:"\u6C92\u6709\u53EF\u7528\u7684\u5206\u985E",text:"Catalog \u6C92\u6709\u56DE\u50B3\u6CD5\u898F\u547D\u4EE4\u6216\u5224\u6C7A\u5206\u985E\u3002"})}</div>`;return}let j=A.id==="judgment"?S:g;if(i=A.id,o=null,vt(A.id,{persist:!1,resetReport:!0,databaseId:j}),s)return;D("\u8CC7\u6599\u5EAB catalog \u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(d){if(s)return;a=null,r=[],Q.innerHTML="",je(),Z.innerHTML=`<div class="sidebar-notice">${X({tone:"danger",title:"\u7121\u6CD5\u8B80\u53D6 catalog",text:n(d.message||"\u8ACB\u78BA\u8A8D API \u662F\u5426\u555F\u52D5\u3002")})}
      <button class="btn btn-secondary btn-sm" type="button" id="catalog-retry" style="margin-top:10px">
        ${$("refresh",14)}<span>\u91CD\u8A66</span>
      </button></div>`,k.innerHTML=`<div class="report-empty">${we({iconName:"server",title:"API \u76EE\u524D\u7121\u6CD5\u9023\u7DDA",text:"\u67E5\u8A62\u5831\u8868\u9700\u8981 FastAPI \u63D0\u4F9B catalog \u8207\u8CC7\u6599\u67E5\u8A62 API\u3002\u8ACB\u78BA\u8A8D judgment-web \u5DF2\u555F\u52D5\u3002"})}</div>`}finally{s||(J.disabled=!1,W(J,!1))}};z.addEventListener("change",d=>{let p=d.target;if(p.name==="category"){vt(p.value);return}if(p.name==="database"){mt(p.value);return}let g=ue(o);if(!g)return;let S=H(g),M=I.querySelector("#data-filter-form");!M||!p.name||(S.values=xt(M,g,S),S.page=1,p.name==="table"&&(_=null,E=null,S.sort=null,S.columnFilters={},S.result=null,I.innerHTML=Xt(g,S),Se(g)))}),z.addEventListener("input",d=>{let p=ue(o);if(!p)return;let g=I.querySelector("#data-filter-form");if(!g||!d.target.name||d.target.name==="table")return;let S=H(p);S.values=xt(g,p,S)}),z.addEventListener("submit",d=>{d.target.id==="data-filter-form"&&(d.preventDefault(),me(1))}),z.addEventListener("click",d=>{let p=d.target.closest("[data-action]"),g=p?.dataset.action;if(g==="sidebar-view"){let S=ue(o);if(!S)return;let M=H(S),A=I.querySelector("#data-filter-form");A&&w==="query"&&(M.values=xt(A,S,M)),w=p.dataset.view==="schema"?"schema":"query",Pe(S);return}if(g==="select-schema-table"){let S=ue(o);if(!S)return;R(S,p.dataset.tableId||"");return}if(g==="reset"){let S=ue(o);if(!S)return;_=null,E=null;let M=H(S);l[ye(i,S.id)]=kt(S,M.pageSize),I.innerHTML=`${Es(S)}${Xt(S,l[ye(i,S.id)])}<div class="sidebar-note">${Cs(S)}</div>`,Se(S),D("\u5DF2\u91CD\u8A2D\u9019\u500B\u8CC7\u6599\u5EAB\u7684\u67E5\u8A62\u689D\u4EF6\u3002","info",2400);return}d.target.closest("#catalog-retry")&&Qe()}),k.addEventListener("input",d=>{let p=d.target.closest("[data-schema-search]");if(!p)return;let g=te();if(!g)return;let S=p.dataset.schemaSearch||"",M=p.value,A=`${g.mode}:${g.db.id}:${g.tableId}:${S}`,j=ee.get(A);if(j&&window.clearTimeout(j),!M.trim()){ee.delete(A),le(),ae(g,S,"");return}let K=window.setTimeout(()=>{ee.delete(A),Le(g,S,M,p)},250);ee.set(A,K)}),k.addEventListener("keydown",d=>{let p=d.target.closest("[data-schema-search]");if(!p)return;let g=te();if(g){if(d.key==="Escape"){le();return}if(d.key==="ArrowDown"||d.key==="ArrowUp"){if(!T||T.hidden)return;d.preventDefault();let S=d.key==="ArrowDown"?1:-1;fe(C<0?S>0?0:b.length-1:C+S);return}if(d.key==="Enter"){if(d.preventDefault(),T&&!T.hidden&&C>=0){xe(C);return}ae(g,p.dataset.schemaSearch||"",p.value)}}}),T?.addEventListener("mousedown",d=>{d.preventDefault()}),T?.addEventListener("click",d=>{let p=d.target.closest("[data-schema-suggest-index]");p&&xe(Number(p.dataset.schemaSuggestIndex))});let fs=d=>{d.target.closest("[data-schema-search]")||T?.contains(d.target)||le()};return document.addEventListener("click",fs),window.addEventListener("scroll",le,!0),window.addEventListener("resize",le),k.addEventListener("keydown",d=>{d.target.matches(".law-jump-input")&&d.key==="Enter"&&(d.preventDefault(),Ae(d.target.id))}),k.addEventListener("click",async d=>{let p=d.target.closest("[data-action]");if(!p)return;let g=p.dataset.action,S=ue(o),M=S?H(S):null,A=M?.result;if(g==="back-to-results"){Ee();return}if(g==="open-law"){Oe({lawKey:p.dataset.lawKey||"",sourceType:p.dataset.lawSource||"",lawName:p.dataset.lawName||""});return}if(g==="open-judgment"){N({jid:p.dataset.jid||""});return}if(g==="jump-article"){Ae(p.dataset.jumpInput||"law-article-jump");return}if(g==="sort-column"){let j=p.dataset.sortKey||"";if(!j||!S)return;if(w==="schema"&&v?.result){let ve=v.sort,de=j==="jdate"||j==="law_modified_date"||j==="article_count"||j==="citation_count"||j==="full_text_length"||j==="created_at"||j==="updated_at",Te=ve?.key===j?ve.direction==="asc"?"desc":"asc":de?"desc":"asc";R(S,v.tableId,{sort:{key:j,direction:Te},columnFilters:v.columnFilters||{}});return}if(!M)return;let K=M.sort,pe=K?.key===j?K.direction==="asc"?"desc":"asc":j==="jdate"?"desc":"asc";M.sort={key:j,direction:pe},me(1);return}if(g==="retry"){me(M?.page||1);return}if(A){if(g==="prev-page"){me(Math.max(1,Number(A.page)-1));return}if(g==="next-page"){let j=Math.max(1,Math.ceil(Number(A.total)/Number(A.page_size)));me(Math.min(j,Number(A.page)+1));return}if(g==="copy-query"){let j=await ht(A.query_text||"");D(j?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",j?"ok":"warn");return}if(g==="export-json"){let j=`${A.database}-${A.table||"query"}-page-${A.page}.json`;ze(j,JSON.stringify(Tt(A),null,2),"application/json;charset=utf-8"),D(`\u5DF2\u532F\u51FA ${j}`,"ok");return}if(g==="export-csv"){let j=`${A.database}-${A.table||"query"}-page-${A.page}.csv`;ze(j,Mt(A),"text/csv;charset=utf-8"),D(`\u5DF2\u532F\u51FA ${j}`,"ok")}}}),k.addEventListener("change",d=>{let p=d.target.closest("[data-action='select-law-version']");if(p&&_){Oe({lawKey:_.lawKey,sourceType:_.sourceType,lawName:_.lawName,versionId:p.value});return}if(!d.target.matches("[data-page-size]"))return;let g=ue(o);if(!g)return;let S=H(g);S.pageSize=Number(d.target.value)||25,S.page=1,ce("data.page_size",S.pageSize),me(1)}),J.addEventListener("click",()=>{Qe()}),await Qe(),t&&typeof t.setTitle=="function"&&t.setTitle("\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"),()=>{s=!0;for(let d of ee.values())window.clearTimeout(d);ee.clear(),le(),document.removeEventListener("click",fs),window.removeEventListener("scroll",le,!0),window.removeEventListener("resize",le)}}var Js=[10,25,50,100],yn=[{value:"started_at:desc",label:"Timestamp \u65B0 \u2192 \u820A"},{value:"started_at:asc",label:"Timestamp \u820A \u2192 \u65B0"},{value:"duration_ms:desc",label:"\u8017\u6642\u591A \u2192 \u5C11"},{value:"duration_ms:asc",label:"\u8017\u6642\u5C11 \u2192 \u591A"}];function is(){return{process:"",module:"",status:"",method:"",model:"",keyword:"",from_date:"",to_date:"",min_duration:"",sort:"started_at:desc"}}function wn(e,t=e){return`<option value="${n(e)}">${n(t)}</option>`}function dt(e,t,s,a,r=""){return`<div class="field">
    <label class="field-label" for="performance-${e}">
      <span>${n(t)}</span>
      <span class="field-tag">${n(e)}</span>
    </label>
    <select class="select" id="performance-${e}" name="${n(e)}">
      ${wn("","\u5168\u90E8")}
      ${s.map(i=>`<option value="${n(i)}" ${String(i)===String(a)?"selected":""}>${n(i)}</option>`).join("")}
    </select>
    ${r?`<span class="field-help">${n(r)}</span>`:""}
  </div>`}function _n(e,t){let s=yn.map(a=>`<option value="${a.value}" ${a.value===t.sort?"selected":""}>${a.label}</option>`).join("");return`
    ${dt("process","\u7A0B\u5E8F",e.processes||[],t.process)}
    ${dt("module","\u6A21\u7D44",e.modules||[],t.module)}
    ${dt("model","\u6A21\u578B",e.models||[],t.model)}
    ${dt("status","\u72C0\u614B",e.statuses||[],t.status)}
    ${dt("method","\u65B9\u6CD5",e.methods||[],t.method)}
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
    </div>`}function Gs(){let e=document.getElementById("performance-filter-form");if(!e)return is();let t=new FormData(e);return{process:String(t.get("process")||""),module:String(t.get("module")||""),status:String(t.get("status")||""),method:String(t.get("method")||""),model:String(t.get("model")||""),keyword:String(t.get("keyword")||"").trim(),from_date:String(t.get("from_date")||""),to_date:String(t.get("to_date")||""),min_duration:String(t.get("min_duration")||""),sort:String(t.get("sort")||"started_at:desc")}}function Vs(e){if(e==null)return"null";if(typeof e=="object")try{let t=JSON.stringify(e);return t.length>160?`${t.slice(0,157)}\u2026`:t}catch{return String(e)}return String(e)}function kn(e){if(!e)return"";let t=new Date(e);if(Number.isNaN(t.getTime()))return"";let s=String(t.getHours()).padStart(2,"0"),a=String(t.getMinutes()).padStart(2,"0"),r=String(t.getSeconds()).padStart(2,"0"),i=String(t.getMilliseconds()).padStart(3,"0");return`${s}:${a}:${r}.${i}`}function xn(e){let t=String(e?.module||"");return t.includes("static")||t.includes("frontend")?"is-client":t.includes("judgment.rag")?"is-rag":t.includes("judgment.web.app")?"is-api":t.includes("judgment.web.query")?"is-data":t.includes("judgment.judgment_index")?"is-index":"is-other"}function Sn(e){let t=new Map(e.map(a=>[a.seq,a.parent_seq])),s=new Map;for(let a of e){if(Number.isInteger(a.depth)){s.set(a.seq,a.depth);continue}let r=0,i=a.parent_seq,o=0;for(;i&&t.has(i)&&o<20;)r+=1,i=t.get(i),o+=1;s.set(a.seq,r)}return s}function An(e){let t=Object.entries(e||{});if(!t.length)return'<span class="muted">\u7121\u53C3\u6578</span>';let s=t.slice(0,8),a=t.length-s.length;return`<div class="flow-param-list">${s.map(([r,i])=>`<span class="flow-param">
        <span class="flow-param-key">${n(r)}</span>
        <span class="flow-param-value">${n(Vs(i))}</span>
      </span>`).join("")}${a>0?`<span class="flow-param-more">+${a}</span>`:""}</div>`}function Ln(e){let t=new Map,s=Math.max(0,Number(e[0]?.offset_ms)||0);return e.forEach((a,r)=>{let i=Math.max(0,Number(a.offset_ms)||0),o=Math.max(0,Number(a.duration_ms)||0),l=e[r+1],m=l?Math.max(i,Number(l.offset_ms)||i):null,h=m===null?i+o:m,w=Math.max(0,h-i),f=Math.max(0,h-s);t.set(a.seq,{offset:i,duration:o,lap:w,cumulative:f})}),t}function Mn(e,t,s,a){let r=a.get(e.seq)||{},i=Math.max(0,Number(r.duration)||0),o=Math.max(0,Number(r.offset)||0),l=Math.max(0,Number(r.lap)||0),m=Math.max(0,Number(r.cumulative)||0),h=Math.max(t,o+i,1),w=Math.min(100,o/h*100),f=Math.min(100-w,Math.max(.6,l/h*100)),v=s.get(e.seq)||0,b=kn(e.started_at)||`+${o.toFixed(0)} ms`,y=e.started_at?`\u958B\u59CB\uFF1A${ne(e.started_at)} \xB7 +${o.toFixed(1)} ms`:`\u958B\u59CB\uFF1A+${o.toFixed(1)} ms`;return`<div class="flow-segment ${e.status==="error"?"is-error":""}" style="--depth:${Math.min(v,8)}">
    <div class="flow-segment-head">
      <span class="flow-seq">#${n(String(e.seq??"\u2014"))}</span>
      <span class="flow-segment-name">${n(e.name||"unnamed")}</span>
      <span class="flow-segment-start" title="${n(y)}">${n(b)}</span>
      <span class="flow-segment-duration" title="\u8DDD\u4E0B\u4E00\u9EDE ${F(l)}\uFF1B\u7D2F\u8A08 ${F(m)}">${F(l)}</span>
      <span class="flow-segment-span" title="\u5F9E\u7B2C\u4E00\u9EDE\u5230\u672C\u9EDE\u7D50\u675F\u7684\u7D2F\u8A08\u6642\u9593">\u7D2F\u8A08 ${F(m)}</span>
    </div>
    <div class="flow-segment-loc">
      <span class="flow-segment-loc-text">${n(e.module||"\u2014")}<span class="flow-segment-dot">\xB7</span>${n(e.function||"\u2014")}</span>
      <span class="flow-segment-mobile-cum" title="\u5F9E\u7B2C\u4E00\u9EDE\u5230\u672C\u9EDE\u7D50\u675F\u7684\u7D2F\u8A08\u6642\u9593">\u7D2F\u8A08 ${F(m)}</span>
    </div>
    <div class="flow-track" title="\u958B\u59CB +${o.toFixed(1)} ms \xB7 \u8DDD\u4E0B\u4E00\u9EDE ${F(l)} \xB7 \u7D2F\u8A08 ${F(m)}">
      <span class="flow-bar ${xn(e)}" style="left:${w.toFixed(2)}%;width:${f.toFixed(2)}%"></span>
    </div>
    ${An(e.params)}
    ${e.error?`<div class="flow-segment-error">${n(e.error)}</div>`:""}
  </div>`}function Tn(e){let t=Array.isArray(e?.segments)?e.segments:[],s=Array.isArray(e?.models)?e.models:[],a=e?.client||{},r=Math.max(...t.map(l=>Number(l.avg_ms)||0),1),i=a.samples?F(a.avg_total_ms??0):"\u2014",o=a.samples?F(a.avg_render_ms??0):"\u2014";return`<div class="perf-flow-stats">
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
                    <span class="perf-model-count">${c(l.value)} \u6B21${l.avg_ms?` \xB7 \u5E73\u5747 ${F(l.avg_ms)}`:""}</span>
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
                    <span class="perf-seg-ms">${F(l.avg_ms)}</span>
                  </div>`).join("")}</div>`:'<p class="muted" style="font-size:11px">\u5C1A\u7121\u5340\u6BB5\u8017\u6642\uFF1B\u9700\u6709\u542B flow \u7684\u65B0\u7D00\u9304\u3002</p>'}
      </div>
    </div>
  </div>`}function ke(e){let t=Math.max(0,Number(e)||0);if(!t)return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;let s=Math.round(t/1e3),a=Math.floor(s/3600),r=Math.floor(s%3600/60),i=s%60;return a?`${a}h ${String(r).padStart(2,"0")}m ${String(i).padStart(2,"0")}s`:r?`${r}m ${String(i).padStart(2,"0")}s`:`${(t/1e3).toFixed(1)}s`}function Ws(e){let t=String(e?.task||"").trim();return t?t==="auto"?"\u81EA\u52D5\u63A5\u7E8C":`task ${t}`:"\u7D22\u5F15"}function qn(e){let t=(e||[]).slice(-12);if(!t.length)return'<p class="muted" style="font-size:11px">\u5C1A\u7121\u7D22\u5F15\u7D00\u9304\u3002</p>';let s=Math.max(...t.map(a=>Number(a.points_per_second)||0),.1);return`<div class="index-run-bars">${t.map(a=>{let r=Number(a.points_per_second)||0,i=Math.max(2,r/s*100);return`<div class="index-run-row">
        <div class="index-run-label">
          <strong>${n(Ws(a))}</strong>
          <span>${n(ne(a.started_at))}</span>
        </div>
        <div class="index-run-track" title="${n(`${c(a.indexed_count)} \u7B46 \xB7 ${ke(a.duration_ms)} \xB7 ${c(a.batch_count)} \u6279`)}">
          <span style="width:${i.toFixed(1)}%"></span>
        </div>
        <div class="index-run-value">
          <strong>${r.toFixed(1)}</strong><span>\u7B46/\u79D2</span>
          <em>${c(a.indexed_count)} \u7B46 \xB7 ${ke(a.duration_ms)}</em>
        </div>
      </div>`}).join("")}</div>`}function jn(e){let t=(Array.isArray(e.time_breakdown)?e.time_breakdown:[]).map(s=>({...s,ms:Number(s.ms)||0,percent:Number(s.percent)||0})).filter(s=>s.ms>0);return t.length?`<div class="index-breakdown-bar">${t.map(s=>`<span class="index-seg index-seg-${n(s.key)}" style="width:${Math.max(.5,s.percent).toFixed(2)}%" title="${n(`${s.label} ${ke(s.ms)}\uFF08${s.percent.toFixed(1)}%\uFF09`)}"></span>`).join("")}</div>
    <div class="index-breakdown-legend">${t.map(s=>`<span class="index-legend-item">
            <i class="index-seg index-seg-${n(s.key)}"></i>
            <span>${n(s.label)}</span>
            <strong>${ke(s.ms)}</strong>
            <em>${s.percent.toFixed(1)}%</em>
          </span>`).join("")}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B\u968E\u6BB5\u8A08\u6642\uFF1B\u5F8C\u7E8C\u7D22\u5F15\u6703\u8A18\u9304 Ollama Embedding\u3001Qdrant Upsert \u8207 PostgreSQL \u7D22\u5F15\u7D00\u9304\u7684\u6642\u9593\u7D44\u6210\u3002</div>'}function En(e,t){let s=(Array.isArray(e)?e:[]).map(L=>({elapsed:Math.max(0,Number(L.elapsed_s)||0),indexed:Math.max(0,Number(L.indexed)||0)})).filter(L=>L.indexed>0);if(s.length<2)return"";let a=Math.max(...s.map(L=>L.elapsed),(Number(t)||0)/1e3,1),r=Math.max(...s.map(L=>L.indexed),1),i=760,o=150,l=12,m=12,h=i-l*2,w=o-m*2,f=s.map(L=>[l+L.elapsed/a*h,o-m-L.indexed/r*w]),v=f.map(([L,_],E)=>`${E===0?"M":"L"}${L.toFixed(1)},${_.toFixed(1)}`).join(" "),x=`${v} L${f[f.length-1][0].toFixed(1)},${o-m} L${f[0][0].toFixed(1)},${o-m} Z`,b=Math.max(1,Math.ceil(f.length/14)),y=f.map(([L,_],E)=>E%b===0||E===f.length-1?`<circle cx="${L.toFixed(1)}" cy="${_.toFixed(1)}" r="2.6" />`:"").join(""),C=[0,1,2,3].map(L=>{let _=m+w/3*L;return`<line x1="${l}" y1="${_.toFixed(1)}" x2="${i-l}" y2="${_.toFixed(1)}" class="index-chart-grid" />`}).join("");return`<div class="index-chart-card index-progress-card">
    <div class="index-chart-head">
      <span>\u672C\u6B21\u7D22\u5F15\u9032\u5EA6</span>
      <span>${c(r)} \u7B46 \xB7 ${ke(a*1e3)}</span>
    </div>
    <svg class="index-progress-svg" viewBox="0 0 ${i} ${o}" role="img" aria-label="\u7D22\u5F15\u9032\u5EA6\u6298\u7DDA\u5716">
      ${C}
      <path d="${x}" class="index-progress-area"></path>
      <path d="${v}" class="index-progress-line"></path>
      ${y}
      <line x1="${l}" y1="${o-m}" x2="${i-l}" y2="${o-m}" class="index-chart-axis"></line>
      <line x1="${l}" y1="${m}" x2="${l}" y2="${o-m}" class="index-chart-axis"></line>
    </svg>
    <div class="index-progress-labels">
      <span>0</span>
      <span>${ke(a*500)}</span>
      <span>${ke(a*1e3)}</span>
    </div>
  </div>`}function Pn(e){if(!e||!e.latest)return"";let t=e.latest,s=Array.isArray(e.runs)?e.runs:[],a=e.average||{},r=t.coverage||{},i=r.total_judgments>0?`${c(r.indexed_judgments)} / ${c(r.total_judgments)}\uFF08${(100*r.indexed_judgments/r.total_judgments).toFixed(1)}%\uFF09`:"\u2014",o=[{label:"\u7576\u6B21\u57F7\u884C\u7B46\u6578",value:c(t.indexed_count),note:`${c(t.batch_count)} \u6279 \xD7 ${c(t.batch_size)} \u7B46`},{label:"\u5E73\u5747\u6BCF\u79D2\u7B46\u6578",value:`${(Number(t.points_per_second)||0).toFixed(1)}`,note:"\u7B46/\u79D2"},{label:"\u7576\u6B21\u4F7F\u7528\u6642\u9593",value:ke(t.duration_ms),note:`${c(t.scanned_count)} \u7B46\u5DF2\u6383\u63CF`},{label:"\u5E73\u5747\u6BCF\u6279\u6642\u9593",value:ke(t.batch_avg_ms),note:t.batch_min_ms||t.batch_max_ms?`\u6700\u5FEB ${ke(t.batch_min_ms)} \xB7 \u6700\u6162 ${ke(t.batch_max_ms)}`:"\u4EE5\u7E3D\u8017\u6642 \xF7 \u6279\u6578\u8A08\u7B97"}];return`<section class="index-perf-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u7D22\u5F15\u6548\u80FD</div>
        <div class="index-perf-sub">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 \xB7 \u6700\u8FD1 ${c(e.run_count)} \u6B21\u57F7\u884C</div>
      </div>
      <span class="chip">${n(Ws(t))}</span>
    </div>
    <div class="index-perf-summary">
      ${o.map(l=>`<div class="index-perf-stat">
            <div class="summary-label">${n(l.label)}</div>
            <div class="index-perf-value">${n(l.value)}</div>
            <div class="index-perf-note">${n(l.note)}</div>
          </div>`).join("")}
    </div>
    <div class="index-perf-meta">
      <span><strong>\u6700\u8FD1\u4E00\u6B21</strong> ${n(ne(t.started_at))}</span>
      <span><strong>batch</strong> ${c(t.batch_size)} \u7B46\uFF0F\u6279</span>
      <span><strong>embedding \u4E0A\u9650</strong> ${t.max_chars?`${c(t.max_chars)} \u5B57`:"\u2014"}</span>
      <span><strong>collection</strong> ${c(t.collection_points)} points</span>
      <span><strong>\u8986\u84CB\u7387</strong> ${n(i)}</span>
      <span><strong>\u5E73\u5747\u6BCF\u6B21\u57F7\u884C</strong> ${ke(a.duration_ms)} \xB7 ${(Number(a.points_per_second)||0).toFixed(1)} \u7B46/\u79D2</span>
    </div>
    <div class="index-charts">
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u8FD1\u7D22\u5F15\u541E\u5410</span>
          <span>\u7B46/\u79D2</span>
        </div>
        ${qn(s)}
      </div>
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u65B0\u4E00\u6B21\u6642\u9593\u7D44\u6210</span>
          <span>${ke(t.duration_ms)}</span>
        </div>
        ${jn(t)}
      </div>
    </div>
    ${En(t.progress,t.duration_ms)}
  </section>`}function Cn(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,r=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${r} \u9801 \xB7
      \u986F\u793A ${c(i)}\u2013${c(o)} / ${c(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Js.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${$("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=r?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${$("chevronRight",13)}</button>
    </div>
  </div>`}function Nn(e,t){let s=e.flow&&typeof e.flow=="object"?e.flow:null,a=Array.isArray(s?.segments)?[...s.segments].sort((b,y)=>Number(b.seq)-Number(y.seq)):[],r=s?.summary||{},i=Array.isArray(r.models)?r.models:[],o=s?.client||{},l=s?.metadata||{},m=l.question||"",h=l.answer||"",w=m||h?`<div class="perf-flow-qa">
          ${m?`<div class="perf-flow-qa-row"><strong>RAG \u554F\u984C</strong><span>${n(m)}</span></div>`:""}
          ${h?`<div class="perf-flow-qa-row"><strong>RAG \u7B54\u6848</strong><span>${n(h)}</span></div>`:""}
        </div>`:"",f=Math.max(Number(s?.total_ms)||0,Number(e.duration_ms)||0,...a.map(b=>(Number(b.offset_ms)||0)+(Number(b.duration_ms)||0)),1),v=Sn(a),x=Ln(a);return`<details class="perf-record" ${t===0?"open":""}>
    <summary class="perf-record-summary">
      <span class="perf-record-id">#${n(String(e.id))}</span>
      <span class="perf-record-main">
        <span class="perf-record-title">${n(e.process||"\u672A\u547D\u540D")}</span>
        <span class="perf-record-path mono">${n(e.method||"")} ${n(e.path||"")}</span>
      </span>
      <span class="perf-record-time">${ne(e.started_at)}</span>
      <span class="perf-record-duration">${F(e.duration_ms)}</span>
      ${Y(e.status)}
      <span class="perf-record-chevron">${$("chevronRight",14)}</span>
    </summary>
    <div class="perf-record-body">
      <div class="perf-flow-meta">
        <span><strong>Request</strong> <span class="mono">${n(e.request_id||s?.request_id||"\u2014")}</span></span>
        <span><strong>Server</strong> ${F(e.duration_ms)}</span>
        ${o.total_ms?`<span><strong>Client \u5168\u6D41\u7A0B</strong> ${F(o.total_ms)}</span>`:""}
        ${o.render_ms!==void 0?`<span><strong>Render</strong> ${F(o.render_ms)}</span>`:""}
        <span><strong>Flow</strong> ${a.length} \u6BB5</span>
        ${a.length?"<span><strong>\u9EDE\u4F4D</strong> \u5340\u9593\uFF1D\u4E0B\u4E00\u9EDE\u958B\u59CB\uFF0D\u672C\u9EDE\u958B\u59CB\uFF1B\u7D2F\u8A08\uFF1D\u7B2C\u4E00\u9EDE\u5230\u672C\u9EDE\u7D50\u675F\uFF0C\u6700\u5F8C\u4E00\u9EDE\u70BA\u7E3D\u6642\u9593</span>":""}
      </div>
      ${w}
      ${i.length?`<div class="chips perf-record-models">${i.map(b=>`<span class="chip">${n(b)}</span>`).join("")}</div>`:""}
      ${a.length?`<div class="flow-axis"><span>0 ms</span><span>${F(f)}</span></div>
            <div class="flow-timeline">${a.map(b=>Mn(b,f,v,x)).join("")}</div>`:`<div class="perf-no-flow">\u6B64\u7D00\u9304\u6C92\u6709 flow \u660E\u7D30\uFF08\u53EF\u80FD\u662F\u820A\u8CC7\u6599\u6216 CLI \u7D00\u9304\uFF09\u3002${e.params_text&&e.params_text!=="{}"?`<pre>${n(e.params_text)}</pre>`:""}</div>`}
      ${s?`<details class="flow-json">
              <summary>Flow JSON \xB7 ${a.length} \u6BB5</summary>
              <pre>${n(JSON.stringify(s,null,2))}</pre>
            </details>`:""}
    </div>
  </details>`}var ut={embedding:"Embedding",retrieval:"Qdrant \u6AA2\u7D22",context:"PostgreSQL \u53D6\u6587",llm:"LLM \u751F\u6210",validation:"\u5F15\u7528\u9A57\u8B49"},Qs={embedding:"EMB",retrieval:"\u6AA2\u7D22",context:"\u53D6\u6587",llm:"LLM",validation:"\u9A57\u8B49",overhead:"\u5176\u4ED6"};function Ks(e){return{pending:"\u7B49\u5F85",running:"\u57F7\u884C\u4E2D",success:"\u5B8C\u6210",partial:"\u90E8\u5206\u6210\u529F",failed:"\u5931\u6557",skipped:"\u7565\u904E"}[e]||e||"\u672A\u77E5"}function Rn(e){let t=String(e.status||"pending"),s=Math.max(0,Math.min(100,Number(e.progress)||0)),a=t==="pending"?0:t==="running"?Math.max(s,12):100,r=t==="running"?"\u57F7\u884C\u4E2D\u2026":t==="pending"?"\u7B49\u5F85":e.duration_ms?F(e.duration_ms):Ks(t);return`<div class="test-flow-step is-${n(t)}">
    <div class="test-flow-step-head">
      <span class="test-flow-model" title="${n(e.model||"")}">${n(e.model||"\u2014")}</span>
      <span class="test-flow-step-meta">${n(r)}</span>
    </div>
    <div class="test-flow-step-loc">${n(e.module||"\u2014")}<span class="flow-segment-dot">\xB7</span>${n(e.function||"\u2014")}</div>
    <div class="test-flow-track">
      <span class="test-flow-bar" style="width:${a}%"></span>
    </div>
    ${e.error_message?`<div class="test-flow-error">${n(e.error_message)}</div>`:""}
    ${e.details&&Object.keys(e.details).length?`<div class="test-flow-details">${n(Object.entries(e.details).slice(0,4).map(([i,o])=>`${i}=${Vs(o)}`).join(" \xB7 "))}</div>`:""}
  </div>`}function In(e,t){if(!t.length)return"";let s=t.reduce((a,r)=>a+(Number(r.progress)||0),0)/t.length;return`<section class="test-flow-stage">
    <div class="test-flow-stage-head">
      <span class="test-flow-stage-title">${n(ut[e]||e)}</span>
      <span class="test-flow-stage-meta">${t.length} \u500B\u7A0B\u5E8F \xB7 ${Math.round(s)}%</span>
    </div>
    <div class="test-flow-stage-steps">${t.map(Rn).join("")}</div>
  </section>`}function Ys(e,t){let s=Date.now(),a=new Map;for(let f of t){let v=Number(f.duration_ms)||0;if(f.status==="running"&&f.started_at){let x=Date.parse(f.started_at);Number.isFinite(x)&&(v=Math.max(v,s-x))}a.set(f.stage,(a.get(f.stage)||0)+v)}let r=Array.isArray(e.stage_order)?e.stage_order:Object.keys(ut),i=[],o=new Set;for(let f of r)t.some(v=>v.stage===f)&&(o.add(f),i.push({stage:f,label:ut[f]||f,short:Qs[f]||f,duration:a.get(f)||0}));for(let[f,v]of a)o.has(f)||i.push({stage:f,label:ut[f]||f,short:Qs[f]||f,duration:v});let l=i.reduce((f,v)=>f+v.duration,0),m=Number(e.total_ms)||0,h=Math.max(l,m),w=Math.max(0,h-l);return w>1&&i.push({stage:"overhead",label:"\u5176\u4ED6\uFF0F\u6392\u7A0B",short:"\u5176\u4ED6",duration:w}),{entries:i,total:h||l,stepTotal:l}}function Dn(e,t){let{entries:s,total:a}=Ys(e,t),r=s.filter(o=>o.duration>0).map(o=>{let l=a?o.duration/a*100:0;return`<span class="test-flow-time-seg stage-${n(o.stage)}" style="width:${l.toFixed(2)}%" title="${n(o.label)} \xB7 ${F(o.duration)}\uFF08${l.toFixed(1)}%\uFF09">${l>=8?n(o.short):""}</span>`}).join(""),i=s.map(o=>{let l=a?o.duration/a*100:0;return`<span class="test-flow-legend-item">
        <i class="test-flow-dot stage-${n(o.stage)}"></i>
        <span>${n(o.label)}</span>
        <strong>${F(o.duration)}</strong>
        <em>${l.toFixed(1)}%</em>
      </span>`}).join("");return`<div class="test-flow-time">
    <div class="test-flow-total-head">
      <span>\u7E3D\u6D41\u7A0B\u6642\u9593\uFF08\u4F9D\u968E\u6BB5\uFF09</span>
      <span>${F(a)}${e.status==="running"?" \xB7 \u4F30\u7B97\u4E2D":""}</span>
    </div>
    <div class="test-flow-time-bar">
      ${r||'<span class="test-flow-time-empty">\u5C1A\u7121\u968E\u6BB5\u8017\u6642</span>'}
    </div>
    <div class="test-flow-legend">${i}</div>
    ${e.status==="running"?'<div class="test-flow-time-note">\u57F7\u884C\u4E2D\u7684\u968E\u6BB5\u4EE5\u958B\u59CB\u6642\u9593\u4F30\u7B97\uFF1B\u5B8C\u6210\u5F8C\u4EE5\u4F3A\u670D\u5668\u56DE\u5831\u7684 duration \u70BA\u6E96\u3002</div>':""}
  </div>`}function nt(e,t,s,a={}){let r=a.showHistory!==!1,i=[`<option value="" ${s?"":"selected"}>\u76EE\u524D\uFF0F\u6700\u65B0\u6E2C\u8A66</option>`,...(t||[]).map(_=>`<option value="${n(_.run_id)}" ${_.run_id===s?"selected":""}>${n(Ks(_.status))} \xB7 ${n((_.question||"\u672A\u547D\u540D").slice(0,28))} \xB7 ${n(ne(_.started_at))}</option>`)].join(""),o=r?`<label class="test-flow-select-label">\u6B77\u53F2
        <select class="select" id="test-run-select">${i}</select>
      </label>
      <button class="btn btn-secondary btn-sm" type="button" id="test-flow-refresh">
        ${$("refresh",13)}<span>\u66F4\u65B0</span>
      </button>`:`<a class="btn btn-secondary btn-sm" href="#/performance">
        ${$("activity",13)}<span>\u6B77\u53F2 Flow</span>
      </a>`,l=`<div class="test-flow-head">
    <div class="test-flow-heading">
      <div class="eyebrow">PERFORMANCE TEST FLOW</div>
      <div class="test-flow-title">\u6E2C\u8A66\u6D41\u7A0B ${e?Y(e.status):""}</div>
      <div class="test-flow-question">${e?n(e.question||"\u672A\u547D\u540D\u6E2C\u8A66"):"\u5C1A\u7121\u6E2C\u8A66\u6D41\u7A0B\u3002\u8ACB\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u4E26\u5728 RAG \u9801\u63D0\u554F\u3002"}</div>
    </div>
    <div class="test-flow-actions">${o}</div>
  </div>`;if(!e)return`<div class="test-flow-panel card">${l}
      ${we({iconName:"activity",title:"\u7B49\u5F85\u6E2C\u8A66\u6D41\u7A0B",text:"\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C\u6240\u6709\u53EF\u7528\u6A21\u578B\uFF0C\u4E26\u5728\u9019\u88E1\u5373\u6642\u986F\u793A\u6BCF\u500B\u968E\u6BB5\u7684\u9032\u5EA6\u3002"})}
    </div>`;let m=Array.isArray(e.steps)?e.steps:[],h=new Map;for(let _ of m)h.has(_.stage)||h.set(_.stage,[]),h.get(_.stage).push(_);let f=(Array.isArray(e.stage_order)?e.stage_order:Object.keys(ut)).map(_=>In(_,h.get(_)||[])).join(""),v=e.models||{},x=Ys(e,m),b=e.status==="running"?`${F(x.total)}\uFF08\u4F30\u7B97\uFF09`:F(e.total_ms),y=m.find(_=>_.stage==="llm"&&_.model===e.summary?.primary_model)||m.find(_=>_.stage==="llm"&&_.details?.answer_preview),C=e.answer||y?.details?.answer_preview||"",L=`<div class="test-flow-answer">
    <div class="test-flow-answer-head">
      <span>RAG \u5F15\u64CE\u7B54\u6848</span>
      ${e.summary?.primary_model?`<span class="mono">${n(e.summary.primary_model)}</span>`:""}
    </div>
    <p>${C?n(C):e.status==="running"?"\u6E2C\u8A66\u9032\u884C\u4E2D\uFF0C\u5C1A\u672A\u7522\u751F\u6700\u7D42\u7B54\u6848\u3002":"\u6B64\u6E2C\u8A66\u6C92\u6709\u4FDD\u5B58\u53EF\u986F\u793A\u7684\u7B54\u6848\u3002"}</p>
  </div>`;return`<div class="test-flow-panel card">
    ${l}
    <div class="test-flow-meta">
      <span><strong>Run</strong> <span class="mono">${n(e.run_id)}</span></span>
      <span><strong>\u958B\u59CB</strong> ${n(ne(e.started_at))}</span>
      <span><strong>\u7E3D\u8017\u6642</strong> ${b}</span>
      <span><strong>Embedding</strong> ${Array.isArray(v.embedding)?v.embedding.length:0} \u500B</span>
      <span><strong>LLM</strong> ${Array.isArray(v.llm)?v.llm.length:0} \u500B</span>
      <span><strong>\u968E\u6BB5</strong> ${n(e.stage_label||e.stage||"\u2014")}</span>
    </div>
    ${L}
    <div class="test-flow-stages">${f||'<p class="muted">\u6B64\u6E2C\u8A66\u6C92\u6709\u5340\u6BB5\u8CC7\u6599\u3002</p>'}</div>
    <div class="test-flow-total">
      <div class="test-flow-total-head">
        <span>\u7E3D\u6D41\u7A0B\u9032\u5EA6</span>
        <span>${Number(e.progress)||0}%</span>
      </div>
      <div class="test-flow-track is-total ${e.status==="running"?"is-running":""}">
        <span class="test-flow-bar is-total" style="width:${Math.max(0,Math.min(100,Number(e.progress)||0))}%"></span>
      </div>
    </div>
    ${Dn(e,m)}
    <div class="test-flow-foot">
      <span>${e.status==="running"?"\u6E2C\u8A66\u57F7\u884C\u4E2D\uFF1B\u6B64\u5716\u8868\u6703\u81EA\u52D5\u66F4\u65B0\u3002":r?"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u5F9E\u4E0A\u65B9\u300C\u6B77\u53F2\u300D\u9078\u55AE\u9084\u539F\u5176\u4ED6 Flow\u3002":"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u81F3\u6548\u80FD\u5831\u8868\u67E5\u770B\u6B77\u53F2 Flow\u3002"}</span>
      ${e.summary?.primary_model?`<span class="mono">primary=${n(e.summary.primary_model)}</span>`:""}
    </div>
  </div>`}function Bn(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.summary)?e.summary:[],a=e.flow_stats||e.meta?.flow_stats||{},r=e.index_stats||null;return`<div class="report-card performance-flow-report" data-database="performance">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">PERFORMANCE FLOW REPORT</div>
        <div class="report-title">
          \u6548\u80FD\u5831\u8868 ${Y(e.status||"ok")}
          <span class="chip">performance_records</span>
        </div>
        <div class="report-sub">
          ${c(e.total)} \u7B46\u7B26\u5408 \xB7 ${F(e.duration_ms)} \xB7
          \u6BCF\u6B21\u57F7\u884C\u6309\u9215\u7684\u5B8C\u6574 Flow
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${$("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${$("file",14)}<span>JSON</span></button>
      </div>
    </div>
    ${s.length?`<div class="summary-strip">${s.map(i=>`<div class="summary-item">
                <div class="summary-label">${n(i.label)}</div>
                <div class="summary-value">${n(i.value)}</div>
              </div>`).join("")}</div>`:""}
    ${Pn(r)}
    ${Tn(a)}
    <div class="report-section-head perf-flow-list-head">
      <span class="report-section-title">Flow \u7D00\u9304</span>
      <span class="muted" style="font-size:9.5px">\u9EDE\u64CA\u5217\u5C55\u958B\u6A21\u7D44\u3001\u51FD\u6578\u3001\u53C3\u6578\u8207\u5340\u6BB5\u8017\u6642</span>
    </div>
    <div class="perf-record-list">
      ${t.length?t.map((i,o)=>Nn(i,o)).join(""):we({iconName:"activity",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684 Flow",text:"\u653E\u5BEC\u65E5\u671F\u3001\u6A21\u578B\u6216\u8017\u6642\u689D\u4EF6\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}
    </div>
    ${Cn(e)}
    <details class="perf-query-details">
      <summary>\u67E5\u8A62\u8A9E\u53E5\u8207\u8B66\u544A</summary>
      <div class="query-box">
        <pre class="query-code">${n(e.query_text||"\u2014")}</pre>
        <button class="btn btn-secondary btn-sm btn-copy" type="button" data-action="copy-query">
          ${$("copy",12)}<span>\u8907\u88FD</span>
        </button>
      </div>
      ${Array.isArray(e.warnings)&&e.warnings.length?`<div class="warnings">${e.warnings.map(i=>`<div class="warning-line">${n(i)}</div>`).join("")}</div>`:""}
    </details>
  </div>`}async function On(e,t){let s=!1,a=is(),r={processes:[],modules:[],statuses:[],methods:[],models:[]},i=1,o=25,l=null;e.innerHTML=`<section class="page data-page performance-page">
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
          ${$("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
    <div class="data-layout">
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
              ${$("search",15)}<span>\u57F7\u884C\u67E5\u8A62</span>
            </button>
          </div>
        </form>
        <div class="sidebar-note">Flow \u5BEB\u5165 PostgreSQL \u7684 performance_records.flow\uFF08JSON\uFF09\uFF0C\u9810\u8A2D\u4FDD\u7559\u81F3\u5C11 90 \u5929\uFF1B\u53EF\u4F9D\u6A21\u578B\u3001\u7A0B\u5E8F\u3001\u6A21\u7D44\u8207\u8017\u6642\u7BE9\u9078\u3002</div>
      </aside>
      <section class="query-main" id="performance-main" aria-label="\u6548\u80FD\u5831\u8868" aria-live="polite">
        <div id="performance-test-flow"></div>
        <div id="performance-report">${ct({label:"\u6548\u80FD\u5831\u8868"})}</div>
      </section>
    </div>
  </section>`;let m=e.querySelector("#performance-filter-fields"),h=e.querySelector("#performance-filter-form"),w=e.querySelector("#performance-test-flow"),f=e.querySelector("#performance-report"),v=e.querySelector("#performance-meta"),x=e.querySelector("#performance-refresh"),b=null,y=[],C="",L=null,_="",E=()=>{m.innerHTML=_n(r,a)},z=()=>{let k=JSON.stringify({selected:C,tick:b?.status==="running"?Math.floor(Date.now()/1e3):0,runs:y.map(T=>`${T.run_id}:${T.status}`),run:b?{run_id:b.run_id,status:b.status,progress:b.progress,steps:(b.steps||[]).map(T=>`${T.stage}:${T.model}:${T.status}:${T.progress}`)}:null});k!==_&&(_=k,w.innerHTML=nt(b,y,C))},Q=async()=>{try{let k=await U.testRuns(30);if(s)return;y=Array.isArray(k.runs)?k.runs:[]}catch{if(s)return;y=[]}},Z=async()=>{try{let k=C?await U.testRun(C):await U.testRunCurrent();if(s)return;b=k.run||null,!C&&b&&b.status!=="running"&&!y.some(T=>T.run_id===b.run_id)&&await Q(),z()}catch{if(s)return;b=null,z()}},ie=async()=>{s||(C||await Z(),s||(L=window.setTimeout(ie,1500)))};w.addEventListener("change",async k=>{k.target.id==="test-run-select"&&(C=String(k.target.value||""),await Z())}),w.addEventListener("click",async k=>{k.target.closest("#test-flow-refresh")&&(C="",await Q(),await Z())});let I=async(k=i)=>{i=Math.max(1,Number(k)||1),a=Gs(),f.innerHTML=ct({label:"\u6548\u80FD\u5831\u8868"});let T=e.querySelector("#performance-run");W(T,!0,"\u67E5\u8A62\u4E2D\u2026");try{let B=await U.performance(a,i,o);if(s)return;l=B,i=Number(B.page)||i,o=Number(B.page_size)||o,f.innerHTML=Bn(B),v.textContent=`PERFORMANCE \xB7 ${c(B.total)} \u7B46`,v.className="badge badge-neutral badge-mono"}catch(B){if(s)return;f.innerHTML=Lt(B,{label:"\u6548\u80FD\u5831\u8868"}),D(B.message||"\u6548\u80FD\u5831\u8868\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{s||W(T,!1)}},P=async()=>{try{r=await U.performanceOptions()}catch{r={processes:[],modules:[],statuses:[],methods:[],models:[]}}E()};return h.addEventListener("submit",k=>{k.preventDefault(),I(1)}),e.querySelector('[data-action="reset"]').addEventListener("click",()=>{a=is(),i=1,E(),I(1)}),x.addEventListener("click",async()=>{a=Gs(),x.disabled=!0,W(x,!0,"\u6574\u7406\u4E2D\u2026"),await P(),await Q(),s||await Z(),s||await I(1),s||(x.disabled=!1,W(x,!1))}),f.addEventListener("click",async k=>{let T=k.target.closest("[data-action]");if(!T||!l)return;let B=T.dataset.action;if(B==="retry"){I(i);return}if(B==="prev-page"){I(Math.max(1,Number(l.page)-1));return}if(B==="next-page"){let J=Math.max(1,Math.ceil(Number(l.total)/Number(l.page_size)));I(Math.min(J,Number(l.page)+1));return}if(B==="copy-query"){let J=await ht(l.query_text||"");D(J?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",J?"ok":"warn");return}if(B==="export-json"){let J=`performance-page-${l.page}.json`;ze(J,JSON.stringify(Tt(l),null,2),"application/json;charset=utf-8"),D(`\u5DF2\u532F\u51FA ${J}`,"ok");return}if(B==="export-csv"){let J=`performance-page-${l.page}.csv`;ze(J,Mt(l),"text/csv;charset=utf-8"),D(`\u5DF2\u532F\u51FA ${J}`,"ok")}}),f.addEventListener("change",k=>{k.target.matches("[data-page-size]")&&(o=Number(k.target.value)||25,Js.includes(o)||(o=25),I(1))}),await Promise.allSettled([P(),Q()]),s||(await Z(),await I(1),ie()),t&&typeof t.setTitle=="function"&&t.setTitle("\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"),()=>{s=!0,L&&window.clearTimeout(L)}}var Fn=["\u91D1\u878D\u6D88\u8CBB\u8005\u4FDD\u8B77\u6CD5\u5982\u4F55\u8655\u7406\u91D1\u878D\u6D88\u8CBB\u722D\u8B70\uFF1F","\u8B49\u5238\u4EA4\u6613\u6CD5\u5C0D\u5167\u7DDA\u4EA4\u6613\u6709\u4EC0\u9EBC\u898F\u7BC4\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5438\u6536\u5B58\u6B3E\u8207\u6388\u4FE1\u6709\u54EA\u4E9B\u9650\u5236\uFF1F","\u4FDD\u96AA\u6CD5\u5C0D\u65BC\u696D\u52D9\u54E1\u4E0D\u7576\u62DB\u652C\u7684\u8CAC\u4EFB\u898F\u5B9A\uFF1F","\u9280\u884C\u6CD5\u6709\u591A\u5C11\u689D\u6587\uFF1F","\u8B49\u5238\u71DF\u696D\u54E1\u5E38\u89F8\u72AF\u4EC0\u9EBC\u6CD5\u898F\u6216\u547D\u4EE4\uFF1F","\u6709\u54EA\u4E9B\u6CD5\u898F\u662F\u548C\u58FD\u96AA\u53CA\u7522\u96AA\u76F8\u95DC\u7684\uFF1F"];function Hn(){return`<div class="answer-placeholder">
    <span class="empty-icon">${$("sparkles",26)}</span>
    <h2 class="empty-title">\u7B54\u6848\u53EA\u6703\u4F86\u81EA\u6AA2\u7D22\u5230\u7684\u5224\u6C7A\u53CA\u6CD5\u898F\u7247\u6BB5</h2>
    <p class="empty-text">\u9001\u51FA\u554F\u984C\u5F8C\uFF0C\u7CFB\u7D71\u6703\u5148\u4EE5 Qdrant \u6AA2\u7D22\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\u4E26\u6A19\u793A\u5F15\u7528\u7DE8\u865F\u3002
      \u82E5\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u660E\u78BA\u986F\u793A\u964D\u7D1A\u72C0\u614B\uFF0C\u4E0D\u6703\u6191\u7A7A\u751F\u6210\u7B54\u6848\u3002</p>
  </div>`}var Un={"http.request":"FastAPI \u63A5\u6536\u8ACB\u6C42","http.response":"\u56DE\u50B3\u7D50\u679C\u7D66\u524D\u7AEF","rag.answer_question":"RAG \u4E3B\u6D41\u7A0B","rag.coverage":"PostgreSQL \u7D22\u5F15\u8986\u84CB\u6AA2\u67E5","rag.law_retrieval":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22","rag.law_lookup":"\u6BD4\u5C0D\u554F\u984C\u4E2D\u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u540D\u7A31","rag.law_content":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u689D\u6587","rag.qdrant_precheck":"Qdrant collection \u6AA2\u67E5","rag.search":"RAG \u6AA2\u7D22","rag.embed_query":"Ollama embedding \u67E5\u8A62\u5411\u91CF","rag.qdrant_search":"Qdrant \u5411\u91CF\u641C\u5C0B","rag.fetch_documents":"PostgreSQL \u8B80\u53D6\u5224\u6C7A","rag.postgres_fetch":"PostgreSQL \u5224\u6C7A\u67E5\u8A62","rag.build_citations":"\u6574\u7406\u5F15\u7528\u8207\u5224\u6C7A\u7247\u6BB5","rag.extract_excerpt":"\u64F7\u53D6\u76F8\u95DC\u7247\u6BB5","rag.llm":"LLM \u56DE\u7B54\u751F\u6210","rag.llm_request":"Ollama LLM \u751F\u6210","rag.validate_citations":"\u9A57\u8B49\u5F15\u7528\u7DE8\u865F","rag.test_mode":"\u6E2C\u8A66\u6A21\u5F0F\u591A\u6A21\u578B\u6D41\u7A0B","rag.preview_fallback":"\u6CD5\u898F\u9810\u89BD\u964D\u7D1A"};function zn(e){let t=String(e?.name||""),s=e?.params||{},a=String(s.model||s.embedding_model||"").trim();return t==="rag.llm_request"?`Ollama run ${a||"LLM"}`:t==="rag.llm"?`LLM \u56DE\u7B54\u751F\u6210${a?` \xB7 ${a}`:""}`:t==="rag.embed_query"?`Ollama embedding \u67E5\u8A62\u5411\u91CF${a?` \xB7 ${a}`:""}`:Un[t]||t||"backend step"}function Xs(e){return[e?.module,e?.function,e?.name].filter(Boolean).join(" \xB7 ")}function Zs(e){let t=Number(e);return Number.isFinite(t)?`${c(Math.max(0,Math.round(t)))} ms`:"\u2014"}function ls(e,t){if(!e)return;e.classList.toggle("is-open",t);let s=e.querySelector("#rag-process-body"),a=e.querySelector(".rag-process-toggle");s&&(s.hidden=!t),a&&(a.setAttribute("aria-expanded",String(t)),a.title=t?"\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B":"\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B")}function Gn(){return`<div class="rag-process is-open" id="rag-process">
    <div class="rag-process-control">
      <button type="button" class="rag-process-toggle" id="rag-process-toggle"
        aria-expanded="true" aria-controls="rag-process-body" title="\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B">
        <span class="rag-process-toggle-label-collapsed">\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B</span>
        <span class="rag-process-toggle-label-expanded">\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B</span>
        ${$("chevronDown",11)}
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
  </div>`}function Qn(e){let t=e.querySelector("#rag-process"),s=t?.querySelector("#rag-process-list"),a=t?.querySelector("#rag-process-summary"),r=performance.now(),i=new Map,o=(v,x,b)=>{let y=v.querySelector(x);y&&(y.textContent=b)},l=v=>{if(v.failed){o(v.element,".rag-process-meta","\u5931\u6557");return}if(v.hasChildren){o(v.element,".rag-process-meta","");return}o(v.element,".rag-process-meta",Zs(v.durationMs))},m=v=>{let x=v-1,b=[...i.values()].reverse();for(let y of b){if(x<0)break;y.depth<=x&&(y.hasChildren||(y.hasChildren=!0,y.element.dataset.hasChildren="true",y.finished&&l(y)),x=y.depth-1)}},h=v=>{if(!s)return null;let x=String(v?.seq??`step-${i.size+1}`),b=i.get(x);if(!b){let y=Math.max(0,Math.min(6,Number(v?.depth)||0));m(y);let C=document.createElement("div");C.className="rag-process-item is-running",C.dataset.processKey=x,C.style.setProperty("--depth",String(y)),C.innerHTML=`<span class="rag-process-dot"></span>
        <span class="rag-process-label"></span>
        <span class="rag-process-meta">\u57F7\u884C\u4E2D\u2026</span>`,s.appendChild(C),b={element:C,depth:y,hasChildren:!1,finished:!1,failed:!1,durationMs:0},i.set(x,b)}return o(b.element,".rag-process-label",zn(v)),b.element.title=Xs(v),b};return{step:v=>{let x=v?.segment;if(!x)return;let b=h(x);if(b){if(v.type==="segment_start"){b.element.classList.add("is-running"),o(b.element,".rag-process-meta","\u57F7\u884C\u4E2D\u2026");return}if(v.type==="segment_end"){let y=x.status==="error";b.element.classList.remove("is-running"),b.element.classList.toggle("is-error",y),b.finished=!0,b.failed=y,b.durationMs=Number(x.duration_ms)||0,l(b),b.element.title=[Xs(x),y&&x.error||""].filter(Boolean).join(" \xB7 ")}}},finish:(v=!0)=>{if(!t)return"";t.querySelectorAll(".rag-process-item.is-running").forEach(y=>{y.classList.remove("is-running");let C=y.dataset.hasChildren==="true";o(y,".rag-process-meta",C?"":v?"\u5B8C\u6210":"\u4E2D\u65B7")});let x=s?.children.length||i.size,b=Zs(Math.max(0,performance.now()-r));return a&&(a.textContent=v?`\u5B8C\u6210 \xB7 ${x} \u6B65 \xB7 ${b}`:`\u5931\u6557 \xB7 ${x} \u6B65`),t.classList.add("is-complete"),ls(t,!1),t.outerHTML},collapse:()=>ls(t,!1)}}function Jn(e,t=!1){let s=t?"\u6E2C\u8A66\u6A21\u5F0F\uFF1A\u6B63\u5728\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207 LLM \u6A21\u578B\uFF0C\u53EF\u80FD\u9700\u8981\u6578\u5206\u9418\u2026":"\u6B63\u5728\u4EE5\u5411\u91CF\u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\u7247\u6BB5\u4E26\u751F\u6210\u56DE\u7B54\uFF1B\u5FEB\u901F\u6A21\u5F0F\u901A\u5E38 2\u201310 \u79D2\u2026";return`<div class="answer-head">
      <div class="answer-head-left">${$("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u4E2D</span>
      </div>
      <div class="answer-head-meta"><span class="spinner"></span></div>
      ${t?"":Gn()}
    </div>
    <div class="answer-body">
      <p class="answer-text">${s}\u300C${n(e)}\u300D</p>
      <div class="skeleton skeleton-line" style="margin-top:22px;width:92%"></div>
      <div class="skeleton skeleton-line" style="width:76%"></div>
      <div class="skeleton skeleton-line" style="width:84%"></div>
    </div>`}function ea(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function qt(e,{lawKey:t="",sourceType:s="",label:a=""}={}){let r=String(e||"").trim();return r?`<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${n(t||r)}"
    data-source-type="${n(s||"")}"
    title="\u9EDE\u64CA\u958B\u555F ${n(r)} \u7684\u5B8C\u6574\u689D\u6587"
    aria-label="\u958B\u555F ${n(r)} \u7684\u5B8C\u6574\u689D\u6587">${n(a||r)}</button>`:""}function Vn(e,t){let s=e.score===null||e.score===void 0?"":`\u76F8\u4F3C\u5EA6 ${Number(e.score).toFixed(4)}`,a=[e.court,e.jdate,s].filter(Boolean).map(l=>`<span>${n(l)}</span>`).join(""),r=(Array.isArray(e.matched_laws)?e.matched_laws:[]).slice(0,5).map(l=>qt(l)).join(""),i=e.jid?` data-action="open-parquet-judgment"
        data-jid="${n(e.jid)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A"
        aria-label="\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A ${n(e.jid)}"`:"",o=e.pdf_url?`<a class="citation-link" href="${n(e.pdf_url)}" target="_blank" rel="noopener noreferrer" title="\u958B\u555F\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF">\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF${$("external",11)}</a>`:"";return`<article class="citation">
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
  </article>`}function Wn(e,t){let s=[e.law_level,e.law_category,e.article_count?`${c(e.article_count)} \u689D`:""].filter(Boolean).map(o=>`<span>${n(o)}</span>`).join(""),a=e.law_url?`<a class="citation-link" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">\u4F86\u6E90${$("external",11)}</a>`:"",r=e.law_key||e.law_name||"",i=r?` data-action="open-law-source"
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
  </article>`}function Kn(e,t){let s=e.source_label||(e.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),a=e.law_level&&e.law_level!==s?e.law_level:"",r=[`<span class="badge ${e.source_type==="order"?"badge-warn":"badge-info"}">${n(s)}</span>`,a,e.law_category,e.article_count?`${c(e.article_count)} \u689D`:"",e.law_modified_date?`\u7570\u52D5 ${Ne(e.law_modified_date)}`:""].filter(Boolean).map(x=>`<span>${x}</span>`).join(""),i=e.first_promulgation?`<div class="citation-meta"><span>\u6700\u65E9\u5236\u5B9A\uFF1A${n(e.first_promulgation.roc_date)}\uFF08\u897F\u5143 ${n(e.first_promulgation.gregorian_date)}\uFF09</span></div>`:"",o=e.stats,l=o?`<div class="law-source-stats">
        <span>\u63D0\u53CA\u300C${n(o.entity||"")}\u300D\u7684\u5224\u6C7A ${c(o.judgment_count||0)} \u7B46</span>
        <span>\u672C\u6CD5\u898F\u88AB\u5F15\u7528 ${c(o.law_count||0)} \u6B21</span>
      </div>`:"",m=e.law_key||"",h=e.source_type||"",w=(Array.isArray(e.articles)?e.articles:[]).map(x=>{let b=String(x.article_no||"");return`<div class="law-source-article"${m&&b?` data-action="open-law-source"
        data-law-key="${n(m)}"
        data-source-type="${n(h)}"
        data-article-no="${n(b)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u9078\u67E5\u770B ${n(b)} \u7684\u5B8C\u6574\u5167\u5BB9"
        aria-label="\u958B\u555F ${n(e.law_name||"\u6CD5\u898F")} ${n(b)} \u7684\u5B8C\u6574\u689D\u6587"`:""}>
        <span class="law-source-article-no">${n(x.article_no||"\u689D\u6587")}</span>
        <p class="law-source-article-text">${n(x.article_content||"")}</p>
      </div>`}).join(""),f=e.law_url?`<a class="citation-link" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">\u6CD5\u898F\u4F86\u6E90${$("external",11)}</a>`:"",v=e.law_key?` data-action="open-law-source"
        data-law-key="${n(e.law_key)}"
        data-source-type="${n(e.source_type||"")}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F\u672C\u5730 Parquet \u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u59CB\u689D\u6587"
        aria-label="\u958B\u555F ${n(e.law_name||"\u6CD5\u898F")} \u539F\u59CB\u689D\u6587"`:"";return`<article class="citation law-source">
    <span class="citation-index">${String(e.index??t+1).padStart(2,"0")}</span>
    <div class="citation-body"${v}>
      <h4 class="citation-name">${n(e.law_name||"\u672A\u547D\u540D\u6CD5\u898F")}</h4>
      <div class="citation-meta">${r}</div>
      ${i}
      ${l}
      ${w}
    </div>
    <div class="citation-links">${f}</div>
  </article>`}function Yn(e,t=150){let s=String(e||"").replace(/\s+/g," ").trim();return s?s.length>t?`${s.slice(0,t)}\u2026`:s:""}function Xn(e,t){return!Array.isArray(e)||!e.length?`<p class="answer-text">${n(t)}</p>`:`<div class="law-answer-list">${e.map(s=>{let a=s.law_key||"",r=s.source_type||"",i=s.law_name||"\u672A\u547D\u540D\u6CD5\u898F",o=s.source_label||(r==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),l=Number(s.article_count||0),m=s.index!=null?`<span class="law-answer-index">[${n(String(s.index))}]</span>`:"",h=a?`<button class="law-answer-law" type="button"
            data-action="open-law-source"
            data-law-key="${n(a)}"
            data-source-type="${n(r)}"
            title="\u9EDE\u64CA\u958B\u555F ${n(i)} \u7684\u5B8C\u6574\u689D\u6587"
            aria-label="\u958B\u555F ${n(i)} \u7684\u5B8C\u6574\u689D\u6587">${n(i)}</button>`:`<strong>${n(i)}</strong>`,w=Array.isArray(s.articles)?s.articles:[],f=w.length?`<div class="law-answer-articles-label">\u76F8\u95DC\u689D\u6587</div>
          <div class="law-answer-articles">${w.map(v=>{let x=String(v.article_no||"").trim(),b=Yn(v.article_content);return!a||!x?`<div class="law-answer-article is-static">
                  <span class="law-answer-article-no">${n(x||"\u689D\u6587")}</span>
                  <span class="law-answer-article-text">${n(b)}</span>
                </div>`:`<button class="law-answer-article" type="button"
                data-action="open-law-source"
                data-law-key="${n(a)}"
                data-source-type="${n(r)}"
                data-article-no="${n(x)}"
                title="\u9EDE\u64CA\u67E5\u770B ${n(x)} \u7684\u5B8C\u6574\u5167\u5BB9"
                aria-label="\u958B\u555F ${n(i)} ${n(x)} \u7684\u5B8C\u6574\u689D\u6587">
                <span class="law-answer-article-no">${n(x)}</span>
                <span class="law-answer-article-text">${n(b)}</span>
              </button>`}).join("")}</div>`:"";return`<div class="law-answer-source">
        <div class="law-answer-source-head">
          ${h}
          <span class="law-answer-source-meta">\uFF08${n(o)}\uFF0C${c(l)} \u689D\uFF09</span>
          ${m}
        </div>
        ${f}
      </div>`}).join("")}</div>`}function Zn(e,t){if(!Array.isArray(e)||!e.length)return"";let s=new Map((Array.isArray(t)?t:[]).map(a=>[String(a.law_name||""),a]));return`<div class="answer-section-label" style="margin-top:18px">
      <span>\u547D\u4E2D\u8A5E\u5F59</span>
    </div>
    <div class="chips">${e.map(a=>{let r=s.get(String(a));return r?.law_key?qt(a,{lawKey:r.law_key,sourceType:r.source_type||""}):`<span class="chip">${n(a)}</span>`}).join("")}</div>`}function ta(e){let t=Array.isArray(e.citations)?e.citations:[],s=Array.isArray(e.judgments)?e.judgments:[],a=Array.isArray(e.law_sources)?e.law_sources:[],r=Array.isArray(e.matched_terms)?e.matched_terms:[],i=e.status||"preview",o=!!e.partial,l=!!e.streaming,m=!!e.show_sources||!o,h=s.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u5224\u6C7A \xB7 ${s.length} \u7B46</span>
        <span>vector retrieval \xB7 [\u7DE8\u865F] \u5C0D\u61C9\u56DE\u7B54\u5F15\u7528</span>
      </div>
      <div class="citation-list">${s.map((H,ce)=>Vn(H,ce)).join("")}</div>`:"",w=a.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4 \xB7 ${a.length} \u7B46</span>
        <span>PostgreSQL metadata \xB7 Parquet \u689D\u6587</span>
      </div>
      <div class="citation-list">${a.map((H,ce)=>Kn(H,ce)).join("")}</div>`:"",f=!s.length&&t.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F \xB7 ${t.length} \u7B46</span>
        <span>metadata match</span>
      </div>
      <div class="citation-list">${t.map((H,ce)=>Wn(H,ce)).join("")}</div>`:"",v=m?h+w+f:"";!v&&!o&&(v=`<div class="answer-divider"></div>
      ${we({iconName:"file",title:"\u6C92\u6709\u53EF\u5F15\u7528\u7684\u4F86\u6E90",text:i==="retrieval_only"?"\u76EE\u524D\u5DF2\u5EFA\u7ACB\u7684\u5411\u91CF\u7D22\u5F15\u4E2D\u6C92\u6709\u8DB3\u5920\u76F8\u4F3C\u7684\u5224\u6C7A\uFF0C\u4E5F\u6C92\u6709\u53EF\u5C0D\u61C9\u7684\u6CD5\u898F\u6216\u547D\u4EE4\u3002\u7CFB\u7D71\u4E0D\u6703\u5728\u6C92\u6709\u4F86\u6E90\u6642\u751F\u6210\u7B54\u6848\u3002":"\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u4E14\u554F\u984C\u4E2D\u6C92\u6709\u53EF\u76F4\u63A5\u5C0D\u61C9\u7684\u73FE\u884C\u6CD5\u898F\u540D\u7A31\u3002"})}`);let x=Zn(r,a),b=e.test_run,y=String(e.llm_model||b?.primary_model||"").trim(),C=String(e.embedding_model||"").trim(),L=[y?`LLM\uFF1A${y}`:"",C?`Embedding\uFF1A${C}`:""].filter(Boolean).join(" \xB7 "),_=e.answer_source==="structured",E=String(e.law_answer||"").trim(),z=e.law_framework||null,Q=Array.isArray(z?.rows)?z.rows:[],Z=Array.isArray(z?.sources)?z.sources:[],ie=Q.length>0,I=!!E&&!_&&!ie,P=l||e.answer_source==="llm"?"LLM \u7D9C\u5408\u56DE\u7B54":"\u6AA2\u7D22\u7D50\u679C\u6458\u8981",k=ie?`<div class="answer-block law-framework-block">
        <div class="answer-block-head">
          <span>${n(z.title||"\u76F8\u95DC\u6CD5\u898F\u7684\u8CAC\u4EFB\u67B6\u69CB")}</span>
          <span>${Q.length} \u689D</span>
        </div>
        <div class="table-wrap law-framework-table-wrap">
          <table class="data-table is-compact law-framework-table">
            <thead>
              <tr><th scope="col">\u6CD5\u898F</th><th scope="col">\u689D\u6587</th><th scope="col">\u898F\u7BC4\u91CD\u9EDE</th></tr>
            </thead>
            <tbody>
              ${Q.map(H=>`<tr>
                    <td>${n(H.law_name||"\u2014")}</td>
                    <td class="cell-number">${n(H.article_no||"\u2014")}</td>
                    <td>${n(H.focus||"\u2014")}</td>
                  </tr>`).join("")}
            </tbody>
          </table>
        </div>
        ${Z.length?`<div class="law-framework-sources">
                <span>\u6CD5\u898F\u4F86\u6E90</span>
                ${Z.map(H=>{let ce=String(H?.law_name||H||"").trim(),je=H&&H.index!==null&&H.index!==void 0?` [${n(H.index)}]`:"";return qt(ce,{label:`${ce}${je}`})}).join("")}
              </div>`:""}
      </div>`:"",T=e.answer_source==="llm"&&y?`<span class="answer-model" title="${n(L)}">${$("brain",11)}${n(y)}</span>`:_?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${$("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"",B=l?`${y||"LLM"} \xB7 \u751F\u6210\u4E2D`:T?y||"structured":"retrieval",J=b?`<div class="test-run-summary">
        <div class="test-run-summary-head">
          <span class="badge badge-warn">\u6E2C\u8A66\u6A21\u5F0F</span>
          ${Y(b.status)}
          <span class="mono">${n(b.run_id||"")}</span>
        </div>
        <div class="test-run-summary-body">
          <span>Embedding ${Number(b.models?.embedding?.length||0)} \u500B</span>
          <span>LLM ${Number(b.models?.llm?.length||0)} \u500B</span>
          <span>\u4E3B\u56DE\u7B54 ${n(b.primary_model||"\u2014")}</span>
          <span>${Number(b.total_ms||0)} ms</span>
          <a href="#/performance">\u67E5\u770B\u6E2C\u8A66 Flow</a>
        </div>
      </div>`:"",qe=String(e.answer||"").trim()||(l?"\u6B63\u5728\u751F\u6210\u56DE\u7B54\u2026":o?"\u6B63\u5728\u6AA2\u7D22\u5224\u6C7A\u4E26\u751F\u6210 LLM \u56DE\u7B54\u2026":"\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u56DE\u7B54\u3002"),ue=l?" data-partial-answer":"",ye=l?" is-streaming":"";return`${k}
      ${I?`<div class="answer-block law-answer-block">
              <div class="answer-block-head">
                <span>\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22\u7D50\u679C</span>
                <span>${o&&!m?"\u6CD5\u898F\u8CC7\u6599\u5EAB":`${a.length} \u7B46\u4F86\u6E90`}</span>
              </div>
              <div class="law-answer-content">${Xn(a,E)}</div>
            </div>`:""}
      <div class="answer-block">
        ${I||ie?`<div class="answer-block-head">
                <span>${n(P)}</span>
                <span>${n(B)}</span>
              </div>`:""}
        <p class="answer-text${ye}"${ue}>${n(qe)}</p>
      </div>
      ${e.notice?`<div class="answer-notice">${n(e.notice)}</div>`:""}
      ${J}
      ${x}
      ${v}`}function er(e,t,s=""){let a=t.status||"preview",r=a==="operational"?"\u5B8C\u6210":a==="retrieval_only"?"\u50C5\u6AA2\u7D22\u7D50\u679C":a==="preview"?"\u6CD5\u898F\u9810\u89BD":a==="unavailable"||a==="not_configured"?"\u8CC7\u6599\u4E0D\u53EF\u7528":a==="degraded"?"\u964D\u7D1A":"\u5B8C\u6210",i=t.test_run,o=String(t.llm_model||i?.primary_model||"").trim(),l=String(t.embedding_model||"").trim(),m=[o?`LLM\uFF1A${o}`:"",l?`Embedding\uFF1A${l}`:""].filter(Boolean).join(" \xB7 "),h=t.answer_source==="structured",w=t.answer_source==="llm"&&o?`<span class="answer-model" title="${n(m)}">${$("brain",11)}${n(o)}</span>`:h?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${$("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"";return`<div class="answer-head">
      <div class="answer-head-left">${$("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u7D50\u679C</span>
      </div>
      <div class="answer-head-meta">
        ${Y(a,r)}
        <span>${Number(t.duration_ms||0)} ms</span>
        ${w}
      </div>
      ${s}
    </div>
    <div class="answer-body">${ta(t)}</div>`}function tr(e,t=""){return`<div class="answer-head">
      <div class="answer-head-left">${$("alert",16)}
        <span class="answer-head-title">\u7121\u6CD5\u5B8C\u6210\u6AA2\u7D22</span>
      </div>
      ${t}
    </div>
    <div class="answer-body">
      ${X({tone:"danger",title:"\u8ACB\u6C42\u5931\u6557",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
    </div>`}function sr(e){return e.length?e.map((t,s)=>{let a=Array.isArray(t.payload?.citations)?t.payload.citations.length:0,r=Array.isArray(t.payload?.judgments)?t.payload.judgments.length:0,i=Array.isArray(t.payload?.law_sources)?t.payload.law_sources.length:0,o=a+r+i;return`<button class="history-item" type="button" data-history-index="${s}">
        <span class="history-question">${n(t.title||"\u672A\u547D\u540D\u63D0\u554F")}</span>
        <span class="history-meta">
          <span>${n(st(t.created_at))}</span>
          <span>\xB7</span>
          <span>${o?`${o} \u7B46\u4F86\u6E90`:"\u7121\u5F15\u7528"}</span>
        </span>
      </button>`}).join(""):'<div class="history-empty">\u5C1A\u7121\u63D0\u554F\u7D00\u9304\u3002\u9001\u51FA\u7B2C\u4E00\u500B\u554F\u984C\u5F8C\u6703\u4FDD\u5B58\u5728\u6B64\u700F\u89BD\u5668\u3002</div>'}async function ar(e){let t=!1,s=[],a="",r=!1,i={embedding:[],llm:[]};e.innerHTML=`<section class="page rag-page">
    <header class="rag-hero">
      <span class="eyebrow">JUDGMENT \xB7 LEGAL RAG</span>
      <h1 class="rag-title">\u8B93\u6BCF\u4E00\u500B\u7B54\u6848\uFF0C\u90FD\u80FD\u56DE\u5230\u6CD5\u898F\u8207\u5224\u6C7A</h1>
      <p class="rag-lead">\u4EE5\u91D1\u878D\u6CD5\u898F\u7684\u73FE\u884C\u689D\u6587\u8207\u5224\u6C7A\u7247\u6BB5\u70BA\u6AA2\u7D22\u57FA\u790E\u3002
        \u5148\u5F9E Qdrant \u6AA2\u7D22\u76F8\u4F3C\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\uFF1B\u82E5\u7D22\u5F15\u6216\u6A21\u578B\u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u53EF\u9A57\u8B49\u7684\u6AA2\u7D22\u7D50\u679C\u3002</p>
      <div id="rag-mode-notice">${X({tone:"info",title:"RAG \u670D\u52D9\u72C0\u614B\u6AA2\u67E5\u4E2D",text:"\u6B63\u5728\u78BA\u8A8D Qdrant\u3001Embedding \u8207 LLM \u72C0\u614B\uFF1B\u6240\u6709\u56DE\u7B54\u90FD\u6703\u6A19\u793A\u53EF\u56DE\u6EAF\u7684\u4F86\u6E90\u3002"})}</div>
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
            ${$("sparkles",16)}<span>\u958B\u59CB\u6AA2\u7D22</span>
          </button>
        </div>
      </form>
      <div class="example-chips" id="example-chips" aria-label="\u7BC4\u4F8B\u554F\u984C">
        ${Fn.map(u=>`<button class="example-chip" type="button" data-question="${n(u)}">${n(u)}</button>`).join("")}
      </div>
    </header>

    <div class="rag-grid">
      <section class="card answer-card" id="answer-card" aria-live="polite">
        ${Hn()}
      </section>

      <aside class="rag-side">
        <section class="card">
          <div class="side-card-head">
            <span class="side-card-title">${$("database",14)}\u8CC7\u6599\u73FE\u6CC1</span>
            <span id="rag-stats-mode" class="badge badge-neutral badge-mono">\u8B80\u53D6\u4E2D</span>
          </div>
          <div class="side-card-body" id="rag-stats">
            <div class="skeleton skeleton-line" style="width:88%"></div>
            <div class="skeleton skeleton-line" style="width:64%"></div>
            <div class="skeleton skeleton-line" style="width:74%"></div>
          </div>
          <div class="side-card-foot">
            PostgreSQL \u5224\u6C7A\u6587\u4EF6\u3001Qdrant \u5411\u91CF\u7D22\u5F15\u8207 Ollama \u6A21\u578B\u72C0\u614B\u7686\u70BA\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u5C31\u7DD2\u6642\u6703\u660E\u78BA\u964D\u7D1A\u3002
          </div>
        </section>

        <section class="card">
          <div class="side-card-head">
            <span class="side-card-title">${$("history",14)}\u6700\u8FD1\u63D0\u554F</span>
            <button class="btn btn-ghost btn-sm" type="button" id="rag-clear-history">\u6E05\u9664</button>
          </div>
          <div class="history-list" id="rag-history">
            <div class="history-empty">\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u4E2D\u2026</div>
          </div>
          <div class="side-card-foot" id="rag-storage-note">
            \u63D0\u554F\u7D00\u9304\u5132\u5B58\u5728\u700F\u89BD\u5668 IndexedDB\uFF0C\u4E0D\u6703\u4E0A\u50B3\u5230\u4F3A\u670D\u5668\u3002
          </div>
        </section>
      </aside>
    </div>
    <div id="rag-test-flow" class="rag-test-flow"></div>
    <dialog id="rag-judgment-dialog" class="judgment-dialog"></dialog>
    <dialog id="rag-law-dialog" class="judgment-dialog law-dialog"></dialog>
  </section>`;let o=e.querySelector("#rag-form"),l=e.querySelector("#rag-question"),m=e.querySelector("#rag-submit"),h=e.querySelector("#answer-card"),w=e.querySelector("#rag-stats"),f=e.querySelector("#rag-stats-mode"),v=e.querySelector("#rag-history"),x=e.querySelector("#rag-storage-note"),b=e.querySelector("#rag-clear-history"),y=e.querySelector("#rag-test-mode"),C=e.querySelector("#rag-test-flow"),L=e.querySelector("#rag-judgment-dialog"),_=e.querySelector("#rag-law-dialog"),E=()=>{document.documentElement.classList.toggle("dialog-open",!!e.querySelector("dialog[open]"))};L?.addEventListener("close",E),_?.addEventListener("close",E);let z=null,Q=null,Z=()=>{l.style.height="auto",l.style.height=`${Math.min(l.scrollHeight,220)}px`},ie=async()=>{try{if(s=await _t({limit:6}),t)return;v.innerHTML=sr(s),x.textContent=yt()==="indexeddb"?"\u63D0\u554F\u7D00\u9304\u5132\u5B58\u5728\u700F\u89BD\u5668 IndexedDB\uFF0C\u4E0D\u6703\u4E0A\u50B3\u5230\u4F3A\u670D\u5668\u3002":"\u700F\u89BD\u5668\u5132\u5B58\u4E0D\u53EF\u7528\uFF0C\u63D0\u554F\u7D00\u9304\u53EA\u4FDD\u7559\u5728\u672C\u6B21\u5DE5\u4F5C\u968E\u6BB5\u3002"}catch{if(t)return;v.innerHTML='<div class="history-empty">\u7121\u6CD5\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u3002</div>'}},I=async()=>{try{let u=await U.status();if(t)return;let q=u.data||{},R=new Map((u.services||[]).map(Me=>[Me.id,Me])),te=R.get("qdrant"),ae=R.get("embedding"),ee=R.get("rag"),le=R.get("llm"),De=Number(q.judgment_indexed_count||0),V=Number(q.judgment_count||0),fe=V?(De/V*100).toFixed(1):"0.0",xe=q.judgment_vector_points===null||q.judgment_vector_points===void 0?"\u2014":c(q.judgment_vector_points);w.innerHTML=`<div class="mini-stats">
          <div class="mini-stat">
            <div class="mini-stat-value">${c(V)}</div>
            <div class="mini-stat-label">\u5224\u6C7A</div>
          </div>
          <div class="mini-stat">
            <div class="mini-stat-value">${c(De)}</div>
            <div class="mini-stat-label">\u5DF2\u7D22\u5F15</div>
          </div>
          <div class="mini-stat">
            <div class="mini-stat-value">${fe}%</div>
            <div class="mini-stat-label">\u7D22\u5F15\u8986\u84CB</div>
          </div>
        </div>
        <div class="side-status-list">
          <div class="side-status-row">
            <span>${$("cube",13)}Qdrant \u5411\u91CF\u7D22\u5F15</span>
            ${Y(te?.status,te?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
          </div>
          <div class="side-status-row">
            <span>${$("layers",13)}Embedding\uFF08${n(q.judgment_vector_model||"\u2014")}\uFF09</span>
            ${Y(ae?.status,ae?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
          </div>
          <div class="side-status-row">
            <span>${$("brain",13)}RAG \u56DE\u7B54\u7BA1\u7DDA</span>
            ${Y(ee?.status,ee?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
          </div>
          <div class="side-status-row">
            <span>${$("sparkles",13)}LLM \u6A21\u578B</span>
            ${Y(le?.status,le?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
          </div>
        </div>
        <div class="side-card-foot" style="padding:0;border:0;margin-top:10px">
          Collection\uFF1A${n(q.judgment_vector_collection||"\u2014")} \xB7
          ${xe} points \xB7 \u5269\u9918 ${c(q.judgment_index_remaining)} \u7B46\u5F85\u7D22\u5F15
        </div>`;let Le=e.querySelector("#rag-mode-notice");Le&&(ee?.status==="operational"?Le.innerHTML=X({tone:"ok",title:"\u6AA2\u7D22\u8207\u56DE\u7B54\u5C31\u7DD2",text:`Qdrant\u3001Embedding \u8207 LLM \u5747\u53EF\u4F7F\u7528\uFF1B\u76EE\u524D\u7D22\u5F15\u6DB5\u84CB ${c(De)} / ${c(V)} \u7B46\u5224\u6C7A\u3002\u56DE\u7B54\u4E0D\u662F\u6CD5\u5F8B\u610F\u898B\u3002`}):ee?.status==="degraded"?Le.innerHTML=X({tone:"warn",title:"\u90E8\u5206 AI \u5143\u4EF6\u672A\u5C31\u7DD2",text:n(ee.detail||"RAG \u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u6AA2\u7D22\u7D50\u679C\u3002")}):Le.innerHTML=X({tone:"info",title:"\u5411\u91CF\u7D22\u5F15\u5C1A\u672A\u5C31\u7DD2 \xB7 \u4E0D\u662F\u6CD5\u5F8B\u610F\u898B",text:n(ee?.detail||"\u8A2D\u5B9A QDRANT_URL\u3001EMBEDDING_URL \u8207 LLM_URL \u4E26\u57F7\u884C judgment-index-vectors \u5F8C\u5373\u53EF\u555F\u7528\u5224\u6C7A\u6AA2\u7D22\u3002")})),f.className=`badge ${ee?.status==="operational"?"badge-ok":ee?.status==="not_configured"?"badge-neutral":"badge-warn"} badge-mono`,f.textContent=ee?.status==="operational"?"RAG \u5C31\u7DD2":ee?.status==="not_configured"?"\u672A\u8A2D\u5B9A":"\u964D\u7D1A"}catch{if(t)return;w.innerHTML='<p class="muted" style="font-size:11px">\u76EE\u524D\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002</p>',f.className="badge badge-danger badge-mono",f.textContent="\u96E2\u7DDA"}},P=()=>{if(!y)return;if(!r){y.innerHTML="";return}let u=Array.isArray(i.embedding)?i.embedding.length:0,q=Array.isArray(i.llm)?i.llm.length:0;y.innerHTML=X({tone:"warn",title:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F",text:`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${u} \u500B embedding \u8207 ${q} \u500B LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002\u6E2C\u8A66 Flow \u6703\u5728\u9801\u9762\u4E0B\u65B9\u5373\u6642\u986F\u793A\uFF0C\u4E5F\u53EF\u5230 <a href="#/tests">\u7CFB\u7D71\u6E2C\u8A66</a> \u6216 <a href="#/performance">\u6548\u80FD\u5831\u8868</a> \u67E5\u770B\u6B77\u53F2\u3002`})},k=async()=>{try{let u=await U.testMode();if(t)return;r=!!u.enabled,i=u.models||{embedding:[],llm:[]},P()}catch{if(t)return;r=!1,P()}},T=u=>{r=!!u.detail?.enabled,i=u.detail?.models||{embedding:[],llm:[]},P()};window.addEventListener("judgment:test-mode",T);let B=u=>{C&&(Q=u||null,C.innerHTML=u?nt(u,[],"",{showHistory:!1}):"")},J=()=>{z&&(window.clearTimeout(z),z=null)},$e=()=>{J();let u=async()=>{if(!t){try{let q=await U.testRunCurrent();if(t)return;let R=q.run;R&&R.status==="running"&&B(R)}catch{}t||(z=window.setTimeout(u,1500))}};u()},qe=async u=>{if(!u){B(null);return}try{let q=await U.testRun(u);if(t)return;B(q.run||null)}catch{t||D("\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF0C\u4F46\u7121\u6CD5\u8F09\u5165\u6E2C\u8A66 Flow\u3002","warn")}},ue=async()=>{if(r)try{let u=await U.testRunCurrent();if(t)return;u.run?.status==="running"&&(B(u.run),$e())}catch{}},ye=0,H=(u,q)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">DB ORIGINAL JUDGMENT</div>
      <h2>${n(u)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-parquet-judgment" aria-label="\u95DC\u9589">${$("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${q}</div>`,ce=u=>{let q=(Array.isArray(u.matched_laws)?u.matched_laws:[]).map(ee=>qt(ee)).join(""),R=[u.court,u.jdate,u.title?`\u6848\u7531\uFF1A${u.title}`:"",u.full_text_length?`${c(u.full_text_length)} \u5B57`:"",u.citation_count?`\u5F15\u7528 ${c(u.citation_count)} \u7B46`:""].filter(Boolean).map(ee=>`<span>${n(ee)}</span>`).join(""),te=u.parquet_generated_at?`DB \u5132\u5B58\u539F\u6587\uFF08\u539F\u59CB Parquet\uFF09\xB7 ${n(String(u.parquet_generated_at).replace("T"," ").slice(0,19))}`:"DB \u5132\u5B58\u539F\u6587",ae=u.pdf_url?`<a class="btn btn-secondary btn-sm" href="${n(u.pdf_url)}" target="_blank" rel="noopener noreferrer">${$("external",13)}<span>\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF</span></a>`:"";return H(u.jid||"\u5224\u6C7A\u5168\u6587",`<div class="judgment-dialog-meta">
        <span class="badge badge-info">${n(u.source==="parquet"?"DB \u5132\u5B58\u539F\u6587":"PostgreSQL")}</span>
        ${R}
      </div>
      ${q?`<div class="chips" style="margin:8px 0 10px">${q}</div>`:""}
      <div class="judgment-dialog-source">${te}</div>
      <pre class="judgment-dialog-text">${n(u.full_text||"\u6B64\u5224\u6C7A\u6C92\u6709\u5168\u6587\u3002")}</pre>
      <div class="judgment-dialog-actions">
        ${ae}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-parquet-judgment">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},je=async u=>{if(!L||!u)return;let q=++ye;L.open||L.showModal(),E(),L.innerHTML=H("\u8B80\u53D6\u5224\u6C7A\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E DB \u5132\u5B58\u539F\u6587\u8B80\u53D6 ${n(u)}\u2026</span>
      </div>`);try{let R=await U.judgmentDetail(u,"parquet");if(t||q!==ye)return;L.innerHTML=ce(R)}catch(R){if(t||q!==ye)return;L.innerHTML=H("\u7121\u6CD5\u8B80\u53D6 DB \u539F\u6587\u5224\u6C7A",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${n(R.message||"\u627E\u4E0D\u5230\u5224\u6C7A\u5168\u6587\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u5DF2\u57F7\u884C <span class="mono">uv run judgment-import-judgments --raw-only</span>\uFF0C\u4E14\u539F\u59CB Parquet \u5B58\u5728\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-parquet-judgment">\u95DC\u9589</button>
        </div>`)}},Se=0,Ee=(u,q)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">LOCAL PARQUET LAW</div>
      <h2>${n(u)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-law-source" aria-label="\u95DC\u9589">${$("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${q}</div>`,Ae=(u,q="")=>{let R=String(u.selected_article_no||q||"").trim(),te=!!R,ae=Array.isArray(u.articles)?u.articles:[],ee=ae.map(me=>{let Qe=String(me.article_content||"").trim();return Qe?me.article_type==="C"?`<div class="law-chapter">${n(Qe)}</div>`:`<article class="law-article" data-article-no="${n(ea(me.article_no))}">
          <div class="law-article-head">
            <span class="law-article-no">${n(me.article_no||"\u689D\u6587")}</span>
          </div>
          <div class="law-article-text">${n(Qe)}</div>
        </article>`:""}).join(""),le=(Array.isArray(u.warnings)?u.warnings:[]).map(me=>n(me)).join("<br />"),De=u.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F",V=u.meta?.articles_source,fe=V==="parquet"?"Parquet \u689D\u6587":V==="postgresql"?"PostgreSQL \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",xe=u.meta?.snapshot||"",Le=[u.law_level,u.law_category,u.article_count?`${c(u.article_count)} \u689D`:"",u.law_modified_date?`\u7570\u52D5 ${Ne(u.law_modified_date)}`:""].filter(Boolean).map(me=>`<span>${n(me)}</span>`).join(""),Me=u.law_url?`<a class="btn btn-secondary btn-sm" href="${n(u.law_url)}" target="_blank" rel="noopener noreferrer">${$("external",13)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:"",Pe=!te&&u.law_histories?`<details class="law-dialog-history">
          <summary>\u6CD5\u898F\u6CBF\u9769</summary>
          <div>${n(u.law_histories)}</div>
        </details>`:"",mt=te?`<span class="badge badge-mono">${n(R)}</span>`:"",vt=!te&&ae.length>1?`<div class="law-dialog-jump">
          <div class="law-article-jump">
            <input class="input law-article-jump-input law-jump-input"
              id="rag-law-article-jump" type="text" inputmode="numeric"
              autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
            <button class="btn btn-secondary btn-sm" type="button"
              data-action="jump-law-article"
              data-jump-input="rag-law-article-jump">\u8DF3\u81F3\u689D\u6587</button>
          </div>
        </div>`:"",Bt=te?`${u.law_name||u.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4"} \xB7 ${R}`:u.law_name||u.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4";return Ee(Bt,`<div class="judgment-dialog-meta">
        <span class="badge ${u.source_type==="order"?"badge-warn":"badge-info"}">${n(De)}</span>
        ${mt}
        ${Le}
      </div>
      <div class="judgment-dialog-source">${n([fe,xe].filter(Boolean).join(" \xB7 "))}</div>
      ${le?`<div class="law-dialog-warning">${le}</div>`:""}
      ${Pe}
      ${vt}
      <div class="law-dialog-articles">${ee||`<div class="report-empty-inline">${te?"\u9019\u689D\u689D\u6587\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u5167\u5BB9\u3002":"\u9019\u500B\u6CD5\u898F\uFF0F\u547D\u4EE4\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u3002"}</div>`}</div>
      <div class="judgment-dialog-actions">
        ${Me}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-law-source">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},Oe=(u,q)=>{let R=u?.querySelector(`#${q}`),te=ea(R?.value||"");if(!te){D("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),R?.focus();return}let ae=[...u?.querySelectorAll("[data-article-no]")||[]].find(ee=>ee.dataset.articleNo===te);if(!ae){D(`\u627E\u4E0D\u5230\u7B2C ${te} \u689D\u3002`,"warn");return}ae.scrollIntoView({behavior:"instant",block:"center"}),ae.classList.add("is-jump-target"),window.setTimeout(()=>ae.classList.remove("is-jump-target"),2400)},N=async(u,q="",R="")=>{if(!_||!u)return;let te=++Se;_.open||_.showModal(),E(),_.innerHTML=Ee(R?"\u8B80\u53D6\u6CD5\u898F\u689D\u6587\u4E2D\u2026":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E\u672C\u5730 Parquet \u8B80\u53D6 ${n([u,R].filter(Boolean).join(" \xB7 "))} \u7684\u539F\u59CB\u689D\u6587\u2026</span>
      </div>`);try{let ae=await U.lawDetail(u,q,"",R);if(t||te!==Se)return;_.innerHTML=Ae(ae,R)}catch(ae){if(t||te!==Se)return;_.innerHTML=Ee("\u7121\u6CD5\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u6587",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${n(ae.message||"\u627E\u4E0D\u5230\u689D\u6587\u5167\u5BB9\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u672C\u5730\u539F\u59CB\u6CD5\u898F Parquet \u5B58\u5728\uFF0C\u4E14 PostgreSQL metadata \u8207\u5176\u4E00\u81F4\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-law-source">\u95DC\u9589</button>
        </div>`)}};_?.addEventListener("click",u=>{let q=u.target.closest('[data-action="jump-law-article"]');if(q){Oe(_,q.dataset.jumpInput||"rag-law-article-jump");return}if(u.target.closest('[data-action="close-law-source"]')){_.close();return}let R=_.getBoundingClientRect();(u.clientX<R.left||u.clientX>R.right||u.clientY<R.top||u.clientY>R.bottom)&&_.close()}),_?.addEventListener("keydown",u=>{!u.target.matches(".law-jump-input")||u.key!=="Enter"||(u.preventDefault(),Oe(_,u.target.id))}),L?.addEventListener("click",u=>{let q=u.target.closest('[data-action="open-law-source"]');if(q){N(q.dataset.lawKey||"",q.dataset.sourceType||"",q.dataset.articleNo||"");return}if(u.target.closest('[data-action="close-parquet-judgment"]')){L.close();return}let R=L.getBoundingClientRect();(u.clientX<R.left||u.clientX>R.right||u.clientY<R.top||u.clientY>R.bottom)&&L.close()}),h.addEventListener("click",u=>{let q=u.target.closest(".rag-process-toggle");if(q){let te=q.closest(".rag-process"),ae=q.getAttribute("aria-expanded")==="true";ls(te,!ae);return}let R=u.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(R){if(R.dataset.action==="open-law-source"){N(R.dataset.lawKey||"",R.dataset.sourceType||"",R.dataset.articleNo||"");return}je(R.dataset.jid||"")}}),h.addEventListener("keydown",u=>{if(u.key!=="Enter"&&u.key!==" ")return;let q=u.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(!(!q||q.closest("a, button"))){if(u.preventDefault(),q.dataset.action==="open-law-source"){N(q.dataset.lawKey||"",q.dataset.sourceType||"",q.dataset.articleNo||"");return}je(q.dataset.jid||"")}});let G=async u=>{let q=u.trim();if(!q){D("\u8ACB\u5148\u8F38\u5165\u554F\u984C\u3002","warn"),l.focus();return}a=q,l.value=q,Z(),h.innerHTML=Jn(q,r);let R=r?null:Qn(h);r?(B(null),$e()):(J(),B(null)),W(m,!0,"\u6AA2\u7D22\u4E2D\u2026");let te=null,ae="",ee=V=>{if(t||!V?.partial)return;let fe=h.querySelector(".answer-body");if(!fe)return;te=V,ae=String(V.answer||""),fe.innerHTML=ta(V),R?.collapse?.();let xe=h.querySelector(".answer-head-title");xe&&(xe.textContent=V.streaming?"LLM \u56DE\u7B54\u751F\u6210\u4E2D":"\u6CD5\u898F\u7D50\u679C\u5DF2\u986F\u793A")},le=V=>{if(t||!V||!te?.streaming)return;ae+=V;let fe=h.querySelector("[data-partial-answer]");fe&&(fe.textContent=ae)},De=()=>{if(t||!te?.streaming)return;ae="";let V=h.querySelector("[data-partial-answer]");V&&(V.textContent="\u6B63\u5728\u91CD\u65B0\u751F\u6210\u56DE\u7B54\u2026")};try{let V=r?await U.rag(q,{testMode:r}):await U.ragStream(q,{onStep:Pe=>R?.step(Pe),onPartial:ee,onToken:le,onTokenReset:De});if(t)return;J();let fe=R?.finish(!0)||"";h.innerHTML=er(q,V,fe),V.test_run?.run_id?await qe(V.test_run.run_id):B(null);let xe=Array.isArray(V.citations)?V.citations:[],Le=Array.isArray(V.judgments)?V.judgments:[],Me=xe.length+Le.length;await wt({kind:"rag",title:q,detail:`${V.status||"preview"} \xB7 ${Me} \u7B46\u4F86\u6E90`,payload:{question:q,status:V.status,citations:xe.map(Pe=>Pe.law_name),judgments:Le.map(Pe=>Pe.jid)}}),await ie()}catch(V){if(J(),t)return;let fe=R?.finish(!1)||"";h.innerHTML=tr(V,fe),D(V.message||"\u6AA2\u7D22\u5931\u6557\u3002","danger")}finally{J(),t||W(m,!1)}};return o.addEventListener("submit",u=>{u.preventDefault(),G(l.value)}),l.addEventListener("input",Z),l.addEventListener("keydown",u=>{u.key==="Enter"&&!u.shiftKey&&!u.isComposing&&(u.preventDefault(),o.requestSubmit())}),e.querySelector("#example-chips").addEventListener("click",u=>{let q=u.target.closest("[data-question]");q&&(l.value=q.dataset.question,Z(),o.requestSubmit())}),v.addEventListener("click",u=>{let q=u.target.closest("[data-history-index]");if(!q)return;let R=s[Number(q.dataset.historyIndex)];R&&(l.value=R.title,Z(),G(R.title))}),b.addEventListener("click",async()=>{if(!s.length){D("\u76EE\u524D\u6C92\u6709\u53EF\u6E05\u9664\u7684\u63D0\u554F\u7D00\u9304\u3002","info");return}window.confirm("\u78BA\u5B9A\u6E05\u9664\u9019\u500B\u700F\u89BD\u5668\u7684\u6240\u6709\u63D0\u554F\u7D00\u9304\uFF1F")&&(await Ms(),await ie(),D("\u5DF2\u6E05\u9664\u672C\u6A5F\u63D0\u554F\u7D00\u9304\u3002","ok"))}),Z(),await Promise.allSettled([I(),ie(),k()]),await ue(),()=>{t=!0,J(),document.documentElement.classList.remove("dialog-open"),window.removeEventListener("judgment:test-mode",T),a&&h.setAttribute("data-last-question",a)}}var ds={};Je(ds,{render:()=>qr});var nr=2e3,rr={running:{label:"\u57F7\u884C\u4E2D",tone:"info"},success:{label:"\u5B8C\u6210",tone:"ok"},failed:{label:"\u5931\u6557",tone:"danger"},interrupted:{label:"\u5DF2\u4E2D\u6B62",tone:"warn"},stale:{label:"\u72C0\u614B\u5931\u6548",tone:"warn"},skipped:{label:"\u7565\u904E",tone:"idle"},pending:{label:"\u7B49\u5F85",tone:"idle"},idle:{label:"\u5F85\u547D",tone:"idle"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},operational:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},unavailable:{label:"\u7121\u6CD5\u53D6\u5F97",tone:"danger"},missing:{label:"\u5C1A\u7121\u7D00\u9304",tone:"idle"},error:{label:"\u8B80\u53D6\u5931\u6557",tone:"danger"},ok:{label:"\u6B63\u5E38",tone:"ok"}},sa={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},aa={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},ca={judgment:"\u5224\u6C7A",law:"\u6CD5\u898F",order:"\u547D\u4EE4",system:"\u7CFB\u7D71"},jt={judgment:"#a78bfa",law:"#22d3ee",order:"#f472b6",system:"#94a3b8"},ir={extract:"file",raw_parquet:"cube",filter:"filter",postgres:"database",qdrant:"brain",download:"download",parse:"sliders"},or={raw_parquet:"\u539F\u59CB Parquet",postgres:"PostgreSQL"};function pt(e){return rr[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function he(e,t){let s=pt(e);return`<span class="badge ${sa[s.tone]||sa.idle}"><span class="status-dot ${aa[s.tone]||aa.idle}"></span>${n(t||s.label)}</span>`}function et(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function na(e){return e==null?"\u7121\u6CD5\u53D6\u5F97":c(e)}function rt(e){return e&&e.color?String(e.color):"var(--accent)"}function Et(e,t=""){let s=e.percent===null||e.percent===void 0?null:Math.max(0,Math.min(100,Number(e.percent)||0)),a=e.status==="running"&&s===null,r=a?' aria-valuetext="\u9032\u5EA6\u672A\u77E5"':` aria-valuenow="${s??0}"`;return`<div class="processing-bar${a?" is-indeterminate":""}${t?` ${t}`:""}" role="progressbar" aria-valuemin="0" aria-valuemax="100"${r}>
    <span class="processing-bar-fill" style="width:${s??0}%;background:${n(rt(e))}"></span>
  </div>`}function lr(e){let t=e.unit==="bytes"?"":e.unit||"\u7B46",s=e.current,a=e.total;return s==null?e.status==="running"?"\u9032\u884C\u4E2D":"\u2014":e.unit==="bytes"?a?`${O(s)} / ${O(a)}`:O(s):a?`${c(s)} / ${c(a)} ${t}`:`${c(s)} ${t}`}function cr(e){let t=[`<span>${n(lr(e))}</span>`];return e.percent===null||e.percent===void 0?e.status==="running"&&t.push('<span class="mono">\u9032\u5EA6\u672A\u77E5</span>'):t.push(`<span class="mono">${et(e.percent)}</span>`),e.duration_ms&&t.push(`<span class="mono">${F(e.duration_ms)}</span>`),t.join("")}function dr(e){let s=(Array.isArray(e.stats)?e.stats:[]).map(r=>`<span class="processing-stage-stat"><span>${n(r.label)}</span><strong>${n(r.value)}</strong></span>`),a=e.coverage;return a&&a.indexed!==null&&a.indexed!==void 0&&a.total!==null&&a.total!==void 0&&s.push(`<span class="processing-stage-stat"><span>\u7D22\u5F15\u8986\u84CB</span><strong>${c(a.indexed)} / ${c(a.total)}</strong></span>`),s.length?`<div class="processing-stage-stats">${s.join("")}</div>`:""}function ur(e,{compact:t=!1,step:s=null}={}){let a=pt(e.status),r=e.status==="running";return`<div class="processing-stage${t?" is-compact":""} is-${a.tone}${r?" is-live":""}" style="--stage-color:${n(rt(e))}"${r?' aria-current="step"':""}>
    <div class="processing-stage-head">
      ${s===null?"":`<span class="processing-stage-step">${String(s).padStart(2,"0")}</span>`}
      <span class="processing-stage-swatch" style="background:${n(rt(e))}"></span>
      <span class="processing-stage-label">${n(e.label||e.key)}</span>
      ${he(e.status)}
    </div>
    ${Et(e)}
    <div class="processing-stage-meta">${cr(e)}</div>
    ${e.message?`<div class="processing-stage-message" title="${n(e.message)}">${n(e.message)}</div>`:""}
    ${t?"":dr(e)}
  </div>`}function da(e){let t=pt(e);return`<span class="flow-status is-${t.tone}"><span class="flow-status-dot"></span>${n(t.label)}</span>`}function ra(e,t){return t==null||t===""?"\u2014":e.unit==="bytes"?O(t):c(t)}function pr(e){let t=[{label:"\u76EE\u524D",value:ra(e,e.current)},{label:"\u7E3D\u91CF",value:ra(e,e.total)},{label:"\u767E\u5206\u6BD4",value:e.percent===null||e.percent===void 0?e.status==="running"?"\u8A08\u7B97\u4E2D":"\u2014":et(e.percent)},{label:"\u8017\u6642",value:e.duration_ms?F(e.duration_ms):"\u2014"}],s=Array.isArray(e.stats)?e.stats:[];for(let r of s){if(t.length>=6)break;r&&r.label&&r.value&&t.push({label:String(r.label),value:String(r.value)})}let a=e.coverage;return a&&a.indexed!==null&&a.indexed!==void 0&&a.total!==null&&a.total!==void 0&&!t.some(r=>r.label==="\u7D22\u5F15\u8986\u84CB")&&t.push({label:"\u7D22\u5F15\u8986\u84CB",value:`${c(a.indexed)} / ${c(a.total)}`}),t}function mr(e,t){let s=pt(e.status),a=e.status==="running",r=pr(e);return`<article class="flow-node is-${s.tone}${a?" is-live":""}" style="--stage-color:${n(rt(e))}"${a?' aria-current="step"':""}>
    <div class="flow-node-head">
      <span class="flow-node-icon">${$(ir[e.key]||"cube",14)}</span>
      <div class="flow-node-heading">
        <span class="flow-node-kicker">STEP ${String(t+1).padStart(2,"0")}</span>
        <strong>${n(or[e.key]||e.label||e.key)}</strong>
      </div>
      ${da(e.status)}
    </div>
    <div class="flow-node-body">
      ${Et(e,"flow-progress")}
      <div class="flow-node-props">${r.map(i=>`<div class="flow-prop"><span>${n(i.label)}</span><strong>${n(i.value)}</strong></div>`).join("")}</div>
      ${e.message?`<div class="flow-node-note" title="${n(e.message)}">${n(e.message)}</div>`:""}
    </div>
  </article>`}function vr(e,t,s,a){let r=rt(e),i=a||"#8b5cf6",o=e.status==="running",l=`${s}-${t}`,m=`flow-gradient-${l}`,h=`flow-marker-${l}`,w=t%2===0?"M2 60 C8 42 16 78 22 60":"M2 60 C8 78 16 42 22 60";return`<div class="flow-link${o?" is-live":""}" style="color:${n(r)}" aria-hidden="true">
    <svg viewBox="0 0 28 120" width="28" height="120" fill="none">
      <defs>
        <linearGradient id="${m}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="${n(i)}"/>
          <stop offset="1" stop-color="${n(r)}"/>
        </linearGradient>
        <marker id="${h}" viewBox="0 0 8 8" refX="6.2" refY="4" markerWidth="4.6" markerHeight="4.6" orient="auto">
          <path d="M0 0 8 4 0 8Z" fill="${n(r)}"/>
        </marker>
      </defs>
      <path class="flow-link-line" d="${w}" stroke="url(#${m})" stroke-width="1.7" stroke-linecap="round" marker-end="url(#${h})"/>
      <circle class="flow-link-port" cx="2" cy="60" r="3.6" stroke="${n(i)}" stroke-width="1.5"/>
      <circle class="flow-link-port" cx="26" cy="60" r="3.6" stroke="${n(r)}" stroke-width="1.5"/>
    </svg>
  </div>`}function ua(e){if(!e)return"";let t=[];return e.started_at&&t.push(`\u958B\u59CB ${ne(e.started_at)}`),e.duration_ms&&t.push(`\u8017\u6642 ${F(e.duration_ms)}`),e.pid&&t.push(`PID ${e.pid}`),t.join(" \xB7 ")}function gr(e,{active:t,focus:s,status:a,runLine:r,runningStage:i}){let o=e.label||ca[e.key]||e.key;return`<div class="flow-source${t?" is-live":""}" style="--branch-accent:${jt[e.key]||jt.system}">
    <div class="flow-source-head">
      <span class="flow-source-icon">${$(e.icon||"database",15)}</span>
      <div class="flow-node-heading">
        <span class="flow-node-kicker">SOURCE</span>
        <strong>${n(o)}</strong>
      </div>
      ${da(a)}
    </div>
    <div class="flow-source-body">
      <p class="flow-source-desc">${n(e.description||"")}</p>
      <div class="flow-source-meta">${r}</div>
      ${i?`<div class="flow-source-current"><span class="flow-current-dot"></span>\u76EE\u524D\u968E\u6BB5\uFF1A<strong>${n(i.label||i.key)}</strong></div>`:""}
      ${s&&s.message?`<div class="flow-source-note" title="${n(s.message)}">${n(s.message)}</div>`:""}
    </div>
  </div>`}function fr(e){let t=e.active_run,s=t||e.focus_run||e.last_run,a=t?"running":s?s.status:"idle",r=s?n(ua(s)||st(s.started_at||s.finished_at)):"\u5C1A\u7121\u57F7\u884C\u7D00\u9304",i=Array.isArray(e.stages)?e.stages:[],o=i.find(f=>f.status==="running"),l=jt[e.key]||jt.system,m=String(e.key||"branch").replace(/[^a-zA-Z0-9_-]/g,""),h=gr(e,{active:t,focus:s,status:a,runLine:r,runningStage:o}),w=i.length?i.map((f,v)=>{let x=v?rt(i[v-1]):l;return`${vr(f,v,m,x)}${mr(f,v)}`}).join(""):'<div class="flow-empty">\u6C92\u6709\u53EF\u986F\u793A\u7684\u968E\u6BB5\u3002</div>';return`<article class="flow-lane" style="--branch-accent:${l}"><div class="flow-row">${h}${w}</div></article>`}function br(e){return`<div class="flow-canvas-open">
    <div class="processing-branches">${(Array.isArray(e.branches)?e.branches:[]).map(fr).join("")}</div>
  </div>`}function Ze(e,t,s="",a=""){return`<div class="processing-summary-card">
    <span class="processing-summary-label">${n(e)}</span>
    <span class="processing-summary-value">${t}</span>
    ${s?`<span class="processing-summary-hint">${s}</span>`:""}
    ${a}
  </div>`}function hr(e){let t=e.database||{},s=e.index||{},a=e.local_archives||{},r=e.raw_backups||{},i=r.totals||{},o=e.state||{},l=e.capabilities||{},m=e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D",h=t.status==="operational",w=s.status==="operational",f=a.available!==!1,v=r.available!==!1,x=w?`${c(s.indexed)} / ${c(s.total)}`:he(s.status||"unavailable"),b=w?`${et(s.percent)} \xB7 \u5C1A\u9918 ${c(s.remaining)} \u7B46`:n(s.error||"\u7121\u6CD5\u67E5\u8A62 Qdrant \u7D22\u5F15\u8986\u84CB\u7387\u3002"),y=f?`${c(a.unprocessed)} / ${c(a.total)}`:he("unavailable"),C=f?`\u672A\u8655\u7406 / \u5168\u90E8 \xB7 ${O(a.unprocessed_bytes)} \u5F85\u8655\u7406`:n(a.error||"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304\u3002");return`<div class="processing-summary">
    ${Ze("\u8655\u7406\u72C0\u614B",he(e.status||"unknown"),`${n(m)} \xB7 \u66F4\u65B0\u65BC <span data-processing-updated-at>\u2014</span>`)}
    ${Ze("\u672A\u8655\u7406\u58D3\u7E2E\u6A94",n(y),C)}
    ${Ze("\u539F\u59CB Parquet \u5099\u4EFD",v?`${c(r.count)} \u6A94`:he("unavailable"),v?`\u5171 ${c(i.row_count)} \u7B46 \xB7 ${O(i.compressed_bytes)}`:n(r.error||"\u7121\u6CD5\u6383\u63CF\u539F\u59CB Parquet \u5099\u4EFD\u3002"))}
    ${Ze("PostgreSQL \u5224\u6C7A",h?c(t.judgment_count):he("unavailable"),h?`\u6CD5\u898F ${na(t.law_count)} \xB7 \u547D\u4EE4 ${na(t.order_count)}`:n(t.error||"\u7121\u6CD5\u67E5\u8A62 PostgreSQL\u3002"))}
    ${Ze("Qdrant \u7D22\u5F15",x,b)}
    ${Ze("\u72C0\u614B\u6A94",he(o.status||"missing"),o.updated_at?`\u66F4\u65B0\u65BC ${n(ne(o.updated_at))}`:n(o.detail||"\u5C1A\u7121\u8655\u7406\u72C0\u614B\u7D00\u9304\u3002"))}
    ${Ze("\u5F85\u8655\u7406\u5DE5\u4F5C",l.can_start_update===!1?"\u66AB\u505C\u555F\u52D5":"\u53EF\u958B\u59CB\u66F4\u65B0",l.start_blocked_reason?n(l.start_blocked_reason):`\u672A\u8655\u7406 ${c(l.unprocessed_archives)} \u500B \xB7 \u7D22\u5F15\u5F85\u88DC ${c(l.index_backlog)} \u7B46${l.external_processes?` \xB7 \u5916\u90E8\u7A0B\u5E8F ${c(l.external_processes)} \u500B`:""}`)}
  </div>`}function $r(e){if(e.available===!1)return X({tone:"warn",title:"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304",text:n(e.error||"\u7121\u6CD5\u6383\u63CF .rar \u6A94\u6848\u3002")});let t=Number(e.total)||0,s=Number(e.processed)||0,a=Number(e.unprocessed)||0,r=t?100*s/t:null;return`<div class="processing-archive-summary">
    <div class="processing-archive-summary-head">
      <span class="mono">${n(e.data_dir||"")}</span>
      <span>${c(s)} / ${c(t)} \u5DF2\u8655\u7406 \xB7 ${c(a)} \u5F85\u8655\u7406 \xB7 ${O(e.unprocessed_bytes)} \u5F85\u8655\u7406</span>
    </div>
    ${Et({percent:r,status:a?"pending":"success",color:"var(--success)"},"processing-bar-lg")}
    <div class="processing-archive-summary-meta">
      <span>\u58D3\u7E2E\u6A94\u532F\u5165\u8986\u84CB ${et(r)}</span>
      <span>\u5168\u90E8 ${O(e.total_bytes)}</span>
    </div>
  </div>`}function yr(e){let t=e.stages||{},a=["extract","filter","postgres"].map(r=>t[r]).filter(Boolean).map(r=>ur(r,{compact:!0}));return a.length?`<div class="processing-archive-stages">${a.join("")}</div>`:""}function wr(e){let t=e.status||"pending",s=t==="running",a=e.percent===null||e.percent===void 0?null:Math.max(0,Math.min(100,Number(e.percent)||0)),r=s&&a===null,i=[];return e.message&&i.push(e.message),e.error&&i.push(e.error),(e.scanned||e.matched||e.stored)&&i.push(`\u6383\u63CF ${c(e.scanned)} \xB7 \u547D\u4E2D ${c(e.matched)} \xB7 \u5BEB\u5165 ${c(e.stored)}`),`<div class="processing-archive is-${pt(t).tone}">
    <div class="processing-archive-head">
      <span class="processing-archive-name mono">${n(e.name)}</span>
      <div class="processing-archive-bar-wrap">
        ${Et({percent:a,status:t,color:s?"var(--accent)":"var(--success)"})}
      </div>
      <span class="processing-archive-percent mono">${r?"\u9032\u884C\u4E2D":et(a)}</span>
      ${he(t)}
      <span class="processing-archive-size faint">${O(e.size_bytes)}</span>
    </div>
    ${yr(e)}
    ${i.length?`<div class="processing-archive-note">${i.map(o=>`<span>${n(o)}</span>`).join("")}</div>`:""}
  </div>`}function _r(e){let t=e.archives||{},s=e.local_archives||{},a=Array.isArray(t.items)?t.items:[],r=t.run,i=`<div class="report-section-head">
    <div>
      <div class="report-kicker">ARCHIVE PIPELINE</div>
      <h2 class="report-section-title">\u5224\u6C7A\u58D3\u7E2E\u6A94</h2>
      <p class="processing-section-sub">\u6BCF\u500B\u58D3\u7E2E\u6A94\u540D\u7A31\u5F8C\u65B9\u5373\u6642\u986F\u793A\u8655\u7406\u9032\u5EA6\uFF1B\u672A\u53D6\u5F97\u53EF\u8A08\u7B97\u7684\u7E3D\u91CF\u6642\u6A19\u793A\u300C\u9032\u5EA6\u672A\u77E5\u300D\uFF0C\u4E0D\u4EE5\u63A8\u6E2C\u6578\u503C\u4EE3\u66FF\u3002</p>
    </div>
  </div>`,o=t.source==="run"?`${he(r?r.status:"idle")} <span>\u76EE\u524D\u986F\u793A ${r?n(r.title||"\u5224\u6C7A\u532F\u5165"):"\u6700\u8FD1\u4E00\u6B21\u532F\u5165"} \u7684\u9010\u6A94\u9032\u5EA6${r&&r.started_at?` \xB7 ${n(ua(r))}`:""}</span>`:t.external?`${he("running")} <span>${n(t.note||"\u5916\u90E8\u532F\u5165\u7A0B\u5E8F\u672A\u5BEB\u5165\u9010\u6A94\u72C0\u614B\uFF1B\u4EE5\u4E0B\u70BA PostgreSQL \u8986\u84CB\u7387\u3002")}</span>`:'<span class="faint">\u76EE\u524D\u6C92\u6709\u53EF\u8B80\u53D6\u7684\u532F\u5165 run \u72C0\u614B\uFF1B\u4EE5\u4E0B\u4EE5 PostgreSQL \u7684 source_archive \u5224\u5B9A\u662F\u5426\u5DF2\u8655\u7406\u3002</span>';return`<section class="report-card processing-card">
    <div class="report-head">${i}</div>
    <div class="report-section">
      ${$r(s)}
      <div class="processing-archive-run">${o}</div>
      ${a.length?`<div class="processing-archive-list">${a.map(wr).join("")}</div>`:`<div class="processing-empty">\u627E\u4E0D\u5230 .rar \u58D3\u7E2E\u6A94\uFF1B\u8ACB\u78BA\u8A8D ${n(s.data_dir||"\u5224\u6C7A\u8CC7\u6599\u76EE\u9304")}\u3002</div>`}
    </div>
  </section>`}function kr(e){let t=e.timeline||{},s=Array.isArray(t.stages)?t.stages:[],a=`<div class="report-section-head">
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
    </section>`;let r=s.map(o=>`<span class="processing-stack-segment" style="width:${Math.max(0,Number(o.percent)||0)}%;background:${n(o.color||"var(--accent)")}" title="${n(`${o.label} ${F(o.duration_ms)} (${et(o.percent)})`)}"></span>`).join(""),i=s.map(o=>`<div class="processing-legend-item">
        <span class="processing-legend-swatch" style="background:${n(o.color||"var(--accent)")}"></span>
        <span class="processing-legend-label">${n(o.label)}</span>
        <span class="mono">${F(o.duration_ms)}</span>
        <span class="processing-legend-percent mono">${et(o.percent)}</span>
        ${he(o.status)}
      </div>`).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section">
      <div class="processing-timeline-label">
        <span>${n(t.label||"\u968E\u6BB5\u8017\u6642")}</span>
        <span class="mono">\u7E3D\u8A08 ${F(t.total_ms)}</span>
      </div>
      <div class="processing-stack" role="img" aria-label="\u968E\u6BB5\u8017\u6642\u6BD4\u4F8B">${r}</div>
      <div class="processing-legend">${i}</div>
    </div>
  </section>`}function xr(e){let t=Array.isArray(e.recent_runs)?e.recent_runs:[],s=new Map((e.branches||[]).map(i=>[i.key,i.label])),a=`<div class="report-section-head">
    <div>
      <div class="report-kicker">RECENT RUNS</div>
      <h2 class="report-section-title">\u6700\u8FD1\u8655\u7406\u7D00\u9304</h2>
      <p class="processing-section-sub">\u5305\u542B\u8CC7\u6599\u66F4\u65B0\u3001\u5224\u6C7A\u532F\u5165\u3001Parquet\u3001Qdrant \u8207\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E0B\u8F09\u3002</p>
    </div>
  </div>`;if(!t.length)return`<section class="report-card processing-card">
      <div class="report-head">${a}</div>
      <div class="report-section"><div class="processing-empty">\u5C1A\u7121\u8655\u7406\u7D00\u9304\u3002</div></div>
    </section>`;let r=t.map(i=>{let o=s.get(i.branch)||ca[i.branch]||i.branch||"\u2014";return`<div class="processing-run">
        <div class="processing-run-head">
          <span class="badge badge-neutral">${n(o)}</span>
          <strong>${n(i.title||"\u8655\u7406")}</strong>
          ${he(i.status)}
          <span class="grow"></span>
          <span class="mono faint">${n(ne(i.finished_at||i.started_at))}</span>
          <span class="mono">${i.duration_ms?F(i.duration_ms):"\u2014"}</span>
        </div>
        ${i.message?`<div class="processing-run-message">${n(i.message)}</div>`:""}
      </div>`}).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section"><div class="processing-run-list">${r}</div></div>
  </section>`}function Sr(e){let t=Array.isArray(e.notices)?e.notices:[];return t.length?`<div class="processing-notices">${t.map(s=>X({tone:s.tone||"info",title:s.title,text:n(s.message||"")})).join("")}</div>`:""}function ia(e){return`${Sr(e)}
    ${hr(e)}
    <section class="processing-flow-section">
      <div class="processing-section-head">
        <div>
          <div class="report-kicker">PIPELINE CANVAS</div>
          <h2 class="report-section-title">\u8655\u7406\u6D41\u7A0B</h2>
          <p class="processing-section-sub">\u5224\u6C7A\u3001\u6CD5\u898F\u3001\u547D\u4EE4\u4E09\u689D\u6D41\u7A0B\u5373\u6642\u53CD\u6620\u76EE\u524D\u57F7\u884C\u968E\u6BB5\uFF1B\u66F2\u7DDA\u7531\u4F86\u6E90\u7BC0\u9EDE\u9023\u5230\u5404\u968E\u6BB5\uFF0C\u767C\u5149\u7BC0\u9EDE\u8207\u6D41\u52D5\u66F2\u7DDA\u8868\u793A\u76EE\u524D\u57F7\u884C\u4F4D\u7F6E\u3002</p>
        </div>
      </div>
      ${br(e)}
    </section>
    ${_r(e)}
    ${kr(e)}
    ${xr(e)}`}function Ar(e,t){return`<div class="report-card processing-card">
    <div class="report-section">
      ${X({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B",text:n(e||"\u672A\u77E5\u932F\u8AA4")})}
      ${t?`<p class="processing-section-sub">\u4E0A\u6B21\u6210\u529F\u66F4\u65B0\uFF1A${n(ne(t.generated_at))}\u3002\u756B\u9762\u4E0A\u6C92\u6709\u986F\u793A\u66FF\u4EE3\u6216\u63A8\u6E2C\u7684\u9032\u5EA6\u3002</p>`:""}
      <div class="processing-error-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh">
          ${$("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
  </div>`}var pa={overview:"activity",full_update:"download",law_download:"layers",order_download:"file",judgment_import:"database",judgment_parquet:"cube",index_versions:"brain",normalize_courts:"filter",backfill_law_articles:"history"};function Lr(e){let t=Array.isArray(e.workflows)?e.workflows:[];return[{id:"overview",label:"\u8655\u7406\u7E3D\u89BD",description:"\u76EE\u524D\u6D41\u7A0B\u3001\u58D3\u7E2E\u6A94\u8207\u6700\u8FD1\u57F7\u884C\u7D00\u9304",status:e.status||"idle",activeRun:null,lastRun:null},...t.map(s=>{let a=s.active_run||null,r=a||s.last_run||null;return{...s,activeRun:a,lastRun:r,status:r?.status||"idle"}})]}function oa(e,t){return`<div class="status-sidebar-head">
      <div class="eyebrow">DATA WORKFLOWS</div>
      <div class="status-sidebar-title">\u8CC7\u6599\u6D41\u7A0B</div>
    </div>
    <nav class="status-tab-list" aria-label="\u8CC7\u6599\u8655\u7406\u5DE5\u4F5C\u6D41\u7A0B">
      ${Lr(e).map(a=>{let r=a.id===t,i=pa[a.id]||"terminal";return`<button class="status-tab${r?" is-active":""}" type="button"
            data-processing-workflow="${n(a.id)}"
            ${r?'aria-current="page"':""}>
            <span class="status-tab-icon">${$(i,15)}</span>
            <span class="status-tab-copy">
              <strong>${n(a.label)}</strong>
              <small>${n(a.description||"")}</small>
            </span>
            ${he(a.status)}
          </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u57F7\u884C\u6A21\u5F0F</span>
      <span class="mono">${n(e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D")}</span>
    </div>`}function Mr(e){if(!e)return'<div class="processing-workflow-empty">\u5C1A\u672A\u57F7\u884C\u3002\u6309\u4E0B\u53F3\u5074\u6309\u9215\u958B\u59CB\u3002</div>';let t=e.meta||{};return`<div class="processing-workflow-run">
    <div class="processing-workflow-run-head">
      ${he(e.status)}
      <span class="mono">${n(e.id||"\u2014")}</span>
    </div>
    <div class="processing-workflow-run-grid">
      <span>\u958B\u59CB</span><strong>${n(ne(e.started_at))}</strong>
      <span>\u8017\u6642</span><strong>${F(e.duration_ms)}</strong>
      <span>\u8A0A\u606F</span><strong>${n(e.message||"\u2014")}</strong>
      ${t.log_path?`<span>\u65E5\u8A8C</span><strong class="mono">${n(t.log_path)}</strong>`:""}
    </div>
  </div>`}function Tr(e){let t=e.active_run||null,s=t||e.last_run||null,a=!!t,r=!!e.can_run&&!a,i=e.id==="full_update",o=Array.isArray(e.command)?e.command.join(" "):"";return`<div class="processing-workflow-panel">
    ${X({tone:"info",title:e.label,text:e.description||""})}
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${$(pa[e.id]||"terminal",14)}\u57F7\u884C\u8CC7\u8A0A</span>
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
          ${$("play",14)}<span>${a?"\u57F7\u884C\u4E2D":i?"\u57F7\u884C\u8CC7\u6599\u66F4\u65B0":"\u57F7\u884C\u6B64\u6D41\u7A0B"}</span>
        </button>
        ${t?`<button class="btn btn-secondary btn-sm processing-stop" type="button"
                data-processing-action="stop">${$("x",14)}<span>\u505C\u6B62</span></button>`:""}
      </div>
      <div class="side-card-foot">
        ${i?"\u6703\u4F9D\u5E8F\u57F7\u884C\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E0B\u8F09\u3001\u5224\u6C7A\u532F\u5165\u8207\u53EF\u9078\u7684 Qdrant \u7D22\u5F15\u3002":"\u57F7\u884C\u7D50\u679C\u6703\u5BEB\u5165\u5171\u7528\u8655\u7406\u72C0\u614B\u6A94\uFF0C\u53EF\u5F9E\u8655\u7406\u7E3D\u89BD\u67E5\u770B\u3002"}
      </div>
    </section>
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${$("history",14)}\u6700\u8FD1\u57F7\u884C</span>
        ${he(s?.status||"idle")}
      </div>
      ${Mr(s)}
    </section>
  </div>`}function la(e,t){if(t==="overview")return ia(e);let a=(Array.isArray(e.workflows)?e.workflows:[]).find(r=>r.id===t);return a?Tr(a):ia(e)}async function qr(e){e.innerHTML=`<section class="page processing-page">
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
          ${$("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
        <button class="btn btn-secondary btn-sm processing-stop" type="button" data-processing-action="stop" id="processing-stop" hidden>
          ${$("x",14)}<span>\u505C\u6B62\u66F4\u65B0</span>
        </button>
        <button class="btn btn-primary btn-sm" type="button" data-processing-action="update" id="processing-update">
          ${$("download",14)}<span data-update-label>\u8CC7\u6599\u66F4\u65B0</span>
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
  </section>`;let t=e.querySelector(".processing-page"),s=e.querySelector("#processing-root"),a=e.querySelector("#processing-workflows"),r=e.querySelector("#processing-update"),i=e.querySelector("#processing-stop"),o=e.querySelector("#processing-refresh"),l=e.querySelector("#processing-index-toggle"),m=!1,h=!1,w=!1,f=null,v="",x="",b="overview",y=null,C=I=>{let P=I.capabilities||{},k=!!(l&&l.checked),T=k?P.can_start_update_with_index!==!1:P.can_start_update!==!1,B=k&&P.index_blocked_reason||P.start_blocked_reason;if(!w){r.disabled=!T,r.title=B||"\u6AA2\u67E5\u7DDA\u4E0A\u6CD5\u898F\uFF0F\u547D\u4EE4\uFF0C\u4E26\u8655\u7406\u672A\u532F\u5165\u7684\u5224\u6C7A\u58D3\u7E2E\u6A94\u3002";let J=r.querySelector("[data-update-label]");J&&(J.textContent=T?"\u8CC7\u6599\u66F4\u65B0":P.active_update_id?"\u66F4\u65B0\u57F7\u884C\u4E2D":"\u8655\u7406\u7A0B\u5E8F\u57F7\u884C\u4E2D"),i.hidden=!P.can_stop_update,l&&(l.disabled=P.can_start_update===!1)}},L=async({silent:I=!1}={})=>{if(!(m||h)){h=!0,I||W(o,!0,"\u66F4\u65B0\u4E2D\u2026");try{let P=await U.processing();if(m)return;f=P;let k=oa(P,b);k!==x&&(a.innerHTML=k,x=k);let T=la(P,b);T!==v&&(s.innerHTML=T,v=T);let B=s.querySelector("[data-processing-updated-at]");if(B){let J=ne(P.generated_at);B.textContent!==J&&(B.textContent=J)}C(P)}catch(P){if(m)return;let k=Ar(P.message,f);k!==v&&(s.innerHTML=k,v=k),I||D(P.message||"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B\u3002","danger",6e3)}finally{h=!1,I||W(o,!1)}}},_=async I=>{if(!w){w=!0,W(I,!0,"\u555F\u52D5\u4E2D\u2026");try{let P=!!(l&&l.checked),k=await U.startProcessingUpdate(P);D(`\u5DF2\u555F\u52D5\u8CC7\u6599\u66F4\u65B0${P?"\uFF0C\u5B8C\u6210\u5F8C\u63A5\u7E8C Qdrant \u7D22\u5F15":""}\u3002`,"ok",6e3),k&&k.run_id&&console.info("processing update started",k),await L({silent:!0})}catch(P){D(P.message||"\u7121\u6CD5\u555F\u52D5\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{w=!1,W(I,!1),f&&C(f)}}},E=async(I,P)=>{if(!w){w=!0,W(I,!0,"\u555F\u52D5\u4E2D\u2026");try{let k=await U.startProcessingWorkflow(P);D("\u5DF2\u555F\u52D5\u5DE5\u4F5C\u6D41\u7A0B\u3002","ok",6e3),k&&k.run_id&&console.info("processing workflow started",k),await L({silent:!0})}catch(k){D(k.message||"\u7121\u6CD5\u555F\u52D5\u5DE5\u4F5C\u6D41\u7A0B\u3002","danger",7e3)}finally{w=!1,W(I,!1),f&&C(f)}}},z=async I=>{if(!w){w=!0,W(I,!0,"\u505C\u6B62\u4E2D\u2026");try{let P=await U.stopProcessingUpdate();D(P.message||"\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info",6e3),await L({silent:!0})}catch(P){D(P.message||"\u7121\u6CD5\u505C\u6B62\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{w=!1,W(I,!1),f&&C(f)}}},Q=I=>{let P=I.target.closest("[data-processing-action]");if(!P||P.disabled)return;let k=P.dataset.processingAction;if(k==="refresh")L({silent:!1});else if(k==="update")_(P);else if(k==="run-workflow"){let T=P.dataset.workflowId||"";T==="full_update"?_(P):E(P,T)}else k==="stop"&&z(P)},Z=I=>{I.target===l&&f&&C(f)},ie=I=>{let P=I.target.closest("[data-processing-workflow]");if(P&&(b=P.dataset.processingWorkflow||"overview",f)){let k=oa(f,b);a.innerHTML=k,x=k;let T=la(f,b);s.innerHTML=T,v=T}};return t.addEventListener("click",Q),a.addEventListener("click",ie),l&&l.addEventListener("change",Z),await L({silent:!1}),y=window.setInterval(()=>{document.hidden||L({silent:!0})},nr),()=>{m=!0,y!==null&&window.clearInterval(y),t.removeEventListener("click",Q),a.removeEventListener("click",ie),l&&l.removeEventListener("change",Z)}}var us={};Je(us,{render:()=>Ir});function Ct(e){if(e==null||e==="")return"\u2014";let t=Number(e);return Number.isFinite(t)?`${t.toFixed(t>=10?1:2)}%`:"\u2014"}function ma(e){return e==null?"\u2014":c(e)}function jr(e){return e.count?e.severity==="danger"?Y("failed","\u9700\u8655\u7406"):e.severity==="warn"?Y("warning","\u6CE8\u610F"):Y("preview","\u63D0\u793A"):Y("success","\u901A\u904E")}function Er(e){return e.count?e.severity==="danger"?"is-danger":e.severity==="warn"?"is-warn":"is-info":"is-ok"}function Pr(e){let t=Number(e.count)||0,s=Math.max(0,Math.min(100,Number(e.percent)||0));return`<div class="quality-check ${Er(e)}">
    <div class="quality-check-head">
      <span class="quality-check-label">${n(e.label)}</span>
      ${jr(e)}
    </div>
    <div class="quality-check-value">
      <strong>${c(t)}</strong>
      <span>\u7B46</span>
      <em>${n(Ct(e.percent))}</em>
    </div>
    <div class="quality-check-desc">${n(e.description)}</div>
    <div class="quality-check-track" aria-hidden="true">
      <span style="width:${s}%"></span>
    </div>
  </div>`}function Pt(e,t,s){let a=Array.isArray(s)?s:[];if(!a.length)return`<div class="index-chart-card">
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
  </div>`}function Cr(e){let t=e.coverage||{},s=e.totals||{},a=e.source||{},r=t.postgres_diff,i=r==null?"\u2014":r===0?"\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u4E00\u81F4":`\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u76F8\u5DEE ${c(Math.abs(r))} \u7B46`,o=t.vector_indexed===null||t.vector_indexed===void 0?t.detail||"\u7121\u6CD5\u53D6\u5F97\u7D22\u5F15\u7D71\u8A08":`${c(t.vector_indexed)} / ${c(t.vector_total)} \xB7 ${t.model||"\u2014"}`;return`<div class="metric-grid quality-coverage-grid">
    <div class="metric-card">
      <div class="metric-label">${$("filter",13)}<span>\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D</span></div>
      <div class="metric-value">${c(s.matched_rows)}</div>
      <div class="metric-foot">citation_count &gt; 0\uFF1B\u5171 ${c(s.citation_total)} \u7B46\u5F15\u7528</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${$("database",13)}<span>PostgreSQL \u6536\u9304</span></div>
      <div class="metric-value">${ma(t.postgres_judgments)}</div>
      <div class="metric-foot">${n(i)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${$("brain",13)}<span>\u5411\u91CF\u7D22\u5F15</span></div>
      <div class="metric-value">${n(Ct(t.vector_coverage_pct))}</div>
      <div class="metric-foot">${n(o)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${$("layers",13)}<span>DuckDB \u5019\u9078</span></div>
      <div class="metric-value">${ma(a.candidate_total)}</div>
      <div class="metric-foot">${c(a.candidate_archive_count)} / ${c(a.archive_count)} \u500B manifest \u6709 candidate_count</div>
    </div>
  </div>`}function Nr(e){return e.length?`<div class="table-wrap">
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
              <td class="cell-number">${n(Ct(t.match_rate))}</td>
              <td class="cell-number">${c(t.short_text_rows)}</td>
              <td class="cell-number">${c(s)}</td>
              <td class="cell-number">${c(t.duplicate_content_rows)}</td>
              <td class="cell-date">${n(Ne(t.date_min))} \u2013 ${n(Ne(t.date_max))}</td>
            </tr>`}).join("")}
      </tbody>
    </table>
  </div>`:we({iconName:"table",title:"\u6C92\u6709\u539F\u59CB Parquet \u6A94\u6848",text:"\u5B8C\u6210\u5224\u6C7A RAR \u532F\u5165\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6BCF\u500B\u58D3\u7E2E\u6A94\u7684 DuckDB \u7D71\u8A08\u3002"})}function Rr(e){let t=e.totals||{},s=e.source||{},a=Array.isArray(e.checks)?e.checks:[],r=e.summary||{},i=e.distributions||{},o=Array.isArray(e.warnings)?e.warnings:[],l=O(s.compressed_bytes||0);return`<div class="report-card quality-report" data-database="quality">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">DUCKDB DATA QUALITY</div>
        <div class="report-title">
          \u539F\u59CB Parquet \u8CC7\u6599\u54C1\u8CEA ${Y(e.status||"operational")}
          <span class="chip">raw.parquet</span>
        </div>
        <div class="report-sub">
          ${c(t.rows)} \u7B46 \xB7 ${c(s.raw_files)} \u500B\u6A94\u6848 \xB7
          ${l} \xB7 \u6383\u63CF ${F(e.scan_ms||0)} \xB7
          ${n(ne(e.generated_at))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-quality">
          ${$("download",14)}<span>JSON</span>
        </button>
      </div>
    </div>
    ${o.length?`<div class="report-alert">${X({tone:"warn",title:"\u76EE\u524D\u9650\u5236\u8207\u5DEE\u7570",text:o.map(m=>n(m)).join("<br>")})}</div>`:""}
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
        <div class="summary-value">${n(Ct(t.match_rate))}</div>
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
      <div class="quality-checks">${a.map(Pr).join("")}</div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6536\u9304\u8986\u84CB</span>
        <span class="muted" style="font-size:9.5px">PostgreSQL \u8207\u5411\u91CF\u7D22\u5F15\u70BA\u5373\u6642\u67E5\u8A62\uFF0C\u4E0D\u662F\u5F9E Parquet \u63A8\u4F30</span>
      </div>
      ${Cr(e)}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6A94\u6848\u660E\u7D30</span>
        <span class="muted" style="font-size:9.5px">${c(s.archive_count)} \u500B\u539F\u59CB Parquet</span>
      </div>
      ${Nr(Array.isArray(e.archives)?e.archives:[])}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u5206\u5E03\u7D71\u8A08</span>
        <span class="muted" style="font-size:9.5px">DuckDB group by / unnest</span>
      </div>
      <div class="quality-dist-grid">
        ${Pt("\u6CD5\u9662","\u5224\u6C7A\u7B46\u6578",i.courts)}
        ${Pt("\u88C1\u5224\u5E74\u4EFD","\u5224\u6C7A\u7B46\u6578",i.years)}
        ${Pt("\u71B1\u9580\u6CD5\u898F","\u63D0\u53CA\u5224\u6C7A\u6578",i.laws)}
        ${Pt("\u71B1\u9580\u6848\u7531","\u5224\u6C7A\u7B46\u6578",i.titles)}
      </div>
    </div>
  </div>`}async function Ir(e){e.innerHTML=`<section class="page data-page quality-page">
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
          ${$("refresh",15)}<span>\u91CD\u65B0\u6383\u63CF</span>
        </button>
      </div>
    </div>
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
  </section>`;let t=e.querySelector("#quality-content"),s=e.querySelector("#quality-refresh"),a=e.querySelector("#quality-meta"),r=null,i=()=>{r&&(t.innerHTML=Rr(r),a.textContent=`DUCKDB \xB7 ${c(r.totals?.rows)} \u7B46 \xB7 ${F(r.scan_ms||0)}`)},o=async()=>{W(s,!0,"\u6383\u63CF\u4E2D\u2026");try{r=await U.quality(),i()}catch(l){t.innerHTML=`<div class="report-card">
        <div class="report-head">
          <div class="report-title-group">
            <div class="report-kicker">DUCKDB DATA QUALITY</div>
            <div class="report-title">\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557</div>
            <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
          </div>
        </div>
        <div class="report-section">
          ${X({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u54C1\u8CEA\u7D71\u8A08",text:n(l.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
        </div>
      </div>`,a.textContent="DUCKDB \xB7 \u8B80\u53D6\u5931\u6557",D("\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}finally{W(s,!1)}};s.addEventListener("click",o),t.addEventListener("click",l=>{!l.target.closest("[data-action='export-quality']")||!r||ze(`judgment-quality-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(r,null,2),"application/json;charset=utf-8")}),await o()}var ps={};Je(ps,{render:()=>oi});var va={frontend:"browser",backend:"server",database:"database",storage:"layers",vector:"cube",ai:"brain",default:"cpu"};var fa={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90"},ba=[{id:"overview",label:"\u670D\u52D9\u7E3D\u89BD",hint:"\u5065\u5EB7\u72C0\u614B\u8207\u8CC7\u6599\u91CF",icon:"activity"},{id:"resources",label:"\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528",hint:"CPU\u3001RAM\u3001Docker\u3001\u786C\u789F",icon:"cpu"},{id:"architecture",label:"\u524D\u5F8C\u7AEF\u67B6\u69CB",hint:"Client \u2192 Data \u2192 AI",icon:"layers"},{id:"data",label:"\u8CC7\u6599\u7248\u672C",hint:"Parquet \u8207 PostgreSQL",icon:"database"},{id:"api",label:"API \u7AEF\u9EDE",hint:"REST \u8207 OpenAPI",icon:"terminal"},{id:"runs",label:"\u6700\u8FD1\u4E0B\u8F09",hint:"\u6CD5\u898F\uFF0F\u547D\u4EE4\u57F7\u884C\u7D00\u9304",icon:"history"}];function Dr(e){return e==="operational"?{label:"\u6838\u5FC3\u670D\u52D9\u6B63\u5E38",tone:"ok",headline:"\u6838\u5FC3\u8CC7\u6599\u7BA1\u7DDA\u904B\u4F5C\u4E2D",copy:"FastAPI\u3001PostgreSQL \u8207 Parquet \u5747\u53EF\u5B58\u53D6\u3002Qdrant\u3001Embedding \u8207 LLM \u6703\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u8A2D\u5B9A\u6216\u964D\u7D1A\u6642\u4E0D\u5F71\u97FF\u8CC7\u6599\u700F\u89BD\u8207\u67E5\u8A62\u5831\u8868\u3002"}:e==="degraded"?{label:"\u90E8\u5206\u670D\u52D9\u964D\u7D1A",tone:"warn",headline:"\u90E8\u5206\u670D\u52D9\u9700\u8981\u8A2D\u5B9A\u6216\u4FEE\u5FA9",copy:"\u6838\u5FC3\u8CC7\u6599\u670D\u52D9\u76EE\u524D\u672A\u5B8C\u5168\u53EF\u7528\u3002\u8ACB\u67E5\u770B\u4E0B\u65B9\u670D\u52D9\u5361\u7247\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u7684\u57F7\u884C\u7D00\u9304\uFF0C\u78BA\u8A8D PostgreSQL\u3001Parquet \u6216\u5916\u90E8\u670D\u52D9\u72C0\u614B\u3002"}:{label:Re(e).label,tone:Re(e).tone,headline:"\u76EE\u524D\u7121\u6CD5\u78BA\u8A8D\u7CFB\u7D71\u72C0\u614B",copy:"\u72C0\u614B API \u56DE\u50B3\u4E86\u975E\u9810\u671F\u7D50\u679C\u3002\u8ACB\u91CD\u65B0\u6574\u7406\uFF0C\u6216\u76F4\u63A5\u6AA2\u67E5 FastAPI \u670D\u52D9\u65E5\u8A8C\u3002"}}function Br(e){let t=Re(e.status),s=va[e.kind]||va.default,a=e.latency_ms===null||e.latency_ms===void 0?"":`<span class="service-latency">${c(e.latency_ms)} ms</span>`;return`<article class="service-card">
    <div class="service-top">
      <span class="service-icon">${$(s,14)}</span>
      <span class="service-name" title="${n(e.name)}">${n(e.name)}</span>
      <span class="service-kind">${n(e.kind||"")}</span>
    </div>
    <div class="service-status">
      <span class="status-dot ${t.tone==="ok"?"is-ok":t.tone==="warn"?"is-warn":t.tone==="danger"?"is-danger":"is-idle"}" aria-hidden="true"></span>
      ${n(t.label)}
      ${a}
    </div>
    <p class="service-detail" title="${n(e.detail||"")}">${n(e.detail||"")}</p>
  </article>`}function Or(e,t){return`<div class="arch-node ${e?"":"is-muted"}" ${e?"":'title="\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165"'}>${n(t)}</div>`}function Fr(e,t){if(e==="IndexedDB")return As();let a={PostgreSQL:"postgres",Parquet:"parquet",Qdrant:"qdrant",Embedding:"embedding",Retriever:"rag","RAG Engine":"rag",LLM:"llm"}[e];return a?t.find(i=>i.id===a)?.status==="operational":!0}function Hr(e,t){let s=e?.layers||[];if(!s.length)return'<div class="report-empty-inline">\u72C0\u614B API \u672A\u63D0\u4F9B\u67B6\u69CB\u8CC7\u6599\u3002</div>';let a=s.map(i=>{let o=(i.nodes||[]).map(l=>Or(Fr(l,t),l)).join("");return`<div class="arch-layer">
      <div class="arch-layer-label">${n(i.label||i.id)}</div>
      <div class="arch-nodes">${o}</div>
    </div>`}),r=[];return a.forEach((i,o)=>{o&&r.push(`<div class="arch-arrow" aria-hidden="true">${$("arrowRight",15)}</div>`),r.push(i)}),`<div class="arch-flow">${r.join("")}</div>
    <div class="arch-legend">
      <span><i class="legend-key is-live"></i>\u5DF2\u63A5\u5165\u4E14\u72C0\u614B\u6B63\u5E38</span>
      <span><i class="legend-key is-off"></i>\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165</span>
      <span>${$("info",12)} \u7BC0\u9EDE\u72C0\u614B\u4F86\u81EA\u4E3B\u670D\u52D9\u5065\u5EB7\u6AA2\u67E5</span>
    </div>`}function Ur(e){return!Array.isArray(e)||!e.length?'<div class="report-empty-inline">\u6C92\u6709\u7AEF\u9EDE\u8CC7\u8A0A\u3002</div>':`<div class="endpoint-list">
    ${e.map(t=>`<div class="endpoint-row">
          <span class="endpoint-method">${n(t.method)}</span>
          <span class="endpoint-path" title="${n(t.path)}">${n(t.path)}</span>
          <span class="endpoint-label">${n(t.label||"")}</span>
        </div>`).join("")}
  </div>`}function re(e,t){return`<div class="detail-row">
    <span class="detail-label">${n(e)}</span>
    <span class="detail-value">${t}</span>
  </div>`}function zr(e){return e?`<div class="detail-list">
    ${re("\u7248\u672C ID",`<strong>#${c(e.id)}</strong>`)}
    ${re("\u8CC7\u6599\u985E\u578B",Y("operational",e.source_type==="law"?"\u6CD5\u898F":"\u547D\u4EE4"))}
    ${re("\u4F86\u6E90\u66F4\u65B0\u65E5",`<strong>${n(e.update_date||"\u2014")}</strong>`)}
    ${re("\u6CD5\u898F / \u689D\u6587",`<strong>${c(e.law_count)} / ${c(e.article_count)}</strong>`)}
    ${re("\u4E0B\u8F09\u6642\u9593",`<span class="mono">${ne(e.downloaded_at)}</span>`)}
    ${re("Parquet",`<code title="${n(e.parquet_path||"")}">${n(e.parquet_path||"\u2014")}</code>`)}
  </div>`:'<div class="report-empty-inline">\u5C1A\u672A\u532F\u5165\u4EFB\u4F55\u8CC7\u6599\u7248\u672C\u3002</div>'}function Gr(e){if(!Array.isArray(e)||!e.length)return we({iconName:"history",title:"\u5C1A\u7121\u4E0B\u8F09\u57F7\u884C\u7D00\u9304",text:"\u57F7\u884C judgment-law-download \u5F8C\uFF0C\u6210\u529F\u3001\u7121\u8B8A\u66F4\u8207\u5931\u6557\u7684\u7D50\u679C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"});let t=[{key:"id",label:"Run",type:"number"},{key:"source_type",label:"\u985E\u578B",type:"source"},{key:"status",label:"\u72C0\u614B",type:"status"},{key:"started_at",label:"\u958B\u59CB\u6642\u9593",type:"datetime"},{key:"duration_ms",label:"\u8017\u6642",type:"duration"},{key:"law_count",label:"\u6CD5\u898F",type:"number"},{key:"article_count",label:"\u689D\u6587",type:"number"},{key:"error_message",label:"\u932F\u8AA4",type:"longtext"}];return`<div class="table-wrap" style="border-top:0;max-height:340px">
    <table class="data-table runs-table">
      <thead><tr>${t.map(s=>`<th scope="col">${n(s.label)}</th>`).join("")}</tr></thead>
      <tbody>
        ${e.map(s=>`<tr>${t.map(a=>`<td>${bt(s[a.key],a.type)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </div>`}function Qr(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=Dr(e.status),r=s.find(h=>h.id==="qdrant"),i=s.find(h=>h.id==="rag"),o=s.find(h=>h.id==="llm"),l=Ue(),m=fa[l]||l;return`<section class="status-hero">
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
          <span>${$("clock",11)} \u6AA2\u67E5\u6642\u9593 ${ne(e.checked_at)} \xB7 ${n(st(e.checked_at))}</span>
          <span>${$("server",11)} ${s.length} \u500B\u670D\u52D9\u5143\u4EF6</span>
          <span>${$("database",11)} ${c(t.total_current)} \u7B46\u73FE\u884C\u8CC7\u6599</span>
          <span>${$("layers",11)} ${c(t.parquet_files)} \u500B\u539F\u59CB Parquet</span>
          <span title="API \u4F4D\u5740\u4F86\u6E90\uFF1A${n(m)}">${$("link",11)} ${n(Ve())}</span>
        </div>
      </div>
    </section>

    <div class="service-grid">${s.map(Br).join("")}</div>

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

    ${r?.status==="not_configured"||i?.status==="not_configured"||o?.status==="not_configured"?`<div class="data-section">${X({tone:"info",title:"\u90E8\u5206 AI \u5143\u4EF6\u5C1A\u672A\u8A2D\u5B9A",text:`Qdrant\uFF1A${n(r?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BRAG\uFF1A${n(i?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BLLM\uFF1A${n(o?.detail||"\u672A\u8A2D\u5B9A")}\u3002\u9019\u4E9B\u72C0\u614B\u4E0D\u6703\u88AB\u507D\u88DD\u6210\u53EF\u7528\u3002`})}</div>`:""}

  }`}function Jr(e){let t=Array.isArray(e.services)?e.services:[],s=e.architecture||{};return`<div class="data-section card architecture-card">
    <div class="section-head">
      <div>
        <div class="section-title">\u524D\u5F8C\u7AEF\u67B6\u69CB</div>
        <div class="section-sub">Client \u2192 Application \u2192 Data \u2192 Intelligence</div>
      </div>
      <span class="badge badge-neutral badge-mono">${c((s.flow||[]).length)} layers</span>
    </div>
    ${Hr(s,t)}
  </div>`}function Vr(e){let t=Ue(),s=fa[t]||t,a=Ce("/api/docs"),r=Ce("/api/openapi.json");return`<div class="status-columns is-single">
    <section class="card">
      <div class="side-card-head">
        <span class="side-card-title">${$("terminal",14)}API \u7AEF\u9EDE</span>
        <a href="${n(a)}" target="_blank" rel="noopener noreferrer" class="chip"
          >OpenAPI ${$("external",11)}</a>
      </div>
      ${Ur(e.endpoints)}
      <div class="side-card-foot">
        \u76EE\u524D API Base\uFF1A<code>${n(Ve())}</code>\uFF08${n(s)}\uFF09\u3002\u4E92\u52D5\u5F0F API \u6587\u4EF6\u4F4D\u65BC <a href="${n(a)}" target="_blank" rel="noopener noreferrer"><code>${n(a)}</code></a>\uFF0COpenAPI schema \u4F4D\u65BC <a href="${n(r)}" target="_blank" rel="noopener noreferrer"><code>${n(r)}</code></a>\u3002
      </div>
    </section>
  </div>`}function Wr(e){let t=e.data||{};return`<div class="status-summary">
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
        <div class="metric-foot">/ ${c(t.judgment_count)} \u7B46\u5224\u6C7A</div>
      </div>
    </div>
    <div class="status-columns is-single">
      <section class="card">
        <div class="side-card-head">
          <span class="side-card-title">${$("layers",14)}\u6700\u65B0\u8CC7\u6599\u7248\u672C</span>
          ${Y("operational","Parquet")}
        </div>
        ${zr(t.last_version)}
        <div class="side-card-foot">
          \u539F\u59CB Parquet \u5408\u8A08 ${O(t.parquet_bytes)}\uFF1BPostgreSQL \u4FDD\u5B58 metadata \u8207\u7248\u672C\u72C0\u614B\u3002
        </div>
      </section>
      <section class="card">
        <div class="side-card-head">
          <span class="side-card-title">${$("database",14)}\u8CC7\u6599\u96C6\u7D71\u8A08</span>
          <span class="badge badge-neutral badge-mono">${c(t.parquet_files)} FILES</span>
        </div>
        <div class="detail-list">
          ${re("\u73FE\u884C\u6CD5\u898F",`<strong>${c(t.law_count)}</strong>`)}
          ${re("\u73FE\u884C\u547D\u4EE4",`<strong>${c(t.order_count)}</strong>`)}
          ${re("\u689D\u6587\u7E3D\u6578",`<strong>${c(t.article_count)}</strong>`)}
          ${re("\u539F\u59CB Parquet",`<strong>${O(t.parquet_bytes)}</strong>`)}
          ${re("\u5224\u6C7A\u6587\u4EF6",`<strong>${c(t.judgment_count)}</strong>`)}
          ${re("\u5411\u91CF\u7D22\u5F15",`<strong>${c(t.judgment_indexed_count)}</strong> / ${c(t.judgment_count)}\uFF08${c(t.judgment_vector_points)} points\uFF09`)}
          ${re("\u7D22\u5F15\u7248\u672C",`<strong>#${c(t.judgment_vector_version_id)}</strong> \xB7 ${n(t.judgment_vector_version_status||"legacy")}`)}
          ${re("Alias",`<code>${n(t.judgment_vector_alias||"\u2014")}</code> \u2192 <code>${n(t.judgment_vector_collection||"\u2014")}</code>`)}
          ${re("\u7D22\u5F15\u6A21\u578B",`<code>${n(t.judgment_vector_model||"\u2014")}</code>`)}
          ${re("\u6700\u8FD1\u7D22\u5F15",`<span class="mono">${ne(t.judgment_indexed_at)}</span>`)}
        </div>
      </section>
    </div>`}function Kr(e){let t=e.data||{};return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${$("history",14)}\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C</span>
      <span class="badge badge-neutral badge-mono">${c(t.run_count)} TOTAL</span>
    </div>
    ${Gr(e.recent_runs)}
  </section>`}function Yr(e){let t=Number(e);return Number.isFinite(t)?t>=90?"is-danger":t>=70?"is-warn":"":""}function ha(e,t=""){let s=Math.max(0,Math.min(100,Number(e)||0));return`<div class="resource-bar ${t}"><span style="width:${s}%"></span></div>`}function tt(e,t,s,a,r){let i=Yr(r);return`<article class="resource-card">
    <div class="resource-card-head">
      <span class="resource-card-label">${$(t,14)}${n(e)}</span>
      <strong>${n(s)}</strong>
    </div>
    ${ha(r,i)}
    <div class="resource-card-detail">${a}</div>
  </article>`}function Xr(e){let t=e.docker||{};if(!t.available)return`<section class="card data-section">
      <div class="side-card-head">
        <span class="side-card-title">${$("layers",14)}Docker</span>
        ${Y("not_configured","\u672A\u9023\u7DDA")}
      </div>
      <div class="report-empty-inline">${n(t.detail||"Docker daemon \u672A\u9023\u7DDA\u3002")}</div>
    </section>`;let s=[...t.containers||[]].sort((i,o)=>{let l=i.service?0:1,m=o.service?0:1;return l-m||String(i.name).localeCompare(String(o.name))}),a=s.map(i=>`<tr>
        <td><strong>${n(i.name||"\u2014")}</strong>${i.service?`<span class="badge badge-neutral badge-mono">${n(i.service)}</span>`:""}</td>
        <td>${Y(i.state==="running"?"operational":"degraded",i.state||"\u2014")}</td>
        <td class="cell-number">${i.cpu_percent===null||i.cpu_percent===void 0?"\u2014":`${c(i.cpu_percent)}%`}</td>
        <td class="cell-number">${O(i.memory_used)}${i.memory_limit?` / ${O(i.memory_limit)}`:""}</td>
        <td class="mono">${n(i.net_io||"\u2014")}</td>
        <td class="mono">${n(i.block_io||"\u2014")}</td>
        <td class="cell-number">${c(i.pids)}</td>
      </tr>`).join(""),r=(t.system||[]).map(i=>`<span class="resource-docker-pill">
        <strong>${n(i.type||"\u2014")}</strong>
        <span>${c(i.count)} \xB7 ${n(i.size||"\u2014")}</span>
      </span>`).join("");return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${$("layers",14)}Docker \u5BB9\u5668\u4F7F\u7528\u8CC7\u6E90</span>
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
  </section>`}function Zr(e){return`<div class="resource-section-head">
      <div>
        <div class="section-title">\u5404\u8CC7\u6599\u5EAB\u4F7F\u7528\u8CC7\u6E90</div>
        <div class="section-sub">\u5BB9\u5668 CPU\uFF0FRAM \u8207\u8CC7\u6599\u5EAB\u5167\u90E8\u5BB9\u91CF</div>
      </div>
    </div>
    <div class="resource-db-grid">${(Array.isArray(e.databases)?e.databases:[]).map(s=>{let a=s.id==="postgres",r=Array.isArray(s.tables)?s.tables:[],i=s.status==="operational"?"operational":s.status==="not_configured"?"not_configured":"degraded",o=a?`${re("\u8CC7\u6599\u5EAB",`<code>${n(s.database||"\u2014")}</code>`)}
           ${re("\u8CC7\u6599\u5EAB\u5927\u5C0F",`<strong>${O(s.storage_bytes)}</strong>`)}
           ${re("Docker volume",`<strong>${O(s.volume_bytes)}</strong>${s.volume_name?` <code>${n(s.volume_name)}</code>`:""}`)}
           ${re("\u9023\u7DDA\u6578",`<strong>${c(s.connections)}</strong>`)}`:`${re("Collection",`<code>${n(s.collection||"\u2014")}</code>`)}
           ${re("Docker volume",`<strong>${O(s.volume_bytes)}</strong>${s.volume_name?` <code>${n(s.volume_name)}</code>`:""}`)}
           ${re("\u5411\u91CF\u9EDE\u6578",`<strong>${c(s.points_count)}</strong>`)}
           ${re("Collections",`<strong>${c(s.collections)}</strong>`)}
           ${re("Segments",`<strong>${c(s.segments_count)}</strong>`)}`;return`<article class="resource-db-card">
        <div class="resource-db-head">
          <div>
            <div class="resource-db-title">${n(s.name||"\u2014")}</div>
            <div class="resource-db-kind">${n(s.kind||"")}</div>
          </div>
          ${Y(i)}
        </div>
        <div class="resource-db-metrics">
          <div><span>CPU</span><strong>${s.cpu_percent===null||s.cpu_percent===void 0?"\u2014":`${c(s.cpu_percent)}%`}</strong></div>
          <div><span>RAM</span><strong>${O(s.memory_used)}</strong><small>${s.memory_limit?` / ${O(s.memory_limit)}`:""}</small></div>
          <div><span>\u5BB9\u5668</span><strong class="mono">${n(s.container||"\u2014")}</strong><small>${n(s.container_status||"\u2014")}</small></div>
        </div>
        <div class="detail-list">${o}</div>
        ${r.length?`<div class="resource-table-wrap">
                <table class="data-table is-compact">
                  <thead><tr><th scope="col">\u8CC7\u6599\u8868</th><th scope="col">\u5927\u5C0F</th></tr></thead>
                  <tbody>${r.map(l=>`<tr>
                        <td class="mono">${n(l.name||"\u2014")}</td>
                        <td class="cell-number">${O(l.bytes)}</td>
                      </tr>`).join("")}</tbody>
                </table>
              </div>`:""}
        <div class="side-card-foot">${n(s.detail||"")}</div>
      </article>`}).join("")}</div>`}function it(e,t,s,a){let r=Number(t)||0,i=a?r/a*100:0;return`<div class="storage-row">
    <div class="storage-row-head">
      <span>${n(e)}</span>
      <strong>${O(r)}</strong>
    </div>
    ${ha(i)}
    <div class="storage-row-detail">${s}</div>
  </div>`}function ei(e){let t=e.storage||{},s=t.application||{},a=t.parquet||{},r=t.docker||{},i=t.volumes||{},o=i.postgres||{},l=i.qdrant||{},m=Number(t.judgment_total_bytes||0);return`<section class="card data-section storage-section">
    <div class="side-card-head">
      <span class="side-card-title">${$("database",14)}\u786C\u789F\u4F7F\u7528\u7D44\u6210</span>
      <span class="badge badge-neutral badge-mono">${O(m)}</span>
    </div>
    <div class="storage-list">
      ${it("\u524D\u7AEF",s.frontend_bytes,`<span class="mono">${n(s.frontend_path||"\u2014")}</span>`,m)}
      ${it("\u5F8C\u7AEF",s.backend_bytes,`<span class="mono">${n(s.backend_path||"\u2014")}</span>`,m)}
      ${it("Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5FEB\u53D6",r.layers_bytes,`Images ${O(r.images_bytes)} \xB7 Containers ${O(r.containers_bytes)} \xB7 Build cache ${O(r.build_cache_bytes)}`,m)}
      ${it("PostgreSQL volume",o.size_bytes,`<span class="mono">${n(o.name||"\u2014")}</span>`,m)}
      ${it("Qdrant volume",l.size_bytes,`<span class="mono">${n(l.name||"\u2014")}</span>`,m)}
      ${it("Parquet",a.total_bytes,`\u6CD5\u898F ${O(a.law_bytes)} \xB7 \u5224\u6C7A ${O(a.judgment_bytes)}`,m)}
    </div>
    <div class="storage-total">
      <span>Judgment \u5143\u4EF6\u5408\u8A08</span>
      <strong>${O(m)}</strong>
    </div>
    <div class="side-card-foot">
      \u524D\u7AEF\uFF0B\u5F8C\u7AEF\u7A0B\u5F0F\u3001Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5EFA\u7F6E\u5FEB\u53D6\u3001PostgreSQL\uFF0FQdrant volume \u8207\u539F\u59CB Parquet\uFF1B\u4E0D\u542B .venv \u8207\u5176\u4ED6\u975E Judgment Docker volume\u3002
    </div>
  </section>`}function ti(e){let t=e.host||{},s=t.cpu||{},a=t.memory||{},r=t.swap||{},i=e.storage||{},o=i.filesystem||{},l=Number(i.judgment_total_bytes||0),m=Array.isArray(e.disk)?e.disk:[],h=m[0]||{},w=Number(o.total_bytes||h.total||0),f=w?l/w*100:0,v=[s.load_1,s.load_5,s.load_15].map(y=>y??"\u2014").join(" / "),x=t.uptime_seconds===null||t.uptime_seconds===void 0?"\u2014":F(Number(t.uptime_seconds)*1e3),b=[h.label?tt("HDD \u5DF2\u4F7F\u7528","database",`${c(h.percent)}%`,`${O(h.used)} / ${O(h.total)} \xB7 \u5269\u9918 ${O(h.free)}<br><span class="mono">${n(h.path||"")}</span>`,h.percent):"",l?tt("Judgment \u5143\u4EF6\u5408\u8A08","layers",O(l),`\u7D04\u5360 HDD ${c(f)}% \xB7 \u524D\u7AEF\uFF0F\u5F8C\u7AEF\uFF0FDocker\uFF0FDB volume\uFF0FParquet`,f):"",...m.slice(1).map(y=>tt(`\u786C\u789F \xB7 ${y.label}`,"layers",`${c(y.percent)}%`,`${O(y.used)} / ${O(y.total)} \xB7 \u5269\u9918 ${O(y.free)}<br><span class="mono">${n(y.path||"")}</span>`,y.percent))].filter(Boolean).join("");return`<div class="resource-section-head">
      <div>
        <div class="eyebrow">SYSTEM RESOURCE USAGE</div>
        <div class="section-sub">\u66F4\u65B0\u6642\u9593 ${ne(e.checked_at)} \xB7 ${e.status==="operational"?"\u8CC7\u6E90\u8B80\u53D6\u6B63\u5E38":"\u90E8\u5206\u8CC7\u6E90\u964D\u7D1A"}</div>
      </div>
    </div>
    <div class="resource-grid">
      ${tt("CPU \u4F7F\u7528\u7387","cpu",`${c(s.percent)}%`,`${c(s.logical_cores)} \u908F\u8F2F\u6838\u5FC3 \xB7 ${c(s.physical_cores)} \u5BE6\u9AD4\u6838\u5FC3<br>Load ${n(v)}`,s.percent)}
      ${tt("\u8A18\u61B6\u9AD4","server",`${c(a.percent)}%`,`${O(a.used)} / ${O(a.total)} \xB7 \u53EF\u7528 ${O(a.available)}`,a.percent)}
      ${tt("Swap","layers",`${c(r.percent)}%`,`${O(r.used)} / ${O(r.total)}`,r.percent)}
      ${tt("\u7A0B\u5E8F\u8207\u958B\u6A5F","activity",`${c(t.processes)} \u500B\u7A0B\u5E8F`,`\u958B\u6A5F ${n(x)}<br>${n(t.platform||"")}`,null)}
    </div>
    <div class="resource-grid resource-disk-grid">${b||'<div class="report-empty-inline">\u627E\u4E0D\u5230\u53EF\u8B80\u53D6\u7684\u78C1\u789F\u3002</div>'}</div>
    ${ei(e)}
    ${Xr(e)}
    ${Zr(e)}`}function ga(){return`<div class="resource-section-head">
      <div>
        <div class="skeleton skeleton-line" style="width:160px;height:18px"></div>
        <div class="skeleton skeleton-line" style="width:260px;margin-top:8px"></div>
      </div>
    </div>
    <div class="resource-grid">
      ${Array.from({length:4}).map(()=>'<div class="skeleton" style="height:120px;border-radius:var(--radius-md)"></div>').join("")}
    </div>
    <div class="skeleton" style="height:180px;margin-top:16px;border-radius:var(--radius-md)"></div>
    <div class="skeleton" style="height:220px;margin-top:16px;border-radius:var(--radius-md)"></div>`}function si(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SYSTEM RESOURCE USAGE</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${X({tone:"danger",title:"\u8CC7\u6E90 API \u8ACB\u6C42\u5931\u6557",text:n(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-resources-retry">
          ${$("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function ai(e,t,s){let a=e?.data||{},r=e?Re(e.status):null,i=s?Re(s.status):null,o={overview:r?`<span class="badge ${r.tone==="ok"?"badge-ok":r.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${n(r.label)}</span>`:"",resources:i?`<span class="badge ${i.tone==="ok"?"badge-ok":i.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${n(i.label)}</span>`:'<span class="badge badge-neutral badge-mono">\u672A\u8B80\u53D6</span>',data:`<span class="badge badge-neutral badge-mono">${c(a.version_count)}</span>`,runs:`<span class="badge badge-neutral badge-mono">${c(a.run_count)}</span>`};return`<div class="status-sidebar-head">
      <div class="eyebrow">STATUS SECTIONS</div>
      <div class="status-sidebar-title">\u7CFB\u7D71\u5206\u985E</div>
    </div>
    <nav class="status-tab-list" aria-label="\u7CFB\u7D71\u72C0\u614B\u5206\u985E">
      ${ba.map(l=>{let m=l.id===t;return`<button class="status-tab${m?" is-active":""}" type="button"
          data-status-tab="${l.id}" ${m?'aria-current="page"':""}>
          <span class="status-tab-icon">${$(l.icon,15)}</span>
          <span class="status-tab-copy">
            <strong>${n(l.label)}</strong>
            <small>${n(l.hint)}</small>
          </span>
          ${o[l.id]||""}
        </button>`}).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>\u6AA2\u67E5\u6642\u9593</span>
      <span class="mono">${n(e?ne(e.checked_at):"\u2014")}</span>
    </div>`}function ni(e,t,s,a,r){return e==="resources"?s?ti(s):a?ga():r?si(r):ga():e==="architecture"?Jr(t):e==="api"?Vr(t):e==="data"?Wr(t):e==="runs"?Kr(t):Qr(t)}function ri(){return`<div class="status-hero">
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
    </div>`}function ii(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">STATUS CHECK</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u5FEB\u53D6\u6216\u63A8\u6E2C\u7684\u670D\u52D9\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${X({tone:"danger",title:"\u72C0\u614B API \u8ACB\u6C42\u5931\u6557",text:n(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-retry">
          ${$("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}async function oi(e,t){let s=!1,a=null,r=null,i="overview",o=null,l=!1,m=null;e.innerHTML=`<section class="page status-page">
    <div class="page-header">
      <div>
        <div class="eyebrow">OBSERVABILITY</div>
        <h1 class="page-title">\u7CFB\u7D71\u67B6\u69CB\u8207\u670D\u52D9\u72C0\u614B</h1>
        <p class="page-subtitle">\u6AA2\u8996\u524D\u7AEF\u3001FastAPI\u3001PostgreSQL\u3001Parquet \u8207 AI \u5143\u4EF6\u7684\u5373\u6642\u5065\u5EB7\u72C0\u614B\uFF0C
          \u4E26\u5F9E\u5DE6\u5074\u5206\u985E\u5207\u63DB\u670D\u52D9\u7E3D\u89BD\u3001\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528\u3001\u67B6\u69CB\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u4E0B\u8F09\u7D00\u9304\u3002</p>
      </div>
      <div class="page-actions">
        <label class="auto-refresh">
          <input type="checkbox" id="auto-refresh" />
          \u81EA\u52D5\u66F4\u65B0 30s
        </label>
        <button class="btn btn-secondary" type="button" id="refresh-status">
          ${$("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
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
          ${Array.from({length:6}).map(()=>'<div class="skeleton skeleton-line" style="width:100%;height:52px;margin-top:8px"></div>').join("")}
        </div>
      </aside>
      <section class="status-panel" id="status-content">${ri()}</section>
    </div>
  </section>`;let h=e.querySelector("#status-nav"),w=e.querySelector("#status-content"),f=e.querySelector("#refresh-status"),v=e.querySelector("#auto-refresh"),x=()=>{r&&(h.innerHTML=ai(r,i,o),w.innerHTML=ni(i,r,o,l,m))},b=async({quiet:L=!1}={})=>{if(!l){l=!0,m=null,i==="resources"&&x();try{let _=await U.systemUsage();if(s)return;o=_}catch(_){if(s)return;m=_,L||D(_.message||"\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90\u3002","danger")}finally{s||(l=!1,i==="resources"&&x())}}},y=async({quiet:L=!1}={})=>{L||(f.disabled=!0,W(f,!0,"\u6AA2\u67E5\u4E2D\u2026"));try{let _=await U.status();if(s)return;r=_,x(),L||D("\u670D\u52D9\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(_){if(s)return;w.innerHTML=ii(_),L||D(_.message||"\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002","danger")}finally{s||(f.disabled=!1,W(f,!1))}},C=async({quiet:L=!1}={})=>{await y({quiet:L}),i==="resources"&&await b({quiet:L})};return h.addEventListener("click",L=>{let _=L.target.closest("[data-status-tab]");if(!_)return;let E=_.dataset.statusTab;ba.some(z=>z.id===E)&&(i=E,x(),i==="resources"&&!o&&!l&&b())}),w.addEventListener("click",L=>{L.target.closest("#status-retry")&&y(),L.target.closest("#status-resources-retry")&&b()}),f.addEventListener("click",()=>C()),v.addEventListener("change",()=>{a&&(window.clearInterval(a),a=null),v.checked&&(a=window.setInterval(()=>C({quiet:!0}),3e4),D("\u5DF2\u555F\u7528\u6BCF 30 \u79D2\u81EA\u52D5\u66F4\u65B0\u3002","info",2200))}),await y({quiet:!0}),t&&typeof t.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"),()=>{s=!0,a&&window.clearInterval(a)}}var ms={};Je(ms,{render:()=>ci});var $a={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"};function ya(e,t){let s=Array.isArray(t)?t:[];return`<div class="tests-model-group">
    <span class="tests-model-label">${n(e)}</span>
    <div class="tests-model-chips">${s.length?s.map(a=>`<span class="chip chip-mono">${n(a)}</span>`).join(""):'<span class="tests-model-empty">\u672A\u5075\u6E2C\u5230\u6A21\u578B</span>'}</div>
  </div>`}function li(e,t,s){return JSON.stringify({selected:s,runs:(t||[]).map(a=>`${a.run_id}:${a.status}`),run:e?{run_id:e.run_id,status:e.status,progress:e.progress,steps:(e.steps||[]).map(a=>`${a.stage}:${a.model}:${a.status}:${a.progress}`)}:null})}async function ci(e,t){let s=!1,a=!1,r={embedding:[],llm:[]},i=!1,o=null,l=[],m="",h=null,w="";e.innerHTML=`<section class="page tests-page">
    <div class="page-header">
      <div>
        <div class="eyebrow">SYSTEM TEST</div>
        <h1 class="page-title">\u7CFB\u7D71\u6E2C\u8A66</h1>
        <p class="page-subtitle">\u5408\u4F75\u5F8C\u7AEF API \u9023\u7DDA\u3001\u6E2C\u8A66\u6A21\u5F0F\u8207\u591A\u6A21\u578B\u6E2C\u8A66 Flow\u3002
          \u6E2C\u8A66\u6A21\u5F0F\u958B\u555F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207 LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002</p>
      </div>
      <div class="page-actions">
        <span class="badge badge-neutral badge-mono" id="tests-mode-badge">\u8B80\u53D6\u4E2D</span>
        <button class="btn btn-secondary" type="button" id="tests-refresh">
          ${$("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>

    <div class="tests-grid">
      <section class="card tests-card tests-api-card" aria-labelledby="tests-api-title">
        <form class="api-dialog-form tests-api-form" id="tests-api-form" novalidate>
          <div class="api-dialog-head">
            <span class="api-dialog-icon" aria-hidden="true">${$("link",17)}</span>
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
              ${$("activity",14)}<span>\u6E2C\u8A66\u9023\u7DDA</span>
            </button>
            <span class="grow"></span>
            <button class="btn btn-ghost btn-sm" type="button" id="tests-api-reset">\u6062\u5FA9\u9810\u8A2D</button>
            <button class="btn btn-primary btn-sm" type="submit" id="tests-api-save">
              ${$("check",14)}<span>\u5132\u5B58\u4E26\u91CD\u65B0\u8F09\u5165</span>
            </button>
          </div>
        </form>
      </section>

      <section class="card tests-card" aria-labelledby="tests-mode-title">
        <div class="tests-card-head">
          <span class="tests-card-icon">${$("terminal",16)}</span>
          <div>
            <div class="tests-card-title" id="tests-mode-title">\u6E2C\u8A66\u6A21\u5F0F</div>
            <div class="tests-card-copy">\u958B\u555F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528\u6A21\u578B\uFF0C\u7D50\u679C\u5BEB\u5165\u6E2C\u8A66 Flow\u3002</div>
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
            ${$("sparkles",13)}<span>\u524D\u5F80 RAG \u63D0\u554F</span>
          </a>
          <a class="btn btn-secondary btn-sm" href="#/performance">
            ${$("activity",13)}<span>\u6548\u80FD Flow</span>
          </a>
        </div>
        <div class="tests-status" id="tests-mode-status" role="status"></div>
      </section>
    </div>

    <div id="tests-flow"></div>
  </section>`;let f=e.querySelector("#tests-mode-badge"),v=e.querySelector("#tests-mode-toggle"),x=e.querySelector("#tests-mode-summary"),b=e.querySelector("#tests-mode-models"),y=e.querySelector("#tests-mode-status"),C=e.querySelector("#tests-api-form"),L=e.querySelector("#tests-api-input"),_=e.querySelector("#tests-api-preview"),E=e.querySelector("#tests-api-status"),z=e.querySelector("#tests-api-note"),Q=e.querySelector("#tests-api-test"),Z=e.querySelector("#tests-api-reset"),ie=e.querySelector("#tests-api-save"),I=e.querySelector("#tests-refresh"),P=e.querySelector("#tests-flow"),k=(N,G,u="")=>{N&&(N.textContent=G,N.className=`tests-status${u?` is-${u}`:""}`)},T=(N,G="")=>{E&&(E.textContent=N,E.className=`api-dialog-status${G?` is-${G}`:""}`)},B=()=>Ue()==="query",J=()=>{let N=Fe(L.value);return N||(window.location.protocol==="file:"?Ft:"")},$e=()=>{let N=J(),G=He(),u=$a[Ue()]||Ue()||"\u540C\u6E90";_.innerHTML=`\u76EE\u524D\u751F\u6548\uFF1A<strong>${n(Ve(G))}</strong>${G?`\uFF08${n(u)}\uFF09`:""}<br />\u6B64\u4F4D\u5740\u7684\u5065\u5EB7\u6AA2\u67E5\uFF1A${n(Ce("/api/health",N))}`},qe=()=>{let N=Ue(),G=`\u76EE\u524D\u4F86\u6E90\uFF1A${$a[N]||N||"\u540C\u6E90"}\u3002\u512A\u5148\u9806\u5E8F\u70BA ?api= \u2192 \u700F\u89BD\u5668\u5132\u5B58\u503C \u2192 config.js \u2192 \u540C\u6E90\u3002`,u="";N==="query"?(u="is-warn",G="\u6B64\u9801\u7531\u7DB2\u5740\u7684 ?api= \u53C3\u6578\u6307\u5B9A\u5F8C\u7AEF\u4F4D\u5740\uFF0C\u5177\u6709\u6700\u9AD8\u512A\u5148\u9806\u5E8F\u3002\u5132\u5B58\u6216\u6062\u5FA9\u9810\u8A2D\u5728\u6B64\u9801\u4E0D\u6703\u751F\u6548\uFF1B\u8ACB\u5148\u79FB\u9664\u7DB2\u5740\u4E2D\u7684 api \u53C3\u6578\u3002"):gt()?(u="is-warn",G="\u6B64\u9801\u4E0D\u662F\u5F9E localhost \u958B\u555F\uFF0C\u4E14\u5C1A\u672A\u8A2D\u5B9A\u5F8C\u7AEF API\u3002\u8ACB\u586B\u5165 cloudflared \u7684 https:// \u4F4D\u5740\uFF0C\u6216\u90E8\u7F72\u6642\u5728 config.js \u6307\u5B9A apiBase\uFF1BHTTP \u4F4D\u5740\u6703\u88AB HTTPS \u9801\u9762\u963B\u64CB\u3002"):(N==="file-default"||window.location.protocol==="file:")&&(G="\u4EE5 file:// \u76F4\u63A5\u958B\u555F\u6642\uFF0C\u9810\u8A2D\u9023\u5230 http://127.0.0.1:9200\u3002\u82E5\u5F8C\u7AEF\u4F7F\u7528\u5176\u4ED6\u9023\u63A5\u57E0\uFF0C\u8ACB\u5728\u6B64\u4FEE\u6539\u4E26\u5132\u5B58\u3002"),z.textContent=G,z.className=`api-dialog-note${u?` ${u}`:""}`;let q=N==="query";ie.disabled=q,Z.disabled=q,L.readOnly=q},ue=()=>{if(!Ht(L.value))return T("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002","error"),L.focus(),null;let N=J();return window.location.protocol==="https:"&&/^http:\/\//i.test(N)&&!/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(N)?(T("HTTPS \u9801\u9762\u7121\u6CD5\u9023\u7DDA\u5230 HTTP API\uFF08mixed content\uFF09\u3002\u8ACB\u6539\u7528 cloudflared \u63D0\u4F9B\u7684 https:// \u4F4D\u5740\u3002","error"),L.focus(),null):N},ye=()=>{L.value=He(),$e(),qe(),T("\u53EF\u5148\u6E2C\u8A66\u9023\u7DDA\uFF0C\u5132\u5B58\u5F8C\u9801\u9762\u6703\u91CD\u65B0\u8F09\u5165\u3002")},H=()=>{let N=Array.isArray(r.embedding)?r.embedding.length:0,G=Array.isArray(r.llm)?r.llm.length:0;if(f&&(f.textContent=i?"\u5207\u63DB\u4E2D\u2026":a?"\u6E2C\u8A66\u6A21\u5F0F ON":"\u6E2C\u8A66\u6A21\u5F0F OFF",f.className=`badge badge-mono ${i?"badge-info":a?"badge-warn":"badge-neutral"}`),v){v.disabled=i,v.classList.toggle("is-on",a),v.classList.toggle("is-off",!a&&!i),v.classList.toggle("is-busy",i),v.setAttribute("aria-checked",a?"true":"false"),v.setAttribute("aria-busy",i?"true":"false"),v.setAttribute("aria-label",i?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F":a?"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF0C\u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\uFF0C\u9EDE\u64CA\u958B\u555F"),v.title=i?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F\u2026":a?"\u6E2C\u8A66\u6A21\u5F0F ON \xB7 \u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F OFF \xB7 \u9EDE\u64CA\u958B\u555F";let u=v.querySelector(".header-power-label");u&&(u.textContent=i?"\u2026":a?"ON":"OFF")}x&&(x.textContent=a?`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${N} \u500B embedding \u8207 ${G} \u500B LLM \u6A21\u578B\u3002`:"\u76EE\u524D\u4F7F\u7528\u5FEB\u901F\u6A21\u5F0F\uFF1A\u55AE\u4E00 embedding \u8207 LLM\u3002"),b&&(b.innerHTML=ya("Embedding",r.embedding)+ya("LLM",r.llm))},ce=async()=>{try{let N=await U.testMode();if(s)return;a=!!N.enabled,r=N.models||{embedding:[],llm:[]},k(y,"")}catch(N){if(s)return;a=!1,r={embedding:[],llm:[]},k(y,N.message||"\u7121\u6CD5\u8B80\u53D6\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF API\u3002","error")}s||H()},je=async()=>{if(i)return;let N=!a;i=!0,H(),k(y,N?"\u6B63\u5728\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u2026":"\u6B63\u5728\u95DC\u9589\u6E2C\u8A66\u6A21\u5F0F\u2026");try{let G=await U.setTestMode(N);if(s)return;a=!!G.enabled,r=G.models||{embedding:[],llm:[]},window.dispatchEvent(new CustomEvent("judgment:test-mode",{detail:{enabled:a,models:r}}));let u=r.embedding?.length||0,q=r.llm?.length||0;k(y,a?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A\u4E0B\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C ${u} \u500B embedding \u8207 ${q} \u500B LLM \u6A21\u578B\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","ok"),D(a?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A${u} \u500B embedding\u3001${q} \u500B LLM\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002",a?"ok":"info",6e3),await Ae()}catch(G){s||(k(y,G.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","error"),D(G.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","danger",6e3))}finally{i=!1,s||H()}},Se=()=>{if(!P)return;let N=li(o,l,m);N!==w&&(w=N,P.innerHTML=nt(o,l,m))},Ee=async()=>{try{let N=await U.testRuns(30);if(s)return;l=Array.isArray(N.runs)?N.runs:[]}catch{if(s)return;l=[]}},Ae=async()=>{try{let N=m?await U.testRun(m):await U.testRunCurrent();if(s)return;o=N.run||null,!m&&o&&o.status!=="running"&&!l.some(G=>G.run_id===o.run_id)&&await Ee()}catch{if(s)return;o=null}s||Se()};L?.addEventListener("input",()=>{$e(),T("\u5C1A\u672A\u6E2C\u8A66\u6B64\u4F4D\u5740\u3002")}),Q?.addEventListener("click",async()=>{let N=ue();if(N!==null){W(Q,!0,"\u6E2C\u8A66\u4E2D\u2026"),T(`\u6B63\u5728\u9023\u7DDA\u5230 ${Ve(N)||"\u540C\u6E90"}\u2026`);try{let G=await ys(N);if(s)return;T(`\u9023\u7DDA\u6210\u529F \xB7 v${G.version} \xB7 ${G.duration_ms} ms \xB7 GET ${Ce("/api/health",N)}`,"ok")}catch(G){s||T(G.message||"\u9023\u7DDA\u6E2C\u8A66\u5931\u6557\u3002","error")}finally{s||W(Q,!1)}}}),C?.addEventListener("submit",N=>{if(N.preventDefault(),B())return;let G=ue();G!==null&&(Qt(G),D(`\u5F8C\u7AEF API \u5DF2\u8A2D\u70BA ${Ve(G)}\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026`,"ok",1600),window.setTimeout(()=>window.location.reload(),120))}),Z?.addEventListener("click",()=>{B()||(Qt(""),D("\u5DF2\u6E05\u9664\u700F\u89BD\u5668\u5132\u5B58\u7684 API \u4F4D\u5740\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026","info",1600),window.setTimeout(()=>window.location.reload(),120))}),v?.addEventListener("click",je),P?.addEventListener("change",async N=>{N.target.id==="test-run-select"&&(m=String(N.target.value||""),await Ae())}),P?.addEventListener("click",async N=>{N.target.closest("#test-flow-refresh")&&(m="",await Ee(),await Ae())}),I?.addEventListener("click",async()=>{W(I,!0,"\u66F4\u65B0\u4E2D\u2026"),ye(),await Promise.allSettled([ce(),Ee()]),s||await Ae(),s||(W(I,!1),D("\u7CFB\u7D71\u6E2C\u8A66\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200))});let Oe=N=>{a=!!N.detail?.enabled,r=N.detail?.models||{embedding:[],llm:[]},H()};return window.addEventListener("judgment:test-mode",Oe),ye(),H(),await Promise.allSettled([ce(),Ee()]),await Ae(),h=window.setInterval(async()=>{s||document.hidden||m||await Ae()},2500),typeof t?.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"),()=>{s=!0,h&&window.clearInterval(h),window.removeEventListener("judgment:test-mode",Oe)}}var wa="rag",Dt={rag:{page:cs,title:"RAG \u63D0\u554F \xB7 Judgment RAG Console"},data:{page:rs,title:"\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"},quality:{page:us,title:"\u8CC7\u6599\u54C1\u8CEA \xB7 Judgment RAG Console"},performance:{page:os,title:"\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"},processing:{page:ds,title:"\u8CC7\u6599\u8655\u7406 \xB7 Judgment RAG Console"},status:{page:ps,title:"\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"},tests:{page:ms,title:"\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"}},Nt=document.getElementById("app-main"),Rt=null,It=0;function di(){return`<div class="page-loading" aria-live="polite">
    <div class="skeleton skeleton-title"></div>
    <div class="skeleton skeleton-subtitle"></div>
    <div class="skeleton-grid">
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
    </div>
  </div>`}function gs(){let t=window.location.hash.replace(/^#\/?/,"").trim().split("/")[0]||wa;return Object.prototype.hasOwnProperty.call(Dt,t)?t:wa}function ui(e){document.querySelectorAll("[data-route]").forEach(t=>{let s=t.dataset.route===e;t.classList.toggle("is-active",s),s?t.setAttribute("aria-current","page"):t.removeAttribute("aria-current")})}function pi(e){return`<section class="page">
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
          <span class="notice-icon" aria-hidden="true">${$("alert",12)}</span>
          <div class="notice-body">
            <strong>\u7121\u6CD5\u5EFA\u7ACB\u9801\u9762</strong>
            <p>${n(e.message||"\u672A\u77E5\u932F\u8AA4")}</p>
          </div>
        </div>
        <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
          <button class="btn btn-secondary btn-sm" type="button" id="route-retry">
            ${$("refresh",14)}<span>\u91CD\u65B0\u8F09\u5165</span>
          </button>
        </div>
      </div>
    </div>
  </section>`}async function vs(){let e=gs(),t=++It;if(ui(e),window.location.hash!==`#/${e}`&&window.history.replaceState(null,"",`#/${e}`),typeof Rt=="function"){try{Rt()}catch{}Rt=null}document.title=Dt[e].title,Nt.innerHTML=di(),Nt.focus({preventScroll:!0}),window.scrollTo({top:0,behavior:"auto"});let s={route:e,navigate(a){Dt[a]&&(window.location.hash=`#/${a}`)},setTitle(a){t===It&&a&&(document.title=a)}};try{let a=await Dt[e].page.render(Nt,s);if(t!==It){typeof a=="function"&&a();return}Rt=typeof a=="function"?a:null}catch(a){if(t!==It)return;console.error("Failed to render route",e,a),Nt.innerHTML=pi(a);let r=document.getElementById("route-retry");r&&r.addEventListener("click",()=>vs()),D("\u9801\u9762\u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}}function mi(){document.addEventListener("keydown",e=>{if(e.key!=="/"||e.metaKey||e.ctrlKey||e.altKey)return;let t=document.activeElement;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable)||gs()!=="rag")return;let a=document.getElementById("rag-question");a&&(e.preventDefault(),a.focus())})}function _a(){Ss(),mi(),window.addEventListener("hashchange",vs),vs(),gt()&&window.setTimeout(()=>{gs()!=="tests"&&(window.location.hash="#/tests")},700)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",_a):_a();})();
