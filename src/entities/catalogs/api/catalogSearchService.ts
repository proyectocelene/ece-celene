import { CIE10_CATALOG, type CIE10Entry } from '../data/cie10Data';
import { MEDICATIONS_CATALOG, type MedicationEntry } from '../data/medicationsData';

const CUSTOM_MEDS_KEY = 'custom_medications_catalog';

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
   * Obtiene la lista combinada del catálogo base + medicamentos personalizados guardados por el médico
   */
  static getAllMedications(): MedicationEntry[] {
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
   * Agrega o actualiza un medicamento en el catálogo local del médico
   */
  static saveCustomMedication(med: MedicationEntry): void {
    try {
      const stored = localStorage.getItem(CUSTOM_MEDS_KEY);
      const custom: MedicationEntry[] = stored ? JSON.parse(stored) : [];
      const index = custom.findIndex((m) => normalizeString(m.genericName) === normalizeString(med.genericName));

      if (index >= 0) {
        custom[index] = med;
      } else {
        custom.unshift(med);
      }

      localStorage.setItem(CUSTOM_MEDS_KEY, JSON.stringify(custom));
    } catch (err) {
      console.error('Error guardando medicamento personalizado:', err);
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
