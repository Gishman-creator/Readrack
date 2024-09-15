import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axiosUtils from "../../../../utils/axiosUtils";
import { capitalize, formatDate, spacesToHyphens } from "../../../../utils/stringUtils";
import TableHeader from "./TableHeader";
import { toggleRowSelection, selectAllRows, clearSelection, setTableTotalItems } from "../../slices/catalogSlice";
import { useSocket } from "../../../../context/SocketContext";
import toast from "react-hot-toast";
import NetworkErrorPage from "../../../../pages/NetworkErrorPage";

function Table({ openEditAuthorModal, openEditBooksModal, openEditSeriesModal, openEditCollectionsModal }) {

    const socket = useSocket();
    const dispatch = useDispatch();
    const activeTab = useSelector((state) => state.catalog.activeTab);
    const selectedRowIds = useSelector((state) => state.catalog.selectedRowIds);
    const searchTerm = useSelector((state) => state.catalog.searchTerm);
    const limitStart = useSelector((state) => state.catalog.tableLimitStart);
    const limitEnd = useSelector((state) => state.catalog.tableLimitEnd);

    const [hasShadow, setHasShadow] = useState(false);
    const containerRef = useRef(null);

    const [tableData, setTableData] = useState([]);
    const [totalCount, setTotalCount] = useState();
    const [selectAllChecked, setSelectAllChecked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [networkError, setNetworkError] = useState(false);


    const navigate = useNavigate(); // Initialize navigate

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            if (!activeTab) return;
            try {
                let response, data, totalCount;
                if (searchTerm) {
                    const type = activeTab.toLowerCase();
                    // console.log('The search type is:', type);
                    const response = await axiosUtils(`/api/search?query=${searchTerm}&type=${type}&seriePageLimitStart=${limitStart}&seriePageLimitEnd=${limitEnd}&authorPageLimitStart=${limitStart}&authorPageLimitEnd=${limitEnd}&bookPageLimitStart=${limitStart}&bookPageLimitEnd=${limitEnd}`, 'GET');
                    data = response.data.results;
                    totalCount = response.data.totalBooksCount;
                } else if (!searchTerm) {
                    if (activeTab === "Series") {
                        // console.log('Getting series');
                        response = await axiosUtils(`/api/getSeries?limitStart=${limitStart}&limitEnd=${limitEnd}`, 'GET');
                    } else if (activeTab === "Collections") {
                        // console.log('Getting collections');
                        response = await axiosUtils(`/api/getCollections?limitStart=${limitStart}&limitEnd=${limitEnd}`, 'GET');
                    } else if (activeTab === "Books") {
                        // console.log('Getting books');
                        response = await axiosUtils(`/api/getBooks?limitStart=${limitStart}&limitEnd=${limitEnd}`, 'GET');
                    } else if (activeTab === "Authors") {
                        // console.log('Getting authors');
                        response = await axiosUtils(`/api/getAuthors?limitStart=${limitStart}&limitEnd=${limitEnd}`, 'GET');
                    }
                    data = response.data.data;
                    totalCount = response.data.totalCount;
                }
                // console.log('Total data fetched:', data);
                setTableData(data);
                dispatch(setTableTotalItems(totalCount));
                // console.log('Total count of data:', totalCount)
                setSelectAllChecked(false); // Reset select all checkbox
                dispatch(clearSelection()); // Clear selections when data changes
                setIsLoading(false);
            } catch (error) {
                console.error(`Error fetching ${activeTab.toLowerCase()}:`, error);
                if (error.message === "Network Error" || error.response.status === 500) {
                    setNetworkError(true);
                }
            }
        };

        fetchData();

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

        // Listen for collections updates via socket
        socket.on('collectionsUpdated', (updatedCollections) => {
            // console.log("Collections updated via socket:", updatedCollections);
            setTableData((prevData) => {
                const updatedData = prevData.map((collections) =>
                    collections.id === updatedCollections.id ? updatedCollections : collections
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

        // New event listener for collectionAdded
        socket.on('collectionAdded', (collectionData) => {
            // console.log('New collection added via socket:', collectionData);
            setTableData((prevData) => [...prevData, collectionData]);
        });

        // New event listener for bookAdded
        socket.on('bookAdded', (bookData) => {
            // console.log('New book added via socket:', bookData);
            setTableData((prevData) => [...prevData, bookData]);
        });

        return () => {
            socket.off('seriesUpdated');
            socket.off('collectionsUpdated');
            socket.off('booksUpdated');
            socket.off('authorsUpdated');
            socket.off('authorAdded');
            socket.off('serieAdded');
            socket.off('collectionAdded');
            socket.off('bookAdded');
            socket.off('dataDeleted');
        };

    }, [activeTab, limitStart, limitEnd, searchTerm, dispatch, socket]);

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
            navigate(`series/${item.id}/${spacesToHyphens(item.serieName)}`); // Navigate to SerieDetails
        } else if (activeTab === "Collections") {
            navigate(`collections/${item.id}/${spacesToHyphens(item.collectionName)}`); // Navigate to AuthorDetails
        } else if (activeTab === "Authors") {
            navigate(`authors/${item.id}/${spacesToHyphens(item.authorName)}`); // Navigate to AuthorDetails
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
        } else if (activeTab === "Collections") {
            return (
                <>
                    <th className="px-4 py-2 text-slate-500">Collections Name</th>
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
                className={`cursor-pointer border-b border-slate-200 hover:bg-gray-100 ${selectedRowIds.includes(item.id) ? "bg-blue-100 hover:bg-blue-100" : ""}`}
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
                        <td className="px-4 py-2">{capitalize(item.serieName)}</td>
                        <td className="px-4 py-2">{item.nickname ? item.nickname : item.author_name}</td>
                        <td className="px-4 py-2">{item.numBooks}</td>
                        <td className="px-4 py-2 overflow-hidden whitespace-nowrap text-ellipsis">
                            {`${item.genres.substring(0, 15)}...`}
                        </td>
                        <td className="px-4 py-2">
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                Link
                            </a>
                        </td>
                        <td className="px-4 py-2">{item.searchCount}</td>
                    </>
                )}
                {activeTab === "Collections" && (
                    <>
                        <td className="px-4 py-2">{capitalize(item.collectionName)}</td>
                        <td className="px-4 py-2">{item.nickname ? item.nickname : item.author_name}</td>
                        <td className="px-4 py-2">{item.numBooks}</td>
                        <td className="px-4 py-2 overflow-hidden whitespace-nowrap text-ellipsis">
                            {`${item.genres.substring(0, 15)}...`}
                        </td>
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
                        <td className="px-4 py-2">{capitalize(item.bookName)}</td>
                        <td className="px-4 py-2">{item.serie_name ? item.serie_name : item.collection_name}</td>
                        <td className="px-4 py-2">{item.nickname ? item.nickname : item.author_name}</td>
                        <td className="px-4 py-2">{formatDate(item.publishDate)}</td>
                        <td className="px-4 py-2">
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                Link
                            </a>
                        </td>
                    </>
                )}
                {activeTab === "Authors" && (
                    <>
                        <td className="px-4 py-2">{item.nickname ? capitalize(item.nickname) : capitalize(item.authorName)}</td>
                        <td className="px-4 py-2">{item.numBooks}</td>
                        <td className="px-4 py-2">{formatDate(item.dob)}</td>
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

    if (networkError) {
        return <NetworkErrorPage />
    }


    return (
        <div className="rounded-lg max-h-custom overflow-hidden custom-drop-shadow2">
            <TableHeader
                hasShadow={hasShadow}
                openEditAuthorModal={openEditAuthorModal}
                openEditBooksModal={openEditBooksModal}
                openEditSeriesModal={openEditSeriesModal}
                openEditCollectionsModal={openEditCollectionsModal}
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
                        <tr className="">
                            <td colSpan={7} className="space-x-2 text-center py-4">
                                <span className="black-loader"></span>
                                <span className="mb-1">loading {activeTab}...</span>
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
