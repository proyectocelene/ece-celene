import { CIE10_CATALOG, type CIE10Entry } from '../data/cie10Data';
import { MEDICATIONS_CATALOG, type MedicationEntry } from '../data/medicationsData';
import { readJsonFile, writeJsonFile } from '@/shared/api/fsUtils';

const MEDICATIONS_FILE = 'catalogo_medicamentos.json';
const CUSTOM_MEDS_KEY = 'custom_medications_catalog';

let inMemoryMedsCache: MedicationEntry[] = MEDICATIONS_CATALOG;

/**
 * Normaliza cadenas de texto eliminando acentos, diacríticos y pasando a minúsculas
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export class CatalogSearchService {
  /**
   * Carga o inicializa el archivo físico catalogo_medicamentos.json en la carpeta del disco duro
   */
  static async initWorkspaceCatalog(rootDirHandle: FileSystemDirectoryHandle): Promise<MedicationEntry[]> {
    try {
      const existing = await readJsonFile<{ version: string; medications: MedicationEntry[] }>(
        rootDirHandle,
        MEDICATIONS_FILE
      );
      if (existing && existing.medications && existing.medications.length > 0) {
        inMemoryMedsCache = existing.medications;
        return inMemoryMedsCache;
      }
    } catch {
      // Si no existe, crear el archivo físico en el disco con los 250+ medicamentos base
    }

    const payload = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      totalMedications: MEDICATIONS_CATALOG.length,
      medications: MEDICATIONS_CATALOG,
    };

    try {
      await writeJsonFile(rootDirHandle, MEDICATIONS_FILE, payload);
    } catch (err) {
      console.warn('No se pudo escribir catalogo_medicamentos.json en disco:', err);
    }

    inMemoryMedsCache = MEDICATIONS_CATALOG;
    return inMemoryMedsCache;
  }

  /**
   * Obtiene la lista combinada del catálogo en memoria + personalizados en disco o navegador
   */
  static getAllMedications(): MedicationEntry[] {
    if (inMemoryMedsCache && inMemoryMedsCache.length > 0) {
      return inMemoryMedsCache;
    }

    try {
      const stored = localStorage.getItem(CUSTOM_MEDS_KEY);
      if (stored) {
        const custom: MedicationEntry[] = JSON.parse(stored);
        return [...custom, ...MEDICATIONS_CATALOG];
      }
    } catch {
      // Ignorar error de parsing
    }

    return MEDICATIONS_CATALOG;
  }

  /**
   * Agrega o actualiza un medicamento tanto en el archivo físico en disco como en memoria
   */
  static async saveMedication(
    rootDirHandle: FileSystemDirectoryHandle | null,
    med: MedicationEntry
  ): Promise<void> {
    const current = this.getAllMedications();
    const index = current.findIndex((m) => normalizeString(m.genericName) === normalizeString(med.genericName));

    let updated: MedicationEntry[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = med;
    } else {
      updated = [med, ...current];
    }

    inMemoryMedsCache = updated;
    localStorage.setItem(CUSTOM_MEDS_KEY, JSON.stringify(updated.slice(0, 100)));

    if (rootDirHandle) {
      try {
        await writeJsonFile(rootDirHandle, MEDICATIONS_FILE, {
          version: '1.0.0',
          lastUpdated: new Date().toISOString(),
          totalMedications: updated.length,
          medications: updated,
        });
      } catch (err) {
        console.error('Error escribiendo catalogo_medicamentos.json en disco:', err);
      }
    }
  }

  /**
   * Búsqueda en memoria instantánea sobre el catálogo de medicamentos
   */
  static searchMedications(query: string, limit = 10): MedicationEntry[] {
    const q = normalizeString(query);
    if (!q) return [];

    const terms = q.split(/\s+/).filter(Boolean);
    const all = this.getAllMedications();

    const matches = all.filter((item) => {
      const genNorm = normalizeString(item.genericName);
      const catNorm = normalizeString(item.category || '');
      const brandsNorm = normalizeString((item.brandNames || []).join(' '));

      if (genNorm.startsWith(q) || genNorm.includes(q)) return true;
      if (brandsNorm.includes(q)) return true;

      return terms.every((term) => genNorm.includes(term) || catNorm.includes(term) || brandsNorm.includes(term));
    });

    return matches.slice(0, limit);
  }

  /**
   * Búsqueda en memoria instantánea sobre el catálogo CIE-10.
   */
  static searchCIE10(query: string, limit = 10): CIE10Entry[] {
    const q = normalizeString(query);
    if (!q) return [];

    const terms = q.split(/\s+/).filter(Boolean);

    const matches = CIE10_CATALOG.filter((item) => {
      const codeNorm = normalizeString(item.code);
      const descNorm = normalizeString(item.description);
      const catNorm = normalizeString(item.category || '');

      if (codeNorm.startsWith(q) || codeNorm.includes(q)) return true;

      return terms.every((term) => descNorm.includes(term) || catNorm.includes(term));
    });

    return matches.slice(0, limit);
  }

  /**
   * Obtiene o infiere la indicación terapéutica predeterminada según el medicamento o su categoría
   */
  static getMedicationIndication(med: MedicationEntry): string {
    if (med.defaultIndication) return med.defaultIndication;

    const cat = normalizeString(med.category);
    const gen = normalizeString(med.genericName);

    if (cat.includes('antibiotico') || cat.includes('penicilina') || cat.includes('cefalosporina') || cat.includes('quinolona') || cat.includes('macrolido')) {
      return 'Tratamiento de Infección bacteriana';
    }
    if (cat.includes('antiviral')) {
      return 'Tratamiento de Infección viral';
    }
    if (cat.includes('antimicotico') || cat.includes('antifungico')) {
      return 'Tratamiento de Infección por hongos / micosis';
    }
    if (cat.includes('analgesico') || cat.includes('aine') || cat.includes('antiinflamatorio') || gen.includes('paracetamol') || gen.includes('ibuprofeno') || gen.includes('ketorolaco') || gen.includes('naproxeno') || gen.includes('diclofenaco') || gen.includes('tramadol')) {
      return 'Alivio de Dolor, Inflamación y/o Fiebre';
    }
    if (cat.includes('antihipertensivo') || cat.includes('cardio') || gen.includes('losartan') || gen.includes('captopril') || gen.includes('enalapril') || gen.includes('amlodipino') || gen.includes('metoprolol') || gen.includes('telmisartan') || gen.includes('hidroclorotiazida')) {
      return 'Control de Presión Arterial (Hipertensión)';
    }
    if (cat.includes('antidiabetico') || cat.includes('hipoglucemiante') || cat.includes('insulina') || gen.includes('metformina') || gen.includes('glibenclamida') || gen.includes('dapagliflozina') || gen.includes('empagliflozina') || gen.includes('sitagliptina') || gen.includes('linagliptina')) {
      return 'Control de Glucosa (Diabetes Mellitus)';
    }
    if (cat.includes('gastrico') || cat.includes('antiacido') || cat.includes('inhibidor de bomba') || gen.includes('omeprazol') || gen.includes('pantoprazol') || gen.includes('esomeprazol') || gen.includes('ranitidina') || gen.includes('sucralfato') || gen.includes('magaldrato')) {
      return 'Protección gástrica / Gastritis / Reflujo';
    }
    if (cat.includes('antihistaminico') || cat.includes('antialergico') || gen.includes('loratadina') || gen.includes('cetirizina') || gen.includes('clorfenamina') || gen.includes('fexofenadina')) {
      return 'Alivio de Alergia / Prurito / Congestión';
    }
    if (cat.includes('broncodilatador') || cat.includes('asma') || gen.includes('salbutamol') || gen.includes('budesonida') || gen.includes('ipratropio') || gen.includes('montelukast')) {
      return 'Manejo de Broncoespasmo / Asma / Tos';
    }
    if (cat.includes('estatina') || cat.includes('lipem') || cat.includes('dislipidemia') || gen.includes('atorvastatina') || gen.includes('pravastatina') || gen.includes('rosuvastatina') || gen.includes('bezafibrato') || gen.includes('fenofibrato')) {
      return 'Control de Colesterol y Triglicéridos';
    }
    if (cat.includes('antiespasmodico') || gen.includes('butilhioscina') || gen.includes('trimebutina') || gen.includes('plaver')) {
      return 'Alivio de Cólico / Espasmo gastrointestinal';
    }
    if (cat.includes('antidiarrerico') || gen.includes('loperamida') || gen.includes('diosmectita')) {
      return 'Control de Diarrea aguda';
    }
    if (cat.includes('procinetico') || cat.includes('antiemetico') || gen.includes('metoclopramida') || gen.includes('ondansetron') || gen.includes('dimenhidrinato')) {
      return 'Alivio de Náuseas y Vómito';
    }
    if (cat.includes('oftalm') || cat.includes('colirio')) {
      return 'Tratamiento Oftálmico';
    }
    if (cat.includes('psico') || cat.includes('ansiolitico') || cat.includes('sedante') || gen.includes('clonazepam') || gen.includes('diazepam') || gen.includes('alprazolam') || gen.includes('lorazepam')) {
      return 'Manejo de Ansiedad / Insomnio';
    }

    return 'Tratamiento según indicación médica';
  }

  /**
   * Determina si un medicamento es antibiótico (requiere copia para farmacia bajo normativa)
   */
  static isAntibioticMed(medNameOrEntry: string | MedicationEntry): boolean {
    const medString = typeof medNameOrEntry === 'string' ? medNameOrEntry : `${medNameOrEntry.genericName} ${medNameOrEntry.category}`;
    const norm = normalizeString(medString);

    const antibioticKeywords = [
      'amoxicilina', 'clavulanico', 'ampicilina', 'cefalexina', 'ceftriaxona', 'cefixima', 'cefuroxima',
      'ciprofloxacino', 'levofloxacino', 'azitromicina', 'claritromicina', 'eritromicina', 'clindamicina',
      'trimetoprima', 'sulfametoxazol', 'nitrofurantoina', 'fosfomicina', 'metronidazol', 'gentamicina',
      'amikacina', 'penicilina', 'doxiciclina', 'tetraciclina', 'vancomicina', 'antibiotico',
    ];

    return antibioticKeywords.some((keyword) => norm.includes(keyword));
  }

  /**
   * Determina si un medicamento es controlado (psicotrópico, estupefaciente fracción II o III)
   */
  static isControlledMed(medNameOrEntry: string | MedicationEntry): boolean {
    const medString = typeof medNameOrEntry === 'string' ? medNameOrEntry : `${medNameOrEntry.genericName} ${medNameOrEntry.category}`;
    const norm = normalizeString(medString);

    const controlledKeywords = [
      'clonazepam', 'diazepam', 'alprazolam', 'lorazepam', 'midazolam', 'zolpidem', 'tramadol', 'morfina',
      'fentanilo', 'buprenorfina', 'metilfenidato', 'modafinilo', 'fenobarbital', 'controlado', 'psicotropico',
    ];

    return controlledKeywords.some((keyword) => norm.includes(keyword));
  }
}
