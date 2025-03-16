"use client";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Example: fetching a single creator by wallet address
export const fetchCreatorByWallet = createAsyncThunk(
  "creator/fetchByWallet",
  async (walletAddress: string) => {
    if (!walletAddress) return null;
    const res = await fetch(`/api/creators/${walletAddress}`);
    if (!res.ok) {
      throw new Error("Failed to fetch creator by wallet");
    }
    const data = await res.json();
    return data;
  }
);

interface ICreatorState {
  creator: any; // or use a stronger type
  loading: boolean;
  error: string | null;
}

const initialState: ICreatorState = {
  creator: null,
  loading: false,
  error: null,
};

const creatorSlice = createSlice({
  name: "creator",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCreatorByWallet.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCreatorByWallet.fulfilled, (state, action) => {
      state.loading = false;
      state.creator = action.payload;
    });
    builder.addCase(fetchCreatorByWallet.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Error fetching creator.";
    });
  },
});

export default creatorSlice.reducer;
