import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axiosUtils from "../../../../utils/axiosUtils";
import { formatDate } from "../../../../utils/stringUtils";
import TableHeader from "./TableHeader";
import { toggleRowSelection, selectAllRows, clearSelection } from "../../slices/catalogSlice";

function Table({ openEditAuthorModal, openEditBooksModal, openEditSeriesModal }) {
    const dispatch = useDispatch();
    const activeTab = useSelector((state) => state.catalog.activeTab);
    const selectedRowIds = useSelector((state) => state.catalog.selectedRowIds);

    const [hasShadow, setHasShadow] = useState(false);
    const containerRef = useRef(null);

    const [tableData, setTableData] = useState([]);
    const [selectAllChecked, setSelectAllChecked] = useState(false);

    const navigate = useNavigate(); // Initialize navigate

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
                setSelectAllChecked(false); // Reset select all checkbox
                dispatch(clearSelection()); // Clear selections when data changes
            } catch (error) {
                console.error(`Error fetching ${activeTab.toLowerCase()}:`, error);
            }
        };

        fetchData();
    }, [activeTab, dispatch]);

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

    useEffect(() => {
        // Synchronize selectAllChecked with selectedRowIds
        setSelectAllChecked(selectedRowIds.length === tableData.length);
    }, [selectedRowIds, tableData]);

    const handleRowClick = (rowId, item) => {
        console.log(`Row ${rowId} clicked`);
    
        // Navigate based on the activeTab
        if (activeTab === "Series") {
            navigate(`serie/${item.id}/${encodeURIComponent(item.name)}`); // Navigate to SerieDetails
        } else if (activeTab === "Authors") {
            navigate(`author/${item.id}/${encodeURIComponent(item.name)}`); // Navigate to AuthorDetails
        } else if (activeTab === "Books") {
            dispatch(toggleRowSelection(rowId));
        }
    
        // Handle row selection
    };
   
    const handleCheckboxClick = (event, rowId) => {
        event.stopPropagation(); // Prevent navigation on checkbox click
        dispatch(toggleRowSelection(rowId));
    };

    const handleSelectAll = (event) => {
        const isChecked = event.target.checked;
        setSelectAllChecked(isChecked);

        if (isChecked) {
            const allIds = tableData.map((item) => item.id);
            dispatch(selectAllRows(allIds));
        } else {
            dispatch(clearSelection());
        }
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
        return tableData.map((item) => (
            <tr
                key={item.id} // Use unique item ID as key
                className={`cursor-pointer border-b border-slate-200 ${selectedRowIds.includes(item.id) ? "bg-blue-100" : ""}`}
                onClick={() => handleRowClick(item.id, item)} // Pass the item data
            >
                <td className="px-4 py-2 text-center">
                    <input
                        type="checkbox"
                        checked={selectedRowIds.includes(item.id)}
                        onChange={(e) => handleCheckboxClick(e, item.id)} // Handle checkbox click
                        onClick={(e) => e.stopPropagation()} // Prevent the click from bubbling to the row
                    />
                </td>
                {activeTab === "Series" && (
                    <>
                        <td className="px-4 py-2">{item.name}</td>
                        <td className="px-4 py-2">{item.author_name}</td>
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
                        <td className="px-4 py-2">{item.serie_name}</td>
                        <td className="px-4 py-2">{item.author_name}</td>
                        <td className="px-4 py-2">{formatDate(item.date)}</td>
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
                        <td className="px-4 py-2">{formatDate(item.date)}</td>
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
        <div className="rounded max-h-custom overflow-hidden custom-drop-shadow2">
            <TableHeader
                hasShadow={hasShadow}
                openEditAuthorModal={openEditAuthorModal}
                openEditBooksModal={openEditBooksModal}
                openEditSeriesModal={openEditSeriesModal}
            />
            <div ref={containerRef} className="overflow-y-auto max-h-custom1">
                <table className="min-w-full bg-[#fff] text-sm text-left">
                    <thead>
                        <tr className=" border-b border-slate-200">
                            <th className="px-4 py-2 text-slate-500 text-center">
                                <input
                                    type="checkbox"
                                    checked={selectAllChecked}
                                    onChange={handleSelectAll}
                                />
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
