"use client";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { solveNonogramAsync } from "@/lib/solver/solver";
import { fillCell, getNonogram, setField } from "@/lib/nonogramSlice";

export default function SolveButton() {
    const dispatch = useDispatch();
    const nonogram = useSelector(getNonogram);

    const handleSolveClick = useCallback(async () => {
        const result = await solveNonogramAsync(
            nonogram,
            /* async ({ point, value }) => {
                dispatch(fillCell({ point, type: value }));
                await new Promise((resolve) => setTimeout(resolve, 0));
            }, */
        );

        dispatch(setField(result));
    }, [dispatch, nonogram]);

    return <button onClick={handleSolveClick}>Solve</button>;
}
