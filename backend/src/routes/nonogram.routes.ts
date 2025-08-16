import { Router } from "express";
import {
  createNonogram,
  getNonograms,
  deleteNonograms,
} from "../controllers/nonogram.controller";

const router = Router();

router.post("/", createNonogram);
router.get("/", getNonograms);
router.delete("/", deleteNonograms);

export default router;
