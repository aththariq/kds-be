"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const SimulationSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        default: "",
        maxlength: 500
    },
    parameters: {
        initialPopulation: {
            type: Number,
            required: true,
            min: 1,
            max: 1000
        },
        growthRate: {
            type: Number,
            required: true,
            min: 0.001,
            max: 1
        },
        antibioticConcentration: {
            type: Number,
            required: true,
            min: 0,
            max: 1
        },
        mutationRate: {
            type: Number,
            required: true,
            min: 0,
            max: 0.1
        },
        duration: {
            type: Number,
            required: true,
            min: 1,
            max: 1000
        },
        petriDishSize: {
            type: Number,
            required: true,
            min: 100,
            max: 800,
            default: 600
        }
    },
    // Updated currentState to match frontend expectations
    currentState: {
        generation: { type: Number, default: 0 },
        timeElapsed: { type: Number, default: 0 }, // in milliseconds
        bacteria: [{
                id: { type: String, required: true },
                x: { type: Number, required: true },
                y: { type: Number, required: true },
                isResistant: { type: Boolean, required: true },
                fitness: { type: Number, required: true },
                age: { type: Number, required: true },
                generation: { type: Number, required: true },
                parentId: { type: String },
                color: { type: String, required: true },
                size: { type: Number, required: true }
            }],
        isRunning: { type: Boolean, default: false },
        isPaused: { type: Boolean, default: false },
        stepCount: { type: Number, default: 0 },
        simulationSpeed: {
            type: Number,
            default: 1,
            min: 1,
            max: 10,
            validate: {
                validator: Number.isInteger,
                message: 'Simulation speed must be an integer'
            }
        }
    },
    // Updated statistics to match frontend expectations (time series arrays)
    statistics: {
        totalPopulation: [{ type: Number }],
        resistantCount: [{ type: Number }],
        sensitiveCount: [{ type: Number }],
        averageFitness: [{ type: Number }],
        mutationEvents: [{ type: Number }],
        generations: [{ type: Number }],
        antibioticDeaths: [{ type: Number }],
        naturalDeaths: [{ type: Number }],
        reproductions: [{ type: Number }]
    },
    metadata: {
        performanceMetrics: {
            averageStepTime: { type: Number, default: 0 },
            peakMemoryUsage: { type: Number, default: 0 }
        },
        complexityMetrics: {
            maxPopulation: { type: Number, default: 0 },
            generationalDiversity: { type: Number, default: 0 }
        },
        tags: [{ type: String, trim: true }],
        category: { type: String, trim: true, default: 'uncategorized' },
        description: { type: String, trim: true, default: '' },
        favorite: { type: Boolean, default: false }
    },
    lastRunAt: { type: Date, required: false },
    userId: { type: String, index: true, required: false },
    completedAt: { type: Date, required: false },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Validation method to ensure frontend compatibility
SimulationSchema.methods.validateParameters = function () {
    // Validate integer fields
    if (!Number.isInteger(this.parameters.initialPopulation)) {
        throw new Error('Initial population must be an integer');
    }
    if (!Number.isInteger(this.parameters.duration)) {
        throw new Error('Duration must be an integer');
    }
    if (!Number.isInteger(this.parameters.petriDishSize)) {
        throw new Error('Petri dish size must be an integer');
    }
    // Validate ranges to match frontend Zod schema
    if (this.parameters.growthRate < 0.001 || this.parameters.growthRate > 1.0) {
        throw new Error('Growth rate must be between 0.001 and 1.0');
    }
    if (this.parameters.mutationRate < 0 || this.parameters.mutationRate > 0.1) {
        throw new Error('Mutation rate must be between 0 and 0.1');
    }
    if (this.parameters.antibioticConcentration < 0 || this.parameters.antibioticConcentration > 1.0) {
        throw new Error('Antibiotic concentration must be between 0 and 1.0');
    }
};
// Add indexes for efficient querying
SimulationSchema.index({ createdAt: -1 });
SimulationSchema.index({ 'currentState.generation': 1 });
SimulationSchema.index({ 'metadata.tags': 1 });
SimulationSchema.index({ 'metadata.category': 1 });
SimulationSchema.index({ 'metadata.favorite': 1 });
SimulationSchema.index({ userId: 1, createdAt: -1 });
exports.default = mongoose_1.default.model("Simulation", SimulationSchema);
