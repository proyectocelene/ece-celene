import { useState } from 'react';
import type { ChronicCondition } from '@/entities/patient/model/schemas';
import { Button, Input, Select, Badge, Card, Modal } from '@/shared/ui';
import { Activity, Plus, Trash2, Edit, Check, Link2, Calendar, Pill } from 'lucide-react';

interface ChronicConditionsManagerProps {
  conditions: ChronicCondition[];
  onChange: (updated: ChronicCondition[]) => void;
  readOnly?: boolean;
}

export function ChronicConditionsManager({
  conditions,
  onChange,
  readOnly = false,
}: ChronicConditionsManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [diagnosedDate, setDiagnosedDate] = useState('');
  const [status, setStatus] = useState<ChronicCondition['status']>('Controlada');
  const [currentTreatment, setCurrentTreatment] = useState('');
  const [modificationsNotes, setModificationsNotes] = useState('');
  const [linkedMedsInput, setLinkedMedsInput] = useState('');

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setDiagnosedDate('');
    setStatus('Controlada');
    setCurrentTreatment('');
    setModificationsNotes('');
    setLinkedMedsInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ChronicCondition) => {
    setEditingId(item.id);
    setName(item.name);
    setDiagnosedDate(item.diagnosedDate || '');
    setStatus(item.status);
    setCurrentTreatment(item.currentTreatment || '');
    setModificationsNotes(item.modificationsNotes || '');
    setLinkedMedsInput(item.linkedMedications ? item.linkedMedications.join(', ') : '');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const linkedMedications = linkedMedsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingId) {
      onChange(
        conditions.map((c) =>
          c.id === editingId
            ? {
                ...c,
                name: name.trim(),
                diagnosedDate: diagnosedDate.trim(),
                status,
                currentTreatment: currentTreatment.trim(),
                modificationsNotes: modificationsNotes.trim(),
                linkedMedications,
              }
            : c
        )
      );
    } else {
      const newCondition: ChronicCondition = {
        id: `cond-${Date.now()}`,
        name: name.trim(),
        diagnosedDate: diagnosedDate.trim(),
        status,
        currentTreatment: currentTreatment.trim(),
        modificationsNotes: modificationsNotes.trim(),
        linkedMedications,
      };
      onChange([...conditions, newCondition]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    onChange(conditions.filter((c) => c.id !== id));
  };

  const getStatusBadge = (st: ChronicCondition['status']) => {
    switch (st) {
      case 'Controlada':
        return <Badge variant="success" size="sm">Controlada</Badge>;
      case 'Descontrolada':
        return <Badge variant="danger" size="sm">Descontrolada</Badge>;
      case 'En seguimiento':
        return <Badge variant="primary" size="sm">En seguimiento</Badge>;
      default:
        return <Badge variant="warning" size="sm">{st}</Badge>;
    }
  };

  return (
    <div className="space-y-3 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
          <Activity className="w-3.5 h-3.5 text-blue-600" />
          <span>Condiciones Crónicas y Diagnósticos de Base ({conditions.length})</span>
        </div>

        {!readOnly && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={handleOpenAdd}
            className="text-xs"
          >
            + Añadir Condición
          </Button>
        )}
      </div>

      {conditions.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center text-xs text-slate-400">
          Sin diagnósticos crónicos registrados.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {conditions.map((item) => (
            <Card
              key={item.id}
              className="p-3.5 border-slate-200 bg-white hover:border-blue-200 transition-all flex flex-col justify-between space-y-2 shadow-2xs"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                  {getStatusBadge(item.status)}
                </div>

                {item.diagnosedDate && (
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Dx: {item.diagnosedDate}</span>
                  </p>
                )}

                {item.currentTreatment && (
                  <p className="text-xs text-slate-700">
                    <strong>Tratamiento:</strong> {item.currentTreatment}
                  </p>
                )}

                {item.linkedMedications && item.linkedMedications.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    <Pill className="w-3 h-3 text-blue-500" />
                    {item.linkedMedications.map((med, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-medium border border-blue-100"
                      >
                        {med}
                      </span>
                    ))}
                  </div>
                )}

                {item.modificationsNotes && (
                  <p className="text-[11px] text-slate-400 italic">
                    Nota: {item.modificationsNotes}
                  </p>
                )}
              </div>

              {!readOnly && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-1 text-slate-400 hover:text-blue-600 rounded cursor-pointer"
                    title="Editar condición"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                    title="Eliminar condición"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Creación / Edición de Condición */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Editar Condición Crónica' : 'Nueva Condición Crónica'}
        description="Registra el diagnóstico de base, tratamiento y vinculación de fármacos."
        maxWidth="md"
      >
        <div className="space-y-3.5 text-left">
          <Input
            label="Nombre de la Condición / Enfermedad *"
            placeholder="Ej. Diabetes Mellitus Tipo 2, Hipertensión Arterial, Hipotiroidismo..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Año o Fecha de Diagnóstico"
              placeholder="Ej. 2018 o 2021-05"
              value={diagnosedDate}
              onChange={(e) => setDiagnosedDate(e.target.value)}
            />
            <Select
              label="Estado de Control"
              value={status}
              onChange={(e) => setStatus(e.target.value as ChronicCondition['status'])}
            >
              <option value="Controlada">Controlada</option>
              <option value="Descontrolada">Descontrolada</option>
              <option value="En seguimiento">En seguimiento</option>
              <option value="En estudio">En estudio</option>
            </Select>
          </div>

          <Input
            label="Tratamiento / Dosis Actual que Toma"
            placeholder="Ej. Metformina 850mg c/12h + Insulina Glargina 14 UI"
            value={currentTreatment}
            onChange={(e) => setCurrentTreatment(e.target.value)}
          />

          <Input
            label="Medicamentos Vinculados (separados por coma)"
            placeholder="Ej. Metformina, Insulina, Losartán"
            value={linkedMedsInput}
            onChange={(e) => setLinkedMedsInput(e.target.value)}
            leftIcon={<Link2 className="w-3.5 h-3.5 text-slate-400" />}
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Observaciones o Ajustes de Tratamiento
            </label>
            <textarea
              rows={2}
              value={modificationsNotes}
              onChange={(e) => setModificationsNotes(e.target.value)}
              placeholder="Ajuste de dosis realizado en última consulta..."
              className="block w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              disabled={!name.trim()}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Guardar Condición
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
