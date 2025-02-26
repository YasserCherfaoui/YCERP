// src/app/store.ts
import authReducer from '@/features/auth/auth-slice';
import franchiseSlice from '@/features/auth/franchise-slice';
import companySlice from '@/features/company/company-slice';
import { Action, ThunkAction, configureStore } from '@reduxjs/toolkit';
// Import other reducers if you have them

export const store = configureStore({
  reducer: {
    auth: authReducer,
    company: companySlice,
    franchise: franchiseSlice,
    // Add other reducers here
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;