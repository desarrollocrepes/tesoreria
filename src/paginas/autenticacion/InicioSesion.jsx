import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import serviciosAutenticacion from '../../api/autenticacion';
import './InicioSesion.css';

const InicioSesion = () => {
  const [documento, setDocumento] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const manejarCambio = (e) => {
    setDocumento(e.target.value);
    setError(''); // Limpiar error al escribir
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    
    if (!documento.trim()) {
      setError('Por favor ingresa tu número de documento');
      return;
    }

    setCargando(true);
    setError('');

    try {
      // Primero intentar como analista
      let resultado = await serviciosAutenticacion.validarAnalista(documento);
      
      if (resultado.exito) {
        // Guardar usuario en localStorage
        localStorage.setItem('usuario', JSON.stringify(resultado.usuario));
        localStorage.setItem('token', 'authenticated');
        
        // Redirigir al módulo de analista
        navigate('/analista');
        return;
      }
      
      // Si no es analista, intentar como cajera
      resultado = await serviciosAutenticacion.validarCajera(documento);
      
      if (resultado.exito) {
        // Guardar usuario en localStorage
        localStorage.setItem('usuario', JSON.stringify(resultado.usuario));
        localStorage.setItem('token', 'authenticated');
        
        // Redirigir al módulo de cajera
        navigate('/cajera');
        return;
      }
      
      // Si no es ni analista ni cajera
      setError('Documento no encontrado o sin permisos de acceso');
      
    } catch (err) {
      setError(err.mensaje || 'Error al validar el documento. Intenta nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="contenedor-login">
      <div className="tarjeta-login">
        <h1 className="titulo-login">CIERRE DE CAJA C&W</h1>
        
        <form onSubmit={manejarEnvio} className="formulario-login">
          <label htmlFor="documento" className="etiqueta-login">
            NÚMERO DE DOCUMENTO
          </label>
          
          <input
            type="text"
            id="documento"
            name="documento"
            value={documento}
            onChange={manejarCambio}
            placeholder="Ingresa tu documento"
            className="input-login"
            disabled={cargando}
            autoFocus
          />

          {error && (
            <div className="mensaje-error">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="boton-login"
            disabled={cargando}
          >
            {cargando ? 'VALIDANDO...' : 'INGRESAR'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InicioSesion;
