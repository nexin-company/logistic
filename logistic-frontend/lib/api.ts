/**
 * Cliente API unificado para Logistics (combina Inventory + Shipments)
 * Las rutas API actúan como proxy y manejan la autenticación y API key server-side
 */

const PERMIT_API_BASE_URL = '/api/permit';
const LOGISTIC_API_BASE_URL = '/api/logistic';
const FACTORY_API_BASE_URL = '/api/factory';

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
  baseUrl: string,
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${baseUrl}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
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

// ==================== USUARIOS (Permit) ====================

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string | Date;
}

export interface CreateUserInput {
  name: string;
  email: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
}

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    return fetchApi<User[]>(PERMIT_API_BASE_URL, '/v1/users/');
  },

  getById: async (id: number): Promise<User> => {
    return fetchApi<User>(PERMIT_API_BASE_URL, `/v1/users/${id}`);
  },

  create: async (data: CreateUserInput): Promise<User> => {
    return fetchApi<User>(PERMIT_API_BASE_URL, '/v1/users/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: UpdateUserInput): Promise<User> => {
    return fetchApi<User>(PERMIT_API_BASE_URL, `/v1/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<{ message: string; user: User }> => {
    return fetchApi<{ message: string; user: User }>(PERMIT_API_BASE_URL, `/v1/users/${id}`, {
      method: 'DELETE',
    });
  },
};

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
    const res = await fetchApi<{ data: InternalItem[] }>(FACTORY_API_BASE_URL, '/v1/internal-items');
    return res.data;
  },
};

// ==================== CATALOG (External Products) ====================

export type ExternalProductStatus = 'active' | 'inactive' | 'archived';

export interface ExternalProduct {
  id: number;
  sku: string;
  name: string;
  status: ExternalProductStatus;
  basePrice: number;
  currency: string;
  imageUrl?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateExternalProductInput {
  sku: string;
  name: string;
  status?: ExternalProductStatus;
  basePrice: number;
  currency?: string;
  imageUrl?: string | null;
}

export interface UpdateExternalProductInput {
  sku?: string;
  name?: string;
  status?: ExternalProductStatus;
  basePrice?: number;
  currency?: string;
  imageUrl?: string | null;
}

export interface ExternalProductFilters {
  search?: string;
  status?: ExternalProductStatus;
  offset?: number;
  limit?: number;
}

export const catalogApi = {
  getAll: async (filters?: ExternalProductFilters): Promise<{ externalProducts: ExternalProduct[]; total: number; offset: number | null }> => {
    const params = new URLSearchParams();
    if (filters?.search) params.set('q', filters.search);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.offset) params.set('offset', filters.offset.toString());
    if (filters?.limit) params.set('limit', filters.limit.toString());
    
    const query = params.toString();
    const res = await fetchApi<{ data: ExternalProduct[]; total: number; offset: number | null; limit: number | null }>(
      LOGISTIC_API_BASE_URL,
      `/v1/catalog${query ? `?${query}` : ''}`
    );
    return {
      externalProducts: res.data,
      total: res.total ?? res.data.length,
      offset: res.offset ?? null,
    };
  },

  getById: async (id: number): Promise<ExternalProduct> => {
    const res = await fetchApi<{ data: ExternalProduct }>(LOGISTIC_API_BASE_URL, `/v1/catalog/${id}`);
    return res.data;
  },

  create: async (data: CreateExternalProductInput): Promise<ExternalProduct> => {
    const res = await fetchApi<{ data: ExternalProduct }>(LOGISTIC_API_BASE_URL, '/v1/catalog', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  update: async (id: number, data: UpdateExternalProductInput): Promise<ExternalProduct> => {
    const res = await fetchApi<{ data: ExternalProduct }>(LOGISTIC_API_BASE_URL, `/v1/catalog/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  delete: async (id: number): Promise<{ message: string; data: ExternalProduct }> => {
    return fetchApi<{ message: string; data: ExternalProduct }>(LOGISTIC_API_BASE_URL, `/v1/catalog/${id}`, {
      method: 'DELETE',
    });
  },
};

// Alias para compatibilidad
export const externalProductsApi = catalogApi;

// ==================== MAPPINGS ====================

export interface Mapping {
  id: number;
  internalItemId: number;
  externalProductId: number;
  note?: string | null;
  createdAt: string | Date;
  internalItem?: InternalItem;
  externalProduct?: ExternalProduct;
}

export interface CreateMappingInput {
  internalItemId: number;
  externalProductId: number;
  note?: string;
}

export interface MappingFilters {
  internalItemId?: number;
  externalProductId?: number;
}

export const mappingsApi = {
  getAll: async (filters?: MappingFilters): Promise<Mapping[]> => {
    const params = new URLSearchParams();
    if (filters?.internalItemId) params.set('internalItemId', filters.internalItemId.toString());
    if (filters?.externalProductId) params.set('externalProductId', filters.externalProductId.toString());
    
    const query = params.toString();
    const res = await fetchApi<{ data: Mapping[] }>(
      LOGISTIC_API_BASE_URL,
      `/v1/mappings/internal-to-external${query ? `?${query}` : ''}`
    );
    return res.data;
  },

  create: async (data: CreateMappingInput): Promise<Mapping> => {
    const res = await fetchApi<{ data: Mapping }>(LOGISTIC_API_BASE_URL, '/v1/mappings/internal-to-external', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },
};

// ==================== WAREHOUSES ====================

export interface Warehouse {
  id: number;
  code: string;
  name: string;
  createdAt: string | Date;
}

export const warehousesApi = {
  getAll: async (): Promise<Warehouse[]> => {
    const res = await fetchApi<{ data: Warehouse[] }>(LOGISTIC_API_BASE_URL, '/v1/warehouses');
    return res.data;
  },
};

// ==================== STOCK LEVELS ====================

export interface StockLevel {
  id: number;
  warehouseId: number;
  externalProductId: number;
  onHand: number;
  reserved: number;
  updatedAt: string | Date;
  warehouse?: Warehouse;
  externalProduct?: ExternalProduct;
}

export interface AdjustStockInput {
  warehouseId: number;
  externalProductId: number;
  deltaOnHand: number;
  deltaReserved?: number;
  reason?: string;
}

export const stockApi = {
  getAll: async (): Promise<StockLevel[]> => {
    const res = await fetchApi<{ data: StockLevel[] }>(LOGISTIC_API_BASE_URL, '/v1/stock');
    return res.data;
  },

  getByProduct: async (externalProductId: number): Promise<StockLevel[]> => {
    const res = await fetchApi<{ data: StockLevel[] }>(
      LOGISTIC_API_BASE_URL,
      `/v1/stock?externalProductId=${externalProductId}`
    );
    return res.data;
  },

  adjust: async (data: AdjustStockInput): Promise<StockLevel> => {
    const res = await fetchApi<{ data: StockLevel }>(LOGISTIC_API_BASE_URL, '/v1/stock/adjust', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },
};

// Alias para compatibilidad
export const stockLevelsApi = stockApi;

// ==================== SHIPMENTS ====================

export type ShipmentStatus =
  | 'pending'
  | 'packed'
  | 'shipped'
  | 'in_transit'
  | 'delivered'
  | 'exception'
  | 'cancelled';

export type ShipmentEventType =
  | 'created'
  | 'packed'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'exception';

export interface ShipmentEvent {
  id: number;
  shipmentId: number;
  type: ShipmentEventType;
  location?: string | null;
  message?: string | null;
  occurredAt: string | Date;
  createdAt: string | Date;
}

export interface Shipment {
  id: number;
  orderId: number;
  status: ShipmentStatus;
  carrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  events?: ShipmentEvent[];
}

export interface CreateShipmentInput {
  orderId: number;
  status?: ShipmentStatus;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

export interface UpdateShipmentStatusInput {
  toStatus: ShipmentStatus;
  reason?: string;
}

export interface AddShipmentEventInput {
  type: ShipmentEventType;
  location?: string;
  message?: string;
  occurredAt?: string;
}

export interface ShipmentFilters {
  orderId?: number;
}

export const shipmentsApi = {
  getAll: async (filters?: ShipmentFilters): Promise<Shipment[]> => {
    const params = new URLSearchParams();
    if (filters?.orderId) params.set('orderId', filters.orderId.toString());
    
    const query = params.toString();
    const res = await fetchApi<Shipment[] | { data: Shipment[] }>(
      LOGISTIC_API_BASE_URL,
      `/v1/shipments${query ? `?${query}` : ''}`
    );
    return Array.isArray(res) ? res : (res as { data: Shipment[] }).data || [];
  },

  getById: async (id: number): Promise<Shipment> => {
    const res = await fetchApi<Shipment>(LOGISTIC_API_BASE_URL, `/v1/shipments/${id}`);
    return res;
  },

  create: async (data: CreateShipmentInput): Promise<Shipment> => {
    const res = await fetchApi<Shipment>(LOGISTIC_API_BASE_URL, '/v1/shipments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res;
  },

  updateStatus: async (id: number, data: UpdateShipmentStatusInput): Promise<Shipment> => {
    const res = await fetchApi<Shipment>(LOGISTIC_API_BASE_URL, `/v1/shipments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res;
  },

  addEvent: async (id: number, data: AddShipmentEventInput): Promise<ShipmentEvent> => {
    const res = await fetchApi<ShipmentEvent>(LOGISTIC_API_BASE_URL, `/v1/shipments/${id}/events`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res;
  },
};

// ==================== NOTIFICACIONES (Permit) ====================

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  data?: any;
  readAt?: string | Date | null;
  actionUrl?: string | null;
  createdAt: string | Date;
}

export interface NotificationPreference {
  id: number;
  userId: number;
  channel: 'email' | 'in-app' | 'push';
  notificationType: string;
  enabled: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface UpdateNotificationPreferenceInput {
  channel: 'email' | 'in-app' | 'push';
  notificationType: string;
  enabled: boolean;
}

export const notificationsApi = {
  getAll: async (userId: number, filters?: { unreadOnly?: boolean; limit?: number }): Promise<Notification[]> => {
    const params = new URLSearchParams();
    params.set('userId', userId.toString());
    if (filters?.unreadOnly) params.set('unreadOnly', 'true');
    if (filters?.limit) params.set('limit', filters.limit.toString());
    return fetchApi<Notification[]>(PERMIT_API_BASE_URL, `/v1/notifications?${params.toString()}`);
  },
  getUnreadCount: async (userId: number): Promise<{ count: number }> => {
    return fetchApi<{ count: number }>(PERMIT_API_BASE_URL, `/v1/notifications/unread-count?userId=${userId}`);
  },
  markAsRead: async (id: number, userId: number): Promise<Notification> => {
    return fetchApi<Notification>(PERMIT_API_BASE_URL, `/v1/notifications/${id}/read?userId=${userId}`, {
      method: 'PUT',
    });
  },
  markAllAsRead: async (userId: number): Promise<{ message: string }> => {
    return fetchApi<{ message: string }>(PERMIT_API_BASE_URL, `/v1/notifications/read-all?userId=${userId}`, {
      method: 'PUT',
    });
  },
  getPreferences: async (userId: number): Promise<NotificationPreference[]> => {
    return fetchApi<NotificationPreference[]>(PERMIT_API_BASE_URL, `/v1/notifications/preferences?userId=${userId}`);
  },
  updatePreference: async (userId: number, data: UpdateNotificationPreferenceInput): Promise<NotificationPreference> => {
    return fetchApi<NotificationPreference>(PERMIT_API_BASE_URL, `/v1/notifications/preferences?userId=${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
