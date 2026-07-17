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

## Despliegue en cPanel

> **El `npm install` se hace en LOCAL** y se sube `node_modules` ya construido.
> Todas las dependencias son JavaScript puro (sin módulos nativos que compilen
> por plataforma), así que lo construido en Windows corre igual en el cPanel
> (Linux). **No** hace falta el botón *NPM Install* de cPanel.

1. **En local**: `npm install` (genera `node_modules/`).
2. **Dominios** (cPanel) → crear el subdominio `clientes.anticaidas.cl` (y el
   dominio `anticaidas.cl` si aún no está en la cuenta).
3. **Subir** todo el proyecto (incluido `node_modules/`, **sin** `.env`) a la
   carpeta destino. No subir `data/portal.json` (se regenera solo).
4. **Setup Node.js App** → Crear aplicación:
   - Versión Node.js: **24.16.0**
   - Modo: **Production**
   - Raíz de aplicación: la carpeta donde subiste el proyecto
   - URL: `clientes.anticaidas.cl`
   - Archivo de inicio: **app.js**
5. **Environment variables**: cargar todas las de `.env.example` con los valores
   reales. Poner `DEMO_MODE=false` y un `SESSION_SECRET` largo y aleatorio.
6. **Restart** la aplicación desde el panel. (No es necesario correr NPM Install.)

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
