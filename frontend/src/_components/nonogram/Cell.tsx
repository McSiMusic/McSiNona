"use client";
import { NonogramCell } from "@/lib/nonogram";
import * as React from "react";
import styles from "./Cell.module.css";
import { useCallback } from "react";
import cn from "classnames";
import { changeFieldCell } from "@/lib/nonogramSlice";
import { useDispatch } from "react-redux";

export interface ICellProps {
    type: NonogramCell;
    x: number;
    y: number;
}

export function Cell({ type, x, y }: ICellProps) {
    const dispatch = useDispatch();
    const onClick = useCallback(
        () => dispatch(changeFieldCell({ type: "filled", x, y })),
        [dispatch, x, y],
    );

    const onContextMenu = useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
            event.preventDefault();
            dispatch(changeFieldCell({ type: "cross", x, y }));
        },
        [dispatch, x, y],
    );

    return (
        <div
            className={cn([
                styles.cell,
                type === "filled" && styles.filled,
                type === "cross" && styles.cross,
            ])}
            onClick={onClick}
            onContextMenu={onContextMenu}
        >
            {type === "cross" && (
                <svg viewBox="0 0 20 20" width="100%" height="100%">
                    <text x="50%" y="16" textAnchor="middle">
                        ✖
                    </text>
                </svg>
            )}
        </div>
    );
}
