import { Action, NonogramCell, NonogramState } from "./nonogram";

export const addAction = (
    history: NonogramState["history"],
    action: Action,
) => {
    const { position } = history;
    // if was redo
    if (isRedoEnabled(history)) {
        history.actions = history.actions.slice(0, position);
    }

    history.actions.push(action);
    history.position += 1;
};

export const isRedoEnabled = (history: NonogramState["history"]) => {
    return history.position !== history.actions.length;
};

export const isUndoEnabled = (history: NonogramState["history"]) => {
    return history.position !== 0;
};

export const undo = (
    history: NonogramState["history"],
    field: NonogramCell[][],
) => {
    if (!isUndoEnabled(history)) throw new Error("Undo is not enabled!");
    const cells = history.actions[history.position - 1].cells;
    cells.forEach((cell) => {
        const {
            before,
            point: { x, y },
        } = cell;
        field[x][y] = before;
    });

    history.position -= 1;
};

export const redo = (
    history: NonogramState["history"],
    field: NonogramCell[][],
) => {
    if (!isRedoEnabled(history)) throw new Error("Redo is not enabled!");
    history.position += 1;

    const cells = history.actions[history.position - 1].cells;
    cells.forEach((cell) => {
        const {
            after,
            point: { x, y },
        } = cell;
        field[x][y] = after;
    });
};
