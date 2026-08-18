# 🏥 Expediente Clínico Electrónico (ECE) — Local-First PWA

Aplicación Web Progresiva (PWA) de **Expediente Clínico Electrónico** diseñada bajo el paradigma **Local-First**, con persistencia directa en el sistema de archivos local del médico (compatible con **Google Drive**, **OneDrive** y respaldos físicos), hosteable de forma 100% gratuita y estática en **GitHub Pages**.

---

## 🌟 Características Principales

* 🔒 **100% Privado y Local-First:** Los datos nunca pasan por servidores externos. El médico es dueño absoluto de sus archivos.
* 📁 **Estructura Abierta tipo Obsidian:** Persistencia en archivos JSON semánticos y carpetas físicas (`PAC-[ID]_[Nombre]/`).
* 🤖 **Interoperabilidad Total con IA:** Diseñado para que agentes de IA (scripts de Python, Node o LLMs locales) puedan auditar, cruzar información o analizar notas médicas directamente leyendo el disco duro.
* ⚡ **Autocompletado Offline Inteligente:** Catálogo CIE-10 y Cuadro Básico de Medicamentos integrados en memoria sin necesidad de conexión a internet.
* 💊 **Prescripción Médica y Recetas Imprimibles:** Generador de recetas formales con formato médico listo para imprimir con un solo clic.
* 📎 **Gestor de Estudios y Adjuntos:** Subida Drag & Drop y visualizador integrado de PDFs y estudios de imagen (radiografías, ultrasonidos).
* 🚀 **Cero Costos de Infraestructura:** Se compila como SPA estática lista para **GitHub Pages**.

---

## 📂 Jerarquía de Archivos en Disco

Al conectar la carpeta raíz de trabajo, el sistema gestiona la siguiente estructura física:

```text
📁 Expedientes_Clinicos/
├── index_pacientes.json         # Índice en memoria para búsqueda instantánea
└── 📁 PAC-00101_Juan_Perez/
    ├── paciente.json            # Datos demográficos, antecedentes fijos (AHF, APP, APNP, AGO) y alergias
    ├── 📁 adjuntos/             # Archivos físicos (.pdf, .jpg, .png, .dcm)
    └── 📁 notas/                # Consultas independientes en formato JSON fechadas
        ├── 2026-08-17_1730_consulta.json
        └── ...
```

---

## 🔬 Auditoría con Agentes de IA (Scripts de Python / Node)

Cualquier script o agente de IA puede auditar el historial clínico de los pacientes de forma directa sin requerir APIs intermedias:

```python
import json
import glob

# Ejemplo: Auditar alergias contra prescripciones en todas las notas
for patient_folder in glob.glob("Expedientes_Clinicos/PAC-*"):
    with open(f"{patient_folder}/paciente.json", encoding="utf-8") as f:
        patient = json.load(f)
    
    allergies = [a.lower() for a in patient.get("allergies", [])]
    print(f"Paciente: {patient['demographics']['firstName']} - Alergias: {allergies}")

    for note_file in glob.glob(f"{patient_folder}/notas/*.json"):
        with open(note_file, encoding="utf-8") as f:
            note = json.load(f)
        for rx in note.get("plan", {}).get("prescriptions", []):
            med = rx.get("medication", "").lower()
            # Validación automática de contraindicaciones
            for alg in allergies:
                if alg in med:
                    print(f"  ⚠️ ALERTA: Paciente alérgico a '{alg}' tiene prescrito '{med}'")
```

---

## 🛠️ Stack Tecnológico y Arquitectura Modular

* **Framework:** React 19 + TypeScript + Vite
* **Estilos:** Tailwind CSS v4 (Encapsulado en componentes atómicos UI)
* **Persistencia:** File System Access API + IndexedDB (`idb-keyval`)
* **Validación:** Zod + React Hook Form
* **Iconografía:** Lucide React
* **Arquitectura:** Feature-Sliced Design (FSD) / Micro-módulos desacoplados

```text
src/
├── app/                    # Providers globales (WorkspaceContext) y router
├── shared/                 # Componentes UI (Button, Input, Card, Modal, AutocompleteInput) y fsUtils
├── entities/               # Schemas de Paciente, Notas Clínicas y Catálogos CIE-10/Meds
└── features/               # Módulos clínicos independientes (fs-connection, patient-management, clinical-notes, attachments)
```

---

## 🚀 Instalación y Desarrollo Local

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/tu-repositorio.git
   cd tu-repositorio
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Abre [http://localhost:5173/](http://localhost:5173/) en Google Chrome, Microsoft Edge o cualquier navegador basado en Chromium.

---

## 🌐 Despliegue en GitHub Pages

El proyecto incluye un flujo automatizado en `.github/workflows/deploy.yml`:

1. Sube tu código a GitHub:
   ```bash
   git add .
   git commit -m "feat: initial local-first ECE release"
   git push origin main
   ```
2. En tu repositorio de GitHub, ve a **Settings > Pages**.
3. En **Source**, selecciona **GitHub Actions**.
4. ¡Listo! La PWA se desplegará automáticamente y estará disponible en `https://tu-usuario.github.io/tu-repositorio/`.
