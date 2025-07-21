import { NonogramElement } from "@/_components/nonogram/Nonogram";
import styles from "./page.module.css";
import { nonogram15x15 } from "../../tests/nonograms";

export default function Home() {
    return (
        <div className={styles.page}>
            <NonogramElement nonogram={nonogram15x15} />
        </div>
    );
}
