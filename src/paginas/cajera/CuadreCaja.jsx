import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import serviciosAutenticacion from '../../api/autenticacion';
import './CuadreCaja.css';

const CuadreCaja = () => {
  const [usuario, setUsuario] = useState(null);
  const [turnoActual, setTurnoActual] = useState('mañana');
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [historialCierres, setHistorialCierres] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cierreSeleccionado, setCierreSeleccionado] = useState(null);
  const [formulario, setFormulario] = useState({
    efectivo: '',
    tarjetaCredito: '',
    tarjetaDebito: '',
    transferencias: '',
    vales: '',
    otros: '',
    observaciones: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si hay usuario autenticado
    const usuarioActual = serviciosAutenticacion.obtenerUsuarioActual();
    if (!usuarioActual) {
      navigate('/login');
    } else if (usuarioActual.rol !== 'cajera') {
      navigate('/login');
    } else {
      setUsuario(usuarioActual);
      // Detectar turno actual basado en la hora
      detectarTurno();
      // Cargar historial de cierres
      cargarHistorialCierres();
    }
  }, [navigate]);

  const cargarHistorialCierres = async () => {
    try {
      // Simulación de datos del historial con información completa
      const datosSimulados = [
        {
          id: 1,
          fecha: '2026-04-14',
          pdv: 'Heladería Santafe - BOG (HELADERIA)',
          turno: 'Mañana',
          cajera: 'María González',
          documento: '1234567890',
          // Datos del sistema de ventas
          totalVentas: 4350000,
          totalTarjetas: 2200000,
          // Datos del cierre de caja
          efectivoRegistrado: 2150000,
          tarjetasRegistradas: 2200000,
          // Transacciones detalladas
          transaccionesTarjetas: [
            { tipo: 'Tarjeta Crédito', cantidad: 145, monto: 2200000 }
          ],
          transaccionesEfectivo: [
            { tipo: 'Efectivo', cantidad: 85, monto: 2150000 }
          ],
          transaccionesSodexo: [
            { tipo: 'Sodexo', cantidad: 12, monto: 350000 }
          ],
          // Cuadre
          estadoTarjetas: 'cuadrado', // 'cuadrado', 'faltante', 'sobrante'
          diferenciaTarjetas: 0,
          estadoEfectivo: 'cuadrado',
          diferenciaEfectivo: 0,
          observaciones: 'Cierre normal, todo en orden'
        },
        {
          id: 2,
          fecha: '2026-04-13',
          pdv: 'Heladería Santafe - BOG (HELADERIA)',
          turno: 'Tarde',
          cajera: 'María González',
          documento: '1234567890',
          totalVentas: 3800000,
          totalTarjetas: 1950000,
          efectivoRegistrado: 1820000,
          tarjetasRegistradas: 1950000,
          transaccionesTarjetas: [
            { tipo: 'Tarjeta Crédito', cantidad: 120, monto: 1950000 }
          ],
          transaccionesEfectivo: [
            { tipo: 'Efectivo', cantidad: 72, monto: 1850000 }
          ],
          transaccionesSodexo: [
            { tipo: 'Sodexo', cantidad: 8, monto: 280000 }
          ],
          estadoTarjetas: 'cuadrado',
          diferenciaTarjetas: 0,
          estadoEfectivo: 'faltante',
          diferenciaEfectivo: -30000,
          observaciones: 'Faltante de $30.000 en efectivo'
        },
        {
          id: 3,
          fecha: '2026-04-12',
          pdv: 'Heladería Santafe - BOG (HELADERIA)',
          turno: 'Mañana',
          cajera: 'María González',
          documento: '1234567890',
          totalVentas: 4100000,
          totalTarjetas: 2050000,
          efectivoRegistrado: 2050000,
          tarjetasRegistradas: 2080000,
          transaccionesTarjetas: [
            { tipo: 'Tarjeta Crédito', cantidad: 135, monto: 2050000 }
          ],
          transaccionesEfectivo: [
            { tipo: 'Efectivo', cantidad: 80, monto: 2050000 }
          ],
          transaccionesSodexo: [
            { tipo: 'Sodexo', cantidad: 10, monto: 320000 }
          ],
          estadoTarjetas: 'sobrante',
          diferenciaTarjetas: 30000,
          estadoEfectivo: 'cuadrado',
          diferenciaEfectivo: 0,
          observaciones: 'Sobrante de $30.000 en tarjetas'
        }
      ];
      setHistorialCierres(datosSimulados);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    }
  };

  const detectarTurno = () => {
    const hora = new Date().getHours();
    if (hora >= 6 && hora < 14) {
      setTurnoActual('mañana');
    } else if (hora >= 14 && hora < 22) {
      setTurnoActual('tarde');
    } else {
      setTurnoActual('noche');
    }
  };

  const cerrarSesion = () => {
    serviciosAutenticacion.cerrarSesion();
    navigate('/login');
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    
    // Solo permitir números y punto decimal para campos monetarios
    if (name !== 'observaciones') {
      // Validar formato numérico
      if (value && !/^\d*\.?\d*$/.test(value)) {
        return;
      }
    }
    
    setFormulario({
      ...formulario,
      [name]: value
    });
  };

  const calcularTotal = () => {
    const total = 
      parseFloat(formulario.efectivo || 0) +
      parseFloat(formulario.tarjetaCredito || 0) +
      parseFloat(formulario.tarjetaDebito || 0) +
      parseFloat(formulario.transferencias || 0) +
      parseFloat(formulario.vales || 0) +
      parseFloat(formulario.otros || 0);
    return total;
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    
    // Validar que al menos un campo tenga valor
    const total = calcularTotal();
    if (total === 0) {
      alert('Debe ingresar al menos un valor en los campos del cierre de caja');
      return;
    }

    setGuardando(true);

    try {
      // Aquí iría la llamada a la API para guardar el cierre
      const datosEnvio = {
        cajera: usuario.nombre,
        documento: usuario.documento,
        codigo: usuario.codigo,
        pdv: usuario.pdv,
        turno: turnoActual,
        fecha: new Date().toISOString(),
        ...formulario,
        total: total
      };

      console.log('Guardando cierre de caja:', datosEnvio);
      
      // Simulación de guardado
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert('Cierre de caja guardado exitosamente');
      
      // Limpiar formulario
      setFormulario({
        efectivo: '',
        tarjetaCredito: '',
        tarjetaDebito: '',
        transferencias: '',
        vales: '',
        otros: '',
        observaciones: ''
      });
      
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar el cierre de caja. Intente nuevamente.');
    } finally {
      setGuardando(false);
    }
  };

  const obtenerIniciales = (nombre) => {
    if (!nombre) return 'C';
    const palabras = nombre.split(' ');
    if (palabras.length >= 2) {
      return palabras[0][0].toUpperCase() + palabras[1][0].toUpperCase();
    }
    return palabras[0][0].toUpperCase();
  };

  const obtenerColorTurno = () => {
    switch (turnoActual) {
      case 'mañana': return '#f59e0b';
      case 'tarde': return '#3b82f6';
      case 'noche': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const verDetalleCierre = (cierre) => {
    setCierreSeleccionado(cierre);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setCierreSeleccionado(null);
  };

  const obtenerEstadoBadge = (estado) => {
    switch (estado) {
      case 'cuadrado':
        return { texto: 'Cuadrado', clase: 'badge-cuadrado' };
      case 'faltante':
        return { texto: 'Faltante', clase: 'badge-faltante' };
      case 'sobrante':
        return { texto: 'Sobrante', clase: 'badge-sobrante' };
      default:
        return { texto: '', clase: '' };
    }
  };

  if (!usuario) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="modulo-cajera">
      <header className="encabezado-cajera">
        <div className="info-usuario-header">
          <div className="avatar-usuario">
            {usuario.foto ? (
              <img src={usuario.foto} alt={usuario.nombre} className="foto-usuario" />
            ) : (
              obtenerIniciales(usuario.nombre)
            )}
          </div>
          <div>
            <div className="titulo-modulo">MÓDULO DE CAJERA</div>
            <div className="nombre-usuario">{usuario.nombre || 'Cajera'}</div>
            <div className="documento-usuario">
              CC · {usuario.documento} | Código: {usuario.codigo} | PDV: {usuario.pdv}
            </div>
            <div className="badge-turno" style={{ backgroundColor: obtenerColorTurno() }}>
              Turno {turnoActual}
            </div>
          </div>
        </div>
        <button className="boton-cerrar-sesion" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </header>

      <main className="contenido-principal">
        {/* Contenedor de las dos cards */}
        <div className="grid-cards">
          {/* Botón de Cierre de Caja */}
          <section className="seccion-cierre-rapido">
            <button className="boton-cierre-caja" onClick={() => navigate('/cierre-caja')}>
              <div className="icono-cierre">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M2 9a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="14" r="2" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div>
                <div className="titulo-boton-cierre">REALIZAR CIERRE DE CAJA</div>
                <div className="subtitulo-boton-cierre">Accede al formulario completo de cierre</div>
              </div>
              <svg className="flecha-cierre" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </section>

          {/* Botón de Ver Historial */}
          <section className="seccion-historial-boton">
            <button 
              className="boton-historial-cierres" 
              onClick={() => setMostrarHistorial(!mostrarHistorial)}
            >
              <div className="icono-historial">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div className="titulo-boton-cierre">VER HISTORIAL DE CIERRES</div>
                <div className="subtitulo-boton-cierre">Consulta tus cierres anteriores</div>
              </div>
              <svg 
                className="flecha-cierre" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none"
                style={{ transform: mostrarHistorial ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
              >
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </section>
        </div>

        {/* Tabla de Historial - Fuera del grid */}
        {mostrarHistorial && (
          <section className="seccion-tabla-historial">
            <div className="contenedor-tabla-historial">
              <div className="tabla-historial-wrapper">
                <table className="tabla-historial">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Punto de Venta</th>
                      <th>Turno</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialCierres.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                          No hay cierres registrados
                        </td>
                      </tr>
                    ) : (
                      historialCierres.map((cierre) => (
                        <tr key={cierre.id}>
                          <td>{new Date(cierre.fecha).toLocaleDateString('es-CO', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric' 
                          })}</td>
                          <td>{cierre.pdv}</td>
                          <td>
                            <span className={`badge-turno-tabla turno-${cierre.turno.toLowerCase()}`}>
                              {cierre.turno}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="boton-ver-detalle"
                              onClick={() => verDetalleCierre(cierre)}
                              title="Ver detalles"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Modal de Detalles del Cierre */}
        {mostrarModal && cierreSeleccionado && (
          <div className="modal-overlay" onClick={cerrarModal}>
            <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-titulo">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  Detalles del Cierre de Caja
                </div>
                <button className="modal-boton-cerrar" onClick={cerrarModal}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <div className="modal-body">
                {/* Información General */}
                <div className="seccion-modal">
                  <h3 className="titulo-seccion-modal">Información General</h3>
                  <div className="grid-info-modal">
                    <div className="campo-info-modal">
                      <span className="label-info-modal">Fecha:</span>
                      <span className="valor-info-modal">
                        {new Date(cierreSeleccionado.fecha).toLocaleDateString('es-CO', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="campo-info-modal">
                      <span className="label-info-modal">Turno:</span>
                      <span className="valor-info-modal">{cierreSeleccionado.turno}</span>
                    </div>
                    <div className="campo-info-modal">
                      <span className="label-info-modal">Cajera:</span>
                      <span className="valor-info-modal">{cierreSeleccionado.cajera}</span>
                    </div>
                    <div className="campo-info-modal">
                      <span className="label-info-modal">Documento:</span>
                      <span className="valor-info-modal">{cierreSeleccionado.documento}</span>
                    </div>
                  </div>
                </div>

                {/* Resumen Financiero */}
                <div className="seccion-modal">
                  <h3 className="titulo-seccion-modal">Resumen Financiero</h3>
                  <div className="grid-resumen-modal">
                    <div className="campo-resumen">
                      <span className="label-resumen">Total Ventas:</span>
                      <span className="valor-ventas">{formatearMoneda(cierreSeleccionado.totalVentas)}</span>
                    </div>
                    <div className="campo-resumen">
                      <span className="label-resumen">Total Efectivo:</span>
                      <span className="valor-efectivo">{formatearMoneda(cierreSeleccionado.efectivoRegistrado)}</span>
                    </div>
                    <div className="campo-resumen">
                      <span className="label-resumen">Total Tarjetas:</span>
                      <span className="valor-tarjetas">{formatearMoneda(cierreSeleccionado.tarjetasRegistradas)}</span>
                    </div>
                    <div className="campo-resumen">
                      <span className="label-resumen">Diferencia:</span>
                      <span className={`valor-diferencia ${
                        cierreSeleccionado.diferenciaEfectivo === 0 && cierreSeleccionado.diferenciaTarjetas === 0 
                          ? 'sin-diferencia' 
                          : 'con-diferencia'
                      }`}>
                        {formatearMoneda(cierreSeleccionado.diferenciaEfectivo + cierreSeleccionado.diferenciaTarjetas)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Estado de Cuadre */}
                <div className="seccion-modal">
                  <h3 className="titulo-seccion-modal">Estado del Cuadre</h3>
                  <div className="grid-estado-cuadre">
                    <div className="tarjeta-estado">
                      <div className="estado-header">
                        <span className="estado-label">Tarjetas</span>
                        <span className={`estado-badge ${obtenerEstadoBadge(cierreSeleccionado.estadoTarjetas).clase}`}>
                          {obtenerEstadoBadge(cierreSeleccionado.estadoTarjetas).texto}
                        </span>
                      </div>
                      <div className="estado-monto">
                        <span className="estado-descripcion">
                          {cierreSeleccionado.estadoTarjetas === 'cuadrado' 
                            ? 'Sin diferencia' 
                            : cierreSeleccionado.estadoTarjetas === 'faltante'
                            ? 'Faltante'
                            : 'Sobrante'}
                        </span>
                        {cierreSeleccionado.diferenciaTarjetas !== 0 && (
                          <span className="estado-valor">
                            {formatearMoneda(Math.abs(cierreSeleccionado.diferenciaTarjetas))}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="tarjeta-estado">
                      <div className="estado-header">
                        <span className="estado-label">Efectivo</span>
                        <span className={`estado-badge ${obtenerEstadoBadge(cierreSeleccionado.estadoEfectivo).clase}`}>
                          {obtenerEstadoBadge(cierreSeleccionado.estadoEfectivo).texto}
                        </span>
                      </div>
                      <div className="estado-monto">
                        <span className="estado-descripcion">
                          {cierreSeleccionado.estadoEfectivo === 'cuadrado' 
                            ? 'Sin diferencia' 
                            : cierreSeleccionado.estadoEfectivo === 'faltante'
                            ? 'Faltante'
                            : 'Sobrante'}
                        </span>
                        {cierreSeleccionado.diferenciaEfectivo !== 0 && (
                          <span className="estado-valor">
                            {formatearMoneda(Math.abs(cierreSeleccionado.diferenciaEfectivo))}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Observaciones */}
                {cierreSeleccionado.observaciones && (
                  <div className="seccion-modal">
                    <h3 className="titulo-seccion-modal">Observaciones</h3>
                    <p className="texto-observaciones">{cierreSeleccionado.observaciones}</p>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button className="boton-modal-cerrar" onClick={cerrarModal}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CuadreCaja;
