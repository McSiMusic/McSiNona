import { Nonogram, NonogramCell, NonogramPointDefinition } from "../nonogram";
import { allTheSame } from "../utils/array/allTheSame";

type PossibleSolutions = {
    horizontal: NonogramCell[][][];
    vertical: NonogramCell[][][];
};

type FillCellFunc = (args: NonogramPointDefinition) => void;

export const solveNonogram = (
    nonogram: Nonogram,
    fillCell?: FillCellFunc,
): NonogramCell[][] => {
    const { horizontal, vertical } = nonogram;
    const hLength = horizontal.length;
    const vLength = vertical.length;

    let resultField: NonogramCell[][] = Array.from({ length: vLength }, () =>
        new Array(hLength).fill("empty"),
    );

    let possibleSolutions: PossibleSolutions = {
        horizontal: horizontal.map((lineNumbers) =>
            createPossibleSolutionsForLine(lineNumbers, vLength),
        ),
        vertical: vertical.map((lineNumbers) =>
            createPossibleSolutionsForLine(lineNumbers, hLength),
        ),
    };

    do {
        const { updatedField, wasUpdated } = updateField({
            field: resultField,
            possibleSolutions,
            fillCell,
        });

        if (!wasUpdated) {
            alert("There is no solution(");
            break;
        }

        resultField = updatedField;
        possibleSolutions = filterPossibleSolutions(
            possibleSolutions,
            resultField,
        );
    } while (!isSolved(resultField));

    return resultField;
};

export const isOnlyOneSolutionExists = (
    possibleSolutions: PossibleSolutions,
) => {
    const { horizontal, vertical } = possibleSolutions;
    return (
        horizontal.every(
            (horizontalSolutions) => horizontalSolutions.length === 1,
        ) &&
        vertical.every((verticalSolutions) => verticalSolutions.length === 1)
    );
};

export const isSolved = (field: NonogramCell[][]) => {
    return field.every((column) => column.every((cell) => cell !== "empty"));
};

export const updateField = ({
    field,
    possibleSolutions,
    fillCell,
}: {
    field: NonogramCell[][];
    possibleSolutions: PossibleSolutions;
    fillCell?: FillCellFunc;
}) => {
    const { vertical, horizontal } = possibleSolutions;
    const updatedField = [...field];
    let wasUpdated = false;

    for (let y = 0; y < horizontal.length; y++) {
        const possibleHSolutions = horizontal[y];
        const values =
            extractRightValuesFromPossibleSolutions(possibleHSolutions);

        for (let pointsIndex = 0; pointsIndex < values.length; pointsIndex++) {
            const { index: x, value } = values[pointsIndex];
            updatedField[x][y] = value;
            wasUpdated = true;
            fillCell?.({ point: { x, y }, value });
        }
    }

    for (let x = 0; x < vertical.length; x++) {
        const possibleVSolutions = vertical[x];
        const values =
            extractRightValuesFromPossibleSolutions(possibleVSolutions);

        for (let pointsIndex = 0; pointsIndex < values.length; pointsIndex++) {
            const { index: y, value } = values[pointsIndex];
            updatedField[x][y] = value;
            wasUpdated = true;
            fillCell?.({ point: { x, y }, value });
        }
    }

    return { wasUpdated, updatedField };
};

const extractRightValuesFromPossibleSolutions = (
    linePossibleSolutions: NonogramCell[][],
): { index: number; value: NonogramCell }[] => {
    const length = linePossibleSolutions[0]?.length ?? 0;
    const result: { index: number; value: NonogramCell }[] = [];

    for (let index = 0; index < length; index++) {
        const possibleValuesForCell = linePossibleSolutions.map(
            (solution) => solution[index],
        );

        if (allTheSame(possibleValuesForCell)) {
            result.push({ index, value: possibleValuesForCell[0]! });
        }
    }

    return result;
};

export const createPossibleSolutionsForLine = (
    lineNumbers: number[],
    size: number,
): NonogramCell[][] => {
    const maxOffset = getMaxOffset(lineNumbers, size);
    if (maxOffset < 0) throw new Error("Invalid nonogram");

    const offsetsArrays = generateOffsetsArrays(lineNumbers.length, maxOffset);

    return offsetsArrays.map((offsets) =>
        convertToFieldLineWithOffset(lineNumbers, offsets, size),
    );
};

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

export const getMaxOffset = (lineNumbers: number[], size: number) => {
    return (
        size -
        lineNumbers.reduce((result, current) => result + current, 0) -
        (lineNumbers.length - 1)
    );
};

export function generateOffsetsArrays(
    filledGroupsCount: number,
    availableSpacesCount: number,
): number[][] {
    const result: number[][] = [];

    function generate(current: number[], remainingSum: number) {
        if (current.length === filledGroupsCount) {
            if (remainingSum >= 0) {
                result.push([...current]);
            }
            return;
        }

        for (let num = 0; num <= remainingSum; num++) {
            current.push(num);
            generate(current, remainingSum - num);
            current.pop();
        }
    }

    generate([], availableSpacesCount);
    return result;
}

export const filterPossibleSolutions = (
    possibleSolutions: PossibleSolutions,
    field: NonogramCell[][],
) => {
    const { horizontal, vertical } = possibleSolutions;
    return {
        horizontal: horizontal.map((solutions, y) =>
            solutions.filter((solution) =>
                solution.every((solutionValue, x) => {
                    const fieldValue = field[x][y];
                    return (
                        fieldValue === "empty" || solutionValue === fieldValue
                    );
                }),
            ),
        ),
        vertical: vertical.map((solutions, x) =>
            solutions.filter((solution) =>
                solution.every((solutionValue, y) => {
                    const fieldValue = field[x][y];
                    return (
                        fieldValue === "empty" || solutionValue === fieldValue
                    );
                }),
            ),
        ),
    };
};
