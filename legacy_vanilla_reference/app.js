'use strict';
/* ============================================================
   blinkit grocery — frontend SPA
   Talks to server.js over /api. All state (cart, coupons,
   addresses, orders) lives on the backend; this file renders
   it with the creamy-green design system from index.html.
   ============================================================ */

const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const money = n => '₹' + Number(n).toLocaleString('en-IN');

/* ---------- API client ---------- */
let TOKEN = localStorage.getItem('bk_token') || '';
async function api(path, opts = {}){
  let res;
  try{
    res = await fetch('/api' + path, {
      method: opts.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(TOKEN ? {Authorization: 'Bearer ' + TOKEN} : {}),
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
  }catch(e){
    throw new Error('Server unreachable — start it with: node server.js');
  }
  let data = {};
  try{ data = await res.json(); }catch(e){}
  if(!res.ok){
    const err = new Error(data.error || ('Request failed (' + res.status + ')'));
    err.status = res.status;
    throw err;
  }
  return data;
}

/* ---------- state ---------- */
const S = {
  online: true,
  cats: [], products: [], pmap: {},
  cart: {}, summary: null, coupon: null,
  user: null, tmpPhone: '',
  addresses: [], addrId: localStorage.getItem('bk_addr') || null,
  orders: [],
  view: 'home', cat: null, query: '', modal: null,
  pay: 'upi',
  eta: 8 + Math.floor(Math.random() * 9),
  lastOrder: null,
};

/* ============================================================
   ICONS & FLAT PRODUCT ART (rendered client-side from catalog)
   ============================================================ */
const I = {
  leaf:'<path d="M4 20c0-9 6-15 15-16-1 9-7 15-16 16Z"/><path d="M4 20c4-6 8-9 12-11"/>',
  milk:'<path d="M9 3h6v4l2 2v12H7V9l2-2V3Z"/><path d="M9 3h6"/>',
  grain:'<path d="M12 21c0-4 2-7 6-9-1 4-3 7-6 9Z"/><path d="M12 21c0-4-2-7-6-9 1 4 3 7 6 9Z"/><path d="M12 21V10"/>',
  chips:'<path d="M6 8h12l-1.5 11h-9L6 8Z"/><path d="M8 8c0-3 4-3 4 0M12 8c0-3 4-3 4 0"/>',
  bottle:'<path d="M10 3h4v3l1 2v13H9V8l1-2V3Z"/><path d="M9 11h6"/>',
  cup:'<path d="M4 9h12v8a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5V9Z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8 6c0-1 .8-1.5 1.6-1.5S11 5 11 6M13 6c0-1 .8-1.5 1.6-1.5S16 5 16 6"/>',
  spray:'<rect x="9" y="9" width="6" height="12" rx="1.5"/><path d="M11 9V5h2v4"/><path d="M13 5h6v4h-2"/>',
  soap:'<rect x="7" y="8" width="10" height="10" rx="2.5"/><path d="M10 8V4a2 2 0 0 1 4 0v4"/>',
  snow:'<path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4"/>',
  choco:'<rect x="5" y="8" width="14" height="11" rx="2"/><path d="M9.7 8v11M14.3 8v11"/>',
  timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/>',
  pin:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  bolt:'<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/>',
  shield:'<path d="M12 3 4 7v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V7l-8-4Z"/><path d="m9 12 2 2 4-4"/>',
  tag:'<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9Z"/><circle cx="8" cy="8" r="1.4"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  arrow:'<path d="M19 12H5m6-6-6 6 6 6"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  bag:'<path d="M6 7h12l1 13H5L6 7Z"/><path d="M9 7V6a3 3 0 0 1 6 0v1"/>',
};
const ic = (name, size=30, sw=1.8) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${I[name]||I.leaf}</svg>`;

function artSVG(a){
  const {t, c1, c2, tint} = a || {};
  const tile = `<rect width="120" height="120" rx="16" fill="${tint||'#EAF3E2'}"/>`;
  const shadow = `<ellipse cx="60" cy="107" rx="33" ry="5" fill="#1D2A1E" opacity=".07"/>`;
  const S2 = {
    banana: `<path d="M26 76 Q34 34 78 42" stroke="${c1}" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M26 76 Q34 34 78 42" stroke="${c2}" stroke-width="13" fill="none" stroke-linecap="round" opacity=".28" transform="translate(0 6)"/><circle cx="78" cy="42" r="3" fill="#6B4E20"/><path d="M26 76 q-4-7-5-13" stroke="#4E8B4C" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    fruit: `<circle cx="60" cy="66" r="30" fill="${c1}"/><ellipse cx="48" cy="54" rx="9" ry="12" fill="#fff" opacity=".35" transform="rotate(-24 48 54)"/><path d="M60 36 q3-11 12-13" stroke="#5F8F4B" stroke-width="4.5" fill="none" stroke-linecap="round"/><ellipse cx="77" cy="22" rx="9" ry="4.6" fill="${c2}" transform="rotate(-16 77 22)"/>`,
    potato: `<ellipse cx="58" cy="66" rx="34" ry="24" fill="${c1}"/><ellipse cx="47" cy="57" rx="8" ry="11" fill="#fff" opacity=".3" transform="rotate(-20 47 57)"/><circle cx="70" cy="60" r="2.4" fill="${c2}"/><circle cx="62" cy="74" r="2" fill="${c2}"/><circle cx="76" cy="72" r="1.7" fill="${c2}"/>`,
    leaf: `<ellipse cx="47" cy="72" rx="15" ry="26" fill="${c1}" transform="rotate(-24 47 72)"/><ellipse cx="63" cy="75" rx="15" ry="27" fill="${c2}" transform="rotate(6 63 75)"/><ellipse cx="79" cy="70" rx="14" ry="24" fill="${c1}" transform="rotate(26 79 70)"/><path d="M47 72 q10 14 22 8" stroke="#3A6B3A" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    carton: `<path d="M38 46 h44 l-4 -14 h-36 Z" fill="${c1}"/><rect x="34" y="46" width="52" height="42" rx="7" fill="${c1}"/><rect x="34" y="60" width="52" height="15" fill="#fff" opacity=".82"/><ellipse cx="49" cy="46" rx="5" ry="2.6" fill="#fff" opacity=".45"/>`,
    tub: `<path d="M40 54 h40 v20 q0 9 -9 9 h-22 q-9 0 -9 -9 Z" fill="${c1}"/><ellipse cx="60" cy="54" rx="20" ry="6.5" fill="${c2}"/><rect x="40" y="64" width="40" height="12" fill="#fff" opacity=".5"/>`,
    eggs: `<rect x="32" y="58" width="56" height="22" rx="7" fill="${c1}"/><rect x="32" y="58" width="56" height="9" rx="4.5" fill="${c2}"/><ellipse cx="46" cy="57" rx="9" ry="12" fill="#FBF8EF" stroke="#E4D9C0" stroke-width="1.5"/><ellipse cx="62" cy="55" rx="9" ry="12" fill="#FBF8EF" stroke="#E4D9C0" stroke-width="1.5"/><ellipse cx="78" cy="57" rx="9" ry="12" fill="#FBF8EF" stroke="#E4D9C0" stroke-width="1.5"/>`,
    bread: `<path d="M32 58 q0 -14 12 -14 h32 q12 0 12 14 v8 q0 14 -10 14 h-36 q-10 0 -10 -14 Z" fill="${c1}"/><path d="M44 50 q-3 8 -3 14 M60 47 v17 M76 50 q3 8 3 14" stroke="${c2}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`,
    sack: `<path d="M36 42 q12 -16 24 -16 t24 16 l-3 36 q0 6 -5 6 h-32 q-5 0 -5 -6 Z" fill="${c1}"/><rect x="52" y="26" width="16" height="10" rx="4" fill="${c2}"/><rect x="36" y="62" width="48" height="14" fill="#fff" opacity=".55"/>`,
    packet: `<rect x="34" y="34" width="52" height="58" rx="9" fill="${c1}"/><path d="M34 46 h52 M34 80 h52" stroke="${c2}" stroke-width="4.5" opacity=".45"/><ellipse cx="60" cy="63" rx="17" ry="12" fill="#fff" opacity=".85"/>`,
    bottle: `<rect x="44" y="42" width="32" height="44" rx="9" fill="${c1}"/><rect x="51" y="30" width="18" height="14" rx="4" fill="${c1}"/><rect x="54" y="24" width="12" height="8" rx="3" fill="${c2}"/><rect x="44" y="56" width="32" height="16" fill="#fff" opacity=".8"/><rect x="50" y="50" width="7" height="30" rx="3.5" fill="#fff" opacity=".28"/>`,
    box: `<path d="M34 46 l11 -12 h30 l11 12 Z" fill="${c2}"/><rect x="34" y="46" width="52" height="44" rx="6" fill="${c1}"/><rect x="42" y="56" width="36" height="22" rx="4" fill="#fff" opacity=".8"/><rect x="42" y="84" width="36" height="6" fill="#fff" opacity=".35"/>`,
    pump: `<rect x="40" y="48" width="40" height="38" rx="8" fill="${c1}"/><rect x="54" y="32" width="12" height="18" rx="4" fill="${c2}"/><rect x="63" y="28" width="17" height="8" rx="3.5" fill="${c2}"/><rect x="40" y="60" width="40" height="14" fill="#fff" opacity=".75"/>`,
    tube: `<rect x="30" y="50" width="60" height="28" rx="13" fill="${c1}"/><rect x="30" y="50" width="60" height="9" rx="4.5" fill="#fff" opacity=".5"/><rect x="84" y="54" width="14" height="20" rx="4" fill="${c2}"/><path d="M44 64 q8 -7 16 0 t16 0" stroke="${c2}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".55"/>`,
    bar: `<rect x="38" y="44" width="44" height="44" rx="8" fill="${c1}"/><path d="M52.7 44 v44 M67.3 44 v44" stroke="${c2}" stroke-width="3" opacity=".6"/><rect x="38" y="52" width="44" height="16" fill="#fff" opacity=".8"/><path d="M48 60 q6 -6 12 0 t12 0" stroke="${c2}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    block: `<rect x="38" y="46" width="44" height="38" rx="7" fill="${c1}" stroke="#E4E0D2" stroke-width="2"/><rect x="38" y="54" width="44" height="13" fill="${c2}" opacity=".85"/><circle cx="51" cy="46" r="3.4" fill="#9FC3E0"/><circle cx="64" cy="46" r="2.6" fill="#9FC3E0"/><circle cx="74" cy="46" r="2" fill="#9FC3E0"/>`,
  };
  return `<svg viewBox="0 0 120 120" aria-hidden="true">${tile}${shadow}${S2[t]||S2.fruit}</svg>`;
}
const thumbHTML = p => `<span class="th">${artSVG(p.art)}</span>`;

/* ============================================================
   DERIVED HELPERS
   ============================================================ */
const cartCount = () => Object.values(S.cart).reduce((a,b) => a+b, 0);
const offPct = p => p.mrp > p.price ? Math.round((1 - p.price/p.mrp) * 100) : 0;
const catOf = id => S.cats.find(c => c.id === id);
const addrSel = () => S.addresses.find(a => a.id === S.addrId) || S.addresses[0];

function applyCart(c){
  if(!c) return;
  S.cart = {};
  (c.items || []).forEach(it => { S.cart[it.id] = it.qty; });
  S.summary = c.summary || null;
  S.coupon = c.coupon || null;
  if(c.addresses) S.addresses = c.addresses;
  if(c.addrId && !localStorage.getItem('bk_addr')) S.addrId = c.addrId;
}

let toastT;
function toast(msg){
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ============================================================
   SMALL UI PIECES
   ============================================================ */
function ctlHTML(p){
  const q = S.cart[p.id] || 0;
  if(p.stock === 0) return `<button class="add-btn" disabled style="opacity:.45;cursor:not-allowed">OUT OF STOCK</button>`;
  if(!q) return `<button class="add-btn" data-action="add" data-id="${p.id}">ADD</button>`;
  return `<div class="stepper" role="group" aria-label="Quantity">
    <button data-action="dec" data-id="${p.id}" aria-label="Decrease quantity">−</button>
    <b>${q}</b>
    <button data-action="inc" data-id="${p.id}" aria-label="Increase quantity">+</button>
  </div>`;
}

function pcardHTML(p){
  const off = offPct(p);
  return `<div class="pcard">
    <div class="pimg" data-action="open-pm" data-id="${p.id}" role="button" tabindex="0" aria-label="${p.name} details">
      ${artSVG(p.art)}
      ${off ? `<span class="badge">${off}% OFF</span>` : ''}
      ${p.stock === 0 ? `<span class="badge" style="background:var(--danger);color:#fff;left:auto;right:8px">OUT OF STOCK</span>` : (p.stock <= p.reorder ? `<span class="badge" style="background:var(--yellow);color:var(--yellow-ink);left:auto;right:8px">ONLY ${p.stock} LEFT</span>` : '')}
      <span class="eta">${ic('timer',11,2.2)} ${8 + (p.id.charCodeAt(2) % 9)} MINS</span>
    </div>
    <div class="pbody">
      <h4 data-action="open-pm" data-id="${p.id}" role="button" tabindex="0">${p.name}</h4>
      <span class="unit">${p.unit}</span>
      <div class="prow">
        <span class="price">${money(p.price)}</span>
        ${p.mrp > p.price ? `<s class="mrp">${money(p.mrp)}</s>` : ''}
      </div>
      <div class="ctl" data-ctl="${p.id}">${ctlHTML(p)}</div>
    </div>
  </div>`;
}

/* ============================================================
   VIEWS
   ============================================================ */
const $view = $('#view');

function heroHTML(){
  return `<section class="wrap">
    <div class="hero">
      <div>
        <span class="eyebrow">${ic('tag',13,2.4)} UP TO 40% OFF</span>
        <h1>Daily groceries, delivered in minutes</h1>
        <p>Fresh produce, dairy, snacks and household essentials — at your door before your chai gets cold.</p>
        <a class="hero-cta" href="#" data-action="scroll-shop">Shop now ${ic('arrow',15,2.4)}</a>
      </div>
      <svg class="hero-art" viewBox="0 0 170 150" aria-hidden="true">
        <ellipse cx="85" cy="136" rx="62" ry="9" fill="#3E7A4A" opacity=".14"/>
        <path d="M40 78 h90 l-10 52 h-70 Z" fill="#F7F4E9" stroke="#DCE8D2" stroke-width="2.5"/>
        <path d="M62 78 q-4 -26 23 -26 t23 26" fill="none" stroke="#DCE8D2" stroke-width="6" stroke-linecap="round"/>
        <circle cx="56" cy="64" r="12" fill="#D95555"/><path d="M56 52 v-6" stroke="#5F8F4B" stroke-width="3" stroke-linecap="round"/>
        <circle cx="84" cy="60" r="11" fill="#E0AF2E"/>
        <path d="M108 66 q6 -16 17 -14" stroke="#F2C94C" stroke-width="7" fill="none" stroke-linecap="round"/>
        <rect x="104" y="96" width="18" height="26" rx="3" fill="#5B8FC4"/><path d="M108 96 v-6 h10 v6" fill="#3E6E9E"/>
        <path d="M66 44 q6 -14 18 -10" stroke="#4E8B4C" stroke-width="5" fill="none" stroke-linecap="round"/>
      </svg>
    </div>
  </section>`;
}

function homeHTML(){
  const byCat = id => S.products.filter(p => p.cat === id);
  const best = S.products.filter(p => p.best).slice(0, 12);
  const rows = [
    {title:'Best Sellers', list: best},
    {title:'Fruits & Vegetables', list: byCat('fv')},
    {title:'Dairy & Breakfast', list: byCat('dairy')},
    {title:'Snacks & Munchies', list: byCat('snacks')},
    {title:'Cold Drinks & Juices', list: byCat('drinks')},
    {title:'Household Essentials', list: byCat('house')},
    {title:'Instant & Frozen', list: byCat('frozen')},
  ].filter(r => r.list.length);

  return `
  ${heroHTML()}
  <div class="wrap">
    <div class="offers" aria-label="Offers">
      <button class="offer-chip" data-action="apply-coupon" data-code="GREEN75"><span class="pct">₹75 OFF</span> on orders above ₹749 — GREEN75</button>
      <button class="offer-chip" data-action="apply-coupon" data-code="GREEN50"><span class="pct">₹50 OFF</span> on orders above ₹499 — GREEN50</button>
      <button class="offer-chip" data-action="scroll-shop"><span class="pct">FREE</span> delivery above ₹199</button>
    </div>

    <section class="sec" id="shop">
      <div class="sec-head"><h2>Shop by category</h2></div>
      <div class="cat-grid">
        ${S.cats.map(c => `
          <a class="cat-tile" href="#" data-nav="category" data-cat="${c.id}">
            <span class="cat-ic">${ic(c.icon,30)}</span>
            <span>${c.name}</span>
          </a>`).join('')}
      </div>
    </section>

    ${rows.map(r => `
      <section class="sec">
        <div class="sec-head">
          <h2>${r.title}</h2>
          <a href="#" data-nav="category" data-cat="${r.list[0].cat}">See all →</a>
        </div>
        <div class="car-row">${r.list.map(pcardHTML).join('')}</div>
      </section>`).join('')}
    <section class="sec" id="reorder-sec" style="display:none">
      <div class="sec-head"><h2>Order again</h2><a href="#" data-nav="orders">View all orders →</a></div>
      <div class="car-row" id="reorder-row"></div>
    </section>
  </div>`;
}

function categoryHTML(cat){
  const list = S.products.filter(p => p.cat === cat.id);
  return `<div class="wrap page">
    <a class="back-link" href="#" data-nav="home">${ic('arrow',15,2.4)} Back to home</a>
    <h1>${cat.name}</h1>
    <p class="sub">${list.length} items · delivered in minutes</p>
    <div class="body pgrid">${list.map(pcardHTML).join('')}</div>
  </div>`;
}

function searchHTML(q){
  const list = S.products.filter(p => (p.name + ' ' + p.unit).toLowerCase().includes(q));
  return `<div class="wrap page">
    <a class="back-link" href="#" data-nav="home">${ic('arrow',15,2.4)} Back to home</a>
    <h1>Results for “${q}”</h1>
    <p class="sub">${list.length} item${list.length===1?'':'s'} found</p>
    <div class="body">${
      list.length
        ? `<div class="pgrid">${list.map(pcardHTML).join('')}</div>`
        : `<div class="empty">${ic('search',64,1.6)}<h2>Nothing found</h2><p>Try “milk”, “atta”, “chips” or browse categories.</p></div>`
    }</div>
  </div>`;
}

function ordersHTML(){
  return `<div class="wrap page">
    <a class="back-link" href="#" data-nav="home">${ic('arrow',15,2.4)} Back to home</a>
    <h1>My Orders</h1>
    <p class="sub">${S.orders.length} order${S.orders.length===1?'':'s'} placed</p>
    <div class="body">${
      S.orders.length ? S.orders.map(o => `
      <div class="ord-card">
        <div class="ord-top">
          <b>${o.id}</b>
          <span class="st">${o.status}</span>
        </div>
        <div class="ord-items">
          ${o.items.map(i => `<span>${i.q} × ${i.name}</span>`).join('')}
        </div>
        ${trackHTML(o)}
        <div style="margin-top:10px"><button class="mini-btn" data-action="reorder" data-id="${o.id}">Order again</button></div>
        <div class="ord-meta">
          <span>${new Date(o.createdAt).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}</span>
          <span>${o.addressLabel}</span>
          <span><b style="color:var(--ink)">${money(o.total)}</b></span>
        </div>
      </div>`).join('')
      : `<div class="empty">${ic('bag',64,1.6)}<h2>No orders yet</h2><p>Your orders will show up here after checkout.</p></div>`
    }</div>
  </div>`;
}

/* ---------- checkout ---------- */
function checkoutHTML(){
  const b = S.summary || {itemTotal:0, delivery:0, handling:0, discount:0, total:0};
  const a = addrSel();
  const progress = Math.min(100, Math.round(b.itemTotal / 199 * 100));
  return `<div class="wrap page">
    <a class="back-link" href="#" data-nav="home">${ic('arrow',15,2.4)} Continue shopping</a>
    <h1>Checkout</h1>
    <p class="sub">Delivery in ${S.eta}–${S.eta+6} mins · free above ₹199</p>
    <div class="body ck-grid">
      <div>
        <div class="ck-card">
          <h2><span class="n">1</span> Delivery address</h2>
          <div id="addr-list">
            ${S.addresses.map(x => `
              <div class="addr-row ${x.id===S.addrId?'sel':''}" data-action="sel-addr" data-id="${x.id}" role="radio" aria-checked="${x.id===S.addrId}" tabindex="0">
                <span class="rad"></span>
                <span><b>${x.label} <span class="tag">${x.label==='Home'?'DEFAULT':'SAVED'}</span></b><p>${x.line}</p></span>
              </div>`).join('')}
          </div>
          <button class="new-addr" id="new-addr-btn">+ Add new address</button>
          <form class="addr-form" id="addr-form" style="display:none">
            <input class="inp" id="addr-label" placeholder="Label (e.g. Hostel)" required>
            <textarea class="inp" id="addr-line" rows="2" placeholder="Flat / street / area / city / PIN" required></textarea>
            <button class="btn" type="submit">Save address</button>
          </form>
        </div>

        <div class="ck-card">
          <h2><span class="n">2</span> Payment method</h2>
          <div class="pay-row sel" data-action="sel-pay" data-id="upi" role="radio" aria-checked="true" tabindex="0">
            <span class="rad"></span><span><b>UPI</b><small>GPay, PhonePe, Paytm</small></span>
          </div>
          <div class="pay-row" data-action="sel-pay" data-id="card" role="radio" aria-checked="false" tabindex="0">
            <span class="rad"></span><span><b>Credit / Debit Card</b><small>Visa, Mastercard, RuPay</small></span>
          </div>
          <div class="pay-row" data-action="sel-pay" data-id="cod" role="radio" aria-checked="false" tabindex="0">
            <span class="rad"></span><span><b>Cash on Delivery</b><small>Pay when your order arrives</small></span>
          </div>
        </div>
      </div>

      <div class="ck-card bill">
        <h2>Bill details</h2>
        <div class="bill-row"><span>Item total (${cartCount()} items)</span><b>${money(b.itemTotal)}</b></div>
        <div class="bill-row"><span>Delivery fee</span>${b.delivery ? `<b>${money(b.delivery)}</b>` : `<span class="free">FREE</span>`}</div>
        <div class="bill-row"><span>Handling charge</span><b>${money(b.handling)}</b></div>
        ${b.discount ? `<div class="bill-row"><span>Coupon (${S.coupon})</span><span class="free">− ${money(b.discount)}</span></div>` : ''}
        <div class="bill-total"><span>To pay</span><span>${money(b.total)}</span></div>
        <div id="coupon-area">
          ${S.coupon
            ? `<div class="coupon-ok"><span>${S.coupon} applied</span><button data-action="rm-coupon">Remove</button></div>`
            : `<div class="coupon-row"><input id="coupon-in" placeholder="Coupon code (GREEN50 / GREEN75)" aria-label="Coupon code"><button class="btn ghost" data-action="try-coupon">Apply</button></div>`}
        </div>
        ${b.itemTotal < 199 ? `
          <div class="delivery-note">Add ${money(199 - b.itemTotal)} more for <b style="color:var(--green-deep)">FREE delivery</b></div>
          <div class="free-bar"><i style="width:${progress}%"></i></div>` : `
          <div class="delivery-note" style="color:var(--green-deep);font-weight:700">✓ You’ve unlocked FREE delivery</div>`}
        <button class="btn wide" style="margin-top:16px" data-action="place-order" id="place-btn" ${cartCount()?'':'disabled'}>Place order · ${money(b.total)}</button>
        <div class="delivery-note" style="text-align:center">Demo checkout — no real payment happens.</div>
      </div>
    </div>
  </div>`;
}

function successHTML(order){
  const {id, total, addressLabel, paymentLabel, eta, items} = order;
  return `<div class="wrap page">
    <div class="success">
      <div class="check-pop">${ic('check',42,2.6)}</div>
      <h1>Order placed!</h1>
      <div class="order-id">${id}</div>
      <p class="eta-note">${ic('timer',14,2.2)} Arriving in <b>${eta}–${eta+4} mins</b> — we’ve already started packing.</p>
      <div class="ord-summary">
        <div class="bill-row"><span>Deliver to</span><b>${addressLabel}</b></div>
        <div class="bill-row"><span>Payment</span><b>${paymentLabel}</b></div>
        <div class="bill-row"><span>Items</span><b>${items.reduce((a,i) => a + i.q, 0)}</b></div>
        <div class="bill-total"><span>Total paid</span><span>${money(total)}</span></div>
      </div>
      <div class="actions">
        <button class="btn" data-action="goto-orders">View my orders</button>
        <button class="btn ghost" data-nav="home">Continue shopping</button>
      </div>
    </div>
  </div>`;
}

/* ============================================================
   RENDER
   ============================================================ */
function render(){
  let html = '';
  if(S.view === 'home')      html = homeHTML();
  else if(S.view === 'category'){
    const cat = catOf(S.cat);
    html = cat ? categoryHTML(cat) : homeHTML();
  }
  else if(S.view === 'search')   html = searchHTML(S.query);
  else if(S.view === 'orders')   html = ordersHTML();
  else if(S.view === 'checkout') html = checkoutHTML();
  else if(S.view === 'success' && S.lastOrder) html = successHTML(S.lastOrder);
  else html = homeHTML();
  $view.innerHTML = html;
  syncCartUI();
  if(S.view === 'home') loadHomeReorder();
  window.scrollTo({top:0, behavior:'auto'});
}
function go(view, opts = {}){
  S.view = view;
  S.cat = opts.cat || null;
  render();
}

/* ============================================================
   SYNC (header, cards, drawer, mobile bar)
   ============================================================ */
function syncLoc(){
  const a = addrSel();
  if(a){
    $('#loc-label').textContent = a.label;
    $('#loc-line').textContent = a.line;
  }
}
function syncUser(){
  if(S.role === 'admin'){
    $('#login-text').textContent = 'Admin';
    $('#login-face').innerHTML = `<span class="avatar" style="width:30px;height:30px;font-size:12px;background:var(--green-deep);color:#F2F7EE">A</span>`;
    return;
  }
  if(S.role === 'shop' && S.shop){
    $('#login-text').textContent = String(S.shop.name).slice(0, 14);
    $('#login-face').innerHTML = `<span class="avatar" style="width:30px;height:30px;font-size:12px;background:var(--yellow);color:var(--yellow-ink)">${String(S.shop.name)[0].toUpperCase()}</span>`;
    return;
  }
  if(S.user){
    $('#login-text').textContent = 'Hi, ' + S.user.name.split(' ')[0];
    $('#login-face').innerHTML = `<span class="avatar" style="width:30px;height:30px;font-size:12px">${S.user.name[0].toUpperCase()}</span>`;
  }
}
function syncCartUI(){
  const n = cartCount();
  $('#cart-count').textContent = n;
  $('#cart-n').textContent = n ? `(${n} item${n===1?'':'s'})` : '';
  $$('[data-ctl]').forEach(el => {
    const p = S.pmap[el.dataset.ctl];
    if(p) el.innerHTML = ctlHTML(p);
  });
  if(S.modal && $('#pm').classList.contains('open')){
    const p = S.pmap[S.modal];
    if(p){
      const ctl = $('#pm-ctl');
      if(ctl){
        ctl.innerHTML = ctlHTML(p);
        const tot = $('#pm-tot');
        if(tot) tot.innerHTML = S.cart[p.id] ? `Item total: <b>${money(p.price * S.cart[p.id])}</b>` : '';
      }
    }
  }
  const mc = $('#mobile-cart');
  const itemTotal = S.summary ? S.summary.itemTotal : 0;
  if(n){
    mc.classList.add('show');
    $('#mc-items').textContent = `${n} item${n===1?'':'s'}`;
    $('#mc-total').textContent = `· ${money(itemTotal)}`;
  } else mc.classList.remove('show');
  if($('#cart-drawer').classList.contains('open')) renderCart();
}
function openCart(){
  $('#cart-drawer').classList.add('open');
  $('#cart-ovl').classList.add('show');
  document.body.style.overflow = 'hidden';
  renderCart();
}
function closeCart(){
  $('#cart-drawer').classList.remove('open');
  $('#cart-ovl').classList.remove('show');
  document.body.style.overflow = '';
}
function renderCart(){
  const body = $('#cart-body');
  const foot = $('#cart-foot');
  const items = Object.entries(S.cart).map(([id, qty]) => ({p: S.pmap[id], qty})).filter(x => x.p);
  if(!items.length){
    body.innerHTML = `<div class="empty">
      ${ic('bag',64,1.6)}
      <h2>Your cart is empty</h2>
      <p>Fill it with fresh groceries and daily essentials.</p>
      <button class="btn" style="margin-top:14px" data-action="close-cart">Start shopping</button>
    </div>`;
    foot.innerHTML = '';
    return;
  }
  body.innerHTML = items.map(({p,qty}) => `
    <div class="citem">
      ${thumbHTML(p)}
      <div class="info">
        <h4>${p.name}</h4>
        <span class="unit">${p.unit}</span>
        <div class="cprice"><b>${money(p.price)}</b>${p.mrp>p.price?`<s>${money(p.mrp)}</s>`:''}</div>
      </div>
      <div class="mini">
        <button class="rm" data-action="remove" data-id="${p.id}">Remove</button>
        <div class="stepper">
          <button data-action="dec" data-id="${p.id}" aria-label="Decrease">−</button>
          <b>${qty}</b>
          <button data-action="inc" data-id="${p.id}" aria-label="Increase">+</button>
        </div>
      </div>
    </div>`).join('');

  const b = S.summary || {itemTotal:0, delivery:0, handling:0, total:0};
  const progress = Math.min(100, Math.round(b.itemTotal / 199 * 100));
  foot.innerHTML = `
    <div class="bill-row"><span>Item total</span><b>${money(b.itemTotal)}</b></div>
    <div class="bill-row"><span>Delivery fee</span>${b.delivery?`<b>${money(b.delivery)}</b>`:`<span class="free">FREE</span>`}</div>
    <div class="bill-row"><span>Handling</span><b>${money(b.handling)}</b></div>
    <div class="bill-row"><span>To pay</span><b style="font-size:var(--t15)">${money(b.total)}</b></div>
    ${b.itemTotal < 199 ? `
      <div class="delivery-note">Add ${money(199 - b.itemTotal)} more for <b style="color:var(--green-deep)">FREE delivery</b></div>
      <div class="free-bar"><i style="width:${progress}%"></i></div>` : `
      <div class="delivery-note" style="color:var(--green-deep);font-weight:700">✓ You’ve unlocked FREE delivery</div>`}
    <button class="btn wide" data-action="to-checkout">Proceed to checkout · ${money(b.total)}</button>`;
}

/* ============================================================
   PRODUCT MODAL / LOGIN MODAL
   ============================================================ */
function openPM(id){
  const p = S.pmap[id];
  if(!p) return;
  S.modal = id;
  const off = offPct(p);
  const cat = catOf(p.cat);
  $('#pm-box').innerHTML = `
    <button class="icon-btn" data-action="close-pm" aria-label="Close">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
    <div class="pm-art">${artSVG(p.art)}</div>
    <div class="pm-badges">
      ${off?`<span class="off">${off}% OFF</span>`:''}
      <span class="time">${ic('timer',12,2.4)} ${8 + (p.id.charCodeAt(2) % 9)} mins</span>
    </div>
    <h2>${p.name}</h2>
    <div class="unit">${p.unit} · ${cat ? cat.name : ''}</div>
    <div class="prow">
      <span class="price">${money(p.price)}</span>
      ${p.mrp > p.price ? `<s class="mrp">${money(p.mrp)}</s>` : ''}
    </div>
    <p class="pm-desc">${cat ? cat.name : 'Groceries'} delivered fresh from our dark store to your doorstep. Packed with care, quality-checked before dispatch.</p>
    <div class="pm-why">
      <span class="w">${ic('timer',16,2)} Delivery in ${S.eta}–${S.eta+6} minutes</span>
      <span class="w">${ic('shield',16,2)} Freshness &amp; quality checked</span>
      <span class="w">${ic('tag',16,2)} Best price, every day</span>
    </div>
    <div class="pm-qty"><div id="pm-ctl" style="flex:1;max-width:150px">${ctlHTML(p)}</div></div>
    <div class="tot" id="pm-tot">${S.cart[p.id] ? `Item total: <b>${money(p.price * S.cart[p.id])}</b>` : ''}</div>
  `;
  $('#pm').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closePM(){
  $('#pm').classList.remove('open');
  S.modal = null;
  if(!$('#cart-drawer').classList.contains('open')) document.body.style.overflow = '';
}
function openLogin(){
  $('#login-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
  $('#ls-phone').classList.add('on');
  $('#ls-otp').classList.remove('on');
  setTimeout(() => $('#phone-in').focus(), 80);
}
function closeLogin(){
  $('#login-modal').classList.remove('open');
  if(!$('#cart-drawer').classList.contains('open')) document.body.style.overflow = '';
}

/* ============================================================
   SEARCH
   ============================================================ */
function onSearchInput(){
  const q = $('#search-input').value.trim().toLowerCase();
  const dd = $('#search-drop');
  if(!q){ dd.classList.remove('open'); return; }
  const hits = S.products.filter(p => (p.name + ' ' + p.unit).toLowerCase().includes(q)).slice(0, 8);
  dd.innerHTML = hits.length
    ? hits.map(p => `
      <button class="sd-item" data-action="sd-pick" data-id="${p.id}" role="option">
        ${thumbHTML(p)}
        <span><b>${p.name}</b><small>${p.unit} · ${money(p.price)}</small></span>
      </button>`).join('')
    : `<div class="sd-empty">No matches for “${q}”</div>`;
  dd.classList.add('open');
}

/* ============================================================
   SERVER ACTIONS
   ============================================================ */
async function add(id, delta = 1){
  const p = S.pmap[id];
  if(!p) return;
  try{
    const r = await api('/cart/items', {method:'POST', body:{productId:id, delta}});
    applyCart(r);
    syncCartUI();
    if(delta > 0 && (S.cart[id] || 0) === delta) toast(`${p.name} added to cart`);
  }catch(e){ toast(e.message); }
}
async function applyCoupon(code){
  try{
    const r = await api('/coupons/apply', {method:'POST', body:{code}});
    applyCart(r);
    syncCartUI();
    toast(`Coupon ${code} applied — use it at checkout`);
  }catch(e){ toast(e.message); }
}
async function tryCoupon(){
  const v = ($('#coupon-in').value || '').trim().toUpperCase();
  await applyCoupon(v);
  if(S.view === 'checkout') render();
}
async function rmCoupon(){
  try{
    const r = await api('/coupons', {method:'DELETE'});
    applyCart(r);
    syncCartUI();
    toast('Coupon removed');
    if(S.view === 'checkout') render();
  }catch(e){ toast(e.message); }
}
async function placeOrder(){
  try{
    const r = await api('/orders', {method:'POST', body:{addressId:S.addrId, payment:S.pay}});
    applyCart(r);
    S.lastOrder = r.order;
    closeCart();
    go('success');
    toast('Order placed successfully!');
  }catch(e){ toast(e.message); }
}
async function loadOrders(){
  try{
    const r = await api('/orders');
    S.orders = r.orders;
    go('orders');
  }catch(e){ toast(e.message); }
}
async function sendOtp(){
  const ph = ($('#phone-in').value || '').replace(/\D/g, '');
  if(ph.length !== 10) return toast('Enter a valid 10-digit number');
  try{
    const r = await api('/auth/otp', {method:'POST', body:{phone:ph}});
    S.tmpPhone = ph;
    $('#otp-phone').textContent = '+91 ' + ph;
    $('#ls-phone').classList.remove('on');
    $('#ls-otp').classList.add('on');
    toast('OTP sent (demo: ' + r.demoOtp + ')');
    setTimeout(() => $('#otp-in').focus(), 80);
  }catch(e){ toast(e.message); }
}
async function verifyOtp(){
  const otp = ($('#otp-in').value || '').trim();
  if(otp.length !== 4) return toast('Enter the 4-digit OTP');
  try{
    const r = await api('/auth/verify', {method:'POST', body:{phone:S.tmpPhone, otp}});
    TOKEN = r.token;
    localStorage.setItem('bk_token', TOKEN);
    S.user = r.user;
    applyCart(r);
    syncUser(); syncCartUI(); closeLogin();
    toast('Logged in as ' + r.user.name);
    render();
  }catch(e){ toast(e.message); }
}
async function saveAddress(label, line){
  try{
    const r = await api('/addresses', {method:'POST', body:{label, line}});
    S.addresses = r.addresses;
    S.addrId = r.addrId;
    localStorage.setItem('bk_addr', r.addrId);
    syncLoc();
    toast('Address saved');
    render();
  }catch(e){ toast(e.message); }
}
async function gotoOrders(){
  await loadOrders();
}

/* ============================================================
   LOCATION PICKER + ORDER-AGAIN (customer UX)
   ============================================================ */
function openLocPicker(){
  const old = document.getElementById('loc-modal');
  if(old) old.remove();
  const m = document.createElement('div');
  m.className = 'modal';
  m.id = 'loc-modal';
  m.setAttribute('role', 'dialog');
  m.setAttribute('aria-label', 'Choose delivery location');
  m.innerHTML = `
    <div class="ovl2" data-action="close-loc"></div>
    <div class="mbox" style="max-width:420px">
      <button class="icon-btn" data-action="close-loc" aria-label="Close">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
      <h2>Choose delivery location</h2>
      <p class="sub">Your order is packed and delivered from the nearest store.</p>
      ${S.addresses.map(a => `
        <div class="addr-row ${a.id === S.addrId ? 'sel' : ''}" data-action="sel-loc" data-id="${a.id}" role="radio" aria-checked="${a.id === S.addrId}" tabindex="0">
          <span class="rad"></span>
          <span><b>${a.label}</b><p>${a.line}</p></span>
        </div>`).join('')}
      <a class="back-link" href="#" data-action="go-checkout-addr" style="margin-top:8px">+ Manage addresses at checkout</a>
    </div>`;
  document.body.appendChild(m);
  requestAnimationFrame(() => m.classList.add('open'));
}
function closeLocPicker(){
  const m = document.getElementById('loc-modal');
  if(m){ m.classList.remove('open'); setTimeout(() => m.remove(), 200); }
}
function trackHTML(o){
  if(o.status === 'cancelled'){
    return '<div style="margin-top:8px;font-size:12px;font-weight:700;color:var(--danger)">Cancelled - items returned to stock</div>';
  }
  const steps = [['placed', 'Placed'], ['packed', 'Packed'], ['out_for_delivery', 'Out for delivery'], ['delivered', 'Delivered']];
  const idx = steps.findIndex(s => s[0] === o.status);
  return '<div class="track">' + steps.map((s, i) =>
    '<div class="tstep ' + (i <= idx ? 'done' : '') + '">' + s[1] + '</div>').join('') + '</div>';
}
async function reorderOrder(id){
  const o = S.orders.find(x => x.id === id);
  if(!o) return toast('Order not found');
  let n = 0;
  for(const it of o.items){
    const p = S.products.find(x => x.name === it.name);
    if(p && p.stock > 0){
      try{
        const r = await api('/cart/items', {method: 'POST', body: {productId: p.id, delta: it.q}});
        applyCart(r);
        n += it.q;
      }catch(e){}
    }
  }
  syncCartUI();
  if(n){ toast('Added ' + n + ' items to cart'); openCart(); }
  else toast('Items from this order are out of stock');
}
async function loadHomeReorder(){
  const sec = $('#reorder-sec');
  if(!sec) return;
  try{
    const r = await api('/orders');
    const last = r.orders.find(o => o.status !== 'cancelled');
    if(!last || !last.items.length){ sec.style.display = 'none'; return; }
    const prods = [];
    last.items.forEach(it => {
      const p = S.products.find(x => x.name === it.name);
      if(p) prods.push(p);
    });
    if(!prods.length){ sec.style.display = 'none'; return; }
    $('#reorder-row').innerHTML = prods.map(pcardHTML).join('');
    sec.style.display = '';
  }catch(e){ sec.style.display = 'none'; }
}

/* ============================================================
   OFFLINE HANDLING
   ============================================================ */
function showOffline(msg){
  S.online = false;
  $('#offline-banner').style.display = 'block';
  $('#offline-msg').textContent = msg + ' — run `node server.js` in the project folder, then open http://localhost:4174';
}
function hideOffline(){
  S.online = true;
  $('#offline-banner').style.display = 'none';
}

/* ============================================================
   GLOBAL CLICK HANDLER (event delegation)
   ============================================================ */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-action], [data-nav], [data-code]');
  if(!el) return;

  if(el.dataset.nav){
    e.preventDefault();
    if(!S.online && el.dataset.nav !== 'home') return;
    S.cat = el.dataset.cat || null;
    if(el.dataset.nav === 'orders') return loadOrders();
    go(el.dataset.nav);
    return;
  }
  const act = el.dataset.action;
  const id = el.dataset.id;
  switch(act){
    case 'add':      add(id, 1); break;
    case 'inc':      add(id, 1); break;
    case 'dec':      add(id, -1); break;
    case 'remove':   add(id, -(S.cart[id] || 0)); break;
    case 'open-cart':    openCart(); break;
    case 'close-cart':   closeCart(); break;
    case 'to-checkout':
      closeCart();
      if(cartCount()) go('checkout');
      break;
    case 'open-pm':  openPM(id); break;
    case 'close-pm': closePM(); break;
    case 'login':    if(S.role === 'admin'){ go('admin'); } else if(S.role === 'shop'){ go('shop'); } else if(S.user){ loadOrders(); } else { openLogin(); } break;
    case 'close-login': closeLogin(); break;
    case 'send-otp': sendOtp(); break;
    case 'verify-otp': verifyOtp(); break;
    case 'apply-coupon': applyCoupon(el.dataset.code || ''); break;
    case 'try-coupon':   tryCoupon(); break;
    case 'rm-coupon':    rmCoupon(); break;
    case 'place-order':  placeOrder(); break;
    case 'goto-orders':  gotoOrders(); break;
    case 'scroll-shop': {
      e.preventDefault();
      const t = $('#shop');
      if(t) t.scrollIntoView({behavior:'smooth', block:'start'});
      break;
    }
    case 'sd-pick': $('#search-drop').classList.remove('open'); openPM(id); break;
    case 'pick-loc': openLocPicker(); break;
    case 'sel-addr':
      S.addrId = id;
      localStorage.setItem('bk_addr', id);
      syncLoc();
      render();
      break;
    case 'sel-pay':
      S.pay = id;
      $$('.pay-row').forEach(r => {
        r.classList.toggle('sel', r.dataset.id === id);
        r.setAttribute('aria-checked', String(r.dataset.id === id));
      });
      break;
    case 'sel-loc':
      S.addrId = id;
      localStorage.setItem('bk_addr', id);
      syncLoc();
      closeLocPicker();
      toast('Delivering to ' + (addrSel() || {}).label);
      render();
      break;
    case 'close-loc': closeLocPicker(); break;
    case 'go-checkout-addr': closeLocPicker(); go('checkout'); break;
    case 'reorder': reorderOrder(id); break;
    case 'noop': e.preventDefault(); toast('Demo link — not implemented'); break;
  }
});

/* address form */
document.addEventListener('submit', e => {
  if(e.target.id === 'addr-form'){
    e.preventDefault();
    const label = $('#addr-label').value.trim();
    const line = $('#addr-line').value.trim();
    if(!label || !line) return;
    saveAddress(label, line);
  }
});
$('#new-addr-btn') && $('#new-addr-btn').addEventListener('click', () => {
  const f = $('#addr-form');
  f.style.display = f.style.display === 'none' ? 'grid' : 'none';
  if(f.style.display !== 'none') setTimeout(() => $('#addr-label').focus(), 60);
});

/* search */
$('#search-input').addEventListener('input', onSearchInput);
$('#search-input').addEventListener('focus', onSearchInput);
$('#search-input').addEventListener('keydown', e => {
  if(e.key === 'Enter'){
    const q = e.target.value.trim();
    $('#search-drop').classList.remove('open');
    if(q){ S.query = q.toLowerCase(); go('search'); }
  }
  if(e.key === 'Escape') $('#search-drop').classList.remove('open');
});
document.addEventListener('click', e => {
  if(!e.target.closest('.searchbox')) $('#search-drop').classList.remove('open');
});

/* keyboard: Esc closes overlays */
document.addEventListener('keydown', e => {
  if(e.key === 'Escape'){
    if($('#pm').classList.contains('open')) closePM();
    if($('#login-modal').classList.contains('open')) closeLogin();
    if($('#cart-drawer').classList.contains('open')) closeCart();
  }
});

/* ============================================================
   INIT
   ============================================================ */
async function init(){
  $('#eta-text').textContent = `Delivery in ${S.eta} mins`;
  try{
    if(!TOKEN){
      const s = await api('/session', {method:'POST'});
      TOKEN = s.token;
      localStorage.setItem('bk_token', TOKEN);
      applyCart(s);
    }
    const [catalog, cart, me] = await Promise.all([
      api('/catalog'),
      api('/cart'),
      api('/me').catch(() => ({user:null})),
    ]);
    S.cats = catalog.categories;
    S.products = catalog.products;
    S.pmap = Object.fromEntries(S.products.map(p => [p.id, p]));
    applyCart(cart);
    S.user = me.user || null;
    S.role = me.role || 'customer';
    S.shop = me.shop || null;
    syncLoc();
    syncUser();
    hideOffline();
    render();
  }catch(e){
    showOffline(e.message);
    $view.innerHTML = `<div class="wrap page">
      <div class="empty">
        ${ic('bag',64,1.6)}
        <h2>Backend not reachable</h2>
        <p>${e.message}</p>
        <p style="margin-top:8px">In the project folder run <b>node server.js</b>,<br>then open <b>http://localhost:4174</b></p>
      </div>
    </div>`;
  }
}
init();

/* ============================================================
   PROVIDER ADMIN + B2B SHOP PORTAL  (Phases 1-4 extension)
   ============================================================ */
(function(){
  'use strict';
  /* ---------- injected styles ---------- */
  const CSS = `
  .lbl{display:block;font-size:13px;font-weight:600;margin-bottom:6px}
  .admin-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0 4px}
  .atab{padding:8px 16px;border-radius:999px;border:1px solid var(--line);background:var(--card);font-weight:700;font-size:13px;color:var(--ink-2);transition:all var(--fast)}
  .atab:hover{border-color:var(--green);color:var(--green-deep)}
  .atab.sel{background:var(--green-deep);border-color:var(--green-deep);color:#F2F7EE}
  .stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px}
  .stat-card{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:16px 18px}
  .stat-card b{font-size:24px;font-weight:800;letter-spacing:-.4px;display:block;color:var(--ink)}
  .stat-card span{font-size:12px;color:var(--ink-3);font-weight:600}
  .stat-card .delta{font-size:12px;font-weight:700;color:var(--green-deep);margin-top:4px}
  .two-col{display:grid;gap:16px;margin-top:16px}
  @media(min-width:900px){.two-col{grid-template-columns:1.2fr 1fr}}
  .chart{display:flex;gap:6px;align-items:flex-end;height:150px;padding-top:12px}
  .ch-col{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:3px;min-width:0}
  .ch-bar{width:70%;max-width:36px;background:linear-gradient(180deg,var(--green),var(--green-deep));border-radius:6px 6px 2px 2px;min-height:3px}
  .ch-val{font-size:10px;font-weight:700;color:var(--ink-2)}
  .ch-day{font-size:10px;color:var(--ink-3);white-space:nowrap}
  .atbl{width:100%;border-collapse:collapse;font-size:13px;background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);overflow:hidden}
  .atbl th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:var(--ink-3);padding:10px 12px;border-bottom:1px solid var(--line);background:var(--green-mist)}
  .atbl td{padding:10px 12px;border-bottom:1px solid var(--line);vertical-align:middle}
  .atbl tr:last-child td{border-bottom:none}
  .pill{display:inline-block;font-size:11px;font-weight:800;padding:2px 10px;border-radius:999px;white-space:nowrap}
  .mini-btn{padding:6px 12px;border-radius:8px;border:1.4px solid var(--green);color:var(--green-deep);font-weight:700;font-size:12px;background:var(--card);transition:background var(--fast)}
  .mini-btn:hover{background:var(--green-soft)}
  .mini-btn.danger{border-color:var(--danger);color:var(--danger)}
  .mini-btn.danger:hover{background:#F6E7E3}
  .stock-badge{font-weight:800;font-size:13px}
  .row-flex{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
  .shop-card{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:16px 18px;margin-bottom:12px}
  .shop-top{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
  .shop-top h2{font-size:16px;font-weight:800;letter-spacing:-.2px}
  .credit-pill{background:var(--green-soft);color:var(--green-deep);font-weight:800;font-size:13px;padding:4px 12px;border-radius:999px}
  .wholesale-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
  @media(min-width:640px){.wholesale-grid{grid-template-columns:repeat(3,1fr)}}
  @media(min-width:1024px){.wholesale-grid{grid-template-columns:repeat(4,1fr)}}
  .wcard{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);overflow:hidden}
  .wcard .wmeta{padding:10px 12px 12px}
  .wcard h4{font-size:13px;font-weight:600;line-height:1.35;min-height:34px}
  .wrow{display:flex;justify-content:space-between;align-items:center;margin-top:6px}
  .shop-cart-bar{position:sticky;bottom:12px;margin-top:16px;display:flex;justify-content:space-between;align-items:center;gap:12px;background:var(--green-deep);color:#F2F7EE;border-radius:14px;padding:14px 18px;box-shadow:var(--shadow-pop);flex-wrap:wrap}
  .admin-note{font-size:12px;color:var(--ink-3);margin-top:4px}
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  /* ---------- admin api (separate token) ---------- */
  const AK = 'bk_admin_token';
  let ADMIN_TOKEN = localStorage.getItem(AK) || '';
  async function apiA(path, opts = {}){
    let res;
    try{
      res = await fetch('/api' + path, {
        method: opts.method || 'GET',
        headers: {'Content-Type': 'application/json', ...(ADMIN_TOKEN ? {Authorization: 'Bearer ' + ADMIN_TOKEN} : {})},
        body: opts.body ? JSON.stringify(opts.body) : undefined,
      });
    }catch(e){ throw new Error('Server unreachable'); }
    let data = {};
    try{ data = await res.json(); }catch(e){}
    if(!res.ok){ const err = new Error(data.error || ('Request failed (' + res.status + ')')); err.status = res.status; throw err; }
    return data;
  }

  /* ---------- route admin & shop views into render ---------- */
  const _renderBase = render;
  render = function(){
    if(S.view === 'admin'){ renderAdmin(); return; }
    if(S.view === 'shop'){ renderShop(); return; }
    _renderBase();
  };

  const ST_COLOR = {
    placed: ['var(--yellow)', 'var(--yellow-ink)'],
    packed: ['var(--green-soft)', 'var(--green-deep)'],
    out_for_delivery: ['var(--green)', '#F2F7EE'],
    delivered: ['var(--green-deep)', '#F2F7EE'],
    cancelled: ['var(--danger)', '#fff'],
  };
  const stPill = st => {
    const c = ST_COLOR[st] || ['var(--line)', 'var(--ink)'];
    return '<span class="pill" style="background:' + c[0] + ';color:' + c[1] + '">' + st.replace(/_/g, ' ') + '</span>';
  };
  const NEXT_ACT = {
    placed: ['packed', 'Mark packed'],
    packed: ['out_for_delivery', 'Dispatch'],
    out_for_delivery: ['delivered', 'Mark delivered'],
  };
  const barChart = series => {
    const max = Math.max.apply(null, series.map(s => s.revenue).concat([1]));
    return '<div class="chart">' + series.map(s =>
      '<div class="ch-col" title="' + s.day + ' - ' + money(s.revenue) + ' - ' + s.orders + ' orders">' +
      '<span class="ch-val">' + (s.orders || '') + '</span>' +
      '<div class="ch-bar" style="height:' + Math.round(s.revenue / max * 100) + '%"></div>' +
      '<span class="ch-day">' + s.day + '</span></div>').join('') + '</div>';
  };
  const riderSel = (order, riders) =>
    '<select class="inp" style="width:auto;padding:6px 10px;font-size:12px" data-action="assign-rider" data-id="' + order.id + '">' +
    '<option value="">Assign rider...</option>' +
    riders.map(r => '<option value="' + r.id + '"' + (order.riderId === r.id ? ' selected' : '') + '>' + r.name + '</option>').join('') + '</select>';

  function adminShell(inner){
    const tabs = [['overview', 'Overview'], ['inventory', 'Inventory'], ['orders', 'Orders'], ['logistics', 'Logistics'], ['shops', 'Shops']];
    S.adminTab = S.adminTab || 'overview';
    return '<div class="wrap page">' +
      '<a class="back-link" href="#" data-nav="home">' + ic('arrow', 15, 2.4) + ' Back to storefront</a>' +
      '<h1>Provider dashboard</h1>' +
      '<p class="sub">You are the provider - inventory, logistics and revenue for customers &amp; shops.</p>' +
      '<div class="admin-tabs">' + tabs.map(t => '<button class="atab ' + (S.adminTab === t[0] ? 'sel' : '') + '" data-action="admin-tab" data-id="' + t[0] + '">' + t[1] + '</button>').join('') +
      '<button class="atab" style="margin-left:auto" data-action="admin-logout">Logout</button></div>' +
      '<div class="body">' + inner + '</div></div>';
  }

  function adminLoginHTML(err){
    return '<div class="wrap page" style="max-width:440px">' +
      '<div class="ck-card">' +
      '<h2>Provider (admin) login</h2>' +
      (err ? '<p style="color:var(--danger);font-size:13px;margin-bottom:10px">' + err + '</p>' : '') +
      '<form id="admin-login-form">' +
      '<label class="lbl" for="adm-user">Username</label>' +
      '<input class="inp" id="adm-user" value="admin" style="margin-bottom:12px">' +
      '<label class="lbl" for="adm-pass">Password</label>' +
      '<input class="inp" id="adm-pass" type="password" value="admin123" style="margin-bottom:16px">' +
      '<button class="btn wide" type="submit">Sign in to dashboard</button>' +
      '<p class="otp-hint">Demo credentials - <b>admin / admin123</b></p>' +
      '</form></div></div>';
  }

  async function renderAdmin(){
    const v = $('#view');
    if(!ADMIN_TOKEN){
      try{
        const r = await apiA('/auth/admin', {method: 'POST', body: {username: 'admin', password: 'admin123'}});
        ADMIN_TOKEN = r.token;
        localStorage.setItem(AK, ADMIN_TOKEN);
        S.role = 'admin';
        syncUser();
        toast('Demo mode - signed in as provider');
      }catch(e){
        v.innerHTML = adminLoginHTML(e.message);
        return;
      }
    }
    S.adminTab = S.adminTab || 'overview';
    try{
      let inner = '';
      if(S.adminTab === 'overview') inner = overviewHTML(await apiA('/admin/stats'));
      else if(S.adminTab === 'inventory') inner = inventoryHTML((await apiA('/admin/inventory')).products);
      else if(S.adminTab === 'orders') inner = adminOrdersHTML((await apiA('/admin/orders')).orders);
      else if(S.adminTab === 'logistics'){
        const r = await Promise.all([apiA('/admin/orders'), apiA('/admin/riders')]);
        inner = logisticsHTML(r[0].orders, r[1].riders);
      }
      else if(S.adminTab === 'shops') inner = shopsHTML((await apiA('/admin/shops')).shops);
      v.innerHTML = adminShell(inner);
    }catch(e){
      if(e.status === 401 || e.status === 403){
        ADMIN_TOKEN = '';
        localStorage.removeItem(AK);
        v.innerHTML = adminLoginHTML(e.message);
      } else {
        v.innerHTML = adminShell('<div class="empty">' + ic('bag', 64, 1.6) + '<h2>Something went wrong</h2><p>' + e.message + '</p></div>');
      }
    }
  }  function overviewHTML(s){
    return '<div class="stat-grid">' +
      '<div class="stat-card"><b>' + money(s.today.revenue) + '</b><span>Revenue today</span><div class="delta">' + s.today.orders + ' orders today</div></div>' +
      '<div class="stat-card"><b>' + money(s.gmv14) + '</b><span>GMV · last 14 days</span></div>' +
      '<div class="stat-card"><b>' + money(s.aov) + '</b><span>Avg order value</span></div>' +
      '<div class="stat-card"><b>' + money(s.inventoryValue) + '</b><span>Inventory value (at cost)</span></div>' +
      '</div>' +
      '<div class="two-col">' +
      '<div class="ck-card"><h2>Revenue — last 14 days</h2>' + barChart(s.series) +
      '<div class="row-flex" style="margin-top:14px">' +
      '<span class="pill" style="background:var(--green-soft);color:var(--green-deep)">B2C ' + s.mix.b2c.orders + ' orders · ' + money(s.mix.b2c.revenue) + '</span>' +
      '<span class="pill" style="background:var(--yellow);color:var(--yellow-ink)">B2B ' + s.mix.b2b.orders + ' orders · ' + money(s.mix.b2b.revenue) + '</span>' +
      '</div></div>' +
      '<div>' +
      '<div class="ck-card"><h2>Top products</h2>' + s.topProducts.map((p, i) =>
        '<div class="bill-row"><span>' + (i + 1) + '. ' + p.name + ' <small style="color:var(--ink-3)">×' + p.qty + '</small></span><b>' + money(p.revenue) + '</b></div>').join('') + '</div>' +
      '<div class="ck-card" style="margin-top:16px"><h2>Low stock alerts</h2>' +
      (s.lowStock.length ? s.lowStock.slice(0, 6).map(p =>
        '<div class="bill-row"><span>' + p.name + ' <small style="color:var(--ink-3)">' + p.sku + '</small></span><span class="pill" style="background:var(--yellow);color:var(--yellow-ink)">' + p.stock + ' left</span></div>').join('')
      : '<p class="admin-note">All products well stocked ✓</p>') + '</div>' +
      '</div></div>';
  }

  function inventoryHTML(products){
    return '<table class="atbl"><thead><tr><th>Product</th><th>SKU</th><th>Cost</th><th>Retail</th><th>Stock</th><th>Adjust</th></tr></thead><tbody>' +
      products.map(p =>
        '<tr><td><b>' + p.name + '</b><div class="admin-note">' + p.unit + '</div></td>' +
        '<td>' + p.sku + '</td>' +
        '<td>' + money(p.cost) + '</td>' +
        '<td>' + money(p.price) + '</td>' +
        '<td><span class="stock-badge" style="color:' + (p.status === 'out' ? 'var(--danger)' : p.status === 'low' ? '#8A6D10' : 'var(--green-deep)') + '">' + p.stock + '</span>' +
        (p.status !== 'ok' ? ' <span class="pill" style="background:' + (p.status === 'out' ? 'var(--danger)' : 'var(--yellow)') + ';color:#fff">' + (p.status === 'out' ? 'OUT' : 'LOW') + '</span>' : '') + '</td>' +
        '<td><div class="stock-ctl" style="display:flex;gap:6px;flex-wrap:wrap">' +
        '<button class="mini-btn" data-action="restock" data-id="' + p.id + '" data-delta="25">+25</button>' +
        '<button class="mini-btn" data-action="restock" data-id="' + p.id + '" data-delta="100">+100</button>' +
        '<button class="mini-btn danger" data-action="restock" data-id="' + p.id + '" data-delta="-10">−10</button>' +
        '</div></td></tr>').join('') + '</tbody></table>';
  }

  function adminOrdersHTML(orders){
    return '<table class="atbl"><thead><tr><th>Order</th><th>Kind</th><th>Items</th><th>Total</th><th>Status</th><th>Action</th></tr></thead><tbody>' +
      orders.slice(0, 40).map(o => {
        const na = NEXT_ACT[o.status];
        return '<tr><td><b>' + o.id + '</b><div class="admin-note">' + new Date(o.createdAt).toLocaleString('en-IN', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'}) + '</div></td>' +
        '<td><span class="pill" style="background:' + (o.kind === 'b2b' ? 'var(--yellow)' : 'var(--green-soft)') + ';color:' + (o.kind === 'b2b' ? 'var(--yellow-ink)' : 'var(--green-deep)') + '">' + o.kind.toUpperCase() + '</span></td>' +
        '<td>' + o.items.reduce((a, i) => a + i.q, 0) + '</td>' +
        '<td><b>' + money(o.total) + '</b></td>' +
        '<td>' + stPill(o.status) + '</td>' +
        '<td><div class="row-flex">' +
        (na ? '<button class="mini-btn" data-action="set-status" data-id="' + o.id + '" data-status="' + na[0] + '">' + na[1] + '</button>' : '') +
        (o.status !== 'delivered' && o.status !== 'cancelled' ? '<button class="mini-btn danger" data-action="set-status" data-id="' + o.id + '" data-status="cancelled">Cancel</button>' : '') +
        '</div></td></tr>';
      }).join('') + '</tbody></table>';
  }

  function logisticsHTML(orders, riders){
    const pending = orders.filter(o => o.status === 'packed' || o.status === 'out_for_delivery');
    const counts = {};
    riders.forEach(r => counts[r.id] = {name: r.name, n: orders.filter(o => o.riderId === r.id && o.status === 'out_for_delivery').length});
    return '<div class="stat-grid">' + riders.map(r =>
      '<div class="stat-card"><b>' + counts[r.id].n + '</b><span>' + r.name + ' · out for delivery</span></div>').join('') + '</div>' +
      '<div class="ck-card" style="margin-top:16px"><h2>Dispatch board — ' + pending.length + ' pending</h2>' +
      (pending.length ? '<table class="atbl"><thead><tr><th>Order</th><th>Items</th><th>Status</th><th>Assign rider</th><th></th></tr></thead><tbody>' +
      pending.map(o => {
        const na = NEXT_ACT[o.status];
        return '<tr><td><b>' + o.id + '</b><div class="admin-note">' + (o.kind === 'b2b' ? 'B2B · ' : 'B2C · ') + o.addressLabel + '</div></td>' +
        '<td>' + o.items.reduce((a, i) => a + i.q, 0) + '</td>' +
        '<td>' + stPill(o.status) + '</td>' +
        '<td>' + riderSel(o, riders) + '</td>' +
        '<td>' + (na ? '<button class="mini-btn" data-action="set-status" data-id="' + o.id + '" data-status="' + na[0] + '">' + na[1] + '</button>' : '') + '</td></tr>';
      }).join('') + '</tbody></table>' : '<p class="admin-note">Nothing to dispatch right now.</p>') + '</div>';
  }

  function shopsHTML(shops){
    return shops.map(sh =>
      '<div class="shop-card"><div class="shop-top"><h2>' + sh.name + '</h2><span class="credit-pill">Credit: ' + money(sh.credit) + '</span></div>' +
      '<div class="bill-row"><span>' + sh.phone + ' · ' + sh.orderCount + ' orders</span><b>' + money(sh.orderValue) + '</b></div>' +
      '<form class="row-flex" style="margin-top:10px" id="shop-credit-form" data-id="' + sh.id + '">' +
      '<input class="inp" style="width:120px" type="number" step="100" value="5000" aria-label="Top-up amount">' +
      '<button class="mini-btn" type="submit">Top up credit</button>' +
      '</form></div>').join('') +
      '<div class="shop-card"><div class="shop-top"><h2>+ New shop</h2></div>' +
      '<form class="row-flex" style="margin-top:10px" id="shop-create-form">' +
      '<input class="inp" style="width:180px" id="new-shop-name" placeholder="Shop name" required>' +
      '<input class="inp" style="width:150px" id="new-shop-phone" placeholder="10-digit phone" pattern="[0-9]{10}" required>' +
      '<input class="inp" style="width:110px" id="new-shop-credit" type="number" value="10000" aria-label="Opening credit">' +
      '<button class="mini-btn" type="submit">Create</button>' +
      '</form></div>';
  }  /* ---------- admin actions ---------- */
  async function doAdminLogin(){
    try{
      const r = await apiA('/auth/admin', {method: 'POST', body: {username: $('#adm-user').value.trim(), password: $('#adm-pass').value}});
      ADMIN_TOKEN = r.token;
      localStorage.setItem(AK, ADMIN_TOKEN);
      S.role = 'admin';
      syncUser();
      toast('Welcome back, provider');
      renderAdmin();
    }catch(e){ toast(e.message); }
  }
  async function doRestock(id, delta){
    try{
      await apiA('/admin/stock', {method: 'POST', body: {productId: id, delta, reason: 'manual'}});
      toast(delta > 0 ? 'Restocked +' + delta : 'Reduced by ' + (-delta));
      renderAdmin();
    }catch(e){ toast(e.message); }
  }
  async function doSetStatus(id, status){
    try{
      await apiA('/admin/orders/' + id + '/status', {method: 'POST', body: {status}});
      toast('Order ' + id + ' -> ' + status.replace(/_/g, ' '));
      renderAdmin();
    }catch(e){ toast(e.message); }
  }
  async function doShopCredit(id){
    const form = document.getElementById('shop-credit-form');
    const input = form ? form.querySelector('input') : null;
    const amount = input ? Number(input.value) : 5000;
    try{
      const r = await apiA('/admin/shops/' + id + '/credit', {method: 'POST', body: {amount}});
      toast('Credit updated - ' + r.shop.name + ' has ' + money(r.shop.credit));
      renderAdmin();
    }catch(e){ toast(e.message); }
  }
  async function doShopCreate(){
    try{
      await apiA('/admin/shops', {method: 'POST', body: {
        name: $('#new-shop-name').value.trim(),
        phone: $('#new-shop-phone').value.trim(),
        credit: Number($('#new-shop-credit').value) || 0,
      }});
      toast('Shop created - they can login with OTP 2468');
      renderAdmin();
    }catch(e){ toast(e.message); }
  }

  /* ---------- admin event listeners ---------- */
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if(!el) return;
    const act = el.dataset.action;
    if(act === 'admin-tab'){ S.adminTab = el.dataset.id; renderAdmin(); }
    else if(act === 'admin-logout'){ ADMIN_TOKEN = ''; localStorage.removeItem(AK); S.role = 'customer'; syncUser(); go('home'); toast('Admin logged out'); }
    else if(act === 'restock'){ doRestock(el.dataset.id, Number(el.dataset.delta)); }
    else if(act === 'set-status'){ doSetStatus(el.dataset.id, el.dataset.status); }
    else if(act === 'shop-add' || act === 'shop-inc'){ shopQty(el.dataset.id, 1); }
    else if(act === 'shop-dec'){ shopQty(el.dataset.id, -1); }
    else if(act === 'shop-order'){ placeShopOrder(); }
    else if(act === 'shop-switch'){ shopSwitchTo(el.dataset.phone); }
    else if(act === 'shop-logout'){ S.role = 'customer'; S.shop = null; TOKEN = ''; localStorage.removeItem('bk_token'); S.shopCart = {}; syncUser(); go('home'); toast('Shop logged out'); }
  });
  document.addEventListener('change', e => {
    const el = e.target;
    if(el.dataset && el.dataset.action === 'assign-rider'){
      apiA('/admin/orders/' + el.dataset.id + '/rider', {method: 'POST', body: {riderId: el.value}})
        .then(() => { toast('Rider assigned'); renderAdmin(); })
        .catch(err => toast(err.message));
    }
  });
  document.addEventListener('submit', e => {
    if(e.target.id === 'admin-login-form'){ e.preventDefault(); doAdminLogin(); }
    if(e.target.id === 'shop-create-form'){ e.preventDefault(); doShopCreate(); }
    if(e.target.id === 'shop-login-form'){ e.preventDefault(); shopSendOtp(); }
    if(e.target.id === 'shop-verify-form'){ e.preventDefault(); shopVerifyOtp(); }
    if(e.target.id === 'shop-credit-form'){ e.preventDefault(); doShopCredit(e.target.dataset.id); }
  });  /* ============================================================
     B2B SHOP PORTAL
     ============================================================ */
  const DEMO_SHOPS = [
    ['Sri Balaji Stores', '9800000001'],
    ['GreenMart', '9800000002'],
    ['FreshPoint Kirana', '9800000003'],
  ];
  async function demoShopLogin(phone){
    try{
      const ph = phone || '9800000001';
      await api('/auth/shop', {method: 'POST', body: {phone: ph}});
      const r = await api('/auth/shop/verify', {method: 'POST', body: {phone: ph, otp: '2468'}});
      TOKEN = r.token;
      localStorage.setItem('bk_token', TOKEN);
      S.role = 'shop';
      S.shop = r.shop;
      syncUser();
      return true;
    }catch(e){ return false; }
  }
  async function shopSwitchTo(phone){
    try{
      await api('/auth/shop', {method: 'POST', body: {phone: phone}});
      const r = await api('/auth/shop/verify', {method: 'POST', body: {phone: phone, otp: '2468'}});
      TOKEN = r.token;
      localStorage.setItem('bk_token', TOKEN);
      S.role = 'shop';
      S.shop = r.shop;
      S.shopCart = {};
      syncUser();
      toast('Switched to ' + r.shop.name);
      renderShop();
    }catch(e){ toast(e.message); }
  }

  function renderShop(){
    const v = $('#view');
    if(S.role !== 'shop'){
      demoShopLogin().then(ok => {
        if(ok){ toast('Demo mode - signed in as ' + S.shop.name); renderShop(); }
        else v.innerHTML = shopLoginHTML('Demo auto-login failed - use the form below');
      });
      return;
    }
    api('/shop/catalog').then(r => {
      S.shop = r.shop;
      syncUser();
      shopPortal(r);
    }).catch(err => {
      if(err.status === 401 || err.status === 403){
        S.role = 'customer';
        v.innerHTML = shopLoginHTML(err.message);
      } else {
        v.innerHTML = '<div class="wrap page"><div class="empty">' + ic('bag', 64, 1.6) + '<h2>Error</h2><p>' + err.message + '</p></div></div>';
      }
    });
  }

  function shopLoginHTML(err){
    return '<div class="wrap page" style="max-width:440px"><div class="ck-card">' +
      '<h2>Shop login (B2B)</h2>' +
      '<p class="sub">Registered shops order at wholesale prices on credit.</p>' +
      (err ? '<p style="color:var(--danger);font-size:13px;margin:10px 0">' + err + '</p>' : '') +
      '<form id="shop-login-form">' +
      '<label class="lbl" for="shop-phone">Shop phone number</label>' +
      '<input class="inp" id="shop-phone" inputmode="numeric" maxlength="10" placeholder="e.g. 9800000001" style="margin-bottom:14px">' +
      '<button class="btn wide" type="submit">Request OTP</button>' +
      '<p class="otp-hint">Demo shops - <b>9800000001 / 9800000002 / 9800000003</b> · OTP <b>2468</b></p>' +
      '</form></div></div>';
  }

  let shopPhoneTmp = '';
  async function shopSendOtp(){
    const ph = ($('#shop-phone').value || '').replace(/\D/g, '');
    if(ph.length !== 10) return toast('Enter a valid 10-digit phone');
    try{
      const r = await api('/auth/shop', {method: 'POST', body: {phone: ph}});
      shopPhoneTmp = ph;
      toast('OTP sent (demo: ' + r.demoOtp + ')');
      $('#view').innerHTML = '<div class="wrap page" style="max-width:440px"><div class="ck-card">' +
        '<h2>Verify OTP</h2><p class="sub">Sent to +91 ' + ph + '</p>' +
        '<form id="shop-verify-form">' +
        '<label class="lbl" for="shop-otp">4-digit OTP</label>' +
        '<input class="inp" id="shop-otp" inputmode="numeric" maxlength="4" placeholder="••••" style="margin-bottom:14px">' +
        '<button class="btn wide" type="submit">Verify &amp; enter shop</button>' +
        '<p class="otp-hint">Demo OTP - <b>2468</b></p>' +
        '</form></div></div>';
    }catch(e){ toast(e.message); }
  }

  async function shopVerifyOtp(){
    const otp = ($('#shop-otp').value || '').trim();
    if(otp.length !== 4) return toast('Enter the 4-digit OTP');
    try{
      const r = await api('/auth/shop/verify', {method: 'POST', body: {phone: shopPhoneTmp, otp}});
      TOKEN = r.token;
      localStorage.setItem('bk_token', TOKEN);
      S.role = 'shop';
      S.shop = r.shop;
      syncUser();
      toast('Welcome, ' + r.shop.name);
      renderShop();
    }catch(e){ toast(e.message); }
  }

  S.shopCart = S.shopCart || {};
  function shopQty(id, d){
    S.shopCart[id] = Math.max(0, (S.shopCart[id] || 0) + d);
    api('/shop/catalog').then(r => shopPortal(r)).catch(e => toast(e.message));
  }

  function shopPortal(r){
    const items = Object.entries(S.shopCart).map(([id, q]) => {
      const p = r.products.find(x => x.id === id);
      return p ? {p, q} : null;
    }).filter(Boolean);
    const total = items.reduce((a, {p, q}) => a + p.wholesale * q, 0);
    $('#view').innerHTML = '<div class="wrap page">' +
      '<a class="back-link" href="#" data-nav="home">' + ic('arrow', 15, 2.4) + ' Back to storefront</a>' +
      '<div class="row-flex" style="justify-content:space-between;align-items:flex-end">' +
      '<div><h1>' + r.shop.name + '</h1><p class="sub">Wholesale catalog · cost + 15%</p></div>' +
      '<span class="credit-pill">Wallet credit: ' + money(r.shop.credit) + '</span></div>' +
      '<div class="row-flex" style="margin-top:10px">' + DEMO_SHOPS.map(s =>
        '<button class="mini-btn" data-action="shop-switch" data-phone="' + s[1] + '"' + (S.shop && String(S.shop.phone) === s[1] ? ' style="background:var(--green-soft)"' : '') + '>' + s[0] + '</button>').join('') + '</div>' +
      '<div class="body wholesale-grid">' + r.products.map(p => {
        const q = S.shopCart[p.id] || 0;
        return '<div class="wcard">' + artSVG(p.art) +
          '<div class="wmeta"><h4>' + p.name + '</h4>' +
          '<span class="unit">' + p.unit + ' · stock ' + p.stock + '</span>' +
          '<div class="wrow"><b>' + money(p.wholesale) + '</b><s class="mrp">' + money(p.price) + '</s></div>' +
          (q ? '<div class="stepper" style="margin-top:8px"><button data-action="shop-dec" data-id="' + p.id + '">−</button><b>' + q + '</b><button data-action="shop-inc" data-id="' + p.id + '">+</button></div>'
             : '<button class="add-btn" style="margin-top:8px" data-action="shop-add" data-id="' + p.id + '"' + (p.stock === 0 ? ' disabled' : '') + '>' + (p.stock === 0 ? 'OUT OF STOCK' : 'ADD') + '</button>') +
          '</div></div>';
      }).join('') + '</div>' +
      (items.length ? '<div class="shop-cart-bar"><div><b>' + items.reduce((a, x) => a + x.q, 0) + ' items</b> · ' + money(total) + '</div>' +
      '<button class="btn" data-action="shop-order">Place wholesale order · ' + money(total) + '</button></div>' : '') +
      '<div style="margin-top:24px"><h2 style="font-size:18px;font-weight:800">Recent orders</h2><div id="shop-orders"></div></div></div>';
    api('/shop/orders').then(o => {
      const el = $('#shop-orders');
      if(el) el.innerHTML = o.orders.length ? o.orders.map(x =>
        '<div class="ord-card"><div class="ord-top"><b>' + x.id + '</b>' + stPill(x.status) + '</div>' +
        '<div class="ord-items">' + x.items.map(i => '<span>' + i.q + ' × ' + i.name + '</span>').join('') + '</div>' +
        '<div class="ord-meta"><span>' + new Date(x.createdAt).toLocaleDateString('en-IN', {day: 'numeric', month: 'short'}) + '</span><span><b style="color:var(--ink)">' + money(x.total) + '</b></span></div></div>').join('')
      : '<div class="empty">' + ic('bag', 64, 1.6) + '<h2>No orders yet</h2></div>';
    }).catch(() => {});
  }

  async function placeShopOrder(){
    const rows = Object.entries(S.shopCart).map(([productId, qty]) => ({productId, qty})).filter(r => r.qty > 0);
    if(!rows.length) return toast('Add items first');
    try{
      const r = await api('/shop/orders', {method: 'POST', body: {items: rows}});
      S.shopCart = {};
      S.shop = r.shop;
      toast('Order ' + r.order.id + ' placed - ' + money(r.order.total) + ' from wallet');
      renderShop();
    }catch(e){ toast(e.message); }
  }
})();