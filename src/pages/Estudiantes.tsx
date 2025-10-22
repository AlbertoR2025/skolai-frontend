import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import { supabase } from '../lib/supabase';

interface Estudiante {
  id: number;
  rut: string;
  nombre: string;
  apellido: string;
  curso: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
  apoderado: string | null;
  created_at?: string;
}

const Estudiantes: React.FC = () => {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    rut: '',
    nombre: '',
    apellido: '',
    curso: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    apoderado: ''
  });

  useEffect(() => {
    loadEstudiantes();
  }, []);

  const loadEstudiantes = async () => {
    console.log('🔵 Iniciando carga...');
    try {
      const { data, error } = await supabase
        .from('Estudiantes')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📊 Response completa:', { data, error });
      
      if (error) {
        console.error('❌ Error object:', JSON.stringify(error, null, 2));
        throw error;
      }

      if (data) {
        console.log(`✅ ${data.length} estudiantes cargados:`, data);
        setEstudiantes(data);
        localStorage.setItem('skolai_estudiantes', JSON.stringify(data));
      }
    } catch (error: any) {
      console.error('💥 Catch error:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🟡 Guardando estudiante...');

    try {
      if (editingId) {
        const { error } = await supabase
          .from('Estudiantes')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
        alert('✅ Estudiante actualizado exitosamente');
      } else {
        const { error } = await supabase
          .from('Estudiantes')
          .insert([formData]);

        if (error) throw error;
        alert('✅ Estudiante agregado exitosamente');
      }

      await loadEstudiantes();
      resetForm();
    } catch (error) {
      console.error('💥 Error guardando:', error);
      alert('❌ Error al guardar estudiante');
    }
  };

  const handleEdit = (estudiante: Estudiante) => {
    setFormData({
      rut: estudiante.rut,
      nombre: estudiante.nombre,
      apellido: estudiante.apellido,
      curso: estudiante.curso,
      email: estudiante.email,
      telefono: estudiante.telefono,
      fecha_nacimiento: estudiante.fecha_nacimiento,
      apoderado: estudiante.apoderado || ''
    });
    setEditingId(estudiante.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este estudiante?')) return;

    console.log('🗑️ Eliminando estudiante:', id);
    try {
      const { error } = await supabase
        .from('Estudiantes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('✅ Estudiante eliminado');
      await loadEstudiantes();
    } catch (error) {
      console.error('💥 Error eliminando:', error);
      alert('❌ Error al eliminar');
    }
  };

  const resetForm = () => {
    setFormData({
      rut: '',
      nombre: '',
      apellido: '',
      curso: '',
      email: '',
      telefono: '',
      fecha_nacimiento: '',
      apoderado: ''
    });
    setShowForm(false);
    setEditingId(null);
  };

  return (
    <div className="lg:ml-64 ml-0 p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">👨‍🎓 Estudiantes</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          {showForm ? 'Cancelar' : '+ Nuevo Estudiante'}
        </button>
      </div>

      {showForm && (
        <GlassCard className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4">
            {editingId ? 'Editar Estudiante' : 'Agregar Estudiante'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="RUT"
              value={formData.rut}
              onChange={(e) => setFormData({...formData, rut: e.target.value})}
              className="p-2 rounded bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-white/40 text-sm"
              required
            />
            <input
              type="text"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className="p-2 rounded bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-white/40 text-sm"
              required
            />
            <input
              type="text"
              placeholder="Apellido"
              value={formData.apellido}
              onChange={(e) => setFormData({...formData, apellido: e.target.value})}
              className="p-2 rounded bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-white/40 text-sm"
              required
            />
            <input
              type="text"
              placeholder="Curso"
              value={formData.curso}
              onChange={(e) => setFormData({...formData, curso: e.target.value})}
              className="p-2 rounded bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-white/40 text-sm"
              required
            />
            <input
              type="text"
              placeholder="Apoderado"
              value={formData.apoderado}
              onChange={(e) => setFormData({...formData, apoderado: e.target.value})}
              className="p-2 rounded bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-white/40 text-sm"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="p-2 rounded bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-white/40 text-sm"
              required
            />
            <input
              type="tel"
              placeholder="Teléfono"
              value={formData.telefono}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              className="p-2 rounded bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-white/40 text-sm"
              required
            />
            <input
              type="date"
              placeholder="Fecha de Nacimiento"
              value={formData.fecha_nacimiento}
              onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})}
              className="p-2 rounded bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-white/40 text-sm"
              required
            />
            <div className="md:col-span-2 flex gap-2 justify-end">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              >
                {editingId ? 'Actualizar' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {estudiantes.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-white/70 text-4xl mb-2">👨‍🎓</p>
            <p className="text-white/70">No hay estudiantes registrados</p>
          </div>
        ) : (
          estudiantes.map((estudiante) => (
            <GlassCard key={estudiante.id}>
              <div className="flex justify-end gap-2 mb-2">
                <button
                  onClick={() => handleEdit(estudiante)}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded text-xs"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(estudiante.id)}
                  className="bg-red-500 hover:bg-red-600 text-white p-1 rounded text-xs"
                >
                  🗑️
                </button>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {estudiante.nombre} {estudiante.apellido}
              </h3>
              <p className="text-white/80 text-sm">RUT: {estudiante.rut}</p>
              <p className="text-white/80 text-sm">📚 {estudiante.curso}</p>
              {estudiante.apoderado && (
                <p className="text-white/80 text-sm">👤 {estudiante.apoderado}</p>
              )}
              <p className="text-white/80 text-sm">📧 {estudiante.email}</p>
              <p className="text-white/80 text-sm">📱 {estudiante.telefono}</p>
              <p className="text-white/80 text-sm">
                🎂 {estudiante.fecha_nacimiento}
              </p>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};

export default Estudiantes;
