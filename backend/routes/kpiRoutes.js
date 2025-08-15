// routes/kpiRoutes.js - Updated untuk integrasi dengan reports
import { Router } from "express";
import { 
  getDailyKPI, 
  getMonthlyKPI, 
  triggerDailyKPI, 
  triggerMonthlyKPI,
  getKPISummary,
  getKPITargets,
  updateKPITargets,
  getKPIReport,
  triggerAllUsersKPI,
  initializeKPITargets
} from "../controllers/kpiContoller.js";

const router = Router();

// ===== KPI SUMMARY & DASHBOARD =====
router.get("/summary", getKPISummary);

// ===== DAILY KPI =====
router.get("/hari", getDailyKPI);
router.post("/perhitungan-hari", triggerDailyKPI);

// ===== MONTHLY KPI =====
router.get("/bulan", getMonthlyKPI);
router.post("/perhitungan-bulan", triggerMonthlyKPI);

// ===== KPI TARGETS MANAGEMENT =====
router.get("/targets", getKPITargets);
router.post("/targets", updateKPITargets);

// ===== REPORTS (untuk frontend) =====
router.get("/report", getKPIReport);

// ===== BULK OPERATIONS =====
// Trigger KPI calculation untuk semua user pada tanggal tertentu
router.post("/bulk-calculate", triggerAllUsersKPI);

// ===== INITIALIZATION =====
// Initialize default KPI targets jika belum ada
router.post("/init-targets", initializeKPITargets);

export default router;