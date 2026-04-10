import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import serviciosAutenticacion from '../../api/autenticacion';
import './CuadreCaja.css';

const CuadreCaja = () => {
  const [usuario, setUsuario] = useState(null);
  const [turnoActual, setTurnoActual] = useState('mañana');
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
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
    }
  }, [navigate]);

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
              CC · {usuario.documento} | Código: {usuario.codigo}
            </div>
          </div>
        </div>
        <button className="boton-cerrar-sesion" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </header>

      <main className="contenido-cajera">
        {/* Información del Punto de Venta */}
        <section className="seccion-pdv-cajera">
          <div className="info-pdv-actual">
            <div className="icono-pdv">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="label-pdv">PUNTO DE VENTA</div>
              <div className="nombre-pdv">{usuario.pdv}</div>
            </div>
            <div className="badge-turno" style={{ backgroundColor: obtenerColorTurno() }}>
              Turno {turnoActual}
            </div>
          </div>
        </section>

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

       
      </main>
    </div>
  );
};

export default CuadreCaja;
