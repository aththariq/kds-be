import { Router } from "express";
import SimulationController from "../controllers/simulation.controller";
import { validateSimulationParams } from "../middleware/validation.middleware";

const router = Router();

/**
 * Simulation Routes
 * All routes are prefixed with /api/simulations
 */

// POST /api/simulations - Create new simulation
router.post(
  "/",
  validateSimulationParams,
  SimulationController.createSimulation
);

// GET /api/simulations - Get simulation history with pagination and filtering
router.get("/", SimulationController.getSimulations);

// GET /api/simulations/:id - Get specific simulation
router.get("/:id", SimulationController.getSimulation);

// PUT /api/simulations/:id/step - Advance simulation one generation
router.put("/:id/step", SimulationController.stepSimulation);

// PUT /api/simulations/:id/start - Start/resume simulation
router.put("/:id/start", SimulationController.startSimulation);

// PUT /api/simulations/:id/pause - Pause simulation
router.put("/:id/pause", SimulationController.pauseSimulation);

// GET /api/simulations/:id/export - Export simulation data
router.get("/:id/export", SimulationController.exportSimulation);

// DELETE /api/simulations/:id - Delete simulation
router.delete("/:id", SimulationController.deleteSimulation);

export default router;
