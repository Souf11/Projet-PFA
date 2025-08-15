const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Test user credentials
const testUser = {
  email: 'test@test.com',
  password: 'password123'
};

let authToken = null;

async function testComplaints() {
  try {
    console.log('🧪 Testing Complaint System...\n');

    // 1. Login to get authentication token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, testUser);
    authToken = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // 2. Create a new complaint
    console.log('2. Creating a new complaint...');
    const newComplaint = {
      type: 'facture',
      objet: 'Problème avec ma facture',
      description: 'Je n\'ai pas reçu ma facture du mois dernier et j\'aimerais la recevoir par email.'
    };

    const createResponse = await axios.post(`${API_BASE_URL}/complaints`, newComplaint, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Complaint created:', createResponse.data);
    console.log('');

    // 3. Get all user complaints
    console.log('3. Fetching all user complaints...');
    const complaintsResponse = await axios.get(`${API_BASE_URL}/complaints`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ User complaints:', complaintsResponse.data);
    console.log('');

    // 4. Get specific complaint by ID
    if (complaintsResponse.data.length > 0) {
      const complaintId = complaintsResponse.data[0].id;
      console.log(`4. Fetching complaint with ID: ${complaintId}...`);
      const specificComplaintResponse = await axios.get(`${API_BASE_URL}/complaints/${complaintId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Specific complaint:', specificComplaintResponse.data);
      console.log('');

      // 5. Update complaint
      console.log('5. Updating complaint...');
      const updateData = {
        description: 'Je n\'ai pas reçu ma facture du mois dernier et j\'aimerais la recevoir par email. Pouvez-vous me l\'envoyer rapidement ?'
      };
      const updateResponse = await axios.put(`${API_BASE_URL}/complaints/${complaintId}`, updateData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Complaint updated:', updateResponse.data);
      console.log('');

      // 6. Delete complaint (optional - uncomment if you want to test deletion)
      /*
      console.log('6. Deleting complaint...');
      await axios.delete(`${API_BASE_URL}/complaints/${complaintId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Complaint deleted');
      console.log('');
      */
    }

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Run the test
testComplaints();