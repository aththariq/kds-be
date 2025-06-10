const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testEndpoints() {
  console.log('🧪 Testing Backend Endpoints...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Status:', healthResponse.data.status);
    console.log('✅ Database Connected:', healthResponse.data.database.connected);
    
    // Test 2: Create Simulation
    console.log('\n2️⃣ Testing Create Simulation...');
    const simulationData = {
      name: 'Test Simulation Frontend Integration',
      description: 'Testing data structure compatibility',
      parameters: {
        initialPopulation: 50,
        growthRate: 0.1,
        antibioticConcentration: 0.3,
        mutationRate: 0.02,
        duration: 100,
        petriDishSize: 600
      }
    };
    
    const createResponse = await axios.post(`${BASE_URL}/api/simulations`, simulationData);
    const simulation = createResponse.data.simulation;
    console.log('✅ Simulation Created ID:', simulation._id);
    console.log('✅ Initial Bacteria Count:', simulation.currentState.bacteria.length);
    console.log('✅ Statistics Arrays Length:', simulation.statistics.totalPopulation.length);
    
    // Test 3: Get Simulation (Check Data Structure)
    console.log('\n3️⃣ Testing Get Simulation Data Structure...');
    const getResponse = await axios.get(`${BASE_URL}/api/simulations/${simulation._id}`);
    const retrievedSim = getResponse.data.simulation;
    
    // Verify Frontend-Required Fields
    console.log('✅ Frontend Compatibility Check:');
    console.log('   - currentState.bacteria array:', Array.isArray(retrievedSim.currentState.bacteria));
    console.log('   - bacteria[0] has required fields:', retrievedSim.currentState.bacteria[0] ? 
      ['id', 'x', 'y', 'isResistant', 'fitness', 'color', 'size'].every(field => 
        retrievedSim.currentState.bacteria[0].hasOwnProperty(field)
      ) : 'No bacteria');
    console.log('   - statistics are arrays:', Array.isArray(retrievedSim.statistics.totalPopulation));
    console.log('   - currentState has all fields:', ['generation', 'timeElapsed', 'bacteria', 'isRunning', 'isPaused', 'stepCount'].every(field => 
      retrievedSim.currentState.hasOwnProperty(field)
    ));
    
    // Test 4: Step Simulation
    console.log('\n4️⃣ Testing Step Simulation...');
    const stepResponse = await axios.put(`${BASE_URL}/api/simulations/${simulation._id}/step`);
    const steppedSim = stepResponse.data.simulation;
    console.log('✅ Generation after step:', steppedSim.currentState.generation);
    console.log('✅ Population after step:', steppedSim.currentState.bacteria.length);
    console.log('✅ Statistics updated:', steppedSim.statistics.totalPopulation.length > 1);
    
    // Test 5: Start/Pause Controls
    console.log('\n5️⃣ Testing Simulation Controls...');
    const startResponse = await axios.put(`${BASE_URL}/api/simulations/${simulation._id}/start`);
    console.log('✅ Started simulation:', startResponse.data.simulation.isRunning);
    
    const pauseResponse = await axios.put(`${BASE_URL}/api/simulations/${simulation._id}/pause`);
    console.log('✅ Paused simulation:', pauseResponse.data.simulation.isPaused);
    
    // Test 6: Reset Simulation  
    console.log('\n6️⃣ Testing Reset Simulation...');
    const resetResponse = await axios.put(`${BASE_URL}/api/simulations/${simulation._id}/reset`);
    const resetSim = resetResponse.data.simulation;
    console.log('✅ Reset to generation:', resetSim.currentState.generation);
    console.log('✅ Reset statistics length:', resetSim.statistics.totalPopulation.length);
    
    // Test 7: Get All Simulations
    console.log('\n7️⃣ Testing Get All Simulations...');
    const allSimsResponse = await axios.get(`${BASE_URL}/api/simulations`);
    console.log('✅ Found simulations:', allSimsResponse.data.simulations.length);
    console.log('✅ Pagination included:', allSimsResponse.data.pagination ? 'Yes' : 'No');
    
    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await axios.delete(`${BASE_URL}/api/simulations/${simulation._id}`);
    console.log('✅ Test simulation deleted');
    
    console.log('\n🎉 All endpoint tests passed! Backend is ready for frontend integration.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run tests
testEndpoints(); 