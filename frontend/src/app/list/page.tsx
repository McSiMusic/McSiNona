import { API_BASE_URL } from "@/config";
import styles from "./page.module.css";
import { NonogramMeta } from "@/lib/nonogram";
import Link from "next/link";

export default async function List() {
    const result = await fetch(`${API_BASE_URL}/api/nonograms`, {
        method: "GET",
    });
    const jsonResult: Omit<NonogramMeta, "nonogram">[] = await result.json();

    return (
        <div className={styles.root}>
            <div className={styles.list}>
                {jsonResult.map(({ id, category, width, height, name }) => (
                    <Link
                        href={`/nonogram/${id}`}
                        key={id}
                        className={styles.link}
                    >
                        <div className={styles.nonogram}>
                            <div className={styles.name}>{name}</div>
                            <div className={styles.info}>
                                <div>Category: {category}</div>
                                <div>
                                    Size: {width}x{height}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
