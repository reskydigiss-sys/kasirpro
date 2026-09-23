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

    // 1. Create users table
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        store_name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        role TEXT DEFAULT 'Owner',
        category TEXT DEFAULT 'Retail',
        avatar TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Create products table
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
        store_slug TEXT DEFAULT 'admin',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Create transactions table
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
        store_slug TEXT DEFAULT 'admin',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Safely add store_slug column if tables already existed without it
    try {
      await turso.execute(`ALTER TABLE products ADD COLUMN store_slug TEXT DEFAULT 'admin'`);
    } catch (e) {
      // Column already exists
    }
    try {
      await turso.execute(`ALTER TABLE transactions ADD COLUMN store_slug TEXT DEFAULT 'admin'`);
    } catch (e) {
      // Column already exists
    }

    // 4. Seed default users if users table is empty
    const userCountRes = await turso.execute('SELECT COUNT(*) as count FROM users');
    const userCount = Number(userCountRes.rows[0]?.count || 0);

    if (userCount === 0) {
      console.log('Seeding initial users into Turso Database...');
      // Admin account
      await turso.execute({
        sql: `INSERT INTO users (id, username, password, name, store_name, slug, role, category, avatar)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          'usr-admin',
          'admin',
          'password123',
          'Admin Kasirku',
          'KASIRKU STORE',
          'admin',
          'Owner',
          'Retail & Minimarket',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBz59inFDaXkQSFLwfIWoDmbUKWHzrOQW4PdzQ37UmvAl5R00W5n2YT6QQHpPcrkM6G2RvPUJsWiFmfOtAUCGq6DhIQOJK3wJxrHcdn6i1pYcASrpoqCiRfse-eywMz4h639k09u0puKqo5hPLIXMzw0a3NLrz05-habUnNAfZVeJdcs0V7y4_z7LJQgyXbQ5BsxcJixl9QIN1kLgl370w0-wwX3vEE_u5unOv8i5RZ0Q8O8hcX9ScOLg'
        ]
      });

      // Toko Berkah demo account
      await turso.execute({
        sql: `INSERT INTO users (id, username, password, name, store_name, slug, role, category, avatar)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          'usr-tokoberkah',
          'tokoberkah',
          'berkah123',
          'Haji Budi',
          'Toko Berkah Sejahtera',
          'tokoberkah',
          'Owner',
          'Alat Tulis & Fotocopy',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuD307Wtg4hA3lgWmU_BWQc7Fbwz_x1JmAzlB4oto-57dzfcipfCzNzMBFZzKMR6hk3OVL_nDwvMmKkcGa6QmNokVFr0_TwTDQPPGEwfaitjoV7tHz4gbk8c-9pK1tgs86dd2Xr9NWQ_0E_Sgd1M26xipV6oxdc-CuHZP7xJdtU-tervU3ZQuvFOLVsPHzVinYcZDkVXOsOd0FRLEwFvBT8TpQUfDCCiJ4Obmo576duRmqaK_muZZEkP8Q'
        ]
      });
      console.log('Seeded initial users successfully.');
    }

    // Check if products table is empty
    const prodCountRes = await turso.execute('SELECT COUNT(*) as count FROM products');
    const prodCount = Number(prodCountRes.rows[0]?.count || 0);

    if (prodCount === 0) {
      console.log('Seeding initial products into Turso Database...');
      for (const p of DEFAULT_PRODUCTS) {
        await turso.execute({
          sql: `INSERT INTO products (id, name, sku, category, price, stock, image_url, description, store_slug)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            p.id,
            p.name,
            p.sku,
            p.category,
            p.price,
            p.stock,
            p.imageUrl,
            p.description,
            'admin'
          ]
        });
      }

      // Starter products for Toko Berkah
      const BERKAH_STARTER = [
        {
          id: 'tb-1',
          name: 'Kertas HVS A4 Sinar Dunia 75gr',
          sku: 'TB-001',
          category: 'Alat Tulis',
          price: 52000,
          stock: 35,
          imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500&auto=format&fit=crop&q=60',
          description: 'Kertas HVS putih bersih ukuran A4 isi 500 lembar'
        },
        {
          id: 'tb-2',
          name: 'Map Folio Kancing Plastik',
          sku: 'TB-002',
          category: 'Alat Tulis',
          price: 4000,
          stock: 150,
          imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60',
          description: 'Map dokumen kancing tahan air'
        },
        {
          id: 'tb-3',
          name: 'Stapler Joyko HD-10 + Isi',
          sku: 'TB-003',
          category: 'Alat Tulis',
          price: 18500,
          stock: 40,
          imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&auto=format&fit=crop&q=60',
          description: 'Stapler kantor praktis dan kuat'
        }
      ];

      for (const p of BERKAH_STARTER) {
        await turso.execute({
          sql: `INSERT INTO products (id, name, sku, category, price, stock, image_url, description, store_slug)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            p.id,
            p.name,
            p.sku,
            p.category,
            p.price,
            p.stock,
            p.imageUrl,
            p.description,
            'tokoberkah'
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
          sql: `INSERT INTO transactions (id, timestamp, date_formatted, subtotal, discount, tax, total, payment_method, amount_paid, change, cashier_name, status, customer_name, items_json, store_slug)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
            t.items_json,
            'admin'
          ]
        });
      }
      console.log('Seeded transactions successfully.');
    }

    console.log('Turso Database schema and multi-user data verified successfully.');
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
    const userCountRes = await turso.execute('SELECT COUNT(*) as count FROM users');

    res.json({
      status: 'connected',
      database: 'Turso (LibSQL)',
      host: 'mycasir3-reskydigiss-sys.aws-ap-northeast-1.turso.io',
      latency: `${latency}ms`,
      productsCount: Number(prodCountRes.rows[0]?.count || 0),
      transactionsCount: Number(txCountRes.rows[0]?.count || 0),
      usersCount: Number(userCountRes.rows[0]?.count || 0)
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error?.message || 'Failed to connect to Turso database'
    });
  }
});

// ----------------------------------------------------
// AUTH & MULTI-USER STORE ROUTES
// ----------------------------------------------------

// Register New User / Store
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, name, storeName, category } = req.body;

    if (!username || !password || !name || !storeName) {
      return res.status(400).json({
        error: 'Semua kolom (Username, Password, Nama, Nama Toko) wajib diisi'
      });
    }

    const cleanUsername = String(username).toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    if (cleanUsername.length < 3) {
      return res.status(400).json({
        error: 'Username minimal 3 karakter (hanya huruf, angka, tanda strip)'
      });
    }

    if (String(password).length < 4) {
      return res.status(400).json({
        error: 'Password minimal 4 karakter'
      });
    }

    // Check if username or slug exists
    const existing = await turso.execute({
      sql: 'SELECT id FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(slug) = LOWER(?)',
      args: [cleanUsername, cleanUsername]
    });

    if (existing.rows.length > 0) {
      return res.status(400).json({
        error: `Username "${cleanUsername}" sudah digunakan. Silakan pilih username lain.`
      });
    }

    const userId = `usr-${Date.now()}`;
    const slug = cleanUsername;
    const userCategory = category || 'Retail & Minimarket';
    const avatar = `https://api.dicebear.com/7.x/shapes/svg?seed=${cleanUsername}`;

    // Insert new user into Turso
    await turso.execute({
      sql: `INSERT INTO users (id, username, password, name, store_name, slug, role, category, avatar)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        userId,
        cleanUsername,
        String(password),
        name.trim(),
        storeName.trim(),
        slug,
        'Owner',
        userCategory,
        avatar
      ]
    });

    // Provide 4 starter products tailored for this new store
    const starterProducts = [
      {
        id: `prd-${slug}-1`,
        name: 'Produk Unggulan 1',
        sku: `${slug.slice(0, 3).toUpperCase()}-001`,
        category: 'Makanan',
        price: 15000,
        stock: 50,
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
        description: 'Produk contoh untuk memulai toko Anda'
      },
      {
        id: `prd-${slug}-2`,
        name: 'Minuman Segar Dingin',
        sku: `${slug.slice(0, 3).toUpperCase()}-002`,
        category: 'Minuman',
        price: 8000,
        stock: 100,
        imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60',
        description: 'Minuman pelepas dahaga'
      },
      {
        id: `prd-${slug}-3`,
        name: 'Paket Spesial Toko',
        sku: `${slug.slice(0, 3).toUpperCase()}-003`,
        category: 'Lainnya',
        price: 35000,
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=60',
        description: 'Paket hemat untuk pelanggan setia'
      }
    ];

    for (const p of starterProducts) {
      await turso.execute({
        sql: `INSERT INTO products (id, name, sku, category, price, stock, image_url, description, store_slug)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          p.id,
          p.name,
          p.sku,
          p.category,
          p.price,
          p.stock,
          p.imageUrl,
          p.description,
          slug
        ]
      });
    }

    const newUser = {
      id: userId,
      username: cleanUsername,
      name: name.trim(),
      storeName: storeName.trim(),
      slug,
      role: 'Owner',
      category: userCategory,
      avatar
    };

    res.status(201).json({ user: newUser });
  } catch (error: any) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: error.message || 'Gagal mendaftarkan pengguna baru' });
  }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password wajib diisi' });
    }

    const cleanUsername = String(username).toLowerCase().trim();

    const result = await turso.execute({
      sql: 'SELECT * FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1',
      args: [cleanUsername]
    });

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Username tidak ditemukan' });
    }

    const row = result.rows[0];
    if (String(row.password) !== String(password)) {
      return res.status(401).json({ error: 'Password salah' });
    }

    const user = {
      id: String(row.id),
      username: String(row.username),
      name: String(row.name),
      storeName: String(row.store_name),
      slug: String(row.slug),
      role: String(row.role || 'Owner'),
      category: row.category ? String(row.category) : 'Retail & Minimarket',
      avatar: row.avatar ? String(row.avatar) : undefined
    };

    res.json({ user });
  } catch (error: any) {
    console.error('Error in login:', error);
    res.status(500).json({ error: error.message || 'Gagal masuk akun' });
  }
});

// List all stores / users for monitoring
app.get('/api/auth/users', async (req, res) => {
  try {
    const result = await turso.execute(
      'SELECT id, username, name, store_name, slug, role, category, avatar, created_at FROM users ORDER BY created_at ASC'
    );

    const users = result.rows.map((row) => ({
      id: String(row.id),
      username: String(row.username),
      name: String(row.name),
      storeName: String(row.store_name),
      slug: String(row.slug),
      role: String(row.role || 'Owner'),
      category: row.category ? String(row.category) : 'Retail',
      avatar: row.avatar ? String(row.avatar) : undefined,
      createdAt: row.created_at ? String(row.created_at) : undefined
    }));

    res.json(users);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single user / store details by slug (Unique Store Page Data)
app.get('/api/users/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const cleanSlug = String(slug).toLowerCase().trim();

    const userRes = await turso.execute({
      sql: 'SELECT id, username, name, store_name, slug, role, category, avatar, created_at FROM users WHERE LOWER(slug) = LOWER(?) OR LOWER(username) = LOWER(?) LIMIT 1',
      args: [cleanSlug, cleanSlug]
    });

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'Halaman toko atau pengguna tidak ditemukan' });
    }

    const row = userRes.rows[0];
    const user = {
      id: String(row.id),
      username: String(row.username),
      name: String(row.name),
      storeName: String(row.store_name),
      slug: String(row.slug),
      role: String(row.role || 'Owner'),
      category: row.category ? String(row.category) : 'Retail',
      avatar: row.avatar ? String(row.avatar) : undefined
    };

    // Calculate store stats
    const prodCountRes = await turso.execute({
      sql: 'SELECT COUNT(*) as count FROM products WHERE store_slug = ?',
      args: [user.slug]
    });
    const txCountRes = await turso.execute({
      sql: 'SELECT COUNT(*) as count, SUM(total) as revenue FROM transactions WHERE store_slug = ?',
      args: [user.slug]
    });

    res.json({
      user,
      stats: {
        productsCount: Number(prodCountRes.rows[0]?.count || 0),
        transactionsCount: Number(txCountRes.rows[0]?.count || 0),
        totalRevenue: Number(txCountRes.rows[0]?.revenue || 0)
      }
    });
  } catch (error: any) {
    console.error('Error fetching user store page:', error);
    res.status(500).json({ error: error.message });
  }
});

// Dedicated Application Admin Login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password Admin wajib diisi' });
    }

    const cleanUsername = String(username).toLowerCase().trim();

    // Verify admin credentials
    const result = await turso.execute({
      sql: 'SELECT * FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1',
      args: [cleanUsername]
    });

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Akun administrator tidak ditemukan' });
    }

    const row = result.rows[0];
    if (String(row.password) !== String(password)) {
      return res.status(401).json({ error: 'Password administrator salah' });
    }

    // Must be admin or have Super Admin/Owner role
    const isAppAdmin = cleanUsername === 'admin' || String(row.role).toLowerCase().includes('admin') || String(row.role) === 'Owner';
    if (!isAppAdmin) {
      return res.status(403).json({ error: 'Akses ditolak: Akun ini bukan Administrator Aplikasi' });
    }

    const adminUser = {
      id: String(row.id),
      username: String(row.username),
      name: String(row.name),
      storeName: String(row.store_name),
      slug: String(row.slug),
      role: 'Super Admin',
      category: row.category ? String(row.category) : 'Sistem Pusat',
      avatar: row.avatar ? String(row.avatar) : undefined
    };

    res.json({
      success: true,
      user: adminUser,
      adminToken: `admin_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      serverTime: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error in admin login:', error);
    res.status(500).json({ error: error.message || 'Gagal autentikasi admin' });
  }
});

// Super Admin Overview: Monitor all stores, aggregate metrics & live global feed
app.get('/api/admin/overview', async (req, res) => {
  try {
    const start = Date.now();
    // 1. Get all stores
    const usersRes = await turso.execute(
      'SELECT id, username, name, store_name, slug, role, category, avatar, created_at FROM users ORDER BY created_at ASC'
    );

    // 2. Compute individual stats for each store
    const storesWithStats = await Promise.all(
      usersRes.rows.map(async (row) => {
        const slug = String(row.slug);
        const [prodRes, txRes] = await Promise.all([
          turso.execute({
            sql: slug === 'admin'
              ? 'SELECT COUNT(*) as count FROM products WHERE store_slug = ? OR store_slug IS NULL'
              : 'SELECT COUNT(*) as count FROM products WHERE store_slug = ?',
            args: [slug]
          }),
          turso.execute({
            sql: slug === 'admin'
              ? 'SELECT COUNT(*) as count, SUM(total) as revenue FROM transactions WHERE store_slug = ? OR store_slug IS NULL'
              : 'SELECT COUNT(*) as count, SUM(total) as revenue FROM transactions WHERE store_slug = ?',
            args: [slug]
          })
        ]);

        return {
          id: String(row.id),
          username: String(row.username),
          name: String(row.name),
          storeName: String(row.store_name),
          slug: slug,
          role: String(row.role || 'Owner'),
          category: row.category ? String(row.category) : 'Retail',
          avatar: row.avatar ? String(row.avatar) : undefined,
          createdAt: row.created_at ? String(row.created_at) : undefined,
          productsCount: Number(prodRes.rows[0]?.count || 0),
          transactionsCount: Number(txRes.rows[0]?.count || 0),
          totalRevenue: Number(txRes.rows[0]?.revenue || 0)
        };
      })
    );

    // 3. Global aggregates
    const [globalProdRes, globalTxRes] = await Promise.all([
      turso.execute('SELECT COUNT(*) as count FROM products'),
      turso.execute('SELECT COUNT(*) as count, SUM(total) as revenue FROM transactions')
    ]);

    const totalStores = storesWithStats.length;
    const totalProducts = Number(globalProdRes.rows[0]?.count || 0);
    const totalTransactions = Number(globalTxRes.rows[0]?.count || 0);
    const totalRevenue = Number(globalTxRes.rows[0]?.revenue || 0);

    // 4. Latest transactions across all stores
    const latestTxRes = await turso.execute(
      'SELECT id, timestamp, date_formatted, total, payment_method, cashier_name, store_slug, customer_name FROM transactions ORDER BY timestamp DESC LIMIT 15'
    );

    const latestTransactions = latestTxRes.rows.map((r) => {
      const storeSlug = r.store_slug ? String(r.store_slug) : 'admin';
      const storeObj = storesWithStats.find((s) => s.slug.toLowerCase() === storeSlug.toLowerCase());
      return {
        id: String(r.id),
        timestamp: String(r.timestamp),
        dateFormatted: String(r.date_formatted),
        total: Number(r.total),
        paymentMethod: String(r.payment_method),
        cashierName: String(r.cashier_name),
        storeSlug,
        storeName: storeObj ? storeObj.storeName : (storeSlug === 'admin' ? 'KASIRKU STORE' : storeSlug),
        customerName: r.customer_name ? String(r.customer_name) : undefined
      };
    });

    const latency = Date.now() - start;

    res.json({
      globalStats: {
        totalStores,
        totalProducts,
        totalTransactions,
        totalRevenue
      },
      stores: storesWithStats,
      latestTransactions,
      dbStatus: {
        status: 'connected',
        latency: `${latency}ms`,
        database: 'Turso (LibSQL)',
        host: 'mycasir3-reskydigiss-sys.aws-ap-northeast-1.turso.io'
      }
    });
  } catch (error: any) {
    console.error('Error in admin overview:', error);
    res.status(500).json({ error: error.message || 'Gagal memuat data monitoring admin' });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 2. Get All Products (Scoped by store slug)
app.get('/api/products', async (req, res) => {
  try {
    const slug = (req.query.slug as string) || (req.query.store as string) || 'admin';
    const result = await turso.execute(
      slug === 'admin'
        ? {
            sql: 'SELECT * FROM products WHERE store_slug = ? OR store_slug IS NULL ORDER BY id ASC',
            args: ['admin']
          }
        : {
            sql: 'SELECT * FROM products WHERE store_slug = ? ORDER BY id ASC',
            args: [slug]
          }
    );

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

// 3. Create Product (Scoped by store slug)
app.post('/api/products', async (req, res) => {
  try {
    const { name, sku, category, price, stock, imageUrl, description, storeSlug, slug } = req.body;
    const id = req.body.id || `PRD-${Date.now()}`;
    const store_slug = storeSlug || slug || 'admin';

    await turso.execute({
      sql: `INSERT INTO products (id, name, sku, category, price, stock, image_url, description, store_slug)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        name,
        sku,
        category,
        Number(price) || 0,
        Number(stock) || 0,
        imageUrl || '',
        description || '',
        store_slug
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

// 7. Get All Transactions (Scoped by store slug)
app.get('/api/transactions', async (req, res) => {
  try {
    const slug = (req.query.slug as string) || (req.query.store as string) || 'admin';
    const result = await turso.execute(
      slug === 'admin'
        ? {
            sql: 'SELECT * FROM transactions WHERE store_slug = ? OR store_slug IS NULL ORDER BY timestamp DESC',
            args: ['admin']
          }
        : {
            sql: 'SELECT * FROM transactions WHERE store_slug = ? ORDER BY timestamp DESC',
            args: [slug]
          }
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

// 8. Create Transaction and deduct stock atomically (Scoped by store slug)
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
      items,
      storeSlug,
      slug
    } = req.body;

    const txId = id || `TRX-${Date.now().toString().slice(-6)}`;
    const itemsJson = JSON.stringify(items || []);
    const store_slug = storeSlug || slug || 'admin';

    // Execute atomic batch using Turso transaction
    const batchStatements: any[] = [
      {
        sql: `INSERT INTO transactions (id, timestamp, date_formatted, subtotal, discount, tax, total, payment_method, amount_paid, change, cashier_name, status, items_json, store_slug)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          itemsJson,
          store_slug
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
