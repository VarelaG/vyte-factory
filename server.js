// server.js (Punto de entrada para la aplicación Node.js en Hostinger)
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = false; // Forzamos producción en Hostinger
const hostname = 'localhost';
// Hostinger inyecta el PORT dinámicamente o usamos 3000 de fallback
const port = process.env.PORT || 3000;

// Init Next.js App
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    }).listen(port, (err) => {
        if (err) throw err;
        console.log(`> Servidor Vyte Factory listo en http://${hostname}:${port}`);
    });
}).catch((ex) => {
    console.error('Error arrancando Next.js en Hostinger:', ex.stack);
    process.exit(1);
});
