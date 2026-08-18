import { type VitalSigns } from '@/entities/clinical-note/model/schemas';
import { ClinicalNoteService } from '@/entities/clinical-note/api/clinicalNoteService';
import { Input, Badge } from '@/shared/ui';
import { Activity, Gauge, Thermometer, Weight, Droplets, Wind } from 'lucide-react';

interface VitalSignsFormProps {
  value: VitalSigns;
  onChange: (value: VitalSigns) => void;
}

export function VitalSignsForm({ value, onChange }: VitalSignsFormProps) {
  const updateField = (field: keyof VitalSigns, val: string) => {
    const num = val === '' ? undefined : Number(val);
    onChange({
      ...value,
      [field]: num,
    });
  };

  const bmiCalc = ClinicalNoteService.calculateBMI(value.weightKg, value.heightCm);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Input
          label="T.A. Sistólica (mmHg)"
          type="number"
          placeholder="Ej. 120"
          value={value.bpSystolic ?? ''}
          onChange={(e) => updateField('bpSystolic', e.target.value)}
          leftIcon={<Gauge className="w-4 h-4 text-blue-500" />}
        />

        <Input
          label="T.A. Diastólica (mmHg)"
          type="number"
          placeholder="Ej. 80"
          value={value.bpDiastolic ?? ''}
          onChange={(e) => updateField('bpDiastolic', e.target.value)}
          leftIcon={<Gauge className="w-4 h-4 text-blue-500" />}
        />

        <Input
          label="Frec. Cardíaca (lpm)"
          type="number"
          placeholder="Ej. 75"
          value={value.heartRate ?? ''}
          onChange={(e) => updateField('heartRate', e.target.value)}
          leftIcon={<Activity className="w-4 h-4 text-rose-500" />}
        />

        <Input
          label="Frec. Respiratoria (rpm)"
          type="number"
          placeholder="Ej. 18"
          value={value.respiratoryRate ?? ''}
          onChange={(e) => updateField('respiratoryRate', e.target.value)}
          leftIcon={<Wind className="w-4 h-4 text-cyan-500" />}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Input
          label="Temperatura (°C)"
          type="number"
          step="0.1"
          placeholder="Ej. 36.5"
          value={value.temperature ?? ''}
          onChange={(e) => updateField('temperature', e.target.value)}
          leftIcon={<Thermometer className="w-4 h-4 text-amber-500" />}
        />

        <Input
          label="Peso (kg)"
          type="number"
          step="0.1"
          placeholder="Ej. 70.5"
          value={value.weightKg ?? ''}
          onChange={(e) => updateField('weightKg', e.target.value)}
          leftIcon={<Weight className="w-4 h-4 text-indigo-500" />}
        />

        <Input
          label="Talla (cm)"
          type="number"
          placeholder="Ej. 170"
          value={value.heightCm ?? ''}
          onChange={(e) => updateField('heightCm', e.target.value)}
          leftIcon={<Weight className="w-4 h-4 text-indigo-500" />}
        />

        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            I.M.C. Calculado
          </label>
          <div className="h-[38px] flex items-center gap-2 px-3 rounded-xl border border-slate-200 bg-slate-50">
            {bmiCalc ? (
              <>
                <span className="font-bold text-slate-800 text-sm font-mono">{bmiCalc.bmi}</span>
                <Badge variant={bmiCalc.color === 'emerald' ? 'success' : bmiCalc.color === 'amber' ? 'warning' : 'danger'} size="sm">
                  {bmiCalc.category}
                </Badge>
              </>
            ) : (
              <span className="text-xs text-slate-400">Ingresa peso y talla</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
        <Input
          label="Glucosa Capilar (mg/dL)"
          type="number"
          placeholder="Ej. 95"
          value={value.glucose ?? ''}
          onChange={(e) => updateField('glucose', e.target.value)}
          leftIcon={<Droplets className="w-4 h-4 text-emerald-500" />}
        />

        <Input
          label="Saturación SpO2 (%)"
          type="number"
          placeholder="Ej. 98"
          value={value.spO2 ?? ''}
          onChange={(e) => updateField('spO2', e.target.value)}
          leftIcon={<Wind className="w-4 h-4 text-blue-500" />}
        />
      </div>
    </div>
  );
}
