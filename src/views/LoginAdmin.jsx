import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const API_URL = 'https://backend-impulso-62td.onrender.com';

export default function LoginAdmin() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); 

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        navigate('/admin/dashboard');
      } else {
        setError(data.error || 'Credenciales inválidas');
      }
    } catch (err) {
      setError('Error de conexión con el servidor. Verifica que esté encendido.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 transform -rotate-3">
            <span className="text-emerald-400 font-bold text-2xl">IM</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">Acceso Administrativo</h2>
          <p className="text-slate-500 text-sm mt-2">Solo personal autorizado de Impulso</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold mb-5 text-center">
            {error}
          </div>
        )}

        {/* Al volver a type="submit", el Enter volverá a funcionar automáticamente */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Correo de Entrenador</label>
            <input 
              type="email" 
              required 
              className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-slate-800" 
              placeholder="entrenador@impulso.cl"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Contraseña</label>
            <input 
              type="password" 
              required 
              className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-slate-800"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            className="w-full mt-4 bg-emerald-500 text-white font-bold tracking-wide py-3.5 rounded-xl hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-md"
          >
            INGRESAR AL PANEL
          </button>
        </form>
      </div>
    </div>
  );
}