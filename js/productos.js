/**
 * Capa de DATOS — Catálogo de Astra Perfumería.
 * Cada producto tiene: id, nombre, categoria, familia, ml, precio (COP),
 * imagen, descripcion y notas olfativas.
 * Funciona en el navegador (window.ASTRA_PRODUCTOS) y en Node (module.exports)
 * para poder usarse en las pruebas unitarias.
 */
(function (root) {
  const PRODUCTOS = [
    { id: 1,  nombre: "Astra Noir",        categoria: "Hombre", familia: "Amaderada",        ml: 100, precio: 459900, imagen: "img/productos/astra-noir.svg",        descripcion: "Intensa y elegante, pensada para la noche.", notas: ["Pimienta negra", "Vetiver", "Pachulí"] },
    { id: 2,  nombre: "Aurum Élixir",      categoria: "Unisex", familia: "Ámbar",            ml: 100, precio: 489900, imagen: "img/productos/aurum-elixir.svg",      descripcion: "Un ámbar dorado y cálido de larga duración.", notas: ["Azafrán", "Ámbar", "Benjuí"] },
    { id: 3,  nombre: "Brisa de Sal",      categoria: "Hombre", familia: "Acuática",         ml: 100, precio: 329900, imagen: "img/productos/brisa-de-sal.svg",      descripcion: "Fresca y limpia como el aire del mar.", notas: ["Sal marina", "Bergamota", "Cedro"] },
    { id: 4,  nombre: "Rosa Celeste",      categoria: "Mujer",  familia: "Floral",           ml: 90,  precio: 399900, imagen: "img/productos/rosa-celeste.svg",      descripcion: "Rosa luminosa con un fondo suave y moderno.", notas: ["Rosa de Damasco", "Lichi", "Almizcle"] },
    { id: 5,  nombre: "Vainilla Lunar",    categoria: "Mujer",  familia: "Oriental gourmand", ml: 80, precio: 359900, imagen: "img/productos/vainilla-lunar.svg",    descripcion: "Dulce, envolvente y sofisticada.", notas: ["Vainilla", "Haba tonka", "Caramelo"] },
    { id: 6,  nombre: "Cedro Imperial",    categoria: "Hombre", familia: "Amaderada",        ml: 100, precio: 419900, imagen: "img/productos/cedro-imperial.svg",    descripcion: "Madera seca con un toque especiado.", notas: ["Cedro del Atlas", "Cardamomo", "Cuero"] },
    { id: 7,  nombre: "Jardín de Azahar",  categoria: "Mujer",  familia: "Floral cítrica",   ml: 100, precio: 349900, imagen: "img/productos/jardin-de-azahar.svg",  descripcion: "Alegre y luminosa para el día a día.", notas: ["Flor de azahar", "Mandarina", "Neroli"] },
    { id: 8,  nombre: "Oud Constelación",  categoria: "Unisex", familia: "Oud",              ml: 75,  precio: 499900, imagen: "img/productos/oud-constelacion.svg",  descripcion: "Nuestra fragancia más exclusiva y profunda.", notas: ["Oud", "Rosa", "Incienso"] },
    { id: 9,  nombre: "Cítrico Polar",     categoria: "Unisex", familia: "Cítrica",          ml: 100, precio: 309900, imagen: "img/productos/citrico-polar.svg",     descripcion: "Explosión cítrica, ideal para clima cálido.", notas: ["Limón", "Pomelo", "Menta"] },
    { id: 10, nombre: "Iris Nocturno",     categoria: "Mujer",  familia: "Floral atalcada",  ml: 90,  precio: 439900, imagen: "img/productos/iris-nocturno.svg",     descripcion: "Misteriosa, suave y empolvada.", notas: ["Iris", "Violeta", "Sándalo"] },
    { id: 11, nombre: "Tabaco & Cuero",    categoria: "Hombre", familia: "Cuero",            ml: 100, precio: 469900, imagen: "img/productos/tabaco-y-cuero.svg",    descripcion: "Carácter fuerte con calidez de tabaco.", notas: ["Hoja de tabaco", "Cuero", "Miel"] },
    { id: 12, nombre: "Lavanda Estelar",   categoria: "Hombre", familia: "Aromática",        ml: 100, precio: 339900, imagen: "img/productos/lavanda-estelar.svg",   descripcion: "Clásica y versátil, de oficina a la noche.", notas: ["Lavanda", "Salvia", "Haba tonka"] },
    { id: 13, nombre: "Peonía Dorada",     categoria: "Mujer",  familia: "Floral frutal",    ml: 80,  precio: 379900, imagen: "img/productos/peonia-dorada.svg",     descripcion: "Femenina, frutal y muy fresca.", notas: ["Peonía", "Pera", "Almizcle blanco"] },
    { id: 14, nombre: "Almizcle Blanco",   categoria: "Unisex", familia: "Almizclada",       ml: 100, precio: 319900, imagen: "img/productos/almizcle-blanco.svg",   descripcion: "Aroma a piel limpia, sutil y cercano.", notas: ["Almizcle", "Algodón", "Ámbar gris"] },
    { id: 15, nombre: "Nebulosa Ámbar",    categoria: "Mujer",  familia: "Oriental",         ml: 100, precio: 449900, imagen: "img/productos/nebulosa-ambar.svg",    descripcion: "Cálida y especiada, con fondo resinoso.", notas: ["Canela", "Ámbar", "Mirra"] }
  ];

  if (typeof module !== "undefined" && module.exports) {
    module.exports = PRODUCTOS;
  } else {
    root.ASTRA_PRODUCTOS = PRODUCTOS;
  }
})(this);
