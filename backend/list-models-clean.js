const https = require('https');
require('dotenv').config();

const apiKey = process.env.OPENAI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.models) {
                console.log('Available Models:');
                json.models.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
            } else {
                console.log('No models found or error:', data);
            }
        } catch (e) {
            console.error('Parse error:', e.message);
            console.log('Raw data:', data);
        }
    });
}).on('error', (err) => {
    console.error('Error: ' + err.message);
});
