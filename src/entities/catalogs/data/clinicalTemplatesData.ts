/**
 * Catálogo centralizado de plantillas clínicas y guías semiológicas
 */

export interface SubjectiveTemplate {
  id: string;
  name: string;
  reasonForVisit: string;
  currentIllness: string;
  systemsReview?: string;
}

export const DEFAULT_SUBJECTIVE_TEMPLATES: SubjectiveTemplate[] = [
  {
    id: 'ivrs',
    name: 'Infección Respiratoria Aguda (IVRS)',
    reasonForVisit: 'Tos, rinorrea, dolor de garganta y malestar general',
    currentIllness: 'Inicia padecimiento actual hace 3 días con rinorrea hialina progresiva, odinofagia de moderada intensidad, tos seca ocasional, febrícula no cuantificada y astenia. Refiere haber tomado paracetamol con mejoría parcial temporal. Niega dificultad respiratoria o dolor torácico.',
    systemsReview: 'Respiratorio: Rinorrea y odinofagia. Resto de aparatos y sistemas interrogados y negados.',
  },
  {
    id: 'gastro',
    name: 'Gastroenteritis Aguda / Diarrea',
    reasonForVisit: 'Evacuaciones diarreicas, dolor abdominal y náusea',
    currentIllness: 'Inicia padecimiento actual hace 24 horas tras ingesta de alimentos en la vía pública, caracterizado por dolor abdominal tipo cólico difuso de intensidad 6/10, acompañado de 4 evacuaciones diarreicas líquidas sin sangre ni moco, náuseas y dos episodios de vómito de contenido gastroalimentario. Refiere sed moderada y tolerancia a líquidos por vía oral.',
    systemsReview: 'Digestivo: Dolor cólico y diarrea. Cardiovascular y respiratorio sin alteraciones referidas.',
  },
  {
    id: 'control-dm2-hta',
    name: 'Control y Seguimiento DM2 / HTA',
    reasonForVisit: 'Consulta de control mensual de Diabetes e Hipertensión',
    currentIllness: 'Paciente acude a valoración y control de enfermedades crónicas. Asintomático cardiovascular y neurológicamente al momento de la consulta. Refiere adecuada adherencia a su tratamiento farmacológico actual y dieta. Reporta cifras tensionales en domicilio promedio de 125/80 mmHg y glucemias capilares en ayuno entre 110 y 130 mg/dL. Niega cefalea, fosfenos, acúfenos, dolor precordial, disnea o parestesias.',
    systemsReview: 'Interrogatorio por aparatos y sistemas sin sintomatología aguda.',
  },
  {
    id: 'ivu',
    name: 'Infección de Vías Urinarias (IVU)',
    reasonForVisit: 'Ardor al orinar, polaquiuria y dolor suprapúbico',
    currentIllness: 'Inicia hace 48 horas con disuria de tipo ardoroso al orinar, polaquiuria, tenesmo vesical y sensación de vaciamiento incompleto. Se agrega dolor sordo en región hipogástrica / suprapúbica. Niega hematuria macroscópica, fiebre o dolor en fosas lumbares.',
    systemsReview: 'Genitourinario: Disuria y polaquiuria. Resto sin datos patológicos.',
  },
  {
    id: 'cefalea',
    name: 'Cefalea Tensional / Migrañosa',
    reasonForVisit: 'Cefalea intensa y pesadez en cuello',
    currentIllness: 'Refiere cefalea de 2 días de evolución, de tipo opresivo / pulsátil, holocraneana con predominio frontal y occipital, intensidad 7/10 en escala EVA, exacerbada por estrés laboral y fatiga visual. Acompañada de fotofobia leve. Niega náusea, vómito en proyectil, fiebre o pérdida de consciencia.',
    systemsReview: 'Neurológico: Cefalea descrita. Pares craneales y agudeza visual sin cambios reportados.',
  },
  {
    id: 'lumbalgia',
    name: 'Lumbalgia Mecánica / Espasmo Muscular',
    reasonForVisit: 'Dolor en espalda baja tras esfuerzo físico',
    currentIllness: 'Inicia hace 2 días tras realizar levantamiento de objeto pesado, presentando dolor de tipo punzante / opresivo en región lumbar baja (L4-S1), intensidad 7/10, que se exacerba con la bipedestación prolongada y la flexión del tronco, cediendo parcialmente con el reposo en decúbito. Niega irradiación a miembros inferiores, parestesias o alteraciones de esfínteres.',
    systemsReview: 'Musculoesquelético: Dolor y limitación funcional lumbar. Sin compromiso neurológico referido.',
  },
];

export interface ObjectiveSegmentTemplates {
  generalAppearance: { id: string; name: string; text: string }[];
  headAndNeck: { id: string; name: string; text: string }[];
  chestAndLungs: { id: string; name: string; text: string }[];
  abdomen: { id: string; name: string; text: string }[];
  extremities: { id: string; name: string; text: string }[];
  neurological: { id: string; name: string; text: string }[];
}

export const DEFAULT_OBJECTIVE_SEGMENT_TEMPLATES: ObjectiveSegmentTemplates = {
  generalAppearance: [
    {
      id: 'normal',
      name: 'Normal / Eutrófico',
      text: 'Paciente consciente, orientado en tiempo, espacio y persona, edad biológica aparente concuerda con la cronológica, buena coloración e hidratación de piel y mucosas, marcha y actitud normales.',
    },
    {
      id: 'agudo-dolor',
      name: 'Facies de dolor / Afebril',
      text: 'Paciente consciente, orientado, facies álgica de dolor moderado, hidratación adecuada de mucosas, actitud libremente escogida, marcha ligeramente claudicante por molestia, cooperador al interrogatorio.',
    },
    {
      id: 'deshidratado',
      name: 'Deshidratación leve / Mucosas secas',
      text: 'Paciente consciente, orientado en 3 esferas, biotipo normolíneo, con datos de deshidratación leve reflejada en mucosas orales subhidratadas y saliva filante. Sin datos de choque ni compromiso hemodinámico.',
    },
  ],
  headAndNeck: [
    {
      id: 'normal',
      name: 'Normal',
      text: 'Normocéfalo, pupilas isocóricas y normorreflecticas, narinas permeables, cavidad oral y faringe sin hiperemia ni exudados, amígdalas eutróficas. Cuello cilíndrico, móvil, sin adenopatías palpables ni ingurgitación yugular.',
    },
    {
      id: 'faringo',
      name: 'Faringoamigdalitis Aguda',
      text: 'Pupilas isocóricas y fotorreactivas. Narinas con mucosa eritematosa y rinorrea hialina. Cavidad oral: orofaringe intensamente hiperémica, amígdalas hipertróficas grado II-III con exudado blanquecino pultáceo bilateral, úvula central. Cuello con adenopatías yugulodigástricas bilaterales dolorosas a la palpación de aprox 1 cm, móviles.',
    },
    {
      id: 'otitis',
      name: 'Otoscopía Patológica / Otitis',
      text: 'Conducto auditivo externo permeable. Membrana timpánica hiperémica, opaca, abombada y con pérdida del reflejo luminoso. Orofaringe con hiperemia leve. Cuello móvil sin adenopatías dolorosas.',
    },
  ],
  chestAndLungs: [
    {
      id: 'normal',
      name: 'Normal',
      text: 'Tórax normolíneo con adecuada mecánica ventilatoria y simetría. Campos pulmonares bien ventilados con murmullo vesicular presente bilateral, sin ruidos agregados (estertores ni sibilancias). Ruidos cardíacos rítmicos y de buen tono, sin soplos ni galopes.',
    },
    {
      id: 'bronco-asma',
      name: 'Broncoespasmo / Sibilancias',
      text: 'Tórax con tiraje intercostal leve. Campos pulmonares con entrada de aire disminuida globalmente, con presencia de sibilancias espiratorias bilaterales difusas y estertores roncantes. Ruidos cardíacos rítmicos taquicárdicos, sin soplos.',
    },
    {
      id: 'estertores',
      name: 'Estertores Crepitantes / Infección',
      text: 'Amplexión y amplexación conservadas. Se auscultan estertores crepitantes y subcrepitantes basales derechos, con aumento local del murmullo vesicular. Ruidos cardíacos rítmicos de buen tono sin soplos audibles.',
    },
  ],
  abdomen: [
    {
      id: 'normal',
      name: 'Normal',
      text: 'Abdomen plano, blando, depresible, no doloroso a la palpación superficial ni profunda, sin datos de irritación peritoneal, sin visceromegalias palpables. Ruidos hidroaéreos presentes y de tono normal.',
    },
    {
      id: 'dolor-epigastrio',
      name: 'Gastralgia / Dolor en Epigastrio',
      text: 'Abdomen blando, depresible, con dolor a la palpación media y profunda en epigastrio y mesogastrio, sin rebote (Blumberg negativo), sin defensa muscular involuntaria. Ruidos hidroaéreos normoactivos.',
    },
    {
      id: 'colico-diarrea',
      name: 'Hiperperistalsis / Cólico difuso',
      text: 'Abdomen moderadamente distendido, timpánico a la percusión, doloroso de manera difusa en marco cólico sin puntos de focalización apendicular ni vesicular. Ruidos hidroaéreos aumentados en frecuencia e intensidad (hiperperistalsis). Sin visceromegalias.',
    },
    {
      id: 'fosa-iliaca',
      name: 'Dolor en Fosa Ilíaca Derecha',
      text: 'Abdomen con dolor localizado a la palpación en fosa ilíaca derecha, punto de McBurney dudoso/positivo, signo de Blumberg negativo, signo de Rovsing negativo, sin plastrón palpable. Ruidos hidroaéreos presentes.',
    },
  ],
  extremities: [
    {
      id: 'normal',
      name: 'Normal',
      text: 'Extremidades simétricas, íntegras, arcos de movilidad articular completos, fuerza muscular 5/5 bilateral, pulsos periféricos palpables y simétricos, llenado capilar inmediato menor a 2 segundos, sin edema.',
    },
    {
      id: 'pie-diabetico',
      name: 'Pie Diabético / Exploración Vascular y Sensitiva',
      text: 'Extremidades inferiores íntegras, sin úlceras, fisuras ni zonas de hiperqueratosis patológica. Pulsos pedios y tibiales posteriores presentes y simétricos (++). Sensibilidad conservada al monofilamento Semmes-Weinstein (10g) en 10 puntos plantares bilaterales. Llenado capilar < 2 seg.',
    },
    {
      id: 'edema',
      name: 'Edema de Miembros Inferiores',
      text: 'Extremidades inferiores con presencia de edema bilateral simétrico que deja fóvea grado II/IV hasta tercio medio pretibial. Cambios tróficos cutáneos leves. Pulsos periféricos palpables.',
    },
    {
      id: 'lumbago-lassegue',
      name: 'Columna Lumbar y Maniobra de Lasègue',
      text: 'Columna con contractura de músculos paravertebrales lumbares bilaterales y dolor a la digitopresión. Arcos de flexoextensión limitados por dolor. Maniobra de Lasègue negativa bilateral (sin irradiación radicular). Fuerza motora 5/5 y sensibilidad conservada.',
    },
  ],
  neurological: [
    {
      id: 'normal',
      name: 'Normal',
      text: 'Funciones mentales superiores íntegras, pares craneales conservados sin alteraciones, fuerza y sensibilidad preservadas, reflejos osteotendinosos normorreflecticos (++/++++), sin signos meníngeos ni focalización neurológica.',
    },
    {
      id: 'cefalea-neuro',
      name: 'Neurológico en Cefalea (Sin focalización)',
      text: 'Alerta, consciente, funciones cognitivas íntegras. Pares craneales I al XII sin déficit. Fuerza motora simétrica 5/5 en las 4 extremidades. Sensibilidad superficial y profunda intacta. Reflejos osteotendinosos simétricos. Signos meníngeos (rigidez de nuca, Kernig, Brudzinski) negativos.',
    },
  ],
};

/**
 * Sugerencias rápidas de horarios de administración
 */
export const SCHEDULE_SUGGESTIONS = [
  { label: 'Cada 8 horas (08:00, 16:00, 24:00)', value: 'Cada 8 horas (08:00, 16:00, 24:00)' },
  { label: 'Cada 12 horas (08:00 y 20:00 con alimentos)', value: 'Cada 12 horas (08:00 y 20:00)' },
  { label: 'Cada 24 horas por la mañana (08:00 hrs en ayunas)', value: 'Cada 24 horas por la mañana (08:00 hrs)' },
  { label: 'Cada 24 horas por la noche (21:00 hrs al acostarse)', value: 'Cada 24 horas por la noche (21:00 hrs)' },
  { label: 'Cada 6 horas (06:00, 12:00, 18:00, 24:00)', value: 'Cada 6 horas (06:00, 12:00, 18:00, 24:00)' },
  { label: 'En caso de dolor o fiebre > 38°C (máx cada 8 hrs)', value: 'En caso de dolor o fiebre (SOS)' },
  { label: 'Dosis única', value: 'Dosis única' },
  { label: 'Cada 4 a 6 horas según necesidad', value: 'Cada 4 a 6 horas según necesidad' },
];

/**
 * Instrucciones de preparación de estudios de laboratorio y gabinete
 */
export const LAB_STUDY_PREPARATIONS: Record<string, string> = {
  'Biometría Hemática Completa (BHC)': 'Ayuno mínimo de 4 a 6 horas.',
  'Química Sanguínea (6 elementos: Glucosa, Urea, Creatinina, Ác. Úrico, Colesterol, Triglicéridos)': 'Ayuno estricto de 8 a 12 horas. No ingerir bebidas alcohólicas ni alimentos ricos en grasas 24 horas antes.',
  'Examen General de Orina (EGO)': 'Recolectar la primera orina de la mañana (chorro medio), previo aseo genital con agua y jabón, en frasco estéril.',
  'Perfil Lipídico Completo': 'Ayuno de 10 a 12 horas. Evitar comidas copiosas o grasas el día anterior.',
  'Hemoglobina Glucosilada (HbA1c)': 'No requiere ayuno estricto obligatoriamente, pero se sugiere ayuno de 4 a 8 horas si se combina con glucosa plasmática.',
  'Pruebas de Funcionamiento Hepático (PFH)': 'Ayuno de 8 a 10 horas. Evitar consumo de alcohol y medicamentos hepatotóxicos no esenciales.',
  'Perfil Tiroideo (TSH, T3, T4 Libre)': 'Ayuno de 6 a 8 horas por la mañana. Tomar la muestra preferentemente antes de la dosis de levotiroxina.',
  'Tele de Tórax (PA)': 'Presentarse con ropa cómoda sin botones, broches metálicos ni collares en la región del tórax.',
  'Ultrasonido Abdominal / Pélvico': 'Ayuno de 8 horas para abdomen superior. Para ultrasonido pélvico o ginecológico: tomar 1 litro de agua 1 hora antes y retener la orina (vejiga llena).',
  'Electrocardiograma (EKG) de 12 derivaciones': 'Presentarse con ropa cómoda fácil de desabotonar, sin cremas corporales en el pecho, reposar 10 min antes.',
  'Antígeno Prostático Específico (PSA)': 'Abstinencia sexual y eyaculatoria de 48 horas previas; no montar bicicleta ni haberse realizado tacto rectal en 48 horas.',
  'Mastografía Bilateral': 'Presentarse aseada, sin aplicarse desodorante, antitranspirante, talco, loción ni cremas en axilas o mamas. Ropa de dos piezas.',
  'Papanicolaou / Citología Cervical': 'No tener relaciones sexuales 48 horas antes, no estar en periodo menstrual, no aplicar óvulos, cremas ni duchas vaginales 48 horas previas.',
};
