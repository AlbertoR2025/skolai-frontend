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
  <div className="flex flex-col gap-4 mb-8">
  <div className="flex items-center gap-3">
    <span className="text-5xl">👨‍🎓</span>
    <h1 className="text-3xl lg:text-4xl font-bold text-white">Estudiantes</h1>
  </div>
  <button
    onClick={() => setShowModal(true)}
    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg w-full lg:w-auto lg:self-start"
  >
    <span className="text-xl">➕</span>
    <span>Nuevo Estudiante</span>
  </button>
</div>


      {showForm && (
        <GlassCard className="mb-8">
          <h2 className="text-2xl text-white mb-4 font-bold">
            {editingId ? '✏️ Editar Estudiante' : '➕ Agregar Estudiante'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="RUT (ej: 12.345.678-9)"
              value={formData.rut}
              onChange={(e) => setFormData({...formData, rut: e.target.value})}
              className="p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-white/60"
              required
            />
            <input
              type="text"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className="p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-white/60"
              required
            />
            <input
              type="text"
              placeholder="Apellido"
              value={formData.apellido}
              onChange={(e) => setFormData({...formData, apellido: e.target.value})}
              className="p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-white/60"
              required
            />
            <input
              type="text"
              placeholder="Curso (ej: 4° Básico A)"
              value={formData.curso}
              onChange={(e) => setFormData({...formData, curso: e.target.value})}
              className="p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-white/60"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-white/60"
              required
            />
            <input
              type="tel"
              placeholder="Teléfono"
              value={formData.telefono}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              className="p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-white/60"
              required
            />
            <input
              type="date"
              value={formData.fechaNacimiento}
              onChange={(e) => setFormData({...formData, fechaNacimiento: e.target.value})}
              className="p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-white/60"
              required
            />
            <div className="md:col-span-2 flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-green-500/50 hover:bg-green-600/50 text-white font-bold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-105"
              >
                {editingId ? '💾 Actualizar' : '💾 Guardar'}
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
        {estudiantes.length === 0 ? (
          <div className="col-span-full text-center text-white/60 text-lg py-12">
            <div className="text-6xl mb-4">👨‍🎓</div>
            No hay estudiantes registrados. ¡Agrega el primero!
          </div>
        ) : (
          estudiantes.map((estudiante) => (
            <GlassCard key={estudiante.id}>
              <div className="flex items-start justify-between mb-3">
                <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center text-3xl">
                  👤
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(estudiante)}
                    className="bg-blue-500/50 hover:bg-blue-600/50 text-white font-bold py-1 px-3 rounded-lg transition text-sm"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(estudiante.id)}
                    className="bg-red-500/50 hover:bg-red-600/50 text-white font-bold py-1 px-3 rounded-lg transition text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">
                {estudiante.nombre} {estudiante.apellido}
              </h3>
              <p className="text-white/70 text-sm mb-2">RUT: {estudiante.rut}</p>
              <div className="space-y-1 text-white/80 text-sm">
                <p>📚 {estudiante.curso}</p>
                <p>📧 {estudiante.email}</p>
                <p>📱 {estudiante.telefono}</p>
                <p>🎂 {new Date(estudiante.fechaNacimiento + 'T00:00:00').toLocaleDateString('es-CL')}</p>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};

export default Estudiantes;
