import { useState, useEffect } from 'react';
import { useWorkspace } from '@/app/providers/WorkspaceContext';
import { useAuth } from '@/app/providers/AuthContext';
import { PatientIndexService } from '@/entities/patient/api/patientIndexService';
import { CreatePatientModal } from '@/features/patient-management/ui/CreatePatientModal';
import { PatientDetailView } from '@/features/patient-management/ui/PatientDetailView';
import { AuditLogModal } from '@/features/audit/ui/AuditLogModal';
import { UserProfileModal } from '@/features/auth/ui/UserProfileModal';
import { Button, Input, Card, Badge } from '@/shared/ui';
import {
  Folder,
  Search,
  UserPlus,
  RefreshCw,
  LogOut,
  Users,
  FileText,
  AlertCircle,
  Calendar,
  Phone,
  Shield,
  ClipboardList,
  UserCheck,
  Activity,
} from 'lucide-react';

export function DashboardLayout() {
  const {
    folderName,
    rootDirHandle,
    indexData,
    isLoadingIndex,
    filteredPatients,
    searchQuery,
    setSearchQuery,
    reloadIndex,
  } = useWorkspace();

  const { currentUser, clinicConfig, logout, logAuditAction } = useAuth();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; folderName: string } | null>(null);
  const [isCreatingQuickPatient, setIsCreatingQuickPatient] = useState(false);

  // Rehidratar paciente seleccionado desde la URL hash para no perderlo al refrescar con F5
  useEffect(() => {
    if (!indexData || indexData.patients.length === 0) return;
    const hash = window.location.hash;
    if (hash.includes('patient=')) {
      const match = hash.match(/patient=([^&]+)/);
      if (match && match[1]) {
        const found = indexData.patients.find((p) => p.id === match[1]);
        if (found) {
          setSelectedPatient({ id: found.id, folderName: found.folderName });
        }
      }
    }
  }, [indexData]);

  const handleSelectPatient = (p: { id: string; folderName: string }) => {
    setSelectedPatient(p);
    window.location.hash = `patient=${p.id}`;
  };

  const handleBackToDashboard = () => {
    setSelectedPatient(null);
    window.location.hash = '';
  };

  const handleQuickCreateTestPatient = async () => {
    if (!rootDirHandle) return;
    setIsCreatingQuickPatient(true);
    try {
      const sampleNames = [
        { first: 'Carlos', last: 'Hernández López', dob: '1985-04-12', gender: 'M' as const, phone: '661-123-4567', curp: 'HELC850412HDFRR01' },
        { first: 'María', last: 'González Flores', dob: '1992-09-23', gender: 'F' as const, phone: '661-987-6543', curp: 'GOFM920923MDFNZ02' },
        { first: 'Alejandro', last: 'Martínez Soto', dob: '1978-11-05', gender: 'M' as const, phone: '661-456-7890', curp: 'MASA781105HDFRR09' },
      ];
      const randomPatient = sampleNames[Math.floor(Math.random() * sampleNames.length)];

      const { patient, folderName: newFolder } = await PatientIndexService.createPatientRecord(rootDirHandle, {
        demographics: {
          firstName: randomPatient.first,
          lastName: randomPatient.last,
          birthDate: randomPatient.dob,
          gender: randomPatient.gender,
          phone: randomPatient.phone,
          hasWhatsApp: true,
          whatsappPhone: randomPatient.phone,
          curpOrId: randomPatient.curp,
          email: '',
          bloodType: 'O+',
          address: 'Playas de Rosarito, B.C.',
          emergencyContact: { name: '', relationship: '', phone: '' },
        },
        background: {
          ahf: 'Madre con DM2, Padre con HTA.',
          app: 'Apendicectomía a los 15 años.',
          apnp: 'Tabaquismo negado, alcohol ocasional.',
          ago: 'G0 P0 A0 C0',
        },
        allergies: ['Penicilina', 'Sulfas'],
        activeConditions: ['Hipertensión Arterial Sistémica'],
        chronicConditions: [
          {
            id: 'cond-1',
            name: 'Hipertensión Arterial Sistémica',
            diagnosedDate: '2020',
            status: 'Controlada',
            currentTreatment: 'Losartán 50 mg cada 24 horas',
            modificationsNotes: 'Buen control tensional con dosis actual.',
            linkedMedications: ['Losartán'],
          },
        ],
      });

      await logAuditAction(
        'CREAR_PACIENTE',
        `Creación de paciente de demostración: ${patient.demographics.firstName} ${patient.demographics.lastName} (${patient.id}).`,
        patient.id
      );

      await reloadIndex();
      handleSelectPatient({ id: patient.id, folderName: newFolder });
    } catch (err) {
      console.error('Error creando paciente de prueba:', err);
      alert('Error al crear paciente rápido.');
    } finally {
      setIsCreatingQuickPatient(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Clinic Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={handleBackToDashboard}
          >
            <div className="h-10 max-w-[170px] bg-white p-0.5 rounded-lg border border-slate-200 flex items-center justify-center">
              <img
                src={clinicConfig?.logoUrl || 'https://i.ibb.co/k2LCbnsF/tcarta-volante.png'}
                alt="Logo Celene"
                className="h-full w-auto object-contain"
              />
            </div>
            <div className="text-left">
              <h1 className="font-bold text-slate-800 text-sm sm:text-base leading-tight">
                {clinicConfig?.clinicName || 'PROYECTO CELENE ROSARITO'}
              </h1>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                <Shield className="w-3 h-3 text-emerald-600" />
                Local-First • Sincronizado en Disco
              </p>
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Active Doctor Badge with click to edit profile */}
            {currentUser && (
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/80 text-xs transition-all cursor-pointer"
                title="Hacer clic para editar mi perfil o cambiar contraseña"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <div className="text-left hidden sm:block">
                  <p className="font-bold text-slate-800 truncate max-w-[150px]">{currentUser.fullName}</p>
                  <p className="text-[10px] text-slate-500 capitalize">
                    {currentUser.role === 'titular' ? 'Médico Titular' : currentUser.role === 'pasante' ? 'Médico Pasante (MPSS)' : currentUser.role}
                  </p>
                </div>
              </button>
            )}

            {/* Auditoría Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAuditModalOpen(true)}
              leftIcon={<ClipboardList className="w-3.5 h-3.5 text-slate-600" />}
              className="text-xs"
            >
              Auditoría
            </Button>

            {/* Folder indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/80 border border-slate-200/60 text-xs text-slate-600">
              <Folder className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-medium text-slate-800 truncate max-w-[130px]">{folderName}</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={reloadIndex}
              isLoading={isLoadingIndex}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="text-slate-500 hidden sm:flex"
              title="Resincronizar archivos del disco"
            >
              Recargar
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              leftIcon={<LogOut className="w-3.5 h-3.5 text-rose-500" />}
              className="text-rose-600 hover:bg-rose-50"
              title="Cerrar sesión actual"
            >
              Salir
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {selectedPatient ? (
          <PatientDetailView
            patientId={selectedPatient.id}
            folderName={selectedPatient.folderName}
            onBack={handleBackToDashboard}
          />
        ) : (
          <div className="space-y-6 text-left">
            {/* KPI / Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-4 flex items-center justify-between border-blue-100 bg-gradient-to-br from-white to-blue-50/20">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Pacientes</span>
                  <p className="text-2xl font-bold text-slate-800">{indexData?.totalPatients ?? 0}</p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
              </Card>

              <Card className="p-4 flex items-center justify-between border-slate-100 bg-white">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Notas Clínicas</span>
                  <p className="text-2xl font-bold text-slate-800">
                    {indexData?.patients.reduce((acc, p) => acc + (p.notesCount || 0), 0) ?? 0}
                  </p>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
              </Card>

              <Card className="p-4 flex items-center justify-between border-slate-100 bg-white">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Última Sincronización</span>
                  <p className="text-xs font-medium text-slate-600 mt-1">
                    {indexData?.lastSync
                      ? new Date(indexData.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Sin datos'}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <RefreshCw className="w-5 h-5" />
                </div>
              </Card>
            </div>

            {/* Action Bar (Search & Create) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-96">
                <Input
                  placeholder="Buscar por Nombre, ID (PAC-XXXXX) o CURP..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleQuickCreateTestPatient}
                  isLoading={isCreatingQuickPatient}
                  title="Generar un paciente de prueba con datos simulados"
                >
                  + Paciente Demo
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<UserPlus className="w-4 h-4" />}
                  onClick={() => setIsCreateModalOpen(true)}
                  className="shadow-sm shadow-blue-500/20"
                >
                  + Nuevo Paciente
                </Button>
              </div>
            </div>

            {/* Patients Directory Table / Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Mostrando <strong>{filteredPatients.length}</strong> de {indexData?.totalPatients ?? 0} pacientes
                </span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-blue-600 hover:underline font-medium cursor-pointer"
                  >
                    Limpiar búsqueda
                  </button>
                )}
              </div>

              {isLoadingIndex ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  Cargando expedientes desde el disco local...
                </div>
              ) : filteredPatients.length === 0 ? (
                <Card className="p-12 text-center space-y-4 border-dashed bg-slate-50/50">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 max-w-sm mx-auto">
                    <h3 className="font-semibold text-slate-800 text-base">No hay expedientes clínicos</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      {searchQuery
                        ? 'No se encontraron pacientes que coincidan con el término de búsqueda.'
                        : 'Comienza dando de alta tu primer paciente o genera uno de prueba.'}
                    </p>
                  </div>
                  {!searchQuery && (
                    <Button
                      size="sm"
                      leftIcon={<UserPlus className="w-4 h-4" />}
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      Crear Primer Expediente
                    </Button>
                  )}
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPatients.map((patient) => (
                    <Card
                      key={patient.id}
                      onClick={() => handleSelectPatient({ id: patient.id, folderName: patient.folderName })}
                      className="p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Card Header: ID & Gender/Status */}
                        <div className="flex items-center justify-between">
                          <Badge variant="primary" size="sm" className="font-mono font-bold text-xs">
                            {patient.id}
                          </Badge>
                          <span className="text-xs text-slate-400 font-medium">
                            {patient.gender === 'M' ? 'Masculino' : patient.gender === 'F' ? 'Femenino' : 'Otro'}
                          </span>
                        </div>

                        {/* Name & Basic Info */}
                        <div className="text-left space-y-1">
                          <h4 className="font-bold text-slate-800 text-base group-hover:text-blue-600 transition-colors">
                            {patient.fullName}
                          </h4>

                          <div className="space-y-1 text-xs text-slate-500">
                            {patient.birthDate && (
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>{patient.birthDate}</span>
                              </div>
                            )}

                            {patient.phone && (
                              <div className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                <span>{patient.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Badges / Pill Tags for Allergies and Chronic Conditions */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {patient.allergiesCount > 0 && (
                            <div className="flex items-center gap-1 text-[11px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              <span className="truncate font-semibold">
                                {patient.allergiesCount} {patient.allergiesCount === 1 ? 'Alergia' : 'Alergias'}
                              </span>
                            </div>
                          )}

                          {patient.chronicConditionsCount > 0 && (
                            <div className="flex items-center gap-1 text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                              <Activity className="w-3 h-3 shrink-0" />
                              <span className="truncate font-semibold">
                                {patient.chronicConditionsCount} {patient.chronicConditionsCount === 1 ? 'Crónico' : 'Crónicos'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer: Metadata */}
                      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <span>{patient.notesCount ?? 0} notas clínicas</span>
                        <span className="font-mono text-[11px] truncate max-w-[120px]" title={patient.folderName}>
                          📁 {patient.folderName}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal para Crear Paciente */}
      <CreatePatientModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPatientCreated={async (newPatientId: string) => {
          await reloadIndex();
          const p = indexData?.patients.find((x) => x.id === newPatientId);
          if (p) {
            handleSelectPatient({ id: newPatientId, folderName: p.folderName });
          }
        }}
      />

      {/* Modal de Auditoría */}
      <AuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />

      {/* Modal de Perfil de Usuario y Contraseña */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}
