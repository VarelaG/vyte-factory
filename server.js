const path = require('path')
process.env.NODE_ENV = 'production'

process.chdir(__dirname)

// Solo para asegurarnos de que escuche el puerto de Hostinger
const port = process.env.PORT || 3000
process.env.PORT = port
process.env.HOSTNAME = '0.0.0.0'

require('dotenv').config()

// Asegurarse de que el script arranca el servidor standalone de Next.js
try {
    require('./.next/standalone/server.js')
} catch (err) {
    console.error("No se encontró el servidor Standalone. ¿Se compiló bien en Hostinger?", err)
    process.exit(1)
}
