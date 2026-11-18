    const CENTER=[-31.383,-57.964], DEFAULT_ZOOM=13;
    const CATEGORIES=['Imperdible','Histórico','Cultura','Religioso','Infantil','Deportes','Gastronomía','Música','Feria'];
    const types={place:{color:'#17805a',symbol:'●',label:'Lugar'},cultural:{color:'#7752b5',symbol:'◆',label:'Patrimonio'},event:{color:'#d97706',symbol:'★',label:'Evento'},company:{color:'#2563eb',symbol:'●',label:'Servicio'}};
    const featured=[
      {id:'plaza-artigas',nombre:'Plaza Artigas',tipo:'place',categorias:['Histórico','Imperdible','Infantil'],lat:-31.388763,lng:-57.960618,imagen:'../imagenes/turismo/plaza_artigas_01.jpg.webp',direccion:'Manzana de Uruguay, Artigas, 25 de Agosto y 18 de Julio',resumen:'El corazón cívico de Salto, con monumento ecuestre a José Gervasio Artigas y edificios históricos a su alrededor.',descripcion:'Ideal para iniciar una recorrida por el centro. Sus veredas arboladas, bancos y monumentos la convierten en una parada tranquila entre comercios, cafés y edificios patrimoniales; también funciona para una pausa familiar.',enlace:'lugares.html#plaza-artigas'},
      {id:'costanera-norte',nombre:'Costanera Norte',tipo:'place',categorias:['Deportes','Imperdible','Infantil'],lat:-31.36945,lng:-57.97070,imagen:'../imagenes/eventos/whatsapp-image-2025-03-17-92805-am-1.jpeg',direccion:'Rambla Costanera Norte, Río Uruguay',resumen:'Paseo costero de 2,5 km para caminar, pedalear y mirar el atardecer sobre el Río Uruguay.',descripcion:'El circuito comienza junto al Club Remeros y recorre el Parque Indígena Vaimaca Pirú y la zona del Ayuí. Es una buena opción para actividades al aire libre, fotografía y salidas en familia.',enlace:'lugares.html#costanera-norte'},
      {id:'parque-solari',nombre:'Parque Benito Solari',tipo:'place',categorias:['Histórico','Cultura','Infantil','Deportes'],lat:-31.379470,lng:-57.948920,imagen:'../imagenes/turismo/solari.jpg',direccion:'Av. Blandengues y Enrique Amorim, Salto',resumen:'Gran espacio verde histórico con lago, esculturas, arbolado y áreas para disfrutar al aire libre.',descripcion:'Inaugurado en 1924, este parque de 17 hectáreas combina jardines de inspiración francesa, lago artificial y rincones para pasear. Es apropiado para una visita familiar y para descansar del movimiento del centro.',enlace:'lugares.html#parque-solari'},
      {id:'plaza-33',nombre:'Plaza Treinta y Tres',tipo:'place',categorias:['Histórico','Imperdible','Religioso','Infantil'],lat:-31.387490,lng:-57.970060,imagen:'../imagenes/turismo/plaza.png',direccion:'Uruguay, Artigas, Florencio Sánchez y Juan Carlos Gómez',resumen:'La plaza más antigua de Salto, junto a la iglesia Nuestra Señora del Carmen.',descripcion:'Conocida históricamente como Plaza Vieja, es una parada clave para entender el trazado original de la ciudad. Combina patrimonio, vida barrial y una caminata corta por el centro, apta para recorrer en familia.',enlace:'lugares.html#plaza-33'},
      {id:'hotel-dayman',nombre:'Hotel Daymán',tipo:'place',categorias:['Hospedaje','Imperdible'],lat:-31.43070,lng:-57.92530,direccion:'Avda. Paysandú y Rambla de Circunvalación S/N, Termas del Daymán',resumen:'Alojamiento en la zona de Termas del Daymán.',descripcion:'Punto de referencia para encontrar el alojamiento desde el mapa.',enlace:'turismo.html#alojamientos'},
      {id:'hotel-los-cedros',nombre:'Hotel Los Cedros',tipo:'place',categorias:['Hospedaje','Imperdible'],lat:-31.38520,lng:-57.96010,direccion:'Uruguay 657, 50000 Salto, Departamento de Salto',resumen:'Alojamiento céntrico en la ciudad de Salto.',descripcion:'Punto de referencia para encontrar el alojamiento desde el mapa.',enlace:'turismo.html#alojamientos'},
      {id:'gran-hotel',nombre:'Gran Hotel',tipo:'place',categorias:['Hospedaje','Imperdible'],lat:-31.38390,lng:-57.96320,direccion:'Brasil 891, 50000 Salto, Departamento de Salto',resumen:'Alojamiento en el centro de Salto.',descripcion:'Punto de referencia para encontrar el alojamiento desde el mapa.',enlace:'turismo.html#alojamientos'}
    ];
    const API_BASE=window.SIGTUR_BACKEND_URL||'',LOCAL_MAP_API='api/mapa.php',ROUTING_SERVICES={car:'https://router.project-osrm.org/route/v1/driving/',bike:'https://routing.openstreetmap.de/routed-bike/route/v1/driving/',foot:'https://routing.openstreetmap.de/routed-foot/route/v1/driving/'};
    const themeToggle=document.getElementById('theme-toggle');const applyTheme=dark=>{document.body.classList.toggle('theme-dark',dark);themeToggle.setAttribute('aria-pressed',String(dark));themeToggle.textContent=dark?'Modo claro':'Modo oscuro'};applyTheme(localStorage.getItem('sigtur-theme')==='dark');themeToggle.addEventListener('click',()=>{const dark=!document.body.classList.contains('theme-dark');applyTheme(dark);localStorage.setItem('sigtur-theme',dark?'dark':'light')});
    const map=L.map('map').setView(CENTER,DEFAULT_ZOOM);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,keepBuffer:2,updateWhenZooming:false,attribution:'© OpenStreetMap contributors'}).addTo(map);const layer=L.layerGroup().addTo(map);let resizeFrame=0;const invalidateMapSize=()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>map.invalidateSize({pan:false}))};if('ResizeObserver'in window){const mapResizeObserver=new ResizeObserver(invalidateMapSize);mapResizeObserver.observe(document.querySelector('.map-zone'))}else window.addEventListener('resize',invalidateMapSize,{passive:true});
    const search=document.getElementById('search'),chips=document.getElementById('chips'),results=document.getElementById('results'),detail=document.getElementById('detail'),mapStatus=document.getElementById('map-status'),locateBtn=document.getElementById('locate'),clearBtn=document.getElementById('clear-filters'),routeOrigin=document.getElementById('route-origin'),routeDestination=document.getElementById('route-destination'),routeMode=document.getElementById('route-mode'),avoidTolls=document.getElementById('avoid-tolls'),avoidHighways=document.getElementById('avoid-highways'),routeCalculate=document.getElementById('route-calculate'),routeClear=document.getElementById('route-clear'),routeSummary=document.getElementById('route-summary'),routeSteps=document.getElementById('route-steps'),params=new URLSearchParams(location.search);
    let items=[],selectedId=null,activeCategory=params.get('categoria')||params.get('category')||'',markers=new Map(),markerCache=new Map(),userPos=null,userMarker=null,routeLayer=null,loadError=false,loading=true;
    function debounce(fn,wait){let timer;return(...args)=>{clearTimeout(timer);timer=setTimeout(()=>fn(...args),wait)}}
    function distanceKm(a,b){const R=6371,dLat=(b.lat-a.lat)*Math.PI/180,dLng=(b.lng-a.lng)*Math.PI/180,s=Math.sin(dLat/2)**2+Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2;return R*2*Math.asin(Math.sqrt(s))}
    function setMapStatus(message,type){if(!mapStatus)return;if(!message){mapStatus.hidden=true;return}mapStatus.hidden=false;mapStatus.dataset.type=type||'info';mapStatus.textContent=message}
    function syncUrl(){const next=new URLSearchParams(location.search);activeCategory?next.set('categoria',activeCategory):next.delete('categoria');search.value?next.set('q',search.value):next.delete('q');history.replaceState(null,'',next.toString()?`?${next.toString()}`:location.pathname)}
    const esc=value=>{const el=document.createElement('span');el.textContent=String(value??'');return el.innerHTML};
    const slug=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    const tagKey=value=>({historicos:'historico',religiosos:'religioso',infantiles:'infantil',imperdibles:'imperdible'})[slug(value)]||slug(value);
    const canonicalTag=value=>({historico:'Histórico',cultura:'Cultura',religioso:'Religioso',infantil:'Infantil',imperdible:'Imperdible',deportes:'Deportes',gastronomia:'Gastronomía',musica:'Música',feria:'Feria'})[tagKey(value)]||clean(value);
    const safeUrl=value=>/^(https?:|\/|\.\.?\/)/.test(String(value||'').trim())?String(value).trim():'';
    const clean=value=>new DOMParser().parseFromString(String(value||''),'text/html').body.textContent.replace(/\s+/g,' ').trim();
    const brief=value=>{const text=clean(value);return text.length>155?`${text.slice(0,155)}…`:text};
    function normalizeType(value){const key=slug(value);if(['patrimonio','cultural','heritage'].includes(key))return'cultural';if(['evento','event'].includes(key))return'event';if(['empresa','servicio','company'].includes(key))return'company';return'place'}
    function mediaOf(raw){const first=Array.isArray(raw.media)?raw.media.find(m=>m?.url||m?.src||typeof m==='string'):raw.media;const candidate=raw.imagen||raw.imagen_url||raw.image||raw.image_url||raw.google_image||raw.googleImage||raw.google_photo_url||raw.googlePhotoUrl||raw.foto||raw.thumbnail||first;const url=typeof candidate==='object'?candidate.url||candidate.src:candidate;return safeUrl(url)}
    function normalize(raw){const nombre=clean(raw.nombre||raw.name||raw.titulo||raw.title)||'Punto de interés';const sourceCategories=raw.categorias||raw.categories||raw.category||raw.categoria||[];const categorias=[...new Set((Array.isArray(sourceCategories)?sourceCategories:String(sourceCategories).split(',')).map(canonicalTag).filter(Boolean))];const lat=raw.lat??raw.latitude??raw.latitud,lng=raw.lng??raw.lon??raw.longitude??raw.longitud;return{...raw,id:raw.id||slug(nombre),nombre,tipo:normalizeType(raw.tipo||raw.type),categorias:categorias.length?categorias:['Cultura'],lat:lat==null||String(lat).trim()===''?NaN:Number(lat),lng:lng==null||String(lng).trim()===''?NaN:Number(lng),imagen:mediaOf(raw),direccion:clean(raw.direccion||raw.address||raw.ubicacion),resumen:brief(raw.resumen||raw.descripcion||raw.description)||'Información turística en preparación.',descripcion:clean(raw.descripcion||raw.description||raw.resumen)||'Información turística en preparación.',enlace:safeUrl(raw.enlace||raw.url||raw.link)}}
    const coordenadasValidas=item=>Number.isFinite(item.lat)&&item.lat>=-90&&item.lat<=90&&Number.isFinite(item.lng)&&item.lng>=-180&&item.lng<=180;
    async function solicitarJson(url,timeout=9000){const controller=new AbortController(),temporizador=setTimeout(()=>controller.abort(),timeout);try{const response=await fetch(url,{signal:controller.signal,headers:{Accept:'application/json'}});if(!response.ok)throw new Error(`La solicitud respondió ${response.status}.`);return await response.json()}finally{clearTimeout(temporizador)}}
    function isDuplicate(candidate,collection){return collection.some(current=>slug(current.nombre)===slug(candidate.nombre)||Math.hypot(current.lat-candidate.lat,current.lng-candidate.lng)<.00012)}
    const tagColors={historico:'#7752b5',cultura:'#9a53c9',religioso:'#d68a27',infantil:'#df5b91',imperdible:'#087f72',deportes:'#2378bd',gastronomia:'#d36825',musica:'#b33b80',feria:'#979126'};
    function markerColor(item){const colors=[...new Set(item.categorias.map(tag=>tagColors[tagKey(tag)]).filter(Boolean))].slice(0,4);if(!colors.length)return(types[item.tipo]||types.place).color;if(colors.length===1)return colors[0];const step=100/colors.length;return`conic-gradient(${colors.map((color,index)=>`${color} ${index*step}% ${(index+1)*step}%`).join(',')})`}
    function icon(item){const conf=types[item.tipo]||types.place;const tags=item.categorias.slice(0,3),extra=item.categorias.length-tags.length;return L.divIcon({className:'map-marker-icon',html:`<span class="marker" style="background:${markerColor(item)}"><span>${conf.symbol}</span></span><span class="marker-tags" title="${esc(item.nombre)} · ${esc(item.categorias.join(', '))}">${tags.map(tag=>`<span class="marker-tag tag-${tagKey(tag)}">${esc(tag)}</span>`).join('')}${extra?`<span class="marker-tag">+${extra}</span>`:''}</span>`,iconSize:[160,58],iconAnchor:[14,29]})}
    function filtered(){const query=slug(search.value);let list=items.filter(item=>(!activeCategory||item.categorias.some(category=>tagKey(category)===tagKey(activeCategory)))&&(!query||slug([item.nombre,item.resumen,item.direccion,...item.categorias].join(' ')).includes(query)));if(userPos)list=[...list].sort((a,b)=>distanceKm(userPos,a)-distanceKm(userPos,b));return list}
    function media(item,klass){return item.imagen?`<img class="${klass}" src="${esc(item.imagen)}" alt="${esc(item.nombre)}" loading="lazy" onerror="this.remove()">`:`<div class="${klass} ${klass}-placeholder" aria-hidden="true">${esc(item.nombre[0])}</div>`}
    function distanceLabel(item){if(!userPos||!Number.isFinite(item.lat)||!Number.isFinite(item.lng))return'';const km=distanceKm(userPos,item);return`<span class="result-distance">${km<1?`${Math.round(km*1000)} m`:`${km.toFixed(1)} km`}</span>`}
    function renderChips(){const detected=[...new Set(items.flatMap(item=>item.categorias))],categories=[...CATEGORIES.filter(category=>detected.some(value=>tagKey(value)===tagKey(category))),...detected.filter(category=>!CATEGORIES.some(value=>tagKey(value)===tagKey(category)))];chips.innerHTML=[['','Todo'],...categories.map(category=>[category,category])].map(([category,label])=>`<button class="chip tag-${tagKey(category)}" type="button" data-category="${esc(category)}" aria-pressed="${tagKey(category)===tagKey(activeCategory)}">${esc(label)}</button>`).join('')}
    function renderRouteDestinations(){const points=items.filter(item=>Number.isFinite(item.lat)&&Number.isFinite(item.lng)),originCurrent=routeOrigin.value,destinationCurrent=routeDestination.value;routeOrigin.innerHTML='<option value="user">Mi ubicación</option>'+points.map(item=>`<option value="${esc(item.id)}">${esc(item.nombre)}</option>`).join('');routeDestination.innerHTML='<option value="">Elegí un punto</option>'+points.map(item=>`<option value="${esc(item.id)}">${esc(item.nombre)}</option>`).join('');if(originCurrent==='user'||points.some(item=>item.id===originCurrent))routeOrigin.value=originCurrent;if(points.some(item=>item.id===destinationCurrent))routeDestination.value=destinationCurrent}
    function routeOriginPoint(){if(routeOrigin.value==='user'&&userPos)return userPos;const item=items.find(value=>value.id===routeOrigin.value);return item?{lat:item.lat,lng:item.lng}:null}
    function instruction(step){const maneuver=step.maneuver||{},type=maneuver.type||'continue',modifier=maneuver.modifier?` hacia ${maneuver.modifier}`:'';const names=step.name?` por ${step.name}`:'';const labels={depart:'Salí',arrive:'Llegaste',turn:'Girá',new_name:'Continuá',continue:'Continuá',merge:'Incorporate',on_ramp:'Tomá la entrada',off_ramp:'Tomá la salida',fork:'Mantenete',roundabout:'En la rotonda',end_of_road:'Al final de la calle'};return`${labels[type]||'Continuá'}${modifier}${names}`}
    function decodePolyline6(encoded){let index=0,lat=0,lng=0;const readValue=()=>{let result=0,shift=0,byte;do{if(index>=encoded.length)throw new Error('Geometría de ruta inválida.');byte=encoded.charCodeAt(index++)-63;if(byte<0||byte>63||shift>30)throw new Error('Geometría de ruta inválida.');result|=(byte&0x1f)<<shift;shift+=5}while(byte>=0x20);return result&1?~(result>>1):result>>1};const points=[];while(index<encoded.length){lat+=readValue();lng+=readValue();points.push([lng/1e6,lat/1e6])}if(points.length<2)throw new Error('La ruta no tiene suficientes puntos.');return points}
    async function calculateRoute(){
      const origin=routeOriginPoint(),destination=items.find(item=>item.id===routeDestination.value),mode=routeMode.value;
      if(!origin&&routeOrigin.value==='user'){locateMe();routeSummary.textContent='Buscando tu ubicación. Volvé a calcular la ruta cuando se active.';return}
      if(!origin||!destination){setMapStatus('Elegí un origen y un destino para calcular la ruta.','error');return}
      routeCalculate.disabled=true;routeSummary.textContent='Calculando recorrido…';routeSteps.hidden=true;
      if(routeLayer){map.removeLayer(routeLayer);routeLayer=null}
      try{
        let route;
        if(mode==='car'&&(avoidTolls.checked||avoidHighways.checked)){
          const costingOptions={};
          if(avoidTolls.checked)costingOptions.use_tolls=0;
          if(avoidHighways.checked)costingOptions.use_highways=0;
          const request={locations:[{lat:origin.lat,lon:origin.lng},{lat:destination.lat,lon:destination.lng}],costing:'auto',costing_options:{auto:costingOptions},shape_format:'polyline6',directions_options:{units:'kilometers',language:'es-ES'}};
          const response=await fetch(`https://valhalla1.openstreetmap.de/route?${new URLSearchParams({json:JSON.stringify(request)})}`);
          if(!response.ok)throw new Error(`El servicio de rutas respondió ${response.status}.`);
          const data=await response.json(),trip=data.trip,summary=trip?.summary;
          if(!trip?.legs?.length||!summary)throw new Error('El servicio no devolvió una ruta válida.');
          const coordinates=trip.legs.flatMap(leg=>decodePolyline6(leg.shape)).filter((point,index,array)=>index===0||point[0]!==array[index-1][0]||point[1]!==array[index-1][1]);
          route={geometry:{type:'LineString',coordinates},distance:summary.length*1000,duration:summary.time,hasToll:summary.has_toll,hasHighway:summary.has_highway,legs:trip.legs.map(leg=>({steps:(leg.maneuvers||[]).map(maneuver=>({instruction:maneuver.instruction}))}))};
        }else{
          const params=new URLSearchParams({overview:'full',geometries:'geojson',steps:'true'});
          const response=await fetch(`${ROUTING_SERVICES[mode]}${origin.lng},${origin.lat};${destination.lng},${destination.lat}?${params}`);
          if(!response.ok)throw new Error(`El servicio de rutas respondió ${response.status}.`);
          const data=await response.json();route=data.routes?.[0];
          if(!route)throw new Error('El servicio no devolvió una ruta válida.');
        }
        routeLayer=L.geoJSON(route.geometry,{style:{color:mode==='foot'?'#17805a':mode==='bike'?'#7752b5':'#087f72',weight:6,opacity:.85,dashArray:mode==='foot'?'8 7':mode==='bike'?'3 7':null}}).addTo(map);
        map.fitBounds(routeLayer.getBounds(),{padding:[35,35]});
        const km=(route.distance/1000).toFixed(1),minutes=Math.max(1,Math.round(route.duration/60)),label={car:'auto',bike:'bicicleta',foot:'a pie'}[mode],notes=[];
        if(mode==='car'&&avoidTolls.checked)notes.push(route.hasToll?'incluye peaje (no se pudo evitar)':'sin peajes');
        if(mode==='car'&&avoidHighways.checked)notes.push(route.hasHighway?'incluye autopista (no se pudo evitar)':'sin autopistas');
        routeSummary.textContent=`${km} km · ${minutes} min en ${label}${notes.length?` · ${notes.join(' · ')}`:''}`;
        const steps=(route.legs||[]).flatMap(leg=>leg.steps||[]).map(step=>step.instruction||instruction(step)).filter(Boolean);
        routeSteps.innerHTML=steps.map((step,index)=>`<li>${index+1}. ${esc(step)}</li>`).join('');routeSteps.hidden=!steps.length;
        const missedPreference=(avoidTolls.checked&&route.hasToll)||(avoidHighways.checked&&route.hasHighway);
        setMapStatus(missedPreference?'Ruta calculada, pero no se pudieron evitar todas las opciones seleccionadas.':'Ruta calculada sobre calles reales.',missedPreference?'error':'info');
      }catch(error){
        console.error('No se pudo calcular la ruta:',error);
        routeSummary.textContent='No se pudo calcular la ruta con esas opciones.';
        setMapStatus('El servicio de rutas no respondió o no pudo encontrar un recorrido. Probá otra opción.','error');
      }finally{routeCalculate.disabled=false}
    }
    function clearRoute(){if(routeLayer){map.removeLayer(routeLayer);routeLayer=null}routeSummary.textContent='';routeSteps.innerHTML='';routeSteps.hidden=true}
    function replaceExternalRouteAction(){const link=detail.querySelector('a[href^="https://www.google.com/maps/dir"]');if(!link)return;const button=document.createElement('button');button.type='button';button.className='action';button.textContent='Cómo llegar';button.addEventListener('click',()=>{routeDestination.value=selectedId;routeDestination.closest('.route-panel')?.scrollIntoView({behavior:'smooth',block:'nearest'});routeSummary.textContent='Destino seleccionado. Elegí el medio y calculá la ruta.';routeDestination.focus()});link.replaceWith(button)}
    const detailObserver=new MutationObserver(replaceExternalRouteAction);
    detailObserver.observe(detail,{childList:true,subtree:true});
    const detailLabelsObserver=new MutationObserver(()=>{detail.querySelectorAll('.labels .label:not(button)').forEach(label=>{const button=document.createElement('button');button.type='button';button.className='label';button.dataset.mapCategory=label.textContent.trim();button.textContent=label.textContent;button.title=`Filtrar por ${label.textContent.trim()}`;label.replaceWith(button)})});
    detailLabelsObserver.observe(detail,{childList:true,subtree:true});
    function renderResults(visible){if(loading){results.innerHTML='<div class="results-status">Cargando puntos del mapa…</div>';return}const statusLine=loadError?'No se pudieron cargar los datos en vivo; se muestran lugares destacados.':`${visible.length} ${visible.length===1?'resultado':'resultados'}${userPos?' · ordenado por cercanía':''}`;results.innerHTML=`<div class="results-status">${statusLine}</div>${visible.length?visible.map(item=>`<button class="result ${item.id===selectedId?'active':''}" type="button" data-id="${esc(item.id)}">${media(item,'result-media')}<span><h3>${esc(item.nombre)}</h3><p>${esc(item.resumen)} ${distanceLabel(item)}</p><span class="labels">${item.categorias.map(category=>`<span class="label tag-${tagKey(category)}">${esc(category)}</span>`).join('')}</span></span></button>`).join(''):'<p class="results-status">Nada coincide con tu búsqueda. Probá otro término o categoría.</p>'}`}
    function renderMap(visible){const visibleIds=new Set();visible.forEach(item=>{if(!Number.isFinite(item.lat)||!Number.isFinite(item.lng))return;visibleIds.add(item.id);let marker=markerCache.get(item.id);if(!marker){const conf=types[item.tipo]||types.place;marker=L.marker([item.lat,item.lng],{icon:icon(item),title:`${conf.label}: ${item.nombre}`}).on('click',()=>select(item.id,true));markerCache.set(item.id,marker)}markers.set(item.id,marker);if(!layer.hasLayer(marker))marker.addTo(layer)});for(const[id,marker]of markers){if(!visibleIds.has(id)){layer.removeLayer(marker);markers.delete(id)}}}
    function fitToVisible(visible){const points=visible.filter(item=>Number.isFinite(item.lat)&&Number.isFinite(item.lng)).map(item=>[item.lat,item.lng]);if(userPos)points.push([userPos.lat,userPos.lng]);if(points.length>1)map.fitBounds(points,{padding:[40,40],maxZoom:15})}
    function update(fit=true){const visible=filtered();renderChips();renderResults(visible);renderMap(visible);clearBtn.hidden=!activeCategory&&!search.value&&!userPos;if(selectedId&&!visible.some(item=>item.id===selectedId))closeDetail();if(fit&&!selectedId)fitToVisible(visible);syncUrl();}
    let validatedSessionToken=null;
    const storedSession=()=>{try{return JSON.parse(localStorage.getItem('sigtur-session'))||null}catch{return null}};
    const session=()=>{const current=storedSession(),expiresAt=Number(current?.expiresAt||0),valid=current?.token===validatedSessionToken&&(!expiresAt||expiresAt>Math.floor(Date.now()/1000));return valid?current:current?{...current,usuario:null}:null};
    const interactionType=item=>item.tipo==='event'?'event':item.tipo==='company'?'company':'place';
    async function refreshInteractionSession(){const current=storedSession();if(!current?.refreshToken)return null;try{const response=await fetch(`${API_BASE}/api/auth/refresh`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({refreshToken:current.refreshToken})});const renewed=await response.json().catch(()=>null);if(!response.ok||!renewed?.token||!renewed?.usuario?.id){if(response.status===401){localStorage.removeItem('sigtur-session');validatedSessionToken=null}return null}validatedSessionToken=renewed.token;localStorage.setItem('sigtur-session',JSON.stringify({...current,...renewed,profileValidated:true}));return renewed}catch{return null}}
    async function validateMapSession(){let current=storedSession();if(!current?.token)return;try{let response=await fetch(`${API_BASE}/api/auth/me`,{headers:{Authorization:`Bearer ${current.token}`}});if(response.status===401&&current.refreshToken){const renewed=await refreshInteractionSession();if(renewed){current=storedSession();response=await fetch(`${API_BASE}/api/auth/me`,{headers:{Authorization:`Bearer ${current.token}`}})}}const payload=await response.json().catch(()=>null);if(!response.ok||!payload?.usuario?.id||!payload.usuario.nombre||!payload.usuario.correo){if(response.status===401){localStorage.removeItem('sigtur-session');validatedSessionToken=null}return}validatedSessionToken=current.token;localStorage.setItem('sigtur-session',JSON.stringify({...current,usuario:payload.usuario,profileValidated:true}))}catch{/* Keep cached profile hidden until the server validates it. */}}
    window.addEventListener('storage',event=>{if(event.key!=='sigtur-session')return;validatedSessionToken=null;const refresh=()=>{const selected=items.find(item=>item.id===selectedId);if(selected)loadInteractions(selected)};if(!event.newValue){refresh();return}validateMapSession().finally(refresh)});
    async function interactionFetch(path,options={},retried=false){let current=storedSession();if(current?.expiresAt&&Number(current.expiresAt)<=Math.floor(Date.now()/1000)+30){const renewed=await refreshInteractionSession();if(renewed)current=storedSession()}const token=current?.token,headers={'Content-Type':'application/json',...(options.headers||{})};if(token)headers.Authorization=`Bearer ${token}`;let response;try{response=await fetch(`${API_BASE}${path}`,{...options,headers})}catch{throw new Error('No se pudo conectar al servidor. Intenta nuevamente.')}const payload=await response.json().catch(()=>null);if(response.status===401&&!retried&&current?.refreshToken){const renewed=await refreshInteractionSession();if(renewed)return interactionFetch(path,options,true)}if(!response.ok){if(response.status===401){localStorage.removeItem('sigtur-session');validatedSessionToken=null}throw Object.assign(new Error(payload?.error||'No se pudo completar la operacion.'),{status:response.status})}return payload}
    window.sigturInteractionFetch=interactionFetch;
    function interactionKey(item){return new URLSearchParams({entidad_tipo:interactionType(item),entidad_id:String(item.id)}).toString()}
    async function loadInteractions(item){
      const status=detail.querySelector('[data-interaction-status]');
      if(!status)return;
      status.textContent='Cargando actividad…';
      try{
        const [state,commentsResult]=await Promise.all([interactionFetch(`/api/likes/estado?${interactionKey(item)}`),interactionFetch(`/api/comentarios?${interactionKey(item)}`)]);
        const comments=await Promise.all((commentsResult.data||[]).map(async comment=>{try{return{...comment,likeState:await interactionFetch(`/api/comentarios/${comment.id}/likes`)}}catch{return{...comment,likeState:{liked:false,likes:0}}}}));
        const likeButton=detail.querySelector('[data-like]'),saveButton=detail.querySelector('[data-save]');
        if(likeButton){likeButton.classList.toggle('active',Boolean(state.liked));likeButton.setAttribute('aria-pressed',String(Boolean(state.liked)));likeButton.textContent=`${state.liked?'♥':'♡'} Me gusta (${state.likes})`}
        if(saveButton){saveButton.classList.toggle('active',Boolean(state.saved));saveButton.setAttribute('aria-pressed',String(Boolean(state.saved)));saveButton.textContent=state.saved?'🔖 Guardado':'🔖 Guardar'}
        renderMapComments(comments);
        status.textContent='';
      }catch(error){status.textContent=error.message||'No se pudo cargar la actividad.'}
    }
    function commentAuthor(comment){return[comment.autor?.nombre,comment.autor?.apellido].filter(Boolean).join(' ')||'Explorador'}
    function commentAvatar(comment){const name=commentAuthor(comment),initials=name.split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase()||'?';return`<span class="comment-avatar">${comment.autor?.avatar_url?`<img src="${esc(comment.autor.avatar_url)}" alt="" onerror="this.remove()" loading="lazy" decoding="async">`:''}<span>${esc(initials)}</span></span>`}
    function renderMapComments(comments) {
      const list = detail.querySelector('[data-comment-list]');
      if (!list) return;
      const order = detail.querySelector('[data-comment-order][aria-pressed="true"]')?.dataset.commentOrder || 'newest';
      const byParent = new Map();
      comments.forEach(comment => {
        const key = comment.parent_id || 'root';
        byParent.set(key, [...(byParent.get(key) || []), comment]);
      });
      const sort = entries => [...entries].sort((a, b) => {
        if (Boolean(a.fijado) !== Boolean(b.fijado)) return a.fijado ? -1 : 1;
        return order === 'oldest'
          ? new Date(a.created_at) - new Date(b.created_at)
          : new Date(b.created_at) - new Date(a.created_at);
      });
      const renderComment = comment => {
        const replies = sort(byParent.get(comment.id) || []);
        const content = comment.contenido ? `<p>${esc(comment.contenido)}</p>` : '';
        const media = window.sigturCommentMediaMarkup?.(comment.media_urls) || '';
        const admin = session()?.usuario?.rol === 'admin', own = session()?.usuario?.id === comment.usuario_id, likes=comment.likeState||{liked:false,likes:0};
        return `<article class="comment-item ${comment.fijado ? 'is-pinned' : ''}" data-comment-id="${esc(comment.id)}" data-comment-user="${esc(comment.usuario_id)}"><div class="comment-meta"><span class="comment-author">${commentAvatar(comment)}<span><strong>${esc(commentAuthor(comment))}</strong><small>${comment.autor?.rol === 'admin' ? 'Administrador' : 'Explorador'}${comment.fijado ? ' · 📌 Fijado' : ''}</small></span></span><time>${new Date(comment.created_at).toLocaleDateString('es-UY')}</time></div>${content}${media}<div class="comment-actions"><button type="button" data-comment-like aria-pressed="${likes.liked}">${likes.liked?'♥':'♡'} Me gusta (${likes.likes})</button><button type="button" data-comment-reply>↩ Responder</button><button type="button" data-comment-message>✉ Mensaje</button><button type="button" data-report>Reportar</button>${own?'<button type="button" data-edit-comment>Editar</button><button type="button" data-delete-own>Eliminar</button>':''}${admin&&!own?'<button type="button" data-admin-delete>Eliminar</button>':''}</div><div class="comment-reply-form" hidden><textarea rows="2" maxlength="2000" placeholder="Responder a ${esc(commentAuthor(comment))}..."></textarea><button class="interaction-button" type="button" data-submit-reply>Publicar</button></div>${replies.length ? `<div class="comment-replies"><span>${replies.length} ${replies.length === 1 ? 'respuesta' : 'respuestas'}</span>${replies.map(renderComment).join('')}</div>` : ''}</article>`;
      };
      const roots = sort(byParent.get('root') || []);
      list.innerHTML = roots.length ? roots.map(renderComment).join('') : '<p class="comment-status">Todavía no hay comentarios.</p>';
    }
    function renderInteractions() {
      return `<section class="interaction-box" data-interactions><div class="interaction-actions"><button class="interaction-button" type="button" data-like>♥ Me gusta</button><button class="interaction-button" type="button" data-save>🔖 Guardar</button></div><div class="comment-filter" role="group" aria-label="Ordenar comentarios"><button type="button" data-comment-order="newest" aria-pressed="true">Recientes</button><button type="button" data-comment-order="oldest" aria-pressed="false">Antiguos</button></div><p class="comment-status" data-interaction-status>Consultando actividad…</p><div class="comment-list" data-comment-list></div><form class="comment-form" data-comment-form data-comment-media-form><textarea name="contenido" rows="2" maxlength="2000" placeholder="Compartí tu experiencia o adjuntá una imagen..."></textarea><button class="interaction-button" type="submit">Publicar</button></form></section>`
    }
    function select(id,move=false){const item=items.find(value=>value.id===id);if(!item)return;selectedId=item.id;const marker=markers.get(item.id);if(move)map.flyTo([item.lat,item.lng],16,{duration:.65});setMapStatus('');const mapUrl=`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${item.lat},${item.lng}`)}`;detail.innerHTML=`${media(item,'detail-media')}<div class="detail-body"><button class="detail-close" type="button" aria-label="Cerrar ficha">×</button><h2>${esc(item.nombre)}</h2><div class="labels">${item.categorias.map(category=>`<button type="button" class="label tag-${tagKey(category)}" data-map-category="${esc(category)}" title="Filtrar por ${esc(category)}">${esc(category)}</button>`).join('')}</div><p class="detail-summary">${esc(item.resumen)}</p><p class="detail-more" hidden>${esc(item.descripcion)}</p>${item.direccion?`<p class="detail-summary">📍 ${esc(item.direccion)}</p>`:''}<div class="detail-actions"><button class="action primary" type="button" data-more>Mostrar más</button><a class="action" href="${mapUrl}" target="_blank" rel="noopener">Cómo llegar</a>${item.enlace?`<a class="action" href="${esc(item.enlace)}">Ver ficha</a>`:''}</div>${renderInteractions()}</div>`;detail.hidden=false;renderResults(filtered());if(marker)marker.setZIndexOffset(1000);loadInteractions(item)}
    function closeDetail(){selectedId=null;detail.hidden=true;renderResults(filtered())}
    async function cultural(){try{const response=await fetch('../kml/mapa_bienes_culturales_salto_uruguay.kml');if(!response.ok)throw Error();const xml=new DOMParser().parseFromString(await response.text(),'application/xml');return[...xml.querySelectorAll('Placemark')].map(mark=>{const coords=mark.querySelector('Point coordinates')?.textContent?.trim().split(/\s+/)[0].split(',')||[];const folder=mark.parentElement?.querySelector(':scope > name')?.textContent||'Patrimonio cultural';return normalize({nombre:mark.querySelector('name')?.textContent,descripcion:`Bien de ${folder} incluido en el mapa cultural de Salto.`,categoria:['Histórico','Cultura'],tipo:'patrimonio',lng:coords[0],lat:coords[1]})}).filter(item=>Number.isFinite(item.lat)&&Number.isFinite(item.lng))}catch{return[]}}
    async function load(){let api=[];loading=true;renderResults([]);const heritagePromise=cultural();const candidatos=[`${API_BASE}/api/mapa`,`${API_BASE}/mapa`,LOCAL_MAP_API].filter((url,index,array)=>array.indexOf(url)===index);loadError=true;for(const url of candidatos){try{const payload=await solicitarJson(url);const records=Array.isArray(payload)?payload:payload?.data||payload?.datos||payload?.puntos||[];if(!Array.isArray(records))throw new Error('La respuesta del mapa no tiene un formato válido.');const puntos=records.map(normalize).filter(coordenadasValidas);if(records.length&&!puntos.length)throw new Error('La respuesta no contiene coordenadas válidas.');api=puntos;loadError=false;break}catch(error){console.warn(`No se pudieron cargar los puntos desde ${url}:`,error)}}
      items=[...featured.map(normalize)];api.forEach(item=>{if(!isDuplicate(item,items))items.push(item)});(await heritagePromise).forEach(item=>{if(!isDuplicate(item,items))items.push(item)});
      loading=false;
      const focus=slug(params.get('focus'));const initialQuery=params.get('q');if(initialQuery)search.value=initialQuery;
      const target=items.find(item=>slug(item.id)===focus||slug(item.nombre)===focus);
      renderRouteDestinations();update(!target);
      if(target)select(target.id,true);
      if(loadError)setMapStatus('No se pudo conectar con el servidor de datos. Mostrando lugares destacados y patrimonio local.','error');
    }
    function locateMe(){
      if(!navigator.geolocation){setMapStatus('Tu navegador no soporta geolocalización.','error');return}
      locateBtn.disabled=true;locateBtn.textContent='Buscando ubicación…';
      navigator.geolocation.getCurrentPosition(position=>{
        userPos={lat:position.coords.latitude,lng:position.coords.longitude};
        if(!userMarker){userMarker=L.marker([userPos.lat,userPos.lng],{icon:L.divIcon({className:'',html:'<span class="user-marker"></span>',iconSize:[18,18],iconAnchor:[9,9]}),title:'Tu ubicación',zIndexOffset:2000}).addTo(map)}
        else userMarker.setLatLng([userPos.lat,userPos.lng]);
        locateBtn.disabled=false;locateBtn.textContent='📍 Ubicación activa';locateBtn.setAttribute('aria-pressed','true');
        setMapStatus('Ordenando resultados por cercanía a tu ubicación.','info');
        update();
      },()=>{
        locateBtn.disabled=false;locateBtn.textContent='📍 Usar mi ubicación';
        setMapStatus('No pudimos acceder a tu ubicación. Revisá los permisos del navegador.','error');
      },{enableHighAccuracy:true,timeout:8000});
    }
    function clearAll(){
      search.value='';activeCategory='';
      if(userPos){userPos=null;locateBtn.textContent='📍 Usar mi ubicación';locateBtn.removeAttribute('aria-pressed');if(userMarker){map.removeLayer(userMarker);userMarker=null}}
      closeDetail();update();
    }
    search.addEventListener('input',debounce(()=>update(false),180));
    chips.addEventListener('click',event=>{const button=event.target.closest('[data-category]');if(!button)return;activeCategory=button.dataset.category;update()});
    results.addEventListener('click',event=>{const button=event.target.closest('[data-id]');if(button)select(button.dataset.id,true)});
    detail.addEventListener('click',async event=>{const comment=event.target.closest('[data-comment-id]'),item=items.find(value=>value.id===selectedId);if(!comment||!item)return;try{if(event.target.closest('[data-edit-comment]')){const current=(await interactionFetch(`/api/comentarios?${interactionKey(item)}`)).data.find(entry=>entry.id===comment.dataset.commentId)?.contenido||'',contenido=prompt('Editá tu comentario:',current);if(contenido===null||!contenido.trim())return;await interactionFetch(`/api/comentarios/${comment.dataset.commentId}`,{method:'PATCH',body:JSON.stringify({contenido})});await loadInteractions(item);return}if(event.target.closest('[data-delete-own]')){if(!confirm('¿Eliminar tu comentario y sus respuestas?'))return;await interactionFetch(`/api/comentarios/${comment.dataset.commentId}`,{method:'DELETE'});await loadInteractions(item);return}if(event.target.closest('[data-comment-reply]')){if(!session()?.token){window.location.href='login.html';return}comment.querySelector('.comment-reply-form').hidden=false;return}if(event.target.closest('[data-submit-reply]')){const contenido=comment.querySelector('textarea').value;if(!contenido.trim())return;await interactionFetch(`/api/comentarios/${comment.dataset.commentId}/respuestas`,{method:'POST',body:JSON.stringify({contenido})});await loadInteractions(item);return}if(event.target.closest('[data-comment-like]')){if(!session()?.token){window.location.href='login.html';return}const state=await interactionFetch(`/api/comentarios/${comment.dataset.commentId}/likes`);await interactionFetch(`/api/comentarios/${comment.dataset.commentId}/likes`,{method:'POST',body:JSON.stringify({activo:!state.liked})});await loadInteractions(item)}}catch(error){detail.querySelector('[data-interaction-status]').textContent=error.message||'No se pudo completar la acción.'}});
    detail.addEventListener('click',async event=>{if(event.target.closest('.detail-close'))closeDetail();if(event.target.closest('[data-more]')){const more=detail.querySelector('.detail-more'),button=event.target.closest('[data-more]');more.hidden=!more.hidden;button.textContent=more.hidden?'Mostrar más':'Mostrar menos'}const item=items.find(value=>value.id===selectedId);if(!item)return;const filterButton=event.target.closest('[data-map-comment-filter]');if(filterButton){detail.querySelectorAll('[data-map-comment-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button===filterButton)));detail.querySelector('[data-comment-list]').dataset.filter=filterButton.dataset.mapCommentFilter;await loadInteractions(item);return}if(event.target.closest('[data-admin-delete]')){const comment=event.target.closest('[data-comment-id]');if(!confirm('¿Eliminar este comentario?'))return;try{await interactionFetch(`/api/admin/comentarios/${comment.dataset.commentId}`,{method:'DELETE'});await loadInteractions(item)}catch(error){detail.querySelector('[data-interaction-status]').textContent=error.message}return}if(event.target.closest('[data-like],[data-save]')){if(!session()?.token){window.location.href='login.html';return}const button=event.target.closest('[data-like],[data-save]'),saved=button.hasAttribute('data-save'),active=!button.classList.contains('active');try{await interactionFetch(`/api/${saved?'guardados':'likes'}`,{method:'POST',body:JSON.stringify({entidad_tipo:interactionType(item),entidad_id:String(item.id),activo:active,...(saved?{metadata:{nombre:item.nombre,direccion:item.direccion,categorias:item.categorias,enlace:item.enlace,imagen:item.imagen}}:{})})});await loadInteractions(item)}catch(error){detail.querySelector('[data-interaction-status]').textContent=error.message}}if(event.target.closest('[data-report]')){if(!session()?.token){window.location.href='login.html';return}const comment=event.target.closest('[data-comment-id]'),motivo=prompt('Motivo del reporte:');if(!motivo)return;try{await interactionFetch(`/api/comentarios/${comment.dataset.commentId}/reportar`,{method:'POST',body:JSON.stringify({motivo})});comment.querySelector('[data-report]').textContent='Reportado'}catch(error){detail.querySelector('[data-interaction-status]').textContent=error.message}}});
    detail.addEventListener('submit', async event => {
      if (!event.target.matches('[data-comment-form]')) return;
      event.preventDefault();
      if (!session()?.token) { window.location.href = 'login.html'; return; }
      const form = event.target;
      const item = items.find(value => value.id === selectedId);
      const contenido = new FormData(form).get('contenido');
      try {
        const media_paths = await window.sigturPrepareCommentMedia(form);
        if (!String(contenido || '').trim() && !media_paths.length) throw Error('Escribí un comentario o adjuntá una imagen.');
        await interactionFetch('/api/comentarios', {
          method: 'POST',
          body: JSON.stringify({ entidad_tipo: interactionType(item), entidad_id: String(item.id), contenido, media_paths }),
        });
        form.reset();
        window.sigturClearCommentMedia(form);
        await loadInteractions(item);
      } catch (error) {
        detail.querySelector('[data-interaction-status]').textContent = error.message;
      }
    });
    detail.addEventListener('click',event=>{
      const category=event.target.closest('[data-map-category]');
      if(!category)return;
      activeCategory=category.dataset.mapCategory;search.value='';closeDetail();update();
    });
    function syncRouteOptions(){const isCar=routeMode.value==='car';avoidTolls.disabled=!isCar;avoidHighways.disabled=!isCar}
    locateBtn.addEventListener('click',locateMe);
    clearBtn.addEventListener('click',clearAll);
    routeCalculate.addEventListener('click',calculateRoute);
    routeClear.addEventListener('click',clearRoute);
    routeOrigin.addEventListener('change',()=>{if(routeOrigin.value==='user'&&!userPos)locateMe()});
    routeMode.addEventListener('change',syncRouteOptions);
    syncRouteOptions();
    load();
    validateMapSession().then(()=>{const selected=items.find(item=>item.id===selectedId);if(selected)loadInteractions(selected)});
