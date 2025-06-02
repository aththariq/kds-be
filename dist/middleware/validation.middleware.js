"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = exports.validateObjectId = exports.validateSimulationParams = void 0;
/**
 * Validation middleware for simulation parameters
 */
const validateSimulationParams = (req, res, next) => {
    const { name, parameters, } = req.body;
    // Check if required fields exist
    if (!name) {
        res.status(400).json({
            error: "Validation error",
            message: "Simulation name is required",
        });
        return;
    }
    if (!parameters) {
        res.status(400).json({
            error: "Validation error",
            message: "Simulation parameters are required",
        });
        return;
    }
    // Validate name
    if (typeof name !== "string" || name.trim().length === 0) {
        res.status(400).json({
            error: "Validation error",
            message: "Simulation name must be a non-empty string",
        });
        return;
    }
    if (name.length > 100) {
        res.status(400).json({
            error: "Validation error",
            message: "Simulation name must be 100 characters or less",
        });
        return;
    }
    // Validate simulation parameters
    const validationErrors = [];
    // Initial Population validation
    if (typeof parameters.initialPopulation !== "number" ||
        !Number.isInteger(parameters.initialPopulation) ||
        parameters.initialPopulation < 1 ||
        parameters.initialPopulation > 10000) {
        validationErrors.push("Initial population must be an integer between 1 and 10000");
    }
    // Growth Rate validation
    if (typeof parameters.growthRate !== "number" ||
        parameters.growthRate < 0 ||
        parameters.growthRate > 1) {
        validationErrors.push("Growth rate must be a number between 0 and 1");
    }
    // Antibiotic Concentration validation
    if (typeof parameters.antibioticConcentration !== "number" ||
        parameters.antibioticConcentration < 0 ||
        parameters.antibioticConcentration > 1) {
        validationErrors.push("Antibiotic concentration must be a number between 0 and 1");
    }
    // Mutation Rate validation
    if (typeof parameters.mutationRate !== "number" ||
        parameters.mutationRate < 0 ||
        parameters.mutationRate > 1) {
        validationErrors.push("Mutation rate must be a number between 0 and 1");
    }
    // Duration validation
    if (typeof parameters.duration !== "number" ||
        !Number.isInteger(parameters.duration) ||
        parameters.duration < 1 ||
        parameters.duration > 1000) {
        validationErrors.push("Duration must be an integer between 1 and 1000");
    }
    // Petri Dish Size validation
    if (typeof parameters.petriDishSize !== "number" ||
        !Number.isInteger(parameters.petriDishSize) ||
        parameters.petriDishSize < 100 ||
        parameters.petriDishSize > 2000) {
        validationErrors.push("Petri dish size must be an integer between 100 and 2000");
    }
    // If there are validation errors, return them
    if (validationErrors.length > 0) {
        res.status(400).json({
            error: "Validation error",
            message: "Invalid simulation parameters",
            details: validationErrors,
        });
        return;
    }
    // Validation passed, proceed to next middleware
    next();
};
exports.validateSimulationParams = validateSimulationParams;
/**
 * Validation middleware for MongoDB ObjectId
 */
const validateObjectId = (req, res, next) => {
    const { id } = req.params;
    // Basic ObjectId format validation (24 character hex string)
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(id)) {
        res.status(400).json({
            error: "Validation error",
            message: "Invalid simulation ID format",
        });
        return;
    }
    next();
};
exports.validateObjectId = validateObjectId;
/**
 * General error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error("Error:", err);
    // MongoDB validation errors
    if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map((e) => e.message);
        res.status(400).json({
            error: "Validation error",
            message: "Invalid data provided",
            details: errors,
        });
        return;
    }
    // MongoDB cast errors (invalid ObjectId)
    if (err.name === "CastError") {
        res.status(400).json({
            error: "Validation error",
            message: "Invalid ID format",
        });
        return;
    }
    // MongoDB duplicate key errors
    if (err.code === 11000) {
        res.status(409).json({
            error: "Conflict",
            message: "Resource already exists",
        });
        return;
    }
    // Default server error
    res.status(500).json({
        error: "Internal server error",
        message: "Something went wrong",
    });
};
exports.errorHandler = errorHandler;
/**
 * Middleware for handling 404 routes
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        error: "Not found",
        message: `Route ${req.method} ${req.originalUrl} not found`,
    });
};
exports.notFoundHandler = notFoundHandler;
