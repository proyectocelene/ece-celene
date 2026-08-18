import type { LabOrder } from '@/entities/clinical-note/model/schemas';
import { Input, Select } from '@/shared/ui';
import { TestTubes, CheckSquare, Square } from 'lucide-react';

interface LabOrderFormProps {
  value: LabOrder;
  onChange: (order: LabOrder) => void;
}

const COMMON_STUDIES = [
  'Biometría Hemática Completa (BHC)',
  'Química Sanguínea (6 elementos: Glucosa, Urea, Creatinina, Ác. Úrico, Colesterol, Triglicéridos)',
  'Examen General de Orina (EGO)',
  'Perfil Lipídico Completo',
  'Hemoglobina Glucosilada (HbA1c)',
  'Pruebas de Funcionamiento Hepático (PFH)',
  'Perfil Tiroideo (TSH, T3, T4 Libre)',
  'Tele de Tórax (PA)',
  'Ultrasonido Abdominal / Pélvico',
  'Electrocardiograma (EKG) de 12 derivaciones',
];

export function LabOrderForm({ value, onChange }: LabOrderFormProps) {
  const toggleStudy = (studyName: string) => {
    const exists = value.studies.includes(studyName);
    const updated = exists
      ? value.studies.filter((s) => s !== studyName)
      : [...value.studies, studyName];
    onChange({
      ...value,
      studies: updated,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150 text-left">
      <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-900">
          <TestTubes className="w-4 h-4 text-indigo-600" />
          <span>Solicitud de Estudios de Laboratorio y Gabinete</span>
        </div>

        {/* Common studies checklist */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Seleccionar Estudios Frecuentes:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {COMMON_STUDIES.map((study) => {
              const isChecked = value.studies.includes(study);
              return (
                <button
                  key={study}
                  type="button"
                  onClick={() => toggleStudy(study)}
                  className={`p-2.5 rounded-xl border text-xs text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                    isChecked
                      ? 'border-indigo-500 bg-indigo-50/80 text-indigo-950 font-semibold shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  )}
                  <span>{study}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Additional studies & Instructions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="sm:col-span-2">
            <Input
              label="Otros Estudios o Especificaciones"
              placeholder="Ej. Coproparasitoscópico x 3, Urocultivo con antibiograma..."
              value={value.otherStudies || ''}
              onChange={(e) => onChange({ ...value, otherStudies: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Horas Ayuno"
              type="number"
              value={value.fastingHours ?? 8}
              onChange={(e) => onChange({ ...value, fastingHours: parseInt(e.target.value, 10) || 0 })}
            />

            <Select
              label="Carácter"
              value={value.urgency}
              onChange={(e) => onChange({ ...value, urgency: e.target.value as LabOrder['urgency'] })}
            >
              <option value="Ordinario">Ordinario</option>
              <option value="Urgente">Urgente</option>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Indicaciones Clínicas para el Laboratorio o Gabinete
          </label>
          <textarea
            rows={2}
            value={value.clinicalNotes || ''}
            onChange={(e) => onChange({ ...value, clinicalNotes: e.target.value })}
            placeholder="Sospecha diagnóstica, motivo de estudio o indicaciones especiales para la toma de muestra..."
            className="block w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>
    </div>
  );
}
