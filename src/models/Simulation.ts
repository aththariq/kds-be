import mongoose, { Schema, Document } from "mongoose";

// Frontend-compatible parameter interface matching Zod schema
export interface ISimulationParameters {
  initialPopulation: number; // 1-1000, int
  growthRate: number; // 0.001-1.0, decimal
  antibioticConcentration: number; // 0-1.0, decimal
  mutationRate: number; // 0-0.1, decimal
  duration: number; // 1-1000 generations, int
  petriDishSize: number; // 100-800 pixels, int
}

// Frontend-compatible Bacterium interface
export interface IBacterium {
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
}

// Frontend-compatible SimulationState  
export interface ISimulationState {
  generation: number;
  timeElapsed: number;
  bacteria: IBacterium[];
  isRunning: boolean;
  isPaused: boolean;
  stepCount: number;
  simulationSpeed: number; // 1-10, default: 1
}

// Frontend-compatible SimulationStatistics (time series arrays)
export interface ISimulationStatistics {
  totalPopulation: number[];
  resistantCount: number[];
  sensitiveCount: number[];
  averageFitness: number[];
  mutationEvents: number[];
  generations: number[];
  antibioticDeaths: number[];
  naturalDeaths: number[];
  reproductions: number[];
}

// Additional metadata interface for enhanced functionality
export interface ISimulationMetadata {
  performanceMetrics: {
    averageStepTime: number;
    peakMemoryUsage: number;
  };
  complexityMetrics: {
    maxPopulation: number;
    generationalDiversity: number;
  };
  tags: string[];
  category: string;
  description: string;
  favorite: boolean;
}

export interface ISimulation extends Document {
  name: string;
  description?: string;
  parameters: ISimulationParameters;
  currentState: ISimulationState;
  statistics: ISimulationStatistics;
  metadata: ISimulationMetadata;
  lastRunAt?: Date;
  userId?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SimulationSchema: Schema = new Schema({
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
SimulationSchema.methods.validateParameters = function() {
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

export default mongoose.model<ISimulation>("Simulation", SimulationSchema);
