import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { db } from '../firebase';
import { collection, getDocs, onSnapshot, updateDoc, doc, query, orderBy } from 'firebase/firestore';

export const fetchTimeEntries = createAsyncThunk('timeEntries/fetch', async (_, thunkAPI) => {
  try {
    const snap = await getDocs(collection(db, 'timeentries'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    return thunkAPI.rejectWithValue(e?.message || 'Failed to load time entries');
  }
});

// Subscribe to timeentries with real-time updates
export const subscribeTimeEntries = createAsyncThunk(
  'timeEntries/subscribe',
  async (_, thunkAPI) => {
    try {
      const unsubscribe = onSnapshot(query(collection(db, 'timeentries'), orderBy('startTime', 'desc')), async (snapshot) => {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        thunkAPI.dispatch(timeEntriesSlice.actions.setItems(items));
        // Auto-compute and persist duration when both startTime and endTime exist but duration missing
        const updates = [];
        for (const d of snapshot.docs) {
          const data = d.data();
          const hasStart = !!data.startTime;
          const hasEnd = !!data.endTime;
          const hasDuration = data.duration !== undefined && data.duration !== null;
          if (hasStart && hasEnd && !hasDuration) {
            const startMs = typeof data.startTime === 'string' ? Date.parse(data.startTime) : (data.startTime?.toMillis?.() || 0);
            const endMs = typeof data.endTime === 'string' ? Date.parse(data.endTime) : (data.endTime?.toMillis?.() || 0);
            if (startMs && endMs && endMs >= startMs) {
              const minutes = Math.round((endMs - startMs) / 60000);
              updates.push(updateDoc(doc(db, 'timeentries', d.id), { duration: minutes }));
            }
          }
        }
        if (updates.length) {
          await Promise.allSettled(updates);
        }
      });
      return unsubscribe; // note: not serializable, but we don't store in state
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.message || 'Failed to subscribe time entries');
    }
  }
);

const timeEntriesSlice = createSlice({
  name: 'timeEntries',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    setItems(state, action) {
      state.items = action.payload || [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTimeEntries.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTimeEntries.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchTimeEntries.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Error'; });
  }
});

export const selectTimeEntries = (state) => state.timeEntries.items;
export default timeEntriesSlice.reducer;


