"use client";
import Link from "next/link";
import styles from "./WinText.module.css";
import { Button } from "@/_components/button/Button";
import { useSelector } from "react-redux";
import { isSolved } from "@/lib/nonogramSlice";
import cn from "classnames";

export const WinText = () => {
    const solved = useSelector(isSolved);

    return (
        <div className={cn(styles.playful, solved && styles.active)}>
            <div>
                <span>Y</span>
                <span>O</span>
                <span>U</span>
                <span> </span>
                <span>W</span>
                <span>I</span>
                <span>N</span>
                <span>!</span>
            </div>
            <Link href={`/list`} className={styles.button}>
                <Button className={styles.button}>To List</Button>
            </Link>
        </div>
    );
};
