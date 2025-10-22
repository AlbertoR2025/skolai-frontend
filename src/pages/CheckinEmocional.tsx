import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import { supabase } from '../lib/supabase';  // 👈 Agregar import

interface CheckinRespuesta {
  id: string;
  estudianteNombre: string;
  fecha: string;
  emocion: string;
  emocionEmoji: string;
  respuesta: string;
}

const emociones = [
  { emoji: '😡', nombre: 'Enojado', color: 'from-red-400 to-red-600' },
  { emoji: '😰', nombre: 'Ansioso', color: 'from-orange-400 to-orange-600' },
  { emoji: '😐', nombre: 'Normal', color: 'from-gray-400 to-gray-600' },
  { emoji: '😊', nombre: 'Bien', color: 'from-green-400 to-green-600' },
  { emoji: '😄', nombre: 'Muy Feliz', color: 'from-yellow-400 to-yellow-600' },
];

const CheckinEmocional: React.FC = () => {
  const [checkins, setCheckins] = useState<CheckinRespuesta[]>([]);
  const [step, setStep] = useState(1);
  const [nombreEstudiante, setNombreEstudiante] = useState('');
  const [selectedEmocion, setSelectedEmocion] = useState<any>(null);
  const [respuesta, setRespuesta] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // Carga desde Supabase + fallback localStorage (reemplaza tu useEffect original)
  useEffect(() => {
    const loadCheckins = async () => {
      try {
        const { data, error } = await supabase
          .from('Checkins')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          // Formatear para tu interface original
          const formatted = data.map((item: any) => ({
            id: item.id.toString(),
            estudianteNombre: item.estudiante_nombre,
            fecha: item.fecha,
            emocion: item.emocion,
            emocionEmoji: item.emocion_emoji,
            respuesta: item.respuesta || ''
          }));
          setCheckins(formatted);
          localStorage.setItem('skolai_checkins', JSON.stringify(formatted));
          console.log(`✅ ${formatted.length} checkins cargados desde Supabase`);
          return;
        }
      } catch (error) {
        console.error('Error Supabase, usando localStorage:', error);
      }

      // Fallback original
      const saved = localStorage.getItem('skolai_checkins');
      if (saved) {
        setCheckins(JSON.parse(saved));
      }
    };

    loadCheckins();
  }, []);

  // Tu useEffect original para guardar en localStorage (mantener para fallback)
  useEffect(() => {
    localStorage.setItem('skolai_checkins', JSON.stringify(checkins));
  }, [checkins]);

  const handleEmocionSelect = (emocion: any) => {
    setSelectedEmocion(emocion);
    setStep(3);
  };

  // handleSubmit actualizado (agrega Supabase después de setCheckins)
  const handleSubmit = async () => {  // 👈 Cambiar a async
    if (!nombreEstudiante || !selectedEmocion) {
      alert('Por favor completa todos los campos');
      return;
    }

    const newCheckin: CheckinRespuesta = {
      id: Date.now().toString(),
      fecha: new Date().toISOString(),
      estudianteNombre: nombreEstudiante,
      emocion: selectedEmocion.nombre,
      emocionEmoji: selectedEmocion.emoji,
      respuesta: respuesta
    };
    
    setCheckins([newCheckin, ...checkins]);
    
    // 👈 Agregar Supabase aquí (después de setCheckins)
    try {
      await supabase.from('Checkins').insert([{
        estudiante_nombre: newCheckin.estudianteNombre,
        emocion: newCheckin.emocion,
        emocion_emoji: newCheckin.emocionEmoji,
        respuesta: newCheckin.respuesta,
        fecha: newCheckin.fecha
      }]);
      console.log('✅ Checkin guardado en Supabase');
    } catch (error) {
      console.error('Error Supabase insert:', error);
    }
    
    // Tu código original de análisis y alertas (mantener igual)
    const palabrasAlerta = ['mal', 'triste', 'solo', 'ayuda', 'miedo', 'no quiero'];
    const requiereAtencion = palabrasAlerta.some(palabra => 
      respuesta.toLowerCase().includes(palabra)
    ) || ['Enojado', 'Ansioso'].includes(selectedEmocion.nombre);  // Ajusté 'Triste' a 'Ansioso' si aplica
    
    if (requiereAtencion) {
      alert('⚠️ Hemos detectado que podrías necesitar apoyo. Un adulto se comunicará contigo pronto.');
    } else {
      alert('✅ ¡Gracias por compartir cómo te sientes! Tu bienestar es importante para nosotros 💙');
    }
    
    // Reset original
    setStep(1);
    setNombreEstudiante('');
    setSelectedEmocion(null);
    setRespuesta('');
    setRespuesta('');
  };

  const getHora = () => {
    const hora = new Date().getHours();
    if (hora < 12) return '¡Buenos Días!';
    if (hora < 20) return '¡Buenas Tardes!';
    return '¡Buenas Noches!';
  };

  // Tu JSX original (mantener todo igual - no cambies nada aquí)
  return (
    <div className="lg:ml-64 ml-0 p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">💙 Check-in Emocional</h1>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          {showHistory ? 'Nuevo Check-in' : 'Ver Historial'}
        </button>
      </div>

      {!showHistory ? (
        <div className="max-w-md mx-auto">
          <GlassCard className="text-center">
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-6xl mb-4">👋</div>
                <h2 className="text-2xl font-bold text-white mb-4">{getHora()}</h2>
                <p className="text-white text-lg mb-6">¿Cuál es tu nombre?</p>
                <input
                  type="text"
                  value={nombreEstudiante}
                  onChange={(e) => setNombreEstudiante(e.target.value)}
                  placeholder="Escribe tu nombre..."
                  className="w-full px-4 py-3 bg-white rounded-full focus:outline-none focus:ring-4 focus:ring-blue-200 text-center text-lg"
                />
                <button
                  onClick={() => {
                    if (nombreEstudiante.trim()) {
                      setStep(2);
                    } else {
                      alert('Por favor ingresa tu nombre');
                    }
                  }}
                  disabled={!nombreEstudiante.trim()}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-8 py-3 rounded-full text-lg font-bold shadow-lg transform transition hover:scale-105 disabled:hover:scale-100"
                >
                  Continuar →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-6xl mb-4">👋</div>
                <h2 className="text-xl font-bold text-white mb-6">
                  Hola {nombreEstudiante}, ¿Cómo te sientes hoy?
                </h2>
                <div className="flex justify-center gap-4 flex-wrap">
                  {emociones.map((emocion) => (
                    <button
                      key={emocion.nombre}
                      onClick={() => handleEmocionSelect(emocion)}
                      className="text-6xl hover:scale-125 transform transition duration-200"
                      title={emocion.nombre}
                    >
                      {emocion.emoji}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-gray-400 text-sm mt-4"
                >
                  ← Volver
                </button>
              </div>
            )}

            {step === 3 && selectedEmocion && (
              <div className="space-y-6">
                <div className="text-6xl mb-4">{selectedEmocion.emoji}</div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Te sientes {selectedEmocion.nombre.toLowerCase()}
                </h2>
                
                <div className="bg-blue-50 p-6 rounded-2xl">
                  <p className="text-blue-600 font-semibold mb-3">¿Quieres contarnos más?</p>
                  <textarea
                    value={respuesta}
                    onChange={(e) => setRespuesta(e.target.value)}
                    placeholder="Escribe lo que sientes... (opcional)"
                    className="w-full px-4 py-3 bg-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 resize-none h-32"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  className={`bg-gradient-to-r ${selectedEmocion.color} text-white px-12 py-4 rounded-full text-lg font-bold shadow-lg transform transition hover:scale-105`}
                >
                  ✅ Enviar
                </button>

                <button
                  onClick={() => setStep(2)}
                  className="text-gray-500 text-sm"
                >
                  ← Cambiar emoción
                </button>
              </div>
            )}
          </GlassCard>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {checkins.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-white/70 text-4xl mb-2">💙</p>
              <p className="text-white/70">Aún no hay check-ins registrados</p>
            </div>
          ) : (
            checkins.map((checkin) => (
              <GlassCard key={checkin.id}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">{checkin.estudianteNombre}</h3>
                    <span className="text-3xl">{checkin.emocionEmoji}</span>
                  </div>
                  <p className="text-blue-300 text-sm">
                    {new Date(checkin.fecha).toLocaleDateString('es-CL', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-white/90">{checkin.emocion}</p>
                  {checkin.respuesta && (
                    <p className="text-white/80 text-sm italic bg-white/10 p-3 rounded-lg">
                      "{checkin.respuesta}"
                    </p>
                  )}
                </div>
              </GlassCard>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CheckinEmocional;
