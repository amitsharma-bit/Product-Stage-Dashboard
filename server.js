const http = require('http');
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'rooftop-coverage.html');
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(fs.readFileSync(file));
}).listen(5173, () => console.log('listening on 5173'));
