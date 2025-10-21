import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';

interface Comunicado {
  id: string;
  titulo: string;
  contenido: string;
  fecha: string;
}

const Comunicados: React.FC = () => {
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    contenido: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('skolai_comunicados');
    if (saved) {
      setComunicados(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('skolai_comunicados', JSON.stringify(comunicados));
  }, [comunicados]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      setComunicados(comunicados.map(com => 
        com.id === editingId ? { ...formData, id: editingId, fecha: com.fecha } : com
      ));
      alert('✅ Comunicado actualizado exitosamente');
    } else {
      const newComunicado = {
        id: Date.now().toString(),
        ...formData,
        fecha: new Date().toISOString()
      };
      setComunicados([newComunicado, ...comunicados]);
      alert('✅ Comunicado publicado exitosamente');
    }
    
    setFormData({ titulo: '', contenido: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (comunicado: Comunicado) => {
    setFormData({
      titulo: comunicado.titulo,
      contenido: comunicado.contenido
    });
    setEditingId(comunicado.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({ titulo: '', contenido: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este comunicado?')) return;
    setComunicados(comunicados.filter(c => c.id !== id));
    alert('✅ Comunicado eliminado');
  };

  return (
  <div className="lg:ml-64 ml-0 p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-white">📢 Comunicados</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-white/30 hover:bg-white/40 text-white font-bold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105"
        >
          {showForm ? '❌ Cancelar' : '➕ Nuevo Comunicado'}
        </button>
      </div>
      
      {showForm && (
        <GlassCard className="mb-8">
          <h2 className="text-2xl text-white mb-4 font-bold">
            {editingId ? '✏️ Editar Comunicado' : '➕ Nuevo Comunicado'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Título del comunicado"
              value={formData.titulo}
              onChange={(e) => setFormData({...formData, titulo: e.target.value})}
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-white/60"
              required
            />
            <textarea
              placeholder="Contenido del comunicado"
              value={formData.contenido}
              onChange={(e) => setFormData({...formData, contenido: e.target.value})}
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none h-32 resize-none"
              required
            />
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-green-500/50 hover:bg-green-600/50 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
              >
                {editingId ? '💾 Actualizar' : '➕ Publicar'}
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

      <div className="space-y-6">
        {comunicados.length === 0 ? (
          <GlassCard>
            <div className="text-center text-white/60 py-12">
              <div className="text-6xl mb-4">📢</div>
              <p className="text-lg">No hay comunicados publicados. ¡Crea el primero!</p>
            </div>
          </GlassCard>
        ) : (
          comunicados.map((comunicado) => (
            <GlassCard key={comunicado.id}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{comunicado.titulo}</h3>
                  <p className="text-white/60 text-sm">
                    {new Date(comunicado.fecha).toLocaleDateString('es-CL', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(comunicado)}
                    className="bg-blue-500/50 hover:bg-blue-600/50 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(comunicado.id)}
                    className="bg-red-500/50 hover:bg-red-600/50 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <p className="text-white/90 leading-relaxed">{comunicado.contenido}</p>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};

export default Comunicados;
