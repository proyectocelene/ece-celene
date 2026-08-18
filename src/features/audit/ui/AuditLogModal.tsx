import { useState, useEffect, useCallback } from 'react';
import { useWorkspace } from '@/app/providers/WorkspaceContext';
import { AuthService } from '@/entities/auth/api/authService';
import type { AuditLogEntry } from '@/entities/auth/model/schemas';
import { Modal, Button, Badge, Input } from '@/shared/ui';
import { ShieldCheck, Search, RefreshCw, Clock, MapPin } from 'lucide-react';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuditLogModal({ isOpen, onClose }: AuditLogModalProps) {
  const { rootDirHandle } = useWorkspace();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');

  const loadLogs = useCallback(async () => {
    if (!rootDirHandle) return;
    setIsLoading(true);
    try {
      const list = await AuthService.loadAuditLogs(rootDirHandle);
      setLogs(list);
    } catch (err) {
      console.error('Error cargando logs de auditoría:', err);
    } finally {
      setIsLoading(false);
    }
  }, [rootDirHandle]);

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen, loadLogs]);

  const filteredLogs = logs.filter((l) => {
    const q = filterQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      l.userFullName.toLowerCase().includes(q) ||
      l.username.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q)
    );
  });

  const getActionBadge = (action: AuditLogEntry['action']) => {
    switch (action) {
      case 'INICIO_SESION':
        return <Badge variant="primary" size="sm">Inicio Sesión</Badge>;
      case 'CIERRE_SESION':
        return <Badge variant="default" size="sm">Cierre Sesión</Badge>;
      case 'CREAR_PACIENTE':
        return <Badge variant="success" size="sm">Nuevo Paciente</Badge>;
      case 'CREAR_NOTA_MEDICA':
        return <Badge variant="success" size="sm">Nota Médica</Badge>;
      case 'SUBIR_ADJUNTO':
        return <Badge variant="info" size="sm">Adjunto Subido</Badge>;
      case 'REGISTRAR_MEDICO':
        return <Badge variant="warning" size="sm">Nuevo Médico</Badge>;
      case 'IMPRIMIR_RECETA':
        return <Badge variant="primary" size="sm">Impresión Receta</Badge>;
      default:
        return <Badge variant="default" size="sm">{action}</Badge>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bitácora y Registro de Auditoría Local"
      description="Historial inmutable de eventos clínicos almacenados en auditoria_clinica.json."
      maxWidth="4xl"
    >
      <div className="space-y-4 text-left">
        {/* Search and refresh bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Buscar por médico, acción o detalle..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={loadLogs}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Actualizar
          </Button>
        </div>

        {/* Logs table / list */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[55vh] overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Cargando bitácora de auditoría...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 space-y-1">
              <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p>No se encontraron registros de auditoría.</p>
            </div>
          ) : (
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold sticky top-0">
                <tr>
                  <th className="py-2.5 px-4">Fecha y Hora</th>
                  <th className="py-2.5 px-4">Médico / Usuario</th>
                  <th className="py-2.5 px-4">Acción</th>
                  <th className="py-2.5 px-4">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 text-slate-500 font-mono whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>
                          {new Date(log.timestamp).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                          })}{' '}
                          {new Date(log.timestamp).toLocaleTimeString('es-MX', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                      <div>
                        <p>{log.userFullName}</p>
                        <p className="text-[10px] text-slate-400 font-normal">@{log.username} ({log.userRole})</p>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">
                      <div>
                        <span>{log.details}</span>
                        {log.location && (
                          <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-bold">
                            <MapPin className="w-2.5 h-2.5 text-emerald-600" />
                            <span>GPS: {log.location.latitude}, {log.location.longitude}</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400">
          <span>{filteredLogs.length} eventos registrados</span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar Bitácora
          </Button>
        </div>
      </div>
    </Modal>
  );
}
