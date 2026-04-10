import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import InicioSesion from './paginas/autenticacion/InicioSesion';
import Reportes from './paginas/analista/Reportes';
import CuadreCaja from './paginas/cajera/CuadreCaja';
import CierreCaja from './paginas/cajera/CierreCaja';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<InicioSesion />} />
        <Route path="/analista" element={<Reportes />} />
        <Route path="/cajera" element={<CuadreCaja />} />
        <Route path="/cierre-caja" element={<CierreCaja />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;