/**
 * Capa de LÓGICA DE NEGOCIO — Astra Perfumería.
 * Funciones puras (sin acceso al DOM) para: formato de precios, filtros,
 * carrito, cálculo de totales, validación de datos del cliente y del pago.
 * Al no depender del navegador, se pueden probar con pruebas unitarias en Node.
 */
(function (root) {
  const ENVIO_GRATIS_DESDE = 600000; // COP
  const COSTO_ENVIO = 15000;         // COP
  const MAX_UNIDADES = 10;

  /* ---------- Formato ---------- */
  function formatearPrecio(valor) {
    const n = Math.round(Number(valor) || 0);
    return "$ " + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  /* ---------- Catálogo ---------- */
  function filtrarProductos(productos, categoria, texto) {
    const t = (texto || "").trim().toLowerCase();
    return productos.filter(function (p) {
      const okCat = !categoria || categoria === "Todos" || p.categoria === categoria;
      const okTxt = !t || p.nombre.toLowerCase().includes(t) || p.familia.toLowerCase().includes(t);
      return okCat && okTxt;
    });
  }

  function ordenarProductos(productos, criterio) {
    const copia = productos.slice();
    if (criterio === "precio-asc") copia.sort((a, b) => a.precio - b.precio);
    else if (criterio === "precio-desc") copia.sort((a, b) => b.precio - a.precio);
    else if (criterio === "nombre") copia.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    return copia;
  }

  /* ---------- Carrito (inmutable: siempre devuelve un arreglo nuevo) ---------- */
  function agregarAlCarrito(carrito, producto, cantidad) {
    const cant = cantidad || 1;
    if (!producto || cant <= 0) return carrito.slice();
    const existe = carrito.find((i) => i.id === producto.id);
    if (existe) {
      return carrito.map((i) =>
        i.id === producto.id ? Object.assign({}, i, { cantidad: Math.min(i.cantidad + cant, MAX_UNIDADES) }) : i
      );
    }
    return carrito.concat([{ id: producto.id, nombre: producto.nombre, precio: producto.precio, imagen: producto.imagen, cantidad: Math.min(cant, MAX_UNIDADES) }]);
  }

  function cambiarCantidad(carrito, id, cantidad) {
    if (cantidad <= 0) return eliminarDelCarrito(carrito, id);
    return carrito.map((i) => (i.id === id ? Object.assign({}, i, { cantidad: Math.min(cantidad, MAX_UNIDADES) }) : i));
  }

  function eliminarDelCarrito(carrito, id) {
    return carrito.filter((i) => i.id !== id);
  }

  function contarUnidades(carrito) {
    return carrito.reduce((s, i) => s + i.cantidad, 0);
  }

  function calcularTotales(carrito) {
    const subtotal = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
    const envio = subtotal === 0 || subtotal >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO;
    return { subtotal: subtotal, envio: envio, total: subtotal + envio };
  }

  /* ---------- Validaciones ---------- */
  const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function validarCliente(c) {
    const e = {};
    c = c || {};
    if (!c.nombre || c.nombre.trim().length < 3) e.nombre = "Ingresa tu nombre completo.";
    if (!/^\d{6,10}$/.test((c.documento || "").trim())) e.documento = "Documento de 6 a 10 dígitos.";
    if (!reEmail.test((c.correo || "").trim())) e.correo = "Correo electrónico no válido.";
    if (!/^3\d{9}$/.test((c.telefono || "").replace(/\s/g, ""))) e.telefono = "Celular de 10 dígitos que empiece por 3.";
    if (!c.direccion || c.direccion.trim().length < 5) e.direccion = "Ingresa la dirección de entrega.";
    if (!c.ciudad || c.ciudad.trim().length < 3) e.ciudad = "Ingresa la ciudad.";
    return { valido: Object.keys(e).length === 0, errores: e };
  }

  // Algoritmo de Luhn: verifica que el número de tarjeta tenga formato válido
  function validarLuhn(numero) {
    const d = String(numero || "").replace(/\s|-/g, "");
    if (!/^\d{13,19}$/.test(d)) return false;
    let suma = 0, doble = false;
    for (let i = d.length - 1; i >= 0; i--) {
      let n = parseInt(d[i], 10);
      if (doble) { n *= 2; if (n > 9) n -= 9; }
      suma += n; doble = !doble;
    }
    return suma % 10 === 0;
  }

  function validarVencimiento(mmaa, hoy) {
    const m = /^(\d{2})\/(\d{2})$/.exec((mmaa || "").trim());
    if (!m) return false;
    const mes = parseInt(m[1], 10), anio = 2000 + parseInt(m[2], 10);
    if (mes < 1 || mes > 12) return false;
    const f = hoy || new Date();
    return anio > f.getFullYear() || (anio === f.getFullYear() && mes >= f.getMonth() + 1);
  }

  function validarPago(metodo, datos, hoy) {
    const e = {};
    datos = datos || {};
    if (metodo === "tarjeta") {
      if (!datos.titular || datos.titular.trim().length < 3) e.titular = "Nombre del titular requerido.";
      if (!validarLuhn(datos.numero)) e.numero = "Número de tarjeta no válido.";
      if (!validarVencimiento(datos.vencimiento, hoy)) e.vencimiento = "Fecha MM/AA no válida o vencida.";
      if (!/^\d{3,4}$/.test((datos.cvv || "").trim())) e.cvv = "CVV de 3 o 4 dígitos.";
    } else if (metodo === "pse") {
      if (!datos.banco) e.banco = "Selecciona tu banco.";
    } else if (metodo !== "contraentrega") {
      e.metodo = "Selecciona un método de pago.";
    }
    return { valido: Object.keys(e).length === 0, errores: e };
  }

  function generarNumeroPedido(fecha, aleatorio) {
    const f = fecha || new Date();
    const r = aleatorio === undefined ? Math.random() : aleatorio;
    const p = (n) => String(n).padStart(2, "0");
    return "AST-" + f.getFullYear() + p(f.getMonth() + 1) + p(f.getDate()) + "-" + String(Math.floor(r * 9000) + 1000);
  }

  const API = {
    ENVIO_GRATIS_DESDE, COSTO_ENVIO, MAX_UNIDADES,
    formatearPrecio, filtrarProductos, ordenarProductos,
    agregarAlCarrito, cambiarCantidad, eliminarDelCarrito, contarUnidades, calcularTotales,
    validarCliente, validarLuhn, validarVencimiento, validarPago, generarNumeroPedido
  };

  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else root.AstraLogica = API;
})(this);
