const https = require('https');
https.get('https://api.github.com/users/octocat', {
  headers: { 'User-Agent': 'Node.js' }
}, (res) => {
  console.log('statusCode:', res.statusCode);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
}).on('error', (e) => {
  console.error(e);
});
