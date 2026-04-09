// Definición de roles y permisos
export const ROLES = {
  ADMIN: 'admin',
  ANALISTA: 'analista',
  CAJERA: 'cajera',
};

// Permisos por rol
export const PERMISOS = {
  [ROLES.ADMIN]: ['leer', 'escribir', 'eliminar', 'gestionar_usuarios'],
  [ROLES.ANALISTA]: ['leer', 'analizar', 'reportes'],
  [ROLES.CAJERA]: ['leer', 'registrar_transacciones'],
};

// Verificar si un rol tiene un permiso específico
export const tienePermiso = (rol, permiso) => {
  return PERMISOS[rol]?.includes(permiso) || false;
};

export default ROLES;
