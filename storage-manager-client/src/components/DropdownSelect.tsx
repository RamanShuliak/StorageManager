import React, { useState, useRef, useEffect } from 'react';
import './DropdownSelect.css';

interface FilterOption {
  id: string;
  name: string;
}

interface DropdownSelectProps {
  options: FilterOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  className?: string;
}

export const DropdownSelect: React.FC<DropdownSelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const rootClasses = `dropdown-select ${className}`.trim();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.id === value);
  const label = selectedOption ? selectedOption.name : placeholder;

  return (
    <div className={rootClasses} ref={rootRef}>
      <button
        type="button"
        className="dropdown-toggle-ds"
        onClick={() => setIsOpen(open => !open)}
      >
        {label}
        <span className="dropdown-arrow" />
      </button>
      {isOpen && (
        <ul className="dropdown-menu-ds">
          {options.map(opt => (
            <li
              key={opt.id}
              className={`dropdown-item-ds${opt.id === value ? ' active' : ''}`}
              onClick={() => {
                onChange(opt.id);
                setIsOpen(false);
              }}
            >
              {opt.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
