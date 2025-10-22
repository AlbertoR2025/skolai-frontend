import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';

interface Comunicado {
  id: string;
  titulo: string;
  mensaje: string;
  fechaPublicacion: string;
}

const Comunicados: React.FC = () => {
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    mensaje: '',
    fechaPublicacion: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const saved = localStorage.getItem('skolai_comunicados');
    if (saved && saved !== '[]') {
      setComunicados(JSON.parse(saved));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('skolai_comunicados', JSON.stringify(comunicados));
    }
  }, [comunicados, isLoaded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setComunicados(comunicados.map(c => 
        c.id === editingId ? { ...formData, id: editingId } : c
      ));
      alert('✅ Comunicado actualizado');
    } else {
      const nuevo = { id: Date.now().toString(), ...formData };
      setComunicados([...comunicados, nuevo]);
      alert('✅ Comunicado publicado');
    }
    setFormData({ titulo: '', mensaje: '', fechaPublicacion: new Date().toISOString().split('T')[0] });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (com: Comunicado) => {
    setFormData({ titulo: com.titulo, mensaje: com.mensaje, fechaPublicacion: com.fechaPublicacion });
    setEditingId(com.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar comunicado?')) return;
    setComunicados(comunicados.filter(c => c.id !== id));
    alert('✅ Comunicado eliminado');
  };

  return (
    <div className="lg:ml-64 ml-0 p-4 lg:p-8 pt-16 lg:pt-8">
      {/* Header mejorado */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center gap-3">
          <span className="text-5xl">📢</span>
          <h1 className="text-3xl lg:text-4xl font-bold text-white">Comunicados</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg w-full lg:w-auto lg:self-start"
        >
          <span className="text-xl">➕</span>
          <span>{showForm ? 'Cancelar' : 'Nuevo Comunicado'}</span>
        </button>
      </div>

      {showForm && (
        <GlassCard className="mb-8">
          <h2 className="text-2xl text-white mb-4 font-bold">
            {editingId ? '✏️ Editar' : '➕ Nuevo'} Comunicado
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Título"
              value={formData.titulo}
              onChange={(e) => setFormData({...formData, titulo: e.target.value})}
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-white/60"
              required
            />
            <textarea
              placeholder="Mensaje"
              value={formData.mensaje}
              onChange={(e) => setFormData({...formData, mensaje: e.target.value})}
              rows={5}
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-white/60"
              required
            />
            <input
              type="date"
              value={formData.fechaPublicacion}
              onChange={(e) => setFormData({...formData, fechaPublicacion: e.target.value})}
              className="w-full p-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white/60"
              required
            />
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-orange-500/50 hover:bg-orange-600/50 text-white font-bold py-3 rounded-lg transition"
              >
                {editingId ? '💾 Actualizar' : '💾 Publicar'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="bg-gray-500/50 hover:bg-gray-600/50 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 gap-6">
        {comunicados.length === 0 ? (
          <div className="text-center text-white/60 text-lg py-12">
            <div className="text-6xl mb-4">📢</div>
            No hay comunicados publicados. ¡Crea el primero!
          </div>
        ) : (
          comunicados.map((com) => (
            <GlassCard key={com.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">{com.titulo}</h3>
                  <p className="text-sm text-white/60 mb-3">{com.fechaPublicacion}</p>
                  <p className="text-white/90 whitespace-pre-wrap">{com.mensaje}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(com)}
                    className="bg-blue-500/50 hover:bg-blue-600/50 text-white font-bold py-1 px-3 rounded-lg transition text-sm"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(com.id)}
                    className="bg-red-500/50 hover:bg-red-600/50 text-white font-bold py-1 px-3 rounded-lg transition text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};

export default Comunicados;
