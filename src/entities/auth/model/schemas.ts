import { z } from 'zod';

export const UserRoleSchema = z.enum(['titular', 'pasante', 'asistente', 'admin']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  id: z.string(),
  username: z.string().min(2, 'El nombre de usuario debe tener al menos 2 caracteres'),
  passwordHash: z.string().min(1),
  fullName: z.string().min(3, 'El nombre completo es requerido'),
  title: z.string().default('MÉDICO GENERAL'),
  licenseNumber: z.string().default(''), // Cédula profesional o Matrícula MPSS
  university: z.string().default(''), // Ej. Universidad Autónoma de Baja California
  role: UserRoleSchema.default('pasante'),
  active: z.boolean().default(true),
  createdAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

export const UsersFileSchema = z.object({
  version: z.literal('1.0.0').default('1.0.0'),
  lastUpdated: z.string(),
  users: z.array(UserSchema),
});

export type UsersFile = z.infer<typeof UsersFileSchema>;

export const ClinicConfigSchema = z.object({
  clinicName: z.string().default('PROYECTO CELENE ROSARITO'),
  foundationName: z.string().default('FUNDACIÓN PROYECTO CELENE'),
  address: z.string().default('Gral. Guadalupe Victoria, Lienzo Charro, Playas de Rosarito'),
  phone: z.string().default('661 104 4050'),
  email: z.string().default('consultorio@proyectocelene.org'),
  schedule: z.string().default('L a V: 9am - 5pm | Sáb: 9am - 4pm'),
  website: z.string().default('proyectocelene.org'),
  logoUrl: z.string().default('https://i.ibb.co/k2LCbnsF/tcarta-volante.png'),
  defaultSupervisorId: z.string().optional(),
});

export type ClinicConfig = z.infer<typeof ClinicConfigSchema>;

export const AuditActionSchema = z.enum([
  'INICIO_SESION',
  'CIERRE_SESION',
  'CREAR_PACIENTE',
  'EDITAR_PACIENTE',
  'ELIMINAR_PACIENTE',
  'CREAR_NOTA_MEDICA',
  'EDITAR_NOTA_MEDICA',
  'CONSULTAR_EXPEDIENTE',
  'SUBIR_ADJUNTO',
  'ELIMINAR_ADJUNTO',
  'REGISTRAR_MEDICO',
  'IMPRIMIR_RECETA',
  'ACTUALIZAR_CLINICA',
  'CREAR_BACKUP',
]);

export type AuditAction = z.infer<typeof AuditActionSchema>;

export const AuditLogEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string().datetime(),
  userId: z.string(),
  username: z.string(),
  userFullName: z.string(),
  userRole: UserRoleSchema,
  action: AuditActionSchema,
  details: z.string(),
  targetPatientId: z.string().optional(),
});

export type AuditLogEntry = z.infer<typeof AuditLogEntrySchema>;

export const AuditLogFileSchema = z.object({
  version: z.literal('1.0.0').default('1.0.0'),
  lastLog: z.string(),
  totalEntries: z.number(),
  logs: z.array(AuditLogEntrySchema),
});

export type AuditLogFile = z.infer<typeof AuditLogFileSchema>;
