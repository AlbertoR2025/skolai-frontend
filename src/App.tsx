import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Estudiantes from './pages/Estudiantes';
import Profesores from './pages/Profesores';
import Cursos from './pages/Cursos';
import Comunicados from './pages/Comunicados';
import Convivencia from './pages/Convivencia';
import CheckinEmocional from './pages/CheckinEmocional';
import Informes from './pages/Informes';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/estudiantes" element={<Estudiantes />} />
          <Route path="/profesores" element={<Profesores />} />
          <Route path="/cursos" element={<Cursos />} />
          <Route path="/comunicados" element={<Comunicados />} />
          <Route path="/convivencia" element={<Convivencia />} />
          <Route path="/checkin" element={<CheckinEmocional />} />
          <Route path="/informes" element={<Informes />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
