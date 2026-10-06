# Instructivo — Portal de Clientes Anticaidas

Guía resumida de cada opción de la **vista principal** y de la **vista de detalle de proyecto**.

---

## Ingreso al portal

1. Ingresa el **RUT** de tu organización.
2. Se envía un **código de 6 dígitos** al correo registrado de tu empresa.
3. Ingresa el código para acceder. La sesión dura ~8 horas.

---

## Vista principal (Inicio)

### Barra superior
| Elemento | Qué hace |
|---|---|
| **Logo / Inicio** | Vuelve a la vista principal. |
| **Chip de usuario** | Muestra la razón social y el RUT del cliente. |
| **Cerrar sesión** (ícono) | Sale del portal. |

### Encabezado
- **"Hola, [nombre]"** — saludo al contacto.
- **Solicitar nuevo proyecto** — abre un formulario para pedir una nueva cotización/instalación.

### Indicadores (KPIs)
Conteo de proyectos por estado:
- **Total proyectos** · **En ejecución** · **Terminados** · **Archivados**.

### Filtros (pestañas)
Filtran la lista de proyectos: **Todos**, **En ejecución**, **Terminados**, **Archivados** (cada una muestra su cantidad).
- *En ejecución*: proyectos en curso (preparado, habilitación, en ejecución, etc.).
- *Terminados*: certificados / finalizados.
- *Archivados*: pendientes y cancelados.

### Tarjeta de proyecto
Cada proyecto se muestra como una tarjeta con:
- **Estado** (pill de color) y **código** del proyecto.
- **Nombre** y **tipo de sistema** (ej. *LV Horizontal ×2 · Punto de Anclaje*).
- **Metadatos**: Extensión · Fecha (inicio o entrega) · Diseño.
- **Barra de progreso** (naranja) — solo en proyectos *en ejecución*; refleja la **etapa actual** (a más avance, más llena).
- **Chip de certificados** — 🟢 *Certificados Vigentes* o 🔴 *Certificados Vencidos* (según la fecha de próxima mantención). Solo aparece si el proyecto tiene certificados.
- **N documentos** — total de archivos disponibles.
- **Abrir proyecto** — entra al detalle.

### Panel lateral (derecha)
| Tarjeta | Qué hace |
|---|---|
| **Tu ejecutivo de cuenta** | Muestra nombre, cargo y horario. **Contactar** (correo) y **Llamar** (teléfono). |
| **Postventa** | Describe un requerimiento y tu ejecutivo te contacta. |
| **Solicitar nuevo proyecto** | Cotiza una nueva línea de vida o sistema anticaídas. |
| **Próxima inspección** | Muestra la mantención/inspección **más próxima** del cliente (proyecto + fecha). Se oculta si no hay ninguna futura. |

---

## Vista de detalle de proyecto

Se abre con **Abrir proyecto**. La barra superior muestra la ruta *Inicio / [proyecto]*.

### Encabezado (recuadro oscuro)
- **Código**, **nombre** y **tipo de sistema** del proyecto.
- **Estado** (pill) y botón **Contactar ejecutivo**.
- **Datos clave**: Tipo de sistema · Extensión total · Usuarios simultáneos · Fecha de ejecución · Fecha de entrega.
- **Avance del proyecto** (barra + %) y **Próximo** hito — solo si está *en ejecución*.

### Bloques informativos
| Bloque | Contenido |
|---|---|
| **Descripción** | Texto que resume el proyecto (tipo de sistema, extensión, usuarios, ubicación y duración). |
| **Equipo Anticaidas** | Diseño · Instalador · Validado por. |
| **Contacto del proyecto** | Solicitante · correo · teléfono. |

### Documentación del proyecto
Carpetas por categoría (según lo disponible en cada proyecto):
- **Cálculos y Garantías** · **Certificados de Instalación** · **Fichas Técnicas** · **Registros de Entrega**.

Cada carpeta muestra:
- La **cantidad de documentos** y el estado **Abrir** (si tiene) o **Vacío**.
- En **Certificados de Instalación**, además el **chip de vigencia** (🟢/🔴).

### Dentro de una carpeta
Al abrir una carpeta se ve la lista de documentos y un visor:
- **Lista de documentos**: nombre, tamaño, fecha y etiqueta (ej. *Vigente*).
- Por documento: **Ampliar** (abrir en pestaña nueva) y **Descargar**.
- **Visor de PDF** integrado — muestra el documento seleccionado sin salir del portal.
- **Volver al proyecto** — regresa al detalle.

---

## Ventanas de acción (modales)

| Acción | Para qué sirve |
|---|---|
| **Contactar ejecutivo** | Muestra los datos de contacto de tu ejecutivo de cuenta. |
| **Postventa** | Envías un requerimiento (inspección, falla, mantención, ampliación, capacitación…) y el ejecutivo te contacta. |
| **Solicitar nuevo proyecto** | Solicitas la cotización de una nueva instalación. |

---

## Notas
- Los datos de proyectos y certificados se sincronizan periódicamente desde los sistemas de Anticaidas (no en tiempo real).
- Cada cliente ve **solo sus propios proyectos y documentos**.
- Los certificados y demás archivos se **visualizan y descargan** de forma segura desde el propio portal.
