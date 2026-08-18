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
   * Búsqueda en memoria instantánea sobre el catálogo de Medicamentos.
   */
  static searchMedications(query: string, limit = 8): MedicationEntry[] {
    const q = normalizeString(query);
    if (!q) return [];

    const terms = q.split(/\s+/).filter(Boolean);
    const catalog = this.getAllMedications();

    const matches = catalog.filter((item) => {
      const genNorm = normalizeString(item.genericName);
      const catNorm = normalizeString(item.category || '');
      const brandsNorm = item.brandNames ? item.brandNames.map(normalizeString).join(' ') : '';

      return terms.every(
        (term) => genNorm.includes(term) || catNorm.includes(term) || brandsNorm.includes(term)
      );
    });

    return matches.slice(0, limit);
  }
}
