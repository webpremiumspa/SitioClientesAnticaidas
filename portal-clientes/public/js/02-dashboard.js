/* ================================================================
   DASHBOARD — lista de proyectos, KPIs, ejecutivo, acciones rápidas
   ================================================================ */

// Los proyectos archivados (PENDIENTE/CANCELADO) no se muestran en el portal:
// no tienen pestaña, no cuentan en los KPI y se excluyen de la lista.
const TABS = [
  { key: 'todos',         label: 'Todos' },
  { key: 'en-ejecucion',  label: 'En ejecución' },
  { key: 'terminado',     label: 'Terminados' },
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
        <div className="addr">{p.sub}</div>

        <div className="proj-meta">
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
        <div className="row" style={{ gap: 8, justifyContent: 'flex-end' }}>
          <CertChip vigencia={p.certVigencia} />
          <span className="docs-count">{totalDocs} documentos</span>
        </div>
        <span className="open">
          Abrir proyecto
          <Ico.arrowR width="14" height="14" />
        </span>
      </div>
    </button>
  );
}

/* Cada proyecto terminado tiene su propia PROX MANTENCION, así que la tarjeta
   lista una fila por proyecto (no una sola fecha). Las vencidas van primero,
   marcadas en rojo, porque son las que exigen acción. */
const INSP_VISIBLES = 4;

function InspeccionesCard({ inspecciones }) {
  const [verTodas, setVerTodas] = useState(false);
  const lista = inspecciones || [];
  if (lista.length === 0) return null;

  const visibles = verTodas ? lista : lista.slice(0, INSP_VISIBLES);
  const ocultas = lista.length - visibles.length;
  const vencidas = lista.filter(i => i.vencida).length;

  return (
    <div className="side-card">
      <h4>{lista.length === 1 ? 'Próxima inspección' : 'Próximas inspecciones'}</h4>
      <p className="sub">
        {vencidas > 0
          ? `${vencidas} ${vencidas === 1 ? 'proyecto tiene' : 'proyectos tienen'} la inspección vencida.`
          : 'Mantén tus sistemas certificados al día.'}
      </p>

      <div className="insp-list">
        {visibles.map(i => (
          <div key={i.codigo} className={'insp-row' + (i.vencida ? ' vencida' : '')}>
            <div className="ic"><Ico.shield width="18" height="18" /></div>
            <div className="body">
              <div className="n">{i.proyecto}</div>
              <div className="d">{i.vencida ? 'Vencida' : 'Inspección anual'} · {i.fecha}</div>
            </div>
          </div>
        ))}
      </div>

      {(ocultas > 0 || verTodas) && (
        <button className="btn ghost sm insp-more" onClick={() => setVerTodas(v => !v)}>
          {verTodas ? 'Ver menos' : `Ver todas (${lista.length})`}
        </button>
      )}
    </div>
  );
}

function Dashboard({ data, onOpenProject, onOpenModal }) {
  const [tab, setTab] = useState('todos');

  const visibles = useMemo(
    () => data.proyectos.filter(p => p.estado !== 'archivado'),
    [data]
  );

  const counts = useMemo(() => {
    const c = { todos: visibles.length };
    for (const t of TABS.slice(1)) {
      c[t.key] = visibles.filter(p => p.estado === t.key).length;
    }
    return c;
  }, [visibles]);

  const list = useMemo(() => {
    if (tab === 'todos') return visibles;
    return visibles.filter(p => p.estado === tab);
  }, [tab, visibles]);

  const active = counts['en-ejecucion'];
  const done = counts['terminado'];

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
            <span className="v">{visibles.length}</span>
          </div>
          <div className="kpi accent">
            <span className="l">En ejecución</span>
            <span className="v">{active}</span>
          </div>
          <div className="kpi">
            <span className="l">Terminados</span>
            <span className="v">{done}</span>
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
            {data.ejecutivo.movil && (
              <a className="btn accent sm" href={'tel:' + data.ejecutivo.movil.replace(/\s/g, '')}>
                <Ico.phone width="14" height="14" />
                Llamar
              </a>
            )}
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

        <InspeccionesCard inspecciones={data.proximasInspecciones} />
      </aside>
    </div>
  );
}

window.Dashboard = Dashboard;
window.InspeccionesCard = InspeccionesCard;
window.StatusPill = StatusPill;
