import { get, set } from 'idb-keyval';

const DIRECTORY_HANDLE_KEY = 'ece_root_directory_handle';

export class FileSystemApi {
  /**
   * Solicita al usuario seleccionar una carpeta y guarda el permiso en IndexedDB.
   */
  static async requestDirectoryAccess(): Promise<FileSystemDirectoryHandle> {
    try {
      // Prompt user to select a directory
      const directoryHandle = await window.showDirectoryPicker({
        id: 'ece_workspace',
        mode: 'readwrite',
      });
      
      // Save the handle to IndexedDB for future sessions
      await set(DIRECTORY_HANDLE_KEY, directoryHandle);
      
      return directoryHandle;
    } catch (error) {
      console.error('Error requesting directory access:', error);
      throw error;
    }
  }

  /**
   * Intenta recuperar el handle de la sesión anterior.
   * Si requiere permisos, solicita al usuario que los vuelva a otorgar.
   */
  static async restoreDirectoryAccess(): Promise<FileSystemDirectoryHandle | null> {
    try {
      const handle = await get<FileSystemDirectoryHandle>(DIRECTORY_HANDLE_KEY);
      if (!handle) return null;

      // Check if we already have permission
      const permission = await handle.queryPermission({ mode: 'readwrite' });
      if (permission === 'granted') {
        return handle;
      }

      // If not granted, we might need user interaction to request it again
      // Note: requestPermission MUST be called from a user gesture (e.g. click)
      // So this method might throw if called on load without user interaction,
      // or it might return null and we should prompt the user.
      const requestResult = await handle.requestPermission({ mode: 'readwrite' });
      if (requestResult === 'granted') {
        return handle;
      }

      return null;
    } catch (error) {
      console.error('Error restoring directory access:', error);
      return null;
    }
  }
}
