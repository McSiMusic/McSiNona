import * as React from "react";
import { Nonogram } from "@/lib/nonogram";
import styles from "./Nonogram.module.css";
import cn from "classnames";

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

export function NonogramElement({ nonogram }: INonogramProps) {
    const { horizontal, vertical } = nonogram;

    const maxVerticalCount = Math.max(...vertical.map((set) => set.length));
    const maxHorizontalCount = Math.max(...horizontal.map((set) => set.length));

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
                {/* PREVIEW */}
                <div
                    className={styles.preview}
                    style={{
                        gridRow: `1 / ${maxVerticalCount + 1}`,
                        gridColumn: `1 / ${maxVerticalCount + 1}`,
                    }}
                ></div>

                {/* VERTICAL VALUES */}
                {vertical.map((set, x) =>
                    [...Array(maxVerticalCount)].map((_, y) => (
                        <div
                            key={`${x}x${y}`}
                            className={cn(
                                styles.cell,
                                x % 5 === 0 && styles.withVerticalBorder,
                            )}
                            style={{
                                gridRow: `${maxVerticalCount - y}`,
                                gridColumn: `${maxHorizontalCount + x + 1}`,
                            }}
                        >
                            {set[y] && (
                                <svg
                                    viewBox="0 0 20 20"
                                    width="100%"
                                    height="100%"
                                >
                                    <text x="50%" y="16" textAnchor="middle">
                                        {set[y]}
                                    </text>
                                </svg>
                            )}
                        </div>
                    )),
                )}

                {/* HORIZONTAL VALUES */}
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
                                gridColumn: `${maxHorizontalCount - x}`,
                            }}
                        >
                            <svg viewBox="0 0 20 20" width="100%" height="100%">
                                <text x="50%" y="16" textAnchor="middle">
                                    {set[x]}
                                </text>
                            </svg>
                        </div>
                    )),
                )}

                {/* FIELD */}
                {vertical.map((_, x) =>
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
                        />
                    )),
                )}
            </div>
        </div>
    );
}
