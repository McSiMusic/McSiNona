import { FC, PropsWithChildren } from "react";
import styles from "./Button.module.css";
import cn from "classnames";

export interface IButtonProps {
    onClick: () => void;
    type?: "primary" | "secondary";
    disabled?: boolean;
}

export const Button = ({
    onClick,
    disabled,
    type,
    children,
}: PropsWithChildren<IButtonProps>) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                styles.button,
                type === "primary" && styles.primary,
                disabled && styles.disabled,
            )}
        >
            {children}
        </button>
    );
};
