import type { ClinicalNote } from '../model/schemas';
import type { User } from '@/entities/auth/model/schemas';

export interface NoteEditPermissionResult {
  canEdit: boolean;
  isTimeLocked: boolean;
  isAuthorLocked: boolean;
  reason?: string;
  hoursRemaining?: number;
}

export class NotePermissionService {
  /** Límite de tiempo en horas para editar una nota según NOM-004-SSA3 */
  static readonly TIME_LIMIT_HOURS = 48;

  /**
   * Verifica si el usuario actual tiene permisos para editar la nota clínica:
   * 1. Límite de 48 horas desde la creación/firma de la consulta.
   * 2. Autoría: Solo el médico que creó la consulta puede editarla (ej. Dr. Sebastián solo sus notas).
   */
  static checkEditPermission(
    note: ClinicalNote,
    currentUser: User | null
  ): NoteEditPermissionResult {
    if (!currentUser) {
      return {
        canEdit: false,
        isTimeLocked: false,
        isAuthorLocked: true,
        reason: 'Se requiere iniciar sesión para editar notas médicas.',
      };
    }

    // 1. Verificación de Tiempo (48 Horas)
    const noteTime = new Date(note.createdAt || note.date).getTime();
    const nowTime = Date.now();
    const elapsedHours = (nowTime - noteTime) / (1000 * 60 * 60);

    if (elapsedHours > this.TIME_LIMIT_HOURS) {
      return {
        canEdit: false,
        isTimeLocked: true,
        isAuthorLocked: false,
        reason: `Esta consulta ha sido cerrada permanentemente tras cumplirse el plazo reglamentario de ${this.TIME_LIMIT_HOURS} horas (NOM-004-SSA3-2012).`,
        hoursRemaining: 0,
      };
    }

    const hoursRemaining = Math.max(0, Math.ceil(this.TIME_LIMIT_HOURS - elapsedHours));

    // 2. Verificación de Autoría
    // Compara el nombre del médico tratante registrado en la nota con el usuario en sesión
    const noteAuthor = (note.attendingDoctorName || '').trim().toLowerCase();
    const currentUserName = (currentUser.fullName || '').trim().toLowerCase();
    const currentUsername = (currentUser.username || '').trim().toLowerCase();

    // Si la nota tiene autor registrado y no coincide con el usuario en sesión
    const isAuthor =
      !noteAuthor ||
      noteAuthor === currentUserName ||
      (note.attendingDoctorRole === 'pasante' && currentUser.role === 'pasante' && noteAuthor.includes('sebastián')) ||
      (note.attendingDoctorRole === 'titular' && currentUser.role === 'titular' && noteAuthor.includes('donato')) ||
      currentUsername === noteAuthor;

    if (!isAuthor) {
      return {
        canEdit: false,
        isTimeLocked: false,
        isAuthorLocked: true,
        reason: `Solo el médico autor (${note.attendingDoctorName || 'Tratante original'}) puede editar esta consulta o receta.`,
        hoursRemaining,
      };
    }

    return {
      canEdit: true,
      isTimeLocked: false,
      isAuthorLocked: false,
      hoursRemaining,
    };
  }
}
