/**
 * Servicio Centralizado de Fechas y Zona Horaria para el ECE
 * Zona Horaria Oficial: America/Tijuana (Tijuana, Playas de Rosarito, Baja California, México)
 */

export class DateTimeService {
  static readonly TIMEZONE = 'America/Tijuana';
  static readonly LOCALE = 'es-MX';

  /**
   * Parsea de manera segura un string YYYY-MM-DD o ISO para evitar desfasamiento de un día por UTC.
   */
  static parseDateParts(dateStr: string): { year: number; month: number; day: number; hour: number; minute: number } {
    if (!dateStr) {
      const now = new Date();
      return {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
        hour: now.getHours(),
        minute: now.getMinutes(),
      };
    }

    const clean = dateStr.trim();

    // Caso 1: YYYY-MM-DD simple
    const dateMatch = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (dateMatch) {
      const year = parseInt(dateMatch[1], 10);
      const month = parseInt(dateMatch[2], 10);
      const day = parseInt(dateMatch[3], 10);

      // Si tiene componente de hora
      const timeMatch = clean.match(/[T\s](\d{1,2}):(\d{1,2})/);
      const hour = timeMatch ? parseInt(timeMatch[1], 10) : 12;
      const minute = timeMatch ? parseInt(timeMatch[2], 10) : 0;

      return { year, month, day, hour, minute };
    }

    // Caso 2: DD-MM-YYYY
    const dmyMatch = clean.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10);
      const year = parseInt(dmyMatch[3], 10);
      return { year, month, day, hour: 12, minute: 0 };
    }

    const d = new Date(dateStr);
    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      hour: d.getHours(),
      minute: d.getMinutes(),
    };
  }

  /**
   * Formatea una fecha en formato legible en español mexicano según la zona de Tijuana.
   * Ej: "17 de agosto de 2026" o "17/08/2026"
   */
  static formatDate(
    dateInput?: string | Date | null,
    options?: Intl.DateTimeFormatOptions
  ): string {
    if (!dateInput) return '-';

    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
      // Fecha sin hora: formatear directamente desde sus partes para no restar 1 día por UTC
      const parts = this.parseDateParts(dateInput);
      const tempDate = new Date(parts.year, parts.month - 1, parts.day, 12, 0, 0);
      return tempDate.toLocaleDateString(this.LOCALE, {
        timeZone: this.TIMEZONE,
        ...options,
      });
    }

    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return '-';

    return d.toLocaleDateString(this.LOCALE, {
      timeZone: this.TIMEZONE,
      ...options,
    });
  }

  /**
   * Formatea la hora en formato 12 horas en español (ej. "07:26 p.m.") en zona Tijuana.
   */
  static formatTime(dateInput?: string | Date | null): string {
    if (!dateInput) return '';
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return '';

    return d.toLocaleTimeString(this.LOCALE, {
      timeZone: this.TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  /**
   * Formatea fecha y hora combinadas (ej. "17 ago 2026, 07:26 p.m.") en zona Tijuana.
   */
  static formatDateTime(dateInput?: string | Date | null): string {
    if (!dateInput) return '-';
    const dateFormatted = this.formatDate(dateInput, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    const timeFormatted = this.formatTime(dateInput);
    return timeFormatted ? `${dateFormatted} - ${timeFormatted}` : dateFormatted;
  }

  /**
   * Genera el nombre estandarizado de archivo de nota en base a la hora de Tijuana.
   * Ej: "2026-08-17_1926_consulta.json"
   */
  static generateNoteFileName(dateISO?: string): string {
    const parts = this.parseDateParts(dateISO || new Date().toISOString());
    const year = parts.year;
    const month = String(parts.month).padStart(2, '0');
    const day = String(parts.day).padStart(2, '0');
    const hour = String(parts.hour).padStart(2, '0');
    const minute = String(parts.minute).padStart(2, '0');
    return `${year}-${month}-${day}_${hour}${minute}_consulta.json`;
  }

  /**
   * Calcula la edad exacta sin desfasamientos por zona horaria.
   */
  static calculateAge(birthDateStr?: string): { years: number; months: number; displayText: string } {
    if (!birthDateStr) return { years: 0, months: 0, displayText: 'Edad no especificada' };

    const birthParts = this.parseDateParts(birthDateStr);
    const now = new Date();

    // Obtener componentes de fecha actual en Tijuana
    const nowParts = this.parseDateParts(now.toISOString());

    let years = nowParts.year - birthParts.year;
    let months = nowParts.month - birthParts.month;

    if (months < 0 || (months === 0 && nowParts.day < birthParts.day)) {
      years--;
      months += 12;
    }

    if (nowParts.day < birthParts.day) {
      months--;
      if (months < 0) {
        months += 12;
      }
    }

    if (years < 0) {
      return { years: 0, months: 0, displayText: 'Recién nacido' };
    }

    if (years === 0) {
      if (months === 0) {
        const days = Math.max(0, nowParts.day - birthParts.day);
        return { years: 0, months: 0, displayText: `${days} ${days === 1 ? 'día' : 'días'}` };
      }
      return { years: 0, months, displayText: `${months} ${months === 1 ? 'mes' : 'meses'}` };
    }

    if (years < 2) {
      return {
        years,
        months,
        displayText: `${years} ${years === 1 ? 'año' : 'años'} ${months > 0 ? `con ${months} m` : ''}`.trim(),
      };
    }

    return {
      years,
      months,
      displayText: `${years} años`,
    };
  }

  /**
   * Retorna la fecha y hora actual en formato ISO
   */
  static nowISO(): string {
    return new Date().toISOString();
  }
}
