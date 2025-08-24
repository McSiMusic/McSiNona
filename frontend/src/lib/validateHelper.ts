import { Nonogram, NonogramCell, NonogramState, Point } from "./nonogram";
import { hasSolutions } from "./solver/alternativeSolver";

export const validateChanges = ({
    field,
    changedPoints,
    errors,
    nonogram,
}: {
    field: NonogramCell[][];
    changedPoints: Point[];
    errors: NonogramState["errorLines"];
    nonogram: Nonogram;
}): { isSolved: boolean } => {
    const verticalIndexes = new Set<number>();
    const horizontalIndexes = new Set<number>();

    changedPoints.forEach(({ x, y }) => {
        verticalIndexes.add(x);
        horizontalIndexes.add(y);
    });

    const { horizontal, vertical } = nonogram;

    const checkLine = (index: number, isHorizontal: boolean) => {
        const alreadyHasError = (
            isHorizontal ? errors.horizontal : errors.vertical
        ).includes(index);

        const currentLine = isHorizontal
            ? field.map((row) => row[index])
            : field[index];

        const lineNumbers = isHorizontal ? horizontal[index] : vertical[index];

        const isError = !hasSolutions({
            currentLine,
            lineNumbers,
            isHorizontal,
            nonogram,
        });

        if (isError && !alreadyHasError) {
            (isHorizontal ? errors.horizontal : errors.vertical).push(index);
        }

        if (!isError && alreadyHasError) {
            if (isHorizontal) {
                errors.horizontal = errors.horizontal.filter(
                    (errIndex) => errIndex !== index,
                );
            } else {
                errors.vertical = errors.vertical.filter(
                    (errIndex) => errIndex !== index,
                );
            }
        }

        validateSolvedLines({
            field,
            isHorizontal,
            line: currentLine,
            lineIndex: index,
            lineNumbers,
        });
    };

    verticalIndexes.forEach((index) => checkLine(index, false));
    horizontalIndexes.forEach((index) => checkLine(index, true));

    if (errors.horizontal.length === 0 && errors.vertical.length === 0) {
        return { isSolved: isSolved({ field, nonogram }) };
    }

    return {
        isSolved: false,
    };
};

const validateSolvedLines = ({
    field,
    isHorizontal,
    line,
    lineNumbers,
    lineIndex,
}: {
    lineNumbers: number[];
    line: NonogramCell[];
    field: NonogramCell[][];
    isHorizontal: boolean;
    lineIndex: number;
}) => {
    if (isMatchToGroup(lineNumbers, line)) {
        line.forEach((cell, index) => {
            if (cell === "empty") {
                const { x, y } = convertToFieldCoordinate(
                    index,
                    lineIndex,
                    isHorizontal,
                );
                // TODO: History!
                field[x][y] = "cross";
            }
        });
    }
};

const convertToFieldCoordinate = (
    index: number,
    lineIndex: number,
    isHorizontal: boolean,
) => ({
    x: isHorizontal ? index : lineIndex,
    y: isHorizontal ? lineIndex : index,
});

const isMatchToGroup = (lineNumbers: number[], line: NonogramCell[]) => {
    let currentFilledGroupCount = 0;
    let currentGroupIndex = 0;

    for (let i = 0; i < line.length; i++) {
        const cell = line[i];
        if (cell === "filled") {
            currentFilledGroupCount++;
        }

        if (
            (cell !== "filled" || i === line.length - 1) &&
            currentFilledGroupCount
        ) {
            if (currentFilledGroupCount === lineNumbers[currentGroupIndex]) {
                currentFilledGroupCount = 0;
                currentGroupIndex++;
                continue;
            }

            return false;
        }
    }

    return currentGroupIndex === lineNumbers.length;
};

export const isSolved = ({
    field,
    nonogram,
}: {
    nonogram: Nonogram;
    field: NonogramCell[][];
}) => {
    const { vertical, horizontal } = nonogram;
    const lines = [
        ...vertical.map((line, lineIndex) => ({
            line,
            isHorizontal: false,
            lineIndex,
        })),
        ...horizontal.map((line, lineIndex) => ({
            line,
            isHorizontal: true,
            lineIndex,
        })),
    ];

    for (let i = 0; i < lines.length; i++) {
        const { isHorizontal, line, lineIndex } = lines[i];
        const currentLine = isHorizontal
            ? field.map((row) => row[lineIndex])
            : field[lineIndex];

        if (!isMatchToGroup(line, currentLine)) return false;
    }

    return true;
};

export const fillEmptyLines = ({
    nonogram,
    field,
}: {
    nonogram: Nonogram;
    field: NonogramCell[][];
}) => {
    const { vertical, horizontal } = nonogram;
    const lines = [
        ...vertical.map((line, lineIndex) => ({
            line,
            isHorizontal: false,
            lineIndex,
        })),
        ...horizontal.map((line, lineIndex) => ({
            line,
            isHorizontal: true,
            lineIndex,
        })),
    ];

    lines.forEach(({ isHorizontal, line, lineIndex }) => {
        if (!line.length) {
            for (
                let i = 0;
                i < (isHorizontal ? vertical.length : horizontal.length);
                i++
            ) {
                const { x, y } = convertToFieldCoordinate(
                    i,
                    lineIndex,
                    isHorizontal,
                );
                field[x][y] = "cross";
            }
        }
    });
};
