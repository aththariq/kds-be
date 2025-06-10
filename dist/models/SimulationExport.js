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
const SimulationExportSchema = new mongoose_1.Schema({
    simulationId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.Mixed,
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
exports.default = mongoose_1.default.model('SimulationExport', SimulationExportSchema);
