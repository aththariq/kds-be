"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const simulation_controller_1 = __importDefault(require("../controllers/simulation.controller"));
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
/**
 * Simulation Routes
 * All routes are prefixed with /api/simulations
 */
// POST /api/simulations - Create new simulation
router.post("/", validation_middleware_1.validateSimulationParams, simulation_controller_1.default.createSimulation);
// GET /api/simulations - Get simulation history with pagination and filtering
router.get("/", simulation_controller_1.default.getSimulations);
// GET /api/simulations/:id - Get specific simulation
router.get("/:id", simulation_controller_1.default.getSimulation);
// PUT /api/simulations/:id/step - Advance simulation one generation
router.put("/:id/step", simulation_controller_1.default.stepSimulation);
// PUT /api/simulations/:id/start - Start/resume simulation
router.put("/:id/start", simulation_controller_1.default.startSimulation);
// PUT /api/simulations/:id/pause - Pause simulation
router.put("/:id/pause", simulation_controller_1.default.pauseSimulation);
// PUT /api/simulations/:id/reset - Reset simulation to initial state  
router.put("/:id/reset", simulation_controller_1.default.resetSimulation);
// PUT /api/simulations/:id/speed - Update simulation speed
router.put("/:id/speed", simulation_controller_1.default.updateSimulationSpeed);
// GET /api/simulations/:id/export - Export simulation data
router.get("/:id/export", simulation_controller_1.default.exportSimulation);
// DELETE /api/simulations/:id - Delete simulation
router.delete("/:id", simulation_controller_1.default.deleteSimulation);
exports.default = router;
