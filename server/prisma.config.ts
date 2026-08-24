import { defineConfig } from 'prisma/config';
import path from 'node:path';
import { config as dotenvConfig } from 'dotenv';

// Charger le .env avant que Prisma ne lise les variables d'environnement
dotenvConfig({ path: path.resolve(process.cwd(), '.env') });

/**
 * Configuration Prisma 7 — la datasource URL est définie ici
 * et non plus dans schema.prisma.
 *
 * @see https://pris.ly/d/config-datasource
 */
export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
