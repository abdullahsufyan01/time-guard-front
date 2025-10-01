import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'employee' | 'manager' | 'admin';
  kioskNumber: string;
  active: boolean;
  avatarUrl?: string;
  branch: string;
  managerId?: string;
}

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
}

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<{ data: User[]; meta: { page: number; total: number; limit: number } }>) => {
      state.users = action.payload.data;
      state.total = action.payload.meta.total;
      state.page = action.payload.meta.page;
      state.limit = action.payload.meta.limit;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setUsers, setLoading, setError } = usersSlice.actions;
export default usersSlice.reducer;
