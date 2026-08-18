import { useState, useMemo } from 'react';
import { type DiagnosisItem } from '@/entities/clinical-note/model/schemas';
import { CatalogSearchService } from '@/entities/catalogs/api/catalogSearchService';
import { type CIE10Entry } from '@/entities/catalogs/data/cie10Data';
import { Button, Input, Select, Badge, AutocompleteInput, type AutocompleteItem } from '@/shared/ui';
import { Plus, Trash2, Stethoscope, Search, History, Sparkles } from 'lucide-react';

interface DiagnosticsFormProps {
  value: DiagnosisItem[];
  onChange: (diagnoses: DiagnosisItem[]) => void;
  pastDiagnoses?: { description: string; cie10Code?: string; type?: string; notes?: string }[];
}

export function DiagnosticsForm({ value, onChange, pastDiagnoses = [] }: DiagnosticsFormProps) {
  const [description, setDescription] = useState('');
  const [cie10Code, setCie10Code] = useState('');
  const [diagType, setDiagType] = useState<'presuntivo' | 'definitivo'>('presuntivo');
  const [notes, setNotes] = useState('');

  // Autocompletado reactivo de CIE-10
  const suggestions: AutocompleteItem[] = useMemo(() => {
    if (!description.trim() || description.length < 2) return [];
    const results = CatalogSearchService.searchCIE10(description, 8);
    return results.map((item) => ({
      id: item.code,
      title: item.description,
      subtitle: item.category,
      badge: item.code,
      raw: item,
    }));
  }, [description]);

  const handleSelectSuggestion = (item: AutocompleteItem) => {
    const raw = item.raw as CIE10Entry;
    setDescription(raw.description);
    setCie10Code(raw.code);
  };

  const addDiagnosis = () => {
    if (!description.trim()) return;

    const newItem: DiagnosisItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : `diag-${Date.now()}`,
      description: description.trim(),
      cie10Code: cie10Code.trim().toUpperCase(),
      type: diagType,
      notes: notes.trim(),
    };

    onChange([...value, newItem]);
    setDescription('');
    setCie10Code('');
    setNotes('');
    setDiagType('presuntivo');
  };

  const addPastDiagnosis = (past: { description: string; cie10Code?: string; type?: string; notes?: string }) => {
    // Evitar duplicados exactos
    if (value.some((d) => d.description.toLowerCase() === past.description.toLowerCase())) {
      return;
    }

    const newItem: DiagnosisItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : `diag-${Date.now()}`,
      description: past.description,
      cie10Code: past.cie10Code || '',
      type: (past.type as 'presuntivo' | 'definitivo') || 'definitivo',
      notes: past.notes || '',
    };

    onChange([...value, newItem]);
  };

  const removeDiagnosis = (id: string) => {
    onChange(value.filter((d) => d.id !== id));
  };

  // Filtrar diagnósticos previos únicos que no estén ya en la consulta actual
  const uniquePastDiagnoses = useMemo(() => {
    const seen = new Set<string>();
    const list: { description: string; cie10Code?: string; type?: string; notes?: string }[] = [];
    for (const d of pastDiagnoses) {
      const key = d.description.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        list.push(d);
      }
    }
    return list;
  }, [pastDiagnoses]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150 text-left font-sans">
      {/* Panel de Diagnósticos Previos del Paciente */}
      {uniquePastDiagnoses.length > 0 && (
        <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-900">
              <History className="w-4 h-4 text-blue-600" />
              <span>Diagnósticos Previos y Condiciones Registradas ({uniquePastDiagnoses.length})</span>
            </div>
            <span className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-500" />
              Clic para agregar a esta consulta
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {uniquePastDiagnoses.map((past, idx) => {
              const alreadyAdded = value.some((d) => d.description.toLowerCase() === past.description.toLowerCase());
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => addPastDiagnosis(past)}
                  disabled={alreadyAdded}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    alreadyAdded
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      : 'bg-white hover:bg-blue-100/70 border border-blue-200 text-blue-950 font-semibold shadow-2xs hover:border-blue-300'
                  }`}
                  title={alreadyAdded ? 'Ya agregado a la consulta' : `Agregar ${past.description}`}
                >
                  <Plus className="w-3 h-3 text-blue-600" />
                  <span>{past.description}</span>
                  {past.cie10Code && (
                    <span className="font-mono text-[10px] text-slate-500">({past.cie10Code})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Caja de Entrada para Agregar Diagnóstico */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
            <Stethoscope className="w-4 h-4 text-blue-600" />
            <span>Agregar Impresión Diagnóstica / CIE-10</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
            <Search className="w-3 h-3 text-blue-500" />
            Catálogo CIE-10 ampliado integrado
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <AutocompleteInput
              label="Diagnóstico Clínico o Código CIE-10 *"
              placeholder="Escribe diagnóstico (ej. Faringitis, E11, Diabetes, Hipertensión, Gastritis)..."
              value={description}
              onChange={setDescription}
              onSelect={handleSelectSuggestion}
              items={suggestions}
            />
          </div>

          <Input
            label="Código CIE-10"
            placeholder="Ej. J03.0"
            value={cie10Code}
            onChange={(e) => setCie10Code(e.target.value)}
          />

          <Select
            label="Tipo de Diagnóstico"
            value={diagType}
            onChange={(e) => setDiagType(e.target.value as 'presuntivo' | 'definitivo')}
          >
            <option value="presuntivo">Presuntivo</option>
            <option value="definitivo">Definitivo</option>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              placeholder="Comentarios o justificación diagnóstica (opcional)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addDiagnosis();
                }
              }}
            />
          </div>
          <Button
            type="button"
            size="sm"
            onClick={addDiagnosis}
            disabled={!description.trim()}
            leftIcon={<Plus className="w-4 h-4" />}
            className="shrink-0 mt-1 font-bold"
          >
            Agregar Diagnóstico
          </Button>
        </div>
      </div>

      {/* Lista de Diagnósticos Registrados en la Consulta */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
          Diagnósticos en esta Consulta ({value.length})
        </span>

        {value.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
            No has agregado diagnósticos a esta consulta médica.
          </div>
        ) : (
          <div className="space-y-2">
            {value.map((diag, idx) => (
              <div
                key={diag.id}
                className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs"
              >
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="space-y-1 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-slate-900">{diag.description}</p>
                      {diag.cie10Code && (
                        <Badge variant="default" size="sm" className="font-mono text-[10px] font-bold">
                          {diag.cie10Code}
                        </Badge>
                      )}
                      <Badge variant={diag.type === 'definitivo' ? 'success' : 'warning'} size="sm">
                        {diag.type === 'definitivo' ? 'Definitivo' : 'Presuntivo'}
                      </Badge>
                    </div>
                    {diag.notes && <p className="text-xs text-slate-600">{diag.notes}</p>}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeDiagnosis(diag.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                  title="Eliminar diagnóstico"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
