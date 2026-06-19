import { useState, useEffect } from 'react';
const API_URL = 'https://backend-impulso-62td.onrender.com';

export default function PortalAlumno() {
  const [paso, setPaso] = useState('inicio'); 
  const [tipoIngreso, setTipoIngreso] = useState(null); 
  const [busqueda, setBusqueda] = useState('');
  const [seleccionado, setSeleccionado] = useState(null);
  const [integranteActivo, setIntegranteActivo] = useState(null);
  const [pin, setPin] = useState('');
  const [errorPin, setErrorPin] = useState(false);
  const [validando, setValidando] = useState(false);

  // Estados de BD
  const [individuos, setIndividuos] = useState([]);
  const [familias, setFamilias] = useState([]);
  const [cargandoDirectorio, setCargandoDirectorio] = useState(true);
  
  // Estado para la Rutina
  const [rutinasAlumno, setRutinasAlumno] = useState([]);
  const [cargandoRutinas, setCargandoRutinas] = useState(false);

  // Estado para el Modal de Información del Ejercicio
  const [ejercicioSeleccionadoInfo, setEjercicioSeleccionadoInfo] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/kiosco/directorio`)
      .then(res => res.json())
      .then(data => {
        setIndividuos(data.individuos || []);
        setFamilias(data.familias || []);
        setCargandoDirectorio(false);
      })
      .catch(error => {
        console.error("Error al cargar directorio:", error);
        setCargandoDirectorio(false);
      });
  }, []);

  const handleSeleccionTipo = (tipo) => {
    setTipoIngreso(tipo);
    setPaso('buscar');
  };

  const handleSeleccionarPerfil = (perfil) => {
    setSeleccionado(perfil);
    setPaso('pin');
  };

  const buscarRutinas = async (clienteId) => {
    setCargandoRutinas(true);
    try {
      const res = await fetch(`${API_URL}/api/rutinas/cliente/${clienteId}`);
      if (res.ok) {
        const data = await res.json();
        setRutinasAlumno(data);
      }
    } catch (error) {
      console.error("Error cargando rutinas", error);
    } finally {
      setCargandoRutinas(false);
    }
  };

  const handleVerificarPin = async (e) => {
    e.preventDefault();
    setValidando(true);
    setErrorPin(false);

    try {
      const response = await fetch(`${API_URL}/api/kiosco/validar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: seleccionado.id, tipo: tipoIngreso, pin: pin })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPin('');
        if (tipoIngreso === 'familia') {
          setPaso('familia');
        } else {
          setIntegranteActivo(seleccionado);
          buscarRutinas(seleccionado.id);
          setPaso('rutina');
        }
      } else {
        setErrorPin(true);
        setPin('');
      }
    } catch (error) {
      setErrorPin(true);
      setPin('');
    } finally {
      setValidando(false);
    }
  };

  const handleSeleccionarIntegrante = (integrante) => {
    setIntegranteActivo(integrante);
    buscarRutinas(integrante.id);
    setPaso('rutina');
  };

  const reiniciar = () => {
    setPaso('inicio');
    setTipoIngreso(null);
    setSeleccionado(null);
    setIntegranteActivo(null);
    setPin('');
    setErrorPin(false);
    setBusqueda('');
    setRutinasAlumno([]);
    setEjercicioSeleccionadoInfo(null);
  };

  const listaFiltrada = (tipoIngreso === 'familia' ? familias : individuos).filter(item =>
    item.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  console.log("Datos del seleccionado:", seleccionado);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col relative">
      
      {/* MODAL DE INFORMACIÓN DEL EJERCICIO */}
      {ejercicioSeleccionadoInfo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            
            <div className="p-6 bg-slate-900 flex justify-between items-center text-white">
              <h3 className="text-xl font-black">{ejercicioSeleccionadoInfo.nombre}</h3>
              <button onClick={() => setEjercicioSeleccionadoInfo(null)} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Instrucciones</h4>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {ejercicioSeleccionadoInfo.descripcion || "No hay descripción detallada para este ejercicio aún."}
                </p>
              </div>

              {ejercicioSeleccionadoInfo.videoUrl && (
                <div className="pt-4 border-t border-slate-100">
                  <a 
                    href={ejercicioSeleccionadoInfo.videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-red-50 text-red-600 font-bold py-3.5 rounded-xl hover:bg-red-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                    Ver Video Tutorial
                  </a>
                </div>
              )}

              <button onClick={() => setEjercicioSeleccionadoInfo(null)} className="w-full bg-slate-100 text-slate-700 font-bold py-3.5 rounded-xl hover:bg-slate-200 transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-slate-900 text-white p-4 shadow-md flex items-center justify-center relative z-10 sticky top-0">
        {paso !== 'inicio' && (
          <button onClick={reiniciar} className="absolute left-4 p-2 text-slate-300 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
        )}
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-black tracking-tighter">IMPULSO</h1>
          <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Centro de Movimiento</span>
        </div>
      </header>

      {/* MAIN */}
      <main className={`flex-1 max-w-md w-full mx-auto p-6 flex flex-col ${paso === 'rutina' ? 'justify-start' : 'justify-center'}`}>

        {paso === 'inicio' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800">¡Bienvenido!</h2>
              <p className="text-slate-500 text-sm mt-2">Selecciona tu modalidad de entrenamiento para ver tu rutina de hoy.</p>
            </div>
            <button onClick={() => handleSeleccionTipo('individual')} className="w-full bg-white border-2 border-emerald-100 hover:border-emerald-500 rounded-2xl p-6 text-left flex items-center gap-4 transition-all shadow-sm active:scale-95 group">
              <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                <svg className="w-7 h-7 text-emerald-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">Plan Individual</h3>
                <p className="text-xs text-slate-500">Ingreso para miembros únicos</p>
              </div>
            </button>
            <button onClick={() => handleSeleccionTipo('familia')} className="w-full bg-white border-2 border-emerald-100 hover:border-emerald-500 rounded-2xl p-6 text-left flex items-center gap-4 transition-all shadow-sm active:scale-95 group">
              <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                <svg className="w-7 h-7 text-emerald-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">Plan Familiar</h3>
                <p className="text-xs text-slate-500">Ingresa al grupo de tu familia</p>
              </div>
            </button>
          </div>
        )}

        {paso === 'buscar' && (
          <div className="animate-fade-in w-full">
            <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">¿Cuál es tu {tipoIngreso === 'familia' ? 'grupo familiar' : 'nombre'}?</h2>
            <input type="text" placeholder={`Buscar ${tipoIngreso === 'familia' ? 'familia...' : 'nombre...'}`} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 shadow-sm" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            {cargandoDirectorio ? (
               <div className="text-center text-slate-400 py-8">Cargando directorio...</div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 divide-y divide-slate-100 overflow-hidden max-h-80 overflow-y-auto">
                {listaFiltrada.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-sm">No se encontraron resultados</div>
                ) : (
                  listaFiltrada.map(item => (
                    <button key={item.id} onClick={() => handleSeleccionarPerfil(item)} className="w-full p-4 text-left font-medium text-slate-700 hover:bg-emerald-50 transition-colors">
                      {item.nombre}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {paso === 'pin' && (
          <div className="animate-fade-in w-full text-center">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Código de Seguridad</h2>
            <p className="text-sm text-slate-500 mb-8">Ingresa los últimos 4 dígitos del RUT (sin dígito verificador)</p>
            <form onSubmit={handleVerificarPin}>
              <input type="password" maxLength="4" pattern="\d*" className={`w-32 mx-auto text-center text-3xl font-bold tracking-[0.5em] bg-white border-2 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 ${errorPin ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-200'} shadow-sm`} value={pin} onChange={(e) => setPin(e.target.value)} autoFocus />
              {errorPin && <p className="text-red-500 text-sm font-medium mb-4">PIN incorrecto, intenta nuevamente.</p>}
              <button type="submit" disabled={validando || pin.length < 4} className="w-full mt-6 bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-600 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                {validando ? 'VERIFICANDO...' : 'VERIFICAR'}
              </button>
            </form>
          </div>
        )}

        {paso === 'familia' && seleccionado && (
          <div className="animate-fade-in w-full">
            <h2 className="text-xl font-bold text-slate-800 mb-2 text-center">{seleccionado.nombre}</h2>
            <p className="text-sm text-slate-500 mb-6 text-center">¿Quién va a entrenar hoy?</p>
            <div className="space-y-3">
              {seleccionado.integrantes && seleccionado.integrantes.map((integrante) => (
                <button key={integrante.id} onClick={() => handleSeleccionarIntegrante(integrante)} className="w-full bg-white border border-slate-200 rounded-xl p-4 font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-700 transition-all shadow-sm">
                  {integrante.nombre}
                </button>
              ))}
            </div>
          </div>
        )}

        {paso === 'rutina' && (
          <div className="animate-fade-in w-full pb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-md">
                {integranteActivo?.nombre.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Hola, {integranteActivo?.nombre.split(' ')[0]}</h2>
                <p className="text-sm text-emerald-600 font-bold uppercase tracking-wider">Tu entrenamiento de hoy</p>
              </div>
            </div>

            {cargandoRutinas ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500 text-sm">Cargando tu progreso...</p>
              </div>
            ) : rutinasAlumno.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
                <span className="text-4xl mb-3 block">🏃‍♂️</span>
                <h3 className="font-bold text-slate-800 mb-1">Día de Descanso</h3>
                <p className="text-slate-500 text-sm">No tienes rutinas asignadas en este momento. Consulta con tu entrenador.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {rutinasAlumno.map((rutina) => (
                  <div key={rutina.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="bg-slate-900 px-5 py-4 flex justify-between items-center">
                      <h3 className="font-bold text-white text-lg">{rutina.nombre}</h3>
                      <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-md">{rutina.diaSemana}</span>
                    </div>
                    
                    <div className="divide-y divide-slate-100 p-2">
                      {rutina.ejercicios.map((ej) => (
                        <div key={ej.id} className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors rounded-xl">
                          <div className="mt-1">
                            <input type="checkbox" className="w-6 h-6 text-emerald-500 border-gray-300 rounded-md focus:ring-emerald-500 cursor-pointer" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-bold text-slate-800 text-lg leading-tight">{ej.ejercicio.nombre}</h4>
                              {/* NUEVO: Botón de Información */}
                              <button 
                                onClick={(e) => {
                                  e.preventDefault(); // Evita que el click interactúe con el checkbox si estuvieran envueltos
                                  setEjercicioSeleccionadoInfo(ej.ejercicio);
                                }}
                                className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors ml-2 flex-shrink-0"
                                title="Ver detalles del ejercicio"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1.5 rounded-md">
                                {ej.series} x {ej.repeticiones} reps
                              </span>
                              {ej.peso > 0 && (
                                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-1.5 rounded-md">
                                  {ej.peso} kg
                                </span>
                              )}
                              {ej.descansoSeg > 0 && (
                                <span className="bg-amber-50 text-amber-700 text-xs font-bold px-2 py-1.5 rounded-md">
                                  ⏳ {ej.descansoSeg}s desc.
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {rutina.ejercicios.length === 0 && (
                        <div className="p-5 text-center text-slate-500 text-sm">No hay ejercicios agregados a esta rutina.</div>
                      )}
                    </div>
                  </div>
                ))}
                
                <button onClick={reiniciar} className="w-full bg-emerald-50 text-emerald-700 font-bold py-4 rounded-2xl hover:bg-emerald-100 transition-colors border border-emerald-200">
                  FINALIZAR ENTRENAMIENTO
                </button>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}