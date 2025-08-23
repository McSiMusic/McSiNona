"use client";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../button/Button";
import styles from "./NonogramFooter.module.css";
import {
    canRedo as canRedoSelector,
    canUndo as canUndoSelector,
    redo,
    undo,
} from "@/lib/nonogramSlice";

export const NonogramFooter = () => {
    const dispatch = useDispatch();
    const canUndo = useSelector(canUndoSelector);
    const canRedo = useSelector(canRedoSelector);

    return (
        <div className={styles.root}>
            <Button
                className={styles.button}
                onClick={() => dispatch(undo())}
                disabled={!canUndo}
            >
                ↶
            </Button>
            <Button
                className={styles.button}
                onClick={() => dispatch(redo())}
                disabled={!canRedo}
            >
                ↷
            </Button>
        </div>
    );
};
