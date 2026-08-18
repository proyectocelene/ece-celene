import {
  type ClinicalNote,
  type VitalSigns,
  ClinicalNoteSchema,
} from '../model/schemas';
import {
  getDirectory,
  getOrCreateDirectory,
  listFiles,
  readJsonFile,
  writeJsonFile,
} from '@/shared/api/fsUtils';
import { PatientService } from '@/entities/patient/api/patientService';
import { DateTimeService } from '@/shared/lib/dateTimeService';

export class ClinicalNoteService {
  /**
   * Genera un nombre de archivo único y cronológico para la nota en zona horaria America/Tijuana:
   * Ej: 2026-08-17_1926_consulta.json
   */
  static generateNoteFileName(dateISO: string): string {
    return DateTimeService.generateNoteFileName(dateISO);
  }

  /**
   * Calcula el Índice de Masa Corporal (IMC) y su clasificación según la OMS
   */
  static calculateBMI(
    weightKg?: number,
    heightCm?: number
  ): { bmi: number; category: string; color: 'blue' | 'emerald' | 'amber' | 'rose' } | null {
    if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) return null;
    const heightM = heightCm / 100;
    const bmi = Number((weightKg / (heightM * heightM)).toFixed(2));

    if (bmi < 18.5) return { bmi, category: 'Bajo peso', color: 'blue' };
    if (bmi < 25) return { bmi, category: 'Peso normal', color: 'emerald' };
    if (bmi < 30) return { bmi, category: 'Sobrepeso', color: 'amber' };
    if (bmi < 35) return { bmi, category: 'Obesidad grado I', color: 'rose' };
    if (bmi < 40) return { bmi, category: 'Obesidad grado II', color: 'rose' };
    return { bmi, category: 'Obesidad grado III (Mórbida)', color: 'rose' };
  }

  /**
   * Lee todas las notas de consulta dentro de /notas/ o en la raíz de la carpeta del paciente.
   * Retorna las notas ordenadas cronológicamente (la más reciente primero).
   */
  static async listPatientNotes(
    rootDirHandle: FileSystemDirectoryHandle,
    patientFolderName: string
  ): Promise<ClinicalNote[]> {
    const patientDir = await getDirectory(rootDirHandle, patientFolderName);
    if (!patientDir) return [];

    const notes: ClinicalNote[] = [];

    // 1. Leer de la subcarpeta /notas/ si existe
    const notesDir = await getDirectory(patientDir, 'notas');
    if (notesDir) {
      const files = await listFiles(notesDir, '.json');
      for (const fileHandle of files) {
        try {
          const note = await readJsonFile<ClinicalNote>(notesDir, fileHandle.name, ClinicalNoteSchema);
          if (note) {
            notes.push(note);
          }
        } catch (err) {
          console.error(`[listPatientNotes] Error leyendo nota ${fileHandle.name} en /notas/:`, err);
        }
      }
    }

    // 2. Leer directamente de la carpeta del paciente (por compatibilidad o notas raíz)
    const rootFiles = await listFiles(patientDir, '.json');
    for (const fileHandle of rootFiles) {
      if (fileHandle.name === 'paciente.json') continue;
      // Evitar duplicar si ya se leyó
      if (notes.some((n) => n.fileName === fileHandle.name || n.id === fileHandle.name.replace('.json', ''))) {
        continue;
      }
      try {
        const note = await readJsonFile<ClinicalNote>(patientDir, fileHandle.name, ClinicalNoteSchema);
        if (note) {
          notes.push(note);
        }
      } catch (err) {
        console.error(`[listPatientNotes] Error leyendo nota raíz ${fileHandle.name}:`, err);
      }
    }

    // Ordenar de más reciente a más antigua
    notes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return notes;
  }

  /**
   * Guarda una nota médica en /notas/ y actualiza paciente.json con el conteo de notas y última fecha.
   */
  static async savePatientNote(
    rootDirHandle: FileSystemDirectoryHandle,
    patientFolderName: string,
    noteData: Omit<ClinicalNote, 'fileName' | 'createdAt' | 'updatedAt' | 'schemaVersion'> & {
      fileName?: string;
      createdAt?: string;
      updatedAt?: string;
    }
  ): Promise<ClinicalNote> {
    const patientDir = await getDirectory(rootDirHandle, patientFolderName);
    if (!patientDir) {
      throw new Error(`No se encontró la carpeta del paciente ${patientFolderName}`);
    }

    const notesDir = await getOrCreateDirectory(patientDir, 'notas');
    const now = new Date().toISOString();

    const fileName = noteData.fileName || this.generateNoteFileName(noteData.date);

    // Calcular IMC si existen peso y talla
    const vitalSigns: VitalSigns = {
      ...noteData.vitalSigns,
    };
    if (vitalSigns.weightKg && vitalSigns.heightCm) {
      const bmiCalc = this.calculateBMI(vitalSigns.weightKg, vitalSigns.heightCm);
      if (bmiCalc) vitalSigns.bmi = bmiCalc.bmi;
    }

    const fullNote: ClinicalNote = {
      ...noteData,
      fileName,
      schemaVersion: '1.0.0',
      vitalSigns,
      createdAt: (noteData as ClinicalNote).createdAt || now,
      updatedAt: now,
    };

    // Escribir el archivo de la nota
    await writeJsonFile(notesDir, fileName, fullNote);

    // Actualizar paciente.json con contador y última fecha de consulta
    const allNotes = await this.listPatientNotes(rootDirHandle, patientFolderName);
    const existingPatient = await PatientService.loadPatient(rootDirHandle, patientFolderName);

    if (existingPatient) {
      const updatedPatient = {
        ...existingPatient,
        notesCount: allNotes.length,
        updatedAt: now,
      };
      await PatientService.savePatient(rootDirHandle, patientFolderName, updatedPatient);
    }

    return fullNote;
  }
}
