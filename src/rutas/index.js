import { createBrowserRouter } from 'react-router-dom';
import DiseñoPanel from '../diseños/DiseñoPanel';
import DiseñoAdmin from '../diseños/DiseñoAdmin';

// Importar páginas aquí
// import Inicio from '../paginas/Inicio';

export const enrutador = createBrowserRouter([
  {
    path: '/',
    element: <DiseñoPanel />,
    children: [
      // Rutas del panel principal
    ],
  },
  {
    path: '/admin',
    element: <DiseñoAdmin />,
    children: [
      // Rutas de administrador
    ],
  },
]);

export default enrutador;
