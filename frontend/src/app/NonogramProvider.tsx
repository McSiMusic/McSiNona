"use client";
import { useRef } from "react";
import { Provider } from "react-redux";
import { makeNonogramStore, NonogramStore } from "../lib/nonogramStore";
import { Nonogram } from "@/lib/nonogram";
import { initNonogram } from "@/lib/nonogramSlice";

export default function NonogramStoreProvider({
    nonogram,
    children,
}: {
    nonogram: Nonogram;
    children: React.ReactNode;
}) {
    const storeRef = useRef<NonogramStore | null>(null);
    if (!storeRef.current) {
        // Create the store instance the first time this renders
        storeRef.current = makeNonogramStore();
        storeRef.current.dispatch(initNonogram(nonogram));
    }

    return <Provider store={storeRef.current}>{children}</Provider>;
}
