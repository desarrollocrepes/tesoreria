import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import serviciosAutenticacion from '../../api/autenticacion';
import './Reportes.css';

const Reportes = () => {
  const [usuario, setUsuario] = useState(null);
  const [puntosVenta, setPuntosVenta] = useState([]);
  const [pdvSeleccionado, setPdvSeleccionado] = useState('');
  const [cargandoPdvs, setCargandoPdvs] = useState(false);
  const [resumenDia, setResumenDia] = useState({
    ventasTotales: 4280000,
    ventasPorcentaje: 8.3,
    cierresRealizados: 3,
    cierresTotales: 5,
    cierresPendientes: 2,
    diferenciaCaja: -12000,
    turnoRevisar: 3
  });
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

  const manejarCambioPdv = (evento) => {
    setPdvSeleccionado(evento.target.value);
  };

  const cerrarSesion = () => {
    serviciosAutenticacion.cerrarSesion();
    navigate('/login');
  };

  const formatearMoneda = (valor) => {
    const absValor = Math.abs(valor);
    if (absValor >= 1000000) {
      return `${valor < 0 ? '-' : ''}$${(absValor / 1000).toFixed(0)}K`;
    }
    return `${valor < 0 ? '-' : ''}$${absValor.toLocaleString('es-CO')}`;
  };

  const obtenerIniciales = (nombre) => {
    if (!nombre) return 'A';
    const palabras = nombre.split(' ');
    return palabras[0][0].toUpperCase();
  };

  if (!usuario) {
    return <div>Cargando...</div>;
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


        {/* Módulos */}
        <section className="seccion-modulos">
          <h2 className="titulo-seccion">MÓDULOS</h2>
          <div className="tarjetas-modulos">
            <div className="tarjeta-modulo">
              <div className="icono-modulo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="contenido-modulo">
                <h3 className="titulo-modulo">Reportes</h3>
                <p className="descripcion-modulo">
                  Accede y descarga los reportes de cierre de caja por turno y fecha.
                </p>
                <div className="acciones-modulo">
                  <button className="boton-accion">Cierre diario</button>
                  <button className="boton-accion">Histórico</button>
                  <button className="boton-accion">Exportar</button>
                </div>
              </div>
              <div className="flecha-modulo">→</div>
            </div>

            <div className="tarjeta-modulo">
              <div className="icono-modulo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="contenido-modulo">
                <h3 className="titulo-modulo">Análisis</h3>
                <p className="descripcion-modulo">
                  Visualiza tendencias y análisis detallados de ventas por producto y turno.
                </p>
                <div className="acciones-modulo">
                  <button className="boton-accion">Por producto</button>
                  <button className="boton-accion">Semanal</button>
                  <button className="boton-accion">Indicadores</button>
                </div>
              </div>
              <div className="flecha-modulo">→</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Reportes;