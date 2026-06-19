import { useState, useEffect } from 'react';
const API_URL = 'https://backend-impulso-62td.onrender.com';

export default function ListaAdmin() {
  const [admins, setAdmins] = useState([]);
  const [editingAdmin, setEditingAdmin] = useState(null); // Para saber quién se edita

  // ... (tu fetch actual para obtener admins) ...

  const handleUpdate = async (id, data) => {
    await fetch(`${API_URL}/api/admin/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(data)
    });
    setEditingAdmin(null);
    // Recargar lista...
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="font-bold text-lg mb-4">Administradores registrados</h3>
      {admins.map(admin => (
        <div key={admin.id} className="flex justify-between items-center py-3 border-b">
          <div>
            <p className="font-semibold">{admin.nombre}</p>
            <p className="text-sm text-slate-400">{admin.email}</p>
          </div>
          
          <div className="flex gap-2">
            {/* Botón Lápiz (Editar) */}
            <button onClick={() => setEditingAdmin(admin)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg">
              ✏️
            </button>
            {/* Botón Tacho (Borrar) */}
            <button onClick={() => handleDelete(admin.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
              🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}