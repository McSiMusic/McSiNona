import { useDispatch, useSelector, useStore } from "react-redux";
import type {
    NonogramDispatch,
    NonogramStore,
    NonogramState,
} from "./nonogramStore";

export const useAppDispatch = useDispatch.withTypes<NonogramDispatch>();
export const useAppSelector = useSelector.withTypes<NonogramState>();
export const useAppStore = useStore.withTypes<NonogramStore>();
