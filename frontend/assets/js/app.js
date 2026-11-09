(()=>{var wa=Object.defineProperty;var Qe=(e,t)=>{for(var s in t)wa(e,s,{get:t[s],enumerable:!0})};var Bt="judgment.api_base",Ot="http://127.0.0.1:9200",ve=class extends Error{constructor(t,s=0,a=null){super(t),this.name="ApiError",this.status=s,this.detail=a}};function fs(e){return["localhost","127.0.0.1","::1","[::1]"].includes(e)}function Oe(e){let t=String(e??"").trim();if(!t||t==="/")return"";t=t.replace(/\/+$/,""),!/^https?:\/\//i.test(t)&&!t.startsWith("/")&&(t=`${fs(t.split(":")[0])?"http":"https"}://${t}`);try{let s=new URL(t,window.location.href);return s.protocol!=="http:"&&s.protocol!=="https:"?"":`${s.origin}${s.pathname==="/"?"":s.pathname.replace(/\/+$/,"")}`}catch{return t}}function Ft(e){let t=Oe(e);if(!t)return!0;try{let s=new URL(t);return s.protocol==="http:"||s.protocol==="https:"}catch{return!1}}function Ht(){try{let e=new URLSearchParams(window.location.search);return e.has("api")?Oe(e.get("api")):null}catch{return null}}function Ut(){try{let e=window.localStorage.getItem(Bt);return e===null?null:Oe(e)}catch{return null}}function zt(){let e=window.JUDGMENT_CONFIG&&window.JUDGMENT_CONFIG.apiBase;return Oe(e||"")}function Fe(){let e=Ht();if(e!==null)return e;let t=Ut();if(t!==null)return t;let s=zt();return s||(window.location.protocol==="file:"?Ot:"")}function _a(){if(Ht()!==null)return!0;let e=Ut();return e!==null?!!e:!!zt()}function He(){return Ht()!==null?"query":Ut()!==null?"storage":zt()?"config":window.location.protocol==="file:"?"file-default":"same-origin"}function gt(){return _a()||window.location.protocol==="file:"||!window.JUDGMENT_CONFIG?!1:!fs(window.location.hostname)}function Gt(e){let t=Oe(e);try{t?window.localStorage.setItem(Bt,t):window.localStorage.removeItem(Bt)}catch{}return t}function Je(e=Fe()){return e||"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"}function Ee(e,t=Fe()){return t?`${t}${e.startsWith("/")?e:`/${e}`}`:e}function Qt(e){return`\u7121\u6CD5\u9023\u7DDA\u5230\u4F3A\u670D\u5668${e?`\uFF08${e}\uFF09`:""}\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u662F\u5426\u555F\u52D5\uFF0C\u6216\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u8A2D\u5B9A\u5F8C\u7AEF\u4F4D\u5740\u3002`}async function Z(e,t={}){let s=Fe(),a=new AbortController,r=t.timeout===void 0?3e4:t.timeout,i=r>0?window.setTimeout(()=>a.abort(),r):null,o=Date.now(),l=performance.now(),m=t.requestId||hs(),b={Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},"X-Judgment-Request-Id":m,"X-Judgment-Client-Started-At":String(o),...t.headers||{}},w;try{w=await fetch(Ee(e,s),{...t,headers:b,signal:a.signal})}catch(y){throw y.name==="AbortError"?new ve("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new ve(Qt(s),0,y)}finally{i&&window.clearTimeout(i)}let f=null;if((w.headers.get("content-type")||"").includes("application/json"))try{f=await w.json()}catch{f=null}else try{f=await w.text()}catch{f=null}let x=performance.now(),h=w.headers.get("X-Judgment-Request-Id")||m;if(t.trackClient!==!1&&h){let y=Math.round(performance.now()-l);window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{bs({request_id:h,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:y,render_ms:Math.max(0,Math.round(performance.now()-x)),status:w.ok?"success":"failed"})})})}if(!w.ok){let y=f&&typeof f=="object"?f.detail||f.message:f,N=typeof y=="string"&&y?y:`\u4F3A\u670D\u5668\u56DE\u61C9 ${w.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new ve(N,w.status,y)}return f}function hs(){try{if(window.crypto&&typeof window.crypto.randomUUID=="function")return window.crypto.randomUUID().replace(/-/g,"").slice(0,32)}catch{}return`req${Date.now().toString(36)}${Math.random().toString(36).slice(2,10)}`}function bs(e){try{fetch(Ee("/api/performance/client",Fe()),{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e),keepalive:!0}).catch(()=>{})}catch{}}async function $s(e){let t=Oe(e);if(!Ft(t))throw new ve("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002");let s=performance.now(),a=new AbortController,r=window.setTimeout(()=>a.abort(),1e4);try{let i=await fetch(Ee("/api/health",t),{headers:{Accept:"application/json"},signal:a.signal});if(!i.ok)throw new ve(`API \u56DE\u61C9 ${i.status}\u3002`,i.status);let o=await i.json();return{base:t,version:o.version||"\u2014",duration_ms:Math.round(performance.now()-s)}}catch(i){throw i instanceof ve?i:i.name==="AbortError"?new ve("\u9023\u7DDA\u6E2C\u8A66\u903E\u6642\uFF0C\u8ACB\u78BA\u8A8D API \u4F4D\u5740\u8207\u7DB2\u8DEF\u3002",0,i):new ve(Qt(t),0,i)}finally{window.clearTimeout(r)}}var U={health(){return Z("/api/health")},status(){return Z("/api/status",{trackClient:!1})},systemUsage(){return Z("/api/system-usage",{trackClient:!1})},indexVersions(){return Z("/api/index-versions",{trackClient:!1})},indexVersion(e){return Z(`/api/index-versions/${encodeURIComponent(e)}`,{trackClient:!1})},validateIndexVersion(e){return Z(`/api/index-versions/${encodeURIComponent(e)}/validate`,{method:"POST",trackClient:!1})},activateIndexVersion(e){return Z(`/api/index-versions/${encodeURIComponent(e)}/activate`,{method:"POST",trackClient:!1})},rollbackIndexVersion(){return Z("/api/index-versions/rollback",{method:"POST",trackClient:!1})},reconcileIndexAlias(e=!1){let t=new URLSearchParams({repair:e?"true":"false"});return Z(`/api/index-alias/reconcile?${t.toString()}`,{trackClient:!1})},catalog(){return Z("/api/catalog")},query({database:e,filters:t,page:s=1,pageSize:a=25}){return Z("/api/query",{method:"POST",body:JSON.stringify({database:e,filters:t,page:s,page_size:a})})},schemaSuggest({database:e,table:t,column:s,query:a,limit:r=1e3}){let i=new URLSearchParams({database:e,table:t,column:s,q:a||"",limit:String(r)});return Z(`/api/schema/suggest?${i.toString()}`,{timeout:3e4})},lawDetail(e,t="",s="",a=""){let r=new URLSearchParams({law_key:e});return t&&r.set("source_type",t),s&&r.set("version_id",String(s)),a&&r.set("article_no",String(a)),Z(`/api/law?${r.toString()}`,{timeout:45e3})},judgmentDetail(e,t=""){let s=new URLSearchParams({jid:e});return t&&s.set("source",t),Z(`/api/judgment?${s.toString()}`,{timeout:45e3})},testMode(){return Z("/api/test-mode",{trackClient:!1})},setTestMode(e){return Z("/api/test-mode",{method:"POST",body:JSON.stringify({enabled:!!e}),trackClient:!1})},testRuns(e=20){let t=new URLSearchParams({limit:String(e)});return Z(`/api/test-runs?${t.toString()}`,{trackClient:!1})},testRunCurrent(){return Z("/api/test-runs/current",{trackClient:!1})},testRun(e){return Z(`/api/test-runs/${encodeURIComponent(e)}`,{trackClient:!1})},performanceOptions(){return Z("/api/performance/options",{trackClient:!1})},performance(e={},t=1,s=25){let a=new URLSearchParams;for(let[r,i]of Object.entries(e))i==null||i===""||a.set(r,String(i));return a.set("page",String(t)),a.set("page_size",String(s)),Z(`/api/performance?${a.toString()}`,{timeout:45e3,trackClient:!1})},quality(){return Z("/api/quality",{timeout:18e4,trackClient:!1})},processing(){return Z("/api/processing",{timeout:45e3,trackClient:!1})},processingPlan(){return Z("/api/processing/plan",{timeout:45e3,trackClient:!1})},startProcessingWorkflow(e){return Z(`/api/processing/workflows/${encodeURIComponent(e)}/run`,{method:"POST",body:JSON.stringify({})})},startProcessingUpdate(e=!1){return Z("/api/processing/update",{method:"POST",body:JSON.stringify({index:!!e}),timeout:45e3,trackClient:!1})},stopProcessingUpdate(){return Z("/api/processing/stop",{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},rag(e,t={}){return Z("/api/rag/query",{method:"POST",body:JSON.stringify({question:e}),timeout:t.testMode?0:3e5})},async ragStream(e,{testMode:t=!1,onStep:s=null,onPartial:a=null,onToken:r=null,onTokenReset:i=null}={}){let o=Fe(),l=new AbortController,m=t?0:3e5,b=m>0?window.setTimeout(()=>l.abort(),m):null,w=Date.now(),f=performance.now(),v=hs(),x={Accept:"text/event-stream","Content-Type":"application/json","X-Judgment-Request-Id":v,"X-Judgment-Client-Started-At":String(w)},h;try{h=await fetch(Ee("/api/rag/query/stream",o),{method:"POST",headers:x,body:JSON.stringify({question:e}),signal:l.signal})}catch(G){throw G.name==="AbortError"?new ve("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new ve(Qt(o),0,G)}finally{b&&window.clearTimeout(b)}if(!h.ok){let G=null;try{G=await h.json()}catch{G=null}let X=G&&typeof G=="object"&&G.detail?String(G.detail):`\u4F3A\u670D\u5668\u56DE\u61C9 ${h.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new ve(X,h.status,G)}if(!h.body)throw new ve("\u4F3A\u670D\u5668\u6C92\u6709\u56DE\u50B3\u53EF\u8B80\u53D6\u7684\u6D41\u7A0B\u4E32\u6D41\u3002",0,null);let y=h.body.getReader(),N=new TextDecoder,M="",_=null,E=null;try{for(;;){let{value:G,done:X}=await y.read();if(X)break;M+=N.decode(G,{stream:!0});let se=M.indexOf(`

`);for(;se>=0;){let R=M.slice(0,se).replace(/\r/g,"");M=M.slice(se+2);let P="message",k=[];for(let q of R.split(`
`))q.startsWith("event:")?P=q.slice(6).trim():q.startsWith("data:")&&k.push(q.slice(5).trimStart());if(k.length){let q=null;try{q=JSON.parse(k.join(`
`))}catch{q=null}if(q)if(P==="step"&&typeof s=="function")try{s(q)}catch{}else if(P==="partial"){if(typeof a=="function")try{a(q)}catch{}}else if(P==="token"){if(typeof r=="function")try{r(String(q.text||""))}catch{}}else if(P==="token_reset"){if(typeof i=="function")try{i()}catch{}}else P==="result"?_=q:P==="error"&&(E=new ve(q.message||q.detail||"RAG \u6D41\u7A0B\u5931\u6557\u3002",0,q))}se=M.indexOf(`

`)}}}finally{try{await y.cancel()}catch{}b&&window.clearTimeout(b)}if(E)throw E;if(!_)throw new ve("\u6D41\u7A0B\u4E32\u6D41\u7D50\u675F\uFF0C\u4F46\u6C92\u6709\u6536\u5230\u6700\u7D42\u56DE\u7B54\u3002",0,null);let z=Math.round(performance.now()-f);return bs({request_id:v,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:z,render_ms:0,status:"success"}),_}};var ka={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},xa={operational:{label:"\u6B63\u5E38",tone:"ok"},success:{label:"\u6210\u529F",tone:"ok"},ok:{label:"\u6B63\u5E38",tone:"ok"},healthy:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},warning:{label:"\u6CE8\u610F",tone:"warn"},empty:{label:"\u7121\u8CC7\u6599",tone:"warn"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},running:{label:"\u57F7\u884C\u4E2D",tone:"info"},pending:{label:"\u7B49\u5F85",tone:"idle"},skipped:{label:"\u7565\u904E",tone:"idle"},partial:{label:"\u90E8\u5206\u6210\u529F",tone:"warn"},preview:{label:"\u9810\u89BD\u6A21\u5F0F",tone:"info"},retrieval_only:{label:"\u50C5\u6AA2\u7D22\u7D50\u679C",tone:"warn"},not_indexed:{label:"\u5C1A\u672A\u7D22\u5F15",tone:"warn"},missing_query:{label:"\u7B49\u5F85\u67E5\u8A62",tone:"idle"},client_side:{label:"\u700F\u89BD\u5668\u7AEF",tone:"info"},not_configured:{label:"\u672A\u8A2D\u5B9A",tone:"idle"},unavailable:{label:"\u96E2\u7DDA",tone:"danger"},failed:{label:"\u5931\u6557",tone:"danger"},error:{label:"\u932F\u8AA4",tone:"danger"}},Sa={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},Aa={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},ys={search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',send:'<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',refresh:'<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 4v5.5H15"/>',copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',check:'<path d="m5 12 4.2 4.2L19 6.5"/>',x:'<path d="m6 6 12 12M18 6 6 18"/>',external:'<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/>',message:'<path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H6l-3 2 1.3-4.2A8.5 8.5 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',history:'<path d="M3.2 12a8.8 8.8 0 1 0 2.8-6.3L3.2 8.5"/><path d="M3 3.5v5h5"/><path d="M12 7.5V12l3 1.8"/>',database:'<ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/><path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/>',layers:'<path d="m12 3 9 4.8-9 4.8-9-4.8L12 3Z"/><path d="m3 12.2 9 4.8 9-4.8"/><path d="m3 16.7 9 4.8 9-4.8"/>',cube:'<path d="m12 2.8 8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4L12 2.8Z"/><path d="m3.8 7.4 8.2 4.6 8.2-4.6"/><path d="M12 12v9.2"/>',browser:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6.5 6.5h.01"/>',download:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',chevronLeft:'<path d="m14.5 5-7 7 7 7"/>',chevronRight:'<path d="m9.5 5 7 7-7 7"/>',chevronDown:'<path d="m5 9 7 7 7-7"/>',arrowRight:'<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',alert:'<path d="M12 3 2.5 20.5h19L12 3Z"/><path d="M12 9v4.5"/><path d="M12 17.5h.01"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',sparkles:'<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"/>',table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M9 9.5V20M15 9.5V20"/>',sliders:'<path d="M4 7h8M16 7h4M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',server:'<rect x="3" y="4" width="18" height="6" rx="1.6"/><rect x="3" y="14" width="18" height="6" rx="1.6"/><path d="M7 7h.01M7 17h.01"/>',brain:'<path d="M9.7 4.2a2.8 2.8 0 0 0-3 2.8 2.8 2.8 0 0 0-1.1 5.2A2.9 2.9 0 0 0 7.8 18a2.9 2.9 0 0 0 3.9 2V4.2a2.8 2.8 0 0 0-2 0Z"/><path d="M14.3 4.2a2.8 2.8 0 0 1 3 2.8 2.8 2.8 0 0 1 1.1 5.2A2.9 2.9 0 0 1 16.2 18a2.9 2.9 0 0 1-3.9 2"/>',cloud:'<path d="M7 18.5h10.5a3.5 3.5 0 0 0 .4-7 5.5 5.5 0 0 0-10.6-1.3A4.2 4.2 0 0 0 7 18.5Z"/>',code:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',play:'<path d="M7 4.5v15l13-7.5-13-7.5Z"/>',file:'<path d="M6 2.8h8l4.5 4.5v13.9H6V2.8Z"/><path d="M14 2.8V7.5h5"/>',activity:'<path d="M3 12h4l2.2-5 4.1 10 2.2-5H21"/>',shield:'<path d="M12 2.8 20 6v6c0 4.7-3.2 8-8 9.2C7.2 20 4 16.7 4 12V6l8-3.2Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',terminal:'<path d="m5 7 5 5-5 5"/><path d="M12 17h7"/>',filter:'<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',link:'<path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10.2 5.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-1.4 1.4a5 5 0 0 0 7.1 7.1l1.2-1.2"/>',grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9.5 9.5h5v5h-5z"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>'};function n(e){return String(e??"").replace(/[&<>"']/g,t=>ka[t])}function $(e,t=16,s=""){let a=ys[e]||ys.info;return`<svg${s?` class="${n(s)}"`:""} width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a}</svg>`}function c(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?new Intl.NumberFormat("zh-TW").format(s):t}function O(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=["B","KB","MB","GB","TB"],a=0;for(;t>=1024&&a<s.length-1;)t/=1024,a+=1;return a===0?`${t.toFixed(0)} B`:`${t.toFixed(1)} ${s[a]}`}function Jt(e){if(e instanceof Date)return e;if(typeof e=="number"){let r=new Date(e);return Number.isNaN(r.getTime())?null:r}let t=String(e??"").trim();if(!t)return null;if(/^\d{8}$/.test(t))return new Date(Number(t.slice(0,4)),Number(t.slice(4,6))-1,Number(t.slice(6,8)));let s=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(t),a=new Date(s?`${t}Z`:t);return Number.isNaN(a.getTime())?null:a}function Pe(e){let t=Jt(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit"}).format(t):e?n(e):"\u2014"}function ee(e){let t=Jt(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1}).format(t):e?n(e):"\u2014"}function tt(e){let t=Jt(e);if(!t)return"";let s=Date.now()-t.getTime();return s<45e3?"\u525B\u525B":s<36e5?`${Math.max(1,Math.round(s/6e4))} \u5206\u9418\u524D`:s<864e5?`${Math.round(s/36e5)} \u5C0F\u6642\u524D`:s<6048e5?`${Math.round(s/864e5)} \u5929\u524D`:Pe(t)}function F(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;if(t<6e4)return`${(t/1e3).toFixed(1)} s`;let s=Math.floor(t/6e4),a=Math.round(t%6e4/1e3);return`${s}m ${a}s`}function Ne(e){return xa[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function K(e,t){let s=Ne(e);return`<span class="badge ${Sa[s.tone]}"><span class="status-dot ${Aa[s.tone]}"></span>${n(t||s.label)}</span>`}function La(e){return e==="law"?'<span class="badge badge-info">\u6CD5\u898F</span>':e==="order"?'<span class="badge badge-neutral">\u547D\u4EE4</span>':e?`<span class="badge badge-neutral">${n(e)}</span>`:'<span class="cell-empty">\u2014</span>'}function ft(e,t){let s=String(e??"");return s.length>t?`${s.slice(0,t)}\u2026`:s}function ht(e,t="text"){if(e==null||e==="")return'<span class="cell-empty">\u2014</span>';switch(t){case"boolean":return e?'<span class="badge badge-ok">\u662F</span>':'<span class="badge badge-neutral">\u5426</span>';case"status":return K(String(e));case"source":return La(String(e));case"number":return`<span class="mono">${c(e)}</span>`;case"duration":return`<span class="mono">${F(e)}</span>`;case"datetime":return`<span class="mono">${ee(e)}</span>`;case"date":return`<span class="mono">${Pe(e)}</span>`;case"url":{let s=String(e),a=ft(s.replace(/^https?:\/\//,""),46);return`<span class="cell-url"><a href="${n(s)}" target="_blank" rel="noopener noreferrer" title="${n(s)}">${$("external",10)}${n(a)}</a></span>`}case"mono":{let s=String(e);return`<span class="cell-mono cell-truncate" title="${n(s)}">${n(ft(s,54))}</span>`}case"longtext":{let s=String(e);return`<span class="cell-truncate" title="${n(s)}">${n(ft(s,100))}</span>`}default:{let s=String(e);return`<span class="cell-truncate" title="${n(s)}">${n(ft(s,90))}</span>`}}}function Y({tone:e="info",title:t,text:s,iconName:a="info"}){let r=e==="ok"?"check":e==="danger"||e==="warn"?"alert":"i";return`<div class="notice notice-${e}" role="status">
    <span class="notice-icon" aria-hidden="true">${r==="i"?"i":$(r,12)}</span>
    <div class="notice-body">
      ${t?`<strong>${n(t)}</strong>`:""}
      ${s?`<p>${s}</p>`:""}
    </div>
  </div>`}function ye({iconName:e="search",title:t,text:s="",actions:a="",className:r=""}){return`<div class="empty-state ${r}">
    <span class="empty-icon">${$(e,24)}</span>
    <h3 class="empty-title">${n(t)}</h3>
    ${s?`<p class="empty-text">${s}</p>`:""}
    ${a?`<div class="empty-actions">${a}</div>`:""}
  </div>`}function V(e,t,s="\u8655\u7406\u4E2D\u2026"){e&&(t?(e.dataset.idleHtml||(e.dataset.idleHtml=e.innerHTML),e.disabled=!0,e.classList.add("is-loading"),e.innerHTML=`<span class="spinner" aria-hidden="true"></span><span>${n(s)}</span>`):(e.disabled=!1,e.classList.remove("is-loading"),e.dataset.idleHtml&&(e.innerHTML=e.dataset.idleHtml,delete e.dataset.idleHtml)))}function D(e,t="info",s=4200){let a=document.getElementById("toast-region");if(!a)return null;let r={info:"i",ok:"\u2713",warn:"!",danger:"\xD7"},i=document.createElement("div");i.className=`toast toast-${t}`,i.setAttribute("role",t==="danger"?"alert":"status"),i.innerHTML=`<span class="toast-mark" aria-hidden="true">${r[t]||"i"}</span>
    <div class="toast-body">${n(e)}</div>
    <button class="toast-close" type="button" aria-label="\u95DC\u9589\u901A\u77E5">\xD7</button>`;let o=()=>{i.isConnected&&(i.classList.add("is-leaving"),window.setTimeout(()=>i.remove(),190))};return i.querySelector(".toast-close").addEventListener("click",o),a.appendChild(i),s>0&&window.setTimeout(o,s),i}async function bt(e){try{return await navigator.clipboard.writeText(e),!0}catch{let s=document.createElement("textarea");s.value=e,s.setAttribute("readonly",""),s.style.position="fixed",s.style.opacity="0",document.body.appendChild(s),s.select();let a=!1;try{a=document.execCommand("copy")}catch{a=!1}return s.remove(),a}}function Ue(e,t,s="text/plain;charset=utf-8"){let a=new Blob([t],{type:s}),r=URL.createObjectURL(a),i=document.createElement("a");i.href=r,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(r),1e3)}var _s="judgment.theme",Vt="nvidia",ks=[{id:"vercel",name:"Vercel",description:"\u9ED1\u767D\u7CBE\u6E96 \xB7 Geist \xB7 \u5E7E\u4F55\u7559\u767D",swatches:["#171717","#0070f3","#fafafa"],metaColor:"#ffffff"},{id:"apple",name:"Apple",description:"SF Pro \xB7 \u5927\u5713\u89D2 \xB7 \u6C89\u6D78\u7559\u767D",swatches:["#1d1d1f","#0071e3","#f5f5f7"],metaColor:"#fbfbfd"},{id:"meta",name:"Meta",description:"Optimistic \xB7 \u660E\u4EAE\u85CD \xB7 \u81A0\u56CA\u5143\u4EF6",swatches:["#0064e0","#0091ff","#f1f4f7"],metaColor:"#ffffff"},{id:"nvidia",name:"NVIDIA",description:"GPU \u7DA0 \xB7 \u9ED1\u5E95 \xB7 \u92B3\u5229\u76F4\u89D2",swatches:["#76b900","#000000","#f7f7f7"],metaColor:"#000000"},{id:"ibm",name:"IBM",description:"Carbon \xB7 Plex Sans \xB7 \u4F01\u696D\u85CD",swatches:["#0f62fe","#161616","#f4f4f4"],metaColor:"#161616"},{id:"stripe",name:"Stripe",description:"\u7D2B\u975B\u6F38\u5C64 \xB7 \u7CBE\u5BC6\u91D1\u878D\u611F",swatches:["#635bff","#ea2261","#f6f9fc"],metaColor:"#ffffff"},{id:"linear",name:"Linear",description:"\u6DF1\u7A7A\u9ED1 \xB7 \u975B\u7D2B \xB7 \u6975\u7C21\u7DDA\u689D",swatches:["#5e6ad2","#010102","#e8e8ec"],metaColor:"#010102"},{id:"figma",name:"Figma",description:"\u591A\u5F69\u8272\u584A \xB7 \u5354\u4F5C\u611F \xB7 \u85CD\u8272\u7126\u9EDE",swatches:["#f24e1e","#a259ff","#0acf83"],metaColor:"#ffffff"},{id:"notion",name:"Notion",description:"\u6696\u767D\u7D19\u5F35 \xB7 \u896F\u7DDA\u6A19\u984C \xB7 \u77E5\u8B58\u5EAB",swatches:["#191918","#0075de","#f7f6f3"],metaColor:"#ffffff"},{id:"openai",name:"OpenAI",description:"\u6696\u7070\u756B\u5E03 \xB7 \u9ED1\u8272\u884C\u52D5 \xB7 \u7DA0\u8272\u8A0A\u865F",swatches:["#10a37f","#0d0d0d","#f9f9f7"],metaColor:"#f9f9f7"}],Wt=new Map(ks.map(e=>[e.id,e]));function Ma(e){return Wt.has(e)}function Ta(e){return Wt.get(e)||Wt.get(Vt)}function qa(){try{let e=window.localStorage.getItem(_s);return Ma(e)?e:Vt}catch{return Vt}}function ws(e,{persist:t=!0}={}){let s=Ta(e);document.documentElement.dataset.theme=s.id;let a=document.getElementById("theme-color-meta");a&&a.setAttribute("content",s.metaColor);let r=document.getElementById("theme-label");r&&(r.textContent=s.name);let i=document.getElementById("theme-swatches");if(i&&(i.innerHTML=s.swatches.map(o=>`<i class="style-swatch" style="--swatch:${n(o)}"></i>`).join("")),document.querySelectorAll(".theme-option").forEach(o=>{let l=o.dataset.themeId===s.id;o.classList.toggle("is-active",l),o.setAttribute("aria-checked",l?"true":"false")}),t)try{window.localStorage.setItem(_s,s.id)}catch{}return window.dispatchEvent(new CustomEvent("judgment:theme",{detail:{theme:s.id}})),s}function ja(e){let t=ks.map((s,a)=>{let r=s.swatches.map(i=>`<i style="--swatch:${n(i)}"></i>`).join("");return`<button class="theme-option" type="button" role="menuitemradio"
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
    </div>${t}`}function xs(){let e=document.getElementById("style-picker"),t=document.getElementById("style-trigger"),s=document.getElementById("style-menu");if(!e||!t||!s)return;ja(s),ws(qa(),{persist:!1});let a=()=>Array.from(s.querySelectorAll(".theme-option")),r=()=>{s.hidden=!1,t.setAttribute("aria-expanded","true");let o=s.querySelector(".theme-option.is-active")||a()[0];o&&o.focus()},i=({restoreFocus:o=!1}={})=>{s.hidden||(s.hidden=!0,t.setAttribute("aria-expanded","false"),o&&t.focus())};t.addEventListener("click",()=>{s.hidden?r():i({restoreFocus:!0})}),t.addEventListener("keydown",o=>{(o.key==="ArrowDown"||o.key==="ArrowUp")&&(o.preventDefault(),r())}),s.addEventListener("click",o=>{let l=o.target.closest(".theme-option");l&&(ws(l.dataset.themeId),i({restoreFocus:!0}))}),s.addEventListener("keydown",o=>{let l=a(),m=l.indexOf(document.activeElement);if(o.key==="Escape"){o.preventDefault(),i({restoreFocus:!0});return}if(o.key==="ArrowDown"||o.key==="ArrowUp"){o.preventDefault();let b=o.key==="ArrowDown"?1:-1,w=l[(m+b+l.length)%l.length];w&&w.focus();return}if(o.key==="Home"||o.key==="End"){o.preventDefault();let b=o.key==="Home"?l[0]:l[l.length-1];b&&b.focus()}}),document.addEventListener("pointerdown",o=>{e.contains(o.target)||i()}),document.addEventListener("keydown",o=>{o.key==="Escape"&&i()})}var ls={};Qe(ls,{render:()=>er});var Ea="judgment-console";var Ce="query_history",ze="settings";var Re={history:[],settings:new Map,nextId:1},$t=null,we=!("indexedDB"in window);function ot(e){return new Promise((t,s)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>s(e.error)})}function Ve(e){return new Promise((t,s)=>{e.oncomplete=()=>t(),e.onerror=()=>s(e.error),e.onabort=()=>s(e.error||new Error("transaction aborted"))})}function We(){return $t||($t=new Promise((e,t)=>{if(!("indexedDB"in window)){we=!0,t(new Error("IndexedDB is unavailable"));return}let s;try{s=window.indexedDB.open(Ea,1)}catch(a){we=!0,t(a);return}s.onupgradeneeded=()=>{let a=s.result;if(!a.objectStoreNames.contains(Ce)){let r=a.createObjectStore(Ce,{keyPath:"id",autoIncrement:!0});r.createIndex("created_at","created_at"),r.createIndex("kind","kind")}a.objectStoreNames.contains(ze)||a.createObjectStore(ze,{keyPath:"key"})},s.onsuccess=()=>{let a=s.result;a.onversionchange=()=>a.close(),e(a)},s.onerror=()=>{we=!0,t(s.error||new Error("Unable to open IndexedDB"))},s.onblocked=()=>{we=!0,t(new Error("IndexedDB upgrade blocked by another tab"))}}),$t)}function Ss(){return"indexedDB"in window}function As(){return we}function yt(){return we?"memory":"indexeddb"}function Pa(e){let t=e.created_at||new Date().toISOString();return{kind:e.kind||"query",title:String(e.title||""),detail:String(e.detail||""),payload:e.payload||{},created_at:t}}async function Na(){try{let t=(await We()).transaction(Ce,"readwrite"),s=t.objectStore(Ce),a=await ot(s.count());if(a>120){let r=a-120,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let m=i.result;if(!m||r<=0){o();return}m.delete(),r-=1,m.continue()},i.onerror=()=>l(i.error)})}await Ve(t)}catch{we=!0}}async function wt(e){let t=Pa(e);try{let a=(await We()).transaction(Ce,"readwrite"),r=a.objectStore(Ce),i=await ot(r.add(t));return await Ve(a),await Na(),i}catch{we=!0;let a=Re.nextId++;return Re.history.push({id:a,...t}),Re.history.length>120&&Re.history.shift(),a}}async function _t({keyword:e="",limit:t=50}={}){let s=e.trim().toLowerCase();try{let r=(await We()).transaction(Ce,"readonly"),i=r.objectStore(Ce),o=await ot(i.getAll());return await Ve(r),o.filter(l=>s?`${l.kind} ${l.title} ${l.detail}`.toLowerCase().includes(s):!0).sort((l,m)=>String(m.created_at).localeCompare(String(l.created_at))).slice(0,t)}catch{return we=!0,Re.history.filter(r=>s?`${r.kind} ${r.title} ${r.detail}`.toLowerCase().includes(s):!0).slice().sort((r,i)=>String(i.created_at).localeCompare(String(r.created_at))).slice(0,t)}}async function Ls(){try{let t=(await We()).transaction(Ce,"readwrite");t.objectStore(Ce).clear(),await Ve(t)}catch{we=!0}Re.history=[]}async function Ms(e,t){let s={key:String(e),value:t,updated_at:new Date().toISOString()};try{let r=(await We()).transaction(ze,"readwrite");return r.objectStore(ze).put(s),await Ve(r),s}catch{return we=!0,Re.settings.set(s.key,s),s}}async function lt(e,t=null){try{let a=(await We()).transaction(ze,"readonly"),r=a.objectStore(ze),i=await ot(r.get(String(e)));return await Ve(a),i?i.value:t}catch{we=!0;let a=Re.settings.get(String(e));return a?a.value:t}}async function Ts({keyword:e=""}={}){let t=e.trim().toLowerCase();try{let a=(await We()).transaction(ze,"readonly"),r=a.objectStore(ze),i=await ot(r.getAll());return await Ve(a),i.filter(o=>t?`${o.key} ${JSON.stringify(o.value)}`.toLowerCase().includes(t):!0).sort((o,l)=>String(o.key).localeCompare(String(l.key)))}catch{return we=!0,Array.from(Re.settings.values()).filter(a=>t?`${a.key} ${JSON.stringify(a.value)}`.toLowerCase().includes(t):!0)}}function qs(e){if(typeof e=="string")return e;try{return JSON.stringify(e)}catch{return String(e)}}var is={};Qe(is,{render:()=>In,renderTestFlowPanel:()=>at});var ns={};Qe(ns,{exportCsv:()=>Mt,exportableResult:()=>Tt,render:()=>fn,renderReport:()=>St,reportError:()=>Lt,reportLoading:()=>ct});var Ds=[10,25,50,100],Ca=500,Ra=["law_name","law_level","law_category","law_modified_date","article_count"],Ia=["jid","court_normalized","title","jdate","matched_laws","citation_count"],Da={A:"\u689D\u6587",C:"\u7AE0\u7BC0"};function At(e){return e?.label||e?.id||"\u8CC7\u6599\u5EAB"}function kt(e,t){let s={};for(let a of e.fields||[]){let r=a.type==="checkbox"?!1:a.type==="multiselect"?[]:"",i=a.default===void 0?r:a.default;s[a.key]=Array.isArray(i)?[...i]:i}return{values:s,page:1,pageSize:t,result:null,sort:null,columnFilters:{}}}function Ba(e,t){let s=e.visibleWhen;if(!s)return!0;for(let[a,r]of Object.entries(s))if(Array.isArray(r)&&!r.map(String).includes(String(t[a]??"")))return!1;return!0}function as(e,t){return(e.fields||[]).filter(s=>Ba(s,t))}function Oa(e,t){return`filter-${e.id}-${t}`}function Ke(e){return e==null?"":n(String(e))}function Kt(e,t,s){let a=s[t.key],r=Oa(e,t.key),i=t.help?`<span class="field-help">${n(t.help)}</span>`:"";if(t.type==="checkbox")return`<div class="field">
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
    </label>`;if(t.type==="select"){let l=(t.options||[]).map(m=>`<option value="${Ke(m.value)}" ${String(m.value)===String(a??"")?"selected":""}>${n(m.label??m.value)}</option>`).join("");return`<div class="field">${o}
      <select class="select" id="${r}" name="${n(t.key)}">${l}</select>
      ${i}
    </div>`}if(t.type==="multiselect"){let l=new Set((Array.isArray(a)?a:[]).map(String)),m=(t.options||[]).map(b=>`<label class="multi-option">
          <input type="checkbox" name="${n(t.key)}" value="${Ke(b.value)}" ${l.has(String(b.value))?"checked":""} />
          <span>${n(b.label??b.value)}</span>
        </label>`).join("");return`<div class="field">${o}
      <div class="multi-select">${m}</div>
      ${i}
    </div>`}return t.type==="number"?`<div class="field">${o}
      <input class="input" type="number" id="${r}" name="${n(t.key)}"
        value="${Ke(a)}"
        ${t.min!==void 0?`min="${t.min}"`:""}
        ${t.max!==void 0?`max="${t.max}"`:""}
        step="${t.step??1}"
        placeholder="${Ke(t.placeholder||"")}" />
      ${i}
    </div>`:t.type==="date"?`<div class="field">${o}
      <input class="input" type="date" id="${r}" name="${n(t.key)}"
        value="${Ke(a)}" />
      ${i}
    </div>`:`<div class="field">${o}
    <input class="input" type="text" id="${r}" name="${n(t.key)}"
      value="${Ke(a)}"
      placeholder="${Ke(t.placeholder||"")}" />
    ${i}
  </div>`}function Yt(e,t,{focusTable:s=!1}={}){let a=as(e,t.values),r=[];for(let i=0;i<a.length;i+=1){let o=a[i],l=a[i+1];o.type==="date"&&l&&l.type==="date"?(r.push(`<div class="field-row">${Kt(e,o,t.values)}${Kt(e,l,t.values)}</div>`),i+=1):r.push(Kt(e,o,t.values))}return`<form id="data-filter-form" autocomplete="off">
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
  </form>`}function xt(e,t,s){let a={...s.values};for(let r of as(t,a))if(r.type==="checkbox"){let i=e.querySelector(`[name="${r.key}"]`);a[r.key]=!!i?.checked}else if(r.type==="multiselect")a[r.key]=Array.from(e.querySelectorAll(`[name="${r.key}"]:checked`)).map(i=>i.value);else{let i=e.querySelector(`[name="${r.key}"]`);a[r.key]=i?i.value:""}return a}function Bs(e,t){let s={};for(let a of as(e,t.values)){let r=t.values[a.key];a.type==="checkbox"?s[a.key]=!!r:a.type==="multiselect"?s[a.key]=Array.isArray(r)?r:[]:a.type==="number"?s[a.key]=r===""||r===null?"":Number(r):s[a.key]=r??""}return s}function Xt(e,t){let s=Bs(e,t);return(e.id==="postgres"||e.id==="parquet")&&t.sort?.key&&(s.sort=`${t.sort.key}:${t.sort.direction}`,s.schema_preview=!0),t.columnFilters&&Object.keys(t.columnFilters).length>0&&(s.column_filters=t.columnFilters),s}function js(e){if(e.status==="operational")return"";let t=e.status==="unavailable"?"danger":e.status==="degraded"?"warn":"info";return`<div class="sidebar-notice">${Y({tone:t,title:`${At(e)} ${Ne(e.status).label}`,text:n(e.detail||"\u76EE\u524D\u7121\u6CD5\u4F7F\u7528\u9019\u500B\u8CC7\u6599\u4F86\u6E90\u3002")})}</div>`}function Fa(e,t){return`<div class="db-options" role="radiogroup" aria-label="\u9078\u64C7\u8CC7\u6599\u5EAB">
    ${e.map(s=>{let a=Ne(s.status);return`<label class="db-option">
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
  </div>`}function Ha(e){return`<div class="sidebar-view-switch" role="tablist" aria-label="\u67E5\u8A62\u6216 schema">
    <button class="sidebar-view-button ${e==="query"?"is-active":""}"
      type="button" role="tab" aria-selected="${e==="query"}"
      data-action="sidebar-view" data-view="query">${$("search",13)}<span>\u67E5\u8A62</span></button>
    <button class="sidebar-view-button ${e==="schema"?"is-active":""}"
      type="button" role="tab" aria-selected="${e==="schema"}"
      data-action="sidebar-view" data-view="schema">${$("table",13)}<span>Schema</span></button>
  </div>`}function Zt(e,t,s=""){let a=Array.isArray(e.tables)?e.tables:[],r=a.length?a.map(i=>`<button class="schema-item ${String(i.id)===String(s||"")?"is-selected":""}" type="button"
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
  </div>`}function Es(e,t){return`<div class="category-options" role="radiogroup" aria-label="\u8CC7\u6599\u985E\u578B">
    ${e.map(s=>{let a=s.id===t,r=s.id==="judgment"&&s.count!==void 0?`${c(s.count)} \u7B46\u5DF2\u7BE9\u9078\u5224\u6C7A`:s.description||"";return`<label class="category-option${a?" is-selected":""}">
          <input type="radio" name="category" value="${n(s.id)}" ${a?"checked":""} />
          <span class="category-option-body">
            <span class="category-option-label">${n(s.label)}</span>
            <span class="category-option-desc">${n(r)}</span>
          </span>
        </label>`}).join("")}
  </div>`}function Ps(e){return{postgres:"PostgreSQL \u67E5\u8A62\u4F7F\u7528\u53C3\u6578\u5316\u689D\u4EF6\u8207\u5206\u9801\uFF0C\u50C5\u8B80\u53D6\u8CC7\u6599\u3002",parquet:"Parquet \u67E5\u8A62\u76F4\u63A5\u6383\u63CF\u76EE\u524D\u6700\u65B0\u7684\u5FEB\u7167\uFF1B\u52FE\u9078\u539F\u59CB JSON \u6703\u589E\u52A0\u56DE\u50B3\u91CF\u8207\u6E32\u67D3\u6642\u9593\u3002",qdrant:"Qdrant \u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\uFF1B\u9700\u8981\u5148\u5B8C\u6210\u5411\u91CF\u7D22\u5F15\u3002\u6AA2\u7D22\u7D50\u679C\u53EA\u5305\u542B\u7D22\u5F15\u4E2D\u5BE6\u969B\u5B58\u5728\u7684\u5224\u6C7A\uFF0C\u4E0D\u6703\u7522\u751F\u865B\u69CB\u8CC7\u6599\u3002",indexeddb:"IndexedDB \u53EA\u5728\u9019\u500B\u700F\u89BD\u5668\u5167\u67E5\u8A62\uFF0C\u4E0D\u6703\u7D93\u904E\u4F3A\u670D\u5668\uFF1B\u6E05\u9664\u7DB2\u7AD9\u8CC7\u6599\u5F8C\u7D00\u9304\u6703\u6D88\u5931\u3002"}[e.id]||n(e.detail||"")}function Ua(e){return`<div class="report-empty">
    ${ye({iconName:"table",title:"\u67E5\u8A62\u5831\u8868\u6703\u986F\u793A\u5728\u9019\u88E1",text:n({postgres:"\u9078\u64C7\u8CC7\u6599\u8868\u8207 metadata \u689D\u4EF6\uFF0C\u57F7\u884C\u5F8C\u6703\u7522\u751F SQL\u3001\u6458\u8981\u3001\u5206\u5E03\u8207\u8CC7\u6599\u5217\u3002",parquet:"\u9078\u64C7\u8CC7\u6599\u96C6\u8207\u56DE\u50B3\u6B04\u4F4D\uFF0C\u76F4\u63A5\u6383\u63CF\u539F\u59CB Parquet\u3002",qdrant:"\u8F38\u5165\u8A9E\u610F\u67E5\u8A62\u5F8C\uFF0C\u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5DF2\u5EFA\u7ACB\u5411\u91CF\u7D22\u5F15\u7684\u5224\u6C7A\uFF1B\u672A\u7D22\u5F15\u6642\u6703\u660E\u78BA\u986F\u793A\u72C0\u614B\u3002",indexeddb:"\u67E5\u8A62\u5B58\u5728\u9019\u500B\u700F\u89BD\u5668\u7684\u63D0\u554F\u7D00\u9304\u8207\u8A2D\u5B9A\uFF0C\u4E0D\u9700\u8981\u4F3A\u670D\u5668\u3002"}[e.id]||"\u8A2D\u5B9A\u689D\u4EF6\u5F8C\u57F7\u884C\u67E5\u8A62\u3002")})}
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
      ${Y({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u67E5\u8A62\u7D50\u679C",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="retry">
          ${$("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function za(e){if(!e.length)return'<div class="report-empty-inline">\u9019\u6B21\u67E5\u8A62\u6C92\u6709\u53EF\u5448\u73FE\u7684\u5206\u5E03\u8CC7\u6599\u3002</div>';let t=Math.max(...e.map(s=>Number(s.value)||0),1);return`<div class="distribution">
    ${e.map(s=>{let a=Number(s.value)||0,r=Math.max(1.5,a/t*100);return`<div class="dist-row">
          <span class="dist-label" title="${n(s.label||"\u672A\u5206\u985E")}">${n(s.label||"\u672A\u5206\u985E")}</span>
          <span class="dist-track"><span class="dist-bar" style="width:${r.toFixed(1)}%"></span></span>
          <span class="dist-value">${c(a)}</span>
        </div>`}).join("")}
  </div>`}function Os(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="law_documents"}function Ga(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="judgment_documents"}function Qa(e){return e&&e.database==="qdrant"&&String(e.table||"").startsWith("judgment")}function Ja(e){let t=e._jid||e.jid;return t?`<button class="law-link judgment-link" type="button" data-action="open-judgment"
    data-jid="${n(String(t))}"
    title="\u6AA2\u8996\u300C${n(String(t))}\u300D\u7684\u5224\u6C7A\u539F\u6587">${n(String(t))}${$("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}var Va={jid:"jid",court:"court",court_normalized:"court",title:"title",jdate:"jdate",matched_laws:"matched_laws",citation_count:"citation_count",full_text_length:"full_text_length"};function Wa(e,t,s,a=!1,r=!0,i=!1){let o=a?e.key:e.label||e.key,l=r?t?Va[e.key]||e.key:i?e.key:null:null;if(!l)return`<th scope="col">${n(o)}</th>`;let m=s?.key===l,b=m?s.direction:null,w=b==="asc"?"ascending":b==="desc"?"descending":"none",f=b==="asc"?"\u2191":b==="desc"?"\u2193":"\u2195";return`<th scope="col" aria-sort="${w}">
    <button class="table-sort${m?" is-active":""}" type="button"
      data-action="sort-column" data-sort-key="${n(l)}"
      title="\u4F9D${n(o)}\u6392\u5E8F">
      <span>${n(o)}</span>
      <span class="table-sort-icon" aria-hidden="true">${f}</span>
    </button>
  </th>`}function Ka(e,t){if(!Os(e)||!t)return null;let s=t._law_key||t.law_name;if(!s)return null;let a=e.meta?.dataset,r=t._law_source_type||(a&&a!=="all"?a:"");return{lawKey:String(s),sourceType:String(r||""),lawName:String(t.law_name||"")}}function Ya(e,t,s){let a=e[t.key];return a==null||a===""?"\u2014":`<button class="law-link" type="button" data-action="open-law"
    data-law-key="${n(s.lawKey)}"
    data-law-source="${n(s.sourceType)}"
    data-law-name="${n(s.lawName)}"
    title="\u6AA2\u8996\u300C${n(String(a))}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${n(String(a))}${$("chevronRight",12,"law-link-icon")}</button>`}function Fs(e,{useColumnKeys:t=!1,sortable:s=!0,sortableAll:a=!1,searchValues:r=null,compact:i=!1}={}){let o=Array.isArray(e.columns)?e.columns:[],l=Array.isArray(e.rows)?e.rows:[],m=(e.page-1)*e.page_size,b=Os(e),w=Ga(e),f=Qa(e),v=e.meta?.sort||null,x=r?`<tr class="schema-search-row">
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
      <span class="muted" style="font-size:10px">${c(l.length)} rows \xB7 \u7B2C ${e.page} \u9801${b?" \xB7 \u9EDE\u9078\u6CD5\u898F\u540D\u7A31\u53EF\u6AA2\u8996\u5B8C\u6574\u689D\u6587":w?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u6B04\u4F4D\u6A19\u984C\u53EF\u6392\u5E8F":f?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u4F9D\u76F8\u4F3C\u5EA6\u6392\u5E8F":""}</span>
    </div>
    <div class="table-wrap">
      <table class="data-table${i?" is-compact":""}">
        <thead>${x}<tr>
          <th scope="col" class="cell-index-head">#</th>
          ${o.map(h=>Wa(h,w,v,t,s,a)).join("")}
        </tr></thead>
        <tbody>
          ${l.map((h,y)=>`<tr>
                <td class="cell-mono cell-empty cell-index">${m+y+1}</td>
                ${o.map(N=>{if((w||f)&&N.key==="jid")return`<td class="cell-jid">${Ja(h)}</td>`;let M=b&&N.key==="law_name"?Ka(e,h):null;if(M)return`<td>${Ya(h,N,M)}</td>`;let E={date:"cell-date",datetime:"cell-datetime",duration:"cell-duration",number:"cell-number"}[N.type];return`<td${E?` class="${E}"`:""}>${ht(h[N.key],N.type||"text")}</td>`}).join("")}
              </tr>`).join("")}
        </tbody>
      </table>
    </div>`:`<div class="report-table-head">
        <span class="report-section-title">\u8CC7\u6599\u5217</span>
        <span class="muted" style="font-size:10px">0 rows</span>
      </div>
      ${ye({iconName:"filter",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u8CC7\u6599",text:"\u653E\u5BEC\u65E5\u671F\u5340\u9593\u3001\u964D\u4F4E\u689D\u6587\u6578\u4E0B\u9650\uFF0C\u6216\u6E05\u9664\u95DC\u9375\u5B57\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}`:`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">\u6B64\u8CC7\u6599\u4F86\u6E90\u6C92\u6709\u8868\u683C\u6B04\u4F4D</span>
    </div>`}function Xa(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,r=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${r} \u9801 \xB7
      \u986F\u793A ${c(i)}\u2013${c(o)} / ${c(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Ds.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${$("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=r?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${$("chevronRight",13)}</button>
    </div>
  </div>`}function Hs(e){return!Array.isArray(e)||!e.length?"":`<div class="warnings">${e.map(t=>`<div class="warning-line">${n(t)}</div>`).join("")}</div>`}function St(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.columns)?e.columns:[],a=Array.isArray(e.summary)?e.summary:[],r=Array.isArray(e.distribution)?e.distribution:[],i=Number(e.total)||0,o=e.query_text||"",l=e.database||"",m=e.status||"ok",b=e.meta?.table_label||e.table||e.label||"query result";return`<div class="report-card" data-database="${n(l)}">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT \xB7 ${n(String(l).toUpperCase())}</div>
        <div class="report-title">
          ${n(e.label||l)}
          ${K(m)}
          <span class="chip">${n(b)}</span>
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

    ${e.message?`<div class="report-alert">${Y({tone:m==="not_configured"?"info":m==="danger"?"danger":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n(e.message)})}</div>`:""}

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
        ${za(r)}
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
        ${Hs(e.warnings)}
      </div>
    </div>

    ${s.length||t.length?Fs(e,{compact:!0,sortableAll:!0,searchValues:e.meta?.searchable?e.meta.column_filters||{}:null}):""}
    ${i||s.length?Xa({...e,total:i,page:Number(e.page)||1,page_size:Number(e.page_size)||25}):""}
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
  </div>`}function es(e,t,{columnFilters:s={},searchEnabled:a=!1}={}){let r=Array.isArray(e.columns)?e.columns:[],i=Array.isArray(e.rows)?e.rows:[],o=e.message?`<div class="report-alert">${Y({tone:e.status==="ok"?"info":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n(e.message)})}</div>`:"";return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW \xB7 ${n(String(e.database||"").toUpperCase())}</div>
        <div class="report-title">
          ${n(t||e.table||"\u8CC7\u6599\u8868")}
          ${K(e.status||"ok")}
        </div>
        <div class="report-sub">
          ${n(String(e.database||""))} / ${n(String(e.table||"\u2014"))} \xB7 ${r.length} \u6B04\u4F4D \xB7 \u524D ${i.length} \u7B46
        </div>
      </div>
    </div>
    ${o}
    ${Fs({...e,page:1,page_size:10},{useColumnKeys:!0,sortable:!0,sortableAll:!0,searchValues:a?s:null})}
    ${Hs(e.warnings)}
    <div class="schema-preview-footer">
      <span>\u9810\u89BD\u524D ${c(i.length)} \u7B46</span>
      <strong>\u5171 ${c(e.total)} \u7B46</strong>
    </div>
  </div>`}function Cs(e,t){return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW</div>
        <div class="report-title">${n(t||"\u8CC7\u6599\u8868")}</div>
        <div class="report-sub">\u7121\u6CD5\u8B80\u53D6\u8CC7\u6599\u8868\u9810\u89BD\u3002</div>
      </div>
    </div>
    ${Y({tone:"danger",title:"\u8B80\u53D6\u5931\u6557",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
  </div>`}function Za(e){return`<div class="report-empty">
    ${ye({iconName:"table",title:"\u9078\u64C7\u8CC7\u6599\u8868\u9810\u89BD",text:`\u5F9E\u5DE6\u5074 ${At(e)} \u7684 Schema \u6E05\u55AE\u9EDE\u9078\u8CC7\u6599\u8868\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6B04\u4F4D\u540D\u7A31\u3001\u524D 10 \u7B46\u8CC7\u6599\u8207\u7E3D\u7B46\u6578\u3002`})}
  </div>`}function ts(e){return e.is_current===!0?K("ok","\u73FE\u884C"):e.law_abandon_note?K("empty","\u5DF2\u5EE2\u6B62"):e.is_current===!1?K("empty","\u6B77\u53F2\u7248\u672C"):K("not_configured","\u72C0\u614B\u672A\u63D0\u4F9B")}function ae(e,t){return`<div class="law-meta-item">
    <div class="law-meta-label">${n(e)}</div>
    <div class="law-meta-value">${t||"\u2014"}</div>
  </div>`}function Ye(e){return e?Pe(e):"\u2014"}function en(e){return e?.meta?.metadata_source==="postgresql"?"PostgreSQL metadata":e?.meta?.metadata_source==="parquet"?"Parquet snapshot":"\u2014"}function ss(e,t){return t?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">${n(e)}</span>
    </div>
    <div class="law-text-block">${n(String(t).trim())}</div>
  </div>`:""}function tn(e,t,{open:s=!1}={}){return t?`<details class="report-section law-disclosure" data-law-history ${s?"open":""}>
    <summary class="law-disclosure-summary">
      <span class="report-section-title">${n(e)}</span>
      <span class="law-disclosure-hint">\u9810\u8A2D\u6536\u5408 \xB7 \u9EDE\u64CA\u5C55\u958B</span>
      ${$("chevronDown",14,"law-disclosure-chevron")}
    </summary>
    <div class="law-text-block">${n(String(t).trim())}</div>
  </details>`:""}function sn(e){let t=Array.isArray(e)?e:[],s=t.map(a=>{let r=a?.name||a?.url||"";return r?a.url?`<a class="law-attachment" href="${n(a.url)}" target="_blank" rel="noopener noreferrer">
          ${$("file",12)}<span>${n(r)}</span>${$("external",11)}
        </a>`:`<span class="law-attachment">${$("file",12)}<span>${n(r)}</span></span>`:""}).filter(Boolean).join("");return s?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">\u9644\u4EF6</span>
      <span class="muted">${c(t.length)}</span>
    </div>
    <div class="law-attachment-list">${s}</div>
  </div>`:""}function Us(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function an(e){let t=Array.isArray(e.articles)?e.articles:[],s=t.filter(o=>o.article_type==="C").length,a=t.length-s,r=s?`${c(a)} \u689D \xB7 ${c(s)} \u7AE0\u7BC0`:`${c(a)} \u689D`,i=t.map(o=>{let l=String(o.article_content||"").trim();if(!l)return"";if(o.article_type==="C")return`<div class="law-chapter">${n(l)}</div>`;let m=Da[o.article_type]||o.article_type;return`<article class="law-article"
        data-article-no="${n(Us(o.article_no))}">
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
  </div>`}function nn(){return`<div class="law-jump-float">
    <input class="input law-article-jump-input law-jump-input"
      id="law-article-jump-float" type="text" inputmode="numeric"
      autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
    <button class="btn btn-secondary btn-sm" type="button"
      data-action="jump-article" data-jump-input="law-article-jump-float">\u8DF3\u81F3</button>
  </div>`}function st(){return`<button class="btn btn-secondary btn-sm" type="button" data-action="back-to-results">
    ${$("chevronLeft",14)}<span>\u8FD4\u56DE\u67E5\u8A62\u7D50\u679C</span>
  </button>`}function rn(e){return`<div class="law-report">
    <div class="law-report-topbar">
      ${st()}
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
  </div>`}function on(e,t){return`<div class="law-report">
    <div class="law-report-topbar">
      ${st()}
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
        ${Y({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function ln(e){let t=Array.isArray(e.versions)?e.versions:[];if(t.length<1)return"";let s=e.selected_version_id??"";return`<label class="law-version-select">
    <span>\u689D\u6587\u7248\u672C</span>
    <select class="select" data-action="select-law-version" aria-label="\u9078\u64C7\u6CD5\u898F\u689D\u6587\u7248\u672C">
      ${t.map(a=>{let r=String(a.update_date||"").match(/\d{4}\/\d{1,2}\/\d{1,2}/)?.[0]||"",i=[`#${a.version_id}`,a.is_current?"\u76EE\u524D":"\u6B77\u53F2",r,a.article_count_for_law?`${c(a.article_count_for_law)} \u7B46`:"\u7121\u689D\u6587\u5FEB\u7167"].filter(Boolean).join(" \xB7 ");return`<option value="${n(a.version_id)}" ${String(a.version_id)===String(s)?"selected":""}>${n(i)}</option>`}).join("")}
    </select>
  </label>`}function cn(e){let t=e.change_summary||{},s=Object.values(t).reduce((o,l)=>o+(Number(l)||0),0),a=Array.isArray(e.changes)?e.changes:[];if(!e.changes_available&&!s)return"";let r={added:"\u65B0\u589E",modified:"\u4FEE\u6539",removed:"\u79FB\u9664"},i=["added","modified","removed"].map(o=>`${r[o]} ${c(t[o]||0)}`).join(" \xB7 ");return`<details class="report-section law-version-changes">
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
  </details>`}function dn(e,{database:t="",lawPage:s=1,historyOpen:a=!1}={}){let r=Array.isArray(e.warnings)?e.warnings:[],i=e.law_name||e.law_key||"\u6CD5\u898F",o=(Array.isArray(e.articles)?e.articles:[]).filter(y=>y.article_type!=="C").length,l=en(e),m=e.meta?.articles_source==="postgresql"?"PostgreSQL \u689D\u6587\u7248\u672C":e.meta?.articles_source==="parquet"?"Parquet \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",b=e.meta?.snapshot||"",w=e.meta?.articles_source==="postgresql"&&e.selected_version_id!==null&&e.selected_version_id!==void 0?`\u689D\u6587\u7248\u672C #${e.selected_version_id}`:"",f=[l,m,w,b].filter(Boolean).join(" \xB7 "),v=e.source_type==="law"?"\u6CD5\u5F8B":e.source_type==="order"?"\u547D\u4EE4":e.source_type||"\u2014",x=e.version||{},h=[ae("\u6CD5\u898F\u4F4D\u968E",n(e.law_level||"\u2014")),ae("\u6CD5\u898F\u985E\u5225",n(e.law_category||"\u2014")),ae("\u7570\u52D5\u65E5\u671F",Ye(e.law_modified_date)),ae("\u751F\u6548\u65E5\u671F",Ye(e.law_effective_date)),ae("\u689D\u6587\u6578",c(e.article_count)),ae("\u8CC7\u6599\u72C0\u614B",ts(e)),ae("\u82F1\u8B6F\u540D\u7A31",n(e.eng_law_name||"\u2014")),ae("\u6CD5\u898F\u8B58\u5225",`<span class="mono">${n(e.law_key||"\u2014")}</span>`)];return x.first_seen_version_id!==null&&x.first_seen_version_id!==void 0&&h.push(ae("\u9996\u6B21\u6536\u9304\u7248\u672C",`#${n(x.first_seen_version_id)}`)),x.last_seen_version_id!==null&&x.last_seen_version_id!==void 0&&h.push(ae("\u6700\u5F8C\u6536\u9304\u7248\u672C",`#${n(x.last_seen_version_id)}`)),x.last_seen_at&&h.push(ae("\u6700\u5F8C\u6536\u9304\u6642\u9593",n(ee(x.last_seen_at)))),x.selected_version_id!==null&&x.selected_version_id!==void 0&&h.push(ae("\u689D\u6587\u7248\u672C",`#${n(x.selected_version_id)} \xB7 ${e.meta?.selected_version_is_current?"\u76EE\u524D":"\u6B77\u53F2"}`)),`<div class="law-report">
    <div class="law-report-topbar">
      ${st()}
      <span class="law-report-origin" title="${n(f)}">${n(f)}</span>
    </div>
    <div class="report-card law-report-card" data-database="${n(t)}">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT \xB7 ${n(String(t||l).toUpperCase())}</div>
          <div class="report-title">
            ${n(i)}
            ${ts(e)}
            <span class="chip">${n(v)}</span>
          </div>
          <div class="report-sub">
            ${n([e.law_level,e.law_category].filter(Boolean).join(" \xB7 ")||"\u2014")} \xB7 ${c(e.article_count)} \u689D \xB7 \u7570\u52D5 ${Ye(e.law_modified_date)}
          </div>
        </div>
        <div class="report-actions">
          ${ln(e)}
          ${e.law_url?`<a class="btn btn-secondary btn-sm" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">${$("external",14)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:""}
        </div>
      </div>

      ${r.length?`<div class="report-alert">${Y({tone:e.status==="degraded"?"warn":"info",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r.map(y=>n(y)).join("<br />")})}</div>`:""}

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u689D\u6587\u6578</div>
          <div class="summary-value">${c(e.article_count)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u7570\u52D5\u65E5\u671F</div>
          <div class="summary-value">${Ye(e.law_modified_date)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u6CD5\u898F\u4F4D\u968E</div>
          <div class="summary-value">${n(e.law_level||"\u2014")}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u76EE\u524D\u72C0\u614B</div>
          <div class="summary-value">${ts(e)}</div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u6CD5\u898F\u8CC7\u8A0A</span>
          <span class="muted" style="font-size:9.5px">${n(l)}</span>
        </div>
        <div class="law-meta-grid">${h.join("")}</div>
      </div>

      ${cn(e)}
      ${ss("\u6CD5\u898F\u524D\u8A00",e.law_foreword)}
      ${tn("\u6CD5\u898F\u6CBF\u9769",e.law_histories,{open:a})}
      ${ss("\u751F\u6548\u8AAA\u660E",e.law_effective_note)}
      ${ss("\u5EE2\u6B62\u8AAA\u660E",e.law_abandon_note)}
      ${sn(e.attachments)}
      ${an(e)}
    </div>
    ${o>100?nn():""}
  </div>`}function un(e){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${st()}
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
  </div>`}function pn(e,t){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${st()}
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
        ${Y({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function mn(e){let t=new Map;for(let s of Array.isArray(e.citations)?e.citations:[]){let a=String(s.law_name||"").trim();if(!a)continue;t.has(a)||t.set(a,new Set);let r=String(s.article_no||"").trim();r&&t.get(a).add(r)}return t.size?`<div class="judgment-citation-groups">
    ${[...t.entries()].map(([s,a])=>`<div class="judgment-citation-group">
          <span class="judgment-citation-law">${n(s)}</span>
          <span class="judgment-citation-articles">${[...a].map(r=>n(r)).join("\u3001")||"\u2014"}</span>
        </div>`).join("")}
  </div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5F15\u7528\u660E\u7D30\u3002</div>'}function vn(e,{database:t="postgres"}={}){let s=Array.isArray(e.matched_laws)?e.matched_laws:[],a=e.title||e.jid||"\u5224\u6C7A",r=String(e.full_text||""),i=Number(e.full_text_length)||r.length||0,o=["PostgreSQL \u5224\u6C7A\u6587\u4EF6",e.source_archive].filter(Boolean).join(" \xB7 "),l=[ae("\u6848\u865F",n(e.jid||"\u2014")),ae("\u5E74\u5EA6",n(e.jyear||"\u2014")),ae("\u5B57\u5225",n(e.jcase||"\u2014")),ae("\u865F\u78BC",n(e.jno||"\u2014")),ae("\u6CD5\u9662",n(e.court||"\u2014")),ae("\u6848\u7531",n(e.title||"\u2014")),ae("\u88C1\u5224\u65E5\u671F",Ye(e.jdate)),ae("\u4F86\u6E90\u58D3\u7E2E\u6A94",n(e.source_archive||"\u2014")),ae("\u5168\u6587\u9577\u5EA6",`${c(i)} \u5B57`),ae("\u5F15\u7528\u6578",c(e.citation_count))];return e.import_run_id!==null&&e.import_run_id!==void 0&&l.push(ae("\u532F\u5165 Run",`#${n(e.import_run_id)}`)),`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${st()}
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
            ${n(e.court||"\u2014")} \xB7 ${Ye(e.jdate)} \xB7
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
          <div class="summary-value">${Ye(e.jdate)}</div>
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
        ${mn(e)}
      </div>

      <div class="report-section judgment-text-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5224\u6C7A\u539F\u6587</span>
          <span class="muted">${c(i)} \u5B57</span>
        </div>
        ${r?`<div class="judgment-fulltext">${n(r)}</div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5168\u6587\u3002</div>'}
      </div>
    </div>
  </div>`}function Rs(e){return`"${(e==null?"":typeof e=="object"?JSON.stringify(e):String(e)).replace(/"/g,'""')}"`}function Mt(e){let t=e.columns||[],s=e.rows||[],a=[["#",...t.map(i=>i.label||i.key)].map(Rs).join(",")],r=((Number(e.page)||1)-1)*(Number(e.page_size)||25);return s.forEach((i,o)=>{a.push([r+o+1,...t.map(l=>i[l.key])].map(Rs).join(","))}),`\uFEFF${a.join(`\r
`)}`}function Tt(e){return{...e,rows:(e.rows||[]).map(t=>{let s={};for(let[a,r]of Object.entries(t))a.startsWith("_")||(s[a]=r);return s})}}function gn(e){return e==="rag"?"RAG \u63D0\u554F":e==="data"?"\u8CC7\u6599\u67E5\u8A62":e||"\u5176\u4ED6"}async function Is(e,t){let s=performance.now(),a=Bs(e,t),r=String(a.store||"query_history"),i=String(a.keyword||""),o=t.page,l=t.pageSize,m=[],b=[],w=[],f=[];if(r==="settings"){b=(await Ts({keyword:i})).map(E=>({key:E.key,value:qs(E.value),updated_at:E.updated_at})),w=[{key:"key",label:"\u8A2D\u5B9A\u9375",type:"mono"},{key:"value",label:"\u503C",type:"longtext"},{key:"updated_at",label:"\u66F4\u65B0\u6642\u9593",type:"datetime"}];let _=new Map;b.forEach(E=>{let z=String(E.key||"").split(".")[0]||"\u5176\u4ED6";_.set(z,(_.get(z)||0)+1)}),f=Array.from(_.entries()).map(([E,z])=>({label:E,value:z})).sort((E,z)=>z.value-E.value)}else{b=(await _t({keyword:i,limit:Ca})).map(E=>({kind:gn(E.kind),title:E.title,detail:E.detail,created_at:E.created_at})),w=[{key:"kind",label:"\u985E\u578B",type:"text"},{key:"title",label:"\u67E5\u8A62\u5167\u5BB9",type:"longtext"},{key:"detail",label:"\u6458\u8981",type:"longtext"},{key:"created_at",label:"\u6642\u9593",type:"datetime"}];let _=new Map;b.forEach(E=>_.set(E.kind,(_.get(E.kind)||0)+1)),f=Array.from(_.entries()).map(([E,z])=>({label:E,value:z})).sort((E,z)=>z.value-E.value)}let v=b.length,x=(o-1)*l,h=b.slice(x,x+l),y=Math.round(performance.now()-s),N=As();return N&&m.push("IndexedDB \u7121\u6CD5\u4F7F\u7528\uFF0C\u8CC7\u6599\u66AB\u5B58\u5728\u8A18\u61B6\u9AD4\uFF0C\u91CD\u65B0\u6574\u7406\u5F8C\u6703\u6D88\u5931\u3002"),{database:"indexeddb",label:"IndexedDB",status:N?"degraded":"ok",message:N?"\u700F\u89BD\u5668\u4E0D\u5141\u8A31\u4F7F\u7528 IndexedDB\uFF0C\u672C\u9801\u6539\u7528\u8A18\u61B6\u9AD4\u66AB\u5B58\u3002":null,table:r,columns:w,rows:h,total:v,page:o,page_size:l,duration_ms:y,summary:[{label:"\u7B26\u5408\u7B46\u6578",value:String(v)},{label:"\u76EE\u524D\u9801\u9762",value:`${h.length} \u7B46`},{label:"\u5132\u5B58\u6A21\u5F0F",value:yt()==="indexeddb"?"IndexedDB":"\u8A18\u61B6\u9AD4"},{label:"\u67E5\u8A62\u8017\u6642",value:`${y} ms`}],distribution:f,query_text:`INDEXEDDB OPEN 'judgment-console'
OBJECT STORE '${r}'
FILTER ${i?`keyword \u2248 '${i}'`:"1 = 1"}
ORDER BY created_at DESC
LIMIT ${l} OFFSET ${x}`,warnings:m,meta:{store:r,filters:a,client_side:!0}}}async function fn(e,t){let s=!1,a=null,r=[],i="law",o=null,l={},m=0,b=25,w="query",f=null,v=null,x=0,h=[],y=null,N=-1,M=0,_=null,E=null;e.innerHTML=`<section class="page data-page">
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
  </section>`;let z=e.querySelector("#query-sidebar"),G=e.querySelector("#category-switch"),X=e.querySelector("#db-options-wrap"),se=e.querySelector("#sidebar-view-switch"),R=e.querySelector("#filter-area"),P=e.querySelector("#schema-area"),k=e.querySelector("#query-main"),q=e.querySelector("#schema-suggest-popover"),B=e.querySelector("#catalog-meta"),Q=e.querySelector("#refresh-catalog"),be=d=>r.find(p=>p.id===d),Te=()=>be(i)?.databases||[],le=d=>Te().find(p=>p.id===d),$e=(d,p)=>`${d}:${p}`,H=(d,p=i)=>l[$e(p,d.id)],de=(d,p)=>{Ms(d,p).catch(()=>{})},Ie=()=>{if(!a){B.textContent="CATALOG \xB7 \u96E2\u7DDA",B.className="badge badge-danger badge-mono";return}let d=Te(),p=d.filter(S=>S.available).length,g=be(i);B.textContent=`CATALOG \xB7 ${g?.label||i} \xB7 ${p}/${d.length} \u53EF\u7528`,B.className="badge badge-neutral badge-mono"},Se=d=>{k.innerHTML=Ua(d)},qe=()=>{let d=_?.returnScroll??E?.returnScroll;_=null,E=null;let p=le(o),g=p?H(p):null;w==="schema"&&v?.result?k.innerHTML=es(v.result,A(p,v.tableId),{columnFilters:v.columnFilters||{},searchEnabled:p.id==="postgres"||p.id==="parquet"}):g?.result?k.innerHTML=St(g.result):p&&Se(p),typeof d=="number"&&window.requestAnimationFrame(()=>window.scrollTo({top:d,behavior:"smooth"}))},Ae=(d="law-article-jump")=>{let p=k.querySelector(`#${d}`),g=Us(p?.value);if(!g){D("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),p?.focus();return}let T=[...k.querySelectorAll("[data-article-no]")].find(L=>L.dataset.articleNo===g);if(!T){D(`\u627E\u4E0D\u5230\u7B2C ${g} \u689D\u3002`,"warn");return}T.scrollIntoView({behavior:"instant",block:"center"}),T.classList.add("is-jump-target"),window.setTimeout(()=>T.classList.remove("is-jump-target"),2400)},De=async({lawKey:d,sourceType:p="",lawName:g="",versionId:S=""})=>{let T=le(o),L=T?H(T):null,j=w==="schema"?v?.result:null;if(!T||!L?.result&&!j||!d)return;let W=++m;_={seq:W,lawKey:d,sourceType:p,lawName:g,versionId:S?String(S):"",page:1,detail:null,database:T.id,returnScroll:window.scrollY},E=null,k.innerHTML=rn(g||d),k.scrollIntoView({behavior:"smooth",block:"start"});try{let ue=await U.lawDetail(d,p,_.versionId);if(s||!_||_.seq!==W)return;_.detail=ue,_.page=1,k.innerHTML=dn(ue,{database:_.database,lawPage:_.page})}catch(ue){if(s||!_||_.seq!==W)return;k.innerHTML=on(ue,g||d),D(ue.message||"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868\u3002","danger")}},C=async({jid:d})=>{let p=le(o),g=p?H(p):null,S=w==="schema"?v?.result:null;if(!p||!g?.result&&!S||!d)return;let T=++m;_=null;let L=p.id==="parquet"?"parquet":"postgres";E={seq:T,jid:d,detail:null,database:p.id,source:L,returnScroll:window.scrollY},k.innerHTML=un(d),k.scrollIntoView({behavior:"smooth",block:"start"});try{let j=await U.judgmentDetail(d,L);if(s||!E||E.seq!==T)return;E.detail=j,k.innerHTML=vn(j,{database:E.database})}catch(j){if(s||!E||E.seq!==T)return;k.innerHTML=pn(j,d),D(j.message||"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587\u3002","danger")}},u=(d,p)=>`${i}:${d.id}:${p}`,A=(d,p)=>(d.tables||[]).find(g=>g.id===p)?.label||p,I=(d,p,{sort:g=null,columnFilters:S={}}={})=>{let T={column_filters:S};return d.id==="postgres"?(T.table=p,T.schema_preview=!0):d.id==="parquet"&&i==="judgment"?(T.table="judgment_documents",T.columns=Ia):d.id==="parquet"&&(T.dataset="all",T.columns=Ra),g?.key&&(T.sort=`${g.key}:${g.direction}`),T},ne=async(d,p,{sort:g=null,columnFilters:S={}}={})=>{if(!p)return;xe();let T=u(d,p),L=++x;f={tableId:p},v={key:T,tableId:p,loading:!0,result:null,error:null,sort:g,columnFilters:S},P.innerHTML=Zt(d,be(i)?.label||i,p),k.innerHTML=Ns(A(d,p));try{let j;if(d.id==="indexeddb"){let W=kt(d,10);W.values.store=p,W.page=1,j=await Is(d,W)}else d.id==="qdrant"?j={database:"qdrant",label:"Qdrant",status:"not_configured",message:"Qdrant collection \u9700\u8981\u8A9E\u610F\u67E5\u8A62\uFF1BSchema \u50C5\u63D0\u4F9B collection \u540D\u7A31\uFF0C\u4E0D\u5217\u51FA\u524D 10 \u7B46\u8CC7\u6599\u3002",table:p,columns:[],rows:[],total:0,page:1,page_size:10,duration_ms:0,summary:[],distribution:[],query_text:"",warnings:[],meta:{}}:(j=await U.query({database:d.id,filters:I(d,p,{sort:g,columnFilters:S}),page:1,pageSize:10}),g?.key&&(j.meta={...j.meta||{},sort:g}));if(s||L!==x)return;v={key:T,tableId:p,loading:!1,result:j,error:null,sort:g,columnFilters:S},w==="schema"&&f?.tableId===p&&(P.innerHTML=Zt(d,be(i)?.label||i,p),k.innerHTML=es(j,A(d,p),{columnFilters:S,searchEnabled:d.id==="postgres"||d.id==="parquet"}))}catch(j){if(s||L!==x)return;v={key:T,tableId:p,loading:!1,result:null,error:j,sort:g,columnFilters:S},w==="schema"&&f?.tableId===p&&(k.innerHTML=Cs(j,A(d,p)))}},ce=()=>{let d=le(o);if(!d)return null;if(w==="schema"&&v?.result)return{db:d,tableId:v.tableId,columnFilters:v.columnFilters||{},sort:v.sort||null,mode:"schema"};let p=d?H(d):null,g=p?.result;return g&&(d.id==="postgres"||d.id==="parquet")?{db:d,tableId:g.table,columnFilters:p.columnFilters||{},sort:p.sort||null,mode:"query"}:null},re=(d,p,g)=>{if(!d)return;let S=`${d.db.id}:${d.tableId}:${p}`,T=pe.get(S);T&&(window.clearTimeout(T),pe.delete(S)),xe();let L={...d.columnFilters||{}},j=String(g||"").trim();if(j?L[p]=j:delete L[p],d.mode==="schema"){ne(d.db,d.tableId,{sort:d.sort,columnFilters:L});return}let W=H(d.db);W.columnFilters=L,W.page=1,Ge(1)},pe=new Map,ie=()=>{M+=1,h=[],y=null,N=-1,q&&(q.hidden=!0,q.innerHTML="")},J=(d,p)=>{let g=String(d||""),S=g.toLocaleLowerCase(),T=String(p||"").toLocaleLowerCase(),L=new Array(g.length).fill(!1),j=(oe,Me)=>{for(let fe=oe;fe<oe+Me;fe+=1)fe>=0&&fe<L.length&&(L[fe]=!0)},W=S.indexOf(T);if(W>=0)for(;W>=0;)j(W,T.length),W=S.indexOf(T,W+T.length);else{let oe=[];for(let Me of T.match(/[一-鿿]{2,}/g)||[])for(let fe=0;fe<Me.length-1;fe+=1)oe.push(Me.slice(fe,fe+2));oe.push(...T.match(/[a-z0-9]+/g)||[]);for(let Me of oe){let fe=S.indexOf(Me);for(;fe>=0;)j(fe,Me.length),fe=S.indexOf(Me,fe+Me.length)}}let ue="",me=0;for(;me<g.length;)if(L[me]){let oe=me;for(;oe<g.length&&L[oe];)oe+=1;ue+=`<mark>${n(g.slice(me,oe))}</mark>`,me=oe}else{let oe=me;for(;oe<g.length&&!L[oe];)oe+=1;ue+=n(g.slice(me,oe)),me=oe}return ue||n(g)},ge=(d,p)=>{if(!q)return;let g=d.getBoundingClientRect(),S=Math.min(420,Math.max(220,g.width)),T=Math.min(360,34+p*30),L=g.bottom+4;L+T>window.innerHeight-8&&(L=Math.max(8,g.top-T-4));let j=Math.min(window.innerWidth-S-8,Math.max(8,g.left));q.style.width=`${S}px`,q.style.left=`${j}px`,q.style.top=`${L}px`},Le=d=>{if(!q)return;let p=[...q.querySelectorAll(".schema-suggest-item")];p.length&&(N=Math.max(0,Math.min(p.length-1,d)),p.forEach((g,S)=>{g.classList.toggle("is-active",S===N)}),p[N].scrollIntoView({block:"nearest"}))},ke=d=>{let p=h[d],g=y;!p||!g||(ie(),re(g,g.column,p))},Be=async(d,p,g,S)=>{if(!d||!g.trim()){ie();return}let T=++M;y={...d,column:p,input:S},N=-1;try{let L=await U.schemaSuggest({database:d.db.id,table:d.tableId,column:p,query:g,limit:1e3});if(T!==M||document.activeElement!==S||!q)return;let j=Array.isArray(L.values)?L.values:[];if(h=j,!j.length){ie();return}let W=Number(L.total)>j.length?`\u5171 ${c(L.total)} \u500B\u7B26\u5408\uFF0C\u986F\u793A\u524D ${c(j.length)} \u500B`:`\u5171 ${c(L.total)} \u500B\u7B26\u5408`;q.innerHTML=`<div class="schema-suggest-head">${n(W)}</div>${j.map((ue,me)=>`<button class="schema-suggest-item" type="button"
            data-schema-suggest-index="${me}"
            title="${n(ue)}">${J(ue,g)}</button>`).join("")}`,ge(S,j.length),q.hidden=!1}catch{ie()}},xe=()=>{let d=document.activeElement;d instanceof HTMLElement&&d.matches("[data-schema-search]")&&d.blur(),ie()},mt=(d,{resetReport:p=!1}={})=>{xe();let g=H(d);if(G.innerHTML=Es(r,i),X.innerHTML=Fa(Te(),d.id),se.innerHTML=Ha(w),w==="schema"?(R.hidden=!0,R.innerHTML="",P.hidden=!1,P.innerHTML=Zt(d,be(i)?.label||i,f?.tableId||"")):(P.hidden=!0,P.innerHTML="",R.hidden=!1,R.innerHTML=`${js(d)}${Yt(d,g)}<div class="sidebar-note">${Ps(d)}</div>`),Ie(),w==="schema"){let S=f?u(d,f.tableId):"";if(v&&v.key===S){let T=A(d,v.tableId);v.loading?k.innerHTML=Ns(T):v.error?k.innerHTML=Cs(v.error,T):k.innerHTML=es(v.result,T,{columnFilters:v.columnFilters||{},searchEnabled:d.id==="postgres"||d.id==="parquet"})}else k.innerHTML=Za(d);return}p?Se(d):g.result?k.innerHTML=St(g.result):Se(d)},vt=(d,{persist:p=!0,resetReport:g=!1}={})=>{let S=Te(),T=S.find(j=>j.id===d)||S[0];if(!T)return;_=null,E=null,f=null,v=null,x+=1,o=T.id;let L=$e(i,T.id);l[L]||(l[L]=kt(T,b)),mt(T,{resetReport:g}),p&&(de(`data.last_database.${i}`,T.id),de("data.last_category",i))},je=(d,{persist:p=!0,resetReport:g=!0,databaseId:S=null}={})=>{let T=be(d)||r[0];if(!T)return;i=T.id,_=null,E=null;let L=T.databases||[],j=S&&L.find(W=>W.id===S)||L.find(W=>W.id===o)||L[0];if(o=j?.id||null,!j){G.innerHTML=Es(r,i),X.innerHTML=`<div class="sidebar-notice">${Y({tone:"warn",title:"\u6C92\u6709\u53EF\u7528\u7684\u8CC7\u6599\u4F86\u6E90",text:"\u9019\u500B\u985E\u5225\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u5EAB\u9078\u9805\u3002"})}</div>`,R.innerHTML="",Ie();return}vt(j.id,{persist:!1,resetReport:g}),p&&(de("data.last_category",T.id),de(`data.last_database.${T.id}`,j.id))},it=d=>{let p=H(d),g=R.querySelector("#data-filter-form");g&&(p.values=xt(g,d,p))},Ge=async(d=null)=>{let p=le(o);if(!p)return;xe();let g=H(p);it(p),d!==null&&(g.page=d),(!Number.isFinite(g.page)||g.page<1)&&(g.page=1);let S=++m;_=null,E=null,k.innerHTML=ct(p);let T=R.querySelector("#run-query");V(T,!0,"\u67E5\u8A62\u4E2D\u2026");try{let L;if(p.id==="indexeddb"?L=await Is(p,g):L=await U.query({database:p.id,filters:Xt(p,g),page:g.page,pageSize:g.pageSize}),s||S!==m)return;L.meta={...L.meta||{},column_filters:g.columnFilters||{},searchable:p.id==="postgres"||p.id==="parquet",sort:g.sort||L.meta?.sort||null},g.result=L,g.page=Number(L.page)||g.page,g.pageSize=Number(L.page_size)||g.pageSize,k.innerHTML=St(L);let j=be(i)?.label||i;await wt({kind:"data",title:`${j} \xB7 ${p.label} \xB7 ${L.table||L.label||"query"}`,detail:`${c(L.total)} \u7B46 \xB7 ${F(L.duration_ms)}`,payload:{category:i,database:p.id,filters:Xt(p,g),page:g.page,page_size:g.pageSize}}),de("data.last_query",{category:i,database:p.id,filters:Xt(p,g),page:g.page,page_size:g.pageSize,at:new Date().toISOString()})}catch(L){if(s||S!==m)return;k.innerHTML=Lt(L,p),D(L.message||"\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{!s&&S===m&&V(T,!1)}},Dt=async()=>{Q.disabled=!0,V(Q,!0,"\u6574\u7406\u4E2D\u2026");try{let[d,p,g,S,T]=await Promise.all([U.catalog(),lt("data.last_category","law"),lt("data.last_database.law","postgres"),lt("data.last_database.judgment","postgres"),lt("data.page_size",25)]);if(s)return;a=d,r=Array.isArray(a.categories)?a.categories:[],b=Ds.includes(Number(T))?Number(T):25;for(let W of r)for(let ue of W.databases||[]){let me=$e(W.id,ue.id);l[me]||(l[me]=kt(ue,b))}let L=r.find(W=>W.id===p)||r[0];if(!L){G.innerHTML="",X.innerHTML=`<div class="sidebar-notice">${Y({tone:"danger",title:"\u6C92\u6709\u53EF\u7528\u7684\u5206\u985E",text:"Catalog \u6C92\u6709\u56DE\u50B3\u6CD5\u898F\u547D\u4EE4\u6216\u5224\u6C7A\u5206\u985E\u3002"})}</div>`;return}let j=L.id==="judgment"?S:g;if(i=L.id,o=null,je(L.id,{persist:!1,resetReport:!0,databaseId:j}),s)return;D("\u8CC7\u6599\u5EAB catalog \u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(d){if(s)return;a=null,r=[],G.innerHTML="",Ie(),X.innerHTML=`<div class="sidebar-notice">${Y({tone:"danger",title:"\u7121\u6CD5\u8B80\u53D6 catalog",text:n(d.message||"\u8ACB\u78BA\u8A8D API \u662F\u5426\u555F\u52D5\u3002")})}
      <button class="btn btn-secondary btn-sm" type="button" id="catalog-retry" style="margin-top:10px">
        ${$("refresh",14)}<span>\u91CD\u8A66</span>
      </button></div>`,k.innerHTML=`<div class="report-empty">${ye({iconName:"server",title:"API \u76EE\u524D\u7121\u6CD5\u9023\u7DDA",text:"\u67E5\u8A62\u5831\u8868\u9700\u8981 FastAPI \u63D0\u4F9B catalog \u8207\u8CC7\u6599\u67E5\u8A62 API\u3002\u8ACB\u78BA\u8A8D judgment-web \u5DF2\u555F\u52D5\u3002"})}</div>`}finally{s||(Q.disabled=!1,V(Q,!1))}};z.addEventListener("change",d=>{let p=d.target;if(p.name==="category"){je(p.value);return}if(p.name==="database"){vt(p.value);return}let g=le(o);if(!g)return;let S=H(g),T=R.querySelector("#data-filter-form");!T||!p.name||(S.values=xt(T,g,S),S.page=1,p.name==="table"&&(_=null,E=null,S.sort=null,S.columnFilters={},S.result=null,R.innerHTML=Yt(g,S),Se(g)))}),z.addEventListener("input",d=>{let p=le(o);if(!p)return;let g=R.querySelector("#data-filter-form");if(!g||!d.target.name||d.target.name==="table")return;let S=H(p);S.values=xt(g,p,S)}),z.addEventListener("submit",d=>{d.target.id==="data-filter-form"&&(d.preventDefault(),Ge(1))}),z.addEventListener("click",d=>{let p=d.target.closest("[data-action]"),g=p?.dataset.action;if(g==="sidebar-view"){let S=le(o);if(!S)return;let T=H(S),L=R.querySelector("#data-filter-form");L&&w==="query"&&(T.values=xt(L,S,T)),w=p.dataset.view==="schema"?"schema":"query",mt(S);return}if(g==="select-schema-table"){let S=le(o);if(!S)return;ne(S,p.dataset.tableId||"");return}if(g==="reset"){let S=le(o);if(!S)return;_=null,E=null;let T=H(S);l[$e(i,S.id)]=kt(S,T.pageSize),R.innerHTML=`${js(S)}${Yt(S,l[$e(i,S.id)])}<div class="sidebar-note">${Ps(S)}</div>`,Se(S),D("\u5DF2\u91CD\u8A2D\u9019\u500B\u8CC7\u6599\u5EAB\u7684\u67E5\u8A62\u689D\u4EF6\u3002","info",2400);return}d.target.closest("#catalog-retry")&&Dt()}),k.addEventListener("input",d=>{let p=d.target.closest("[data-schema-search]");if(!p)return;let g=ce();if(!g)return;let S=p.dataset.schemaSearch||"",T=p.value,L=`${g.mode}:${g.db.id}:${g.tableId}:${S}`,j=pe.get(L);if(j&&window.clearTimeout(j),!T.trim()){pe.delete(L),ie(),re(g,S,"");return}let W=window.setTimeout(()=>{pe.delete(L),Be(g,S,T,p)},250);pe.set(L,W)}),k.addEventListener("keydown",d=>{let p=d.target.closest("[data-schema-search]");if(!p)return;let g=ce();if(g){if(d.key==="Escape"){ie();return}if(d.key==="ArrowDown"||d.key==="ArrowUp"){if(!q||q.hidden)return;d.preventDefault();let S=d.key==="ArrowDown"?1:-1;Le(N<0?S>0?0:h.length-1:N+S);return}if(d.key==="Enter"){if(d.preventDefault(),q&&!q.hidden&&N>=0){ke(N);return}re(g,p.dataset.schemaSearch||"",p.value)}}}),q?.addEventListener("mousedown",d=>{d.preventDefault()}),q?.addEventListener("click",d=>{let p=d.target.closest("[data-schema-suggest-index]");p&&ke(Number(p.dataset.schemaSuggestIndex))});let gs=d=>{d.target.closest("[data-schema-search]")||q?.contains(d.target)||ie()};return document.addEventListener("click",gs),window.addEventListener("scroll",ie,!0),window.addEventListener("resize",ie),k.addEventListener("keydown",d=>{d.target.matches(".law-jump-input")&&d.key==="Enter"&&(d.preventDefault(),Ae(d.target.id))}),k.addEventListener("click",async d=>{let p=d.target.closest("[data-action]");if(!p)return;let g=p.dataset.action,S=le(o),T=S?H(S):null,L=T?.result;if(g==="back-to-results"){qe();return}if(g==="open-law"){De({lawKey:p.dataset.lawKey||"",sourceType:p.dataset.lawSource||"",lawName:p.dataset.lawName||""});return}if(g==="open-judgment"){C({jid:p.dataset.jid||""});return}if(g==="jump-article"){Ae(p.dataset.jumpInput||"law-article-jump");return}if(g==="sort-column"){let j=p.dataset.sortKey||"";if(!j||!S)return;if(w==="schema"&&v?.result){let me=v.sort,oe=j==="jdate"||j==="law_modified_date"||j==="article_count"||j==="citation_count"||j==="full_text_length"||j==="created_at"||j==="updated_at",Me=me?.key===j?me.direction==="asc"?"desc":"asc":oe?"desc":"asc";ne(S,v.tableId,{sort:{key:j,direction:Me},columnFilters:v.columnFilters||{}});return}if(!T)return;let W=T.sort,ue=W?.key===j?W.direction==="asc"?"desc":"asc":j==="jdate"?"desc":"asc";T.sort={key:j,direction:ue},Ge(1);return}if(g==="retry"){Ge(T?.page||1);return}if(L){if(g==="prev-page"){Ge(Math.max(1,Number(L.page)-1));return}if(g==="next-page"){let j=Math.max(1,Math.ceil(Number(L.total)/Number(L.page_size)));Ge(Math.min(j,Number(L.page)+1));return}if(g==="copy-query"){let j=await bt(L.query_text||"");D(j?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",j?"ok":"warn");return}if(g==="export-json"){let j=`${L.database}-${L.table||"query"}-page-${L.page}.json`;Ue(j,JSON.stringify(Tt(L),null,2),"application/json;charset=utf-8"),D(`\u5DF2\u532F\u51FA ${j}`,"ok");return}if(g==="export-csv"){let j=`${L.database}-${L.table||"query"}-page-${L.page}.csv`;Ue(j,Mt(L),"text/csv;charset=utf-8"),D(`\u5DF2\u532F\u51FA ${j}`,"ok")}}}),k.addEventListener("change",d=>{let p=d.target.closest("[data-action='select-law-version']");if(p&&_){De({lawKey:_.lawKey,sourceType:_.sourceType,lawName:_.lawName,versionId:p.value});return}if(!d.target.matches("[data-page-size]"))return;let g=le(o);if(!g)return;let S=H(g);S.pageSize=Number(d.target.value)||25,S.page=1,de("data.page_size",S.pageSize),Ge(1)}),Q.addEventListener("click",()=>{Dt()}),await Dt(),t&&typeof t.setTitle=="function"&&t.setTitle("\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"),()=>{s=!0;for(let d of pe.values())window.clearTimeout(d);pe.clear(),ie(),document.removeEventListener("click",gs),window.removeEventListener("scroll",ie,!0),window.removeEventListener("resize",ie)}}var Qs=[10,25,50,100],hn=[{value:"started_at:desc",label:"Timestamp \u65B0 \u2192 \u820A"},{value:"started_at:asc",label:"Timestamp \u820A \u2192 \u65B0"},{value:"duration_ms:desc",label:"\u8017\u6642\u591A \u2192 \u5C11"},{value:"duration_ms:asc",label:"\u8017\u6642\u5C11 \u2192 \u591A"}];function rs(){return{process:"",module:"",status:"",method:"",model:"",keyword:"",from_date:"",to_date:"",min_duration:"",sort:"started_at:desc"}}function bn(e,t=e){return`<option value="${n(e)}">${n(t)}</option>`}function dt(e,t,s,a,r=""){return`<div class="field">
    <label class="field-label" for="performance-${e}">
      <span>${n(t)}</span>
      <span class="field-tag">${n(e)}</span>
    </label>
    <select class="select" id="performance-${e}" name="${n(e)}">
      ${bn("","\u5168\u90E8")}
      ${s.map(i=>`<option value="${n(i)}" ${String(i)===String(a)?"selected":""}>${n(i)}</option>`).join("")}
    </select>
    ${r?`<span class="field-help">${n(r)}</span>`:""}
  </div>`}function $n(e,t){let s=hn.map(a=>`<option value="${a.value}" ${a.value===t.sort?"selected":""}>${a.label}</option>`).join("");return`
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
    </div>`}function zs(){let e=document.getElementById("performance-filter-form");if(!e)return rs();let t=new FormData(e);return{process:String(t.get("process")||""),module:String(t.get("module")||""),status:String(t.get("status")||""),method:String(t.get("method")||""),model:String(t.get("model")||""),keyword:String(t.get("keyword")||"").trim(),from_date:String(t.get("from_date")||""),to_date:String(t.get("to_date")||""),min_duration:String(t.get("min_duration")||""),sort:String(t.get("sort")||"started_at:desc")}}function Js(e){if(e==null)return"null";if(typeof e=="object")try{let t=JSON.stringify(e);return t.length>160?`${t.slice(0,157)}\u2026`:t}catch{return String(e)}return String(e)}function yn(e){if(!e)return"";let t=new Date(e);if(Number.isNaN(t.getTime()))return"";let s=String(t.getHours()).padStart(2,"0"),a=String(t.getMinutes()).padStart(2,"0"),r=String(t.getSeconds()).padStart(2,"0"),i=String(t.getMilliseconds()).padStart(3,"0");return`${s}:${a}:${r}.${i}`}function wn(e){let t=String(e?.module||"");return t.includes("static")||t.includes("frontend")?"is-client":t.includes("judgment.rag")?"is-rag":t.includes("judgment.web.app")?"is-api":t.includes("judgment.web.query")?"is-data":t.includes("judgment.judgment_index")?"is-index":"is-other"}function _n(e){let t=new Map(e.map(a=>[a.seq,a.parent_seq])),s=new Map;for(let a of e){if(Number.isInteger(a.depth)){s.set(a.seq,a.depth);continue}let r=0,i=a.parent_seq,o=0;for(;i&&t.has(i)&&o<20;)r+=1,i=t.get(i),o+=1;s.set(a.seq,r)}return s}function kn(e){let t=Object.entries(e||{});if(!t.length)return'<span class="muted">\u7121\u53C3\u6578</span>';let s=t.slice(0,8),a=t.length-s.length;return`<div class="flow-param-list">${s.map(([r,i])=>`<span class="flow-param">
        <span class="flow-param-key">${n(r)}</span>
        <span class="flow-param-value">${n(Js(i))}</span>
      </span>`).join("")}${a>0?`<span class="flow-param-more">+${a}</span>`:""}</div>`}function xn(e){let t=new Map,s=Math.max(0,Number(e[0]?.offset_ms)||0);return e.forEach((a,r)=>{let i=Math.max(0,Number(a.offset_ms)||0),o=Math.max(0,Number(a.duration_ms)||0),l=e[r+1],m=l?Math.max(i,Number(l.offset_ms)||i):null,b=m===null?i+o:m,w=Math.max(0,b-i),f=Math.max(0,b-s);t.set(a.seq,{offset:i,duration:o,lap:w,cumulative:f})}),t}function Sn(e,t,s,a){let r=a.get(e.seq)||{},i=Math.max(0,Number(r.duration)||0),o=Math.max(0,Number(r.offset)||0),l=Math.max(0,Number(r.lap)||0),m=Math.max(0,Number(r.cumulative)||0),b=Math.max(t,o+i,1),w=Math.min(100,o/b*100),f=Math.min(100-w,Math.max(.6,l/b*100)),v=s.get(e.seq)||0,h=yn(e.started_at)||`+${o.toFixed(0)} ms`,y=e.started_at?`\u958B\u59CB\uFF1A${ee(e.started_at)} \xB7 +${o.toFixed(1)} ms`:`\u958B\u59CB\uFF1A+${o.toFixed(1)} ms`;return`<div class="flow-segment ${e.status==="error"?"is-error":""}" style="--depth:${Math.min(v,8)}">
    <div class="flow-segment-head">
      <span class="flow-seq">#${n(String(e.seq??"\u2014"))}</span>
      <span class="flow-segment-name">${n(e.name||"unnamed")}</span>
      <span class="flow-segment-start" title="${n(y)}">${n(h)}</span>
      <span class="flow-segment-duration" title="\u8DDD\u4E0B\u4E00\u9EDE ${F(l)}\uFF1B\u7D2F\u8A08 ${F(m)}">${F(l)}</span>
      <span class="flow-segment-span" title="\u5F9E\u7B2C\u4E00\u9EDE\u5230\u672C\u9EDE\u7D50\u675F\u7684\u7D2F\u8A08\u6642\u9593">\u7D2F\u8A08 ${F(m)}</span>
    </div>
    <div class="flow-segment-loc">
      <span class="flow-segment-loc-text">${n(e.module||"\u2014")}<span class="flow-segment-dot">\xB7</span>${n(e.function||"\u2014")}</span>
      <span class="flow-segment-mobile-cum" title="\u5F9E\u7B2C\u4E00\u9EDE\u5230\u672C\u9EDE\u7D50\u675F\u7684\u7D2F\u8A08\u6642\u9593">\u7D2F\u8A08 ${F(m)}</span>
    </div>
    <div class="flow-track" title="\u958B\u59CB +${o.toFixed(1)} ms \xB7 \u8DDD\u4E0B\u4E00\u9EDE ${F(l)} \xB7 \u7D2F\u8A08 ${F(m)}">
      <span class="flow-bar ${wn(e)}" style="left:${w.toFixed(2)}%;width:${f.toFixed(2)}%"></span>
    </div>
    ${kn(e.params)}
    ${e.error?`<div class="flow-segment-error">${n(e.error)}</div>`:""}
  </div>`}function An(e){let t=Array.isArray(e?.segments)?e.segments:[],s=Array.isArray(e?.models)?e.models:[],a=e?.client||{},r=Math.max(...t.map(l=>Number(l.avg_ms)||0),1),i=a.samples?F(a.avg_total_ms??0):"\u2014",o=a.samples?F(a.avg_render_ms??0):"\u2014";return`<div class="perf-flow-stats">
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
  </div>`}function _e(e){let t=Math.max(0,Number(e)||0);if(!t)return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;let s=Math.round(t/1e3),a=Math.floor(s/3600),r=Math.floor(s%3600/60),i=s%60;return a?`${a}h ${String(r).padStart(2,"0")}m ${String(i).padStart(2,"0")}s`:r?`${r}m ${String(i).padStart(2,"0")}s`:`${(t/1e3).toFixed(1)}s`}function Vs(e){let t=String(e?.task||"").trim();return t?t==="auto"?"\u81EA\u52D5\u63A5\u7E8C":`task ${t}`:"\u7D22\u5F15"}function Ln(e){let t=(e||[]).slice(-12);if(!t.length)return'<p class="muted" style="font-size:11px">\u5C1A\u7121\u7D22\u5F15\u7D00\u9304\u3002</p>';let s=Math.max(...t.map(a=>Number(a.points_per_second)||0),.1);return`<div class="index-run-bars">${t.map(a=>{let r=Number(a.points_per_second)||0,i=Math.max(2,r/s*100);return`<div class="index-run-row">
        <div class="index-run-label">
          <strong>${n(Vs(a))}</strong>
          <span>${n(ee(a.started_at))}</span>
        </div>
        <div class="index-run-track" title="${n(`${c(a.indexed_count)} \u7B46 \xB7 ${_e(a.duration_ms)} \xB7 ${c(a.batch_count)} \u6279`)}">
          <span style="width:${i.toFixed(1)}%"></span>
        </div>
        <div class="index-run-value">
          <strong>${r.toFixed(1)}</strong><span>\u7B46/\u79D2</span>
          <em>${c(a.indexed_count)} \u7B46 \xB7 ${_e(a.duration_ms)}</em>
        </div>
      </div>`}).join("")}</div>`}function Mn(e){let t=(Array.isArray(e.time_breakdown)?e.time_breakdown:[]).map(s=>({...s,ms:Number(s.ms)||0,percent:Number(s.percent)||0})).filter(s=>s.ms>0);return t.length?`<div class="index-breakdown-bar">${t.map(s=>`<span class="index-seg index-seg-${n(s.key)}" style="width:${Math.max(.5,s.percent).toFixed(2)}%" title="${n(`${s.label} ${_e(s.ms)}\uFF08${s.percent.toFixed(1)}%\uFF09`)}"></span>`).join("")}</div>
    <div class="index-breakdown-legend">${t.map(s=>`<span class="index-legend-item">
            <i class="index-seg index-seg-${n(s.key)}"></i>
            <span>${n(s.label)}</span>
            <strong>${_e(s.ms)}</strong>
            <em>${s.percent.toFixed(1)}%</em>
          </span>`).join("")}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B\u968E\u6BB5\u8A08\u6642\uFF1B\u5F8C\u7E8C\u7D22\u5F15\u6703\u8A18\u9304 Ollama Embedding\u3001Qdrant Upsert \u8207 PostgreSQL \u7D22\u5F15\u7D00\u9304\u7684\u6642\u9593\u7D44\u6210\u3002</div>'}function Tn(e,t){let s=(Array.isArray(e)?e:[]).map(M=>({elapsed:Math.max(0,Number(M.elapsed_s)||0),indexed:Math.max(0,Number(M.indexed)||0)})).filter(M=>M.indexed>0);if(s.length<2)return"";let a=Math.max(...s.map(M=>M.elapsed),(Number(t)||0)/1e3,1),r=Math.max(...s.map(M=>M.indexed),1),i=760,o=150,l=12,m=12,b=i-l*2,w=o-m*2,f=s.map(M=>[l+M.elapsed/a*b,o-m-M.indexed/r*w]),v=f.map(([M,_],E)=>`${E===0?"M":"L"}${M.toFixed(1)},${_.toFixed(1)}`).join(" "),x=`${v} L${f[f.length-1][0].toFixed(1)},${o-m} L${f[0][0].toFixed(1)},${o-m} Z`,h=Math.max(1,Math.ceil(f.length/14)),y=f.map(([M,_],E)=>E%h===0||E===f.length-1?`<circle cx="${M.toFixed(1)}" cy="${_.toFixed(1)}" r="2.6" />`:"").join(""),N=[0,1,2,3].map(M=>{let _=m+w/3*M;return`<line x1="${l}" y1="${_.toFixed(1)}" x2="${i-l}" y2="${_.toFixed(1)}" class="index-chart-grid" />`}).join("");return`<div class="index-chart-card index-progress-card">
    <div class="index-chart-head">
      <span>\u672C\u6B21\u7D22\u5F15\u9032\u5EA6</span>
      <span>${c(r)} \u7B46 \xB7 ${_e(a*1e3)}</span>
    </div>
    <svg class="index-progress-svg" viewBox="0 0 ${i} ${o}" role="img" aria-label="\u7D22\u5F15\u9032\u5EA6\u6298\u7DDA\u5716">
      ${N}
      <path d="${x}" class="index-progress-area"></path>
      <path d="${v}" class="index-progress-line"></path>
      ${y}
      <line x1="${l}" y1="${o-m}" x2="${i-l}" y2="${o-m}" class="index-chart-axis"></line>
      <line x1="${l}" y1="${m}" x2="${l}" y2="${o-m}" class="index-chart-axis"></line>
    </svg>
    <div class="index-progress-labels">
      <span>0</span>
      <span>${_e(a*500)}</span>
      <span>${_e(a*1e3)}</span>
    </div>
  </div>`}function qn(e){if(!e||!e.latest)return"";let t=e.latest,s=Array.isArray(e.runs)?e.runs:[],a=e.average||{},r=t.coverage||{},i=r.total_judgments>0?`${c(r.indexed_judgments)} / ${c(r.total_judgments)}\uFF08${(100*r.indexed_judgments/r.total_judgments).toFixed(1)}%\uFF09`:"\u2014",o=[{label:"\u7576\u6B21\u57F7\u884C\u7B46\u6578",value:c(t.indexed_count),note:`${c(t.batch_count)} \u6279 \xD7 ${c(t.batch_size)} \u7B46`},{label:"\u5E73\u5747\u6BCF\u79D2\u7B46\u6578",value:`${(Number(t.points_per_second)||0).toFixed(1)}`,note:"\u7B46/\u79D2"},{label:"\u7576\u6B21\u4F7F\u7528\u6642\u9593",value:_e(t.duration_ms),note:`${c(t.scanned_count)} \u7B46\u5DF2\u6383\u63CF`},{label:"\u5E73\u5747\u6BCF\u6279\u6642\u9593",value:_e(t.batch_avg_ms),note:t.batch_min_ms||t.batch_max_ms?`\u6700\u5FEB ${_e(t.batch_min_ms)} \xB7 \u6700\u6162 ${_e(t.batch_max_ms)}`:"\u4EE5\u7E3D\u8017\u6642 \xF7 \u6279\u6578\u8A08\u7B97"}];return`<section class="index-perf-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u7D22\u5F15\u6548\u80FD</div>
        <div class="index-perf-sub">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 \xB7 \u6700\u8FD1 ${c(e.run_count)} \u6B21\u57F7\u884C</div>
      </div>
      <span class="chip">${n(Vs(t))}</span>
    </div>
    <div class="index-perf-summary">
      ${o.map(l=>`<div class="index-perf-stat">
            <div class="summary-label">${n(l.label)}</div>
            <div class="index-perf-value">${n(l.value)}</div>
            <div class="index-perf-note">${n(l.note)}</div>
          </div>`).join("")}
    </div>
    <div class="index-perf-meta">
      <span><strong>\u6700\u8FD1\u4E00\u6B21</strong> ${n(ee(t.started_at))}</span>
      <span><strong>batch</strong> ${c(t.batch_size)} \u7B46\uFF0F\u6279</span>
      <span><strong>embedding \u4E0A\u9650</strong> ${t.max_chars?`${c(t.max_chars)} \u5B57`:"\u2014"}</span>
      <span><strong>collection</strong> ${c(t.collection_points)} points</span>
      <span><strong>\u8986\u84CB\u7387</strong> ${n(i)}</span>
      <span><strong>\u5E73\u5747\u6BCF\u6B21\u57F7\u884C</strong> ${_e(a.duration_ms)} \xB7 ${(Number(a.points_per_second)||0).toFixed(1)} \u7B46/\u79D2</span>
    </div>
    <div class="index-charts">
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u8FD1\u7D22\u5F15\u541E\u5410</span>
          <span>\u7B46/\u79D2</span>
        </div>
        ${Ln(s)}
      </div>
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u65B0\u4E00\u6B21\u6642\u9593\u7D44\u6210</span>
          <span>${_e(t.duration_ms)}</span>
        </div>
        ${Mn(t)}
      </div>
    </div>
    ${Tn(t.progress,t.duration_ms)}
  </section>`}function jn(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,r=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${r} \u9801 \xB7
      \u986F\u793A ${c(i)}\u2013${c(o)} / ${c(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Qs.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${$("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=r?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${$("chevronRight",13)}</button>
    </div>
  </div>`}function En(e,t){let s=e.flow&&typeof e.flow=="object"?e.flow:null,a=Array.isArray(s?.segments)?[...s.segments].sort((h,y)=>Number(h.seq)-Number(y.seq)):[],r=s?.summary||{},i=Array.isArray(r.models)?r.models:[],o=s?.client||{},l=s?.metadata||{},m=l.question||"",b=l.answer||"",w=m||b?`<div class="perf-flow-qa">
          ${m?`<div class="perf-flow-qa-row"><strong>RAG \u554F\u984C</strong><span>${n(m)}</span></div>`:""}
          ${b?`<div class="perf-flow-qa-row"><strong>RAG \u7B54\u6848</strong><span>${n(b)}</span></div>`:""}
        </div>`:"",f=Math.max(Number(s?.total_ms)||0,Number(e.duration_ms)||0,...a.map(h=>(Number(h.offset_ms)||0)+(Number(h.duration_ms)||0)),1),v=_n(a),x=xn(a);return`<details class="perf-record" ${t===0?"open":""}>
    <summary class="perf-record-summary">
      <span class="perf-record-id">#${n(String(e.id))}</span>
      <span class="perf-record-main">
        <span class="perf-record-title">${n(e.process||"\u672A\u547D\u540D")}</span>
        <span class="perf-record-path mono">${n(e.method||"")} ${n(e.path||"")}</span>
      </span>
      <span class="perf-record-time">${ee(e.started_at)}</span>
      <span class="perf-record-duration">${F(e.duration_ms)}</span>
      ${K(e.status)}
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
      ${i.length?`<div class="chips perf-record-models">${i.map(h=>`<span class="chip">${n(h)}</span>`).join("")}</div>`:""}
      ${a.length?`<div class="flow-axis"><span>0 ms</span><span>${F(f)}</span></div>
            <div class="flow-timeline">${a.map(h=>Sn(h,f,v,x)).join("")}</div>`:`<div class="perf-no-flow">\u6B64\u7D00\u9304\u6C92\u6709 flow \u660E\u7D30\uFF08\u53EF\u80FD\u662F\u820A\u8CC7\u6599\u6216 CLI \u7D00\u9304\uFF09\u3002${e.params_text&&e.params_text!=="{}"?`<pre>${n(e.params_text)}</pre>`:""}</div>`}
      ${s?`<details class="flow-json">
              <summary>Flow JSON \xB7 ${a.length} \u6BB5</summary>
              <pre>${n(JSON.stringify(s,null,2))}</pre>
            </details>`:""}
    </div>
  </details>`}var ut={embedding:"Embedding",retrieval:"Qdrant \u6AA2\u7D22",context:"PostgreSQL \u53D6\u6587",llm:"LLM \u751F\u6210",validation:"\u5F15\u7528\u9A57\u8B49"},Gs={embedding:"EMB",retrieval:"\u6AA2\u7D22",context:"\u53D6\u6587",llm:"LLM",validation:"\u9A57\u8B49",overhead:"\u5176\u4ED6"};function Ws(e){return{pending:"\u7B49\u5F85",running:"\u57F7\u884C\u4E2D",success:"\u5B8C\u6210",partial:"\u90E8\u5206\u6210\u529F",failed:"\u5931\u6557",skipped:"\u7565\u904E"}[e]||e||"\u672A\u77E5"}function Pn(e){let t=String(e.status||"pending"),s=Math.max(0,Math.min(100,Number(e.progress)||0)),a=t==="pending"?0:t==="running"?Math.max(s,12):100,r=t==="running"?"\u57F7\u884C\u4E2D\u2026":t==="pending"?"\u7B49\u5F85":e.duration_ms?F(e.duration_ms):Ws(t);return`<div class="test-flow-step is-${n(t)}">
    <div class="test-flow-step-head">
      <span class="test-flow-model" title="${n(e.model||"")}">${n(e.model||"\u2014")}</span>
      <span class="test-flow-step-meta">${n(r)}</span>
    </div>
    <div class="test-flow-step-loc">${n(e.module||"\u2014")}<span class="flow-segment-dot">\xB7</span>${n(e.function||"\u2014")}</div>
    <div class="test-flow-track">
      <span class="test-flow-bar" style="width:${a}%"></span>
    </div>
    ${e.error_message?`<div class="test-flow-error">${n(e.error_message)}</div>`:""}
    ${e.details&&Object.keys(e.details).length?`<div class="test-flow-details">${n(Object.entries(e.details).slice(0,4).map(([i,o])=>`${i}=${Js(o)}`).join(" \xB7 "))}</div>`:""}
  </div>`}function Nn(e,t){if(!t.length)return"";let s=t.reduce((a,r)=>a+(Number(r.progress)||0),0)/t.length;return`<section class="test-flow-stage">
    <div class="test-flow-stage-head">
      <span class="test-flow-stage-title">${n(ut[e]||e)}</span>
      <span class="test-flow-stage-meta">${t.length} \u500B\u7A0B\u5E8F \xB7 ${Math.round(s)}%</span>
    </div>
    <div class="test-flow-stage-steps">${t.map(Pn).join("")}</div>
  </section>`}function Ks(e,t){let s=Date.now(),a=new Map;for(let f of t){let v=Number(f.duration_ms)||0;if(f.status==="running"&&f.started_at){let x=Date.parse(f.started_at);Number.isFinite(x)&&(v=Math.max(v,s-x))}a.set(f.stage,(a.get(f.stage)||0)+v)}let r=Array.isArray(e.stage_order)?e.stage_order:Object.keys(ut),i=[],o=new Set;for(let f of r)t.some(v=>v.stage===f)&&(o.add(f),i.push({stage:f,label:ut[f]||f,short:Gs[f]||f,duration:a.get(f)||0}));for(let[f,v]of a)o.has(f)||i.push({stage:f,label:ut[f]||f,short:Gs[f]||f,duration:v});let l=i.reduce((f,v)=>f+v.duration,0),m=Number(e.total_ms)||0,b=Math.max(l,m),w=Math.max(0,b-l);return w>1&&i.push({stage:"overhead",label:"\u5176\u4ED6\uFF0F\u6392\u7A0B",short:"\u5176\u4ED6",duration:w}),{entries:i,total:b||l,stepTotal:l}}function Cn(e,t){let{entries:s,total:a}=Ks(e,t),r=s.filter(o=>o.duration>0).map(o=>{let l=a?o.duration/a*100:0;return`<span class="test-flow-time-seg stage-${n(o.stage)}" style="width:${l.toFixed(2)}%" title="${n(o.label)} \xB7 ${F(o.duration)}\uFF08${l.toFixed(1)}%\uFF09">${l>=8?n(o.short):""}</span>`}).join(""),i=s.map(o=>{let l=a?o.duration/a*100:0;return`<span class="test-flow-legend-item">
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
  </div>`}function at(e,t,s,a={}){let r=a.showHistory!==!1,i=[`<option value="" ${s?"":"selected"}>\u76EE\u524D\uFF0F\u6700\u65B0\u6E2C\u8A66</option>`,...(t||[]).map(_=>`<option value="${n(_.run_id)}" ${_.run_id===s?"selected":""}>${n(Ws(_.status))} \xB7 ${n((_.question||"\u672A\u547D\u540D").slice(0,28))} \xB7 ${n(ee(_.started_at))}</option>`)].join(""),o=r?`<label class="test-flow-select-label">\u6B77\u53F2
        <select class="select" id="test-run-select">${i}</select>
      </label>
      <button class="btn btn-secondary btn-sm" type="button" id="test-flow-refresh">
        ${$("refresh",13)}<span>\u66F4\u65B0</span>
      </button>`:`<a class="btn btn-secondary btn-sm" href="#/performance">
        ${$("activity",13)}<span>\u6B77\u53F2 Flow</span>
      </a>`,l=`<div class="test-flow-head">
    <div class="test-flow-heading">
      <div class="eyebrow">PERFORMANCE TEST FLOW</div>
      <div class="test-flow-title">\u6E2C\u8A66\u6D41\u7A0B ${e?K(e.status):""}</div>
      <div class="test-flow-question">${e?n(e.question||"\u672A\u547D\u540D\u6E2C\u8A66"):"\u5C1A\u7121\u6E2C\u8A66\u6D41\u7A0B\u3002\u8ACB\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u4E26\u5728 RAG \u9801\u63D0\u554F\u3002"}</div>
    </div>
    <div class="test-flow-actions">${o}</div>
  </div>`;if(!e)return`<div class="test-flow-panel card">${l}
      ${ye({iconName:"activity",title:"\u7B49\u5F85\u6E2C\u8A66\u6D41\u7A0B",text:"\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C\u6240\u6709\u53EF\u7528\u6A21\u578B\uFF0C\u4E26\u5728\u9019\u88E1\u5373\u6642\u986F\u793A\u6BCF\u500B\u968E\u6BB5\u7684\u9032\u5EA6\u3002"})}
    </div>`;let m=Array.isArray(e.steps)?e.steps:[],b=new Map;for(let _ of m)b.has(_.stage)||b.set(_.stage,[]),b.get(_.stage).push(_);let f=(Array.isArray(e.stage_order)?e.stage_order:Object.keys(ut)).map(_=>Nn(_,b.get(_)||[])).join(""),v=e.models||{},x=Ks(e,m),h=e.status==="running"?`${F(x.total)}\uFF08\u4F30\u7B97\uFF09`:F(e.total_ms),y=m.find(_=>_.stage==="llm"&&_.model===e.summary?.primary_model)||m.find(_=>_.stage==="llm"&&_.details?.answer_preview),N=e.answer||y?.details?.answer_preview||"",M=`<div class="test-flow-answer">
    <div class="test-flow-answer-head">
      <span>RAG \u5F15\u64CE\u7B54\u6848</span>
      ${e.summary?.primary_model?`<span class="mono">${n(e.summary.primary_model)}</span>`:""}
    </div>
    <p>${N?n(N):e.status==="running"?"\u6E2C\u8A66\u9032\u884C\u4E2D\uFF0C\u5C1A\u672A\u7522\u751F\u6700\u7D42\u7B54\u6848\u3002":"\u6B64\u6E2C\u8A66\u6C92\u6709\u4FDD\u5B58\u53EF\u986F\u793A\u7684\u7B54\u6848\u3002"}</p>
  </div>`;return`<div class="test-flow-panel card">
    ${l}
    <div class="test-flow-meta">
      <span><strong>Run</strong> <span class="mono">${n(e.run_id)}</span></span>
      <span><strong>\u958B\u59CB</strong> ${n(ee(e.started_at))}</span>
      <span><strong>\u7E3D\u8017\u6642</strong> ${h}</span>
      <span><strong>Embedding</strong> ${Array.isArray(v.embedding)?v.embedding.length:0} \u500B</span>
      <span><strong>LLM</strong> ${Array.isArray(v.llm)?v.llm.length:0} \u500B</span>
      <span><strong>\u968E\u6BB5</strong> ${n(e.stage_label||e.stage||"\u2014")}</span>
    </div>
    ${M}
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
    ${Cn(e,m)}
    <div class="test-flow-foot">
      <span>${e.status==="running"?"\u6E2C\u8A66\u57F7\u884C\u4E2D\uFF1B\u6B64\u5716\u8868\u6703\u81EA\u52D5\u66F4\u65B0\u3002":r?"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u5F9E\u4E0A\u65B9\u300C\u6B77\u53F2\u300D\u9078\u55AE\u9084\u539F\u5176\u4ED6 Flow\u3002":"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u81F3\u6548\u80FD\u5831\u8868\u67E5\u770B\u6B77\u53F2 Flow\u3002"}</span>
      ${e.summary?.primary_model?`<span class="mono">primary=${n(e.summary.primary_model)}</span>`:""}
    </div>
  </div>`}function Rn(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.summary)?e.summary:[],a=e.flow_stats||e.meta?.flow_stats||{},r=e.index_stats||null;return`<div class="report-card performance-flow-report" data-database="performance">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">PERFORMANCE FLOW REPORT</div>
        <div class="report-title">
          \u6548\u80FD\u5831\u8868 ${K(e.status||"ok")}
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
    ${qn(r)}
    ${An(a)}
    <div class="report-section-head perf-flow-list-head">
      <span class="report-section-title">Flow \u7D00\u9304</span>
      <span class="muted" style="font-size:9.5px">\u9EDE\u64CA\u5217\u5C55\u958B\u6A21\u7D44\u3001\u51FD\u6578\u3001\u53C3\u6578\u8207\u5340\u6BB5\u8017\u6642</span>
    </div>
    <div class="perf-record-list">
      ${t.length?t.map((i,o)=>En(i,o)).join(""):ye({iconName:"activity",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684 Flow",text:"\u653E\u5BEC\u65E5\u671F\u3001\u6A21\u578B\u6216\u8017\u6642\u689D\u4EF6\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}
    </div>
    ${jn(e)}
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
  </div>`}async function In(e,t){let s=!1,a=rs(),r={processes:[],modules:[],statuses:[],methods:[],models:[]},i=1,o=25,l=null;e.innerHTML=`<section class="page data-page performance-page">
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
  </section>`;let m=e.querySelector("#performance-filter-fields"),b=e.querySelector("#performance-filter-form"),w=e.querySelector("#performance-test-flow"),f=e.querySelector("#performance-report"),v=e.querySelector("#performance-meta"),x=e.querySelector("#performance-refresh"),h=null,y=[],N="",M=null,_="",E=()=>{m.innerHTML=$n(r,a)},z=()=>{let k=JSON.stringify({selected:N,tick:h?.status==="running"?Math.floor(Date.now()/1e3):0,runs:y.map(q=>`${q.run_id}:${q.status}`),run:h?{run_id:h.run_id,status:h.status,progress:h.progress,steps:(h.steps||[]).map(q=>`${q.stage}:${q.model}:${q.status}:${q.progress}`)}:null});k!==_&&(_=k,w.innerHTML=at(h,y,N))},G=async()=>{try{let k=await U.testRuns(30);if(s)return;y=Array.isArray(k.runs)?k.runs:[]}catch{if(s)return;y=[]}},X=async()=>{try{let k=N?await U.testRun(N):await U.testRunCurrent();if(s)return;h=k.run||null,!N&&h&&h.status!=="running"&&!y.some(q=>q.run_id===h.run_id)&&await G(),z()}catch{if(s)return;h=null,z()}},se=async()=>{s||(N||await X(),s||(M=window.setTimeout(se,1500)))};w.addEventListener("change",async k=>{k.target.id==="test-run-select"&&(N=String(k.target.value||""),await X())}),w.addEventListener("click",async k=>{k.target.closest("#test-flow-refresh")&&(N="",await G(),await X())});let R=async(k=i)=>{i=Math.max(1,Number(k)||1),a=zs(),f.innerHTML=ct({label:"\u6548\u80FD\u5831\u8868"});let q=e.querySelector("#performance-run");V(q,!0,"\u67E5\u8A62\u4E2D\u2026");try{let B=await U.performance(a,i,o);if(s)return;l=B,i=Number(B.page)||i,o=Number(B.page_size)||o,f.innerHTML=Rn(B),v.textContent=`PERFORMANCE \xB7 ${c(B.total)} \u7B46`,v.className="badge badge-neutral badge-mono"}catch(B){if(s)return;f.innerHTML=Lt(B,{label:"\u6548\u80FD\u5831\u8868"}),D(B.message||"\u6548\u80FD\u5831\u8868\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{s||V(q,!1)}},P=async()=>{try{r=await U.performanceOptions()}catch{r={processes:[],modules:[],statuses:[],methods:[],models:[]}}E()};return b.addEventListener("submit",k=>{k.preventDefault(),R(1)}),e.querySelector('[data-action="reset"]').addEventListener("click",()=>{a=rs(),i=1,E(),R(1)}),x.addEventListener("click",async()=>{a=zs(),x.disabled=!0,V(x,!0,"\u6574\u7406\u4E2D\u2026"),await P(),await G(),s||await X(),s||await R(1),s||(x.disabled=!1,V(x,!1))}),f.addEventListener("click",async k=>{let q=k.target.closest("[data-action]");if(!q||!l)return;let B=q.dataset.action;if(B==="retry"){R(i);return}if(B==="prev-page"){R(Math.max(1,Number(l.page)-1));return}if(B==="next-page"){let Q=Math.max(1,Math.ceil(Number(l.total)/Number(l.page_size)));R(Math.min(Q,Number(l.page)+1));return}if(B==="copy-query"){let Q=await bt(l.query_text||"");D(Q?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",Q?"ok":"warn");return}if(B==="export-json"){let Q=`performance-page-${l.page}.json`;Ue(Q,JSON.stringify(Tt(l),null,2),"application/json;charset=utf-8"),D(`\u5DF2\u532F\u51FA ${Q}`,"ok");return}if(B==="export-csv"){let Q=`performance-page-${l.page}.csv`;Ue(Q,Mt(l),"text/csv;charset=utf-8"),D(`\u5DF2\u532F\u51FA ${Q}`,"ok")}}),f.addEventListener("change",k=>{k.target.matches("[data-page-size]")&&(o=Number(k.target.value)||25,Qs.includes(o)||(o=25),R(1))}),await Promise.allSettled([P(),G()]),s||(await X(),await R(1),se()),t&&typeof t.setTitle=="function"&&t.setTitle("\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"),()=>{s=!0,M&&window.clearTimeout(M)}}var Dn=["\u91D1\u878D\u6D88\u8CBB\u8005\u4FDD\u8B77\u6CD5\u5982\u4F55\u8655\u7406\u91D1\u878D\u6D88\u8CBB\u722D\u8B70\uFF1F","\u8B49\u5238\u4EA4\u6613\u6CD5\u5C0D\u5167\u7DDA\u4EA4\u6613\u6709\u4EC0\u9EBC\u898F\u7BC4\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5438\u6536\u5B58\u6B3E\u8207\u6388\u4FE1\u6709\u54EA\u4E9B\u9650\u5236\uFF1F","\u4FDD\u96AA\u6CD5\u5C0D\u65BC\u696D\u52D9\u54E1\u4E0D\u7576\u62DB\u652C\u7684\u8CAC\u4EFB\u898F\u5B9A\uFF1F","\u9280\u884C\u6CD5\u6709\u591A\u5C11\u689D\u6587\uFF1F","\u8B49\u5238\u71DF\u696D\u54E1\u5E38\u89F8\u72AF\u4EC0\u9EBC\u6CD5\u898F\u6216\u547D\u4EE4\uFF1F","\u6709\u54EA\u4E9B\u6CD5\u898F\u662F\u548C\u58FD\u96AA\u53CA\u7522\u96AA\u76F8\u95DC\u7684\uFF1F"];function Bn(){return`<div class="answer-placeholder">
    <span class="empty-icon">${$("sparkles",26)}</span>
    <h2 class="empty-title">\u7B54\u6848\u53EA\u6703\u4F86\u81EA\u6AA2\u7D22\u5230\u7684\u5224\u6C7A\u53CA\u6CD5\u898F\u7247\u6BB5</h2>
    <p class="empty-text">\u9001\u51FA\u554F\u984C\u5F8C\uFF0C\u7CFB\u7D71\u6703\u5148\u4EE5 Qdrant \u6AA2\u7D22\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\u4E26\u6A19\u793A\u5F15\u7528\u7DE8\u865F\u3002
      \u82E5\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u660E\u78BA\u986F\u793A\u964D\u7D1A\u72C0\u614B\uFF0C\u4E0D\u6703\u6191\u7A7A\u751F\u6210\u7B54\u6848\u3002</p>
  </div>`}var On={"http.request":"FastAPI \u63A5\u6536\u8ACB\u6C42","http.response":"\u56DE\u50B3\u7D50\u679C\u7D66\u524D\u7AEF","rag.answer_question":"RAG \u4E3B\u6D41\u7A0B","rag.coverage":"PostgreSQL \u7D22\u5F15\u8986\u84CB\u6AA2\u67E5","rag.law_retrieval":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22","rag.law_lookup":"\u6BD4\u5C0D\u554F\u984C\u4E2D\u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u540D\u7A31","rag.law_content":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u689D\u6587","rag.qdrant_precheck":"Qdrant collection \u6AA2\u67E5","rag.search":"RAG \u6AA2\u7D22","rag.embed_query":"Ollama embedding \u67E5\u8A62\u5411\u91CF","rag.qdrant_search":"Qdrant \u5411\u91CF\u641C\u5C0B","rag.fetch_documents":"PostgreSQL \u8B80\u53D6\u5224\u6C7A","rag.postgres_fetch":"PostgreSQL \u5224\u6C7A\u67E5\u8A62","rag.build_citations":"\u6574\u7406\u5F15\u7528\u8207\u5224\u6C7A\u7247\u6BB5","rag.extract_excerpt":"\u64F7\u53D6\u76F8\u95DC\u7247\u6BB5","rag.llm":"LLM \u56DE\u7B54\u751F\u6210","rag.llm_request":"Ollama LLM \u751F\u6210","rag.validate_citations":"\u9A57\u8B49\u5F15\u7528\u7DE8\u865F","rag.test_mode":"\u6E2C\u8A66\u6A21\u5F0F\u591A\u6A21\u578B\u6D41\u7A0B","rag.preview_fallback":"\u6CD5\u898F\u9810\u89BD\u964D\u7D1A"};function Fn(e){let t=String(e?.name||""),s=e?.params||{},a=String(s.model||s.embedding_model||"").trim();return t==="rag.llm_request"?`Ollama run ${a||"LLM"}`:t==="rag.llm"?`LLM \u56DE\u7B54\u751F\u6210${a?` \xB7 ${a}`:""}`:t==="rag.embed_query"?`Ollama embedding \u67E5\u8A62\u5411\u91CF${a?` \xB7 ${a}`:""}`:On[t]||t||"backend step"}function Ys(e){return[e?.module,e?.function,e?.name].filter(Boolean).join(" \xB7 ")}function Xs(e){let t=Number(e);return Number.isFinite(t)?`${c(Math.max(0,Math.round(t)))} ms`:"\u2014"}function os(e,t){if(!e)return;e.classList.toggle("is-open",t);let s=e.querySelector("#rag-process-body"),a=e.querySelector(".rag-process-toggle");s&&(s.hidden=!t),a&&(a.setAttribute("aria-expanded",String(t)),a.title=t?"\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B":"\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B")}function Hn(){return`<div class="rag-process is-open" id="rag-process">
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
  </div>`}function Un(e){let t=e.querySelector("#rag-process"),s=t?.querySelector("#rag-process-list"),a=t?.querySelector("#rag-process-summary"),r=performance.now(),i=new Map,o=(v,x,h)=>{let y=v.querySelector(x);y&&(y.textContent=h)},l=v=>{if(v.failed){o(v.element,".rag-process-meta","\u5931\u6557");return}if(v.hasChildren){o(v.element,".rag-process-meta","");return}o(v.element,".rag-process-meta",Xs(v.durationMs))},m=v=>{let x=v-1,h=[...i.values()].reverse();for(let y of h){if(x<0)break;y.depth<=x&&(y.hasChildren||(y.hasChildren=!0,y.element.dataset.hasChildren="true",y.finished&&l(y)),x=y.depth-1)}},b=v=>{if(!s)return null;let x=String(v?.seq??`step-${i.size+1}`),h=i.get(x);if(!h){let y=Math.max(0,Math.min(6,Number(v?.depth)||0));m(y);let N=document.createElement("div");N.className="rag-process-item is-running",N.dataset.processKey=x,N.style.setProperty("--depth",String(y)),N.innerHTML=`<span class="rag-process-dot"></span>
        <span class="rag-process-label"></span>
        <span class="rag-process-meta">\u57F7\u884C\u4E2D\u2026</span>`,s.appendChild(N),h={element:N,depth:y,hasChildren:!1,finished:!1,failed:!1,durationMs:0},i.set(x,h)}return o(h.element,".rag-process-label",Fn(v)),h.element.title=Ys(v),h};return{step:v=>{let x=v?.segment;if(!x)return;let h=b(x);if(h){if(v.type==="segment_start"){h.element.classList.add("is-running"),o(h.element,".rag-process-meta","\u57F7\u884C\u4E2D\u2026");return}if(v.type==="segment_end"){let y=x.status==="error";h.element.classList.remove("is-running"),h.element.classList.toggle("is-error",y),h.finished=!0,h.failed=y,h.durationMs=Number(x.duration_ms)||0,l(h),h.element.title=[Ys(x),y&&x.error||""].filter(Boolean).join(" \xB7 ")}}},finish:(v=!0)=>{if(!t)return"";t.querySelectorAll(".rag-process-item.is-running").forEach(y=>{y.classList.remove("is-running");let N=y.dataset.hasChildren==="true";o(y,".rag-process-meta",N?"":v?"\u5B8C\u6210":"\u4E2D\u65B7")});let x=s?.children.length||i.size,h=Xs(Math.max(0,performance.now()-r));return a&&(a.textContent=v?`\u5B8C\u6210 \xB7 ${x} \u6B65 \xB7 ${h}`:`\u5931\u6557 \xB7 ${x} \u6B65`),t.classList.add("is-complete"),os(t,!1),t.outerHTML},collapse:()=>os(t,!1)}}function zn(e,t=!1){let s=t?"\u6E2C\u8A66\u6A21\u5F0F\uFF1A\u6B63\u5728\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207 LLM \u6A21\u578B\uFF0C\u53EF\u80FD\u9700\u8981\u6578\u5206\u9418\u2026":"\u6B63\u5728\u4EE5\u5411\u91CF\u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\u7247\u6BB5\u4E26\u751F\u6210\u56DE\u7B54\uFF1B\u5FEB\u901F\u6A21\u5F0F\u901A\u5E38 2\u201310 \u79D2\u2026";return`<div class="answer-head">
      <div class="answer-head-left">${$("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u4E2D</span>
      </div>
      <div class="answer-head-meta"><span class="spinner"></span></div>
      ${t?"":Hn()}
    </div>
    <div class="answer-body">
      <p class="answer-text">${s}\u300C${n(e)}\u300D</p>
      <div class="skeleton skeleton-line" style="margin-top:22px;width:92%"></div>
      <div class="skeleton skeleton-line" style="width:76%"></div>
      <div class="skeleton skeleton-line" style="width:84%"></div>
    </div>`}function Gn(e,t){let s=e.score===null||e.score===void 0?"":`\u76F8\u4F3C\u5EA6 ${Number(e.score).toFixed(4)}`,a=[e.court,e.jdate,s].filter(Boolean).map(l=>`<span>${n(l)}</span>`).join(""),r=(Array.isArray(e.matched_laws)?e.matched_laws:[]).slice(0,5).map(l=>`<span class="chip">${n(l)}</span>`).join(""),i=e.jid?` data-action="open-parquet-judgment"
        data-jid="${n(e.jid)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A"
        aria-label="\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A ${n(e.jid)}"`:"",o=e.pdf_url?`<a class="citation-link" href="${n(e.pdf_url)}" target="_blank" rel="noopener noreferrer" title="\u958B\u555F\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF">\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF${$("external",11)}</a>`:"";return`<article class="citation">
    <span class="citation-index">[${e.index??t+1}]</span>
    <div class="citation-body"${i}>
      <h4 class="citation-name">${n(e.jid||"\u672A\u77E5\u6848\u865F")}</h4>
      <div class="citation-meta">${a||"<span>\u5224\u6C7A metadata</span>"}</div>
      ${e.title?`<div class="citation-meta"><span>\u6848\u7531\uFF1A${n(e.title)}</span></div>`:""}
      ${r?`<div class="chips" style="margin-top:8px">${r}</div>`:""}
      ${e.snippet?`<p class="citation-snippet">${n(e.snippet)}</p>`:""}
    </div>
    <div class="citation-links">${o}</div>
  </article>`}function Qn(e,t){let s=[e.law_level,e.law_category,e.article_count?`${c(e.article_count)} \u689D`:""].filter(Boolean).map(r=>`<span>${n(r)}</span>`).join(""),a=e.law_url?`<a class="citation-link" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">\u4F86\u6E90${$("external",11)}</a>`:"";return`<article class="citation">
    <span class="citation-index">${String(e.index??t+1).padStart(2,"0")}</span>
    <div class="citation-body">
      <h4 class="citation-name">${n(e.law_name||"\u672A\u547D\u540D\u6CD5\u898F")}</h4>
      <div class="citation-meta">${s||"<span>\u6CD5\u898F metadata</span>"}</div>
      ${e.snippet?`<p class="citation-snippet">${n(e.snippet)}</p>`:""}
    </div>
    ${a}
  </article>`}function Jn(e,t){let s=e.source_label||(e.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),a=e.law_level&&e.law_level!==s?e.law_level:"",r=[`<span class="badge ${e.source_type==="order"?"badge-warn":"badge-info"}">${n(s)}</span>`,a,e.law_category,e.article_count?`${c(e.article_count)} \u689D`:"",e.law_modified_date?`\u7570\u52D5 ${Pe(e.law_modified_date)}`:""].filter(Boolean).map(x=>`<span>${x}</span>`).join(""),i=e.first_promulgation?`<div class="citation-meta"><span>\u6700\u65E9\u5236\u5B9A\uFF1A${n(e.first_promulgation.roc_date)}\uFF08\u897F\u5143 ${n(e.first_promulgation.gregorian_date)}\uFF09</span></div>`:"",o=e.stats,l=o?`<div class="law-source-stats">
        <span>\u63D0\u53CA\u300C${n(o.entity||"")}\u300D\u7684\u5224\u6C7A ${c(o.judgment_count||0)} \u7B46</span>
        <span>\u672C\u6CD5\u898F\u88AB\u5F15\u7528 ${c(o.law_count||0)} \u6B21</span>
      </div>`:"",m=e.law_key||"",b=e.source_type||"",w=(Array.isArray(e.articles)?e.articles:[]).map(x=>{let h=String(x.article_no||"");return`<div class="law-source-article"${m&&h?` data-action="open-law-source"
        data-law-key="${n(m)}"
        data-source-type="${n(b)}"
        data-article-no="${n(h)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u9078\u67E5\u770B ${n(h)} \u7684\u5B8C\u6574\u5167\u5BB9"
        aria-label="\u958B\u555F ${n(e.law_name||"\u6CD5\u898F")} ${n(h)} \u7684\u5B8C\u6574\u689D\u6587"`:""}>
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
  </article>`}function Vn(e,t=150){let s=String(e||"").replace(/\s+/g," ").trim();return s?s.length>t?`${s.slice(0,t)}\u2026`:s:""}function Wn(e,t){return!Array.isArray(e)||!e.length?`<p class="answer-text">${n(t)}</p>`:`<div class="law-answer-list">${e.map(s=>{let a=s.law_key||"",r=s.source_type||"",i=s.law_name||"\u672A\u547D\u540D\u6CD5\u898F",o=s.source_label||(r==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),l=Number(s.article_count||0),m=s.index!=null?`<span class="law-answer-index">[${n(String(s.index))}]</span>`:"",b=a?`<button class="law-answer-law" type="button"
            data-action="open-law-source"
            data-law-key="${n(a)}"
            data-source-type="${n(r)}"
            title="\u9EDE\u64CA\u958B\u555F ${n(i)} \u7684\u5B8C\u6574\u689D\u6587"
            aria-label="\u958B\u555F ${n(i)} \u7684\u5B8C\u6574\u689D\u6587">${n(i)}</button>`:`<strong>${n(i)}</strong>`,w=Array.isArray(s.articles)?s.articles:[],f=w.length?`<div class="law-answer-articles-label">\u76F8\u95DC\u689D\u6587</div>
          <div class="law-answer-articles">${w.map(v=>{let x=String(v.article_no||"").trim(),h=Vn(v.article_content);return!a||!x?`<div class="law-answer-article is-static">
                  <span class="law-answer-article-no">${n(x||"\u689D\u6587")}</span>
                  <span class="law-answer-article-text">${n(h)}</span>
                </div>`:`<button class="law-answer-article" type="button"
                data-action="open-law-source"
                data-law-key="${n(a)}"
                data-source-type="${n(r)}"
                data-article-no="${n(x)}"
                title="\u9EDE\u64CA\u67E5\u770B ${n(x)} \u7684\u5B8C\u6574\u5167\u5BB9"
                aria-label="\u958B\u555F ${n(i)} ${n(x)} \u7684\u5B8C\u6574\u689D\u6587">
                <span class="law-answer-article-no">${n(x)}</span>
                <span class="law-answer-article-text">${n(h)}</span>
              </button>`}).join("")}</div>`:"";return`<div class="law-answer-source">
        <div class="law-answer-source-head">
          ${b}
          <span class="law-answer-source-meta">\uFF08${n(o)}\uFF0C${c(l)} \u689D\uFF09</span>
          ${m}
        </div>
        ${f}
      </div>`}).join("")}</div>`}function Kn(e,t){if(!Array.isArray(e)||!e.length)return"";let s=new Map((Array.isArray(t)?t:[]).map(a=>[String(a.law_name||""),a]));return`<div class="answer-section-label" style="margin-top:18px">
      <span>\u547D\u4E2D\u8A5E\u5F59</span>
    </div>
    <div class="chips">${e.map(a=>{let r=s.get(String(a));return r?.law_key?`<button class="chip chip-action" type="button"
          data-action="open-law-source"
          data-law-key="${n(r.law_key)}"
          data-source-type="${n(r.source_type||"")}"
          title="\u9EDE\u64CA\u958B\u555F ${n(a)} \u7684\u5B8C\u6574\u689D\u6587"
          aria-label="\u958B\u555F ${n(a)} \u7684\u5B8C\u6574\u689D\u6587">${n(a)}</button>`:`<span class="chip">${n(a)}</span>`}).join("")}</div>`}function Zs(e){let t=Array.isArray(e.citations)?e.citations:[],s=Array.isArray(e.judgments)?e.judgments:[],a=Array.isArray(e.law_sources)?e.law_sources:[],r=Array.isArray(e.matched_terms)?e.matched_terms:[],i=e.status||"preview",o=!!e.partial,l=!!e.streaming,m=!!e.show_sources||!o,b=s.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u5224\u6C7A \xB7 ${s.length} \u7B46</span>
        <span>vector retrieval \xB7 [\u7DE8\u865F] \u5C0D\u61C9\u56DE\u7B54\u5F15\u7528</span>
      </div>
      <div class="citation-list">${s.map((H,de)=>Gn(H,de)).join("")}</div>`:"",w=a.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4 \xB7 ${a.length} \u7B46</span>
        <span>PostgreSQL metadata \xB7 Parquet \u689D\u6587</span>
      </div>
      <div class="citation-list">${a.map((H,de)=>Jn(H,de)).join("")}</div>`:"",f=!s.length&&t.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F \xB7 ${t.length} \u7B46</span>
        <span>metadata match</span>
      </div>
      <div class="citation-list">${t.map((H,de)=>Qn(H,de)).join("")}</div>`:"",v=m?b+w+f:"";!v&&!o&&(v=`<div class="answer-divider"></div>
      ${ye({iconName:"file",title:"\u6C92\u6709\u53EF\u5F15\u7528\u7684\u4F86\u6E90",text:i==="retrieval_only"?"\u76EE\u524D\u5DF2\u5EFA\u7ACB\u7684\u5411\u91CF\u7D22\u5F15\u4E2D\u6C92\u6709\u8DB3\u5920\u76F8\u4F3C\u7684\u5224\u6C7A\uFF0C\u4E5F\u6C92\u6709\u53EF\u5C0D\u61C9\u7684\u6CD5\u898F\u6216\u547D\u4EE4\u3002\u7CFB\u7D71\u4E0D\u6703\u5728\u6C92\u6709\u4F86\u6E90\u6642\u751F\u6210\u7B54\u6848\u3002":"\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u4E14\u554F\u984C\u4E2D\u6C92\u6709\u53EF\u76F4\u63A5\u5C0D\u61C9\u7684\u73FE\u884C\u6CD5\u898F\u540D\u7A31\u3002"})}`);let x=Kn(r,a),h=e.test_run,y=String(e.llm_model||h?.primary_model||"").trim(),N=String(e.embedding_model||"").trim(),M=[y?`LLM\uFF1A${y}`:"",N?`Embedding\uFF1A${N}`:""].filter(Boolean).join(" \xB7 "),_=e.answer_source==="structured",E=String(e.law_answer||"").trim(),z=e.law_framework||null,G=Array.isArray(z?.rows)?z.rows:[],X=Array.isArray(z?.sources)?z.sources:[],se=G.length>0,R=!!E&&!_&&!se,P=l||e.answer_source==="llm"?"LLM \u7D9C\u5408\u56DE\u7B54":"\u6AA2\u7D22\u7D50\u679C\u6458\u8981",k=se?`<div class="answer-block law-framework-block">
        <div class="answer-block-head">
          <span>${n(z.title||"\u76F8\u95DC\u6CD5\u898F\u7684\u8CAC\u4EFB\u67B6\u69CB")}</span>
          <span>${G.length} \u689D</span>
        </div>
        <div class="table-wrap law-framework-table-wrap">
          <table class="data-table is-compact law-framework-table">
            <thead>
              <tr><th scope="col">\u6CD5\u898F</th><th scope="col">\u689D\u6587</th><th scope="col">\u898F\u7BC4\u91CD\u9EDE</th></tr>
            </thead>
            <tbody>
              ${G.map(H=>`<tr>
                    <td>${n(H.law_name||"\u2014")}</td>
                    <td class="cell-number">${n(H.article_no||"\u2014")}</td>
                    <td>${n(H.focus||"\u2014")}</td>
                  </tr>`).join("")}
            </tbody>
          </table>
        </div>
        ${X.length?`<div class="law-framework-sources">
                <span>\u6CD5\u898F\u4F86\u6E90</span>
                ${X.map(H=>`<span class="chip">${n(H.law_name||H)}${H&&H.index!==null&&H.index!==void 0?` [${n(H.index)}]`:""}</span>`).join("")}
              </div>`:""}
      </div>`:"",q=e.answer_source==="llm"&&y?`<span class="answer-model" title="${n(M)}">${$("brain",11)}${n(y)}</span>`:_?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${$("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"",B=l?`${y||"LLM"} \xB7 \u751F\u6210\u4E2D`:q?y||"structured":"retrieval",Q=h?`<div class="test-run-summary">
        <div class="test-run-summary-head">
          <span class="badge badge-warn">\u6E2C\u8A66\u6A21\u5F0F</span>
          ${K(h.status)}
          <span class="mono">${n(h.run_id||"")}</span>
        </div>
        <div class="test-run-summary-body">
          <span>Embedding ${Number(h.models?.embedding?.length||0)} \u500B</span>
          <span>LLM ${Number(h.models?.llm?.length||0)} \u500B</span>
          <span>\u4E3B\u56DE\u7B54 ${n(h.primary_model||"\u2014")}</span>
          <span>${Number(h.total_ms||0)} ms</span>
          <a href="#/performance">\u67E5\u770B\u6E2C\u8A66 Flow</a>
        </div>
      </div>`:"",Te=String(e.answer||"").trim()||(l?"\u6B63\u5728\u751F\u6210\u56DE\u7B54\u2026":o?"\u6B63\u5728\u6AA2\u7D22\u5224\u6C7A\u4E26\u751F\u6210 LLM \u56DE\u7B54\u2026":"\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u56DE\u7B54\u3002"),le=l?" data-partial-answer":"",$e=l?" is-streaming":"";return`${k}
      ${R?`<div class="answer-block law-answer-block">
              <div class="answer-block-head">
                <span>\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22\u7D50\u679C</span>
                <span>${o&&!m?"\u6CD5\u898F\u8CC7\u6599\u5EAB":`${a.length} \u7B46\u4F86\u6E90`}</span>
              </div>
              <div class="law-answer-content">${Wn(a,E)}</div>
            </div>`:""}
      <div class="answer-block">
        ${R||se?`<div class="answer-block-head">
                <span>${n(P)}</span>
                <span>${n(B)}</span>
              </div>`:""}
        <p class="answer-text${$e}"${le}>${n(Te)}</p>
      </div>
      ${e.notice?`<div class="answer-notice">${n(e.notice)}</div>`:""}
      ${Q}
      ${x}
      ${v}`}function Yn(e,t,s=""){let a=t.status||"preview",r=a==="operational"?"\u5B8C\u6210":a==="retrieval_only"?"\u50C5\u6AA2\u7D22\u7D50\u679C":a==="preview"?"\u6CD5\u898F\u9810\u89BD":a==="unavailable"||a==="not_configured"?"\u8CC7\u6599\u4E0D\u53EF\u7528":a==="degraded"?"\u964D\u7D1A":"\u5B8C\u6210",i=t.test_run,o=String(t.llm_model||i?.primary_model||"").trim(),l=String(t.embedding_model||"").trim(),m=[o?`LLM\uFF1A${o}`:"",l?`Embedding\uFF1A${l}`:""].filter(Boolean).join(" \xB7 "),b=t.answer_source==="structured",w=t.answer_source==="llm"&&o?`<span class="answer-model" title="${n(m)}">${$("brain",11)}${n(o)}</span>`:b?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${$("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"";return`<div class="answer-head">
      <div class="answer-head-left">${$("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u7D50\u679C</span>
      </div>
      <div class="answer-head-meta">
        ${K(a,r)}
        <span>${Number(t.duration_ms||0)} ms</span>
        ${w}
      </div>
      ${s}
    </div>
    <div class="answer-body">${Zs(t)}</div>`}function Xn(e,t=""){return`<div class="answer-head">
      <div class="answer-head-left">${$("alert",16)}
        <span class="answer-head-title">\u7121\u6CD5\u5B8C\u6210\u6AA2\u7D22</span>
      </div>
      ${t}
    </div>
    <div class="answer-body">
      ${Y({tone:"danger",title:"\u8ACB\u6C42\u5931\u6557",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
    </div>`}function Zn(e){return e.length?e.map((t,s)=>{let a=Array.isArray(t.payload?.citations)?t.payload.citations.length:0,r=Array.isArray(t.payload?.judgments)?t.payload.judgments.length:0,i=Array.isArray(t.payload?.law_sources)?t.payload.law_sources.length:0,o=a+r+i;return`<button class="history-item" type="button" data-history-index="${s}">
        <span class="history-question">${n(t.title||"\u672A\u547D\u540D\u63D0\u554F")}</span>
        <span class="history-meta">
          <span>${n(tt(t.created_at))}</span>
          <span>\xB7</span>
          <span>${o?`${o} \u7B46\u4F86\u6E90`:"\u7121\u5F15\u7528"}</span>
        </span>
      </button>`}).join(""):'<div class="history-empty">\u5C1A\u7121\u63D0\u554F\u7D00\u9304\u3002\u9001\u51FA\u7B2C\u4E00\u500B\u554F\u984C\u5F8C\u6703\u4FDD\u5B58\u5728\u6B64\u700F\u89BD\u5668\u3002</div>'}async function er(e){let t=!1,s=[],a="",r=!1,i={embedding:[],llm:[]};e.innerHTML=`<section class="page rag-page">
    <header class="rag-hero">
      <span class="eyebrow">JUDGMENT \xB7 LEGAL RAG</span>
      <h1 class="rag-title">\u8B93\u6BCF\u4E00\u500B\u7B54\u6848\uFF0C\u90FD\u80FD\u56DE\u5230\u6CD5\u898F\u8207\u5224\u6C7A</h1>
      <p class="rag-lead">\u4EE5\u91D1\u878D\u6CD5\u898F\u7684\u73FE\u884C\u689D\u6587\u8207\u5224\u6C7A\u7247\u6BB5\u70BA\u6AA2\u7D22\u57FA\u790E\u3002
        \u5148\u5F9E Qdrant \u6AA2\u7D22\u76F8\u4F3C\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\uFF1B\u82E5\u7D22\u5F15\u6216\u6A21\u578B\u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u53EF\u9A57\u8B49\u7684\u6AA2\u7D22\u7D50\u679C\u3002</p>
      <div id="rag-mode-notice">${Y({tone:"info",title:"RAG \u670D\u52D9\u72C0\u614B\u6AA2\u67E5\u4E2D",text:"\u6B63\u5728\u78BA\u8A8D Qdrant\u3001Embedding \u8207 LLM \u72C0\u614B\uFF1B\u6240\u6709\u56DE\u7B54\u90FD\u6703\u6A19\u793A\u53EF\u56DE\u6EAF\u7684\u4F86\u6E90\u3002"})}</div>
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
        ${Dn.map(u=>`<button class="example-chip" type="button" data-question="${n(u)}">${n(u)}</button>`).join("")}
      </div>
    </header>

    <div class="rag-grid">
      <section class="card answer-card" id="answer-card" aria-live="polite">
        ${Bn()}
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
  </section>`;let o=e.querySelector("#rag-form"),l=e.querySelector("#rag-question"),m=e.querySelector("#rag-submit"),b=e.querySelector("#answer-card"),w=e.querySelector("#rag-stats"),f=e.querySelector("#rag-stats-mode"),v=e.querySelector("#rag-history"),x=e.querySelector("#rag-storage-note"),h=e.querySelector("#rag-clear-history"),y=e.querySelector("#rag-test-mode"),N=e.querySelector("#rag-test-flow"),M=e.querySelector("#rag-judgment-dialog"),_=e.querySelector("#rag-law-dialog"),E=()=>{document.documentElement.classList.toggle("dialog-open",!!e.querySelector("dialog[open]"))};M?.addEventListener("close",E),_?.addEventListener("close",E);let z=null,G=null,X=()=>{l.style.height="auto",l.style.height=`${Math.min(l.scrollHeight,220)}px`},se=async()=>{try{if(s=await _t({limit:6}),t)return;v.innerHTML=Zn(s),x.textContent=yt()==="indexeddb"?"\u63D0\u554F\u7D00\u9304\u5132\u5B58\u5728\u700F\u89BD\u5668 IndexedDB\uFF0C\u4E0D\u6703\u4E0A\u50B3\u5230\u4F3A\u670D\u5668\u3002":"\u700F\u89BD\u5668\u5132\u5B58\u4E0D\u53EF\u7528\uFF0C\u63D0\u554F\u7D00\u9304\u53EA\u4FDD\u7559\u5728\u672C\u6B21\u5DE5\u4F5C\u968E\u6BB5\u3002"}catch{if(t)return;v.innerHTML='<div class="history-empty">\u7121\u6CD5\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u3002</div>'}},R=async()=>{try{let u=await U.status();if(t)return;let A=u.data||{},I=new Map((u.services||[]).map(Be=>[Be.id,Be])),ne=I.get("qdrant"),ce=I.get("embedding"),re=I.get("rag"),pe=I.get("llm"),ie=Number(A.judgment_indexed_count||0),J=Number(A.judgment_count||0),ge=J?(ie/J*100).toFixed(1):"0.0",Le=A.judgment_vector_points===null||A.judgment_vector_points===void 0?"\u2014":c(A.judgment_vector_points);w.innerHTML=`<div class="mini-stats">
          <div class="mini-stat">
            <div class="mini-stat-value">${c(J)}</div>
            <div class="mini-stat-label">\u5224\u6C7A</div>
          </div>
          <div class="mini-stat">
            <div class="mini-stat-value">${c(ie)}</div>
            <div class="mini-stat-label">\u5DF2\u7D22\u5F15</div>
          </div>
          <div class="mini-stat">
            <div class="mini-stat-value">${ge}%</div>
            <div class="mini-stat-label">\u7D22\u5F15\u8986\u84CB</div>
          </div>
        </div>
        <div class="side-status-list">
          <div class="side-status-row">
            <span>${$("cube",13)}Qdrant \u5411\u91CF\u7D22\u5F15</span>
            ${K(ne?.status,ne?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
          </div>
          <div class="side-status-row">
            <span>${$("layers",13)}Embedding\uFF08${n(A.judgment_vector_model||"\u2014")}\uFF09</span>
            ${K(ce?.status,ce?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
          </div>
          <div class="side-status-row">
            <span>${$("brain",13)}RAG \u56DE\u7B54\u7BA1\u7DDA</span>
            ${K(re?.status,re?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
          </div>
          <div class="side-status-row">
            <span>${$("sparkles",13)}LLM \u6A21\u578B</span>
            ${K(pe?.status,pe?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
          </div>
        </div>
        <div class="side-card-foot" style="padding:0;border:0;margin-top:10px">
          Collection\uFF1A${n(A.judgment_vector_collection||"\u2014")} \xB7
          ${Le} points \xB7 \u5269\u9918 ${c(A.judgment_index_remaining)} \u7B46\u5F85\u7D22\u5F15
        </div>`;let ke=e.querySelector("#rag-mode-notice");ke&&(re?.status==="operational"?ke.innerHTML=Y({tone:"ok",title:"\u6AA2\u7D22\u8207\u56DE\u7B54\u5C31\u7DD2",text:`Qdrant\u3001Embedding \u8207 LLM \u5747\u53EF\u4F7F\u7528\uFF1B\u76EE\u524D\u7D22\u5F15\u6DB5\u84CB ${c(ie)} / ${c(J)} \u7B46\u5224\u6C7A\u3002\u56DE\u7B54\u4E0D\u662F\u6CD5\u5F8B\u610F\u898B\u3002`}):re?.status==="degraded"?ke.innerHTML=Y({tone:"warn",title:"\u90E8\u5206 AI \u5143\u4EF6\u672A\u5C31\u7DD2",text:n(re.detail||"RAG \u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u6AA2\u7D22\u7D50\u679C\u3002")}):ke.innerHTML=Y({tone:"info",title:"\u5411\u91CF\u7D22\u5F15\u5C1A\u672A\u5C31\u7DD2 \xB7 \u4E0D\u662F\u6CD5\u5F8B\u610F\u898B",text:n(re?.detail||"\u8A2D\u5B9A QDRANT_URL\u3001EMBEDDING_URL \u8207 LLM_URL \u4E26\u57F7\u884C judgment-index-vectors \u5F8C\u5373\u53EF\u555F\u7528\u5224\u6C7A\u6AA2\u7D22\u3002")})),f.className=`badge ${re?.status==="operational"?"badge-ok":re?.status==="not_configured"?"badge-neutral":"badge-warn"} badge-mono`,f.textContent=re?.status==="operational"?"RAG \u5C31\u7DD2":re?.status==="not_configured"?"\u672A\u8A2D\u5B9A":"\u964D\u7D1A"}catch{if(t)return;w.innerHTML='<p class="muted" style="font-size:11px">\u76EE\u524D\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002</p>',f.className="badge badge-danger badge-mono",f.textContent="\u96E2\u7DDA"}},P=()=>{if(!y)return;if(!r){y.innerHTML="";return}let u=Array.isArray(i.embedding)?i.embedding.length:0,A=Array.isArray(i.llm)?i.llm.length:0;y.innerHTML=Y({tone:"warn",title:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F",text:`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${u} \u500B embedding \u8207 ${A} \u500B LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002\u6E2C\u8A66 Flow \u6703\u5728\u9801\u9762\u4E0B\u65B9\u5373\u6642\u986F\u793A\uFF0C\u4E5F\u53EF\u5230 <a href="#/tests">\u7CFB\u7D71\u6E2C\u8A66</a> \u6216 <a href="#/performance">\u6548\u80FD\u5831\u8868</a> \u67E5\u770B\u6B77\u53F2\u3002`})},k=async()=>{try{let u=await U.testMode();if(t)return;r=!!u.enabled,i=u.models||{embedding:[],llm:[]},P()}catch{if(t)return;r=!1,P()}},q=u=>{r=!!u.detail?.enabled,i=u.detail?.models||{embedding:[],llm:[]},P()};window.addEventListener("judgment:test-mode",q);let B=u=>{N&&(G=u||null,N.innerHTML=u?at(u,[],"",{showHistory:!1}):"")},Q=()=>{z&&(window.clearTimeout(z),z=null)},be=()=>{Q();let u=async()=>{if(!t){try{let A=await U.testRunCurrent();if(t)return;let I=A.run;I&&I.status==="running"&&B(I)}catch{}t||(z=window.setTimeout(u,1500))}};u()},Te=async u=>{if(!u){B(null);return}try{let A=await U.testRun(u);if(t)return;B(A.run||null)}catch{t||D("\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF0C\u4F46\u7121\u6CD5\u8F09\u5165\u6E2C\u8A66 Flow\u3002","warn")}},le=async()=>{if(r)try{let u=await U.testRunCurrent();if(t)return;u.run?.status==="running"&&(B(u.run),be())}catch{}},$e=0,H=(u,A)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">DB ORIGINAL JUDGMENT</div>
      <h2>${n(u)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-parquet-judgment" aria-label="\u95DC\u9589">${$("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${A}</div>`,de=u=>{let A=(Array.isArray(u.matched_laws)?u.matched_laws:[]).map(re=>`<span class="chip">${n(re)}</span>`).join(""),I=[u.court,u.jdate,u.title?`\u6848\u7531\uFF1A${u.title}`:"",u.full_text_length?`${c(u.full_text_length)} \u5B57`:"",u.citation_count?`\u5F15\u7528 ${c(u.citation_count)} \u7B46`:""].filter(Boolean).map(re=>`<span>${n(re)}</span>`).join(""),ne=u.parquet_generated_at?`DB \u5132\u5B58\u539F\u6587\uFF08\u539F\u59CB Parquet\uFF09\xB7 ${n(String(u.parquet_generated_at).replace("T"," ").slice(0,19))}`:"DB \u5132\u5B58\u539F\u6587",ce=u.pdf_url?`<a class="btn btn-secondary btn-sm" href="${n(u.pdf_url)}" target="_blank" rel="noopener noreferrer">${$("external",13)}<span>\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF</span></a>`:"";return H(u.jid||"\u5224\u6C7A\u5168\u6587",`<div class="judgment-dialog-meta">
        <span class="badge badge-info">${n(u.source==="parquet"?"DB \u5132\u5B58\u539F\u6587":"PostgreSQL")}</span>
        ${I}
      </div>
      ${A?`<div class="chips" style="margin:8px 0 10px">${A}</div>`:""}
      <div class="judgment-dialog-source">${ne}</div>
      <pre class="judgment-dialog-text">${n(u.full_text||"\u6B64\u5224\u6C7A\u6C92\u6709\u5168\u6587\u3002")}</pre>
      <div class="judgment-dialog-actions">
        ${ce}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-parquet-judgment">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},Ie=async u=>{if(!M||!u)return;let A=++$e;M.open||M.showModal(),E(),M.innerHTML=H("\u8B80\u53D6\u5224\u6C7A\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E DB \u5132\u5B58\u539F\u6587\u8B80\u53D6 ${n(u)}\u2026</span>
      </div>`);try{let I=await U.judgmentDetail(u,"parquet");if(t||A!==$e)return;M.innerHTML=de(I)}catch(I){if(t||A!==$e)return;M.innerHTML=H("\u7121\u6CD5\u8B80\u53D6 DB \u539F\u6587\u5224\u6C7A",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${n(I.message||"\u627E\u4E0D\u5230\u5224\u6C7A\u5168\u6587\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u5DF2\u57F7\u884C <span class="mono">uv run judgment-import-judgments --raw-only</span>\uFF0C\u4E14\u539F\u59CB Parquet \u5B58\u5728\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-parquet-judgment">\u95DC\u9589</button>
        </div>`)}},Se=0,qe=(u,A)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">LOCAL PARQUET LAW</div>
      <h2>${n(u)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-law-source" aria-label="\u95DC\u9589">${$("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${A}</div>`,Ae=(u,A="")=>{let I=String(u.selected_article_no||A||"").trim(),ne=!!I,re=(Array.isArray(u.articles)?u.articles:[]).map(je=>{let it=String(je.article_content||"").trim();return it?je.article_type==="C"?`<div class="law-chapter">${n(it)}</div>`:`<article class="law-article">
          <div class="law-article-head">
            <span class="law-article-no">${n(je.article_no||"\u689D\u6587")}</span>
          </div>
          <div class="law-article-text">${n(it)}</div>
        </article>`:""}).join(""),pe=(Array.isArray(u.warnings)?u.warnings:[]).map(je=>n(je)).join("<br />"),ie=u.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F",J=u.meta?.articles_source,ge=J==="parquet"?"Parquet \u689D\u6587":J==="postgresql"?"PostgreSQL \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",Le=u.meta?.snapshot||"",ke=[u.law_level,u.law_category,u.article_count?`${c(u.article_count)} \u689D`:"",u.law_modified_date?`\u7570\u52D5 ${Pe(u.law_modified_date)}`:""].filter(Boolean).map(je=>`<span>${n(je)}</span>`).join(""),Be=u.law_url?`<a class="btn btn-secondary btn-sm" href="${n(u.law_url)}" target="_blank" rel="noopener noreferrer">${$("external",13)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:"",xe=!ne&&u.law_histories?`<details class="law-dialog-history">
          <summary>\u6CD5\u898F\u6CBF\u9769</summary>
          <div>${n(u.law_histories)}</div>
        </details>`:"",mt=ne?`<span class="badge badge-mono">${n(I)}</span>`:"",vt=ne?`${u.law_name||u.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4"} \xB7 ${I}`:u.law_name||u.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4";return qe(vt,`<div class="judgment-dialog-meta">
        <span class="badge ${u.source_type==="order"?"badge-warn":"badge-info"}">${n(ie)}</span>
        ${mt}
        ${ke}
      </div>
      <div class="judgment-dialog-source">${n([ge,Le].filter(Boolean).join(" \xB7 "))}</div>
      ${pe?`<div class="law-dialog-warning">${pe}</div>`:""}
      ${xe}
      <div class="law-dialog-articles">${re||`<div class="report-empty-inline">${ne?"\u9019\u689D\u689D\u6587\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u5167\u5BB9\u3002":"\u9019\u500B\u6CD5\u898F\uFF0F\u547D\u4EE4\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u3002"}</div>`}</div>
      <div class="judgment-dialog-actions">
        ${Be}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-law-source">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},De=async(u,A="",I="")=>{if(!_||!u)return;let ne=++Se;_.open||_.showModal(),E(),_.innerHTML=qe(I?"\u8B80\u53D6\u6CD5\u898F\u689D\u6587\u4E2D\u2026":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E\u672C\u5730 Parquet \u8B80\u53D6 ${n([u,I].filter(Boolean).join(" \xB7 "))} \u7684\u539F\u59CB\u689D\u6587\u2026</span>
      </div>`);try{let ce=await U.lawDetail(u,A,"",I);if(t||ne!==Se)return;_.innerHTML=Ae(ce,I)}catch(ce){if(t||ne!==Se)return;_.innerHTML=qe("\u7121\u6CD5\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u6587",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${n(ce.message||"\u627E\u4E0D\u5230\u689D\u6587\u5167\u5BB9\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u672C\u5730\u539F\u59CB\u6CD5\u898F Parquet \u5B58\u5728\uFF0C\u4E14 PostgreSQL metadata \u8207\u5176\u4E00\u81F4\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-law-source">\u95DC\u9589</button>
        </div>`)}};_?.addEventListener("click",u=>{if(u.target.closest('[data-action="close-law-source"]')){_.close();return}let A=_.getBoundingClientRect();(u.clientX<A.left||u.clientX>A.right||u.clientY<A.top||u.clientY>A.bottom)&&_.close()}),M?.addEventListener("click",u=>{if(u.target.closest('[data-action="close-parquet-judgment"]')){M.close();return}let A=M.getBoundingClientRect();(u.clientX<A.left||u.clientX>A.right||u.clientY<A.top||u.clientY>A.bottom)&&M.close()}),b.addEventListener("click",u=>{let A=u.target.closest(".rag-process-toggle");if(A){let ne=A.closest(".rag-process"),ce=A.getAttribute("aria-expanded")==="true";os(ne,!ce);return}let I=u.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(I){if(I.dataset.action==="open-law-source"){De(I.dataset.lawKey||"",I.dataset.sourceType||"",I.dataset.articleNo||"");return}Ie(I.dataset.jid||"")}}),b.addEventListener("keydown",u=>{if(u.key!=="Enter"&&u.key!==" ")return;let A=u.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(!(!A||A.closest("a, button"))){if(u.preventDefault(),A.dataset.action==="open-law-source"){De(A.dataset.lawKey||"",A.dataset.sourceType||"",A.dataset.articleNo||"");return}Ie(A.dataset.jid||"")}});let C=async u=>{let A=u.trim();if(!A){D("\u8ACB\u5148\u8F38\u5165\u554F\u984C\u3002","warn"),l.focus();return}a=A,l.value=A,X(),b.innerHTML=zn(A,r);let I=r?null:Un(b);r?(B(null),be()):(Q(),B(null)),V(m,!0,"\u6AA2\u7D22\u4E2D\u2026");let ne=null,ce="",re=J=>{if(t||!J?.partial)return;let ge=b.querySelector(".answer-body");if(!ge)return;ne=J,ce=String(J.answer||""),ge.innerHTML=Zs(J),I?.collapse?.();let Le=b.querySelector(".answer-head-title");Le&&(Le.textContent=J.streaming?"LLM \u56DE\u7B54\u751F\u6210\u4E2D":"\u6CD5\u898F\u7D50\u679C\u5DF2\u986F\u793A")},pe=J=>{if(t||!J||!ne?.streaming)return;ce+=J;let ge=b.querySelector("[data-partial-answer]");ge&&(ge.textContent=ce)},ie=()=>{if(t||!ne?.streaming)return;ce="";let J=b.querySelector("[data-partial-answer]");J&&(J.textContent="\u6B63\u5728\u91CD\u65B0\u751F\u6210\u56DE\u7B54\u2026")};try{let J=r?await U.rag(A,{testMode:r}):await U.ragStream(A,{onStep:xe=>I?.step(xe),onPartial:re,onToken:pe,onTokenReset:ie});if(t)return;Q();let ge=I?.finish(!0)||"";b.innerHTML=Yn(A,J,ge),J.test_run?.run_id?await Te(J.test_run.run_id):B(null);let Le=Array.isArray(J.citations)?J.citations:[],ke=Array.isArray(J.judgments)?J.judgments:[],Be=Le.length+ke.length;await wt({kind:"rag",title:A,detail:`${J.status||"preview"} \xB7 ${Be} \u7B46\u4F86\u6E90`,payload:{question:A,status:J.status,citations:Le.map(xe=>xe.law_name),judgments:ke.map(xe=>xe.jid)}}),await se()}catch(J){if(Q(),t)return;let ge=I?.finish(!1)||"";b.innerHTML=Xn(J,ge),D(J.message||"\u6AA2\u7D22\u5931\u6557\u3002","danger")}finally{Q(),t||V(m,!1)}};return o.addEventListener("submit",u=>{u.preventDefault(),C(l.value)}),l.addEventListener("input",X),l.addEventListener("keydown",u=>{u.key==="Enter"&&!u.shiftKey&&!u.isComposing&&(u.preventDefault(),o.requestSubmit())}),e.querySelector("#example-chips").addEventListener("click",u=>{let A=u.target.closest("[data-question]");A&&(l.value=A.dataset.question,X(),o.requestSubmit())}),v.addEventListener("click",u=>{let A=u.target.closest("[data-history-index]");if(!A)return;let I=s[Number(A.dataset.historyIndex)];I&&(l.value=I.title,X(),C(I.title))}),h.addEventListener("click",async()=>{if(!s.length){D("\u76EE\u524D\u6C92\u6709\u53EF\u6E05\u9664\u7684\u63D0\u554F\u7D00\u9304\u3002","info");return}window.confirm("\u78BA\u5B9A\u6E05\u9664\u9019\u500B\u700F\u89BD\u5668\u7684\u6240\u6709\u63D0\u554F\u7D00\u9304\uFF1F")&&(await Ls(),await se(),D("\u5DF2\u6E05\u9664\u672C\u6A5F\u63D0\u554F\u7D00\u9304\u3002","ok"))}),X(),await Promise.allSettled([R(),se(),k()]),await le(),()=>{t=!0,Q(),document.documentElement.classList.remove("dialog-open"),window.removeEventListener("judgment:test-mode",q),a&&b.setAttribute("data-last-question",a)}}var cs={};Qe(cs,{render:()=>Lr});var tr=2e3,sr={running:{label:"\u57F7\u884C\u4E2D",tone:"info"},success:{label:"\u5B8C\u6210",tone:"ok"},failed:{label:"\u5931\u6557",tone:"danger"},interrupted:{label:"\u5DF2\u4E2D\u6B62",tone:"warn"},stale:{label:"\u72C0\u614B\u5931\u6548",tone:"warn"},skipped:{label:"\u7565\u904E",tone:"idle"},pending:{label:"\u7B49\u5F85",tone:"idle"},idle:{label:"\u5F85\u547D",tone:"idle"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},operational:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},unavailable:{label:"\u7121\u6CD5\u53D6\u5F97",tone:"danger"},missing:{label:"\u5C1A\u7121\u7D00\u9304",tone:"idle"},error:{label:"\u8B80\u53D6\u5931\u6557",tone:"danger"},ok:{label:"\u6B63\u5E38",tone:"ok"}},ea={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},ta={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},oa={judgment:"\u5224\u6C7A",law:"\u6CD5\u898F",order:"\u547D\u4EE4",system:"\u7CFB\u7D71"},qt={judgment:"#a78bfa",law:"#22d3ee",order:"#f472b6",system:"#94a3b8"},ar={extract:"file",raw_parquet:"cube",filter:"filter",postgres:"database",qdrant:"brain",download:"download",parse:"sliders"},nr={raw_parquet:"\u539F\u59CB Parquet",postgres:"PostgreSQL"};function pt(e){return sr[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function he(e,t){let s=pt(e);return`<span class="badge ${ea[s.tone]||ea.idle}"><span class="status-dot ${ta[s.tone]||ta.idle}"></span>${n(t||s.label)}</span>`}function Ze(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function sa(e){return e==null?"\u7121\u6CD5\u53D6\u5F97":c(e)}function nt(e){return e&&e.color?String(e.color):"var(--accent)"}function jt(e,t=""){let s=e.percent===null||e.percent===void 0?null:Math.max(0,Math.min(100,Number(e.percent)||0)),a=e.status==="running"&&s===null,r=a?' aria-valuetext="\u9032\u5EA6\u672A\u77E5"':` aria-valuenow="${s??0}"`;return`<div class="processing-bar${a?" is-indeterminate":""}${t?` ${t}`:""}" role="progressbar" aria-valuemin="0" aria-valuemax="100"${r}>
    <span class="processing-bar-fill" style="width:${s??0}%;background:${n(nt(e))}"></span>
  </div>`}function rr(e){let t=e.unit==="bytes"?"":e.unit||"\u7B46",s=e.current,a=e.total;return s==null?e.status==="running"?"\u9032\u884C\u4E2D":"\u2014":e.unit==="bytes"?a?`${O(s)} / ${O(a)}`:O(s):a?`${c(s)} / ${c(a)} ${t}`:`${c(s)} ${t}`}function ir(e){let t=[`<span>${n(rr(e))}</span>`];return e.percent===null||e.percent===void 0?e.status==="running"&&t.push('<span class="mono">\u9032\u5EA6\u672A\u77E5</span>'):t.push(`<span class="mono">${Ze(e.percent)}</span>`),e.duration_ms&&t.push(`<span class="mono">${F(e.duration_ms)}</span>`),t.join("")}function or(e){let s=(Array.isArray(e.stats)?e.stats:[]).map(r=>`<span class="processing-stage-stat"><span>${n(r.label)}</span><strong>${n(r.value)}</strong></span>`),a=e.coverage;return a&&a.indexed!==null&&a.indexed!==void 0&&a.total!==null&&a.total!==void 0&&s.push(`<span class="processing-stage-stat"><span>\u7D22\u5F15\u8986\u84CB</span><strong>${c(a.indexed)} / ${c(a.total)}</strong></span>`),s.length?`<div class="processing-stage-stats">${s.join("")}</div>`:""}function lr(e,{compact:t=!1,step:s=null}={}){let a=pt(e.status),r=e.status==="running";return`<div class="processing-stage${t?" is-compact":""} is-${a.tone}${r?" is-live":""}" style="--stage-color:${n(nt(e))}"${r?' aria-current="step"':""}>
    <div class="processing-stage-head">
      ${s===null?"":`<span class="processing-stage-step">${String(s).padStart(2,"0")}</span>`}
      <span class="processing-stage-swatch" style="background:${n(nt(e))}"></span>
      <span class="processing-stage-label">${n(e.label||e.key)}</span>
      ${he(e.status)}
    </div>
    ${jt(e)}
    <div class="processing-stage-meta">${ir(e)}</div>
    ${e.message?`<div class="processing-stage-message" title="${n(e.message)}">${n(e.message)}</div>`:""}
    ${t?"":or(e)}
  </div>`}function la(e){let t=pt(e);return`<span class="flow-status is-${t.tone}"><span class="flow-status-dot"></span>${n(t.label)}</span>`}function aa(e,t){return t==null||t===""?"\u2014":e.unit==="bytes"?O(t):c(t)}function cr(e){let t=[{label:"\u76EE\u524D",value:aa(e,e.current)},{label:"\u7E3D\u91CF",value:aa(e,e.total)},{label:"\u767E\u5206\u6BD4",value:e.percent===null||e.percent===void 0?e.status==="running"?"\u8A08\u7B97\u4E2D":"\u2014":Ze(e.percent)},{label:"\u8017\u6642",value:e.duration_ms?F(e.duration_ms):"\u2014"}],s=Array.isArray(e.stats)?e.stats:[];for(let r of s){if(t.length>=6)break;r&&r.label&&r.value&&t.push({label:String(r.label),value:String(r.value)})}let a=e.coverage;return a&&a.indexed!==null&&a.indexed!==void 0&&a.total!==null&&a.total!==void 0&&!t.some(r=>r.label==="\u7D22\u5F15\u8986\u84CB")&&t.push({label:"\u7D22\u5F15\u8986\u84CB",value:`${c(a.indexed)} / ${c(a.total)}`}),t}function dr(e,t){let s=pt(e.status),a=e.status==="running",r=cr(e);return`<article class="flow-node is-${s.tone}${a?" is-live":""}" style="--stage-color:${n(nt(e))}"${a?' aria-current="step"':""}>
    <div class="flow-node-head">
      <span class="flow-node-icon">${$(ar[e.key]||"cube",14)}</span>
      <div class="flow-node-heading">
        <span class="flow-node-kicker">STEP ${String(t+1).padStart(2,"0")}</span>
        <strong>${n(nr[e.key]||e.label||e.key)}</strong>
      </div>
      ${la(e.status)}
    </div>
    <div class="flow-node-body">
      ${jt(e,"flow-progress")}
      <div class="flow-node-props">${r.map(i=>`<div class="flow-prop"><span>${n(i.label)}</span><strong>${n(i.value)}</strong></div>`).join("")}</div>
      ${e.message?`<div class="flow-node-note" title="${n(e.message)}">${n(e.message)}</div>`:""}
    </div>
  </article>`}function ur(e,t,s,a){let r=nt(e),i=a||"#8b5cf6",o=e.status==="running",l=`${s}-${t}`,m=`flow-gradient-${l}`,b=`flow-marker-${l}`,w=t%2===0?"M2 60 C8 42 16 78 22 60":"M2 60 C8 78 16 42 22 60";return`<div class="flow-link${o?" is-live":""}" style="color:${n(r)}" aria-hidden="true">
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
      <path class="flow-link-line" d="${w}" stroke="url(#${m})" stroke-width="1.7" stroke-linecap="round" marker-end="url(#${b})"/>
      <circle class="flow-link-port" cx="2" cy="60" r="3.6" stroke="${n(i)}" stroke-width="1.5"/>
      <circle class="flow-link-port" cx="26" cy="60" r="3.6" stroke="${n(r)}" stroke-width="1.5"/>
    </svg>
  </div>`}function ca(e){if(!e)return"";let t=[];return e.started_at&&t.push(`\u958B\u59CB ${ee(e.started_at)}`),e.duration_ms&&t.push(`\u8017\u6642 ${F(e.duration_ms)}`),e.pid&&t.push(`PID ${e.pid}`),t.join(" \xB7 ")}function pr(e,{active:t,focus:s,status:a,runLine:r,runningStage:i}){let o=e.label||oa[e.key]||e.key;return`<div class="flow-source${t?" is-live":""}" style="--branch-accent:${qt[e.key]||qt.system}">
    <div class="flow-source-head">
      <span class="flow-source-icon">${$(e.icon||"database",15)}</span>
      <div class="flow-node-heading">
        <span class="flow-node-kicker">SOURCE</span>
        <strong>${n(o)}</strong>
      </div>
      ${la(a)}
    </div>
    <div class="flow-source-body">
      <p class="flow-source-desc">${n(e.description||"")}</p>
      <div class="flow-source-meta">${r}</div>
      ${i?`<div class="flow-source-current"><span class="flow-current-dot"></span>\u76EE\u524D\u968E\u6BB5\uFF1A<strong>${n(i.label||i.key)}</strong></div>`:""}
      ${s&&s.message?`<div class="flow-source-note" title="${n(s.message)}">${n(s.message)}</div>`:""}
    </div>
  </div>`}function mr(e){let t=e.active_run,s=t||e.focus_run||e.last_run,a=t?"running":s?s.status:"idle",r=s?n(ca(s)||tt(s.started_at||s.finished_at)):"\u5C1A\u7121\u57F7\u884C\u7D00\u9304",i=Array.isArray(e.stages)?e.stages:[],o=i.find(f=>f.status==="running"),l=qt[e.key]||qt.system,m=String(e.key||"branch").replace(/[^a-zA-Z0-9_-]/g,""),b=pr(e,{active:t,focus:s,status:a,runLine:r,runningStage:o}),w=i.length?i.map((f,v)=>{let x=v?nt(i[v-1]):l;return`${ur(f,v,m,x)}${dr(f,v)}`}).join(""):'<div class="flow-empty">\u6C92\u6709\u53EF\u986F\u793A\u7684\u968E\u6BB5\u3002</div>';return`<article class="flow-lane" style="--branch-accent:${l}"><div class="flow-row">${b}${w}</div></article>`}function vr(e){return`<div class="flow-canvas-open">
    <div class="processing-branches">${(Array.isArray(e.branches)?e.branches:[]).map(mr).join("")}</div>
  </div>`}function Xe(e,t,s="",a=""){return`<div class="processing-summary-card">
    <span class="processing-summary-label">${n(e)}</span>
    <span class="processing-summary-value">${t}</span>
    ${s?`<span class="processing-summary-hint">${s}</span>`:""}
    ${a}
  </div>`}function gr(e){let t=e.database||{},s=e.index||{},a=e.local_archives||{},r=e.raw_backups||{},i=r.totals||{},o=e.state||{},l=e.capabilities||{},m=e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D",b=t.status==="operational",w=s.status==="operational",f=a.available!==!1,v=r.available!==!1,x=w?`${c(s.indexed)} / ${c(s.total)}`:he(s.status||"unavailable"),h=w?`${Ze(s.percent)} \xB7 \u5C1A\u9918 ${c(s.remaining)} \u7B46`:n(s.error||"\u7121\u6CD5\u67E5\u8A62 Qdrant \u7D22\u5F15\u8986\u84CB\u7387\u3002"),y=f?`${c(a.unprocessed)} / ${c(a.total)}`:he("unavailable"),N=f?`\u672A\u8655\u7406 / \u5168\u90E8 \xB7 ${O(a.unprocessed_bytes)} \u5F85\u8655\u7406`:n(a.error||"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304\u3002");return`<div class="processing-summary">
    ${Xe("\u8655\u7406\u72C0\u614B",he(e.status||"unknown"),`${n(m)} \xB7 \u66F4\u65B0\u65BC <span data-processing-updated-at>\u2014</span>`)}
    ${Xe("\u672A\u8655\u7406\u58D3\u7E2E\u6A94",n(y),N)}
    ${Xe("\u539F\u59CB Parquet \u5099\u4EFD",v?`${c(r.count)} \u6A94`:he("unavailable"),v?`\u5171 ${c(i.row_count)} \u7B46 \xB7 ${O(i.compressed_bytes)}`:n(r.error||"\u7121\u6CD5\u6383\u63CF\u539F\u59CB Parquet \u5099\u4EFD\u3002"))}
    ${Xe("PostgreSQL \u5224\u6C7A",b?c(t.judgment_count):he("unavailable"),b?`\u6CD5\u898F ${sa(t.law_count)} \xB7 \u547D\u4EE4 ${sa(t.order_count)}`:n(t.error||"\u7121\u6CD5\u67E5\u8A62 PostgreSQL\u3002"))}
    ${Xe("Qdrant \u7D22\u5F15",x,h)}
    ${Xe("\u72C0\u614B\u6A94",he(o.status||"missing"),o.updated_at?`\u66F4\u65B0\u65BC ${n(ee(o.updated_at))}`:n(o.detail||"\u5C1A\u7121\u8655\u7406\u72C0\u614B\u7D00\u9304\u3002"))}
    ${Xe("\u5F85\u8655\u7406\u5DE5\u4F5C",l.can_start_update===!1?"\u66AB\u505C\u555F\u52D5":"\u53EF\u958B\u59CB\u66F4\u65B0",l.start_blocked_reason?n(l.start_blocked_reason):`\u672A\u8655\u7406 ${c(l.unprocessed_archives)} \u500B \xB7 \u7D22\u5F15\u5F85\u88DC ${c(l.index_backlog)} \u7B46${l.external_processes?` \xB7 \u5916\u90E8\u7A0B\u5E8F ${c(l.external_processes)} \u500B`:""}`)}
  </div>`}function fr(e){if(e.available===!1)return Y({tone:"warn",title:"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304",text:n(e.error||"\u7121\u6CD5\u6383\u63CF .rar \u6A94\u6848\u3002")});let t=Number(e.total)||0,s=Number(e.processed)||0,a=Number(e.unprocessed)||0,r=t?100*s/t:null;return`<div class="processing-archive-summary">
    <div class="processing-archive-summary-head">
      <span class="mono">${n(e.data_dir||"")}</span>
      <span>${c(s)} / ${c(t)} \u5DF2\u8655\u7406 \xB7 ${c(a)} \u5F85\u8655\u7406 \xB7 ${O(e.unprocessed_bytes)} \u5F85\u8655\u7406</span>
    </div>
    ${jt({percent:r,status:a?"pending":"success",color:"var(--success)"},"processing-bar-lg")}
    <div class="processing-archive-summary-meta">
      <span>\u58D3\u7E2E\u6A94\u532F\u5165\u8986\u84CB ${Ze(r)}</span>
      <span>\u5168\u90E8 ${O(e.total_bytes)}</span>
    </div>
  </div>`}function hr(e){let t=e.stages||{},a=["extract","filter","postgres"].map(r=>t[r]).filter(Boolean).map(r=>lr(r,{compact:!0}));return a.length?`<div class="processing-archive-stages">${a.join("")}</div>`:""}function br(e){let t=e.status||"pending",s=t==="running",a=e.percent===null||e.percent===void 0?null:Math.max(0,Math.min(100,Number(e.percent)||0)),r=s&&a===null,i=[];return e.message&&i.push(e.message),e.error&&i.push(e.error),(e.scanned||e.matched||e.stored)&&i.push(`\u6383\u63CF ${c(e.scanned)} \xB7 \u547D\u4E2D ${c(e.matched)} \xB7 \u5BEB\u5165 ${c(e.stored)}`),`<div class="processing-archive is-${pt(t).tone}">
    <div class="processing-archive-head">
      <span class="processing-archive-name mono">${n(e.name)}</span>
      <div class="processing-archive-bar-wrap">
        ${jt({percent:a,status:t,color:s?"var(--accent)":"var(--success)"})}
      </div>
      <span class="processing-archive-percent mono">${r?"\u9032\u884C\u4E2D":Ze(a)}</span>
      ${he(t)}
      <span class="processing-archive-size faint">${O(e.size_bytes)}</span>
    </div>
    ${hr(e)}
    ${i.length?`<div class="processing-archive-note">${i.map(o=>`<span>${n(o)}</span>`).join("")}</div>`:""}
  </div>`}function $r(e){let t=e.archives||{},s=e.local_archives||{},a=Array.isArray(t.items)?t.items:[],r=t.run,i=`<div class="report-section-head">
    <div>
      <div class="report-kicker">ARCHIVE PIPELINE</div>
      <h2 class="report-section-title">\u5224\u6C7A\u58D3\u7E2E\u6A94</h2>
      <p class="processing-section-sub">\u6BCF\u500B\u58D3\u7E2E\u6A94\u540D\u7A31\u5F8C\u65B9\u5373\u6642\u986F\u793A\u8655\u7406\u9032\u5EA6\uFF1B\u672A\u53D6\u5F97\u53EF\u8A08\u7B97\u7684\u7E3D\u91CF\u6642\u6A19\u793A\u300C\u9032\u5EA6\u672A\u77E5\u300D\uFF0C\u4E0D\u4EE5\u63A8\u6E2C\u6578\u503C\u4EE3\u66FF\u3002</p>
    </div>
  </div>`,o=t.source==="run"?`${he(r?r.status:"idle")} <span>\u76EE\u524D\u986F\u793A ${r?n(r.title||"\u5224\u6C7A\u532F\u5165"):"\u6700\u8FD1\u4E00\u6B21\u532F\u5165"} \u7684\u9010\u6A94\u9032\u5EA6${r&&r.started_at?` \xB7 ${n(ca(r))}`:""}</span>`:t.external?`${he("running")} <span>${n(t.note||"\u5916\u90E8\u532F\u5165\u7A0B\u5E8F\u672A\u5BEB\u5165\u9010\u6A94\u72C0\u614B\uFF1B\u4EE5\u4E0B\u70BA PostgreSQL \u8986\u84CB\u7387\u3002")}</span>`:'<span class="faint">\u76EE\u524D\u6C92\u6709\u53EF\u8B80\u53D6\u7684\u532F\u5165 run \u72C0\u614B\uFF1B\u4EE5\u4E0B\u4EE5 PostgreSQL \u7684 source_archive \u5224\u5B9A\u662F\u5426\u5DF2\u8655\u7406\u3002</span>';return`<section class="report-card processing-card">
    <div class="report-head">${i}</div>
    <div class="report-section">
      ${fr(s)}
      <div class="processing-archive-run">${o}</div>
      ${a.length?`<div class="processing-archive-list">${a.map(br).join("")}</div>`:`<div class="processing-empty">\u627E\u4E0D\u5230 .rar \u58D3\u7E2E\u6A94\uFF1B\u8ACB\u78BA\u8A8D ${n(s.data_dir||"\u5224\u6C7A\u8CC7\u6599\u76EE\u9304")}\u3002</div>`}
    </div>
  </section>`}function yr(e){let t=e.timeline||{},s=Array.isArray(t.stages)?t.stages:[],a=`<div class="report-section-head">
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
    </section>`;let r=s.map(o=>`<span class="processing-stack-segment" style="width:${Math.max(0,Number(o.percent)||0)}%;background:${n(o.color||"var(--accent)")}" title="${n(`${o.label} ${F(o.duration_ms)} (${Ze(o.percent)})`)}"></span>`).join(""),i=s.map(o=>`<div class="processing-legend-item">
        <span class="processing-legend-swatch" style="background:${n(o.color||"var(--accent)")}"></span>
        <span class="processing-legend-label">${n(o.label)}</span>
        <span class="mono">${F(o.duration_ms)}</span>
        <span class="processing-legend-percent mono">${Ze(o.percent)}</span>
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
  </section>`}function wr(e){let t=Array.isArray(e.recent_runs)?e.recent_runs:[],s=new Map((e.branches||[]).map(i=>[i.key,i.label])),a=`<div class="report-section-head">
    <div>
      <div class="report-kicker">RECENT RUNS</div>
      <h2 class="report-section-title">\u6700\u8FD1\u8655\u7406\u7D00\u9304</h2>
      <p class="processing-section-sub">\u5305\u542B\u8CC7\u6599\u66F4\u65B0\u3001\u5224\u6C7A\u532F\u5165\u3001Parquet\u3001Qdrant \u8207\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E0B\u8F09\u3002</p>
    </div>
  </div>`;if(!t.length)return`<section class="report-card processing-card">
      <div class="report-head">${a}</div>
      <div class="report-section"><div class="processing-empty">\u5C1A\u7121\u8655\u7406\u7D00\u9304\u3002</div></div>
    </section>`;let r=t.map(i=>{let o=s.get(i.branch)||oa[i.branch]||i.branch||"\u2014";return`<div class="processing-run">
        <div class="processing-run-head">
          <span class="badge badge-neutral">${n(o)}</span>
          <strong>${n(i.title||"\u8655\u7406")}</strong>
          ${he(i.status)}
          <span class="grow"></span>
          <span class="mono faint">${n(ee(i.finished_at||i.started_at))}</span>
          <span class="mono">${i.duration_ms?F(i.duration_ms):"\u2014"}</span>
        </div>
        ${i.message?`<div class="processing-run-message">${n(i.message)}</div>`:""}
      </div>`}).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section"><div class="processing-run-list">${r}</div></div>
  </section>`}function _r(e){let t=Array.isArray(e.notices)?e.notices:[];return t.length?`<div class="processing-notices">${t.map(s=>Y({tone:s.tone||"info",title:s.title,text:n(s.message||"")})).join("")}</div>`:""}function na(e){return`${_r(e)}
    ${gr(e)}
    <section class="processing-flow-section">
      <div class="processing-section-head">
        <div>
          <div class="report-kicker">PIPELINE CANVAS</div>
          <h2 class="report-section-title">\u8655\u7406\u6D41\u7A0B</h2>
          <p class="processing-section-sub">\u5224\u6C7A\u3001\u6CD5\u898F\u3001\u547D\u4EE4\u4E09\u689D\u6D41\u7A0B\u5373\u6642\u53CD\u6620\u76EE\u524D\u57F7\u884C\u968E\u6BB5\uFF1B\u66F2\u7DDA\u7531\u4F86\u6E90\u7BC0\u9EDE\u9023\u5230\u5404\u968E\u6BB5\uFF0C\u767C\u5149\u7BC0\u9EDE\u8207\u6D41\u52D5\u66F2\u7DDA\u8868\u793A\u76EE\u524D\u57F7\u884C\u4F4D\u7F6E\u3002</p>
        </div>
      </div>
      ${vr(e)}
    </section>
    ${$r(e)}
    ${yr(e)}
    ${wr(e)}`}function kr(e,t){return`<div class="report-card processing-card">
    <div class="report-section">
      ${Y({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B",text:n(e||"\u672A\u77E5\u932F\u8AA4")})}
      ${t?`<p class="processing-section-sub">\u4E0A\u6B21\u6210\u529F\u66F4\u65B0\uFF1A${n(ee(t.generated_at))}\u3002\u756B\u9762\u4E0A\u6C92\u6709\u986F\u793A\u66FF\u4EE3\u6216\u63A8\u6E2C\u7684\u9032\u5EA6\u3002</p>`:""}
      <div class="processing-error-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh">
          ${$("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
  </div>`}var da={overview:"activity",full_update:"download",law_download:"layers",order_download:"file",judgment_import:"database",judgment_parquet:"cube",index_versions:"brain",normalize_courts:"filter",backfill_law_articles:"history"};function xr(e){let t=Array.isArray(e.workflows)?e.workflows:[];return[{id:"overview",label:"\u8655\u7406\u7E3D\u89BD",description:"\u76EE\u524D\u6D41\u7A0B\u3001\u58D3\u7E2E\u6A94\u8207\u6700\u8FD1\u57F7\u884C\u7D00\u9304",status:e.status||"idle",activeRun:null,lastRun:null},...t.map(s=>{let a=s.active_run||null,r=a||s.last_run||null;return{...s,activeRun:a,lastRun:r,status:r?.status||"idle"}})]}function ra(e,t){return`<div class="status-sidebar-head">
      <div class="eyebrow">DATA WORKFLOWS</div>
      <div class="status-sidebar-title">\u8CC7\u6599\u6D41\u7A0B</div>
    </div>
    <nav class="status-tab-list" aria-label="\u8CC7\u6599\u8655\u7406\u5DE5\u4F5C\u6D41\u7A0B">
      ${xr(e).map(a=>{let r=a.id===t,i=da[a.id]||"terminal";return`<button class="status-tab${r?" is-active":""}" type="button"
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
    </div>`}function Sr(e){if(!e)return'<div class="processing-workflow-empty">\u5C1A\u672A\u57F7\u884C\u3002\u6309\u4E0B\u53F3\u5074\u6309\u9215\u958B\u59CB\u3002</div>';let t=e.meta||{};return`<div class="processing-workflow-run">
    <div class="processing-workflow-run-head">
      ${he(e.status)}
      <span class="mono">${n(e.id||"\u2014")}</span>
    </div>
    <div class="processing-workflow-run-grid">
      <span>\u958B\u59CB</span><strong>${n(ee(e.started_at))}</strong>
      <span>\u8017\u6642</span><strong>${F(e.duration_ms)}</strong>
      <span>\u8A0A\u606F</span><strong>${n(e.message||"\u2014")}</strong>
      ${t.log_path?`<span>\u65E5\u8A8C</span><strong class="mono">${n(t.log_path)}</strong>`:""}
    </div>
  </div>`}function Ar(e){let t=e.active_run||null,s=t||e.last_run||null,a=!!t,r=!!e.can_run&&!a,i=e.id==="full_update",o=Array.isArray(e.command)?e.command.join(" "):"";return`<div class="processing-workflow-panel">
    ${Y({tone:"info",title:e.label,text:e.description||""})}
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${$(da[e.id]||"terminal",14)}\u57F7\u884C\u8CC7\u8A0A</span>
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
      ${Sr(s)}
    </section>
  </div>`}function ia(e,t){if(t==="overview")return na(e);let a=(Array.isArray(e.workflows)?e.workflows:[]).find(r=>r.id===t);return a?Ar(a):na(e)}async function Lr(e){e.innerHTML=`<section class="page processing-page">
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
  </section>`;let t=e.querySelector(".processing-page"),s=e.querySelector("#processing-root"),a=e.querySelector("#processing-workflows"),r=e.querySelector("#processing-update"),i=e.querySelector("#processing-stop"),o=e.querySelector("#processing-refresh"),l=e.querySelector("#processing-index-toggle"),m=!1,b=!1,w=!1,f=null,v="",x="",h="overview",y=null,N=R=>{let P=R.capabilities||{},k=!!(l&&l.checked),q=k?P.can_start_update_with_index!==!1:P.can_start_update!==!1,B=k&&P.index_blocked_reason||P.start_blocked_reason;if(!w){r.disabled=!q,r.title=B||"\u6AA2\u67E5\u7DDA\u4E0A\u6CD5\u898F\uFF0F\u547D\u4EE4\uFF0C\u4E26\u8655\u7406\u672A\u532F\u5165\u7684\u5224\u6C7A\u58D3\u7E2E\u6A94\u3002";let Q=r.querySelector("[data-update-label]");Q&&(Q.textContent=q?"\u8CC7\u6599\u66F4\u65B0":P.active_update_id?"\u66F4\u65B0\u57F7\u884C\u4E2D":"\u8655\u7406\u7A0B\u5E8F\u57F7\u884C\u4E2D"),i.hidden=!P.can_stop_update,l&&(l.disabled=P.can_start_update===!1)}},M=async({silent:R=!1}={})=>{if(!(m||b)){b=!0,R||V(o,!0,"\u66F4\u65B0\u4E2D\u2026");try{let P=await U.processing();if(m)return;f=P;let k=ra(P,h);k!==x&&(a.innerHTML=k,x=k);let q=ia(P,h);q!==v&&(s.innerHTML=q,v=q);let B=s.querySelector("[data-processing-updated-at]");if(B){let Q=ee(P.generated_at);B.textContent!==Q&&(B.textContent=Q)}N(P)}catch(P){if(m)return;let k=kr(P.message,f);k!==v&&(s.innerHTML=k,v=k),R||D(P.message||"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B\u3002","danger",6e3)}finally{b=!1,R||V(o,!1)}}},_=async R=>{if(!w){w=!0,V(R,!0,"\u555F\u52D5\u4E2D\u2026");try{let P=!!(l&&l.checked),k=await U.startProcessingUpdate(P);D(`\u5DF2\u555F\u52D5\u8CC7\u6599\u66F4\u65B0${P?"\uFF0C\u5B8C\u6210\u5F8C\u63A5\u7E8C Qdrant \u7D22\u5F15":""}\u3002`,"ok",6e3),k&&k.run_id&&console.info("processing update started",k),await M({silent:!0})}catch(P){D(P.message||"\u7121\u6CD5\u555F\u52D5\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{w=!1,V(R,!1),f&&N(f)}}},E=async(R,P)=>{if(!w){w=!0,V(R,!0,"\u555F\u52D5\u4E2D\u2026");try{let k=await U.startProcessingWorkflow(P);D("\u5DF2\u555F\u52D5\u5DE5\u4F5C\u6D41\u7A0B\u3002","ok",6e3),k&&k.run_id&&console.info("processing workflow started",k),await M({silent:!0})}catch(k){D(k.message||"\u7121\u6CD5\u555F\u52D5\u5DE5\u4F5C\u6D41\u7A0B\u3002","danger",7e3)}finally{w=!1,V(R,!1),f&&N(f)}}},z=async R=>{if(!w){w=!0,V(R,!0,"\u505C\u6B62\u4E2D\u2026");try{let P=await U.stopProcessingUpdate();D(P.message||"\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info",6e3),await M({silent:!0})}catch(P){D(P.message||"\u7121\u6CD5\u505C\u6B62\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{w=!1,V(R,!1),f&&N(f)}}},G=R=>{let P=R.target.closest("[data-processing-action]");if(!P||P.disabled)return;let k=P.dataset.processingAction;if(k==="refresh")M({silent:!1});else if(k==="update")_(P);else if(k==="run-workflow"){let q=P.dataset.workflowId||"";q==="full_update"?_(P):E(P,q)}else k==="stop"&&z(P)},X=R=>{R.target===l&&f&&N(f)},se=R=>{let P=R.target.closest("[data-processing-workflow]");if(P&&(h=P.dataset.processingWorkflow||"overview",f)){let k=ra(f,h);a.innerHTML=k,x=k;let q=ia(f,h);s.innerHTML=q,v=q}};return t.addEventListener("click",G),a.addEventListener("click",se),l&&l.addEventListener("change",X),await M({silent:!1}),y=window.setInterval(()=>{document.hidden||M({silent:!0})},tr),()=>{m=!0,y!==null&&window.clearInterval(y),t.removeEventListener("click",G),a.removeEventListener("click",se),l&&l.removeEventListener("change",X)}}var ds={};Qe(ds,{render:()=>Nr});function Pt(e){if(e==null||e==="")return"\u2014";let t=Number(e);return Number.isFinite(t)?`${t.toFixed(t>=10?1:2)}%`:"\u2014"}function ua(e){return e==null?"\u2014":c(e)}function Mr(e){return e.count?e.severity==="danger"?K("failed","\u9700\u8655\u7406"):e.severity==="warn"?K("warning","\u6CE8\u610F"):K("preview","\u63D0\u793A"):K("success","\u901A\u904E")}function Tr(e){return e.count?e.severity==="danger"?"is-danger":e.severity==="warn"?"is-warn":"is-info":"is-ok"}function qr(e){let t=Number(e.count)||0,s=Math.max(0,Math.min(100,Number(e.percent)||0));return`<div class="quality-check ${Tr(e)}">
    <div class="quality-check-head">
      <span class="quality-check-label">${n(e.label)}</span>
      ${Mr(e)}
    </div>
    <div class="quality-check-value">
      <strong>${c(t)}</strong>
      <span>\u7B46</span>
      <em>${n(Pt(e.percent))}</em>
    </div>
    <div class="quality-check-desc">${n(e.description)}</div>
    <div class="quality-check-track" aria-hidden="true">
      <span style="width:${s}%"></span>
    </div>
  </div>`}function Et(e,t,s){let a=Array.isArray(s)?s:[];if(!a.length)return`<div class="index-chart-card">
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
  </div>`}function jr(e){let t=e.coverage||{},s=e.totals||{},a=e.source||{},r=t.postgres_diff,i=r==null?"\u2014":r===0?"\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u4E00\u81F4":`\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u76F8\u5DEE ${c(Math.abs(r))} \u7B46`,o=t.vector_indexed===null||t.vector_indexed===void 0?t.detail||"\u7121\u6CD5\u53D6\u5F97\u7D22\u5F15\u7D71\u8A08":`${c(t.vector_indexed)} / ${c(t.vector_total)} \xB7 ${t.model||"\u2014"}`;return`<div class="metric-grid quality-coverage-grid">
    <div class="metric-card">
      <div class="metric-label">${$("filter",13)}<span>\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D</span></div>
      <div class="metric-value">${c(s.matched_rows)}</div>
      <div class="metric-foot">citation_count &gt; 0\uFF1B\u5171 ${c(s.citation_total)} \u7B46\u5F15\u7528</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${$("database",13)}<span>PostgreSQL \u6536\u9304</span></div>
      <div class="metric-value">${ua(t.postgres_judgments)}</div>
      <div class="metric-foot">${n(i)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${$("brain",13)}<span>\u5411\u91CF\u7D22\u5F15</span></div>
      <div class="metric-value">${n(Pt(t.vector_coverage_pct))}</div>
      <div class="metric-foot">${n(o)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${$("layers",13)}<span>DuckDB \u5019\u9078</span></div>
      <div class="metric-value">${ua(a.candidate_total)}</div>
      <div class="metric-foot">${c(a.candidate_archive_count)} / ${c(a.archive_count)} \u500B manifest \u6709 candidate_count</div>
    </div>
  </div>`}function Er(e){return e.length?`<div class="table-wrap">
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
              <td class="cell-number">${n(Pt(t.match_rate))}</td>
              <td class="cell-number">${c(t.short_text_rows)}</td>
              <td class="cell-number">${c(s)}</td>
              <td class="cell-number">${c(t.duplicate_content_rows)}</td>
              <td class="cell-date">${n(Pe(t.date_min))} \u2013 ${n(Pe(t.date_max))}</td>
            </tr>`}).join("")}
      </tbody>
    </table>
  </div>`:ye({iconName:"table",title:"\u6C92\u6709\u539F\u59CB Parquet \u6A94\u6848",text:"\u5B8C\u6210\u5224\u6C7A RAR \u532F\u5165\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6BCF\u500B\u58D3\u7E2E\u6A94\u7684 DuckDB \u7D71\u8A08\u3002"})}function Pr(e){let t=e.totals||{},s=e.source||{},a=Array.isArray(e.checks)?e.checks:[],r=e.summary||{},i=e.distributions||{},o=Array.isArray(e.warnings)?e.warnings:[],l=O(s.compressed_bytes||0);return`<div class="report-card quality-report" data-database="quality">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">DUCKDB DATA QUALITY</div>
        <div class="report-title">
          \u539F\u59CB Parquet \u8CC7\u6599\u54C1\u8CEA ${K(e.status||"operational")}
          <span class="chip">raw.parquet</span>
        </div>
        <div class="report-sub">
          ${c(t.rows)} \u7B46 \xB7 ${c(s.raw_files)} \u500B\u6A94\u6848 \xB7
          ${l} \xB7 \u6383\u63CF ${F(e.scan_ms||0)} \xB7
          ${n(ee(e.generated_at))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-quality">
          ${$("download",14)}<span>JSON</span>
        </button>
      </div>
    </div>
    ${o.length?`<div class="report-alert">${Y({tone:"warn",title:"\u76EE\u524D\u9650\u5236\u8207\u5DEE\u7570",text:o.map(m=>n(m)).join("<br>")})}</div>`:""}
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
        <div class="summary-value">${n(Pt(t.match_rate))}</div>
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
      <div class="quality-checks">${a.map(qr).join("")}</div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6536\u9304\u8986\u84CB</span>
        <span class="muted" style="font-size:9.5px">PostgreSQL \u8207\u5411\u91CF\u7D22\u5F15\u70BA\u5373\u6642\u67E5\u8A62\uFF0C\u4E0D\u662F\u5F9E Parquet \u63A8\u4F30</span>
      </div>
      ${jr(e)}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6A94\u6848\u660E\u7D30</span>
        <span class="muted" style="font-size:9.5px">${c(s.archive_count)} \u500B\u539F\u59CB Parquet</span>
      </div>
      ${Er(Array.isArray(e.archives)?e.archives:[])}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u5206\u5E03\u7D71\u8A08</span>
        <span class="muted" style="font-size:9.5px">DuckDB group by / unnest</span>
      </div>
      <div class="quality-dist-grid">
        ${Et("\u6CD5\u9662","\u5224\u6C7A\u7B46\u6578",i.courts)}
        ${Et("\u88C1\u5224\u5E74\u4EFD","\u5224\u6C7A\u7B46\u6578",i.years)}
        ${Et("\u71B1\u9580\u6CD5\u898F","\u63D0\u53CA\u5224\u6C7A\u6578",i.laws)}
        ${Et("\u71B1\u9580\u6848\u7531","\u5224\u6C7A\u7B46\u6578",i.titles)}
      </div>
    </div>
  </div>`}async function Nr(e){e.innerHTML=`<section class="page data-page quality-page">
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
  </section>`;let t=e.querySelector("#quality-content"),s=e.querySelector("#quality-refresh"),a=e.querySelector("#quality-meta"),r=null,i=()=>{r&&(t.innerHTML=Pr(r),a.textContent=`DUCKDB \xB7 ${c(r.totals?.rows)} \u7B46 \xB7 ${F(r.scan_ms||0)}`)},o=async()=>{V(s,!0,"\u6383\u63CF\u4E2D\u2026");try{r=await U.quality(),i()}catch(l){t.innerHTML=`<div class="report-card">
        <div class="report-head">
          <div class="report-title-group">
            <div class="report-kicker">DUCKDB DATA QUALITY</div>
            <div class="report-title">\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557</div>
            <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
          </div>
        </div>
        <div class="report-section">
          ${Y({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u54C1\u8CEA\u7D71\u8A08",text:n(l.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
        </div>
      </div>`,a.textContent="DUCKDB \xB7 \u8B80\u53D6\u5931\u6557",D("\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}finally{V(s,!1)}};s.addEventListener("click",o),t.addEventListener("click",l=>{!l.target.closest("[data-action='export-quality']")||!r||Ue(`judgment-quality-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(r,null,2),"application/json;charset=utf-8")}),await o()}var us={};Qe(us,{render:()=>ni});var pa={frontend:"browser",backend:"server",database:"database",storage:"layers",vector:"cube",ai:"brain",default:"cpu"};var va={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90"},ga=[{id:"overview",label:"\u670D\u52D9\u7E3D\u89BD",hint:"\u5065\u5EB7\u72C0\u614B\u8207\u8CC7\u6599\u91CF",icon:"activity"},{id:"resources",label:"\u7CFB\u7D71\u8CC7\u6599\u4F7F\u7528",hint:"CPU\u3001RAM\u3001Docker\u3001\u786C\u789F",icon:"cpu"},{id:"architecture",label:"\u524D\u5F8C\u7AEF\u67B6\u69CB",hint:"Client \u2192 Data \u2192 AI",icon:"layers"},{id:"data",label:"\u8CC7\u6599\u7248\u672C",hint:"Parquet \u8207 PostgreSQL",icon:"database"},{id:"api",label:"API \u7AEF\u9EDE",hint:"REST \u8207 OpenAPI",icon:"terminal"},{id:"runs",label:"\u6700\u8FD1\u4E0B\u8F09",hint:"\u6CD5\u898F\uFF0F\u547D\u4EE4\u57F7\u884C\u7D00\u9304",icon:"history"}];function Cr(e){return e==="operational"?{label:"\u6838\u5FC3\u670D\u52D9\u6B63\u5E38",tone:"ok",headline:"\u6838\u5FC3\u8CC7\u6599\u7BA1\u7DDA\u904B\u4F5C\u4E2D",copy:"FastAPI\u3001PostgreSQL \u8207 Parquet \u5747\u53EF\u5B58\u53D6\u3002Qdrant\u3001Embedding \u8207 LLM \u6703\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u8A2D\u5B9A\u6216\u964D\u7D1A\u6642\u4E0D\u5F71\u97FF\u8CC7\u6599\u700F\u89BD\u8207\u67E5\u8A62\u5831\u8868\u3002"}:e==="degraded"?{label:"\u90E8\u5206\u670D\u52D9\u964D\u7D1A",tone:"warn",headline:"\u90E8\u5206\u670D\u52D9\u9700\u8981\u8A2D\u5B9A\u6216\u4FEE\u5FA9",copy:"\u6838\u5FC3\u8CC7\u6599\u670D\u52D9\u76EE\u524D\u672A\u5B8C\u5168\u53EF\u7528\u3002\u8ACB\u67E5\u770B\u4E0B\u65B9\u670D\u52D9\u5361\u7247\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u7684\u57F7\u884C\u7D00\u9304\uFF0C\u78BA\u8A8D PostgreSQL\u3001Parquet \u6216\u5916\u90E8\u670D\u52D9\u72C0\u614B\u3002"}:{label:Ne(e).label,tone:Ne(e).tone,headline:"\u76EE\u524D\u7121\u6CD5\u78BA\u8A8D\u7CFB\u7D71\u72C0\u614B",copy:"\u72C0\u614B API \u56DE\u50B3\u4E86\u975E\u9810\u671F\u7D50\u679C\u3002\u8ACB\u91CD\u65B0\u6574\u7406\uFF0C\u6216\u76F4\u63A5\u6AA2\u67E5 FastAPI \u670D\u52D9\u65E5\u8A8C\u3002"}}function Rr(e){let t=Ne(e.status),s=pa[e.kind]||pa.default,a=e.latency_ms===null||e.latency_ms===void 0?"":`<span class="service-latency">${c(e.latency_ms)} ms</span>`;return`<article class="service-card">
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
  </article>`}function Ir(e,t){return`<div class="arch-node ${e?"":"is-muted"}" ${e?"":'title="\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165"'}>${n(t)}</div>`}function Dr(e,t){if(e==="IndexedDB")return Ss();let a={PostgreSQL:"postgres",Parquet:"parquet",Qdrant:"qdrant",Embedding:"embedding",Retriever:"rag","RAG Engine":"rag",LLM:"llm"}[e];return a?t.find(i=>i.id===a)?.status==="operational":!0}function Br(e,t){let s=e?.layers||[];if(!s.length)return'<div class="report-empty-inline">\u72C0\u614B API \u672A\u63D0\u4F9B\u67B6\u69CB\u8CC7\u6599\u3002</div>';let a=s.map(i=>{let o=(i.nodes||[]).map(l=>Ir(Dr(l,t),l)).join("");return`<div class="arch-layer">
      <div class="arch-layer-label">${n(i.label||i.id)}</div>
      <div class="arch-nodes">${o}</div>
    </div>`}),r=[];return a.forEach((i,o)=>{o&&r.push(`<div class="arch-arrow" aria-hidden="true">${$("arrowRight",15)}</div>`),r.push(i)}),`<div class="arch-flow">${r.join("")}</div>
    <div class="arch-legend">
      <span><i class="legend-key is-live"></i>\u5DF2\u63A5\u5165\u4E14\u72C0\u614B\u6B63\u5E38</span>
      <span><i class="legend-key is-off"></i>\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165</span>
      <span>${$("info",12)} \u7BC0\u9EDE\u72C0\u614B\u4F86\u81EA\u4E3B\u670D\u52D9\u5065\u5EB7\u6AA2\u67E5</span>
    </div>`}function Or(e){return!Array.isArray(e)||!e.length?'<div class="report-empty-inline">\u6C92\u6709\u7AEF\u9EDE\u8CC7\u8A0A\u3002</div>':`<div class="endpoint-list">
    ${e.map(t=>`<div class="endpoint-row">
          <span class="endpoint-method">${n(t.method)}</span>
          <span class="endpoint-path" title="${n(t.path)}">${n(t.path)}</span>
          <span class="endpoint-label">${n(t.label||"")}</span>
        </div>`).join("")}
  </div>`}function te(e,t){return`<div class="detail-row">
    <span class="detail-label">${n(e)}</span>
    <span class="detail-value">${t}</span>
  </div>`}function Fr(e){return e?`<div class="detail-list">
    ${te("\u7248\u672C ID",`<strong>#${c(e.id)}</strong>`)}
    ${te("\u8CC7\u6599\u985E\u578B",K("operational",e.source_type==="law"?"\u6CD5\u898F":"\u547D\u4EE4"))}
    ${te("\u4F86\u6E90\u66F4\u65B0\u65E5",`<strong>${n(e.update_date||"\u2014")}</strong>`)}
    ${te("\u6CD5\u898F / \u689D\u6587",`<strong>${c(e.law_count)} / ${c(e.article_count)}</strong>`)}
    ${te("\u4E0B\u8F09\u6642\u9593",`<span class="mono">${ee(e.downloaded_at)}</span>`)}
    ${te("Parquet",`<code title="${n(e.parquet_path||"")}">${n(e.parquet_path||"\u2014")}</code>`)}
  </div>`:'<div class="report-empty-inline">\u5C1A\u672A\u532F\u5165\u4EFB\u4F55\u8CC7\u6599\u7248\u672C\u3002</div>'}function Hr(e){if(!Array.isArray(e)||!e.length)return ye({iconName:"history",title:"\u5C1A\u7121\u4E0B\u8F09\u57F7\u884C\u7D00\u9304",text:"\u57F7\u884C judgment-law-download \u5F8C\uFF0C\u6210\u529F\u3001\u7121\u8B8A\u66F4\u8207\u5931\u6557\u7684\u7D50\u679C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"});let t=[{key:"id",label:"Run",type:"number"},{key:"source_type",label:"\u985E\u578B",type:"source"},{key:"status",label:"\u72C0\u614B",type:"status"},{key:"started_at",label:"\u958B\u59CB\u6642\u9593",type:"datetime"},{key:"duration_ms",label:"\u8017\u6642",type:"duration"},{key:"law_count",label:"\u6CD5\u898F",type:"number"},{key:"article_count",label:"\u689D\u6587",type:"number"},{key:"error_message",label:"\u932F\u8AA4",type:"longtext"}];return`<div class="table-wrap" style="border-top:0;max-height:340px">
    <table class="data-table runs-table">
      <thead><tr>${t.map(s=>`<th scope="col">${n(s.label)}</th>`).join("")}</tr></thead>
      <tbody>
        ${e.map(s=>`<tr>${t.map(a=>`<td>${ht(s[a.key],a.type)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </div>`}function Ur(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=Cr(e.status),r=s.find(b=>b.id==="qdrant"),i=s.find(b=>b.id==="rag"),o=s.find(b=>b.id==="llm"),l=He(),m=va[l]||l;return`<section class="status-hero">
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
          <span>${$("clock",11)} \u6AA2\u67E5\u6642\u9593 ${ee(e.checked_at)} \xB7 ${n(tt(e.checked_at))}</span>
          <span>${$("server",11)} ${s.length} \u500B\u670D\u52D9\u5143\u4EF6</span>
          <span>${$("database",11)} ${c(t.total_current)} \u7B46\u73FE\u884C\u8CC7\u6599</span>
          <span>${$("layers",11)} ${c(t.parquet_files)} \u500B\u539F\u59CB Parquet</span>
          <span title="API \u4F4D\u5740\u4F86\u6E90\uFF1A${n(m)}">${$("link",11)} ${n(Je())}</span>
        </div>
      </div>
    </section>

    <div class="service-grid">${s.map(Rr).join("")}</div>

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

    ${r?.status==="not_configured"||i?.status==="not_configured"||o?.status==="not_configured"?`<div class="data-section">${Y({tone:"info",title:"\u90E8\u5206 AI \u5143\u4EF6\u5C1A\u672A\u8A2D\u5B9A",text:`Qdrant\uFF1A${n(r?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BRAG\uFF1A${n(i?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BLLM\uFF1A${n(o?.detail||"\u672A\u8A2D\u5B9A")}\u3002\u9019\u4E9B\u72C0\u614B\u4E0D\u6703\u88AB\u507D\u88DD\u6210\u53EF\u7528\u3002`})}</div>`:""}

  }`}function zr(e){let t=Array.isArray(e.services)?e.services:[],s=e.architecture||{};return`<div class="data-section card architecture-card">
    <div class="section-head">
      <div>
        <div class="section-title">\u524D\u5F8C\u7AEF\u67B6\u69CB</div>
        <div class="section-sub">Client \u2192 Application \u2192 Data \u2192 Intelligence</div>
      </div>
      <span class="badge badge-neutral badge-mono">${c((s.flow||[]).length)} layers</span>
    </div>
    ${Br(s,t)}
  </div>`}function Gr(e){let t=He(),s=va[t]||t,a=Ee("/api/docs"),r=Ee("/api/openapi.json");return`<div class="status-columns is-single">
    <section class="card">
      <div class="side-card-head">
        <span class="side-card-title">${$("terminal",14)}API \u7AEF\u9EDE</span>
        <a href="${n(a)}" target="_blank" rel="noopener noreferrer" class="chip"
          >OpenAPI ${$("external",11)}</a>
      </div>
      ${Or(e.endpoints)}
      <div class="side-card-foot">
        \u76EE\u524D API Base\uFF1A<code>${n(Je())}</code>\uFF08${n(s)}\uFF09\u3002\u4E92\u52D5\u5F0F API \u6587\u4EF6\u4F4D\u65BC <a href="${n(a)}" target="_blank" rel="noopener noreferrer"><code>${n(a)}</code></a>\uFF0COpenAPI schema \u4F4D\u65BC <a href="${n(r)}" target="_blank" rel="noopener noreferrer"><code>${n(r)}</code></a>\u3002
      </div>
    </section>
  </div>`}function Qr(e){let t=e.data||{};return`<div class="status-summary">
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
          ${K("operational","Parquet")}
        </div>
        ${Fr(t.last_version)}
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
          ${te("\u73FE\u884C\u6CD5\u898F",`<strong>${c(t.law_count)}</strong>`)}
          ${te("\u73FE\u884C\u547D\u4EE4",`<strong>${c(t.order_count)}</strong>`)}
          ${te("\u689D\u6587\u7E3D\u6578",`<strong>${c(t.article_count)}</strong>`)}
          ${te("\u539F\u59CB Parquet",`<strong>${O(t.parquet_bytes)}</strong>`)}
          ${te("\u5224\u6C7A\u6587\u4EF6",`<strong>${c(t.judgment_count)}</strong>`)}
          ${te("\u5411\u91CF\u7D22\u5F15",`<strong>${c(t.judgment_indexed_count)}</strong> / ${c(t.judgment_count)}\uFF08${c(t.judgment_vector_points)} points\uFF09`)}
          ${te("\u7D22\u5F15\u7248\u672C",`<strong>#${c(t.judgment_vector_version_id)}</strong> \xB7 ${n(t.judgment_vector_version_status||"legacy")}`)}
          ${te("Alias",`<code>${n(t.judgment_vector_alias||"\u2014")}</code> \u2192 <code>${n(t.judgment_vector_collection||"\u2014")}</code>`)}
          ${te("\u7D22\u5F15\u6A21\u578B",`<code>${n(t.judgment_vector_model||"\u2014")}</code>`)}
          ${te("\u6700\u8FD1\u7D22\u5F15",`<span class="mono">${ee(t.judgment_indexed_at)}</span>`)}
        </div>
      </section>
    </div>`}function Jr(e){let t=e.data||{};return`<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${$("history",14)}\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C</span>
      <span class="badge badge-neutral badge-mono">${c(t.run_count)} TOTAL</span>
    </div>
    ${Hr(e.recent_runs)}
  </section>`}function Vr(e){let t=Number(e);return Number.isFinite(t)?t>=90?"is-danger":t>=70?"is-warn":"":""}function fa(e,t=""){let s=Math.max(0,Math.min(100,Number(e)||0));return`<div class="resource-bar ${t}"><span style="width:${s}%"></span></div>`}function et(e,t,s,a,r){let i=Vr(r);return`<article class="resource-card">
    <div class="resource-card-head">
      <span class="resource-card-label">${$(t,14)}${n(e)}</span>
      <strong>${n(s)}</strong>
    </div>
    ${fa(r,i)}
    <div class="resource-card-detail">${a}</div>
  </article>`}function Wr(e){let t=e.docker||{};if(!t.available)return`<section class="card data-section">
      <div class="side-card-head">
        <span class="side-card-title">${$("layers",14)}Docker</span>
        ${K("not_configured","\u672A\u9023\u7DDA")}
      </div>
      <div class="report-empty-inline">${n(t.detail||"Docker daemon \u672A\u9023\u7DDA\u3002")}</div>
    </section>`;let s=[...t.containers||[]].sort((i,o)=>{let l=i.service?0:1,m=o.service?0:1;return l-m||String(i.name).localeCompare(String(o.name))}),a=s.map(i=>`<tr>
        <td><strong>${n(i.name||"\u2014")}</strong>${i.service?`<span class="badge badge-neutral badge-mono">${n(i.service)}</span>`:""}</td>
        <td>${K(i.state==="running"?"operational":"degraded",i.state||"\u2014")}</td>
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
  </section>`}function Kr(e){return`<div class="resource-section-head">
      <div>
        <div class="section-title">\u5404\u8CC7\u6599\u5EAB\u4F7F\u7528\u8CC7\u6E90</div>
        <div class="section-sub">\u5BB9\u5668 CPU\uFF0FRAM \u8207\u8CC7\u6599\u5EAB\u5167\u90E8\u5BB9\u91CF</div>
      </div>
    </div>
    <div class="resource-db-grid">${(Array.isArray(e.databases)?e.databases:[]).map(s=>{let a=s.id==="postgres",r=Array.isArray(s.tables)?s.tables:[],i=s.status==="operational"?"operational":s.status==="not_configured"?"not_configured":"degraded",o=a?`${te("\u8CC7\u6599\u5EAB",`<code>${n(s.database||"\u2014")}</code>`)}
           ${te("\u8CC7\u6599\u5EAB\u5927\u5C0F",`<strong>${O(s.storage_bytes)}</strong>`)}
           ${te("Docker volume",`<strong>${O(s.volume_bytes)}</strong>${s.volume_name?` <code>${n(s.volume_name)}</code>`:""}`)}
           ${te("\u9023\u7DDA\u6578",`<strong>${c(s.connections)}</strong>`)}`:`${te("Collection",`<code>${n(s.collection||"\u2014")}</code>`)}
           ${te("Docker volume",`<strong>${O(s.volume_bytes)}</strong>${s.volume_name?` <code>${n(s.volume_name)}</code>`:""}`)}
           ${te("\u5411\u91CF\u9EDE\u6578",`<strong>${c(s.points_count)}</strong>`)}
           ${te("Collections",`<strong>${c(s.collections)}</strong>`)}
           ${te("Segments",`<strong>${c(s.segments_count)}</strong>`)}`;return`<article class="resource-db-card">
        <div class="resource-db-head">
          <div>
            <div class="resource-db-title">${n(s.name||"\u2014")}</div>
            <div class="resource-db-kind">${n(s.kind||"")}</div>
          </div>
          ${K(i)}
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
      </article>`}).join("")}</div>`}function rt(e,t,s,a){let r=Number(t)||0,i=a?r/a*100:0;return`<div class="storage-row">
    <div class="storage-row-head">
      <span>${n(e)}</span>
      <strong>${O(r)}</strong>
    </div>
    ${fa(i)}
    <div class="storage-row-detail">${s}</div>
  </div>`}function Yr(e){let t=e.storage||{},s=t.application||{},a=t.parquet||{},r=t.docker||{},i=t.volumes||{},o=i.postgres||{},l=i.qdrant||{},m=Number(t.judgment_total_bytes||0);return`<section class="card data-section storage-section">
    <div class="side-card-head">
      <span class="side-card-title">${$("database",14)}\u786C\u789F\u4F7F\u7528\u7D44\u6210</span>
      <span class="badge badge-neutral badge-mono">${O(m)}</span>
    </div>
    <div class="storage-list">
      ${rt("\u524D\u7AEF",s.frontend_bytes,`<span class="mono">${n(s.frontend_path||"\u2014")}</span>`,m)}
      ${rt("\u5F8C\u7AEF",s.backend_bytes,`<span class="mono">${n(s.backend_path||"\u2014")}</span>`,m)}
      ${rt("Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5FEB\u53D6",r.layers_bytes,`Images ${O(r.images_bytes)} \xB7 Containers ${O(r.containers_bytes)} \xB7 Build cache ${O(r.build_cache_bytes)}`,m)}
      ${rt("PostgreSQL volume",o.size_bytes,`<span class="mono">${n(o.name||"\u2014")}</span>`,m)}
      ${rt("Qdrant volume",l.size_bytes,`<span class="mono">${n(l.name||"\u2014")}</span>`,m)}
      ${rt("Parquet",a.total_bytes,`\u6CD5\u898F ${O(a.law_bytes)} \xB7 \u5224\u6C7A ${O(a.judgment_bytes)}`,m)}
    </div>
    <div class="storage-total">
      <span>Judgment \u5143\u4EF6\u5408\u8A08</span>
      <strong>${O(m)}</strong>
    </div>
    <div class="side-card-foot">
      \u524D\u7AEF\uFF0B\u5F8C\u7AEF\u7A0B\u5F0F\u3001Docker \u6620\u50CF\uFF0F\u5BB9\u5668\uFF0F\u5EFA\u7F6E\u5FEB\u53D6\u3001PostgreSQL\uFF0FQdrant volume \u8207\u539F\u59CB Parquet\uFF1B\u4E0D\u542B .venv \u8207\u5176\u4ED6\u975E Judgment Docker volume\u3002
    </div>
  </section>`}function Xr(e){let t=e.host||{},s=t.cpu||{},a=t.memory||{},r=t.swap||{},i=e.storage||{},o=i.filesystem||{},l=Number(i.judgment_total_bytes||0),m=Array.isArray(e.disk)?e.disk:[],b=m[0]||{},w=Number(o.total_bytes||b.total||0),f=w?l/w*100:0,v=[s.load_1,s.load_5,s.load_15].map(y=>y??"\u2014").join(" / "),x=t.uptime_seconds===null||t.uptime_seconds===void 0?"\u2014":F(Number(t.uptime_seconds)*1e3),h=[b.label?et("HDD \u5DF2\u4F7F\u7528","database",`${c(b.percent)}%`,`${O(b.used)} / ${O(b.total)} \xB7 \u5269\u9918 ${O(b.free)}<br><span class="mono">${n(b.path||"")}</span>`,b.percent):"",l?et("Judgment \u5143\u4EF6\u5408\u8A08","layers",O(l),`\u7D04\u5360 HDD ${c(f)}% \xB7 \u524D\u7AEF\uFF0F\u5F8C\u7AEF\uFF0FDocker\uFF0FDB volume\uFF0FParquet`,f):"",...m.slice(1).map(y=>et(`\u786C\u789F \xB7 ${y.label}`,"layers",`${c(y.percent)}%`,`${O(y.used)} / ${O(y.total)} \xB7 \u5269\u9918 ${O(y.free)}<br><span class="mono">${n(y.path||"")}</span>`,y.percent))].filter(Boolean).join("");return`<div class="resource-section-head">
      <div>
        <div class="eyebrow">SYSTEM RESOURCE USAGE</div>
        <div class="section-sub">\u66F4\u65B0\u6642\u9593 ${ee(e.checked_at)} \xB7 ${e.status==="operational"?"\u8CC7\u6E90\u8B80\u53D6\u6B63\u5E38":"\u90E8\u5206\u8CC7\u6E90\u964D\u7D1A"}</div>
      </div>
    </div>
    <div class="resource-grid">
      ${et("CPU \u4F7F\u7528\u7387","cpu",`${c(s.percent)}%`,`${c(s.logical_cores)} \u908F\u8F2F\u6838\u5FC3 \xB7 ${c(s.physical_cores)} \u5BE6\u9AD4\u6838\u5FC3<br>Load ${n(v)}`,s.percent)}
      ${et("\u8A18\u61B6\u9AD4","server",`${c(a.percent)}%`,`${O(a.used)} / ${O(a.total)} \xB7 \u53EF\u7528 ${O(a.available)}`,a.percent)}
      ${et("Swap","layers",`${c(r.percent)}%`,`${O(r.used)} / ${O(r.total)}`,r.percent)}
      ${et("\u7A0B\u5E8F\u8207\u958B\u6A5F","activity",`${c(t.processes)} \u500B\u7A0B\u5E8F`,`\u958B\u6A5F ${n(x)}<br>${n(t.platform||"")}`,null)}
    </div>
    <div class="resource-grid resource-disk-grid">${h||'<div class="report-empty-inline">\u627E\u4E0D\u5230\u53EF\u8B80\u53D6\u7684\u78C1\u789F\u3002</div>'}</div>
    ${Yr(e)}
    ${Wr(e)}
    ${Kr(e)}`}function ma(){return`<div class="resource-section-head">
      <div>
        <div class="skeleton skeleton-line" style="width:160px;height:18px"></div>
        <div class="skeleton skeleton-line" style="width:260px;margin-top:8px"></div>
      </div>
    </div>
    <div class="resource-grid">
      ${Array.from({length:4}).map(()=>'<div class="skeleton" style="height:120px;border-radius:var(--radius-md)"></div>').join("")}
    </div>
    <div class="skeleton" style="height:180px;margin-top:16px;border-radius:var(--radius-md)"></div>
    <div class="skeleton" style="height:220px;margin-top:16px;border-radius:var(--radius-md)"></div>`}function Zr(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SYSTEM RESOURCE USAGE</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${Y({tone:"danger",title:"\u8CC7\u6E90 API \u8ACB\u6C42\u5931\u6557",text:n(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-resources-retry">
          ${$("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function ei(e,t,s){let a=e?.data||{},r=e?Ne(e.status):null,i=s?Ne(s.status):null,o={overview:r?`<span class="badge ${r.tone==="ok"?"badge-ok":r.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${n(r.label)}</span>`:"",resources:i?`<span class="badge ${i.tone==="ok"?"badge-ok":i.tone==="warn"?"badge-warn":"badge-danger"} badge-mono">${n(i.label)}</span>`:'<span class="badge badge-neutral badge-mono">\u672A\u8B80\u53D6</span>',data:`<span class="badge badge-neutral badge-mono">${c(a.version_count)}</span>`,runs:`<span class="badge badge-neutral badge-mono">${c(a.run_count)}</span>`};return`<div class="status-sidebar-head">
      <div class="eyebrow">STATUS SECTIONS</div>
      <div class="status-sidebar-title">\u7CFB\u7D71\u5206\u985E</div>
    </div>
    <nav class="status-tab-list" aria-label="\u7CFB\u7D71\u72C0\u614B\u5206\u985E">
      ${ga.map(l=>{let m=l.id===t;return`<button class="status-tab${m?" is-active":""}" type="button"
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
      <span class="mono">${n(e?ee(e.checked_at):"\u2014")}</span>
    </div>`}function ti(e,t,s,a,r){return e==="resources"?s?Xr(s):a?ma():r?Zr(r):ma():e==="architecture"?zr(t):e==="api"?Gr(t):e==="data"?Qr(t):e==="runs"?Jr(t):Ur(t)}function si(){return`<div class="status-hero">
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
    </div>`}function ai(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">STATUS CHECK</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u5FEB\u53D6\u6216\u63A8\u6E2C\u7684\u670D\u52D9\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${Y({tone:"danger",title:"\u72C0\u614B API \u8ACB\u6C42\u5931\u6557",text:n(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-retry">
          ${$("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}async function ni(e,t){let s=!1,a=null,r=null,i="overview",o=null,l=!1,m=null;e.innerHTML=`<section class="page status-page">
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
      <section class="status-panel" id="status-content">${si()}</section>
    </div>
  </section>`;let b=e.querySelector("#status-nav"),w=e.querySelector("#status-content"),f=e.querySelector("#refresh-status"),v=e.querySelector("#auto-refresh"),x=()=>{r&&(b.innerHTML=ei(r,i,o),w.innerHTML=ti(i,r,o,l,m))},h=async({quiet:M=!1}={})=>{if(!l){l=!0,m=null,i==="resources"&&x();try{let _=await U.systemUsage();if(s)return;o=_}catch(_){if(s)return;m=_,M||D(_.message||"\u7121\u6CD5\u53D6\u5F97\u7CFB\u7D71\u8CC7\u6E90\u3002","danger")}finally{s||(l=!1,i==="resources"&&x())}}},y=async({quiet:M=!1}={})=>{M||(f.disabled=!0,V(f,!0,"\u6AA2\u67E5\u4E2D\u2026"));try{let _=await U.status();if(s)return;r=_,x(),M||D("\u670D\u52D9\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(_){if(s)return;w.innerHTML=ai(_),M||D(_.message||"\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002","danger")}finally{s||(f.disabled=!1,V(f,!1))}},N=async({quiet:M=!1}={})=>{await y({quiet:M}),i==="resources"&&await h({quiet:M})};return b.addEventListener("click",M=>{let _=M.target.closest("[data-status-tab]");if(!_)return;let E=_.dataset.statusTab;ga.some(z=>z.id===E)&&(i=E,x(),i==="resources"&&!o&&!l&&h())}),w.addEventListener("click",M=>{M.target.closest("#status-retry")&&y(),M.target.closest("#status-resources-retry")&&h()}),f.addEventListener("click",()=>N()),v.addEventListener("change",()=>{a&&(window.clearInterval(a),a=null),v.checked&&(a=window.setInterval(()=>N({quiet:!0}),3e4),D("\u5DF2\u555F\u7528\u6BCF 30 \u79D2\u81EA\u52D5\u66F4\u65B0\u3002","info",2200))}),await y({quiet:!0}),t&&typeof t.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"),()=>{s=!0,a&&window.clearInterval(a)}}var ps={};Qe(ps,{render:()=>ii});var ha={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"};function ba(e,t){let s=Array.isArray(t)?t:[];return`<div class="tests-model-group">
    <span class="tests-model-label">${n(e)}</span>
    <div class="tests-model-chips">${s.length?s.map(a=>`<span class="chip chip-mono">${n(a)}</span>`).join(""):'<span class="tests-model-empty">\u672A\u5075\u6E2C\u5230\u6A21\u578B</span>'}</div>
  </div>`}function ri(e,t,s){return JSON.stringify({selected:s,runs:(t||[]).map(a=>`${a.run_id}:${a.status}`),run:e?{run_id:e.run_id,status:e.status,progress:e.progress,steps:(e.steps||[]).map(a=>`${a.stage}:${a.model}:${a.status}:${a.progress}`)}:null})}async function ii(e,t){let s=!1,a=!1,r={embedding:[],llm:[]},i=!1,o=null,l=[],m="",b=null,w="";e.innerHTML=`<section class="page tests-page">
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
  </section>`;let f=e.querySelector("#tests-mode-badge"),v=e.querySelector("#tests-mode-toggle"),x=e.querySelector("#tests-mode-summary"),h=e.querySelector("#tests-mode-models"),y=e.querySelector("#tests-mode-status"),N=e.querySelector("#tests-api-form"),M=e.querySelector("#tests-api-input"),_=e.querySelector("#tests-api-preview"),E=e.querySelector("#tests-api-status"),z=e.querySelector("#tests-api-note"),G=e.querySelector("#tests-api-test"),X=e.querySelector("#tests-api-reset"),se=e.querySelector("#tests-api-save"),R=e.querySelector("#tests-refresh"),P=e.querySelector("#tests-flow"),k=(C,u,A="")=>{C&&(C.textContent=u,C.className=`tests-status${A?` is-${A}`:""}`)},q=(C,u="")=>{E&&(E.textContent=C,E.className=`api-dialog-status${u?` is-${u}`:""}`)},B=()=>He()==="query",Q=()=>{let C=Oe(M.value);return C||(window.location.protocol==="file:"?Ot:"")},be=()=>{let C=Q(),u=Fe(),A=ha[He()]||He()||"\u540C\u6E90";_.innerHTML=`\u76EE\u524D\u751F\u6548\uFF1A<strong>${n(Je(u))}</strong>${u?`\uFF08${n(A)}\uFF09`:""}<br />\u6B64\u4F4D\u5740\u7684\u5065\u5EB7\u6AA2\u67E5\uFF1A${n(Ee("/api/health",C))}`},Te=()=>{let C=He(),u=`\u76EE\u524D\u4F86\u6E90\uFF1A${ha[C]||C||"\u540C\u6E90"}\u3002\u512A\u5148\u9806\u5E8F\u70BA ?api= \u2192 \u700F\u89BD\u5668\u5132\u5B58\u503C \u2192 config.js \u2192 \u540C\u6E90\u3002`,A="";C==="query"?(A="is-warn",u="\u6B64\u9801\u7531\u7DB2\u5740\u7684 ?api= \u53C3\u6578\u6307\u5B9A\u5F8C\u7AEF\u4F4D\u5740\uFF0C\u5177\u6709\u6700\u9AD8\u512A\u5148\u9806\u5E8F\u3002\u5132\u5B58\u6216\u6062\u5FA9\u9810\u8A2D\u5728\u6B64\u9801\u4E0D\u6703\u751F\u6548\uFF1B\u8ACB\u5148\u79FB\u9664\u7DB2\u5740\u4E2D\u7684 api \u53C3\u6578\u3002"):gt()?(A="is-warn",u="\u6B64\u9801\u4E0D\u662F\u5F9E localhost \u958B\u555F\uFF0C\u4E14\u5C1A\u672A\u8A2D\u5B9A\u5F8C\u7AEF API\u3002\u8ACB\u586B\u5165 cloudflared \u7684 https:// \u4F4D\u5740\uFF0C\u6216\u90E8\u7F72\u6642\u5728 config.js \u6307\u5B9A apiBase\uFF1BHTTP \u4F4D\u5740\u6703\u88AB HTTPS \u9801\u9762\u963B\u64CB\u3002"):(C==="file-default"||window.location.protocol==="file:")&&(u="\u4EE5 file:// \u76F4\u63A5\u958B\u555F\u6642\uFF0C\u9810\u8A2D\u9023\u5230 http://127.0.0.1:9200\u3002\u82E5\u5F8C\u7AEF\u4F7F\u7528\u5176\u4ED6\u9023\u63A5\u57E0\uFF0C\u8ACB\u5728\u6B64\u4FEE\u6539\u4E26\u5132\u5B58\u3002"),z.textContent=u,z.className=`api-dialog-note${A?` ${A}`:""}`;let I=C==="query";se.disabled=I,X.disabled=I,M.readOnly=I},le=()=>{if(!Ft(M.value))return q("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002","error"),M.focus(),null;let C=Q();return window.location.protocol==="https:"&&/^http:\/\//i.test(C)&&!/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(C)?(q("HTTPS \u9801\u9762\u7121\u6CD5\u9023\u7DDA\u5230 HTTP API\uFF08mixed content\uFF09\u3002\u8ACB\u6539\u7528 cloudflared \u63D0\u4F9B\u7684 https:// \u4F4D\u5740\u3002","error"),M.focus(),null):C},$e=()=>{M.value=Fe(),be(),Te(),q("\u53EF\u5148\u6E2C\u8A66\u9023\u7DDA\uFF0C\u5132\u5B58\u5F8C\u9801\u9762\u6703\u91CD\u65B0\u8F09\u5165\u3002")},H=()=>{let C=Array.isArray(r.embedding)?r.embedding.length:0,u=Array.isArray(r.llm)?r.llm.length:0;if(f&&(f.textContent=i?"\u5207\u63DB\u4E2D\u2026":a?"\u6E2C\u8A66\u6A21\u5F0F ON":"\u6E2C\u8A66\u6A21\u5F0F OFF",f.className=`badge badge-mono ${i?"badge-info":a?"badge-warn":"badge-neutral"}`),v){v.disabled=i,v.classList.toggle("is-on",a),v.classList.toggle("is-off",!a&&!i),v.classList.toggle("is-busy",i),v.setAttribute("aria-checked",a?"true":"false"),v.setAttribute("aria-busy",i?"true":"false"),v.setAttribute("aria-label",i?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F":a?"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF0C\u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\uFF0C\u9EDE\u64CA\u958B\u555F"),v.title=i?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F\u2026":a?"\u6E2C\u8A66\u6A21\u5F0F ON \xB7 \u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F OFF \xB7 \u9EDE\u64CA\u958B\u555F";let A=v.querySelector(".header-power-label");A&&(A.textContent=i?"\u2026":a?"ON":"OFF")}x&&(x.textContent=a?`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${C} \u500B embedding \u8207 ${u} \u500B LLM \u6A21\u578B\u3002`:"\u76EE\u524D\u4F7F\u7528\u5FEB\u901F\u6A21\u5F0F\uFF1A\u55AE\u4E00 embedding \u8207 LLM\u3002"),h&&(h.innerHTML=ba("Embedding",r.embedding)+ba("LLM",r.llm))},de=async()=>{try{let C=await U.testMode();if(s)return;a=!!C.enabled,r=C.models||{embedding:[],llm:[]},k(y,"")}catch(C){if(s)return;a=!1,r={embedding:[],llm:[]},k(y,C.message||"\u7121\u6CD5\u8B80\u53D6\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF API\u3002","error")}s||H()},Ie=async()=>{if(i)return;let C=!a;i=!0,H(),k(y,C?"\u6B63\u5728\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u2026":"\u6B63\u5728\u95DC\u9589\u6E2C\u8A66\u6A21\u5F0F\u2026");try{let u=await U.setTestMode(C);if(s)return;a=!!u.enabled,r=u.models||{embedding:[],llm:[]},window.dispatchEvent(new CustomEvent("judgment:test-mode",{detail:{enabled:a,models:r}}));let A=r.embedding?.length||0,I=r.llm?.length||0;k(y,a?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A\u4E0B\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C ${A} \u500B embedding \u8207 ${I} \u500B LLM \u6A21\u578B\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","ok"),D(a?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A${A} \u500B embedding\u3001${I} \u500B LLM\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002",a?"ok":"info",6e3),await Ae()}catch(u){s||(k(y,u.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","error"),D(u.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","danger",6e3))}finally{i=!1,s||H()}},Se=()=>{if(!P)return;let C=ri(o,l,m);C!==w&&(w=C,P.innerHTML=at(o,l,m))},qe=async()=>{try{let C=await U.testRuns(30);if(s)return;l=Array.isArray(C.runs)?C.runs:[]}catch{if(s)return;l=[]}},Ae=async()=>{try{let C=m?await U.testRun(m):await U.testRunCurrent();if(s)return;o=C.run||null,!m&&o&&o.status!=="running"&&!l.some(u=>u.run_id===o.run_id)&&await qe()}catch{if(s)return;o=null}s||Se()};M?.addEventListener("input",()=>{be(),q("\u5C1A\u672A\u6E2C\u8A66\u6B64\u4F4D\u5740\u3002")}),G?.addEventListener("click",async()=>{let C=le();if(C!==null){V(G,!0,"\u6E2C\u8A66\u4E2D\u2026"),q(`\u6B63\u5728\u9023\u7DDA\u5230 ${Je(C)||"\u540C\u6E90"}\u2026`);try{let u=await $s(C);if(s)return;q(`\u9023\u7DDA\u6210\u529F \xB7 v${u.version} \xB7 ${u.duration_ms} ms \xB7 GET ${Ee("/api/health",C)}`,"ok")}catch(u){s||q(u.message||"\u9023\u7DDA\u6E2C\u8A66\u5931\u6557\u3002","error")}finally{s||V(G,!1)}}}),N?.addEventListener("submit",C=>{if(C.preventDefault(),B())return;let u=le();u!==null&&(Gt(u),D(`\u5F8C\u7AEF API \u5DF2\u8A2D\u70BA ${Je(u)}\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026`,"ok",1600),window.setTimeout(()=>window.location.reload(),120))}),X?.addEventListener("click",()=>{B()||(Gt(""),D("\u5DF2\u6E05\u9664\u700F\u89BD\u5668\u5132\u5B58\u7684 API \u4F4D\u5740\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026","info",1600),window.setTimeout(()=>window.location.reload(),120))}),v?.addEventListener("click",Ie),P?.addEventListener("change",async C=>{C.target.id==="test-run-select"&&(m=String(C.target.value||""),await Ae())}),P?.addEventListener("click",async C=>{C.target.closest("#test-flow-refresh")&&(m="",await qe(),await Ae())}),R?.addEventListener("click",async()=>{V(R,!0,"\u66F4\u65B0\u4E2D\u2026"),$e(),await Promise.allSettled([de(),qe()]),s||await Ae(),s||(V(R,!1),D("\u7CFB\u7D71\u6E2C\u8A66\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200))});let De=C=>{a=!!C.detail?.enabled,r=C.detail?.models||{embedding:[],llm:[]},H()};return window.addEventListener("judgment:test-mode",De),$e(),H(),await Promise.allSettled([de(),qe()]),await Ae(),b=window.setInterval(async()=>{s||document.hidden||m||await Ae()},2500),typeof t?.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"),()=>{s=!0,b&&window.clearInterval(b),window.removeEventListener("judgment:test-mode",De)}}var $a="rag",It={rag:{page:ls,title:"RAG \u63D0\u554F \xB7 Judgment RAG Console"},data:{page:ns,title:"\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"},quality:{page:ds,title:"\u8CC7\u6599\u54C1\u8CEA \xB7 Judgment RAG Console"},performance:{page:is,title:"\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"},processing:{page:cs,title:"\u8CC7\u6599\u8655\u7406 \xB7 Judgment RAG Console"},status:{page:us,title:"\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"},tests:{page:ps,title:"\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"}},Nt=document.getElementById("app-main"),Ct=null,Rt=0;function oi(){return`<div class="page-loading" aria-live="polite">
    <div class="skeleton skeleton-title"></div>
    <div class="skeleton skeleton-subtitle"></div>
    <div class="skeleton-grid">
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
    </div>
  </div>`}function vs(){let t=window.location.hash.replace(/^#\/?/,"").trim().split("/")[0]||$a;return Object.prototype.hasOwnProperty.call(It,t)?t:$a}function li(e){document.querySelectorAll("[data-route]").forEach(t=>{let s=t.dataset.route===e;t.classList.toggle("is-active",s),s?t.setAttribute("aria-current","page"):t.removeAttribute("aria-current")})}function ci(e){return`<section class="page">
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
  </section>`}async function ms(){let e=vs(),t=++Rt;if(li(e),window.location.hash!==`#/${e}`&&window.history.replaceState(null,"",`#/${e}`),typeof Ct=="function"){try{Ct()}catch{}Ct=null}document.title=It[e].title,Nt.innerHTML=oi(),Nt.focus({preventScroll:!0}),window.scrollTo({top:0,behavior:"auto"});let s={route:e,navigate(a){It[a]&&(window.location.hash=`#/${a}`)},setTitle(a){t===Rt&&a&&(document.title=a)}};try{let a=await It[e].page.render(Nt,s);if(t!==Rt){typeof a=="function"&&a();return}Ct=typeof a=="function"?a:null}catch(a){if(t!==Rt)return;console.error("Failed to render route",e,a),Nt.innerHTML=ci(a);let r=document.getElementById("route-retry");r&&r.addEventListener("click",()=>ms()),D("\u9801\u9762\u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}}function di(){document.addEventListener("keydown",e=>{if(e.key!=="/"||e.metaKey||e.ctrlKey||e.altKey)return;let t=document.activeElement;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable)||vs()!=="rag")return;let a=document.getElementById("rag-question");a&&(e.preventDefault(),a.focus())})}function ya(){xs(),di(),window.addEventListener("hashchange",ms),ms(),gt()&&window.setTimeout(()=>{vs()!=="tests"&&(window.location.hash="#/tests")},700)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",ya):ya();})();
