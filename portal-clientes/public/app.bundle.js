// Bundle generado por scripts/build-frontend.js — NO editar a mano.
"use strict";

/* ===== 00-data.js ===== */
/* Helper de recursos. En este despliegue las imágenes se sirven como archivos
   estáticos (assets/...), así que __res devuelve el fallback relativo.
   Los datos del portal YA NO están aquí: se cargan desde /api/portal. */

window.__res = function (id, fallback) {
  return window.__resources && window.__resources[id] || fallback;
};

/* ===== 01-components.js ===== */
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* ================================================================
   COMPONENTS — Portal Anticaidas
   Icons, login, dashboard, project detail, folder view, modals.
   ================================================================ */

const {
  useState,
  useEffect,
  useMemo,
  useRef
} = React;

/* ---------- Icons (stroke, currentColor) ---------- */
const Ico = {
  folder: p => /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M3 7.2C3 6.08 3.9 5.2 5 5.2h3.9c.5 0 .98.2 1.34.55l1.42 1.42c.36.35.85.55 1.34.55H19c1.1 0 2 .9 2 2v8.86c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V7.2Z"
  })),
  chevR: p => /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "m9 6 6 6-6 6"
  })),
  chevL: p => /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "m15 6-6 6 6 6"
  })),
  arrowR: p => /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  })),
  eye: p => /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7S2.5 12 2.5 12Z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "3"
  })),
  download: p => /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M12 4v12m0 0-4-4m4 4 4-4M4 18h16"
  })),
  mail: p => /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "5",
    width: "18",
    height: "14",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m3 7 9 6 9-6"
  })),
  phone: p => /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2.2 2A17 17 0 0 1 3 6.2 2 2 0 0 1 5 4Z"
  })),
  plus: p => /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M12 5v14M5 12h14"
  })),
  spark: p => /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"
  })),
  bolt: p => /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M13 2 4 14h6l-1 8 9-12h-6l1-8Z"
  })),
  shield: p => /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m9 12 2 2 4-4"
  })),
  x: p => /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M6 6 18 18M18 6 6 18"
  })),
  check: p => /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M5 12.5 10 17 19 7"
  })),
  copy: p => /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("rect", {
    x: "9",
    y: "9",
    width: "12",
    height: "12",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 15V5a2 2 0 0 1 2-2h8"
  })),
  expand: p => /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
  })),
  logout: p => /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M14 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2M9 12h13m0 0-3-3m3 3-3 3"
  })),
  inbox: p => /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M22 12h-6l-2 3h-4l-2-3H2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5.5 5h13l3.5 7v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6l3.5-7Z"
  }))
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
function Logo({
  height = 32
}) {
  const src = window.__res ? window.__res('logo', 'assets/logo-anticaidas.png') : 'assets/logo-anticaidas.png';
  return /*#__PURE__*/React.createElement("img", {
    src: src,
    style: {
      height,
      width: 'auto',
      display: 'block'
    },
    alt: "Anticaidas"
  });
}

/* ---------- Chip de vigencia de certificados ----------
   Estilos inline para que no dependan del CSS (robusto a caché). */
function CertChip({
  vigencia,
  style
}) {
  if (!vigencia) return null;
  const c = vigencia === 'vigente' ? {
    background: '#e2efe6',
    color: '#1f7a44'
  } : {
    background: '#fbe3e3',
    color: '#b3261e'
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 11,
      fontWeight: 600,
      padding: '4px 10px',
      borderRadius: 999,
      whiteSpace: 'nowrap',
      ...c,
      ...(style || {})
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: 'currentColor'
    }
  }), vigencia === 'vigente' ? 'Certificados Vigentes' : 'Certificados Vencidos');
}

/* ===========================================================
   LOGIN
   =========================================================== */
function Login({
  onLogin
}) {
  const [step, setStep] = useState('rut'); // 'rut' | 'codigo'
  const [val, setVal] = useState('');
  const [codigo, setCodigo] = useState('');
  const [emailMask, setEmailMask] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const handleChange = e => {
    const formatted = formatRut(e.target.value);
    setVal(formatted);
    setErr('');
  };

  // Paso 1: pedir código al backend, que lo envía al email del cliente.
  const solicitar = async e => {
    e.preventDefault();
    const clean = cleanRut(val);
    if (clean.length < 8) {
      setErr('Ingresa tu RUT completo (8 dígitos + verificador).');
      return;
    }
    setBusy(true);
    setErr('');
    try {
      const r = await fetch('/api/login/solicitar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rut: clean
        })
      });
      const data = await r.json();
      if (!r.ok) {
        setErr(data.error || 'No se pudo enviar el código.');
        return;
      }
      setEmailMask(data.emailMask || '');
      setStep('codigo');
    } catch (_) {
      setErr('Error de conexión. Intenta nuevamente.');
    } finally {
      setBusy(false);
    }
  };

  // Paso 2: verificar el código e iniciar sesión.
  const verificar = async e => {
    e.preventDefault();
    if (!codigo.trim()) {
      setErr('Ingresa el código que recibiste.');
      return;
    }
    setBusy(true);
    setErr('');
    try {
      const r = await fetch('/api/login/verificar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rut: cleanRut(val),
          codigo: codigo.trim()
        })
      });
      const data = await r.json();
      if (!r.ok) {
        setErr(data.error || 'Código incorrecto.');
        return;
      }
      onLogin();
    } catch (_) {
      setErr('Error de conexión. Intenta nuevamente.');
    } finally {
      setBusy(false);
    }
  };
  const volver = () => {
    setStep('rut');
    setCodigo('');
    setErr('');
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "login-stage",
    "data-screen-label": "01 Login"
  }, /*#__PURE__*/React.createElement("div", {
    className: "login-left"
  }, /*#__PURE__*/React.createElement("div", {
    className: "login-logo"
  }, /*#__PURE__*/React.createElement(Logo, {
    height: 40
  })), /*#__PURE__*/React.createElement("div", {
    className: "login-hero"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--accent-warm)'
    }
  }, "Portal de Clientes"), /*#__PURE__*/React.createElement("h1", null, "Tu trabajo en altura, ", /*#__PURE__*/React.createElement("em", null, "protegido y documentado.")), /*#__PURE__*/React.createElement("p", null, "Accede al estado de tus proyectos, descarga certificados de instalaci\xF3n, c\xE1lculos, garant\xEDas y fichas t\xE9cnicas de cada sistema antica\xEDdas que hemos instalado contigo."), /*#__PURE__*/React.createElement("div", {
    className: "login-pillars"
  }, /*#__PURE__*/React.createElement("span", null, "Certificados"), /*#__PURE__*/React.createElement("span", null, "C\xE1lculos"), /*#__PURE__*/React.createElement("span", null, "Garant\xEDas"), /*#__PURE__*/React.createElement("span", null, "Mantenimiento"))), /*#__PURE__*/React.createElement("div", {
    className: "login-foot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "accent-bar"
  }), /*#__PURE__*/React.createElement("div", null, "ANTICAIDAS SpA \xB7 RUT 77.096.487-3"))), /*#__PURE__*/React.createElement("div", {
    className: "login-right"
  }, step === 'rut' ? /*#__PURE__*/React.createElement("form", {
    className: "login-card",
    onSubmit: solicitar
  }, /*#__PURE__*/React.createElement("h2", null, "Ingreso de Cliente"), /*#__PURE__*/React.createElement("p", {
    className: "sub"
  }, "Ingresa el RUT de tu organizaci\xF3n. Te enviaremos un c\xF3digo a tu correo registrado."), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "rut"
  }, "RUT"), /*#__PURE__*/React.createElement("input", {
    id: "rut",
    className: "mono",
    autoFocus: true,
    autoComplete: "off",
    spellCheck: "false",
    placeholder: "12.345.678-9",
    value: val,
    onChange: handleChange,
    inputMode: "text"
  }), /*#__PURE__*/React.createElement("span", {
    className: 'hint' + (err ? ' err' : '')
  }, err || 'Formato: 8 dígitos + dígito verificador (ej. 60.711.000-K).')), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn primary block",
    style: {
      marginTop: 4
    },
    disabled: busy
  }, busy ? 'Enviando…' : 'Enviar código', /*#__PURE__*/React.createElement(Ico.arrowR, {
    width: "16",
    height: "16"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 22,
      paddingTop: 18,
      borderTop: '1px solid var(--border-light)',
      fontSize: 12,
      color: 'var(--ink-3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", null, "\xBFProblemas para ingresar?"), /*#__PURE__*/React.createElement("a", {
    href: "mailto:contacto@anticaidas.cl",
    style: {
      color: 'var(--ink-2)',
      fontWeight: 600
    }
  }, "contacto@anticaidas.cl"))) : /*#__PURE__*/React.createElement("form", {
    className: "login-card",
    onSubmit: verificar
  }, /*#__PURE__*/React.createElement("h2", null, "Verifica tu identidad"), /*#__PURE__*/React.createElement("p", {
    className: "sub"
  }, "Si el RUT est\xE1 registrado, enviamos un c\xF3digo de 6 d\xEDgitos al", ' ', /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--ink)'
    }
  }, "correo de contacto de tu organizaci\xF3n"), "."), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "codigo"
  }, "C\xF3digo de acceso"), /*#__PURE__*/React.createElement("input", {
    id: "codigo",
    className: "mono",
    autoFocus: true,
    autoComplete: "one-time-code",
    spellCheck: "false",
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022",
    maxLength: 6,
    value: codigo,
    onChange: e => {
      setCodigo(e.target.value.replace(/[^0-9]/g, ''));
      setErr('');
    },
    inputMode: "numeric",
    style: {
      letterSpacing: '0.4em',
      fontSize: 20
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: 'hint' + (err ? ' err' : '')
  }, err || 'Revisa tu correo. El código vence en unos minutos.')), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn primary block",
    style: {
      marginTop: 4
    },
    disabled: busy
  }, busy ? 'Verificando…' : 'Acceder al portal', /*#__PURE__*/React.createElement(Ico.arrowR, {
    width: "16",
    height: "16"
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn ghost block",
    style: {
      marginTop: 8
    },
    onClick: volver,
    disabled: busy
  }, "Usar otro RUT"))));
}
window.Login = Login;
window.Ico = Ico;
window.Logo = Logo;
window.formatRut = formatRut;
window.cleanRut = cleanRut;

/* ===== 02-dashboard.js ===== */
/* ================================================================
   DASHBOARD — lista de proyectos, KPIs, ejecutivo, acciones rápidas
   ================================================================ */

const TABS = [{
  key: 'todos',
  label: 'Todos'
}, {
  key: 'en-ejecucion',
  label: 'En ejecución'
}, {
  key: 'terminado',
  label: 'Terminados'
}, {
  key: 'archivado',
  label: 'Archivados'
}];
function StatusPill({
  estado,
  label
}) {
  const cls = estado === 'en-ejecucion' ? 'active' : estado === 'terminado' ? 'done' : 'archive';
  return /*#__PURE__*/React.createElement("span", {
    className: 'pill ' + cls
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), label);
}
function ProjectCard({
  p,
  onOpen
}) {
  const totalDocs = Object.values(p.docs || {}).reduce((s, arr) => s + (arr ? arr.length : 0), 0);
  return /*#__PURE__*/React.createElement("button", {
    className: "proj-card",
    onClick: () => onOpen(p),
    "data-screen-label": `Proyecto ${p.codigo}`
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "head"
  }, /*#__PURE__*/React.createElement(StatusPill, {
    estado: p.estado,
    label: p.estadoLabel
  }), /*#__PURE__*/React.createElement("span", {
    className: "code"
  }, p.codigo)), /*#__PURE__*/React.createElement("h3", null, p.nombre), /*#__PURE__*/React.createElement("div", {
    className: "addr"
  }, p.sub), /*#__PURE__*/React.createElement("div", {
    className: "proj-meta"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "l"
  }, "Tipo"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, p.tipoSistema)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "l"
  }, "Extensi\xF3n"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, p.extension)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "l"
  }, p.estado === 'en-ejecucion' ? 'Inicio' : 'Entrega'), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, p.estado === 'en-ejecucion' ? p.fechaInicio : p.fechaEntrega)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "l"
  }, "Dise\xF1o"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, p.diseno))), p.estado === 'en-ejecucion' && /*#__PURE__*/React.createElement("div", {
    className: "progress accent"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      width: p.progreso * 100 + '%'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "proj-side"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      gap: 8,
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement(CertChip, {
    vigencia: p.certVigencia
  }), /*#__PURE__*/React.createElement("span", {
    className: "docs-count"
  }, totalDocs, " documentos")), /*#__PURE__*/React.createElement("span", {
    className: "open"
  }, "Abrir proyecto", /*#__PURE__*/React.createElement(Ico.arrowR, {
    width: "14",
    height: "14"
  }))));
}
function Dashboard({
  data,
  onOpenProject,
  onOpenModal
}) {
  const [tab, setTab] = useState('todos');
  const counts = useMemo(() => {
    const c = {
      todos: data.proyectos.length
    };
    for (const t of TABS.slice(1)) {
      c[t.key] = data.proyectos.filter(p => p.estado === t.key).length;
    }
    return c;
  }, [data]);
  const list = useMemo(() => {
    if (tab === 'todos') return data.proyectos;
    return data.proyectos.filter(p => p.estado === tab);
  }, [tab, data]);
  const active = counts['en-ejecucion'];
  const done = counts['terminado'];
  const archived = counts['archivado'];
  return /*#__PURE__*/React.createElement("div", {
    className: "dash",
    "data-screen-label": "02 Dashboard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dash-main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "greeting"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Bienvenido, ", data.cliente.razonSocial), /*#__PURE__*/React.createElement("h1", null, "Hola, ", data.cliente.solicitante.split(' ')[0], "."), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, "Esta es la vista general de los proyectos que hemos realizado contigo.")), /*#__PURE__*/React.createElement("button", {
    className: "btn accent",
    onClick: () => onOpenModal('solicitar')
  }, /*#__PURE__*/React.createElement(Ico.plus, {
    width: "16",
    height: "16"
  }), "Solicitar nuevo proyecto")), /*#__PURE__*/React.createElement("div", {
    className: "kpis"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kpi"
  }, /*#__PURE__*/React.createElement("span", {
    className: "l"
  }, "Total proyectos"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, data.proyectos.length)), /*#__PURE__*/React.createElement("div", {
    className: "kpi accent"
  }, /*#__PURE__*/React.createElement("span", {
    className: "l"
  }, "En ejecuci\xF3n"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, active)), /*#__PURE__*/React.createElement("div", {
    className: "kpi"
  }, /*#__PURE__*/React.createElement("span", {
    className: "l"
  }, "Terminados"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, done)), /*#__PURE__*/React.createElement("div", {
    className: "kpi"
  }, /*#__PURE__*/React.createElement("span", {
    className: "l"
  }, "Archivados"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, archived))), /*#__PURE__*/React.createElement("div", {
    className: "tabs"
  }, TABS.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.key,
    className: tab === t.key ? 'active' : '',
    onClick: () => setTab(t.key)
  }, t.label, /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, counts[t.key])))), list.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "empty-state"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ic"
  }, /*#__PURE__*/React.createElement(Ico.inbox, {
    width: "24",
    height: "24"
  })), /*#__PURE__*/React.createElement("div", {
    className: "h"
  }, "No hay proyectos en este estado"), /*#__PURE__*/React.createElement("div", null, "Cambia de pesta\xF1a para ver el resto de tu cartera.")) : /*#__PURE__*/React.createElement("div", {
    className: "proj-list"
  }, list.map(p => /*#__PURE__*/React.createElement(ProjectCard, {
    key: p.id,
    p: p,
    onOpen: onOpenProject
  })))), /*#__PURE__*/React.createElement("aside", {
    className: "dash-side"
  }, /*#__PURE__*/React.createElement("div", {
    className: "side-card dark"
  }, /*#__PURE__*/React.createElement("h4", null, "Tu ejecutivo de cuenta"), /*#__PURE__*/React.createElement("p", {
    className: "sub"
  }, "Disponible Lun \u2013 Vie 09:00\u201318:00"), /*#__PURE__*/React.createElement("div", {
    className: "exec"
  }, /*#__PURE__*/React.createElement("div", {
    className: "avatar"
  }, data.ejecutivo.iniciales), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "nm"
  }, data.ejecutivo.nombre), /*#__PURE__*/React.createElement("div", {
    className: "rl"
  }, data.ejecutivo.cargo))), /*#__PURE__*/React.createElement("div", {
    className: "exec-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn secondary sm",
    onClick: () => onOpenModal('contacto')
  }, /*#__PURE__*/React.createElement(Ico.mail, {
    width: "14",
    height: "14"
  }), "Contactar"), /*#__PURE__*/React.createElement("a", {
    className: "btn accent sm",
    href: 'tel:' + data.ejecutivo.movil.replace(/\s/g, '')
  }, /*#__PURE__*/React.createElement(Ico.phone, {
    width: "14",
    height: "14"
  }), "Llamar"))), /*#__PURE__*/React.createElement("button", {
    className: "quick-action accent",
    onClick: () => onOpenModal('auto')
  }, /*#__PURE__*/React.createElement("div", {
    className: "ico"
  }, /*#__PURE__*/React.createElement(Ico.spark, {
    width: "18",
    height: "18"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, "Auto-atenci\xF3n"), /*#__PURE__*/React.createElement("div", {
    className: "d"
  }, "Describe tu requerimiento y nuestro ejecutivo te contactar\xE1."))), /*#__PURE__*/React.createElement("button", {
    className: "quick-action",
    onClick: () => onOpenModal('solicitar')
  }, /*#__PURE__*/React.createElement("div", {
    className: "ico"
  }, /*#__PURE__*/React.createElement(Ico.bolt, {
    width: "18",
    height: "18"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, "Solicitar nuevo proyecto"), /*#__PURE__*/React.createElement("div", {
    className: "d"
  }, "Cotiza una nueva l\xEDnea de vida o sistema antica\xEDdas."))), /*#__PURE__*/React.createElement("div", {
    className: "side-card"
  }, /*#__PURE__*/React.createElement("h4", null, "Pr\xF3xima inspecci\xF3n"), /*#__PURE__*/React.createElement("p", {
    className: "sub",
    style: {
      marginBottom: 12
    }
  }, "Mant\xE9n tu sistema certificado al d\xEDa."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 14px',
      background: 'var(--bg-paper-2)',
      borderRadius: 10,
      border: '1px solid var(--border-light)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      borderRadius: 8,
      background: 'var(--accent-soft)',
      color: 'var(--accent)',
      display: 'grid',
      placeItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Ico.shield, {
    width: "18",
    height: "18"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600
    }
  }, "\xD1u\xF1oa LV Norte \xB7 LV Sur"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-3)',
      fontFamily: 'var(--font-mono)'
    }
  }, "Inspecci\xF3n anual \xB7 10-2026"))))));
}
window.Dashboard = Dashboard;
window.StatusPill = StatusPill;

/* ===== 03-detail.js ===== */
/* ================================================================
   PROJECT DETAIL & FOLDER VIEW
   ================================================================ */

const FOLDER_ICONS = {
  cg: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 48 36",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 8.4c0-1.3 1-2.4 2.4-2.4H13c.6 0 1.2.24 1.66.66l1.65 1.6c.44.4 1 .64 1.62.64H43c1.4 0 2.4 1.07 2.4 2.4v18.3c0 1.3-1 2.4-2.4 2.4H5.4C4 31 3 29.93 3 28.6V8.4Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 19h12M14 23h18M14 15h8"
  })),
  ci: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 48 36",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 8.4c0-1.3 1-2.4 2.4-2.4H13c.6 0 1.2.24 1.66.66l1.65 1.6c.44.4 1 .64 1.62.64H43c1.4 0 2.4 1.07 2.4 2.4v18.3c0 1.3-1 2.4-2.4 2.4H5.4C4 31 3 29.93 3 28.6V8.4Z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "24",
    cy: "21",
    r: "4.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m21.5 21 2 2 4-4"
  })),
  ft: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 48 36",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 8.4c0-1.3 1-2.4 2.4-2.4H13c.6 0 1.2.24 1.66.66l1.65 1.6c.44.4 1 .64 1.62.64H43c1.4 0 2.4 1.07 2.4 2.4v18.3c0 1.3-1 2.4-2.4 2.4H5.4C4 31 3 29.93 3 28.6V8.4Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M22 14v14M16 17l6-3 6 3M16 25l6 3 6-3"
  })),
  rd: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 48 36",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 8.4c0-1.3 1-2.4 2.4-2.4H13c.6 0 1.2.24 1.66.66l1.65 1.6c.44.4 1 .64 1.62.64H43c1.4 0 2.4 1.07 2.4 2.4v18.3c0 1.3-1 2.4-2.4 2.4H5.4C4 31 3 29.93 3 28.6V8.4Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M17 17h14M17 21h10M17 25h7"
  })),
  // Ícono genérico para categorías/carpetas no reconocidas.
  gen: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 48 36",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 8.4c0-1.3 1-2.4 2.4-2.4H13c.6 0 1.2.24 1.66.66l1.65 1.6c.44.4 1 .64 1.62.64H43c1.4 0 2.4 1.07 2.4 2.4v18.3c0 1.3-1 2.4-2.4 2.4H5.4C4 31 3 29.93 3 28.6V8.4Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18 20h12M18 24h12"
  }))
};

// Devuelve el ícono de una categoría, con fallback genérico.
function folderIcon(cat) {
  return FOLDER_ICONS[cat] || FOLDER_ICONS.gen;
}
function ProjectDetail({
  data,
  project,
  onOpenFolder,
  onOpenModal
}) {
  const counts = {};
  project.carpetas.forEach(c => {
    counts[c.key] = (project.docs[c.key] || []).length;
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "detail",
    "data-screen-label": `03 Detalle ${project.codigo}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "detail-head"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 24,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 280
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "code"
  }, project.codigo), /*#__PURE__*/React.createElement("h1", null, project.nombre), /*#__PURE__*/React.createElement("div", {
    className: "addr"
  }, project.sub), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(StatusPill, {
    estado: project.estado,
    label: project.estadoLabel
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      alignItems: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-on-dark-3)',
      fontFamily: 'var(--font-mono)',
      letterSpacing: '0.06em'
    }
  }, project.direccion, ", ", project.comuna), /*#__PURE__*/React.createElement("button", {
    className: "btn secondary sm",
    onClick: () => onOpenModal('contacto')
  }, /*#__PURE__*/React.createElement(Ico.mail, {
    width: "14",
    height: "14"
  }), "Contactar ejecutivo"))), /*#__PURE__*/React.createElement("div", {
    className: "facts"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Tipo de sistema"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, project.tipoSistema)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Extensi\xF3n total"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, project.extension)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Usuarios simult\xE1neos"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, project.cantidadUsuarios)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Fecha ejecuci\xF3n"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, project.fechaInicio)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, project.fechaEntrega ? 'Fecha entrega' : 'Próximo hito'), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, project.fechaEntrega || project.proximoHito.split('—')[1]?.trim()))), project.estado === 'en-ejecucion' && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 8,
      color: 'var(--ink-on-dark-2)',
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("span", null, "Avance del proyecto"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)'
    }
  }, Math.round(project.progreso * 100), "%")), /*#__PURE__*/React.createElement("div", {
    className: "progress accent",
    style: {
      background: 'var(--border-dark-2)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      width: project.progreso * 100 + '%'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      fontSize: 13,
      color: 'var(--ink-on-dark-2)'
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--ink-on-dark)'
    }
  }, "Pr\xF3ximo:"), " ", project.proximoHito))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--bg-card)',
      border: '1px solid var(--border-light)',
      borderRadius: 'var(--radius-l)',
      padding: '22px 24px',
      marginBottom: 28,
      display: 'grid',
      gridTemplateColumns: '1.4fr 1fr 1fr',
      gap: 28
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-3)',
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      marginBottom: 8
    }
  }, "Descripci\xF3n"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--ink-2)',
      fontSize: 14,
      lineHeight: 1.55
    }
  }, project.descripcion)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-3)',
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      marginBottom: 8
    }
  }, "Equipo Anticaidas"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: 'var(--ink)',
      lineHeight: 1.7
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-3)'
    }
  }, "Dise\xF1o \xB7 "), project.diseno), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-3)'
    }
  }, "Instalador \xB7 "), project.instalador), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-3)'
    }
  }, "Validado por \xB7 "), project.validador))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-3)',
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      marginBottom: 8
    }
  }, "Contacto del proyecto"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: 'var(--ink)',
      lineHeight: 1.7
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-3)'
    }
  }, "Solicitante \xB7 "), project.solicitante), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 13
    }
  }, data.cliente.email), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 13
    }
  }, data.cliente.telefono)))), /*#__PURE__*/React.createElement("div", {
    className: "section-title"
  }, /*#__PURE__*/React.createElement("h2", null, "Documentaci\xF3n del proyecto"), /*#__PURE__*/React.createElement("span", {
    className: "sub"
  }, "Selecciona una carpeta para visualizar o descargar archivos.")), /*#__PURE__*/React.createElement("div", {
    className: "folders"
  }, project.carpetas.map(c => {
    const n = counts[c.key];
    const cls = 'folder cat-' + c.cat + (n === 0 ? ' empty' : '');
    return /*#__PURE__*/React.createElement("button", {
      key: c.key,
      className: cls,
      onClick: () => n > 0 && onOpenFolder(c.key),
      disabled: n === 0
    }, /*#__PURE__*/React.createElement("div", {
      className: "folder-icon"
    }, folderIcon(c.cat)), /*#__PURE__*/React.createElement("span", {
      className: "open-tag"
    }, n === 0 ? 'vacío' : 'abrir →'), /*#__PURE__*/React.createElement("div", {
      className: "count"
    }, n), /*#__PURE__*/React.createElement("h3", null, c.label), /*#__PURE__*/React.createElement("div", {
      className: "label"
    }, n === 0 ? 'Sin documentos por el momento.' : n === 1 ? '1 documento disponible' : n + ' documentos disponibles'), c.cat === 'ci' && project.certVigencia && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 8
      }
    }, /*#__PURE__*/React.createElement(CertChip, {
      vigencia: project.certVigencia
    })));
  })));
}

/* ===========================================================
   FOLDER VIEW (doc list + PDF viewer)
   =========================================================== */
function FolderView({
  data,
  project,
  folderKey,
  onBack
}) {
  const folder = project.carpetas.find(c => c.key === folderKey);
  const docs = project.docs[folderKey] || [];
  const [active, setActive] = useState(docs[0] || null);
  const [downloaded, setDownloaded] = useState({});
  useEffect(() => {
    setActive(docs[0] || null);
  }, [folderKey, project.id]);
  const handleDownload = doc => {
    setDownloaded(d => ({
      ...d,
      [doc.name]: true
    }));
    setTimeout(() => setDownloaded(d => ({
      ...d,
      [doc.name]: false
    })), 2200);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "folder-view",
    "data-screen-label": `04 ${folder.label}`
  }, /*#__PURE__*/React.createElement("div", {
    className: 'folder-list cat-' + folder.cat
  }, /*#__PURE__*/React.createElement("div", {
    className: "folder-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "icon-wrap"
  }, folderIcon(folder.cat)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "t-eye"
  }, project.codigo, " \xB7 ", project.nombre.split('—')[1]?.trim() || project.comuna), /*#__PURE__*/React.createElement("h2", null, folder.label), /*#__PURE__*/React.createElement("p", null, folder.desc), folder.cat === 'ci' && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(CertChip, {
    vigencia: project.certVigencia
  })))), docs.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "empty-state"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ic"
  }, /*#__PURE__*/React.createElement(Ico.folder, {
    width: "22",
    height: "22"
  })), /*#__PURE__*/React.createElement("div", {
    className: "h"
  }, "Carpeta vac\xEDa"), /*#__PURE__*/React.createElement("div", null, "Los documentos se cargan al cerrar la etapa correspondiente.")) : /*#__PURE__*/React.createElement("div", {
    className: "doc-list"
  }, docs.map((d, i) => {
    const isActive = active && active.name === d.name;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      className: 'doc-row' + (isActive ? ' active' : ''),
      onClick: () => setActive(d)
    }, /*#__PURE__*/React.createElement("div", {
      className: "pdf-ic"
    }, "PDF"), /*#__PURE__*/React.createElement("div", {
      className: "body"
    }, /*#__PURE__*/React.createElement("div", {
      className: "name"
    }, d.name), /*#__PURE__*/React.createElement("div", {
      className: "meta"
    }, d.size, " \xB7 ", d.date, d.tag ? ' · ' + d.tag : '')), /*#__PURE__*/React.createElement("div", {
      className: "act"
    }, /*#__PURE__*/React.createElement("a", {
      className: "icon-btn",
      href: d.path,
      target: "_blank",
      rel: "noopener",
      title: "Abrir en pesta\xF1a nueva",
      onClick: e => e.stopPropagation()
    }, /*#__PURE__*/React.createElement(Ico.expand, {
      width: "15",
      height: "15"
    })), /*#__PURE__*/React.createElement("a", {
      className: "icon-btn",
      href: d.path,
      download: d.name,
      title: "Descargar",
      onClick: e => {
        e.stopPropagation();
        handleDownload(d);
      }
    }, downloaded[d.name] ? /*#__PURE__*/React.createElement(Ico.check, {
      width: "15",
      height: "15",
      style: {
        color: 'var(--accent)'
      }
    }) : /*#__PURE__*/React.createElement(Ico.download, {
      width: "15",
      height: "15"
    }))));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn ghost sm",
    onClick: onBack
  }, /*#__PURE__*/React.createElement(Ico.chevL, {
    width: "14",
    height: "14"
  }), "Volver al proyecto"))), /*#__PURE__*/React.createElement("div", {
    className: "viewer"
  }, active ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "viewer-head"
  }, /*#__PURE__*/React.createElement(Ico.eye, {
    width: "16",
    height: "16",
    style: {
      color: 'var(--ink-3)'
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "name"
  }, active.name), /*#__PURE__*/React.createElement("div", {
    className: "meta"
  }, active.size, " \xB7 ", active.date)), /*#__PURE__*/React.createElement("div", {
    className: "spacer"
  }), /*#__PURE__*/React.createElement("a", {
    className: "btn secondary sm",
    href: active.path,
    target: "_blank",
    rel: "noopener"
  }, /*#__PURE__*/React.createElement(Ico.expand, {
    width: "13",
    height: "13"
  }), "Ampliar"), /*#__PURE__*/React.createElement("a", {
    className: "btn primary sm",
    href: active.path,
    download: active.name,
    onClick: () => handleDownload(active)
  }, /*#__PURE__*/React.createElement(Ico.download, {
    width: "13",
    height: "13"
  }), "Descargar")), /*#__PURE__*/React.createElement("div", {
    className: "viewer-body"
  }, active.path ? /*#__PURE__*/React.createElement("iframe", {
    key: active.path,
    src: active.path + '#toolbar=1&navpanes=0&view=FitH',
    title: active.name
  }) : /*#__PURE__*/React.createElement("div", {
    className: "viewer-empty"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "ic"
  }, /*#__PURE__*/React.createElement(Ico.eye, {
    width: "28",
    height: "28"
  })), /*#__PURE__*/React.createElement("p", {
    className: "h"
  }, "Vista previa no disponible"), /*#__PURE__*/React.createElement("p", null, "El documento no est\xE1 disponible en modo demo."))))) : /*#__PURE__*/React.createElement("div", {
    className: "viewer-empty"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "ic"
  }, /*#__PURE__*/React.createElement(Ico.folder, {
    width: "28",
    height: "28"
  })), /*#__PURE__*/React.createElement("p", {
    className: "h"
  }, "Selecciona un documento"), /*#__PURE__*/React.createElement("p", null, "Ver\xE1s aqu\xED una vista previa del archivo seleccionado.")))));
}
window.ProjectDetail = ProjectDetail;
window.FolderView = FolderView;
window.FOLDER_ICONS = FOLDER_ICONS;

/* ===== 04-modals.js ===== */
/* ================================================================
   MODALS — Solicitar, Auto-atención, Contacto
   ================================================================ */

function Modal({
  title,
  sub,
  onClose,
  children,
  footer
}) {
  useEffect(() => {
    const h = e => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-back",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, title), /*#__PURE__*/React.createElement("p", {
    className: "sub"
  }, sub)), /*#__PURE__*/React.createElement("button", {
    className: "x",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(Ico.x, {
    width: "18",
    height: "18"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal-body"
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    className: "modal-foot"
  }, footer)));
}

/* ----- Auto-atención ----- */
const AUTO_TOPICS = ['Inspección anual', 'Falla / componente dañado', 'Mantención preventiva', 'Ampliación de sistema', 'Capacitación de usuarios', 'Otra'];
function AutoAtencionModal({
  data,
  onClose
}) {
  const [topic, setTopic] = useState('');
  const [proyecto, setProyecto] = useState('');
  const [desc, setDesc] = useState('');
  const [sent, setSent] = useState(false);
  const submit = () => {
    if (!topic || desc.trim().length < 10) return;
    setSent(true);
  };
  if (sent) {
    return /*#__PURE__*/React.createElement(Modal, {
      title: "Solicitud enviada",
      sub: "Tu requerimiento lleg\xF3 a nuestro ejecutivo comercial.",
      onClose: onClose,
      footer: /*#__PURE__*/React.createElement("button", {
        className: "btn primary",
        onClick: onClose
      }, "Cerrar")
    }, /*#__PURE__*/React.createElement("div", {
      className: "success"
    }, /*#__PURE__*/React.createElement(Ico.check, {
      width: "20",
      height: "20"
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, data.ejecutivo.nombre), " recibi\xF3 tu mensaje. Te contactar\xE1 al correo\xA0", /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)'
      }
    }, data.cliente.email), " dentro de las pr\xF3ximas 24 horas h\xE1biles.")), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 16,
        padding: 16,
        background: 'var(--bg-paper)',
        borderRadius: 10,
        fontSize: 13,
        color: 'var(--ink-2)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--ink-3)',
        marginBottom: 6
      }
    }, "Resumen"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Tema:"), " ", topic), proyecto && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Proyecto:"), " ", proyecto), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 8,
        color: 'var(--ink-2)'
      }
    }, desc)));
  }
  return /*#__PURE__*/React.createElement(Modal, {
    title: "Auto-atenci\xF3n",
    sub: "Describe tu requerimiento y nuestro ejecutivo te contactar\xE1.",
    onClose: onClose,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "btn ghost",
      onClick: onClose
    }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
      className: "btn accent",
      onClick: submit,
      disabled: !topic || desc.trim().length < 10
    }, "Enviar al ejecutivo", /*#__PURE__*/React.createElement(Ico.arrowR, {
      width: "14",
      height: "14"
    })))
  }, /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", null, "Tema"), /*#__PURE__*/React.createElement("div", {
    className: "chip-row"
  }, AUTO_TOPICS.map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    className: topic === t ? 'on' : '',
    onClick: () => setTopic(t)
  }, t)))), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "proyecto"
  }, "Proyecto relacionado ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-3)',
      fontWeight: 400,
      textTransform: 'none',
      letterSpacing: 0
    }
  }, "(opcional)")), /*#__PURE__*/React.createElement("select", {
    id: "proyecto",
    value: proyecto,
    onChange: e => setProyecto(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "\u2014 Selecciona un proyecto \u2014"), data.proyectos.map(p => /*#__PURE__*/React.createElement("option", {
    key: p.id,
    value: p.codigo + ' — ' + p.nombre
  }, p.codigo, " \u2014 ", p.nombre)))), /*#__PURE__*/React.createElement("div", {
    className: "field",
    style: {
      marginBottom: 0
    }
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "desc"
  }, "Descripci\xF3n del requerimiento"), /*#__PURE__*/React.createElement("textarea", {
    id: "desc",
    placeholder: "Cu\xE9ntanos en detalle qu\xE9 necesitas: ubicaci\xF3n, urgencia, contexto operativo, etc.",
    value: desc,
    onChange: e => setDesc(e.target.value)
  }), /*#__PURE__*/React.createElement("span", {
    className: "hint"
  }, desc.trim().length < 10 ? 'Mínimo 10 caracteres.' : `${desc.length} caracteres · perfectamente claro.`)));
}

/* ----- Solicitar nuevo proyecto ----- */
function SolicitarModal({
  data,
  onClose
}) {
  const [form, setForm] = useState({
    tipo: 'LV HORIZONTAL',
    direccion: '',
    extension: '',
    usuarios: '1',
    plazo: 'En las próximas 4 semanas',
    nota: ''
  });
  const [sent, setSent] = useState(false);
  const upd = (k, v) => setForm(f => ({
    ...f,
    [k]: v
  }));
  const valid = form.direccion.trim().length > 4 && form.extension.trim().length > 0;
  if (sent) {
    return /*#__PURE__*/React.createElement(Modal, {
      title: "Solicitud de proyecto recibida",
      sub: "Nos pondremos en contacto para coordinar visita t\xE9cnica.",
      onClose: onClose,
      footer: /*#__PURE__*/React.createElement("button", {
        className: "btn primary",
        onClick: onClose
      }, "Cerrar")
    }, /*#__PURE__*/React.createElement("div", {
      className: "success"
    }, /*#__PURE__*/React.createElement(Ico.check, {
      width: "20",
      height: "20"
    }), /*#__PURE__*/React.createElement("div", null, "Hemos generado un nuevo requerimiento para tu cuenta. ", /*#__PURE__*/React.createElement("strong", null, data.ejecutivo.nombre), " coordinar\xE1 una visita t\xE9cnica en los pr\xF3ximos 3 d\xEDas h\xE1biles.")));
  }
  return /*#__PURE__*/React.createElement(Modal, {
    title: "Solicitar nuevo proyecto",
    sub: "Ind\xEDcanos lo b\xE1sico \u2014 nosotros levantamos el resto en visita t\xE9cnica.",
    onClose: onClose,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "btn ghost",
      onClick: onClose
    }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
      className: "btn accent",
      onClick: () => setSent(true),
      disabled: !valid
    }, "Enviar solicitud", /*#__PURE__*/React.createElement(Ico.arrowR, {
      width: "14",
      height: "14"
    })))
  }, /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", null, "Tipo de sistema"), /*#__PURE__*/React.createElement("div", {
    className: "chip-row"
  }, ['LV HORIZONTAL', 'LV VERTICAL', 'PUNTOS DE ANCLAJE', 'PASARELA', 'OTRO'].map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    className: form.tipo === t ? 'on' : '',
    onClick: () => upd('tipo', t)
  }, t)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "dir"
  }, "Direcci\xF3n de la instalaci\xF3n"), /*#__PURE__*/React.createElement("input", {
    id: "dir",
    placeholder: "Calle, n\xFAmero, comuna",
    value: form.direccion,
    onChange: e => upd('direccion', e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "ext"
  }, "Extensi\xF3n aprox. (m)"), /*#__PURE__*/React.createElement("input", {
    id: "ext",
    className: "mono",
    inputMode: "numeric",
    placeholder: "50",
    value: form.extension,
    onChange: e => upd('extension', e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "us"
  }, "Usuarios simult\xE1neos"), /*#__PURE__*/React.createElement("select", {
    id: "us",
    value: form.usuarios,
    onChange: e => upd('usuarios', e.target.value)
  }, /*#__PURE__*/React.createElement("option", null, "1"), /*#__PURE__*/React.createElement("option", null, "2"), /*#__PURE__*/React.createElement("option", null, "3"), /*#__PURE__*/React.createElement("option", null, "4+"))), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "pl"
  }, "Plazo deseado"), /*#__PURE__*/React.createElement("select", {
    id: "pl",
    value: form.plazo,
    onChange: e => upd('plazo', e.target.value)
  }, /*#__PURE__*/React.createElement("option", null, "En las pr\xF3ximas 2 semanas"), /*#__PURE__*/React.createElement("option", null, "En las pr\xF3ximas 4 semanas"), /*#__PURE__*/React.createElement("option", null, "1 a 3 meses"), /*#__PURE__*/React.createElement("option", null, "Sin definir")))), /*#__PURE__*/React.createElement("div", {
    className: "field",
    style: {
      marginBottom: 0
    }
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "nt"
  }, "Notas adicionales"), /*#__PURE__*/React.createElement("textarea", {
    id: "nt",
    placeholder: "Tipo de cubierta, accesos, restricciones de horario, etc.",
    value: form.nota,
    onChange: e => upd('nota', e.target.value),
    style: {
      minHeight: 90
    }
  })));
}

/* ----- Contacto ejecutivo ----- */
function ContactoModal({
  data,
  onClose
}) {
  const [copied, setCopied] = useState('');
  const copy = (t, k) => {
    navigator.clipboard?.writeText(t);
    setCopied(k);
    setTimeout(() => setCopied(''), 1500);
  };
  const e = data.ejecutivo;
  return /*#__PURE__*/React.createElement(Modal, {
    title: "Tu ejecutivo de cuenta",
    sub: "Contacto directo para temas comerciales y de operaci\xF3n.",
    onClose: onClose,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "btn ghost",
      onClick: onClose
    }, "Cerrar"), /*#__PURE__*/React.createElement("a", {
      className: "btn primary",
      href: 'mailto:' + e.email + '?subject=Consulta%20Cliente%20' + encodeURIComponent(data.cliente.razonSocial)
    }, /*#__PURE__*/React.createElement(Ico.mail, {
      width: "14",
      height: "14"
    }), "Escribir correo"))
  }, /*#__PURE__*/React.createElement("div", {
    className: "exec-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "avatar"
  }, e.iniciales), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "nm"
  }, e.nombre), /*#__PURE__*/React.createElement("div", {
    className: "rl"
  }, e.cargo))), /*#__PURE__*/React.createElement("div", {
    className: "contact-rows"
  }, [{
    l: 'Correo',
    v: e.email,
    k: 'mail'
  }, {
    l: 'Móvil',
    v: e.movil,
    k: 'mov'
  }, {
    l: 'Oficina',
    v: e.telefono,
    k: 'ofi'
  }].map(c => /*#__PURE__*/React.createElement("div", {
    className: "contact-row",
    key: c.k
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, c.l), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, c.v)), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    onClick: () => copy(c.v, c.k),
    title: "Copiar"
  }, copied === c.k ? /*#__PURE__*/React.createElement(Ico.check, {
    width: "15",
    height: "15",
    style: {
      color: 'var(--accent)'
    }
  }) : /*#__PURE__*/React.createElement(Ico.copy, {
    width: "15",
    height: "15"
  }))))));
}
window.Modal = Modal;
window.AutoAtencionModal = AutoAtencionModal;
window.SolicitarModal = SolicitarModal;
window.ContactoModal = ContactoModal;

/* ===== 05-app.js ===== */
/* ================================================================
   APP — Root state + routing
   ================================================================ */

function Topbar({
  data,
  view,
  selectedProject,
  selectedFolder,
  onNav,
  onLogout
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "topbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "brand"
  }, /*#__PURE__*/React.createElement(Logo, {
    height: 28
  })), /*#__PURE__*/React.createElement("div", {
    className: "divider"
  }), /*#__PURE__*/React.createElement("div", {
    className: "crumbs"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => onNav({
      view: 'dashboard'
    })
  }, "Inicio"), selectedProject && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "/"), selectedFolder ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    onClick: () => onNav({
      view: 'project',
      project: selectedProject
    })
  }, selectedProject.nombre), /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "/"), /*#__PURE__*/React.createElement("span", {
    className: "current"
  }, selectedProject.carpetas.find(c => c.key === selectedFolder)?.label)) : /*#__PURE__*/React.createElement("span", {
    className: "current"
  }, selectedProject.nombre))), /*#__PURE__*/React.createElement("div", {
    className: "user"
  }, /*#__PURE__*/React.createElement("div", {
    className: "user-chip"
  }, /*#__PURE__*/React.createElement("div", {
    className: "avatar"
  }, data.cliente.razonSocial.slice(0, 2).toUpperCase()), /*#__PURE__*/React.createElement("div", {
    className: "meta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "n"
  }, data.cliente.razonSocial), /*#__PURE__*/React.createElement("div", {
    className: "r"
  }, data.cliente.rut))), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    onClick: onLogout,
    title: "Cerrar sesi\xF3n",
    style: {
      color: 'var(--ink-on-dark-2)'
    }
  }, /*#__PURE__*/React.createElement(Ico.logout, {
    width: "16",
    height: "16"
  }))));
}
function App() {
  const [data, setData] = useState(null);
  const [logged, setLogged] = useState(false);
  const [loading, setLoading] = useState(true); // comprobando sesión / cargando datos
  const [loadErr, setLoadErr] = useState('');
  const [view, setView] = useState('dashboard'); // dashboard | project | folder
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [modal, setModal] = useState(null); // 'auto' | 'solicitar' | 'contacto' | null

  // Carga los datos del portal desde la API (store local del backend).
  const cargarPortal = async () => {
    setLoadErr('');
    const r = await fetch('/api/portal', {
      headers: {
        Accept: 'application/json'
      }
    });
    if (r.status === 401) {
      setLogged(false);
      return false;
    }
    if (!r.ok) {
      setLoadErr('No se pudieron cargar tus datos.');
      return false;
    }
    setData(await r.json());
    setLogged(true);
    return true;
  };

  // Al montar: si ya hay sesión activa, cargar directo.
  useEffect(() => {
    (async () => {
      try {
        const s = await fetch('/api/session').then(x => x.json()).catch(() => ({}));
        if (s.authenticated) await cargarPortal();
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  const onLogin = async () => {
    setLoading(true);
    try {
      await cargarPortal();
    } finally {
      setLoading(false);
    }
  };
  const onLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST'
      });
    } catch (_) {}
    setLogged(false);
    setData(null);
    setView('dashboard');
    setSelectedProject(null);
    setSelectedFolder(null);
  };
  const onOpenProject = p => {
    setSelectedProject(p);
    setSelectedFolder(null);
    setView('project');
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  };
  const onOpenFolder = key => {
    setSelectedFolder(key);
    setView('folder');
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  };
  const onNav = ({
    view: v,
    project
  }) => {
    if (v === 'dashboard') {
      setView('dashboard');
      setSelectedProject(null);
      setSelectedFolder(null);
    } else if (v === 'project') {
      setSelectedProject(project);
      setSelectedFolder(null);
      setView('project');
    }
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  };
  if (loading) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'var(--bg-deep)',
        color: 'var(--ink-on-dark-2)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        letterSpacing: '0.08em'
      }
    }, "Cargando\u2026"));
  }
  if (!logged || !data) {
    return /*#__PURE__*/React.createElement(Login, {
      onLogin: onLogin
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "app"
  }, /*#__PURE__*/React.createElement(Topbar, {
    data: data,
    view: view,
    selectedProject: selectedProject,
    selectedFolder: selectedFolder,
    onNav: onNav,
    onLogout: onLogout
  }), view === 'dashboard' && /*#__PURE__*/React.createElement(Dashboard, {
    data: data,
    onOpenProject: onOpenProject,
    onOpenModal: setModal
  }), view === 'project' && selectedProject && /*#__PURE__*/React.createElement(ProjectDetail, {
    data: data,
    project: selectedProject,
    onOpenFolder: onOpenFolder,
    onOpenModal: setModal
  }), view === 'folder' && selectedProject && selectedFolder && /*#__PURE__*/React.createElement(FolderView, {
    data: data,
    project: selectedProject,
    folderKey: selectedFolder,
    onBack: () => {
      setSelectedFolder(null);
      setView('project');
    }
  }), modal === 'auto' && /*#__PURE__*/React.createElement(AutoAtencionModal, {
    data: data,
    onClose: () => setModal(null)
  }), modal === 'solicitar' && /*#__PURE__*/React.createElement(SolicitarModal, {
    data: data,
    onClose: () => setModal(null)
  }), modal === 'contacto' && /*#__PURE__*/React.createElement(ContactoModal, {
    data: data,
    onClose: () => setModal(null)
  }));
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(/*#__PURE__*/React.createElement(App, null));
