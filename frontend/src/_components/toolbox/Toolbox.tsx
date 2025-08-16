"use client";
import { FC, useState } from "react";
import { Button } from "../button/Button";
import SolveButton from "../solve/SolveButton";
import ConvertBlock from "../convert/ConvertBlock";
import styles from "./Toolbox.module.css";
import { SaveBlock } from "../save/SaveBlock";

export const Toolbox: FC = () => {
    const [hidden, setHidden] = useState(false);

    if (hidden) {
        return (
            <div className={styles.rootCollapsed}>
                <Button onClick={() => setHidden(false)}>⇢</Button>
            </div>
        );
    }
    return (
        <div className={styles.root}>
            <div className={styles.main}>
                <div>
                    <Button onClick={() => setHidden(true)}>⇠</Button>
                </div>
                <ConvertBlock />
                <SolveButton />
            </div>
            <div className={styles.footer}>
                <SaveBlock />
            </div>
        </div>
    );
};
