/* app.js — Prices + delete + exact dropdown labels, total at bottom */

/* Price map (variations) — same for Basah & Goreng */
const VARIAS_PRICES = {
  'Ayam': 6.00,
  'Daging': 7.00,
  'Kerang': 6.00,
  'Udang': 7.00
};

/* Tambahan prices (no Ayam) */
const TAMBAHAN_PRICES = {
  'Daging': 2.00,
  'Kerang': 1.00,
  'Udang': 2.00
};

/* Telur price */
const TELUR_PRICE = {
  'Telur Mata': 1.00
};

const main = document.getElementById('main-section');

let working = getDefault();
let pesanan = [];
let sessionSendCounter = 0;

/* start */
renderPage1();

/* default working order */
function getDefault(){
  return {
    dine: '',
    table: '',
    jenis: '',
    variasi: '',
    tambahan: 'Tiada', // default internal value
    telur: 'Tiada',    // default internal value
    pedas: ''
  };
}

/* ---------- PAGE 1 ---------- */
function renderPage1(){
  main.innerHTML = '';

  const container = document.createElement('div');

  const grid = document.createElement('div');
  grid.className = 'grid gap-3';

  // Build selects in order required
  // 1. Makan Atau Bungkus?
  // 2. No. Meja (hidden unless Makan)
  // 3. Jenis Kuey Tiaw
  // 4. Variasi (display texts with prices)
  // 5. Tambahan (no Ayam; display with + price)
  // 6. Telur Mata? (Tiada / Telur Mata (+ RM 1.00))
  // 7. Kepedasan

  // 1 dine
  grid.appendChild(makeSelectWithPlaceholder('dine', 'Makan Atau Bungkus?', ['Makan','Bungkus']));

  // 2 table
  grid.appendChild(makeSelectWithPlaceholder('table','No. Meja', Array.from({length:20},(_,i)=>String(i+1)), true));

  // 3 jenis (placeholder exact)
  grid.appendChild(makeSelectWithPlaceholder('jenis','Jenis Kuey Tiaw',['Kuey Tiaw Basah','Kuey Tiaw Goreng']));

  // 4 variasi — option text EXACT: "Ayam (RM 6.00)" etc, but values are plain keys
  const variasOptions = [
    { v: 'Ayam', text: 'Ayam (RM 6.00)' },
    { v: 'Daging', text: 'Daging (RM 7.00)' },
    { v: 'Kerang', text: 'Kerang (RM 6.00)' },
    { v: 'Udang', text: 'Udang (RM 7.00)' }
  ];
  grid.appendChild(makeSelectCustom('variasi','Variasi Kuey Tiaw', variasOptions));

  // 5 tambahan — NO Ayam — show exact texts
  const tambahanOptions = [
    { v: 'Tiada', text: 'Tiada' },
    { v: 'Daging', text: 'Daging (+ RM 2.00)' },
    { v: 'Kerang', text: 'Kerang (+ RM 1.00)' },
    { v: 'Udang', text: 'Udang (+ RM 2.00)' }
  ];
  grid.appendChild(makeSelectCustom('tambahan','Tambahan', tambahanOptions));

  // 6 telur mata?
  const telurOptions = [
    { v: 'Tiada', text: 'Tiada' },
    { v: 'Telur Mata', text: 'Telur Mata (+ RM 1.00)' }
  ];
  grid.appendChild(makeSelectCustom('telur','Telur Mata?', telurOptions));

  // 7 kepedasan
  grid.appendChild(makeSelectWithPlaceholder('pedas','Kepedasan',['Biasa','Tahap 1','Tahap 2']));

  container.appendChild(grid);

  // Live summary + plus button
  const liveWrap = document.createElement('div');
  liveWrap.className = 'live-summary mt-3';

  const liveText = document.createElement('div');
  liveText.className = 'live-text flex-1 text-sm text-gray-700';
  liveText.textContent = '';
  liveWrap.appendChild(liveText);

  const plusBtn = document.createElement('button');
  plusBtn.className = 'btn btn-primary';
  plusBtn.textContent = '+';
  plusBtn.onclick = () => {
    const summary = buildSummaryString(working);
    if(!summary) return; // nothing meaningful
    pesanan.push(cloneOrder(working));
    resetWorkingAndSelects();
    renderPesananBox();
    liveText.textContent = '';
  };
  liveWrap.appendChild(plusBtn);
  container.appendChild(liveWrap);

  // Pesanan Keseluruhan label + box
  const label = document.createElement('div');
  label.className = 'mt-4 font-medium';
  label.textContent = 'Pesanan Keseluruhan';
  container.appendChild(label);

  const pesananBox = document.createElement('div');
  pesananBox.className = 'pesanan-box mt-2';
  pesananBox.id = 'pesanan-box';
  container.appendChild(pesananBox);

  // Hantar Pesanan
  const hantar = document.createElement('button');
  hantar.className = 'btn btn-success full-width hantar-btn mt-3';
  hantar.textContent = 'Hantar Pesanan';
  hantar.onclick = () => {
    if(pesanan.length === 0) return alert('Tiada pesanan untuk dihantar.');
    sessionSendCounter++;
    renderPage2();
  };
  container.appendChild(hantar);

  main.appendChild(container);

  // attach change handlers after DOM appended
  attachSelectHandlers(liveText);

  // initial render
  renderPesananBox();
}

/* Helper to create select with placeholder. hideTable param determines initial hidden */
function makeSelectWithPlaceholder(key, placeholder, items, hideTable=false){
  const wrap = document.createElement('div');
  const sel = document.createElement('select');
  sel.className = 'select select-bordered w-full';
  sel.dataset.key = key;

  const ph = document.createElement('option');
  ph.value = '';
  ph.disabled = true;
  ph.selected = true;
  ph.textContent = placeholder;
  sel.appendChild(ph);

  items.forEach(it=>{
    const opt = document.createElement('option');
    opt.value = it;
    opt.textContent = it;
    sel.appendChild(opt);
  });

  // defaults: Tambahan & Telur handled via custom maker; for others keep blank
  if(hideTable) sel.style.display = 'none';
  wrap.appendChild(sel);
  return wrap;
}

/* Helper for custom options where text != value */
function makeSelectCustom(key, placeholder, options){
  const wrap = document.createElement('div');
  const sel = document.createElement('select');
  sel.className = 'select select-bordered w-full';
  sel.dataset.key = key;

  const ph = document.createElement('option');
  ph.value = '';
  ph.disabled = true;
  ph.selected = true;
  ph.textContent = placeholder;
  sel.appendChild(ph);

  options.forEach(op=>{
    const opt = document.createElement('option');
    opt.value = op.v;
    opt.textContent = op.text;
    sel.appendChild(opt);
  });

  // For Tambahan & Telur we want placeholder visible (not Tiada)
  // But internal default already set in working object
  wrap.appendChild(sel);
  return wrap;
}

/* attach handlers to selects to update working and live summary */
function attachSelectHandlers(liveTextEl){
  document.querySelectorAll('select').forEach(s=>{
    const key = s.dataset.key;
    // set defaults for tambahan/telur value to Tiada internally but keep placeholder on UI
    if(key === 'tambahan' && working.tambahan === 'Tiada') {
      // keep placeholder shown — user must pick if they want; internal remains Tiada until change
      s.value = '';
    }
    if(key === 'telur' && working.telur === 'Tiada') {
      s.value = '';
    }

    s.onchange = () => {
      const k = s.dataset.key;
      working[k] = s.value || working[k]; // if user selects placeholder (shouldn't), keep existing
      // show/hide table
      if(k === 'dine'){
        const tableSel = document.querySelector("select[data-key='table']");
        if(s.value === 'Makan') tableSel.style.display = '';
        else {
          tableSel.style.display = 'none';
          tableSel.value = '';
          working.table = '';
        }
      }
      // For tambahan/telur: if user picks nothing, keep Tiada; if picks something, store it
      if(k === 'tambahan' && !s.value) working.tambahan = 'Tiada';
      if(k === 'telur' && !s.value) working.telur = 'Tiada';

      // live summary update if element provided
      if(liveTextEl){
        liveTextEl.textContent = buildSummaryString(working) || '';
      }
    };
  });
}

/* Build summary string exactly as requested.
   Skip Tambahan/Telur if Tiada or empty.
   Example: "Makan, Meja 20 - Kuey Tiaw Basah Ayam + Daging + Telur Mata, Pedas Tahap 1"
*/
function buildSummaryString(o){
  // if nothing selected meaningful yet return empty
  if(!o.dine && !o.jenis && !o.variasi && !o.pedas) return '';

  let head = o.dine || '';
  if(o.dine === 'Makan' && o.table) head += `, Meja ${o.table}`;

  // product part: jenis + variasi
  const prodParts = [];
  if(o.jenis) prodParts.push(o.jenis);
  if(o.variasi) prodParts.push(o.variasi);

  // extras: tambahan (skip Tiada), telur (skip Tiada)
  const extras = [];
  if(o.tambahan && o.tambahan !== 'Tiada') extras.push(o.tambahan);
  if(o.telur && o.telur !== 'Tiada') extras.push(o.telur);
  let prod = prodParts.join(' ');
  if(extras.length) prod += ' ' + extras.map(x => `+ ${x}`).join(' ');

  const pedasText = o.pedas ? `, Pedas ${o.pedas}` : '';

  if(!prod) return head.trim();
  return `${head} - ${prod}${pedasText}`.trim();
}

function cloneOrder(o){
  return JSON.parse(JSON.stringify(o));
}

function resetWorkingAndSelects(){
  working = getDefault();
  document.querySelectorAll('select').forEach(s => {
    s.selectedIndex = 0;
    if(s.dataset.key === 'table') s.style.display = 'none';
  });
}

/* Pesanan box render with numbered list, [+1] and [-] delete (dup inserts below tapped) */
function renderPesananBox(){
  const box = document.getElementById('pesanan-box');
  if(!box) return;
  box.innerHTML = '';

  pesanan.forEach((p, idx) => {
    const row = document.createElement('div');
    row.className = 'order-line';

    const left = document.createElement('div');
    left.className = 'text-sm text-gray-800';
    left.innerHTML = `<strong>${idx+1})</strong> ${buildSummaryString(p)}`;

    const right = document.createElement('div');
    right.style.display = 'flex';
    right.style.gap = '8px';

    // +1 button: insert duplicate below this index
    const dup = document.createElement('button');
    dup.className = 'btn btn-sm btn-outline dup-btn';
    dup.textContent = '+1';
    dup.onclick = () => {
      pesanan.splice(idx+1, 0, cloneOrder(p)); // insert right below
      renderPesananBox();
    };

    // delete button
    const del = document.createElement('button');
    del.className = 'btn btn-sm del-btn';
    del.textContent = '-';
    del.onclick = () => {
      pesanan.splice(idx, 1);
      renderPesananBox();
    };

    right.appendChild(dup);
    right.appendChild(del);
    row.appendChild(left);
    row.appendChild(right);
    box.appendChild(row);
  });

  // total at bottom (Option B: total only)
  const total = calculateTotal();
  const totalDiv = document.createElement('div');
  totalDiv.className = 'pesanan-total';
  totalDiv.textContent = `RM ${total.toFixed(2)}`;
  box.appendChild(totalDiv);

  box.scrollTop = box.scrollHeight;
}

/* Calculate price sum for all items in pesanan */
function calculateTotal(){
  let sum = 0;
  pesanan.forEach(o => {
    // base from varias
    const base = VARIAS_PRICES[o.variasi] || 0;
    sum += base;
    // tambahan
    if(o.tambahan && o.tambahan !== 'Tiada'){
      sum += TAMBAHAN_PRICES[o.tambahan] || 0;
    }
    // telur
    if(o.telur && o.telur !== 'Tiada'){
      sum += TELUR_PRICE[o.telur] || 0;
    }
  });
  return sum;
}

/* ---------- PAGE 2 (final) ---------- */
function renderPage2(){
  main.innerHTML = '';
  const container = document.createElement('div');

  const title = document.createElement('h2');
  title.className = 'text-lg font-semibold mb-3';
  title.textContent = 'Ringkasan Pesanan';
  container.appendChild(title);

  pesanan.forEach((p, idx) => {
    const div = document.createElement('div');
    div.className = 'order-card mb-2';
    div.innerHTML = `<strong>${idx+1})</strong> ${buildSummaryString(p)}`;
    container.appendChild(div);
  });

  // total line before order number
  const total = calculateTotal();
  const totalDiv = document.createElement('div');
  totalDiv.className = 'order-card mt-3';
  totalDiv.innerHTML = `<strong>Jumlah Bayaran Keseluruhan:</strong> RM ${total.toFixed(2)}`;
  container.appendChild(totalDiv);

  // order number YYMMDD-HHMMSS-TT-NNN (TT = first Makan table or BB)
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  const HH = String(d.getHours()).padStart(2,'0');
  const MM = String(d.getMinutes()).padStart(2,'0');
  const SS = String(d.getSeconds()).padStart(2,'0');

  const firstMakan = pesanan.find(p => p.dine === 'Makan');
  const TT = firstMakan && firstMakan.table ? firstMakan.table.padStart(2,'0') : 'BB';
  const NNN = String(sessionSendCounter).padStart(3,'0');

  const orderNo = `${yy}${mm}${dd}-${HH}${MM}${SS}-${TT}-${NNN}`;
  const numDiv = document.createElement('div');
  numDiv.className = 'order-card mt-3';
  numDiv.innerHTML = `<strong>No. Pesanan:</strong> ${orderNo}`;
  container.appendChild(numDiv);

  main.appendChild(container);
}

/* End of file */
