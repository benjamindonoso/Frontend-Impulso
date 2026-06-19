import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const API_URL = 'https://backend-impulso-62td.onrender.com';

export default function GestionClientes() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [familias, setFamilias] = useState([]); // <-- NUEVO ESTADO PARA FAMILIAS
  const [guardando, setGuardando] = useState(false);
  const [cambiosPendientes, setCambiosPendientes] = useState(false);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [creando, setCreando] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    rut: '', nombre: '', apellidoP: '', apellidoM: '', 
    codigoQr: '', telefono: '', email: '', fechaNacimiento: '', 
    activo: true, esTitular: false, familiaId: '' // <-- AÑADIDO AQUI
  });

  useEffect(() => {
    cargarClientes();
    cargarFamilias(); // <-- CARGAMOS LAS FAMILIAS AL INICIAR
  }, []);

  const cargarClientes = () => {
    fetch(`${API_URL}/api/clientes`)
      .then(res => res.json())
      .then(data => setClientes(data));
  };

  const cargarFamilias = () => {
    fetch(`${API_URL}/api/familias`)
      .then(res => res.json())
      .then(data => setFamilias(data));
  };

  const handleChange = (id, campo, valor) => {
    const nuevosClientes = clientes.map(cliente => {
      if (cliente.id === id) {
        return { ...cliente, [campo]: valor };
      }
      return cliente;
    });
    setClientes(nuevosClientes);
    setCambiosPendientes(true);
  };

  const guardarCambiosMasivos = async () => {
    setGuardando(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/api/clientes/bulk`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ clientesActualizados: clientes })
      });

      if (res.ok) {
        alert('¡Todos los cambios han sido guardados!');
        setCambiosPendientes(false);
        cargarClientes();
      } else {
        alert('Hubo un error al guardar los cambios.');
      }
    } catch (error) {
      alert('Error de conexión.');
    } finally {
      setGuardando(false);
    }
  };

  const handleCrearCliente = async (e) => {
    e.preventDefault();
    setCreando(true);
    
    const payload = { ...nuevoCliente };
    if (payload.fechaNacimiento) payload.fechaNacimiento = new Date(payload.fechaNacimiento).toISOString();
    else delete payload.fechaNacimiento;

    // Procesar el ID de la familia (si está vacío, se envía null)
    payload.familiaId = payload.familiaId ? Number(payload.familiaId) : null;

    try {
      const res = await fetch(`${API_URL}/api/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Cliente agregado exitosamente');
        setModalAbierto(false);
        setNuevoCliente({ rut: '', nombre: '', apellidoP: '', apellidoM: '', codigoQr: '', telefono: '', email: '', fechaNacimiento: '', activo: true, esTitular: false, familiaId: '' });
        cargarClientes();
      } else {
        const errorData = await res.json();
        alert('Error: ' + (errorData.error || 'No se pudo crear el cliente'));
      }
    } catch (error) {
      alert('Error de conexión al crear');
    } finally {
      setCreando(false);
    }
  };

  const handleBorrarCliente = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este cliente? Se borrarán también sus rutinas. Esta acción no se puede deshacer.')) return;
    try {
      const res = await fetch(`${API_URL}/api/clientes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) cargarClientes();
      else alert('Error al eliminar el cliente. Verifica los permisos.');
    } catch (error) {
      alert('Error de conexión al intentar borrar.');
    }
  };

  const formatearFechaParaInput = (fechaISO) => {
    if (!fechaISO) return '';
    return fechaISO.split('T')[0];
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 relative">
      
      {/* MODAL NUEVO CLIENTE */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
              <h3 className="text-xl font-bold text-slate-900">Agregar Nuevo Miembro</h3>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleCrearCliente} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nombre *</label><input type="text" required value={nuevoCliente.nombre} onChange={e => setNuevoCliente({...nuevoCliente, nombre: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 focus:bg-white transition-all"/></div>
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">RUT</label><input type="text" value={nuevoCliente.rut} onChange={e => setNuevoCliente({...nuevoCliente, rut: e.target.value})} placeholder="Ej: 12345678-9" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 focus:bg-white transition-all"/></div>
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Apellido Paterno *</label><input type="text" required value={nuevoCliente.apellidoP} onChange={e => setNuevoCliente({...nuevoCliente, apellidoP: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 focus:bg-white transition-all"/></div>
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Apellido Materno *</label><input type="text" required value={nuevoCliente.apellidoM} onChange={e => setNuevoCliente({...nuevoCliente, apellidoM: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 focus:bg-white transition-all"/></div>
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email</label><input type="email" value={nuevoCliente.email} onChange={e => setNuevoCliente({...nuevoCliente, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 focus:bg-white transition-all"/></div>
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Teléfono</label><input type="text" value={nuevoCliente.telefono} onChange={e => setNuevoCliente({...nuevoCliente, telefono: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 focus:bg-white transition-all"/></div>
                
                {/* NUEVO: SELECTOR DE FAMILIA EN EL MODAL */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Familia (Opcional)</label>
                  <select value={nuevoCliente.familiaId} onChange={e => setNuevoCliente({...nuevoCliente, familiaId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 focus:bg-white transition-all">
                    <option value="">Ninguna (Plan Individual)</option>
                    {familias.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                  </select>
                </div>

                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Fecha de Nacimiento</label><input type="date" value={nuevoCliente.fechaNacimiento} onChange={e => setNuevoCliente({...nuevoCliente, fechaNacimiento: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 focus:bg-white transition-all"/></div>
              </div>

              <div className="flex gap-6 mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={nuevoCliente.activo} onChange={e => setNuevoCliente({...nuevoCliente, activo: e.target.checked})} className="w-5 h-5 accent-emerald-500 rounded"/>
                  <span className="text-sm font-bold text-slate-700">Miembro Activo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={nuevoCliente.esTitular} onChange={e => setNuevoCliente({...nuevoCliente, esTitular: e.target.checked})} className="w-5 h-5 accent-emerald-500 rounded"/>
                  <span className="text-sm font-bold text-slate-700">Es Titular de Familia</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button type="submit" disabled={creando} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-50 shadow-md">
                  {creando ? 'GUARDANDO...' : 'REGISTRAR CLIENTE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <button onClick={() => navigate('/admin/dashboard')} className="text-sm font-bold text-slate-400 hover:text-slate-900 mb-2 flex items-center gap-2">← Volver al Dashboard</button>
            <h1 className="text-2xl font-black text-slate-900">CRM de Clientes</h1>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setModalAbierto(true)} className="px-6 py-3 rounded-xl font-bold transition-all shadow-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200">+ Añadir Cliente</button>
            <button onClick={guardarCambiosMasivos} disabled={!cambiosPendientes || guardando} className={`px-8 py-3 rounded-xl font-bold transition-all shadow-md ${cambiosPendientes ? 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-0.5' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
              {guardando ? 'Guardando...' : '💾 Guardar Tabla'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1300px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-500">
                <th className="p-4 text-center">ID</th>
                <th className="p-4 min-w-[120px]">RUT</th>
                <th className="p-4 min-w-[150px]">Nombre</th>
                <th className="p-4 min-w-[150px]">A. Paterno</th>
                <th className="p-4 min-w-[150px]">A. Materno</th>
                <th className="p-4 min-w-[150px]">Familia</th> {/* NUEVA COLUMNA */}
                <th className="p-4 min-w-[150px]">Email</th>
                <th className="p-4 min-w-[120px]">Teléfono</th>
                <th className="p-4 min-w-[80px] text-center">Titular</th>
                <th className="p-4 min-w-[80px] text-center">Activo</th>
                <th className="p-4 min-w-[80px] text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-blue-50/30 transition-colors focus-within:bg-blue-50">
                  <td className="p-4 text-center text-sm font-bold text-slate-400">{cliente.id}</td>
                  <td className="p-2"><input type="text" value={cliente.rut || ''} onChange={(e) => handleChange(cliente.id, 'rut', e.target.value)} className="w-full px-3 py-2 bg-transparent focus:bg-white border border-transparent focus:border-blue-300 rounded-lg outline-none text-sm"/></td>
                  <td className="p-2"><input type="text" value={cliente.nombre || ''} onChange={(e) => handleChange(cliente.id, 'nombre', e.target.value)} className="w-full px-3 py-2 bg-transparent focus:bg-white border border-transparent focus:border-blue-300 rounded-lg outline-none text-sm font-semibold"/></td>
                  <td className="p-2"><input type="text" value={cliente.apellidoP || ''} onChange={(e) => handleChange(cliente.id, 'apellidoP', e.target.value)} className="w-full px-3 py-2 bg-transparent focus:bg-white border border-transparent focus:border-blue-300 rounded-lg outline-none text-sm"/></td>
                  <td className="p-2"><input type="text" value={cliente.apellidoM || ''} onChange={(e) => handleChange(cliente.id, 'apellidoM', e.target.value)} className="w-full px-3 py-2 bg-transparent focus:bg-white border border-transparent focus:border-blue-300 rounded-lg outline-none text-sm"/></td>
                  
                  {/* SELECTOR DE FAMILIA EN LA TABLA */}
                  <td className="p-2">
                    <select value={cliente.familiaId || ''} onChange={(e) => handleChange(cliente.id, 'familiaId', e.target.value ? Number(e.target.value) : null)} className="w-full px-3 py-2 bg-transparent focus:bg-white border border-transparent focus:border-blue-300 rounded-lg outline-none text-sm text-slate-600">
                      <option value="">(Individual)</option>
                      {familias.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                    </select>
                  </td>

                  <td className="p-2"><input type="text" value={cliente.email || ''} onChange={(e) => handleChange(cliente.id, 'email', e.target.value)} className="w-full px-3 py-2 bg-transparent focus:bg-white border border-transparent focus:border-blue-300 rounded-lg outline-none text-sm"/></td>
                  <td className="p-2"><input type="text" value={cliente.telefono || ''} onChange={(e) => handleChange(cliente.id, 'telefono', e.target.value)} className="w-full px-3 py-2 bg-transparent focus:bg-white border border-transparent focus:border-blue-300 rounded-lg outline-none text-sm"/></td>
                  <td className="p-2 text-center"><input type="checkbox" checked={cliente.esTitular} onChange={(e) => handleChange(cliente.id, 'esTitular', e.target.checked)} className="w-5 h-5 accent-blue-500 cursor-pointer rounded"/></td>
                  <td className="p-2 text-center"><input type="checkbox" checked={cliente.activo} onChange={(e) => handleChange(cliente.id, 'activo', e.target.checked)} className="w-5 h-5 accent-emerald-500 cursor-pointer rounded"/></td>
                  <td className="p-2 text-center">
                    <button onClick={() => handleBorrarCliente(cliente.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}