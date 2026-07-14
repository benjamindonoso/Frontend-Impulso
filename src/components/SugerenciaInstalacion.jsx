import { useState, useEffect } from 'react';

export default function SugerenciaInstalacion() {
  const [mostrarBanner, setMostrarBanner] = useState(false);
  const [plataforma, setPlataforma] = useState('android'); 

  useEffect(() => {
    const esStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || window.navigator.standalone 
      || document.referrer.includes('android-app://');

    if (esStandalone) {
      return;
    }

    const descartado = localStorage.getItem('pwa_banner_descartado');
    if (descartado) {
      return;
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const esIos = /iphone|ipad|ipod/.test(userAgent);
    const esAndroid = /android/.test(userAgent);

    if (esIos) {
      setPlataforma('ios');
      setMostrarBanner(true);
    } else if (esAndroid) {
      setPlataforma('android');
      setMostrarBanner(true);
    }
  }, []);

  const cerrarBanner = () => {
    setMostrarBanner(false);
    localStorage.setItem('pwa_banner_descartado', 'true');
  };

  if (!mostrarBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 p-5 animate-bounce-short transition-all duration-500">
      <div className="flex justify-between items-start gap-4">
        {/* LOGO TEMPORAL/ICONO DE IMPULSO */}
        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl shrink-0">
          ⚡
        </div>
        
        {/* TEXTO EXPLICATIVO */}
        <div className="flex-1">
          <h4 className="font-black text-slate-900 text-sm leading-tight">Instala la App de Impulso</h4>
          <p className="text-xs text-slate-500 mt-1 leading-snug">
            Accede al instante a tus rutinas y entrenamientos directamente desde tu pantalla de inicio.
          </p>
          
          {/* INSTRUCCIONES DINÁMICAS SEGÚN SISTEMA OPERATIVO */}
          <div className="mt-3 p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 font-medium">
            {plataforma === 'ios' ? (
              <span className="flex items-center gap-1.5 flex-wrap">
                Presiona los 3 puntitos y luego selecciona el botón de compartir (aveces representado por un cuadrado con una flecha hacia arriba)
                <span className="bg-white px-1.5 py-0.5 rounded shadow-sm border border-slate-100 font-bold inline-block text-xs">
                  <svg className="w-3.5 h-3.5 inline text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </span> 
                y luego selecciona 
                <strong className="text-slate-800">"Añadir a pantalla de inicio"</strong>.
              </span>
            ) : (
              <span className="flex items-center gap-1.5 flex-wrap">
                Toca los tres puntos 
                <strong className="text-slate-800 font-black">⋮</strong> 
                en la esquina superior derecha y selecciona 
                <strong className="text-slate-800">"Instalar aplicación"</strong> o 
                <strong className="text-slate-800">"Agregar a pantalla de inicio"</strong>.
              </span>
            )}
          </div>
        </div>

        {/* BOTÓN PARA CERRAR EL BANNER */}
        <button 
          onClick={cerrarBanner} 
          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
          title="No mostrar de nuevo"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}