"use client";
import * as React from "react";
import { Nonogram } from "@/lib/nonogram";
import styles from "./Nonogram.module.css";
import cn from "classnames";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { changeFieldCell, getField, getNonogram } from "@/lib/nonogramSlice";
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
    const field = useSelector(getField);
    const { vertical, horizontal } = useSelector(getNonogram);

    const maxVerticalCount = Math.max(...vertical.map((set) => set.length));
    const maxHorizontalCount = Math.max(...horizontal.map((set) => set.length));

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
                        <Cell type={field[x][y]} x={x} y={y} />
                    </div>
                )),
            ),
        [field, horizontal, maxHorizontalCount, maxVerticalCount, vertical],
    );

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
