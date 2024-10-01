// src/store/catalogSlice.js
import { createSlice } from "@reduxjs/toolkit";

const catalogSlice = createSlice({
  name: "catalog",
  initialState: {
    activeTab: '',
    selectedRowIds: [], // State for selected row IDs
    bookId: null,
    serieId: null,
    collectionId: null,
    serie: null,
    collection: null,
    serieBookCount: null,
    collectionBookCount: null,
    author: null,
    authors: [],
    tableLimitStart: 0,
    tableLimitEnd: 50,
    tableTotalItems: null,
    searchTerm: '',
  },
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
      state.selectedRowIds = []; // Reset selected rows when active tab changes
    },
    toggleRowSelection: (state, action) => {
      const id = action.payload;
      if (state.selectedRowIds.includes(id)) {
        state.selectedRowIds = state.selectedRowIds.filter((rowId) => rowId !== id);
      } else {
        state.selectedRowIds.push(id);
      }
    },
    clearSelection: (state) => {
      state.selectedRowIds = [];
    },
    selectAllRows: (state, action) => {
      state.selectedRowIds = action.payload; // Set all row IDs as selected
    },
    setBookId: (state, action) => {
      state.bookId = action.payload; // Set the currently edited book ID
    },
    setSerieId: (state, action) => {
      state.serieId = action.payload; // Set the currently edited book ID
    },
    setCollectionId: (state, action) => {
      state.collectionId = action.payload; // Set the currently edited book ID
    },
    setSerie: (state, action) => {
      state.serie = action.payload;
    },
    setCollection: (state, action) => {
      state.collection = action.payload;
    },
    setAuthor: (state, action) => {
      state.author = action.payload;
    },
    setAuthors: (state, action) => {
      state.authors = action.payload;
    },
    setSerieBookCount: (state, action) => {
      state.serieBookCount = action.payload;
    },
    setCollectionBookCount: (state, action) => {
      state.collectionBookCount = action.payload;
    },
    setTableLimitStart: (state, action) => {
      state.tableLimitStart = action.payload;
    },
    setTableLimitEnd: (state, action) => {
      state.tableLimitEnd = action.payload;
    },
    setTableTotalItems: (state, action) => {
      state.tableTotalItems = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    }
  },
});

export const { setActiveTab, toggleRowSelection, clearSelection, selectAllRows, setBookId, setSerie, setAuthor, setAuthors, setTableLimitStart, setTableLimitEnd, setTableTotalItems, setSearchTerm, setSerieId, setCollectionId, setCollection, setSerieBookCount, setCollectionBookCount } = catalogSlice.actions;
export default catalogSlice.reducer;
