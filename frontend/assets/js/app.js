(()=>{var ha=Object.defineProperty;var Ke=(e,t)=>{for(var s in t)ha(e,s,{get:t[s],enumerable:!0})};var Ht="judgment.api_base",Ut="http://127.0.0.1:9200",de=class extends Error{constructor(t,s=0,a=null){super(t),this.name="ApiError",this.status=s,this.detail=a}};function $s(e){return["localhost","127.0.0.1","::1","[::1]"].includes(e)}function Pe(e){let t=String(e??"").trim();if(!t||t==="/")return"";t=t.replace(/\/+$/,""),!/^https?:\/\//i.test(t)&&!t.startsWith("/")&&(t=`${$s(t.split(":")[0])?"http":"https"}://${t}`);try{let s=new URL(t,window.location.href);return s.protocol!=="http:"&&s.protocol!=="https:"?"":`${s.origin}${s.pathname==="/"?"":s.pathname.replace(/\/+$/,"")}`}catch{return t}}function zt(e){let t=Pe(e);if(!t)return!0;try{let s=new URL(t);return s.protocol==="http:"||s.protocol==="https:"}catch{return!1}}function Qt(){try{let e=new URLSearchParams(window.location.search);return e.has("api")?Pe(e.get("api")):null}catch{return null}}function Gt(){try{let e=window.localStorage.getItem(Ht);return e===null?null:Pe(e)}catch{return null}}function Jt(){let e=window.JUDGMENT_CONFIG&&window.JUDGMENT_CONFIG.apiBase;return Pe(e||"")}function qe(){let e=Qt();if(e!==null)return e;let t=Gt();if(t!==null)return t;let s=Jt();return s||(window.location.protocol==="file:"?Ut:"")}function ba(){if(Qt()!==null)return!0;let e=Gt();return e!==null?!!e:!!Jt()}function Ye(){return Qt()!==null?"query":Gt()!==null?"storage":Jt()?"config":window.location.protocol==="file:"?"file-default":"same-origin"}function Vt(){return ba()||window.location.protocol==="file:"||!window.JUDGMENT_CONFIG?!1:!$s(window.location.hostname)}function Wt(e){let t=Pe(e);try{t?window.localStorage.setItem(Ht,t):window.localStorage.removeItem(Ht)}catch{}return t}function Ce(e=qe()){return e||"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"}function Se(e,t=qe()){return t?`${t}${e.startsWith("/")?e:`/${e}`}`:e}function Kt(e){return`\u7121\u6CD5\u9023\u7DDA\u5230\u4F3A\u670D\u5668${e?`\uFF08${e}\uFF09`:""}\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u662F\u5426\u555F\u52D5\uFF0C\u6216\u9EDE\u9078 header \u7684\u300CAPI\u300D\u8A2D\u5B9A\u5F8C\u7AEF\u4F4D\u5740\u3002`}async function ne(e,t={}){let s=qe(),a=new AbortController,r=t.timeout===void 0?3e4:t.timeout,i=r>0?window.setTimeout(()=>a.abort(),r):null,o=Date.now(),l=performance.now(),g=t.requestId||ys(),b={Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},"X-Judgment-Request-Id":g,"X-Judgment-Client-Started-At":String(o),...t.headers||{}},$;try{$=await fetch(Se(e,s),{...t,headers:b,signal:a.signal})}catch(x){throw x.name==="AbortError"?new de("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new de(Kt(s),0,x)}finally{i&&window.clearTimeout(i)}let f=null;if(($.headers.get("content-type")||"").includes("application/json"))try{f=await $.json()}catch{f=null}else try{f=await $.text()}catch{f=null}let _=performance.now(),v=$.headers.get("X-Judgment-Request-Id")||g;if(t.trackClient!==!1&&v){let x=Math.round(performance.now()-l);window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{ws({request_id:v,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:x,render_ms:Math.max(0,Math.round(performance.now()-_)),status:$.ok?"success":"failed"})})})}if(!$.ok){let x=f&&typeof f=="object"?f.detail||f.message:f,N=typeof x=="string"&&x?x:`\u4F3A\u670D\u5668\u56DE\u61C9 ${$.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new de(N,$.status,x)}return f}function ys(){try{if(window.crypto&&typeof window.crypto.randomUUID=="function")return window.crypto.randomUUID().replace(/-/g,"").slice(0,32)}catch{}return`req${Date.now().toString(36)}${Math.random().toString(36).slice(2,10)}`}function ws(e){try{fetch(Se("/api/performance/client",qe()),{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e),keepalive:!0}).catch(()=>{})}catch{}}async function _s(e){let t=Pe(e);if(!zt(t))throw new de("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002");let s=performance.now(),a=new AbortController,r=window.setTimeout(()=>a.abort(),1e4);try{let i=await fetch(Se("/api/health",t),{headers:{Accept:"application/json"},signal:a.signal});if(!i.ok)throw new de(`API \u56DE\u61C9 ${i.status}\u3002`,i.status);let o=await i.json();return{base:t,version:o.version||"\u2014",duration_ms:Math.round(performance.now()-s)}}catch(i){throw i instanceof de?i:i.name==="AbortError"?new de("\u9023\u7DDA\u6E2C\u8A66\u903E\u6642\uFF0C\u8ACB\u78BA\u8A8D API \u4F4D\u5740\u8207\u7DB2\u8DEF\u3002",0,i):new de(Kt(t),0,i)}finally{window.clearTimeout(r)}}var z={health(){return ne("/api/health")},status(){return ne("/api/status",{trackClient:!1})},catalog(){return ne("/api/catalog")},query({database:e,filters:t,page:s=1,pageSize:a=25}){return ne("/api/query",{method:"POST",body:JSON.stringify({database:e,filters:t,page:s,page_size:a})})},schemaSuggest({database:e,table:t,column:s,query:a,limit:r=1e3}){let i=new URLSearchParams({database:e,table:t,column:s,q:a||"",limit:String(r)});return ne(`/api/schema/suggest?${i.toString()}`,{timeout:3e4})},lawDetail(e,t="",s="",a=""){let r=new URLSearchParams({law_key:e});return t&&r.set("source_type",t),s&&r.set("version_id",String(s)),a&&r.set("article_no",String(a)),ne(`/api/law?${r.toString()}`,{timeout:45e3})},judgmentDetail(e,t=""){let s=new URLSearchParams({jid:e});return t&&s.set("source",t),ne(`/api/judgment?${s.toString()}`,{timeout:45e3})},testMode(){return ne("/api/test-mode",{trackClient:!1})},setTestMode(e){return ne("/api/test-mode",{method:"POST",body:JSON.stringify({enabled:!!e}),trackClient:!1})},testRuns(e=20){let t=new URLSearchParams({limit:String(e)});return ne(`/api/test-runs?${t.toString()}`,{trackClient:!1})},testRunCurrent(){return ne("/api/test-runs/current",{trackClient:!1})},testRun(e){return ne(`/api/test-runs/${encodeURIComponent(e)}`,{trackClient:!1})},performanceOptions(){return ne("/api/performance/options",{trackClient:!1})},performance(e={},t=1,s=25){let a=new URLSearchParams;for(let[r,i]of Object.entries(e))i==null||i===""||a.set(r,String(i));return a.set("page",String(t)),a.set("page_size",String(s)),ne(`/api/performance?${a.toString()}`,{timeout:45e3,trackClient:!1})},quality(){return ne("/api/quality",{timeout:18e4,trackClient:!1})},processing(){return ne("/api/processing",{timeout:45e3,trackClient:!1})},processingPlan(){return ne("/api/processing/plan",{timeout:45e3,trackClient:!1})},startProcessingUpdate(e=!1){return ne("/api/processing/update",{method:"POST",body:JSON.stringify({index:!!e}),timeout:45e3,trackClient:!1})},stopProcessingUpdate(){return ne("/api/processing/stop",{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},rag(e,t={}){return ne("/api/rag/query",{method:"POST",body:JSON.stringify({question:e}),timeout:t.testMode?0:3e5})},async ragStream(e,{testMode:t=!1,onStep:s=null,onPartial:a=null,onToken:r=null,onTokenReset:i=null}={}){let o=qe(),l=new AbortController,g=t?0:3e5,b=g>0?window.setTimeout(()=>l.abort(),g):null,$=Date.now(),f=performance.now(),h=ys(),_={Accept:"text/event-stream","Content-Type":"application/json","X-Judgment-Request-Id":h,"X-Judgment-Client-Started-At":String($)},v;try{v=await fetch(Se("/api/rag/query/stream",o),{method:"POST",headers:_,body:JSON.stringify({question:e}),signal:l.signal})}catch(M){throw M.name==="AbortError"?new de("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new de(Kt(o),0,M)}finally{b&&window.clearTimeout(b)}if(!v.ok){let M=null;try{M=await v.json()}catch{M=null}let R=M&&typeof M=="object"&&M.detail?String(M.detail):`\u4F3A\u670D\u5668\u56DE\u61C9 ${v.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new de(R,v.status,M)}if(!v.body)throw new de("\u4F3A\u670D\u5668\u6C92\u6709\u56DE\u50B3\u53EF\u8B80\u53D6\u7684\u6D41\u7A0B\u4E32\u6D41\u3002",0,null);let x=v.body.getReader(),N=new TextDecoder,P="",k=null,L=null;try{for(;;){let{value:M,done:R}=await x.read();if(R)break;P+=N.decode(M,{stream:!0});let V=P.indexOf(`

`);for(;V>=0;){let F=P.slice(0,V).replace(/\r/g,"");P=P.slice(V+2);let K="message",j=[];for(let C of F.split(`
`))C.startsWith("event:")?K=C.slice(6).trim():C.startsWith("data:")&&j.push(C.slice(5).trimStart());if(j.length){let C=null;try{C=JSON.parse(j.join(`
`))}catch{C=null}if(C)if(K==="step"&&typeof s=="function")try{s(C)}catch{}else if(K==="partial"){if(typeof a=="function")try{a(C)}catch{}}else if(K==="token"){if(typeof r=="function")try{r(String(C.text||""))}catch{}}else if(K==="token_reset"){if(typeof i=="function")try{i()}catch{}}else K==="result"?k=C:K==="error"&&(L=new de(C.message||C.detail||"RAG \u6D41\u7A0B\u5931\u6557\u3002",0,C))}V=P.indexOf(`

`)}}}finally{try{await x.cancel()}catch{}b&&window.clearTimeout(b)}if(L)throw L;if(!k)throw new de("\u6D41\u7A0B\u4E32\u6D41\u7D50\u675F\uFF0C\u4F46\u6C92\u6709\u6536\u5230\u6700\u7D42\u56DE\u7B54\u3002",0,null);let E=Math.round(performance.now()-f);return ws({request_id:h,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:E,render_ms:0,status:"success"}),k}};var $a={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},ya={operational:{label:"\u6B63\u5E38",tone:"ok"},success:{label:"\u6210\u529F",tone:"ok"},ok:{label:"\u6B63\u5E38",tone:"ok"},healthy:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},warning:{label:"\u6CE8\u610F",tone:"warn"},empty:{label:"\u7121\u8CC7\u6599",tone:"warn"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},running:{label:"\u57F7\u884C\u4E2D",tone:"info"},pending:{label:"\u7B49\u5F85",tone:"idle"},skipped:{label:"\u7565\u904E",tone:"idle"},partial:{label:"\u90E8\u5206\u6210\u529F",tone:"warn"},preview:{label:"\u9810\u89BD\u6A21\u5F0F",tone:"info"},retrieval_only:{label:"\u50C5\u6AA2\u7D22\u7D50\u679C",tone:"warn"},not_indexed:{label:"\u5C1A\u672A\u7D22\u5F15",tone:"warn"},missing_query:{label:"\u7B49\u5F85\u67E5\u8A62",tone:"idle"},client_side:{label:"\u700F\u89BD\u5668\u7AEF",tone:"info"},not_configured:{label:"\u672A\u8A2D\u5B9A",tone:"idle"},unavailable:{label:"\u96E2\u7DDA",tone:"danger"},failed:{label:"\u5931\u6557",tone:"danger"},error:{label:"\u932F\u8AA4",tone:"danger"}},wa={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},_a={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},ks={search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',send:'<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',refresh:'<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 4v5.5H15"/>',copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',check:'<path d="m5 12 4.2 4.2L19 6.5"/>',x:'<path d="m6 6 12 12M18 6 6 18"/>',external:'<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/>',message:'<path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H6l-3 2 1.3-4.2A8.5 8.5 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',history:'<path d="M3.2 12a8.8 8.8 0 1 0 2.8-6.3L3.2 8.5"/><path d="M3 3.5v5h5"/><path d="M12 7.5V12l3 1.8"/>',database:'<ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/><path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/>',layers:'<path d="m12 3 9 4.8-9 4.8-9-4.8L12 3Z"/><path d="m3 12.2 9 4.8 9-4.8"/><path d="m3 16.7 9 4.8 9-4.8"/>',cube:'<path d="m12 2.8 8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4L12 2.8Z"/><path d="m3.8 7.4 8.2 4.6 8.2-4.6"/><path d="M12 12v9.2"/>',browser:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6.5 6.5h.01"/>',download:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',chevronLeft:'<path d="m14.5 5-7 7 7 7"/>',chevronRight:'<path d="m9.5 5 7 7-7 7"/>',chevronDown:'<path d="m5 9 7 7 7-7"/>',arrowRight:'<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',alert:'<path d="M12 3 2.5 20.5h19L12 3Z"/><path d="M12 9v4.5"/><path d="M12 17.5h.01"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',sparkles:'<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"/>',table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M9 9.5V20M15 9.5V20"/>',sliders:'<path d="M4 7h8M16 7h4M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',server:'<rect x="3" y="4" width="18" height="6" rx="1.6"/><rect x="3" y="14" width="18" height="6" rx="1.6"/><path d="M7 7h.01M7 17h.01"/>',brain:'<path d="M9.7 4.2a2.8 2.8 0 0 0-3 2.8 2.8 2.8 0 0 0-1.1 5.2A2.9 2.9 0 0 0 7.8 18a2.9 2.9 0 0 0 3.9 2V4.2a2.8 2.8 0 0 0-2 0Z"/><path d="M14.3 4.2a2.8 2.8 0 0 1 3 2.8 2.8 2.8 0 0 1 1.1 5.2A2.9 2.9 0 0 1 16.2 18a2.9 2.9 0 0 1-3.9 2"/>',cloud:'<path d="M7 18.5h10.5a3.5 3.5 0 0 0 .4-7 5.5 5.5 0 0 0-10.6-1.3A4.2 4.2 0 0 0 7 18.5Z"/>',code:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',play:'<path d="M7 4.5v15l13-7.5-13-7.5Z"/>',file:'<path d="M6 2.8h8l4.5 4.5v13.9H6V2.8Z"/><path d="M14 2.8V7.5h5"/>',activity:'<path d="M3 12h4l2.2-5 4.1 10 2.2-5H21"/>',shield:'<path d="M12 2.8 20 6v6c0 4.7-3.2 8-8 9.2C7.2 20 4 16.7 4 12V6l8-3.2Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',terminal:'<path d="m5 7 5 5-5 5"/><path d="M12 17h7"/>',filter:'<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',link:'<path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10.2 5.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-1.4 1.4a5 5 0 0 0 7.1 7.1l1.2-1.2"/>',grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9.5 9.5h5v5h-5z"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>'};function n(e){return String(e??"").replace(/[&<>"']/g,t=>$a[t])}function y(e,t=16,s=""){let a=ks[e]||ks.info;return`<svg${s?` class="${n(s)}"`:""} width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a}</svg>`}function u(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?new Intl.NumberFormat("zh-TW").format(s):t}function ve(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=["B","KB","MB","GB","TB"],a=0;for(;t>=1024&&a<s.length-1;)t/=1024,a+=1;return a===0?`${t.toFixed(0)} B`:`${t.toFixed(1)} ${s[a]}`}function Yt(e){if(e instanceof Date)return e;if(typeof e=="number"){let r=new Date(e);return Number.isNaN(r.getTime())?null:r}let t=String(e??"").trim();if(!t)return null;if(/^\d{8}$/.test(t))return new Date(Number(t.slice(0,4)),Number(t.slice(4,6))-1,Number(t.slice(6,8)));let s=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(t),a=new Date(s?`${t}Z`:t);return Number.isNaN(a.getTime())?null:a}function Le(e){let t=Yt(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit"}).format(t):e?n(e):"\u2014"}function se(e){let t=Yt(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1}).format(t):e?n(e):"\u2014"}function Xe(e){let t=Yt(e);if(!t)return"";let s=Date.now()-t.getTime();return s<45e3?"\u525B\u525B":s<36e5?`${Math.max(1,Math.round(s/6e4))} \u5206\u9418\u524D`:s<864e5?`${Math.round(s/36e5)} \u5C0F\u6642\u524D`:s<6048e5?`${Math.round(s/864e5)} \u5929\u524D`:Le(t)}function D(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;if(t<6e4)return`${(t/1e3).toFixed(1)} s`;let s=Math.floor(t/6e4),a=Math.round(t%6e4/1e3);return`${s}m ${a}s`}function Re(e){return ya[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function W(e,t){let s=Re(e);return`<span class="badge ${wa[s.tone]}"><span class="status-dot ${_a[s.tone]}"></span>${n(t||s.label)}</span>`}function ka(e){return e==="law"?'<span class="badge badge-info">\u6CD5\u898F</span>':e==="order"?'<span class="badge badge-neutral">\u547D\u4EE4</span>':e?`<span class="badge badge-neutral">${n(e)}</span>`:'<span class="cell-empty">\u2014</span>'}function gt(e,t){let s=String(e??"");return s.length>t?`${s.slice(0,t)}\u2026`:s}function ft(e,t="text"){if(e==null||e==="")return'<span class="cell-empty">\u2014</span>';switch(t){case"boolean":return e?'<span class="badge badge-ok">\u662F</span>':'<span class="badge badge-neutral">\u5426</span>';case"status":return W(String(e));case"source":return ka(String(e));case"number":return`<span class="mono">${u(e)}</span>`;case"duration":return`<span class="mono">${D(e)}</span>`;case"datetime":return`<span class="mono">${se(e)}</span>`;case"date":return`<span class="mono">${Le(e)}</span>`;case"url":{let s=String(e),a=gt(s.replace(/^https?:\/\//,""),46);return`<span class="cell-url"><a href="${n(s)}" target="_blank" rel="noopener noreferrer" title="${n(s)}">${y("external",10)}${n(a)}</a></span>`}case"mono":{let s=String(e);return`<span class="cell-mono cell-truncate" title="${n(s)}">${n(gt(s,54))}</span>`}case"longtext":{let s=String(e);return`<span class="cell-truncate" title="${n(s)}">${n(gt(s,100))}</span>`}default:{let s=String(e);return`<span class="cell-truncate" title="${n(s)}">${n(gt(s,90))}</span>`}}}function G({tone:e="info",title:t,text:s,iconName:a="info"}){let r=e==="ok"?"check":e==="danger"||e==="warn"?"alert":"i";return`<div class="notice notice-${e}" role="status">
    <span class="notice-icon" aria-hidden="true">${r==="i"?"i":y(r,12)}</span>
    <div class="notice-body">
      ${t?`<strong>${n(t)}</strong>`:""}
      ${s?`<p>${s}</p>`:""}
    </div>
  </div>`}function ge({iconName:e="search",title:t,text:s="",actions:a="",className:r=""}){return`<div class="empty-state ${r}">
    <span class="empty-icon">${y(e,24)}</span>
    <h3 class="empty-title">${n(t)}</h3>
    ${s?`<p class="empty-text">${s}</p>`:""}
    ${a?`<div class="empty-actions">${a}</div>`:""}
  </div>`}function J(e,t,s="\u8655\u7406\u4E2D\u2026"){e&&(t?(e.dataset.idleHtml||(e.dataset.idleHtml=e.innerHTML),e.disabled=!0,e.classList.add("is-loading"),e.innerHTML=`<span class="spinner" aria-hidden="true"></span><span>${n(s)}</span>`):(e.disabled=!1,e.classList.remove("is-loading"),e.dataset.idleHtml&&(e.innerHTML=e.dataset.idleHtml,delete e.dataset.idleHtml)))}function I(e,t="info",s=4200){let a=document.getElementById("toast-region");if(!a)return null;let r={info:"i",ok:"\u2713",warn:"!",danger:"\xD7"},i=document.createElement("div");i.className=`toast toast-${t}`,i.setAttribute("role",t==="danger"?"alert":"status"),i.innerHTML=`<span class="toast-mark" aria-hidden="true">${r[t]||"i"}</span>
    <div class="toast-body">${n(e)}</div>
    <button class="toast-close" type="button" aria-label="\u95DC\u9589\u901A\u77E5">\xD7</button>`;let o=()=>{i.isConnected&&(i.classList.add("is-leaving"),window.setTimeout(()=>i.remove(),190))};return i.querySelector(".toast-close").addEventListener("click",o),a.appendChild(i),s>0&&window.setTimeout(o,s),i}async function ht(e){try{return await navigator.clipboard.writeText(e),!0}catch{let s=document.createElement("textarea");s.value=e,s.setAttribute("readonly",""),s.style.position="fixed",s.style.opacity="0",document.body.appendChild(s),s.select();let a=!1;try{a=document.execCommand("copy")}catch{a=!1}return s.remove(),a}}function Be(e,t,s="text/plain;charset=utf-8"){let a=new Blob([t],{type:s}),r=URL.createObjectURL(a),i=document.createElement("a");i.href=r,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(r),1e3)}var Ss="judgment.theme",Xt="nvidia",As=[{id:"vercel",name:"Vercel",description:"\u9ED1\u767D\u7CBE\u6E96 \xB7 Geist \xB7 \u5E7E\u4F55\u7559\u767D",swatches:["#171717","#0070f3","#fafafa"],metaColor:"#ffffff"},{id:"apple",name:"Apple",description:"SF Pro \xB7 \u5927\u5713\u89D2 \xB7 \u6C89\u6D78\u7559\u767D",swatches:["#1d1d1f","#0071e3","#f5f5f7"],metaColor:"#fbfbfd"},{id:"meta",name:"Meta",description:"Optimistic \xB7 \u660E\u4EAE\u85CD \xB7 \u81A0\u56CA\u5143\u4EF6",swatches:["#0064e0","#0091ff","#f1f4f7"],metaColor:"#ffffff"},{id:"nvidia",name:"NVIDIA",description:"GPU \u7DA0 \xB7 \u9ED1\u5E95 \xB7 \u92B3\u5229\u76F4\u89D2",swatches:["#76b900","#000000","#f7f7f7"],metaColor:"#000000"},{id:"ibm",name:"IBM",description:"Carbon \xB7 Plex Sans \xB7 \u4F01\u696D\u85CD",swatches:["#0f62fe","#161616","#f4f4f4"],metaColor:"#161616"},{id:"stripe",name:"Stripe",description:"\u7D2B\u975B\u6F38\u5C64 \xB7 \u7CBE\u5BC6\u91D1\u878D\u611F",swatches:["#635bff","#ea2261","#f6f9fc"],metaColor:"#ffffff"},{id:"linear",name:"Linear",description:"\u6DF1\u7A7A\u9ED1 \xB7 \u975B\u7D2B \xB7 \u6975\u7C21\u7DDA\u689D",swatches:["#5e6ad2","#010102","#e8e8ec"],metaColor:"#010102"},{id:"figma",name:"Figma",description:"\u591A\u5F69\u8272\u584A \xB7 \u5354\u4F5C\u611F \xB7 \u85CD\u8272\u7126\u9EDE",swatches:["#f24e1e","#a259ff","#0acf83"],metaColor:"#ffffff"},{id:"notion",name:"Notion",description:"\u6696\u767D\u7D19\u5F35 \xB7 \u896F\u7DDA\u6A19\u984C \xB7 \u77E5\u8B58\u5EAB",swatches:["#191918","#0075de","#f7f6f3"],metaColor:"#ffffff"},{id:"openai",name:"OpenAI",description:"\u6696\u7070\u756B\u5E03 \xB7 \u9ED1\u8272\u884C\u52D5 \xB7 \u7DA0\u8272\u8A0A\u865F",swatches:["#10a37f","#0d0d0d","#f9f9f7"],metaColor:"#f9f9f7"}],Zt=new Map(As.map(e=>[e.id,e]));function xa(e){return Zt.has(e)}function Sa(e){return Zt.get(e)||Zt.get(Xt)}function Aa(){try{let e=window.localStorage.getItem(Ss);return xa(e)?e:Xt}catch{return Xt}}function xs(e,{persist:t=!0}={}){let s=Sa(e);document.documentElement.dataset.theme=s.id;let a=document.getElementById("theme-color-meta");a&&a.setAttribute("content",s.metaColor);let r=document.getElementById("theme-label");r&&(r.textContent=s.name);let i=document.getElementById("theme-swatches");if(i&&(i.innerHTML=s.swatches.map(o=>`<i class="style-swatch" style="--swatch:${n(o)}"></i>`).join("")),document.querySelectorAll(".theme-option").forEach(o=>{let l=o.dataset.themeId===s.id;o.classList.toggle("is-active",l),o.setAttribute("aria-checked",l?"true":"false")}),t)try{window.localStorage.setItem(Ss,s.id)}catch{}return window.dispatchEvent(new CustomEvent("judgment:theme",{detail:{theme:s.id}})),s}function La(e){let t=As.map((s,a)=>{let r=s.swatches.map(i=>`<i style="--swatch:${n(i)}"></i>`).join("");return`<button class="theme-option" type="button" role="menuitemradio"
        data-theme-id="${s.id}" aria-checked="false">
        <span class="theme-option-index">${String(a+1).padStart(2,"0")}</span>
        <span class="theme-option-body">
          <span class="theme-option-name">${n(s.name)}</span>
          <span class="theme-option-desc">${n(s.description)}</span>
        </span>
        <span class="theme-option-swatches" aria-hidden="true">${r}</span>
        <span class="theme-option-check" aria-hidden="true">${y("check",14)}</span>
      </button>`}).join("");e.innerHTML=`<div class="style-menu-head">
      <strong>\u9078\u64C7\u4ECB\u9762\u98A8\u683C</strong>
      <span>10 \u7A2E\u79D1\u6280\u54C1\u724C\u8A9E\u8A00</span>
    </div>${t}`}function Ls(){let e=document.getElementById("style-picker"),t=document.getElementById("style-trigger"),s=document.getElementById("style-menu");if(!e||!t||!s)return;La(s),xs(Aa(),{persist:!1});let a=()=>Array.from(s.querySelectorAll(".theme-option")),r=()=>{s.hidden=!1,t.setAttribute("aria-expanded","true");let o=s.querySelector(".theme-option.is-active")||a()[0];o&&o.focus()},i=({restoreFocus:o=!1}={})=>{s.hidden||(s.hidden=!0,t.setAttribute("aria-expanded","false"),o&&t.focus())};t.addEventListener("click",()=>{s.hidden?r():i({restoreFocus:!0})}),t.addEventListener("keydown",o=>{(o.key==="ArrowDown"||o.key==="ArrowUp")&&(o.preventDefault(),r())}),s.addEventListener("click",o=>{let l=o.target.closest(".theme-option");l&&(xs(l.dataset.themeId),i({restoreFocus:!0}))}),s.addEventListener("keydown",o=>{let l=a(),g=l.indexOf(document.activeElement);if(o.key==="Escape"){o.preventDefault(),i({restoreFocus:!0});return}if(o.key==="ArrowDown"||o.key==="ArrowUp"){o.preventDefault();let b=o.key==="ArrowDown"?1:-1,$=l[(g+b+l.length)%l.length];$&&$.focus();return}if(o.key==="Home"||o.key==="End"){o.preventDefault();let b=o.key==="Home"?l[0]:l[l.length-1];b&&b.focus()}}),document.addEventListener("pointerdown",o=>{e.contains(o.target)||i()}),document.addEventListener("keydown",o=>{o.key==="Escape"&&i()})}var ps={};Ke(ps,{render:()=>Jn});var Ma="judgment-console";var Me="query_history",Ie="settings";var Ee={history:[],settings:new Map,nextId:1},bt=null,fe=!("indexedDB"in window);function rt(e){return new Promise((t,s)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>s(e.error)})}function Fe(e){return new Promise((t,s)=>{e.oncomplete=()=>t(),e.onerror=()=>s(e.error),e.onabort=()=>s(e.error||new Error("transaction aborted"))})}function He(){return bt||(bt=new Promise((e,t)=>{if(!("indexedDB"in window)){fe=!0,t(new Error("IndexedDB is unavailable"));return}let s;try{s=window.indexedDB.open(Ma,1)}catch(a){fe=!0,t(a);return}s.onupgradeneeded=()=>{let a=s.result;if(!a.objectStoreNames.contains(Me)){let r=a.createObjectStore(Me,{keyPath:"id",autoIncrement:!0});r.createIndex("created_at","created_at"),r.createIndex("kind","kind")}a.objectStoreNames.contains(Ie)||a.createObjectStore(Ie,{keyPath:"key"})},s.onsuccess=()=>{let a=s.result;a.onversionchange=()=>a.close(),e(a)},s.onerror=()=>{fe=!0,t(s.error||new Error("Unable to open IndexedDB"))},s.onblocked=()=>{fe=!0,t(new Error("IndexedDB upgrade blocked by another tab"))}}),bt)}function Ms(){return"indexedDB"in window}function Ts(){return fe}function $t(){return fe?"memory":"indexeddb"}function Ta(e){let t=e.created_at||new Date().toISOString();return{kind:e.kind||"query",title:String(e.title||""),detail:String(e.detail||""),payload:e.payload||{},created_at:t}}async function qa(){try{let t=(await He()).transaction(Me,"readwrite"),s=t.objectStore(Me),a=await rt(s.count());if(a>120){let r=a-120,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let g=i.result;if(!g||r<=0){o();return}g.delete(),r-=1,g.continue()},i.onerror=()=>l(i.error)})}await Fe(t)}catch{fe=!0}}async function yt(e){let t=Ta(e);try{let a=(await He()).transaction(Me,"readwrite"),r=a.objectStore(Me),i=await rt(r.add(t));return await Fe(a),await qa(),i}catch{fe=!0;let a=Ee.nextId++;return Ee.history.push({id:a,...t}),Ee.history.length>120&&Ee.history.shift(),a}}async function wt({keyword:e="",limit:t=50}={}){let s=e.trim().toLowerCase();try{let r=(await He()).transaction(Me,"readonly"),i=r.objectStore(Me),o=await rt(i.getAll());return await Fe(r),o.filter(l=>s?`${l.kind} ${l.title} ${l.detail}`.toLowerCase().includes(s):!0).sort((l,g)=>String(g.created_at).localeCompare(String(l.created_at))).slice(0,t)}catch{return fe=!0,Ee.history.filter(r=>s?`${r.kind} ${r.title} ${r.detail}`.toLowerCase().includes(s):!0).slice().sort((r,i)=>String(i.created_at).localeCompare(String(r.created_at))).slice(0,t)}}async function qs(){try{let t=(await He()).transaction(Me,"readwrite");t.objectStore(Me).clear(),await Fe(t)}catch{fe=!0}Ee.history=[]}async function Es(e,t){let s={key:String(e),value:t,updated_at:new Date().toISOString()};try{let r=(await He()).transaction(Ie,"readwrite");return r.objectStore(Ie).put(s),await Fe(r),s}catch{return fe=!0,Ee.settings.set(s.key,s),s}}async function it(e,t=null){try{let a=(await He()).transaction(Ie,"readonly"),r=a.objectStore(Ie),i=await rt(r.get(String(e)));return await Fe(a),i?i.value:t}catch{fe=!0;let a=Ee.settings.get(String(e));return a?a.value:t}}async function js({keyword:e=""}={}){let t=e.trim().toLowerCase();try{let a=(await He()).transaction(Ie,"readonly"),r=a.objectStore(Ie),i=await rt(r.getAll());return await Fe(a),i.filter(o=>t?`${o.key} ${JSON.stringify(o.value)}`.toLowerCase().includes(t):!0).sort((o,l)=>String(o.key).localeCompare(String(l.key)))}catch{return fe=!0,Array.from(Ee.settings.values()).filter(a=>t?`${a.key} ${JSON.stringify(a.value)}`.toLowerCase().includes(t):!0)}}function Ns(e){if(typeof e=="string")return e;try{return JSON.stringify(e)}catch{return String(e)}}var ds={};Ke(ds,{render:()=>Nn,renderTestFlowPanel:()=>Tt});var ls={};Ke(ls,{exportCsv:()=>Lt,exportableResult:()=>Mt,render:()=>pn,renderReport:()=>xt,reportError:()=>At,reportLoading:()=>ot});var Fs=[10,25,50,100],Ea=500,ja=["law_name","law_level","law_category","law_modified_date","article_count"],Na=["jid","court_normalized","title","jdate","matched_laws","citation_count"],Pa={A:"\u689D\u6587",C:"\u7AE0\u7BC0"};function St(e){return e?.label||e?.id||"\u8CC7\u6599\u5EAB"}function _t(e,t){let s={};for(let a of e.fields||[]){let r=a.type==="checkbox"?!1:a.type==="multiselect"?[]:"",i=a.default===void 0?r:a.default;s[a.key]=Array.isArray(i)?[...i]:i}return{values:s,page:1,pageSize:t,result:null,sort:null,columnFilters:{}}}function Ca(e,t){let s=e.visibleWhen;if(!s)return!0;for(let[a,r]of Object.entries(s))if(Array.isArray(r)&&!r.map(String).includes(String(t[a]??"")))return!1;return!0}function os(e,t){return(e.fields||[]).filter(s=>Ca(s,t))}function Ra(e,t){return`filter-${e.id}-${t}`}function Ue(e){return e==null?"":n(String(e))}function es(e,t,s){let a=s[t.key],r=Ra(e,t.key),i=t.help?`<span class="field-help">${n(t.help)}</span>`:"";if(t.type==="checkbox")return`<div class="field">
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
    </label>`;if(t.type==="select"){let l=(t.options||[]).map(g=>`<option value="${Ue(g.value)}" ${String(g.value)===String(a??"")?"selected":""}>${n(g.label??g.value)}</option>`).join("");return`<div class="field">${o}
      <select class="select" id="${r}" name="${n(t.key)}">${l}</select>
      ${i}
    </div>`}if(t.type==="multiselect"){let l=new Set((Array.isArray(a)?a:[]).map(String)),g=(t.options||[]).map(b=>`<label class="multi-option">
          <input type="checkbox" name="${n(t.key)}" value="${Ue(b.value)}" ${l.has(String(b.value))?"checked":""} />
          <span>${n(b.label??b.value)}</span>
        </label>`).join("");return`<div class="field">${o}
      <div class="multi-select">${g}</div>
      ${i}
    </div>`}return t.type==="number"?`<div class="field">${o}
      <input class="input" type="number" id="${r}" name="${n(t.key)}"
        value="${Ue(a)}"
        ${t.min!==void 0?`min="${t.min}"`:""}
        ${t.max!==void 0?`max="${t.max}"`:""}
        step="${t.step??1}"
        placeholder="${Ue(t.placeholder||"")}" />
      ${i}
    </div>`:t.type==="date"?`<div class="field">${o}
      <input class="input" type="date" id="${r}" name="${n(t.key)}"
        value="${Ue(a)}" />
      ${i}
    </div>`:`<div class="field">${o}
    <input class="input" type="text" id="${r}" name="${n(t.key)}"
      value="${Ue(a)}"
      placeholder="${Ue(t.placeholder||"")}" />
    ${i}
  </div>`}function ts(e,t,{focusTable:s=!1}={}){let a=os(e,t.values),r=[];for(let i=0;i<a.length;i+=1){let o=a[i],l=a[i+1];o.type==="date"&&l&&l.type==="date"?(r.push(`<div class="field-row">${es(e,o,t.values)}${es(e,l,t.values)}</div>`),i+=1):r.push(es(e,o,t.values))}return`<form id="data-filter-form" autocomplete="off">
    <div class="filter-block">
      <div class="filter-head">
        <span class="filter-title">Metadata \u689D\u4EF6</span>
        <button class="filter-reset" type="button" data-action="reset">\u91CD\u8A2D</button>
      </div>
      <div class="filter-fields">${r.join("")}</div>
    </div>
    <div class="sidebar-actions">
      <button class="btn btn-primary" type="submit" id="run-query" ${s?'data-focus-table="true"':""}>
        ${y("search",15)}<span>\u57F7\u884C\u67E5\u8A62</span>
      </button>
    </div>
  </form>`}function kt(e,t,s){let a={...s.values};for(let r of os(t,a))if(r.type==="checkbox"){let i=e.querySelector(`[name="${r.key}"]`);a[r.key]=!!i?.checked}else if(r.type==="multiselect")a[r.key]=Array.from(e.querySelectorAll(`[name="${r.key}"]:checked`)).map(i=>i.value);else{let i=e.querySelector(`[name="${r.key}"]`);a[r.key]=i?i.value:""}return a}function Hs(e,t){let s={};for(let a of os(e,t.values)){let r=t.values[a.key];a.type==="checkbox"?s[a.key]=!!r:a.type==="multiselect"?s[a.key]=Array.isArray(r)?r:[]:a.type==="number"?s[a.key]=r===""||r===null?"":Number(r):s[a.key]=r??""}return s}function ss(e,t){let s=Hs(e,t);return(e.id==="postgres"||e.id==="parquet")&&t.sort?.key&&(s.sort=`${t.sort.key}:${t.sort.direction}`,s.schema_preview=!0),t.columnFilters&&Object.keys(t.columnFilters).length>0&&(s.column_filters=t.columnFilters),s}function Ps(e){if(e.status==="operational")return"";let t=e.status==="unavailable"?"danger":e.status==="degraded"?"warn":"info";return`<div class="sidebar-notice">${G({tone:t,title:`${St(e)} ${Re(e.status).label}`,text:n(e.detail||"\u76EE\u524D\u7121\u6CD5\u4F7F\u7528\u9019\u500B\u8CC7\u6599\u4F86\u6E90\u3002")})}</div>`}function Ba(e,t){return`<div class="db-options" role="radiogroup" aria-label="\u9078\u64C7\u8CC7\u6599\u5EAB">
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
  </div>`}function Ia(e){return`<div class="sidebar-view-switch" role="tablist" aria-label="\u67E5\u8A62\u6216 schema">
    <button class="sidebar-view-button ${e==="query"?"is-active":""}"
      type="button" role="tab" aria-selected="${e==="query"}"
      data-action="sidebar-view" data-view="query">${y("search",13)}<span>\u67E5\u8A62</span></button>
    <button class="sidebar-view-button ${e==="schema"?"is-active":""}"
      type="button" role="tab" aria-selected="${e==="schema"}"
      data-action="sidebar-view" data-view="schema">${y("table",13)}<span>Schema</span></button>
  </div>`}function as(e,t,s=""){let a=Array.isArray(e.tables)?e.tables:[],r=a.length?a.map(i=>`<button class="schema-item ${String(i.id)===String(s||"")?"is-selected":""}" type="button"
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
  </div>`}function Cs(e,t){return`<div class="category-options" role="radiogroup" aria-label="\u8CC7\u6599\u985E\u578B">
    ${e.map(s=>{let a=s.id===t,r=s.id==="judgment"&&s.count!==void 0?`${u(s.count)} \u7B46\u5DF2\u7BE9\u9078\u5224\u6C7A`:s.description||"";return`<label class="category-option${a?" is-selected":""}">
          <input type="radio" name="category" value="${n(s.id)}" ${a?"checked":""} />
          <span class="category-option-body">
            <span class="category-option-label">${n(s.label)}</span>
            <span class="category-option-desc">${n(r)}</span>
          </span>
        </label>`}).join("")}
  </div>`}function Rs(e){return{postgres:"PostgreSQL \u67E5\u8A62\u4F7F\u7528\u53C3\u6578\u5316\u689D\u4EF6\u8207\u5206\u9801\uFF0C\u50C5\u8B80\u53D6\u8CC7\u6599\u3002",parquet:"Parquet \u67E5\u8A62\u76F4\u63A5\u6383\u63CF\u76EE\u524D\u6700\u65B0\u7684\u5FEB\u7167\uFF1B\u52FE\u9078\u539F\u59CB JSON \u6703\u589E\u52A0\u56DE\u50B3\u91CF\u8207\u6E32\u67D3\u6642\u9593\u3002",qdrant:"Qdrant \u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\uFF1B\u9700\u8981\u5148\u5B8C\u6210\u5411\u91CF\u7D22\u5F15\u3002\u6AA2\u7D22\u7D50\u679C\u53EA\u5305\u542B\u7D22\u5F15\u4E2D\u5BE6\u969B\u5B58\u5728\u7684\u5224\u6C7A\uFF0C\u4E0D\u6703\u7522\u751F\u865B\u69CB\u8CC7\u6599\u3002",indexeddb:"IndexedDB \u53EA\u5728\u9019\u500B\u700F\u89BD\u5668\u5167\u67E5\u8A62\uFF0C\u4E0D\u6703\u7D93\u904E\u4F3A\u670D\u5668\uFF1B\u6E05\u9664\u7DB2\u7AD9\u8CC7\u6599\u5F8C\u7D00\u9304\u6703\u6D88\u5931\u3002"}[e.id]||n(e.detail||"")}function Da(e){return`<div class="report-empty">
    ${ge({iconName:"table",title:"\u67E5\u8A62\u5831\u8868\u6703\u986F\u793A\u5728\u9019\u88E1",text:n({postgres:"\u9078\u64C7\u8CC7\u6599\u8868\u8207 metadata \u689D\u4EF6\uFF0C\u57F7\u884C\u5F8C\u6703\u7522\u751F SQL\u3001\u6458\u8981\u3001\u5206\u5E03\u8207\u8CC7\u6599\u5217\u3002",parquet:"\u9078\u64C7\u8CC7\u6599\u96C6\u8207\u56DE\u50B3\u6B04\u4F4D\uFF0C\u76F4\u63A5\u6383\u63CF\u539F\u59CB Parquet\u3002",qdrant:"\u8F38\u5165\u8A9E\u610F\u67E5\u8A62\u5F8C\uFF0C\u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5DF2\u5EFA\u7ACB\u5411\u91CF\u7D22\u5F15\u7684\u5224\u6C7A\uFF1B\u672A\u7D22\u5F15\u6642\u6703\u660E\u78BA\u986F\u793A\u72C0\u614B\u3002",indexeddb:"\u67E5\u8A62\u5B58\u5728\u9019\u500B\u700F\u89BD\u5668\u7684\u63D0\u554F\u7D00\u9304\u8207\u8A2D\u5B9A\uFF0C\u4E0D\u9700\u8981\u4F3A\u670D\u5668\u3002"}[e.id]||"\u8A2D\u5B9A\u689D\u4EF6\u5F8C\u57F7\u884C\u67E5\u8A62\u3002")})}
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
  </div>`}function ot(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${n(St(e))} \u67E5\u8A62\u4E2D</div>
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
  </div>`}function At(e,t){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${n(St(t))} \u67E5\u8A62\u5931\u6557</div>
        <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${G({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u67E5\u8A62\u7D50\u679C",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="retry">
          ${y("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function Oa(e){if(!e.length)return'<div class="report-empty-inline">\u9019\u6B21\u67E5\u8A62\u6C92\u6709\u53EF\u5448\u73FE\u7684\u5206\u5E03\u8CC7\u6599\u3002</div>';let t=Math.max(...e.map(s=>Number(s.value)||0),1);return`<div class="distribution">
    ${e.map(s=>{let a=Number(s.value)||0,r=Math.max(1.5,a/t*100);return`<div class="dist-row">
          <span class="dist-label" title="${n(s.label||"\u672A\u5206\u985E")}">${n(s.label||"\u672A\u5206\u985E")}</span>
          <span class="dist-track"><span class="dist-bar" style="width:${r.toFixed(1)}%"></span></span>
          <span class="dist-value">${u(a)}</span>
        </div>`}).join("")}
  </div>`}function Us(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="law_documents"}function Fa(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="judgment_documents"}function Ha(e){return e&&e.database==="qdrant"&&String(e.table||"").startsWith("judgment")}function Ua(e){let t=e._jid||e.jid;return t?`<button class="law-link judgment-link" type="button" data-action="open-judgment"
    data-jid="${n(String(t))}"
    title="\u6AA2\u8996\u300C${n(String(t))}\u300D\u7684\u5224\u6C7A\u539F\u6587">${n(String(t))}${y("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}var za={jid:"jid",court:"court",court_normalized:"court",title:"title",jdate:"jdate",matched_laws:"matched_laws",citation_count:"citation_count",full_text_length:"full_text_length"};function Qa(e,t,s,a=!1,r=!0,i=!1){let o=a?e.key:e.label||e.key,l=r?t?za[e.key]||e.key:i?e.key:null:null;if(!l)return`<th scope="col">${n(o)}</th>`;let g=s?.key===l,b=g?s.direction:null,$=b==="asc"?"ascending":b==="desc"?"descending":"none",f=b==="asc"?"\u2191":b==="desc"?"\u2193":"\u2195";return`<th scope="col" aria-sort="${$}">
    <button class="table-sort${g?" is-active":""}" type="button"
      data-action="sort-column" data-sort-key="${n(l)}"
      title="\u4F9D${n(o)}\u6392\u5E8F">
      <span>${n(o)}</span>
      <span class="table-sort-icon" aria-hidden="true">${f}</span>
    </button>
  </th>`}function Ga(e,t){if(!Us(e)||!t)return null;let s=t._law_key||t.law_name;if(!s)return null;let a=e.meta?.dataset,r=t._law_source_type||(a&&a!=="all"?a:"");return{lawKey:String(s),sourceType:String(r||""),lawName:String(t.law_name||"")}}function Ja(e,t,s){let a=e[t.key];return a==null||a===""?"\u2014":`<button class="law-link" type="button" data-action="open-law"
    data-law-key="${n(s.lawKey)}"
    data-law-source="${n(s.sourceType)}"
    data-law-name="${n(s.lawName)}"
    title="\u6AA2\u8996\u300C${n(String(a))}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${n(String(a))}${y("chevronRight",12,"law-link-icon")}</button>`}function zs(e,{useColumnKeys:t=!1,sortable:s=!0,sortableAll:a=!1,searchValues:r=null,compact:i=!1}={}){let o=Array.isArray(e.columns)?e.columns:[],l=Array.isArray(e.rows)?e.rows:[],g=(e.page-1)*e.page_size,b=Us(e),$=Fa(e),f=Ha(e),h=e.meta?.sort||null,_=r?`<tr class="schema-search-row">
        <th scope="col" class="cell-index-head"></th>
        ${o.map(v=>`<th scope="col">
              <div class="schema-search-wrap">
                <input class="schema-search-input" type="search"
                  data-schema-search="${n(v.key)}"
                  value="${n(String(r[v.key]??""))}"
                  placeholder="\u641C\u5C0B ${n(v.key)}"
                  autocomplete="off" />
              </div>
            </th>`).join("")}
      </tr>`:"";return o.length?l.length?`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">${u(l.length)} rows \xB7 \u7B2C ${e.page} \u9801${b?" \xB7 \u9EDE\u9078\u6CD5\u898F\u540D\u7A31\u53EF\u6AA2\u8996\u5B8C\u6574\u689D\u6587":$?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u6B04\u4F4D\u6A19\u984C\u53EF\u6392\u5E8F":f?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u4F9D\u76F8\u4F3C\u5EA6\u6392\u5E8F":""}</span>
    </div>
    <div class="table-wrap">
      <table class="data-table${i?" is-compact":""}">
        <thead>${_}<tr>
          <th scope="col" class="cell-index-head">#</th>
          ${o.map(v=>Qa(v,$,h,t,s,a)).join("")}
        </tr></thead>
        <tbody>
          ${l.map((v,x)=>`<tr>
                <td class="cell-mono cell-empty cell-index">${g+x+1}</td>
                ${o.map(N=>{if(($||f)&&N.key==="jid")return`<td class="cell-jid">${Ua(v)}</td>`;let P=b&&N.key==="law_name"?Ga(e,v):null;if(P)return`<td>${Ja(v,N,P)}</td>`;let L={date:"cell-date",datetime:"cell-datetime",duration:"cell-duration",number:"cell-number"}[N.type];return`<td${L?` class="${L}"`:""}>${ft(v[N.key],N.type||"text")}</td>`}).join("")}
              </tr>`).join("")}
        </tbody>
      </table>
    </div>`:`<div class="report-table-head">
        <span class="report-section-title">\u8CC7\u6599\u5217</span>
        <span class="muted" style="font-size:10px">0 rows</span>
      </div>
      ${ge({iconName:"filter",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u8CC7\u6599",text:"\u653E\u5BEC\u65E5\u671F\u5340\u9593\u3001\u964D\u4F4E\u689D\u6587\u6578\u4E0B\u9650\uFF0C\u6216\u6E05\u9664\u95DC\u9375\u5B57\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}`:`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">\u6B64\u8CC7\u6599\u4F86\u6E90\u6C92\u6709\u8868\u683C\u6B04\u4F4D</span>
    </div>`}function Va(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,r=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${r} \u9801 \xB7
      \u986F\u793A ${u(i)}\u2013${u(o)} / ${u(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Fs.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${y("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=r?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${y("chevronRight",13)}</button>
    </div>
  </div>`}function Qs(e){return!Array.isArray(e)||!e.length?"":`<div class="warnings">${e.map(t=>`<div class="warning-line">${n(t)}</div>`).join("")}</div>`}function xt(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.columns)?e.columns:[],a=Array.isArray(e.summary)?e.summary:[],r=Array.isArray(e.distribution)?e.distribution:[],i=Number(e.total)||0,o=e.query_text||"",l=e.database||"",g=e.status||"ok",b=e.meta?.table_label||e.table||e.label||"query result";return`<div class="report-card" data-database="${n(l)}">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT \xB7 ${n(String(l).toUpperCase())}</div>
        <div class="report-title">
          ${n(e.label||l)}
          ${W(g)}
          <span class="chip">${n(b)}</span>
        </div>
        <div class="report-sub">
          ${u(i)} \u7B46\u7B26\u5408 \xB7
          ${D(e.duration_ms)} \xB7
          ${n(String(l).toUpperCase())} / ${n(String(e.table||"\u2014"))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${y("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${y("file",14)}<span>JSON</span></button>
      </div>
    </div>

    ${e.message?`<div class="report-alert">${G({tone:g==="not_configured"?"info":g==="danger"?"danger":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n(e.message)})}</div>`:""}

    ${a.length?`<div class="summary-strip">
            ${a.slice(0,4).map($=>`<div class="summary-item">
                  <div class="summary-label">${n($.label)}</div>
                  <div class="summary-value">${n($.value)}</div>
                </div>`).join("")}
          </div>`:""}

    <div class="report-grid">
      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u7D50\u679C\u5206\u5E03</span>
          <span class="muted" style="font-size:9.5px">${r.length} groups</span>
        </div>
        ${Oa(r)}
      </div>
      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5BE6\u969B\u67E5\u8A62\u8A9E\u53E5</span>
          <span class="muted" style="font-size:9.5px">${n(e.database==="indexeddb"?"client-side":"read-only")}</span>
        </div>
        <div class="query-box">
          <pre class="query-code">${n(o||"\u2014")}</pre>
          <button class="btn btn-secondary btn-sm btn-copy" type="button" data-action="copy-query">
            ${y("copy",12)}<span>\u8907\u88FD</span>
          </button>
        </div>
        ${Qs(e.warnings)}
      </div>
    </div>

    ${s.length||t.length?zs(e,{compact:!0,sortableAll:!0,searchValues:e.meta?.searchable?e.meta.column_filters||{}:null}):""}
    ${i||s.length?Va({...e,total:i,page:Number(e.page)||1,page_size:Number(e.page_size)||25}):""}
  </div>`}function Bs(e){return`<div class="report-card schema-preview">
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
  </div>`}function ns(e,t,{columnFilters:s={},searchEnabled:a=!1}={}){let r=Array.isArray(e.columns)?e.columns:[],i=Array.isArray(e.rows)?e.rows:[],o=e.message?`<div class="report-alert">${G({tone:e.status==="ok"?"info":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n(e.message)})}</div>`:"";return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW \xB7 ${n(String(e.database||"").toUpperCase())}</div>
        <div class="report-title">
          ${n(t||e.table||"\u8CC7\u6599\u8868")}
          ${W(e.status||"ok")}
        </div>
        <div class="report-sub">
          ${n(String(e.database||""))} / ${n(String(e.table||"\u2014"))} \xB7 ${r.length} \u6B04\u4F4D \xB7 \u524D ${i.length} \u7B46
        </div>
      </div>
    </div>
    ${o}
    ${zs({...e,page:1,page_size:10},{useColumnKeys:!0,sortable:!0,sortableAll:!0,searchValues:a?s:null})}
    ${Qs(e.warnings)}
    <div class="schema-preview-footer">
      <span>\u9810\u89BD\u524D ${u(i.length)} \u7B46</span>
      <strong>\u5171 ${u(e.total)} \u7B46</strong>
    </div>
  </div>`}function Is(e,t){return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW</div>
        <div class="report-title">${n(t||"\u8CC7\u6599\u8868")}</div>
        <div class="report-sub">\u7121\u6CD5\u8B80\u53D6\u8CC7\u6599\u8868\u9810\u89BD\u3002</div>
      </div>
    </div>
    ${G({tone:"danger",title:"\u8B80\u53D6\u5931\u6557",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
  </div>`}function Wa(e){return`<div class="report-empty">
    ${ge({iconName:"table",title:"\u9078\u64C7\u8CC7\u6599\u8868\u9810\u89BD",text:`\u5F9E\u5DE6\u5074 ${St(e)} \u7684 Schema \u6E05\u55AE\u9EDE\u9078\u8CC7\u6599\u8868\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6B04\u4F4D\u540D\u7A31\u3001\u524D 10 \u7B46\u8CC7\u6599\u8207\u7E3D\u7B46\u6578\u3002`})}
  </div>`}function rs(e){return e.is_current===!0?W("ok","\u73FE\u884C"):e.law_abandon_note?W("empty","\u5DF2\u5EE2\u6B62"):e.is_current===!1?W("empty","\u6B77\u53F2\u7248\u672C"):W("not_configured","\u72C0\u614B\u672A\u63D0\u4F9B")}function X(e,t){return`<div class="law-meta-item">
    <div class="law-meta-label">${n(e)}</div>
    <div class="law-meta-value">${t||"\u2014"}</div>
  </div>`}function ze(e){return e?Le(e):"\u2014"}function Ka(e){return e?.meta?.metadata_source==="postgresql"?"PostgreSQL metadata":e?.meta?.metadata_source==="parquet"?"Parquet snapshot":"\u2014"}function is(e,t){return t?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">${n(e)}</span>
    </div>
    <div class="law-text-block">${n(String(t).trim())}</div>
  </div>`:""}function Ya(e,t,{open:s=!1}={}){return t?`<details class="report-section law-disclosure" data-law-history ${s?"open":""}>
    <summary class="law-disclosure-summary">
      <span class="report-section-title">${n(e)}</span>
      <span class="law-disclosure-hint">\u9810\u8A2D\u6536\u5408 \xB7 \u9EDE\u64CA\u5C55\u958B</span>
      ${y("chevronDown",14,"law-disclosure-chevron")}
    </summary>
    <div class="law-text-block">${n(String(t).trim())}</div>
  </details>`:""}function Xa(e){let t=Array.isArray(e)?e:[],s=t.map(a=>{let r=a?.name||a?.url||"";return r?a.url?`<a class="law-attachment" href="${n(a.url)}" target="_blank" rel="noopener noreferrer">
          ${y("file",12)}<span>${n(r)}</span>${y("external",11)}
        </a>`:`<span class="law-attachment">${y("file",12)}<span>${n(r)}</span></span>`:""}).filter(Boolean).join("");return s?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">\u9644\u4EF6</span>
      <span class="muted">${u(t.length)}</span>
    </div>
    <div class="law-attachment-list">${s}</div>
  </div>`:""}function Gs(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function Za(e){let t=Array.isArray(e.articles)?e.articles:[],s=t.filter(o=>o.article_type==="C").length,a=t.length-s,r=s?`${u(a)} \u689D \xB7 ${u(s)} \u7AE0\u7BC0`:`${u(a)} \u689D`,i=t.map(o=>{let l=String(o.article_content||"").trim();if(!l)return"";if(o.article_type==="C")return`<div class="law-chapter">${n(l)}</div>`;let g=Pa[o.article_type]||o.article_type;return`<article class="law-article"
        data-article-no="${n(Gs(o.article_no))}">
        <div class="law-article-head">
          <span class="law-article-no">${n(o.article_no||"\u689D\u6587")}</span>
          ${g&&g!=="\u689D\u6587"?`<span class="chip">${n(g)}</span>`:""}
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
  </div>`}function en(){return`<div class="law-jump-float">
    <input class="input law-article-jump-input law-jump-input"
      id="law-article-jump-float" type="text" inputmode="numeric"
      autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
    <button class="btn btn-secondary btn-sm" type="button"
      data-action="jump-article" data-jump-input="law-article-jump-float">\u8DF3\u81F3</button>
  </div>`}function Ze(){return`<button class="btn btn-secondary btn-sm" type="button" data-action="back-to-results">
    ${y("chevronLeft",14)}<span>\u8FD4\u56DE\u67E5\u8A62\u7D50\u679C</span>
  </button>`}function tn(e){return`<div class="law-report">
    <div class="law-report-topbar">
      ${Ze()}
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
  </div>`}function sn(e,t){return`<div class="law-report">
    <div class="law-report-topbar">
      ${Ze()}
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
        ${G({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function an(e){let t=Array.isArray(e.versions)?e.versions:[];if(t.length<1)return"";let s=e.selected_version_id??"";return`<label class="law-version-select">
    <span>\u689D\u6587\u7248\u672C</span>
    <select class="select" data-action="select-law-version" aria-label="\u9078\u64C7\u6CD5\u898F\u689D\u6587\u7248\u672C">
      ${t.map(a=>{let r=String(a.update_date||"").match(/\d{4}\/\d{1,2}\/\d{1,2}/)?.[0]||"",i=[`#${a.version_id}`,a.is_current?"\u76EE\u524D":"\u6B77\u53F2",r,a.article_count_for_law?`${u(a.article_count_for_law)} \u7B46`:"\u7121\u689D\u6587\u5FEB\u7167"].filter(Boolean).join(" \xB7 ");return`<option value="${n(a.version_id)}" ${String(a.version_id)===String(s)?"selected":""}>${n(i)}</option>`}).join("")}
    </select>
  </label>`}function nn(e){let t=e.change_summary||{},s=Object.values(t).reduce((o,l)=>o+(Number(l)||0),0),a=Array.isArray(e.changes)?e.changes:[];if(!e.changes_available&&!s)return"";let r={added:"\u65B0\u589E",modified:"\u4FEE\u6539",removed:"\u79FB\u9664"},i=["added","modified","removed"].map(o=>`${r[o]} ${u(t[o]||0)}`).join(" \xB7 ");return`<details class="report-section law-version-changes">
    <summary>
      <span class="report-section-title">\u7248\u672C\u8B8A\u66F4</span>
      <span class="muted">${n(i)}</span>
    </summary>
    <div class="law-version-change-list">
      ${a.length?a.slice(0,20).map(o=>{let l=o.change_type==="added"?"badge-ok":o.change_type==="removed"?"badge-danger":"badge-warn",g=o.before_content?`<details><summary>\u8B8A\u66F4\u524D</summary><pre>${n(o.before_content)}</pre></details>`:"",b=o.after_content?`<details><summary>\u8B8A\u66F4\u5F8C</summary><pre>${n(o.after_content)}</pre></details>`:"";return`<div class="law-version-change">
                  <div class="law-version-change-head">
                    <span class="badge ${l}">${n(r[o.change_type]||o.change_type)}</span>
                    <strong>${n(o.article_no||o.article_key)}</strong>
                  </div>
                  ${g}${b}
                </div>`}).join(""):'<div class="report-empty-inline">\u6B64\u7248\u672C\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u8B8A\u66F4\u3002</div>'}
      ${e.changes_truncated?'<div class="report-empty-inline">\u50C5\u986F\u793A\u524D 20 \u7B46\u8B8A\u66F4\uFF1BAPI \u56DE\u50B3\u4E0A\u9650 200 \u7B46\u3002</div>':""}
    </div>
  </details>`}function rn(e,{database:t="",lawPage:s=1,historyOpen:a=!1}={}){let r=Array.isArray(e.warnings)?e.warnings:[],i=e.law_name||e.law_key||"\u6CD5\u898F",o=(Array.isArray(e.articles)?e.articles:[]).filter(x=>x.article_type!=="C").length,l=Ka(e),g=e.meta?.articles_source==="postgresql"?"PostgreSQL \u689D\u6587\u7248\u672C":e.meta?.articles_source==="parquet"?"Parquet \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",b=e.meta?.snapshot||"",$=e.meta?.articles_source==="postgresql"&&e.selected_version_id!==null&&e.selected_version_id!==void 0?`\u689D\u6587\u7248\u672C #${e.selected_version_id}`:"",f=[l,g,$,b].filter(Boolean).join(" \xB7 "),h=e.source_type==="law"?"\u6CD5\u5F8B":e.source_type==="order"?"\u547D\u4EE4":e.source_type||"\u2014",_=e.version||{},v=[X("\u6CD5\u898F\u4F4D\u968E",n(e.law_level||"\u2014")),X("\u6CD5\u898F\u985E\u5225",n(e.law_category||"\u2014")),X("\u7570\u52D5\u65E5\u671F",ze(e.law_modified_date)),X("\u751F\u6548\u65E5\u671F",ze(e.law_effective_date)),X("\u689D\u6587\u6578",u(e.article_count)),X("\u8CC7\u6599\u72C0\u614B",rs(e)),X("\u82F1\u8B6F\u540D\u7A31",n(e.eng_law_name||"\u2014")),X("\u6CD5\u898F\u8B58\u5225",`<span class="mono">${n(e.law_key||"\u2014")}</span>`)];return _.first_seen_version_id!==null&&_.first_seen_version_id!==void 0&&v.push(X("\u9996\u6B21\u6536\u9304\u7248\u672C",`#${n(_.first_seen_version_id)}`)),_.last_seen_version_id!==null&&_.last_seen_version_id!==void 0&&v.push(X("\u6700\u5F8C\u6536\u9304\u7248\u672C",`#${n(_.last_seen_version_id)}`)),_.last_seen_at&&v.push(X("\u6700\u5F8C\u6536\u9304\u6642\u9593",n(se(_.last_seen_at)))),_.selected_version_id!==null&&_.selected_version_id!==void 0&&v.push(X("\u689D\u6587\u7248\u672C",`#${n(_.selected_version_id)} \xB7 ${e.meta?.selected_version_is_current?"\u76EE\u524D":"\u6B77\u53F2"}`)),`<div class="law-report">
    <div class="law-report-topbar">
      ${Ze()}
      <span class="law-report-origin" title="${n(f)}">${n(f)}</span>
    </div>
    <div class="report-card law-report-card" data-database="${n(t)}">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT \xB7 ${n(String(t||l).toUpperCase())}</div>
          <div class="report-title">
            ${n(i)}
            ${rs(e)}
            <span class="chip">${n(h)}</span>
          </div>
          <div class="report-sub">
            ${n([e.law_level,e.law_category].filter(Boolean).join(" \xB7 ")||"\u2014")} \xB7 ${u(e.article_count)} \u689D \xB7 \u7570\u52D5 ${ze(e.law_modified_date)}
          </div>
        </div>
        <div class="report-actions">
          ${an(e)}
          ${e.law_url?`<a class="btn btn-secondary btn-sm" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">${y("external",14)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:""}
        </div>
      </div>

      ${r.length?`<div class="report-alert">${G({tone:e.status==="degraded"?"warn":"info",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r.map(x=>n(x)).join("<br />")})}</div>`:""}

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u689D\u6587\u6578</div>
          <div class="summary-value">${u(e.article_count)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u7570\u52D5\u65E5\u671F</div>
          <div class="summary-value">${ze(e.law_modified_date)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u6CD5\u898F\u4F4D\u968E</div>
          <div class="summary-value">${n(e.law_level||"\u2014")}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u76EE\u524D\u72C0\u614B</div>
          <div class="summary-value">${rs(e)}</div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u6CD5\u898F\u8CC7\u8A0A</span>
          <span class="muted" style="font-size:9.5px">${n(l)}</span>
        </div>
        <div class="law-meta-grid">${v.join("")}</div>
      </div>

      ${nn(e)}
      ${is("\u6CD5\u898F\u524D\u8A00",e.law_foreword)}
      ${Ya("\u6CD5\u898F\u6CBF\u9769",e.law_histories,{open:a})}
      ${is("\u751F\u6548\u8AAA\u660E",e.law_effective_note)}
      ${is("\u5EE2\u6B62\u8AAA\u660E",e.law_abandon_note)}
      ${Xa(e.attachments)}
      ${Za(e)}
    </div>
    ${o>100?en():""}
  </div>`}function on(e){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${Ze()}
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
  </div>`}function ln(e,t){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${Ze()}
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
        ${G({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function cn(e){let t=new Map;for(let s of Array.isArray(e.citations)?e.citations:[]){let a=String(s.law_name||"").trim();if(!a)continue;t.has(a)||t.set(a,new Set);let r=String(s.article_no||"").trim();r&&t.get(a).add(r)}return t.size?`<div class="judgment-citation-groups">
    ${[...t.entries()].map(([s,a])=>`<div class="judgment-citation-group">
          <span class="judgment-citation-law">${n(s)}</span>
          <span class="judgment-citation-articles">${[...a].map(r=>n(r)).join("\u3001")||"\u2014"}</span>
        </div>`).join("")}
  </div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5F15\u7528\u660E\u7D30\u3002</div>'}function dn(e,{database:t="postgres"}={}){let s=Array.isArray(e.matched_laws)?e.matched_laws:[],a=e.title||e.jid||"\u5224\u6C7A",r=String(e.full_text||""),i=Number(e.full_text_length)||r.length||0,o=["PostgreSQL \u5224\u6C7A\u6587\u4EF6",e.source_archive].filter(Boolean).join(" \xB7 "),l=[X("\u6848\u865F",n(e.jid||"\u2014")),X("\u5E74\u5EA6",n(e.jyear||"\u2014")),X("\u5B57\u5225",n(e.jcase||"\u2014")),X("\u865F\u78BC",n(e.jno||"\u2014")),X("\u6CD5\u9662",n(e.court||"\u2014")),X("\u6848\u7531",n(e.title||"\u2014")),X("\u88C1\u5224\u65E5\u671F",ze(e.jdate)),X("\u4F86\u6E90\u58D3\u7E2E\u6A94",n(e.source_archive||"\u2014")),X("\u5168\u6587\u9577\u5EA6",`${u(i)} \u5B57`),X("\u5F15\u7528\u6578",u(e.citation_count))];return e.import_run_id!==null&&e.import_run_id!==void 0&&l.push(X("\u532F\u5165 Run",`#${n(e.import_run_id)}`)),`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${Ze()}
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
            ${n(e.court||"\u2014")} \xB7 ${ze(e.jdate)} \xB7
            ${u(i)} \u5B57
          </div>
        </div>
        <div class="report-actions">
          ${e.pdf_url?`<a class="btn btn-secondary btn-sm" href="${n(e.pdf_url)}" target="_blank" rel="noopener noreferrer">${y("external",14)}<span>PDF</span></a>`:""}
        </div>
      </div>

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u88C1\u5224\u65E5\u671F</div>
          <div class="summary-value">${ze(e.jdate)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u6CD5\u9662</div>
          <div class="summary-value summary-value-text">${n(e.court||"\u2014")}</div>
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
          <span class="muted" style="font-size:9.5px">${n(e.jid||"")}</span>
        </div>
        <div class="law-meta-grid">${l.join("")}</div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u547D\u4E2D\u6CD5\u898F\u8207\u5F15\u7528</span>
          <span class="muted">${u(s.length)} \u6CD5\u898F \xB7 ${u(e.citation_count)} \u5F15\u7528</span>
        </div>
        ${cn(e)}
      </div>

      <div class="report-section judgment-text-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5224\u6C7A\u539F\u6587</span>
          <span class="muted">${u(i)} \u5B57</span>
        </div>
        ${r?`<div class="judgment-fulltext">${n(r)}</div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5168\u6587\u3002</div>'}
      </div>
    </div>
  </div>`}function Ds(e){return`"${(e==null?"":typeof e=="object"?JSON.stringify(e):String(e)).replace(/"/g,'""')}"`}function Lt(e){let t=e.columns||[],s=e.rows||[],a=[["#",...t.map(i=>i.label||i.key)].map(Ds).join(",")],r=((Number(e.page)||1)-1)*(Number(e.page_size)||25);return s.forEach((i,o)=>{a.push([r+o+1,...t.map(l=>i[l.key])].map(Ds).join(","))}),`\uFEFF${a.join(`\r
`)}`}function Mt(e){return{...e,rows:(e.rows||[]).map(t=>{let s={};for(let[a,r]of Object.entries(t))a.startsWith("_")||(s[a]=r);return s})}}function un(e){return e==="rag"?"RAG \u63D0\u554F":e==="data"?"\u8CC7\u6599\u67E5\u8A62":e||"\u5176\u4ED6"}async function Os(e,t){let s=performance.now(),a=Hs(e,t),r=String(a.store||"query_history"),i=String(a.keyword||""),o=t.page,l=t.pageSize,g=[],b=[],$=[],f=[];if(r==="settings"){b=(await js({keyword:i})).map(L=>({key:L.key,value:Ns(L.value),updated_at:L.updated_at})),$=[{key:"key",label:"\u8A2D\u5B9A\u9375",type:"mono"},{key:"value",label:"\u503C",type:"longtext"},{key:"updated_at",label:"\u66F4\u65B0\u6642\u9593",type:"datetime"}];let k=new Map;b.forEach(L=>{let E=String(L.key||"").split(".")[0]||"\u5176\u4ED6";k.set(E,(k.get(E)||0)+1)}),f=Array.from(k.entries()).map(([L,E])=>({label:L,value:E})).sort((L,E)=>E.value-L.value)}else{b=(await wt({keyword:i,limit:Ea})).map(L=>({kind:un(L.kind),title:L.title,detail:L.detail,created_at:L.created_at})),$=[{key:"kind",label:"\u985E\u578B",type:"text"},{key:"title",label:"\u67E5\u8A62\u5167\u5BB9",type:"longtext"},{key:"detail",label:"\u6458\u8981",type:"longtext"},{key:"created_at",label:"\u6642\u9593",type:"datetime"}];let k=new Map;b.forEach(L=>k.set(L.kind,(k.get(L.kind)||0)+1)),f=Array.from(k.entries()).map(([L,E])=>({label:L,value:E})).sort((L,E)=>E.value-L.value)}let h=b.length,_=(o-1)*l,v=b.slice(_,_+l),x=Math.round(performance.now()-s),N=Ts();return N&&g.push("IndexedDB \u7121\u6CD5\u4F7F\u7528\uFF0C\u8CC7\u6599\u66AB\u5B58\u5728\u8A18\u61B6\u9AD4\uFF0C\u91CD\u65B0\u6574\u7406\u5F8C\u6703\u6D88\u5931\u3002"),{database:"indexeddb",label:"IndexedDB",status:N?"degraded":"ok",message:N?"\u700F\u89BD\u5668\u4E0D\u5141\u8A31\u4F7F\u7528 IndexedDB\uFF0C\u672C\u9801\u6539\u7528\u8A18\u61B6\u9AD4\u66AB\u5B58\u3002":null,table:r,columns:$,rows:v,total:h,page:o,page_size:l,duration_ms:x,summary:[{label:"\u7B26\u5408\u7B46\u6578",value:String(h)},{label:"\u76EE\u524D\u9801\u9762",value:`${v.length} \u7B46`},{label:"\u5132\u5B58\u6A21\u5F0F",value:$t()==="indexeddb"?"IndexedDB":"\u8A18\u61B6\u9AD4"},{label:"\u67E5\u8A62\u8017\u6642",value:`${x} ms`}],distribution:f,query_text:`INDEXEDDB OPEN 'judgment-console'
OBJECT STORE '${r}'
FILTER ${i?`keyword \u2248 '${i}'`:"1 = 1"}
ORDER BY created_at DESC
LIMIT ${l} OFFSET ${_}`,warnings:g,meta:{store:r,filters:a,client_side:!0}}}async function pn(e,t){let s=!1,a=null,r=[],i="law",o=null,l={},g=0,b=25,$="query",f=null,h=null,_=0,v=[],x=null,N=-1,P=0,k=null,L=null;e.innerHTML=`<section class="page data-page">
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
          ${y("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
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
  </section>`;let E=e.querySelector("#query-sidebar"),M=e.querySelector("#category-switch"),R=e.querySelector("#db-options-wrap"),V=e.querySelector("#sidebar-view-switch"),F=e.querySelector("#filter-area"),K=e.querySelector("#schema-area"),j=e.querySelector("#query-main"),C=e.querySelector("#schema-suggest-popover"),H=e.querySelector("#catalog-meta"),Y=e.querySelector("#refresh-catalog"),we=c=>r.find(d=>d.id===c),je=()=>we(i)?.databases||[],oe=c=>je().find(d=>d.id===c),_e=(c,d)=>`${c}:${d}`,O=(c,d=i)=>l[_e(d,c.id)],me=(c,d)=>{Es(c,d).catch(()=>{})},We=()=>{if(!a){H.textContent="CATALOG \xB7 \u96E2\u7DDA",H.className="badge badge-danger badge-mono";return}let c=je(),d=c.filter(w=>w.available).length,p=we(i);H.textContent=`CATALOG \xB7 ${p?.label||i} \xB7 ${d}/${c.length} \u53EF\u7528`,H.className="badge badge-neutral badge-mono"},Te=c=>{j.innerHTML=Da(c)},st=()=>{let c=k?.returnScroll??L?.returnScroll;k=null,L=null;let d=oe(o),p=d?O(d):null;$==="schema"&&h?.result?j.innerHTML=ns(h.result,T(d,h.tableId),{columnFilters:h.columnFilters||{},searchEnabled:d.id==="postgres"||d.id==="parquet"}):p?.result?j.innerHTML=xt(p.result):d&&Te(d),typeof c=="number"&&window.requestAnimationFrame(()=>window.scrollTo({top:c,behavior:"smooth"}))},ut=(c="law-article-jump")=>{let d=j.querySelector(`#${c}`),p=Gs(d?.value);if(!p){I("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),d?.focus();return}let A=[...j.querySelectorAll("[data-article-no]")].find(S=>S.dataset.articleNo===p);if(!A){I(`\u627E\u4E0D\u5230\u7B2C ${p} \u689D\u3002`,"warn");return}A.scrollIntoView({behavior:"instant",block:"center"}),A.classList.add("is-jump-target"),window.setTimeout(()=>A.classList.remove("is-jump-target"),2400)},at=async({lawKey:c,sourceType:d="",lawName:p="",versionId:w=""})=>{let A=oe(o),S=A?O(A):null,q=$==="schema"?h?.result:null;if(!A||!S?.result&&!q||!c)return;let Q=++g;k={seq:Q,lawKey:c,sourceType:d,lawName:p,versionId:w?String(w):"",page:1,detail:null,database:A.id,returnScroll:window.scrollY},L=null,j.innerHTML=tn(p||c),j.scrollIntoView({behavior:"smooth",block:"start"});try{let ie=await z.lawDetail(c,d,k.versionId);if(s||!k||k.seq!==Q)return;k.detail=ie,k.page=1,j.innerHTML=rn(ie,{database:k.database,lawPage:k.page})}catch(ie){if(s||!k||k.seq!==Q)return;j.innerHTML=sn(ie,p||c),I(ie.message||"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868\u3002","danger")}},pt=async({jid:c})=>{let d=oe(o),p=d?O(d):null,w=$==="schema"?h?.result:null;if(!d||!p?.result&&!w||!c)return;let A=++g;k=null;let S=d.id==="parquet"?"parquet":"postgres";L={seq:A,jid:c,detail:null,database:d.id,source:S,returnScroll:window.scrollY},j.innerHTML=on(c),j.scrollIntoView({behavior:"smooth",block:"start"});try{let q=await z.judgmentDetail(c,S);if(s||!L||L.seq!==A)return;L.detail=q,j.innerHTML=dn(q,{database:L.database})}catch(q){if(s||!L||L.seq!==A)return;j.innerHTML=ln(q,c),I(q.message||"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587\u3002","danger")}},m=(c,d)=>`${i}:${c.id}:${d}`,T=(c,d)=>(c.tables||[]).find(p=>p.id===d)?.label||d,B=(c,d,{sort:p=null,columnFilters:w={}}={})=>{let A={column_filters:w};return c.id==="postgres"?(A.table=d,A.schema_preview=!0):c.id==="parquet"&&i==="judgment"?(A.table="judgment_documents",A.columns=Na):c.id==="parquet"&&(A.dataset="all",A.columns=ja),p?.key&&(A.sort=`${p.key}:${p.direction}`),A},Z=async(c,d,{sort:p=null,columnFilters:w={}}={})=>{if(!d)return;$e();let A=m(c,d),S=++_;f={tableId:d},h={key:A,tableId:d,loading:!0,result:null,error:null,sort:p,columnFilters:w},K.innerHTML=as(c,we(i)?.label||i,d),j.innerHTML=Bs(T(c,d));try{let q;if(c.id==="indexeddb"){let Q=_t(c,10);Q.values.store=d,Q.page=1,q=await Os(c,Q)}else c.id==="qdrant"?q={database:"qdrant",label:"Qdrant",status:"not_configured",message:"Qdrant collection \u9700\u8981\u8A9E\u610F\u67E5\u8A62\uFF1BSchema \u50C5\u63D0\u4F9B collection \u540D\u7A31\uFF0C\u4E0D\u5217\u51FA\u524D 10 \u7B46\u8CC7\u6599\u3002",table:d,columns:[],rows:[],total:0,page:1,page_size:10,duration_ms:0,summary:[],distribution:[],query_text:"",warnings:[],meta:{}}:(q=await z.query({database:c.id,filters:B(c,d,{sort:p,columnFilters:w}),page:1,pageSize:10}),p?.key&&(q.meta={...q.meta||{},sort:p}));if(s||S!==_)return;h={key:A,tableId:d,loading:!1,result:q,error:null,sort:p,columnFilters:w},$==="schema"&&f?.tableId===d&&(K.innerHTML=as(c,we(i)?.label||i,d),j.innerHTML=ns(q,T(c,d),{columnFilters:w,searchEnabled:c.id==="postgres"||c.id==="parquet"}))}catch(q){if(s||S!==_)return;h={key:A,tableId:d,loading:!1,result:null,error:q,sort:p,columnFilters:w},$==="schema"&&f?.tableId===d&&(j.innerHTML=Is(q,T(c,d)))}},re=()=>{let c=oe(o);if(!c)return null;if($==="schema"&&h?.result)return{db:c,tableId:h.tableId,columnFilters:h.columnFilters||{},sort:h.sort||null,mode:"schema"};let d=c?O(c):null,p=d?.result;return p&&(c.id==="postgres"||c.id==="parquet")?{db:c,tableId:p.table,columnFilters:d.columnFilters||{},sort:d.sort||null,mode:"query"}:null},ee=(c,d,p)=>{if(!c)return;let w=`${c.db.id}:${c.tableId}:${d}`,A=le.get(w);A&&(window.clearTimeout(A),le.delete(w)),$e();let S={...c.columnFilters||{}},q=String(p||"").trim();if(q?S[d]=q:delete S[d],c.mode==="schema"){Z(c.db,c.tableId,{sort:c.sort,columnFilters:S});return}let Q=O(c.db);Q.columnFilters=S,Q.page=1,Oe(1)},le=new Map,te=()=>{P+=1,v=[],x=null,N=-1,C&&(C.hidden=!0,C.innerHTML="")},U=(c,d)=>{let p=String(c||""),w=p.toLocaleLowerCase(),A=String(d||"").toLocaleLowerCase(),S=new Array(p.length).fill(!1),q=(ae,xe)=>{for(let pe=ae;pe<ae+xe;pe+=1)pe>=0&&pe<S.length&&(S[pe]=!0)},Q=w.indexOf(A);if(Q>=0)for(;Q>=0;)q(Q,A.length),Q=w.indexOf(A,Q+A.length);else{let ae=[];for(let xe of A.match(/[一-鿿]{2,}/g)||[])for(let pe=0;pe<xe.length-1;pe+=1)ae.push(xe.slice(pe,pe+2));ae.push(...A.match(/[a-z0-9]+/g)||[]);for(let xe of ae){let pe=w.indexOf(xe);for(;pe>=0;)q(pe,xe.length),pe=w.indexOf(xe,pe+xe.length)}}let ie="",ce=0;for(;ce<p.length;)if(S[ce]){let ae=ce;for(;ae<p.length&&S[ae];)ae+=1;ie+=`<mark>${n(p.slice(ce,ae))}</mark>`,ce=ae}else{let ae=ce;for(;ae<p.length&&!S[ae];)ae+=1;ie+=n(p.slice(ce,ae)),ce=ae}return ie||n(p)},ue=(c,d)=>{if(!C)return;let p=c.getBoundingClientRect(),w=Math.min(420,Math.max(220,p.width)),A=Math.min(360,34+d*30),S=p.bottom+4;S+A>window.innerHeight-8&&(S=Math.max(8,p.top-A-4));let q=Math.min(window.innerWidth-w-8,Math.max(8,p.left));C.style.width=`${w}px`,C.style.left=`${q}px`,C.style.top=`${S}px`},ke=c=>{if(!C)return;let d=[...C.querySelectorAll(".schema-suggest-item")];d.length&&(N=Math.max(0,Math.min(d.length-1,c)),d.forEach((p,w)=>{p.classList.toggle("is-active",w===N)}),d[N].scrollIntoView({block:"nearest"}))},be=c=>{let d=v[c],p=x;!d||!p||(te(),ee(p,p.column,d))},Ne=async(c,d,p,w)=>{if(!c||!p.trim()){te();return}let A=++P;x={...c,column:d,input:w},N=-1;try{let S=await z.schemaSuggest({database:c.db.id,table:c.tableId,column:d,query:p,limit:1e3});if(A!==P||document.activeElement!==w||!C)return;let q=Array.isArray(S.values)?S.values:[];if(v=q,!q.length){te();return}let Q=Number(S.total)>q.length?`\u5171 ${u(S.total)} \u500B\u7B26\u5408\uFF0C\u986F\u793A\u524D ${u(q.length)} \u500B`:`\u5171 ${u(S.total)} \u500B\u7B26\u5408`;C.innerHTML=`<div class="schema-suggest-head">${n(Q)}</div>${q.map((ie,ce)=>`<button class="schema-suggest-item" type="button"
            data-schema-suggest-index="${ce}"
            title="${n(ie)}">${U(ie,p)}</button>`).join("")}`,ue(w,q.length),C.hidden=!1}catch{te()}},$e=()=>{let c=document.activeElement;c instanceof HTMLElement&&c.matches("[data-schema-search]")&&c.blur(),te()},mt=(c,{resetReport:d=!1}={})=>{$e();let p=O(c);if(M.innerHTML=Cs(r,i),R.innerHTML=Ba(je(),c.id),V.innerHTML=Ia($),$==="schema"?(F.hidden=!0,F.innerHTML="",K.hidden=!1,K.innerHTML=as(c,we(i)?.label||i,f?.tableId||"")):(K.hidden=!0,K.innerHTML="",F.hidden=!1,F.innerHTML=`${Ps(c)}${ts(c,p)}<div class="sidebar-note">${Rs(c)}</div>`),We(),$==="schema"){let w=f?m(c,f.tableId):"";if(h&&h.key===w){let A=T(c,h.tableId);h.loading?j.innerHTML=Bs(A):h.error?j.innerHTML=Is(h.error,A):j.innerHTML=ns(h.result,A,{columnFilters:h.columnFilters||{},searchEnabled:c.id==="postgres"||c.id==="parquet"})}else j.innerHTML=Wa(c);return}d?Te(c):p.result?j.innerHTML=xt(p.result):Te(c)},vt=(c,{persist:d=!0,resetReport:p=!1}={})=>{let w=je(),A=w.find(q=>q.id===c)||w[0];if(!A)return;k=null,L=null,f=null,h=null,_+=1,o=A.id;let S=_e(i,A.id);l[S]||(l[S]=_t(A,b)),mt(A,{resetReport:p}),d&&(me(`data.last_database.${i}`,A.id),me("data.last_category",i))},Ae=(c,{persist:d=!0,resetReport:p=!0,databaseId:w=null}={})=>{let A=we(c)||r[0];if(!A)return;i=A.id,k=null,L=null;let S=A.databases||[],q=w&&S.find(Q=>Q.id===w)||S.find(Q=>Q.id===o)||S[0];if(o=q?.id||null,!q){M.innerHTML=Cs(r,i),R.innerHTML=`<div class="sidebar-notice">${G({tone:"warn",title:"\u6C92\u6709\u53EF\u7528\u7684\u8CC7\u6599\u4F86\u6E90",text:"\u9019\u500B\u985E\u5225\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u5EAB\u9078\u9805\u3002"})}</div>`,F.innerHTML="",We();return}vt(q.id,{persist:!1,resetReport:p}),d&&(me("data.last_category",A.id),me(`data.last_database.${A.id}`,q.id))},nt=c=>{let d=O(c),p=F.querySelector("#data-filter-form");p&&(d.values=kt(p,c,d))},Oe=async(c=null)=>{let d=oe(o);if(!d)return;$e();let p=O(d);nt(d),c!==null&&(p.page=c),(!Number.isFinite(p.page)||p.page<1)&&(p.page=1);let w=++g;k=null,L=null,j.innerHTML=ot(d);let A=F.querySelector("#run-query");J(A,!0,"\u67E5\u8A62\u4E2D\u2026");try{let S;if(d.id==="indexeddb"?S=await Os(d,p):S=await z.query({database:d.id,filters:ss(d,p),page:p.page,pageSize:p.pageSize}),s||w!==g)return;S.meta={...S.meta||{},column_filters:p.columnFilters||{},searchable:d.id==="postgres"||d.id==="parquet",sort:p.sort||S.meta?.sort||null},p.result=S,p.page=Number(S.page)||p.page,p.pageSize=Number(S.page_size)||p.pageSize,j.innerHTML=xt(S);let q=we(i)?.label||i;await yt({kind:"data",title:`${q} \xB7 ${d.label} \xB7 ${S.table||S.label||"query"}`,detail:`${u(S.total)} \u7B46 \xB7 ${D(S.duration_ms)}`,payload:{category:i,database:d.id,filters:ss(d,p),page:p.page,page_size:p.pageSize}}),me("data.last_query",{category:i,database:d.id,filters:ss(d,p),page:p.page,page_size:p.pageSize,at:new Date().toISOString()})}catch(S){if(s||w!==g)return;j.innerHTML=At(S,d),I(S.message||"\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{!s&&w===g&&J(A,!1)}},Ft=async()=>{Y.disabled=!0,J(Y,!0,"\u6574\u7406\u4E2D\u2026");try{let[c,d,p,w,A]=await Promise.all([z.catalog(),it("data.last_category","law"),it("data.last_database.law","postgres"),it("data.last_database.judgment","postgres"),it("data.page_size",25)]);if(s)return;a=c,r=Array.isArray(a.categories)?a.categories:[],b=Fs.includes(Number(A))?Number(A):25;for(let Q of r)for(let ie of Q.databases||[]){let ce=_e(Q.id,ie.id);l[ce]||(l[ce]=_t(ie,b))}let S=r.find(Q=>Q.id===d)||r[0];if(!S){M.innerHTML="",R.innerHTML=`<div class="sidebar-notice">${G({tone:"danger",title:"\u6C92\u6709\u53EF\u7528\u7684\u5206\u985E",text:"Catalog \u6C92\u6709\u56DE\u50B3\u6CD5\u898F\u547D\u4EE4\u6216\u5224\u6C7A\u5206\u985E\u3002"})}</div>`;return}let q=S.id==="judgment"?w:p;if(i=S.id,o=null,Ae(S.id,{persist:!1,resetReport:!0,databaseId:q}),s)return;I("\u8CC7\u6599\u5EAB catalog \u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(c){if(s)return;a=null,r=[],M.innerHTML="",We(),R.innerHTML=`<div class="sidebar-notice">${G({tone:"danger",title:"\u7121\u6CD5\u8B80\u53D6 catalog",text:n(c.message||"\u8ACB\u78BA\u8A8D API \u662F\u5426\u555F\u52D5\u3002")})}
      <button class="btn btn-secondary btn-sm" type="button" id="catalog-retry" style="margin-top:10px">
        ${y("refresh",14)}<span>\u91CD\u8A66</span>
      </button></div>`,j.innerHTML=`<div class="report-empty">${ge({iconName:"server",title:"API \u76EE\u524D\u7121\u6CD5\u9023\u7DDA",text:"\u67E5\u8A62\u5831\u8868\u9700\u8981 FastAPI \u63D0\u4F9B catalog \u8207\u8CC7\u6599\u67E5\u8A62 API\u3002\u8ACB\u78BA\u8A8D judgment-web \u5DF2\u555F\u52D5\u3002"})}</div>`}finally{s||(Y.disabled=!1,J(Y,!1))}};E.addEventListener("change",c=>{let d=c.target;if(d.name==="category"){Ae(d.value);return}if(d.name==="database"){vt(d.value);return}let p=oe(o);if(!p)return;let w=O(p),A=F.querySelector("#data-filter-form");!A||!d.name||(w.values=kt(A,p,w),w.page=1,d.name==="table"&&(k=null,L=null,w.sort=null,w.columnFilters={},w.result=null,F.innerHTML=ts(p,w),Te(p)))}),E.addEventListener("input",c=>{let d=oe(o);if(!d)return;let p=F.querySelector("#data-filter-form");if(!p||!c.target.name||c.target.name==="table")return;let w=O(d);w.values=kt(p,d,w)}),E.addEventListener("submit",c=>{c.target.id==="data-filter-form"&&(c.preventDefault(),Oe(1))}),E.addEventListener("click",c=>{let d=c.target.closest("[data-action]"),p=d?.dataset.action;if(p==="sidebar-view"){let w=oe(o);if(!w)return;let A=O(w),S=F.querySelector("#data-filter-form");S&&$==="query"&&(A.values=kt(S,w,A)),$=d.dataset.view==="schema"?"schema":"query",mt(w);return}if(p==="select-schema-table"){let w=oe(o);if(!w)return;Z(w,d.dataset.tableId||"");return}if(p==="reset"){let w=oe(o);if(!w)return;k=null,L=null;let A=O(w);l[_e(i,w.id)]=_t(w,A.pageSize),F.innerHTML=`${Ps(w)}${ts(w,l[_e(i,w.id)])}<div class="sidebar-note">${Rs(w)}</div>`,Te(w),I("\u5DF2\u91CD\u8A2D\u9019\u500B\u8CC7\u6599\u5EAB\u7684\u67E5\u8A62\u689D\u4EF6\u3002","info",2400);return}c.target.closest("#catalog-retry")&&Ft()}),j.addEventListener("input",c=>{let d=c.target.closest("[data-schema-search]");if(!d)return;let p=re();if(!p)return;let w=d.dataset.schemaSearch||"",A=d.value,S=`${p.mode}:${p.db.id}:${p.tableId}:${w}`,q=le.get(S);if(q&&window.clearTimeout(q),!A.trim()){le.delete(S),te(),ee(p,w,"");return}let Q=window.setTimeout(()=>{le.delete(S),Ne(p,w,A,d)},250);le.set(S,Q)}),j.addEventListener("keydown",c=>{let d=c.target.closest("[data-schema-search]");if(!d)return;let p=re();if(p){if(c.key==="Escape"){te();return}if(c.key==="ArrowDown"||c.key==="ArrowUp"){if(!C||C.hidden)return;c.preventDefault();let w=c.key==="ArrowDown"?1:-1;ke(N<0?w>0?0:v.length-1:N+w);return}if(c.key==="Enter"){if(c.preventDefault(),C&&!C.hidden&&N>=0){be(N);return}ee(p,d.dataset.schemaSearch||"",d.value)}}}),C?.addEventListener("mousedown",c=>{c.preventDefault()}),C?.addEventListener("click",c=>{let d=c.target.closest("[data-schema-suggest-index]");d&&be(Number(d.dataset.schemaSuggestIndex))});let bs=c=>{c.target.closest("[data-schema-search]")||C?.contains(c.target)||te()};return document.addEventListener("click",bs),window.addEventListener("scroll",te,!0),window.addEventListener("resize",te),j.addEventListener("keydown",c=>{c.target.matches(".law-jump-input")&&c.key==="Enter"&&(c.preventDefault(),ut(c.target.id))}),j.addEventListener("click",async c=>{let d=c.target.closest("[data-action]");if(!d)return;let p=d.dataset.action,w=oe(o),A=w?O(w):null,S=A?.result;if(p==="back-to-results"){st();return}if(p==="open-law"){at({lawKey:d.dataset.lawKey||"",sourceType:d.dataset.lawSource||"",lawName:d.dataset.lawName||""});return}if(p==="open-judgment"){pt({jid:d.dataset.jid||""});return}if(p==="jump-article"){ut(d.dataset.jumpInput||"law-article-jump");return}if(p==="sort-column"){let q=d.dataset.sortKey||"";if(!q||!w)return;if($==="schema"&&h?.result){let ce=h.sort,ae=q==="jdate"||q==="law_modified_date"||q==="article_count"||q==="citation_count"||q==="full_text_length"||q==="created_at"||q==="updated_at",xe=ce?.key===q?ce.direction==="asc"?"desc":"asc":ae?"desc":"asc";Z(w,h.tableId,{sort:{key:q,direction:xe},columnFilters:h.columnFilters||{}});return}if(!A)return;let Q=A.sort,ie=Q?.key===q?Q.direction==="asc"?"desc":"asc":q==="jdate"?"desc":"asc";A.sort={key:q,direction:ie},Oe(1);return}if(p==="retry"){Oe(A?.page||1);return}if(S){if(p==="prev-page"){Oe(Math.max(1,Number(S.page)-1));return}if(p==="next-page"){let q=Math.max(1,Math.ceil(Number(S.total)/Number(S.page_size)));Oe(Math.min(q,Number(S.page)+1));return}if(p==="copy-query"){let q=await ht(S.query_text||"");I(q?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",q?"ok":"warn");return}if(p==="export-json"){let q=`${S.database}-${S.table||"query"}-page-${S.page}.json`;Be(q,JSON.stringify(Mt(S),null,2),"application/json;charset=utf-8"),I(`\u5DF2\u532F\u51FA ${q}`,"ok");return}if(p==="export-csv"){let q=`${S.database}-${S.table||"query"}-page-${S.page}.csv`;Be(q,Lt(S),"text/csv;charset=utf-8"),I(`\u5DF2\u532F\u51FA ${q}`,"ok")}}}),j.addEventListener("change",c=>{let d=c.target.closest("[data-action='select-law-version']");if(d&&k){at({lawKey:k.lawKey,sourceType:k.sourceType,lawName:k.lawName,versionId:d.value});return}if(!c.target.matches("[data-page-size]"))return;let p=oe(o);if(!p)return;let w=O(p);w.pageSize=Number(c.target.value)||25,w.page=1,me("data.page_size",w.pageSize),Oe(1)}),Y.addEventListener("click",()=>{Ft()}),await Ft(),t&&typeof t.setTitle=="function"&&t.setTitle("\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"),()=>{s=!0;for(let c of le.values())window.clearTimeout(c);le.clear(),te(),document.removeEventListener("click",bs),window.removeEventListener("scroll",te,!0),window.removeEventListener("resize",te)}}var Ws=[10,25,50,100],mn=[{value:"started_at:desc",label:"Timestamp \u65B0 \u2192 \u820A"},{value:"started_at:asc",label:"Timestamp \u820A \u2192 \u65B0"},{value:"duration_ms:desc",label:"\u8017\u6642\u591A \u2192 \u5C11"},{value:"duration_ms:asc",label:"\u8017\u6642\u5C11 \u2192 \u591A"}];function cs(){return{process:"",module:"",status:"",method:"",model:"",keyword:"",from_date:"",to_date:"",min_duration:"",sort:"started_at:desc"}}function vn(e,t=e){return`<option value="${n(e)}">${n(t)}</option>`}function lt(e,t,s,a,r=""){return`<div class="field">
    <label class="field-label" for="performance-${e}">
      <span>${n(t)}</span>
      <span class="field-tag">${n(e)}</span>
    </label>
    <select class="select" id="performance-${e}" name="${n(e)}">
      ${vn("","\u5168\u90E8")}
      ${s.map(i=>`<option value="${n(i)}" ${String(i)===String(a)?"selected":""}>${n(i)}</option>`).join("")}
    </select>
    ${r?`<span class="field-help">${n(r)}</span>`:""}
  </div>`}function gn(e,t){let s=mn.map(a=>`<option value="${a.value}" ${a.value===t.sort?"selected":""}>${a.label}</option>`).join("");return`
    ${lt("process","\u7A0B\u5E8F",e.processes||[],t.process)}
    ${lt("module","\u6A21\u7D44",e.modules||[],t.module)}
    ${lt("model","\u6A21\u578B",e.models||[],t.model)}
    ${lt("status","\u72C0\u614B",e.statuses||[],t.status)}
    ${lt("method","\u65B9\u6CD5",e.methods||[],t.method)}
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
    </div>`}function Js(){let e=document.getElementById("performance-filter-form");if(!e)return cs();let t=new FormData(e);return{process:String(t.get("process")||""),module:String(t.get("module")||""),status:String(t.get("status")||""),method:String(t.get("method")||""),model:String(t.get("model")||""),keyword:String(t.get("keyword")||"").trim(),from_date:String(t.get("from_date")||""),to_date:String(t.get("to_date")||""),min_duration:String(t.get("min_duration")||""),sort:String(t.get("sort")||"started_at:desc")}}function Ks(e){if(e==null)return"null";if(typeof e=="object")try{let t=JSON.stringify(e);return t.length>160?`${t.slice(0,157)}\u2026`:t}catch{return String(e)}return String(e)}function fn(e){if(!e)return"";let t=new Date(e);if(Number.isNaN(t.getTime()))return"";let s=String(t.getHours()).padStart(2,"0"),a=String(t.getMinutes()).padStart(2,"0"),r=String(t.getSeconds()).padStart(2,"0"),i=String(t.getMilliseconds()).padStart(3,"0");return`${s}:${a}:${r}.${i}`}function hn(e){let t=String(e?.module||"");return t.includes("static")||t.includes("frontend")?"is-client":t.includes("judgment.rag")?"is-rag":t.includes("judgment.web.app")?"is-api":t.includes("judgment.web.query")?"is-data":t.includes("judgment.judgment_index")?"is-index":"is-other"}function bn(e){let t=new Map(e.map(a=>[a.seq,a.parent_seq])),s=new Map;for(let a of e){if(Number.isInteger(a.depth)){s.set(a.seq,a.depth);continue}let r=0,i=a.parent_seq,o=0;for(;i&&t.has(i)&&o<20;)r+=1,i=t.get(i),o+=1;s.set(a.seq,r)}return s}function $n(e){let t=Object.entries(e||{});if(!t.length)return'<span class="muted">\u7121\u53C3\u6578</span>';let s=t.slice(0,8),a=t.length-s.length;return`<div class="flow-param-list">${s.map(([r,i])=>`<span class="flow-param">
        <span class="flow-param-key">${n(r)}</span>
        <span class="flow-param-value">${n(Ks(i))}</span>
      </span>`).join("")}${a>0?`<span class="flow-param-more">+${a}</span>`:""}</div>`}function yn(e){let t=new Map,s=Math.max(0,Number(e[0]?.offset_ms)||0);return e.forEach((a,r)=>{let i=Math.max(0,Number(a.offset_ms)||0),o=Math.max(0,Number(a.duration_ms)||0),l=e[r+1],g=l?Math.max(i,Number(l.offset_ms)||i):null,b=g===null?i+o:g,$=Math.max(0,b-i),f=Math.max(0,b-s);t.set(a.seq,{offset:i,duration:o,lap:$,cumulative:f})}),t}function wn(e,t,s,a){let r=a.get(e.seq)||{},i=Math.max(0,Number(r.duration)||0),o=Math.max(0,Number(r.offset)||0),l=Math.max(0,Number(r.lap)||0),g=Math.max(0,Number(r.cumulative)||0),b=Math.max(t,o+i,1),$=Math.min(100,o/b*100),f=Math.min(100-$,Math.max(.6,l/b*100)),h=s.get(e.seq)||0,v=fn(e.started_at)||`+${o.toFixed(0)} ms`,x=e.started_at?`\u958B\u59CB\uFF1A${se(e.started_at)} \xB7 +${o.toFixed(1)} ms`:`\u958B\u59CB\uFF1A+${o.toFixed(1)} ms`;return`<div class="flow-segment ${e.status==="error"?"is-error":""}" style="--depth:${Math.min(h,8)}">
    <div class="flow-segment-head">
      <span class="flow-seq">#${n(String(e.seq??"\u2014"))}</span>
      <span class="flow-segment-name">${n(e.name||"unnamed")}</span>
      <span class="flow-segment-start" title="${n(x)}">${n(v)}</span>
      <span class="flow-segment-duration" title="\u8DDD\u4E0B\u4E00\u9EDE ${D(l)}\uFF1B\u7D2F\u8A08 ${D(g)}">${D(l)}</span>
      <span class="flow-segment-span" title="\u5F9E\u7B2C\u4E00\u9EDE\u5230\u672C\u9EDE\u7D50\u675F\u7684\u7D2F\u8A08\u6642\u9593">\u7D2F\u8A08 ${D(g)}</span>
    </div>
    <div class="flow-segment-loc">
      <span class="flow-segment-loc-text">${n(e.module||"\u2014")}<span class="flow-segment-dot">\xB7</span>${n(e.function||"\u2014")}</span>
      <span class="flow-segment-mobile-cum" title="\u5F9E\u7B2C\u4E00\u9EDE\u5230\u672C\u9EDE\u7D50\u675F\u7684\u7D2F\u8A08\u6642\u9593">\u7D2F\u8A08 ${D(g)}</span>
    </div>
    <div class="flow-track" title="\u958B\u59CB +${o.toFixed(1)} ms \xB7 \u8DDD\u4E0B\u4E00\u9EDE ${D(l)} \xB7 \u7D2F\u8A08 ${D(g)}">
      <span class="flow-bar ${hn(e)}" style="left:${$.toFixed(2)}%;width:${f.toFixed(2)}%"></span>
    </div>
    ${$n(e.params)}
    ${e.error?`<div class="flow-segment-error">${n(e.error)}</div>`:""}
  </div>`}function _n(e){let t=Array.isArray(e?.segments)?e.segments:[],s=Array.isArray(e?.models)?e.models:[],a=e?.client||{},r=Math.max(...t.map(l=>Number(l.avg_ms)||0),1),i=a.samples?D(a.avg_total_ms??0):"\u2014",o=a.samples?D(a.avg_render_ms??0):"\u2014";return`<div class="perf-flow-stats">
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
                    <span class="chip">${n(l.label||"\u2014")}</span>
                    <span class="perf-model-count">${u(l.value)} \u6B21${l.avg_ms?` \xB7 \u5E73\u5747 ${D(l.avg_ms)}`:""}</span>
                  </div>`).join("")}</div>`:'<p class="muted" style="font-size:11px">\u5C1A\u7121\u6A21\u578B\u8CC7\u6599\uFF1B\u65B0\u7684 Flow \u6703\u5F9E params.model \u81EA\u52D5\u5F59\u6574\u3002</p>'}
      </div>
      <div class="perf-flow-stat-panel">
        <div class="report-section-head">
          <span class="report-section-title">\u6700\u6162\u5340\u6BB5\uFF08\u5E73\u5747\uFF09</span>
          <span class="muted" style="font-size:9.5px">\u6700\u8FD1 ${u(e?.sample_size??0)} \u7B46</span>
        </div>
        ${t.length?`<div class="perf-seg-list">${t.slice(0,6).map(l=>`<div class="perf-seg-row">
                    <span class="perf-seg-name" title="${n(l.label)}">${n(l.label)}</span>
                    <span class="perf-seg-track"><span style="width:${Math.max(2,(Number(l.avg_ms)||0)/r*100).toFixed(1)}%"></span></span>
                    <span class="perf-seg-ms">${D(l.avg_ms)}</span>
                  </div>`).join("")}</div>`:'<p class="muted" style="font-size:11px">\u5C1A\u7121\u5340\u6BB5\u8017\u6642\uFF1B\u9700\u6709\u542B flow \u7684\u65B0\u7D00\u9304\u3002</p>'}
      </div>
    </div>
  </div>`}function he(e){let t=Math.max(0,Number(e)||0);if(!t)return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;let s=Math.round(t/1e3),a=Math.floor(s/3600),r=Math.floor(s%3600/60),i=s%60;return a?`${a}h ${String(r).padStart(2,"0")}m ${String(i).padStart(2,"0")}s`:r?`${r}m ${String(i).padStart(2,"0")}s`:`${(t/1e3).toFixed(1)}s`}function Ys(e){let t=String(e?.task||"").trim();return t?t==="auto"?"\u81EA\u52D5\u63A5\u7E8C":`task ${t}`:"\u7D22\u5F15"}function kn(e){let t=(e||[]).slice(-12);if(!t.length)return'<p class="muted" style="font-size:11px">\u5C1A\u7121\u7D22\u5F15\u7D00\u9304\u3002</p>';let s=Math.max(...t.map(a=>Number(a.points_per_second)||0),.1);return`<div class="index-run-bars">${t.map(a=>{let r=Number(a.points_per_second)||0,i=Math.max(2,r/s*100);return`<div class="index-run-row">
        <div class="index-run-label">
          <strong>${n(Ys(a))}</strong>
          <span>${n(se(a.started_at))}</span>
        </div>
        <div class="index-run-track" title="${n(`${u(a.indexed_count)} \u7B46 \xB7 ${he(a.duration_ms)} \xB7 ${u(a.batch_count)} \u6279`)}">
          <span style="width:${i.toFixed(1)}%"></span>
        </div>
        <div class="index-run-value">
          <strong>${r.toFixed(1)}</strong><span>\u7B46/\u79D2</span>
          <em>${u(a.indexed_count)} \u7B46 \xB7 ${he(a.duration_ms)}</em>
        </div>
      </div>`}).join("")}</div>`}function xn(e){let t=(Array.isArray(e.time_breakdown)?e.time_breakdown:[]).map(s=>({...s,ms:Number(s.ms)||0,percent:Number(s.percent)||0})).filter(s=>s.ms>0);return t.length?`<div class="index-breakdown-bar">${t.map(s=>`<span class="index-seg index-seg-${n(s.key)}" style="width:${Math.max(.5,s.percent).toFixed(2)}%" title="${n(`${s.label} ${he(s.ms)}\uFF08${s.percent.toFixed(1)}%\uFF09`)}"></span>`).join("")}</div>
    <div class="index-breakdown-legend">${t.map(s=>`<span class="index-legend-item">
            <i class="index-seg index-seg-${n(s.key)}"></i>
            <span>${n(s.label)}</span>
            <strong>${he(s.ms)}</strong>
            <em>${s.percent.toFixed(1)}%</em>
          </span>`).join("")}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B\u968E\u6BB5\u8A08\u6642\uFF1B\u5F8C\u7E8C\u7D22\u5F15\u6703\u8A18\u9304 Ollama Embedding\u3001Qdrant Upsert \u8207 PostgreSQL \u7D22\u5F15\u7D00\u9304\u7684\u6642\u9593\u7D44\u6210\u3002</div>'}function Sn(e,t){let s=(Array.isArray(e)?e:[]).map(P=>({elapsed:Math.max(0,Number(P.elapsed_s)||0),indexed:Math.max(0,Number(P.indexed)||0)})).filter(P=>P.indexed>0);if(s.length<2)return"";let a=Math.max(...s.map(P=>P.elapsed),(Number(t)||0)/1e3,1),r=Math.max(...s.map(P=>P.indexed),1),i=760,o=150,l=12,g=12,b=i-l*2,$=o-g*2,f=s.map(P=>[l+P.elapsed/a*b,o-g-P.indexed/r*$]),h=f.map(([P,k],L)=>`${L===0?"M":"L"}${P.toFixed(1)},${k.toFixed(1)}`).join(" "),_=`${h} L${f[f.length-1][0].toFixed(1)},${o-g} L${f[0][0].toFixed(1)},${o-g} Z`,v=Math.max(1,Math.ceil(f.length/14)),x=f.map(([P,k],L)=>L%v===0||L===f.length-1?`<circle cx="${P.toFixed(1)}" cy="${k.toFixed(1)}" r="2.6" />`:"").join(""),N=[0,1,2,3].map(P=>{let k=g+$/3*P;return`<line x1="${l}" y1="${k.toFixed(1)}" x2="${i-l}" y2="${k.toFixed(1)}" class="index-chart-grid" />`}).join("");return`<div class="index-chart-card index-progress-card">
    <div class="index-chart-head">
      <span>\u672C\u6B21\u7D22\u5F15\u9032\u5EA6</span>
      <span>${u(r)} \u7B46 \xB7 ${he(a*1e3)}</span>
    </div>
    <svg class="index-progress-svg" viewBox="0 0 ${i} ${o}" role="img" aria-label="\u7D22\u5F15\u9032\u5EA6\u6298\u7DDA\u5716">
      ${N}
      <path d="${_}" class="index-progress-area"></path>
      <path d="${h}" class="index-progress-line"></path>
      ${x}
      <line x1="${l}" y1="${o-g}" x2="${i-l}" y2="${o-g}" class="index-chart-axis"></line>
      <line x1="${l}" y1="${g}" x2="${l}" y2="${o-g}" class="index-chart-axis"></line>
    </svg>
    <div class="index-progress-labels">
      <span>0</span>
      <span>${he(a*500)}</span>
      <span>${he(a*1e3)}</span>
    </div>
  </div>`}function An(e){if(!e||!e.latest)return"";let t=e.latest,s=Array.isArray(e.runs)?e.runs:[],a=e.average||{},r=t.coverage||{},i=r.total_judgments>0?`${u(r.indexed_judgments)} / ${u(r.total_judgments)}\uFF08${(100*r.indexed_judgments/r.total_judgments).toFixed(1)}%\uFF09`:"\u2014",o=[{label:"\u7576\u6B21\u57F7\u884C\u7B46\u6578",value:u(t.indexed_count),note:`${u(t.batch_count)} \u6279 \xD7 ${u(t.batch_size)} \u7B46`},{label:"\u5E73\u5747\u6BCF\u79D2\u7B46\u6578",value:`${(Number(t.points_per_second)||0).toFixed(1)}`,note:"\u7B46/\u79D2"},{label:"\u7576\u6B21\u4F7F\u7528\u6642\u9593",value:he(t.duration_ms),note:`${u(t.scanned_count)} \u7B46\u5DF2\u6383\u63CF`},{label:"\u5E73\u5747\u6BCF\u6279\u6642\u9593",value:he(t.batch_avg_ms),note:t.batch_min_ms||t.batch_max_ms?`\u6700\u5FEB ${he(t.batch_min_ms)} \xB7 \u6700\u6162 ${he(t.batch_max_ms)}`:"\u4EE5\u7E3D\u8017\u6642 \xF7 \u6279\u6578\u8A08\u7B97"}];return`<section class="index-perf-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u7D22\u5F15\u6548\u80FD</div>
        <div class="index-perf-sub">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 \xB7 \u6700\u8FD1 ${u(e.run_count)} \u6B21\u57F7\u884C</div>
      </div>
      <span class="chip">${n(Ys(t))}</span>
    </div>
    <div class="index-perf-summary">
      ${o.map(l=>`<div class="index-perf-stat">
            <div class="summary-label">${n(l.label)}</div>
            <div class="index-perf-value">${n(l.value)}</div>
            <div class="index-perf-note">${n(l.note)}</div>
          </div>`).join("")}
    </div>
    <div class="index-perf-meta">
      <span><strong>\u6700\u8FD1\u4E00\u6B21</strong> ${n(se(t.started_at))}</span>
      <span><strong>batch</strong> ${u(t.batch_size)} \u7B46\uFF0F\u6279</span>
      <span><strong>embedding \u4E0A\u9650</strong> ${t.max_chars?`${u(t.max_chars)} \u5B57`:"\u2014"}</span>
      <span><strong>collection</strong> ${u(t.collection_points)} points</span>
      <span><strong>\u8986\u84CB\u7387</strong> ${n(i)}</span>
      <span><strong>\u5E73\u5747\u6BCF\u6B21\u57F7\u884C</strong> ${he(a.duration_ms)} \xB7 ${(Number(a.points_per_second)||0).toFixed(1)} \u7B46/\u79D2</span>
    </div>
    <div class="index-charts">
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u8FD1\u7D22\u5F15\u541E\u5410</span>
          <span>\u7B46/\u79D2</span>
        </div>
        ${kn(s)}
      </div>
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u65B0\u4E00\u6B21\u6642\u9593\u7D44\u6210</span>
          <span>${he(t.duration_ms)}</span>
        </div>
        ${xn(t)}
      </div>
    </div>
    ${Sn(t.progress,t.duration_ms)}
  </section>`}function Ln(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,r=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${r} \u9801 \xB7
      \u986F\u793A ${u(i)}\u2013${u(o)} / ${u(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Ws.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${y("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=r?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${y("chevronRight",13)}</button>
    </div>
  </div>`}function Mn(e,t){let s=e.flow&&typeof e.flow=="object"?e.flow:null,a=Array.isArray(s?.segments)?[...s.segments].sort((v,x)=>Number(v.seq)-Number(x.seq)):[],r=s?.summary||{},i=Array.isArray(r.models)?r.models:[],o=s?.client||{},l=s?.metadata||{},g=l.question||"",b=l.answer||"",$=g||b?`<div class="perf-flow-qa">
          ${g?`<div class="perf-flow-qa-row"><strong>RAG \u554F\u984C</strong><span>${n(g)}</span></div>`:""}
          ${b?`<div class="perf-flow-qa-row"><strong>RAG \u7B54\u6848</strong><span>${n(b)}</span></div>`:""}
        </div>`:"",f=Math.max(Number(s?.total_ms)||0,Number(e.duration_ms)||0,...a.map(v=>(Number(v.offset_ms)||0)+(Number(v.duration_ms)||0)),1),h=bn(a),_=yn(a);return`<details class="perf-record" ${t===0?"open":""}>
    <summary class="perf-record-summary">
      <span class="perf-record-id">#${n(String(e.id))}</span>
      <span class="perf-record-main">
        <span class="perf-record-title">${n(e.process||"\u672A\u547D\u540D")}</span>
        <span class="perf-record-path mono">${n(e.method||"")} ${n(e.path||"")}</span>
      </span>
      <span class="perf-record-time">${se(e.started_at)}</span>
      <span class="perf-record-duration">${D(e.duration_ms)}</span>
      ${W(e.status)}
      <span class="perf-record-chevron">${y("chevronRight",14)}</span>
    </summary>
    <div class="perf-record-body">
      <div class="perf-flow-meta">
        <span><strong>Request</strong> <span class="mono">${n(e.request_id||s?.request_id||"\u2014")}</span></span>
        <span><strong>Server</strong> ${D(e.duration_ms)}</span>
        ${o.total_ms?`<span><strong>Client \u5168\u6D41\u7A0B</strong> ${D(o.total_ms)}</span>`:""}
        ${o.render_ms!==void 0?`<span><strong>Render</strong> ${D(o.render_ms)}</span>`:""}
        <span><strong>Flow</strong> ${a.length} \u6BB5</span>
        ${a.length?"<span><strong>\u9EDE\u4F4D</strong> \u5340\u9593\uFF1D\u4E0B\u4E00\u9EDE\u958B\u59CB\uFF0D\u672C\u9EDE\u958B\u59CB\uFF1B\u7D2F\u8A08\uFF1D\u7B2C\u4E00\u9EDE\u5230\u672C\u9EDE\u7D50\u675F\uFF0C\u6700\u5F8C\u4E00\u9EDE\u70BA\u7E3D\u6642\u9593</span>":""}
      </div>
      ${$}
      ${i.length?`<div class="chips perf-record-models">${i.map(v=>`<span class="chip">${n(v)}</span>`).join("")}</div>`:""}
      ${a.length?`<div class="flow-axis"><span>0 ms</span><span>${D(f)}</span></div>
            <div class="flow-timeline">${a.map(v=>wn(v,f,h,_)).join("")}</div>`:`<div class="perf-no-flow">\u6B64\u7D00\u9304\u6C92\u6709 flow \u660E\u7D30\uFF08\u53EF\u80FD\u662F\u820A\u8CC7\u6599\u6216 CLI \u7D00\u9304\uFF09\u3002${e.params_text&&e.params_text!=="{}"?`<pre>${n(e.params_text)}</pre>`:""}</div>`}
      ${s?`<details class="flow-json">
              <summary>Flow JSON \xB7 ${a.length} \u6BB5</summary>
              <pre>${n(JSON.stringify(s,null,2))}</pre>
            </details>`:""}
    </div>
  </details>`}var ct={embedding:"Embedding",retrieval:"Qdrant \u6AA2\u7D22",context:"PostgreSQL \u53D6\u6587",llm:"LLM \u751F\u6210",validation:"\u5F15\u7528\u9A57\u8B49"},Vs={embedding:"EMB",retrieval:"\u6AA2\u7D22",context:"\u53D6\u6587",llm:"LLM",validation:"\u9A57\u8B49",overhead:"\u5176\u4ED6"};function Xs(e){return{pending:"\u7B49\u5F85",running:"\u57F7\u884C\u4E2D",success:"\u5B8C\u6210",partial:"\u90E8\u5206\u6210\u529F",failed:"\u5931\u6557",skipped:"\u7565\u904E"}[e]||e||"\u672A\u77E5"}function Tn(e){let t=String(e.status||"pending"),s=Math.max(0,Math.min(100,Number(e.progress)||0)),a=t==="pending"?0:t==="running"?Math.max(s,12):100,r=t==="running"?"\u57F7\u884C\u4E2D\u2026":t==="pending"?"\u7B49\u5F85":e.duration_ms?D(e.duration_ms):Xs(t);return`<div class="test-flow-step is-${n(t)}">
    <div class="test-flow-step-head">
      <span class="test-flow-model" title="${n(e.model||"")}">${n(e.model||"\u2014")}</span>
      <span class="test-flow-step-meta">${n(r)}</span>
    </div>
    <div class="test-flow-step-loc">${n(e.module||"\u2014")}<span class="flow-segment-dot">\xB7</span>${n(e.function||"\u2014")}</div>
    <div class="test-flow-track">
      <span class="test-flow-bar" style="width:${a}%"></span>
    </div>
    ${e.error_message?`<div class="test-flow-error">${n(e.error_message)}</div>`:""}
    ${e.details&&Object.keys(e.details).length?`<div class="test-flow-details">${n(Object.entries(e.details).slice(0,4).map(([i,o])=>`${i}=${Ks(o)}`).join(" \xB7 "))}</div>`:""}
  </div>`}function qn(e,t){if(!t.length)return"";let s=t.reduce((a,r)=>a+(Number(r.progress)||0),0)/t.length;return`<section class="test-flow-stage">
    <div class="test-flow-stage-head">
      <span class="test-flow-stage-title">${n(ct[e]||e)}</span>
      <span class="test-flow-stage-meta">${t.length} \u500B\u7A0B\u5E8F \xB7 ${Math.round(s)}%</span>
    </div>
    <div class="test-flow-stage-steps">${t.map(Tn).join("")}</div>
  </section>`}function Zs(e,t){let s=Date.now(),a=new Map;for(let f of t){let h=Number(f.duration_ms)||0;if(f.status==="running"&&f.started_at){let _=Date.parse(f.started_at);Number.isFinite(_)&&(h=Math.max(h,s-_))}a.set(f.stage,(a.get(f.stage)||0)+h)}let r=Array.isArray(e.stage_order)?e.stage_order:Object.keys(ct),i=[],o=new Set;for(let f of r)t.some(h=>h.stage===f)&&(o.add(f),i.push({stage:f,label:ct[f]||f,short:Vs[f]||f,duration:a.get(f)||0}));for(let[f,h]of a)o.has(f)||i.push({stage:f,label:ct[f]||f,short:Vs[f]||f,duration:h});let l=i.reduce((f,h)=>f+h.duration,0),g=Number(e.total_ms)||0,b=Math.max(l,g),$=Math.max(0,b-l);return $>1&&i.push({stage:"overhead",label:"\u5176\u4ED6\uFF0F\u6392\u7A0B",short:"\u5176\u4ED6",duration:$}),{entries:i,total:b||l,stepTotal:l}}function En(e,t){let{entries:s,total:a}=Zs(e,t),r=s.filter(o=>o.duration>0).map(o=>{let l=a?o.duration/a*100:0;return`<span class="test-flow-time-seg stage-${n(o.stage)}" style="width:${l.toFixed(2)}%" title="${n(o.label)} \xB7 ${D(o.duration)}\uFF08${l.toFixed(1)}%\uFF09">${l>=8?n(o.short):""}</span>`}).join(""),i=s.map(o=>{let l=a?o.duration/a*100:0;return`<span class="test-flow-legend-item">
        <i class="test-flow-dot stage-${n(o.stage)}"></i>
        <span>${n(o.label)}</span>
        <strong>${D(o.duration)}</strong>
        <em>${l.toFixed(1)}%</em>
      </span>`}).join("");return`<div class="test-flow-time">
    <div class="test-flow-total-head">
      <span>\u7E3D\u6D41\u7A0B\u6642\u9593\uFF08\u4F9D\u968E\u6BB5\uFF09</span>
      <span>${D(a)}${e.status==="running"?" \xB7 \u4F30\u7B97\u4E2D":""}</span>
    </div>
    <div class="test-flow-time-bar">
      ${r||'<span class="test-flow-time-empty">\u5C1A\u7121\u968E\u6BB5\u8017\u6642</span>'}
    </div>
    <div class="test-flow-legend">${i}</div>
    ${e.status==="running"?'<div class="test-flow-time-note">\u57F7\u884C\u4E2D\u7684\u968E\u6BB5\u4EE5\u958B\u59CB\u6642\u9593\u4F30\u7B97\uFF1B\u5B8C\u6210\u5F8C\u4EE5\u4F3A\u670D\u5668\u56DE\u5831\u7684 duration \u70BA\u6E96\u3002</div>':""}
  </div>`}function Tt(e,t,s,a={}){let r=a.showHistory!==!1,i=[`<option value="" ${s?"":"selected"}>\u76EE\u524D\uFF0F\u6700\u65B0\u6E2C\u8A66</option>`,...(t||[]).map(k=>`<option value="${n(k.run_id)}" ${k.run_id===s?"selected":""}>${n(Xs(k.status))} \xB7 ${n((k.question||"\u672A\u547D\u540D").slice(0,28))} \xB7 ${n(se(k.started_at))}</option>`)].join(""),o=r?`<label class="test-flow-select-label">\u6B77\u53F2
        <select class="select" id="test-run-select">${i}</select>
      </label>
      <button class="btn btn-secondary btn-sm" type="button" id="test-flow-refresh">
        ${y("refresh",13)}<span>\u66F4\u65B0</span>
      </button>`:`<a class="btn btn-secondary btn-sm" href="#/performance">
        ${y("activity",13)}<span>\u6B77\u53F2 Flow</span>
      </a>`,l=`<div class="test-flow-head">
    <div class="test-flow-heading">
      <div class="eyebrow">PERFORMANCE TEST FLOW</div>
      <div class="test-flow-title">\u6E2C\u8A66\u6D41\u7A0B ${e?W(e.status):""}</div>
      <div class="test-flow-question">${e?n(e.question||"\u672A\u547D\u540D\u6E2C\u8A66"):"\u5C1A\u7121\u6E2C\u8A66\u6D41\u7A0B\u3002\u5C07 header \u7684\u6E2C\u8A66\u6A21\u5F0F\u958B\u95DC\u8A2D\u70BA ON\uFF0C\u4E26\u5728 RAG \u9801\u63D0\u554F\u3002"}</div>
    </div>
    <div class="test-flow-actions">${o}</div>
  </div>`;if(!e)return`<div class="test-flow-panel card">${l}
      ${ge({iconName:"activity",title:"\u7B49\u5F85\u6E2C\u8A66\u6D41\u7A0B",text:"\u6E2C\u8A66\u6A21\u5F0F\u958B\u555F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C\u6240\u6709\u53EF\u7528\u6A21\u578B\uFF0C\u4E26\u5728\u9019\u88E1\u5373\u6642\u986F\u793A\u6BCF\u500B\u968E\u6BB5\u7684\u9032\u5EA6\u3002"})}
    </div>`;let g=Array.isArray(e.steps)?e.steps:[],b=new Map;for(let k of g)b.has(k.stage)||b.set(k.stage,[]),b.get(k.stage).push(k);let f=(Array.isArray(e.stage_order)?e.stage_order:Object.keys(ct)).map(k=>qn(k,b.get(k)||[])).join(""),h=e.models||{},_=Zs(e,g),v=e.status==="running"?`${D(_.total)}\uFF08\u4F30\u7B97\uFF09`:D(e.total_ms),x=g.find(k=>k.stage==="llm"&&k.model===e.summary?.primary_model)||g.find(k=>k.stage==="llm"&&k.details?.answer_preview),N=e.answer||x?.details?.answer_preview||"",P=`<div class="test-flow-answer">
    <div class="test-flow-answer-head">
      <span>RAG \u5F15\u64CE\u7B54\u6848</span>
      ${e.summary?.primary_model?`<span class="mono">${n(e.summary.primary_model)}</span>`:""}
    </div>
    <p>${N?n(N):e.status==="running"?"\u6E2C\u8A66\u9032\u884C\u4E2D\uFF0C\u5C1A\u672A\u7522\u751F\u6700\u7D42\u7B54\u6848\u3002":"\u6B64\u6E2C\u8A66\u6C92\u6709\u4FDD\u5B58\u53EF\u986F\u793A\u7684\u7B54\u6848\u3002"}</p>
  </div>`;return`<div class="test-flow-panel card">
    ${l}
    <div class="test-flow-meta">
      <span><strong>Run</strong> <span class="mono">${n(e.run_id)}</span></span>
      <span><strong>\u958B\u59CB</strong> ${n(se(e.started_at))}</span>
      <span><strong>\u7E3D\u8017\u6642</strong> ${v}</span>
      <span><strong>Embedding</strong> ${Array.isArray(h.embedding)?h.embedding.length:0} \u500B</span>
      <span><strong>LLM</strong> ${Array.isArray(h.llm)?h.llm.length:0} \u500B</span>
      <span><strong>\u968E\u6BB5</strong> ${n(e.stage_label||e.stage||"\u2014")}</span>
    </div>
    ${P}
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
    ${En(e,g)}
    <div class="test-flow-foot">
      <span>${e.status==="running"?"\u6E2C\u8A66\u57F7\u884C\u4E2D\uFF1B\u6B64\u5716\u8868\u6703\u81EA\u52D5\u66F4\u65B0\u3002":r?"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u5F9E\u4E0A\u65B9\u300C\u6B77\u53F2\u300D\u9078\u55AE\u9084\u539F\u5176\u4ED6 Flow\u3002":"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u81F3\u6548\u80FD\u5831\u8868\u67E5\u770B\u6B77\u53F2 Flow\u3002"}</span>
      ${e.summary?.primary_model?`<span class="mono">primary=${n(e.summary.primary_model)}</span>`:""}
    </div>
  </div>`}function jn(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.summary)?e.summary:[],a=e.flow_stats||e.meta?.flow_stats||{},r=e.index_stats||null;return`<div class="report-card performance-flow-report" data-database="performance">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">PERFORMANCE FLOW REPORT</div>
        <div class="report-title">
          \u6548\u80FD\u5831\u8868 ${W(e.status||"ok")}
          <span class="chip">performance_records</span>
        </div>
        <div class="report-sub">
          ${u(e.total)} \u7B46\u7B26\u5408 \xB7 ${D(e.duration_ms)} \xB7
          \u6BCF\u6B21\u57F7\u884C\u6309\u9215\u7684\u5B8C\u6574 Flow
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${y("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${y("file",14)}<span>JSON</span></button>
      </div>
    </div>
    ${s.length?`<div class="summary-strip">${s.map(i=>`<div class="summary-item">
                <div class="summary-label">${n(i.label)}</div>
                <div class="summary-value">${n(i.value)}</div>
              </div>`).join("")}</div>`:""}
    ${An(r)}
    ${_n(a)}
    <div class="report-section-head perf-flow-list-head">
      <span class="report-section-title">Flow \u7D00\u9304</span>
      <span class="muted" style="font-size:9.5px">\u9EDE\u64CA\u5217\u5C55\u958B\u6A21\u7D44\u3001\u51FD\u6578\u3001\u53C3\u6578\u8207\u5340\u6BB5\u8017\u6642</span>
    </div>
    <div class="perf-record-list">
      ${t.length?t.map((i,o)=>Mn(i,o)).join(""):ge({iconName:"activity",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684 Flow",text:"\u653E\u5BEC\u65E5\u671F\u3001\u6A21\u578B\u6216\u8017\u6642\u689D\u4EF6\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}
    </div>
    ${Ln(e)}
    <details class="perf-query-details">
      <summary>\u67E5\u8A62\u8A9E\u53E5\u8207\u8B66\u544A</summary>
      <div class="query-box">
        <pre class="query-code">${n(e.query_text||"\u2014")}</pre>
        <button class="btn btn-secondary btn-sm btn-copy" type="button" data-action="copy-query">
          ${y("copy",12)}<span>\u8907\u88FD</span>
        </button>
      </div>
      ${Array.isArray(e.warnings)&&e.warnings.length?`<div class="warnings">${e.warnings.map(i=>`<div class="warning-line">${n(i)}</div>`).join("")}</div>`:""}
    </details>
  </div>`}async function Nn(e,t){let s=!1,a=cs(),r={processes:[],modules:[],statuses:[],methods:[],models:[]},i=1,o=25,l=null;e.innerHTML=`<section class="page data-page performance-page">
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
          ${y("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
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
              ${y("search",15)}<span>\u57F7\u884C\u67E5\u8A62</span>
            </button>
          </div>
        </form>
        <div class="sidebar-note">Flow \u5BEB\u5165 PostgreSQL \u7684 performance_records.flow\uFF08JSON\uFF09\uFF0C\u9810\u8A2D\u4FDD\u7559\u81F3\u5C11 90 \u5929\uFF1B\u53EF\u4F9D\u6A21\u578B\u3001\u7A0B\u5E8F\u3001\u6A21\u7D44\u8207\u8017\u6642\u7BE9\u9078\u3002</div>
      </aside>
      <section class="query-main" id="performance-main" aria-label="\u6548\u80FD\u5831\u8868" aria-live="polite">
        <div id="performance-test-flow"></div>
        <div id="performance-report">${ot({label:"\u6548\u80FD\u5831\u8868"})}</div>
      </section>
    </div>
  </section>`;let g=e.querySelector("#performance-filter-fields"),b=e.querySelector("#performance-filter-form"),$=e.querySelector("#performance-test-flow"),f=e.querySelector("#performance-report"),h=e.querySelector("#performance-meta"),_=e.querySelector("#performance-refresh"),v=null,x=[],N="",P=null,k="",L=()=>{g.innerHTML=gn(r,a)},E=()=>{let j=JSON.stringify({selected:N,tick:v?.status==="running"?Math.floor(Date.now()/1e3):0,runs:x.map(C=>`${C.run_id}:${C.status}`),run:v?{run_id:v.run_id,status:v.status,progress:v.progress,steps:(v.steps||[]).map(C=>`${C.stage}:${C.model}:${C.status}:${C.progress}`)}:null});j!==k&&(k=j,$.innerHTML=Tt(v,x,N))},M=async()=>{try{let j=await z.testRuns(30);if(s)return;x=Array.isArray(j.runs)?j.runs:[]}catch{if(s)return;x=[]}},R=async()=>{try{let j=N?await z.testRun(N):await z.testRunCurrent();if(s)return;v=j.run||null,!N&&v&&v.status!=="running"&&!x.some(C=>C.run_id===v.run_id)&&await M(),E()}catch{if(s)return;v=null,E()}},V=async()=>{s||(N||await R(),s||(P=window.setTimeout(V,1500)))};$.addEventListener("change",async j=>{j.target.id==="test-run-select"&&(N=String(j.target.value||""),await R())}),$.addEventListener("click",async j=>{j.target.closest("#test-flow-refresh")&&(N="",await M(),await R())});let F=async(j=i)=>{i=Math.max(1,Number(j)||1),a=Js(),f.innerHTML=ot({label:"\u6548\u80FD\u5831\u8868"});let C=e.querySelector("#performance-run");J(C,!0,"\u67E5\u8A62\u4E2D\u2026");try{let H=await z.performance(a,i,o);if(s)return;l=H,i=Number(H.page)||i,o=Number(H.page_size)||o,f.innerHTML=jn(H),h.textContent=`PERFORMANCE \xB7 ${u(H.total)} \u7B46`,h.className="badge badge-neutral badge-mono"}catch(H){if(s)return;f.innerHTML=At(H,{label:"\u6548\u80FD\u5831\u8868"}),I(H.message||"\u6548\u80FD\u5831\u8868\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{s||J(C,!1)}},K=async()=>{try{r=await z.performanceOptions()}catch{r={processes:[],modules:[],statuses:[],methods:[],models:[]}}L()};return b.addEventListener("submit",j=>{j.preventDefault(),F(1)}),e.querySelector('[data-action="reset"]').addEventListener("click",()=>{a=cs(),i=1,L(),F(1)}),_.addEventListener("click",async()=>{a=Js(),_.disabled=!0,J(_,!0,"\u6574\u7406\u4E2D\u2026"),await K(),await M(),s||await R(),s||await F(1),s||(_.disabled=!1,J(_,!1))}),f.addEventListener("click",async j=>{let C=j.target.closest("[data-action]");if(!C||!l)return;let H=C.dataset.action;if(H==="retry"){F(i);return}if(H==="prev-page"){F(Math.max(1,Number(l.page)-1));return}if(H==="next-page"){let Y=Math.max(1,Math.ceil(Number(l.total)/Number(l.page_size)));F(Math.min(Y,Number(l.page)+1));return}if(H==="copy-query"){let Y=await ht(l.query_text||"");I(Y?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",Y?"ok":"warn");return}if(H==="export-json"){let Y=`performance-page-${l.page}.json`;Be(Y,JSON.stringify(Mt(l),null,2),"application/json;charset=utf-8"),I(`\u5DF2\u532F\u51FA ${Y}`,"ok");return}if(H==="export-csv"){let Y=`performance-page-${l.page}.csv`;Be(Y,Lt(l),"text/csv;charset=utf-8"),I(`\u5DF2\u532F\u51FA ${Y}`,"ok")}}),f.addEventListener("change",j=>{j.target.matches("[data-page-size]")&&(o=Number(j.target.value)||25,Ws.includes(o)||(o=25),F(1))}),await Promise.allSettled([K(),M()]),s||(await R(),await F(1),V()),t&&typeof t.setTitle=="function"&&t.setTitle("\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"),()=>{s=!0,P&&window.clearTimeout(P)}}var Pn=["\u91D1\u878D\u6D88\u8CBB\u8005\u4FDD\u8B77\u6CD5\u5982\u4F55\u8655\u7406\u91D1\u878D\u6D88\u8CBB\u722D\u8B70\uFF1F","\u8B49\u5238\u4EA4\u6613\u6CD5\u5C0D\u5167\u7DDA\u4EA4\u6613\u6709\u4EC0\u9EBC\u898F\u7BC4\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5438\u6536\u5B58\u6B3E\u8207\u6388\u4FE1\u6709\u54EA\u4E9B\u9650\u5236\uFF1F","\u4FDD\u96AA\u6CD5\u5C0D\u65BC\u696D\u52D9\u54E1\u4E0D\u7576\u62DB\u652C\u7684\u8CAC\u4EFB\u898F\u5B9A\uFF1F","\u9280\u884C\u6CD5\u6709\u591A\u5C11\u689D\u6587\uFF1F","\u8B49\u5238\u71DF\u696D\u54E1\u5E38\u89F8\u72AF\u4EC0\u9EBC\u6CD5\u898F\u6216\u547D\u4EE4\uFF1F","\u6709\u54EA\u4E9B\u6CD5\u898F\u662F\u548C\u58FD\u96AA\u53CA\u7522\u96AA\u76F8\u95DC\u7684\uFF1F"];function Cn(){return`<div class="answer-placeholder">
    <span class="empty-icon">${y("sparkles",26)}</span>
    <h2 class="empty-title">\u7B54\u6848\u53EA\u6703\u4F86\u81EA\u6AA2\u7D22\u5230\u7684\u5224\u6C7A\u53CA\u6CD5\u898F\u7247\u6BB5</h2>
    <p class="empty-text">\u9001\u51FA\u554F\u984C\u5F8C\uFF0C\u7CFB\u7D71\u6703\u5148\u4EE5 Qdrant \u6AA2\u7D22\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\u4E26\u6A19\u793A\u5F15\u7528\u7DE8\u865F\u3002
      \u82E5\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u660E\u78BA\u986F\u793A\u964D\u7D1A\u72C0\u614B\uFF0C\u4E0D\u6703\u6191\u7A7A\u751F\u6210\u7B54\u6848\u3002</p>
  </div>`}var Rn={"http.request":"FastAPI \u63A5\u6536\u8ACB\u6C42","http.response":"\u56DE\u50B3\u7D50\u679C\u7D66\u524D\u7AEF","rag.answer_question":"RAG \u4E3B\u6D41\u7A0B","rag.coverage":"PostgreSQL \u7D22\u5F15\u8986\u84CB\u6AA2\u67E5","rag.law_retrieval":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22","rag.law_lookup":"\u6BD4\u5C0D\u554F\u984C\u4E2D\u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u540D\u7A31","rag.law_content":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u689D\u6587","rag.qdrant_precheck":"Qdrant collection \u6AA2\u67E5","rag.search":"RAG \u6AA2\u7D22","rag.embed_query":"Ollama embedding \u67E5\u8A62\u5411\u91CF","rag.qdrant_search":"Qdrant \u5411\u91CF\u641C\u5C0B","rag.fetch_documents":"PostgreSQL \u8B80\u53D6\u5224\u6C7A","rag.postgres_fetch":"PostgreSQL \u5224\u6C7A\u67E5\u8A62","rag.build_citations":"\u6574\u7406\u5F15\u7528\u8207\u5224\u6C7A\u7247\u6BB5","rag.extract_excerpt":"\u64F7\u53D6\u76F8\u95DC\u7247\u6BB5","rag.llm":"LLM \u56DE\u7B54\u751F\u6210","rag.llm_request":"Ollama LLM \u751F\u6210","rag.validate_citations":"\u9A57\u8B49\u5F15\u7528\u7DE8\u865F","rag.test_mode":"\u6E2C\u8A66\u6A21\u5F0F\u591A\u6A21\u578B\u6D41\u7A0B","rag.preview_fallback":"\u6CD5\u898F\u9810\u89BD\u964D\u7D1A"};function Bn(e){let t=String(e?.name||""),s=e?.params||{},a=String(s.model||s.embedding_model||"").trim();return t==="rag.llm_request"?`Ollama run ${a||"LLM"}`:t==="rag.llm"?`LLM \u56DE\u7B54\u751F\u6210${a?` \xB7 ${a}`:""}`:t==="rag.embed_query"?`Ollama embedding \u67E5\u8A62\u5411\u91CF${a?` \xB7 ${a}`:""}`:Rn[t]||t||"backend step"}function ea(e){return[e?.module,e?.function,e?.name].filter(Boolean).join(" \xB7 ")}function ta(e){let t=Number(e);return Number.isFinite(t)?`${u(Math.max(0,Math.round(t)))} ms`:"\u2014"}function us(e,t){if(!e)return;e.classList.toggle("is-open",t);let s=e.querySelector("#rag-process-body"),a=e.querySelector(".rag-process-toggle");s&&(s.hidden=!t),a&&(a.setAttribute("aria-expanded",String(t)),a.title=t?"\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B":"\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B")}function In(){return`<div class="rag-process is-open" id="rag-process">
    <div class="rag-process-control">
      <button type="button" class="rag-process-toggle" id="rag-process-toggle"
        aria-expanded="true" aria-controls="rag-process-body" title="\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B">
        <span class="rag-process-toggle-label-collapsed">\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B</span>
        <span class="rag-process-toggle-label-expanded">\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B</span>
        ${y("chevronDown",11)}
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
  </div>`}function Dn(e){let t=e.querySelector("#rag-process"),s=t?.querySelector("#rag-process-list"),a=t?.querySelector("#rag-process-summary"),r=performance.now(),i=new Map,o=(h,_,v)=>{let x=h.querySelector(_);x&&(x.textContent=v)},l=h=>{if(h.failed){o(h.element,".rag-process-meta","\u5931\u6557");return}if(h.hasChildren){o(h.element,".rag-process-meta","");return}o(h.element,".rag-process-meta",ta(h.durationMs))},g=h=>{let _=h-1,v=[...i.values()].reverse();for(let x of v){if(_<0)break;x.depth<=_&&(x.hasChildren||(x.hasChildren=!0,x.element.dataset.hasChildren="true",x.finished&&l(x)),_=x.depth-1)}},b=h=>{if(!s)return null;let _=String(h?.seq??`step-${i.size+1}`),v=i.get(_);if(!v){let x=Math.max(0,Math.min(6,Number(h?.depth)||0));g(x);let N=document.createElement("div");N.className="rag-process-item is-running",N.dataset.processKey=_,N.style.setProperty("--depth",String(x)),N.innerHTML=`<span class="rag-process-dot"></span>
        <span class="rag-process-label"></span>
        <span class="rag-process-meta">\u57F7\u884C\u4E2D\u2026</span>`,s.appendChild(N),v={element:N,depth:x,hasChildren:!1,finished:!1,failed:!1,durationMs:0},i.set(_,v)}return o(v.element,".rag-process-label",Bn(h)),v.element.title=ea(h),v};return{step:h=>{let _=h?.segment;if(!_)return;let v=b(_);if(v){if(h.type==="segment_start"){v.element.classList.add("is-running"),o(v.element,".rag-process-meta","\u57F7\u884C\u4E2D\u2026");return}if(h.type==="segment_end"){let x=_.status==="error";v.element.classList.remove("is-running"),v.element.classList.toggle("is-error",x),v.finished=!0,v.failed=x,v.durationMs=Number(_.duration_ms)||0,l(v),v.element.title=[ea(_),x&&_.error||""].filter(Boolean).join(" \xB7 ")}}},finish:(h=!0)=>{if(!t)return"";t.querySelectorAll(".rag-process-item.is-running").forEach(x=>{x.classList.remove("is-running");let N=x.dataset.hasChildren==="true";o(x,".rag-process-meta",N?"":h?"\u5B8C\u6210":"\u4E2D\u65B7")});let _=s?.children.length||i.size,v=ta(Math.max(0,performance.now()-r));return a&&(a.textContent=h?`\u5B8C\u6210 \xB7 ${_} \u6B65 \xB7 ${v}`:`\u5931\u6557 \xB7 ${_} \u6B65`),t.classList.add("is-complete"),us(t,!1),t.outerHTML},collapse:()=>us(t,!1)}}function On(e,t=!1){let s=t?"\u6E2C\u8A66\u6A21\u5F0F\uFF1A\u6B63\u5728\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207 LLM \u6A21\u578B\uFF0C\u53EF\u80FD\u9700\u8981\u6578\u5206\u9418\u2026":"\u6B63\u5728\u4EE5\u5411\u91CF\u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\u7247\u6BB5\u4E26\u751F\u6210\u56DE\u7B54\uFF1B\u5FEB\u901F\u6A21\u5F0F\u901A\u5E38 2\u201310 \u79D2\u2026";return`<div class="answer-head">
      <div class="answer-head-left">${y("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u4E2D</span>
      </div>
      <div class="answer-head-meta"><span class="spinner"></span></div>
      ${t?"":In()}
    </div>
    <div class="answer-body">
      <p class="answer-text">${s}\u300C${n(e)}\u300D</p>
      <div class="skeleton skeleton-line" style="margin-top:22px;width:92%"></div>
      <div class="skeleton skeleton-line" style="width:76%"></div>
      <div class="skeleton skeleton-line" style="width:84%"></div>
    </div>`}function Fn(e,t){let s=e.score===null||e.score===void 0?"":`\u76F8\u4F3C\u5EA6 ${Number(e.score).toFixed(4)}`,a=[e.court,e.jdate,s].filter(Boolean).map(l=>`<span>${n(l)}</span>`).join(""),r=(Array.isArray(e.matched_laws)?e.matched_laws:[]).slice(0,5).map(l=>`<span class="chip">${n(l)}</span>`).join(""),i=e.jid?` data-action="open-parquet-judgment"
        data-jid="${n(e.jid)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A"
        aria-label="\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A ${n(e.jid)}"`:"",o=e.pdf_url?`<a class="citation-link" href="${n(e.pdf_url)}" target="_blank" rel="noopener noreferrer" title="\u958B\u555F\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF">\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF${y("external",11)}</a>`:"";return`<article class="citation">
    <span class="citation-index">[${e.index??t+1}]</span>
    <div class="citation-body"${i}>
      <h4 class="citation-name">${n(e.jid||"\u672A\u77E5\u6848\u865F")}</h4>
      <div class="citation-meta">${a||"<span>\u5224\u6C7A metadata</span>"}</div>
      ${e.title?`<div class="citation-meta"><span>\u6848\u7531\uFF1A${n(e.title)}</span></div>`:""}
      ${r?`<div class="chips" style="margin-top:8px">${r}</div>`:""}
      ${e.snippet?`<p class="citation-snippet">${n(e.snippet)}</p>`:""}
    </div>
    <div class="citation-links">${o}</div>
  </article>`}function Hn(e,t){let s=[e.law_level,e.law_category,e.article_count?`${u(e.article_count)} \u689D`:""].filter(Boolean).map(r=>`<span>${n(r)}</span>`).join(""),a=e.law_url?`<a class="citation-link" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">\u4F86\u6E90${y("external",11)}</a>`:"";return`<article class="citation">
    <span class="citation-index">${String(e.index??t+1).padStart(2,"0")}</span>
    <div class="citation-body">
      <h4 class="citation-name">${n(e.law_name||"\u672A\u547D\u540D\u6CD5\u898F")}</h4>
      <div class="citation-meta">${s||"<span>\u6CD5\u898F metadata</span>"}</div>
      ${e.snippet?`<p class="citation-snippet">${n(e.snippet)}</p>`:""}
    </div>
    ${a}
  </article>`}function Un(e,t){let s=e.source_label||(e.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),a=e.law_level&&e.law_level!==s?e.law_level:"",r=[`<span class="badge ${e.source_type==="order"?"badge-warn":"badge-info"}">${n(s)}</span>`,a,e.law_category,e.article_count?`${u(e.article_count)} \u689D`:"",e.law_modified_date?`\u7570\u52D5 ${Le(e.law_modified_date)}`:""].filter(Boolean).map(_=>`<span>${_}</span>`).join(""),i=e.first_promulgation?`<div class="citation-meta"><span>\u6700\u65E9\u5236\u5B9A\uFF1A${n(e.first_promulgation.roc_date)}\uFF08\u897F\u5143 ${n(e.first_promulgation.gregorian_date)}\uFF09</span></div>`:"",o=e.stats,l=o?`<div class="law-source-stats">
        <span>\u63D0\u53CA\u300C${n(o.entity||"")}\u300D\u7684\u5224\u6C7A ${u(o.judgment_count||0)} \u7B46</span>
        <span>\u672C\u6CD5\u898F\u88AB\u5F15\u7528 ${u(o.law_count||0)} \u6B21</span>
      </div>`:"",g=e.law_key||"",b=e.source_type||"",$=(Array.isArray(e.articles)?e.articles:[]).slice(0,2).map(_=>{let v=String(_.article_no||"");return`<div class="law-source-article"${g&&v?` data-action="open-law-source"
        data-law-key="${n(g)}"
        data-source-type="${n(b)}"
        data-article-no="${n(v)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u9078\u67E5\u770B ${n(v)} \u7684\u5B8C\u6574\u5167\u5BB9"
        aria-label="\u958B\u555F ${n(e.law_name||"\u6CD5\u898F")} ${n(v)} \u7684\u5B8C\u6574\u689D\u6587"`:""}>
        <span class="law-source-article-no">${n(_.article_no||"\u689D\u6587")}</span>
        <p class="law-source-article-text">${n(_.article_content||"")}</p>
      </div>`}).join(""),f=e.law_url?`<a class="citation-link" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">\u6CD5\u898F\u4F86\u6E90${y("external",11)}</a>`:"",h=e.law_key?` data-action="open-law-source"
        data-law-key="${n(e.law_key)}"
        data-source-type="${n(e.source_type||"")}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F\u672C\u5730 Parquet \u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u59CB\u689D\u6587"
        aria-label="\u958B\u555F ${n(e.law_name||"\u6CD5\u898F")} \u539F\u59CB\u689D\u6587"`:"";return`<article class="citation law-source">
    <span class="citation-index">${String(e.index??t+1).padStart(2,"0")}</span>
    <div class="citation-body"${h}>
      <h4 class="citation-name">${n(e.law_name||"\u672A\u547D\u540D\u6CD5\u898F")}</h4>
      <div class="citation-meta">${r}</div>
      ${i}
      ${l}
      ${$}
    </div>
    <div class="citation-links">${f}</div>
  </article>`}function sa(e){let t=Array.isArray(e.citations)?e.citations:[],s=Array.isArray(e.judgments)?e.judgments:[],a=Array.isArray(e.law_sources)?e.law_sources:[],r=Array.isArray(e.matched_terms)?e.matched_terms:[],i=e.status||"preview",o=!!e.partial,l=!!e.streaming,g=!!e.show_sources||!o,b=s.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u5224\u6C7A \xB7 ${s.length} \u7B46</span>
        <span>vector retrieval \xB7 [\u7DE8\u865F] \u5C0D\u61C9\u56DE\u7B54\u5F15\u7528</span>
      </div>
      <div class="citation-list">${s.map((O,me)=>Fn(O,me)).join("")}</div>`:"",$=a.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4 \xB7 ${a.length} \u7B46</span>
        <span>PostgreSQL metadata \xB7 Parquet \u689D\u6587</span>
      </div>
      <div class="citation-list">${a.map((O,me)=>Un(O,me)).join("")}</div>`:"",f=!s.length&&t.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F \xB7 ${t.length} \u7B46</span>
        <span>metadata match</span>
      </div>
      <div class="citation-list">${t.map((O,me)=>Hn(O,me)).join("")}</div>`:"",h=g?b+$+f:"";!h&&!o&&(h=`<div class="answer-divider"></div>
      ${ge({iconName:"file",title:"\u6C92\u6709\u53EF\u5F15\u7528\u7684\u4F86\u6E90",text:i==="retrieval_only"?"\u76EE\u524D\u5DF2\u5EFA\u7ACB\u7684\u5411\u91CF\u7D22\u5F15\u4E2D\u6C92\u6709\u8DB3\u5920\u76F8\u4F3C\u7684\u5224\u6C7A\uFF0C\u4E5F\u6C92\u6709\u53EF\u5C0D\u61C9\u7684\u6CD5\u898F\u6216\u547D\u4EE4\u3002\u7CFB\u7D71\u4E0D\u6703\u5728\u6C92\u6709\u4F86\u6E90\u6642\u751F\u6210\u7B54\u6848\u3002":"\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u4E14\u554F\u984C\u4E2D\u6C92\u6709\u53EF\u76F4\u63A5\u5C0D\u61C9\u7684\u73FE\u884C\u6CD5\u898F\u540D\u7A31\u3002"})}`);let _=r.length?`<div class="answer-section-label" style="margin-top:18px">
        <span>\u547D\u4E2D\u8A5E\u5F59</span>
      </div>
      <div class="chips">${r.map(O=>`<span class="chip">${n(O)}</span>`).join("")}</div>`:"",v=e.test_run,x=String(e.llm_model||v?.primary_model||"").trim(),N=String(e.embedding_model||"").trim(),P=[x?`LLM\uFF1A${x}`:"",N?`Embedding\uFF1A${N}`:""].filter(Boolean).join(" \xB7 "),k=e.answer_source==="structured",L=String(e.law_answer||"").trim(),E=e.law_framework||null,M=Array.isArray(E?.rows)?E.rows:[],R=Array.isArray(E?.sources)?E.sources:[],V=M.length>0,F=!!L&&!k&&!V,K=l||e.answer_source==="llm"?"LLM \u7D9C\u5408\u56DE\u7B54":"\u6AA2\u7D22\u7D50\u679C\u6458\u8981",j=V?`<div class="answer-block law-framework-block">
        <div class="answer-block-head">
          <span>${n(E.title||"\u76F8\u95DC\u6CD5\u898F\u7684\u8CAC\u4EFB\u67B6\u69CB")}</span>
          <span>${M.length} \u689D</span>
        </div>
        <div class="table-wrap law-framework-table-wrap">
          <table class="data-table is-compact law-framework-table">
            <thead>
              <tr><th scope="col">\u6CD5\u898F</th><th scope="col">\u689D\u6587</th><th scope="col">\u898F\u7BC4\u91CD\u9EDE</th></tr>
            </thead>
            <tbody>
              ${M.map(O=>`<tr>
                    <td>${n(O.law_name||"\u2014")}</td>
                    <td class="cell-number">${n(O.article_no||"\u2014")}</td>
                    <td>${n(O.focus||"\u2014")}</td>
                  </tr>`).join("")}
            </tbody>
          </table>
        </div>
        ${R.length?`<div class="law-framework-sources">
                <span>\u6CD5\u898F\u4F86\u6E90</span>
                ${R.map(O=>`<span class="chip">${n(O.law_name||O)}${O&&O.index!==null&&O.index!==void 0?` [${n(O.index)}]`:""}</span>`).join("")}
              </div>`:""}
      </div>`:"",C=e.answer_source==="llm"&&x?`<span class="answer-model" title="${n(P)}">${y("brain",11)}${n(x)}</span>`:k?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${y("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"",H=l?`${x||"LLM"} \xB7 \u751F\u6210\u4E2D`:C?x||"structured":"retrieval",Y=v?`<div class="test-run-summary">
        <div class="test-run-summary-head">
          <span class="badge badge-warn">\u6E2C\u8A66\u6A21\u5F0F</span>
          ${W(v.status)}
          <span class="mono">${n(v.run_id||"")}</span>
        </div>
        <div class="test-run-summary-body">
          <span>Embedding ${Number(v.models?.embedding?.length||0)} \u500B</span>
          <span>LLM ${Number(v.models?.llm?.length||0)} \u500B</span>
          <span>\u4E3B\u56DE\u7B54 ${n(v.primary_model||"\u2014")}</span>
          <span>${Number(v.total_ms||0)} ms</span>
          <a href="#/performance">\u67E5\u770B\u6E2C\u8A66 Flow</a>
        </div>
      </div>`:"",je=String(e.answer||"").trim()||(l?"\u6B63\u5728\u751F\u6210\u56DE\u7B54\u2026":o?"\u6B63\u5728\u6AA2\u7D22\u5224\u6C7A\u4E26\u751F\u6210 LLM \u56DE\u7B54\u2026":"\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u56DE\u7B54\u3002"),oe=l?" data-partial-answer":"",_e=l?" is-streaming":"";return`${j}
      ${F?`<div class="answer-block law-answer-block">
              <div class="answer-block-head">
                <span>\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22\u7D50\u679C</span>
                <span>${o&&!g?"\u6CD5\u898F\u8CC7\u6599\u5EAB":`${a.length} \u7B46\u4F86\u6E90`}</span>
              </div>
              <p class="answer-text">${n(L)}</p>
            </div>`:""}
      <div class="answer-block">
        ${F||V?`<div class="answer-block-head">
                <span>${n(K)}</span>
                <span>${n(H)}</span>
              </div>`:""}
        <p class="answer-text${_e}"${oe}>${n(je)}</p>
      </div>
      ${e.notice?`<div class="answer-notice">${n(e.notice)}</div>`:""}
      ${Y}
      ${_}
      ${h}`}function zn(e,t,s=""){let a=t.status||"preview",r=a==="operational"?"\u5B8C\u6210":a==="retrieval_only"?"\u50C5\u6AA2\u7D22\u7D50\u679C":a==="preview"?"\u6CD5\u898F\u9810\u89BD":a==="unavailable"||a==="not_configured"?"\u8CC7\u6599\u4E0D\u53EF\u7528":a==="degraded"?"\u964D\u7D1A":"\u5B8C\u6210",i=t.test_run,o=String(t.llm_model||i?.primary_model||"").trim(),l=String(t.embedding_model||"").trim(),g=[o?`LLM\uFF1A${o}`:"",l?`Embedding\uFF1A${l}`:""].filter(Boolean).join(" \xB7 "),b=t.answer_source==="structured",$=t.answer_source==="llm"&&o?`<span class="answer-model" title="${n(g)}">${y("brain",11)}${n(o)}</span>`:b?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${y("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"";return`<div class="answer-head">
      <div class="answer-head-left">${y("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u7D50\u679C</span>
      </div>
      <div class="answer-head-meta">
        ${W(a,r)}
        <span>${Number(t.duration_ms||0)} ms</span>
        ${$}
      </div>
      ${s}
    </div>
    <div class="answer-body">${sa(t)}</div>`}function Qn(e,t=""){return`<div class="answer-head">
      <div class="answer-head-left">${y("alert",16)}
        <span class="answer-head-title">\u7121\u6CD5\u5B8C\u6210\u6AA2\u7D22</span>
      </div>
      ${t}
    </div>
    <div class="answer-body">
      ${G({tone:"danger",title:"\u8ACB\u6C42\u5931\u6557",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
    </div>`}function Gn(e){return e.length?e.map((t,s)=>{let a=Array.isArray(t.payload?.citations)?t.payload.citations.length:0,r=Array.isArray(t.payload?.judgments)?t.payload.judgments.length:0,i=Array.isArray(t.payload?.law_sources)?t.payload.law_sources.length:0,o=a+r+i;return`<button class="history-item" type="button" data-history-index="${s}">
        <span class="history-question">${n(t.title||"\u672A\u547D\u540D\u63D0\u554F")}</span>
        <span class="history-meta">
          <span>${n(Xe(t.created_at))}</span>
          <span>\xB7</span>
          <span>${o?`${o} \u7B46\u4F86\u6E90`:"\u7121\u5F15\u7528"}</span>
        </span>
      </button>`}).join(""):'<div class="history-empty">\u5C1A\u7121\u63D0\u554F\u7D00\u9304\u3002\u9001\u51FA\u7B2C\u4E00\u500B\u554F\u984C\u5F8C\u6703\u4FDD\u5B58\u5728\u6B64\u700F\u89BD\u5668\u3002</div>'}async function Jn(e){let t=!1,s=[],a="",r=!1,i={embedding:[],llm:[]};e.innerHTML=`<section class="page rag-page">
    <header class="rag-hero">
      <span class="eyebrow">JUDGMENT \xB7 LEGAL RAG</span>
      <h1 class="rag-title">\u8B93\u6BCF\u4E00\u500B\u7B54\u6848\uFF0C\u90FD\u80FD\u56DE\u5230\u6CD5\u898F\u8207\u5224\u6C7A</h1>
      <p class="rag-lead">\u4EE5\u91D1\u878D\u6CD5\u898F\u7684\u73FE\u884C\u689D\u6587\u8207\u5224\u6C7A\u7247\u6BB5\u70BA\u6AA2\u7D22\u57FA\u790E\u3002
        \u5148\u5F9E Qdrant \u6AA2\u7D22\u76F8\u4F3C\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\uFF1B\u82E5\u7D22\u5F15\u6216\u6A21\u578B\u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u53EF\u9A57\u8B49\u7684\u6AA2\u7D22\u7D50\u679C\u3002</p>
      <div id="rag-mode-notice">${G({tone:"info",title:"RAG \u670D\u52D9\u72C0\u614B\u6AA2\u67E5\u4E2D",text:"\u6B63\u5728\u78BA\u8A8D Qdrant\u3001Embedding \u8207 LLM \u72C0\u614B\uFF1B\u6240\u6709\u56DE\u7B54\u90FD\u6703\u6A19\u793A\u53EF\u56DE\u6EAF\u7684\u4F86\u6E90\u3002"})}</div>
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
            ${y("sparkles",16)}<span>\u958B\u59CB\u6AA2\u7D22</span>
          </button>
        </div>
      </form>
      <div class="example-chips" id="example-chips" aria-label="\u7BC4\u4F8B\u554F\u984C">
        ${Pn.map(m=>`<button class="example-chip" type="button" data-question="${n(m)}">${n(m)}</button>`).join("")}
      </div>
    </header>

    <div class="rag-grid">
      <section class="card answer-card" id="answer-card" aria-live="polite">
        ${Cn()}
      </section>

      <aside class="rag-side">
        <section class="card">
          <div class="side-card-head">
            <span class="side-card-title">${y("database",14)}\u8CC7\u6599\u73FE\u6CC1</span>
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
            <span class="side-card-title">${y("history",14)}\u6700\u8FD1\u63D0\u554F</span>
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
  </section>`;let o=e.querySelector("#rag-form"),l=e.querySelector("#rag-question"),g=e.querySelector("#rag-submit"),b=e.querySelector("#answer-card"),$=e.querySelector("#rag-stats"),f=e.querySelector("#rag-stats-mode"),h=e.querySelector("#rag-history"),_=e.querySelector("#rag-storage-note"),v=e.querySelector("#rag-clear-history"),x=e.querySelector("#rag-test-mode"),N=e.querySelector("#rag-test-flow"),P=e.querySelector("#rag-judgment-dialog"),k=e.querySelector("#rag-law-dialog"),L=()=>{document.documentElement.classList.toggle("dialog-open",!!e.querySelector("dialog[open]"))};P?.addEventListener("close",L),k?.addEventListener("close",L);let E=null,M=null,R=()=>{l.style.height="auto",l.style.height=`${Math.min(l.scrollHeight,220)}px`},V=async()=>{try{if(s=await wt({limit:6}),t)return;h.innerHTML=Gn(s),_.textContent=$t()==="indexeddb"?"\u63D0\u554F\u7D00\u9304\u5132\u5B58\u5728\u700F\u89BD\u5668 IndexedDB\uFF0C\u4E0D\u6703\u4E0A\u50B3\u5230\u4F3A\u670D\u5668\u3002":"\u700F\u89BD\u5668\u5132\u5B58\u4E0D\u53EF\u7528\uFF0C\u63D0\u554F\u7D00\u9304\u53EA\u4FDD\u7559\u5728\u672C\u6B21\u5DE5\u4F5C\u968E\u6BB5\u3002"}catch{if(t)return;h.innerHTML='<div class="history-empty">\u7121\u6CD5\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u3002</div>'}},F=async()=>{try{let m=await z.status();if(t)return;let T=m.data||{},B=new Map((m.services||[]).map(Ne=>[Ne.id,Ne])),Z=B.get("qdrant"),re=B.get("embedding"),ee=B.get("rag"),le=B.get("llm"),te=Number(T.judgment_indexed_count||0),U=Number(T.judgment_count||0),ue=U?(te/U*100).toFixed(1):"0.0",ke=T.judgment_vector_points===null||T.judgment_vector_points===void 0?"\u2014":u(T.judgment_vector_points);$.innerHTML=`<div class="mini-stats">
          <div class="mini-stat">
            <div class="mini-stat-value">${u(U)}</div>
            <div class="mini-stat-label">\u5224\u6C7A</div>
          </div>
          <div class="mini-stat">
            <div class="mini-stat-value">${u(te)}</div>
            <div class="mini-stat-label">\u5DF2\u7D22\u5F15</div>
          </div>
          <div class="mini-stat">
            <div class="mini-stat-value">${ue}%</div>
            <div class="mini-stat-label">\u7D22\u5F15\u8986\u84CB</div>
          </div>
        </div>
        <div class="side-status-list">
          <div class="side-status-row">
            <span>${y("cube",13)}Qdrant \u5411\u91CF\u7D22\u5F15</span>
            ${W(Z?.status,Z?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
          </div>
          <div class="side-status-row">
            <span>${y("layers",13)}Embedding\uFF08${n(T.judgment_vector_model||"\u2014")}\uFF09</span>
            ${W(re?.status,re?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
          </div>
          <div class="side-status-row">
            <span>${y("brain",13)}RAG \u56DE\u7B54\u7BA1\u7DDA</span>
            ${W(ee?.status,ee?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
          </div>
          <div class="side-status-row">
            <span>${y("sparkles",13)}LLM \u6A21\u578B</span>
            ${W(le?.status,le?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
          </div>
        </div>
        <div class="side-card-foot" style="padding:0;border:0;margin-top:10px">
          Collection\uFF1A${n(T.judgment_vector_collection||"\u2014")} \xB7
          ${ke} points \xB7 \u5269\u9918 ${u(T.judgment_index_remaining)} \u7B46\u5F85\u7D22\u5F15
        </div>`;let be=e.querySelector("#rag-mode-notice");be&&(ee?.status==="operational"?be.innerHTML=G({tone:"ok",title:"\u6AA2\u7D22\u8207\u56DE\u7B54\u5C31\u7DD2",text:`Qdrant\u3001Embedding \u8207 LLM \u5747\u53EF\u4F7F\u7528\uFF1B\u76EE\u524D\u7D22\u5F15\u6DB5\u84CB ${u(te)} / ${u(U)} \u7B46\u5224\u6C7A\u3002\u56DE\u7B54\u4E0D\u662F\u6CD5\u5F8B\u610F\u898B\u3002`}):ee?.status==="degraded"?be.innerHTML=G({tone:"warn",title:"\u90E8\u5206 AI \u5143\u4EF6\u672A\u5C31\u7DD2",text:n(ee.detail||"RAG \u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u6AA2\u7D22\u7D50\u679C\u3002")}):be.innerHTML=G({tone:"info",title:"\u5411\u91CF\u7D22\u5F15\u5C1A\u672A\u5C31\u7DD2 \xB7 \u4E0D\u662F\u6CD5\u5F8B\u610F\u898B",text:n(ee?.detail||"\u8A2D\u5B9A QDRANT_URL\u3001EMBEDDING_URL \u8207 LLM_URL \u4E26\u57F7\u884C judgment-index-vectors \u5F8C\u5373\u53EF\u555F\u7528\u5224\u6C7A\u6AA2\u7D22\u3002")})),f.className=`badge ${ee?.status==="operational"?"badge-ok":ee?.status==="not_configured"?"badge-neutral":"badge-warn"} badge-mono`,f.textContent=ee?.status==="operational"?"RAG \u5C31\u7DD2":ee?.status==="not_configured"?"\u672A\u8A2D\u5B9A":"\u964D\u7D1A"}catch{if(t)return;$.innerHTML='<p class="muted" style="font-size:11px">\u76EE\u524D\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002</p>',f.className="badge badge-danger badge-mono",f.textContent="\u96E2\u7DDA"}},K=()=>{if(!x)return;if(!r){x.innerHTML="";return}let m=Array.isArray(i.embedding)?i.embedding.length:0,T=Array.isArray(i.llm)?i.llm.length:0;x.innerHTML=G({tone:"warn",title:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F",text:`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${m} \u500B embedding \u8207 ${T} \u500B LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002\u6E2C\u8A66 Flow \u6703\u5728\u9801\u9762\u4E0B\u65B9\u5373\u6642\u986F\u793A\uFF0C\u4E5F\u53EF\u5230 <a href="#/performance">\u6548\u80FD\u5831\u8868</a> \u67E5\u770B\u6B77\u53F2\u3002`})},j=async()=>{try{let m=await z.testMode();if(t)return;r=!!m.enabled,i=m.models||{embedding:[],llm:[]},K()}catch{if(t)return;r=!1,K()}},C=m=>{r=!!m.detail?.enabled,i=m.detail?.models||{embedding:[],llm:[]},K()};window.addEventListener("judgment:test-mode",C);let H=m=>{N&&(M=m||null,N.innerHTML=m?Tt(m,[],"",{showHistory:!1}):"")},Y=()=>{E&&(window.clearTimeout(E),E=null)},we=()=>{Y();let m=async()=>{if(!t){try{let T=await z.testRunCurrent();if(t)return;let B=T.run;B&&B.status==="running"&&H(B)}catch{}t||(E=window.setTimeout(m,1500))}};m()},je=async m=>{if(!m){H(null);return}try{let T=await z.testRun(m);if(t)return;H(T.run||null)}catch{t||I("\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF0C\u4F46\u7121\u6CD5\u8F09\u5165\u6E2C\u8A66 Flow\u3002","warn")}},oe=async()=>{if(r)try{let m=await z.testRunCurrent();if(t)return;m.run?.status==="running"&&(H(m.run),we())}catch{}},_e=0,O=(m,T)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">DB ORIGINAL JUDGMENT</div>
      <h2>${n(m)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-parquet-judgment" aria-label="\u95DC\u9589">${y("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${T}</div>`,me=m=>{let T=(Array.isArray(m.matched_laws)?m.matched_laws:[]).map(ee=>`<span class="chip">${n(ee)}</span>`).join(""),B=[m.court,m.jdate,m.title?`\u6848\u7531\uFF1A${m.title}`:"",m.full_text_length?`${u(m.full_text_length)} \u5B57`:"",m.citation_count?`\u5F15\u7528 ${u(m.citation_count)} \u7B46`:""].filter(Boolean).map(ee=>`<span>${n(ee)}</span>`).join(""),Z=m.parquet_generated_at?`DB \u5132\u5B58\u539F\u6587\uFF08\u539F\u59CB Parquet\uFF09\xB7 ${n(String(m.parquet_generated_at).replace("T"," ").slice(0,19))}`:"DB \u5132\u5B58\u539F\u6587",re=m.pdf_url?`<a class="btn btn-secondary btn-sm" href="${n(m.pdf_url)}" target="_blank" rel="noopener noreferrer">${y("external",13)}<span>\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF</span></a>`:"";return O(m.jid||"\u5224\u6C7A\u5168\u6587",`<div class="judgment-dialog-meta">
        <span class="badge badge-info">${n(m.source==="parquet"?"DB \u5132\u5B58\u539F\u6587":"PostgreSQL")}</span>
        ${B}
      </div>
      ${T?`<div class="chips" style="margin:8px 0 10px">${T}</div>`:""}
      <div class="judgment-dialog-source">${Z}</div>
      <pre class="judgment-dialog-text">${n(m.full_text||"\u6B64\u5224\u6C7A\u6C92\u6709\u5168\u6587\u3002")}</pre>
      <div class="judgment-dialog-actions">
        ${re}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-parquet-judgment">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},We=async m=>{if(!P||!m)return;let T=++_e;P.open||P.showModal(),L(),P.innerHTML=O("\u8B80\u53D6\u5224\u6C7A\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E DB \u5132\u5B58\u539F\u6587\u8B80\u53D6 ${n(m)}\u2026</span>
      </div>`);try{let B=await z.judgmentDetail(m,"parquet");if(t||T!==_e)return;P.innerHTML=me(B)}catch(B){if(t||T!==_e)return;P.innerHTML=O("\u7121\u6CD5\u8B80\u53D6 DB \u539F\u6587\u5224\u6C7A",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${n(B.message||"\u627E\u4E0D\u5230\u5224\u6C7A\u5168\u6587\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u5DF2\u57F7\u884C <span class="mono">uv run judgment-import-judgments --raw-only</span>\uFF0C\u4E14\u539F\u59CB Parquet \u5B58\u5728\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-parquet-judgment">\u95DC\u9589</button>
        </div>`)}},Te=0,st=(m,T)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">LOCAL PARQUET LAW</div>
      <h2>${n(m)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-law-source" aria-label="\u95DC\u9589">${y("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${T}</div>`,ut=(m,T="")=>{let B=String(m.selected_article_no||T||"").trim(),Z=!!B,ee=(Array.isArray(m.articles)?m.articles:[]).map(Ae=>{let nt=String(Ae.article_content||"").trim();return nt?Ae.article_type==="C"?`<div class="law-chapter">${n(nt)}</div>`:`<article class="law-article">
          <div class="law-article-head">
            <span class="law-article-no">${n(Ae.article_no||"\u689D\u6587")}</span>
          </div>
          <div class="law-article-text">${n(nt)}</div>
        </article>`:""}).join(""),le=(Array.isArray(m.warnings)?m.warnings:[]).map(Ae=>n(Ae)).join("<br />"),te=m.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F",U=m.meta?.articles_source,ue=U==="parquet"?"Parquet \u689D\u6587":U==="postgresql"?"PostgreSQL \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",ke=m.meta?.snapshot||"",be=[m.law_level,m.law_category,m.article_count?`${u(m.article_count)} \u689D`:"",m.law_modified_date?`\u7570\u52D5 ${Le(m.law_modified_date)}`:""].filter(Boolean).map(Ae=>`<span>${n(Ae)}</span>`).join(""),Ne=m.law_url?`<a class="btn btn-secondary btn-sm" href="${n(m.law_url)}" target="_blank" rel="noopener noreferrer">${y("external",13)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:"",$e=!Z&&m.law_histories?`<details class="law-dialog-history">
          <summary>\u6CD5\u898F\u6CBF\u9769</summary>
          <div>${n(m.law_histories)}</div>
        </details>`:"",mt=Z?`<span class="badge badge-mono">${n(B)}</span>`:"",vt=Z?`${m.law_name||m.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4"} \xB7 ${B}`:m.law_name||m.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4";return st(vt,`<div class="judgment-dialog-meta">
        <span class="badge ${m.source_type==="order"?"badge-warn":"badge-info"}">${n(te)}</span>
        ${mt}
        ${be}
      </div>
      <div class="judgment-dialog-source">${n([ue,ke].filter(Boolean).join(" \xB7 "))}</div>
      ${le?`<div class="law-dialog-warning">${le}</div>`:""}
      ${$e}
      <div class="law-dialog-articles">${ee||`<div class="report-empty-inline">${Z?"\u9019\u689D\u689D\u6587\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u5167\u5BB9\u3002":"\u9019\u500B\u6CD5\u898F\uFF0F\u547D\u4EE4\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u3002"}</div>`}</div>
      <div class="judgment-dialog-actions">
        ${Ne}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-law-source">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},at=async(m,T="",B="")=>{if(!k||!m)return;let Z=++Te;k.open||k.showModal(),L(),k.innerHTML=st(B?"\u8B80\u53D6\u6CD5\u898F\u689D\u6587\u4E2D\u2026":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E\u672C\u5730 Parquet \u8B80\u53D6 ${n([m,B].filter(Boolean).join(" \xB7 "))} \u7684\u539F\u59CB\u689D\u6587\u2026</span>
      </div>`);try{let re=await z.lawDetail(m,T,"",B);if(t||Z!==Te)return;k.innerHTML=ut(re,B)}catch(re){if(t||Z!==Te)return;k.innerHTML=st("\u7121\u6CD5\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u6587",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${n(re.message||"\u627E\u4E0D\u5230\u689D\u6587\u5167\u5BB9\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u672C\u5730\u539F\u59CB\u6CD5\u898F Parquet \u5B58\u5728\uFF0C\u4E14 PostgreSQL metadata \u8207\u5176\u4E00\u81F4\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-law-source">\u95DC\u9589</button>
        </div>`)}};k?.addEventListener("click",m=>{if(m.target.closest('[data-action="close-law-source"]')){k.close();return}let T=k.getBoundingClientRect();(m.clientX<T.left||m.clientX>T.right||m.clientY<T.top||m.clientY>T.bottom)&&k.close()}),P?.addEventListener("click",m=>{if(m.target.closest('[data-action="close-parquet-judgment"]')){P.close();return}let T=P.getBoundingClientRect();(m.clientX<T.left||m.clientX>T.right||m.clientY<T.top||m.clientY>T.bottom)&&P.close()}),b.addEventListener("click",m=>{let T=m.target.closest(".rag-process-toggle");if(T){let Z=T.closest(".rag-process"),re=T.getAttribute("aria-expanded")==="true";us(Z,!re);return}let B=m.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(B){if(B.dataset.action==="open-law-source"){at(B.dataset.lawKey||"",B.dataset.sourceType||"",B.dataset.articleNo||"");return}We(B.dataset.jid||"")}}),b.addEventListener("keydown",m=>{if(m.key!=="Enter"&&m.key!==" ")return;let T=m.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(!(!T||T.closest("a, button"))){if(m.preventDefault(),T.dataset.action==="open-law-source"){at(T.dataset.lawKey||"",T.dataset.sourceType||"",T.dataset.articleNo||"");return}We(T.dataset.jid||"")}});let pt=async m=>{let T=m.trim();if(!T){I("\u8ACB\u5148\u8F38\u5165\u554F\u984C\u3002","warn"),l.focus();return}a=T,l.value=T,R(),b.innerHTML=On(T,r);let B=r?null:Dn(b);r?(H(null),we()):(Y(),H(null)),J(g,!0,"\u6AA2\u7D22\u4E2D\u2026");let Z=null,re="",ee=U=>{if(t||!U?.partial)return;let ue=b.querySelector(".answer-body");if(!ue)return;Z=U,re=String(U.answer||""),ue.innerHTML=sa(U),B?.collapse?.();let ke=b.querySelector(".answer-head-title");ke&&(ke.textContent=U.streaming?"LLM \u56DE\u7B54\u751F\u6210\u4E2D":"\u6CD5\u898F\u7D50\u679C\u5DF2\u986F\u793A")},le=U=>{if(t||!U||!Z?.streaming)return;re+=U;let ue=b.querySelector("[data-partial-answer]");ue&&(ue.textContent=re)},te=()=>{if(t||!Z?.streaming)return;re="";let U=b.querySelector("[data-partial-answer]");U&&(U.textContent="\u6B63\u5728\u91CD\u65B0\u751F\u6210\u56DE\u7B54\u2026")};try{let U=r?await z.rag(T,{testMode:r}):await z.ragStream(T,{onStep:$e=>B?.step($e),onPartial:ee,onToken:le,onTokenReset:te});if(t)return;Y();let ue=B?.finish(!0)||"";b.innerHTML=zn(T,U,ue),U.test_run?.run_id?await je(U.test_run.run_id):H(null);let ke=Array.isArray(U.citations)?U.citations:[],be=Array.isArray(U.judgments)?U.judgments:[],Ne=ke.length+be.length;await yt({kind:"rag",title:T,detail:`${U.status||"preview"} \xB7 ${Ne} \u7B46\u4F86\u6E90`,payload:{question:T,status:U.status,citations:ke.map($e=>$e.law_name),judgments:be.map($e=>$e.jid)}}),await V()}catch(U){if(Y(),t)return;let ue=B?.finish(!1)||"";b.innerHTML=Qn(U,ue),I(U.message||"\u6AA2\u7D22\u5931\u6557\u3002","danger")}finally{Y(),t||J(g,!1)}};return o.addEventListener("submit",m=>{m.preventDefault(),pt(l.value)}),l.addEventListener("input",R),l.addEventListener("keydown",m=>{m.key==="Enter"&&!m.shiftKey&&!m.isComposing&&(m.preventDefault(),o.requestSubmit())}),e.querySelector("#example-chips").addEventListener("click",m=>{let T=m.target.closest("[data-question]");T&&(l.value=T.dataset.question,R(),o.requestSubmit())}),h.addEventListener("click",m=>{let T=m.target.closest("[data-history-index]");if(!T)return;let B=s[Number(T.dataset.historyIndex)];B&&(l.value=B.title,R(),pt(B.title))}),v.addEventListener("click",async()=>{if(!s.length){I("\u76EE\u524D\u6C92\u6709\u53EF\u6E05\u9664\u7684\u63D0\u554F\u7D00\u9304\u3002","info");return}window.confirm("\u78BA\u5B9A\u6E05\u9664\u9019\u500B\u700F\u89BD\u5668\u7684\u6240\u6709\u63D0\u554F\u7D00\u9304\uFF1F")&&(await qs(),await V(),I("\u5DF2\u6E05\u9664\u672C\u6A5F\u63D0\u554F\u7D00\u9304\u3002","ok"))}),R(),await Promise.allSettled([F(),V(),j()]),await oe(),()=>{t=!0,Y(),document.documentElement.classList.remove("dialog-open"),window.removeEventListener("judgment:test-mode",C),a&&b.setAttribute("data-last-question",a)}}var ms={};Ke(ms,{render:()=>br});var Vn=2e3,Wn={running:{label:"\u57F7\u884C\u4E2D",tone:"info"},success:{label:"\u5B8C\u6210",tone:"ok"},failed:{label:"\u5931\u6557",tone:"danger"},interrupted:{label:"\u5DF2\u4E2D\u6B62",tone:"warn"},stale:{label:"\u72C0\u614B\u5931\u6548",tone:"warn"},skipped:{label:"\u7565\u904E",tone:"idle"},pending:{label:"\u7B49\u5F85",tone:"idle"},idle:{label:"\u5F85\u547D",tone:"idle"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},operational:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},unavailable:{label:"\u7121\u6CD5\u53D6\u5F97",tone:"danger"},missing:{label:"\u5C1A\u7121\u7D00\u9304",tone:"idle"},error:{label:"\u8B80\u53D6\u5931\u6557",tone:"danger"},ok:{label:"\u6B63\u5E38",tone:"ok"}},aa={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},na={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},oa={judgment:"\u5224\u6C7A",law:"\u6CD5\u898F",order:"\u547D\u4EE4",system:"\u7CFB\u7D71"},qt={judgment:"#a78bfa",law:"#22d3ee",order:"#f472b6",system:"#94a3b8"},Kn={extract:"file",raw_parquet:"cube",filter:"filter",postgres:"database",qdrant:"brain",download:"download",parse:"sliders"},Yn={raw_parquet:"\u539F\u59CB Parquet",postgres:"PostgreSQL"};function dt(e){return Wn[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function ye(e,t){let s=dt(e);return`<span class="badge ${aa[s.tone]||aa.idle}"><span class="status-dot ${na[s.tone]||na.idle}"></span>${n(t||s.label)}</span>`}function Ge(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function ra(e){return e==null?"\u7121\u6CD5\u53D6\u5F97":u(e)}function et(e){return e&&e.color?String(e.color):"var(--accent)"}function Et(e,t=""){let s=e.percent===null||e.percent===void 0?null:Math.max(0,Math.min(100,Number(e.percent)||0)),a=e.status==="running"&&s===null,r=a?' aria-valuetext="\u9032\u5EA6\u672A\u77E5"':` aria-valuenow="${s??0}"`;return`<div class="processing-bar${a?" is-indeterminate":""}${t?` ${t}`:""}" role="progressbar" aria-valuemin="0" aria-valuemax="100"${r}>
    <span class="processing-bar-fill" style="width:${s??0}%;background:${n(et(e))}"></span>
  </div>`}function Xn(e){let t=e.unit==="bytes"?"":e.unit||"\u7B46",s=e.current,a=e.total;return s==null?e.status==="running"?"\u9032\u884C\u4E2D":"\u2014":e.unit==="bytes"?a?`${ve(s)} / ${ve(a)}`:ve(s):a?`${u(s)} / ${u(a)} ${t}`:`${u(s)} ${t}`}function Zn(e){let t=[`<span>${n(Xn(e))}</span>`];return e.percent===null||e.percent===void 0?e.status==="running"&&t.push('<span class="mono">\u9032\u5EA6\u672A\u77E5</span>'):t.push(`<span class="mono">${Ge(e.percent)}</span>`),e.duration_ms&&t.push(`<span class="mono">${D(e.duration_ms)}</span>`),t.join("")}function er(e){let s=(Array.isArray(e.stats)?e.stats:[]).map(r=>`<span class="processing-stage-stat"><span>${n(r.label)}</span><strong>${n(r.value)}</strong></span>`),a=e.coverage;return a&&a.indexed!==null&&a.indexed!==void 0&&a.total!==null&&a.total!==void 0&&s.push(`<span class="processing-stage-stat"><span>\u7D22\u5F15\u8986\u84CB</span><strong>${u(a.indexed)} / ${u(a.total)}</strong></span>`),s.length?`<div class="processing-stage-stats">${s.join("")}</div>`:""}function tr(e,{compact:t=!1,step:s=null}={}){let a=dt(e.status),r=e.status==="running";return`<div class="processing-stage${t?" is-compact":""} is-${a.tone}${r?" is-live":""}" style="--stage-color:${n(et(e))}"${r?' aria-current="step"':""}>
    <div class="processing-stage-head">
      ${s===null?"":`<span class="processing-stage-step">${String(s).padStart(2,"0")}</span>`}
      <span class="processing-stage-swatch" style="background:${n(et(e))}"></span>
      <span class="processing-stage-label">${n(e.label||e.key)}</span>
      ${ye(e.status)}
    </div>
    ${Et(e)}
    <div class="processing-stage-meta">${Zn(e)}</div>
    ${e.message?`<div class="processing-stage-message" title="${n(e.message)}">${n(e.message)}</div>`:""}
    ${t?"":er(e)}
  </div>`}function la(e){let t=dt(e);return`<span class="flow-status is-${t.tone}"><span class="flow-status-dot"></span>${n(t.label)}</span>`}function ia(e,t){return t==null||t===""?"\u2014":e.unit==="bytes"?ve(t):u(t)}function sr(e){let t=[{label:"\u76EE\u524D",value:ia(e,e.current)},{label:"\u7E3D\u91CF",value:ia(e,e.total)},{label:"\u767E\u5206\u6BD4",value:e.percent===null||e.percent===void 0?e.status==="running"?"\u8A08\u7B97\u4E2D":"\u2014":Ge(e.percent)},{label:"\u8017\u6642",value:e.duration_ms?D(e.duration_ms):"\u2014"}],s=Array.isArray(e.stats)?e.stats:[];for(let r of s){if(t.length>=6)break;r&&r.label&&r.value&&t.push({label:String(r.label),value:String(r.value)})}let a=e.coverage;return a&&a.indexed!==null&&a.indexed!==void 0&&a.total!==null&&a.total!==void 0&&!t.some(r=>r.label==="\u7D22\u5F15\u8986\u84CB")&&t.push({label:"\u7D22\u5F15\u8986\u84CB",value:`${u(a.indexed)} / ${u(a.total)}`}),t}function ar(e,t){let s=dt(e.status),a=e.status==="running",r=sr(e);return`<article class="flow-node is-${s.tone}${a?" is-live":""}" style="--stage-color:${n(et(e))}"${a?' aria-current="step"':""}>
    <div class="flow-node-head">
      <span class="flow-node-icon">${y(Kn[e.key]||"cube",14)}</span>
      <div class="flow-node-heading">
        <span class="flow-node-kicker">STEP ${String(t+1).padStart(2,"0")}</span>
        <strong>${n(Yn[e.key]||e.label||e.key)}</strong>
      </div>
      ${la(e.status)}
    </div>
    <div class="flow-node-body">
      ${Et(e,"flow-progress")}
      <div class="flow-node-props">${r.map(i=>`<div class="flow-prop"><span>${n(i.label)}</span><strong>${n(i.value)}</strong></div>`).join("")}</div>
      ${e.message?`<div class="flow-node-note" title="${n(e.message)}">${n(e.message)}</div>`:""}
    </div>
  </article>`}function nr(e,t,s,a){let r=et(e),i=a||"#8b5cf6",o=e.status==="running",l=`${s}-${t}`,g=`flow-gradient-${l}`,b=`flow-marker-${l}`,$=t%2===0?"M2 60 C8 42 16 78 22 60":"M2 60 C8 78 16 42 22 60";return`<div class="flow-link${o?" is-live":""}" style="color:${n(r)}" aria-hidden="true">
    <svg viewBox="0 0 28 120" width="28" height="120" fill="none">
      <defs>
        <linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="${n(i)}"/>
          <stop offset="1" stop-color="${n(r)}"/>
        </linearGradient>
        <marker id="${b}" viewBox="0 0 8 8" refX="6.2" refY="4" markerWidth="4.6" markerHeight="4.6" orient="auto">
          <path d="M0 0 8 4 0 8Z" fill="${n(r)}"/>
        </marker>
      </defs>
      <path class="flow-link-line" d="${$}" stroke="url(#${g})" stroke-width="1.7" stroke-linecap="round" marker-end="url(#${b})"/>
      <circle class="flow-link-port" cx="2" cy="60" r="3.6" stroke="${n(i)}" stroke-width="1.5"/>
      <circle class="flow-link-port" cx="26" cy="60" r="3.6" stroke="${n(r)}" stroke-width="1.5"/>
    </svg>
  </div>`}function ca(e){if(!e)return"";let t=[];return e.started_at&&t.push(`\u958B\u59CB ${se(e.started_at)}`),e.duration_ms&&t.push(`\u8017\u6642 ${D(e.duration_ms)}`),e.pid&&t.push(`PID ${e.pid}`),t.join(" \xB7 ")}function rr(e,{active:t,focus:s,status:a,runLine:r,runningStage:i}){let o=e.label||oa[e.key]||e.key;return`<div class="flow-source${t?" is-live":""}" style="--branch-accent:${qt[e.key]||qt.system}">
    <div class="flow-source-head">
      <span class="flow-source-icon">${y(e.icon||"database",15)}</span>
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
  </div>`}function ir(e){let t=e.active_run,s=t||e.focus_run||e.last_run,a=t?"running":s?s.status:"idle",r=s?n(ca(s)||Xe(s.started_at||s.finished_at)):"\u5C1A\u7121\u57F7\u884C\u7D00\u9304",i=Array.isArray(e.stages)?e.stages:[],o=i.find(f=>f.status==="running"),l=qt[e.key]||qt.system,g=String(e.key||"branch").replace(/[^a-zA-Z0-9_-]/g,""),b=rr(e,{active:t,focus:s,status:a,runLine:r,runningStage:o}),$=i.length?i.map((f,h)=>{let _=h?et(i[h-1]):l;return`${nr(f,h,g,_)}${ar(f,h)}`}).join(""):'<div class="flow-empty">\u6C92\u6709\u53EF\u986F\u793A\u7684\u968E\u6BB5\u3002</div>';return`<article class="flow-lane" style="--branch-accent:${l}"><div class="flow-row">${b}${$}</div></article>`}function or(e){return`<div class="flow-canvas-open">
    <div class="processing-branches">${(Array.isArray(e.branches)?e.branches:[]).map(ir).join("")}</div>
  </div>`}function Qe(e,t,s="",a=""){return`<div class="processing-summary-card">
    <span class="processing-summary-label">${n(e)}</span>
    <span class="processing-summary-value">${t}</span>
    ${s?`<span class="processing-summary-hint">${s}</span>`:""}
    ${a}
  </div>`}function lr(e){let t=e.database||{},s=e.index||{},a=e.local_archives||{},r=e.raw_backups||{},i=r.totals||{},o=e.state||{},l=e.capabilities||{},g=e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D",b=t.status==="operational",$=s.status==="operational",f=a.available!==!1,h=r.available!==!1,_=$?`${u(s.indexed)} / ${u(s.total)}`:ye(s.status||"unavailable"),v=$?`${Ge(s.percent)} \xB7 \u5C1A\u9918 ${u(s.remaining)} \u7B46`:n(s.error||"\u7121\u6CD5\u67E5\u8A62 Qdrant \u7D22\u5F15\u8986\u84CB\u7387\u3002"),x=f?`${u(a.unprocessed)} / ${u(a.total)}`:ye("unavailable"),N=f?`\u672A\u8655\u7406 / \u5168\u90E8 \xB7 ${ve(a.unprocessed_bytes)} \u5F85\u8655\u7406`:n(a.error||"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304\u3002");return`<div class="processing-summary">
    ${Qe("\u8655\u7406\u72C0\u614B",ye(e.status||"unknown"),`${n(g)} \xB7 \u66F4\u65B0\u65BC <span data-processing-updated-at>\u2014</span>`)}
    ${Qe("\u672A\u8655\u7406\u58D3\u7E2E\u6A94",n(x),N)}
    ${Qe("\u539F\u59CB Parquet \u5099\u4EFD",h?`${u(r.count)} \u6A94`:ye("unavailable"),h?`\u5171 ${u(i.row_count)} \u7B46 \xB7 ${ve(i.compressed_bytes)}`:n(r.error||"\u7121\u6CD5\u6383\u63CF\u539F\u59CB Parquet \u5099\u4EFD\u3002"))}
    ${Qe("PostgreSQL \u5224\u6C7A",b?u(t.judgment_count):ye("unavailable"),b?`\u6CD5\u898F ${ra(t.law_count)} \xB7 \u547D\u4EE4 ${ra(t.order_count)}`:n(t.error||"\u7121\u6CD5\u67E5\u8A62 PostgreSQL\u3002"))}
    ${Qe("Qdrant \u7D22\u5F15",_,v)}
    ${Qe("\u72C0\u614B\u6A94",ye(o.status||"missing"),o.updated_at?`\u66F4\u65B0\u65BC ${n(se(o.updated_at))}`:n(o.detail||"\u5C1A\u7121\u8655\u7406\u72C0\u614B\u7D00\u9304\u3002"))}
    ${Qe("\u5F85\u8655\u7406\u5DE5\u4F5C",l.can_start_update===!1?"\u66AB\u505C\u555F\u52D5":"\u53EF\u958B\u59CB\u66F4\u65B0",l.start_blocked_reason?n(l.start_blocked_reason):`\u672A\u8655\u7406 ${u(l.unprocessed_archives)} \u500B \xB7 \u7D22\u5F15\u5F85\u88DC ${u(l.index_backlog)} \u7B46${l.external_processes?` \xB7 \u5916\u90E8\u7A0B\u5E8F ${u(l.external_processes)} \u500B`:""}`)}
  </div>`}function cr(e){if(e.available===!1)return G({tone:"warn",title:"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304",text:n(e.error||"\u7121\u6CD5\u6383\u63CF .rar \u6A94\u6848\u3002")});let t=Number(e.total)||0,s=Number(e.processed)||0,a=Number(e.unprocessed)||0,r=t?100*s/t:null;return`<div class="processing-archive-summary">
    <div class="processing-archive-summary-head">
      <span class="mono">${n(e.data_dir||"")}</span>
      <span>${u(s)} / ${u(t)} \u5DF2\u8655\u7406 \xB7 ${u(a)} \u5F85\u8655\u7406 \xB7 ${ve(e.unprocessed_bytes)} \u5F85\u8655\u7406</span>
    </div>
    ${Et({percent:r,status:a?"pending":"success",color:"var(--success)"},"processing-bar-lg")}
    <div class="processing-archive-summary-meta">
      <span>\u58D3\u7E2E\u6A94\u532F\u5165\u8986\u84CB ${Ge(r)}</span>
      <span>\u5168\u90E8 ${ve(e.total_bytes)}</span>
    </div>
  </div>`}function dr(e){let t=e.stages||{},a=["extract","filter","postgres"].map(r=>t[r]).filter(Boolean).map(r=>tr(r,{compact:!0}));return a.length?`<div class="processing-archive-stages">${a.join("")}</div>`:""}function ur(e){let t=e.status||"pending",s=t==="running",a=e.percent===null||e.percent===void 0?null:Math.max(0,Math.min(100,Number(e.percent)||0)),r=s&&a===null,i=[];return e.message&&i.push(e.message),e.error&&i.push(e.error),(e.scanned||e.matched||e.stored)&&i.push(`\u6383\u63CF ${u(e.scanned)} \xB7 \u547D\u4E2D ${u(e.matched)} \xB7 \u5BEB\u5165 ${u(e.stored)}`),`<div class="processing-archive is-${dt(t).tone}">
    <div class="processing-archive-head">
      <span class="processing-archive-name mono">${n(e.name)}</span>
      <div class="processing-archive-bar-wrap">
        ${Et({percent:a,status:t,color:s?"var(--accent)":"var(--success)"})}
      </div>
      <span class="processing-archive-percent mono">${r?"\u9032\u884C\u4E2D":Ge(a)}</span>
      ${ye(t)}
      <span class="processing-archive-size faint">${ve(e.size_bytes)}</span>
    </div>
    ${dr(e)}
    ${i.length?`<div class="processing-archive-note">${i.map(o=>`<span>${n(o)}</span>`).join("")}</div>`:""}
  </div>`}function pr(e){let t=e.archives||{},s=e.local_archives||{},a=Array.isArray(t.items)?t.items:[],r=t.run,i=`<div class="report-section-head">
    <div>
      <div class="report-kicker">ARCHIVE PIPELINE</div>
      <h2 class="report-section-title">\u5224\u6C7A\u58D3\u7E2E\u6A94</h2>
      <p class="processing-section-sub">\u6BCF\u500B\u58D3\u7E2E\u6A94\u540D\u7A31\u5F8C\u65B9\u5373\u6642\u986F\u793A\u8655\u7406\u9032\u5EA6\uFF1B\u672A\u53D6\u5F97\u53EF\u8A08\u7B97\u7684\u7E3D\u91CF\u6642\u6A19\u793A\u300C\u9032\u5EA6\u672A\u77E5\u300D\uFF0C\u4E0D\u4EE5\u63A8\u6E2C\u6578\u503C\u4EE3\u66FF\u3002</p>
    </div>
  </div>`,o=t.source==="run"?`${ye(r?r.status:"idle")} <span>\u76EE\u524D\u986F\u793A ${r?n(r.title||"\u5224\u6C7A\u532F\u5165"):"\u6700\u8FD1\u4E00\u6B21\u532F\u5165"} \u7684\u9010\u6A94\u9032\u5EA6${r&&r.started_at?` \xB7 ${n(ca(r))}`:""}</span>`:t.external?`${ye("running")} <span>${n(t.note||"\u5916\u90E8\u532F\u5165\u7A0B\u5E8F\u672A\u5BEB\u5165\u9010\u6A94\u72C0\u614B\uFF1B\u4EE5\u4E0B\u70BA PostgreSQL \u8986\u84CB\u7387\u3002")}</span>`:'<span class="faint">\u76EE\u524D\u6C92\u6709\u53EF\u8B80\u53D6\u7684\u532F\u5165 run \u72C0\u614B\uFF1B\u4EE5\u4E0B\u4EE5 PostgreSQL \u7684 source_archive \u5224\u5B9A\u662F\u5426\u5DF2\u8655\u7406\u3002</span>';return`<section class="report-card processing-card">
    <div class="report-head">${i}</div>
    <div class="report-section">
      ${cr(s)}
      <div class="processing-archive-run">${o}</div>
      ${a.length?`<div class="processing-archive-list">${a.map(ur).join("")}</div>`:`<div class="processing-empty">\u627E\u4E0D\u5230 .rar \u58D3\u7E2E\u6A94\uFF1B\u8ACB\u78BA\u8A8D ${n(s.data_dir||"\u5224\u6C7A\u8CC7\u6599\u76EE\u9304")}\u3002</div>`}
    </div>
  </section>`}function mr(e){let t=e.timeline||{},s=Array.isArray(t.stages)?t.stages:[],a=`<div class="report-section-head">
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
    </section>`;let r=s.map(o=>`<span class="processing-stack-segment" style="width:${Math.max(0,Number(o.percent)||0)}%;background:${n(o.color||"var(--accent)")}" title="${n(`${o.label} ${D(o.duration_ms)} (${Ge(o.percent)})`)}"></span>`).join(""),i=s.map(o=>`<div class="processing-legend-item">
        <span class="processing-legend-swatch" style="background:${n(o.color||"var(--accent)")}"></span>
        <span class="processing-legend-label">${n(o.label)}</span>
        <span class="mono">${D(o.duration_ms)}</span>
        <span class="processing-legend-percent mono">${Ge(o.percent)}</span>
        ${ye(o.status)}
      </div>`).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section">
      <div class="processing-timeline-label">
        <span>${n(t.label||"\u968E\u6BB5\u8017\u6642")}</span>
        <span class="mono">\u7E3D\u8A08 ${D(t.total_ms)}</span>
      </div>
      <div class="processing-stack" role="img" aria-label="\u968E\u6BB5\u8017\u6642\u6BD4\u4F8B">${r}</div>
      <div class="processing-legend">${i}</div>
    </div>
  </section>`}function vr(e){let t=Array.isArray(e.recent_runs)?e.recent_runs:[],s=new Map((e.branches||[]).map(i=>[i.key,i.label])),a=`<div class="report-section-head">
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
          ${ye(i.status)}
          <span class="grow"></span>
          <span class="mono faint">${n(se(i.finished_at||i.started_at))}</span>
          <span class="mono">${i.duration_ms?D(i.duration_ms):"\u2014"}</span>
        </div>
        ${i.message?`<div class="processing-run-message">${n(i.message)}</div>`:""}
      </div>`}).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section"><div class="processing-run-list">${r}</div></div>
  </section>`}function gr(e){let t=Array.isArray(e.notices)?e.notices:[];return t.length?`<div class="processing-notices">${t.map(s=>G({tone:s.tone||"info",title:s.title,text:n(s.message||"")})).join("")}</div>`:""}function fr(e){return`${gr(e)}
    ${lr(e)}
    <section class="processing-flow-section">
      <div class="processing-section-head">
        <div>
          <div class="report-kicker">PIPELINE CANVAS</div>
          <h2 class="report-section-title">\u8655\u7406\u6D41\u7A0B</h2>
          <p class="processing-section-sub">\u5224\u6C7A\u3001\u6CD5\u898F\u3001\u547D\u4EE4\u4E09\u689D\u6D41\u7A0B\u5373\u6642\u53CD\u6620\u76EE\u524D\u57F7\u884C\u968E\u6BB5\uFF1B\u66F2\u7DDA\u7531\u4F86\u6E90\u7BC0\u9EDE\u9023\u5230\u5404\u968E\u6BB5\uFF0C\u767C\u5149\u7BC0\u9EDE\u8207\u6D41\u52D5\u66F2\u7DDA\u8868\u793A\u76EE\u524D\u57F7\u884C\u4F4D\u7F6E\u3002</p>
        </div>
      </div>
      ${or(e)}
    </section>
    ${pr(e)}
    ${mr(e)}
    ${vr(e)}`}function hr(e,t){return`<div class="report-card processing-card">
    <div class="report-section">
      ${G({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B",text:n(e||"\u672A\u77E5\u932F\u8AA4")})}
      ${t?`<p class="processing-section-sub">\u4E0A\u6B21\u6210\u529F\u66F4\u65B0\uFF1A${n(se(t.generated_at))}\u3002\u756B\u9762\u4E0A\u6C92\u6709\u986F\u793A\u66FF\u4EE3\u6216\u63A8\u6E2C\u7684\u9032\u5EA6\u3002</p>`:""}
      <div class="processing-error-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh">
          ${y("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
  </div>`}async function br(e){e.innerHTML=`<section class="page processing-page">
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
          ${y("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
        <button class="btn btn-secondary btn-sm processing-stop" type="button" data-processing-action="stop" id="processing-stop" hidden>
          ${y("x",14)}<span>\u505C\u6B62\u66F4\u65B0</span>
        </button>
        <button class="btn btn-primary btn-sm" type="button" data-processing-action="update" id="processing-update">
          ${y("download",14)}<span data-update-label>\u8CC7\u6599\u66F4\u65B0</span>
        </button>
      </div>
    </div>
    <div id="processing-root">
      <div class="processing-loading" role="status">
        <span class="spinner" aria-hidden="true"></span>
        <span>\u6B63\u5728\u8B80\u53D6\u8655\u7406\u72C0\u614B\u2026</span>
      </div>
    </div>
  </section>`;let t=e.querySelector(".processing-page"),s=e.querySelector("#processing-root"),a=e.querySelector("#processing-update"),r=e.querySelector("#processing-stop"),i=e.querySelector("#processing-refresh"),o=e.querySelector("#processing-index-toggle"),l=!1,g=!1,b=!1,$=null,f="",h=null,_=L=>{let E=L.capabilities||{},M=!!(o&&o.checked),R=M?E.can_start_update_with_index!==!1:E.can_start_update!==!1,V=M&&E.index_blocked_reason||E.start_blocked_reason;if(!b){a.disabled=!R,a.title=V||"\u6AA2\u67E5\u7DDA\u4E0A\u6CD5\u898F\uFF0F\u547D\u4EE4\uFF0C\u4E26\u8655\u7406\u672A\u532F\u5165\u7684\u5224\u6C7A\u58D3\u7E2E\u6A94\u3002";let F=a.querySelector("[data-update-label]");F&&(F.textContent=R?"\u8CC7\u6599\u66F4\u65B0":E.active_update_id?"\u66F4\u65B0\u57F7\u884C\u4E2D":"\u8655\u7406\u7A0B\u5E8F\u57F7\u884C\u4E2D"),r.hidden=!E.can_stop_update,o&&(o.disabled=E.can_start_update===!1)}},v=async({silent:L=!1}={})=>{if(!(l||g)){g=!0,L||J(i,!0,"\u66F4\u65B0\u4E2D\u2026");try{let E=await z.processing();if(l)return;$=E;let M=fr(E);M!==f&&(s.innerHTML=M,f=M);let R=s.querySelector("[data-processing-updated-at]");if(R){let V=se(E.generated_at);R.textContent!==V&&(R.textContent=V)}_(E)}catch(E){if(l)return;let M=hr(E.message,$);M!==f&&(s.innerHTML=M,f=M),L||I(E.message||"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B\u3002","danger",6e3)}finally{g=!1,L||J(i,!1)}}},x=async L=>{if(!b){b=!0,J(L,!0,"\u555F\u52D5\u4E2D\u2026");try{let E=!!(o&&o.checked),M=await z.startProcessingUpdate(E);I(`\u5DF2\u555F\u52D5\u8CC7\u6599\u66F4\u65B0${E?"\uFF0C\u5B8C\u6210\u5F8C\u63A5\u7E8C Qdrant \u7D22\u5F15":""}\u3002`,"ok",6e3),M&&M.run_id&&console.info("processing update started",M),await v({silent:!0})}catch(E){I(E.message||"\u7121\u6CD5\u555F\u52D5\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{b=!1,J(L,!1),$&&_($)}}},N=async L=>{if(!b){b=!0,J(L,!0,"\u505C\u6B62\u4E2D\u2026");try{let E=await z.stopProcessingUpdate();I(E.message||"\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info",6e3),await v({silent:!0})}catch(E){I(E.message||"\u7121\u6CD5\u505C\u6B62\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{b=!1,J(L,!1),$&&_($)}}},P=L=>{let E=L.target.closest("[data-processing-action]");if(!E||E.disabled)return;let M=E.dataset.processingAction;M==="refresh"?v({silent:!1}):M==="update"?x(E):M==="stop"&&N(E)},k=L=>{L.target===o&&$&&_($)};return t.addEventListener("click",P),o&&o.addEventListener("change",k),await v({silent:!1}),h=window.setInterval(()=>{document.hidden||v({silent:!0})},Vn),()=>{l=!0,h!==null&&window.clearInterval(h),t.removeEventListener("click",P),o&&o.removeEventListener("change",k)}}var vs={};Ke(vs,{render:()=>Sr});function Nt(e){if(e==null||e==="")return"\u2014";let t=Number(e);return Number.isFinite(t)?`${t.toFixed(t>=10?1:2)}%`:"\u2014"}function da(e){return e==null?"\u2014":u(e)}function $r(e){return e.count?e.severity==="danger"?W("failed","\u9700\u8655\u7406"):e.severity==="warn"?W("warning","\u6CE8\u610F"):W("preview","\u63D0\u793A"):W("success","\u901A\u904E")}function yr(e){return e.count?e.severity==="danger"?"is-danger":e.severity==="warn"?"is-warn":"is-info":"is-ok"}function wr(e){let t=Number(e.count)||0,s=Math.max(0,Math.min(100,Number(e.percent)||0));return`<div class="quality-check ${yr(e)}">
    <div class="quality-check-head">
      <span class="quality-check-label">${n(e.label)}</span>
      ${$r(e)}
    </div>
    <div class="quality-check-value">
      <strong>${u(t)}</strong>
      <span>\u7B46</span>
      <em>${n(Nt(e.percent))}</em>
    </div>
    <div class="quality-check-desc">${n(e.description)}</div>
    <div class="quality-check-track" aria-hidden="true">
      <span style="width:${s}%"></span>
    </div>
  </div>`}function jt(e,t,s){let a=Array.isArray(s)?s:[];if(!a.length)return`<div class="index-chart-card">
      <div class="index-chart-head"><span>${n(e)}</span><span>${n(t)}</span></div>
      <div class="index-chart-empty">DuckDB \u6383\u63CF\u5F8C\u6C92\u6709\u53EF\u5448\u73FE\u7684\u8CC7\u6599\u3002</div>
    </div>`;let r=Math.max(...a.map(i=>Number(i.value)||0),1);return`<div class="index-chart-card">
    <div class="index-chart-head"><span>${n(e)}</span><span>${n(t)}</span></div>
    <div class="distribution">
      ${a.map(i=>{let o=Number(i.value)||0,l=Math.max(1.5,o/r*100);return`<div class="dist-row">
            <span class="dist-label" title="${n(i.label||"\u672A\u5206\u985E")}">${n(i.label||"\u672A\u5206\u985E")}</span>
            <span class="dist-track"><span class="dist-bar" style="width:${l.toFixed(2)}%"></span></span>
            <span class="dist-value">${u(o)}</span>
          </div>`}).join("")}
    </div>
  </div>`}function _r(e){let t=e.coverage||{},s=e.totals||{},a=e.source||{},r=t.postgres_diff,i=r==null?"\u2014":r===0?"\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u4E00\u81F4":`\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u76F8\u5DEE ${u(Math.abs(r))} \u7B46`,o=t.vector_indexed===null||t.vector_indexed===void 0?t.detail||"\u7121\u6CD5\u53D6\u5F97\u7D22\u5F15\u7D71\u8A08":`${u(t.vector_indexed)} / ${u(t.vector_total)} \xB7 ${t.model||"\u2014"}`;return`<div class="metric-grid quality-coverage-grid">
    <div class="metric-card">
      <div class="metric-label">${y("filter",13)}<span>\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D</span></div>
      <div class="metric-value">${u(s.matched_rows)}</div>
      <div class="metric-foot">citation_count &gt; 0\uFF1B\u5171 ${u(s.citation_total)} \u7B46\u5F15\u7528</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${y("database",13)}<span>PostgreSQL \u6536\u9304</span></div>
      <div class="metric-value">${da(t.postgres_judgments)}</div>
      <div class="metric-foot">${n(i)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${y("brain",13)}<span>\u5411\u91CF\u7D22\u5F15</span></div>
      <div class="metric-value">${n(Nt(t.vector_coverage_pct))}</div>
      <div class="metric-foot">${n(o)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${y("layers",13)}<span>DuckDB \u5019\u9078</span></div>
      <div class="metric-value">${da(a.candidate_total)}</div>
      <div class="metric-foot">${u(a.candidate_archive_count)} / ${u(a.archive_count)} \u500B manifest \u6709 candidate_count</div>
    </div>
  </div>`}function kr(e){return e.length?`<div class="table-wrap">
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
                <span class="mono">${n(t.archive||"\u2014")}</span>
                ${t.version?`<span class="chip">v${n(t.version)}</span>`:""}
              </td>
              <td class="cell-number">${u(t.rows)}</td>
              <td class="cell-number">${a}</td>
              <td class="cell-number">${u(t.matched_rows)}</td>
              <td class="cell-number">${n(Nt(t.match_rate))}</td>
              <td class="cell-number">${u(t.short_text_rows)}</td>
              <td class="cell-number">${u(s)}</td>
              <td class="cell-number">${u(t.duplicate_content_rows)}</td>
              <td class="cell-date">${n(Le(t.date_min))} \u2013 ${n(Le(t.date_max))}</td>
            </tr>`}).join("")}
      </tbody>
    </table>
  </div>`:ge({iconName:"table",title:"\u6C92\u6709\u539F\u59CB Parquet \u6A94\u6848",text:"\u5B8C\u6210\u5224\u6C7A RAR \u532F\u5165\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6BCF\u500B\u58D3\u7E2E\u6A94\u7684 DuckDB \u7D71\u8A08\u3002"})}function xr(e){let t=e.totals||{},s=e.source||{},a=Array.isArray(e.checks)?e.checks:[],r=e.summary||{},i=e.distributions||{},o=Array.isArray(e.warnings)?e.warnings:[],l=ve(s.compressed_bytes||0);return`<div class="report-card quality-report" data-database="quality">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">DUCKDB DATA QUALITY</div>
        <div class="report-title">
          \u539F\u59CB Parquet \u8CC7\u6599\u54C1\u8CEA ${W(e.status||"operational")}
          <span class="chip">raw.parquet</span>
        </div>
        <div class="report-sub">
          ${u(t.rows)} \u7B46 \xB7 ${u(s.raw_files)} \u500B\u6A94\u6848 \xB7
          ${l} \xB7 \u6383\u63CF ${D(e.scan_ms||0)} \xB7
          ${n(se(e.generated_at))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-quality">
          ${y("download",14)}<span>JSON</span>
        </button>
      </div>
    </div>
    ${o.length?`<div class="report-alert">${G({tone:"warn",title:"\u76EE\u524D\u9650\u5236\u8207\u5DEE\u7570",text:o.map(g=>n(g)).join("<br>")})}</div>`:""}
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
        <div class="summary-value">${n(Nt(t.match_rate))}</div>
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
          ${u(r.ok_count)} \u9805\u901A\u904E \xB7
          ${u(r.warning_count)} \u9805\u6CE8\u610F \xB7
          ${u(r.danger_count)} \u9805\u9700\u8655\u7406 \xB7
          ${u(r.info_count)} \u9805\u63D0\u793A
        </span>
      </div>
      <div class="quality-checks">${a.map(wr).join("")}</div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6536\u9304\u8986\u84CB</span>
        <span class="muted" style="font-size:9.5px">PostgreSQL \u8207\u5411\u91CF\u7D22\u5F15\u70BA\u5373\u6642\u67E5\u8A62\uFF0C\u4E0D\u662F\u5F9E Parquet \u63A8\u4F30</span>
      </div>
      ${_r(e)}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6A94\u6848\u660E\u7D30</span>
        <span class="muted" style="font-size:9.5px">${u(s.archive_count)} \u500B\u539F\u59CB Parquet</span>
      </div>
      ${kr(Array.isArray(e.archives)?e.archives:[])}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u5206\u5E03\u7D71\u8A08</span>
        <span class="muted" style="font-size:9.5px">DuckDB group by / unnest</span>
      </div>
      <div class="quality-dist-grid">
        ${jt("\u6CD5\u9662","\u5224\u6C7A\u7B46\u6578",i.courts)}
        ${jt("\u88C1\u5224\u5E74\u4EFD","\u5224\u6C7A\u7B46\u6578",i.years)}
        ${jt("\u71B1\u9580\u6CD5\u898F","\u63D0\u53CA\u5224\u6C7A\u6578",i.laws)}
        ${jt("\u71B1\u9580\u6848\u7531","\u5224\u6C7A\u7B46\u6578",i.titles)}
      </div>
    </div>
  </div>`}async function Sr(e){e.innerHTML=`<section class="page data-page quality-page">
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
          ${y("refresh",15)}<span>\u91CD\u65B0\u6383\u63CF</span>
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
  </section>`;let t=e.querySelector("#quality-content"),s=e.querySelector("#quality-refresh"),a=e.querySelector("#quality-meta"),r=null,i=()=>{r&&(t.innerHTML=xr(r),a.textContent=`DUCKDB \xB7 ${u(r.totals?.rows)} \u7B46 \xB7 ${D(r.scan_ms||0)}`)},o=async()=>{J(s,!0,"\u6383\u63CF\u4E2D\u2026");try{r=await z.quality(),i()}catch(l){t.innerHTML=`<div class="report-card">
        <div class="report-head">
          <div class="report-title-group">
            <div class="report-kicker">DUCKDB DATA QUALITY</div>
            <div class="report-title">\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557</div>
            <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
          </div>
        </div>
        <div class="report-section">
          ${G({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u54C1\u8CEA\u7D71\u8A08",text:n(l.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
        </div>
      </div>`,a.textContent="DUCKDB \xB7 \u8B80\u53D6\u5931\u6557",I("\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}finally{J(s,!1)}};s.addEventListener("click",o),t.addEventListener("click",l=>{!l.target.closest("[data-action='export-quality']")||!r||Be(`judgment-quality-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(r,null,2),"application/json;charset=utf-8")}),await o()}var gs={};Ke(gs,{render:()=>Ir});var ua={frontend:"browser",backend:"server",database:"database",storage:"layers",vector:"cube",ai:"brain",default:"cpu"};var Ar={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90"};function Lr(e){return e==="operational"?{label:"\u6838\u5FC3\u670D\u52D9\u6B63\u5E38",tone:"ok",headline:"\u6838\u5FC3\u8CC7\u6599\u7BA1\u7DDA\u904B\u4F5C\u4E2D",copy:"FastAPI\u3001PostgreSQL \u8207 Parquet \u5747\u53EF\u5B58\u53D6\u3002Qdrant\u3001Embedding \u8207 LLM \u6703\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u8A2D\u5B9A\u6216\u964D\u7D1A\u6642\u4E0D\u5F71\u97FF\u8CC7\u6599\u700F\u89BD\u8207\u67E5\u8A62\u5831\u8868\u3002"}:e==="degraded"?{label:"\u90E8\u5206\u670D\u52D9\u964D\u7D1A",tone:"warn",headline:"\u90E8\u5206\u670D\u52D9\u9700\u8981\u8A2D\u5B9A\u6216\u4FEE\u5FA9",copy:"\u6838\u5FC3\u8CC7\u6599\u670D\u52D9\u76EE\u524D\u672A\u5B8C\u5168\u53EF\u7528\u3002\u8ACB\u67E5\u770B\u4E0B\u65B9\u670D\u52D9\u5361\u7247\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u7684\u57F7\u884C\u7D00\u9304\uFF0C\u78BA\u8A8D PostgreSQL\u3001Parquet \u6216\u5916\u90E8\u670D\u52D9\u72C0\u614B\u3002"}:{label:Re(e).label,tone:Re(e).tone,headline:"\u76EE\u524D\u7121\u6CD5\u78BA\u8A8D\u7CFB\u7D71\u72C0\u614B",copy:"\u72C0\u614B API \u56DE\u50B3\u4E86\u975E\u9810\u671F\u7D50\u679C\u3002\u8ACB\u91CD\u65B0\u6574\u7406\uFF0C\u6216\u76F4\u63A5\u6AA2\u67E5 FastAPI \u670D\u52D9\u65E5\u8A8C\u3002"}}function Mr(e){let t=Re(e.status),s=ua[e.kind]||ua.default,a=e.latency_ms===null||e.latency_ms===void 0?"":`<span class="service-latency">${u(e.latency_ms)} ms</span>`;return`<article class="service-card">
    <div class="service-top">
      <span class="service-icon">${y(s,14)}</span>
      <span class="service-name" title="${n(e.name)}">${n(e.name)}</span>
      <span class="service-kind">${n(e.kind||"")}</span>
    </div>
    <div class="service-status">
      <span class="status-dot ${t.tone==="ok"?"is-ok":t.tone==="warn"?"is-warn":t.tone==="danger"?"is-danger":"is-idle"}" aria-hidden="true"></span>
      ${n(t.label)}
      ${a}
    </div>
    <p class="service-detail" title="${n(e.detail||"")}">${n(e.detail||"")}</p>
  </article>`}function Tr(e,t){return`<div class="arch-node ${e?"":"is-muted"}" ${e?"":'title="\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165"'}>${n(t)}</div>`}function qr(e,t){if(e==="IndexedDB")return Ms();let a={PostgreSQL:"postgres",Parquet:"parquet",Qdrant:"qdrant",Embedding:"embedding",Retriever:"rag","RAG Engine":"rag",LLM:"llm"}[e];return a?t.find(i=>i.id===a)?.status==="operational":!0}function Er(e,t){let s=e?.layers||[];if(!s.length)return'<div class="report-empty-inline">\u72C0\u614B API \u672A\u63D0\u4F9B\u67B6\u69CB\u8CC7\u6599\u3002</div>';let a=s.map(i=>{let o=(i.nodes||[]).map(l=>Tr(qr(l,t),l)).join("");return`<div class="arch-layer">
      <div class="arch-layer-label">${n(i.label||i.id)}</div>
      <div class="arch-nodes">${o}</div>
    </div>`}),r=[];return a.forEach((i,o)=>{o&&r.push(`<div class="arch-arrow" aria-hidden="true">${y("arrowRight",15)}</div>`),r.push(i)}),`<div class="arch-flow">${r.join("")}</div>
    <div class="arch-legend">
      <span><i class="legend-key is-live"></i>\u5DF2\u63A5\u5165\u4E14\u72C0\u614B\u6B63\u5E38</span>
      <span><i class="legend-key is-off"></i>\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165</span>
      <span>${y("info",12)} \u7BC0\u9EDE\u72C0\u614B\u4F86\u81EA\u4E3B\u670D\u52D9\u5065\u5EB7\u6AA2\u67E5</span>
    </div>`}function jr(e){return!Array.isArray(e)||!e.length?'<div class="report-empty-inline">\u6C92\u6709\u7AEF\u9EDE\u8CC7\u8A0A\u3002</div>':`<div class="endpoint-list">
    ${e.map(t=>`<div class="endpoint-row">
          <span class="endpoint-method">${n(t.method)}</span>
          <span class="endpoint-path" title="${n(t.path)}">${n(t.path)}</span>
          <span class="endpoint-label">${n(t.label||"")}</span>
        </div>`).join("")}
  </div>`}function tt(e,t){return`<div class="detail-row">
    <span class="detail-label">${n(e)}</span>
    <span class="detail-value">${t}</span>
  </div>`}function Nr(e){return e?`<div class="detail-list">
    ${tt("\u7248\u672C ID",`<strong>#${u(e.id)}</strong>`)}
    ${tt("\u8CC7\u6599\u985E\u578B",W("operational",e.source_type==="law"?"\u6CD5\u898F":"\u547D\u4EE4"))}
    ${tt("\u4F86\u6E90\u66F4\u65B0\u65E5",`<strong>${n(e.update_date||"\u2014")}</strong>`)}
    ${tt("\u6CD5\u898F / \u689D\u6587",`<strong>${u(e.law_count)} / ${u(e.article_count)}</strong>`)}
    ${tt("\u4E0B\u8F09\u6642\u9593",`<span class="mono">${se(e.downloaded_at)}</span>`)}
    ${tt("Parquet",`<code title="${n(e.parquet_path||"")}">${n(e.parquet_path||"\u2014")}</code>`)}
  </div>`:'<div class="report-empty-inline">\u5C1A\u672A\u532F\u5165\u4EFB\u4F55\u8CC7\u6599\u7248\u672C\u3002</div>'}function Pr(e){if(!Array.isArray(e)||!e.length)return ge({iconName:"history",title:"\u5C1A\u7121\u4E0B\u8F09\u57F7\u884C\u7D00\u9304",text:"\u57F7\u884C judgment-law-download \u5F8C\uFF0C\u6210\u529F\u3001\u7121\u8B8A\u66F4\u8207\u5931\u6557\u7684\u7D50\u679C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"});let t=[{key:"id",label:"Run",type:"number"},{key:"source_type",label:"\u985E\u578B",type:"source"},{key:"status",label:"\u72C0\u614B",type:"status"},{key:"started_at",label:"\u958B\u59CB\u6642\u9593",type:"datetime"},{key:"duration_ms",label:"\u8017\u6642",type:"duration"},{key:"law_count",label:"\u6CD5\u898F",type:"number"},{key:"article_count",label:"\u689D\u6587",type:"number"},{key:"error_message",label:"\u932F\u8AA4",type:"longtext"}];return`<div class="table-wrap" style="border-top:0;max-height:340px">
    <table class="data-table runs-table">
      <thead><tr>${t.map(s=>`<th scope="col">${n(s.label)}</th>`).join("")}</tr></thead>
      <tbody>
        ${e.map(s=>`<tr>${t.map(a=>`<td>${ft(s[a.key],a.type)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </div>`}function Cr(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=Lr(e.status),r=e.architecture||{},i=s.find(_=>_.id==="qdrant"),o=s.find(_=>_.id==="rag"),l=s.find(_=>_.id==="llm"),g=Ye(),b=Ar[g]||g,$=Se("/api/docs"),f=Se("/api/openapi.json"),h=Se("/api/status");return`<section class="status-hero">
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
          <span>${y("clock",11)} \u6AA2\u67E5\u6642\u9593 ${se(e.checked_at)} \xB7 ${n(Xe(e.checked_at))}</span>
          <span>${y("server",11)} ${s.length} \u500B\u670D\u52D9\u5143\u4EF6</span>
          <span>${y("database",11)} ${u(t.total_current)} \u7B46\u73FE\u884C\u8CC7\u6599</span>
          <span>${y("layers",11)} ${u(t.parquet_files)} \u500B\u539F\u59CB Parquet</span>
          <span title="API \u4F4D\u5740\u4F86\u6E90\uFF1A${n(b)}">${y("link",11)} ${n(Ce())}</span>
        </div>
      </div>
    </section>

    <div class="service-grid">${s.map(Mr).join("")}</div>

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

    ${i?.status==="not_configured"||o?.status==="not_configured"||l?.status==="not_configured"?`<div class="data-section">${G({tone:"info",title:"\u90E8\u5206 AI \u5143\u4EF6\u5C1A\u672A\u8A2D\u5B9A",text:`Qdrant\uFF1A${n(i?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BRAG\uFF1A${n(o?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BLLM\uFF1A${n(l?.detail||"\u672A\u8A2D\u5B9A")}\u3002\u9019\u4E9B\u72C0\u614B\u4E0D\u6703\u88AB\u507D\u88DD\u6210\u53EF\u7528\u3002`})}</div>`:""}

    <div class="data-section card architecture-card">
      <div class="section-head">
        <div>
          <div class="section-title">\u524D\u5F8C\u7AEF\u67B6\u69CB</div>
          <div class="section-sub">Client \u2192 Application \u2192 Data \u2192 Intelligence</div>
        </div>
        <span class="badge badge-neutral badge-mono">${u((r.flow||[]).length)} layers</span>
      </div>
      ${Er(r,s)}
    </div>

    <div class="status-columns">
      <section class="card">
        <div class="side-card-head">
          <span class="side-card-title">${y("terminal",14)}API \u7AEF\u9EDE</span>
          <a href="${n($)}" target="_blank" rel="noopener noreferrer" class="chip"
            >OpenAPI ${y("external",11)}</a>
        </div>
        ${jr(e.endpoints)}
        <div class="side-card-foot">
          \u76EE\u524D API Base\uFF1A<code>${n(Ce())}</code>\uFF08${n(b)}\uFF09\u3002\u4E92\u52D5\u5F0F API \u6587\u4EF6\u4F4D\u65BC <a href="${n($)}" target="_blank" rel="noopener noreferrer"><code>${n($)}</code></a>\uFF0COpenAPI schema \u4F4D\u65BC <a href="${n(f)}" target="_blank" rel="noopener noreferrer"><code>${n(f)}</code></a>\u3002
        </div>
      </section>

      <section class="card">
        <div class="side-card-head">
          <span class="side-card-title">${y("layers",14)}\u6700\u65B0\u8CC7\u6599\u7248\u672C</span>
          ${W("operational","Parquet")}
        </div>
        ${Nr(t.last_version)}
        <div class="side-card-foot">
          \u539F\u59CB Parquet \u5408\u8A08 ${ve(t.parquet_bytes)}\uFF1BPostgreSQL \u4FDD\u5B58 metadata \u8207\u7248\u672C\u72C0\u614B\u3002
        </div>
      </section>
    </div>

    <section class="card data-section" style="margin-top:16px">
      <div class="side-card-head">
        <span class="side-card-title">${y("history",14)}\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C</span>
        <span class="badge badge-neutral badge-mono">${u(t.run_count)} TOTAL</span>
      </div>
      ${Pr(e.recent_runs)}
    </section>

    <p class="status-footnote">
      \u6B64\u9801\u76F4\u63A5\u547C\u53EB <code>GET ${n(h)}</code>\u3002\u670D\u52D9\u72C0\u614B\u3001\u8CC7\u6599\u7B46\u6578\u8207\u6700\u8FD1\u57F7\u884C\u7D00\u9304\u7686\u4F86\u81EA\u76EE\u524D\u7684
      PostgreSQL \u8207\u8CC7\u6599\u76EE\u9304\uFF1BQdrant\u3001Embedding\u3001RAG \u8207 LLM \u672A\u8A2D\u5B9A\u6642\u6703\u6A19\u793A\u70BA\u300C\u672A\u8A2D\u5B9A\u300D\uFF0C\u4E0D\u6703\u986F\u793A\u63A8\u6E2C\u6578\u64DA\u3002
    </p>`}function Rr(){return`<div class="status-hero">
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
      ${G({tone:"danger",title:"\u72C0\u614B API \u8ACB\u6C42\u5931\u6557",text:n(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-retry">
          ${y("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}async function Ir(e,t){let s=!1,a=null,r=null;e.innerHTML=`<section class="page status-page">
    <div class="page-header">
      <div>
        <div class="eyebrow">OBSERVABILITY</div>
        <h1 class="page-title">\u7CFB\u7D71\u67B6\u69CB\u8207\u670D\u52D9\u72C0\u614B</h1>
        <p class="page-subtitle">\u6AA2\u8996\u524D\u7AEF\u3001FastAPI\u3001PostgreSQL\u3001Parquet \u8207 AI \u5143\u4EF6\u7684\u5373\u6642\u5065\u5EB7\u72C0\u614B\uFF0C
          \u4EE5\u53CA\u6700\u8FD1\u7684\u8CC7\u6599\u7248\u672C\u8207\u4E0B\u8F09\u57F7\u884C\u7D00\u9304\u3002</p>
      </div>
      <div class="page-actions">
        <label class="auto-refresh">
          <input type="checkbox" id="auto-refresh" />
          \u81EA\u52D5\u66F4\u65B0 30s
        </label>
        <button class="btn btn-secondary" type="button" id="refresh-status">
          ${y("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
    <div id="status-content">${Rr()}</div>
  </section>`;let i=e.querySelector("#status-content"),o=e.querySelector("#refresh-status"),l=e.querySelector("#auto-refresh"),g=async({quiet:b=!1}={})=>{b||(o.disabled=!0,J(o,!0,"\u6AA2\u67E5\u4E2D\u2026"));try{let $=await z.status();if(s)return;r=$,i.innerHTML=Cr($),typeof t?.refreshHeaderStatus=="function"&&t.refreshHeaderStatus();let f=i.querySelector("#status-retry");f&&f.addEventListener("click",()=>g()),b||I("\u670D\u52D9\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200)}catch($){if(s)return;i.innerHTML=Br($);let f=i.querySelector("#status-retry");f&&f.addEventListener("click",()=>g()),b||I($.message||"\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002","danger")}finally{s||(o.disabled=!1,J(o,!1))}};return o.addEventListener("click",()=>g()),l.addEventListener("change",()=>{a&&(window.clearInterval(a),a=null),l.checked&&(a=window.setInterval(()=>g({quiet:!0}),3e4),I("\u5DF2\u555F\u7528\u6BCF 30 \u79D2\u81EA\u52D5\u66F4\u65B0\u3002","info",2200))}),await g({quiet:!0}),t&&typeof t.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"),()=>{s=!0,a&&window.clearInterval(a)}}var pa="rag",Bt={rag:{page:ps,title:"RAG \u63D0\u554F \xB7 Judgment RAG Console"},data:{page:ls,title:"\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"},quality:{page:vs,title:"\u8CC7\u6599\u54C1\u8CEA \xB7 Judgment RAG Console"},performance:{page:ds,title:"\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"},processing:{page:ms,title:"\u8CC7\u6599\u8655\u7406 \xB7 Judgment RAG Console"},status:{page:gs,title:"\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"}},Pt=document.getElementById("app-main"),Ct=null,Rt=0,It=0,fs=null,Ve=!1,De=!1,Je={embedding:[],llm:[]};function Dr(){return`<div class="page-loading" aria-live="polite">
    <div class="skeleton skeleton-title"></div>
    <div class="skeleton skeleton-subtitle"></div>
    <div class="skeleton-grid">
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
    </div>
  </div>`}function ga(){let t=window.location.hash.replace(/^#\/?/,"").trim().split("/")[0]||pa;return Object.prototype.hasOwnProperty.call(Bt,t)?t:pa}function Or(e){document.querySelectorAll("[data-route]").forEach(t=>{let s=t.dataset.route===e;t.classList.toggle("is-active",s),s?t.setAttribute("aria-current","page"):t.removeAttribute("aria-current")})}function Fr(e){return`<section class="page">
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
          <span class="notice-icon" aria-hidden="true">${y("alert",12)}</span>
          <div class="notice-body">
            <strong>\u7121\u6CD5\u5EFA\u7ACB\u9801\u9762</strong>
            <p>${n(e.message||"\u672A\u77E5\u932F\u8AA4")}</p>
          </div>
        </div>
        <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
          <button class="btn btn-secondary btn-sm" type="button" id="route-retry">
            ${y("refresh",14)}<span>\u91CD\u65B0\u8F09\u5165</span>
          </button>
        </div>
      </div>
    </div>
  </section>`}async function hs(){let e=ga(),t=++Rt;if(Or(e),window.location.hash!==`#/${e}`&&window.history.replaceState(null,"",`#/${e}`),typeof Ct=="function"){try{Ct()}catch{}Ct=null}document.title=Bt[e].title,Pt.innerHTML=Dr(),Pt.focus({preventScroll:!0}),window.scrollTo({top:0,behavior:"auto"});let s={route:e,navigate(a){Bt[a]&&(window.location.hash=`#/${a}`)},setTitle(a){t===Rt&&a&&(document.title=a)},refreshHeaderStatus:Ot};try{let a=await Bt[e].page.render(Pt,s);if(t!==Rt){typeof a=="function"&&a();return}Ct=typeof a=="function"?a:null}catch(a){if(t!==Rt)return;console.error("Failed to render route",e,a),Pt.innerHTML=Fr(a);let r=document.getElementById("route-retry");r&&r.addEventListener("click",()=>hs()),I("\u9801\u9762\u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}}function Dt({enabled:e,busy:t=!1,label:s="",title:a}){let r=document.getElementById("header-status");if(!r)return;let i=r.querySelector(".header-status-label");De=e,r.classList.toggle("is-on",e),r.classList.toggle("is-off",!e),r.classList.toggle("is-busy",t),r.disabled=t,r.setAttribute("aria-checked",e?"true":"false"),r.setAttribute("aria-busy",t?"true":"false"),r.setAttribute("aria-label",t?s:e?"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF0C\u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\uFF0C\u9EDE\u64CA\u958B\u555F"),r.title=a,i&&(i.textContent=e?"ON":"OFF")}function fa(e){let t=Array.isArray(e?.embedding)?e.embedding.length:0,s=Array.isArray(e?.llm)?e.llm.length:0;return`${t} \u500B embedding \xB7 ${s} \u500B LLM`}async function Ot(){if(!document.getElementById("header-status")||Ve)return;let t=++It;try{let s=await z.testMode();if(t!==It||Ve)return;Je=s.models||{embedding:[],llm:[]};let a=!!s.enabled,r=fa(Je);Dt({enabled:a,title:`\u6E2C\u8A66\u6A21\u5F0F ${a?"ON":"OFF"} \xB7 ${r} \xB7 \u9EDE\u64CA\u5207\u63DB`})}catch{if(t!==It||Ve)return;Dt({enabled:!1,title:"\u5F8C\u7AEF\u96E2\u7DDA \xB7 \u7121\u6CD5\u8B80\u53D6\u6E2C\u8A66\u6A21\u5F0F\uFF1B\u8ACB\u78BA\u8A8D API"})}}function Hr(){let e=document.getElementById("header-status");e&&e.addEventListener("click",async()=>{if(Ve)return;let t=!De;It+=1,Ve=!0,Dt({enabled:De,busy:!0,label:t?"\u6B63\u5728\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u2026":"\u6B63\u5728\u95DC\u9589\u6E2C\u8A66\u6A21\u5F0F\u2026",title:t?"\u6B63\u5728\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u2026":"\u6B63\u5728\u95DC\u9589\u6E2C\u8A66\u6A21\u5F0F\u2026"});try{let s=await z.setTestMode(t);if(Ve=!1,De=!!s.enabled,Je=s.models||{embedding:[],llm:[]},Dt({enabled:De,title:`\u6E2C\u8A66\u6A21\u5F0F ${De?"ON":"OFF"} \xB7 ${fa(Je)} \xB7 \u9EDE\u64CA\u5207\u63DB`}),window.dispatchEvent(new CustomEvent("judgment:test-mode",{detail:{enabled:De,models:Je}})),De){let a=Je.embedding?.length||0,r=Je.llm?.length||0;I(`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A\u6BCF\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C ${a} \u500B embedding \u8207 ${r} \u500B LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002`,"ok",7e3)}else I("\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","info")}catch(s){Ve=!1,await Ot(),I(s.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","danger",6e3)}})}var ma={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u6B64\u700F\u89BD\u5668\u5132\u5B58\u7684\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"};function Ur(e){try{let t=new URL(e).hostname;return["localhost","127.0.0.1","::1","[::1]"].includes(t)}catch{return!1}}function zr(e){return window.location.protocol==="https:"&&/^http:\/\//i.test(e)&&!Ur(e)}function Qr(){let e=document.getElementById("api-config-trigger"),t=document.getElementById("dialog-root");if(!e||!t)return{open(){}};t.innerHTML=`<dialog class="api-dialog" id="api-dialog" aria-labelledby="api-dialog-title">
    <form class="api-dialog-form" id="api-dialog-form" novalidate>
      <div class="api-dialog-head">
        <span class="api-dialog-icon" aria-hidden="true">${y("link",17)}</span>
        <div class="api-dialog-heading">
          <div class="api-dialog-title" id="api-dialog-title">\u5F8C\u7AEF API \u9023\u7DDA</div>
          <p class="api-dialog-copy">\u524D\u7AEF\u662F\u7D14\u975C\u614B\u6A94\u6848\uFF0C\u53EF\u5F9E\u672C\u6A5F\u6A94\u6848\u3001Cloudflare Pages \u6216\u4EFB\u4F55\u975C\u614B\u4E3B\u6A5F\u958B\u555F\uFF0C\u518D\u9023\u5230 FastAPI \u5F8C\u7AEF\u3002Cloudflare \u90E8\u7F72\u8ACB\u4F7F\u7528 cloudflared \u63D0\u4F9B\u7684 HTTPS \u4F4D\u5740\u3002</p>
        </div>
        <button class="api-dialog-close" type="button" id="api-dialog-close" aria-label="\u95DC\u9589">\xD7</button>
      </div>
      <label class="field" for="api-base-input">
        <span class="field-label">API Base URL <span class="field-tag">runtime</span></span>
        <input class="input mono" id="api-base-input" name="api-base" type="url"
          inputmode="url" autocomplete="url" spellcheck="false"
          placeholder="http://127.0.0.1:9200" />
        <span class="field-help">\u7559\u7A7A\u4EE3\u8868\u540C\u6E90\uFF1B\u4EE5 file:// \u958B\u555F\u6642\u7559\u7A7A\u6703\u4F7F\u7528 http://127.0.0.1:9200\u3002</span>
      </label>
      <div class="api-dialog-preview" id="api-dialog-preview"></div>
      <div class="api-dialog-status" id="api-dialog-status" role="status"></div>
      <div class="api-dialog-note" id="api-dialog-note"></div>
      <div class="api-dialog-actions">
        <button class="btn btn-secondary btn-sm" type="button" id="api-test">
          ${y("activity",14)}<span>\u6E2C\u8A66\u9023\u7DDA</span>
        </button>
        <span class="grow"></span>
        <button class="btn btn-ghost btn-sm" type="button" id="api-reset">\u6062\u5FA9\u9810\u8A2D</button>
        <button class="btn btn-primary btn-sm" type="submit" id="api-save">
          ${y("check",14)}<span>\u5132\u5B58\u4E26\u91CD\u65B0\u8F09\u5165</span>
        </button>
      </div>
    </form>
  </dialog>`;let s=t.querySelector("#api-dialog"),a=t.querySelector("#api-dialog-form"),r=t.querySelector("#api-base-input"),i=t.querySelector("#api-dialog-preview"),o=t.querySelector("#api-dialog-status"),l=t.querySelector("#api-dialog-note"),g=t.querySelector("#api-dialog-close"),b=t.querySelector("#api-test"),$=t.querySelector("#api-reset"),f=t.querySelector("#api-save"),h=()=>Ye()==="query",_=()=>{let M=Pe(r.value);return M||(window.location.protocol==="file:"?Ut:"")},v=(M,R="")=>{o.textContent=M,o.className=`api-dialog-status${R?` is-${R}`:""}`},x=()=>{let M=_(),R=qe();i.innerHTML=`\u76EE\u524D\u751F\u6548\uFF1A<strong>${n(Ce(R))}</strong><br />
      \u6B64\u4F4D\u5740\u7684\u72C0\u614B\u8ACB\u6C42\uFF1A${n(Se("/api/status",M))}`},N=()=>{let M=qe(),R=Ye();e.classList.toggle("is-custom",!!M),e.title=`\u5F8C\u7AEF API\uFF1A${Ce(M)}\uFF08${ma[R]||R}\uFF09`},P=M=>{let R=Ye(),V=`\u76EE\u524D\u4F86\u6E90\uFF1A${ma[R]||R}\u3002\u512A\u5148\u9806\u5E8F\u70BA ?api= \u2192 \u700F\u89BD\u5668\u5132\u5B58\u503C \u2192 config.js \u2192 \u540C\u6E90\u3002`,F="";R==="query"?(F="is-warn",V="\u6B64\u9801\u7531\u7DB2\u5740\u7684 ?api= \u53C3\u6578\u6307\u5B9A\u5F8C\u7AEF\u4F4D\u5740\uFF0C\u5177\u6709\u6700\u9AD8\u512A\u5148\u9806\u5E8F\u3002\u5132\u5B58\u6216\u6062\u5FA9\u9810\u8A2D\u5728\u6B64\u9801\u4E0D\u6703\u751F\u6548\uFF1B\u8ACB\u5148\u79FB\u9664\u7DB2\u5740\u4E2D\u7684 api \u53C3\u6578\u3002"):M==="hosted"&&Vt()?(F="is-warn",V="\u6B64\u9801\u4E0D\u662F\u5F9E localhost \u958B\u555F\uFF0C\u4E14\u5C1A\u672A\u8A2D\u5B9A\u5F8C\u7AEF API\u3002\u8ACB\u586B\u5165 cloudflared \u7684 https:// \u4F4D\u5740\uFF0C\u6216\u90E8\u7F72\u6642\u5728 config.js \u6307\u5B9A apiBase\uFF1BHTTP \u4F4D\u5740\u6703\u88AB HTTPS \u9801\u9762\u963B\u64CB\u3002"):(R==="file-default"||window.location.protocol==="file:")&&(V="\u4EE5 file:// \u76F4\u63A5\u958B\u555F\u6642\uFF0C\u9810\u8A2D\u9023\u5230 http://127.0.0.1:9200\u3002\u82E5\u5F8C\u7AEF\u4F7F\u7528\u5176\u4ED6\u9023\u63A5\u57E0\uFF0C\u8ACB\u5728\u6B64\u4FEE\u6539\u4E26\u5132\u5B58\u3002"),l.textContent=V,l.className=`api-dialog-note${F?` ${F}`:""}`;let K=R==="query";f.disabled=K,$.disabled=K,r.readOnly=K},k=()=>{if(!zt(r.value))return v("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002","error"),r.focus(),null;let M=_();return zr(M)?(v("HTTPS \u9801\u9762\u7121\u6CD5\u9023\u7DDA\u5230 HTTP API\uFF08mixed content\uFF09\u3002\u8ACB\u6539\u7528 cloudflared \u63D0\u4F9B\u7684 https:// \u4F4D\u5740\u3002","error"),r.focus(),null):M},L=({reason:M=""}={})=>{s.open||(r.value=qe(),x(),P(M),v("\u53EF\u5148\u6E2C\u8A66\u9023\u7DDA\uFF0C\u5132\u5B58\u5F8C\u9801\u9762\u6703\u91CD\u65B0\u8F09\u5165\u3002"),e.setAttribute("aria-expanded","true"),typeof s.showModal=="function"?s.showModal():s.setAttribute("open",""),r.focus(),r.select())},E=()=>{typeof s.close=="function"?s.close():s.removeAttribute("open"),e.setAttribute("aria-expanded","false"),e.focus()};return e.addEventListener("click",()=>L()),g.addEventListener("click",E),s.addEventListener("close",()=>{e.setAttribute("aria-expanded","false")}),s.addEventListener("click",M=>{M.target===s&&E()}),r.addEventListener("input",()=>{x(),v("\u5C1A\u672A\u6E2C\u8A66\u6B64\u4F4D\u5740\u3002")}),b.addEventListener("click",async()=>{let M=k();if(M!==null){J(b,!0,"\u6E2C\u8A66\u4E2D\u2026"),v(`\u6B63\u5728\u9023\u7DDA\u5230 ${Ce(M)}\u2026`);try{let R=await _s(M);v(`\u9023\u7DDA\u6210\u529F \xB7 v${R.version} \xB7 ${R.duration_ms} ms \xB7 GET ${Se("/api/health",M)}`,"ok")}catch(R){v(R.message||"\u9023\u7DDA\u6E2C\u8A66\u5931\u6557\u3002","error")}finally{J(b,!1)}}}),a.addEventListener("submit",M=>{if(M.preventDefault(),h())return;let R=k();R!==null&&(Wt(R),I(`\u5F8C\u7AEF API \u5DF2\u8A2D\u70BA ${Ce(R)}\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026`,"ok",1600),window.setTimeout(()=>window.location.reload(),120))}),$.addEventListener("click",()=>{h()||(Wt(""),I("\u5DF2\u6E05\u9664\u700F\u89BD\u5668\u5132\u5B58\u7684 API \u4F4D\u5740\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026","info",1600),window.setTimeout(()=>window.location.reload(),120))}),N(),x(),{open:L,updateTrigger:N}}function Gr(){document.addEventListener("keydown",e=>{if(e.key!=="/"||e.metaKey||e.ctrlKey||e.altKey)return;let t=document.activeElement;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable)||ga()!=="rag")return;let a=document.getElementById("rag-question");a&&(e.preventDefault(),a.focus())})}function va(){Ls();let e=Qr();Hr(),Gr(),window.addEventListener("hashchange",hs),window.addEventListener("storage",t=>{t.key==="judgment.api_base"&&e.updateTrigger?.()}),fs=window.setInterval(Ot,6e4),hs(),Ot(),Vt()&&window.setTimeout(()=>e.open({reason:"hosted"}),700)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",va):va();window.addEventListener("beforeunload",()=>{fs&&window.clearInterval(fs)});})();
