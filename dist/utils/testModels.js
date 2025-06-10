"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testDatabaseSchemas = testDatabaseSchemas;
exports.testDatabaseConnection = testDatabaseConnection;
const mongoose_1 = __importDefault(require("mongoose"));
const db_1 = __importDefault(require("./db"));
const models_1 = require("../models");
async function testDatabaseSchemas() {
    try {
        console.log('🧪 Testing database schemas...');
        // Connect to database
        await (0, db_1.default)();
        // Test Bacterium schema
        console.log('📊 Testing Bacterium schema...');
        const testBacterium = new models_1.Bacterium({
            simulationId: new mongoose_1.default.Types.ObjectId(),
            bacteriumId: 'test_bacterium_001',
            position: { x: 250, y: 250 },
            isResistant: false,
            fitness: 0.8,
            age: 0,
            generation: 0,
            color: '#22c55e',
            size: 4
        });
        const savedBacterium = await testBacterium.save();
        console.log('✅ Bacterium created:', savedBacterium._id);
        // Test virtual properties
        console.log(`   Fitness: ${savedBacterium.fitness}`);
        console.log(`   Is Resistant: ${savedBacterium.isResistant}`);
        console.log(`   Survival Rate: ${savedBacterium.survivalRate}%`);
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
            },
            currentState: {
                generation: 0,
                timeElapsed: 0,
                bacteria: [],
                isRunning: false,
                isPaused: false,
                stepCount: 0
            },
            statistics: {
                totalPopulation: [100],
                resistantCount: [20],
                sensitiveCount: [80],
                averageFitness: [0.8],
                mutationEvents: [0],
                generations: [0],
                antibioticDeaths: [0],
                naturalDeaths: [0],
                reproductions: [0]
            }
        });
        const savedSimulation = await testSimulation.save();
        console.log('✅ Simulation created:', savedSimulation.name);
        // Test actual properties
        console.log(`   Current generation: ${savedSimulation.currentState.generation}`);
        console.log(`   Total bacteria: ${savedSimulation.currentState.bacteria.length}`);
        console.log(`   Is completed: ${savedSimulation.completedAt ? 'Yes' : 'No'}`);
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
        await (0, db_1.default)();
        if (mongoose_1.default.connection.readyState === 1) {
            console.log('✅ Database connection successful');
            console.log(`   State: ${mongoose_1.default.connection.readyState} (1 = connected)`);
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
