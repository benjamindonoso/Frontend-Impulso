import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const API_URL = 'https://backend-impulso-62td.onrender.com';

export default function GestionFamilias() {
  const navigate = useNavigate();
  const [familias, setFamilias] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [familiaId, setFamiliaId] = useState(null);
  
  const [formData, setFormData] = useState({ nombre: '', plan: 'Básico' });
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarFamilias();
  }, []);

  const cargarFamilias = () => {
    fetch(`${API_URL}/api/familias`)
      .then(res => res.json())
      .then(data => setFamilias(data))
      .catch(err => console.error("Error al cargar familias:", err));
  };

  const abrirModalCrear = () => {
    setModoEdicion(false);
    setFormData({ nombre: '', plan: 'Básico' });
    setModalAbierto(true);
  };

  const abrirModalEditar = (familia) => {
    setModoEdicion(true);
    setFamiliaId(familia.id);
    setFormData({ nombre: familia.nombre, plan: familia.plan || 'Básico' });
    setModalAbierto(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);

    const url = modoEdicion ? `${API_URL}/api/familias/${familiaId}` : `${API_URL}/api/familias`;
    const metodo = modoEdicion ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Por si tu auth lo requiere
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setModalAbierto(false);
        cargarFamilias();
      } else {
        alert("Error al guardar la familia");
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Estás seguro de eliminar esta familia? Sus integrantes pasarán a ser individuales automáticamente.")) return;
    
    try {
      const res = await fetch(`${API_URL}/api/familias/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (res.ok) {
        cargarFamilias();
      } else {
        alert("Error al eliminar la familia");
      }
    } catch (error) {
      alert("Error de conexión");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/admin/dashboard')} className="text-slate-400 hover:text-slate-900 font-bold">← Volver</button>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2"><span>👨‍👩‍👧‍👦</span> Gestión de Familias</h1>
        </div>
        <button onClick={abrirModalCrear} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-md">
          + Nueva Familia
        </button>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {familias.map((familia) => (
            <div key={familia.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-black text-xl text-slate-800">{familia.nombre}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-md">
                    {familia.plan || 'Básico'}
                  </span>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Integrantes ({familia.integrantes?.length || 0})</h4>
                  <div className="space-y-1">
                    {familia.integrantes?.map(int => (
                      <p key={int.id} className="text-sm font-medium text-slate-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        {int.nombre} {int.apellidoP} {int.esTitular ? '(Titular)' : ''}
                      </p>
                    ))}
                    {(!familia.integrantes || familia.integrantes.length === 0) && (
                      <p className="text-sm text-slate-400 italic">No hay miembros registrados</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                <button onClick={() => abrirModalEditar(familia)} className="flex-1 bg-slate-50 text-slate-600 font-bold py-2 rounded-xl hover:bg-slate-100 border border-slate-200 transition-all text-sm">
                  Editar
                </button>
                <button onClick={() => handleEliminar(familia.id)} className="flex-1 bg-red-50 text-red-600 font-bold py-2 rounded-xl hover:bg-red-100 border border-red-100 transition-all text-sm">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* MODAL CREAR / EDITAR */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900">{modoEdicion ? 'Editar Familia' : 'Nueva Familia'}</h3>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nombre de la Familia</label>
                <input 
                  type="text" required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} 
                  placeholder="Ej: Familia Pérez"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tipo de Plan</label>
                <select 
                  value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                >
                  <option value="Básico">Básico</option>
                  <option value="Premium">Premium</option>
                  <option value="Familiar Completo">Familiar Completo</option>
                </select>
              </div>
              
              <button type="submit" disabled={cargando} className="w-full bg-emerald-600 text-white font-bold py-3.5 mt-4 rounded-xl hover:bg-emerald-700 shadow-md disabled:opacity-50 transition-all">
                {cargando ? 'Guardando...' : 'Guardar Familia'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}