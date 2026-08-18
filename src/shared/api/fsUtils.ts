import { z, type ZodType } from 'zod';

/**
 * Limpia un string para que sea seguro como nombre de carpeta en Windows, Mac, Linux y nubes (Drive/OneDrive).
 */
export function sanitizeFolderName(input: string): string {
  return input
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[/\\?%*:|"<>]/g, '')
    .replace(/\s+/g, '_');
}

/**
 * Genera el nombre estandarizado de carpeta para un paciente: PAC-[ID]_[Nombre_Apellido]
 */
export function buildPatientFolderName(id: string, firstName: string, lastName: string): string {
  const cleanFirst = sanitizeFolderName(firstName);
  const cleanLast = sanitizeFolderName(lastName);
  const cleanId = sanitizeFolderName(id.startsWith('PAC-') ? id : `PAC-${id}`);
  return `${cleanId}_${cleanFirst}_${cleanLast}`;
}

/**
 * Obtiene una subcarpeta si existe, o retorna null si no existe.
 */
export async function getDirectory(
  parentHandle: FileSystemDirectoryHandle,
  dirName: string
): Promise<FileSystemDirectoryHandle | null> {
  try {
    return await parentHandle.getDirectoryHandle(dirName, { create: false });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'NotFoundError') {
      return null;
    }
    throw err;
  }
}

/**
 * Obtiene o crea una subcarpeta si no existe.
 */
export async function getOrCreateDirectory(
  parentHandle: FileSystemDirectoryHandle,
  dirName: string
): Promise<FileSystemDirectoryHandle> {
  return await parentHandle.getDirectoryHandle(dirName, { create: true });
}

/**
 * Lee y parsea un archivo JSON de un directorio.
 * Si se provee un schema Zod, valida los datos antes de retornar.
 */
export async function readJsonFile<T>(
  parentHandle: FileSystemDirectoryHandle,
  fileName: string,
  schema?: ZodType<T>
): Promise<T | null> {
  try {
    const fileHandle = await parentHandle.getFileHandle(fileName, { create: false });
    const file = await fileHandle.getFile();
    const text = await file.text();
    if (!text.trim()) return null;

    const rawData = JSON.parse(text);
    if (schema) {
      return schema.parse(rawData);
    }
    return rawData as T;
  } catch (err: unknown) {
    if (err instanceof Error && (err.name === 'NotFoundError' || err.name === 'TypeMismatchError')) {
      return null;
    }
    if (err instanceof z.ZodError) {
      console.warn(`[readJsonFile] Error de validación Zod en ${fileName}:`, err.issues);
      throw new Error(`Estructura inválida en ${fileName}: ${err.issues.map((e) => e.message).join(', ')}`);
    }
    throw err;
  }
}

/**
 * Escribe un objeto como archivo JSON formateado en un directorio.
 */
export async function writeJsonFile<T>(
  parentHandle: FileSystemDirectoryHandle,
  fileName: string,
  data: T
): Promise<void> {
  const fileHandle = await parentHandle.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  const jsonContent = JSON.stringify(data, null, 2);
  await writable.write(jsonContent);
  await writable.close();
}

/**
 * Lista todos los subdirectorios de una carpeta dada.
 */
export async function listDirectories(
  parentHandle: FileSystemDirectoryHandle
): Promise<FileSystemDirectoryHandle[]> {
  const dirs: FileSystemDirectoryHandle[] = [];
  for await (const entry of parentHandle.values()) {
    if (entry.kind === 'directory') {
      dirs.push(entry as FileSystemDirectoryHandle);
    }
  }
  return dirs;
}

/**
 * Lista todos los archivos de una carpeta con opción de filtrar por extensión.
 */
export async function listFiles(
  parentHandle: FileSystemDirectoryHandle,
  filterExtension?: string
): Promise<FileSystemFileHandle[]> {
  const files: FileSystemFileHandle[] = [];
  for await (const entry of parentHandle.values()) {
    if (entry.kind === 'file') {
      if (!filterExtension || entry.name.toLowerCase().endsWith(filterExtension.toLowerCase())) {
        files.push(entry as FileSystemFileHandle);
      }
    }
  }
  return files;
}
