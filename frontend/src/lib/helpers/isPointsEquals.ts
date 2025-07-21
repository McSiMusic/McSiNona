import { Point } from "../nonogram";

export const isPointsEquals = (point1: Point, point2: Point) =>
    point1.x === point2.x && point1.y === point2.y;
