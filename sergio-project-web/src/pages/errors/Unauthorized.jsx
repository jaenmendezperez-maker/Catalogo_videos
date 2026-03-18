import { Link, useNavigate } from 'react-router-dom';

function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#070F1C] min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400 mb-4">
          403
        </p>
        <h1 className="text-2xl font-bold text-white mb-2">Acceso denegado</h1>
        <p className="text-slate-400 text-sm mb-8 max-w-sm mx-auto">
          No tienes permisos para ver esta página. Necesitas una cuenta con rol de administrador.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-all"
          >
            Volver atrás
          </button>
          <Link
            to="/"
            className="bg-cyan-500 hover:bg-cyan-400 text-[#070F1C] font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Unauthorized;