import { NonogramCell } from "../nonogram";
import {
    checkIfCanInsertBlock,
    generateOffsetsArraysLazy,
    generateSolutionsLazy,
    hasSolutions,
} from "./alternativeSolver";

describe("alternativeSolver", () => {
    it("test", () => {
        /* expect(
            Array.from(
                generateOffsetsArraysLazy({
                    availableSpacesCount: 14,
                    currentState: [
                        "empty",
                        "empty",
                        "empty",
                        "empty",
                        "cross",
                        "empty",
                        "empty",
                        "filled",
                        "empty",
                        "empty",
                        "cross",
                        "empty",
                        "empty",
                        "empty",
                        "cross",
                    ],
                    filledGroupsCount: 1,
                    lineNumbers: [1],
                }),
            ),
        ).toStrictEqual([]); */

        expect(
            Array.from(
                generateSolutionsLazy(
                    [1],
                    15,
                    [
                        "empty",
                        "empty",
                        "empty",
                        "empty",
                        "cross",
                        "empty",
                        "empty",
                        "filled",
                        "empty",
                        "empty",
                        "cross",
                        "empty",
                        "empty",
                        "empty",
                        "cross",
                    ],
                    true,
                ),
            ),
        ).toStrictEqual([]);
    });

    it("hasSolutions", () => {
        const field: NonogramCell[][] = [
            ["cross", "cross", "filled"],
            ["cross", "cross", "filled"],
            ["cross", "cross", "filled"],
        ];
        expect(
            hasSolutions({
                field,
                index: 0,
                isHorizontal: true,
                nonogram: {
                    vertical: [[2], [2], [2]],
                    horizontal: [[1, 1], [3], [1]],
                },
            }),
        ).toBe(false);
    });

    it("hasSolutions", () => {
        const field: NonogramCell[][] = [
            ["empty", "empty", "empty"],
            ["empty", "empty", "empty"],
            ["empty", "empty", "empty"],
        ];
        expect(
            hasSolutions({
                field,
                index: 0,
                isHorizontal: true,
                nonogram: {
                    vertical: [[], [], []],
                    horizontal: [[], [], []],
                },
            }),
        ).toBe(true);
    });
});
