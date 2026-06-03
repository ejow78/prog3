import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Institución */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">IES La Cocha</h3>
            <p className="text-sm mb-4">
              Formando profesionales comprometidos con el desarrollo regional desde hace más de 30 años. Educación superior pública, gratuita y de calidad.
            </p>
          </div>

          {/* Links rapidos */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/carreras" className="hover:text-accent transition-colors">Nuestras Carreras</Link>
              </li>
              <li>
                <Link to="/preinscripcion" className="hover:text-accent transition-colors">Preinscripción Online</Link>
              </li>
              <li>
                <Link to="/fechas-examenes" className="hover:text-accent transition-colors">Mesas de Exámenes</Link>
              </li>
              <li>
                <Link to="/contacto" className="hover:text-accent transition-colors">Contacto y Consultas</Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-white shrink-0" />
                <span>Sarmiento 150, La Cocha, Tucumán</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-white shrink-0" />
                <span>info@ieslacocha.edu.ar</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Edgar Javier Ortiz. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
