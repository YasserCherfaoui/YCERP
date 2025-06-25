import { Affiliate } from "@/models/data/affiliate/affiliate.model";
import { RegisterAffiliateSchema } from "@/schemas/affiliate";
import * as affiliateService from "@/services/affiliate-service";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AffiliateAuthState {
  affiliate: Affiliate | null;
  token: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AffiliateAuthState = {
  affiliate: null,
  token: localStorage.getItem("affiliate_token"),
  status: "idle",
  error: null,
};

export const loginAffiliate = createAsyncThunk(
  "affiliate/login",
  async (credentials: any, { rejectWithValue }) => {
    try {
      const response = await affiliateService.login(credentials);
      // Assuming the response has a data property with token and affiliate
      if (response.data) {
        const { token, affiliate } = response.data;
        localStorage.setItem("affiliate_token", token);
        return { token, affiliate };
      }
      return rejectWithValue("Invalid response from server");
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerAffiliate = createAsyncThunk(
  "affiliate/register",
  async (data: RegisterAffiliateSchema, { rejectWithValue }) => {
    try {
      const response = await affiliateService.registerAffiliate(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
)

const affiliateSlice = createSlice({
  name: "affiliate",
  initialState,
  reducers: {
    logoutAffiliate: (state) => {
      state.affiliate = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
      localStorage.removeItem("affiliate_token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAffiliate.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        loginAffiliate.fulfilled,
        (state, action: PayloadAction<{ token: string; affiliate: Affiliate }>) => {
          state.status = "succeeded";
          state.token = action.payload.token;
          state.affiliate = action.payload.affiliate;
        }
      )
      .addCase(loginAffiliate.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(registerAffiliate.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerAffiliate.fulfilled, (state) => {
        state.status = "succeeded";
        // We don't log the user in, just indicate success.
        // The user can now go to the login page.
      })
      .addCase(registerAffiliate.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { logoutAffiliate } = affiliateSlice.actions;

export default affiliateSlice.reducer; 