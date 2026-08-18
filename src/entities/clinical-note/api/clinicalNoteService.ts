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
   * Calcula el rango de peso ideal y peso objetivo promedio según la talla y el IMC saludable (18.5 - 24.9 kg/m²)
   */
  static calculateIdealWeight(
    heightCm?: number,
    currentWeightKg?: number
  ): {
    minKg: number;
    maxKg: number;
    targetKg: number;
    diffKg: number | null;
    status: 'ideal' | 'overweight' | 'underweight' | null;
    displayText: string;
  } | null {
    if (!heightCm || heightCm <= 0) return null;
    const heightM = heightCm / 100;
    const h2 = heightM * heightM;

    const minKg = Number((18.5 * h2).toFixed(1));
    const maxKg = Number((24.9 * h2).toFixed(1));
    const targetKg = Number((21.7 * h2).toFixed(1));

    let diffKg: number | null = null;
    let status: 'ideal' | 'overweight' | 'underweight' | null = null;

    if (currentWeightKg && currentWeightKg > 0) {
      diffKg = Number((currentWeightKg - targetKg).toFixed(1));
      if (currentWeightKg < minKg) {
        status = 'underweight';
      } else if (currentWeightKg > maxKg) {
        status = 'overweight';
      } else {
        status = 'ideal';
      }
    }

    const displayText = `${minKg} kg - ${maxKg} kg (Meta: ${targetKg} kg)`;

    return {
      minKg,
      maxKg,
      targetKg,
      diffKg,
      status,
      displayText,
    };
  }

  /**
   * Evalúa los signos vitales y genera alertas clínicas con su nivel de gravedad y sugerencias
   */
  static evaluateVitalSignsAlerts(vitals: VitalSigns): {
    id: string;
    field: string;
    level: 'info' | 'warning' | 'danger';
    title: string;
    message: string;
  }[] {
    const alerts: {
      id: string;
      field: string;
      level: 'info' | 'warning' | 'danger';
      title: string;
      message: string;
    }[] = [];

    // 1. Presión Arterial
    if (vitals.bpSystolic !== undefined || vitals.bpDiastolic !== undefined) {
      const sys = vitals.bpSystolic ?? 120;
      const dia = vitals.bpDiastolic ?? 80;

      if (sys >= 180 || dia >= 120) {
        alerts.push({
          id: 'crisis-hta',
          field: 'bp',
          level: 'danger',
          title: '🚨 CRISIS HIPERTENSIVA',
          message: `Cifras de ${sys}/${dia} mmHg. Evaluar de inmediato daño a órgano blanco (cefalea, fosfenos, dolor torácico, disnea).`,
        });
      } else if (sys >= 140 || dia >= 90) {
        alerts.push({
          id: 'hta-g2',
          field: 'bp',
          level: 'warning',
          title: '⚠️ Hipertensión Grado 2',
          message: `Cifras elevadas (${sys}/${dia} mmHg). Considerar ajuste de terapia antihipertensiva o solicitar EKG / laboratorios.`,
        });
      } else if (sys >= 130 || dia >= 80) {
        alerts.push({
          id: 'hta-g1',
          field: 'bp',
          level: 'info',
          title: 'T.A. Elevada / HTA Grado 1',
          message: `Presión arterial limítrofe/elevada (${sys}/${dia} mmHg). Reforzar medidas higiénico-dietéticas.`,
        });
      } else if (sys < 90 || dia < 60) {
        alerts.push({
          id: 'hipotension',
          field: 'bp',
          level: 'warning',
          title: 'Hipotensión Arterial',
          message: `Presión arterial baja (${sys}/${dia} mmHg). Evaluar hidratación, ortostatismo y dosis de fármacos.`,
        });
      }
    }

    // 2. Frecuencia Cardíaca
    if (vitals.heartRate !== undefined) {
      if (vitals.heartRate > 100) {
        alerts.push({
          id: 'taquicardia',
          field: 'heartRate',
          level: 'warning',
          title: 'Taquicardia (>100 lpm)',
          message: `FC de ${vitals.heartRate} lpm. Descartar fiebre, dolor, deshidratación, ansiedad o arritmia.`,
        });
      } else if (vitals.heartRate < 60) {
        alerts.push({
          id: 'bradicardia',
          field: 'heartRate',
          level: 'info',
          title: 'Bradicardia (<60 lpm)',
          message: `FC de ${vitals.heartRate} lpm. Verificar si el paciente es atleta o usa betabloqueadores.`,
        });
      }
    }

    // 3. Frecuencia Respiratoria
    if (vitals.respiratoryRate !== undefined) {
      if (vitals.respiratoryRate > 20) {
        alerts.push({
          id: 'taquipnea',
          field: 'respiratoryRate',
          level: 'warning',
          title: 'Taquipnea (>20 rpm)',
          message: `FR de ${vitals.respiratoryRate} rpm. Auscultar campos pulmonares y verificar mecánica ventilatoria.`,
        });
      } else if (vitals.respiratoryRate < 12) {
        alerts.push({
          id: 'bradipnea',
          field: 'respiratoryRate',
          level: 'warning',
          title: 'Bradipnea (<12 rpm)',
          message: `FR de ${vitals.respiratoryRate} rpm. Evaluar depresión respiratoria o estado neurológico.`,
        });
      }
    }

    // 4. Temperatura
    if (vitals.temperature !== undefined) {
      if (vitals.temperature >= 38.0) {
        alerts.push({
          id: 'fiebre',
          field: 'temperature',
          level: 'danger',
          title: 'Fiebre (≥38.0°C)',
          message: `Temperatura de ${vitals.temperature}°C. Buscar foco infeccioso e indicar antipirético/medios físicos.`,
        });
      } else if (vitals.temperature >= 37.5) {
        alerts.push({
          id: 'febricula',
          field: 'temperature',
          level: 'info',
          title: 'Febrícula (37.5 - 37.9°C)',
          message: `Temperatura subfebril (${vitals.temperature}°C). Monitorear evolución.`,
        });
      } else if (vitals.temperature < 35.5) {
        alerts.push({
          id: 'hipotermia',
          field: 'temperature',
          level: 'warning',
          title: 'Hipotermia (<35.5°C)',
          message: `Temperatura baja (${vitals.temperature}°C). Abrigar y corroborar técnica de medición.`,
        });
      }
    }

    // 5. Glucosa Capilar
    if (vitals.glucose !== undefined) {
      if (vitals.glucose < 70) {
        alerts.push({
          id: 'hipoglucemia',
          field: 'glucose',
          level: 'danger',
          title: '🚨 HIPOGLUCEMIA (<70 mg/dL)',
          message: `Glucosa crítica de ${vitals.glucose} mg/dL. Administrar carbohidratos simples vía oral de inmediato.`,
        });
      } else if (vitals.glucose >= 200) {
        alerts.push({
          id: 'hiperglucemia-severa',
          field: 'glucose',
          level: 'warning',
          title: 'Hiperglucemia Marcada (≥200 mg/dL)',
          message: `Glucosa de ${vitals.glucose} mg/dL. Verificar apego terapéutico, cetonuria o descompensación.`,
        });
      } else if (vitals.glucose >= 126) {
        alerts.push({
          id: 'hiperglucemia',
          field: 'glucose',
          level: 'info',
          title: 'Glucemia Elevada (≥126 mg/dL)',
          message: `Glucosa de ${vitals.glucose} mg/dL. Sugiere descontrol glucémico si fue en ayunas.`,
        });
      }
    }

    // 6. Saturación SpO2
    if (vitals.spO2 !== undefined) {
      if (vitals.spO2 < 90) {
        alerts.push({
          id: 'hipoxemia-grave',
          field: 'spO2',
          level: 'danger',
          title: '🚨 HIPOXEMIA GRAVE (<90%)',
          message: `Saturación de ${vitals.spO2}%. Requiere valoración urgente y posible aporte de oxígeno suplementario.`,
        });
      } else if (vitals.spO2 < 94) {
        alerts.push({
          id: 'desaturacion',
          field: 'spO2',
          level: 'warning',
          title: 'Desaturación Leve-Moderada (90-93%)',
          message: `Saturación de ${vitals.spO2}%. Auscultar ruidos respiratorios y descartar broncoespasmo o neumonía.`,
        });
      }
    }

    return alerts;
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
