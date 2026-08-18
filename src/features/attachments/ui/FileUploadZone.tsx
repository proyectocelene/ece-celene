import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Button, Input } from '@/shared/ui';
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface FileUploadZoneProps {
  onUpload: (file: File, customName?: string) => Promise<void>;
  isUploading: boolean;
}

export function FileUploadZone({ onUpload, isUploading }: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setCustomName(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setCustomName(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    await onUpload(selectedFile, customName.trim() || undefined);
    setSelectedFile(null);
    setCustomName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Drop area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-150',
          isDragOver
            ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
            : 'border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,image/*,.doc,.docx,.txt"
          onChange={handleFileChange}
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-slate-800">
              Arrastra y suelta tu archivo aquí o <span className="text-blue-600">examinar</span>
            </p>
            <p className="text-xs text-slate-500">
              Soporta PDFs, Radiografías, Ultrasonidos e Imágenes (JPG, PNG, WebP)
            </p>
          </div>
        </div>
      </div>

      {/* Selected file confirmation & rename bar */}
      {selectedFile && (
        <div className="p-4 rounded-xl bg-white border border-blue-200 shadow-xs space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs text-slate-400 font-medium">Archivo detectado:</p>
              <p className="text-sm font-bold text-slate-800 truncate">{selectedFile.name}</p>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100">
            <div className="flex-1 w-full">
              <Input
                label="Nombre para el archivo en el expediente"
                placeholder="Ej. Biometría Hemática - Laboratorio Chopo"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:mt-5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                disabled={isUploading}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                isLoading={isUploading}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Guardar en Disco
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
