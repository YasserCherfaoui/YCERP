

import { DeliveryEmployee } from '@/models/data/delivery.model';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface DeliveryState {
  isAuthenticated: boolean;
  delivery_employee?: DeliveryEmployee;

}

const initialState: DeliveryState = {
  isAuthenticated: false,
};

export const deliverySlice = createSlice({
  name: 'delivery',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<DeliveryEmployee>) => {
      state.isAuthenticated = true;
      state.delivery_employee = action.payload;

    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.delivery_employee = undefined;
    },
  },
});

export const { login, logout } = deliverySlice.actions;
export default deliverySlice.reducer;