import JSZip from 'jszip';

export interface BackupProgress {
  totalFiles: number;
  processedFiles: number;
  currentFileName: string;
  status: 'scanning' | 'compressing' | 'done' | 'error';
  errorMessage?: string;
}

export class BackupService {
  /**
   * Recorre recursivamente el directorio del espacio de trabajo y genera un archivo ZIP descargable.
   */
  static async exportWorkspaceZip(
    rootDirHandle: FileSystemDirectoryHandle,
    onProgress?: (progress: BackupProgress) => void
  ): Promise<Blob> {
    const zip = new JSZip();

    // 1. Contar y recolectar archivos
    if (onProgress) {
      onProgress({
        totalFiles: 0,
        processedFiles: 0,
        currentFileName: 'Escaneando archivos del expediente...',
        status: 'scanning',
      });
    }

    let fileCount = 0;
    let processedCount = 0;

    // Función auxiliar para agregar directorio a JSZip recursivamente
    const addDirectoryToZip = async (
      dirHandle: FileSystemDirectoryHandle,
      currentZipFolder: JSZip,
      currentPath: string
    ) => {
      // @ts-ignore - entries is standard in modern Chromium
      for await (const [name, handle] of dirHandle.entries()) {
        if (handle.kind === 'file') {
          fileCount++;
          const file = await (handle as FileSystemFileHandle).getFile();
          currentZipFolder.file(name, file);
          processedCount++;

          if (onProgress) {
            onProgress({
              totalFiles: fileCount,
              processedFiles: processedCount,
              currentFileName: `${currentPath}/${name}`,
              status: 'compressing',
            });
          }
        } else if (handle.kind === 'directory') {
          // Ignorar carpetas temporales o de sistema si existieran
          if (name === '.git' || name === 'node_modules') continue;

          const subFolder = currentZipFolder.folder(name);
          if (subFolder) {
            await addDirectoryToZip(
              handle as FileSystemDirectoryHandle,
              subFolder,
              `${currentPath}/${name}`
            );
          }
        }
      }
    };

    await addDirectoryToZip(rootDirHandle, zip, 'Expedientes');

    // 2. Generar el archivo ZIP comprimido
    const zipBlob = await zip.generateAsync(
      {
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      },
      (metadata) => {
        if (onProgress) {
          onProgress({
            totalFiles: fileCount,
            processedFiles: Math.round((metadata.percent / 100) * fileCount),
            currentFileName: `Comprimiendo respaldo (${Math.round(metadata.percent)}%)...`,
            status: 'compressing',
          });
        }
      }
    );

    if (onProgress) {
      onProgress({
        totalFiles: fileCount,
        processedFiles: fileCount,
        currentFileName: 'Respaldo completado.',
        status: 'done',
      });
    }

    return zipBlob;
  }

  /**
   * Dispara la descarga automática en el navegador del archivo ZIP de respaldo.
   */
  static downloadZipBlob(blob: Blob, customFileName?: string): void {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const filename = customFileName || `Respaldo_Proyecto_Celene_${dateStr}_${timeStr}.zip`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
