// routes/kpiRoutes.js 
import { Router } from "express";
import { 
  getDailyKPI, 
  getMonthlyKPI, 
  triggerDailyKPI, 
  triggerMonthlyKPI,
  getKPISummary,
  getKPITargets,
  updateKPITargets,
  triggerAllUsersKPI,
  initializeKPITargets
} from "../controllers/kpiContoller.js";

const router = Router();

router.get("/summary", getKPISummary);
router.get("/daily", getDailyKPI);
router.post("/perhitungan-hari", triggerDailyKPI);
router.get("/monthly", getMonthlyKPI);
router.post("/perhitungan-bulan", triggerMonthlyKPI);
router.get("/targets", getKPITargets);
router.post("/targets", updateKPITargets);
router.post("/bulk-calculate", triggerAllUsersKPI);
router.post("/init-targets", initializeKPITargets);

export default router;