import { useState, useEffect } from "react";
const API_URL = "https://backend-impulso-62td.onrender.com";

export default function PanelRutina({ isOpen, onClose, cliente }) {
  const [catalogo, setCatalogo] = useState([]);
  const [mesociclos, setMesociclos] = useState([]); 
  const [rutina, setRutina] = useState({
    nombre: "",
    diaSemana: "Lunes",
    descripcion: "",
    mesocicloId: "",
  }); 
  const [ejercicios, setEjercicios] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    if (isOpen && cliente) {
      fetch(`${API_URL}/api/ejercicios`)
        .then((res) => res.json())
        .then((data) => setCatalogo(data))
        .catch((err) => console.error("Error cargando catálogo:", err));

      fetch(`${API_URL}/api/rutinas/cliente/${cliente.id}`)
        .then((res) => res.json())
        .then((data) => setMesociclos(data))
        .catch((err) => console.error("Error cargando semanas:", err));
    } else {
      setRutina({
        nombre: "",
        diaSemana: "Lunes",
        descripcion: "",
        mesocicloId: "",
      });
      setEjercicios([]);
      setMensaje(null);
    }
  }, [isOpen, cliente]);

  const agregarEjercicio = (e) => {
    const ejercicioId = Number(e.target.value);
    if (!ejercicioId) return;

    const yaExiste = ejercicios.some((ej) => ej.ejercicioId === ejercicioId);

    if (yaExiste) {
      alert("Este ejercicio ya está en la rutina.");
      e.target.value = "";
      return;
    }

    const ejCatalogo = catalogo.find((ej) => ej.id === ejercicioId);
    if (ejCatalogo) {
      setEjercicios([
        ...ejercicios,
        {
          ejercicioId: ejCatalogo.id,
          nombre: ejCatalogo.nombre,
          series: 4,
          repeticiones: 12,
          peso: 0,
          descansoSeg: 60,
        },
      ]);
    }
    e.target.value = "";
  };

  const actualizarEjercicio = (index, campo, valor) => {
    const nuevos = [...ejercicios];
    nuevos[index][campo] = Number(valor);
    setEjercicios(nuevos);
  };

  const eliminarEjercicio = (index) => {
    setEjercicios(ejercicios.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rutina.mesocicloId) {
      setMensaje({
        tipo: "error",
        texto: "Debes seleccionar a qué semana pertenece.",
      });
      return;
    }
    if (ejercicios.length === 0) {
      setMensaje({
        tipo: "error",
        texto: "Debes agregar al menos un ejercicio.",
      });
      return;
    }

    setGuardando(true);
    const token = localStorage.getItem("token");

    const payload = {
      nombre: rutina.nombre,
      diaSemana: rutina.diaSemana,
      descripcion: rutina.descripcion,
      mesocicloId: Number(rutina.mesocicloId),
      listaEjercicios: ejercicios.map((ej, index) => ({
        ejercicioId: ej.ejercicioId,
        orden: index + 1,
        series: ej.series,
        repeticiones: ej.repeticiones,
        peso: ej.peso,
        descansoSeg: ej.descansoSeg
      }))
    };

    try {
      const response = await fetch(`${API_URL}/api/rutinas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setMensaje({ tipo: "exito", texto: "¡Rutina asignada con éxito!" });
        setTimeout(() => onClose(), 1500);
      } else {
        setMensaje({ tipo: "error", texto: "Error al guardar la rutina." });
      }

    } catch (error) {
      setMensaje({ tipo: "error", texto: "Error de conexión." });
    } finally {
      setGuardando(false);
    }
  };

  if (!cliente) return null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 z-40 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"} flex flex-col`}
      >
        <div className="px-6 py-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Armar Rutina</h2>
            <p className="text-sm text-emerald-600 font-semibold mt-1">
              Para: {cliente.nombre} {cliente.apellidoP}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 bg-white rounded-full shadow-sm hover:shadow transition-all"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {mensaje && (
            <div
              className={`p-4 mb-6 rounded-xl text-sm font-bold flex items-center ${mensaje.tipo === "exito" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"}`}
            >
              {mensaje.texto}
            </div>
          )}
          <form id="form-rutina" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  Nombre del Plan
                </label>
                <input
                  type="text"
                  required
                  value={rutina.nombre}
                  onChange={(e) =>
                    setRutina({ ...rutina, nombre: e.target.value })
                  }
                  className="w-full rounded-lg border-slate-200 px-4 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-200 text-slate-800"
                  placeholder="Ej: Tren Superior"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  Semana
                </label>
                <select
                  required
                  value={rutina.mesocicloId}
                  onChange={(e) =>
                    setRutina({ ...rutina, mesocicloId: e.target.value })
                  }
                  className="w-full rounded-lg border-slate-200 px-4 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-200 text-slate-800 font-medium"
                >
                  <option value="">Seleccionar...</option>
                  {mesociclos.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
                {mesociclos.length === 0 && (
                  <p className="text-[10px] text-red-500 mt-1">
                    Crea una semana en el Centro de Rutinas primero.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  Día
                </label>
                <select
                  value={rutina.diaSemana}
                  onChange={(e) =>
                    setRutina({ ...rutina, diaSemana: e.target.value })
                  }
                  className="w-full rounded-lg border-slate-200 px-4 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-200 text-slate-800 font-medium"
                >
                  {[
                    "Lunes",
                    "Martes",
                    "Miércoles",
                    "Jueves",
                    "Viernes",
                    "Sábado",
                    "Domingo",
                  ].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                Añadir Ejercicio
              </label>
              <select
                onChange={agregarEjercicio}
                className="w-full rounded-lg border-slate-200 px-4 py-3 bg-white text-emerald-600 font-bold focus:ring-2 focus:ring-emerald-500 shadow-sm cursor-pointer"
              >
                <option value="">+ Seleccionar del catálogo...</option>
                {catalogo.map((ej) => (
                  <option key={ej.id} value={ej.id}>
                    {ej.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              {ejercicios.map((ej, index) => (
                <div
                  key={index}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative group"
                >
                  <button
                    type="button"
                    onClick={() => eliminarEjercicio(index)}
                    className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-500 hover:text-white"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <h4 className="font-bold text-slate-800 mb-3">
                    {index + 1}. {ej.nombre}
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-bold text-center">
                        Series
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={ej.series}
                        onChange={(e) =>
                          actualizarEjercicio(index, "series", e.target.value)
                        }
                        className="w-full text-center bg-slate-50 border border-slate-200 rounded p-1 text-sm font-bold mt-1"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-bold text-center">
                        Reps
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={ej.repeticiones}
                        onChange={(e) =>
                          actualizarEjercicio(
                            index,
                            "repeticiones",
                            e.target.value,
                          )
                        }
                        className="w-full text-center bg-slate-50 border border-slate-200 rounded p-1 text-sm font-bold mt-1"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-bold text-center">
                        Peso(kg)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={ej.peso}
                        onChange={(e) =>
                          actualizarEjercicio(index, "peso", e.target.value)
                        }
                        className="w-full text-center bg-slate-50 border border-slate-200 rounded p-1 text-sm font-bold mt-1"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-bold text-center">
                        Desc(s)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={ej.descansoSeg}
                        onChange={(e) =>
                          actualizarEjercicio(
                            index,
                            "descansoSeg",
                            e.target.value,
                          )
                        }
                        className="w-full text-center bg-slate-50 border border-slate-200 rounded p-1 text-sm font-bold mt-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {ejercicios.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                  No hay ejercicios en esta rutina aún.
                </div>
              )}
            </div>
          </form>
        </div>
        <div className="p-6 border-t border-slate-100 bg-white">
          <button
            form="form-rutina"
            type="submit"
            disabled={guardando}
            className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-600 transition-all shadow-md disabled:opacity-70"
          >
            {guardando ? "GUARDANDO..." : "GUARDAR RUTINA"}
          </button>
        </div>
      </div>
    </>
  );
}