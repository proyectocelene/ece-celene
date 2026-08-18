import { useState } from 'react';
import type { PrescriptionItem } from '@/entities/clinical-note/model/schemas';
import type { ChronicCondition } from '@/entities/patient/model/schemas';
import { Modal, Button, Badge } from '@/shared/ui';
import { History, Plus, Pill } from 'lucide-react';

interface PastPrescriptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pastNotesPrescriptions: { date: string; prescriptions: PrescriptionItem[] }[];
  chronicConditions?: ChronicCondition[];
  onImportPrescriptions: (selectedItems: PrescriptionItem[]) => void;
}

export function PastPrescriptionsModal({
  isOpen,
  onClose,
  pastNotesPrescriptions,
  chronicConditions = [],
  onImportPrescriptions,
}: PastPrescriptionsModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Consolidar todos los ítems disponibles para copiar
  const allAvailableItems: { source: string; item: PrescriptionItem }[] = [];

  // De notas pasadas
  pastNotesPrescriptions.forEach((group) => {
    group.prescriptions.forEach((rx) => {
      allAvailableItems.push({
        source: `Consulta del ${new Date(group.date).toLocaleDateString('es-MX')}`,
        item: rx,
      });
    });
  });

  // De condiciones crónicas
  chronicConditions.forEach((cond) => {
    if (cond.currentTreatment) {
      allAvailableItems.push({
        source: `Condición Crónica (${cond.name})`,
        item: {
          id: `cond-rx-${cond.id}`,
          medication: cond.linkedMedications && cond.linkedMedications.length > 0 ? cond.linkedMedications[0] : cond.name,
          presentation: '',
          dosage: cond.currentTreatment,
          frequency: 'Según indicación',
          route: 'Oral',
          duration: 'Tratamiento continuo',
          instructions: `Tratamiento de base para ${cond.name}`,
          indicationFor: cond.name,
        },
      });
    }
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    const selected = allAvailableItems
      .filter((entry) => selectedIds.includes(entry.item.id))
      .map((entry) => ({
        ...entry.item,
        id: `rx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      }));

    onImportPrescriptions(selected);
    setSelectedIds([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Histórico de Medicamentos y Tratamientos Previos"
      description="Selecciona los fármacos de consultas pasadas o crónicos que deseas copiar a la receta actual."
      maxWidth="2xl"
    >
      <div className="space-y-4 text-left">
        {allAvailableItems.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs space-y-2 border border-dashed border-slate-200 rounded-xl">
            <History className="w-8 h-8 mx-auto text-slate-300" />
            <p>No se encontraron medicamentos en consultas anteriores ni tratamientos crónicos registrados.</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
            {allAvailableItems.map((entry) => {
              const isSelected = selectedIds.includes(entry.item.id);
              return (
                <div
                  key={entry.item.id}
                  onClick={() => toggleSelect(entry.item.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/70 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="mt-1 rounded text-blue-600 focus:ring-blue-500 pointer-events-none"
                  />

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Pill className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="font-bold text-slate-900 text-sm">{entry.item.medication}</span>
                        {entry.item.presentation && (
                          <span className="text-xs text-slate-500 font-normal">({entry.item.presentation})</span>
                        )}
                      </div>
                      <Badge variant="default" size="sm" className="text-[10px]">
                        {entry.source}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-700">
                      <strong>Posología:</strong> Tomar {entry.item.dosage} {entry.item.frequency} vía {entry.item.route} {entry.item.duration && `por ${entry.item.duration}`}.
                    </p>

                    {entry.item.indicationFor && (
                      <p className="text-[11px] text-blue-700 font-medium">
                        Indicación: {entry.item.indicationFor}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleConfirm}
            disabled={selectedIds.length === 0}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Copiar {selectedIds.length} Seleccionado(s)
          </Button>
        </div>
      </div>
    </Modal>
  );
}
