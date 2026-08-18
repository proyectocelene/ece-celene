import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { FileSystemApi } from '@/shared/api/fileSystem';
import { PatientIndexService } from '@/entities/patient/api/patientIndexService';
import { CatalogSearchService } from '@/entities/catalogs/api/catalogSearchService';
import type { PatientIndexEntry, PatientIndexFile } from '@/entities/patient/model/schemas';

interface WorkspaceContextValue {
  rootDirHandle: FileSystemDirectoryHandle | null;
  folderName: string | null;
  isConnected: boolean;
  isRestoring: boolean;
  indexData: PatientIndexFile | null;
  isLoadingIndex: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredPatients: PatientIndexEntry[];
  connectWorkspace: () => Promise<void>;
  restoreWorkspace: () => Promise<boolean>;
  disconnectWorkspace: () => Promise<void>;
  reloadIndex: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rootDirHandle, setRootDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [folderName, setFolderName] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [indexData, setIndexData] = useState<PatientIndexFile | null>(null);
  const [isLoadingIndex, setIsLoadingIndex] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadIndexForHandle = useCallback(async (handle: FileSystemDirectoryHandle) => {
    setIsLoadingIndex(true);
    try {
      const index = await PatientIndexService.loadOrRebuildIndex(handle);
      setIndexData(index);
      // Inicializar / cargar catalogo_medicamentos.json físico en la carpeta local
      await CatalogSearchService.initWorkspaceCatalog(handle);
    } catch (err) {
      console.error('[WorkspaceContext] Error cargando índice:', err);
      setError('No se pudo cargar o reconstruir el índice de pacientes.');
    } finally {
      setIsLoadingIndex(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const handle = await FileSystemApi.restoreDirectoryAccess();
        if (handle && isMounted) {
          setRootDirHandle(handle);
          setFolderName(handle.name);
          await loadIndexForHandle(handle);
        }
      } catch (err) {
        console.warn('[WorkspaceContext] No se pudo restaurar handle automáticamente:', err);
      } finally {
        if (isMounted) setIsRestoring(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [loadIndexForHandle]);

  const connectWorkspace = async () => {
    setError(null);
    try {
      const handle = await FileSystemApi.requestDirectoryAccess();
      setRootDirHandle(handle);
      setFolderName(handle.name);
      await loadIndexForHandle(handle);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message || 'Error al conectar con la carpeta seleccionada.');
      }
      throw err;
    }
  };

  const restoreWorkspace = async (): Promise<boolean> => {
    setError(null);
    try {
      const handle = await FileSystemApi.restoreDirectoryAccess();
      if (handle) {
        setRootDirHandle(handle);
        setFolderName(handle.name);
        await loadIndexForHandle(handle);
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      setError('No se pudo restaurar el acceso. Por favor selecciona la carpeta manualmente.');
      return false;
    }
  };

  const disconnectWorkspace = async () => {
    setRootDirHandle(null);
    setFolderName(null);
    setIndexData(null);
    setSearchQuery('');
  };

  const reloadIndex = async () => {
    if (!rootDirHandle) return;
    setIsLoadingIndex(true);
    try {
      const index = await PatientIndexService.rebuildIndexFromFolders(rootDirHandle);
      setIndexData(index);
    } catch (err) {
      console.error(err);
      setError('Error al resincronizar pacientes.');
    } finally {
      setIsLoadingIndex(false);
    }
  };

  const filteredPatients = useMemo(() => {
    if (!indexData?.patients) return [];
    if (!searchQuery.trim()) return indexData.patients;

    const q = searchQuery.toLowerCase().trim();
    return indexData.patients.filter((p) => {
      return (
        p.fullName.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.curpOrId && p.curpOrId.toLowerCase().includes(q)) ||
        (p.phone && p.phone.includes(q))
      );
    });
  }, [indexData, searchQuery]);

  const value = useMemo(
    () => ({
      rootDirHandle,
      folderName,
      isConnected: !!rootDirHandle,
      isRestoring,
      indexData,
      isLoadingIndex,
      error,
      searchQuery,
      setSearchQuery,
      filteredPatients,
      connectWorkspace,
      restoreWorkspace,
      disconnectWorkspace,
      reloadIndex,
    }),
    [
      rootDirHandle,
      folderName,
      isRestoring,
      indexData,
      isLoadingIndex,
      error,
      searchQuery,
      filteredPatients,
      loadIndexForHandle,
    ]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace debe ser usado dentro de un WorkspaceProvider');
  }
  return context;
};
