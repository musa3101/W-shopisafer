const https = require('https');

const options = {
  hostname: '8.8.8.8',
  port: 443,
  path: '/resolve?name=github.com',
  method: 'GET',
  headers: {
    'Host': 'dns.google'
  },
  rejectUnauthorized: false // we can disable SSL verification for this test or use it to bypass SNI
};

https.get(options, (res) => {
  let body = '';
  res.on('data', (d) => { body += d; });
  res.on('end', () => {
    console.log(body);
  });
}).on('error', (e) => {
  console.error(e);
});
