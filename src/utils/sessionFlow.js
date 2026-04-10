// Utilidades para manejo de sesión

export const getSession = () => {
  const usuario = localStorage.getItem('usuario');
  if (!usuario) return null;
  
  try {
    const datosUsuario = JSON.parse(usuario);
    return {
      datosEmpleado: datosUsuario,
      token: localStorage.getItem('token')
    };
  } catch (error) {
    console.error('Error al parsear datos de sesión:', error);
    return null;
  }
};

export const setSession = (usuario, token = 'authenticated') => {
  localStorage.setItem('usuario', JSON.stringify(usuario));
  localStorage.setItem('token', token);
};

export const clearSession = () => {
  localStorage.removeItem('usuario');
  localStorage.removeItem('token');
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const usuario = localStorage.getItem('usuario');
  return !!(token && usuario);
};
