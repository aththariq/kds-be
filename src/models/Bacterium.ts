import mongoose, { Schema, Document } from "mongoose";

// Frontend-compatible bacterium interface
export interface IBacterium extends Document {
  simulationId: mongoose.Types.ObjectId;
  bacteriumId: string; // Frontend id field
  position: { x: number; y: number };
  isResistant: boolean; // Frontend uses isResistant instead of resistance
  fitness: number;
  age: number;
  generation: number;
  parentId?: string; // Frontend uses string, not ObjectId
  color: string; // Frontend color field
  size: number; // Frontend size field
  createdAt: Date;
  updatedAt: Date;
}

const BacteriumSchema: Schema = new mongoose.Schema(
  {
    simulationId: { type: Schema.Types.ObjectId, ref: 'Simulation', required: true, index: true },
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
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual property for survival rate based on fitness (backward compatibility)
BacteriumSchema.virtual("survivalRate").get(function (this: IBacterium) {
  return this.fitness * 100;
});

// Virtual property for resistance value (0-1) for backward compatibility
BacteriumSchema.virtual("resistance").get(function (this: IBacterium) {
  return this.isResistant ? 0.9 : 0.1; // Convert boolean to resistance value
});

// Static method for calculating average fitness
BacteriumSchema.statics.getAverageFitness = function (bacteria: IBacterium[]) {
  if (bacteria.length === 0) return 0;
  const totalFitness = bacteria.reduce((sum, b) => sum + b.fitness, 0);
  return totalFitness / bacteria.length;
};

// Static method for getting resistance ratio
BacteriumSchema.statics.getResistanceRatio = function (bacteria: IBacterium[]) {
  if (bacteria.length === 0) return 0;
  const resistantCount = bacteria.filter(b => b.isResistant).length;
  return resistantCount / bacteria.length;
};

// Indexes for performance optimization
BacteriumSchema.index({ simulationId: 1, 'position.x': 1, 'position.y': 1 });
BacteriumSchema.index({ simulationId: 1, generation: 1 });
BacteriumSchema.index({ simulationId: 1, isResistant: 1 });
BacteriumSchema.index({ parentId: 1 });
BacteriumSchema.index({ bacteriumId: 1 }, { unique: false }); // Allow duplicates across simulations

export default mongoose.model<IBacterium>("Bacterium", BacteriumSchema);
