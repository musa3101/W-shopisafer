const dns = require('dns');
const https = require('https');

dns.setServers(['8.8.8.8', '1.1.1.1']);

dns.resolve4('github.com', (err, addresses) => {
  if (err) {
    console.error('DNS resolve error:', err);
    return;
  }
  console.log('addresses:', addresses);
  
  // Try to fetch using the first address and host header
  const ip = addresses[0];
  const options = {
    hostname: ip,
    port: 443,
    path: '/users/octocat',
    method: 'GET',
    headers: {
      'Host': 'api.github.com',
      'User-Agent': 'Node.js'
    },
    // Since we're connecting to an IP, we might need to disable SNI mismatch errors or set servername
    servername: 'api.github.com'
  };

  https.get(options, (res) => {
    console.log('statusCode:', res.statusCode);
    let body = '';
    res.on('data', (d) => { body += d; });
    res.on('end', () => { console.log(body.substring(0, 100)); });
  }).on('error', (e) => {
    console.error('HTTP error:', e);
  });
});
