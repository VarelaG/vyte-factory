// server.js (Punto de entrada para la aplicación Node.js en Hostinger)
const http = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
// Hostinger usa su propio puerto o el 3000 por defecto
const port = process.env.PORT || 3000;
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    http.createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    }).listen(port, (err) => {
        if (err) throw err;
        console.log(`> Servidor Vyte Factory listo en puerto ${port}`);
    });
});
