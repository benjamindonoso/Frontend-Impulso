import { useState, useEffect } from 'react';
const API_URL = 'https://backend-impulso-62td.onrender.com';

export default function PanelNuevoCliente({ isOpen, onClose, onClienteAgregado }) {
  const [tipoPlan, setTipoPlan] = useState('individual');
  const [esNuevaFamilia, setEsNuevaFamilia] = useState(false); // Para saber si creamos un grupo nuevo
  const [nombreNuevaFamilia, setNombreNuevaFamilia] = useState(''); // El nombre del grupo nuevo
  const [familias, setFamilias] = useState([]);
  
  const [formData, setFormData] = useState({
    rut: '',
    nombre: '',
    apellidoP: '',
    apellidoM: '',
    telefono: '',
    email: '',
    esTitular: true,
    familiaId: ''
  });

  const [mensaje, setMensaje] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Cargar familias existentes
  const cargarFamilias = () => {
    fetch(`${API_URL}/api/familias`)
      .then(res => res.json())
      .then(data => setFamilias(data))
      .catch(err => console.error("Error cargando familias:", err));
  };

  useEffect(() => {
    if (isOpen) cargarFamilias();
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if ((name === 'nombre' || name === 'apellidoP' || name === 'apellidoM') && /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/.test(value)) {
        return; 
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    
    try {
      let currentFamiliaId = formData.familiaId;

      // MAGIA: Si es un grupo nuevo, primero creamos la familia en la base de datos
      if (tipoPlan === 'familiar' && esNuevaFamilia) {
        const resFam = await fetch(`${API_URL}/api/familias`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre: nombreNuevaFamilia, activa: true })
        });
        
        if (!resFam.ok) throw new Error('Error al crear el nuevo grupo familiar');
        
        const nuevaFamiliaBD = await resFam.json();
        currentFamiliaId = nuevaFamiliaBD.id; // Tomamos el ID recién creado
      }

      // Ahora preparamos los datos del cliente
      const payload = {
        ...formData,
        // Si es individual O es el creador de una familia nueva, es Titular obligatorio
        esTitular: tipoPlan === 'individual' ? true : (esNuevaFamilia ? true : formData.esTitular),
        familiaId: tipoPlan === 'individual' ? null : Number(currentFamiliaId)
      };
      
      // Guardamos al cliente
      const response = await fetch(`${API_URL}/api/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setMensaje({ tipo: 'exito', texto: '¡Miembro integrado a Impulso!' });
        
        // Resetear todo
        setFormData({ rut: '', nombre: '', apellidoP: '', apellidoM: '', telefono: '', email: '', esTitular: true, familiaId: '' });
        setTipoPlan('individual');
        setEsNuevaFamilia(false);
        setNombreNuevaFamilia('');
        
        if (onClienteAgregado) onClienteAgregado();

        setTimeout(() => {
          setMensaje(null);
          setGuardando(false);
          onClose();
        }, 1500);
      } else {
        throw new Error('Error al registrar al cliente');
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.message || 'Error de conexión.' });
      setGuardando(false);
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 z-40 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="h-full flex flex-col">
          <div className="px-6 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Nuevo Ingreso</h2>
              <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider mt-1">Impulso GYM</p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            {mensaje && (
              <div className={`p-4 mb-6 rounded-xl text-sm font-medium flex items-center gap-2 ${mensaje.tipo === 'exito' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                {mensaje.texto}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* SELECTOR DE PLAN */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Modalidad de Plan</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => { setTipoPlan('individual'); setFormData({...formData, esTitular: true, familiaId: ''}); }} className={`py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${tipoPlan === 'individual' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200 scale-105' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'}`}>Individual</button>
                  <button type="button" onClick={() => { setTipoPlan('familiar'); setFormData({...formData, esTitular: false}); }} className={`py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${tipoPlan === 'familiar' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200 scale-105' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'}`}>Familiar</button>
                </div>

                {tipoPlan === 'familiar' && (
                  <div className="pt-4 mt-2 border-t border-slate-200 animate-fade-in space-y-4">
                    
                    {/* TOGGLE: Existente vs Nuevo */}
                    <div className="flex gap-2 p-1 bg-slate-200/50 rounded-lg">
                      <button type="button" onClick={() => setEsNuevaFamilia(false)} className={`flex-1 text-xs font-bold py-2 rounded-md transition-all ${!esNuevaFamilia ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Grupo Existente</button>
                      <button type="button" onClick={() => setEsNuevaFamilia(true)} className={`flex-1 text-xs font-bold py-2 rounded-md transition-all ${esNuevaFamilia ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Crear Nuevo</button>
                    </div>

                    {!esNuevaFamilia ? (
                      // Unir a familia existente
                      <div className="space-y-4">
                        <select name="familiaId" value={formData.familiaId} onChange={handleChange} required className="w-full rounded-lg border-slate-200 px-4 py-2.5 bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-slate-800 font-medium">
                          <option value="">-- Elige un grupo familiar --</option>
                          {familias.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                        </select>
                        <label className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors">
                          <input type="checkbox" name="esTitular" checked={formData.esTitular} onChange={(e) => setFormData({...formData, esTitular: e.target.checked})} className="w-5 h-5 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"/>
                          <span className="text-sm text-slate-700 font-bold">Es el Titular de la familia</span>
                        </label>
                      </div>
                    ) : (
                      // Crear nueva familia
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Nombre del Nuevo Grupo</label>
                        <input type="text" value={nombreNuevaFamilia} onChange={(e) => setNombreNuevaFamilia(e.target.value)} required className="w-full rounded-lg border-slate-200 px-4 py-2.5 bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-slate-800 font-medium" placeholder="Ej: Baginsky" />
                        <p className="text-[11px] text-emerald-600 font-medium bg-emerald-50 p-2 rounded-md">Este alumno será registrado automáticamente como el Titular del grupo.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">RUT del Alumno</label>
                <input type="text" name="rut" value={formData.rut} onChange={handleChange} required className="w-full rounded-lg border-slate-200 px-4 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-slate-800 font-medium" placeholder="Ej: 12345678-9" />
                <p className="text-[11px] text-slate-400 mt-1.5 leading-tight">Los últimos 4 dígitos antes del guion serán su PIN en el Kiosco.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Nombre</label>
                  <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="w-full rounded-lg border-slate-200 px-4 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-slate-800" placeholder="Ej. Benjamín" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Ap. Paterno</label>
                  <input type="text" name="apellidoP" value={formData.apellidoP} onChange={handleChange} required className="w-full rounded-lg border-slate-200 px-4 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-slate-800" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Ap. Materno</label>
                <input type="text" name="apellidoM" value={formData.apellidoM} onChange={handleChange} className="w-full rounded-lg border-slate-200 px-4 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-slate-800" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Correo Electrónico</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full rounded-lg border-slate-200 px-4 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-slate-800" placeholder="impulso@ejemplo.com" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Teléfono / WhatsApp</label>
                <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} required className="w-full rounded-lg border-slate-200 px-4 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-slate-800" placeholder="+569..." />
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 pb-8">
                <button type="submit" disabled={guardando} className="w-full bg-slate-900 text-white font-bold tracking-wide py-3.5 px-4 rounded-xl hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed">
                  {guardando ? 'REGISTRANDO...' : 'CONFIRMAR INGRESO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}