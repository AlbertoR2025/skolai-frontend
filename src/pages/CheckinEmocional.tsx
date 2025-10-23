import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import GlassCard from '../components/GlassCard';

const CheckinEmocional: React.FC = () => {
  const [pasoActual, setPasoActual] = useState(1);
  const [nombreEstudiante, setNombreEstudiante] = useState('');
  const [selectedEmocion, setSelectedEmocion] = useState<{ nombre: string; emoji: string; color: string } | null>(null);
  const [respuesta, setRespuesta] = useState('');
  const [checkins, setCheckins] = useState<any[]>([]);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const emociones = [
    { nombre: 'Enojado', emoji: '😡', color: 'from-red-500 to-orange-500', descripcion: 'Frustrado o molesto' },
    { nombre: 'Ansioso', emoji: '😰', color: 'from-purple-500 to-indigo-500', descripcion: 'Nervioso o preocupado' },
    { nombre: 'Normal', emoji: '😐', color: 'from-blue-500 to-cyan-500', descripcion: 'Tranquilo y estable' },
    { nombre: 'Bien', emoji: '😊', color: 'from-green-500 to-emerald-500', descripcion: 'Contento y positivo' },
    { nombre: 'Muy Feliz', emoji: '😄', color: 'from-yellow-500 to-amber-500', descripcion: 'Excelente y energético' }
  ];

  // Cargar datos desde Supabase
  useEffect(() => {
    const loadCheckins = async () => {
      try {
        const { data, error } = await supabase
          .from('Checkins')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) {
          const formatted = data.map((item: any) => ({
            id: item.id.toString(),
            estudianteNombre: item.estudiante_nombre,
            fecha: item.fecha,
            emocion: item.emocion,
            emocionEmoji: item.emocion_emoji,
            respuesta: item.respuesta || ''
          }));
          setCheckins(formatted);
        }
      } catch (error) {
        console.error('Error:', error);
        setCheckins([]);
      } finally {
        setLoading(false);
      }
    };

    loadCheckins();

    // Suscripción en tiempo real
    const channel = supabase
      .channel('checkins-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Checkins' }, 
        async (payload) => {
          const { data } = await supabase.from('Checkins').select('*').order('created_at', { ascending: false });
          if (data) {
            const formatted = data.map((item: any) => ({
              id: item.id.toString(),
              estudianteNombre: item.estudiante_nombre,
              fecha: item.fecha,
              emocion: item.emocion,
              emocionEmoji: item.emocion_emoji,
              respuesta: item.respuesta || ''
            }));
            setCheckins(formatted);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSubmit = async () => {
    if (!selectedEmocion || !nombreEstudiante.trim()) {
      alert('Por favor completa todos los pasos.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('Checkins').insert([{
        estudiante_nombre: nombreEstudiante.trim(),
        emocion: selectedEmocion.nombre,
        emocion_emoji: selectedEmocion.emoji,
        respuesta: respuesta.trim(),
        fecha: new Date().toISOString()
      }]);

      if (error) throw error;

      // Reset después de éxito
      setPasoActual(1);
      setNombreEstudiante('');
      setSelectedEmocion(null);
      setRespuesta('');
      
      alert(`🎉 ¡Gracias! Tu emoción ${selectedEmocion.emoji} ha sido registrada.`);

    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSiguientePaso = () => {
    if (pasoActual === 1 && !nombreEstudiante.trim()) {
      alert('Por favor ingresa tu nombre.');
      return;
    }
    if (pasoActual === 2 && !selectedEmocion) {
      alert('Por favor selecciona una emoción.');
      return;
    }
    setPasoActual(pasoActual + 1);
  };

  const handleAnteriorPaso = () => setPasoActual(pasoActual - 1);
  const toggleHistorial = () => setMostrarHistorial(!mostrarHistorial);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 p-4 lg:ml-64 ml-0 pt-16 lg:pt-8 flex items-center justify-center">
        <div className="text-center text-white text-xl">Cargando check-ins...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 p-4 lg:ml-64 ml-0 pt-16 lg:pt-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header estilo Dashboard */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Check-in Emocional</h1>
          <p className="text-white/70">Expresa cómo te sientes hoy</p>
        </div>

        {/* Cards de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">{checkins.length}</div>
            <div className="text-white/80">Total Check-ins</div>
          </GlassCard>
          
          <GlassCard className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {checkins.filter(c => ['Bien', 'Muy Feliz'].includes(c.emocion)).length}
            </div>
            <div className="text-white/80">Emociones Positivas</div>
          </GlassCard>
          
          <GlassCard className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {checkins.filter(c => c.emocion === 'Normal').length}
            </div>
            <div className="text-white/80">Estado Neutral</div>
          </GlassCard>
          
          <GlassCard className="text-center">
            <div className="text-3xl font-bold text-red-400 mb-2">
              {checkins.filter(c => ['Enojado', 'Ansioso'].includes(c.emocion)).length}
            </div>
            <div className="text-white/80">Necesita Atención</div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel principal */}
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              {/* Progreso mejorado */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  {[1, 2, 3, 4].map((paso) => (
                    <div key={paso} className="flex flex-col items-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 ${
                        pasoActual >= paso 
                          ? 'bg-purple-600 shadow-lg shadow-purple-500/25' 
                          : 'bg-white/10 border border-white/20'
                      }`}>
                        {pasoActual > paso ? '✓' : paso}
                      </div>
                      <span className="text-white/60 text-xs mt-2 text-center">
                        {['Identificación', 'Emoción', 'Reflexión', 'Confirmación'][paso-1]}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-600 transition-all duration-500"
                    style={{ width: `${((pasoActual - 1) / 3) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Contenido de pasos */}
              <div className="space-y-6">
                {/* Paso 1: Nombre */}
                {pasoActual === 1 && (
                  <div className="text-center space-y-6">
                    <div className="w-16 h-16 mx-auto bg-purple-600 rounded-full flex items-center justify-center text-2xl">
                      👤
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">¿Quién eres?</h2>
                      <p className="text-white/60">Comienza identificándote</p>
                    </div>
                    <input
                      type="text"
                      placeholder="Ingresa tu nombre completo..."
                      value={nombreEstudiante}
                      onChange={(e) => setNombreEstudiante(e.target.value)}
                      className="w-full p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
                    />
                  </div>
                )}

                {/* Paso 2: Emociones */}
                {pasoActual === 2 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-white mb-2">¿Cómo te sientes hoy?</h2>
                      <p className="text-white/60">Selecciona tu emoción actual</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {emociones.map((emocion, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedEmocion(emocion)}
                          className={`p-4 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                            selectedEmocion?.nombre === emocion.nombre
                              ? `bg-gradient-to-r ${emocion.color} shadow-lg scale-105 border-2 border-white/20`
                              : 'bg-white/10 hover:bg-white/15 border border-white/10'
                          }`}
                        >
                          <div className="text-3xl mb-2">{emocion.emoji}</div>
                          <div className="text-white font-medium text-sm">{emocion.nombre}</div>
                          <div className="text-white/50 text-xs mt-1">{emocion.descripcion}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Paso 3: Reflexión */}
                {pasoActual === 3 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-white mb-2">Reflexión del día</h2>
                      <p className="text-white/60">Comparte tus pensamientos (opcional)</p>
                    </div>
                    <textarea
                      placeholder="¿Qué te hace sentir así hoy?..."
                      value={respuesta}
                      onChange={(e) => setRespuesta(e.target.value)}
                      rows={6}
                      className="w-full p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400 resize-none"
                    />
                  </div>
                )}

                {/* Paso 4: Confirmación */}
                {pasoActual === 4 && (
                  <div className="text-center space-y-6">
                    <div className={`w-16 h-16 mx-auto bg-purple-600 rounded-full flex items-center justify-center text-2xl ${
                      isSubmitting ? 'animate-pulse' : ''
                    }`}>
                      {isSubmitting ? '⏳' : '✓'}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-4">
                        {isSubmitting ? 'Guardando...' : '¡Todo listo!'}
                      </h2>
                      {!isSubmitting && (
                        <div className="bg-white/10 rounded-lg p-6 space-y-3 text-left">
                          <div className="flex justify-between">
                            <span className="text-white/60">Estudiante:</span>
                            <span className="text-white font-medium">{nombreEstudiante}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Emoción:</span>
                            <span className="text-white font-medium flex items-center gap-2">
                              {selectedEmocion?.emoji} {selectedEmocion?.nombre}
                            </span>
                          </div>
                          {respuesta && (
                            <div>
                              <span className="text-white/60">Reflexión:</span>
                              <p className="text-white font-medium mt-1 bg-white/5 rounded p-2">"{respuesta}"</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Navegación */}
                <div className="flex justify-between pt-6 border-t border-white/10">
                  {pasoActual > 1 && (
                    <button
                      onClick={handleAnteriorPaso}
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 disabled:opacity-50"
                    >
                      ← Anterior
                    </button>
                  )}
                  <div className="flex-1" />
                  {pasoActual < 4 ? (
                    <button
                      onClick={handleSiguientePaso}
                      className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all duration-300"
                    >
                      Continuar →
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Guardando...
                        </>
                      ) : (
                        '📝 Enviar Check-in'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            <button
              onClick={toggleHistorial}
              className="w-full p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >
              {mostrarHistorial ? '👁️ Ocultar Historial' : '📖 Ver Historial'}
            </button>

            {/* Estadísticas rápidas */}
            <GlassCard className="p-4">
              <h3 className="text-white font-bold mb-3">Resumen Hoy</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-white/70">
                  <span>Total:</span>
                  <span className="text-white">{checkins.length}</span>
                </div>
                <div className="flex justify-between text-green-400">
                  <span>Positivos:</span>
                  <span>{checkins.filter(c => ['Bien', 'Muy Feliz'].includes(c.emocion)).length}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>Atención:</span>
                  <span>{checkins.filter(c => ['Enojado', 'Ansioso'].includes(c.emocion)).length}</span>
                </div>
              </div>
            </GlassCard>

            {/* Historial */}
            {mostrarHistorial && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {checkins.length === 0 ? (
                  <GlassCard>
                    <div className="text-center py-8 text-white/70">
                      <div className="text-3xl mb-2">📝</div>
                      <p>No hay check-ins aún</p>
                    </div>
                  </GlassCard>
                ) : (
                  checkins.map((checkin) => (
                    <GlassCard key={checkin.id} className="p-4 border-l-4 border-purple-500">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{checkin.emocionEmoji}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-1">
                            <h4 className="text-white font-semibold truncate">{checkin.estudianteNombre}</h4>
                            <span className="text-white/50 text-xs">
                              {new Date(checkin.fecha).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-white/70 text-sm mb-2">{checkin.emocion}</p>
                          {checkin.respuesta && (
                            <p className="text-white/60 text-sm italic">"{checkin.respuesta}"</p>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckinEmocional;