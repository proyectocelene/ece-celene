import {
  type Patient,
  type PatientIndexEntry,
  type PatientIndexFile,
  PatientIndexFileSchema,
  PatientSchema,
} from '../model/schemas';
import {
  readJsonFile,
  writeJsonFile,
  listDirectories,
  buildPatientFolderName,
  getOrCreateDirectory,
  getDirectory,
} from '@/shared/api/fsUtils';

const INDEX_FILE_NAME = 'index_pacientes.json';

export class PatientIndexService {
  /**
   * Obtiene o inicializa el índice de pacientes desde la carpeta raíz.
   */
  static async loadOrRebuildIndex(
    rootDirHandle: FileSystemDirectoryHandle
  ): Promise<PatientIndexFile> {
    try {
      const existingIndex = await readJsonFile<PatientIndexFile>(
        rootDirHandle,
        INDEX_FILE_NAME,
        PatientIndexFileSchema
      );

      if (existingIndex) {
        return existingIndex;
      }
    } catch (err) {
      console.warn('[PatientIndexService] Índice corrupto o desactualizado. Reconstruyendo...', err);
    }

    return await this.rebuildIndexFromFolders(rootDirHandle);
  }

  /**
   * Escanea el sistema de archivos físico y reconstruye el archivo index_pacientes.json
   */
  static async rebuildIndexFromFolders(
    rootDirHandle: FileSystemDirectoryHandle
  ): Promise<PatientIndexFile> {
    const dirs = await listDirectories(rootDirHandle);
    const indexEntries: PatientIndexEntry[] = [];

    for (const dir of dirs) {
      if (dir.name.startsWith('PAC-')) {
        try {
          const patientData = await readJsonFile<Patient>(dir, 'paciente.json', PatientSchema);
          if (patientData) {
            indexEntries.push({
              id: patientData.id,
              folderName: dir.name,
              fullName: `${patientData.demographics.firstName} ${patientData.demographics.lastName}`.trim(),
              birthDate: patientData.demographics.birthDate,
              gender: patientData.demographics.gender,
              phone: patientData.demographics.phone,
              hasWhatsApp: patientData.demographics.hasWhatsApp,
              curpOrId: patientData.demographics.curpOrId,
              allergiesCount: patientData.allergies?.length ?? 0,
              notesCount: patientData.notesCount ?? 0,
              chronicConditionsCount: patientData.chronicConditions?.length ?? patientData.activeConditions?.length ?? 0,
              updatedAt: patientData.updatedAt,
            });
          }
        } catch (err) {
          console.error(`[rebuildIndex] Error leyendo paciente en carpeta ${dir.name}:`, err);
        }
      }
    }

    indexEntries.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const newIndex: PatientIndexFile = {
      version: '1.0.0',
      lastSync: new Date().toISOString(),
      totalPatients: indexEntries.length,
      patients: indexEntries,
    };

    await writeJsonFile(rootDirHandle, INDEX_FILE_NAME, newIndex);
    return newIndex;
  }

  /**
   * Registra o actualiza un paciente en el índice y guarda en disco.
   */
  static async updatePatientInIndex(
    rootDirHandle: FileSystemDirectoryHandle,
    patient: Patient,
    folderName: string
  ): Promise<PatientIndexFile> {
    const currentIndex = await this.loadOrRebuildIndex(rootDirHandle);

    const existingIndexPos = currentIndex.patients.findIndex((p) => p.id === patient.id);
    const newEntry: PatientIndexEntry = {
      id: patient.id,
      folderName,
      fullName: `${patient.demographics.firstName} ${patient.demographics.lastName}`.trim(),
      birthDate: patient.demographics.birthDate,
      gender: patient.demographics.gender,
      phone: patient.demographics.phone,
      hasWhatsApp: patient.demographics.hasWhatsApp,
      curpOrId: patient.demographics.curpOrId,
      allergiesCount: patient.allergies?.length ?? 0,
      notesCount: patient.notesCount ?? 0,
      chronicConditionsCount: patient.chronicConditions?.length ?? patient.activeConditions?.length ?? 0,
      updatedAt: patient.updatedAt,
    };

    let updatedPatients: PatientIndexEntry[];
    if (existingIndexPos >= 0) {
      updatedPatients = [...currentIndex.patients];
      updatedPatients[existingIndexPos] = newEntry;
    } else {
      updatedPatients = [newEntry, ...currentIndex.patients];
    }

    const updatedIndex: PatientIndexFile = {
      ...currentIndex,
      lastSync: new Date().toISOString(),
      totalPatients: updatedPatients.length,
      patients: updatedPatients,
    };

    await writeJsonFile(rootDirHandle, INDEX_FILE_NAME, updatedIndex);
    return updatedIndex;
  }

  /**
   * Elimina completamente la carpeta física del paciente y lo quita de index_pacientes.json
   */
  static async deletePatientRecord(
    rootDirHandle: FileSystemDirectoryHandle,
    patientId: string,
    folderName: string
  ): Promise<PatientIndexFile> {
    try {
      const patientDir = await getDirectory(rootDirHandle, folderName);
      if (patientDir) {
        // Eliminar subcarpeta física completa
        await rootDirHandle.removeEntry(folderName, { recursive: true });
      }
    } catch (err) {
      console.warn(`[deletePatientRecord] Error al remover carpeta ${folderName}:`, err);
    }

    // Reconstruir o actualizar índice
    const currentIndex = await this.loadOrRebuildIndex(rootDirHandle);
    const filtered = currentIndex.patients.filter((p) => p.id !== patientId && p.folderName !== folderName);

    const updatedIndex: PatientIndexFile = {
      version: '1.0.0',
      lastSync: new Date().toISOString(),
      totalPatients: filtered.length,
      patients: filtered,
    };

    await writeJsonFile(rootDirHandle, INDEX_FILE_NAME, updatedIndex);
    return updatedIndex;
  }

  /**
   * Genera el siguiente ID correlativo para un nuevo paciente (ej: PAC-00101)
   */
  static generateNextPatientId(currentIndex: PatientIndexFile): string {
    let maxNumber = 100;
    for (const p of currentIndex.patients) {
      const match = p.id.match(/^PAC-(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    }
    return `PAC-${String(maxNumber + 1).padStart(5, '0')}`;
  }

  /**
   * Crea físicamente la estructura de carpetas de un paciente y guarda su `paciente.json`.
   */
  static async createPatientRecord(
    rootDirHandle: FileSystemDirectoryHandle,
    patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'notesCount' | 'attachmentsCount' | 'schemaVersion' | 'chronicConditions' | 'activeConditions' | 'allergies'> & {
      id?: string;
      chronicConditions?: Patient['chronicConditions'];
      activeConditions?: Patient['activeConditions'];
      allergies?: Patient['allergies'];
    }
  ): Promise<{ patient: Patient; folderName: string; patientDirHandle: FileSystemDirectoryHandle }> {
    const currentIndex = await this.loadOrRebuildIndex(rootDirHandle);
    const id = patientData.id || this.generateNextPatientId(currentIndex);
    const now = new Date().toISOString();

    const fullPatient: Patient = {
      ...patientData,
      id,
      schemaVersion: '1.0.0',
      createdAt: now,
      updatedAt: now,
      notesCount: 0,
      attachmentsCount: 0,
      allergies: patientData.allergies || [],
      activeConditions: patientData.activeConditions || [],
      chronicConditions: patientData.chronicConditions || [],
      background: patientData.background || { ahf: '', app: '', apnp: '', ago: '' },
    };

    const folderName = buildPatientFolderName(
      fullPatient.id,
      fullPatient.demographics.firstName,
      fullPatient.demographics.lastName
    );

    const patientDirHandle = await getOrCreateDirectory(rootDirHandle, folderName);

    await getOrCreateDirectory(patientDirHandle, 'notas');
    await getOrCreateDirectory(patientDirHandle, 'adjuntos');

    await writeJsonFile(patientDirHandle, 'paciente.json', fullPatient);
    await this.updatePatientInIndex(rootDirHandle, fullPatient, folderName);

    return { patient: fullPatient, folderName, patientDirHandle };
  }
}
