import connectToDatabase from './src/utils/db';
import { Simulation, Bacterium, SimulationHistory } from './src/models';

async function validateSchemas() {
  console.log('Testing MongoDB Schemas...');
  
  try {
    const connection = await connectToDatabase();
    console.log('Database connected successfully');

    // Test creating a simulation with frontend parameters
    const testSimulation = new Simulation({
      name: 'Schema Test',
      parameters: {
        initialPopulation: 100,
        growthRate: 0.15,
        antibioticConcentration: 0.3,
        mutationRate: 0.02,
        duration: 50,
        petriDishSize: 600
      },
      currentState: {
        generation: 0,
        timeElapsed: 0,
        isRunning: false,
        isPaused: false,
        stepCount: 0,
        activeBacteria: 100,
        averageFitness: 0.8,
        averageResistance: 0.1
      },
      statistics: {
        totalPopulation: [100],
        resistantCount: [10],
        sensitiveCount: [90],
        averageFitness: [0.8],
        mutationEvents: [0],
        generations: [0],
        antibioticDeaths: [0],
        naturalDeaths: [0],
        reproductions: [0]
      },
      metadata: {
        performanceMetrics: {
          averageStepTime: 0,
          peakMemoryUsage: 0
        },
        complexityMetrics: {
          maxPopulation: 100,
          generationalDiversity: 0
        },
        tags: ['test'],
        category: 'testing',
        description: 'Schema validation test',
        favorite: false
      }
    });

    const savedSimulation = await testSimulation.save();
    console.log('Simulation created successfully:', savedSimulation.name);

    // Test creating bacteria
    const testBacterium = new Bacterium({
      simulationId: savedSimulation._id,
      bacteriumId: 'test_bacteria_1',
      position: { x: 300, y: 250 },
      isResistant: false,
      fitness: 1.0,
      age: 0,
      generation: 0,
      color: '#22c55e',
      size: 4
    });

    const savedBacterium = await testBacterium.save();
    console.log('Bacterium created successfully:', savedBacterium.bacteriumId);

    // Cleanup
    await Bacterium.findByIdAndDelete(savedBacterium._id);
    await Simulation.findByIdAndDelete(savedSimulation._id);
    
    console.log('Schema validation completed successfully!');
    await connection.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('Schema validation failed:', error);
    process.exit(1);
  }
}

validateSchemas(); 