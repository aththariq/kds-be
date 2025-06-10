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
const BacteriumSchema = new mongoose_1.default.Schema({
    simulationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Simulation', required: true, index: true },
    bacteriumId: { type: String, required: true, index: true }, // Frontend id
    position: {
        x: { type: Number, required: true },
        y: { type: Number, required: true }
    },
    isResistant: { type: Boolean, required: true, default: false }, // Match frontend
    fitness: { type: Number, required: true, min: 0 },
    age: { type: Number, required: true, min: 0, default: 0 },
    generation: { type: Number, required: true, min: 0, default: 0 },
    parentId: { type: String, default: null }, // Match frontend string type
    color: { type: String, required: true }, // Frontend color field
    size: { type: Number, required: true, min: 1, default: 3 } // Frontend size field
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
// Virtual property for survival rate based on fitness (backward compatibility)
BacteriumSchema.virtual("survivalRate").get(function () {
    return this.fitness * 100;
});
// Virtual property for resistance value (0-1) for backward compatibility
BacteriumSchema.virtual("resistance").get(function () {
    return this.isResistant ? 0.9 : 0.1; // Convert boolean to resistance value
});
// Static method for calculating average fitness
BacteriumSchema.statics.getAverageFitness = function (bacteria) {
    if (bacteria.length === 0)
        return 0;
    const totalFitness = bacteria.reduce((sum, b) => sum + b.fitness, 0);
    return totalFitness / bacteria.length;
};
// Static method for getting resistance ratio
BacteriumSchema.statics.getResistanceRatio = function (bacteria) {
    if (bacteria.length === 0)
        return 0;
    const resistantCount = bacteria.filter(b => b.isResistant).length;
    return resistantCount / bacteria.length;
};
// Indexes for performance optimization
BacteriumSchema.index({ simulationId: 1, 'position.x': 1, 'position.y': 1 });
BacteriumSchema.index({ simulationId: 1, generation: 1 });
BacteriumSchema.index({ simulationId: 1, isResistant: 1 });
BacteriumSchema.index({ parentId: 1 });
BacteriumSchema.index({ bacteriumId: 1 }, { unique: false }); // Allow duplicates across simulations
exports.default = mongoose_1.default.model("Bacterium", BacteriumSchema);
