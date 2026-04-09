import { createContext, useState, useEffect } from 'react';
import serviciosAutenticacion from '../api/autenticacion';

export const ContextoAutenticacion = createContext();

export const ProveedorAutenticacion = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [estaAutenticado, setEstaAutenticado] = useState(false);

  useEffect(() => {
    verificarAutenticacion();
  }, []);

  const verificarAutenticacion = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const datosUsuario = await serviciosAutenticacion.obtenerUsuarioActual();
        setUsuario(datosUsuario);
        setEstaAutenticado(true);
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        localStorage.removeItem('token');
      }
    }
    setCargando(false);
  };

  const iniciarSesion = async (credenciales) => {
    try {
      const respuesta = await serviciosAutenticacion.iniciarSesion(credenciales);
      setUsuario(respuesta.usuario);
      setEstaAutenticado(true);
      return respuesta;
    } catch (error) {
      throw error;
    }
  };

  const cerrarSesion = async () => {
    try {
      await serviciosAutenticacion.cerrarSesion();
      setUsuario(null);
      setEstaAutenticado(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const valor = {
    usuario,
    estaAutenticado,
    cargando,
    iniciarSesion,
    cerrarSesion
  };

  return (
    <ContextoAutenticacion.Provider value={valor}>
      {children}
    </ContextoAutenticacion.Provider>
  );
};

export default ContextoAutenticacion;
