/* ============================================================
   FURA HANDBÓK — frumgerð (prototype)
   ------------------------------------------------------------
   Sýnishorn til að prófa flæðið og útlitið. Gögn vistast á
   þessu tæki (localStorage). Næsta skref: tengja við Supabase
   svo allir deili sömu handbók á netinu.

   BYGGING: allt er "hnútur" (node). Hnútur getur innihaldið
   aðra hnúta (vél inni í vél / hlutar) — eins djúpt og þarf.
   Hver hnútur hefur líka sínar eigin myndir, bilanaleit og
   varahluti.

   Kóðar og gögn eru geymd í Supabase (sjá supabase-setup.sql).
   ============================================================ */

/* ============================================================
   Sýnishorn af gögnum (verður sótt úr Supabase síðar)
   ============================================================ */
const SEED = {
  tree: [
    {
      id:'taetarinn', name:'Tætarinn', photo:'',
      summary:'Stór tætari sem rífur brotamálm niður í smáa bita.',
      children:[
        { id:'taetari-motor', name:'Mótor og drif', photo:'',
          summary:'Aflið á bak við tætarann.',
          children:[],
          angles:[ {id:'a1',photo:'',label:'Beltin',text:'Athugaðu beltaspennu vikulega — of laus belti renna og slitna.'} ],
          troubleshooting:[ {id:'t1',problem:'Mótor fer í gang en haus snýst ekki',fix:'Líklega slitið/brotið belti. Stöðvaðu og yfirfaraðu beltin.'} ],
          parts:[ {id:'p1',name:'Drifbelti',supplier:'Vélaver',partno:'',url:'',note:'Mældu breidd og lengd áður en þú pantar.'} ],
          notes:'' },
        { id:'taetari-haus', name:'Tætarahaus (hnífar)', photo:'',
          summary:'Hnífarnir sem rífa málminn.',
          children:[],
          angles:[ {id:'a1',photo:'',label:'Hnífar að ofan',text:'Slökktu ALLTAF og læstu (lockout) áður en þú opnar hausinn.'} ],
          troubleshooting:[],
          parts:[ {id:'p1',name:'Tætarahnífar / tennur',supplier:'',partno:'',url:'',note:'Slitna með tíma — gott að eiga varahníf á lager.'} ],
          notes:'' }
      ],
      angles:[
        { id:'a1', photo:'', label:'Framan / stjórnborð', text:'Hér er ræst og stöðvað. Rauði takkinn er neyðarstopp — slær allt af strax.' },
        { id:'a2', photo:'', label:'Innmötun (færiband)', text:'Málmurinn fer hér inn. Aldrei standa beint fyrir framan opið þegar vélin gengur — efni getur kastast út.' }
      ],
      troubleshooting:[
        { id:'t1', problem:'Fer ekki í gang', fix:'Athugaðu neyðarstopp (snúðu rauða takkanum réttsælis) og aðalrofa á vegg. Athugaðu líka hvort hlíf/lúga sé almennilega lokuð (öryggisrofi).' },
        { id:'t2', problem:'Stíflast / stöðvast undir álagi', fix:'Of mikið efni í einu. Bakkaðu (reverse) ef hægt er, og hreinsaðu opið með vélina stöðvaða og læsta.' }
      ],
      parts:[],
      notes:'Hreinsaðu svæðið eftir hverja vakt. Yfirfaraðu hnífa og beltaspennu vikulega. Aldrei opna meðan vélin er í gangi.'
    },
    {
      id:'furuflis', name:'Furuflís', photo:'',
      summary:'Stór salur með mörgum vélum.',
      children:[
        {
          id:'pressa', name:'Málmpressa', photo:'',
          summary:'Pressar lausan málm í þétta bagga fyrir flutning.',
          children:[],
          angles:[
            { id:'a1', photo:'', label:'Framan frá', text:'Stjórnborðið er hér. Græni takkinn ræsir, rauði stöðvar strax (neyðarstopp).' },
            { id:'a2', photo:'', label:'Hleðsluop', text:'Settu málminn hér inn. Aldrei setja hendur inn fyrir gula strikið þegar vélin er í gangi.' },
            { id:'a3', photo:'', label:'Vökvakerfi (aftan)', text:'Olíustaðan á að vera milli merkjanna. Athugaðu fyrir hverja vakt.' }
          ],
          troubleshooting:[
            { id:'t1', problem:'Vélin fer ekki í gang', fix:'Athugaðu hvort neyðarstoppið sé úti (snúðu rauða takkanum réttsælis). Athugaðu líka aðalrofa á vegg.' },
            { id:'t2', problem:'Pressan er kraftlaus / hæg', fix:'Líklega lág olíustaða eða loft í kerfinu. Athugaðu olíu aftan á vélinni og láttu vita ef hún er lág.' }
          ],
          parts:[
            { id:'p1', name:'Vökvaolía (ISO 46)', supplier:'Olís', partno:'', url:'', note:'Algeng olía, til á lager hjá flestum.' },
            { id:'p2', name:'Þéttisett í tjakk', supplier:'Vélaver', partno:'TS-220', url:'', note:'Pantast, getur tekið nokkra daga.' }
          ],
          notes:'Hreinsaðu málmafganga úr hleðsluopi í lok hverrar vaktar. Smyrjið liði vikulega.'
        },
        { id:'klippa', name:'Málmklippa (skæri)', photo:'', summary:'Klippir langt járn og prófíla niður í hæfilega búta.',
          children:[], angles:[], troubleshooting:[], parts:[], notes:'' }
      ],
      angles:[], troubleshooting:[], parts:[], notes:''
    },
    {
      id:'skemman', name:'Skemman', photo:'',
      summary:'Skemman / geymslan.',
      children:[
        { id:'lyftari', name:'Lyftari', photo:'', summary:'Notaður til að færa bagga og efni um svæðið.',
          children:[], angles:[], troubleshooting:[], parts:[], notes:'' }
      ],
      angles:[], troubleshooting:[], parts:[], notes:''
    }
  ]
};

/* ============================================================
   Geymsla (localStorage)
   ============================================================ */
const SUPA = window.FURA_SUPABASE || {};
const db = (window.supabase && SUPA.url) ? window.supabase.createClient(SUPA.url, SUPA.key) : null;

const CACHE_KEY  = 'fura_handbok_cache_v1';   // afrit af handbók (hraði + ónettengt lestur)
const UNLOCK_KEY = 'fura_handbok_unlock_v1';  // { role, code }

let DATA = { tree: [] };
let MODE = 'locked';      // locked | view | edit
let UNLOCK_CODE = null;   // kóðinn sem var sleginn inn (notaður við vistun)

function normalize(d){
  d = d || {tree:[]};
  if(!Array.isArray(d.tree)) d.tree = [];
  if(!Array.isArray(d.people)) d.people = [];   // vistuð tengiliðaskrá (ein manneskja = eitt spjald)
  migrateContacts(d.tree, d.people);
  return d;
}
// Færir gamla tengiliði ({name,phone,note} beint á tæki) yfir í nýja sniðið:
// sameiginleg manneskja í d.people + tilvísun {personId, help} á tækinu.
function migrateContacts(nodes, people){
  for(const n of nodes){
    if(Array.isArray(n.contacts)){
      n.contacts = n.contacts.map(c=>{
        if(!c) return null;
        if(c.personId) return { id:c.id||uid(), personId:c.personId, help:c.help||'' }; // þegar nýtt snið
        const name=(c.name||'').trim(), phone=(c.phone||'').trim(), note=(c.note||'').trim();
        if(!name && !phone && !note) return null;                                        // tómt -> sleppa
        let person = name && people.find(p=>(p.name||'').trim().toLowerCase()===name.toLowerCase());
        if(!person){ person={ id:uid(), name, phone, about:'' }; people.push(person); }
        else if(!person.phone && phone){ person.phone = phone; }
        return { id:uid(), personId:person.id, help:note };                              // gamla "note" = hjálp á þessu tæki
      }).filter(Boolean);
    } else n.contacts = [];
    if(Array.isArray(n.children) && n.children.length) migrateContacts(n.children, people);
  }
}
function getPerson(id){ return (DATA.people||[]).find(p=>p.id===id); }
function cacheData(){ try{ localStorage.setItem(CACHE_KEY, JSON.stringify(DATA)); }catch(e){} }
function loadCache(){ try{ const r = localStorage.getItem(CACHE_KEY); if(r) return JSON.parse(r); }catch(e){} return null; }

/* ============================================================
   VIÐHALD — verkefni, "lokið"-staða, auðkenni
   ============================================================ */
let COMPLETIONS = {};                 // { taskId: {at, by} } — sótt úr Supabase
const ME_KEY = 'fura_me_v1';          // hver ég er (personId) — bara á þessu tæki

// hver er ég? (bara fyrir "Mitt viðhald" og "búið af hverjum" — læsir engu)
function getMe(){ try{ const id=localStorage.getItem(ME_KEY); return id ? getPerson(id) : null; }catch(e){ return null; } }
function setMe(id){ try{ id ? localStorage.setItem(ME_KEY, id) : localStorage.removeItem(ME_KEY); }catch(e){} }

// sækja/uppfæra "lokið"-stöðu (báðir kóðar mega)
async function fetchMaintenance(code){
  if(!db) return {};
  const { data, error } = await db.rpc('get_maintenance', { p_code: code });
  if(error) throw error;
  return data || {};
}
async function completeTask(taskId){
  const by = (getMe() && getMe().name) || '';
  COMPLETIONS[taskId] = { at:new Date().toISOString(), by };   // bjartsýn uppfærsla (strax)
  if(!db || !UNLOCK_CODE) return;
  try{
    const { data, error } = await db.rpc('complete_task', { p_code:UNLOCK_CODE, p_task_id:taskId, p_by:by });
    if(error) throw error;
    if(data) COMPLETIONS = data;
  }catch(e){ toast('Vistun mistókst — er búið að keyra viðhalds-SQL?'); }
}
async function uncompleteTask(taskId){
  delete COMPLETIONS[taskId];
  if(!db || !UNLOCK_CODE) return;
  try{ const { data, error } = await db.rpc('uncomplete_task', { p_code:UNLOCK_CODE, p_task_id:taskId }); if(error) throw error; if(data!=null) COMPLETIONS = data; }
  catch(e){ toast('Tókst ekki að afturkalla'); }
}

// tíðni verkefnis í dögum (null = einskiptis)
function taskIntervalDays(t){
  if(t.freqType==='weekly')  return 7;
  if(t.freqType==='monthly') return 30;
  if(t.freqType==='days')    return Math.max(1, parseInt(t.freqValue,10)||1);
  return null;
}
function fmtDate(d){ try{ return new Date(d+'T00:00:00').toLocaleDateString('is-IS',{day:'numeric',month:'short'}); }catch(e){ return d||''; } }

// staða verkefnis: {state:'ok'|'soon'|'overdue'|'done', text}
function taskStatus(t){
  const comp = COMPLETIONS[t.id];
  const DAY = 86400000, now = Date.now();
  if(t.freqType==='once'){
    if(comp) return { state:'done', text:'Lokið ✓' };
    if(!t.dueDate) return { state:'soon', text:'Ódagsett' };
    const days = Math.ceil((new Date(t.dueDate+'T00:00:00').getTime() - now)/DAY);
    if(days < 0)  return { state:'overdue', text:`${-days} d. fram yfir` };
    if(days <= 3) return { state:'soon', text: days===0?'Í dag':`Eftir ${days} d.` };
    return { state:'ok', text:`Fyrir ${fmtDate(t.dueDate)}` };
  }
  const iv = taskIntervalDays(t);
  if(!comp) return { state:'overdue', text:'Aldrei gert' };
  const days = Math.ceil((new Date(comp.at).getTime() + iv*DAY - now)/DAY);
  if(days < 0)  return { state:'overdue', text:`${-days} d. fram yfir` };
  if(days <= 1) return { state:'soon', text: days<=0?'Á tíma':'Á morgun' };
  return { state:'ok', text:`Eftir ${days} d.` };
}
const taskOutstanding = (t)=> taskStatus(t).state === 'overdue';

// hefur þessi hnútur (eða eitthvað inni í honum) verkefni sem er fram yfir?
function nodeHasOutstanding(n){
  if((n.maintenance||[]).some(taskOutstanding)) return true;
  return (n.children||[]).some(nodeHasOutstanding);
}
// öll verkefni með hnút + slóð (fyrir "Mitt viðhald")
function allTasks(nodes=DATA.tree, path=[]){
  let out=[];
  for(const n of nodes){
    const p=[...path,n.id];
    (n.maintenance||[]).forEach(t=> out.push({ task:t, node:n, path:p }));
    if(n.children&&n.children.length) out = out.concat(allTasks(n.children, p));
  }
  return out;
}
function tidyName(t){ return (t||'').trim(); }

async function fetchHandbook(code){
  const { data, error } = await db.rpc('get_handbook', { p_code: code });
  if(error) throw error;
  return data; // null ef rangur kóði, annars { role, data }
}

async function saveData(){
  cacheData();                                       // strax staðbundið (öryggi + hraði)
  if(MODE !== 'edit' || !UNLOCK_CODE || !db) return;
  try{
    const { error } = await db.rpc('save_handbook', { p_code: UNLOCK_CODE, p_data: DATA });
    if(error) throw error;
  }catch(e){ toast('Vistun mistókst — engin nettenging?'); }
}

/* ============================================================
   Hjálparföll
   ============================================================ */
const $ = (sel, el=document) => el.querySelector(sel);
const app = $('#app');
const uid = () => Math.random().toString(36).slice(2,9);
const esc = (s) => (s||'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function nl2br(s){ return esc(s).replace(/\n/g,'<br>'); }
function linkify(s){ return nl2br(s).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>'); }
const isEdit = () => MODE === 'edit';

function emptyNode(name){
  return { id:uid(), name:(name||'').trim(), photo:'', summary:'', children:[], notes:'', contacts:[], supplies:[], maintenance:[] };
}

function toast(msg){
  let t = $('.toast');
  if(!t){ t = document.createElement('div'); t.className='toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._t); t._t = setTimeout(()=>t.classList.remove('show'), 1600);
}

// velur skrá úr síma/tölvu (myndavél, myndasafn, Google Drive, iCloud, Files …)
// EKKI setja `capture` — það þvingar myndavélina og felur hina valkostina.
function pickFile(){
  return new Promise((resolve)=>{
    const inp = document.createElement('input');
    inp.type='file'; inp.accept='image/*';
    inp.onchange = () => resolve(inp.files && inp.files[0] ? inp.files[0] : null);
    inp.click();
  });
}
// minnkar mynd í litla JPEG (Blob)
function compressToBlob(file, maxDim=1600, quality=0.8){
  return new Promise((resolve, reject)=>{
    const img = new Image();
    img.onload = () => {
      let {width:w, height:h} = img;
      if(w > maxDim || h > maxDim){
        if(w >= h){ h = Math.round(h*maxDim/w); w = maxDim; }
        else { w = Math.round(w*maxDim/h); h = maxDim; }
      }
      const c = document.createElement('canvas'); c.width=w; c.height=h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      c.toBlob(b => b ? resolve(b) : reject(new Error('blob')), 'image/jpeg', quality);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
// minnkar og hleður upp í Supabase, skilar opinberri vefslóð
async function uploadPhoto(file){
  const blob = await compressToBlob(file);
  const name = `${Date.now()}-${Math.random().toString(36).slice(2,8)}.jpg`;
  const { error } = await db.storage.from('photos').upload(name, blob, { contentType:'image/jpeg', upsert:false });
  if(error) throw error;
  return db.storage.from('photos').getPublicUrl(name).data.publicUrl;
}
// velur -> hleður upp -> skilar vefslóð (eða null)
async function pickAndUpload(){
  const file = await pickFile();
  if(!file) return null;
  if(!db){ toast('Engin nettenging'); return null; }
  toast('Hleð upp mynd…');
  try{ const url = await uploadPhoto(file); toast('Mynd komin ✓'); return url; }
  catch(e){ toast('Tókst ekki að hlaða upp mynd'); return null; }
}

function photoBlock(src, cls, phIcon='▲'){
  if(src) return `<div class="${cls}"><img src="${src}" alt="" loading="lazy" decoding="async"></div>`;
  return `<div class="${cls}"><div class="card__ph">${phIcon}</div></div>`;
}

/* ============================================================
   Tré-hjálparföll
   ============================================================ */
// finnur hnút eftir slóð af id-um. skilar {node, chain, parentArr}
function resolve(path){
  let arr = DATA.tree, node = null; const chain = [];
  for(const id of path){
    const found = (arr||[]).find(n => n.id === id);
    if(!found) return null;
    node = found; chain.push(found); arr = found.children || (found.children = []);
  }
  let parentArr = DATA.tree;
  for(let i=0;i<path.length-1;i++){ parentArr = parentArr.find(n=>n.id===path[i]).children; }
  return { node, chain, parentArr };
}
// flatt yfirlit yfir alla hnúta með slóð + leiðarlýsingu (fyrir leit)
function flatten(nodes=DATA.tree, prefix=[], crumb=[]){
  let out = [];
  for(const n of nodes){
    const path = [...prefix, n.id];
    out.push({ node:n, path, crumbs: crumb.join(' · ') });
    if(n.children && n.children.length) out = out.concat(flatten(n.children, path, [...crumb, n.name]));
  }
  return out;
}

/* ============================================================
   Router
   ============================================================ */
function parseHash(){
  return location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
}
function go(hash){ location.hash = hash; }

function render(){
  if(MODE === 'locked'){ renderLock(); return; }
  setChrome(true);
  const p = parseHash();
  if(p[0] === 'leit'){ renderSearch(); }
  else if(p[0] === 'simaskra'){ renderPhonebook(); }
  else if(p[0] === 'n'){ renderNode(p.slice(1)); }
  else { renderHome(); }
  window.scrollTo(0,0);
}

function setChrome(show){
  $('#topbar').hidden = !show;
  $('#footer').hidden = !show;
  $('#searchBtn').hidden = !show;
  // Bakka-örin sést alltaf: á undirsíðum = til baka, á opnunarsíðu = skrá inn aftur
  $('#backBtn').hidden = !show;
  $('#backBtn').title = parseHash().length ? 'Til baka' : 'Skrá inn aftur';
}

/* ============================================================
   Lás / kóðaskjár
   ============================================================ */
function renderLock(){
  setChrome(false);
  app.innerHTML = `
    <div class="lock">
      <div class="lock__logo">▲</div>
      <h1>FURA</h1>
      <p>Handbók véla og tækja</p>
      <div class="codebox" id="codebox">
        ${[0,1,2,3].map(i=>`<input inputmode="numeric" maxlength="1" data-i="${i}">`).join('')}
      </div>
      <div class="lock__msg" id="lockMsg"></div>
      <div class="lock__hint">Sláðu inn 4 stafa kóða.<br>Lestrarkóði opnar handbókina. Breytingakóði leyfir líka að bæta við og laga.</div>
    </div>`;
  const inputs = [...document.querySelectorAll('#codebox input')];
  inputs[0].focus();
  inputs.forEach((inp, i)=>{
    inp.addEventListener('input', ()=>{
      inp.value = inp.value.replace(/\D/g,'');
      if(inp.value && i < 3) inputs[i+1].focus();
      if(inputs.every(x=>x.value)) tryCode(inputs.map(x=>x.value).join(''));
    });
    inp.addEventListener('keydown', (e)=>{ if(e.key === 'Backspace' && !inp.value && i>0) inputs[i-1].focus(); });
  });
}
async function tryCode(code){
  const msg = $('#lockMsg');
  if(!db){ if(msg) msg.textContent = 'Engin tenging við netþjón'; return; }
  if(msg) msg.textContent = 'Athuga…';
  let res;
  try{ res = await fetchHandbook(code); }
  catch(e){ if(msg) msg.textContent = 'Villa við tengingu — reyndu aftur'; return; }
  if(!res){
    if(msg) msg.textContent = 'Rangur kóði — reyndu aftur';
    document.querySelectorAll('#codebox input').forEach(x=>x.value='');
    const f = document.querySelector('#codebox input'); if(f) f.focus();
    return;
  }
  MODE = res.role; UNLOCK_CODE = code; DATA = normalize(res.data);
  // ef handbókin er tóm og þú mátt breyta -> settu inn sýnishorn í fyrsta sinn
  if(MODE === 'edit' && DATA.tree.length === 0){ DATA = normalize(JSON.parse(JSON.stringify(SEED))); await saveData(); }
  cacheData();
  try{ COMPLETIONS = await fetchMaintenance(code); }catch(e){ COMPLETIONS = {}; }
  localStorage.setItem(UNLOCK_KEY, JSON.stringify({ role:MODE, code }));
  go('#/'); render();
  toast(MODE === 'edit' ? 'Breytingar virkar ✏️' : 'Velkomin/n');
}
function lock(){ MODE='locked'; UNLOCK_CODE=null; localStorage.removeItem(UNLOCK_KEY); render(); }

/* ============================================================
   Forsíða
   ============================================================ */
function myMaintenanceHTML(){
  const me = getMe();
  if(!me) return '';
  const mine = allTasks().filter(x => x.task.responsibleId===me.id && taskStatus(x.task).state==='overdue');
  if(!mine.length) return '';
  return `<div class="mymaint">
    <div class="mymaint__head">🔧 Mitt viðhald — ${mine.length} ${mine.length===1?'verk':'verk'} bíða</div>
    ${mine.map(x=>{ const st=taskStatus(x.task); return `<a class="mymaint__item" href="#/n/${x.path.join('/')}">
      <span class="mymaint__t">${esc(x.task.title||'Viðhald')}</span>
      <span class="mymaint__loc">${esc(x.node.name)} · ${esc(st.text)}</span></a>`; }).join('')}
  </div>`;
}
function renderHome(){
  const cards = DATA.tree.map(n => cardFor(n, [n.id])).join('');
  const add = isEdit() ? `<button class="card card--add" id="addTop"><span>＋</span>Bæta við stað / vél</button>` : '';
  const me = getMe();
  app.innerHTML = `
    <div class="page-head">
      <h1>Fura handbók</h1>
      <p>Veldu stað eða vél — eða leitaðu efst.</p>
    </div>
    ${myMaintenanceHTML()}
    <button class="idbar" id="idBtn">${me ? '👤 Þú ert: <strong>'+esc(me.name)+'</strong> — smelltu til að breyta' : '👤 Veldu hver þú ert (fyrir viðhaldsáminningar)'}</button>
    <a class="pb-entry" href="#/simaskra">
      <span class="pb-entry__icon"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></span>
      <span class="pb-entry__body"><strong>Símaskráin</strong><span>Allir tengiliðir og símanúmer</span></span>
      <span class="pb-entry__arrow">›</span>
    </a>
    <div class="grid">${cards}${add}</div>`;
  $('#idBtn').onclick = chooseMe;
  if(isEdit()) $('#addTop').onclick = ()=>addChildTo(DATA.tree, renderHome);
}

function cardFor(n, path){
  const kids = (n.children && n.children.length) || 0;
  const branch = kids > 0;
  const due = nodeHasOutstanding(n);   // rautt ef viðhald er fram yfir (hér eða dýpra)
  const cls = due ? 'card--due' : (branch ? 'card--branch' : 'card--leaf');
  return `
    <a class="card ${cls}" href="#/n/${path.join('/')}">
      ${photoBlock(n.photo,'card__photo','⚙')}
      ${due?`<span class="card__due">🔧 Viðhald</span>`:''}
      <div class="card__body">
        <div class="card__title">${esc(n.name)}</div>
        ${branch?`<div class="card__more">${kids} ${kids===1?'vél inni':'vélar inni'} ›</div>`:''}
      </div>
    </a>`;
}

function addChildTo(arr, rerender){
  const name = prompt('Nafn (vél, staður eða hlutur):');
  if(!name) return;
  arr.push(emptyNode(name));
  saveData(); rerender(); toast('Bætt við');
}

/* ============================================================
   Hnútasíða — vél / staður / hlutur
   ============================================================ */
function renderNode(path){
  const r = resolve(path);
  if(!r){ go('#/'); return; }
  const node = r.node;
  node.children = node.children || [];
  node.contacts = node.contacts || [];
  node.supplies = node.supplies || [];
  node.maintenance = node.maintenance || [];
  const ancestors = r.chain.slice(0, -1);
  const crumbs = ['Forsíða', ...ancestors.map(a=>esc(a.name))].join(' · ');
  const rerender = ()=>renderNode(path);

  const childCards = node.children.map(c => cardFor(c, [...path, c.id])).join('');
  const addChild = isEdit() ? `<button class="card card--add" id="addChild"><span>＋</span>Bæta við vél</button>` : '';
  const showChildren = node.children.length || isEdit();

  app.innerHTML = `
    <div class="crumbs">${crumbs}</div>
    <div class="hero">
      ${photoBlock(node.photo,'hero__photo')}
      <div class="hero__body">
        <h1>${esc(node.name)}</h1>
        <div id="summaryField"></div>
        ${isEdit()?`<div class="editrow">
          <button class="editbtn" id="heroPhoto">📷 Aðalmynd</button>
          <button class="editbtn" id="renameNode">✏️ Nafn</button>
          <button class="delbtn" id="deleteNode">🗑️ Eyða þessu</button>
        </div>`:''}
      </div>
    </div>

    <div class="section" id="secMaint">
      <div class="section__head"><span class="section__icon">🔧</span><h2>Viðhald</h2></div>
      <div id="maint"></div>
      ${isEdit()?`<button class="addbtn" id="addMaint">＋ Bæta við viðhaldsverki</button>`:''}
    </div>

    ${showChildren ? `<div class="section">
      <div class="section__head"><span class="section__icon">📂</span><h2>Vélar</h2></div>
      <div class="grid">${childCards || (isEdit()?'':'<p class="empty">Ekkert skráð enn.</p>')}${addChild}</div>
    </div>` : ``}

    <div class="section" id="secNotes">
      <div class="section__head"><span class="section__icon">📝</span><h2>Athugasemdir</h2></div>
      <div id="notesField" class="notecard"></div>
    </div>

    <div class="section" id="secSupplies">
      <div class="section__head"><span class="section__icon">📦</span><h2>Birgðir</h2></div>
      <div id="supplies"></div>
      ${isEdit()?`<button class="addbtn" id="addSupply">＋ Bæta við birgð</button>`:''}
    </div>

    <div class="section" id="secContacts">
      <div class="section__head"><span class="section__icon">👥</span><h2>Tengiliðir</h2></div>
      <div id="contacts"></div>
      ${isEdit()?`<button class="addbtn" id="addContact">＋ Bæta við tengilið</button>`:''}
    </div>`;

  mountEditableText($('#summaryField'), node.summary, 'Stutt lýsing…', (v)=>{ node.summary=v; saveData(); });
  const notesHost = $('#notesField');
  mountEditableText(notesHost, node.notes, 'Skrifaðu athugasemdir…', (v)=>{ node.notes=v; saveData(); });
  if(!isEdit() && !(node.notes||'').trim()){ notesHost.classList.remove('notecard'); notesHost.innerHTML='<p class="empty">Engar athugasemdir enn.</p>'; }

  renderMaintenance(node, path, rerender);
  renderSupplies(node);
  renderContacts(node);

  // Í lestrarham: fela tóma hluta svo aðeins það sem hefur upplýsingar sjáist (símavænt)
  if(!isEdit()){
    if(!subtreeTaskCount(node))   $('#secMaint').style.display='none';
    if(!(node.notes||'').trim())  $('#secNotes').style.display='none';
    if(!node.supplies.length)     $('#secSupplies').style.display='none';
    if(!node.contacts.length)     $('#secContacts').style.display='none';
  }

  if(isEdit()){
    $('#heroPhoto').onclick = async ()=>{ const url=await pickAndUpload(); if(url){ node.photo=url; saveData(); rerender(); } };
    $('#renameNode').onclick = ()=>{ const nm=prompt('Nýtt nafn:', node.name); if(nm && nm.trim()){ node.name=nm.trim(); saveData(); rerender(); } };
    $('#deleteNode').onclick = ()=>{
      const inni = (node.children && node.children.length)
        ? `\n\nAthugið: allt sem er inni í þessu eyðist líka (${node.children.length} ${node.children.length===1?'hlutur':'hlutir'}).`
        : '';
      if(!confirm(`Eyða „${node.name}“?${inni}\n\nÞetta er ekki hægt að taka til baka.`)) return;
      const idx = r.parentArr.indexOf(node);
      if(idx > -1) r.parentArr.splice(idx, 1);
      saveData();
      if(path.length > 1) go('#/n/' + path.slice(0, -1).join('/'));  // upp um eitt stig
      else go('#/');                                                  // efsta stig -> forsíða
      toast('Eytt');
    };
    $('#addChild').onclick = ()=>addChildTo(node.children, rerender);
    $('#addMaint').onclick = ()=>{ node.maintenance.push({ id:uid(), title:'', freqType:'weekly', freqValue:'', dueDate:'', responsibleId:'', photo:'' }); saveData(); rerender(); };
    $('#addSupply').onclick = ()=>{ node.supplies.push({id:uid(),name:'',qty:'',supplier:'',note:''}); saveData(); rerender(); };
    $('#addContact').onclick = ()=> chooseContact(node, (personIds)=>{
      personIds.forEach(personId => node.contacts.push({ id:uid(), personId, help:'' }));
      saveData(); rerender();
      toast(personIds.length>1 ? `${personIds.length} tengiliðir bættust við` : 'Tengiliður bættist við');
    });
  }
}

// leitartexti manneskju: nafn + um viðkomandi + leitarorð + sími
function personSearchText(p){ return `${p.name||''} ${p.about||''} ${p.keywords||''} ${p.phone||''}`.toLowerCase(); }

// Valmynd: leita (nafn/leitarorð), haka við marga, bæta þeim öllum við. Skilar lista af personId í done().
function chooseContact(node, done){
  const attached = new Set((node.contacts||[]).map(c=>c.personId));
  let people = (DATA.people||[]).slice().sort((a,b)=>(a.name||'').localeCompare(b.name||'','is'));
  const selected = new Set();

  const overlay = document.createElement('div'); overlay.className='modal';
  overlay.innerHTML = `
    <div class="modal__box">
      <div class="modal__title">Bæta við tengiliðum</div>
      <div class="modal__hint">Leitaðu eftir nafni eða leitarorði (t.d. „mótor"). Hakaðu við þá sem eiga við og bættu þeim öllum við í einu.</div>
      <input class="searchinput modal__search" id="pickerSearch" placeholder="Leita — nafn eða leitarorð…" autocomplete="off">
      <div class="modal__list" id="pickerList"></div>
      <button class="addbtn" data-act="new">＋ Nýr tengiliður</button>
      <div class="editrow" style="margin-top:12px">
        <button class="editbtn modal__add" data-act="add" disabled>Bæta við völdum (0)</button>
        <button class="editbtn" data-act="cancel">Hætta við</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  const close = ()=>overlay.remove();
  const listEl = overlay.querySelector('#pickerList');
  const searchEl = overlay.querySelector('#pickerSearch');
  const addBtn = overlay.querySelector('[data-act="add"]');

  function updateAdd(){ addBtn.textContent = `Bæta við völdum (${selected.size})`; addBtn.disabled = selected.size===0; }

  function draw(){
    const terms = searchEl.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const matches = people.filter(p => terms.every(t => personSearchText(p).includes(t)));
    listEl.innerHTML = matches.length ? matches.map(p=>{
      const isAtt = attached.has(p.id), isSel = selected.has(p.id);
      const meta = [p.phone, p.keywords?('🔑 '+p.keywords):'', p.about].filter(Boolean).join(' · ');
      return `<button class="modal__item ${isSel?'modal__item--sel':''}" data-id="${p.id}" ${isAtt?'disabled':''}>
        <span class="modal__check">${isAtt?'✓':(isSel?'☑':'☐')}</span>
        <span class="modal__itembody">
          <span class="modal__name">${esc(p.name||'(nafnlaus)')}</span>
          <span class="modal__meta">${esc(meta)}${isAtt?' — þegar á þessu tæki':''}</span>
        </span>
      </button>`;
    }).join('') : '<p class="empty">Ekkert fannst.</p>';
    listEl.querySelectorAll('.modal__item').forEach(btn=>{
      if(btn.disabled) return;
      btn.onclick = ()=>{ const id=btn.dataset.id; selected.has(id)?selected.delete(id):selected.add(id); draw(); updateAdd(); };
    });
  }

  searchEl.addEventListener('input', draw);
  overlay.querySelector('[data-act="new"]').onclick = ()=>{
    const name = prompt('Nafn tengiliðar:'); if(!name || !name.trim()){ return; }
    const phone = (prompt('Símanúmer (má sleppa):')||'').trim();
    const about = (prompt('Um viðkomandi — hver er þetta? (má sleppa):')||'').trim();
    const keywords = (prompt('Leitarorð (t.d. mótor, glussi) — má sleppa:')||'').trim();
    const person = { id:uid(), name:name.trim(), phone, about, keywords };
    DATA.people.push(person); people.push(person); selected.add(person.id);
    searchEl.value=''; draw(); updateAdd();
  };
  addBtn.onclick = ()=>{ if(!selected.size) return; const ids=[...selected]; close(); done(ids); };
  overlay.querySelector('[data-act="cancel"]').onclick = close;
  overlay.addEventListener('click', (e)=>{ if(e.target===overlay) close(); });

  draw(); updateAdd(); searchEl.focus();
}

/* ---------- Viðhald á tæki ---------- */
function freqLabel(t){
  if(t.freqType==='weekly')  return 'Vikulega';
  if(t.freqType==='monthly') return 'Mánaðarlega';
  if(t.freqType==='days')    return `Á ${t.freqValue||'?'} daga fresti`;
  if(t.freqType==='once')    return t.dueDate ? ('Einu sinni — fyrir '+fmtDate(t.dueDate)) : 'Einu sinni';
  return '';
}
function fmtWhen(iso){ try{ const days=Math.floor((Date.now()-new Date(iso).getTime())/86400000); if(days<=0)return 'í dag'; if(days===1)return 'í gær'; return `fyrir ${days} dögum`; }catch(e){ return ''; } }

function freqEditor(t, reflow){
  const wrap=document.createElement('div'); wrap.innerHTML=`<div class="fieldlabel">Hversu oft</div>`;
  const sel=document.createElement('select'); sel.className='fsel';
  [['weekly','Vikulega'],['monthly','Mánaðarlega'],['days','Á X daga fresti'],['once','Einu sinni (dagsetning)']]
    .forEach(([v,l])=>{ const o=document.createElement('option'); o.value=v; o.textContent=l; if(t.freqType===v)o.selected=true; sel.appendChild(o); });
  wrap.appendChild(sel);
  const extra=document.createElement('div'); extra.className='freqextra'; wrap.appendChild(extra);
  if(t.freqType==='days'){ const i=document.createElement('input'); i.type='number'; i.min='1'; i.className='edit fnum'; i.value=t.freqValue||''; i.placeholder='Fjöldi daga'; i.oninput=()=>{ t.freqValue=i.value; saveData(); }; extra.appendChild(i); }
  else if(t.freqType==='once'){ const i=document.createElement('input'); i.type='date'; i.className='edit fdate'; i.value=t.dueDate||''; i.onchange=()=>{ t.dueDate=i.value; saveData(); }; extra.appendChild(i); }
  sel.onchange=()=>{ t.freqType=sel.value; saveData(); reflow(); };
  return wrap;
}
function responsibleEditor(t, onSave){
  const wrap=document.createElement('div'); wrap.innerHTML=`<div class="fieldlabel">Ábyrgðarmaður</div>`;
  const sel=document.createElement('select'); sel.className='fsel';
  const none=document.createElement('option'); none.value=''; none.textContent='— enginn —'; sel.appendChild(none);
  (DATA.people||[]).slice().sort((a,b)=>(a.name||'').localeCompare(b.name||'','is'))
    .forEach(p=>{ const o=document.createElement('option'); o.value=p.id; o.textContent=p.name||'(nafnlaus)'; if(t.responsibleId===p.id)o.selected=true; sel.appendChild(o); });
  sel.onchange=()=>{ t.responsibleId=sel.value; onSave(); };
  wrap.appendChild(sel); return wrap;
}

// öll verkefni í þessum hnút OG öllu sem er inni í honum (svo þau sjáist á "hero" síðunni)
function subtreeTaskItems(node, path){
  let out = (node.maintenance||[]).map(t=>({ t, owner:node, ownerPath:path }));
  (node.children||[]).forEach(c=> out = out.concat(subtreeTaskItems(c, [...path, c.id])));
  return out;
}
function subtreeTaskCount(node){ let n=(node.maintenance||[]).length; (node.children||[]).forEach(c=> n+=subtreeTaskCount(c)); return n; }
// tæki (hnútar) inni í node — til að tengja verk við [{node,path,depth}]
function descendantMachines(node, path, depth=0){
  let out=[];
  (node.children||[]).forEach(c=>{ out.push({ node:c, path:[...path,c.id], depth }); out = out.concat(descendantMachines(c, [...path,c.id], depth+1)); });
  return out;
}
// veljari til að tengja/færa verk á ákveðna vél (eða halda á svæðinu)
function machineEditor(t, owner, areaNode, choices, redraw){
  const wrap=document.createElement('div'); wrap.innerHTML=`<div class="fieldlabel">Tæki (valfrjálst)</div>`;
  const sel=document.createElement('select'); sel.className='fsel';
  const oArea=document.createElement('option'); oArea.value='__area__'; oArea.textContent=`— ${areaNode.name||'þetta svæði'} (almennt) —`; if(owner===areaNode) oArea.selected=true; sel.appendChild(oArea);
  choices.forEach(c=>{ const o=document.createElement('option'); o.value=c.path.join('/'); o.textContent=('· '.repeat(c.depth))+(c.node.name||'(vél)'); if(c.node===owner) o.selected=true; sel.appendChild(o); });
  sel.onchange=()=>{
    let target=areaNode;
    if(sel.value!=='__area__'){ const f=choices.find(c=>c.path.join('/')===sel.value); if(f) target=f.node; }
    if(target!==owner){
      owner.maintenance=(owner.maintenance||[]).filter(x=>x!==t);
      target.maintenance=target.maintenance||[]; target.maintenance.push(t);
      saveData();
    }
    redraw();
  };
  wrap.appendChild(sel); return wrap;
}

function renderMaintenance(node, path, rerender){
  const wrap = $('#maint');
  node.maintenance = node.maintenance || [];
  const order = { overdue:0, soon:1, ok:2, done:3 };
  const items = subtreeTaskItems(node, path).sort((a,b)=> (order[taskStatus(a.t).state]??9) - (order[taskStatus(b.t).state]??9));
  if(!items.length){ wrap.innerHTML = isEdit()?'' : '<p class="empty">Ekkert viðhald skráð.</p>'; return; }
  wrap.innerHTML='';
  const redraw = ()=>renderMaintenance(node, path, rerender);
  const machineChoices = descendantMachines(node, path);
  items.forEach(({t, owner, ownerPath})=>{
    const st = taskStatus(t), comp = COMPLETIONS[t.id];
    const el=document.createElement('div'); el.className='task task--'+st.state;
    el.innerHTML = `
      <div class="task__top">
        <div class="task__title"></div>
        <span class="task__badge task__badge--${st.state}">${esc(st.text||'')}</span>
      </div>
      <div class="task__machine"></div>
      <div class="task__photo"></div>
      <div class="task__meta"></div>
      <div class="task__actions"></div>`;
    mountEditableText($('.task__title',el), t.title, 'Hvað á að gera? (t.d. smyrja legur)', (v)=>{t.title=v;saveData();}, {strong:true});
    // hvaða vél tilheyrir verkið (sýnt ef það er dýpra en þessi síða)
    if(owner !== node){ $('.task__machine',el).innerHTML = `<a class="taskchip" href="#/n/${ownerPath.join('/')}">🔧 ${esc(owner.name)}</a>`; }
    if(t.photo) $('.task__photo',el).innerHTML = `<div class="task__img"><img src="${t.photo}" alt="" loading="lazy" decoding="async"></div>`;
    const meta=$('.task__meta',el);
    if(isEdit()){
      meta.appendChild(freqEditor(t, redraw));
      meta.appendChild(responsibleEditor(t, ()=>{ saveData(); redraw(); }));
      if(machineChoices.length) meta.appendChild(machineEditor(t, owner, node, machineChoices, redraw));
    } else {
      const res=getPerson(t.responsibleId), bits=[freqLabel(t)];
      if(res) bits.push('Ábyrgð: '+esc(res.name));
      if(comp && comp.at) bits.push('Síðast: '+fmtWhen(comp.at)+(comp.by?(' ('+esc(comp.by)+')'):''));
      meta.innerHTML=`<div class="meta">${bits.filter(Boolean).join(' · ')}</div>`;
    }
    const actions=$('.task__actions',el);
    const done=document.createElement('button'); done.className='taskbtn taskbtn--done';
    done.textContent = st.state==='done' ? 'Lokið ✓' : '✓ Búið';
    done.onclick = async ()=>{ done.disabled=true; await completeTask(t.id); toast('Skráð búið ✓'); redraw(); };
    actions.appendChild(done);
    if(comp){ const u=document.createElement('button'); u.className='taskbtn taskbtn--undo'; u.textContent='Afturkalla'; u.onclick=async ()=>{ await uncompleteTask(t.id); redraw(); }; actions.appendChild(u); }
    if(isEdit()){
      const ph=document.createElement('button'); ph.className='taskbtn taskbtn--undo'; ph.textContent = t.photo?'📷 Skipta um mynd':'📷 Bæta við mynd';
      ph.onclick=async ()=>{ const url=await pickAndUpload(); if(url){ t.photo=url; saveData(); redraw(); } };
      actions.appendChild(ph);
      if(t.photo){ const rm=document.createElement('button'); rm.className='delbtn'; rm.textContent='✕ Mynd'; rm.onclick=()=>{ t.photo=''; saveData(); redraw(); }; actions.appendChild(rm); }
      const d=document.createElement('button'); d.className='delbtn'; d.textContent='✕ Eyða verki'; d.onclick=()=>{ if(confirm('Eyða þessu viðhaldsverki?')){ owner.maintenance=(owner.maintenance||[]).filter(x=>x!==t); saveData(); rerender(); } }; actions.appendChild(d);
    }
    wrap.appendChild(el);
  });
}

/* ---------- Auðkenni: hver ert þú? (fyrir Mitt viðhald) ---------- */
function chooseMe(){
  const people=(DATA.people||[]).slice().sort((a,b)=>(a.name||'').localeCompare(b.name||'','is'));
  const overlay=document.createElement('div'); overlay.className='modal';
  overlay.innerHTML=`<div class="modal__box">
    <div class="modal__title">Hver ert þú?</div>
    <div class="modal__hint">Geymist bara á þínum síma og læsir engu — stýrir aðeins hvaða viðhaldsáminningar þú færð.</div>
    <input class="searchinput modal__search" id="meSearch" placeholder="Leita að nafni…" autocomplete="off">
    <div class="modal__list" id="meList"></div>
    <div class="editrow" style="margin-top:12px">
      <button class="editbtn" data-act="clear">Hreinsa</button>
      <button class="editbtn" data-act="cancel">Hætta við</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
  const close=()=>overlay.remove();
  const listEl=overlay.querySelector('#meList'), s=overlay.querySelector('#meSearch');
  function draw(){
    const q=s.value.trim().toLowerCase();
    const m=people.filter(p=>(p.name||'').toLowerCase().includes(q));
    listEl.innerHTML = m.length ? m.map(p=>`<button class="modal__item" data-id="${p.id}"><span class="modal__name">${esc(p.name||'(nafnlaus)')}</span></button>`).join('') : '<p class="empty">Ekkert fannst.</p>';
    listEl.querySelectorAll('.modal__item').forEach(b=> b.onclick=()=>{ setMe(b.dataset.id); close(); renderHome(); });
  }
  s.addEventListener('input', draw);
  overlay.querySelector('[data-act="clear"]').onclick=()=>{ setMe(null); close(); renderHome(); };
  overlay.querySelector('[data-act="cancel"]').onclick=close;
  overlay.addEventListener('click',e=>{ if(e.target===overlay) close(); });
  draw(); s.focus();
}

function renderSupplies(node){
  const wrap = $('#supplies');
  node.supplies = node.supplies || [];
  if(!node.supplies.length && !isEdit()){ wrap.innerHTML='<p class="empty">Engar birgðir skráðar enn.</p>'; return; }
  wrap.innerHTML='';
  node.supplies.forEach(s=>{
    const el=document.createElement('div'); el.className='row';
    el.innerHTML=`<div class="sName"></div><div class="sMeta"></div>
      ${isEdit()?`<div class="editrow"><button class="delbtn" data-act="del">✕ Eyða</button></div>`:''}`;
    mountEditableText($('.sName',el), s.name, 'Heiti birgða / vöru', (v)=>{s.name=v;saveData();}, {strong:true});
    if(isEdit()){
      const meta=$('.sMeta',el); meta.innerHTML='';
      meta.appendChild(fieldLine('Magn / staða á lager', s.qty, 'T.d. 2 fötur eftir', (v)=>{s.qty=v;saveData();}));
      meta.appendChild(fieldLine('Hvar á að kaupa', s.supplier, 'T.d. Olís, Vélaver…', (v)=>{s.supplier=v;saveData();}));
      meta.appendChild(fieldLine('Athugasemd', s.note, 'T.d. panta þegar 1 eftir', (v)=>{s.note=v;saveData();}));
    } else {
      let html='';
      if(s.qty) html += `<div class="meta">Magn: <strong>${esc(s.qty)}</strong></div>`;
      if(s.supplier) html += `<div class="meta">Kaupa hjá: ${esc(s.supplier)}</div>`;
      if(s.note) html += `<div class="meta">${esc(s.note)}</div>`;
      $('.sMeta',el).innerHTML = html || '<span class="meta">Engar upplýsingar enn.</span>';
    }
    if(isEdit()) $('[data-act="del"]',el).onclick=()=>{ if(confirm('Eyða þessari birgð?')){ node.supplies=node.supplies.filter(x=>x!==s); saveData(); renderSupplies(node);} };
    wrap.appendChild(el);
  });
}

function renderContacts(node){
  const wrap = $('#contacts');
  node.contacts = (node.contacts || []).filter(c=> getPerson(c.personId)); // sleppa tilvísunum án manneskju
  if(!node.contacts.length && !isEdit()){ wrap.innerHTML='<p class="empty">Engir tengiliðir skráðir enn.</p>'; return; }
  wrap.innerHTML='';
  node.contacts.forEach(c=>{
    const p = getPerson(c.personId);
    const el=document.createElement('div'); el.className='row';
    el.innerHTML=`
      <div class="cName"></div>
      <div class="cShared"></div>
      <div class="cHelpWrap"><div class="fieldlabel">Hjálpar við þetta tæki</div><div class="cHelp"></div></div>
      ${isEdit()?`<div class="editrow"><button class="delbtn" data-act="del">✕ Fjarlægja af þessu tæki</button></div>`:''}`;
    if(isEdit()){
      // Nafn / sími / um viðkomandi -> uppfærir sameiginlegu manneskjuna (sama alls staðar)
      mountEditableText($('.cName',el), p.name, 'Nafn tengiliðar', (v)=>{p.name=v;saveData();}, {strong:true});
      const sh = $('.cShared',el); sh.innerHTML='';
      sh.appendChild(fieldLine('Símanúmer (sama alls staðar)', p.phone, 'T.d. 555 1234', (v)=>{p.phone=v;saveData();}));
      sh.appendChild(fieldLine('Um viðkomandi (sama alls staðar)', p.about, 'Hver er þetta? T.d. rafvirki hjá Rafal', (v)=>{p.about=v;saveData();}));
      mountEditableText($('.cHelp',el), c.help, 'T.d. sér um viðgerðir á þessari vél', (v)=>{c.help=v;saveData();});
    } else {
      $('.cName',el).innerHTML = `<div class="row__q">${esc(p.name||'')}</div>`;
      $('.cShared',el).innerHTML = p.phone
        ? `<div class="meta">📞 <a href="tel:${esc((p.phone||'').replace(/\s+/g,''))}">${esc(p.phone)}</a></div>`
        : '';
      // #3 Um viðkomandi — með merkimiða (aðeins ef fyllt)
      if(p.about){
        const ab=document.createElement('div'); ab.className='cInfo';
        ab.innerHTML = `<div class="fieldlabel">Um viðkomandi</div><div class="meta">${esc(p.about)}</div>`;
        $('.cShared',el).after(ab);
      }
      if(c.help){ $('.cHelp',el).innerHTML = nl2br(c.help); }
      else { $('.cHelpWrap',el).style.display='none'; }
    }
    if(isEdit()) $('[data-act="del"]',el).onclick=()=>{
      if(confirm(`Fjarlægja ${p.name||'tengilið'} af þessu tæki?\n\n(Tengiliðurinn sjálfur eyðist ekki — hann er áfram vistaður og á öðrum tækjum.)`)){
        node.contacts=node.contacts.filter(x=>x!==c); saveData(); renderContacts(node);
      }
    };
    wrap.appendChild(el);
  });
}

function fieldLine(label, value, ph, onSave){
  const d=document.createElement('div');
  d.innerHTML=`<div class="fieldlabel">${label}</div>`;
  const holder=document.createElement('div'); d.appendChild(holder);
  mountEditableText(holder, value, ph, onSave, {single:true});
  return d;
}

/* ============================================================
   Leit
   ============================================================ */
function renderSearch(){
  app.innerHTML = `
    <div class="page-head"><h1>Leita</h1><p>Skrifaðu nafn á vél eða hlut.</p></div>
    <input class="searchinput" id="searchInput" placeholder="T.d. pressa, tætari, belti…" autocomplete="off">
    <div id="searchResults"></div>`;
  const inp = $('#searchInput'); inp.focus();
  const all = flatten();  // öll stig trésins, sama hversu djúpt
  // allur texti hnútsins settur saman (nafn, lýsing, athugasemdir, tengiliðir)
  const nodeText = (n)=>{
    let s = `${n.name||''} ${n.summary||''} ${n.notes||''}`;
    (n.contacts||[]).forEach(c=>{
      const p = getPerson(c.personId) || {};
      s += ` ${p.name||''} ${p.about||''} ${p.phone||''} ${p.keywords||''} ${c.help||''}`;
    });
    (n.supplies||[]).forEach(x=>{ s += ` ${x.name||''} ${x.qty||''} ${x.supplier||''} ${x.note||''}`; });
    return s.toLowerCase();
  };
  function run(){
    const q = inp.value.trim().toLowerCase();
    const out = $('#searchResults');
    if(!q){ out.innerHTML = '<p class="empty">Byrjaðu að skrifa…</p>'; return; }
    const terms = q.split(/\s+/).filter(Boolean);
    const res = all.filter(x => { const t = nodeText(x.node); return terms.every(w => t.includes(w)); });
    if(!res.length){ out.innerHTML = '<p class="empty">Ekkert fannst.</p>'; return; }
    out.innerHTML = res.map(x => `
      <a class="result" href="#/n/${x.path.join('/')}">
        <div class="result__name">${esc(x.node.name)}</div>
        <div class="result__path">${x.crumbs || 'Forsíða'}</div>
      </a>`).join('');
  }
  inp.addEventListener('input', run);
  run();
}

/* ============================================================
   Símaskráin — allir tengiliðir á einum stað
   ============================================================ */
// öll tæki sem tiltekin manneskja er skráð fyrir (nafn + slóð)
function personMachines(personId){
  const out=[];
  (function walk(nodes, path){
    for(const n of nodes){
      const p=[...path, n.id];
      if((n.contacts||[]).some(c=>c.personId===personId)) out.push({ name:n.name, path:p });
      if(n.children && n.children.length) walk(n.children, p);
    }
  })(DATA.tree, []);
  return out;
}

function renderPhonebook(){
  DATA.people = DATA.people || [];
  const people = DATA.people.slice().sort((a,b)=>(a.name||'').localeCompare(b.name||'','is'));
  app.innerHTML = `
    <div class="crumbs">Forsíða</div>
    <div class="page-head"><h1>Símaskráin</h1><p>Allir tengiliðir — smelltu á númer til að hringja.</p></div>
    <div id="pbList"></div>
    ${isEdit()?`<button class="addbtn" id="pbAdd">＋ Nýr tengiliður í símaskrá</button>`:''}`;
  const list = $('#pbList');
  if(!people.length){ list.innerHTML = '<p class="empty">Engir tengiliðir enn.</p>'; }

  people.forEach(p=>{
    const machines = personMachines(p.id);
    const el = document.createElement('div'); el.className='pbcard';
    el.innerHTML = `
      <div class="pbName"></div>
      <div class="pbPhone"></div>
      <div class="pbAbout"></div>
      <div class="pbKeywords"></div>
      <div class="pbMachines"></div>
      ${isEdit()?`<div class="editrow"><button class="delbtn" data-act="del">✕ Eyða úr símaskrá</button></div>`:''}`;

    if(isEdit()){
      mountEditableText($('.pbName',el), p.name, 'Nafn', (v)=>{p.name=v;saveData();}, {strong:true});
      $('.pbPhone',el).appendChild(fieldLine('Símanúmer', p.phone, 'T.d. 555 1234', (v)=>{p.phone=v;saveData();}));
      $('.pbAbout',el).appendChild(fieldLine('Um viðkomandi', p.about, 'Hver er þetta? T.d. rafvirki hjá Rafal', (v)=>{p.about=v;saveData();}));
      $('.pbKeywords',el).appendChild(fieldLine('Leitarorð', p.keywords, 'T.d. mótor, glussi, rafmagn', (v)=>{p.keywords=v;saveData();}));
    } else {
      $('.pbName',el).innerHTML = `<div class="pbName__t">${esc(p.name||'(nafnlaus)')}</div>`;
      $('.pbPhone',el).innerHTML = p.phone
        ? `<a class="pbCall" href="tel:${esc((p.phone||'').replace(/\s+/g,''))}">📞 ${esc(p.phone)}</a>`
        : `<span class="meta">Ekkert símanúmer skráð</span>`;
      $('.pbAbout',el).innerHTML = p.about ? `<div class="meta">${esc(p.about)}</div>` : '';
      $('.pbKeywords',el).innerHTML = p.keywords ? `<div class="meta pbKw">🔑 ${esc(p.keywords)}</div>` : '';
    }

    const mWrap = $('.pbMachines',el);
    if(machines.length){
      mWrap.innerHTML = `<div class="pbMachines__label">Skráður fyrir</div>` +
        machines.map(m=>`<a class="pbchip" href="#/n/${m.path.join('/')}">${esc(m.name)}</a>`).join('');
    } else {
      mWrap.innerHTML = `<div class="pbMachines__none">Ekki skráður fyrir neitt sérstakt tæki</div>`;
    }

    if(isEdit()) $('[data-act="del"]',el).onclick = ()=>{
      const warn = machines.length ? `\n\nHann verður líka fjarlægður af ${machines.length} ${machines.length===1?'tæki':'tækjum'}.` : '';
      if(confirm(`Eyða ${p.name||'þessum tengilið'} úr símaskránni?${warn}`)){
        (function walk(nodes){ for(const n of nodes){ if(Array.isArray(n.contacts)) n.contacts = n.contacts.filter(c=>c.personId!==p.id); if(n.children) walk(n.children); } })(DATA.tree);
        DATA.people = DATA.people.filter(x=>x!==p);
        saveData(); renderPhonebook();
      }
    };
    list.appendChild(el);
  });

  if(isEdit()) $('#pbAdd').onclick = ()=>{
    const name = prompt('Nafn tengiliðar:'); if(!name || !name.trim()) return;
    const phone = (prompt('Símanúmer (má sleppa):')||'').trim();
    const about = (prompt('Um viðkomandi — hver er þetta? (má sleppa):')||'').trim();
    DATA.people.push({ id:uid(), name:name.trim(), phone, about });
    saveData(); renderPhonebook();
  };
}

/* ============================================================
   Breytanlegur texti (smella → textreitur → vista)
   ============================================================ */
function mountEditableText(host, value, placeholder, onSave, opts={}){
  host.innerHTML='';
  const show = document.createElement('div');
  const fill = () => {
    if(value && value.trim()){
      show.innerHTML = opts.label
        ? `<span class="label">${esc(value)}</span>`
        : opts.strong ? `<div class="row__q">${nl2br(value)}</div>`
        : linkify(value);
    } else {
      show.innerHTML = isEdit() ? `<span style="color:#b6b1a4">${esc(placeholder)}</span>` : '';
    }
  };
  fill();
  host.appendChild(show);
  if(!isEdit()) return;

  show.classList.add('editmark');
  show.style.cursor='text';
  show.onclick = () => {
    const editor = document.createElement('div');
    const input = document.createElement(opts.single ? 'input' : 'textarea');
    input.className='edit'; input.value = value || '';
    if(opts.single) input.type='text';
    input.placeholder = placeholder;
    const bar = document.createElement('div'); bar.className='editrow';
    const cancel=document.createElement('button'); cancel.className='editbtn'; cancel.textContent='Hætta við';
    const hint=document.createElement('span'); hint.className='edithint';
    hint.textContent = opts.single ? 'Enter vistar' : 'Enter vistar · Shift+Enter = ný lína';
    bar.append(cancel, hint);
    editor.append(input, bar);
    host.replaceChild(editor, show);
    input.focus();

    let closed = false, cancelling = false;
    const commit = () => { if(closed) return; closed = true; value = input.value; onSave(value); fill(); host.replaceChild(show, editor); toast('Vistað ✓'); };
    const abort  = () => { if(closed) return; closed = true; host.replaceChild(show, editor); };

    // Enter vistar (Shift+Enter = ný lína í textarea). Esc hættir við.
    input.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); commit(); }
      else if(e.key === 'Escape'){ e.preventDefault(); cancelling = true; abort(); }
    });
    // Að smella út úr reitnum vistar líka
    input.addEventListener('blur', () => { setTimeout(() => { cancelling ? abort() : commit(); }, 0); });
    // Hætta við án þess að vista (mousedown kemur á undan blur)
    cancel.addEventListener('mousedown', (e) => { e.preventDefault(); cancelling = true; });
    cancel.addEventListener('click', () => abort());
  };
}

/* ============================================================
   Ræsing
   ============================================================ */
$('#backBtn').onclick = () => {
  const p = parseHash();
  if(p.length === 0){ lock(); return; }                              // á opnunarsíðu -> skrá inn aftur (1234 / 2808)
  if(p[0]==='n' && p.length>2) go('#/n/' + p.slice(1,-1).join('/'));  // upp um eitt stig
  else go('#/');                                                       // annað -> forsíða
};
$('#searchBtn').onclick = () => go('#/leit');

window.addEventListener('hashchange', render);

// Þegar appið kemur aftur í forgrunn: sækja nýjustu gögn (sér breytingar frá hinum)
document.addEventListener('visibilitychange', async ()=>{
  if(document.visibilityState==='visible' && MODE!=='locked' && UNLOCK_CODE && db){
    try{
      const res = await fetchHandbook(UNLOCK_CODE);
      try{ COMPLETIONS = await fetchMaintenance(UNLOCK_CODE); }catch(e){}
      if(res){
        DATA = normalize(res.data); cacheData();
        if(!document.querySelector('textarea.edit, input.edit')) render(); // ekki trufla ef verið er að skrifa
      }
    }catch(e){}
  }
});

// Ræsing: ef búið var að opna áður, sýna afrit strax og sækja svo nýtt
async function init(){
  let unlock = null;
  try{ unlock = JSON.parse(localStorage.getItem(UNLOCK_KEY) || 'null'); }catch(e){}
  const cached = loadCache();
  if(!unlock){ renderLock(); return; }

  MODE = unlock.role; UNLOCK_CODE = unlock.code;
  if(cached){ DATA = normalize(cached); render(); }   // strax úr afriti (líka ónettengt)

  if(db){
    try{
      const res = await fetchHandbook(unlock.code);
      try{ COMPLETIONS = await fetchMaintenance(unlock.code); }catch(e){}
      if(res){ MODE = res.role; DATA = normalize(res.data); cacheData(); render(); return; }
      else { lock(); return; }                         // kóða breytt -> læsa
    }catch(e){ if(!cached){ renderLock(); } }           // ónettengt og ekkert afrit
  } else if(!cached){
    renderLock();
  }
}
init();

if('serviceWorker' in navigator && location.protocol.startsWith('http')){
  navigator.serviceWorker.register('service-worker.js').catch(()=>{});
}
