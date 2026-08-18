import {
  type MedicalCertificate,
  MedicalCertificateSchema,
} from '../model/schemas';
import {
  getDirectory,
  getOrCreateDirectory,
  listFiles,
  readJsonFile,
  writeJsonFile,
} from '@/shared/api/fsUtils';
import { DateTimeService } from '@/shared/lib/dateTimeService';

export class CertificateService {
  /**
   * Genera un nombre de archivo único y cronológico para el certificado en zona horaria America/Tijuana
   * Ej: 2026-08-17_1935_certificado.json
   */
  static generateCertificateFileName(dateISO: string): string {
    const formatted = DateTimeService.formatDate(dateISO, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    // formatted is typically DD/MM/YYYY or YYYY-MM-DD
    const parts = formatted.split(/[/ -]/);
    let y = parts[0];
    let m = parts[1];
    let d = parts[2];
    if (y.length === 2 && d.length === 4) {
      // DD/MM/YYYY format
      const temp = y;
      y = d;
      d = temp;
    }

    const timeStr = DateTimeService.formatTime(dateISO).replace(':', '');
    return `${y}-${m}-${d}_${timeStr}_certificado.json`;
  }

  /**
   * Lee todos los certificados guardados dentro de /certificados/ del paciente
   */
  static async listPatientCertificates(
    rootDirHandle: FileSystemDirectoryHandle,
    patientFolderName: string
  ): Promise<MedicalCertificate[]> {
    const patientDir = await getDirectory(rootDirHandle, patientFolderName);
    if (!patientDir) return [];

    const certs: MedicalCertificate[] = [];
    const certsDir = await getDirectory(patientDir, 'certificados');
    if (certsDir) {
      const files = await listFiles(certsDir, '.json');
      for (const fileHandle of files) {
        try {
          const cert = await readJsonFile<MedicalCertificate>(certsDir, fileHandle.name, MedicalCertificateSchema);
          if (cert) {
            certs.push(cert);
          }
        } catch (err) {
          console.error(`[listPatientCertificates] Error leyendo certificado ${fileHandle.name}:`, err);
        }
      }
    }

    certs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return certs;
  }

  /**
   * Guarda un certificado médico en la subcarpeta /certificados/ del paciente
   */
  static async savePatientCertificate(
    rootDirHandle: FileSystemDirectoryHandle,
    patientFolderName: string,
    certData: Omit<MedicalCertificate, 'fileName' | 'createdAt' | 'updatedAt'> & {
      fileName?: string;
      createdAt?: string;
      updatedAt?: string;
    }
  ): Promise<MedicalCertificate> {
    const patientDir = await getDirectory(rootDirHandle, patientFolderName);
    if (!patientDir) {
      throw new Error(`No se encontró la carpeta del paciente ${patientFolderName}`);
    }

    const certsDir = await getOrCreateDirectory(patientDir, 'certificados');
    const now = new Date().toISOString();
    const fileName = certData.fileName || this.generateCertificateFileName(certData.date || now);

    const fullCert: MedicalCertificate = {
      ...certData,
      fileName,
      createdAt: certData.createdAt || now,
      updatedAt: now,
    };

    await writeJsonFile(certsDir, fileName, fullCert);
    return fullCert;
  }
}
