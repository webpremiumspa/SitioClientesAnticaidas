/* ================================================================
   APP — Root state + routing
   ================================================================ */

function Topbar({ data, view, selectedProject, selectedFolder, onNav, onLogout }) {
  return (
    <div className="topbar">
      <div className="brand"><Logo height={28} /></div>
      <div className="divider"></div>

      <div className="crumbs">
        <button onClick={() => onNav({ view: 'dashboard' })}>Inicio</button>
        {selectedProject && (
          <>
            <span className="sep">/</span>
            {selectedFolder ? (
              <>
                <button onClick={() => onNav({ view: 'project', project: selectedProject })}>
                  {selectedProject.nombre}
                </button>
                <span className="sep">/</span>
                <span className="current">
                  {data.carpetas.find(c => c.key === selectedFolder)?.label}
                </span>
              </>
            ) : (
              <span className="current">{selectedProject.nombre}</span>
            )}
          </>
        )}
      </div>

      <div className="user">
        <div className="user-chip">
          <div className="avatar">{data.cliente.razonSocial.slice(0, 2).toUpperCase()}</div>
          <div className="meta">
            <div className="n">{data.cliente.razonSocial}</div>
            <div className="r">{data.cliente.rut}</div>
          </div>
        </div>
        <button className="icon-btn" onClick={onLogout} title="Cerrar sesión" style={{ color: 'var(--ink-on-dark-2)' }}>
          <Ico.logout width="16" height="16" />
        </button>
      </div>
    </div>
  );
}

function App() {
  const [data, setData] = useState(null);
  const [logged, setLogged] = useState(false);
  const [loading, setLoading] = useState(true);     // comprobando sesión / cargando datos
  const [loadErr, setLoadErr] = useState('');
  const [view, setView] = useState('dashboard');           // dashboard | project | folder
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [modal, setModal] = useState(null);                // 'auto' | 'solicitar' | 'contacto' | null

  // Carga los datos del portal desde la API (store local del backend).
  const cargarPortal = async () => {
    setLoadErr('');
    const r = await fetch('/api/portal', { headers: { Accept: 'application/json' } });
    if (r.status === 401) { setLogged(false); return false; }
    if (!r.ok) { setLoadErr('No se pudieron cargar tus datos.'); return false; }
    setData(await r.json());
    setLogged(true);
    return true;
  };

  // Al montar: si ya hay sesión activa, cargar directo.
  useEffect(() => {
    (async () => {
      try {
        const s = await fetch('/api/session').then((x) => x.json()).catch(() => ({}));
        if (s.authenticated) await cargarPortal();
      } finally { setLoading(false); }
    })();
  }, []);

  const onLogin = async () => {
    setLoading(true);
    try { await cargarPortal(); } finally { setLoading(false); }
  };

  const onLogout = async () => {
    try { await fetch('/api/logout', { method: 'POST' }); } catch (_) {}
    setLogged(false);
    setData(null);
    setView('dashboard');
    setSelectedProject(null);
    setSelectedFolder(null);
  };

  const onOpenProject = (p) => {
    setSelectedProject(p);
    setSelectedFolder(null);
    setView('project');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const onOpenFolder = (key) => {
    setSelectedFolder(key);
    setView('folder');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const onNav = ({ view: v, project }) => {
    if (v === 'dashboard') {
      setView('dashboard');
      setSelectedProject(null);
      setSelectedFolder(null);
    } else if (v === 'project') {
      setSelectedProject(project);
      setSelectedFolder(null);
      setView('project');
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg-deep)', color: 'var(--ink-on-dark-2)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: '0.08em' }}>Cargando…</div>
      </div>
    );
  }

  if (!logged || !data) {
    return <Login onLogin={onLogin} />;
  }

  return (
    <div className="app">
      <Topbar
        data={data}
        view={view}
        selectedProject={selectedProject}
        selectedFolder={selectedFolder}
        onNav={onNav}
        onLogout={onLogout}
      />

      {view === 'dashboard' && (
        <Dashboard
          data={data}
          onOpenProject={onOpenProject}
          onOpenModal={setModal}
        />
      )}

      {view === 'project' && selectedProject && (
        <ProjectDetail
          data={data}
          project={selectedProject}
          onOpenFolder={onOpenFolder}
          onOpenModal={setModal}
        />
      )}

      {view === 'folder' && selectedProject && selectedFolder && (
        <FolderView
          data={data}
          project={selectedProject}
          folderKey={selectedFolder}
          onBack={() => { setSelectedFolder(null); setView('project'); }}
        />
      )}

      {modal === 'auto' && <AutoAtencionModal data={data} onClose={() => setModal(null)} />}
      {modal === 'solicitar' && <SolicitarModal data={data} onClose={() => setModal(null)} />}
      {modal === 'contacto' && <ContactoModal data={data} onClose={() => setModal(null)} />}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
