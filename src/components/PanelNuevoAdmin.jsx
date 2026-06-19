import { useState } from 'react';
const API_URL = 'https://backend-impulso-62td.onrender.com';

export default function PanelNuevoAdmin({ isOpen, onClose }) {
  const [data, setData] = useState({ nombre: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const res = await fetch(`${API_URL}/api/admin/crear`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      alert("Administrador creado");
      onClose();
    } else {
      alert("Error al crear administrador");
    }
  };

  if (!isOpen) return null;

  return (
    /* Fondo que cierra al hacer clic */
    <div 
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-end"
      onClick={onClose}
    >
      {/* Contenedor del panel */}
      <div 
        className="w-full max-w-md bg-white p-8 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Botón de cierre "X" */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl font-bold mb-6">Nuevo Administrador</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            className="w-full p-3 border rounded-lg" 
            placeholder="Nombre" 
            onChange={e => setData({...data, nombre: e.target.value})} 
            required 
          />
          <input 
            type="email" 
            className="w-full p-3 border rounded-lg" 
            placeholder="Email" 
            onChange={e => setData({...data, email: e.target.value})} 
            required 
          />
          <input 
            type="password" 
            className="w-full p-3 border rounded-lg" 
            placeholder="Contraseña" 
            onChange={e => setData({...data, password: e.target.value})} 
            required 
          />
          <button className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold">
            REGISTRAR
          </button>
        </form>
      </div>
    </div>
  );
}