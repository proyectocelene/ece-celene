import { useState, useEffect, useMemo } from 'react';
import { useWorkspace } from '@/app/providers/WorkspaceContext';
import { useAuth } from '@/app/providers/AuthContext';
import { ClinicalNoteService } from '@/entities/clinical-note/api/clinicalNoteService';
import { NotePermissionService } from '@/entities/clinical-note/lib/notePermissionService';
import type {
  ClinicalNote,
  VitalSigns,
  Subjective,
  Objective,
  DiagnosisItem,
  ClinicalPlan,
  LabOrder,
  Receipt,
} from '@/entities/clinical-note/model/schemas';
import type { Patient } from '@/entities/patient/model/schemas';
import { Modal, Button, Select } from '@/shared/ui';
import { VitalSignsForm } from './submodules/VitalSignsForm';
import { SubjectiveForm } from './submodules/SubjectiveForm';
import { ObjectiveForm } from './submodules/ObjectiveForm';
import { DiagnosticsForm } from './submodules/DiagnosticsForm';
import { PlanAndPrescriptionForm } from './submodules/PlanAndPrescriptionForm';
import { LabOrderForm } from './submodules/LabOrderForm';
import { ReceiptForm } from './submodules/ReceiptForm';
import { ClinicalNoteViewerModal } from './ClinicalNoteViewerModal';
import { LabOrderPrintModal } from '@/features/print-templates/ui/LabOrderPrintModal';
import { GeneralPlanPrintModal } from '@/features/print-templates/ui/GeneralPlanPrintModal';
import { MedicationSchedulePrint } from '@/features/print-templates/ui/MedicationSchedulePrint';
import { ServiceReceiptPrint } from '@/features/print-templates/ui/ServiceReceiptPrint';
import {
  Activity,
  Stethoscope,
  FileText,
  Pill,
  HeartPulse,
  Save,
  UserCheck,
  TestTubes,
  Receipt as ReceiptIcon,
  Printer,
  Edit3,
  Clock,
} from 'lucide-react';

interface ClinicalNoteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  patientFolderName: string;
  initialNote?: ClinicalNote | null;
  pastNotes?: ClinicalNote[];
  onNoteSaved: () => void;
}

export function ClinicalNoteEditorModal({
  isOpen,
  onClose,
  patient,
  patientFolderName,
  initialNote = null,
  pastNotes = [],
  onNoteSaved,
}: ClinicalNoteEditorModalProps) {
  const { rootDirHandle } = useWorkspace();
  const { currentUser, supervisorDoctor, logAuditAction } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'subjective' | 'vitals' | 'objective' | 'diagnostics' | 'plan' | 'lab' | 'receipt'>('subjective');

  const [noteType, setNoteType] = useState<ClinicalNote['noteType']>('Consulta General');
  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({});
  const [subjective, setSubjective] = useState<Subjective>({
    reasonForVisit: '',
    currentIllness: '',
    systemsReview: '',
  });
  const [objective, setObjective] = useState<Objective>({
    generalAppearance: '',
    headAndNeck: '',
    chestAndLungs: '',
    abdomen: '',
    extremities: '',
    neurological: '',
  });
  const [diagnoses, setDiagnoses] = useState<DiagnosisItem[]>([]);
  const [plan, setPlan] = useState<ClinicalPlan>({
    generalPlan: '',
    nonPharmacological: '',
    warningSigns: '',
    followUpDate: '',
    prescriptions: [],
  });
  const [labOrder, setLabOrder] = useState<LabOrder>({
    studies: [],
    otherStudies: '',
    fastingHours: 8,
    clinicalNotes: '',
    urgency: 'Ordinario',
  });
  const [receipt, setReceipt] = useState<Receipt>({
    receiptFolio: '',
    services: [{ id: '1', description: 'Consulta Médica General', commercialCost: 650, amount: 150, isSubsidized: true }],
    totalCommercial: 650,
    totalSubsidy: 500,
    totalAmount: 150,
    receivedAmount: 150,
    pendingAmount: 0,
    paymentMethod: 'Efectivo',
    notes: '',
  });

  // Estados de modales de impresión y vista previa directa sin guardar
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLabOrderPrintOpen, setIsLabOrderPrintOpen] = useState(false);
  const [isGeneralPlanPrintOpen, setIsGeneralPlanPrintOpen] = useState(false);
  const [isSchedulePrintOpen, setIsSchedulePrintOpen] = useState(false);
  const [isBlankReceiptOpen, setIsBlankReceiptOpen] = useState(false);

  // Local storage auto-save key for new drafts
  const draftKey = `draft_note_${patient.id}`;

  // Inicializar formulario con initialNote (si estamos editando) o restaurar borrador (si es nueva)
  useEffect(() => {
    if (isOpen) {
      if (initialNote) {
        // Modo Edición: Cargar datos de la nota existente
        setNoteType(initialNote.noteType || 'Consulta General');
        setVitalSigns(initialNote.vitalSigns || {});
        setSubjective(initialNote.subjective || { reasonForVisit: '', currentIllness: '', systemsReview: '' });
        setObjective(initialNote.objective || { generalAppearance: '', headAndNeck: '', chestAndLungs: '', abdomen: '', extremities: '', neurological: '' });
        setDiagnoses(initialNote.diagnoses || []);
        setPlan(initialNote.plan || { generalPlan: '', nonPharmacological: '', warningSigns: '', followUpDate: '', prescriptions: [] });
        setLabOrder(initialNote.labOrder || { studies: [], otherStudies: '', fastingHours: 8, clinicalNotes: '', urgency: 'Ordinario' });
        setReceipt(initialNote.receipt || {
          receiptFolio: '',
          services: [{ id: '1', description: 'Consulta Médica General', commercialCost: 650, amount: 150, isSubsidized: true }],
          totalCommercial: 650,
          totalSubsidy: 500,
          totalAmount: 150,
          receivedAmount: 150,
          pendingAmount: 0,
          paymentMethod: 'Efectivo',
          notes: '',
        });
      } else {
        // Modo Nueva Nota: Restaurar borrador de localStorage si existe
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft);
            if (parsed.subjective) setSubjective(parsed.subjective);
            if (parsed.vitalSigns) setVitalSigns(parsed.vitalSigns);
            if (parsed.objective) setObjective(parsed.objective);
            if (parsed.diagnoses) setDiagnoses(parsed.diagnoses);
            if (parsed.plan) setPlan(parsed.plan);
            if (parsed.labOrder) setLabOrder(parsed.labOrder);
            if (parsed.receipt) setReceipt(parsed.receipt);
            if (parsed.noteType) setNoteType(parsed.noteType);
          } catch {
            // Ignorar borrador corrupto
          }
        } else {
          // Reset a valores limpios por defecto
          setNoteType('Consulta General');
          setVitalSigns({});
          setSubjective({ reasonForVisit: '', currentIllness: '', systemsReview: '' });
          setObjective({ generalAppearance: '', headAndNeck: '', chestAndLungs: '', abdomen: '', extremities: '', neurological: '' });
          setDiagnoses([]);
          setPlan({ generalPlan: '', nonPharmacological: '', warningSigns: '', followUpDate: '', prescriptions: [] });
          setLabOrder({ studies: [], otherStudies: '', fastingHours: 8, clinicalNotes: '', urgency: 'Ordinario' });
          setReceipt({
            receiptFolio: '',
            services: [{ id: '1', description: 'Consulta Médica General', commercialCost: 650, amount: 150, isSubsidized: true }],
            totalCommercial: 650,
            totalSubsidy: 500,
            totalAmount: 150,
            receivedAmount: 150,
            pendingAmount: 0,
            paymentMethod: 'Efectivo',
            notes: '',
          });
        }
      }
    }
  }, [isOpen, initialNote, draftKey]);

  // Guardar en borrador automático de localStorage solo si estamos creando una nueva nota (no editando)
  useEffect(() => {
    if (isOpen && !initialNote) {
      const draft = {
        noteType,
        vitalSigns,
        subjective,
        objective,
        diagnoses,
        plan,
        labOrder,
        receipt,
      };
      localStorage.setItem(draftKey, JSON.stringify(draft));
    }
  }, [isOpen, initialNote, draftKey, noteType, vitalSigns, subjective, objective, diagnoses, plan, labOrder, receipt]);

  // Extract past prescriptions for easy copy
  const pastNotesPrescriptions = useMemo(() => {
    return pastNotes
      .filter((n) => n.id !== initialNote?.id && n.plan?.prescriptions && n.plan.prescriptions.length > 0)
      .map((n) => ({
        date: n.date,
        prescriptions: n.plan.prescriptions,
      }));
  }, [pastNotes, initialNote]);

  // Extract past diagnoses from past notes and patient chronic conditions
  const pastDiagnosesList = useMemo(() => {
    const list: { description: string; cie10Code?: string; type?: string; notes?: string }[] = [];

    // From chronic conditions
    if (patient.chronicConditions && patient.chronicConditions.length > 0) {
      for (const cond of patient.chronicConditions) {
        list.push({
          description: cond.name,
          type: 'definitivo',
          notes: cond.modificationsNotes,
        });
      }
    }

    // From past notes
    for (const n of pastNotes) {
      if (n.id !== initialNote?.id && n.diagnoses && n.diagnoses.length > 0) {
        for (const d of n.diagnoses) {
          list.push({
            description: d.description,
            cie10Code: d.cie10Code,
            type: d.type,
            notes: d.notes,
          });
        }
      }
    }

    return list;
  }, [pastNotes, patient.chronicConditions, initialNote]);

  // Manejador para agregar un estudio de recordatorio directamente a la orden de laboratorio
  const handleAddLabStudyFromReminder = (studyName: string) => {
    if (!labOrder.studies.includes(studyName)) {
      setLabOrder((prev) => ({
        ...prev,
        studies: [...prev.studies, studyName],
      }));
      // Cambiar a la pestaña de laboratorio para retroalimentar visualmente
      setActiveTab('lab');
    }
  };

  // Transient note for live preview / direct print
  const transientNote: ClinicalNote = useMemo(() => {
    return {
      id: initialNote?.id || 'draft-note',
      patientId: patient.id,
      fileName: initialNote?.fileName || 'borrador.json',
      schemaVersion: '1.0.0',
      date: initialNote?.date || new Date().toISOString(),
      noteType,
      vitalSigns,
      subjective,
      objective,
      diagnoses,
      plan,
      labOrder,
      receipt,
      attendingDoctorName: currentUser?.fullName || initialNote?.attendingDoctorName || 'Dr. Sebastián Garduño Conde',
      attendingDoctorTitle: currentUser?.title || initialNote?.attendingDoctorTitle || 'MÉDICO PASANTE DEL SERVICIO SOCIAL (MPSS)',
      attendingDoctorLicense: currentUser?.licenseNumber || initialNote?.attendingDoctorLicense || 'MPSS - UABC',
      attendingDoctorRole: currentUser?.role || initialNote?.attendingDoctorRole || 'pasante',
      supervisorDoctorName: (currentUser?.role === 'pasante' || initialNote?.attendingDoctorRole === 'pasante') ? (supervisorDoctor?.fullName || 'Dr. Carlos Donato Dueñas Prieto') : undefined,
      supervisorDoctorTitle: (currentUser?.role === 'pasante' || initialNote?.attendingDoctorRole === 'pasante') ? (supervisorDoctor?.title || 'MÉDICO GENERAL') : undefined,
      supervisorDoctorLicense: (currentUser?.role === 'pasante' || initialNote?.attendingDoctorRole === 'pasante') ? (supervisorDoctor?.licenseNumber || 'CED. PROF. 15504256') : undefined,
      createdAt: initialNote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [initialNote, patient.id, noteType, vitalSigns, subjective, objective, diagnoses, plan, labOrder, receipt, currentUser, supervisorDoctor]);

  const handleSave = async () => {
    if (!rootDirHandle) return;

    // Validación de seguridad: 48 horas y autoría estricta
    if (initialNote) {
      const perm = NotePermissionService.checkEditPermission(initialNote, currentUser);
      if (!perm.canEdit) {
        alert(perm.reason || 'No tienes permisos para modificar esta consulta médica.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const now = new Date().toISOString();
      const isCurrentPasante = (currentUser?.role || initialNote?.attendingDoctorRole) === 'pasante';

      await ClinicalNoteService.savePatientNote(rootDirHandle, patientFolderName, {
        id: initialNote?.id || (crypto.randomUUID ? crypto.randomUUID() : `note-${Date.now()}`),
        patientId: patient.id,
        fileName: initialNote?.fileName,
        date: initialNote?.date || now,
        noteType,
        vitalSigns,
        subjective,
        objective,
        diagnoses,
        plan,
        labOrder,
        receipt,
        attendingDoctorName: currentUser?.fullName || initialNote?.attendingDoctorName || 'Médico Tratante',
        attendingDoctorTitle: currentUser?.title || initialNote?.attendingDoctorTitle || 'MÉDICO GENERAL',
        attendingDoctorLicense: currentUser?.licenseNumber || initialNote?.attendingDoctorLicense || '',
        attendingDoctorRole: currentUser?.role || initialNote?.attendingDoctorRole || 'titular',
        supervisorDoctorName: isCurrentPasante ? (supervisorDoctor?.fullName || initialNote?.supervisorDoctorName || 'Dr. Carlos Donato Dueñas Prieto') : undefined,
        supervisorDoctorTitle: isCurrentPasante ? (supervisorDoctor?.title || initialNote?.supervisorDoctorTitle || 'MÉDICO GENERAL') : undefined,
        supervisorDoctorLicense: isCurrentPasante ? (supervisorDoctor?.licenseNumber || initialNote?.supervisorDoctorLicense || 'CED. PROF. 15504256') : undefined,
        createdAt: initialNote?.createdAt || now,
        updatedAt: now,
      });

      // Limpiar borrador temporal si era nueva nota
      if (!initialNote) {
        localStorage.removeItem(draftKey);
      }

      await logAuditAction(
        initialNote ? 'EDITAR_NOTA_MEDICA' : 'CREAR_NOTA_MEDICA',
        initialNote
          ? `Edición de consulta médica de ${patient.demographics.firstName} ${patient.demographics.lastName} (${patient.id}) realizada por ${currentUser?.fullName || 'Médico'}`
          : `Registro de nueva consulta médica para ${patient.demographics.firstName} ${patient.demographics.lastName} (${patient.id}) realizada por ${currentUser?.fullName || 'Médico'}`,
        patient.id
      );

      onNoteSaved();
      onClose();
    } catch (err) {
      console.error('Error guardando nota médica:', err);
      alert('Error al guardar la nota médica en disco.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={initialNote ? `Editar Consulta y Receta (${initialNote.fileName})` : 'Nueva Nota Médica de Consulta'}
        description={`Expediente: ${patient.demographics.firstName} ${patient.demographics.lastName} (${patient.id})`}
        maxWidth="4xl"
      >
        <div className="space-y-5 text-left font-sans">
          {/* Doctor Attribution Info Banner */}
          {currentUser && (
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-blue-900">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  {initialNote ? 'Editando nota como:' : 'Atendiendo:'} <strong>{currentUser.fullName}</strong> ({currentUser.title})
                </span>
              </div>
              {currentUser.role === 'pasante' && supervisorDoctor && (
                <span className="text-[11px] text-blue-700 font-medium">
                  Supervisor: <strong>{supervisorDoctor.fullName}</strong>
                </span>
              )}
            </div>
          )}

          {/* Header Options & Quick Print Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div className="w-full sm:w-64">
              <Select
                label="Tipo de Consulta"
                value={noteType}
                onChange={(e) => setNoteType(e.target.value as ClinicalNote['noteType'])}
              >
                <option value="Consulta General">Consulta General</option>
                <option value="Seguimiento / Control">Seguimiento / Control</option>
                <option value="Urgencia">Urgencia</option>
                <option value="Interconsulta">Interconsulta</option>
                <option value="Preoperatoria">Preoperatoria</option>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<Printer className="w-3.5 h-3.5 text-blue-600" />}
                onClick={() => setIsPreviewOpen(true)}
                className="text-xs font-semibold text-blue-800 bg-white"
                title="Vista previa e impresión de la receta médica"
              >
                Imprimir Receta
              </Button>

              <button
                type="button"
                onClick={() => setIsLabOrderPrintOpen(true)}
                className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-900 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer shadow-2xs"
                title="Imprimir solicitud de laboratorio y gabinete de forma directa"
              >
                <TestTubes className="w-3.5 h-3.5 text-indigo-600" />
                <span>Imprimir Labs</span>
              </button>

              <button
                type="button"
                onClick={() => setIsGeneralPlanPrintOpen(true)}
                className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer shadow-2xs"
                title="Imprimir hoja de plan general e indicaciones terapéuticas"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Imprimir Plan</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSchedulePrintOpen(true)}
                className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer shadow-2xs"
                title="Imprimir horario visual de medicamentos"
              >
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Horario</span>
              </button>
            </div>
          </div>

          {/* SOAP Tabs Navigation */}
          <div className="flex border-b border-slate-200 overflow-x-auto pb-px">
            <button
              type="button"
              onClick={() => setActiveTab('subjective')}
              className={`flex items-center gap-1.5 py-2.5 px-3.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'subjective'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              1. Subjetivo (Interrogatorio)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('vitals')}
              className={`flex items-center gap-1.5 py-2.5 px-3.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'vitals'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              2. Signos Vitales
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('objective')}
              className={`flex items-center gap-1.5 py-2.5 px-3.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'objective'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              3. Objetivo (Exploración)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('diagnostics')}
              className={`flex items-center gap-1.5 py-2.5 px-3.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'diagnostics'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              4. Diagnósticos ({diagnoses.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('plan')}
              className={`flex items-center gap-1.5 py-2.5 px-3.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'plan'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Pill className="w-3.5 h-3.5" />
              5. Plan y Receta ({plan.prescriptions.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('lab')}
              className={`flex items-center gap-1.5 py-2.5 px-3.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'lab'
                  ? 'border-indigo-600 text-indigo-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <TestTubes className="w-3.5 h-3.5" />
              6. Laboratorio ({labOrder.studies.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('receipt')}
              className={`flex items-center gap-1.5 py-2.5 px-3.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'receipt'
                  ? 'border-emerald-600 text-emerald-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <ReceiptIcon className="w-3.5 h-3.5" />
              7. Recibo ($ {receipt.totalAmount})
            </button>
          </div>

          {/* Tab Content */}
          <div className="pt-2">
            {activeTab === 'subjective' && (
              <SubjectiveForm value={subjective} onChange={setSubjective} />
            )}

            {activeTab === 'vitals' && (
              <VitalSignsForm value={vitalSigns} onChange={setVitalSigns} />
            )}

            {activeTab === 'objective' && (
              <ObjectiveForm
                value={objective}
                onChange={setObjective}
                patient={patient}
                onAddLabStudy={handleAddLabStudyFromReminder}
              />
            )}

            {activeTab === 'diagnostics' && (
              <DiagnosticsForm
                value={diagnoses}
                onChange={setDiagnoses}
                pastDiagnoses={pastDiagnosesList}
              />
            )}

            {activeTab === 'plan' && (
              <PlanAndPrescriptionForm
                value={plan}
                onChange={setPlan}
                chronicConditions={patient.chronicConditions || []}
                pastNotesPrescriptions={pastNotesPrescriptions}
              />
            )}

            {activeTab === 'lab' && (
              <LabOrderForm
                value={labOrder}
                onChange={setLabOrder}
                onPrintLabOrder={() => setIsLabOrderPrintOpen(true)}
              />
            )}

            {activeTab === 'receipt' && (
              <ReceiptForm
                value={receipt}
                onChange={setReceipt}
                patientId={patient.id}
                onPrintBlankReceipt={() => setIsBlankReceiptOpen(false)}
              />
            )}
          </div>

          {/* Footer Save & Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cerrar
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={handleSave}
                isLoading={isSubmitting}
                leftIcon={initialNote ? <Edit3 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                className="shadow-sm shadow-blue-500/20 font-bold"
              >
                {initialNote ? 'Actualizar Consulta en Disco' : 'Guardar Consulta en Disco'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Quick Print Preview Viewer Modal */}
      {isPreviewOpen && (
        <ClinicalNoteViewerModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          note={transientNote}
          patient={patient}
        />
      )}

      {/* Direct Lab Order Print Modal */}
      {isLabOrderPrintOpen && (
        <LabOrderPrintModal
          note={transientNote}
          patient={patient}
          labOrder={labOrder}
          onClose={() => setIsLabOrderPrintOpen(false)}
        />
      )}

      {/* Direct General Plan Print Modal */}
      {isGeneralPlanPrintOpen && (
        <GeneralPlanPrintModal
          note={transientNote}
          patient={patient}
          onClose={() => setIsGeneralPlanPrintOpen(false)}
        />
      )}

      {/* Direct Medication Schedule Print Modal */}
      {isSchedulePrintOpen && (
        <MedicationSchedulePrint
          note={transientNote}
          patient={patient}
          onClose={() => setIsSchedulePrintOpen(false)}
        />
      )}

      {/* Blank Receipt Modal */}
      {isBlankReceiptOpen && (
        <ServiceReceiptPrint
          note={transientNote}
          patient={patient}
          initialBlankMode={true}
          onClose={() => setIsBlankReceiptOpen(false)}
        />
      )}
    </>
  );
}
