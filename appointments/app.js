// Simple PWA appointment tracker using localStorage
let deferPrompt = null;
window.addEventListener('beforeinstallprompt', (e)=>{ e.preventDefault(); deferPrompt = e; document.getElementById('btnInstall').hidden = false; });
document.getElementById('btnInstall').addEventListener('click', async ()=>{ if(deferPrompt){ deferPrompt.prompt(); deferPrompt = null; document.getElementById('btnInstall').hidden = true; }});

// Share link (fallback copies URL)
document.getElementById('btnShare').addEventListener('click', async ()=>{
  const url = location.href;
  try {
    if (navigator.share) await navigator.share({title: document.title, url});
    else {
      await navigator.clipboard.writeText(url);
      alert('App link copied to clipboard');
    }
  } catch(e){ console.log(e); }
});

const $ = sel => document.querySelector(sel);
const listEl = $('#list');
const dlg = $('#dlg');
const form = $('#form');
const btnNew = $('#btnNew');
const btnSave = $('#btnSave');
const btnAddIcs = $('#btnAddIcs');
const search = $('#search');
const filterStatus = $('#filterStatus');
const filterWhen = $('#filterWhen');
const importCsv = $('#importCsv');
const btnExport = $('#btnExport');
const btnBackup = $('#btnBackup');
const importJson = $('#importJson');
const btnReports = $('#btnReports');
const dlgReports = $('#dlgReports');

let editingId = null;

function load(){ try{ return JSON.parse(localStorage.getItem('appointments')||'[]'); }catch{return []}}
function save(arr){ localStorage.setItem('appointments', JSON.stringify(arr)); render(); }
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }

function render(){
  const q = search.value.trim().toLowerCase();
  const status = filterStatus.value;
  const when = filterWhen.value;
  const now = new Date(); const todayStr = now.toISOString().slice(0,10);

  const items = load().filter(a=>{
    const hay = `${a.client} ${a.phone||''} ${a.pet||''} ${a.notes||''}`.toLowerCase();
    if(q && !hay.includes(q)) return false;
    if(status!=='all' && a.status!==status) return false;
    // date filtering
    if(when!=='all'){
      const d = a.date || '';
      if(when==='today' && d!==todayStr) return false;
      if(when==='upcoming' && d<todayStr) return false;
      if(when==='past' && d>=todayStr) return false;
    }
    return true;
  }).sort((a,b)=> (a.date+a.time).localeCompare(b.date+b.time));

  listEl.innerHTML = items.map(cardHTML).join('') || `<p style="text-align:center;color:#6b7280;margin-top:20px">No appointments yet. Tap <b>+ New Appointment</b> to add one.</p>`;
}

function cardHTML(a){
  const badge = `<span class="badge ${a.status}">${a.status[0].toUpperCase()+a.status.slice(1)}</span>`;
  const paid = a.paid==='yes' ? '✅ Paid' : '❌ Unpaid';
  const when = `${a.date||''} ${a.time||''}`.trim();
  return `<article class="card" data-id="${a.id}">
    <header>
      <h3>${escapeHtml(a.client)} • ${escapeHtml(a.pet||'')}</h3>
      ${badge}
    </header>
    <div class="meta">
      <span>📅 ${when}</span>
      ${a.phone?`<span>📞 ${escapeHtml(a.phone)}</span>`:''}
      ${a.service?`<span>✂️ ${escapeHtml(a.service)}</span>`:''}
      ${a.price?`<span>💲 ${Number(a.price).toFixed(2)}</span>`:''}
      ${a.location?`<span>📍 ${escapeHtml(a.location)}</span>`:''}
      <span>${paid}</span>
    </div>
    ${a.notes?`<div class="notes">${escapeHtml(a.notes)}</div>`:''}
    <div class="actions">
      ${a.phone?`<button onclick="smsReminder('${a.id}')">Text Reminder</button>`:''}
      <button onclick="editItem('${a.id}')">Edit</button>
      <button onclick="togglePaid('${a.id}')">${a.paid==='yes'?'Mark Unpaid':'Mark Paid'}</button>
      <button onclick="quickComplete('${a.id}')">Complete</button>
      <button onclick="delItem('${a.id}')">Delete</button>
      <button onclick="downloadIcs('${a.id}')">Add to Calendar</button>
    </div>
  </article>`;
}

function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }

btnNew.addEventListener('click', ()=>{ editingId = null; form.reset(); $('#dlgTitle').textContent='New Appointment'; dlg.showModal(); });
btnSave.addEventListener('click', (e)=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  if(!data.client || !data.date || !data.time){ alert('Client, date, and time are required.'); return; }
  const arr = load();
  if(editingId){
    const i = arr.findIndex(x=>x.id===editingId);
    if(i>-1) arr[i] = {...arr[i], ...data};
  } else {
    arr.push({ id: uid(), created: new Date().toISOString(), ...data });
  }
  save(arr);
  dlg.close();
});

// Edit / Delete / Quick actions
window.editItem = (id)=>{
  const a = load().find(x=>x.id===id); if(!a) return;
  editingId = id;
  $('#dlgTitle').textContent = 'Edit Appointment';
  for(const [k,v] of Object.entries(a)){
    const el = form.querySelector(`[name="${k}"]`); if(el) el.value = v;
  }
  dlg.showModal();
};

window.delItem = (id)=>{
  if(!confirm('Delete this appointment?')) return;
  save(load().filter(x=>x.id!==id));
};

window.togglePaid = (id)=>{
  const arr = load();
  const i = arr.findIndex(x=>x.id===id);
  if(i>-1){ arr[i].paid = (arr[i].paid==='yes'?'no':'yes'); save(arr); }
};

window.quickComplete = (id)=>{
  const arr = load();
  const i = arr.findIndex(x=>x.id===id);
  if(i>-1){ arr[i].status = 'completed'; save(arr); }
};

// Filters & search
search.addEventListener('input', render);
filterStatus.addEventListener('change', render);
filterWhen.addEventListener('change', render);


// SMS Reminder
function smsReminder(id){
  const a = load().find(x=>x.id===id); if(!a || !a.phone){ alert('No phone number on file.'); return; }
  const phone = String(a.phone).replace(/\D/g,''); // digits only
  const when = `${a.date||''} ${a.time||''}`.trim();
  const msg = encodeURIComponent(`Hi ${a.client}, reminder: ${a.service||'Dog nail service'} for ${a.pet||'your pet'} on ${when}. Reply to confirm.`);
  // iOS supports sms:+1234567890&body=... (some devices require ?body=)
  const url = `sms:${phone}&body=${msg}`;
  location.href = url;
}

// Backup (JSON)
btnBackup.addEventListener('click', ()=>{
  const data = JSON.stringify(load(), null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const a = document.createElement('a');
  const d = new Date();
  const stamp = d.toISOString().slice(0,10);
  a.href = URL.createObjectURL(blob);
  a.download = `appointments-backup-${stamp}.json`;
  a.click();
});

importJson.addEventListener('change', async (e)=>{
  const file = e.target.files[0]; if(!file) return;
  try{
    const text = await file.text();
    const data = JSON.parse(text);
    if(!Array.isArray(data)) throw new Error('Invalid backup file');
    save(data);
    alert('Restore complete');
  }catch(err){
    alert('Restore failed: '+err.message);
  }
});

// Reports
btnReports.addEventListener('click', ()=>{ renderReports(); dlgReports.showModal(); });

function sum(arr, f){ return arr.reduce((t,x)=>t+(+f(x)||0),0); }

function renderReports(){
  const items = load();
  const completed = items.filter(a=>a.status==='completed');
  const paidRevenue = sum(completed.filter(a=>a.paid==='yes'), a=>a.price);
  const unpaidScheduled = sum(items.filter(a=>a.status!=='canceled' && a.paid!=='yes'), a=>a.price);

  $('#rCompleted').textContent = String(completed.length);
  $('#rPaidRevenue').textContent = '$'+paidRevenue.toFixed(2);
  $('#rUnpaid').textContent = '$'+unpaidScheduled.toFixed(2);

  // Monthly for last 6 months
  const now = new Date();
  const months = [];
  for(let i=5;i>=0;i--){
    const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
    const key = d.toISOString().slice(0,7); // YYYY-MM
    months.push(key);
  }
  const byMonth = months.map(m=>{
    const [y,mo] = m.split('-').map(Number);
    const rows = completed.filter(a=> (a.date||'').startsWith(m) );
    const revenue = sum(rows.filter(a=>a.paid==='yes'), a=>a.price);
    return { month: m, count: rows.length, revenue };
  });

  const wrap = $('#rMonthly');
  wrap.innerHTML = byMonth.map(r=>`<div class="row"><div>${r.month}</div><div>${r.count} appts</div><div>$${r.revenue.toFixed(2)}</div></div>`).join('');
}

// CSV Export/Import
btnExport.addEventListener('click', ()=>{
  const rows = load();
  const headers = ['id','created','client','phone','pet','breed','service','price','date','time','location','status','paid','notes'];
  const csv = [headers.join(',')].concat(rows.map(r=> headers.map(h=>csvEscape(r[h]??'')).join(','))).join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'appointments.csv';
  a.click();
});

function csvEscape(v){
  const s = String(v).replace(/"/g,'""');
  return /[",\n]/.test(s) ? `"${s}"` : s;
}

importCsv.addEventListener('change', async (e)=>{
  const file = e.target.files[0]; if(!file) return;
  const text = await file.text();
  const rows = text.split(/\r?\n/).filter(Boolean).map(r=>parseCsvRow(r));
  const headers = rows.shift();
  const idx = Object.fromEntries(headers.map((h,i)=>[h,i]));
  const data = rows.map(cols=>{
    const o = {};
    for(const h of headers) o[h] = cols[idx[h]]||'';
    if(!o.id) o.id = uid();
    return o;
  });
  save(data);
  alert('Import complete');
});

function parseCsvRow(row){
  const out = []; let cur = ''; let inQ = false;
  for(let i=0;i<row.length;i++){
    const c = row[i];
    if(inQ){
      if(c=='"' && row[i+1]=='"'){ cur+='"'; i++; }
      else if(c=='"'){ inQ=false; }
      else cur+=c;
    }else{
      if(c==','){ out.push(cur); cur=''; }
      else if(c=='"'){ inQ=true; }
      else cur+=c;
    }
  }
  out.push(cur);
  return out;
}

// ICS generation
function buildICS(a){
  const pad = n=> (n<10?'0':'')+n;
  const [Y,M,D] = (a.date||'').split('-').map(Number);
  const [h,m] = (a.time||'00:00').split(':').map(Number);
  const start = new Date(Y, (M||1)-1, D||1, h||0, m||0);
  const end = new Date(start.getTime()+30*60*1000); // default 30 min
  const toUtc = (d)=> d.getUTCFullYear()+pad(d.getUTCMonth()+1)+pad(d.getUTCDate())+'T'+pad(d.getUTCHours())+pad(d.getUTCMinutes())+'00Z';
  const dtstamp = toUtc(new Date());
  const dtstart = toUtc(start);
  const dtend = toUtc(end);
  const summary = `Dog Nail Service: ${a.pet? (a.pet+' • '): ''}${a.client}`;
  const loc = a.location||'';
  const desc = `Service: ${a.service||''}\nPrice: ${a.price||''}\nPhone: ${a.phone||''}\nNotes: ${a.notes||''}`;
  return `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//KJ Appointments//EN\nBEGIN:VEVENT\nUID:${a.id}@kj-app\nDTSTAMP:${dtstamp}\nDTSTART:${dtstart}\nDTEND:${dtend}\nSUMMARY:${summary}\nLOCATION:${loc}\nDESCRIPTION:${desc}\nEND:VEVENT\nEND:VCALENDAR`;
}

function downloadIcs(id){
  const a = load().find(x=>x.id===id); if(!a) return;
  const ics = buildICS(a);
  const blob = new Blob([ics], {type:'text/calendar'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `appointment-${a.id}.ics`;
  link.click();
}

// Add-to-calendar button inside modal (for current form fields)
btnAddIcs.addEventListener('click', ()=>{
  const data = Object.fromEntries(new FormData(form).entries());
  if(!data.client || !data.date || !data.time){ alert('Fill client, date, and time first.'); return; }
  const ics = buildICS({ id: uid(), ...data });
  const blob = new Blob([ics], {type:'text/calendar'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'appointment.ics';
  link.click();
});

// Service worker
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('sw.js').catch(console.warn);
  });
}

render();
