/**
 * Cliente API server-side unificado para Logistics (combina Inventory + Shipments)
 * La API key se mantiene solo en el servidor
 */

import 'server-only';
import { auth } from '@/lib/auth';
import { 
  ExternalProduct,
  CreateExternalProductInput,
  UpdateExternalProductInput,
  ExternalProductFilters,
  Mapping,
  CreateMappingInput,
  MappingFilters,
  StockLevel,
  AdjustStockInput,
  Warehouse,
  User,
  CreateUserInput,
  UpdateUserInput,
  Shipment,
  CreateShipmentInput,
  UpdateShipmentStatusInput,
  AddShipmentEventInput,
  ShipmentFilters,
} from './api';

// Para usuarios, siempre usar el backend de Permit
const PERMIT_API_URL = process.env.PERMIT_API_URL || 'http://localhost:8000';
const PERMIT_API_KEY = process.env.PERMIT_API_KEY || '';

// Para Logistics, usar el backend de Logistics
const LOGISTIC_API_URL = process.env.LOGISTIC_API_URL || 'http://localhost:8004';
const LOGISTIC_API_KEY = process.env.LOGISTIC_API_KEY || PERMIT_API_KEY;

// Para Factory, usar el backend de Factory
const FACTORY_API_URL = process.env.FACTORY_API_URL || 'http://localhost:8000';
const FACTORY_API_KEY = process.env.FACTORY_API_KEY || LOGISTIC_API_KEY;

if (!PERMIT_API_KEY) {
  console.warn('⚠️ PERMIT_API_KEY no está configurada. Las llamadas al backend pueden fallar.');
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
  usePermitBackend: boolean = false,
  useFactoryBackend: boolean = false
): Promise<T> {
  const session = await auth();
  if (!session?.user) {
    throw new ApiError('No autenticado', 401);
  }

  const baseUrl = usePermitBackend ? PERMIT_API_URL : (useFactoryBackend ? FACTORY_API_URL : LOGISTIC_API_URL);
  const apiKey = usePermitBackend ? PERMIT_API_KEY : (useFactoryBackend ? FACTORY_API_KEY : LOGISTIC_API_KEY);
  const url = `${baseUrl}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || `HTTP error! status: ${response.status}`,
      response.status,
      errorData
    );
  }

  return response.json();
}

// ==================== INTERNAL ITEMS (Factory) ====================

export interface InternalItem {
  id: number;
  sku: string;
  name: string;
  description?: string | null;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string | Date;
  updatedAt: string | Date;
}

export const internalItemsApi = {
  getAll: async (): Promise<InternalItem[]> => {
    const res = await fetchApi<{ data: InternalItem[] }>('/v1/internal-items', undefined, false, true);
    return res.data;
  },
};

// Re-exportar tipos del cliente público
export type {
  ExternalProduct,
  CreateExternalProductInput,
  UpdateExternalProductInput,
  ExternalProductFilters,
  Mapping,
  CreateMappingInput,
  MappingFilters,
  StockLevel,
  AdjustStockInput,
  Warehouse,
  User,
  CreateUserInput,
  UpdateUserInput,
  Shipment,
  CreateShipmentInput,
  UpdateShipmentStatusInput,
  AddShipmentEventInput,
  ShipmentFilters,
} from './api';

// ==================== USUARIOS (Permit) ====================

export const usersApi = {
  getAll: async () => {
    return fetchApi<User[]>('/v1/users/', undefined, true);
  },

  getById: async (id: number) => {
    return fetchApi<User>(`/v1/users/${id}`, undefined, true);
  },

  create: async (data: CreateUserInput) => {
    return fetchApi<User>('/v1/users/', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  },

  update: async (id: number, data: UpdateUserInput) => {
    return fetchApi<User>(`/v1/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true);
  },

  delete: async (id: number) => {
    return fetchApi<{ message: string; user: User }>(`/v1/users/${id}`, {
      method: 'DELETE',
    }, true);
  },
};

// ==================== CATALOG (External Products) ====================

export const catalogApi = {
  getAll: async (filters?: ExternalProductFilters): Promise<{ externalProducts: ExternalProduct[]; total: number; offset: number | null }> => {
    const params = new URLSearchParams();
    if (filters?.search) params.set('q', filters.search);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.offset) params.set('offset', filters.offset.toString());
    if (filters?.limit) params.set('limit', filters.limit.toString());
    
    const query = params.toString();
    const res = await fetchApi<{ data: ExternalProduct[]; total: number; offset: number | null; limit: number | null }>(
      `/v1/catalog${query ? `?${query}` : ''}`
    );
    return {
      externalProducts: res.data,
      total: res.total ?? res.data.length,
      offset: res.offset ?? null,
    };
  },

  getById: async (id: number): Promise<ExternalProduct> => {
    const res = await fetchApi<{ data: ExternalProduct }>(`/v1/catalog/${id}`);
    return res.data;
  },

  create: async (data: CreateExternalProductInput): Promise<ExternalProduct> => {
    const res = await fetchApi<{ data: ExternalProduct }>('/v1/catalog', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  update: async (id: number, data: UpdateExternalProductInput): Promise<ExternalProduct> => {
    const res = await fetchApi<{ data: ExternalProduct }>(`/v1/catalog/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  delete: async (id: number): Promise<{ message: string; data: ExternalProduct }> => {
    return fetchApi<{ message: string; data: ExternalProduct }>(`/v1/catalog/${id}`, {
      method: 'DELETE',
    });
  },
};

// Alias para compatibilidad
export const externalProductsApi = catalogApi;

// ==================== MAPPINGS ====================

export const mappingsApi = {
  getAll: async (filters?: MappingFilters): Promise<Mapping[]> => {
    const params = new URLSearchParams();
    if (filters?.internalItemId) params.set('internalItemId', filters.internalItemId.toString());
    if (filters?.externalProductId) params.set('externalProductId', filters.externalProductId.toString());
    
    const query = params.toString();
    const res = await fetchApi<{ data: Mapping[] }>(
      `/v1/mappings/internal-to-external${query ? `?${query}` : ''}`
    );
    return res.data;
  },

  create: async (data: CreateMappingInput): Promise<Mapping> => {
    const res = await fetchApi<{ data: Mapping }>('/v1/mappings/internal-to-external', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },
};

// ==================== WAREHOUSES ====================

export const warehousesApi = {
  getAll: async (): Promise<Warehouse[]> => {
    const res = await fetchApi<{ data: Warehouse[] }>('/v1/warehouses');
    return res.data;
  },
};

// ==================== STOCK ====================

export const stockApi = {
  getAll: async (): Promise<StockLevel[]> => {
    const res = await fetchApi<{ data: StockLevel[] }>('/v1/stock');
    return res.data;
  },

  getByProduct: async (externalProductId: number): Promise<StockLevel[]> => {
    const res = await fetchApi<{ data: StockLevel[] }>(
      `/v1/stock?externalProductId=${externalProductId}`
    );
    return res.data;
  },

  adjust: async (data: AdjustStockInput): Promise<StockLevel> => {
    const res = await fetchApi<{ data: StockLevel }>('/v1/stock/adjust', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },
};

// Alias para compatibilidad
export const stockLevelsApi = stockApi;

// ==================== SHIPMENTS ====================

export const shipmentsApi = {
  getAll: async (filters?: ShipmentFilters): Promise<Shipment[]> => {
    const params = new URLSearchParams();
    if (filters?.orderId) params.set('orderId', filters.orderId.toString());
    
    const query = params.toString();
    const res = await fetchApi<Shipment[] | { data: Shipment[] }>(
      `/v1/shipments${query ? `?${query}` : ''}`
    );
    return Array.isArray(res) ? res : (res as { data: Shipment[] }).data || [];
  },

  getById: async (id: number): Promise<Shipment> => {
    const res = await fetchApi<Shipment>(`/v1/shipments/${id}`);
    return res;
  },

  create: async (data: CreateShipmentInput): Promise<Shipment> => {
    const res = await fetchApi<Shipment>('/v1/shipments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res;
  },

  updateStatus: async (id: number, data: UpdateShipmentStatusInput): Promise<Shipment> => {
    const res = await fetchApi<Shipment>(`/v1/shipments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res;
  },

  addEvent: async (id: number, data: AddShipmentEventInput): Promise<any> => {
    const res = await fetchApi<any>(`/v1/shipments/${id}/events`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res;
  },
};
