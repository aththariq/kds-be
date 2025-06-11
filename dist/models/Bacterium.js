"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const BacteriumSchema = new mongoose_1.default.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    x: {
        type: Number,
        required: true,
        min: 0,
        max: 1000, // Default petri dish size constraint
    },
    y: {
        type: Number,
        required: true,
        min: 0,
        max: 1000, // Default petri dish size constraint
    },
    isResistant: {
        type: Boolean,
        default: false,
        index: true, // For efficient filtering
    },
    fitness: {
        type: Number,
        required: true,
        min: 0,
        max: 1,
    },
    age: {
        type: Number,
        default: 0,
        min: 0,
    },
    generation: {
        type: Number,
        default: 0,
        min: 0,
        index: true, // For efficient filtering by generation
    },
    parentId: {
        type: String,
        index: true, // For efficient parent-child queries
    },
    color: {
        type: String,
        required: true,
        enum: [
            "#ff4444",
            "#44ff44",
            "#4444ff",
            "#ffff44",
            "#ff44ff",
            "#44ffff",
            "#ffffff",
        ],
    },
    size: {
        type: Number,
        required: true,
        min: 1,
        max: 10,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Virtual property for survival rate based on fitness
BacteriumSchema.virtual("survivalRate").get(function () {
    return this.fitness * 100;
});
// Virtual property to check if bacterium is elderly (for natural death simulation)
BacteriumSchema.virtual("isElderly").get(function () {
    return this.age > 50; // Arbitrary threshold for bacterial aging
});
// Instance methods
BacteriumSchema.methods.mutate = function (mutationRate) {
    if (Math.random() < mutationRate) {
        this.isResistant = !this.isResistant;
        this.fitness = Math.max(0, Math.min(1, this.fitness + (Math.random() - 0.5) * 0.2));
        return true;
    }
    return false;
};
BacteriumSchema.methods.reproduce = function (newPosition) {
    return {
        id: `${this.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        x: newPosition.x,
        y: newPosition.y,
        isResistant: this.isResistant,
        fitness: this.fitness,
        age: 0,
        generation: this.generation + 1,
        parentId: this.id,
        color: this.color,
        size: Math.max(1, this.size + (Math.random() - 0.5)),
    };
};
// Static methods
BacteriumSchema.statics.getResistantCount = function (bacteria) {
    return bacteria.filter((b) => b.isResistant).length;
};
BacteriumSchema.statics.getSensitiveCount = function (bacteria) {
    return bacteria.filter((b) => !b.isResistant).length;
};
BacteriumSchema.statics.getAverageFitness = function (bacteria) {
    if (bacteria.length === 0)
        return 0;
    const totalFitness = bacteria.reduce((sum, b) => sum + b.fitness, 0);
    return totalFitness / bacteria.length;
};
// Indexes for performance optimization
BacteriumSchema.index({ generation: 1, isResistant: 1 });
BacteriumSchema.index({ x: 1, y: 1 }); // For spatial queries
BacteriumSchema.index({ parentId: 1, generation: 1 }); // For lineage tracking
exports.default = mongoose_1.default.model("Bacterium", BacteriumSchema);
