import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, DatePicker, Modal, Button, Space, Tag, message, Tooltip } from 'antd';
import { Eye, Edit, CheckCircle, AlertCircle, Calendar, Search } from 'lucide-react';
import dayjs from 'dayjs';
import serviciosAutenticacion from '../../api/autenticacion';
import './Reportes.css';

const { RangePicker } = DatePicker;

const fmt = (n) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n || 0);

// Componente para tarjetas de métricas
const MetricCard = ({ label, value, variant = 'default' }) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'info': return 'metric-card-info';
      case 'success': return 'metric-card-success';
      case 'danger': return 'metric-card-danger';
      default: return 'metric-card-default';
    }
  };

  return (
    <div className={`metric-card ${getVariantClass()}`}>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
    </div>
  );
};

const Reportes = () => {
  const [usuario, setUsuario] = useState(null);
  const [puntosVenta, setPuntosVenta] = useState([]);
  const [pdvSeleccionado, setPdvSeleccionado] = useState('');
  const [cargandoPdvs, setCargandoPdvs] = useState(false);
  const [cierres, setCierres] = useState([]);
  const [cargandoCierres, setCargandoCierres] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState([dayjs(), dayjs()]);
  const [modalVer, setModalVer] = useState(false);
  const [cierreSeleccionado, setCierreSeleccionado] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si hay usuario autenticado
    const usuarioActual = serviciosAutenticacion.obtenerUsuarioActual();
    if (!usuarioActual) {
      navigate('/login');
    } else {
      setUsuario(usuarioActual);
      // Cargar puntos de venta asignados al analista
      cargarPuntosVenta(usuarioActual.documento);
    }
  }, [navigate]);

  useEffect(() => {
    // Cargar cierres cuando cambie el PDV o las fechas
    if (pdvSeleccionado) {
      cargarCierres();
    }
  }, [pdvSeleccionado, fechaSeleccionada]);

  const cargarPuntosVenta = async (documento) => {
    setCargandoPdvs(true);
    try {
      const resultado = await serviciosAutenticacion.obtenerPdvsAnalista(documento);
      if (resultado.exito) {
        setPuntosVenta(resultado.pdvs);
        // Seleccionar el primer PDV por defecto
        if (resultado.pdvs.length > 0) {
          setPdvSeleccionado(resultado.pdvs[0].id);
        }
      } else {
        console.error('Error:', resultado.mensaje);
      }
    } catch (error) {
      console.error('Error al cargar puntos de venta:', error);
    } finally {
      setCargandoPdvs(false);
    }
  };

  const cargarCierres = async () => {
    if (!pdvSeleccionado) return;
    
    setCargandoCierres(true);
    try {
      // Obtener información del PDV seleccionado
      const pdvInfo = puntosVenta.find(p => p.id === pdvSeleccionado);
      const codigoPdv = pdvInfo?.id || '';
      const nombrePdv = pdvInfo?.nombre || '';
      
      // TODO: Reemplazar con llamada real a la API
      // La llamada debería ser algo como:
      // const response = await fetch(`/api/cierres?pdv=${pdvSeleccionado}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
      
      // Datos de ejemplo
      const cierresEjemplo = [
        {
          id: 1,
          fecha: '2026-04-13',
          turno: 'Mañana',
          codigoPdv: codigoPdv,
          nombrePdv: nombrePdv,
          cajera: 'María González',
          codigoCajera: 'CAJ001',
          documentoCajera: '1234567890',
          totalVentas: 4350000,
          totalEfectivo: 2150000,
          totalTarjetas: 2200000,
          diferencia: 0,
          estado: 'cuadrado',
          horaInicio: '06:00',
          horaFin: '14:00',
          mediosPago: {
            tarjetas: { cantidad: 145, valor: 2200000 },
            efectivo: { cantidad: 85, valor: 2150000 },
            sodexo: { cantidad: 12, valor: 350000 }
          }
        },
        {
          id: 2,
          fecha: '2026-04-13',
          turno: 'Tarde',
          codigoPdv: codigoPdv,
          nombrePdv: nombrePdv,
          cajera: 'Laura Pérez',
          codigoCajera: 'CAJ002',
          documentoCajera: '0987654321',
          totalVentas: 3850000,
          totalEfectivo: 1950000,
          totalTarjetas: 1800000,
          diferencia: -15000,
          estado: 'faltante',
          horaInicio: '14:00',
          horaFin: '22:00',
          mediosPago: {
            tarjetas: { cantidad: 120, valor: 1800000 },
            efectivo: { cantidad: 75, valor: 1950000 },
            rappi: { cantidad: 8, valor: 100000 }
          }
        },
        {
          id: 3,
          fecha: '2026-04-12',
          turno: 'Mañana',
          codigoPdv: codigoPdv,
          nombrePdv: nombrePdv,
          cajera: 'Ana Rodríguez',
          codigoCajera: 'CAJ003',
          documentoCajera: '1122334455',
          totalVentas: 4120000,
          totalEfectivo: 2020000,
          totalTarjetas: 2140000,
          diferencia: 12000,
          estado: 'sobrante',
          horaInicio: '06:00',
          horaFin: '14:00',
          mediosPago: {
            tarjetas: { cantidad: 138, valor: 2140000 },
            efectivo: { cantidad: 82, valor: 2020000 }
          }
        },
      ];
      
      setCierres(cierresEjemplo);
    } catch (error) {
      console.error('Error al cargar cierres:', error);
      message.error('Error al cargar los cierres de caja');
    } finally {
      setCargandoCierres(false);
    }
  };

  const manejarCambioPdv = (evento) => {
    setPdvSeleccionado(evento.target.value);
  };

  const handleVerCierre = (cierre) => {
    setCierreSeleccionado(cierre);
    setModalVer(true);
  };

  const handleEditarCierre = (cierre) => {
    // Redirigir a la página de edición con todos los detalles
    navigate('/analista/editar-cierre', { state: { cierre } });
  };

  const cerrarSesion = () => {
    serviciosAutenticacion.cerrarSesion();
    navigate('/login');
  };

  const obtenerIniciales = (nombre) => {
    if (!nombre) return 'A';
    const palabras = nombre.split(' ');
    return palabras[0][0].toUpperCase();
  };

  // Columnas de la tabla
  const columnas = [
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      width: 110,
      render: (fecha) => dayjs(fecha).format('DD/MM/YYYY'),
      sorter: (a, b) => dayjs(a.fecha).unix() - dayjs(b.fecha).unix(),
    },
    {
      title: 'Punto de Venta',
      dataIndex: 'nombrePdv',
      key: 'nombrePdv',
      width: 200,
      render: (nombre) => (
        <div style={{ fontWeight: 500 }}>{nombre}</div>
      ),
    },
    {
      title: 'Turno',
      dataIndex: 'turno',
      key: 'turno',
      width: 90,
      filters: [
        { text: 'Mañana', value: 'Mañana' },
        { text: 'Tarde', value: 'Tarde' },
      ],
      onFilter: (value, record) => record.turno === value,
    },
    {
      title: 'Cajera',
      dataIndex: 'cajera',
      key: 'cajera',
      width: 180,
      render: (nombre, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{nombre}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Código: {record.codigoCajera}</div>
        </div>
      ),
    },
    {
      title: 'Total Ventas',
      dataIndex: 'totalVentas',
      key: 'totalVentas',
      width: 130,
      render: (valor) => <span style={{ fontWeight: 500 }}>{fmt(valor)}</span>,
      sorter: (a, b) => a.totalVentas - b.totalVentas,
    },
    {
      title: 'Diferencia',
      dataIndex: 'diferencia',
      key: 'diferencia',
      width: 120,
      render: (valor) => (
        <span style={{ 
          color: valor < 0 ? '#f5222d' : valor > 0 ? '#52c41a' : '#666',
          fontWeight: 500 
        }}>
          {fmt(valor)}
        </span>
      ),
      sorter: (a, b) => a.diferencia - b.diferencia,
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      width: 110,
      render: (estado) => {
        const config = {
          cuadrado: { color: 'success', text: 'Cuadrado', icon: <CheckCircle size={14} /> },
          faltante: { color: 'error', text: 'Faltante', icon: <AlertCircle size={14} /> },
          sobrante: { color: 'warning', text: 'Sobrante', icon: <AlertCircle size={14} /> },
        };
        const { color, text, icon } = config[estado] || {};
        return (
          <Tag color={color} icon={icon} style={{ display: 'flex', alignItems: 'center', width: 'fit-content' }}>
            {text}
          </Tag>
        );
      },
      filters: [
        { text: 'Cuadrado', value: 'cuadrado' },
        { text: 'Faltante', value: 'faltante' },
        { text: 'Sobrante', value: 'sobrante' },
      ],
      onFilter: (value, record) => record.estado === value,
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Ver detalles">
            <Button 
              type="text" 
              icon={<Eye size={16} />}
              onClick={() => handleVerCierre(record)}
            />
          </Tooltip>
          <Tooltip title="Editar cierre">
            <Button 
              type="text" 
              icon={<Edit size={16} />}
              onClick={() => handleEditarCierre(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Calcular métricas a partir de los cierres cargados
  const totalA = cierres.reduce((sum, cierre) => sum + (cierre.totalVentas || 0), 0);
  const totalB = cierres.reduce((sum, cierre) => sum + ((cierre.totalEfectivo || 0) + (cierre.totalTarjetas || 0)), 0);
  const diferencias = cierres.map(c => c.diferencia || 0);
  const faltante = diferencias.filter(d => d < 0).reduce((sum, d) => sum + Math.abs(d), 0);
  const sobrante = diferencias.filter(d => d > 0).reduce((sum, d) => sum + d, 0);

  if (!usuario) {
    return <div className="loading-container">Cargando...</div>;
  }

  return (
    <div className="modulo-analista">
      <header className="encabezado-analista">
        <div className="info-usuario-header">
          <div className="avatar-usuario">
            {obtenerIniciales(usuario.nombre)}
          </div>
          <div>
            <div className="titulo-modulo">MÓDULO DE ANALISTA</div>
            <div className="nombre-usuario">{usuario.nombre || 'Analista'}</div>
            <div className="documento-usuario">CC · {usuario.documento}</div>
          </div>
        </div>
        <button className="boton-cerrar-sesion" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </header>

            {/* Metrics */}
      <div className="metrics-grid">
        <MetricCard label="Total medios de pago (A)" value={fmt(totalA)} variant="info" />
        <MetricCard label="Total recaudo (B)" value={fmt(totalB)} variant="default" />
        <MetricCard label="Faltante" value={fmt(faltante)} variant={faltante > 0 ? "danger" : "default"} />
        <MetricCard label="Sobrante" value={fmt(sobrante)} variant={sobrante > 0 ? "success" : "default"} />
      </div>

      <main className="contenido-analista">
        {/* Selector de Punto de Venta */}
        <section className="seccion-pdv">
          <h2 className="titulo-seccion">PUNTO DE VENTA</h2>
          <div className="selector-pdv">
            <label className="label-sede">SELECCIONAR SEDE</label>
            {cargandoPdvs ? (
              <p>Cargando puntos de venta...</p>
            ) : (
              <select 
                id="select-pdv"
                value={pdvSeleccionado} 
                onChange={manejarCambioPdv}
                className="select-pdv"
              >
                <option value="">Seleccione un punto de venta</option>
                {puntosVenta.map((pdv) => (
                  <option key={pdv.id} value={pdv.id}>
                    {pdv.nombre} – {pdv.ciudad} ({pdv.tipo})
                  </option>
                ))}
              </select>
            )}
          </div>
        </section>

        {/* Selector de Fechas y Tabla de Cierres */}
        {pdvSeleccionado && (
          <section className="seccion-cierres">
            <div className="cierres-header">
              <h2 className="titulo-seccion">CIERRES DE CAJA</h2>
              <div className="filtros-cierres">
                <RangePicker
                  value={fechaSeleccionada}
                  onChange={(dates) => setFechaSeleccionada(dates)}
                  format="DD/MM/YYYY"
                  placeholder={['Fecha inicio', 'Fecha fin']}
                  style={{ width: 280 }}
                  suffixIcon={<Calendar size={16} />}
                />
                <Button 
                  type="primary" 
                  icon={<Search size={16} />}
                  onClick={cargarCierres}
                >
                  Buscar
                </Button>
              </div>
            </div>

            <div className="tabla-cierres-container">
              <Table
                columns={columnas}
                dataSource={cierres}
                loading={cargandoCierres}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} cierres`,
                }}
                scroll={{ x: 1000 }}
                locale={{ emptyText: 'No hay cierres registrados' }}
              />
            </div>
          </section>
        )}
      </main>

      {/* Modal Ver Detalles */}
      <Modal
        title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Eye size={20} />
          <span>Detalles del Cierre de Caja</span>
        </div>}
        open={modalVer}
        onCancel={() => setModalVer(false)}
        footer={[
          <Button key="close" onClick={() => setModalVer(false)}>
            Cerrar
          </Button>
        ]}
        width={700}
      >
        {cierreSeleccionado && (
          <div className="modal-detalles-cierre">
            <div className="detalle-grupo">
              <h3>Información General</h3>
              <div className="detalle-grid">
                <div className="detalle-item">
                  <span className="detalle-label">Fecha:</span>
                  <span className="detalle-valor">{dayjs(cierreSeleccionado.fecha).format('DD/MM/YYYY')}</span>
                </div>
                <div className="detalle-item">
                  <span className="detalle-label">Turno:</span>
                  <span className="detalle-valor">{cierreSeleccionado.turno}</span>
                </div>
                <div className="detalle-item">
                  <span className="detalle-label">Cajera:</span>
                  <span className="detalle-valor">{cierreSeleccionado.cajera}</span>
                </div>
                <div className="detalle-item">
                  <span className="detalle-label">Documento:</span>
                  <span className="detalle-valor">{cierreSeleccionado.documentoCajera}</span>
                </div>
              </div>
            </div>

            <div className="detalle-grupo">
              <h3>Resumen Financiero</h3>
              <div className="detalle-grid">
                <div className="detalle-item">
                  <span className="detalle-label">Total Ventas:</span>
                  <span className="detalle-valor destacado">{fmt(cierreSeleccionado.totalVentas)}</span>
                </div>
                <div className="detalle-item">
                  <span className="detalle-label">Total Efectivo:</span>
                  <span className="detalle-valor">{fmt(cierreSeleccionado.totalEfectivo)}</span>
                </div>
                <div className="detalle-item">
                  <span className="detalle-label">Total Tarjetas:</span>
                  <span className="detalle-valor">{fmt(cierreSeleccionado.totalTarjetas)}</span>
                </div>
                <div className="detalle-item">
                  <span className="detalle-label">Diferencia:</span>
                  <span className={`detalle-valor ${cierreSeleccionado.diferencia < 0 ? 'negativo' : cierreSeleccionado.diferencia > 0 ? 'positivo' : ''}`}>
                    {fmt(cierreSeleccionado.diferencia)}
                  </span>
                </div>
              </div>
            </div>

            <div className="detalle-grupo">
              <h3>Medios de Pago</h3>
              {cierreSeleccionado.mediosPago && Object.entries(cierreSeleccionado.mediosPago).map(([medio, datos]) => (
                <div key={medio} className="medio-pago-detalle">
                  <span className="medio-nombre">{medio.charAt(0).toUpperCase() + medio.slice(1)}:</span>
                  <span className="medio-info">
                    {datos.cantidad} transacciones - {fmt(datos.valor)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Reportes;