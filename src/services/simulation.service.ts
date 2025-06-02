import { IBacterium, ISimulationParameters } from "../models";
import { ISimulationStatistics } from "../models/Simulation";

// Plain object interface for simulation data (without Mongoose Document methods)
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
export class SimulationEngine {
  private static readonly DEFAULT_COLORS = [
    "#44ff44", // Green for sensitive
    "#ff4444", // Red for resistant
    "#4444ff", // Blue variant
    "#ffff44", // Yellow variant
    "#ff44ff", // Magenta variant
    "#44ffff", // Cyan variant
  ];

  /**
   * Initialize bacteria population with random placement in petri dish
   * @param params - Simulation parameters
   * @returns Array of initial bacteria
   */
  static initializeBacteria(
    params: ISimulationParameters
  ): SimulationBacterium[] {
    const bacteria: SimulationBacterium[] = [];
    const radius = params.petriDishSize / 2;
    const center = { x: radius, y: radius };

    for (let i = 0; i < params.initialPopulation; i++) {
      const position = this.generateRandomPositionInCircle(center, radius);
      const isResistant = Math.random() < 0.1; // 10% initial resistance

      bacteria.push({
        id: `bacteria_${i}_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        x: position.x,
        y: position.y,
        isResistant,
        fitness: this.generateInitialFitness(isResistant),
        age: 0,
        generation: 0,
        parentId: undefined,
        color: isResistant ? this.DEFAULT_COLORS[1] : this.DEFAULT_COLORS[0],
        size: Math.random() * 3 + 2, // Size between 2-5
        createdAt: new Date(),
        updatedAt: new Date(),
      } as SimulationBacterium);
    }

    return bacteria;
  }

  /**
   * Calculate next generation based on current bacteria and parameters
   * @param bacteria - Current bacteria population
   * @param params - Simulation parameters
   * @returns Results of the simulation step
   */
  static calculateNextGeneration(
    bacteria: SimulationBacterium[],
    params: ISimulationParameters
  ): SimulationStepResult {
    let mutationEvents = 0;
    let antibioticDeaths = 0;
    let naturalDeaths = 0;
    let reproductions = 0;

    // Step 1: Age all bacteria
    const agedBacteria = bacteria.map((bacterium) => ({
      ...bacterium,
      age: (bacterium.age || 0) + 1,
      updatedAt: new Date(),
    }));

    // Step 2: Apply antibiotic effects
    const survivors = agedBacteria.filter((bacterium) => {
      const survived = this.applyAntibioticEffect(
        bacterium,
        params.antibioticConcentration
      );
      if (!survived) antibioticDeaths++;
      return survived;
    });

    // Step 3: Apply natural death (age-related)
    const livingBacteria = survivors.filter((bacterium) => {
      const survived = this.applyNaturalDeath(bacterium);
      if (!survived) naturalDeaths++;
      return survived;
    });

    // Step 4: Calculate carrying capacity and determine reproduction
    const carryingCapacity = this.calculateCarryingCapacity(params);
    const currentPopulation = livingBacteria.length;

    // Only reproduce if under carrying capacity
    const offspring: SimulationBacterium[] = [];
    if (currentPopulation < carryingCapacity) {
      for (const bacterium of livingBacteria) {
        if (
          this.shouldReproduce(
            bacterium,
            params,
            currentPopulation,
            carryingCapacity
          )
        ) {
          const child = this.reproduceBacterium(bacterium, params);
          if (child) {
            offspring.push(child);
            reproductions++;
          }
        }
      }
    }

    // Step 5: Apply mutations to all bacteria (parents and offspring)
    const allBacteria = [...livingBacteria, ...offspring];
    const mutatedBacteria = allBacteria.map((bacterium) => {
      const mutated = this.processMutations(bacterium, params.mutationRate);
      if (mutated.hasMutated) mutationEvents++;
      return mutated.bacterium;
    });

    // Step 6: Calculate statistics
    const statistics = this.calculateStatistics(mutatedBacteria);
    statistics.mutationEvents = mutationEvents;
    statistics.antibioticDeaths = antibioticDeaths;
    statistics.naturalDeaths = naturalDeaths;
    statistics.reproductions = reproductions;

    return {
      bacteria: mutatedBacteria,
      statistics,
    };
  }

  /**
   * Apply antibiotic effect using exponential survival model
   * Survival probability S = e^(-k×C×(1-resistance_factor))
   * @param bacterium - Bacterium to test survival
   * @param concentration - Antibiotic concentration (0-1)
   * @returns true if bacterium survives
   */
  static applyAntibioticEffect(
    bacterium: SimulationBacterium,
    concentration: number
  ): boolean {
    if (concentration === 0) return true;

    // Resistance factor: resistant bacteria have higher survival
    const resistanceFactor = bacterium.isResistant ? 0.9 : 0.1;

    // Kill constant (affects how deadly the antibiotic is)
    const killConstant = 3.0;

    // Survival probability calculation
    const effectiveConcentration = concentration * (1 - resistanceFactor);
    const survivalProbability = Math.exp(
      -killConstant * effectiveConcentration
    );

    return Math.random() < survivalProbability;
  }

  /**
   * Apply natural death based on age and fitness
   * @param bacterium - Bacterium to check for natural death
   * @returns true if bacterium survives
   */
  static applyNaturalDeath(bacterium: SimulationBacterium): boolean {
    const age = bacterium.age || 0;
    const fitness = bacterium.fitness || 0.5;

    // Age-related death probability increases with age
    const ageDeathRate = Math.min(0.1, age * 0.001);

    // Fitness affects survival (lower fitness = higher death rate)
    const fitnessDeathRate = (1 - fitness) * 0.02;

    const totalDeathRate = ageDeathRate + fitnessDeathRate;

    return Math.random() > totalDeathRate;
  }

  /**
   * Determine if a bacterium should reproduce based on population dynamics
   * @param bacterium - Bacterium to check for reproduction
   * @param params - Simulation parameters
   * @param currentPopulation - Current population size
   * @param carryingCapacity - Maximum sustainable population
   * @returns true if bacterium should reproduce
   */
  static shouldReproduce(
    bacterium: SimulationBacterium,
    params: ISimulationParameters,
    currentPopulation: number,
    carryingCapacity: number
  ): boolean {
    // Population pressure reduces reproduction probability
    const populationPressure = currentPopulation / carryingCapacity;
    const baseProbability = params.growthRate * (1 - populationPressure);

    // Fitness affects reproduction probability
    const fitness = bacterium.fitness || 0.5;
    const reproductionProbability = baseProbability * fitness;

    // Age affects reproduction (very young and very old bacteria reproduce less)
    const age = bacterium.age || 0;
    const ageMultiplier = age < 5 ? 0.5 : age > 30 ? 0.8 : 1.0;

    return Math.random() < reproductionProbability * ageMultiplier;
  }

  /**
   * Create offspring bacterium near parent with some variation
   * @param parent - Parent bacterium
   * @param params - Simulation parameters
   * @returns New bacterium or null if placement failed
   */
  static reproduceBacterium(
    parent: SimulationBacterium,
    params: ISimulationParameters
  ): SimulationBacterium | null {
    // Find position near parent but within petri dish bounds
    const newPosition = this.findOffspringPosition(parent, params);
    if (!newPosition) return null;

    // Inherit traits with some variation
    const fitnessVariation = (Math.random() - 0.5) * 0.1; // ±5% fitness variation
    const newFitness = Math.max(
      0,
      Math.min(1, (parent.fitness || 0.5) + fitnessVariation)
    );

    const sizeVariation = (Math.random() - 0.5) * 0.5; // ±0.25 size variation
    const newSize = Math.max(
      1,
      Math.min(10, (parent.size || 3) + sizeVariation)
    );

    return {
      id: `${parent.id}_offspring_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      x: newPosition.x,
      y: newPosition.y,
      isResistant: parent.isResistant,
      fitness: newFitness,
      age: 0,
      generation: (parent.generation || 0) + 1,
      parentId: parent.id,
      color: parent.color,
      size: newSize,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as SimulationBacterium;
  }

  /**
   * Process mutations for a bacterium
   * @param bacterium - Bacterium to potentially mutate
   * @param mutationRate - Base mutation rate
   * @returns Object with mutated bacterium and mutation flag
   */
  static processMutations(
    bacterium: SimulationBacterium,
    mutationRate: number
  ): { bacterium: SimulationBacterium; hasMutated: boolean } {
    if (Math.random() > mutationRate) {
      return { bacterium, hasMutated: false };
    }

    const mutatedBacterium = { ...bacterium, updatedAt: new Date() };
    let hasMutated = false;

    // Resistance mutation (rare but significant)
    if (Math.random() < 0.1) {
      // 10% of mutations affect resistance
      mutatedBacterium.isResistant = !mutatedBacterium.isResistant;

      // Update color based on resistance
      mutatedBacterium.color = mutatedBacterium.isResistant
        ? this.DEFAULT_COLORS[1]
        : this.DEFAULT_COLORS[0];

      // Resistance usually comes with fitness cost
      if (mutatedBacterium.isResistant) {
        mutatedBacterium.fitness = Math.max(
          0,
          (mutatedBacterium.fitness || 0.5) - 0.1
        );
      } else {
        mutatedBacterium.fitness = Math.min(
          1,
          (mutatedBacterium.fitness || 0.5) + 0.1
        );
      }

      hasMutated = true;
    }

    // Fitness mutation (more common)
    if (Math.random() < 0.7) {
      // 70% of mutations affect fitness
      const fitnessChange = (Math.random() - 0.5) * 0.2; // ±10% change
      mutatedBacterium.fitness = Math.max(
        0,
        Math.min(1, (mutatedBacterium.fitness || 0.5) + fitnessChange)
      );
      hasMutated = true;
    }

    // Size mutation (common but small effect)
    if (Math.random() < 0.5) {
      // 50% of mutations affect size
      const sizeChange = (Math.random() - 0.5) * 0.5; // ±0.25 change
      mutatedBacterium.size = Math.max(
        1,
        Math.min(10, (mutatedBacterium.size || 3) + sizeChange)
      );
      hasMutated = true;
    }

    return { bacterium: mutatedBacterium, hasMutated };
  }

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
  } {
    const totalPopulation = bacteria.length;
    const resistantCount = bacteria.filter((b) => b.isResistant).length;
    const sensitiveCount = totalPopulation - resistantCount;

    const averageFitness =
      totalPopulation > 0
        ? bacteria.reduce((sum, b) => sum + (b.fitness || 0), 0) /
          totalPopulation
        : 0;

    return {
      totalPopulation,
      resistantCount,
      sensitiveCount,
      averageFitness,
      mutationEvents: 0, // Will be set by caller
      antibioticDeaths: 0, // Will be set by caller
      naturalDeaths: 0, // Will be set by caller
      reproductions: 0, // Will be set by caller
    };
  }

  /**
   * Generate random position within circular petri dish
   * @param center - Center point of the petri dish
   * @param radius - Radius of the petri dish
   * @returns Random position within circle
   */
  private static generateRandomPositionInCircle(
    center: Position,
    radius: number
  ): Position {
    const angle = Math.random() * 2 * Math.PI;
    const r = Math.sqrt(Math.random()) * radius; // Uniform distribution in circle

    return {
      x: center.x + r * Math.cos(angle),
      y: center.y + r * Math.sin(angle),
    };
  }

  /**
   * Generate initial fitness value based on resistance status
   * @param isResistant - Whether bacterium is resistant
   * @returns Initial fitness value
   */
  private static generateInitialFitness(isResistant: boolean): number {
    // Resistant bacteria start with slightly lower fitness (cost of resistance)
    const baseFitness = isResistant ? 0.4 : 0.6;
    const variation = (Math.random() - 0.5) * 0.2; // ±10% variation

    return Math.max(0.1, Math.min(1, baseFitness + variation));
  }

  /**
   * Calculate carrying capacity based on petri dish size
   * @param params - Simulation parameters
   * @returns Maximum sustainable population
   */
  private static calculateCarryingCapacity(
    params: ISimulationParameters
  ): number {
    // Carrying capacity is proportional to petri dish area
    const area = Math.PI * Math.pow(params.petriDishSize / 2, 2);
    const densityFactor = 0.001; // Bacteria per unit area

    return Math.floor(area * densityFactor);
  }

  /**
   * Find suitable position for offspring near parent
   * @param parent - Parent bacterium
   * @param params - Simulation parameters
   * @returns Position for offspring or null if no suitable position
   */
  private static findOffspringPosition(
    parent: SimulationBacterium,
    params: ISimulationParameters
  ): Position | null {
    const maxAttempts = 10;
    const radius = params.petriDishSize / 2;
    const center = { x: radius, y: radius };

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Try to place offspring near parent (within 20 units)
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * 20 + 5; // 5-25 units from parent

      const newX = (parent.x || center.x) + distance * Math.cos(angle);
      const newY = (parent.y || center.y) + distance * Math.sin(angle);

      // Check if position is within petri dish bounds
      const distanceFromCenter = Math.sqrt(
        Math.pow(newX - center.x, 2) + Math.pow(newY - center.y, 2)
      );

      if (distanceFromCenter <= radius) {
        return { x: newX, y: newY };
      }
    }

    // If no suitable position found near parent, place randomly in dish
    return this.generateRandomPositionInCircle(center, radius);
  }
}

export default SimulationEngine;
