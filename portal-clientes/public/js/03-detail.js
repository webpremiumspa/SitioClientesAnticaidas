/* ================================================================
   PROJECT DETAIL & FOLDER VIEW
   ================================================================ */

const FOLDER_ICONS = {
  cg: (
    <svg viewBox="0 0 48 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.4c0-1.3 1-2.4 2.4-2.4H13c.6 0 1.2.24 1.66.66l1.65 1.6c.44.4 1 .64 1.62.64H43c1.4 0 2.4 1.07 2.4 2.4v18.3c0 1.3-1 2.4-2.4 2.4H5.4C4 31 3 29.93 3 28.6V8.4Z"/>
      <path d="M14 19h12M14 23h18M14 15h8" />
    </svg>
  ),
  ci: (
    <svg viewBox="0 0 48 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.4c0-1.3 1-2.4 2.4-2.4H13c.6 0 1.2.24 1.66.66l1.65 1.6c.44.4 1 .64 1.62.64H43c1.4 0 2.4 1.07 2.4 2.4v18.3c0 1.3-1 2.4-2.4 2.4H5.4C4 31 3 29.93 3 28.6V8.4Z"/>
      <circle cx="24" cy="21" r="4.5" />
      <path d="m21.5 21 2 2 4-4" />
    </svg>
  ),
  ft: (
    <svg viewBox="0 0 48 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.4c0-1.3 1-2.4 2.4-2.4H13c.6 0 1.2.24 1.66.66l1.65 1.6c.44.4 1 .64 1.62.64H43c1.4 0 2.4 1.07 2.4 2.4v18.3c0 1.3-1 2.4-2.4 2.4H5.4C4 31 3 29.93 3 28.6V8.4Z"/>
      <path d="M22 14v14M16 17l6-3 6 3M16 25l6 3 6-3" />
    </svg>
  ),
  rd: (
    <svg viewBox="0 0 48 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.4c0-1.3 1-2.4 2.4-2.4H13c.6 0 1.2.24 1.66.66l1.65 1.6c.44.4 1 .64 1.62.64H43c1.4 0 2.4 1.07 2.4 2.4v18.3c0 1.3-1 2.4-2.4 2.4H5.4C4 31 3 29.93 3 28.6V8.4Z"/>
      <path d="M17 17h14M17 21h10M17 25h7" />
    </svg>
  ),
  // Ícono genérico para categorías/carpetas no reconocidas.
  gen: (
    <svg viewBox="0 0 48 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.4c0-1.3 1-2.4 2.4-2.4H13c.6 0 1.2.24 1.66.66l1.65 1.6c.44.4 1 .64 1.62.64H43c1.4 0 2.4 1.07 2.4 2.4v18.3c0 1.3-1 2.4-2.4 2.4H5.4C4 31 3 29.93 3 28.6V8.4Z"/>
      <path d="M18 20h12M18 24h12" />
    </svg>
  ),
};

// Devuelve el ícono de una categoría, con fallback genérico.
function folderIcon(cat) {
  return FOLDER_ICONS[cat] || FOLDER_ICONS.gen;
}

function ProjectDetail({ data, project, onOpenFolder, onOpenModal }) {
  const counts = {};
  project.carpetas.forEach((c) => { counts[c.key] = (project.docs[c.key] || []).length; });

  return (
    <div className="detail" data-screen-label={`03 Detalle ${project.codigo}`}>
      <div className="detail-head">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div className="code">{project.codigo}</div>
            <h1>{project.nombre}</h1>
            <div className="addr">{project.sub}</div>
            <div style={{ marginTop: 14 }}>
              <StatusPill estado={project.estado} label={project.estadoLabel} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ fontSize: 12, color: 'var(--ink-on-dark-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
              {project.direccion}, {project.comuna}
            </div>
            <button className="btn secondary sm" onClick={() => onOpenModal('contacto')}>
              <Ico.mail width="14" height="14" />
              Contactar ejecutivo
            </button>
          </div>
        </div>

        <div className="facts">
          <div>
            <div className="l">Tipo de sistema</div>
            <div className="v">{project.tipoSistema}</div>
          </div>
          <div>
            <div className="l">Extensión total</div>
            <div className="v">{project.extension}</div>
          </div>
          <div>
            <div className="l">Usuarios simultáneos</div>
            <div className="v">{project.cantidadUsuarios}</div>
          </div>
          <div>
            <div className="l">Fecha ejecución</div>
            <div className="v">{project.fechaInicio}</div>
          </div>
          <div>
            <div className="l">{project.fechaEntrega ? 'Fecha entrega' : 'Próximo hito'}</div>
            <div className="v">{project.fechaEntrega || project.proximoHito.split('—')[1]?.trim()}</div>
          </div>
        </div>

        {project.estado === 'en-ejecucion' && (
          <div style={{ marginTop: 24 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', marginBottom: 8,
              color: 'var(--ink-on-dark-2)', fontSize: 12
            }}>
              <span>Avance del proyecto</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{Math.round(project.progreso * 100)}%</span>
            </div>
            <div className="progress accent" style={{ background: 'var(--border-dark-2)' }}>
              <i style={{ width: (project.progreso * 100) + '%' }}></i>
            </div>
            <div style={{ marginTop: 10, fontSize: 13, color: 'var(--ink-on-dark-2)' }}>
              <strong style={{ color: 'var(--ink-on-dark)' }}>Próximo:</strong> {project.proximoHito}
            </div>
          </div>
        )}
      </div>

      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-l)',
        padding: '22px 24px',
        marginBottom: 28,
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr 1fr',
        gap: 28,
      }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
            Descripción
          </div>
          <p style={{ margin: 0, color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.55 }}>
            {project.descripcion}
          </p>
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
            Equipo Anticaidas
          </div>
          <div style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.7 }}>
            <div><span style={{ color: 'var(--ink-3)' }}>Diseño · </span>{project.diseno}</div>
            <div><span style={{ color: 'var(--ink-3)' }}>Instalador · </span>{project.instalador}</div>
            <div><span style={{ color: 'var(--ink-3)' }}>Validado por · </span>{project.validador}</div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
            Contacto del proyecto
          </div>
          <div style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.7 }}>
            <div><span style={{ color: 'var(--ink-3)' }}>Solicitante · </span>{project.solicitante}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{data.cliente.email}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{data.cliente.telefono}</div>
          </div>
        </div>
      </div>

      <div className="section-title">
        <h2>Documentación del proyecto</h2>
        <span className="sub">Selecciona una carpeta para visualizar o descargar archivos.</span>
      </div>

      <div className="folders">
        {project.carpetas.map(c => {
          const n = counts[c.key];
          const cls = 'folder cat-' + c.cat + (n === 0 ? ' empty' : '');
          return (
            <button
              key={c.key}
              className={cls}
              onClick={() => n > 0 && onOpenFolder(c.key)}
              disabled={n === 0}
            >
              <div className="folder-icon">{folderIcon(c.cat)}</div>
              <span className="open-tag">{n === 0 ? 'vacío' : 'abrir →'}</span>
              <div className="count">{n}</div>
              <h3>{c.label}</h3>
              <div className="label">
                {n === 0 ? 'Sin documentos por el momento.' :
                 n === 1 ? '1 documento disponible' :
                 n + ' documentos disponibles'}
              </div>
              {c.cat === 'ci' && project.certVigencia && (
                <div style={{ marginTop: 8 }}><CertChip vigencia={project.certVigencia} /></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ===========================================================
   FOLDER VIEW (doc list + PDF viewer)
   =========================================================== */
function FolderView({ data, project, folderKey, onBack }) {
  const folder = project.carpetas.find(c => c.key === folderKey);
  const docs = project.docs[folderKey] || [];
  const [active, setActive] = useState(docs[0] || null);
  const [downloaded, setDownloaded] = useState({});

  useEffect(() => { setActive(docs[0] || null); }, [folderKey, project.id]);

  const handleDownload = (doc) => {
    setDownloaded(d => ({ ...d, [doc.name]: true }));
    setTimeout(() => setDownloaded(d => ({ ...d, [doc.name]: false })), 2200);
  };

  return (
    <div className="folder-view" data-screen-label={`04 ${folder.label}`}>
      <div className={'folder-list cat-' + folder.cat}>
        <div className="folder-header">
          <div className="icon-wrap">{folderIcon(folder.cat)}</div>
          <div>
            <div className="t-eye">{project.codigo} · {project.nombre.split('—')[1]?.trim() || project.comuna}</div>
            <h2>{folder.label}</h2>
            <p>{folder.desc}</p>
            {folder.cat === 'ci' && (
              <div style={{ marginTop: 8 }}><CertChip vigencia={project.certVigencia} /></div>
            )}
          </div>
        </div>

        {docs.length === 0 ? (
          <div className="empty-state">
            <div className="ic"><Ico.folder width="22" height="22" /></div>
            <div className="h">Carpeta vacía</div>
            <div>Los documentos se cargan al cerrar la etapa correspondiente.</div>
          </div>
        ) : (
          <div className="doc-list">
            {docs.map((d, i) => {
              const isActive = active && active.name === d.name;
              return (
                <button
                  key={i}
                  className={'doc-row' + (isActive ? ' active' : '')}
                  onClick={() => setActive(d)}
                >
                  <div className="pdf-ic">PDF</div>
                  <div className="body">
                    <div className="name">{d.name}</div>
                    <div className="meta">{d.size} · {d.date}{d.tag ? ' · ' + d.tag : ''}</div>
                  </div>
                  <div className="act">
                    <a
                      className="icon-btn"
                      href={d.path}
                      target="_blank"
                      rel="noopener"
                      title="Abrir en pestaña nueva"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Ico.expand width="15" height="15" />
                    </a>
                    <a
                      className="icon-btn"
                      href={d.path}
                      download={d.name}
                      title="Descargar"
                      onClick={(e) => { e.stopPropagation(); handleDownload(d); }}
                    >
                      {downloaded[d.name]
                        ? <Ico.check width="15" height="15" style={{ color: 'var(--accent)' }} />
                        : <Ico.download width="15" height="15" />}
                    </a>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <button className="btn ghost sm" onClick={onBack}>
            <Ico.chevL width="14" height="14" />
            Volver al proyecto
          </button>
        </div>
      </div>

      <div className="viewer">
        {active ? (
          <>
            <div className="viewer-head">
              <Ico.eye width="16" height="16" style={{ color: 'var(--ink-3)' }} />
              <div>
                <div className="name">{active.name}</div>
                <div className="meta">{active.size} · {active.date}</div>
              </div>
              <div className="spacer"></div>
              <a className="btn secondary sm" href={active.path} target="_blank" rel="noopener">
                <Ico.expand width="13" height="13" />
                Ampliar
              </a>
              <a className="btn primary sm" href={active.path} download={active.name} onClick={() => handleDownload(active)}>
                <Ico.download width="13" height="13" />
                Descargar
              </a>
            </div>
            <div className="viewer-body">
              {active.path ? (
                <iframe
                  key={active.path}
                  src={active.path + '#toolbar=1&navpanes=0&view=FitH'}
                  title={active.name}
                />
              ) : (
                <div className="viewer-empty">
                  <div>
                    <div className="ic"><Ico.eye width="28" height="28" /></div>
                    <p className="h">Vista previa no disponible</p>
                    <p>El documento no está disponible en modo demo.</p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="viewer-empty">
            <div>
              <div className="ic"><Ico.folder width="28" height="28" /></div>
              <p className="h">Selecciona un documento</p>
              <p>Verás aquí una vista previa del archivo seleccionado.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

window.ProjectDetail = ProjectDetail;
window.FolderView = FolderView;
window.FOLDER_ICONS = FOLDER_ICONS;
