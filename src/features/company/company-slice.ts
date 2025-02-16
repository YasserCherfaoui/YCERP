import { Company } from "@/models/data/company.model";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface CompanyState {
    isComapnySelected: boolean;
    companyID?: number;
    company?: Company
}

const initialState: CompanyState = {
    isComapnySelected: false,
}

export const companyReducer = createSlice(
    {
        name: "company",
        initialState,
        reducers: {
            setCompany: (state, action: PayloadAction<Company>) => {
                state.isComapnySelected = true;
                state.companyID = action.payload.ID;
                state.company = action.payload;

            },
            unSetCompany: (state) => {
                state.isComapnySelected = false;
                state.companyID = undefined;
                state.company = undefined;
            }

        }
    }
)

export const { setCompany, unSetCompany } = companyReducer.actions;
export default companyReducer.reducer;
