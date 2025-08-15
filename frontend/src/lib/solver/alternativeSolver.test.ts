import {
    checkIfCanInsertBlock,
    generateOffsetsArraysLazy,
    generateSolutionsLazy,
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
});
