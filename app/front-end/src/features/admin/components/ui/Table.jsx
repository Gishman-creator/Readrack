import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axiosUtils from "../../../../utils/axiosUtils";
import { capitalize, spacesToHyphens } from "../../../../utils/stringUtils";
import TableHeader from "./TableHeader";
import { toggleRowSelection, selectAllRows, clearSelection, setTableTotalItems, setSearchTerm } from "../../slices/catalogSlice";
import { useSocket } from "../../../../context/SocketContext";
import toast from "react-hot-toast";
import NetworkErrorPage from "../../../../pages/NetworkErrorPage";
import { debounce } from "lodash";
import { sortByNumBooks } from "../../../../utils/sortingUtils";

function Table({ openEditAuthorModal, openEditBooksModal, openEditSeriesModal }) {

    const socket = useSocket();
    const dispatch = useDispatch();
    const activeTab = useSelector((state) => state.catalog.activeTab);
    const selectedRowIds = useSelector((state) => state.catalog.selectedRowIds);
    const searchTerm = useSelector((state) => state.catalog.searchTerm);
    const limitStart = useSelector((state) => state.catalog.tableLimitStart);
    const limitEnd = useSelector((state) => state.catalog.tableLimitEnd);

    const [hasShadow, setHasShadow] = useState(false);
    const containerRef = useRef(null);
    const controllerRef = useRef(null);

    const [tableData, setTableData] = useState([]);
    const [totalCount, setTotalCount] = useState();
    const [selectAllChecked, setSelectAllChecked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [networkError, setNetworkError] = useState(false);
    const [isNumBooksAscending, setIsNumBooksAscending] = useState(true); // State for sorting order


    const navigate = useNavigate(); // Initialize navigate

    useEffect(() => {
        setTableData('');
        dispatch(setSearchTerm(''));
    }, [activeTab]);

    useEffect(() => {

        const fetchData = async () => {
            // Clean up the previous fetch if it exists
            if (controllerRef.current) {
                console.log("Aborting previous fetch");
                controllerRef.current.abort();
            }

            // Initialize a new AbortController for the current fetch
            const controller = new AbortController();
            const signal = controller.signal;
            controllerRef.current = controller;

            setIsLoading(true);
            setNetworkError(false);
            setTableData('');

            if (!activeTab) return;

            try {
                let response, data, totalCount;
                if (searchTerm) {
                    const type = activeTab.toLowerCase();
                    response = await axiosUtils(
                        `/api/search?query=${searchTerm}&type=${type}&seriePageLimitStart=${limitStart}&seriePageLimitEnd=${limitEnd}&authorPageLimitStart=${limitStart}&authorPageLimitEnd=${limitEnd}&bookPageLimitStart=${limitStart}&bookPageLimitEnd=${limitEnd}`,
                        'GET',
                        {}, {}, {}, signal  // Pass signal here
                    );
                    data = response.data.results;
                    totalCount = response.data.totalBooksCount;
                } else {
                    if (activeTab === "Series") {
                        response = await axiosUtils(
                            `/api/getSeries?limitStart=${limitStart}&limitEnd=${limitEnd}`,
                            'GET',
                            {}, {}, {}, signal  // Pass signal here
                        );
                    } else if (activeTab === "Books") {
                        console.log('Calling books');
                        response = await axiosUtils(
                            `/api/getBooks?limitStart=${limitStart}&limitEnd=${limitEnd}`,
                            'GET',
                            {}, {}, {}, signal  // Pass signal here
                        );
                    } else if (activeTab === "Authors") {
                        console.log('Calling authors');
                        response = await axiosUtils(
                            `/api/getAuthors?limitStart=${limitStart}&limitEnd=${limitEnd}`,
                            'GET',
                            {}, {}, {}, signal  // Pass signal here
                        );
                    }
                    console.log('Authors response:', response);
                    data = response.data.data;
                    totalCount = response.data.totalCount;
                }

                setTableData(data);
                dispatch(setTableTotalItems(totalCount));
                setSelectAllChecked(false);
                dispatch(clearSelection());
                setIsLoading(false);
            } catch (error) {
                if (error.name === "AbortError") {
                    console.log("Fetch aborted successfully");
                } else {
                    console.error(`Error fetching ${activeTab.toLowerCase()}:`, error);
                    if (error.message === "Network Error" || error.response?.status === 500 || error.response?.status === 501) {
                        setNetworkError(true);
                    }
                }
            }
        };

        fetchData();

        // Clean up the fetch if activeTab or other dependencies change
        return () => {
            if (controllerRef.current) {
                console.log("Cleaning up and aborting fetch");
                controllerRef.current.abort();
            }
        };

    }, [activeTab, limitStart, limitEnd, searchTerm, dispatch]);

    useEffect(() => {

        if (!socket) {
            console.error("Socket is not initialized");
            return;
        }

        // Listen for series updates via socket
        socket.on('seriesUpdated', (updatedSeries) => {
            // console.log("Series updated via socket:", updatedSeries);
            setTableData((prevData) => {
                const updatedData = prevData.map((series) =>
                    series.id === updatedSeries.id ? updatedSeries : series
                );
                return updatedData;
            });
        });

        socket.on('booksUpdated', (updatedBooks) => {
            // console.log('Books updated via socket:', updatedBooks);
            setTableData((prevData) => {
                const updatedData = prevData.map((book) =>
                    book.id === updatedBooks.id ? updatedBooks : book
                );
                return updatedData;  // You must return the updatedData to update the state
            });
        });

        socket.on('authorsUpdated', (updatedAuthors) => {
            // console.log('Authors updated via socket:', updatedAuthors);
            setTableData((prevData) => {
                const updatedData = prevData.map((book) =>
                    book.id === updatedAuthors.id ? updatedAuthors : book
                );
                return updatedData;  // You must return the updatedData to update the state
            });
        });

        socket.on('dataDeleted', ({ ids, type }) => {
            // console.log('Data deleted via socket:', { ids, type });
            setTableData((prevData) => prevData.filter((item) => !ids.includes(item.id)));
        });

        // New event listener for authorAdded
        socket.on('authorAdded', (newAuthor) => {
            // console.log('New author added via socket:', newAuthor);
            setTableData((prevData) => [...prevData, newAuthor]);
        });

        // New event listener for serieAdded
        socket.on('serieAdded', (serieData) => {
            // console.log('New serie added via socket:', serieData);
            setTableData((prevData) => [...prevData, serieData]);
        });

        // New event listener for bookAdded
        socket.on('bookAdded', (bookData) => {
            // console.log('New book added via socket:', bookData);
            setTableData((prevData) => [...prevData, bookData]);
        });

        return () => {
            socket.off('seriesUpdated');
            socket.off('booksUpdated');
            socket.off('authorsUpdated');
            socket.off('authorAdded');
            socket.off('serieAdded');
            socket.off('bookAdded');
            socket.off('dataDeleted');
        };
    }, [socket]);

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
        // console.log(`Row ${rowId} clicked`);

        // Navigate based on the activeTab
        if (activeTab === "Series") {
            navigate(`series/${item.id}/${spacesToHyphens(item.serie_name)}`); // Navigate to SerieDetails
        } else if (activeTab === "Authors") {
            navigate(`authors/${item.id}/${spacesToHyphens(item.author_name)}`); // Navigate to AuthorDetails
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

    const handleSortByNumBooks = () => {
        const sortedData = sortByNumBooks(tableData, isNumBooksAscending);
        setTableData(sortedData);
        setIsNumBooksAscending(!isNumBooksAscending); // Toggle sorting order
    };

    const renderTableHeaders = () => {
        if (activeTab === "Series") {
            return (
                <>
                    <th className="px-4 py-2 text-slate-500">Series Name</th>
                    <th className="px-4 py-2 text-slate-500">Author</th>
                    <th className="px-4 py-2 text-slate-500">Number of Books</th>
                    <th className="px-4 py-2 text-slate-500">Genres</th>
                    <th className="px-4 py-2 text-slate-500">Amazon Link</th>
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
                    <th className="px-4 py-2 text-slate-500">Amazon Link</th>
                </>
            );
        } else if (activeTab === "Authors") {
            return (
                <>
                    <th className="px-4 py-2 text-slate-500">Author Name</th>
                    <th
                        className="px-4 py-2 text-slate-500 cursor-pointer"
                        onClick={handleSortByNumBooks} // Attach sorting function
                    >
                        Number of Books {isNumBooksAscending ? "↑" : "↓"} {/* Indicate sort direction */}
                    </th>
                    <th className="px-4 py-2 text-slate-500">Date of Birth</th>
                    <th className="px-4 py-2 text-slate-500">Nationality</th>
                    <th className="px-4 py-2 text-slate-500">Website</th>
                    <th className="px-4 py-2 text-slate-500">Search Count</th>
                </>
            );
        }
    };

    const renderTableRows = () => {
        if (tableData.length === 0 && !isLoading) {
            return (
                <tr>
                    <td colSpan={7} className="text-center py-4">
                        No results found for "{searchTerm}".
                    </td>
                </tr>
            );
        }

        if (isLoading) {
            return (
                <tr className="space-x-2">
                    <span className="black-loader"></span>
                    <td colSpan={7} className="text-center py-4">
                        No results found for "{searchTerm}".
                    </td>
                </tr>
            );
        }

        return tableData.map((item) => (
            <tr
                key={item.id} // Use unique item ID as key
                className={`${activeTab === "Series" && parseInt(item.currentBooks) < item.num_books ? "bg-orange-200 hover:bg-orange-100" : ""} cursor-pointer border-b border-slate-200 hover:bg-gray-100 ${selectedRowIds.includes(item.id) ? "bg-blue-100 hover:bg-blue-100" : ""}`}
                onClick={() => handleRowClick(item.id, item)} // Pass the item data
            >
                <td
                    className="px-4 py-2 text-center cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent row click event
                        dispatch(toggleRowSelection(item.id)); // Toggle the checkbox when clicking the td
                    }}
                >
                    <input
                        type="checkbox"
                        checked={selectedRowIds.includes(item.id)}
                        onChange={(e) => handleCheckboxClick(e, item.id)} // Handle checkbox click
                        onClick={(e) => e.stopPropagation()} // Prevent the click from bubbling to the row
                    />
                </td>
                {activeTab === "Series" && (
                    <>
                        <td className="px-4 py-2">{capitalize(item.serie_name)}</td>
                        <td className="px-4 py-2">{item.authors.map(author => capitalize(author.author_name)).join(', ')}</td>
                        <td className="px-4 py-2">{`${parseInt(item.currentBooks)}/${item.num_books}`}</td>
                        <td className="px-4 py-2 overflow-hidden whitespace-nowrap text-ellipsis">
                            {`${item.genres.substring(0, 15)}...`}
                        </td>
                        <td className="px-4 py-2">
                            <a href={item.amazon_link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                Link
                            </a>
                        </td>
                        <td className="px-4 py-2">{item.searchCount}</td>
                    </>
                )}
                {activeTab === "Books" && (
                    <>
                        <td className="px-4 py-2">{capitalize(item.book_name)}</td>
                        <td className="px-4 py-2">{item.serie_name}</td>
                        <td className="px-4 py-2">{item.authors.map(author => capitalize(author.author_name)).join(', ')}</td>
                        <td className="px-4 py-2">{item.publish_date}</td>
                        <td className="px-4 py-2">
                            <a href={item.amazon_link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                Link
                            </a>
                        </td>
                    </>
                )}
                {activeTab === "Authors" && (
                    <>
                        <td className="px-4 py-2">{capitalize(item.author_name)}</td>
                        <td className="px-4 py-2">{item.num_books}</td>
                        <td className="px-4 py-2">{item.dob}</td>
                        <td className="px-4 py-2">
                            {item.nationality}
                        </td>
                        <td className="px-4 py-2">
                            <a href={item.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                Website
                            </a>
                        </td>
                        <td className="px-4 py-2">{item.searchCount}</td>
                    </>
                )}
            </tr>
        ));
    };


    return (
        <div className="rounded-lg max-h-custom overflow-hidden custom-drop-shadow2">
            <TableHeader
                hasShadow={hasShadow}
                openEditAuthorModal={openEditAuthorModal}
                openEditBooksModal={openEditBooksModal}
                openEditSeriesModal={openEditSeriesModal}
            />
            <div ref={containerRef} className="overflow-auto max-h-custom1">
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
                    {isLoading ? (
                        !networkError ?
                            <tr className="">
                                <td colSpan={7} className="space-x-2 text-center py-4">
                                    <span className="black-loader"></span>
                                    <span className="mb-1">loading {activeTab}...</span>
                                </td>
                            </tr>
                            :
                            <tr className="space-x-2">
                                <td colSpan={7} className="text-center py-4">
                                    Error connecting to the server.
                                </td>
                            </tr>

                    ) :
                        renderTableRows()
                    }
                </table>
            </div>
        </div>
    );
}

export default Table;
