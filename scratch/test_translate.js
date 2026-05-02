const https = require('https');

const targetLanguage = 'es';
const text = 'Hello world';
const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;

console.log('Testing URL:', url);

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response Headers:', res.headers);
    console.log('Data:', data);
    try {
      const result = JSON.parse(data);
      const translatedText = result[0].map(x => x[0]).join('');
      console.log('Translated Text:', translatedText);
    } catch (e) {
      console.error('Parse error:', e.message);
    }
  });
}).on('error', (err) => {
  console.error('Request error:', err.message);
});
