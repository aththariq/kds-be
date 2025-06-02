"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testDatabaseSchemas = testDatabaseSchemas;
exports.testDatabaseConnection = testDatabaseConnection;
const db_1 = __importDefault(require("./db"));
const models_1 = require("../models");
async function testDatabaseSchemas() {
    try {
        console.log('🧪 Testing database schemas...');
        // Connect to database
        await db_1.default.connect();
        // Test Bacterium schema
        console.log('📊 Testing Bacterium schema...');
        const testBacterium = new models_1.Bacterium({
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
        const testSimulation = new models_1.Simulation({
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
        await models_1.Bacterium.deleteOne({ _id: savedBacterium._id });
        await models_1.Simulation.deleteOne({ _id: savedSimulation._id });
        console.log('🧹 Test data cleaned up');
        console.log('✅ All schema tests passed!');
    }
    catch (error) {
        console.error('❌ Schema test failed:', error);
        throw error;
    }
}
async function testDatabaseConnection() {
    try {
        console.log('🔗 Testing database connection...');
        await db_1.default.connect();
        if (db_1.default.isConnected()) {
            console.log('✅ Database connection successful');
            console.log(`   State: ${db_1.default.getConnectionState()}`);
        }
        else {
            throw new Error('Database connection failed');
        }
    }
    catch (error) {
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
        }
        catch (error) {
            console.error('💥 Tests failed:', error);
            process.exit(1);
        }
    })();
}
