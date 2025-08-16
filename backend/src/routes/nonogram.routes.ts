import { Router } from "express";
import {
  createNonogram,
  getNonograms,
  deleteNonograms,
  getNonogramById,
} from "../controllers/nonogram.controller";

const router = Router();

router.post("/", createNonogram);
router.get("/", getNonograms);
router.delete("/", deleteNonograms);
router.get("/:id", getNonogramById);

export default router;
