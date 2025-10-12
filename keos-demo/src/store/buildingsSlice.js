import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export const fetchBuildings = createAsyncThunk('buildings/fetch', async (_, thunkAPI) => {
  try {
    const snap = await getDocs(collection(db, 'gebaeude'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    return thunkAPI.rejectWithValue(e?.message || 'Failed to load buildings');
  }
});

const buildingsSlice = createSlice({
  name: 'buildings',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBuildings.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchBuildings.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchBuildings.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Error'; });
  }
});

export const selectBuildings = (state) => state.buildings.items;
export default buildingsSlice.reducer;


