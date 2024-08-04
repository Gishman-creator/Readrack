// src/components/Table.js

import React, { useEffect, useRef, useState } from "react";
import seriesData from "../../data/Data";
import { ChevronLeftIcon, ChevronRightIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

function Table() {
    const [hasShadow, setHasShadow] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
      const container = containerRef.current;
  
      const handleScroll = () => {
        if (container.scrollTop > 0) {
          setHasShadow(true);
        } else {
          setHasShadow(false);
        }
      };
  
      if (container) {
        container.addEventListener("scroll", handleScroll);
      }
  
      // Cleanup the event listener on component unmount
      return () => {
        if (container) {
          container.removeEventListener("scroll", handleScroll);
        }
      };
    }, []);


    // State to manage which rows are checked
    const [checkedRows, setCheckedRows] = useState(
        new Array(seriesData.length).fill(false)
    );

    // State to manage the "Select All" checkbox
    const [selectAllChecked, setSelectAllChecked] = useState(false);

    // Function to handle row click
    const handleRowClick = (index) => {
        const updatedCheckedRows = [...checkedRows];
        updatedCheckedRows[index] = !updatedCheckedRows[index];
        setCheckedRows(updatedCheckedRows);
        setSelectAllChecked(updatedCheckedRows.every((checked) => checked));
    };

    // Function to handle "Select All" checkbox
    const handleSelectAll = (event) => {
        const isChecked = event.target.checked;
        setCheckedRows(new Array(seriesData.length).fill(isChecked));
        setSelectAllChecked(isChecked);
    };

    return (
        <div ref={containerRef} className="overflow-y-scroll rounded max-h-custom">
            <div className={`bg-[#f6f9f2] sticky top-0 p-2 flex justify-between items-center ${hasShadow ? "drop-shadow-sm" : ""}`}>
                <div className="flex justify-between items-center w-fit py-2 ">
                    <p className="text-xs px-2 border-r-[1.5px] border-slate-300">Series</p>
                    <div className="flex space-x-2 px-2">
                        <PencilSquareIcon className="w-4 h-4 inline" />
                        <TrashIcon className="w-4 h-4 inline" />
                    </div>
                </div>
                <div className="flex justify-between items-center space-x-2">
                    <p className="text-xs">1 - 47 of 47</p>
                    <div>
                        <ChevronLeftIcon className="w-8 h-8 p-2 rounded-full on-click inline" />
                        <ChevronRightIcon className="w-8 h-8 p-2 rounded-full on-click inline" />
                    </div>
                </div>
            </div>
            <table className="min-w-full bg-[#f6f9f2] border-gray-300 text-left text-xs font-normal">
                <thead>
                    <tr className="border-b border-slate-200">
                        <th className="px-2 py-2 text-center">
                            <input
                                type="checkbox"
                                checked={selectAllChecked}
                                onChange={handleSelectAll}
                            />
                        </th>
                        <th className="px-4 py-2 text-slate-500">Series Name</th>
                        <th className="px-4 py-2 text-slate-500">Author</th>
                        <th className="px-4 py-2 text-slate-500">Number of Books</th>
                        <th className="px-4 py-2 text-slate-500">Genres</th>
                        <th className="px-4 py-2 text-slate-500">Amazon Link</th>
                    </tr>
                </thead>
                <tbody>
                    {seriesData.map((series, index) => (
                        <tr
                            key={index}
                            className={`cursor-pointer border-b border-slate-200 ${checkedRows[index] ? "bg-blue-100" : ""
                                }`}
                            onClick={() => handleRowClick(index)}
                        >
                            <td className="px-4 py-2 text-center">
                                <input
                                    type="checkbox"
                                    checked={checkedRows[index]}
                                    onChange={() => handleRowClick(index)}
                                />
                            </td>
                            <td className="px-4 py-2">{series.name}</td>
                            <td className="px-4 py-2">{series.author}</td>
                            <td className="px-4 py-2">{series.numBooks}</td>
                            <td className="px-4 py-2">{series.genres.join(", ")}</td>
                            <td className="px-4 py-2">
                                <a
                                    href={series.amazonLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 underline"
                                >
                                    Link
                                </a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Table;
