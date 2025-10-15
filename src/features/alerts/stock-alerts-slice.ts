import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface StockAlertsState {
  unreadCount: number;
  activeAlertsCount: number;
}

const initialState: StockAlertsState = {
  unreadCount: 0,
  activeAlertsCount: 0,
};

export const stockAlertsSlice = createSlice({
  name: 'stockAlerts',
  initialState,
  reducers: {
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    setActiveAlertsCount: (state, action: PayloadAction<number>) => {
      state.activeAlertsCount = action.payload;
    },
    decrementUnreadCount: (state) => {
      if (state.unreadCount > 0) {
        state.unreadCount -= 1;
      }
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
  },
});

export const {
  setUnreadCount,
  setActiveAlertsCount,
  decrementUnreadCount,
  incrementUnreadCount,
} = stockAlertsSlice.actions;

export default stockAlertsSlice.reducer;

