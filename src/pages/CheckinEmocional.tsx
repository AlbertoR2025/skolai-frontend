import React, { useState, useEffect } from 'react';

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
  { emoji: '😢', nombre: 'Triste', color: 'from-blue-400 to-blue-600' },
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

  useEffect(() => {
    const saved = localStorage.getItem('skolai_checkins');
    if (saved) {
      setCheckins(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('skolai_checkins', JSON.stringify(checkins));
  }, [checkins]);

  const handleEmocionSelect = (emocion: any) => {
    setSelectedEmocion(emocion);
    setStep(3);
  };

  const handleSubmit = () => {
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
    
    // Analizar si requiere atención
    const palabrasAlerta = ['mal', 'triste', 'solo', 'ayuda', 'miedo', 'no quiero'];
    const requiereAtencion = palabrasAlerta.some(palabra => 
      respuesta.toLowerCase().includes(palabra)
    ) || ['Enojado', 'Triste'].includes(selectedEmocion.nombre);
    
    if (requiereAtencion) {
      alert('⚠️ Hemos detectado que podrías necesitar apoyo. Un adulto se comunicará contigo pronto.');
    } else {
      alert('✅ ¡Gracias por compartir cómo te sientes! Tu bienestar es importante para nosotros 💙');
    }
    
    // Reset
    setStep(1);
    setNombreEstudiante('');
    setSelectedEmocion(null);
    setRespuesta('');
  };

  const getHora = () => {
    const hora = new Date().getHours();
    if (hora < 12) return '¡Buenos Días!';
    if (hora < 18) return '¡Buenas Tardes!';
    return '¡Buenas Noches!';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 via-blue-100 to-orange-100 flex items-center justify-center p-4">
      {/* Container Mobile */}
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-blue-600 text-sm mb-2"
          >
            {showHistory ? '← Volver al Check-in' : '📊 Ver Historial'}
          </button>
        </div>

        {!showHistory ? (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 min-h-[600px] flex flex-col">
            {/* Avatar y Saludo */}
            {step === 1 && (
              <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                <div className="text-6xl animate-bounce">👋</div>
                
                <div className="bg-blue-100 rounded-full px-6 py-3">
                  <p className="text-blue-800 font-semibold">{getHora()}</p>
                </div>

                <div className="bg-white rounded-3xl px-8 py-4 shadow-lg">
                  <p className="text-gray-700 font-medium">¿Cuál es tu nombre?</p>
                </div>

                <input
                  type="text"
                  value={nombreEstudiante}
                  onChange={(e) => setNombreEstudiante(e.target.value)}
                  placeholder="Escribe tu nombre..."
                  className="w-full px-6 py-4 bg-blue-50 rounded-full text-center text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                />

                <button
                  onClick={() => nombreEstudiante ? setStep(2) : null}
                  disabled={!nombreEstudiante}
                  className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-12 py-4 rounded-full text-lg font-bold shadow-lg transform transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar →
                </button>
              </div>
            )}

            {/* Pregunta Emocional */}
            {step === 2 && (
              <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                <div className="text-5xl">🧒</div>
                
                <div className="bg-white rounded-3xl px-8 py-4 shadow-lg">
                  <p className="text-gray-700 font-medium text-center">
                    Hola {nombreEstudiante}, ¿Cómo te sientes hoy?
                  </p>
                </div>

                <div className="bg-blue-100 rounded-3xl px-8 py-6 w-full">
                  <div className="grid grid-cols-5 gap-3">
                    {emociones.map((emocion) => (
                      <button
                        key={emocion.emoji}
                        onClick={() => handleEmocionSelect(emocion)}
                        className="text-5xl transform transition hover:scale-125 active:scale-110"
                      >
                        {emocion.emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setStep(1)}
                  className="text-gray-500 text-sm"
                >
                  ← Volver
                </button>
              </div>
            )}

            {/* Reflexión */}
            {step === 3 && selectedEmocion && (
              <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                <div className="text-7xl">{selectedEmocion.emoji}</div>
                
                <div className="bg-white rounded-3xl px-8 py-4 shadow-lg">
                  <p className="text-gray-700 font-medium text-center">
                    Te sientes {selectedEmocion.nombre.toLowerCase()}
                  </p>
                </div>

                <div className="bg-blue-100 rounded-3xl px-6 py-4 w-full">
                  <p className="text-blue-800 font-medium text-center mb-3">
                    ¿Quieres contarnos más?
                  </p>
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

            {/* Footer indicador */}
            <div className="flex justify-center space-x-2 mt-6">
              <div className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              <div className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              <div className={`w-2 h-2 rounded-full ${step === 3 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            </div>
          </div>
        ) : (
          /* Historial */
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 max-h-[600px] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">📊 Historial</h2>
            
            {checkins.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">😊</div>
                <p>Aún no hay check-ins registrados</p>
              </div>
            ) : (
              <div className="space-y-4">
                {checkins.map((checkin) => (
                  <div key={checkin.id} className="bg-blue-50 rounded-2xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-gray-800">{checkin.estudianteNombre}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(checkin.fecha).toLocaleDateString('es-CL', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className="text-4xl">{checkin.emocionEmoji}</span>
                    </div>
                    {checkin.respuesta && (
                      <p className="text-sm text-gray-600 italic">"{checkin.respuesta}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckinEmocional;
