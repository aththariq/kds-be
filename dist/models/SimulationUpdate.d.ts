import mongoose, { Document } from 'mongoose';
export interface ISimulationUpdate extends Document {
    simulationId: mongoose.Types.ObjectId;
    updateType: string;
    updateData: object;
    generation: number;
    timestamp: Date;
    priority: number;
    processed: boolean;
    clientId?: string;
}
declare const _default: mongoose.Model<ISimulationUpdate, {}, {}, {}, mongoose.Document<unknown, {}, ISimulationUpdate, {}> & ISimulationUpdate & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
