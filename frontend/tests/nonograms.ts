import { Nonogram } from "../src/lib/nonogram";

export const nonogram15x15: Nonogram = {
    vertical: [
        [2],
        [3],
        [6],
        [6],
        [8],
        [10],
        [11],
        [12],
        [11],
        [10],
        [8],
        [6],
        [1, 1],
        [4],
        [],
    ],
    horizontal: [
        [],
        [1],
        [3],
        [5],
        [3, 7],
        [12],
        [13],
        [10, 1],
        [10, 1],
        [12],
        [9],
        [7],
        [5],
        [],
        [],
    ],
};

export const nonogram3x3: Nonogram = {
    vertical: [[1, 1], [1], [1, 1]],
    horizontal: [[1, 1], [1], [1, 1]],
};
