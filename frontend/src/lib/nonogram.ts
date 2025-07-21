export type Nonogram = {
    vertical: number[][];
    horizontal: number[][];
};

export type NonogramCell = "empty" | "filled" | "cross";

export type NonogramState = {
    /* Цифры сверху и сниху */
    nonogram: Nonogram;
    /* Заполненое поле */
    field: NonogramCell[][];
};
