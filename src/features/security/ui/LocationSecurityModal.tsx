import { useState } from 'react';
import { useAuth } from '@/app/providers/AuthContext';
import { Button } from '@/shared/ui';
import { MapPin, ShieldAlert, AlertCircle } from 'lucide-react';

export function LocationSecurityModal() {
  const { isLocationVerified, locationError, verifyLocation, currentLocation } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);

  // Si ya está verificada, no mostrar modal bloqueante
  if (isLocationVerified && currentLocation) {
    return null;
  }

  const handleRequest = async () => {
    setIsVerifying(true);
    await verifyLocation();
    setIsVerifying(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 text-center space-y-5 border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
          <MapPin className="w-8 h-8 animate-bounce" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-900 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-700" />
            Auditoría de Seguridad y Ubicación
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Verificación de Ubicación Requerida
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            Por disposición institucional de <strong>Proyecto Celene</strong> y trazabilidad del expediente clínico electrónico, es obligatorio autorizar el acceso a la ubicación GPS de este dispositivo para registrar el consultorio de atención y auditar cada consulta.
          </p>
        </div>

        {locationError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-left space-y-1.5">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Acceso a Ubicación Requerido</span>
            </div>
            <p className="text-[11px] leading-relaxed">{locationError}</p>
            <p className="text-[10px] text-slate-500 pt-1 border-t border-rose-200/60">
              💡 <strong>Cómo habilitarlo:</strong> Haz clic en el icono del candado 🔒 o ajustes en la barra de direcciones de tu navegador y cambia el permiso de <em>Ubicación</em> a <strong>"Permitir"</strong>.
            </p>
          </div>
        )}

        <div className="space-y-2 pt-2">
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleRequest}
            isLoading={isVerifying}
            leftIcon={<MapPin className="w-5 h-5" />}
            className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold text-sm shadow-md cursor-pointer"
          >
            {isVerifying ? 'Verificando Coordenadas...' : '📍 Activar y Autorizar Ubicación'}
          </Button>

          <p className="text-[10px] text-slate-400">
            Las coordenadas se almacenan cifradas en la bitácora local de auditoría institucional.
          </p>
        </div>
      </div>
    </div>
  );
}
