// src/app/store.ts
import stockAlertsSlice from '@/features/alerts/stock-alerts-slice';
import affiliateSlice from '@/features/auth/affiliate-slice';
import authReducer from '@/features/auth/auth-slice';
import deliverySlice from '@/features/auth/delivery-slice';
import franchiseSlice from '@/features/auth/franchise-slice';
import userSlice from '@/features/auth/user-slice';
import advertisingSlice from '@/features/charges/advertising-slice';
import boxingSlice from '@/features/charges/boxing-slice';
import chargesSlice from '@/features/charges/charges-slice';
import exchangeRatesSlice from '@/features/charges/exchange-rates-slice';
import rentUtilitySlice from '@/features/charges/rent-utility-slice';
import returnsSlice from '@/features/charges/returns-slice';
import salarySlice from '@/features/charges/salary-slice';
import shippingSlice from '@/features/charges/shipping-slice';
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
    charges: chargesSlice,
    exchangeRates: exchangeRatesSlice,
    returns: returnsSlice,
    salary: salarySlice,
    shipping: shippingSlice,
    boxing: boxingSlice,
    advertising: advertisingSlice,
    rentUtility: rentUtilitySlice,
    stockAlerts: stockAlertsSlice,
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