import { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers/AuthContext';
import { Modal, Button, Input } from '@/shared/ui';
import { UserCheck, KeyRound, Check } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { currentUser, updateProfile, changePassword } = useAuth();

  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [university, setUniversity] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName);
      setTitle(currentUser.title);
      setLicenseNumber(currentUser.licenseNumber);
      setUniversity(currentUser.university || 'UNIVERSIDAD AUTÓNOMA DE BAJA CALIFORNIA');
    }
  }, [currentUser, isOpen]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setMsg(null);
    setIsSubmitting(true);

    try {
      await updateProfile({
        fullName: fullName.trim(),
        title: title.trim(),
        licenseNumber: licenseNumber.trim(),
        university: university.trim(),
      });

      if (newPassword.trim()) {
        if (newPassword !== confirmPassword) {
          throw new Error('Las contraseñas no coinciden');
        }
        if (newPassword.length < 4) {
          throw new Error('La contraseña debe tener al menos 4 caracteres');
        }
        await changePassword(newPassword);
        setNewPassword('');
        setConfirmPassword('');
      }

      setMsg({ text: 'Perfil y credenciales actualizados exitosamente en disco.', type: 'success' });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMsg({ text: err.message, type: 'error' });
      } else {
        setMsg({ text: 'Error al actualizar perfil.', type: 'error' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mi Perfil Profesional y Credenciales"
      description={`Usuario: @${currentUser.username} (${currentUser.role === 'titular' ? 'Médico Titular / Supervisor' : 'Médico Pasante MPSS'})`}
      maxWidth="lg"
    >
      <form onSubmit={handleSaveProfile} className="space-y-4 text-left">
        {msg && (
          <div
            className={`p-3 rounded-xl text-xs font-medium ${
              msg.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                : 'bg-rose-50 text-rose-600 border border-rose-100'
            }`}
          >
            {msg.text}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Datos Clínicos del Médico</span>
          </div>

          <Input
            label="Nombre Completo con Título"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Título / Cargo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              label="Cédula o Matrícula MPSS"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
            />
          </div>

          <Input
            label="Universidad / Institución de Egreso"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
          />
        </div>

        {/* Change password section */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 pt-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
            <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
            <span>Cambiar Contraseña (Opcional)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Nueva Contraseña"
              type="password"
              placeholder="Dejar en blanco para no cambiar"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              label="Confirmar Contraseña"
              type="password"
              placeholder="Confirmar nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            leftIcon={<Check className="w-4 h-4" />}
          >
            Guardar Cambios
          </Button>
        </div>
      </form>
    </Modal>
  );
}
