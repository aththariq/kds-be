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
const SimulationHistorySchema = new mongoose_1.Schema({
    simulationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Simulation', required: true, index: true },
    generation: { type: Number, required: true }, // Match frontend terminology
    stepCount: { type: Number, required: true },
    timeElapsed: { type: Number, required: true },
    bacteriaCount: { type: Number, required: true },
    resistantCount: { type: Number, required: true },
    sensitiveCount: { type: Number, required: true },
    averageFitness: { type: Number, required: true },
    averageResistance: { type: Number, required: true },
    mutationEvents: { type: Number, required: true, default: 0 },
    antibioticDeaths: { type: Number, required: true, default: 0 },
    naturalDeaths: { type: Number, required: true, default: 0 },
    reproductions: { type: Number, required: true, default: 0 },
    gridState: { type: String, required: false }, // Optional compressed state
    timestamp: { type: Date, default: Date.now }
});
// Compound index for efficient time-series querying
SimulationHistorySchema.index({ simulationId: 1, generation: 1 }, { unique: true });
// Additional indexes for analytics
SimulationHistorySchema.index({ simulationId: 1, timestamp: -1 });
SimulationHistorySchema.index({ simulationId: 1, bacteriaCount: -1 });
// TTL Index: Remove history data older than 30 days (configurable)
SimulationHistorySchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
exports.default = mongoose_1.default.model('SimulationHistory', SimulationHistorySchema);
