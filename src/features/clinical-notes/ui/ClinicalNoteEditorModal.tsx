import { useState, useEffect, useMemo } from 'react';
import { useWorkspace } from '@/app/providers/WorkspaceContext';
import { useAuth } from '@/app/providers/AuthContext';
import { ClinicalNoteService } from '@/entities/clinical-note/api/clinicalNoteService';
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

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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
    setIsSubmitting(true);

    try {
      const now = new Date().toISOString();
      const isCurrentPasante = (currentUser?.role || initialNote?.attendingDoctorRole) === 'pasante';

      const savedNote = await ClinicalNoteService.savePatientNote(rootDirHandle, patientFolderName, {
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
          ? `Nota médica editada y guardada (${savedNote.fileName}) con ${diagnoses.length} diagnósticos y ${plan.prescriptions.length} prescripciones.`
          : `Nueva nota médica guardada (${savedNote.fileName}) con ${diagnoses.length} diagnósticos y ${plan.prescriptions.length} prescripciones.`,
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
        <div className="space-y-5 text-left">
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

          {/* Header Options & Quick Print Button */}
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

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<Printer className="w-3.5 h-3.5 text-blue-600" />}
                onClick={() => setIsPreviewOpen(true)}
                className="text-xs font-semibold text-blue-800 bg-white"
                title="Ver e imprimir la receta o formatos directamente"
              >
                Vista Previa e Imprimir Receta
              </Button>
            </div>
          </div>

          {/* SOAP Tabs Navigation */}
          <div className="flex border-b border-slate-200 overflow-x-auto pb-px">
            <button
              type="button"
              onClick={() => setActiveTab('subjective')}
              className={`flex items-center gap-1.5 py-2.5 px-3.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'subjective'
                  ? 'border-blue-600 text-blue-600'
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
                  ? 'border-blue-600 text-blue-600'
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
                  ? 'border-blue-600 text-blue-600'
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
                  ? 'border-blue-600 text-blue-600'
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
                  ? 'border-blue-600 text-blue-600'
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
                  ? 'border-blue-600 text-blue-600'
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
                  ? 'border-blue-600 text-blue-600'
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
              <ObjectiveForm value={objective} onChange={setObjective} />
            )}

            {activeTab === 'diagnostics' && (
              <DiagnosticsForm value={diagnoses} onChange={setDiagnoses} />
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
              <LabOrderForm value={labOrder} onChange={setLabOrder} />
            )}

            {activeTab === 'receipt' && (
              <ReceiptForm value={receipt} onChange={setReceipt} patientId={patient.id} />
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
    </>
  );
}
