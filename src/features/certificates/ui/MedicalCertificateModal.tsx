import { useState, useMemo, useEffect } from 'react';
import { useWorkspace } from '@/app/providers/WorkspaceContext';
import { useAuth } from '@/app/providers/AuthContext';
import type { Patient } from '@/entities/patient/model/schemas';
import type { ClinicalNote, VitalSigns } from '@/entities/clinical-note/model/schemas';
import type { MedicalCertificate } from '@/entities/certificates/model/schemas';
import { CertificateService } from '@/entities/certificates/api/certificateService';
import { PatientService } from '@/entities/patient/api/patientService';
import { ClinicalNoteService } from '@/entities/clinical-note/api/clinicalNoteService';
import { PrintService } from '@/shared/lib/printService';
import { DateTimeService } from '@/shared/lib/dateTimeService';
import { Modal, Button, Input, Select } from '@/shared/ui';
import {
  Printer,
  MapPin,
  ShieldCheck,
  Edit3,
  Eye,
  Save,
} from 'lucide-react';

interface MedicalCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  patientFolderName?: string;
  latestNote?: ClinicalNote | null;
  existingCertificate?: MedicalCertificate | null;
  onCertificateSaved?: () => void;
}

export function MedicalCertificateModal({
  isOpen,
  onClose,
  patient,
  patientFolderName,
  latestNote,
  existingCertificate,
  onCertificateSaved,
}: MedicalCertificateModalProps) {
  const { rootDirHandle } = useWorkspace();
  const { clinicConfig, currentUser, supervisorDoctor, logAuditAction } = useAuth();
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview');
  const [isSaving, setIsSaving] = useState(false);

  // Valores predeterminados o cargados
  const [certificateType, setCertificateType] = useState<string>('Certificado de Salud General');
  const [recipient, setRecipient] = useState<string>('A QUIEN CORRESPONDA');
  const [bloodType, setBloodType] = useState<string>('No determinado / No especificado');
  const [dictum, setDictum] = useState<string>(
    'CLÍNICAMENTE SANO Y APTO PARA REALIZAR ACTIVIDADES ESCOLARES, FÍSICAS Y DE LA VIDA DIARIA.'
  );
  const [physicalExamText, setPhysicalExamText] = useState<string>(
    'Paciente consciente, orientado en sus tres esferas neurológicas, con adecuada coloración de piel y tegumentos. Cráneo y cuello normoconfigurados sin adenomegalias. Tórax simétrico, campos pulmonares limpios y bien ventilados sin estertores. Ruidos cardíacos rítmicos de buen tono e intensidad sin soplos. Abdomen blando, depresible, no doloroso a la palpación profunda, sin megalias palpables. Extremidades íntegras, simétricas, con arcos de movilidad completos y fuerza muscular conservada 5/5.'
  );
  const [observations, setObservations] = useState<string>(
    `Alergias: ${
      patient.allergies && patient.allergies.length > 0 ? patient.allergies.join(', ') : 'Negadas'
    }. Esquema de vacunación completo para la edad. Sin sintomatología infecciosa o respiratoria aguda al momento de la exploración médica.`
  );
  const [validityDays, setValidityDays] = useState<string>('30');

  // Signos vitales
  const [vitals, setVitals] = useState<VitalSigns>(
    latestNote?.vitalSigns || {
      bpSystolic: 120,
      bpDiastolic: 80,
      heartRate: 72,
      respiratoryRate: 18,
      temperature: 36.5,
      weightKg: 65,
      heightCm: 165,
    }
  );

  useEffect(() => {
    if (existingCertificate) {
      setCertificateType(existingCertificate.type || 'Certificado de Salud General');
      setRecipient(existingCertificate.recipient || 'A QUIEN CORRESPONDA');
      setBloodType(existingCertificate.bloodType || 'No determinado / No especificado');
      setDictum(existingCertificate.dictum || '');
      setPhysicalExamText(existingCertificate.physicalExamText || '');
      setObservations(existingCertificate.observations || '');
      setValidityDays(String(existingCertificate.validityDays || 30));
      if (existingCertificate.vitals) {
        setVitals(existingCertificate.vitals);
      }
    }
  }, [existingCertificate]);

  const age = PatientService.calculateAge(patient.demographics.birthDate);
  const bmiCalc = ClinicalNoteService.calculateBMI(vitals.weightKg, vitals.heightCm);

  const isPasante =
    currentUser?.role === 'pasante' ||
    existingCertificate?.attendingDoctorRole === 'pasante' ||
    latestNote?.attendingDoctorRole === 'pasante' ||
    latestNote?.attendingDoctorTitle?.includes('PASANTE') ||
    currentUser?.username?.toLowerCase().includes('sebastian');

  const attendingDoctorName =
    currentUser?.fullName || existingCertificate?.attendingDoctorName || 'Dr. Sebastián Garduño Conde';
  const attendingDoctorTitle =
    currentUser?.title || existingCertificate?.attendingDoctorTitle || 'MÉDICO PASANTE DEL SERVICIO SOCIAL (MPSS)';
  const attendingDoctorLicense =
    currentUser?.licenseNumber || existingCertificate?.attendingDoctorLicense || 'MPSS - UABC';

  const supervisorDoctorName =
    supervisorDoctor?.fullName || existingCertificate?.supervisorDoctorName || 'Dr. Carlos Donato Dueñas Prieto';
  const supervisorDoctorTitle =
    supervisorDoctor?.title || existingCertificate?.supervisorDoctorTitle || 'MÉDICO GENERAL';
  const supervisorDoctorLicense =
    supervisorDoctor?.licenseNumber || existingCertificate?.supervisorDoctorLicense || 'CÉD. PROF. 15504256';

  const formattedGender =
    patient.demographics.gender === 'M'
      ? 'Masculino'
      : patient.demographics.gender === 'F'
      ? 'Femenino'
      : patient.demographics.gender || 'No especificado';

  const formattedDateExtended = useMemo(() => {
    const certDate = existingCertificate?.date ? new Date(existingCertificate.date) : new Date();
    return DateTimeService.formatDate(certDate, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [existingCertificate]);

  const handleSaveToDisk = async () => {
    if (!rootDirHandle || !patientFolderName) return;
    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      await CertificateService.savePatientCertificate(rootDirHandle, patientFolderName, {
        id: existingCertificate?.id || (crypto.randomUUID ? crypto.randomUUID() : `cert-${Date.now()}`),
        patientId: patient.id,
        date: existingCertificate?.date || now,
        type: certificateType,
        recipient,
        bloodType,
        validityDays: parseInt(validityDays, 10) || 30,
        vitals,
        dictum,
        physicalExamText,
        observations,
        attendingDoctorName,
        attendingDoctorTitle,
        attendingDoctorLicense,
        attendingDoctorRole: isPasante ? 'pasante' : 'titular',
        supervisorDoctorName: isPasante ? supervisorDoctorName : undefined,
        supervisorDoctorTitle: isPasante ? supervisorDoctorTitle : undefined,
        supervisorDoctorLicense: isPasante ? supervisorDoctorLicense : undefined,
      });

      await logAuditAction(
        'CREAR_NOTA_MEDICA',
        `Emisión y guardado de Certificado Médico (${certificateType}) para ${patient.demographics.firstName} ${patient.demographics.lastName}.`,
        patient.id
      );

      if (onCertificateSaved) {
        onCertificateSaved();
      }
    } catch (err) {
      console.error('Error guardando certificado:', err);
      alert('No se pudo guardar el certificado médico en disco.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = async () => {
    // Guardar automáticamente en disco si no estaba guardado
    if (rootDirHandle && patientFolderName) {
      await handleSaveToDisk();
    }

    await logAuditAction(
      'IMPRIMIR_RECETA',
      `Impresión de Certificado Médico (${certificateType}) para el paciente ${patient.demographics.firstName} ${patient.demographics.lastName} (${patient.id}).`,
      patient.id
    );
    PrintService.printElement('printable-medical-certificate', {
      title: `Certificado Médico - ${patient.demographics.firstName} ${patient.demographics.lastName}`,
    });
  };

  const renderPrintableContent = () => (
    <div
      id="printable-medical-certificate"
      className="p-8 bg-white border border-slate-300 rounded-xl space-y-4 text-left text-slate-900 shadow-2xs font-sans text-xs"
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

        {/* Derecha: Badge de Certificado Médico, Fecha y Folio alineados a la derecha */}
        <div className="col-span-3 flex flex-col items-end justify-center text-right space-y-1">
          <span className="px-2.5 py-0.5 border-2 border-slate-900 text-slate-900 font-extrabold rounded-md text-[10px] uppercase tracking-wider">
            CERTIFICADO MÉDICO
          </span>
          <p className="text-[10px] text-slate-700">
            Fecha: <strong className="text-slate-900 font-bold">{DateTimeService.formatDate(existingCertificate?.date || new Date())}</strong>
          </p>
          <p className="text-[10px] text-slate-600 font-mono">
            Folio: <strong className="text-slate-900 font-bold">{patient.id}</strong>
          </p>
        </div>
      </div>

      {/* 2. Destinatario y Título Central */}
      <div className="text-center py-1 space-y-0.5">
        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest block">
          {recipient}
        </span>
        <h1 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wide">
          CERTIFICADO MÉDICO DE SALUD
        </h1>
      </div>

      {/* 3. Declaración Inicial Formal */}
      <div className="text-xs text-slate-900 leading-relaxed text-justify space-y-1">
        <p>
          El que suscribe, médico legalmente autorizado para ejercer la profesión médica por la <strong>Dirección General de Profesiones</strong> y la <strong>Universidad Autónoma de Baja California</strong>, hace constar que el día de hoy se practicó un examen médico clínico integral al paciente:
        </p>
      </div>

      {/* 4. Ficha Demográfica del Paciente */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-2.5 rounded-lg border border-slate-300 bg-slate-50/80 text-xs">
        <div className="sm:col-span-5">
          <span className="text-slate-600 font-bold uppercase text-[9px] block">NOMBRE DEL PACIENTE</span>
          <strong className="text-slate-900 text-xs sm:text-sm font-bold uppercase break-words leading-tight block">
            {patient.demographics.firstName} {patient.demographics.lastName}
          </strong>
        </div>
        <div className="sm:col-span-2">
          <span className="text-slate-600 font-bold uppercase text-[9px] block">FECHA DE NACIMIENTO</span>
          <span className="text-slate-900 font-semibold text-xs block">{patient.demographics.birthDate || 'No registrada'}</span>
        </div>
        <div className="sm:col-span-2">
          <span className="text-slate-600 font-bold uppercase text-[9px] block">EDAD / SEXO</span>
          <span className="text-slate-900 font-bold text-xs block">{age.displayText} • {formattedGender}</span>
        </div>
        <div className="sm:col-span-3">
          <span className="text-slate-600 font-bold uppercase text-[9px] block">GRUPO SANGUÍNEO / RH</span>
          <span className="text-slate-900 font-bold text-xs block">{bloodType}</span>
        </div>
      </div>

      {/* 5. Signos Vitales y Somatometría */}
      <div className="p-2 rounded-lg border border-slate-300 bg-slate-50/50 text-[10px] grid grid-cols-4 sm:grid-cols-8 gap-1.5 text-center">
        <div>
          <span className="text-slate-700 block font-semibold">T.A. (mmHg)</span>
          <strong className="text-slate-900 font-bold">
            {vitals.bpSystolic && vitals.bpDiastolic ? `${vitals.bpSystolic}/${vitals.bpDiastolic}` : '-'}
          </strong>
        </div>
        <div>
          <span className="text-slate-700 block font-semibold">F.C. (lpm)</span>
          <strong className="text-slate-900 font-bold">{vitals.heartRate || '-'}</strong>
        </div>
        <div>
          <span className="text-slate-700 block font-semibold">F.R. (rpm)</span>
          <strong className="text-slate-900 font-bold">{vitals.respiratoryRate || '-'}</strong>
        </div>
        <div>
          <span className="text-slate-700 block font-semibold">TEMP (°C)</span>
          <strong className="text-slate-900 font-bold">{vitals.temperature ? `${vitals.temperature}°C` : '-'}</strong>
        </div>
        <div>
          <span className="text-slate-700 block font-semibold">PESO (kg)</span>
          <strong className="text-slate-900 font-bold">{vitals.weightKg ? `${vitals.weightKg} kg` : '-'}</strong>
        </div>
        <div>
          <span className="text-slate-700 block font-semibold">TALLA (cm)</span>
          <strong className="text-slate-900 font-bold">{vitals.heightCm ? `${vitals.heightCm} cm` : '-'}</strong>
        </div>
        <div>
          <span className="text-slate-700 block font-semibold">I.M.C.</span>
          <strong className="text-slate-900 font-bold">{bmiCalc ? bmiCalc.bmi : '-'}</strong>
        </div>
        <div>
          <span className="text-slate-700 block font-semibold">ESTADO NUTRICIONAL</span>
          <strong className="text-slate-900 font-bold">{bmiCalc ? bmiCalc.category : 'Eutrófico'}</strong>
        </div>
      </div>

      {/* 6. Exploración Física */}
      <div className="space-y-1 text-xs">
        <span className="font-bold uppercase text-slate-800 text-[10px] block">HALLAZGOS A LA EXPLORACIÓN FÍSICA:</span>
        <p className="text-slate-900 leading-relaxed text-justify bg-slate-50/60 p-2.5 rounded-lg border border-slate-200">
          {physicalExamText}
        </p>
      </div>

      {/* 7. Dictamen Médico y Conclusión */}
      <div className="p-3 rounded-xl border-2 border-emerald-600 bg-emerald-50/70 text-xs space-y-1">
        <span className="font-black text-emerald-950 uppercase text-[10px] flex items-center gap-1.5 block">
          <ShieldCheck className="w-4 h-4 text-emerald-700" /> DICTAMEN MÉDICO / CONCLUSIÓN:
        </span>
        <p className="font-bold text-emerald-950 text-xs sm:text-sm leading-snug">
          {dictum}
        </p>
      </div>

      {/* 8. Observaciones y Antecedentes */}
      {observations && (
        <div className="text-xs space-y-0.5">
          <span className="font-bold uppercase text-slate-700 text-[10px] block">OBSERVACIONES / ANTECEDENTES RELEVANTES:</span>
          <p className="text-slate-800 leading-relaxed text-justify">{observations}</p>
        </div>
      )}

      {/* 9. Cláusula de Cierre y Vigencia */}
      <div className="text-[11px] text-slate-700 leading-relaxed text-justify pt-1">
        <p>
          A petición de la parte interesada y para los fines legales, escolares, laborales o administrativos que al interesado convengan, se extiende el presente certificado en la ciudad de <strong>Playas de Rosarito, Baja California</strong>, el día <strong>{formattedDateExtended}</strong>, con una vigencia sugerida de <strong>{validityDays} días naturales</strong> a partir de su expedición.
        </p>
      </div>

      {/* 10. Firmas Institucionales UABC */}
      <div className="signature-box pt-8 border-t border-slate-300 page-break-inside-avoid">
        <div className="flex justify-between items-end gap-8 text-[10px]">
          {isPasante ? (
            <>
              {/* Firma MPSS */}
              <div className="flex-1 text-center border-t-2 border-slate-800 pt-2 space-y-0.5">
                <p className="font-bold text-slate-900 text-xs sm:text-sm">
                  {attendingDoctorName}
                </p>
                <p className="text-[10px] text-slate-800 font-bold uppercase">
                  {attendingDoctorTitle}
                </p>
                <p className="text-xs text-slate-900 font-mono font-bold">
                  {attendingDoctorLicense}
                </p>
                <p className="text-[10px] text-slate-700 font-semibold">
                  UNIVERSIDAD AUTÓNOMA DE BAJA CALIFORNIA
                </p>
                <p className="text-[9px] text-slate-600 font-bold uppercase">MÉDICO EXAMINADOR</p>
              </div>

              {/* Firma Supervisor */}
              <div className="flex-1 text-center border-t-2 border-slate-800 pt-2 space-y-0.5">
                <p className="font-bold text-slate-900 text-xs sm:text-sm">
                  {supervisorDoctorName}
                </p>
                <p className="text-[10px] text-slate-800 font-bold uppercase">
                  {supervisorDoctorTitle}
                </p>
                <p className="text-xs text-slate-900 font-mono font-bold">
                  {supervisorDoctorLicense}
                </p>
                <p className="text-[10px] text-slate-700 font-semibold">
                  UNIVERSIDAD AUTÓNOMA DE BAJA CALIFORNIA
                </p>
                <p className="text-[9px] text-slate-600 font-bold uppercase">MÉDICO SUPERVISOR</p>
              </div>
            </>
          ) : (
            <div className="mx-auto text-center w-72 border-t-2 border-slate-800 pt-2 space-y-0.5">
              <p className="font-bold text-slate-900 text-xs sm:text-sm">
                {attendingDoctorName}
              </p>
              <p className="text-[10px] text-slate-800 font-bold uppercase">
                {attendingDoctorTitle}
              </p>
              <p className="text-xs text-slate-900 font-mono font-bold">
                {attendingDoctorLicense}
              </p>
              <p className="text-[10px] text-slate-700 font-semibold">
                UNIVERSIDAD AUTÓNOMA DE BAJA CALIFORNIA
              </p>
              <p className="text-[9px] text-slate-600 font-bold uppercase">MÉDICO TRATANTE</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingCertificate ? `Certificado Médico (${existingCertificate.fileName})` : 'Certificado Médico Oficial'}
      description={`Expediente: ${patient.demographics.firstName} ${patient.demographics.lastName} (${patient.id})`}
      maxWidth="4xl"
    >
      <div className="space-y-5 text-left font-sans">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 no-print">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Vista Previa e Impresión
            </button>

            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'edit'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Personalizar Dictamen y Datos
            </button>
          </div>

          <div className="flex items-center gap-2">
            {rootDirHandle && patientFolderName && !existingCertificate && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Save className="w-4 h-4 text-emerald-600" />}
                onClick={handleSaveToDisk}
                isLoading={isSaving}
                className="text-emerald-950 border-emerald-300 hover:bg-emerald-50 text-xs font-bold shadow-2xs"
              >
                Guardar en Historial
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={handlePrint}
              isLoading={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs font-bold"
            >
              Imprimir Certificado
            </Button>
          </div>
        </div>

        {/* Mode 1: Editor / Personalizador */}
        {viewMode === 'edit' && (
          <div className="space-y-4 text-xs bg-slate-50/50 p-4 rounded-xl border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Tipo de Certificado"
                value={certificateType}
                onChange={(e) => {
                  const val = e.target.value;
                  setCertificateType(val);
                  if (val === 'Certificado Escolar') {
                    setDictum('CLÍNICAMENTE SANO Y APTO PARA ACTIVIDADES ESCOLARES, CULTURALES Y DEPORTIVAS.');
                  } else if (val === 'Certificado Laboral') {
                    setDictum('CLÍNICAMENTE SANO Y APTO PARA EL DESEMPEÑO DE SUS ACTIVIDADES LABORALES.');
                  } else if (val === 'Certificado Deportivo') {
                    setDictum('CLÍNICAMENTE SANO Y APTO PARA LA PRÁCTICA DE ACTIVIDAD FÍSICA Y DEPORTE DE ALTO RENDIMIENTO.');
                  }
                }}
              >
                <option value="Certificado de Salud General">Certificado de Salud General</option>
                <option value="Certificado Escolar">Certificado Escolar / Ingreso</option>
                <option value="Certificado Laboral">Certificado Laboral / Aptitud</option>
                <option value="Certificado Deportivo">Certificado Deportivo / Actividad Física</option>
                <option value="Certificado Prematrimonial">Certificado Prematrimonial</option>
              </Select>

              <Input
                label="Destinatario"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Ej. A QUIEN CORRESPONDA o Escuela Primaria..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                label="Grupo Sanguíneo y Factor Rh"
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
              >
                <option value="No determinado / No especificado">No determinado / No especificado</option>
                <option value="O Positivo (O+)">O Positivo (O+)</option>
                <option value="O Negativo (O-)">O Negativo (O-)</option>
                <option value="A Positivo (A+)">A Positivo (A+)</option>
                <option value="A Negativo (A-)">A Negativo (A-)</option>
                <option value="B Positivo (B+)">B Positivo (B+)</option>
                <option value="B Negativo (B-)">B Negativo (B-)</option>
                <option value="AB Positivo (AB+)">AB Positivo (AB+)</option>
                <option value="AB Negativo (AB-)">AB Negativo (AB-)</option>
              </Select>

              <Input
                label="Vigencia Sugerida (Días)"
                type="number"
                value={validityDays}
                onChange={(e) => setValidityDays(e.target.value)}
              />

              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode('preview')}
                  className="w-full text-xs font-semibold"
                >
                  Ver Vista Previa
                </Button>
              </div>
            </div>

            {/* Vitals inputs */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200">
              <span className="font-bold text-slate-800 text-xs block">Signos Vitales y Somatometría para el Certificado:</span>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                <Input
                  label="T.A. Sistólica"
                  type="number"
                  value={vitals.bpSystolic || ''}
                  onChange={(e) => setVitals({ ...vitals, bpSystolic: Number(e.target.value) || undefined })}
                />
                <Input
                  label="T.A. Diastólica"
                  type="number"
                  value={vitals.bpDiastolic || ''}
                  onChange={(e) => setVitals({ ...vitals, bpDiastolic: Number(e.target.value) || undefined })}
                />
                <Input
                  label="F. Cardíaca (lpm)"
                  type="number"
                  value={vitals.heartRate || ''}
                  onChange={(e) => setVitals({ ...vitals, heartRate: Number(e.target.value) || undefined })}
                />
                <Input
                  label="Temperatura (°C)"
                  type="number"
                  step="0.1"
                  value={vitals.temperature || ''}
                  onChange={(e) => setVitals({ ...vitals, temperature: Number(e.target.value) || undefined })}
                />
                <Input
                  label="Peso (kg)"
                  type="number"
                  step="0.1"
                  value={vitals.weightKg || ''}
                  onChange={(e) => setVitals({ ...vitals, weightKg: Number(e.target.value) || undefined })}
                />
                <Input
                  label="Talla (cm)"
                  type="number"
                  value={vitals.heightCm || ''}
                  onChange={(e) => setVitals({ ...vitals, heightCm: Number(e.target.value) || undefined })}
                />
              </div>
            </div>

            {/* Dictum and physical exam */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200">
              <label className="font-bold text-slate-800 text-xs block">Dictamen / Conclusión Médica:</label>
              <textarea
                rows={2}
                value={dictum}
                onChange={(e) => setDictum(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 text-xs block">Descripción de Exploración Física:</label>
              <textarea
                rows={3}
                value={physicalExamText}
                onChange={(e) => setPhysicalExamText(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs text-slate-800 bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 text-xs block">Observaciones y Alergias:</label>
              <textarea
                rows={2}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs text-slate-800 bg-white"
              />
            </div>
          </div>
        )}

        {/* Mode 2: Vista previa del documento */}
        {viewMode === 'preview' && <div>{renderPrintableContent()}</div>}

        {/* Si está en modo editor, mantener el nodo en el DOM para PrintService */}
        {viewMode === 'edit' && <div className="hidden">{renderPrintableContent()}</div>}
      </div>
    </Modal>
  );
}
