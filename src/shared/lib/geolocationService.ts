import type { AuditLocation } from '@/entities/auth/model/schemas';

const GEO_STORAGE_KEY = 'celene_device_last_location';

export class GeolocationService {
  /**
   * Obtiene la ubicación GPS precisa actual del dispositivo.
   * Lanza un error si el usuario deniega el permiso o si no está disponible.
   */
  static async getCurrentLocation(): Promise<AuditLocation> {
    if (!navigator.geolocation) {
      throw new Error('La geolocalización no es compatible con este navegador.');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc: AuditLocation = {
            latitude: Number(position.coords.latitude.toFixed(6)),
            longitude: Number(position.coords.longitude.toFixed(6)),
            accuracy: Math.round(position.coords.accuracy),
            timestamp: new Date(position.timestamp).toISOString(),
          };

          // Guardar última ubicación válida en almacenamiento local
          try {
            localStorage.setItem(GEO_STORAGE_KEY, JSON.stringify(loc));
          } catch {
            // Ignorar error de almacenamiento
          }

          resolve(loc);
        },
        (error) => {
          let message = 'No se pudo obtener la ubicación del consultorio.';
          if (error.code === error.PERMISSION_DENIED) {
            message = 'Permiso de ubicación denegado. Por seguridad institucional, debes permitir el acceso a la ubicación en tu navegador para usar el ECE.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            message = 'La señal de GPS / Ubicación no está disponible en este dispositivo.';
          } else if (error.code === error.TIMEOUT) {
            message = 'Tiempo de espera agotado al consultar la ubicación.';
          }
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 60000, // 1 minuto de caché máximo
        }
      );
    });
  }

  /**
   * Obtiene la última ubicación guardada o null
   */
  static getLastKnownLocation(): AuditLocation | null {
    try {
      const saved = localStorage.getItem(GEO_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  }
}
