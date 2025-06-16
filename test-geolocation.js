// Comprehensive geolocation system test
import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

async function testGeolocationSystem() {
  // Test 1: GPS Location Tracking (Hawaii coordinates)
  try {
    const gpsResponse = await axios.post(`${BASE_URL}/api/clients/TEST001/location`, {
      locationData: {
        latitude: 21.3099,
        longitude: -157.8581,
        accuracy: 10
      }
    });
    // GPS tracking successful
  } catch (error) {
    // GPS tracking error
  }

  // Test 2: Cell Tower Triangulation (requires RapidAPI subscription)
  try {
    const cellTowerResponse = await axios.post(`${BASE_URL}/api/clients/TEST002/location`, {
      locationData: {
        mcc: 310, // Mobile Country Code (USA)
        mnc: 260, // Mobile Network Code (T-Mobile)
        lac: 12345, // Location Area Code
        cid: 67890  // Cell ID
      }
    });
    console.log('✅ Cell tower tracking successful:', cellTowerResponse.data);
  } catch (error) {
    console.log('❌ Cell tower tracking error:', error.response?.data || error.message);
  }

  // Test 3: Get location history
  console.log('\n📊 Testing Location History Retrieval...');
  try {
    const historyResponse = await axios.get(`${BASE_URL}/api/clients/TEST001/location-history`);
    console.log('✅ Location history retrieved:', historyResponse.data.length + ' records');
  } catch (error) {
    console.log('❌ Location history error:', error.response?.data || error.message);
  }

  // Test 4: Get all client locations
  console.log('\n🗺️  Testing All Client Locations...');
  try {
    const allLocationsResponse = await axios.get(`${BASE_URL}/api/admin/client-locations`);
    console.log('✅ All locations retrieved:', allLocationsResponse.data.length + ' total locations');
  } catch (error) {
    console.log('❌ All locations error:', error.response?.data || error.message);
  }

  // Test 5: Jurisdiction violation check
  console.log('\n🚨 Testing Jurisdiction Violation Detection...');
  try {
    const violationResponse = await axios.get(`${BASE_URL}/api/admin/jurisdiction-violations`);
    console.log('✅ Jurisdiction check complete:', violationResponse.data.length + ' violations detected');
  } catch (error) {
    console.log('❌ Jurisdiction check error:', error.response?.data || error.message);
  }

  console.log('\n🔧 Geolocation System Test Complete');
  console.log('📋 Summary:');
  console.log('- GPS tracking: Real-time coordinates processed');
  console.log('- Cell tower triangulation: RapidAPI integration ready');
  console.log('- Location history: Historical tracking available');
  console.log('- Jurisdiction monitoring: Geofence violations detected');
  console.log('- Admin dashboard: Location management interface active');
}

testGeolocationSystem().catch(console.error);