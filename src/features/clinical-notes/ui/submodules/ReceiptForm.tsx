import { useState, useEffect } from 'react';
import type { Receipt, ReceiptServiceItem } from '@/entities/clinical-note/model/schemas';
import { CLINIC_SERVICES_CATALOG } from '@/entities/catalogs/data/servicesData';
import { Button, Input, Select } from '@/shared/ui';
import {
  Receipt as ReceiptIcon,
  Plus,
  Trash2,
  DollarSign,
  Gift,
} from 'lucide-react';

interface ReceiptFormProps {
  value: Receipt;
  onChange: (receipt: Receipt) => void;
  patientId: string;
}

export function ReceiptForm({ value, onChange, patientId }: ReceiptFormProps) {
  const [descInput, setDescInput] = useState('Consulta Médica General');
  const [commercialInput, setCommercialInput] = useState<number>(650);
  const [amountInput, setAmountInput] = useState<number>(150);
  const [receivedInput, setReceivedInput] = useState<number>(value.receivedAmount ?? value.totalAmount ?? 150);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  const categories = ['Todas', ...Array.from(new Set(CLINIC_SERVICES_CATALOG.map((s) => s.categoria)))];

  const filteredServices = selectedCategory === 'Todas'
    ? CLINIC_SERVICES_CATALOG
    : CLINIC_SERVICES_CATALOG.filter((s) => s.categoria === selectedCategory);

  // Recalcular totales cuando cambian los servicios
  const updateReceipt = (newServices: ReceiptServiceItem[], customReceived?: number) => {
    const totalCommercial = newServices.reduce((acc, s) => acc + (s.commercialCost || s.amount), 0);
    const totalAmount = newServices.reduce((acc, s) => acc + s.amount, 0);
    const totalSubsidy = Math.max(0, totalCommercial - totalAmount);

    const received = customReceived !== undefined ? customReceived : (value.receivedAmount ?? totalAmount);
    const pendingAmount = Math.max(0, totalAmount - received);

    onChange({
      ...value,
      receiptFolio: value.receiptFolio || `REC-${patientId}-${Date.now().toString().slice(-4)}`,
      services: newServices,
      totalCommercial,
      totalSubsidy,
      totalAmount,
      receivedAmount: received,
      pendingAmount,
    });
  };

  const handleAddCatalogService = (nombre: string, costoPrivado: number, cuotaCelene: number) => {
    const newItem: ReceiptServiceItem = {
      id: `srv-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      description: nombre,
      commercialCost: costoPrivado,
      amount: cuotaCelene,
      isSubsidized: cuotaCelene === 0 || cuotaCelene < costoPrivado,
    };

    const newServices = [...value.services, newItem];
    const newTotal = newServices.reduce((acc, s) => acc + s.amount, 0);
    updateReceipt(newServices, newTotal);
  };

  const handleAddManualService = () => {
    if (!descInput.trim()) return;
    const newItem: ReceiptServiceItem = {
      id: `srv-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      description: descInput.trim(),
      commercialCost: Math.max(amountInput, commercialInput),
      amount: Math.max(0, amountInput),
      isSubsidized: amountInput < commercialInput,
    };

    const newServices = [...value.services, newItem];
    const newTotal = newServices.reduce((acc, s) => acc + s.amount, 0);
    updateReceipt(newServices, newTotal);
  };

  const removeService = (id: string) => {
    const newServices = value.services.filter((s) => s.id !== id);
    const newTotal = newServices.reduce((acc, s) => acc + s.amount, 0);
    updateReceipt(newServices, newTotal);
  };

  const toggleSubsidizeItem = (id: string) => {
    const newServices = value.services.map((s) => {
      if (s.id === id) {
        const isFree = s.amount === 0;
        return {
          ...s,
          amount: isFree ? (s.commercialCost ? Math.round(s.commercialCost * 0.25) : 100) : 0,
          isSubsidized: !isFree,
        };
      }
      return s;
    });
    const newTotal = newServices.reduce((acc, s) => acc + s.amount, 0);
    updateReceipt(newServices, newTotal);
  };

  const handleReceivedChange = (val: number) => {
    setReceivedInput(val);
    updateReceipt(value.services, val);
  };

  // Sync received input if external value changes
  useEffect(() => {
    if (value.receivedAmount !== undefined) {
      setReceivedInput(value.receivedAmount);
    }
  }, [value.receivedAmount]);

  const totalCommercial = value.totalCommercial || value.services.reduce((acc, s) => acc + (s.commercialCost || s.amount), 0);
  const totalSubsidy = value.totalSubsidy || Math.max(0, totalCommercial - value.totalAmount);
  const percentSubsidized = totalCommercial > 0 ? Math.round((totalSubsidy / totalCommercial) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-150 text-left font-sans">
      {/* Box de Resumen Solidario Celene */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
            Valor Comercial Privado
          </span>
          <p className="text-lg font-mono font-black text-slate-700">
            ${totalCommercial.toFixed(2)} <span className="text-xs text-slate-400 font-sans">MXN</span>
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-emerald-900 tracking-wider flex items-center gap-1">
              <Gift className="w-3.5 h-3.5 text-emerald-600" /> Subsidio Donado Celene
            </span>
            {percentSubsidized > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-200/80 text-emerald-900">
                {percentSubsidized}% Ahorro
              </span>
            )}
          </div>
          <p className="text-lg font-mono font-black text-emerald-800">
            -${totalSubsidy.toFixed(2)} <span className="text-xs text-emerald-700 font-sans">MXN</span>
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-600/15 space-y-1">
          <span className="text-[10px] font-bold uppercase text-blue-100 tracking-wider block">
            Cuota / Total Aporte Paciente
          </span>
          <p className="text-xl font-mono font-black text-white">
            ${value.totalAmount.toFixed(2)} <span className="text-xs text-blue-200 font-sans">MXN</span>
          </p>
        </div>
      </div>

      {/* Catálogo de Servicios Rápidos */}
      <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
            <ReceiptIcon className="w-4 h-4 text-blue-600" />
            <span>Catálogo Oficial de Servicios (Proyecto Celene)</span>
          </div>

          {/* Filtros por Categoría */}
          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Servicios Rápidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
          {filteredServices.map((srv) => (
            <button
              key={srv.id}
              type="button"
              onClick={() => handleAddCatalogService(srv.nombre, srv.costoPrivado, srv.cuotaCelene)}
              className="text-left p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all shadow-2xs flex flex-col justify-between group cursor-pointer"
            >
              <div className="flex items-start justify-between gap-1">
                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-900 leading-tight">
                  {srv.nombre}
                </span>
                <span className="text-[9px] text-slate-400 line-through shrink-0 font-mono">
                  ${srv.costoPrivado}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 mt-1 border-t border-slate-100">
                <span className="text-[10px] text-slate-500 font-medium">{srv.categoria}</span>
                <span className={`text-[10px] font-mono font-extrabold px-1.5 py-0.2 rounded ${
                  srv.cuotaCelene === 0
                    ? 'bg-emerald-100 text-emerald-900 font-black'
                    : 'bg-blue-50 text-blue-900 border border-blue-200'
                }`}>
                  {srv.cuotaCelene === 0 ? 'GRATIS ($0)' : `$${srv.cuotaCelene} MXN`}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Entrada Manual de Conceptos Fuera de Catálogo */}
        <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-end gap-2.5">
          <div className="flex-1 w-full">
            <Input
              label="Otro Concepto / Donativo Manual"
              value={descInput}
              onChange={(e) => setDescInput(e.target.value)}
              placeholder="Ej. Curación Especial, Donativo Voluntario..."
            />
          </div>

          <div className="w-full sm:w-32">
            <Input
              label="Costo Comercial"
              type="number"
              value={commercialInput}
              onChange={(e) => setCommercialInput(parseFloat(e.target.value) || 0)}
              leftIcon={<DollarSign className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="w-full sm:w-32">
            <Input
              label="Cuota Paciente"
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
            onClick={handleAddManualService}
            leftIcon={<Plus className="w-4 h-4" />}
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs shrink-0"
          >
            Agregar
          </Button>
        </div>
      </div>

      {/* Desglose de Conceptos en el Recibo */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
            Servicios del Recibo ({value.services.length})
          </span>
          <span className="text-xs text-slate-500 font-mono">
            Folio: <strong>{value.receiptFolio || 'Automático'}</strong>
          </span>
        </div>

        {value.services.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-slate-300 text-center text-slate-400 text-xs bg-white">
            Selecciona arriba uno o más servicios para generar el recibo de donativo.
          </div>
        ) : (
          <div className="border border-slate-300 rounded-xl overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Concepto / Servicio</th>
                  <th className="py-2.5 px-3 text-right">Valor Comercial</th>
                  <th className="py-2.5 px-3 text-right">Cuota Aportada</th>
                  <th className="py-2.5 px-3 text-center">Subsidio 100%</th>
                  <th className="py-2.5 px-3 text-center w-12">Quitar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {value.services.map((srv) => (
                  <tr key={srv.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      {srv.description}
                      {srv.amount === 0 && (
                        <span className="ml-2 text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900 font-bold">
                          Exento / 100% Subsidiado
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                      ${(srv.commercialCost || srv.amount).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      ${srv.amount.toFixed(2)} MXN
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => toggleSubsidizeItem(srv.id)}
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                          srv.amount === 0
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title="Marcar este servicio como donativo exento ($0)"
                      >
                        {srv.amount === 0 ? '✓ Exento ($0)' : 'Hacer $0'}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeService(srv.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded cursor-pointer"
                        title="Eliminar servicio"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-black">
                <tr>
                  <td className="py-2.5 px-4 text-slate-800 text-xs uppercase">TOTALES:</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600 text-xs">
                    ${totalCommercial.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-sm text-blue-900">
                    ${value.totalAmount.toFixed(2)} MXN
                  </td>
                  <td colSpan={2} className="py-2.5 px-3 text-right text-[10px] text-emerald-800 font-bold">
                    Subsidio: -${totalSubsidy.toFixed(2)} ({percentSubsidized}%)
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Datos de Cobro y Saldo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <Select
            label="Método de Aportación / Pago"
            value={value.paymentMethod}
            onChange={(e) => onChange({ ...value, paymentMethod: e.target.value as Receipt['paymentMethod'] })}
          >
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Donativo Exento">Donativo Exento (100% Gratuito)</option>
            <option value="Cuota de Recuperación">Cuota de Recuperación</option>
          </Select>

          <Input
            label="Aporte Recibido Hoy (MXN)"
            type="number"
            value={receivedInput}
            onChange={(e) => handleReceivedChange(parseFloat(e.target.value) || 0)}
            leftIcon={<DollarSign className="w-4 h-4 text-slate-400" />}
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Saldo Pendiente / Adeudo</label>
            <div className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-100 flex items-center font-mono font-bold text-sm">
              <span className={(value.pendingAmount ?? 0) > 0 ? 'text-rose-700' : 'text-emerald-700'}>
                ${(value.pendingAmount ?? 0).toFixed(2)} MXN
              </span>
            </div>
          </div>
        </div>

        <Input
          label="Observaciones o Comentarios del Recibo (Opcional)"
          placeholder="Ej. Paciente aportó $100 en efectivo y cubre resto próxima consulta..."
          value={value.notes || ''}
          onChange={(e) => onChange({ ...value, notes: e.target.value })}
        />
      </div>
    </div>
  );
}
