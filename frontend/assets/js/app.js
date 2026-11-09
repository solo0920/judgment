(()=>{var ua=Object.defineProperty;var ze=(e,t)=>{for(var s in t)ua(e,s,{get:t[s],enumerable:!0})};var It="judgment.api_base",Bt="http://127.0.0.1:9200",pe=class extends Error{constructor(t,s=0,a=null){super(t),this.name="ApiError",this.status=s,this.detail=a}};function vs(e){return["localhost","127.0.0.1","::1","[::1]"].includes(e)}function Be(e){let t=String(e??"").trim();if(!t||t==="/")return"";t=t.replace(/\/+$/,""),!/^https?:\/\//i.test(t)&&!t.startsWith("/")&&(t=`${vs(t.split(":")[0])?"http":"https"}://${t}`);try{let s=new URL(t,window.location.href);return s.protocol!=="http:"&&s.protocol!=="https:"?"":`${s.origin}${s.pathname==="/"?"":s.pathname.replace(/\/+$/,"")}`}catch{return t}}function Dt(e){let t=Be(e);if(!t)return!0;try{let s=new URL(t);return s.protocol==="http:"||s.protocol==="https:"}catch{return!1}}function Ft(){try{let e=new URLSearchParams(window.location.search);return e.has("api")?Be(e.get("api")):null}catch{return null}}function Ot(){try{let e=window.localStorage.getItem(It);return e===null?null:Be(e)}catch{return null}}function Ht(){let e=window.JUDGMENT_CONFIG&&window.JUDGMENT_CONFIG.apiBase;return Be(e||"")}function De(){let e=Ft();if(e!==null)return e;let t=Ot();if(t!==null)return t;let s=Ht();return s||(window.location.protocol==="file:"?Bt:"")}function pa(){if(Ft()!==null)return!0;let e=Ot();return e!==null?!!e:!!Ht()}function Ge(){return Ft()!==null?"query":Ot()!==null?"storage":Ht()?"config":window.location.protocol==="file:"?"file-default":"same-origin"}function mt(){return pa()||window.location.protocol==="file:"||!window.JUDGMENT_CONFIG?!1:!vs(window.location.hostname)}function Ut(e){let t=Be(e);try{t?window.localStorage.setItem(It,t):window.localStorage.removeItem(It)}catch{}return t}function Qe(e=De()){return e||"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"}function Me(e,t=De()){return t?`${t}${e.startsWith("/")?e:`/${e}`}`:e}function zt(e){return`\u7121\u6CD5\u9023\u7DDA\u5230\u4F3A\u670D\u5668${e?`\uFF08${e}\uFF09`:""}\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u662F\u5426\u555F\u52D5\uFF0C\u6216\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u8A2D\u5B9A\u5F8C\u7AEF\u4F4D\u5740\u3002`}async function re(e,t={}){let s=De(),a=new AbortController,r=t.timeout===void 0?3e4:t.timeout,i=r>0?window.setTimeout(()=>a.abort(),r):null,o=Date.now(),l=performance.now(),v=t.requestId||fs(),b={Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},"X-Judgment-Request-Id":v,"X-Judgment-Client-Started-At":String(o),...t.headers||{}},$;try{$=await fetch(Me(e,s),{...t,headers:b,signal:a.signal})}catch(x){throw x.name==="AbortError"?new pe("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new pe(zt(s),0,x)}finally{i&&window.clearTimeout(i)}let g=null;if(($.headers.get("content-type")||"").includes("application/json"))try{g=await $.json()}catch{g=null}else try{g=await $.text()}catch{g=null}let _=performance.now(),h=$.headers.get("X-Judgment-Request-Id")||v;if(t.trackClient!==!1&&h){let x=Math.round(performance.now()-l);window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{gs({request_id:h,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:x,render_ms:Math.max(0,Math.round(performance.now()-_)),status:$.ok?"success":"failed"})})})}if(!$.ok){let x=g&&typeof g=="object"?g.detail||g.message:g,C=typeof x=="string"&&x?x:`\u4F3A\u670D\u5668\u56DE\u61C9 ${$.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new pe(C,$.status,x)}return g}function fs(){try{if(window.crypto&&typeof window.crypto.randomUUID=="function")return window.crypto.randomUUID().replace(/-/g,"").slice(0,32)}catch{}return`req${Date.now().toString(36)}${Math.random().toString(36).slice(2,10)}`}function gs(e){try{fetch(Me("/api/performance/client",De()),{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e),keepalive:!0}).catch(()=>{})}catch{}}async function hs(e){let t=Be(e);if(!Dt(t))throw new pe("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002");let s=performance.now(),a=new AbortController,r=window.setTimeout(()=>a.abort(),1e4);try{let i=await fetch(Me("/api/health",t),{headers:{Accept:"application/json"},signal:a.signal});if(!i.ok)throw new pe(`API \u56DE\u61C9 ${i.status}\u3002`,i.status);let o=await i.json();return{base:t,version:o.version||"\u2014",duration_ms:Math.round(performance.now()-s)}}catch(i){throw i instanceof pe?i:i.name==="AbortError"?new pe("\u9023\u7DDA\u6E2C\u8A66\u903E\u6642\uFF0C\u8ACB\u78BA\u8A8D API \u4F4D\u5740\u8207\u7DB2\u8DEF\u3002",0,i):new pe(zt(t),0,i)}finally{window.clearTimeout(r)}}var H={health(){return re("/api/health")},status(){return re("/api/status",{trackClient:!1})},catalog(){return re("/api/catalog")},query({database:e,filters:t,page:s=1,pageSize:a=25}){return re("/api/query",{method:"POST",body:JSON.stringify({database:e,filters:t,page:s,page_size:a})})},schemaSuggest({database:e,table:t,column:s,query:a,limit:r=1e3}){let i=new URLSearchParams({database:e,table:t,column:s,q:a||"",limit:String(r)});return re(`/api/schema/suggest?${i.toString()}`,{timeout:3e4})},lawDetail(e,t="",s="",a=""){let r=new URLSearchParams({law_key:e});return t&&r.set("source_type",t),s&&r.set("version_id",String(s)),a&&r.set("article_no",String(a)),re(`/api/law?${r.toString()}`,{timeout:45e3})},judgmentDetail(e,t=""){let s=new URLSearchParams({jid:e});return t&&s.set("source",t),re(`/api/judgment?${s.toString()}`,{timeout:45e3})},testMode(){return re("/api/test-mode",{trackClient:!1})},setTestMode(e){return re("/api/test-mode",{method:"POST",body:JSON.stringify({enabled:!!e}),trackClient:!1})},testRuns(e=20){let t=new URLSearchParams({limit:String(e)});return re(`/api/test-runs?${t.toString()}`,{trackClient:!1})},testRunCurrent(){return re("/api/test-runs/current",{trackClient:!1})},testRun(e){return re(`/api/test-runs/${encodeURIComponent(e)}`,{trackClient:!1})},performanceOptions(){return re("/api/performance/options",{trackClient:!1})},performance(e={},t=1,s=25){let a=new URLSearchParams;for(let[r,i]of Object.entries(e))i==null||i===""||a.set(r,String(i));return a.set("page",String(t)),a.set("page_size",String(s)),re(`/api/performance?${a.toString()}`,{timeout:45e3,trackClient:!1})},quality(){return re("/api/quality",{timeout:18e4,trackClient:!1})},processing(){return re("/api/processing",{timeout:45e3,trackClient:!1})},processingPlan(){return re("/api/processing/plan",{timeout:45e3,trackClient:!1})},startProcessingUpdate(e=!1){return re("/api/processing/update",{method:"POST",body:JSON.stringify({index:!!e}),timeout:45e3,trackClient:!1})},stopProcessingUpdate(){return re("/api/processing/stop",{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},rag(e,t={}){return re("/api/rag/query",{method:"POST",body:JSON.stringify({question:e}),timeout:t.testMode?0:3e5})},async ragStream(e,{testMode:t=!1,onStep:s=null,onPartial:a=null,onToken:r=null,onTokenReset:i=null}={}){let o=De(),l=new AbortController,v=t?0:3e5,b=v>0?window.setTimeout(()=>l.abort(),v):null,$=Date.now(),g=performance.now(),f=fs(),_={Accept:"text/event-stream","Content-Type":"application/json","X-Judgment-Request-Id":f,"X-Judgment-Client-Started-At":String($)},h;try{h=await fetch(Me("/api/rag/query/stream",o),{method:"POST",headers:_,body:JSON.stringify({question:e}),signal:l.signal})}catch(R){throw R.name==="AbortError"?new pe("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new pe(zt(o),0,R)}finally{b&&window.clearTimeout(b)}if(!h.ok){let R=null;try{R=await h.json()}catch{R=null}let z=R&&typeof R=="object"&&R.detail?String(R.detail):`\u4F3A\u670D\u5668\u56DE\u61C9 ${h.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new pe(z,h.status,R)}if(!h.body)throw new pe("\u4F3A\u670D\u5668\u6C92\u6709\u56DE\u50B3\u53EF\u8B80\u53D6\u7684\u6D41\u7A0B\u4E32\u6D41\u3002",0,null);let x=h.body.getReader(),C=new TextDecoder,j="",S=null,M=null;try{for(;;){let{value:R,done:z}=await x.read();if(z)break;j+=C.decode(R,{stream:!0});let X=j.indexOf(`

`);for(;X>=0;){let U=j.slice(0,X).replace(/\r/g,"");j=j.slice(X+2);let W="message",q=[];for(let N of U.split(`
`))N.startsWith("event:")?W=N.slice(6).trim():N.startsWith("data:")&&q.push(N.slice(5).trimStart());if(q.length){let N=null;try{N=JSON.parse(q.join(`
`))}catch{N=null}if(N)if(W==="step"&&typeof s=="function")try{s(N)}catch{}else if(W==="partial"){if(typeof a=="function")try{a(N)}catch{}}else if(W==="token"){if(typeof r=="function")try{r(String(N.text||""))}catch{}}else if(W==="token_reset"){if(typeof i=="function")try{i()}catch{}}else W==="result"?S=N:W==="error"&&(M=new pe(N.message||N.detail||"RAG \u6D41\u7A0B\u5931\u6557\u3002",0,N))}X=j.indexOf(`

`)}}}finally{try{await x.cancel()}catch{}b&&window.clearTimeout(b)}if(M)throw M;if(!S)throw new pe("\u6D41\u7A0B\u4E32\u6D41\u7D50\u675F\uFF0C\u4F46\u6C92\u6709\u6536\u5230\u6700\u7D42\u56DE\u7B54\u3002",0,null);let E=Math.round(performance.now()-g);return gs({request_id:f,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:E,render_ms:0,status:"success"}),S}};var ma={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},va={operational:{label:"\u6B63\u5E38",tone:"ok"},success:{label:"\u6210\u529F",tone:"ok"},ok:{label:"\u6B63\u5E38",tone:"ok"},healthy:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},warning:{label:"\u6CE8\u610F",tone:"warn"},empty:{label:"\u7121\u8CC7\u6599",tone:"warn"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},running:{label:"\u57F7\u884C\u4E2D",tone:"info"},pending:{label:"\u7B49\u5F85",tone:"idle"},skipped:{label:"\u7565\u904E",tone:"idle"},partial:{label:"\u90E8\u5206\u6210\u529F",tone:"warn"},preview:{label:"\u9810\u89BD\u6A21\u5F0F",tone:"info"},retrieval_only:{label:"\u50C5\u6AA2\u7D22\u7D50\u679C",tone:"warn"},not_indexed:{label:"\u5C1A\u672A\u7D22\u5F15",tone:"warn"},missing_query:{label:"\u7B49\u5F85\u67E5\u8A62",tone:"idle"},client_side:{label:"\u700F\u89BD\u5668\u7AEF",tone:"info"},not_configured:{label:"\u672A\u8A2D\u5B9A",tone:"idle"},unavailable:{label:"\u96E2\u7DDA",tone:"danger"},failed:{label:"\u5931\u6557",tone:"danger"},error:{label:"\u932F\u8AA4",tone:"danger"}},fa={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},ga={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},bs={search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',send:'<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',refresh:'<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 4v5.5H15"/>',copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',check:'<path d="m5 12 4.2 4.2L19 6.5"/>',x:'<path d="m6 6 12 12M18 6 6 18"/>',external:'<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/>',message:'<path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H6l-3 2 1.3-4.2A8.5 8.5 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',history:'<path d="M3.2 12a8.8 8.8 0 1 0 2.8-6.3L3.2 8.5"/><path d="M3 3.5v5h5"/><path d="M12 7.5V12l3 1.8"/>',database:'<ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/><path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/>',layers:'<path d="m12 3 9 4.8-9 4.8-9-4.8L12 3Z"/><path d="m3 12.2 9 4.8 9-4.8"/><path d="m3 16.7 9 4.8 9-4.8"/>',cube:'<path d="m12 2.8 8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4L12 2.8Z"/><path d="m3.8 7.4 8.2 4.6 8.2-4.6"/><path d="M12 12v9.2"/>',browser:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6.5 6.5h.01"/>',download:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',chevronLeft:'<path d="m14.5 5-7 7 7 7"/>',chevronRight:'<path d="m9.5 5 7 7-7 7"/>',chevronDown:'<path d="m5 9 7 7 7-7"/>',arrowRight:'<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',alert:'<path d="M12 3 2.5 20.5h19L12 3Z"/><path d="M12 9v4.5"/><path d="M12 17.5h.01"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',sparkles:'<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"/>',table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M9 9.5V20M15 9.5V20"/>',sliders:'<path d="M4 7h8M16 7h4M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',server:'<rect x="3" y="4" width="18" height="6" rx="1.6"/><rect x="3" y="14" width="18" height="6" rx="1.6"/><path d="M7 7h.01M7 17h.01"/>',brain:'<path d="M9.7 4.2a2.8 2.8 0 0 0-3 2.8 2.8 2.8 0 0 0-1.1 5.2A2.9 2.9 0 0 0 7.8 18a2.9 2.9 0 0 0 3.9 2V4.2a2.8 2.8 0 0 0-2 0Z"/><path d="M14.3 4.2a2.8 2.8 0 0 1 3 2.8 2.8 2.8 0 0 1 1.1 5.2A2.9 2.9 0 0 1 16.2 18a2.9 2.9 0 0 1-3.9 2"/>',cloud:'<path d="M7 18.5h10.5a3.5 3.5 0 0 0 .4-7 5.5 5.5 0 0 0-10.6-1.3A4.2 4.2 0 0 0 7 18.5Z"/>',code:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',play:'<path d="M7 4.5v15l13-7.5-13-7.5Z"/>',file:'<path d="M6 2.8h8l4.5 4.5v13.9H6V2.8Z"/><path d="M14 2.8V7.5h5"/>',activity:'<path d="M3 12h4l2.2-5 4.1 10 2.2-5H21"/>',shield:'<path d="M12 2.8 20 6v6c0 4.7-3.2 8-8 9.2C7.2 20 4 16.7 4 12V6l8-3.2Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',terminal:'<path d="m5 7 5 5-5 5"/><path d="M12 17h7"/>',filter:'<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',link:'<path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10.2 5.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-1.4 1.4a5 5 0 0 0 7.1 7.1l1.2-1.2"/>',grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9.5 9.5h5v5h-5z"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>'};function n(e){return String(e??"").replace(/[&<>"']/g,t=>ma[t])}function y(e,t=16,s=""){let a=bs[e]||bs.info;return`<svg${s?` class="${n(s)}"`:""} width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a}</svg>`}function p(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?new Intl.NumberFormat("zh-TW").format(s):t}function he(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=["B","KB","MB","GB","TB"],a=0;for(;t>=1024&&a<s.length-1;)t/=1024,a+=1;return a===0?`${t.toFixed(0)} B`:`${t.toFixed(1)} ${s[a]}`}function Gt(e){if(e instanceof Date)return e;if(typeof e=="number"){let r=new Date(e);return Number.isNaN(r.getTime())?null:r}let t=String(e??"").trim();if(!t)return null;if(/^\d{8}$/.test(t))return new Date(Number(t.slice(0,4)),Number(t.slice(4,6))-1,Number(t.slice(6,8)));let s=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(t),a=new Date(s?`${t}Z`:t);return Number.isNaN(a.getTime())?null:a}function je(e){let t=Gt(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit"}).format(t):e?n(e):"\u2014"}function ae(e){let t=Gt(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1}).format(t):e?n(e):"\u2014"}function Ze(e){let t=Gt(e);if(!t)return"";let s=Date.now()-t.getTime();return s<45e3?"\u525B\u525B":s<36e5?`${Math.max(1,Math.round(s/6e4))} \u5206\u9418\u524D`:s<864e5?`${Math.round(s/36e5)} \u5C0F\u6642\u524D`:s<6048e5?`${Math.round(s/864e5)} \u5929\u524D`:je(t)}function F(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;if(t<6e4)return`${(t/1e3).toFixed(1)} s`;let s=Math.floor(t/6e4),a=Math.round(t%6e4/1e3);return`${s}m ${a}s`}function Fe(e){return va[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function Y(e,t){let s=Fe(e);return`<span class="badge ${fa[s.tone]}"><span class="status-dot ${ga[s.tone]}"></span>${n(t||s.label)}</span>`}function ha(e){return e==="law"?'<span class="badge badge-info">\u6CD5\u898F</span>':e==="order"?'<span class="badge badge-neutral">\u547D\u4EE4</span>':e?`<span class="badge badge-neutral">${n(e)}</span>`:'<span class="cell-empty">\u2014</span>'}function vt(e,t){let s=String(e??"");return s.length>t?`${s.slice(0,t)}\u2026`:s}function ft(e,t="text"){if(e==null||e==="")return'<span class="cell-empty">\u2014</span>';switch(t){case"boolean":return e?'<span class="badge badge-ok">\u662F</span>':'<span class="badge badge-neutral">\u5426</span>';case"status":return Y(String(e));case"source":return ha(String(e));case"number":return`<span class="mono">${p(e)}</span>`;case"duration":return`<span class="mono">${F(e)}</span>`;case"datetime":return`<span class="mono">${ae(e)}</span>`;case"date":return`<span class="mono">${je(e)}</span>`;case"url":{let s=String(e),a=vt(s.replace(/^https?:\/\//,""),46);return`<span class="cell-url"><a href="${n(s)}" target="_blank" rel="noopener noreferrer" title="${n(s)}">${y("external",10)}${n(a)}</a></span>`}case"mono":{let s=String(e);return`<span class="cell-mono cell-truncate" title="${n(s)}">${n(vt(s,54))}</span>`}case"longtext":{let s=String(e);return`<span class="cell-truncate" title="${n(s)}">${n(vt(s,100))}</span>`}default:{let s=String(e);return`<span class="cell-truncate" title="${n(s)}">${n(vt(s,90))}</span>`}}}function V({tone:e="info",title:t,text:s,iconName:a="info"}){let r=e==="ok"?"check":e==="danger"||e==="warn"?"alert":"i";return`<div class="notice notice-${e}" role="status">
    <span class="notice-icon" aria-hidden="true">${r==="i"?"i":y(r,12)}</span>
    <div class="notice-body">
      ${t?`<strong>${n(t)}</strong>`:""}
      ${s?`<p>${s}</p>`:""}
    </div>
  </div>`}function be({iconName:e="search",title:t,text:s="",actions:a="",className:r=""}){return`<div class="empty-state ${r}">
    <span class="empty-icon">${y(e,24)}</span>
    <h3 class="empty-title">${n(t)}</h3>
    ${s?`<p class="empty-text">${s}</p>`:""}
    ${a?`<div class="empty-actions">${a}</div>`:""}
  </div>`}function J(e,t,s="\u8655\u7406\u4E2D\u2026"){e&&(t?(e.dataset.idleHtml||(e.dataset.idleHtml=e.innerHTML),e.disabled=!0,e.classList.add("is-loading"),e.innerHTML=`<span class="spinner" aria-hidden="true"></span><span>${n(s)}</span>`):(e.disabled=!1,e.classList.remove("is-loading"),e.dataset.idleHtml&&(e.innerHTML=e.dataset.idleHtml,delete e.dataset.idleHtml)))}function D(e,t="info",s=4200){let a=document.getElementById("toast-region");if(!a)return null;let r={info:"i",ok:"\u2713",warn:"!",danger:"\xD7"},i=document.createElement("div");i.className=`toast toast-${t}`,i.setAttribute("role",t==="danger"?"alert":"status"),i.innerHTML=`<span class="toast-mark" aria-hidden="true">${r[t]||"i"}</span>
    <div class="toast-body">${n(e)}</div>
    <button class="toast-close" type="button" aria-label="\u95DC\u9589\u901A\u77E5">\xD7</button>`;let o=()=>{i.isConnected&&(i.classList.add("is-leaving"),window.setTimeout(()=>i.remove(),190))};return i.querySelector(".toast-close").addEventListener("click",o),a.appendChild(i),s>0&&window.setTimeout(o,s),i}async function gt(e){try{return await navigator.clipboard.writeText(e),!0}catch{let s=document.createElement("textarea");s.value=e,s.setAttribute("readonly",""),s.style.position="fixed",s.style.opacity="0",document.body.appendChild(s),s.select();let a=!1;try{a=document.execCommand("copy")}catch{a=!1}return s.remove(),a}}function Oe(e,t,s="text/plain;charset=utf-8"){let a=new Blob([t],{type:s}),r=URL.createObjectURL(a),i=document.createElement("a");i.href=r,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(r),1e3)}var $s="judgment.theme",Qt="nvidia",ws=[{id:"vercel",name:"Vercel",description:"\u9ED1\u767D\u7CBE\u6E96 \xB7 Geist \xB7 \u5E7E\u4F55\u7559\u767D",swatches:["#171717","#0070f3","#fafafa"],metaColor:"#ffffff"},{id:"apple",name:"Apple",description:"SF Pro \xB7 \u5927\u5713\u89D2 \xB7 \u6C89\u6D78\u7559\u767D",swatches:["#1d1d1f","#0071e3","#f5f5f7"],metaColor:"#fbfbfd"},{id:"meta",name:"Meta",description:"Optimistic \xB7 \u660E\u4EAE\u85CD \xB7 \u81A0\u56CA\u5143\u4EF6",swatches:["#0064e0","#0091ff","#f1f4f7"],metaColor:"#ffffff"},{id:"nvidia",name:"NVIDIA",description:"GPU \u7DA0 \xB7 \u9ED1\u5E95 \xB7 \u92B3\u5229\u76F4\u89D2",swatches:["#76b900","#000000","#f7f7f7"],metaColor:"#000000"},{id:"ibm",name:"IBM",description:"Carbon \xB7 Plex Sans \xB7 \u4F01\u696D\u85CD",swatches:["#0f62fe","#161616","#f4f4f4"],metaColor:"#161616"},{id:"stripe",name:"Stripe",description:"\u7D2B\u975B\u6F38\u5C64 \xB7 \u7CBE\u5BC6\u91D1\u878D\u611F",swatches:["#635bff","#ea2261","#f6f9fc"],metaColor:"#ffffff"},{id:"linear",name:"Linear",description:"\u6DF1\u7A7A\u9ED1 \xB7 \u975B\u7D2B \xB7 \u6975\u7C21\u7DDA\u689D",swatches:["#5e6ad2","#010102","#e8e8ec"],metaColor:"#010102"},{id:"figma",name:"Figma",description:"\u591A\u5F69\u8272\u584A \xB7 \u5354\u4F5C\u611F \xB7 \u85CD\u8272\u7126\u9EDE",swatches:["#f24e1e","#a259ff","#0acf83"],metaColor:"#ffffff"},{id:"notion",name:"Notion",description:"\u6696\u767D\u7D19\u5F35 \xB7 \u896F\u7DDA\u6A19\u984C \xB7 \u77E5\u8B58\u5EAB",swatches:["#191918","#0075de","#f7f6f3"],metaColor:"#ffffff"},{id:"openai",name:"OpenAI",description:"\u6696\u7070\u756B\u5E03 \xB7 \u9ED1\u8272\u884C\u52D5 \xB7 \u7DA0\u8272\u8A0A\u865F",swatches:["#10a37f","#0d0d0d","#f9f9f7"],metaColor:"#f9f9f7"}],Jt=new Map(ws.map(e=>[e.id,e]));function ba(e){return Jt.has(e)}function ya(e){return Jt.get(e)||Jt.get(Qt)}function $a(){try{let e=window.localStorage.getItem($s);return ba(e)?e:Qt}catch{return Qt}}function ys(e,{persist:t=!0}={}){let s=ya(e);document.documentElement.dataset.theme=s.id;let a=document.getElementById("theme-color-meta");a&&a.setAttribute("content",s.metaColor);let r=document.getElementById("theme-label");r&&(r.textContent=s.name);let i=document.getElementById("theme-swatches");if(i&&(i.innerHTML=s.swatches.map(o=>`<i class="style-swatch" style="--swatch:${n(o)}"></i>`).join("")),document.querySelectorAll(".theme-option").forEach(o=>{let l=o.dataset.themeId===s.id;o.classList.toggle("is-active",l),o.setAttribute("aria-checked",l?"true":"false")}),t)try{window.localStorage.setItem($s,s.id)}catch{}return window.dispatchEvent(new CustomEvent("judgment:theme",{detail:{theme:s.id}})),s}function wa(e){let t=ws.map((s,a)=>{let r=s.swatches.map(i=>`<i style="--swatch:${n(i)}"></i>`).join("");return`<button class="theme-option" type="button" role="menuitemradio"
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
    </div>${t}`}function _s(){let e=document.getElementById("style-picker"),t=document.getElementById("style-trigger"),s=document.getElementById("style-menu");if(!e||!t||!s)return;wa(s),ys($a(),{persist:!1});let a=()=>Array.from(s.querySelectorAll(".theme-option")),r=()=>{s.hidden=!1,t.setAttribute("aria-expanded","true");let o=s.querySelector(".theme-option.is-active")||a()[0];o&&o.focus()},i=({restoreFocus:o=!1}={})=>{s.hidden||(s.hidden=!0,t.setAttribute("aria-expanded","false"),o&&t.focus())};t.addEventListener("click",()=>{s.hidden?r():i({restoreFocus:!0})}),t.addEventListener("keydown",o=>{(o.key==="ArrowDown"||o.key==="ArrowUp")&&(o.preventDefault(),r())}),s.addEventListener("click",o=>{let l=o.target.closest(".theme-option");l&&(ys(l.dataset.themeId),i({restoreFocus:!0}))}),s.addEventListener("keydown",o=>{let l=a(),v=l.indexOf(document.activeElement);if(o.key==="Escape"){o.preventDefault(),i({restoreFocus:!0});return}if(o.key==="ArrowDown"||o.key==="ArrowUp"){o.preventDefault();let b=o.key==="ArrowDown"?1:-1,$=l[(v+b+l.length)%l.length];$&&$.focus();return}if(o.key==="Home"||o.key==="End"){o.preventDefault();let b=o.key==="Home"?l[0]:l[l.length-1];b&&b.focus()}}),document.addEventListener("pointerdown",o=>{e.contains(o.target)||i()}),document.addEventListener("keydown",o=>{o.key==="Escape"&&i()})}var is={};ze(is,{render:()=>On});var _a="judgment-console";var Ne="query_history",He="settings";var Pe={history:[],settings:new Map,nextId:1},ht=null,ye=!("indexedDB"in window);function rt(e){return new Promise((t,s)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>s(e.error)})}function Je(e){return new Promise((t,s)=>{e.oncomplete=()=>t(),e.onerror=()=>s(e.error),e.onabort=()=>s(e.error||new Error("transaction aborted"))})}function Ve(){return ht||(ht=new Promise((e,t)=>{if(!("indexedDB"in window)){ye=!0,t(new Error("IndexedDB is unavailable"));return}let s;try{s=window.indexedDB.open(_a,1)}catch(a){ye=!0,t(a);return}s.onupgradeneeded=()=>{let a=s.result;if(!a.objectStoreNames.contains(Ne)){let r=a.createObjectStore(Ne,{keyPath:"id",autoIncrement:!0});r.createIndex("created_at","created_at"),r.createIndex("kind","kind")}a.objectStoreNames.contains(He)||a.createObjectStore(He,{keyPath:"key"})},s.onsuccess=()=>{let a=s.result;a.onversionchange=()=>a.close(),e(a)},s.onerror=()=>{ye=!0,t(s.error||new Error("Unable to open IndexedDB"))},s.onblocked=()=>{ye=!0,t(new Error("IndexedDB upgrade blocked by another tab"))}}),ht)}function ks(){return"indexedDB"in window}function xs(){return ye}function bt(){return ye?"memory":"indexeddb"}function ka(e){let t=e.created_at||new Date().toISOString();return{kind:e.kind||"query",title:String(e.title||""),detail:String(e.detail||""),payload:e.payload||{},created_at:t}}async function xa(){try{let t=(await Ve()).transaction(Ne,"readwrite"),s=t.objectStore(Ne),a=await rt(s.count());if(a>120){let r=a-120,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let v=i.result;if(!v||r<=0){o();return}v.delete(),r-=1,v.continue()},i.onerror=()=>l(i.error)})}await Je(t)}catch{ye=!0}}async function yt(e){let t=ka(e);try{let a=(await Ve()).transaction(Ne,"readwrite"),r=a.objectStore(Ne),i=await rt(r.add(t));return await Je(a),await xa(),i}catch{ye=!0;let a=Pe.nextId++;return Pe.history.push({id:a,...t}),Pe.history.length>120&&Pe.history.shift(),a}}async function $t({keyword:e="",limit:t=50}={}){let s=e.trim().toLowerCase();try{let r=(await Ve()).transaction(Ne,"readonly"),i=r.objectStore(Ne),o=await rt(i.getAll());return await Je(r),o.filter(l=>s?`${l.kind} ${l.title} ${l.detail}`.toLowerCase().includes(s):!0).sort((l,v)=>String(v.created_at).localeCompare(String(l.created_at))).slice(0,t)}catch{return ye=!0,Pe.history.filter(r=>s?`${r.kind} ${r.title} ${r.detail}`.toLowerCase().includes(s):!0).slice().sort((r,i)=>String(i.created_at).localeCompare(String(r.created_at))).slice(0,t)}}async function Ss(){try{let t=(await Ve()).transaction(Ne,"readwrite");t.objectStore(Ne).clear(),await Je(t)}catch{ye=!0}Pe.history=[]}async function As(e,t){let s={key:String(e),value:t,updated_at:new Date().toISOString()};try{let r=(await Ve()).transaction(He,"readwrite");return r.objectStore(He).put(s),await Je(r),s}catch{return ye=!0,Pe.settings.set(s.key,s),s}}async function it(e,t=null){try{let a=(await Ve()).transaction(He,"readonly"),r=a.objectStore(He),i=await rt(r.get(String(e)));return await Je(a),i?i.value:t}catch{ye=!0;let a=Pe.settings.get(String(e));return a?a.value:t}}async function Ls({keyword:e=""}={}){let t=e.trim().toLowerCase();try{let a=(await Ve()).transaction(He,"readonly"),r=a.objectStore(He),i=await rt(r.getAll());return await Je(a),i.filter(o=>t?`${o.key} ${JSON.stringify(o.value)}`.toLowerCase().includes(t):!0).sort((o,l)=>String(o.key).localeCompare(String(l.key)))}catch{return ye=!0,Array.from(Pe.settings.values()).filter(a=>t?`${a.key} ${JSON.stringify(a.value)}`.toLowerCase().includes(t):!0)}}function Ms(e){if(typeof e=="string")return e;try{return JSON.stringify(e)}catch{return String(e)}}var ns={};ze(ns,{render:()=>Ln,renderTestFlowPanel:()=>tt});var ss={};ze(ss,{exportCsv:()=>At,exportableResult:()=>Lt,render:()=>rn,renderReport:()=>kt,reportError:()=>St,reportLoading:()=>ot});var Rs=[10,25,50,100],Sa=500,Aa=["law_name","law_level","law_category","law_modified_date","article_count"],La=["jid","court_normalized","title","jdate","matched_laws","citation_count"],Ma={A:"\u689D\u6587",C:"\u7AE0\u7BC0"};function xt(e){return e?.label||e?.id||"\u8CC7\u6599\u5EAB"}function wt(e,t){let s={};for(let a of e.fields||[]){let r=a.type==="checkbox"?!1:a.type==="multiselect"?[]:"",i=a.default===void 0?r:a.default;s[a.key]=Array.isArray(i)?[...i]:i}return{values:s,page:1,pageSize:t,result:null,sort:null,columnFilters:{}}}function Ta(e,t){let s=e.visibleWhen;if(!s)return!0;for(let[a,r]of Object.entries(s))if(Array.isArray(r)&&!r.map(String).includes(String(t[a]??"")))return!1;return!0}function ts(e,t){return(e.fields||[]).filter(s=>Ta(s,t))}function qa(e,t){return`filter-${e.id}-${t}`}function We(e){return e==null?"":n(String(e))}function Vt(e,t,s){let a=s[t.key],r=qa(e,t.key),i=t.help?`<span class="field-help">${n(t.help)}</span>`:"";if(t.type==="checkbox")return`<div class="field">
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
    </label>`;if(t.type==="select"){let l=(t.options||[]).map(v=>`<option value="${We(v.value)}" ${String(v.value)===String(a??"")?"selected":""}>${n(v.label??v.value)}</option>`).join("");return`<div class="field">${o}
      <select class="select" id="${r}" name="${n(t.key)}">${l}</select>
      ${i}
    </div>`}if(t.type==="multiselect"){let l=new Set((Array.isArray(a)?a:[]).map(String)),v=(t.options||[]).map(b=>`<label class="multi-option">
          <input type="checkbox" name="${n(t.key)}" value="${We(b.value)}" ${l.has(String(b.value))?"checked":""} />
          <span>${n(b.label??b.value)}</span>
        </label>`).join("");return`<div class="field">${o}
      <div class="multi-select">${v}</div>
      ${i}
    </div>`}return t.type==="number"?`<div class="field">${o}
      <input class="input" type="number" id="${r}" name="${n(t.key)}"
        value="${We(a)}"
        ${t.min!==void 0?`min="${t.min}"`:""}
        ${t.max!==void 0?`max="${t.max}"`:""}
        step="${t.step??1}"
        placeholder="${We(t.placeholder||"")}" />
      ${i}
    </div>`:t.type==="date"?`<div class="field">${o}
      <input class="input" type="date" id="${r}" name="${n(t.key)}"
        value="${We(a)}" />
      ${i}
    </div>`:`<div class="field">${o}
    <input class="input" type="text" id="${r}" name="${n(t.key)}"
      value="${We(a)}"
      placeholder="${We(t.placeholder||"")}" />
    ${i}
  </div>`}function Wt(e,t,{focusTable:s=!1}={}){let a=ts(e,t.values),r=[];for(let i=0;i<a.length;i+=1){let o=a[i],l=a[i+1];o.type==="date"&&l&&l.type==="date"?(r.push(`<div class="field-row">${Vt(e,o,t.values)}${Vt(e,l,t.values)}</div>`),i+=1):r.push(Vt(e,o,t.values))}return`<form id="data-filter-form" autocomplete="off">
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
  </form>`}function _t(e,t,s){let a={...s.values};for(let r of ts(t,a))if(r.type==="checkbox"){let i=e.querySelector(`[name="${r.key}"]`);a[r.key]=!!i?.checked}else if(r.type==="multiselect")a[r.key]=Array.from(e.querySelectorAll(`[name="${r.key}"]:checked`)).map(i=>i.value);else{let i=e.querySelector(`[name="${r.key}"]`);a[r.key]=i?i.value:""}return a}function Is(e,t){let s={};for(let a of ts(e,t.values)){let r=t.values[a.key];a.type==="checkbox"?s[a.key]=!!r:a.type==="multiselect"?s[a.key]=Array.isArray(r)?r:[]:a.type==="number"?s[a.key]=r===""||r===null?"":Number(r):s[a.key]=r??""}return s}function Kt(e,t){let s=Is(e,t);return(e.id==="postgres"||e.id==="parquet")&&t.sort?.key&&(s.sort=`${t.sort.key}:${t.sort.direction}`,s.schema_preview=!0),t.columnFilters&&Object.keys(t.columnFilters).length>0&&(s.column_filters=t.columnFilters),s}function Ts(e){if(e.status==="operational")return"";let t=e.status==="unavailable"?"danger":e.status==="degraded"?"warn":"info";return`<div class="sidebar-notice">${V({tone:t,title:`${xt(e)} ${Fe(e.status).label}`,text:n(e.detail||"\u76EE\u524D\u7121\u6CD5\u4F7F\u7528\u9019\u500B\u8CC7\u6599\u4F86\u6E90\u3002")})}</div>`}function Ea(e,t){return`<div class="db-options" role="radiogroup" aria-label="\u9078\u64C7\u8CC7\u6599\u5EAB">
    ${e.map(s=>{let a=Fe(s.status);return`<label class="db-option">
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
  </div>`}function ja(e){return`<div class="sidebar-view-switch" role="tablist" aria-label="\u67E5\u8A62\u6216 schema">
    <button class="sidebar-view-button ${e==="query"?"is-active":""}"
      type="button" role="tab" aria-selected="${e==="query"}"
      data-action="sidebar-view" data-view="query">${y("search",13)}<span>\u67E5\u8A62</span></button>
    <button class="sidebar-view-button ${e==="schema"?"is-active":""}"
      type="button" role="tab" aria-selected="${e==="schema"}"
      data-action="sidebar-view" data-view="schema">${y("table",13)}<span>Schema</span></button>
  </div>`}function Yt(e,t,s=""){let a=Array.isArray(e.tables)?e.tables:[],r=a.length?a.map(i=>`<button class="schema-item ${String(i.id)===String(s||"")?"is-selected":""}" type="button"
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
  </div>`}function qs(e,t){return`<div class="category-options" role="radiogroup" aria-label="\u8CC7\u6599\u985E\u578B">
    ${e.map(s=>{let a=s.id===t,r=s.id==="judgment"&&s.count!==void 0?`${p(s.count)} \u7B46\u5DF2\u7BE9\u9078\u5224\u6C7A`:s.description||"";return`<label class="category-option${a?" is-selected":""}">
          <input type="radio" name="category" value="${n(s.id)}" ${a?"checked":""} />
          <span class="category-option-body">
            <span class="category-option-label">${n(s.label)}</span>
            <span class="category-option-desc">${n(r)}</span>
          </span>
        </label>`}).join("")}
  </div>`}function Es(e){return{postgres:"PostgreSQL \u67E5\u8A62\u4F7F\u7528\u53C3\u6578\u5316\u689D\u4EF6\u8207\u5206\u9801\uFF0C\u50C5\u8B80\u53D6\u8CC7\u6599\u3002",parquet:"Parquet \u67E5\u8A62\u76F4\u63A5\u6383\u63CF\u76EE\u524D\u6700\u65B0\u7684\u5FEB\u7167\uFF1B\u52FE\u9078\u539F\u59CB JSON \u6703\u589E\u52A0\u56DE\u50B3\u91CF\u8207\u6E32\u67D3\u6642\u9593\u3002",qdrant:"Qdrant \u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\uFF1B\u9700\u8981\u5148\u5B8C\u6210\u5411\u91CF\u7D22\u5F15\u3002\u6AA2\u7D22\u7D50\u679C\u53EA\u5305\u542B\u7D22\u5F15\u4E2D\u5BE6\u969B\u5B58\u5728\u7684\u5224\u6C7A\uFF0C\u4E0D\u6703\u7522\u751F\u865B\u69CB\u8CC7\u6599\u3002",indexeddb:"IndexedDB \u53EA\u5728\u9019\u500B\u700F\u89BD\u5668\u5167\u67E5\u8A62\uFF0C\u4E0D\u6703\u7D93\u904E\u4F3A\u670D\u5668\uFF1B\u6E05\u9664\u7DB2\u7AD9\u8CC7\u6599\u5F8C\u7D00\u9304\u6703\u6D88\u5931\u3002"}[e.id]||n(e.detail||"")}function Na(e){return`<div class="report-empty">
    ${be({iconName:"table",title:"\u67E5\u8A62\u5831\u8868\u6703\u986F\u793A\u5728\u9019\u88E1",text:n({postgres:"\u9078\u64C7\u8CC7\u6599\u8868\u8207 metadata \u689D\u4EF6\uFF0C\u57F7\u884C\u5F8C\u6703\u7522\u751F SQL\u3001\u6458\u8981\u3001\u5206\u5E03\u8207\u8CC7\u6599\u5217\u3002",parquet:"\u9078\u64C7\u8CC7\u6599\u96C6\u8207\u56DE\u50B3\u6B04\u4F4D\uFF0C\u76F4\u63A5\u6383\u63CF\u539F\u59CB Parquet\u3002",qdrant:"\u8F38\u5165\u8A9E\u610F\u67E5\u8A62\u5F8C\uFF0C\u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5DF2\u5EFA\u7ACB\u5411\u91CF\u7D22\u5F15\u7684\u5224\u6C7A\uFF1B\u672A\u7D22\u5F15\u6642\u6703\u660E\u78BA\u986F\u793A\u72C0\u614B\u3002",indexeddb:"\u67E5\u8A62\u5B58\u5728\u9019\u500B\u700F\u89BD\u5668\u7684\u63D0\u554F\u7D00\u9304\u8207\u8A2D\u5B9A\uFF0C\u4E0D\u9700\u8981\u4F3A\u670D\u5668\u3002"}[e.id]||"\u8A2D\u5B9A\u689D\u4EF6\u5F8C\u57F7\u884C\u67E5\u8A62\u3002")})}
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
        <div class="report-title">${n(xt(e))} \u67E5\u8A62\u4E2D</div>
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
  </div>`}function St(e,t){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${n(xt(t))} \u67E5\u8A62\u5931\u6557</div>
        <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${V({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u67E5\u8A62\u7D50\u679C",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="retry">
          ${y("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function Pa(e){if(!e.length)return'<div class="report-empty-inline">\u9019\u6B21\u67E5\u8A62\u6C92\u6709\u53EF\u5448\u73FE\u7684\u5206\u5E03\u8CC7\u6599\u3002</div>';let t=Math.max(...e.map(s=>Number(s.value)||0),1);return`<div class="distribution">
    ${e.map(s=>{let a=Number(s.value)||0,r=Math.max(1.5,a/t*100);return`<div class="dist-row">
          <span class="dist-label" title="${n(s.label||"\u672A\u5206\u985E")}">${n(s.label||"\u672A\u5206\u985E")}</span>
          <span class="dist-track"><span class="dist-bar" style="width:${r.toFixed(1)}%"></span></span>
          <span class="dist-value">${p(a)}</span>
        </div>`}).join("")}
  </div>`}function Bs(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="law_documents"}function Ca(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="judgment_documents"}function Ra(e){return e&&e.database==="qdrant"&&String(e.table||"").startsWith("judgment")}function Ia(e){let t=e._jid||e.jid;return t?`<button class="law-link judgment-link" type="button" data-action="open-judgment"
    data-jid="${n(String(t))}"
    title="\u6AA2\u8996\u300C${n(String(t))}\u300D\u7684\u5224\u6C7A\u539F\u6587">${n(String(t))}${y("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}var Ba={jid:"jid",court:"court",court_normalized:"court",title:"title",jdate:"jdate",matched_laws:"matched_laws",citation_count:"citation_count",full_text_length:"full_text_length"};function Da(e,t,s,a=!1,r=!0,i=!1){let o=a?e.key:e.label||e.key,l=r?t?Ba[e.key]||e.key:i?e.key:null:null;if(!l)return`<th scope="col">${n(o)}</th>`;let v=s?.key===l,b=v?s.direction:null,$=b==="asc"?"ascending":b==="desc"?"descending":"none",g=b==="asc"?"\u2191":b==="desc"?"\u2193":"\u2195";return`<th scope="col" aria-sort="${$}">
    <button class="table-sort${v?" is-active":""}" type="button"
      data-action="sort-column" data-sort-key="${n(l)}"
      title="\u4F9D${n(o)}\u6392\u5E8F">
      <span>${n(o)}</span>
      <span class="table-sort-icon" aria-hidden="true">${g}</span>
    </button>
  </th>`}function Fa(e,t){if(!Bs(e)||!t)return null;let s=t._law_key||t.law_name;if(!s)return null;let a=e.meta?.dataset,r=t._law_source_type||(a&&a!=="all"?a:"");return{lawKey:String(s),sourceType:String(r||""),lawName:String(t.law_name||"")}}function Oa(e,t,s){let a=e[t.key];return a==null||a===""?"\u2014":`<button class="law-link" type="button" data-action="open-law"
    data-law-key="${n(s.lawKey)}"
    data-law-source="${n(s.sourceType)}"
    data-law-name="${n(s.lawName)}"
    title="\u6AA2\u8996\u300C${n(String(a))}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${n(String(a))}${y("chevronRight",12,"law-link-icon")}</button>`}function Ds(e,{useColumnKeys:t=!1,sortable:s=!0,sortableAll:a=!1,searchValues:r=null,compact:i=!1}={}){let o=Array.isArray(e.columns)?e.columns:[],l=Array.isArray(e.rows)?e.rows:[],v=(e.page-1)*e.page_size,b=Bs(e),$=Ca(e),g=Ra(e),f=e.meta?.sort||null,_=r?`<tr class="schema-search-row">
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
      <span class="muted" style="font-size:10px">${p(l.length)} rows \xB7 \u7B2C ${e.page} \u9801${b?" \xB7 \u9EDE\u9078\u6CD5\u898F\u540D\u7A31\u53EF\u6AA2\u8996\u5B8C\u6574\u689D\u6587":$?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u6B04\u4F4D\u6A19\u984C\u53EF\u6392\u5E8F":g?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u4F9D\u76F8\u4F3C\u5EA6\u6392\u5E8F":""}</span>
    </div>
    <div class="table-wrap">
      <table class="data-table${i?" is-compact":""}">
        <thead>${_}<tr>
          <th scope="col" class="cell-index-head">#</th>
          ${o.map(h=>Da(h,$,f,t,s,a)).join("")}
        </tr></thead>
        <tbody>
          ${l.map((h,x)=>`<tr>
                <td class="cell-mono cell-empty cell-index">${v+x+1}</td>
                ${o.map(C=>{if(($||g)&&C.key==="jid")return`<td class="cell-jid">${Ia(h)}</td>`;let j=b&&C.key==="law_name"?Fa(e,h):null;if(j)return`<td>${Oa(h,C,j)}</td>`;let M={date:"cell-date",datetime:"cell-datetime",duration:"cell-duration",number:"cell-number"}[C.type];return`<td${M?` class="${M}"`:""}>${ft(h[C.key],C.type||"text")}</td>`}).join("")}
              </tr>`).join("")}
        </tbody>
      </table>
    </div>`:`<div class="report-table-head">
        <span class="report-section-title">\u8CC7\u6599\u5217</span>
        <span class="muted" style="font-size:10px">0 rows</span>
      </div>
      ${be({iconName:"filter",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u8CC7\u6599",text:"\u653E\u5BEC\u65E5\u671F\u5340\u9593\u3001\u964D\u4F4E\u689D\u6587\u6578\u4E0B\u9650\uFF0C\u6216\u6E05\u9664\u95DC\u9375\u5B57\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}`:`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">\u6B64\u8CC7\u6599\u4F86\u6E90\u6C92\u6709\u8868\u683C\u6B04\u4F4D</span>
    </div>`}function Ha(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,r=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${r} \u9801 \xB7
      \u986F\u793A ${p(i)}\u2013${p(o)} / ${p(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Rs.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${y("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=r?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${y("chevronRight",13)}</button>
    </div>
  </div>`}function Fs(e){return!Array.isArray(e)||!e.length?"":`<div class="warnings">${e.map(t=>`<div class="warning-line">${n(t)}</div>`).join("")}</div>`}function kt(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.columns)?e.columns:[],a=Array.isArray(e.summary)?e.summary:[],r=Array.isArray(e.distribution)?e.distribution:[],i=Number(e.total)||0,o=e.query_text||"",l=e.database||"",v=e.status||"ok",b=e.meta?.table_label||e.table||e.label||"query result";return`<div class="report-card" data-database="${n(l)}">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT \xB7 ${n(String(l).toUpperCase())}</div>
        <div class="report-title">
          ${n(e.label||l)}
          ${Y(v)}
          <span class="chip">${n(b)}</span>
        </div>
        <div class="report-sub">
          ${p(i)} \u7B46\u7B26\u5408 \xB7
          ${F(e.duration_ms)} \xB7
          ${n(String(l).toUpperCase())} / ${n(String(e.table||"\u2014"))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${y("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${y("file",14)}<span>JSON</span></button>
      </div>
    </div>

    ${e.message?`<div class="report-alert">${V({tone:v==="not_configured"?"info":v==="danger"?"danger":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n(e.message)})}</div>`:""}

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
        ${Pa(r)}
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
        ${Fs(e.warnings)}
      </div>
    </div>

    ${s.length||t.length?Ds(e,{compact:!0,sortableAll:!0,searchValues:e.meta?.searchable?e.meta.column_filters||{}:null}):""}
    ${i||s.length?Ha({...e,total:i,page:Number(e.page)||1,page_size:Number(e.page_size)||25}):""}
  </div>`}function js(e){return`<div class="report-card schema-preview">
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
  </div>`}function Xt(e,t,{columnFilters:s={},searchEnabled:a=!1}={}){let r=Array.isArray(e.columns)?e.columns:[],i=Array.isArray(e.rows)?e.rows:[],o=e.message?`<div class="report-alert">${V({tone:e.status==="ok"?"info":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n(e.message)})}</div>`:"";return`<div class="report-card schema-preview">
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
    ${Ds({...e,page:1,page_size:10},{useColumnKeys:!0,sortable:!0,sortableAll:!0,searchValues:a?s:null})}
    ${Fs(e.warnings)}
    <div class="schema-preview-footer">
      <span>\u9810\u89BD\u524D ${p(i.length)} \u7B46</span>
      <strong>\u5171 ${p(e.total)} \u7B46</strong>
    </div>
  </div>`}function Ns(e,t){return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW</div>
        <div class="report-title">${n(t||"\u8CC7\u6599\u8868")}</div>
        <div class="report-sub">\u7121\u6CD5\u8B80\u53D6\u8CC7\u6599\u8868\u9810\u89BD\u3002</div>
      </div>
    </div>
    ${V({tone:"danger",title:"\u8B80\u53D6\u5931\u6557",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
  </div>`}function Ua(e){return`<div class="report-empty">
    ${be({iconName:"table",title:"\u9078\u64C7\u8CC7\u6599\u8868\u9810\u89BD",text:`\u5F9E\u5DE6\u5074 ${xt(e)} \u7684 Schema \u6E05\u55AE\u9EDE\u9078\u8CC7\u6599\u8868\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6B04\u4F4D\u540D\u7A31\u3001\u524D 10 \u7B46\u8CC7\u6599\u8207\u7E3D\u7B46\u6578\u3002`})}
  </div>`}function Zt(e){return e.is_current===!0?Y("ok","\u73FE\u884C"):e.law_abandon_note?Y("empty","\u5DF2\u5EE2\u6B62"):e.is_current===!1?Y("empty","\u6B77\u53F2\u7248\u672C"):Y("not_configured","\u72C0\u614B\u672A\u63D0\u4F9B")}function Z(e,t){return`<div class="law-meta-item">
    <div class="law-meta-label">${n(e)}</div>
    <div class="law-meta-value">${t||"\u2014"}</div>
  </div>`}function Ke(e){return e?je(e):"\u2014"}function za(e){return e?.meta?.metadata_source==="postgresql"?"PostgreSQL metadata":e?.meta?.metadata_source==="parquet"?"Parquet snapshot":"\u2014"}function es(e,t){return t?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">${n(e)}</span>
    </div>
    <div class="law-text-block">${n(String(t).trim())}</div>
  </div>`:""}function Ga(e,t,{open:s=!1}={}){return t?`<details class="report-section law-disclosure" data-law-history ${s?"open":""}>
    <summary class="law-disclosure-summary">
      <span class="report-section-title">${n(e)}</span>
      <span class="law-disclosure-hint">\u9810\u8A2D\u6536\u5408 \xB7 \u9EDE\u64CA\u5C55\u958B</span>
      ${y("chevronDown",14,"law-disclosure-chevron")}
    </summary>
    <div class="law-text-block">${n(String(t).trim())}</div>
  </details>`:""}function Qa(e){let t=Array.isArray(e)?e:[],s=t.map(a=>{let r=a?.name||a?.url||"";return r?a.url?`<a class="law-attachment" href="${n(a.url)}" target="_blank" rel="noopener noreferrer">
          ${y("file",12)}<span>${n(r)}</span>${y("external",11)}
        </a>`:`<span class="law-attachment">${y("file",12)}<span>${n(r)}</span></span>`:""}).filter(Boolean).join("");return s?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">\u9644\u4EF6</span>
      <span class="muted">${p(t.length)}</span>
    </div>
    <div class="law-attachment-list">${s}</div>
  </div>`:""}function Os(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function Ja(e){let t=Array.isArray(e.articles)?e.articles:[],s=t.filter(o=>o.article_type==="C").length,a=t.length-s,r=s?`${p(a)} \u689D \xB7 ${p(s)} \u7AE0\u7BC0`:`${p(a)} \u689D`,i=t.map(o=>{let l=String(o.article_content||"").trim();if(!l)return"";if(o.article_type==="C")return`<div class="law-chapter">${n(l)}</div>`;let v=Ma[o.article_type]||o.article_type;return`<article class="law-article"
        data-article-no="${n(Os(o.article_no))}">
        <div class="law-article-head">
          <span class="law-article-no">${n(o.article_no||"\u689D\u6587")}</span>
          ${v&&v!=="\u689D\u6587"?`<span class="chip">${n(v)}</span>`:""}
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
  </div>`}function Va(){return`<div class="law-jump-float">
    <input class="input law-article-jump-input law-jump-input"
      id="law-article-jump-float" type="text" inputmode="numeric"
      autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
    <button class="btn btn-secondary btn-sm" type="button"
      data-action="jump-article" data-jump-input="law-article-jump-float">\u8DF3\u81F3</button>
  </div>`}function et(){return`<button class="btn btn-secondary btn-sm" type="button" data-action="back-to-results">
    ${y("chevronLeft",14)}<span>\u8FD4\u56DE\u67E5\u8A62\u7D50\u679C</span>
  </button>`}function Wa(e){return`<div class="law-report">
    <div class="law-report-topbar">
      ${et()}
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
  </div>`}function Ka(e,t){return`<div class="law-report">
    <div class="law-report-topbar">
      ${et()}
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
        ${V({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function Ya(e){let t=Array.isArray(e.versions)?e.versions:[];if(t.length<1)return"";let s=e.selected_version_id??"";return`<label class="law-version-select">
    <span>\u689D\u6587\u7248\u672C</span>
    <select class="select" data-action="select-law-version" aria-label="\u9078\u64C7\u6CD5\u898F\u689D\u6587\u7248\u672C">
      ${t.map(a=>{let r=String(a.update_date||"").match(/\d{4}\/\d{1,2}\/\d{1,2}/)?.[0]||"",i=[`#${a.version_id}`,a.is_current?"\u76EE\u524D":"\u6B77\u53F2",r,a.article_count_for_law?`${p(a.article_count_for_law)} \u7B46`:"\u7121\u689D\u6587\u5FEB\u7167"].filter(Boolean).join(" \xB7 ");return`<option value="${n(a.version_id)}" ${String(a.version_id)===String(s)?"selected":""}>${n(i)}</option>`}).join("")}
    </select>
  </label>`}function Xa(e){let t=e.change_summary||{},s=Object.values(t).reduce((o,l)=>o+(Number(l)||0),0),a=Array.isArray(e.changes)?e.changes:[];if(!e.changes_available&&!s)return"";let r={added:"\u65B0\u589E",modified:"\u4FEE\u6539",removed:"\u79FB\u9664"},i=["added","modified","removed"].map(o=>`${r[o]} ${p(t[o]||0)}`).join(" \xB7 ");return`<details class="report-section law-version-changes">
    <summary>
      <span class="report-section-title">\u7248\u672C\u8B8A\u66F4</span>
      <span class="muted">${n(i)}</span>
    </summary>
    <div class="law-version-change-list">
      ${a.length?a.slice(0,20).map(o=>{let l=o.change_type==="added"?"badge-ok":o.change_type==="removed"?"badge-danger":"badge-warn",v=o.before_content?`<details><summary>\u8B8A\u66F4\u524D</summary><pre>${n(o.before_content)}</pre></details>`:"",b=o.after_content?`<details><summary>\u8B8A\u66F4\u5F8C</summary><pre>${n(o.after_content)}</pre></details>`:"";return`<div class="law-version-change">
                  <div class="law-version-change-head">
                    <span class="badge ${l}">${n(r[o.change_type]||o.change_type)}</span>
                    <strong>${n(o.article_no||o.article_key)}</strong>
                  </div>
                  ${v}${b}
                </div>`}).join(""):'<div class="report-empty-inline">\u6B64\u7248\u672C\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u8B8A\u66F4\u3002</div>'}
      ${e.changes_truncated?'<div class="report-empty-inline">\u50C5\u986F\u793A\u524D 20 \u7B46\u8B8A\u66F4\uFF1BAPI \u56DE\u50B3\u4E0A\u9650 200 \u7B46\u3002</div>':""}
    </div>
  </details>`}function Za(e,{database:t="",lawPage:s=1,historyOpen:a=!1}={}){let r=Array.isArray(e.warnings)?e.warnings:[],i=e.law_name||e.law_key||"\u6CD5\u898F",o=(Array.isArray(e.articles)?e.articles:[]).filter(x=>x.article_type!=="C").length,l=za(e),v=e.meta?.articles_source==="postgresql"?"PostgreSQL \u689D\u6587\u7248\u672C":e.meta?.articles_source==="parquet"?"Parquet \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",b=e.meta?.snapshot||"",$=e.meta?.articles_source==="postgresql"&&e.selected_version_id!==null&&e.selected_version_id!==void 0?`\u689D\u6587\u7248\u672C #${e.selected_version_id}`:"",g=[l,v,$,b].filter(Boolean).join(" \xB7 "),f=e.source_type==="law"?"\u6CD5\u5F8B":e.source_type==="order"?"\u547D\u4EE4":e.source_type||"\u2014",_=e.version||{},h=[Z("\u6CD5\u898F\u4F4D\u968E",n(e.law_level||"\u2014")),Z("\u6CD5\u898F\u985E\u5225",n(e.law_category||"\u2014")),Z("\u7570\u52D5\u65E5\u671F",Ke(e.law_modified_date)),Z("\u751F\u6548\u65E5\u671F",Ke(e.law_effective_date)),Z("\u689D\u6587\u6578",p(e.article_count)),Z("\u8CC7\u6599\u72C0\u614B",Zt(e)),Z("\u82F1\u8B6F\u540D\u7A31",n(e.eng_law_name||"\u2014")),Z("\u6CD5\u898F\u8B58\u5225",`<span class="mono">${n(e.law_key||"\u2014")}</span>`)];return _.first_seen_version_id!==null&&_.first_seen_version_id!==void 0&&h.push(Z("\u9996\u6B21\u6536\u9304\u7248\u672C",`#${n(_.first_seen_version_id)}`)),_.last_seen_version_id!==null&&_.last_seen_version_id!==void 0&&h.push(Z("\u6700\u5F8C\u6536\u9304\u7248\u672C",`#${n(_.last_seen_version_id)}`)),_.last_seen_at&&h.push(Z("\u6700\u5F8C\u6536\u9304\u6642\u9593",n(ae(_.last_seen_at)))),_.selected_version_id!==null&&_.selected_version_id!==void 0&&h.push(Z("\u689D\u6587\u7248\u672C",`#${n(_.selected_version_id)} \xB7 ${e.meta?.selected_version_is_current?"\u76EE\u524D":"\u6B77\u53F2"}`)),`<div class="law-report">
    <div class="law-report-topbar">
      ${et()}
      <span class="law-report-origin" title="${n(g)}">${n(g)}</span>
    </div>
    <div class="report-card law-report-card" data-database="${n(t)}">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT \xB7 ${n(String(t||l).toUpperCase())}</div>
          <div class="report-title">
            ${n(i)}
            ${Zt(e)}
            <span class="chip">${n(f)}</span>
          </div>
          <div class="report-sub">
            ${n([e.law_level,e.law_category].filter(Boolean).join(" \xB7 ")||"\u2014")} \xB7 ${p(e.article_count)} \u689D \xB7 \u7570\u52D5 ${Ke(e.law_modified_date)}
          </div>
        </div>
        <div class="report-actions">
          ${Ya(e)}
          ${e.law_url?`<a class="btn btn-secondary btn-sm" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">${y("external",14)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:""}
        </div>
      </div>

      ${r.length?`<div class="report-alert">${V({tone:e.status==="degraded"?"warn":"info",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r.map(x=>n(x)).join("<br />")})}</div>`:""}

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u689D\u6587\u6578</div>
          <div class="summary-value">${p(e.article_count)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u7570\u52D5\u65E5\u671F</div>
          <div class="summary-value">${Ke(e.law_modified_date)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u6CD5\u898F\u4F4D\u968E</div>
          <div class="summary-value">${n(e.law_level||"\u2014")}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u76EE\u524D\u72C0\u614B</div>
          <div class="summary-value">${Zt(e)}</div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u6CD5\u898F\u8CC7\u8A0A</span>
          <span class="muted" style="font-size:9.5px">${n(l)}</span>
        </div>
        <div class="law-meta-grid">${h.join("")}</div>
      </div>

      ${Xa(e)}
      ${es("\u6CD5\u898F\u524D\u8A00",e.law_foreword)}
      ${Ga("\u6CD5\u898F\u6CBF\u9769",e.law_histories,{open:a})}
      ${es("\u751F\u6548\u8AAA\u660E",e.law_effective_note)}
      ${es("\u5EE2\u6B62\u8AAA\u660E",e.law_abandon_note)}
      ${Qa(e.attachments)}
      ${Ja(e)}
    </div>
    ${o>100?Va():""}
  </div>`}function en(e){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${et()}
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
  </div>`}function tn(e,t){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${et()}
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
        ${V({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function sn(e){let t=new Map;for(let s of Array.isArray(e.citations)?e.citations:[]){let a=String(s.law_name||"").trim();if(!a)continue;t.has(a)||t.set(a,new Set);let r=String(s.article_no||"").trim();r&&t.get(a).add(r)}return t.size?`<div class="judgment-citation-groups">
    ${[...t.entries()].map(([s,a])=>`<div class="judgment-citation-group">
          <span class="judgment-citation-law">${n(s)}</span>
          <span class="judgment-citation-articles">${[...a].map(r=>n(r)).join("\u3001")||"\u2014"}</span>
        </div>`).join("")}
  </div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5F15\u7528\u660E\u7D30\u3002</div>'}function an(e,{database:t="postgres"}={}){let s=Array.isArray(e.matched_laws)?e.matched_laws:[],a=e.title||e.jid||"\u5224\u6C7A",r=String(e.full_text||""),i=Number(e.full_text_length)||r.length||0,o=["PostgreSQL \u5224\u6C7A\u6587\u4EF6",e.source_archive].filter(Boolean).join(" \xB7 "),l=[Z("\u6848\u865F",n(e.jid||"\u2014")),Z("\u5E74\u5EA6",n(e.jyear||"\u2014")),Z("\u5B57\u5225",n(e.jcase||"\u2014")),Z("\u865F\u78BC",n(e.jno||"\u2014")),Z("\u6CD5\u9662",n(e.court||"\u2014")),Z("\u6848\u7531",n(e.title||"\u2014")),Z("\u88C1\u5224\u65E5\u671F",Ke(e.jdate)),Z("\u4F86\u6E90\u58D3\u7E2E\u6A94",n(e.source_archive||"\u2014")),Z("\u5168\u6587\u9577\u5EA6",`${p(i)} \u5B57`),Z("\u5F15\u7528\u6578",p(e.citation_count))];return e.import_run_id!==null&&e.import_run_id!==void 0&&l.push(Z("\u532F\u5165 Run",`#${n(e.import_run_id)}`)),`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${et()}
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
            ${n(e.court||"\u2014")} \xB7 ${Ke(e.jdate)} \xB7
            ${p(i)} \u5B57
          </div>
        </div>
        <div class="report-actions">
          ${e.pdf_url?`<a class="btn btn-secondary btn-sm" href="${n(e.pdf_url)}" target="_blank" rel="noopener noreferrer">${y("external",14)}<span>PDF</span></a>`:""}
        </div>
      </div>

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u88C1\u5224\u65E5\u671F</div>
          <div class="summary-value">${Ke(e.jdate)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u6CD5\u9662</div>
          <div class="summary-value summary-value-text">${n(e.court||"\u2014")}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u547D\u4E2D\u6CD5\u898F</div>
          <div class="summary-value">${p(s.length)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u5F15\u7528\u6578</div>
          <div class="summary-value">${p(e.citation_count)}</div>
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
          <span class="muted">${p(s.length)} \u6CD5\u898F \xB7 ${p(e.citation_count)} \u5F15\u7528</span>
        </div>
        ${sn(e)}
      </div>

      <div class="report-section judgment-text-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5224\u6C7A\u539F\u6587</span>
          <span class="muted">${p(i)} \u5B57</span>
        </div>
        ${r?`<div class="judgment-fulltext">${n(r)}</div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5168\u6587\u3002</div>'}
      </div>
    </div>
  </div>`}function Ps(e){return`"${(e==null?"":typeof e=="object"?JSON.stringify(e):String(e)).replace(/"/g,'""')}"`}function At(e){let t=e.columns||[],s=e.rows||[],a=[["#",...t.map(i=>i.label||i.key)].map(Ps).join(",")],r=((Number(e.page)||1)-1)*(Number(e.page_size)||25);return s.forEach((i,o)=>{a.push([r+o+1,...t.map(l=>i[l.key])].map(Ps).join(","))}),`\uFEFF${a.join(`\r
`)}`}function Lt(e){return{...e,rows:(e.rows||[]).map(t=>{let s={};for(let[a,r]of Object.entries(t))a.startsWith("_")||(s[a]=r);return s})}}function nn(e){return e==="rag"?"RAG \u63D0\u554F":e==="data"?"\u8CC7\u6599\u67E5\u8A62":e||"\u5176\u4ED6"}async function Cs(e,t){let s=performance.now(),a=Is(e,t),r=String(a.store||"query_history"),i=String(a.keyword||""),o=t.page,l=t.pageSize,v=[],b=[],$=[],g=[];if(r==="settings"){b=(await Ls({keyword:i})).map(M=>({key:M.key,value:Ms(M.value),updated_at:M.updated_at})),$=[{key:"key",label:"\u8A2D\u5B9A\u9375",type:"mono"},{key:"value",label:"\u503C",type:"longtext"},{key:"updated_at",label:"\u66F4\u65B0\u6642\u9593",type:"datetime"}];let S=new Map;b.forEach(M=>{let E=String(M.key||"").split(".")[0]||"\u5176\u4ED6";S.set(E,(S.get(E)||0)+1)}),g=Array.from(S.entries()).map(([M,E])=>({label:M,value:E})).sort((M,E)=>E.value-M.value)}else{b=(await $t({keyword:i,limit:Sa})).map(M=>({kind:nn(M.kind),title:M.title,detail:M.detail,created_at:M.created_at})),$=[{key:"kind",label:"\u985E\u578B",type:"text"},{key:"title",label:"\u67E5\u8A62\u5167\u5BB9",type:"longtext"},{key:"detail",label:"\u6458\u8981",type:"longtext"},{key:"created_at",label:"\u6642\u9593",type:"datetime"}];let S=new Map;b.forEach(M=>S.set(M.kind,(S.get(M.kind)||0)+1)),g=Array.from(S.entries()).map(([M,E])=>({label:M,value:E})).sort((M,E)=>E.value-M.value)}let f=b.length,_=(o-1)*l,h=b.slice(_,_+l),x=Math.round(performance.now()-s),C=xs();return C&&v.push("IndexedDB \u7121\u6CD5\u4F7F\u7528\uFF0C\u8CC7\u6599\u66AB\u5B58\u5728\u8A18\u61B6\u9AD4\uFF0C\u91CD\u65B0\u6574\u7406\u5F8C\u6703\u6D88\u5931\u3002"),{database:"indexeddb",label:"IndexedDB",status:C?"degraded":"ok",message:C?"\u700F\u89BD\u5668\u4E0D\u5141\u8A31\u4F7F\u7528 IndexedDB\uFF0C\u672C\u9801\u6539\u7528\u8A18\u61B6\u9AD4\u66AB\u5B58\u3002":null,table:r,columns:$,rows:h,total:f,page:o,page_size:l,duration_ms:x,summary:[{label:"\u7B26\u5408\u7B46\u6578",value:String(f)},{label:"\u76EE\u524D\u9801\u9762",value:`${h.length} \u7B46`},{label:"\u5132\u5B58\u6A21\u5F0F",value:bt()==="indexeddb"?"IndexedDB":"\u8A18\u61B6\u9AD4"},{label:"\u67E5\u8A62\u8017\u6642",value:`${x} ms`}],distribution:g,query_text:`INDEXEDDB OPEN 'judgment-console'
OBJECT STORE '${r}'
FILTER ${i?`keyword \u2248 '${i}'`:"1 = 1"}
ORDER BY created_at DESC
LIMIT ${l} OFFSET ${_}`,warnings:v,meta:{store:r,filters:a,client_side:!0}}}async function rn(e,t){let s=!1,a=null,r=[],i="law",o=null,l={},v=0,b=25,$="query",g=null,f=null,_=0,h=[],x=null,C=-1,j=0,S=null,M=null;e.innerHTML=`<section class="page data-page">
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
  </section>`;let E=e.querySelector("#query-sidebar"),R=e.querySelector("#category-switch"),z=e.querySelector("#db-options-wrap"),X=e.querySelector("#sidebar-view-switch"),U=e.querySelector("#filter-area"),W=e.querySelector("#schema-area"),q=e.querySelector("#query-main"),N=e.querySelector("#schema-suggest-popover"),O=e.querySelector("#catalog-meta"),K=e.querySelector("#refresh-catalog"),fe=c=>r.find(u=>u.id===c),Te=()=>fe(i)?.databases||[],ie=c=>Te().find(u=>u.id===c),ge=(c,u)=>`${c}:${u}`,B=(c,u=i)=>l[ge(u,c.id)],le=(c,u)=>{As(c,u).catch(()=>{})},Ce=()=>{if(!a){O.textContent="CATALOG \xB7 \u96E2\u7DDA",O.className="badge badge-danger badge-mono";return}let c=Te(),u=c.filter(w=>w.available).length,m=fe(i);O.textContent=`CATALOG \xB7 ${m?.label||i} \xB7 ${u}/${c.length} \u53EF\u7528`,O.className="badge badge-neutral badge-mono"},xe=c=>{q.innerHTML=Na(c)},qe=()=>{let c=S?.returnScroll??M?.returnScroll;S=null,M=null;let u=ie(o),m=u?B(u):null;$==="schema"&&f?.result?q.innerHTML=Xt(f.result,k(u,f.tableId),{columnFilters:f.columnFilters||{},searchEnabled:u.id==="postgres"||u.id==="parquet"}):m?.result?q.innerHTML=kt(m.result):u&&xe(u),typeof c=="number"&&window.requestAnimationFrame(()=>window.scrollTo({top:c,behavior:"smooth"}))},Se=(c="law-article-jump")=>{let u=q.querySelector(`#${c}`),m=Os(u?.value);if(!m){D("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),u?.focus();return}let L=[...q.querySelectorAll("[data-article-no]")].find(A=>A.dataset.articleNo===m);if(!L){D(`\u627E\u4E0D\u5230\u7B2C ${m} \u689D\u3002`,"warn");return}L.scrollIntoView({behavior:"instant",block:"center"}),L.classList.add("is-jump-target"),window.setTimeout(()=>L.classList.remove("is-jump-target"),2400)},Re=async({lawKey:c,sourceType:u="",lawName:m="",versionId:w=""})=>{let L=ie(o),A=L?B(L):null,T=$==="schema"?f?.result:null;if(!L||!A?.result&&!T||!c)return;let Q=++v;S={seq:Q,lawKey:c,sourceType:u,lawName:m,versionId:w?String(w):"",page:1,detail:null,database:L.id,returnScroll:window.scrollY},M=null,q.innerHTML=Wa(m||c),q.scrollIntoView({behavior:"smooth",block:"start"});try{let ce=await H.lawDetail(c,u,S.versionId);if(s||!S||S.seq!==Q)return;S.detail=ce,S.page=1,q.innerHTML=Za(ce,{database:S.database,lawPage:S.page})}catch(ce){if(s||!S||S.seq!==Q)return;q.innerHTML=Ka(ce,m||c),D(ce.message||"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868\u3002","danger")}},P=async({jid:c})=>{let u=ie(o),m=u?B(u):null,w=$==="schema"?f?.result:null;if(!u||!m?.result&&!w||!c)return;let L=++v;S=null;let A=u.id==="parquet"?"parquet":"postgres";M={seq:L,jid:c,detail:null,database:u.id,source:A,returnScroll:window.scrollY},q.innerHTML=en(c),q.scrollIntoView({behavior:"smooth",block:"start"});try{let T=await H.judgmentDetail(c,A);if(s||!M||M.seq!==L)return;M.detail=T,q.innerHTML=an(T,{database:M.database})}catch(T){if(s||!M||M.seq!==L)return;q.innerHTML=tn(T,c),D(T.message||"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587\u3002","danger")}},d=(c,u)=>`${i}:${c.id}:${u}`,k=(c,u)=>(c.tables||[]).find(m=>m.id===u)?.label||u,I=(c,u,{sort:m=null,columnFilters:w={}}={})=>{let L={column_filters:w};return c.id==="postgres"?(L.table=u,L.schema_preview=!0):c.id==="parquet"&&i==="judgment"?(L.table="judgment_documents",L.columns=La):c.id==="parquet"&&(L.dataset="all",L.columns=Aa),m?.key&&(L.sort=`${m.key}:${m.direction}`),L},ee=async(c,u,{sort:m=null,columnFilters:w={}}={})=>{if(!u)return;_e();let L=d(c,u),A=++_;g={tableId:u},f={key:L,tableId:u,loading:!0,result:null,error:null,sort:m,columnFilters:w},W.innerHTML=Yt(c,fe(i)?.label||i,u),q.innerHTML=js(k(c,u));try{let T;if(c.id==="indexeddb"){let Q=wt(c,10);Q.values.store=u,Q.page=1,T=await Cs(c,Q)}else c.id==="qdrant"?T={database:"qdrant",label:"Qdrant",status:"not_configured",message:"Qdrant collection \u9700\u8981\u8A9E\u610F\u67E5\u8A62\uFF1BSchema \u50C5\u63D0\u4F9B collection \u540D\u7A31\uFF0C\u4E0D\u5217\u51FA\u524D 10 \u7B46\u8CC7\u6599\u3002",table:u,columns:[],rows:[],total:0,page:1,page_size:10,duration_ms:0,summary:[],distribution:[],query_text:"",warnings:[],meta:{}}:(T=await H.query({database:c.id,filters:I(c,u,{sort:m,columnFilters:w}),page:1,pageSize:10}),m?.key&&(T.meta={...T.meta||{},sort:m}));if(s||A!==_)return;f={key:L,tableId:u,loading:!1,result:T,error:null,sort:m,columnFilters:w},$==="schema"&&g?.tableId===u&&(W.innerHTML=Yt(c,fe(i)?.label||i,u),q.innerHTML=Xt(T,k(c,u),{columnFilters:w,searchEnabled:c.id==="postgres"||c.id==="parquet"}))}catch(T){if(s||A!==_)return;f={key:L,tableId:u,loading:!1,result:null,error:T,sort:m,columnFilters:w},$==="schema"&&g?.tableId===u&&(q.innerHTML=Ns(T,k(c,u)))}},oe=()=>{let c=ie(o);if(!c)return null;if($==="schema"&&f?.result)return{db:c,tableId:f.tableId,columnFilters:f.columnFilters||{},sort:f.sort||null,mode:"schema"};let u=c?B(c):null,m=u?.result;return m&&(c.id==="postgres"||c.id==="parquet")?{db:c,tableId:m.table,columnFilters:u.columnFilters||{},sort:u.sort||null,mode:"query"}:null},te=(c,u,m)=>{if(!c)return;let w=`${c.db.id}:${c.tableId}:${u}`,L=de.get(w);L&&(window.clearTimeout(L),de.delete(w)),_e();let A={...c.columnFilters||{}},T=String(m||"").trim();if(T?A[u]=T:delete A[u],c.mode==="schema"){ee(c.db,c.tableId,{sort:c.sort,columnFilters:A});return}let Q=B(c.db);Q.columnFilters=A,Q.page=1,Ue(1)},de=new Map,se=()=>{j+=1,h=[],x=null,C=-1,N&&(N.hidden=!0,N.innerHTML="")},G=(c,u)=>{let m=String(c||""),w=m.toLocaleLowerCase(),L=String(u||"").toLocaleLowerCase(),A=new Array(m.length).fill(!1),T=(ne,Le)=>{for(let ve=ne;ve<ne+Le;ve+=1)ve>=0&&ve<A.length&&(A[ve]=!0)},Q=w.indexOf(L);if(Q>=0)for(;Q>=0;)T(Q,L.length),Q=w.indexOf(L,Q+L.length);else{let ne=[];for(let Le of L.match(/[一-鿿]{2,}/g)||[])for(let ve=0;ve<Le.length-1;ve+=1)ne.push(Le.slice(ve,ve+2));ne.push(...L.match(/[a-z0-9]+/g)||[]);for(let Le of ne){let ve=w.indexOf(Le);for(;ve>=0;)T(ve,Le.length),ve=w.indexOf(Le,ve+Le.length)}}let ce="",ue=0;for(;ue<m.length;)if(A[ue]){let ne=ue;for(;ne<m.length&&A[ne];)ne+=1;ce+=`<mark>${n(m.slice(ue,ne))}</mark>`,ue=ne}else{let ne=ue;for(;ne<m.length&&!A[ne];)ne+=1;ce+=n(m.slice(ue,ne)),ue=ne}return ce||n(m)},me=(c,u)=>{if(!N)return;let m=c.getBoundingClientRect(),w=Math.min(420,Math.max(220,m.width)),L=Math.min(360,34+u*30),A=m.bottom+4;A+L>window.innerHeight-8&&(A=Math.max(8,m.top-L-4));let T=Math.min(window.innerWidth-w-8,Math.max(8,m.left));N.style.width=`${w}px`,N.style.left=`${T}px`,N.style.top=`${A}px`},Ae=c=>{if(!N)return;let u=[...N.querySelectorAll(".schema-suggest-item")];u.length&&(C=Math.max(0,Math.min(u.length-1,c)),u.forEach((m,w)=>{m.classList.toggle("is-active",w===C)}),u[C].scrollIntoView({block:"nearest"}))},we=c=>{let u=h[c],m=x;!u||!m||(se(),te(m,m.column,u))},Ie=async(c,u,m,w)=>{if(!c||!m.trim()){se();return}let L=++j;x={...c,column:u,input:w},C=-1;try{let A=await H.schemaSuggest({database:c.db.id,table:c.tableId,column:u,query:m,limit:1e3});if(L!==j||document.activeElement!==w||!N)return;let T=Array.isArray(A.values)?A.values:[];if(h=T,!T.length){se();return}let Q=Number(A.total)>T.length?`\u5171 ${p(A.total)} \u500B\u7B26\u5408\uFF0C\u986F\u793A\u524D ${p(T.length)} \u500B`:`\u5171 ${p(A.total)} \u500B\u7B26\u5408`;N.innerHTML=`<div class="schema-suggest-head">${n(Q)}</div>${T.map((ce,ue)=>`<button class="schema-suggest-item" type="button"
            data-schema-suggest-index="${ue}"
            title="${n(ce)}">${G(ce,m)}</button>`).join("")}`,me(w,T.length),N.hidden=!1}catch{se()}},_e=()=>{let c=document.activeElement;c instanceof HTMLElement&&c.matches("[data-schema-search]")&&c.blur(),se()},ut=(c,{resetReport:u=!1}={})=>{_e();let m=B(c);if(R.innerHTML=qs(r,i),z.innerHTML=Ea(Te(),c.id),X.innerHTML=ja($),$==="schema"?(U.hidden=!0,U.innerHTML="",W.hidden=!1,W.innerHTML=Yt(c,fe(i)?.label||i,g?.tableId||"")):(W.hidden=!0,W.innerHTML="",U.hidden=!1,U.innerHTML=`${Ts(c)}${Wt(c,m)}<div class="sidebar-note">${Es(c)}</div>`),Ce(),$==="schema"){let w=g?d(c,g.tableId):"";if(f&&f.key===w){let L=k(c,f.tableId);f.loading?q.innerHTML=js(L):f.error?q.innerHTML=Ns(f.error,L):q.innerHTML=Xt(f.result,L,{columnFilters:f.columnFilters||{},searchEnabled:c.id==="postgres"||c.id==="parquet"})}else q.innerHTML=Ua(c);return}u?xe(c):m.result?q.innerHTML=kt(m.result):xe(c)},pt=(c,{persist:u=!0,resetReport:m=!1}={})=>{let w=Te(),L=w.find(T=>T.id===c)||w[0];if(!L)return;S=null,M=null,g=null,f=null,_+=1,o=L.id;let A=ge(i,L.id);l[A]||(l[A]=wt(L,b)),ut(L,{resetReport:m}),u&&(le(`data.last_database.${i}`,L.id),le("data.last_category",i))},Ee=(c,{persist:u=!0,resetReport:m=!0,databaseId:w=null}={})=>{let L=fe(c)||r[0];if(!L)return;i=L.id,S=null,M=null;let A=L.databases||[],T=w&&A.find(Q=>Q.id===w)||A.find(Q=>Q.id===o)||A[0];if(o=T?.id||null,!T){R.innerHTML=qs(r,i),z.innerHTML=`<div class="sidebar-notice">${V({tone:"warn",title:"\u6C92\u6709\u53EF\u7528\u7684\u8CC7\u6599\u4F86\u6E90",text:"\u9019\u500B\u985E\u5225\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u5EAB\u9078\u9805\u3002"})}</div>`,U.innerHTML="",Ce();return}pt(T.id,{persist:!1,resetReport:m}),u&&(le("data.last_category",L.id),le(`data.last_database.${L.id}`,T.id))},nt=c=>{let u=B(c),m=U.querySelector("#data-filter-form");m&&(u.values=_t(m,c,u))},Ue=async(c=null)=>{let u=ie(o);if(!u)return;_e();let m=B(u);nt(u),c!==null&&(m.page=c),(!Number.isFinite(m.page)||m.page<1)&&(m.page=1);let w=++v;S=null,M=null,q.innerHTML=ot(u);let L=U.querySelector("#run-query");J(L,!0,"\u67E5\u8A62\u4E2D\u2026");try{let A;if(u.id==="indexeddb"?A=await Cs(u,m):A=await H.query({database:u.id,filters:Kt(u,m),page:m.page,pageSize:m.pageSize}),s||w!==v)return;A.meta={...A.meta||{},column_filters:m.columnFilters||{},searchable:u.id==="postgres"||u.id==="parquet",sort:m.sort||A.meta?.sort||null},m.result=A,m.page=Number(A.page)||m.page,m.pageSize=Number(A.page_size)||m.pageSize,q.innerHTML=kt(A);let T=fe(i)?.label||i;await yt({kind:"data",title:`${T} \xB7 ${u.label} \xB7 ${A.table||A.label||"query"}`,detail:`${p(A.total)} \u7B46 \xB7 ${F(A.duration_ms)}`,payload:{category:i,database:u.id,filters:Kt(u,m),page:m.page,page_size:m.pageSize}}),le("data.last_query",{category:i,database:u.id,filters:Kt(u,m),page:m.page,page_size:m.pageSize,at:new Date().toISOString()})}catch(A){if(s||w!==v)return;q.innerHTML=St(A,u),D(A.message||"\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{!s&&w===v&&J(L,!1)}},Rt=async()=>{K.disabled=!0,J(K,!0,"\u6574\u7406\u4E2D\u2026");try{let[c,u,m,w,L]=await Promise.all([H.catalog(),it("data.last_category","law"),it("data.last_database.law","postgres"),it("data.last_database.judgment","postgres"),it("data.page_size",25)]);if(s)return;a=c,r=Array.isArray(a.categories)?a.categories:[],b=Rs.includes(Number(L))?Number(L):25;for(let Q of r)for(let ce of Q.databases||[]){let ue=ge(Q.id,ce.id);l[ue]||(l[ue]=wt(ce,b))}let A=r.find(Q=>Q.id===u)||r[0];if(!A){R.innerHTML="",z.innerHTML=`<div class="sidebar-notice">${V({tone:"danger",title:"\u6C92\u6709\u53EF\u7528\u7684\u5206\u985E",text:"Catalog \u6C92\u6709\u56DE\u50B3\u6CD5\u898F\u547D\u4EE4\u6216\u5224\u6C7A\u5206\u985E\u3002"})}</div>`;return}let T=A.id==="judgment"?w:m;if(i=A.id,o=null,Ee(A.id,{persist:!1,resetReport:!0,databaseId:T}),s)return;D("\u8CC7\u6599\u5EAB catalog \u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(c){if(s)return;a=null,r=[],R.innerHTML="",Ce(),z.innerHTML=`<div class="sidebar-notice">${V({tone:"danger",title:"\u7121\u6CD5\u8B80\u53D6 catalog",text:n(c.message||"\u8ACB\u78BA\u8A8D API \u662F\u5426\u555F\u52D5\u3002")})}
      <button class="btn btn-secondary btn-sm" type="button" id="catalog-retry" style="margin-top:10px">
        ${y("refresh",14)}<span>\u91CD\u8A66</span>
      </button></div>`,q.innerHTML=`<div class="report-empty">${be({iconName:"server",title:"API \u76EE\u524D\u7121\u6CD5\u9023\u7DDA",text:"\u67E5\u8A62\u5831\u8868\u9700\u8981 FastAPI \u63D0\u4F9B catalog \u8207\u8CC7\u6599\u67E5\u8A62 API\u3002\u8ACB\u78BA\u8A8D judgment-web \u5DF2\u555F\u52D5\u3002"})}</div>`}finally{s||(K.disabled=!1,J(K,!1))}};E.addEventListener("change",c=>{let u=c.target;if(u.name==="category"){Ee(u.value);return}if(u.name==="database"){pt(u.value);return}let m=ie(o);if(!m)return;let w=B(m),L=U.querySelector("#data-filter-form");!L||!u.name||(w.values=_t(L,m,w),w.page=1,u.name==="table"&&(S=null,M=null,w.sort=null,w.columnFilters={},w.result=null,U.innerHTML=Wt(m,w),xe(m)))}),E.addEventListener("input",c=>{let u=ie(o);if(!u)return;let m=U.querySelector("#data-filter-form");if(!m||!c.target.name||c.target.name==="table")return;let w=B(u);w.values=_t(m,u,w)}),E.addEventListener("submit",c=>{c.target.id==="data-filter-form"&&(c.preventDefault(),Ue(1))}),E.addEventListener("click",c=>{let u=c.target.closest("[data-action]"),m=u?.dataset.action;if(m==="sidebar-view"){let w=ie(o);if(!w)return;let L=B(w),A=U.querySelector("#data-filter-form");A&&$==="query"&&(L.values=_t(A,w,L)),$=u.dataset.view==="schema"?"schema":"query",ut(w);return}if(m==="select-schema-table"){let w=ie(o);if(!w)return;ee(w,u.dataset.tableId||"");return}if(m==="reset"){let w=ie(o);if(!w)return;S=null,M=null;let L=B(w);l[ge(i,w.id)]=wt(w,L.pageSize),U.innerHTML=`${Ts(w)}${Wt(w,l[ge(i,w.id)])}<div class="sidebar-note">${Es(w)}</div>`,xe(w),D("\u5DF2\u91CD\u8A2D\u9019\u500B\u8CC7\u6599\u5EAB\u7684\u67E5\u8A62\u689D\u4EF6\u3002","info",2400);return}c.target.closest("#catalog-retry")&&Rt()}),q.addEventListener("input",c=>{let u=c.target.closest("[data-schema-search]");if(!u)return;let m=oe();if(!m)return;let w=u.dataset.schemaSearch||"",L=u.value,A=`${m.mode}:${m.db.id}:${m.tableId}:${w}`,T=de.get(A);if(T&&window.clearTimeout(T),!L.trim()){de.delete(A),se(),te(m,w,"");return}let Q=window.setTimeout(()=>{de.delete(A),Ie(m,w,L,u)},250);de.set(A,Q)}),q.addEventListener("keydown",c=>{let u=c.target.closest("[data-schema-search]");if(!u)return;let m=oe();if(m){if(c.key==="Escape"){se();return}if(c.key==="ArrowDown"||c.key==="ArrowUp"){if(!N||N.hidden)return;c.preventDefault();let w=c.key==="ArrowDown"?1:-1;Ae(C<0?w>0?0:h.length-1:C+w);return}if(c.key==="Enter"){if(c.preventDefault(),N&&!N.hidden&&C>=0){we(C);return}te(m,u.dataset.schemaSearch||"",u.value)}}}),N?.addEventListener("mousedown",c=>{c.preventDefault()}),N?.addEventListener("click",c=>{let u=c.target.closest("[data-schema-suggest-index]");u&&we(Number(u.dataset.schemaSuggestIndex))});let ms=c=>{c.target.closest("[data-schema-search]")||N?.contains(c.target)||se()};return document.addEventListener("click",ms),window.addEventListener("scroll",se,!0),window.addEventListener("resize",se),q.addEventListener("keydown",c=>{c.target.matches(".law-jump-input")&&c.key==="Enter"&&(c.preventDefault(),Se(c.target.id))}),q.addEventListener("click",async c=>{let u=c.target.closest("[data-action]");if(!u)return;let m=u.dataset.action,w=ie(o),L=w?B(w):null,A=L?.result;if(m==="back-to-results"){qe();return}if(m==="open-law"){Re({lawKey:u.dataset.lawKey||"",sourceType:u.dataset.lawSource||"",lawName:u.dataset.lawName||""});return}if(m==="open-judgment"){P({jid:u.dataset.jid||""});return}if(m==="jump-article"){Se(u.dataset.jumpInput||"law-article-jump");return}if(m==="sort-column"){let T=u.dataset.sortKey||"";if(!T||!w)return;if($==="schema"&&f?.result){let ue=f.sort,ne=T==="jdate"||T==="law_modified_date"||T==="article_count"||T==="citation_count"||T==="full_text_length"||T==="created_at"||T==="updated_at",Le=ue?.key===T?ue.direction==="asc"?"desc":"asc":ne?"desc":"asc";ee(w,f.tableId,{sort:{key:T,direction:Le},columnFilters:f.columnFilters||{}});return}if(!L)return;let Q=L.sort,ce=Q?.key===T?Q.direction==="asc"?"desc":"asc":T==="jdate"?"desc":"asc";L.sort={key:T,direction:ce},Ue(1);return}if(m==="retry"){Ue(L?.page||1);return}if(A){if(m==="prev-page"){Ue(Math.max(1,Number(A.page)-1));return}if(m==="next-page"){let T=Math.max(1,Math.ceil(Number(A.total)/Number(A.page_size)));Ue(Math.min(T,Number(A.page)+1));return}if(m==="copy-query"){let T=await gt(A.query_text||"");D(T?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",T?"ok":"warn");return}if(m==="export-json"){let T=`${A.database}-${A.table||"query"}-page-${A.page}.json`;Oe(T,JSON.stringify(Lt(A),null,2),"application/json;charset=utf-8"),D(`\u5DF2\u532F\u51FA ${T}`,"ok");return}if(m==="export-csv"){let T=`${A.database}-${A.table||"query"}-page-${A.page}.csv`;Oe(T,At(A),"text/csv;charset=utf-8"),D(`\u5DF2\u532F\u51FA ${T}`,"ok")}}}),q.addEventListener("change",c=>{let u=c.target.closest("[data-action='select-law-version']");if(u&&S){Re({lawKey:S.lawKey,sourceType:S.sourceType,lawName:S.lawName,versionId:u.value});return}if(!c.target.matches("[data-page-size]"))return;let m=ie(o);if(!m)return;let w=B(m);w.pageSize=Number(c.target.value)||25,w.page=1,le("data.page_size",w.pageSize),Ue(1)}),K.addEventListener("click",()=>{Rt()}),await Rt(),t&&typeof t.setTitle=="function"&&t.setTitle("\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"),()=>{s=!0;for(let c of de.values())window.clearTimeout(c);de.clear(),se(),document.removeEventListener("click",ms),window.removeEventListener("scroll",se,!0),window.removeEventListener("resize",se)}}var zs=[10,25,50,100],on=[{value:"started_at:desc",label:"Timestamp \u65B0 \u2192 \u820A"},{value:"started_at:asc",label:"Timestamp \u820A \u2192 \u65B0"},{value:"duration_ms:desc",label:"\u8017\u6642\u591A \u2192 \u5C11"},{value:"duration_ms:asc",label:"\u8017\u6642\u5C11 \u2192 \u591A"}];function as(){return{process:"",module:"",status:"",method:"",model:"",keyword:"",from_date:"",to_date:"",min_duration:"",sort:"started_at:desc"}}function ln(e,t=e){return`<option value="${n(e)}">${n(t)}</option>`}function lt(e,t,s,a,r=""){return`<div class="field">
    <label class="field-label" for="performance-${e}">
      <span>${n(t)}</span>
      <span class="field-tag">${n(e)}</span>
    </label>
    <select class="select" id="performance-${e}" name="${n(e)}">
      ${ln("","\u5168\u90E8")}
      ${s.map(i=>`<option value="${n(i)}" ${String(i)===String(a)?"selected":""}>${n(i)}</option>`).join("")}
    </select>
    ${r?`<span class="field-help">${n(r)}</span>`:""}
  </div>`}function cn(e,t){let s=on.map(a=>`<option value="${a.value}" ${a.value===t.sort?"selected":""}>${a.label}</option>`).join("");return`
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
    </div>`}function Hs(){let e=document.getElementById("performance-filter-form");if(!e)return as();let t=new FormData(e);return{process:String(t.get("process")||""),module:String(t.get("module")||""),status:String(t.get("status")||""),method:String(t.get("method")||""),model:String(t.get("model")||""),keyword:String(t.get("keyword")||"").trim(),from_date:String(t.get("from_date")||""),to_date:String(t.get("to_date")||""),min_duration:String(t.get("min_duration")||""),sort:String(t.get("sort")||"started_at:desc")}}function Gs(e){if(e==null)return"null";if(typeof e=="object")try{let t=JSON.stringify(e);return t.length>160?`${t.slice(0,157)}\u2026`:t}catch{return String(e)}return String(e)}function dn(e){if(!e)return"";let t=new Date(e);if(Number.isNaN(t.getTime()))return"";let s=String(t.getHours()).padStart(2,"0"),a=String(t.getMinutes()).padStart(2,"0"),r=String(t.getSeconds()).padStart(2,"0"),i=String(t.getMilliseconds()).padStart(3,"0");return`${s}:${a}:${r}.${i}`}function un(e){let t=String(e?.module||"");return t.includes("static")||t.includes("frontend")?"is-client":t.includes("judgment.rag")?"is-rag":t.includes("judgment.web.app")?"is-api":t.includes("judgment.web.query")?"is-data":t.includes("judgment.judgment_index")?"is-index":"is-other"}function pn(e){let t=new Map(e.map(a=>[a.seq,a.parent_seq])),s=new Map;for(let a of e){if(Number.isInteger(a.depth)){s.set(a.seq,a.depth);continue}let r=0,i=a.parent_seq,o=0;for(;i&&t.has(i)&&o<20;)r+=1,i=t.get(i),o+=1;s.set(a.seq,r)}return s}function mn(e){let t=Object.entries(e||{});if(!t.length)return'<span class="muted">\u7121\u53C3\u6578</span>';let s=t.slice(0,8),a=t.length-s.length;return`<div class="flow-param-list">${s.map(([r,i])=>`<span class="flow-param">
        <span class="flow-param-key">${n(r)}</span>
        <span class="flow-param-value">${n(Gs(i))}</span>
      </span>`).join("")}${a>0?`<span class="flow-param-more">+${a}</span>`:""}</div>`}function vn(e){let t=new Map,s=Math.max(0,Number(e[0]?.offset_ms)||0);return e.forEach((a,r)=>{let i=Math.max(0,Number(a.offset_ms)||0),o=Math.max(0,Number(a.duration_ms)||0),l=e[r+1],v=l?Math.max(i,Number(l.offset_ms)||i):null,b=v===null?i+o:v,$=Math.max(0,b-i),g=Math.max(0,b-s);t.set(a.seq,{offset:i,duration:o,lap:$,cumulative:g})}),t}function fn(e,t,s,a){let r=a.get(e.seq)||{},i=Math.max(0,Number(r.duration)||0),o=Math.max(0,Number(r.offset)||0),l=Math.max(0,Number(r.lap)||0),v=Math.max(0,Number(r.cumulative)||0),b=Math.max(t,o+i,1),$=Math.min(100,o/b*100),g=Math.min(100-$,Math.max(.6,l/b*100)),f=s.get(e.seq)||0,h=dn(e.started_at)||`+${o.toFixed(0)} ms`,x=e.started_at?`\u958B\u59CB\uFF1A${ae(e.started_at)} \xB7 +${o.toFixed(1)} ms`:`\u958B\u59CB\uFF1A+${o.toFixed(1)} ms`;return`<div class="flow-segment ${e.status==="error"?"is-error":""}" style="--depth:${Math.min(f,8)}">
    <div class="flow-segment-head">
      <span class="flow-seq">#${n(String(e.seq??"\u2014"))}</span>
      <span class="flow-segment-name">${n(e.name||"unnamed")}</span>
      <span class="flow-segment-start" title="${n(x)}">${n(h)}</span>
      <span class="flow-segment-duration" title="\u8DDD\u4E0B\u4E00\u9EDE ${F(l)}\uFF1B\u7D2F\u8A08 ${F(v)}">${F(l)}</span>
      <span class="flow-segment-span" title="\u5F9E\u7B2C\u4E00\u9EDE\u5230\u672C\u9EDE\u7D50\u675F\u7684\u7D2F\u8A08\u6642\u9593">\u7D2F\u8A08 ${F(v)}</span>
    </div>
    <div class="flow-segment-loc">
      <span class="flow-segment-loc-text">${n(e.module||"\u2014")}<span class="flow-segment-dot">\xB7</span>${n(e.function||"\u2014")}</span>
      <span class="flow-segment-mobile-cum" title="\u5F9E\u7B2C\u4E00\u9EDE\u5230\u672C\u9EDE\u7D50\u675F\u7684\u7D2F\u8A08\u6642\u9593">\u7D2F\u8A08 ${F(v)}</span>
    </div>
    <div class="flow-track" title="\u958B\u59CB +${o.toFixed(1)} ms \xB7 \u8DDD\u4E0B\u4E00\u9EDE ${F(l)} \xB7 \u7D2F\u8A08 ${F(v)}">
      <span class="flow-bar ${un(e)}" style="left:${$.toFixed(2)}%;width:${g.toFixed(2)}%"></span>
    </div>
    ${mn(e.params)}
    ${e.error?`<div class="flow-segment-error">${n(e.error)}</div>`:""}
  </div>`}function gn(e){let t=Array.isArray(e?.segments)?e.segments:[],s=Array.isArray(e?.models)?e.models:[],a=e?.client||{},r=Math.max(...t.map(l=>Number(l.avg_ms)||0),1),i=a.samples?F(a.avg_total_ms??0):"\u2014",o=a.samples?F(a.avg_render_ms??0):"\u2014";return`<div class="perf-flow-stats">
    <div class="perf-stat-grid">
      <div class="perf-stat">
        <span class="perf-stat-value">${p(e?.avg_segments??0)}</span>
        <span class="perf-stat-label">\u5E73\u5747\u6BB5\u6578\uFF08\u6A23\u672C\uFF09</span>
      </div>
      <div class="perf-stat">
        <span class="perf-stat-value">${p(e?.max_segments??0)}</span>
        <span class="perf-stat-label">\u6700\u5927\u6BB5\u6578</span>
      </div>
      <div class="perf-stat">
        <span class="perf-stat-value">${p(e?.sample_size??0)}</span>
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
                    <span class="perf-model-count">${p(l.value)} \u6B21${l.avg_ms?` \xB7 \u5E73\u5747 ${F(l.avg_ms)}`:""}</span>
                  </div>`).join("")}</div>`:'<p class="muted" style="font-size:11px">\u5C1A\u7121\u6A21\u578B\u8CC7\u6599\uFF1B\u65B0\u7684 Flow \u6703\u5F9E params.model \u81EA\u52D5\u5F59\u6574\u3002</p>'}
      </div>
      <div class="perf-flow-stat-panel">
        <div class="report-section-head">
          <span class="report-section-title">\u6700\u6162\u5340\u6BB5\uFF08\u5E73\u5747\uFF09</span>
          <span class="muted" style="font-size:9.5px">\u6700\u8FD1 ${p(e?.sample_size??0)} \u7B46</span>
        </div>
        ${t.length?`<div class="perf-seg-list">${t.slice(0,6).map(l=>`<div class="perf-seg-row">
                    <span class="perf-seg-name" title="${n(l.label)}">${n(l.label)}</span>
                    <span class="perf-seg-track"><span style="width:${Math.max(2,(Number(l.avg_ms)||0)/r*100).toFixed(1)}%"></span></span>
                    <span class="perf-seg-ms">${F(l.avg_ms)}</span>
                  </div>`).join("")}</div>`:'<p class="muted" style="font-size:11px">\u5C1A\u7121\u5340\u6BB5\u8017\u6642\uFF1B\u9700\u6709\u542B flow \u7684\u65B0\u7D00\u9304\u3002</p>'}
      </div>
    </div>
  </div>`}function $e(e){let t=Math.max(0,Number(e)||0);if(!t)return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;let s=Math.round(t/1e3),a=Math.floor(s/3600),r=Math.floor(s%3600/60),i=s%60;return a?`${a}h ${String(r).padStart(2,"0")}m ${String(i).padStart(2,"0")}s`:r?`${r}m ${String(i).padStart(2,"0")}s`:`${(t/1e3).toFixed(1)}s`}function Qs(e){let t=String(e?.task||"").trim();return t?t==="auto"?"\u81EA\u52D5\u63A5\u7E8C":`task ${t}`:"\u7D22\u5F15"}function hn(e){let t=(e||[]).slice(-12);if(!t.length)return'<p class="muted" style="font-size:11px">\u5C1A\u7121\u7D22\u5F15\u7D00\u9304\u3002</p>';let s=Math.max(...t.map(a=>Number(a.points_per_second)||0),.1);return`<div class="index-run-bars">${t.map(a=>{let r=Number(a.points_per_second)||0,i=Math.max(2,r/s*100);return`<div class="index-run-row">
        <div class="index-run-label">
          <strong>${n(Qs(a))}</strong>
          <span>${n(ae(a.started_at))}</span>
        </div>
        <div class="index-run-track" title="${n(`${p(a.indexed_count)} \u7B46 \xB7 ${$e(a.duration_ms)} \xB7 ${p(a.batch_count)} \u6279`)}">
          <span style="width:${i.toFixed(1)}%"></span>
        </div>
        <div class="index-run-value">
          <strong>${r.toFixed(1)}</strong><span>\u7B46/\u79D2</span>
          <em>${p(a.indexed_count)} \u7B46 \xB7 ${$e(a.duration_ms)}</em>
        </div>
      </div>`}).join("")}</div>`}function bn(e){let t=(Array.isArray(e.time_breakdown)?e.time_breakdown:[]).map(s=>({...s,ms:Number(s.ms)||0,percent:Number(s.percent)||0})).filter(s=>s.ms>0);return t.length?`<div class="index-breakdown-bar">${t.map(s=>`<span class="index-seg index-seg-${n(s.key)}" style="width:${Math.max(.5,s.percent).toFixed(2)}%" title="${n(`${s.label} ${$e(s.ms)}\uFF08${s.percent.toFixed(1)}%\uFF09`)}"></span>`).join("")}</div>
    <div class="index-breakdown-legend">${t.map(s=>`<span class="index-legend-item">
            <i class="index-seg index-seg-${n(s.key)}"></i>
            <span>${n(s.label)}</span>
            <strong>${$e(s.ms)}</strong>
            <em>${s.percent.toFixed(1)}%</em>
          </span>`).join("")}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B\u968E\u6BB5\u8A08\u6642\uFF1B\u5F8C\u7E8C\u7D22\u5F15\u6703\u8A18\u9304 Ollama Embedding\u3001Qdrant Upsert \u8207 PostgreSQL \u7D22\u5F15\u7D00\u9304\u7684\u6642\u9593\u7D44\u6210\u3002</div>'}function yn(e,t){let s=(Array.isArray(e)?e:[]).map(j=>({elapsed:Math.max(0,Number(j.elapsed_s)||0),indexed:Math.max(0,Number(j.indexed)||0)})).filter(j=>j.indexed>0);if(s.length<2)return"";let a=Math.max(...s.map(j=>j.elapsed),(Number(t)||0)/1e3,1),r=Math.max(...s.map(j=>j.indexed),1),i=760,o=150,l=12,v=12,b=i-l*2,$=o-v*2,g=s.map(j=>[l+j.elapsed/a*b,o-v-j.indexed/r*$]),f=g.map(([j,S],M)=>`${M===0?"M":"L"}${j.toFixed(1)},${S.toFixed(1)}`).join(" "),_=`${f} L${g[g.length-1][0].toFixed(1)},${o-v} L${g[0][0].toFixed(1)},${o-v} Z`,h=Math.max(1,Math.ceil(g.length/14)),x=g.map(([j,S],M)=>M%h===0||M===g.length-1?`<circle cx="${j.toFixed(1)}" cy="${S.toFixed(1)}" r="2.6" />`:"").join(""),C=[0,1,2,3].map(j=>{let S=v+$/3*j;return`<line x1="${l}" y1="${S.toFixed(1)}" x2="${i-l}" y2="${S.toFixed(1)}" class="index-chart-grid" />`}).join("");return`<div class="index-chart-card index-progress-card">
    <div class="index-chart-head">
      <span>\u672C\u6B21\u7D22\u5F15\u9032\u5EA6</span>
      <span>${p(r)} \u7B46 \xB7 ${$e(a*1e3)}</span>
    </div>
    <svg class="index-progress-svg" viewBox="0 0 ${i} ${o}" role="img" aria-label="\u7D22\u5F15\u9032\u5EA6\u6298\u7DDA\u5716">
      ${C}
      <path d="${_}" class="index-progress-area"></path>
      <path d="${f}" class="index-progress-line"></path>
      ${x}
      <line x1="${l}" y1="${o-v}" x2="${i-l}" y2="${o-v}" class="index-chart-axis"></line>
      <line x1="${l}" y1="${v}" x2="${l}" y2="${o-v}" class="index-chart-axis"></line>
    </svg>
    <div class="index-progress-labels">
      <span>0</span>
      <span>${$e(a*500)}</span>
      <span>${$e(a*1e3)}</span>
    </div>
  </div>`}function $n(e){if(!e||!e.latest)return"";let t=e.latest,s=Array.isArray(e.runs)?e.runs:[],a=e.average||{},r=t.coverage||{},i=r.total_judgments>0?`${p(r.indexed_judgments)} / ${p(r.total_judgments)}\uFF08${(100*r.indexed_judgments/r.total_judgments).toFixed(1)}%\uFF09`:"\u2014",o=[{label:"\u7576\u6B21\u57F7\u884C\u7B46\u6578",value:p(t.indexed_count),note:`${p(t.batch_count)} \u6279 \xD7 ${p(t.batch_size)} \u7B46`},{label:"\u5E73\u5747\u6BCF\u79D2\u7B46\u6578",value:`${(Number(t.points_per_second)||0).toFixed(1)}`,note:"\u7B46/\u79D2"},{label:"\u7576\u6B21\u4F7F\u7528\u6642\u9593",value:$e(t.duration_ms),note:`${p(t.scanned_count)} \u7B46\u5DF2\u6383\u63CF`},{label:"\u5E73\u5747\u6BCF\u6279\u6642\u9593",value:$e(t.batch_avg_ms),note:t.batch_min_ms||t.batch_max_ms?`\u6700\u5FEB ${$e(t.batch_min_ms)} \xB7 \u6700\u6162 ${$e(t.batch_max_ms)}`:"\u4EE5\u7E3D\u8017\u6642 \xF7 \u6279\u6578\u8A08\u7B97"}];return`<section class="index-perf-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u7D22\u5F15\u6548\u80FD</div>
        <div class="index-perf-sub">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 \xB7 \u6700\u8FD1 ${p(e.run_count)} \u6B21\u57F7\u884C</div>
      </div>
      <span class="chip">${n(Qs(t))}</span>
    </div>
    <div class="index-perf-summary">
      ${o.map(l=>`<div class="index-perf-stat">
            <div class="summary-label">${n(l.label)}</div>
            <div class="index-perf-value">${n(l.value)}</div>
            <div class="index-perf-note">${n(l.note)}</div>
          </div>`).join("")}
    </div>
    <div class="index-perf-meta">
      <span><strong>\u6700\u8FD1\u4E00\u6B21</strong> ${n(ae(t.started_at))}</span>
      <span><strong>batch</strong> ${p(t.batch_size)} \u7B46\uFF0F\u6279</span>
      <span><strong>embedding \u4E0A\u9650</strong> ${t.max_chars?`${p(t.max_chars)} \u5B57`:"\u2014"}</span>
      <span><strong>collection</strong> ${p(t.collection_points)} points</span>
      <span><strong>\u8986\u84CB\u7387</strong> ${n(i)}</span>
      <span><strong>\u5E73\u5747\u6BCF\u6B21\u57F7\u884C</strong> ${$e(a.duration_ms)} \xB7 ${(Number(a.points_per_second)||0).toFixed(1)} \u7B46/\u79D2</span>
    </div>
    <div class="index-charts">
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u8FD1\u7D22\u5F15\u541E\u5410</span>
          <span>\u7B46/\u79D2</span>
        </div>
        ${hn(s)}
      </div>
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u65B0\u4E00\u6B21\u6642\u9593\u7D44\u6210</span>
          <span>${$e(t.duration_ms)}</span>
        </div>
        ${bn(t)}
      </div>
    </div>
    ${yn(t.progress,t.duration_ms)}
  </section>`}function wn(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,r=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${r} \u9801 \xB7
      \u986F\u793A ${p(i)}\u2013${p(o)} / ${p(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${zs.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${y("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=r?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${y("chevronRight",13)}</button>
    </div>
  </div>`}function _n(e,t){let s=e.flow&&typeof e.flow=="object"?e.flow:null,a=Array.isArray(s?.segments)?[...s.segments].sort((h,x)=>Number(h.seq)-Number(x.seq)):[],r=s?.summary||{},i=Array.isArray(r.models)?r.models:[],o=s?.client||{},l=s?.metadata||{},v=l.question||"",b=l.answer||"",$=v||b?`<div class="perf-flow-qa">
          ${v?`<div class="perf-flow-qa-row"><strong>RAG \u554F\u984C</strong><span>${n(v)}</span></div>`:""}
          ${b?`<div class="perf-flow-qa-row"><strong>RAG \u7B54\u6848</strong><span>${n(b)}</span></div>`:""}
        </div>`:"",g=Math.max(Number(s?.total_ms)||0,Number(e.duration_ms)||0,...a.map(h=>(Number(h.offset_ms)||0)+(Number(h.duration_ms)||0)),1),f=pn(a),_=vn(a);return`<details class="perf-record" ${t===0?"open":""}>
    <summary class="perf-record-summary">
      <span class="perf-record-id">#${n(String(e.id))}</span>
      <span class="perf-record-main">
        <span class="perf-record-title">${n(e.process||"\u672A\u547D\u540D")}</span>
        <span class="perf-record-path mono">${n(e.method||"")} ${n(e.path||"")}</span>
      </span>
      <span class="perf-record-time">${ae(e.started_at)}</span>
      <span class="perf-record-duration">${F(e.duration_ms)}</span>
      ${Y(e.status)}
      <span class="perf-record-chevron">${y("chevronRight",14)}</span>
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
      ${$}
      ${i.length?`<div class="chips perf-record-models">${i.map(h=>`<span class="chip">${n(h)}</span>`).join("")}</div>`:""}
      ${a.length?`<div class="flow-axis"><span>0 ms</span><span>${F(g)}</span></div>
            <div class="flow-timeline">${a.map(h=>fn(h,g,f,_)).join("")}</div>`:`<div class="perf-no-flow">\u6B64\u7D00\u9304\u6C92\u6709 flow \u660E\u7D30\uFF08\u53EF\u80FD\u662F\u820A\u8CC7\u6599\u6216 CLI \u7D00\u9304\uFF09\u3002${e.params_text&&e.params_text!=="{}"?`<pre>${n(e.params_text)}</pre>`:""}</div>`}
      ${s?`<details class="flow-json">
              <summary>Flow JSON \xB7 ${a.length} \u6BB5</summary>
              <pre>${n(JSON.stringify(s,null,2))}</pre>
            </details>`:""}
    </div>
  </details>`}var ct={embedding:"Embedding",retrieval:"Qdrant \u6AA2\u7D22",context:"PostgreSQL \u53D6\u6587",llm:"LLM \u751F\u6210",validation:"\u5F15\u7528\u9A57\u8B49"},Us={embedding:"EMB",retrieval:"\u6AA2\u7D22",context:"\u53D6\u6587",llm:"LLM",validation:"\u9A57\u8B49",overhead:"\u5176\u4ED6"};function Js(e){return{pending:"\u7B49\u5F85",running:"\u57F7\u884C\u4E2D",success:"\u5B8C\u6210",partial:"\u90E8\u5206\u6210\u529F",failed:"\u5931\u6557",skipped:"\u7565\u904E"}[e]||e||"\u672A\u77E5"}function kn(e){let t=String(e.status||"pending"),s=Math.max(0,Math.min(100,Number(e.progress)||0)),a=t==="pending"?0:t==="running"?Math.max(s,12):100,r=t==="running"?"\u57F7\u884C\u4E2D\u2026":t==="pending"?"\u7B49\u5F85":e.duration_ms?F(e.duration_ms):Js(t);return`<div class="test-flow-step is-${n(t)}">
    <div class="test-flow-step-head">
      <span class="test-flow-model" title="${n(e.model||"")}">${n(e.model||"\u2014")}</span>
      <span class="test-flow-step-meta">${n(r)}</span>
    </div>
    <div class="test-flow-step-loc">${n(e.module||"\u2014")}<span class="flow-segment-dot">\xB7</span>${n(e.function||"\u2014")}</div>
    <div class="test-flow-track">
      <span class="test-flow-bar" style="width:${a}%"></span>
    </div>
    ${e.error_message?`<div class="test-flow-error">${n(e.error_message)}</div>`:""}
    ${e.details&&Object.keys(e.details).length?`<div class="test-flow-details">${n(Object.entries(e.details).slice(0,4).map(([i,o])=>`${i}=${Gs(o)}`).join(" \xB7 "))}</div>`:""}
  </div>`}function xn(e,t){if(!t.length)return"";let s=t.reduce((a,r)=>a+(Number(r.progress)||0),0)/t.length;return`<section class="test-flow-stage">
    <div class="test-flow-stage-head">
      <span class="test-flow-stage-title">${n(ct[e]||e)}</span>
      <span class="test-flow-stage-meta">${t.length} \u500B\u7A0B\u5E8F \xB7 ${Math.round(s)}%</span>
    </div>
    <div class="test-flow-stage-steps">${t.map(kn).join("")}</div>
  </section>`}function Vs(e,t){let s=Date.now(),a=new Map;for(let g of t){let f=Number(g.duration_ms)||0;if(g.status==="running"&&g.started_at){let _=Date.parse(g.started_at);Number.isFinite(_)&&(f=Math.max(f,s-_))}a.set(g.stage,(a.get(g.stage)||0)+f)}let r=Array.isArray(e.stage_order)?e.stage_order:Object.keys(ct),i=[],o=new Set;for(let g of r)t.some(f=>f.stage===g)&&(o.add(g),i.push({stage:g,label:ct[g]||g,short:Us[g]||g,duration:a.get(g)||0}));for(let[g,f]of a)o.has(g)||i.push({stage:g,label:ct[g]||g,short:Us[g]||g,duration:f});let l=i.reduce((g,f)=>g+f.duration,0),v=Number(e.total_ms)||0,b=Math.max(l,v),$=Math.max(0,b-l);return $>1&&i.push({stage:"overhead",label:"\u5176\u4ED6\uFF0F\u6392\u7A0B",short:"\u5176\u4ED6",duration:$}),{entries:i,total:b||l,stepTotal:l}}function Sn(e,t){let{entries:s,total:a}=Vs(e,t),r=s.filter(o=>o.duration>0).map(o=>{let l=a?o.duration/a*100:0;return`<span class="test-flow-time-seg stage-${n(o.stage)}" style="width:${l.toFixed(2)}%" title="${n(o.label)} \xB7 ${F(o.duration)}\uFF08${l.toFixed(1)}%\uFF09">${l>=8?n(o.short):""}</span>`}).join(""),i=s.map(o=>{let l=a?o.duration/a*100:0;return`<span class="test-flow-legend-item">
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
  </div>`}function tt(e,t,s,a={}){let r=a.showHistory!==!1,i=[`<option value="" ${s?"":"selected"}>\u76EE\u524D\uFF0F\u6700\u65B0\u6E2C\u8A66</option>`,...(t||[]).map(S=>`<option value="${n(S.run_id)}" ${S.run_id===s?"selected":""}>${n(Js(S.status))} \xB7 ${n((S.question||"\u672A\u547D\u540D").slice(0,28))} \xB7 ${n(ae(S.started_at))}</option>`)].join(""),o=r?`<label class="test-flow-select-label">\u6B77\u53F2
        <select class="select" id="test-run-select">${i}</select>
      </label>
      <button class="btn btn-secondary btn-sm" type="button" id="test-flow-refresh">
        ${y("refresh",13)}<span>\u66F4\u65B0</span>
      </button>`:`<a class="btn btn-secondary btn-sm" href="#/performance">
        ${y("activity",13)}<span>\u6B77\u53F2 Flow</span>
      </a>`,l=`<div class="test-flow-head">
    <div class="test-flow-heading">
      <div class="eyebrow">PERFORMANCE TEST FLOW</div>
      <div class="test-flow-title">\u6E2C\u8A66\u6D41\u7A0B ${e?Y(e.status):""}</div>
      <div class="test-flow-question">${e?n(e.question||"\u672A\u547D\u540D\u6E2C\u8A66"):"\u5C1A\u7121\u6E2C\u8A66\u6D41\u7A0B\u3002\u8ACB\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u4E26\u5728 RAG \u9801\u63D0\u554F\u3002"}</div>
    </div>
    <div class="test-flow-actions">${o}</div>
  </div>`;if(!e)return`<div class="test-flow-panel card">${l}
      ${be({iconName:"activity",title:"\u7B49\u5F85\u6E2C\u8A66\u6D41\u7A0B",text:"\u5230\u300C\u7CFB\u7D71\u6E2C\u8A66\u300D\u9801\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C\u6240\u6709\u53EF\u7528\u6A21\u578B\uFF0C\u4E26\u5728\u9019\u88E1\u5373\u6642\u986F\u793A\u6BCF\u500B\u968E\u6BB5\u7684\u9032\u5EA6\u3002"})}
    </div>`;let v=Array.isArray(e.steps)?e.steps:[],b=new Map;for(let S of v)b.has(S.stage)||b.set(S.stage,[]),b.get(S.stage).push(S);let g=(Array.isArray(e.stage_order)?e.stage_order:Object.keys(ct)).map(S=>xn(S,b.get(S)||[])).join(""),f=e.models||{},_=Vs(e,v),h=e.status==="running"?`${F(_.total)}\uFF08\u4F30\u7B97\uFF09`:F(e.total_ms),x=v.find(S=>S.stage==="llm"&&S.model===e.summary?.primary_model)||v.find(S=>S.stage==="llm"&&S.details?.answer_preview),C=e.answer||x?.details?.answer_preview||"",j=`<div class="test-flow-answer">
    <div class="test-flow-answer-head">
      <span>RAG \u5F15\u64CE\u7B54\u6848</span>
      ${e.summary?.primary_model?`<span class="mono">${n(e.summary.primary_model)}</span>`:""}
    </div>
    <p>${C?n(C):e.status==="running"?"\u6E2C\u8A66\u9032\u884C\u4E2D\uFF0C\u5C1A\u672A\u7522\u751F\u6700\u7D42\u7B54\u6848\u3002":"\u6B64\u6E2C\u8A66\u6C92\u6709\u4FDD\u5B58\u53EF\u986F\u793A\u7684\u7B54\u6848\u3002"}</p>
  </div>`;return`<div class="test-flow-panel card">
    ${l}
    <div class="test-flow-meta">
      <span><strong>Run</strong> <span class="mono">${n(e.run_id)}</span></span>
      <span><strong>\u958B\u59CB</strong> ${n(ae(e.started_at))}</span>
      <span><strong>\u7E3D\u8017\u6642</strong> ${h}</span>
      <span><strong>Embedding</strong> ${Array.isArray(f.embedding)?f.embedding.length:0} \u500B</span>
      <span><strong>LLM</strong> ${Array.isArray(f.llm)?f.llm.length:0} \u500B</span>
      <span><strong>\u968E\u6BB5</strong> ${n(e.stage_label||e.stage||"\u2014")}</span>
    </div>
    ${j}
    <div class="test-flow-stages">${g||'<p class="muted">\u6B64\u6E2C\u8A66\u6C92\u6709\u5340\u6BB5\u8CC7\u6599\u3002</p>'}</div>
    <div class="test-flow-total">
      <div class="test-flow-total-head">
        <span>\u7E3D\u6D41\u7A0B\u9032\u5EA6</span>
        <span>${Number(e.progress)||0}%</span>
      </div>
      <div class="test-flow-track is-total ${e.status==="running"?"is-running":""}">
        <span class="test-flow-bar is-total" style="width:${Math.max(0,Math.min(100,Number(e.progress)||0))}%"></span>
      </div>
    </div>
    ${Sn(e,v)}
    <div class="test-flow-foot">
      <span>${e.status==="running"?"\u6E2C\u8A66\u57F7\u884C\u4E2D\uFF1B\u6B64\u5716\u8868\u6703\u81EA\u52D5\u66F4\u65B0\u3002":r?"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u5F9E\u4E0A\u65B9\u300C\u6B77\u53F2\u300D\u9078\u55AE\u9084\u539F\u5176\u4ED6 Flow\u3002":"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u81F3\u6548\u80FD\u5831\u8868\u67E5\u770B\u6B77\u53F2 Flow\u3002"}</span>
      ${e.summary?.primary_model?`<span class="mono">primary=${n(e.summary.primary_model)}</span>`:""}
    </div>
  </div>`}function An(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.summary)?e.summary:[],a=e.flow_stats||e.meta?.flow_stats||{},r=e.index_stats||null;return`<div class="report-card performance-flow-report" data-database="performance">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">PERFORMANCE FLOW REPORT</div>
        <div class="report-title">
          \u6548\u80FD\u5831\u8868 ${Y(e.status||"ok")}
          <span class="chip">performance_records</span>
        </div>
        <div class="report-sub">
          ${p(e.total)} \u7B46\u7B26\u5408 \xB7 ${F(e.duration_ms)} \xB7
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
    ${$n(r)}
    ${gn(a)}
    <div class="report-section-head perf-flow-list-head">
      <span class="report-section-title">Flow \u7D00\u9304</span>
      <span class="muted" style="font-size:9.5px">\u9EDE\u64CA\u5217\u5C55\u958B\u6A21\u7D44\u3001\u51FD\u6578\u3001\u53C3\u6578\u8207\u5340\u6BB5\u8017\u6642</span>
    </div>
    <div class="perf-record-list">
      ${t.length?t.map((i,o)=>_n(i,o)).join(""):be({iconName:"activity",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684 Flow",text:"\u653E\u5BEC\u65E5\u671F\u3001\u6A21\u578B\u6216\u8017\u6642\u689D\u4EF6\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}
    </div>
    ${wn(e)}
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
  </div>`}async function Ln(e,t){let s=!1,a=as(),r={processes:[],modules:[],statuses:[],methods:[],models:[]},i=1,o=25,l=null;e.innerHTML=`<section class="page data-page performance-page">
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
  </section>`;let v=e.querySelector("#performance-filter-fields"),b=e.querySelector("#performance-filter-form"),$=e.querySelector("#performance-test-flow"),g=e.querySelector("#performance-report"),f=e.querySelector("#performance-meta"),_=e.querySelector("#performance-refresh"),h=null,x=[],C="",j=null,S="",M=()=>{v.innerHTML=cn(r,a)},E=()=>{let q=JSON.stringify({selected:C,tick:h?.status==="running"?Math.floor(Date.now()/1e3):0,runs:x.map(N=>`${N.run_id}:${N.status}`),run:h?{run_id:h.run_id,status:h.status,progress:h.progress,steps:(h.steps||[]).map(N=>`${N.stage}:${N.model}:${N.status}:${N.progress}`)}:null});q!==S&&(S=q,$.innerHTML=tt(h,x,C))},R=async()=>{try{let q=await H.testRuns(30);if(s)return;x=Array.isArray(q.runs)?q.runs:[]}catch{if(s)return;x=[]}},z=async()=>{try{let q=C?await H.testRun(C):await H.testRunCurrent();if(s)return;h=q.run||null,!C&&h&&h.status!=="running"&&!x.some(N=>N.run_id===h.run_id)&&await R(),E()}catch{if(s)return;h=null,E()}},X=async()=>{s||(C||await z(),s||(j=window.setTimeout(X,1500)))};$.addEventListener("change",async q=>{q.target.id==="test-run-select"&&(C=String(q.target.value||""),await z())}),$.addEventListener("click",async q=>{q.target.closest("#test-flow-refresh")&&(C="",await R(),await z())});let U=async(q=i)=>{i=Math.max(1,Number(q)||1),a=Hs(),g.innerHTML=ot({label:"\u6548\u80FD\u5831\u8868"});let N=e.querySelector("#performance-run");J(N,!0,"\u67E5\u8A62\u4E2D\u2026");try{let O=await H.performance(a,i,o);if(s)return;l=O,i=Number(O.page)||i,o=Number(O.page_size)||o,g.innerHTML=An(O),f.textContent=`PERFORMANCE \xB7 ${p(O.total)} \u7B46`,f.className="badge badge-neutral badge-mono"}catch(O){if(s)return;g.innerHTML=St(O,{label:"\u6548\u80FD\u5831\u8868"}),D(O.message||"\u6548\u80FD\u5831\u8868\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{s||J(N,!1)}},W=async()=>{try{r=await H.performanceOptions()}catch{r={processes:[],modules:[],statuses:[],methods:[],models:[]}}M()};return b.addEventListener("submit",q=>{q.preventDefault(),U(1)}),e.querySelector('[data-action="reset"]').addEventListener("click",()=>{a=as(),i=1,M(),U(1)}),_.addEventListener("click",async()=>{a=Hs(),_.disabled=!0,J(_,!0,"\u6574\u7406\u4E2D\u2026"),await W(),await R(),s||await z(),s||await U(1),s||(_.disabled=!1,J(_,!1))}),g.addEventListener("click",async q=>{let N=q.target.closest("[data-action]");if(!N||!l)return;let O=N.dataset.action;if(O==="retry"){U(i);return}if(O==="prev-page"){U(Math.max(1,Number(l.page)-1));return}if(O==="next-page"){let K=Math.max(1,Math.ceil(Number(l.total)/Number(l.page_size)));U(Math.min(K,Number(l.page)+1));return}if(O==="copy-query"){let K=await gt(l.query_text||"");D(K?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",K?"ok":"warn");return}if(O==="export-json"){let K=`performance-page-${l.page}.json`;Oe(K,JSON.stringify(Lt(l),null,2),"application/json;charset=utf-8"),D(`\u5DF2\u532F\u51FA ${K}`,"ok");return}if(O==="export-csv"){let K=`performance-page-${l.page}.csv`;Oe(K,At(l),"text/csv;charset=utf-8"),D(`\u5DF2\u532F\u51FA ${K}`,"ok")}}),g.addEventListener("change",q=>{q.target.matches("[data-page-size]")&&(o=Number(q.target.value)||25,zs.includes(o)||(o=25),U(1))}),await Promise.allSettled([W(),R()]),s||(await z(),await U(1),X()),t&&typeof t.setTitle=="function"&&t.setTitle("\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"),()=>{s=!0,j&&window.clearTimeout(j)}}var Mn=["\u91D1\u878D\u6D88\u8CBB\u8005\u4FDD\u8B77\u6CD5\u5982\u4F55\u8655\u7406\u91D1\u878D\u6D88\u8CBB\u722D\u8B70\uFF1F","\u8B49\u5238\u4EA4\u6613\u6CD5\u5C0D\u5167\u7DDA\u4EA4\u6613\u6709\u4EC0\u9EBC\u898F\u7BC4\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5438\u6536\u5B58\u6B3E\u8207\u6388\u4FE1\u6709\u54EA\u4E9B\u9650\u5236\uFF1F","\u4FDD\u96AA\u6CD5\u5C0D\u65BC\u696D\u52D9\u54E1\u4E0D\u7576\u62DB\u652C\u7684\u8CAC\u4EFB\u898F\u5B9A\uFF1F","\u9280\u884C\u6CD5\u6709\u591A\u5C11\u689D\u6587\uFF1F","\u8B49\u5238\u71DF\u696D\u54E1\u5E38\u89F8\u72AF\u4EC0\u9EBC\u6CD5\u898F\u6216\u547D\u4EE4\uFF1F","\u6709\u54EA\u4E9B\u6CD5\u898F\u662F\u548C\u58FD\u96AA\u53CA\u7522\u96AA\u76F8\u95DC\u7684\uFF1F"];function Tn(){return`<div class="answer-placeholder">
    <span class="empty-icon">${y("sparkles",26)}</span>
    <h2 class="empty-title">\u7B54\u6848\u53EA\u6703\u4F86\u81EA\u6AA2\u7D22\u5230\u7684\u5224\u6C7A\u53CA\u6CD5\u898F\u7247\u6BB5</h2>
    <p class="empty-text">\u9001\u51FA\u554F\u984C\u5F8C\uFF0C\u7CFB\u7D71\u6703\u5148\u4EE5 Qdrant \u6AA2\u7D22\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\u4E26\u6A19\u793A\u5F15\u7528\u7DE8\u865F\u3002
      \u82E5\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u660E\u78BA\u986F\u793A\u964D\u7D1A\u72C0\u614B\uFF0C\u4E0D\u6703\u6191\u7A7A\u751F\u6210\u7B54\u6848\u3002</p>
  </div>`}var qn={"http.request":"FastAPI \u63A5\u6536\u8ACB\u6C42","http.response":"\u56DE\u50B3\u7D50\u679C\u7D66\u524D\u7AEF","rag.answer_question":"RAG \u4E3B\u6D41\u7A0B","rag.coverage":"PostgreSQL \u7D22\u5F15\u8986\u84CB\u6AA2\u67E5","rag.law_retrieval":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22","rag.law_lookup":"\u6BD4\u5C0D\u554F\u984C\u4E2D\u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u540D\u7A31","rag.law_content":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u689D\u6587","rag.qdrant_precheck":"Qdrant collection \u6AA2\u67E5","rag.search":"RAG \u6AA2\u7D22","rag.embed_query":"Ollama embedding \u67E5\u8A62\u5411\u91CF","rag.qdrant_search":"Qdrant \u5411\u91CF\u641C\u5C0B","rag.fetch_documents":"PostgreSQL \u8B80\u53D6\u5224\u6C7A","rag.postgres_fetch":"PostgreSQL \u5224\u6C7A\u67E5\u8A62","rag.build_citations":"\u6574\u7406\u5F15\u7528\u8207\u5224\u6C7A\u7247\u6BB5","rag.extract_excerpt":"\u64F7\u53D6\u76F8\u95DC\u7247\u6BB5","rag.llm":"LLM \u56DE\u7B54\u751F\u6210","rag.llm_request":"Ollama LLM \u751F\u6210","rag.validate_citations":"\u9A57\u8B49\u5F15\u7528\u7DE8\u865F","rag.test_mode":"\u6E2C\u8A66\u6A21\u5F0F\u591A\u6A21\u578B\u6D41\u7A0B","rag.preview_fallback":"\u6CD5\u898F\u9810\u89BD\u964D\u7D1A"};function En(e){let t=String(e?.name||""),s=e?.params||{},a=String(s.model||s.embedding_model||"").trim();return t==="rag.llm_request"?`Ollama run ${a||"LLM"}`:t==="rag.llm"?`LLM \u56DE\u7B54\u751F\u6210${a?` \xB7 ${a}`:""}`:t==="rag.embed_query"?`Ollama embedding \u67E5\u8A62\u5411\u91CF${a?` \xB7 ${a}`:""}`:qn[t]||t||"backend step"}function Ws(e){return[e?.module,e?.function,e?.name].filter(Boolean).join(" \xB7 ")}function Ks(e){let t=Number(e);return Number.isFinite(t)?`${p(Math.max(0,Math.round(t)))} ms`:"\u2014"}function rs(e,t){if(!e)return;e.classList.toggle("is-open",t);let s=e.querySelector("#rag-process-body"),a=e.querySelector(".rag-process-toggle");s&&(s.hidden=!t),a&&(a.setAttribute("aria-expanded",String(t)),a.title=t?"\u6536\u5408\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B":"\u5C55\u958B\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B")}function jn(){return`<div class="rag-process is-open" id="rag-process">
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
  </div>`}function Nn(e){let t=e.querySelector("#rag-process"),s=t?.querySelector("#rag-process-list"),a=t?.querySelector("#rag-process-summary"),r=performance.now(),i=new Map,o=(f,_,h)=>{let x=f.querySelector(_);x&&(x.textContent=h)},l=f=>{if(f.failed){o(f.element,".rag-process-meta","\u5931\u6557");return}if(f.hasChildren){o(f.element,".rag-process-meta","");return}o(f.element,".rag-process-meta",Ks(f.durationMs))},v=f=>{let _=f-1,h=[...i.values()].reverse();for(let x of h){if(_<0)break;x.depth<=_&&(x.hasChildren||(x.hasChildren=!0,x.element.dataset.hasChildren="true",x.finished&&l(x)),_=x.depth-1)}},b=f=>{if(!s)return null;let _=String(f?.seq??`step-${i.size+1}`),h=i.get(_);if(!h){let x=Math.max(0,Math.min(6,Number(f?.depth)||0));v(x);let C=document.createElement("div");C.className="rag-process-item is-running",C.dataset.processKey=_,C.style.setProperty("--depth",String(x)),C.innerHTML=`<span class="rag-process-dot"></span>
        <span class="rag-process-label"></span>
        <span class="rag-process-meta">\u57F7\u884C\u4E2D\u2026</span>`,s.appendChild(C),h={element:C,depth:x,hasChildren:!1,finished:!1,failed:!1,durationMs:0},i.set(_,h)}return o(h.element,".rag-process-label",En(f)),h.element.title=Ws(f),h};return{step:f=>{let _=f?.segment;if(!_)return;let h=b(_);if(h){if(f.type==="segment_start"){h.element.classList.add("is-running"),o(h.element,".rag-process-meta","\u57F7\u884C\u4E2D\u2026");return}if(f.type==="segment_end"){let x=_.status==="error";h.element.classList.remove("is-running"),h.element.classList.toggle("is-error",x),h.finished=!0,h.failed=x,h.durationMs=Number(_.duration_ms)||0,l(h),h.element.title=[Ws(_),x&&_.error||""].filter(Boolean).join(" \xB7 ")}}},finish:(f=!0)=>{if(!t)return"";t.querySelectorAll(".rag-process-item.is-running").forEach(x=>{x.classList.remove("is-running");let C=x.dataset.hasChildren==="true";o(x,".rag-process-meta",C?"":f?"\u5B8C\u6210":"\u4E2D\u65B7")});let _=s?.children.length||i.size,h=Ks(Math.max(0,performance.now()-r));return a&&(a.textContent=f?`\u5B8C\u6210 \xB7 ${_} \u6B65 \xB7 ${h}`:`\u5931\u6557 \xB7 ${_} \u6B65`),t.classList.add("is-complete"),rs(t,!1),t.outerHTML},collapse:()=>rs(t,!1)}}function Pn(e,t=!1){let s=t?"\u6E2C\u8A66\u6A21\u5F0F\uFF1A\u6B63\u5728\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207 LLM \u6A21\u578B\uFF0C\u53EF\u80FD\u9700\u8981\u6578\u5206\u9418\u2026":"\u6B63\u5728\u4EE5\u5411\u91CF\u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\u7247\u6BB5\u4E26\u751F\u6210\u56DE\u7B54\uFF1B\u5FEB\u901F\u6A21\u5F0F\u901A\u5E38 2\u201310 \u79D2\u2026";return`<div class="answer-head">
      <div class="answer-head-left">${y("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u4E2D</span>
      </div>
      <div class="answer-head-meta"><span class="spinner"></span></div>
      ${t?"":jn()}
    </div>
    <div class="answer-body">
      <p class="answer-text">${s}\u300C${n(e)}\u300D</p>
      <div class="skeleton skeleton-line" style="margin-top:22px;width:92%"></div>
      <div class="skeleton skeleton-line" style="width:76%"></div>
      <div class="skeleton skeleton-line" style="width:84%"></div>
    </div>`}function Cn(e,t){let s=e.score===null||e.score===void 0?"":`\u76F8\u4F3C\u5EA6 ${Number(e.score).toFixed(4)}`,a=[e.court,e.jdate,s].filter(Boolean).map(l=>`<span>${n(l)}</span>`).join(""),r=(Array.isArray(e.matched_laws)?e.matched_laws:[]).slice(0,5).map(l=>`<span class="chip">${n(l)}</span>`).join(""),i=e.jid?` data-action="open-parquet-judgment"
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
  </article>`}function Rn(e,t){let s=[e.law_level,e.law_category,e.article_count?`${p(e.article_count)} \u689D`:""].filter(Boolean).map(r=>`<span>${n(r)}</span>`).join(""),a=e.law_url?`<a class="citation-link" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">\u4F86\u6E90${y("external",11)}</a>`:"";return`<article class="citation">
    <span class="citation-index">${String(e.index??t+1).padStart(2,"0")}</span>
    <div class="citation-body">
      <h4 class="citation-name">${n(e.law_name||"\u672A\u547D\u540D\u6CD5\u898F")}</h4>
      <div class="citation-meta">${s||"<span>\u6CD5\u898F metadata</span>"}</div>
      ${e.snippet?`<p class="citation-snippet">${n(e.snippet)}</p>`:""}
    </div>
    ${a}
  </article>`}function In(e,t){let s=e.source_label||(e.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),a=e.law_level&&e.law_level!==s?e.law_level:"",r=[`<span class="badge ${e.source_type==="order"?"badge-warn":"badge-info"}">${n(s)}</span>`,a,e.law_category,e.article_count?`${p(e.article_count)} \u689D`:"",e.law_modified_date?`\u7570\u52D5 ${je(e.law_modified_date)}`:""].filter(Boolean).map(_=>`<span>${_}</span>`).join(""),i=e.first_promulgation?`<div class="citation-meta"><span>\u6700\u65E9\u5236\u5B9A\uFF1A${n(e.first_promulgation.roc_date)}\uFF08\u897F\u5143 ${n(e.first_promulgation.gregorian_date)}\uFF09</span></div>`:"",o=e.stats,l=o?`<div class="law-source-stats">
        <span>\u63D0\u53CA\u300C${n(o.entity||"")}\u300D\u7684\u5224\u6C7A ${p(o.judgment_count||0)} \u7B46</span>
        <span>\u672C\u6CD5\u898F\u88AB\u5F15\u7528 ${p(o.law_count||0)} \u6B21</span>
      </div>`:"",v=e.law_key||"",b=e.source_type||"",$=(Array.isArray(e.articles)?e.articles:[]).slice(0,2).map(_=>{let h=String(_.article_no||"");return`<div class="law-source-article"${v&&h?` data-action="open-law-source"
        data-law-key="${n(v)}"
        data-source-type="${n(b)}"
        data-article-no="${n(h)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u9078\u67E5\u770B ${n(h)} \u7684\u5B8C\u6574\u5167\u5BB9"
        aria-label="\u958B\u555F ${n(e.law_name||"\u6CD5\u898F")} ${n(h)} \u7684\u5B8C\u6574\u689D\u6587"`:""}>
        <span class="law-source-article-no">${n(_.article_no||"\u689D\u6587")}</span>
        <p class="law-source-article-text">${n(_.article_content||"")}</p>
      </div>`}).join(""),g=e.law_url?`<a class="citation-link" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">\u6CD5\u898F\u4F86\u6E90${y("external",11)}</a>`:"",f=e.law_key?` data-action="open-law-source"
        data-law-key="${n(e.law_key)}"
        data-source-type="${n(e.source_type||"")}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F\u672C\u5730 Parquet \u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u59CB\u689D\u6587"
        aria-label="\u958B\u555F ${n(e.law_name||"\u6CD5\u898F")} \u539F\u59CB\u689D\u6587"`:"";return`<article class="citation law-source">
    <span class="citation-index">${String(e.index??t+1).padStart(2,"0")}</span>
    <div class="citation-body"${f}>
      <h4 class="citation-name">${n(e.law_name||"\u672A\u547D\u540D\u6CD5\u898F")}</h4>
      <div class="citation-meta">${r}</div>
      ${i}
      ${l}
      ${$}
    </div>
    <div class="citation-links">${g}</div>
  </article>`}function Ys(e){let t=Array.isArray(e.citations)?e.citations:[],s=Array.isArray(e.judgments)?e.judgments:[],a=Array.isArray(e.law_sources)?e.law_sources:[],r=Array.isArray(e.matched_terms)?e.matched_terms:[],i=e.status||"preview",o=!!e.partial,l=!!e.streaming,v=!!e.show_sources||!o,b=s.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u5224\u6C7A \xB7 ${s.length} \u7B46</span>
        <span>vector retrieval \xB7 [\u7DE8\u865F] \u5C0D\u61C9\u56DE\u7B54\u5F15\u7528</span>
      </div>
      <div class="citation-list">${s.map((B,le)=>Cn(B,le)).join("")}</div>`:"",$=a.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4 \xB7 ${a.length} \u7B46</span>
        <span>PostgreSQL metadata \xB7 Parquet \u689D\u6587</span>
      </div>
      <div class="citation-list">${a.map((B,le)=>In(B,le)).join("")}</div>`:"",g=!s.length&&t.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F \xB7 ${t.length} \u7B46</span>
        <span>metadata match</span>
      </div>
      <div class="citation-list">${t.map((B,le)=>Rn(B,le)).join("")}</div>`:"",f=v?b+$+g:"";!f&&!o&&(f=`<div class="answer-divider"></div>
      ${be({iconName:"file",title:"\u6C92\u6709\u53EF\u5F15\u7528\u7684\u4F86\u6E90",text:i==="retrieval_only"?"\u76EE\u524D\u5DF2\u5EFA\u7ACB\u7684\u5411\u91CF\u7D22\u5F15\u4E2D\u6C92\u6709\u8DB3\u5920\u76F8\u4F3C\u7684\u5224\u6C7A\uFF0C\u4E5F\u6C92\u6709\u53EF\u5C0D\u61C9\u7684\u6CD5\u898F\u6216\u547D\u4EE4\u3002\u7CFB\u7D71\u4E0D\u6703\u5728\u6C92\u6709\u4F86\u6E90\u6642\u751F\u6210\u7B54\u6848\u3002":"\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u4E14\u554F\u984C\u4E2D\u6C92\u6709\u53EF\u76F4\u63A5\u5C0D\u61C9\u7684\u73FE\u884C\u6CD5\u898F\u540D\u7A31\u3002"})}`);let _=r.length?`<div class="answer-section-label" style="margin-top:18px">
        <span>\u547D\u4E2D\u8A5E\u5F59</span>
      </div>
      <div class="chips">${r.map(B=>`<span class="chip">${n(B)}</span>`).join("")}</div>`:"",h=e.test_run,x=String(e.llm_model||h?.primary_model||"").trim(),C=String(e.embedding_model||"").trim(),j=[x?`LLM\uFF1A${x}`:"",C?`Embedding\uFF1A${C}`:""].filter(Boolean).join(" \xB7 "),S=e.answer_source==="structured",M=String(e.law_answer||"").trim(),E=e.law_framework||null,R=Array.isArray(E?.rows)?E.rows:[],z=Array.isArray(E?.sources)?E.sources:[],X=R.length>0,U=!!M&&!S&&!X,W=l||e.answer_source==="llm"?"LLM \u7D9C\u5408\u56DE\u7B54":"\u6AA2\u7D22\u7D50\u679C\u6458\u8981",q=X?`<div class="answer-block law-framework-block">
        <div class="answer-block-head">
          <span>${n(E.title||"\u76F8\u95DC\u6CD5\u898F\u7684\u8CAC\u4EFB\u67B6\u69CB")}</span>
          <span>${R.length} \u689D</span>
        </div>
        <div class="table-wrap law-framework-table-wrap">
          <table class="data-table is-compact law-framework-table">
            <thead>
              <tr><th scope="col">\u6CD5\u898F</th><th scope="col">\u689D\u6587</th><th scope="col">\u898F\u7BC4\u91CD\u9EDE</th></tr>
            </thead>
            <tbody>
              ${R.map(B=>`<tr>
                    <td>${n(B.law_name||"\u2014")}</td>
                    <td class="cell-number">${n(B.article_no||"\u2014")}</td>
                    <td>${n(B.focus||"\u2014")}</td>
                  </tr>`).join("")}
            </tbody>
          </table>
        </div>
        ${z.length?`<div class="law-framework-sources">
                <span>\u6CD5\u898F\u4F86\u6E90</span>
                ${z.map(B=>`<span class="chip">${n(B.law_name||B)}${B&&B.index!==null&&B.index!==void 0?` [${n(B.index)}]`:""}</span>`).join("")}
              </div>`:""}
      </div>`:"",N=e.answer_source==="llm"&&x?`<span class="answer-model" title="${n(j)}">${y("brain",11)}${n(x)}</span>`:S?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${y("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"",O=l?`${x||"LLM"} \xB7 \u751F\u6210\u4E2D`:N?x||"structured":"retrieval",K=h?`<div class="test-run-summary">
        <div class="test-run-summary-head">
          <span class="badge badge-warn">\u6E2C\u8A66\u6A21\u5F0F</span>
          ${Y(h.status)}
          <span class="mono">${n(h.run_id||"")}</span>
        </div>
        <div class="test-run-summary-body">
          <span>Embedding ${Number(h.models?.embedding?.length||0)} \u500B</span>
          <span>LLM ${Number(h.models?.llm?.length||0)} \u500B</span>
          <span>\u4E3B\u56DE\u7B54 ${n(h.primary_model||"\u2014")}</span>
          <span>${Number(h.total_ms||0)} ms</span>
          <a href="#/performance">\u67E5\u770B\u6E2C\u8A66 Flow</a>
        </div>
      </div>`:"",Te=String(e.answer||"").trim()||(l?"\u6B63\u5728\u751F\u6210\u56DE\u7B54\u2026":o?"\u6B63\u5728\u6AA2\u7D22\u5224\u6C7A\u4E26\u751F\u6210 LLM \u56DE\u7B54\u2026":"\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u56DE\u7B54\u3002"),ie=l?" data-partial-answer":"",ge=l?" is-streaming":"";return`${q}
      ${U?`<div class="answer-block law-answer-block">
              <div class="answer-block-head">
                <span>\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22\u7D50\u679C</span>
                <span>${o&&!v?"\u6CD5\u898F\u8CC7\u6599\u5EAB":`${a.length} \u7B46\u4F86\u6E90`}</span>
              </div>
              <p class="answer-text">${n(M)}</p>
            </div>`:""}
      <div class="answer-block">
        ${U||X?`<div class="answer-block-head">
                <span>${n(W)}</span>
                <span>${n(O)}</span>
              </div>`:""}
        <p class="answer-text${ge}"${ie}>${n(Te)}</p>
      </div>
      ${e.notice?`<div class="answer-notice">${n(e.notice)}</div>`:""}
      ${K}
      ${_}
      ${f}`}function Bn(e,t,s=""){let a=t.status||"preview",r=a==="operational"?"\u5B8C\u6210":a==="retrieval_only"?"\u50C5\u6AA2\u7D22\u7D50\u679C":a==="preview"?"\u6CD5\u898F\u9810\u89BD":a==="unavailable"||a==="not_configured"?"\u8CC7\u6599\u4E0D\u53EF\u7528":a==="degraded"?"\u964D\u7D1A":"\u5B8C\u6210",i=t.test_run,o=String(t.llm_model||i?.primary_model||"").trim(),l=String(t.embedding_model||"").trim(),v=[o?`LLM\uFF1A${o}`:"",l?`Embedding\uFF1A${l}`:""].filter(Boolean).join(" \xB7 "),b=t.answer_source==="structured",$=t.answer_source==="llm"&&o?`<span class="answer-model" title="${n(v)}">${y("brain",11)}${n(o)}</span>`:b?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${y("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"";return`<div class="answer-head">
      <div class="answer-head-left">${y("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u7D50\u679C</span>
      </div>
      <div class="answer-head-meta">
        ${Y(a,r)}
        <span>${Number(t.duration_ms||0)} ms</span>
        ${$}
      </div>
      ${s}
    </div>
    <div class="answer-body">${Ys(t)}</div>`}function Dn(e,t=""){return`<div class="answer-head">
      <div class="answer-head-left">${y("alert",16)}
        <span class="answer-head-title">\u7121\u6CD5\u5B8C\u6210\u6AA2\u7D22</span>
      </div>
      ${t}
    </div>
    <div class="answer-body">
      ${V({tone:"danger",title:"\u8ACB\u6C42\u5931\u6557",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
    </div>`}function Fn(e){return e.length?e.map((t,s)=>{let a=Array.isArray(t.payload?.citations)?t.payload.citations.length:0,r=Array.isArray(t.payload?.judgments)?t.payload.judgments.length:0,i=Array.isArray(t.payload?.law_sources)?t.payload.law_sources.length:0,o=a+r+i;return`<button class="history-item" type="button" data-history-index="${s}">
        <span class="history-question">${n(t.title||"\u672A\u547D\u540D\u63D0\u554F")}</span>
        <span class="history-meta">
          <span>${n(Ze(t.created_at))}</span>
          <span>\xB7</span>
          <span>${o?`${o} \u7B46\u4F86\u6E90`:"\u7121\u5F15\u7528"}</span>
        </span>
      </button>`}).join(""):'<div class="history-empty">\u5C1A\u7121\u63D0\u554F\u7D00\u9304\u3002\u9001\u51FA\u7B2C\u4E00\u500B\u554F\u984C\u5F8C\u6703\u4FDD\u5B58\u5728\u6B64\u700F\u89BD\u5668\u3002</div>'}async function On(e){let t=!1,s=[],a="",r=!1,i={embedding:[],llm:[]};e.innerHTML=`<section class="page rag-page">
    <header class="rag-hero">
      <span class="eyebrow">JUDGMENT \xB7 LEGAL RAG</span>
      <h1 class="rag-title">\u8B93\u6BCF\u4E00\u500B\u7B54\u6848\uFF0C\u90FD\u80FD\u56DE\u5230\u6CD5\u898F\u8207\u5224\u6C7A</h1>
      <p class="rag-lead">\u4EE5\u91D1\u878D\u6CD5\u898F\u7684\u73FE\u884C\u689D\u6587\u8207\u5224\u6C7A\u7247\u6BB5\u70BA\u6AA2\u7D22\u57FA\u790E\u3002
        \u5148\u5F9E Qdrant \u6AA2\u7D22\u76F8\u4F3C\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\uFF1B\u82E5\u7D22\u5F15\u6216\u6A21\u578B\u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u53EF\u9A57\u8B49\u7684\u6AA2\u7D22\u7D50\u679C\u3002</p>
      <div id="rag-mode-notice">${V({tone:"info",title:"RAG \u670D\u52D9\u72C0\u614B\u6AA2\u67E5\u4E2D",text:"\u6B63\u5728\u78BA\u8A8D Qdrant\u3001Embedding \u8207 LLM \u72C0\u614B\uFF1B\u6240\u6709\u56DE\u7B54\u90FD\u6703\u6A19\u793A\u53EF\u56DE\u6EAF\u7684\u4F86\u6E90\u3002"})}</div>
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
        ${Mn.map(d=>`<button class="example-chip" type="button" data-question="${n(d)}">${n(d)}</button>`).join("")}
      </div>
    </header>

    <div class="rag-grid">
      <section class="card answer-card" id="answer-card" aria-live="polite">
        ${Tn()}
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
  </section>`;let o=e.querySelector("#rag-form"),l=e.querySelector("#rag-question"),v=e.querySelector("#rag-submit"),b=e.querySelector("#answer-card"),$=e.querySelector("#rag-stats"),g=e.querySelector("#rag-stats-mode"),f=e.querySelector("#rag-history"),_=e.querySelector("#rag-storage-note"),h=e.querySelector("#rag-clear-history"),x=e.querySelector("#rag-test-mode"),C=e.querySelector("#rag-test-flow"),j=e.querySelector("#rag-judgment-dialog"),S=e.querySelector("#rag-law-dialog"),M=()=>{document.documentElement.classList.toggle("dialog-open",!!e.querySelector("dialog[open]"))};j?.addEventListener("close",M),S?.addEventListener("close",M);let E=null,R=null,z=()=>{l.style.height="auto",l.style.height=`${Math.min(l.scrollHeight,220)}px`},X=async()=>{try{if(s=await $t({limit:6}),t)return;f.innerHTML=Fn(s),_.textContent=bt()==="indexeddb"?"\u63D0\u554F\u7D00\u9304\u5132\u5B58\u5728\u700F\u89BD\u5668 IndexedDB\uFF0C\u4E0D\u6703\u4E0A\u50B3\u5230\u4F3A\u670D\u5668\u3002":"\u700F\u89BD\u5668\u5132\u5B58\u4E0D\u53EF\u7528\uFF0C\u63D0\u554F\u7D00\u9304\u53EA\u4FDD\u7559\u5728\u672C\u6B21\u5DE5\u4F5C\u968E\u6BB5\u3002"}catch{if(t)return;f.innerHTML='<div class="history-empty">\u7121\u6CD5\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u3002</div>'}},U=async()=>{try{let d=await H.status();if(t)return;let k=d.data||{},I=new Map((d.services||[]).map(Ie=>[Ie.id,Ie])),ee=I.get("qdrant"),oe=I.get("embedding"),te=I.get("rag"),de=I.get("llm"),se=Number(k.judgment_indexed_count||0),G=Number(k.judgment_count||0),me=G?(se/G*100).toFixed(1):"0.0",Ae=k.judgment_vector_points===null||k.judgment_vector_points===void 0?"\u2014":p(k.judgment_vector_points);$.innerHTML=`<div class="mini-stats">
          <div class="mini-stat">
            <div class="mini-stat-value">${p(G)}</div>
            <div class="mini-stat-label">\u5224\u6C7A</div>
          </div>
          <div class="mini-stat">
            <div class="mini-stat-value">${p(se)}</div>
            <div class="mini-stat-label">\u5DF2\u7D22\u5F15</div>
          </div>
          <div class="mini-stat">
            <div class="mini-stat-value">${me}%</div>
            <div class="mini-stat-label">\u7D22\u5F15\u8986\u84CB</div>
          </div>
        </div>
        <div class="side-status-list">
          <div class="side-status-row">
            <span>${y("cube",13)}Qdrant \u5411\u91CF\u7D22\u5F15</span>
            ${Y(ee?.status,ee?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
          </div>
          <div class="side-status-row">
            <span>${y("layers",13)}Embedding\uFF08${n(k.judgment_vector_model||"\u2014")}\uFF09</span>
            ${Y(oe?.status,oe?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
          </div>
          <div class="side-status-row">
            <span>${y("brain",13)}RAG \u56DE\u7B54\u7BA1\u7DDA</span>
            ${Y(te?.status,te?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
          </div>
          <div class="side-status-row">
            <span>${y("sparkles",13)}LLM \u6A21\u578B</span>
            ${Y(de?.status,de?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
          </div>
        </div>
        <div class="side-card-foot" style="padding:0;border:0;margin-top:10px">
          Collection\uFF1A${n(k.judgment_vector_collection||"\u2014")} \xB7
          ${Ae} points \xB7 \u5269\u9918 ${p(k.judgment_index_remaining)} \u7B46\u5F85\u7D22\u5F15
        </div>`;let we=e.querySelector("#rag-mode-notice");we&&(te?.status==="operational"?we.innerHTML=V({tone:"ok",title:"\u6AA2\u7D22\u8207\u56DE\u7B54\u5C31\u7DD2",text:`Qdrant\u3001Embedding \u8207 LLM \u5747\u53EF\u4F7F\u7528\uFF1B\u76EE\u524D\u7D22\u5F15\u6DB5\u84CB ${p(se)} / ${p(G)} \u7B46\u5224\u6C7A\u3002\u56DE\u7B54\u4E0D\u662F\u6CD5\u5F8B\u610F\u898B\u3002`}):te?.status==="degraded"?we.innerHTML=V({tone:"warn",title:"\u90E8\u5206 AI \u5143\u4EF6\u672A\u5C31\u7DD2",text:n(te.detail||"RAG \u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u6AA2\u7D22\u7D50\u679C\u3002")}):we.innerHTML=V({tone:"info",title:"\u5411\u91CF\u7D22\u5F15\u5C1A\u672A\u5C31\u7DD2 \xB7 \u4E0D\u662F\u6CD5\u5F8B\u610F\u898B",text:n(te?.detail||"\u8A2D\u5B9A QDRANT_URL\u3001EMBEDDING_URL \u8207 LLM_URL \u4E26\u57F7\u884C judgment-index-vectors \u5F8C\u5373\u53EF\u555F\u7528\u5224\u6C7A\u6AA2\u7D22\u3002")})),g.className=`badge ${te?.status==="operational"?"badge-ok":te?.status==="not_configured"?"badge-neutral":"badge-warn"} badge-mono`,g.textContent=te?.status==="operational"?"RAG \u5C31\u7DD2":te?.status==="not_configured"?"\u672A\u8A2D\u5B9A":"\u964D\u7D1A"}catch{if(t)return;$.innerHTML='<p class="muted" style="font-size:11px">\u76EE\u524D\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002</p>',g.className="badge badge-danger badge-mono",g.textContent="\u96E2\u7DDA"}},W=()=>{if(!x)return;if(!r){x.innerHTML="";return}let d=Array.isArray(i.embedding)?i.embedding.length:0,k=Array.isArray(i.llm)?i.llm.length:0;x.innerHTML=V({tone:"warn",title:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F",text:`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${d} \u500B embedding \u8207 ${k} \u500B LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002\u6E2C\u8A66 Flow \u6703\u5728\u9801\u9762\u4E0B\u65B9\u5373\u6642\u986F\u793A\uFF0C\u4E5F\u53EF\u5230 <a href="#/tests">\u7CFB\u7D71\u6E2C\u8A66</a> \u6216 <a href="#/performance">\u6548\u80FD\u5831\u8868</a> \u67E5\u770B\u6B77\u53F2\u3002`})},q=async()=>{try{let d=await H.testMode();if(t)return;r=!!d.enabled,i=d.models||{embedding:[],llm:[]},W()}catch{if(t)return;r=!1,W()}},N=d=>{r=!!d.detail?.enabled,i=d.detail?.models||{embedding:[],llm:[]},W()};window.addEventListener("judgment:test-mode",N);let O=d=>{C&&(R=d||null,C.innerHTML=d?tt(d,[],"",{showHistory:!1}):"")},K=()=>{E&&(window.clearTimeout(E),E=null)},fe=()=>{K();let d=async()=>{if(!t){try{let k=await H.testRunCurrent();if(t)return;let I=k.run;I&&I.status==="running"&&O(I)}catch{}t||(E=window.setTimeout(d,1500))}};d()},Te=async d=>{if(!d){O(null);return}try{let k=await H.testRun(d);if(t)return;O(k.run||null)}catch{t||D("\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF0C\u4F46\u7121\u6CD5\u8F09\u5165\u6E2C\u8A66 Flow\u3002","warn")}},ie=async()=>{if(r)try{let d=await H.testRunCurrent();if(t)return;d.run?.status==="running"&&(O(d.run),fe())}catch{}},ge=0,B=(d,k)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">DB ORIGINAL JUDGMENT</div>
      <h2>${n(d)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-parquet-judgment" aria-label="\u95DC\u9589">${y("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${k}</div>`,le=d=>{let k=(Array.isArray(d.matched_laws)?d.matched_laws:[]).map(te=>`<span class="chip">${n(te)}</span>`).join(""),I=[d.court,d.jdate,d.title?`\u6848\u7531\uFF1A${d.title}`:"",d.full_text_length?`${p(d.full_text_length)} \u5B57`:"",d.citation_count?`\u5F15\u7528 ${p(d.citation_count)} \u7B46`:""].filter(Boolean).map(te=>`<span>${n(te)}</span>`).join(""),ee=d.parquet_generated_at?`DB \u5132\u5B58\u539F\u6587\uFF08\u539F\u59CB Parquet\uFF09\xB7 ${n(String(d.parquet_generated_at).replace("T"," ").slice(0,19))}`:"DB \u5132\u5B58\u539F\u6587",oe=d.pdf_url?`<a class="btn btn-secondary btn-sm" href="${n(d.pdf_url)}" target="_blank" rel="noopener noreferrer">${y("external",13)}<span>\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF</span></a>`:"";return B(d.jid||"\u5224\u6C7A\u5168\u6587",`<div class="judgment-dialog-meta">
        <span class="badge badge-info">${n(d.source==="parquet"?"DB \u5132\u5B58\u539F\u6587":"PostgreSQL")}</span>
        ${I}
      </div>
      ${k?`<div class="chips" style="margin:8px 0 10px">${k}</div>`:""}
      <div class="judgment-dialog-source">${ee}</div>
      <pre class="judgment-dialog-text">${n(d.full_text||"\u6B64\u5224\u6C7A\u6C92\u6709\u5168\u6587\u3002")}</pre>
      <div class="judgment-dialog-actions">
        ${oe}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-parquet-judgment">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},Ce=async d=>{if(!j||!d)return;let k=++ge;j.open||j.showModal(),M(),j.innerHTML=B("\u8B80\u53D6\u5224\u6C7A\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E DB \u5132\u5B58\u539F\u6587\u8B80\u53D6 ${n(d)}\u2026</span>
      </div>`);try{let I=await H.judgmentDetail(d,"parquet");if(t||k!==ge)return;j.innerHTML=le(I)}catch(I){if(t||k!==ge)return;j.innerHTML=B("\u7121\u6CD5\u8B80\u53D6 DB \u539F\u6587\u5224\u6C7A",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${n(I.message||"\u627E\u4E0D\u5230\u5224\u6C7A\u5168\u6587\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u5DF2\u57F7\u884C <span class="mono">uv run judgment-import-judgments --raw-only</span>\uFF0C\u4E14\u539F\u59CB Parquet \u5B58\u5728\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-parquet-judgment">\u95DC\u9589</button>
        </div>`)}},xe=0,qe=(d,k)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">LOCAL PARQUET LAW</div>
      <h2>${n(d)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-law-source" aria-label="\u95DC\u9589">${y("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${k}</div>`,Se=(d,k="")=>{let I=String(d.selected_article_no||k||"").trim(),ee=!!I,te=(Array.isArray(d.articles)?d.articles:[]).map(Ee=>{let nt=String(Ee.article_content||"").trim();return nt?Ee.article_type==="C"?`<div class="law-chapter">${n(nt)}</div>`:`<article class="law-article">
          <div class="law-article-head">
            <span class="law-article-no">${n(Ee.article_no||"\u689D\u6587")}</span>
          </div>
          <div class="law-article-text">${n(nt)}</div>
        </article>`:""}).join(""),de=(Array.isArray(d.warnings)?d.warnings:[]).map(Ee=>n(Ee)).join("<br />"),se=d.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F",G=d.meta?.articles_source,me=G==="parquet"?"Parquet \u689D\u6587":G==="postgresql"?"PostgreSQL \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",Ae=d.meta?.snapshot||"",we=[d.law_level,d.law_category,d.article_count?`${p(d.article_count)} \u689D`:"",d.law_modified_date?`\u7570\u52D5 ${je(d.law_modified_date)}`:""].filter(Boolean).map(Ee=>`<span>${n(Ee)}</span>`).join(""),Ie=d.law_url?`<a class="btn btn-secondary btn-sm" href="${n(d.law_url)}" target="_blank" rel="noopener noreferrer">${y("external",13)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:"",_e=!ee&&d.law_histories?`<details class="law-dialog-history">
          <summary>\u6CD5\u898F\u6CBF\u9769</summary>
          <div>${n(d.law_histories)}</div>
        </details>`:"",ut=ee?`<span class="badge badge-mono">${n(I)}</span>`:"",pt=ee?`${d.law_name||d.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4"} \xB7 ${I}`:d.law_name||d.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4";return qe(pt,`<div class="judgment-dialog-meta">
        <span class="badge ${d.source_type==="order"?"badge-warn":"badge-info"}">${n(se)}</span>
        ${ut}
        ${we}
      </div>
      <div class="judgment-dialog-source">${n([me,Ae].filter(Boolean).join(" \xB7 "))}</div>
      ${de?`<div class="law-dialog-warning">${de}</div>`:""}
      ${_e}
      <div class="law-dialog-articles">${te||`<div class="report-empty-inline">${ee?"\u9019\u689D\u689D\u6587\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u5167\u5BB9\u3002":"\u9019\u500B\u6CD5\u898F\uFF0F\u547D\u4EE4\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u3002"}</div>`}</div>
      <div class="judgment-dialog-actions">
        ${Ie}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-law-source">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},Re=async(d,k="",I="")=>{if(!S||!d)return;let ee=++xe;S.open||S.showModal(),M(),S.innerHTML=qe(I?"\u8B80\u53D6\u6CD5\u898F\u689D\u6587\u4E2D\u2026":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E\u672C\u5730 Parquet \u8B80\u53D6 ${n([d,I].filter(Boolean).join(" \xB7 "))} \u7684\u539F\u59CB\u689D\u6587\u2026</span>
      </div>`);try{let oe=await H.lawDetail(d,k,"",I);if(t||ee!==xe)return;S.innerHTML=Se(oe,I)}catch(oe){if(t||ee!==xe)return;S.innerHTML=qe("\u7121\u6CD5\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u6587",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${n(oe.message||"\u627E\u4E0D\u5230\u689D\u6587\u5167\u5BB9\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u672C\u5730\u539F\u59CB\u6CD5\u898F Parquet \u5B58\u5728\uFF0C\u4E14 PostgreSQL metadata \u8207\u5176\u4E00\u81F4\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-law-source">\u95DC\u9589</button>
        </div>`)}};S?.addEventListener("click",d=>{if(d.target.closest('[data-action="close-law-source"]')){S.close();return}let k=S.getBoundingClientRect();(d.clientX<k.left||d.clientX>k.right||d.clientY<k.top||d.clientY>k.bottom)&&S.close()}),j?.addEventListener("click",d=>{if(d.target.closest('[data-action="close-parquet-judgment"]')){j.close();return}let k=j.getBoundingClientRect();(d.clientX<k.left||d.clientX>k.right||d.clientY<k.top||d.clientY>k.bottom)&&j.close()}),b.addEventListener("click",d=>{let k=d.target.closest(".rag-process-toggle");if(k){let ee=k.closest(".rag-process"),oe=k.getAttribute("aria-expanded")==="true";rs(ee,!oe);return}let I=d.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(I){if(I.dataset.action==="open-law-source"){Re(I.dataset.lawKey||"",I.dataset.sourceType||"",I.dataset.articleNo||"");return}Ce(I.dataset.jid||"")}}),b.addEventListener("keydown",d=>{if(d.key!=="Enter"&&d.key!==" ")return;let k=d.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(!(!k||k.closest("a, button"))){if(d.preventDefault(),k.dataset.action==="open-law-source"){Re(k.dataset.lawKey||"",k.dataset.sourceType||"",k.dataset.articleNo||"");return}Ce(k.dataset.jid||"")}});let P=async d=>{let k=d.trim();if(!k){D("\u8ACB\u5148\u8F38\u5165\u554F\u984C\u3002","warn"),l.focus();return}a=k,l.value=k,z(),b.innerHTML=Pn(k,r);let I=r?null:Nn(b);r?(O(null),fe()):(K(),O(null)),J(v,!0,"\u6AA2\u7D22\u4E2D\u2026");let ee=null,oe="",te=G=>{if(t||!G?.partial)return;let me=b.querySelector(".answer-body");if(!me)return;ee=G,oe=String(G.answer||""),me.innerHTML=Ys(G),I?.collapse?.();let Ae=b.querySelector(".answer-head-title");Ae&&(Ae.textContent=G.streaming?"LLM \u56DE\u7B54\u751F\u6210\u4E2D":"\u6CD5\u898F\u7D50\u679C\u5DF2\u986F\u793A")},de=G=>{if(t||!G||!ee?.streaming)return;oe+=G;let me=b.querySelector("[data-partial-answer]");me&&(me.textContent=oe)},se=()=>{if(t||!ee?.streaming)return;oe="";let G=b.querySelector("[data-partial-answer]");G&&(G.textContent="\u6B63\u5728\u91CD\u65B0\u751F\u6210\u56DE\u7B54\u2026")};try{let G=r?await H.rag(k,{testMode:r}):await H.ragStream(k,{onStep:_e=>I?.step(_e),onPartial:te,onToken:de,onTokenReset:se});if(t)return;K();let me=I?.finish(!0)||"";b.innerHTML=Bn(k,G,me),G.test_run?.run_id?await Te(G.test_run.run_id):O(null);let Ae=Array.isArray(G.citations)?G.citations:[],we=Array.isArray(G.judgments)?G.judgments:[],Ie=Ae.length+we.length;await yt({kind:"rag",title:k,detail:`${G.status||"preview"} \xB7 ${Ie} \u7B46\u4F86\u6E90`,payload:{question:k,status:G.status,citations:Ae.map(_e=>_e.law_name),judgments:we.map(_e=>_e.jid)}}),await X()}catch(G){if(K(),t)return;let me=I?.finish(!1)||"";b.innerHTML=Dn(G,me),D(G.message||"\u6AA2\u7D22\u5931\u6557\u3002","danger")}finally{K(),t||J(v,!1)}};return o.addEventListener("submit",d=>{d.preventDefault(),P(l.value)}),l.addEventListener("input",z),l.addEventListener("keydown",d=>{d.key==="Enter"&&!d.shiftKey&&!d.isComposing&&(d.preventDefault(),o.requestSubmit())}),e.querySelector("#example-chips").addEventListener("click",d=>{let k=d.target.closest("[data-question]");k&&(l.value=k.dataset.question,z(),o.requestSubmit())}),f.addEventListener("click",d=>{let k=d.target.closest("[data-history-index]");if(!k)return;let I=s[Number(k.dataset.historyIndex)];I&&(l.value=I.title,z(),P(I.title))}),h.addEventListener("click",async()=>{if(!s.length){D("\u76EE\u524D\u6C92\u6709\u53EF\u6E05\u9664\u7684\u63D0\u554F\u7D00\u9304\u3002","info");return}window.confirm("\u78BA\u5B9A\u6E05\u9664\u9019\u500B\u700F\u89BD\u5668\u7684\u6240\u6709\u63D0\u554F\u7D00\u9304\uFF1F")&&(await Ss(),await X(),D("\u5DF2\u6E05\u9664\u672C\u6A5F\u63D0\u554F\u7D00\u9304\u3002","ok"))}),z(),await Promise.allSettled([U(),X(),q()]),await ie(),()=>{t=!0,K(),document.documentElement.classList.remove("dialog-open"),window.removeEventListener("judgment:test-mode",N),a&&b.setAttribute("data-last-question",a)}}var os={};ze(os,{render:()=>pr});var Hn=2e3,Un={running:{label:"\u57F7\u884C\u4E2D",tone:"info"},success:{label:"\u5B8C\u6210",tone:"ok"},failed:{label:"\u5931\u6557",tone:"danger"},interrupted:{label:"\u5DF2\u4E2D\u6B62",tone:"warn"},stale:{label:"\u72C0\u614B\u5931\u6548",tone:"warn"},skipped:{label:"\u7565\u904E",tone:"idle"},pending:{label:"\u7B49\u5F85",tone:"idle"},idle:{label:"\u5F85\u547D",tone:"idle"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},operational:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},unavailable:{label:"\u7121\u6CD5\u53D6\u5F97",tone:"danger"},missing:{label:"\u5C1A\u7121\u7D00\u9304",tone:"idle"},error:{label:"\u8B80\u53D6\u5931\u6557",tone:"danger"},ok:{label:"\u6B63\u5E38",tone:"ok"}},Xs={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},Zs={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},sa={judgment:"\u5224\u6C7A",law:"\u6CD5\u898F",order:"\u547D\u4EE4",system:"\u7CFB\u7D71"},Mt={judgment:"#a78bfa",law:"#22d3ee",order:"#f472b6",system:"#94a3b8"},zn={extract:"file",raw_parquet:"cube",filter:"filter",postgres:"database",qdrant:"brain",download:"download",parse:"sliders"},Gn={raw_parquet:"\u539F\u59CB Parquet",postgres:"PostgreSQL"};function dt(e){return Un[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function ke(e,t){let s=dt(e);return`<span class="badge ${Xs[s.tone]||Xs.idle}"><span class="status-dot ${Zs[s.tone]||Zs.idle}"></span>${n(t||s.label)}</span>`}function Xe(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function ea(e){return e==null?"\u7121\u6CD5\u53D6\u5F97":p(e)}function st(e){return e&&e.color?String(e.color):"var(--accent)"}function Tt(e,t=""){let s=e.percent===null||e.percent===void 0?null:Math.max(0,Math.min(100,Number(e.percent)||0)),a=e.status==="running"&&s===null,r=a?' aria-valuetext="\u9032\u5EA6\u672A\u77E5"':` aria-valuenow="${s??0}"`;return`<div class="processing-bar${a?" is-indeterminate":""}${t?` ${t}`:""}" role="progressbar" aria-valuemin="0" aria-valuemax="100"${r}>
    <span class="processing-bar-fill" style="width:${s??0}%;background:${n(st(e))}"></span>
  </div>`}function Qn(e){let t=e.unit==="bytes"?"":e.unit||"\u7B46",s=e.current,a=e.total;return s==null?e.status==="running"?"\u9032\u884C\u4E2D":"\u2014":e.unit==="bytes"?a?`${he(s)} / ${he(a)}`:he(s):a?`${p(s)} / ${p(a)} ${t}`:`${p(s)} ${t}`}function Jn(e){let t=[`<span>${n(Qn(e))}</span>`];return e.percent===null||e.percent===void 0?e.status==="running"&&t.push('<span class="mono">\u9032\u5EA6\u672A\u77E5</span>'):t.push(`<span class="mono">${Xe(e.percent)}</span>`),e.duration_ms&&t.push(`<span class="mono">${F(e.duration_ms)}</span>`),t.join("")}function Vn(e){let s=(Array.isArray(e.stats)?e.stats:[]).map(r=>`<span class="processing-stage-stat"><span>${n(r.label)}</span><strong>${n(r.value)}</strong></span>`),a=e.coverage;return a&&a.indexed!==null&&a.indexed!==void 0&&a.total!==null&&a.total!==void 0&&s.push(`<span class="processing-stage-stat"><span>\u7D22\u5F15\u8986\u84CB</span><strong>${p(a.indexed)} / ${p(a.total)}</strong></span>`),s.length?`<div class="processing-stage-stats">${s.join("")}</div>`:""}function Wn(e,{compact:t=!1,step:s=null}={}){let a=dt(e.status),r=e.status==="running";return`<div class="processing-stage${t?" is-compact":""} is-${a.tone}${r?" is-live":""}" style="--stage-color:${n(st(e))}"${r?' aria-current="step"':""}>
    <div class="processing-stage-head">
      ${s===null?"":`<span class="processing-stage-step">${String(s).padStart(2,"0")}</span>`}
      <span class="processing-stage-swatch" style="background:${n(st(e))}"></span>
      <span class="processing-stage-label">${n(e.label||e.key)}</span>
      ${ke(e.status)}
    </div>
    ${Tt(e)}
    <div class="processing-stage-meta">${Jn(e)}</div>
    ${e.message?`<div class="processing-stage-message" title="${n(e.message)}">${n(e.message)}</div>`:""}
    ${t?"":Vn(e)}
  </div>`}function aa(e){let t=dt(e);return`<span class="flow-status is-${t.tone}"><span class="flow-status-dot"></span>${n(t.label)}</span>`}function ta(e,t){return t==null||t===""?"\u2014":e.unit==="bytes"?he(t):p(t)}function Kn(e){let t=[{label:"\u76EE\u524D",value:ta(e,e.current)},{label:"\u7E3D\u91CF",value:ta(e,e.total)},{label:"\u767E\u5206\u6BD4",value:e.percent===null||e.percent===void 0?e.status==="running"?"\u8A08\u7B97\u4E2D":"\u2014":Xe(e.percent)},{label:"\u8017\u6642",value:e.duration_ms?F(e.duration_ms):"\u2014"}],s=Array.isArray(e.stats)?e.stats:[];for(let r of s){if(t.length>=6)break;r&&r.label&&r.value&&t.push({label:String(r.label),value:String(r.value)})}let a=e.coverage;return a&&a.indexed!==null&&a.indexed!==void 0&&a.total!==null&&a.total!==void 0&&!t.some(r=>r.label==="\u7D22\u5F15\u8986\u84CB")&&t.push({label:"\u7D22\u5F15\u8986\u84CB",value:`${p(a.indexed)} / ${p(a.total)}`}),t}function Yn(e,t){let s=dt(e.status),a=e.status==="running",r=Kn(e);return`<article class="flow-node is-${s.tone}${a?" is-live":""}" style="--stage-color:${n(st(e))}"${a?' aria-current="step"':""}>
    <div class="flow-node-head">
      <span class="flow-node-icon">${y(zn[e.key]||"cube",14)}</span>
      <div class="flow-node-heading">
        <span class="flow-node-kicker">STEP ${String(t+1).padStart(2,"0")}</span>
        <strong>${n(Gn[e.key]||e.label||e.key)}</strong>
      </div>
      ${aa(e.status)}
    </div>
    <div class="flow-node-body">
      ${Tt(e,"flow-progress")}
      <div class="flow-node-props">${r.map(i=>`<div class="flow-prop"><span>${n(i.label)}</span><strong>${n(i.value)}</strong></div>`).join("")}</div>
      ${e.message?`<div class="flow-node-note" title="${n(e.message)}">${n(e.message)}</div>`:""}
    </div>
  </article>`}function Xn(e,t,s,a){let r=st(e),i=a||"#8b5cf6",o=e.status==="running",l=`${s}-${t}`,v=`flow-gradient-${l}`,b=`flow-marker-${l}`,$=t%2===0?"M2 60 C8 42 16 78 22 60":"M2 60 C8 78 16 42 22 60";return`<div class="flow-link${o?" is-live":""}" style="color:${n(r)}" aria-hidden="true">
    <svg viewBox="0 0 28 120" width="28" height="120" fill="none">
      <defs>
        <linearGradient id="${v}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="${n(i)}"/>
          <stop offset="1" stop-color="${n(r)}"/>
        </linearGradient>
        <marker id="${b}" viewBox="0 0 8 8" refX="6.2" refY="4" markerWidth="4.6" markerHeight="4.6" orient="auto">
          <path d="M0 0 8 4 0 8Z" fill="${n(r)}"/>
        </marker>
      </defs>
      <path class="flow-link-line" d="${$}" stroke="url(#${v})" stroke-width="1.7" stroke-linecap="round" marker-end="url(#${b})"/>
      <circle class="flow-link-port" cx="2" cy="60" r="3.6" stroke="${n(i)}" stroke-width="1.5"/>
      <circle class="flow-link-port" cx="26" cy="60" r="3.6" stroke="${n(r)}" stroke-width="1.5"/>
    </svg>
  </div>`}function na(e){if(!e)return"";let t=[];return e.started_at&&t.push(`\u958B\u59CB ${ae(e.started_at)}`),e.duration_ms&&t.push(`\u8017\u6642 ${F(e.duration_ms)}`),e.pid&&t.push(`PID ${e.pid}`),t.join(" \xB7 ")}function Zn(e,{active:t,focus:s,status:a,runLine:r,runningStage:i}){let o=e.label||sa[e.key]||e.key;return`<div class="flow-source${t?" is-live":""}" style="--branch-accent:${Mt[e.key]||Mt.system}">
    <div class="flow-source-head">
      <span class="flow-source-icon">${y(e.icon||"database",15)}</span>
      <div class="flow-node-heading">
        <span class="flow-node-kicker">SOURCE</span>
        <strong>${n(o)}</strong>
      </div>
      ${aa(a)}
    </div>
    <div class="flow-source-body">
      <p class="flow-source-desc">${n(e.description||"")}</p>
      <div class="flow-source-meta">${r}</div>
      ${i?`<div class="flow-source-current"><span class="flow-current-dot"></span>\u76EE\u524D\u968E\u6BB5\uFF1A<strong>${n(i.label||i.key)}</strong></div>`:""}
      ${s&&s.message?`<div class="flow-source-note" title="${n(s.message)}">${n(s.message)}</div>`:""}
    </div>
  </div>`}function er(e){let t=e.active_run,s=t||e.focus_run||e.last_run,a=t?"running":s?s.status:"idle",r=s?n(na(s)||Ze(s.started_at||s.finished_at)):"\u5C1A\u7121\u57F7\u884C\u7D00\u9304",i=Array.isArray(e.stages)?e.stages:[],o=i.find(g=>g.status==="running"),l=Mt[e.key]||Mt.system,v=String(e.key||"branch").replace(/[^a-zA-Z0-9_-]/g,""),b=Zn(e,{active:t,focus:s,status:a,runLine:r,runningStage:o}),$=i.length?i.map((g,f)=>{let _=f?st(i[f-1]):l;return`${Xn(g,f,v,_)}${Yn(g,f)}`}).join(""):'<div class="flow-empty">\u6C92\u6709\u53EF\u986F\u793A\u7684\u968E\u6BB5\u3002</div>';return`<article class="flow-lane" style="--branch-accent:${l}"><div class="flow-row">${b}${$}</div></article>`}function tr(e){return`<div class="flow-canvas-open">
    <div class="processing-branches">${(Array.isArray(e.branches)?e.branches:[]).map(er).join("")}</div>
  </div>`}function Ye(e,t,s="",a=""){return`<div class="processing-summary-card">
    <span class="processing-summary-label">${n(e)}</span>
    <span class="processing-summary-value">${t}</span>
    ${s?`<span class="processing-summary-hint">${s}</span>`:""}
    ${a}
  </div>`}function sr(e){let t=e.database||{},s=e.index||{},a=e.local_archives||{},r=e.raw_backups||{},i=r.totals||{},o=e.state||{},l=e.capabilities||{},v=e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D",b=t.status==="operational",$=s.status==="operational",g=a.available!==!1,f=r.available!==!1,_=$?`${p(s.indexed)} / ${p(s.total)}`:ke(s.status||"unavailable"),h=$?`${Xe(s.percent)} \xB7 \u5C1A\u9918 ${p(s.remaining)} \u7B46`:n(s.error||"\u7121\u6CD5\u67E5\u8A62 Qdrant \u7D22\u5F15\u8986\u84CB\u7387\u3002"),x=g?`${p(a.unprocessed)} / ${p(a.total)}`:ke("unavailable"),C=g?`\u672A\u8655\u7406 / \u5168\u90E8 \xB7 ${he(a.unprocessed_bytes)} \u5F85\u8655\u7406`:n(a.error||"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304\u3002");return`<div class="processing-summary">
    ${Ye("\u8655\u7406\u72C0\u614B",ke(e.status||"unknown"),`${n(v)} \xB7 \u66F4\u65B0\u65BC <span data-processing-updated-at>\u2014</span>`)}
    ${Ye("\u672A\u8655\u7406\u58D3\u7E2E\u6A94",n(x),C)}
    ${Ye("\u539F\u59CB Parquet \u5099\u4EFD",f?`${p(r.count)} \u6A94`:ke("unavailable"),f?`\u5171 ${p(i.row_count)} \u7B46 \xB7 ${he(i.compressed_bytes)}`:n(r.error||"\u7121\u6CD5\u6383\u63CF\u539F\u59CB Parquet \u5099\u4EFD\u3002"))}
    ${Ye("PostgreSQL \u5224\u6C7A",b?p(t.judgment_count):ke("unavailable"),b?`\u6CD5\u898F ${ea(t.law_count)} \xB7 \u547D\u4EE4 ${ea(t.order_count)}`:n(t.error||"\u7121\u6CD5\u67E5\u8A62 PostgreSQL\u3002"))}
    ${Ye("Qdrant \u7D22\u5F15",_,h)}
    ${Ye("\u72C0\u614B\u6A94",ke(o.status||"missing"),o.updated_at?`\u66F4\u65B0\u65BC ${n(ae(o.updated_at))}`:n(o.detail||"\u5C1A\u7121\u8655\u7406\u72C0\u614B\u7D00\u9304\u3002"))}
    ${Ye("\u5F85\u8655\u7406\u5DE5\u4F5C",l.can_start_update===!1?"\u66AB\u505C\u555F\u52D5":"\u53EF\u958B\u59CB\u66F4\u65B0",l.start_blocked_reason?n(l.start_blocked_reason):`\u672A\u8655\u7406 ${p(l.unprocessed_archives)} \u500B \xB7 \u7D22\u5F15\u5F85\u88DC ${p(l.index_backlog)} \u7B46${l.external_processes?` \xB7 \u5916\u90E8\u7A0B\u5E8F ${p(l.external_processes)} \u500B`:""}`)}
  </div>`}function ar(e){if(e.available===!1)return V({tone:"warn",title:"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304",text:n(e.error||"\u7121\u6CD5\u6383\u63CF .rar \u6A94\u6848\u3002")});let t=Number(e.total)||0,s=Number(e.processed)||0,a=Number(e.unprocessed)||0,r=t?100*s/t:null;return`<div class="processing-archive-summary">
    <div class="processing-archive-summary-head">
      <span class="mono">${n(e.data_dir||"")}</span>
      <span>${p(s)} / ${p(t)} \u5DF2\u8655\u7406 \xB7 ${p(a)} \u5F85\u8655\u7406 \xB7 ${he(e.unprocessed_bytes)} \u5F85\u8655\u7406</span>
    </div>
    ${Tt({percent:r,status:a?"pending":"success",color:"var(--success)"},"processing-bar-lg")}
    <div class="processing-archive-summary-meta">
      <span>\u58D3\u7E2E\u6A94\u532F\u5165\u8986\u84CB ${Xe(r)}</span>
      <span>\u5168\u90E8 ${he(e.total_bytes)}</span>
    </div>
  </div>`}function nr(e){let t=e.stages||{},a=["extract","filter","postgres"].map(r=>t[r]).filter(Boolean).map(r=>Wn(r,{compact:!0}));return a.length?`<div class="processing-archive-stages">${a.join("")}</div>`:""}function rr(e){let t=e.status||"pending",s=t==="running",a=e.percent===null||e.percent===void 0?null:Math.max(0,Math.min(100,Number(e.percent)||0)),r=s&&a===null,i=[];return e.message&&i.push(e.message),e.error&&i.push(e.error),(e.scanned||e.matched||e.stored)&&i.push(`\u6383\u63CF ${p(e.scanned)} \xB7 \u547D\u4E2D ${p(e.matched)} \xB7 \u5BEB\u5165 ${p(e.stored)}`),`<div class="processing-archive is-${dt(t).tone}">
    <div class="processing-archive-head">
      <span class="processing-archive-name mono">${n(e.name)}</span>
      <div class="processing-archive-bar-wrap">
        ${Tt({percent:a,status:t,color:s?"var(--accent)":"var(--success)"})}
      </div>
      <span class="processing-archive-percent mono">${r?"\u9032\u884C\u4E2D":Xe(a)}</span>
      ${ke(t)}
      <span class="processing-archive-size faint">${he(e.size_bytes)}</span>
    </div>
    ${nr(e)}
    ${i.length?`<div class="processing-archive-note">${i.map(o=>`<span>${n(o)}</span>`).join("")}</div>`:""}
  </div>`}function ir(e){let t=e.archives||{},s=e.local_archives||{},a=Array.isArray(t.items)?t.items:[],r=t.run,i=`<div class="report-section-head">
    <div>
      <div class="report-kicker">ARCHIVE PIPELINE</div>
      <h2 class="report-section-title">\u5224\u6C7A\u58D3\u7E2E\u6A94</h2>
      <p class="processing-section-sub">\u6BCF\u500B\u58D3\u7E2E\u6A94\u540D\u7A31\u5F8C\u65B9\u5373\u6642\u986F\u793A\u8655\u7406\u9032\u5EA6\uFF1B\u672A\u53D6\u5F97\u53EF\u8A08\u7B97\u7684\u7E3D\u91CF\u6642\u6A19\u793A\u300C\u9032\u5EA6\u672A\u77E5\u300D\uFF0C\u4E0D\u4EE5\u63A8\u6E2C\u6578\u503C\u4EE3\u66FF\u3002</p>
    </div>
  </div>`,o=t.source==="run"?`${ke(r?r.status:"idle")} <span>\u76EE\u524D\u986F\u793A ${r?n(r.title||"\u5224\u6C7A\u532F\u5165"):"\u6700\u8FD1\u4E00\u6B21\u532F\u5165"} \u7684\u9010\u6A94\u9032\u5EA6${r&&r.started_at?` \xB7 ${n(na(r))}`:""}</span>`:t.external?`${ke("running")} <span>${n(t.note||"\u5916\u90E8\u532F\u5165\u7A0B\u5E8F\u672A\u5BEB\u5165\u9010\u6A94\u72C0\u614B\uFF1B\u4EE5\u4E0B\u70BA PostgreSQL \u8986\u84CB\u7387\u3002")}</span>`:'<span class="faint">\u76EE\u524D\u6C92\u6709\u53EF\u8B80\u53D6\u7684\u532F\u5165 run \u72C0\u614B\uFF1B\u4EE5\u4E0B\u4EE5 PostgreSQL \u7684 source_archive \u5224\u5B9A\u662F\u5426\u5DF2\u8655\u7406\u3002</span>';return`<section class="report-card processing-card">
    <div class="report-head">${i}</div>
    <div class="report-section">
      ${ar(s)}
      <div class="processing-archive-run">${o}</div>
      ${a.length?`<div class="processing-archive-list">${a.map(rr).join("")}</div>`:`<div class="processing-empty">\u627E\u4E0D\u5230 .rar \u58D3\u7E2E\u6A94\uFF1B\u8ACB\u78BA\u8A8D ${n(s.data_dir||"\u5224\u6C7A\u8CC7\u6599\u76EE\u9304")}\u3002</div>`}
    </div>
  </section>`}function or(e){let t=e.timeline||{},s=Array.isArray(t.stages)?t.stages:[],a=`<div class="report-section-head">
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
    </section>`;let r=s.map(o=>`<span class="processing-stack-segment" style="width:${Math.max(0,Number(o.percent)||0)}%;background:${n(o.color||"var(--accent)")}" title="${n(`${o.label} ${F(o.duration_ms)} (${Xe(o.percent)})`)}"></span>`).join(""),i=s.map(o=>`<div class="processing-legend-item">
        <span class="processing-legend-swatch" style="background:${n(o.color||"var(--accent)")}"></span>
        <span class="processing-legend-label">${n(o.label)}</span>
        <span class="mono">${F(o.duration_ms)}</span>
        <span class="processing-legend-percent mono">${Xe(o.percent)}</span>
        ${ke(o.status)}
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
  </section>`}function lr(e){let t=Array.isArray(e.recent_runs)?e.recent_runs:[],s=new Map((e.branches||[]).map(i=>[i.key,i.label])),a=`<div class="report-section-head">
    <div>
      <div class="report-kicker">RECENT RUNS</div>
      <h2 class="report-section-title">\u6700\u8FD1\u8655\u7406\u7D00\u9304</h2>
      <p class="processing-section-sub">\u5305\u542B\u8CC7\u6599\u66F4\u65B0\u3001\u5224\u6C7A\u532F\u5165\u3001Parquet\u3001Qdrant \u8207\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E0B\u8F09\u3002</p>
    </div>
  </div>`;if(!t.length)return`<section class="report-card processing-card">
      <div class="report-head">${a}</div>
      <div class="report-section"><div class="processing-empty">\u5C1A\u7121\u8655\u7406\u7D00\u9304\u3002</div></div>
    </section>`;let r=t.map(i=>{let o=s.get(i.branch)||sa[i.branch]||i.branch||"\u2014";return`<div class="processing-run">
        <div class="processing-run-head">
          <span class="badge badge-neutral">${n(o)}</span>
          <strong>${n(i.title||"\u8655\u7406")}</strong>
          ${ke(i.status)}
          <span class="grow"></span>
          <span class="mono faint">${n(ae(i.finished_at||i.started_at))}</span>
          <span class="mono">${i.duration_ms?F(i.duration_ms):"\u2014"}</span>
        </div>
        ${i.message?`<div class="processing-run-message">${n(i.message)}</div>`:""}
      </div>`}).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section"><div class="processing-run-list">${r}</div></div>
  </section>`}function cr(e){let t=Array.isArray(e.notices)?e.notices:[];return t.length?`<div class="processing-notices">${t.map(s=>V({tone:s.tone||"info",title:s.title,text:n(s.message||"")})).join("")}</div>`:""}function dr(e){return`${cr(e)}
    ${sr(e)}
    <section class="processing-flow-section">
      <div class="processing-section-head">
        <div>
          <div class="report-kicker">PIPELINE CANVAS</div>
          <h2 class="report-section-title">\u8655\u7406\u6D41\u7A0B</h2>
          <p class="processing-section-sub">\u5224\u6C7A\u3001\u6CD5\u898F\u3001\u547D\u4EE4\u4E09\u689D\u6D41\u7A0B\u5373\u6642\u53CD\u6620\u76EE\u524D\u57F7\u884C\u968E\u6BB5\uFF1B\u66F2\u7DDA\u7531\u4F86\u6E90\u7BC0\u9EDE\u9023\u5230\u5404\u968E\u6BB5\uFF0C\u767C\u5149\u7BC0\u9EDE\u8207\u6D41\u52D5\u66F2\u7DDA\u8868\u793A\u76EE\u524D\u57F7\u884C\u4F4D\u7F6E\u3002</p>
        </div>
      </div>
      ${tr(e)}
    </section>
    ${ir(e)}
    ${or(e)}
    ${lr(e)}`}function ur(e,t){return`<div class="report-card processing-card">
    <div class="report-section">
      ${V({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B",text:n(e||"\u672A\u77E5\u932F\u8AA4")})}
      ${t?`<p class="processing-section-sub">\u4E0A\u6B21\u6210\u529F\u66F4\u65B0\uFF1A${n(ae(t.generated_at))}\u3002\u756B\u9762\u4E0A\u6C92\u6709\u986F\u793A\u66FF\u4EE3\u6216\u63A8\u6E2C\u7684\u9032\u5EA6\u3002</p>`:""}
      <div class="processing-error-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh">
          ${y("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
  </div>`}async function pr(e){e.innerHTML=`<section class="page processing-page">
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
  </section>`;let t=e.querySelector(".processing-page"),s=e.querySelector("#processing-root"),a=e.querySelector("#processing-update"),r=e.querySelector("#processing-stop"),i=e.querySelector("#processing-refresh"),o=e.querySelector("#processing-index-toggle"),l=!1,v=!1,b=!1,$=null,g="",f=null,_=M=>{let E=M.capabilities||{},R=!!(o&&o.checked),z=R?E.can_start_update_with_index!==!1:E.can_start_update!==!1,X=R&&E.index_blocked_reason||E.start_blocked_reason;if(!b){a.disabled=!z,a.title=X||"\u6AA2\u67E5\u7DDA\u4E0A\u6CD5\u898F\uFF0F\u547D\u4EE4\uFF0C\u4E26\u8655\u7406\u672A\u532F\u5165\u7684\u5224\u6C7A\u58D3\u7E2E\u6A94\u3002";let U=a.querySelector("[data-update-label]");U&&(U.textContent=z?"\u8CC7\u6599\u66F4\u65B0":E.active_update_id?"\u66F4\u65B0\u57F7\u884C\u4E2D":"\u8655\u7406\u7A0B\u5E8F\u57F7\u884C\u4E2D"),r.hidden=!E.can_stop_update,o&&(o.disabled=E.can_start_update===!1)}},h=async({silent:M=!1}={})=>{if(!(l||v)){v=!0,M||J(i,!0,"\u66F4\u65B0\u4E2D\u2026");try{let E=await H.processing();if(l)return;$=E;let R=dr(E);R!==g&&(s.innerHTML=R,g=R);let z=s.querySelector("[data-processing-updated-at]");if(z){let X=ae(E.generated_at);z.textContent!==X&&(z.textContent=X)}_(E)}catch(E){if(l)return;let R=ur(E.message,$);R!==g&&(s.innerHTML=R,g=R),M||D(E.message||"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B\u3002","danger",6e3)}finally{v=!1,M||J(i,!1)}}},x=async M=>{if(!b){b=!0,J(M,!0,"\u555F\u52D5\u4E2D\u2026");try{let E=!!(o&&o.checked),R=await H.startProcessingUpdate(E);D(`\u5DF2\u555F\u52D5\u8CC7\u6599\u66F4\u65B0${E?"\uFF0C\u5B8C\u6210\u5F8C\u63A5\u7E8C Qdrant \u7D22\u5F15":""}\u3002`,"ok",6e3),R&&R.run_id&&console.info("processing update started",R),await h({silent:!0})}catch(E){D(E.message||"\u7121\u6CD5\u555F\u52D5\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{b=!1,J(M,!1),$&&_($)}}},C=async M=>{if(!b){b=!0,J(M,!0,"\u505C\u6B62\u4E2D\u2026");try{let E=await H.stopProcessingUpdate();D(E.message||"\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info",6e3),await h({silent:!0})}catch(E){D(E.message||"\u7121\u6CD5\u505C\u6B62\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{b=!1,J(M,!1),$&&_($)}}},j=M=>{let E=M.target.closest("[data-processing-action]");if(!E||E.disabled)return;let R=E.dataset.processingAction;R==="refresh"?h({silent:!1}):R==="update"?x(E):R==="stop"&&C(E)},S=M=>{M.target===o&&$&&_($)};return t.addEventListener("click",j),o&&o.addEventListener("change",S),await h({silent:!1}),f=window.setInterval(()=>{document.hidden||h({silent:!0})},Hn),()=>{l=!0,f!==null&&window.clearInterval(f),t.removeEventListener("click",j),o&&o.removeEventListener("change",S)}}var ls={};ze(ls,{render:()=>yr});function Et(e){if(e==null||e==="")return"\u2014";let t=Number(e);return Number.isFinite(t)?`${t.toFixed(t>=10?1:2)}%`:"\u2014"}function ra(e){return e==null?"\u2014":p(e)}function mr(e){return e.count?e.severity==="danger"?Y("failed","\u9700\u8655\u7406"):e.severity==="warn"?Y("warning","\u6CE8\u610F"):Y("preview","\u63D0\u793A"):Y("success","\u901A\u904E")}function vr(e){return e.count?e.severity==="danger"?"is-danger":e.severity==="warn"?"is-warn":"is-info":"is-ok"}function fr(e){let t=Number(e.count)||0,s=Math.max(0,Math.min(100,Number(e.percent)||0));return`<div class="quality-check ${vr(e)}">
    <div class="quality-check-head">
      <span class="quality-check-label">${n(e.label)}</span>
      ${mr(e)}
    </div>
    <div class="quality-check-value">
      <strong>${p(t)}</strong>
      <span>\u7B46</span>
      <em>${n(Et(e.percent))}</em>
    </div>
    <div class="quality-check-desc">${n(e.description)}</div>
    <div class="quality-check-track" aria-hidden="true">
      <span style="width:${s}%"></span>
    </div>
  </div>`}function qt(e,t,s){let a=Array.isArray(s)?s:[];if(!a.length)return`<div class="index-chart-card">
      <div class="index-chart-head"><span>${n(e)}</span><span>${n(t)}</span></div>
      <div class="index-chart-empty">DuckDB \u6383\u63CF\u5F8C\u6C92\u6709\u53EF\u5448\u73FE\u7684\u8CC7\u6599\u3002</div>
    </div>`;let r=Math.max(...a.map(i=>Number(i.value)||0),1);return`<div class="index-chart-card">
    <div class="index-chart-head"><span>${n(e)}</span><span>${n(t)}</span></div>
    <div class="distribution">
      ${a.map(i=>{let o=Number(i.value)||0,l=Math.max(1.5,o/r*100);return`<div class="dist-row">
            <span class="dist-label" title="${n(i.label||"\u672A\u5206\u985E")}">${n(i.label||"\u672A\u5206\u985E")}</span>
            <span class="dist-track"><span class="dist-bar" style="width:${l.toFixed(2)}%"></span></span>
            <span class="dist-value">${p(o)}</span>
          </div>`}).join("")}
    </div>
  </div>`}function gr(e){let t=e.coverage||{},s=e.totals||{},a=e.source||{},r=t.postgres_diff,i=r==null?"\u2014":r===0?"\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u4E00\u81F4":`\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u76F8\u5DEE ${p(Math.abs(r))} \u7B46`,o=t.vector_indexed===null||t.vector_indexed===void 0?t.detail||"\u7121\u6CD5\u53D6\u5F97\u7D22\u5F15\u7D71\u8A08":`${p(t.vector_indexed)} / ${p(t.vector_total)} \xB7 ${t.model||"\u2014"}`;return`<div class="metric-grid quality-coverage-grid">
    <div class="metric-card">
      <div class="metric-label">${y("filter",13)}<span>\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D</span></div>
      <div class="metric-value">${p(s.matched_rows)}</div>
      <div class="metric-foot">citation_count &gt; 0\uFF1B\u5171 ${p(s.citation_total)} \u7B46\u5F15\u7528</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${y("database",13)}<span>PostgreSQL \u6536\u9304</span></div>
      <div class="metric-value">${ra(t.postgres_judgments)}</div>
      <div class="metric-foot">${n(i)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${y("brain",13)}<span>\u5411\u91CF\u7D22\u5F15</span></div>
      <div class="metric-value">${n(Et(t.vector_coverage_pct))}</div>
      <div class="metric-foot">${n(o)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${y("layers",13)}<span>DuckDB \u5019\u9078</span></div>
      <div class="metric-value">${ra(a.candidate_total)}</div>
      <div class="metric-foot">${p(a.candidate_archive_count)} / ${p(a.archive_count)} \u500B manifest \u6709 candidate_count</div>
    </div>
  </div>`}function hr(e){return e.length?`<div class="table-wrap">
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
        ${e.map(t=>{let s=(Number(t.missing_court_rows)||0)+(Number(t.missing_normalized_rows)||0)+(Number(t.missing_date_rows)||0)+(Number(t.invalid_date_rows)||0)+(Number(t.missing_title_rows)||0),a=t.candidate_count===null||t.candidate_count===void 0?"\u2014":p(t.candidate_count);return`<tr>
              <td class="cell-jid">
                <span class="mono">${n(t.archive||"\u2014")}</span>
                ${t.version?`<span class="chip">v${n(t.version)}</span>`:""}
              </td>
              <td class="cell-number">${p(t.rows)}</td>
              <td class="cell-number">${a}</td>
              <td class="cell-number">${p(t.matched_rows)}</td>
              <td class="cell-number">${n(Et(t.match_rate))}</td>
              <td class="cell-number">${p(t.short_text_rows)}</td>
              <td class="cell-number">${p(s)}</td>
              <td class="cell-number">${p(t.duplicate_content_rows)}</td>
              <td class="cell-date">${n(je(t.date_min))} \u2013 ${n(je(t.date_max))}</td>
            </tr>`}).join("")}
      </tbody>
    </table>
  </div>`:be({iconName:"table",title:"\u6C92\u6709\u539F\u59CB Parquet \u6A94\u6848",text:"\u5B8C\u6210\u5224\u6C7A RAR \u532F\u5165\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6BCF\u500B\u58D3\u7E2E\u6A94\u7684 DuckDB \u7D71\u8A08\u3002"})}function br(e){let t=e.totals||{},s=e.source||{},a=Array.isArray(e.checks)?e.checks:[],r=e.summary||{},i=e.distributions||{},o=Array.isArray(e.warnings)?e.warnings:[],l=he(s.compressed_bytes||0);return`<div class="report-card quality-report" data-database="quality">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">DUCKDB DATA QUALITY</div>
        <div class="report-title">
          \u539F\u59CB Parquet \u8CC7\u6599\u54C1\u8CEA ${Y(e.status||"operational")}
          <span class="chip">raw.parquet</span>
        </div>
        <div class="report-sub">
          ${p(t.rows)} \u7B46 \xB7 ${p(s.raw_files)} \u500B\u6A94\u6848 \xB7
          ${l} \xB7 \u6383\u63CF ${F(e.scan_ms||0)} \xB7
          ${n(ae(e.generated_at))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-quality">
          ${y("download",14)}<span>JSON</span>
        </button>
      </div>
    </div>
    ${o.length?`<div class="report-alert">${V({tone:"warn",title:"\u76EE\u524D\u9650\u5236\u8207\u5DEE\u7570",text:o.map(v=>n(v)).join("<br>")})}</div>`:""}
    <div class="summary-strip quality-summary-strip">
      <div class="summary-item">
        <div class="summary-label">\u539F\u59CB\u7B46\u6578</div>
        <div class="summary-value">${p(t.rows)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">\u7CBE\u78BA\u547D\u4E2D</div>
        <div class="summary-value">${p(t.matched_rows)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">\u547D\u4E2D\u7387</div>
        <div class="summary-value">${n(Et(t.match_rate))}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">\u91CD\u8907\u6848\u865F</div>
        <div class="summary-value">${p(t.duplicate_jid_rows)}</div>
      </div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u54C1\u8CEA\u6AA2\u67E5</span>
        <span class="muted" style="font-size:9.5px">
          ${p(r.ok_count)} \u9805\u901A\u904E \xB7
          ${p(r.warning_count)} \u9805\u6CE8\u610F \xB7
          ${p(r.danger_count)} \u9805\u9700\u8655\u7406 \xB7
          ${p(r.info_count)} \u9805\u63D0\u793A
        </span>
      </div>
      <div class="quality-checks">${a.map(fr).join("")}</div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6536\u9304\u8986\u84CB</span>
        <span class="muted" style="font-size:9.5px">PostgreSQL \u8207\u5411\u91CF\u7D22\u5F15\u70BA\u5373\u6642\u67E5\u8A62\uFF0C\u4E0D\u662F\u5F9E Parquet \u63A8\u4F30</span>
      </div>
      ${gr(e)}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6A94\u6848\u660E\u7D30</span>
        <span class="muted" style="font-size:9.5px">${p(s.archive_count)} \u500B\u539F\u59CB Parquet</span>
      </div>
      ${hr(Array.isArray(e.archives)?e.archives:[])}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u5206\u5E03\u7D71\u8A08</span>
        <span class="muted" style="font-size:9.5px">DuckDB group by / unnest</span>
      </div>
      <div class="quality-dist-grid">
        ${qt("\u6CD5\u9662","\u5224\u6C7A\u7B46\u6578",i.courts)}
        ${qt("\u88C1\u5224\u5E74\u4EFD","\u5224\u6C7A\u7B46\u6578",i.years)}
        ${qt("\u71B1\u9580\u6CD5\u898F","\u63D0\u53CA\u5224\u6C7A\u6578",i.laws)}
        ${qt("\u71B1\u9580\u6848\u7531","\u5224\u6C7A\u7B46\u6578",i.titles)}
      </div>
    </div>
  </div>`}async function yr(e){e.innerHTML=`<section class="page data-page quality-page">
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
  </section>`;let t=e.querySelector("#quality-content"),s=e.querySelector("#quality-refresh"),a=e.querySelector("#quality-meta"),r=null,i=()=>{r&&(t.innerHTML=br(r),a.textContent=`DUCKDB \xB7 ${p(r.totals?.rows)} \u7B46 \xB7 ${F(r.scan_ms||0)}`)},o=async()=>{J(s,!0,"\u6383\u63CF\u4E2D\u2026");try{r=await H.quality(),i()}catch(l){t.innerHTML=`<div class="report-card">
        <div class="report-head">
          <div class="report-title-group">
            <div class="report-kicker">DUCKDB DATA QUALITY</div>
            <div class="report-title">\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557</div>
            <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
          </div>
        </div>
        <div class="report-section">
          ${V({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u54C1\u8CEA\u7D71\u8A08",text:n(l.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
        </div>
      </div>`,a.textContent="DUCKDB \xB7 \u8B80\u53D6\u5931\u6557",D("\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}finally{J(s,!1)}};s.addEventListener("click",o),t.addEventListener("click",l=>{!l.target.closest("[data-action='export-quality']")||!r||Oe(`judgment-quality-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(r,null,2),"application/json;charset=utf-8")}),await o()}var cs={};ze(cs,{render:()=>jr});var ia={frontend:"browser",backend:"server",database:"database",storage:"layers",vector:"cube",ai:"brain",default:"cpu"};var $r={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90"};function wr(e){return e==="operational"?{label:"\u6838\u5FC3\u670D\u52D9\u6B63\u5E38",tone:"ok",headline:"\u6838\u5FC3\u8CC7\u6599\u7BA1\u7DDA\u904B\u4F5C\u4E2D",copy:"FastAPI\u3001PostgreSQL \u8207 Parquet \u5747\u53EF\u5B58\u53D6\u3002Qdrant\u3001Embedding \u8207 LLM \u6703\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u8A2D\u5B9A\u6216\u964D\u7D1A\u6642\u4E0D\u5F71\u97FF\u8CC7\u6599\u700F\u89BD\u8207\u67E5\u8A62\u5831\u8868\u3002"}:e==="degraded"?{label:"\u90E8\u5206\u670D\u52D9\u964D\u7D1A",tone:"warn",headline:"\u90E8\u5206\u670D\u52D9\u9700\u8981\u8A2D\u5B9A\u6216\u4FEE\u5FA9",copy:"\u6838\u5FC3\u8CC7\u6599\u670D\u52D9\u76EE\u524D\u672A\u5B8C\u5168\u53EF\u7528\u3002\u8ACB\u67E5\u770B\u4E0B\u65B9\u670D\u52D9\u5361\u7247\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u7684\u57F7\u884C\u7D00\u9304\uFF0C\u78BA\u8A8D PostgreSQL\u3001Parquet \u6216\u5916\u90E8\u670D\u52D9\u72C0\u614B\u3002"}:{label:Fe(e).label,tone:Fe(e).tone,headline:"\u76EE\u524D\u7121\u6CD5\u78BA\u8A8D\u7CFB\u7D71\u72C0\u614B",copy:"\u72C0\u614B API \u56DE\u50B3\u4E86\u975E\u9810\u671F\u7D50\u679C\u3002\u8ACB\u91CD\u65B0\u6574\u7406\uFF0C\u6216\u76F4\u63A5\u6AA2\u67E5 FastAPI \u670D\u52D9\u65E5\u8A8C\u3002"}}function _r(e){let t=Fe(e.status),s=ia[e.kind]||ia.default,a=e.latency_ms===null||e.latency_ms===void 0?"":`<span class="service-latency">${p(e.latency_ms)} ms</span>`;return`<article class="service-card">
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
  </article>`}function kr(e,t){return`<div class="arch-node ${e?"":"is-muted"}" ${e?"":'title="\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165"'}>${n(t)}</div>`}function xr(e,t){if(e==="IndexedDB")return ks();let a={PostgreSQL:"postgres",Parquet:"parquet",Qdrant:"qdrant",Embedding:"embedding",Retriever:"rag","RAG Engine":"rag",LLM:"llm"}[e];return a?t.find(i=>i.id===a)?.status==="operational":!0}function Sr(e,t){let s=e?.layers||[];if(!s.length)return'<div class="report-empty-inline">\u72C0\u614B API \u672A\u63D0\u4F9B\u67B6\u69CB\u8CC7\u6599\u3002</div>';let a=s.map(i=>{let o=(i.nodes||[]).map(l=>kr(xr(l,t),l)).join("");return`<div class="arch-layer">
      <div class="arch-layer-label">${n(i.label||i.id)}</div>
      <div class="arch-nodes">${o}</div>
    </div>`}),r=[];return a.forEach((i,o)=>{o&&r.push(`<div class="arch-arrow" aria-hidden="true">${y("arrowRight",15)}</div>`),r.push(i)}),`<div class="arch-flow">${r.join("")}</div>
    <div class="arch-legend">
      <span><i class="legend-key is-live"></i>\u5DF2\u63A5\u5165\u4E14\u72C0\u614B\u6B63\u5E38</span>
      <span><i class="legend-key is-off"></i>\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165</span>
      <span>${y("info",12)} \u7BC0\u9EDE\u72C0\u614B\u4F86\u81EA\u4E3B\u670D\u52D9\u5065\u5EB7\u6AA2\u67E5</span>
    </div>`}function Ar(e){return!Array.isArray(e)||!e.length?'<div class="report-empty-inline">\u6C92\u6709\u7AEF\u9EDE\u8CC7\u8A0A\u3002</div>':`<div class="endpoint-list">
    ${e.map(t=>`<div class="endpoint-row">
          <span class="endpoint-method">${n(t.method)}</span>
          <span class="endpoint-path" title="${n(t.path)}">${n(t.path)}</span>
          <span class="endpoint-label">${n(t.label||"")}</span>
        </div>`).join("")}
  </div>`}function at(e,t){return`<div class="detail-row">
    <span class="detail-label">${n(e)}</span>
    <span class="detail-value">${t}</span>
  </div>`}function Lr(e){return e?`<div class="detail-list">
    ${at("\u7248\u672C ID",`<strong>#${p(e.id)}</strong>`)}
    ${at("\u8CC7\u6599\u985E\u578B",Y("operational",e.source_type==="law"?"\u6CD5\u898F":"\u547D\u4EE4"))}
    ${at("\u4F86\u6E90\u66F4\u65B0\u65E5",`<strong>${n(e.update_date||"\u2014")}</strong>`)}
    ${at("\u6CD5\u898F / \u689D\u6587",`<strong>${p(e.law_count)} / ${p(e.article_count)}</strong>`)}
    ${at("\u4E0B\u8F09\u6642\u9593",`<span class="mono">${ae(e.downloaded_at)}</span>`)}
    ${at("Parquet",`<code title="${n(e.parquet_path||"")}">${n(e.parquet_path||"\u2014")}</code>`)}
  </div>`:'<div class="report-empty-inline">\u5C1A\u672A\u532F\u5165\u4EFB\u4F55\u8CC7\u6599\u7248\u672C\u3002</div>'}function Mr(e){if(!Array.isArray(e)||!e.length)return be({iconName:"history",title:"\u5C1A\u7121\u4E0B\u8F09\u57F7\u884C\u7D00\u9304",text:"\u57F7\u884C judgment-law-download \u5F8C\uFF0C\u6210\u529F\u3001\u7121\u8B8A\u66F4\u8207\u5931\u6557\u7684\u7D50\u679C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"});let t=[{key:"id",label:"Run",type:"number"},{key:"source_type",label:"\u985E\u578B",type:"source"},{key:"status",label:"\u72C0\u614B",type:"status"},{key:"started_at",label:"\u958B\u59CB\u6642\u9593",type:"datetime"},{key:"duration_ms",label:"\u8017\u6642",type:"duration"},{key:"law_count",label:"\u6CD5\u898F",type:"number"},{key:"article_count",label:"\u689D\u6587",type:"number"},{key:"error_message",label:"\u932F\u8AA4",type:"longtext"}];return`<div class="table-wrap" style="border-top:0;max-height:340px">
    <table class="data-table runs-table">
      <thead><tr>${t.map(s=>`<th scope="col">${n(s.label)}</th>`).join("")}</tr></thead>
      <tbody>
        ${e.map(s=>`<tr>${t.map(a=>`<td>${ft(s[a.key],a.type)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </div>`}function Tr(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=wr(e.status),r=e.architecture||{},i=s.find(_=>_.id==="qdrant"),o=s.find(_=>_.id==="rag"),l=s.find(_=>_.id==="llm"),v=Ge(),b=$r[v]||v,$=Me("/api/docs"),g=Me("/api/openapi.json"),f=Me("/api/status");return`<section class="status-hero">
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
          <span>${y("clock",11)} \u6AA2\u67E5\u6642\u9593 ${ae(e.checked_at)} \xB7 ${n(Ze(e.checked_at))}</span>
          <span>${y("server",11)} ${s.length} \u500B\u670D\u52D9\u5143\u4EF6</span>
          <span>${y("database",11)} ${p(t.total_current)} \u7B46\u73FE\u884C\u8CC7\u6599</span>
          <span>${y("layers",11)} ${p(t.parquet_files)} \u500B\u539F\u59CB Parquet</span>
          <span title="API \u4F4D\u5740\u4F86\u6E90\uFF1A${n(b)}">${y("link",11)} ${n(Qe())}</span>
        </div>
      </div>
    </section>

    <div class="service-grid">${s.map(_r).join("")}</div>

    <div class="status-summary">
      <div class="metric-card">
        <div class="metric-label">\u73FE\u884C\u6CD5\u898F</div>
        <div class="metric-value">${p(t.law_count)}</div>
        <div class="metric-foot">source_type = law</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u73FE\u884C\u547D\u4EE4</div>
        <div class="metric-value">${p(t.order_count)}</div>
        <div class="metric-foot">source_type = order</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u689D\u6587\u7E3D\u6578</div>
        <div class="metric-value">${p(t.article_count)}</div>
        <div class="metric-foot">\u73FE\u884C\u7248\u672C\u5408\u8A08</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u8CC7\u6599\u7248\u672C</div>
        <div class="metric-value">${p(t.version_count)}</div>
        <div class="metric-foot">\u539F\u59CB Parquet \u7248\u672C</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">\u4E0B\u8F09\u57F7\u884C</div>
        <div class="metric-value">${p(t.run_count)}</div>
        <div class="metric-foot">\u542B\u6210\u529F\u3001\u7121\u8B8A\u66F4\u8207\u5931\u6557</div>
      </div>
    </div>

    ${i?.status==="not_configured"||o?.status==="not_configured"||l?.status==="not_configured"?`<div class="data-section">${V({tone:"info",title:"\u90E8\u5206 AI \u5143\u4EF6\u5C1A\u672A\u8A2D\u5B9A",text:`Qdrant\uFF1A${n(i?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BRAG\uFF1A${n(o?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BLLM\uFF1A${n(l?.detail||"\u672A\u8A2D\u5B9A")}\u3002\u9019\u4E9B\u72C0\u614B\u4E0D\u6703\u88AB\u507D\u88DD\u6210\u53EF\u7528\u3002`})}</div>`:""}

    <div class="data-section card architecture-card">
      <div class="section-head">
        <div>
          <div class="section-title">\u524D\u5F8C\u7AEF\u67B6\u69CB</div>
          <div class="section-sub">Client \u2192 Application \u2192 Data \u2192 Intelligence</div>
        </div>
        <span class="badge badge-neutral badge-mono">${p((r.flow||[]).length)} layers</span>
      </div>
      ${Sr(r,s)}
    </div>

    <div class="status-columns">
      <section class="card">
        <div class="side-card-head">
          <span class="side-card-title">${y("terminal",14)}API \u7AEF\u9EDE</span>
          <a href="${n($)}" target="_blank" rel="noopener noreferrer" class="chip"
            >OpenAPI ${y("external",11)}</a>
        </div>
        ${Ar(e.endpoints)}
        <div class="side-card-foot">
          \u76EE\u524D API Base\uFF1A<code>${n(Qe())}</code>\uFF08${n(b)}\uFF09\u3002\u4E92\u52D5\u5F0F API \u6587\u4EF6\u4F4D\u65BC <a href="${n($)}" target="_blank" rel="noopener noreferrer"><code>${n($)}</code></a>\uFF0COpenAPI schema \u4F4D\u65BC <a href="${n(g)}" target="_blank" rel="noopener noreferrer"><code>${n(g)}</code></a>\u3002
        </div>
      </section>

      <section class="card">
        <div class="side-card-head">
          <span class="side-card-title">${y("layers",14)}\u6700\u65B0\u8CC7\u6599\u7248\u672C</span>
          ${Y("operational","Parquet")}
        </div>
        ${Lr(t.last_version)}
        <div class="side-card-foot">
          \u539F\u59CB Parquet \u5408\u8A08 ${he(t.parquet_bytes)}\uFF1BPostgreSQL \u4FDD\u5B58 metadata \u8207\u7248\u672C\u72C0\u614B\u3002
        </div>
      </section>
    </div>

    <section class="card data-section" style="margin-top:16px">
      <div class="side-card-head">
        <span class="side-card-title">${y("history",14)}\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C</span>
        <span class="badge badge-neutral badge-mono">${p(t.run_count)} TOTAL</span>
      </div>
      ${Mr(e.recent_runs)}
    </section>

    <p class="status-footnote">
      \u6B64\u9801\u76F4\u63A5\u547C\u53EB <code>GET ${n(f)}</code>\u3002\u670D\u52D9\u72C0\u614B\u3001\u8CC7\u6599\u7B46\u6578\u8207\u6700\u8FD1\u57F7\u884C\u7D00\u9304\u7686\u4F86\u81EA\u76EE\u524D\u7684
      PostgreSQL \u8207\u8CC7\u6599\u76EE\u9304\uFF1BQdrant\u3001Embedding\u3001RAG \u8207 LLM \u672A\u8A2D\u5B9A\u6642\u6703\u6A19\u793A\u70BA\u300C\u672A\u8A2D\u5B9A\u300D\uFF0C\u4E0D\u6703\u986F\u793A\u63A8\u6E2C\u6578\u64DA\u3002
    </p>`}function qr(){return`<div class="status-hero">
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
    </div>`}function Er(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">STATUS CHECK</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u5FEB\u53D6\u6216\u63A8\u6E2C\u7684\u670D\u52D9\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${V({tone:"danger",title:"\u72C0\u614B API \u8ACB\u6C42\u5931\u6557",text:n(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-retry">
          ${y("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}async function jr(e,t){let s=!1,a=null,r=null;e.innerHTML=`<section class="page status-page">
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
    <div id="status-content">${qr()}</div>
  </section>`;let i=e.querySelector("#status-content"),o=e.querySelector("#refresh-status"),l=e.querySelector("#auto-refresh"),v=async({quiet:b=!1}={})=>{b||(o.disabled=!0,J(o,!0,"\u6AA2\u67E5\u4E2D\u2026"));try{let $=await H.status();if(s)return;r=$,i.innerHTML=Tr($);let g=i.querySelector("#status-retry");g&&g.addEventListener("click",()=>v()),b||D("\u670D\u52D9\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200)}catch($){if(s)return;i.innerHTML=Er($);let g=i.querySelector("#status-retry");g&&g.addEventListener("click",()=>v()),b||D($.message||"\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002","danger")}finally{s||(o.disabled=!1,J(o,!1))}};return o.addEventListener("click",()=>v()),l.addEventListener("change",()=>{a&&(window.clearInterval(a),a=null),l.checked&&(a=window.setInterval(()=>v({quiet:!0}),3e4),D("\u5DF2\u555F\u7528\u6BCF 30 \u79D2\u81EA\u52D5\u66F4\u65B0\u3002","info",2200))}),await v({quiet:!0}),t&&typeof t.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"),()=>{s=!0,a&&window.clearInterval(a)}}var ds={};ze(ds,{render:()=>Pr});var oa={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"};function la(e,t){let s=Array.isArray(t)?t:[];return`<div class="tests-model-group">
    <span class="tests-model-label">${n(e)}</span>
    <div class="tests-model-chips">${s.length?s.map(a=>`<span class="chip chip-mono">${n(a)}</span>`).join(""):'<span class="tests-model-empty">\u672A\u5075\u6E2C\u5230\u6A21\u578B</span>'}</div>
  </div>`}function Nr(e,t,s){return JSON.stringify({selected:s,runs:(t||[]).map(a=>`${a.run_id}:${a.status}`),run:e?{run_id:e.run_id,status:e.status,progress:e.progress,steps:(e.steps||[]).map(a=>`${a.stage}:${a.model}:${a.status}:${a.progress}`)}:null})}async function Pr(e,t){let s=!1,a=!1,r={embedding:[],llm:[]},i=!1,o=null,l=[],v="",b=null,$="";e.innerHTML=`<section class="page tests-page">
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
          ${y("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>

    <div class="tests-grid">
      <section class="card tests-card tests-api-card" aria-labelledby="tests-api-title">
        <form class="api-dialog-form tests-api-form" id="tests-api-form" novalidate>
          <div class="api-dialog-head">
            <span class="api-dialog-icon" aria-hidden="true">${y("link",17)}</span>
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
              ${y("activity",14)}<span>\u6E2C\u8A66\u9023\u7DDA</span>
            </button>
            <span class="grow"></span>
            <button class="btn btn-ghost btn-sm" type="button" id="tests-api-reset">\u6062\u5FA9\u9810\u8A2D</button>
            <button class="btn btn-primary btn-sm" type="submit" id="tests-api-save">
              ${y("check",14)}<span>\u5132\u5B58\u4E26\u91CD\u65B0\u8F09\u5165</span>
            </button>
          </div>
        </form>
      </section>

      <section class="card tests-card" aria-labelledby="tests-mode-title">
        <div class="tests-card-head">
          <span class="tests-card-icon">${y("terminal",16)}</span>
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
            ${y("sparkles",13)}<span>\u524D\u5F80 RAG \u63D0\u554F</span>
          </a>
          <a class="btn btn-secondary btn-sm" href="#/performance">
            ${y("activity",13)}<span>\u6548\u80FD Flow</span>
          </a>
        </div>
        <div class="tests-status" id="tests-mode-status" role="status"></div>
      </section>
    </div>

    <div id="tests-flow"></div>
  </section>`;let g=e.querySelector("#tests-mode-badge"),f=e.querySelector("#tests-mode-toggle"),_=e.querySelector("#tests-mode-summary"),h=e.querySelector("#tests-mode-models"),x=e.querySelector("#tests-mode-status"),C=e.querySelector("#tests-api-form"),j=e.querySelector("#tests-api-input"),S=e.querySelector("#tests-api-preview"),M=e.querySelector("#tests-api-status"),E=e.querySelector("#tests-api-note"),R=e.querySelector("#tests-api-test"),z=e.querySelector("#tests-api-reset"),X=e.querySelector("#tests-api-save"),U=e.querySelector("#tests-refresh"),W=e.querySelector("#tests-flow"),q=(P,d,k="")=>{P&&(P.textContent=d,P.className=`tests-status${k?` is-${k}`:""}`)},N=(P,d="")=>{M&&(M.textContent=P,M.className=`api-dialog-status${d?` is-${d}`:""}`)},O=()=>Ge()==="query",K=()=>{let P=Be(j.value);return P||(window.location.protocol==="file:"?Bt:"")},fe=()=>{let P=K(),d=De(),k=oa[Ge()]||Ge()||"\u540C\u6E90";S.innerHTML=`\u76EE\u524D\u751F\u6548\uFF1A<strong>${n(Qe(d))}</strong>${d?`\uFF08${n(k)}\uFF09`:""}<br />\u6B64\u4F4D\u5740\u7684\u5065\u5EB7\u6AA2\u67E5\uFF1A${n(Me("/api/health",P))}`},Te=()=>{let P=Ge(),d=`\u76EE\u524D\u4F86\u6E90\uFF1A${oa[P]||P||"\u540C\u6E90"}\u3002\u512A\u5148\u9806\u5E8F\u70BA ?api= \u2192 \u700F\u89BD\u5668\u5132\u5B58\u503C \u2192 config.js \u2192 \u540C\u6E90\u3002`,k="";P==="query"?(k="is-warn",d="\u6B64\u9801\u7531\u7DB2\u5740\u7684 ?api= \u53C3\u6578\u6307\u5B9A\u5F8C\u7AEF\u4F4D\u5740\uFF0C\u5177\u6709\u6700\u9AD8\u512A\u5148\u9806\u5E8F\u3002\u5132\u5B58\u6216\u6062\u5FA9\u9810\u8A2D\u5728\u6B64\u9801\u4E0D\u6703\u751F\u6548\uFF1B\u8ACB\u5148\u79FB\u9664\u7DB2\u5740\u4E2D\u7684 api \u53C3\u6578\u3002"):mt()?(k="is-warn",d="\u6B64\u9801\u4E0D\u662F\u5F9E localhost \u958B\u555F\uFF0C\u4E14\u5C1A\u672A\u8A2D\u5B9A\u5F8C\u7AEF API\u3002\u8ACB\u586B\u5165 cloudflared \u7684 https:// \u4F4D\u5740\uFF0C\u6216\u90E8\u7F72\u6642\u5728 config.js \u6307\u5B9A apiBase\uFF1BHTTP \u4F4D\u5740\u6703\u88AB HTTPS \u9801\u9762\u963B\u64CB\u3002"):(P==="file-default"||window.location.protocol==="file:")&&(d="\u4EE5 file:// \u76F4\u63A5\u958B\u555F\u6642\uFF0C\u9810\u8A2D\u9023\u5230 http://127.0.0.1:9200\u3002\u82E5\u5F8C\u7AEF\u4F7F\u7528\u5176\u4ED6\u9023\u63A5\u57E0\uFF0C\u8ACB\u5728\u6B64\u4FEE\u6539\u4E26\u5132\u5B58\u3002"),E.textContent=d,E.className=`api-dialog-note${k?` ${k}`:""}`;let I=P==="query";X.disabled=I,z.disabled=I,j.readOnly=I},ie=()=>{if(!Dt(j.value))return N("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002","error"),j.focus(),null;let P=K();return window.location.protocol==="https:"&&/^http:\/\//i.test(P)&&!/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(P)?(N("HTTPS \u9801\u9762\u7121\u6CD5\u9023\u7DDA\u5230 HTTP API\uFF08mixed content\uFF09\u3002\u8ACB\u6539\u7528 cloudflared \u63D0\u4F9B\u7684 https:// \u4F4D\u5740\u3002","error"),j.focus(),null):P},ge=()=>{j.value=De(),fe(),Te(),N("\u53EF\u5148\u6E2C\u8A66\u9023\u7DDA\uFF0C\u5132\u5B58\u5F8C\u9801\u9762\u6703\u91CD\u65B0\u8F09\u5165\u3002")},B=()=>{let P=Array.isArray(r.embedding)?r.embedding.length:0,d=Array.isArray(r.llm)?r.llm.length:0;if(g&&(g.textContent=i?"\u5207\u63DB\u4E2D\u2026":a?"\u6E2C\u8A66\u6A21\u5F0F ON":"\u6E2C\u8A66\u6A21\u5F0F OFF",g.className=`badge badge-mono ${i?"badge-info":a?"badge-warn":"badge-neutral"}`),f){f.disabled=i,f.classList.toggle("is-on",a),f.classList.toggle("is-off",!a&&!i),f.classList.toggle("is-busy",i),f.setAttribute("aria-checked",a?"true":"false"),f.setAttribute("aria-busy",i?"true":"false"),f.setAttribute("aria-label",i?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F":a?"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF0C\u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\uFF0C\u9EDE\u64CA\u958B\u555F"),f.title=i?"\u6B63\u5728\u5207\u63DB\u6E2C\u8A66\u6A21\u5F0F\u2026":a?"\u6E2C\u8A66\u6A21\u5F0F ON \xB7 \u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F OFF \xB7 \u9EDE\u64CA\u958B\u555F";let k=f.querySelector(".header-power-label");k&&(k.textContent=i?"\u2026":a?"ON":"OFF")}_&&(_.textContent=a?`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${P} \u500B embedding \u8207 ${d} \u500B LLM \u6A21\u578B\u3002`:"\u76EE\u524D\u4F7F\u7528\u5FEB\u901F\u6A21\u5F0F\uFF1A\u55AE\u4E00 embedding \u8207 LLM\u3002"),h&&(h.innerHTML=la("Embedding",r.embedding)+la("LLM",r.llm))},le=async()=>{try{let P=await H.testMode();if(s)return;a=!!P.enabled,r=P.models||{embedding:[],llm:[]},q(x,"")}catch(P){if(s)return;a=!1,r={embedding:[],llm:[]},q(x,P.message||"\u7121\u6CD5\u8B80\u53D6\u6E2C\u8A66\u6A21\u5F0F\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF API\u3002","error")}s||B()},Ce=async()=>{if(i)return;let P=!a;i=!0,B(),q(x,P?"\u6B63\u5728\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u2026":"\u6B63\u5728\u95DC\u9589\u6E2C\u8A66\u6A21\u5F0F\u2026");try{let d=await H.setTestMode(P);if(s)return;a=!!d.enabled,r=d.models||{embedding:[],llm:[]},window.dispatchEvent(new CustomEvent("judgment:test-mode",{detail:{enabled:a,models:r}}));let k=r.embedding?.length||0,I=r.llm?.length||0;q(x,a?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A\u4E0B\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C ${k} \u500B embedding \u8207 ${I} \u500B LLM \u6A21\u578B\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","ok"),D(a?`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A${k} \u500B embedding\u3001${I} \u500B LLM\u3002`:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002",a?"ok":"info",6e3),await Se()}catch(d){s||(q(x,d.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","error"),D(d.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","danger",6e3))}finally{i=!1,s||B()}},xe=()=>{if(!W)return;let P=Nr(o,l,v);P!==$&&($=P,W.innerHTML=tt(o,l,v))},qe=async()=>{try{let P=await H.testRuns(30);if(s)return;l=Array.isArray(P.runs)?P.runs:[]}catch{if(s)return;l=[]}},Se=async()=>{try{let P=v?await H.testRun(v):await H.testRunCurrent();if(s)return;o=P.run||null,!v&&o&&o.status!=="running"&&!l.some(d=>d.run_id===o.run_id)&&await qe()}catch{if(s)return;o=null}s||xe()};j?.addEventListener("input",()=>{fe(),N("\u5C1A\u672A\u6E2C\u8A66\u6B64\u4F4D\u5740\u3002")}),R?.addEventListener("click",async()=>{let P=ie();if(P!==null){J(R,!0,"\u6E2C\u8A66\u4E2D\u2026"),N(`\u6B63\u5728\u9023\u7DDA\u5230 ${Qe(P)||"\u540C\u6E90"}\u2026`);try{let d=await hs(P);if(s)return;N(`\u9023\u7DDA\u6210\u529F \xB7 v${d.version} \xB7 ${d.duration_ms} ms \xB7 GET ${Me("/api/health",P)}`,"ok")}catch(d){s||N(d.message||"\u9023\u7DDA\u6E2C\u8A66\u5931\u6557\u3002","error")}finally{s||J(R,!1)}}}),C?.addEventListener("submit",P=>{if(P.preventDefault(),O())return;let d=ie();d!==null&&(Ut(d),D(`\u5F8C\u7AEF API \u5DF2\u8A2D\u70BA ${Qe(d)}\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026`,"ok",1600),window.setTimeout(()=>window.location.reload(),120))}),z?.addEventListener("click",()=>{O()||(Ut(""),D("\u5DF2\u6E05\u9664\u700F\u89BD\u5668\u5132\u5B58\u7684 API \u4F4D\u5740\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026","info",1600),window.setTimeout(()=>window.location.reload(),120))}),f?.addEventListener("click",Ce),W?.addEventListener("change",async P=>{P.target.id==="test-run-select"&&(v=String(P.target.value||""),await Se())}),W?.addEventListener("click",async P=>{P.target.closest("#test-flow-refresh")&&(v="",await qe(),await Se())}),U?.addEventListener("click",async()=>{J(U,!0,"\u66F4\u65B0\u4E2D\u2026"),ge(),await Promise.allSettled([le(),qe()]),s||await Se(),s||(J(U,!1),D("\u7CFB\u7D71\u6E2C\u8A66\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200))});let Re=P=>{a=!!P.detail?.enabled,r=P.detail?.models||{embedding:[],llm:[]},B()};return window.addEventListener("judgment:test-mode",Re),ge(),B(),await Promise.allSettled([le(),qe()]),await Se(),b=window.setInterval(async()=>{s||document.hidden||v||await Se()},2500),typeof t?.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"),()=>{s=!0,b&&window.clearInterval(b),window.removeEventListener("judgment:test-mode",Re)}}var ca="rag",Ct={rag:{page:is,title:"RAG \u63D0\u554F \xB7 Judgment RAG Console"},data:{page:ss,title:"\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"},quality:{page:ls,title:"\u8CC7\u6599\u54C1\u8CEA \xB7 Judgment RAG Console"},performance:{page:ns,title:"\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"},processing:{page:os,title:"\u8CC7\u6599\u8655\u7406 \xB7 Judgment RAG Console"},status:{page:cs,title:"\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"},tests:{page:ds,title:"\u7CFB\u7D71\u6E2C\u8A66 \xB7 Judgment RAG Console"}},jt=document.getElementById("app-main"),Nt=null,Pt=0;function Cr(){return`<div class="page-loading" aria-live="polite">
    <div class="skeleton skeleton-title"></div>
    <div class="skeleton skeleton-subtitle"></div>
    <div class="skeleton-grid">
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
    </div>
  </div>`}function ps(){let t=window.location.hash.replace(/^#\/?/,"").trim().split("/")[0]||ca;return Object.prototype.hasOwnProperty.call(Ct,t)?t:ca}function Rr(e){document.querySelectorAll("[data-route]").forEach(t=>{let s=t.dataset.route===e;t.classList.toggle("is-active",s),s?t.setAttribute("aria-current","page"):t.removeAttribute("aria-current")})}function Ir(e){return`<section class="page">
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
  </section>`}async function us(){let e=ps(),t=++Pt;if(Rr(e),window.location.hash!==`#/${e}`&&window.history.replaceState(null,"",`#/${e}`),typeof Nt=="function"){try{Nt()}catch{}Nt=null}document.title=Ct[e].title,jt.innerHTML=Cr(),jt.focus({preventScroll:!0}),window.scrollTo({top:0,behavior:"auto"});let s={route:e,navigate(a){Ct[a]&&(window.location.hash=`#/${a}`)},setTitle(a){t===Pt&&a&&(document.title=a)}};try{let a=await Ct[e].page.render(jt,s);if(t!==Pt){typeof a=="function"&&a();return}Nt=typeof a=="function"?a:null}catch(a){if(t!==Pt)return;console.error("Failed to render route",e,a),jt.innerHTML=Ir(a);let r=document.getElementById("route-retry");r&&r.addEventListener("click",()=>us()),D("\u9801\u9762\u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}}function Br(){document.addEventListener("keydown",e=>{if(e.key!=="/"||e.metaKey||e.ctrlKey||e.altKey)return;let t=document.activeElement;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable)||ps()!=="rag")return;let a=document.getElementById("rag-question");a&&(e.preventDefault(),a.focus())})}function da(){_s(),Br(),window.addEventListener("hashchange",us),us(),mt()&&window.setTimeout(()=>{ps()!=="tests"&&(window.location.hash="#/tests")},700)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",da):da();})();
