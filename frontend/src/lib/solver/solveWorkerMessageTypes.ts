import { NonogramCell, NonogramPointDefinition } from "../nonogram";

export type SolverProgressWorkerMessage = {
    type: "progress";
    points: NonogramPointDefinition[];
    progress: number;
};

export type SolverCompleteWorkerMessage = {
    type: "cmoplete";
    result: { sucess: true; nonogram: NonogramCell[][] } | { sucess: false };
};
