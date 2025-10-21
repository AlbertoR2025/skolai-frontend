import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyDy6Iy9YqrVchNzmhgdiFQNKZLY0vO-yHE';
const genAI = new GoogleGenerativeAI(API_KEY);

export const generateInformeConIA = async (
  estudiantes: any[],
  checkins: any[],
  incidentes: any[]
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Eres un psicólogo educacional experto. Genera un informe mensual detallado basándote en los siguientes datos de un colegio:

ESTUDIANTES (${estudiantes.length} total):
${estudiantes.map(e => `- ${e.nombre} ${e.apellido} (${e.curso})`).join('\n')}

CHECK-INS EMOCIONALES (${checkins.length} registros):
${checkins.map(c => `- ${c.nombre}: ${c.emoji} ${c.emocion} - "${c.descripcion}"`).join('\n')}

INCIDENTES DE CONVIVENCIA (${incidentes.length} casos):
${incidentes.map(i => `- ${i.estudiante}: ${i.tipo} - "${i.descripcion}"`).join('\n')}

Por favor, genera un informe profesional que incluya:
1. Resumen ejecutivo del clima emocional
2. Análisis de patrones emocionales detectados
3. Identificación de estudiantes que requieren atención especial
4. Recomendaciones concretas para profesores y directivos
5. Sugerencias de intervenciones preventivas

El informe debe ser profesional, empático y orientado a la acción.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generando informe con Gemini:', error);
    throw new Error('Error al conectar con la IA. Verifica la configuración de la API Key.');
  }
};
