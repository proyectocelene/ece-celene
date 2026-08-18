import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useWorkspace } from '@/app/providers/WorkspaceContext';
import { useAuth } from '@/app/providers/AuthContext';
import { PatientIndexService } from '@/entities/patient/api/patientIndexService';
import { Modal, Button, Input, Select } from '@/shared/ui';
import { TagInput } from './TagInput';
import { User, HeartHandshake, ShieldAlert, Check } from 'lucide-react';

interface CreatePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientCreated?: (patientId: string) => void;
}

interface FormValues {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: 'M' | 'F' | 'Otro' | 'No especificado';
  curpOrId: string;
  phone: string;
  hasWhatsApp?: boolean;
  whatsappPhone?: string;
  email: string;
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Desconocido';
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRel: string;
  ahf: string;
  app: string;
  apnp: string;
  ago: string;
  allergies: string[];
  activeConditions: string[];
}

const COMMON_ALLERGIES = ['Penicilina', 'Sulfamidas', 'AINEs (Aspirina/Ibuprofeno)', 'Cefalosporinas', 'Látex', 'Yodo'];
const COMMON_CONDITIONS = ['Hipertensión Arterial', 'Diabetes Mellitus Tipo 2', 'Hipotiroidismo', 'Asma', 'Dislipidemia'];

export function CreatePatientModal({ isOpen, onClose, onPatientCreated }: CreatePatientModalProps) {
  const { rootDirHandle, reloadIndex } = useWorkspace();
  const { logAuditAction } = useAuth();
  const [activeTab, setActiveTab] = useState<'demographics' | 'background' | 'alerts'>('demographics');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      birthDate: '',
      gender: 'M',
      curpOrId: '',
      phone: '',
      whatsappPhone: '',
      hasWhatsApp: false,
      email: '',
      bloodType: 'Desconocido',
      address: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRel: '',
      ahf: '',
      app: '',
      apnp: '',
      ago: '',
      allergies: [],
      activeConditions: [],
    },
  });

  const watchGender = watch('gender');

  const onSubmit = async (data: FormValues) => {
    if (!rootDirHandle) return;
    setIsSubmitting(true);

    try {
      const { patient } = await PatientIndexService.createPatientRecord(rootDirHandle, {
        demographics: {
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          birthDate: data.birthDate,
          gender: data.gender,
          curpOrId: data.curpOrId?.trim() || '',
          phone: data.phone?.trim() || '',
          hasWhatsApp: Boolean(data.whatsappPhone || data.hasWhatsApp),
          whatsappPhone: data.whatsappPhone?.trim() || data.phone?.trim() || '',
          email: data.email?.trim() || '',
          bloodType: data.bloodType,
          address: data.address?.trim() || '',
          emergencyContact: {
            name: data.emergencyContactName?.trim() || '',
            phone: data.emergencyContactPhone?.trim() || '',
            relationship: data.emergencyContactRel?.trim() || '',
          },
        },
        background: {
          ahf: data.ahf?.trim() || '',
          app: data.app?.trim() || '',
          apnp: data.apnp?.trim() || '',
          ago: data.ago?.trim() || '',
        },
        allergies: data.allergies || [],
        activeConditions: data.activeConditions || [],
      });

      await reloadIndex();
      await logAuditAction(
        'CREAR_PACIENTE',
        `Alta de nuevo expediente: ${patient.demographics.firstName} ${patient.demographics.lastName} (${patient.id}).`,
        patient.id
      );
      reset();
      onClose();
      if (onPatientCreated) {
        onPatientCreated(patient.id);
      }
    } catch (err) {
      console.error('Error al registrar nuevo paciente:', err);
      alert('Error al guardar el expediente en disco.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Expediente Clínico"
      description="Crea la estructura física y ficha de identificación del paciente."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Sub-tabs header */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('demographics')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'demographics'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Identificación
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('background')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'background'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            Antecedentes Fijos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'alerts'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Alergias y Condiciones
          </button>
        </div>

        {/* Tab 1: Ficha Demográfica */}
        {activeTab === 'demographics' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nombre(s) *"
                placeholder="Ej. Juan Carlos"
                error={errors.firstName?.message}
                {...register('firstName', { required: 'El nombre es obligatorio' })}
              />
              <Input
                label="Apellidos *"
                placeholder="Ej. Pérez Gómez"
                error={errors.lastName?.message}
                {...register('lastName', { required: 'Los apellidos son obligatorios' })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Fecha de Nacimiento *"
                type="date"
                error={errors.birthDate?.message}
                {...register('birthDate', { required: 'La fecha es obligatoria' })}
              />
              <Select label="Sexo Biológico" {...register('gender')}>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="Otro">Otro</option>
                <option value="No especificado">No especificado</option>
              </Select>
              <Select label="Grupo Sanguíneo" {...register('bloodType')}>
                <option value="Desconocido">Desconocido</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="CURP / Identificación" placeholder="Ej. PEGJ900101HDF..." {...register('curpOrId')} />
              <Input label="Teléfono de Contacto" placeholder="Ej. 55-1234-5678" {...register('phone')} />
              <Input label="WhatsApp (opcional)" placeholder="Ej. 55-1234-5678" {...register('whatsappPhone')} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Correo Electrónico" type="email" placeholder="correo@ejemplo.com" {...register('email')} />
              <Input label="Dirección / Ciudad" placeholder="Calle, número, colonia..." {...register('address')} />
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Contacto de Emergencia
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input label="Nombre Contacto" placeholder="Nombre completo" {...register('emergencyContactName')} />
                <Input label="Parentesco" placeholder="Ej. Esposa, Madre" {...register('emergencyContactRel')} />
                <Input label="Teléfono Emergencia" placeholder="Teléfono" {...register('emergencyContactPhone')} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Antecedentes */}
        {activeTab === 'background' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Captura rápida de antecedentes:</span>
              <button
                type="button"
                onClick={() => {
                  setValue('ahf', 'Interrogados y negados. Sin antecedentes familiares de importancia.');
                  setValue('app', 'Interrogados y negados. Sin cirugías previas, fracturas ni hospitalizaciones.');
                  setValue('apnp', 'Tabaquismo y alcoholismo negados. Hábitos higiénico-dietéticos adecuados.');
                  if (watchGender !== 'M') {
                    setValue('ago', 'Ciclos regulares, sin complicaciones gineco-obstétricas.');
                  }
                }}
                className="text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer"
              >
                ✨ Autollenar "Todo Negado"
              </button>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Antecedentes Heredofamiliares (AHF)
              </label>
              <textarea
                {...register('ahf')}
                rows={2}
                placeholder="Ej. Diabetes, Hipertensión, Cáncer, Cardiopatías en familiares directos..."
                className="block w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Antecedentes Personales Patológicos (APP)
              </label>
              <textarea
                {...register('app')}
                rows={2}
                placeholder="Cirugías previas, hospitalizaciones, traumatismos, transfusiones..."
                className="block w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Antecedentes Personales No Patológicos (APNP)
              </label>
              <textarea
                {...register('apnp')}
                rows={2}
                placeholder="Tabaquismo, alcoholismo, hábitos higiénicos, actividad física, alimentación..."
                className="block w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {watchGender !== 'M' && (
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Antecedentes Gineco-Obstétricos (AGO)
                </label>
                <textarea
                  {...register('ago')}
                  rows={2}
                  placeholder="Menarca, FUM, G: P: C: A:, anticonceptivos, mastografía..."
                  className="block w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Alergias y Condiciones */}
        {activeTab === 'alerts' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <Controller
              name="allergies"
              control={control}
              render={({ field }) => (
                <TagInput
                  label="Alergias Conocidas"
                  placeholder="Escribe el medicamento o sustancia..."
                  tags={field.value}
                  onChange={field.onChange}
                  suggestions={COMMON_ALLERGIES}
                  variant="danger"
                />
              )}
            />

            <Controller
              name="activeConditions"
              control={control}
              render={({ field }) => (
                <TagInput
                  label="Condiciones Crónicas / Diagnósticos de Base"
                  placeholder="Escribe el diagnóstico..."
                  tags={field.value}
                  onChange={field.onChange}
                  suggestions={COMMON_CONDITIONS}
                  variant="primary"
                />
              )}
            />
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>

          <div className="flex items-center gap-2">
            {activeTab !== 'demographics' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setActiveTab(activeTab === 'alerts' ? 'background' : 'demographics')
                }
              >
                Anterior
              </Button>
            )}

            {activeTab !== 'alerts' ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() =>
                  setActiveTab(activeTab === 'demographics' ? 'background' : 'alerts')
                }
              >
                Siguiente
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                leftIcon={<Check className="w-4 h-4" />}
              >
                Crear Expediente
              </Button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
