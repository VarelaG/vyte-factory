import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// Endpoint para subir imágenes locales
export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file = data.get('file') as File | null;
        const slug = data.get('slug') as string | null;

        if (!file || !slug) {
            return NextResponse.json({ error: 'Falta el archivo o el slug' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Carpeta donde guardar: public/uploads/slug/
        // hostinger public_html mapeará a la carpeta ./out o el dist default.
        const uploadDir = join(process.cwd(), 'public', 'uploads', slug);

        // Crear el directorio si no existe
        await mkdir(uploadDir, { recursive: true });

        // Nombre único para que no pise fotos
        const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        const filePath = join(uploadDir, uniqueName);

        await writeFile(filePath, buffer);

        // La URL pública que el frontend usará para mostrar la imagen (~/uploads/slug/nombre.jpg)
        const publicUrl = `/uploads/${slug}/${uniqueName}`;

        return NextResponse.json({ success: true, url: publicUrl });

    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: 'Error al subir la imagen' }, { status: 500 });
    }
}
