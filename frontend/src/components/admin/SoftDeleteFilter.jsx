import { Trash2, CheckCircle2 } from 'lucide-react';

export default function SoftDeleteFilter({ activeTab, onTabChange, totalActivos = 0, totalPapelera = 0 }) {
  return (
    <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 w-fit">
      <button
        type="button"
        onClick={() => onTabChange('activos')}
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          activeTab === 'activos'
            ? 'bg-white text-slate-800 shadow-2xs border border-slate-200/60'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
        }`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        <span>Activos</span>
        <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded-full text-[10px] font-extrabold border border-slate-200/60">
          {totalActivos}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('papelera')}
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          activeTab === 'papelera'
            ? 'bg-red-50 text-red-700 shadow-2xs border border-red-200'
            : 'text-slate-500 hover:text-red-700 hover:bg-red-50/60'
        }`}
      >
        <Trash2 className="w-3.5 h-3.5 text-red-500" />
        <span>Papelera</span>
        {totalPapelera > 0 && (
          <span className="px-1.5 py-0.2 bg-red-100 text-red-700 rounded-full text-[10px] font-extrabold border border-red-200">
            {totalPapelera}
          </span>
        )}
      </button>
    </div>
  );
}
