import { getMaxAge } from "next/dist/server/image-optimizer";
import {
    convertToFieldLineWithOffset,
    createPossibleSolutionsForLine,
    generateOffsetsArrays,
    getMaxOffset,
} from "./solver";

describe("solver", () => {
    describe("generateOffsetsArrays", () => {
        it("Works with 3 groups and 2 empty spaces", () => {
            expect(generateOffsetsArrays(3, 2)).toStrictEqual([
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

        it("Works with 1 group and 0 empty spaces", () => {
            expect(generateOffsetsArrays(1, 0)).toStrictEqual([[0]]);
        });

        it("Works with 1 group and 1 empty spaces", () => {
            expect(generateOffsetsArrays(1, 1)).toStrictEqual([[0], [1]]);
        });

        it("Works with 2 group and 1 empty spaces", () => {
            expect(generateOffsetsArrays(2, 1)).toStrictEqual([
                [0, 0],
                [0, 1],
                [1, 0],
            ]);
        });

        it("Works with 0 group and 15 empty spaces", () => {
            expect(generateOffsetsArrays(0, 15)).toStrictEqual([[]]);
        });
    });

    describe("getMaxOffset", () => {
        it("works right with one full group of numbers", () => {
            expect(getMaxOffset([15], 15)).toBe(0);
        });

        it("works right with three group of numbers", () => {
            expect(getMaxOffset([2, 3, 6], 15)).toBe(2);
        });

        it("works right with ones", () => {
            expect(getMaxOffset([1], 15)).toBe(14);
        });
    });

    describe("convertToFieldLineWithOffset", () => {
        it("works right with empty line", () => {
            expect(convertToFieldLineWithOffset([], [], 15)).toStrictEqual(
                new Array(15).fill("cross"),
            );
        });

        it("works right with zero offsets", () => {
            expect(
                convertToFieldLineWithOffset([2, 3, 6], [0, 0, 0], 15),
            ).toStrictEqual([
                "filled",
                "filled",
                "cross",
                "filled",
                "filled",
                "filled",
                "cross",
                "filled",
                "filled",
                "filled",
                "filled",
                "filled",
                "filled",
                "cross",
                "cross",
            ]);
        });

        it("works right with non zero offsets", () => {
            expect(
                convertToFieldLineWithOffset([2, 3, 6], [1, 1, 0], 15),
            ).toStrictEqual([
                "cross",
                "filled",
                "filled",
                "cross",
                "cross",
                "filled",
                "filled",
                "filled",
                "cross",
                "filled",
                "filled",
                "filled",
                "filled",
                "filled",
                "filled",
            ]);
        });
    });

    describe("createPossibleSolutionsForLine", () => {
        it("works with empty line", () => {
            expect(createPossibleSolutionsForLine([], 5)).toStrictEqual([
                ["cross", "cross", "cross", "cross", "cross"],
            ]);
        });

        it("works with small without variants", () => {
            expect(createPossibleSolutionsForLine([1, 1, 1], 5)).toStrictEqual([
                ["filled", "cross", "filled", "cross", "filled"],
            ]);
        });

        it("works with small with variants", () => {
            expect(createPossibleSolutionsForLine([1, 1], 4)).toStrictEqual([
                ["filled", "cross", "filled", "cross"],
                ["filled", "cross", "cross", "filled"],
                ["cross", "filled", "cross", "filled"],
            ]);
        });
    });
});
