import { useEffect, useState } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import PanelNuevoCliente from '../components/PanelNuevoCliente';
import PanelRutina from '../components/PanelRutina';
import '../styles/App.css';
import logoImpulso from '../assets/logo-impulso.png';
import PanelNuevoAdmin from '../components/PanelNuevoAdmin'; 
import GestionClientes from '../components/GestionClientes'; 
import CentroRutinas from '../components/CentroRutinas';
import GestionFamilias from '../components/GestionFamilias';
const API_URL = 'https://backend-impulso-62td.onrender.com';
import logoImpulso from '../assets/logo-impulso.jpg';

export default function Dashboard() {
  const navigate = useNavigate(); 
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [panelRutinaAbierto, setPanelRutinaAbierto] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [panelAdminAbierto, setPanelAdminAbierto] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      obtenerClientes();
    }
  }, [navigate]);

  const obtenerClientes = async () => {
    try {
      const respuesta = await fetch(`${API_URL}/api/clientes`);
      if (!respuesta.ok) throw new Error('Error en la red');
      const datos = await respuesta.json();
      setClientes(datos);
    } catch (error) {
      console.error("Error al obtener los clientes:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleBorrarCliente = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar a este miembro? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/api/clientes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });

      if (res.ok) {
        obtenerClientes(); 
      } else {
        alert('Error al eliminar el cliente. Verifica los permisos.');
      }
    } catch (error) {
      console.error('Error al borrar:', error);
      alert('Error de conexión con el servidor.');
    }
  };

  const abrirPanelRutina = (cliente) => {
    setClienteSeleccionado(cliente);
    setPanelRutinaAbierto(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      {/* HEADER CORPORATIVO */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImpulso} alt="Logo Impulso" className="w-12 h-12 object-contain" />
            <div className="flex flex-col justify-center">
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">IMPULSO</h1>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mt-1">Salud & Movimiento</span>
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                navigate('/login');
              }}
              className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1 rounded-lg"
              >
              CERRAR SESIÓN
              </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Nuestra Comunidad</h2>
            <p className="text-slate-500 mt-2 text-sm">Gestiona los miembros activos y sus planes de entrenamiento.</p>
          </div>
          <button onClick={() => navigate('/admin/auditoria')} className="flex items-center gap-2 bg-slate-800 text-white px-2 py-0.5 rounded-lg font-semibold hover:bg-slate-900 transition-all shadow-md shadow-slate-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            Auditoría
          </button>
          <button onClick={() => navigate('/admin/gestion-familias')} className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-all shadow-md shadow-green-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857" /></svg>
            Gestión de Familias
          </button>
          <button onClick={() => navigate('/admin/gestion-clientes')} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v1a3 3 0 106 0v-1m-6 0a3 3 0 006 0M9 17h6M9 12h6M9 7h6M4 4h16v16H4V4z"/></svg>
            Gestión de Clientes
          </button>
          <button onClick={() => navigate('/admin/rutinas')} className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition-all shadow-md shadow-purple-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            Centro de Rutinas
          </button>
          <button onClick={() => setPanelAbierto(true)} className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-emerald-600 transition-all shadow-md shadow-emerald-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 22 22"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            Nuevo Miembro
          </button>
          <button onClick={() => setPanelAdminAbierto(true)} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-slate-800 transition-all shadow-md shadow-slate-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 22 22"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            Nuevo Admin
          </button>
          <PanelNuevoAdmin isOpen={panelAdminAbierto} onClose={() => setPanelAdminAbierto(false)} /> 
        </div>

        {/* Tabla Estilizada */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {cargando ? (
            <div className="p-12 text-center text-slate-400">Cargando energía...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                    <th className="p-5">Miembro</th>
                    <th className="p-5">RUT</th>
                    <th className="p-5">Contacto</th>
                    <th className="p-5">Teléfono</th>
                    <th className="p-5 text-center">Estado</th>
                    <th className="p-5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clientes.map((cliente) => (
                    <tr key={cliente.id} className="hover:bg-emerald-50/30 transition-colors group">
                      <td className="p-5 font-bold text-slate-800"> {cliente.nombre} {cliente.apellidoP}</td>
                      <td className="p-5 text-sm text-slate-500">{cliente.rut}</td>
                      <td className="p-5 text-sm text-slate-500">{cliente.email}</td>
                      <td className="p-5 text-sm text-slate-500">{cliente.telefono}</td>
                      <td className="p-5 text-center"><span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">Activo</span></td>
                      <td className="p-5 text-right">
                        <div className="flex justify-end gap-1">
                          {/* BOTÓN EDITAR (Lápiz) */}
                          <button 
                            onClick={() => navigate('/admin/gestion-clientes')}
                            title="Editar Datos" 
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            ✏️
                          </button>
          
                          {/* BOTÓN BORRAR (Basurero) */}
                          <button 
                            onClick={() => handleBorrarCliente(cliente.id)}
                            title="Borrar Miembro" 
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >   
                            🗑️
                          </button>
          
                          {/* BOTÓN RUTINA (Task) */}
                          <button 
                            onClick={() => abrirPanelRutina(cliente)} 
                            title="Ver Rutina" 
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            📋
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <PanelNuevoCliente isOpen={panelAbierto} onClose={() => setPanelAbierto(false)} onClienteAgregado={obtenerClientes} />
      <PanelRutina isOpen={panelRutinaAbierto} onClose={() => setPanelRutinaAbierto(false)} cliente={clienteSeleccionado} />
      <PanelNuevoAdmin isOpen={panelAdminAbierto} onClose={() => setPanelAdminAbierto(false)} />
    </div>
  );
}