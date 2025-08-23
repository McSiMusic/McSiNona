import { API_BASE_URL } from "@/config";
import { NonogramMeta } from "@/lib/nonogram";

type ResponseResult<T> =
    | { success: true; result: T }
    | { sucess: false; reason: string };

const processRequest = () => {};

export const createNonogram = async (
    requestBody: Omit<NonogramMeta, "id">,
): ResponseResult<NonogramMeta> => {
    const result = await fetch(`${API_BASE_URL}/api/nonograms`, {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
            "Content-Type": "application/json",
        },
    });
};
