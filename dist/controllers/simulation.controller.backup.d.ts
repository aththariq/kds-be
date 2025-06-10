import { Request, Response } from "express";
export declare class SimulationController {
    /**
     * Create a new simulation
     * POST /api/simulations
     */
    static createSimulation(req: Request, res: Response): Promise<void>;
    /**
     * Get all simulations with pagination and filtering
     * GET /api/simulations
     */
    static getSimulations(req: Request, res: Response): Promise<void>;
    /**
     * Get specific simulation by ID
     * GET /api/simulations/:id
     */
    static getSimulation(req: Request, res: Response): Promise<void>;
    /**
     * Advance simulation by one generation
     * PUT /api/simulations/:id/step
     */
    static stepSimulation(req: Request, res: Response): Promise<void>;
    /**
     * Start or resume simulation
     * PUT /api/simulations/:id/start
     */
    static startSimulation(req: Request, res: Response): Promise<void>;
    /**
     * Pause simulation
     * PUT /api/simulations/:id/pause
     */
    static pauseSimulation(req: Request, res: Response): Promise<void>;
    /**
     * Delete simulation
     * DELETE /api/simulations/:id
     */
    static deleteSimulation(req: Request, res: Response): Promise<void>;
    /**
     * Reset simulation to initial state
     * PUT /api/simulations/:id/reset
     */
    static resetSimulation(req: Request, res: Response): Promise<void>;
    /**
     * Health check endpoint
     * GET /api/health
     */
    static healthCheck(req: Request, res: Response): Promise<void>;
    /**
     * Export simulation data
     * GET /api/simulations/:id/export
     */
    static exportSimulation(req: Request, res: Response): Promise<void>;
    /**
     * Update simulation speed
     * PUT /api/simulations/:id/speed
     */
    static updateSimulationSpeed(req: Request, res: Response): Promise<void>;
}
export default SimulationController;
