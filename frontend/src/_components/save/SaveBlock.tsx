"use client";
import { categories, Category, NonogramMeta } from "@/lib/nonogram";
import { ChangeEvent, useState } from "react";
import styles from "./SaveBlock.module.css";
import { Input } from "../input/Input";
import { Button } from "../button/Button";
import { API_BASE_URL } from "@/config";
import { useSelector } from "react-redux";
import { getNonogram } from "@/lib/nonogramSlice";
import cn from "classnames";

const selectOptions: { value: Category | undefined; caption: string }[] =
    categories.map((category) => ({
        value: category,
        caption: category.charAt(0).toUpperCase() + category.slice(1),
    }));
selectOptions.unshift({
    value: undefined,
    caption: "Please choose a category",
});

export const SaveBlock = () => {
    const [name, setName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState<boolean>(false);
    const [currentCategory, setcurrentCategory] = useState<
        Category | undefined
    >(undefined);
    const nonogram = useSelector(getNonogram);

    const resetMessage = () => {
        setIsError(false);
        setMessage(null);
    };

    const updateMessage = ({
        newMessage,
        isNewError,
    }: {
        newMessage: string;
        isNewError: boolean;
    }) => {
        setMessage(newMessage);
        setIsError(isNewError);
    };

    const onCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
        resetMessage();
        setcurrentCategory(e.target.value as Category);
    };

    const onNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        resetMessage();
        setName(e.target.value);
    };

    const onSave = async () => {
        if (name.trim() === "") {
            updateMessage({ newMessage: "Name is required", isNewError: true });
            return;
        }

        if (!currentCategory) {
            updateMessage({
                newMessage: "Choose a category",
                isNewError: true,
            });
            return;
        }

        resetMessage();

        const requestBody: Omit<NonogramMeta, "id"> = {
            category: currentCategory,
            nonogram,
            width: nonogram.vertical.length,
            height: nonogram.horizontal.length,
            name,
        };

        setIsSaving(true);
        const response = await fetch(`${API_BASE_URL}/api/nonograms`, {
            method: "POST",
            body: JSON.stringify(requestBody),
            headers: {
                "Content-Type": "application/json",
            },
        });
        setIsSaving(false);

        if (!response.ok) {
            updateMessage({ newMessage: "Network error", isNewError: true });
        } else {
            updateMessage({
                newMessage: `Succesfully saved "${name}" Nonogram!`,
                isNewError: false,
            });
        }
    };

    return (
        <div className={styles.root}>
            <Input
                type="text"
                value={name}
                onChange={onNameChange}
                disabled={isSaving}
                placeholder="Type nonogram name..."
            />
            <select
                name="Category"
                id="category"
                value={currentCategory}
                onChange={onCategoryChange}
                className={styles.select}
            >
                {selectOptions.map(({ caption, value }) => (
                    <option value={value} key={value} className={styles.option}>
                        {caption}
                    </option>
                ))}
            </select>
            <Button onClick={onSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
            </Button>
            <div
                className={cn(
                    styles.message,
                    isError && styles.error,
                    !isError && styles.success,
                )}
            >
                {message ? message : ""}
            </div>
        </div>
    );
};
