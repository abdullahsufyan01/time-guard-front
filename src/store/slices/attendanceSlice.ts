import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Attendance {
  id: string;
  userId: string;
  date: string;
  clockIn: string;
  clockOut: string;
  durationHours: number;
  locationIn: {
    lat: number;
    lng: number;
    label: string;
  };
  locationOut?: {
    lat: number;
    lng: number;
    label: string;
  };
  notes?: string;
  status: 'present' | 'absent' | 'late' | 'on_leave';
}

interface AttendanceState {
  records: Attendance[];
  loading: boolean;
  error: string | null;
  total: number;
  filters: {
    from: string;
    to: string;
    branch: string;
    preset: string;
  };
}

const initialState: AttendanceState = {
  records: [],
  loading: false,
  error: null,
  total: 0,
  filters: {
    from: '',
    to: '',
    branch: '',
    preset: 'this_month',
  },
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setRecords: (state, action: PayloadAction<{ data: Attendance[]; meta: { total: number } }>) => {
      state.records = action.payload.data;
      state.total = action.payload.meta.total;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setFilters: (state, action: PayloadAction<Partial<AttendanceState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
});

export const { setRecords, setLoading, setError, setFilters } = attendanceSlice.actions;
export default attendanceSlice.reducer;
