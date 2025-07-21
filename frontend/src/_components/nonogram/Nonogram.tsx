"use client";
import * as React from "react";
import { Nonogram, NonogramCell, Point } from "@/lib/nonogram";
import styles from "./Nonogram.module.css";
import cn from "classnames";
import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    calculateTemporaryLine,
    getMaxHorizontalCount,
    getMaxVerticalCount,
    getMode,
    getNonogram,
    finishLineMode,
    startLineMode,
} from "@/lib/nonogramSlice";
import { Cell } from "./Cell";

export interface INonogramProps {
    nonogram: Nonogram;
}

/*
Nonograms looks like that
----------| ----------------|       
 PREVIEW  | VERTICAL VALUES |
----------| ----------------|
HORIZONTAL|       FIELD     |
  VALUES  |                 | 
____________________________|

It has grid css layout
*/

export function NonogramElement() {
    const { vertical, horizontal } = useSelector(getNonogram);
    const dispatch = useDispatch();

    const maxVerticalCount = useSelector(getMaxVerticalCount);
    const maxHorizontalCount = useSelector(getMaxHorizontalCount);

    const mode = useSelector(getMode);

    const preview = useMemo(
        () => (
            <div
                className={styles.preview}
                style={{
                    gridRow: `1 / ${maxVerticalCount + 1}`,
                    gridColumn: `1 / ${maxVerticalCount + 1}`,
                }}
            ></div>
        ),
        [maxVerticalCount],
    );

    const verticalValues = useMemo(
        () => (
            <>
                {vertical.map((set, x) =>
                    [...Array(maxVerticalCount)].map((_, y) => (
                        <div
                            key={`${x}x${y}`}
                            className={cn(
                                styles.cell,
                                x % 5 === 0 && styles.withVerticalBorder,
                            )}
                            style={{
                                gridRow: `${y + 1}`,
                                gridColumn: `${maxHorizontalCount + x + 1}`,
                            }}
                        >
                            <svg viewBox="0 0 20 20" width="100%" height="100%">
                                <text x="50%" y="16" textAnchor="middle">
                                    {set[y + set.length - maxVerticalCount]}
                                </text>
                            </svg>
                        </div>
                    )),
                )}
            </>
        ),
        [maxHorizontalCount, maxVerticalCount, vertical],
    );

    const horizontalValues = useMemo(
        () => (
            <>
                {horizontal.map((set, y) =>
                    [...Array(maxHorizontalCount)].map((_, x) => (
                        <div
                            key={`${x}x${y}`}
                            className={cn(
                                styles.cell,
                                y % 5 === 0 && styles.withHorizontalBorder,
                            )}
                            style={{
                                gridRow: `${maxVerticalCount + y + 1}`,
                                gridColumn: `${x + 1}`,
                            }}
                        >
                            <svg viewBox="0 0 20 20" width="100%" height="100%">
                                <text x="50%" y="16" textAnchor="middle">
                                    {set[x + set.length - maxHorizontalCount]}
                                </text>
                            </svg>
                        </div>
                    )),
                )}
            </>
        ),
        [horizontal, maxHorizontalCount, maxVerticalCount],
    );

    const handleMouseDown = useCallback(
        ({ point, type }: { point: Point; type: NonogramCell }) => {
            dispatch(startLineMode({ start: point, type }));
        },
        [dispatch],
    );

    const handleMouseEnter = useCallback(
        (point: Point) => {
            if (mode === "line") dispatch(calculateTemporaryLine(point));
        },
        [dispatch, mode],
    );

    const fieldElements = useMemo(
        () =>
            vertical.map((_, x) =>
                horizontal.map((_, y) => (
                    <div
                        key={`${x}x${y}`}
                        className={cn(
                            styles.cell,
                            x % 5 === 0 && styles.withVerticalBorder,
                            y % 5 === 0 && styles.withHorizontalBorder,
                        )}
                        style={{
                            gridRow: `${maxVerticalCount + y + 1}`,
                            gridColumn: `${maxHorizontalCount + x + 1}`,
                        }}
                    >
                        <Cell
                            point={{ x, y }}
                            onMouseDown={handleMouseDown}
                            onMouseEnter={handleMouseEnter}
                        />
                    </div>
                )),
            ),
        [
            handleMouseDown,
            handleMouseEnter,
            horizontal,
            maxHorizontalCount,
            maxVerticalCount,
            vertical,
        ],
    );

    const handleMouseUp = useCallback(() => {
        if (mode === "line") dispatch(finishLineMode());
    }, [dispatch, mode]);

    useEffect(() => {
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [handleMouseUp]);

    return (
        <div className={styles.wrapper}>
            <div
                className={styles.grid}
                style={{
                    gridTemplateColumns: `repeat(${vertical.length + maxHorizontalCount}, 1fr)`,
                    gridTemplateRows: `repeat(${horizontal.length + maxVerticalCount}, 1fr)`,
                    aspectRatio: `${(vertical.length + maxHorizontalCount) / (horizontal.length + maxVerticalCount)}`,
                }}
            >
                {preview}
                {verticalValues}
                {horizontalValues}
                {fieldElements}
            </div>
        </div>
    );
}
