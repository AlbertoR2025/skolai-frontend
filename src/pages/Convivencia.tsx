import { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import { supabase } from '../lib/supabase';

const Convivencia = () => {
  const [incidentes, setIncidentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  const [formData, setFormData] = useState({
    estudiante_nombre: '',
    tipo: '',
    categoria: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  // Verificar conexión con Supabase
  const checkSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('count')
        .limit(1);

      if (error) {
        console.error('❌ Supabase connection error:', error);
        setSupabaseConnected(false);
      } else {
        console.log('✅ Supabase connected successfully');
        setSupabaseConnected(true);
      }
    } catch (err) {
      console.error('❌ Connection check failed:', err);
      setSupabaseConnected(false);
    }
  };

  // Fetch mejorado
  const fetchIncidentes = async () => {
    try {
      console.log('🔄 Fetching incidents...');
      
      // Siempre cargar desde localStorage primero para respuesta inmediata
      const localStr = localStorage.getItem('skolai_incidentes') || '[]';
      const localData = JSON.parse(localStr);
      setIncidentes(localData);

      // Luego intentar sincronizar con Supabase
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase fetch error:', error);
        // Mantener datos locales
      } else {
        console.log('✅ Supabase fetch OK, rows:', data?.length || 0);
        if (data && data.length > 0) {
          setIncidentes(data);
          localStorage.setItem('skolai_incidentes', JSON.stringify(data));
        }
      }
    } catch (err) {
      console.error('❌ Fetch total error:', err);
      // Mantener datos locales
      const localStr = localStorage.getItem('skolai_incidentes') || '[]';
      const localData = JSON.parse(localStr);
      setIncidentes(localData);
    }
  };

  useEffect(() => {
    checkSupabaseConnection();
    fetchIncidentes();
    const interval = setInterval(fetchIncidentes, 15000);
    return () => clearInterval(interval);
  }, []);

  // Submit funcional - SIN CAMBIOS
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación
    if (!formData.estudiante_nombre?.trim() || 
        !formData.tipo || 
        !formData.categoria || 
        !formData.descripcion?.trim() || 
        formData.descripcion.length < 5) {
      alert('❌ Por favor completa todos los campos (descripción mínimo 5 caracteres)');
      return;
    }

    setLoading(true);

    // Crear nuevo incidente
    const nuevoIncidente = {
      id: Date.now().toString(), // ID local único
      estudiante_nombre: formData.estudiante_nombre.trim(),
      tipo: formData.tipo,
      categoria: formData.categoria,
      descripcion: formData.descripcion.trim(),
      fecha: `${formData.fecha}T00:00:00.000Z`,
      accion_tomada: null,
      resolved: false,
      created_at: new Date().toISOString()
    };

    console.log('➕ Nuevo incidente:', nuevoIncidente);

    let supabaseSuccess = false;

    // Intentar guardar en Supabase solo si está conectado
    if (supabaseConnected) {
      try {
        console.log('☁️ Intentando guardar en Supabase...');
        const { data, error } = await supabase
          .from('incidents')
          .insert([{
            estudiante_nombre: nuevoIncidente.estudiante_nombre,
            tipo: nuevoIncidente.tipo,
            categoria: nuevoIncidente.categoria,
            descripcion: nuevoIncidente.descripcion,
            fecha: nuevoIncidente.fecha,
            accion_tomada: null,
            resolved: false,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) {
          console.error('❌ Error Supabase:', error);
        } else {
          console.log('✅ Supabase insert OK:', data);
          nuevoIncidente.id = data.id; // Usar ID de Supabase
          supabaseSuccess = true;
        }
      } catch (err) {
        console.error('❌ Error en insert Supabase:', err);
      }
    }

    // Guardar en localStorage SIEMPRE
    try {
      const localStr = localStorage.getItem('skolai_incidentes') || '[]';
      const localData = JSON.parse(localStr);
      const nuevosIncidentes = [nuevoIncidente, ...localData];
      localStorage.setItem('skolai_incidentes', JSON.stringify(nuevosIncidentes));
      setIncidentes(nuevosIncidentes);
      console.log('📱 Local storage actualizado:', nuevosIncidentes.length);
    } catch (lsErr) {
      console.error('❌ Error en localStorage:', lsErr);
    }

    // Limpiar formulario
    setFormData({
      estudiante_nombre: '',
      tipo: '',
      categoria: '',
      descripcion: '',
      fecha: new Date().toISOString().split('T')[0]
    });

    setLoading(false);
    
    if (supabaseConnected && supabaseSuccess) {
      alert('✅ ¡Incidente guardado en Supabase y local!');
    } else if (supabaseConnected) {
      alert('✅ ¡Incidente guardado localmente (error en Supabase)!');
    } else {
      alert('✅ ¡Incidente guardado localmente!');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Función para formatear fecha
  const formatFecha = (fechaStr) => {
    try {
      return new Date(fechaStr).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return fechaStr;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 p-4 lg:ml-64 ml-0 pt-16 lg:pt-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header estilo Dashboard */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Convivencia Escolar</h1>
          <p className="text-white/70">Gestión de incidentes y convivencia escolar</p>
        </div>

        {/* Cards de estadísticas - SOLO DISEÑO */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">{incidentes.length}</div>
            <div className="text-white/80">Total Incidentes</div>
          </GlassCard>
          
          <GlassCard className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {incidentes.filter(inc => inc.categoria === 'Leve').length}
            </div>
            <div className="text-white/80">Incidentes Leves</div>
          </GlassCard>
          
          <GlassCard className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {incidentes.filter(inc => inc.categoria === 'Moderado').length}
            </div>
            <div className="text-white/80">Incidentes Moderados</div>
          </GlassCard>
          
          <GlassCard className="text-center">
            <div className="text-3xl font-bold text-red-400 mb-2">
              {incidentes.filter(inc => inc.categoria === 'Grave').length}
            </div>
            <div className="text-white/80">Incidentes Graves</div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario - SOLO DISEÑO CAMBIADO */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">Registrar Nuevo Incidente</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="estudiante_nombre"
                placeholder="Nombre del estudiante"
                value={formData.estudiante_nombre}
                onChange={handleChange}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
                required
              />

              <select 
                name="tipo" 
                value={formData.tipo} 
                onChange={handleChange}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                required
              >
                <option value="">Tipo de incidente</option>
                <option value="Falta de respeto">Falta de respeto</option>
                <option value="Pelea">Pelea</option>
                <option value="Robo">Robo</option>
                <option value="Acoso">Acoso</option>
                <option value="Vandalismo">Vandalismo</option>
                <option value="Otro">Otro</option>
              </select>

              <select 
                name="categoria" 
                value={formData.categoria} 
                onChange={handleChange}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                required
              >
                <option value="">Categoría</option>
                <option value="Leve">Leve</option>
                <option value="Moderado">Moderado</option>
                <option value="Grave">Grave</option>
              </select>

              <textarea
                name="descripcion"
                placeholder="Descripción del incidente (mínimo 5 caracteres)"
                value={formData.descripcion}
                onChange={handleChange}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 h-32 resize-none focus:outline-none focus:border-purple-400"
                required
                minLength={5}
              />

              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 transition-colors duration-200"
              >
                {loading ? 'Guardando...' : 'Registrar Incidente'}
              </button>
            </form>
          </GlassCard>

          {/* Lista de Incidentes - SOLO DISEÑO CAMBIADO */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">Lista de Incidentes</h3>
            
            {incidentes.length === 0 ? (
              <div className="text-center py-8 text-white/70">
                No hay incidentes registrados
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {incidentes.map((incidente) => (
                  <div 
                    key={incidente.id} 
                    className="bg-white/10 p-4 rounded-lg border-l-4 border-purple-500"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-white text-lg">{incidente.tipo}</h4>
                        <p className="text-white/80 text-sm">Estudiante: {incidente.estudiante_nombre}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-sm ${
                        incidente.categoria === 'Grave' ? 'bg-red-600' : 
                        incidente.categoria === 'Moderado' ? 'bg-yellow-600' : 'bg-green-600'
                      }`}>
                        {incidente.categoria}
                      </span>
                    </div>
                    <p className="text-white/80 mb-1">{incidente.descripcion}</p>
                    <div className="flex justify-between text-white/70 text-sm">
                      <span>Fecha: {formatFecha(incidente.fecha)}</span>
                      <span>Estado: {incidente.resolved ? 'Resuelto' : 'Pendiente'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Convivencia;