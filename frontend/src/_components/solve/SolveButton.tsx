"use client";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { solveNonogramAsync } from "@/lib/solver/solver";
import { fillCell, getNonogram } from "@/lib/nonogramSlice";

export default function SolveButton() {
    const dispatch = useDispatch();
    const nonogram = useSelector(getNonogram);

    const handleSolveClick = useCallback(() => {
        solveNonogramAsync(nonogram, async ({ point, value }) => {
            dispatch(fillCell({ point, type: value }));
            await new Promise((resolve) => setTimeout(resolve, 0));
        });
    }, [dispatch, nonogram]);

    return <button onClick={handleSolveClick}>Solve</button>;
}
