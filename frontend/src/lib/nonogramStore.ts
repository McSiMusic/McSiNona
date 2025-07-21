import { configureStore } from "@reduxjs/toolkit";
import { nonogramSlice } from "./nonogramSlice";

export const makeNonogramStore = () => {
    return configureStore({
        reducer: { nonogram: nonogramSlice.reducer },
    });
};

export type NonogramStore = ReturnType<typeof makeNonogramStore>;
export type NonogramState = ReturnType<NonogramStore["getState"]>;
export type NonogramDispatch = NonogramStore["dispatch"];
