"use client";
import { useCallback, useEffect, useRef, useState } from "react";
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
    const [status, setStatus] = useState("Press Solve to start solving!");

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
                setStatus(`Solving... - ${Math.floor(data.progress)}%`);
                dispatch(fillCells(data.points));
            } else {
                if (data.result.sucess) {
                    dispatch(setField(data.result.nonogram));
                    setStatus(`Success`);
                } else {
                    setStatus(`Can't solve`);
                }
            }
        };

        return () => {
            workerRef.current?.terminate();
        };
    }, [dispatch]);

    const handleSolveClick = useCallback(async () => {
        setStatus("Solving...");
        workerRef.current?.postMessage(nonogram);
    }, [nonogram]);

    return (
        <div>
            <h4>{status}</h4>
            <button onClick={handleSolveClick}>Solve</button>
        </div>
    );
}
