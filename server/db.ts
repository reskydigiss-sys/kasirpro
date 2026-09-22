import { createClient, Client } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const TURSO_DATABASE_URL =
  process.env.TURSO_DATABASE_URL ||
  'libsql://dbmycasir-reskydigiss-sys.aws-ap-northeast-1.turso.io';

const TURSO_AUTH_TOKEN =
  process.env.TURSO_AUTH_TOKEN ||
  'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJnaWQiOiIzYWMxNDZiNC03NTgzLTQ4OWItYjQ3Zi02MjMwZTBlZDdlZjgiLCJpYXQiOjE3OTAwNDY0NTksImtpZCI6IlEteVc4VmV5SEJHdC1LWmkwSkpMLTdBYVFrWE8zTkpFVm5FWWVkMERSMVkiLCJyaWQiOiI0YmFlNDNmYy03MTc1LTRhMmMtYWU1ZC02NmI0MWUxNjU0MjkifQ.tQV9SlfFbAwt-FovueikqsTCBF0DMer1QE9vWux4Z9MLFoYGf4TtxJdCb8K3TBQvy7qYoUHmEU0QUaWayv2PDQ';

let client: Client | null = null;

export function getDb(): Client {
  if (!client) {
    client = createClient({
      url: TURSO_DATABASE_URL,
      authToken: TURSO_AUTH_TOKEN
    });
  }
  return client;
}

export async function initDatabase() {
  const db = getDb();
  console.log('[Turso] Initializing database schema on Turso Cloud...');

  // 1. Tenants table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      store_name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // 2. Users table (Admins & Cashiers)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'cashier',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    );
  `);

  // 3. Products table (Tenant-scoped)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      sku TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      image_url TEXT,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    );
  `);

  // 4. Transactions table (Tenant-scoped & Cashier-scoped)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      cashier_id TEXT NOT NULL,
      cashier_name TEXT NOT NULL,
      receipt_number TEXT NOT NULL,
      subtotal REAL NOT NULL,
      discount REAL DEFAULT 0,
      tax REAL DEFAULT 0,
      total REAL NOT NULL,
      payment_method TEXT NOT NULL,
      amount_paid REAL NOT NULL,
      change_amount REAL DEFAULT 0,
      items_json TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Completed',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
      FOREIGN KEY (cashier_id) REFERENCES users(id)
    );
  `);

  console.log('[Turso] Database schema initialized successfully.');

  // Seed default demo tenant if table is empty
  const checkTenant = await db.execute('SELECT COUNT(*) as count FROM tenants');
  const count = Number(checkTenant.rows[0]?.count ?? 0);
  if (count === 0) {
    console.log('[Turso] Seeding default Demo Store on Turso...');
    const demoTenantId = 'tnt-demo-001';
    const demoUserId = 'usr-admin-001';
    // Password hash for 'admin123'
    const adminPasswordHash = '$2a$10$2lK0/Q.sY7g6fWqEreI4Z.ZpZfR5RkYJ3J2H9Q0kC7Q5L3u3B7O/y'; // generated or fallback

    await db.execute({
      sql: 'INSERT INTO tenants (id, store_name, slug) VALUES (?, ?, ?)',
      args: [demoTenantId, 'KASIRKU STORE (Demo)', 'demo-store']
    });

    await db.execute({
      sql: 'INSERT INTO users (id, tenant_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
      args: [demoUserId, demoTenantId, 'Admin User', 'admin@kasirku.app', '$2a$10$wN1L3hQO81hV4fX56jUkeOP4aFzR6Uj9w7K0tZ2C4h7X1vY3Z6B7q', 'owner']
    });

    const { seedInitialTenantProducts } = await import('./auth');
    await seedInitialTenantProducts(demoTenantId);
    console.log('[Turso] Demo store seeded successfully.');
  }
}
