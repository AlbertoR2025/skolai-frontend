import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';

interface Profesor {
  id: string;
  nombre: string;
  email: string;
  asignatura: string;
}

const Profesores: React.FC = () => {
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asignatura: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('skolai_profesores');
    if (saved && saved !== '[]') {
      setProfesores(JSON.parse(saved));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('skolai_profesores', JSON.stringify(profesores));
    }
  }, [profesores, isLoaded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      setProfesores(profesores.map(prof => 
        prof.id === editingId ? { ...formData, id: editingId } : prof
      ));
      alert('✅ Profesor actualizado exitosamente');
    } else {
      const newProfesor = {
        id: Date.now().toString(),
        ...formData
      };
      setProfesores([...profesores, newProfesor]);
      alert('✅ Profesor agregado exitosamente');
    }
    
    setFormData({ nombre: '', email: '', asignatura: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (profesor: Profesor) => {
    setFormData({
      nombre: profesor.nombre,
      email: profesor.email,
      asignatura: profesor.asignatura
    });
    setEditingId(profesor.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({ nombre: '', email: '', asignatura: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este profesor?')) return;
    setProfesores(profesores.filter(p => p.id !== id));
    alert('✅ Profesor eliminado');
  };

  return (
  <div className="lg:ml-64 ml-0 p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-white">👨‍🏫 Profesores</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-white/30 hover:bg-white/40 text-white font-bold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105"
        >
          {showForm ? '❌ Cancelar' : '➕ Nuevo Profesor'}
        </button>
      </div>
      
      {showForm && (
        <GlassCard className="mb-8">
          <h2 className="text-2xl text-white mb-4 font-bold">
            {editingId ? '✏️ Editar Profesor' : '➕ Agregar Profesor'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Nombre completo"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-white/60"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-white/60"
              required
            />
            <input
              type="text"
              placeholder="Asignatura"
              value={formData.asignatura}
              onChange={(e) => setFormData({...formData, asignatura: e.target.value})}
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-white/60"
              required
            />
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-green-500/50 hover:bg-green-600/50 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
              >
                {editingId ? '💾 Actualizar' : '➕ Agregar'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500/50 hover:bg-gray-600/50 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
              >
                Cancelar
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profesores.length === 0 ? (
          <div className="col-span-full text-center text-white/60 text-lg py-12">
            <div className="text-6xl mb-4">👨‍🏫</div>
            No hay profesores registrados. ¡Agrega el primero!
          </div>
        ) : (
          profesores.map((profesor) => (
            <GlassCard key={profesor.id}>
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-white">{profesor.nombre}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(profesor)}
                    className="bg-blue-500/50 hover:bg-blue-600/50 text-white font-bold py-1 px-3 rounded-lg transition text-sm"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(profesor.id)}
                    className="bg-red-500/50 hover:bg-red-600/50 text-white font-bold py-1 px-3 rounded-lg transition text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <p className="text-white/80 mb-1">📧 {profesor.email}</p>
              <p className="text-white/80">📚 {profesor.asignatura}</p>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};

export default Profesores;
