import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas publicas
import Home from './pages/public/Home';
import Carreras from './pages/public/Carreras';
import Horarios from './pages/public/Horarios';
import Preinscripcion from './pages/public/Preinscripcion';
import Contacto from './pages/public/Contacto';
import FechasExamenes from './pages/public/FechasExamenes';
import InscripcionExamenes from './pages/public/InscripcionExamenes';

// Páginas de Admin
import AdminLogin from './pages/admin/AdminLogin';
import AdminRegister from './pages/admin/AdminRegister';
import Dashboard from './pages/admin/Dashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Routes>
            {/* Rutas Admin sin Navbar/Footer */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            <Route path="/admin/*" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

          {/* Rutas publicas */}
          <Route path="/*" element={
            <>
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/carreras" element={<Carreras />} />
                  <Route path="/horarios" element={<Horarios />} />
                  <Route path="/preinscripcion" element={<Preinscripcion />} />
                  <Route path="/contacto" element={<Contacto />} />
                  <Route path="/fechas-examenes" element={<FechasExamenes />} />
                  <Route path="/inscripcion-examenes" element={<InscripcionExamenes />} />
                </Routes>
              </main>
              <Footer />
            </>
          } />
        </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
