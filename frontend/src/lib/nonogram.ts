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
    history: {
        actions: Action[];
        position: number;
    };
};

export type Action = {
    type: "change";
    cells: {
        point: Point;
        before: NonogramCell;
        after: NonogramCell;
    }[];
};

export type Point = {
    x: number;
    y: number;
};

export type NonogramPointDefinition = {
    point: Point;
    value: NonogramCell;
};

export type NonogramMeta = {
    nonogram: Nonogram;
    name: string;
    id: string;
    width: number;
    height: number;
    category: Category;
};

export const categories = [
    "hero",
    "icon",
    "cartoon",
    "pattern",
    "nature",
    "games",
    "animals",
    "space",
    "other",
] as const;

export type Category = (typeof categories)[number];
