const axios = require('axios');
const FormData = require('form-data');

async function test() {
  const form = new FormData();
  form.append('image', 'test data');
  try {
    await axios.post('http://localhost:3000/upload', form, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log('success');
  } catch (e) {
    console.error('ERROR RESPONSE:', e.response?.data || e.message);
  }
}
test();
