import { Navigate } from 'react-router-dom';
// import { useAutenticacion } from '../../hooks/useAutenticacion';

const RutaProtegida = ({ children, rolesPermitidos = [] }) => {
  
  const estaAutenticado = false; // Cambiar con lógica real
  const usuario = null;

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(usuario?.rol)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return children;
};

export default RutaProtegida;
