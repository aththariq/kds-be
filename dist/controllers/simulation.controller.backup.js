"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulationController = void 0;
const Simulation_1 = __importDefault(require("../models/Simulation"));
const simulation_service_1 = __importDefault(require("../services/simulation.service"));
// Controller for handling simulation operations
class SimulationController {
    /**
     * Create a new simulation
     * POST /api/simulations
     */
    static async createSimulation(req, res) {
        try {
            const { name, description, parameters, } = req.body;
            // Validate simulation parameters
            if (!name || !parameters) {
                res.status(400).json({
                    error: "Missing required fields",
                    message: "Name and parameters are required",
                });
                return;
            }
            // Initialize bacteria population using simulation engine
            const initialBacteriaFromEngine = simulation_service_1.default.initializeBacteria(parameters);
            // Convert engine bacteria to frontend-compatible format
            const frontendBacteria = initialBacteriaFromEngine.map((bacterium, index) => ({
                id: `bacteria_${index}_${Date.now()}`,
                x: bacterium.x || Math.random() * parameters.petriDishSize,
                y: bacterium.y || Math.random() * parameters.petriDishSize,
                isResistant: bacterium.isResistant || false,
                fitness: bacterium.fitness || 0.5,
                age: bacterium.age || 0,
                generation: 0,
                parentId: undefined,
                color: bacterium.isResistant ? '#ef4444' : '#22c55e', // red for resistant, green for sensitive
                size: 3 + (bacterium.fitness || 0.5) * 2 // size based on fitness (3-5px)
            }));
            // Calculate initial statistics
            const resistantCount = frontendBacteria.filter(b => b.isResistant).length;
            const sensitiveCount = frontendBacteria.length - resistantCount;
            const averageFitness = frontendBacteria.length > 0
                ? frontendBacteria.reduce((sum, b) => sum + b.fitness, 0) / frontendBacteria.length
                : 0;
            // Create simulation document with frontend-compatible structure
            const simulation = new Simulation_1.default({
                name,
                description: description || "",
                parameters,
                currentState: {
                    generation: 0,
                    timeElapsed: 0,
                    bacteria: frontendBacteria,
                    isRunning: false,
                    isPaused: false,
                    stepCount: 0,
                    simulationSpeed: 1
                },
                statistics: {
                    totalPopulation: [frontendBacteria.length],
                    resistantCount: [resistantCount],
                    sensitiveCount: [sensitiveCount],
                    averageFitness: [averageFitness],
                    mutationEvents: [0],
                    generations: [0],
                    antibioticDeaths: [0],
                    naturalDeaths: [0],
                    reproductions: [0]
                }
            });
            const savedSimulation = await simulation.save();
            res.status(201).json({
                message: "Simulation created successfully",
                simulation: savedSimulation,
            });
        }
        catch (error) {
            console.error("Error creating simulation:", error);
            res.status(500).json({
                error: "Internal server error",
                message: "Failed to create simulation",
            });
        }
    }
    /**
     * Get all simulations with pagination and filtering
     * GET /api/simulations
     */
    static async getSimulations(req, res) {
        try {
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
            const skip = (page - 1) * limit;
            // Build filter criteria
            const filter = {};
            if (req.query.status) {
                filter["currentState.isRunning"] = req.query.status === "running";
            }
            if (req.query.search) {
                filter.$or = [
                    { name: { $regex: req.query.search, $options: "i" } },
                    {
                        description: { $regex: req.query.search, $options: "i" },
                    },
                ];
            }
            // Execute query with pagination
            const [simulations, total] = await Promise.all([
                Simulation_1.default.find(filter)
                    .select("-currentState.bacteria") // Exclude bacteria array for performance
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                Simulation_1.default.countDocuments(filter),
            ]);
            res.json({
                simulations,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                    hasNext: page * limit < total,
                    hasPrev: page > 1,
                },
            });
        }
        catch (error) {
            console.error("Error fetching simulations:", error);
            res.status(500).json({
                error: "Internal server error",
                message: "Failed to fetch simulations",
            });
        }
    }
    /**
     * Get specific simulation by ID
     * GET /api/simulations/:id
     */
    static async getSimulation(req, res) {
        try {
            const { id } = req.params;
            const simulation = await Simulation_1.default.findById(id);
            if (!simulation) {
                res.status(404).json({
                    error: "Not found",
                    message: "Simulation not found",
                });
                return;
            }
            res.json({ simulation });
        }
        catch (error) {
            console.error("Error fetching simulation:", error);
            res.status(500).json({
                error: "Internal server error",
                message: "Failed to fetch simulation",
            });
        }
    }
    /**
     * Advance simulation by one generation
     * PUT /api/simulations/:id/step
     */
    static async stepSimulation(req, res) {
        try {
            const { id } = req.params;
            const simulation = await Simulation_1.default.findById(id);
            if (!simulation) {
                res.status(404).json({
                    error: "Not found",
                    message: "Simulation not found",
                });
                return;
            }
            // Check if simulation has reached duration limit
            if (simulation.currentState.generation >= simulation.parameters.duration) {
                res.status(400).json({
                    error: "Simulation completed",
                    message: "Simulation has reached its maximum duration",
                });
                return;
            }
            // Convert database bacteria to simulation format
            const simulationBacteria = simulation.currentState.bacteria.map((bacterium) => ({
                id: bacterium.id,
                x: bacterium.x,
                y: bacterium.y,
                isResistant: bacterium.isResistant,
                fitness: bacterium.fitness,
                age: bacterium.age,
                generation: bacterium.generation,
                parentId: bacterium.parentId,
                color: bacterium.color,
                size: bacterium.size,
                createdAt: bacterium.createdAt || new Date(),
                updatedAt: bacterium.updatedAt || new Date(),
            }));
            // Calculate next generation using simulation engine
            const result = simulation_service_1.default.calculateNextGeneration(simulationBacteria, simulation.parameters);
            // Convert back to database format and update simulation state
            simulation.currentState.bacteria = result.bacteria.map((bacterium) => ({
                id: bacterium.id,
                x: bacterium.x,
                y: bacterium.y,
                isResistant: bacterium.isResistant,
                fitness: bacterium.fitness,
                age: bacterium.age,
                generation: bacterium.generation,
                parentId: bacterium.parentId,
                color: bacterium.color,
                size: bacterium.size,
                createdAt: bacterium.createdAt,
                updatedAt: bacterium.updatedAt,
            }));
            simulation.currentState.generation += 1;
            simulation.currentState.timeElapsed += 1;
            simulation.currentState.stepCount += 1;
            // Update statistics
            simulation.statistics.totalPopulation.push(result.statistics.totalPopulation);
            simulation.statistics.resistantCount.push(result.statistics.resistantCount);
            simulation.statistics.sensitiveCount.push(result.statistics.sensitiveCount);
            simulation.statistics.averageFitness.push(result.statistics.averageFitness);
            simulation.statistics.mutationEvents.push(result.statistics.mutationEvents);
            simulation.statistics.generations.push(simulation.currentState.generation);
            simulation.statistics.antibioticDeaths.push(result.statistics.antibioticDeaths);
            simulation.statistics.naturalDeaths.push(result.statistics.naturalDeaths);
            simulation.statistics.reproductions.push(result.statistics.reproductions);
            // Check if simulation should be marked as completed
            if (simulation.currentState.generation >= simulation.parameters.duration) {
                simulation.currentState.isRunning = false;
                simulation.completedAt = new Date();
            }
            await simulation.save();
            res.json({
                message: "Simulation stepped successfully",
                simulation: simulation,
            });
        }
        catch (error) {
            console.error("Error stepping simulation:", error);
            res.status(500).json({
                error: "Internal server error",
                message: "Failed to step simulation",
            });
        }
    }
    /**
     * Start or resume simulation
     * PUT /api/simulations/:id/start
     */
    static async startSimulation(req, res) {
        try {
            const { id } = req.params;
            const simulation = await Simulation_1.default.findById(id);
            if (!simulation) {
                res.status(404).json({
                    error: "Not found",
                    message: "Simulation not found",
                });
                return;
            }
            if (simulation.currentState.generation >= simulation.parameters.duration) {
                res.status(400).json({
                    error: "Simulation completed",
                    message: "Simulation has already reached its maximum duration",
                });
                return;
            }
            simulation.currentState.isRunning = true;
            simulation.currentState.isPaused = false;
            await simulation.save();
            res.json({
                message: "Simulation started successfully",
                simulation: {
                    id: simulation._id,
                    isRunning: true,
                    generation: simulation.currentState.generation,
                },
            });
        }
        catch (error) {
            console.error("Error starting simulation:", error);
            res.status(500).json({
                error: "Internal server error",
                message: "Failed to start simulation",
            });
        }
    }
    /**
     * Pause simulation
     * PUT /api/simulations/:id/pause
     */
    static async pauseSimulation(req, res) {
        try {
            const { id } = req.params;
            const simulation = await Simulation_1.default.findById(id);
            if (!simulation) {
                res.status(404).json({
                    error: "Not found",
                    message: "Simulation not found",
                });
                return;
            }
            simulation.currentState.isRunning = false;
            simulation.currentState.isPaused = true;
            await simulation.save();
            res.json({
                message: "Simulation paused successfully",
                simulation: {
                    id: simulation._id,
                    isRunning: false,
                    isPaused: true,
                    generation: simulation.currentState.generation,
                },
            });
        }
        catch (error) {
            console.error("Error pausing simulation:", error);
            res.status(500).json({
                error: "Internal server error",
                message: "Failed to pause simulation",
            });
        }
    }
    /**
     * Delete simulation
     * DELETE /api/simulations/:id
     */
    static async deleteSimulation(req, res) {
        try {
            const { id } = req.params;
            const simulation = await Simulation_1.default.findByIdAndDelete(id);
            if (!simulation) {
                res.status(404).json({
                    error: "Not found",
                    message: "Simulation not found",
                });
                return;
            }
            res.json({
                message: "Simulation deleted successfully",
            });
        }
        catch (error) {
            console.error("Error deleting simulation:", error);
            res.status(500).json({
                error: "Internal server error",
                message: "Failed to delete simulation",
            });
        }
    }
    /**
     * Reset simulation to initial state
     * PUT /api/simulations/:id/reset
     */
    static async resetSimulation(req, res) {
        try {
            const { id } = req.params;
            const simulation = await Simulation_1.default.findById(id);
            if (!simulation) {
                res.status(404).json({
                    error: "Not found",
                    message: "Simulation not found",
                });
                return;
            }
            // Initialize bacteria population using simulation engine
            const initialBacteriaFromEngine = simulation_service_1.default.initializeBacteria(simulation.parameters);
            // Convert engine bacteria to frontend-compatible format
            const frontendBacteria = initialBacteriaFromEngine.map((bacterium, index) => ({
                id: `bacteria_${index}_${Date.now()}`,
                x: bacterium.x || Math.random() * simulation.parameters.petriDishSize,
                y: bacterium.y || Math.random() * simulation.parameters.petriDishSize,
                isResistant: bacterium.isResistant || false,
                fitness: bacterium.fitness || 0.5,
                age: bacterium.age || 0,
                generation: 0,
                parentId: undefined,
                color: bacterium.isResistant ? '#ef4444' : '#22c55e',
                size: 3 + (bacterium.fitness || 0.5) * 2
            }));
            // Calculate initial statistics
            const resistantCount = frontendBacteria.filter(b => b.isResistant).length;
            const sensitiveCount = frontendBacteria.length - resistantCount;
            const averageFitness = frontendBacteria.length > 0
                ? frontendBacteria.reduce((sum, b) => sum + b.fitness, 0) / frontendBacteria.length
                : 0;
            // Reset simulation state
            simulation.currentState = {
                generation: 0,
                timeElapsed: 0,
                bacteria: frontendBacteria,
                isRunning: false,
                isPaused: false,
                stepCount: 0,
                simulationSpeed: 1
            };
            // Reset statistics
            simulation.statistics = {
                totalPopulation: [frontendBacteria.length],
                resistantCount: [resistantCount],
                sensitiveCount: [sensitiveCount],
                averageFitness: [averageFitness],
                mutationEvents: [0],
                generations: [0],
                antibioticDeaths: [0],
                naturalDeaths: [0],
                reproductions: [0]
            };
            simulation.completedAt = undefined;
            await simulation.save();
            res.json({
                message: "Simulation reset successfully",
                simulation: simulation,
            });
        }
        catch (error) {
            console.error("Error resetting simulation:", error);
            res.status(500).json({
                error: "Internal server error",
                message: "Failed to reset simulation",
            });
        }
    }
    /**
     * Health check endpoint
     * GET /api/health
     */
    static async healthCheck(req, res) {
        try {
            // Check database connection
            const mongoose = require('mongoose');
            const isDbConnected = mongoose.connection.readyState === 1;
            res.json({
                status: "healthy",
                timestamp: new Date().toISOString(),
                database: {
                    connected: isDbConnected,
                    status: isDbConnected ? "connected" : "disconnected"
                },
                version: "1.0.0"
            });
        }
        catch (error) {
            console.error("Health check error:", error);
            res.status(500).json({
                status: "unhealthy",
                timestamp: new Date().toISOString(),
                error: "Health check failed"
            });
        }
    }
    /**
     * Export simulation data
     * GET /api/simulations/:id/export
     */
    static async exportSimulation(req, res) {
        try {
            const { id } = req.params;
            const format = req.query.format || "json";
            const simulation = await Simulation_1.default.findById(id);
            if (!simulation) {
                res.status(404).json({
                    error: "Not found",
                    message: "Simulation not found",
                });
                return;
            }
            const exportData = {
                simulationInfo: {
                    name: simulation.name,
                    description: simulation.description,
                    createdAt: simulation.createdAt,
                    completedAt: simulation.completedAt,
                },
                parameters: simulation.parameters,
                finalState: {
                    generation: simulation.currentState.generation,
                    totalPopulation: simulation.currentState.bacteria.length,
                    resistantCount: simulation.currentState.bacteria.filter((b) => b.isResistant).length,
                    sensitiveCount: simulation.currentState.bacteria.filter((b) => !b.isResistant).length,
                },
                statistics: simulation.statistics,
                bacteria: simulation.currentState.bacteria,
            };
            if (format === "csv") {
                // Convert statistics to CSV format
                const csvLines = [
                    "Generation,Total Population,Resistant,Sensitive,Average Fitness,Mutations,Antibiotic Deaths,Natural Deaths,Reproductions",
                ];
                for (let i = 0; i < simulation.statistics.generations.length; i++) {
                    csvLines.push([
                        simulation.statistics.generations[i],
                        simulation.statistics.totalPopulation[i],
                        simulation.statistics.resistantCount[i],
                        simulation.statistics.sensitiveCount[i],
                        simulation.statistics.averageFitness[i]?.toFixed(3) || 0,
                        simulation.statistics.mutationEvents[i],
                        simulation.statistics.antibioticDeaths[i],
                        simulation.statistics.naturalDeaths[i],
                        simulation.statistics.reproductions[i],
                    ].join(","));
                }
                res.setHeader("Content-Type", "text/csv");
                res.setHeader("Content-Disposition", `attachment; filename="simulation_${id}.csv"`);
                res.send(csvLines.join("\n"));
            }
            else {
                res.setHeader("Content-Type", "application/json");
                res.setHeader("Content-Disposition", `attachment; filename="simulation_${id}.json"`);
                res.json(exportData);
            }
        }
        catch (error) {
            console.error("Error exporting simulation:", error);
            res.status(500).json({
                error: "Internal server error",
                message: "Failed to export simulation",
            });
        }
    }
    /**
     * Update simulation speed
     * PUT /api/simulations/:id/speed
     */
    static async updateSimulationSpeed(req, res) {
        try {
            const { id } = req.params;
            const { speed } = req.body;
            // Validate speed parameter
            if (!speed || speed < 1 || speed > 10 || !Number.isInteger(speed)) {
                res.status(400).json({
                    error: "Validation error",
                    message: "Speed must be an integer between 1 and 10",
                });
                return;
            }
            const simulation = await Simulation_1.default.findById(id);
            if (!simulation) {
                res.status(404).json({
                    error: "Not found",
                    message: "Simulation not found",
                });
                return;
            }
            simulation.currentState.simulationSpeed = speed;
            await simulation.save();
            res.json({
                message: "Simulation speed updated successfully",
                simulation: {
                    id: simulation._id,
                    speed: speed,
                    isRunning: simulation.currentState.isRunning,
                    generation: simulation.currentState.generation,
                },
            });
        }
        catch (error) {
            console.error("Error updating simulation speed:", error);
            res.status(500).json({
                error: "Internal server error",
                message: "Failed to update simulation speed",
            });
        }
    }
}
exports.SimulationController = SimulationController;
exports.default = SimulationController;
