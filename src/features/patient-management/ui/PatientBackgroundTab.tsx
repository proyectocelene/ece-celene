import { useState } from 'react';
import type { Patient, ChronicCondition } from '@/entities/patient/model/schemas';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@/shared/ui';
import { TagInput } from './TagInput';
import { ChronicConditionsManager } from './ChronicConditionsManager';
import { HeartHandshake, ShieldAlert, Edit3, Save, X, Sparkles, CheckCircle2 } from 'lucide-react';

interface PatientBackgroundTabProps {
  patient: Patient;
  onSave: (updatedPatient: Patient) => Promise<void>;
}

const COMMON_ALLERGIES = ['Penicilina', 'Sulfas', 'AINEs', 'Cefalosporinas', 'Látex', 'Yodo', 'Ácido Acetilsalicílico'];

export function PatientBackgroundTab({ patient, onSave }: PatientBackgroundTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [backgroundData, setBackgroundData] = useState(patient.background);
  const [allergies, setAllergies] = useState<string[]>(patient.allergies || []);
  const [chronicConditions, setChronicConditions] = useState<ChronicCondition[]>(patient.chronicConditions || []);

  const isMale = patient.demographics.gender === 'M';

  const handleFillAllDenied = () => {
    setBackgroundData({
      ahf: 'Interrogados y negados. Sin antecedentes familiares de importancia.',
      app: 'Interrogados y negados. Sin cirugías, hospitalizaciones previas ni transfusiones.',
      apnp: 'Interrogados y negados. Tabaquismo, alcoholismo y toxicomanías negadas. Hábitos higiénico-dietéticos adecuados.',
      ago: isMale ? 'No aplica (paciente masculino).' : 'Interrogados y negados. Ciclos regulares, sin complicaciones.',
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        ...patient,
        background: backgroundData,
        allergies,
        chronicConditions,
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Error guardando antecedentes:', err);
      alert('Error al guardar antecedentes en disco.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveChronicConditionsOnly = async (updatedConditions: ChronicCondition[]) => {
    setChronicConditions(updatedConditions);
    await onSave({
      ...patient,
      chronicConditions: updatedConditions,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Alergias */}
      <Card className="border-rose-100 bg-gradient-to-br from-white to-rose-50/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <CardTitle>Alergias Clínicas y Reacciones Adversas</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block text-left">
              Alergias Registradas ({allergies.length})
            </span>
            {!isEditing ? (
              allergies.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {allergies.map((alg) => (
                    <Badge key={alg} variant="danger" size="md">
                      {alg}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  No se reportan alergias medicamentosas ni ambientales (Negadas).
                </p>
              )
            ) : (
              <TagInput
                tags={allergies}
                onChange={setAllergies}
                suggestions={COMMON_ALLERGIES}
                variant="danger"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Condiciones Crónicas Inteligentes y Medicamentos Base */}
      <Card className="border-blue-100 bg-gradient-to-br from-white to-blue-50/20">
        <CardContent className="p-5">
          <ChronicConditionsManager
            conditions={chronicConditions}
            onChange={handleSaveChronicConditionsOnly}
          />
        </CardContent>
      </Card>

      {/* Antecedentes Fijos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-indigo-600" />
            <CardTitle>Historial Clínico y Antecedentes Fijos</CardTitle>
          </div>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              onClick={() => setIsEditing(true)}
            >
              Editar Antecedentes
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-blue-600" />}
                onClick={handleFillAllDenied}
                className="text-blue-700 bg-blue-50 hover:bg-blue-100"
              >
                Autollenar "Todo Negado"
              </Button>

              <Button
                variant="ghost"
                size="sm"
                leftIcon={<X className="w-3.5 h-3.5" />}
                onClick={() => {
                  setBackgroundData(patient.background);
                  setAllergies(patient.allergies || []);
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

        <CardContent className="space-y-6">
          {!isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-left">
              <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Antecedentes Heredofamiliares (AHF)
                </span>
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {patient.background?.ahf || 'No especificados.'}
                </p>
              </div>

              <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Antecedentes Personales Patológicos (APP)
                </span>
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {patient.background?.app || 'No especificados.'}
                </p>
              </div>

              <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Antecedentes Personales No Patológicos (APNP)
                </span>
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {patient.background?.apnp || 'No especificados.'}
                </p>
              </div>

              {/* Solo mostrar AGO si NO es masculino */}
              {!isMale && (
                <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Antecedentes Gineco-Obstétricos (AGO)
                  </span>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {patient.background?.ago || 'No especificados.'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 text-left">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Antecedentes Heredofamiliares (AHF)
                  </label>
                  <button
                    type="button"
                    onClick={() => setBackgroundData({ ...backgroundData, ahf: 'Interrogados y negados. Sin carga genética de importancia.' })}
                    className="text-[11px] text-blue-600 hover:underline font-medium"
                  >
                    + Negado
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={backgroundData?.ahf || ''}
                  onChange={(e) => setBackgroundData({ ...backgroundData, ahf: e.target.value })}
                  placeholder="Diabetes, Hipertensión, Cáncer, Cardiopatías en padres/hermanos..."
                  className="block w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Antecedentes Personales Patológicos (APP)
                  </label>
                  <button
                    type="button"
                    onClick={() => setBackgroundData({ ...backgroundData, app: 'Interrogados y negados. Sin cirugías ni hospitalizaciones previas.' })}
                    className="text-[11px] text-blue-600 hover:underline font-medium"
                  >
                    + Negado
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={backgroundData?.app || ''}
                  onChange={(e) => setBackgroundData({ ...backgroundData, app: e.target.value })}
                  placeholder="Cirugías, fracturas, hospitalizaciones previas..."
                  className="block w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Antecedentes Personales No Patológicos (APNP)
                  </label>
                  <button
                    type="button"
                    onClick={() => setBackgroundData({ ...backgroundData, apnp: 'Tabaquismo y alcoholismo negados. Hábitos higiénico-dietéticos adecuados.' })}
                    className="text-[11px] text-blue-600 hover:underline font-medium"
                  >
                    + Negado
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={backgroundData?.apnp || ''}
                  onChange={(e) => setBackgroundData({ ...backgroundData, apnp: e.target.value })}
                  placeholder="Tabaquismo, alcohol, ejercicio, nutrición..."
                  className="block w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {!isMale && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Antecedentes Gineco-Obstétricos (AGO)
                    </label>
                    <button
                      type="button"
                      onClick={() => setBackgroundData({ ...backgroundData, ago: 'Ciclos regulares, sin complicaciones obstétricas.' })}
                      className="text-[11px] text-blue-600 hover:underline font-medium"
                    >
                      + Regular / Sin datos
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={backgroundData?.ago || ''}
                    onChange={(e) => setBackgroundData({ ...backgroundData, ago: e.target.value })}
                    placeholder="Menarca, FUM, G: P: C: A:..."
                    className="block w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
