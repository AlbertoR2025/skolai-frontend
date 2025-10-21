import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';

interface Curso {
  id: string;
  nombre: string;
  descripcion: string;
}

const Cursos: React.FC = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('skolai_cursos');
    if (saved && saved !== '[]') {
      setCursos(JSON.parse(saved));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('skolai_cursos', JSON.stringify(cursos));
    }
  }, [cursos, isLoaded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      setCursos(cursos.map(curso => 
        curso.id === editingId ? { ...formData, id: editingId } : curso
      ));
      alert('✅ Curso actualizado exitosamente');
    } else {
      const newCurso = {
        id: Date.now().toString(),
        ...formData
      };
      setCursos([...cursos, newCurso]);
      alert('✅ Curso agregado exitosamente');
    }
    
    setFormData({ nombre: '', descripcion: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (curso: Curso) => {
    setFormData({
      nombre: curso.nombre,
      descripcion: curso.descripcion
    });
    setEditingId(curso.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({ nombre: '', descripcion: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este curso?')) return;
    setCursos(cursos.filter(c => c.id !== id));
    alert('✅ Curso eliminado');
  };

  return (
  <div className="lg:ml-64 ml-0 p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-white">📚 Cursos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-white/30 hover:bg-white/40 text-white font-bold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105"
        >
          {showForm ? '❌ Cancelar' : '➕ Nuevo Curso'}
        </button>
      </div>
      
      {showForm && (
        <GlassCard className="mb-8">
          <h2 className="text-2xl text-white mb-4 font-bold">
            {editingId ? '✏️ Editar Curso' : '➕ Agregar Curso'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Nombre del curso"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-white/60"
              required
            />
            <textarea
              placeholder="Descripción"
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none h-24 resize-none"
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
        {cursos.length === 0 ? (
          <div className="col-span-full text-center text-white/60 text-lg py-12">
            <div className="text-6xl mb-4">📚</div>
            No hay cursos registrados. ¡Agrega el primero!
          </div>
        ) : (
          cursos.map((curso) => (
            <GlassCard key={curso.id}>
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-white">{curso.nombre}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(curso)}
                    className="bg-blue-500/50 hover:bg-blue-600/50 text-white font-bold py-1 px-3 rounded-lg transition text-sm"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(curso.id)}
                    className="bg-red-500/50 hover:bg-red-600/50 text-white font-bold py-1 px-3 rounded-lg transition text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <p className="text-white/80">{curso.descripcion}</p>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};

export default Cursos;

