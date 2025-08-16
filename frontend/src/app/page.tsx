import { NonogramElement } from "@/_components/nonogram/Nonogram";
import styles from "./page.module.css";
import { nonogram15x15 } from "../../tests/nonograms";
import NonogramStoreProvider from "./NonogramProvider";
import { Toolbox } from "@/_components/toolbox/Toolbox";

export default function Home() {
    return (
        <div className={styles.page}>
            <NonogramStoreProvider nonogram={nonogram15x15}>
                <Toolbox />
                <NonogramElement />
            </NonogramStoreProvider>
        </div>
    );
}
