
import { FranchiseAdministrator } from '@/models/data/administrator.model';
import { Franchise } from '@/models/data/franchise.model';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface FranchiseState {
  isAuthenticated: boolean;
  user?: FranchiseAdministrator;
  franchise?: Franchise
}

const initialState: FranchiseState = {
  isAuthenticated: false,
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
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = undefined;
      state.franchise = undefined;
    },
  },
});

export const { login, logout } = franchiseSlice.actions;
export default franchiseSlice.reducer;