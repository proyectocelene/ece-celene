import {
  getDirectory,
  getOrCreateDirectory,
  listFiles,
} from '@/shared/api/fsUtils';
import { PatientService } from '@/entities/patient/api/patientService';

export interface AttachmentItem {
  name: string;
  size: number;
  formattedSize: string;
  lastModified: string;
  type: 'pdf' | 'image' | 'document' | 'other';
  mimeType: string;
  fileHandle: FileSystemFileHandle;
}

export class AttachmentService {
  /**
   * Determina la categoría del archivo según su extensión
   */
  static getFileType(fileName: string): 'pdf' | 'image' | 'document' | 'other' {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg'].includes(ext)) return 'image';
    if (['doc', 'docx', 'txt', 'rtf', 'odt', 'csv', 'xlsx'].includes(ext)) return 'document';
    return 'other';
  }

  /**
   * Formatea el tamaño en bytes a KB o MB
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  /**
   * Lista todos los archivos adjuntos dentro de /adjuntos/ de un paciente
   */
  static async listAttachments(
    rootDirHandle: FileSystemDirectoryHandle,
    patientFolderName: string
  ): Promise<AttachmentItem[]> {
    const patientDir = await getDirectory(rootDirHandle, patientFolderName);
    if (!patientDir) return [];

    const attachmentsDir = await getDirectory(patientDir, 'adjuntos');
    if (!attachmentsDir) return [];

    const fileHandles = await listFiles(attachmentsDir);
    const attachments: AttachmentItem[] = [];

    for (const handle of fileHandles) {
      try {
        const file = await handle.getFile();
        attachments.push({
          name: handle.name,
          size: file.size,
          formattedSize: this.formatFileSize(file.size),
          lastModified: new Date(file.lastModified).toISOString(),
          type: this.getFileType(handle.name),
          mimeType: file.type || 'application/octet-stream',
          fileHandle: handle,
        });
      } catch (err) {
        console.error(`Error leyendo metadata de archivo ${handle.name}:`, err);
      }
    }

    // Ordenar de más reciente a más antiguo
    attachments.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
    return attachments;
  }

  /**
   * Copia y guarda un archivo físico en la subcarpeta /adjuntos/ del paciente
   */
  static async saveAttachment(
    rootDirHandle: FileSystemDirectoryHandle,
    patientFolderName: string,
    file: File,
    customName?: string
  ): Promise<AttachmentItem> {
    const patientDir = await getDirectory(rootDirHandle, patientFolderName);
    if (!patientDir) {
      throw new Error(`No se encontró la carpeta del paciente ${patientFolderName}`);
    }

    const attachmentsDir = await getOrCreateDirectory(patientDir, 'adjuntos');

    // Sanitizar nombre de archivo manteniendo extensión
    const originalExt = file.name.split('.').pop() || '';
    let targetFileName = customName ? customName.trim() : file.name;
    if (customName && originalExt && !customName.toLowerCase().endsWith(`.${originalExt.toLowerCase()}`)) {
      targetFileName = `${customName}.${originalExt}`;
    }

    targetFileName = targetFileName.replace(/[/\\?%*:|"<>]/g, '_');

    const fileHandle = await attachmentsDir.getFileHandle(targetFileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(file);
    await writable.close();

    // Actualizar paciente.json con el nuevo contador de adjuntos
    const allAttachments = await this.listAttachments(rootDirHandle, patientFolderName);
    const existingPatient = await PatientService.loadPatient(rootDirHandle, patientFolderName);

    if (existingPatient) {
      const updatedPatient = {
        ...existingPatient,
        attachmentsCount: allAttachments.length,
        updatedAt: new Date().toISOString(),
      };
      await PatientService.savePatient(rootDirHandle, patientFolderName, updatedPatient);
    }

    return {
      name: targetFileName,
      size: file.size,
      formattedSize: this.formatFileSize(file.size),
      lastModified: new Date().toISOString(),
      type: this.getFileType(targetFileName),
      mimeType: file.type,
      fileHandle,
    };
  }

  /**
   * Elimina un archivo adjunto del disco y actualiza el contador en paciente.json
   */
  static async deleteAttachment(
    rootDirHandle: FileSystemDirectoryHandle,
    patientFolderName: string,
    fileName: string
  ): Promise<void> {
    const patientDir = await getDirectory(rootDirHandle, patientFolderName);
    if (!patientDir) return;

    const attachmentsDir = await getDirectory(patientDir, 'adjuntos');
    if (!attachmentsDir) return;

    await attachmentsDir.removeEntry(fileName);

    // Actualizar paciente.json con el nuevo conteo
    const allAttachments = await this.listAttachments(rootDirHandle, patientFolderName);
    const existingPatient = await PatientService.loadPatient(rootDirHandle, patientFolderName);

    if (existingPatient) {
      const updatedPatient = {
        ...existingPatient,
        attachmentsCount: allAttachments.length,
        updatedAt: new Date().toISOString(),
      };
      await PatientService.savePatient(rootDirHandle, patientFolderName, updatedPatient);
    }
  }

  /**
   * Genera un ObjectURL temporal en memoria para previsualizar el archivo
   */
  static async getAttachmentUrl(fileHandle: FileSystemFileHandle): Promise<{ url: string; file: File }> {
    const file = await fileHandle.getFile();
    const url = URL.createObjectURL(file);
    return { url, file };
  }
}
