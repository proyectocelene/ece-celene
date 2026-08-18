import { useState, useEffect } from 'react';
import { AttachmentService, type AttachmentItem } from '../api/attachmentService';
import { Modal, Button } from '@/shared/ui';
import { Download, FileText, AlertCircle } from 'lucide-react';

interface AttachmentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachment: AttachmentItem | null;
}

export function AttachmentViewerModal({
  isOpen,
  onClose,
  attachment,
}: AttachmentViewerModalProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activeUrl: string | null = null;

    if (isOpen && attachment) {
      setIsLoading(true);
      setError(null);

      AttachmentService.getAttachmentUrl(attachment.fileHandle)
        .then(({ url }) => {
          activeUrl = url;
          setObjectUrl(url);
        })
        .catch((err) => {
          console.error('Error generando URL del archivo:', err);
          setError('No se pudo previsualizar el archivo local.');
        })
        .finally(() => setIsLoading(false));
    } else {
      setObjectUrl(null);
    }

    return () => {
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [isOpen, attachment]);

  if (!attachment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={attachment.name}
      description={`Tamaño: ${attachment.formattedSize} • Modificado: ${new Date(attachment.lastModified).toLocaleDateString('es-MX')}`}
      maxWidth="4xl"
    >
      <div className="space-y-4">
        {/* Viewer content */}
        <div className="min-h-[500px] max-h-[70vh] bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200">
          {isLoading && (
            <div className="flex flex-col items-center gap-2 text-slate-500 text-xs">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Cargando archivo desde el disco...</span>
            </div>
          )}

          {error && (
            <div className="p-4 text-center text-rose-600 text-xs space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-rose-500" />
              <p>{error}</p>
            </div>
          )}

          {!isLoading && !error && objectUrl && (
            <>
              {attachment.type === 'image' && (
                <img
                  src={objectUrl}
                  alt={attachment.name}
                  className="max-w-full max-h-[68vh] object-contain rounded-lg shadow-xs"
                />
              )}

              {attachment.type === 'pdf' && (
                <iframe
                  src={objectUrl}
                  title={attachment.name}
                  className="w-full h-[68vh] border-0 rounded-lg"
                />
              )}

              {attachment.type !== 'image' && attachment.type !== 'pdf' && (
                <div className="text-center p-8 space-y-4">
                  <FileText className="w-16 h-16 text-slate-400 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-800">
                      Vista previa no disponible para este formato
                    </p>
                    <p className="text-xs text-slate-500">
                      Puedes descargar o abrir el archivo en su aplicación predeterminada.
                    </p>
                  </div>
                  <a
                    href={objectUrl}
                    download={attachment.name}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Descargar / Abrir Archivo
                  </a>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          {objectUrl && (
            <a
              href={objectUrl}
              download={attachment.name}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 font-medium"
            >
              <Download className="w-4 h-4" />
              Descargar copia
            </a>
          )}

          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar Visor
          </Button>
        </div>
      </div>
    </Modal>
  );
}
