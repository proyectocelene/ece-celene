import { type Subjective } from '@/entities/clinical-note/model/schemas';
import { Input } from '@/shared/ui';

interface SubjectiveFormProps {
  value: Subjective;
  onChange: (value: Subjective) => void;
}

export function SubjectiveForm({ value, onChange }: SubjectiveFormProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      <Input
        label="Motivo de Consulta *"
        placeholder="Ej. Cefalea intensa de 3 días de evolución, control de diabetes..."
        value={value.reasonForVisit}
        onChange={(e) => onChange({ ...value, reasonForVisit: e.target.value })}
      />

      <div className="space-y-1.5 text-left">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          Padecimiento Actual (Semiología y Cronología) *
        </label>
        <textarea
          rows={4}
          value={value.currentIllness}
          onChange={(e) => onChange({ ...value, currentIllness: e.target.value })}
          placeholder="Inicio, evolución, características del síntoma principal, factores agravantes o atenuantes, tratamientos previos recibidos..."
          className="block w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="space-y-1.5 text-left">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          Interrogatorio por Aparatos y Sistemas (Opcional)
        </label>
        <textarea
          rows={3}
          value={value.systemsReview}
          onChange={(e) => onChange({ ...value, systemsReview: e.target.value })}
          placeholder="Respiratorio, cardiovascular, digestivo, genitourinario, musculoesquelético, nervioso, piel y anexos..."
          className="block w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>
    </div>
  );
}
