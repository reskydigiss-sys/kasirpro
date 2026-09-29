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

    // 4. Create categories table
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT DEFAULT 'category',
        description TEXT,
        color TEXT DEFAULT 'blue',
        store_slug TEXT DEFAULT 'admin',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Create customers table
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        address TEXT,
        member_level TEXT DEFAULT 'Reguler',
        points INTEGER DEFAULT 0,
        total_spent REAL DEFAULT 0,
        transaction_count INTEGER DEFAULT 0,
        store_slug TEXT DEFAULT 'admin',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Create promos table
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS promos (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL,
        title TEXT NOT NULL,
        type TEXT DEFAULT 'percentage',
        value REAL NOT NULL,
        min_spend REAL DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        store_slug TEXT DEFAULT 'admin',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Create stock_logs table
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS stock_logs (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        previous_stock INTEGER NOT NULL,
        new_stock INTEGER NOT NULL,
        reason TEXT,
        date_formatted TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        store_slug TEXT DEFAULT 'admin'
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
    try {
      await turso.execute(`ALTER TABLE categories ADD COLUMN store_slug TEXT DEFAULT 'admin'`);
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

    // Check if categories table is empty
    const catCountRes = await turso.execute('SELECT COUNT(*) as count FROM categories');
    const catCount = Number(catCountRes.rows[0]?.count || 0);

    if (catCount === 0) {
      console.log('Seeding initial categories into Turso Database...');
      const SEED_CATEGORIES = [
        {
          id: 'cat-minuman',
          name: 'Minuman',
          icon: 'local_cafe',
          description: 'Kopi, teh, jus buah, dan aneka minuman segar',
          color: 'emerald',
          store_slug: 'admin'
        },
        {
          id: 'cat-makanan',
          name: 'Makanan',
          icon: 'restaurant',
          description: 'Croissant, roti panggang, spaghetti, dan snack lezat',
          color: 'amber',
          store_slug: 'admin'
        },
        {
          id: 'cat-alattulis',
          name: 'Alat Tulis',
          icon: 'edit_note',
          description: 'Buku catatan, pensil, pulpen, penghapus, dan atk kantor',
          color: 'blue',
          store_slug: 'admin'
        },
        {
          id: 'cat-lainnya',
          name: 'Lainnya',
          icon: 'category',
          description: 'Aksesoris tumbler, tote bag, merchandise dan packaging',
          color: 'purple',
          store_slug: 'admin'
        }
      ];

      for (const c of SEED_CATEGORIES) {
        await turso.execute({
          sql: `INSERT INTO categories (id, name, icon, description, color, store_slug)
                VALUES (?, ?, ?, ?, ?, ?)`,
          args: [c.id, c.name, c.icon, c.description, c.color, c.store_slug]
        });
      }

      // Also seed categories for tokoberkah demo store
      const BERKAH_CATEGORIES = [
        {
          id: 'cat-tb-1',
          name: 'Alat Tulis',
          icon: 'edit_note',
          description: 'Kertas HVS, map, pulpen, buku, dan perlengkapan fotocopy',
          color: 'blue',
          store_slug: 'tokoberkah'
        },
        {
          id: 'cat-tb-2',
          name: 'Lainnya',
          icon: 'category',
          description: 'Peralatan kantor dan aksesoris lainnya',
          color: 'purple',
          store_slug: 'tokoberkah'
        }
      ];

      for (const c of BERKAH_CATEGORIES) {
        await turso.execute({
          sql: `INSERT INTO categories (id, name, icon, description, color, store_slug)
                VALUES (?, ?, ?, ?, ?, ?)`,
          args: [c.id, c.name, c.icon, c.description, c.color, c.store_slug]
        });
      }

      console.log('Seeded categories successfully.');
    }

    // Check if customers table is empty
    const custCountRes = await turso.execute('SELECT COUNT(*) as count FROM customers');
    const custCount = Number(custCountRes.rows[0]?.count || 0);
    if (custCount === 0) {
      console.log('Seeding initial customers into Turso Database...');
      const SEED_CUSTOMERS = [
        { id: 'cust-1', name: 'Budi Santoso', phone: '081234567890', email: 'budi.santoso@gmail.com', address: 'Jl. Merdeka No. 45, Jakarta', member_level: 'VIP', points: 450, total_spent: 1250000, transaction_count: 8, store_slug: 'admin' },
        { id: 'cust-2', name: 'Siti Rahmawati', phone: '082198765432', email: 'siti.rahma@yahoo.com', address: 'Komplek Griya Indah Blok C-12, Bandung', member_level: 'Gold', points: 220, total_spent: 680000, transaction_count: 5, store_slug: 'admin' },
        { id: 'cust-3', name: 'Dewi Lestari', phone: '085712344321', email: 'dewi.lestari@gmail.com', address: 'Jl. Surya Kencana No. 8, Bogor', member_level: 'Silver', points: 90, total_spent: 310000, transaction_count: 3, store_slug: 'admin' },
        { id: 'cust-4', name: 'Rian Pratama', phone: '087855443322', email: 'rian.pratama@outlook.com', address: 'Jl. Sudirman Kav 21, Surabaya', member_level: 'Reguler', points: 30, total_spent: 125000, transaction_count: 1, store_slug: 'admin' }
      ];
      for (const cu of SEED_CUSTOMERS) {
        await turso.execute({
          sql: `INSERT INTO customers (id, name, phone, email, address, member_level, points, total_spent, transaction_count, store_slug)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [cu.id, cu.name, cu.phone, cu.email, cu.address, cu.member_level, cu.points, cu.total_spent, cu.transaction_count, cu.store_slug]
        });
      }
    }

    // Check if promos table is empty
    const promoCountRes = await turso.execute('SELECT COUNT(*) as count FROM promos');
    const promoCount = Number(promoCountRes.rows[0]?.count || 0);
    if (promoCount === 0) {
      console.log('Seeding initial promos into Turso Database...');
      const SEED_PROMOS = [
        { id: 'prm-1', code: 'DISKON10', title: 'Diskon Belanja Hemat 10%', type: 'percentage', value: 10, min_spend: 50000, is_active: 1, store_slug: 'admin' },
        { id: 'prm-2', code: 'POTONG15RB', title: 'Potongan Langsung Rp 15.000', type: 'fixed', value: 15000, min_spend: 100000, is_active: 1, store_slug: 'admin' },
        { id: 'prm-3', code: 'SUPERVIP', title: 'Spesial Member VIP 20%', type: 'percentage', value: 20, min_spend: 150000, is_active: 1, store_slug: 'admin' },
        { id: 'prm-4', code: 'PROMOHEMAT', title: 'Potongan Rp 5.000 Tanpa Syarat Min', type: 'fixed', value: 5000, min_spend: 20000, is_active: 0, store_slug: 'admin' }
      ];
      for (const pr of SEED_PROMOS) {
        await turso.execute({
          sql: `INSERT INTO promos (id, code, title, type, value, min_spend, is_active, store_slug)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [pr.id, pr.code, pr.title, pr.type, pr.value, pr.min_spend, pr.is_active, pr.store_slug]
        });
      }
    }

    // Check if stock_logs table is empty
    const stockLogCountRes = await turso.execute('SELECT COUNT(*) as count FROM stock_logs');
    const stockLogCount = Number(stockLogCountRes.rows[0]?.count || 0);
    if (stockLogCount === 0) {
      console.log('Seeding initial stock logs into Turso Database...');
      const SEED_STOCK_LOGS = [
        { id: 'log-1', product_id: 'prod-1', product_name: 'Buku Tulis Sidu 38 Lembar', type: 'in', quantity: 50, previous_stock: 0, new_stock: 50, reason: 'Restock dari Supplier Utama', date_formatted: '20 Okt 2023, 09:00', timestamp: '2023-10-20T09:00:00Z', store_slug: 'admin' },
        { id: 'log-2', product_id: 'prod-5', product_name: 'Kopi Susu Gula Aren', type: 'in', quantity: 150, previous_stock: 0, new_stock: 150, reason: 'Produksi Harian Minuman Segar', date_formatted: '21 Okt 2023, 07:30', timestamp: '2023-10-21T07:30:00Z', store_slug: 'admin' },
        { id: 'log-3', product_id: 'prod-4', product_name: 'Penghapus Joyko 52B', type: 'adjustment', quantity: 5, previous_stock: 80, new_stock: 85, reason: 'Koreksi Stok Opname Fisik Toko', date_formatted: '22 Okt 2023, 14:15', timestamp: '2023-10-22T14:15:00Z', store_slug: 'admin' }
      ];
      for (const sl of SEED_STOCK_LOGS) {
        await turso.execute({
          sql: `INSERT INTO stock_logs (id, product_id, product_name, type, quantity, previous_stock, new_stock, reason, date_formatted, timestamp, store_slug)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [sl.id, sl.product_id, sl.product_name, sl.type, sl.quantity, sl.previous_stock, sl.new_stock, sl.reason, sl.date_formatted, sl.timestamp, sl.store_slug]
        });
      }
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

    // 1. Process and Insert Categories for this new store (from JSON or default)
    let finalCategories = Array.isArray(req.body.starterCategories) && req.body.starterCategories.length > 0
      ? req.body.starterCategories
      : [
          { id: `cat-${slug}-1`, name: 'Makanan', icon: 'restaurant', color: 'amber', description: 'Menu makanan utama & cemilan' },
          { id: `cat-${slug}-2`, name: 'Minuman', icon: 'local_cafe', color: 'emerald', description: 'Minuman dingin dan hangat' },
          { id: `cat-${slug}-3`, name: 'Lainnya', icon: 'category', color: 'purple', description: 'Produk pelengkap lainnya' }
        ];

    let insertedCategoriesCount = 0;
    for (let i = 0; i < finalCategories.length; i++) {
      const c = finalCategories[i];
      const catId = c.id || `cat-${slug}-${i + 1}`;
      try {
        await turso.execute({
          sql: `INSERT INTO categories (id, name, icon, description, color, store_slug)
                VALUES (?, ?, ?, ?, ?, ?)`,
          args: [
            catId,
            c.name || `Kategori ${i + 1}`,
            c.icon || 'category',
            c.description || '',
            c.color || 'blue',
            slug
          ]
        });
        insertedCategoriesCount++;
      } catch (errCat) {
        console.warn('Warning inserting category for store:', errCat);
      }
    }

    // 2. Process and Insert Products for this new store (from JSON or default)
    let finalProducts = Array.isArray(req.body.starterProducts) && req.body.starterProducts.length > 0
      ? req.body.starterProducts
      : [
          {
            id: `prd-${slug}-1`,
            name: 'Produk Unggulan 1',
            sku: `${slug.slice(0, 3).toUpperCase()}-001`,
            category: finalCategories[0]?.name || 'Makanan',
            price: 15000,
            stock: 50,
            imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
            description: 'Produk contoh untuk memulai toko Anda'
          },
          {
            id: `prd-${slug}-2`,
            name: 'Minuman Segar Dingin',
            sku: `${slug.slice(0, 3).toUpperCase()}-002`,
            category: finalCategories[1]?.name || 'Minuman',
            price: 8000,
            stock: 100,
            imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60',
            description: 'Minuman pelepas dahaga'
          },
          {
            id: `prd-${slug}-3`,
            name: 'Paket Spesial Toko',
            sku: `${slug.slice(0, 3).toUpperCase()}-003`,
            category: finalCategories[2]?.name || 'Lainnya',
            price: 35000,
            stock: 25,
            imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=60',
            description: 'Paket hemat untuk pelanggan setia'
          }
        ];

    let insertedProductsCount = 0;
    for (let i = 0; i < finalProducts.length; i++) {
      const p = finalProducts[i];
      const prodId = p.id || `prd-${slug}-${Date.now()}-${i + 1}`;
      const prodSku = p.sku || `${slug.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(3, '0')}`;
      try {
        await turso.execute({
          sql: `INSERT INTO products (id, name, sku, category, price, stock, image_url, description, store_slug)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            prodId,
            p.name || `Produk ${i + 1}`,
            prodSku,
            p.category || 'Umum',
            Number(p.price) || 0,
            Number(p.stock) ?? 10,
            p.imageUrl || '',
            p.description || '',
            slug
          ]
        });
        insertedProductsCount++;
      } catch (errProd) {
        console.warn('Warning inserting product for store:', errProd);
      }
    }

    // 3. Process and Insert Promos if provided in JSON
    let insertedPromosCount = 0;
    if (Array.isArray(req.body.starterPromos) && req.body.starterPromos.length > 0) {
      for (let i = 0; i < req.body.starterPromos.length; i++) {
        const pr = req.body.starterPromos[i];
        try {
          await turso.execute({
            sql: `INSERT INTO promos (id, code, title, type, value, min_spend, is_active, store_slug)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              pr.id || `prm-${slug}-${i + 1}`,
              String(pr.code || `DISKON${i + 1}`).toUpperCase().trim(),
              pr.title || `Promo Spesial ${i + 1}`,
              pr.type || 'percentage',
              Number(pr.value) || 10,
              Number(pr.min_spend) || 0,
              pr.is_active !== undefined ? (pr.is_active ? 1 : 0) : 1,
              slug
            ]
          });
          insertedPromosCount++;
        } catch (errPromo) {
          console.warn('Warning inserting promo for store:', errPromo);
        }
      }
    }

    // 4. Process and Insert Customers if provided in JSON
    let insertedCustomersCount = 0;
    if (Array.isArray(req.body.starterCustomers) && req.body.starterCustomers.length > 0) {
      for (let i = 0; i < req.body.starterCustomers.length; i++) {
        const cu = req.body.starterCustomers[i];
        try {
          await turso.execute({
            sql: `INSERT INTO customers (id, name, phone, email, address, member_level, points, total_spent, transaction_count, store_slug)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              cu.id || `cust-${slug}-${i + 1}`,
              cu.name || `Pelanggan ${i + 1}`,
              cu.phone || `08${Math.floor(1000000000 + Math.random() * 9000000000)}`,
              cu.email || '',
              cu.address || '',
              cu.member_level || 'Reguler',
              Number(cu.points) || 0,
              Number(cu.total_spent) || 0,
              Number(cu.transaction_count) || 0,
              slug
            ]
          });
          insertedCustomersCount++;
        } catch (errCust) {
          console.warn('Warning inserting customer for store:', errCust);
        }
      }
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

    res.status(201).json({
      user: newUser,
      itemsCreated: {
        products: insertedProductsCount,
        categories: insertedCategoriesCount,
        promos: insertedPromosCount,
        customers: insertedCustomersCount
      },
      uniquePageUrl: `?u=${slug}&tab=kasir`
    });
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

// Delete User / Store Account (with cascade cleanup)
app.delete('/api/auth/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (id === 'usr-admin') {
      return res.status(403).json({ error: 'Akun Administrator Utama tidak boleh dihapus' });
    }

    const uRes = await turso.execute({
      sql: 'SELECT slug FROM users WHERE id = ?',
      args: [id]
    });

    if (uRes.rows.length > 0) {
      const slug = String(uRes.rows[0].slug);
      await turso.execute({ sql: 'DELETE FROM products WHERE store_slug = ?', args: [slug] });
      await turso.execute({ sql: 'DELETE FROM transactions WHERE store_slug = ?', args: [slug] });
      await turso.execute({ sql: 'DELETE FROM categories WHERE store_slug = ?', args: [slug] });
    }

    await turso.execute({ sql: 'DELETE FROM users WHERE id = ?', args: [id] });
    res.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// CATEGORY CRUD ROUTES (Multi-Store Scoped)
// ----------------------------------------------------

// 1. Get Categories (Scoped by store slug)
app.get('/api/categories', async (req, res) => {
  try {
    const slug = (req.query.slug as string) || (req.query.store as string) || 'admin';
    let result = await turso.execute(
      slug === 'admin'
        ? {
            sql: 'SELECT * FROM categories WHERE store_slug = ? OR store_slug IS NULL ORDER BY created_at ASC',
            args: ['admin']
          }
        : {
            sql: 'SELECT * FROM categories WHERE store_slug = ? ORDER BY created_at ASC',
            args: [slug]
          }
    );

    // If custom store has no custom categories yet, fallback to default admin categories
    if (result.rows.length === 0) {
      result = await turso.execute({
        sql: 'SELECT * FROM categories WHERE store_slug = ? OR store_slug IS NULL ORDER BY created_at ASC',
        args: ['admin']
      });
    }

    const categories = result.rows.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      icon: String(row.icon || 'category'),
      description: row.description ? String(row.description) : '',
      color: String(row.color || 'blue'),
      storeSlug: row.store_slug ? String(row.store_slug) : 'admin',
      createdAt: row.created_at ? String(row.created_at) : undefined
    }));

    res.json(categories);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Create Category
app.post('/api/categories', async (req, res) => {
  try {
    const { name, icon, description, color, storeSlug, slug } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nama kategori wajib diisi' });
    }

    const id = req.body.id || `cat-${Date.now()}`;
    const store_slug = storeSlug || slug || 'admin';
    const categoryName = name.trim();
    const categoryIcon = icon || 'category';
    const categoryColor = color || 'blue';
    const categoryDesc = description || '';

    // Check duplicate in same store
    const dupCheck = await turso.execute({
      sql: 'SELECT id FROM categories WHERE LOWER(name) = LOWER(?) AND (store_slug = ? OR store_slug IS NULL)',
      args: [categoryName, store_slug]
    });

    if (dupCheck.rows.length > 0) {
      return res.status(400).json({ error: `Kategori "${categoryName}" sudah ada` });
    }

    await turso.execute({
      sql: `INSERT INTO categories (id, name, icon, description, color, store_slug)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [id, categoryName, categoryIcon, categoryDesc, categoryColor, store_slug]
    });

    res.status(201).json({
      id,
      name: categoryName,
      icon: categoryIcon,
      description: categoryDesc,
      color: categoryColor,
      storeSlug: store_slug,
      createdAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Update Category (Cascades rename to products)
app.put('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, description, color, oldName, storeSlug } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nama kategori wajib diisi' });
    }

    const categoryName = name.trim();
    const categoryIcon = icon || 'category';
    const categoryColor = color || 'blue';
    const categoryDesc = description || '';
    const currentStoreSlug = storeSlug || 'admin';

    await turso.execute({
      sql: `UPDATE categories
            SET name = ?, icon = ?, description = ?, color = ?
            WHERE id = ?`,
      args: [categoryName, categoryIcon, categoryDesc, categoryColor, id]
    });

    // If category name changed, cascade update to product category
    if (oldName && oldName.trim() !== categoryName) {
      await turso.execute({
        sql: `UPDATE products SET category = ? WHERE category = ? AND (store_slug = ? OR store_slug IS NULL)`,
        args: [categoryName, oldName.trim(), currentStoreSlug]
      });
    }

    res.json({
      id,
      name: categoryName,
      icon: categoryIcon,
      description: categoryDesc,
      color: categoryColor,
      storeSlug: currentStoreSlug
    });
  } catch (error: any) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Delete Category (Safely moves products to fallback category)
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { fallbackCategory, storeSlug } = req.query;

    const catRes = await turso.execute({
      sql: 'SELECT name, store_slug FROM categories WHERE id = ?',
      args: [id]
    });

    if (catRes.rows.length > 0) {
      const catName = String(catRes.rows[0].name);
      const catStore = (storeSlug as string) || String(catRes.rows[0].store_slug || 'admin');
      const replacement = (fallbackCategory as string) || 'Lainnya';

      // Move products in this category to replacement
      await turso.execute({
        sql: `UPDATE products SET category = ? WHERE category = ? AND (store_slug = ? OR store_slug IS NULL)`,
        args: [replacement, catName, catStore]
      });
    }

    await turso.execute({
      sql: 'DELETE FROM categories WHERE id = ?',
      args: [id]
    });

    res.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: error.message });
  }
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
        const prodId = item.productId || item.id || item.product?.id;
        if (prodId) {
          batchStatements.push({
            sql: `UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?`,
            args: [Number(item.quantity || 1), prodId]
          });
        }
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

// Update Transaction (Status, Customer Name, Notes, Payment Method)
app.put('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, customerName, paymentMethod, notes } = req.body;

    const existing = await turso.execute({
      sql: 'SELECT * FROM transactions WHERE id = ?',
      args: [id]
    });

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    }

    const row = existing.rows[0];
    const newStatus = status !== undefined ? status : row.status;
    const newCustomer = customerName !== undefined ? customerName : row.customer_name;
    const newMethod = paymentMethod !== undefined ? paymentMethod : row.payment_method;

    await turso.execute({
      sql: `UPDATE transactions
            SET status = ?, customer_name = ?, payment_method = ?
            WHERE id = ?`,
      args: [newStatus, newCustomer, newMethod, id]
    });

    res.json({
      id,
      status: newStatus,
      customerName: newCustomer,
      paymentMethod: newMethod,
      notes: notes || ''
    });
  } catch (error: any) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete / Void Transaction (Optionally restock products)
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const restock = req.query.restock === 'true' || req.query.restock === '1';

    const txRes = await turso.execute({
      sql: 'SELECT * FROM transactions WHERE id = ?',
      args: [id]
    });

    if (txRes.rows.length === 0) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    }

    const txRow = txRes.rows[0];

    // If restock requested and transaction was completed, return stock to products
    if (restock) {
      try {
        const items = JSON.parse(String(txRow.items_json));
        if (Array.isArray(items)) {
          for (const item of items) {
            const prodId = item.productId || item.id;
            const qty = Number(item.quantity || 0);
            if (prodId && qty > 0) {
              await turso.execute({
                sql: 'UPDATE products SET stock = stock + ? WHERE id = ?',
                args: [qty, prodId]
              });
            }
          }
        }
      } catch (err) {
        console.warn('Failed to parse items for restock:', err);
      }
    }

    await turso.execute({
      sql: 'DELETE FROM transactions WHERE id = ?',
      args: [id]
    });

    res.json({ success: true, deletedId: id, restocked: restock });
  } catch (error: any) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// CUSTOMERS CRUD ROUTES
// ----------------------------------------------------

// Get all customers (Scoped by store slug)
app.get('/api/customers', async (req, res) => {
  try {
    const slug = (req.query.slug as string) || (req.query.store as string) || 'admin';
    const result = await turso.execute(
      slug === 'admin'
        ? {
            sql: 'SELECT * FROM customers WHERE store_slug = ? OR store_slug IS NULL ORDER BY created_at DESC',
            args: ['admin']
          }
        : {
            sql: 'SELECT * FROM customers WHERE store_slug = ? ORDER BY created_at DESC',
            args: [slug]
          }
    );

    const customers = result.rows.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      phone: String(row.phone),
      email: row.email ? String(row.email) : '',
      address: row.address ? String(row.address) : '',
      memberLevel: String(row.member_level || 'Reguler'),
      points: Number(row.points || 0),
      totalSpent: Number(row.total_spent || 0),
      transactionCount: Number(row.transaction_count || 0),
      storeSlug: row.store_slug ? String(row.store_slug) : 'admin',
      createdAt: row.created_at ? String(row.created_at) : undefined
    }));

    res.json(customers);
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create Customer
app.post('/api/customers', async (req, res) => {
  try {
    const { name, phone, email, address, memberLevel, points, storeSlug, slug } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nama pelanggan wajib diisi' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ error: 'Nomor telepon pelanggan wajib diisi' });
    }

    const id = req.body.id || `cust-${Date.now()}`;
    const store_slug = storeSlug || slug || 'admin';
    const custName = name.trim();
    const custPhone = phone.trim();
    const custEmail = (email || '').trim();
    const custAddress = (address || '').trim();
    const custLevel = memberLevel || 'Reguler';
    const custPoints = Number(points) || 0;

    await turso.execute({
      sql: `INSERT INTO customers (id, name, phone, email, address, member_level, points, total_spent, transaction_count, store_slug)
            VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?)`,
      args: [id, custName, custPhone, custEmail, custAddress, custLevel, custPoints, store_slug]
    });

    const newCustomer = {
      id,
      name: custName,
      phone: custPhone,
      email: custEmail,
      address: custAddress,
      memberLevel: custLevel,
      points: custPoints,
      totalSpent: 0,
      transactionCount: 0,
      storeSlug: store_slug,
      createdAt: new Date().toISOString()
    };

    res.status(201).json(newCustomer);
  } catch (error: any) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update Customer
app.put('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address, memberLevel, points, totalSpent, transactionCount } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nama pelanggan wajib diisi' });
    }

    await turso.execute({
      sql: `UPDATE customers
            SET name = ?, phone = ?, email = ?, address = ?, member_level = ?, points = ?,
                total_spent = COALESCE(?, total_spent), transaction_count = COALESCE(?, transaction_count)
            WHERE id = ?`,
      args: [
        name.trim(),
        (phone || '').trim(),
        (email || '').trim(),
        (address || '').trim(),
        memberLevel || 'Reguler',
        Number(points) || 0,
        totalSpent !== undefined ? Number(totalSpent) : null,
        transactionCount !== undefined ? Number(transactionCount) : null,
        id
      ]
    });

    res.json({
      id,
      name: name.trim(),
      phone: (phone || '').trim(),
      email: (email || '').trim(),
      address: (address || '').trim(),
      memberLevel: memberLevel || 'Reguler',
      points: Number(points) || 0
    });
  } catch (error: any) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete Customer
app.delete('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await turso.execute({
      sql: 'DELETE FROM customers WHERE id = ?',
      args: [id]
    });
    res.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// PROMOS & COUPONS CRUD ROUTES
// ----------------------------------------------------

// Get all promos (Scoped by store slug)
app.get('/api/promos', async (req, res) => {
  try {
    const slug = (req.query.slug as string) || (req.query.store as string) || 'admin';
    const result = await turso.execute(
      slug === 'admin'
        ? {
            sql: 'SELECT * FROM promos WHERE store_slug = ? OR store_slug IS NULL ORDER BY created_at DESC',
            args: ['admin']
          }
        : {
            sql: 'SELECT * FROM promos WHERE store_slug = ? ORDER BY created_at DESC',
            args: [slug]
          }
    );

    const promos = result.rows.map((row) => ({
      id: String(row.id),
      code: String(row.code),
      title: String(row.title),
      type: (String(row.type) === 'fixed' ? 'fixed' : 'percentage') as 'fixed' | 'percentage',
      value: Number(row.value),
      minSpend: Number(row.min_spend || 0),
      isActive: Boolean(row.is_active),
      storeSlug: row.store_slug ? String(row.store_slug) : 'admin',
      createdAt: row.created_at ? String(row.created_at) : undefined
    }));

    res.json(promos);
  } catch (error: any) {
    console.error('Error fetching promos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create Promo
app.post('/api/promos', async (req, res) => {
  try {
    const { code, title, type, value, minSpend, isActive, storeSlug, slug } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'Kode promo wajib diisi' });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Judul promo wajib diisi' });
    }

    const id = req.body.id || `prm-${Date.now()}`;
    const cleanCode = code.trim().toUpperCase();
    const cleanTitle = title.trim();
    const promoType = type === 'fixed' ? 'fixed' : 'percentage';
    const promoValue = Number(value) || 0;
    const promoMin = Number(minSpend) || 0;
    const active = isActive !== false ? 1 : 0;
    const store_slug = storeSlug || slug || 'admin';

    // Check duplicate code in same store
    const existing = await turso.execute({
      sql: 'SELECT id FROM promos WHERE UPPER(code) = ? AND (store_slug = ? OR store_slug IS NULL)',
      args: [cleanCode, store_slug]
    });

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: `Kode promo "${cleanCode}" sudah ada di toko ini` });
    }

    await turso.execute({
      sql: `INSERT INTO promos (id, code, title, type, value, min_spend, is_active, store_slug)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, cleanCode, cleanTitle, promoType, promoValue, promoMin, active, store_slug]
    });

    res.status(201).json({
      id,
      code: cleanCode,
      title: cleanTitle,
      type: promoType,
      value: promoValue,
      minSpend: promoMin,
      isActive: Boolean(active),
      storeSlug: store_slug,
      createdAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error creating promo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update Promo
app.put('/api/promos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { code, title, type, value, minSpend, isActive } = req.body;

    if (!code || !code.trim() || !title || !title.trim()) {
      return res.status(400).json({ error: 'Kode dan judul promo wajib diisi' });
    }

    const cleanCode = code.trim().toUpperCase();
    const cleanTitle = title.trim();
    const promoType = type === 'fixed' ? 'fixed' : 'percentage';
    const promoValue = Number(value) || 0;
    const promoMin = Number(minSpend) || 0;
    const active = isActive ? 1 : 0;

    await turso.execute({
      sql: `UPDATE promos
            SET code = ?, title = ?, type = ?, value = ?, min_spend = ?, is_active = ?
            WHERE id = ?`,
      args: [cleanCode, cleanTitle, promoType, promoValue, promoMin, active, id]
    });

    res.json({
      id,
      code: cleanCode,
      title: cleanTitle,
      type: promoType,
      value: promoValue,
      minSpend: promoMin,
      isActive: Boolean(active)
    });
  } catch (error: any) {
    console.error('Error updating promo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete Promo
app.delete('/api/promos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await turso.execute({
      sql: 'DELETE FROM promos WHERE id = ?',
      args: [id]
    });
    res.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error('Error deleting promo:', error);
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// STOCK LOGS CRUD ROUTES
// ----------------------------------------------------

// Get all stock logs (Scoped by store slug)
app.get('/api/stock-logs', async (req, res) => {
  try {
    const slug = (req.query.slug as string) || (req.query.store as string) || 'admin';
    const result = await turso.execute(
      slug === 'admin'
        ? {
            sql: 'SELECT * FROM stock_logs WHERE store_slug = ? OR store_slug IS NULL ORDER BY timestamp DESC LIMIT 100',
            args: ['admin']
          }
        : {
            sql: 'SELECT * FROM stock_logs WHERE store_slug = ? ORDER BY timestamp DESC LIMIT 100',
            args: [slug]
          }
    );

    const logs = result.rows.map((row) => ({
      id: String(row.id),
      productId: String(row.product_id),
      productName: String(row.product_name),
      type: String(row.type) as 'in' | 'out' | 'adjustment',
      quantity: Number(row.quantity),
      previousStock: Number(row.previous_stock),
      newStock: Number(row.new_stock),
      reason: row.reason ? String(row.reason) : '',
      dateFormatted: String(row.date_formatted),
      timestamp: String(row.timestamp),
      storeSlug: row.store_slug ? String(row.store_slug) : 'admin'
    }));

    res.json(logs);
  } catch (error: any) {
    console.error('Error fetching stock logs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create Stock Log & Adjust Product Stock Atomically
app.post('/api/stock-logs', async (req, res) => {
  try {
    const {
      productId,
      productName,
      type,
      quantity,
      previousStock,
      newStock,
      reason,
      dateFormatted,
      timestamp,
      storeSlug,
      slug
    } = req.body;

    const id = req.body.id || `log-${Date.now()}`;
    const store_slug = storeSlug || slug || 'admin';
    const nowIso = timestamp || new Date().toISOString();
    const formatted = dateFormatted || new Date().toLocaleString('id-ID');

    // Run in batch: insert log + update products table stock
    await turso.batch(
      [
        {
          sql: `INSERT INTO stock_logs (id, product_id, product_name, type, quantity, previous_stock, new_stock, reason, date_formatted, timestamp, store_slug)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            id,
            productId,
            productName,
            type,
            Number(quantity),
            Number(previousStock),
            Number(newStock),
            reason || '',
            formatted,
            nowIso,
            store_slug
          ]
        },
        {
          sql: `UPDATE products SET stock = ? WHERE id = ?`,
          args: [Number(newStock), productId]
        }
      ],
      'write'
    );

    res.status(201).json({
      id,
      productId,
      productName,
      type,
      quantity: Number(quantity),
      previousStock: Number(previousStock),
      newStock: Number(newStock),
      reason: reason || '',
      dateFormatted: formatted,
      timestamp: nowIso,
      storeSlug: store_slug
    });
  } catch (error: any) {
    console.error('Error creating stock log:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete Stock Log
app.delete('/api/stock-logs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await turso.execute({
      sql: 'DELETE FROM stock_logs WHERE id = ?',
      args: [id]
    });
    res.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error('Error deleting stock log:', error);
    res.status(500).json({ error: error.message });
  }
});

// 9. Reset database to default demo data
app.post('/api/reset', async (req, res) => {
  try {
    await turso.execute('DELETE FROM products');
    await turso.execute('DELETE FROM transactions');
    await turso.execute('DELETE FROM categories');

    const DEFAULT_CATEGORIES_RESET = [
      {
        id: 'cat-minuman',
        name: 'Minuman',
        icon: 'local_cafe',
        description: 'Kopi, teh, jus buah, dan aneka minuman segar',
        color: 'emerald',
        store_slug: 'admin'
      },
      {
        id: 'cat-makanan',
        name: 'Makanan',
        icon: 'restaurant',
        description: 'Croissant, roti panggang, spaghetti, dan snack lezat',
        color: 'amber',
        store_slug: 'admin'
      },
      {
        id: 'cat-alattulis',
        name: 'Alat Tulis',
        icon: 'edit_note',
        description: 'Buku catatan, pensil, pulpen, penghapus, dan atk kantor',
        color: 'blue',
        store_slug: 'admin'
      },
      {
        id: 'cat-lainnya',
        name: 'Lainnya',
        icon: 'category',
        description: 'Aksesoris tumbler, tote bag, merchandise dan packaging',
        color: 'purple',
        store_slug: 'admin'
      }
    ];

    for (const c of DEFAULT_CATEGORIES_RESET) {
      await turso.execute({
        sql: `INSERT INTO categories (id, name, icon, description, color, store_slug)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [c.id, c.name, c.icon, c.description, c.color, c.store_slug]
      });
    }

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
