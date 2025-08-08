// debug-techniciens.js

async function debugTechniciens() {
  try {
    const token = localStorage.getItem('token');
    console.log('Token:', token ? 'Found' : 'Not found');
    
    const res = await fetch('http://localhost:3001/api/admin/users/techniciens', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Response status:', res.status);
    
    const data = await res.json();
    console.log('Response data type:', typeof data);
    console.log('Is array:', Array.isArray(data));
    console.log('Data:', data);
    
    if (!Array.isArray(data)) {
      // If data is not an array, convert it to an array
      console.log('Converting to array...');
      return Array.isArray(data) ? data : [];
    }
    
    return data;
  } catch (err) {
    console.error('Error debugging techniciens:', err);
    return [];
  }
}

// Export for use in browser console
window.debugTechniciens = debugTechniciens;

console.log('Debug script loaded. Run debugTechniciens() in console.');