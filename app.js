/* Customer Friendly Version ✅ */

const COLUMNS = [
  { name: 'Makan atau Bungkus?', key: 'dine', items: ['Makan', 'Bungkus'] },
  { name: 'Nombor Meja', key: 'table', items: Array.from({ length: 20 }, (_, i) => String(i + 1)) },
  { name: 'Jenis Kuey Tiaw', key: 'jenis', items: ['Kuey Tiaw Goreng', 'Kuey Tiaw Basah'] },
  { name: 'Variasi Kuey Tiaw', key: 'variasi', items: ['Ayam', 'Daging', 'Kerang', 'Udang'] },
  { name: 'Tambahan', key: 'tambahan', items: ['Ayam', 'Daging', 'Kerang', 'Udang', 'Tiada'] },
  { name: 'Telur Mata?', key: 'telur', items: ['Telur Mata', 'Tiada'] },
  { name: 'Kepedasan', key: 'pedas', items: ['Biasa', 'Level 1', 'Level 2'] }
];

const main = document.getElementById('main-section');

let orders = [];
let workingOrder = getDefaultOrder();
let sessionSendCounter = 0;

renderCreateView();

function getDefaultOrder() {
  return {
    dine: 'Makan',
    table: '1',
    jenis: 'Kuey Tiaw Goreng',
    variasi: 'Ayam',
    tambahan: 'Tiada',
    telur: 'Tiada',
    pedas: 'Biasa'
  };
}


/* ---------------- PAGE 1 ---------------- */
function renderCreateView() {
  workingOrder = getDefaultOrder();
  main.innerHTML = '';

  const container = document.createElement('div');
  container.appendChild(buildForm());
  main.appendChild(container);

  const selesai = document.createElement('button');
  selesai.className = 'btn btn-primary w-full mt-4';
  selesai.textContent = 'Selesai ✅';
  selesai.onclick = () => {
    orders.push({ ...workingOrder });
    renderReviewView();
  };
  container.appendChild(selesai);

  activateSelects(null);
}


/* ---------------- PAGE 2 ---------------- */
function renderReviewView() {
  main.innerHTML = '';
  const container = document.createElement('div');

  container.appendChild(buildOrdersList());

  container.appendChild(buildActions(false));
  main.appendChild(container);
}


/* ---------------- PAGE 3 (Updated) ---------------- */
function renderAddOrderView() {
  workingOrder = getDefaultOrder();
  main.innerHTML = '';

  const container = document.createElement('div');
  container.appendChild(buildForm());

  const ul = buildOrdersList(true);
  ul.classList.add("mt-4");
  container.appendChild(ul);

  container.appendChild(buildActions(true));
  main.appendChild(container);

  activateSelects(ul);
}


/* ---------------- PAGE FINAL ---------------- */
function renderFinalView() {
  main.innerHTML = '';
  const container = document.createElement('div');

  orders.forEach((o) => {
    const div = document.createElement('div');
    div.className = 'order-card mb-2';
    div.innerHTML = formatOrderText(o);
    container.appendChild(div);
  });

  const makanFirst = orders.find(o => o.dine === 'Makan');
  const TT = makanFirst ? makanFirst.table.padStart(2,'0') : 'BB';

  const d = new Date();
  const code = `${String(d.getFullYear()).slice(2)}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}${String(d.getSeconds()).padStart(2,'0')}-${TT}-${String(sessionSendCounter).padStart(3,'0')}`;

  const orderNum = document.createElement('div');
  orderNum.className = 'order-card mt-4';
  orderNum.innerHTML = `<strong>No Pesanan:</strong> ${code}`;
  container.appendChild(orderNum);

  main.appendChild(container);
  workingOrder = getDefaultOrder();
}


/* ---------------- BUILDERS ---------------- */
function buildForm() {
  const form = document.createElement('div');
  form.className = 'grid gap-3';

  COLUMNS.forEach(col => {
    const div = makeSelect(col);
    if (col.key === 'table') div.style.display = 'none';
    form.appendChild(div);
  });

  return form;
}

function buildOrdersList(includeWorking = false) {
  const ul = document.createElement('ul');
  ul.className = 'order-list';

  let list = [...orders];
  if (includeWorking) list.push(workingOrder);

  list.forEach((o, i) => {
    const li = document.createElement('li');
    li.className = 'list-none';
    li.innerHTML = `<strong>${i+1})</strong> ${formatOrderText(o)}`;
    ul.appendChild(li);
  });

  return ul;
}

function buildActions(isAdd) {
  const box = document.createElement('div');
  box.className = 'actions mt-4';

  const send = document.createElement('button');
  send.className = 'btn btn-primary';
  send.textContent = 'Hantar Pesanan';
  send.onclick = () => {
    if (isAdd) {
      orders.push({ ...workingOrder });
    }
    sessionSendCounter++;
    renderFinalView();
  };
  box.appendChild(send);

  const dup = document.createElement('button');
  dup.className = 'btn btn-outline';
  dup.textContent = 'Tambah lagi satu yang sama?';
  dup.onclick = () => {

    // ✅ ALWAYS duplicate the last item shown in the list
    const lastShown =
      isAdd
        ? workingOrder                // ✅ we're editing the latest right now
        : orders[orders.length - 1];   // ✅ on review page, use last confirmed order

    orders.push({ ...lastShown });

    isAdd ? renderAddOrderView() : renderReviewView();
  };
  box.appendChild(dup);

  const newBtn = document.createElement('button');
  newBtn.className = 'btn btn-ghost';
  newBtn.textContent = 'Tambah order baru';
  newBtn.onclick = renderAddOrderView;
  box.appendChild(newBtn);

  return box;
}


/* ---------------- HELPERS ---------------- */
function makeSelect(col) {
  const wrap = document.createElement('div');
  wrap.dataset.key = col.key;

  const label = document.createElement('label');
  label.textContent = col.name;

  const sel = document.createElement('select');
  sel.className = 'select select-bordered w-full';
  sel.dataset.key = col.key;

  col.items.forEach(item => {
    const option = document.createElement('option');
    option.value = option.textContent = item;
    sel.appendChild(option);
  });

  // ✅ Force correct default value always
  sel.value = workingOrder[col.key];

  wrap.append(label, sel);
  return wrap;
}

function activateSelects(listEl) {
  document.querySelectorAll('select').forEach(select => {
    select.onchange = () => {
      workingOrder[select.dataset.key] = select.value;
      if (select.dataset.key === 'dine') {
        document.querySelector("[data-key='table']").style.display =
          select.value === 'Makan' ? '' : 'none';
      }
      if (listEl) refreshOrderList(listEl);
    };
  });
}

function refreshOrderList(ul) {
  ul.innerHTML = '';
  [...orders, workingOrder].forEach((o, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${i+1})</strong> ${formatOrderText(o)}`;
    ul.appendChild(li);
  });
}

function formatOrderText(o) {
  let msg = `${o.jenis} ${o.variasi}`;
  if (o.tambahan !== 'Tiada') msg += ` + ${o.tambahan}`;
  if (o.telur !== 'Tiada') msg += ` + ${o.telur}`;
  msg += `, Kepedasan: ${o.pedas}. ${o.dine}`;
  if (o.dine === 'Makan') msg += ` (Meja ${o.table})`;
  return msg;
}
