import { Nonogram, NonogramCell, NonogramPointDefinition } from "../nonogram";

type FillCelslFunc = (args: NonogramPointDefinition[]) => void;
type LineMeta = {
    solved: boolean;
    values: number[];
    type: "vertical" | "horizontal";
    index: number;
    lineSize: number;
};
type NonogramWithMeta = {
    vertical: LineMeta[];
    horizontal: LineMeta[];
};

export const solveNonogramAlternative = (
    nonogram: Nonogram,
    fillCells?: FillCelslFunc,
): { sucess: true; nonogram: NonogramCell[][] } | { sucess: false } => {
    const { horizontal, vertical } = nonogram;
    const hLength = horizontal.length;
    const vLength = vertical.length;

    const resultField: NonogramCell[][] = Array.from({ length: vLength }, () =>
        new Array(hLength).fill("empty"),
    );

    const lines = getLines(nonogram);

    do {
        const { wasUpdated } = updateField({
            field: resultField,
            fillCells,
            lines,
        });

        if (!wasUpdated) {
            return { sucess: false };
        }
    } while (!isSolved(resultField));

    return { sucess: true, nonogram: resultField };
};

export const isSolved = (field: NonogramCell[][]) => {
    return field.every((column) => column.every((cell) => cell !== "empty"));
};

export const updateField = ({
    field,
    lines,
    fillCells,
}: {
    field: NonogramCell[][];
    lines: LineMeta[];
    fillCells?: FillCelslFunc;
}): { wasUpdated: boolean } => {
    let wasUpdated = false;

    lines.forEach((line) => {
        const { solved, type, values, index, lineSize } = line;
        const isHorizontal = type === "horizontal";

        if (solved) return;

        const possibleLineValues = getPossibleLineValues({
            lineNumbers: values,
            size: lineSize,
            currentState: isHorizontal
                ? field.map((row) => row[index])
                : field[index],
        });

        if (possibleLineValues.every((cell) => cell !== "conflict")) {
            line.solved = true;
        }

        const solvedPoints: NonogramPointDefinition[] = possibleLineValues
            .map((value, possibleLineIndex) => ({
                value,
                point: {
                    x: isHorizontal ? possibleLineIndex : index,
                    y: isHorizontal ? index : possibleLineIndex,
                },
            }))
            .filter(
                ({ value }) => value !== "conflict" && value !== "solved",
            ) as NonogramPointDefinition[];

        if (solvedPoints.length) {
            fillCells?.(solvedPoints);

            solvedPoints.forEach(({ point: { x, y }, value }) => {
                field[x][y] = value;
            });

            wasUpdated = true;
        }
    });

    return { wasUpdated };
};

export const getPossibleLineValues = ({
    lineNumbers,
    size,
    currentState,
}: {
    lineNumbers: number[];
    size: number;
    currentState: NonogramCell[];
}) => {
    const possibleValues: (NonogramCell | "conflict" | "solved")[] =
        currentState.map((cell) => (cell === "empty" ? "empty" : "solved"));

    const possibleSolutions = generateSolutionsLazy(lineNumbers, size);

    possibleSolutions.forEach((solution) => {
        if (
            solution.some(
                (cellValue, i) =>
                    currentState[i] !== "empty" &&
                    cellValue !== currentState[i],
            )
        )
            return;

        solution.forEach((cellValue, i) => {
            const currentPossibleValue = possibleValues[i];
            if (
                currentPossibleValue === "conflict" ||
                currentPossibleValue === "solved"
            )
                return;

            if (currentPossibleValue === "empty") {
                possibleValues[i] = cellValue;
            } else if (possibleValues[i] !== cellValue) {
                possibleValues[i] = "conflict";
            }
        });
    });

    return possibleValues;
};

export function generateSolutionsLazy(lineNumbers: number[], size: number) {
    const maxOffset = getMaxOffset(lineNumbers, size);
    if (maxOffset < 0) throw new Error("Invalid nonogram");

    return generateOffsetsArraysLazy(lineNumbers.length, maxOffset).map(
        (offsets) => convertToFieldLineWithOffset(lineNumbers, offsets, size),
    );
}

export const convertToFieldLineWithOffset = (
    lineNumbers: number[],
    offsets: number[],
    size: number,
): NonogramCell[] => {
    const result: NonogramCell[] = [];

    lineNumbers.forEach((value, index) => {
        const currentOffset = offsets[index];

        if (currentOffset)
            result.push(...new Array(currentOffset).fill("cross"));

        result.push(...new Array(value).fill("filled"));

        if (index !== lineNumbers.length - 1) result.push("cross");
    });

    const resultLength = result.length;
    if (resultLength === size) return result;
    else return [...result, ...new Array(size - resultLength).fill("cross")];
};

export function* generateOffsetsArraysLazy(
    filledGroupsCount: number,
    availableSpacesCount: number,
): Generator<number[]> {
    function* generate(
        current: number[],
        remainingSum: number,
    ): Generator<number[]> {
        if (current.length === filledGroupsCount) {
            if (remainingSum >= 0) yield [...current];
            return;
        }
        for (let num = 0; num <= remainingSum; num++) {
            current.push(num);
            yield* generate(current, remainingSum - num);
            current.pop();
        }
    }

    yield* generate([], availableSpacesCount);
}

export const getMaxOffset = (lineNumbers: number[], size: number) => {
    return (
        size -
        lineNumbers.reduce((result, current) => result + current, 0) -
        (lineNumbers.length - 1)
    );
};

const getLines = (nonogram: Nonogram): LineMeta[] => {
    const { horizontal, vertical } = nonogram;
    const horizontalLines: LineMeta[] = horizontal.map((values, index) => ({
        values,
        solved: false,
        type: "horizontal",
        index,
        lineSize: vertical.length,
    }));

    const verticalLines: LineMeta[] = vertical.map((values, index) => ({
        values,
        solved: false,
        type: "vertical",
        index,
        lineSize: horizontal.length,
    }));

    return [...horizontalLines, ...verticalLines].sort((line1, line2) => {
        const ifFirstEmpty = line1.values.length === 0;
        const ifSecondEmpty = line2.values.length === 0;

        if (ifFirstEmpty && !ifSecondEmpty) {
            return -1;
        }

        if (ifFirstEmpty && ifSecondEmpty) {
            return 0;
        }

        if (!ifFirstEmpty && ifSecondEmpty) {
            return 1;
        }

        return getLineMaxOffset(line1) - getLineMaxOffset(line2);
    });
};

const getLineMaxOffset = (line: LineMeta) => {
    const { values, lineSize } = line;
    return getMaxOffset(values, lineSize);
};
