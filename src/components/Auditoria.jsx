import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const API_URL = 'https://backend-impulso-62td.onrender.com';

export default function Auditoria() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarAuditoria();
  }, []);

  const cargarAuditoria = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/auditoria`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      } else {
        alert("Error al cargar los registros de auditoría");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    } finally {
      setCargando(false);
    }
  };

  // Función para mostrar la fecha y hora de forma bonita
  const formatearFecha = (fechaISO) => {
    const opciones = { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    };
    return new Date(fechaISO).toLocaleDateString('es-CL', opciones);
  };

  // Estilos visuales para el tipo de acción (puedes agregar "CREAR" o "EDITAR" a futuro)
  const renderBadgeAccion = (accion) => {
    if (accion === 'ELIMINAR') {
      return <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full text-xs">ELIMINAR</span>;
    }
    return <span className="bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-full text-xs">{accion}</span>;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Cabecera Principal */}
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <button onClick={() => navigate('/admin/dashboard')} className="text-sm font-bold text-slate-400 hover:text-slate-900 mb-2 flex items-center gap-2">
              ← Volver al Dashboard
            </button>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <span>🛡️</span> Registro de Auditoría
            </h1>
            <p className="text-sm text-slate-500 mt-1">Monitoreo de acciones críticas del sistema.</p>
          </div>
          <button onClick={cargarAuditoria} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg font-bold hover:bg-slate-200 transition-colors">
            ↻ Actualizar
          </button>
        </div>

        {/* Tabla de Registros */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {cargando ? (
            <div className="p-12 text-center text-slate-400 font-bold">Cargando registros...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                  <th className="p-4 pl-6">Fecha y Hora</th>
                  <th className="p-4">Administrador</th>
                  <th className="p-4 text-center">Acción</th>
                  <th className="p-4 text-center">Entidad Afectada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-400 text-sm">
                      No hay registros de auditoría aún.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6 text-sm font-medium text-slate-600">
                        {formatearFecha(log.createdAt)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                            {log.admin.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{log.admin.nombre}</p>
                            <p className="text-xs text-slate-400">{log.admin.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {renderBadgeAccion(log.accion)}
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-sm font-bold text-slate-600">
                          {log.entidad}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}