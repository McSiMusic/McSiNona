import { NonogramElement } from "@/_components/nonogram/Nonogram";
import NonogramStoreProvider from "@/app/NonogramProvider";
import { API_BASE_URL } from "@/config";
import { NonogramMeta } from "@/lib/nonogram";
import styles from "./page.module.css";
import { NonogramFooter } from "@/_components/nonogramFooter/NonogramFooter";

export default async function NonogramPage({
    params,
}: {
    params: Promise<{ nonogram: string }>;
}) {
    const { nonogram: nonogramId } = await params;
    const result = await fetch(`${API_BASE_URL}/api/nonograms/${nonogramId}`, {
        method: "GET",
    });

    if (!result.ok) return <h1>Cant find nonogram</h1>;

    const jsonResult: NonogramMeta = await result.json();

    return (
        <div className={styles.page}>
            <NonogramStoreProvider nonogram={jsonResult.nonogram}>
                <NonogramElement />
                <NonogramFooter />
            </NonogramStoreProvider>
        </div>
    );
}
