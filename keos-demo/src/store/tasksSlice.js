import { createAsyncThunk, createSlice, createSelector } from '@reduxjs/toolkit';
import { db } from '../firebase';
import { syncTaskToTimeEntries } from '../services/TaskStatusHandler';
import {
  collection, getDocs, addDoc, doc, updateDoc, serverTimestamp, query, where, getDocs as getDocsFs, getDoc, onSnapshot
} from 'firebase/firestore';

// Fetch all tasks with optional filters
export const fetchTasks = createAsyncThunk('tasks/fetch', async (_, thunkAPI) => {
  try {
    const snap = await getDocs(collection(db, 'tasks'));
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return data;
  } catch (e) {
    return thunkAPI.rejectWithValue(e?.message || 'Failed to load tasks');
  }
});

// Create recurring tasks for multiple buildings
export const createRecurringTasks = createAsyncThunk(
  'tasks/createRecurring',
  async ({ name, description, frequency, buildingIds, employeeIds, startDate, status }, thunkAPI) => {
    try {
      const tasksCollection = collection(db, 'tasks');
      const created = [];
      for (const buildingId of buildingIds) {
        const docData = {
          titel: name,
          beschreibung: description,
          frequenz: frequency, // daily | weekly | monthly
          gebaeudeId: buildingId,
          zugewiesenUserIds: employeeIds || [],
          startDatum: startDate,
          status: status || 'offen',
          erstelltAm: serverTimestamp(),
          istWiederkehrend: true,
        };
        const docRef = await addDoc(tasksCollection, docData);
        created.push({ id: docRef.id, ...docData });
      }
      return created;
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.message || 'Failed to create tasks');
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  'tasks/updateStatus',
  async ({ id, status }, thunkAPI) => {
    try {
      const ref = doc(db, 'tasks', id);
      const payload = { status };
      if (status === 'erledigt') {
        const nowIso = new Date().toISOString();
        payload.beendet = nowIso;
        payload.endTime = nowIso;
        payload.erledigtZeitstempel = serverTimestamp();
      }
      await updateDoc(ref, payload);

      // If task is completed, close any active time entries for this task
      if (status === 'erledigt') {
        const timeentriesRef = collection(db, 'timeentries');
        const q = query(timeentriesRef, where('taskId', '==', id), where('endTime', '==', null));
        const snap = await getDocsFs(q);
        const nowIso = new Date().toISOString();
        const updates = [];
        snap.forEach((d) => {
          const data = d.data();
          const startMs = typeof data.startTime === 'string' ? Date.parse(data.startTime) : (data.startTime?.toMillis?.() || 0);
          const endMs = Date.parse(nowIso);
          const minutes = startMs && endMs && endMs >= startMs ? Math.round((endMs - startMs) / 60000) : 0;
          updates.push(updateDoc(doc(db, 'timeentries', d.id), { endTime: nowIso, duration: minutes }));
        });
        if (updates.length) {
          await Promise.allSettled(updates);
        }
      }
      // Sync to timeentries collection per new behavior using the full task document
      try {
        const latest = await getDoc(ref);
        if (latest.exists()) {
          const fullTask = { id, ...latest.data() };
          await syncTaskToTimeEntries(fullTask);
        }
      } catch (_) {}
      return { id, changes: payload };
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.message || 'Failed to update status');
    }
  }
);

// Subscribe to tasks and keep timeentries in sync for completed/uncompleted
export const subscribeTasksSync = createAsyncThunk(
  'tasks/subscribeSync',
  async (_, thunkAPI) => {
    try {
      const unsubscribe = onSnapshot(collection(db, 'tasks'), async (snapshot) => {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        thunkAPI.dispatch(tasksSlice.actions.setItems(items));
        // Also sync timeentries for changed docs
        const changes = snapshot.docChanges();
        for (const change of changes) {
          const data = { id: change.doc.id, ...change.doc.data() };
          try { await syncTaskToTimeEntries(data); } catch (_) {}
        }
      });
      return unsubscribe;
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.message || 'Failed to subscribe task sync');
    }
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    setItems(state, action) {
      state.items = action.payload || [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error';
      })
      .addCase(createRecurringTasks.fulfilled, (state, action) => {
        state.items = [...action.payload, ...state.items];
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const { id, changes } = action.payload;
        const idx = state.items.findIndex(t => t.id === id);
        if (idx !== -1) state.items[idx] = { ...state.items[idx], ...changes };
      });
  }
});

export const selectTasks = (state) => state.tasks.items;
export const selectTasksBy = (filters) => createSelector([
  selectTasks
], (tasks) => {
  return tasks.filter(t => {
    if (filters?.buildingId && t.gebaeudeId !== filters.buildingId) return false;
    if (filters?.frequency && t.frequenz !== filters.frequency) return false;
    if (filters?.status && t.status !== filters.status) return false;
    return true;
  });
});

export default tasksSlice.reducer;


