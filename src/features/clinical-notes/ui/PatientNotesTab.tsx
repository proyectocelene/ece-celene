import { useState, useEffect, useCallback } from 'react';
import { useWorkspace } from '@/app/providers/WorkspaceContext';
import { ClinicalNoteService } from '@/entities/clinical-note/api/clinicalNoteService';
import type { ClinicalNote } from '@/entities/clinical-note/model/schemas';
import type { Patient } from '@/entities/patient/model/schemas';
import { ClinicalNoteEditorModal } from './ClinicalNoteEditorModal';
import { ClinicalNoteViewerModal } from './ClinicalNoteViewerModal';
import { Button, Card, Badge } from '@/shared/ui';
import {
  FileText,
  Plus,
  Calendar,
  Stethoscope,
  Pill,
  ChevronRight,
  Edit3,
} from 'lucide-react';

interface PatientNotesTabProps {
  patient: Patient;
  patientFolderName: string;
  onNotesUpdated?: () => void;
}

export function PatientNotesTab({ patient, patientFolderName, onNotesUpdated }: PatientNotesTabProps) {
  const { rootDirHandle } = useWorkspace();
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<ClinicalNote | null>(null);
  const [selectedNote, setSelectedNote] = useState<ClinicalNote | null>(null);

  const loadNotes = useCallback(async () => {
    if (!rootDirHandle) return;
    setIsLoading(true);
    try {
      const list = await ClinicalNoteService.listPatientNotes(rootDirHandle, patientFolderName);
      setNotes(list);
    } catch (err) {
      console.error('Error cargando notas de consulta:', err);
    } finally {
      setIsLoading(false);
    }
  }, [rootDirHandle, patientFolderName]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleNoteSaved = () => {
    loadNotes();
    setEditingNote(null);
    if (onNotesUpdated) {
      onNotesUpdated();
    }
  };

  const handleCreateNew = () => {
    setEditingNote(null);
    setIsEditorOpen(true);
  };

  const handleEditNote = (note: ClinicalNote) => {
    setSelectedNote(null);
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Historial de Consultas Médicas</h3>
          <p className="text-xs text-slate-500">
            {notes.length} {notes.length === 1 ? 'consulta registrada' : 'consultas registradas'} en archivos JSON independientes.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleCreateNew}
          className="shadow-sm shadow-blue-500/20 font-bold"
        >
          + Nueva Consulta / Receta
        </Button>
      </div>

      {/* Notes List */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          Cargando notas médicas desde el disco...
        </div>
      ) : notes.length === 0 ? (
        <Card className="p-12 text-center space-y-4 border-dashed bg-slate-50/50">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="font-semibold text-slate-800 text-base">Sin consultas registradas</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Registra la primera atención médica de este paciente para generar su archivo físico de consulta y receta.
            </p>
          </div>
          <Button
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleCreateNew}
          >
            Registrar Primera Consulta
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => {
            const dateFormatted = new Date(note.date).toLocaleDateString('es-MX', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            const timeFormatted = new Date(note.date).toLocaleTimeString('es-MX', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <Card
                key={note.id}
                className="p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group bg-white"
                onClick={() => setSelectedNote(note)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

                    {/* Quick Edit Action Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditNote(note);
                      }}
                      className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50 border border-amber-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Editar esta consulta o receta"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Editar</span>
                    </button>

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

      {/* Modal Editor (Para crear nueva o editar existente) */}
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

      {/* Modal Viewer */}
      <ClinicalNoteViewerModal
        isOpen={!!selectedNote}
        onClose={() => setSelectedNote(null)}
        note={selectedNote}
        patient={patient}
        onEditNote={handleEditNote}
      />
    </div>
  );
}
