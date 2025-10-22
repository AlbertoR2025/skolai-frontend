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
    { nombre: 'Enojado', emoji: '😡', color: 'from-orange-500 to-red-500', descripcion: 'Frustrado o molesto' },
    { nombre: 'Ansioso', emoji: '😰', color: 'from-purple-500 to-indigo-500', descripcion: 'Nervioso o preocupado' },
    { nombre: 'Normal', emoji: '😐', color: 'from-blue-500 to-cyan-500', descripcion: 'Tranquilo y estable' },
    { nombre: 'Bien', emoji: '😊', color: 'from-green-500 to-emerald-500', descripcion: 'Contento y positivo' },
    { nombre: 'Muy Feliz', emoji: '😄', color: 'from-yellow-500 to-orange-400', descripcion: 'Excelente y energético' }
  ];

  // Cargar datos SOLO desde Supabase
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 lg:ml-64 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 lg:ml-64">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-orange-500/20"></div>
        <div className="relative z-10 p-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
            🌈 Check-in Emocional SKOLAI
          </h1>
          <p className="text-white/70 text-lg">Tu espacio seguro para expresar emociones</p>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Progreso */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((paso) => (
              <div key={paso} className="flex flex-col items-center flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 ${
                  pasoActual >= paso 
                    ? 'bg-gradient-to-r from-purple-500 to-orange-500 shadow-lg shadow-purple-500/25' 
                    : 'bg-white/10 border border-white/20'
                }`}>
                  {pasoActual > paso ? '✓' : paso}
                </div>
                <span className="text-white/60 text-sm mt-2">
                  {['Identificación', 'Emoción', 'Reflexión', 'Confirmación'][paso-1]}
                </span>
              </div>
            ))}
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-orange-500 transition-all duration-500"
              style={{ width: `${((pasoActual - 1) / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel de Pasos */}
          <div className="lg:col-span-2">
            <GlassCard className="relative overflow-hidden border border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-orange-500/5"></div>
              <div className="relative z-10 space-y-8">
                {/* Paso 1: Nombre */}
                {pasoActual === 1 && (
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-orange-500 rounded-full flex items-center justify-center text-3xl">
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
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
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
                          className={`p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                            selectedEmocion?.nombre === emocion.nombre
                              ? `bg-gradient-to-r ${emocion.color} shadow-lg scale-105 border-2 border-white/20`
                              : 'bg-white/5 hover:bg-white/10 border border-white/10'
                          }`}
                        >
                          <div className="text-4xl mb-2">{emocion.emoji}</div>
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
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                    />
                  </div>
                )}

                {/* Paso 4: Confirmación */}
                {pasoActual === 4 && (
                  <div className="text-center space-y-6">
                    <div className={`w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-orange-500 rounded-full flex items-center justify-center text-3xl ${
                      isSubmitting ? 'animate-pulse' : ''
                    }`}>
                      {isSubmitting ? '⏳' : '✓'}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-4">
                        {isSubmitting ? 'Guardando...' : '¡Todo listo!'}
                      </h2>
                      {!isSubmitting && (
                        <div className="bg-white/5 rounded-xl p-6 space-y-3 text-left">
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
                            <div className="flex justify-between">
                              <span className="text-white/60">Reflexión:</span>
                              <span className="text-white font-medium text-right max-w-xs">"{respuesta}"</span>
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
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 disabled:opacity-50"
                    >
                      ← Anterior
                    </button>
                  )}
                  <div className="flex-1" />
                  {pasoActual < 4 ? (
                    <button
                      onClick={handleSiguientePaso}
                      className="px-8 py-3 bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-purple-500/25"
                    >
                      Continuar →
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-green-500/25 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Guardando...
                        </>
                      ) : (
                        '🚀 Enviar Check-in'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            <button
              onClick={toggleHistorial}
              className="w-full p-4 bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-3"
            >
              {mostrarHistorial ? '👁️ Ocultar Historial' : '📖 Ver Historial'}
            </button>

            <GlassCard compact>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-white/70">Conectado en tiempo real</span>
              </div>
            </GlassCard>

            {/* Historial */}
            {mostrarHistorial && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {checkins.length === 0 ? (
                  <GlassCard>
                    <div className="text-center py-8 text-white/60">
                      <div className="text-4xl mb-2">📝</div>
                      <p>No hay check-ins aún</p>
                    </div>
                  </GlassCard>
                ) : (
                  checkins.map((checkin) => (
                    <GlassCard key={checkin.id} compact className="transition-all duration-300 hover:scale-105 border border-white/5">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{checkin.emocionEmoji}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-1">
                            <h4 className="text-white font-semibold truncate text-sm">{checkin.estudianteNombre}</h4>
                            <span className="text-white/50 text-xs">
                              {new Date(checkin.fecha).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-white/70 text-xs mb-2">{checkin.emocion}</p>
                          {checkin.respuesta && (
                            <p className="text-white/60 text-xs italic bg-white/5 rounded-lg p-2">"{checkin.respuesta}"</p>
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