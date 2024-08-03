import { ChevronDownIcon } from '@heroicons/react/24/outline';
import React from 'react';

const Dropdown = ({ selectedOption, onOptionSelect }) => {
    const options = ['Day', 'Week', 'Month', 'Year', 'All'];

    return (
        <div className="relative inline-block text-left">
            <div className="group">
                <button
                    type="button"
                    className="inline-flex justify-between items-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium hover:bg-gray-50 focus:outline-none"
                    id="menu-button"
                    aria-expanded="true"
                    aria-haspopup="true"
                >
                    {selectedOption}
                    <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" />
                </button>

                <div
                    className="opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-300 ease-in-out transform group-hover:scale-100 scale-95 origin-top-right absolute z-20 right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="menu-button"
                    tabIndex="-1"
                >
                    <div className="py-1" role="none">
                        {options.map((option) => (
                            <a
                                key={option}
                                href="#"
                                className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100"
                                role="menuitem"
                                tabIndex="-1"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onOptionSelect(option);
                                }}
                            >
                                {option}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dropdown;
