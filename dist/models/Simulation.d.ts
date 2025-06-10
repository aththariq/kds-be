import mongoose, { Document } from "mongoose";
export interface ISimulationParameters {
    initialPopulation: number;
    growthRate: number;
    antibioticConcentration: number;
    mutationRate: number;
    duration: number;
    petriDishSize: number;
}
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
export interface ISimulationState {
    generation: number;
    timeElapsed: number;
    bacteria: IBacterium[];
    isRunning: boolean;
    isPaused: boolean;
    stepCount: number;
    simulationSpeed: number;
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
declare const _default: mongoose.Model<ISimulation, {}, {}, {}, mongoose.Document<unknown, {}, ISimulation, {}> & ISimulation & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
