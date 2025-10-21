import { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import { supabase } from '../lib/supabase';

interface Profesor {
  id: number;
  nombre: string;
  apellido: string;
  rut: string;
  especialidad: string;
  email: string;
  telefono: string;
}

const Profesores = () => {
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    rut: '',
    especialidad: '',
    email: '',
    telefono: '',
  });

  useEffect(() => {
    loadProfesores();
  }, []);

  const loadProfesores = async () => {
    try {
      const { data, error } = await supabase
        .from('Profesores')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setProfesores(data);
        localStorage.setItem('skolai_profesores', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error cargando profesores:', error);
      const stored = localStorage.getItem('skolai_profesores');
      if (stored) {
        setProfesores(JSON.parse(stored));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('Profesores')
          .update(formData)
          .eq('id', editingId);
        
        if (error) throw error;
        
        setProfesores(profesores.map(prof => 
          prof.id === editingId ? { ...prof, ...formData } : prof
        ));
      } else {
        const { data, error } = await supabase
          .from('Profesores')
          .insert([formData])
          .select();
        
        if (error) throw error;
        
        if (data) {
          setProfesores([data[0], ...profesores]);
        }
      }
      
      await loadProfesores();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error guardando profesor:', error);
      alert('Error al guardar. Intenta nuevamente.');
    }
  };

  const handleEdit = (profesor: Profesor) => {
    setEditingId(profesor.id);
    setFormData({
      nombre: profesor.nombre,
      apellido: profesor.apellido,
      rut: profesor.rut,
      especialidad: profesor.especialidad,
      email: profesor.email,
      telefono: profesor.telefono,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este profesor?')) {
      try {
        const { error } = await supabase
          .from('Profesores')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        setProfesores(profesores.filter(prof => prof.id !== id));
        await loadProfesores();
      } catch (error) {
        console.error('Error eliminando profesor:', error);
        alert('Error al eliminar. Intenta nuevamente.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      rut: '',
      especialidad: '',
      email: '',
      telefono: '',
    });
    setEditingId(null);
  };

  return (
    <div className="lg:ml-64 ml-0 p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-white">👨‍🏫 Profesores</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 transform hover:scale-105 flex items-center gap-2"
        >
          ➕ Nuevo Profesor
        </button>
      </div>

      {profesores.length === 0 ? (
        <GlassCard>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👨‍🏫</div>
            <p className="text-white text-xl">No hay profesores registrados. ¡Agrega el primero!</p>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profesores.map((profesor) => (
            <GlassCard key={profesor.id}>
              <div className="flex justify-between items-start mb-4">
                <div className="text-4xl">👨‍🏫</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(profesor)}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition duration-200"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(profesor.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition duration-200"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {profesor.nombre} {profesor.apellido}
              </h3>
              <div className="space-y-1 text-white/80 text-sm">
                <p><strong>RUT:</strong> {profesor.rut}</p>
                <p><strong>Especialidad:</strong> {profesor.especialidad}</p>
                <p><strong>Email:</strong> {profesor.email}</p>
                <p><strong>Teléfono:</strong> {profesor.telefono}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-blue-900/90 to-indigo-900/90 backdrop-blur-md rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6">
              {editingId ? '✏️ Editar Profesor' : '➕ Nuevo Profesor'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2">Nombre</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Apellido</label>
                  <input
                    type="text"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">RUT</label>
                  <input
                    type="text"
                    value={formData.rut}
                    onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Especialidad</label>
                  <input
                    type="text"
                    value={formData.especialidad}
                    onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 rounded-lg transition duration-200"
                >
                  {editingId ? 'Actualizar' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-lg transition duration-200"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profesores;
