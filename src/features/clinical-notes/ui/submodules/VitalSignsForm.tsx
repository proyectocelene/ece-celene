import { type VitalSigns } from '@/entities/clinical-note/model/schemas';
import { ClinicalNoteService } from '@/entities/clinical-note/api/clinicalNoteService';
import { Input, Badge } from '@/shared/ui';
import {
  Activity,
  Gauge,
  Thermometer,
  Weight,
  Droplets,
  Wind,
  AlertTriangle,
  CheckCircle2,
  Scale,
} from 'lucide-react';

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
  const idealWeightCalc = ClinicalNoteService.calculateIdealWeight(value.heightCm, value.weightKg);
  const alerts = ClinicalNoteService.evaluateVitalSignsAlerts(value);

  return (
    <div className="space-y-5 animate-in fade-in duration-150 text-left font-sans">
      {/* Alertas Inteligentes de Signos Vitales Fuera de Rango */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs animate-in fade-in ${
                alert.level === 'danger'
                  ? 'bg-rose-50 border-rose-200 text-rose-950 font-medium'
                  : alert.level === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-950'
                  : 'bg-blue-50 border-blue-200 text-blue-950'
              }`}
            >
              <AlertTriangle
                className={`w-4 h-4 shrink-0 mt-0.5 ${
                  alert.level === 'danger'
                    ? 'text-rose-600'
                    : alert.level === 'warning'
                    ? 'text-amber-600'
                    : 'text-blue-600'
                }`}
              />
              <div className="space-y-0.5">
                <p className="font-bold">{alert.title}</p>
                <p className="text-[11px] leading-relaxed">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid 1: Presión, Frecuencia y Respiración */}
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

      {/* Grid 2: Somatometría, IMC y Peso Ideal */}
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
          label="Peso Actual (kg)"
          type="number"
          step="0.1"
          placeholder="Ej. 70.5"
          value={value.weightKg ?? ''}
          onChange={(e) => updateField('weightKg', e.target.value)}
          leftIcon={<Weight className="w-4 h-4 text-indigo-500" />}
        />

        <Input
          label="Talla / Altura (cm)"
          type="number"
          placeholder="Ej. 170"
          value={value.heightCm ?? ''}
          onChange={(e) => updateField('heightCm', e.target.value)}
          leftIcon={<Scale className="w-4 h-4 text-indigo-500" />}
        />

        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            I.M.C. Calculado
          </label>
          <div className="h-[38px] flex items-center gap-2 px-3 rounded-xl border border-slate-200 bg-slate-50">
            {bmiCalc ? (
              <>
                <span className="font-bold text-slate-800 text-sm font-mono">{bmiCalc.bmi}</span>
                <Badge
                  variant={
                    bmiCalc.color === 'emerald' ? 'success' : bmiCalc.color === 'amber' ? 'warning' : 'danger'
                  }
                  size="sm"
                >
                  {bmiCalc.category}
                </Badge>
              </>
            ) : (
              <span className="text-xs text-slate-400">Ingresa peso y talla</span>
            )}
          </div>
        </div>
      </div>

      {/* Tarjeta de Peso Ideal y Rango Saludable */}
      {idealWeightCalc && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/90 to-indigo-50/70 border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Scale className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <span className="font-bold text-slate-900 block">
                Rango de Peso Saludable (IMC 18.5 - 24.9 kg/m²):
              </span>
              <p className="text-slate-600">
                Para talla de <strong>{value.heightCm} cm</strong>: el peso ideal es de{' '}
                <strong className="text-blue-900 font-mono font-bold">{idealWeightCalc.displayText}</strong>
              </p>
            </div>
          </div>

          {idealWeightCalc.diffKg !== null && (
            <div className="flex items-center gap-2 shrink-0">
              {idealWeightCalc.status === 'ideal' ? (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> En Peso Saludable
                </span>
              ) : idealWeightCalc.status === 'overweight' ? (
                <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 font-bold">
                  Exceso: +{idealWeightCalc.diffKg} kg de meta
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-950 font-bold">
                  Bajo peso: {idealWeightCalc.diffKg} kg de meta
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Grid 3: Glucosa Capilar y Saturación de Oxígeno */}
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
