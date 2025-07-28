import { NonogramElement } from "@/_components/nonogram/Nonogram";
import styles from "./page.module.css";
import { nonogram15x15 } from "../../tests/nonograms";
import NonogramStoreProvider from "./NonogramProvider";
import SolveButton from "@/_components/solve/SolveButton";
import ImageConverter from "@/_components/convert/ConvertButton";

export default function Home() {
    return (
        <div className={styles.page}>
            <NonogramStoreProvider nonogram={nonogram15x15}>
                <SolveButton />
                <ImageConverter />
                <NonogramElement />
            </NonogramStoreProvider>
        </div>
    );
}
