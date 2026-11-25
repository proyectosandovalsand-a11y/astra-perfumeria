# Plan de pruebas — Astra Perfumería

## 1. Estrategia

| Nivel | Herramienta | Alcance |
|---|---|---|
| **Pruebas unitarias** | `node:test` + `node:assert` (nativos de Node.js) | `js/logica.js` y `js/productos.js` |
| **Pruebas funcionales (manuales)** | Navegador (Chrome/Edge) | Flujo completo en `index.html` |

Ejecutar las pruebas unitarias:
```bash
npm test
```

## 2. Casos de prueba unitarios

| ID | Función | Caso | Entrada | Resultado esperado | Estado |
|---|---|---|---|---|---|
| PU-01 | Catálogo | Cantidad de productos | `PRODUCTOS` | 15 | ✅ |
| PU-02 | Catálogo | Rango de precios | todos los productos | 300.000 ≤ precio ≤ 500.000 | ✅ |
| PU-03 | Catálogo | Ids únicos e imagen | todos los productos | ids sin repetir, ruta `.svg` | ✅ |
| PU-04 | `formatearPrecio` | Separador de miles | 459900 / 1234567 / 0 | `$ 459.900` / `$ 1.234.567` / `$ 0` | ✅ |
| PU-05 | `filtrarProductos` | Por categoría | "Mujer" | solo productos de mujer | ✅ |
| PU-06 | `filtrarProductos` | Por texto | "noir", "AMADERADA", "xyz" | Astra Noir / ≥2 / 0 | ✅ |
| PU-07 | `ordenarProductos` | Por precio | asc / desc | ordenado, original intacto | ✅ |
| PU-08 | `agregarAlCarrito` | Producto nuevo | carrito vacío + 1 | 1 ítem, cantidad 1 | ✅ |
| PU-09 | `agregarAlCarrito` | Mismo producto | +1 y +2 | 1 ítem, cantidad 3 | ✅ |
| PU-10 | `agregarAlCarrito` | Límite | cantidad 25 | cantidad 10 | ✅ |
| PU-11 | `agregarAlCarrito` | Inmutabilidad | arreglo original | sigue vacío | ✅ |
| PU-12 | `cambiarCantidad` | Cantidad 0 | 0 | ítem eliminado | ✅ |
| PU-13 | `eliminarDelCarrito` / `contarUnidades` | Conteo | 2 + 3, quitar uno | 5 → 3 | ✅ |
| PU-14 | `calcularTotales` | Con envío | 329.900 | envío 15.000, total 344.900 | ✅ |
| PU-15 | `calcularTotales` | Envío gratis | 919.800 | envío 0 | ✅ |
| PU-16 | `calcularTotales` | Carrito vacío | `[]` | todo en 0 | ✅ |
| PU-17 | `validarCliente` | Datos correctos | cliente válido | `valido: true` | ✅ |
| PU-18 | `validarCliente` | Datos erróneos | correo, celular y cédula inválidos | 3 errores | ✅ |
| PU-19 | `validarCliente` | Vacío | `{}` | 6 errores | ✅ |
| PU-20 | `validarLuhn` | Tarjetas | 4111…1111 / 4111…1112 / 123 | true / false / false | ✅ |
| PU-21 | `validarVencimiento` | Fechas (hoy = 11/2026) | 12/28, 11/26, 10/26, 13/30 | true, true, false, false | ✅ |
| PU-22 | `validarPago` | Tarjeta completa | datos válidos | `valido: true` | ✅ |
| PU-23 | `validarPago` | PSE / contraentrega / método inválido | varios | según el método | ✅ |
| PU-24 | `generarNumeroPedido` | Formato | 24/11/2026, 0.5 | `AST-20261124-5500` | ✅ |

**Resultado:** 24 de 24 pruebas aprobadas.

## 3. Casos de prueba funcionales (manuales)

| ID | Escenario | Pasos | Resultado esperado | Estado |
|---|---|---|---|---|
| PF-01 | Ver catálogo | Abrir `index.html` | Se muestran 15 fragancias con foto y precio | ✅ |
| PF-02 | Filtrar | Clic en "Mujer" | Solo fragancias de mujer | ✅ |
| PF-03 | Buscar | Escribir "oud" | Aparece "Oud Constelación" | ✅ |
| PF-04 | Ver detalle | Clic en una imagen | Se abre ventana con notas y precio | ✅ |
| PF-05 | Agregar al carrito | Clic en "+" | Contador del carrito aumenta y aparece aviso | ✅ |
| PF-06 | Modificar carrito | Usar +, − y "Quitar" | Totales se recalculan | ✅ |
| PF-07 | Persistencia | Recargar la página | El carrito se conserva | ✅ |
| PF-08 | Validación de datos | Enviar formulario vacío | Mensajes de error en rojo por campo | ✅ |
| PF-09 | Pago con tarjeta | Datos de prueba válidos | "Procesando…" y luego "¡Pago exitoso!" | ✅ |
| PF-10 | Tarjeta inválida | Número 4111 1111 1111 1112 | Error "Número de tarjeta no válido" | ✅ |
| PF-11 | Pago PSE | Elegir PSE sin banco | Error "Selecciona tu banco" | ✅ |
| PF-12 | Contraentrega | Elegir contraentrega | "¡Pedido confirmado!" | ✅ |
| PF-13 | Fin de compra | Tras el pago exitoso | Carrito queda en 0 | ✅ |
