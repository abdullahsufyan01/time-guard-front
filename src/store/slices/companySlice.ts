import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Company {
  id: string;
  name: string;
  code: string;
  companyId: string;
  industry: string;
  country: string;
  employeesCountRange: string;
  logoBase64?: string;
  primaryColor: string;
  timeZone: string;
  dateFormat: string;
  timeFormat: string;
  lengthFormat: string;
  plan: string;
  seats: number;
  isActive: boolean;
  branches: Branch[];
  createdAt: string;
}

export interface Branch {
  id: string;
  name: string;
  managerId?: string;
  companyId: string;
}

interface CompanyState {
  companies: Company[];
  currentCompany: Company | null;
  loading: boolean;
  error: string | null;
}

const initialState: CompanyState = {
  companies: [],
  currentCompany: null,
  loading: false,
  error: null,
};

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    setCompanies: (state, action: PayloadAction<Company[]>) => {
      state.companies = action.payload;
      state.loading = false;
    },
    setCurrentCompany: (state, action: PayloadAction<Company | null>) => {
      state.currentCompany = action.payload;
      // Save to localStorage
      if (action.payload) {
        localStorage.setItem('currentCompanyId', action.payload.id);
      } else {
        localStorage.removeItem('currentCompanyId');
      }
    },
    addCompany: (state, action: PayloadAction<Company>) => {
      state.companies.push(action.payload);
      // Persist to localStorage
      localStorage.setItem('companies', JSON.stringify(state.companies));
    },
    updateCompany: (state, action: PayloadAction<Company>) => {
      const index = state.companies.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.companies[index] = action.payload;
      }
      if (state.currentCompany?.id === action.payload.id) {
        state.currentCompany = action.payload;
      }
      localStorage.setItem('companies', JSON.stringify(state.companies));
    },
    deleteCompany: (state, action: PayloadAction<string>) => {
      state.companies = state.companies.filter((c) => c.id !== action.payload);
      localStorage.setItem('companies', JSON.stringify(state.companies));
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    loadFromStorage: (state) => {
      const companiesData = localStorage.getItem('companies');
      const currentCompanyId = localStorage.getItem('currentCompanyId');
      
      if (companiesData) {
        state.companies = JSON.parse(companiesData);
      }
      
      if (currentCompanyId && state.companies.length > 0) {
        state.currentCompany = state.companies.find((c) => c.id === currentCompanyId) || null;
      }
    },
  },
});

export const {
  setCompanies,
  setCurrentCompany,
  addCompany,
  updateCompany,
  deleteCompany,
  setLoading,
  setError,
  loadFromStorage,
} = companySlice.actions;

export default companySlice.reducer;
