import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
    Action,
    Nonogram,
    NonogramCell,
    NonogramPointDefinition,
    NonogramState,
    Point,
} from "./nonogram";
import { isPointBelongsToLine } from "./helpers/isPointBelongsToLine";
import {
    addAction,
    isRedoEnabled,
    isUndoEnabled,
    redo as redoHelper,
    undo as undoHelper,
} from "./historyHelper";
import { fillEmptyLines, validateChanges } from "./validateHelper";
import { WritableDraft } from "immer";

const initialState: NonogramState = {
    nonogram: { horizontal: [], vertical: [] },
    field: [],
    mode: "normal",
    history: {
        actions: [],
        position: 0,
    },
    errorLines: {
        vertical: [],
        horizontal: [],
    },
    isSolved: false,
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
            state.history = initialState.history;
            state.errorLines = initialState.errorLines;
            fillEmptyLines({ nonogram: state.nonogram, field: state.field });
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
            if (state.isSolved) return;
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
            if (state.isSolved) return;
            state.mode = "normal";

            if (state.temporaryLine) {
                const { start, type, end } = state.temporaryLine;
                const historyAction: Action = {
                    cells: [],
                    type: "change",
                };

                if (!end) {
                    historyAction.cells.push({
                        point: start,
                        before: state.field[start.x][start.y],
                        after: type,
                    });

                    state.field[start.x][start.y] = type;
                } else {
                    if (start.x === end.x) {
                        const minY = Math.min(start.y, end.y);
                        const maxY = Math.max(start.y, end.y);

                        for (let y = minY; y <= maxY; y++) {
                            historyAction.cells.push({
                                point: { x: start.x, y },
                                before: state.field[start.x][y],
                                after: type,
                            });
                            state.field[start.x][y] = type;
                        }
                    } else {
                        const minX = Math.min(start.x, end.x);
                        const maxX = Math.max(start.x, end.x);

                        for (let x = minX; x <= maxX; x++) {
                            historyAction.cells.push({
                                point: { x, y: start.y },
                                before: state.field[x][start.y],
                                after: type,
                            });
                            state.field[x][start.y] = type;
                        }
                    }
                }

                addAction(state.history, historyAction);
                const { isSolved } = validateChanges({
                    changedPoints: historyAction.cells.map(
                        (cell) => cell.point,
                    ),
                    errors: state.errorLines,
                    field: state.field,
                    nonogram: state.nonogram,
                });
                state.temporaryLine = undefined;
                state.isSolved = isSolved;
            }
        },
        fillCells: (
            state,
            action: PayloadAction<NonogramPointDefinition[]>,
        ) => {
            if (state.isSolved) return;
            state.mode = "line";

            action.payload.forEach(({ point, value }) => {
                const { x, y } = point;
                state.field[x][y] = value;
            });
        },
        setField: (state, action: PayloadAction<NonogramState["field"]>) => {
            if (state.isSolved) return;
            state.field = action.payload;
        },
        undo: (state) => {
            if (state.isSolved) return;
            const changedCells = undoHelper(state.history, state.field);

            validateChanges({
                changedPoints: changedCells.map((cell) => cell.point),
                errors: state.errorLines,
                field: state.field,
                nonogram: state.nonogram,
            });
        },
        redo: (state) => {
            if (state.isSolved) return;
            const changedCells = redoHelper(state.history, state.field);

            validateChanges({
                changedPoints: changedCells.map((cell) => cell.point),
                errors: state.errorLines,
                field: state.field,
                nonogram: state.nonogram,
            });
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
                (state: NonogramState) => state.errorLines,
                (state: NonogramState) => state.temporaryLine,
                (state: NonogramState) => state.field,
                (_: NonogramState, point: Point) => point,
            ],
            (mode, errorLines, temporaryLine, field, point) => {
                const isError =
                    errorLines.horizontal.includes(point.y) ||
                    errorLines.vertical.includes(point.x);
                if (
                    mode === "line" &&
                    temporaryLine &&
                    isPointBelongsToLine(point, temporaryLine)
                ) {
                    return { type: temporaryLine.type, isTemporary: true };
                }

                return {
                    type: field[point.x][point.y],
                    isTemporary: false,
                    isError,
                };
            },
        ),
        canUndo: (state) => !state.isSolved && isUndoEnabled(state.history),
        canRedo: (state) => !state.isSolved && isRedoEnabled(state.history),
        isSolved: (state) => state.isSolved,
    },
});

export const {
    initNonogram,
    calculateTemporaryLine,
    startLineMode,
    finishLineMode,
    fillCells,
    setField,
    undo,
    redo,
} = nonogramSlice.actions;

export const {
    getNonogram,
    getField,
    getMaxVerticalCount,
    getMaxHorizontalCount,
    getMode,
    getCellValue,
    canRedo,
    canUndo,
    isSolved,
} = nonogramSlice.selectors;
