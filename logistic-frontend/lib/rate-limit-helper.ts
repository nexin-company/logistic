import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { rateLimit, RateLimitResult } from '@/lib/rate-limit';

interface RateLimitResponse {
  response: NextResponse | null;
  rateLimitResult: RateLimitResult;
}

export async function applyRateLimit(
  request: NextRequest,
  type: 'get' | 'mutation' = 'get'
): Promise<RateLimitResponse> {
  const session = await auth();
  let identifier: string | undefined = session?.user?.email ?? undefined;
  if (!identifier) {
    const xff = request.headers.get('x-forwarded-for');
    if (xff) {
      identifier = xff.split(',')[0].trim();
    } else {
      identifier = 'unknown';
    }
  }

  const rateLimitResult = type === 'get'
    ? rateLimit.get(identifier)
    : rateLimit.mutation(identifier);

  if (!rateLimitResult.success) {
    const response = NextResponse.json(
      {
        error: 'Demasiadas solicitudes',
        message: 'Has excedido el límite de solicitudes. Intenta de nuevo más tarde.',
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
          'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
        },
      }
    );
    return { response, rateLimitResult };
  }

  return { response: null, rateLimitResult };
}

export function addRateLimitHeaders(
  response: NextResponse,
  rateLimitResult: RateLimitResult
): NextResponse {
  response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.reset).toISOString());
  return response;
}

