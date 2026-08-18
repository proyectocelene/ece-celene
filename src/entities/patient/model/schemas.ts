import { z } from 'zod';

/**
 * Esquema para una condición crónica estructurada / diagnóstico de base
 */
export const ChronicConditionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'El nombre de la condición es requerido'),
  diagnosedDate: z.string().optional().default(''), // YYYY o YYYY-MM o YYYY-MM-DD
  status: z.enum(['Controlada', 'Descontrolada', 'En seguimiento', 'En estudio']).default('Controlada'),
  currentTreatment: z.string().optional().default(''), // Tratamiento farmacológico actual
  modificationsNotes: z.string().optional().default(''), // Ajustes recientes
  linkedMedications: z.array(z.string()).default([]), // Fármacos asociados a esta condición
});

export type ChronicCondition = z.infer<typeof ChronicConditionSchema>;

/**
 * Esquema para los datos demográficos del paciente
 */
export const PatientDemographicsSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'Los apellidos son requeridos'),
  birthDate: z.string().min(1, 'La fecha de nacimiento es requerida'), // ISO Date string YYYY-MM-DD
  gender: z.enum(['M', 'F', 'Otro', 'No especificado']),
  curpOrId: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  hasWhatsApp: z.boolean().optional().default(false),
  whatsappPhone: z.string().optional().default(''),
  email: z.string().email('Email inválido').optional().or(z.literal('')).default(''),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Desconocido']).default('Desconocido'),
  address: z.string().optional().default(''),
  emergencyContact: z.object({
    name: z.string().optional().default(''),
    relationship: z.string().optional().default(''),
    phone: z.string().optional().default(''),
  }).default({
    name: '',
    relationship: '',
    phone: '',
  }),
});

/**
 * Esquema para los antecedentes médicos fijos
 */
export const PatientBackgroundSchema = z.object({
  ahf: z.string().optional().default(''), // Heredofamiliares
  app: z.string().optional().default(''), // Personales Patológicos
  apnp: z.string().optional().default(''), // Personales No Patológicos
  ago: z.string().optional().default(''), // Gineco-obstétricos
}).default({
  ahf: '',
  app: '',
  apnp: '',
  ago: '',
});

/**
 * Esquema principal de paciente.json
 */
export const PatientSchema = z.object({
  id: z.string().min(1),
  schemaVersion: z.literal('1.0.0').default('1.0.0'),
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
  demographics: PatientDemographicsSchema,
  background: PatientBackgroundSchema.optional().default({ ahf: '', app: '', apnp: '', ago: '' }),
  allergies: z.array(z.string()).default([]),
  activeConditions: z.array(z.string()).default([]),
  chronicConditions: z.array(ChronicConditionSchema).default([]),
  notesCount: z.number().int().nonnegative().default(0),
  attachmentsCount: z.number().int().nonnegative().default(0),
});

export type PatientDemographics = z.infer<typeof PatientDemographicsSchema>;
export type PatientBackground = z.infer<typeof PatientBackgroundSchema>;
export type Patient = z.infer<typeof PatientSchema>;

/**
 * Esquema para un registro dentro de index_pacientes.json
 */
export const PatientIndexEntrySchema = z.object({
  id: z.string(),
  folderName: z.string(),
  fullName: z.string(),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
  phone: z.string().optional(),
  hasWhatsApp: z.boolean().optional(),
  curpOrId: z.string().optional(),
  allergiesCount: z.number().default(0),
  notesCount: z.number().default(0),
  chronicConditionsCount: z.number().default(0),
  lastConsultationDate: z.string().optional(),
  updatedAt: z.string(),
});

export const PatientIndexFileSchema = z.object({
  version: z.literal('1.0.0').default('1.0.0'),
  lastSync: z.string(),
  totalPatients: z.number(),
  patients: z.array(PatientIndexEntrySchema),
});

export type PatientIndexEntry = z.infer<typeof PatientIndexEntrySchema>;
export type PatientIndexFile = z.infer<typeof PatientIndexFileSchema>;
