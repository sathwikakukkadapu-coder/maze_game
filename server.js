// server.js
// Lightweight zero-dependency static web server with automatic port selection
const http = require('http');
const fs = require('fs');
const path = require('path');

const START_PORT = parseInt(process.env.PORT, 10) || 8080;
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

function createServer(port) {
    const server = http.createServer((req, res) => {
        let reqUrl = req.url.split('?')[0];
        if (reqUrl === '/') reqUrl = '/index.html';

        const safePath = path.normalize(reqUrl).replace(/^(\.\.[\/\\])+/, '');
        const filePath = path.join(__dirname, safePath);

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
                return;
            }

            const ext = path.extname(filePath).toLowerCase();
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} in use, trying ${port + 1}...`);
            createServer(port + 1);
        } else {
            console.error('Server error:', err);
        }
    });

    server.listen(port, () => {
        console.log(`THE EXIT IS A COWARD server running at: http://localhost:${port}/`);
    });
}

createServer(START_PORT);
