import { current } from "@reduxjs/toolkit";
import { Nonogram, NonogramCell, NonogramPointDefinition } from "../nonogram";

type FillCelslFunc = (args: NonogramPointDefinition[]) => void;
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
    fillCells?: FillCelslFunc,
): { sucess: true; nonogram: NonogramCell[][] } | { sucess: false } => {
    console.time("nonogram");
    const { horizontal, vertical } = nonogram;
    const hLength = horizontal.length;
    const vLength = vertical.length;

    const resultField: NonogramCell[][] = Array.from({ length: vLength }, () =>
        new Array(hLength).fill("empty"),
    );

    let lines = getLines(nonogram);

    do {
        console.log(JSON.stringify(lines));
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
    fillCells?: FillCelslFunc;
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
            //fillCells?.(solvedPoints);

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

    console.log(lineNumbers);
    console.log(currentState);

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
