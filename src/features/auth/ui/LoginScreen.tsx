import { useState } from 'react';
import { useAuth } from '@/app/providers/AuthContext';
import { useWorkspace } from '@/app/providers/WorkspaceContext';
import { RegisterUserModal } from './RegisterUserModal';
import { Button, Input } from '@/shared/ui';
import {
  LogIn,
  UserPlus,
  Folder,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  Eye,
  EyeOff,
  UserCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export function LoginScreen() {
  const { availableUsers, clinicConfig, login, isLoadingAuth } = useAuth();
  const { folderName, disconnectWorkspace } = useWorkspace();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!username.trim() || !password) {
      setError('Por favor ingresa tu usuario y contraseña.');
      return;
    }

    const success = await login(username, password);
    if (!success) {
      setError('Credenciales incorrectas. Verifica tu usuario o contraseña.');
    }
  };

  const handleSelectPredefinedUser = (user: (typeof availableUsers)[0]) => {
    setUsername(user.username);
    setPassword('');
    setError(null);
    // Auto-enfocar el campo de contraseña
    const pwdInput = document.getElementById('login-password-input');
    if (pwdInput) {
      pwdInput.focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/40 p-4 sm:p-6 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Elementos ambientales de fondo suave */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-indigo-400/10 blur-3xl" />
      </div>

      <div className="relative max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch my-auto">
        {/* Panel Izquierdo: Presentación Institucional y Médicos */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white shadow-xl shadow-blue-950/15 space-y-6">
          <div className="space-y-4 text-left">
            {/* Logo Oficial Horizontal sin fondos que lo cuadren */}
            <div className="w-full flex items-center justify-start">
              <img
                src={clinicConfig?.logoUrl || 'https://i.ibb.co/k2LCbnsF/tcarta-volante.png'}
                alt="Proyecto Celene Rosarito"
                className="h-14 sm:h-16 w-auto max-w-full object-contain filter drop-shadow-sm brightness-105"
              />
            </div>

            <div className="space-y-1.5 pt-2 border-t border-white/10">
              <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/20">
                <Sparkles className="w-3 h-3 text-cyan-300" />
                Expediente Clínico Electrónico
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-snug">
                {clinicConfig?.clinicName || 'PROYECTO CELENE ROSARITO'}
              </h1>
              <p className="text-xs text-blue-100/90 font-medium leading-relaxed">
                {clinicConfig?.foundationName || 'Fundación Proyecto Celene A.C.'}
              </p>
              <p className="text-[11px] text-blue-200/70">
                {clinicConfig?.address || 'Playas de Rosarito, Baja California'}
              </p>
            </div>

            {/* Directorio de Médicos Rápidos */}
            {availableUsers.length > 0 && (
              <div className="space-y-2 pt-2 text-left">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200/80 block">
                  Médicos Registrados:
                </span>
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {availableUsers.map((u) => {
                    const isSelected = username.toLowerCase() === u.username.toLowerCase();
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleSelectPredefinedUser(u)}
                        className={`w-full p-2.5 rounded-2xl text-left text-xs transition-all flex items-center justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-white text-blue-950 font-bold shadow-md shadow-black/10 scale-[1.02]'
                            : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                              isSelected ? 'bg-blue-600 text-white' : 'bg-white/20 text-white'
                            }`}
                          >
                            {u.fullName[0]}
                          </div>
                          <div className="truncate">
                            <p className="font-bold truncate text-xs">{u.fullName}</p>
                            <p
                              className={`text-[10px] truncate ${
                                isSelected ? 'text-blue-700 font-medium' : 'text-blue-200/80'
                              }`}
                            >
                              {u.role === 'titular'
                                ? 'Médico Titular'
                                : u.role === 'pasante'
                                ? 'Médico Pasante (MPSS)'
                                : u.role}
                            </p>
                          </div>
                        </div>
                        <ArrowRight
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSelected ? 'text-blue-600' : 'text-white/40'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Carpeta local vinculada */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-blue-200/90">
            <div className="flex items-center gap-2 truncate">
              <Folder className="w-4 h-4 text-cyan-300 shrink-0" />
              <span className="font-mono text-[11px] truncate text-white">{folderName}</span>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-bold bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 px-2 py-0.5 rounded-full shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Disco Local
            </span>
          </div>
        </div>

        {/* Panel Derecho: Formulario de Inicio de Sesión Moderno y Claro */}
        <div className="lg:col-span-7 p-6 sm:p-10 rounded-3xl bg-white/95 backdrop-blur-md shadow-xl shadow-slate-200/60 border border-slate-200/80 flex flex-col justify-between text-left space-y-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  Iniciar Sesión
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Accede con tus credenciales de médico o pasante.
                </p>
              </div>

              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                <Stethoscope className="w-5 h-5" />
              </div>
            </div>

            {/* Mensajes de feedback */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold animate-in fade-in flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-in fade-in flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Usuario Clínico"
                placeholder="Ej. DR.DONATO, Dr. Sebastian..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />

              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? (
                      <>
                        <EyeOff className="w-3 h-3" /> Ocultar
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" /> Mostrar
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-mono"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 py-3 rounded-2xl"
                  isLoading={isLoadingAuth}
                  leftIcon={<LogIn className="w-4 h-4" />}
                >
                  Entrar al Sistema Médico
                </Button>
              </div>
            </form>
          </div>

          {/* Opciones Adicionales y Seguridad */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <button
                type="button"
                onClick={() => setIsRegisterOpen(true)}
                className="text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Registrar Nuevo Médico o Pasante</span>
              </button>

              <button
                type="button"
                onClick={disconnectWorkspace}
                className="text-slate-400 hover:text-slate-700 font-semibold cursor-pointer transition-colors"
              >
                Cambiar Carpeta de Trabajo
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px] font-medium pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Autenticación y expedientes almacenados 100% en tu disco duro local</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Registro de Usuario */}
      <RegisterUserModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegistered={(newUsername) => {
          setUsername(newUsername);
          setSuccessMsg(
            `Médico/Usuario "${newUsername}" registrado exitosamente. Ingresa tu contraseña para entrar.`
          );
        }}
      />
    </div>
  );
}
