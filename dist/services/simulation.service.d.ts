import { ISimulationParameters } from "../models";
export interface SimulationBacterium {
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
    createdAt: Date;
    updatedAt: Date;
}
export interface SimulationStepResult {
    bacteria: SimulationBacterium[];
    statistics: {
        totalPopulation: number;
        resistantCount: number;
        sensitiveCount: number;
        averageFitness: number;
        mutationEvents: number;
        antibioticDeaths: number;
        naturalDeaths: number;
        reproductions: number;
    };
}
export interface Position {
    x: number;
    y: number;
}
/**
 * Core simulation engine for bacteria population dynamics
 * Implements mathematical models for growth, antibiotic effects, and mutations
 */
export declare class SimulationEngine {
    private static readonly DEFAULT_COLORS;
    /**
     * Initialize bacteria population with random placement in petri dish
     * @param params - Simulation parameters
     * @returns Array of initial bacteria
     */
    static initializeBacteria(params: ISimulationParameters): SimulationBacterium[];
    /**
     * Calculate next generation based on current bacteria and parameters
     * @param bacteria - Current bacteria population
     * @param params - Simulation parameters
     * @returns Results of the simulation step
     */
    static calculateNextGeneration(bacteria: SimulationBacterium[], params: ISimulationParameters): SimulationStepResult;
    /**
     * Apply antibiotic effect using exponential survival model
     * Survival probability S = e^(-k×C×(1-resistance_factor))
     * @param bacterium - Bacterium to test survival
     * @param concentration - Antibiotic concentration (0-1)
     * @returns true if bacterium survives
     */
    static applyAntibioticEffect(bacterium: SimulationBacterium, concentration: number): boolean;
    /**
     * Apply natural death based on age and fitness
     * @param bacterium - Bacterium to check for natural death
     * @returns true if bacterium survives
     */
    static applyNaturalDeath(bacterium: SimulationBacterium): boolean;
    /**
     * Determine if a bacterium should reproduce based on population dynamics
     * @param bacterium - Bacterium to check for reproduction
     * @param params - Simulation parameters
     * @param currentPopulation - Current population size
     * @param carryingCapacity - Maximum sustainable population
     * @returns true if bacterium should reproduce
     */
    static shouldReproduce(bacterium: SimulationBacterium, params: ISimulationParameters, currentPopulation: number, carryingCapacity: number): boolean;
    /**
     * Create offspring bacterium near parent with some variation
     * @param parent - Parent bacterium
     * @param params - Simulation parameters
     * @returns New bacterium or null if placement failed
     */
    static reproduceBacterium(parent: SimulationBacterium, params: ISimulationParameters): SimulationBacterium | null;
    /**
     * Process mutations for a bacterium
     * @param bacterium - Bacterium to potentially mutate
     * @param mutationRate - Base mutation rate
     * @returns Object with mutated bacterium and mutation flag
     */
    static processMutations(bacterium: SimulationBacterium, mutationRate: number): {
        bacterium: SimulationBacterium;
        hasMutated: boolean;
    };
    /**
     * Calculate comprehensive statistics for current population
     * @param bacteria - Current bacteria population
     * @returns Statistics object
     */
    static calculateStatistics(bacteria: SimulationBacterium[]): {
        totalPopulation: number;
        resistantCount: number;
        sensitiveCount: number;
        averageFitness: number;
        mutationEvents: number;
        antibioticDeaths: number;
        naturalDeaths: number;
        reproductions: number;
    };
    /**
     * Generate random position within circular petri dish
     * @param center - Center point of the petri dish
     * @param radius - Radius of the petri dish
     * @returns Random position within circle
     */
    static generateRandomPositionInCircle(center: Position, radius: number): Position;
    /**
     * Generate initial fitness value based on resistance status
     * @param isResistant - Whether bacterium is resistant
     * @returns Initial fitness value
     */
    private static generateInitialFitness;
    /**
     * Calculate carrying capacity based on petri dish size
     * @param params - Simulation parameters
     * @returns Maximum sustainable population
     */
    private static calculateCarryingCapacity;
    /**
     * Find suitable position for offspring near parent
     * @param parent - Parent bacterium
     * @param params - Simulation parameters
     * @returns Position for offspring or null if no suitable position
     */
    static findOffspringPosition(parent: SimulationBacterium, params: ISimulationParameters): Position | null;
}
export default SimulationEngine;
