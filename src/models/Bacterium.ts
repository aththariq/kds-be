import mongoose, { Schema, Document } from "mongoose";

export interface IBacterium extends Document {
  id: string;
  x: number;
  y: number;
  isResistant: boolean;
  fitness: number;
  age: number;
  generation: number;
  parentId?: string;
  color: string;
  size: number;
  createdAt: Date;
  updatedAt: Date;
  // Virtual properties
  survivalRate: number;
  isElderly: boolean;
  // Instance methods
  mutate(mutationRate: number): boolean;
  reproduce(newPosition: { x: number; y: number }): Partial<IBacterium>;
}

const BacteriumSchema: Schema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property for survival rate based on fitness
BacteriumSchema.virtual("survivalRate").get(function (this: IBacterium) {
  return this.fitness * 100;
});

// Virtual property to check if bacterium is elderly (for natural death simulation)
BacteriumSchema.virtual("isElderly").get(function (this: IBacterium) {
  return this.age > 50; // Arbitrary threshold for bacterial aging
});

// Instance methods
BacteriumSchema.methods.mutate = function (mutationRate: number): boolean {
  if (Math.random() < mutationRate) {
    this.isResistant = !this.isResistant;
    this.fitness = Math.max(
      0,
      Math.min(1, this.fitness + (Math.random() - 0.5) * 0.2)
    );
    return true;
  }
  return false;
};

BacteriumSchema.methods.reproduce = function (newPosition: {
  x: number;
  y: number;
}): Partial<IBacterium> {
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
BacteriumSchema.statics.getResistantCount = function (bacteria: IBacterium[]) {
  return bacteria.filter((b) => b.isResistant).length;
};

BacteriumSchema.statics.getSensitiveCount = function (bacteria: IBacterium[]) {
  return bacteria.filter((b) => !b.isResistant).length;
};

BacteriumSchema.statics.getAverageFitness = function (bacteria: IBacterium[]) {
  if (bacteria.length === 0) return 0;
  const totalFitness = bacteria.reduce((sum, b) => sum + b.fitness, 0);
  return totalFitness / bacteria.length;
};

// Indexes for performance optimization
BacteriumSchema.index({ generation: 1, isResistant: 1 });
BacteriumSchema.index({ x: 1, y: 1 }); // For spatial queries
BacteriumSchema.index({ parentId: 1, generation: 1 }); // For lineage tracking

export default mongoose.model<IBacterium>("Bacterium", BacteriumSchema);
