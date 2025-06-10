import mongoose, { Schema, Document } from 'mongoose';

// Enhanced simulation history interface for comprehensive tracking
export interface ISimulationHistory extends Document {
  simulationId: mongoose.Types.ObjectId;
  generation: number; // Frontend uses generation instead of tick
  stepCount: number;
  timeElapsed: number;
  bacteriaCount: number;
  resistantCount: number; // Track resistant bacteria count
  sensitiveCount: number; // Track sensitive bacteria count
  averageFitness: number;
  averageResistance: number;
  mutationEvents: number; // Track mutations in this step
  antibioticDeaths: number; // Track antibiotic-related deaths
  naturalDeaths: number; // Track natural deaths
  reproductions: number; // Track reproduction events
  gridState?: string; // Compressed/serialized representation of the grid
  timestamp: Date;
}

const SimulationHistorySchema: Schema = new Schema({
  simulationId: { type: Schema.Types.ObjectId, ref: 'Simulation', required: true, index: true },
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

export default mongoose.model<ISimulationHistory>('SimulationHistory', SimulationHistorySchema); 