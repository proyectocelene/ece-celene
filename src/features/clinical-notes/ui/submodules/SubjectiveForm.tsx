import { useState, useEffect } from 'react';
import { type Subjective } from '@/entities/clinical-note/model/schemas';
import { DEFAULT_SUBJECTIVE_TEMPLATES, type SubjectiveTemplate } from '@/entities/catalogs/data/clinicalTemplatesData';
import { Input, Button } from '@/shared/ui';
import { BookmarkPlus, Sparkles, Trash2 } from 'lucide-react';

interface SubjectiveFormProps {
  value: Subjective;
  onChange: (value: Subjective) => void;
}

const CUSTOM_SUBJECTIVE_TEMPLATES_KEY = 'custom_subjective_templates';

export function SubjectiveForm({ value, onChange }: SubjectiveFormProps) {
  const [customTemplates, setCustomTemplates] = useState<SubjectiveTemplate[]>([]);
  const [templateNameInput, setTemplateNameInput] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CUSTOM_SUBJECTIVE_TEMPLATES_KEY);
      if (stored) {
        setCustomTemplates(JSON.parse(stored));
      }
    } catch {
      // Ignorar error de parsing
    }
  }, []);

  const allTemplates = [...DEFAULT_SUBJECTIVE_TEMPLATES, ...customTemplates];

  const handleApplyTemplate = (tpl: SubjectiveTemplate) => {
    onChange({
      ...value,
      reasonForVisit: tpl.reasonForVisit || value.reasonForVisit,
      currentIllness: tpl.currentIllness || value.currentIllness,
      systemsReview: tpl.systemsReview || value.systemsReview,
    });
  };

  const handleSaveCustomTemplate = () => {
    if (!templateNameInput.trim() || !value.currentIllness.trim()) return;

    const newTpl: SubjectiveTemplate = {
      id: `subj-tpl-${Date.now()}`,
      name: templateNameInput.trim(),
      reasonForVisit: value.reasonForVisit || '',
      currentIllness: value.currentIllness,
      systemsReview: value.systemsReview || '',
    };

    const updated = [...customTemplates, newTpl];
    setCustomTemplates(updated);
    localStorage.setItem(CUSTOM_SUBJECTIVE_TEMPLATES_KEY, JSON.stringify(updated));
    setTemplateNameInput('');
    setShowSaveModal(false);
  };

  const handleDeleteCustomTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customTemplates.filter((t) => t.id !== id);
    setCustomTemplates(updated);
    localStorage.setItem(CUSTOM_SUBJECTIVE_TEMPLATES_KEY, JSON.stringify(updated));
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150 text-left">
      {/* Selector de Plantillas Clínicas */}
      <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-2.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-900">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Plantillas Rápidas de Motivo y Padecimiento Actual</span>
          </div>

          <button
            type="button"
            onClick={() => setShowSaveModal(!showSaveModal)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>Guardar mi texto como plantilla</span>
          </button>
        </div>

        {/* Modal / Panel rápido para guardar plantilla */}
        {showSaveModal && (
          <div className="p-3 bg-white rounded-xl border border-blue-200 shadow-sm space-y-2 animate-in fade-in">
            <span className="text-xs font-bold text-slate-800 block">Nombre para tu plantilla personalizada:</span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ej. Mi plantilla de Cefalea, Control Pediátrico..."
                value={templateNameInput}
                onChange={(e) => setTemplateNameInput(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <Button size="sm" onClick={handleSaveCustomTemplate} disabled={!templateNameInput.trim()}>
                Guardar Plantilla
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowSaveModal(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Chips de Plantillas */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {allTemplates.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => handleApplyTemplate(tpl)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-700 hover:text-blue-900 transition-all cursor-pointer shadow-2xs group"
              title={`Aplicar plantilla: ${tpl.name}`}
            >
              <span>{tpl.name}</span>
              {tpl.id.startsWith('subj-tpl-') && (
                <button
                  type="button"
                  onClick={(e) => handleDeleteCustomTemplate(tpl.id, e)}
                  className="text-slate-300 hover:text-rose-500 ml-1"
                  title="Eliminar plantilla propia"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <Input
        label="Motivo de Consulta *"
        placeholder="Ej. Cefalea intensa de 3 días de evolución, control de diabetes..."
        value={value.reasonForVisit}
        onChange={(e) => onChange({ ...value, reasonForVisit: e.target.value })}
      />

      <div className="space-y-1.5 text-left">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Padecimiento Actual (Semiología y Cronología) *
          </label>
          <span className="text-[10px] text-slate-400 font-medium">
            Guía: Inicio • Evolución • Carácter del síntoma • Agravantes / Atenuantes • Tx previos
          </span>
        </div>
        <textarea
          rows={5}
          value={value.currentIllness}
          onChange={(e) => onChange({ ...value, currentIllness: e.target.value })}
          placeholder="Describir de manera detallada: 1. Fecha y forma de inicio (súbito/insidioso) 2. Evolución cronológica 3. Características semiológicas (localización, tipo de dolor/síntoma, intensidad 1-10, irradiación) 4. Factores que lo aumentan o disminuyen 5. Síntomas acompañantes 6. Medicamentos o remedios tomados previamente y respuesta..."
          className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-xs text-slate-800 leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
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
          placeholder="Respiratorio (tos, disnea), Cardiovascular (palpitaciones, dolor torácico), Digestivo (náusea, vómito, hábito intestinal), Genitourinario (disuria, polaquiuria), Musculoesquelético, Neurológico..."
          className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-xs text-slate-800 leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>
    </div>
  );
}
