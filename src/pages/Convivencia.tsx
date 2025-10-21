import { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';

interface Incidente {
  id: number;
  estudianteNombre: string;
  tipo: string;
  categoria: string;
  descripcion: string;
  accionTomada: string;
  fecha: string;
  estado: string;
}

const Convivencia = () => {
  const [incidentes, setIncidentes] = useState<Incidente[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    estudianteNombre: '',
    tipo: 'Leve',
    categoria: '',
    descripcion: '',
    accionTomada: '',
    fecha: new Date().toISOString().slice(0, 16),
    estado: 'Pendiente',
  });

  useEffect(() => {
    const stored = localStorage.getItem('skolai_incidentes');
    if (stored) {
      setIncidentes(JSON.parse(stored));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nuevoIncidente = {
      ...formData,
      id: Date.now(),
    };
    const nuevosIncidentes = [nuevoIncidente, ...incidentes];
    setIncidentes(nuevosIncidentes);
    localStorage.setItem('skolai_incidentes', JSON.stringify(nuevosIncidentes));
    setShowModal(false);
    resetForm();
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de eliminar este incidente?')) {
      const nuevosIncidentes = incidentes.filter(inc => inc.id !== id);
      setIncidentes(nuevosIncidentes);
      localStorage.setItem('skolai_incidentes', JSON.stringify(nuevosIncidentes));
    }
  };

  const resetForm = () => {
    setFormData({
      estudianteNombre: '',
      tipo: 'Leve',
      categoria: '',
      descripcion: '',
      accionTomada: '',
      fecha: new Date().toISOString().slice(0, 16),
      estado: 'Pendiente',
    });
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Leve': return 'bg-yellow-500/50';
      case 'Moderado': return 'bg-orange-500/50';
      case 'Grave': return 'bg-red-500/50';
      default: return 'bg-gray-500/50';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Pendiente': return 'bg-yellow-600/50 text-white';
      case 'En Proceso': return 'bg-blue-600/50 text-white';
      case 'Resuelto': return 'bg-green-600/50 text-white';
      default: return 'bg-gray-600/50 text-white';
    }
  };

  const stats = {
    total: incidentes.length,
    pendientes: incidentes.filter(i => i.estado === 'Pendiente').length,
    graves: incidentes.filter(i => i.tipo === 'Grave').length,
  };

  return (
    <div className="lg:ml-64 ml-0 p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center gap-3">
          <span className="text-5xl">⚖️</span>
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
          <p className="text-4xl font-bold text-yellow-400">{stats.pendientes}</p>
        </GlassCard>
        <GlassCard>
          <h3 className="text-white/70 mb-2">🚨 Graves</h3>
          <p className="text-4xl font-bold text-red-400">{stats.graves}</p>
        </GlassCard>
      </div>

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
              <div className="space-y-2 text-white/80 text-sm">
                <p><strong>Categoría:</strong> {incidente.categoria}</p>
                <p><strong>Descripción:</strong> {incidente.descripcion}</p>
                <p><strong>Acción Tomada:</strong> {incidente.accionTomada}</p>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-yellow-900/90 to-orange-900/90 backdrop-blur-md rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6">➕ Nuevo Incidente</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Nombre del Estudiante</label>
                <input
                  type="text"
                  value={formData.estudianteNombre}
                  onChange={(e) => setFormData({ ...formData, estudianteNombre: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2">Tipo</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="Leve" className="bg-yellow-900">Leve</option>
                    <option value="Moderado" className="bg-orange-900">Moderado</option>
                    <option value="Grave" className="bg-red-900">Grave</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white mb-2">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="Pendiente" className="bg-yellow-900">Pendiente</option>
                    <option value="En Proceso" className="bg-blue-900">En Proceso</option>
                    <option value="Resuelto" className="bg-green-900">Resuelto</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-white mb-2">Categoría</label>
                <input
                  type="text"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Ej: Conflicto entre pares, falta de respeto, etc."
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2">Fecha y Hora</label>
                <input
                  type="datetime-local"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2">Descripción del Incidente</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2">Acción Tomada</label>
                <textarea
                  value={formData.accionTomada}
                  onChange={(e) => setFormData({ ...formData, accionTomada: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  rows={3}
                  required
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-3 rounded-lg transition duration-200"
                >
                  Guardar
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

export default Convivencia;
