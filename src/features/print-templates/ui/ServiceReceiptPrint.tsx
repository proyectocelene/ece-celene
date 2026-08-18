import type { ClinicalNote, Receipt } from '@/entities/clinical-note/model/schemas';
import type { Patient } from '@/entities/patient/model/schemas';
import { PatientService } from '@/entities/patient/api/patientService';
import { useAuth } from '@/app/providers/AuthContext';
import { PrintService } from '@/shared/lib/printService';
import { Button } from '@/shared/ui';
import { Printer, X, Receipt as ReceiptIcon, MapPin } from 'lucide-react';

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

  const activeReceipt: Receipt = receipt || note.receipt || {
    receiptFolio: `REC-${patient.id}-${Date.now().toString().slice(-4)}`,
    services: [
      { id: '1', description: 'Consulta Médica General', amount: 200 },
    ],
    totalAmount: 200,
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

  const handlePrint = () => {
    PrintService.printElement('printable-receipt-sheet', {
      title: `Recibo de Donativo - ${patient.demographics.firstName} ${patient.demographics.lastName} (${patient.id})`,
    });
  };

  const renderReceiptHalf = (isCopy: boolean) => (
    <div className="border border-slate-400 p-4 rounded-xl bg-white space-y-2.5 flex flex-col justify-between page-break-inside-avoid shadow-2xs">
      {/* Header con Logo 640x153 */}
      <div className="flex items-start justify-between border-b-2 border-slate-800 pb-2">
        <div className="flex items-center gap-3">
          <div className="h-10 max-w-[180px] shrink-0 flex items-center">
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
            <p className="text-[9px] text-slate-600 flex items-center gap-0.5">
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
            Fecha: {new Date(note.date).toLocaleDateString('es-MX')}
          </p>
        </div>
      </div>

      {/* Patient & Doctor line */}
      <div className="grid grid-cols-3 gap-2 text-[10px] bg-slate-50/80 p-2 rounded-lg border border-slate-300">
        <div>
          <span className="text-[8px] text-slate-600 font-bold block uppercase">PACIENTE</span>
          <strong className="text-slate-900 break-words block text-[11px] uppercase leading-tight font-bold">
            {patient.demographics.firstName} {patient.demographics.lastName}
          </strong>
          <span className="text-slate-700 text-[9px] block">Nac: {patient.demographics.birthDate || '-'}</span>
        </div>
        <div>
          <span className="text-[8px] text-slate-600 font-bold block uppercase">EXPEDIENTE / EDAD / SEXO</span>
          <span className="font-mono font-bold text-slate-900 block">{patient.id}</span>
          <span className="text-slate-800 font-medium block">{age.displayText} • {formattedGender}</span>
        </div>
        <div>
          <span className="text-[8px] text-slate-600 font-bold block uppercase">MÉDICO / RECEPTOR</span>
          <span className="text-slate-900 font-bold break-words block leading-tight">{currentUser?.fullName || note.attendingDoctorName || 'Dr. Carlos Donato Dueñas Prieto'}</span>
          <span className="text-slate-700 text-[9px] block">UNIVERSIDAD AUTÓNOMA DE BAJA CALIFORNIA</span>
        </div>
      </div>

      {/* Concepts Table */}
      <div className="space-y-1">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-300 text-[9px] text-slate-600 uppercase font-black">
              <th className="text-left pb-1">Concepto / Servicio Prestado</th>
              <th className="text-right pb-1">Importe (MXN)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activeReceipt.services.map((s) => (
              <tr key={s.id}>
                <td className="py-1 text-slate-900 font-medium text-[11px]">{s.description}</td>
                <td className="py-1 text-right font-mono font-bold text-slate-900 text-[11px]">${s.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-800 font-black">
              <td className="pt-1.5 text-slate-900 text-xs">TOTAL APORTACIÓN / DONATIVO:</td>
              <td className="pt-1.5 text-right font-mono text-sm text-emerald-800">
                ${activeReceipt.totalAmount.toFixed(2)} MXN
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer & Signature */}
      <div className="flex items-end justify-between border-t border-slate-200 pt-1.5 text-[10px] text-slate-600">
        <div>
          <p>Método de Aportación: <strong className="text-slate-900">{activeReceipt.paymentMethod}</strong></p>
          {activeReceipt.notes && <p className="italic">Nota: {activeReceipt.notes}</p>}
        </div>

        <div className="text-center w-36">
          <div className="border-b border-slate-800 h-5"></div>
          <span className="text-[8px] text-slate-600 block pt-0.5 font-bold uppercase">Firma / Sello de Recepción</span>
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
              Recibo de Donativo y Servicios (Hoja Dividida: Original + Copia)
            </h3>
            <p className="text-xs text-slate-300">
              Impresión de 2 tantos en 1 sola hoja carta para paciente y archivo.
            </p>
          </div>

          <div className="flex items-center gap-3">
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
        <div className="p-6 sm:p-8 overflow-y-auto bg-slate-50">
          <div
            id="printable-receipt-sheet"
            className="p-4 bg-white border border-slate-300 rounded-2xl shadow-xs font-sans text-slate-900 space-y-4"
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
        </div>
      </div>
    </div>
  );
}
