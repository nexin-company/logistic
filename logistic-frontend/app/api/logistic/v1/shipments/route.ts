import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { applyRateLimit, addRateLimitHeaders } from '@/lib/rate-limit-helper';

const LOGISTIC_API_URL = process.env.LOGISTIC_API_URL || 'http://localhost:8004';
const LOGISTIC_API_KEY = process.env.LOGISTIC_API_KEY || '';

export const revalidate = 60;

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { response: rateLimitResponse, rateLimitResult } = await applyRateLimit(request, 'get');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { searchParams } = new URL(request.url);
    const url = new URL(`${LOGISTIC_API_URL}/v1/shipments`);
    
    searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': LOGISTIC_API_KEY,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Error al obtener shipments' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const nextResponse = NextResponse.json(data);
    nextResponse.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    
    return addRateLimitHeaders(nextResponse, rateLimitResult);
  } catch (error: any) {
    console.error('Error en GET /api/logistic/v1/shipments:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener shipments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { response: rateLimitResponse, rateLimitResult } = await applyRateLimit(request, 'mutation');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();

    const response = await fetch(`${LOGISTIC_API_URL}/v1/shipments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': LOGISTIC_API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Error al crear shipment' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return addRateLimitHeaders(NextResponse.json(data, { status: 201 }), rateLimitResult);
  } catch (error: any) {
    console.error('Error en POST /api/logistic/v1/shipments:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear shipment' },
      { status: 500 }
    );
  }
}

