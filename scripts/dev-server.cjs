// Local preview only. Production continues to use Netlify Functions / Blobs.
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
http.createServer(async (req,res) => {
    try {
        const url = new URL(req.url, 'http://preview');
        const endpoint = url.pathname.replace(/^\/api\//, '/.netlify/functions/');
        if (endpoint.startsWith('/.netlify/functions/')) {
            const name = endpoint.slice('/.netlify/functions/'.length);
            if (!/^[a-z-]+$/.test(name)) { res.writeHead(404); return res.end(); }
            const handler = require(path.join(root, 'netlify/functions', name + '.js')).handler;
            let body = ''; for await (const chunk of req) body += chunk;
            const result = await handler({httpMethod:req.method, body, headers:req.headers, queryStringParameters:Object.fromEntries(url.searchParams)});
            res.writeHead(result.statusCode, result.headers); return res.end(result.body);
        }
        let file = decodeURIComponent(url.pathname);
        if (file === '/admin' || file === '/admin/') file = '/admin/index.html';
        else if (file === '/') file = '/index.html';
        else if (!path.extname(file)) file += '.html';
        if (file.split('/').some(part => part.startsWith('.')) || file.startsWith('/node_modules') || file.startsWith('/netlify/') || file.startsWith('/scripts/')) {res.writeHead(404);return res.end();}
        const target = path.resolve(root, '.' + file);
        if (!target.startsWith(root + path.sep)) {res.writeHead(403);return res.end();}
        const data = await fs.readFile(target);
        res.writeHead(200, {'Content-Type':types[path.extname(target)] || 'application/octet-stream','Cache-Control':'no-store'});res.end(data);
    } catch (error) {
        res.writeHead(error.code === 'ENOENT' || error.code === 'MODULE_NOT_FOUND' ? 404 : 500);
        res.end('Local preview request failed');
    }
}).listen(Number(process.env.PORT || 3000), '0.0.0.0', () => console.log('Website preview on port ' + (process.env.PORT || 3000)));
