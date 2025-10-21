import { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import { generateInformeConIA } from '../services/gemini';
import jsPDF from 'jspdf';

const Informes = () => {
  const [loading, setLoading] = useState(false);
  const [informe, setInforme] = useState('');
  const [stats, setStats] = useState({
    estudiantes: 0,
    checkins: 0,
    incidentes: 0
  });

  useEffect(() => {
    const estudiantes = JSON.parse(localStorage.getItem('skolai_estudiantes') || '[]');
    const checkins = JSON.parse(localStorage.getItem('skolai_checkins') || '[]');
    const incidentes = JSON.parse(localStorage.getItem('skolai_incidentes') || '[]');
    
    setStats({
      estudiantes: estudiantes.length,
      checkins: checkins.length,
      incidentes: incidentes.length
    });
  }, []);

  const handleGenerateInforme = async () => {
    setLoading(true);
    setInforme('');

    try {
      const estudiantes = JSON.parse(localStorage.getItem('skolai_estudiantes') || '[]');
      const checkins = JSON.parse(localStorage.getItem('skolai_checkins') || '[]');
      const incidentes = JSON.parse(localStorage.getItem('skolai_incidentes') || '[]');

      if (estudiantes.length === 0 && checkins.length === 0) {
        setInforme('⚠️ No hay suficientes datos para generar un informe. Agrega estudiantes y realiza check-ins emocionales primero.');
        setLoading(false);
        return;
      }

      const resultado = await generateInformeConIA(estudiantes, checkins, incidentes);
      setInforme(resultado);
    } catch (error) {
      setInforme('❌ Error al generar el informe. Por favor, intenta nuevamente.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    
    // Título
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Informe Octubre 2025', margin, margin);
    
    // Fecha
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${new Date().toLocaleDateString('es-CL')}`, margin, margin + 10);
    
    // Contenido del informe
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(informe, maxWidth);
    let y = margin + 25;
    
    lines.forEach((line: string) => {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 7;
    });
    
    // Guardar PDF
    doc.save(`Informe_${new Date().toLocaleDateString('es-CL').replace(/\//g, '-')}.pdf`);
  };

  return (
    <div className="lg:ml-64 ml-0 p-4 lg:p-8 pt-16 lg:pt-8">
      <h1 className="text-4xl font-bold text-white mb-8">🤖 Informes con IA</h1>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <GlassCard>
          <div className="text-center">
            <div className="text-5xl mb-2">👨‍🎓</div>
            <p className="text-3xl font-bold text-white">{stats.estudiantes}</p>
            <p className="text-white/70">Estudiantes</p>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-center">
            <div className="text-5xl mb-2">💭</div>
            <p className="text-3xl font-bold text-white">{stats.checkins}</p>
            <p className="text-white/70">Check-ins</p>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-center">
            <div className="text-5xl mb-2">⚠️</div>
            <p className="text-3xl font-bold text-white">{stats.incidentes}</p>
            <p className="text-white/70">Incidentes</p>
          </div>
        </GlassCard>
      </div>

      {/* Botón para generar informe */}
      <div className="mb-8">
        <button
          onClick={handleGenerateInforme}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-lg transition duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generando informe con IA...
            </span>
          ) : (
            '🤖 Generar Informe Mensual con IA'
          )}
        </button>
      </div>

      {/* Informe generado */}
      {informe && (
        <GlassCard>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">📋 Informe Generado</h2>
            <button
              onClick={handleDescargarPDF}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
            >
              📥 Descargar PDF
            </button>
          </div>
          <div className="text-white whitespace-pre-wrap leading-relaxed">
            {informe}
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default Informes;
