import mongoose, { Schema, Document } from 'mongoose';

// Interface for simulation export tracking
export interface ISimulationExport extends Document {
  simulationId: mongoose.Types.ObjectId;
  exportFormat: string; // 'json', 'csv', etc.
  exportData: string; // Stringified data or file reference
  exportDate: Date;
  exportSize: number; // Size in bytes
  exportName: string;
  exportOptions?: object; // Additional export configuration
  userId?: string; // User who performed the export
}

const SimulationExportSchema: Schema = new Schema({
  simulationId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Simulation', 
    required: true, 
    index: true 
  },
  exportFormat: { 
    type: String, 
    required: true, 
    enum: ['json', 'csv', 'binary'],
    lowercase: true
  },
  exportData: { 
    type: String, 
    required: true 
  },
  exportDate: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  exportSize: { 
    type: Number, 
    required: true,
    min: 0
  },
  exportName: { 
    type: String, 
    required: true,
    trim: true
  },
  exportOptions: {
    type: Schema.Types.Mixed,
    default: {}
  },
  userId: {
    type: String,
    index: true
  }
});

// Indexes for efficient querying
SimulationExportSchema.index({ exportDate: -1 });
SimulationExportSchema.index({ simulationId: 1, exportDate: -1 });
SimulationExportSchema.index({ userId: 1, exportDate: -1 });

// TTL index to automatically remove old exports after 90 days
SimulationExportSchema.index({ exportDate: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default mongoose.model<ISimulationExport>('SimulationExport', SimulationExportSchema); 