import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
    Nonogram,
    NonogramCell,
    NonogramPointDefinition,
    NonogramState,
    Point,
} from "./nonogram";
import { isPointBelongsToLine } from "./helpers/isPointBelongsToLine";

const initialState: NonogramState = {
    nonogram: { horizontal: [], vertical: [] },
    field: [],
    mode: "normal",
};

export const nonogramSlice = createSlice({
    name: "nonogram",
    initialState,
    reducers: {
        initNonogram: (state, action: PayloadAction<Nonogram>) => {
            const { payload: nonogram } = action;
            state.nonogram = nonogram;
            state.field = Array.from({ length: nonogram.vertical.length }, () =>
                new Array(nonogram.horizontal.length).fill("empty"),
            );
        },
        changeFieldCell: (
            state,
            action: PayloadAction<{ type: NonogramCell; point: Point }>,
        ) => {
            const {
                type,
                point: { x, y },
            } = action.payload;
            const currentValue = state.field[x][y];
            if (!currentValue) {
                throw new Error("Can't retrieve value from field");
            }

            if (currentValue === type) state.field[x][y] = "empty";
            else state.field[x][y] = type;
        },
        calculateTemporaryLine: (state, action: PayloadAction<Point>) => {
            if (!state.temporaryLine)
                throw new Error(
                    "temporaryLine must be defined when call calculateTemporaryLine",
                );

            const end = action.payload;
            const { start, type } = state.temporaryLine;

            if (Math.abs(end.x - start.x) >= Math.abs(end.y - start.y)) {
                // X-axis projection (y = 0)
                state.temporaryLine = {
                    start,
                    end: { x: end.x, y: start.y },
                    type,
                };
            } else {
                // Y-axis projection (x = 0)
                state.temporaryLine = {
                    start,
                    end: { x: start.x, y: end.y },
                    type,
                };
            }
        },
        startLineMode: (
            state,
            action: PayloadAction<{ start: Point; type: NonogramCell }>,
        ) => {
            state.mode = "line";

            const { type, start } = action.payload;

            const { x, y } = start;
            const currentValue = state.field[x][y];
            if (!currentValue) {
                throw new Error("Can't retrieve value from field");
            }

            state.temporaryLine = {
                start,
                type: currentValue === type ? "empty" : type,
            };
        },
        finishLineMode: (state) => {
            state.mode = "normal";

            if (state.temporaryLine) {
                const { start, type, end } = state.temporaryLine;

                if (!end) {
                    state.field[start.x][start.y] = type;
                } else {
                    if (start.x === end.x) {
                        const minY = Math.min(start.y, end.y);
                        const maxY = Math.max(start.y, end.y);

                        for (let y = minY; y <= maxY; y++) {
                            state.field[start.x][y] = type;
                        }
                    } else {
                        const minX = Math.min(start.x, end.x);
                        const maxX = Math.max(start.x, end.x);

                        for (let x = minX; x <= maxX; x++) {
                            state.field[x][start.y] = type;
                        }
                    }
                }

                state.temporaryLine = undefined;
            }
        },
        fillCells: (
            state,
            action: PayloadAction<NonogramPointDefinition[]>,
        ) => {
            state.mode = "line";

            action.payload.forEach(({ point, value }) => {
                const { x, y } = point;
                state.field[x][y] = value;
            });
        },
        setField: (state, action: PayloadAction<NonogramState["field"]>) => {
            state.field = action.payload;
        },
    },
    selectors: {
        getNonogram: (state) => state.nonogram,
        getField: (state) => state.field,
        getMode: (state) => state.mode,
        getMaxVerticalCount: (state) =>
            Math.max(...state.nonogram.vertical.map((set) => set.length)),
        getMaxHorizontalCount: (state) =>
            Math.max(...state.nonogram.horizontal.map((set) => set.length)),
        getCellValue: createSelector(
            [
                (state: NonogramState) => state.mode,
                (state: NonogramState) => state.temporaryLine,
                (state: NonogramState) => state.field,
                (_: NonogramState, point: Point) => point,
            ],
            (mode, temporaryLine, field, point) => {
                if (
                    mode === "line" &&
                    temporaryLine &&
                    isPointBelongsToLine(point, temporaryLine)
                ) {
                    return { type: temporaryLine.type, isTemporary: true };
                }

                return { type: field[point.x][point.y], isTemporary: false };
            },
        ),
    },
});

export const {
    initNonogram,
    changeFieldCell,
    calculateTemporaryLine,
    startLineMode,
    finishLineMode,
    fillCells,
    setField,
} = nonogramSlice.actions;

export const {
    getNonogram,
    getField,
    getMaxVerticalCount,
    getMaxHorizontalCount,
    getMode,
    getCellValue,
} = nonogramSlice.selectors;
