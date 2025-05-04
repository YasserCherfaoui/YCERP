
import { Company } from '@/models/data/company.model';
import { Franchise } from '@/models/data/franchise.model';
import { User } from '@/models/data/user.model';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface UserState {
  isAuthenticated: boolean;
  user?: User;
  franchise?: Franchise,
  company?: Company
}

const initialState: UserState = {
  isAuthenticated: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.franchise = action.payload.franchise;
      state.company = action.payload.company;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = undefined;
      state.franchise = undefined;
      state.company = undefined;
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;