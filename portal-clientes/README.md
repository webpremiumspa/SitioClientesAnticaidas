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
Node/Express (este proyecto)  ── guarda TODAS las credenciales (env vars)
   ├─ Sync periódico ──► AppSheet API (PROYECTOS + REGISTRO)  → store local JSON
   └─ Proxy de PDFs  ──► Microsoft Graph (SharePoint)
```

- **El cliente nunca consulta AppSheet en vivo.** Un *sync* baja los datos cada
  `SYNC_INTERVAL_MIN` minutos a `data/portal.json`; las peticiones se responden
  desde ahí (instantáneo y resiliente a la lentitud/caídas de AppSheet).
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

## Variables de entorno

Ver `.env.example`. Grupos: AppSheet (App ID + Access Key de la app read-only),
Azure/Graph (`Sites.Selected`), SMTP (envío del código), ejecutivo (fijo por
config), sync y `DEMO_MODE`.

## Estructura

```
app.js                 entrypoint Express (archivo de inicio en cPanel)
src/
  config.js            lee process.env
  appsheet.js          cliente API AppSheet (Find, solo lectura)
  graph.js             Microsoft Graph: listar/stream certificados SharePoint
  mapping.js           PROYECTOS/REGISTRO -> estructura del portal
  sync.js              sincronización periódica -> store local
  store.js             caché JSON en disco (data/portal.json)
  auth.js              RUT + código OTP
  mailer.js            envío del código por SMTP
  portal.js            arma el PORTAL_DATA por RUT
  routes.js            /api/*
  demoData.js          datos de ejemplo (DEMO_MODE)
public/                frontend React (index.html + js/ + css/ + vendor/)
data/portal.json       store local (generado; no se versiona)
```

## Puntos a ajustar al integrar con datos reales

- **`src/mapping.js`**: si algún nombre de columna del `Find` de AppSheet no
  calza, se corrige aquí (único lugar).
- **`src/graph.js`**: `SHAREPOINT_DRIVE` y el patrón de carpeta
  `Clientes/{CLIENTE}/DOSSIER DE ENTREGA/{categoría}` según el sitio real.
- **Estados**: `mapEstado()` traduce el estado de AppSheet a
  en-ejecución/terminado/archivado; revisar contra los valores reales de STATUS.
