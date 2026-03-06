import { useState, useEffect } from 'react';

export function useTenantConfig(cliente_slug: string) {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchConfig() {
            if (!cliente_slug) return;

            try {
                setLoading(true);
                // Llamada directa a nuestra API de Next.js (lee de MySQL/SQLite con Prisma)
                const response = await fetch(`/api/tenant?slug=${cliente_slug}`);

                if (!response.ok) {
                    throw new Error('No se encontró configuración para este cliente');
                }

                const data = await response.json();
                const parsedConfig = typeof data.config === 'string' ? JSON.parse(data.config) : data.config;

                setConfig(parsedConfig);
            } catch (err: any) {
                setError(err);
            } finally {
                setLoading(false);
            }
        }

        fetchConfig();
    }, [cliente_slug]);

    return { config, loading, error };
}
