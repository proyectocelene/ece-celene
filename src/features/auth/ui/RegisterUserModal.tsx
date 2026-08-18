import { useState } from 'react';
import { useAuth } from '@/app/providers/AuthContext';
import type { UserRole } from '@/entities/auth/model/schemas';
import { Modal, Button, Input, Select } from '@/shared/ui';
import { Shield, Check } from 'lucide-react';

interface RegisterUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered?: (username: string) => void;
}

export function RegisterUserModal({ isOpen, onClose, onRegistered }: RegisterUserModalProps) {
  const { registerDoctor } = useAuth();
  const [role, setRole] = useState<UserRole>('pasante');
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('MÉDICO PASANTE DEL SERVICIO SOCIAL (MPSS)');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [university, setUniversity] = useState('UNIVERSIDAD AUTÓNOMA DE BAJA CALIFORNIA');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'pasante') {
      setTitle('MÉDICO PASANTE DEL SERVICIO SOCIAL (MPSS)');
      setLicenseNumber('MPSS - UABC');
    } else if (newRole === 'titular') {
      setTitle('MÉDICO GENERAL');
      setLicenseNumber('CED. PROF. ');
    } else {
      setTitle('ASISTENTE CLÍNICO');
      setLicenseNumber('N/A');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !username.trim() || !password.trim()) {
      setError('Por favor llena los campos obligatorios (Nombre, Usuario y Contraseña).');
      return;
    }

    if (password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newUser = await registerDoctor({
        fullName: fullName.trim(),
        role,
        title: title.trim(),
        licenseNumber: licenseNumber.trim(),
        university: university.trim(),
        username: username.trim(),
        passwordPlain: password,
      });

      // Reset form
      setFullName('');
      setUsername('');
      setPassword('');
      onClose();

      if (onRegistered) {
        onRegistered(newUser.username);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error al registrar el usuario.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Nuevo Médico o Pasante (MPSS)"
      description="Las credenciales se almacenarán de forma 100% privada dentro del archivo local usuarios_clinica.json."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Select
            label="Rol en el Consultorio *"
            value={role}
            onChange={(e) => handleRoleChange(e.target.value as UserRole)}
          >
            <option value="pasante">Médico Pasante del Servicio Social (MPSS)</option>
            <option value="titular">Médico Titular / Supervisor</option>
            <option value="asistente">Asistente / Enfermería</option>
          </Select>
        </div>

        <Input
          label="Nombre Completo con Título *"
          placeholder="Ej. Dr. Sebastián Garduño Conde"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Título / Especialidad"
            placeholder="Ej. MÉDICO PASANTE DEL SERVICIO SOCIAL"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            label="Cédula Profesional o Matrícula MPSS"
            placeholder="Ej. CED. PROF. 15504256 o MPSS-2026"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
          />
        </div>

        <Input
          label="Universidad / Institución de Egreso"
          placeholder="Ej. UNIVERSIDAD AUTÓNOMA DE BAJA CALIFORNIA"
          value={university}
          onChange={(e) => setUniversity(e.target.value)}
        />

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Credenciales de Acceso Local</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre de Usuario *"
              placeholder="Ej. Dr. Sebastian"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              label="Contraseña *"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            className="shadow-sm shadow-blue-500/20"
          >
            Registrar Credenciales
          </Button>
        </div>
      </form>
    </Modal>
  );
}
