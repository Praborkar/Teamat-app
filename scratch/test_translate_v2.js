const https = require('https');

const targetLanguage = 'fr';
const text = 'Hello world. How are you today?';
const url = `https://translate.googleapis.com/translate_a/t?client=at&sl=auto&tl=${targetLanguage}&q=${encodeURIComponent(text)}`;

console.log('Testing URL:', url);

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
};

https.get(url, options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Data:', data);
    try {
      const result = JSON.parse(data);
      console.log('Result:', result);
      // result[0][0] should be the translated text
      console.log('Translated:', result[0][0]);
    } catch (e) {
      console.error('Parse error:', e.message);
    }
  });
}).on('error', (err) => {
  console.error('Request error:', err.message);
});
