import { ChangeEvent, FC, PropsWithChildren, RefObject } from "react";
import styles from "./Button.module.css";
import cn from "classnames";

export interface IButtonProps {
    handleImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: RefObject<HTMLInputElement | null>;
    type?: "primary" | "secondary";
    disabled?: boolean;
}

export const UploadButton = ({
    handleImageChange,
    fileInputRef,
    disabled,
    type,
    children,
}: PropsWithChildren<IButtonProps>) => {
    return (
        <>
            <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleImageChange}
                ref={fileInputRef}
                style={{ display: "none" }}
                id="image-upload"
                disabled={disabled}
                className={cn(
                    styles.button,
                    type === "primary" && styles.primary,
                    disabled && styles.disabled,
                )}
            />
            <label
                className={cn(
                    styles.button,
                    type === "primary" && styles.primary,
                    disabled && styles.disabled,
                )}
                htmlFor="image-upload"
            >
                {children}
            </label>
        </>
    );
};
