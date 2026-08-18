import { useState, useEffect } from 'react';
import type { Objective } from '@/entities/clinical-note/model/schemas';
import type { Patient } from '@/entities/patient/model/schemas';
import {
  DEFAULT_OBJECTIVE_SEGMENT_TEMPLATES,
} from '@/entities/catalogs/data/clinicalTemplatesData';
import {
  PreventiveRemindersEngine,
  type PreventiveReminder,
} from '@/features/clinical-notes/lib/preventiveRemindersEngine';
import { Button } from '@/shared/ui';
import {
  Activity,
  Sparkles,
  Check,
  Trash2,
  BookmarkPlus,
  ShieldCheck,
  PlusCircle,
} from 'lucide-react';

interface ObjectiveFormProps {
  value: Objective;
  onChange: (objective: Objective) => void;
  patient?: Patient;
  onAddLabStudy?: (studyName: string) => void;
}

const CUSTOM_OBJECTIVE_KEY = 'custom_objective_segment_templates';

export function ObjectiveForm({
  value,
  onChange,
  patient,
  onAddLabStudy,
}: ObjectiveFormProps) {
  const [customTemplates, setCustomTemplates] = useState<Partial<Record<keyof Objective, { id: string; name: string; text: string }[]>>>({});
  const [activeSavingField, setActiveSavingField] = useState<keyof Objective | null>(null);
  const [customNameInput, setCustomNameInput] = useState('');
  const [completedReminders, setCompletedReminders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CUSTOM_OBJECTIVE_KEY);
      if (stored) {
        setCustomTemplates(JSON.parse(stored));
      }
    } catch {
      // Ignorar error de parsing
    }
  }, []);

  const updateField = (field: keyof Objective, val: string) => {
    onChange({
      ...value,
      [field]: val,
    });
  };

  const handleFillAllNormal = () => {
    onChange({
      generalAppearance: DEFAULT_OBJECTIVE_SEGMENT_TEMPLATES.generalAppearance[0].text,
      headAndNeck: DEFAULT_OBJECTIVE_SEGMENT_TEMPLATES.headAndNeck[0].text,
      chestAndLungs: DEFAULT_OBJECTIVE_SEGMENT_TEMPLATES.chestAndLungs[0].text,
      abdomen: DEFAULT_OBJECTIVE_SEGMENT_TEMPLATES.abdomen[0].text,
      extremities: DEFAULT_OBJECTIVE_SEGMENT_TEMPLATES.extremities[0].text,
      neurological: DEFAULT_OBJECTIVE_SEGMENT_TEMPLATES.neurological[0].text,
    });
  };

  const handleClearAll = () => {
    if (window.confirm('¿Deseas vaciar todos los campos de Exploración Física para redactar desde cero?')) {
      onChange({
        generalAppearance: '',
        headAndNeck: '',
        chestAndLungs: '',
        abdomen: '',
        extremities: '',
        neurological: '',
      });
    }
  };

  const handleSaveCustomForField = (field: keyof Objective) => {
    const text = value[field]?.trim();
    if (!text || !customNameInput.trim()) return;

    const currentFieldList = customTemplates[field] || [];
    const newEntry = {
      id: `custom-${field}-${Date.now()}`,
      name: customNameInput.trim(),
      text,
    };

    const updated = {
      ...customTemplates,
      [field]: [...currentFieldList, newEntry],
    };

    setCustomTemplates(updated);
    localStorage.setItem(CUSTOM_OBJECTIVE_KEY, JSON.stringify(updated));
    setCustomNameInput('');
    setActiveSavingField(null);
  };

  const handleDeleteCustom = (field: keyof Objective, id: string) => {
    const currentFieldList = customTemplates[field] || [];
    const updated = {
      ...customTemplates,
      [field]: currentFieldList.filter((item) => item.id !== id),
    };
    setCustomTemplates(updated);
    localStorage.setItem(CUSTOM_OBJECTIVE_KEY, JSON.stringify(updated));
  };

  const reminders: PreventiveReminder[] = patient
    ? PreventiveRemindersEngine.getRemindersForPatient(patient)
    : [];

  const renderSegmentBox = (
    field: keyof Objective,
    label: string,
    defaultTemplates: { id: string; name: string; text: string }[],
    placeholderGuide: string
  ) => {
    const userCustoms = customTemplates[field] || [];
    const isSaving = activeSavingField === field;

    return (
      <div className="space-y-2 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-100 pb-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
            {label}
          </label>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => updateField(field, defaultTemplates[0].text)}
              className="text-[11px] text-blue-600 hover:text-blue-800 bg-blue-50/70 hover:bg-blue-100 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title="Rellenar exploración normal estándar"
            >
              <Check className="w-3 h-3" /> Normal
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSavingField(isSaving ? null : field);
                setCustomNameInput('');
              }}
              className="text-[11px] text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              title="Guardar este texto como plantilla personalizada"
            >
              <BookmarkPlus className="w-3 h-3" /> Guardar plantilla
            </button>

            {value[field] && (
              <button
                type="button"
                onClick={() => updateField(field, '')}
                className="text-[11px] text-slate-400 hover:text-rose-600 p-0.5 rounded cursor-pointer"
                title="Limpiar campo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Panel para nombrar y guardar plantilla personalizada */}
        {isSaving && (
          <div className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-200 flex gap-2 animate-in fade-in">
            <input
              type="text"
              placeholder="Nombre de tu plantilla (ej. Abdomen Quirúrgico, Apendicular)..."
              value={customNameInput}
              onChange={(e) => setCustomNameInput(e.target.value)}
              className="flex-1 px-2.5 py-1 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Button
              size="sm"
              onClick={() => handleSaveCustomForField(field)}
              disabled={!customNameInput.trim() || !value[field]?.trim()}
              className="text-[11px]"
            >
              Guardar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveSavingField(null)}
              className="text-[11px]"
            >
              Cancelar
            </Button>
          </div>
        )}

        {/* Chips de plantillas frecuentes y personalizadas */}
        {(defaultTemplates.length > 1 || userCustoms.length > 0) && (
          <div className="flex flex-wrap gap-1 items-center pt-0.5">
            <span className="text-[10px] text-slate-400 font-medium">Plantillas:</span>
            {defaultTemplates.slice(1).map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => updateField(field, tpl.text)}
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-800 transition-colors cursor-pointer"
                title={tpl.text}
              >
                {tpl.name}
              </button>
            ))}

            {userCustoms.map((tpl) => (
              <span
                key={tpl.id}
                onClick={() => updateField(field, tpl.text)}
                className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-medium inline-flex items-center gap-1 cursor-pointer"
                title={tpl.text}
              >
                ⭐ {tpl.name}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCustom(field, tpl.id);
                  }}
                  className="text-amber-400 hover:text-rose-600 ml-0.5"
                  title="Eliminar plantilla"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        <textarea
          rows={3}
          value={value[field] || ''}
          onChange={(e) => updateField(field, e.target.value)}
          placeholder={placeholderGuide}
          className="block w-full rounded-xl border border-slate-200 bg-slate-50/40 py-2 px-3 text-xs text-slate-800 leading-relaxed focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150 text-left font-sans">
      {/* Recordatorios Preventivos Individualizados */}
      {reminders.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-indigo-50/60 border border-amber-200 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-950">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Recordatorios Preventivos Individualizados del Paciente</span>
            </div>
            <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-full">
              {reminders.length} Alertas Activas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {reminders.map((rem) => {
              const isDone = completedReminders[rem.id];
              return (
                <div
                  key={rem.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isDone
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950 opacity-75'
                      : 'bg-white border-amber-200/90 text-slate-800 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900">{rem.title}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-amber-100 text-amber-900">
                          {rem.badgeText}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">{rem.description}</p>
                      <p className="text-[11px] text-amber-900 font-medium">👉 {rem.recommendation}</p>
                    </div>
                  </div>

                  {/* Botones de acción del recordatorio */}
                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() =>
                        setCompletedReminders((prev) => ({
                          ...prev,
                          [rem.id]: !prev[rem.id],
                        }))
                      }
                      className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      {isDone ? '✓ Ya Realizado / Vigente' : 'Marcar Vigente'}
                    </button>

                    {rem.associatedStudy && onAddLabStudy && (
                      <button
                        type="button"
                        onClick={() => onAddLabStudy(rem.associatedStudy!)}
                        className="text-[10px] px-2.5 py-1 rounded-lg font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1 transition-colors cursor-pointer"
                        title={`Agregar ${rem.associatedStudy} a la orden de laboratorio`}
                      >
                        <PlusCircle className="w-3 h-3 text-indigo-600" />
                        <span>+ Solicitar Estudio</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Barra de Acciones Globales: Llenar todo normal / Borrar todo */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-blue-50/80 border border-blue-100 rounded-2xl">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider">
          <Activity className="w-4 h-4 text-blue-600" />
          <span>Exploración Física Segmentaria Completa</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
            className="text-rose-700 bg-white hover:bg-rose-50 text-xs shadow-2xs font-semibold"
            title="Borrar el texto de todos los campos de exploración física"
          >
            Borrar Todos los Campos
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleFillAllNormal}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-blue-600" />}
            className="text-blue-800 bg-white hover:bg-blue-50 text-xs shadow-2xs font-bold"
          >
            ✨ Llenar Toda la EF Normal
          </Button>
        </div>
      </div>

      {/* Grid de Segmentos Anatómicos con Guías Semiológicas Completas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Habitus Exterior */}
        {renderSegmentBox(
          'generalAppearance',
          '1. Habitus Exterior / Aspecto General',
          DEFAULT_OBJECTIVE_SEGMENT_TEMPLATES.generalAppearance,
          'Guía completa: Estado de consciencia (alerta/orientado), facies (álgica/tóxica/compuesta), constitución/biotipo, marcha y postura, hidratación de piel y mucosas, coloración (eutrófico/pálido/ictérico/cianótico), cooperación al examen...'
        )}

        {/* 2. Cabeza y Cuello */}
        {renderSegmentBox(
          'headAndNeck',
          '2. Cabeza, Ojos, Nariz, Faringe y Cuello',
          DEFAULT_OBJECTIVE_SEGMENT_TEMPLATES.headAndNeck,
          'Guía completa: Normocéfalo/exostosis, pupilas (isocoria/fotorreactividad), agudeza visual, otoscopía (membrana íntegra/traslúcida), rinoscopía, orofaringe (amígdalas, exudado, hiperemia, dentadura), cuello (pulsos carotídeos, ingurgitación yugular, glándula tiroides, adenopatías dolorosas)...'
        )}

        {/* 3. Tórax y Pulmones */}
        {renderSegmentBox(
          'chestAndLungs',
          '3. Tórax, Pulmones y Cardiovascular',
          DEFAULT_OBJECTIVE_SEGMENT_TEMPLATES.chestAndLungs,
          'Guía completa: Inspección (normolíneo, simetría, mecánica respiratoria), palpación (amplexión y amplexación), auscultación pulmonar (murmullo vesicular bilateral, estertores crepitantes, sibilancias, estridor), ruidos cardíacos (ritmo, frecuencia, ruidos S1 y S2 de buen tono, soplos, frote, galope)...'
        )}

        {/* 4. Abdomen y Pelvis */}
        {renderSegmentBox(
          'abdomen',
          '4. Abdomen y Pelvis',
          DEFAULT_OBJECTIVE_SEGMENT_TEMPLATES.abdomen,
          'Guía completa: Inspección (plano/globoso), ruidos hidroaéreos (frecuencia y tono), palpación superficial y profunda, puntos dolorosos (McBurney, Murphy, Blumberg, Rovsing), visceromegalias (hepatomegalia, esplenomegalia), puntos ureterales, percusión (timpanismo/matidez)...'
        )}

        {/* 5. Extremidades y Columna */}
        {renderSegmentBox(
          'extremities',
          '5. Extremidades y Columna Vertebral',
          DEFAULT_OBJECTIVE_SEGMENT_TEMPLATES.extremities,
          'Guía completa: Simetría, arcos de movilidad articular completos, fuerza muscular (Daniels 0-5), pulsos periféricos (radial, tibial posterior, pedio), llenado capilar (< 2 seg), edema con o sin fóvea, columna vertebral (curvaturas normales, dolor a palpación de apófisis, maniobra de Lasègue)...'
        )}

        {/* 6. Neurológico */}
        {renderSegmentBox(
          'neurological',
          '6. Neurológico y Estado Mental',
          DEFAULT_OBJECTIVE_SEGMENT_TEMPLATES.neurological,
          'Guía completa: Consciencia y orientación en 3 esferas (tiempo, espacio, persona), pares craneales I al XII conservados, reflejos osteotendinosos simétricos (++/++++), sensibilidad táctil y dolorosa, signos meníngeos (rigidez de nuca, Kernig, Brudzinski), marcha, coordinación y prueba de Romberg...'
        )}
      </div>
    </div>
  );
}
