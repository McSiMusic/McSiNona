import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Nonogram, NonogramCell, NonogramState } from "./nonogram";

const initialState: NonogramState = {
    nonogram: { horizontal: [], vertical: [] },
    field: [],
};

export const nonogramSlice = createSlice({
    name: "nonogram",
    initialState,
    reducers: {
        initNonogram: (state, action: PayloadAction<Nonogram>) => {
            const { payload: nonogram } = action;
            state.nonogram = nonogram;
            state.field = new Array(nonogram.vertical.length).fill(
                new Array(nonogram.horizontal.length).fill("empty"),
            );
        },
        changeFieldCell: (
            state,
            action: PayloadAction<{ type: NonogramCell; x: number; y: number }>,
        ) => {
            const { type, x, y } = action.payload;
            const currentValue = state.field[x][y];
            if (!currentValue) {
                throw new Error("Can't retrieve value from field");
            }

            if (currentValue === type) state.field[x][y] = "empty";
            else state.field[x][y] = type;
        },
    },
    selectors: {
        getNonogram: (state) => state.nonogram,
        getField: (state) => state.field,
    },
});

export const { initNonogram, changeFieldCell } = nonogramSlice.actions;
export const { getNonogram, getField } = nonogramSlice.selectors;
