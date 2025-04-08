import { configureStore } from '@reduxjs/toolkit';
import { courseApi } from '../features/api/courseApi';
import { authApi } from '@/features/api/authApi';
import authReducer from "@/features/slices/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [courseApi.reducerPath]: courseApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(courseApi.middleware, authApi.middleware),
});