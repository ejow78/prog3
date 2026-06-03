import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Trophy } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-primary-dark text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark to-primary opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 animate-fade-in-down">
            Proyectá tu <span className="text-white underline decoration-white/50 underline-offset-8">futuro</span> con nosotros
          </h1>
          <p className="text-lg md:text-xl text-slate-200 max-w-2xl mb-10">
            En el IES La Cocha ofrecemos carreras terciarias de excelencia, con títulos oficiales y rápida salida laboral. Formación pública, gratuita y de calidad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/preinscripcion"
              className="px-8 py-4 bg-white text-primary font-bold rounded-lg hover:bg-slate-100 transition-colors shadow-lg flex items-center justify-center gap-2 group"
            >
              Inscribirme Ahora
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/carreras"
              className="px-8 py-4 bg-transparent hover:bg-white/10 text-white font-bold rounded-lg backdrop-blur-sm transition-colors border-2 border-white flex items-center justify-center"
            >
              Ver Oferta Académica
            </Link>
          </div>
        </div>
      </section>

      {/* Stats / Features */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-shadow">
              <div className="inline-flex p-4 rounded-full bg-blue-100 text-primary mb-4">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Excelencia Académica</h3>
              <p className="text-slate-600">Plan de estudios actualizado y docentes con amplia trayectoria.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-shadow">
              <div className="inline-flex p-4 rounded-full bg-blue-100 text-primary mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Comunidad Educativa</h3>
              <p className="text-slate-600">Acompañamiento personalizado durante toda tu trayectoria formativa.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-shadow">
              <div className="inline-flex p-4 rounded-full bg-blue-100 text-primary mb-4">
                <Trophy className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Títulos Oficiales</h3>
              <p className="text-slate-600">Validez nacional y alta inserción en el mercado laboral.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
