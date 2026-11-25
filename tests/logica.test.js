/**
 * Pruebas unitarias — Astra Perfumería
 * Ejecutar con:  npm test   (o)   node --test tests/logica.test.js
 * Usa el módulo de pruebas nativo de Node.js (node:test), sin dependencias.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logica.js");
const PRODUCTOS = require("../js/productos.js");

const p1 = PRODUCTOS[0]; // Astra Noir  459.900
const p3 = PRODUCTOS[2]; // Brisa de Sal 329.900

/* ===== Catálogo (datos) ===== */
test("el catálogo tiene 15 productos", () => {
  assert.equal(PRODUCTOS.length, 15);
});

test("todos los precios están entre 300.000 y 500.000 COP", () => {
  PRODUCTOS.forEach((p) => assert.ok(p.precio >= 300000 && p.precio <= 500000, p.nombre));
});

test("los ids de los productos son únicos y todos tienen imagen", () => {
  const ids = new Set(PRODUCTOS.map((p) => p.id));
  assert.equal(ids.size, PRODUCTOS.length);
  PRODUCTOS.forEach((p) => assert.match(p.imagen, /^img\/productos\/.+\.svg$/));
});

/* ===== Formato ===== */
test("formatearPrecio usa separador de miles con punto", () => {
  assert.equal(L.formatearPrecio(459900), "$ 459.900");
  assert.equal(L.formatearPrecio(1234567), "$ 1.234.567");
  assert.equal(L.formatearPrecio(0), "$ 0");
});

/* ===== Filtros y orden ===== */
test("filtrarProductos por categoría", () => {
  const mujer = L.filtrarProductos(PRODUCTOS, "Mujer", "");
  assert.ok(mujer.length > 0);
  assert.ok(mujer.every((p) => p.categoria === "Mujer"));
  assert.equal(L.filtrarProductos(PRODUCTOS, "Todos", "").length, 15);
});

test("filtrarProductos por texto (nombre o familia, sin importar mayúsculas)", () => {
  assert.equal(L.filtrarProductos(PRODUCTOS, "Todos", "noir")[0].nombre, "Astra Noir");
  assert.ok(L.filtrarProductos(PRODUCTOS, "Todos", "AMADERADA").length >= 2);
  assert.equal(L.filtrarProductos(PRODUCTOS, "Todos", "xyz").length, 0);
});

test("ordenarProductos por precio ascendente y descendente sin modificar el original", () => {
  const asc = L.ordenarProductos(PRODUCTOS, "precio-asc");
  const desc = L.ordenarProductos(PRODUCTOS, "precio-desc");
  assert.ok(asc[0].precio <= asc[asc.length - 1].precio);
  assert.ok(desc[0].precio >= desc[desc.length - 1].precio);
  assert.equal(PRODUCTOS[0].id, 1);
});

/* ===== Carrito ===== */
test("agregarAlCarrito agrega un producto nuevo", () => {
  const c = L.agregarAlCarrito([], p1, 1);
  assert.equal(c.length, 1);
  assert.equal(c[0].cantidad, 1);
});

test("agregar el mismo producto suma la cantidad", () => {
  let c = L.agregarAlCarrito([], p1, 1);
  c = L.agregarAlCarrito(c, p1, 2);
  assert.equal(c.length, 1);
  assert.equal(c[0].cantidad, 3);
});

test("la cantidad máxima por producto es 10", () => {
  const c = L.agregarAlCarrito([], p1, 25);
  assert.equal(c[0].cantidad, L.MAX_UNIDADES);
});

test("el carrito es inmutable (no modifica el arreglo original)", () => {
  const original = [];
  L.agregarAlCarrito(original, p1, 1);
  assert.equal(original.length, 0);
});

test("cambiarCantidad a 0 elimina el producto", () => {
  const c = L.cambiarCantidad(L.agregarAlCarrito([], p1, 2), p1.id, 0);
  assert.equal(c.length, 0);
});

test("eliminarDelCarrito y contarUnidades", () => {
  let c = L.agregarAlCarrito([], p1, 2);
  c = L.agregarAlCarrito(c, p3, 3);
  assert.equal(L.contarUnidades(c), 5);
  c = L.eliminarDelCarrito(c, p1.id);
  assert.equal(L.contarUnidades(c), 3);
});

/* ===== Totales ===== */
test("calcularTotales cobra envío si el subtotal es menor a 600.000", () => {
  const t = L.calcularTotales(L.agregarAlCarrito([], p3, 1));
  assert.deepEqual(t, { subtotal: 329900, envio: 15000, total: 344900 });
});

test("calcularTotales da envío gratis desde 600.000", () => {
  const t = L.calcularTotales(L.agregarAlCarrito([], p1, 2)); // 919.800
  assert.equal(t.envio, 0);
  assert.equal(t.total, 919800);
});

test("carrito vacío tiene total 0 y sin envío", () => {
  assert.deepEqual(L.calcularTotales([]), { subtotal: 0, envio: 0, total: 0 });
});

/* ===== Validación del cliente ===== */
const clienteOK = {
  nombre: "Luis López", documento: "1090123456", correo: "luis@correo.com",
  telefono: "3001234567", direccion: "Calle 10 # 5-20", ciudad: "Cúcuta",
};

test("validarCliente acepta datos correctos", () => {
  assert.equal(L.validarCliente(clienteOK).valido, true);
});

test("validarCliente rechaza correo, celular y cédula inválidos", () => {
  const r = L.validarCliente(Object.assign({}, clienteOK, { correo: "luis@", telefono: "12345", documento: "12a" }));
  assert.equal(r.valido, false);
  assert.ok(r.errores.correo);
  assert.ok(r.errores.telefono);
  assert.ok(r.errores.documento);
});

test("validarCliente rechaza formulario vacío con todos los errores", () => {
  const r = L.validarCliente({});
  assert.equal(Object.keys(r.errores).length, 6);
});

/* ===== Validación del pago ===== */
test("validarLuhn: tarjeta de prueba válida e inválida", () => {
  assert.equal(L.validarLuhn("4111 1111 1111 1111"), true);
  assert.equal(L.validarLuhn("4111 1111 1111 1112"), false);
  assert.equal(L.validarLuhn("123"), false);
});

test("validarVencimiento según la fecha actual", () => {
  const hoy = new Date(2026, 10, 24); // noviembre 2026
  assert.equal(L.validarVencimiento("12/28", hoy), true);
  assert.equal(L.validarVencimiento("11/26", hoy), true);
  assert.equal(L.validarVencimiento("10/26", hoy), false);
  assert.equal(L.validarVencimiento("13/30", hoy), false);
});

test("validarPago con tarjeta completa es válido", () => {
  const hoy = new Date(2026, 10, 24);
  const r = L.validarPago("tarjeta", { titular: "Luis López", numero: "4111111111111111", vencimiento: "08/29", cvv: "123" }, hoy);
  assert.equal(r.valido, true);
});

test("validarPago PSE exige banco y contraentrega no exige datos", () => {
  assert.equal(L.validarPago("pse", {}).valido, false);
  assert.equal(L.validarPago("pse", { banco: "Bancolombia" }).valido, true);
  assert.equal(L.validarPago("contraentrega", {}).valido, true);
  assert.equal(L.validarPago("bitcoin", {}).valido, false);
});

/* ===== Pedido ===== */
test("generarNumeroPedido tiene el formato AST-AAAAMMDD-NNNN", () => {
  const n = L.generarNumeroPedido(new Date(2026, 10, 24), 0.5);
  assert.equal(n, "AST-20261124-5500");
  assert.match(L.generarNumeroPedido(), /^AST-\d{8}-\d{4}$/);
});
