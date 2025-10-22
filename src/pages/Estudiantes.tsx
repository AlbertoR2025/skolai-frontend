import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';

interface Estudiante {
  id: string;
  rut: string;
  nombre: string;
  apellido: string;
  curso: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
}

const Estudiantes: React.FC = () => {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [formData, setFormData] = useState({
    rut: '',
    nombre: '',
    apellido: '',
    curso: '',
    email: '',
    telefono: '',
    fechaNacimiento: ''
  });

  // Cargar datos desde LocalStorage al iniciar
  useEffect(() => {
    const savedEstudiantes = localStorage.getItem('skolai_estudiantes');
    if (savedEstudiantes && savedEstudiantes !== '[]') {
      setEstudiantes(JSON.parse(savedEstudiantes));
    }
    setIsLoaded(true);
  }, []);

  // Guardar datos en LocalStorage SOLO después de cargar
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('skolai_estudiantes', JSON.stringify(estudiantes));
    }
  }, [estudiantes, isLoaded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      setEstudiantes(estudiantes.map(est => 
        est.id === editingId ? { ...formData, id: editingId } : est
      ));
      alert('✅ Estudiante actualizado exitosamente');
    } else {
      const newEstudiante = {
        id: Date.now().toString(),
        ...formData
      };
      setEstudiantes([...estudiantes, newEstudiante]);
      alert('✅ Estudiante agregado exitosamente');
    }
    
    setFormData({
      rut: '',
      nombre: '',
      apellido: '',
      curso: '',
      email: '',
      telefono: '',
      fechaNacimiento: ''
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (estudiante: Estudiante) => {
    setFormData({
      rut: estudiante.rut,
      nombre: estudiante.nombre,
      apellido: estudiante.apellido,
      curso: estudiante.curso,
      email: estudiante.email,
      telefono: estudiante.telefono,
      fechaNacimiento: estudiante.fechaNacimiento
    });
    setEditingId(estudiante.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({
      rut: '',
      nombre: '',
      apellido: '',
      curso: '',
      email: '',
      telefono: '',
      fechaNacimiento: ''
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este estudiante?')) return;
    setEstudiantes(estudiantes.filter(e => e.id !== id));
    alert('✅ Estudiante eliminado');
  };

  return (
    <div className="ml-64 p-6">
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
        <GlassCard className="mb-6 p-4">
          <h2 className="text-xl text-white mb-4 font-bold">
            {editingId ? 'Editar Estudiante' : 'Agregar Estudiante'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              value={formData.fechaNacimiento}
              onChange={(e) => setFormData({...formData, fechaNacimiento: e.target.value})}
              className="p-2 rounded bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-white/40 text-sm"
              required
            />
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 rounded"
              >
                {editingId ? 'Actualizar' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500/50 hover:bg-gray-600/50 text-white font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {estudiantes.length === 0 ? (
          <div className="col-span-full text-center text-white/60 py-8">
            <div className="text-4xl mb-2">👨‍🎓</div>
            No hay estudiantes registrados
          </div>
        ) : (
          estudiantes.map((estudiante) => (
            <GlassCard key={estudiante.id} className="p-3">
              <div className="flex justify-between items-start mb-2">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg">
                  👤
                </div>
                <div className="flex gap-1">
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
              </div>
              <h3 className="text-sm font-bold text-white mb-1 line-clamp-1">
                {estudiante.nombre} {estudiante.apellido}
              </h3>
              <p className="text-xs text-white/70 mb-1">RUT: {estudiante.rut}</p>
              <div className="space-y-1 text-xs text-white/80">
                <p className="flex items-center gap-1">📚 {estudiante.curso}</p>
                <p className="line-clamp-1">📧  {estudiante.email}</p>
                <p className="flex items-center gap-1">📱 {estudiante.telefono}</p>
                <p className="flex items-center gap-1">🎂 {new Date(estudiante.fechaNacimiento).toLocaleDateString('es-CL')}</p>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};

export default Estudiantes;