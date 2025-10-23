import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import GlassCard from '../components/GlassCard';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Servicio OpenAI integrado directamente en el componente
const generateInformeConChatGPT = async (datos: any): Promise<string> => {
  try {
    const API_KEY = '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';

    const prompt = `
Eres un psicólogo educativo especializado en bienestar emocional escolar con 15 años de experiencia. 
Estás analizando datos emocionales de un grupo educativo para generar un informe ejecutivo profesional.

# DATOS DE ENTRADA:
- Total de registros: ${datos.totalCheckins}
- Estudiantes participantes: ${datos.estudiantesActivos.length}
- Período analizado: ${datos.periodo}
- Distribución emocional: ${JSON.stringify(datos.distribucionEmociones)}
- Tendencias: ${JSON.stringify(datos.tendencias)}
- Emociones positivas: ${datos.emocionesPositivas || 0}
- Emociones que requieren atención: ${datos.emocionesAtencion || 0}

# GENERA UN INFORME COMPLETO CON ESTA ESTRUCTURA:

## 🎯 RESUMEN EJECUTIVO
[Análisis general del estado emocional del grupo en 1-2 párrafos]

## 📊 ANÁLISIS EMOCIONAL DETALLADO
### Distribución Cuantitativa
[Tabla mental de emociones con porcentajes y análisis]

### Interpretación Psicológica
[Análisis cualitativo de cada emoción y su significado en contexto educativo]

## 🔍 PATRONES IDENTIFICADOS
- Patrones dominantes en el grupo
- Correlaciones entre emociones
- Posibles causas contextuales

## 🧠 DIAGNÓSTICO NEUROEMOCIONAL
### Factores Protectores
[Fortalezas del grupo y recursos emocionales]

### Factores de Riesgo  
[Áreas de vulnerabilidad y necesidades]

### Clasificación Global
[Óptimo/Estable/En Observación/En Riesgo con justificación]

## 💡 PLAN DE INTERVENCIÓN ESTRATÉGICO
### Nivel Grupal (Aula)
[3-5 estrategias específicas para el aula]

### Nivel Individual
[Acciones personalizadas para casos específicos]

### Coordinación Institucional
[Recomendaciones para el equipo docente y directivo]

## 📈 PLAN DE SEGUIMIENTO
- Métricas de seguimiento
- Cronograma recomendado
- Indicadores de éxito

# REQUISITOS:
- Extensión: 800-1200 palabras
- Profesional pero accesible
- Basado en evidencia psicológica
- Recomendaciones accionables
- Formato markdown con emojis
- Enfoque en fortalezas y soluciones

Ejemplo de tono: "El grupo muestra una notable capacidad de expresión emocional, con un 60% de estados positivos que indican un clima escolar saludable. Sin embargo, el 20% de registros de enojo merecen atención proactiva..."
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Eres un psicólogo educativo senior especializado en bienestar emocional escolar. 
            Tu expertise incluye: análisis de patrones emocionales, diseño de intervenciones educativas, 
            y comunicación con equipos docentes. Genera informes profesionales, empáticos y basados en evidencia.
            
            FORMATO DE RESPUESTA:
            - Usa markdown con encabezados ## y ###
            - Incluye emojis relevantes para cada sección
            - Sé específico y basado en los datos proporcionados
            - Proporciona recomendaciones prácticas y accionables
            - Longitud: 800-1200 palabras`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3500,
        temperature: 0.7,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error detallado de OpenAI:', errorData);
      throw new Error(`OpenAI API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
    
  } catch (error) {
    console.error('Error con OpenAI API:', error);
    return await generarInformeDetalladoLocal(datos);
  }
};

const generarInformeDetalladoLocal = async (datos: any): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { totalCheckins, periodo, distribucionEmociones, tendencias, estudiantesActivos } = datos;

      let informe = `# 🧠 INFORME DE BIENESTAR EMOCIONAL - SKOLAI NEUROSCIENCE\n\n`;
      
      informe += `## 🎯 RESUMEN EJECUTIVO\n\n`;
      informe += `El análisis del período **${periodo}** revela un panorama emocional **${Number(tendencias.ratioPositivos) > 60 ? 'predominantemente positivo' : 'mixto'}** en el grupo educativo. `;
      informe += `De los **${totalCheckins} registros emocionales** recopilados de **${estudiantesActivos.length} estudiantes**, `;
      informe += `**${tendencias.ratioPositivos}%** reflejan estados positivos, indicando un clima escolar generalmente favorable. `;
      informe += `Sin embargo, **${tendencias.ratioNegativos}%** de los registros requieren atención específica, destacando áreas de oportunidad para la intervención educativa.\n\n`;

      informe += `## 📊 ANÁLISIS EMOCIONAL DETALLADO\n\n`;
      informe += `### Distribución Emocional del Grupo:\n\n`;
      
      Object.entries(distribucionEmociones).forEach(([emocion, count]: [string, any]) => {
        const porcentaje = ((count / totalCheckins) * 100).toFixed(1);
        informe += `- **${emocion}**: ${porcentaje}% (${count} estudiantes)\n`;
      });

      informe += `\n### Interpretación Psicológica:\n\n`;
      informe += `- **Estados Positivos (${tendencias.ratioPositivos}%)**: Reflejan un ambiente escolar que favorece el bienestar emocional\n`;
      informe += `- **Estados de Atención (${tendencias.ratioNegativos}%)**: Señalan la necesidad de estrategias de apoyo emocional\n`;
      informe += `- **Distribución General**: El grupo muestra diversidad emocional, indicando expresión emocional auténtica\n\n`;

      informe += `## 🔍 DIAGNÓSTICO NEUROEMOCIONAL\n\n`;
      
      let diagnostico = '';
      if (Number(tendencias.ratioPositivos) > 70) {
        diagnostico = '**🟢 CLASIFICACIÓN: ÓPTIMO** - Excelente salud emocional grupal';
      } else if (Number(tendencias.ratioNegativos) > 40) {
        diagnostico = '**🔴 CLASIFICACIÓN: EN ALERTA** - Intervención prioritaria requerida';
      } else if (Number(tendencias.ratioPositivos) > 50) {
        diagnostico = '**🟡 CLASIFICACIÓN: ESTABLE** - Monitoreo activo recomendado';
      } else {
        diagnostico = '**🟠 CLASIFICACIÓN: EN OBSERVACIÓN** - Atención preventiva necesaria';
      }
      
      informe += `${diagnostico}\n\n`;

      informe += `## 💡 PLAN DE INTERVENCIÓN RECOMENDADO\n\n`;
      informe += `### Estrategias Grupales (Aula):\n`;
      informe += `1. **Actividades de regulación emocional**: Ejercicios de mindfulness y respiración\n`;
      informe += `2. **Refuerzo positivo sistemático**: Reconocimiento de logros emocionales\n`;
      informe += `3. **Espacios de diálogo seguro**: Consejos de curso enfocados en bienestar\n\n`;

      informe += `### Acciones Individualizadas:\n`;
      if (distribucionEmociones['Enojado'] > 0) {
        informe += `- **Manejo de la ira**: Talleres de gestión emocional para ${distribucionEmociones['Enojado']} estudiantes\n`;
      }
      if (distribucionEmociones['Ansioso'] > 0) {
        informe += `- **Estrategias anti-ansiedad**: Técnicas de relajación para casos identificados\n`;
      }
      informe += `- **Acompañamiento tutorial**: Sesiones individuales de seguimiento\n\n`;

      informe += `## 📈 PLAN DE SEGUIMIENTO\n\n`;
      informe += `- **Evaluación continua**: Check-ins emocionales semanales\n`;
      informe += `- **Indicadores clave**: Ratio de positividad > 65%, Atención < 20%\n`;
      informe += `- **Reportes mensuales**: Análisis comparativo de tendencias\n`;
      informe += `- **Coordinación docente**: Reuniones quincenales de seguimiento\n\n`;

      informe += `---\n*Informe generado por SKOLAI Neuroscience - ${new Date().toLocaleDateString('es-CL')}*\n`;
      informe += `*Sistema de Análisis Neuroemocional Avanzado*\n`;

      resolve(informe);
    }, 1000);
  });
};

const Informes: React.FC = () => {
  const [checkins, setCheckins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [informe, setInforme] = useState('');
  const [tipoInforme, setTipoInforme] = useState('general');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Cargar checkins desde Supabase
  useEffect(() => {
    const loadCheckins = async () => {
      try {
        const { data, error } = await supabase
          .from('Checkins')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) {
          setCheckins(data);
        }
      } catch (error) {
        console.error('Error cargando check-ins:', error);
        const localData = JSON.parse(localStorage.getItem('skolai_checkins') || '[]');
        setCheckins(localData);
      } finally {
        setLoading(false);
      }
    };

    loadCheckins();
  }, []);

  // Funciones de análisis de datos
  const calcularDistribucionEmociones = (data: any[]) => {
    const distribucion: { [key: string]: number } = {};
    data.forEach(checkin => {
      const emocion = checkin.emocion || 'Normal';
      distribucion[emocion] = (distribucion[emocion] || 0) + 1;
    });
    return distribucion;
  };

  const analizarTendencias = (data: any[]) => {
    try {
      const unaSemanaAtras = new Date();
      unaSemanaAtras.setDate(unaSemanaAtras.getDate() - 7);
      
      const checkinsRecientes = data.filter(checkin => {
        try {
          const fechaCheckin = new Date(checkin.fecha || checkin.created_at);
          return fechaCheckin >= unaSemanaAtras;
        } catch {
          return false;
        }
      });
      
      const emocionesPositivas = ['Bien', 'Muy Feliz'];
      const emocionesNegativas = ['Enojado', 'Ansioso'];
      
      const positivos = data.filter(c => emocionesPositivas.includes(c.emocion)).length;
      const negativos = data.filter(c => emocionesNegativas.includes(c.emocion)).length;
      
      return {
        totalUltimaSemana: checkinsRecientes.length,
        ratioPositivos: data.length > 0 ? ((positivos / data.length) * 100).toFixed(1) : '0.0',
        ratioNegativos: data.length > 0 ? ((negativos / data.length) * 100).toFixed(1) : '0.0'
      };
    } catch (error) {
      console.error('Error en analizarTendencias:', error);
      return {
        totalUltimaSemana: 0,
        ratioPositivos: '0.0',
        ratioNegativos: '0.0'
      };
    }
  };

  const obtenerEstudiantesActivos = (data: any[]) => {
    try {
      const estudiantes = new Set(data.map(checkin => checkin.estudiante_nombre || 'Estudiante'));
      return Array.from(estudiantes);
    } catch {
      return [];
    }
  };

  const obtenerEstudianteMasActivo = (data: any[]) => {
    if (data.length === 0) return 'No disponible';
    
    const frecuencia: { [key: string]: number } = {};
    data.forEach(checkin => {
      const estudiante = checkin.estudiante_nombre || 'Desconocido';
      frecuencia[estudiante] = (frecuencia[estudiante] || 0) + 1;
    });
    
    const [nombre, count] = Object.entries(frecuencia).sort(([,a], [,b]) => b - a)[0];
    return `${nombre} (${count} registros)`;
  };

  const analizarEmocionesPorDia = (data: any[]) => {
    const emocionesPorDia: { [key: string]: { [key: string]: number } } = {};
    
    data.forEach(checkin => {
      try {
        const fecha = new Date(checkin.fecha || checkin.created_at).toISOString().split('T')[0];
        const emocion = checkin.emocion || 'Normal';
        
        if (!emocionesPorDia[fecha]) {
          emocionesPorDia[fecha] = {};
        }
        
        emocionesPorDia[fecha][emocion] = (emocionesPorDia[fecha][emocion] || 0) + 1;
      } catch {
        // Ignorar fechas inválidas
      }
    });
    
    return emocionesPorDia;
  };

  const calcularEmocionesPorEstudiante = (data: any[]) => {
    const emocionesPorEstudiante: { [key: string]: { [key: string]: number } } = {};
    
    data.forEach(checkin => {
      const estudiante = checkin.estudiante_nombre || 'Desconocido';
      const emocion = checkin.emocion || 'Normal';
      
      if (!emocionesPorEstudiante[estudiante]) {
        emocionesPorEstudiante[estudiante] = {};
      }
      
      emocionesPorEstudiante[estudiante][emocion] = (emocionesPorEstudiante[estudiante][emocion] || 0) + 1;
    });
    
    return emocionesPorEstudiante;
  };

  // Función principal para generar informe con ChatGPT
  const generarInformeIA = async () => {
    setGenerando(true);
    setInforme('');

    try {
      let checkinsFiltrados = checkins;
      if (fechaInicio && fechaFin) {
        checkinsFiltrados = checkins.filter(checkin => {
          try {
            const fechaCheckin = new Date(checkin.fecha || checkin.created_at);
            return fechaCheckin >= new Date(fechaInicio) && fechaCheckin <= new Date(fechaFin);
          } catch {
            return false;
          }
        });
      }

      // Validar que hay datos suficientes
      if (checkinsFiltrados.length === 0) {
        setInforme(`## 📊 Sin Datos para Analizar\n\nNo se encontraron registros emocionales para el período seleccionado (${fechaInicio && fechaFin ? `${fechaInicio} a ${fechaFin}` : 'todo el período'}).\n\n**Sugerencias:**\n- Verifica las fechas seleccionadas\n- Asegúrate de que hay check-ins registrados\n- Intenta con un rango de fechas diferente`);
        setGenerando(false);
        return;
      }

      // Preparar datos enriquecidos para ChatGPT
      const datosParaIA = {
        tipoInforme,
        totalCheckins: checkinsFiltrados.length,
        periodo: fechaInicio && fechaFin ? `${fechaInicio} a ${fechaFin}` : 'Todo el período',
        distribucionEmociones: calcularDistribucionEmociones(checkinsFiltrados),
        tendencias: analizarTendencias(checkinsFiltrados),
        estudiantesActivos: obtenerEstudiantesActivos(checkinsFiltrados),
        emocionesPositivas: checkinsFiltrados.filter(c => ['Bien', 'Muy Feliz'].includes(c.emocion)).length,
        emocionesAtencion: checkinsFiltrados.filter(c => ['Enojado', 'Ansioso'].includes(c.emocion)).length,
        estudianteMasActivo: obtenerEstudianteMasActivo(checkinsFiltrados),
        emocionesPorDia: analizarEmocionesPorDia(checkinsFiltrados),
        porcentajeParticipacion: ((checkinsFiltrados.length / (checkins.length || 1)) * 100).toFixed(1),
        emocionesPorEstudiante: calcularEmocionesPorEstudiante(checkinsFiltrados)
      };

      console.log('Enviando datos a ChatGPT:', datosParaIA);

      // Mostrar estado de conexión
      setInforme('## 🤖 Generando Resumen Ejecutivo ...\n\nIniciando análisis psicológico educativo ...');

      // Usar ChatGPT para generar el informe
      const informeGenerado = await generateInformeConChatGPT(datosParaIA);
      setInforme(informeGenerado);

    } catch (error) {
      console.error('Error generando informe con ChatGPT:', error);
      
      let mensajeError = '## ❌ Error al Generar el Informe\n\n';
      
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          mensajeError += '**Error de autenticación con OpenAI.**\n\n';
          mensajeError += 'Por favor, verifica que tu API key sea válida y esté correctamente configurada.\n\n';
          mensajeError += '🔑 **Solución:**\n';
          mensajeError += '- Verifica tu API key en OpenAI\n';
          mensajeError += '- Asegúrate de que tenga créditos disponibles\n';
          mensajeError += '- Revisa que no haya expirado';
        } else if (error.message.includes('429')) {
          mensajeError += '**Límite de uso excedido.**\n\n';
          mensajeError += 'Has superado el límite de solicitudes a la API de OpenAI.\n\n';
          mensajeError += '🕒 **Solución:**\n';
          mensajeError += '- Espera unos minutos antes de intentar nuevamente\n';
          mensajeError += '- Verifica tu límite de uso en platform.openai.com\n';
          mensajeError += '- Considera actualizar tu plan si es necesario';
        } else {
          mensajeError += `**Error técnico:** ${error.message}\n\n`;
          mensajeError += 'Por favor, intenta de nuevo en unos momentos.';
        }
      } else {
        mensajeError += 'Error desconocido. Por favor, verifica tu conexión a internet.';
      }
      
      setInforme(mensajeError);
    } finally {
      setGenerando(false);
    }
  };

  // FUNCIÓN PDF CORREGIDA
  // Función PDF MEJORADA - Usa el contenido completo de ChatGPT
const generarPDF = async () => {
  try {
    console.log('Iniciando generación de PDF mejorado...');
    
    // Si no hay informe generado, mostrar error
    if (!informe || informe.includes('Error') || informe.includes('Sin Datos')) {
      alert('Primero genera un informe con ChatGPT antes de crear el PDF.');
      return;
    }

    // Crear elemento para el PDF
    const element = document.createElement('div');
    element.style.width = '210mm';
    element.style.minHeight = '297mm';
    element.style.padding = '20mm';
    element.style.background = 'white';
    element.style.color = 'black';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.fontSize = '12px';
    element.style.lineHeight = '1.4';

    // Función para convertir markdown a HTML simple para PDF
    const convertirMarkdownAPdfHtml = (markdown: string): string => {
      let html = markdown;
      
      // Convertir encabezados
      html = html.replace(/## 🎯 (.*?)(\n|$)/g, '<h2 style="color: #2c5282; font-size: 20px; margin: 25px 0 15px 0; border-bottom: 2px solid #2c5282; padding-bottom: 8px;">$1</h2>');
      html = html.replace(/## 📊 (.*?)(\n|$)/g, '<h2 style="color: #2c5282; font-size: 20px; margin: 25px 0 15px 0; border-bottom: 2px solid #2c5282; padding-bottom: 8px;">$1</h2>');
      html = html.replace(/## 🔍 (.*?)(\n|$)/g, '<h2 style="color: #2c5282; font-size: 20px; margin: 25px 0 15px 0; border-bottom: 2px solid #2c5282; padding-bottom: 8px;">$1</h2>');
      html = html.replace(/## 🧠 (.*?)(\n|$)/g, '<h2 style="color: #2c5282; font-size: 20px; margin: 25px 0 15px 0; border-bottom: 2px solid #2c5282; padding-bottom: 8px;">$1</h2>');
      html = html.replace(/## 💡 (.*?)(\n|$)/g, '<h2 style="color: #2c5282; font-size: 20px; margin: 25px 0 15px 0; border-bottom: 2px solid #2c5282; padding-bottom: 8px;">$1</h2>');
      html = html.replace(/## 📈 (.*?)(\n|$)/g, '<h2 style="color: #2c5282; font-size: 20px; margin: 25px 0 15px 0; border-bottom: 2px solid #2c5282; padding-bottom: 8px;">$1</h2>');
      
      // Convertir subencabezados
      html = html.replace(/### (.*?)(\n|$)/g, '<h3 style="color: #4a5568; font-size: 16px; margin: 20px 0 12px 0; font-weight: bold;">$1</h3>');
      
      // Convertir listas con -
      html = html.replace(/^- (.*?)(\n|$)/gm, '<li style="margin: 8px 0 8px 20px; padding-left: 5px;">$1</li>');
      
      // Convertir listas numeradas
      html = html.replace(/^\d+\. (.*?)(\n|$)/gm, '<li style="margin: 8px 0 8px 20px; padding-left: 5px;">$1</li>');
      
      // Convertir negritas
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #2c5282;">$1</strong>');
      
      // Convertir saltos de línea
      html = html.replace(/\n/g, '<br>');
      
      // Agregar contenedor a las listas
      html = html.replace(/(<li style="margin: 8px 0 8px 20px; padding-left: 5px;">.*?)<br>/g, '$1</li>');
      html = html.replace(/(<li style="margin: 8px 0 8px 20px; padding-left: 5px;">.*?)<\/li>/g, '<ul style="margin: 10px 0 20px 0; padding-left: 20px;">$1</ul>');
      html = html.replace(/<\/ul><br><ul>/g, '');
      
      return html;
    };

    // Obtener datos básicos para el encabezado
    let checkinsFiltrados = checkins;
    if (fechaInicio && fechaFin) {
      checkinsFiltrados = checkins.filter(checkin => {
        try {
          const fechaCheckin = new Date(checkin.fecha || checkin.created_at);
          return fechaCheckin >= new Date(fechaInicio) && fechaCheckin <= new Date(fechaFin);
        } catch {
          return false;
        }
      });
    }

    const total = checkinsFiltrados.length;
    const estudiantesUnicos = new Set(checkinsFiltrados.map(c => c.estudiante_nombre)).size;
    const positivos = checkinsFiltrados.filter(c => ['Bien', 'Muy Feliz'].includes(c.emocion)).length;
    const atencion = checkinsFiltrados.filter(c => ['Enojado', 'Ansioso'].includes(c.emocion)).length;
    
    const porcentajePositivos = total > 0 ? ((positivos / total) * 100).toFixed(1) : '0.0';
    const porcentajeAtencion = total > 0 ? ((atencion / total) * 100).toFixed(1) : '0.0';

    // Crear el contenido HTML del PDF
    const contenidoHtml = convertirMarkdownAPdfHtml(informe);

    const htmlContent = `
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2c5282; padding-bottom: 20px;">
        <h1 style="color: #2c5282; font-size: 24px; margin: 0 0 10px 0; font-weight: bold;">INFORME NEUROEMOCIONAL</h1>
        <p style="color: #666; margin: 0; font-size: 14px;">Análisis Científico del Bienestar Psicoemocional</p>
      </div>

      <div style="margin-bottom: 25px; background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #2c5282;">
        <table style="width: 100%; margin-bottom: 10px;">
          <tr>
            <td><strong>Período:</strong> ${fechaInicio && fechaFin ? `${fechaInicio} a ${fechaFin}` : 'Completo'}</td>
            <td style="text-align: right;"><strong>Fecha de generación:</strong> ${new Date().toLocaleDateString('es-CL')}</td>
          </tr>
        </table>
        
        <div style="display: flex; justify-content: space-between; text-align: center; margin: 15px 0; padding: 15px; background: white; border-radius: 5px;">
          <div>
            <div style="font-size: 20px; font-weight: bold; color: #2c5282;">${total}</div>
            <div style="font-size: 11px; color: #666;">Registros</div>
          </div>
          <div>
            <div style="font-size: 20px; font-weight: bold; color: #2c5282;">${estudiantesUnicos}</div>
            <div style="font-size: 11px; color: #666;">Estudiantes</div>
          </div>
          <div>
            <div style="font-size: 20px; font-weight: bold; color: #38a169;">${porcentajePositivos}%</div>
            <div style="font-size: 11px; color: #666;">Positivos</div>
          </div>
          <div>
            <div style="font-size: 20px; font-weight: bold; color: #e53e3e;">${porcentajeAtencion}%</div>
            <div style="font-size: 11px; color: #666;">Atención</div>
          </div>
        </div>
      </div>

      <div style="margin-top: 30px;">
        ${contenidoHtml}
      </div>

      <div style="border-top: 2px solid #2c5282; padding-top: 20px; margin-top: 40px; font-size: 11px; color: #666;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="color: #2c5282; font-size: 12px;">SKOLAI Neuroscience</strong><br>
            <span style="font-size: 10px;">Sistema de Análisis Neuroemocional Avanzado</span>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 10px;">Generado: ${new Date().toLocaleDateString('es-CL')}</span><br>
            <span style="font-size: 10px; font-style: italic;">Confidencial - Uso interno del establecimiento educativo</span>
          </div>
        </div>
      </div>
    `;

    element.innerHTML = htmlContent;

    console.log('HTML del PDF creado, agregando al DOM...');

    // Agregar al DOM
    element.style.position = 'fixed';
    element.style.left = '0';
    element.style.top = '0';
    element.style.zIndex = '9999';
    document.body.appendChild(element);

    // Generar PDF
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: element.offsetWidth,
      height: element.offsetHeight
    });

    console.log('Canvas generado, creando PDF...');

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // Agregar primera página
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Agregar páginas adicionales si es necesario
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Limpiar
    document.body.removeChild(element);
    
    // Guardar
    const fecha = new Date().toISOString().split('T')[0];
    pdf.save(`informe-neuroemocional-${fecha}.pdf`);
    
    console.log('PDF profesional generado exitosamente');

  } catch (error) {
    console.error('Error detallado en generarPDF:', error);
    // Limpiar cualquier elemento que pueda haber quedado
    const elements = document.querySelectorAll('[style*="z-index: 9999"]');
    elements.forEach(el => el.remove());
    alert('Error al generar el PDF. Revisa la consola para más detalles.');
  }
};

  // Estadísticas para la UI
  const estadisticas = {
    total: checkins.length,
    positivos: checkins.filter(c => ['Bien', 'Muy Feliz'].includes(c.emocion)).length,
    atencion: checkins.filter(c => ['Enojado', 'Ansioso'].includes(c.emocion)).length,
    estudiantesUnicos: new Set(checkins.map(c => c.estudiante_nombre)).size
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 p-4 lg:ml-64 ml-0 pt-16 lg:pt-8 flex items-center justify-center">
        <div className="text-white text-xl">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 p-4 lg:ml-64 ml-0 pt-16 lg:pt-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Métricas Avanzadas de Bienestar</h1>
          <p className="text-white/70"> Informes inteligentes para la monitorización de la salud emocional</p>
        </div>

        {/* Cards de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">{estadisticas.total}</div>
            <div className="text-white/80">Total Check-ins</div>
          </GlassCard>
          
          <GlassCard className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">{estadisticas.positivos}</div>
            <div className="text-white/80">Emociones Positivas</div>
          </GlassCard>
          
          <GlassCard className="text-center">
            <div className="text-3xl font-bold text-red-400 mb-2">{estadisticas.atencion}</div>
            <div className="text-white/80">Requieren Atención</div>
          </GlassCard>
          
          <GlassCard className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{estadisticas.estudiantesUnicos}</div>
            <div className="text-white/80">Estudiantes Únicos</div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel de configuración */}
          <div className="lg:col-span-1">
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Configurar Informe</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Tipo de Informe
                  </label>
                  <select 
                    value={tipoInforme}
                    onChange={(e) => setTipoInforme(e.target.value)}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="general">Informe General</option>
                    <option value="estudiantes">Análisis por Estudiante</option>
                    <option value="tendencias">Tendencias Temporales</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <button
                  onClick={generarInformeIA}
                  disabled={generando}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {generando ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generando con con inteligencia artificial avanzada...
                    </>
                  ) : (
                    '🧠 Generar Informe '
                  )}
                </button>
              </div>
            </GlassCard>
          </div>

          {/* Panel de resultados */}
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Resultado del Informe</h3>
                <div className="flex gap-2">
  {informe && !informe.includes('Error') && !informe.includes('Sin Datos') && !informe.includes('Conectando') && (
    <>
      <button
        onClick={() => navigator.clipboard.writeText(informe)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm"
      >
        📋 Copiar
      </button>
      <button
        onClick={generarPDF}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm"
      >
        📄 Generar PDF
      </button>
    </>
  )}
</div>
              </div>
              
              {informe ? (
                <div className="bg-white/5 rounded-lg p-6 max-h-[600px] overflow-y-auto">
                  <div className="text-white prose prose-invert max-w-none">
                    <div 
                      className="whitespace-pre-wrap leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: informe
                          .replace(/\n/g, '<br>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-300">$1</strong>')
                          .replace(/\#\#\# (.*?)(<br>|$)/g, '<h3 class="text-lg font-semibold mt-6 mb-3 text-blue-300">$1</h3>')
                          .replace(/\#\# (.*?)(<br>|$)/g, '<h2 class="text-xl font-bold mt-8 mb-4 text-green-300 border-b border-white/20 pb-2">$1</h2>')
                          .replace(/\- (.*?)(<br>|$)/g, '<li class="ml-4 mb-2 flex items-start"><span class="mr-2">•</span>$1</li>')
                          .replace(/\d+\. (.*?)(<br>|$)/g, '<li class="ml-4 mb-2 flex items-start"><span class="mr-2 text-yellow-400">$1.</span>$2</li>')
                      }} 
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 rounded-lg p-8 text-center">
                  <div className="text-6xl mb-4">🧠</div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {generando ? 'Analizando con inteligencia artificial avanzada...' : 'Informe Psicológico Educativo'}
                  </h3>
                  <p className="text-white/70 mb-4">
                    {generando 
                      ? 'inteligencia artificial está analizando los patrones emocionales con enfoque psicológico...' 
                      : 'Configura los parámetros y genera un informe profesional con análisis psicológico y estrategias educativas.'
                    }
                  </p>
                  
                  {!generando && (
                    <div className="mt-6 space-y-4">
                      <div className="p-4 bg-white/10 rounded-lg text-left">
                        <h4 className="font-semibold text-white mb-3 text-center">📋 ¿Qué incluirá el informe?</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-white/70">
                          <div className="flex items-center"><span className="mr-2">•</span> Análisis psicológico detallado</div>
                          <div className="flex items-center"><span className="mr-2">•</span> Diagnóstico neuroemocional</div>
                          <div className="flex items-center"><span className="mr-2">•</span> Estrategias de intervención</div>
                          <div className="flex items-center"><span className="mr-2">•</span> Plan de seguimiento</div>
                          <div className="flex items-center"><span className="mr-2">•</span> Recomendaciones docentes</div>
                          <div className="flex items-center"><span className="mr-2">•</span> Protocolos de actuación</div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                        <p className="text-blue-300 text-sm">
                          <strong></strong><br/>
                          Análisis profesional con inteligencia artificial avanzada
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Informes;