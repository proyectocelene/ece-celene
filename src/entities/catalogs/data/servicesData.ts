export interface ClinicServiceItem {
  id: string;
  categoria: string;
  nombre: string;
  costoPrivado: number;
  cuotaCelene: number;
}

export const CLINIC_SERVICES_CATALOG: ClinicServiceItem[] = [
  // 1. Consultas y Valoraciones
  {
    id: 'srv-1',
    categoria: 'Consultas y Valoraciones',
    nombre: 'Orientación Médica',
    costoPrivado: 400,
    cuotaCelene: 0,
  },
  {
    id: 'srv-2',
    categoria: 'Consultas y Valoraciones',
    nombre: 'Consulta Médica General',
    costoPrivado: 650,
    cuotaCelene: 150,
  },
  {
    id: 'srv-3',
    categoria: 'Consultas y Valoraciones',
    nombre: 'Consulta Virtual',
    costoPrivado: 650,
    cuotaCelene: 150,
  },
  {
    id: 'srv-4',
    categoria: 'Consultas y Valoraciones',
    nombre: 'Certificado Médico',
    costoPrivado: 400,
    cuotaCelene: 150,
  },

  // 2. Salud Femenina, Reproductiva e ITS
  {
    id: 'srv-5',
    categoria: 'Salud Femenina, Reproductiva e ITS',
    nombre: 'Mastografía (Vale)',
    costoPrivado: 1150,
    cuotaCelene: 0,
  },
  {
    id: 'srv-6',
    categoria: 'Salud Femenina, Reproductiva e ITS',
    nombre: 'Prueba Rápida de VIH',
    costoPrivado: 450,
    cuotaCelene: 0,
  },
  {
    id: 'srv-7',
    categoria: 'Salud Femenina, Reproductiva e ITS',
    nombre: 'Papanicolaou',
    costoPrivado: 800,
    cuotaCelene: 150,
  },
  {
    id: 'srv-8',
    categoria: 'Salud Femenina, Reproductiva e ITS',
    nombre: 'Prueba de Embarazo en Sangre',
    costoPrivado: 400,
    cuotaCelene: 50,
  },
  {
    id: 'srv-9',
    categoria: 'Salud Femenina, Reproductiva e ITS',
    nombre: 'Panel ITS Completo',
    costoPrivado: 2250,
    cuotaCelene: 600,
  },
  {
    id: 'srv-10',
    categoria: 'Salud Femenina, Reproductiva e ITS',
    nombre: 'Implante Subdérmico (Coloc/Retiro)',
    costoPrivado: 2250,
    cuotaCelene: 400,
  },
  {
    id: 'srv-11',
    categoria: 'Salud Femenina, Reproductiva e ITS',
    nombre: 'DIU (Colocación/Retiro)',
    costoPrivado: 2000,
    cuotaCelene: 450,
  },

  // 3. Laboratorios y Monitoreo
  {
    id: 'srv-12',
    categoria: 'Laboratorios y Monitoreo',
    nombre: 'Hemoglobina Glucosilada (HbA1c)',
    costoPrivado: 550,
    cuotaCelene: 150,
  },
  {
    id: 'srv-13',
    categoria: 'Laboratorios y Monitoreo',
    nombre: 'Antígeno Prostático (PSA)',
    costoPrivado: 600,
    cuotaCelene: 150,
  },
  {
    id: 'srv-14',
    categoria: 'Laboratorios y Monitoreo',
    nombre: 'Prueba Rápida COVID-19',
    costoPrivado: 600,
    cuotaCelene: 150,
  },
  {
    id: 'srv-15',
    categoria: 'Laboratorios y Monitoreo',
    nombre: 'Toma de Glucosa Capilar',
    costoPrivado: 150,
    cuotaCelene: 30,
  },
  {
    id: 'srv-16',
    categoria: 'Laboratorios y Monitoreo',
    nombre: 'Toma de Presión / Peso y Talla',
    costoPrivado: 75,
    cuotaCelene: 15,
  },

  // 4. Procedimientos Menores y Clínica del Dolor
  {
    id: 'srv-17',
    categoria: 'Procedimientos Menores y Clínica del Dolor',
    nombre: 'Inyección de Puntos Gatillo (TPI)',
    costoPrivado: 1150,
    cuotaCelene: 300,
  },
  {
    id: 'srv-18',
    categoria: 'Procedimientos Menores y Clínica del Dolor',
    nombre: 'Curación de Heridas',
    costoPrivado: 750,
    cuotaCelene: 250,
  },
  {
    id: 'srv-19',
    categoria: 'Procedimientos Menores y Clínica del Dolor',
    nombre: 'Sutura',
    costoPrivado: 1750,
    cuotaCelene: 350,
  },
  {
    id: 'srv-20',
    categoria: 'Procedimientos Menores y Clínica del Dolor',
    nombre: 'Lavado de Oídos',
    costoPrivado: 700,
    cuotaCelene: 250,
  },
  {
    id: 'srv-21',
    categoria: 'Procedimientos Menores y Clínica del Dolor',
    nombre: 'Drenaje de Absceso',
    costoPrivado: 1750,
    cuotaCelene: 400,
  },
  {
    id: 'srv-22',
    categoria: 'Procedimientos Menores y Clínica del Dolor',
    nombre: 'Retiro de Verrugas',
    costoPrivado: 1400,
    cuotaCelene: 350,
  },
  {
    id: 'srv-23',
    categoria: 'Procedimientos Menores y Clínica del Dolor',
    nombre: 'Retiro de Suturas',
    costoPrivado: 450,
    cuotaCelene: 150,
  },
  {
    id: 'srv-24',
    categoria: 'Procedimientos Menores y Clínica del Dolor',
    nombre: 'Aplicación de Inyecciones',
    costoPrivado: 150,
    cuotaCelene: 40,
  },
];
