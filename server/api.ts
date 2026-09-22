import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getDb } from './db';
import { tenantGuard, seedInitialTenantProducts, AuthenticatedUser } from './auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'kasirku-super-secure-multi-tenant-jwt-secret';

// ==========================================
// 1. HEALTH & TURSO DB STATUS
// ==========================================
router.get('/status', async (req, res) => {
  try {
    const db = getDb();
    const countRes = await db.execute('SELECT COUNT(*) as count FROM tenants');
    const tenantCount = countRes.rows[0]?.count ?? 0;
    res.json({
      status: 'connected',
      database: 'Turso Cloud LibSQL',
      tenantsRegistered: tenantCount,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ==========================================
// 2. AUTHENTICATION & MULTI-TENANT REGISTRATION
// ==========================================

// Register Admin + Create Isolated Workspace Store
router.post('/auth/register', async (req, res) => {
  const { storeName, name, email, password } = req.body;

  if (!storeName || !name || !email || !password) {
    return res.status(400).json({ error: 'Semua field (Nama Toko, Nama, Email, Password) wajib diisi.' });
  }

  const db = getDb();

  try {
    // Check if email is already taken
    const existing = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email.toLowerCase().trim()]
    });

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' });
    }

    // Generate unique slug for store workspace
    const baseSlug = storeName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'store';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const slug = `${baseSlug}-${randomSuffix}`;

    const tenantId = 'tnt-' + crypto.randomUUID();
    const userId = 'usr-' + crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);

    // 1. Create Tenant
    await db.execute({
      sql: 'INSERT INTO tenants (id, store_name, slug) VALUES (?, ?, ?)',
      args: [tenantId, storeName.trim(), slug]
    });

    // 2. Create Owner User
    await db.execute({
      sql: 'INSERT INTO users (id, tenant_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
      args: [userId, tenantId, name.trim(), email.toLowerCase().trim(), passwordHash, 'owner']
    });

    // 3. Seed initial retail products for this tenant
    await seedInitialTenantProducts(tenantId);

    // 4. Generate JWT
    const token = jwt.sign(
      {
        userId,
        tenantId,
        storeSlug: slug,
        storeName: storeName.trim(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role: 'owner'
      } as AuthenticatedUser,
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      message: 'Pendaftaran toko berhasil!',
      token,
      redirectUrl: `/pos/${slug}`,
      user: {
        id: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role: 'owner'
      },
      store: {
        id: tenantId,
        name: storeName.trim(),
        slug
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Gagal melakukan pendaftaran: ' + error.message });
  }
});

// Login Admin or Cashier
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password wajib diisi.' });
  }

  const db = getDb();

  try {
    // Query user and joined tenant
    const result = await db.execute({
      sql: `SELECT u.id, u.tenant_id, u.name, u.email, u.password_hash, u.role,
                   t.store_name, t.slug
            FROM users u
            JOIN tenants t ON u.tenant_id = t.id
            WHERE u.email = ?`,
      args: [email.toLowerCase().trim()]
    });

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email atau kata sandi tidak cocok.' });
    }

    const row = result.rows[0];
    const passwordValid = await bcrypt.compare(password, String(row.password_hash));

    if (!passwordValid) {
      return res.status(401).json({ error: 'Email atau kata sandi tidak cocok.' });
    }

    const userPayload: AuthenticatedUser = {
      userId: String(row.id),
      tenantId: String(row.tenant_id),
      storeSlug: String(row.slug),
      storeName: String(row.store_name),
      name: String(row.name),
      email: String(row.email),
      role: String(row.role)
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '30d' });

    return res.json({
      message: 'Login berhasil!',
      token,
      redirectUrl: `/pos/${row.slug}`,
      user: {
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role
      },
      store: {
        id: row.tenant_id,
        name: row.store_name,
        slug: row.slug
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan saat login: ' + error.message });
  }
});

// Get Current User Profile & Cashiers List
router.get('/auth/me', tenantGuard, async (req, res) => {
  const user = req.user!;
  const db = getDb();

  try {
    const cashiersRes = await db.execute({
      sql: 'SELECT id, name, email, role, created_at FROM users WHERE tenant_id = ? ORDER BY created_at ASC',
      args: [user.tenantId]
    });

    res.json({
      user,
      cashiers: cashiersRes.rows
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create additional Cashier for current tenant
router.post('/auth/cashiers', tenantGuard, async (req, res) => {
  const user = req.user!;
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nama kasir, email, dan password wajib diisi.' });
  }

  const db = getDb();
  try {
    const existing = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email.toLowerCase().trim()]
    });

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email kasir sudah terdaftar.' });
    }

    const newCashierId = 'usr-' + crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);

    await db.execute({
      sql: 'INSERT INTO users (id, tenant_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
      args: [newCashierId, user.tenantId, name.trim(), email.toLowerCase().trim(), passwordHash, 'cashier']
    });

    res.status(201).json({
      message: 'Kasir baru berhasil didaftarkan.',
      cashier: { id: newCashierId, name: name.trim(), email: email.toLowerCase().trim(), role: 'cashier' }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3. PRODUCTS (STRICTLY TENANT-SCOPED)
// ==========================================

// Get all products for the tenant
router.get('/pos/:storeSlug/products', tenantGuard, async (req, res) => {
  const tenantId = req.user!.tenantId;
  const db = getDb();

  try {
    const result = await db.execute({
      sql: `SELECT id, sku, name, category, price, stock, image_url as imageUrl, description
            FROM products
            WHERE tenant_id = ?
            ORDER BY name ASC`,
      args: [tenantId]
    });

    res.json({ products: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add new product
router.post('/pos/:storeSlug/products', tenantGuard, async (req, res) => {
  const tenantId = req.user!.tenantId;
  const { sku, name, category, price, stock, imageUrl, description } = req.body;

  if (!sku || !name || !category || price === undefined) {
    return res.status(400).json({ error: 'Data produk tidak lengkap.' });
  }

  const db = getDb();
  const newId = 'prod-' + crypto.randomUUID();

  try {
    await db.execute({
      sql: `INSERT INTO products (id, tenant_id, sku, name, category, price, stock, image_url, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [newId, tenantId, sku.trim(), name.trim(), category, Number(price) || 0, Number(stock) || 0, imageUrl || '', description || '']
    });

    res.status(201).json({
      message: 'Produk berhasil ditambahkan.',
      product: {
        id: newId,
        sku: sku.trim(),
        name: name.trim(),
        category,
        price: Number(price) || 0,
        stock: Number(stock) || 0,
        imageUrl: imageUrl || '',
        description: description || ''
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update product
router.put('/pos/:storeSlug/products/:id', tenantGuard, async (req, res) => {
  const tenantId = req.user!.tenantId;
  const prodId = req.params.id;
  const { sku, name, category, price, stock, imageUrl, description } = req.body;

  const db = getDb();
  try {
    const result = await db.execute({
      sql: `UPDATE products
            SET sku = ?, name = ?, category = ?, price = ?, stock = ?, image_url = ?, description = ?
            WHERE id = ? AND tenant_id = ?`,
      args: [sku, name, category, Number(price) || 0, Number(stock) || 0, imageUrl || '', description || '', prodId, tenantId]
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'Produk tidak ditemukan atau bukan milik toko Anda.' });
    }

    res.json({ message: 'Produk berhasil diperbarui.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
router.delete('/pos/:storeSlug/products/:id', tenantGuard, async (req, res) => {
  const tenantId = req.user!.tenantId;
  const prodId = req.params.id;

  const db = getDb();
  try {
    const result = await db.execute({
      sql: `DELETE FROM products WHERE id = ? AND tenant_id = ?`,
      args: [prodId, tenantId]
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'Produk tidak ditemukan.' });
    }

    res.json({ message: 'Produk berhasil dihapus.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Quick stock adjustment
router.patch('/pos/:storeSlug/products/:id/stock', tenantGuard, async (req, res) => {
  const tenantId = req.user!.tenantId;
  const prodId = req.params.id;
  const { newStock } = req.body;

  const db = getDb();
  try {
    await db.execute({
      sql: `UPDATE products SET stock = ? WHERE id = ? AND tenant_id = ?`,
      args: [Number(newStock) || 0, prodId, tenantId]
    });

    res.json({ message: 'Stok berhasil diperbarui.', newStock });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 4. TRANSACTIONS (TENANT & CASHIER ISOLATION)
// ==========================================

// Get transactions
router.get('/pos/:storeSlug/transactions', tenantGuard, async (req, res) => {
  const tenantId = req.user!.tenantId;
  const db = getDb();

  try {
    const result = await db.execute({
      sql: `SELECT id, receipt_number, cashier_id, cashier_name, subtotal, discount, tax,
                   total, payment_method, amount_paid, change_amount, items_json, status, created_at
            FROM transactions
            WHERE tenant_id = ?
            ORDER BY created_at DESC`,
      args: [tenantId]
    });

    const parsedTx = result.rows.map((r: any) => ({
      id: r.receipt_number || r.id,
      timestamp: r.created_at,
      dateFormatted: new Date(r.created_at).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }),
      cashierName: r.cashier_name,
      subtotal: Number(r.subtotal),
      discount: Number(r.discount),
      tax: Number(r.tax),
      total: Number(r.total),
      paymentMethod: r.payment_method,
      amountPaid: Number(r.amount_paid),
      change: Number(r.change_amount),
      status: r.status,
      items: JSON.parse(r.items_json || '[]')
    }));

    res.json({ transactions: parsedTx });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Checkout transaction
router.post('/pos/:storeSlug/checkout', tenantGuard, async (req, res) => {
  const tenantId = req.user!.tenantId;
  const cashierId = req.user!.userId;
  const cashierName = req.user!.name;

  const { items, subtotal, discount, tax, total, paymentMethod, amountPaid, change } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ error: 'Keranjang belanja kosong.' });
  }

  const db = getDb();
  const txId = 'trx-' + crypto.randomUUID();
  const receiptNumber = 'TRX-' + Math.floor(100 + Math.random() * 900);

  try {
    // 1. Deduct stock for each product belonging to tenant
    for (const item of items) {
      await db.execute({
        sql: `UPDATE products
              SET stock = MAX(0, stock - ?)
              WHERE id = ? AND tenant_id = ?`,
        args: [Number(item.quantity) || 1, item.productId, tenantId]
      });
    }

    // 2. Insert transaction
    await db.execute({
      sql: `INSERT INTO transactions
            (id, tenant_id, cashier_id, cashier_name, receipt_number, subtotal, discount, tax, total, payment_method, amount_paid, change_amount, items_json, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Completed')`,
      args: [
        txId,
        tenantId,
        cashierId,
        cashierName,
        receiptNumber,
        Number(subtotal) || 0,
        Number(discount) || 0,
        Number(tax) || 0,
        Number(total) || 0,
        paymentMethod,
        Number(amountPaid) || 0,
        Number(change) || 0,
        JSON.stringify(items)
      ]
    });

    res.status(201).json({
      message: 'Transaksi berhasil diproses.',
      transaction: {
        id: receiptNumber,
        timestamp: new Date().toISOString(),
        cashierName,
        subtotal,
        discount,
        tax,
        total,
        paymentMethod,
        amountPaid,
        change,
        items,
        status: 'Completed'
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
