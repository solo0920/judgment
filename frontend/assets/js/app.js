(()=>{var va=Object.defineProperty;var Qe=(e,t)=>{for(var s in t)va(e,s,{get:t[s],enumerable:!0})};var Bt="judgment.api_base",Dt="http://127.0.0.1:9200",le=class extends Error{constructor(t,s=0,a=null){super(t),this.name="ApiError",this.status=s,this.detail=a}};function hs(e){return["localhost","127.0.0.1","::1","[::1]"].includes(e)}function Te(e){let t=String(e??"").trim();if(!t||t==="/")return"";t=t.replace(/\/+$/,""),!/^https?:\/\//i.test(t)&&!t.startsWith("/")&&(t=`${hs(t.split(":")[0])?"http":"https"}://${t}`);try{let s=new URL(t,window.location.href);return s.protocol!=="http:"&&s.protocol!=="https:"?"":`${s.origin}${s.pathname==="/"?"":s.pathname.replace(/\/+$/,"")}`}catch{return t}}function Ot(e){let t=Te(e);if(!t)return!0;try{let s=new URL(t);return s.protocol==="http:"||s.protocol==="https:"}catch{return!1}}function Ft(){try{let e=new URLSearchParams(window.location.search);return e.has("api")?Te(e.get("api")):null}catch{return null}}function Ht(){try{let e=window.localStorage.getItem(Bt);return e===null?null:Te(e)}catch{return null}}function Ut(){let e=window.JUDGMENT_CONFIG&&window.JUDGMENT_CONFIG.apiBase;return Te(e||"")}function Ae(){let e=Ft();if(e!==null)return e;let t=Ht();if(t!==null)return t;let s=Ut();return s||(window.location.protocol==="file:"?Dt:"")}function fa(){if(Ft()!==null)return!0;let e=Ht();return e!==null?!!e:!!Ut()}function Je(){return Ft()!==null?"query":Ht()!==null?"storage":Ut()?"config":window.location.protocol==="file:"?"file-default":"same-origin"}function zt(){return fa()||window.location.protocol==="file:"||!window.JUDGMENT_CONFIG?!1:!hs(window.location.hostname)}function Gt(e){let t=Te(e);try{t?window.localStorage.setItem(Bt,t):window.localStorage.removeItem(Bt)}catch{}return t}function qe(e=Ae()){return e||"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"}function we(e,t=Ae()){return t?`${t}${e.startsWith("/")?e:`/${e}`}`:e}function Qt(e){return`\u7121\u6CD5\u9023\u7DDA\u5230\u4F3A\u670D\u5668${e?`\uFF08${e}\uFF09`:""}\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u662F\u5426\u555F\u52D5\uFF0C\u6216\u9EDE\u9078 header \u7684\u300CAPI\u300D\u8A2D\u5B9A\u5F8C\u7AEF\u4F4D\u5740\u3002`}async function se(e,t={}){let s=Ae(),a=new AbortController,r=t.timeout===void 0?3e4:t.timeout,i=r>0?window.setTimeout(()=>a.abort(),r):null,o=Date.now(),l=performance.now(),f=t.requestId||bs(),b={Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},"X-Judgment-Request-Id":f,"X-Judgment-Client-Started-At":String(o),...t.headers||{}},g;try{g=await fetch(we(e,s),{...t,headers:b,signal:a.signal})}catch(E){throw E.name==="AbortError"?new le("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new le(Qt(s),0,E)}finally{i&&window.clearTimeout(i)}let p=null;if((g.headers.get("content-type")||"").includes("application/json"))try{p=await g.json()}catch{p=null}else try{p=await g.text()}catch{p=null}let x=performance.now(),_=g.headers.get("X-Judgment-Request-Id")||f;if(t.trackClient!==!1&&_){let E=Math.round(performance.now()-l);window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{ys({request_id:_,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:E,render_ms:Math.max(0,Math.round(performance.now()-x)),status:g.ok?"success":"failed"})})})}if(!g.ok){let E=p&&typeof p=="object"?p.detail||p.message:p,P=typeof E=="string"&&E?E:`\u4F3A\u670D\u5668\u56DE\u61C9 ${g.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new le(P,g.status,E)}return p}function bs(){try{if(window.crypto&&typeof window.crypto.randomUUID=="function")return window.crypto.randomUUID().replace(/-/g,"").slice(0,32)}catch{}return`req${Date.now().toString(36)}${Math.random().toString(36).slice(2,10)}`}function ys(e){try{fetch(we("/api/performance/client",Ae()),{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e),keepalive:!0}).catch(()=>{})}catch{}}async function $s(e){let t=Te(e);if(!Ot(t))throw new le("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002");let s=performance.now(),a=new AbortController,r=window.setTimeout(()=>a.abort(),1e4);try{let i=await fetch(we("/api/health",t),{headers:{Accept:"application/json"},signal:a.signal});if(!i.ok)throw new le(`API \u56DE\u61C9 ${i.status}\u3002`,i.status);let o=await i.json();return{base:t,version:o.version||"\u2014",duration_ms:Math.round(performance.now()-s)}}catch(i){throw i instanceof le?i:i.name==="AbortError"?new le("\u9023\u7DDA\u6E2C\u8A66\u903E\u6642\uFF0C\u8ACB\u78BA\u8A8D API \u4F4D\u5740\u8207\u7DB2\u8DEF\u3002",0,i):new le(Qt(t),0,i)}finally{window.clearTimeout(r)}}var F={health(){return se("/api/health")},status(){return se("/api/status",{trackClient:!1})},catalog(){return se("/api/catalog")},query({database:e,filters:t,page:s=1,pageSize:a=25}){return se("/api/query",{method:"POST",body:JSON.stringify({database:e,filters:t,page:s,page_size:a})})},schemaSuggest({database:e,table:t,column:s,query:a,limit:r=1e3}){let i=new URLSearchParams({database:e,table:t,column:s,q:a||"",limit:String(r)});return se(`/api/schema/suggest?${i.toString()}`,{timeout:3e4})},lawDetail(e,t="",s=""){let a=new URLSearchParams({law_key:e});return t&&a.set("source_type",t),s&&a.set("version_id",String(s)),se(`/api/law?${a.toString()}`,{timeout:45e3})},judgmentDetail(e,t=""){let s=new URLSearchParams({jid:e});return t&&s.set("source",t),se(`/api/judgment?${s.toString()}`,{timeout:45e3})},testMode(){return se("/api/test-mode",{trackClient:!1})},setTestMode(e){return se("/api/test-mode",{method:"POST",body:JSON.stringify({enabled:!!e}),trackClient:!1})},testRuns(e=20){let t=new URLSearchParams({limit:String(e)});return se(`/api/test-runs?${t.toString()}`,{trackClient:!1})},testRunCurrent(){return se("/api/test-runs/current",{trackClient:!1})},testRun(e){return se(`/api/test-runs/${encodeURIComponent(e)}`,{trackClient:!1})},performanceOptions(){return se("/api/performance/options",{trackClient:!1})},performance(e={},t=1,s=25){let a=new URLSearchParams;for(let[r,i]of Object.entries(e))i==null||i===""||a.set(r,String(i));return a.set("page",String(t)),a.set("page_size",String(s)),se(`/api/performance?${a.toString()}`,{timeout:45e3,trackClient:!1})},quality(){return se("/api/quality",{timeout:18e4,trackClient:!1})},processing(){return se("/api/processing",{timeout:45e3,trackClient:!1})},processingPlan(){return se("/api/processing/plan",{timeout:45e3,trackClient:!1})},startProcessingUpdate(e=!1){return se("/api/processing/update",{method:"POST",body:JSON.stringify({index:!!e}),timeout:45e3,trackClient:!1})},stopProcessingUpdate(){return se("/api/processing/stop",{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},rag(e,t={}){return se("/api/rag/query",{method:"POST",body:JSON.stringify({question:e}),timeout:t.testMode?0:3e5})},async ragStream(e,{testMode:t=!1,onStep:s=null}={}){let a=Ae(),r=new AbortController,i=t?0:3e5,o=i>0?window.setTimeout(()=>r.abort(),i):null,l=Date.now(),f=performance.now(),b=bs(),g={Accept:"text/event-stream","Content-Type":"application/json","X-Judgment-Request-Id":b,"X-Judgment-Client-Started-At":String(l)},p;try{p=await fetch(we("/api/rag/query/stream",a),{method:"POST",headers:g,body:JSON.stringify({question:e}),signal:r.signal})}catch(y){throw y.name==="AbortError"?new le("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new le(Qt(a),0,y)}finally{o&&window.clearTimeout(o)}if(!p.ok){let y=null;try{y=await p.json()}catch{y=null}let A=y&&typeof y=="object"&&y.detail?String(y.detail):`\u4F3A\u670D\u5668\u56DE\u61C9 ${p.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new le(A,p.status,y)}if(!p.body)throw new le("\u4F3A\u670D\u5668\u6C92\u6709\u56DE\u50B3\u53EF\u8B80\u53D6\u7684\u6D41\u7A0B\u4E32\u6D41\u3002",0,null);let h=p.body.getReader(),x=new TextDecoder,_="",E=null,P=null;try{for(;;){let{value:y,done:A}=await h.read();if(A)break;_+=x.decode(y,{stream:!0});let T=_.indexOf(`

`);for(;T>=0;){let q=_.slice(0,T).replace(/\r/g,"");_=_.slice(T+2);let N="message",W=[];for(let R of q.split(`
`))R.startsWith("event:")?N=R.slice(6).trim():R.startsWith("data:")&&W.push(R.slice(5).trimStart());if(W.length){let R=null;try{R=JSON.parse(W.join(`
`))}catch{R=null}if(R)if(N==="step"&&typeof s=="function")try{s(R)}catch{}else N==="result"?E=R:N==="error"&&(P=new le(R.message||R.detail||"RAG \u6D41\u7A0B\u5931\u6557\u3002",0,R))}T=_.indexOf(`

`)}}}finally{try{await h.cancel()}catch{}o&&window.clearTimeout(o)}if(P)throw P;if(!E)throw new le("\u6D41\u7A0B\u4E32\u6D41\u7D50\u675F\uFF0C\u4F46\u6C92\u6709\u6536\u5230\u6700\u7D42\u56DE\u7B54\u3002",0,null);let C=Math.round(performance.now()-f);return ys({request_id:b,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:C,render_ms:0,status:"success"}),E}};var ga={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},ha={operational:{label:"\u6B63\u5E38",tone:"ok"},success:{label:"\u6210\u529F",tone:"ok"},ok:{label:"\u6B63\u5E38",tone:"ok"},healthy:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},warning:{label:"\u6CE8\u610F",tone:"warn"},empty:{label:"\u7121\u8CC7\u6599",tone:"warn"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},running:{label:"\u57F7\u884C\u4E2D",tone:"info"},pending:{label:"\u7B49\u5F85",tone:"idle"},skipped:{label:"\u7565\u904E",tone:"idle"},partial:{label:"\u90E8\u5206\u6210\u529F",tone:"warn"},preview:{label:"\u9810\u89BD\u6A21\u5F0F",tone:"info"},retrieval_only:{label:"\u50C5\u6AA2\u7D22\u7D50\u679C",tone:"warn"},not_indexed:{label:"\u5C1A\u672A\u7D22\u5F15",tone:"warn"},missing_query:{label:"\u7B49\u5F85\u67E5\u8A62",tone:"idle"},client_side:{label:"\u700F\u89BD\u5668\u7AEF",tone:"info"},not_configured:{label:"\u672A\u8A2D\u5B9A",tone:"idle"},unavailable:{label:"\u96E2\u7DDA",tone:"danger"},failed:{label:"\u5931\u6557",tone:"danger"},error:{label:"\u932F\u8AA4",tone:"danger"}},ba={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},ya={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},ws={search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',send:'<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',refresh:'<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 4v5.5H15"/>',copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',check:'<path d="m5 12 4.2 4.2L19 6.5"/>',x:'<path d="m6 6 12 12M18 6 6 18"/>',external:'<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/>',message:'<path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H6l-3 2 1.3-4.2A8.5 8.5 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',history:'<path d="M3.2 12a8.8 8.8 0 1 0 2.8-6.3L3.2 8.5"/><path d="M3 3.5v5h5"/><path d="M12 7.5V12l3 1.8"/>',database:'<ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/><path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/>',layers:'<path d="m12 3 9 4.8-9 4.8-9-4.8L12 3Z"/><path d="m3 12.2 9 4.8 9-4.8"/><path d="m3 16.7 9 4.8 9-4.8"/>',cube:'<path d="m12 2.8 8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4L12 2.8Z"/><path d="m3.8 7.4 8.2 4.6 8.2-4.6"/><path d="M12 12v9.2"/>',browser:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6.5 6.5h.01"/>',download:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',chevronLeft:'<path d="m14.5 5-7 7 7 7"/>',chevronRight:'<path d="m9.5 5 7 7-7 7"/>',chevronDown:'<path d="m5 9 7 7 7-7"/>',arrowRight:'<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',alert:'<path d="M12 3 2.5 20.5h19L12 3Z"/><path d="M12 9v4.5"/><path d="M12 17.5h.01"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',sparkles:'<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"/>',table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M9 9.5V20M15 9.5V20"/>',sliders:'<path d="M4 7h8M16 7h4M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',server:'<rect x="3" y="4" width="18" height="6" rx="1.6"/><rect x="3" y="14" width="18" height="6" rx="1.6"/><path d="M7 7h.01M7 17h.01"/>',brain:'<path d="M9.7 4.2a2.8 2.8 0 0 0-3 2.8 2.8 2.8 0 0 0-1.1 5.2A2.9 2.9 0 0 0 7.8 18a2.9 2.9 0 0 0 3.9 2V4.2a2.8 2.8 0 0 0-2 0Z"/><path d="M14.3 4.2a2.8 2.8 0 0 1 3 2.8 2.8 2.8 0 0 1 1.1 5.2A2.9 2.9 0 0 1 16.2 18a2.9 2.9 0 0 1-3.9 2"/>',cloud:'<path d="M7 18.5h10.5a3.5 3.5 0 0 0 .4-7 5.5 5.5 0 0 0-10.6-1.3A4.2 4.2 0 0 0 7 18.5Z"/>',code:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',play:'<path d="M7 4.5v15l13-7.5-13-7.5Z"/>',file:'<path d="M6 2.8h8l4.5 4.5v13.9H6V2.8Z"/><path d="M14 2.8V7.5h5"/>',activity:'<path d="M3 12h4l2.2-5 4.1 10 2.2-5H21"/>',shield:'<path d="M12 2.8 20 6v6c0 4.7-3.2 8-8 9.2C7.2 20 4 16.7 4 12V6l8-3.2Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',terminal:'<path d="m5 7 5 5-5 5"/><path d="M12 17h7"/>',filter:'<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',link:'<path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10.2 5.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-1.4 1.4a5 5 0 0 0 7.1 7.1l1.2-1.2"/>',grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9.5 9.5h5v5h-5z"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>'};function n(e){return String(e??"").replace(/[&<>"']/g,t=>ga[t])}function $(e,t=16,s=""){let a=ws[e]||ws.info;return`<svg${s?` class="${n(s)}"`:""} width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a}</svg>`}function u(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?new Intl.NumberFormat("zh-TW").format(s):t}function pe(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=["B","KB","MB","GB","TB"],a=0;for(;t>=1024&&a<s.length-1;)t/=1024,a+=1;return a===0?`${t.toFixed(0)} B`:`${t.toFixed(1)} ${s[a]}`}function Jt(e){if(e instanceof Date)return e;if(typeof e=="number"){let r=new Date(e);return Number.isNaN(r.getTime())?null:r}let t=String(e??"").trim();if(!t)return null;if(/^\d{8}$/.test(t))return new Date(Number(t.slice(0,4)),Number(t.slice(4,6))-1,Number(t.slice(6,8)));let s=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(t),a=new Date(s?`${t}Z`:t);return Number.isNaN(a.getTime())?null:a}function _e(e){let t=Jt(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit"}).format(t):e?n(e):"\u2014"}function ee(e){let t=Jt(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1}).format(t):e?n(e):"\u2014"}function Ve(e){let t=Jt(e);if(!t)return"";let s=Date.now()-t.getTime();return s<45e3?"\u525B\u525B":s<36e5?`${Math.max(1,Math.round(s/6e4))} \u5206\u9418\u524D`:s<864e5?`${Math.round(s/36e5)} \u5C0F\u6642\u524D`:s<6048e5?`${Math.round(s/864e5)} \u5929\u524D`:_e(t)}function B(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;if(t<6e4)return`${(t/1e3).toFixed(1)} s`;let s=Math.floor(t/6e4),a=Math.round(t%6e4/1e3);return`${s}m ${a}s`}function Ee(e){return ha[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function V(e,t){let s=Ee(e);return`<span class="badge ${ba[s.tone]}"><span class="status-dot ${ya[s.tone]}"></span>${n(t||s.label)}</span>`}function $a(e){return e==="law"?'<span class="badge badge-info">\u6CD5\u898F</span>':e==="order"?'<span class="badge badge-neutral">\u547D\u4EE4</span>':e?`<span class="badge badge-neutral">${n(e)}</span>`:'<span class="cell-empty">\u2014</span>'}function ut(e,t){let s=String(e??"");return s.length>t?`${s.slice(0,t)}\u2026`:s}function pt(e,t="text"){if(e==null||e==="")return'<span class="cell-empty">\u2014</span>';switch(t){case"boolean":return e?'<span class="badge badge-ok">\u662F</span>':'<span class="badge badge-neutral">\u5426</span>';case"status":return V(String(e));case"source":return $a(String(e));case"number":return`<span class="mono">${u(e)}</span>`;case"duration":return`<span class="mono">${B(e)}</span>`;case"datetime":return`<span class="mono">${ee(e)}</span>`;case"date":return`<span class="mono">${_e(e)}</span>`;case"url":{let s=String(e),a=ut(s.replace(/^https?:\/\//,""),46);return`<span class="cell-url"><a href="${n(s)}" target="_blank" rel="noopener noreferrer" title="${n(s)}">${$("external",10)}${n(a)}</a></span>`}case"mono":{let s=String(e);return`<span class="cell-mono cell-truncate" title="${n(s)}">${n(ut(s,54))}</span>`}case"longtext":{let s=String(e);return`<span class="cell-truncate" title="${n(s)}">${n(ut(s,100))}</span>`}default:{let s=String(e);return`<span class="cell-truncate" title="${n(s)}">${n(ut(s,90))}</span>`}}}function G({tone:e="info",title:t,text:s,iconName:a="info"}){let r=e==="ok"?"check":e==="danger"||e==="warn"?"alert":"i";return`<div class="notice notice-${e}" role="status">
    <span class="notice-icon" aria-hidden="true">${r==="i"?"i":$(r,12)}</span>
    <div class="notice-body">
      ${t?`<strong>${n(t)}</strong>`:""}
      ${s?`<p>${s}</p>`:""}
    </div>
  </div>`}function me({iconName:e="search",title:t,text:s="",actions:a="",className:r=""}){return`<div class="empty-state ${r}">
    <span class="empty-icon">${$(e,24)}</span>
    <h3 class="empty-title">${n(t)}</h3>
    ${s?`<p class="empty-text">${s}</p>`:""}
    ${a?`<div class="empty-actions">${a}</div>`:""}
  </div>`}function Q(e,t,s="\u8655\u7406\u4E2D\u2026"){e&&(t?(e.dataset.idleHtml||(e.dataset.idleHtml=e.innerHTML),e.disabled=!0,e.classList.add("is-loading"),e.innerHTML=`<span class="spinner" aria-hidden="true"></span><span>${n(s)}</span>`):(e.disabled=!1,e.classList.remove("is-loading"),e.dataset.idleHtml&&(e.innerHTML=e.dataset.idleHtml,delete e.dataset.idleHtml)))}function O(e,t="info",s=4200){let a=document.getElementById("toast-region");if(!a)return null;let r={info:"i",ok:"\u2713",warn:"!",danger:"\xD7"},i=document.createElement("div");i.className=`toast toast-${t}`,i.setAttribute("role",t==="danger"?"alert":"status"),i.innerHTML=`<span class="toast-mark" aria-hidden="true">${r[t]||"i"}</span>
    <div class="toast-body">${n(e)}</div>
    <button class="toast-close" type="button" aria-label="\u95DC\u9589\u901A\u77E5">\xD7</button>`;let o=()=>{i.isConnected&&(i.classList.add("is-leaving"),window.setTimeout(()=>i.remove(),190))};return i.querySelector(".toast-close").addEventListener("click",o),a.appendChild(i),s>0&&window.setTimeout(o,s),i}async function mt(e){try{return await navigator.clipboard.writeText(e),!0}catch{let s=document.createElement("textarea");s.value=e,s.setAttribute("readonly",""),s.style.position="fixed",s.style.opacity="0",document.body.appendChild(s),s.select();let a=!1;try{a=document.execCommand("copy")}catch{a=!1}return s.remove(),a}}function je(e,t,s="text/plain;charset=utf-8"){let a=new Blob([t],{type:s}),r=URL.createObjectURL(a),i=document.createElement("a");i.href=r,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(r),1e3)}var ks="judgment.theme",Vt="nvidia",xs=[{id:"vercel",name:"Vercel",description:"\u9ED1\u767D\u7CBE\u6E96 \xB7 Geist \xB7 \u5E7E\u4F55\u7559\u767D",swatches:["#171717","#0070f3","#fafafa"],metaColor:"#ffffff"},{id:"apple",name:"Apple",description:"SF Pro \xB7 \u5927\u5713\u89D2 \xB7 \u6C89\u6D78\u7559\u767D",swatches:["#1d1d1f","#0071e3","#f5f5f7"],metaColor:"#fbfbfd"},{id:"meta",name:"Meta",description:"Optimistic \xB7 \u660E\u4EAE\u85CD \xB7 \u81A0\u56CA\u5143\u4EF6",swatches:["#0064e0","#0091ff","#f1f4f7"],metaColor:"#ffffff"},{id:"nvidia",name:"NVIDIA",description:"GPU \u7DA0 \xB7 \u9ED1\u5E95 \xB7 \u92B3\u5229\u76F4\u89D2",swatches:["#76b900","#000000","#f7f7f7"],metaColor:"#000000"},{id:"ibm",name:"IBM",description:"Carbon \xB7 Plex Sans \xB7 \u4F01\u696D\u85CD",swatches:["#0f62fe","#161616","#f4f4f4"],metaColor:"#161616"},{id:"stripe",name:"Stripe",description:"\u7D2B\u975B\u6F38\u5C64 \xB7 \u7CBE\u5BC6\u91D1\u878D\u611F",swatches:["#635bff","#ea2261","#f6f9fc"],metaColor:"#ffffff"},{id:"linear",name:"Linear",description:"\u6DF1\u7A7A\u9ED1 \xB7 \u975B\u7D2B \xB7 \u6975\u7C21\u7DDA\u689D",swatches:["#5e6ad2","#010102","#e8e8ec"],metaColor:"#010102"},{id:"figma",name:"Figma",description:"\u591A\u5F69\u8272\u584A \xB7 \u5354\u4F5C\u611F \xB7 \u85CD\u8272\u7126\u9EDE",swatches:["#f24e1e","#a259ff","#0acf83"],metaColor:"#ffffff"},{id:"notion",name:"Notion",description:"\u6696\u767D\u7D19\u5F35 \xB7 \u896F\u7DDA\u6A19\u984C \xB7 \u77E5\u8B58\u5EAB",swatches:["#191918","#0075de","#f7f6f3"],metaColor:"#ffffff"},{id:"openai",name:"OpenAI",description:"\u6696\u7070\u756B\u5E03 \xB7 \u9ED1\u8272\u884C\u52D5 \xB7 \u7DA0\u8272\u8A0A\u865F",swatches:["#10a37f","#0d0d0d","#f9f9f7"],metaColor:"#f9f9f7"}],Wt=new Map(xs.map(e=>[e.id,e]));function wa(e){return Wt.has(e)}function _a(e){return Wt.get(e)||Wt.get(Vt)}function ka(){try{let e=window.localStorage.getItem(ks);return wa(e)?e:Vt}catch{return Vt}}function _s(e,{persist:t=!0}={}){let s=_a(e);document.documentElement.dataset.theme=s.id;let a=document.getElementById("theme-color-meta");a&&a.setAttribute("content",s.metaColor);let r=document.getElementById("theme-label");r&&(r.textContent=s.name);let i=document.getElementById("theme-swatches");if(i&&(i.innerHTML=s.swatches.map(o=>`<i class="style-swatch" style="--swatch:${n(o)}"></i>`).join("")),document.querySelectorAll(".theme-option").forEach(o=>{let l=o.dataset.themeId===s.id;o.classList.toggle("is-active",l),o.setAttribute("aria-checked",l?"true":"false")}),t)try{window.localStorage.setItem(ks,s.id)}catch{}return window.dispatchEvent(new CustomEvent("judgment:theme",{detail:{theme:s.id}})),s}function xa(e){let t=xs.map((s,a)=>{let r=s.swatches.map(i=>`<i style="--swatch:${n(i)}"></i>`).join("");return`<button class="theme-option" type="button" role="menuitemradio"
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
    </div>${t}`}function Ss(){let e=document.getElementById("style-picker"),t=document.getElementById("style-trigger"),s=document.getElementById("style-menu");if(!e||!t||!s)return;xa(s),_s(ka(),{persist:!1});let a=()=>Array.from(s.querySelectorAll(".theme-option")),r=()=>{s.hidden=!1,t.setAttribute("aria-expanded","true");let o=s.querySelector(".theme-option.is-active")||a()[0];o&&o.focus()},i=({restoreFocus:o=!1}={})=>{s.hidden||(s.hidden=!0,t.setAttribute("aria-expanded","false"),o&&t.focus())};t.addEventListener("click",()=>{s.hidden?r():i({restoreFocus:!0})}),t.addEventListener("keydown",o=>{(o.key==="ArrowDown"||o.key==="ArrowUp")&&(o.preventDefault(),r())}),s.addEventListener("click",o=>{let l=o.target.closest(".theme-option");l&&(_s(l.dataset.themeId),i({restoreFocus:!0}))}),s.addEventListener("keydown",o=>{let l=a(),f=l.indexOf(document.activeElement);if(o.key==="Escape"){o.preventDefault(),i({restoreFocus:!0});return}if(o.key==="ArrowDown"||o.key==="ArrowUp"){o.preventDefault();let b=o.key==="ArrowDown"?1:-1,g=l[(f+b+l.length)%l.length];g&&g.focus();return}if(o.key==="Home"||o.key==="End"){o.preventDefault();let b=o.key==="Home"?l[0]:l[l.length-1];b&&b.focus()}}),document.addEventListener("pointerdown",o=>{e.contains(o.target)||i()}),document.addEventListener("keydown",o=>{o.key==="Escape"&&i()})}var os={};Qe(os,{render:()=>zn});var Sa="judgment-console";var ke="query_history",Ne="settings";var Le={history:[],settings:new Map,nextId:1},vt=null,fe=!("indexedDB"in window);function tt(e){return new Promise((t,s)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>s(e.error)})}function Re(e){return new Promise((t,s)=>{e.oncomplete=()=>t(),e.onerror=()=>s(e.error),e.onabort=()=>s(e.error||new Error("transaction aborted"))})}function Ie(){return vt||(vt=new Promise((e,t)=>{if(!("indexedDB"in window)){fe=!0,t(new Error("IndexedDB is unavailable"));return}let s;try{s=window.indexedDB.open(Sa,1)}catch(a){fe=!0,t(a);return}s.onupgradeneeded=()=>{let a=s.result;if(!a.objectStoreNames.contains(ke)){let r=a.createObjectStore(ke,{keyPath:"id",autoIncrement:!0});r.createIndex("created_at","created_at"),r.createIndex("kind","kind")}a.objectStoreNames.contains(Ne)||a.createObjectStore(Ne,{keyPath:"key"})},s.onsuccess=()=>{let a=s.result;a.onversionchange=()=>a.close(),e(a)},s.onerror=()=>{fe=!0,t(s.error||new Error("Unable to open IndexedDB"))},s.onblocked=()=>{fe=!0,t(new Error("IndexedDB upgrade blocked by another tab"))}}),vt)}function As(){return"indexedDB"in window}function Ls(){return fe}function ft(){return fe?"memory":"indexeddb"}function Aa(e){let t=e.created_at||new Date().toISOString();return{kind:e.kind||"query",title:String(e.title||""),detail:String(e.detail||""),payload:e.payload||{},created_at:t}}async function La(){try{let t=(await Ie()).transaction(ke,"readwrite"),s=t.objectStore(ke),a=await tt(s.count());if(a>120){let r=a-120,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let f=i.result;if(!f||r<=0){o();return}f.delete(),r-=1,f.continue()},i.onerror=()=>l(i.error)})}await Re(t)}catch{fe=!0}}async function gt(e){let t=Aa(e);try{let a=(await Ie()).transaction(ke,"readwrite"),r=a.objectStore(ke),i=await tt(r.add(t));return await Re(a),await La(),i}catch{fe=!0;let a=Le.nextId++;return Le.history.push({id:a,...t}),Le.history.length>120&&Le.history.shift(),a}}async function ht({keyword:e="",limit:t=50}={}){let s=e.trim().toLowerCase();try{let r=(await Ie()).transaction(ke,"readonly"),i=r.objectStore(ke),o=await tt(i.getAll());return await Re(r),o.filter(l=>s?`${l.kind} ${l.title} ${l.detail}`.toLowerCase().includes(s):!0).sort((l,f)=>String(f.created_at).localeCompare(String(l.created_at))).slice(0,t)}catch{return fe=!0,Le.history.filter(r=>s?`${r.kind} ${r.title} ${r.detail}`.toLowerCase().includes(s):!0).slice().sort((r,i)=>String(i.created_at).localeCompare(String(r.created_at))).slice(0,t)}}async function Ms(){try{let t=(await Ie()).transaction(ke,"readwrite");t.objectStore(ke).clear(),await Re(t)}catch{fe=!0}Le.history=[]}async function Ts(e,t){let s={key:String(e),value:t,updated_at:new Date().toISOString()};try{let r=(await Ie()).transaction(Ne,"readwrite");return r.objectStore(Ne).put(s),await Re(r),s}catch{return fe=!0,Le.settings.set(s.key,s),s}}async function st(e,t=null){try{let a=(await Ie()).transaction(Ne,"readonly"),r=a.objectStore(Ne),i=await tt(r.get(String(e)));return await Re(a),i?i.value:t}catch{fe=!0;let a=Le.settings.get(String(e));return a?a.value:t}}async function qs({keyword:e=""}={}){let t=e.trim().toLowerCase();try{let a=(await Ie()).transaction(Ne,"readonly"),r=a.objectStore(Ne),i=await tt(r.getAll());return await Re(a),i.filter(o=>t?`${o.key} ${JSON.stringify(o.value)}`.toLowerCase().includes(t):!0).sort((o,l)=>String(o.key).localeCompare(String(l.key)))}catch{return fe=!0,Array.from(Le.settings.values()).filter(a=>t?`${a.key} ${JSON.stringify(a.value)}`.toLowerCase().includes(t):!0)}}function Es(e){if(typeof e=="string")return e;try{return JSON.stringify(e)}catch{return String(e)}}var is={};Qe(is,{render:()=>qn,renderTestFlowPanel:()=>St});var ns={};Qe(ns,{exportCsv:()=>kt,exportableResult:()=>xt,render:()=>cn,renderReport:()=>$t,reportError:()=>_t,reportLoading:()=>at});var Ds=[10,25,50,100],Ma=500,Ta=["law_name","law_level","law_category","law_modified_date","article_count"],qa=["jid","court_normalized","title","jdate","matched_laws","citation_count"],Ea={A:"\u689D\u6587",C:"\u7AE0\u7BC0"};function wt(e){return e?.label||e?.id||"\u8CC7\u6599\u5EAB"}function bt(e,t){let s={};for(let a of e.fields||[]){let r=a.type==="checkbox"?!1:a.type==="multiselect"?[]:"",i=a.default===void 0?r:a.default;s[a.key]=Array.isArray(i)?[...i]:i}return{values:s,page:1,pageSize:t,result:null,sort:null,columnFilters:{}}}function ja(e,t){let s=e.visibleWhen;if(!s)return!0;for(let[a,r]of Object.entries(s))if(Array.isArray(r)&&!r.map(String).includes(String(t[a]??"")))return!1;return!0}function as(e,t){return(e.fields||[]).filter(s=>ja(s,t))}function Na(e,t){return`filter-${e.id}-${t}`}function Be(e){return e==null?"":n(String(e))}function Kt(e,t,s){let a=s[t.key],r=Na(e,t.key),i=t.help?`<span class="field-help">${n(t.help)}</span>`:"";if(t.type==="checkbox")return`<div class="field">
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
    </label>`;if(t.type==="select"){let l=(t.options||[]).map(f=>`<option value="${Be(f.value)}" ${String(f.value)===String(a??"")?"selected":""}>${n(f.label??f.value)}</option>`).join("");return`<div class="field">${o}
      <select class="select" id="${r}" name="${n(t.key)}">${l}</select>
      ${i}
    </div>`}if(t.type==="multiselect"){let l=new Set((Array.isArray(a)?a:[]).map(String)),f=(t.options||[]).map(b=>`<label class="multi-option">
          <input type="checkbox" name="${n(t.key)}" value="${Be(b.value)}" ${l.has(String(b.value))?"checked":""} />
          <span>${n(b.label??b.value)}</span>
        </label>`).join("");return`<div class="field">${o}
      <div class="multi-select">${f}</div>
      ${i}
    </div>`}return t.type==="number"?`<div class="field">${o}
      <input class="input" type="number" id="${r}" name="${n(t.key)}"
        value="${Be(a)}"
        ${t.min!==void 0?`min="${t.min}"`:""}
        ${t.max!==void 0?`max="${t.max}"`:""}
        step="${t.step??1}"
        placeholder="${Be(t.placeholder||"")}" />
      ${i}
    </div>`:t.type==="date"?`<div class="field">${o}
      <input class="input" type="date" id="${r}" name="${n(t.key)}"
        value="${Be(a)}" />
      ${i}
    </div>`:`<div class="field">${o}
    <input class="input" type="text" id="${r}" name="${n(t.key)}"
      value="${Be(a)}"
      placeholder="${Be(t.placeholder||"")}" />
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
  </form>`}function yt(e,t,s){let a={...s.values};for(let r of as(t,a))if(r.type==="checkbox"){let i=e.querySelector(`[name="${r.key}"]`);a[r.key]=!!i?.checked}else if(r.type==="multiselect")a[r.key]=Array.from(e.querySelectorAll(`[name="${r.key}"]:checked`)).map(i=>i.value);else{let i=e.querySelector(`[name="${r.key}"]`);a[r.key]=i?i.value:""}return a}function Os(e,t){let s={};for(let a of as(e,t.values)){let r=t.values[a.key];a.type==="checkbox"?s[a.key]=!!r:a.type==="multiselect"?s[a.key]=Array.isArray(r)?r:[]:a.type==="number"?s[a.key]=r===""||r===null?"":Number(r):s[a.key]=r??""}return s}function Xt(e,t){let s=Os(e,t);return(e.id==="postgres"||e.id==="parquet")&&t.sort?.key&&(s.sort=`${t.sort.key}:${t.sort.direction}`,s.schema_preview=!0),t.columnFilters&&Object.keys(t.columnFilters).length>0&&(s.column_filters=t.columnFilters),s}function js(e){if(e.status==="operational")return"";let t=e.status==="unavailable"?"danger":e.status==="degraded"?"warn":"info";return`<div class="sidebar-notice">${G({tone:t,title:`${wt(e)} ${Ee(e.status).label}`,text:n(e.detail||"\u76EE\u524D\u7121\u6CD5\u4F7F\u7528\u9019\u500B\u8CC7\u6599\u4F86\u6E90\u3002")})}</div>`}function Pa(e,t){return`<div class="db-options" role="radiogroup" aria-label="\u9078\u64C7\u8CC7\u6599\u5EAB">
    ${e.map(s=>{let a=Ee(s.status);return`<label class="db-option">
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
  </div>`}function Ca(e){return`<div class="sidebar-view-switch" role="tablist" aria-label="\u67E5\u8A62\u6216 schema">
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
  </div>`}function Ns(e,t){return`<div class="category-options" role="radiogroup" aria-label="\u8CC7\u6599\u985E\u578B">
    ${e.map(s=>{let a=s.id===t,r=s.id==="judgment"&&s.count!==void 0?`${u(s.count)} \u7B46\u5DF2\u7BE9\u9078\u5224\u6C7A`:s.description||"";return`<label class="category-option${a?" is-selected":""}">
          <input type="radio" name="category" value="${n(s.id)}" ${a?"checked":""} />
          <span class="category-option-body">
            <span class="category-option-label">${n(s.label)}</span>
            <span class="category-option-desc">${n(r)}</span>
          </span>
        </label>`}).join("")}
  </div>`}function Ps(e){return{postgres:"PostgreSQL \u67E5\u8A62\u4F7F\u7528\u53C3\u6578\u5316\u689D\u4EF6\u8207\u5206\u9801\uFF0C\u50C5\u8B80\u53D6\u8CC7\u6599\u3002",parquet:"Parquet \u67E5\u8A62\u76F4\u63A5\u6383\u63CF\u76EE\u524D\u6700\u65B0\u7684\u5FEB\u7167\uFF1B\u52FE\u9078\u539F\u59CB JSON \u6703\u589E\u52A0\u56DE\u50B3\u91CF\u8207\u6E32\u67D3\u6642\u9593\u3002",qdrant:"Qdrant \u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\uFF1B\u9700\u8981\u5148\u5B8C\u6210\u5411\u91CF\u7D22\u5F15\u3002\u6AA2\u7D22\u7D50\u679C\u53EA\u5305\u542B\u7D22\u5F15\u4E2D\u5BE6\u969B\u5B58\u5728\u7684\u5224\u6C7A\uFF0C\u4E0D\u6703\u7522\u751F\u865B\u69CB\u8CC7\u6599\u3002",indexeddb:"IndexedDB \u53EA\u5728\u9019\u500B\u700F\u89BD\u5668\u5167\u67E5\u8A62\uFF0C\u4E0D\u6703\u7D93\u904E\u4F3A\u670D\u5668\uFF1B\u6E05\u9664\u7DB2\u7AD9\u8CC7\u6599\u5F8C\u7D00\u9304\u6703\u6D88\u5931\u3002"}[e.id]||n(e.detail||"")}function Ra(e){return`<div class="report-empty">
    ${me({iconName:"table",title:"\u67E5\u8A62\u5831\u8868\u6703\u986F\u793A\u5728\u9019\u88E1",text:n({postgres:"\u9078\u64C7\u8CC7\u6599\u8868\u8207 metadata \u689D\u4EF6\uFF0C\u57F7\u884C\u5F8C\u6703\u7522\u751F SQL\u3001\u6458\u8981\u3001\u5206\u5E03\u8207\u8CC7\u6599\u5217\u3002",parquet:"\u9078\u64C7\u8CC7\u6599\u96C6\u8207\u56DE\u50B3\u6B04\u4F4D\uFF0C\u76F4\u63A5\u6383\u63CF\u539F\u59CB Parquet\u3002",qdrant:"\u8F38\u5165\u8A9E\u610F\u67E5\u8A62\u5F8C\uFF0C\u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5DF2\u5EFA\u7ACB\u5411\u91CF\u7D22\u5F15\u7684\u5224\u6C7A\uFF1B\u672A\u7D22\u5F15\u6642\u6703\u660E\u78BA\u986F\u793A\u72C0\u614B\u3002",indexeddb:"\u67E5\u8A62\u5B58\u5728\u9019\u500B\u700F\u89BD\u5668\u7684\u63D0\u554F\u7D00\u9304\u8207\u8A2D\u5B9A\uFF0C\u4E0D\u9700\u8981\u4F3A\u670D\u5668\u3002"}[e.id]||"\u8A2D\u5B9A\u689D\u4EF6\u5F8C\u57F7\u884C\u67E5\u8A62\u3002")})}
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
  </div>`}function at(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${n(wt(e))} \u67E5\u8A62\u4E2D</div>
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
  </div>`}function _t(e,t){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${n(wt(t))} \u67E5\u8A62\u5931\u6557</div>
        <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${G({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u67E5\u8A62\u7D50\u679C",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="retry">
          ${$("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function Ia(e){if(!e.length)return'<div class="report-empty-inline">\u9019\u6B21\u67E5\u8A62\u6C92\u6709\u53EF\u5448\u73FE\u7684\u5206\u5E03\u8CC7\u6599\u3002</div>';let t=Math.max(...e.map(s=>Number(s.value)||0),1);return`<div class="distribution">
    ${e.map(s=>{let a=Number(s.value)||0,r=Math.max(1.5,a/t*100);return`<div class="dist-row">
          <span class="dist-label" title="${n(s.label||"\u672A\u5206\u985E")}">${n(s.label||"\u672A\u5206\u985E")}</span>
          <span class="dist-track"><span class="dist-bar" style="width:${r.toFixed(1)}%"></span></span>
          <span class="dist-value">${u(a)}</span>
        </div>`}).join("")}
  </div>`}function Fs(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="law_documents"}function Ba(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="judgment_documents"}function Da(e){return e&&e.database==="qdrant"&&String(e.table||"").startsWith("judgment")}function Oa(e){let t=e._jid||e.jid;return t?`<button class="law-link judgment-link" type="button" data-action="open-judgment"
    data-jid="${n(String(t))}"
    title="\u6AA2\u8996\u300C${n(String(t))}\u300D\u7684\u5224\u6C7A\u539F\u6587">${n(String(t))}${$("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}var Fa={jid:"jid",court:"court",court_normalized:"court",title:"title",jdate:"jdate",matched_laws:"matched_laws",citation_count:"citation_count",full_text_length:"full_text_length"};function Ha(e,t,s,a=!1,r=!0,i=!1){let o=a?e.key:e.label||e.key,l=r?t?Fa[e.key]||e.key:i?e.key:null:null;if(!l)return`<th scope="col">${n(o)}</th>`;let f=s?.key===l,b=f?s.direction:null,g=b==="asc"?"ascending":b==="desc"?"descending":"none",p=b==="asc"?"\u2191":b==="desc"?"\u2193":"\u2195";return`<th scope="col" aria-sort="${g}">
    <button class="table-sort${f?" is-active":""}" type="button"
      data-action="sort-column" data-sort-key="${n(l)}"
      title="\u4F9D${n(o)}\u6392\u5E8F">
      <span>${n(o)}</span>
      <span class="table-sort-icon" aria-hidden="true">${p}</span>
    </button>
  </th>`}function Ua(e,t){if(!Fs(e)||!t)return null;let s=t._law_key||t.law_name;if(!s)return null;let a=e.meta?.dataset,r=t._law_source_type||(a&&a!=="all"?a:"");return{lawKey:String(s),sourceType:String(r||""),lawName:String(t.law_name||"")}}function za(e,t,s){let a=e[t.key];return a==null||a===""?"\u2014":`<button class="law-link" type="button" data-action="open-law"
    data-law-key="${n(s.lawKey)}"
    data-law-source="${n(s.sourceType)}"
    data-law-name="${n(s.lawName)}"
    title="\u6AA2\u8996\u300C${n(String(a))}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${n(String(a))}${$("chevronRight",12,"law-link-icon")}</button>`}function Hs(e,{useColumnKeys:t=!1,sortable:s=!0,sortableAll:a=!1,searchValues:r=null,compact:i=!1}={}){let o=Array.isArray(e.columns)?e.columns:[],l=Array.isArray(e.rows)?e.rows:[],f=(e.page-1)*e.page_size,b=Fs(e),g=Ba(e),p=Da(e),h=e.meta?.sort||null,x=r?`<tr class="schema-search-row">
        <th scope="col" class="cell-index-head"></th>
        ${o.map(_=>`<th scope="col">
              <div class="schema-search-wrap">
                <input class="schema-search-input" type="search"
                  data-schema-search="${n(_.key)}"
                  value="${n(String(r[_.key]??""))}"
                  placeholder="\u641C\u5C0B ${n(_.key)}"
                  autocomplete="off" />
              </div>
            </th>`).join("")}
      </tr>`:"";return o.length?l.length?`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">${u(l.length)} rows \xB7 \u7B2C ${e.page} \u9801${b?" \xB7 \u9EDE\u9078\u6CD5\u898F\u540D\u7A31\u53EF\u6AA2\u8996\u5B8C\u6574\u689D\u6587":g?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u6B04\u4F4D\u6A19\u984C\u53EF\u6392\u5E8F":p?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u4F9D\u76F8\u4F3C\u5EA6\u6392\u5E8F":""}</span>
    </div>
    <div class="table-wrap">
      <table class="data-table${i?" is-compact":""}">
        <thead>${x}<tr>
          <th scope="col" class="cell-index-head">#</th>
          ${o.map(_=>Ha(_,g,h,t,s,a)).join("")}
        </tr></thead>
        <tbody>
          ${l.map((_,E)=>`<tr>
                <td class="cell-mono cell-empty cell-index">${f+E+1}</td>
                ${o.map(P=>{if((g||p)&&P.key==="jid")return`<td class="cell-jid">${Oa(_)}</td>`;let C=b&&P.key==="law_name"?Ua(e,_):null;if(C)return`<td>${za(_,P,C)}</td>`;let A={date:"cell-date",datetime:"cell-datetime",duration:"cell-duration",number:"cell-number"}[P.type];return`<td${A?` class="${A}"`:""}>${pt(_[P.key],P.type||"text")}</td>`}).join("")}
              </tr>`).join("")}
        </tbody>
      </table>
    </div>`:`<div class="report-table-head">
        <span class="report-section-title">\u8CC7\u6599\u5217</span>
        <span class="muted" style="font-size:10px">0 rows</span>
      </div>
      ${me({iconName:"filter",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u8CC7\u6599",text:"\u653E\u5BEC\u65E5\u671F\u5340\u9593\u3001\u964D\u4F4E\u689D\u6587\u6578\u4E0B\u9650\uFF0C\u6216\u6E05\u9664\u95DC\u9375\u5B57\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}`:`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">\u6B64\u8CC7\u6599\u4F86\u6E90\u6C92\u6709\u8868\u683C\u6B04\u4F4D</span>
    </div>`}function Ga(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,r=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${r} \u9801 \xB7
      \u986F\u793A ${u(i)}\u2013${u(o)} / ${u(t)} \u7B46
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
  </div>`}function Us(e){return!Array.isArray(e)||!e.length?"":`<div class="warnings">${e.map(t=>`<div class="warning-line">${n(t)}</div>`).join("")}</div>`}function $t(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.columns)?e.columns:[],a=Array.isArray(e.summary)?e.summary:[],r=Array.isArray(e.distribution)?e.distribution:[],i=Number(e.total)||0,o=e.query_text||"",l=e.database||"",f=e.status||"ok",b=e.meta?.table_label||e.table||e.label||"query result";return`<div class="report-card" data-database="${n(l)}">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT \xB7 ${n(String(l).toUpperCase())}</div>
        <div class="report-title">
          ${n(e.label||l)}
          ${V(f)}
          <span class="chip">${n(b)}</span>
        </div>
        <div class="report-sub">
          ${u(i)} \u7B46\u7B26\u5408 \xB7
          ${B(e.duration_ms)} \xB7
          ${n(String(l).toUpperCase())} / ${n(String(e.table||"\u2014"))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${$("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${$("file",14)}<span>JSON</span></button>
      </div>
    </div>

    ${e.message?`<div class="report-alert">${G({tone:f==="not_configured"?"info":f==="danger"?"danger":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n(e.message)})}</div>`:""}

    ${a.length?`<div class="summary-strip">
            ${a.slice(0,4).map(g=>`<div class="summary-item">
                  <div class="summary-label">${n(g.label)}</div>
                  <div class="summary-value">${n(g.value)}</div>
                </div>`).join("")}
          </div>`:""}

    <div class="report-grid">
      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u7D50\u679C\u5206\u5E03</span>
          <span class="muted" style="font-size:9.5px">${r.length} groups</span>
        </div>
        ${Ia(r)}
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
    ${i||s.length?Ga({...e,total:i,page:Number(e.page)||1,page_size:Number(e.page_size)||25}):""}
  </div>`}function Cs(e){return`<div class="report-card schema-preview">
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
  </div>`}function es(e,t,{columnFilters:s={},searchEnabled:a=!1}={}){let r=Array.isArray(e.columns)?e.columns:[],i=Array.isArray(e.rows)?e.rows:[],o=e.message?`<div class="report-alert">${G({tone:e.status==="ok"?"info":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n(e.message)})}</div>`:"";return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW \xB7 ${n(String(e.database||"").toUpperCase())}</div>
        <div class="report-title">
          ${n(t||e.table||"\u8CC7\u6599\u8868")}
          ${V(e.status||"ok")}
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
      <span>\u9810\u89BD\u524D ${u(i.length)} \u7B46</span>
      <strong>\u5171 ${u(e.total)} \u7B46</strong>
    </div>
  </div>`}function Rs(e,t){return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW</div>
        <div class="report-title">${n(t||"\u8CC7\u6599\u8868")}</div>
        <div class="report-sub">\u7121\u6CD5\u8B80\u53D6\u8CC7\u6599\u8868\u9810\u89BD\u3002</div>
      </div>
    </div>
    ${G({tone:"danger",title:"\u8B80\u53D6\u5931\u6557",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
  </div>`}function Qa(e){return`<div class="report-empty">
    ${me({iconName:"table",title:"\u9078\u64C7\u8CC7\u6599\u8868\u9810\u89BD",text:`\u5F9E\u5DE6\u5074 ${wt(e)} \u7684 Schema \u6E05\u55AE\u9EDE\u9078\u8CC7\u6599\u8868\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6B04\u4F4D\u540D\u7A31\u3001\u524D 10 \u7B46\u8CC7\u6599\u8207\u7E3D\u7B46\u6578\u3002`})}
  </div>`}function ts(e){return e.is_current===!0?V("ok","\u73FE\u884C"):e.law_abandon_note?V("empty","\u5DF2\u5EE2\u6B62"):e.is_current===!1?V("empty","\u6B77\u53F2\u7248\u672C"):V("not_configured","\u72C0\u614B\u672A\u63D0\u4F9B")}function Y(e,t){return`<div class="law-meta-item">
    <div class="law-meta-label">${n(e)}</div>
    <div class="law-meta-value">${t||"\u2014"}</div>
  </div>`}function De(e){return e?_e(e):"\u2014"}function Ja(e){return e?.meta?.metadata_source==="postgresql"?"PostgreSQL metadata":e?.meta?.metadata_source==="parquet"?"Parquet snapshot":"\u2014"}function ss(e,t){return t?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">${n(e)}</span>
    </div>
    <div class="law-text-block">${n(String(t).trim())}</div>
  </div>`:""}function Va(e,t,{open:s=!1}={}){return t?`<details class="report-section law-disclosure" data-law-history ${s?"open":""}>
    <summary class="law-disclosure-summary">
      <span class="report-section-title">${n(e)}</span>
      <span class="law-disclosure-hint">\u9810\u8A2D\u6536\u5408 \xB7 \u9EDE\u64CA\u5C55\u958B</span>
      ${$("chevronDown",14,"law-disclosure-chevron")}
    </summary>
    <div class="law-text-block">${n(String(t).trim())}</div>
  </details>`:""}function Wa(e){let t=Array.isArray(e)?e:[],s=t.map(a=>{let r=a?.name||a?.url||"";return r?a.url?`<a class="law-attachment" href="${n(a.url)}" target="_blank" rel="noopener noreferrer">
          ${$("file",12)}<span>${n(r)}</span>${$("external",11)}
        </a>`:`<span class="law-attachment">${$("file",12)}<span>${n(r)}</span></span>`:""}).filter(Boolean).join("");return s?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">\u9644\u4EF6</span>
      <span class="muted">${u(t.length)}</span>
    </div>
    <div class="law-attachment-list">${s}</div>
  </div>`:""}function zs(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function Ka(e){let t=Array.isArray(e.articles)?e.articles:[],s=t.filter(o=>o.article_type==="C").length,a=t.length-s,r=s?`${u(a)} \u689D \xB7 ${u(s)} \u7AE0\u7BC0`:`${u(a)} \u689D`,i=t.map(o=>{let l=String(o.article_content||"").trim();if(!l)return"";if(o.article_type==="C")return`<div class="law-chapter">${n(l)}</div>`;let f=Ea[o.article_type]||o.article_type;return`<article class="law-article"
        data-article-no="${n(zs(o.article_no))}">
        <div class="law-article-head">
          <span class="law-article-no">${n(o.article_no||"\u689D\u6587")}</span>
          ${f&&f!=="\u689D\u6587"?`<span class="chip">${n(f)}</span>`:""}
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
  </div>`}function Ya(){return`<div class="law-jump-float">
    <input class="input law-article-jump-input law-jump-input"
      id="law-article-jump-float" type="text" inputmode="numeric"
      autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
    <button class="btn btn-secondary btn-sm" type="button"
      data-action="jump-article" data-jump-input="law-article-jump-float">\u8DF3\u81F3</button>
  </div>`}function We(){return`<button class="btn btn-secondary btn-sm" type="button" data-action="back-to-results">
    ${$("chevronLeft",14)}<span>\u8FD4\u56DE\u67E5\u8A62\u7D50\u679C</span>
  </button>`}function Xa(e){return`<div class="law-report">
    <div class="law-report-topbar">
      ${We()}
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
  </div>`}function Za(e,t){return`<div class="law-report">
    <div class="law-report-topbar">
      ${We()}
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
  </div>`}function en(e){let t=Array.isArray(e.versions)?e.versions:[];if(t.length<1)return"";let s=e.selected_version_id??"";return`<label class="law-version-select">
    <span>\u689D\u6587\u7248\u672C</span>
    <select class="select" data-action="select-law-version" aria-label="\u9078\u64C7\u6CD5\u898F\u689D\u6587\u7248\u672C">
      ${t.map(a=>{let r=String(a.update_date||"").match(/\d{4}\/\d{1,2}\/\d{1,2}/)?.[0]||"",i=[`#${a.version_id}`,a.is_current?"\u76EE\u524D":"\u6B77\u53F2",r,a.article_count_for_law?`${u(a.article_count_for_law)} \u7B46`:"\u7121\u689D\u6587\u5FEB\u7167"].filter(Boolean).join(" \xB7 ");return`<option value="${n(a.version_id)}" ${String(a.version_id)===String(s)?"selected":""}>${n(i)}</option>`}).join("")}
    </select>
  </label>`}function tn(e){let t=e.change_summary||{},s=Object.values(t).reduce((o,l)=>o+(Number(l)||0),0),a=Array.isArray(e.changes)?e.changes:[];if(!e.changes_available&&!s)return"";let r={added:"\u65B0\u589E",modified:"\u4FEE\u6539",removed:"\u79FB\u9664"},i=["added","modified","removed"].map(o=>`${r[o]} ${u(t[o]||0)}`).join(" \xB7 ");return`<details class="report-section law-version-changes">
    <summary>
      <span class="report-section-title">\u7248\u672C\u8B8A\u66F4</span>
      <span class="muted">${n(i)}</span>
    </summary>
    <div class="law-version-change-list">
      ${a.length?a.slice(0,20).map(o=>{let l=o.change_type==="added"?"badge-ok":o.change_type==="removed"?"badge-danger":"badge-warn",f=o.before_content?`<details><summary>\u8B8A\u66F4\u524D</summary><pre>${n(o.before_content)}</pre></details>`:"",b=o.after_content?`<details><summary>\u8B8A\u66F4\u5F8C</summary><pre>${n(o.after_content)}</pre></details>`:"";return`<div class="law-version-change">
                  <div class="law-version-change-head">
                    <span class="badge ${l}">${n(r[o.change_type]||o.change_type)}</span>
                    <strong>${n(o.article_no||o.article_key)}</strong>
                  </div>
                  ${f}${b}
                </div>`}).join(""):'<div class="report-empty-inline">\u6B64\u7248\u672C\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u8B8A\u66F4\u3002</div>'}
      ${e.changes_truncated?'<div class="report-empty-inline">\u50C5\u986F\u793A\u524D 20 \u7B46\u8B8A\u66F4\uFF1BAPI \u56DE\u50B3\u4E0A\u9650 200 \u7B46\u3002</div>':""}
    </div>
  </details>`}function sn(e,{database:t="",lawPage:s=1,historyOpen:a=!1}={}){let r=Array.isArray(e.warnings)?e.warnings:[],i=e.law_name||e.law_key||"\u6CD5\u898F",o=(Array.isArray(e.articles)?e.articles:[]).filter(E=>E.article_type!=="C").length,l=Ja(e),f=e.meta?.articles_source==="postgresql"?"PostgreSQL \u689D\u6587\u7248\u672C":e.meta?.articles_source==="parquet"?"Parquet \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",b=e.meta?.snapshot||"",g=e.meta?.articles_source==="postgresql"&&e.selected_version_id!==null&&e.selected_version_id!==void 0?`\u689D\u6587\u7248\u672C #${e.selected_version_id}`:"",p=[l,f,g,b].filter(Boolean).join(" \xB7 "),h=e.source_type==="law"?"\u6CD5\u5F8B":e.source_type==="order"?"\u547D\u4EE4":e.source_type||"\u2014",x=e.version||{},_=[Y("\u6CD5\u898F\u4F4D\u968E",n(e.law_level||"\u2014")),Y("\u6CD5\u898F\u985E\u5225",n(e.law_category||"\u2014")),Y("\u7570\u52D5\u65E5\u671F",De(e.law_modified_date)),Y("\u751F\u6548\u65E5\u671F",De(e.law_effective_date)),Y("\u689D\u6587\u6578",u(e.article_count)),Y("\u8CC7\u6599\u72C0\u614B",ts(e)),Y("\u82F1\u8B6F\u540D\u7A31",n(e.eng_law_name||"\u2014")),Y("\u6CD5\u898F\u8B58\u5225",`<span class="mono">${n(e.law_key||"\u2014")}</span>`)];return x.first_seen_version_id!==null&&x.first_seen_version_id!==void 0&&_.push(Y("\u9996\u6B21\u6536\u9304\u7248\u672C",`#${n(x.first_seen_version_id)}`)),x.last_seen_version_id!==null&&x.last_seen_version_id!==void 0&&_.push(Y("\u6700\u5F8C\u6536\u9304\u7248\u672C",`#${n(x.last_seen_version_id)}`)),x.last_seen_at&&_.push(Y("\u6700\u5F8C\u6536\u9304\u6642\u9593",n(ee(x.last_seen_at)))),x.selected_version_id!==null&&x.selected_version_id!==void 0&&_.push(Y("\u689D\u6587\u7248\u672C",`#${n(x.selected_version_id)} \xB7 ${e.meta?.selected_version_is_current?"\u76EE\u524D":"\u6B77\u53F2"}`)),`<div class="law-report">
    <div class="law-report-topbar">
      ${We()}
      <span class="law-report-origin" title="${n(p)}">${n(p)}</span>
    </div>
    <div class="report-card law-report-card" data-database="${n(t)}">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT \xB7 ${n(String(t||l).toUpperCase())}</div>
          <div class="report-title">
            ${n(i)}
            ${ts(e)}
            <span class="chip">${n(h)}</span>
          </div>
          <div class="report-sub">
            ${n([e.law_level,e.law_category].filter(Boolean).join(" \xB7 ")||"\u2014")} \xB7 ${u(e.article_count)} \u689D \xB7 \u7570\u52D5 ${De(e.law_modified_date)}
          </div>
        </div>
        <div class="report-actions">
          ${en(e)}
          ${e.law_url?`<a class="btn btn-secondary btn-sm" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">${$("external",14)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:""}
        </div>
      </div>

      ${r.length?`<div class="report-alert">${G({tone:e.status==="degraded"?"warn":"info",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r.map(E=>n(E)).join("<br />")})}</div>`:""}

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u689D\u6587\u6578</div>
          <div class="summary-value">${u(e.article_count)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">\u7570\u52D5\u65E5\u671F</div>
          <div class="summary-value">${De(e.law_modified_date)}</div>
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
        <div class="law-meta-grid">${_.join("")}</div>
      </div>

      ${tn(e)}
      ${ss("\u6CD5\u898F\u524D\u8A00",e.law_foreword)}
      ${Va("\u6CD5\u898F\u6CBF\u9769",e.law_histories,{open:a})}
      ${ss("\u751F\u6548\u8AAA\u660E",e.law_effective_note)}
      ${ss("\u5EE2\u6B62\u8AAA\u660E",e.law_abandon_note)}
      ${Wa(e.attachments)}
      ${Ka(e)}
    </div>
    ${o>100?Ya():""}
  </div>`}function an(e){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${We()}
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
  </div>`}function nn(e,t){return`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${We()}
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
  </div>`}function rn(e){let t=new Map;for(let s of Array.isArray(e.citations)?e.citations:[]){let a=String(s.law_name||"").trim();if(!a)continue;t.has(a)||t.set(a,new Set);let r=String(s.article_no||"").trim();r&&t.get(a).add(r)}return t.size?`<div class="judgment-citation-groups">
    ${[...t.entries()].map(([s,a])=>`<div class="judgment-citation-group">
          <span class="judgment-citation-law">${n(s)}</span>
          <span class="judgment-citation-articles">${[...a].map(r=>n(r)).join("\u3001")||"\u2014"}</span>
        </div>`).join("")}
  </div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5F15\u7528\u660E\u7D30\u3002</div>'}function on(e,{database:t="postgres"}={}){let s=Array.isArray(e.matched_laws)?e.matched_laws:[],a=e.title||e.jid||"\u5224\u6C7A",r=String(e.full_text||""),i=Number(e.full_text_length)||r.length||0,o=["PostgreSQL \u5224\u6C7A\u6587\u4EF6",e.source_archive].filter(Boolean).join(" \xB7 "),l=[Y("\u6848\u865F",n(e.jid||"\u2014")),Y("\u5E74\u5EA6",n(e.jyear||"\u2014")),Y("\u5B57\u5225",n(e.jcase||"\u2014")),Y("\u865F\u78BC",n(e.jno||"\u2014")),Y("\u6CD5\u9662",n(e.court||"\u2014")),Y("\u6848\u7531",n(e.title||"\u2014")),Y("\u88C1\u5224\u65E5\u671F",De(e.jdate)),Y("\u4F86\u6E90\u58D3\u7E2E\u6A94",n(e.source_archive||"\u2014")),Y("\u5168\u6587\u9577\u5EA6",`${u(i)} \u5B57`),Y("\u5F15\u7528\u6578",u(e.citation_count))];return e.import_run_id!==null&&e.import_run_id!==void 0&&l.push(Y("\u532F\u5165 Run",`#${n(e.import_run_id)}`)),`<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${We()}
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
            ${n(e.court||"\u2014")} \xB7 ${De(e.jdate)} \xB7
            ${u(i)} \u5B57
          </div>
        </div>
        <div class="report-actions">
          ${e.pdf_url?`<a class="btn btn-secondary btn-sm" href="${n(e.pdf_url)}" target="_blank" rel="noopener noreferrer">${$("external",14)}<span>PDF</span></a>`:""}
        </div>
      </div>

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">\u88C1\u5224\u65E5\u671F</div>
          <div class="summary-value">${De(e.jdate)}</div>
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
        ${rn(e)}
      </div>

      <div class="report-section judgment-text-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5224\u6C7A\u539F\u6587</span>
          <span class="muted">${u(i)} \u5B57</span>
        </div>
        ${r?`<div class="judgment-fulltext">${n(r)}</div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5168\u6587\u3002</div>'}
      </div>
    </div>
  </div>`}function Is(e){return`"${(e==null?"":typeof e=="object"?JSON.stringify(e):String(e)).replace(/"/g,'""')}"`}function kt(e){let t=e.columns||[],s=e.rows||[],a=[["#",...t.map(i=>i.label||i.key)].map(Is).join(",")],r=((Number(e.page)||1)-1)*(Number(e.page_size)||25);return s.forEach((i,o)=>{a.push([r+o+1,...t.map(l=>i[l.key])].map(Is).join(","))}),`\uFEFF${a.join(`\r
`)}`}function xt(e){return{...e,rows:(e.rows||[]).map(t=>{let s={};for(let[a,r]of Object.entries(t))a.startsWith("_")||(s[a]=r);return s})}}function ln(e){return e==="rag"?"RAG \u63D0\u554F":e==="data"?"\u8CC7\u6599\u67E5\u8A62":e||"\u5176\u4ED6"}async function Bs(e,t){let s=performance.now(),a=Os(e,t),r=String(a.store||"query_history"),i=String(a.keyword||""),o=t.page,l=t.pageSize,f=[],b=[],g=[],p=[];if(r==="settings"){b=(await qs({keyword:i})).map(A=>({key:A.key,value:Es(A.value),updated_at:A.updated_at})),g=[{key:"key",label:"\u8A2D\u5B9A\u9375",type:"mono"},{key:"value",label:"\u503C",type:"longtext"},{key:"updated_at",label:"\u66F4\u65B0\u6642\u9593",type:"datetime"}];let y=new Map;b.forEach(A=>{let T=String(A.key||"").split(".")[0]||"\u5176\u4ED6";y.set(T,(y.get(T)||0)+1)}),p=Array.from(y.entries()).map(([A,T])=>({label:A,value:T})).sort((A,T)=>T.value-A.value)}else{b=(await ht({keyword:i,limit:Ma})).map(A=>({kind:ln(A.kind),title:A.title,detail:A.detail,created_at:A.created_at})),g=[{key:"kind",label:"\u985E\u578B",type:"text"},{key:"title",label:"\u67E5\u8A62\u5167\u5BB9",type:"longtext"},{key:"detail",label:"\u6458\u8981",type:"longtext"},{key:"created_at",label:"\u6642\u9593",type:"datetime"}];let y=new Map;b.forEach(A=>y.set(A.kind,(y.get(A.kind)||0)+1)),p=Array.from(y.entries()).map(([A,T])=>({label:A,value:T})).sort((A,T)=>T.value-A.value)}let h=b.length,x=(o-1)*l,_=b.slice(x,x+l),E=Math.round(performance.now()-s),P=Ls();return P&&f.push("IndexedDB \u7121\u6CD5\u4F7F\u7528\uFF0C\u8CC7\u6599\u66AB\u5B58\u5728\u8A18\u61B6\u9AD4\uFF0C\u91CD\u65B0\u6574\u7406\u5F8C\u6703\u6D88\u5931\u3002"),{database:"indexeddb",label:"IndexedDB",status:P?"degraded":"ok",message:P?"\u700F\u89BD\u5668\u4E0D\u5141\u8A31\u4F7F\u7528 IndexedDB\uFF0C\u672C\u9801\u6539\u7528\u8A18\u61B6\u9AD4\u66AB\u5B58\u3002":null,table:r,columns:g,rows:_,total:h,page:o,page_size:l,duration_ms:E,summary:[{label:"\u7B26\u5408\u7B46\u6578",value:String(h)},{label:"\u76EE\u524D\u9801\u9762",value:`${_.length} \u7B46`},{label:"\u5132\u5B58\u6A21\u5F0F",value:ft()==="indexeddb"?"IndexedDB":"\u8A18\u61B6\u9AD4"},{label:"\u67E5\u8A62\u8017\u6642",value:`${E} ms`}],distribution:p,query_text:`INDEXEDDB OPEN 'judgment-console'
OBJECT STORE '${r}'
FILTER ${i?`keyword \u2248 '${i}'`:"1 = 1"}
ORDER BY created_at DESC
LIMIT ${l} OFFSET ${x}`,warnings:f,meta:{store:r,filters:a,client_side:!0}}}async function cn(e,t){let s=!1,a=null,r=[],i="law",o=null,l={},f=0,b=25,g="query",p=null,h=null,x=0,_=[],E=null,P=-1,C=0,y=null,A=null;e.innerHTML=`<section class="page data-page">
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
  </section>`;let T=e.querySelector("#query-sidebar"),q=e.querySelector("#category-switch"),N=e.querySelector("#db-options-wrap"),W=e.querySelector("#sidebar-view-switch"),R=e.querySelector("#filter-area"),X=e.querySelector("#schema-area"),j=e.querySelector("#query-main"),D=e.querySelector("#schema-suggest-popover"),z=e.querySelector("#catalog-meta"),I=e.querySelector("#refresh-catalog"),re=c=>r.find(d=>d.id===c),ze=()=>re(i)?.databases||[],de=c=>ze().find(d=>d.id===c),xe=(c,d)=>`${c}:${d}`,ae=(c,d=i)=>l[xe(d,c.id)],Me=(c,d)=>{Ts(c,d).catch(()=>{})},Ge=()=>{if(!a){z.textContent="CATALOG \xB7 \u96E2\u7DDA",z.className="badge badge-danger badge-mono";return}let c=ze(),d=c.filter(w=>w.available).length,m=re(i);z.textContent=`CATALOG \xB7 ${m?.label||i} \xB7 ${d}/${c.length} \u53EF\u7528`,z.className="badge badge-neutral badge-mono"},Se=c=>{j.innerHTML=Ra(c)},Xe=()=>{let c=y?.returnScroll??A?.returnScroll;y=null,A=null;let d=de(o),m=d?ae(d):null;g==="schema"&&h?.result?j.innerHTML=es(h.result,L(d,h.tableId),{columnFilters:h.columnFilters||{},searchEnabled:d.id==="postgres"||d.id==="parquet"}):m?.result?j.innerHTML=$t(m.result):d&&Se(d),typeof c=="number"&&window.requestAnimationFrame(()=>window.scrollTo({top:c,behavior:"smooth"}))},ot=(c="law-article-jump")=>{let d=j.querySelector(`#${c}`),m=zs(d?.value);if(!m){O("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),d?.focus();return}let S=[...j.querySelectorAll("[data-article-no]")].find(k=>k.dataset.articleNo===m);if(!S){O(`\u627E\u4E0D\u5230\u7B2C ${m} \u689D\u3002`,"warn");return}S.scrollIntoView({behavior:"instant",block:"center"}),S.classList.add("is-jump-target"),window.setTimeout(()=>S.classList.remove("is-jump-target"),2400)},Ze=async({lawKey:c,sourceType:d="",lawName:m="",versionId:w=""})=>{let S=de(o),k=S?ae(S):null,M=g==="schema"?h?.result:null;if(!S||!k?.result&&!M||!c)return;let H=++f;y={seq:H,lawKey:c,sourceType:d,lawName:m,versionId:w?String(w):"",page:1,detail:null,database:S.id,returnScroll:window.scrollY},A=null,j.innerHTML=Xa(m||c),j.scrollIntoView({behavior:"smooth",block:"start"});try{let ne=await F.lawDetail(c,d,y.versionId);if(s||!y||y.seq!==H)return;y.detail=ne,y.page=1,j.innerHTML=sn(ne,{database:y.database,lawPage:y.page})}catch(ne){if(s||!y||y.seq!==H)return;j.innerHTML=Za(ne,m||c),O(ne.message||"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868\u3002","danger")}},lt=async({jid:c})=>{let d=de(o),m=d?ae(d):null,w=g==="schema"?h?.result:null;if(!d||!m?.result&&!w||!c)return;let S=++f;y=null;let k=d.id==="parquet"?"parquet":"postgres";A={seq:S,jid:c,detail:null,database:d.id,source:k,returnScroll:window.scrollY},j.innerHTML=an(c),j.scrollIntoView({behavior:"smooth",block:"start"});try{let M=await F.judgmentDetail(c,k);if(s||!A||A.seq!==S)return;A.detail=M,j.innerHTML=on(M,{database:A.database})}catch(M){if(s||!A||A.seq!==S)return;j.innerHTML=nn(M,c),O(M.message||"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587\u3002","danger")}},v=(c,d)=>`${i}:${c.id}:${d}`,L=(c,d)=>(c.tables||[]).find(m=>m.id===d)?.label||d,U=(c,d,{sort:m=null,columnFilters:w={}}={})=>{let S={column_filters:w};return c.id==="postgres"?(S.table=d,S.schema_preview=!0):c.id==="parquet"&&i==="judgment"?(S.table="judgment_documents",S.columns=qa):c.id==="parquet"&&(S.dataset="all",S.columns=Ta),m?.key&&(S.sort=`${m.key}:${m.direction}`),S},J=async(c,d,{sort:m=null,columnFilters:w={}}={})=>{if(!d)return;dt();let S=v(c,d),k=++x;p={tableId:d},h={key:S,tableId:d,loading:!0,result:null,error:null,sort:m,columnFilters:w},X.innerHTML=Zt(c,re(i)?.label||i,d),j.innerHTML=Cs(L(c,d));try{let M;if(c.id==="indexeddb"){let H=bt(c,10);H.values.store=d,H.page=1,M=await Bs(c,H)}else c.id==="qdrant"?M={database:"qdrant",label:"Qdrant",status:"not_configured",message:"Qdrant collection \u9700\u8981\u8A9E\u610F\u67E5\u8A62\uFF1BSchema \u50C5\u63D0\u4F9B collection \u540D\u7A31\uFF0C\u4E0D\u5217\u51FA\u524D 10 \u7B46\u8CC7\u6599\u3002",table:d,columns:[],rows:[],total:0,page:1,page_size:10,duration_ms:0,summary:[],distribution:[],query_text:"",warnings:[],meta:{}}:(M=await F.query({database:c.id,filters:U(c,d,{sort:m,columnFilters:w}),page:1,pageSize:10}),m?.key&&(M.meta={...M.meta||{},sort:m}));if(s||k!==x)return;h={key:S,tableId:d,loading:!1,result:M,error:null,sort:m,columnFilters:w},g==="schema"&&p?.tableId===d&&(X.innerHTML=Zt(c,re(i)?.label||i,d),j.innerHTML=es(M,L(c,d),{columnFilters:w,searchEnabled:c.id==="postgres"||c.id==="parquet"}))}catch(M){if(s||k!==x)return;h={key:S,tableId:d,loading:!1,result:null,error:M,sort:m,columnFilters:w},g==="schema"&&p?.tableId===d&&(j.innerHTML=Rs(M,L(c,d)))}},ve=()=>{let c=de(o);if(!c)return null;if(g==="schema"&&h?.result)return{db:c,tableId:h.tableId,columnFilters:h.columnFilters||{},sort:h.sort||null,mode:"schema"};let d=c?ae(c):null,m=d?.result;return m&&(c.id==="postgres"||c.id==="parquet")?{db:c,tableId:m.table,columnFilters:d.columnFilters||{},sort:d.sort||null,mode:"query"}:null},K=(c,d,m)=>{if(!c)return;let w=`${c.db.id}:${c.tableId}:${d}`,S=ie.get(w);S&&(window.clearTimeout(S),ie.delete(w)),dt();let k={...c.columnFilters||{}},M=String(m||"").trim();if(M?k[d]=M:delete k[d],c.mode==="schema"){J(c.db,c.tableId,{sort:c.sort,columnFilters:k});return}let H=ae(c.db);H.columnFilters=k,H.page=1,Ce(1)},ie=new Map,Z=()=>{C+=1,_=[],E=null,P=-1,D&&(D.hidden=!0,D.innerHTML="")},ue=(c,d)=>{let m=String(c||""),w=m.toLocaleLowerCase(),S=String(d||"").toLocaleLowerCase(),k=new Array(m.length).fill(!1),M=(te,$e)=>{for(let ce=te;ce<te+$e;ce+=1)ce>=0&&ce<k.length&&(k[ce]=!0)},H=w.indexOf(S);if(H>=0)for(;H>=0;)M(H,S.length),H=w.indexOf(S,H+S.length);else{let te=[];for(let $e of S.match(/[一-鿿]{2,}/g)||[])for(let ce=0;ce<$e.length-1;ce+=1)te.push($e.slice(ce,ce+2));te.push(...S.match(/[a-z0-9]+/g)||[]);for(let $e of te){let ce=w.indexOf($e);for(;ce>=0;)M(ce,$e.length),ce=w.indexOf($e,ce+$e.length)}}let ne="",oe=0;for(;oe<m.length;)if(k[oe]){let te=oe;for(;te<m.length&&k[te];)te+=1;ne+=`<mark>${n(m.slice(oe,te))}</mark>`,oe=te}else{let te=oe;for(;te<m.length&&!k[te];)te+=1;ne+=n(m.slice(oe,te)),oe=te}return ne||n(m)},et=(c,d)=>{if(!D)return;let m=c.getBoundingClientRect(),w=Math.min(420,Math.max(220,m.width)),S=Math.min(360,34+d*30),k=m.bottom+4;k+S>window.innerHeight-8&&(k=Math.max(8,m.top-S-4));let M=Math.min(window.innerWidth-w-8,Math.max(8,m.left));D.style.width=`${w}px`,D.style.left=`${M}px`,D.style.top=`${k}px`},be=c=>{if(!D)return;let d=[...D.querySelectorAll(".schema-suggest-item")];d.length&&(P=Math.max(0,Math.min(d.length-1,c)),d.forEach((m,w)=>{m.classList.toggle("is-active",w===P)}),d[P].scrollIntoView({block:"nearest"}))},ye=c=>{let d=_[c],m=E;!d||!m||(Z(),K(m,m.column,d))},ct=async(c,d,m,w)=>{if(!c||!m.trim()){Z();return}let S=++C;E={...c,column:d,input:w},P=-1;try{let k=await F.schemaSuggest({database:c.db.id,table:c.tableId,column:d,query:m,limit:1e3});if(S!==C||document.activeElement!==w||!D)return;let M=Array.isArray(k.values)?k.values:[];if(_=M,!M.length){Z();return}let H=Number(k.total)>M.length?`\u5171 ${u(k.total)} \u500B\u7B26\u5408\uFF0C\u986F\u793A\u524D ${u(M.length)} \u500B`:`\u5171 ${u(k.total)} \u500B\u7B26\u5408`;D.innerHTML=`<div class="schema-suggest-head">${n(H)}</div>${M.map((ne,oe)=>`<button class="schema-suggest-item" type="button"
            data-schema-suggest-index="${oe}"
            title="${n(ne)}">${ue(ne,m)}</button>`).join("")}`,et(w,M.length),D.hidden=!1}catch{Z()}},dt=()=>{let c=document.activeElement;c instanceof HTMLElement&&c.matches("[data-schema-search]")&&c.blur(),Z()},ms=(c,{resetReport:d=!1}={})=>{dt();let m=ae(c);if(q.innerHTML=Ns(r,i),N.innerHTML=Pa(ze(),c.id),W.innerHTML=Ca(g),g==="schema"?(R.hidden=!0,R.innerHTML="",X.hidden=!1,X.innerHTML=Zt(c,re(i)?.label||i,p?.tableId||"")):(X.hidden=!0,X.innerHTML="",R.hidden=!1,R.innerHTML=`${js(c)}${Yt(c,m)}<div class="sidebar-note">${Ps(c)}</div>`),Ge(),g==="schema"){let w=p?v(c,p.tableId):"";if(h&&h.key===w){let S=L(c,h.tableId);h.loading?j.innerHTML=Cs(S):h.error?j.innerHTML=Rs(h.error,S):j.innerHTML=es(h.result,S,{columnFilters:h.columnFilters||{},searchEnabled:c.id==="postgres"||c.id==="parquet"})}else j.innerHTML=Qa(c);return}d?Se(c):m.result?j.innerHTML=$t(m.result):Se(c)},vs=(c,{persist:d=!0,resetReport:m=!1}={})=>{let w=ze(),S=w.find(M=>M.id===c)||w[0];if(!S)return;y=null,A=null,p=null,h=null,x+=1,o=S.id;let k=xe(i,S.id);l[k]||(l[k]=bt(S,b)),ms(S,{resetReport:m}),d&&(Me(`data.last_database.${i}`,S.id),Me("data.last_category",i))},fs=(c,{persist:d=!0,resetReport:m=!0,databaseId:w=null}={})=>{let S=re(c)||r[0];if(!S)return;i=S.id,y=null,A=null;let k=S.databases||[],M=w&&k.find(H=>H.id===w)||k.find(H=>H.id===o)||k[0];if(o=M?.id||null,!M){q.innerHTML=Ns(r,i),N.innerHTML=`<div class="sidebar-notice">${G({tone:"warn",title:"\u6C92\u6709\u53EF\u7528\u7684\u8CC7\u6599\u4F86\u6E90",text:"\u9019\u500B\u985E\u5225\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u5EAB\u9078\u9805\u3002"})}</div>`,R.innerHTML="",Ge();return}vs(M.id,{persist:!1,resetReport:m}),d&&(Me("data.last_category",S.id),Me(`data.last_database.${S.id}`,M.id))},ma=c=>{let d=ae(c),m=R.querySelector("#data-filter-form");m&&(d.values=yt(m,c,d))},Ce=async(c=null)=>{let d=de(o);if(!d)return;dt();let m=ae(d);ma(d),c!==null&&(m.page=c),(!Number.isFinite(m.page)||m.page<1)&&(m.page=1);let w=++f;y=null,A=null,j.innerHTML=at(d);let S=R.querySelector("#run-query");Q(S,!0,"\u67E5\u8A62\u4E2D\u2026");try{let k;if(d.id==="indexeddb"?k=await Bs(d,m):k=await F.query({database:d.id,filters:Xt(d,m),page:m.page,pageSize:m.pageSize}),s||w!==f)return;k.meta={...k.meta||{},column_filters:m.columnFilters||{},searchable:d.id==="postgres"||d.id==="parquet",sort:m.sort||k.meta?.sort||null},m.result=k,m.page=Number(k.page)||m.page,m.pageSize=Number(k.page_size)||m.pageSize,j.innerHTML=$t(k);let M=re(i)?.label||i;await gt({kind:"data",title:`${M} \xB7 ${d.label} \xB7 ${k.table||k.label||"query"}`,detail:`${u(k.total)} \u7B46 \xB7 ${B(k.duration_ms)}`,payload:{category:i,database:d.id,filters:Xt(d,m),page:m.page,page_size:m.pageSize}}),Me("data.last_query",{category:i,database:d.id,filters:Xt(d,m),page:m.page,page_size:m.pageSize,at:new Date().toISOString()})}catch(k){if(s||w!==f)return;j.innerHTML=_t(k,d),O(k.message||"\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{!s&&w===f&&Q(S,!1)}},It=async()=>{I.disabled=!0,Q(I,!0,"\u6574\u7406\u4E2D\u2026");try{let[c,d,m,w,S]=await Promise.all([F.catalog(),st("data.last_category","law"),st("data.last_database.law","postgres"),st("data.last_database.judgment","postgres"),st("data.page_size",25)]);if(s)return;a=c,r=Array.isArray(a.categories)?a.categories:[],b=Ds.includes(Number(S))?Number(S):25;for(let H of r)for(let ne of H.databases||[]){let oe=xe(H.id,ne.id);l[oe]||(l[oe]=bt(ne,b))}let k=r.find(H=>H.id===d)||r[0];if(!k){q.innerHTML="",N.innerHTML=`<div class="sidebar-notice">${G({tone:"danger",title:"\u6C92\u6709\u53EF\u7528\u7684\u5206\u985E",text:"Catalog \u6C92\u6709\u56DE\u50B3\u6CD5\u898F\u547D\u4EE4\u6216\u5224\u6C7A\u5206\u985E\u3002"})}</div>`;return}let M=k.id==="judgment"?w:m;if(i=k.id,o=null,fs(k.id,{persist:!1,resetReport:!0,databaseId:M}),s)return;O("\u8CC7\u6599\u5EAB catalog \u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(c){if(s)return;a=null,r=[],q.innerHTML="",Ge(),N.innerHTML=`<div class="sidebar-notice">${G({tone:"danger",title:"\u7121\u6CD5\u8B80\u53D6 catalog",text:n(c.message||"\u8ACB\u78BA\u8A8D API \u662F\u5426\u555F\u52D5\u3002")})}
      <button class="btn btn-secondary btn-sm" type="button" id="catalog-retry" style="margin-top:10px">
        ${$("refresh",14)}<span>\u91CD\u8A66</span>
      </button></div>`,j.innerHTML=`<div class="report-empty">${me({iconName:"server",title:"API \u76EE\u524D\u7121\u6CD5\u9023\u7DDA",text:"\u67E5\u8A62\u5831\u8868\u9700\u8981 FastAPI \u63D0\u4F9B catalog \u8207\u8CC7\u6599\u67E5\u8A62 API\u3002\u8ACB\u78BA\u8A8D judgment-web \u5DF2\u555F\u52D5\u3002"})}</div>`}finally{s||(I.disabled=!1,Q(I,!1))}};T.addEventListener("change",c=>{let d=c.target;if(d.name==="category"){fs(d.value);return}if(d.name==="database"){vs(d.value);return}let m=de(o);if(!m)return;let w=ae(m),S=R.querySelector("#data-filter-form");!S||!d.name||(w.values=yt(S,m,w),w.page=1,d.name==="table"&&(y=null,A=null,w.sort=null,w.columnFilters={},w.result=null,R.innerHTML=Yt(m,w),Se(m)))}),T.addEventListener("input",c=>{let d=de(o);if(!d)return;let m=R.querySelector("#data-filter-form");if(!m||!c.target.name||c.target.name==="table")return;let w=ae(d);w.values=yt(m,d,w)}),T.addEventListener("submit",c=>{c.target.id==="data-filter-form"&&(c.preventDefault(),Ce(1))}),T.addEventListener("click",c=>{let d=c.target.closest("[data-action]"),m=d?.dataset.action;if(m==="sidebar-view"){let w=de(o);if(!w)return;let S=ae(w),k=R.querySelector("#data-filter-form");k&&g==="query"&&(S.values=yt(k,w,S)),g=d.dataset.view==="schema"?"schema":"query",ms(w);return}if(m==="select-schema-table"){let w=de(o);if(!w)return;J(w,d.dataset.tableId||"");return}if(m==="reset"){let w=de(o);if(!w)return;y=null,A=null;let S=ae(w);l[xe(i,w.id)]=bt(w,S.pageSize),R.innerHTML=`${js(w)}${Yt(w,l[xe(i,w.id)])}<div class="sidebar-note">${Ps(w)}</div>`,Se(w),O("\u5DF2\u91CD\u8A2D\u9019\u500B\u8CC7\u6599\u5EAB\u7684\u67E5\u8A62\u689D\u4EF6\u3002","info",2400);return}c.target.closest("#catalog-retry")&&It()}),j.addEventListener("input",c=>{let d=c.target.closest("[data-schema-search]");if(!d)return;let m=ve();if(!m)return;let w=d.dataset.schemaSearch||"",S=d.value,k=`${m.mode}:${m.db.id}:${m.tableId}:${w}`,M=ie.get(k);if(M&&window.clearTimeout(M),!S.trim()){ie.delete(k),Z(),K(m,w,"");return}let H=window.setTimeout(()=>{ie.delete(k),ct(m,w,S,d)},250);ie.set(k,H)}),j.addEventListener("keydown",c=>{let d=c.target.closest("[data-schema-search]");if(!d)return;let m=ve();if(m){if(c.key==="Escape"){Z();return}if(c.key==="ArrowDown"||c.key==="ArrowUp"){if(!D||D.hidden)return;c.preventDefault();let w=c.key==="ArrowDown"?1:-1;be(P<0?w>0?0:_.length-1:P+w);return}if(c.key==="Enter"){if(c.preventDefault(),D&&!D.hidden&&P>=0){ye(P);return}K(m,d.dataset.schemaSearch||"",d.value)}}}),D?.addEventListener("mousedown",c=>{c.preventDefault()}),D?.addEventListener("click",c=>{let d=c.target.closest("[data-schema-suggest-index]");d&&ye(Number(d.dataset.schemaSuggestIndex))});let gs=c=>{c.target.closest("[data-schema-search]")||D?.contains(c.target)||Z()};return document.addEventListener("click",gs),window.addEventListener("scroll",Z,!0),window.addEventListener("resize",Z),j.addEventListener("keydown",c=>{c.target.matches(".law-jump-input")&&c.key==="Enter"&&(c.preventDefault(),ot(c.target.id))}),j.addEventListener("click",async c=>{let d=c.target.closest("[data-action]");if(!d)return;let m=d.dataset.action,w=de(o),S=w?ae(w):null,k=S?.result;if(m==="back-to-results"){Xe();return}if(m==="open-law"){Ze({lawKey:d.dataset.lawKey||"",sourceType:d.dataset.lawSource||"",lawName:d.dataset.lawName||""});return}if(m==="open-judgment"){lt({jid:d.dataset.jid||""});return}if(m==="jump-article"){ot(d.dataset.jumpInput||"law-article-jump");return}if(m==="sort-column"){let M=d.dataset.sortKey||"";if(!M||!w)return;if(g==="schema"&&h?.result){let oe=h.sort,te=M==="jdate"||M==="law_modified_date"||M==="article_count"||M==="citation_count"||M==="full_text_length"||M==="created_at"||M==="updated_at",$e=oe?.key===M?oe.direction==="asc"?"desc":"asc":te?"desc":"asc";J(w,h.tableId,{sort:{key:M,direction:$e},columnFilters:h.columnFilters||{}});return}if(!S)return;let H=S.sort,ne=H?.key===M?H.direction==="asc"?"desc":"asc":M==="jdate"?"desc":"asc";S.sort={key:M,direction:ne},Ce(1);return}if(m==="retry"){Ce(S?.page||1);return}if(k){if(m==="prev-page"){Ce(Math.max(1,Number(k.page)-1));return}if(m==="next-page"){let M=Math.max(1,Math.ceil(Number(k.total)/Number(k.page_size)));Ce(Math.min(M,Number(k.page)+1));return}if(m==="copy-query"){let M=await mt(k.query_text||"");O(M?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",M?"ok":"warn");return}if(m==="export-json"){let M=`${k.database}-${k.table||"query"}-page-${k.page}.json`;je(M,JSON.stringify(xt(k),null,2),"application/json;charset=utf-8"),O(`\u5DF2\u532F\u51FA ${M}`,"ok");return}if(m==="export-csv"){let M=`${k.database}-${k.table||"query"}-page-${k.page}.csv`;je(M,kt(k),"text/csv;charset=utf-8"),O(`\u5DF2\u532F\u51FA ${M}`,"ok")}}}),j.addEventListener("change",c=>{let d=c.target.closest("[data-action='select-law-version']");if(d&&y){Ze({lawKey:y.lawKey,sourceType:y.sourceType,lawName:y.lawName,versionId:d.value});return}if(!c.target.matches("[data-page-size]"))return;let m=de(o);if(!m)return;let w=ae(m);w.pageSize=Number(c.target.value)||25,w.page=1,Me("data.page_size",w.pageSize),Ce(1)}),I.addEventListener("click",()=>{It()}),await It(),t&&typeof t.setTitle=="function"&&t.setTitle("\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"),()=>{s=!0;for(let c of ie.values())window.clearTimeout(c);ie.clear(),Z(),document.removeEventListener("click",gs),window.removeEventListener("scroll",Z,!0),window.removeEventListener("resize",Z)}}var Js=[10,25,50,100],dn=[{value:"started_at:desc",label:"Timestamp \u65B0 \u2192 \u820A"},{value:"started_at:asc",label:"Timestamp \u820A \u2192 \u65B0"},{value:"duration_ms:desc",label:"\u8017\u6642\u591A \u2192 \u5C11"},{value:"duration_ms:asc",label:"\u8017\u6642\u5C11 \u2192 \u591A"}];function rs(){return{process:"",module:"",status:"",method:"",model:"",keyword:"",from_date:"",to_date:"",min_duration:"",sort:"started_at:desc"}}function un(e,t=e){return`<option value="${n(e)}">${n(t)}</option>`}function nt(e,t,s,a,r=""){return`<div class="field">
    <label class="field-label" for="performance-${e}">
      <span>${n(t)}</span>
      <span class="field-tag">${n(e)}</span>
    </label>
    <select class="select" id="performance-${e}" name="${n(e)}">
      ${un("","\u5168\u90E8")}
      ${s.map(i=>`<option value="${n(i)}" ${String(i)===String(a)?"selected":""}>${n(i)}</option>`).join("")}
    </select>
    ${r?`<span class="field-help">${n(r)}</span>`:""}
  </div>`}function pn(e,t){let s=dn.map(a=>`<option value="${a.value}" ${a.value===t.sort?"selected":""}>${a.label}</option>`).join("");return`
    ${nt("process","\u7A0B\u5E8F",e.processes||[],t.process)}
    ${nt("module","\u6A21\u7D44",e.modules||[],t.module)}
    ${nt("model","\u6A21\u578B",e.models||[],t.model)}
    ${nt("status","\u72C0\u614B",e.statuses||[],t.status)}
    ${nt("method","\u65B9\u6CD5",e.methods||[],t.method)}
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
    </div>`}function Gs(){let e=document.getElementById("performance-filter-form");if(!e)return rs();let t=new FormData(e);return{process:String(t.get("process")||""),module:String(t.get("module")||""),status:String(t.get("status")||""),method:String(t.get("method")||""),model:String(t.get("model")||""),keyword:String(t.get("keyword")||"").trim(),from_date:String(t.get("from_date")||""),to_date:String(t.get("to_date")||""),min_duration:String(t.get("min_duration")||""),sort:String(t.get("sort")||"started_at:desc")}}function Vs(e){if(e==null)return"null";if(typeof e=="object")try{let t=JSON.stringify(e);return t.length>160?`${t.slice(0,157)}\u2026`:t}catch{return String(e)}return String(e)}function mn(e){if(!e)return"";let t=new Date(e);if(Number.isNaN(t.getTime()))return"";let s=String(t.getHours()).padStart(2,"0"),a=String(t.getMinutes()).padStart(2,"0"),r=String(t.getSeconds()).padStart(2,"0"),i=String(t.getMilliseconds()).padStart(3,"0");return`${s}:${a}:${r}.${i}`}function vn(e){let t=String(e?.module||"");return t.includes("static")||t.includes("frontend")?"is-client":t.includes("judgment.rag")?"is-rag":t.includes("judgment.web.app")?"is-api":t.includes("judgment.web.query")?"is-data":t.includes("judgment.judgment_index")?"is-index":"is-other"}function fn(e){let t=new Map(e.map(a=>[a.seq,a.parent_seq])),s=new Map;for(let a of e){if(Number.isInteger(a.depth)){s.set(a.seq,a.depth);continue}let r=0,i=a.parent_seq,o=0;for(;i&&t.has(i)&&o<20;)r+=1,i=t.get(i),o+=1;s.set(a.seq,r)}return s}function gn(e){let t=Object.entries(e||{});if(!t.length)return'<span class="muted">\u7121\u53C3\u6578</span>';let s=t.slice(0,8),a=t.length-s.length;return`<div class="flow-param-list">${s.map(([r,i])=>`<span class="flow-param">
        <span class="flow-param-key">${n(r)}</span>
        <span class="flow-param-value">${n(Vs(i))}</span>
      </span>`).join("")}${a>0?`<span class="flow-param-more">+${a}</span>`:""}</div>`}function hn(e){let t=new Map,s=Math.max(0,Number(e[0]?.offset_ms)||0);return e.forEach((a,r)=>{let i=Math.max(0,Number(a.offset_ms)||0),o=Math.max(0,Number(a.duration_ms)||0),l=e[r+1],f=l?Math.max(i,Number(l.offset_ms)||i):null,b=f===null?i+o:f,g=Math.max(0,b-i),p=Math.max(0,b-s);t.set(a.seq,{offset:i,duration:o,lap:g,cumulative:p})}),t}function bn(e,t,s,a){let r=a.get(e.seq)||{},i=Math.max(0,Number(r.duration)||0),o=Math.max(0,Number(r.offset)||0),l=Math.max(0,Number(r.lap)||0),f=Math.max(0,Number(r.cumulative)||0),b=Math.max(t,o+i,1),g=Math.min(100,o/b*100),p=Math.min(100-g,Math.max(.6,l/b*100)),h=s.get(e.seq)||0,_=mn(e.started_at)||`+${o.toFixed(0)} ms`,E=e.started_at?`\u958B\u59CB\uFF1A${ee(e.started_at)} \xB7 +${o.toFixed(1)} ms`:`\u958B\u59CB\uFF1A+${o.toFixed(1)} ms`;return`<div class="flow-segment ${e.status==="error"?"is-error":""}" style="--depth:${Math.min(h,8)}">
    <div class="flow-segment-head">
      <span class="flow-seq">#${n(String(e.seq??"\u2014"))}</span>
      <span class="flow-segment-name">${n(e.name||"unnamed")}</span>
      <span class="flow-segment-start" title="${n(E)}">${n(_)}</span>
      <span class="flow-segment-duration" title="\u8DDD\u4E0B\u4E00\u9EDE ${B(l)}\uFF1B\u7D2F\u8A08 ${B(f)}">${B(l)}</span>
      <span class="flow-segment-span" title="\u5F9E\u7B2C\u4E00\u9EDE\u5230\u672C\u9EDE\u7D50\u675F\u7684\u7D2F\u8A08\u6642\u9593">\u7D2F\u8A08 ${B(f)}</span>
    </div>
    <div class="flow-segment-loc">
      <span class="flow-segment-loc-text">${n(e.module||"\u2014")}<span class="flow-segment-dot">\xB7</span>${n(e.function||"\u2014")}</span>
      <span class="flow-segment-mobile-cum" title="\u5F9E\u7B2C\u4E00\u9EDE\u5230\u672C\u9EDE\u7D50\u675F\u7684\u7D2F\u8A08\u6642\u9593">\u7D2F\u8A08 ${B(f)}</span>
    </div>
    <div class="flow-track" title="\u958B\u59CB +${o.toFixed(1)} ms \xB7 \u8DDD\u4E0B\u4E00\u9EDE ${B(l)} \xB7 \u7D2F\u8A08 ${B(f)}">
      <span class="flow-bar ${vn(e)}" style="left:${g.toFixed(2)}%;width:${p.toFixed(2)}%"></span>
    </div>
    ${gn(e.params)}
    ${e.error?`<div class="flow-segment-error">${n(e.error)}</div>`:""}
  </div>`}function yn(e){let t=Array.isArray(e?.segments)?e.segments:[],s=Array.isArray(e?.models)?e.models:[],a=e?.client||{},r=Math.max(...t.map(l=>Number(l.avg_ms)||0),1),i=a.samples?B(a.avg_total_ms??0):"\u2014",o=a.samples?B(a.avg_render_ms??0):"\u2014";return`<div class="perf-flow-stats">
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
                    <span class="perf-model-count">${u(l.value)} \u6B21${l.avg_ms?` \xB7 \u5E73\u5747 ${B(l.avg_ms)}`:""}</span>
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
                    <span class="perf-seg-ms">${B(l.avg_ms)}</span>
                  </div>`).join("")}</div>`:'<p class="muted" style="font-size:11px">\u5C1A\u7121\u5340\u6BB5\u8017\u6642\uFF1B\u9700\u6709\u542B flow \u7684\u65B0\u7D00\u9304\u3002</p>'}
      </div>
    </div>
  </div>`}function ge(e){let t=Math.max(0,Number(e)||0);if(!t)return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;let s=Math.round(t/1e3),a=Math.floor(s/3600),r=Math.floor(s%3600/60),i=s%60;return a?`${a}h ${String(r).padStart(2,"0")}m ${String(i).padStart(2,"0")}s`:r?`${r}m ${String(i).padStart(2,"0")}s`:`${(t/1e3).toFixed(1)}s`}function Ws(e){let t=String(e?.task||"").trim();return t?t==="auto"?"\u81EA\u52D5\u63A5\u7E8C":`task ${t}`:"\u7D22\u5F15"}function $n(e){let t=(e||[]).slice(-12);if(!t.length)return'<p class="muted" style="font-size:11px">\u5C1A\u7121\u7D22\u5F15\u7D00\u9304\u3002</p>';let s=Math.max(...t.map(a=>Number(a.points_per_second)||0),.1);return`<div class="index-run-bars">${t.map(a=>{let r=Number(a.points_per_second)||0,i=Math.max(2,r/s*100);return`<div class="index-run-row">
        <div class="index-run-label">
          <strong>${n(Ws(a))}</strong>
          <span>${n(ee(a.started_at))}</span>
        </div>
        <div class="index-run-track" title="${n(`${u(a.indexed_count)} \u7B46 \xB7 ${ge(a.duration_ms)} \xB7 ${u(a.batch_count)} \u6279`)}">
          <span style="width:${i.toFixed(1)}%"></span>
        </div>
        <div class="index-run-value">
          <strong>${r.toFixed(1)}</strong><span>\u7B46/\u79D2</span>
          <em>${u(a.indexed_count)} \u7B46 \xB7 ${ge(a.duration_ms)}</em>
        </div>
      </div>`}).join("")}</div>`}function wn(e){let t=(Array.isArray(e.time_breakdown)?e.time_breakdown:[]).map(s=>({...s,ms:Number(s.ms)||0,percent:Number(s.percent)||0})).filter(s=>s.ms>0);return t.length?`<div class="index-breakdown-bar">${t.map(s=>`<span class="index-seg index-seg-${n(s.key)}" style="width:${Math.max(.5,s.percent).toFixed(2)}%" title="${n(`${s.label} ${ge(s.ms)}\uFF08${s.percent.toFixed(1)}%\uFF09`)}"></span>`).join("")}</div>
    <div class="index-breakdown-legend">${t.map(s=>`<span class="index-legend-item">
            <i class="index-seg index-seg-${n(s.key)}"></i>
            <span>${n(s.label)}</span>
            <strong>${ge(s.ms)}</strong>
            <em>${s.percent.toFixed(1)}%</em>
          </span>`).join("")}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B\u968E\u6BB5\u8A08\u6642\uFF1B\u5F8C\u7E8C\u7D22\u5F15\u6703\u8A18\u9304 Ollama Embedding\u3001Qdrant Upsert \u8207 PostgreSQL \u7D22\u5F15\u7D00\u9304\u7684\u6642\u9593\u7D44\u6210\u3002</div>'}function _n(e,t){let s=(Array.isArray(e)?e:[]).map(C=>({elapsed:Math.max(0,Number(C.elapsed_s)||0),indexed:Math.max(0,Number(C.indexed)||0)})).filter(C=>C.indexed>0);if(s.length<2)return"";let a=Math.max(...s.map(C=>C.elapsed),(Number(t)||0)/1e3,1),r=Math.max(...s.map(C=>C.indexed),1),i=760,o=150,l=12,f=12,b=i-l*2,g=o-f*2,p=s.map(C=>[l+C.elapsed/a*b,o-f-C.indexed/r*g]),h=p.map(([C,y],A)=>`${A===0?"M":"L"}${C.toFixed(1)},${y.toFixed(1)}`).join(" "),x=`${h} L${p[p.length-1][0].toFixed(1)},${o-f} L${p[0][0].toFixed(1)},${o-f} Z`,_=Math.max(1,Math.ceil(p.length/14)),E=p.map(([C,y],A)=>A%_===0||A===p.length-1?`<circle cx="${C.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" />`:"").join(""),P=[0,1,2,3].map(C=>{let y=f+g/3*C;return`<line x1="${l}" y1="${y.toFixed(1)}" x2="${i-l}" y2="${y.toFixed(1)}" class="index-chart-grid" />`}).join("");return`<div class="index-chart-card index-progress-card">
    <div class="index-chart-head">
      <span>\u672C\u6B21\u7D22\u5F15\u9032\u5EA6</span>
      <span>${u(r)} \u7B46 \xB7 ${ge(a*1e3)}</span>
    </div>
    <svg class="index-progress-svg" viewBox="0 0 ${i} ${o}" role="img" aria-label="\u7D22\u5F15\u9032\u5EA6\u6298\u7DDA\u5716">
      ${P}
      <path d="${x}" class="index-progress-area"></path>
      <path d="${h}" class="index-progress-line"></path>
      ${E}
      <line x1="${l}" y1="${o-f}" x2="${i-l}" y2="${o-f}" class="index-chart-axis"></line>
      <line x1="${l}" y1="${f}" x2="${l}" y2="${o-f}" class="index-chart-axis"></line>
    </svg>
    <div class="index-progress-labels">
      <span>0</span>
      <span>${ge(a*500)}</span>
      <span>${ge(a*1e3)}</span>
    </div>
  </div>`}function kn(e){if(!e||!e.latest)return"";let t=e.latest,s=Array.isArray(e.runs)?e.runs:[],a=e.average||{},r=t.coverage||{},i=r.total_judgments>0?`${u(r.indexed_judgments)} / ${u(r.total_judgments)}\uFF08${(100*r.indexed_judgments/r.total_judgments).toFixed(1)}%\uFF09`:"\u2014",o=[{label:"\u7576\u6B21\u57F7\u884C\u7B46\u6578",value:u(t.indexed_count),note:`${u(t.batch_count)} \u6279 \xD7 ${u(t.batch_size)} \u7B46`},{label:"\u5E73\u5747\u6BCF\u79D2\u7B46\u6578",value:`${(Number(t.points_per_second)||0).toFixed(1)}`,note:"\u7B46/\u79D2"},{label:"\u7576\u6B21\u4F7F\u7528\u6642\u9593",value:ge(t.duration_ms),note:`${u(t.scanned_count)} \u7B46\u5DF2\u6383\u63CF`},{label:"\u5E73\u5747\u6BCF\u6279\u6642\u9593",value:ge(t.batch_avg_ms),note:t.batch_min_ms||t.batch_max_ms?`\u6700\u5FEB ${ge(t.batch_min_ms)} \xB7 \u6700\u6162 ${ge(t.batch_max_ms)}`:"\u4EE5\u7E3D\u8017\u6642 \xF7 \u6279\u6578\u8A08\u7B97"}];return`<section class="index-perf-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u7D22\u5F15\u6548\u80FD</div>
        <div class="index-perf-sub">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 \xB7 \u6700\u8FD1 ${u(e.run_count)} \u6B21\u57F7\u884C</div>
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
      <span><strong>\u6700\u8FD1\u4E00\u6B21</strong> ${n(ee(t.started_at))}</span>
      <span><strong>batch</strong> ${u(t.batch_size)} \u7B46\uFF0F\u6279</span>
      <span><strong>embedding \u4E0A\u9650</strong> ${t.max_chars?`${u(t.max_chars)} \u5B57`:"\u2014"}</span>
      <span><strong>collection</strong> ${u(t.collection_points)} points</span>
      <span><strong>\u8986\u84CB\u7387</strong> ${n(i)}</span>
      <span><strong>\u5E73\u5747\u6BCF\u6B21\u57F7\u884C</strong> ${ge(a.duration_ms)} \xB7 ${(Number(a.points_per_second)||0).toFixed(1)} \u7B46/\u79D2</span>
    </div>
    <div class="index-charts">
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u8FD1\u7D22\u5F15\u541E\u5410</span>
          <span>\u7B46/\u79D2</span>
        </div>
        ${$n(s)}
      </div>
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>\u6700\u65B0\u4E00\u6B21\u6642\u9593\u7D44\u6210</span>
          <span>${ge(t.duration_ms)}</span>
        </div>
        ${wn(t)}
      </div>
    </div>
    ${_n(t.progress,t.duration_ms)}
  </section>`}function xn(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,r=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${r} \u9801 \xB7
      \u986F\u793A ${u(i)}\u2013${u(o)} / ${u(t)} \u7B46
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
  </div>`}function Sn(e,t){let s=e.flow&&typeof e.flow=="object"?e.flow:null,a=Array.isArray(s?.segments)?[...s.segments].sort((_,E)=>Number(_.seq)-Number(E.seq)):[],r=s?.summary||{},i=Array.isArray(r.models)?r.models:[],o=s?.client||{},l=s?.metadata||{},f=l.question||"",b=l.answer||"",g=f||b?`<div class="perf-flow-qa">
          ${f?`<div class="perf-flow-qa-row"><strong>RAG \u554F\u984C</strong><span>${n(f)}</span></div>`:""}
          ${b?`<div class="perf-flow-qa-row"><strong>RAG \u7B54\u6848</strong><span>${n(b)}</span></div>`:""}
        </div>`:"",p=Math.max(Number(s?.total_ms)||0,Number(e.duration_ms)||0,...a.map(_=>(Number(_.offset_ms)||0)+(Number(_.duration_ms)||0)),1),h=fn(a),x=hn(a);return`<details class="perf-record" ${t===0?"open":""}>
    <summary class="perf-record-summary">
      <span class="perf-record-id">#${n(String(e.id))}</span>
      <span class="perf-record-main">
        <span class="perf-record-title">${n(e.process||"\u672A\u547D\u540D")}</span>
        <span class="perf-record-path mono">${n(e.method||"")} ${n(e.path||"")}</span>
      </span>
      <span class="perf-record-time">${ee(e.started_at)}</span>
      <span class="perf-record-duration">${B(e.duration_ms)}</span>
      ${V(e.status)}
      <span class="perf-record-chevron">${$("chevronRight",14)}</span>
    </summary>
    <div class="perf-record-body">
      <div class="perf-flow-meta">
        <span><strong>Request</strong> <span class="mono">${n(e.request_id||s?.request_id||"\u2014")}</span></span>
        <span><strong>Server</strong> ${B(e.duration_ms)}</span>
        ${o.total_ms?`<span><strong>Client \u5168\u6D41\u7A0B</strong> ${B(o.total_ms)}</span>`:""}
        ${o.render_ms!==void 0?`<span><strong>Render</strong> ${B(o.render_ms)}</span>`:""}
        <span><strong>Flow</strong> ${a.length} \u6BB5</span>
        ${a.length?"<span><strong>\u9EDE\u4F4D</strong> \u5340\u9593\uFF1D\u4E0B\u4E00\u9EDE\u958B\u59CB\uFF0D\u672C\u9EDE\u958B\u59CB\uFF1B\u7D2F\u8A08\uFF1D\u7B2C\u4E00\u9EDE\u5230\u672C\u9EDE\u7D50\u675F\uFF0C\u6700\u5F8C\u4E00\u9EDE\u70BA\u7E3D\u6642\u9593</span>":""}
      </div>
      ${g}
      ${i.length?`<div class="chips perf-record-models">${i.map(_=>`<span class="chip">${n(_)}</span>`).join("")}</div>`:""}
      ${a.length?`<div class="flow-axis"><span>0 ms</span><span>${B(p)}</span></div>
            <div class="flow-timeline">${a.map(_=>bn(_,p,h,x)).join("")}</div>`:`<div class="perf-no-flow">\u6B64\u7D00\u9304\u6C92\u6709 flow \u660E\u7D30\uFF08\u53EF\u80FD\u662F\u820A\u8CC7\u6599\u6216 CLI \u7D00\u9304\uFF09\u3002${e.params_text&&e.params_text!=="{}"?`<pre>${n(e.params_text)}</pre>`:""}</div>`}
      ${s?`<details class="flow-json">
              <summary>Flow JSON \xB7 ${a.length} \u6BB5</summary>
              <pre>${n(JSON.stringify(s,null,2))}</pre>
            </details>`:""}
    </div>
  </details>`}var rt={embedding:"Embedding",retrieval:"Qdrant \u6AA2\u7D22",context:"PostgreSQL \u53D6\u6587",llm:"LLM \u751F\u6210",validation:"\u5F15\u7528\u9A57\u8B49"},Qs={embedding:"EMB",retrieval:"\u6AA2\u7D22",context:"\u53D6\u6587",llm:"LLM",validation:"\u9A57\u8B49",overhead:"\u5176\u4ED6"};function Ks(e){return{pending:"\u7B49\u5F85",running:"\u57F7\u884C\u4E2D",success:"\u5B8C\u6210",partial:"\u90E8\u5206\u6210\u529F",failed:"\u5931\u6557",skipped:"\u7565\u904E"}[e]||e||"\u672A\u77E5"}function An(e){let t=String(e.status||"pending"),s=Math.max(0,Math.min(100,Number(e.progress)||0)),a=t==="pending"?0:t==="running"?Math.max(s,12):100,r=t==="running"?"\u57F7\u884C\u4E2D\u2026":t==="pending"?"\u7B49\u5F85":e.duration_ms?B(e.duration_ms):Ks(t);return`<div class="test-flow-step is-${n(t)}">
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
  </div>`}function Ln(e,t){if(!t.length)return"";let s=t.reduce((a,r)=>a+(Number(r.progress)||0),0)/t.length;return`<section class="test-flow-stage">
    <div class="test-flow-stage-head">
      <span class="test-flow-stage-title">${n(rt[e]||e)}</span>
      <span class="test-flow-stage-meta">${t.length} \u500B\u7A0B\u5E8F \xB7 ${Math.round(s)}%</span>
    </div>
    <div class="test-flow-stage-steps">${t.map(An).join("")}</div>
  </section>`}function Ys(e,t){let s=Date.now(),a=new Map;for(let p of t){let h=Number(p.duration_ms)||0;if(p.status==="running"&&p.started_at){let x=Date.parse(p.started_at);Number.isFinite(x)&&(h=Math.max(h,s-x))}a.set(p.stage,(a.get(p.stage)||0)+h)}let r=Array.isArray(e.stage_order)?e.stage_order:Object.keys(rt),i=[],o=new Set;for(let p of r)t.some(h=>h.stage===p)&&(o.add(p),i.push({stage:p,label:rt[p]||p,short:Qs[p]||p,duration:a.get(p)||0}));for(let[p,h]of a)o.has(p)||i.push({stage:p,label:rt[p]||p,short:Qs[p]||p,duration:h});let l=i.reduce((p,h)=>p+h.duration,0),f=Number(e.total_ms)||0,b=Math.max(l,f),g=Math.max(0,b-l);return g>1&&i.push({stage:"overhead",label:"\u5176\u4ED6\uFF0F\u6392\u7A0B",short:"\u5176\u4ED6",duration:g}),{entries:i,total:b||l,stepTotal:l}}function Mn(e,t){let{entries:s,total:a}=Ys(e,t),r=s.filter(o=>o.duration>0).map(o=>{let l=a?o.duration/a*100:0;return`<span class="test-flow-time-seg stage-${n(o.stage)}" style="width:${l.toFixed(2)}%" title="${n(o.label)} \xB7 ${B(o.duration)}\uFF08${l.toFixed(1)}%\uFF09">${l>=8?n(o.short):""}</span>`}).join(""),i=s.map(o=>{let l=a?o.duration/a*100:0;return`<span class="test-flow-legend-item">
        <i class="test-flow-dot stage-${n(o.stage)}"></i>
        <span>${n(o.label)}</span>
        <strong>${B(o.duration)}</strong>
        <em>${l.toFixed(1)}%</em>
      </span>`}).join("");return`<div class="test-flow-time">
    <div class="test-flow-total-head">
      <span>\u7E3D\u6D41\u7A0B\u6642\u9593\uFF08\u4F9D\u968E\u6BB5\uFF09</span>
      <span>${B(a)}${e.status==="running"?" \xB7 \u4F30\u7B97\u4E2D":""}</span>
    </div>
    <div class="test-flow-time-bar">
      ${r||'<span class="test-flow-time-empty">\u5C1A\u7121\u968E\u6BB5\u8017\u6642</span>'}
    </div>
    <div class="test-flow-legend">${i}</div>
    ${e.status==="running"?'<div class="test-flow-time-note">\u57F7\u884C\u4E2D\u7684\u968E\u6BB5\u4EE5\u958B\u59CB\u6642\u9593\u4F30\u7B97\uFF1B\u5B8C\u6210\u5F8C\u4EE5\u4F3A\u670D\u5668\u56DE\u5831\u7684 duration \u70BA\u6E96\u3002</div>':""}
  </div>`}function St(e,t,s,a={}){let r=a.showHistory!==!1,i=[`<option value="" ${s?"":"selected"}>\u76EE\u524D\uFF0F\u6700\u65B0\u6E2C\u8A66</option>`,...(t||[]).map(y=>`<option value="${n(y.run_id)}" ${y.run_id===s?"selected":""}>${n(Ks(y.status))} \xB7 ${n((y.question||"\u672A\u547D\u540D").slice(0,28))} \xB7 ${n(ee(y.started_at))}</option>`)].join(""),o=r?`<label class="test-flow-select-label">\u6B77\u53F2
        <select class="select" id="test-run-select">${i}</select>
      </label>
      <button class="btn btn-secondary btn-sm" type="button" id="test-flow-refresh">
        ${$("refresh",13)}<span>\u66F4\u65B0</span>
      </button>`:`<a class="btn btn-secondary btn-sm" href="#/performance">
        ${$("activity",13)}<span>\u6B77\u53F2 Flow</span>
      </a>`,l=`<div class="test-flow-head">
    <div class="test-flow-heading">
      <div class="eyebrow">PERFORMANCE TEST FLOW</div>
      <div class="test-flow-title">\u6E2C\u8A66\u6D41\u7A0B ${e?V(e.status):""}</div>
      <div class="test-flow-question">${e?n(e.question||"\u672A\u547D\u540D\u6E2C\u8A66"):"\u5C1A\u7121\u6E2C\u8A66\u6D41\u7A0B\u3002\u5C07 header \u7684\u6E2C\u8A66\u6A21\u5F0F\u958B\u95DC\u8A2D\u70BA ON\uFF0C\u4E26\u5728 RAG \u9801\u63D0\u554F\u3002"}</div>
    </div>
    <div class="test-flow-actions">${o}</div>
  </div>`;if(!e)return`<div class="test-flow-panel card">${l}
      ${me({iconName:"activity",title:"\u7B49\u5F85\u6E2C\u8A66\u6D41\u7A0B",text:"\u6E2C\u8A66\u6A21\u5F0F\u958B\u555F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C\u6240\u6709\u53EF\u7528\u6A21\u578B\uFF0C\u4E26\u5728\u9019\u88E1\u5373\u6642\u986F\u793A\u6BCF\u500B\u968E\u6BB5\u7684\u9032\u5EA6\u3002"})}
    </div>`;let f=Array.isArray(e.steps)?e.steps:[],b=new Map;for(let y of f)b.has(y.stage)||b.set(y.stage,[]),b.get(y.stage).push(y);let p=(Array.isArray(e.stage_order)?e.stage_order:Object.keys(rt)).map(y=>Ln(y,b.get(y)||[])).join(""),h=e.models||{},x=Ys(e,f),_=e.status==="running"?`${B(x.total)}\uFF08\u4F30\u7B97\uFF09`:B(e.total_ms),E=f.find(y=>y.stage==="llm"&&y.model===e.summary?.primary_model)||f.find(y=>y.stage==="llm"&&y.details?.answer_preview),P=e.answer||E?.details?.answer_preview||"",C=`<div class="test-flow-answer">
    <div class="test-flow-answer-head">
      <span>RAG \u5F15\u64CE\u7B54\u6848</span>
      ${e.summary?.primary_model?`<span class="mono">${n(e.summary.primary_model)}</span>`:""}
    </div>
    <p>${P?n(P):e.status==="running"?"\u6E2C\u8A66\u9032\u884C\u4E2D\uFF0C\u5C1A\u672A\u7522\u751F\u6700\u7D42\u7B54\u6848\u3002":"\u6B64\u6E2C\u8A66\u6C92\u6709\u4FDD\u5B58\u53EF\u986F\u793A\u7684\u7B54\u6848\u3002"}</p>
  </div>`;return`<div class="test-flow-panel card">
    ${l}
    <div class="test-flow-meta">
      <span><strong>Run</strong> <span class="mono">${n(e.run_id)}</span></span>
      <span><strong>\u958B\u59CB</strong> ${n(ee(e.started_at))}</span>
      <span><strong>\u7E3D\u8017\u6642</strong> ${_}</span>
      <span><strong>Embedding</strong> ${Array.isArray(h.embedding)?h.embedding.length:0} \u500B</span>
      <span><strong>LLM</strong> ${Array.isArray(h.llm)?h.llm.length:0} \u500B</span>
      <span><strong>\u968E\u6BB5</strong> ${n(e.stage_label||e.stage||"\u2014")}</span>
    </div>
    ${C}
    <div class="test-flow-stages">${p||'<p class="muted">\u6B64\u6E2C\u8A66\u6C92\u6709\u5340\u6BB5\u8CC7\u6599\u3002</p>'}</div>
    <div class="test-flow-total">
      <div class="test-flow-total-head">
        <span>\u7E3D\u6D41\u7A0B\u9032\u5EA6</span>
        <span>${Number(e.progress)||0}%</span>
      </div>
      <div class="test-flow-track is-total ${e.status==="running"?"is-running":""}">
        <span class="test-flow-bar is-total" style="width:${Math.max(0,Math.min(100,Number(e.progress)||0))}%"></span>
      </div>
    </div>
    ${Mn(e,f)}
    <div class="test-flow-foot">
      <span>${e.status==="running"?"\u6E2C\u8A66\u57F7\u884C\u4E2D\uFF1B\u6B64\u5716\u8868\u6703\u81EA\u52D5\u66F4\u65B0\u3002":r?"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u5F9E\u4E0A\u65B9\u300C\u6B77\u53F2\u300D\u9078\u55AE\u9084\u539F\u5176\u4ED6 Flow\u3002":"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u81F3\u6548\u80FD\u5831\u8868\u67E5\u770B\u6B77\u53F2 Flow\u3002"}</span>
      ${e.summary?.primary_model?`<span class="mono">primary=${n(e.summary.primary_model)}</span>`:""}
    </div>
  </div>`}function Tn(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.summary)?e.summary:[],a=e.flow_stats||e.meta?.flow_stats||{},r=e.index_stats||null;return`<div class="report-card performance-flow-report" data-database="performance">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">PERFORMANCE FLOW REPORT</div>
        <div class="report-title">
          \u6548\u80FD\u5831\u8868 ${V(e.status||"ok")}
          <span class="chip">performance_records</span>
        </div>
        <div class="report-sub">
          ${u(e.total)} \u7B46\u7B26\u5408 \xB7 ${B(e.duration_ms)} \xB7
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
    ${kn(r)}
    ${yn(a)}
    <div class="report-section-head perf-flow-list-head">
      <span class="report-section-title">Flow \u7D00\u9304</span>
      <span class="muted" style="font-size:9.5px">\u9EDE\u64CA\u5217\u5C55\u958B\u6A21\u7D44\u3001\u51FD\u6578\u3001\u53C3\u6578\u8207\u5340\u6BB5\u8017\u6642</span>
    </div>
    <div class="perf-record-list">
      ${t.length?t.map((i,o)=>Sn(i,o)).join(""):me({iconName:"activity",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684 Flow",text:"\u653E\u5BEC\u65E5\u671F\u3001\u6A21\u578B\u6216\u8017\u6642\u689D\u4EF6\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}
    </div>
    ${xn(e)}
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
  </div>`}async function qn(e,t){let s=!1,a=rs(),r={processes:[],modules:[],statuses:[],methods:[],models:[]},i=1,o=25,l=null;e.innerHTML=`<section class="page data-page performance-page">
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
        <div id="performance-report">${at({label:"\u6548\u80FD\u5831\u8868"})}</div>
      </section>
    </div>
  </section>`;let f=e.querySelector("#performance-filter-fields"),b=e.querySelector("#performance-filter-form"),g=e.querySelector("#performance-test-flow"),p=e.querySelector("#performance-report"),h=e.querySelector("#performance-meta"),x=e.querySelector("#performance-refresh"),_=null,E=[],P="",C=null,y="",A=()=>{f.innerHTML=pn(r,a)},T=()=>{let j=JSON.stringify({selected:P,tick:_?.status==="running"?Math.floor(Date.now()/1e3):0,runs:E.map(D=>`${D.run_id}:${D.status}`),run:_?{run_id:_.run_id,status:_.status,progress:_.progress,steps:(_.steps||[]).map(D=>`${D.stage}:${D.model}:${D.status}:${D.progress}`)}:null});j!==y&&(y=j,g.innerHTML=St(_,E,P))},q=async()=>{try{let j=await F.testRuns(30);if(s)return;E=Array.isArray(j.runs)?j.runs:[]}catch{if(s)return;E=[]}},N=async()=>{try{let j=P?await F.testRun(P):await F.testRunCurrent();if(s)return;_=j.run||null,!P&&_&&_.status!=="running"&&!E.some(D=>D.run_id===_.run_id)&&await q(),T()}catch{if(s)return;_=null,T()}},W=async()=>{s||(P||await N(),s||(C=window.setTimeout(W,1500)))};g.addEventListener("change",async j=>{j.target.id==="test-run-select"&&(P=String(j.target.value||""),await N())}),g.addEventListener("click",async j=>{j.target.closest("#test-flow-refresh")&&(P="",await q(),await N())});let R=async(j=i)=>{i=Math.max(1,Number(j)||1),a=Gs(),p.innerHTML=at({label:"\u6548\u80FD\u5831\u8868"});let D=e.querySelector("#performance-run");Q(D,!0,"\u67E5\u8A62\u4E2D\u2026");try{let z=await F.performance(a,i,o);if(s)return;l=z,i=Number(z.page)||i,o=Number(z.page_size)||o,p.innerHTML=Tn(z),h.textContent=`PERFORMANCE \xB7 ${u(z.total)} \u7B46`,h.className="badge badge-neutral badge-mono"}catch(z){if(s)return;p.innerHTML=_t(z,{label:"\u6548\u80FD\u5831\u8868"}),O(z.message||"\u6548\u80FD\u5831\u8868\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{s||Q(D,!1)}},X=async()=>{try{r=await F.performanceOptions()}catch{r={processes:[],modules:[],statuses:[],methods:[],models:[]}}A()};return b.addEventListener("submit",j=>{j.preventDefault(),R(1)}),e.querySelector('[data-action="reset"]').addEventListener("click",()=>{a=rs(),i=1,A(),R(1)}),x.addEventListener("click",async()=>{a=Gs(),x.disabled=!0,Q(x,!0,"\u6574\u7406\u4E2D\u2026"),await X(),await q(),s||await N(),s||await R(1),s||(x.disabled=!1,Q(x,!1))}),p.addEventListener("click",async j=>{let D=j.target.closest("[data-action]");if(!D||!l)return;let z=D.dataset.action;if(z==="retry"){R(i);return}if(z==="prev-page"){R(Math.max(1,Number(l.page)-1));return}if(z==="next-page"){let I=Math.max(1,Math.ceil(Number(l.total)/Number(l.page_size)));R(Math.min(I,Number(l.page)+1));return}if(z==="copy-query"){let I=await mt(l.query_text||"");O(I?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",I?"ok":"warn");return}if(z==="export-json"){let I=`performance-page-${l.page}.json`;je(I,JSON.stringify(xt(l),null,2),"application/json;charset=utf-8"),O(`\u5DF2\u532F\u51FA ${I}`,"ok");return}if(z==="export-csv"){let I=`performance-page-${l.page}.csv`;je(I,kt(l),"text/csv;charset=utf-8"),O(`\u5DF2\u532F\u51FA ${I}`,"ok")}}),p.addEventListener("change",j=>{j.target.matches("[data-page-size]")&&(o=Number(j.target.value)||25,Js.includes(o)||(o=25),R(1))}),await Promise.allSettled([X(),q()]),s||(await N(),await R(1),W()),t&&typeof t.setTitle=="function"&&t.setTitle("\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"),()=>{s=!0,C&&window.clearTimeout(C)}}var En=["\u91D1\u878D\u6D88\u8CBB\u8005\u4FDD\u8B77\u6CD5\u5982\u4F55\u8655\u7406\u91D1\u878D\u6D88\u8CBB\u722D\u8B70\uFF1F","\u8B49\u5238\u4EA4\u6613\u6CD5\u5C0D\u5167\u7DDA\u4EA4\u6613\u6709\u4EC0\u9EBC\u898F\u7BC4\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5438\u6536\u5B58\u6B3E\u8207\u6388\u4FE1\u6709\u54EA\u4E9B\u9650\u5236\uFF1F","\u4FDD\u96AA\u6CD5\u5C0D\u65BC\u696D\u52D9\u54E1\u4E0D\u7576\u62DB\u652C\u7684\u8CAC\u4EFB\u898F\u5B9A\uFF1F","\u9280\u884C\u6CD5\u6709\u591A\u5C11\u689D\u6587\uFF1F","\u8B49\u5238\u71DF\u696D\u54E1\u5E38\u89F8\u72AF\u4EC0\u9EBC\u6CD5\u898F\u6216\u547D\u4EE4\uFF1F","\u6709\u54EA\u4E9B\u6CD5\u898F\u662F\u548C\u58FD\u96AA\u53CA\u7522\u96AA\u76F8\u95DC\u7684\uFF1F"];function jn(){return`<div class="answer-placeholder">
    <span class="empty-icon">${$("sparkles",26)}</span>
    <h2 class="empty-title">\u7B54\u6848\u53EA\u6703\u4F86\u81EA\u6AA2\u7D22\u5230\u7684\u5224\u6C7A\u53CA\u6CD5\u898F\u7247\u6BB5</h2>
    <p class="empty-text">\u9001\u51FA\u554F\u984C\u5F8C\uFF0C\u7CFB\u7D71\u6703\u5148\u4EE5 Qdrant \u6AA2\u7D22\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\u4E26\u6A19\u793A\u5F15\u7528\u7DE8\u865F\u3002
      \u82E5\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u660E\u78BA\u986F\u793A\u964D\u7D1A\u72C0\u614B\uFF0C\u4E0D\u6703\u6191\u7A7A\u751F\u6210\u7B54\u6848\u3002</p>
  </div>`}var Nn={"http.request":"FastAPI \u63A5\u6536\u8ACB\u6C42","http.response":"\u56DE\u50B3\u7D50\u679C\u7D66\u524D\u7AEF","rag.answer_question":"RAG \u4E3B\u6D41\u7A0B","rag.coverage":"PostgreSQL \u7D22\u5F15\u8986\u84CB\u6AA2\u67E5","rag.law_retrieval":"\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22","rag.law_lookup":"\u6BD4\u5C0D\u554F\u984C\u4E2D\u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u540D\u7A31","rag.law_content":"\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u689D\u6587","rag.qdrant_precheck":"Qdrant collection \u6AA2\u67E5","rag.search":"RAG \u6AA2\u7D22","rag.embed_query":"Ollama embedding \u67E5\u8A62\u5411\u91CF","rag.qdrant_search":"Qdrant \u5411\u91CF\u641C\u5C0B","rag.fetch_documents":"PostgreSQL \u8B80\u53D6\u5224\u6C7A","rag.postgres_fetch":"PostgreSQL \u5224\u6C7A\u67E5\u8A62","rag.build_citations":"\u6574\u7406\u5F15\u7528\u8207\u5224\u6C7A\u7247\u6BB5","rag.extract_excerpt":"\u64F7\u53D6\u76F8\u95DC\u7247\u6BB5","rag.llm":"LLM \u56DE\u7B54\u751F\u6210","rag.llm_request":"Ollama LLM \u751F\u6210","rag.validate_citations":"\u9A57\u8B49\u5F15\u7528\u7DE8\u865F","rag.test_mode":"\u6E2C\u8A66\u6A21\u5F0F\u591A\u6A21\u578B\u6D41\u7A0B","rag.preview_fallback":"\u6CD5\u898F\u9810\u89BD\u964D\u7D1A"};function Pn(e){let t=String(e?.name||""),s=e?.params||{},a=String(s.model||s.embedding_model||"").trim();return t==="rag.llm_request"?`Ollama run ${a||"LLM"}`:t==="rag.llm"?`LLM \u56DE\u7B54\u751F\u6210${a?` \xB7 ${a}`:""}`:t==="rag.embed_query"?`Ollama embedding \u67E5\u8A62\u5411\u91CF${a?` \xB7 ${a}`:""}`:Nn[t]||t||"backend step"}function Xs(e){return[e?.module,e?.function,e?.name].filter(Boolean).join(" \xB7 ")}function Cn(){return`<details class="rag-process" id="rag-process" open>
    <summary>
      <span class="rag-process-title">\u5F8C\u7AEF\u8655\u7406\u6D41\u7A0B</span>
      <span class="rag-process-summary" id="rag-process-summary">\u57F7\u884C\u4E2D\u2026</span>
    </summary>
    <div class="rag-process-list" id="rag-process-list">
      <div class="rag-process-item is-running" data-process-key="frontend" style="--depth:0">
        <span class="rag-process-dot"></span>
        <span class="rag-process-label">frontend HTTP request \u2192 FastAPI</span>
        <span class="rag-process-meta">\u9001\u51FA</span>
      </div>
    </div>
    <div class="rag-process-hint">\u5B8C\u6210\u5F8C\u6703\u81EA\u52D5\u6536\u5408\uFF1B\u9EDE\u64CA\u6458\u8981\u53EF\u5C55\u958B\u5B8C\u6574\u6D41\u7A0B\u3002</div>
  </details>`}function Rn(e){let t=e.querySelector("#rag-process"),s=t?.querySelector("#rag-process-list"),a=t?.querySelector("#rag-process-summary"),r=performance.now(),i=new Map,o=(g,p,h)=>{let x=g.querySelector(p);x&&(x.textContent=h)},l=g=>{if(!s)return null;let p=String(g?.seq??`step-${i.size+1}`),h=i.get(p);if(!h){let x=document.createElement("div");x.className="rag-process-item is-running",x.dataset.processKey=p,x.style.setProperty("--depth",String(Math.max(0,Math.min(6,Number(g?.depth)||0)))),x.innerHTML=`<span class="rag-process-dot"></span>
        <span class="rag-process-label"></span>
        <span class="rag-process-meta">\u57F7\u884C\u4E2D\u2026</span>`,s.appendChild(x),h={element:x,segment:g},i.set(p,h)}return o(h.element,".rag-process-label",Pn(g)),h.element.title=Xs(g),h};return{step:g=>{let p=g?.segment;if(!p)return;let h=l(p);if(h){if(g.type==="segment_start"){h.element.classList.add("is-running"),o(h.element,".rag-process-meta","\u57F7\u884C\u4E2D\u2026");return}if(g.type==="segment_end"){let x=p.status==="error";h.element.classList.remove("is-running"),h.element.classList.toggle("is-error",x),o(h.element,".rag-process-meta",x?"\u5931\u6557":B(p.duration_ms||0)),h.element.title=[Xs(p),x&&p.error||""].filter(Boolean).join(" \xB7 ")}}},finish:(g=!0)=>{if(!t)return"";t.querySelectorAll(".rag-process-item.is-running").forEach(x=>{x.classList.remove("is-running"),o(x,".rag-process-meta",g?"\u5B8C\u6210":"\u4E2D\u65B7")});let p=s?.children.length||i.size,h=B(Math.max(0,performance.now()-r));return a&&(a.textContent=g?`\u5B8C\u6210 \xB7 ${p} \u6B65 \xB7 ${h}`:`\u5931\u6557 \xB7 ${p} \u6B65`),t.open=!1,t.classList.add("is-complete"),t.outerHTML}}}function In(e,t=!1){let s=t?"\u6E2C\u8A66\u6A21\u5F0F\uFF1A\u6B63\u5728\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207 LLM \u6A21\u578B\uFF0C\u53EF\u80FD\u9700\u8981\u6578\u5206\u9418\u2026":"\u6B63\u5728\u4EE5\u5411\u91CF\u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\u7247\u6BB5\u4E26\u751F\u6210\u56DE\u7B54\uFF1B\u5FEB\u901F\u6A21\u5F0F\u901A\u5E38 2\u201310 \u79D2\u2026";return`<div class="answer-head">
      <div class="answer-head-left">${$("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u4E2D</span>
      </div>
      <div class="answer-head-meta"><span class="spinner"></span></div>
      ${t?"":Cn()}
    </div>
    <div class="answer-body">
      <p class="answer-text">${s}\u300C${n(e)}\u300D</p>
      <div class="skeleton skeleton-line" style="margin-top:22px;width:92%"></div>
      <div class="skeleton skeleton-line" style="width:76%"></div>
      <div class="skeleton skeleton-line" style="width:84%"></div>
    </div>`}function Bn(e,t){let s=e.score===null||e.score===void 0?"":`\u76F8\u4F3C\u5EA6 ${Number(e.score).toFixed(4)}`,a=[e.court,e.jdate,s].filter(Boolean).map(l=>`<span>${n(l)}</span>`).join(""),r=(Array.isArray(e.matched_laws)?e.matched_laws:[]).slice(0,5).map(l=>`<span class="chip">${n(l)}</span>`).join(""),i=e.jid?` data-action="open-parquet-judgment"
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
  </article>`}function Dn(e,t){let s=[e.law_level,e.law_category,e.article_count?`${u(e.article_count)} \u689D`:""].filter(Boolean).map(r=>`<span>${n(r)}</span>`).join(""),a=e.law_url?`<a class="citation-link" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">\u4F86\u6E90${$("external",11)}</a>`:"";return`<article class="citation">
    <span class="citation-index">${String(e.index??t+1).padStart(2,"0")}</span>
    <div class="citation-body">
      <h4 class="citation-name">${n(e.law_name||"\u672A\u547D\u540D\u6CD5\u898F")}</h4>
      <div class="citation-meta">${s||"<span>\u6CD5\u898F metadata</span>"}</div>
      ${e.snippet?`<p class="citation-snippet">${n(e.snippet)}</p>`:""}
    </div>
    ${a}
  </article>`}function On(e,t){let s=e.source_label||(e.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),a=e.law_level&&e.law_level!==s?e.law_level:"",r=[`<span class="badge ${e.source_type==="order"?"badge-warn":"badge-info"}">${n(s)}</span>`,a,e.law_category,e.article_count?`${u(e.article_count)} \u689D`:"",e.law_modified_date?`\u7570\u52D5 ${_e(e.law_modified_date)}`:""].filter(Boolean).map(p=>`<span>${p}</span>`).join(""),i=e.first_promulgation?`<div class="citation-meta"><span>\u6700\u65E9\u5236\u5B9A\uFF1A${n(e.first_promulgation.roc_date)}\uFF08\u897F\u5143 ${n(e.first_promulgation.gregorian_date)}\uFF09</span></div>`:"",o=e.stats,l=o?`<div class="law-source-stats">
        <span>\u63D0\u53CA\u300C${n(o.entity||"")}\u300D\u7684\u5224\u6C7A ${u(o.judgment_count||0)} \u7B46</span>
        <span>\u672C\u6CD5\u898F\u88AB\u5F15\u7528 ${u(o.law_count||0)} \u6B21</span>
      </div>`:"",f=(Array.isArray(e.articles)?e.articles:[]).slice(0,2).map(p=>`<div class="law-source-article">
        <span class="law-source-article-no">${n(p.article_no||"\u689D\u6587")}</span>
        <p class="law-source-article-text">${n(p.article_content||"")}</p>
      </div>`).join(""),b=e.law_url?`<a class="citation-link" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">\u6CD5\u898F\u4F86\u6E90${$("external",11)}</a>`:"",g=e.law_key?` data-action="open-law-source"
        data-law-key="${n(e.law_key)}"
        data-source-type="${n(e.source_type||"")}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F\u672C\u5730 Parquet \u7684\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u59CB\u689D\u6587"
        aria-label="\u958B\u555F ${n(e.law_name||"\u6CD5\u898F")} \u539F\u59CB\u689D\u6587"`:"";return`<article class="citation law-source">
    <span class="citation-index">${String(e.index??t+1).padStart(2,"0")}</span>
    <div class="citation-body"${g}>
      <h4 class="citation-name">${n(e.law_name||"\u672A\u547D\u540D\u6CD5\u898F")}</h4>
      <div class="citation-meta">${r}</div>
      ${i}
      ${l}
      ${f}
    </div>
    <div class="citation-links">${b}</div>
  </article>`}function Fn(e,t,s=""){let a=Array.isArray(t.citations)?t.citations:[],r=Array.isArray(t.judgments)?t.judgments:[],i=Array.isArray(t.law_sources)?t.law_sources:[],o=Array.isArray(t.matched_terms)?t.matched_terms:[],l=t.status||"preview",f=l==="operational"?"\u5B8C\u6210":l==="retrieval_only"?"\u50C5\u6AA2\u7D22\u7D50\u679C":l==="preview"?"\u6CD5\u898F\u9810\u89BD":l==="unavailable"||l==="not_configured"?"\u8CC7\u6599\u4E0D\u53EF\u7528":l==="degraded"?"\u964D\u7D1A":"\u5B8C\u6210",b=r.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u5224\u6C7A \xB7 ${r.length} \u7B46</span>
        <span>vector retrieval \xB7 [\u7DE8\u865F] \u5C0D\u61C9\u56DE\u7B54\u5F15\u7528</span>
      </div>
      <div class="citation-list">${r.map((I,re)=>Bn(I,re)).join("")}</div>`:"",g=i.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4 \xB7 ${i.length} \u7B46</span>
        <span>PostgreSQL metadata \xB7 Parquet \u689D\u6587</span>
      </div>
      <div class="citation-list">${i.map((I,re)=>On(I,re)).join("")}</div>`:"",p=!r.length&&a.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F \xB7 ${a.length} \u7B46</span>
        <span>metadata match</span>
      </div>
      <div class="citation-list">${a.map((I,re)=>Dn(I,re)).join("")}</div>`:"",h=b+g+p;h||(h=`<div class="answer-divider"></div>
      ${me({iconName:"file",title:"\u6C92\u6709\u53EF\u5F15\u7528\u7684\u4F86\u6E90",text:l==="retrieval_only"?"\u76EE\u524D\u5DF2\u5EFA\u7ACB\u7684\u5411\u91CF\u7D22\u5F15\u4E2D\u6C92\u6709\u8DB3\u5920\u76F8\u4F3C\u7684\u5224\u6C7A\uFF0C\u4E5F\u6C92\u6709\u53EF\u5C0D\u61C9\u7684\u6CD5\u898F\u6216\u547D\u4EE4\u3002\u7CFB\u7D71\u4E0D\u6703\u5728\u6C92\u6709\u4F86\u6E90\u6642\u751F\u6210\u7B54\u6848\u3002":"\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u4E14\u554F\u984C\u4E2D\u6C92\u6709\u53EF\u76F4\u63A5\u5C0D\u61C9\u7684\u73FE\u884C\u6CD5\u898F\u540D\u7A31\u3002"})}`);let x=o.length?`<div class="answer-section-label" style="margin-top:18px">
        <span>\u547D\u4E2D\u8A5E\u5F59</span>
      </div>
      <div class="chips">${o.map(I=>`<span class="chip">${n(I)}</span>`).join("")}</div>`:"",_=t.test_run,E=String(t.llm_model||_?.primary_model||"").trim(),P=String(t.embedding_model||"").trim(),C=[E?`LLM\uFF1A${E}`:"",P?`Embedding\uFF1A${P}`:""].filter(Boolean).join(" \xB7 "),y=t.answer_source==="structured",A=String(t.law_answer||"").trim(),T=t.law_framework||null,q=Array.isArray(T?.rows)?T.rows:[],N=Array.isArray(T?.sources)?T.sources:[],W=q.length>0,R=!!A&&!y&&!W,X=t.answer_source==="llm"?"LLM \u7D9C\u5408\u56DE\u7B54":"\u6AA2\u7D22\u7D50\u679C\u6458\u8981",j=W?`<div class="answer-block law-framework-block">
        <div class="answer-block-head">
          <span>${n(T.title||"\u76F8\u95DC\u6CD5\u898F\u7684\u8CAC\u4EFB\u67B6\u69CB")}</span>
          <span>${q.length} \u689D</span>
        </div>
        <div class="table-wrap law-framework-table-wrap">
          <table class="data-table is-compact law-framework-table">
            <thead>
              <tr><th scope="col">\u6CD5\u898F</th><th scope="col">\u689D\u6587</th><th scope="col">\u898F\u7BC4\u91CD\u9EDE</th></tr>
            </thead>
            <tbody>
              ${q.map(I=>`<tr>
                    <td>${n(I.law_name||"\u2014")}</td>
                    <td class="cell-number">${n(I.article_no||"\u2014")}</td>
                    <td>${n(I.focus||"\u2014")}</td>
                  </tr>`).join("")}
            </tbody>
          </table>
        </div>
        ${N.length?`<div class="law-framework-sources">
                <span>\u6CD5\u898F\u4F86\u6E90</span>
                ${N.map(I=>`<span class="chip">${n(I.law_name||I)}${I&&I.index!==null&&I.index!==void 0?` [${n(I.index)}]`:""}</span>`).join("")}
              </div>`:""}
      </div>`:"",D=t.answer_source==="llm"&&E?`<span class="answer-model" title="${n(C)}">${$("brain",11)}${n(E)}</span>`:y?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${$("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"",z=_?`<div class="test-run-summary">
        <div class="test-run-summary-head">
          <span class="badge badge-warn">\u6E2C\u8A66\u6A21\u5F0F</span>
          ${V(_.status)}
          <span class="mono">${n(_.run_id||"")}</span>
        </div>
        <div class="test-run-summary-body">
          <span>Embedding ${Number(_.models?.embedding?.length||0)} \u500B</span>
          <span>LLM ${Number(_.models?.llm?.length||0)} \u500B</span>
          <span>\u4E3B\u56DE\u7B54 ${n(_.primary_model||"\u2014")}</span>
          <span>${Number(_.total_ms||0)} ms</span>
          <a href="#/performance">\u67E5\u770B\u6E2C\u8A66 Flow</a>
        </div>
      </div>`:"";return`<div class="answer-head">
      <div class="answer-head-left">${$("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u7D50\u679C</span>
      </div>
      <div class="answer-head-meta">
        ${V(l,f)}
        <span>${Number(t.duration_ms||0)} ms</span>
        ${D}
      </div>
      ${s}
    </div>
    <div class="answer-body">
      ${j}
      ${R?`<div class="answer-block law-answer-block">
              <div class="answer-block-head">
                <span>\u6CD5\u898F\uFF0F\u547D\u4EE4\u6AA2\u7D22\u7D50\u679C</span>
                <span>${i.length} \u7B46\u4F86\u6E90</span>
              </div>
              <p class="answer-text">${n(A)}</p>
            </div>`:""}
      <div class="answer-block">
        ${R||W?`<div class="answer-block-head">
                <span>${n(X)}</span>
                <span>${n(D?E||"structured":"retrieval")}</span>
              </div>`:""}
        <p class="answer-text">${n(t.answer||"\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u56DE\u7B54\u3002")}</p>
      </div>
      ${t.notice?`<div class="answer-notice">${n(t.notice)}</div>`:""}
      ${z}
      ${x}
      ${h}
    </div>`}function Hn(e,t=""){return`<div class="answer-head">
      <div class="answer-head-left">${$("alert",16)}
        <span class="answer-head-title">\u7121\u6CD5\u5B8C\u6210\u6AA2\u7D22</span>
      </div>
      ${t}
    </div>
    <div class="answer-body">
      ${G({tone:"danger",title:"\u8ACB\u6C42\u5931\u6557",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
    </div>`}function Un(e){return e.length?e.map((t,s)=>{let a=Array.isArray(t.payload?.citations)?t.payload.citations.length:0,r=Array.isArray(t.payload?.judgments)?t.payload.judgments.length:0,i=Array.isArray(t.payload?.law_sources)?t.payload.law_sources.length:0,o=a+r+i;return`<button class="history-item" type="button" data-history-index="${s}">
        <span class="history-question">${n(t.title||"\u672A\u547D\u540D\u63D0\u554F")}</span>
        <span class="history-meta">
          <span>${n(Ve(t.created_at))}</span>
          <span>\xB7</span>
          <span>${o?`${o} \u7B46\u4F86\u6E90`:"\u7121\u5F15\u7528"}</span>
        </span>
      </button>`}).join(""):'<div class="history-empty">\u5C1A\u7121\u63D0\u554F\u7D00\u9304\u3002\u9001\u51FA\u7B2C\u4E00\u500B\u554F\u984C\u5F8C\u6703\u4FDD\u5B58\u5728\u6B64\u700F\u89BD\u5668\u3002</div>'}async function zn(e){let t=!1,s=[],a="",r=!1,i={embedding:[],llm:[]};e.innerHTML=`<section class="page rag-page">
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
            ${$("sparkles",16)}<span>\u958B\u59CB\u6AA2\u7D22</span>
          </button>
        </div>
      </form>
      <div class="example-chips" id="example-chips" aria-label="\u7BC4\u4F8B\u554F\u984C">
        ${En.map(v=>`<button class="example-chip" type="button" data-question="${n(v)}">${n(v)}</button>`).join("")}
      </div>
    </header>

    <div class="rag-grid">
      <section class="card answer-card" id="answer-card" aria-live="polite">
        ${jn()}
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
  </section>`;let o=e.querySelector("#rag-form"),l=e.querySelector("#rag-question"),f=e.querySelector("#rag-submit"),b=e.querySelector("#answer-card"),g=e.querySelector("#rag-stats"),p=e.querySelector("#rag-stats-mode"),h=e.querySelector("#rag-history"),x=e.querySelector("#rag-storage-note"),_=e.querySelector("#rag-clear-history"),E=e.querySelector("#rag-test-mode"),P=e.querySelector("#rag-test-flow"),C=e.querySelector("#rag-judgment-dialog"),y=e.querySelector("#rag-law-dialog"),A=()=>{document.documentElement.classList.toggle("dialog-open",!!e.querySelector("dialog[open]"))};C?.addEventListener("close",A),y?.addEventListener("close",A);let T=null,q=null,N=()=>{l.style.height="auto",l.style.height=`${Math.min(l.scrollHeight,220)}px`},W=async()=>{try{if(s=await ht({limit:6}),t)return;h.innerHTML=Un(s),x.textContent=ft()==="indexeddb"?"\u63D0\u554F\u7D00\u9304\u5132\u5B58\u5728\u700F\u89BD\u5668 IndexedDB\uFF0C\u4E0D\u6703\u4E0A\u50B3\u5230\u4F3A\u670D\u5668\u3002":"\u700F\u89BD\u5668\u5132\u5B58\u4E0D\u53EF\u7528\uFF0C\u63D0\u554F\u7D00\u9304\u53EA\u4FDD\u7559\u5728\u672C\u6B21\u5DE5\u4F5C\u968E\u6BB5\u3002"}catch{if(t)return;h.innerHTML='<div class="history-empty">\u7121\u6CD5\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u3002</div>'}},R=async()=>{try{let v=await F.status();if(t)return;let L=v.data||{},U=new Map((v.services||[]).map(ct=>[ct.id,ct])),J=U.get("qdrant"),ve=U.get("embedding"),K=U.get("rag"),ie=U.get("llm"),Z=Number(L.judgment_indexed_count||0),ue=Number(L.judgment_count||0),et=ue?(Z/ue*100).toFixed(1):"0.0",be=L.judgment_vector_points===null||L.judgment_vector_points===void 0?"\u2014":u(L.judgment_vector_points);g.innerHTML=`<div class="mini-stats">
          <div class="mini-stat">
            <div class="mini-stat-value">${u(ue)}</div>
            <div class="mini-stat-label">\u5224\u6C7A</div>
          </div>
          <div class="mini-stat">
            <div class="mini-stat-value">${u(Z)}</div>
            <div class="mini-stat-label">\u5DF2\u7D22\u5F15</div>
          </div>
          <div class="mini-stat">
            <div class="mini-stat-value">${et}%</div>
            <div class="mini-stat-label">\u7D22\u5F15\u8986\u84CB</div>
          </div>
        </div>
        <div class="side-status-list">
          <div class="side-status-row">
            <span>${$("cube",13)}Qdrant \u5411\u91CF\u7D22\u5F15</span>
            ${V(J?.status,J?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
          </div>
          <div class="side-status-row">
            <span>${$("layers",13)}Embedding\uFF08${n(L.judgment_vector_model||"\u2014")}\uFF09</span>
            ${V(ve?.status,ve?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
          </div>
          <div class="side-status-row">
            <span>${$("brain",13)}RAG \u56DE\u7B54\u7BA1\u7DDA</span>
            ${V(K?.status,K?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
          </div>
          <div class="side-status-row">
            <span>${$("sparkles",13)}LLM \u6A21\u578B</span>
            ${V(ie?.status,ie?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
          </div>
        </div>
        <div class="side-card-foot" style="padding:0;border:0;margin-top:10px">
          Collection\uFF1A${n(L.judgment_vector_collection||"\u2014")} \xB7
          ${be} points \xB7 \u5269\u9918 ${u(L.judgment_index_remaining)} \u7B46\u5F85\u7D22\u5F15
        </div>`;let ye=e.querySelector("#rag-mode-notice");ye&&(K?.status==="operational"?ye.innerHTML=G({tone:"ok",title:"\u6AA2\u7D22\u8207\u56DE\u7B54\u5C31\u7DD2",text:`Qdrant\u3001Embedding \u8207 LLM \u5747\u53EF\u4F7F\u7528\uFF1B\u76EE\u524D\u7D22\u5F15\u6DB5\u84CB ${u(Z)} / ${u(ue)} \u7B46\u5224\u6C7A\u3002\u56DE\u7B54\u4E0D\u662F\u6CD5\u5F8B\u610F\u898B\u3002`}):K?.status==="degraded"?ye.innerHTML=G({tone:"warn",title:"\u90E8\u5206 AI \u5143\u4EF6\u672A\u5C31\u7DD2",text:n(K.detail||"RAG \u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u6AA2\u7D22\u7D50\u679C\u3002")}):ye.innerHTML=G({tone:"info",title:"\u5411\u91CF\u7D22\u5F15\u5C1A\u672A\u5C31\u7DD2 \xB7 \u4E0D\u662F\u6CD5\u5F8B\u610F\u898B",text:n(K?.detail||"\u8A2D\u5B9A QDRANT_URL\u3001EMBEDDING_URL \u8207 LLM_URL \u4E26\u57F7\u884C judgment-index-vectors \u5F8C\u5373\u53EF\u555F\u7528\u5224\u6C7A\u6AA2\u7D22\u3002")})),p.className=`badge ${K?.status==="operational"?"badge-ok":K?.status==="not_configured"?"badge-neutral":"badge-warn"} badge-mono`,p.textContent=K?.status==="operational"?"RAG \u5C31\u7DD2":K?.status==="not_configured"?"\u672A\u8A2D\u5B9A":"\u964D\u7D1A"}catch{if(t)return;g.innerHTML='<p class="muted" style="font-size:11px">\u76EE\u524D\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002</p>',p.className="badge badge-danger badge-mono",p.textContent="\u96E2\u7DDA"}},X=()=>{if(!E)return;if(!r){E.innerHTML="";return}let v=Array.isArray(i.embedding)?i.embedding.length:0,L=Array.isArray(i.llm)?i.llm.length:0;E.innerHTML=G({tone:"warn",title:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F",text:`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${v} \u500B embedding \u8207 ${L} \u500B LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002\u6E2C\u8A66 Flow \u6703\u5728\u9801\u9762\u4E0B\u65B9\u5373\u6642\u986F\u793A\uFF0C\u4E5F\u53EF\u5230 <a href="#/performance">\u6548\u80FD\u5831\u8868</a> \u67E5\u770B\u6B77\u53F2\u3002`})},j=async()=>{try{let v=await F.testMode();if(t)return;r=!!v.enabled,i=v.models||{embedding:[],llm:[]},X()}catch{if(t)return;r=!1,X()}},D=v=>{r=!!v.detail?.enabled,i=v.detail?.models||{embedding:[],llm:[]},X()};window.addEventListener("judgment:test-mode",D);let z=v=>{P&&(q=v||null,P.innerHTML=v?St(v,[],"",{showHistory:!1}):"")},I=()=>{T&&(window.clearTimeout(T),T=null)},re=()=>{I();let v=async()=>{if(!t){try{let L=await F.testRunCurrent();if(t)return;let U=L.run;U&&U.status==="running"&&z(U)}catch{}t||(T=window.setTimeout(v,1500))}};v()},ze=async v=>{if(!v){z(null);return}try{let L=await F.testRun(v);if(t)return;z(L.run||null)}catch{t||O("\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF0C\u4F46\u7121\u6CD5\u8F09\u5165\u6E2C\u8A66 Flow\u3002","warn")}},de=async()=>{if(r)try{let v=await F.testRunCurrent();if(t)return;v.run?.status==="running"&&(z(v.run),re())}catch{}},xe=0,ae=(v,L)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">DB ORIGINAL JUDGMENT</div>
      <h2>${n(v)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-parquet-judgment" aria-label="\u95DC\u9589">${$("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${L}</div>`,Me=v=>{let L=(Array.isArray(v.matched_laws)?v.matched_laws:[]).map(K=>`<span class="chip">${n(K)}</span>`).join(""),U=[v.court,v.jdate,v.title?`\u6848\u7531\uFF1A${v.title}`:"",v.full_text_length?`${u(v.full_text_length)} \u5B57`:"",v.citation_count?`\u5F15\u7528 ${u(v.citation_count)} \u7B46`:""].filter(Boolean).map(K=>`<span>${n(K)}</span>`).join(""),J=v.parquet_generated_at?`DB \u5132\u5B58\u539F\u6587\uFF08\u539F\u59CB Parquet\uFF09\xB7 ${n(String(v.parquet_generated_at).replace("T"," ").slice(0,19))}`:"DB \u5132\u5B58\u539F\u6587",ve=v.pdf_url?`<a class="btn btn-secondary btn-sm" href="${n(v.pdf_url)}" target="_blank" rel="noopener noreferrer">${$("external",13)}<span>\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF</span></a>`:"";return ae(v.jid||"\u5224\u6C7A\u5168\u6587",`<div class="judgment-dialog-meta">
        <span class="badge badge-info">${n(v.source==="parquet"?"DB \u5132\u5B58\u539F\u6587":"PostgreSQL")}</span>
        ${U}
      </div>
      ${L?`<div class="chips" style="margin:8px 0 10px">${L}</div>`:""}
      <div class="judgment-dialog-source">${J}</div>
      <pre class="judgment-dialog-text">${n(v.full_text||"\u6B64\u5224\u6C7A\u6C92\u6709\u5168\u6587\u3002")}</pre>
      <div class="judgment-dialog-actions">
        ${ve}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-parquet-judgment">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},Ge=async v=>{if(!C||!v)return;let L=++xe;C.open||C.showModal(),A(),C.innerHTML=ae("\u8B80\u53D6\u5224\u6C7A\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E DB \u5132\u5B58\u539F\u6587\u8B80\u53D6 ${n(v)}\u2026</span>
      </div>`);try{let U=await F.judgmentDetail(v,"parquet");if(t||L!==xe)return;C.innerHTML=Me(U)}catch(U){if(t||L!==xe)return;C.innerHTML=ae("\u7121\u6CD5\u8B80\u53D6 DB \u539F\u6587\u5224\u6C7A",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${n(U.message||"\u627E\u4E0D\u5230\u5224\u6C7A\u5168\u6587\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u5DF2\u57F7\u884C <span class="mono">uv run judgment-import-judgments --raw-only</span>\uFF0C\u4E14\u539F\u59CB Parquet \u5B58\u5728\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-parquet-judgment">\u95DC\u9589</button>
        </div>`)}},Se=0,Xe=(v,L)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">LOCAL PARQUET LAW</div>
      <h2>${n(v)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-law-source" aria-label="\u95DC\u9589">${$("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${L}</div>`,ot=v=>{let U=(Array.isArray(v.articles)?v.articles:[]).map(be=>{let ye=String(be.article_content||"").trim();return ye?be.article_type==="C"?`<div class="law-chapter">${n(ye)}</div>`:`<article class="law-article">
          <div class="law-article-head">
            <span class="law-article-no">${n(be.article_no||"\u689D\u6587")}</span>
          </div>
          <div class="law-article-text">${n(ye)}</div>
        </article>`:""}).join(""),J=(Array.isArray(v.warnings)?v.warnings:[]).map(be=>n(be)).join("<br />"),ve=v.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F",K=v.meta?.articles_source==="parquet"?"Parquet \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",ie=v.meta?.snapshot||"",Z=[v.law_level,v.law_category,v.article_count?`${u(v.article_count)} \u689D`:"",v.law_modified_date?`\u7570\u52D5 ${_e(v.law_modified_date)}`:""].filter(Boolean).map(be=>`<span>${n(be)}</span>`).join(""),ue=v.law_url?`<a class="btn btn-secondary btn-sm" href="${n(v.law_url)}" target="_blank" rel="noopener noreferrer">${$("external",13)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:"",et=v.law_histories?`<details class="law-dialog-history">
          <summary>\u6CD5\u898F\u6CBF\u9769</summary>
          <div>${n(v.law_histories)}</div>
        </details>`:"";return Xe(v.law_name||v.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4",`<div class="judgment-dialog-meta">
        <span class="badge ${v.source_type==="order"?"badge-warn":"badge-info"}">${n(ve)}</span>
        ${Z}
      </div>
      <div class="judgment-dialog-source">${n([K,ie].filter(Boolean).join(" \xB7 "))}</div>
      ${J?`<div class="law-dialog-warning">${J}</div>`:""}
      ${et}
      <div class="law-dialog-articles">${U||'<div class="report-empty-inline">\u9019\u500B\u6CD5\u898F\uFF0F\u547D\u4EE4\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u3002</div>'}</div>
      <div class="judgment-dialog-actions">
        ${ue}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-law-source">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},Ze=async(v,L="")=>{if(!y||!v)return;let U=++Se;y.open||y.showModal(),A(),y.innerHTML=Xe("\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E\u672C\u5730 Parquet \u8B80\u53D6 ${n(v)} \u7684\u539F\u59CB\u689D\u6587\u2026</span>
      </div>`);try{let J=await F.lawDetail(v,L);if(t||U!==Se)return;y.innerHTML=ot(J)}catch(J){if(t||U!==Se)return;y.innerHTML=Xe("\u7121\u6CD5\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u6587",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${n(J.message||"\u627E\u4E0D\u5230\u689D\u6587\u5167\u5BB9\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u672C\u5730\u539F\u59CB\u6CD5\u898F Parquet \u5B58\u5728\uFF0C\u4E14 PostgreSQL metadata \u8207\u5176\u4E00\u81F4\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-law-source">\u95DC\u9589</button>
        </div>`)}};y?.addEventListener("click",v=>{if(v.target.closest('[data-action="close-law-source"]')){y.close();return}let L=y.getBoundingClientRect();(v.clientX<L.left||v.clientX>L.right||v.clientY<L.top||v.clientY>L.bottom)&&y.close()}),C?.addEventListener("click",v=>{if(v.target.closest('[data-action="close-parquet-judgment"]')){C.close();return}let L=C.getBoundingClientRect();(v.clientX<L.left||v.clientX>L.right||v.clientY<L.top||v.clientY>L.bottom)&&C.close()}),b.addEventListener("click",v=>{let L=v.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(L){if(L.dataset.action==="open-law-source"){Ze(L.dataset.lawKey||"",L.dataset.sourceType||"");return}Ge(L.dataset.jid||"")}}),b.addEventListener("keydown",v=>{if(v.key!=="Enter"&&v.key!==" ")return;let L=v.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(!(!L||L.closest("a, button"))){if(v.preventDefault(),L.dataset.action==="open-law-source"){Ze(L.dataset.lawKey||"",L.dataset.sourceType||"");return}Ge(L.dataset.jid||"")}});let lt=async v=>{let L=v.trim();if(!L){O("\u8ACB\u5148\u8F38\u5165\u554F\u984C\u3002","warn"),l.focus();return}a=L,l.value=L,N(),b.innerHTML=In(L,r);let U=r?null:Rn(b);r?(z(null),re()):(I(),z(null)),Q(f,!0,"\u6AA2\u7D22\u4E2D\u2026");try{let J=r?await F.rag(L,{testMode:r}):await F.ragStream(L,{onStep:ue=>U?.step(ue)});if(t)return;I();let ve=U?.finish(!0)||"";b.innerHTML=Fn(L,J,ve),J.test_run?.run_id?await ze(J.test_run.run_id):z(null);let K=Array.isArray(J.citations)?J.citations:[],ie=Array.isArray(J.judgments)?J.judgments:[],Z=K.length+ie.length;await gt({kind:"rag",title:L,detail:`${J.status||"preview"} \xB7 ${Z} \u7B46\u4F86\u6E90`,payload:{question:L,status:J.status,citations:K.map(ue=>ue.law_name),judgments:ie.map(ue=>ue.jid)}}),await W()}catch(J){if(I(),t)return;let ve=U?.finish(!1)||"";b.innerHTML=Hn(J,ve),O(J.message||"\u6AA2\u7D22\u5931\u6557\u3002","danger")}finally{I(),t||Q(f,!1)}};return o.addEventListener("submit",v=>{v.preventDefault(),lt(l.value)}),l.addEventListener("input",N),l.addEventListener("keydown",v=>{v.key==="Enter"&&!v.shiftKey&&!v.isComposing&&(v.preventDefault(),o.requestSubmit())}),e.querySelector("#example-chips").addEventListener("click",v=>{let L=v.target.closest("[data-question]");L&&(l.value=L.dataset.question,N(),o.requestSubmit())}),h.addEventListener("click",v=>{let L=v.target.closest("[data-history-index]");if(!L)return;let U=s[Number(L.dataset.historyIndex)];U&&(l.value=U.title,N(),lt(U.title))}),_.addEventListener("click",async()=>{if(!s.length){O("\u76EE\u524D\u6C92\u6709\u53EF\u6E05\u9664\u7684\u63D0\u554F\u7D00\u9304\u3002","info");return}window.confirm("\u78BA\u5B9A\u6E05\u9664\u9019\u500B\u700F\u89BD\u5668\u7684\u6240\u6709\u63D0\u554F\u7D00\u9304\uFF1F")&&(await Ms(),await W(),O("\u5DF2\u6E05\u9664\u672C\u6A5F\u63D0\u554F\u7D00\u9304\u3002","ok"))}),N(),await Promise.allSettled([R(),W(),j()]),await de(),()=>{t=!0,I(),document.documentElement.classList.remove("dialog-open"),window.removeEventListener("judgment:test-mode",D),a&&b.setAttribute("data-last-question",a)}}var ls={};Qe(ls,{render:()=>fr});var Gn=2e3,Qn={running:{label:"\u57F7\u884C\u4E2D",tone:"info"},success:{label:"\u5B8C\u6210",tone:"ok"},failed:{label:"\u5931\u6557",tone:"danger"},interrupted:{label:"\u5DF2\u4E2D\u6B62",tone:"warn"},stale:{label:"\u72C0\u614B\u5931\u6548",tone:"warn"},skipped:{label:"\u7565\u904E",tone:"idle"},pending:{label:"\u7B49\u5F85",tone:"idle"},idle:{label:"\u5F85\u547D",tone:"idle"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},operational:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},unavailable:{label:"\u7121\u6CD5\u53D6\u5F97",tone:"danger"},missing:{label:"\u5C1A\u7121\u7D00\u9304",tone:"idle"},error:{label:"\u8B80\u53D6\u5931\u6557",tone:"danger"},ok:{label:"\u6B63\u5E38",tone:"ok"}},Zs={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},ea={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},aa={judgment:"\u5224\u6C7A",law:"\u6CD5\u898F",order:"\u547D\u4EE4",system:"\u7CFB\u7D71"},At={judgment:"#a78bfa",law:"#22d3ee",order:"#f472b6",system:"#94a3b8"},Jn={extract:"file",raw_parquet:"cube",filter:"filter",postgres:"database",qdrant:"brain",download:"download",parse:"sliders"},Vn={raw_parquet:"\u539F\u59CB Parquet",postgres:"PostgreSQL"};function it(e){return Qn[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function he(e,t){let s=it(e);return`<span class="badge ${Zs[s.tone]||Zs.idle}"><span class="status-dot ${ea[s.tone]||ea.idle}"></span>${n(t||s.label)}</span>`}function Fe(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function ta(e){return e==null?"\u7121\u6CD5\u53D6\u5F97":u(e)}function Ke(e){return e&&e.color?String(e.color):"var(--accent)"}function Lt(e,t=""){let s=e.percent===null||e.percent===void 0?null:Math.max(0,Math.min(100,Number(e.percent)||0)),a=e.status==="running"&&s===null,r=a?' aria-valuetext="\u9032\u5EA6\u672A\u77E5"':` aria-valuenow="${s??0}"`;return`<div class="processing-bar${a?" is-indeterminate":""}${t?` ${t}`:""}" role="progressbar" aria-valuemin="0" aria-valuemax="100"${r}>
    <span class="processing-bar-fill" style="width:${s??0}%;background:${n(Ke(e))}"></span>
  </div>`}function Wn(e){let t=e.unit==="bytes"?"":e.unit||"\u7B46",s=e.current,a=e.total;return s==null?e.status==="running"?"\u9032\u884C\u4E2D":"\u2014":e.unit==="bytes"?a?`${pe(s)} / ${pe(a)}`:pe(s):a?`${u(s)} / ${u(a)} ${t}`:`${u(s)} ${t}`}function Kn(e){let t=[`<span>${n(Wn(e))}</span>`];return e.percent===null||e.percent===void 0?e.status==="running"&&t.push('<span class="mono">\u9032\u5EA6\u672A\u77E5</span>'):t.push(`<span class="mono">${Fe(e.percent)}</span>`),e.duration_ms&&t.push(`<span class="mono">${B(e.duration_ms)}</span>`),t.join("")}function Yn(e){let s=(Array.isArray(e.stats)?e.stats:[]).map(r=>`<span class="processing-stage-stat"><span>${n(r.label)}</span><strong>${n(r.value)}</strong></span>`),a=e.coverage;return a&&a.indexed!==null&&a.indexed!==void 0&&a.total!==null&&a.total!==void 0&&s.push(`<span class="processing-stage-stat"><span>\u7D22\u5F15\u8986\u84CB</span><strong>${u(a.indexed)} / ${u(a.total)}</strong></span>`),s.length?`<div class="processing-stage-stats">${s.join("")}</div>`:""}function Xn(e,{compact:t=!1,step:s=null}={}){let a=it(e.status),r=e.status==="running";return`<div class="processing-stage${t?" is-compact":""} is-${a.tone}${r?" is-live":""}" style="--stage-color:${n(Ke(e))}"${r?' aria-current="step"':""}>
    <div class="processing-stage-head">
      ${s===null?"":`<span class="processing-stage-step">${String(s).padStart(2,"0")}</span>`}
      <span class="processing-stage-swatch" style="background:${n(Ke(e))}"></span>
      <span class="processing-stage-label">${n(e.label||e.key)}</span>
      ${he(e.status)}
    </div>
    ${Lt(e)}
    <div class="processing-stage-meta">${Kn(e)}</div>
    ${e.message?`<div class="processing-stage-message" title="${n(e.message)}">${n(e.message)}</div>`:""}
    ${t?"":Yn(e)}
  </div>`}function na(e){let t=it(e);return`<span class="flow-status is-${t.tone}"><span class="flow-status-dot"></span>${n(t.label)}</span>`}function sa(e,t){return t==null||t===""?"\u2014":e.unit==="bytes"?pe(t):u(t)}function Zn(e){let t=[{label:"\u76EE\u524D",value:sa(e,e.current)},{label:"\u7E3D\u91CF",value:sa(e,e.total)},{label:"\u767E\u5206\u6BD4",value:e.percent===null||e.percent===void 0?e.status==="running"?"\u8A08\u7B97\u4E2D":"\u2014":Fe(e.percent)},{label:"\u8017\u6642",value:e.duration_ms?B(e.duration_ms):"\u2014"}],s=Array.isArray(e.stats)?e.stats:[];for(let r of s){if(t.length>=6)break;r&&r.label&&r.value&&t.push({label:String(r.label),value:String(r.value)})}let a=e.coverage;return a&&a.indexed!==null&&a.indexed!==void 0&&a.total!==null&&a.total!==void 0&&!t.some(r=>r.label==="\u7D22\u5F15\u8986\u84CB")&&t.push({label:"\u7D22\u5F15\u8986\u84CB",value:`${u(a.indexed)} / ${u(a.total)}`}),t}function er(e,t){let s=it(e.status),a=e.status==="running",r=Zn(e);return`<article class="flow-node is-${s.tone}${a?" is-live":""}" style="--stage-color:${n(Ke(e))}"${a?' aria-current="step"':""}>
    <div class="flow-node-head">
      <span class="flow-node-icon">${$(Jn[e.key]||"cube",14)}</span>
      <div class="flow-node-heading">
        <span class="flow-node-kicker">STEP ${String(t+1).padStart(2,"0")}</span>
        <strong>${n(Vn[e.key]||e.label||e.key)}</strong>
      </div>
      ${na(e.status)}
    </div>
    <div class="flow-node-body">
      ${Lt(e,"flow-progress")}
      <div class="flow-node-props">${r.map(i=>`<div class="flow-prop"><span>${n(i.label)}</span><strong>${n(i.value)}</strong></div>`).join("")}</div>
      ${e.message?`<div class="flow-node-note" title="${n(e.message)}">${n(e.message)}</div>`:""}
    </div>
  </article>`}function tr(e,t,s,a){let r=Ke(e),i=a||"#8b5cf6",o=e.status==="running",l=`${s}-${t}`,f=`flow-gradient-${l}`,b=`flow-marker-${l}`,g=t%2===0?"M2 60 C8 42 16 78 22 60":"M2 60 C8 78 16 42 22 60";return`<div class="flow-link${o?" is-live":""}" style="color:${n(r)}" aria-hidden="true">
    <svg viewBox="0 0 28 120" width="28" height="120" fill="none">
      <defs>
        <linearGradient id="${f}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="${n(i)}"/>
          <stop offset="1" stop-color="${n(r)}"/>
        </linearGradient>
        <marker id="${b}" viewBox="0 0 8 8" refX="6.2" refY="4" markerWidth="4.6" markerHeight="4.6" orient="auto">
          <path d="M0 0 8 4 0 8Z" fill="${n(r)}"/>
        </marker>
      </defs>
      <path class="flow-link-line" d="${g}" stroke="url(#${f})" stroke-width="1.7" stroke-linecap="round" marker-end="url(#${b})"/>
      <circle class="flow-link-port" cx="2" cy="60" r="3.6" stroke="${n(i)}" stroke-width="1.5"/>
      <circle class="flow-link-port" cx="26" cy="60" r="3.6" stroke="${n(r)}" stroke-width="1.5"/>
    </svg>
  </div>`}function ra(e){if(!e)return"";let t=[];return e.started_at&&t.push(`\u958B\u59CB ${ee(e.started_at)}`),e.duration_ms&&t.push(`\u8017\u6642 ${B(e.duration_ms)}`),e.pid&&t.push(`PID ${e.pid}`),t.join(" \xB7 ")}function sr(e,{active:t,focus:s,status:a,runLine:r,runningStage:i}){let o=e.label||aa[e.key]||e.key;return`<div class="flow-source${t?" is-live":""}" style="--branch-accent:${At[e.key]||At.system}">
    <div class="flow-source-head">
      <span class="flow-source-icon">${$(e.icon||"database",15)}</span>
      <div class="flow-node-heading">
        <span class="flow-node-kicker">SOURCE</span>
        <strong>${n(o)}</strong>
      </div>
      ${na(a)}
    </div>
    <div class="flow-source-body">
      <p class="flow-source-desc">${n(e.description||"")}</p>
      <div class="flow-source-meta">${r}</div>
      ${i?`<div class="flow-source-current"><span class="flow-current-dot"></span>\u76EE\u524D\u968E\u6BB5\uFF1A<strong>${n(i.label||i.key)}</strong></div>`:""}
      ${s&&s.message?`<div class="flow-source-note" title="${n(s.message)}">${n(s.message)}</div>`:""}
    </div>
  </div>`}function ar(e){let t=e.active_run,s=t||e.focus_run||e.last_run,a=t?"running":s?s.status:"idle",r=s?n(ra(s)||Ve(s.started_at||s.finished_at)):"\u5C1A\u7121\u57F7\u884C\u7D00\u9304",i=Array.isArray(e.stages)?e.stages:[],o=i.find(p=>p.status==="running"),l=At[e.key]||At.system,f=String(e.key||"branch").replace(/[^a-zA-Z0-9_-]/g,""),b=sr(e,{active:t,focus:s,status:a,runLine:r,runningStage:o}),g=i.length?i.map((p,h)=>{let x=h?Ke(i[h-1]):l;return`${tr(p,h,f,x)}${er(p,h)}`}).join(""):'<div class="flow-empty">\u6C92\u6709\u53EF\u986F\u793A\u7684\u968E\u6BB5\u3002</div>';return`<article class="flow-lane" style="--branch-accent:${l}"><div class="flow-row">${b}${g}</div></article>`}function nr(e){return`<div class="flow-canvas-open">
    <div class="processing-branches">${(Array.isArray(e.branches)?e.branches:[]).map(ar).join("")}</div>
  </div>`}function Oe(e,t,s="",a=""){return`<div class="processing-summary-card">
    <span class="processing-summary-label">${n(e)}</span>
    <span class="processing-summary-value">${t}</span>
    ${s?`<span class="processing-summary-hint">${s}</span>`:""}
    ${a}
  </div>`}function rr(e){let t=e.database||{},s=e.index||{},a=e.local_archives||{},r=e.raw_backups||{},i=r.totals||{},o=e.state||{},l=e.capabilities||{},f=e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D",b=t.status==="operational",g=s.status==="operational",p=a.available!==!1,h=r.available!==!1,x=g?`${u(s.indexed)} / ${u(s.total)}`:he(s.status||"unavailable"),_=g?`${Fe(s.percent)} \xB7 \u5C1A\u9918 ${u(s.remaining)} \u7B46`:n(s.error||"\u7121\u6CD5\u67E5\u8A62 Qdrant \u7D22\u5F15\u8986\u84CB\u7387\u3002"),E=p?`${u(a.unprocessed)} / ${u(a.total)}`:he("unavailable"),P=p?`\u672A\u8655\u7406 / \u5168\u90E8 \xB7 ${pe(a.unprocessed_bytes)} \u5F85\u8655\u7406`:n(a.error||"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304\u3002");return`<div class="processing-summary">
    ${Oe("\u8655\u7406\u72C0\u614B",he(e.status||"unknown"),`${n(f)} \xB7 \u66F4\u65B0\u65BC <span data-processing-updated-at>\u2014</span>`)}
    ${Oe("\u672A\u8655\u7406\u58D3\u7E2E\u6A94",n(E),P)}
    ${Oe("\u539F\u59CB Parquet \u5099\u4EFD",h?`${u(r.count)} \u6A94`:he("unavailable"),h?`\u5171 ${u(i.row_count)} \u7B46 \xB7 ${pe(i.compressed_bytes)}`:n(r.error||"\u7121\u6CD5\u6383\u63CF\u539F\u59CB Parquet \u5099\u4EFD\u3002"))}
    ${Oe("PostgreSQL \u5224\u6C7A",b?u(t.judgment_count):he("unavailable"),b?`\u6CD5\u898F ${ta(t.law_count)} \xB7 \u547D\u4EE4 ${ta(t.order_count)}`:n(t.error||"\u7121\u6CD5\u67E5\u8A62 PostgreSQL\u3002"))}
    ${Oe("Qdrant \u7D22\u5F15",x,_)}
    ${Oe("\u72C0\u614B\u6A94",he(o.status||"missing"),o.updated_at?`\u66F4\u65B0\u65BC ${n(ee(o.updated_at))}`:n(o.detail||"\u5C1A\u7121\u8655\u7406\u72C0\u614B\u7D00\u9304\u3002"))}
    ${Oe("\u5F85\u8655\u7406\u5DE5\u4F5C",l.can_start_update===!1?"\u66AB\u505C\u555F\u52D5":"\u53EF\u958B\u59CB\u66F4\u65B0",l.start_blocked_reason?n(l.start_blocked_reason):`\u672A\u8655\u7406 ${u(l.unprocessed_archives)} \u500B \xB7 \u7D22\u5F15\u5F85\u88DC ${u(l.index_backlog)} \u7B46${l.external_processes?` \xB7 \u5916\u90E8\u7A0B\u5E8F ${u(l.external_processes)} \u500B`:""}`)}
  </div>`}function ir(e){if(e.available===!1)return G({tone:"warn",title:"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304",text:n(e.error||"\u7121\u6CD5\u6383\u63CF .rar \u6A94\u6848\u3002")});let t=Number(e.total)||0,s=Number(e.processed)||0,a=Number(e.unprocessed)||0,r=t?100*s/t:null;return`<div class="processing-archive-summary">
    <div class="processing-archive-summary-head">
      <span class="mono">${n(e.data_dir||"")}</span>
      <span>${u(s)} / ${u(t)} \u5DF2\u8655\u7406 \xB7 ${u(a)} \u5F85\u8655\u7406 \xB7 ${pe(e.unprocessed_bytes)} \u5F85\u8655\u7406</span>
    </div>
    ${Lt({percent:r,status:a?"pending":"success",color:"var(--success)"},"processing-bar-lg")}
    <div class="processing-archive-summary-meta">
      <span>\u58D3\u7E2E\u6A94\u532F\u5165\u8986\u84CB ${Fe(r)}</span>
      <span>\u5168\u90E8 ${pe(e.total_bytes)}</span>
    </div>
  </div>`}function or(e){let t=e.stages||{},a=["extract","filter","postgres"].map(r=>t[r]).filter(Boolean).map(r=>Xn(r,{compact:!0}));return a.length?`<div class="processing-archive-stages">${a.join("")}</div>`:""}function lr(e){let t=e.status||"pending",s=t==="running",a=e.percent===null||e.percent===void 0?null:Math.max(0,Math.min(100,Number(e.percent)||0)),r=s&&a===null,i=[];return e.message&&i.push(e.message),e.error&&i.push(e.error),(e.scanned||e.matched||e.stored)&&i.push(`\u6383\u63CF ${u(e.scanned)} \xB7 \u547D\u4E2D ${u(e.matched)} \xB7 \u5BEB\u5165 ${u(e.stored)}`),`<div class="processing-archive is-${it(t).tone}">
    <div class="processing-archive-head">
      <span class="processing-archive-name mono">${n(e.name)}</span>
      <div class="processing-archive-bar-wrap">
        ${Lt({percent:a,status:t,color:s?"var(--accent)":"var(--success)"})}
      </div>
      <span class="processing-archive-percent mono">${r?"\u9032\u884C\u4E2D":Fe(a)}</span>
      ${he(t)}
      <span class="processing-archive-size faint">${pe(e.size_bytes)}</span>
    </div>
    ${or(e)}
    ${i.length?`<div class="processing-archive-note">${i.map(o=>`<span>${n(o)}</span>`).join("")}</div>`:""}
  </div>`}function cr(e){let t=e.archives||{},s=e.local_archives||{},a=Array.isArray(t.items)?t.items:[],r=t.run,i=`<div class="report-section-head">
    <div>
      <div class="report-kicker">ARCHIVE PIPELINE</div>
      <h2 class="report-section-title">\u5224\u6C7A\u58D3\u7E2E\u6A94</h2>
      <p class="processing-section-sub">\u6BCF\u500B\u58D3\u7E2E\u6A94\u540D\u7A31\u5F8C\u65B9\u5373\u6642\u986F\u793A\u8655\u7406\u9032\u5EA6\uFF1B\u672A\u53D6\u5F97\u53EF\u8A08\u7B97\u7684\u7E3D\u91CF\u6642\u6A19\u793A\u300C\u9032\u5EA6\u672A\u77E5\u300D\uFF0C\u4E0D\u4EE5\u63A8\u6E2C\u6578\u503C\u4EE3\u66FF\u3002</p>
    </div>
  </div>`,o=t.source==="run"?`${he(r?r.status:"idle")} <span>\u76EE\u524D\u986F\u793A ${r?n(r.title||"\u5224\u6C7A\u532F\u5165"):"\u6700\u8FD1\u4E00\u6B21\u532F\u5165"} \u7684\u9010\u6A94\u9032\u5EA6${r&&r.started_at?` \xB7 ${n(ra(r))}`:""}</span>`:t.external?`${he("running")} <span>${n(t.note||"\u5916\u90E8\u532F\u5165\u7A0B\u5E8F\u672A\u5BEB\u5165\u9010\u6A94\u72C0\u614B\uFF1B\u4EE5\u4E0B\u70BA PostgreSQL \u8986\u84CB\u7387\u3002")}</span>`:'<span class="faint">\u76EE\u524D\u6C92\u6709\u53EF\u8B80\u53D6\u7684\u532F\u5165 run \u72C0\u614B\uFF1B\u4EE5\u4E0B\u4EE5 PostgreSQL \u7684 source_archive \u5224\u5B9A\u662F\u5426\u5DF2\u8655\u7406\u3002</span>';return`<section class="report-card processing-card">
    <div class="report-head">${i}</div>
    <div class="report-section">
      ${ir(s)}
      <div class="processing-archive-run">${o}</div>
      ${a.length?`<div class="processing-archive-list">${a.map(lr).join("")}</div>`:`<div class="processing-empty">\u627E\u4E0D\u5230 .rar \u58D3\u7E2E\u6A94\uFF1B\u8ACB\u78BA\u8A8D ${n(s.data_dir||"\u5224\u6C7A\u8CC7\u6599\u76EE\u9304")}\u3002</div>`}
    </div>
  </section>`}function dr(e){let t=e.timeline||{},s=Array.isArray(t.stages)?t.stages:[],a=`<div class="report-section-head">
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
    </section>`;let r=s.map(o=>`<span class="processing-stack-segment" style="width:${Math.max(0,Number(o.percent)||0)}%;background:${n(o.color||"var(--accent)")}" title="${n(`${o.label} ${B(o.duration_ms)} (${Fe(o.percent)})`)}"></span>`).join(""),i=s.map(o=>`<div class="processing-legend-item">
        <span class="processing-legend-swatch" style="background:${n(o.color||"var(--accent)")}"></span>
        <span class="processing-legend-label">${n(o.label)}</span>
        <span class="mono">${B(o.duration_ms)}</span>
        <span class="processing-legend-percent mono">${Fe(o.percent)}</span>
        ${he(o.status)}
      </div>`).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section">
      <div class="processing-timeline-label">
        <span>${n(t.label||"\u968E\u6BB5\u8017\u6642")}</span>
        <span class="mono">\u7E3D\u8A08 ${B(t.total_ms)}</span>
      </div>
      <div class="processing-stack" role="img" aria-label="\u968E\u6BB5\u8017\u6642\u6BD4\u4F8B">${r}</div>
      <div class="processing-legend">${i}</div>
    </div>
  </section>`}function ur(e){let t=Array.isArray(e.recent_runs)?e.recent_runs:[],s=new Map((e.branches||[]).map(i=>[i.key,i.label])),a=`<div class="report-section-head">
    <div>
      <div class="report-kicker">RECENT RUNS</div>
      <h2 class="report-section-title">\u6700\u8FD1\u8655\u7406\u7D00\u9304</h2>
      <p class="processing-section-sub">\u5305\u542B\u8CC7\u6599\u66F4\u65B0\u3001\u5224\u6C7A\u532F\u5165\u3001Parquet\u3001Qdrant \u8207\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E0B\u8F09\u3002</p>
    </div>
  </div>`;if(!t.length)return`<section class="report-card processing-card">
      <div class="report-head">${a}</div>
      <div class="report-section"><div class="processing-empty">\u5C1A\u7121\u8655\u7406\u7D00\u9304\u3002</div></div>
    </section>`;let r=t.map(i=>{let o=s.get(i.branch)||aa[i.branch]||i.branch||"\u2014";return`<div class="processing-run">
        <div class="processing-run-head">
          <span class="badge badge-neutral">${n(o)}</span>
          <strong>${n(i.title||"\u8655\u7406")}</strong>
          ${he(i.status)}
          <span class="grow"></span>
          <span class="mono faint">${n(ee(i.finished_at||i.started_at))}</span>
          <span class="mono">${i.duration_ms?B(i.duration_ms):"\u2014"}</span>
        </div>
        ${i.message?`<div class="processing-run-message">${n(i.message)}</div>`:""}
      </div>`}).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section"><div class="processing-run-list">${r}</div></div>
  </section>`}function pr(e){let t=Array.isArray(e.notices)?e.notices:[];return t.length?`<div class="processing-notices">${t.map(s=>G({tone:s.tone||"info",title:s.title,text:n(s.message||"")})).join("")}</div>`:""}function mr(e){return`${pr(e)}
    ${rr(e)}
    <section class="processing-flow-section">
      <div class="processing-section-head">
        <div>
          <div class="report-kicker">PIPELINE CANVAS</div>
          <h2 class="report-section-title">\u8655\u7406\u6D41\u7A0B</h2>
          <p class="processing-section-sub">\u5224\u6C7A\u3001\u6CD5\u898F\u3001\u547D\u4EE4\u4E09\u689D\u6D41\u7A0B\u5373\u6642\u53CD\u6620\u76EE\u524D\u57F7\u884C\u968E\u6BB5\uFF1B\u66F2\u7DDA\u7531\u4F86\u6E90\u7BC0\u9EDE\u9023\u5230\u5404\u968E\u6BB5\uFF0C\u767C\u5149\u7BC0\u9EDE\u8207\u6D41\u52D5\u66F2\u7DDA\u8868\u793A\u76EE\u524D\u57F7\u884C\u4F4D\u7F6E\u3002</p>
        </div>
      </div>
      ${nr(e)}
    </section>
    ${cr(e)}
    ${dr(e)}
    ${ur(e)}`}function vr(e,t){return`<div class="report-card processing-card">
    <div class="report-section">
      ${G({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B",text:n(e||"\u672A\u77E5\u932F\u8AA4")})}
      ${t?`<p class="processing-section-sub">\u4E0A\u6B21\u6210\u529F\u66F4\u65B0\uFF1A${n(ee(t.generated_at))}\u3002\u756B\u9762\u4E0A\u6C92\u6709\u986F\u793A\u66FF\u4EE3\u6216\u63A8\u6E2C\u7684\u9032\u5EA6\u3002</p>`:""}
      <div class="processing-error-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh">
          ${$("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
  </div>`}async function fr(e){e.innerHTML=`<section class="page processing-page">
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
    <div id="processing-root">
      <div class="processing-loading" role="status">
        <span class="spinner" aria-hidden="true"></span>
        <span>\u6B63\u5728\u8B80\u53D6\u8655\u7406\u72C0\u614B\u2026</span>
      </div>
    </div>
  </section>`;let t=e.querySelector(".processing-page"),s=e.querySelector("#processing-root"),a=e.querySelector("#processing-update"),r=e.querySelector("#processing-stop"),i=e.querySelector("#processing-refresh"),o=e.querySelector("#processing-index-toggle"),l=!1,f=!1,b=!1,g=null,p="",h=null,x=A=>{let T=A.capabilities||{},q=!!(o&&o.checked),N=q?T.can_start_update_with_index!==!1:T.can_start_update!==!1,W=q&&T.index_blocked_reason||T.start_blocked_reason;if(!b){a.disabled=!N,a.title=W||"\u6AA2\u67E5\u7DDA\u4E0A\u6CD5\u898F\uFF0F\u547D\u4EE4\uFF0C\u4E26\u8655\u7406\u672A\u532F\u5165\u7684\u5224\u6C7A\u58D3\u7E2E\u6A94\u3002";let R=a.querySelector("[data-update-label]");R&&(R.textContent=N?"\u8CC7\u6599\u66F4\u65B0":T.active_update_id?"\u66F4\u65B0\u57F7\u884C\u4E2D":"\u8655\u7406\u7A0B\u5E8F\u57F7\u884C\u4E2D"),r.hidden=!T.can_stop_update,o&&(o.disabled=T.can_start_update===!1)}},_=async({silent:A=!1}={})=>{if(!(l||f)){f=!0,A||Q(i,!0,"\u66F4\u65B0\u4E2D\u2026");try{let T=await F.processing();if(l)return;g=T;let q=mr(T);q!==p&&(s.innerHTML=q,p=q);let N=s.querySelector("[data-processing-updated-at]");if(N){let W=ee(T.generated_at);N.textContent!==W&&(N.textContent=W)}x(T)}catch(T){if(l)return;let q=vr(T.message,g);q!==p&&(s.innerHTML=q,p=q),A||O(T.message||"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B\u3002","danger",6e3)}finally{f=!1,A||Q(i,!1)}}},E=async A=>{if(!b){b=!0,Q(A,!0,"\u555F\u52D5\u4E2D\u2026");try{let T=!!(o&&o.checked),q=await F.startProcessingUpdate(T);O(`\u5DF2\u555F\u52D5\u8CC7\u6599\u66F4\u65B0${T?"\uFF0C\u5B8C\u6210\u5F8C\u63A5\u7E8C Qdrant \u7D22\u5F15":""}\u3002`,"ok",6e3),q&&q.run_id&&console.info("processing update started",q),await _({silent:!0})}catch(T){O(T.message||"\u7121\u6CD5\u555F\u52D5\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{b=!1,Q(A,!1),g&&x(g)}}},P=async A=>{if(!b){b=!0,Q(A,!0,"\u505C\u6B62\u4E2D\u2026");try{let T=await F.stopProcessingUpdate();O(T.message||"\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info",6e3),await _({silent:!0})}catch(T){O(T.message||"\u7121\u6CD5\u505C\u6B62\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{b=!1,Q(A,!1),g&&x(g)}}},C=A=>{let T=A.target.closest("[data-processing-action]");if(!T||T.disabled)return;let q=T.dataset.processingAction;q==="refresh"?_({silent:!1}):q==="update"?E(T):q==="stop"&&P(T)},y=A=>{A.target===o&&g&&x(g)};return t.addEventListener("click",C),o&&o.addEventListener("change",y),await _({silent:!1}),h=window.setInterval(()=>{document.hidden||_({silent:!0})},Gn),()=>{l=!0,h!==null&&window.clearInterval(h),t.removeEventListener("click",C),o&&o.removeEventListener("change",y)}}var cs={};Qe(cs,{render:()=>_r});function Tt(e){if(e==null||e==="")return"\u2014";let t=Number(e);return Number.isFinite(t)?`${t.toFixed(t>=10?1:2)}%`:"\u2014"}function ia(e){return e==null?"\u2014":u(e)}function gr(e){return e.count?e.severity==="danger"?V("failed","\u9700\u8655\u7406"):e.severity==="warn"?V("warning","\u6CE8\u610F"):V("preview","\u63D0\u793A"):V("success","\u901A\u904E")}function hr(e){return e.count?e.severity==="danger"?"is-danger":e.severity==="warn"?"is-warn":"is-info":"is-ok"}function br(e){let t=Number(e.count)||0,s=Math.max(0,Math.min(100,Number(e.percent)||0));return`<div class="quality-check ${hr(e)}">
    <div class="quality-check-head">
      <span class="quality-check-label">${n(e.label)}</span>
      ${gr(e)}
    </div>
    <div class="quality-check-value">
      <strong>${u(t)}</strong>
      <span>\u7B46</span>
      <em>${n(Tt(e.percent))}</em>
    </div>
    <div class="quality-check-desc">${n(e.description)}</div>
    <div class="quality-check-track" aria-hidden="true">
      <span style="width:${s}%"></span>
    </div>
  </div>`}function Mt(e,t,s){let a=Array.isArray(s)?s:[];if(!a.length)return`<div class="index-chart-card">
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
  </div>`}function yr(e){let t=e.coverage||{},s=e.totals||{},a=e.source||{},r=t.postgres_diff,i=r==null?"\u2014":r===0?"\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u4E00\u81F4":`\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u76F8\u5DEE ${u(Math.abs(r))} \u7B46`,o=t.vector_indexed===null||t.vector_indexed===void 0?t.detail||"\u7121\u6CD5\u53D6\u5F97\u7D22\u5F15\u7D71\u8A08":`${u(t.vector_indexed)} / ${u(t.vector_total)} \xB7 ${t.model||"\u2014"}`;return`<div class="metric-grid quality-coverage-grid">
    <div class="metric-card">
      <div class="metric-label">${$("filter",13)}<span>\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D</span></div>
      <div class="metric-value">${u(s.matched_rows)}</div>
      <div class="metric-foot">citation_count &gt; 0\uFF1B\u5171 ${u(s.citation_total)} \u7B46\u5F15\u7528</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${$("database",13)}<span>PostgreSQL \u6536\u9304</span></div>
      <div class="metric-value">${ia(t.postgres_judgments)}</div>
      <div class="metric-foot">${n(i)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${$("brain",13)}<span>\u5411\u91CF\u7D22\u5F15</span></div>
      <div class="metric-value">${n(Tt(t.vector_coverage_pct))}</div>
      <div class="metric-foot">${n(o)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${$("layers",13)}<span>DuckDB \u5019\u9078</span></div>
      <div class="metric-value">${ia(a.candidate_total)}</div>
      <div class="metric-foot">${u(a.candidate_archive_count)} / ${u(a.archive_count)} \u500B manifest \u6709 candidate_count</div>
    </div>
  </div>`}function $r(e){return e.length?`<div class="table-wrap">
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
              <td class="cell-number">${n(Tt(t.match_rate))}</td>
              <td class="cell-number">${u(t.short_text_rows)}</td>
              <td class="cell-number">${u(s)}</td>
              <td class="cell-number">${u(t.duplicate_content_rows)}</td>
              <td class="cell-date">${n(_e(t.date_min))} \u2013 ${n(_e(t.date_max))}</td>
            </tr>`}).join("")}
      </tbody>
    </table>
  </div>`:me({iconName:"table",title:"\u6C92\u6709\u539F\u59CB Parquet \u6A94\u6848",text:"\u5B8C\u6210\u5224\u6C7A RAR \u532F\u5165\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6BCF\u500B\u58D3\u7E2E\u6A94\u7684 DuckDB \u7D71\u8A08\u3002"})}function wr(e){let t=e.totals||{},s=e.source||{},a=Array.isArray(e.checks)?e.checks:[],r=e.summary||{},i=e.distributions||{},o=Array.isArray(e.warnings)?e.warnings:[],l=pe(s.compressed_bytes||0);return`<div class="report-card quality-report" data-database="quality">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">DUCKDB DATA QUALITY</div>
        <div class="report-title">
          \u539F\u59CB Parquet \u8CC7\u6599\u54C1\u8CEA ${V(e.status||"operational")}
          <span class="chip">raw.parquet</span>
        </div>
        <div class="report-sub">
          ${u(t.rows)} \u7B46 \xB7 ${u(s.raw_files)} \u500B\u6A94\u6848 \xB7
          ${l} \xB7 \u6383\u63CF ${B(e.scan_ms||0)} \xB7
          ${n(ee(e.generated_at))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-quality">
          ${$("download",14)}<span>JSON</span>
        </button>
      </div>
    </div>
    ${o.length?`<div class="report-alert">${G({tone:"warn",title:"\u76EE\u524D\u9650\u5236\u8207\u5DEE\u7570",text:o.map(f=>n(f)).join("<br>")})}</div>`:""}
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
        <div class="summary-value">${n(Tt(t.match_rate))}</div>
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
      <div class="quality-checks">${a.map(br).join("")}</div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6536\u9304\u8986\u84CB</span>
        <span class="muted" style="font-size:9.5px">PostgreSQL \u8207\u5411\u91CF\u7D22\u5F15\u70BA\u5373\u6642\u67E5\u8A62\uFF0C\u4E0D\u662F\u5F9E Parquet \u63A8\u4F30</span>
      </div>
      ${yr(e)}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6A94\u6848\u660E\u7D30</span>
        <span class="muted" style="font-size:9.5px">${u(s.archive_count)} \u500B\u539F\u59CB Parquet</span>
      </div>
      ${$r(Array.isArray(e.archives)?e.archives:[])}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u5206\u5E03\u7D71\u8A08</span>
        <span class="muted" style="font-size:9.5px">DuckDB group by / unnest</span>
      </div>
      <div class="quality-dist-grid">
        ${Mt("\u6CD5\u9662","\u5224\u6C7A\u7B46\u6578",i.courts)}
        ${Mt("\u88C1\u5224\u5E74\u4EFD","\u5224\u6C7A\u7B46\u6578",i.years)}
        ${Mt("\u71B1\u9580\u6CD5\u898F","\u63D0\u53CA\u5224\u6C7A\u6578",i.laws)}
        ${Mt("\u71B1\u9580\u6848\u7531","\u5224\u6C7A\u7B46\u6578",i.titles)}
      </div>
    </div>
  </div>`}async function _r(e){e.innerHTML=`<section class="page data-page quality-page">
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
  </section>`;let t=e.querySelector("#quality-content"),s=e.querySelector("#quality-refresh"),a=e.querySelector("#quality-meta"),r=null,i=()=>{r&&(t.innerHTML=wr(r),a.textContent=`DUCKDB \xB7 ${u(r.totals?.rows)} \u7B46 \xB7 ${B(r.scan_ms||0)}`)},o=async()=>{Q(s,!0,"\u6383\u63CF\u4E2D\u2026");try{r=await F.quality(),i()}catch(l){t.innerHTML=`<div class="report-card">
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
      </div>`,a.textContent="DUCKDB \xB7 \u8B80\u53D6\u5931\u6557",O("\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}finally{Q(s,!1)}};s.addEventListener("click",o),t.addEventListener("click",l=>{!l.target.closest("[data-action='export-quality']")||!r||je(`judgment-quality-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(r,null,2),"application/json;charset=utf-8")}),await o()}var ds={};Qe(ds,{render:()=>Cr});var oa={frontend:"browser",backend:"server",database:"database",storage:"layers",vector:"cube",ai:"brain",default:"cpu"};var kr={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90"};function xr(e){return e==="operational"?{label:"\u6838\u5FC3\u670D\u52D9\u6B63\u5E38",tone:"ok",headline:"\u6838\u5FC3\u8CC7\u6599\u7BA1\u7DDA\u904B\u4F5C\u4E2D",copy:"FastAPI\u3001PostgreSQL \u8207 Parquet \u5747\u53EF\u5B58\u53D6\u3002Qdrant\u3001Embedding \u8207 LLM \u6703\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u8A2D\u5B9A\u6216\u964D\u7D1A\u6642\u4E0D\u5F71\u97FF\u8CC7\u6599\u700F\u89BD\u8207\u67E5\u8A62\u5831\u8868\u3002"}:e==="degraded"?{label:"\u90E8\u5206\u670D\u52D9\u964D\u7D1A",tone:"warn",headline:"\u90E8\u5206\u670D\u52D9\u9700\u8981\u8A2D\u5B9A\u6216\u4FEE\u5FA9",copy:"\u6838\u5FC3\u8CC7\u6599\u670D\u52D9\u76EE\u524D\u672A\u5B8C\u5168\u53EF\u7528\u3002\u8ACB\u67E5\u770B\u4E0B\u65B9\u670D\u52D9\u5361\u7247\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u7684\u57F7\u884C\u7D00\u9304\uFF0C\u78BA\u8A8D PostgreSQL\u3001Parquet \u6216\u5916\u90E8\u670D\u52D9\u72C0\u614B\u3002"}:{label:Ee(e).label,tone:Ee(e).tone,headline:"\u76EE\u524D\u7121\u6CD5\u78BA\u8A8D\u7CFB\u7D71\u72C0\u614B",copy:"\u72C0\u614B API \u56DE\u50B3\u4E86\u975E\u9810\u671F\u7D50\u679C\u3002\u8ACB\u91CD\u65B0\u6574\u7406\uFF0C\u6216\u76F4\u63A5\u6AA2\u67E5 FastAPI \u670D\u52D9\u65E5\u8A8C\u3002"}}function Sr(e){let t=Ee(e.status),s=oa[e.kind]||oa.default,a=e.latency_ms===null||e.latency_ms===void 0?"":`<span class="service-latency">${u(e.latency_ms)} ms</span>`;return`<article class="service-card">
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
  </article>`}function Ar(e,t){return`<div class="arch-node ${e?"":"is-muted"}" ${e?"":'title="\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165"'}>${n(t)}</div>`}function Lr(e,t){if(e==="IndexedDB")return As();let a={PostgreSQL:"postgres",Parquet:"parquet",Qdrant:"qdrant",Embedding:"embedding",Retriever:"rag","RAG Engine":"rag",LLM:"llm"}[e];return a?t.find(i=>i.id===a)?.status==="operational":!0}function Mr(e,t){let s=e?.layers||[];if(!s.length)return'<div class="report-empty-inline">\u72C0\u614B API \u672A\u63D0\u4F9B\u67B6\u69CB\u8CC7\u6599\u3002</div>';let a=s.map(i=>{let o=(i.nodes||[]).map(l=>Ar(Lr(l,t),l)).join("");return`<div class="arch-layer">
      <div class="arch-layer-label">${n(i.label||i.id)}</div>
      <div class="arch-nodes">${o}</div>
    </div>`}),r=[];return a.forEach((i,o)=>{o&&r.push(`<div class="arch-arrow" aria-hidden="true">${$("arrowRight",15)}</div>`),r.push(i)}),`<div class="arch-flow">${r.join("")}</div>
    <div class="arch-legend">
      <span><i class="legend-key is-live"></i>\u5DF2\u63A5\u5165\u4E14\u72C0\u614B\u6B63\u5E38</span>
      <span><i class="legend-key is-off"></i>\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165</span>
      <span>${$("info",12)} \u7BC0\u9EDE\u72C0\u614B\u4F86\u81EA\u4E3B\u670D\u52D9\u5065\u5EB7\u6AA2\u67E5</span>
    </div>`}function Tr(e){return!Array.isArray(e)||!e.length?'<div class="report-empty-inline">\u6C92\u6709\u7AEF\u9EDE\u8CC7\u8A0A\u3002</div>':`<div class="endpoint-list">
    ${e.map(t=>`<div class="endpoint-row">
          <span class="endpoint-method">${n(t.method)}</span>
          <span class="endpoint-path" title="${n(t.path)}">${n(t.path)}</span>
          <span class="endpoint-label">${n(t.label||"")}</span>
        </div>`).join("")}
  </div>`}function Ye(e,t){return`<div class="detail-row">
    <span class="detail-label">${n(e)}</span>
    <span class="detail-value">${t}</span>
  </div>`}function qr(e){return e?`<div class="detail-list">
    ${Ye("\u7248\u672C ID",`<strong>#${u(e.id)}</strong>`)}
    ${Ye("\u8CC7\u6599\u985E\u578B",V("operational",e.source_type==="law"?"\u6CD5\u898F":"\u547D\u4EE4"))}
    ${Ye("\u4F86\u6E90\u66F4\u65B0\u65E5",`<strong>${n(e.update_date||"\u2014")}</strong>`)}
    ${Ye("\u6CD5\u898F / \u689D\u6587",`<strong>${u(e.law_count)} / ${u(e.article_count)}</strong>`)}
    ${Ye("\u4E0B\u8F09\u6642\u9593",`<span class="mono">${ee(e.downloaded_at)}</span>`)}
    ${Ye("Parquet",`<code title="${n(e.parquet_path||"")}">${n(e.parquet_path||"\u2014")}</code>`)}
  </div>`:'<div class="report-empty-inline">\u5C1A\u672A\u532F\u5165\u4EFB\u4F55\u8CC7\u6599\u7248\u672C\u3002</div>'}function Er(e){if(!Array.isArray(e)||!e.length)return me({iconName:"history",title:"\u5C1A\u7121\u4E0B\u8F09\u57F7\u884C\u7D00\u9304",text:"\u57F7\u884C judgment-law-download \u5F8C\uFF0C\u6210\u529F\u3001\u7121\u8B8A\u66F4\u8207\u5931\u6557\u7684\u7D50\u679C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"});let t=[{key:"id",label:"Run",type:"number"},{key:"source_type",label:"\u985E\u578B",type:"source"},{key:"status",label:"\u72C0\u614B",type:"status"},{key:"started_at",label:"\u958B\u59CB\u6642\u9593",type:"datetime"},{key:"duration_ms",label:"\u8017\u6642",type:"duration"},{key:"law_count",label:"\u6CD5\u898F",type:"number"},{key:"article_count",label:"\u689D\u6587",type:"number"},{key:"error_message",label:"\u932F\u8AA4",type:"longtext"}];return`<div class="table-wrap" style="border-top:0;max-height:340px">
    <table class="data-table runs-table">
      <thead><tr>${t.map(s=>`<th scope="col">${n(s.label)}</th>`).join("")}</tr></thead>
      <tbody>
        ${e.map(s=>`<tr>${t.map(a=>`<td>${pt(s[a.key],a.type)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </div>`}function jr(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=xr(e.status),r=e.architecture||{},i=s.find(x=>x.id==="qdrant"),o=s.find(x=>x.id==="rag"),l=s.find(x=>x.id==="llm"),f=Je(),b=kr[f]||f,g=we("/api/docs"),p=we("/api/openapi.json"),h=we("/api/status");return`<section class="status-hero">
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
          <span>${$("clock",11)} \u6AA2\u67E5\u6642\u9593 ${ee(e.checked_at)} \xB7 ${n(Ve(e.checked_at))}</span>
          <span>${$("server",11)} ${s.length} \u500B\u670D\u52D9\u5143\u4EF6</span>
          <span>${$("database",11)} ${u(t.total_current)} \u7B46\u73FE\u884C\u8CC7\u6599</span>
          <span>${$("layers",11)} ${u(t.parquet_files)} \u500B\u539F\u59CB Parquet</span>
          <span title="API \u4F4D\u5740\u4F86\u6E90\uFF1A${n(b)}">${$("link",11)} ${n(qe())}</span>
        </div>
      </div>
    </section>

    <div class="service-grid">${s.map(Sr).join("")}</div>

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
      ${Mr(r,s)}
    </div>

    <div class="status-columns">
      <section class="card">
        <div class="side-card-head">
          <span class="side-card-title">${$("terminal",14)}API \u7AEF\u9EDE</span>
          <a href="${n(g)}" target="_blank" rel="noopener noreferrer" class="chip"
            >OpenAPI ${$("external",11)}</a>
        </div>
        ${Tr(e.endpoints)}
        <div class="side-card-foot">
          \u76EE\u524D API Base\uFF1A<code>${n(qe())}</code>\uFF08${n(b)}\uFF09\u3002\u4E92\u52D5\u5F0F API \u6587\u4EF6\u4F4D\u65BC <a href="${n(g)}" target="_blank" rel="noopener noreferrer"><code>${n(g)}</code></a>\uFF0COpenAPI schema \u4F4D\u65BC <a href="${n(p)}" target="_blank" rel="noopener noreferrer"><code>${n(p)}</code></a>\u3002
        </div>
      </section>

      <section class="card">
        <div class="side-card-head">
          <span class="side-card-title">${$("layers",14)}\u6700\u65B0\u8CC7\u6599\u7248\u672C</span>
          ${V("operational","Parquet")}
        </div>
        ${qr(t.last_version)}
        <div class="side-card-foot">
          \u539F\u59CB Parquet \u5408\u8A08 ${pe(t.parquet_bytes)}\uFF1BPostgreSQL \u4FDD\u5B58 metadata \u8207\u7248\u672C\u72C0\u614B\u3002
        </div>
      </section>
    </div>

    <section class="card data-section" style="margin-top:16px">
      <div class="side-card-head">
        <span class="side-card-title">${$("history",14)}\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C</span>
        <span class="badge badge-neutral badge-mono">${u(t.run_count)} TOTAL</span>
      </div>
      ${Er(e.recent_runs)}
    </section>

    <p class="status-footnote">
      \u6B64\u9801\u76F4\u63A5\u547C\u53EB <code>GET ${n(h)}</code>\u3002\u670D\u52D9\u72C0\u614B\u3001\u8CC7\u6599\u7B46\u6578\u8207\u6700\u8FD1\u57F7\u884C\u7D00\u9304\u7686\u4F86\u81EA\u76EE\u524D\u7684
      PostgreSQL \u8207\u8CC7\u6599\u76EE\u9304\uFF1BQdrant\u3001Embedding\u3001RAG \u8207 LLM \u672A\u8A2D\u5B9A\u6642\u6703\u6A19\u793A\u70BA\u300C\u672A\u8A2D\u5B9A\u300D\uFF0C\u4E0D\u6703\u986F\u793A\u63A8\u6E2C\u6578\u64DA\u3002
    </p>`}function Nr(){return`<div class="status-hero">
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
    </div>`}function Pr(e){return`<div class="report-card">
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
          ${$("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}async function Cr(e,t){let s=!1,a=null,r=null;e.innerHTML=`<section class="page status-page">
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
          ${$("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
    <div id="status-content">${Nr()}</div>
  </section>`;let i=e.querySelector("#status-content"),o=e.querySelector("#refresh-status"),l=e.querySelector("#auto-refresh"),f=async({quiet:b=!1}={})=>{b||(o.disabled=!0,Q(o,!0,"\u6AA2\u67E5\u4E2D\u2026"));try{let g=await F.status();if(s)return;r=g,i.innerHTML=jr(g),typeof t?.refreshHeaderStatus=="function"&&t.refreshHeaderStatus();let p=i.querySelector("#status-retry");p&&p.addEventListener("click",()=>f()),b||O("\u670D\u52D9\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(g){if(s)return;i.innerHTML=Pr(g);let p=i.querySelector("#status-retry");p&&p.addEventListener("click",()=>f()),b||O(g.message||"\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002","danger")}finally{s||(o.disabled=!1,Q(o,!1))}};return o.addEventListener("click",()=>f()),l.addEventListener("change",()=>{a&&(window.clearInterval(a),a=null),l.checked&&(a=window.setInterval(()=>f({quiet:!0}),3e4),O("\u5DF2\u555F\u7528\u6BCF 30 \u79D2\u81EA\u52D5\u66F4\u65B0\u3002","info",2200))}),await f({quiet:!0}),t&&typeof t.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"),()=>{s=!0,a&&window.clearInterval(a)}}var la="rag",Nt={rag:{page:os,title:"RAG \u63D0\u554F \xB7 Judgment RAG Console"},data:{page:ns,title:"\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"},quality:{page:cs,title:"\u8CC7\u6599\u54C1\u8CEA \xB7 Judgment RAG Console"},performance:{page:is,title:"\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"},processing:{page:ls,title:"\u8CC7\u6599\u8655\u7406 \xB7 Judgment RAG Console"},status:{page:ds,title:"\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"}},qt=document.getElementById("app-main"),Et=null,jt=0,Pt=0,us=null,Ue=!1,Pe=!1,He={embedding:[],llm:[]};function Rr(){return`<div class="page-loading" aria-live="polite">
    <div class="skeleton skeleton-title"></div>
    <div class="skeleton skeleton-subtitle"></div>
    <div class="skeleton-grid">
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
    </div>
  </div>`}function ua(){let t=window.location.hash.replace(/^#\/?/,"").trim().split("/")[0]||la;return Object.prototype.hasOwnProperty.call(Nt,t)?t:la}function Ir(e){document.querySelectorAll("[data-route]").forEach(t=>{let s=t.dataset.route===e;t.classList.toggle("is-active",s),s?t.setAttribute("aria-current","page"):t.removeAttribute("aria-current")})}function Br(e){return`<section class="page">
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
  </section>`}async function ps(){let e=ua(),t=++jt;if(Ir(e),window.location.hash!==`#/${e}`&&window.history.replaceState(null,"",`#/${e}`),typeof Et=="function"){try{Et()}catch{}Et=null}document.title=Nt[e].title,qt.innerHTML=Rr(),qt.focus({preventScroll:!0}),window.scrollTo({top:0,behavior:"auto"});let s={route:e,navigate(a){Nt[a]&&(window.location.hash=`#/${a}`)},setTitle(a){t===jt&&a&&(document.title=a)},refreshHeaderStatus:Rt};try{let a=await Nt[e].page.render(qt,s);if(t!==jt){typeof a=="function"&&a();return}Et=typeof a=="function"?a:null}catch(a){if(t!==jt)return;console.error("Failed to render route",e,a),qt.innerHTML=Br(a);let r=document.getElementById("route-retry");r&&r.addEventListener("click",()=>ps()),O("\u9801\u9762\u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}}function Ct({enabled:e,busy:t=!1,label:s="",title:a}){let r=document.getElementById("header-status");if(!r)return;let i=r.querySelector(".header-status-label");Pe=e,r.classList.toggle("is-on",e),r.classList.toggle("is-off",!e),r.classList.toggle("is-busy",t),r.disabled=t,r.setAttribute("aria-checked",e?"true":"false"),r.setAttribute("aria-busy",t?"true":"false"),r.setAttribute("aria-label",t?s:e?"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF0C\u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\uFF0C\u9EDE\u64CA\u958B\u555F"),r.title=a,i&&(i.textContent=e?"ON":"OFF")}function pa(e){let t=Array.isArray(e?.embedding)?e.embedding.length:0,s=Array.isArray(e?.llm)?e.llm.length:0;return`${t} \u500B embedding \xB7 ${s} \u500B LLM`}async function Rt(){if(!document.getElementById("header-status")||Ue)return;let t=++Pt;try{let s=await F.testMode();if(t!==Pt||Ue)return;He=s.models||{embedding:[],llm:[]};let a=!!s.enabled,r=pa(He);Ct({enabled:a,title:`\u6E2C\u8A66\u6A21\u5F0F ${a?"ON":"OFF"} \xB7 ${r} \xB7 \u9EDE\u64CA\u5207\u63DB`})}catch{if(t!==Pt||Ue)return;Ct({enabled:!1,title:"\u5F8C\u7AEF\u96E2\u7DDA \xB7 \u7121\u6CD5\u8B80\u53D6\u6E2C\u8A66\u6A21\u5F0F\uFF1B\u8ACB\u78BA\u8A8D API"})}}function Dr(){let e=document.getElementById("header-status");e&&e.addEventListener("click",async()=>{if(Ue)return;let t=!Pe;Pt+=1,Ue=!0,Ct({enabled:Pe,busy:!0,label:t?"\u6B63\u5728\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u2026":"\u6B63\u5728\u95DC\u9589\u6E2C\u8A66\u6A21\u5F0F\u2026",title:t?"\u6B63\u5728\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u2026":"\u6B63\u5728\u95DC\u9589\u6E2C\u8A66\u6A21\u5F0F\u2026"});try{let s=await F.setTestMode(t);if(Ue=!1,Pe=!!s.enabled,He=s.models||{embedding:[],llm:[]},Ct({enabled:Pe,title:`\u6E2C\u8A66\u6A21\u5F0F ${Pe?"ON":"OFF"} \xB7 ${pa(He)} \xB7 \u9EDE\u64CA\u5207\u63DB`}),window.dispatchEvent(new CustomEvent("judgment:test-mode",{detail:{enabled:Pe,models:He}})),Pe){let a=He.embedding?.length||0,r=He.llm?.length||0;O(`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A\u6BCF\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C ${a} \u500B embedding \u8207 ${r} \u500B LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002`,"ok",7e3)}else O("\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","info")}catch(s){Ue=!1,await Rt(),O(s.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","danger",6e3)}})}var ca={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u6B64\u700F\u89BD\u5668\u5132\u5B58\u7684\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"};function Or(e){try{let t=new URL(e).hostname;return["localhost","127.0.0.1","::1","[::1]"].includes(t)}catch{return!1}}function Fr(e){return window.location.protocol==="https:"&&/^http:\/\//i.test(e)&&!Or(e)}function Hr(){let e=document.getElementById("api-config-trigger"),t=document.getElementById("dialog-root");if(!e||!t)return{open(){}};t.innerHTML=`<dialog class="api-dialog" id="api-dialog" aria-labelledby="api-dialog-title">
    <form class="api-dialog-form" id="api-dialog-form" novalidate>
      <div class="api-dialog-head">
        <span class="api-dialog-icon" aria-hidden="true">${$("link",17)}</span>
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
          ${$("activity",14)}<span>\u6E2C\u8A66\u9023\u7DDA</span>
        </button>
        <span class="grow"></span>
        <button class="btn btn-ghost btn-sm" type="button" id="api-reset">\u6062\u5FA9\u9810\u8A2D</button>
        <button class="btn btn-primary btn-sm" type="submit" id="api-save">
          ${$("check",14)}<span>\u5132\u5B58\u4E26\u91CD\u65B0\u8F09\u5165</span>
        </button>
      </div>
    </form>
  </dialog>`;let s=t.querySelector("#api-dialog"),a=t.querySelector("#api-dialog-form"),r=t.querySelector("#api-base-input"),i=t.querySelector("#api-dialog-preview"),o=t.querySelector("#api-dialog-status"),l=t.querySelector("#api-dialog-note"),f=t.querySelector("#api-dialog-close"),b=t.querySelector("#api-test"),g=t.querySelector("#api-reset"),p=t.querySelector("#api-save"),h=()=>Je()==="query",x=()=>{let q=Te(r.value);return q||(window.location.protocol==="file:"?Dt:"")},_=(q,N="")=>{o.textContent=q,o.className=`api-dialog-status${N?` is-${N}`:""}`},E=()=>{let q=x(),N=Ae();i.innerHTML=`\u76EE\u524D\u751F\u6548\uFF1A<strong>${n(qe(N))}</strong><br />
      \u6B64\u4F4D\u5740\u7684\u72C0\u614B\u8ACB\u6C42\uFF1A${n(we("/api/status",q))}`},P=()=>{let q=Ae(),N=Je();e.classList.toggle("is-custom",!!q),e.title=`\u5F8C\u7AEF API\uFF1A${qe(q)}\uFF08${ca[N]||N}\uFF09`},C=q=>{let N=Je(),W=`\u76EE\u524D\u4F86\u6E90\uFF1A${ca[N]||N}\u3002\u512A\u5148\u9806\u5E8F\u70BA ?api= \u2192 \u700F\u89BD\u5668\u5132\u5B58\u503C \u2192 config.js \u2192 \u540C\u6E90\u3002`,R="";N==="query"?(R="is-warn",W="\u6B64\u9801\u7531\u7DB2\u5740\u7684 ?api= \u53C3\u6578\u6307\u5B9A\u5F8C\u7AEF\u4F4D\u5740\uFF0C\u5177\u6709\u6700\u9AD8\u512A\u5148\u9806\u5E8F\u3002\u5132\u5B58\u6216\u6062\u5FA9\u9810\u8A2D\u5728\u6B64\u9801\u4E0D\u6703\u751F\u6548\uFF1B\u8ACB\u5148\u79FB\u9664\u7DB2\u5740\u4E2D\u7684 api \u53C3\u6578\u3002"):q==="hosted"&&zt()?(R="is-warn",W="\u6B64\u9801\u4E0D\u662F\u5F9E localhost \u958B\u555F\uFF0C\u4E14\u5C1A\u672A\u8A2D\u5B9A\u5F8C\u7AEF API\u3002\u8ACB\u586B\u5165 cloudflared \u7684 https:// \u4F4D\u5740\uFF0C\u6216\u90E8\u7F72\u6642\u5728 config.js \u6307\u5B9A apiBase\uFF1BHTTP \u4F4D\u5740\u6703\u88AB HTTPS \u9801\u9762\u963B\u64CB\u3002"):(N==="file-default"||window.location.protocol==="file:")&&(W="\u4EE5 file:// \u76F4\u63A5\u958B\u555F\u6642\uFF0C\u9810\u8A2D\u9023\u5230 http://127.0.0.1:9200\u3002\u82E5\u5F8C\u7AEF\u4F7F\u7528\u5176\u4ED6\u9023\u63A5\u57E0\uFF0C\u8ACB\u5728\u6B64\u4FEE\u6539\u4E26\u5132\u5B58\u3002"),l.textContent=W,l.className=`api-dialog-note${R?` ${R}`:""}`;let X=N==="query";p.disabled=X,g.disabled=X,r.readOnly=X},y=()=>{if(!Ot(r.value))return _("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002","error"),r.focus(),null;let q=x();return Fr(q)?(_("HTTPS \u9801\u9762\u7121\u6CD5\u9023\u7DDA\u5230 HTTP API\uFF08mixed content\uFF09\u3002\u8ACB\u6539\u7528 cloudflared \u63D0\u4F9B\u7684 https:// \u4F4D\u5740\u3002","error"),r.focus(),null):q},A=({reason:q=""}={})=>{s.open||(r.value=Ae(),E(),C(q),_("\u53EF\u5148\u6E2C\u8A66\u9023\u7DDA\uFF0C\u5132\u5B58\u5F8C\u9801\u9762\u6703\u91CD\u65B0\u8F09\u5165\u3002"),e.setAttribute("aria-expanded","true"),typeof s.showModal=="function"?s.showModal():s.setAttribute("open",""),r.focus(),r.select())},T=()=>{typeof s.close=="function"?s.close():s.removeAttribute("open"),e.setAttribute("aria-expanded","false"),e.focus()};return e.addEventListener("click",()=>A()),f.addEventListener("click",T),s.addEventListener("close",()=>{e.setAttribute("aria-expanded","false")}),s.addEventListener("click",q=>{q.target===s&&T()}),r.addEventListener("input",()=>{E(),_("\u5C1A\u672A\u6E2C\u8A66\u6B64\u4F4D\u5740\u3002")}),b.addEventListener("click",async()=>{let q=y();if(q!==null){Q(b,!0,"\u6E2C\u8A66\u4E2D\u2026"),_(`\u6B63\u5728\u9023\u7DDA\u5230 ${qe(q)}\u2026`);try{let N=await $s(q);_(`\u9023\u7DDA\u6210\u529F \xB7 v${N.version} \xB7 ${N.duration_ms} ms \xB7 GET ${we("/api/health",q)}`,"ok")}catch(N){_(N.message||"\u9023\u7DDA\u6E2C\u8A66\u5931\u6557\u3002","error")}finally{Q(b,!1)}}}),a.addEventListener("submit",q=>{if(q.preventDefault(),h())return;let N=y();N!==null&&(Gt(N),O(`\u5F8C\u7AEF API \u5DF2\u8A2D\u70BA ${qe(N)}\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026`,"ok",1600),window.setTimeout(()=>window.location.reload(),120))}),g.addEventListener("click",()=>{h()||(Gt(""),O("\u5DF2\u6E05\u9664\u700F\u89BD\u5668\u5132\u5B58\u7684 API \u4F4D\u5740\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026","info",1600),window.setTimeout(()=>window.location.reload(),120))}),P(),E(),{open:A,updateTrigger:P}}function Ur(){document.addEventListener("keydown",e=>{if(e.key!=="/"||e.metaKey||e.ctrlKey||e.altKey)return;let t=document.activeElement;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable)||ua()!=="rag")return;let a=document.getElementById("rag-question");a&&(e.preventDefault(),a.focus())})}function da(){Ss();let e=Hr();Dr(),Ur(),window.addEventListener("hashchange",ps),window.addEventListener("storage",t=>{t.key==="judgment.api_base"&&e.updateTrigger?.()}),us=window.setInterval(Rt,6e4),ps(),Rt(),zt()&&window.setTimeout(()=>e.open({reason:"hosted"}),700)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",da):da();window.addEventListener("beforeunload",()=>{us&&window.clearInterval(us)});})();
