// src/store/catalogSlice.js
import { createSlice } from "@reduxjs/toolkit";

const catalogSlice = createSlice({
  name: "catalog",
  initialState: {
    activeTab: "Series",
    selectedRowIds: [], // State for selected row IDs
    bookId: null, // Store the ID of the book being edited
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
  },
});

export const { setActiveTab, toggleRowSelection, clearSelection, selectAllRows, setBookId } = catalogSlice.actions;
export default catalogSlice.reducer;
