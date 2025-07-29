import { SolverProgressWorkerMessage } from "@/lib/solver/solveWorkerMessageTypes";
import { Nonogram, NonogramPointDefinition } from "../nonogram";
import { solveNonogramAlternative } from "../solver/alternativeSolver";

self.onmessage = async function (nonogramMessage: MessageEvent<Nonogram>) {
    const { data: nonogram } = nonogramMessage;
    let solvedCells = 0;
    const total = nonogram.horizontal.length * nonogram.vertical.length;

    const onProgress = (points: NonogramPointDefinition[]) => {
        solvedCells += points.length;
        const progress = (solvedCells / total) * 100;

        const progressResult: SolverProgressWorkerMessage = {
            type: "progress",
            points,
            progress,
        };
        self.postMessage(progressResult);
    };
    const result = solveNonogramAlternative(nonogram, onProgress);

    self.postMessage({ type: "result", result });
};
