import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Forzamos el root al directorio actual para evitar que Next.js escanee toda tu carpeta de usuario
  // Esto previene que se trabe la computadora debido a archivos package-lock.json en carpetas superiores.
  experimental: {
    turbopack: {
      root: '.',
    },
  } as any,
};

export default nextConfig;
