import type { ClinicalNote } from '@/entities/clinical-note/model/schemas';
import type { Patient } from '@/entities/patient/model/schemas';
import { PatientService } from '@/entities/patient/api/patientService';
import { useAuth } from '@/app/providers/AuthContext';
import { PrintService } from '@/shared/lib/printService';
import { DateTimeService } from '@/shared/lib/dateTimeService';
import { Button } from '@/shared/ui';
import { Printer, X, FileText, ShieldAlert, Calendar, MapPin } from 'lucide-react';

interface GeneralPlanPrintModalProps {
  note: ClinicalNote;
  patient: Patient;
  onClose: () => void;
}

export function GeneralPlanPrintModal({ note, patient, onClose }: GeneralPlanPrintModalProps) {
  const { clinicConfig, currentUser, supervisorDoctor } = useAuth();

  const age = PatientService.calculateAge(patient.demographics.birthDate);
  const formattedGender =
    patient.demographics.gender === 'M'
      ? 'Masculino'
      : patient.demographics.gender === 'F'
      ? 'Femenino'
      : patient.demographics.gender || 'No especificado';

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

  const handlePrint = () => {
    PrintService.printElement('printable-general-plan-sheet', {
      title: `Plan Terapéutico e Indicaciones - ${patient.demographics.firstName} ${patient.demographics.lastName}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh] text-left">
        {/* Action Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-700">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Hoja de Indicaciones Terapéuticas y Plan de Cuidados
            </h3>
            <p className="text-xs text-slate-300">
              Formato independiente para instrucciones al paciente, dieta, signos de alarma o referencia.
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
              className="bg-blue-600 hover:bg-blue-500 shadow-md font-bold"
            >
              Imprimir Plan
            </Button>
          </div>
        </div>

        {/* Printable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto bg-slate-50">
          <div
            id="printable-general-plan-sheet"
            className="p-8 bg-white border border-slate-300 rounded-2xl shadow-xs font-sans text-slate-900 space-y-4 text-xs"
          >
            {/* 1. Encabezado Oficial de 3 Columnas */}
            <div className="grid grid-cols-12 items-center gap-2 border-b-2 border-slate-900 pb-3">
              {/* Izquierda: Logo sin recuadros */}
              <div className="col-span-3 flex items-center justify-start">
                <img
                  src={clinicConfig?.logoUrl || 'https://i.ibb.co/k2LCbnsF/tcarta-volante.png'}
                  alt="Logo Consultorio Comunitario Proyecto Celene"
                  className="h-12 sm:h-14 w-auto max-w-full object-contain"
                />
              </div>

              {/* Centro: Proyecto Celene Rosarito, Fundación, Dirección, Tel y Web (CENTRADO) */}
              <div className="col-span-6 text-center space-y-0.5">
                <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight">
                  {clinicConfig?.clinicName || 'PROYECTO CELENE ROSARITO'}
                </h2>
                <p className="text-[10px] font-bold text-slate-800 uppercase">
                  {clinicConfig?.foundationName || 'FUNDACIÓN PROYECTO CELENE'}
                </p>
                <p className="text-[8.5px] text-slate-600 flex items-center justify-center gap-1 font-medium">
                  <MapPin className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                  {clinicConfig?.address || 'Gral. Guadalupe Victoria, Lienzo Charro, Playas de Rosarito'}
                </p>
                <p className="text-[8.5px] text-slate-600">
                  Tel: {clinicConfig?.phone || '661 104 4050'} • consultorio@proyectocelene.org • proyectocelene.org
                </p>
              </div>

              {/* Derecha: Badge de Indicaciones / Plan, Fecha y Folio alineados a la derecha */}
              <div className="col-span-3 flex flex-col items-end justify-center text-right space-y-1">
                <span className="px-2 py-0.5 border-2 border-slate-900 text-slate-900 font-extrabold rounded-md text-[9.5px] uppercase tracking-wider">
                  INDICACIONES Y PLAN
                </span>
                <p className="text-[10px] text-slate-700">
                  Fecha: <strong className="text-slate-900 font-bold">{DateTimeService.formatDate(note.date)}</strong>
                </p>
                <p className="text-[10px] text-slate-600 font-mono">
                  Folio: <strong className="text-slate-900 font-bold">{patient.id}</strong>
                </p>
              </div>
            </div>

            {/* 2. Ficha del Paciente */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-2.5 rounded-lg border border-slate-300 bg-slate-50 text-xs">
              <div className="sm:col-span-6">
                <span className="text-slate-600 font-bold uppercase text-[9px] block">PACIENTE</span>
                <strong className="text-slate-900 text-xs font-bold uppercase block">
                  {patient.demographics.firstName} {patient.demographics.lastName}
                </strong>
              </div>
              <div className="sm:col-span-3">
                <span className="text-slate-600 font-bold uppercase text-[9px] block">EDAD / SEXO</span>
                <span className="text-slate-900 font-semibold text-xs block">{age.displayText} • {formattedGender}</span>
              </div>
              <div className="sm:col-span-3 text-right">
                <span className="text-slate-600 font-bold uppercase text-[9px] block">FECHA DE EMISIÓN</span>
                <strong className="text-slate-900 font-bold text-xs block">{DateTimeService.formatDate(note.date)}</strong>
              </div>
            </div>

            {/* 3. Diagnósticos */}
            {note.diagnoses && note.diagnoses.length > 0 && (
              <div className="p-2.5 rounded-lg border border-blue-200 bg-blue-50/50">
                <span className="font-bold text-blue-950 uppercase text-[10px] block">DIAGNÓSTICO(S) DE ATENCIÓN:</span>
                <p className="font-bold text-slate-900 text-xs mt-0.5">
                  {note.diagnoses.map((d) => `${d.description}${d.cie10Code ? ` (${d.cie10Code})` : ''}`).join(' • ')}
                </p>
              </div>
            )}

            {/* 4. Plan Terapéutico General e Instrucciones */}
            <div className="space-y-1.5 pt-1">
              <span className="font-bold text-slate-900 uppercase text-[11px] block border-b border-slate-300 pb-1">
                1. RECOMENDACIONES MÉDICAS Y PLAN GENERAL:
              </span>
              <div className="p-3 rounded-xl border border-slate-200 bg-white text-slate-900 leading-relaxed whitespace-pre-wrap">
                {note.plan?.generalPlan || 'Continuar con las medidas generales indicadas en consulta y apego al estilo de vida saludable.'}
              </div>
            </div>

            {/* 5. Medidas Higiénico-Dietéticas */}
            {note.plan?.nonPharmacological && (
              <div className="space-y-1.5 pt-1">
                <span className="font-bold text-slate-900 uppercase text-[11px] block border-b border-slate-300 pb-1">
                  2. MEDIDAS HIGIÉNICO-DIETÉTICAS Y CUIDADOS GENERALES:
                </span>
                <div className="p-3 rounded-xl border border-slate-200 bg-white text-slate-900 leading-relaxed whitespace-pre-wrap">
                  {note.plan.nonPharmacological}
                </div>
              </div>
            )}

            {/* 6. Signos de Alarma */}
            {note.plan?.warningSigns && (
              <div className="p-3 rounded-xl border-2 border-rose-300 bg-rose-50/70 text-xs space-y-1 page-break-inside-avoid">
                <span className="font-black text-rose-950 uppercase text-[10px] flex items-center gap-1.5 block">
                  <ShieldAlert className="w-4 h-4 text-rose-700" /> SIGNOS DE ALARMA (ACUDIR A URGENCIAS SI PRESENTA):
                </span>
                <p className="font-bold text-rose-950 text-xs leading-snug whitespace-pre-wrap">
                  {note.plan.warningSigns}
                </p>
              </div>
            )}

            {/* 7. Próxima Cita */}
            {note.plan?.followUpDate && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-950 text-xs">
                <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  Próxima Cita de Control y Seguimiento: <strong>{note.plan.followUpDate}</strong>
                </span>
              </div>
            )}

            {/* 8. Firmas Institucionales */}
            <div className="signature-box pt-8 border-t border-slate-300 page-break-inside-avoid">
              <div className="flex justify-between items-end gap-6 text-[10px]">
                {isPasante ? (
                  <>
                    <div className="flex-1 text-center border-t-2 border-slate-800 pt-2 space-y-0.5">
                      <p className="font-bold text-slate-900 text-xs sm:text-sm">{attendingDoctorName}</p>
                      <p className="text-[10px] text-slate-800 font-bold uppercase">{attendingDoctorTitle}</p>
                      <p className="text-[10px] text-slate-700 font-mono font-bold">{attendingDoctorLicense}</p>
                      <p className="text-[9px] text-slate-600 font-bold uppercase">MÉDICO TRATANTE</p>
                    </div>

                    <div className="flex-1 text-center border-t-2 border-slate-800 pt-2 space-y-0.5">
                      <p className="font-bold text-slate-900 text-xs sm:text-sm">{supervisorDoctorName}</p>
                      <p className="text-[10px] text-slate-800 font-bold uppercase">{supervisorDoctorTitle}</p>
                      <p className="text-[10px] text-slate-700 font-mono font-bold">{supervisorDoctorLicense}</p>
                      <p className="text-[9px] text-slate-600 font-bold uppercase">MÉDICO SUPERVISOR</p>
                    </div>
                  </>
                ) : (
                  <div className="mx-auto text-center w-72 border-t-2 border-slate-800 pt-2 space-y-0.5">
                    <p className="font-bold text-slate-900 text-xs sm:text-sm">{attendingDoctorName}</p>
                    <p className="text-[10px] text-slate-800 font-bold uppercase">{attendingDoctorTitle}</p>
                    <p className="text-[10px] text-slate-700 font-mono font-bold">{attendingDoctorLicense}</p>
                    <p className="text-[9px] text-slate-600 font-bold uppercase">MÉDICO TRATANTE</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
