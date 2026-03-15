import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

// Rutas donde NO queremos mostrar Navbar ni Footer
// (login y registro ya tienen su propio layout completo)
const FULL_SCREEN_ROUTES = ['/login', '/registro'];

function Layout() {
  const { pathname } = useLocation();
  const isFullScreen = FULL_SCREEN_ROUTES.includes(pathname);

  // Login y Registro renderizan su propia UI completa
  if (isFullScreen) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#070F1C]">
      <Navbar />

      {/* Contenido de la página activa */}
      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default Layout;