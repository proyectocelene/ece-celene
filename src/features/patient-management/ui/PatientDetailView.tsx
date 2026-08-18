import { useState, useEffect, useCallback } from 'react';
import { useWorkspace } from '@/app/providers/WorkspaceContext';
import { useAuth } from '@/app/providers/AuthContext';
import { PatientService } from '@/entities/patient/api/patientService';
import { PatientIndexService } from '@/entities/patient/api/patientIndexService';
import { ClinicalNoteService } from '@/entities/clinical-note/api/clinicalNoteService';
import type { Patient } from '@/entities/patient/model/schemas';
import type { ClinicalNote } from '@/entities/clinical-note/model/schemas';
import { PatientDemographicsTab } from './PatientDemographicsTab';
import { PatientBackgroundTab } from './PatientBackgroundTab';
import { PatientNotesTab } from '@/features/clinical-notes/ui/PatientNotesTab';
import { PatientAttachmentsTab } from '@/features/attachments/ui/PatientAttachmentsTab';
import { PatientVitalTrendsTab } from './PatientVitalTrendsTab';
import { MedicalCertificateModal } from '@/features/certificates/ui/MedicalCertificateModal';
import { Button, Card, Badge, Modal } from '@/shared/ui';
import {
  ArrowLeft,
  User,
  HeartHandshake,
  FileText,
  Paperclip,
  Activity,
  AlertCircle,
  Phone,
  Trash2,
  Folder,
  MessageSquare,
  ExternalLink,
  Award,
  TrendingUp,
} from 'lucide-react';

interface PatientDetailViewProps {
  patientId: string;
  folderName: string;
  onBack: () => void;
}

export function PatientDetailView({ patientId, folderName, onBack }: PatientDetailViewProps) {
  const { rootDirHandle, reloadIndex } = useWorkspace();
  const { logAuditAction } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [patientNotes, setPatientNotes] = useState<ClinicalNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'demographics' | 'background' | 'notes' | 'trends' | 'attachments'>('demographics');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

  // Sync with URL hash for navigation persistence on page refresh (F5)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('tab=')) {
      const match = hash.match(/tab=([a-z]+)/);
      if (match && ['demographics', 'background', 'notes', 'trends', 'attachments'].includes(match[1])) {
        setActiveTab(match[1] as typeof activeTab);
      }
    }
  }, []);

  const handleTabChange = (newTab: typeof activeTab) => {
    setActiveTab(newTab);
    window.location.hash = `patient=${patientId}&tab=${newTab}`;
  };

  const loadPatientData = useCallback(async () => {
    if (!rootDirHandle) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await PatientService.loadPatient(rootDirHandle, folderName);
      if (data) {
        setPatient(data);
        // Cargar notas médicas del paciente para las gráficas y certificados
        const notes = await ClinicalNoteService.listPatientNotes(rootDirHandle, folderName);
        setPatientNotes(notes);
      } else {
        setError(`No se pudo leer el archivo paciente.json en ${folderName}`);
      }
    } catch (err) {
      console.error('Error cargando expediente:', err);
      setError('Error al leer el archivo físico del paciente.');
    } finally {
      setIsLoading(false);
    }
  }, [rootDirHandle, folderName]);

  useEffect(() => {
    loadPatientData();
    window.location.hash = `patient=${patientId}&tab=${activeTab}`;
  }, [loadPatientData, patientId, activeTab]);

  const handleSavePatient = async (updated: Patient) => {
    if (!rootDirHandle) return;
    try {
      const saved = await PatientService.savePatient(rootDirHandle, folderName, updated);
      setPatient(saved);
      await logAuditAction(
        'EDITAR_PACIENTE',
        `Actualización del expediente clínico de ${saved.demographics.firstName} ${saved.demographics.lastName} (${saved.id}).`,
        saved.id
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleDeletePatient = async () => {
    if (!rootDirHandle || !patient) return;
    setIsDeleting(true);
    try {
      await PatientIndexService.deletePatientRecord(rootDirHandle, patient.id, folderName);
      await logAuditAction(
        'ELIMINAR_PACIENTE',
        `Expediente completo eliminado del disco: ${patient.demographics.firstName} ${patient.demographics.lastName} (${patient.id}).`,
        patient.id
      );
      await reloadIndex();
      window.location.hash = '';
      onBack();
    } catch (err) {
      console.error('Error eliminando paciente:', err);
      alert('No se pudo eliminar el expediente del disco duro.');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Leyendo expediente físico desde el disco...</p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 text-sm">
          {error || 'No se encontró la información del paciente.'}
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => {
            window.location.hash = '';
            onBack();
          }}
        >
          Volver al Directorio
        </Button>
      </div>
    );
  }

  const age = PatientService.calculateAge(patient.demographics.birthDate);
  const whatsappNumber = (patient.demographics.whatsappPhone || patient.demographics.phone || '').replace(/\D/g, '');
  const cleanWA = whatsappNumber.length === 10 ? `52${whatsappNumber}` : whatsappNumber;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200 text-left font-sans">
      {/* Top Bar with Back Button, Certificate, Open in new tab and Delete */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => {
            window.location.hash = '';
            onBack();
          }}
        >
          Volver al Directorio
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Certificate Generator Button */}
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Award className="w-3.5 h-3.5 text-amber-600" />}
            onClick={() => setIsCertificateModalOpen(true)}
            className="bg-amber-50/70 border-amber-200 text-amber-900 hover:bg-amber-100 text-xs font-bold shadow-2xs"
            title="Generar e imprimir Certificado Médico oficial de salud"
          >
            Certificado Médico
          </Button>

          {/* Direct WhatsApp Button */}
          {whatsappNumber && (
            <a
              href={`https://wa.me/${cleanWA}?text=Hola%20${encodeURIComponent(patient.demographics.firstName)},%20le%20escribimos%20de%20Proyecto%20Celene%20Rosarito`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition-colors"
              title="Abrir chat en WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Paciente</span>
            </a>
          )}

          {/* Open in new window button */}
          <button
            onClick={() => window.open(window.location.href, '_blank')}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
            title="Abrir este expediente en una nueva ventana"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nueva Ventana</span>
          </button>

          {/* Delete Patient button */}
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
            onClick={() => setIsDeleteModalOpen(true)}
            className="text-rose-600 hover:bg-rose-50 text-xs"
            title="Eliminar este expediente del disco"
          >
            Eliminar
          </Button>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 pl-2 border-l border-slate-200">
            <Folder className="w-3.5 h-3.5" />
            <span className="font-mono text-slate-600 font-medium truncate max-w-[120px]">{folderName}</span>
          </div>
        </div>
      </div>

      {/* Patient Header Banner */}
      <Card className="p-6 bg-white border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-blue-500/20 shrink-0">
              {patient.demographics.firstName[0]}
              {patient.demographics.lastName[0]}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">
                  {patient.demographics.firstName} {patient.demographics.lastName}
                </h2>
                <Badge variant="primary" className="font-mono text-xs font-bold">
                  {patient.id}
                </Badge>
                <Badge variant="default" className="text-xs">
                  {patient.demographics.gender === 'M' ? 'Masculino' : patient.demographics.gender === 'F' ? 'Femenino' : 'Otro'}
                </Badge>
              </div>

              {/* Patient Basic Info Row */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                <span>
                  Fecha Nacimiento: <strong className="text-slate-900">{patient.demographics.birthDate || 'No registrada'}</strong>
                </span>
                <span>•</span>
                <span>
                  Edad: <strong className="text-slate-900">{age.displayText}</strong>
                </span>
                <span>•</span>
                <span>
                  Sexo: {patient.demographics.gender === 'M' ? 'Masculino' : patient.demographics.gender === 'F' ? 'Femenino' : 'Otro'}
                </span>
                <span>•</span>
                <span>Tipo Sangre: <strong className="text-slate-900">{patient.demographics.bloodType}</strong></span>
                {patient.demographics.phone && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {patient.demographics.phone}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Critical Alerts */}
          <div className="flex flex-col md:items-end justify-center space-y-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Alergias Críticas
            </div>
            {patient.allergies && patient.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 justify-start md:justify-end">
                {patient.allergies.map((alg) => (
                  <Badge key={alg} variant="danger" size="sm">
                    <AlertCircle className="w-3 h-3" />
                    {alg}
                  </Badge>
                ))}
              </div>
            ) : (
              <Badge variant="success" size="sm">
                Sin alergias conocidas
              </Badge>
            )}
          </div>
        </div>

        {/* Chronic Conditions Bar (Chips Inteligentes) */}
        {patient.chronicConditions && patient.chronicConditions.length > 0 && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              Condiciones Base:
            </span>
            {patient.chronicConditions.map((cond) => (
              <div
                key={cond.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/80 border border-blue-200/80 text-xs text-blue-900"
                title={`Tratamiento: ${cond.currentTreatment || 'Sin fármacos especificados'}`}
              >
                <strong className="font-semibold">{cond.name}</strong>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                  cond.status === 'Controlada' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {cond.status}
                </span>
                {cond.currentTreatment && (
                  <span className="text-[10px] text-blue-700">({cond.currentTreatment})</span>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white px-2 sm:px-4 rounded-xl border overflow-x-auto">
        <button
          onClick={() => handleTabChange('demographics')}
          className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'demographics'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          Ficha Demográfica
        </button>

        <button
          onClick={() => handleTabChange('background')}
          className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'background'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          Antecedentes Clínicos
        </button>

        <button
          onClick={() => handleTabChange('notes')}
          className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'notes'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Consultas ({patient.notesCount || 0})
        </button>

        <button
          onClick={() => handleTabChange('trends')}
          className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'trends'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Evolución y Gráficas
        </button>

        <button
          onClick={() => handleTabChange('attachments')}
          className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'attachments'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Paperclip className="w-4 h-4" />
          Estudios y Adjuntos ({patient.attachmentsCount || 0})
        </button>
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'demographics' && (
          <PatientDemographicsTab patient={patient} onSave={handleSavePatient} />
        )}

        {activeTab === 'background' && (
          <PatientBackgroundTab patient={patient} onSave={handleSavePatient} />
        )}

        {activeTab === 'notes' && (
          <PatientNotesTab
            patient={patient}
            patientFolderName={folderName}
            onNotesUpdated={loadPatientData}
          />
        )}

        {activeTab === 'trends' && (
          <PatientVitalTrendsTab patient={patient} notes={patientNotes} />
        )}

        {activeTab === 'attachments' && (
          <PatientAttachmentsTab
            patient={patient}
            patientFolderName={folderName}
            onAttachmentsUpdated={loadPatientData}
          />
        )}
      </div>

      {/* Modal Certificado Médico */}
      {isCertificateModalOpen && (
        <MedicalCertificateModal
          isOpen={isCertificateModalOpen}
          onClose={() => setIsCertificateModalOpen(false)}
          patient={patient}
          patientFolderName={folderName}
          latestNote={patientNotes.length > 0 ? patientNotes[patientNotes.length - 1] : null}
          onCertificateSaved={loadPatientData}
        />
      )}

      {/* Confirmation Modal to Delete Patient */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={`¿Eliminar expediente de ${patient.demographics.firstName} ${patient.demographics.lastName}?`}
        description="Esta acción eliminará de forma permanente la carpeta del paciente, sus notas médicas y todos sus adjuntos de tu disco duro."
        maxWidth="md"
      >
        <div className="space-y-4 text-left">
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs space-y-1">
            <p className="font-bold">⚠️ Atención:</p>
            <p>Se borrará la carpeta física <strong>{folderName}</strong> con todos sus archivos asociados.</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="md"
              isLoading={isDeleting}
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={handleDeletePatient}
            >
              Confirmar Eliminación
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
