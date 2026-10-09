// ===== Laudos Dr. José Rosa — PWA =====
const $ = (id) => document.getElementById(id);
const LS_KEY = 'laudos_v1';
const PIN_KEY = 'laudos_pin_v1';

// ---------- PIN / LGPD lock ----------
function sha(str){ // simple hash (not crypto-grade, só pra travar o acesso local)
  let h=0; for(let i=0;i<str.length;i++){h=(h*31+str.charCodeAt(i))|0;} return ''+h;
}
function initLock(){
  const saved = localStorage.getItem(PIN_KEY);
  $('lock').classList.remove('hidden');
  $('lockmsg').textContent = saved ? 'Digite seu PIN' : 'Crie um PIN (4 a 8 dígitos)';
  $('pinbtn').textContent = saved ? 'Entrar' : 'Criar PIN';
  $('pin').focus();
  $('pinbtn').onclick = () => {
    const v = $('pin').value.trim();
    if(v.length < 4){ $('lockmsg').textContent='Mínimo 4 dígitos'; return; }
    if(!saved){ localStorage.setItem(PIN_KEY, sha(v)); unlock(); }
    else if(sha(v)===saved){ unlock(); }
    else { $('lockmsg').textContent='PIN incorreto'; $('pin').value=''; }
  };
  $('pin').addEventListener('keydown', e=>{ if(e.key==='Enter') $('pinbtn').click(); });
}
function unlock(){ $('lock').classList.add('hidden'); $('app').classList.remove('hidden'); $('pin').value=''; }

// ---------- Navegação ----------
document.querySelectorAll('.tab').forEach(t=>{
  t.onclick = ()=>{
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    const v=t.dataset.view;
    $('view-novo').classList.toggle('hidden', v!=='novo');
    $('view-arquivo').classList.toggle('hidden', v!=='arquivo');
    $('view-modelos').classList.toggle('hidden', v!=='modelos');
    if(v==='arquivo') renderLista();
    if(v==='modelos') renderModelos();
  };
});

// ---------- Modelos personalizados ----------
const TPL_KEY = 'laudos_templates_v1';
function getTpls(){ try{return JSON.parse(localStorage.getItem(TPL_KEY))||[]}catch(e){return[]} }
function saveTpls(a){ localStorage.setItem(TPL_KEY, JSON.stringify(a)); }
function populateModeloSelect(){
  const sel=$('f_modelo');
  sel.innerHTML = '<option value="">— escolher modelo —</option>'
    + '<optgroup label="Modelos prontos">'
    + '<option value="ecodoppler">Eco-Doppler Venoso</option>'
    + '<option value="microlaser">Microlaser</option>'
    + '<option value="espuma">Espuma Densa Ecoguiada</option>'
    + '<option value="endolaser">Endolaser</option></optgroup>';
  const meus=getTpls();
  if(meus.length){
    const g=document.createElement('optgroup'); g.label='Meus modelos';
    meus.forEach(t=>{ const o=document.createElement('option'); o.value='c_'+t.id; o.textContent=t.nome; g.appendChild(o); });
    sel.appendChild(g);
  }
}
function resolveTemplate(val){
  if(!val) return null;
  if(val.startsWith('c_')){ const t=getTpls().find(x=>'c_'+x.id===val); return t?t.corpo:''; }
  return TEMPLATES[val]||'';
}
let editTpl=null;
$('m_salvar').onclick=()=>{
  const nome=$('m_nome').value.trim(), corpo=$('m_corpo').value;
  if(!nome){ alert('Dê um nome ao modelo.'); return; }
  if(!corpo.trim()){ alert('O modelo está vazio.'); return; }
  const all=getTpls();
  if(editTpl){ const i=all.findIndex(x=>x.id===editTpl); if(i>=0) all[i]={...all[i],nome,corpo}; editTpl=null; }
  else all.unshift({id:Date.now()+'',nome,corpo});
  saveTpls(all); $('m_nome').value=''; $('m_corpo').value='';
  populateModeloSelect(); renderModelos(); alert('Modelo salvo.');
};
$('m_limpar').onclick=()=>{ editTpl=null; $('m_nome').value=''; $('m_corpo').value=''; };
function renderModelos(){
  const all=getTpls();
  $('m_lista').innerHTML = all.length ? all.map(t=>`
    <div class="item">
      <div class="info" onclick="editarTpl('${t.id}')"><div class="nome">${esc(t.nome)}</div>
      <div class="meta">${esc((t.corpo||'').slice(0,60))}...</div></div>
      <div class="acts">
        <button class="iconbtn" onclick="editarTpl('${t.id}')">✏️</button>
        <button class="iconbtn del" onclick="excluirTpl('${t.id}')">🗑️</button>
      </div></div>`).join('')
    : '<p class="fineprint" style="text-align:center">Nenhum modelo seu ainda. Crie o primeiro acima.</p>';
}
window.editarTpl=(id)=>{ const t=getTpls().find(x=>x.id===id); if(!t)return; editTpl=id; $('m_nome').value=t.nome; $('m_corpo').value=t.corpo; window.scrollTo(0,0); };
window.excluirTpl=(id)=>{ if(!confirm('Excluir este modelo?'))return; saveTpls(getTpls().filter(x=>x.id!==id)); populateModeloSelect(); renderModelos(); };
$('btn_salvar_modelo').onclick=()=>{
  const corpo=$('f_corpo').value;
  if(!corpo.trim()){ alert('Escreva o corpo do laudo primeiro.'); return; }
  const nome=prompt('Nome do novo modelo:'); if(!nome) return;
  const all=getTpls(); all.unshift({id:Date.now()+'',nome:nome.trim(),corpo});
  saveTpls(all); populateModeloSelect(); alert('Modelo "'+nome.trim()+'" salvo. Já aparece na lista de modelos.');
};

// ---------- Data padrão hoje ----------
function hojeISO(){ const d=new Date(); d.setMinutes(d.getMinutes()-d.getTimezoneOffset()); return d.toISOString().slice(0,10); }
function brData(iso){ if(!iso) return ''; const [y,m,d]=iso.split('-'); return `${d}/${m}/${y}`; }
$('f_data').value = hojeISO();

// ---------- Modelos prontos ----------
$('f_modelo').onchange = ()=>{
  const k=$('f_modelo').value; if(!k) return;
  const cur=$('f_corpo').value.trim();
  if(cur && !confirm('Substituir o texto atual pelo modelo escolhido?')){ $('f_modelo').value=''; return; }
  $('f_corpo').value = resolveTemplate(k) || '';
};

// ---------- Ditado por voz (Web Speech API) ----------
let rec=null, recTarget=null;
function setupMic(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){ document.querySelectorAll('.mic').forEach(b=>b.title='Ditado não suportado neste navegador'); return; }
  document.querySelectorAll('.mic').forEach(btn=>{
    btn.onclick = ()=>{
      if(rec){ rec.stop(); return; }
      recTarget = $(btn.dataset.target);
      rec = new SR(); rec.lang='pt-BR'; rec.continuous=true; rec.interimResults=true;
      let base = recTarget.value ? recTarget.value + ' ' : '';
      btn.classList.add('rec'); $('micstatus').textContent='🎤 Ouvindo... toque no microfone pra parar.';
      rec.onresult = (e)=>{
        let fin='',int='';
        for(let i=e.resultIndex;i<e.results.length;i++){
          const t=e.results[i][0].transcript;
          if(e.results[i].isFinal) fin+=t; else int+=t;
        }
        if(fin) base += fin + ' ';
        recTarget.value = base + int;
      };
      rec.onerror = (e)=>{ $('micstatus').textContent='Erro no microfone: '+e.error; };
      rec.onend = ()=>{ btn.classList.remove('rec'); $('micstatus').textContent=''; rec=null; };
      rec.start();
    };
  });
}

// ---------- Coletar / preencher ----------
function coletar(){
  return {
    paciente:$('f_paciente').value.trim(), data:$('f_data').value,
    idade:$('f_idade').value.trim(), convenio:$('f_convenio').value,
    exame:$('f_exame').value.trim(), corpo:$('f_corpo').value
  };
}
function preencher(o){
  $('f_paciente').value=o.paciente||''; $('f_data').value=o.data||hojeISO();
  $('f_idade').value=o.idade||''; $('f_convenio').value=o.convenio||'Unimed';
  $('f_exame').value=o.exame||''; $('f_corpo').value=o.corpo||'';
}

// ---------- Arquivo (localStorage) ----------
function getAll(){ try{return JSON.parse(localStorage.getItem(LS_KEY))||[]}catch(e){return[]} }
function saveAll(a){ localStorage.setItem(LS_KEY, JSON.stringify(a)); }
let editId=null;

$('btn_salvar').onclick = ()=>{
  const o=coletar();
  if(!o.paciente){ alert('Informe o nome do paciente.'); return; }
  const all=getAll();
  if(editId){ const i=all.findIndex(x=>x.id===editId); if(i>=0) all[i]={...all[i],...o}; }
  else { o.id=Date.now()+''; o.criado=new Date().toISOString(); all.unshift(o); editId=o.id; }
  saveAll(all); alert('Laudo salvo no arquivo.');
};

$('btn_limpar').onclick = ()=>{ if(confirm('Limpar o formulário?')){ editId=null; preencher({}); } };

function renderLista(){
  const termo=($('busca').value||'').toLowerCase();
  const all=getAll().filter(x=>x.paciente.toLowerCase().includes(termo));
  $('vazio').style.display = all.length? 'none':'block';
  $('lista').innerHTML = all.map(x=>`
    <div class="item">
      <div class="info" onclick="abrir('${x.id}')">
        <div class="nome">${esc(x.paciente)}</div>
        <div class="meta">${brData(x.data)} · ${esc(x.exame||x.convenio||'')}</div>
      </div>
      <div class="acts">
        <button class="iconbtn" onclick="abrir('${x.id}')" title="Abrir">✏️</button>
        <button class="iconbtn" onclick="imprimirId('${x.id}')" title="PDF">📄</button>
        <button class="iconbtn del" onclick="excluir('${x.id}')" title="Excluir">🗑️</button>
      </div>
    </div>`).join('');
}
$('busca').oninput = renderLista;
function esc(s){ return (s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

window.abrir = (id)=>{
  const o=getAll().find(x=>x.id===id); if(!o) return;
  editId=id; preencher(o);
  document.querySelector('.tab[data-view="novo"]').click();
  window.scrollTo(0,0);
};
window.excluir = (id)=>{ if(!confirm('Excluir este laudo?'))return; saveAll(getAll().filter(x=>x.id!==id)); renderLista(); };
window.imprimirId = (id)=>{ const o=getAll().find(x=>x.id===id); if(o){ montarPrint(o); window.print(); } };

// ---------- Gerar PDF / Imprimir ----------
function montarPrint(o){
  $('p_paciente').textContent=o.paciente||'';
  $('p_data').textContent=brData(o.data);
  $('p_idade').textContent=o.idade||'—';
  $('p_convenio').textContent=o.convenio||'';
  $('p_exame').textContent=o.exame||'—';
  $('p_corpo').textContent=o.corpo||'';
}
$('btn_pdf').onclick = ()=>{
  const o=coletar();
  if(!o.paciente){ alert('Informe o nome do paciente.'); return; }
  montarPrint(o); window.print();
};

// ---------- Service worker (PWA) ----------
if('serviceWorker' in navigator){ navigator.serviceWorker.register('sw.js').catch(()=>{}); }

// ---------- Start ----------
initLock(); setupMic(); populateModeloSelect();
