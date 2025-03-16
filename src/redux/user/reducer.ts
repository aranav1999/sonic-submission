"use client";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// We call /api/users (POST) to create/fetch user by walletAddress
export const initUser = createAsyncThunk(
  "user/initUser",
  async (walletAddress: string) => {
    if (!walletAddress) return null;
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress }),
    });
    if (!res.ok) {
      throw new Error("Failed to create/fetch user");
    }
    const { user } = await res.json();
    return user;
  }
);

interface IUserState {
  data: any; // or more specific: { username?: string; walletAddress?: string; ... }
  loading: boolean;
  error: string | null;
}

const initialState: IUserState = {
  data: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(initUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(initUser.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
    });
    builder.addCase(initUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Error initializing user.";
    });
  },
});

export default userSlice.reducer;
