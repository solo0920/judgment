(()=>{var ua=Object.defineProperty;var Qe=(e,t)=>{for(var s in t)ua(e,s,{get:t[s],enumerable:!0})};var Bt="judgment.api_base",Dt="http://127.0.0.1:9200",$e=class extends Error{constructor(t,s=0,a=null){super(t),this.name="ApiError",this.status=s,this.detail=a}};function gs(e){return["localhost","127.0.0.1","::1","[::1]"].includes(e)}function Me(e){let t=String(e??"").trim();if(!t||t==="/")return"";t=t.replace(/\/+$/,""),!/^https?:\/\//i.test(t)&&!t.startsWith("/")&&(t=`${gs(t.split(":")[0])?"http":"https"}://${t}`);try{let s=new URL(t,window.location.href);return s.protocol!=="http:"&&s.protocol!=="https:"?"":`${s.origin}${s.pathname==="/"?"":s.pathname.replace(/\/+$/,"")}`}catch{return t}}function Ft(e){let t=Me(e);if(!t)return!0;try{let s=new URL(t);return s.protocol==="http:"||s.protocol==="https:"}catch{return!1}}function Ot(){try{let e=new URLSearchParams(window.location.search);return e.has("api")?Me(e.get("api")):null}catch{return null}}function Ht(){try{let e=window.localStorage.getItem(Bt);return e===null?null:Me(e)}catch{return null}}function Ut(){let e=window.JUDGMENT_CONFIG&&window.JUDGMENT_CONFIG.apiBase;return Me(e||"")}function Te(){let e=Ot();if(e!==null)return e;let t=Ht();if(t!==null)return t;let s=Ut();return s||(window.location.protocol==="file:"?Dt:"")}function pa(){if(Ot()!==null)return!0;let e=Ht();return e!==null?!!e:!!Ut()}function Je(){return Ot()!==null?"query":Ht()!==null?"storage":Ut()?"config":window.location.protocol==="file:"?"file-default":"same-origin"}function zt(){return pa()||window.location.protocol==="file:"||!window.JUDGMENT_CONFIG?!1:!gs(window.location.hostname)}function Gt(e){let t=Me(e);try{t?window.localStorage.setItem(Bt,t):window.localStorage.removeItem(Bt)}catch{}return t}function qe(e=Te()){return e||"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"}function ye(e,t=Te()){return t?`${t}${e.startsWith("/")?e:`/${e}`}`:e}function hs(e){return`\u7121\u6CD5\u9023\u7DDA\u5230\u4F3A\u670D\u5668${e?`\uFF08${e}\uFF09`:""}\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u7AEF\u662F\u5426\u555F\u52D5\uFF0C\u6216\u9EDE\u9078 header \u7684\u300CAPI\u300D\u8A2D\u5B9A\u5F8C\u7AEF\u4F4D\u5740\u3002`}async function X(e,t={}){let s=Te(),a=new AbortController,r=t.timeout===void 0?3e4:t.timeout,i=r>0?window.setTimeout(()=>a.abort(),r):null,o=Date.now(),l=performance.now(),f=t.requestId||ma(),g={Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},"X-Judgment-Request-Id":f,"X-Judgment-Client-Started-At":String(o),...t.headers||{}},h;try{h=await fetch(ye(e,s),{...t,headers:g,signal:a.signal})}catch(j){throw j.name==="AbortError"?new $e("\u8ACB\u6C42\u903E\u6642\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",0,null):new $e(hs(s),0,j)}finally{i&&window.clearTimeout(i)}let m=null;if((h.headers.get("content-type")||"").includes("application/json"))try{m=await h.json()}catch{m=null}else try{m=await h.text()}catch{m=null}let M=performance.now(),k=h.headers.get("X-Judgment-Request-Id")||f;if(t.trackClient!==!1&&k){let j=Math.round(performance.now()-l);window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{va({request_id:k,route:`${window.location.pathname}${window.location.hash||""}`,total_ms:j,render_ms:Math.max(0,Math.round(performance.now()-M)),status:h.ok?"success":"failed"})})})}if(!h.ok){let j=m&&typeof m=="object"?m.detail||m.message:m,P=typeof j=="string"&&j?j:`\u4F3A\u670D\u5668\u56DE\u61C9 ${h.status}\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002`;throw new $e(P,h.status,j)}return m}function ma(){try{if(window.crypto&&typeof window.crypto.randomUUID=="function")return window.crypto.randomUUID().replace(/-/g,"").slice(0,32)}catch{}return`req${Date.now().toString(36)}${Math.random().toString(36).slice(2,10)}`}function va(e){try{fetch(ye("/api/performance/client",Te()),{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e),keepalive:!0}).catch(()=>{})}catch{}}async function bs(e){let t=Me(e);if(!Ft(t))throw new $e("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002");let s=performance.now(),a=new AbortController,r=window.setTimeout(()=>a.abort(),1e4);try{let i=await fetch(ye("/api/health",t),{headers:{Accept:"application/json"},signal:a.signal});if(!i.ok)throw new $e(`API \u56DE\u61C9 ${i.status}\u3002`,i.status);let o=await i.json();return{base:t,version:o.version||"\u2014",duration_ms:Math.round(performance.now()-s)}}catch(i){throw i instanceof $e?i:i.name==="AbortError"?new $e("\u9023\u7DDA\u6E2C\u8A66\u903E\u6642\uFF0C\u8ACB\u78BA\u8A8D API \u4F4D\u5740\u8207\u7DB2\u8DEF\u3002",0,i):new $e(hs(t),0,i)}finally{window.clearTimeout(r)}}var F={health(){return X("/api/health")},status(){return X("/api/status",{trackClient:!1})},catalog(){return X("/api/catalog")},query({database:e,filters:t,page:s=1,pageSize:a=25}){return X("/api/query",{method:"POST",body:JSON.stringify({database:e,filters:t,page:s,page_size:a})})},schemaSuggest({database:e,table:t,column:s,query:a,limit:r=1e3}){let i=new URLSearchParams({database:e,table:t,column:s,q:a||"",limit:String(r)});return X(`/api/schema/suggest?${i.toString()}`,{timeout:3e4})},lawDetail(e,t="",s=""){let a=new URLSearchParams({law_key:e});return t&&a.set("source_type",t),s&&a.set("version_id",String(s)),X(`/api/law?${a.toString()}`,{timeout:45e3})},judgmentDetail(e,t=""){let s=new URLSearchParams({jid:e});return t&&s.set("source",t),X(`/api/judgment?${s.toString()}`,{timeout:45e3})},testMode(){return X("/api/test-mode",{trackClient:!1})},setTestMode(e){return X("/api/test-mode",{method:"POST",body:JSON.stringify({enabled:!!e}),trackClient:!1})},testRuns(e=20){let t=new URLSearchParams({limit:String(e)});return X(`/api/test-runs?${t.toString()}`,{trackClient:!1})},testRunCurrent(){return X("/api/test-runs/current",{trackClient:!1})},testRun(e){return X(`/api/test-runs/${encodeURIComponent(e)}`,{trackClient:!1})},performanceOptions(){return X("/api/performance/options",{trackClient:!1})},performance(e={},t=1,s=25){let a=new URLSearchParams;for(let[r,i]of Object.entries(e))i==null||i===""||a.set(r,String(i));return a.set("page",String(t)),a.set("page_size",String(s)),X(`/api/performance?${a.toString()}`,{timeout:45e3,trackClient:!1})},quality(){return X("/api/quality",{timeout:18e4,trackClient:!1})},processing(){return X("/api/processing",{timeout:45e3,trackClient:!1})},processingPlan(){return X("/api/processing/plan",{timeout:45e3,trackClient:!1})},startProcessingUpdate(e=!1){return X("/api/processing/update",{method:"POST",body:JSON.stringify({index:!!e}),timeout:45e3,trackClient:!1})},stopProcessingUpdate(){return X("/api/processing/stop",{method:"POST",body:JSON.stringify({}),timeout:45e3,trackClient:!1})},rag(e,t={}){return X("/api/rag/query",{method:"POST",body:JSON.stringify({question:e}),timeout:t.testMode?0:3e5})}};var fa={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},ga={operational:{label:"\u6B63\u5E38",tone:"ok"},success:{label:"\u6210\u529F",tone:"ok"},ok:{label:"\u6B63\u5E38",tone:"ok"},healthy:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},warning:{label:"\u6CE8\u610F",tone:"warn"},empty:{label:"\u7121\u8CC7\u6599",tone:"warn"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},running:{label:"\u57F7\u884C\u4E2D",tone:"info"},pending:{label:"\u7B49\u5F85",tone:"idle"},skipped:{label:"\u7565\u904E",tone:"idle"},partial:{label:"\u90E8\u5206\u6210\u529F",tone:"warn"},preview:{label:"\u9810\u89BD\u6A21\u5F0F",tone:"info"},retrieval_only:{label:"\u50C5\u6AA2\u7D22\u7D50\u679C",tone:"warn"},not_indexed:{label:"\u5C1A\u672A\u7D22\u5F15",tone:"warn"},missing_query:{label:"\u7B49\u5F85\u67E5\u8A62",tone:"idle"},client_side:{label:"\u700F\u89BD\u5668\u7AEF",tone:"info"},not_configured:{label:"\u672A\u8A2D\u5B9A",tone:"idle"},unavailable:{label:"\u96E2\u7DDA",tone:"danger"},failed:{label:"\u5931\u6557",tone:"danger"},error:{label:"\u932F\u8AA4",tone:"danger"}},ha={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},ba={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},$s={search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',send:'<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',refresh:'<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 4v5.5H15"/>',copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',check:'<path d="m5 12 4.2 4.2L19 6.5"/>',x:'<path d="m6 6 12 12M18 6 6 18"/>',external:'<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/>',message:'<path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H6l-3 2 1.3-4.2A8.5 8.5 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',history:'<path d="M3.2 12a8.8 8.8 0 1 0 2.8-6.3L3.2 8.5"/><path d="M3 3.5v5h5"/><path d="M12 7.5V12l3 1.8"/>',database:'<ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/><path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/>',layers:'<path d="m12 3 9 4.8-9 4.8-9-4.8L12 3Z"/><path d="m3 12.2 9 4.8 9-4.8"/><path d="m3 16.7 9 4.8 9-4.8"/>',cube:'<path d="m12 2.8 8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4L12 2.8Z"/><path d="m3.8 7.4 8.2 4.6 8.2-4.6"/><path d="M12 12v9.2"/>',browser:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6.5 6.5h.01"/>',download:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',chevronLeft:'<path d="m14.5 5-7 7 7 7"/>',chevronRight:'<path d="m9.5 5 7 7-7 7"/>',chevronDown:'<path d="m5 9 7 7 7-7"/>',arrowRight:'<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',alert:'<path d="M12 3 2.5 20.5h19L12 3Z"/><path d="M12 9v4.5"/><path d="M12 17.5h.01"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',sparkles:'<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"/>',table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M9 9.5V20M15 9.5V20"/>',sliders:'<path d="M4 7h8M16 7h4M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',server:'<rect x="3" y="4" width="18" height="6" rx="1.6"/><rect x="3" y="14" width="18" height="6" rx="1.6"/><path d="M7 7h.01M7 17h.01"/>',brain:'<path d="M9.7 4.2a2.8 2.8 0 0 0-3 2.8 2.8 2.8 0 0 0-1.1 5.2A2.9 2.9 0 0 0 7.8 18a2.9 2.9 0 0 0 3.9 2V4.2a2.8 2.8 0 0 0-2 0Z"/><path d="M14.3 4.2a2.8 2.8 0 0 1 3 2.8 2.8 2.8 0 0 1 1.1 5.2A2.9 2.9 0 0 1 16.2 18a2.9 2.9 0 0 1-3.9 2"/>',cloud:'<path d="M7 18.5h10.5a3.5 3.5 0 0 0 .4-7 5.5 5.5 0 0 0-10.6-1.3A4.2 4.2 0 0 0 7 18.5Z"/>',code:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',play:'<path d="M7 4.5v15l13-7.5-13-7.5Z"/>',file:'<path d="M6 2.8h8l4.5 4.5v13.9H6V2.8Z"/><path d="M14 2.8V7.5h5"/>',activity:'<path d="M3 12h4l2.2-5 4.1 10 2.2-5H21"/>',shield:'<path d="M12 2.8 20 6v6c0 4.7-3.2 8-8 9.2C7.2 20 4 16.7 4 12V6l8-3.2Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',terminal:'<path d="m5 7 5 5-5 5"/><path d="M12 17h7"/>',filter:'<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',link:'<path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10.2 5.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-1.4 1.4a5 5 0 0 0 7.1 7.1l1.2-1.2"/>',grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9.5 9.5h5v5h-5z"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>'};function n(e){return String(e??"").replace(/[&<>"']/g,t=>fa[t])}function b(e,t=16,s=""){let a=$s[e]||$s.info;return`<svg${s?` class="${n(s)}"`:""} width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a}</svg>`}function u(e,t="\u2014"){if(e==null||e==="")return t;let s=Number(e);return Number.isFinite(s)?new Intl.NumberFormat("zh-TW").format(s):t}function ce(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=["B","KB","MB","GB","TB"],a=0;for(;t>=1024&&a<s.length-1;)t/=1024,a+=1;return a===0?`${t.toFixed(0)} B`:`${t.toFixed(1)} ${s[a]}`}function Qt(e){if(e instanceof Date)return e;if(typeof e=="number"){let r=new Date(e);return Number.isNaN(r.getTime())?null:r}let t=String(e??"").trim();if(!t)return null;if(/^\d{8}$/.test(t))return new Date(Number(t.slice(0,4)),Number(t.slice(4,6))-1,Number(t.slice(6,8)));let s=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(t),a=new Date(s?`${t}Z`:t);return Number.isNaN(a.getTime())?null:a}function we(e){let t=Qt(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit"}).format(t):e?n(e):"\u2014"}function K(e){let t=Qt(e);return t?new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1}).format(t):e?n(e):"\u2014"}function Ve(e){let t=Qt(e);if(!t)return"";let s=Date.now()-t.getTime();return s<45e3?"\u525B\u525B":s<36e5?`${Math.max(1,Math.round(s/6e4))} \u5206\u9418\u524D`:s<864e5?`${Math.round(s/36e5)} \u5C0F\u6642\u524D`:s<6048e5?`${Math.round(s/864e5)} \u5929\u524D`:we(t)}function B(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;if(t<6e4)return`${(t/1e3).toFixed(1)} s`;let s=Math.floor(t/6e4),a=Math.round(t%6e4/1e3);return`${s}m ${a}s`}function Ee(e){return ga[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function Q(e,t){let s=Ee(e);return`<span class="badge ${ha[s.tone]}"><span class="status-dot ${ba[s.tone]}"></span>${n(t||s.label)}</span>`}function $a(e){return e==="law"?'<span class="badge badge-info">\u6CD5\u898F</span>':e==="order"?'<span class="badge badge-neutral">\u547D\u4EE4</span>':e?`<span class="badge badge-neutral">${n(e)}</span>`:'<span class="cell-empty">\u2014</span>'}function ut(e,t){let s=String(e??"");return s.length>t?`${s.slice(0,t)}\u2026`:s}function pt(e,t="text"){if(e==null||e==="")return'<span class="cell-empty">\u2014</span>';switch(t){case"boolean":return e?'<span class="badge badge-ok">\u662F</span>':'<span class="badge badge-neutral">\u5426</span>';case"status":return Q(String(e));case"source":return $a(String(e));case"number":return`<span class="mono">${u(e)}</span>`;case"duration":return`<span class="mono">${B(e)}</span>`;case"datetime":return`<span class="mono">${K(e)}</span>`;case"date":return`<span class="mono">${we(e)}</span>`;case"url":{let s=String(e),a=ut(s.replace(/^https?:\/\//,""),46);return`<span class="cell-url"><a href="${n(s)}" target="_blank" rel="noopener noreferrer" title="${n(s)}">${b("external",10)}${n(a)}</a></span>`}case"mono":{let s=String(e);return`<span class="cell-mono cell-truncate" title="${n(s)}">${n(ut(s,54))}</span>`}case"longtext":{let s=String(e);return`<span class="cell-truncate" title="${n(s)}">${n(ut(s,100))}</span>`}default:{let s=String(e);return`<span class="cell-truncate" title="${n(s)}">${n(ut(s,90))}</span>`}}}function U({tone:e="info",title:t,text:s,iconName:a="info"}){let r=e==="ok"?"check":e==="danger"||e==="warn"?"alert":"i";return`<div class="notice notice-${e}" role="status">
    <span class="notice-icon" aria-hidden="true">${r==="i"?"i":b(r,12)}</span>
    <div class="notice-body">
      ${t?`<strong>${n(t)}</strong>`:""}
      ${s?`<p>${s}</p>`:""}
    </div>
  </div>`}function de({iconName:e="search",title:t,text:s="",actions:a="",className:r=""}){return`<div class="empty-state ${r}">
    <span class="empty-icon">${b(e,24)}</span>
    <h3 class="empty-title">${n(t)}</h3>
    ${s?`<p class="empty-text">${s}</p>`:""}
    ${a?`<div class="empty-actions">${a}</div>`:""}
  </div>`}function z(e,t,s="\u8655\u7406\u4E2D\u2026"){e&&(t?(e.dataset.idleHtml||(e.dataset.idleHtml=e.innerHTML),e.disabled=!0,e.classList.add("is-loading"),e.innerHTML=`<span class="spinner" aria-hidden="true"></span><span>${n(s)}</span>`):(e.disabled=!1,e.classList.remove("is-loading"),e.dataset.idleHtml&&(e.innerHTML=e.dataset.idleHtml,delete e.dataset.idleHtml)))}function R(e,t="info",s=4200){let a=document.getElementById("toast-region");if(!a)return null;let r={info:"i",ok:"\u2713",warn:"!",danger:"\xD7"},i=document.createElement("div");i.className=`toast toast-${t}`,i.setAttribute("role",t==="danger"?"alert":"status"),i.innerHTML=`<span class="toast-mark" aria-hidden="true">${r[t]||"i"}</span>
    <div class="toast-body">${n(e)}</div>
    <button class="toast-close" type="button" aria-label="\u95DC\u9589\u901A\u77E5">\xD7</button>`;let o=()=>{i.isConnected&&(i.classList.add("is-leaving"),window.setTimeout(()=>i.remove(),190))};return i.querySelector(".toast-close").addEventListener("click",o),a.appendChild(i),s>0&&window.setTimeout(o,s),i}async function mt(e){try{return await navigator.clipboard.writeText(e),!0}catch{let s=document.createElement("textarea");s.value=e,s.setAttribute("readonly",""),s.style.position="fixed",s.style.opacity="0",document.body.appendChild(s),s.select();let a=!1;try{a=document.execCommand("copy")}catch{a=!1}return s.remove(),a}}function je(e,t,s="text/plain;charset=utf-8"){let a=new Blob([t],{type:s}),r=URL.createObjectURL(a),i=document.createElement("a");i.href=r,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(r),1e3)}var ws="judgment.theme",Jt="nvidia",_s=[{id:"vercel",name:"Vercel",description:"\u9ED1\u767D\u7CBE\u6E96 \xB7 Geist \xB7 \u5E7E\u4F55\u7559\u767D",swatches:["#171717","#0070f3","#fafafa"],metaColor:"#ffffff"},{id:"apple",name:"Apple",description:"SF Pro \xB7 \u5927\u5713\u89D2 \xB7 \u6C89\u6D78\u7559\u767D",swatches:["#1d1d1f","#0071e3","#f5f5f7"],metaColor:"#fbfbfd"},{id:"meta",name:"Meta",description:"Optimistic \xB7 \u660E\u4EAE\u85CD \xB7 \u81A0\u56CA\u5143\u4EF6",swatches:["#0064e0","#0091ff","#f1f4f7"],metaColor:"#ffffff"},{id:"nvidia",name:"NVIDIA",description:"GPU \u7DA0 \xB7 \u9ED1\u5E95 \xB7 \u92B3\u5229\u76F4\u89D2",swatches:["#76b900","#000000","#f7f7f7"],metaColor:"#000000"},{id:"ibm",name:"IBM",description:"Carbon \xB7 Plex Sans \xB7 \u4F01\u696D\u85CD",swatches:["#0f62fe","#161616","#f4f4f4"],metaColor:"#161616"},{id:"stripe",name:"Stripe",description:"\u7D2B\u975B\u6F38\u5C64 \xB7 \u7CBE\u5BC6\u91D1\u878D\u611F",swatches:["#635bff","#ea2261","#f6f9fc"],metaColor:"#ffffff"},{id:"linear",name:"Linear",description:"\u6DF1\u7A7A\u9ED1 \xB7 \u975B\u7D2B \xB7 \u6975\u7C21\u7DDA\u689D",swatches:["#5e6ad2","#010102","#e8e8ec"],metaColor:"#010102"},{id:"figma",name:"Figma",description:"\u591A\u5F69\u8272\u584A \xB7 \u5354\u4F5C\u611F \xB7 \u85CD\u8272\u7126\u9EDE",swatches:["#f24e1e","#a259ff","#0acf83"],metaColor:"#ffffff"},{id:"notion",name:"Notion",description:"\u6696\u767D\u7D19\u5F35 \xB7 \u896F\u7DDA\u6A19\u984C \xB7 \u77E5\u8B58\u5EAB",swatches:["#191918","#0075de","#f7f6f3"],metaColor:"#ffffff"},{id:"openai",name:"OpenAI",description:"\u6696\u7070\u756B\u5E03 \xB7 \u9ED1\u8272\u884C\u52D5 \xB7 \u7DA0\u8272\u8A0A\u865F",swatches:["#10a37f","#0d0d0d","#f9f9f7"],metaColor:"#f9f9f7"}],Vt=new Map(_s.map(e=>[e.id,e]));function ya(e){return Vt.has(e)}function wa(e){return Vt.get(e)||Vt.get(Jt)}function _a(){try{let e=window.localStorage.getItem(ws);return ya(e)?e:Jt}catch{return Jt}}function ys(e,{persist:t=!0}={}){let s=wa(e);document.documentElement.dataset.theme=s.id;let a=document.getElementById("theme-color-meta");a&&a.setAttribute("content",s.metaColor);let r=document.getElementById("theme-label");r&&(r.textContent=s.name);let i=document.getElementById("theme-swatches");if(i&&(i.innerHTML=s.swatches.map(o=>`<i class="style-swatch" style="--swatch:${n(o)}"></i>`).join("")),document.querySelectorAll(".theme-option").forEach(o=>{let l=o.dataset.themeId===s.id;o.classList.toggle("is-active",l),o.setAttribute("aria-checked",l?"true":"false")}),t)try{window.localStorage.setItem(ws,s.id)}catch{}return window.dispatchEvent(new CustomEvent("judgment:theme",{detail:{theme:s.id}})),s}function xa(e){let t=_s.map((s,a)=>{let r=s.swatches.map(i=>`<i style="--swatch:${n(i)}"></i>`).join("");return`<button class="theme-option" type="button" role="menuitemradio"
        data-theme-id="${s.id}" aria-checked="false">
        <span class="theme-option-index">${String(a+1).padStart(2,"0")}</span>
        <span class="theme-option-body">
          <span class="theme-option-name">${n(s.name)}</span>
          <span class="theme-option-desc">${n(s.description)}</span>
        </span>
        <span class="theme-option-swatches" aria-hidden="true">${r}</span>
        <span class="theme-option-check" aria-hidden="true">${b("check",14)}</span>
      </button>`}).join("");e.innerHTML=`<div class="style-menu-head">
      <strong>\u9078\u64C7\u4ECB\u9762\u98A8\u683C</strong>
      <span>10 \u7A2E\u79D1\u6280\u54C1\u724C\u8A9E\u8A00</span>
    </div>${t}`}function xs(){let e=document.getElementById("style-picker"),t=document.getElementById("style-trigger"),s=document.getElementById("style-menu");if(!e||!t||!s)return;xa(s),ys(_a(),{persist:!1});let a=()=>Array.from(s.querySelectorAll(".theme-option")),r=()=>{s.hidden=!1,t.setAttribute("aria-expanded","true");let o=s.querySelector(".theme-option.is-active")||a()[0];o&&o.focus()},i=({restoreFocus:o=!1}={})=>{s.hidden||(s.hidden=!0,t.setAttribute("aria-expanded","false"),o&&t.focus())};t.addEventListener("click",()=>{s.hidden?r():i({restoreFocus:!0})}),t.addEventListener("keydown",o=>{(o.key==="ArrowDown"||o.key==="ArrowUp")&&(o.preventDefault(),r())}),s.addEventListener("click",o=>{let l=o.target.closest(".theme-option");l&&(ys(l.dataset.themeId),i({restoreFocus:!0}))}),s.addEventListener("keydown",o=>{let l=a(),f=l.indexOf(document.activeElement);if(o.key==="Escape"){o.preventDefault(),i({restoreFocus:!0});return}if(o.key==="ArrowDown"||o.key==="ArrowUp"){o.preventDefault();let g=o.key==="ArrowDown"?1:-1,h=l[(f+g+l.length)%l.length];h&&h.focus();return}if(o.key==="Home"||o.key==="End"){o.preventDefault();let g=o.key==="Home"?l[0]:l[l.length-1];g&&g.focus()}}),document.addEventListener("pointerdown",o=>{e.contains(o.target)||i()}),document.addEventListener("keydown",o=>{o.key==="Escape"&&i()})}var is={};Qe(is,{render:()=>Dn});var ka="judgment-console";var _e="query_history",Ne="settings";var Se={history:[],settings:new Map,nextId:1},vt=null,ue=!("indexedDB"in window);function tt(e){return new Promise((t,s)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>s(e.error)})}function Re(e){return new Promise((t,s)=>{e.oncomplete=()=>t(),e.onerror=()=>s(e.error),e.onabort=()=>s(e.error||new Error("transaction aborted"))})}function Ie(){return vt||(vt=new Promise((e,t)=>{if(!("indexedDB"in window)){ue=!0,t(new Error("IndexedDB is unavailable"));return}let s;try{s=window.indexedDB.open(ka,1)}catch(a){ue=!0,t(a);return}s.onupgradeneeded=()=>{let a=s.result;if(!a.objectStoreNames.contains(_e)){let r=a.createObjectStore(_e,{keyPath:"id",autoIncrement:!0});r.createIndex("created_at","created_at"),r.createIndex("kind","kind")}a.objectStoreNames.contains(Ne)||a.createObjectStore(Ne,{keyPath:"key"})},s.onsuccess=()=>{let a=s.result;a.onversionchange=()=>a.close(),e(a)},s.onerror=()=>{ue=!0,t(s.error||new Error("Unable to open IndexedDB"))},s.onblocked=()=>{ue=!0,t(new Error("IndexedDB upgrade blocked by another tab"))}}),vt)}function ks(){return"indexedDB"in window}function Ss(){return ue}function ft(){return ue?"memory":"indexeddb"}function Sa(e){let t=e.created_at||new Date().toISOString();return{kind:e.kind||"query",title:String(e.title||""),detail:String(e.detail||""),payload:e.payload||{},created_at:t}}async function Aa(){try{let t=(await Ie()).transaction(_e,"readwrite"),s=t.objectStore(_e),a=await tt(s.count());if(a>120){let r=a-120,i=s.index("created_at").openCursor();await new Promise((o,l)=>{i.onsuccess=()=>{let f=i.result;if(!f||r<=0){o();return}f.delete(),r-=1,f.continue()},i.onerror=()=>l(i.error)})}await Re(t)}catch{ue=!0}}async function gt(e){let t=Sa(e);try{let a=(await Ie()).transaction(_e,"readwrite"),r=a.objectStore(_e),i=await tt(r.add(t));return await Re(a),await Aa(),i}catch{ue=!0;let a=Se.nextId++;return Se.history.push({id:a,...t}),Se.history.length>120&&Se.history.shift(),a}}async function ht({keyword:e="",limit:t=50}={}){let s=e.trim().toLowerCase();try{let r=(await Ie()).transaction(_e,"readonly"),i=r.objectStore(_e),o=await tt(i.getAll());return await Re(r),o.filter(l=>s?`${l.kind} ${l.title} ${l.detail}`.toLowerCase().includes(s):!0).sort((l,f)=>String(f.created_at).localeCompare(String(l.created_at))).slice(0,t)}catch{return ue=!0,Se.history.filter(r=>s?`${r.kind} ${r.title} ${r.detail}`.toLowerCase().includes(s):!0).slice().sort((r,i)=>String(i.created_at).localeCompare(String(r.created_at))).slice(0,t)}}async function As(){try{let t=(await Ie()).transaction(_e,"readwrite");t.objectStore(_e).clear(),await Re(t)}catch{ue=!0}Se.history=[]}async function Ls(e,t){let s={key:String(e),value:t,updated_at:new Date().toISOString()};try{let r=(await Ie()).transaction(Ne,"readwrite");return r.objectStore(Ne).put(s),await Re(r),s}catch{return ue=!0,Se.settings.set(s.key,s),s}}async function st(e,t=null){try{let a=(await Ie()).transaction(Ne,"readonly"),r=a.objectStore(Ne),i=await tt(r.get(String(e)));return await Re(a),i?i.value:t}catch{ue=!0;let a=Se.settings.get(String(e));return a?a.value:t}}async function Ms({keyword:e=""}={}){let t=e.trim().toLowerCase();try{let a=(await Ie()).transaction(Ne,"readonly"),r=a.objectStore(Ne),i=await tt(r.getAll());return await Re(a),i.filter(o=>t?`${o.key} ${JSON.stringify(o.value)}`.toLowerCase().includes(t):!0).sort((o,l)=>String(o.key).localeCompare(String(l.key)))}catch{return ue=!0,Array.from(Se.settings.values()).filter(a=>t?`${a.key} ${JSON.stringify(a.value)}`.toLowerCase().includes(t):!0)}}function Ts(e){if(typeof e=="string")return e;try{return JSON.stringify(e)}catch{return String(e)}}var rs={};Qe(rs,{render:()=>Tn,renderTestFlowPanel:()=>St});var as={};Qe(as,{exportCsv:()=>xt,exportableResult:()=>kt,render:()=>ln,renderReport:()=>yt,reportError:()=>_t,reportLoading:()=>at});var Is=[10,25,50,100],La=500,Ma=["law_name","law_level","law_category","law_modified_date","article_count"],Ta=["jid","court_normalized","title","jdate","matched_laws","citation_count"],qa={A:"\u689D\u6587",C:"\u7AE0\u7BC0"};function wt(e){return e?.label||e?.id||"\u8CC7\u6599\u5EAB"}function bt(e,t){let s={};for(let a of e.fields||[]){let r=a.type==="checkbox"?!1:a.type==="multiselect"?[]:"",i=a.default===void 0?r:a.default;s[a.key]=Array.isArray(i)?[...i]:i}return{values:s,page:1,pageSize:t,result:null,sort:null,columnFilters:{}}}function Ea(e,t){let s=e.visibleWhen;if(!s)return!0;for(let[a,r]of Object.entries(s))if(Array.isArray(r)&&!r.map(String).includes(String(t[a]??"")))return!1;return!0}function ss(e,t){return(e.fields||[]).filter(s=>Ea(s,t))}function ja(e,t){return`filter-${e.id}-${t}`}function Be(e){return e==null?"":n(String(e))}function Wt(e,t,s){let a=s[t.key],r=ja(e,t.key),i=t.help?`<span class="field-help">${n(t.help)}</span>`:"";if(t.type==="checkbox")return`<div class="field">
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
    </div>`}if(t.type==="multiselect"){let l=new Set((Array.isArray(a)?a:[]).map(String)),f=(t.options||[]).map(g=>`<label class="multi-option">
          <input type="checkbox" name="${n(t.key)}" value="${Be(g.value)}" ${l.has(String(g.value))?"checked":""} />
          <span>${n(g.label??g.value)}</span>
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
  </div>`}function Kt(e,t,{focusTable:s=!1}={}){let a=ss(e,t.values),r=[];for(let i=0;i<a.length;i+=1){let o=a[i],l=a[i+1];o.type==="date"&&l&&l.type==="date"?(r.push(`<div class="field-row">${Wt(e,o,t.values)}${Wt(e,l,t.values)}</div>`),i+=1):r.push(Wt(e,o,t.values))}return`<form id="data-filter-form" autocomplete="off">
    <div class="filter-block">
      <div class="filter-head">
        <span class="filter-title">Metadata \u689D\u4EF6</span>
        <button class="filter-reset" type="button" data-action="reset">\u91CD\u8A2D</button>
      </div>
      <div class="filter-fields">${r.join("")}</div>
    </div>
    <div class="sidebar-actions">
      <button class="btn btn-primary" type="submit" id="run-query" ${s?'data-focus-table="true"':""}>
        ${b("search",15)}<span>\u57F7\u884C\u67E5\u8A62</span>
      </button>
    </div>
  </form>`}function $t(e,t,s){let a={...s.values};for(let r of ss(t,a))if(r.type==="checkbox"){let i=e.querySelector(`[name="${r.key}"]`);a[r.key]=!!i?.checked}else if(r.type==="multiselect")a[r.key]=Array.from(e.querySelectorAll(`[name="${r.key}"]:checked`)).map(i=>i.value);else{let i=e.querySelector(`[name="${r.key}"]`);a[r.key]=i?i.value:""}return a}function Bs(e,t){let s={};for(let a of ss(e,t.values)){let r=t.values[a.key];a.type==="checkbox"?s[a.key]=!!r:a.type==="multiselect"?s[a.key]=Array.isArray(r)?r:[]:a.type==="number"?s[a.key]=r===""||r===null?"":Number(r):s[a.key]=r??""}return s}function Yt(e,t){let s=Bs(e,t);return(e.id==="postgres"||e.id==="parquet")&&t.sort?.key&&(s.sort=`${t.sort.key}:${t.sort.direction}`,s.schema_preview=!0),t.columnFilters&&Object.keys(t.columnFilters).length>0&&(s.column_filters=t.columnFilters),s}function qs(e){if(e.status==="operational")return"";let t=e.status==="unavailable"?"danger":e.status==="degraded"?"warn":"info";return`<div class="sidebar-notice">${U({tone:t,title:`${wt(e)} ${Ee(e.status).label}`,text:n(e.detail||"\u76EE\u524D\u7121\u6CD5\u4F7F\u7528\u9019\u500B\u8CC7\u6599\u4F86\u6E90\u3002")})}</div>`}function Na(e,t){return`<div class="db-options" role="radiogroup" aria-label="\u9078\u64C7\u8CC7\u6599\u5EAB">
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
  </div>`}function Pa(e){return`<div class="sidebar-view-switch" role="tablist" aria-label="\u67E5\u8A62\u6216 schema">
    <button class="sidebar-view-button ${e==="query"?"is-active":""}"
      type="button" role="tab" aria-selected="${e==="query"}"
      data-action="sidebar-view" data-view="query">${b("search",13)}<span>\u67E5\u8A62</span></button>
    <button class="sidebar-view-button ${e==="schema"?"is-active":""}"
      type="button" role="tab" aria-selected="${e==="schema"}"
      data-action="sidebar-view" data-view="schema">${b("table",13)}<span>Schema</span></button>
  </div>`}function Xt(e,t,s=""){let a=Array.isArray(e.tables)?e.tables:[],r=a.length?a.map(i=>`<button class="schema-item ${String(i.id)===String(s||"")?"is-selected":""}" type="button"
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
    ${e.map(s=>{let a=s.id===t,r=s.id==="judgment"&&s.count!==void 0?`${u(s.count)} \u7B46\u5DF2\u7BE9\u9078\u5224\u6C7A`:s.description||"";return`<label class="category-option${a?" is-selected":""}">
          <input type="radio" name="category" value="${n(s.id)}" ${a?"checked":""} />
          <span class="category-option-body">
            <span class="category-option-label">${n(s.label)}</span>
            <span class="category-option-desc">${n(r)}</span>
          </span>
        </label>`}).join("")}
  </div>`}function js(e){return{postgres:"PostgreSQL \u67E5\u8A62\u4F7F\u7528\u53C3\u6578\u5316\u689D\u4EF6\u8207\u5206\u9801\uFF0C\u50C5\u8B80\u53D6\u8CC7\u6599\u3002",parquet:"Parquet \u67E5\u8A62\u76F4\u63A5\u6383\u63CF\u76EE\u524D\u6700\u65B0\u7684\u5FEB\u7167\uFF1B\u52FE\u9078\u539F\u59CB JSON \u6703\u589E\u52A0\u56DE\u50B3\u91CF\u8207\u6E32\u67D3\u6642\u9593\u3002",qdrant:"Qdrant \u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\uFF1B\u9700\u8981\u5148\u5B8C\u6210\u5411\u91CF\u7D22\u5F15\u3002\u6AA2\u7D22\u7D50\u679C\u53EA\u5305\u542B\u7D22\u5F15\u4E2D\u5BE6\u969B\u5B58\u5728\u7684\u5224\u6C7A\uFF0C\u4E0D\u6703\u7522\u751F\u865B\u69CB\u8CC7\u6599\u3002",indexeddb:"IndexedDB \u53EA\u5728\u9019\u500B\u700F\u89BD\u5668\u5167\u67E5\u8A62\uFF0C\u4E0D\u6703\u7D93\u904E\u4F3A\u670D\u5668\uFF1B\u6E05\u9664\u7DB2\u7AD9\u8CC7\u6599\u5F8C\u7D00\u9304\u6703\u6D88\u5931\u3002"}[e.id]||n(e.detail||"")}function Ca(e){return`<div class="report-empty">
    ${de({iconName:"table",title:"\u67E5\u8A62\u5831\u8868\u6703\u986F\u793A\u5728\u9019\u88E1",text:n({postgres:"\u9078\u64C7\u8CC7\u6599\u8868\u8207 metadata \u689D\u4EF6\uFF0C\u57F7\u884C\u5F8C\u6703\u7522\u751F SQL\u3001\u6458\u8981\u3001\u5206\u5E03\u8207\u8CC7\u6599\u5217\u3002",parquet:"\u9078\u64C7\u8CC7\u6599\u96C6\u8207\u56DE\u50B3\u6B04\u4F4D\uFF0C\u76F4\u63A5\u6383\u63CF\u539F\u59CB Parquet\u3002",qdrant:"\u8F38\u5165\u8A9E\u610F\u67E5\u8A62\u5F8C\uFF0C\u4EE5 embedding \u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5DF2\u5EFA\u7ACB\u5411\u91CF\u7D22\u5F15\u7684\u5224\u6C7A\uFF1B\u672A\u7D22\u5F15\u6642\u6703\u660E\u78BA\u986F\u793A\u72C0\u614B\u3002",indexeddb:"\u67E5\u8A62\u5B58\u5728\u9019\u500B\u700F\u89BD\u5668\u7684\u63D0\u554F\u7D00\u9304\u8207\u8A2D\u5B9A\uFF0C\u4E0D\u9700\u8981\u4F3A\u670D\u5668\u3002"}[e.id]||"\u8A2D\u5B9A\u689D\u4EF6\u5F8C\u57F7\u884C\u67E5\u8A62\u3002")})}
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
      ${U({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u67E5\u8A62\u7D50\u679C",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="retry">
          ${b("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}function Ra(e){if(!e.length)return'<div class="report-empty-inline">\u9019\u6B21\u67E5\u8A62\u6C92\u6709\u53EF\u5448\u73FE\u7684\u5206\u5E03\u8CC7\u6599\u3002</div>';let t=Math.max(...e.map(s=>Number(s.value)||0),1);return`<div class="distribution">
    ${e.map(s=>{let a=Number(s.value)||0,r=Math.max(1.5,a/t*100);return`<div class="dist-row">
          <span class="dist-label" title="${n(s.label||"\u672A\u5206\u985E")}">${n(s.label||"\u672A\u5206\u985E")}</span>
          <span class="dist-track"><span class="dist-bar" style="width:${r.toFixed(1)}%"></span></span>
          <span class="dist-value">${u(a)}</span>
        </div>`}).join("")}
  </div>`}function Ds(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="law_documents"}function Ia(e){return e&&(e.database==="postgres"||e.database==="parquet")&&e.table==="judgment_documents"}function Ba(e){return e&&e.database==="qdrant"&&String(e.table||"").startsWith("judgment")}function Da(e){let t=e._jid||e.jid;return t?`<button class="law-link judgment-link" type="button" data-action="open-judgment"
    data-jid="${n(String(t))}"
    title="\u6AA2\u8996\u300C${n(String(t))}\u300D\u7684\u5224\u6C7A\u539F\u6587">${n(String(t))}${b("chevronRight",12,"law-link-icon")}</button>`:"\u2014"}var Fa={jid:"jid",court:"court",court_normalized:"court",title:"title",jdate:"jdate",matched_laws:"matched_laws",citation_count:"citation_count",full_text_length:"full_text_length"};function Oa(e,t,s,a=!1,r=!0,i=!1){let o=a?e.key:e.label||e.key,l=r?t?Fa[e.key]||e.key:i?e.key:null:null;if(!l)return`<th scope="col">${n(o)}</th>`;let f=s?.key===l,g=f?s.direction:null,h=g==="asc"?"ascending":g==="desc"?"descending":"none",m=g==="asc"?"\u2191":g==="desc"?"\u2193":"\u2195";return`<th scope="col" aria-sort="${h}">
    <button class="table-sort${f?" is-active":""}" type="button"
      data-action="sort-column" data-sort-key="${n(l)}"
      title="\u4F9D${n(o)}\u6392\u5E8F">
      <span>${n(o)}</span>
      <span class="table-sort-icon" aria-hidden="true">${m}</span>
    </button>
  </th>`}function Ha(e,t){if(!Ds(e)||!t)return null;let s=t._law_key||t.law_name;if(!s)return null;let a=e.meta?.dataset,r=t._law_source_type||(a&&a!=="all"?a:"");return{lawKey:String(s),sourceType:String(r||""),lawName:String(t.law_name||"")}}function Ua(e,t,s){let a=e[t.key];return a==null||a===""?"\u2014":`<button class="law-link" type="button" data-action="open-law"
    data-law-key="${n(s.lawKey)}"
    data-law-source="${n(s.sourceType)}"
    data-law-name="${n(s.lawName)}"
    title="\u6AA2\u8996\u300C${n(String(a))}\u300D\u7684\u5B8C\u6574\u6CD5\u898F\u5831\u8868">${n(String(a))}${b("chevronRight",12,"law-link-icon")}</button>`}function Fs(e,{useColumnKeys:t=!1,sortable:s=!0,sortableAll:a=!1,searchValues:r=null,compact:i=!1}={}){let o=Array.isArray(e.columns)?e.columns:[],l=Array.isArray(e.rows)?e.rows:[],f=(e.page-1)*e.page_size,g=Ds(e),h=Ia(e),m=Ba(e),w=e.meta?.sort||null,M=r?`<tr class="schema-search-row">
        <th scope="col" class="cell-index-head"></th>
        ${o.map(k=>`<th scope="col">
              <div class="schema-search-wrap">
                <input class="schema-search-input" type="search"
                  data-schema-search="${n(k.key)}"
                  value="${n(String(r[k.key]??""))}"
                  placeholder="\u641C\u5C0B ${n(k.key)}"
                  autocomplete="off" />
              </div>
            </th>`).join("")}
      </tr>`:"";return o.length?l.length?`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">${u(l.length)} rows \xB7 \u7B2C ${e.page} \u9801${g?" \xB7 \u9EDE\u9078\u6CD5\u898F\u540D\u7A31\u53EF\u6AA2\u8996\u5B8C\u6574\u689D\u6587":h?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u6B04\u4F4D\u6A19\u984C\u53EF\u6392\u5E8F":m?" \xB7 \u9EDE\u9078\u6848\u865F\u53EF\u6AA2\u8996\u5224\u6C7A\u539F\u6587 \xB7 \u4F9D\u76F8\u4F3C\u5EA6\u6392\u5E8F":""}</span>
    </div>
    <div class="table-wrap">
      <table class="data-table${i?" is-compact":""}">
        <thead>${M}<tr>
          <th scope="col" class="cell-index-head">#</th>
          ${o.map(k=>Oa(k,h,w,t,s,a)).join("")}
        </tr></thead>
        <tbody>
          ${l.map((k,j)=>`<tr>
                <td class="cell-mono cell-empty cell-index">${f+j+1}</td>
                ${o.map(P=>{if((h||m)&&P.key==="jid")return`<td class="cell-jid">${Da(k)}</td>`;let N=g&&P.key==="law_name"?Ha(e,k):null;if(N)return`<td>${Ua(k,P,N)}</td>`;let S={date:"cell-date",datetime:"cell-datetime",duration:"cell-duration",number:"cell-number"}[P.type];return`<td${S?` class="${S}"`:""}>${pt(k[P.key],P.type||"text")}</td>`}).join("")}
              </tr>`).join("")}
        </tbody>
      </table>
    </div>`:`<div class="report-table-head">
        <span class="report-section-title">\u8CC7\u6599\u5217</span>
        <span class="muted" style="font-size:10px">0 rows</span>
      </div>
      ${de({iconName:"filter",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u8CC7\u6599",text:"\u653E\u5BEC\u65E5\u671F\u5340\u9593\u3001\u964D\u4F4E\u689D\u6587\u6578\u4E0B\u9650\uFF0C\u6216\u6E05\u9664\u95DC\u9375\u5B57\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}`:`<div class="report-table-head">
      <span class="report-section-title">\u8CC7\u6599\u5217</span>
      <span class="muted" style="font-size:10px">\u6B64\u8CC7\u6599\u4F86\u6E90\u6C92\u6709\u8868\u683C\u6B04\u4F4D</span>
    </div>`}function za(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,r=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${r} \u9801 \xB7
      \u986F\u793A ${u(i)}\u2013${u(o)} / ${u(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Is.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${b("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=r?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${b("chevronRight",13)}</button>
    </div>
  </div>`}function Os(e){return!Array.isArray(e)||!e.length?"":`<div class="warnings">${e.map(t=>`<div class="warning-line">${n(t)}</div>`).join("")}</div>`}function yt(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.columns)?e.columns:[],a=Array.isArray(e.summary)?e.summary:[],r=Array.isArray(e.distribution)?e.distribution:[],i=Number(e.total)||0,o=e.query_text||"",l=e.database||"",f=e.status||"ok",g=e.meta?.table_label||e.table||e.label||"query result";return`<div class="report-card" data-database="${n(l)}">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT \xB7 ${n(String(l).toUpperCase())}</div>
        <div class="report-title">
          ${n(e.label||l)}
          ${Q(f)}
          <span class="chip">${n(g)}</span>
        </div>
        <div class="report-sub">
          ${u(i)} \u7B46\u7B26\u5408 \xB7
          ${B(e.duration_ms)} \xB7
          ${n(String(l).toUpperCase())} / ${n(String(e.table||"\u2014"))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${b("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${b("file",14)}<span>JSON</span></button>
      </div>
    </div>

    ${e.message?`<div class="report-alert">${U({tone:f==="not_configured"?"info":f==="danger"?"danger":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n(e.message)})}</div>`:""}

    ${a.length?`<div class="summary-strip">
            ${a.slice(0,4).map(h=>`<div class="summary-item">
                  <div class="summary-label">${n(h.label)}</div>
                  <div class="summary-value">${n(h.value)}</div>
                </div>`).join("")}
          </div>`:""}

    <div class="report-grid">
      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u7D50\u679C\u5206\u5E03</span>
          <span class="muted" style="font-size:9.5px">${r.length} groups</span>
        </div>
        ${Ra(r)}
      </div>
      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5BE6\u969B\u67E5\u8A62\u8A9E\u53E5</span>
          <span class="muted" style="font-size:9.5px">${n(e.database==="indexeddb"?"client-side":"read-only")}</span>
        </div>
        <div class="query-box">
          <pre class="query-code">${n(o||"\u2014")}</pre>
          <button class="btn btn-secondary btn-sm btn-copy" type="button" data-action="copy-query">
            ${b("copy",12)}<span>\u8907\u88FD</span>
          </button>
        </div>
        ${Os(e.warnings)}
      </div>
    </div>

    ${s.length||t.length?Fs(e,{compact:!0,sortableAll:!0,searchValues:e.meta?.searchable?e.meta.column_filters||{}:null}):""}
    ${i||s.length?za({...e,total:i,page:Number(e.page)||1,page_size:Number(e.page_size)||25}):""}
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
  </div>`}function Zt(e,t,{columnFilters:s={},searchEnabled:a=!1}={}){let r=Array.isArray(e.columns)?e.columns:[],i=Array.isArray(e.rows)?e.rows:[],o=e.message?`<div class="report-alert">${U({tone:e.status==="ok"?"info":"warn",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:n(e.message)})}</div>`:"";return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW \xB7 ${n(String(e.database||"").toUpperCase())}</div>
        <div class="report-title">
          ${n(t||e.table||"\u8CC7\u6599\u8868")}
          ${Q(e.status||"ok")}
        </div>
        <div class="report-sub">
          ${n(String(e.database||""))} / ${n(String(e.table||"\u2014"))} \xB7 ${r.length} \u6B04\u4F4D \xB7 \u524D ${i.length} \u7B46
        </div>
      </div>
    </div>
    ${o}
    ${Fs({...e,page:1,page_size:10},{useColumnKeys:!0,sortable:!0,sortableAll:!0,searchValues:a?s:null})}
    ${Os(e.warnings)}
    <div class="schema-preview-footer">
      <span>\u9810\u89BD\u524D ${u(i.length)} \u7B46</span>
      <strong>\u5171 ${u(e.total)} \u7B46</strong>
    </div>
  </div>`}function Ps(e,t){return`<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW</div>
        <div class="report-title">${n(t||"\u8CC7\u6599\u8868")}</div>
        <div class="report-sub">\u7121\u6CD5\u8B80\u53D6\u8CC7\u6599\u8868\u9810\u89BD\u3002</div>
      </div>
    </div>
    ${U({tone:"danger",title:"\u8B80\u53D6\u5931\u6557",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
  </div>`}function Ga(e){return`<div class="report-empty">
    ${de({iconName:"table",title:"\u9078\u64C7\u8CC7\u6599\u8868\u9810\u89BD",text:`\u5F9E\u5DE6\u5074 ${wt(e)} \u7684 Schema \u6E05\u55AE\u9EDE\u9078\u8CC7\u6599\u8868\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6B04\u4F4D\u540D\u7A31\u3001\u524D 10 \u7B46\u8CC7\u6599\u8207\u7E3D\u7B46\u6578\u3002`})}
  </div>`}function es(e){return e.is_current===!0?Q("ok","\u73FE\u884C"):e.law_abandon_note?Q("empty","\u5DF2\u5EE2\u6B62"):e.is_current===!1?Q("empty","\u6B77\u53F2\u7248\u672C"):Q("not_configured","\u72C0\u614B\u672A\u63D0\u4F9B")}function V(e,t){return`<div class="law-meta-item">
    <div class="law-meta-label">${n(e)}</div>
    <div class="law-meta-value">${t||"\u2014"}</div>
  </div>`}function De(e){return e?we(e):"\u2014"}function Qa(e){return e?.meta?.metadata_source==="postgresql"?"PostgreSQL metadata":e?.meta?.metadata_source==="parquet"?"Parquet snapshot":"\u2014"}function ts(e,t){return t?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">${n(e)}</span>
    </div>
    <div class="law-text-block">${n(String(t).trim())}</div>
  </div>`:""}function Ja(e,t,{open:s=!1}={}){return t?`<details class="report-section law-disclosure" data-law-history ${s?"open":""}>
    <summary class="law-disclosure-summary">
      <span class="report-section-title">${n(e)}</span>
      <span class="law-disclosure-hint">\u9810\u8A2D\u6536\u5408 \xB7 \u9EDE\u64CA\u5C55\u958B</span>
      ${b("chevronDown",14,"law-disclosure-chevron")}
    </summary>
    <div class="law-text-block">${n(String(t).trim())}</div>
  </details>`:""}function Va(e){let t=Array.isArray(e)?e:[],s=t.map(a=>{let r=a?.name||a?.url||"";return r?a.url?`<a class="law-attachment" href="${n(a.url)}" target="_blank" rel="noopener noreferrer">
          ${b("file",12)}<span>${n(r)}</span>${b("external",11)}
        </a>`:`<span class="law-attachment">${b("file",12)}<span>${n(r)}</span></span>`:""}).filter(Boolean).join("");return s?`<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">\u9644\u4EF6</span>
      <span class="muted">${u(t.length)}</span>
    </div>
    <div class="law-attachment-list">${s}</div>
  </div>`:""}function Hs(e){return String(e||"").replace(/\s+/g,"").replace(/^第/,"").replace(/條$/,"").replace(/之/g,"-")}function Wa(e){let t=Array.isArray(e.articles)?e.articles:[],s=t.filter(o=>o.article_type==="C").length,a=t.length-s,r=s?`${u(a)} \u689D \xB7 ${u(s)} \u7AE0\u7BC0`:`${u(a)} \u689D`,i=t.map(o=>{let l=String(o.article_content||"").trim();if(!l)return"";if(o.article_type==="C")return`<div class="law-chapter">${n(l)}</div>`;let f=qa[o.article_type]||o.article_type;return`<article class="law-article"
        data-article-no="${n(Hs(o.article_no))}">
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
  </div>`}function Ka(){return`<div class="law-jump-float">
    <input class="input law-article-jump-input law-jump-input"
      id="law-article-jump-float" type="text" inputmode="numeric"
      autocomplete="off" placeholder="\u8DF3\u81F3\u7B2C\u5E7E\u689D" aria-label="\u8DF3\u81F3\u6307\u5B9A\u689D\u6587" />
    <button class="btn btn-secondary btn-sm" type="button"
      data-action="jump-article" data-jump-input="law-article-jump-float">\u8DF3\u81F3</button>
  </div>`}function We(){return`<button class="btn btn-secondary btn-sm" type="button" data-action="back-to-results">
    ${b("chevronLeft",14)}<span>\u8FD4\u56DE\u67E5\u8A62\u7D50\u679C</span>
  </button>`}function Ya(e){return`<div class="law-report">
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
  </div>`}function Xa(e,t){return`<div class="law-report">
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
        ${U({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function Za(e){let t=Array.isArray(e.versions)?e.versions:[];if(t.length<1)return"";let s=e.selected_version_id??"";return`<label class="law-version-select">
    <span>\u689D\u6587\u7248\u672C</span>
    <select class="select" data-action="select-law-version" aria-label="\u9078\u64C7\u6CD5\u898F\u689D\u6587\u7248\u672C">
      ${t.map(a=>{let r=String(a.update_date||"").match(/\d{4}\/\d{1,2}\/\d{1,2}/)?.[0]||"",i=[`#${a.version_id}`,a.is_current?"\u76EE\u524D":"\u6B77\u53F2",r,a.article_count_for_law?`${u(a.article_count_for_law)} \u7B46`:"\u7121\u689D\u6587\u5FEB\u7167"].filter(Boolean).join(" \xB7 ");return`<option value="${n(a.version_id)}" ${String(a.version_id)===String(s)?"selected":""}>${n(i)}</option>`}).join("")}
    </select>
  </label>`}function en(e){let t=e.change_summary||{},s=Object.values(t).reduce((o,l)=>o+(Number(l)||0),0),a=Array.isArray(e.changes)?e.changes:[];if(!e.changes_available&&!s)return"";let r={added:"\u65B0\u589E",modified:"\u4FEE\u6539",removed:"\u79FB\u9664"},i=["added","modified","removed"].map(o=>`${r[o]} ${u(t[o]||0)}`).join(" \xB7 ");return`<details class="report-section law-version-changes">
    <summary>
      <span class="report-section-title">\u7248\u672C\u8B8A\u66F4</span>
      <span class="muted">${n(i)}</span>
    </summary>
    <div class="law-version-change-list">
      ${a.length?a.slice(0,20).map(o=>{let l=o.change_type==="added"?"badge-ok":o.change_type==="removed"?"badge-danger":"badge-warn",f=o.before_content?`<details><summary>\u8B8A\u66F4\u524D</summary><pre>${n(o.before_content)}</pre></details>`:"",g=o.after_content?`<details><summary>\u8B8A\u66F4\u5F8C</summary><pre>${n(o.after_content)}</pre></details>`:"";return`<div class="law-version-change">
                  <div class="law-version-change-head">
                    <span class="badge ${l}">${n(r[o.change_type]||o.change_type)}</span>
                    <strong>${n(o.article_no||o.article_key)}</strong>
                  </div>
                  ${f}${g}
                </div>`}).join(""):'<div class="report-empty-inline">\u6B64\u7248\u672C\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u8B8A\u66F4\u3002</div>'}
      ${e.changes_truncated?'<div class="report-empty-inline">\u50C5\u986F\u793A\u524D 20 \u7B46\u8B8A\u66F4\uFF1BAPI \u56DE\u50B3\u4E0A\u9650 200 \u7B46\u3002</div>':""}
    </div>
  </details>`}function tn(e,{database:t="",lawPage:s=1,historyOpen:a=!1}={}){let r=Array.isArray(e.warnings)?e.warnings:[],i=e.law_name||e.law_key||"\u6CD5\u898F",o=(Array.isArray(e.articles)?e.articles:[]).filter(j=>j.article_type!=="C").length,l=Qa(e),f=e.meta?.articles_source==="postgresql"?"PostgreSQL \u689D\u6587\u7248\u672C":e.meta?.articles_source==="parquet"?"Parquet \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",g=e.meta?.snapshot||"",h=e.meta?.articles_source==="postgresql"&&e.selected_version_id!==null&&e.selected_version_id!==void 0?`\u689D\u6587\u7248\u672C #${e.selected_version_id}`:"",m=[l,f,h,g].filter(Boolean).join(" \xB7 "),w=e.source_type==="law"?"\u6CD5\u5F8B":e.source_type==="order"?"\u547D\u4EE4":e.source_type||"\u2014",M=e.version||{},k=[V("\u6CD5\u898F\u4F4D\u968E",n(e.law_level||"\u2014")),V("\u6CD5\u898F\u985E\u5225",n(e.law_category||"\u2014")),V("\u7570\u52D5\u65E5\u671F",De(e.law_modified_date)),V("\u751F\u6548\u65E5\u671F",De(e.law_effective_date)),V("\u689D\u6587\u6578",u(e.article_count)),V("\u8CC7\u6599\u72C0\u614B",es(e)),V("\u82F1\u8B6F\u540D\u7A31",n(e.eng_law_name||"\u2014")),V("\u6CD5\u898F\u8B58\u5225",`<span class="mono">${n(e.law_key||"\u2014")}</span>`)];return M.first_seen_version_id!==null&&M.first_seen_version_id!==void 0&&k.push(V("\u9996\u6B21\u6536\u9304\u7248\u672C",`#${n(M.first_seen_version_id)}`)),M.last_seen_version_id!==null&&M.last_seen_version_id!==void 0&&k.push(V("\u6700\u5F8C\u6536\u9304\u7248\u672C",`#${n(M.last_seen_version_id)}`)),M.last_seen_at&&k.push(V("\u6700\u5F8C\u6536\u9304\u6642\u9593",n(K(M.last_seen_at)))),M.selected_version_id!==null&&M.selected_version_id!==void 0&&k.push(V("\u689D\u6587\u7248\u672C",`#${n(M.selected_version_id)} \xB7 ${e.meta?.selected_version_is_current?"\u76EE\u524D":"\u6B77\u53F2"}`)),`<div class="law-report">
    <div class="law-report-topbar">
      ${We()}
      <span class="law-report-origin" title="${n(m)}">${n(m)}</span>
    </div>
    <div class="report-card law-report-card" data-database="${n(t)}">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT \xB7 ${n(String(t||l).toUpperCase())}</div>
          <div class="report-title">
            ${n(i)}
            ${es(e)}
            <span class="chip">${n(w)}</span>
          </div>
          <div class="report-sub">
            ${n([e.law_level,e.law_category].filter(Boolean).join(" \xB7 ")||"\u2014")} \xB7 ${u(e.article_count)} \u689D \xB7 \u7570\u52D5 ${De(e.law_modified_date)}
          </div>
        </div>
        <div class="report-actions">
          ${Za(e)}
          ${e.law_url?`<a class="btn btn-secondary btn-sm" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">${b("external",14)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:""}
        </div>
      </div>

      ${r.length?`<div class="report-alert">${U({tone:e.status==="degraded"?"warn":"info",title:"\u8CC7\u6599\u4F86\u6E90\u63D0\u793A",text:r.map(j=>n(j)).join("<br />")})}</div>`:""}

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
          <div class="summary-value">${es(e)}</div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">\u6CD5\u898F\u8CC7\u8A0A</span>
          <span class="muted" style="font-size:9.5px">${n(l)}</span>
        </div>
        <div class="law-meta-grid">${k.join("")}</div>
      </div>

      ${en(e)}
      ${ts("\u6CD5\u898F\u524D\u8A00",e.law_foreword)}
      ${Ja("\u6CD5\u898F\u6CBF\u9769",e.law_histories,{open:a})}
      ${ts("\u751F\u6548\u8AAA\u660E",e.law_effective_note)}
      ${ts("\u5EE2\u6B62\u8AAA\u660E",e.law_abandon_note)}
      ${Va(e.attachments)}
      ${Wa(e)}
    </div>
    ${o>100?Ka():""}
  </div>`}function sn(e){return`<div class="law-report judgment-report">
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
  </div>`}function an(e,t){return`<div class="law-report judgment-report">
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
        ${U({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
      </div>
    </div>
  </div>`}function nn(e){let t=new Map;for(let s of Array.isArray(e.citations)?e.citations:[]){let a=String(s.law_name||"").trim();if(!a)continue;t.has(a)||t.set(a,new Set);let r=String(s.article_no||"").trim();r&&t.get(a).add(r)}return t.size?`<div class="judgment-citation-groups">
    ${[...t.entries()].map(([s,a])=>`<div class="judgment-citation-group">
          <span class="judgment-citation-law">${n(s)}</span>
          <span class="judgment-citation-articles">${[...a].map(r=>n(r)).join("\u3001")||"\u2014"}</span>
        </div>`).join("")}
  </div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5F15\u7528\u660E\u7D30\u3002</div>'}function rn(e,{database:t="postgres"}={}){let s=Array.isArray(e.matched_laws)?e.matched_laws:[],a=e.title||e.jid||"\u5224\u6C7A",r=String(e.full_text||""),i=Number(e.full_text_length)||r.length||0,o=["PostgreSQL \u5224\u6C7A\u6587\u4EF6",e.source_archive].filter(Boolean).join(" \xB7 "),l=[V("\u6848\u865F",n(e.jid||"\u2014")),V("\u5E74\u5EA6",n(e.jyear||"\u2014")),V("\u5B57\u5225",n(e.jcase||"\u2014")),V("\u865F\u78BC",n(e.jno||"\u2014")),V("\u6CD5\u9662",n(e.court||"\u2014")),V("\u6848\u7531",n(e.title||"\u2014")),V("\u88C1\u5224\u65E5\u671F",De(e.jdate)),V("\u4F86\u6E90\u58D3\u7E2E\u6A94",n(e.source_archive||"\u2014")),V("\u5168\u6587\u9577\u5EA6",`${u(i)} \u5B57`),V("\u5F15\u7528\u6578",u(e.citation_count))];return e.import_run_id!==null&&e.import_run_id!==void 0&&l.push(V("\u532F\u5165 Run",`#${n(e.import_run_id)}`)),`<div class="law-report judgment-report">
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
          ${e.pdf_url?`<a class="btn btn-secondary btn-sm" href="${n(e.pdf_url)}" target="_blank" rel="noopener noreferrer">${b("external",14)}<span>PDF</span></a>`:""}
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
        ${nn(e)}
      </div>

      <div class="report-section judgment-text-section">
        <div class="report-section-head">
          <span class="report-section-title">\u5224\u6C7A\u539F\u6587</span>
          <span class="muted">${u(i)} \u5B57</span>
        </div>
        ${r?`<div class="judgment-fulltext">${n(r)}</div>`:'<div class="report-empty-inline">\u9019\u7B46\u5224\u6C7A\u6C92\u6709\u53EF\u986F\u793A\u7684\u5168\u6587\u3002</div>'}
      </div>
    </div>
  </div>`}function Cs(e){return`"${(e==null?"":typeof e=="object"?JSON.stringify(e):String(e)).replace(/"/g,'""')}"`}function xt(e){let t=e.columns||[],s=e.rows||[],a=[["#",...t.map(i=>i.label||i.key)].map(Cs).join(",")],r=((Number(e.page)||1)-1)*(Number(e.page_size)||25);return s.forEach((i,o)=>{a.push([r+o+1,...t.map(l=>i[l.key])].map(Cs).join(","))}),`\uFEFF${a.join(`\r
`)}`}function kt(e){return{...e,rows:(e.rows||[]).map(t=>{let s={};for(let[a,r]of Object.entries(t))a.startsWith("_")||(s[a]=r);return s})}}function on(e){return e==="rag"?"RAG \u63D0\u554F":e==="data"?"\u8CC7\u6599\u67E5\u8A62":e||"\u5176\u4ED6"}async function Rs(e,t){let s=performance.now(),a=Bs(e,t),r=String(a.store||"query_history"),i=String(a.keyword||""),o=t.page,l=t.pageSize,f=[],g=[],h=[],m=[];if(r==="settings"){g=(await Ms({keyword:i})).map(S=>({key:S.key,value:Ts(S.value),updated_at:S.updated_at})),h=[{key:"key",label:"\u8A2D\u5B9A\u9375",type:"mono"},{key:"value",label:"\u503C",type:"longtext"},{key:"updated_at",label:"\u66F4\u65B0\u6642\u9593",type:"datetime"}];let _=new Map;g.forEach(S=>{let T=String(S.key||"").split(".")[0]||"\u5176\u4ED6";_.set(T,(_.get(T)||0)+1)}),m=Array.from(_.entries()).map(([S,T])=>({label:S,value:T})).sort((S,T)=>T.value-S.value)}else{g=(await ht({keyword:i,limit:La})).map(S=>({kind:on(S.kind),title:S.title,detail:S.detail,created_at:S.created_at})),h=[{key:"kind",label:"\u985E\u578B",type:"text"},{key:"title",label:"\u67E5\u8A62\u5167\u5BB9",type:"longtext"},{key:"detail",label:"\u6458\u8981",type:"longtext"},{key:"created_at",label:"\u6642\u9593",type:"datetime"}];let _=new Map;g.forEach(S=>_.set(S.kind,(_.get(S.kind)||0)+1)),m=Array.from(_.entries()).map(([S,T])=>({label:S,value:T})).sort((S,T)=>T.value-S.value)}let w=g.length,M=(o-1)*l,k=g.slice(M,M+l),j=Math.round(performance.now()-s),P=Ss();return P&&f.push("IndexedDB \u7121\u6CD5\u4F7F\u7528\uFF0C\u8CC7\u6599\u66AB\u5B58\u5728\u8A18\u61B6\u9AD4\uFF0C\u91CD\u65B0\u6574\u7406\u5F8C\u6703\u6D88\u5931\u3002"),{database:"indexeddb",label:"IndexedDB",status:P?"degraded":"ok",message:P?"\u700F\u89BD\u5668\u4E0D\u5141\u8A31\u4F7F\u7528 IndexedDB\uFF0C\u672C\u9801\u6539\u7528\u8A18\u61B6\u9AD4\u66AB\u5B58\u3002":null,table:r,columns:h,rows:k,total:w,page:o,page_size:l,duration_ms:j,summary:[{label:"\u7B26\u5408\u7B46\u6578",value:String(w)},{label:"\u76EE\u524D\u9801\u9762",value:`${k.length} \u7B46`},{label:"\u5132\u5B58\u6A21\u5F0F",value:ft()==="indexeddb"?"IndexedDB":"\u8A18\u61B6\u9AD4"},{label:"\u67E5\u8A62\u8017\u6642",value:`${j} ms`}],distribution:m,query_text:`INDEXEDDB OPEN 'judgment-console'
OBJECT STORE '${r}'
FILTER ${i?`keyword \u2248 '${i}'`:"1 = 1"}
ORDER BY created_at DESC
LIMIT ${l} OFFSET ${M}`,warnings:f,meta:{store:r,filters:a,client_side:!0}}}async function ln(e,t){let s=!1,a=null,r=[],i="law",o=null,l={},f=0,g=25,h="query",m=null,w=null,M=0,k=[],j=null,P=-1,N=0,_=null,S=null;e.innerHTML=`<section class="page data-page">
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
          ${b("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
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
  </section>`;let T=e.querySelector("#query-sidebar"),q=e.querySelector("#category-switch"),C=e.querySelector("#db-options-wrap"),ee=e.querySelector("#sidebar-view-switch"),H=e.querySelector("#filter-area"),ae=e.querySelector("#schema-area"),E=e.querySelector("#query-main"),D=e.querySelector("#schema-suggest-popover"),G=e.querySelector("#catalog-meta"),J=e.querySelector("#refresh-catalog"),be=c=>r.find(d=>d.id===c),ze=()=>be(i)?.databases||[],le=c=>ze().find(d=>d.id===c),xe=(c,d)=>`${c}:${d}`,te=(c,d=i)=>l[xe(d,c.id)],Ae=(c,d)=>{Ls(c,d).catch(()=>{})},Ge=()=>{if(!a){G.textContent="CATALOG \xB7 \u96E2\u7DDA",G.className="badge badge-danger badge-mono";return}let c=ze(),d=c.filter($=>$.available).length,p=be(i);G.textContent=`CATALOG \xB7 ${p?.label||i} \xB7 ${d}/${c.length} \u53EF\u7528`,G.className="badge badge-neutral badge-mono"},ke=c=>{E.innerHTML=Ca(c)},Xe=()=>{let c=_?.returnScroll??S?.returnScroll;_=null,S=null;let d=le(o),p=d?te(d):null;h==="schema"&&w?.result?E.innerHTML=Zt(w.result,A(d,w.tableId),{columnFilters:w.columnFilters||{},searchEnabled:d.id==="postgres"||d.id==="parquet"}):p?.result?E.innerHTML=yt(p.result):d&&ke(d),typeof c=="number"&&window.requestAnimationFrame(()=>window.scrollTo({top:c,behavior:"smooth"}))},ot=(c="law-article-jump")=>{let d=E.querySelector(`#${c}`),p=Hs(d?.value);if(!p){R("\u8ACB\u8F38\u5165\u8981\u8DF3\u81F3\u7684\u689D\u865F\uFF0C\u4F8B\u5982 100 \u6216 \u7B2C100\u689D\u3002","warn"),d?.focus();return}let x=[...E.querySelectorAll("[data-article-no]")].find(y=>y.dataset.articleNo===p);if(!x){R(`\u627E\u4E0D\u5230\u7B2C ${p} \u689D\u3002`,"warn");return}x.scrollIntoView({behavior:"instant",block:"center"}),x.classList.add("is-jump-target"),window.setTimeout(()=>x.classList.remove("is-jump-target"),2400)},Ze=async({lawKey:c,sourceType:d="",lawName:p="",versionId:$=""})=>{let x=le(o),y=x?te(x):null,L=h==="schema"?w?.result:null;if(!x||!y?.result&&!L||!c)return;let O=++f;_={seq:O,lawKey:c,sourceType:d,lawName:p,versionId:$?String($):"",page:1,detail:null,database:x.id,returnScroll:window.scrollY},S=null,E.innerHTML=Ya(p||c),E.scrollIntoView({behavior:"smooth",block:"start"});try{let re=await F.lawDetail(c,d,_.versionId);if(s||!_||_.seq!==O)return;_.detail=re,_.page=1,E.innerHTML=tn(re,{database:_.database,lawPage:_.page})}catch(re){if(s||!_||_.seq!==O)return;E.innerHTML=Xa(re,p||c),R(re.message||"\u7121\u6CD5\u53D6\u5F97\u6CD5\u898F\u5831\u8868\u3002","danger")}},lt=async({jid:c})=>{let d=le(o),p=d?te(d):null,$=h==="schema"?w?.result:null;if(!d||!p?.result&&!$||!c)return;let x=++f;_=null;let y=d.id==="parquet"?"parquet":"postgres";S={seq:x,jid:c,detail:null,database:d.id,source:y,returnScroll:window.scrollY},E.innerHTML=sn(c),E.scrollIntoView({behavior:"smooth",block:"start"});try{let L=await F.judgmentDetail(c,y);if(s||!S||S.seq!==x)return;S.detail=L,E.innerHTML=rn(L,{database:S.database})}catch(L){if(s||!S||S.seq!==x)return;E.innerHTML=an(L,c),R(L.message||"\u7121\u6CD5\u53D6\u5F97\u5224\u6C7A\u539F\u6587\u3002","danger")}},v=(c,d)=>`${i}:${c.id}:${d}`,A=(c,d)=>(c.tables||[]).find(p=>p.id===d)?.label||d,I=(c,d,{sort:p=null,columnFilters:$={}}={})=>{let x={column_filters:$};return c.id==="postgres"?(x.table=d,x.schema_preview=!0):c.id==="parquet"&&i==="judgment"?(x.table="judgment_documents",x.columns=Ta):c.id==="parquet"&&(x.dataset="all",x.columns=Ma),p?.key&&(x.sort=`${p.key}:${p.direction}`),x},se=async(c,d,{sort:p=null,columnFilters:$={}}={})=>{if(!d)return;dt();let x=v(c,d),y=++M;m={tableId:d},w={key:x,tableId:d,loading:!0,result:null,error:null,sort:p,columnFilters:$},ae.innerHTML=Xt(c,be(i)?.label||i,d),E.innerHTML=Ns(A(c,d));try{let L;if(c.id==="indexeddb"){let O=bt(c,10);O.values.store=d,O.page=1,L=await Rs(c,O)}else c.id==="qdrant"?L={database:"qdrant",label:"Qdrant",status:"not_configured",message:"Qdrant collection \u9700\u8981\u8A9E\u610F\u67E5\u8A62\uFF1BSchema \u50C5\u63D0\u4F9B collection \u540D\u7A31\uFF0C\u4E0D\u5217\u51FA\u524D 10 \u7B46\u8CC7\u6599\u3002",table:d,columns:[],rows:[],total:0,page:1,page_size:10,duration_ms:0,summary:[],distribution:[],query_text:"",warnings:[],meta:{}}:(L=await F.query({database:c.id,filters:I(c,d,{sort:p,columnFilters:$}),page:1,pageSize:10}),p?.key&&(L.meta={...L.meta||{},sort:p}));if(s||y!==M)return;w={key:x,tableId:d,loading:!1,result:L,error:null,sort:p,columnFilters:$},h==="schema"&&m?.tableId===d&&(ae.innerHTML=Xt(c,be(i)?.label||i,d),E.innerHTML=Zt(L,A(c,d),{columnFilters:$,searchEnabled:c.id==="postgres"||c.id==="parquet"}))}catch(L){if(s||y!==M)return;w={key:x,tableId:d,loading:!1,result:null,error:L,sort:p,columnFilters:$},h==="schema"&&m?.tableId===d&&(E.innerHTML=Ps(L,A(c,d)))}},me=()=>{let c=le(o);if(!c)return null;if(h==="schema"&&w?.result)return{db:c,tableId:w.tableId,columnFilters:w.columnFilters||{},sort:w.sort||null,mode:"schema"};let d=c?te(c):null,p=d?.result;return p&&(c.id==="postgres"||c.id==="parquet")?{db:c,tableId:p.table,columnFilters:d.columnFilters||{},sort:d.sort||null,mode:"query"}:null},W=(c,d,p)=>{if(!c)return;let $=`${c.db.id}:${c.tableId}:${d}`,x=ne.get($);x&&(window.clearTimeout(x),ne.delete($)),dt();let y={...c.columnFilters||{}},L=String(p||"").trim();if(L?y[d]=L:delete y[d],c.mode==="schema"){se(c.db,c.tableId,{sort:c.sort,columnFilters:y});return}let O=te(c.db);O.columnFilters=y,O.page=1,Ce(1)},ne=new Map,Z=()=>{N+=1,k=[],j=null,P=-1,D&&(D.hidden=!0,D.innerHTML="")},Le=(c,d)=>{let p=String(c||""),$=p.toLocaleLowerCase(),x=String(d||"").toLocaleLowerCase(),y=new Array(p.length).fill(!1),L=(Y,he)=>{for(let oe=Y;oe<Y+he;oe+=1)oe>=0&&oe<y.length&&(y[oe]=!0)},O=$.indexOf(x);if(O>=0)for(;O>=0;)L(O,x.length),O=$.indexOf(x,O+x.length);else{let Y=[];for(let he of x.match(/[一-鿿]{2,}/g)||[])for(let oe=0;oe<he.length-1;oe+=1)Y.push(he.slice(oe,oe+2));Y.push(...x.match(/[a-z0-9]+/g)||[]);for(let he of Y){let oe=$.indexOf(he);for(;oe>=0;)L(oe,he.length),oe=$.indexOf(he,oe+he.length)}}let re="",ie=0;for(;ie<p.length;)if(y[ie]){let Y=ie;for(;Y<p.length&&y[Y];)Y+=1;re+=`<mark>${n(p.slice(ie,Y))}</mark>`,ie=Y}else{let Y=ie;for(;Y<p.length&&!y[Y];)Y+=1;re+=n(p.slice(ie,Y)),ie=Y}return re||n(p)},et=(c,d)=>{if(!D)return;let p=c.getBoundingClientRect(),$=Math.min(420,Math.max(220,p.width)),x=Math.min(360,34+d*30),y=p.bottom+4;y+x>window.innerHeight-8&&(y=Math.max(8,p.top-x-4));let L=Math.min(window.innerWidth-$-8,Math.max(8,p.left));D.style.width=`${$}px`,D.style.left=`${L}px`,D.style.top=`${y}px`},fe=c=>{if(!D)return;let d=[...D.querySelectorAll(".schema-suggest-item")];d.length&&(P=Math.max(0,Math.min(d.length-1,c)),d.forEach((p,$)=>{p.classList.toggle("is-active",$===P)}),d[P].scrollIntoView({block:"nearest"}))},ge=c=>{let d=k[c],p=j;!d||!p||(Z(),W(p,p.column,d))},ct=async(c,d,p,$)=>{if(!c||!p.trim()){Z();return}let x=++N;j={...c,column:d,input:$},P=-1;try{let y=await F.schemaSuggest({database:c.db.id,table:c.tableId,column:d,query:p,limit:1e3});if(x!==N||document.activeElement!==$||!D)return;let L=Array.isArray(y.values)?y.values:[];if(k=L,!L.length){Z();return}let O=Number(y.total)>L.length?`\u5171 ${u(y.total)} \u500B\u7B26\u5408\uFF0C\u986F\u793A\u524D ${u(L.length)} \u500B`:`\u5171 ${u(y.total)} \u500B\u7B26\u5408`;D.innerHTML=`<div class="schema-suggest-head">${n(O)}</div>${L.map((re,ie)=>`<button class="schema-suggest-item" type="button"
            data-schema-suggest-index="${ie}"
            title="${n(re)}">${Le(re,p)}</button>`).join("")}`,et($,L.length),D.hidden=!1}catch{Z()}},dt=()=>{let c=document.activeElement;c instanceof HTMLElement&&c.matches("[data-schema-search]")&&c.blur(),Z()},ps=(c,{resetReport:d=!1}={})=>{dt();let p=te(c);if(q.innerHTML=Es(r,i),C.innerHTML=Na(ze(),c.id),ee.innerHTML=Pa(h),h==="schema"?(H.hidden=!0,H.innerHTML="",ae.hidden=!1,ae.innerHTML=Xt(c,be(i)?.label||i,m?.tableId||"")):(ae.hidden=!0,ae.innerHTML="",H.hidden=!1,H.innerHTML=`${qs(c)}${Kt(c,p)}<div class="sidebar-note">${js(c)}</div>`),Ge(),h==="schema"){let $=m?v(c,m.tableId):"";if(w&&w.key===$){let x=A(c,w.tableId);w.loading?E.innerHTML=Ns(x):w.error?E.innerHTML=Ps(w.error,x):E.innerHTML=Zt(w.result,x,{columnFilters:w.columnFilters||{},searchEnabled:c.id==="postgres"||c.id==="parquet"})}else E.innerHTML=Ga(c);return}d?ke(c):p.result?E.innerHTML=yt(p.result):ke(c)},ms=(c,{persist:d=!0,resetReport:p=!1}={})=>{let $=ze(),x=$.find(L=>L.id===c)||$[0];if(!x)return;_=null,S=null,m=null,w=null,M+=1,o=x.id;let y=xe(i,x.id);l[y]||(l[y]=bt(x,g)),ps(x,{resetReport:p}),d&&(Ae(`data.last_database.${i}`,x.id),Ae("data.last_category",i))},vs=(c,{persist:d=!0,resetReport:p=!0,databaseId:$=null}={})=>{let x=be(c)||r[0];if(!x)return;i=x.id,_=null,S=null;let y=x.databases||[],L=$&&y.find(O=>O.id===$)||y.find(O=>O.id===o)||y[0];if(o=L?.id||null,!L){q.innerHTML=Es(r,i),C.innerHTML=`<div class="sidebar-notice">${U({tone:"warn",title:"\u6C92\u6709\u53EF\u7528\u7684\u8CC7\u6599\u4F86\u6E90",text:"\u9019\u500B\u985E\u5225\u76EE\u524D\u6C92\u6709\u8CC7\u6599\u5EAB\u9078\u9805\u3002"})}</div>`,H.innerHTML="",Ge();return}ms(L.id,{persist:!1,resetReport:p}),d&&(Ae("data.last_category",x.id),Ae(`data.last_database.${x.id}`,L.id))},da=c=>{let d=te(c),p=H.querySelector("#data-filter-form");p&&(d.values=$t(p,c,d))},Ce=async(c=null)=>{let d=le(o);if(!d)return;dt();let p=te(d);da(d),c!==null&&(p.page=c),(!Number.isFinite(p.page)||p.page<1)&&(p.page=1);let $=++f;_=null,S=null,E.innerHTML=at(d);let x=H.querySelector("#run-query");z(x,!0,"\u67E5\u8A62\u4E2D\u2026");try{let y;if(d.id==="indexeddb"?y=await Rs(d,p):y=await F.query({database:d.id,filters:Yt(d,p),page:p.page,pageSize:p.pageSize}),s||$!==f)return;y.meta={...y.meta||{},column_filters:p.columnFilters||{},searchable:d.id==="postgres"||d.id==="parquet",sort:p.sort||y.meta?.sort||null},p.result=y,p.page=Number(y.page)||p.page,p.pageSize=Number(y.page_size)||p.pageSize,E.innerHTML=yt(y);let L=be(i)?.label||i;await gt({kind:"data",title:`${L} \xB7 ${d.label} \xB7 ${y.table||y.label||"query"}`,detail:`${u(y.total)} \u7B46 \xB7 ${B(y.duration_ms)}`,payload:{category:i,database:d.id,filters:Yt(d,p),page:p.page,page_size:p.pageSize}}),Ae("data.last_query",{category:i,database:d.id,filters:Yt(d,p),page:p.page,page_size:p.pageSize,at:new Date().toISOString()})}catch(y){if(s||$!==f)return;E.innerHTML=_t(y,d),R(y.message||"\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{!s&&$===f&&z(x,!1)}},It=async()=>{J.disabled=!0,z(J,!0,"\u6574\u7406\u4E2D\u2026");try{let[c,d,p,$,x]=await Promise.all([F.catalog(),st("data.last_category","law"),st("data.last_database.law","postgres"),st("data.last_database.judgment","postgres"),st("data.page_size",25)]);if(s)return;a=c,r=Array.isArray(a.categories)?a.categories:[],g=Is.includes(Number(x))?Number(x):25;for(let O of r)for(let re of O.databases||[]){let ie=xe(O.id,re.id);l[ie]||(l[ie]=bt(re,g))}let y=r.find(O=>O.id===d)||r[0];if(!y){q.innerHTML="",C.innerHTML=`<div class="sidebar-notice">${U({tone:"danger",title:"\u6C92\u6709\u53EF\u7528\u7684\u5206\u985E",text:"Catalog \u6C92\u6709\u56DE\u50B3\u6CD5\u898F\u547D\u4EE4\u6216\u5224\u6C7A\u5206\u985E\u3002"})}</div>`;return}let L=y.id==="judgment"?$:p;if(i=y.id,o=null,vs(y.id,{persist:!1,resetReport:!0,databaseId:L}),s)return;R("\u8CC7\u6599\u5EAB catalog \u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(c){if(s)return;a=null,r=[],q.innerHTML="",Ge(),C.innerHTML=`<div class="sidebar-notice">${U({tone:"danger",title:"\u7121\u6CD5\u8B80\u53D6 catalog",text:n(c.message||"\u8ACB\u78BA\u8A8D API \u662F\u5426\u555F\u52D5\u3002")})}
      <button class="btn btn-secondary btn-sm" type="button" id="catalog-retry" style="margin-top:10px">
        ${b("refresh",14)}<span>\u91CD\u8A66</span>
      </button></div>`,E.innerHTML=`<div class="report-empty">${de({iconName:"server",title:"API \u76EE\u524D\u7121\u6CD5\u9023\u7DDA",text:"\u67E5\u8A62\u5831\u8868\u9700\u8981 FastAPI \u63D0\u4F9B catalog \u8207\u8CC7\u6599\u67E5\u8A62 API\u3002\u8ACB\u78BA\u8A8D judgment-web \u5DF2\u555F\u52D5\u3002"})}</div>`}finally{s||(J.disabled=!1,z(J,!1))}};T.addEventListener("change",c=>{let d=c.target;if(d.name==="category"){vs(d.value);return}if(d.name==="database"){ms(d.value);return}let p=le(o);if(!p)return;let $=te(p),x=H.querySelector("#data-filter-form");!x||!d.name||($.values=$t(x,p,$),$.page=1,d.name==="table"&&(_=null,S=null,$.sort=null,$.columnFilters={},$.result=null,H.innerHTML=Kt(p,$),ke(p)))}),T.addEventListener("input",c=>{let d=le(o);if(!d)return;let p=H.querySelector("#data-filter-form");if(!p||!c.target.name||c.target.name==="table")return;let $=te(d);$.values=$t(p,d,$)}),T.addEventListener("submit",c=>{c.target.id==="data-filter-form"&&(c.preventDefault(),Ce(1))}),T.addEventListener("click",c=>{let d=c.target.closest("[data-action]"),p=d?.dataset.action;if(p==="sidebar-view"){let $=le(o);if(!$)return;let x=te($),y=H.querySelector("#data-filter-form");y&&h==="query"&&(x.values=$t(y,$,x)),h=d.dataset.view==="schema"?"schema":"query",ps($);return}if(p==="select-schema-table"){let $=le(o);if(!$)return;se($,d.dataset.tableId||"");return}if(p==="reset"){let $=le(o);if(!$)return;_=null,S=null;let x=te($);l[xe(i,$.id)]=bt($,x.pageSize),H.innerHTML=`${qs($)}${Kt($,l[xe(i,$.id)])}<div class="sidebar-note">${js($)}</div>`,ke($),R("\u5DF2\u91CD\u8A2D\u9019\u500B\u8CC7\u6599\u5EAB\u7684\u67E5\u8A62\u689D\u4EF6\u3002","info",2400);return}c.target.closest("#catalog-retry")&&It()}),E.addEventListener("input",c=>{let d=c.target.closest("[data-schema-search]");if(!d)return;let p=me();if(!p)return;let $=d.dataset.schemaSearch||"",x=d.value,y=`${p.mode}:${p.db.id}:${p.tableId}:${$}`,L=ne.get(y);if(L&&window.clearTimeout(L),!x.trim()){ne.delete(y),Z(),W(p,$,"");return}let O=window.setTimeout(()=>{ne.delete(y),ct(p,$,x,d)},250);ne.set(y,O)}),E.addEventListener("keydown",c=>{let d=c.target.closest("[data-schema-search]");if(!d)return;let p=me();if(p){if(c.key==="Escape"){Z();return}if(c.key==="ArrowDown"||c.key==="ArrowUp"){if(!D||D.hidden)return;c.preventDefault();let $=c.key==="ArrowDown"?1:-1;fe(P<0?$>0?0:k.length-1:P+$);return}if(c.key==="Enter"){if(c.preventDefault(),D&&!D.hidden&&P>=0){ge(P);return}W(p,d.dataset.schemaSearch||"",d.value)}}}),D?.addEventListener("mousedown",c=>{c.preventDefault()}),D?.addEventListener("click",c=>{let d=c.target.closest("[data-schema-suggest-index]");d&&ge(Number(d.dataset.schemaSuggestIndex))});let fs=c=>{c.target.closest("[data-schema-search]")||D?.contains(c.target)||Z()};return document.addEventListener("click",fs),window.addEventListener("scroll",Z,!0),window.addEventListener("resize",Z),E.addEventListener("keydown",c=>{c.target.matches(".law-jump-input")&&c.key==="Enter"&&(c.preventDefault(),ot(c.target.id))}),E.addEventListener("click",async c=>{let d=c.target.closest("[data-action]");if(!d)return;let p=d.dataset.action,$=le(o),x=$?te($):null,y=x?.result;if(p==="back-to-results"){Xe();return}if(p==="open-law"){Ze({lawKey:d.dataset.lawKey||"",sourceType:d.dataset.lawSource||"",lawName:d.dataset.lawName||""});return}if(p==="open-judgment"){lt({jid:d.dataset.jid||""});return}if(p==="jump-article"){ot(d.dataset.jumpInput||"law-article-jump");return}if(p==="sort-column"){let L=d.dataset.sortKey||"";if(!L||!$)return;if(h==="schema"&&w?.result){let ie=w.sort,Y=L==="jdate"||L==="law_modified_date"||L==="article_count"||L==="citation_count"||L==="full_text_length"||L==="created_at"||L==="updated_at",he=ie?.key===L?ie.direction==="asc"?"desc":"asc":Y?"desc":"asc";se($,w.tableId,{sort:{key:L,direction:he},columnFilters:w.columnFilters||{}});return}if(!x)return;let O=x.sort,re=O?.key===L?O.direction==="asc"?"desc":"asc":L==="jdate"?"desc":"asc";x.sort={key:L,direction:re},Ce(1);return}if(p==="retry"){Ce(x?.page||1);return}if(y){if(p==="prev-page"){Ce(Math.max(1,Number(y.page)-1));return}if(p==="next-page"){let L=Math.max(1,Math.ceil(Number(y.total)/Number(y.page_size)));Ce(Math.min(L,Number(y.page)+1));return}if(p==="copy-query"){let L=await mt(y.query_text||"");R(L?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",L?"ok":"warn");return}if(p==="export-json"){let L=`${y.database}-${y.table||"query"}-page-${y.page}.json`;je(L,JSON.stringify(kt(y),null,2),"application/json;charset=utf-8"),R(`\u5DF2\u532F\u51FA ${L}`,"ok");return}if(p==="export-csv"){let L=`${y.database}-${y.table||"query"}-page-${y.page}.csv`;je(L,xt(y),"text/csv;charset=utf-8"),R(`\u5DF2\u532F\u51FA ${L}`,"ok")}}}),E.addEventListener("change",c=>{let d=c.target.closest("[data-action='select-law-version']");if(d&&_){Ze({lawKey:_.lawKey,sourceType:_.sourceType,lawName:_.lawName,versionId:d.value});return}if(!c.target.matches("[data-page-size]"))return;let p=le(o);if(!p)return;let $=te(p);$.pageSize=Number(c.target.value)||25,$.page=1,Ae("data.page_size",$.pageSize),Ce(1)}),J.addEventListener("click",()=>{It()}),await It(),t&&typeof t.setTitle=="function"&&t.setTitle("\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"),()=>{s=!0;for(let c of ne.values())window.clearTimeout(c);ne.clear(),Z(),document.removeEventListener("click",fs),window.removeEventListener("scroll",Z,!0),window.removeEventListener("resize",Z)}}var Gs=[10,25,50,100],cn=[{value:"started_at:desc",label:"Timestamp \u65B0 \u2192 \u820A"},{value:"started_at:asc",label:"Timestamp \u820A \u2192 \u65B0"},{value:"duration_ms:desc",label:"\u8017\u6642\u591A \u2192 \u5C11"},{value:"duration_ms:asc",label:"\u8017\u6642\u5C11 \u2192 \u591A"}];function ns(){return{process:"",module:"",status:"",method:"",model:"",keyword:"",from_date:"",to_date:"",min_duration:"",sort:"started_at:desc"}}function dn(e,t=e){return`<option value="${n(e)}">${n(t)}</option>`}function nt(e,t,s,a,r=""){return`<div class="field">
    <label class="field-label" for="performance-${e}">
      <span>${n(t)}</span>
      <span class="field-tag">${n(e)}</span>
    </label>
    <select class="select" id="performance-${e}" name="${n(e)}">
      ${dn("","\u5168\u90E8")}
      ${s.map(i=>`<option value="${n(i)}" ${String(i)===String(a)?"selected":""}>${n(i)}</option>`).join("")}
    </select>
    ${r?`<span class="field-help">${n(r)}</span>`:""}
  </div>`}function un(e,t){let s=cn.map(a=>`<option value="${a.value}" ${a.value===t.sort?"selected":""}>${a.label}</option>`).join("");return`
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
    </div>`}function Us(){let e=document.getElementById("performance-filter-form");if(!e)return ns();let t=new FormData(e);return{process:String(t.get("process")||""),module:String(t.get("module")||""),status:String(t.get("status")||""),method:String(t.get("method")||""),model:String(t.get("model")||""),keyword:String(t.get("keyword")||"").trim(),from_date:String(t.get("from_date")||""),to_date:String(t.get("to_date")||""),min_duration:String(t.get("min_duration")||""),sort:String(t.get("sort")||"started_at:desc")}}function Qs(e){if(e==null)return"null";if(typeof e=="object")try{let t=JSON.stringify(e);return t.length>160?`${t.slice(0,157)}\u2026`:t}catch{return String(e)}return String(e)}function pn(e){if(!e)return"";let t=new Date(e);if(Number.isNaN(t.getTime()))return"";let s=String(t.getHours()).padStart(2,"0"),a=String(t.getMinutes()).padStart(2,"0"),r=String(t.getSeconds()).padStart(2,"0"),i=String(t.getMilliseconds()).padStart(3,"0");return`${s}:${a}:${r}.${i}`}function mn(e){let t=String(e?.module||"");return t.includes("static")||t.includes("frontend")?"is-client":t.includes("judgment.rag")?"is-rag":t.includes("judgment.web.app")?"is-api":t.includes("judgment.web.query")?"is-data":t.includes("judgment.judgment_index")?"is-index":"is-other"}function vn(e){let t=new Map(e.map(a=>[a.seq,a.parent_seq])),s=new Map;for(let a of e){if(Number.isInteger(a.depth)){s.set(a.seq,a.depth);continue}let r=0,i=a.parent_seq,o=0;for(;i&&t.has(i)&&o<20;)r+=1,i=t.get(i),o+=1;s.set(a.seq,r)}return s}function fn(e){let t=Object.entries(e||{});if(!t.length)return'<span class="muted">\u7121\u53C3\u6578</span>';let s=t.slice(0,8),a=t.length-s.length;return`<div class="flow-param-list">${s.map(([r,i])=>`<span class="flow-param">
        <span class="flow-param-key">${n(r)}</span>
        <span class="flow-param-value">${n(Qs(i))}</span>
      </span>`).join("")}${a>0?`<span class="flow-param-more">+${a}</span>`:""}</div>`}function gn(e){let t=new Map,s=Math.max(0,Number(e[0]?.offset_ms)||0);return e.forEach((a,r)=>{let i=Math.max(0,Number(a.offset_ms)||0),o=Math.max(0,Number(a.duration_ms)||0),l=e[r+1],f=l?Math.max(i,Number(l.offset_ms)||i):null,g=f===null?i+o:f,h=Math.max(0,g-i),m=Math.max(0,g-s);t.set(a.seq,{offset:i,duration:o,lap:h,cumulative:m})}),t}function hn(e,t,s,a){let r=a.get(e.seq)||{},i=Math.max(0,Number(r.duration)||0),o=Math.max(0,Number(r.offset)||0),l=Math.max(0,Number(r.lap)||0),f=Math.max(0,Number(r.cumulative)||0),g=Math.max(t,o+i,1),h=Math.min(100,o/g*100),m=Math.min(100-h,Math.max(.6,l/g*100)),w=s.get(e.seq)||0,k=pn(e.started_at)||`+${o.toFixed(0)} ms`,j=e.started_at?`\u958B\u59CB\uFF1A${K(e.started_at)} \xB7 +${o.toFixed(1)} ms`:`\u958B\u59CB\uFF1A+${o.toFixed(1)} ms`;return`<div class="flow-segment ${e.status==="error"?"is-error":""}" style="--depth:${Math.min(w,8)}">
    <div class="flow-segment-head">
      <span class="flow-seq">#${n(String(e.seq??"\u2014"))}</span>
      <span class="flow-segment-name">${n(e.name||"unnamed")}</span>
      <span class="flow-segment-start" title="${n(j)}">${n(k)}</span>
      <span class="flow-segment-duration" title="\u8DDD\u4E0B\u4E00\u9EDE ${B(l)}\uFF1B\u7D2F\u8A08 ${B(f)}">${B(l)}</span>
      <span class="flow-segment-span" title="\u5F9E\u7B2C\u4E00\u9EDE\u5230\u672C\u9EDE\u7D50\u675F\u7684\u7D2F\u8A08\u6642\u9593">\u7D2F\u8A08 ${B(f)}</span>
    </div>
    <div class="flow-segment-loc">
      <span class="flow-segment-loc-text">${n(e.module||"\u2014")}<span class="flow-segment-dot">\xB7</span>${n(e.function||"\u2014")}</span>
      <span class="flow-segment-mobile-cum" title="\u5F9E\u7B2C\u4E00\u9EDE\u5230\u672C\u9EDE\u7D50\u675F\u7684\u7D2F\u8A08\u6642\u9593">\u7D2F\u8A08 ${B(f)}</span>
    </div>
    <div class="flow-track" title="\u958B\u59CB +${o.toFixed(1)} ms \xB7 \u8DDD\u4E0B\u4E00\u9EDE ${B(l)} \xB7 \u7D2F\u8A08 ${B(f)}">
      <span class="flow-bar ${mn(e)}" style="left:${h.toFixed(2)}%;width:${m.toFixed(2)}%"></span>
    </div>
    ${fn(e.params)}
    ${e.error?`<div class="flow-segment-error">${n(e.error)}</div>`:""}
  </div>`}function bn(e){let t=Array.isArray(e?.segments)?e.segments:[],s=Array.isArray(e?.models)?e.models:[],a=e?.client||{},r=Math.max(...t.map(l=>Number(l.avg_ms)||0),1),i=a.samples?B(a.avg_total_ms??0):"\u2014",o=a.samples?B(a.avg_render_ms??0):"\u2014";return`<div class="perf-flow-stats">
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
  </div>`}function pe(e){let t=Math.max(0,Number(e)||0);if(!t)return"\u2014";if(t<1e3)return`${Math.round(t)} ms`;let s=Math.round(t/1e3),a=Math.floor(s/3600),r=Math.floor(s%3600/60),i=s%60;return a?`${a}h ${String(r).padStart(2,"0")}m ${String(i).padStart(2,"0")}s`:r?`${r}m ${String(i).padStart(2,"0")}s`:`${(t/1e3).toFixed(1)}s`}function Js(e){let t=String(e?.task||"").trim();return t?t==="auto"?"\u81EA\u52D5\u63A5\u7E8C":`task ${t}`:"\u7D22\u5F15"}function $n(e){let t=(e||[]).slice(-12);if(!t.length)return'<p class="muted" style="font-size:11px">\u5C1A\u7121\u7D22\u5F15\u7D00\u9304\u3002</p>';let s=Math.max(...t.map(a=>Number(a.points_per_second)||0),.1);return`<div class="index-run-bars">${t.map(a=>{let r=Number(a.points_per_second)||0,i=Math.max(2,r/s*100);return`<div class="index-run-row">
        <div class="index-run-label">
          <strong>${n(Js(a))}</strong>
          <span>${n(K(a.started_at))}</span>
        </div>
        <div class="index-run-track" title="${n(`${u(a.indexed_count)} \u7B46 \xB7 ${pe(a.duration_ms)} \xB7 ${u(a.batch_count)} \u6279`)}">
          <span style="width:${i.toFixed(1)}%"></span>
        </div>
        <div class="index-run-value">
          <strong>${r.toFixed(1)}</strong><span>\u7B46/\u79D2</span>
          <em>${u(a.indexed_count)} \u7B46 \xB7 ${pe(a.duration_ms)}</em>
        </div>
      </div>`}).join("")}</div>`}function yn(e){let t=(Array.isArray(e.time_breakdown)?e.time_breakdown:[]).map(s=>({...s,ms:Number(s.ms)||0,percent:Number(s.percent)||0})).filter(s=>s.ms>0);return t.length?`<div class="index-breakdown-bar">${t.map(s=>`<span class="index-seg index-seg-${n(s.key)}" style="width:${Math.max(.5,s.percent).toFixed(2)}%" title="${n(`${s.label} ${pe(s.ms)}\uFF08${s.percent.toFixed(1)}%\uFF09`)}"></span>`).join("")}</div>
    <div class="index-breakdown-legend">${t.map(s=>`<span class="index-legend-item">
            <i class="index-seg index-seg-${n(s.key)}"></i>
            <span>${n(s.label)}</span>
            <strong>${pe(s.ms)}</strong>
            <em>${s.percent.toFixed(1)}%</em>
          </span>`).join("")}</div>`:'<div class="index-chart-empty">\u6B64\u7B46\u7D22\u5F15\u7D00\u9304\u5C1A\u672A\u5305\u542B\u968E\u6BB5\u8A08\u6642\uFF1B\u5F8C\u7E8C\u7D22\u5F15\u6703\u8A18\u9304 Ollama Embedding\u3001Qdrant Upsert \u8207 PostgreSQL \u7D22\u5F15\u7D00\u9304\u7684\u6642\u9593\u7D44\u6210\u3002</div>'}function wn(e,t){let s=(Array.isArray(e)?e:[]).map(N=>({elapsed:Math.max(0,Number(N.elapsed_s)||0),indexed:Math.max(0,Number(N.indexed)||0)})).filter(N=>N.indexed>0);if(s.length<2)return"";let a=Math.max(...s.map(N=>N.elapsed),(Number(t)||0)/1e3,1),r=Math.max(...s.map(N=>N.indexed),1),i=760,o=150,l=12,f=12,g=i-l*2,h=o-f*2,m=s.map(N=>[l+N.elapsed/a*g,o-f-N.indexed/r*h]),w=m.map(([N,_],S)=>`${S===0?"M":"L"}${N.toFixed(1)},${_.toFixed(1)}`).join(" "),M=`${w} L${m[m.length-1][0].toFixed(1)},${o-f} L${m[0][0].toFixed(1)},${o-f} Z`,k=Math.max(1,Math.ceil(m.length/14)),j=m.map(([N,_],S)=>S%k===0||S===m.length-1?`<circle cx="${N.toFixed(1)}" cy="${_.toFixed(1)}" r="2.6" />`:"").join(""),P=[0,1,2,3].map(N=>{let _=f+h/3*N;return`<line x1="${l}" y1="${_.toFixed(1)}" x2="${i-l}" y2="${_.toFixed(1)}" class="index-chart-grid" />`}).join("");return`<div class="index-chart-card index-progress-card">
    <div class="index-chart-head">
      <span>\u672C\u6B21\u7D22\u5F15\u9032\u5EA6</span>
      <span>${u(r)} \u7B46 \xB7 ${pe(a*1e3)}</span>
    </div>
    <svg class="index-progress-svg" viewBox="0 0 ${i} ${o}" role="img" aria-label="\u7D22\u5F15\u9032\u5EA6\u6298\u7DDA\u5716">
      ${P}
      <path d="${M}" class="index-progress-area"></path>
      <path d="${w}" class="index-progress-line"></path>
      ${j}
      <line x1="${l}" y1="${o-f}" x2="${i-l}" y2="${o-f}" class="index-chart-axis"></line>
      <line x1="${l}" y1="${f}" x2="${l}" y2="${o-f}" class="index-chart-axis"></line>
    </svg>
    <div class="index-progress-labels">
      <span>0</span>
      <span>${pe(a*500)}</span>
      <span>${pe(a*1e3)}</span>
    </div>
  </div>`}function _n(e){if(!e||!e.latest)return"";let t=e.latest,s=Array.isArray(e.runs)?e.runs:[],a=e.average||{},r=t.coverage||{},i=r.total_judgments>0?`${u(r.indexed_judgments)} / ${u(r.total_judgments)}\uFF08${(100*r.indexed_judgments/r.total_judgments).toFixed(1)}%\uFF09`:"\u2014",o=[{label:"\u7576\u6B21\u57F7\u884C\u7B46\u6578",value:u(t.indexed_count),note:`${u(t.batch_count)} \u6279 \xD7 ${u(t.batch_size)} \u7B46`},{label:"\u5E73\u5747\u6BCF\u79D2\u7B46\u6578",value:`${(Number(t.points_per_second)||0).toFixed(1)}`,note:"\u7B46/\u79D2"},{label:"\u7576\u6B21\u4F7F\u7528\u6642\u9593",value:pe(t.duration_ms),note:`${u(t.scanned_count)} \u7B46\u5DF2\u6383\u63CF`},{label:"\u5E73\u5747\u6BCF\u6279\u6642\u9593",value:pe(t.batch_avg_ms),note:t.batch_min_ms||t.batch_max_ms?`\u6700\u5FEB ${pe(t.batch_min_ms)} \xB7 \u6700\u6162 ${pe(t.batch_max_ms)}`:"\u4EE5\u7E3D\u8017\u6642 \xF7 \u6279\u6578\u8A08\u7B97"}];return`<section class="index-perf-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">\u7D22\u5F15\u6548\u80FD</div>
        <div class="index-perf-sub">\u5224\u6C7A\u5411\u91CF\u7D22\u5F15 \xB7 \u6700\u8FD1 ${u(e.run_count)} \u6B21\u57F7\u884C</div>
      </div>
      <span class="chip">${n(Js(t))}</span>
    </div>
    <div class="index-perf-summary">
      ${o.map(l=>`<div class="index-perf-stat">
            <div class="summary-label">${n(l.label)}</div>
            <div class="index-perf-value">${n(l.value)}</div>
            <div class="index-perf-note">${n(l.note)}</div>
          </div>`).join("")}
    </div>
    <div class="index-perf-meta">
      <span><strong>\u6700\u8FD1\u4E00\u6B21</strong> ${n(K(t.started_at))}</span>
      <span><strong>batch</strong> ${u(t.batch_size)} \u7B46\uFF0F\u6279</span>
      <span><strong>embedding \u4E0A\u9650</strong> ${t.max_chars?`${u(t.max_chars)} \u5B57`:"\u2014"}</span>
      <span><strong>collection</strong> ${u(t.collection_points)} points</span>
      <span><strong>\u8986\u84CB\u7387</strong> ${n(i)}</span>
      <span><strong>\u5E73\u5747\u6BCF\u6B21\u57F7\u884C</strong> ${pe(a.duration_ms)} \xB7 ${(Number(a.points_per_second)||0).toFixed(1)} \u7B46/\u79D2</span>
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
          <span>${pe(t.duration_ms)}</span>
        </div>
        ${yn(t)}
      </div>
    </div>
    ${wn(t.progress,t.duration_ms)}
  </section>`}function xn(e){let t=Number(e.total)||0,s=Number(e.page_size)||25,a=Number(e.page)||1,r=Math.max(1,Math.ceil(t/s)),i=t?(a-1)*s+1:0,o=Math.min(a*s,t);return`<div class="pagination-bar">
    <div class="pagination-info">
      \u7B2C <strong>${a}</strong> / ${r} \u9801 \xB7
      \u986F\u793A ${u(i)}\u2013${u(o)} / ${u(t)} \u7B46
    </div>
    <div class="pagination-actions">
      <label class="page-size">\u6BCF\u9801
        <select class="select" data-page-size aria-label="\u6BCF\u9801\u7B46\u6578">
          ${Gs.map(l=>`<option value="${l}" ${l===s?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${a<=1?"disabled":""} aria-label="\u4E0A\u4E00\u9801">${b("chevronLeft",13)}</button>
      <span class="page-btn" aria-hidden="true">${a}</span>
      <button class="page-btn" type="button" data-action="next-page" ${a>=r?"disabled":""} aria-label="\u4E0B\u4E00\u9801">${b("chevronRight",13)}</button>
    </div>
  </div>`}function kn(e,t){let s=e.flow&&typeof e.flow=="object"?e.flow:null,a=Array.isArray(s?.segments)?[...s.segments].sort((k,j)=>Number(k.seq)-Number(j.seq)):[],r=s?.summary||{},i=Array.isArray(r.models)?r.models:[],o=s?.client||{},l=s?.metadata||{},f=l.question||"",g=l.answer||"",h=f||g?`<div class="perf-flow-qa">
          ${f?`<div class="perf-flow-qa-row"><strong>RAG \u554F\u984C</strong><span>${n(f)}</span></div>`:""}
          ${g?`<div class="perf-flow-qa-row"><strong>RAG \u7B54\u6848</strong><span>${n(g)}</span></div>`:""}
        </div>`:"",m=Math.max(Number(s?.total_ms)||0,Number(e.duration_ms)||0,...a.map(k=>(Number(k.offset_ms)||0)+(Number(k.duration_ms)||0)),1),w=vn(a),M=gn(a);return`<details class="perf-record" ${t===0?"open":""}>
    <summary class="perf-record-summary">
      <span class="perf-record-id">#${n(String(e.id))}</span>
      <span class="perf-record-main">
        <span class="perf-record-title">${n(e.process||"\u672A\u547D\u540D")}</span>
        <span class="perf-record-path mono">${n(e.method||"")} ${n(e.path||"")}</span>
      </span>
      <span class="perf-record-time">${K(e.started_at)}</span>
      <span class="perf-record-duration">${B(e.duration_ms)}</span>
      ${Q(e.status)}
      <span class="perf-record-chevron">${b("chevronRight",14)}</span>
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
      ${h}
      ${i.length?`<div class="chips perf-record-models">${i.map(k=>`<span class="chip">${n(k)}</span>`).join("")}</div>`:""}
      ${a.length?`<div class="flow-axis"><span>0 ms</span><span>${B(m)}</span></div>
            <div class="flow-timeline">${a.map(k=>hn(k,m,w,M)).join("")}</div>`:`<div class="perf-no-flow">\u6B64\u7D00\u9304\u6C92\u6709 flow \u660E\u7D30\uFF08\u53EF\u80FD\u662F\u820A\u8CC7\u6599\u6216 CLI \u7D00\u9304\uFF09\u3002${e.params_text&&e.params_text!=="{}"?`<pre>${n(e.params_text)}</pre>`:""}</div>`}
      ${s?`<details class="flow-json">
              <summary>Flow JSON \xB7 ${a.length} \u6BB5</summary>
              <pre>${n(JSON.stringify(s,null,2))}</pre>
            </details>`:""}
    </div>
  </details>`}var rt={embedding:"Embedding",retrieval:"Qdrant \u6AA2\u7D22",context:"PostgreSQL \u53D6\u6587",llm:"LLM \u751F\u6210",validation:"\u5F15\u7528\u9A57\u8B49"},zs={embedding:"EMB",retrieval:"\u6AA2\u7D22",context:"\u53D6\u6587",llm:"LLM",validation:"\u9A57\u8B49",overhead:"\u5176\u4ED6"};function Vs(e){return{pending:"\u7B49\u5F85",running:"\u57F7\u884C\u4E2D",success:"\u5B8C\u6210",partial:"\u90E8\u5206\u6210\u529F",failed:"\u5931\u6557",skipped:"\u7565\u904E"}[e]||e||"\u672A\u77E5"}function Sn(e){let t=String(e.status||"pending"),s=Math.max(0,Math.min(100,Number(e.progress)||0)),a=t==="pending"?0:t==="running"?Math.max(s,12):100,r=t==="running"?"\u57F7\u884C\u4E2D\u2026":t==="pending"?"\u7B49\u5F85":e.duration_ms?B(e.duration_ms):Vs(t);return`<div class="test-flow-step is-${n(t)}">
    <div class="test-flow-step-head">
      <span class="test-flow-model" title="${n(e.model||"")}">${n(e.model||"\u2014")}</span>
      <span class="test-flow-step-meta">${n(r)}</span>
    </div>
    <div class="test-flow-step-loc">${n(e.module||"\u2014")}<span class="flow-segment-dot">\xB7</span>${n(e.function||"\u2014")}</div>
    <div class="test-flow-track">
      <span class="test-flow-bar" style="width:${a}%"></span>
    </div>
    ${e.error_message?`<div class="test-flow-error">${n(e.error_message)}</div>`:""}
    ${e.details&&Object.keys(e.details).length?`<div class="test-flow-details">${n(Object.entries(e.details).slice(0,4).map(([i,o])=>`${i}=${Qs(o)}`).join(" \xB7 "))}</div>`:""}
  </div>`}function An(e,t){if(!t.length)return"";let s=t.reduce((a,r)=>a+(Number(r.progress)||0),0)/t.length;return`<section class="test-flow-stage">
    <div class="test-flow-stage-head">
      <span class="test-flow-stage-title">${n(rt[e]||e)}</span>
      <span class="test-flow-stage-meta">${t.length} \u500B\u7A0B\u5E8F \xB7 ${Math.round(s)}%</span>
    </div>
    <div class="test-flow-stage-steps">${t.map(Sn).join("")}</div>
  </section>`}function Ws(e,t){let s=Date.now(),a=new Map;for(let m of t){let w=Number(m.duration_ms)||0;if(m.status==="running"&&m.started_at){let M=Date.parse(m.started_at);Number.isFinite(M)&&(w=Math.max(w,s-M))}a.set(m.stage,(a.get(m.stage)||0)+w)}let r=Array.isArray(e.stage_order)?e.stage_order:Object.keys(rt),i=[],o=new Set;for(let m of r)t.some(w=>w.stage===m)&&(o.add(m),i.push({stage:m,label:rt[m]||m,short:zs[m]||m,duration:a.get(m)||0}));for(let[m,w]of a)o.has(m)||i.push({stage:m,label:rt[m]||m,short:zs[m]||m,duration:w});let l=i.reduce((m,w)=>m+w.duration,0),f=Number(e.total_ms)||0,g=Math.max(l,f),h=Math.max(0,g-l);return h>1&&i.push({stage:"overhead",label:"\u5176\u4ED6\uFF0F\u6392\u7A0B",short:"\u5176\u4ED6",duration:h}),{entries:i,total:g||l,stepTotal:l}}function Ln(e,t){let{entries:s,total:a}=Ws(e,t),r=s.filter(o=>o.duration>0).map(o=>{let l=a?o.duration/a*100:0;return`<span class="test-flow-time-seg stage-${n(o.stage)}" style="width:${l.toFixed(2)}%" title="${n(o.label)} \xB7 ${B(o.duration)}\uFF08${l.toFixed(1)}%\uFF09">${l>=8?n(o.short):""}</span>`}).join(""),i=s.map(o=>{let l=a?o.duration/a*100:0;return`<span class="test-flow-legend-item">
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
  </div>`}function St(e,t,s,a={}){let r=a.showHistory!==!1,i=[`<option value="" ${s?"":"selected"}>\u76EE\u524D\uFF0F\u6700\u65B0\u6E2C\u8A66</option>`,...(t||[]).map(_=>`<option value="${n(_.run_id)}" ${_.run_id===s?"selected":""}>${n(Vs(_.status))} \xB7 ${n((_.question||"\u672A\u547D\u540D").slice(0,28))} \xB7 ${n(K(_.started_at))}</option>`)].join(""),o=r?`<label class="test-flow-select-label">\u6B77\u53F2
        <select class="select" id="test-run-select">${i}</select>
      </label>
      <button class="btn btn-secondary btn-sm" type="button" id="test-flow-refresh">
        ${b("refresh",13)}<span>\u66F4\u65B0</span>
      </button>`:`<a class="btn btn-secondary btn-sm" href="#/performance">
        ${b("activity",13)}<span>\u6B77\u53F2 Flow</span>
      </a>`,l=`<div class="test-flow-head">
    <div class="test-flow-heading">
      <div class="eyebrow">PERFORMANCE TEST FLOW</div>
      <div class="test-flow-title">\u6E2C\u8A66\u6D41\u7A0B ${e?Q(e.status):""}</div>
      <div class="test-flow-question">${e?n(e.question||"\u672A\u547D\u540D\u6E2C\u8A66"):"\u5C1A\u7121\u6E2C\u8A66\u6D41\u7A0B\u3002\u5C07 header \u7684\u6E2C\u8A66\u6A21\u5F0F\u958B\u95DC\u8A2D\u70BA ON\uFF0C\u4E26\u5728 RAG \u9801\u63D0\u554F\u3002"}</div>
    </div>
    <div class="test-flow-actions">${o}</div>
  </div>`;if(!e)return`<div class="test-flow-panel card">${l}
      ${de({iconName:"activity",title:"\u7B49\u5F85\u6E2C\u8A66\u6D41\u7A0B",text:"\u6E2C\u8A66\u6A21\u5F0F\u958B\u555F\u5F8C\uFF0C\u4E0B\u4E00\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C\u6240\u6709\u53EF\u7528\u6A21\u578B\uFF0C\u4E26\u5728\u9019\u88E1\u5373\u6642\u986F\u793A\u6BCF\u500B\u968E\u6BB5\u7684\u9032\u5EA6\u3002"})}
    </div>`;let f=Array.isArray(e.steps)?e.steps:[],g=new Map;for(let _ of f)g.has(_.stage)||g.set(_.stage,[]),g.get(_.stage).push(_);let m=(Array.isArray(e.stage_order)?e.stage_order:Object.keys(rt)).map(_=>An(_,g.get(_)||[])).join(""),w=e.models||{},M=Ws(e,f),k=e.status==="running"?`${B(M.total)}\uFF08\u4F30\u7B97\uFF09`:B(e.total_ms),j=f.find(_=>_.stage==="llm"&&_.model===e.summary?.primary_model)||f.find(_=>_.stage==="llm"&&_.details?.answer_preview),P=e.answer||j?.details?.answer_preview||"",N=`<div class="test-flow-answer">
    <div class="test-flow-answer-head">
      <span>RAG \u5F15\u64CE\u7B54\u6848</span>
      ${e.summary?.primary_model?`<span class="mono">${n(e.summary.primary_model)}</span>`:""}
    </div>
    <p>${P?n(P):e.status==="running"?"\u6E2C\u8A66\u9032\u884C\u4E2D\uFF0C\u5C1A\u672A\u7522\u751F\u6700\u7D42\u7B54\u6848\u3002":"\u6B64\u6E2C\u8A66\u6C92\u6709\u4FDD\u5B58\u53EF\u986F\u793A\u7684\u7B54\u6848\u3002"}</p>
  </div>`;return`<div class="test-flow-panel card">
    ${l}
    <div class="test-flow-meta">
      <span><strong>Run</strong> <span class="mono">${n(e.run_id)}</span></span>
      <span><strong>\u958B\u59CB</strong> ${n(K(e.started_at))}</span>
      <span><strong>\u7E3D\u8017\u6642</strong> ${k}</span>
      <span><strong>Embedding</strong> ${Array.isArray(w.embedding)?w.embedding.length:0} \u500B</span>
      <span><strong>LLM</strong> ${Array.isArray(w.llm)?w.llm.length:0} \u500B</span>
      <span><strong>\u968E\u6BB5</strong> ${n(e.stage_label||e.stage||"\u2014")}</span>
    </div>
    ${N}
    <div class="test-flow-stages">${m||'<p class="muted">\u6B64\u6E2C\u8A66\u6C92\u6709\u5340\u6BB5\u8CC7\u6599\u3002</p>'}</div>
    <div class="test-flow-total">
      <div class="test-flow-total-head">
        <span>\u7E3D\u6D41\u7A0B\u9032\u5EA6</span>
        <span>${Number(e.progress)||0}%</span>
      </div>
      <div class="test-flow-track is-total ${e.status==="running"?"is-running":""}">
        <span class="test-flow-bar is-total" style="width:${Math.max(0,Math.min(100,Number(e.progress)||0))}%"></span>
      </div>
    </div>
    ${Ln(e,f)}
    <div class="test-flow-foot">
      <span>${e.status==="running"?"\u6E2C\u8A66\u57F7\u884C\u4E2D\uFF1B\u6B64\u5716\u8868\u6703\u81EA\u52D5\u66F4\u65B0\u3002":r?"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u5F9E\u4E0A\u65B9\u300C\u6B77\u53F2\u300D\u9078\u55AE\u9084\u539F\u5176\u4ED6 Flow\u3002":"\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF1B\u53EF\u81F3\u6548\u80FD\u5831\u8868\u67E5\u770B\u6B77\u53F2 Flow\u3002"}</span>
      ${e.summary?.primary_model?`<span class="mono">primary=${n(e.summary.primary_model)}</span>`:""}
    </div>
  </div>`}function Mn(e){let t=Array.isArray(e.rows)?e.rows:[],s=Array.isArray(e.summary)?e.summary:[],a=e.flow_stats||e.meta?.flow_stats||{},r=e.index_stats||null;return`<div class="report-card performance-flow-report" data-database="performance">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">PERFORMANCE FLOW REPORT</div>
        <div class="report-title">
          \u6548\u80FD\u5831\u8868 ${Q(e.status||"ok")}
          <span class="chip">performance_records</span>
        </div>
        <div class="report-sub">
          ${u(e.total)} \u7B46\u7B26\u5408 \xB7 ${B(e.duration_ms)} \xB7
          \u6BCF\u6B21\u57F7\u884C\u6309\u9215\u7684\u5B8C\u6574 Flow
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${t.length?"":"disabled"}>${b("download",14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${t.length?"":"disabled"}>${b("file",14)}<span>JSON</span></button>
      </div>
    </div>
    ${s.length?`<div class="summary-strip">${s.map(i=>`<div class="summary-item">
                <div class="summary-label">${n(i.label)}</div>
                <div class="summary-value">${n(i.value)}</div>
              </div>`).join("")}</div>`:""}
    ${_n(r)}
    ${bn(a)}
    <div class="report-section-head perf-flow-list-head">
      <span class="report-section-title">Flow \u7D00\u9304</span>
      <span class="muted" style="font-size:9.5px">\u9EDE\u64CA\u5217\u5C55\u958B\u6A21\u7D44\u3001\u51FD\u6578\u3001\u53C3\u6578\u8207\u5340\u6BB5\u8017\u6642</span>
    </div>
    <div class="perf-record-list">
      ${t.length?t.map((i,o)=>kn(i,o)).join(""):de({iconName:"activity",title:"\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684 Flow",text:"\u653E\u5BEC\u65E5\u671F\u3001\u6A21\u578B\u6216\u8017\u6642\u689D\u4EF6\u5F8C\u518D\u8A66\u4E00\u6B21\u3002"})}
    </div>
    ${xn(e)}
    <details class="perf-query-details">
      <summary>\u67E5\u8A62\u8A9E\u53E5\u8207\u8B66\u544A</summary>
      <div class="query-box">
        <pre class="query-code">${n(e.query_text||"\u2014")}</pre>
        <button class="btn btn-secondary btn-sm btn-copy" type="button" data-action="copy-query">
          ${b("copy",12)}<span>\u8907\u88FD</span>
        </button>
      </div>
      ${Array.isArray(e.warnings)&&e.warnings.length?`<div class="warnings">${e.warnings.map(i=>`<div class="warning-line">${n(i)}</div>`).join("")}</div>`:""}
    </details>
  </div>`}async function Tn(e,t){let s=!1,a=ns(),r={processes:[],modules:[],statuses:[],methods:[],models:[]},i=1,o=25,l=null;e.innerHTML=`<section class="page data-page performance-page">
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
          ${b("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
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
              ${b("search",15)}<span>\u57F7\u884C\u67E5\u8A62</span>
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
  </section>`;let f=e.querySelector("#performance-filter-fields"),g=e.querySelector("#performance-filter-form"),h=e.querySelector("#performance-test-flow"),m=e.querySelector("#performance-report"),w=e.querySelector("#performance-meta"),M=e.querySelector("#performance-refresh"),k=null,j=[],P="",N=null,_="",S=()=>{f.innerHTML=un(r,a)},T=()=>{let E=JSON.stringify({selected:P,tick:k?.status==="running"?Math.floor(Date.now()/1e3):0,runs:j.map(D=>`${D.run_id}:${D.status}`),run:k?{run_id:k.run_id,status:k.status,progress:k.progress,steps:(k.steps||[]).map(D=>`${D.stage}:${D.model}:${D.status}:${D.progress}`)}:null});E!==_&&(_=E,h.innerHTML=St(k,j,P))},q=async()=>{try{let E=await F.testRuns(30);if(s)return;j=Array.isArray(E.runs)?E.runs:[]}catch{if(s)return;j=[]}},C=async()=>{try{let E=P?await F.testRun(P):await F.testRunCurrent();if(s)return;k=E.run||null,!P&&k&&k.status!=="running"&&!j.some(D=>D.run_id===k.run_id)&&await q(),T()}catch{if(s)return;k=null,T()}},ee=async()=>{s||(P||await C(),s||(N=window.setTimeout(ee,1500)))};h.addEventListener("change",async E=>{E.target.id==="test-run-select"&&(P=String(E.target.value||""),await C())}),h.addEventListener("click",async E=>{E.target.closest("#test-flow-refresh")&&(P="",await q(),await C())});let H=async(E=i)=>{i=Math.max(1,Number(E)||1),a=Us(),m.innerHTML=at({label:"\u6548\u80FD\u5831\u8868"});let D=e.querySelector("#performance-run");z(D,!0,"\u67E5\u8A62\u4E2D\u2026");try{let G=await F.performance(a,i,o);if(s)return;l=G,i=Number(G.page)||i,o=Number(G.page_size)||o,m.innerHTML=Mn(G),w.textContent=`PERFORMANCE \xB7 ${u(G.total)} \u7B46`,w.className="badge badge-neutral badge-mono"}catch(G){if(s)return;m.innerHTML=_t(G,{label:"\u6548\u80FD\u5831\u8868"}),R(G.message||"\u6548\u80FD\u5831\u8868\u67E5\u8A62\u5931\u6557\u3002","danger")}finally{s||z(D,!1)}},ae=async()=>{try{r=await F.performanceOptions()}catch{r={processes:[],modules:[],statuses:[],methods:[],models:[]}}S()};return g.addEventListener("submit",E=>{E.preventDefault(),H(1)}),e.querySelector('[data-action="reset"]').addEventListener("click",()=>{a=ns(),i=1,S(),H(1)}),M.addEventListener("click",async()=>{a=Us(),M.disabled=!0,z(M,!0,"\u6574\u7406\u4E2D\u2026"),await ae(),await q(),s||await C(),s||await H(1),s||(M.disabled=!1,z(M,!1))}),m.addEventListener("click",async E=>{let D=E.target.closest("[data-action]");if(!D||!l)return;let G=D.dataset.action;if(G==="retry"){H(i);return}if(G==="prev-page"){H(Math.max(1,Number(l.page)-1));return}if(G==="next-page"){let J=Math.max(1,Math.ceil(Number(l.total)/Number(l.page_size)));H(Math.min(J,Number(l.page)+1));return}if(G==="copy-query"){let J=await mt(l.query_text||"");R(J?"\u67E5\u8A62\u8A9E\u53E5\u5DF2\u8907\u88FD\u3002":"\u7121\u6CD5\u8907\u88FD\u67E5\u8A62\u8A9E\u53E5\u3002",J?"ok":"warn");return}if(G==="export-json"){let J=`performance-page-${l.page}.json`;je(J,JSON.stringify(kt(l),null,2),"application/json;charset=utf-8"),R(`\u5DF2\u532F\u51FA ${J}`,"ok");return}if(G==="export-csv"){let J=`performance-page-${l.page}.csv`;je(J,xt(l),"text/csv;charset=utf-8"),R(`\u5DF2\u532F\u51FA ${J}`,"ok")}}),m.addEventListener("change",E=>{E.target.matches("[data-page-size]")&&(o=Number(E.target.value)||25,Gs.includes(o)||(o=25),H(1))}),await Promise.allSettled([ae(),q()]),s||(await C(),await H(1),ee()),t&&typeof t.setTitle=="function"&&t.setTitle("\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"),()=>{s=!0,N&&window.clearTimeout(N)}}var qn=["\u91D1\u878D\u6D88\u8CBB\u8005\u4FDD\u8B77\u6CD5\u5982\u4F55\u8655\u7406\u91D1\u878D\u6D88\u8CBB\u722D\u8B70\uFF1F","\u8B49\u5238\u4EA4\u6613\u6CD5\u5C0D\u5167\u7DDA\u4EA4\u6613\u6709\u4EC0\u9EBC\u898F\u7BC4\uFF1F","\u9280\u884C\u6CD5\u5C0D\u5438\u6536\u5B58\u6B3E\u8207\u6388\u4FE1\u6709\u54EA\u4E9B\u9650\u5236\uFF1F","\u4FDD\u96AA\u6CD5\u5C0D\u65BC\u696D\u52D9\u54E1\u4E0D\u7576\u62DB\u652C\u7684\u8CAC\u4EFB\u898F\u5B9A\uFF1F","\u9280\u884C\u6CD5\u6709\u591A\u5C11\u689D\u6587\uFF1F","\u8B49\u5238\u71DF\u696D\u54E1\u5E38\u89F8\u72AF\u4EC0\u9EBC\u6CD5\u898F\u6216\u547D\u4EE4\uFF1F","\u6709\u54EA\u4E9B\u6CD5\u898F\u662F\u548C\u58FD\u96AA\u53CA\u7522\u96AA\u76F8\u95DC\u7684\uFF1F"];function En(){return`<div class="answer-placeholder">
    <span class="empty-icon">${b("sparkles",26)}</span>
    <h2 class="empty-title">\u7B54\u6848\u53EA\u6703\u4F86\u81EA\u6AA2\u7D22\u5230\u7684\u5224\u6C7A\u53CA\u6CD5\u898F\u7247\u6BB5</h2>
    <p class="empty-text">\u9001\u51FA\u554F\u984C\u5F8C\uFF0C\u7CFB\u7D71\u6703\u5148\u4EE5 Qdrant \u6AA2\u7D22\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\u4E26\u6A19\u793A\u5F15\u7528\u7DE8\u865F\u3002
      \u82E5\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u660E\u78BA\u986F\u793A\u964D\u7D1A\u72C0\u614B\uFF0C\u4E0D\u6703\u6191\u7A7A\u751F\u6210\u7B54\u6848\u3002</p>
  </div>`}function jn(e,t=!1){let s=t?"\u6E2C\u8A66\u6A21\u5F0F\uFF1A\u6B63\u5728\u4F9D\u5E8F\u57F7\u884C\u6240\u6709\u53EF\u7528 embedding \u8207 LLM \u6A21\u578B\uFF0C\u53EF\u80FD\u9700\u8981\u6578\u5206\u9418\u2026":"\u6B63\u5728\u4EE5\u5411\u91CF\u76F8\u4F3C\u5EA6\u6AA2\u7D22\u5224\u6C7A\u7247\u6BB5\u4E26\u751F\u6210\u56DE\u7B54\uFF1B\u5FEB\u901F\u6A21\u5F0F\u901A\u5E38 2\u201310 \u79D2\u2026";return`<div class="answer-head">
      <div class="answer-head-left">${b("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u4E2D</span>
      </div>
      <div class="answer-head-meta"><span class="spinner"></span></div>
    </div>
    <div class="answer-body">
      <p class="answer-text">${s}\u300C${n(e)}\u300D</p>
      <div class="skeleton skeleton-line" style="margin-top:22px;width:92%"></div>
      <div class="skeleton skeleton-line" style="width:76%"></div>
      <div class="skeleton skeleton-line" style="width:84%"></div>
    </div>`}function Nn(e,t){let s=e.score===null||e.score===void 0?"":`\u76F8\u4F3C\u5EA6 ${Number(e.score).toFixed(4)}`,a=[e.court,e.jdate,s].filter(Boolean).map(l=>`<span>${n(l)}</span>`).join(""),r=(Array.isArray(e.matched_laws)?e.matched_laws:[]).slice(0,5).map(l=>`<span class="chip">${n(l)}</span>`).join(""),i=e.jid?` data-action="open-parquet-judgment"
        data-jid="${n(e.jid)}"
        role="button"
        tabindex="0"
        title="\u9EDE\u64CA\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A"
        aria-label="\u958B\u555F DB \u5132\u5B58\u539F\u6587\u5224\u6C7A ${n(e.jid)}"`:"",o=e.pdf_url?`<a class="citation-link" href="${n(e.pdf_url)}" target="_blank" rel="noopener noreferrer" title="\u958B\u555F\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF">\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF${b("external",11)}</a>`:"";return`<article class="citation">
    <span class="citation-index">[${e.index??t+1}]</span>
    <div class="citation-body"${i}>
      <h4 class="citation-name">${n(e.jid||"\u672A\u77E5\u6848\u865F")}</h4>
      <div class="citation-meta">${a||"<span>\u5224\u6C7A metadata</span>"}</div>
      ${e.title?`<div class="citation-meta"><span>\u6848\u7531\uFF1A${n(e.title)}</span></div>`:""}
      ${r?`<div class="chips" style="margin-top:8px">${r}</div>`:""}
      ${e.snippet?`<p class="citation-snippet">${n(e.snippet)}</p>`:""}
    </div>
    <div class="citation-links">${o}</div>
  </article>`}function Pn(e,t){let s=[e.law_level,e.law_category,e.article_count?`${u(e.article_count)} \u689D`:""].filter(Boolean).map(r=>`<span>${n(r)}</span>`).join(""),a=e.law_url?`<a class="citation-link" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">\u4F86\u6E90${b("external",11)}</a>`:"";return`<article class="citation">
    <span class="citation-index">${String(e.index??t+1).padStart(2,"0")}</span>
    <div class="citation-body">
      <h4 class="citation-name">${n(e.law_name||"\u672A\u547D\u540D\u6CD5\u898F")}</h4>
      <div class="citation-meta">${s||"<span>\u6CD5\u898F metadata</span>"}</div>
      ${e.snippet?`<p class="citation-snippet">${n(e.snippet)}</p>`:""}
    </div>
    ${a}
  </article>`}function Cn(e,t){let s=e.source_label||(e.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F"),a=e.law_level&&e.law_level!==s?e.law_level:"",r=[`<span class="badge ${e.source_type==="order"?"badge-warn":"badge-info"}">${n(s)}</span>`,a,e.law_category,e.article_count?`${u(e.article_count)} \u689D`:"",e.law_modified_date?`\u7570\u52D5 ${we(e.law_modified_date)}`:""].filter(Boolean).map(m=>`<span>${m}</span>`).join(""),i=e.first_promulgation?`<div class="citation-meta"><span>\u6700\u65E9\u5236\u5B9A\uFF1A${n(e.first_promulgation.roc_date)}\uFF08\u897F\u5143 ${n(e.first_promulgation.gregorian_date)}\uFF09</span></div>`:"",o=e.stats,l=o?`<div class="law-source-stats">
        <span>\u63D0\u53CA\u300C${n(o.entity||"")}\u300D\u7684\u5224\u6C7A ${u(o.judgment_count||0)} \u7B46</span>
        <span>\u672C\u6CD5\u898F\u88AB\u5F15\u7528 ${u(o.law_count||0)} \u6B21</span>
      </div>`:"",f=(Array.isArray(e.articles)?e.articles:[]).slice(0,2).map(m=>`<div class="law-source-article">
        <span class="law-source-article-no">${n(m.article_no||"\u689D\u6587")}</span>
        <p class="law-source-article-text">${n(m.article_content||"")}</p>
      </div>`).join(""),g=e.law_url?`<a class="citation-link" href="${n(e.law_url)}" target="_blank" rel="noopener noreferrer">\u6CD5\u898F\u4F86\u6E90${b("external",11)}</a>`:"",h=e.law_key?` data-action="open-law-source"
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
      ${f}
    </div>
    <div class="citation-links">${g}</div>
  </article>`}function Rn(e,t){let s=Array.isArray(t.citations)?t.citations:[],a=Array.isArray(t.judgments)?t.judgments:[],r=Array.isArray(t.law_sources)?t.law_sources:[],i=Array.isArray(t.matched_terms)?t.matched_terms:[],o=t.status||"preview",l=o==="operational"?"\u5B8C\u6210":o==="retrieval_only"?"\u50C5\u6AA2\u7D22\u7D50\u679C":o==="preview"?"\u6CD5\u898F\u9810\u89BD":o==="unavailable"||o==="not_configured"?"\u8CC7\u6599\u4E0D\u53EF\u7528":o==="degraded"?"\u964D\u7D1A":"\u5B8C\u6210",f=a.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u5224\u6C7A \xB7 ${a.length} \u7B46</span>
        <span>vector retrieval \xB7 [\u7DE8\u865F] \u5C0D\u61C9\u56DE\u7B54\u5F15\u7528</span>
      </div>
      <div class="citation-list">${a.map((T,q)=>Nn(T,q)).join("")}</div>`:"",g=r.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F\uFF0F\u547D\u4EE4 \xB7 ${r.length} \u7B46</span>
        <span>PostgreSQL metadata \xB7 Parquet \u689D\u6587</span>
      </div>
      <div class="citation-list">${r.map((T,q)=>Cn(T,q)).join("")}</div>`:"",h=!a.length&&s.length?`<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>\u5F15\u7528\u6CD5\u898F \xB7 ${s.length} \u7B46</span>
        <span>metadata match</span>
      </div>
      <div class="citation-list">${s.map((T,q)=>Pn(T,q)).join("")}</div>`:"",m=f+g+h;m||(m=`<div class="answer-divider"></div>
      ${de({iconName:"file",title:"\u6C92\u6709\u53EF\u5F15\u7528\u7684\u4F86\u6E90",text:o==="retrieval_only"?"\u76EE\u524D\u5DF2\u5EFA\u7ACB\u7684\u5411\u91CF\u7D22\u5F15\u4E2D\u6C92\u6709\u8DB3\u5920\u76F8\u4F3C\u7684\u5224\u6C7A\uFF0C\u4E5F\u6C92\u6709\u53EF\u5C0D\u61C9\u7684\u6CD5\u898F\u6216\u547D\u4EE4\u3002\u7CFB\u7D71\u4E0D\u6703\u5728\u6C92\u6709\u4F86\u6E90\u6642\u751F\u6210\u7B54\u6848\u3002":"\u5411\u91CF\u7D22\u5F15\u6216 LLM \u5C1A\u672A\u5C31\u7DD2\uFF0C\u4E14\u554F\u984C\u4E2D\u6C92\u6709\u53EF\u76F4\u63A5\u5C0D\u61C9\u7684\u73FE\u884C\u6CD5\u898F\u540D\u7A31\u3002"})}`);let w=i.length?`<div class="answer-section-label" style="margin-top:18px">
        <span>\u547D\u4E2D\u8A5E\u5F59</span>
      </div>
      <div class="chips">${i.map(T=>`<span class="chip">${n(T)}</span>`).join("")}</div>`:"",M=t.test_run,k=String(t.llm_model||M?.primary_model||"").trim(),j=String(t.embedding_model||"").trim(),P=[k?`LLM\uFF1A${k}`:"",j?`Embedding\uFF1A${j}`:""].filter(Boolean).join(" \xB7 "),N=t.answer_source==="structured",_=k?`<span class="answer-model" title="${n(P)}">${b("brain",11)}${n(k)}</span>`:N?`<span class="answer-model" title="\u7531 PostgreSQL metadata\u3001Parquet \u689D\u6587\u8207\u5224\u6C7A\u5F15\u7528\u7D71\u8A08\u76F4\u63A5\u6574\u7406">${b("database",11)}\u6CD5\u898F\u8CC7\u6599\u5EAB</span>`:"",S=M?`<div class="test-run-summary">
        <div class="test-run-summary-head">
          <span class="badge badge-warn">\u6E2C\u8A66\u6A21\u5F0F</span>
          ${Q(M.status)}
          <span class="mono">${n(M.run_id||"")}</span>
        </div>
        <div class="test-run-summary-body">
          <span>Embedding ${Number(M.models?.embedding?.length||0)} \u500B</span>
          <span>LLM ${Number(M.models?.llm?.length||0)} \u500B</span>
          <span>\u4E3B\u56DE\u7B54 ${n(M.primary_model||"\u2014")}</span>
          <span>${Number(M.total_ms||0)} ms</span>
          <a href="#/performance">\u67E5\u770B\u6E2C\u8A66 Flow</a>
        </div>
      </div>`:"";return`<div class="answer-head">
      <div class="answer-head-left">${b("sparkles",16)}
        <span class="answer-head-title">\u6AA2\u7D22\u7D50\u679C</span>
      </div>
      <div class="answer-head-meta">
        ${Q(o,l)}
        <span>${Number(t.duration_ms||0)} ms</span>
        ${_}
      </div>
    </div>
    <div class="answer-body">
      <p class="answer-text">${n(t.answer||"\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u56DE\u7B54\u3002")}</p>
      ${t.notice?`<div class="answer-notice">${n(t.notice)}</div>`:""}
      ${S}
      ${w}
      ${m}
    </div>`}function In(e){return`<div class="answer-head">
      <div class="answer-head-left">${b("alert",16)}
        <span class="answer-head-title">\u7121\u6CD5\u5B8C\u6210\u6AA2\u7D22</span>
      </div>
    </div>
    <div class="answer-body">
      ${U({tone:"danger",title:"\u8ACB\u6C42\u5931\u6557",text:n(e.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
    </div>`}function Bn(e){return e.length?e.map((t,s)=>{let a=Array.isArray(t.payload?.citations)?t.payload.citations.length:0,r=Array.isArray(t.payload?.judgments)?t.payload.judgments.length:0,i=Array.isArray(t.payload?.law_sources)?t.payload.law_sources.length:0,o=a+r+i;return`<button class="history-item" type="button" data-history-index="${s}">
        <span class="history-question">${n(t.title||"\u672A\u547D\u540D\u63D0\u554F")}</span>
        <span class="history-meta">
          <span>${n(Ve(t.created_at))}</span>
          <span>\xB7</span>
          <span>${o?`${o} \u7B46\u4F86\u6E90`:"\u7121\u5F15\u7528"}</span>
        </span>
      </button>`}).join(""):'<div class="history-empty">\u5C1A\u7121\u63D0\u554F\u7D00\u9304\u3002\u9001\u51FA\u7B2C\u4E00\u500B\u554F\u984C\u5F8C\u6703\u4FDD\u5B58\u5728\u6B64\u700F\u89BD\u5668\u3002</div>'}async function Dn(e){let t=!1,s=[],a="",r=!1,i={embedding:[],llm:[]};e.innerHTML=`<section class="page rag-page">
    <header class="rag-hero">
      <span class="eyebrow">JUDGMENT \xB7 LEGAL RAG</span>
      <h1 class="rag-title">\u8B93\u6BCF\u4E00\u500B\u7B54\u6848\uFF0C\u90FD\u80FD\u56DE\u5230\u6CD5\u898F\u8207\u5224\u6C7A</h1>
      <p class="rag-lead">\u4EE5\u91D1\u878D\u6CD5\u898F\u7684\u73FE\u884C\u689D\u6587\u8207\u5224\u6C7A\u7247\u6BB5\u70BA\u6AA2\u7D22\u57FA\u790E\u3002
        \u5148\u5F9E Qdrant \u6AA2\u7D22\u76F8\u4F3C\u5224\u6C7A\uFF0C\u518D\u7531 LLM \u4F9D\u6AA2\u7D22\u7247\u6BB5\u751F\u6210\u56DE\u7B54\uFF1B\u82E5\u7D22\u5F15\u6216\u6A21\u578B\u5C1A\u672A\u5C31\u7DD2\uFF0C\u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u53EF\u9A57\u8B49\u7684\u6AA2\u7D22\u7D50\u679C\u3002</p>
      <div id="rag-mode-notice">${U({tone:"info",title:"RAG \u670D\u52D9\u72C0\u614B\u6AA2\u67E5\u4E2D",text:"\u6B63\u5728\u78BA\u8A8D Qdrant\u3001Embedding \u8207 LLM \u72C0\u614B\uFF1B\u6240\u6709\u56DE\u7B54\u90FD\u6703\u6A19\u793A\u53EF\u56DE\u6EAF\u7684\u4F86\u6E90\u3002"})}</div>
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
            ${b("sparkles",16)}<span>\u958B\u59CB\u6AA2\u7D22</span>
          </button>
        </div>
      </form>
      <div class="example-chips" id="example-chips" aria-label="\u7BC4\u4F8B\u554F\u984C">
        ${qn.map(v=>`<button class="example-chip" type="button" data-question="${n(v)}">${n(v)}</button>`).join("")}
      </div>
    </header>

    <div class="rag-grid">
      <section class="card answer-card" id="answer-card" aria-live="polite">
        ${En()}
      </section>

      <aside class="rag-side">
        <section class="card">
          <div class="side-card-head">
            <span class="side-card-title">${b("database",14)}\u8CC7\u6599\u73FE\u6CC1</span>
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
            <span class="side-card-title">${b("history",14)}\u6700\u8FD1\u63D0\u554F</span>
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
  </section>`;let o=e.querySelector("#rag-form"),l=e.querySelector("#rag-question"),f=e.querySelector("#rag-submit"),g=e.querySelector("#answer-card"),h=e.querySelector("#rag-stats"),m=e.querySelector("#rag-stats-mode"),w=e.querySelector("#rag-history"),M=e.querySelector("#rag-storage-note"),k=e.querySelector("#rag-clear-history"),j=e.querySelector("#rag-test-mode"),P=e.querySelector("#rag-test-flow"),N=e.querySelector("#rag-judgment-dialog"),_=e.querySelector("#rag-law-dialog"),S=()=>{document.documentElement.classList.toggle("dialog-open",!!e.querySelector("dialog[open]"))};N?.addEventListener("close",S),_?.addEventListener("close",S);let T=null,q=null,C=()=>{l.style.height="auto",l.style.height=`${Math.min(l.scrollHeight,220)}px`},ee=async()=>{try{if(s=await ht({limit:6}),t)return;w.innerHTML=Bn(s),M.textContent=ft()==="indexeddb"?"\u63D0\u554F\u7D00\u9304\u5132\u5B58\u5728\u700F\u89BD\u5668 IndexedDB\uFF0C\u4E0D\u6703\u4E0A\u50B3\u5230\u4F3A\u670D\u5668\u3002":"\u700F\u89BD\u5668\u5132\u5B58\u4E0D\u53EF\u7528\uFF0C\u63D0\u554F\u7D00\u9304\u53EA\u4FDD\u7559\u5728\u672C\u6B21\u5DE5\u4F5C\u968E\u6BB5\u3002"}catch{if(t)return;w.innerHTML='<div class="history-empty">\u7121\u6CD5\u8B80\u53D6\u672C\u6A5F\u7D00\u9304\u3002</div>'}},H=async()=>{try{let v=await F.status();if(t)return;let A=v.data||{},I=new Map((v.services||[]).map(ct=>[ct.id,ct])),se=I.get("qdrant"),me=I.get("embedding"),W=I.get("rag"),ne=I.get("llm"),Z=Number(A.judgment_indexed_count||0),Le=Number(A.judgment_count||0),et=Le?(Z/Le*100).toFixed(1):"0.0",fe=A.judgment_vector_points===null||A.judgment_vector_points===void 0?"\u2014":u(A.judgment_vector_points);h.innerHTML=`<div class="mini-stats">
          <div class="mini-stat">
            <div class="mini-stat-value">${u(Le)}</div>
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
            <span>${b("cube",13)}Qdrant \u5411\u91CF\u7D22\u5F15</span>
            ${Q(se?.status,se?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
          </div>
          <div class="side-status-row">
            <span>${b("layers",13)}Embedding\uFF08${n(A.judgment_vector_model||"\u2014")}\uFF09</span>
            ${Q(me?.status,me?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
          </div>
          <div class="side-status-row">
            <span>${b("brain",13)}RAG \u56DE\u7B54\u7BA1\u7DDA</span>
            ${Q(W?.status,W?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
          </div>
          <div class="side-status-row">
            <span>${b("sparkles",13)}LLM \u6A21\u578B</span>
            ${Q(ne?.status,ne?.status==="not_configured"?"\u672A\u8A2D\u5B9A":void 0)}
          </div>
        </div>
        <div class="side-card-foot" style="padding:0;border:0;margin-top:10px">
          Collection\uFF1A${n(A.judgment_vector_collection||"\u2014")} \xB7
          ${fe} points \xB7 \u5269\u9918 ${u(A.judgment_index_remaining)} \u7B46\u5F85\u7D22\u5F15
        </div>`;let ge=e.querySelector("#rag-mode-notice");ge&&(W?.status==="operational"?ge.innerHTML=U({tone:"ok",title:"\u6AA2\u7D22\u8207\u56DE\u7B54\u5C31\u7DD2",text:`Qdrant\u3001Embedding \u8207 LLM \u5747\u53EF\u4F7F\u7528\uFF1B\u76EE\u524D\u7D22\u5F15\u6DB5\u84CB ${u(Z)} / ${u(Le)} \u7B46\u5224\u6C7A\u3002\u56DE\u7B54\u4E0D\u662F\u6CD5\u5F8B\u610F\u898B\u3002`}):W?.status==="degraded"?ge.innerHTML=U({tone:"warn",title:"\u90E8\u5206 AI \u5143\u4EF6\u672A\u5C31\u7DD2",text:n(W.detail||"RAG \u6703\u964D\u7D1A\u70BA\u53EA\u986F\u793A\u6AA2\u7D22\u7D50\u679C\u3002")}):ge.innerHTML=U({tone:"info",title:"\u5411\u91CF\u7D22\u5F15\u5C1A\u672A\u5C31\u7DD2 \xB7 \u4E0D\u662F\u6CD5\u5F8B\u610F\u898B",text:n(W?.detail||"\u8A2D\u5B9A QDRANT_URL\u3001EMBEDDING_URL \u8207 LLM_URL \u4E26\u57F7\u884C judgment-index-vectors \u5F8C\u5373\u53EF\u555F\u7528\u5224\u6C7A\u6AA2\u7D22\u3002")})),m.className=`badge ${W?.status==="operational"?"badge-ok":W?.status==="not_configured"?"badge-neutral":"badge-warn"} badge-mono`,m.textContent=W?.status==="operational"?"RAG \u5C31\u7DD2":W?.status==="not_configured"?"\u672A\u8A2D\u5B9A":"\u964D\u7D1A"}catch{if(t)return;h.innerHTML='<p class="muted" style="font-size:11px">\u76EE\u524D\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002</p>',m.className="badge badge-danger badge-mono",m.textContent="\u96E2\u7DDA"}},ae=()=>{if(!j)return;if(!r){j.innerHTML="";return}let v=Array.isArray(i.embedding)?i.embedding.length:0,A=Array.isArray(i.llm)?i.llm.length:0;j.innerHTML=U({tone:"warn",title:"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F",text:`\u6BCF\u6B21\u63D0\u554F\u6703\u4F9D\u5E8F\u57F7\u884C ${v} \u500B embedding \u8207 ${A} \u500B LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002\u6E2C\u8A66 Flow \u6703\u5728\u9801\u9762\u4E0B\u65B9\u5373\u6642\u986F\u793A\uFF0C\u4E5F\u53EF\u5230 <a href="#/performance">\u6548\u80FD\u5831\u8868</a> \u67E5\u770B\u6B77\u53F2\u3002`})},E=async()=>{try{let v=await F.testMode();if(t)return;r=!!v.enabled,i=v.models||{embedding:[],llm:[]},ae()}catch{if(t)return;r=!1,ae()}},D=v=>{r=!!v.detail?.enabled,i=v.detail?.models||{embedding:[],llm:[]},ae()};window.addEventListener("judgment:test-mode",D);let G=v=>{P&&(q=v||null,P.innerHTML=v?St(v,[],"",{showHistory:!1}):"")},J=()=>{T&&(window.clearTimeout(T),T=null)},be=()=>{J();let v=async()=>{if(!t){try{let A=await F.testRunCurrent();if(t)return;let I=A.run;I&&I.status==="running"&&G(I)}catch{}t||(T=window.setTimeout(v,1500))}};v()},ze=async v=>{if(!v){G(null);return}try{let A=await F.testRun(v);if(t)return;G(A.run||null)}catch{t||R("\u6E2C\u8A66\u5DF2\u5B8C\u6210\uFF0C\u4F46\u7121\u6CD5\u8F09\u5165\u6E2C\u8A66 Flow\u3002","warn")}},le=async()=>{if(r)try{let v=await F.testRunCurrent();if(t)return;v.run?.status==="running"&&(G(v.run),be())}catch{}},xe=0,te=(v,A)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">DB ORIGINAL JUDGMENT</div>
      <h2>${n(v)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-parquet-judgment" aria-label="\u95DC\u9589">${b("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${A}</div>`,Ae=v=>{let A=(Array.isArray(v.matched_laws)?v.matched_laws:[]).map(W=>`<span class="chip">${n(W)}</span>`).join(""),I=[v.court,v.jdate,v.title?`\u6848\u7531\uFF1A${v.title}`:"",v.full_text_length?`${u(v.full_text_length)} \u5B57`:"",v.citation_count?`\u5F15\u7528 ${u(v.citation_count)} \u7B46`:""].filter(Boolean).map(W=>`<span>${n(W)}</span>`).join(""),se=v.parquet_generated_at?`DB \u5132\u5B58\u539F\u6587\uFF08\u539F\u59CB Parquet\uFF09\xB7 ${n(String(v.parquet_generated_at).replace("T"," ").slice(0,19))}`:"DB \u5132\u5B58\u539F\u6587",me=v.pdf_url?`<a class="btn btn-secondary btn-sm" href="${n(v.pdf_url)}" target="_blank" rel="noopener noreferrer">${b("external",13)}<span>\u53F8\u6CD5\u9662\u539F\u5224\u6C7A PDF</span></a>`:"";return te(v.jid||"\u5224\u6C7A\u5168\u6587",`<div class="judgment-dialog-meta">
        <span class="badge badge-info">${n(v.source==="parquet"?"DB \u5132\u5B58\u539F\u6587":"PostgreSQL")}</span>
        ${I}
      </div>
      ${A?`<div class="chips" style="margin:8px 0 10px">${A}</div>`:""}
      <div class="judgment-dialog-source">${se}</div>
      <pre class="judgment-dialog-text">${n(v.full_text||"\u6B64\u5224\u6C7A\u6C92\u6709\u5168\u6587\u3002")}</pre>
      <div class="judgment-dialog-actions">
        ${me}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-parquet-judgment">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},Ge=async v=>{if(!N||!v)return;let A=++xe;N.open||N.showModal(),S(),N.innerHTML=te("\u8B80\u53D6\u5224\u6C7A\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E DB \u5132\u5B58\u539F\u6587\u8B80\u53D6 ${n(v)}\u2026</span>
      </div>`);try{let I=await F.judgmentDetail(v,"parquet");if(t||A!==xe)return;N.innerHTML=Ae(I)}catch(I){if(t||A!==xe)return;N.innerHTML=te("\u7121\u6CD5\u8B80\u53D6 DB \u539F\u6587\u5224\u6C7A",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${n(I.message||"\u627E\u4E0D\u5230\u5224\u6C7A\u5168\u6587\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u5DF2\u57F7\u884C <span class="mono">uv run judgment-import-judgments --raw-only</span>\uFF0C\u4E14\u539F\u59CB Parquet \u5B58\u5728\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-parquet-judgment">\u95DC\u9589</button>
        </div>`)}},ke=0,Xe=(v,A)=>`<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">LOCAL PARQUET LAW</div>
      <h2>${n(v)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-law-source" aria-label="\u95DC\u9589">${b("x",14)}</button>
  </div>
  <div class="judgment-dialog-body">${A}</div>`,ot=v=>{let I=(Array.isArray(v.articles)?v.articles:[]).map(fe=>{let ge=String(fe.article_content||"").trim();return ge?fe.article_type==="C"?`<div class="law-chapter">${n(ge)}</div>`:`<article class="law-article">
          <div class="law-article-head">
            <span class="law-article-no">${n(fe.article_no||"\u689D\u6587")}</span>
          </div>
          <div class="law-article-text">${n(ge)}</div>
        </article>`:""}).join(""),se=(Array.isArray(v.warnings)?v.warnings:[]).map(fe=>n(fe)).join("<br />"),me=v.source_type==="order"?"\u547D\u4EE4":"\u6CD5\u898F",W=v.meta?.articles_source==="parquet"?"Parquet \u689D\u6587":"\u689D\u6587\u672A\u63D0\u4F9B",ne=v.meta?.snapshot||"",Z=[v.law_level,v.law_category,v.article_count?`${u(v.article_count)} \u689D`:"",v.law_modified_date?`\u7570\u52D5 ${we(v.law_modified_date)}`:""].filter(Boolean).map(fe=>`<span>${n(fe)}</span>`).join(""),Le=v.law_url?`<a class="btn btn-secondary btn-sm" href="${n(v.law_url)}" target="_blank" rel="noopener noreferrer">${b("external",13)}<span>\u4F86\u6E90\u7DB2\u7AD9</span></a>`:"",et=v.law_histories?`<details class="law-dialog-history">
          <summary>\u6CD5\u898F\u6CBF\u9769</summary>
          <div>${n(v.law_histories)}</div>
        </details>`:"";return Xe(v.law_name||v.law_key||"\u6CD5\u898F\uFF0F\u547D\u4EE4",`<div class="judgment-dialog-meta">
        <span class="badge ${v.source_type==="order"?"badge-warn":"badge-info"}">${n(me)}</span>
        ${Z}
      </div>
      <div class="judgment-dialog-source">${n([W,ne].filter(Boolean).join(" \xB7 "))}</div>
      ${se?`<div class="law-dialog-warning">${se}</div>`:""}
      ${et}
      <div class="law-dialog-articles">${I||'<div class="report-empty-inline">\u9019\u500B\u6CD5\u898F\uFF0F\u547D\u4EE4\u76EE\u524D\u6C92\u6709\u53EF\u986F\u793A\u7684\u689D\u6587\u3002</div>'}</div>
      <div class="judgment-dialog-actions">
        ${Le}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-law-source">\u8FD4\u56DE\u56DE\u7B54</button>
      </div>`)},Ze=async(v,A="")=>{if(!_||!v)return;let I=++ke;_.open||_.showModal(),S(),_.innerHTML=Xe("\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E2D\u2026",`<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>\u6B63\u5728\u5F9E\u672C\u5730 Parquet \u8B80\u53D6 ${n(v)} \u7684\u539F\u59CB\u689D\u6587\u2026</span>
      </div>`);try{let se=await F.lawDetail(v,A);if(t||I!==ke)return;_.innerHTML=ot(se)}catch(se){if(t||I!==ke)return;_.innerHTML=Xe("\u7121\u6CD5\u8B80\u53D6\u6CD5\u898F\uFF0F\u547D\u4EE4\u539F\u6587",`<div class="notice notice-danger">
          <div class="notice-body"><strong>\u8B80\u53D6\u5931\u6557</strong>
          <p>${n(se.message||"\u627E\u4E0D\u5230\u689D\u6587\u5167\u5BB9\u3002")}</p>
          <p class="muted">\u8ACB\u78BA\u8A8D\u672C\u5730\u539F\u59CB\u6CD5\u898F Parquet \u5B58\u5728\uFF0C\u4E14 PostgreSQL metadata \u8207\u5176\u4E00\u81F4\u3002</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-law-source">\u95DC\u9589</button>
        </div>`)}};_?.addEventListener("click",v=>{if(v.target.closest('[data-action="close-law-source"]')){_.close();return}let A=_.getBoundingClientRect();(v.clientX<A.left||v.clientX>A.right||v.clientY<A.top||v.clientY>A.bottom)&&_.close()}),N?.addEventListener("click",v=>{if(v.target.closest('[data-action="close-parquet-judgment"]')){N.close();return}let A=N.getBoundingClientRect();(v.clientX<A.left||v.clientX>A.right||v.clientY<A.top||v.clientY>A.bottom)&&N.close()}),g.addEventListener("click",v=>{let A=v.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(A){if(A.dataset.action==="open-law-source"){Ze(A.dataset.lawKey||"",A.dataset.sourceType||"");return}Ge(A.dataset.jid||"")}}),g.addEventListener("keydown",v=>{if(v.key!=="Enter"&&v.key!==" ")return;let A=v.target.closest('[data-action="open-parquet-judgment"], [data-action="open-law-source"]');if(!(!A||A.closest("a, button"))){if(v.preventDefault(),A.dataset.action==="open-law-source"){Ze(A.dataset.lawKey||"",A.dataset.sourceType||"");return}Ge(A.dataset.jid||"")}});let lt=async v=>{let A=v.trim();if(!A){R("\u8ACB\u5148\u8F38\u5165\u554F\u984C\u3002","warn"),l.focus();return}a=A,l.value=A,C(),g.innerHTML=jn(A,r),r?(G(null),be()):(J(),G(null)),z(f,!0,"\u6AA2\u7D22\u4E2D\u2026");try{let I=await F.rag(A,{testMode:r});if(t)return;J(),g.innerHTML=Rn(A,I),I.test_run?.run_id?await ze(I.test_run.run_id):G(null);let se=Array.isArray(I.citations)?I.citations:[],me=Array.isArray(I.judgments)?I.judgments:[],W=se.length+me.length;await gt({kind:"rag",title:A,detail:`${I.status||"preview"} \xB7 ${W} \u7B46\u4F86\u6E90`,payload:{question:A,status:I.status,citations:se.map(ne=>ne.law_name),judgments:me.map(ne=>ne.jid)}}),await ee()}catch(I){if(J(),t)return;g.innerHTML=In(I),R(I.message||"\u6AA2\u7D22\u5931\u6557\u3002","danger")}finally{J(),t||z(f,!1)}};return o.addEventListener("submit",v=>{v.preventDefault(),lt(l.value)}),l.addEventListener("input",C),l.addEventListener("keydown",v=>{v.key==="Enter"&&!v.shiftKey&&!v.isComposing&&(v.preventDefault(),o.requestSubmit())}),e.querySelector("#example-chips").addEventListener("click",v=>{let A=v.target.closest("[data-question]");A&&(l.value=A.dataset.question,C(),o.requestSubmit())}),w.addEventListener("click",v=>{let A=v.target.closest("[data-history-index]");if(!A)return;let I=s[Number(A.dataset.historyIndex)];I&&(l.value=I.title,C(),lt(I.title))}),k.addEventListener("click",async()=>{if(!s.length){R("\u76EE\u524D\u6C92\u6709\u53EF\u6E05\u9664\u7684\u63D0\u554F\u7D00\u9304\u3002","info");return}window.confirm("\u78BA\u5B9A\u6E05\u9664\u9019\u500B\u700F\u89BD\u5668\u7684\u6240\u6709\u63D0\u554F\u7D00\u9304\uFF1F")&&(await As(),await ee(),R("\u5DF2\u6E05\u9664\u672C\u6A5F\u63D0\u554F\u7D00\u9304\u3002","ok"))}),C(),await Promise.allSettled([H(),ee(),E()]),await le(),()=>{t=!0,J(),document.documentElement.classList.remove("dialog-open"),window.removeEventListener("judgment:test-mode",D),a&&g.setAttribute("data-last-question",a)}}var os={};Qe(os,{render:()=>dr});var Fn=2e3,On={running:{label:"\u57F7\u884C\u4E2D",tone:"info"},success:{label:"\u5B8C\u6210",tone:"ok"},failed:{label:"\u5931\u6557",tone:"danger"},interrupted:{label:"\u5DF2\u4E2D\u6B62",tone:"warn"},stale:{label:"\u72C0\u614B\u5931\u6548",tone:"warn"},skipped:{label:"\u7565\u904E",tone:"idle"},pending:{label:"\u7B49\u5F85",tone:"idle"},idle:{label:"\u5F85\u547D",tone:"idle"},no_change:{label:"\u7121\u8B8A\u66F4",tone:"info"},operational:{label:"\u6B63\u5E38",tone:"ok"},degraded:{label:"\u964D\u7D1A",tone:"warn"},unavailable:{label:"\u7121\u6CD5\u53D6\u5F97",tone:"danger"},missing:{label:"\u5C1A\u7121\u7D00\u9304",tone:"idle"},error:{label:"\u8B80\u53D6\u5931\u6557",tone:"danger"},ok:{label:"\u6B63\u5E38",tone:"ok"}},Ks={ok:"badge-ok",warn:"badge-warn",danger:"badge-danger",info:"badge-info",idle:"badge-neutral"},Ys={ok:"is-ok",warn:"is-warn",danger:"is-danger",info:"is-idle",idle:"is-idle"},ea={judgment:"\u5224\u6C7A",law:"\u6CD5\u898F",order:"\u547D\u4EE4",system:"\u7CFB\u7D71"},At={judgment:"#a78bfa",law:"#22d3ee",order:"#f472b6",system:"#94a3b8"},Hn={extract:"file",raw_parquet:"cube",filter:"filter",postgres:"database",qdrant:"brain",download:"download",parse:"sliders"},Un={raw_parquet:"\u539F\u59CB Parquet",postgres:"PostgreSQL"};function it(e){return On[e]||{label:e?String(e):"\u672A\u77E5",tone:"idle"}}function ve(e,t){let s=it(e);return`<span class="badge ${Ks[s.tone]||Ks.idle}"><span class="status-dot ${Ys[s.tone]||Ys.idle}"></span>${n(t||s.label)}</span>`}function Oe(e){if(e==null||e==="")return"\u2014";let t=Number(e);if(!Number.isFinite(t))return"\u2014";let s=Math.max(0,Math.min(100,t));return`${Number.isInteger(s)?s:s.toFixed(1)}%`}function Xs(e){return e==null?"\u7121\u6CD5\u53D6\u5F97":u(e)}function Ke(e){return e&&e.color?String(e.color):"var(--accent)"}function Lt(e,t=""){let s=e.percent===null||e.percent===void 0?null:Math.max(0,Math.min(100,Number(e.percent)||0)),a=e.status==="running"&&s===null,r=a?' aria-valuetext="\u9032\u5EA6\u672A\u77E5"':` aria-valuenow="${s??0}"`;return`<div class="processing-bar${a?" is-indeterminate":""}${t?` ${t}`:""}" role="progressbar" aria-valuemin="0" aria-valuemax="100"${r}>
    <span class="processing-bar-fill" style="width:${s??0}%;background:${n(Ke(e))}"></span>
  </div>`}function zn(e){let t=e.unit==="bytes"?"":e.unit||"\u7B46",s=e.current,a=e.total;return s==null?e.status==="running"?"\u9032\u884C\u4E2D":"\u2014":e.unit==="bytes"?a?`${ce(s)} / ${ce(a)}`:ce(s):a?`${u(s)} / ${u(a)} ${t}`:`${u(s)} ${t}`}function Gn(e){let t=[`<span>${n(zn(e))}</span>`];return e.percent===null||e.percent===void 0?e.status==="running"&&t.push('<span class="mono">\u9032\u5EA6\u672A\u77E5</span>'):t.push(`<span class="mono">${Oe(e.percent)}</span>`),e.duration_ms&&t.push(`<span class="mono">${B(e.duration_ms)}</span>`),t.join("")}function Qn(e){let s=(Array.isArray(e.stats)?e.stats:[]).map(r=>`<span class="processing-stage-stat"><span>${n(r.label)}</span><strong>${n(r.value)}</strong></span>`),a=e.coverage;return a&&a.indexed!==null&&a.indexed!==void 0&&a.total!==null&&a.total!==void 0&&s.push(`<span class="processing-stage-stat"><span>\u7D22\u5F15\u8986\u84CB</span><strong>${u(a.indexed)} / ${u(a.total)}</strong></span>`),s.length?`<div class="processing-stage-stats">${s.join("")}</div>`:""}function Jn(e,{compact:t=!1,step:s=null}={}){let a=it(e.status),r=e.status==="running";return`<div class="processing-stage${t?" is-compact":""} is-${a.tone}${r?" is-live":""}" style="--stage-color:${n(Ke(e))}"${r?' aria-current="step"':""}>
    <div class="processing-stage-head">
      ${s===null?"":`<span class="processing-stage-step">${String(s).padStart(2,"0")}</span>`}
      <span class="processing-stage-swatch" style="background:${n(Ke(e))}"></span>
      <span class="processing-stage-label">${n(e.label||e.key)}</span>
      ${ve(e.status)}
    </div>
    ${Lt(e)}
    <div class="processing-stage-meta">${Gn(e)}</div>
    ${e.message?`<div class="processing-stage-message" title="${n(e.message)}">${n(e.message)}</div>`:""}
    ${t?"":Qn(e)}
  </div>`}function ta(e){let t=it(e);return`<span class="flow-status is-${t.tone}"><span class="flow-status-dot"></span>${n(t.label)}</span>`}function Zs(e,t){return t==null||t===""?"\u2014":e.unit==="bytes"?ce(t):u(t)}function Vn(e){let t=[{label:"\u76EE\u524D",value:Zs(e,e.current)},{label:"\u7E3D\u91CF",value:Zs(e,e.total)},{label:"\u767E\u5206\u6BD4",value:e.percent===null||e.percent===void 0?e.status==="running"?"\u8A08\u7B97\u4E2D":"\u2014":Oe(e.percent)},{label:"\u8017\u6642",value:e.duration_ms?B(e.duration_ms):"\u2014"}],s=Array.isArray(e.stats)?e.stats:[];for(let r of s){if(t.length>=6)break;r&&r.label&&r.value&&t.push({label:String(r.label),value:String(r.value)})}let a=e.coverage;return a&&a.indexed!==null&&a.indexed!==void 0&&a.total!==null&&a.total!==void 0&&!t.some(r=>r.label==="\u7D22\u5F15\u8986\u84CB")&&t.push({label:"\u7D22\u5F15\u8986\u84CB",value:`${u(a.indexed)} / ${u(a.total)}`}),t}function Wn(e,t){let s=it(e.status),a=e.status==="running",r=Vn(e);return`<article class="flow-node is-${s.tone}${a?" is-live":""}" style="--stage-color:${n(Ke(e))}"${a?' aria-current="step"':""}>
    <div class="flow-node-head">
      <span class="flow-node-icon">${b(Hn[e.key]||"cube",14)}</span>
      <div class="flow-node-heading">
        <span class="flow-node-kicker">STEP ${String(t+1).padStart(2,"0")}</span>
        <strong>${n(Un[e.key]||e.label||e.key)}</strong>
      </div>
      ${ta(e.status)}
    </div>
    <div class="flow-node-body">
      ${Lt(e,"flow-progress")}
      <div class="flow-node-props">${r.map(i=>`<div class="flow-prop"><span>${n(i.label)}</span><strong>${n(i.value)}</strong></div>`).join("")}</div>
      ${e.message?`<div class="flow-node-note" title="${n(e.message)}">${n(e.message)}</div>`:""}
    </div>
  </article>`}function Kn(e,t,s,a){let r=Ke(e),i=a||"#8b5cf6",o=e.status==="running",l=`${s}-${t}`,f=`flow-gradient-${l}`,g=`flow-marker-${l}`,h=t%2===0?"M2 60 C8 42 16 78 22 60":"M2 60 C8 78 16 42 22 60";return`<div class="flow-link${o?" is-live":""}" style="color:${n(r)}" aria-hidden="true">
    <svg viewBox="0 0 28 120" width="28" height="120" fill="none">
      <defs>
        <linearGradient id="${f}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="${n(i)}"/>
          <stop offset="1" stop-color="${n(r)}"/>
        </linearGradient>
        <marker id="${g}" viewBox="0 0 8 8" refX="6.2" refY="4" markerWidth="4.6" markerHeight="4.6" orient="auto">
          <path d="M0 0 8 4 0 8Z" fill="${n(r)}"/>
        </marker>
      </defs>
      <path class="flow-link-line" d="${h}" stroke="url(#${f})" stroke-width="1.7" stroke-linecap="round" marker-end="url(#${g})"/>
      <circle class="flow-link-port" cx="2" cy="60" r="3.6" stroke="${n(i)}" stroke-width="1.5"/>
      <circle class="flow-link-port" cx="26" cy="60" r="3.6" stroke="${n(r)}" stroke-width="1.5"/>
    </svg>
  </div>`}function sa(e){if(!e)return"";let t=[];return e.started_at&&t.push(`\u958B\u59CB ${K(e.started_at)}`),e.duration_ms&&t.push(`\u8017\u6642 ${B(e.duration_ms)}`),e.pid&&t.push(`PID ${e.pid}`),t.join(" \xB7 ")}function Yn(e,{active:t,focus:s,status:a,runLine:r,runningStage:i}){let o=e.label||ea[e.key]||e.key;return`<div class="flow-source${t?" is-live":""}" style="--branch-accent:${At[e.key]||At.system}">
    <div class="flow-source-head">
      <span class="flow-source-icon">${b(e.icon||"database",15)}</span>
      <div class="flow-node-heading">
        <span class="flow-node-kicker">SOURCE</span>
        <strong>${n(o)}</strong>
      </div>
      ${ta(a)}
    </div>
    <div class="flow-source-body">
      <p class="flow-source-desc">${n(e.description||"")}</p>
      <div class="flow-source-meta">${r}</div>
      ${i?`<div class="flow-source-current"><span class="flow-current-dot"></span>\u76EE\u524D\u968E\u6BB5\uFF1A<strong>${n(i.label||i.key)}</strong></div>`:""}
      ${s&&s.message?`<div class="flow-source-note" title="${n(s.message)}">${n(s.message)}</div>`:""}
    </div>
  </div>`}function Xn(e){let t=e.active_run,s=t||e.focus_run||e.last_run,a=t?"running":s?s.status:"idle",r=s?n(sa(s)||Ve(s.started_at||s.finished_at)):"\u5C1A\u7121\u57F7\u884C\u7D00\u9304",i=Array.isArray(e.stages)?e.stages:[],o=i.find(m=>m.status==="running"),l=At[e.key]||At.system,f=String(e.key||"branch").replace(/[^a-zA-Z0-9_-]/g,""),g=Yn(e,{active:t,focus:s,status:a,runLine:r,runningStage:o}),h=i.length?i.map((m,w)=>{let M=w?Ke(i[w-1]):l;return`${Kn(m,w,f,M)}${Wn(m,w)}`}).join(""):'<div class="flow-empty">\u6C92\u6709\u53EF\u986F\u793A\u7684\u968E\u6BB5\u3002</div>';return`<article class="flow-lane" style="--branch-accent:${l}"><div class="flow-row">${g}${h}</div></article>`}function Zn(e){return`<div class="flow-canvas-open">
    <div class="processing-branches">${(Array.isArray(e.branches)?e.branches:[]).map(Xn).join("")}</div>
  </div>`}function Fe(e,t,s="",a=""){return`<div class="processing-summary-card">
    <span class="processing-summary-label">${n(e)}</span>
    <span class="processing-summary-value">${t}</span>
    ${s?`<span class="processing-summary-hint">${s}</span>`:""}
    ${a}
  </div>`}function er(e){let t=e.database||{},s=e.index||{},a=e.local_archives||{},r=e.raw_backups||{},i=r.totals||{},o=e.state||{},l=e.capabilities||{},f=e.mode==="running"?"\u57F7\u884C\u4E2D":"\u5F85\u547D",g=t.status==="operational",h=s.status==="operational",m=a.available!==!1,w=r.available!==!1,M=h?`${u(s.indexed)} / ${u(s.total)}`:ve(s.status||"unavailable"),k=h?`${Oe(s.percent)} \xB7 \u5C1A\u9918 ${u(s.remaining)} \u7B46`:n(s.error||"\u7121\u6CD5\u67E5\u8A62 Qdrant \u7D22\u5F15\u8986\u84CB\u7387\u3002"),j=m?`${u(a.unprocessed)} / ${u(a.total)}`:ve("unavailable"),P=m?`\u672A\u8655\u7406 / \u5168\u90E8 \xB7 ${ce(a.unprocessed_bytes)} \u5F85\u8655\u7406`:n(a.error||"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304\u3002");return`<div class="processing-summary">
    ${Fe("\u8655\u7406\u72C0\u614B",ve(e.status||"unknown"),`${n(f)} \xB7 \u66F4\u65B0\u65BC <span data-processing-updated-at>\u2014</span>`)}
    ${Fe("\u672A\u8655\u7406\u58D3\u7E2E\u6A94",n(j),P)}
    ${Fe("\u539F\u59CB Parquet \u5099\u4EFD",w?`${u(r.count)} \u6A94`:ve("unavailable"),w?`\u5171 ${u(i.row_count)} \u7B46 \xB7 ${ce(i.compressed_bytes)}`:n(r.error||"\u7121\u6CD5\u6383\u63CF\u539F\u59CB Parquet \u5099\u4EFD\u3002"))}
    ${Fe("PostgreSQL \u5224\u6C7A",g?u(t.judgment_count):ve("unavailable"),g?`\u6CD5\u898F ${Xs(t.law_count)} \xB7 \u547D\u4EE4 ${Xs(t.order_count)}`:n(t.error||"\u7121\u6CD5\u67E5\u8A62 PostgreSQL\u3002"))}
    ${Fe("Qdrant \u7D22\u5F15",M,k)}
    ${Fe("\u72C0\u614B\u6A94",ve(o.status||"missing"),o.updated_at?`\u66F4\u65B0\u65BC ${n(K(o.updated_at))}`:n(o.detail||"\u5C1A\u7121\u8655\u7406\u72C0\u614B\u7D00\u9304\u3002"))}
    ${Fe("\u5F85\u8655\u7406\u5DE5\u4F5C",l.can_start_update===!1?"\u66AB\u505C\u555F\u52D5":"\u53EF\u958B\u59CB\u66F4\u65B0",l.start_blocked_reason?n(l.start_blocked_reason):`\u672A\u8655\u7406 ${u(l.unprocessed_archives)} \u500B \xB7 \u7D22\u5F15\u5F85\u88DC ${u(l.index_backlog)} \u7B46${l.external_processes?` \xB7 \u5916\u90E8\u7A0B\u5E8F ${u(l.external_processes)} \u500B`:""}`)}
  </div>`}function tr(e){if(e.available===!1)return U({tone:"warn",title:"\u627E\u4E0D\u5230\u5224\u6C7A\u8CC7\u6599\u76EE\u9304",text:n(e.error||"\u7121\u6CD5\u6383\u63CF .rar \u6A94\u6848\u3002")});let t=Number(e.total)||0,s=Number(e.processed)||0,a=Number(e.unprocessed)||0,r=t?100*s/t:null;return`<div class="processing-archive-summary">
    <div class="processing-archive-summary-head">
      <span class="mono">${n(e.data_dir||"")}</span>
      <span>${u(s)} / ${u(t)} \u5DF2\u8655\u7406 \xB7 ${u(a)} \u5F85\u8655\u7406 \xB7 ${ce(e.unprocessed_bytes)} \u5F85\u8655\u7406</span>
    </div>
    ${Lt({percent:r,status:a?"pending":"success",color:"var(--success)"},"processing-bar-lg")}
    <div class="processing-archive-summary-meta">
      <span>\u58D3\u7E2E\u6A94\u532F\u5165\u8986\u84CB ${Oe(r)}</span>
      <span>\u5168\u90E8 ${ce(e.total_bytes)}</span>
    </div>
  </div>`}function sr(e){let t=e.stages||{},a=["extract","filter","postgres"].map(r=>t[r]).filter(Boolean).map(r=>Jn(r,{compact:!0}));return a.length?`<div class="processing-archive-stages">${a.join("")}</div>`:""}function ar(e){let t=e.status||"pending",s=t==="running",a=e.percent===null||e.percent===void 0?null:Math.max(0,Math.min(100,Number(e.percent)||0)),r=s&&a===null,i=[];return e.message&&i.push(e.message),e.error&&i.push(e.error),(e.scanned||e.matched||e.stored)&&i.push(`\u6383\u63CF ${u(e.scanned)} \xB7 \u547D\u4E2D ${u(e.matched)} \xB7 \u5BEB\u5165 ${u(e.stored)}`),`<div class="processing-archive is-${it(t).tone}">
    <div class="processing-archive-head">
      <span class="processing-archive-name mono">${n(e.name)}</span>
      <div class="processing-archive-bar-wrap">
        ${Lt({percent:a,status:t,color:s?"var(--accent)":"var(--success)"})}
      </div>
      <span class="processing-archive-percent mono">${r?"\u9032\u884C\u4E2D":Oe(a)}</span>
      ${ve(t)}
      <span class="processing-archive-size faint">${ce(e.size_bytes)}</span>
    </div>
    ${sr(e)}
    ${i.length?`<div class="processing-archive-note">${i.map(o=>`<span>${n(o)}</span>`).join("")}</div>`:""}
  </div>`}function nr(e){let t=e.archives||{},s=e.local_archives||{},a=Array.isArray(t.items)?t.items:[],r=t.run,i=`<div class="report-section-head">
    <div>
      <div class="report-kicker">ARCHIVE PIPELINE</div>
      <h2 class="report-section-title">\u5224\u6C7A\u58D3\u7E2E\u6A94</h2>
      <p class="processing-section-sub">\u6BCF\u500B\u58D3\u7E2E\u6A94\u540D\u7A31\u5F8C\u65B9\u5373\u6642\u986F\u793A\u8655\u7406\u9032\u5EA6\uFF1B\u672A\u53D6\u5F97\u53EF\u8A08\u7B97\u7684\u7E3D\u91CF\u6642\u6A19\u793A\u300C\u9032\u5EA6\u672A\u77E5\u300D\uFF0C\u4E0D\u4EE5\u63A8\u6E2C\u6578\u503C\u4EE3\u66FF\u3002</p>
    </div>
  </div>`,o=t.source==="run"?`${ve(r?r.status:"idle")} <span>\u76EE\u524D\u986F\u793A ${r?n(r.title||"\u5224\u6C7A\u532F\u5165"):"\u6700\u8FD1\u4E00\u6B21\u532F\u5165"} \u7684\u9010\u6A94\u9032\u5EA6${r&&r.started_at?` \xB7 ${n(sa(r))}`:""}</span>`:t.external?`${ve("running")} <span>${n(t.note||"\u5916\u90E8\u532F\u5165\u7A0B\u5E8F\u672A\u5BEB\u5165\u9010\u6A94\u72C0\u614B\uFF1B\u4EE5\u4E0B\u70BA PostgreSQL \u8986\u84CB\u7387\u3002")}</span>`:'<span class="faint">\u76EE\u524D\u6C92\u6709\u53EF\u8B80\u53D6\u7684\u532F\u5165 run \u72C0\u614B\uFF1B\u4EE5\u4E0B\u4EE5 PostgreSQL \u7684 source_archive \u5224\u5B9A\u662F\u5426\u5DF2\u8655\u7406\u3002</span>';return`<section class="report-card processing-card">
    <div class="report-head">${i}</div>
    <div class="report-section">
      ${tr(s)}
      <div class="processing-archive-run">${o}</div>
      ${a.length?`<div class="processing-archive-list">${a.map(ar).join("")}</div>`:`<div class="processing-empty">\u627E\u4E0D\u5230 .rar \u58D3\u7E2E\u6A94\uFF1B\u8ACB\u78BA\u8A8D ${n(s.data_dir||"\u5224\u6C7A\u8CC7\u6599\u76EE\u9304")}\u3002</div>`}
    </div>
  </section>`}function rr(e){let t=e.timeline||{},s=Array.isArray(t.stages)?t.stages:[],a=`<div class="report-section-head">
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
    </section>`;let r=s.map(o=>`<span class="processing-stack-segment" style="width:${Math.max(0,Number(o.percent)||0)}%;background:${n(o.color||"var(--accent)")}" title="${n(`${o.label} ${B(o.duration_ms)} (${Oe(o.percent)})`)}"></span>`).join(""),i=s.map(o=>`<div class="processing-legend-item">
        <span class="processing-legend-swatch" style="background:${n(o.color||"var(--accent)")}"></span>
        <span class="processing-legend-label">${n(o.label)}</span>
        <span class="mono">${B(o.duration_ms)}</span>
        <span class="processing-legend-percent mono">${Oe(o.percent)}</span>
        ${ve(o.status)}
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
  </section>`}function ir(e){let t=Array.isArray(e.recent_runs)?e.recent_runs:[],s=new Map((e.branches||[]).map(i=>[i.key,i.label])),a=`<div class="report-section-head">
    <div>
      <div class="report-kicker">RECENT RUNS</div>
      <h2 class="report-section-title">\u6700\u8FD1\u8655\u7406\u7D00\u9304</h2>
      <p class="processing-section-sub">\u5305\u542B\u8CC7\u6599\u66F4\u65B0\u3001\u5224\u6C7A\u532F\u5165\u3001Parquet\u3001Qdrant \u8207\u6CD5\u898F\uFF0F\u547D\u4EE4\u4E0B\u8F09\u3002</p>
    </div>
  </div>`;if(!t.length)return`<section class="report-card processing-card">
      <div class="report-head">${a}</div>
      <div class="report-section"><div class="processing-empty">\u5C1A\u7121\u8655\u7406\u7D00\u9304\u3002</div></div>
    </section>`;let r=t.map(i=>{let o=s.get(i.branch)||ea[i.branch]||i.branch||"\u2014";return`<div class="processing-run">
        <div class="processing-run-head">
          <span class="badge badge-neutral">${n(o)}</span>
          <strong>${n(i.title||"\u8655\u7406")}</strong>
          ${ve(i.status)}
          <span class="grow"></span>
          <span class="mono faint">${n(K(i.finished_at||i.started_at))}</span>
          <span class="mono">${i.duration_ms?B(i.duration_ms):"\u2014"}</span>
        </div>
        ${i.message?`<div class="processing-run-message">${n(i.message)}</div>`:""}
      </div>`}).join("");return`<section class="report-card processing-card">
    <div class="report-head">${a}</div>
    <div class="report-section"><div class="processing-run-list">${r}</div></div>
  </section>`}function or(e){let t=Array.isArray(e.notices)?e.notices:[];return t.length?`<div class="processing-notices">${t.map(s=>U({tone:s.tone||"info",title:s.title,text:n(s.message||"")})).join("")}</div>`:""}function lr(e){return`${or(e)}
    ${er(e)}
    <section class="processing-flow-section">
      <div class="processing-section-head">
        <div>
          <div class="report-kicker">PIPELINE CANVAS</div>
          <h2 class="report-section-title">\u8655\u7406\u6D41\u7A0B</h2>
          <p class="processing-section-sub">\u5224\u6C7A\u3001\u6CD5\u898F\u3001\u547D\u4EE4\u4E09\u689D\u6D41\u7A0B\u5373\u6642\u53CD\u6620\u76EE\u524D\u57F7\u884C\u968E\u6BB5\uFF1B\u66F2\u7DDA\u7531\u4F86\u6E90\u7BC0\u9EDE\u9023\u5230\u5404\u968E\u6BB5\uFF0C\u767C\u5149\u7BC0\u9EDE\u8207\u6D41\u52D5\u66F2\u7DDA\u8868\u793A\u76EE\u524D\u57F7\u884C\u4F4D\u7F6E\u3002</p>
        </div>
      </div>
      ${Zn(e)}
    </section>
    ${nr(e)}
    ${rr(e)}
    ${ir(e)}`}function cr(e,t){return`<div class="report-card processing-card">
    <div class="report-section">
      ${U({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B",text:n(e||"\u672A\u77E5\u932F\u8AA4")})}
      ${t?`<p class="processing-section-sub">\u4E0A\u6B21\u6210\u529F\u66F4\u65B0\uFF1A${n(K(t.generated_at))}\u3002\u756B\u9762\u4E0A\u6C92\u6709\u986F\u793A\u66FF\u4EE3\u6216\u63A8\u6E2C\u7684\u9032\u5EA6\u3002</p>`:""}
      <div class="processing-error-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh">
          ${b("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
  </div>`}async function dr(e){e.innerHTML=`<section class="page processing-page">
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
          ${b("refresh",14)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
        <button class="btn btn-secondary btn-sm processing-stop" type="button" data-processing-action="stop" id="processing-stop" hidden>
          ${b("x",14)}<span>\u505C\u6B62\u66F4\u65B0</span>
        </button>
        <button class="btn btn-primary btn-sm" type="button" data-processing-action="update" id="processing-update">
          ${b("download",14)}<span data-update-label>\u8CC7\u6599\u66F4\u65B0</span>
        </button>
      </div>
    </div>
    <div id="processing-root">
      <div class="processing-loading" role="status">
        <span class="spinner" aria-hidden="true"></span>
        <span>\u6B63\u5728\u8B80\u53D6\u8655\u7406\u72C0\u614B\u2026</span>
      </div>
    </div>
  </section>`;let t=e.querySelector(".processing-page"),s=e.querySelector("#processing-root"),a=e.querySelector("#processing-update"),r=e.querySelector("#processing-stop"),i=e.querySelector("#processing-refresh"),o=e.querySelector("#processing-index-toggle"),l=!1,f=!1,g=!1,h=null,m="",w=null,M=S=>{let T=S.capabilities||{},q=!!(o&&o.checked),C=q?T.can_start_update_with_index!==!1:T.can_start_update!==!1,ee=q&&T.index_blocked_reason||T.start_blocked_reason;if(!g){a.disabled=!C,a.title=ee||"\u6AA2\u67E5\u7DDA\u4E0A\u6CD5\u898F\uFF0F\u547D\u4EE4\uFF0C\u4E26\u8655\u7406\u672A\u532F\u5165\u7684\u5224\u6C7A\u58D3\u7E2E\u6A94\u3002";let H=a.querySelector("[data-update-label]");H&&(H.textContent=C?"\u8CC7\u6599\u66F4\u65B0":T.active_update_id?"\u66F4\u65B0\u57F7\u884C\u4E2D":"\u8655\u7406\u7A0B\u5E8F\u57F7\u884C\u4E2D"),r.hidden=!T.can_stop_update,o&&(o.disabled=T.can_start_update===!1)}},k=async({silent:S=!1}={})=>{if(!(l||f)){f=!0,S||z(i,!0,"\u66F4\u65B0\u4E2D\u2026");try{let T=await F.processing();if(l)return;h=T;let q=lr(T);q!==m&&(s.innerHTML=q,m=q);let C=s.querySelector("[data-processing-updated-at]");if(C){let ee=K(T.generated_at);C.textContent!==ee&&(C.textContent=ee)}M(T)}catch(T){if(l)return;let q=cr(T.message,h);q!==m&&(s.innerHTML=q,m=q),S||R(T.message||"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u8655\u7406\u72C0\u614B\u3002","danger",6e3)}finally{f=!1,S||z(i,!1)}}},j=async S=>{if(!g){g=!0,z(S,!0,"\u555F\u52D5\u4E2D\u2026");try{let T=!!(o&&o.checked),q=await F.startProcessingUpdate(T);R(`\u5DF2\u555F\u52D5\u8CC7\u6599\u66F4\u65B0${T?"\uFF0C\u5B8C\u6210\u5F8C\u63A5\u7E8C Qdrant \u7D22\u5F15":""}\u3002`,"ok",6e3),q&&q.run_id&&console.info("processing update started",q),await k({silent:!0})}catch(T){R(T.message||"\u7121\u6CD5\u555F\u52D5\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{g=!1,z(S,!1),h&&M(h)}}},P=async S=>{if(!g){g=!0,z(S,!0,"\u505C\u6B62\u4E2D\u2026");try{let T=await F.stopProcessingUpdate();R(T.message||"\u5DF2\u9001\u51FA\u505C\u6B62\u8A0A\u865F\u3002","info",6e3),await k({silent:!0})}catch(T){R(T.message||"\u7121\u6CD5\u505C\u6B62\u8CC7\u6599\u66F4\u65B0\u3002","danger",7e3)}finally{g=!1,z(S,!1),h&&M(h)}}},N=S=>{let T=S.target.closest("[data-processing-action]");if(!T||T.disabled)return;let q=T.dataset.processingAction;q==="refresh"?k({silent:!1}):q==="update"?j(T):q==="stop"&&P(T)},_=S=>{S.target===o&&h&&M(h)};return t.addEventListener("click",N),o&&o.addEventListener("change",_),await k({silent:!1}),w=window.setInterval(()=>{document.hidden||k({silent:!0})},Fn),()=>{l=!0,w!==null&&window.clearInterval(w),t.removeEventListener("click",N),o&&o.removeEventListener("change",_)}}var ls={};Qe(ls,{render:()=>hr});function Tt(e){if(e==null||e==="")return"\u2014";let t=Number(e);return Number.isFinite(t)?`${t.toFixed(t>=10?1:2)}%`:"\u2014"}function aa(e){return e==null?"\u2014":u(e)}function ur(e){return e.count?e.severity==="danger"?Q("failed","\u9700\u8655\u7406"):e.severity==="warn"?Q("warning","\u6CE8\u610F"):Q("preview","\u63D0\u793A"):Q("success","\u901A\u904E")}function pr(e){return e.count?e.severity==="danger"?"is-danger":e.severity==="warn"?"is-warn":"is-info":"is-ok"}function mr(e){let t=Number(e.count)||0,s=Math.max(0,Math.min(100,Number(e.percent)||0));return`<div class="quality-check ${pr(e)}">
    <div class="quality-check-head">
      <span class="quality-check-label">${n(e.label)}</span>
      ${ur(e)}
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
  </div>`}function vr(e){let t=e.coverage||{},s=e.totals||{},a=e.source||{},r=t.postgres_diff,i=r==null?"\u2014":r===0?"\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u4E00\u81F4":`\u8207\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D\u76F8\u5DEE ${u(Math.abs(r))} \u7B46`,o=t.vector_indexed===null||t.vector_indexed===void 0?t.detail||"\u7121\u6CD5\u53D6\u5F97\u7D22\u5F15\u7D71\u8A08":`${u(t.vector_indexed)} / ${u(t.vector_total)} \xB7 ${t.model||"\u2014"}`;return`<div class="metric-grid quality-coverage-grid">
    <div class="metric-card">
      <div class="metric-label">${b("filter",13)}<span>\u539F\u59CB\u7CBE\u78BA\u547D\u4E2D</span></div>
      <div class="metric-value">${u(s.matched_rows)}</div>
      <div class="metric-foot">citation_count &gt; 0\uFF1B\u5171 ${u(s.citation_total)} \u7B46\u5F15\u7528</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${b("database",13)}<span>PostgreSQL \u6536\u9304</span></div>
      <div class="metric-value">${aa(t.postgres_judgments)}</div>
      <div class="metric-foot">${n(i)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${b("brain",13)}<span>\u5411\u91CF\u7D22\u5F15</span></div>
      <div class="metric-value">${n(Tt(t.vector_coverage_pct))}</div>
      <div class="metric-foot">${n(o)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${b("layers",13)}<span>DuckDB \u5019\u9078</span></div>
      <div class="metric-value">${aa(a.candidate_total)}</div>
      <div class="metric-foot">${u(a.candidate_archive_count)} / ${u(a.archive_count)} \u500B manifest \u6709 candidate_count</div>
    </div>
  </div>`}function fr(e){return e.length?`<div class="table-wrap">
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
              <td class="cell-date">${n(we(t.date_min))} \u2013 ${n(we(t.date_max))}</td>
            </tr>`}).join("")}
      </tbody>
    </table>
  </div>`:de({iconName:"table",title:"\u6C92\u6709\u539F\u59CB Parquet \u6A94\u6848",text:"\u5B8C\u6210\u5224\u6C7A RAR \u532F\u5165\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u6BCF\u500B\u58D3\u7E2E\u6A94\u7684 DuckDB \u7D71\u8A08\u3002"})}function gr(e){let t=e.totals||{},s=e.source||{},a=Array.isArray(e.checks)?e.checks:[],r=e.summary||{},i=e.distributions||{},o=Array.isArray(e.warnings)?e.warnings:[],l=ce(s.compressed_bytes||0);return`<div class="report-card quality-report" data-database="quality">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">DUCKDB DATA QUALITY</div>
        <div class="report-title">
          \u539F\u59CB Parquet \u8CC7\u6599\u54C1\u8CEA ${Q(e.status||"operational")}
          <span class="chip">raw.parquet</span>
        </div>
        <div class="report-sub">
          ${u(t.rows)} \u7B46 \xB7 ${u(s.raw_files)} \u500B\u6A94\u6848 \xB7
          ${l} \xB7 \u6383\u63CF ${B(e.scan_ms||0)} \xB7
          ${n(K(e.generated_at))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-quality">
          ${b("download",14)}<span>JSON</span>
        </button>
      </div>
    </div>
    ${o.length?`<div class="report-alert">${U({tone:"warn",title:"\u76EE\u524D\u9650\u5236\u8207\u5DEE\u7570",text:o.map(f=>n(f)).join("<br>")})}</div>`:""}
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
      <div class="quality-checks">${a.map(mr).join("")}</div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6536\u9304\u8986\u84CB</span>
        <span class="muted" style="font-size:9.5px">PostgreSQL \u8207\u5411\u91CF\u7D22\u5F15\u70BA\u5373\u6642\u67E5\u8A62\uFF0C\u4E0D\u662F\u5F9E Parquet \u63A8\u4F30</span>
      </div>
      ${vr(e)}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">\u6A94\u6848\u660E\u7D30</span>
        <span class="muted" style="font-size:9.5px">${u(s.archive_count)} \u500B\u539F\u59CB Parquet</span>
      </div>
      ${fr(Array.isArray(e.archives)?e.archives:[])}
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
  </div>`}async function hr(e){e.innerHTML=`<section class="page data-page quality-page">
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
          ${b("refresh",15)}<span>\u91CD\u65B0\u6383\u63CF</span>
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
  </section>`;let t=e.querySelector("#quality-content"),s=e.querySelector("#quality-refresh"),a=e.querySelector("#quality-meta"),r=null,i=()=>{r&&(t.innerHTML=gr(r),a.textContent=`DUCKDB \xB7 ${u(r.totals?.rows)} \u7B46 \xB7 ${B(r.scan_ms||0)}`)},o=async()=>{z(s,!0,"\u6383\u63CF\u4E2D\u2026");try{r=await F.quality(),i()}catch(l){t.innerHTML=`<div class="report-card">
        <div class="report-head">
          <div class="report-title-group">
            <div class="report-kicker">DUCKDB DATA QUALITY</div>
            <div class="report-title">\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557</div>
            <div class="report-sub">\u8ACB\u6C42\u672A\u5B8C\u6210\uFF0C\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u63A8\u6E2C\u8CC7\u6599\u3002</div>
          </div>
        </div>
        <div class="report-section">
          ${U({tone:"danger",title:"\u7121\u6CD5\u53D6\u5F97\u8CC7\u6599\u54C1\u8CEA\u7D71\u8A08",text:n(l.message||"\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002")})}
        </div>
      </div>`,a.textContent="DUCKDB \xB7 \u8B80\u53D6\u5931\u6557",R("\u8CC7\u6599\u54C1\u8CEA\u6383\u63CF\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}finally{z(s,!1)}};s.addEventListener("click",o),t.addEventListener("click",l=>{!l.target.closest("[data-action='export-quality']")||!r||je(`judgment-quality-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(r,null,2),"application/json;charset=utf-8")}),await o()}var cs={};Qe(cs,{render:()=>qr});var na={frontend:"browser",backend:"server",database:"database",storage:"layers",vector:"cube",ai:"brain",default:"cpu"};var br={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u700F\u89BD\u5668\u5132\u5B58\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90"};function $r(e){return e==="operational"?{label:"\u6838\u5FC3\u670D\u52D9\u6B63\u5E38",tone:"ok",headline:"\u6838\u5FC3\u8CC7\u6599\u7BA1\u7DDA\u904B\u4F5C\u4E2D",copy:"FastAPI\u3001PostgreSQL \u8207 Parquet \u5747\u53EF\u5B58\u53D6\u3002Qdrant\u3001Embedding \u8207 LLM \u6703\u5373\u6642\u6AA2\u67E5\uFF1B\u672A\u8A2D\u5B9A\u6216\u964D\u7D1A\u6642\u4E0D\u5F71\u97FF\u8CC7\u6599\u700F\u89BD\u8207\u67E5\u8A62\u5831\u8868\u3002"}:e==="degraded"?{label:"\u90E8\u5206\u670D\u52D9\u964D\u7D1A",tone:"warn",headline:"\u90E8\u5206\u670D\u52D9\u9700\u8981\u8A2D\u5B9A\u6216\u4FEE\u5FA9",copy:"\u6838\u5FC3\u8CC7\u6599\u670D\u52D9\u76EE\u524D\u672A\u5B8C\u5168\u53EF\u7528\u3002\u8ACB\u67E5\u770B\u4E0B\u65B9\u670D\u52D9\u5361\u7247\u3001\u8CC7\u6599\u7248\u672C\u8207\u6700\u8FD1\u7684\u57F7\u884C\u7D00\u9304\uFF0C\u78BA\u8A8D PostgreSQL\u3001Parquet \u6216\u5916\u90E8\u670D\u52D9\u72C0\u614B\u3002"}:{label:Ee(e).label,tone:Ee(e).tone,headline:"\u76EE\u524D\u7121\u6CD5\u78BA\u8A8D\u7CFB\u7D71\u72C0\u614B",copy:"\u72C0\u614B API \u56DE\u50B3\u4E86\u975E\u9810\u671F\u7D50\u679C\u3002\u8ACB\u91CD\u65B0\u6574\u7406\uFF0C\u6216\u76F4\u63A5\u6AA2\u67E5 FastAPI \u670D\u52D9\u65E5\u8A8C\u3002"}}function yr(e){let t=Ee(e.status),s=na[e.kind]||na.default,a=e.latency_ms===null||e.latency_ms===void 0?"":`<span class="service-latency">${u(e.latency_ms)} ms</span>`;return`<article class="service-card">
    <div class="service-top">
      <span class="service-icon">${b(s,14)}</span>
      <span class="service-name" title="${n(e.name)}">${n(e.name)}</span>
      <span class="service-kind">${n(e.kind||"")}</span>
    </div>
    <div class="service-status">
      <span class="status-dot ${t.tone==="ok"?"is-ok":t.tone==="warn"?"is-warn":t.tone==="danger"?"is-danger":"is-idle"}" aria-hidden="true"></span>
      ${n(t.label)}
      ${a}
    </div>
    <p class="service-detail" title="${n(e.detail||"")}">${n(e.detail||"")}</p>
  </article>`}function wr(e,t){return`<div class="arch-node ${e?"":"is-muted"}" ${e?"":'title="\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165"'}>${n(t)}</div>`}function _r(e,t){if(e==="IndexedDB")return ks();let a={PostgreSQL:"postgres",Parquet:"parquet",Qdrant:"qdrant",Embedding:"embedding",Retriever:"rag","RAG Engine":"rag",LLM:"llm"}[e];return a?t.find(i=>i.id===a)?.status==="operational":!0}function xr(e,t){let s=e?.layers||[];if(!s.length)return'<div class="report-empty-inline">\u72C0\u614B API \u672A\u63D0\u4F9B\u67B6\u69CB\u8CC7\u6599\u3002</div>';let a=s.map(i=>{let o=(i.nodes||[]).map(l=>wr(_r(l,t),l)).join("");return`<div class="arch-layer">
      <div class="arch-layer-label">${n(i.label||i.id)}</div>
      <div class="arch-nodes">${o}</div>
    </div>`}),r=[];return a.forEach((i,o)=>{o&&r.push(`<div class="arch-arrow" aria-hidden="true">${b("arrowRight",15)}</div>`),r.push(i)}),`<div class="arch-flow">${r.join("")}</div>
    <div class="arch-legend">
      <span><i class="legend-key is-live"></i>\u5DF2\u63A5\u5165\u4E14\u72C0\u614B\u6B63\u5E38</span>
      <span><i class="legend-key is-off"></i>\u5C1A\u672A\u8A2D\u5B9A\u6216\u5C1A\u672A\u63A5\u5165</span>
      <span>${b("info",12)} \u7BC0\u9EDE\u72C0\u614B\u4F86\u81EA\u4E3B\u670D\u52D9\u5065\u5EB7\u6AA2\u67E5</span>
    </div>`}function kr(e){return!Array.isArray(e)||!e.length?'<div class="report-empty-inline">\u6C92\u6709\u7AEF\u9EDE\u8CC7\u8A0A\u3002</div>':`<div class="endpoint-list">
    ${e.map(t=>`<div class="endpoint-row">
          <span class="endpoint-method">${n(t.method)}</span>
          <span class="endpoint-path" title="${n(t.path)}">${n(t.path)}</span>
          <span class="endpoint-label">${n(t.label||"")}</span>
        </div>`).join("")}
  </div>`}function Ye(e,t){return`<div class="detail-row">
    <span class="detail-label">${n(e)}</span>
    <span class="detail-value">${t}</span>
  </div>`}function Sr(e){return e?`<div class="detail-list">
    ${Ye("\u7248\u672C ID",`<strong>#${u(e.id)}</strong>`)}
    ${Ye("\u8CC7\u6599\u985E\u578B",Q("operational",e.source_type==="law"?"\u6CD5\u898F":"\u547D\u4EE4"))}
    ${Ye("\u4F86\u6E90\u66F4\u65B0\u65E5",`<strong>${n(e.update_date||"\u2014")}</strong>`)}
    ${Ye("\u6CD5\u898F / \u689D\u6587",`<strong>${u(e.law_count)} / ${u(e.article_count)}</strong>`)}
    ${Ye("\u4E0B\u8F09\u6642\u9593",`<span class="mono">${K(e.downloaded_at)}</span>`)}
    ${Ye("Parquet",`<code title="${n(e.parquet_path||"")}">${n(e.parquet_path||"\u2014")}</code>`)}
  </div>`:'<div class="report-empty-inline">\u5C1A\u672A\u532F\u5165\u4EFB\u4F55\u8CC7\u6599\u7248\u672C\u3002</div>'}function Ar(e){if(!Array.isArray(e)||!e.length)return de({iconName:"history",title:"\u5C1A\u7121\u4E0B\u8F09\u57F7\u884C\u7D00\u9304",text:"\u57F7\u884C judgment-law-download \u5F8C\uFF0C\u6210\u529F\u3001\u7121\u8B8A\u66F4\u8207\u5931\u6557\u7684\u7D50\u679C\u6703\u51FA\u73FE\u5728\u9019\u88E1\u3002"});let t=[{key:"id",label:"Run",type:"number"},{key:"source_type",label:"\u985E\u578B",type:"source"},{key:"status",label:"\u72C0\u614B",type:"status"},{key:"started_at",label:"\u958B\u59CB\u6642\u9593",type:"datetime"},{key:"duration_ms",label:"\u8017\u6642",type:"duration"},{key:"law_count",label:"\u6CD5\u898F",type:"number"},{key:"article_count",label:"\u689D\u6587",type:"number"},{key:"error_message",label:"\u932F\u8AA4",type:"longtext"}];return`<div class="table-wrap" style="border-top:0;max-height:340px">
    <table class="data-table runs-table">
      <thead><tr>${t.map(s=>`<th scope="col">${n(s.label)}</th>`).join("")}</tr></thead>
      <tbody>
        ${e.map(s=>`<tr>${t.map(a=>`<td>${pt(s[a.key],a.type)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </div>`}function Lr(e){let t=e.data||{},s=Array.isArray(e.services)?e.services:[],a=$r(e.status),r=e.architecture||{},i=s.find(M=>M.id==="qdrant"),o=s.find(M=>M.id==="rag"),l=s.find(M=>M.id==="llm"),f=Je(),g=br[f]||f,h=ye("/api/docs"),m=ye("/api/openapi.json"),w=ye("/api/status");return`<section class="status-hero">
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
          <span>${b("clock",11)} \u6AA2\u67E5\u6642\u9593 ${K(e.checked_at)} \xB7 ${n(Ve(e.checked_at))}</span>
          <span>${b("server",11)} ${s.length} \u500B\u670D\u52D9\u5143\u4EF6</span>
          <span>${b("database",11)} ${u(t.total_current)} \u7B46\u73FE\u884C\u8CC7\u6599</span>
          <span>${b("layers",11)} ${u(t.parquet_files)} \u500B\u539F\u59CB Parquet</span>
          <span title="API \u4F4D\u5740\u4F86\u6E90\uFF1A${n(g)}">${b("link",11)} ${n(qe())}</span>
        </div>
      </div>
    </section>

    <div class="service-grid">${s.map(yr).join("")}</div>

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

    ${i?.status==="not_configured"||o?.status==="not_configured"||l?.status==="not_configured"?`<div class="data-section">${U({tone:"info",title:"\u90E8\u5206 AI \u5143\u4EF6\u5C1A\u672A\u8A2D\u5B9A",text:`Qdrant\uFF1A${n(i?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BRAG\uFF1A${n(o?.detail||"\u672A\u8A2D\u5B9A")}\uFF1BLLM\uFF1A${n(l?.detail||"\u672A\u8A2D\u5B9A")}\u3002\u9019\u4E9B\u72C0\u614B\u4E0D\u6703\u88AB\u507D\u88DD\u6210\u53EF\u7528\u3002`})}</div>`:""}

    <div class="data-section card architecture-card">
      <div class="section-head">
        <div>
          <div class="section-title">\u524D\u5F8C\u7AEF\u67B6\u69CB</div>
          <div class="section-sub">Client \u2192 Application \u2192 Data \u2192 Intelligence</div>
        </div>
        <span class="badge badge-neutral badge-mono">${u((r.flow||[]).length)} layers</span>
      </div>
      ${xr(r,s)}
    </div>

    <div class="status-columns">
      <section class="card">
        <div class="side-card-head">
          <span class="side-card-title">${b("terminal",14)}API \u7AEF\u9EDE</span>
          <a href="${n(h)}" target="_blank" rel="noopener noreferrer" class="chip"
            >OpenAPI ${b("external",11)}</a>
        </div>
        ${kr(e.endpoints)}
        <div class="side-card-foot">
          \u76EE\u524D API Base\uFF1A<code>${n(qe())}</code>\uFF08${n(g)}\uFF09\u3002\u4E92\u52D5\u5F0F API \u6587\u4EF6\u4F4D\u65BC <a href="${n(h)}" target="_blank" rel="noopener noreferrer"><code>${n(h)}</code></a>\uFF0COpenAPI schema \u4F4D\u65BC <a href="${n(m)}" target="_blank" rel="noopener noreferrer"><code>${n(m)}</code></a>\u3002
        </div>
      </section>

      <section class="card">
        <div class="side-card-head">
          <span class="side-card-title">${b("layers",14)}\u6700\u65B0\u8CC7\u6599\u7248\u672C</span>
          ${Q("operational","Parquet")}
        </div>
        ${Sr(t.last_version)}
        <div class="side-card-foot">
          \u539F\u59CB Parquet \u5408\u8A08 ${ce(t.parquet_bytes)}\uFF1BPostgreSQL \u4FDD\u5B58 metadata \u8207\u7248\u672C\u72C0\u614B\u3002
        </div>
      </section>
    </div>

    <section class="card data-section" style="margin-top:16px">
      <div class="side-card-head">
        <span class="side-card-title">${b("history",14)}\u6700\u8FD1\u4E0B\u8F09\u57F7\u884C</span>
        <span class="badge badge-neutral badge-mono">${u(t.run_count)} TOTAL</span>
      </div>
      ${Ar(e.recent_runs)}
    </section>

    <p class="status-footnote">
      \u6B64\u9801\u76F4\u63A5\u547C\u53EB <code>GET ${n(w)}</code>\u3002\u670D\u52D9\u72C0\u614B\u3001\u8CC7\u6599\u7B46\u6578\u8207\u6700\u8FD1\u57F7\u884C\u7D00\u9304\u7686\u4F86\u81EA\u76EE\u524D\u7684
      PostgreSQL \u8207\u8CC7\u6599\u76EE\u9304\uFF1BQdrant\u3001Embedding\u3001RAG \u8207 LLM \u672A\u8A2D\u5B9A\u6642\u6703\u6A19\u793A\u70BA\u300C\u672A\u8A2D\u5B9A\u300D\uFF0C\u4E0D\u6703\u986F\u793A\u63A8\u6E2C\u6578\u64DA\u3002
    </p>`}function Mr(){return`<div class="status-hero">
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
    </div>`}function Tr(e){return`<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">STATUS CHECK</div>
        <div class="report-title">\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B</div>
        <div class="report-sub">\u6C92\u6709\u986F\u793A\u4EFB\u4F55\u5FEB\u53D6\u6216\u63A8\u6E2C\u7684\u670D\u52D9\u6578\u64DA\u3002</div>
      </div>
    </div>
    <div class="report-section">
      ${U({tone:"danger",title:"\u72C0\u614B API \u8ACB\u6C42\u5931\u6557",text:n(e.message||"\u8ACB\u78BA\u8A8D judgment-web \u662F\u5426\u555F\u52D5\u3002")})}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-retry">
          ${b("refresh",14)}<span>\u91CD\u8A66</span>
        </button>
      </div>
    </div>
  </div>`}async function qr(e,t){let s=!1,a=null,r=null;e.innerHTML=`<section class="page status-page">
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
          ${b("refresh",15)}<span>\u91CD\u65B0\u6574\u7406</span>
        </button>
      </div>
    </div>
    <div id="status-content">${Mr()}</div>
  </section>`;let i=e.querySelector("#status-content"),o=e.querySelector("#refresh-status"),l=e.querySelector("#auto-refresh"),f=async({quiet:g=!1}={})=>{g||(o.disabled=!0,z(o,!0,"\u6AA2\u67E5\u4E2D\u2026"));try{let h=await F.status();if(s)return;r=h,i.innerHTML=Lr(h),typeof t?.refreshHeaderStatus=="function"&&t.refreshHeaderStatus();let m=i.querySelector("#status-retry");m&&m.addEventListener("click",()=>f()),g||R("\u670D\u52D9\u72C0\u614B\u5DF2\u66F4\u65B0\u3002","ok",2200)}catch(h){if(s)return;i.innerHTML=Tr(h);let m=i.querySelector("#status-retry");m&&m.addEventListener("click",()=>f()),g||R(h.message||"\u7121\u6CD5\u53D6\u5F97\u670D\u52D9\u72C0\u614B\u3002","danger")}finally{s||(o.disabled=!1,z(o,!1))}};return o.addEventListener("click",()=>f()),l.addEventListener("change",()=>{a&&(window.clearInterval(a),a=null),l.checked&&(a=window.setInterval(()=>f({quiet:!0}),3e4),R("\u5DF2\u555F\u7528\u6BCF 30 \u79D2\u81EA\u52D5\u66F4\u65B0\u3002","info",2200))}),await f({quiet:!0}),t&&typeof t.setTitle=="function"&&t.setTitle("\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"),()=>{s=!0,a&&window.clearInterval(a)}}var ra="rag",Nt={rag:{page:is,title:"RAG \u63D0\u554F \xB7 Judgment RAG Console"},data:{page:as,title:"\u8CC7\u6599\u5EAB\u67E5\u8A62 \xB7 Judgment RAG Console"},quality:{page:ls,title:"\u8CC7\u6599\u54C1\u8CEA \xB7 Judgment RAG Console"},performance:{page:rs,title:"\u6548\u80FD\u5831\u8868 \xB7 Judgment RAG Console"},processing:{page:os,title:"\u8CC7\u6599\u8655\u7406 \xB7 Judgment RAG Console"},status:{page:cs,title:"\u7CFB\u7D71\u72C0\u614B \xB7 Judgment RAG Console"}},qt=document.getElementById("app-main"),Et=null,jt=0,Pt=0,ds=null,Ue=!1,Pe=!1,He={embedding:[],llm:[]};function Er(){return`<div class="page-loading" aria-live="polite">
    <div class="skeleton skeleton-title"></div>
    <div class="skeleton skeleton-subtitle"></div>
    <div class="skeleton-grid">
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
    </div>
  </div>`}function la(){let t=window.location.hash.replace(/^#\/?/,"").trim().split("/")[0]||ra;return Object.prototype.hasOwnProperty.call(Nt,t)?t:ra}function jr(e){document.querySelectorAll("[data-route]").forEach(t=>{let s=t.dataset.route===e;t.classList.toggle("is-active",s),s?t.setAttribute("aria-current","page"):t.removeAttribute("aria-current")})}function Nr(e){return`<section class="page">
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
          <span class="notice-icon" aria-hidden="true">${b("alert",12)}</span>
          <div class="notice-body">
            <strong>\u7121\u6CD5\u5EFA\u7ACB\u9801\u9762</strong>
            <p>${n(e.message||"\u672A\u77E5\u932F\u8AA4")}</p>
          </div>
        </div>
        <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
          <button class="btn btn-secondary btn-sm" type="button" id="route-retry">
            ${b("refresh",14)}<span>\u91CD\u65B0\u8F09\u5165</span>
          </button>
        </div>
      </div>
    </div>
  </section>`}async function us(){let e=la(),t=++jt;if(jr(e),window.location.hash!==`#/${e}`&&window.history.replaceState(null,"",`#/${e}`),typeof Et=="function"){try{Et()}catch{}Et=null}document.title=Nt[e].title,qt.innerHTML=Er(),qt.focus({preventScroll:!0}),window.scrollTo({top:0,behavior:"auto"});let s={route:e,navigate(a){Nt[a]&&(window.location.hash=`#/${a}`)},setTitle(a){t===jt&&a&&(document.title=a)},refreshHeaderStatus:Rt};try{let a=await Nt[e].page.render(qt,s);if(t!==jt){typeof a=="function"&&a();return}Et=typeof a=="function"?a:null}catch(a){if(t!==jt)return;console.error("Failed to render route",e,a),qt.innerHTML=Nr(a);let r=document.getElementById("route-retry");r&&r.addEventListener("click",()=>us()),R("\u9801\u9762\u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002","danger")}}function Ct({enabled:e,busy:t=!1,label:s="",title:a}){let r=document.getElementById("header-status");if(!r)return;let i=r.querySelector(".header-status-label");Pe=e,r.classList.toggle("is-on",e),r.classList.toggle("is-off",!e),r.classList.toggle("is-busy",t),r.disabled=t,r.setAttribute("aria-checked",e?"true":"false"),r.setAttribute("aria-busy",t?"true":"false"),r.setAttribute("aria-label",t?s:e?"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF0C\u9EDE\u64CA\u95DC\u9589":"\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\uFF0C\u9EDE\u64CA\u958B\u555F"),r.title=a,i&&(i.textContent=e?"ON":"OFF")}function ca(e){let t=Array.isArray(e?.embedding)?e.embedding.length:0,s=Array.isArray(e?.llm)?e.llm.length:0;return`${t} \u500B embedding \xB7 ${s} \u500B LLM`}async function Rt(){if(!document.getElementById("header-status")||Ue)return;let t=++Pt;try{let s=await F.testMode();if(t!==Pt||Ue)return;He=s.models||{embedding:[],llm:[]};let a=!!s.enabled,r=ca(He);Ct({enabled:a,title:`\u6E2C\u8A66\u6A21\u5F0F ${a?"ON":"OFF"} \xB7 ${r} \xB7 \u9EDE\u64CA\u5207\u63DB`})}catch{if(t!==Pt||Ue)return;Ct({enabled:!1,title:"\u5F8C\u7AEF\u96E2\u7DDA \xB7 \u7121\u6CD5\u8B80\u53D6\u6E2C\u8A66\u6A21\u5F0F\uFF1B\u8ACB\u78BA\u8A8D API"})}}function Pr(){let e=document.getElementById("header-status");e&&e.addEventListener("click",async()=>{if(Ue)return;let t=!Pe;Pt+=1,Ue=!0,Ct({enabled:Pe,busy:!0,label:t?"\u6B63\u5728\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u2026":"\u6B63\u5728\u95DC\u9589\u6E2C\u8A66\u6A21\u5F0F\u2026",title:t?"\u6B63\u5728\u958B\u555F\u6E2C\u8A66\u6A21\u5F0F\u2026":"\u6B63\u5728\u95DC\u9589\u6E2C\u8A66\u6A21\u5F0F\u2026"});try{let s=await F.setTestMode(t);if(Ue=!1,Pe=!!s.enabled,He=s.models||{embedding:[],llm:[]},Ct({enabled:Pe,title:`\u6E2C\u8A66\u6A21\u5F0F ${Pe?"ON":"OFF"} \xB7 ${ca(He)} \xB7 \u9EDE\u64CA\u5207\u63DB`}),window.dispatchEvent(new CustomEvent("judgment:test-mode",{detail:{enabled:Pe,models:He}})),Pe){let a=He.embedding?.length||0,r=He.llm?.length||0;R(`\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u958B\u555F\uFF1A\u6BCF\u6B21 RAG \u63D0\u554F\u6703\u57F7\u884C ${a} \u500B embedding \u8207 ${r} \u500B LLM \u6A21\u578B\uFF0C\u4E14\u4E0D\u8A2D\u903E\u6642\u3002`,"ok",7e3)}else R("\u6E2C\u8A66\u6A21\u5F0F\u5DF2\u95DC\u9589\u3002","info")}catch(s){Ue=!1,await Rt(),R(s.message||"\u6E2C\u8A66\u6A21\u5F0F\u5207\u63DB\u5931\u6557\u3002","danger",6e3)}})}var ia={query:"\u7DB2\u5740 ?api= \u53C3\u6578",storage:"\u6B64\u700F\u89BD\u5668\u5132\u5B58\u7684\u503C",config:"config.js \u9810\u8A2D\u503C","file-default":"file:// \u9810\u8A2D\u503C","same-origin":"\u540C\u6E90\uFF08\u76EE\u524D\u7DB2\u57DF\uFF09"};function Cr(e){try{let t=new URL(e).hostname;return["localhost","127.0.0.1","::1","[::1]"].includes(t)}catch{return!1}}function Rr(e){return window.location.protocol==="https:"&&/^http:\/\//i.test(e)&&!Cr(e)}function Ir(){let e=document.getElementById("api-config-trigger"),t=document.getElementById("dialog-root");if(!e||!t)return{open(){}};t.innerHTML=`<dialog class="api-dialog" id="api-dialog" aria-labelledby="api-dialog-title">
    <form class="api-dialog-form" id="api-dialog-form" novalidate>
      <div class="api-dialog-head">
        <span class="api-dialog-icon" aria-hidden="true">${b("link",17)}</span>
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
          ${b("activity",14)}<span>\u6E2C\u8A66\u9023\u7DDA</span>
        </button>
        <span class="grow"></span>
        <button class="btn btn-ghost btn-sm" type="button" id="api-reset">\u6062\u5FA9\u9810\u8A2D</button>
        <button class="btn btn-primary btn-sm" type="submit" id="api-save">
          ${b("check",14)}<span>\u5132\u5B58\u4E26\u91CD\u65B0\u8F09\u5165</span>
        </button>
      </div>
    </form>
  </dialog>`;let s=t.querySelector("#api-dialog"),a=t.querySelector("#api-dialog-form"),r=t.querySelector("#api-base-input"),i=t.querySelector("#api-dialog-preview"),o=t.querySelector("#api-dialog-status"),l=t.querySelector("#api-dialog-note"),f=t.querySelector("#api-dialog-close"),g=t.querySelector("#api-test"),h=t.querySelector("#api-reset"),m=t.querySelector("#api-save"),w=()=>Je()==="query",M=()=>{let q=Me(r.value);return q||(window.location.protocol==="file:"?Dt:"")},k=(q,C="")=>{o.textContent=q,o.className=`api-dialog-status${C?` is-${C}`:""}`},j=()=>{let q=M(),C=Te();i.innerHTML=`\u76EE\u524D\u751F\u6548\uFF1A<strong>${n(qe(C))}</strong><br />
      \u6B64\u4F4D\u5740\u7684\u72C0\u614B\u8ACB\u6C42\uFF1A${n(ye("/api/status",q))}`},P=()=>{let q=Te(),C=Je();e.classList.toggle("is-custom",!!q),e.title=`\u5F8C\u7AEF API\uFF1A${qe(q)}\uFF08${ia[C]||C}\uFF09`},N=q=>{let C=Je(),ee=`\u76EE\u524D\u4F86\u6E90\uFF1A${ia[C]||C}\u3002\u512A\u5148\u9806\u5E8F\u70BA ?api= \u2192 \u700F\u89BD\u5668\u5132\u5B58\u503C \u2192 config.js \u2192 \u540C\u6E90\u3002`,H="";C==="query"?(H="is-warn",ee="\u6B64\u9801\u7531\u7DB2\u5740\u7684 ?api= \u53C3\u6578\u6307\u5B9A\u5F8C\u7AEF\u4F4D\u5740\uFF0C\u5177\u6709\u6700\u9AD8\u512A\u5148\u9806\u5E8F\u3002\u5132\u5B58\u6216\u6062\u5FA9\u9810\u8A2D\u5728\u6B64\u9801\u4E0D\u6703\u751F\u6548\uFF1B\u8ACB\u5148\u79FB\u9664\u7DB2\u5740\u4E2D\u7684 api \u53C3\u6578\u3002"):q==="hosted"&&zt()?(H="is-warn",ee="\u6B64\u9801\u4E0D\u662F\u5F9E localhost \u958B\u555F\uFF0C\u4E14\u5C1A\u672A\u8A2D\u5B9A\u5F8C\u7AEF API\u3002\u8ACB\u586B\u5165 cloudflared \u7684 https:// \u4F4D\u5740\uFF0C\u6216\u90E8\u7F72\u6642\u5728 config.js \u6307\u5B9A apiBase\uFF1BHTTP \u4F4D\u5740\u6703\u88AB HTTPS \u9801\u9762\u963B\u64CB\u3002"):(C==="file-default"||window.location.protocol==="file:")&&(ee="\u4EE5 file:// \u76F4\u63A5\u958B\u555F\u6642\uFF0C\u9810\u8A2D\u9023\u5230 http://127.0.0.1:9200\u3002\u82E5\u5F8C\u7AEF\u4F7F\u7528\u5176\u4ED6\u9023\u63A5\u57E0\uFF0C\u8ACB\u5728\u6B64\u4FEE\u6539\u4E26\u5132\u5B58\u3002"),l.textContent=ee,l.className=`api-dialog-note${H?` ${H}`:""}`;let ae=C==="query";m.disabled=ae,h.disabled=ae,r.readOnly=ae},_=()=>{if(!Ft(r.value))return k("API \u4F4D\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u8F38\u5165 http:// \u6216 https:// \u958B\u982D\u7684\u7DB2\u5740\u3002","error"),r.focus(),null;let q=M();return Rr(q)?(k("HTTPS \u9801\u9762\u7121\u6CD5\u9023\u7DDA\u5230 HTTP API\uFF08mixed content\uFF09\u3002\u8ACB\u6539\u7528 cloudflared \u63D0\u4F9B\u7684 https:// \u4F4D\u5740\u3002","error"),r.focus(),null):q},S=({reason:q=""}={})=>{s.open||(r.value=Te(),j(),N(q),k("\u53EF\u5148\u6E2C\u8A66\u9023\u7DDA\uFF0C\u5132\u5B58\u5F8C\u9801\u9762\u6703\u91CD\u65B0\u8F09\u5165\u3002"),e.setAttribute("aria-expanded","true"),typeof s.showModal=="function"?s.showModal():s.setAttribute("open",""),r.focus(),r.select())},T=()=>{typeof s.close=="function"?s.close():s.removeAttribute("open"),e.setAttribute("aria-expanded","false"),e.focus()};return e.addEventListener("click",()=>S()),f.addEventListener("click",T),s.addEventListener("close",()=>{e.setAttribute("aria-expanded","false")}),s.addEventListener("click",q=>{q.target===s&&T()}),r.addEventListener("input",()=>{j(),k("\u5C1A\u672A\u6E2C\u8A66\u6B64\u4F4D\u5740\u3002")}),g.addEventListener("click",async()=>{let q=_();if(q!==null){z(g,!0,"\u6E2C\u8A66\u4E2D\u2026"),k(`\u6B63\u5728\u9023\u7DDA\u5230 ${qe(q)}\u2026`);try{let C=await bs(q);k(`\u9023\u7DDA\u6210\u529F \xB7 v${C.version} \xB7 ${C.duration_ms} ms \xB7 GET ${ye("/api/health",q)}`,"ok")}catch(C){k(C.message||"\u9023\u7DDA\u6E2C\u8A66\u5931\u6557\u3002","error")}finally{z(g,!1)}}}),a.addEventListener("submit",q=>{if(q.preventDefault(),w())return;let C=_();C!==null&&(Gt(C),R(`\u5F8C\u7AEF API \u5DF2\u8A2D\u70BA ${qe(C)}\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026`,"ok",1600),window.setTimeout(()=>window.location.reload(),120))}),h.addEventListener("click",()=>{w()||(Gt(""),R("\u5DF2\u6E05\u9664\u700F\u89BD\u5668\u5132\u5B58\u7684 API \u4F4D\u5740\uFF0C\u91CD\u65B0\u8F09\u5165\u4E2D\u2026","info",1600),window.setTimeout(()=>window.location.reload(),120))}),P(),j(),{open:S,updateTrigger:P}}function Br(){document.addEventListener("keydown",e=>{if(e.key!=="/"||e.metaKey||e.ctrlKey||e.altKey)return;let t=document.activeElement;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable)||la()!=="rag")return;let a=document.getElementById("rag-question");a&&(e.preventDefault(),a.focus())})}function oa(){xs();let e=Ir();Pr(),Br(),window.addEventListener("hashchange",us),window.addEventListener("storage",t=>{t.key==="judgment.api_base"&&e.updateTrigger?.()}),ds=window.setInterval(Rt,6e4),us(),Rt(),zt()&&window.setTimeout(()=>e.open({reason:"hosted"}),700)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",oa):oa();window.addEventListener("beforeunload",()=>{ds&&window.clearInterval(ds)});})();
