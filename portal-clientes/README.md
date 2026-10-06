# Portal de Clientes — Anticaidas

Sitio de cara al cliente que muestra sus proyectos de sistemas anticaídas y sus
**certificados de instalación**. Los datos provienen de **AppSheet** (API v2, solo
lectura) y los PDF de **SharePoint** vía **Microsoft Graph**. Pensado para montarse
en **cPanel con Node.js**.

## Arquitectura

```
Navegador (React, Babel in-browser)
   │  fetch con cookie de sesión
   ▼
cPanel / LiteSpeed
      │  (levanta VARIOS procesos de la app)
   ┌──┴───────────┬───────────────┐
   ▼              ▼               ▼
 Node #1        Node #2         Node #3   ── guardan TODAS las credenciales
   │              │               │          y sólo LEEN el store
   └──────────────┴───────┬───────┘
                          ▼
                  data/portal.json  ◄── UN cron diario
                          ▲              (scripts/sync-once.js)
                          │                    │
                  Proxy de PDFs                ├─► AppSheet (PROYECTOS + REGISTRO)
                  ──► Microsoft Graph          └─► Microsoft Graph (SharePoint)
```

- **El cliente nunca consulta AppSheet en vivo.** Un *sync* baja el catálogo
  completo a `data/portal.json` y las peticiones se responden desde ahí
  (instantáneo y resiliente a la lentitud/caídas de AppSheet).
- **El sync lo ejecuta un único cron, no los procesos web.** cPanel/LiteSpeed
  levanta varios procesos de la app; si cada uno sincronizara por su cuenta se
  multiplicarían por N las llamadas a AppSheet/Graph (y los 429 de Graph dejan
  proyectos sin documentos). Ver *Sincronización* más abajo.
- **Nada de estado en la memoria del proceso.** Sesiones, códigos OTP y
  contadores de rate limit viven en disco (`src/kv.js`), porque la petición
  siguiente de un mismo cliente puede caer en otro proceso.
- **Login en dos pasos**: RUT → código de un solo uso enviado al email registrado
  del cliente → sesión con cookie httpOnly.
- **Seguridad**: la Access Key de AppSheet debe ser de una app **de solo lectura**;
  Graph usa `Sites.Selected` acotado al sitio. Ningún secreto vive en el código.

## Requisitos

- Node.js ≥ 20 (en cPanel: 24.16.0).

## Puesta en marcha (local)

```bash
cp .env.example .env      # DEMO_MODE=true por defecto
npm install
npm start                 # http://localhost:3000
```

En **modo demo** (sin credenciales) usa datos de ejemplo (Inacap). El código OTP
no se envía por correo: se imprime en consola. RUT de prueba: `60.711.000-K`.

## Despliegue en cPanel (por Git)

> **El `npm install` se hace en LOCAL** y `node_modules` se **versiona en git**
> (dependencias JS puro, sin binarios nativos → lo construido en Windows corre
> en el cPanel Linux). Así el deploy por Git es autocontenido: **no** se corre
> npm en el servidor.

El repo usa `.cpanel.yml` (en la raíz) que copia la subcarpeta `portal-clientes/`
al docroot del subdominio: `/home/somitalc/clientes.anticaidas.cl`.

1. **En local**: `npm install` (una vez, y cada vez que cambien dependencias).
2. **Commit + push** incluyendo `node_modules/`:
   `git add . && git commit -m "deploy" && git push origin main`
3. **Dominios** (cPanel) → subdominio `clientes.anticaidas.cl` creado.
4. **Git Version Control** → *Update from Remote* → *Deploy HEAD Commit*
   (ejecuta `.cpanel.yml` y copia la app al docroot).
5. **Setup Node.js App**:
   - Versión Node.js: **24.16.0**
   - Modo: **Development** en pruebas / **Production** al publicar
   - **Raíz de aplicación**: `/home/somitalc/clientes.anticaidas.cl`
     (¡la misma ruta destino del `.cpanel.yml`!)
   - URL: `clientes.anticaidas.cl`
   - Archivo de inicio: **app.js**
6. **Environment variables**: cargar las de `.env.example` con valores reales.
   `DEMO_MODE=false`, `SESSION_SECRET` largo y aleatorio. (`.env` NO se sube; en
   cPanel las variables se definen en el panel.)
7. **Restart**. Verificar en `https://clientes.anticaidas.cl/api/health`.

Deploys posteriores: push → *Update from Remote* → *Deploy HEAD Commit* → *Restart*.

## Sincronización (cron diario)

El catálogo se refresca **una vez al día**, con un único cron. Los procesos web
no sincronizan: sólo leen `data/portal.json`.

**cPanel → Cron Jobs**, una vez al día (05:15 hora del servidor):

```
15 5 * * * /home/somitalc/nodevenv/clientes.anticaidas.cl/24/bin/node /home/somitalc/clientes.anticaidas.cl/scripts/sync-once.js >> /home/somitalc/logs/portal-sync.log 2>&1
```

⚠️ **Tiene que ser el `node` de `nodevenv`**, no el del sistema: ese wrapper es
el que exporta las variables de entorno de la aplicación. Con el `node` del
sistema no habría `APPSHEET_APP_ID`, la app entraría en modo demo y
sobrescribiría el catálogo con datos de ejemplo. `sync-once.js` detecta ese
caso y aborta con código 2 en vez de escribir, pero el cron igual no haría nada
útil.

Detalles del comportamiento:

- **No se solapa**: usa un lock en `DATA_DIR/sync.lock`. Si una ejecución sigue
  viva, la siguiente sale sin hacer nada (un lock de más de 2 h se considera
  basura y se reclama).
- **Prefiere no escribir antes que escribir mal.** Como ahora corre una vez al
  día, un sync malo dejaría el portal degradado 24 h en vez de 10 min. Aborta
  sin tocar `portal.json` si AppSheet devuelve 0 proyectos teniendo datos
  previos, o si más del 25 % de los proyectos falla al listar sus documentos.
- **Los procesos web se enteran solos**: `store.js` relee el archivo cuando
  cambia su fecha de modificación (comprueba como mucho cada 5 s). No hace
  falta reiniciar la aplicación.

**Refresco manual** (por ejemplo tras cargar documentos nuevos en SharePoint),
desde cPanel → Terminal:

```bash
/home/somitalc/nodevenv/clientes.anticaidas.cl/24/bin/node   /home/somitalc/clientes.anticaidas.cl/scripts/sync-once.js
```

En **desarrollo** no hace falta cron: con `NODE_ENV` distinto de `production`
el proceso web sincroniza solo cada `SYNC_INTERVAL_MIN` minutos. Se fuerza con
`SYNC_IN_PROCESS=true` / `false`.

## Variables de entorno

En producción se definen en **cPanel → Setup Node.js App → Environment
variables** (no hay `.env` en el servidor). Grupos: AppSheet (App ID + Access
Key de la app read-only), Azure/Graph (`Sites.Selected`), SMTP (envío del
código), ejecutivo, sync y `DEMO_MODE`. Ver `.env.example` para la lista
completa con comentarios.

Las que controlan la sincronización:

| Variable | Por defecto | Para qué |
|---|---|---|
| `SYNC_IN_PROCESS` | `false` si `NODE_ENV=production` | Si los procesos web sincronizan. **En producción debe ser `false`**: sincroniza el cron. |
| `SYNC_INTERVAL_MIN` | `60` | Sólo si `SYNC_IN_PROCESS=true` (desarrollo). En producción manda el cron. |
| `GRAPH_CONCURRENCY` | `3` | Peticiones simultáneas a Graph durante el sync. Bajarlo reduce los 429 que dejan proyectos sin documentos. |
| `DATA_DIR` | `<app>/data` | Store local **y** estado compartido entre procesos (sesiones, OTP, rate limit). Debe estar fuera del docroot. |

⚠️ cPanel escribe estas variables en `~/nodevenv/<app>/<ver>/bin/node` como
líneas `export`. Un nombre vacío o un valor con espacios sin comillas rompe esa
línea (`export: ... not a valid identifier` en `stderr.log`) y esa variable
queda sin definir. Si tocas variables, revisa el log después de reiniciar.

## Frontend (build)

El frontend NO usa Babel-in-browser. El JSX de `public/js/*.js` se precompila
a `public/app.bundle.js` (que es lo que carga `index.html`), lo que permite un
CSP estricto (sin `unsafe-eval`) y mejora el rendimiento.

**Cada vez que edites `public/js/*.js` o `public/css/portal.css`, recompila:**
```bash
npm run build   # = node scripts/build-frontend.js
```
Luego commit + deploy.

### Versión y caché

`npm run build` sella la build con la versión de `package.json` y un hash del
contenido (JS + CSS), y reescribe `index.html` para que apunte a
`app.bundle.js?v=<build>` y `css/portal.css?v=<build>`. Ese query string cambia
solo cuando cambia el código, así que Cloudflare y el navegador piden los
archivos nuevos sin necesidad de purgar.

Para comprobar qué build está sirviendo el servidor:

- **pie de página del portal** (y del login): `v1.1.0 · build a3561c8a`;
- **`GET /api/health`**: devuelve `version` (backend).

Si el pie sigue mostrando el build anterior, lo que quedó cacheado es
`index.html` (Apache/Cloudflare): purga esa URL en Cloudflare.

### Formularios del portal

"Postventa" y "Solicitar nuevo proyecto" envían a `POST /api/solicitud`,
que manda un correo a **`EJECUTIVO_EMAIL`** con `Reply-To` del cliente (para
responderle directo). El cliente NO va en copia.

Los datos del cliente (razón social, RUT, solicitante, correo, teléfono) los
toma el backend del **RUT en sesión**, nunca del body: así nadie puede
suplantar a otro cliente en el correo. Límite de 6 envíos cada 15 min por IP.

Si SMTP no está configurado el endpoint responde 503 y el modal muestra el
error: nunca se declara enviada una solicitud que no salió.

### Móvil de contacto

El móvil que muestra el portal (fila `MÓVIL` del modal de contacto y botón
`Llamar` del dashboard) sale de **`CONTACTO_MOVIL`**, no del ejecutivo: se
muestra siempre ese número, sea quien sea el ejecutivo configurado en
`EJECUTIVO_*`. Si la variable no está definida, el portal **oculta** el móvil y
el botón `Llamar` en vez de caer a un número escrito en el código.

`EJECUTIVO_MOVIL` sigue funcionando como alias antiguo (tiene menor prioridad),
para no romper el despliegue actual mientras no se defina `CONTACTO_MOVIL`.

### Cuidado con el deploy de carpetas

`.cpanel.yml` **borra** `css/`, `js/`, `vendor/`, `assets/`, `src/`, `scripts/` y
`public/` en el docroot antes de copiarlas. Copiar encima de un directorio que ya
existía no refrescaba su contenido en este servidor: durante semanas se sirvió
`css/portal.css` del primer deploy mientras `index.html` y `app.bundle.js` (que
son archivos sueltos de la raíz) sí se actualizaban. Si agregas una carpeta
nueva dentro de `public/`, añádela también a la línea de `rm -rf`.

La última tarea hace `touch tmp/restart.txt`, que es como Passenger recarga la
app: sin eso el backend sigue ejecutando el código anterior aunque los archivos
en disco sean nuevos.

## Estructura

```
app.js                 entrypoint Express (archivo de inicio en cPanel)
src/
  config.js            lee process.env
  appsheet.js          cliente API AppSheet (Find, solo lectura)
  graph.js             Microsoft Graph: listar/stream certificados SharePoint
  mapping.js           PROYECTOS/REGISTRO -> estructura del portal
  sync.js              sincronización -> store local (la dispara el cron)
  store.js             caché JSON en disco (data/portal.json), recargable
  kv.js                estado compartido entre procesos (sesiones/OTP/limits)
  sessionstore.js      store de sesiones de express-session sobre kv.js
  auth.js              RUT + código OTP
  mailer.js            envío del código por SMTP
  portal.js            arma el PORTAL_DATA por RUT
  routes.js            /api/*
  demoData.js          datos de ejemplo (DEMO_MODE)
public/                frontend React (index.html + js/ + css/ + vendor/)
scripts/sync-once.js   sincronización única: es la que ejecuta el cron
data/portal.json       store local (generado; no se versiona)
data/sess|otp|rl/      estado compartido entre procesos (generado)
```

## Seguridad

Medidas implementadas:
- **Datos y código fuera del web**: `DATA_DIR` debe apuntar fuera del docroot;
  además `data/`, `src/` y `scripts/` llevan `.htaccess` que niega el acceso HTTP.
- **OTP**: nunca se registra el código en logs cuando hay SMTP; `OTP_TEST_EMAIL`
  se ignora en producción (evita bypass); cooldown de reenvío por RUT.
- **Login**: respuesta uniforme (anti-enumeración), rate limiting por IP,
  regeneración de sesión al autenticar, cookie httpOnly + `sameSite=strict` +
  `secure` en producción.
- **/api/doc**: control de pertenencia (un cliente sólo baja SUS documentos);
  ids de Graph encodeados; nombre de archivo saneado.
- **Cabeceras**: CSP, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, HSTS
  (en producción) — aplican a respuestas de Express.

Pendiente / a reforzar en el servidor (ver más abajo):
- Replicar las cabeceras de seguridad en el `.htaccess` del docroot o en
  Cloudflare (el HTML lo sirve Apache, no Express).
- Restringir el origen a IPs de Cloudflare; activar WAF/rate-limit en el edge.
- Confirmar que la app de AppSheet sea de solo lectura y el permiso Graph
  `Sites.Selected`.
- Sustituir el `MemoryStore` de sesión por uno persistente si se escala.

### Checklist para producción (cPanel)
1. `DATA_DIR=/home/somitalc/portal-data` (fuera del docroot) y borrar el viejo
   `~/clientes.anticaidas.cl/data/` si existía.
2. **Quitar** `OTP_TEST_EMAIL`.
3. Modo **Production** (requiere HTTPS al origen: Cloudflare SSL "Full").
4. Verificar por HTTP que `data/portal.json`, `src/`, `scripts/`, `stderr.log`
   den **403/404** (no 200).
5. `SYNC_IN_PROCESS=false` y **crear el cron diario** (ver *Sincronización*).
   Sin el cron, los datos no se actualizan nunca.
6. Revisar que ninguna variable de entorno de cPanel esté malformada:
   `cat ~/nodevenv/clientes.anticaidas.cl/24/bin/node` no debe producir
   `export: ... not a valid identifier` en `stderr.log`.

## Puntos a ajustar al integrar con datos reales

- **`src/mapping.js`**: si algún nombre de columna del `Find` de AppSheet no
  calza, se corrige aquí (único lugar).
- **`src/graph.js`**: `SHAREPOINT_DRIVE` y el patrón de carpeta
  `Clientes/{CLIENTE}/DOSSIER DE ENTREGA/{categoría}` según el sitio real.
- **Estados**: `mapEstado()` traduce el estado de AppSheet a
  en-ejecución/terminado/archivado; revisar contra los valores reales de STATUS.
