import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useWorkspace } from './WorkspaceContext';
import { AuthService } from '@/entities/auth/api/authService';
import type { User, ClinicConfig, AuditAction, UserRole, AuditLocation } from '@/entities/auth/model/schemas';
import { GeolocationService } from '@/shared/lib/geolocationService';

const ACTIVE_USER_STORAGE_KEY = 'active_doctor_session_id';

interface AuthContextValue {
  currentUser: User | null;
  clinicConfig: ClinicConfig | null;
  supervisorDoctor: User | null;
  availableUsers: User[];
  isLoadingAuth: boolean;
  currentLocation: AuditLocation | null;
  isLocationVerified: boolean;
  locationError: string | null;
  verifyLocation: () => Promise<AuditLocation | null>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  registerDoctor: (data: {
    username: string;
    passwordPlain: string;
    fullName: string;
    title: string;
    licenseNumber: string;
    university: string;
    role: UserRole;
  }) => Promise<User>;
  updateProfile: (updatedData: Partial<Pick<User, 'fullName' | 'title' | 'licenseNumber' | 'university'>>) => Promise<User>;
  changePassword: (newPassword: string) => Promise<void>;
  logAuditAction: (action: AuditAction, details: string, targetPatientId?: string) => Promise<void>;
  refreshUsersAndConfig: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { rootDirHandle, isConnected } = useWorkspace();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [clinicConfig, setClinicConfig] = useState<ClinicConfig | null>(null);
  const [supervisorDoctor, setSupervisorDoctor] = useState<User | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Geolocation security states
  const [currentLocation, setCurrentLocation] = useState<AuditLocation | null>(() => GeolocationService.getLastKnownLocation());
  const [isLocationVerified, setIsLocationVerified] = useState<boolean>(() => !!GeolocationService.getLastKnownLocation());
  const [locationError, setLocationError] = useState<string | null>(null);

  const verifyLocation = useCallback(async (): Promise<AuditLocation | null> => {
    try {
      setLocationError(null);
      const loc = await GeolocationService.getCurrentLocation();
      setCurrentLocation(loc);
      setIsLocationVerified(true);
      return loc;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error verificando la ubicación del consultorio.';
      setLocationError(msg);
      // No marcar como verificado si fue denegado expresamente
      return null;
    }
  }, []);

  // Intentar verificar ubicación al iniciar
  useEffect(() => {
    verifyLocation();
  }, [verifyLocation]);

  const refreshUsersAndConfig = useCallback(async () => {
    if (!rootDirHandle) {
      setIsLoadingAuth(false);
      return;
    }
    setIsLoadingAuth(true);
    try {
      const config = await AuthService.loadOrCreateClinicConfig(rootDirHandle);
      const usersFile = await AuthService.loadOrCreateUsers(rootDirHandle);
      const supervisor = await AuthService.getSupervisorDoctor(rootDirHandle);

      setClinicConfig(config);
      setAvailableUsers(usersFile.users);
      setSupervisorDoctor(supervisor);

      // Rehidratar sesión de médico activo desde localStorage
      const savedDoctorId = localStorage.getItem(ACTIVE_USER_STORAGE_KEY);
      if (savedDoctorId) {
        const matchingUser = usersFile.users.find((u) => u.id === savedDoctorId && u.active);
        if (matchingUser) {
          setCurrentUser(matchingUser);
        }
      }
    } catch (err) {
      console.error('[AuthContext] Error cargando configuración o usuarios:', err);
    } finally {
      setIsLoadingAuth(false);
    }
  }, [rootDirHandle]);

  // Cada vez que se conecte la carpeta, cargar configuración y usuarios de la clínica
  useEffect(() => {
    if (isConnected && rootDirHandle) {
      refreshUsersAndConfig();
    } else {
      setClinicConfig(null);
      setAvailableUsers([]);
      setIsLoadingAuth(false);
    }
  }, [isConnected, rootDirHandle, refreshUsersAndConfig]);

  const login = async (username: string, password: string): Promise<boolean> => {
    if (!rootDirHandle) return false;
    setIsLoadingAuth(true);
    try {
      // Re-verificar ubicación durante el inicio de sesión
      let loc = currentLocation;
      if (!loc) {
        loc = await verifyLocation();
      }

      const user = await AuthService.authenticate(rootDirHandle, username, password);
      if (user) {
        setCurrentUser(user);
        localStorage.setItem(ACTIVE_USER_STORAGE_KEY, user.id);

        // Registrar auditoría de inicio de sesión con ubicación GPS
        await AuthService.recordAudit(
          rootDirHandle,
          user,
          'INICIO_SESION',
          `Inicio de sesión exitoso de '${user.fullName}' desde ${loc ? `Lat: ${loc.latitude}, Lon: ${loc.longitude}` : 'Ubicación local'}`,
          undefined,
          loc || undefined
        );

        return true;
      }
      return false;
    } catch (err) {
      console.error('[AuthContext] Error en login:', err);
      return false;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = async () => {
    if (rootDirHandle && currentUser) {
      await AuthService.recordAudit(
        rootDirHandle,
        currentUser,
        'CIERRE_SESION',
        `Cierre de sesión del usuario '${currentUser.fullName}'`,
        undefined,
        currentLocation || undefined
      );
    }
    localStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
    setCurrentUser(null);
  };

  const registerDoctor = async (data: {
    username: string;
    passwordPlain: string;
    fullName: string;
    title: string;
    licenseNumber: string;
    university: string;
    role: UserRole;
  }): Promise<User> => {
    if (!rootDirHandle) throw new Error('No hay carpeta conectada');
    const newUser = await AuthService.registerDoctor(rootDirHandle, data, currentUser || undefined);
    await refreshUsersAndConfig();
    return newUser;
  };

  const updateProfile = async (
    updatedData: Partial<Pick<User, 'fullName' | 'title' | 'licenseNumber' | 'university'>>
  ): Promise<User> => {
    if (!rootDirHandle || !currentUser) throw new Error('No hay sesión activa');
    const updated = await AuthService.updateUserProfile(rootDirHandle, currentUser.id, updatedData);
    setCurrentUser(updated);
    await refreshUsersAndConfig();
    return updated;
  };

  const changePassword = async (newPassword: string): Promise<void> => {
    if (!rootDirHandle || !currentUser) throw new Error('No hay sesión activa');
    await AuthService.changePassword(rootDirHandle, currentUser.id, newPassword);
  };

  const logAuditAction = async (action: AuditAction, details: string, targetPatientId?: string) => {
    if (!rootDirHandle || !currentUser) return;
    try {
      await AuthService.recordAudit(
        rootDirHandle,
        currentUser,
        action,
        details,
        targetPatientId,
        currentLocation || undefined
      );
    } catch (err) {
      console.error('[AuthContext] Error registrando auditoría:', err);
    }
  };

  const value = useMemo(
    () => ({
      currentUser,
      clinicConfig,
      supervisorDoctor,
      availableUsers,
      isLoadingAuth,
      currentLocation,
      isLocationVerified,
      locationError,
      verifyLocation,
      login,
      logout,
      registerDoctor,
      updateProfile,
      changePassword,
      logAuditAction,
      refreshUsersAndConfig,
    }),
    [
      currentUser,
      clinicConfig,
      supervisorDoctor,
      availableUsers,
      isLoadingAuth,
      currentLocation,
      isLocationVerified,
      locationError,
      verifyLocation,
      refreshUsersAndConfig,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
