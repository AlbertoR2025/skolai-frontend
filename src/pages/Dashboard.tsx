import { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    profesores: 0,
    cursos: 0,
    comunicados: 0,
    estudiantes: 0,
    checkins: 0,
    incidentes: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = () => {
    try {
      const profesores = JSON.parse(localStorage.getItem('skolai_profesores') || '[]');
      const cursos = JSON.parse(localStorage.getItem('skolai_cursos') || '[]');
      const comunicados = JSON.parse(localStorage.getItem('skolai_comunicados') || '[]');
      const estudiantes = JSON.parse(localStorage.getItem('skolai_estudiantes') || '[]');
      const checkins = JSON.parse(localStorage.getItem('skolai_checkins') || '[]');
      const incidentes = JSON.parse(localStorage.getItem('skolai_incidentes') || '[]');
      
      setStats({
        profesores: profesores.length,
        cursos: cursos.length,
        comunicados: comunicados.length,
        estudiantes: estudiantes.length,
        checkins: checkins.length,
        incidentes: incidentes.length
      });
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  // Datos para gráficos
  const dataModulos = [
    { name: 'Estudiantes', value: stats.estudiantes, color: '#8b5cf6' },
    { name: 'Profesores', value: stats.profesores, color: '#ec4899' },
    { name: 'Cursos', value: stats.cursos, color: '#3b82f6' },
    { name: 'Comunicados', value: stats.comunicados, color: '#10b981' },
  ];

  const dataBienestar = [
    { name: 'Check-ins', cantidad: stats.checkins },
    { name: 'Incidentes', cantidad: stats.incidentes },
  ];

  const dataActividad = [
    { mes: 'Ene', actividad: 12 },
    { mes: 'Feb', actividad: 19 },
    { mes: 'Mar', actividad: 25 },
    { mes: 'Abr', actividad: 32 },
    { mes: 'May', actividad: 28 },
    { mes: 'Jun', actividad: 35 },
  ];

  return (
    <div className="lg:ml-64 ml-0 p-4 lg:p-8 pt-16 lg:pt-8">
      <h1 className="text-4xl font-bold text-white mb-8">📊 Panel General</h1>
      
      {loading ? (
        <div className="text-center text-white text-xl">⏳ Cargando estadísticas...</div>
      ) : (
        <>
          {/* Estadísticas Principales */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <GlassCard className="transform hover:scale-105 transition-transform">
              <div className="flex flex-col items-center justify-center p-4">
                <div className="text-5xl mb-2">👨‍🎓</div>
                <p className="text-3xl font-bold text-white">{stats.estudiantes}</p>
                <p className="text-sm text-white/70">Estudiantes</p>
              </div>
            </GlassCard>
            
            <GlassCard className="transform hover:scale-105 transition-transform">
              <div className="flex flex-col items-center justify-center p-4">
                <div className="text-5xl mb-2">👨‍🏫</div>
                <p className="text-3xl font-bold text-white">{stats.profesores}</p>
                <p className="text-sm text-white/70">Profesores</p>
              </div>
            </GlassCard>
            
            <GlassCard className="transform hover:scale-105 transition-transform">
              <div className="flex flex-col items-center justify-center p-4">
                <div className="text-5xl mb-2">📚</div>
                <p className="text-3xl font-bold text-white">{stats.cursos}</p>
                <p className="text-sm text-white/70">Cursos</p>
              </div>
            </GlassCard>
            
            <GlassCard className="transform hover:scale-105 transition-transform">
              <div className="flex flex-col items-center justify-center p-4">
                <div className="text-5xl mb-2">💭</div>
                <p className="text-3xl font-bold text-white">{stats.checkins}</p>
                <p className="text-sm text-white/70">Check-ins</p>
              </div>
            </GlassCard>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Gráfico de Barras - Bienestar Emocional */}
            <GlassCard>
              <h3 className="text-xl font-bold text-white mb-4">📊 Bienestar Emocional</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dataBienestar}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#fff" />
                  <YAxis stroke="#fff" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="cantidad" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>

           {/* Gráfico Circular - Distribución de Módulos */}
<GlassCard>
  <h3 className="text-xl font-bold text-white mb-4">🎯 Distribución de Datos</h3>
  {dataModulos.some(d => d.value > 0) ? (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={dataModulos}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(entry) => entry.value > 0 ? `${entry.name}: ${entry.value}` : ''}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {dataModulos.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  ) : (
    <div className="flex items-center justify-center h-[250px] text-white/60">
      No hay datos para mostrar
    </div>
  )}
</GlassCard>

          </div>

          {/* Gráfico de Línea - Tendencia */}
          <GlassCard className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">📈 Tendencia de Actividad</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dataActividad}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="mes" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="actividad" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
          
          {/* Información del Sistema */}
          <GlassCard>
            <h2 className="text-2xl font-bold text-white mb-4">✨ Bienvenido a Skolai</h2>
            <p className="text-white/90 text-lg leading-relaxed mb-4">
              Sistema de gestión escolar con IA inspirado en MÜUD. Gestiona estudiantes, profesores, cursos y monitorea el bienestar emocional.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="text-white font-bold mb-2">🎯 Funcionalidades Actuales</h3>
                <ul className="text-white/80 space-y-1 text-sm">
                  <li>✅ Gestión de estudiantes</li>
                  <li>✅ Gestión de profesores</li>
                  <li>✅ Administración de cursos</li>
                  <li>✅ Sistema de comunicados</li>
                  <li>✅ Convivencia escolar</li>
                  <li>✅ Check-in emocional con IA</li>
                  <li>✅ Estadísticas en tiempo real</li>
                </ul>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="text-white font-bold mb-2">💡 Próximas Mejoras</h3>
                <ul className="text-white/80 space-y-1 text-sm">
                  <li>🔄 Base de datos persistente</li>
                  <li>🔐 Sistema de autenticación</li>
                  <li>📱 Aplicación móvil nativa</li>
                  <li>🔔 Notificaciones push</li>
                  <li>📈 Análisis predictivo</li>
                  <li>🤖 IA con modelo real</li>
                </ul>
              </div>
            </div>
          </GlassCard>
        </>
      )}
    </div>
  );
};

export default Dashboard;
