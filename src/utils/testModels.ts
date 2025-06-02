import dbConnection from './db';
import { Bacterium, Simulation } from '../models';

export async function testDatabaseSchemas(): Promise<void> {
  try {
    console.log('🧪 Testing database schemas...');
    
    // Connect to database
    await dbConnection.connect();
    
    // Test Bacterium schema
    console.log('📊 Testing Bacterium schema...');
    const testBacterium = new Bacterium({
      id: 'test-bacterium-1',
      x: 250,
      y: 250,
      isResistant: false,
      fitness: 0.8,
      age: 0,
      generation: 0,
      color: '#44ff44',
      size: 3
    });
    
    const savedBacterium = await testBacterium.save();
    console.log('✅ Bacterium created:', savedBacterium.id);
    
    // Test virtual properties
    console.log(`   Survival rate: ${savedBacterium.survivalRate}%`);
    console.log(`   Is elderly: ${savedBacterium.isElderly}`);
    
    // Test Simulation schema
    console.log('📊 Testing Simulation schema...');
    const testSimulation = new Simulation({
      name: 'Test Simulation',
      description: 'A test simulation to verify schema functionality',
      parameters: {
        initialPopulation: 100,
        growthRate: 0.1,
        antibioticConcentration: 0.3,
        mutationRate: 0.05,
        duration: 50,
        petriDishSize: 500
      }
    });
    
    const savedSimulation = await testSimulation.save();
    console.log('✅ Simulation created:', savedSimulation.name);
    
    // Test virtual properties
    console.log(`   Progress: ${savedSimulation.progressPercentage}%`);
    console.log(`   Current population: ${savedSimulation.currentPopulation}`);
    console.log(`   Is completed: ${savedSimulation.isCompleted}`);
    
    // Test instance methods
    savedSimulation.addStatisticsPoint();
    await savedSimulation.save();
    console.log('✅ Statistics point added');
    
    // Cleanup test data
    await Bacterium.deleteOne({ _id: savedBacterium._id });
    await Simulation.deleteOne({ _id: savedSimulation._id });
    console.log('🧹 Test data cleaned up');
    
    console.log('✅ All schema tests passed!');
    
  } catch (error) {
    console.error('❌ Schema test failed:', error);
    throw error;
  }
}

export async function testDatabaseConnection(): Promise<void> {
  try {
    console.log('🔗 Testing database connection...');
    
    await dbConnection.connect();
    
    if (dbConnection.isConnected()) {
      console.log('✅ Database connection successful');
      console.log(`   State: ${dbConnection.getConnectionState()}`);
    } else {
      throw new Error('Database connection failed');
    }
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    throw error;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  (async () => {
    try {
      await testDatabaseConnection();
      await testDatabaseSchemas();
      console.log('🎉 All tests completed successfully!');
      process.exit(0);
    } catch (error) {
      console.error('💥 Tests failed:', error);
      process.exit(1);
    }
  })();
} 