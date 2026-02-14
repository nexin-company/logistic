import { mappingsApi, type Mapping } from '@/lib/api-server';
import { MappingsPageClient } from './mappings-page-client';

export const dynamic = 'force-dynamic';

export default async function MappingsPage() {
  let mappings: Mapping[] = [];
  
  try {
    const result = await mappingsApi.getAll();
    mappings = Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Error fetching mappings:', error);
  }

  return <MappingsPageClient initialMappings={mappings} />;
}

