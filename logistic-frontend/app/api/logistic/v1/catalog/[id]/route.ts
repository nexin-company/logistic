import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { applyRateLimit, addRateLimitHeaders } from '@/lib/rate-limit-helper';

const LOGISTIC_API_URL = process.env.LOGISTIC_API_URL || 'http://localhost:8004';
const LOGISTIC_API_KEY = process.env.LOGISTIC_API_KEY || '';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { response: rateLimitResponse, rateLimitResult } = await applyRateLimit(request, 'get');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { id } = await params;
    const response = await fetch(`${LOGISTIC_API_URL}/v1/catalog/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': LOGISTIC_API_KEY,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Error al obtener producto' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const nextResponse = NextResponse.json(data);
    nextResponse.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    
    return addRateLimitHeaders(nextResponse, rateLimitResult);
  } catch (error: any) {
    console.error('Error en GET /api/logistic/v1/catalog/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener producto' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { response: rateLimitResponse, rateLimitResult } = await applyRateLimit(request, 'mutation');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { id } = await params;
    const body = await request.json();

    const response = await fetch(`${LOGISTIC_API_URL}/v1/catalog/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': LOGISTIC_API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Error al actualizar producto' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return addRateLimitHeaders(NextResponse.json(data), rateLimitResult);
  } catch (error: any) {
    console.error('Error en PUT /api/logistic/v1/catalog/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar producto' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { response: rateLimitResponse, rateLimitResult } = await applyRateLimit(request, 'mutation');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { id } = await params;
    const response = await fetch(`${LOGISTIC_API_URL}/v1/catalog/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': LOGISTIC_API_KEY,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Error al eliminar producto' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return addRateLimitHeaders(NextResponse.json(data), rateLimitResult);
  } catch (error: any) {
    console.error('Error en DELETE /api/logistic/v1/catalog/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Error al eliminar producto' },
      { status: 500 }
    );
  }
}

