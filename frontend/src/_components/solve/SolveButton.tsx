"use client";
import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fillCells, getNonogram, setField } from "@/lib/nonogramSlice";
import {
    SolverCompleteWorkerMessage,
    SolverProgressWorkerMessage,
} from "@/lib/solver/solveWorkerMessageTypes";

export default function SolveButton() {
    const dispatch = useDispatch();
    const nonogram = useSelector(getNonogram);
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        // Создаем воркер
        if (!workerRef.current) {
            workerRef.current = new Worker(
                new URL("../../lib/workers/solverWorker.ts", import.meta.url),
            );
        }

        workerRef.current.onmessage = (
            e: MessageEvent<
                SolverProgressWorkerMessage | SolverCompleteWorkerMessage
            >,
        ) => {
            const { data } = e;
            if (data.type === "progress") {
                dispatch(fillCells(data.points));
                console.log(data.progress);
            } else {
                if (data.result.sucess) {
                    dispatch(setField(data.result.nonogram));
                } else {
                    alert("Can't solve, sorry(");
                }
            }
        };

        return () => {
            workerRef.current?.terminate();
        };
    }, [dispatch]);

    const handleSolveClick = useCallback(async () => {
        workerRef.current?.postMessage(nonogram);
    }, [nonogram]);

    return <button onClick={handleSolveClick}>Solve</button>;
}
