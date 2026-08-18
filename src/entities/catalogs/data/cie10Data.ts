export interface CIE10Entry {
  code: string;
  description: string;
  category?: string;
}

export const CIE10_CATALOG: CIE10Entry[] = [
  // Infecciones Respiratorias
  { code: 'J00', description: 'Rinofaringitis aguda (resfriado común)', category: 'Respiratorio' },
  { code: 'J01.9', description: 'Sinusitis aguda, no especificada', category: 'Respiratorio' },
  { code: 'J02.0', description: 'Faringitis estreptocócica', category: 'Respiratorio' },
  { code: 'J02.9', description: 'Faringitis aguda, no especificada', category: 'Respiratorio' },
  { code: 'J03.0', description: 'Amigdalitis estreptocócica aguda', category: 'Respiratorio' },
  { code: 'J03.9', description: 'Amigdalitis aguda, no especificada', category: 'Respiratorio' },
  { code: 'J04.0', description: 'Laringitis aguda', category: 'Respiratorio' },
  { code: 'J06.9', description: 'Infección aguda de las vías respiratorias superiores, no especificada', category: 'Respiratorio' },
  { code: 'J12.9', description: 'Neumonía viral, no especificada', category: 'Respiratorio' },
  { code: 'J15.9', description: 'Neumonía bacteriana, no especificada', category: 'Respiratorio' },
  { code: 'J18.9', description: 'Neumonía, no especificada', category: 'Respiratorio' },
  { code: 'J20.9', description: 'Bronquitis aguda, no especificada', category: 'Respiratorio' },
  { code: 'J30.1', description: 'Rinitis alérgica debida al polen', category: 'Respiratorio' },
  { code: 'J30.4', description: 'Rinitis alérgica, no especificada', category: 'Respiratorio' },
  { code: 'J44.1', description: 'Enfermedad pulmonar obstructiva crónica (EPOC) con exacerbación aguda', category: 'Respiratorio' },
  { code: 'J44.9', description: 'Enfermedad pulmonar obstructiva crónica, no especificada', category: 'Respiratorio' },
  { code: 'J45.0', description: 'Asma predominantemente alérgica', category: 'Respiratorio' },
  { code: 'J45.9', description: 'Asma, no especificada', category: 'Respiratorio' },
  { code: 'U07.1', description: 'COVID-19, virus identificado', category: 'Infecciosas' },

  // Cardiovascular
  { code: 'I10', description: 'Hipertensión esencial (primaria)', category: 'Cardiovascular' },
  { code: 'I11.9', description: 'Enfermedad cardíaca hipertensiva sin insuficiencia cardíaca', category: 'Cardiovascular' },
  { code: 'I20.9', description: 'Angina de pecho, no especificada', category: 'Cardiovascular' },
  { code: 'I21.9', description: 'Infarto agudo del miocardio, sin otra especificación', category: 'Cardiovascular' },
  { code: 'I25.1', description: 'Enfermedad aterosclerótica del corazón', category: 'Cardiovascular' },
  { code: 'I48.9', description: 'Fibrilación y aleteo auricular, no especificado', category: 'Cardiovascular' },
  { code: 'I50.9', description: 'Insuficiencia cardíaca, no especificada', category: 'Cardiovascular' },
  { code: 'I83.9', description: 'Venas varicosas de los miembros inferiores sin úlcera ni inflamación', category: 'Cardiovascular' },
  { code: 'I87.2', description: 'Insuficiencia venosa (crónica) (periférica)', category: 'Cardiovascular' },

  // Endocrino, Nutrición y Metabolismo
  { code: 'E10.9', description: 'Diabetes mellitus tipo 1 sin mención de complicación', category: 'Endocrino' },
  { code: 'E11.9', description: 'Diabetes mellitus tipo 2 sin mención de complicación', category: 'Endocrino' },
  { code: 'E11.65', description: 'Diabetes mellitus tipo 2 con hiperglucemia', category: 'Endocrino' },
  { code: 'E11.2', description: 'Diabetes mellitus tipo 2 con complicaciones renales (nefropatía)', category: 'Endocrino' },
  { code: 'E03.9', description: 'Hipotiroidismo, no especificado', category: 'Endocrino' },
  { code: 'E05.9', description: 'Tirotoxicosis (hipertiroidismo), no especificada', category: 'Endocrino' },
  { code: 'E66.0', description: 'Obesidad debida a exceso de calorías', category: 'Endocrino' },
  { code: 'E66.9', description: 'Obesidad, no especificada', category: 'Endocrino' },
  { code: 'E78.0', description: 'Hipercolesterolemia pura', category: 'Endocrino' },
  { code: 'E78.1', description: 'Hipertrigliceridemia pura', category: 'Endocrino' },
  { code: 'E78.2', description: 'Hiperlipidemia mixta (Dislipidemia)', category: 'Endocrino' },
  { code: 'E79.0', description: 'Hiperuricemia sin signos de artritis inflamatoria', category: 'Endocrino' },
  { code: 'M10.9', description: 'Gota, no especificada', category: 'Endocrino' },

  // Digestivo
  { code: 'K21.0', description: 'Enfermedad por reflujo gastroesofágico con esofagitis', category: 'Digestivo' },
  { code: 'K21.9', description: 'Enfermedad por reflujo gastroesofágico sin esofagitis', category: 'Digestivo' },
  { code: 'K29.1', description: 'Otras gastritis agudas', category: 'Digestivo' },
  { code: 'K29.7', description: 'Gastritis, no especificada', category: 'Digestivo' },
  { code: 'K30', description: 'Dispepsia funcional', category: 'Digestivo' },
  { code: 'K58.0', description: 'Síndrome del colon irritable con predominio de diarrea', category: 'Digestivo' },
  { code: 'K58.9', description: 'Síndrome del colon irritable sin diarrea', category: 'Digestivo' },
  { code: 'K59.0', description: 'Constipación (Estreñimiento)', category: 'Digestivo' },
  { code: 'K80.2', description: 'Cálculo de la vesícula biliar sin colecistitis (Colelitiasis)', category: 'Digestivo' },
  { code: 'K81.0', description: 'Colecistitis aguda', category: 'Digestivo' },
  { code: 'K64.9', description: 'Hemorroides, no especificadas', category: 'Digestivo' },
  { code: 'A09', description: 'Diarrea y gastroenteritis de presunto origen infeccioso', category: 'Digestivo' },

  // Genitourinario
  { code: 'N39.0', description: 'Infección de vías urinarias, sitio no especificado', category: 'Genitourinario' },
  { code: 'N30.0', description: 'Cistitis aguda', category: 'Genitourinario' },
  { code: 'N10', description: 'Nefritis túbulo-intersticial aguda (Pielonefritis aguda)', category: 'Genitourinario' },
  { code: 'N20.1', description: 'Cálculo del uréter (Urolitiasis)', category: 'Genitourinario' },
  { code: 'N40', description: 'Hiperplasia prostática benigna', category: 'Genitourinario' },
  { code: 'N76.0', description: 'Vaginitis aguda', category: 'Genitourinario' },

  // Musculoesquelético
  { code: 'M54.5', description: 'Lumbago no especificado (Lumbalgia mecánica)', category: 'Musculoesquelético' },
  { code: 'M54.2', description: 'Cervicalgia', category: 'Musculoesquelético' },
  { code: 'M54.4', description: 'Lumbago con ciática', category: 'Musculoesquelético' },
  { code: 'M25.5', description: 'Dolor articular (Artralgia)', category: 'Musculoesquelético' },
  { code: 'M17.9', description: 'Gonartrosis, no especificada (Artrosis de rodilla)', category: 'Musculoesquelético' },
  { code: 'M16.9', description: 'Coxartrosis, no especificada (Artrosis de cadera)', category: 'Musculoesquelético' },
  { code: 'M79.1', description: 'Mialgia / Contractura muscular', category: 'Musculoesquelético' },
  { code: 'M79.7', description: 'Fibromialgia', category: 'Musculoesquelético' },
  { code: 'S93.4', description: 'Esguince y torcedura del tobillo', category: 'Traumatismos' },

  // Neurológico y Psiquiátrico
  { code: 'G43.9', description: 'Migraña, no especificada', category: 'Neurológico' },
  { code: 'G44.2', description: 'Cefalea debida a tensión (tensional)', category: 'Neurológico' },
  { code: 'R51', description: 'Cefalea', category: 'Neurológico' },
  { code: 'G47.0', description: 'Trastornos del inicio y del mantenimiento del sueño (Insomnio)', category: 'Neurológico' },
  { code: 'F41.1', description: 'Trastorno de ansiedad generalizada', category: 'Psiquiatría' },
  { code: 'F41.2', description: 'Trastorno mixto de ansiedad y depresión', category: 'Psiquiatría' },
  { code: 'F32.9', description: 'Episodio depresivo, no especificado', category: 'Psiquiatría' },

  // Dermatología
  { code: 'L20.9', description: 'Dermatitis atópica, no especificada', category: 'Dermatología' },
  { code: 'L23.9', description: 'Dermatitis alérgica de contacto, causa no especificada', category: 'Dermatología' },
  { code: 'L30.9', description: 'Dermatitis, no especificada (Eccema)', category: 'Dermatología' },
  { code: 'L50.9', description: 'Urticaria, no especificada', category: 'Dermatología' },
  { code: 'L70.0', description: 'Acné vulgar', category: 'Dermatología' },
  { code: 'B35.9', description: 'Dermatofitosis, no especificada (Tiña)', category: 'Dermatología' },

  // Síntomas Generales
  { code: 'R50.9', description: 'Fiebre, no especificada', category: 'General' },
  { code: 'R53', description: 'Malestar y fatiga (Astenia y adinamia)', category: 'General' },
  { code: 'R42', description: 'Mareo y desvanecimiento (Vértigo)', category: 'General' },
  { code: 'Z00.0', description: 'Examen médico general (Chequeo de rutina)', category: 'General' },
];
