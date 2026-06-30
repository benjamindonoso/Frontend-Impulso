import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const API_URL = 'https://backend-impulso-62td.onrender.com';

export default function CentroRutinas() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  
  // Estados para la gestión de rutinas del cliente
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [rutinasExistentes, setRutinasExistentes] = useState([]);
  const [rutinaEditandoId, setRutinaEditandoId] = useState(null); // null = nueva rutina, número = editando existente

  // Estados del lienzo de trabajo
  const [rutina, setRutina] = useState({ nombre: '', diaSemana: 'Lunes', descripcion: '' });
  const [ejerciciosSeleccionados, setEjerciciosSeleccionados] = useState([]);
  const [guardando, setGuardando] = useState(false);

  // Estados para el catálogo de ejercicios
  const [modalEjercicioAbierto, setModalEjercicioAbierto] = useState(false);
  const [modoEdicionCatalogo, setModoEdicionCatalogo] = useState(false);
  const [ejercicioEditandoId, setEjercicioEditandoId] = useState(null);
  const [nuevoEjercicio, setNuevoEjercicio] = useState({ nombre: '', descripcion: '', videoUrl: '' });
  const [guardandoEjercicio, setGuardandoEjercicio] = useState(false);

  const [busquedaCatalogo, setBusquedaCatalogo] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/clientes`)
      .then(res => res.json())
      .then(data => setClientes(data.filter(c => c.activo)));

    cargarCatalogo();
  }, []);

  // Cargar las rutinas del cliente cuando cambia la selección
  useEffect(() => {
    if (clienteSeleccionado) {
      cargarRutinasDelCliente(clienteSeleccionado);
      limpiarLienzo();
    } else {
      setRutinasExistentes([]);
      limpiarLienzo();
    }
  }, [clienteSeleccionado]);

  const cargarCatalogo = () => {
    fetch(`${API_URL}/api/ejercicios`)
      .then(res => res.json())
      .then(data => setCatalogo(data));
  };

  const cargarRutinasDelCliente = (clienteId) => {
    fetch(`${API_URL}/api/rutinas/cliente/${clienteId}`)
      .then(res => res.json())
      .then(data => setRutinasExistentes(data))
      .catch(err => console.error("Error al obtener rutinas:", err));
  };

  const limpiarLienzo = () => {
    setRutina({ nombre: '', diaSemana: 'Lunes', descripcion: '' });
    setEjerciciosSeleccionados([]);
    setRutinaEditandoId(null);
  };

  // --- MANEJO DE RUTINAS EXISTENTES (CARGAR / BORRAR) ---
  const handleCargarRutinaAEditar = (plan) => {
    setRutinaEditandoId(plan.id);
    setRutina({
      nombre: plan.nombre,
      diaSemana: plan.diaSemana,
      descripcion: plan.descripcion || ''
    });
    // Mapeamos los ejercicios para el lienzo
    setEjerciciosSeleccionados(plan.ejercicios.map(ej => ({
      ejercicioId: ej.ejercicioId,
      nombre: ej.ejercicio.nombre,
      series: ej.series,
      repeticiones: ej.repeticiones,
      peso: ej.peso || 0,
      descansoSeg: ej.descansoSeg || 60
    })));
  };

  const handleEliminarRutinaCompleta = async (idPlan) => {
    if (!confirm("¿Seguro que deseas borrar por completo esta rutina antigua?")) return;
    try {
      const res = await fetch(`${API_URL}/api/rutinas/${idPlan}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert("Rutina eliminada correctamente");
        cargarRutinasDelCliente(clienteSeleccionado);
        if (rutinaEditandoId === idPlan) limpiarLienzo();
      }
    } catch (error) {
      alert("Error al conectar con el servidor");
    }
  };

  // --- LIENZO DE TRABAJO ---
  const agregarAlLienzo = (ejercicio) => {
    if (ejerciciosSeleccionados.some(ej => ej.ejercicioId === ejercicio.id)) {
      alert('Este ejercicio ya está en la lista actual');
      return;
    }
    setEjerciciosSeleccionados([...ejerciciosSeleccionados, {
      ejercicioId: ejercicio.id,
      nombre: ejercicio.nombre,
      series: 4,
      repeticiones: 12,
      peso: 0,
      descansoSeg: 60
    }]);
  };

  const actualizarEjercicioInline = (index, campo, valor) => {
    const nuevos = [...ejerciciosSeleccionados];
    if (campo === 'observaciones') {
      nuevos[index][campo] = valor;
    } else {
      nuevos[index][campo] = Number(valor);
    }
    setEjerciciosSeleccionados(nuevos);
  };

  const quitarDelLienzo = (index) => {
    const nuevos = [...ejerciciosSeleccionados];
    nuevos.splice(index, 1);
    setEjerciciosSeleccionados(nuevos);
  };

  const guardarOActualizarRutina = async () => {
    if (!clienteSeleccionado) return alert("Selecciona un cliente primero");
    if (ejerciciosSeleccionados.length === 0) return alert("Agrega al menos un ejercicio");
    if (!rutina.nombre) return alert("Ponle un nombre a la rutina");

    setGuardando(true);
    const url = rutinaEditandoId 
      ? `${API_URL}/api/rutinas/${rutinaEditandoId}`
      : `${API_URL}/api/rutinas`;
    
    const metodo = rutinaEditandoId ? 'PUT' : 'POST';

    const payload = {
      ...rutina,
      clienteId: clienteSeleccionado,
      listaEjercicios: ejerciciosSeleccionados.map((ej, idx) => ({
        ejercicioId: ej.ejercicioId,
        orden: idx + 1,
        series: ej.series,
        repeticiones: ej.repeticiones,
        peso: ej.peso,
        descansoSeg: ej.descansoSeg,
        observaciones: ej.observaciones
      }))
    };

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(rutinaEditandoId ? "¡Rutina actualizada con éxito!" : "¡Nueva rutina asignada!");
        limpiarLienzo();
        cargarRutinasDelCliente(clienteSeleccionado);
      } else {
        alert("Error al guardar en el servidor");
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setGuardando(false);
    }
  };

  // --- MODAL CATÁLOGO ---
  const abrirModalCrearCatalogo = () => {
    setModoEdicionCatalogo(false);
    setNuevoEjercicio({ nombre: '', descripcion: '', videoUrl: '' });
    setModalEjercicioAbierto(true);
  };

  const abrirModalEditarCatalogo = (e, ej) => {
    e.stopPropagation();
    setModoEdicionCatalogo(true);
    setEjercicioEditandoId(ej.id);
    setNuevoEjercicio({ nombre: ej.nombre, descripcion: ej.descripcion || '', videoUrl: ej.videoUrl || '' });
    setModalEjercicioAbierto(true);
  };

  const gestionarEnvioEjercicio = async (e) => {
    e.preventDefault();
    setGuardandoEjercicio(true);
    const url = modoEdicionCatalogo ? `${API_URL}/api/ejercicios/${ejercicioEditandoId}` : `${API_URL}/api/ejercicios`;
    const metodo = modoEdicionCatalogo ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoEjercicio)
      });
      if (res.ok) {
        cargarCatalogo();
        setModalEjercicioAbierto(false);
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setGuardandoEjercicio(false);
    }
  };

  const catalogoFiltrado = catalogo.filter(ej => 
    ej.nombre.toLowerCase().includes(busquedaCatalogo.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col relative">
      
      {/* MODAL EJERCICIO */}
      {modalEjercicioAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-slate-900">{modoEdicionCatalogo ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}</h3>
              <button onClick={() => setModalEjercicioAbierto(false)} className="text-slate-400 hover:text-red-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={gestionarEnvioEjercicio} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nombre *</label>
                <input type="text" required value={nuevoEjercicio.nombre} onChange={e => setNuevoEjercicio({...nuevoEjercicio, nombre: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50 focus:bg-white outline-none focus:border-emerald-500 transition-all text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Descripción (Opcional)</label>
                <textarea value={nuevoEjercicio.descripcion} onChange={e => setNuevoEjercicio({...nuevoEjercicio, descripcion: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50 focus:bg-white outline-none focus:border-emerald-500 transition-all text-sm" rows="2"></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Enlace Video (Opcional)</label>
                <input type="url" value={nuevoEjercicio.videoUrl} onChange={e => setNuevoEjercicio({...nuevoEjercicio, videoUrl: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-slate-50 focus:bg-white outline-none focus:border-emerald-500 transition-all text-sm" />
              </div>
              <button type="submit" disabled={guardandoEjercicio} className="w-full bg-emerald-600 text-white font-bold py-3 mt-2 rounded-xl hover:bg-emerald-700 shadow-md disabled:opacity-50">
                {guardandoEjercicio ? 'GUARDANDO...' : (modoEdicionCatalogo ? 'GUARDAR CAMBIOS' : 'AGREGAR AL CATÁLOGO')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/admin/dashboard')} className="text-slate-400 hover:text-slate-900 font-bold">← Volver</button>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2"><span>🏋️</span> Centro de Rutinas</h1>
        </div>
        <div className="flex items-center gap-4">
          <select value={clienteSeleccionado} onChange={(e) => setClienteSeleccionado(e.target.value)} className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-4 py-2 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none">
            <option value="">Seleccionar Cliente...</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellidoP}</option>)}
          </select>
          <button onClick={guardarOActualizarRutina} disabled={guardando} className={`px-6 py-2 rounded-lg font-bold text-white transition-all shadow-md disabled:opacity-50 ${rutinaEditandoId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-emerald-600'}`}>
            {guardando ? 'Guardando...' : (rutinaEditandoId ? '💾 Actualizar Rutina' : '💾 Crear Rutina')}
          </button>
        </div>
      </header>

      {/* ÁREA DE TRABAJO TRIPLE COLUMNA */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* COLUMNA 1: HISTORIAL DE RUTINAS DEL CLIENTE */}
        <aside className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col h-[calc(100vh-80px)]">
          <div className="p-4 border-b border-slate-200 bg-slate-100/50">
            <h3 className="font-bold text-slate-600 uppercase text-[10px] tracking-wider">Historial del Alumno</h3>
          </div>
          <div className="p-3 overflow-y-auto flex-1 space-y-2">
            {rutinasExistentes.map(plan => (
              <div key={plan.id} className={`p-3 rounded-xl border transition-all ${rutinaEditandoId === plan.id ? 'bg-blue-50 border-blue-400 shadow-sm' : 'bg-white border-slate-200'}`}>
                <div className="flex justify-between items-start gap-1">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm leading-tight">{plan.nombre}</h4>
                    <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded mt-1 inline-block">{plan.diaSemana}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleCargarRutinaAEditar(plan)} className="p-1 hover:bg-blue-100 rounded text-xs" title="Cargar y Editar">✏️</button>
                    <button onClick={() => handleEliminarRutinaCompleta(plan.id)} className="p-1 hover:bg-red-50 rounded text-xs" title="Eliminar del Alumno">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
            {clienteSeleccionado && rutinasExistentes.length === 0 && <p className="text-slate-400 text-xs text-center py-4">Sin rutinas previas.</p>}
            {!clienteSeleccionado && <p className="text-slate-400 text-xs text-center py-4">Elige un cliente para ver su historial.</p>}
          </div>
        </aside>

        {/* COLUMNA 2: CATÁLOGO MAESTRO MODIFICADO */}
        <aside className="w-80 bg-white border-r border-slate-200 flex flex-col h-[calc(100vh-80px)]">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-500 uppercase text-xs tracking-wider">Catálogo</h3>
              <button onClick={abrirModalCrearCatalogo} className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1.5 rounded-lg hover:bg-emerald-200 shrink-0">
                + Nuevo
              </button>
            </div>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Buscar ejercicio..." 
                value={busquedaCatalogo}
                onChange={(e) => setBusquedaCatalogo(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors shadow-sm"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
          <div className="p-4 overflow-y-auto flex-1 space-y-2">
            {catalogoFiltrado.length > 0 ? (
              catalogoFiltrado.map(ej => (
                <div key={ej.id} onClick={() => agregarAlLienzo(ej)} className="p-3 border border-slate-100 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 cursor-pointer transition-all group flex justify-between items-center">
                  <span className="font-bold text-slate-700 group-hover:text-emerald-700 text-sm">{ej.nombre}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => abrirModalEditarCatalogo(e, ej)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 rounded transition-all text-xs">✏️</button>
                    <span className="text-emerald-500 opacity-0 group-hover:opacity-100 font-bold text-lg leading-none">+</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-400 text-sm mt-4">No se encontraron ejercicios</p>
            )}
          </div>
        </aside>

        {/* COLUMNA 3: LIENZO (CONSTRUCTOR) */}
        <section className="flex-1 bg-slate-50 p-8 overflow-y-auto h-[calc(100vh-80px)]">
          <div className="max-w-2xl mx-auto space-y-6">
            
            {/* Aviso de Modo Edición */}
            {rutinaEditandoId && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex justify-between items-center text-sm text-blue-800 font-medium animate-fade-in">
                <span>Modificando un plan guardado. Los cambios reescribirán la rutina anterior.</span>
                <button onClick={limpiarLienzo} className="text-xs font-bold bg-white border border-blue-300 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-100">Crear Nueva En Su Lugar</button>
              </div>
            )}

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nombre del Plan</label>
                <input type="text" value={rutina.nombre} onChange={e => setRutina({...rutina, nombre: e.target.value})} placeholder="Ej: Tren Superior Fuerza" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"/>
              </div>
              <div className="w-40">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Día</label>
                <select value={rutina.diaSemana} onChange={e => setRutina({...rutina, diaSemana: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all">
                  {['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {ejerciciosSeleccionados.map((ej, index) => (
                <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-6 group">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-sm shrink-0">{index + 1}</div>
                  <div className="flex-1"><h4 className="font-black text-slate-800 text-base">{ej.nombre}</h4></div>
    
                  <div className="flex gap-3">
                      <div className="text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Series</span>
                        <input type="number" min="1" value={ej.series} onChange={e => actualizarEjercicioInline(index, 'series', e.target.value)} className="w-16 bg-slate-50 border border-slate-200 rounded-lg py-1.5 text-center font-bold text-slate-700 outline-none focus:border-emerald-500"/>
                    </div>
                    <div className="text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Reps</span>
                        <input type="number" min="1" value={ej.repeticiones} onChange={e => actualizarEjercicioInline(index, 'repeticiones', e.target.value)} className="w-16 bg-slate-50 border border-slate-200 rounded-lg py-1.5 text-center font-bold text-slate-700 outline-none focus:border-emerald-500"/>
                    </div>
                    <div className="text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Peso(kg)</span>
                        <input type="number" min="0" value={ej.peso} onChange={e => actualizarEjercicioInline(index, 'peso', e.target.value)} className="w-16 bg-slate-50 border border-slate-200 rounded-lg py-1.5 text-center font-bold text-slate-700 outline-none focus:border-emerald-500"/>
                    </div>
                    <div className="text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Desc(s)</span>
                        <input type="number" min="0" step="5" value={ej.descansoSeg} onChange={e => actualizarEjercicioInline(index, 'descansoSeg', e.target.value)} className="w-16 bg-amber-50 border border-amber-200 rounded-lg py-1.5 text-center font-bold text-amber-700 outline-none focus:border-amber-500"/>
                    </div>
                    <div className="w-40 ml-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Obs.</span>
                      <input type="text" placeholder="Nota..." value={ej.observaciones || ''}  onChange={e => actualizarEjercicioInline(index, 'observaciones', e.target.value)}  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-sm text-slate-700 outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <button onClick={() => quitarDelLienzo(index)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Eliminar ejercicio">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
              {ejerciciosSeleccionados.length === 0 && (
                <div className="h-40 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center bg-white/50">
                  <p className="text-slate-400 font-bold text-sm text-center px-4">Selecciona un alumno e historial, o agrega movimientos del catálogo para armar la tabla</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}