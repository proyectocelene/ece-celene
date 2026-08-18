import { useState } from 'react';
import type { Receipt, ReceiptServiceItem } from '@/entities/clinical-note/model/schemas';
import { CLINIC_SERVICES_CATALOG } from '@/entities/catalogs/data/servicesData';
import { Button, Input, Select } from '@/shared/ui';
import { Receipt as ReceiptIcon, Plus, Trash2, DollarSign, Sparkles } from 'lucide-react';

interface ReceiptFormProps {
  value: Receipt;
  onChange: (receipt: Receipt) => void;
  patientId: string;
}

export function ReceiptForm({ value, onChange, patientId }: ReceiptFormProps) {
  const [descInput, setDescInput] = useState('Consulta Médica General');
  const [amountInput, setAmountInput] = useState<number>(150);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  const categories = ['Todas', ...Array.from(new Set(CLINIC_SERVICES_CATALOG.map((s) => s.categoria)))];

  const filteredServices = selectedCategory === 'Todas'
    ? CLINIC_SERVICES_CATALOG
    : CLINIC_SERVICES_CATALOG.filter((s) => s.categoria === selectedCategory);

  const addService = (desc: string, amount: number) => {
    if (!desc.trim()) return;
    const newItem: ReceiptServiceItem = {
      id: `srv-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      description: desc.trim(),
      amount: Math.max(0, amount),
    };

    const updatedServices = [...value.services, newItem];
    const totalAmount = updatedServices.reduce((acc, s) => acc + s.amount, 0);

    onChange({
      ...value,
      receiptFolio: value.receiptFolio || `REC-${patientId}-${Date.now().toString().slice(-4)}`,
      services: updatedServices,
      totalAmount,
    });
  };

  const removeService = (id: string) => {
    const updatedServices = value.services.filter((s) => s.id !== id);
    const totalAmount = updatedServices.reduce((acc, s) => acc + s.amount, 0);
    onChange({
      ...value,
      services: updatedServices,
      totalAmount,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150 text-left font-sans">
      <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-900">
            <ReceiptIcon className="w-4 h-4 text-emerald-600" />
            <span>Recibo de Donativo / Servicios de Proyecto Celene</span>
          </div>

          <span className="text-xs text-emerald-800 font-mono font-bold">
            Folio: {value.receiptFolio || 'Automático'}
          </span>
        </div>

        {/* Category Filter for Quick Buttons */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Catálogo Oficial de Servicios y Cuotas Celene:
            </span>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Quick add service chips */}
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-white/70 rounded-xl border border-slate-200/80">
            {filteredServices.map((srv) => (
              <button
                key={srv.id}
                type="button"
                onClick={() => addService(srv.nombre, srv.cuotaCelene)}
                className="text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-slate-700 hover:text-emerald-900 transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                title={`Valor Comercial: $${srv.costoPrivado} MXN | Cuota Celene: $${srv.cuotaCelene} MXN`}
              >
                <span>+ {srv.nombre}</span>
                <span className={`font-bold font-mono text-[10px] px-1 rounded ${
                  srv.cuotaCelene === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {srv.cuotaCelene === 0 ? 'GRATIS' : `$${srv.cuotaCelene}`}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Service Input */}
        <div className="flex flex-col sm:flex-row items-end gap-3 pt-2 border-t border-emerald-100">
          <div className="flex-1 w-full">
            <Input
              label="Descripción del Servicio o Donativo Manual"
              value={descInput}
              onChange={(e) => setDescInput(e.target.value)}
              placeholder="Ej. Consulta Médica General, Curación..."
            />
          </div>

          <div className="w-full sm:w-36">
            <Input
              label="Cuota (MXN)"
              type="number"
              value={amountInput}
              onChange={(e) => setAmountInput(parseFloat(e.target.value) || 0)}
              leftIcon={<DollarSign className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => addService(descInput, amountInput)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs font-semibold"
          >
            Agregar
          </Button>
        </div>
      </div>

      {/* Services List Table */}
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
          Desglose del Recibo ({value.services.length} conceptos)
        </span>

        {value.services.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
            Sin servicios o donativos agregados a este recibo.
          </div>
        ) : (
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Concepto / Servicio</th>
                  <th className="py-2.5 px-4 text-right">Cuota Aportada</th>
                  <th className="py-2.5 px-4 text-center w-12">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {value.services.map((srv) => (
                  <tr key={srv.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-4 font-medium text-slate-800">{srv.description}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                      ${srv.amount.toFixed(2)} MXN
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => removeService(srv.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded cursor-pointer"
                        title="Eliminar concepto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold">
                <tr>
                  <td className="py-3 px-4 text-slate-800 text-sm">TOTAL APORTACIÓN / DONATIVO:</td>
                  <td className="py-3 px-4 text-right text-base text-emerald-700 font-mono">
                    ${value.totalAmount.toFixed(2)} MXN
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <Select
            label="Método de Aportación / Pago"
            value={value.paymentMethod}
            onChange={(e) => onChange({ ...value, paymentMethod: e.target.value as Receipt['paymentMethod'] })}
          >
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Donativo Exento">Donativo Exento (Sin costo)</option>
            <option value="Cuota de Recuperación">Cuota de Recuperación</option>
          </Select>

          <Input
            label="Notas Adicionales del Recibo (Opcional)"
            placeholder="Observaciones de pago o donativo..."
            value={value.notes || ''}
            onChange={(e) => onChange({ ...value, notes: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
