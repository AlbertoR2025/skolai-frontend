import { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import { supabase } from '../lib/supabase';

interface Estudiante {
  id: number;
  nombre: string;
  apellido: string;
  rut: string;
  curso: string;
  fecha_nac: string;
  apoderado: string;
  telefono: string;
  email: string;
}

const Estudiantes = () => {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    rut: '',
    curso: '',
    fecha_nac: '',
    apoderado: '',
    telefono: '',
    email: '',
  });

  useEffect(() => {
    loadEstudiantes();
  }, []);

  const loadEstudiantes = async () => {
    try {
      const { data, error } = await supabase
        .from('Estudiantes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setEstudiantes(data);
        localStorage.setItem('skolai_estudiantes', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error cargando estudiantes:', error);
      const stored = localStorage.getItem('skolai_estudiantes');
      if (stored) {
        setEstudiantes(JSON.parse(stored));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('Estudiantes')
          .update(formData)
          .eq('id', editingId);
        
        if (error) throw error;
        
        setEstudiantes(estudiantes.map(est => 
          est.id === editingId ? { ...est, ...formData } : est
        ));
      } else {
        const { data, error } = await supabase
          .from('Estudiantes')
          .insert([formData])
          .select();
        
        if (error) throw error;
        
        if (data) {
          setEstudiantes([data[0], ...estudiantes]);
        }
      }
      
      await loadEstudiantes();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error guardando estudiante:', error);
      alert('Error al guardar. Intenta nuevamente.');
    }
  };

  const handleEdit = (estudiante: Estudiante) => {
    setEditingId(estudiante.id);
    setFormData({
      nombre: estudiante.nombre,
      apellido: estudiante.apellido,
      rut: estudiante.rut,
      curso: estudiante.curso,
      fecha_nac: estudiante.fecha_nac,
      apoderado: estudiante.apoderado,
      telefono: estudiante.telefono,
      email: estudiante.email,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este estudiante?')) {
      try {
        const { error } = await supabase
          .from('Estudiantes')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        setEstudiantes(estudiantes.filter(est => est.id !== id));
        await loadEstudiantes();
      } catch (error) {
        console.error('Error eliminando estudiante:', error);
        alert('Error al eliminar. Intenta nuevamente.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      rut: '',
      curso: '',
      fecha_nac: '',
      apoderado: '',
      telefono: '',
      email: '',
    });
    setEditingId(null);
  };

  return (
    <div className="lg:ml-64 ml-0 p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-white">👨‍🎓 Estudiantes</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 transform hover:scale-105 flex items-center gap-2"
        >
          ➕ Nuevo Estudiante
        </button>
      </div>

      {estudiantes.length === 0 ? (
        <GlassCard>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👨‍🎓</div>
            <p className="text-white text-xl">No hay estudiantes registrados. ¡Agrega el primero!</p>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {estudiantes.map((estudiante) => (
            <GlassCard key={estudiante.id}>
              <div className="flex justify-between items-start mb-4">
                <div className="text-4xl">👨‍🎓</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(estudiante)}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition duration-200"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(estudiante.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition duration-200"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {estudiante.nombre} {estudiante.apellido}
              </h3>
              <div className="space-y-1 text-white/80 text-sm">
                <p><strong>RUT:</strong> {estudiante.rut}</p>
                <p><strong>Curso:</strong> {estudiante.curso}</p>
                <p><strong>Apoderado:</strong> {estudiante.apoderado}</p>
                <p><strong>Teléfono:</strong> {estudiante.telefono}</p>
                <p><strong>Email:</strong> {estudiante.email}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-md rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6">
              {editingId ? '✏️ Editar Estudiante' : '➕ Nuevo Estudiante'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2">Nombre</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Apellido</label>
                  <input
                    type="text"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">RUT</label>
                  <input
                    type="text"
                    value={formData.rut}
                    onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Curso</label>
                  <input
                    type="text"
                    value={formData.curso}
                    onChange={(e) => setFormData({ ...formData, curso: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={formData.fecha_nac}
                    onChange={(e) => setFormData({ ...formData, fecha_nac: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Apoderado</label>
                  <input
                    type="text"
                    value={formData.apoderado}
                    onChange={(e) => setFormData({ ...formData, apoderado: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-lg transition duration-200"
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

export default Estudiantes;
