import { useState, useEffect, useCallback, useMemo } from 'react';
import { useWorkspace } from '@/app/providers/WorkspaceContext';
import { useAuth } from '@/app/providers/AuthContext';
import { ClinicalNoteService } from '@/entities/clinical-note/api/clinicalNoteService';
import { CertificateService } from '@/entities/certificates/api/certificateService';
import { NotePermissionService } from '@/entities/clinical-note/lib/notePermissionService';
import { DateTimeService } from '@/shared/lib/dateTimeService';
import type { ClinicalNote } from '@/entities/clinical-note/model/schemas';
import type { Patient } from '@/entities/patient/model/schemas';
import type { MedicalCertificate } from '@/entities/certificates/model/schemas';
import { ClinicalNoteEditorModal } from './ClinicalNoteEditorModal';
import { ClinicalNoteViewerModal } from './ClinicalNoteViewerModal';
import { MedicalCertificateModal } from '@/features/certificates/ui/MedicalCertificateModal';
import { Button, Card, Badge } from '@/shared/ui';
import {
  FileText,
  Plus,
  Calendar,
  Stethoscope,
  Pill,
  ChevronRight,
  Edit3,
  Receipt,
  Lock,
  Award,
} from 'lucide-react';

interface PatientNotesTabProps {
  patient: Patient;
  patientFolderName: string;
  onNotesUpdated?: () => void;
}

type TimelineItem =
  | { kind: 'note'; date: string; data: ClinicalNote }
  | { kind: 'certificate'; date: string; data: MedicalCertificate };

export function PatientNotesTab({ patient, patientFolderName, onNotesUpdated }: PatientNotesTabProps) {
  const { rootDirHandle } = useWorkspace();
  const { currentUser } = useAuth();
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [certificates, setCertificates] = useState<MedicalCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<ClinicalNote | null>(null);
  const [selectedNote, setSelectedNote] = useState<ClinicalNote | null>(null);

  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<MedicalCertificate | null>(null);

  const loadData = useCallback(async () => {
    if (!rootDirHandle) return;
    setIsLoading(true);
    try {
      const [noteList, certList] = await Promise.all([
        ClinicalNoteService.listPatientNotes(rootDirHandle, patientFolderName),
        CertificateService.listPatientCertificates(rootDirHandle, patientFolderName),
      ]);
      setNotes(noteList);
      setCertificates(certList);
    } catch (err) {
      console.error('Error cargando historial de notas y certificados:', err);
    } finally {
      setIsLoading(false);
    }
  }, [rootDirHandle, patientFolderName]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const timelineItems: TimelineItem[] = useMemo(() => {
    const items: TimelineItem[] = [
      ...notes.map((n) => ({ kind: 'note' as const, date: n.date, data: n })),
      ...certificates.map((c) => ({ kind: 'certificate' as const, date: c.date, data: c })),
    ];
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [notes, certificates]);

  const handleNoteSaved = () => {
    loadData();
    setEditingNote(null);
    if (onNotesUpdated) {
      onNotesUpdated();
    }
  };

  const handleCertificateSaved = () => {
    loadData();
    setIsCertificateModalOpen(false);
    setSelectedCertificate(null);
    if (onNotesUpdated) {
      onNotesUpdated();
    }
  };

  const handleCreateNewNote = () => {
    setEditingNote(null);
    setIsEditorOpen(true);
  };

  const handleCreateNewCertificate = () => {
    setSelectedCertificate(null);
    setIsCertificateModalOpen(true);
  };

  const handleEditNote = (note: ClinicalNote) => {
    setSelectedNote(null);
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150 text-left font-sans">
      {/* Header bar con ambos botones alineados */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-800">Línea del Tiempo e Historial de Atenciones</h3>
          <p className="text-xs text-slate-500">
            {notes.length} {notes.length === 1 ? 'consulta' : 'consultas'} y {certificates.length} {certificates.length === 1 ? 'certificado médico' : 'certificados médicos'} registrados en disco.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Award className="w-4 h-4 text-emerald-600" />}
            onClick={handleCreateNewCertificate}
            className="text-emerald-950 bg-white hover:bg-emerald-50 border-emerald-300 font-bold text-xs shadow-2xs"
          >
            + Certificado Médico
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleCreateNewNote}
            className="shadow-sm shadow-blue-500/20 font-bold text-xs bg-blue-600 hover:bg-blue-700"
          >
            + Nueva Consulta / Receta
          </Button>
        </div>
      </div>

      {/* Timeline Items List */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          Cargando línea de tiempo y archivos desde el disco...
        </div>
      ) : timelineItems.length === 0 ? (
        <Card className="p-12 text-center space-y-4 border-dashed bg-slate-50/50">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="font-semibold text-slate-800 text-base">Sin atenciones registradas</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Registra una consulta médica o un certificado de salud para este paciente.
            </p>
          </div>
          <div className="flex justify-center gap-2">
            <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={handleCreateNewNote}>
              Registrar Primera Consulta
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {timelineItems.map((item, idx) => {
            const dateFormatted = DateTimeService.formatDate(item.date, {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            const timeFormatted = DateTimeService.formatTime(item.date);

            if (item.kind === 'certificate') {
              const cert = item.data;
              return (
                <Card
                  key={cert.id || idx}
                  className="p-4 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group bg-gradient-to-r from-emerald-50/30 via-white to-white border-emerald-200/80"
                  onClick={() => {
                    setSelectedCertificate(cert);
                    setIsCertificateModalOpen(true);
                  }}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1.5 text-left">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-950 border border-emerald-300">
                          <Award className="w-3 h-3 text-emerald-700" />
                          CERTIFICADO MÉDICO
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{dateFormatted} - {timeFormatted}</span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-400">({cert.fileName})</span>
                      </div>

                      <p className="text-sm font-bold text-slate-900 line-clamp-1">
                        Tipo: <span className="font-semibold text-slate-700">{cert.type}</span> • Para: <span className="font-semibold text-slate-700">{cert.recipient}</span>
                      </p>

                      <p className="text-xs text-slate-600 line-clamp-1">
                        Dictamen: <span className="font-medium text-emerald-900">{cert.dictum}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100 justify-between md:justify-end">
                      <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                        Por: <strong>{cert.attendingDoctorName}</strong>
                      </span>

                      <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
                        <span>Ver / Reimprimir</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            }

            // Note Item
            const note = item.data;
            return (
              <Card
                key={note.id || idx}
                className="p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group bg-white"
                onClick={() => setSelectedNote(note)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Left info */}
                  <div className="space-y-1.5 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="primary" size="sm" className="font-bold">
                        {note.noteType}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{dateFormatted} - {timeFormatted}</span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400">({note.fileName})</span>
                    </div>

                    {note.subjective?.reasonForVisit && (
                      <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                        Motivo: <span className="font-normal text-slate-600">{note.subjective.reasonForVisit}</span>
                      </p>
                    )}

                    {/* Diagnoses preview */}
                    {note.diagnoses && note.diagnoses.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <Stethoscope className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        {note.diagnoses.map((d, i) => (
                          <Badge key={i} variant="default" size="sm" className="font-medium">
                            {d.description}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right quick stats and action buttons */}
                  <div className="flex items-center gap-3 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100 justify-between md:justify-end">
                    {/* Vitals summary */}
                    {note.vitalSigns?.bpSystolic && (
                      <div className="text-right text-xs space-y-0.5 hidden sm:block">
                        <span className="text-slate-400 block font-medium">T.A.</span>
                        <span className="font-bold text-slate-700">
                          {note.vitalSigns.bpSystolic}/{note.vitalSigns.bpDiastolic}
                        </span>
                      </div>
                    )}

                    {note.plan?.prescriptions && note.plan.prescriptions.length > 0 && (
                      <Badge variant="success" size="sm" className="gap-1 font-bold">
                        <Pill className="w-3 h-3" />
                        {note.plan.prescriptions.length} Recetados
                      </Badge>
                    )}

                    {note.receipt && note.receipt.totalAmount !== undefined && (
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-bold font-mono px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800"
                        title={`Recibo: Folio ${note.receipt.receiptFolio || 'Generado'} • ${note.receipt.paymentMethod}`}
                      >
                        <Receipt className="w-3 h-3 text-emerald-600" />
                        ${note.receipt.totalAmount} MXN
                      </span>
                    )}

                    {/* Quick Edit Action Button */}
                    {(() => {
                      const perm = NotePermissionService.checkEditPermission(note, currentUser);
                      if (perm.canEdit) {
                        return (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditNote(note);
                            }}
                            className="p-1.5 px-2 rounded-lg text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                            title={`Editar consulta (Cierra en ${perm.hoursRemaining}h)`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Editar ({perm.hoursRemaining}h)</span>
                          </button>
                        );
                      }
                      return (
                        <span
                          className="p-1.5 px-2 rounded-lg bg-slate-100 text-slate-400 border border-slate-200 text-xs font-medium flex items-center gap-1 cursor-not-allowed select-none"
                          title={perm.reason}
                        >
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span className="hidden sm:inline">{perm.isTimeLocked ? 'Cerrada (>48h)' : 'Solo Autor'}</span>
                        </span>
                      );
                    })()}

                    <div className="flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                      <span>Ver / Imprimir</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Editor de Consulta */}
      <ClinicalNoteEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingNote(null);
        }}
        patient={patient}
        patientFolderName={patientFolderName}
        initialNote={editingNote}
        pastNotes={notes}
        onNoteSaved={handleNoteSaved}
      />

      {/* Modal Visor de Consulta */}
      <ClinicalNoteViewerModal
        isOpen={!!selectedNote}
        onClose={() => setSelectedNote(null)}
        note={selectedNote}
        patient={patient}
        onEditNote={handleEditNote}
      />

      {/* Modal de Certificado Médico */}
      {isCertificateModalOpen && (
        <MedicalCertificateModal
          isOpen={isCertificateModalOpen}
          onClose={() => {
            setIsCertificateModalOpen(false);
            setSelectedCertificate(null);
          }}
          patient={patient}
          patientFolderName={patientFolderName}
          latestNote={notes[0] || null}
          existingCertificate={selectedCertificate}
          onCertificateSaved={handleCertificateSaved}
        />
      )}
    </div>
  );
}
