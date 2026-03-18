import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="bg-[#070F1C] min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-4">
          404
        </p>
        <h1 className="text-2xl font-bold text-white mb-2">Página no encontrada</h1>
        <p className="text-slate-400 text-sm mb-8 max-w-sm mx-auto">
          La página que buscas no existe o fue movida a otra dirección.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-[#070F1C] font-semibold px-6 py-3 rounded-xl text-sm transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

export default NotFound;