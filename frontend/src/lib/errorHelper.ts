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
}) => {
    const verticalIndexes = new Set<number>();
    const horizontalIndexes = new Set<number>();

    changedPoints.forEach(({ x, y }) => {
        verticalIndexes.add(x);
        horizontalIndexes.add(y);
    });

    const checkLine = (index: number, isHorizontal: boolean) => {
        const alreadyHasError = (
            isHorizontal ? errors.horizontal : errors.vertical
        ).includes(index);
        const isError = !hasSolutions({
            field,
            index,
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
    };

    verticalIndexes.forEach((index) => checkLine(index, false));
    horizontalIndexes.forEach((index) => checkLine(index, true));
};
