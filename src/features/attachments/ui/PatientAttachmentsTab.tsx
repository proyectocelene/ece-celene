import { useState, useEffect, useCallback } from 'react';
import { useWorkspace } from '@/app/providers/WorkspaceContext';
import { useAuth } from '@/app/providers/AuthContext';
import { AttachmentService, type AttachmentItem } from '../api/attachmentService';
import type { Patient } from '@/entities/patient/model/schemas';
import { FileUploadZone } from './FileUploadZone';
import { AttachmentViewerModal } from './AttachmentViewerModal';
import { Button, Card, Badge } from '@/shared/ui';
import {
  Paperclip,
  FileText,
  FileImage,
  FileSpreadsheet,
  File,
  Trash2,
  Eye,
  Plus,
} from 'lucide-react';

interface PatientAttachmentsTabProps {
  patient: Patient;
  patientFolderName: string;
  onAttachmentsUpdated?: () => void;
}

export function PatientAttachmentsTab({
  patient,
  patientFolderName,
  onAttachmentsUpdated,
}: PatientAttachmentsTabProps) {
  const { rootDirHandle } = useWorkspace();
  const { logAuditAction } = useAuth();
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<AttachmentItem | null>(null);

  const loadAttachments = useCallback(async () => {
    if (!rootDirHandle) return;
    setIsLoading(true);
    try {
      const list = await AttachmentService.listAttachments(rootDirHandle, patientFolderName);
      setAttachments(list);
    } catch (err) {
      console.error('Error cargando adjuntos:', err);
    } finally {
      setIsLoading(false);
    }
  }, [rootDirHandle, patientFolderName]);

  useEffect(() => {
    loadAttachments();
  }, [loadAttachments]);

  const handleUpload = async (file: File, customName?: string) => {
    if (!rootDirHandle) return;
    setIsUploading(true);
    try {
      const saved = await AttachmentService.saveAttachment(rootDirHandle, patientFolderName, file, customName);
      await logAuditAction(
        'SUBIR_ADJUNTO',
        `Archivo adjuntado '${saved.name}' (${saved.formattedSize}) al expediente de ${patient.demographics.firstName} ${patient.demographics.lastName}.`,
        patient.id
      );
      await loadAttachments();
      setShowUploadZone(false);
      if (onAttachmentsUpdated) {
        onAttachmentsUpdated();
      }
    } catch (err) {
      console.error('Error guardando archivo físico:', err);
      alert('Error al copiar el archivo a la carpeta /adjuntos/.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (fileName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!rootDirHandle) return;
    if (!confirm(`¿Estás seguro de eliminar el archivo "${fileName}" de tu disco?`)) {
      return;
    }

    try {
      await AttachmentService.deleteAttachment(rootDirHandle, patientFolderName, fileName);
      await logAuditAction(
        'ELIMINAR_ADJUNTO',
        `Archivo eliminado '${fileName}' del expediente de ${patient.demographics.firstName} ${patient.demographics.lastName}.`,
        patient.id
      );
      await loadAttachments();
      if (onAttachmentsUpdated) {
        onAttachmentsUpdated();
      }
    } catch (err) {
      console.error('Error eliminando adjunto:', err);
      alert('Error al eliminar el archivo.');
    }
  };

  const getFileIcon = (type: AttachmentItem['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-rose-500" />;
      case 'image':
        return <FileImage className="w-6 h-6 text-blue-500" />;
      case 'document':
        return <FileSpreadsheet className="w-6 h-6 text-emerald-500" />;
      default:
        return <File className="w-6 h-6 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Estudios de Laboratorio e Imágenes</h3>
          <p className="text-xs text-slate-500">
            {attachments.length} {attachments.length === 1 ? 'archivo almacenado' : 'archivos almacenados'} en la subcarpeta <span className="font-mono text-slate-600 font-medium">/adjuntos/</span>.
          </p>
        </div>

        <Button
          variant={showUploadZone ? 'outline' : 'primary'}
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setShowUploadZone(!showUploadZone)}
          className={!showUploadZone ? 'shadow-sm shadow-blue-500/20' : ''}
        >
          {showUploadZone ? 'Ocultar Subida' : '+ Subir Archivo / Estudio'}
        </Button>
      </div>

      {/* Upload Drop Zone */}
      {showUploadZone && (
        <Card className="p-6 bg-slate-50/50 border-blue-100 animate-in fade-in duration-150">
          <FileUploadZone onUpload={handleUpload} isUploading={isUploading} />
        </Card>
      )}

      {/* Attachments List */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          Cargando archivos desde la carpeta local...
        </div>
      ) : attachments.length === 0 ? (
        <Card className="p-12 text-center space-y-4 border-dashed bg-slate-50/50">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Paperclip className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="font-semibold text-slate-800 text-base">Sin estudios o adjuntos</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Puedes subir resultados de laboratorio (PDF), radiografías, ultrasonidos o fotos clínicas directamente a su expediente.
            </p>
          </div>
          <Button
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowUploadZone(true)}
          >
            Subir Primer Estudio
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {attachments.map((file) => (
            <Card
              key={file.name}
              onClick={() => setSelectedAttachment(file)}
              className="p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    {getFileIcon(file.type)}
                  </div>
                  <Badge variant="default" size="sm" className="uppercase font-mono text-[10px]">
                    {file.name.split('.').pop()}
                  </Badge>
                </div>

                <div className="text-left space-y-1">
                  <p className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors line-clamp-2" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {new Date(file.lastModified).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono">{file.formattedSize}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedAttachment(file)}
                    className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    title="Ver archivo"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(file.name, e)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Eliminar archivo del disco"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Viewer Modal */}
      <AttachmentViewerModal
        isOpen={!!selectedAttachment}
        onClose={() => setSelectedAttachment(null)}
        attachment={selectedAttachment}
      />
    </div>
  );
}
