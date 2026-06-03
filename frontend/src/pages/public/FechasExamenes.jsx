import { Calendar, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function FechasExamenes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const groupFechas = (flatFechas) => {
    const map = {};
    
    flatFechas.forEach(item => {
      const turnoKey = item.turno;
      if (!map[turnoKey]) {
        map[turnoKey] = {
          turno: turnoKey,
          llamadosMap: {}
        };
      }
      
      const llamadoKey = item.llamado;
      if (!map[turnoKey].llamadosMap[llamadoKey]) {
        map[turnoKey].llamadosMap[llamadoKey] = {
          nombre: llamadoKey,
          fechas: item.llamadoFechas,
          materias: []
        };
      }
      
      // Formatear fecha de YYYY-MM-DD a DD/MM/YYYY
      let formattedDate = item.fecha;
      try {
        if (item.fecha && item.fecha.includes('-')) {
          const parts = item.fecha.split('-');
          if (parts.length === 3) {
            formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
          }
        }
      } catch (e) {
        console.error("Error al formatear fecha", e);
      }
      
      map[turnoKey].llamadosMap[llamadoKey].materias.push({
        carrera: item.carrera,
        materia: item.materia,
        fecha: formattedDate,
        hora: item.hora,
        tribunal: item.tribunal
      });
    });
    
    return Object.values(map).map(turnoObj => {
      const llamadosList = Object.values(turnoObj.llamadosMap);
      llamadosList.sort((a, b) => {
        const order = { 'Primer Llamado': 1, 'Segundo Llamado': 2, 'Llamado Especial': 3 };
        const aOrd = order[a.nombre] || 99;
        const bOrd = order[b.nombre] || 99;
        return aOrd - bOrd;
      });
      return {
        turno: turnoObj.turno,
        llamados: llamadosList
      };
    });
  };

  useEffect(() => {
    const fetchFechas = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/fechas-examenes');
        if (!response.ok) throw new Error('Error al obtener el cronograma de exámenes');
        const data = await response.json();
        
        const grouped = groupFechas(data);
        setTurnos(grouped);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFechas();
  }, []);

  const filteredTurnos = turnos.map(t => {
    const matchingLlamados = t.llamados.map(ll => {
      const matchingMaterias = ll.materias.filter(m => {
        const query = searchTerm.toLowerCase().trim();
        const matchMateria = Array.isArray(m.materia)
          ? m.materia.some(x => x.toLowerCase().includes(query))
          : m.materia.toLowerCase().includes(query);
        const matchCarrera = m.carrera.toLowerCase().includes(query);
        return matchMateria || matchCarrera;
      });
      return { ...ll, materias: matchingMaterias };
    }).filter(ll => ll.materias.length > 0);
    
    return { ...t, llamados: matchingLlamados };
  }).filter(t => t.llamados.length > 0);

  if (loading) {
    return (
      <div className="bg-slate-50 py-16 min-h-screen flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-slate-500 font-semibold text-sm">Cargando fechas de exámenes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-50 py-16 min-h-screen flex flex-col justify-center items-center px-4 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl max-w-md shadow-sm">
          <p className="font-bold text-lg mb-2">Error al cargar cronograma</p>
          <p className="text-sm font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (turnos.length === 0) {
    return (
      <div className="bg-slate-50 py-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Mesas de Exámenes</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Consulta el calendario de mesas de exámenes finales para los próximos llamados.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center max-w-2xl mx-auto">
            <Calendar className="h-16 w-16 text-slate-350 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">No hay fechas de exámenes programadas</h3>
            <p className="text-slate-500 font-medium">Por el momento no se han registrado cronogramas de exámenes en el sistema administrativo.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 py-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Mesas de Exámenes</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Consulta el calendario de mesas de exámenes finales para los próximos llamados.
          </p>
        </div>

        <div className="max-w-md mx-auto mb-10 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all shadow-sm"
            placeholder="Buscar materia o carrera..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredTurnos.length > 0 ? (
          filteredTurnos.map((turno, tIndex) => (
            <div key={tIndex} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="h-8 w-8 text-primary" />
                <h2 className="text-2xl font-bold text-slate-800">Turno: {turno.turno}</h2>
              </div>

              <div className="space-y-8">
                {turno.llamados.map((llamado, lIndex) => (
                  <div key={lIndex} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex justify-between items-center flex-wrap gap-4">
                      <h3 className="text-lg font-bold text-slate-800">{llamado.nombre}</h3>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {llamado.fechas}
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Carrera</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Materia</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha y Hora</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tribunal</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                          {llamado.materias.map((materia, mIndex) => (
                            <tr key={mIndex} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 text-sm font-medium text-slate-900">{materia.carrera}</td>
                              <td className="px-6 py-4 text-sm text-slate-650 font-bold uppercase">
                                <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                                  {Array.isArray(materia.materia) ? (
                                    materia.materia.map((m, idx) => (
                                      <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-805 border border-slate-200 uppercase">
                                        {m}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-805 border border-slate-200 uppercase">
                                      {materia.materia}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                <div className="flex flex-col">
                                  <span className="font-bold text-slate-850">{materia.fecha}</span>
                                  <span className="text-xs font-semibold">{materia.hora} hs</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">{materia.tribunal}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center max-w-lg mx-auto">
            <p className="text-slate-500 font-bold">No se encontraron exámenes finales que coincidan con la búsqueda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
