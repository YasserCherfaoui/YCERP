// src/app/store.ts
import affiliateSlice from '@/features/auth/affiliate-slice';
import authReducer from '@/features/auth/auth-slice';
import deliverySlice from '@/features/auth/delivery-slice';
import franchiseSlice from '@/features/auth/franchise-slice';
import userSlice from '@/features/auth/user-slice';
import companySlice from '@/features/company/company-slice';
import { Action, ThunkAction, configureStore } from '@reduxjs/toolkit';
// Import other reducers if you have them

export const store = configureStore({
  reducer: {
    auth: authReducer,
    company: companySlice,
    franchise: franchiseSlice,
    user: userSlice,
    delivery: deliverySlice,
    affiliate: affiliateSlice,
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