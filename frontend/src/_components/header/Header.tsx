import * as React from "react";
import Image from "next/image";
import styles from "./Header.module.css";

export interface IHeaderProps {
    className?: string;
}

export function Header({ className }: IHeaderProps) {
    return (
        <div className={styles.header}>
            <Image
                src="/horizontal.svg"
                alt="Logo"
                className="logo"
                fill
                objectFit="contain"
            />
        </div>
    );
}
