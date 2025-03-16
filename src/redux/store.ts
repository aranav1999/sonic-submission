"use client";

import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user/reducer";
import creatorReducer from "./creator/reducer";

export const store = configureStore({
  reducer: {
    user: userReducer,
    creator: creatorReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
