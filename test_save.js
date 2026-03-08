const fetch = require('node-fetch');

async function test() {
    console.log("Saving new fields...");
    const res = await fetch('http://localhost:3000/api/tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': 'vyte_session=escribania-lincoln' },
        body: JSON.stringify({
            cliente_slug: 'escribania-lincoln',
            config: { fields: [{ id: 'test', type: 'text', value: 'hello', label: 'Test' }] },
            password: 'skip'
        })
    });
    console.log("POST res", res.status, await res.json());

    console.log("Fetching fields...");
    const res2 = await fetch('http://localhost:3000/api/tenant?slug=escribania-lincoln');
    console.log("GET res", res2.status, await res2.json());
}
test();
