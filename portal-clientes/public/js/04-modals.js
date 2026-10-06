/* ================================================================
   MODALS — Solicitar, Postventa, Contacto
   ================================================================ */

function Modal({ title, sub, onClose, children, footer }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h3>{title}</h3>
            <p className="sub">{sub}</p>
          </div>
          <button className="x" onClick={onClose}><Ico.x width="18" height="18" /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

/* ----- Postventa ----- */
const AUTO_TOPICS = [
  'Inspección anual',
  'Falla / componente dañado',
  'Mantención preventiva',
  'Ampliación de sistema',
  'Capacitación de usuarios',
  'Otra',
];

/* Envía un formulario del portal al ejecutivo. Devuelve { ok } o { error }.
   Los datos del cliente no viajan en el body: el backend los toma de la sesión. */
async function enviarSolicitud(tipo, campos) {
  try {
    const r = await fetch('/api/solicitud', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, campos }),
    });
    if (r.ok) return { ok: true };
    const info = await r.json().catch(() => ({}));
    return { error: info.error || 'No se pudo enviar la solicitud.' };
  } catch (e) {
    return { error: 'No se pudo enviar la solicitud. Revisa tu conexión.' };
  }
}

function AutoAtencionModal({ data, onClose }) {
  const [topic, setTopic] = useState('');
  const [proyecto, setProyecto] = useState('');
  const [desc, setDesc] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    if (!topic || desc.trim().length < 10 || busy) return;
    setBusy(true);
    setErr('');
    const r = await enviarSolicitud('postventa', {
      tema: topic,
      proyecto: proyecto,
      descripcion: desc.trim(),
    });
    setBusy(false);
    if (r.ok) setSent(true);
    else setErr(r.error);
  };

  if (sent) {
    return (
      <Modal
        title="Solicitud enviada"
        sub="Tu requerimiento llegó a nuestro ejecutivo comercial."
        onClose={onClose}
        footer={<button className="btn primary" onClick={onClose}>Cerrar</button>}
      >
        <div className="success">
          <Ico.check width="20" height="20" />
          <div>
            <strong>{data.ejecutivo.nombre}</strong> recibió tu mensaje. Te contactará al correo&nbsp;
            <span style={{ fontFamily: 'var(--font-mono)' }}>{data.cliente.email}</span> dentro de las próximas 24 horas hábiles.
          </div>
        </div>
        <div style={{
          marginTop: 16, padding: 16, background: 'var(--bg-paper)', borderRadius: 10,
          fontSize: 13, color: 'var(--ink-2)'
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 6 }}>
            Resumen
          </div>
          <div><strong>Tema:</strong> {topic}</div>
          {proyecto && <div><strong>Proyecto:</strong> {proyecto}</div>}
          <div style={{ marginTop: 8, color: 'var(--ink-2)' }}>{desc}</div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title="Postventa"
      sub="Describe tu requerimiento y nuestro ejecutivo te contactará."
      onClose={onClose}
      footer={
        <>
          {err && <span className="form-err">{err}</span>}
          <button className="btn ghost" onClick={onClose}>Cancelar</button>
          <button className="btn accent" onClick={submit} disabled={busy || !topic || desc.trim().length < 10}>
            {busy ? 'Enviando…' : 'Enviar al ejecutivo'}
            {!busy && <Ico.arrowR width="14" height="14" />}
          </button>
        </>
      }
    >
      <div className="field">
        <label>Tema</label>
        <div className="chip-row">
          {AUTO_TOPICS.map(t => (
            <button key={t} className={topic === t ? 'on' : ''} onClick={() => setTopic(t)}>{t}</button>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="proyecto">Proyecto relacionado <span style={{ color: 'var(--ink-3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span></label>
        <select id="proyecto" value={proyecto} onChange={e => setProyecto(e.target.value)}>
          <option value="">— Selecciona un proyecto —</option>
          {/* Si el proyecto aun no tiene nombre, `nombre` ya es "Proyecto <codigo>":
              anteponerle el codigo otra vez daria "ACB5925 — Proyecto ACB5925". */}
          {data.proyectos.map(p => {
            const etiqueta = p.nombre.includes(p.codigo) ? p.nombre : `${p.codigo} — ${p.nombre}`;
            return <option key={p.id} value={etiqueta}>{etiqueta}</option>;
          })}
        </select>
      </div>

      <div className="field" style={{ marginBottom: 0 }}>
        <label htmlFor="desc">Descripción del requerimiento</label>
        <textarea
          id="desc"
          placeholder="Cuéntanos en detalle qué necesitas: ubicación, urgencia, contexto operativo, etc."
          value={desc}
          onChange={e => setDesc(e.target.value)}
        />
        <span className="hint">
          {desc.trim().length < 10 ? 'Mínimo 10 caracteres.' : `${desc.length} caracteres · perfectamente claro.`}
        </span>
      </div>
    </Modal>
  );
}

/* ----- Solicitar nuevo proyecto ----- */
function SolicitarModal({ data, onClose }) {
  const [form, setForm] = useState({
    tipo: 'LÍNEA DE VIDA',
    direccion: '',
    extension: '',
    usuarios: '1',
    plazo: 'En las próximas 4 semanas',
    nota: '',
  });
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.direccion.trim().length > 4 && form.extension.trim().length > 0;

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setErr('');
    const r = await enviarSolicitud('nuevo-proyecto', {
      tipo: form.tipo,
      direccion: form.direccion.trim(),
      extension: form.extension.trim(),
      usuarios: form.usuarios,
      plazo: form.plazo,
      nota: form.nota.trim(),
    });
    setBusy(false);
    if (r.ok) setSent(true);
    else setErr(r.error);
  };

  if (sent) {
    return (
      <Modal
        title="Solicitud de proyecto recibida"
        sub="Nos pondremos en contacto para coordinar visita técnica."
        onClose={onClose}
        footer={<button className="btn primary" onClick={onClose}>Cerrar</button>}
      >
        <div className="success">
          <Ico.check width="20" height="20" />
          <div>
            Hemos generado un nuevo requerimiento para tu cuenta. <strong>{data.ejecutivo.nombre}</strong> coordinará una
            visita técnica en los próximos 3 días hábiles.
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title="Solicitar nuevo proyecto"
      sub="Indícanos lo básico — nosotros levantamos el resto en visita técnica."
      onClose={onClose}
      footer={
        <>
          {err && <span className="form-err">{err}</span>}
          <button className="btn ghost" onClick={onClose}>Cancelar</button>
          <button className="btn accent" onClick={submit} disabled={busy || !valid}>
            {busy ? 'Enviando…' : 'Enviar solicitud'}
            {!busy && <Ico.arrowR width="14" height="14" />}
          </button>
        </>
      }
    >
      <div className="field">
        <label>Tipo de sistema</label>
        <div className="chip-row">
          {/* Una sola opción de línea de vida: al cliente que cotiza no le
              corresponde decidir si es horizontal o vertical, eso se define en
              la visita técnica. */}
          {['LÍNEA DE VIDA', 'PUNTOS DE ANCLAJE', 'PASARELA', 'OTRO'].map(t => (
            <button key={t} className={form.tipo === t ? 'on' : ''} onClick={() => upd('tipo', t)}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="field">
          <label htmlFor="dir">Dirección de la instalación</label>
          <input id="dir" placeholder="Calle, número, comuna" value={form.direccion} onChange={e => upd('direccion', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="ext">Extensión aprox. (m)</label>
          <input id="ext" className="mono" inputMode="numeric" placeholder="50" value={form.extension} onChange={e => upd('extension', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="us">Usuarios simultáneos</label>
          <select id="us" value={form.usuarios} onChange={e => upd('usuarios', e.target.value)}>
            <option>1</option><option>2</option><option>3</option><option>4+</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="pl">Plazo deseado</label>
          <select id="pl" value={form.plazo} onChange={e => upd('plazo', e.target.value)}>
            <option>En las próximas 2 semanas</option>
            <option>En las próximas 4 semanas</option>
            <option>1 a 3 meses</option>
            <option>Sin definir</option>
          </select>
        </div>
      </div>

      <div className="field" style={{ marginBottom: 0 }}>
        <label htmlFor="nt">Notas adicionales</label>
        <textarea
          id="nt"
          placeholder="Tipo de cubierta, accesos, restricciones de horario, etc."
          value={form.nota}
          onChange={e => upd('nota', e.target.value)}
          style={{ minHeight: 90 }}
        />
      </div>
    </Modal>
  );
}

/* ----- Contacto ejecutivo ----- */
function ContactoModal({ data, onClose }) {
  const [copied, setCopied] = useState('');

  const copy = (t, k) => {
    navigator.clipboard?.writeText(t);
    setCopied(k);
    setTimeout(() => setCopied(''), 1500);
  };

  const e = data.ejecutivo;

  return (
    <Modal
      title="Tu ejecutivo de cuenta"
      sub="Contacto directo para temas comerciales y de operación."
      onClose={onClose}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>Cerrar</button>
          <a className="btn primary" href={'mailto:' + e.email + '?subject=Consulta%20Cliente%20' + encodeURIComponent(data.cliente.razonSocial)}>
            <Ico.mail width="14" height="14" />
            Escribir correo
          </a>
        </>
      }
    >
      <div className="exec-card">
        <div className="avatar">{e.iniciales}</div>
        <div>
          <div className="nm">{e.nombre}</div>
          <div className="rl">{e.cargo}</div>
        </div>
      </div>

      <div className="contact-rows">
        {[
          { l: 'Correo', v: e.email,    k: 'mail' },
          { l: 'Móvil',  v: e.movil,    k: 'mov' },
          { l: 'Oficina',v: e.telefono, k: 'ofi' },
        ].filter(c => c.v).map(c => (
          <div className="contact-row" key={c.k}>
            <div>
              <div className="l">{c.l}</div>
              <div className="v">{c.v}</div>
            </div>
            <button className="icon-btn" onClick={() => copy(c.v, c.k)} title="Copiar">
              {copied === c.k ? <Ico.check width="15" height="15" style={{ color: 'var(--accent)' }} /> : <Ico.copy width="15" height="15" />}
            </button>
          </div>
        ))}
      </div>
    </Modal>
  );
}

window.Modal = Modal;
window.AutoAtencionModal = AutoAtencionModal;
window.SolicitarModal = SolicitarModal;
window.ContactoModal = ContactoModal;
