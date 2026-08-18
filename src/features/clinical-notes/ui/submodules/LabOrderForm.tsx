import type { LabOrder } from '@/entities/clinical-note/model/schemas';
import { LAB_STUDY_PREPARATIONS } from '@/entities/catalogs/data/clinicalTemplatesData';
import { Input, Select, Button } from '@/shared/ui';
import { TestTubes, CheckSquare, Square, Info, Sparkles, Printer } from 'lucide-react';

interface LabOrderFormProps {
  value: LabOrder;
  onChange: (order: LabOrder) => void;
  onPrintLabOrder?: () => void;
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
  'Antígeno Prostático Específico (PSA)',
  'Mastografía Bilateral',
  'Papanicolaou / Citología Cervical',
];

export function LabOrderForm({ value, onChange, onPrintLabOrder }: LabOrderFormProps) {
  // Construye las instrucciones de preparación para los estudios seleccionados
  const buildPreparationNotes = (studies: string[], currentCustomNotes = ''): string => {
    const prepItems = studies
      .map((s) => {
        const prep = LAB_STUDY_PREPARATIONS[s];
        return prep ? `• ${s}: ${prep}` : null;
      })
      .filter(Boolean);

    if (prepItems.length === 0) return currentCustomNotes;

    const prepBlock = `INDICACIONES DE PREPARACIÓN AL PACIENTE:\n${prepItems.join('\n')}`;

    // Si ya contenía notas previas que no eran el bloque automático
    if (currentCustomNotes && !currentCustomNotes.includes('INDICACIONES DE PREPARACIÓN AL PACIENTE:')) {
      return `${prepBlock}\n\nNotas adicionales: ${currentCustomNotes}`;
    }

    return prepBlock;
  };

  const toggleStudy = (studyName: string) => {
    const exists = value.studies.includes(studyName);
    const updatedStudies = exists
      ? value.studies.filter((s) => s !== studyName)
      : [...value.studies, studyName];

    // Auto-ajustar horas de ayuno si se selecciona química sanguínea o perfil lipídico
    let fastingHours = value.fastingHours ?? 8;
    if (!exists) {
      if (studyName.includes('Perfil Lipídico') || studyName.includes('Química Sanguínea')) {
        fastingHours = Math.max(fastingHours, 8);
      }
    }

    const newNotes = buildPreparationNotes(updatedStudies, value.clinicalNotes || '');

    onChange({
      ...value,
      studies: updatedStudies,
      fastingHours,
      clinicalNotes: newNotes,
    });
  };

  const handleApplyAllPreps = () => {
    const newNotes = buildPreparationNotes(value.studies, value.clinicalNotes || '');
    onChange({
      ...value,
      clinicalNotes: newNotes,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150 text-left font-sans">
      <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-900">
            <TestTubes className="w-4 h-4 text-indigo-600" />
            <span>Solicitud de Estudios de Laboratorio y Gabinete</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {value.studies.length > 0 && (
              <button
                type="button"
                onClick={handleApplyAllPreps}
                className="text-[11px] font-semibold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Actualizar Indicaciones
              </button>
            )}

            {onPrintLabOrder && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                leftIcon={<Printer className="w-4 h-4" />}
                onClick={onPrintLabOrder}
                disabled={value.studies.length === 0 && !value.otherStudies}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-500/20"
                title="Imprimir directamente la solicitud con los estudios seleccionados"
              >
                Vista Previa e Imprimir Orden de Labs
              </Button>
            )}
          </div>
        </div>

        {/* Common studies checklist */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
            Seleccionar Estudios Frecuentes:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {COMMON_STUDIES.map((study) => {
              const isChecked = value.studies.includes(study);
              const hasPrep = Boolean(LAB_STUDY_PREPARATIONS[study]);

              return (
                <button
                  key={study}
                  type="button"
                  onClick={() => toggleStudy(study)}
                  className={`p-2.5 rounded-xl border text-xs text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                    isChecked
                      ? 'border-indigo-500 bg-indigo-50/80 text-indigo-950 font-bold shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <span>{study}</span>
                    {hasPrep && (
                      <span className="text-[10px] text-indigo-700 font-normal block leading-tight">
                        {LAB_STUDY_PREPARATIONS[study]}
                      </span>
                    )}
                  </div>
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
              placeholder="Ej. Coproparasitoscópico x 3, Urocultivo con antibiograma, TAC de cráneo..."
              value={value.otherStudies || ''}
              onChange={(e) => onChange({ ...value, otherStudies: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Horas de Ayuno"
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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Instrucciones de Preparación e Indicaciones Clínicas para el Paciente
            </label>
            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <Info className="w-3 h-3 text-indigo-500" />
              Se imprimen automáticamente en la orden
            </span>
          </div>
          <textarea
            rows={4}
            value={value.clinicalNotes || ''}
            onChange={(e) => onChange({ ...value, clinicalNotes: e.target.value })}
            placeholder="Indicaciones especiales de ayuno, preparación del paciente o sospecha diagnóstica para el laboratorio..."
            className="block w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 leading-relaxed focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>
    </div>
  );
}
