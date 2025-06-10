import mongoose, { Schema, Document } from 'mongoose';

// Interface for real-time simulation updates
export interface ISimulationUpdate extends Document {
  simulationId: mongoose.Types.ObjectId;
  updateType: string; // 'state', 'bacteria', 'statistics', 'parameters'
  updateData: object; // The actual update data
  generation: number; // Generation when update occurred
  timestamp: Date;
  priority: number; // Update priority (1-5, 5 being highest)
  processed: boolean; // Whether update has been processed
  clientId?: string; // Client that triggered the update
}

const SimulationUpdateSchema: Schema = new Schema({
  simulationId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Simulation', 
    required: true, 
    index: true 
  },
  updateType: { 
    type: String, 
    required: true, 
    enum: ['state', 'bacteria', 'statistics', 'parameters', 'metadata'],
    index: true
  },
  updateData: { 
    type: Schema.Types.Mixed, 
    required: true 
  },
  generation: {
    type: Number,
    required: true,
    index: true
  },
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  priority: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 3,
    index: true
  },
  processed: {
    type: Boolean,
    default: false,
    index: true
  },
  clientId: {
    type: String,
    index: true
  }
});

// Compound indexes for efficient querying
SimulationUpdateSchema.index({ simulationId: 1, timestamp: -1 });
SimulationUpdateSchema.index({ simulationId: 1, generation: 1 });
SimulationUpdateSchema.index({ processed: 1, priority: -1, timestamp: 1 });

// TTL index to automatically remove old updates after 1 hour
SimulationUpdateSchema.index({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 });

export default mongoose.model<ISimulationUpdate>('SimulationUpdate', SimulationUpdateSchema); 