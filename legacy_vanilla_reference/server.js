'use strict';
/* ============================================================
   blinkit grocery — backend server (zero dependencies, Node >= 18)
   Serves index.html + app.js and a JSON API.
   Persists to data/db.json (seeded on first run).
   Demo OTP: 2468 · Coupons: GREEN50 (min ₹499), GREEN75 (min ₹749)
   ============================================================ */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT) || 4174;
const DB_PATH = path.join(__dirname, 'data', 'db.json');

/* ---------------- catalog ---------------- */
const CATEGORIES = [
  {id:'fv',     name:'Fruits & Vegetables',   icon:'leaf'},
  {id:'dairy',  name:'Dairy & Breakfast',     icon:'milk'},
  {id:'atta',   name:'Atta, Rice & Dals',     icon:'grain'},
  {id:'snacks', name:'Snacks & Munchies',     icon:'chips'},
  {id:'drinks', name:'Cold Drinks & Juices',  icon:'bottle'},
  {id:'tea',    name:'Tea, Coffee & More',    icon:'cup'},
  {id:'house',  name:'Household Essentials',  icon:'spray'},
  {id:'care',   name:'Personal Care',         icon:'soap'},
  {id:'frozen', name:'Instant & Frozen',      icon:'snow'},
  {id:'choco',  name:'Chocolates & Biscuits', icon:'choco'},
];

/* [id, name, unit, price, mrp, cat, [artType, c1, c2, tint], best] */
const RAW = [
  ['p1', 'Banana (Robusta)',        '6 pcs',  38,  45,  'fv',     ['banana','#F2C94C','#E0AF2E','#F3F5DE'], 1],
  ['p2', 'Apple (Shimla)',          '1 kg',   169, 199, 'fv',     ['fruit', '#D95555','#8E9F5B','#F7EBE4'], 1],
  ['p3', 'Onion',                   '1 kg',   30,  40,  'fv',     ['fruit', '#C98A5B','#8E9F5B','#F5EBE0'], 0],
  ['p4', 'Potato (New)',            '1 kg',   32,  40,  'fv',     ['potato','#C9A76B','#A98A52','#F3EEE2'], 0],
  ['p5', 'Tomato (Hybrid)',         '1 kg',   25,  36,  'fv',     ['fruit', '#E05A4E','#5F8F4B','#F8EAE5'], 0],
  ['p6', 'Spinach (Palak)',         '250 g',  15,  20,  'fv',     ['leaf',  '#4E8B4C','#6FA35F','#EAF3E2'], 0],
  ['p7', 'Amul Taaza Milk',         '500 ml', 27,  28,  'dairy',  ['carton','#5B8FC4','#3E6E9E','#E8F0F6'], 1],
  ['p8', 'Amul Butter',             '100 g',  59,  64,  'dairy',  ['tub',   '#F2C94C','#E0AF2E','#F6F2DC'], 0],
  ['p9', 'Farm Eggs',               '6 pcs',  48,  55,  'dairy',  ['eggs',  '#E8D9B8','#F7F3E8','#F4EFE2'], 0],
  ['p10','Mother Dairy Curd',       '400 g',  34,  38,  'dairy',  ['tub',   '#EDF1F0','#7FA9C9','#E9F1F2'], 0],
  ['p11','Amul Paneer',             '200 g',  85,  95,  'dairy',  ['block', '#F7F4EA','#D8E4D2','#F0F2E4'], 0],
  ['p12','English Oven Bread',      '400 g',  38,  45,  'dairy',  ['bread', '#D9A55E','#C08B45','#F5EBDD'], 0],
  ['p13','Aashirvaad Atta',         '5 kg',   249, 280, 'atta',   ['sack',  '#D8C08A','#8E6B3E','#F3EDDC'], 1],
  ['p14','India Gate Basmati Rice', '1 kg',   99,  120, 'atta',   ['sack',  '#E9E2CE','#7FA9C9','#F2F0E4'], 0],
  ['p15','Toor Dal',                '1 kg',   129, 150, 'atta',   ['sack',  '#D9B25C','#8E6B3E','#F5EDD8'], 0],
  ['p16','Madhur Sugar',            '1 kg',   45,  50,  'atta',   ['sack',  '#F2F1EA','#C9C6B8','#F1F3EA'], 0],
  ['p17','Tata Salt',               '1 kg',   28,  30,  'atta',   ['sack',  '#5B8FC4','#3E6E9E','#E8F0F6'], 0],
  ['p18','Lay\u2019s Magic Masala', '52 g',   20,  20,  'snacks', ['packet','#E0AF2E','#C08B45','#F6EFDA'], 1],
  ['p19','Kurkure Masala Munch',    '90 g',   20,  25,  'snacks', ['packet','#E07B4E','#C05B33','#F7E9DF'], 0],
  ['p20','Haldiram\u2019s Bhujia',  '200 g',  55,  70,  'snacks', ['packet','#D95555','#B03C3C','#F7E7E3'], 0],
  ['p21','Roasted Peanuts',         '200 g',  45,  55,  'snacks', ['packet','#A98A52','#8E6B3E','#F3ECDD'], 0],
  ['p22','Coca-Cola',               '750 ml', 40,  45,  'drinks', ['bottle','#C0392B','#8E2820','#F6E6E2'], 1],
  ['p23','Sprite',                  '750 ml', 40,  45,  'drinks', ['bottle','#7FBE52','#5F9440','#EDF5E3'], 0],
  ['p24','Real Mixed Fruit Juice',  '1 L',    99,  115, 'drinks', ['carton','#E07B4E','#C05B33','#F7E9DF'], 0],
  ['p25','Bisleri Water',           '1 L',    20,  22,  'drinks', ['bottle','#7FA9C9','#5B8FC4','#E8F0F6'], 0],
  ['p26','Tata Tea Gold',           '250 g',  140, 160, 'tea',    ['box',   '#D95555','#B03C3C','#F7E7E3'], 0],
  ['p27','Nescaf\u00e9 Classic',    '50 g',   180, 205, 'tea',    ['box',   '#8E6B3E','#6E4E28','#F3ECDD'], 0],
  ['p28','Organic India Green Tea', '25 bags',95,  110, 'tea',    ['box',   '#4E8B4C','#3A6B3A','#EAF3E2'], 0],
  ['p29','Surf Excel Matic',        '1 kg',   150, 170, 'house',  ['box',   '#5B8FC4','#3E6E9E','#E8F0F6'], 1],
  ['p30','Harpic Power Plus',       '500 ml', 89,  99,  'house',  ['pump',  '#4E8B4C','#3A6B3A','#EAF3E2'], 0],
  ['p31','Vim Dishwash Gel',        '500 ml', 60,  75,  'house',  ['pump',  '#E0AF2E','#C08B45','#F6EFDA'], 0],
  ['p32','Garbage Bags',            '30 pcs', 85,  99,  'house',  ['box',   '#7A8A7E','#5A6A5E','#EDF0EC'], 0],
  ['p33','Colgate MaxFresh',        '150 g',  75,  90,  'care',   ['tube',  '#5B8FC4','#3E6E9E','#E8F0F6'], 0],
  ['p34','Dettol Original Soap',    '3 pcs',  99,  120, 'care',   ['bar',   '#4E8B4C','#3A6B3A','#EAF3E2'], 0],
  ['p35','Dove Shampoo',            '340 ml', 210, 245, 'care',   ['pump',  '#E8E4DA','#8E9F5B','#F2F1EA'], 1],
  ['p36','Head & Shoulders',        '180 ml', 199, 230, 'care',   ['pump',  '#5B8FC4','#3E6E9E','#E8F0F6'], 0],
  ['p37','Maggi Noodles',           '4-pack', 56,  70,  'frozen', ['box',   '#E0AF2E','#C08B45','#F6EFDA'], 1],
  ['p38','Safal Frozen Peas',       '500 g',  75,  95,  'frozen', ['sack',  '#6FA35F','#4E8B4C','#EAF3E2'], 0],
  ['p39','Amul Vanilla Tub',        '1 L',    210, 250, 'frozen', ['tub',   '#F2E3C9','#D9B25C','#F6EFE0'], 0],
  ['p40','Dr. Oetker Mayo',         '275 g',  85,  100, 'frozen', ['tub',   '#F2F1EA','#C9A76B','#F1F3EA'], 0],
  ['p41','Cadbury Dairy Milk',      '45 g',   45,  50,  'choco',  ['bar',   '#7A5C9E','#5C447A','#EFEBF4'], 1],
  ['p42','Oreo Biscuits',           '120 g',  30,  35,  'choco',  ['packet','#3E6E9E','#2E5276','#E8EEF6'], 0],
  ['p43','Parle-G Gold',            '800 g',  90,  100, 'choco',  ['packet','#E0AF2E','#C08B45','#F6EFDA'], 0],
  ['p44','KitKat',                  '37 g',   20,  25,  'choco',  ['bar',   '#C0392B','#8E2820','#F6E6E2'], 0],
];
const PRODUCTS = RAW.map(([id, name, unit, price, mrp, cat, art, best], i) => ({
  id, name, unit, price, mrp, cat,
  sku: 'SKU-' + id.toUpperCase(),
  cost: Math.round(price * 0.62),
  stock: 30 + ((i * 17) % 130),
  reorder: 15,
  art: {t: art[0], c1: art[1], c2: art[2], tint: art[3]},
  best: !!best,
}));

/* ---------------- helpers ---------------- */
const uid = () => crypto.randomBytes(8).toString('hex');
const makeToken = () => crypto.randomBytes(24).toString('hex');
const seedAddresses = () => [
  {id: uid(), label: 'Home', line: 'B-402, Green Residency, MG Road, Bengaluru 560001'},
  {id: uid(), label: 'Work', line: '12th Floor, Tower B, ITPL Main Rd, Whitefield 560066'},
];

/* ---------------- persistence (JSON file DB) ---------------- */
function seedDb(){
  const db = {sessions: [], users: [], otps: {}, ordersSeq: 2000, orders: [], riders: [], shops: [], movements: []};
  db.riders = [
    {id: uid(), name: 'Arjun Kumar', phone: '9100000001'},
    {id: uid(), name: 'Meena Joshi', phone: '9100000002'},
    {id: uid(), name: 'Ravi Verma',  phone: '9100000003'},
    {id: uid(), name: 'Sana Sheikh', phone: '9100000004'},
  ];
  const day = 864e5;
  const ago = d => new Date(Date.now() - d * day).toISOString();
  db.shops = [
    {id: uid(), name: 'Sri Balaji Stores', phone: '9800000001', credit: 25000, createdAt: ago(30)},
    {id: uid(), name: 'GreenMart',         phone: '9800000002', credit: 12000, createdAt: ago(22)},
    {id: uid(), name: 'FreshPoint Kirana', phone: '9800000003', credit: 8000,  createdAt: ago(15)},
  ];
  const statuses = ['delivered', 'delivered', 'delivered', 'out_for_delivery', 'packed', 'placed'];
  for(let i = 0; i < 60; i++){
    const daysAgo = (i / 60) * 14;
    const nItems = 1 + Math.floor(Math.random() * 3);
    const items = [];
    let itemTotal = 0;
    for(let j = 0; j < nItems; j++){
      const p = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
      const q = 1 + Math.floor(Math.random() * 3);
      items.push({name: p.name, q});
      itemTotal += p.price * q;
    }
    const isB2B = (i % 8 === 7);
    const status = daysAgo < 1.2 ? statuses[4 + Math.floor(Math.random() * 2)]
                 : daysAgo < 4   ? (Math.random() < 0.5 ? 'out_for_delivery' : 'delivered')
                 : (Math.random() < 0.08 ? 'cancelled' : 'delivered');
    let total = itemTotal + (itemTotal >= 199 ? 0 : 15) + 4;
    let shopId = null;
    if(isB2B){
      let wTotal = 0;
      items.forEach(it => { const p = PRODUCTS.find(x => x.name === it.name); if(p){ it.price = Math.round(p.cost * 1.15); wTotal += it.price * it.q; } });
      const sh = db.shops[Math.floor(Math.random() * db.shops.length)];
      shopId = sh.id;
      total = wTotal;
    }
    db.orders.push({
      id: 'BK' + String(1000 + i).slice(-5),
      kind: isB2B ? 'b2b' : 'b2c',
      shopId,
      sessionId: 'seed',
      items, itemTotal,
      discount: 0, delivery: isB2B ? 0 : (itemTotal >= 199 ? 0 : 15), handling: isB2B ? 0 : 4,
      total,
      addressLabel: isB2B ? (db.shops.find(s => s.id === shopId) || {}).name : 'Home',
      paymentLabel: isB2B ? 'Shop credit' : 'UPI',
      eta: 8 + Math.floor(Math.random() * 9),
      status,
      riderId: (status === 'out_for_delivery' || status === 'delivered') ? db.riders[Math.floor(Math.random() * db.riders.length)].id : null,
      createdAt: ago(daysAgo),
    });
  }
  save(db);
  return db;
}
function load(){
  try{ return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
  catch(e){ return seedDb(); }
}
function save(db){
  fs.mkdirSync(path.dirname(DB_PATH), {recursive: true});
  const tmp = DB_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_PATH);
}
const DB = load();

/* ---------------- sessions ---------------- */
function findSession(req){
  const h = req.headers.authorization || '';
  const t = h.startsWith('Bearer ') ? h.slice(7) : '';
  if(!t) return null;
  return DB.sessions.find(s => s.token === t) || null;
}
function newSession(){
  const s = {
    token: makeToken(), userId: null,
    cart: {}, coupon: null,
    addresses: seedAddresses(), addrId: null,
    orders: [],
  };
  s.addrId = s.addresses[0].id;
  DB.sessions.push(s);
  save(DB);
  return s;
}

/* ---------------- billing (single source of truth) ---------------- */
const COUPONS = {GREEN50: {off: 50, min: 499}, GREEN75: {off: 75, min: 749}};
const FREE_DELIVERY_MIN = 199;

function bill(sess){
  const items = Object.entries(sess.cart || {})
    .map(([id, q]) => { const p = PRODUCTS.find(x => x.id === id); return p ? {p, q} : null; })
    .filter(Boolean);
  const itemTotal = items.reduce((a, {p, q}) => a + p.price * q, 0);
  const c = COUPONS[sess.coupon];
  const discount = (c && itemTotal >= c.min) ? c.off : 0;
  const delivery = itemTotal >= FREE_DELIVERY_MIN ? 0 : 15;
  const handling = items.length ? 4 : 0;
  return {items, itemTotal, discount, delivery, handling, total: itemTotal - discount + delivery + handling};
}
function cartPayload(sess){
  const b = bill(sess);
  return {
    items: b.items.map(({p, q}) => ({
      id: p.id, name: p.name, unit: p.unit, price: p.price, mrp: p.mrp, art: p.art, qty: q,
    })),
    summary: {
      itemTotal: b.itemTotal, discount: b.discount, delivery: b.delivery,
      handling: b.handling, total: b.total, minForFree: FREE_DELIVERY_MIN,
    },
    coupon: sess.coupon,
    addresses: sess.addresses,
    addrId: sess.addrId,
  };
}

/* ---------------- http helpers ---------------- */
function send(res, code, obj){
  res.writeHead(code, {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store'});
  res.end(JSON.stringify(obj));
}
function readBody(req){
  return new Promise((resolve, reject) => {
    let buf = '';
    let size = 0;
    req.on('data', c => {
      size += c.length;
      if(size > 65536){ reject(new Error('Body too large')); req.destroy(); return; }
      buf += c;
    });
    req.on('end', () => {
      if(!buf) return resolve({});
      try{ resolve(JSON.parse(buf)); }catch(e){ reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}


/* same as readBody but returns 400 instead of throwing */
async function jsonBody(req, res){
  try{ return await readBody(req); }
  catch(e){ send(res, 400, {error: e.message}); return null; }
}
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
};
function serveStatic(res, urlPath){
  let rel;
  try{ rel = urlPath === '/' ? 'index.html' : decodeURIComponent(urlPath.slice(1)); }
  catch(e){ return send(res, 400, {error: 'Bad path'}); }
  const full = path.join(__dirname, rel);
  const rootPrefix = __dirname + path.sep;
  if(!full.startsWith(rootPrefix) && full !== path.join(__dirname, 'index.html') && full !== path.join(__dirname, 'app.js')){
    return send(res, 404, {error: 'Not found'});
  }
  fs.readFile(full, (err, data) => {
    if(err) return send(res, 404, {error: 'Not found'});
    res.writeHead(200, {'Content-Type': MIME[path.extname(full).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache'});
    res.end(data);
  });
}

/* ---------- routes ---------- */
const server = http.createServer(async (req, res) => {
  try{
    await handle(req, res);
  }catch(e){
    console.error(e);
    if(!res.headersSent) send(res, 500, {error: 'Internal server error'});
  }
});

async function handle(req, res){
  const u = new URL(req.url, 'http://localhost');
  const p = u.pathname;
  const m = req.method;

  if(p === '/api/health' && m === 'GET'){
    return send(res, 200, {ok: true, service: 'grocery', uptime: Math.round(process.uptime())});
  }

  if(p === '/api/catalog' && m === 'GET'){
    return send(res, 200, {categories: CATEGORIES, products: PRODUCTS});
  }

  if(p === '/api/session' && m === 'POST'){
    const s = newSession();
    return send(res, 200, {token: s.token, user: null, ...cartPayload(s)});
  }

  if(p === '/api/auth/otp' && m === 'POST'){
    const b = await jsonBody(req, res);
  if(b === null) return;
    if(!/^[0-9]{10}$/.test(b.phone || '')) return send(res, 400, {error: 'Enter a valid 10-digit phone number'});
    DB.otps[b.phone] = {code: '2468', exp: Date.now() + 5 * 60 * 1000};
    save(DB);
    return send(res, 200, {demoOtp: '2468'});
  }

  if(p === '/api/auth/verify' && m === 'POST'){
    const b = await jsonBody(req, res);
  if(b === null) return;
    const rec = DB.otps[b.phone || ''];
    if(!rec || Date.now() > rec.exp) return send(res, 400, {error: 'OTP expired — request a new one'});
    if(String(b.otp || '') !== rec.code) return send(res, 400, {error: 'Wrong OTP'});
    delete DB.otps[b.phone];
    let user = DB.users.find(x => x.phone === b.phone);
    if(!user){
      user = {id: uid(), name: 'Guest', phone: b.phone, createdAt: new Date().toISOString()};
      DB.users.push(user);
    }
    let sess = findSession(req);
    if(!sess) sess = newSession();
    sess.userId = user.id;
    save(DB);
    return send(res, 200, {token: sess.token, user: {name: user.name, phone: user.phone}, ...cartPayload(sess)});
  }

  if(p === '/api/auth/admin' && m === 'POST'){
    const b = await jsonBody(req, res);
    if(b === null) return;
    if(b.username !== 'admin' || b.password !== 'admin123'){
      return send(res, 401, {error: 'Wrong admin credentials (hint: admin / admin123)'});
    }
    let sess = findSession(req);
    if(!sess) sess = newSession();
    sess.role = 'admin';
    save(DB);
    return send(res, 200, {token: sess.token, role: 'admin'});
  }

  if(p === '/api/auth/shop' && m === 'POST'){
    const b = await jsonBody(req, res);
    if(b === null) return;
    if(!/^[0-9]{10}$/.test(b.phone || '')) return send(res, 400, {error: 'Enter a valid 10-digit phone'});
    const shop = DB.shops.find(x => x.phone === b.phone);
    if(!shop) return send(res, 404, {error: 'No shop registered with this phone'});
    DB.otps[b.phone] = {code: '2468', exp: Date.now() + 5 * 60 * 1000};
    save(DB);
    return send(res, 200, {demoOtp: '2468'});
  }

  if(p === '/api/auth/shop/verify' && m === 'POST'){
    const b = await jsonBody(req, res);
    if(b === null) return;
    const rec = DB.otps[b.phone || ''];
    if(!rec || Date.now() > rec.exp) return send(res, 400, {error: 'OTP expired'});
    if(String(b.otp || '') !== rec.code) return send(res, 400, {error: 'Wrong OTP'});
    delete DB.otps[b.phone];
    const shop = DB.shops.find(x => x.phone === b.phone);
    if(!shop) return send(res, 404, {error: 'Shop not found'});
    let sess = findSession(req);
    if(!sess) sess = newSession();
    sess.role = 'shop';
    sess.shopId = shop.id;
    save(DB);
    return send(res, 200, {token: sess.token, role: 'shop', shop});
  }

  /* ---- non-API paths: static files ---- */
  if(!p.startsWith('/api/')){
    if(m === 'GET') return serveStatic(res, p);
    return send(res, 405, {error: 'Method not allowed'});
  }

  /* ---- everything below requires a session ---- */
  const sess = findSession(req);
  if(!sess) return send(res, 401, {error: 'Session required — reload the app'});

  if(p === '/api/me' && m === 'GET'){
    const uu = DB.users.find(x => x.id === sess.userId) || null;
    const sh = sess.shopId ? DB.shops.find(x => x.id === sess.shopId) : null;
    return send(res, 200, {
      user: uu ? {name: uu.name, phone: uu.phone} : null,
      role: sess.role || 'customer',
      shop: sh ? {id: sh.id, name: sh.name, credit: sh.credit} : null,
    });
  }

  if(p === '/api/cart' && m === 'GET') return send(res, 200, cartPayload(sess));

  if(p === '/api/cart/items' && m === 'POST'){
    const b = await jsonBody(req, res);
  if(b === null) return;
    const prod = PRODUCTS.find(x => x.id === b.productId);
    if(!prod) return send(res, 404, {error: 'Product not found'});
    const delta = Number(b.delta);
    if(!Number.isFinite(delta)) return send(res, 400, {error: 'Invalid quantity'});
    const q = Math.max(0, Math.min(prod.stock, 99, (sess.cart[prod.id] || 0) + delta));
    if(q === 0) delete sess.cart[prod.id];
    else sess.cart[prod.id] = q;
    save(DB);
    return send(res, 200, cartPayload(sess));
  }

  if(p.startsWith('/api/cart/items/') && m === 'DELETE'){
    const id = decodeURIComponent(p.slice('/api/cart/items/'.length));
    delete sess.cart[id];
    save(DB);
    return send(res, 200, cartPayload(sess));
  }

  if(p === '/api/coupons/apply' && m === 'POST'){
    const b = await jsonBody(req, res);
  if(b === null) return;
    const code = String(b.code || '').trim().toUpperCase();
    const c = COUPONS[code];
    if(!c) return send(res, 400, {error: 'Unknown coupon — try GREEN50 or GREEN75'});
    const bl = bill(sess);
    if(bl.itemTotal < c.min) return send(res, 400, {error: `Add ₹${c.min - bl.itemTotal} more to use ${code}`});
    sess.coupon = code;
    save(DB);
    return send(res, 200, cartPayload(sess));
  }

  if(p === '/api/coupons' && m === 'DELETE'){
    sess.coupon = null;
    save(DB);
    return send(res, 200, cartPayload(sess));
  }

  if(p === '/api/addresses' && m === 'GET'){
    return send(res, 200, {addresses: sess.addresses, addrId: sess.addrId});
  }

  if(p === '/api/addresses' && m === 'POST'){
    const b = await jsonBody(req, res);
  if(b === null) return;
    const label = String(b.label || '').trim();
    const line = String(b.line || '').trim();
    if(!label || label.length > 60) return send(res, 400, {error: 'Enter a label (max 60 characters)'});
    if(!line || line.length > 200) return send(res, 400, {error: 'Enter the full address (max 200 characters)'});
    const a = {id: uid(), label, line};
    sess.addresses.push(a);
    sess.addrId = a.id;
    save(DB);
    return send(res, 200, {addresses: sess.addresses, addrId: sess.addrId, id: a.id});
  }

  if(p === '/api/orders' && m === 'GET'){
    return send(res, 200, {orders: sess.orders || []});
  }

  if(p === '/api/orders' && m === 'POST'){
    const b = await jsonBody(req, res);
  if(b === null) return;
    const bl = bill(sess);
    if(!bl.items.length) return send(res, 400, {error: 'Your cart is empty'});
    for(const it of bl.items){
      if(it.p.stock < it.q) return send(res, 400, {error: it.p.name + ' - only ' + it.p.stock + ' left in stock'});
    }
    const addr = sess.addresses.find(x => x.id === b.addressId) || sess.addresses.find(x => x.id === sess.addrId) || sess.addresses[0];
    if(!addr) return send(res, 400, {error: 'Select a delivery address'});
    const payLabels = {upi: 'UPI', card: 'Credit / Debit Card', cod: 'Cash on Delivery'};
    const pay = payLabels[b.payment] ? b.payment : 'upi';
    DB.ordersSeq = (DB.ordersSeq || 0) + 1;
    const order = {
      id: 'BK' + String(DB.ordersSeq).padStart(5, '0'),
      kind: 'b2c',
      sessionId: sess.token,
      riderId: null,
      items: bl.items.map(({p, q}) => ({name: p.name, q})),
      itemTotal: bl.itemTotal,
      discount: bl.discount,
      delivery: bl.delivery,
      handling: bl.handling,
      total: bl.total,
      addressLabel: addr.label,
      paymentLabel: payLabels[pay],
      eta: 8 + Math.floor(Math.random() * 9),
      status: 'On the way',
      createdAt: new Date().toISOString(),
    };
    bl.items.forEach(({p, q}) => { p.stock -= q; });
    DB.orders.push(order);
    sess.orders.unshift(order);
    sess.cart = {};
    sess.coupon = null;
    save(DB);
    return send(res, 200, {order, ...cartPayload(sess)});
  }

  /* ================= PROVIDER ADMIN ================= */
  if(p === '/api/admin/stats' && m === 'GET'){
    if(sess.role !== 'admin') return send(res, 403, {error: 'Admin only'});
    const dayMs = 864e5;
    const now = Date.now();
    const active = DB.orders.filter(o => o.status !== 'cancelled');
    const series = [];
    for(let d = 13; d >= 0; d--){
      const start = now - (d + 1) * dayMs;
      const end = now - d * dayMs;
      const dayOrders = active.filter(o => { const t = new Date(o.createdAt).getTime(); return t >= start && t < end; });
      series.push({
        day: new Date(end).toLocaleDateString('en-IN', {day: 'numeric', month: 'short'}),
        revenue: dayOrders.reduce((a, o) => a + o.total, 0),
        orders: dayOrders.length,
      });
    }
    const revenue = active.reduce((a, o) => a + o.total, 0);
    const topMap = {};
    active.forEach(o => o.items.forEach(it => {
      topMap[it.name] = topMap[it.name] || {qty: 0, revenue: 0};
      topMap[it.name].qty += it.q;
      const prod = PRODUCTS.find(x => x.name === it.name);
      topMap[it.name].revenue += (prod ? prod.price : 0) * it.q;
    }));
    const topProducts = Object.entries(topMap).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5).map(([name, v]) => ({name, ...v}));
    const statusCounts = {placed: 0, packed: 0, out_for_delivery: 0, delivered: 0, cancelled: 0};
    DB.orders.forEach(o => statusCounts[o.status] = (statusCounts[o.status] || 0) + 1);
    const lowStock = PRODUCTS.filter(x => x.stock <= x.reorder).map(x => ({id: x.id, name: x.name, sku: x.sku, stock: x.stock, reorder: x.reorder}));
    const inventoryValue = PRODUCTS.reduce((a, x) => a + x.stock * x.cost, 0);
    const b2b = DB.orders.filter(o => o.kind === 'b2b' && o.status !== 'cancelled');
    const b2c = DB.orders.filter(o => o.kind === 'b2c' && o.status !== 'cancelled');
    const today = series[series.length - 1];
    return send(res, 200, {
      today: {revenue: today.revenue, orders: today.orders},
      gmv14: revenue,
      aov: active.length ? Math.round(revenue / active.length) : 0,
      series, topProducts, statusCounts, lowStock, inventoryValue,
      mix: {
        b2b: {orders: b2b.length, revenue: b2b.reduce((a, o) => a + o.total, 0)},
        b2c: {orders: b2c.length, revenue: b2c.reduce((a, o) => a + o.total, 0)},
      },
    });
  }

  if(p === '/api/admin/inventory' && m === 'GET'){
    if(sess.role !== 'admin') return send(res, 403, {error: 'Admin only'});
    return send(res, 200, {products: PRODUCTS.map(x => ({
      id: x.id, name: x.name, sku: x.sku, unit: x.unit,
      price: x.price, cost: x.cost, stock: x.stock, reorder: x.reorder,
      status: x.stock === 0 ? 'out' : (x.stock <= x.reorder ? 'low' : 'ok'),
    }))});
  }

  if(p === '/api/admin/stock' && m === 'POST'){
    if(sess.role !== 'admin') return send(res, 403, {error: 'Admin only'});
    const b = await jsonBody(req, res);
    if(b === null) return;
    const prod = PRODUCTS.find(x => x.id === b.productId);
    if(!prod) return send(res, 404, {error: 'Product not found'});
    const delta = Number(b.delta);
    if(!Number.isFinite(delta)) return send(res, 400, {error: 'Invalid stock delta'});
    prod.stock = Math.max(0, prod.stock + delta);
    DB.movements.push({at: new Date().toISOString(), productId: prod.id, delta, reason: String(b.reason || 'adjustment'), by: 'admin'});
    save(DB);
    return send(res, 200, {product: {id: prod.id, stock: prod.stock, status: prod.stock === 0 ? 'out' : (prod.stock <= prod.reorder ? 'low' : 'ok')}});
  }

  if(p === '/api/admin/orders' && m === 'GET'){
    if(sess.role !== 'admin') return send(res, 403, {error: 'Admin only'});
    return send(res, 200, {orders: DB.orders});
  }

  if(p === '/api/admin/riders' && m === 'GET'){
    if(sess.role !== 'admin') return send(res, 403, {error: 'Admin only'});
    return send(res, 200, {riders: DB.riders});
  }

  if(p.startsWith('/api/admin/orders/') && p.endsWith('/status') && m === 'POST'){
    if(sess.role !== 'admin') return send(res, 403, {error: 'Admin only'});
    const id = decodeURIComponent(p.slice('/api/admin/orders/'.length, -'/status'.length));
    const order = DB.orders.find(o => o.id === id);
    if(!order) return send(res, 404, {error: 'Order not found'});
    const b = await jsonBody(req, res);
    if(b === null) return;
    const st = String(b.status || '');
    const NEXT = {placed: 'packed', packed: 'out_for_delivery', out_for_delivery: 'delivered'};
    if(st === 'cancelled'){
      if(order.status === 'delivered' || order.status === 'cancelled') return send(res, 400, {error: 'Cannot cancel this order'});
      order.items.forEach(it => { const prod = PRODUCTS.find(x => x.name === it.name); if(prod) prod.stock += it.q; });
      order.status = 'cancelled';
      order.cancelledAt = new Date().toISOString();
    } else if(NEXT[order.status] === st){
      order.status = st;
      if(st === 'delivered') order.deliveredAt = new Date().toISOString();
    } else {
      return send(res, 400, {error: 'Cannot move order from ' + order.status + ' to ' + st});
    }
    save(DB);
    return send(res, 200, {order});
  }

  if(p.startsWith('/api/admin/orders/') && p.endsWith('/rider') && m === 'POST'){
    if(sess.role !== 'admin') return send(res, 403, {error: 'Admin only'});
    const id = decodeURIComponent(p.slice('/api/admin/orders/'.length, -'/rider'.length));
    const order = DB.orders.find(o => o.id === id);
    if(!order) return send(res, 404, {error: 'Order not found'});
    const b = await jsonBody(req, res);
    if(b === null) return;
    const rider = DB.riders.find(r => r.id === b.riderId);
    if(!rider) return send(res, 404, {error: 'Rider not found'});
    order.riderId = rider.id;
    save(DB);
    return send(res, 200, {order});
  }

  if(p === '/api/admin/shops' && m === 'GET'){
    if(sess.role !== 'admin') return send(res, 403, {error: 'Admin only'});
    return send(res, 200, {shops: DB.shops.map(sh => {
      const os = DB.orders.filter(o => o.shopId === sh.id);
      return {...sh, orderCount: os.length, orderValue: os.reduce((a, o) => a + o.total, 0)};
    })});
  }

  if(p === '/api/admin/shops' && m === 'POST'){
    if(sess.role !== 'admin') return send(res, 403, {error: 'Admin only'});
    const b = await jsonBody(req, res);
    if(b === null) return;
    const name = String(b.name || '').trim();
    const phone = String(b.phone || '').trim();
    if(!name || name.length > 60) return send(res, 400, {error: 'Enter a shop name'});
    if(!/^[0-9]{10}$/.test(phone)) return send(res, 400, {error: 'Enter a valid 10-digit phone'});
    const sh = {id: uid(), name, phone, credit: Number(b.credit) || 0, createdAt: new Date().toISOString()};
    DB.shops.push(sh);
    save(DB);
    return send(res, 200, {shop: sh});
  }

  if(p.startsWith('/api/admin/shops/') && p.endsWith('/credit') && m === 'POST'){
    if(sess.role !== 'admin') return send(res, 403, {error: 'Admin only'});
    const id = decodeURIComponent(p.slice('/api/admin/shops/'.length, -'/credit'.length));
    const sh = DB.shops.find(x => x.id === id);
    if(!sh) return send(res, 404, {error: 'Shop not found'});
    const b = await jsonBody(req, res);
    if(b === null) return;
    const amt = Number(b.amount);
    if(!Number.isFinite(amt)) return send(res, 400, {error: 'Invalid amount'});
    sh.credit = Math.max(0, sh.credit + amt);
    save(DB);
    return send(res, 200, {shop: sh});
  }

  /* ================= B2B SHOP PORTAL ================= */
  if(p === '/api/shop/catalog' && m === 'GET'){
    if(sess.role !== 'shop') return send(res, 403, {error: 'Shop only'});
    const shop = DB.shops.find(x => x.id === sess.shopId);
    if(!shop) return send(res, 404, {error: 'Shop not found'});
    return send(res, 200, {shop, products: PRODUCTS.map(x => ({...x, wholesale: Math.round(x.cost * 1.15)}))});
  }

  if(p === '/api/shop/orders' && m === 'GET'){
    if(sess.role !== 'shop') return send(res, 403, {error: 'Shop only'});
    return send(res, 200, {orders: DB.orders.filter(o => o.shopId === sess.shopId)});
  }

  if(p === '/api/shop/orders' && m === 'POST'){
    if(sess.role !== 'shop') return send(res, 403, {error: 'Shop only'});
    const shop = DB.shops.find(x => x.id === sess.shopId);
    if(!shop) return send(res, 404, {error: 'Shop not found'});
    const b = await jsonBody(req, res);
    if(b === null) return;
    const list = Array.isArray(b.items) ? b.items : [];
    if(!list.length) return send(res, 400, {error: 'Order is empty'});
    let itemTotal = 0;
    const items = [];
    for(const row of list){
      const prod = PRODUCTS.find(x => x.id === row.productId);
      if(!prod) return send(res, 404, {error: 'Unknown product: ' + row.productId});
      const q = Math.max(1, Math.min(999, Math.floor(Number(row.qty) || 1)));
      if(prod.stock < q) return send(res, 400, {error: prod.name + ' - only ' + prod.stock + ' left'});
      const price = Math.round(prod.cost * 1.15);
      items.push({name: prod.name, q, price});
      itemTotal += price * q;
    }
    if(shop.credit < itemTotal) return send(res, 400, {error: 'Insufficient shop credit - need ' + (itemTotal - shop.credit) + ' more'});
    DB.ordersSeq = (DB.ordersSeq || 0) + 1;
    const order = {
      id: 'BK' + String(DB.ordersSeq).padStart(5, '0'),
      kind: 'b2b', shopId: shop.id, sessionId: sess.token,
      items, itemTotal, discount: 0, delivery: 0, handling: 0, total: itemTotal,
      addressLabel: shop.name, paymentLabel: 'Shop credit',
      eta: 8 + Math.floor(Math.random() * 9),
      status: 'placed', riderId: null,
      createdAt: new Date().toISOString(),
    };
    shop.credit -= itemTotal;
    items.forEach(it => { const prod = PRODUCTS.find(x => x.name === it.name); if(prod) prod.stock -= it.q; });
    DB.orders.push(order);
    save(DB);
    return send(res, 200, {order, shop});
  }
  return send(res, 404, {error: 'API route not found'});
}

server.listen(PORT, () => {
  console.log('Grocery backend running → http://localhost:' + PORT);
  console.log('Press Ctrl+C to stop.');
});