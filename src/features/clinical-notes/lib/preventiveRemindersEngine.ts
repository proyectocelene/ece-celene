import type { Patient } from '@/entities/patient/model/schemas';
import { PatientService } from '@/entities/patient/api/patientService';

export interface PreventiveReminder {
  id: string;
  category: 'Ginecología / Mujer' | 'Urología / Hombre' | 'Diabetes Mellitus' | 'Hipertensión Arterial' | 'Adulto Mayor' | 'General';
  title: string;
  description: string;
  recommendation: string;
  badgeText: string;
  associatedStudy?: string;
  associatedExamSegment?: 'extremities' | 'headAndNeck' | 'chestAndLungs' | 'abdomen' | 'generalAppearance';
  priority: 'high' | 'medium' | 'info';
}

export class PreventiveRemindersEngine {
  /**
   * Evalúa y devuelve las alertas y recordatorios preventivos inteligentes individualizados para el paciente
   */
  static getRemindersForPatient(patient: Patient): PreventiveReminder[] {
    const reminders: PreventiveReminder[] = [];
    const age = PatientService.calculateAge(patient.demographics.birthDate);
    const years = age.years;
    const gender = (patient.demographics.gender || '').toUpperCase();

    const chronicNames = (patient.chronicConditions || []).map((c) => c.name.toLowerCase());
    const isDiabetic = chronicNames.some((n) => n.includes('diab') || n.includes('dm2') || n.includes('dm1'));
    const isHypertensive = chronicNames.some((n) => n.includes('hiperten') || n.includes('hta') || n.includes('presion'));

    // 1. Mastografía Preventiva (Mujeres >= 40 años)
    if ((gender === 'F' || gender === 'FEMENINO') && years >= 40) {
      reminders.push({
        id: 'mastografia',
        category: 'Ginecología / Mujer',
        title: 'Tamizaje de Mama: Mastografía Bilateral',
        description: 'Mujer de 40 años o más. Se recomienda mastografía bilateral de tamizaje cada 1 a 2 años según la NOM-041-SSA2.',
        recommendation: 'Preguntar si ya se realizó su mastografía este año o emitir orden de estudio.',
        badgeText: 'Mastografía Anual',
        associatedStudy: 'Mastografía Bilateral',
        priority: years >= 50 ? 'high' : 'medium',
      });
    }

    // 2. Papanicolaou / Citología Cervical (Mujeres 21 a 65 años)
    if ((gender === 'F' || gender === 'FEMENINO') && years >= 21 && years <= 65) {
      reminders.push({
        id: 'papanicolaou',
        category: 'Ginecología / Mujer',
        title: 'Tamizaje Cervicouterino: Papanicolaou / VPH',
        description: 'Paciente en rango de tamizaje para prevención de Cáncer Cervicouterino (CACU).',
        recommendation: 'Verificar si cuenta con citología cervical vigente en los últimos 12 meses.',
        badgeText: 'Papanicolaou Vigente',
        associatedStudy: 'Papanicolaou / Citología Cervical',
        priority: 'medium',
      });
    }

    // 3. Antígeno Prostático Específico (Hombres >= 45 años)
    if ((gender === 'M' || gender === 'MASCULINO') && years >= 45) {
      reminders.push({
        id: 'psa',
        category: 'Urología / Hombre',
        title: 'Tamizaje Prostático: PSA y Evaluación Urológica',
        description: 'Hombre de 45 años o más. Indicado tamizaje anual de Antígeno Prostático Específico (PSA total).',
        recommendation: 'Preguntar por sintomatología prostática obstructiva (chorro débil, nicturia) y solicitar PSA.',
        badgeText: 'PSA Anual',
        associatedStudy: 'Antígeno Prostático Específico (PSA)',
        priority: years >= 50 ? 'high' : 'medium',
      });
    }

    // 4. Recordatorios Dedicados para Paciente Diabético
    if (isDiabetic) {
      reminders.push({
        id: 'pie-diabetico',
        category: 'Diabetes Mellitus',
        title: 'Exploración Preventiva de Pies (Pie Diabético)',
        description: 'Revisión obligatoria en cada consulta: inspección plantar, pulsos pedios, integridad de la piel y prueba con monofilamento.',
        recommendation: 'Explorar extremidades inferiores y registrar ausencia de lesiones o zonas de presión.',
        badgeText: 'Exploración de Pies',
        associatedExamSegment: 'extremities',
        priority: 'high',
      });

      reminders.push({
        id: 'fondo-ojo-dm2',
        category: 'Diabetes Mellitus',
        title: 'Fondo de Ojo Anual (Retinopatía Diabética)',
        description: 'Evaluación oftalmológica anual con dilatación pupilar para detección temprana de retinopatía.',
        recommendation: 'Preguntar fecha de su última valoración por Oftalmología / Optometría.',
        badgeText: 'Fondo de Ojo',
        associatedExamSegment: 'headAndNeck',
        priority: 'medium',
      });

      reminders.push({
        id: 'hba1c-semestral',
        category: 'Diabetes Mellitus',
        title: 'Control Glucémico: Hemoglobina Glucosilada (HbA1c)',
        description: 'Monitoreo de HbA1c cada 3 a 6 meses para evaluar meta terapéutica (< 7.0% o individualizada).',
        recommendation: 'Solicitar HbA1c si no cuenta con estudio en los últimos 3 meses.',
        badgeText: 'HbA1c Trimestral/Semestral',
        associatedStudy: 'Hemoglobina Glucosilada (HbA1c)',
        priority: 'high',
      });
    }

    // 5. Recordatorios Dedicados para Paciente Hipertenso
    if (isHypertensive) {
      reminders.push({
        id: 'ef-cardio-hta',
        category: 'Hipertensión Arterial',
        title: 'Exploración Cardiovascular y EKG',
        description: 'Paciente con HTA. Auscultación de carótidas, búsqueda de soplos, evaluación de pulsos periféricos y electrocardiograma anual.',
        recommendation: 'Descartar hipertrofia ventricular y solicitar EKG o Química Sanguínea con creatinina.',
        badgeText: 'Revisión Cardiovascular',
        associatedStudy: 'Electrocardiograma (EKG) de 12 derivaciones',
        associatedExamSegment: 'chestAndLungs',
        priority: 'medium',
      });
    }

    // 6. Adulto Mayor (>= 65 años)
    if (years >= 65) {
      reminders.push({
        id: 'adulto-mayor',
        category: 'Adulto Mayor',
        title: 'Inmunizaciones y Riesgo de Caídas',
        description: 'Adulto mayor: Verificar esquema de vacunación contra Neumococo e Influenza estacional; evaluar marcha y agudeza visual.',
        recommendation: 'Preguntar por caídas en los últimos 6 meses y vigencia de vacunas.',
        badgeText: 'Vacunación / Caídas',
        associatedExamSegment: 'generalAppearance',
        priority: 'info',
      });
    }

    return reminders;
  }
}
