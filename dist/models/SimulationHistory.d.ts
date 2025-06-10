import mongoose, { Document } from 'mongoose';
export interface ISimulationHistory extends Document {
    simulationId: mongoose.Types.ObjectId;
    generation: number;
    stepCount: number;
    timeElapsed: number;
    bacteriaCount: number;
    resistantCount: number;
    sensitiveCount: number;
    averageFitness: number;
    averageResistance: number;
    mutationEvents: number;
    antibioticDeaths: number;
    naturalDeaths: number;
    reproductions: number;
    gridState?: string;
    timestamp: Date;
}
declare const _default: mongoose.Model<ISimulationHistory, {}, {}, {}, mongoose.Document<unknown, {}, ISimulationHistory, {}> & ISimulationHistory & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
