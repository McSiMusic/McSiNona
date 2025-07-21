import { isPointBelongsToLine } from "./isPointBelongsToLine";

describe("isPointBelongsToLine", () => {
    it("returns true if belongs to horizontal line", () => {
        expect(
            isPointBelongsToLine(
                { x: 0, y: 4 },
                { start: { x: 0, y: 0 }, end: { x: 0, y: 8 } },
            ),
        ).toBe(true);
    });

    it("returns false if doesn't belong to line", () => {
        expect(
            isPointBelongsToLine(
                { x: 2, y: 0 },
                { end: { x: 0, y: 1 }, start: { x: 0, y: 0 } },
            ),
        ).toBe(false);
    });
});
