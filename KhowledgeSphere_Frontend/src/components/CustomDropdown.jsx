import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import './CustomDropdown.css';

export default function CustomDropdown({ value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className={`custom-dropdown-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="dropdown-value">{value}</span>
        <ChevronDown size={16} className={`dropdown-icon ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <ul className="custom-dropdown-menu">
          {options.map((option) => (
            <li
              key={option}
              className={`custom-dropdown-item ${option === value ? 'selected' : ''}`}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
