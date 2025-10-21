import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';

interface Incidente {
  id: string;
  fecha: string;
  estudianteNombre: string;
  tipo: 'leve' | 'grave' | 'muy-grave';
  categoria: string;
  descripcion: string;
  accionTomada: string;
  estado: 'pendiente' | 'en-proceso' | 'resuelto';
}

const Convivencia: React.FC = () => {
  const [incidentes, setIncidentes] = useState<Incidente[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    estudianteNombre: '',
    tipo: 'leve' as 'leve' | 'grave' | 'muy-grave',
    categoria: '',
    descripcion: '',
    accionTomada: '',
    estado: 'pendiente' as 'pendiente' | 'en-proceso' | 'resuelto'
  });

  // Cargar incidentes desde LocalStorage al iniciar
  useEffect(() => {
    const savedIncidentes = localStorage.getItem('skolai_incidentes');
    if (savedIncidentes) {
      setIncidentes(JSON.parse(savedIncidentes));
    }
  }, []);

  // Guardar incidentes en LocalStorage cada vez que cambien
  useEffect(() => {
    localStorage.setItem('skolai_incidentes', JSON.stringify(incidentes));
  }, [incidentes]);

  const categorias = [
    'Bullying',
    'Conflicto entre pares',
    'Agresión física',
    'Agresión verbal',
    'Uso indebido de tecnología',
    'Falta de respeto al docente',
    'Bajo rendimiento emocional',
    'Problema familiar',
    'Otro'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newIncidente: Incidente = {
      id: Date.now().toString(),
      fecha: new Date().toISOString(),
      ...formData
    };
    setIncidentes([newIncidente, ...incidentes]);
    setFormData({
      estudianteNombre: '',
      tipo: 'leve',
      categoria: '',
      descripcion: '',
      accionTomada: '',
      estado: 'pendiente'
    });
    setShowForm(false);
    alert('✅ Incidente registrado exitosamente');
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este incidente?')) return;
    setIncidentes(incidentes.filter(inc => inc.id !== id));
    alert('✅ Incidente eliminado');
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'leve': return 'bg-yellow-500/50';
      case 'grave': return 'bg-orange-500/50';
      case 'muy-grave': return 'bg-red-500/50';
      default: return 'bg-gray-500/50';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-red-500/30 text-red-100';
      case 'en-proceso': return 'bg-yellow-500/30 text-yellow-100';
      case 'resuelto': return 'bg-green-500/30 text-green-100';
      default: return 'bg-gray-500/30';
    }
  };

  const stats = {
    total: incidentes.length,
    pendientes: incidentes.filter(i => i.estado === 'pendiente').length,
    graves: incidentes.filter(i => i.tipo === 'grave' || i.tipo === 'muy-grave').length
  };

  return (
  <div className="flex flex-col gap-4 mb-8">
  <div className="flex items-center gap-3">
    <span className="text-5xl">🛡️</span>
    <h1 className="text-3xl lg:text-4xl font-bold text-white">Convivencia</h1>
  </div>
  <button
    onClick={() => setShowModal(true)}
    className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg w-full lg:w-auto lg:self-start"
  >
    <span className="text-xl">➕</span>
    <span>Nuevo Incidente</span>
  </button>
</div>


      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <GlassCard>
          <h3 className="text-white/70 mb-2">Total Incidentes</h3>
          <p className="text-4xl font-bold text-white">{stats.total}</p>
        </GlassCard>
        <GlassCard>
          <h3 className="text-white/70 mb-2">⚠️ Pendientes</h3>
          <p className="text-4xl font-bold text-yellow-300">{stats.pendientes}</p>
        </GlassCard>
        <GlassCard>
          <h3 className="text-white/70 mb-2">🚨 Graves</h3>
          <p className="text-4xl font-bold text-red-300">{stats.graves}</p>
        </GlassCard>
      </div>

      {/* Formulario */}
      {showForm && (
        <GlassCard className="mb-8">
          <h2 className="text-2xl text-white mb-4 font-bold">Nuevo Incidente</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Nombre del estudiante"
              value={formData.estudianteNombre}
              onChange={(e) => setFormData({...formData, estudianteNombre: e.target.value})}
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-white/60"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({...formData, tipo: e.target.value as any})}
                className="p-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none"
                required
              >
                <option value="leve">⚠️ Leve</option>
                <option value="grave">🔴 Grave</option>
                <option value="muy-grave">🚨 Muy Grave</option>
              </select>

              <select
                value={formData.categoria}
                onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                className="p-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none"
                required
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <textarea
              placeholder="Descripción del incidente"
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none h-24 resize-none"
              required
            />

            <textarea
              placeholder="Acción tomada o protocolo aplicado"
              value={formData.accionTomada}
              onChange={(e) => setFormData({...formData, accionTomada: e.target.value})}
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none h-20 resize-none"
              required
            />

            <select
              value={formData.estado}
              onChange={(e) => setFormData({...formData, estado: e.target.value as any})}
              className="w-full p-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none"
              required
            >
              <option value="pendiente">🔴 Pendiente</option>
              <option value="en-proceso">🟡 En Proceso</option>
              <option value="resuelto">🟢 Resuelto</option>
            </select>

            <button
              type="submit"
              className="w-full bg-white/30 hover:bg-white/40 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
            >
              💾 Registrar Incidente
            </button>
          </form>
        </GlassCard>
      )}

      {/* Lista de Incidentes */}
      <div className="space-y-4">
        {incidentes.length === 0 ? (
          <GlassCard>
            <div className="text-center text-white/60 py-12">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-lg">No hay incidentes registrados. ¡Excelente convivencia escolar!</p>
            </div>
          </GlassCard>
        ) : (
          incidentes.map((incidente) => (
            <GlassCard key={incidente.id}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{incidente.estudianteNombre}</h3>
                  <p className="text-white/60 text-sm">
                    {new Date(incidente.fecha).toLocaleDateString('es-CL', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <span className={`px-3 py-1 rounded-full text-white text-sm ${getTipoColor(incidente.tipo)}`}>
                    {incidente.tipo}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${getEstadoColor(incidente.estado)}`}>
                    {incidente.estado}
                  </span>
                  <button
                    onClick={() => handleDelete(incidente.id)}
                    className="bg-red-500/50 hover:bg-red-600/50 text-white font-bold py-1 px-3 rounded-lg transition text-sm ml-2"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-white/80">
                <p><strong className="text-white">Categoría:</strong> {incidente.categoria}</p>
                <p><strong className="text-white">Descripción:</strong> {incidente.descripcion}</p>
                <p><strong className="text-white">Acción Tomada:</strong> {incidente.accionTomada}</p>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};

export default Convivencia;
