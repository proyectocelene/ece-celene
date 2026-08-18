import { WorkspaceProvider, useWorkspace } from './providers/WorkspaceContext';
import { AuthProvider, useAuth } from './providers/AuthContext';
import { ConnectionScreen } from '@/features/fs-connection/ui/ConnectionScreen';
import { LoginScreen } from '@/features/auth/ui/LoginScreen';
import { DashboardLayout } from '@/features/dashboard/ui/DashboardLayout';

function MainRouter() {
  const { isConnected, isRestoring } = useWorkspace();
  const { currentUser, isLoadingAuth } = useAuth();

  // Esperar a que se intente restaurar automáticamente la carpeta e IndexedDB y la sesión del médico
  if (isRestoring || (isConnected && isLoadingAuth)) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-3 font-sans">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium tracking-wide">Restaurando sesión y expediente en disco...</p>
      </div>
    );
  }

  // Paso 1: Conectar la carpeta local en disco (si es la primera vez o se perdió el permiso)
  if (!isConnected) {
    return <ConnectionScreen />;
  }

  // Paso 2: Autenticación local con credenciales de la clínica (si no hay sesión activa)
  if (!currentUser) {
    return <LoginScreen />;
  }

  // Paso 3: Dashboard y expediente clínico activo
  return <DashboardLayout />;
}

export default function App() {
  return (
    <WorkspaceProvider>
      <AuthProvider>
        <MainRouter />
      </AuthProvider>
    </WorkspaceProvider>
  );
}
