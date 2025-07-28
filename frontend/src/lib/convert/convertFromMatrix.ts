import { Nonogram } from "../nonogram";

export const convertFromMatrix = (matrix: (1 | 0)[][]): Nonogram => {
    const result: Nonogram = {
        vertical: matrix[0].map((_, col) =>
            convertLine(matrix.map((_, row) => matrix[row][col])),
        ),
        horizontal: matrix.map(convertLine),
    };

    return result;
};

const convertLine = (line: (1 | 0)[]) => {
    let acc = 0;
    return line.reduce<number[]>((result, curr, index) => {
        if (curr) {
            acc++;
        }

        if (!curr || index === line.length - 1) {
            if (acc) result.push(acc);
            acc = 0;
        }

        return result;
    }, []);
};
