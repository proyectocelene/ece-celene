import { useState } from 'react';
import { useAuth } from '@/app/providers/AuthContext';
import { useWorkspace } from '@/app/providers/WorkspaceContext';
import { RegisterUserModal } from './RegisterUserModal';
import { Button, Input, Card } from '@/shared/ui';
import { LogIn, UserPlus, Folder, KeyRound, Shield, CheckCircle2 } from 'lucide-react';

export function LoginScreen() {
  const { availableUsers, clinicConfig, login, isLoadingAuth } = useAuth();
  const { folderName, disconnectWorkspace } = useWorkspace();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!username.trim() || !password) {
      setError('Ingresa tu usuario y contraseña.');
      return;
    }

    const success = await login(username, password);
    if (!success) {
      setError('Credenciales incorrectas. Verifica tu usuario o contraseña.');
    }
  };

  const handleSelectPredefinedUser = (user: typeof availableUsers[0]) => {
    setUsername(user.username);
    setPassword('');
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50/30 to-indigo-50/40 p-4">
      <div className="max-w-md w-full space-y-4">
        <Card className="p-8 bg-white/95 backdrop-blur-md shadow-xl shadow-slate-200/60 border border-slate-200/80 rounded-3xl text-center space-y-6">
          {/* Logo del Consultorio / Fundación Proyecto Celene */}
          <div className="space-y-3">
            <div className="h-16 max-w-[240px] mx-auto p-1 bg-white rounded-2xl shadow-xs border border-slate-100 flex items-center justify-center">
              <img
                src={clinicConfig?.logoUrl || 'https://i.ibb.co/k2LCbnsF/tcarta-volante.png'}
                alt="Logo Fundación Proyecto Celene"
                className="h-full w-auto object-contain"
              />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {clinicConfig?.clinicName || 'PROYECTO CELENE ROSARITO'}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {clinicConfig?.foundationName || 'FUNDACIÓN PROYECTO CELENE'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {clinicConfig?.address}
              </p>
            </div>
          </div>

          {/* Connected folder pill */}
          <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600 max-w-xs mx-auto">
            <Folder className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="font-mono truncate">{folderName}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          </div>

          {/* Predefined Quick User Selection Buttons */}
          {availableUsers.length > 0 && (
            <div className="space-y-2 text-left">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Seleccionar Médico / Usuario Registrado:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableUsers.map((u) => {
                  const isSelected = username.toLowerCase() === u.username.toLowerCase();
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectPredefinedUser(u)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/60 text-blue-900 font-semibold shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <p className="font-bold truncate">{u.fullName}</p>
                      <p className="text-[10px] text-slate-400 capitalize">
                        {u.role === 'titular' ? 'Médico Titular' : u.role === 'pasante' ? 'Médico Pasante (MPSS)' : u.role}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <Input
              label="Usuario Clínico"
              placeholder="Ej. DR.DONATO o Dr. Sebastian"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<KeyRound className="w-4 h-4 text-slate-400" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-md shadow-blue-500/20"
              isLoading={isLoadingAuth}
              leftIcon={<LogIn className="w-4 h-4" />}
            >
              Iniciar Sesión en Consultorio
            </Button>
          </form>

          {/* Extra options */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <button
              type="button"
              onClick={() => setIsRegisterOpen(true)}
              className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              + Registrar Médico o Pasante
            </button>

            <button
              type="button"
              onClick={disconnectWorkspace}
              className="text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
            >
              Cambiar Carpeta
            </button>
          </div>
        </Card>

        {/* Security badge footer */}
        <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Autenticación y Credenciales 100% Locales en Disco</span>
        </div>
      </div>

      {/* Modal de Registro de Usuario */}
      <RegisterUserModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegistered={(newUsername) => {
          setUsername(newUsername);
          setSuccessMsg(`Usuario ${newUsername} registrado exitosamente. Ingresa tu contraseña para iniciar sesión.`);
        }}
      />
    </div>
  );
}
