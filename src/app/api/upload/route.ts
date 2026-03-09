import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    try {
        const data = await request.formData();
        const file = data.get('file') as File | null;
        const slug = data.get('slug') as string | null;

        if (!file || !slug) {
            return NextResponse.json({ error: 'Falta el archivo o el slug' }, { status: 400 });
        }

        // Subir a Vercel Blob
        // Agregamos el slug como prefijo en el nombre para mantener orden
        const blob = await put(`uploads/${slug}/${Date.now()}-${file.name}`, file, {
            access: 'public',
        });

        return NextResponse.json({ success: true, url: blob.url });
    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: 'Error al subir la imagen a la nube' }, { status: 500 });
    }
}
