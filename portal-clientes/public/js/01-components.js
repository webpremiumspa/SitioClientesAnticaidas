/* ================================================================
   COMPONENTS — Portal Anticaidas
   Icons, login, dashboard, project detail, folder view, modals.
   ================================================================ */

const { useState, useEffect, useMemo, useRef } = React;

/* ---------- Icons (stroke, currentColor) ---------- */
const Ico = {
  folder: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 7.2C3 6.08 3.9 5.2 5 5.2h3.9c.5 0 .98.2 1.34.55l1.42 1.42c.36.35.85.55 1.34.55H19c1.1 0 2 .9 2 2v8.86c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V7.2Z"/>
    </svg>
  ),
  chevR: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="m9 6 6 6-6 6"/>
    </svg>
  ),
  chevL: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="m15 6-6 6 6 6"/>
    </svg>
  ),
  arrowR: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 12h14M13 5l7 7-7 7"/>
    </svg>
  ),
  eye: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7S2.5 12 2.5 12Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  download: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 4v12m0 0-4-4m4 4 4-4M4 18h16"/>
    </svg>
  ),
  mail: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2"/>
      <path d="m3 7 9 6 9-6"/>
    </svg>
  ),
  phone: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2.2 2A17 17 0 0 1 3 6.2 2 2 0 0 1 5 4Z"/>
    </svg>
  ),
  plus: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 5v14M5 12h14"/>
    </svg>
  ),
  spark: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>
    </svg>
  ),
  bolt: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/>
    </svg>
  ),
  shield: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  ),
  x: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M6 6 18 18M18 6 6 18"/>
    </svg>
  ),
  check: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 12.5 10 17 19 7"/>
    </svg>
  ),
  copy: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="9" y="9" width="12" height="12" rx="2"/>
      <path d="M5 15V5a2 2 0 0 1 2-2h8"/>
    </svg>
  ),
  expand: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>
    </svg>
  ),
  logout: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M14 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2M9 12h13m0 0-3-3m3 3-3 3"/>
    </svg>
  ),
  inbox: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M22 12h-6l-2 3h-4l-2-3H2"/>
      <path d="M5.5 5h13l3.5 7v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6l3.5-7Z"/>
    </svg>
  ),
};

/* ---------- RUT helpers ---------- */
function formatRut(raw) {
  // remove all non alphanumeric
  let s = (raw || '').toString().replace(/[^0-9kK]/g, '').toUpperCase();
  if (!s) return '';
  if (s.length > 9) s = s.slice(0, 9);
  const body = s.slice(0, -1);
  const dv = s.slice(-1);
  if (s.length <= 1) return s;
  // group body with dots
  let withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return withDots + '-' + dv;
}
function cleanRut(formatted) {
  return (formatted || '').replace(/[^0-9kK]/g, '').toUpperCase();
}

/* ---------- Logo ---------- */
function Logo({ height = 32 }) {
  const src = window.__res ? window.__res('logo', 'assets/logo-anticaidas.png') : 'assets/logo-anticaidas.png';
  return <img src={src} style={{ height, width: 'auto', display: 'block' }} alt="Anticaidas" />;
}

/* ---------- Chip de vigencia de certificados ----------
   Estilos inline para que no dependan del CSS (robusto a caché). */
function CertChip({ vigencia, style }) {
  if (!vigencia) return null;
  const c = vigencia === 'vigente'
    ? { background: '#e2efe6', color: '#1f7a44' }
    : { background: '#fbe3e3', color: '#b3261e' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999,
      whiteSpace: 'nowrap', ...c, ...(style || {}),
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></span>
      {vigencia === 'vigente' ? 'Certificados Vigentes' : 'Certificados Vencidos'}
    </span>
  );
}

/* ===========================================================
   LOGIN
   =========================================================== */
function Login({ onLogin }) {
  const [step, setStep] = useState('rut');   // 'rut' | 'codigo'
  const [val, setVal] = useState('');
  const [codigo, setCodigo] = useState('');
  const [emailMask, setEmailMask] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const handleChange = (e) => {
    const formatted = formatRut(e.target.value);
    setVal(formatted);
    setErr('');
  };

  // Paso 1: pedir código al backend, que lo envía al email del cliente.
  const solicitar = async (e) => {
    e.preventDefault();
    const clean = cleanRut(val);
    if (clean.length < 8) {
      setErr('Ingresa tu RUT completo (8 dígitos + verificador).');
      return;
    }
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/login/solicitar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rut: clean }),
      });
      const data = await r.json();
      if (!r.ok) { setErr(data.error || 'No se pudo enviar el código.'); return; }
      setEmailMask(data.emailMask || '');
      setStep('codigo');
    } catch (_) {
      setErr('Error de conexión. Intenta nuevamente.');
    } finally { setBusy(false); }
  };

  // Paso 2: verificar el código e iniciar sesión.
  const verificar = async (e) => {
    e.preventDefault();
    if (!codigo.trim()) { setErr('Ingresa el código que recibiste.'); return; }
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/login/verificar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rut: cleanRut(val), codigo: codigo.trim() }),
      });
      const data = await r.json();
      if (!r.ok) { setErr(data.error || 'Código incorrecto.'); return; }
      onLogin();
    } catch (_) {
      setErr('Error de conexión. Intenta nuevamente.');
    } finally { setBusy(false); }
  };

  const volver = () => { setStep('rut'); setCodigo(''); setErr(''); };

  return (
    <div className="login-stage" data-screen-label="01 Login">
      <div className="login-left">
        <div className="login-logo"><Logo height={40} /></div>

        <div className="login-hero">
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'var(--accent-warm)'
          }}>
            Portal de Clientes
          </span>
          <h1>Tu trabajo en altura, <em>protegido y documentado.</em></h1>
          <p>
            Accede al estado de tus proyectos, descarga certificados de instalación,
            cálculos, garantías y fichas técnicas de cada sistema anticaídas que hemos
            instalado contigo.
          </p>
          <div className="login-pillars">
            <span>Certificados</span>
            <span>Cálculos</span>
            <span>Garantías</span>
            <span>Mantenimiento</span>
          </div>
        </div>

        <div className="login-foot">
          <div className="accent-bar"></div>
          <div>ANTICAIDAS SpA · RUT 77.096.487-3</div>
        </div>
      </div>

      <div className="login-right">
        {step === 'rut' ? (
          <form className="login-card" onSubmit={solicitar}>
            <h2>Ingreso de Cliente</h2>
            <p className="sub">Ingresa el RUT de tu organización. Te enviaremos un código a tu correo registrado.</p>

            <div className="field">
              <label htmlFor="rut">RUT</label>
              <input
                id="rut"
                className="mono"
                autoFocus
                autoComplete="off"
                spellCheck="false"
                placeholder="12.345.678-9"
                value={val}
                onChange={handleChange}
                inputMode="text"
              />
              <span className={'hint' + (err ? ' err' : '')}>
                {err || 'Formato: 8 dígitos + dígito verificador (ej. 76.123.456-7).'}
              </span>
            </div>

            <button type="submit" className="btn primary block" style={{ marginTop: 4 }} disabled={busy}>
              {busy ? 'Enviando…' : 'Enviar código'}
              <Ico.arrowR width="16" height="16" />
            </button>

            <div style={{
              marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--border-light)',
              fontSize: 12, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <span>¿Problemas para ingresar?</span>
              <a href="mailto:contacto@anticaidas.cl" style={{ color: 'var(--ink-2)', fontWeight: 600 }}>
                contacto@anticaidas.cl
              </a>
            </div>
          </form>
        ) : (
          <form className="login-card" onSubmit={verificar}>
            <h2>Verifica tu identidad</h2>
            <p className="sub">
              Si el RUT está registrado, enviamos un código de 6 dígitos al{' '}
              <strong style={{ color: 'var(--ink)' }}>correo de contacto de tu organización</strong>.
            </p>

            <div className="field">
              <label htmlFor="codigo">Código de acceso</label>
              <input
                id="codigo"
                className="mono"
                autoFocus
                autoComplete="one-time-code"
                spellCheck="false"
                placeholder="••••••"
                maxLength={6}
                value={codigo}
                onChange={(e) => { setCodigo(e.target.value.replace(/[^0-9]/g, '')); setErr(''); }}
                inputMode="numeric"
                style={{ letterSpacing: '0.4em', fontSize: 20 }}
              />
              <span className={'hint' + (err ? ' err' : '')}>
                {err || 'Revisa tu correo. El código vence en unos minutos.'}
              </span>
            </div>

            <button type="submit" className="btn primary block" style={{ marginTop: 4 }} disabled={busy}>
              {busy ? 'Verificando…' : 'Acceder al portal'}
              <Ico.arrowR width="16" height="16" />
            </button>

            <button type="button" className="btn ghost block" style={{ marginTop: 8 }} onClick={volver} disabled={busy}>
              Usar otro RUT
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

window.Login = Login;
window.Ico = Ico;
window.Logo = Logo;
window.formatRut = formatRut;
window.cleanRut = cleanRut;
