import { useState } from 'react';
import { useWorkspace } from '@/app/providers/WorkspaceContext';
import { useAuth } from '@/app/providers/AuthContext';
import { BackupService, type BackupProgress } from '../api/backupService';
import { Modal, Button } from '@/shared/ui';
import { Download, CheckCircle2, HardDrive, ShieldCheck } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BackupModal({ isOpen, onClose }: BackupModalProps) {
  const { rootDirHandle } = useWorkspace();
  const { logAuditAction } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<BackupProgress | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleStartBackup = async () => {
    if (!rootDirHandle) return;
    setIsExporting(true);
    setIsCompleted(false);

    try {
      const zipBlob = await BackupService.exportWorkspaceZip(rootDirHandle, (prog) => {
        setProgress(prog);
      });

      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
      const filename = `Respaldo_Proyecto_Celene_${dateStr}_${timeStr}.zip`;

      BackupService.downloadZipBlob(zipBlob, filename);
      setIsCompleted(true);

      await logAuditAction(
        'CREAR_BACKUP',
        `Respaldo completo de la base de datos descargado en archivo ZIP (${filename}).`
      );
    } catch (err) {
      console.error('Error generando respaldo ZIP:', err);
      alert('Ocurrió un error al generar el archivo de respaldo.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isExporting) onClose();
      }}
      title="Copia de Seguridad y Respaldo Local (1 Clic)"
      description="Genera un archivo comprimido .ZIP con todos los expedientes, consultas, notas, adjuntos y bitácoras."
      maxWidth="lg"
    >
      <div className="space-y-5 text-left font-sans">
        {/* Info card */}
        <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-950 space-y-2">
          <div className="flex items-center gap-2 font-bold text-blue-900 text-sm">
            <HardDrive className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Respaldo Autónomo y Privado</span>
          </div>
          <p className="leading-relaxed">
            Esta herramienta empaqueta toda la carpeta de tu clínica (incluyendo <code className="font-mono bg-white px-1 rounded">index_pacientes.json</code>, notas médicas, adjuntos de pacientes y bitácoras de auditoría) en un único archivo comprimido listo para guardarse en una memoria USB o disco externo.
          </p>
        </div>

        {/* Progress or Status */}
        {isExporting && progress && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>{progress.currentFileName}</span>
              {progress.totalFiles > 0 && (
                <span>
                  {progress.processedFiles} / {progress.totalFiles}
                </span>
              )}
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-150 rounded-full"
                style={{
                  width: `${
                    progress.totalFiles > 0
                      ? Math.min(100, (progress.processedFiles / progress.totalFiles) * 100)
                      : 40
                  }%`,
                }}
              />
            </div>
            <p className="text-[11px] text-slate-500 italic">
              Por favor no cierres esta ventana mientras se comprime el archivo...
            </p>
          </div>
        )}

        {isCompleted && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-950">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="text-sm font-bold text-emerald-900 block">¡Respaldo Generado Exitosamente!</strong>
              <p>El archivo ZIP ha sido descargado en tu carpeta de descargas del equipo.</p>
            </div>
          </div>
        )}

        {/* Security recommendation */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Se recomienda realizar un respaldo periódico al finalizar la jornada médica.</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isExporting}>
            Cerrar
          </Button>

          <Button
            variant="primary"
            size="md"
            leftIcon={isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            onClick={handleStartBackup}
            isLoading={isExporting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
          >
            {isCompleted ? 'Volver a Descargar' : 'Generar y Descargar Respaldo .ZIP'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
