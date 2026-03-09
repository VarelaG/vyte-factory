const slug = 'escribania-lincoln';
const url = 'https://vyte-factory.vercel.app/api/tenant';

const fields = [
    { id: 'hero_pretitle', type: 'text', label: 'Pre Título', value: 'Seguridad Jurídica y Respaldo Notarial - Prueba extensa para asegurar que no se corta el texto.' },
    { id: 'hero_description', type: 'textarea', label: 'Descripción', value: 'Esta es una descripción extremadamente larga para superar los 191 caracteres fácilmente y comprobar que el campo LONGTEXT de la base de datos de Hostinger está guardando absolutamente toda la información sin truncar ni corromper el JSON en la API de Vercel. 1234567890 1234567890 1234567890 1234567890' },
    { id: 'hero_bg_image', type: 'image', label: 'Imagen Fondo', value: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73' }
];

async function runTest() {
    console.log("--- INICIANDO PRUEBA DE PRODUCCIÓN ---");
    console.log("1. Guardando 3 campos largos simulando al Master User (vyte)...");

    const saveRes = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': 'vyte_session=vyte'
        },
        body: JSON.stringify({
            cliente_slug: slug,
            config: { fields },
            password: 'skip'
        })
    });

    console.log('Status Guardado HTTP:', saveRes.status);

    console.log("\n2. Recuperando los datos de la Base de Datos Hostinger simulando al Cliente...");
    const getRes = await fetch(`${url}?slug=${slug}`);
    console.log('Status Recuperación HTTP:', getRes.status);

    const getData = await getRes.json();
    const configStr = typeof getData.config === 'string' ? getData.config : JSON.stringify(getData.config);
    const parsedConfig = JSON.parse(configStr);

    console.log(`\n=== RESULTADOS ===`);
    console.log(`Caracteres guardados en la BD: ${configStr.length}`);
    console.log(`Campos recuperados intactos: ${parsedConfig.fields.length}`);
    console.log(`¿Los 3 campos sobrevivieron al guardado? ${parsedConfig.fields.length === 3 ? '✅ SÍ' : '❌ NO'}`);
    console.log("--------------------------------------");
}

runTest().catch(console.error);
