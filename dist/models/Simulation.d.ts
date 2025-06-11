import mongoose, { Document } from "mongoose";
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
    userId?: string;
    isCompleted: boolean;
    progressPercentage: number;
    currentPopulation: number;
    currentResistantCount: number;
    currentSensitiveCount: number;
    addStatisticsPoint(): void;
    reset(): void;
    start(): void;
    pause(): void;
    resume(): void;
    stop(): void;
}
declare const _default: mongoose.Model<ISimulation, {}, {}, {}, mongoose.Document<unknown, {}, ISimulation, {}> & ISimulation & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
