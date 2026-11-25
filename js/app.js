/**
 * Capa de PRESENTACIÓN / CONTROLADOR — Astra Perfumería.
 * Se encarga del DOM: pinta el catálogo, maneja eventos, el carrito,
 * el checkout y la pantalla de pago exitoso. Toda regla de negocio
 * se delega a AstraLogica (js/logica.js).
 */
(function () {
  const L = window.AstraLogica;
  const PRODUCTOS = window.ASTRA_PRODUCTOS;
  const CLAVE = "astra_carrito";
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* ---------- Estado ---------- */
  const estado = {
    categoria: "Todos",
    texto: "",
    orden: "",
    carrito: cargarCarrito(),
    cliente: null,
  };

  function cargarCarrito() {
    try { return JSON.parse(localStorage.getItem(CLAVE)) || []; } catch (e) { return []; }
  }
  function guardarCarrito() {
    try { localStorage.setItem(CLAVE, JSON.stringify(estado.carrito)); } catch (e) { /* sin almacenamiento */ }
  }
  function setCarrito(nuevo) {
    estado.carrito = nuevo;
    guardarCarrito();
    pintarBadge();
    pintarCarrito();
  }

  /* ---------- Catálogo ---------- */
  function pintarCatalogo() {
    const lista = L.ordenarProductos(L.filtrarProductos(PRODUCTOS, estado.categoria, estado.texto), estado.orden);
    $("#resultados").textContent = lista.length + (lista.length === 1 ? " fragancia" : " fragancias");
    $("#gridProductos").innerHTML = lista.length
      ? lista.map(tarjetaHTML).join("")
      : '<p class="sin-resultados">No encontramos fragancias con ese criterio.</p>';
  }

  function tarjetaHTML(p) {
    return `
      <article class="tarjeta">
        <div class="tarjeta__img" data-ver="${p.id}">
          <img src="${p.imagen}" alt="${p.nombre}" loading="lazy">
          <span class="etiqueta-cat">${p.categoria}</span>
        </div>
        <div class="tarjeta__info">
          <span class="tarjeta__familia">${p.familia} · ${p.ml} ml</span>
          <h3 class="tarjeta__nombre" data-ver="${p.id}">${p.nombre}</h3>
          <div class="tarjeta__pie">
            <span class="precio">${L.formatearPrecio(p.precio)} <small>COP</small></span>
            <button class="btn-agregar" data-agregar="${p.id}" aria-label="Agregar ${p.nombre} al carrito">+</button>
          </div>
        </div>
      </article>`;
  }

  /* ---------- Detalle de producto ---------- */
  function abrirDetalle(id) {
    const p = PRODUCTOS.find((x) => x.id === id);
    if (!p) return;
    let cant = 1;
    const cont = $("#detalleProducto");
    cont.innerHTML = `
      <div class="detalle">
        <img src="${p.imagen}" alt="${p.nombre}">
        <div class="detalle__info">
          <span class="eyebrow">${p.categoria} · ${p.familia}</span>
          <h3>${p.nombre}</h3>
          <p>${p.descripcion}</p>
          <div><strong>Notas principales</strong></div>
          <div class="detalle__notas">${p.notas.map((n) => `<span>${n}</span>`).join("")}</div>
          <p class="tarjeta__familia">Eau de Parfum · ${p.ml} ml</p>
          <span class="precio">${L.formatearPrecio(p.precio)} <small>COP</small></span>
          <div class="detalle__acciones">
            <div class="cantidad"><button data-d="-1">−</button><span id="cantDetalle">1</span><button data-d="1">+</button></div>
            <button class="btn btn--oro" id="btnAgregarDetalle">Agregar al carrito</button>
          </div>
        </div>
      </div>`;
    $$(".cantidad button", cont).forEach((b) =>
      b.addEventListener("click", () => {
        cant = Math.max(1, Math.min(L.MAX_UNIDADES, cant + Number(b.dataset.d)));
        $("#cantDetalle").textContent = cant;
      })
    );
    $("#btnAgregarDetalle").addEventListener("click", () => {
      setCarrito(L.agregarAlCarrito(estado.carrito, p, cant));
      cerrar($("#modalProducto"));
      toast(`${p.nombre} agregado al carrito`);
    });
    abrir($("#modalProducto"));
  }

  /* ---------- Carrito ---------- */
  function pintarBadge() {
    $("#badgeCarrito").textContent = L.contarUnidades(estado.carrito);
  }

  function pintarCarrito() {
    const items = $("#itemsCarrito"), pie = $("#pieCarrito");
    if (!estado.carrito.length) {
      items.innerHTML = '<p class="vacio">Tu carrito está vacío.</p>';
      pie.innerHTML = '<a href="#catalogo" class="btn btn--linea btn--ancho" data-cerrar-carrito>Ver catálogo</a>';
      return;
    }
    items.innerHTML = estado.carrito.map((i) => `
      <div class="item">
        <img src="${i.imagen}" alt="${i.nombre}">
        <div>
          <div class="item__nombre">${i.nombre}</div>
          <div class="item__precio">${L.formatearPrecio(i.precio)}</div>
          <div class="cantidad"><button data-cant="${i.id}" data-d="-1">−</button><span>${i.cantidad}</span><button data-cant="${i.id}" data-d="1">+</button></div>
        </div>
        <div style="text-align:right">
          <div><strong>${L.formatearPrecio(i.precio * i.cantidad)}</strong></div>
          <button class="item__quitar" data-quitar="${i.id}">Quitar</button>
        </div>
      </div>`).join("");
    const t = L.calcularTotales(estado.carrito);
    const falta = L.ENVIO_GRATIS_DESDE - t.subtotal;
    pie.innerHTML = `
      ${falta > 0 ? `<p class="aviso-envio">Te faltan ${L.formatearPrecio(falta)} para envío gratis</p>` : '<p class="aviso-envio">¡Tienes envío gratis!</p>'}
      ${totalesHTML(t)}
      <button class="btn btn--oro btn--ancho" id="btnComprar">Comprar ahora</button>`;
  }

  function totalesHTML(t) {
    return `
      <div class="fila"><span>Subtotal</span><span>${L.formatearPrecio(t.subtotal)}</span></div>
      <div class="fila"><span>Envío</span><span>${t.envio ? L.formatearPrecio(t.envio) : "Gratis"}</span></div>
      <div class="fila fila--total"><span>Total</span><span>${L.formatearPrecio(t.total)} COP</span></div>`;
  }

  /* ---------- Checkout ---------- */
  function irAPaso(n) {
    $$(".paso").forEach((p) => {
      const k = Number(p.dataset.paso);
      p.classList.toggle("activo", k === n);
      p.classList.toggle("hecho", k < n);
    });
    $("#formCliente").hidden = n !== 1;
    $("#formPago").hidden = n !== 2;
    $("#exito").hidden = n !== 3;
    $("#resumenCheckout").hidden = n === 3;
    $(".checkout__cuerpo").style.gridTemplateColumns = n === 3 ? "1fr" : "";
  }

  function abrirCheckout() {
    if (!estado.carrito.length) return;
    cerrar($("#panelCarrito"));
    pintarResumen();
    $("#procesando").hidden = true;
    cambiarMetodo();
    irAPaso(1);
    abrir($("#modalCheckout"));
  }

  function pintarResumen() {
    $("#resumenCheckout").innerHTML = `
      <h4>Resumen del pedido</h4>
      ${estado.carrito.map((i) => `<div class="resumen__item"><span>${i.cantidad} × ${i.nombre}</span><span>${L.formatearPrecio(i.precio * i.cantidad)}</span></div>`).join("")}
      <div style="margin-top:10px">${totalesHTML(L.calcularTotales(estado.carrito))}</div>`;
  }

  function leerFormulario(form) {
    const datos = {};
    new FormData(form).forEach((v, k) => (datos[k] = String(v)));
    return datos;
  }

  function mostrarErrores(form, errores) {
    $$(".campo", form).forEach((c) => {
      const input = $("input, select", c);
      if (!input) return;
      const msg = errores[input.name] || "";
      c.classList.toggle("error", !!msg);
      const small = $("small", c);
      if (small) small.textContent = msg;
    });
    const primero = $(".campo.error input, .campo.error select", form);
    if (primero) primero.focus();
  }

  function enviarCliente(e) {
    e.preventDefault();
    const datos = leerFormulario(e.target);
    const r = L.validarCliente(datos);
    mostrarErrores(e.target, r.errores);
    if (!r.valido) return;
    estado.cliente = datos;
    irAPaso(2);
  }

  function metodoActual() {
    return $('input[name="metodo"]:checked', $("#formPago")).value;
  }

  function cambiarMetodo() {
    const m = metodoActual();
    $$(".bloque-metodo").forEach((b) => (b.hidden = b.dataset.metodo !== m));
    $("#btnPagar").textContent = m === "contraentrega" ? "Confirmar pedido" : "Pagar " + L.formatearPrecio(L.calcularTotales(estado.carrito).total);
  }

  function enviarPago(e) {
    e.preventDefault();
    const metodo = metodoActual();
    const r = L.validarPago(metodo, leerFormulario(e.target));
    mostrarErrores(e.target, r.errores);
    if (!r.valido) return;

    // Simulación de pasarela de pago
    e.target.hidden = true;
    $("#procesando").hidden = false;
    setTimeout(() => {
      $("#procesando").hidden = true;
      mostrarExito(metodo);
    }, 1800);
  }

  function mostrarExito(metodo) {
    const pedido = L.generarNumeroPedido();
    const t = L.calcularTotales(estado.carrito);
    const c = estado.cliente;
    const nombresMetodo = { tarjeta: "Tarjeta de crédito/débito", pse: "PSE", contraentrega: "Contraentrega" };
    $("#exito").innerHTML = `
      <div class="exito__icono">✓</div>
      <h3>${metodo === "contraentrega" ? "¡Pedido confirmado!" : "¡Pago exitoso!"}</h3>
      <p>Gracias por tu compra, ${c.nombre.split(" ")[0]}. Enviamos la confirmación a <strong>${c.correo}</strong>.</p>
      <div class="exito__pedido">Pedido N.º ${pedido}</div>
      <div class="exito__datos">
        <p><strong>Cliente:</strong> ${c.nombre} · C.C. ${c.documento}</p>
        <p><strong>Entrega:</strong> ${c.direccion}, ${c.ciudad}</p>
        <p><strong>Celular:</strong> ${c.telefono}</p>
        <p><strong>Método de pago:</strong> ${nombresMetodo[metodo]}</p>
        <p><strong>Productos:</strong> ${estado.carrito.map((i) => i.cantidad + " × " + i.nombre).join(", ")}</p>
        <p><strong>Total pagado:</strong> ${L.formatearPrecio(t.total)} COP</p>
      </div>
      <button class="btn btn--oro" id="btnFinalizar">Seguir comprando</button>`;
    irAPaso(3);
    setCarrito([]);
    $("#formCliente").reset();
    $("#formPago").reset();
    $("#btnFinalizar").addEventListener("click", () => cerrar($("#modalCheckout")));
  }

  /* ---------- Utilidades UI ---------- */
  function abrir(el) { el.hidden = false; document.body.style.overflow = "hidden"; }
  function cerrar(el) { el.hidden = true; if (!$(".overlay:not([hidden])")) document.body.style.overflow = ""; }

  let tToast;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("visible");
    clearTimeout(tToast);
    tToast = setTimeout(() => t.classList.remove("visible"), 2200);
  }

  /* ---------- Eventos ---------- */
  function iniciar() {
    pintarCatalogo();
    pintarBadge();
    pintarCarrito();

    $("#filtros").addEventListener("click", (e) => {
      const b = e.target.closest(".filtro");
      if (!b) return;
      $$(".filtro").forEach((x) => x.classList.remove("activo"));
      b.classList.add("activo");
      estado.categoria = b.dataset.cat;
      pintarCatalogo();
    });
    $("#buscador").addEventListener("input", (e) => { estado.texto = e.target.value; pintarCatalogo(); });
    $("#orden").addEventListener("change", (e) => { estado.orden = e.target.value; pintarCatalogo(); });

    $("#gridProductos").addEventListener("click", (e) => {
      const add = e.target.closest("[data-agregar]");
      if (add) {
        const p = PRODUCTOS.find((x) => x.id === Number(add.dataset.agregar));
        setCarrito(L.agregarAlCarrito(estado.carrito, p, 1));
        toast(`${p.nombre} agregado al carrito`);
        return;
      }
      const ver = e.target.closest("[data-ver]");
      if (ver) abrirDetalle(Number(ver.dataset.ver));
    });

    $("#btnAbrirCarrito").addEventListener("click", () => abrir($("#panelCarrito")));
    $("#panelCarrito").addEventListener("click", (e) => {
      const c = e.target.closest("[data-cant]");
      if (c) {
        const item = estado.carrito.find((i) => i.id === Number(c.dataset.cant));
        setCarrito(L.cambiarCantidad(estado.carrito, item.id, item.cantidad + Number(c.dataset.d)));
      }
      const q = e.target.closest("[data-quitar]");
      if (q) setCarrito(L.eliminarDelCarrito(estado.carrito, Number(q.dataset.quitar)));
      if (e.target.closest("#btnComprar")) abrirCheckout();
      if (e.target.closest("[data-cerrar-carrito]")) cerrar($("#panelCarrito"));
    });

    // Cerrar overlays con la X, clic en el fondo o Escape
    $$(".overlay").forEach((ov) =>
      ov.addEventListener("click", (e) => {
        if (e.target === ov || e.target.closest("[data-cerrar]")) cerrar(ov);
      })
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") $$(".overlay:not([hidden])").forEach(cerrar);
    });

    $("#formCliente").addEventListener("submit", enviarCliente);
    $("#formPago").addEventListener("submit", enviarPago);
    $("#formPago").addEventListener("change", (e) => { if (e.target.name === "metodo") cambiarMetodo(); });
    $("#btnVolver").addEventListener("click", () => irAPaso(1));

    // Formato automático de tarjeta y vencimiento
    const num = $('input[name="numero"]');
    num.addEventListener("input", () => { num.value = num.value.replace(/\D/g, "").slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 "); });
    const venc = $('input[name="vencimiento"]');
    venc.addEventListener("input", () => {
      const d = venc.value.replace(/\D/g, "").slice(0, 4);
      venc.value = d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
    });
    $$('input[inputmode="numeric"]:not([name="numero"])').forEach((i) =>
      i.addEventListener("input", () => (i.value = i.value.replace(/\D/g, "")))
    );

    cambiarMetodo();
  }

  document.addEventListener("DOMContentLoaded", iniciar);
})();
