'use client';

import {
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  Table
} from '@/components/ui/table';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Mapping as MappingType, type InternalItem, type ExternalProduct } from '@/lib/api';
import { TableCell } from '@/components/ui/table';

interface MappingsTableProps {
  mappings: MappingType[];
  internalItems: InternalItem[];
  externalProducts: ExternalProduct[];
  onRefresh: () => void;
}

export function MappingsTable({
  mappings,
  internalItems,
  externalProducts,
  onRefresh,
}: MappingsTableProps) {
  const getInternalItemName = (id: number) => {
    const item = internalItems.find(i => i.id === id);
    return item ? `${item.sku} - ${item.name}` : `Item ${id}`;
  };

  const getExternalProductName = (id: number) => {
    const product = externalProducts.find(p => p.id === id);
    return product ? `${product.sku} - ${product.name}` : `Producto ${id}`;
  };

  // Asegurar que mappings siempre sea un array
  const safeMappings = Array.isArray(mappings) ? mappings : [];

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Interno</TableHead>
              <TableHead>Producto Externo</TableHead>
              <TableHead className="hidden md:table-cell">Nota</TableHead>
              <TableHead className="hidden md:table-cell">Creado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeMappings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No se encontraron mapeos
                </TableCell>
              </TableRow>
            ) : (
              safeMappings.map((mapping) => (
                <TableRow key={mapping.id}>
                  <TableCell className="font-medium">
                    {getInternalItemName(mapping.internalItemId)}
                  </TableCell>
                  <TableCell>
                    {getExternalProductName(mapping.externalProductId)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {mapping.note || '-'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(mapping.createdAt).toLocaleDateString('es-ES')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

