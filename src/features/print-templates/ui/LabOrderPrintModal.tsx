import type { ClinicalNote, LabOrder } from '@/entities/clinical-note/model/schemas';
import type { Patient } from '@/entities/patient/model/schemas';
import { PatientService } from '@/entities/patient/api/patientService';
import { useAuth } from '@/app/providers/AuthContext';
import { PrintService } from '@/shared/lib/printService';
import { Button } from '@/shared/ui';
import { Printer, X, TestTubes, CheckCircle2, AlertCircle, MapPin } from 'lucide-react';

interface LabOrderPrintModalProps {
  note: ClinicalNote;
  patient: Patient;
  labOrder?: LabOrder;
  onClose: () => void;
}

export function LabOrderPrintModal({
  note,
  patient,
  labOrder,
  onClose,
}: LabOrderPrintModalProps) {
  const { clinicConfig, currentUser, supervisorDoctor } = useAuth();

  const activeLabOrder: LabOrder = labOrder || note.labOrder || {
    studies: [],
    otherStudies: '',
    fastingHours: 8,
    clinicalNotes: '',
    urgency: 'Ordinario',
  };

  const age = PatientService.calculateAge(patient.demographics.birthDate);
  const formattedGender =
    patient.demographics.gender === 'M'
      ? 'Masculino'
      : patient.demographics.gender === 'F'
      ? 'Femenino'
      : patient.demographics.gender || 'No especificado';

  const handlePrint = () => {
    PrintService.printElement('printable-lab-order-sheet', {
      title: `Orden de Laboratorio - ${patient.demographics.firstName} ${patient.demographics.lastName} (${patient.id})`,
    });
  };

  const isPasante =
    currentUser?.role === 'pasante' ||
    note.attendingDoctorRole === 'pasante' ||
    note.attendingDoctorTitle?.includes('PASANTE') ||
    note.attendingDoctorName?.toLowerCase().includes('sebastian') ||
    currentUser?.username?.toLowerCase().includes('sebastian');

  const attendingDoctorName =
    currentUser?.role === 'pasante'
      ? currentUser.fullName
      : (note.attendingDoctorName || 'Dr. Carlos Donato Dueñas Prieto');

  const attendingDoctorTitle =
    currentUser?.role === 'pasante'
      ? currentUser.title
      : (note.attendingDoctorTitle || 'MÉDICO GENERAL');

  const attendingDoctorLicense =
    currentUser?.role === 'pasante'
      ? currentUser.licenseNumber
      : (note.attendingDoctorLicense || 'CÉD. PROF. 15504256');

  const supervisorDoctorName =
    supervisorDoctor?.fullName || note.supervisorDoctorName || 'Dr. Carlos Donato Dueñas Prieto';

  const supervisorDoctorTitle =
    supervisorDoctor?.title || note.supervisorDoctorTitle || 'MÉDICO GENERAL';

  const supervisorDoctorLicense =
    supervisorDoctor?.licenseNumber || note.supervisorDoctorLicense || 'CÉD. PROF. 15504256';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh] text-left">
        {/* Action Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-700">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <TestTubes className="w-5 h-5 text-indigo-400" />
              Solicitud de Laboratorio y Estudios de Gabinete
            </h3>
            <p className="text-xs text-slate-300">
              Formato oficial optimizado para impresión en hoja tamaño carta.
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
              className="bg-indigo-600 hover:bg-indigo-500 shadow-md font-bold"
            >
              Imprimir Solicitud
            </Button>
          </div>
        </div>

        {/* Print Content Area (Un solo bloque limpio) */}
        <div className="p-6 sm:p-8 overflow-y-auto bg-slate-50">
          <div
            id="printable-lab-order-sheet"
            className="p-8 bg-white border border-slate-300 rounded-2xl shadow-xs font-sans text-slate-900 space-y-4"
          >
            {/* 1. Membrete Institucional */}
            <div className="flex items-start justify-between border-b-2 border-slate-800 pb-3">
              <div className="flex items-center gap-3.5">
                <div className="h-12 sm:h-14 max-w-[220px] shrink-0 flex items-center">
                  <img
                    src={clinicConfig?.logoUrl || 'https://i.ibb.co/k2LCbnsF/tcarta-volante.png'}
                    alt="Logo Fundación Celene"
                    className="h-full w-auto object-contain"
                  />
                </div>
                <div className="space-y-0.5">
                  <h1 className="text-sm font-black text-slate-900 tracking-tight uppercase">
                    {clinicConfig?.clinicName || 'PROYECTO CELENE ROSARITO'}
                  </h1>
                  <p className="text-[11px] font-bold text-slate-700 uppercase">
                    {clinicConfig?.foundationName || 'FUNDACIÓN PROYECTO CELENE'}
                  </p>
                  <p className="text-[10px] text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    {clinicConfig?.address || 'Gral. Guadalupe Victoria, Lienzo Charro, Playas de Rosarito'}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    Tel: {clinicConfig?.phone || '661 104 4050'} • {clinicConfig?.email || 'consultorio@proyectocelene.org'}
                  </p>
                </div>
              </div>

              <div className="text-right space-y-1 shrink-0">
                <div className="px-3 py-1 bg-indigo-900 text-white font-extrabold rounded text-center text-xs tracking-wider uppercase shadow-2xs">
                  ORDEN DE ESTUDIOS
                </div>
                <p className="text-xs font-semibold text-slate-800 pt-0.5">
                  Fecha: <strong className="text-slate-900">{new Date(note.date).toLocaleDateString('es-MX')}</strong>
                </p>
                <p className="text-xs font-mono text-slate-700">
                  Folio: <strong className="text-slate-900">{patient.id}</strong>
                </p>
              </div>
            </div>

            {/* 2. Ficha Única del Paciente */}
            <div className="p-2.5 rounded-xl border border-slate-300 bg-slate-50/80 text-xs grid grid-cols-1 sm:grid-cols-12 gap-2.5">
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
                <span className="text-slate-600 font-bold uppercase text-[9px] block">CARÁCTER</span>
                <span className="font-extrabold text-indigo-900 uppercase block">
                  {activeLabOrder.urgency}
                </span>
              </div>
            </div>

            {/* 3. Impresión Diagnóstica */}
            {note.diagnoses && note.diagnoses.length > 0 && (
              <div className="text-xs">
                <span className="font-extrabold uppercase tracking-wider text-slate-600 text-[10px] block mb-1">
                  IMPRESIÓN DIAGNÓSTICA / MOTIVO DEL ESTUDIO:
                </span>
                <div className="space-y-0.5">
                  {note.diagnoses.map((d, idx) => (
                    <p key={idx} className="text-slate-900 font-bold">
                      • {d.description} {d.cie10Code && <span className="font-mono text-slate-600 font-normal">({d.cie10Code})</span>}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Lista de Estudios Solicitados */}
            <div className="space-y-2.5">
              <span className="font-black text-xs uppercase tracking-wider text-slate-900 block border-b-2 border-slate-800 pb-1">
                ESTUDIOS DE LABORATORIO / GABINETE SOLICITADOS:
              </span>

              {activeLabOrder.studies.length === 0 && !activeLabOrder.otherStudies ? (
                <p className="text-xs text-slate-500 italic py-2">Sin estudios específicos marcados en la orden.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeLabOrder.studies.map((st, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-lg border border-slate-300 bg-slate-50 text-xs font-bold text-slate-900 page-break-inside-avoid"
                    >
                      <CheckCircle2 className="w-4 h-4 text-indigo-700 shrink-0" />
                      <span>{st}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeLabOrder.otherStudies && (
                <div className="p-3 rounded-lg border border-slate-300 bg-slate-50 text-xs mt-2 page-break-inside-avoid">
                  <strong className="text-slate-900 font-extrabold uppercase text-[10px] block mb-0.5">
                    Otros Estudios o Indicaciones Especiales:
                  </strong>
                  <p className="text-slate-900 whitespace-pre-wrap font-medium">{activeLabOrder.otherStudies}</p>
                </div>
              )}
            </div>

            {/* 5. Indicaciones de Ayuno */}
            <div className="p-3 rounded-xl border border-indigo-200 bg-indigo-50/60 text-xs space-y-1 page-break-inside-avoid">
              <div className="flex items-center gap-1.5 font-bold text-indigo-950 text-[11px]">
                <AlertCircle className="w-4 h-4 text-indigo-700 shrink-0" />
                <span className="uppercase font-extrabold">INDICACIONES AL PACIENTE PARA LA TOMA DE MUESTRA:</span>
              </div>
              <p className="text-indigo-950 font-medium">
                • Presentarse en el laboratorio con un ayuno mínimo de <strong>{activeLabOrder.fastingHours || 8} horas</strong> (solo puede beber agua natural).
              </p>
              {activeLabOrder.clinicalNotes && (
                <p className="text-indigo-900">
                  • <strong>Observaciones clínicas:</strong> {activeLabOrder.clinicalNotes}
                </p>
              )}
            </div>

            {/* 6. Firmas Institucionales UABC */}
            <div className="pt-6 border-t border-slate-200 page-break-inside-avoid">
              {isPasante ? (
                <div className="grid grid-cols-2 gap-8 text-center text-xs">
                  {/* Médico Tratante Pasante */}
                  <div className="border-t-2 border-slate-800 pt-2 space-y-0.5">
                    <p className="font-black text-slate-900 text-xs">
                      {attendingDoctorName}
                    </p>
                    <p className="text-[10px] text-slate-700 font-bold uppercase">
                      {attendingDoctorTitle}
                    </p>
                    <p className="text-[10px] text-slate-600 font-mono">
                      {attendingDoctorLicense}
                    </p>
                    <p className="text-[10px] text-slate-700 font-semibold">
                      UNIVERSIDAD AUTÓNOMA DE BAJA CALIFORNIA
                    </p>
                    <p className="text-[9px] text-slate-500 font-extrabold tracking-wider uppercase">MÉDICO SOLICITANTE</p>
                  </div>

                  {/* Médico Supervisor */}
                  <div className="border-t-2 border-slate-800 pt-2 space-y-0.5">
                    <p className="font-black text-slate-900 text-xs">
                      {supervisorDoctorName}
                    </p>
                    <p className="text-[10px] text-slate-700 font-bold uppercase">
                      {supervisorDoctorTitle}
                    </p>
                    <p className="text-[10px] text-slate-600 font-mono font-bold">
                      {supervisorDoctorLicense}
                    </p>
                    <p className="text-[10px] text-slate-700 font-semibold">
                      UNIVERSIDAD AUTÓNOMA DE BAJA CALIFORNIA
                    </p>
                    <p className="text-[9px] text-slate-500 font-extrabold tracking-wider uppercase">MÉDICO SUPERVISOR</p>
                  </div>
                </div>
              ) : (
                <div className="max-w-xs mx-auto text-center text-xs border-t-2 border-slate-800 pt-2 space-y-0.5">
                  <p className="font-black text-slate-900 text-xs">
                    {attendingDoctorName}
                  </p>
                  <p className="text-[10px] text-slate-700 font-bold uppercase">
                    {attendingDoctorTitle}
                  </p>
                  <p className="text-[10px] text-slate-600 font-mono font-bold">
                    {attendingDoctorLicense}
                  </p>
                  <p className="text-[10px] text-slate-700 font-semibold">
                    UNIVERSIDAD AUTÓNOMA DE BAJA CALIFORNIA
                  </p>
                  <p className="text-[9px] text-slate-500 font-extrabold tracking-wider uppercase">MÉDICO SOLICITANTE</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
