import { useState, useEffect } from 'react';

// Si tu cliente Final es en Vite o Next.js, podés copiar y pegar este hook 
// en su proyecto para conectarlo mágicamente al motor de Vyte Factory.

export function useVyteData(cliente_slug: string, vyteFactoryUrl: string = 'http://localhost:3000') {
    const [data, setData] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchVyte() {
            if (!cliente_slug) return;

            try {
                setLoading(true);
                // Llama a la API de tu Vyte Factory central
                const response = await fetch(`${vyteFactoryUrl}/api/tenant?slug=${cliente_slug}`);

                if (!response.ok) {
                    throw new Error('Vyte: No se encontró este cliente en el Factory.');
                }

                const resData = await response.json();
                const parsedConfig = typeof resData.config === 'string' ? JSON.parse(resData.config) : resData.config;

                // Transformar el array de "fields" a un objeto plano fácil de usar
                // Ej: [{ id: "heroTitle", value: "Hola" }] => { heroTitle: "Hola" }
                const dataMap: Record<string, string> = {};
                if (parsedConfig && parsedConfig.fields) {
                    parsedConfig.fields.forEach((field: { id: string, value: string }) => {
                        dataMap[field.id] = field.value;
                    });
                }

                setData(dataMap);
            } catch (err: any) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchVyte();
    }, [cliente_slug, vyteFactoryUrl]);

    return { data, loading };
}
