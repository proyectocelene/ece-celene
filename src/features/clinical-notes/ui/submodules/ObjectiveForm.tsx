import type { Objective } from '@/entities/clinical-note/model/schemas';
import { Button } from '@/shared/ui';
import { Activity, Sparkles, Check } from 'lucide-react';

interface ObjectiveFormProps {
  value: Objective;
  onChange: (objective: Objective) => void;
}

const NORMAL_TEMPLATES = {
  generalAppearance: 'Paciente consciente, orientado en tiempo, espacio y persona, edad biológica aparente concuerda con la cronológica, buena coloración e hidratación de piel y mucosas, marcha y actitud normales.',
  headAndNeck: 'Normocéfalo, pupilas isocóricas y normorreflecticas, narinas permeables, cavidad oral y faringe sin hiperemia ni exudados, amígdalas eutróficas. Cuello cilíndrico, móvil, sin adenopatías palpables ni ingurgitación yugular.',
  chestAndLungs: 'Tórax normolíneo con adecuada mecánica ventilatoria y simetría. Campos pulmonares bien ventilados con murmullo vesicular presente bilateral, sin ruidos agregados (estertores ni sibilancias). Ruidos cardíacos rítmicos y de buen tono, sin soplos ni galopes.',
  abdomen: 'Abdomen plano, blando, depresible, no doloroso a la palpación superficial ni profunda, sin datos de irritación peritoneal, sin visceromegalias palpables. Ruidos hidroaéreos presentes y de tono normal.',
  extremities: 'Extremidades simétricas, íntegras, arcos de movilidad articular completos, fuerza muscular 5/5 bilateral, pulsos periféricos palpables y simétricos, llenado capilar inmediato menor a 2 segundos, sin edema.',
  neurological: 'Funciones mentales superiores íntegras, pares craneales conservados sin alteraciones, fuerza y sensibilidad preservadas, reflejos osteotendinosos normorreflecticos (++/++++), sin signos meníngeos ni focalización neurológica.',
};

export function ObjectiveForm({ value, onChange }: ObjectiveFormProps) {
  const updateField = (field: keyof Objective, val: string) => {
    onChange({
      ...value,
      [field]: val,
    });
  };

  const handleFillAllNormal = () => {
    onChange({
      generalAppearance: NORMAL_TEMPLATES.generalAppearance,
      headAndNeck: NORMAL_TEMPLATES.headAndNeck,
      chestAndLungs: NORMAL_TEMPLATES.chestAndLungs,
      abdomen: NORMAL_TEMPLATES.abdomen,
      extremities: NORMAL_TEMPLATES.extremities,
      neurological: NORMAL_TEMPLATES.neurological,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150 text-left">
      {/* Top Banner with Fill All button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 uppercase tracking-wider">
          <Activity className="w-4 h-4 text-blue-600" />
          <span>Exploración Física Segmentaria</span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleFillAllNormal}
          leftIcon={<Sparkles className="w-3.5 h-3.5 text-blue-600" />}
          className="text-blue-800 bg-white hover:bg-blue-50 text-xs shadow-2xs font-semibold"
        >
          ✨ Llenar Toda la EF Normal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Habitus Exterior / Aspecto General */}
        <div className="space-y-1.5 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Habitus Exterior / Aspecto General
            </label>
            <button
              type="button"
              onClick={() => updateField('generalAppearance', NORMAL_TEMPLATES.generalAppearance)}
              className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3 h-3" /> Normal
            </button>
          </div>
          <textarea
            rows={3}
            value={value.generalAppearance || ''}
            onChange={(e) => updateField('generalAppearance', e.target.value)}
            placeholder="Facies, complexión, hidratación, marcha, orientación..."
            className="block w-full rounded-xl border border-slate-200 bg-slate-50/40 py-2 px-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* 2. Cabeza y Cuello */}
        <div className="space-y-1.5 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Cabeza, Ojos, Nariz, Oído, Garganta y Cuello
            </label>
            <button
              type="button"
              onClick={() => updateField('headAndNeck', NORMAL_TEMPLATES.headAndNeck)}
              className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3 h-3" /> Normal
            </button>
          </div>
          <textarea
            rows={3}
            value={value.headAndNeck || ''}
            onChange={(e) => updateField('headAndNeck', e.target.value)}
            placeholder="Pupilas, otoscopía, faringe, amígdalas, adenopatías cervicales, tiroides..."
            className="block w-full rounded-xl border border-slate-200 bg-slate-50/40 py-2 px-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* 3. Tórax y Pulmones */}
        <div className="space-y-1.5 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Tórax, Pulmones y Cardiovascular
            </label>
            <button
              type="button"
              onClick={() => updateField('chestAndLungs', NORMAL_TEMPLATES.chestAndLungs)}
              className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3 h-3" /> Normal
            </button>
          </div>
          <textarea
            rows={3}
            value={value.chestAndLungs || ''}
            onChange={(e) => updateField('chestAndLungs', e.target.value)}
            placeholder="Movimientos respiratorios, murmullo vesicular, ruidos agregados, ruidos cardíacos..."
            className="block w-full rounded-xl border border-slate-200 bg-slate-50/40 py-2 px-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* 4. Abdomen */}
        <div className="space-y-1.5 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Abdomen y Pelvis
            </label>
            <button
              type="button"
              onClick={() => updateField('abdomen', NORMAL_TEMPLATES.abdomen)}
              className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3 h-3" /> Normal
            </button>
          </div>
          <textarea
            rows={3}
            value={value.abdomen || ''}
            onChange={(e) => updateField('abdomen', e.target.value)}
            placeholder="Forma, palpación superficial y profunda, puntos dolorosos, peristalsis, visceromegalias..."
            className="block w-full rounded-xl border border-slate-200 bg-slate-50/40 py-2 px-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* 5. Extremidades */}
        <div className="space-y-1.5 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Extremidades y Columna
            </label>
            <button
              type="button"
              onClick={() => updateField('extremities', NORMAL_TEMPLATES.extremities)}
              className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3 h-3" /> Normal
            </button>
          </div>
          <textarea
            rows={3}
            value={value.extremities || ''}
            onChange={(e) => updateField('extremities', e.target.value)}
            placeholder="Simetría, movilidad, arcos de movimiento, pulsos periféricos, edema, llenado capilar..."
            className="block w-full rounded-xl border border-slate-200 bg-slate-50/40 py-2 px-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* 6. Neurológico */}
        <div className="space-y-1.5 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Neurológico y Estado Mental
            </label>
            <button
              type="button"
              onClick={() => updateField('neurological', NORMAL_TEMPLATES.neurological)}
              className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3 h-3" /> Normal
            </button>
          </div>
          <textarea
            rows={3}
            value={value.neurological || ''}
            onChange={(e) => updateField('neurological', e.target.value)}
            placeholder="Consciencia, orientación, pares craneales, reflejos osteotendinosos, sensibilidad..."
            className="block w-full rounded-xl border border-slate-200 bg-slate-50/40 py-2 px-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>
    </div>
  );
}
