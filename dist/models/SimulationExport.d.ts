import mongoose, { Document } from 'mongoose';
export interface ISimulationExport extends Document {
    simulationId: mongoose.Types.ObjectId;
    exportFormat: string;
    exportData: string;
    exportDate: Date;
    exportSize: number;
    exportName: string;
    exportOptions?: object;
    userId?: string;
}
declare const _default: mongoose.Model<ISimulationExport, {}, {}, {}, mongoose.Document<unknown, {}, ISimulationExport, {}> & ISimulationExport & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
