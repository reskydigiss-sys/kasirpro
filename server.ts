import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@libsql/client';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Turso Database client configuration
const TURSO_URL =
  process.env.TURSO_DATABASE_URL ||
  'libsql://mycasir3-reskydigiss-sys.aws-ap-northeast-1.turso.io';
const TURSO_AUTH_TOKEN =
  process.env.TURSO_AUTH_TOKEN ||
  'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTAwNDY4NzUsImlkIjoiMDFhMGM3MWItN2EwMS03OTkzLWI2NmMtNWJlNTEyMTRlZGMxIiwia2lkIjoiUS15VzhWZXlIQkd0LUtaaTBKSkwtN0FhUWtYTzNOSkVWbkVZZWQwRFIxWSIsInJpZCI6ImI2MTI5ZDMwLTQzNGYtNGVlMS05ZmZmLWQ5NTUxNzM4NzcyNyJ9.7ksta2IZSR1rFsPmZpOGlanPqFU9MKQO_zyvahlODOzUi6t3jfNpzUqhFnYcLR0i9_tnIgGAsUI5lyUDNwiYCg';

export const turso = createClient({
  url: TURSO_URL,
  authToken: TURSO_AUTH_TOKEN
});

// Seed data
const DEFAULT_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Buku Tulis Sidu 38 Lembar',
    sku: 'BK-001',
    category: 'Alat Tulis',
    price: 4500,
    stock: 45,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAWW76GKrLBTCDPU-15OqGlAsg0ZdMyrp29rnjrATXZjjHbXh0cEgy-_de07xfSGXijdKHZcBwMfe6YZ6rL-SGyEFwJoXY_RhZegyY4H7QTkxuaWdHQgYE_Qg3dxFG6r9_VAzx1aLq_qDqM84lZf_BNaLRZ7SSl-MYGl-eyWH34Xu9km2bWeozfS2X-aBI1rLZT5zqWaHlwbpakHHh3pjttKBmmR24VicyDvyp2ReLndzUSsy_WTeaC5g',
    description: 'Buku tulis garis standar 38 lembar cocok untuk keperluan sekolah dan kantor.'
  },
  {
    id: 'prod-2',
    name: 'Pensil 2B Faber Castell',
    sku: 'ATK-022',
    category: 'Alat Tulis',
    price: 3000,
    stock: 120,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuACj3agCdrEhwrCTgQjX-BD-xBzSpTlNcNdtZ_1KsUA5Sy5VnyvifzOyzl4s8v65lpfSFDXDJIX6rdzSC_qqCUK--7h-HlNJ82rXKo2_xB-mxO1mb35u1WUm4VpdpkC4dxnsgxOZs19BGGTQODnqybchzyozPDDqYgGdwNcfHN4eDIM47vVVYEAd_BnVE7cT7Nsj3GRIeNUoCP6xgPiZ7Yq4mCzpIVvnV7qLyhPba-WeRkyKpmZpPFjPQ',
    description: 'Pensil berkualitas tinggi 2B empuk dan mudah dihapus.'
  },
  {
    id: 'prod-3',
    name: 'Pulpen Standard AE7',
    sku: 'ATK-045',
    category: 'Alat Tulis',
    price: 2000,
    stock: 0,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAuaTAHAsmAMp2TaGNtkRDzs8M1a2I3WkyoayKaQizVQWJ5IqH2A1KWIzI8CvNIq6lh5359DsvMw--8xX_FPJsQXBejK6bBgZqN9-Gm1RPKNm78TogJzBl2HtfPRBrdqQCLqH1mbP1nAWs3HaIzYD80Hu4wJ-uJJUFqtuDNL0LnhY-_kf6TiWF6-jffaUXqGVm-6bZDb9oD2wH5qWXTWO8ouGxAg57zaLHpBavz-WAsbYle8Xr88i3hGw',
    description: 'Pulpen tinta hitam mata pena 0.5mm anti macet.'
  },
  {
    id: 'prod-4',
    name: 'Penghapus Joyko 52B',
    sku: 'ATK-012',
    category: 'Alat Tulis',
    price: 1500,
    stock: 85,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBPi87jDiA4I96cAPKTA-BKZiJa3Nmj4o6kcqIoEC0FzsXn3qsm-bDbeEKDJae5TQC4Q0LrDqz_Rj1UitXUkSKkJK1UHJJ44KuIfTmUuvYcPXINfj_eOxzTkKu74Pq3GOQ_ENkc3H38ijgHOGC-IzAZ_Ia9PjAY0suEhTOLVTBkoWTB0EENFMeUiHXBcEMwCgWq-qbbaOr5M01GCV7BX20HGpVuXBzZHEhsuC0Q96pDAAx_SNr590Vb0g',
    description: 'Penghapus pensil putih bersih tanpa meninggalkan bekas kotor.'
  },
  {
    id: 'prod-5',
    name: 'Kopi Susu Gula Aren',
    sku: 'KSG-001',
    category: 'Minuman',
    price: 25000,
    stock: 145,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD96knqKpQAet_lXQPRV6sCkSEx6F7eosde4IobltIvrqabj9-0OL_CYSt2xhnpRXvcLrlChrlcF7lzfjX0gbjr7ZjKV4WidIPortotIXqpeQulMv58Bq9nbU4sxEO2_qP5TxiMglJLrpwQn9XwppoJhM_PWQ_glRfg-PAOASaEspSDtDj9WVGCaL_VWB8kTPKtJswvcwF4HqCzu_VryiYhUoZxD8_WsjV_iaml3V_y6OknYf9kBAjYmA',
    description: 'Espresso segar dengan paduan susu creamy dan gula aren organik.'
  },
  {
    id: 'prod-6',
    name: 'Croissant Coklat',
    sku: 'RC-002',
    category: 'Makanan',
    price: 30000,
    stock: 42,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC8w8O4ZuebrJ0aJzYc7IKNQ_qJY8jmDdU1K_ORGkXJCSFZ2Y7Pp2M2Dbc40oHkl5tCB30jdedK7jLGeCqUwNV3NzJHt9A4x_3zl1bH_v7mRMcaApmtWkXM_n8z-mBnrQs_Fa0s97GhJZ1WzTn6g99HfxvVDEcXeumfvMvFnkIHD5JWCArR6gjtfNVQZRLpeNTXE9SLtZgKeqBgXYJ5MFfBlQI0DtcCyZ-cF2CPn7n6K9e6bANcw2-AQw',
    description: 'Pastry renyah dengan isian coklat lumer lezat.'
  },
  {
    id: 'prod-7',
    name: 'Tumbler Stainless',
    sku: 'ACC-001',
    category: 'Lainnya',
    price: 150000,
    stock: 0,
    imageUrl: '',
    description: 'Tumbler stainless tahan panas dan dingin hingga 12 jam.'
  },
  {
    id: 'prod-8',
    name: 'Spaghetti Carbonara',
    sku: 'MK-005',
    category: 'Makanan',
    price: 65000,
    stock: 18,
    imageUrl:
      'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&auto=format&fit=crop&q=60',
    description: 'Pasta creamy dengan daging asap gurih dan taburan parmesan.'
  },
  {
    id: 'prod-9',
    name: 'Croissant Butter',
    sku: 'MK-006',
    category: 'Makanan',
    price: 35000,
    stock: 24,
    imageUrl:
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60',
    description: 'French butter croissant klasik dengan aroma mentega harum.'
  },
  {
    id: 'prod-10',
    name: 'Es Teh Manis Melati',
    sku: 'MN-004',
    category: 'Minuman',
    price: 8000,
    stock: 90,
    imageUrl:
      'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=60',
    description: 'Teh melati seduh dingin segar penghilang dahaga.'
  }
];

const DEFAULT_TRANSACTIONS = [
  {
    id: 'TRX-001',
    timestamp: '2023-10-24T14:30:00Z',
    date_formatted: '24 Okt 2023, 14:30',
    subtotal: 150000,
    discount: 0,
    tax: 0,
    total: 150000,
    payment_method: 'QRIS',
    amount_paid: 150000,
    change: 0,
    cashier_name: 'Andi',
    status: 'Completed',
    customer_name: 'Walk-in Customer',
    items_json: JSON.stringify([
      {
        productId: 'prod-5',
        productName: 'Kopi Susu Gula Aren',
        sku: 'KSG-001',
        price: 25000,
        quantity: 2,
        total: 50000
      },
      {
        productId: 'prod-9',
        productName: 'Croissant Butter',
        sku: 'MK-006',
        price: 35000,
        quantity: 1,
        total: 35000
      },
      {
        productId: 'prod-8',
        productName: 'Spaghetti Carbonara',
        sku: 'MK-005',
        price: 65000,
        quantity: 1,
        total: 65000
      }
    ])
  },
  {
    id: 'TRX-002',
    timestamp: '2023-10-24T15:15:00Z',
    date_formatted: '24 Okt 2023, 15:15',
    subtotal: 45000,
    discount: 0,
    tax: 0,
    total: 45000,
    payment_method: 'Tunai',
    amount_paid: 50000,
    change: 5000,
    cashier_name: 'Budi',
    status: 'Completed',
    customer_name: 'Walk-in Customer',
    items_json: JSON.stringify([
      {
        productId: 'prod-1',
        productName: 'Buku Tulis Sidu 38 Lembar',
        sku: 'BK-001',
        price: 4500,
        quantity: 10,
        total: 45000
      }
    ])
  },
  {
    id: 'TRX-003',
    timestamp: '2023-10-24T16:05:00Z',
    date_formatted: '24 Okt 2023, 16:05',
    subtotal: 320000,
    discount: 0,
    tax: 0,
    total: 320000,
    payment_method: 'Kartu Kredit',
    amount_paid: 320000,
    change: 0,
    cashier_name: 'Andi',
    status: 'Completed',
    customer_name: 'Walk-in Customer',
    items_json: JSON.stringify([
      {
        productId: 'prod-7',
        productName: 'Tumbler Stainless',
        sku: 'ACC-001',
        price: 150000,
        quantity: 2,
        total: 300000
      },
      {
        productId: 'prod-6',
        productName: 'Croissant Coklat',
        sku: 'RC-002',
        price: 30000,
        quantity: 1,
        total: 20000
      }
    ])
  }
];

// Initialize Turso tables and auto-seed if empty
async function initDatabase() {
  try {
    console.log('Connecting to Turso Database at:', TURSO_URL);

    // Create products table
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        sku TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        stock INTEGER NOT NULL,
        image_url TEXT,
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create transactions table
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        date_formatted TEXT NOT NULL,
        subtotal REAL NOT NULL,
        discount REAL NOT NULL,
        tax REAL NOT NULL,
        total REAL NOT NULL,
        payment_method TEXT NOT NULL,
        amount_paid REAL NOT NULL,
        change REAL NOT NULL,
        cashier_name TEXT NOT NULL,
        status TEXT NOT NULL,
        customer_name TEXT,
        items_json TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check if products table is empty
    const prodCountRes = await turso.execute('SELECT COUNT(*) as count FROM products');
    const prodCount = Number(prodCountRes.rows[0]?.count || 0);

    if (prodCount === 0) {
      console.log('Seeding initial products into Turso Database...');
      for (const p of DEFAULT_PRODUCTS) {
        await turso.execute({
          sql: `INSERT INTO products (id, name, sku, category, price, stock, image_url, description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            p.id,
            p.name,
            p.sku,
            p.category,
            p.price,
            p.stock,
            p.imageUrl,
            p.description
          ]
        });
      }
      console.log('Seeded products successfully.');
    }

    // Check if transactions table is empty
    const txCountRes = await turso.execute('SELECT COUNT(*) as count FROM transactions');
    const txCount = Number(txCountRes.rows[0]?.count || 0);

    if (txCount === 0) {
      console.log('Seeding initial transactions into Turso Database...');
      for (const t of DEFAULT_TRANSACTIONS) {
        await turso.execute({
          sql: `INSERT INTO transactions (id, timestamp, date_formatted, subtotal, discount, tax, total, payment_method, amount_paid, change, cashier_name, status, customer_name, items_json)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            t.id,
            t.timestamp,
            t.date_formatted,
            t.subtotal,
            t.discount,
            t.tax,
            t.total,
            t.payment_method,
            t.amount_paid,
            t.change,
            t.cashier_name,
            t.status,
            t.customer_name,
            t.items_json
          ]
        });
      }
      console.log('Seeded transactions successfully.');
    }

    console.log('Turso Database schema and data verified successfully.');
  } catch (error) {
    console.error('Error initializing Turso Database:', error);
  }
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Health & Database Status
app.get('/api/status', async (req, res) => {
  try {
    const start = Date.now();
    const result = await turso.execute('SELECT 1 as ping');
    const latency = Date.now() - start;

    const prodCountRes = await turso.execute('SELECT COUNT(*) as count FROM products');
    const txCountRes = await turso.execute('SELECT COUNT(*) as count FROM transactions');

    res.json({
      status: 'connected',
      database: 'Turso (LibSQL)',
      host: 'mycasir3-reskydigiss-sys.aws-ap-northeast-1.turso.io',
      latency: `${latency}ms`,
      productsCount: Number(prodCountRes.rows[0]?.count || 0),
      transactionsCount: Number(txCountRes.rows[0]?.count || 0)
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error?.message || 'Failed to connect to Turso database'
    });
  }
});

// 2. Get All Products
app.get('/api/products', async (req, res) => {
  try {
    const result = await turso.execute('SELECT * FROM products ORDER BY id ASC');
    const products = result.rows.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      sku: String(row.sku),
      category: String(row.category),
      price: Number(row.price),
      stock: Number(row.stock),
      imageUrl: row.image_url ? String(row.image_url) : '',
      description: row.description ? String(row.description) : ''
    }));
    res.json(products);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Create Product
app.post('/api/products', async (req, res) => {
  try {
    const { name, sku, category, price, stock, imageUrl, description } = req.body;
    const id = req.body.id || `PRD-${Date.now()}`;

    await turso.execute({
      sql: `INSERT INTO products (id, name, sku, category, price, stock, image_url, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        name,
        sku,
        category,
        Number(price) || 0,
        Number(stock) || 0,
        imageUrl || '',
        description || ''
      ]
    });

    const newProd = {
      id,
      name,
      sku,
      category,
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      imageUrl: imageUrl || '',
      description: description || ''
    };

    res.status(201).json(newProd);
  } catch (error: any) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Update Product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, category, price, stock, imageUrl, description } = req.body;

    await turso.execute({
      sql: `UPDATE products
            SET name = ?, sku = ?, category = ?, price = ?, stock = ?, image_url = ?, description = ?
            WHERE id = ?`,
      args: [
        name,
        sku,
        category,
        Number(price) || 0,
        Number(stock) || 0,
        imageUrl || '',
        description || '',
        id
      ]
    });

    res.json({
      id,
      name,
      sku,
      category,
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      imageUrl: imageUrl || '',
      description: description || ''
    });
  } catch (error: any) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message });
  }
});

// 5. Delete Product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await turso.execute({
      sql: 'DELETE FROM products WHERE id = ?',
      args: [id]
    });
    res.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
});

// 6. Quick Update Stock
app.patch('/api/products/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    await turso.execute({
      sql: 'UPDATE products SET stock = ? WHERE id = ?',
      args: [Number(stock), id]
    });

    res.json({ id, stock: Number(stock) });
  } catch (error: any) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: error.message });
  }
});

// 7. Get All Transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const result = await turso.execute(
      'SELECT * FROM transactions ORDER BY timestamp DESC'
    );

    const transactions = result.rows.map((row) => {
      let items = [];
      try {
        items = JSON.parse(String(row.items_json));
      } catch (e) {
        items = [];
      }

      return {
        id: String(row.id),
        timestamp: String(row.timestamp),
        dateFormatted: String(row.date_formatted),
        subtotal: Number(row.subtotal),
        discount: Number(row.discount),
        tax: Number(row.tax),
        total: Number(row.total),
        paymentMethod: String(row.payment_method),
        amountPaid: Number(row.amount_paid),
        change: Number(row.change),
        cashierName: String(row.cashier_name),
        status: String(row.status),
        customerName: row.customer_name ? String(row.customer_name) : undefined,
        items
      };
    });

    res.json(transactions);
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: error.message });
  }
});

// 8. Create Transaction and deduct stock atomically
app.post('/api/transactions', async (req, res) => {
  try {
    const {
      id,
      timestamp,
      dateFormatted,
      subtotal,
      discount,
      tax,
      total,
      paymentMethod,
      amountPaid,
      change,
      cashierName,
      status,
      items
    } = req.body;

    const txId = id || `TRX-${Date.now().toString().slice(-6)}`;
    const itemsJson = JSON.stringify(items || []);

    // Execute atomic batch using Turso transaction
    const batchStatements: any[] = [
      {
        sql: `INSERT INTO transactions (id, timestamp, date_formatted, subtotal, discount, tax, total, payment_method, amount_paid, change, cashier_name, status, items_json)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          txId,
          timestamp,
          dateFormatted,
          Number(subtotal),
          Number(discount || 0),
          Number(tax || 0),
          Number(total),
          paymentMethod,
          Number(amountPaid),
          Number(change || 0),
          cashierName || 'Andi',
          status || 'Completed',
          itemsJson
        ]
      }
    ];

    // Deduct stock for each purchased item
    if (Array.isArray(items)) {
      for (const item of items) {
        batchStatements.push({
          sql: `UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?`,
          args: [Number(item.quantity || 1), item.productId]
        });
      }
    }

    await turso.batch(batchStatements, 'write');

    const createdTx = {
      id: txId,
      timestamp,
      dateFormatted,
      subtotal: Number(subtotal),
      discount: Number(discount || 0),
      tax: Number(tax || 0),
      total: Number(total),
      paymentMethod,
      amountPaid: Number(amountPaid),
      change: Number(change || 0),
      cashierName: cashierName || 'Andi',
      status: status || 'Completed',
      items
    };

    res.status(201).json(createdTx);
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: error.message });
  }
});

// 9. Reset database to default demo data
app.post('/api/reset', async (req, res) => {
  try {
    await turso.execute('DELETE FROM products');
    await turso.execute('DELETE FROM transactions');

    for (const p of DEFAULT_PRODUCTS) {
      await turso.execute({
        sql: `INSERT INTO products (id, name, sku, category, price, stock, image_url, description)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          p.id,
          p.name,
          p.sku,
          p.category,
          p.price,
          p.stock,
          p.imageUrl,
          p.description
        ]
      });
    }

    for (const t of DEFAULT_TRANSACTIONS) {
      await turso.execute({
        sql: `INSERT INTO transactions (id, timestamp, date_formatted, subtotal, discount, tax, total, payment_method, amount_paid, change, cashier_name, status, customer_name, items_json)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          t.id,
          t.timestamp,
          t.date_formatted,
          t.subtotal,
          t.discount,
          t.tax,
          t.total,
          t.payment_method,
          t.amount_paid,
          t.change,
          t.cashier_name,
          t.status,
          t.customer_name,
          t.items_json
        ]
      });
    }

    res.json({ success: true, message: 'Database reset to default seed data.' });
  } catch (error: any) {
    console.error('Error resetting database:', error);
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// SERVER START & VITE MIDDLEWARE
// ----------------------------------------------------
async function startServer() {
  // Initialize Turso tables
  await initDatabase();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kasirku server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
