import { useState, useMemo } from 'react';
import { type DiagnosisItem } from '@/entities/clinical-note/model/schemas';
import { CatalogSearchService } from '@/entities/catalogs/api/catalogSearchService';
import { type CIE10Entry } from '@/entities/catalogs/data/cie10Data';
import { Button, Input, Select, Badge, AutocompleteInput, type AutocompleteItem } from '@/shared/ui';
import { Plus, Trash2, Stethoscope, Search } from 'lucide-react';

interface DiagnosticsFormProps {
  value: DiagnosisItem[];
  onChange: (diagnoses: DiagnosisItem[]) => void;
}

export function DiagnosticsForm({ value, onChange }: DiagnosticsFormProps) {
  const [description, setDescription] = useState('');
  const [cie10Code, setCie10Code] = useState('');
  const [diagType, setDiagType] = useState<'presuntivo' | 'definitivo'>('presuntivo');
  const [notes, setNotes] = useState('');

  // Autocompletado reactivo de CIE-10
  const suggestions: AutocompleteItem[] = useMemo(() => {
    if (!description.trim() || description.length < 2) return [];
    const results = CatalogSearchService.searchCIE10(description, 6);
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

  const removeDiagnosis = (id: string) => {
    onChange(value.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Input box to add diagnosis */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
            <Stethoscope className="w-4 h-4 text-blue-600" />
            <span>Agregar Impresión Diagnóstica</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Search className="w-3 h-3 text-blue-500" />
            Catálogo CIE-10 integrado
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <AutocompleteInput
              label="Diagnóstico Clínico o Código CIE-10 *"
              placeholder="Escribe diagnóstico (ej. Faringitis, E11, Diabetes, Hipertensión)..."
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
            className="shrink-0 mt-1"
          >
            Agregar Diagnóstico
          </Button>
        </div>
      </div>

      {/* List of current diagnoses */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block text-left">
          Diagnósticos Registrados ({value.length})
        </span>

        {value.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
            No has agregado diagnósticos a esta consulta.
          </div>
        ) : (
          <div className="space-y-2">
            {value.map((diag, idx) => (
              <div
                key={diag.id}
                className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs"
              >
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-800">{diag.description}</p>
                      {diag.cie10Code && (
                        <Badge variant="default" size="sm" className="font-mono text-[10px]">
                          {diag.cie10Code}
                        </Badge>
                      )}
                      <Badge variant={diag.type === 'definitivo' ? 'success' : 'warning'} size="sm">
                        {diag.type === 'definitivo' ? 'Definitivo' : 'Presuntivo'}
                      </Badge>
                    </div>
                    {diag.notes && <p className="text-xs text-slate-500">{diag.notes}</p>}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeDiagnosis(diag.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
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
