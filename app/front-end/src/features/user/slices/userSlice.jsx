import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: 'user',
    initialState: {
        activeTab: null,
        activeGenre: null,
        pageLimitStart: null,
        pageLimitEnd: null,
        pageInterval: null,
        totalItemsFetched: null,
        isloading: true,
    },
    reducers: {
        setActiveTab: (state, action) => {
            state.activeTab = action.payload;
        },
        setActiveGenre: (state, action) => {
            state.activeGenre = action.payload;
        },
        setPageLimitStart: (state, action) => {
            state.pageLimitStart = action.payload;
        },
        setPageLimitEnd: (state, action) => {
            state.pageLimitEnd = action.payload;
        },
        setPageInterval: (state, action) => {
            state.pageInterval = action.payload;
        },
        setTotalItemsFetched: (state, action) => {
            state.totalItemsFetched = action.payload;
        },
        setIsloading: (state, action) => {
            state.isloading = action.payload;
        }
    },
});

export const { setActiveTab, setPageLimitStart, setPageLimitEnd, setPageInterval, setActiveGenre, setTotalItemsFetched, setIsloading } = userSlice.actions;
export default userSlice.reducer;