import type { ClinicalNote, PrescriptionItem } from '@/entities/clinical-note/model/schemas';
import type { Patient } from '@/entities/patient/model/schemas';
import { PatientService } from '@/entities/patient/api/patientService';
import { useAuth } from '@/app/providers/AuthContext';
import { PrintService } from '@/shared/lib/printService';
import { DateTimeService } from '@/shared/lib/dateTimeService';
import { Button } from '@/shared/ui';
import { Printer, X, Sun, CloudSun, Moon, AlertTriangle, Pill, MapPin } from 'lucide-react';

interface MedicationSchedulePrintProps {
  note: ClinicalNote;
  patient: Patient;
  onClose: () => void;
}

export function MedicationSchedulePrint({
  note,
  patient,
  onClose,
}: MedicationSchedulePrintProps) {
  const { clinicConfig, currentUser } = useAuth();
  const prescriptions = note.plan?.prescriptions || [];

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
      : (note.attendingDoctorName || 'Dr. Carlos Donato Dueñas Prieto');

  const attendingDoctorLicense =
    currentUser?.role === 'pasante'
      ? currentUser.licenseNumber
      : (note.attendingDoctorLicense || 'CÉD. PROF. 15504256');

  // Categorizar medicamentos en los bloques de horario según posología
  const categorizeMedication = (item: PrescriptionItem) => {
    const freq = (item.frequency || '').toLowerCase();
    const inst = (item.instructions || '').toLowerCase();
    const combined = `${freq} ${inst}`;

    const blocks = {
      morning: false,
      afternoon: false,
      night: false,
      prn: false,
    };

    if (
      combined.includes('razón') ||
      combined.includes('prn') ||
      combined.includes('dolor') ||
      combined.includes('fiebre') ||
      combined.includes('si hay') ||
      combined.includes('necesario') ||
      combined.includes('sos')
    ) {
      blocks.prn = true;
    }

    if (
      combined.includes('24') ||
      combined.includes('día') ||
      combined.includes('manana') ||
      combined.includes('mañana') ||
      combined.includes('ayuno') ||
      combined.includes('desayuno')
    ) {
      blocks.morning = true;
    }

    if (combined.includes('12') || combined.includes('cada 12')) {
      blocks.morning = true;
      blocks.night = true;
    }

    if (combined.includes('8') || combined.includes('cada 8')) {
      blocks.morning = true;
      blocks.afternoon = true;
      blocks.night = true;
    }

    if (combined.includes('6') || combined.includes('cada 6')) {
      blocks.morning = true;
      blocks.afternoon = true;
      blocks.night = true;
    }

    if (combined.includes('noche') || combined.includes('cena') || combined.includes('dormir')) {
      blocks.night = true;
    }

    if (combined.includes('comida') || combined.includes('tarde')) {
      blocks.afternoon = true;
    }

    if (!blocks.morning && !blocks.afternoon && !blocks.night && !blocks.prn) {
      blocks.morning = true;
    }

    return blocks;
  };

  const handlePrint = () => {
    PrintService.printElement('printable-schedule-sheet', {
      landscape: true,
      title: `Horario Visual - ${patient.demographics.firstName} ${patient.demographics.lastName} (${patient.id})`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[95vh] text-left">
        {/* Action Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-700">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <Pill className="w-5 h-5 text-amber-400" />
              Horario Visual de Medicamentos (Formato Horizontal Grande)
            </h3>
            <p className="text-xs text-slate-300">
              Optimizado para comprensión inmediata del paciente con iconos de horarios.
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
              Imprimir Horario
            </Button>
          </div>
        </div>

        {/* Print Content Area */}
        <div className="p-6 sm:p-8 overflow-y-auto bg-slate-50">
          <div
            id="printable-schedule-sheet"
            className="p-6 sm:p-8 bg-white border border-slate-300 rounded-2xl shadow-xs font-sans text-slate-900 space-y-3"
          >
            {/* 1. Encabezado Oficial de 3 Columnas */}
            <div className="grid grid-cols-12 items-center gap-2 border-b-2 border-slate-900 pb-2.5">
              {/* Izquierda: Logo sin recuadros */}
              <div className="col-span-3 flex items-center justify-start">
                <img
                  src={clinicConfig?.logoUrl || 'https://i.ibb.co/k2LCbnsF/tcarta-volante.png'}
                  alt="Logo Consultorio Comunitario Proyecto Celene"
                  className="h-10 sm:h-12 w-auto max-w-full object-contain"
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

              {/* Derecha: Badge de Horario Visual, Fecha y Folio alineados a la derecha */}
              <div className="col-span-3 flex flex-col items-end justify-center text-right space-y-1">
                <span className="px-2 py-0.5 border-2 border-slate-900 text-slate-900 font-extrabold rounded-md text-[9.5px] uppercase tracking-wider">
                  HORARIO VISUAL
                </span>
                <p className="text-[10px] text-slate-700">
                  Fecha: <strong className="text-slate-900 font-bold">{DateTimeService.formatDate(note.date)}</strong>
                </p>
                <p className="text-[10px] text-slate-600 font-mono">
                  Folio: <strong className="text-slate-900 font-bold">{patient.id}</strong>
                </p>
              </div>
            </div>

            {/* Patient Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2 rounded-xl bg-slate-50 border border-slate-300 text-xs">
              <div className="sm:col-span-5">
                <span className="text-slate-500 font-bold uppercase text-[9px] block">PACIENTE</span>
                <strong className="text-slate-900 text-xs sm:text-sm font-bold uppercase block">
                  {patient.demographics.firstName} {patient.demographics.lastName}
                </strong>
              </div>
              <div className="sm:col-span-3">
                <span className="text-slate-500 font-bold uppercase text-[9px] block">EDAD / SEXO</span>
                <span className="text-slate-900 font-bold text-xs block">{age.displayText} • {formattedGender}</span>
              </div>
              <div className="sm:col-span-4 text-right">
                <span className="text-slate-500 font-bold uppercase text-[9px] block">FECHA DE CONSULTA</span>
                <strong className="text-slate-900 font-bold text-xs block">{DateTimeService.formatDate(note.date)}</strong>
              </div>
            </div>

            {/* Schedule 4-Column Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
              {/* 1. Mañana / Desayuno */}
              <div className="border-2 border-amber-300 rounded-xl overflow-hidden bg-amber-50/30 flex flex-col">
                <div className="p-2 bg-amber-200/80 text-amber-950 font-bold text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Sun className="w-4 h-4 text-amber-600" />
                    MAÑANA (Desayuno)
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-white/80 px-1.5 py-0.5 rounded">
                    08:00 hrs
                  </span>
                </div>
                <div className="p-2 space-y-2 flex-1">
                  {prescriptions
                    .filter((rx) => categorizeMedication(rx).morning)
                    .map((rx, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-white border border-amber-200 text-xs space-y-1 shadow-2xs">
                        <p className="font-bold text-slate-900 text-xs leading-tight">{rx.medication}</p>
                        <p className="text-slate-700 font-medium text-[11px]">👉 Tomar: <strong>{rx.dosage}</strong></p>
                        {rx.instructions && (
                          <p className="text-slate-500 italic text-[10px] leading-snug">{rx.instructions}</p>
                        )}
                        {rx.duration && (
                          <span className="inline-block text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold">
                            Por: {rx.duration}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* 2. Tarde / Comida */}
              <div className="border-2 border-orange-300 rounded-xl overflow-hidden bg-orange-50/30 flex flex-col">
                <div className="p-2 bg-orange-200/80 text-orange-950 font-bold text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <CloudSun className="w-4 h-4 text-orange-600" />
                    TARDE (Comida)
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-white/80 px-1.5 py-0.5 rounded">
                    14:00 - 16:00
                  </span>
                </div>
                <div className="p-2 space-y-2 flex-1">
                  {prescriptions
                    .filter((rx) => categorizeMedication(rx).afternoon)
                    .map((rx, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-white border border-orange-200 text-xs space-y-1 shadow-2xs">
                        <p className="font-bold text-slate-900 text-xs leading-tight">{rx.medication}</p>
                        <p className="text-slate-700 font-medium text-[11px]">👉 Tomar: <strong>{rx.dosage}</strong></p>
                        {rx.instructions && (
                          <p className="text-slate-500 italic text-[10px] leading-snug">{rx.instructions}</p>
                        )}
                        {rx.duration && (
                          <span className="inline-block text-[9px] px-1.5 py-0.2 rounded bg-orange-100 text-orange-900 font-bold">
                            Por: {rx.duration}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* 3. Noche / Cena */}
              <div className="border-2 border-indigo-300 rounded-xl overflow-hidden bg-indigo-50/30 flex flex-col">
                <div className="p-2 bg-indigo-200/80 text-indigo-950 font-bold text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Moon className="w-4 h-4 text-indigo-600" />
                    NOCHE (Cena / Dormir)
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-white/80 px-1.5 py-0.5 rounded">
                    20:00 - 22:00
                  </span>
                </div>
                <div className="p-2 space-y-2 flex-1">
                  {prescriptions
                    .filter((rx) => categorizeMedication(rx).night)
                    .map((rx, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-white border border-indigo-200 text-xs space-y-1 shadow-2xs">
                        <p className="font-bold text-slate-900 text-xs leading-tight">{rx.medication}</p>
                        <p className="text-slate-700 font-medium text-[11px]">👉 Tomar: <strong>{rx.dosage}</strong></p>
                        {rx.instructions && (
                          <p className="text-slate-500 italic text-[10px] leading-snug">{rx.instructions}</p>
                        )}
                        {rx.duration && (
                          <span className="inline-block text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-900 font-bold">
                            Por: {rx.duration}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* 4. En caso de dolor / Solo si es necesario */}
              <div className="border-2 border-rose-300 rounded-xl overflow-hidden bg-rose-50/30 flex flex-col">
                <div className="p-2 bg-rose-200/80 text-rose-950 font-bold text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    SOLO SI ES NECESARIO (SOS)
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-white/80 px-1.5 py-0.5 rounded">
                    Dolor / Fiebre
                  </span>
                </div>
                <div className="p-2 space-y-2 flex-1">
                  {prescriptions
                    .filter((rx) => categorizeMedication(rx).prn)
                    .map((rx, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-white border border-rose-200 text-xs space-y-1 shadow-2xs">
                        <p className="font-bold text-slate-900 text-xs leading-tight">{rx.medication}</p>
                        <p className="text-slate-700 font-medium text-[11px]">👉 Tomar: <strong>{rx.dosage}</strong></p>
                        <p className="text-rose-800 font-bold text-[10px]">Frecuencia: {rx.frequency}</p>
                        {rx.instructions && (
                          <p className="text-slate-500 italic text-[10px] leading-snug">{rx.instructions}</p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Footer with doctor attribution */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-300 text-[10px] text-slate-600">
              <p>Proyecto Celene Rosarito • Formato de apoyo al apego terapéutico</p>
              <p className="font-bold text-slate-800">Médico: {attendingDoctorName} ({attendingDoctorLicense})</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
