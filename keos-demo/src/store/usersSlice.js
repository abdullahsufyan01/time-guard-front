import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export const fetchUsers = createAsyncThunk('users/fetch', async (_, thunkAPI) => {
  try {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    return thunkAPI.rejectWithValue(e?.message || 'Failed to load users');
  }
});

const usersSlice = createSlice({
  name: 'users',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchUsers.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchUsers.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Error'; });
  }
});

export const selectUsers = (state) => state.users.items;
export default usersSlice.reducer;


