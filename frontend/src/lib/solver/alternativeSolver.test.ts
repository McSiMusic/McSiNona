import { generateOffsetsArraysLazy } from "./alternativeSolver";

describe("alternativeSolver", () => {
    it("test", () => {
        expect(Array.from(generateOffsetsArraysLazy(3, 2))).toStrictEqual([
            [0, 0, 0],
            [0, 0, 1],
            [0, 0, 2],
            [0, 1, 0],
            [0, 1, 1],
            [0, 2, 0],
            [1, 0, 0],
            [1, 0, 1],
            [1, 1, 0],
            [2, 0, 0],
        ]);
    });
});
