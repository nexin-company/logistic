import './globals.css';

import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: 'Logistics - Catálogo, Stock y Embarques',
  description:
    'Sistema de gestión logística: catálogo externo, stock, warehouses, mappings y shipments. Administra productos, niveles de stock, almacenes y tracking de embarques.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="flex min-h-screen w-full flex-col">{children}</body>
      <Analytics />
    </html>
  );
}

