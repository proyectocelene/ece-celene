import { useState, type KeyboardEvent } from 'react';
import { Badge } from '@/shared/ui/Badge';
import { Plus, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface TagInputProps {
  label?: string;
  placeholder?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  variant?: 'danger' | 'primary' | 'warning' | 'default';
  disabled?: boolean;
}

export function TagInput({
  label,
  placeholder = 'Escribe y presiona Enter...',
  tags = [],
  onChange,
  suggestions = [],
  variant = 'default',
  disabled = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    onChange([...tags, trimmed]);
    setInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  return (
    <div className="w-full space-y-2 text-left">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          {label}
        </label>
      )}

      {/* Input container */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          disabled={disabled}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'flex-1 rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-800 placeholder-slate-400',
            'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100',
            'disabled:bg-slate-50 disabled:text-slate-400'
          )}
        />
        <button
          type="button"
          disabled={disabled || !inputValue.trim()}
          onClick={() => addTag(inputValue)}
          className="inline-flex items-center justify-center p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Tag badges */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {tags.map((tag) => (
            <Badge key={tag} variant={variant} size="md" className="pr-1.5 py-1">
              <span>{tag}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:opacity-70 rounded-full p-0.5 ml-1 transition-opacity cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Quick suggestions */}
      {suggestions.length > 0 && (
        <div className="pt-1 flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
          <span className="text-slate-400">Sugerencias:</span>
          {suggestions
            .filter((s) => !tags.includes(s))
            .slice(0, 5)
            .map((sug) => (
              <button
                key={sug}
                type="button"
                disabled={disabled}
                onClick={() => addTag(sug)}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition-colors cursor-pointer"
              >
                + {sug}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
