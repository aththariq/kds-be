import mongoose, { Document } from "mongoose";
export interface IBacterium extends Document {
    simulationId: mongoose.Types.ObjectId;
    bacteriumId: string;
    position: {
        x: number;
        y: number;
    };
    isResistant: boolean;
    fitness: number;
    age: number;
    generation: number;
    parentId?: string;
    color: string;
    size: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IBacterium, {}, {}, {}, mongoose.Document<unknown, {}, IBacterium, {}> & IBacterium & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
