import { useState, useMemo } from 'react';
import { type ClinicalPlan, type PrescriptionItem } from '@/entities/clinical-note/model/schemas';
import type { ChronicCondition } from '@/entities/patient/model/schemas';
import { CatalogSearchService } from '@/entities/catalogs/api/catalogSearchService';
import { type MedicationEntry } from '@/entities/catalogs/data/medicationsData';
import { SCHEDULE_SUGGESTIONS } from '@/entities/catalogs/data/clinicalTemplatesData';
import { PastPrescriptionsModal } from './PastPrescriptionsModal';
import { Button, Input, Select, Badge, AutocompleteInput, type AutocompleteItem } from '@/shared/ui';
import {
  Plus,
  Trash2,
  Pill,
  ShieldAlert,
  Calendar,
  Sparkles,
  History,
  Target,
  Clock,
  FileCheck,
} from 'lucide-react';

interface PlanAndPrescriptionFormProps {
  value: ClinicalPlan;
  onChange: (plan: ClinicalPlan) => void;
  chronicConditions?: ChronicCondition[];
  pastNotesPrescriptions?: { date: string; prescriptions: PrescriptionItem[] }[];
}

export function PlanAndPrescriptionForm({
  value,
  onChange,
  chronicConditions = [],
  pastNotesPrescriptions = [],
}: PlanAndPrescriptionFormProps) {
  const [medication, setMedication] = useState('');
  const [presentation, setPresentation] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [route, setRoute] = useState<PrescriptionItem['route']>('Oral');
  const [duration, setDuration] = useState('');
  const [instructions, setInstructions] = useState('');
  const [indicationFor, setIndicationFor] = useState('');

  const [isPastModalOpen, setIsPastModalOpen] = useState(false);

  // Autocompletado reactivo de medicamentos
  const suggestions: AutocompleteItem[] = useMemo(() => {
    if (!medication.trim() || medication.length < 2) return [];
    const results = CatalogSearchService.searchMedications(medication, 8);
    return results.map((item) => ({
      id: item.genericName,
      title: item.genericName,
      subtitle: item.brandNames ? `Marcas: ${item.brandNames.join(', ')} • ${item.category}` : item.category,
      badge: item.price ? `${item.defaultPresentation} • $${item.price.toFixed(2)}` : item.defaultPresentation,
      raw: item,
    }));
  }, [medication]);

  const handleSelectMedication = (item: AutocompleteItem) => {
    const med = item.raw as MedicationEntry;
    setMedication(med.genericName);
    setPresentation(med.defaultPresentation);
    setDosage(med.defaultDosage);
    setFrequency(med.defaultFrequency);
    setRoute(med.defaultRoute);
    setDuration(med.defaultDuration);
    if (med.defaultInstructions) {
      setInstructions(med.defaultInstructions);
    }
    // Autocompletar automáticamente la indicación / función del medicamento
    const inferredIndication = CatalogSearchService.getMedicationIndication(med);
    if (inferredIndication) {
      setIndicationFor(inferredIndication);
    }
  };

  const addPrescription = () => {
    if (!medication.trim()) return;

    const newPrescription: PrescriptionItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : `rx-${Date.now()}`,
      medication: medication.trim(),
      presentation: presentation.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      route,
      duration: duration.trim(),
      instructions: instructions.trim(),
      indicationFor: indicationFor.trim(),
    };

    onChange({
      ...value,
      prescriptions: [...value.prescriptions, newPrescription],
    });

    setMedication('');
    setPresentation('');
    setDosage('');
    setFrequency('');
    setDuration('');
    setInstructions('');
    setIndicationFor('');
    setRoute('Oral');
  };

  const removePrescription = (id: string) => {
    onChange({
      ...value,
      prescriptions: value.prescriptions.filter((p) => p.id !== id),
    });
  };

  const handleImportPastPrescriptions = (imported: PrescriptionItem[]) => {
    onChange({
      ...value,
      prescriptions: [...value.prescriptions, ...imported],
    });
  };

  // Detectar si hay antibióticos o medicamentos controlados en la receta actual
  const hasAntibioticsOrControlled = useMemo(() => {
    return value.prescriptions.some(
      (rx) => CatalogSearchService.isAntibioticMed(rx.medication) || CatalogSearchService.isControlledMed(rx.medication)
    );
  }, [value.prescriptions]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150 text-left font-sans">
      {/* Prescription Builder */}
      <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-900">
            <Pill className="w-4 h-4 text-blue-600" />
            <span>Prescripción Médica / Receta</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<History className="w-3.5 h-3.5 text-blue-600" />}
              onClick={() => setIsPastModalOpen(true)}
              className="text-xs text-blue-800 bg-white shadow-2xs font-semibold"
            >
              Consultar / Copiar Meds Anteriores
            </Button>

            <span className="text-[11px] text-blue-600 font-medium hidden md:flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-500" />
              Autocompletado de Función Activo
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <AutocompleteInput
              label="Fármaco / Medicamento *"
              placeholder="Escribe el medicamento (ej. Paracetamol, Amoxicilina, Metformina, Losartán, Omeprazol)..."
              value={medication}
              onChange={setMedication}
              onSelect={handleSelectMedication}
              items={suggestions}
            />
          </div>
          <Input
            label="Presentación"
            placeholder="Ej. Tabletas 500mg, Suspensión 250mg/5ml"
            value={presentation}
            onChange={(e) => setPresentation(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Input
            label="Dosis"
            placeholder="Ej. 1 tableta, 10 ml, 1 cápsula"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
          />

          <div className="space-y-1">
            <Input
              label="Frecuencia / Horario"
              placeholder="Ej. Cada 8 horas"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            />
          </div>

          <Select
            label="Vía de Administración"
            value={route}
            onChange={(e) => setRoute(e.target.value as PrescriptionItem['route'])}
          >
            <option value="Oral">Oral</option>
            <option value="Intravenosa">Intravenosa</option>
            <option value="Intramuscular">Intramuscular</option>
            <option value="Tópica">Tópica</option>
            <option value="Oftálmica">Oftálmica</option>
            <option value="Inhalatoria">Inhalatoria</option>
            <option value="Sublingual">Sublingual</option>
            <option value="Otra">Otra</option>
          </Select>

          <Input
            label="Duración"
            placeholder="Ej. Por 5 a 7 días, Continuo"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>

        {/* Sugerencias Rápidas de Horarios */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" /> Sugerencias de Horario:
          </span>
          {SCHEDULE_SUGGESTIONS.map((sch) => (
            <button
              key={sch.value}
              type="button"
              onClick={() => setFrequency(sch.value)}
              className="text-[10px] px-2 py-0.5 rounded-md bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-800 transition-colors cursor-pointer"
            >
              {sch.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <Input
            label="Indicación / Para qué condición o síntoma es"
            placeholder="Ej. Para control de Presión Arterial, Dolor, Infección bacteriana..."
            value={indicationFor}
            onChange={(e) => setIndicationFor(e.target.value)}
            leftIcon={<Target className="w-3.5 h-3.5 text-blue-500" />}
          />

          <Input
            label="Instrucciones Adicionales para el Paciente"
            placeholder="Ej. Con alimentos, tomar en ayuno, abundante agua..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addPrescription();
              }
            }}
          />
        </div>

        {/* Quick chronic chips to set indication */}
        {chronicConditions.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[11px] text-slate-500 font-semibold">Asignar a Comorbilidad del Paciente:</span>
            {chronicConditions.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setIndicationFor(c.name)}
                className="text-[10px] px-2.5 py-0.5 rounded-full bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold transition-colors cursor-pointer shadow-2xs"
              >
                + Para: {c.name}
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button
            type="button"
            size="md"
            onClick={addPrescription}
            disabled={!medication.trim()}
            leftIcon={<Plus className="w-4 h-4" />}
            className="shadow-sm shadow-blue-500/20 font-bold"
          >
            Agregar Medicamento a la Receta
          </Button>
        </div>
      </div>

      {/* Alerta si hay antibióticos o controlados */}
      {hasAntibioticsOrControlled && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-2 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Receta con Antibiótico o Medicamento Controlado:</strong> Se generará automáticamente la <strong>Copia para Farmacia</strong> y el <strong>Ejemplar del Paciente</strong> al imprimir.
            </span>
          </div>
          <span className="text-[10px] bg-amber-200 text-amber-950 font-bold px-2 py-0.5 rounded">
            Doble Ejemplar
          </span>
        </div>
      )}

      {/* Current Prescriptions List */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
          Medicamentos en la Receta ({value.prescriptions.length})
        </span>

        {value.prescriptions.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
            No se han recetado medicamentos en esta nota.
          </div>
        ) : (
          <div className="space-y-2">
            {value.prescriptions.map((rx, idx) => {
              const isAbx = CatalogSearchService.isAntibioticMed(rx.medication);
              const isCtrl = CatalogSearchService.isControlledMed(rx.medication);

              return (
                <div
                  key={rx.id}
                  className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="space-y-1 text-left">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">{rx.medication}</p>
                        {rx.presentation && (
                          <span className="text-xs text-slate-500">({rx.presentation})</span>
                        )}
                        <Badge variant="primary" size="sm">
                          {rx.route}
                        </Badge>
                        {isAbx && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-200">
                            Antibiótico
                          </span>
                        )}
                        {isCtrl && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-900 border border-rose-200">
                            Controlado
                          </span>
                        )}
                        {rx.indicationFor && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                            Para: {rx.indicationFor}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-700">
                        <strong>Posología:</strong> Tomar {rx.dosage || 'según dosis'} {rx.frequency || 'cada horario indicado'} {rx.duration && `por ${rx.duration}`}.
                      </p>

                      {rx.instructions && (
                        <p className="text-xs text-slate-500 italic">Nota: {rx.instructions}</p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removePrescription(rx.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                    title="Eliminar medicamento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Plan General y Medidas */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Plan Terapéutico General e Indicaciones
          </label>
          <textarea
            rows={3}
            value={value.generalPlan}
            onChange={(e) => onChange({ ...value, generalPlan: e.target.value })}
            placeholder="Indicaciones médicas generales, recomendaciones, referencias a especialistas o estudios complementarios..."
            className="block w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Medidas Higiénico-Dietéticas
            </label>
            <textarea
              rows={2}
              value={value.nonPharmacological}
              onChange={(e) => onChange({ ...value, nonPharmacological: e.target.value })}
              placeholder="Dieta baja en sodio, hidratación abundante, reposo relativo, evitar irritantes..."
              className="block w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              <span>Datos de Alarma / Cuándo acudir a Urgencias</span>
            </label>
            <textarea
              rows={2}
              value={value.warningSigns}
              onChange={(e) => onChange({ ...value, warningSigns: e.target.value })}
              placeholder="Fiebre > 38.5°C persistente, dificultad respiratoria, dolor torácico, vómito incoercible, sangrado..."
              className="block w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="max-w-xs">
          <Input
            label="Próxima Cita de Seguimiento"
            type="date"
            value={value.followUpDate}
            onChange={(e) => onChange({ ...value, followUpDate: e.target.value })}
            leftIcon={<Calendar className="w-4 h-4 text-slate-400" />}
          />
        </div>
      </div>

      {/* Past Prescriptions Modal */}
      <PastPrescriptionsModal
        isOpen={isPastModalOpen}
        onClose={() => setIsPastModalOpen(false)}
        pastNotesPrescriptions={pastNotesPrescriptions}
        chronicConditions={chronicConditions}
        onImportPrescriptions={handleImportPastPrescriptions}
      />
    </div>
  );
}
