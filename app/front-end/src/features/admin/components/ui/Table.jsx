// src/components/Table.js
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux"; // Import useSelector to access the Redux store
import axiosUtils from "../../../../utils/axiosUtils";
import TableHeader from "./TableHeader";

function Table() {
  const [hasShadow, setHasShadow] = useState(false);
  const containerRef = useRef(null);

  const activeTab = useSelector((state) => state.tabs.activeTab); // Get the active tab from the Redux store
  const [tableData, setTableData] = useState([]);

  // State to manage which rows are checked
  const [checkedRows, setCheckedRows] = useState([]);
  
  // Initialize state for selectAllChecked
  const [selectAllChecked, setSelectAllChecked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let response;
        if (activeTab === "Series") {
          response = await axiosUtils('/api/getSeries', 'GET');
        } else if (activeTab === "Books") {
          response = await axiosUtils('/api/getBooks', 'GET');
        } else if (activeTab === "Authors") {
          response = await axiosUtils('/api/getAuthors', 'GET');
        }
        setTableData(response.data);
        setCheckedRows(new Array(response.data.length).fill(false)); // Initialize checked rows
        setSelectAllChecked(false); // Reset select all checkbox when data changes
      } catch (error) {
        console.error(`Error fetching ${activeTab.toLowerCase()}:`, error);
      }
    };

    fetchData();
  }, [activeTab]);

  useEffect(() => {
    const container = containerRef.current;

    const handleScroll = () => {
      setHasShadow(container.scrollTop > 0);
    };

    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);


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
    setCheckedRows(new Array(tableData.length).fill(isChecked));
    setSelectAllChecked(isChecked);
  };

  const renderTableHeaders = () => {
    if (activeTab === "Series") {
      return (
        <>
          <th className="px-4 py-2 text-slate-500">Series Name</th>
          <th className="px-4 py-2 text-slate-500">Author</th>
          <th className="px-4 py-2 text-slate-500">Number of Books</th>
          <th className="px-4 py-2 text-slate-500">Genres</th>
          <th className="px-4 py-2 text-slate-500">Link</th>
          <th className="px-4 py-2 text-slate-500">Search Count</th>
        </>
      );
    } else if (activeTab === "Books") {
      return (
        <>
          <th className="px-4 py-2 text-slate-500">Book Name</th>
          <th className="px-4 py-2 text-slate-500">Series Name</th>
          <th className="px-4 py-2 text-slate-500">Author</th>
          <th className="px-4 py-2 text-slate-500">Publish Date</th>
          <th className="px-4 py-2 text-slate-500">Link</th>
        </>
      );
    } else if (activeTab === "Authors") {
      return (
        <>
          <th className="px-4 py-2 text-slate-500">Author Name</th>
          <th className="px-4 py-2 text-slate-500">Number of Books</th>
          <th className="px-4 py-2 text-slate-500">Date of Birth</th>
          <th className="px-4 py-2 text-slate-500">Nationality</th>
          <th className="px-4 py-2 text-slate-500">Link</th>
          <th className="px-4 py-2 text-slate-500">Search Count</th>
        </>
      );
    }
  };

  const renderTableRows = () => {
    return tableData.map((item, index) => (
      <tr
        key={index}
        className={`cursor-pointer border-b border-slate-200 ${checkedRows[index] ? "bg-blue-100" : ""}`}
        onClick={() => handleRowClick(index)}
      >
        <td className="px-4 py-2 text-center">
          <input type="checkbox" checked={checkedRows[index]} onChange={() => handleRowClick(index)} />
        </td>
        {activeTab === "Series" && (
          <>
            <td className="px-4 py-2">{item.name}</td>
            <td className="px-4 py-2">{item.authorName}</td>
            <td className="px-4 py-2">{item.booksNo}</td>
            <td className="px-4 py-2">{item.genres}</td>
            <td className="px-4 py-2">
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                Link
              </a>
            </td>
            <td className="px-4 py-2">{item.searchCount}</td>
          </>
        )}
        {activeTab === "Books" && (
          <>
            <td className="px-4 py-2">{item.name}</td>
            <td className="px-4 py-2">{item.serieName}</td>
            <td className="px-4 py-2">{item.authorName}</td>
            <td className="px-4 py-2">{item.date}</td>
            <td className="px-4 py-2">
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                Link
              </a>
            </td>
          </>
        )}
        {activeTab === "Authors" && (
          <>
            <td className="px-4 py-2">{item.name}</td>
            <td className="px-4 py-2">{item.bookNo}</td>
            <td className="px-4 py-2">{item.date}</td>
            <td className="px-4 py-2">{item.nationality}</td>
            <td className="px-4 py-2">
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                Link
              </a>
            </td>
            <td className="px-4 py-2">{item.searchCount}</td>
          </>
        )}
      </tr>
    ));
  };

  return (
    <div className="rounded max-h-custom overflow-hidden">
      <TableHeader hasShadow={hasShadow} hasCheckedRows={checkedRows.some(row => row)} />
      <div ref={containerRef} className="overflow-y-auto max-h-custom1">
        <table className="min-w-full bg-[#f6f9f2] border-gray-300 text-left text-xs font-normal">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="px-2 py-2 text-center">
                <input type="checkbox" checked={selectAllChecked} onChange={handleSelectAll} />
              </th>
              {renderTableHeaders()}
            </tr>
          </thead>
          <tbody>{renderTableRows()}</tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;
