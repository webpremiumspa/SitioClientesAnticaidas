'use strict';

/**
 * Datos de ejemplo para DEMO_MODE (sin credenciales de AppSheet/Graph).
 * Estructura interna del store: cada proyecto lleva su bloque `cliente`
 * embebido para poder filtrar por RUT. Basado en los datos reales de Inacap.
 */

const CLIENTE_INACAP = {
  rut: '60711000-K',
  razonSocial: 'Inacap',
  direccion: 'Av Vitacura 10151, Vitacura',
  comuna: 'Vitacura',
  region: 'Región Metropolitana de Santiago',
  solicitante: 'Israel Acuña',
  email: 'iacunaf@inacap.cl',
  telefono: '+56 9 8348 1482',
};

function proyectos() {
  return [
    {
      id: 'inacap-vitacura-02103',
      codigo: 'AFF4262-02103',
      nombre: 'INACAP SEDE VITACURA',
      sub: 'Línea de vida horizontal · cubierta edificio docente',
      direccion: 'Av Vitacura 10151, Vitacura',
      comuna: 'Vitacura',
      region: 'Metropolitana',
      tipoSistema: 'LV HORIZONTAL',
      extension: '67,0 m',
      cantidadUsuarios: 2,
      diseno: 'Francisca Frez',
      instalador: 'Camilo Ramos',
      solicitante: 'Israel Acuña',
      validador: 'Carlo Cofré Ramírez',
      estado: 'en-ejecucion',
      estadoLabel: 'En ejecución',
      fechaInicio: '04-05-2026',
      fechaEntrega: null,
      fechaInforme: null,
      progreso: 0.62,
      proximoHito: 'Tensado y ensayo de carga — 21-05-2026',
      descripcion:
        'Instalación de línea de vida horizontal continua sobre la cubierta del edificio docente principal. Considera 6 anclajes intermedios FrogLine sobre placa estructural, terminales ponchados y cable inox 7×19.',
      cliente: CLIENTE_INACAP,
      clienteFolder: 'AFF4262 INACAP',
      registros: [{ idRegistro: 'AFF4262-02103 - 02103' }],
      docs: {
        certificados: [],
      },
    },
    {
      id: 'inacap-nunoa-01841',
      codigo: 'AFF4262-01841',
      nombre: 'INACAP SEDE ÑUÑOA — LV Norte',
      sub: 'Línea de vida horizontal · cubierta acceso norte',
      direccion: 'Brown Nte. 290, Ñuñoa',
      comuna: 'Ñuñoa',
      region: 'Metropolitana',
      tipoSistema: 'LV HORIZONTAL',
      extension: '53,0 m',
      cantidadUsuarios: 1,
      diseno: 'Francisca Frez',
      instalador: 'Camilo Ramos',
      solicitante: 'Israel Acuña',
      validador: 'Carlo Cofré Ramírez',
      estado: 'terminado',
      estadoLabel: 'Terminado',
      fechaInicio: '28-10-2025',
      fechaEntrega: '28-10-2025',
      fechaInforme: '03-11-2025',
      progreso: 1,
      proximoHito: 'Inspección anual — 10-2026',
      descripcion:
        'Línea de vida horizontal de 53 m con 4 anclajes intermedios FrogLine, terminales ponchados, tensor y placas PV6. Recibido por Luis Saavedra (Jefe de Operaciones).',
      cliente: CLIENTE_INACAP,
      clienteFolder: 'AFF4262 INACAP',
      registros: [{ idRegistro: 'AFF4262-01841 - 01841' }],
      docs: {
        'calculos-garantias': [
          { name: 'SafetyCentre_Calculation_AFF4262-01841.pdf', size: '1.4 MB', date: '03-11-2025', tag: 'VIGENTE', docId: 'demo-calc-01841' },
          { name: 'Warranty_Corrosion_10yrs.pdf', size: '380 KB', date: '28-10-2025', tag: 'VIGENTE', docId: 'demo-war-01841' },
        ],
        certificados: [
          { name: 'CERT_INSTALACION_AFF4262-01841.pdf', size: '290 KB', date: '03-11-2025', tag: 'VIGENTE', docId: 'demo-cert-01841' },
        ],
        'fichas-tecnicas': [
          { name: 'FrogLine_Data_Sheet.pdf', size: '780 KB', date: '28-10-2025', tag: 'VIGENTE', docId: 'demo-ficha-01841' },
        ],
        registros: [
          { name: 'REG_INSTALADOR_AFF4262-01841.pdf', size: '210 KB', date: '28-10-2025', tag: 'VIGENTE', docId: 'demo-reg-01841' },
        ],
      },
    },
    {
      id: 'inacap-maipu-01620',
      codigo: 'AFF4262-01620',
      nombre: 'INACAP SEDE MAIPÚ',
      sub: 'Línea de vida horizontal · cubierta gimnasio',
      direccion: 'Av Pajaritos 6202, Maipú',
      comuna: 'Maipú',
      region: 'Metropolitana',
      tipoSistema: 'LV HORIZONTAL',
      extension: '38,0 m',
      cantidadUsuarios: 1,
      diseno: 'Francisca Frez',
      instalador: 'Camilo Ramos',
      solicitante: 'Israel Acuña',
      validador: 'Carlo Cofré Ramírez',
      estado: 'archivado',
      estadoLabel: 'Archivado',
      fechaInicio: '14-03-2024',
      fechaEntrega: '14-03-2024',
      fechaInforme: '20-03-2024',
      progreso: 1,
      proximoHito: 'Inspección anual — 03-2026',
      descripcion:
        'Sistema entregado en marzo 2024. Mantiene póliza de inspección anual vigente. Documentación de cierre disponible para descarga.',
      cliente: CLIENTE_INACAP,
      clienteFolder: 'AFF4262 INACAP',
      registros: [{ idRegistro: 'AFF4262-01620 - 01620' }],
      docs: {
        certificados: [
          {
            name: 'CERT_INSTALACION_AFF4262-01620.pdf',
            size: '290 KB',
            date: '20-03-2024',
            tag: 'VIGENTE',
            docId: 'demo-cert-01620',
          },
        ],
      },
    },
  ];
}

module.exports = { proyectos };
