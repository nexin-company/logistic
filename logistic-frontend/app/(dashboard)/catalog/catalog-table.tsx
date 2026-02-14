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
  CardFooter,
} from '@/components/ui/card';
import { ExternalProduct as ExternalProductRow } from './external-product-row';
import { ExternalProduct as ExternalProductType } from '@/lib/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableCell } from '@/components/ui/table';

interface ExternalProductsTableProps {
  externalProducts: ExternalProductType[];
  total: number;
  currentOffset: number;
  nextOffset: number | null;
  onRefresh: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export function ExternalProductsTable({
  externalProducts,
  total,
  currentOffset,
  nextOffset,
  onRefresh,
  onPrevPage,
  onNextPage,
}: ExternalProductsTableProps) {
  const PRODUCTS_PER_PAGE = 5;

  const startIndex = Math.max(0, currentOffset - PRODUCTS_PER_PAGE);
  const endIndex = Math.min(currentOffset, total);
  
  // Asegurar que externalProducts siempre sea un array
  const safeProducts = Array.isArray(externalProducts) ? externalProducts : [];

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden md:table-cell">Precio Base</TableHead>
              <TableHead className="hidden md:table-cell">Moneda</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No se encontraron productos externos
                </TableCell>
              </TableRow>
            ) : (
              safeProducts.map((product) => (
                <ExternalProductRow key={product.id} externalProduct={product} onRefresh={onRefresh} />
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="flex items-center w-full justify-between">
          <div className="text-xs text-muted-foreground">
            Mostrando{' '}
            <strong>
              {total > 0 ? startIndex + 1 : 0}-{endIndex}
            </strong>{' '}
            de <strong>{total}</strong> productos externos
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onPrevPage}
              variant="ghost"
              size="sm"
              disabled={currentOffset === PRODUCTS_PER_PAGE}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
            <Button
              onClick={onNextPage}
              variant="ghost"
              size="sm"
              disabled={nextOffset === null}
            >
              Siguiente
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

