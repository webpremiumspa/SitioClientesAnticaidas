/* ================================================================
   DASHBOARD — lista de proyectos, KPIs, ejecutivo, acciones rápidas
   ================================================================ */

const TABS = [
  { key: 'todos',         label: 'Todos' },
  { key: 'en-ejecucion',  label: 'En ejecución' },
  { key: 'terminado',     label: 'Terminados' },
  { key: 'archivado',     label: 'Archivados' },
];

function StatusPill({ estado, label }) {
  const cls = estado === 'en-ejecucion' ? 'active'
            : estado === 'terminado' ? 'done'
            : 'archive';
  return (
    <span className={'pill ' + cls}>
      <span className="dot"></span>
      {label}
    </span>
  );
}

function ProjectCard({ p, onOpen }) {
  const totalDocs = Object.values(p.docs || {}).reduce((s, arr) => s + (arr ? arr.length : 0), 0);

  return (
    <button className="proj-card" onClick={() => onOpen(p)} data-screen-label={`Proyecto ${p.codigo}`}>
      <div>
        <div className="head">
          <StatusPill estado={p.estado} label={p.estadoLabel} />
          <span className="code">{p.codigo}</span>
        </div>
        <h3>{p.nombre}</h3>
        <div className="addr">{p.sub} · {p.direccion}</div>

        <div className="proj-meta">
          <div>
            <span className="l">Tipo</span>
            <span className="v">{p.tipoSistema}</span>
          </div>
          <div>
            <span className="l">Extensión</span>
            <span className="v">{p.extension}</span>
          </div>
          <div>
            <span className="l">{p.estado === 'en-ejecucion' ? 'Inicio' : 'Entrega'}</span>
            <span className="v">{p.estado === 'en-ejecucion' ? p.fechaInicio : p.fechaEntrega}</span>
          </div>
          <div>
            <span className="l">Diseño</span>
            <span className="v">{p.diseno}</span>
          </div>
        </div>

        {p.estado === 'en-ejecucion' && (
          <div className="progress accent">
            <i style={{ width: (p.progreso * 100) + '%' }}></i>
          </div>
        )}
      </div>

      <div className="proj-side">
        <span className="docs-count">{totalDocs} documentos</span>
        <span className="open">
          Abrir proyecto
          <Ico.arrowR width="14" height="14" />
        </span>
      </div>
    </button>
  );
}

function Dashboard({ data, onOpenProject, onOpenModal }) {
  const [tab, setTab] = useState('todos');

  const counts = useMemo(() => {
    const c = { todos: data.proyectos.length };
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

  return (
    <div className="dash" data-screen-label="02 Dashboard">
      <div className="dash-main">
        <div className="greeting">
          <div>
            <div className="eyebrow">Bienvenido, {data.cliente.razonSocial}</div>
            <h1>Hola, {data.cliente.solicitante.split(' ')[0]}.</h1>
            <div className="sub">
              Esta es la vista general de los proyectos que hemos realizado contigo.
            </div>
          </div>

          <button className="btn accent" onClick={() => onOpenModal('solicitar')}>
            <Ico.plus width="16" height="16" />
            Solicitar nuevo proyecto
          </button>
        </div>

        <div className="kpis">
          <div className="kpi">
            <span className="l">Total proyectos</span>
            <span className="v">{data.proyectos.length}</span>
          </div>
          <div className="kpi accent">
            <span className="l">En ejecución</span>
            <span className="v">{active}</span>
          </div>
          <div className="kpi">
            <span className="l">Terminados</span>
            <span className="v">{done}</span>
          </div>
          <div className="kpi">
            <span className="l">Archivados</span>
            <span className="v">{archived}</span>
          </div>
        </div>

        <div className="tabs">
          {TABS.map(t => (
            <button
              key={t.key}
              className={tab === t.key ? 'active' : ''}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              <span className="count">{counts[t.key]}</span>
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="empty-state">
            <div className="ic"><Ico.inbox width="24" height="24" /></div>
            <div className="h">No hay proyectos en este estado</div>
            <div>Cambia de pestaña para ver el resto de tu cartera.</div>
          </div>
        ) : (
          <div className="proj-list">
            {list.map(p => <ProjectCard key={p.id} p={p} onOpen={onOpenProject} />)}
          </div>
        )}
      </div>

      <aside className="dash-side">
        <div className="side-card dark">
          <h4>Tu ejecutivo de cuenta</h4>
          <p className="sub">Disponible Lun – Vie 09:00–18:00</p>
          <div className="exec">
            <div className="avatar">{data.ejecutivo.iniciales}</div>
            <div>
              <div className="nm">{data.ejecutivo.nombre}</div>
              <div className="rl">{data.ejecutivo.cargo}</div>
            </div>
          </div>
          <div className="exec-actions">
            <button className="btn secondary sm" onClick={() => onOpenModal('contacto')}>
              <Ico.mail width="14" height="14" />
              Contactar
            </button>
            <a className="btn accent sm" href={'tel:' + data.ejecutivo.movil.replace(/\s/g, '')}>
              <Ico.phone width="14" height="14" />
              Llamar
            </a>
          </div>
        </div>

        <button className="quick-action accent" onClick={() => onOpenModal('auto')}>
          <div className="ico"><Ico.spark width="18" height="18" /></div>
          <div>
            <div className="t">Auto-atención</div>
            <div className="d">Describe tu requerimiento y nuestro ejecutivo te contactará.</div>
          </div>
        </button>

        <button className="quick-action" onClick={() => onOpenModal('solicitar')}>
          <div className="ico"><Ico.bolt width="18" height="18" /></div>
          <div>
            <div className="t">Solicitar nuevo proyecto</div>
            <div className="d">Cotiza una nueva línea de vida o sistema anticaídas.</div>
          </div>
        </button>

        <div className="side-card">
          <h4>Próxima inspección</h4>
          <p className="sub" style={{ marginBottom: 12 }}>Mantén tu sistema certificado al día.</p>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
            background: 'var(--bg-paper-2)', borderRadius: 10, border: '1px solid var(--border-light)'
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 8, background: 'var(--accent-soft)',
              color: 'var(--accent)', display: 'grid', placeItems: 'center'
            }}>
              <Ico.shield width="18" height="18" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Ñuñoa LV Norte · LV Sur</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
                Inspección anual · 10-2026
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

window.Dashboard = Dashboard;
window.StatusPill = StatusPill;
