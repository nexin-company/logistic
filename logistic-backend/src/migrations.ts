import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import * as schema from './schema.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let migrationsRun = false;
let migrationsPromise: Promise<void> | null = null;

export async function runMigrations(): Promise<void> {
  if (migrationsRun) {
    return;
  }

  if (migrationsPromise) {
    return migrationsPromise;
  }

  migrationsPromise = (async () => {
    try {
      const sql = neon(process.env.DATABASE_URL!);
      const db = drizzle(sql, { schema });

      const possiblePaths = [
        join(__dirname, '../drizzle'),
        join(process.cwd(), 'drizzle'),
        './drizzle',
      ];

      let migrationsExecuted = false;
      let lastError: Error | null = null;

      for (const migrationsFolder of possiblePaths) {
        try {
          console.log(`🔄 Intentando ejecutar migraciones desde: ${migrationsFolder}`);
          await migrate(db, { migrationsFolder });
          migrationsRun = true;
          migrationsExecuted = true;
          console.log('✅ Migraciones ejecutadas correctamente');
          return;
        } catch (error: any) {
          lastError = error;
          if (
            error.message?.includes('ENOENT') ||
            error.message?.includes('not found') ||
            error.message?.includes('No such file') ||
            error.message?.includes('_journal.json')
          ) {
            console.log(`ℹ️ No se encontraron migraciones en: ${migrationsFolder}`);
            continue;
          } else {
            throw error;
          }
        }
      }

      if (!migrationsExecuted) {
        console.log('ℹ️ No se encontraron migraciones generadas en ninguna ubicación.');
        console.log('💡 Paths intentados:', possiblePaths.join(', '));
        console.log('💡 Para sincronizar la BD con schemas, ejecuta:');
        console.log('   - Desarrollo: bun run db:push');
        console.log('   - Producción: bun run db:generate && bun run db:migrate');
        
        if (process.env.VERCEL) {
          console.log('⚠️ Ejecutando en Vercel sin migraciones Drizzle. Usando migraciones SQL directas.');
          migrationsRun = true;
          return;
        }
        
        migrationsRun = true;
      }
      
    } catch (error: any) {
      console.error('❌ Error al ejecutar migraciones:', error);
      
      if (process.env.VERCEL) {
        console.warn('⚠️ Error en migraciones Drizzle en Vercel. Continuando con migraciones SQL directas.');
        migrationsRun = true;
        return;
      }
      
      if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️ Continuando sin migraciones (modo desarrollo)');
        migrationsRun = true;
      } else {
        migrationsRun = false;
        migrationsPromise = null;
        throw error;
      }
    }
  })();

  return migrationsPromise;
}

