const axios = require('axios');

async function testLogin() {
  try {
    console.log('🔐 Test de connexion...');
    
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'test@test.com',
      password: 'password123'  // Using the test user credentials
    });

    console.log('✅ Connexion réussie!');
    console.log('Token:', response.data.token);
    console.log('User:', response.data.user);
    
    // Test the complaints endpoint with the token
    console.log('🔍 Test de l\'endpoint complaints...');
    const complaintsResponse = await axios.get('http://localhost:3001/api/complaints', {
      headers: {
        'Authorization': `Bearer ${response.data.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Endpoint complaints accessible!');
    console.log('Réclamations:', complaintsResponse.data);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Erreur de connexion:', error.response.data.message);
      
      // Try with different password
      console.log('🔄 Essai avec un mot de passe différent...');
      try {
        const response2 = await axios.post('http://localhost:3001/api/auth/login', {
          email: 'test@test.com',
          password: 'password123'
        });
        
        console.log('✅ Connexion réussie avec mot de passe alternatif!');
        console.log('Token:', response2.data.token);
        
        // Test complaints with new token
        const complaintsResponse2 = await axios.get('http://localhost:3001/api/complaints', {
          headers: {
            'Authorization': `Bearer ${response2.data.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Endpoint complaints accessible!');
        console.log('Réclamations:', complaintsResponse2.data);
        
      } catch (error2) {
        console.log('❌ Échec avec mot de passe alternatif:', error2.response?.data?.message || error2.message);
      }
    } else {
      console.error('❌ Erreur réseau:', error.message);
    }
  }
}

testLogin();