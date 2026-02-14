# Logistics Module

Módulo unificado que combina las funcionalidades de Inventory y Shipments en un solo módulo de logística.

## Descripción

El módulo Logistics gestiona:
- **Catálogo externo**: Productos externos (SKU vendible + presentaciones)
- **Almacenes**: Warehouses
- **Stock**: Niveles de stock (onHand/reserved/available)
- **Mapeos**: Mapping internal→external (Factory→Logistics)
- **Embarques**: Shipments, tracking events, carriers

## Estructura

```
logistic-juampamillan/
├── logistic-backend/     # Backend API (Elysia + Drizzle)
│   ├── src/
│   │   ├── api-keys/     # Gestión de API keys
│   │   ├── audit/        # Integración con Permit para audit logs
│   │   ├── catalog/      # Productos externos
│   │   ├── warehouses/   # Almacenes
│   │   ├── stock/        # Niveles de stock
│   │   ├── mappings/     # Mapeos internal→external
│   │   ├── shipments/    # Embarques y tracking
│   │   └── availability/ # Disponibilidad calculada
│   └── drizzle/          # Migraciones SQL
└── logistic-frontend/    # Frontend Next.js
    └── app/
        └── (dashboard)/
            ├── catalog/      # Gestión de catálogo
            ├── warehouses/   # Gestión de almacenes
            ├── stock/        # Gestión de stock
            ├── mappings/     # Gestión de mapeos
            └── shipments/    # Gestión de embarques
```

## Variables de Entorno

### Backend

```env
DATABASE_URL=postgresql://...          # Base de datos de Logistics
PERMIT_API_URL=http://localhost:8000   # URL del backend de Permit
PERMIT_API_KEY=...                     # API key para Permit
FACTORY_API_URL=http://localhost:8000  # URL del backend de Factory (opcional, para validaciones)
FACTORY_API_KEY=...                     # API key para Factory (opcional)
CORS_ORIGIN=*                          # Origen permitido para CORS
PORT=8004                              # Puerto del servidor
```

### Frontend

```env
LOGISTIC_API_URL=http://localhost:8004 # URL del backend de Logistics
LOGISTIC_API_KEY=...                   # API key para Logistics
PERMIT_API_URL=http://localhost:8000   # URL del backend de Permit
PERMIT_API_KEY=...                     # API key para Permit
FACTORY_API_URL=http://localhost:8000  # URL del backend de Factory
FACTORY_API_KEY=...                    # API key para Factory
AUTH_GITHUB_ID=...                     # GitHub OAuth ID
AUTH_GITHUB_SECRET=...                 # GitHub OAuth Secret
```

## Migración de Datos

Para migrar datos de Inventory y Shipments a Logistics:

```bash
cd logistic-backend
INVENTORY_DATABASE_URL=... SHIPMENTS_DATABASE_URL=... DATABASE_URL=... bun run scripts/migrate-data.ts
```

## API Endpoints

### Catalog (External Products)
- `GET /v1/catalog` - Listar productos externos
- `GET /v1/catalog/:id` - Obtener producto por ID
- `POST /v1/catalog` - Crear producto
- `PUT /v1/catalog/:id` - Actualizar producto
- `DELETE /v1/catalog/:id` - Eliminar producto

### Warehouses
- `GET /v1/warehouses` - Listar almacenes
- `GET /v1/warehouses/:id` - Obtener almacén por ID
- `POST /v1/warehouses` - Crear almacén
- `PUT /v1/warehouses/:id` - Actualizar almacén
- `DELETE /v1/warehouses/:id` - Eliminar almacén

### Stock
- `GET /v1/stock` - Listar niveles de stock
- `POST /v1/stock/adjust` - Ajustar stock (upsert)

### Availability
- `GET /v1/availability` - Consultar disponibilidad (onHand-reserved)

### Mappings
- `GET /v1/mappings/internal-to-external` - Listar mapeos
- `POST /v1/mappings/internal-to-external` - Crear mapeo

### Shipments
- `GET /v1/shipments` - Listar shipments (opcional por orderId)
- `GET /v1/shipments/:id` - Obtener shipment por ID
- `POST /v1/shipments` - Crear shipment
- `PUT /v1/shipments/:id/status` - Actualizar status
- `POST /v1/shipments/:id/events` - Agregar evento de tracking

## Integraciones

- **Vendor**: Consulta catálogo, stock y shipments (solo lectura)
- **Factory**: Referencia para validar internalItemId en mappings
- **Permit**: Audit logs y autenticación de usuarios

## Desarrollo

```bash
# Backend
cd logistic-backend
bun install
bun run dev

# Frontend
cd logistic-frontend
bun install
bun run dev
```

