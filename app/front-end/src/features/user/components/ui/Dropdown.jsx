import { ChevronDownIcon, FunnelIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useRef, useState } from 'react';
import { FaFilter } from 'react-icons/fa'; // Import a funnel/filter icon
import { capitalize } from '../../../../utils/stringUtils';

const Dropdown = ({ types, selectedType, onSelectType }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleToggleDropdown = () => {
        setIsOpen(!isOpen);
    };
  
    // Click outside logic to close dropdown
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
  
      // Add event listener when the component mounts
      document.addEventListener('mousedown', handleClickOutside);
  
      // Cleanup event listener when the component unmounts
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [dropdownRef]);

    const handleSelectType = (type) => {
        onSelectType(type);
        setIsOpen(false); // Close dropdown after selection
    };

    return (
        <div ref={dropdownRef} className="relative inline-block text-left">
            <div className="flex items-center py-[0.6rem] sm:py-2 px-4 sm:space-x-2 cursor-pointer on-click border border-gray-300 rounded-lg ml-2" onClick={handleToggleDropdown}>
                <FunnelIcon className="hidden sm:inline h-7 w-5" /> {/* Funnel icon */}
                <span className="sm:text-sm font-poppins font-medium">{capitalize(selectedType)}</span>
            </div>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 font-arima font-semibold">
                    <ul className="p-1">
                        {types.map((type) => (
                            <li
                                key={type}
                                className={`block px-4 py-2 text-sm text-gray-700 rounded-lg cursor-pointer on-click ${
                                    selectedType === type ? 'bg-gray-200' : ''
                                }`}
                                onClick={() => handleSelectType(type)}
                            >
                                {type}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Dropdown;
