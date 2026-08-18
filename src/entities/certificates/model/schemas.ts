import { z } from 'zod';
import { VitalSignsSchema } from '@/entities/clinical-note/model/schemas';

export const MedicalCertificateSchema = z.object({
  id: z.string().min(1),
  patientId: z.string().min(1),
  fileName: z.string().min(1),
  date: z.string(),
  type: z.string().default('Certificado de Salud General'),
  recipient: z.string().default('A QUIEN CORRESPONDA'),
  bloodType: z.string().default('No determinado / No especificado'),
  validityDays: z.number().default(30),
  vitals: VitalSignsSchema.optional().default({}),
  dictum: z.string().default('CLÍNICAMENTE SANO Y APTO PARA REALIZAR ACTIVIDADES DE LA VIDA DIARIA.'),
  physicalExamText: z.string().default(''),
  observations: z.string().default(''),
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

export type MedicalCertificate = z.infer<typeof MedicalCertificateSchema>;
