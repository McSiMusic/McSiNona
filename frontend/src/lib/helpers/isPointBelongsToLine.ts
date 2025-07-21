import { Point } from "../nonogram";
import { isInRange } from "./isInRange";
import { isPointsEquals } from "./isPointsEquals";

// Only for horizontal and vertical lines
export const isPointBelongsToLine = (
    point: Point,
    line: { start: Point; end?: Point },
): boolean => {
    const { start, end } = line;
    if (!end) {
        return isPointsEquals(start, point);
    }

    if (start.x === end.x && point.x === start.x)
        return isInRange(point.y, { r1: start.y, r2: end.y });

    if (start.y === end.y && point.y === start.y)
        return isInRange(point.x, { r1: start.x, r2: end.x });

    return false;
};
