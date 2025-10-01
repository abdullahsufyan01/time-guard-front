import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import attendanceReducer from './slices/attendanceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    attendance: attendanceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
