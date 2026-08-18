import {
  type Patient,
  PatientSchema,
} from '../model/schemas';
import {
  readJsonFile,
  writeJsonFile,
  getDirectory,
} from '@/shared/api/fsUtils';
import { PatientIndexService } from './patientIndexService';
import { DateTimeService } from '@/shared/lib/dateTimeService';

export class PatientService {
  /**
   * Carga el archivo paciente.json desde la subcarpeta del paciente.
   */
  static async loadPatient(
    rootDirHandle: FileSystemDirectoryHandle,
    folderName: string
  ): Promise<Patient | null> {
    const patientDir = await getDirectory(rootDirHandle, folderName);
    if (!patientDir) return null;

    return await readJsonFile<Patient>(patientDir, 'paciente.json', PatientSchema);
  }

  /**
   * Guarda los cambios en paciente.json y actualiza el index_pacientes.json en la raíz.
   */
  static async savePatient(
    rootDirHandle: FileSystemDirectoryHandle,
    folderName: string,
    updatedData: Patient
  ): Promise<Patient> {
    const patientDir = await getDirectory(rootDirHandle, folderName);
    if (!patientDir) {
      throw new Error(`No se encontró la carpeta del paciente: ${folderName}`);
    }

    const patientWithTimestamp: Patient = {
      ...updatedData,
      updatedAt: new Date().toISOString(),
    };

    // Guardar paciente.json
    await writeJsonFile(patientDir, 'paciente.json', patientWithTimestamp);

    // Actualizar index_pacientes.json
    await PatientIndexService.updatePatientInIndex(rootDirHandle, patientWithTimestamp, folderName);

    return patientWithTimestamp;
  }

  /**
   * Calcula la edad en años y meses a partir de la fecha de nacimiento (YYYY-MM-DD)
   * con precisión garantizada en zona horaria America/Tijuana.
   */
  static calculateAge(birthDateStr?: string): { years: number; months: number; displayText: string } {
    return DateTimeService.calculateAge(birthDateStr);
  }
}
