import { NextRequest, NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // Prevent Vercel edge caching

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/tenant?slug=...
export async function GET(request: NextRequest) {
    noStore(); // Force absolute dynamic execution on this specific route
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
        return NextResponse.json({ error: 'Falta parámetro slug' }, { status: 400, headers: corsHeaders });
    }

    try {
        const tenant = await prisma.tenant.findUnique({
            where: { cliente_slug: slug },
            select: {
                id: true,
                cliente_slug: true,
                config: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!tenant) {
            return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 404, headers: corsHeaders });
        }

        return NextResponse.json(tenant, { headers: corsHeaders });
    } catch (error) {
        console.error('Error fetching tenant:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500, headers: corsHeaders });
    }
}

// POST /api/tenant
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { cliente_slug, config, password } = body;

        const cookieSlug = request.cookies.get('vyte_session')?.value;

        if (!cliente_slug) {
            return NextResponse.json({ error: 'slug requerido' }, { status: 400, headers: corsHeaders });
        }

        // Validar que exista sesión.
        // Si el cookieSlug es 'vyte' (Master), puede modificar cualquiera. Si no, debe coincidir con el cliente_slug.
        if (!cookieSlug || (cookieSlug !== 'vyte' && cookieSlug !== cliente_slug)) {
            return NextResponse.json({ error: 'No autorizado / Sesión inválida' }, { status: 401, headers: corsHeaders });
        }

        // Upsert: Si existe actualiza, si no, crea
        const tenantStringifiedConfig = typeof config === 'string' ? config : JSON.stringify(config || {});

        const tenant = await prisma.tenant.upsert({
            where: { cliente_slug },
            update: { config: tenantStringifiedConfig },
            create: { cliente_slug, config: tenantStringifiedConfig }
        });

        return NextResponse.json(tenant, { headers: corsHeaders });
    } catch (error) {
        console.error('Error saving tenant:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500, headers: corsHeaders });
    }
}
