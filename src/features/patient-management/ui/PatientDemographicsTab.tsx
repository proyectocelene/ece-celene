import { useState } from 'react';
import type { Patient } from '@/entities/patient/model/schemas';
import { Button, Input, Select, Card, CardHeader, CardTitle, CardContent } from '@/shared/ui';
import { User, Phone, Mail, MapPin, Heart, Edit3, Save, X, MessageSquare } from 'lucide-react';

interface PatientDemographicsTabProps {
  patient: Patient;
  onSave: (updatedPatient: Patient) => Promise<void>;
}

export function PatientDemographicsTab({ patient, onSave }: PatientDemographicsTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(patient.demographics);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        ...patient,
        demographics: formData,
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Error guardando datos demográficos:', err);
      alert('Error al guardar datos demográficos.');
    } finally {
      setIsSaving(false);
    }
  };

  const getCleanWhatsappNumber = (phoneStr?: string) => {
    if (!phoneStr) return '';
    const clean = phoneStr.replace(/\D/g, '');
    if (clean.length === 10) return `52${clean}`;
    return clean;
  };

  const whatsappNumber = getCleanWhatsappNumber(patient.demographics.whatsappPhone || patient.demographics.phone);

  return (
    <div className="space-y-6 animate-in fade-in duration-150 text-left">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <CardTitle>Ficha de Identificación</CardTitle>
          </div>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              onClick={() => setIsEditing(true)}
            >
              Editar Datos
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<X className="w-3.5 h-3.5" />}
                onClick={() => {
                  setFormData(patient.demographics);
                  setIsEditing(false);
                }}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Save className="w-3.5 h-3.5" />}
                onClick={handleSave}
                isLoading={isSaving}
              >
                Guardar
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {!isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nombre Completo</span>
                <p className="font-semibold text-slate-800 text-base">
                  {patient.demographics.firstName} {patient.demographics.lastName}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fecha de Nacimiento</span>
                <p className="text-slate-700">{patient.demographics.birthDate}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sexo Biológico</span>
                <p className="text-slate-700">
                  {patient.demographics.gender === 'M'
                    ? 'Masculino'
                    : patient.demographics.gender === 'F'
                    ? 'Femenino'
                    : patient.demographics.gender}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Grupo Sanguíneo</span>
                <p className="text-slate-700 font-medium">{patient.demographics.bloodType}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">CURP / Identificación</span>
                <p className="text-slate-700 font-mono">{patient.demographics.curpOrId || 'No registrada'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Teléfono & WhatsApp</span>
                <div className="flex items-center gap-2">
                  <p className="text-slate-700 flex items-center gap-1.5 font-medium">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {patient.demographics.phone || 'No registrado'}
                  </p>

                  {(patient.demographics.hasWhatsApp || patient.demographics.phone) && whatsappNumber && (
                    <a
                      href={`https://wa.me/${whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition-colors"
                      title="Abrir chat en WhatsApp"
                    >
                      <MessageSquare className="w-3 h-3 text-emerald-600" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Correo Electrónico</span>
                <p className="text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {patient.demographics.email || 'No registrado'}
                </p>
              </div>

              <div className="space-y-1 md:col-span-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dirección</span>
                <p className="text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {patient.demographics.address || 'No registrada'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nombre(s)"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
                <Input
                  label="Apellidos"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Fecha de Nacimiento"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
                <Select
                  label="Sexo Biológico"
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value as Patient['demographics']['gender'] })
                  }
                >
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="Otro">Otro</option>
                  <option value="No especificado">No especificado</option>
                </Select>
                <Select
                  label="Grupo Sanguíneo"
                  value={formData.bloodType}
                  onChange={(e) =>
                    setFormData({ ...formData, bloodType: e.target.value as Patient['demographics']['bloodType'] })
                  }
                >
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
                <Input
                  label="CURP / ID"
                  value={formData.curpOrId}
                  onChange={(e) => setFormData({ ...formData, curpOrId: e.target.value })}
                />
                <Input
                  label="Teléfono Principal"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <div className="space-y-1">
                  <Input
                    label="Teléfono WhatsApp"
                    placeholder="Mismo teléfono o directo"
                    value={formData.whatsappPhone || ''}
                    onChange={(e) => setFormData({ ...formData, whatsappPhone: e.target.value, hasWhatsApp: true })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Input
                  label="Dirección / Ciudad"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            <CardTitle>Contacto de Emergencia</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nombre</span>
              <p className="text-slate-800 font-medium">
                {patient.demographics.emergencyContact?.name || 'No especificado'}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Parentesco</span>
              <p className="text-slate-700">
                {patient.demographics.emergencyContact?.relationship || 'No especificado'}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Teléfono</span>
              <p className="text-slate-700">
                {patient.demographics.emergencyContact?.phone || 'No especificado'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
