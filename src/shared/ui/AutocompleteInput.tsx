import { useState, useRef, useEffect, type ReactNode, type KeyboardEvent } from 'react';
import { Input, type InputProps } from './Input';
import { cn } from '../lib/utils';

export interface AutocompleteItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  raw: unknown;
}

export interface AutocompleteInputProps extends Omit<InputProps, 'value' | 'onChange' | 'onSelect'> {
  value: string;
  onChange: (val: string) => void;
  onSelect: (item: AutocompleteItem) => void;
  items: AutocompleteItem[];
  itemRenderer?: (item: AutocompleteItem, isSelected: boolean) => ReactNode;
}

export function AutocompleteInput({
  value,
  onChange,
  onSelect,
  items,
  itemRenderer,
  placeholder,
  ...inputProps
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || items.length === 0) {
      if (e.key === 'ArrowDown' && items.length > 0) {
        setIsOpen(true);
        setSelectedIndex(0);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < items.length) {
        e.preventDefault();
        const selected = items[selectedIndex];
        onSelect(selected);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleItemClick = (item: AutocompleteItem) => {
    onSelect(item);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
          setSelectedIndex(-1);
        }}
        onFocus={() => {
          if (items.length > 0) setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        {...inputProps}
      />

      {isOpen && items.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-xl py-1 text-left animate-in fade-in zoom-in-95 duration-150">
          {items.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={cn(
                  'px-3.5 py-2.5 cursor-pointer text-xs transition-colors border-b last:border-b-0 border-slate-50 flex items-center justify-between gap-2',
                  isSelected ? 'bg-blue-50/80 text-blue-900' : 'hover:bg-slate-50 text-slate-700'
                )}
              >
                {itemRenderer ? (
                  itemRenderer(item, isSelected)
                ) : (
                  <>
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{item.title}</p>
                      {item.subtitle && <p className="text-[11px] text-slate-400 truncate">{item.subtitle}</p>}
                    </div>
                    {item.badge && (
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
