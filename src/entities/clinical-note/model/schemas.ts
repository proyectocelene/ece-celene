import { z } from 'zod';

/**
 * 1. Signos Vitales y Somatometría
 */
export const VitalSignsSchema = z.object({
  bpSystolic: z.number().int().positive().optional(),
  bpDiastolic: z.number().int().positive().optional(),
  heartRate: z.number().int().positive().optional(),
  respiratoryRate: z.number().int().positive().optional(),
  temperature: z.number().positive().optional(),
  weightKg: z.number().positive().optional(),
  heightCm: z.number().positive().optional(),
  spO2: z.number().min(0).max(100).optional(),
  glucose: z.number().positive().optional(),
  bmi: z.number().optional(),
}).default({});

/**
 * 2. Subjetivo (Interrogatorio)
 */
export const SubjectiveSchema = z.object({
  reasonForVisit: z.string().optional().default(''),
  currentIllness: z.string().optional().default(''),
  systemsReview: z.string().optional().default(''),
}).default({
  reasonForVisit: '',
  currentIllness: '',
  systemsReview: '',
});

/**
 * 3. Objetivo (Exploración Física Segmentaria)
 */
export const ObjectiveSchema = z.object({
  generalAppearance: z.string().optional().default(''),
  headAndNeck: z.string().optional().default(''),
  chestAndLungs: z.string().optional().default(''),
  abdomen: z.string().optional().default(''),
  extremities: z.string().optional().default(''),
  neurological: z.string().optional().default(''),
}).default({
  generalAppearance: '',
  headAndNeck: '',
  chestAndLungs: '',
  abdomen: '',
  extremities: '',
  neurological: '',
});

/**
 * 4. Diagnósticos (Impresión Diagnóstica / CIE-10)
 */
export const DiagnosisItemSchema = z.object({
  id: z.string().default(''),
  cie10Code: z.string().optional().default(''),
  code: z.string().optional(),
  description: z.string().default(''),
  type: z.string().optional().default('presuntivo'),
  notes: z.string().optional().default(''),
});

/**
 * 5. Medicamentos y Prescripción
 */
export const PrescriptionItemSchema = z.object({
  id: z.string().default(''),
  medication: z.string().default(''),
  presentation: z.string().optional().default(''),
  dosage: z.string().optional().default(''),
  frequency: z.string().optional().default(''),
  route: z.enum(['Oral', 'Intravenosa', 'Intramuscular', 'Tópica', 'Oftálmica', 'Inhalatoria', 'Sublingual', 'Otra']).default('Oral'),
  duration: z.string().optional().default(''),
  instructions: z.string().optional().default(''),
  indicationFor: z.string().optional().default(''),
});

/**
 * 6. Orden de Laboratorio / Gabinete
 */
export const LabOrderSchema = z.object({
  studies: z.array(z.string()).default([]),
  otherStudies: z.string().optional().default(''),
  fastingHours: z.number().int().nonnegative().optional().default(8),
  clinicalNotes: z.string().optional().default(''),
  urgency: z.enum(['Ordinario', 'Urgente']).default('Ordinario'),
}).default({
  studies: [],
  otherStudies: '',
  fastingHours: 8,
  clinicalNotes: '',
  urgency: 'Ordinario',
});

/**
 * 7. Recibo de Donativo y Servicios Otorgados
 */
export const ReceiptServiceItemSchema = z.object({
  id: z.string().default(''),
  description: z.string().default(''),
  commercialCost: z.number().optional().default(0),
  amount: z.number().default(0),
  isSubsidized: z.boolean().optional().default(false),
});

export const ReceiptSchema = z.object({
  receiptFolio: z.string().default(''),
  services: z.array(ReceiptServiceItemSchema).default([]),
  totalCommercial: z.number().optional().default(0),
  totalSubsidy: z.number().optional().default(0),
  totalAmount: z.number().default(0),
  receivedAmount: z.number().optional().default(0),
  pendingAmount: z.number().optional().default(0),
  paymentMethod: z.enum(['Efectivo', 'Transferencia', 'Tarjeta', 'Donativo Exento', 'Cuota de Recuperación']).default('Efectivo'),
  notes: z.string().optional().default(''),
}).default({
  receiptFolio: '',
  services: [],
  totalCommercial: 0,
  totalSubsidy: 0,
  totalAmount: 0,
  receivedAmount: 0,
  pendingAmount: 0,
  paymentMethod: 'Efectivo',
  notes: '',
});

/**
 * Plan de Manejo General
 */
export const PlanSchema = z.object({
  generalPlan: z.string().default(''),
  nonPharmacological: z.string().default(''),
  warningSigns: z.string().default(''),
  followUpDate: z.string().optional().default(''),
  prescriptions: z.array(PrescriptionItemSchema).default([]),
}).default({
  generalPlan: '',
  nonPharmacological: '',
  warningSigns: '',
  followUpDate: '',
  prescriptions: [],
});

/**
 * Schema principal de cada Consulta / Nota Clínica
 */
export const ClinicalNoteSchema = z.object({
  id: z.string().min(1),
  patientId: z.string().min(1),
  fileName: z.string().min(1),
  schemaVersion: z.literal('1.0.0').default('1.0.0'),
  date: z.string(),
  noteType: z.enum(['Consulta General', 'Seguimiento / Control', 'Urgencia', 'Interconsulta', 'Preoperatoria']).default('Consulta General'),
  vitalSigns: VitalSignsSchema.optional().default({}),
  subjective: SubjectiveSchema.optional().default({ reasonForVisit: '', currentIllness: '', systemsReview: '' }),
  objective: ObjectiveSchema.optional().default({ generalAppearance: '', headAndNeck: '', chestAndLungs: '', abdomen: '', extremities: '', neurological: '' }),
  diagnoses: z.array(DiagnosisItemSchema).default([]),
  plan: PlanSchema.optional().default({ generalPlan: '', nonPharmacological: '', warningSigns: '', followUpDate: '', prescriptions: [] }),
  labOrder: LabOrderSchema.optional(),
  receipt: ReceiptSchema.optional(),
  attendingDoctorName: z.string().nullable().optional(),
  attendingDoctorTitle: z.string().nullable().optional(),
  attendingDoctorLicense: z.string().nullable().optional(),
  attendingDoctorRole: z.string().nullable().optional(),
  supervisorDoctorName: z.string().nullable().optional(),
  supervisorDoctorTitle: z.string().nullable().optional(),
  supervisorDoctorLicense: z.string().nullable().optional(),
  createdAt: z.string().optional().default(() => new Date().toISOString()),
  updatedAt: z.string().optional().default(() => new Date().toISOString()),
});

export type VitalSigns = z.infer<typeof VitalSignsSchema>;
export type Subjective = z.infer<typeof SubjectiveSchema>;
export type Objective = z.infer<typeof ObjectiveSchema>;
export type DiagnosisItem = z.infer<typeof DiagnosisItemSchema>;
export type PrescriptionItem = z.infer<typeof PrescriptionItemSchema>;
export type LabOrder = z.infer<typeof LabOrderSchema>;
export type Receipt = z.infer<typeof ReceiptSchema>;
export type ReceiptServiceItem = z.infer<typeof ReceiptServiceItemSchema>;
export type ClinicalPlan = z.infer<typeof PlanSchema>;
export type ClinicalNote = z.infer<typeof ClinicalNoteSchema>;
