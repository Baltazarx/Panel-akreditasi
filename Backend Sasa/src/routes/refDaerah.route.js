import { Router } from "express";
import { searchDaerah } from "../controllers/refDaerah.controller.js";

const router = Router();
router.get("/ref-daerah", searchDaerah);
export default router;
