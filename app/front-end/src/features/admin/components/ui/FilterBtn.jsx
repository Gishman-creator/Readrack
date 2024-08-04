import { FunnelIcon } from '@heroicons/react/24/outline';
import React from 'react'

function FilterBtn() {
    const options = ['Complete', 'Incomplete'];

    return (
        <div className="relative inline-block text-left">
            <div className="group">
                <button
                    type="button"
                    className="flex justify-between items-center space-x-2 rounded border border-gray-300 shadow-sm px-3 py-2 bg-[#fafcf8] hover:bg-gray-50 focus:outline-none"
                    id="menu-button"
                    aria-expanded="true"
                    aria-haspopup="true"
                >
                    <FunnelIcon className="h-3 w-3" />
                    <p className='text-xs'>Filter</p>
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

export default FilterBtn