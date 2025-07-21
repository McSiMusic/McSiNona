export type Nonogram = {
    vertical: number[][];
    horizontal: number[][];
};

export type NonogramCell = "empty" | "filled" | "cross";

export type NonogramState = {
    /* Digits on the sides */
    nonogram: Nonogram;
    /* Current field */
    field: NonogramCell[][];
    /* Temporary line (using when creating line), can be only horizontal or vertical */
    temporaryLine?: {
        start: Point;
        end?: Point;
        type: NonogramCell;
    };
    /* Current mode, normal = when Idle, line - when draw a line */
    mode: "normal" | "line";
};

export type Point = {
    x: number;
    y: number;
};
