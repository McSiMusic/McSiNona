import { Nonogram, NonogramCell, NonogramPointDefinition } from "../nonogram";

type FillCellsFunc = (args: NonogramPointDefinition[]) => void;
type LineMeta = {
    solved: boolean;
    values: number[];
    type: "vertical" | "horizontal";
    index: number;
    lineSize: number;
    possibleSolutions?: number;
};

export const solveNonogramAlternative = (
    nonogram: Nonogram,
    fillCells?: FillCellsFunc,
): { sucess: true; nonogram: NonogramCell[][] } | { sucess: false } => {
    console.time("nonogram");
    const { horizontal, vertical } = nonogram;
    const hLength = horizontal.length;
    const vLength = vertical.length;

    const resultField: NonogramCell[][] = Array.from({ length: vLength }, () =>
        new Array(hLength).fill("empty"),
    );

    let lines = getLines(nonogram);
    edgeOptimizedSolution({ allLines: lines, field: resultField, fillCells });

    do {
        const { wasUpdated } = updateField({
            field: resultField,
            fillCells,
            lines,
            optimized: true,
        });

        if (!wasUpdated) {
            const { wasUpdated } = updateField({
                field: resultField,
                fillCells,
                lines,
                optimized: false,
            });

            if (!wasUpdated) return { sucess: false };
        }

        lines = sortLines(lines);
    } while (!isSolved(resultField));

    console.timeEnd("nonogram");
    return { sucess: true, nonogram: resultField };
};

// Let's try to solve border, it can't be a boost for most nonograms
const edgeOptimizedSolution = ({
    allLines,
    field,
    fillCells,
}: {
    allLines: LineMeta[];
    field: NonogramCell[][];
    fillCells?: FillCellsFunc;
}) => {
    const firstHorizontal = allLines.find(
        (line) => line.index === 0 && line.type === "horizontal",
    )!;
    const firstVertical = allLines.find(
        (line) => line.index === 0 && line.type === "vertical",
    )!;
    const lastHorizontal = allLines.find(
        (line) =>
            line.index === line.lineSize - 1 && line.type === "horizontal",
    )!;
    const lastVertical = allLines.find(
        (line) => line.index === line.lineSize - 1 && line.type === "vertical",
    )!;

    const edgeLines = [
        firstHorizontal,
        firstVertical,
        lastHorizontal,
        lastVertical,
    ];

    const { wasUpdated } = updateField({
        field,
        lines: edgeLines,
        optimized: true,
        fillCells,
    });

    if (wasUpdated) {
        let nonogramDefitions: NonogramPointDefinition[] = [];
        const convertToFieldCoordinate = (line: LineMeta, index: number) => ({
            x: line.type === "horizontal" ? index : line.index,
            y: line.type === "horizontal" ? line.index : index,
        });
        const fillFieldCoordinates = (line: LineMeta, index: number) => {
            const point = convertToFieldCoordinate(line, index);
            const { x, y } = point;
            field[x][y] = "filled";

            nonogramDefitions.push({ point, value: "filled" });
        };

        const getFieldValue = (line: LineMeta, index: number) => {
            const { x, y } = convertToFieldCoordinate(line, index);
            return field[x][y];
        };

        allLines.forEach((line) => {
            if (line.solved) return;

            nonogramDefitions = [];

            const firstGroupValue = line.values[0];
            if (
                getFieldValue(line, 0) === "filled" &&
                firstGroupValue &&
                firstGroupValue > 1
            ) {
                for (let i = 1; i < firstGroupValue; i++) {
                    fillFieldCoordinates(line, i);
                }
            }

            const lastIndex = line.lineSize - 1;
            const lastGroupValue = line.values[lastIndex];
            if (
                getFieldValue(line, lastIndex) === "filled" &&
                lastGroupValue &&
                lastGroupValue > 1
            ) {
                for (let i = 1; i < firstGroupValue; i++) {
                    fillFieldCoordinates(line, lastIndex - i);
                }
            }

            fillCells?.(nonogramDefitions);
        });
    }
};

export const isSolved = (field: NonogramCell[][]) => {
    return field.every((column) => column.every((cell) => cell !== "empty"));
};

export const updateField = ({
    field,
    lines,
    fillCells,
    optimized,
}: {
    field: NonogramCell[][];
    lines: LineMeta[];
    fillCells?: FillCellsFunc;
    optimized: boolean;
}): { wasUpdated: boolean } => {
    let wasUpdated = false;

    const filteredLines = lines.filter(({ solved }) => !solved);

    filteredLines.forEach((line) => {
        const { type, values, index, lineSize } = line;
        const isHorizontal = type === "horizontal";

        const result = getPossibleLineValues({
            lineNumbers: values,
            size: lineSize,
            currentState: isHorizontal
                ? field.map((row) => row[index])
                : field[index],
            optimized,
        });

        if (!result) return;

        const { possibleSolutionsCount, possibleValues } = result;

        line.possibleSolutions = possibleSolutionsCount;

        if (!possibleValues) {
            return;
        }

        if (
            possibleValues.every(
                (cell) => cell !== "conflict" && cell !== "empty",
            )
        ) {
            line.solved = true;
        }

        const solvedPoints: NonogramPointDefinition[] = possibleValues
            .map((value, possibleLineIndex) => ({
                value,
                point: {
                    x: isHorizontal ? possibleLineIndex : index,
                    y: isHorizontal ? index : possibleLineIndex,
                },
            }))
            .filter(
                ({ value }) => value === "cross" || value === "filled",
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
    optimized,
}: {
    lineNumbers: number[];
    size: number;
    currentState: NonogramCell[];
    optimized: boolean;
}) => {
    const possibleValues: (NonogramCell | "conflict" | "solved")[] =
        currentState.map((cell) => (cell === "empty" ? "empty" : "solved"));

    const possibleSolutions = generateSolutionsLazy(
        lineNumbers,
        size,
        currentState,
        optimized,
    );

    let possibleSolutionsCount = 0;
    for (const solution of possibleSolutions) {
        if (
            solution.some(
                (cellValue, i) =>
                    currentState[i] !== "empty" &&
                    cellValue !== currentState[i],
            )
        ) {
            continue;
        }

        possibleSolutionsCount++;

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
    }

    return {
        possibleValues,
        possibleSolutionsCount,
    };
};

export function* generateSolutionsLazy(
    lineNumbers: number[],
    size: number,
    currentState: NonogramCell[],
    optimized: boolean,
) {
    if (lineNumbers.length === 0) {
        yield new Array(size).fill("cross");
        return;
    }

    const maxOffset = getMaxOffset(lineNumbers, size);
    if (maxOffset < 0) throw new Error("Invalid nonogram");

    if (optimized && maxOffset > size / 2) return;

    for (const offsets of generateOffsetsArraysLazy({
        availableSpacesCount: maxOffset,
        currentState,
        filledGroupsCount: lineNumbers.length,
        lineNumbers,
    })) {
        const solution = convertToFieldLineWithOffset(
            lineNumbers,
            offsets,
            size,
        );
        if (solution) {
            yield solution;
        }
    }
}

export const convertToFieldLineWithOffset = (
    lineNumbers: number[],
    offsets: number[],
    size: number,
): NonogramCell[] => {
    const result: NonogramCell[] = [];

    for (let i = 0; i < lineNumbers.length; i++) {
        const value = lineNumbers[i];

        const currentOffset = offsets[i];

        if (currentOffset) {
            result.push(...new Array(currentOffset).fill("cross"));
        }

        result.push(...new Array(value).fill("filled"));

        if (i !== lineNumbers.length - 1) {
            result.push("cross");
        }
    }

    const resultLength = result.length;
    if (resultLength === size) return result;
    else return [...result, ...new Array(size - resultLength).fill("cross")];
};

export function* generateOffsetsArraysLazy({
    availableSpacesCount,
    currentState,
    filledGroupsCount,
    lineNumbers,
}: {
    filledGroupsCount: number;
    availableSpacesCount: number;
    currentState: NonogramCell[];
    lineNumbers: number[];
}): Generator<number[]> {
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
            if (
                checkIfCanInsertBlock({
                    offsetsArrays: current,
                    lineNumbers,
                    currentState,
                })
            ) {
                yield* generate(current, remainingSum - num);
            }
            current.pop();
        }
    }

    yield* generate([], availableSpacesCount);
}

export function checkIfCanInsertBlock({
    offsetsArrays,
    currentState,
    lineNumbers,
}: {
    offsetsArrays: number[];
    currentState: NonogramCell[];
    lineNumbers: number[];
}) {
    // Last offset index
    const index = offsetsArrays.length - 1;

    // Last offset
    const offset = offsetsArrays[index];

    const previousOffsets = offsetsArrays.slice(0, -1);

    // Sum of previous offsets including gaps
    const offsetSum = arraySum(previousOffsets) + previousOffsets.length;

    //Check if we can fill offset
    const firstOffsetIndex = offsetSum + arraySum(lineNumbers.slice(0, index));
    const lastOffsetIndex = firstOffsetIndex + offset;

    for (let i = firstOffsetIndex; i < lastOffsetIndex; i++) {
        if (currentState[i] === "filled") return false;
    }

    //Check if we can fill line
    const lastBlockIndex = lastOffsetIndex + lineNumbers[index];

    for (let i = lastOffsetIndex; i < lastBlockIndex; i++) {
        if (currentState[i] === "cross") return false;
    }

    return true;
}

const arraySum = (array: number[]) =>
    array.reduce((result, value) => result + value, 0);

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

    return sortLines([...horizontalLines, ...verticalLines]);
};

const getLineMaxOffset = (line: LineMeta) => {
    const { values, lineSize } = line;
    return getMaxOffset(values, lineSize);
};

const sortLines = (lines: LineMeta[]) => {
    return lines.sort((line1, line2) => {
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

        const { possibleSolutions: line1Solutions } = line1;
        const { possibleSolutions: line2Solutions } = line2;
        if (line1Solutions && line2Solutions) {
            return line1Solutions - line2Solutions;
        }

        return getLineMaxOffset(line1) - getLineMaxOffset(line2);
    });
};
