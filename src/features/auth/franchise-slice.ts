
import { FranchiseAdministrator } from '@/models/data/administrator.model';
import { Franchise } from '@/models/data/franchise.model';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface FranchiseState {
  isAuthenticated: boolean;
  user?: FranchiseAdministrator;
  franchise?: Franchise
  isAdministrator: boolean;
}

const initialState: FranchiseState = {
  isAuthenticated: false,
  isAdministrator: false,
};

export const franchiseSlice = createSlice({
  name: 'franchise',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<FranchiseAdministrator>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.franchise = action.payload.franchise;
    },
    loginAdministrator: (state, action: PayloadAction<FranchiseAdministrator>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.franchise = action.payload.franchise;
      state.isAdministrator = true;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = undefined;
      state.franchise = undefined;
      state.isAdministrator = false;
    },
  },
});

export const { login, loginAdministrator, logout } = franchiseSlice.actions;
export default franchiseSlice.reducer;