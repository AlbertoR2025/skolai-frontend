import { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import { supabase } from '../lib/supabase';

interface Curso {
  id: number;
  nombre: string;
  nivel: string;
}

const Cursos = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    nivel: '',
  });

  useEffect(() => {
    loadCursos();
  }, []);

  const loadCursos = async () => {
    try {
      const { data, error } = await supabase
        .from('Cursos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setCursos(data);
        localStorage.setItem('skolai_cursos', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error cargando cursos:', error);
      const stored = localStorage.getItem('skolai_cursos');
      if (stored) {
        setCursos(JSON.parse(stored));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('Cursos')
          .update(formData)
          .eq('id', editingId);
        
        if (error) throw error;
        
        setCursos(cursos.map(curso => 
          curso.id === editingId ? { ...curso, ...formData } : curso
        ));
      } else {
        const { data, error } = await supabase
          .from('Cursos')
          .insert([formData])
          .select();
        
        if (error) throw error;
        
        if (data) {
          setCursos([data[0], ...cursos]);
        }
      }
      
      await loadCursos();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error guardando curso:', error);
      alert('Error al guardar. Intenta nuevamente.');
    }
  };

  const handleEdit = (curso: Curso) => {
    setEditingId(curso.id);
    setFormData({
      nombre: curso.nombre,
      nivel: curso.nivel,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este curso?')) {
      try {
        const { error } = await supabase
          .from('Cursos')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        setCursos(cursos.filter(curso => curso.id !== id));
        await loadCursos();
      } catch (error) {
        console.error('Error eliminando curso:', error);
        alert('Error al eliminar. Intenta nuevamente.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      nivel: '',
    });
    setEditingId(null);
  };

  return (
    <div className="lg:ml-64 ml-0 p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-white">📚 Cursos</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 transform hover:scale-105 flex items-center gap-2"
        >
          ➕ Nuevo Curso
        </button>
      </div>

      {cursos.length === 0 ? (
        <GlassCard>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-white text-xl">No hay cursos registrados. ¡Agrega el primero!</p>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cursos.map((curso) => (
            <GlassCard key={curso.id}>
              <div className="flex justify-between items-start mb-4">
                <div className="text-4xl">📚</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(curso)}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition duration-200"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(curso.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition duration-200"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{curso.nombre}</h3>
              <p className="text-white/80">Nivel: {curso.nivel}</p>
            </GlassCard>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-md rounded-2xl p-8 max-w-md w-full border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6">
              {editingId ? '✏️ Editar Curso' : '➕ Nuevo Curso'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Nombre del Curso</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ej: 5° Básico A"
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2">Nivel</label>
                <select
                  value={formData.nivel}
                  onChange={(e) => setFormData({ ...formData, nivel: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="" className="bg-purple-900">Seleccionar nivel</option>
                  <option value="Prekinder" className="bg-purple-900">Prekinder</option>
                  <option value="Kinder" className="bg-purple-900">Kinder</option>
                  <option value="1° Básico" className="bg-purple-900">1° Básico</option>
                  <option value="2° Básico" className="bg-purple-900">2° Básico</option>
                  <option value="3° Básico" className="bg-purple-900">3° Básico</option>
                  <option value="4° Básico" className="bg-purple-900">4° Básico</option>
                  <option value="5° Básico" className="bg-purple-900">5° Básico</option>
                  <option value="6° Básico" className="bg-purple-900">6° Básico</option>
                  <option value="7° Básico" className="bg-purple-900">7° Básico</option>
                  <option value="8° Básico" className="bg-purple-900">8° Básico</option>
                  <option value="1° Medio" className="bg-purple-900">1° Medio</option>
                  <option value="2° Medio" className="bg-purple-900">2° Medio</option>
                  <option value="3° Medio" className="bg-purple-900">3° Medio</option>
                  <option value="4° Medio" className="bg-purple-900">4° Medio</option>
                </select>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 rounded-lg transition duration-200"
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

export default Cursos;
