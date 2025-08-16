/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useRef, ChangeEvent } from "react";
import { API_BASE_URL } from "@/config";
import { convertFromMatrix } from "@/lib/convert/convertFromMatrix";
import { initNonogram } from "@/lib/nonogramSlice";
import { useDispatch } from "react-redux";
import { Button } from "../button/Button";
import { UploadButton } from "../button/UploadButton";
import styles from "./ConvertBlock.module.css";
import { Input } from "../input/Input";

export default function ConvertBlock() {
    const dispatch = useDispatch();
    const [image, setImage] = useState<string | null>(null);
    const [size, setSize] = useState<number>(40);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target?.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
            setError(null);
        }
    };

    const handleUpload = async (isInversed = false) => {
        if (!fileInputRef.current?.files?.[0]) {
            setError("Пожалуйста, выберите изображение");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("image", fileInputRef.current.files[0]);
            formData.append("size", size.toString());
            formData.append("isInversed", isInversed.toString());

            const response = await fetch(`${API_BASE_URL}/api/convert`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Ошибка при обработке изображения");
            }

            const { matrix }: { matrix: (1 | 0)[][] } = await response.json();
            const nonogram = convertFromMatrix(matrix);
            dispatch(initNonogram(nonogram));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Неизвестная ошибка");
            console.error("Upload error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.root}>
            <div className={styles.upload}>
                <div className={styles.size}>
                    <div>Size:</div>
                    <Input
                        id="size"
                        className={styles.input}
                        type="number"
                        min="1"
                        max="100"
                        width={40}
                        value={size}
                        onChange={(e) => setSize(Number(e.target.value))}
                    />
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <UploadButton
                        handleImageChange={handleImageChange}
                        fileInputRef={fileInputRef}
                    >
                        Upload
                    </UploadButton>
                </div>
            </div>
            {image && (
                <div className={styles.preview}>
                    <div>Preview:</div>
                    <img src={image} alt="Preview" className={styles.image} />
                </div>
            )}
            <Button
                onClick={() => handleUpload()}
                disabled={!image || isLoading}
            >
                {isLoading ? "Processing..." : "Convert to Nonogram"}
            </Button>
            <Button
                onClick={() => handleUpload(true)}
                disabled={!image || isLoading}
            >
                {isLoading ? "Processing..." : "Convert to Inversed Nonogram"}
            </Button>
            <div>{error}</div>
        </div>
    );
}
