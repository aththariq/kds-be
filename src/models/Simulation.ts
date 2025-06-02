import mongoose, { Schema, Document } from "mongoose";
import { IBacterium } from "./Bacterium";

export interface ISimulationParameters {
  initialPopulation: number;
  growthRate: number;
  antibioticConcentration: number;
  mutationRate: number;
  duration: number;
  petriDishSize: number;
}

export interface ISimulationState {
  generation: number;
  timeElapsed: number;
  bacteria: IBacterium[];
  isRunning: boolean;
  isPaused: boolean;
  stepCount: number;
}

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

export interface ISimulation extends Document {
  name: string;
  description?: string;
  parameters: ISimulationParameters;
  currentState: ISimulationState;
  statistics: ISimulationStatistics;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  userId?: string; // For future user management
  // Virtual properties
  isCompleted: boolean;
  progressPercentage: number;
  currentPopulation: number;
  currentResistantCount: number;
  currentSensitiveCount: number;
  // Instance methods
  addStatisticsPoint(): void;
  reset(): void;
  start(): void;
  pause(): void;
  resume(): void;
  stop(): void;
}

const SimulationParametersSchema = new Schema(
  {
    initialPopulation: {
      type: Number,
      required: true,
      min: 1,
      max: 10000,
    },
    growthRate: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    antibioticConcentration: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    mutationRate: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
      max: 1000,
    },
    petriDishSize: {
      type: Number,
      required: true,
      min: 100,
      max: 2000,
    },
  },
  { _id: false }
);

const SimulationStateSchema = new Schema(
  {
    generation: {
      type: Number,
      default: 0,
      min: 0,
    },
    timeElapsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    bacteria: [
      {
        id: { type: String, required: true },
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        isResistant: { type: Boolean, default: false },
        fitness: { type: Number, required: true },
        age: { type: Number, default: 0 },
        generation: { type: Number, default: 0 },
        parentId: { type: String },
        color: { type: String, required: true },
        size: { type: Number, required: true },
      },
    ],
    isRunning: {
      type: Boolean,
      default: false,
    },
    isPaused: {
      type: Boolean,
      default: false,
    },
    stepCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const SimulationStatisticsSchema = new Schema(
  {
    totalPopulation: {
      type: [Number],
      default: [],
    },
    resistantCount: {
      type: [Number],
      default: [],
    },
    sensitiveCount: {
      type: [Number],
      default: [],
    },
    averageFitness: {
      type: [Number],
      default: [],
    },
    mutationEvents: {
      type: [Number],
      default: [],
    },
    generations: {
      type: [Number],
      default: [],
    },
    antibioticDeaths: {
      type: [Number],
      default: [],
    },
    naturalDeaths: {
      type: [Number],
      default: [],
    },
    reproductions: {
      type: [Number],
      default: [],
    },
  },
  { _id: false }
);

const SimulationSchema: Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    parameters: {
      type: SimulationParametersSchema,
      required: true,
    },
    currentState: {
      type: SimulationStateSchema,
      required: true,
      default: () => ({
        generation: 0,
        timeElapsed: 0,
        bacteria: [],
        isRunning: false,
        isPaused: false,
        stepCount: 0,
      }),
    },
    statistics: {
      type: SimulationStatisticsSchema,
      required: true,
      default: () => ({
        totalPopulation: [],
        resistantCount: [],
        sensitiveCount: [],
        averageFitness: [],
        mutationEvents: [],
        generations: [],
        antibioticDeaths: [],
        naturalDeaths: [],
        reproductions: [],
      }),
    },
    completedAt: {
      type: Date,
    },
    userId: {
      type: String,
      index: true, // For future user-based filtering
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual properties
SimulationSchema.virtual("isCompleted").get(function (this: ISimulation) {
  return this.currentState.timeElapsed >= this.parameters.duration;
});

SimulationSchema.virtual("progressPercentage").get(function (
  this: ISimulation
) {
  return Math.min(
    100,
    (this.currentState.timeElapsed / this.parameters.duration) * 100
  );
});

SimulationSchema.virtual("currentPopulation").get(function (this: ISimulation) {
  return this.currentState.bacteria.length;
});

SimulationSchema.virtual("currentResistantCount").get(function (
  this: ISimulation
) {
  return this.currentState.bacteria.filter((b) => b.isResistant).length;
});

SimulationSchema.virtual("currentSensitiveCount").get(function (
  this: ISimulation
) {
  return this.currentState.bacteria.filter((b) => !b.isResistant).length;
});

// Instance methods
SimulationSchema.methods.addStatisticsPoint = function () {
  const bacteria = this.currentState.bacteria;

  this.statistics.totalPopulation.push(bacteria.length);
  this.statistics.resistantCount.push(
    bacteria.filter((b: any) => b.isResistant).length
  );
  this.statistics.sensitiveCount.push(
    bacteria.filter((b: any) => !b.isResistant).length
  );

  const averageFitness =
    bacteria.length > 0
      ? bacteria.reduce((sum: number, b: any) => sum + b.fitness, 0) /
        bacteria.length
      : 0;
  this.statistics.averageFitness.push(averageFitness);

  this.statistics.generations.push(this.currentState.generation);
};

SimulationSchema.methods.reset = function () {
  this.currentState = {
    generation: 0,
    timeElapsed: 0,
    bacteria: [],
    isRunning: false,
    isPaused: false,
    stepCount: 0,
  };

  this.statistics = {
    totalPopulation: [],
    resistantCount: [],
    sensitiveCount: [],
    averageFitness: [],
    mutationEvents: [],
    generations: [],
    antibioticDeaths: [],
    naturalDeaths: [],
    reproductions: [],
  };

  this.completedAt = undefined;
};

SimulationSchema.methods.start = function () {
  this.currentState.isRunning = true;
  this.currentState.isPaused = false;
};

SimulationSchema.methods.pause = function () {
  this.currentState.isPaused = true;
};

SimulationSchema.methods.resume = function () {
  this.currentState.isPaused = false;
};

SimulationSchema.methods.stop = function () {
  this.currentState.isRunning = false;
  this.currentState.isPaused = false;
  this.completedAt = new Date();
};

// Static methods
SimulationSchema.statics.findByStatus = function (isRunning: boolean) {
  return this.find({ "currentState.isRunning": isRunning });
};

SimulationSchema.statics.findCompleted = function () {
  return this.find({ completedAt: { $exists: true } });
};

SimulationSchema.statics.findInProgress = function () {
  return this.find({
    "currentState.isRunning": true,
    completedAt: { $exists: false },
  });
};

// Indexes for performance optimization
SimulationSchema.index({ createdAt: -1 });
SimulationSchema.index({ "currentState.isRunning": 1 });
SimulationSchema.index({ userId: 1, createdAt: -1 });
SimulationSchema.index({ name: "text", description: "text" }); // Text search

export default mongoose.model<ISimulation>("Simulation", SimulationSchema);
