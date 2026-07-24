# Origen de los datos — Portal de Clientes Anticaidas

Documento técnico: **de dónde sale cada dato** que ve el cliente y **cómo se completa**.

---

## 1. Fuentes de información

| Símbolo | Fuente | Detalle |
|---|---|---|
| 🟦 | **AppSheet · PROYECTOS** | Tabla principal (LISTADO DE PROYECTOS.xlsx en Office365). PK: `CODIGO DE PROYECTO`. |
| 🟩 | **AppSheet · REGISTRO** | Registros de instalación (ligados al proyecto por `CODIGO DE PROYECTO`). |
| 🟨 | **AppSheet · STATUS** | Catálogo de estados (`id_status`, `nombre`, `orden`). |
| 🟪 | **SharePoint (Microsoft Graph)** | Archivos PDF del sitio *SitioclientesAnticadas*. |
| ⚙️ | **Variable de entorno** | Configuración en cPanel (`.env`). |
| 🧮 | **Calculado** | Derivado en el backend a partir de otros datos. |
| 📌 | **Fijo** | Texto hardcodeado en el frontend. |

**Flujo:** cada ~10 min el backend **sincroniza** PROYECTOS + REGISTRO + STATUS (AppSheet API) y los certificados (Graph) a un caché local (`data/portal.json`). El cliente lee de ese caché → respuestas instantáneas. Los PDF se descargan en vivo desde SharePoint vía proxy (`/api/doc/...`).

**Filtro por cliente:** al ingresar con un RUT, solo se muestran los proyectos cuya columna `PROYECTOS.RUT` coincide.

---

## 2. Vista principal (Inicio)

### Cliente (encabezado y chip de usuario)
Se toma del **primer proyecto** del RUT.

| Dato | Fuente | Columna / detalle |
|---|---|---|
| Razón social | 🟦 | `CLIENTE` (o `EMPRESA`) |
| Nombre del contacto ("Hola, …") | 🟦 | `NOMBRE CONTACTO` |
| RUT | 🟦 🧮 | `RUT` (normalizado a `76326949-3`) |

### Ejecutivo de cuenta (panel lateral)
| Dato | Fuente | Detalle |
|---|---|---|
| Nombre / cargo / correo / teléfono / móvil | ⚙️ | `EJECUTIVO_*` en `.env` (fijo, mismo para todos) |
| Horario "Disponible Lun–Vie 09:00–18:00" | 📌 | Texto fijo |

### Indicadores (KPIs) y filtros
| Dato | Fuente | Detalle |
|---|---|---|
| Total / En ejecución / Terminados / Archivados | 🟨 🧮 | Se cuenta por **estado**, que sale de `PROYECTOS.ESTADO` → `STATUS.nombre` → mapeo (ver §4) |

### Tarjeta de proyecto
| Dato | Fuente | Columna / detalle |
|---|---|---|
| Estado (pill) | 🟦 🟨 🧮 | `ESTADO` (id) → `STATUS.nombre` → bucket (ver §4) |
| Código | 🟦 | `CODIGO DE PROYECTO` |
| Nombre | 🟦 | `NOMBRE DEL PROYECTO` (si vacío → `DIRECCION DE INSTALACION` → código) |
| Tipo de sistema | 🟦 🧮 | Columnas de conteo `LV HORIZONTAL`, `LV VERTICAL`, `PUNTO DE ANCLAJE`, etc. (arma "LV Horizontal ×2 · …") |
| Extensión | 🟩 🧮 | Suma de `METROS TOTALES` de los registros → "X m" |
| Fecha (Inicio / Entrega) | 🟦 🧮 | `FECHA_DE_INICIO` / `FECHA DE FINALIZACION` (US → DD-MM-YYYY) |
| Diseño | 🟦 | `DISEÑADO POR` |
| Barra de progreso | 🟨 🧮 | `STATUS.orden` / `orden(FINALIZADO)` — solo en proyectos en ejecución (ver §4) |
| Chip "Certificados Vigentes/Vencidos" | 🟩 🟪 🧮 | Fecha de mantención (ver §5) vs hoy. Solo si hay certificados. |
| N documentos | 🟪 🧮 | Suma de archivos de todas las carpetas del proyecto |

### Próxima inspección (panel lateral)
| Dato | Fuente | Detalle |
|---|---|---|
| Proyecto + fecha (MM-YYYY) | 🟩 🧮 | Proyecto con la **próxima mantención** futura más cercana (ver §5). Se oculta si no hay ninguna. |

---

## 3. Vista de detalle de proyecto

### Encabezado y datos clave
| Dato | Fuente | Columna / detalle |
|---|---|---|
| Código / nombre / tipo de sistema / estado | 🟦 🟨 | Igual que en la tarjeta |
| Extensión total | 🟩 🧮 | Suma de `METROS TOTALES` |
| Usuarios simultáneos | 🟩 | `CANTIDAD DE USUARIOS` (primer registro) |
| Fecha de ejecución | 🟦 | `FECHA_DE_INICIO` |
| Fecha de entrega | 🟦 | `FECHA DE FINALIZACION` |
| Avance del proyecto (%) | 🟨 🧮 | `STATUS.orden` / 6 (ver §4) |

### Bloques informativos
| Dato | Fuente | Columna / detalle |
|---|---|---|
| **Descripción** | 🟦 🟩 🧮 | Texto armado con: tipo de sistema, extensión, usuarios (`CANTIDAD DE USUARIOS`), ubicación (`COMUNA/REGION DE INSTALACION`) y duración (`DIAS VENDIDOS`). Omite lo que venga vacío. |
| Diseño | 🟦 | `DISEÑADO POR` |
| Instalador | 🟩 | `INSTALADOR` (primer registro) |
| Validado por | 🟦 | `NOMBRE CONTACTO` |
| Solicitante | 🟦 | `NOMBRE CONTACTO` |
| Correo / teléfono del contacto | 🟦 | `CORREO CONTACTO` / `NUMERO CONTACTO` |

### Documentación (carpetas y archivos)
| Dato | Fuente | Detalle |
|---|---|---|
| Carpeta del proyecto en SharePoint | 🟦 🧮 | Se extrae de `PROYECTOS.URL_Comercial` → `Clientes/{CODIGO CLIENTE}/DOSSIER DE ENTREGA/` |
| Categorías (carpetas) | 🟪 | **Todas** las subcarpetas reales de `DOSSIER DE ENTREGA` (ej. Cálculos y Garantías, Certificados, Fichas Técnicas, Registros) |
| Ícono / nombre bonito de la carpeta | ⚙️ / 🟪 | Config como "pista"; si no reconoce el nombre, usa el real |
| Documento (nombre, tamaño, fecha) | 🟪 | Metadatos del PDF en SharePoint (Graph) |
| Ver / Descargar PDF | 🟪 🧮 | Proxy `/api/doc/{id}` — descarga en vivo desde SharePoint |

---

## 4. Cómo se determina el ESTADO y el PROGRESO

`PROYECTOS.ESTADO` es un **id** que apunta a la tabla `STATUS` (`id_status → nombre, orden`).

**Mapeo de estado (bucket que usan tarjetas/pestañas):**
| `STATUS.nombre` | Bucket |
|---|---|
| CERTIFICADOS, FINALIZADO | **Terminado** |
| PENDIENTE, CANCELADO | **Archivado** |
| Resto (Ingresado, Habilitación, Preparado, En ejecución…) | **En ejecución** |

**Barra de progreso** (solo en ejecución): `progreso = STATUS.orden / orden(FINALIZADO)`.
Con `orden(FINALIZADO)=6`: Ingresado (1)=17%, Habilitación (2)=33%, Preparado (3)=50%, En ejecución (4)=67%. Terminados = 100% (barra oculta).

---

## 5. Cómo se determina la VIGENCIA de certificados y la PRÓXIMA MANTENCIÓN

Se usa `REGISTRO.PROX MANTENCION` (del primer registro del proyecto; todos comparten la misma fecha).
- Formato de entrada: `MM/YYYY` → se interpreta como **último día de ese mes**.
- **Fallback**: si no viene, se calcula `EOMONTH(FECHA RECEPCION, +12 meses)`.

| Resultado | Regla |
|---|---|
| Chip 🟢 **Vigente** | `PROX MANTENCION ≥ hoy` (y el proyecto tiene certificados) |
| Chip 🔴 **Vencido** | `PROX MANTENCION < hoy` |
| **Próxima inspección** (lateral) | Proyecto del cliente con la `PROX MANTENCION` futura más cercana |

---

## 6. Datos fijos (no vienen de ninguna fuente)

| Dónde | Texto |
|---|---|
| Footer del login | "ANTICAIDAS SpA · RUT 77.096.487-3" |
| Login | Correo de soporte `contacto@anticaidas.cl` |
| Ejecutivo | Horario "Disponible Lun–Vie 09:00–18:00" |
| Auto-atención | Opciones (Inspección anual, Falla, Mantención, Ampliación, Capacitación, Otra) |

---

## 7. Resumen de dependencias

```
AppSheet API (PROYECTOS · REGISTRO · STATUS)  ─┐
   (lee LISTADO DE PROYECTOS.xlsx en Office365) │→ sync cada ~10 min → data/portal.json
Microsoft Graph (SharePoint: PDFs)  ───────────┘        │
Variables de entorno (ejecutivo, etc.)                  │
                                                        ▼
                                            El cliente lee del caché (instantáneo)
                                            PDFs: stream en vivo por /api/doc
```
