import {
  type User,
  type UsersFile,
  type ClinicConfig,
  type AuditLogEntry,
  type AuditLogFile,
  type AuditAction,
  type UserRole,
  type AuditLocation,
  UsersFileSchema,
  ClinicConfigSchema,
  AuditLogFileSchema,
} from '../model/schemas';
import { readJsonFile, writeJsonFile } from '@/shared/api/fsUtils';

const USERS_FILE = 'usuarios_clinica.json';
const CLINIC_CONFIG_FILE = 'config_clinica.json';
const AUDIT_FILE = 'auditoria_clinica.json';

export class AuthService {
  /**
   * Hashea una contraseña usando SHA-256 nativo del navegador (Web Crypto API)
   */
  static async hashPassword(plainText: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Carga o inicializa la configuración de la clínica (Proyecto Celene Rosarito)
   */
  static async loadOrCreateClinicConfig(
    rootDirHandle: FileSystemDirectoryHandle
  ): Promise<ClinicConfig> {
    try {
      const existing = await readJsonFile<ClinicConfig>(
        rootDirHandle,
        CLINIC_CONFIG_FILE,
        ClinicConfigSchema
      );
      if (existing) return existing;
    } catch (err) {
      console.warn('Configuración de clínica corrupta o no encontrada. Creando predeterminada...', err);
    }

    const defaultConfig: ClinicConfig = {
      clinicName: 'PROYECTO CELENE ROSARITO',
      foundationName: 'FUNDACIÓN PROYECTO CELENE',
      address: 'Gral. Guadalupe Victoria, Lienzo Charro, Playas de Rosarito',
      phone: '661 104 4050',
      email: 'consultorio@proyectocelene.org',
      schedule: 'L a V: 9am - 5pm | Sáb: 9am - 4pm',
      website: 'proyectocelene.org',
      logoUrl: 'https://i.ibb.co/k2LCbnsF/tcarta-volante.png',
      defaultSupervisorId: 'usr-donato',
    };

    await writeJsonFile(rootDirHandle, CLINIC_CONFIG_FILE, defaultConfig);
    return defaultConfig;
  }

  /**
   * Carga o inicializa el archivo de usuarios con Dr. Donato y Dr. Sebastián
   */
  static async loadOrCreateUsers(
    rootDirHandle: FileSystemDirectoryHandle
  ): Promise<UsersFile> {
    try {
      const existing = await readJsonFile<UsersFile>(
        rootDirHandle,
        USERS_FILE,
        UsersFileSchema
      );
      if (existing && existing.users.length > 0) return existing;
    } catch (err) {
      console.warn('Archivo de usuarios corrupto o no encontrado. Inicializando usuarios base...', err);
    }

    const now = new Date().toISOString();
    const hashDonato = await this.hashPassword('Citoplasma1');
    const hashSebastian = await this.hashPassword('123456');

    const defaultUsers: UsersFile = {
      version: '1.0.0',
      lastUpdated: now,
      users: [
        {
          id: 'usr-donato',
          username: 'DR.DONATO',
          passwordHash: hashDonato,
          fullName: 'Dr. Carlos Donato Dueñas Prieto',
          title: 'MÉDICO GENERAL',
          licenseNumber: 'CED. PROF. 15504256',
          university: 'UNIVERSIDAD AUTÓNOMA DE BAJA CALIFORNIA',
          role: 'titular',
          active: true,
          createdAt: now,
        },
        {
          id: 'usr-sebastian',
          username: 'Dr. Sebastian',
          passwordHash: hashSebastian,
          fullName: 'Dr. Sebastián Garduño Conde',
          title: 'MÉDICO PASANTE DEL SERVICIO SOCIAL (MPSS)',
          licenseNumber: 'MPSS - UABC',
          university: 'UNIVERSIDAD AUTÓNOMA DE BAJA CALIFORNIA',
          role: 'pasante',
          active: true,
          createdAt: now,
        },
      ],
    };

    await writeJsonFile(rootDirHandle, USERS_FILE, defaultUsers);
    return defaultUsers;
  }

  /**
   * Inicia sesión verificando credenciales contra el archivo local en disco
   */
  static async authenticate(
    rootDirHandle: FileSystemDirectoryHandle,
    usernameInput: string,
    passwordInput: string
  ): Promise<User | null> {
    const usersFile = await this.loadOrCreateUsers(rootDirHandle);
    const inputHash = await this.hashPassword(passwordInput);

    const user = usersFile.users.find(
      (u) =>
        u.active &&
        u.username.toLowerCase().trim() === usernameInput.toLowerCase().trim() &&
        u.passwordHash === inputHash
    );

    if (user) {
      await this.recordAudit(
        rootDirHandle,
        user,
        'INICIO_SESION',
        `Inicio de sesión exitoso desde el dispositivo local.`
      );
      return user;
    }

    return null;
  }

  /**
   * Registra un nuevo médico o pasante en el archivo de usuarios del consultorio
   */
  static async registerDoctor(
    rootDirHandle: FileSystemDirectoryHandle,
    data: {
      username: string;
      passwordPlain: string;
      fullName: string;
      title: string;
      licenseNumber: string;
      university: string;
      role: UserRole;
    },
    createdBy?: User
  ): Promise<User> {
    const usersFile = await this.loadOrCreateUsers(rootDirHandle);
    const usernameClean = data.username.trim();

    const exists = usersFile.users.some(
      (u) => u.username.toLowerCase() === usernameClean.toLowerCase()
    );
    if (exists) {
      throw new Error(`El nombre de usuario "${usernameClean}" ya está en uso en esta clínica.`);
    }

    const passwordHash = await this.hashPassword(data.passwordPlain);
    const now = new Date().toISOString();
    const newId = `usr-${Date.now()}`;

    const newUser: User = {
      id: newId,
      username: usernameClean,
      passwordHash,
      fullName: data.fullName.trim(),
      title: data.title.trim(),
      licenseNumber: data.licenseNumber.trim(),
      university: data.university.trim(),
      role: data.role,
      active: true,
      createdAt: now,
    };

    const updatedUsers: UsersFile = {
      ...usersFile,
      lastUpdated: now,
      users: [...usersFile.users, newUser],
    };

    await writeJsonFile(rootDirHandle, USERS_FILE, updatedUsers);

    if (createdBy) {
      await this.recordAudit(
        rootDirHandle,
        createdBy,
        'REGISTRAR_MEDICO',
        `Se registró al nuevo usuario '${newUser.fullName}' (${newUser.username}) con rol ${newUser.role}.`
      );
    }

    return newUser;
  }

  /**
   * Registra una entrada inmutable de auditoría clínica en auditoria_clinica.json
   */
  static async recordAudit(
    rootDirHandle: FileSystemDirectoryHandle,
    user: User,
    action: AuditAction,
    details: string,
    targetPatientId?: string,
    location?: AuditLocation
  ): Promise<AuditLogEntry> {
    let auditFile: AuditLogFile;

    try {
      const existing = await readJsonFile<AuditLogFile>(
        rootDirHandle,
        AUDIT_FILE,
        AuditLogFileSchema
      );
      auditFile = existing || {
        version: '1.0.0',
        lastLog: new Date().toISOString(),
        totalEntries: 0,
        logs: [],
      };
    } catch {
      auditFile = {
        version: '1.0.0',
        lastLog: new Date().toISOString(),
        totalEntries: 0,
        logs: [],
      };
    }

    const now = new Date().toISOString();
    const entry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: now,
      userId: user.id,
      username: user.username,
      userFullName: user.fullName,
      userRole: user.role,
      action,
      details,
      targetPatientId,
      location,
    };

    const updatedLogs: AuditLogFile = {
      version: '1.0.0',
      lastLog: now,
      totalEntries: auditFile.logs.length + 1,
      logs: [entry, ...auditFile.logs], // Más reciente primero
    };

    await writeJsonFile(rootDirHandle, AUDIT_FILE, updatedLogs);
    return entry;
  }

  /**
   * Carga el historial de auditorías de la clínica
   */
  static async loadAuditLogs(
    rootDirHandle: FileSystemDirectoryHandle
  ): Promise<AuditLogEntry[]> {
    try {
      const file = await readJsonFile<AuditLogFile>(
        rootDirHandle,
        AUDIT_FILE,
        AuditLogFileSchema
      );
      return file?.logs || [];
    } catch {
      return [];
    }
  }

  /**
   * Obtiene el médico titular/supervisor de la clínica
   */
  static async getSupervisorDoctor(
    rootDirHandle: FileSystemDirectoryHandle
  ): Promise<User | null> {
    const config = await this.loadOrCreateClinicConfig(rootDirHandle);
    const usersFile = await this.loadOrCreateUsers(rootDirHandle);

    if (config.defaultSupervisorId) {
      const found = usersFile.users.find((u) => u.id === config.defaultSupervisorId);
      if (found) return found;
    }

    // Retornar el primer médico con rol titular
    return usersFile.users.find((u) => u.role === 'titular') || usersFile.users[0] || null;
  }

  /**
   * Actualiza los datos de perfil de un médico o pasante
   */
  static async updateUserProfile(
    rootDirHandle: FileSystemDirectoryHandle,
    userId: string,
    updatedData: Partial<Pick<User, 'fullName' | 'title' | 'licenseNumber' | 'university'>>
  ): Promise<User> {
    const usersFile = await this.loadOrCreateUsers(rootDirHandle);
    const userIndex = usersFile.users.findIndex((u) => u.id === userId);
    if (userIndex < 0) throw new Error('Usuario no encontrado');

    const updatedUser: User = {
      ...usersFile.users[userIndex],
      ...updatedData,
    };

    usersFile.users[userIndex] = updatedUser;
    usersFile.lastUpdated = new Date().toISOString();
    await writeJsonFile(rootDirHandle, USERS_FILE, usersFile);

    await this.recordAudit(
      rootDirHandle,
      updatedUser,
      'EDITAR_PACIENTE' as AuditAction,
      `Actualización de datos del perfil profesional de ${updatedUser.fullName}.`
    );

    return updatedUser;
  }

  /**
   * Cambia la contraseña de un usuario local
   */
  static async changePassword(
    rootDirHandle: FileSystemDirectoryHandle,
    userId: string,
    newPasswordPlain: string
  ): Promise<void> {
    const usersFile = await this.loadOrCreateUsers(rootDirHandle);
    const userIndex = usersFile.users.findIndex((u) => u.id === userId);
    if (userIndex < 0) throw new Error('Usuario no encontrado');

    const newHash = await this.hashPassword(newPasswordPlain);
    usersFile.users[userIndex].passwordHash = newHash;
    usersFile.lastUpdated = new Date().toISOString();
    await writeJsonFile(rootDirHandle, USERS_FILE, usersFile);

    await this.recordAudit(
      rootDirHandle,
      usersFile.users[userIndex],
      'ACTUALIZAR_CLINICA' as AuditAction,
      `Cambio de contraseña exitoso para el usuario ${usersFile.users[userIndex].username}.`
    );
  }
}
