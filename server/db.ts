import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// For development, use a default local database URL if not provided
const databaseUrl = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/bailbond_dev';

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });