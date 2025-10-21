import { Link } from 'react-router-dom';
import { useState } from 'react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Botón Hamburguesa (solo móvil) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white/20 backdrop-blur-lg p-3 rounded-lg text-white"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Overlay oscuro cuando está abierto en móvil */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed left-0 top-0 h-screen bg-white/10 backdrop-blur-lg border-r border-white/20 p-6 z-40 transition-transform duration-300
          w-64 overflow-y-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <h1 className="text-3xl font-bold text-white mb-10">SKOLAI</h1>

        <nav className="space-y-4">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-3 text-white hover:bg-white/20 p-3 rounded-lg transition"
          >
            <span>📊</span>
            <span>Panel General</span>
          </Link>

          <Link
            to="/estudiantes"
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-3 text-white hover:bg-white/20 p-3 rounded-lg transition"
          >
            <span>👨‍🎓</span>
            <span>Estudiantes</span>
          </Link>

          <Link
            to="/profesores"
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-3 text-white hover:bg-white/20 p-3 rounded-lg transition"
          >
            <span>👨‍🏫</span>
            <span>Profesores</span>
          </Link>

          <Link
            to="/cursos"
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-3 text-white hover:bg-white/20 p-3 rounded-lg transition"
          >
            <span>📚</span>
            <span>Cursos</span>
          </Link>

          <Link
            to="/comunicados"
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-3 text-white hover:bg-white/20 p-3 rounded-lg transition"
          >
            <span>📢</span>
            <span>Comunicados</span>
          </Link>

          <div className="border-t border-white/20 my-4"></div>

          <Link
            to="/convivencia"
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-3 text-white hover:bg-white/20 p-3 rounded-lg transition"
          >
            <span>🛡️</span>
            <span>Convivencia</span>
          </Link>

          <Link
            to="/checkin"
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-3 text-white hover:bg-white/20 p-3 rounded-lg transition"
          >
            <span>💭</span>
            <span>Check-in Emocional</span>
          </Link>

          <Link
            to="/informes"
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-3 text-white hover:bg-white/20 p-3 rounded-lg transition bg-purple-500/20"
          >
            <span>🤖</span>
            <span>Informes con IA</span>
          </Link>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
