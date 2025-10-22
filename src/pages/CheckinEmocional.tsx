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

  // Emociones con la paleta SKOLAI (morados y naranjos)
  const emociones = [
    { 
      nombre: 'Enojado', 
      emoji: '😡',
      color: 'from-orange-500 to-red-500',
      descripcion: 'Frustrado o molesto'
    },
    { 
      nombre: 'Ansioso', 
      emoji: '😰',
      color: 'from-purple-500 to-indigo-500',
      descripcion: 'Nervioso o preocupado'
    },
    { 
      nombre: 'Normal', 
      emoji: '😐',
      color: 'from-blue-500 to-cyan-500',
      descripcion: 'Tranquilo y estable'
    },
    { 
      nombre: 'Bien', 
      emoji: '😊',
      color: 'from-green-500 to-emerald-500',
      descripcion: 'Contento y positivo'
    },
    { 
      nombre: 'Muy Feliz', 
      emoji: '😄',
      color: 'from-yellow-500 to-orange-400',
      descripcion: 'Excelente y energético'
    }
  ];

  // ✅ SUSCRIPCIÓN EN TIEMPO REAL MEJORADA
  useEffect(() => {
    let mounted = true;

    const loadCheckins = async () => {
      try {
        const { data, error } = await supabase
          .from('Checkins')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        if (mounted && data) {
          const formatted = data.map((item: any) => ({
            id: item.id.toString(),
            estudianteNombre: item.estudiante_nombre,
            fecha: item.fecha,
            emocion: item.emocion,
            emocionEmoji: item.emocion_emoji,
            respuesta: item.respuesta || ''
          }));
          setCheckins(formatted);
          console.log('✅ Checkins cargados:', formatted.length);
        }
      } catch (error) {
        console.error('Error cargando checkins:', error);
        // Fallback a localStorage solo si es necesario
        const saved = localStorage.getItem('skolai_checkins');
        if (saved && mounted) {
          setCheckins(JSON.parse(saved));
        }
      }
    };

    // Carga inicial
    loadCheckins();

    // ✅ SUSCRIPCIÓN EN TIEMPO REAL OPTIMIZADA
    const channel = supabase
      .channel('checkins-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Checkins',
        },
        (payload) => {
          if (mounted) {
            console.log('🔥 Nuevo checkin en tiempo real:', payload.new);
            setCheckins(current => {
              const newCheckin = {
                id: payload.new.id.toString(),
                estudianteNombre: payload.new.estudiante_nombre,
                fecha: payload.new.fecha,
                emocion: payload.new.emocion,
                emocionEmoji: payload.new.emocion_emoji,
                respuesta: payload.new.respuesta || ''
              };
              return [newCheckin, ...current];
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('🟢 Estado suscripción:', status);
      });

    // Cleanup
    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // ✅ SUBMIT OPTIMIZADO CON FEEDBACK VISUAL
  const handleSubmit = async () => {
    if (!selectedEmocion || !nombreEstudiante.trim()) {
      alert('Por favor completa todos los pasos.');
      return;
    }

    setIsSubmitting(true);

    const newCheckin = {
      id: Date.now().toString(),
      estudianteNombre: nombreEstudiante.trim(),
      fecha: new Date().toISOString(),
      emocion: selectedEmocion.nombre,
      emocionEmoji: selectedEmocion.emoji,
      respuesta: respuesta.trim()
    };

    try {
      // Insertar en Supabase (disparará la suscripción en tiempo real)
      const { error } = await supabase.from('Checkins').insert([{
        estudiante_nombre: newCheckin.estudianteNombre,
        emocion: newCheckin.emocion,
        emocion_emoji: newCheckin.emocionEmoji,
        respuesta: newCheckin.respuesta,
        fecha: newCheckin.fecha
      }]);

      if (error) throw error;

      console.log('✅ Checkin guardado en Supabase');

      // Feedback visual de éxito
      setTimeout(() => {
        setIsSubmitting(false);
        
        // Reset del formulario
        setPasoActual(1);
        setNombreEstudiante('');
        setSelectedEmocion(null);
        setRespuesta('');
        
        // Mensaje de confirmación
        alert(`🎉 ¡Gracias ${newCheckin.estudianteNombre}! Tu emoción ${newCheckin.emocionEmoji} ha sido registrada.`);
      }, 1000);

    } catch (error) {
      console.error('Error guardando checkin:', error);
      setIsSubmitting(false);
      alert('❌ Error al guardar. Por favor intenta nuevamente.');
    }
  };

  const handleSiguientePaso = () => {
    if (pasoActual === 1 && !nombreEstudiante.trim()) {
      alert('Por favor ingresa el nombre del estudiante.');
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

  const getHora = (fecha: string) => {
    return new Date(fecha).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 lg:ml-64">
      {/* Header SKOLAI Premium */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-orange-500/20"></div>
        <div className="relative z-10 p-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
            🌈 Check-in Emocional SKOLAI
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Tu espacio seguro para conectar y expresar emociones. Creado para tu bienestar.
          </p>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Progreso Visual Mejorado */}
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
                <span className="text-white/60 text-sm mt-2 text-center">
                  {paso === 1 && 'Identificación'}
                  {paso === 2 && 'Emoción'}
                  {paso === 3 && 'Reflexión'}
                  {paso === 4 && 'Confirmación'}
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
              {/* Efecto de fondo dinámico */}
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
                      <p className="text-white/60">Comienza identificándote para personalizar tu experiencia</p>
                    </div>
                    <input
                      type="text"
                      placeholder="Ingresa tu nombre completo..."
                      value={nombreEstudiante}
                      onChange={(e) => setNombreEstudiante(e.target.value)}
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                )}

                {/* Paso 2: Emociones */}
                {pasoActual === 2 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-white mb-2">¿Cómo te sientes hoy?</h2>
                      <p className="text-white/60">Selecciona la emoción que mejor describa tu estado actual</p>
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
                      <p className="text-white/60">Comparte lo que hay detrás de tu emoción (opcional)</p>
                    </div>
                    <textarea
                      placeholder="¿Qué te hace sentir así hoy? Comparte tus pensamientos..."
                      value={respuesta}
                      onChange={(e) => setRespuesta(e.target.value)}
                      rows={6}
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent resize-none transition-all duration-300"
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
                        {isSubmitting ? 'Guardando tu emoción...' : '¡Todo listo!'}
                      </h2>
                      {!isSubmitting && (
                        <div className="bg-white/5 rounded-xl p-6 space-y-3 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-white/60">Estudiante:</span>
                            <span className="text-white font-medium">{nombreEstudiante}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-white/60">Emoción:</span>
                            <span className="text-white font-medium flex items-center gap-2">
                              {selectedEmocion?.emoji} {selectedEmocion?.nombre}
                            </span>
                          </div>
                          {respuesta && (
                            <div className="flex items-start justify-between">
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
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Anterior
                    </button>
                  )}
                  <div className="flex-1" />
                  {pasoActual < 4 ? (
                    <button
                      onClick={handleSiguientePaso}
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/25 disabled:opacity-50"
                    >
                      Continuar →
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/25 disabled:opacity-50 flex items-center gap-2"
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

          {/* Panel Lateral - SIN CONTADOR */}
          <div className="space-y-6">
            {/* Botón Historial Mejorado */}
            <button
              onClick={toggleHistorial}
              className="w-full p-4 bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-3"
            >
              {mostrarHistorial ? '👁️ Ocultar Historial' : '📖 Ver Historial'}
            </button>

            {/* Estado de Conexión en Tiempo Real */}
            <GlassCard compact>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-white/70">Conectado en tiempo real</span>
              </div>
              <p className="text-white/50 text-xs mt-2">
                Los check-ins se sincronizan instantáneamente
              </p>
            </GlassCard>

            {/* Historial Premium */}
            {mostrarHistorial && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {checkins.length === 0 ? (
                  <GlassCard>
                    <div className="text-center py-8 text-white/60">
                      <div className="text-4xl mb-2">📝</div>
                      <p>Aún no hay check-ins registrados</p>
                      <p className="text-sm mt-2">Sé el primero en compartir</p>
                    </div>
                  </GlassCard>
                ) : (
                  checkins.map((checkin) => (
                    <GlassCard key={checkin.id} compact className="transform transition-all duration-300 hover:scale-105 border border-white/5">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl flex-shrink-0">
                          {checkin.emocionEmoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-white font-semibold truncate text-sm">
                              {checkin.estudianteNombre}
                            </h4>
                            <span className="text-white/50 text-xs">
                              {getHora(checkin.fecha)}
                            </span>
                          </div>
                          <p className="text-white/70 text-xs mb-2">
                            {checkin.emocion}
                          </p>
                          {checkin.respuesta && (
                            <p className="text-white/60 text-xs italic bg-white/5 rounded-lg p-2">
                              "{checkin.respuesta}"
                            </p>
                          )}
                          <p className="text-white/40 text-xs mt-2">
                            {new Date(checkin.fecha).toLocaleDateString('es-CL', {
                              day: '2-digit',
                              month: 'short'
                            })}
                          </p>
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