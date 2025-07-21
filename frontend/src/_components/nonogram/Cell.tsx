"use client";
import { NonogramCell, Point } from "@/lib/nonogram";
import * as React from "react";
import styles from "./Cell.module.css";
import { useCallback } from "react";
import cn from "classnames";
import { getCellValue } from "@/lib/nonogramSlice";
import { useSelector } from "react-redux";
import { NonogramState } from "@/lib/nonogramStore";

export interface ICellProps {
    point: Point;
    onMouseDown?: (args: { point: Point; type: NonogramCell }) => void;
    onMouseEnter?: (point: Point) => void;
}

export function Cell({ point, onMouseDown, onMouseEnter }: ICellProps) {
    const { isTemporary, type } = useSelector((state: NonogramState) =>
        getCellValue(state, point),
    );

    const handleMouseDown = useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
            event.preventDefault();
            event.stopPropagation();
            const isRightButton = event.button === 2;
            onMouseDown?.({
                point,
                type: isRightButton ? "cross" : "filled",
            });
        },
        [onMouseDown, point],
    );

    const handleMouseEnter = useCallback(() => {
        onMouseEnter?.(point);
    }, [onMouseEnter, point]);

    const handleContextMenu = useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
            event.preventDefault();
        },
        [],
    );

    return (
        <div
            className={cn([
                styles.cell,
                type === "filled" && styles.filled,
                type === "cross" && styles.cross,
                isTemporary && styles.temporary,
            ])}
            onMouseDown={handleMouseDown}
            onMouseEnter={handleMouseEnter}
            onContextMenu={handleContextMenu}
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
