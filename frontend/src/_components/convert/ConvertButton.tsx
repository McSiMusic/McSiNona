/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useRef, ChangeEvent } from "react";
import { API_BASE_URL } from "@/config";
import { convertFromMatrix } from "@/lib/convert/convertFromMatrix";
import { initNonogram } from "@/lib/nonogramSlice";
import { useDispatch } from "react-redux";

export default function ImageConverter() {
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

    const handleUpload = async () => {
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
        <div style={{ margin: "0 auto", maxWidth: "800px", padding: "20px" }}>
            <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>
                Конвертер изображения в матрицу
            </h1>

            <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                    Размер матрицы:
                    <input
                        type="number"
                        min="1"
                        max="100"
                        value={size}
                        onChange={(e) => setSize(Number(e.target.value))}
                        style={{ marginLeft: "10px", padding: "5px" }}
                    />
                </label>
            </div>

            <div style={{ marginBottom: "15px" }}>
                <input
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    id="image-upload"
                />
                <label
                    htmlFor="image-upload"
                    style={{
                        display: "inline-block",
                        padding: "8px 16px",
                        backgroundColor: "#007bff",
                        color: "white",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    Выбрать изображение
                </label>
                {image && (
                    <span style={{ marginLeft: "10px", color: "green" }}>
                        Изображение выбрано
                    </span>
                )}
            </div>

            {image && (
                <div style={{ marginBottom: "15px" }}>
                    <h2 style={{ fontSize: "20px", marginBottom: "10px" }}>
                        Предпросмотр:
                    </h2>
                    <img
                        src={image}
                        alt="Preview"
                        style={{
                            maxWidth: "100%",
                            maxHeight: "300px",
                            border: "1px solid #ddd",
                        }}
                    />
                </div>
            )}

            <button
                onClick={handleUpload}
                disabled={!image || isLoading}
                style={{
                    padding: "8px 16px",
                    borderRadius: "4px",
                    backgroundColor:
                        !image || isLoading ? "#cccccc" : "#28a745",
                    color: "white",
                    border: "none",
                    cursor: !image || isLoading ? "not-allowed" : "pointer",
                }}
            >
                {isLoading ? "Обработка..." : "Конвертировать в матрицу"}
            </button>

            {error && (
                <div
                    style={{
                        marginTop: "15px",
                        padding: "10px",
                        backgroundColor: "#f8d7da",
                        color: "#721c24",
                        borderRadius: "4px",
                    }}
                >
                    Ошибка: {error}
                </div>
            )}
        </div>
    );
}
