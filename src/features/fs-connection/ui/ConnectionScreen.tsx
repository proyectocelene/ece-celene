import { useState } from 'react';
import { useWorkspace } from '@/app/providers/WorkspaceContext';
import { Button } from '@/shared/ui/Button';
import { RefreshCw, HardDrive, ShieldCheck } from 'lucide-react';

export function ConnectionScreen() {
  const { connectWorkspace, restoreWorkspace, isRestoring, error: contextError } = useWorkspace();
  const [localError, setLocalError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setLocalError(null);
    setIsConnecting(true);
    try {
      await connectWorkspace();
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setLocalError(err.message || 'Error al conectar con la carpeta seleccionada.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRestore = async () => {
    setLocalError(null);
    setIsConnecting(true);
    try {
      const success = await restoreWorkspace();
      if (!success) {
        setLocalError('No se pudo restaurar la sesión previa. Por favor selecciona la carpeta manualmente.');
      }
    } catch (err) {
      console.error(err);
      setLocalError('Error al restaurar sesión previa.');
    } finally {
      setIsConnecting(false);
    }
  };

  if (isRestoring) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="flex items-center gap-3 text-slate-500 font-medium animate-pulse">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span>Verificando conexión previa con el disco...</span>
        </div>
      </div>
    );
  }

  const error = localError || contextError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 text-center space-y-6">
        {/* Logo Fundación Proyecto Celene */}
        <div className="mx-auto w-20 h-20 rounded-2xl p-1.5 bg-white border border-slate-200/80 shadow-xs flex items-center justify-center">
          <img
            src="https://i.ibb.co/k2LCbnsF/tcarta-volante.png"
            alt="Logo Fundación Proyecto Celene"
            className="max-h-full max-w-full object-contain"
          />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            PROYECTO CELENE ROSARITO
          </h1>
          <p className="text-xs font-semibold text-blue-800">
            FUNDACIÓN PROYECTO CELENE • CONSULTORIO
          </p>
          <p className="text-slate-500 text-xs leading-relaxed pt-1">
            Selecciona la carpeta local en tu equipo (ej. en tu carpeta de <span className="font-semibold text-slate-700">Google Drive</span> o <span className="font-semibold text-slate-700">OneDrive</span>).
          </p>
        </div>

        <div className="bg-slate-50/80 rounded-2xl p-4 text-xs text-slate-600 text-left space-y-2 border border-slate-100">
          <div className="flex items-center gap-2 font-medium text-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Privacidad y Control 100% Local</span>
          </div>
          <p className="text-slate-500">
            Tus datos y credenciales no viajan a ningún servidor externo. Todo se almacena de forma segura directamente en tu disco duro local.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3.5 rounded-xl text-xs text-left font-medium">
            {error}
          </div>
        )}

        <div className="space-y-3 pt-2">
          <Button
            onClick={handleConnect}
            isLoading={isConnecting}
            leftIcon={<HardDrive className="w-4 h-4" />}
            className="w-full shadow-md shadow-blue-500/20"
            size="lg"
          >
            Seleccionar Carpeta de Trabajo
          </Button>

          <Button
            onClick={handleRestore}
            variant="ghost"
            isLoading={isConnecting}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            className="w-full text-slate-500 hover:text-slate-800"
            size="sm"
          >
            Intentar Restaurar Sesión Anterior
          </Button>
        </div>
      </div>
    </div>
  );
}
