import { useState } from 'react';
import type { ClinicalNote, Receipt } from '@/entities/clinical-note/model/schemas';
import type { Patient } from '@/entities/patient/model/schemas';
import { PatientService } from '@/entities/patient/api/patientService';
import { useAuth } from '@/app/providers/AuthContext';
import { PrintService } from '@/shared/lib/printService';
import { DateTimeService } from '@/shared/lib/dateTimeService';
import { Button } from '@/shared/ui';
import {
  Printer,
  X,
  Receipt as ReceiptIcon,
  MapPin,
} from 'lucide-react';

interface ServiceReceiptPrintProps {
  note: ClinicalNote;
  patient: Patient;
  receipt?: Receipt;
  onClose: () => void;
}

export function ServiceReceiptPrint({
  note,
  patient,
  receipt,
  onClose,
}: ServiceReceiptPrintProps) {
  const { clinicConfig, currentUser } = useAuth();
  const [printFormat, setPrintFormat] = useState<'letter' | 'thermal'>('letter');

  const activeReceipt: Receipt = receipt || note.receipt || {
    receiptFolio: `REC-${patient.id}-${Date.now().toString().slice(-4)}`,
    services: [
      { id: '1', description: 'Consulta Médica General', commercialCost: 650, amount: 150, isSubsidized: true },
    ],
    totalCommercial: 650,
    totalSubsidy: 500,
    totalAmount: 150,
    receivedAmount: 150,
    pendingAmount: 0,
    paymentMethod: 'Efectivo',
    notes: '',
  };

  const age = PatientService.calculateAge(patient.demographics.birthDate);
  const formattedGender =
    patient.demographics.gender === 'M'
      ? 'Masculino'
      : patient.demographics.gender === 'F'
      ? 'Femenino'
      : patient.demographics.gender || 'No especificado';

  const attendingDoctorName =
    currentUser?.role === 'pasante'
      ? currentUser.fullName
      : (note.attendingDoctorName || currentUser?.fullName || 'Dr. Carlos Donato Dueñas Prieto');

  const totalCommercial =
    activeReceipt.totalCommercial ||
    activeReceipt.services.reduce((acc, s) => acc + (s.commercialCost || s.amount), 0);

  const totalSubsidy =
    activeReceipt.totalSubsidy || Math.max(0, totalCommercial - activeReceipt.totalAmount);

  const percentSubsidized =
    totalCommercial > 0 ? Math.round((totalSubsidy / totalCommercial) * 100) : 0;

  const handlePrint = () => {
    const elementId = printFormat === 'letter' ? 'printable-receipt-sheet' : 'printable-thermal-ticket';
    PrintService.printElement(elementId, {
      title: `Recibo de Aportacion - ${patient.demographics.firstName} ${patient.demographics.lastName} (${patient.id})`,
    });
  };

  const renderReceiptHalf = (isCopy: boolean) => (
    <div className="border border-slate-300 p-4 rounded-xl bg-white space-y-2.5 flex flex-col justify-between page-break-inside-avoid shadow-2xs">
      {/* Header con Logo 640x153 */}
      <div className="flex items-start justify-between border-b-2 border-slate-800 pb-2">
        <div className="flex items-center gap-3">
          <div className="h-10 max-w-[170px] shrink-0 flex items-center">
            <img
              src={clinicConfig?.logoUrl || 'https://i.ibb.co/k2LCbnsF/tcarta-volante.png'}
              alt="Logo Celene"
              className="h-full w-auto object-contain"
            />
          </div>
          <div>
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-tight">
              {clinicConfig?.clinicName || 'PROYECTO CELENE ROSARITO'}
            </h2>
            <p className="text-[10px] font-bold text-slate-700 uppercase">
              {clinicConfig?.foundationName || 'FUNDACIÓN PROYECTO CELENE'}
            </p>
            <p className="text-[8.5px] text-slate-600 flex items-center gap-0.5">
              <MapPin className="w-2 h-2 shrink-0" />
              {clinicConfig?.address || 'Gral. Guadalupe Victoria, Lienzo Charro, Playas de Rosarito'} • Tel: {clinicConfig?.phone || '661 104 4050'}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0 space-y-0.5">
          <span className="inline-block px-2 py-0.5 bg-emerald-800 text-white rounded font-extrabold text-[9px] uppercase tracking-wider shadow-2xs">
            {isCopy ? 'COPIA PARA ARCHIVO' : 'ORIGINAL - PACIENTE'}
          </span>
          <p className="text-xs font-mono font-bold text-slate-900 mt-0.5">
            Folio: {activeReceipt.receiptFolio || `REC-${patient.id}`}
          </p>
          <p className="text-[10px] text-slate-600 font-medium">
            Fecha: {DateTimeService.formatDate(note.date, { year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Patient & Doctor line */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-[10px] bg-slate-50/80 p-2 rounded-lg border border-slate-300">
        <div className="sm:col-span-5">
          <span className="text-[8px] text-slate-600 font-bold block uppercase">PACIENTE / BENEFICIARIO</span>
          <strong className="text-slate-900 break-words block text-xs uppercase leading-tight font-extrabold">
            {patient.demographics.firstName} {patient.demographics.lastName}
          </strong>
          <span className="text-slate-700 text-[9px] block">
            Nac: {patient.demographics.birthDate || '-'} • Tel: {patient.demographics.phone || '-'}
          </span>
        </div>
        <div className="sm:col-span-3">
          <span className="text-[8px] text-slate-600 font-bold block uppercase">EXPEDIENTE / EDAD / SEXO</span>
          <span className="font-mono font-bold text-slate-900 block">{patient.id}</span>
          <span className="text-slate-800 font-medium block">{age.displayText} • {formattedGender}</span>
        </div>
        <div className="sm:col-span-4">
          <span className="text-[8px] text-slate-600 font-bold block uppercase">MÉDICO / RECEPTOR</span>
          <span className="text-slate-900 font-bold break-words block leading-tight">{attendingDoctorName}</span>
          <span className="text-slate-700 text-[8.5px] block">UNIVERSIDAD AUTÓNOMA DE BAJA CALIFORNIA</span>
        </div>
      </div>

      {/* Concepts Table with Subsidy Breakdown */}
      <div className="space-y-1">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-300 text-[9px] text-slate-600 uppercase font-black">
              <th className="text-left pb-1">Concepto / Servicio Prestado</th>
              <th className="text-right pb-1">Valor Privado</th>
              <th className="text-right pb-1">Subsidio Celene</th>
              <th className="text-right pb-1">Cuota Aportada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activeReceipt.services.map((s) => {
              const commercial = s.commercialCost || s.amount;
              const subsidy = Math.max(0, commercial - s.amount);
              return (
                <tr key={s.id}>
                  <td className="py-1 text-slate-900 font-semibold text-[11px]">
                    {s.description}
                    {s.amount === 0 && (
                      <span className="ml-1.5 text-[8.5px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-900 font-black">
                        100% EXENTO
                      </span>
                    )}
                  </td>
                  <td className="py-1 text-right font-mono text-slate-500 text-[10px]">
                    ${commercial.toFixed(2)}
                  </td>
                  <td className="py-1 text-right font-mono text-emerald-700 font-bold text-[10px]">
                    {subsidy > 0 ? `-$${subsidy.toFixed(2)}` : '$0.00'}
                  </td>
                  <td className="py-1 text-right font-mono font-bold text-slate-900 text-[11px]">
                    ${s.amount.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-800 font-black">
              <td className="pt-1 text-slate-900 text-[11px] uppercase">TOTALES:</td>
              <td className="pt-1 text-right font-mono text-slate-600 text-[10px]">
                ${totalCommercial.toFixed(2)}
              </td>
              <td className="pt-1 text-right font-mono text-emerald-800 text-[10px]">
                -${totalSubsidy.toFixed(2)} ({percentSubsidized}%)
              </td>
              <td className="pt-1 text-right font-mono text-xs text-blue-950 font-black">
                ${activeReceipt.totalAmount.toFixed(2)} MXN
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Payment Summary, Notes & Signatures */}
      <div className="flex items-end justify-between border-t border-slate-200 pt-1.5 text-[10px] text-slate-700">
        <div className="space-y-0.5 max-w-[65%]">
          <p className="text-[9.5px]">
            Método: <strong className="text-slate-900">{activeReceipt.paymentMethod}</strong>
            {activeReceipt.receivedAmount !== undefined && (
              <> • Recibido: <strong className="text-emerald-800 font-mono">${activeReceipt.receivedAmount.toFixed(2)}</strong></>
            )}
            {(activeReceipt.pendingAmount ?? 0) > 0 && (
              <> • Saldo pendiente: <strong className="text-rose-800 font-mono">${(activeReceipt.pendingAmount ?? 0).toFixed(2)}</strong></>
            )}
          </p>
          {activeReceipt.notes && <p className="italic text-[9px] text-slate-600">Nota: {activeReceipt.notes}</p>}
          <p className="text-[8px] text-slate-500 leading-tight">
            * Comprobante de donativo / aportación solidaria de recuperación. Fundación Proyecto Celene es una A.C. sin fines de lucro.
          </p>
        </div>

        <div className="flex items-center gap-4 text-center">
          <div className="w-28">
            <div className="border-b border-slate-800 h-5"></div>
            <span className="text-[7.5px] text-slate-600 block pt-0.5 font-bold uppercase">Firma Paciente</span>
          </div>
          <div className="w-28">
            <div className="border-b border-slate-800 h-5"></div>
            <span className="text-[7.5px] text-slate-600 block pt-0.5 font-bold uppercase">Firma / Sello Recepción</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh] text-left">
        {/* Action Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-700">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <ReceiptIcon className="w-5 h-5 text-emerald-400" />
              Recibo de Donativo y Aportación Solidaria
            </h3>
            <p className="text-xs text-slate-300">
              {printFormat === 'letter'
                ? 'Formato oficial de 2 tantos en 1 hoja carta (Original Paciente + Copia Archivo)'
                : 'Formato Ticket Térmico POS (58mm / 80mm)'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Format toggle */}
            <div className="bg-slate-800 p-0.5 rounded-lg flex items-center border border-slate-700 mr-2">
              <button
                type="button"
                onClick={() => setPrintFormat('letter')}
                className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  printFormat === 'letter' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Hoja Carta (2 Tantos)
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat('thermal')}
                className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  printFormat === 'thermal' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Ticket Térmico (POS)
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-slate-200 border-slate-600 hover:bg-slate-800"
            >
              <X className="w-4 h-4 mr-1" /> Cerrar
            </Button>

            <Button
              variant="primary"
              size="md"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 shadow-md font-bold"
            >
              Imprimir Recibo
            </Button>
          </div>
        </div>

        {/* Print Content Area */}
        <div className="p-6 sm:p-8 overflow-y-auto bg-slate-100 flex justify-center">
          {printFormat === 'letter' ? (
            /* Layout Hoja Carta (2 tantos con corte) */
            <div
              id="printable-receipt-sheet"
              className="w-full max-w-3xl p-4 bg-white border border-slate-300 rounded-2xl shadow-xs font-sans text-slate-900 space-y-4"
            >
              {/* Top Half: Original Paciente */}
              {renderReceiptHalf(false)}

              <div className="text-center py-0.5 text-xs text-slate-400 flex items-center justify-center gap-2">
                <span>✂️</span>
                <span className="border-t border-dashed border-slate-400 flex-1"></span>
                <span className="uppercase font-bold text-[9px] tracking-wider text-slate-500">Línea de corte media carta</span>
                <span className="border-t border-dashed border-slate-400 flex-1"></span>
                <span>✂️</span>
              </div>

              {/* Bottom Half: Copia Archivo */}
              {renderReceiptHalf(true)}
            </div>
          ) : (
            /* Layout Ticket Térmico POS 58mm/80mm */
            <div
              id="printable-thermal-ticket"
              className="w-72 p-4 bg-white border border-slate-400 rounded-lg shadow-md font-mono text-[11px] text-slate-900 space-y-2 text-center"
            >
              <div className="border-b border-dashed border-slate-400 pb-2 space-y-0.5">
                <p className="font-bold text-xs uppercase">{clinicConfig?.clinicName || 'PROYECTO CELENE'}</p>
                <p className="text-[10px] uppercase">{clinicConfig?.foundationName || 'FUNDACIÓN PROYECTO CELENE'}</p>
                <p className="text-[9px]">{clinicConfig?.address}</p>
                <p className="text-[9px]">Tel: {clinicConfig?.phone || '661 104 4050'}</p>
                <p className="font-bold text-xs pt-1">RECIBO DE APORTACIÓN</p>
                <p className="text-[10px]">Folio: {activeReceipt.receiptFolio || `REC-${patient.id}`}</p>
                <p className="text-[9px]">Fecha: {DateTimeService.formatDateTime(note.date)}</p>
              </div>

              <div className="text-left border-b border-dashed border-slate-400 py-1.5 space-y-0.5 text-[10px]">
                <p><strong>Paciente:</strong> {patient.demographics.firstName} {patient.demographics.lastName}</p>
                <p><strong>Expediente:</strong> {patient.id} • {age.displayText}</p>
                <p><strong>Atiende:</strong> {attendingDoctorName}</p>
              </div>

              {/* Servs */}
              <div className="text-left border-b border-dashed border-slate-400 py-1.5 space-y-1 text-[10px]">
                <p className="font-bold text-[9px] uppercase">SERVICIOS:</p>
                {activeReceipt.services.map((s) => (
                  <div key={s.id} className="flex justify-between">
                    <span className="truncate max-w-[160px]">{s.description}</span>
                    <span className="font-bold">${s.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="text-right border-b border-dashed border-slate-400 py-1.5 space-y-0.5 text-[10px]">
                <p>Valor Comercial: ${totalCommercial.toFixed(2)}</p>
                <p className="text-slate-600">Subsidio Celene: -${totalSubsidy.toFixed(2)}</p>
                <p className="font-black text-xs pt-0.5">TOTAL A COBRAR: ${activeReceipt.totalAmount.toFixed(2)} MXN</p>
                {activeReceipt.receivedAmount !== undefined && (
                  <p>Recibido: ${activeReceipt.receivedAmount.toFixed(2)}</p>
                )}
                {(activeReceipt.pendingAmount ?? 0) > 0 && (
                  <p className="font-bold text-rose-700">Saldo pendiente: ${(activeReceipt.pendingAmount ?? 0).toFixed(2)}</p>
                )}
                <p className="pt-1 text-[9px] text-left">Método de pago: <strong>{activeReceipt.paymentMethod}</strong></p>
              </div>

              <div className="pt-2 text-[8px] space-y-2 text-center text-slate-600">
                <p>Este recibo es un comprobante de aportación solidaria / donativo no deducible de impuestos.</p>
                <div className="pt-4 border-b border-slate-400 w-36 mx-auto"></div>
                <p className="text-[8px] uppercase font-bold">Firma / Sello de Recepción</p>
                <p className="text-[9px] font-bold">¡GRACIAS POR SU APOYO!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
