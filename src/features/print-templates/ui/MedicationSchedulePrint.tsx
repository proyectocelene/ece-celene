import type { ClinicalNote, PrescriptionItem } from '@/entities/clinical-note/model/schemas';
import type { Patient } from '@/entities/patient/model/schemas';
import { PatientService } from '@/entities/patient/api/patientService';
import { useAuth } from '@/app/providers/AuthContext';
import { PrintService } from '@/shared/lib/printService';
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
  const { clinicConfig } = useAuth();
  const prescriptions = note.plan?.prescriptions || [];

  const age = PatientService.calculateAge(patient.demographics.birthDate);
  const formattedGender =
    patient.demographics.gender === 'M'
      ? 'Masculino'
      : patient.demographics.gender === 'F'
      ? 'Femenino'
      : patient.demographics.gender || 'No especificado';

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
      combined.includes('necesario')
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
            {/* Header Banner con Logo 640x153 */}
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-2.5">
              <div className="flex items-center gap-3.5">
                <div className="h-12 max-w-[210px] shrink-0 flex items-center">
                  <img
                    src={clinicConfig?.logoUrl || 'https://i.ibb.co/k2LCbnsF/tcarta-volante.png'}
                    alt="Logo Clínica"
                    className="h-full w-auto object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                    {clinicConfig?.clinicName || 'PROYECTO CELENE ROSARITO'}
                  </h1>
                  <p className="text-[11px] font-bold text-slate-700 uppercase">
                    {clinicConfig?.foundationName || 'FUNDACIÓN PROYECTO CELENE'}
                  </p>
                  <p className="text-[10px] text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    {clinicConfig?.address || 'Gral. Guadalupe Victoria, Lienzo Charro, Playas de Rosarito'} • Tel: {clinicConfig?.phone || '661 104 4050'}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-block px-3 py-1 bg-amber-600 text-white rounded text-xs font-black uppercase tracking-wider shadow-2xs">
                  GUÍA VISUAL DE TOMA DE MEDICAMENTOS
                </span>
                <p className="text-xs text-slate-700 mt-1 font-semibold">
                  Fecha: <strong className="text-slate-900">{new Date(note.date).toLocaleDateString('es-MX')}</strong>
                </p>
              </div>
            </div>

            {/* Patient Card Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-2 bg-slate-50/80 rounded-xl border border-slate-300 text-xs">
              <div className="sm:col-span-5">
                <span className="text-slate-600 font-bold uppercase text-[9px] block">PACIENTE</span>
                <strong className="text-xs sm:text-sm text-slate-900 font-bold uppercase break-words leading-tight block">
                  {patient.demographics.firstName} {patient.demographics.lastName}
                </strong>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-600 font-bold uppercase text-[9px] block">FECHA NACIMIENTO</span>
                <span className="font-bold text-slate-900 text-xs block">{patient.demographics.birthDate || 'No registrada'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-600 font-bold uppercase text-[9px] block">EDAD / SEXO</span>
                <span className="font-bold text-slate-900 text-xs block">{age.displayText} • {formattedGender}</span>
              </div>
              <div className="sm:col-span-3">
                <span className="text-slate-600 font-bold uppercase text-[9px] block">MÉDICO TRATANTE</span>
                <span className="font-bold text-slate-900 text-xs break-words block">
                  {note.attendingDoctorName || 'Dr. Carlos Donato Dueñas Prieto'}
                </span>
              </div>
            </div>

            {/* Horizontal Schedule 4 Columns with Vibrant Clear Visual Themes */}
            <div className="grid grid-cols-4 gap-2.5">
              {/* Column 1: Morning (☀️ Amber) */}
              <div className="border border-amber-300 rounded-xl overflow-hidden bg-white flex flex-col page-break-inside-avoid shadow-xs">
                <div className="bg-amber-500 text-white p-2 flex items-center justify-center gap-1.5 font-black text-xs uppercase tracking-wide">
                  <Sun className="w-4 h-4 text-amber-100" />
                  <span>MAÑANA (☀️ 6 - 9 AM)</span>
                </div>
                <div className="p-2 space-y-2 flex-1 bg-amber-50/30">
                  {prescriptions.filter((p) => categorizeMedication(p).morning).length === 0 ? (
                    <p className="text-xs text-slate-400 text-center italic py-4">Sin medicamentos matutinos</p>
                  ) : (
                    prescriptions
                      .filter((p) => categorizeMedication(p).morning)
                      .map((item) => (
                        <div key={item.id} className="p-2 rounded-lg bg-white border border-amber-200 space-y-0.5 shadow-2xs">
                          <div className="flex items-start justify-between gap-1">
                            <strong className="text-xs font-black text-slate-900">{item.medication}</strong>
                            {item.presentation && <span className="text-[10px] text-slate-600 font-semibold">({item.presentation})</span>}
                          </div>
                          <p className="text-xs text-amber-950 font-extrabold">
                            👉 Tomar: {item.dosage || 'Dosis indicada'}
                          </p>
                          {item.indicationFor && (
                            <p className="text-[10px] text-slate-700 font-bold">Para: {item.indicationFor}</p>
                          )}
                          {item.instructions && (
                            <p className="text-[10px] text-slate-600 italic">{item.instructions}</p>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Column 2: Afternoon (🌤️ Sky/Blue) */}
              <div className="border border-sky-300 rounded-xl overflow-hidden bg-white flex flex-col page-break-inside-avoid shadow-xs">
                <div className="bg-sky-600 text-white p-2 flex items-center justify-center gap-1.5 font-black text-xs uppercase tracking-wide">
                  <CloudSun className="w-4 h-4 text-sky-100" />
                  <span>TARDE (🌤️ 1 - 3 PM)</span>
                </div>
                <div className="p-2 space-y-2 flex-1 bg-sky-50/30">
                  {prescriptions.filter((p) => categorizeMedication(p).afternoon).length === 0 ? (
                    <p className="text-xs text-slate-400 text-center italic py-4">Sin medicamentos de tarde</p>
                  ) : (
                    prescriptions
                      .filter((p) => categorizeMedication(p).afternoon)
                      .map((item) => (
                        <div key={item.id} className="p-2 rounded-lg bg-white border border-sky-200 space-y-0.5 shadow-2xs">
                          <div className="flex items-start justify-between gap-1">
                            <strong className="text-xs font-black text-slate-900">{item.medication}</strong>
                            {item.presentation && <span className="text-[10px] text-slate-600 font-semibold">({item.presentation})</span>}
                          </div>
                          <p className="text-xs text-sky-950 font-extrabold">
                            👉 Tomar: {item.dosage || 'Dosis indicada'}
                          </p>
                          {item.indicationFor && (
                            <p className="text-[10px] text-slate-700 font-bold">Para: {item.indicationFor}</p>
                          )}
                          {item.instructions && (
                            <p className="text-[10px] text-slate-600 italic">{item.instructions}</p>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Column 3: Night (🌙 Indigo/Purple) */}
              <div className="border border-indigo-300 rounded-xl overflow-hidden bg-white flex flex-col page-break-inside-avoid shadow-xs">
                <div className="bg-indigo-600 text-white p-2 flex items-center justify-center gap-1.5 font-black text-xs uppercase tracking-wide">
                  <Moon className="w-4 h-4 text-indigo-100" />
                  <span>NOCHE (🌙 8 - 10 PM)</span>
                </div>
                <div className="p-2 space-y-2 flex-1 bg-indigo-50/30">
                  {prescriptions.filter((p) => categorizeMedication(p).night).length === 0 ? (
                    <p className="text-xs text-slate-400 text-center italic py-4">Sin medicamentos nocturnos</p>
                  ) : (
                    prescriptions
                      .filter((p) => categorizeMedication(p).night)
                      .map((item) => (
                        <div key={item.id} className="p-2 rounded-lg bg-white border border-indigo-200 space-y-0.5 shadow-2xs">
                          <div className="flex items-start justify-between gap-1">
                            <strong className="text-xs font-black text-slate-900">{item.medication}</strong>
                            {item.presentation && <span className="text-[10px] text-slate-600 font-semibold">({item.presentation})</span>}
                          </div>
                          <p className="text-xs text-indigo-950 font-extrabold">
                            👉 Tomar: {item.dosage || 'Dosis indicada'}
                          </p>
                          {item.indicationFor && (
                            <p className="text-[10px] text-slate-700 font-bold">Para: {item.indicationFor}</p>
                          )}
                          {item.instructions && (
                            <p className="text-[10px] text-slate-600 italic">{item.instructions}</p>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Column 4: PRN (⚠️ Rose/Red) */}
              <div className="border border-rose-300 rounded-xl overflow-hidden bg-white flex flex-col page-break-inside-avoid shadow-xs">
                <div className="bg-rose-600 text-white p-2 flex items-center justify-center gap-1.5 font-black text-xs uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4 text-rose-100" />
                  <span>SI HAY SÍNTOMAS (⚠️ PRN)</span>
                </div>
                <div className="p-2 space-y-2 flex-1 bg-rose-50/30">
                  {prescriptions.filter((p) => categorizeMedication(p).prn).length === 0 ? (
                    <p className="text-xs text-slate-400 text-center italic py-4">Sin medicamentos condicionales</p>
                  ) : (
                    prescriptions
                      .filter((p) => categorizeMedication(p).prn)
                      .map((item) => (
                        <div key={item.id} className="p-2 rounded-lg bg-white border border-rose-200 space-y-0.5 shadow-2xs">
                          <div className="flex items-start justify-between gap-1">
                            <strong className="text-xs font-black text-slate-900">{item.medication}</strong>
                            {item.presentation && <span className="text-[10px] text-slate-600 font-semibold">({item.presentation})</span>}
                          </div>
                          <p className="text-xs text-rose-950 font-extrabold">
                            👉 Tomar: {item.dosage || 'Dosis indicada'}
                          </p>
                          {item.indicationFor && (
                            <p className="text-[10px] text-slate-700 font-bold">Para: {item.indicationFor}</p>
                          )}
                          {item.instructions && (
                            <p className="text-[10px] text-slate-600 italic">{item.instructions}</p>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-300 text-xs text-slate-800 flex items-center justify-between page-break-inside-avoid">
              <p>
                💡 <strong>Importante:</strong> No suspenda sus medicamentos sin consultar a su médico tratante. Si presenta reacciones adversas, acuda a consulta.
              </p>
              <span className="font-black text-slate-900 uppercase">PROYECTO CELENE ROSARITO</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
