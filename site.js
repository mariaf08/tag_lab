/* ==========================================================
   Tag Lab Shop | site.js
   Lo unico que debes editar en todo el sitio: GTM_ID
   ========================================================== */
var GTM_ID = "GTM-XXXXXXX";

window.dataLayer = window.dataLayer || [];

/* 1. Carga de GTM (equivale al snippet estandar de <head>) */
(function loadGTM() {
  if (!GTM_ID || GTM_ID.indexOf("XXXX") !== -1) {
    window.addEventListener("DOMContentLoaded", function () {
      var warn = document.getElementById("gtm-warning");
      if (warn) warn.hidden = false;
    });
    return;
  }
  window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(GTM_ID);
  document.head.appendChild(s);
})();

/* 2. Catalogo y moneda */
var CURRENCY = "USD";
var PRODUCTS = [
  { item_id: "SKU-001", item_name: "Camiseta Tag Lab", item_category: "Ropa", price: 25 },
  { item_id: "SKU-002", item_name: "Gorra Tag Lab", item_category: "Accesorios", price: 15 },
  { item_id: "SKU-003", item_name: "Taza Tag Lab", item_category: "Hogar", price: 10 }
];

/* 3. Helper de dataLayer: limpia ecommerce antes de cada evento */
function pushEvent(name, ecommerce, extra) {
  window.dataLayer.push({ ecommerce: null });
  var obj = { event: name };
  if (ecommerce) obj.ecommerce = ecommerce;
  if (extra) {
    for (var k in extra) {
      if (Object.prototype.hasOwnProperty.call(extra, k)) obj[k] = extra[k];
    }
  }
  window.dataLayer.push(obj);
}

/* 4. Carrito (sessionStorage) */
function getCart() {
  try { return JSON.parse(sessionStorage.getItem("lab_cart") || "[]"); }
  catch (e) { return []; }
}
function setCart(cart) {
  try { sessionStorage.setItem("lab_cart", JSON.stringify(cart)); } catch (e) {}
}
function cartValue(cart) {
  return cart.reduce(function (sum, i) { return sum + i.price * i.quantity; }, 0);
}
function findProduct(sku) {
  for (var i = 0; i < PRODUCTS.length; i++) {
    if (PRODUCTS[i].item_id === sku) return PRODUCTS[i];
  }
  return null;
}
function addToCart(sku) {
  var p = findProduct(sku);
  if (!p) return;
  var cart = getCart();
  var found = false;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].item_id === sku) { cart[i].quantity += 1; found = true; }
  }
  if (!found) {
    cart.push({
      item_id: p.item_id, item_name: p.item_name, item_category: p.item_category,
      price: p.price, quantity: 1
    });
  }
  setCart(cart);
  pushEvent("add_to_cart", {
    currency: CURRENCY,
    value: p.price,
    items: [{
      item_id: p.item_id, item_name: p.item_name, item_category: p.item_category,
      price: p.price, quantity: 1
    }]
  });
}

/* 5. Checkout simulado: crea la orden y manda a la pagina de gracias */
function checkout() {
  var cart = getCart();
  if (!cart.length) return false;
  var ts = Date.now();
  var order = {
    transaction_id: "T-" + ts,
    event_id: "evt-" + ts,
    currency: CURRENCY,
    value: cartValue(cart),
    items: cart,
    pushed: false,
    event_time: null
  };
  try { localStorage.setItem("lab_order", JSON.stringify(order)); } catch (e) {}
  pushEvent("begin_checkout", { currency: CURRENCY, value: order.value, items: cart });
  setCart([]);
  setTimeout(function () { window.location.href = "gracias.html"; }, 400);
  return true;
}

/* 6. Utilidades */
function getCookie(name) {
  var m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : "";
}
function sha256Hex(str) {
  if (!window.crypto || !window.crypto.subtle) return Promise.resolve("");
  var data = new TextEncoder().encode(str);
  return window.crypto.subtle.digest("SHA-256", data).then(function (buf) {
    return Array.prototype.map.call(new Uint8Array(buf), function (b) {
      return ("0" + b.toString(16)).slice(-2);
    }).join("");
  });
}
function copyText(text, onDone) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(onDone, function () {});
  }
}
