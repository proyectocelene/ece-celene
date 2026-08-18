import { useState } from 'react';
import { useAuth } from '@/app/providers/AuthContext';
import type { ClinicalNote } from '@/entities/clinical-note/model/schemas';
import type { Patient } from '@/entities/patient/model/schemas';
import { ClinicalNoteService } from '@/entities/clinical-note/api/clinicalNoteService';
import { PatientService } from '@/entities/patient/api/patientService';
import { PrintService } from '@/shared/lib/printService';
import { MedicationSchedulePrint } from '@/features/print-templates/ui/MedicationSchedulePrint';
import { LabOrderPrintModal } from '@/features/print-templates/ui/LabOrderPrintModal';
import { ServiceReceiptPrint } from '@/features/print-templates/ui/ServiceReceiptPrint';
import { Modal, Button, Badge } from '@/shared/ui';
import {
  FileText,
  Printer,
  Activity,
  HeartPulse,
  Stethoscope,
  Pill,
  ShieldAlert,
  MapPin,
  TestTubes,
  Receipt as ReceiptIcon,
  Clock,
  Eye,
  Edit3,
} from 'lucide-react';

interface ClinicalNoteViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: ClinicalNote | null;
  patient: Patient | null;
  onEditNote?: (note: ClinicalNote) => void;
}

export function ClinicalNoteViewerModal({
  isOpen,
  onClose,
  note,
  patient,
  onEditNote,
}: ClinicalNoteViewerModalProps) {
  const { clinicConfig, logAuditAction } = useAuth();
  const [viewMode, setViewMode] = useState<'prescription' | 'note'>('prescription');
  const [isLargePrint, setIsLargePrint] = useState(false);

  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isLabOrderOpen, setIsLabOrderOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  if (!note || !patient) return null;

  const age = PatientService.calculateAge(patient.demographics.birthDate);
  const bmiCalc = ClinicalNoteService.calculateBMI(note.vitalSigns?.weightKg, note.vitalSigns?.heightCm);

  const handlePrint = async () => {
    await logAuditAction(
      'IMPRIMIR_RECETA',
      `Impresión de receta médica para el paciente ${patient.demographics.firstName} ${patient.demographics.lastName} (${patient.id}).`,
      patient.id
    );
    PrintService.printElement('printable-prescription-sheet', {
      title: `Receta Médica - ${patient.demographics.firstName} ${patient.demographics.lastName} (${patient.id})`,
    });
  };

  const isPasante = note.attendingDoctorRole === 'pasante' || note.attendingDoctorTitle?.includes('PASANTE');

  const formattedGender =
    patient.demographics.gender === 'M'
      ? 'Masculino'
      : patient.demographics.gender === 'F'
      ? 'Femenino'
      : patient.demographics.gender || 'No especificado';

  // Renderizador de la Receta Médica Proporcional y de Alto Contraste
  const renderPrescriptionContent = () => (
    <div
      id="printable-prescription-sheet"
      className={`p-5 sm:p-6 bg-white border border-slate-300 rounded-xl space-y-3.5 text-left text-slate-900 shadow-2xs font-sans ${
        isLargePrint ? 'text-sm' : 'text-xs'
      }`}
    >
      {/* 1. Membrete con Logo Horizontal y Datos Oficiales de Alto Contraste */}
      <div className="flex justify-between items-start border-b-2 border-slate-800 pb-2.5">
        <div className="flex items-center gap-3">
          <div className="h-12 max-w-[200px] shrink-0 flex items-center">
            <img
              src={clinicConfig?.logoUrl || 'https://i.ibb.co/k2LCbnsF/tcarta-volante.png'}
              alt="Logo Fundación Celene"
              className="h-full w-auto object-contain"
            />
          </div>
          <div className="space-y-0.2">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight">
              {clinicConfig?.clinicName || 'PROYECTO CELENE ROSARITO'}
            </h2>
            <p className="text-[11px] font-bold text-slate-800 uppercase">
              {clinicConfig?.foundationName || 'FUNDACIÓN PROYECTO CELENE'}
            </p>
            <p className="text-[10px] text-slate-700 flex items-center gap-1 font-medium">
              <MapPin className="w-2.5 h-2.5 text-slate-700 shrink-0" />
              {clinicConfig?.address || 'Gral. Guadalupe Victoria, Lienzo Charro, Playas de Rosarito'}
            </p>
            <p className="text-[10px] text-slate-700 font-medium">
              Tel: {clinicConfig?.phone || '661 104 4050'} • {clinicConfig?.email || 'consultorio@proyectocelene.org'} • {clinicConfig?.website || 'proyectocelene.org'}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0 space-y-0.5">
          <div className="px-3 py-0.5 border-2 border-slate-900 text-slate-900 font-bold rounded text-center text-xs tracking-wider uppercase">
            RECETA MÉDICA
          </div>
          <p className="text-[11px] font-semibold text-slate-800 pt-0.5">
            Fecha: <strong className="text-slate-900 font-bold">{new Date(note.date).toLocaleDateString('es-MX')}</strong>
          </p>
          <p className="text-[11px] font-mono text-slate-800">
            Folio: <strong className="text-slate-900 font-bold">{patient.id}</strong>
          </p>
        </div>
      </div>

      {/* 2. Ficha Demográfica del Paciente: Nombre Completo sin recortar */}
      <div className="patient-card grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-2.5 rounded-lg border border-slate-300 bg-slate-50/80 text-xs">
        <div className="sm:col-span-5">
          <span className="text-slate-600 font-bold uppercase text-[9px] block">PACIENTE</span>
          <strong className="text-slate-900 text-xs sm:text-sm font-bold uppercase break-words leading-tight block">
            {patient.demographics.firstName} {patient.demographics.lastName}
          </strong>
        </div>
        <div className="sm:col-span-2">
          <span className="text-slate-600 font-bold uppercase text-[9px] block">FECHA DE NACIMIENTO</span>
          <span className="text-slate-900 font-semibold text-xs block">{patient.demographics.birthDate || 'No registrada'}</span>
        </div>
        <div className="sm:col-span-3">
          <span className="text-slate-600 font-bold uppercase text-[9px] block">EDAD / SEXO</span>
          <span className="text-slate-900 font-bold text-xs block">{age.displayText} • {formattedGender}</span>
        </div>
        <div className="sm:col-span-2">
          <span className="text-slate-600 font-bold uppercase text-[9px] block">ALERGIAS</span>
          <span className="font-extrabold text-rose-700 text-xs break-words block">
            {patient.allergies && patient.allergies.length > 0 ? patient.allergies.join(', ').toUpperCase() : 'NEGADAS'}
          </span>
        </div>
      </div>

      {/* 3. Signos Vitales y Somatometría (Contraste Nítido) */}
      <div className="vitals-box p-1.5 rounded-lg border border-slate-300 bg-slate-50/50 text-[10px] grid grid-cols-4 sm:grid-cols-8 gap-1.5 text-center">
        <div>
          <span className="text-slate-700 block font-semibold">T.A. (mmHg)</span>
          <strong className="text-slate-900 font-bold">
            {note.vitalSigns?.bpSystolic && note.vitalSigns?.bpDiastolic
              ? `${note.vitalSigns.bpSystolic}/${note.vitalSigns.bpDiastolic}`
              : '-'}
          </strong>
        </div>
        <div>
          <span className="text-slate-700 block font-semibold">F.C. (lpm)</span>
          <strong className="text-slate-900 font-bold">{note.vitalSigns?.heartRate || '-'}</strong>
        </div>
        <div>
          <span className="text-slate-700 block font-semibold">F.R. (rpm)</span>
          <strong className="text-slate-900 font-bold">{note.vitalSigns?.respiratoryRate || '-'}</strong>
        </div>
        <div>
          <span className="text-slate-700 block font-semibold">TEMP (°C)</span>
          <strong className="text-slate-900 font-bold">{note.vitalSigns?.temperature ? `${note.vitalSigns.temperature}°C` : '-'}</strong>
        </div>
        <div>
          <span className="text-slate-700 block font-semibold">PESO (kg)</span>
          <strong className="text-slate-900 font-bold">{note.vitalSigns?.weightKg ? `${note.vitalSigns.weightKg} kg` : '-'}</strong>
        </div>
        <div>
          <span className="text-slate-700 block font-semibold">TALLA (cm)</span>
          <strong className="text-slate-900 font-bold">{note.vitalSigns?.heightCm ? `${note.vitalSigns.heightCm} cm` : '-'}</strong>
        </div>
        <div>
          <span className="text-slate-700 block font-semibold">I.M.C.</span>
          <strong className="text-slate-900 font-bold">{bmiCalc ? bmiCalc.bmi : '-'}</strong>
        </div>
        <div>
          <span className="text-slate-700 block font-semibold">GLUCOSA</span>
          <strong className="text-slate-900 font-bold">{note.vitalSigns?.glucose ? `${note.vitalSigns.glucose} mg/dL` : '-'}</strong>
        </div>
      </div>

      {/* 4. Diagnósticos */}
      {note.diagnoses && note.diagnoses.length > 0 && (
        <div className="text-xs pb-1 border-b border-slate-300">
          <span className="font-bold uppercase text-slate-700 text-[10px] mr-1.5">DIAGNÓSTICO(S):</span>
          <span className="font-bold text-slate-900">
            {note.diagnoses.map((d) => `${d.description}${d.cie10Code ? ` (${d.cie10Code})` : ''}`).join(' • ')}
          </span>
        </div>
      )}

      {/* 5. Prescripción Farmacológica (Rx) - Nítida, oscura y multi-página */}
      <div className="space-y-2 pt-0.5">
        <div className="flex items-center justify-between border-b-2 border-slate-800 pb-1">
          <span className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1">
            <span className="italic font-serif text-sm font-bold text-blue-800">℞</span> PRESCRIPCIÓN MÉDICA:
          </span>
          {isLargePrint && (
            <span className="text-[10px] font-bold text-purple-950 bg-purple-100 border border-purple-300 px-2 py-0.2 rounded">
              FORMATO MACROTIPO (LETRA GRANDE)
            </span>
          )}
        </div>

        {note.plan?.prescriptions && note.plan.prescriptions.length > 0 ? (
          <div className="space-y-2">
            {note.plan.prescriptions.map((rx, idx) => (
              <div key={rx.id || idx} className="rx-item p-2.5 rounded-lg bg-slate-50/70 border border-slate-300 space-y-0.5 page-break-inside-avoid">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`font-bold text-slate-900 ${isLargePrint ? 'text-base' : 'text-xs sm:text-sm'}`}>
                    {idx + 1}. {rx.medication}
                  </span>
                  {rx.presentation && (
                    <span className={`text-slate-700 font-semibold ${isLargePrint ? 'text-xs' : 'text-[11px]'}`}>
                      ({rx.presentation})
                    </span>
                  )}
                  {rx.indicationFor && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded border border-emerald-300 bg-emerald-50 text-emerald-900">
                      Para: {rx.indicationFor}
                    </span>
                  )}
                </div>
                <p className={`text-slate-900 leading-snug ${isLargePrint ? 'text-sm font-bold' : 'text-xs font-medium'}`}>
                  👉 Tomar: <strong>{rx.dosage}</strong> cada <strong>{rx.frequency}</strong> por vía {rx.route.toLowerCase()} {rx.duration && `durante ${rx.duration}`}.
                </p>
                {rx.instructions && (
                  <p className={`text-slate-700 italic ${isLargePrint ? 'text-xs' : 'text-[11px]'}`}>
                    Indicación: {rx.instructions}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-600 italic">No se indicaron fármacos en esta consulta.</p>
        )}
      </div>

      {/* 6. Medidas no farmacológicas y Dietéticas */}
      {note.plan?.nonPharmacological && (
        <div className="text-xs pt-0.5 page-break-inside-avoid">
          <span className="font-bold uppercase text-slate-700 text-[10px] block">INDICACIONES GENERALES Y DIETA:</span>
          <p className="text-slate-900 whitespace-pre-wrap font-normal leading-relaxed">{note.plan.nonPharmacological}</p>
        </div>
      )}

      {/* 7. Signos de alarma */}
      {note.plan?.warningSigns && (
        <div className="p-2 border border-rose-300 bg-rose-50/60 rounded-lg text-xs page-break-inside-avoid">
          <span className="font-bold text-rose-950 text-[10px] flex items-center gap-1 block">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-700" /> SIGNOS DE ALARMA (ACUDIR A URGENCIAS SI PRESENTA):
          </span>
          <p className="text-rose-950 font-medium mt-0.5 leading-snug">{note.plan.warningSigns}</p>
        </div>
      )}

      {/* 8. Firmas Institucionales UABC */}
      <div className="signature-box pt-4 border-t border-slate-300 page-break-inside-avoid">
        <div className="flex justify-between items-end gap-6 text-[10px]">
          {isPasante ? (
            <>
              {/* Firma MPSS */}
              <div className="flex-1 text-center border-t-2 border-slate-800 pt-1.5 space-y-0.2">
                <p className="font-bold text-slate-900 text-xs sm:text-sm">
                  {note.attendingDoctorName || 'Dr. Sebastián Garduño Conde'}
                </p>
                <p className="text-[10px] text-slate-800 font-bold uppercase">
                  {note.attendingDoctorTitle || 'MÉDICO PASANTE DEL SERVICIO SOCIAL (MPSS)'}
                </p>
                <p className="text-[10px] text-slate-700 font-mono font-medium">
                  {note.attendingDoctorLicense || 'MATRÍCULA MPSS - UABC'}
                </p>
                <p className="text-[10px] text-slate-800 font-semibold">
                  UNIVERSIDAD AUTÓNOMA DE BAJA CALIFORNIA
                </p>
                <p className="text-[9px] text-slate-600 font-bold tracking-wider uppercase">MÉDICO TRATANTE</p>
              </div>

              {/* Firma Supervisor */}
              <div className="flex-1 text-center border-t-2 border-slate-800 pt-1.5 space-y-0.2">
                <p className="font-bold text-slate-900 text-xs sm:text-sm">
                  {note.supervisorDoctorName || 'Dr. Carlos Donato Dueñas Prieto'}
                </p>
                <p className="text-[10px] text-slate-800 font-bold uppercase">
                  {note.supervisorDoctorTitle || 'MÉDICO GENERAL'}
                </p>
                <p className="text-[10px] text-slate-700 font-mono font-bold">
                  {note.supervisorDoctorLicense || 'CÉD. PROF. 15504256'}
                </p>
                <p className="text-[10px] text-slate-800 font-semibold">
                  UNIVERSIDAD AUTÓNOMA DE BAJA CALIFORNIA
                </p>
                <p className="text-[9px] text-slate-600 font-bold tracking-wider uppercase">MÉDICO SUPERVISOR</p>
              </div>
            </>
          ) : (
            <>
              <div className="text-left text-xs text-slate-700 space-y-0.5">
                <p>Próxima cita de control: <strong className="text-slate-900 font-bold">{note.plan?.followUpDate || 'Según evolución clínica'}</strong></p>
                <p className="text-[10px] text-slate-500">Proyecto Celene Rosarito • Expediente Electrónico</p>
              </div>
              <div className="text-center w-72 border-t-2 border-slate-800 pt-1.5 space-y-0.2">
                <p className="font-bold text-slate-900 text-xs sm:text-sm">
                  {note.attendingDoctorName || 'Dr. Carlos Donato Dueñas Prieto'}
                </p>
                <p className="text-[10px] text-slate-800 font-bold uppercase">
                  {note.attendingDoctorTitle || 'MÉDICO GENERAL'}
                </p>
                <p className="text-[10px] text-slate-700 font-mono font-bold">
                  {note.attendingDoctorLicense || 'CÉD. PROF. 15504256'}
                </p>
                <p className="text-[10px] text-slate-800 font-semibold">
                  UNIVERSIDAD AUTÓNOMA DE BAJA CALIFORNIA
                </p>
                <p className="text-[9px] text-slate-600 font-bold tracking-wider uppercase">MÉDICO TRATANTE</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={viewMode === 'note' ? 'Resumen de Consulta (SOAP)' : 'Receta Médica Oficial'}
        description={`Expediente: ${patient.demographics.firstName} ${patient.demographics.lastName} (${patient.id}) • Consulta: ${new Date(note.date).toLocaleDateString('es-MX')}`}
        maxWidth="4xl"
      >
        <div className="space-y-5 text-left font-sans">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 no-print">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setViewMode('prescription')}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  viewMode === 'prescription'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Pill className="w-3.5 h-3.5" />
                Receta Médica
              </button>

              <button
                type="button"
                onClick={() => setViewMode('note')}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  viewMode === 'note'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Nota SOAP
              </button>

              {/* Formatos Especiales */}
              <button
                type="button"
                onClick={() => setIsScheduleOpen(true)}
                className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
                title="Imprimir horario visual horizontal en tamaño carta"
              >
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Horario Visual
              </button>

              <button
                type="button"
                onClick={() => setIsLabOrderOpen(true)}
                className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-900 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                title="Imprimir orden de laboratorio / gabinete"
              >
                <TestTubes className="w-3.5 h-3.5 text-indigo-600" />
                Orden Labs
              </button>

              <button
                type="button"
                onClick={() => setIsReceiptOpen(true)}
                className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                title="Imprimir recibo de aportación / donativo"
              >
                <ReceiptIcon className="w-3.5 h-3.5 text-emerald-600" />
                Recibo
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLargePrint(!isLargePrint)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  isLargePrint
                    ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                    : 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
                }`}
                title="Aumentar tamaño de letra para personas mayores"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isLargePrint ? '✓ Macrotipo' : 'Aa+ Letra Grande'}</span>
              </button>

              {onEditNote && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEditNote(note);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors cursor-pointer"
                  title="Editar los datos, diagnósticos o medicamentos de esta consulta"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Consulta</span>
                </button>
              )}

              <Button
                variant="primary"
                size="sm"
                leftIcon={<Printer className="w-4 h-4" />}
                onClick={handlePrint}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs font-bold"
              >
                Imprimir Receta
              </Button>
            </div>
          </div>

          {/* Modo 1: Visor en pantalla de la Nota SOAP */}
          {viewMode === 'note' && (
            <div className="space-y-5 text-left text-sm">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Tipo de Consulta</span>
                  <span className="font-bold text-slate-800">{note.noteType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Médico Tratante</span>
                  <span className="font-bold text-slate-800">{note.attendingDoctorName || 'No especificado'}</span>
                  <span className="text-xs text-slate-500 block">{note.attendingDoctorTitle} ({note.attendingDoctorLicense})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Archivo Local</span>
                  <span className="font-mono text-xs text-slate-600">{note.fileName}</span>
                </div>
              </div>

              {/* 1. Signos Vitales */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800 border-b border-slate-200 pb-1">
                  <HeartPulse className="w-4 h-4 text-rose-500" />
                  <span>1. Signos Vitales y Somatometría</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium block">Presión Arterial:</span>
                    <span className="font-bold text-slate-900">
                      {note.vitalSigns?.bpSystolic && note.vitalSigns?.bpDiastolic ? `${note.vitalSigns.bpSystolic}/${note.vitalSigns.bpDiastolic} mmHg` : 'No registrada'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">Frecuencia Cardíaca:</span>
                    <span className="font-bold text-slate-900">{note.vitalSigns?.heartRate ? `${note.vitalSigns.heartRate} lpm` : 'No registrada'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">Frecuencia Resp.:</span>
                    <span className="font-bold text-slate-900">{note.vitalSigns?.respiratoryRate ? `${note.vitalSigns.respiratoryRate} rpm` : 'No registrada'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">Temperatura:</span>
                    <span className="font-bold text-slate-900">{note.vitalSigns?.temperature ? `${note.vitalSigns.temperature} °C` : 'No registrada'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">Peso y Talla:</span>
                    <span className="font-bold text-slate-900">
                      {note.vitalSigns?.weightKg ? `${note.vitalSigns.weightKg} kg` : '-'} / {note.vitalSigns?.heightCm ? `${note.vitalSigns.heightCm} cm` : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">I.M.C.:</span>
                    <span className="font-bold text-slate-900">{bmiCalc ? bmiCalc.bmi : '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">Glucosa Capilar:</span>
                    <span className="font-bold text-slate-900">{note.vitalSigns?.glucose ? `${note.vitalSigns.glucose} mg/dL` : 'No registrada'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">Saturación SpO2:</span>
                    <span className="font-bold text-slate-900">{note.vitalSigns?.spO2 ? `${note.vitalSigns.spO2}%` : 'No registrada'}</span>
                  </div>
                </div>
              </div>

              {/* 2. Subjetivo */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800 border-b border-slate-200 pb-1">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>2. Subjetivo (Interrogatorio)</span>
                </div>
                <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  {note.subjective?.reasonForVisit && (
                    <div>
                      <strong className="text-slate-800 block">Motivo de Consulta:</strong>
                      <p className="text-slate-700 mt-0.5 whitespace-pre-wrap">{note.subjective.reasonForVisit}</p>
                    </div>
                  )}
                  {note.subjective?.currentIllness && (
                    <div>
                      <strong className="text-slate-800 block">Padecimiento Actual:</strong>
                      <p className="text-slate-700 mt-0.5 whitespace-pre-wrap">{note.subjective.currentIllness}</p>
                    </div>
                  )}
                  {note.subjective?.systemsReview && (
                    <div>
                      <strong className="text-slate-800 block">Aparatos y Sistemas:</strong>
                      <p className="text-slate-700 mt-0.5 whitespace-pre-wrap">{note.subjective.systemsReview}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Objetivo */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800 border-b border-slate-200 pb-1">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  <span>3. Objetivo (Exploración Física)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  {note.objective?.generalAppearance && (
                    <div>
                      <strong className="text-slate-800 block">Aspecto General:</strong>
                      <p className="text-slate-700 mt-0.5 whitespace-pre-wrap">{note.objective.generalAppearance}</p>
                    </div>
                  )}
                  {note.objective?.headAndNeck && (
                    <div>
                      <strong className="text-slate-800 block">Cabeza y Cuello:</strong>
                      <p className="text-slate-700 mt-0.5 whitespace-pre-wrap">{note.objective.headAndNeck}</p>
                    </div>
                  )}
                  {note.objective?.chestAndLungs && (
                    <div>
                      <strong className="text-slate-800 block">Tórax:</strong>
                      <p className="text-slate-700 mt-0.5 whitespace-pre-wrap">{note.objective.chestAndLungs}</p>
                    </div>
                  )}
                  {note.objective?.abdomen && (
                    <div>
                      <strong className="text-slate-800 block">Abdomen:</strong>
                      <p className="text-slate-700 mt-0.5 whitespace-pre-wrap">{note.objective.abdomen}</p>
                    </div>
                  )}
                  {note.objective?.extremities && (
                    <div>
                      <strong className="text-slate-800 block">Extremidades:</strong>
                      <p className="text-slate-700 mt-0.5 whitespace-pre-wrap">{note.objective.extremities}</p>
                    </div>
                  )}
                  {note.objective?.neurological && (
                    <div>
                      <strong className="text-slate-800 block">Neurológico:</strong>
                      <p className="text-slate-700 mt-0.5 whitespace-pre-wrap">{note.objective.neurological}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Diagnósticos */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800 border-b border-slate-200 pb-1">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                  <span>4. Diagnósticos ({note.diagnoses?.length || 0})</span>
                </div>
                <div className="space-y-1.5">
                  {note.diagnoses && note.diagnoses.length > 0 ? (
                    note.diagnoses.map((diag, i) => (
                      <div key={diag.id || i} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{diag.description}</span>
                          {diag.cie10Code && (
                            <Badge variant="default" size="sm" className="font-mono text-[10px]">
                              {diag.cie10Code}
                            </Badge>
                          )}
                        </div>
                        <Badge variant={diag.type === 'definitivo' ? 'success' : 'warning'} size="sm">
                          {diag.type}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">Sin diagnósticos registrados.</p>
                  )}
                </div>
              </div>

              {/* 5. Plan */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800 border-b border-slate-200 pb-1">
                  <Pill className="w-4 h-4 text-emerald-600" />
                  <span>5. Plan de Manejo y Prescripción</span>
                </div>
                <div className="space-y-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  {note.plan?.prescriptions && note.plan.prescriptions.length > 0 && (
                    <div className="space-y-1.5">
                      <strong className="text-slate-800 block">Prescripciones:</strong>
                      {note.plan.prescriptions.map((rx, idx) => (
                        <div key={rx.id || idx} className="p-2 rounded bg-white border border-slate-200">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{rx.medication}</span>
                            {rx.indicationFor && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                                Para: {rx.indicationFor}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 mt-0.5">Tomar {rx.dosage} cada {rx.frequency} por vía {rx.route}.</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {note.plan?.nonPharmacological && (
                    <div>
                      <strong className="text-slate-800 block">Medidas Generales:</strong>
                      <p className="text-slate-700 mt-0.5 whitespace-pre-wrap">{note.plan.nonPharmacological}</p>
                    </div>
                  )}

                  {note.plan?.warningSigns && (
                    <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-900">
                      <strong className="block flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Signos de Alarma:
                      </strong>
                      <p className="mt-0.5 whitespace-pre-wrap">{note.plan.warningSigns}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Modo 2: Visualización en pantalla de la Receta Médica */}
          {viewMode === 'prescription' && (
            <div>
              {renderPrescriptionContent()}
            </div>
          )}

          {/* Si está en modo SOAP, mantener oculto el contenedor de la receta en el DOM para que PrintService siempre lo encuentre */}
          {viewMode === 'note' && (
            <div className="hidden">
              {renderPrescriptionContent()}
            </div>
          )}
        </div>
      </Modal>

      {/* Modales Especializados */}
      {isScheduleOpen && (
        <MedicationSchedulePrint
          note={note}
          patient={patient}
          onClose={() => setIsScheduleOpen(false)}
        />
      )}

      {isLabOrderOpen && (
        <LabOrderPrintModal
          note={note}
          patient={patient}
          onClose={() => setIsLabOrderOpen(false)}
        />
      )}

      {isReceiptOpen && (
        <ServiceReceiptPrint
          note={note}
          patient={patient}
          onClose={() => setIsReceiptOpen(false)}
        />
      )}
    </>
  );
}
