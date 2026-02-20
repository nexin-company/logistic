import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { neon } from '@neondatabase/serverless'
import { runMigrations } from '../src/migrations.js'
// Middleware
import { checkRateLimit, getRateLimitHeaders } from '../src/middleware/rate-limit.js'
import { getCorsHeaders, getSecurityHeaders } from '../src/middleware/cors.js'
import { ApiKeysService } from '../src/api-keys/service.js'
// Versionado
import { v1Routes } from './v1.js'

// Crear cliente con la URL HTTP de Neon
const neonClient = neon(process.env.DATABASE_URL!);

// API Key legacy para autenticación del frontend (compatibilidad hacia atrás)
const API_KEY = process.env.API_KEY || '';

const app = new Elysia()
    .onBeforeHandle(async ({ request, path, set }) => {
        const origin = request.headers.get('origin')
        
        // Agregar headers de CORS
        const corsHeaders = getCorsHeaders(origin)
        Object.entries(corsHeaders).forEach(([key, value]) => {
            set.headers[key] = value
        })

        // Determinar si es una ruta de Swagger para aplicar CSP más permisivo
        const isSwaggerPath = path.startsWith('/swagger') || path === '/swagger'
        
        // Agregar headers de seguridad (con CSP permisivo para Swagger)
        const securityHeaders = getSecurityHeaders(isSwaggerPath)
        Object.entries(securityHeaders).forEach(([key, value]) => {
            set.headers[key] = value
        })

        // Manejar preflight CORS
        if (request.method === 'OPTIONS') {
            set.status = 204
            return ''
        }

        // Rutas públicas que no requieren API key
        const publicPaths = ['/', '/swagger', '/db', '/available']
        const isPublicPath = publicPaths.includes(path) || path.startsWith('/swagger') || path.startsWith('/api-keys')
        
        if (!isPublicPath) {
            const apiKeyHeader = request.headers.get('x-api-key')
            
            if (!apiKeyHeader) {
                set.status = 401
                return {
                    error: 'No autorizado',
                    message: 'API Key faltante. Incluye el header X-API-Key'
                }
            }

            // Intentar validar como API key de la base de datos primero
            const validation = await ApiKeysService.validateApiKey(apiKeyHeader)
            
            if (validation.valid && validation.apiKey) {
                const rateLimit = validation.apiKey.rateLimit || 100
                const rateLimitCheck = checkRateLimit(validation.apiKey.id, rateLimit)
                
                const rateLimitHeaders = getRateLimitHeaders(validation.apiKey.id, rateLimit)
                Object.entries(rateLimitHeaders).forEach(([key, value]) => {
                    set.headers[key] = value
                })

                if (!rateLimitCheck.allowed) {
                    set.status = 429
                    return {
                        error: 'Rate limit excedido',
                        message: `Has excedido el límite de ${rateLimit} requests por minuto`,
                        retryAfter: Math.ceil((rateLimitCheck.resetAt - Date.now()) / 1000)
                    }
                }

                ;(set as any).apiKey = validation.apiKey
            } else if (apiKeyHeader === API_KEY && API_KEY) {
                // Compatibilidad con API key legacy del frontend
            } else {
                set.status = 401
                return {
                    error: 'No autorizado',
                    message: validation.error || 'API Key inválida'
                }
            }
        }
        
        // Ejecutar migraciones después de validar API key (solo si pasa la validación)
        try {
            await runMigrations()
        } catch (error) {
            console.error('❌ Error crítico en migraciones:', error)
            throw new Error(`Error al ejecutar migraciones: ${error}`)
        }
    })

// Registrar todas las rutas
app
    // Rutas básicas públicas
    .get('/', () => ({
        message: 'Logistics Backend API',
        version: '1.0.0',
        endpoints: {
            v1: '/v1',
            docs: '/swagger'
        },
        note: 'Todas las rutas de la API están bajo el prefijo /v1'
    }))
    .get('/db', async (ctx) => {
        const result = await neonClient`SELECT NOW()`
        return {
            message: 'Conectado a Neon vía HTTP con Elysia.js 😎',
            fecha: result![0]!.now
        }
    })
    // Rutas versionadas - Todas las rutas están bajo /v1
    .use(v1Routes)
    // Configurar Swagger DESPUÉS de registrar todas las rutas
    .use(swagger({
        documentation: {
            info: {
                title: 'Logistics Backend API',
                description: 'API para catálogo externo, stock, warehouses, mappings y shipments',
                version: '1.0.0'
            },
            tags: [
                { name: 'api-keys', description: 'Gestión de API keys' },
                { name: 'catalog', description: 'Catálogo externo' },
                { name: 'warehouses', description: 'Almacenes' },
                { name: 'stock', description: 'Niveles de stock' },
                { name: 'availability', description: 'Disponibilidad (onHand-reserved)' },
                { name: 'mappings', description: 'Mapeos internal→external' },
                { name: 'shipments', description: 'Shipments y tracking events' }
            ],
            servers: [
                {
                    url: 'http://localhost:8004',
                    description: 'Servidor de desarrollo'
                }
            ]
        }
    }))
    .compile()

export default app
