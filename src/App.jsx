import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PortalAlumno from './views/PortalAlumno';
import LoginAdmin from './views/LoginAdmin';
import Dashboard from './views/Dashboard';
import GestionClientes from './components/GestionClientes'; 
import CentroRutinas from './components/CentroRutinas';
import Auditoria from './components/Auditoria';
import GestionFamilias from './components/GestionFamilias';
import SugerenciaInstalacion from './components/SugerenciaInstalacion';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTA PÚBLICA (El kiosco que se abre con el QR) */}
        <Route path="/" element={<PortalAlumno />} />

        {/* RUTAS PRIVADAS (Para los administradores de Impulso) */}
        <Route path="/admin" element={<LoginAdmin />} />

        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/gestion-clientes" element={<GestionClientes />} />
        <Route path="/admin/centro-rutinas" element={<CentroRutinas />} />
        <Route path="/admin/auditoria" element={<Auditoria />} />
        <Route path="/admin/gestion-familias" element={<GestionFamilias />} />

        {/* Si alguien escribe algo raro, lo devuelve al inicio */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}