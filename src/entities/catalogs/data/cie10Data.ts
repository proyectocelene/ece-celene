export interface CIE10Entry {
  code: string;
  description: string;
  category?: string;
}

export const CIE10_CATALOG: CIE10Entry[] = [
  // =========================================================================
  // 1. INFECCIONES RESPIRATORIAS Y NEUMOLOGÍA
  // =========================================================================
  { code: 'J00', description: 'Rinofaringitis aguda (resfriado común)', category: 'Respiratorio' },
  { code: 'J01.0', description: 'Sinusitis maxilar aguda', category: 'Respiratorio' },
  { code: 'J01.9', description: 'Sinusitis aguda, no especificada', category: 'Respiratorio' },
  { code: 'J02.0', description: 'Faringitis estreptocócica', category: 'Respiratorio' },
  { code: 'J02.9', description: 'Faringitis aguda, no especificada', category: 'Respiratorio' },
  { code: 'J03.0', description: 'Amigdalitis estreptocócica aguda', category: 'Respiratorio' },
  { code: 'J03.9', description: 'Amigdalitis aguda, no especificada', category: 'Respiratorio' },
  { code: 'J04.0', description: 'Laringitis aguda', category: 'Respiratorio' },
  { code: 'J04.1', description: 'Traqueítis aguda', category: 'Respiratorio' },
  { code: 'J04.2', description: 'Laringotraqueítis aguda (Crup)', category: 'Respiratorio' },
  { code: 'J06.9', description: 'Infección aguda de las vías respiratorias superiores, no especificada', category: 'Respiratorio' },
  { code: 'J10.1', description: 'Influenza con otras manifestaciones respiratorias, virus de la influenza identificado', category: 'Respiratorio' },
  { code: 'J11.1', description: 'Influenza con otras manifestaciones respiratorias, virus no identificado', category: 'Respiratorio' },
  { code: 'J12.9', description: 'Neumonía viral, no especificada', category: 'Respiratorio' },
  { code: 'J15.9', description: 'Neumonía bacteriana, no especificada', category: 'Respiratorio' },
  { code: 'J18.0', description: 'Bronconeumonía, no especificada', category: 'Respiratorio' },
  { code: 'J18.9', description: 'Neumonía adquirida en la comunidad, no especificada', category: 'Respiratorio' },
  { code: 'J20.9', description: 'Bronquitis aguda, no especificada', category: 'Respiratorio' },
  { code: 'J21.9', description: 'Bronquiolitis aguda, no especificada', category: 'Respiratorio' },
  { code: 'J30.1', description: 'Rinitis alérgica debida al polen', category: 'Respiratorio' },
  { code: 'J30.4', description: 'Rinitis alérgica, no especificada', category: 'Respiratorio' },
  { code: 'J31.0', description: 'Rinitis crónica', category: 'Respiratorio' },
  { code: 'J40', description: 'Bronquitis, no especificada como aguda o crónica', category: 'Respiratorio' },
  { code: 'J42', description: 'Bronquitis crónica no especificada', category: 'Respiratorio' },
  { code: 'J44.0', description: 'Enfermedad pulmonar obstructiva crónica con infección respiratoria aguda', category: 'Respiratorio' },
  { code: 'J44.1', description: 'Enfermedad pulmonar obstructiva crónica (EPOC) con exacerbación aguda', category: 'Respiratorio' },
  { code: 'J44.9', description: 'Enfermedad pulmonar obstructiva crónica, no especificada', category: 'Respiratorio' },
  { code: 'J45.0', description: 'Asma predominantemente alérgica', category: 'Respiratorio' },
  { code: 'J45.9', description: 'Asma bronquial, no especificada', category: 'Respiratorio' },
  { code: 'J46', description: 'Estado asmático (Crisis asmática severa)', category: 'Respiratorio' },
  { code: 'R05', description: 'Tos', category: 'Respiratorio' },
  { code: 'R06.0', description: 'Disnea', category: 'Respiratorio' },
  { code: 'R07.0', description: 'Dolor de garganta (Odinofagia)', category: 'Respiratorio' },
  { code: 'U07.1', description: 'COVID-19, virus identificado', category: 'Infecciosas' },
  { code: 'U07.2', description: 'COVID-19, virus no identificado (Sospechoso)', category: 'Infecciosas' },

  // =========================================================================
  // 2. CARDIOVASCULAR
  // =========================================================================
  { code: 'I10', description: 'Hipertensión esencial (primaria)', category: 'Cardiovascular' },
  { code: 'I11.9', description: 'Enfermedad cardíaca hipertensiva sin insuficiencia cardíaca', category: 'Cardiovascular' },
  { code: 'I11.0', description: 'Enfermedad cardíaca hipertensiva con insuficiencia cardíaca', category: 'Cardiovascular' },
  { code: 'I15.9', description: 'Hipertensión secundaria, no especificada', category: 'Cardiovascular' },
  { code: 'I20.0', description: 'Angina inestable', category: 'Cardiovascular' },
  { code: 'I20.9', description: 'Angina de pecho, no especificada', category: 'Cardiovascular' },
  { code: 'I21.9', description: 'Infarto agudo del miocardio, sin otra especificación', category: 'Cardiovascular' },
  { code: 'I25.1', description: 'Enfermedad aterosclerótica del corazón (Cardiopatía isquémica crónica)', category: 'Cardiovascular' },
  { code: 'I48.9', description: 'Fibrilación y aleteo auricular, no especificado', category: 'Cardiovascular' },
  { code: 'I49.9', description: 'Arritmia cardíaca, no especificada', category: 'Cardiovascular' },
  { code: 'I50.9', description: 'Insuficiencia cardíaca congestiva, no especificada', category: 'Cardiovascular' },
  { code: 'I83.9', description: 'Venas varicosas de los miembros inferiores sin úlcera ni inflamación', category: 'Cardiovascular' },
  { code: 'I87.2', description: 'Insuficiencia venosa (crónica) (periférica)', category: 'Cardiovascular' },
  { code: 'I95.9', description: 'Hipotensión, no especificada', category: 'Cardiovascular' },
  { code: 'R00.0', description: 'Taquicardia, no especificada', category: 'Cardiovascular' },
  { code: 'R00.1', description: 'Bradicardia, no especificada', category: 'Cardiovascular' },
  { code: 'R00.2', description: 'Palpitaciones', category: 'Cardiovascular' },
  { code: 'R07.4', description: 'Dolor en el pecho, no especificado (Dolor torácico)', category: 'Cardiovascular' },

  // =========================================================================
  // 3. ENDOCRINO, METABOLISMO Y NUTRICIÓN
  // =========================================================================
  { code: 'E10.9', description: 'Diabetes mellitus tipo 1 sin mención de complicación', category: 'Endocrino' },
  { code: 'E11.9', description: 'Diabetes mellitus tipo 2 sin mención de complicación', category: 'Endocrino' },
  { code: 'E11.2', description: 'Diabetes mellitus tipo 2 con complicaciones renales (Nefropatía diabética)', category: 'Endocrino' },
  { code: 'E11.3', description: 'Diabetes mellitus tipo 2 con complicaciones oftálmicas (Retinopatía diabética)', category: 'Endocrino' },
  { code: 'E11.4', description: 'Diabetes mellitus tipo 2 con complicaciones neurológicas (Neuropatía diabética)', category: 'Endocrino' },
  { code: 'E11.5', description: 'Diabetes mellitus tipo 2 con complicaciones circulatorias periféricas (Pie diabético)', category: 'Endocrino' },
  { code: 'E11.65', description: 'Diabetes mellitus tipo 2 con hiperglucemia no controlada', category: 'Endocrino' },
  { code: 'E14.9', description: 'Diabetes mellitus, no especificada', category: 'Endocrino' },
  { code: 'E16.2', description: 'Hipoglucemia, no especificada', category: 'Endocrino' },
  { code: 'E03.9', description: 'Hipotiroidismo, no especificado', category: 'Endocrino' },
  { code: 'E05.9', description: 'Tirotoxicosis (Hipertiroidismo), no especificada', category: 'Endocrino' },
  { code: 'E66.0', description: 'Obesidad debida a exceso de calorías', category: 'Endocrino' },
  { code: 'E66.9', description: 'Obesidad, no especificada', category: 'Endocrino' },
  { code: 'E78.0', description: 'Hipercolesterolemia pura', category: 'Endocrino' },
  { code: 'E78.1', description: 'Hipertrigliceridemia pura', category: 'Endocrino' },
  { code: 'E78.2', description: 'Hiperlipidemia mixta (Dislipidemia)', category: 'Endocrino' },
  { code: 'E78.5', description: 'Hiperlipidemia, no especificada', category: 'Endocrino' },
  { code: 'E79.0', description: 'Hiperuricemia sin signos de artritis inflamatoria', category: 'Endocrino' },
  { code: 'M10.9', description: 'Gota, no especificada', category: 'Endocrino' },
  { code: 'E86', description: 'Depleción del volumen (Deshidratación)', category: 'Endocrino' },

  // =========================================================================
  // 4. DIGESTIVO Y ABDOMINAL
  // =========================================================================
  { code: 'K21.0', description: 'Enfermedad por reflujo gastroesofágico con esofagitis', category: 'Digestivo' },
  { code: 'K21.9', description: 'Enfermedad por reflujo gastroesofágico sin esofagitis (ERGE)', category: 'Digestivo' },
  { code: 'K25.9', description: 'Úlcera gástrica, no especificada', category: 'Digestivo' },
  { code: 'K26.9', description: 'Úlcera duodenal, no especificada', category: 'Digestivo' },
  { code: 'K29.1', description: 'Otras gastritis agudas', category: 'Digestivo' },
  { code: 'K29.5', description: 'Gastritis crónica, no especificada', category: 'Digestivo' },
  { code: 'K29.7', description: 'Gastritis, no especificada', category: 'Digestivo' },
  { code: 'K30', description: 'Dispepsia funcional', category: 'Digestivo' },
  { code: 'K35.8', description: 'Apendicitis aguda, otra y la no especificada', category: 'Digestivo' },
  { code: 'K58.0', description: 'Síndrome del colon irritable con predominio de diarrea', category: 'Digestivo' },
  { code: 'K58.1', description: 'Síndrome del colon irritable con predominio de constipación', category: 'Digestivo' },
  { code: 'K58.9', description: 'Síndrome del colon irritable sin diarrea', category: 'Digestivo' },
  { code: 'K59.0', description: 'Constipación (Estreñimiento)', category: 'Digestivo' },
  { code: 'K80.2', description: 'Cálculo de la vesícula biliar sin colecistitis (Colelitiasis)', category: 'Digestivo' },
  { code: 'K81.0', description: 'Colecistitis aguda', category: 'Digestivo' },
  { code: 'K81.9', description: 'Colecistitis, no especificada (Colecistopatía crónica)', category: 'Digestivo' },
  { code: 'K85.9', description: 'Pancreatitis aguda, no especificada', category: 'Digestivo' },
  { code: 'K64.9', description: 'Hemorroides, no especificadas', category: 'Digestivo' },
  { code: 'K60.2', description: 'Fisura anal, no especificada', category: 'Digestivo' },
  { code: 'K40.9', description: 'Hernia inguinal unilateral o no especificada, sin obstrucción ni gangrena', category: 'Digestivo' },
  { code: 'K42.9', description: 'Hernia umbilical sin obstrucción ni gangrena', category: 'Digestivo' },
  { code: 'A09', description: 'Diarrea y gastroenteritis de presunto origen infeccioso', category: 'Digestivo' },
  { code: 'A08.4', description: 'Gastroenteritis viral, no especificada', category: 'Digestivo' },
  { code: 'A06.0', description: 'Amibiasis intestinal aguda', category: 'Digestivo' },
  { code: 'A07.1', description: 'Giardiasis (Lambliasis)', category: 'Digestivo' },
  { code: 'R10.0', description: 'Abdomen agudo', category: 'Digestivo' },
  { code: 'R10.4', description: 'Otros dolores abdominales y los no especificados (Dolor cólico)', category: 'Digestivo' },
  { code: 'R11', description: 'Náusea y vómito', category: 'Digestivo' },

  // =========================================================================
  // 5. NEFROLOGÍA Y UROLOGÍA
  // =========================================================================
  { code: 'N39.0', description: 'Infección de vías urinarias, sitio no especificado', category: 'Genitourinario' },
  { code: 'N30.0', description: 'Cistitis aguda', category: 'Genitourinario' },
  { code: 'N30.9', description: 'Cistitis, no especificada', category: 'Genitourinario' },
  { code: 'N10', description: 'Nefritis túbulo-intersticial aguda (Pielonefritis aguda)', category: 'Genitourinario' },
  { code: 'N20.0', description: 'Cálculo del riñón (Nefrolitiasis)', category: 'Genitourinario' },
  { code: 'N20.1', description: 'Cálculo del uréter (Urolitiasis / Cólico renoureteral)', category: 'Genitourinario' },
  { code: 'N23', description: 'Cólico renal, no especificado', category: 'Genitourinario' },
  { code: 'N18.9', description: 'Enfermedad renal crónica, no especificada', category: 'Genitourinario' },
  { code: 'N40', description: 'Hiperplasia prostática benigna (Crecimiento prostático)', category: 'Genitourinario' },
  { code: 'N41.0', description: 'Prostatitis aguda', category: 'Genitourinario' },
  { code: 'N45.9', description: 'Orquitis, epididimitis y orquiepididimitis sin mención de absceso', category: 'Genitourinario' },
  { code: 'N48.1', description: 'Balanopostitis', category: 'Genitourinario' },
  { code: 'R30.0', description: 'Disuria (Dolor / ardor al orinar)', category: 'Genitourinario' },
  { code: 'R31', description: 'Hematuria, no especificada', category: 'Genitourinario' },

  // =========================================================================
  // 6. GINECOLOGÍA Y OBSTETRICIA
  // =========================================================================
  { code: 'N76.0', description: 'Vaginitis aguda (Candidiasis / Vaginosis)', category: 'Ginecología' },
  { code: 'N76.1', description: 'Vaginitis subaguda y crónica', category: 'Ginecología' },
  { code: 'B37.3', description: 'Candidiasis de la vulva y de la vagina (Candidiasis vulvovaginal)', category: 'Ginecología' },
  { code: 'A59.0', description: 'Tricomoniasis urogenital', category: 'Ginecología' },
  { code: 'N94.6', description: 'Dismenorrea, no especificada', category: 'Ginecología' },
  { code: 'N92.0', description: 'Menstruación excesiva y frecuente con ciclo regular (Menorragia)', category: 'Ginecología' },
  { code: 'N92.6', description: 'Menstruación irregular, no especificada', category: 'Ginecología' },
  { code: 'N95.1', description: 'Estados climatéricos y menopáusicos (Síndrome climatérico)', category: 'Ginecología' },
  { code: 'N60.9', description: 'Displasia mamaria benigna, no especificada (Mastopatía fibroquística)', category: 'Ginecología' },
  { code: 'N64.4', description: 'Mastodinia (Dolor mamario)', category: 'Ginecología' },
  { code: 'Z34.9', description: 'Supervisión de embarazo normal, no especificado (Control prenatal)', category: 'Ginecología' },
  { code: 'Z30.0', description: 'Consejería y asesoramiento general sobre la anticoncepción', category: 'Ginecología' },

  // =========================================================================
  // 7. MUSCULOESQUELÉTICO Y TRAUMATOLOGÍA
  // =========================================================================
  { code: 'M54.5', description: 'Lumbago no especificado (Lumbalgia mecánica)', category: 'Musculoesquelético' },
  { code: 'M54.2', description: 'Cervicalgia (Dolor de cuello / contractura cervical)', category: 'Musculoesquelético' },
  { code: 'M54.4', description: 'Lumbago con ciática (Lumbociática)', category: 'Musculoesquelético' },
  { code: 'M54.6', description: 'Dolor en la columna dorsal (Dorsalgia)', category: 'Musculoesquelético' },
  { code: 'M25.5', description: 'Dolor articular (Artralgia)', category: 'Musculoesquelético' },
  { code: 'M17.9', description: 'Gonartrosis, no especificada (Osteoartrosis de rodilla)', category: 'Musculoesquelético' },
  { code: 'M16.9', description: 'Coxartrosis, no especificada (Osteoartrosis de cadera)', category: 'Musculoesquelético' },
  { code: 'M19.9', description: 'Artrosis, no especificada', category: 'Musculoesquelético' },
  { code: 'M06.9', description: 'Artritis reumatoide, no especificada', category: 'Musculoesquelético' },
  { code: 'M79.1', description: 'Mialgia / Contractura muscular', category: 'Musculoesquelético' },
  { code: 'M79.7', description: 'Fibromialgia', category: 'Musculoesquelético' },
  { code: 'M75.0', description: 'Capsulitis adhesiva de hombro (Hombro congelado)', category: 'Musculoesquelético' },
  { code: 'M75.1', description: 'Síndrome del manguito rotador', category: 'Musculoesquelético' },
  { code: 'M77.1', description: 'Epicondilitis lateral (Codo de tenista)', category: 'Musculoesquelético' },
  { code: 'M72.2', description: 'Fibromatosis de la fascia plantar (Fascitis plantar)', category: 'Musculoesquelético' },
  { code: 'S93.4', description: 'Esguince y torcedura del tobillo', category: 'Traumatismos' },
  { code: 'S63.5', description: 'Esguince y torcedura de la muñeca', category: 'Traumatismos' },
  { code: 'S13.4', description: 'Esguince y torcedura de la columna cervical (Latigazo cervical)', category: 'Traumatismos' },
  { code: 'T14.0', description: 'Traumatismo superficial de región no especificada del cuerpo (Contusión)', category: 'Traumatismos' },
  { code: 'T14.1', description: 'Herida de región no especificada del cuerpo', category: 'Traumatismos' },

  // =========================================================================
  // 8. NEUROLOGÍA, SALUD MENTAL Y PSIQUIATRÍA
  // =========================================================================
  { code: 'G43.9', description: 'Migraña, no especificada', category: 'Neurológico' },
  { code: 'G44.2', description: 'Cefalea debida a tensión (Cefalea tensional)', category: 'Neurológico' },
  { code: 'R51', description: 'Cefalea (Dolor de cabeza no especificado)', category: 'Neurológico' },
  { code: 'G47.0', description: 'Trastornos del inicio y del mantenimiento del sueño (Insomnio)', category: 'Neurológico' },
  { code: 'G51.0', description: 'Parálisis de Bell (Parálisis facial periférica)', category: 'Neurológico' },
  { code: 'G40.9', description: 'Epilepsia, tipo no especificado', category: 'Neurológico' },
  { code: 'R42', description: 'Mareo y desvanecimiento (Vértigo / Mareo)', category: 'Neurológico' },
  { code: 'H81.1', description: 'Vértigo paroxístico benigno', category: 'Neurológico' },
  { code: 'F41.1', description: 'Trastorno de ansiedad generalizada', category: 'Psiquiatría' },
  { code: 'F41.0', description: 'Trastorno de pánico (Crisis de angustia / Ataque de pánico)', category: 'Psiquiatría' },
  { code: 'F41.2', description: 'Trastorno mixto de ansiedad y depresión', category: 'Psiquiatría' },
  { code: 'F32.9', description: 'Episodio depresivo, no especificado', category: 'Psiquiatría' },
  { code: 'F43.0', description: 'Reacción al estrés agudo', category: 'Psiquiatría' },
  { code: 'F43.2', description: 'Trastornos de adaptación (Estrés)', category: 'Psiquiatría' },

  // =========================================================================
  // 9. DERMATOLOGÍA
  // =========================================================================
  { code: 'L20.9', description: 'Dermatitis atópica, no especificada', category: 'Dermatología' },
  { code: 'L23.9', description: 'Dermatitis alérgica de contacto, causa no especificada', category: 'Dermatología' },
  { code: 'L30.9', description: 'Dermatitis, no especificada (Eccema)', category: 'Dermatología' },
  { code: 'L50.0', description: 'Urticaria alérgica', category: 'Dermatología' },
  { code: 'L50.9', description: 'Urticaria, no especificada', category: 'Dermatología' },
  { code: 'L70.0', description: 'Acné vulgar', category: 'Dermatología' },
  { code: 'L02.9', description: 'Absceso cutáneo, furúnculo y ántrax de sitio no especificado', category: 'Dermatología' },
  { code: 'L03.9', description: 'Celulitis de sitio no especificado', category: 'Dermatología' },
  { code: 'L01.0', description: 'Impétigo (Cualquier sitio)', category: 'Dermatología' },
  { code: 'B35.3', description: 'Tiña del pie (Pie de atleta / Tinea pedis)', category: 'Dermatología' },
  { code: 'B35.4', description: 'Tiña del cuerpo (Tinea corporis)', category: 'Dermatología' },
  { code: 'B35.1', description: 'Tiña de las uñas (Onicomicosis)', category: 'Dermatología' },
  { code: 'B00.1', description: 'Dermatitis vesicular herpética (Herpes simple labial)', category: 'Dermatología' },
  { code: 'B02.9', description: 'Herpes zóster sin complicaciones', category: 'Dermatología' },
  { code: 'L82', description: 'Queratosis seborreica', category: 'Dermatología' },
  { code: 'L60.0', description: 'Uña encarnada (Onicocriptosis)', category: 'Dermatología' },

  // =========================================================================
  // 10. OFTALMOLOGÍA Y OTORRINOLARINGOLOGÍA
  // =========================================================================
  { code: 'H10.9', description: 'Conjuntivitis, no especificada', category: 'Oftalmología' },
  { code: 'H10.0', description: 'Conjuntivitis mucopurulenta aguda', category: 'Oftalmología' },
  { code: 'H10.1', description: 'Conjuntivitis atópica aguda (Alérgica)', category: 'Oftalmología' },
  { code: 'H00.0', description: 'Orzuelo y otras inflamaciones profundas del párpado', category: 'Oftalmología' },
  { code: 'H00.1', description: 'Chalazión', category: 'Oftalmología' },
  { code: 'H04.1', description: 'Otras afecciones de la glándula lagrimal (Ojo seco)', category: 'Oftalmología' },
  { code: 'H52.4', description: 'Presbicia', category: 'Oftalmología' },
  { code: 'H60.9', description: 'Otitis externa, sin otra especificación', category: 'ORL' },
  { code: 'H65.9', description: 'Otitis media no supurativa, sin otra especificación (Serosa)', category: 'ORL' },
  { code: 'H66.9', description: 'Otitis media, no especificada (Otitis media aguda)', category: 'ORL' },
  { code: 'H61.2', description: 'Cerumen impactado (Tapón de cerumen)', category: 'ORL' },
  { code: 'R04.0', description: 'Epistaxis (Hemorragia nasal)', category: 'ORL' },

  // =========================================================================
  // 11. MEDICINA PREVENTIVA, VALORACIONES Y OTROS
  // =========================================================================
  { code: 'Z00.0', description: 'Examen médico general (Chequeo médico preventivo / Rutina)', category: 'Preventiva' },
  { code: 'Z02.1', description: 'Examen médico previo a la admisión a empleo (Certificado laboral)', category: 'Preventiva' },
  { code: 'Z02.0', description: 'Examen para admisión a instituciones educativas (Certificado escolar)', category: 'Preventiva' },
  { code: 'Z02.5', description: 'Examen para la participación en deportes (Certificado deportivo)', category: 'Preventiva' },
  { code: 'Z01.4', description: 'Examen ginecológico de rutina (Papanicolaou / Citología cervical)', category: 'Preventiva' },
  { code: 'Z12.3', description: 'Examen de pesquisa especial para tumor de mama (Mastografía preventiva)', category: 'Preventiva' },
  { code: 'Z12.5', description: 'Examen de pesquisa especial para tumor de la próstata (Tamizaje PSA)', category: 'Preventiva' },
  { code: 'R50.9', description: 'Fiebre, no especificada', category: 'General' },
  { code: 'R53', description: 'Malestar y fatiga (Astenia y adinamia)', category: 'General' },
  { code: 'R55', description: 'Síncope y colapso (Desmayo)', category: 'General' },
  { code: 'D50.9', description: 'Anemia por deficiencia de hierro sin especificación', category: 'Hematología' },
  { code: 'D64.9', description: 'Anemia de tipo no especificado', category: 'Hematología' },
];
