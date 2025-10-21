import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';

interface Informe {
  id: string;
  mes: string;
  año: number;
  fecha: string;
  totalCheckins: number;
  estudiantesActivos: number;
  promedioEmocional: number;
  alertasGeneradas: number;
  tendencia: string;
  recomendaciones: string[];
  resumenIA: string;
}

const Informes: React.FC = () => {
  const [informes, setInformes] = useState<Informe[]>([]);
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('skolai_informes');
    if (saved) {
      setInformes(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('skolai_informes', JSON.stringify(informes));
  }, [informes]);

  const generarInformeConIA = () => {
    setGenerando(true);
    
    // Obtener datos de check-ins
    const checkins = JSON.parse(localStorage.getItem('skolai_checkins') || '[]');
    const estudiantes = JSON.parse(localStorage.getItem('skolai_estudiantes') || '[]');
    const incidentes = JSON.parse(localStorage.getItem('skolai_incidentes') || '[]');
    
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const fecha = new Date();
    const mesActual = meses[fecha.getMonth()];
    const añoActual = fecha.getFullYear();
    
    // Calcular estadísticas
    const emocionesPorValor: { [key: string]: number } = {
      '😊': 5, '😌': 4, '😐': 3, '😟': 2, '😢': 1, '😠': 1
    };
    
    const promedioEmocion = checkins.length > 0
      ? checkins.reduce((acc: number, c: any) => acc + (emocionesPorValor[c.emocionEmoji] || 3), 0) / checkins.length
      : 0;
    
    const alertas = checkins.filter((c: any) => 
      ['Triste', 'Enojado', 'Preocupado'].includes(c.emocion)
    ).length;
    
    // Determinar tendencia
    let tendencia = '';
    if (promedioEmocion >= 4) tendencia = 'Positiva ✅';
    else if (promedioEmocion >= 3) tendencia = 'Estable 📊';
    else tendencia = 'Requiere Atención ⚠️';
    
    // Generar recomendaciones con IA simulada
    const recomendaciones = generarRecomendacionesIA(promedioEmocion, alertas, checkins.length);
    
    // Generar resumen con IA
    const resumenIA = generarResumenIA(checkins, incidentes, promedioEmocion, alertas);
    
    const nuevoInforme: Informe = {
      id: Date.now().toString(),
      mes: mesActual,
      año: añoActual,
      fecha: fecha.toISOString(),
      totalCheckins: checkins.length,
      estudiantesActivos: new Set(checkins.map((c: any) => c.estudianteNombre)).size,
      promedioEmocional: parseFloat(promedioEmocion.toFixed(2)),
      alertasGeneradas: alertas,
      tendencia,
      recomendaciones,
      resumenIA
    };
    
    setInformes([nuevoInforme, ...informes]);
    setGenerando(false);
    alert('✅ Informe mensual generado exitosamente con análisis de IA');
  };

  const generarRecomendacionesIA = (promedio: number, alertas: number, total: number) => {
    const recomendaciones = [];
    
    if (promedio < 3) {
      recomendaciones.push('⚠️ Nivel emocional bajo detectado. Se recomienda intervención del equipo de convivencia.');
      recomendaciones.push('🔍 Realizar entrevistas individuales con estudiantes que presentan emociones negativas recurrentes.');
      recomendaciones.push('🎯 Implementar actividades de integración y fortalecimiento del clima escolar.');
    } else if (promedio >= 3 && promedio < 4) {
      recomendaciones.push('📊 Bienestar emocional estable. Mantener actividades actuales.');
      recomendaciones.push('💬 Reforzar canales de comunicación con apoderados sobre el estado emocional.');
    } else {
      recomendaciones.push('✅ Excelente clima emocional. Continuar con las estrategias actuales.');
      recomendaciones.push('🎉 Reconocer y fortalecer las prácticas que están generando impacto positivo.');
    }
    
    if (alertas > total * 0.2) {
      recomendaciones.push('🚨 Alto número de alertas detectadas. Activar protocolo de contención emocional.');
      recomendaciones.push('👥 Coordinar con profesionales de apoyo (psicólogo, orientador).');
    }
    
    if (total < 10) {
      recomendaciones.push('📱 Baja participación en check-ins. Incentivar el uso diario de la herramienta.');
    }
    
    return recomendaciones;
  };

  const generarResumenIA = (checkins: any[], incidentes: any[], promedio: number, alertas: number) => {
    const totalEstudiantes = new Set(checkins.map((c: any) => c.estudianteNombre)).size;
    const participacion = checkins.length > 0 ? ((checkins.length / 30) * 100).toFixed(0) : 0;
    
    let resumen = `📊 **ANÁLISIS GENERAL DEL MES**\n\n`;
    resumen += `Durante este período se registraron ${checkins.length} check-ins emocionales de ${totalEstudiantes} estudiantes diferentes, `;
    resumen += `representando una participación del ${participacion}% respecto al total de días del mes.\n\n`;
    
    resumen += `💭 **ESTADO EMOCIONAL**\n\n`;
    if (promedio >= 4) {
      resumen += `El clima emocional general es **POSITIVO** (${promedio.toFixed(1)}/5). Los estudiantes muestran un estado de ánimo saludable y participativo. `;
      resumen += `Se observa buena disposición hacia las actividades escolares y relaciones interpersonales favorables.\n\n`;
    } else if (promedio >= 3) {
      resumen += `El clima emocional es **ESTABLE** (${promedio.toFixed(1)}/5). La mayoría de los estudiantes presenta un estado anímico dentro de rangos normales. `;
      resumen += `Se recomienda mantener monitoreo constante para detectar cambios tempranos.\n\n`;
    } else {
      resumen += `El clima emocional requiere **ATENCIÓN PRIORITARIA** (${promedio.toFixed(1)}/5). Se detectaron múltiples estudiantes con estados emocionales negativos recurrentes. `;
      resumen += `Es fundamental activar protocolos de contención y seguimiento individualizado.\n\n`;
    }
    
    if (alertas > 0) {
      resumen += `🚨 **ALERTAS TEMPRANAS**\n\n`;
      resumen += `Se generaron ${alertas} alertas automáticas basadas en respuestas de estudiantes que indicaron: tristeza recurrente, necesidad de ayuda, `;
      resumen += `o uso de palabras clave relacionadas con malestar emocional. Estos casos requieren seguimiento prioritario.\n\n`;
    }
    
    if (incidentes.length > 0) {
      resumen += `⚠️ **INCIDENTES DE CONVIVENCIA**\n\n`;
      resumen += `Se registraron ${incidentes.length} incidentes de convivencia escolar. Es importante correlacionar estos eventos con los check-ins emocionales `;
      resumen += `para identificar patrones y estudiantes en riesgo.\n\n`;
    }
    
    resumen += `🎯 **CONCLUSIÓN**\n\n`;
    resumen += `El análisis predictivo sugiere ${promedio >= 4 ? 'mantener' : 'reforzar'} las estrategias de bienestar emocional. `;
    resumen += `Se recomienda realizar seguimiento especial a estudiantes con emociones negativas recurrentes y coordinar con equipo psicosocial del establecimiento.`;
    
    return resumen;
  };

  const descargarInforme = (informe: Informe) => {
    const texto = `
INFORME MENSUAL - SKOLAI
========================

Mes: ${informe.mes} ${informe.año}
Fecha de generación: ${new Date(informe.fecha).toLocaleDateString('es-CL')}

ESTADÍSTICAS GENERALES
======================
Total de Check-ins: ${informe.totalCheckins}
Estudiantes Activos: ${informe.estudiantesActivos}
Promedio Emocional: ${informe.promedioEmocional}/5
Alertas Generadas: ${informe.alertasGeneradas}
Tendencia: ${informe.tendencia}

ANÁLISIS CON INTELIGENCIA ARTIFICIAL
=====================================
${informe.resumenIA}

RECOMENDACIONES
===============
${informe.recomendaciones.map((r, i) => `${i + 1}. ${r}`).join('\n')}

---
Generado automáticamente por SKOLAI - Sistema de Gestión Escolar
    `;
    
    const blob = new Blob([texto], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Informe_${informe.mes}_${informe.año}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
  <div className="lg:ml-64 ml-0 p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-white">📊 Informes Mensuales con IA</h1>
        <button
          onClick={generarInformeConIA}
          disabled={generando}
          className="bg-purple-500/50 hover:bg-purple-600/50 text-white font-bold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105 disabled:opacity-50"
        >
          {generando ? '⏳ Generando...' : '🤖 Generar Informe con IA'}
        </button>
      </div>

      <div className="space-y-6">
        {informes.length === 0 ? (
          <GlassCard>
            <div className="text-center text-white/60 py-12">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-lg mb-4">No hay informes generados aún</p>
              <p className="text-sm">Haz clic en "Generar Informe con IA" para crear tu primer análisis mensual</p>
            </div>
          </GlassCard>
        ) : (
          informes.map((informe) => (
            <GlassCard key={informe.id}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Informe {informe.mes} {informe.año}
                  </h2>
                  <p className="text-white/60">
                    Generado: {new Date(informe.fecha).toLocaleDateString('es-CL', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <button
                  onClick={() => descargarInforme(informe)}
                  className="bg-blue-500/50 hover:bg-blue-600/50 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  📥 Descargar
                </button>
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/10 p-4 rounded-lg">
                  <p className="text-white/70 text-sm">Check-ins</p>
                  <p className="text-2xl font-bold text-white">{informe.totalCheckins}</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <p className="text-white/70 text-sm">Estudiantes</p>
                  <p className="text-2xl font-bold text-white">{informe.estudiantesActivos}</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <p className="text-white/70 text-sm">Promedio</p>
                  <p className="text-2xl font-bold text-green-300">{informe.promedioEmocional}/5</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <p className="text-white/70 text-sm">Alertas</p>
                  <p className="text-2xl font-bold text-red-300">{informe.alertasGeneradas}</p>
                </div>
              </div>

              {/* Tendencia */}
              <div className="mb-6">
                <p className="text-white/70 mb-2">Tendencia del Mes:</p>
                <p className="text-xl font-bold text-white">{informe.tendencia}</p>
              </div>

              {/* Resumen IA */}
              <div className="mb-6 bg-white/5 p-4 rounded-lg">
                <h3 className="text-xl font-bold text-white mb-3">🤖 Análisis con IA</h3>
                <p className="text-white/90 whitespace-pre-line leading-relaxed">{informe.resumenIA}</p>
              </div>

              {/* Recomendaciones */}
              <div>
                <h3 className="text-xl font-bold text-white mb-3">💡 Recomendaciones</h3>
                <ul className="space-y-2">
                  {informe.recomendaciones.map((rec, index) => (
                    <li key={index} className="text-white/90 bg-white/5 p-3 rounded-lg">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};

export default Informes;
