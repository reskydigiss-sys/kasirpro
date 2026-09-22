import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from './db';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'kasirku-super-secure-multi-tenant-jwt-secret';

export interface AuthenticatedUser {
  userId: string;
  tenantId: string;
  storeSlug: string;
  storeName: string;
  name: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function tenantGuard(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Akses ditolak: Token autentikasi tidak ditemukan.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = payload;

    // Strict multi-tenant verification if slug parameter is present in the route
    if (req.params.storeSlug && req.params.storeSlug !== payload.storeSlug) {
      return res.status(403).json({
        error: `Akses ditolak: Anda tidak memiliki akses ke kasir toko "${req.params.storeSlug}".`
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Sesi login telah kedaluwarsa. Silakan login kembali.' });
  }
}

// Seed initial products for any newly registered tenant so their POS is immediately ready!
export async function seedInitialTenantProducts(tenantId: string) {
  const db = getDb();
  const sampleProducts = [
    {
      sku: 'BK-001',
      name: 'Buku Tulis Sidu 38 Lembar',
      category: 'Alat Tulis',
      price: 4500,
      stock: 45,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWW76GKrLBTCDPU-15OqGlAsg0ZdMyrp29rnjrATXZjjHbXh0cEgy-_de07xfSGXijdKHZcBwMfe6YZ6rL-SGyEFwJoXY_RhZegyY4H7QTkxuaWdHQgYE_Qg3dxFG6r9_VAzx1aLq_qDqM84lZf_BNaLRZ7SSl-MYGl-eyWH34Xu9km2bWeozfS2X-aBI1rLZT5zqWaHlwbpakHHh3pjttKBmmR24VicyDvyp2ReLndzUSsy_WTeaC5g',
      description: 'Buku tulis garis standar 38 lembar cocok untuk keperluan sekolah dan kantor.'
    },
    {
      sku: 'ATK-022',
      name: 'Pensil 2B Faber Castell',
      category: 'Alat Tulis',
      price: 3000,
      stock: 120,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACj3agCdrEhwrCTgQjX-BD-xBzSpTlNcNdtZ_1KsUA5Sy5VnyvifzOyzl4s8v65lpfSFDXDJIX6rdzSC_qqCUK--7h-HlNJ82rXKo2_xB-mxO1mb35u1WUm4VpdpkC4dxnsgxOZs19BGGTQODnqybchzyozPDDqYgGdwNcfHN4eDIM47vVVYEAd_BnVE7cT7Nsj3GRIeNUoCP6xgPiZ7Yq4mCzpIVvnV7qLyhPba-WeRkyKpmZpPFjPQ',
      description: 'Pensil berkualitas tinggi 2B empuk dan mudah dihapus.'
    },
    {
      sku: 'ATK-045',
      name: 'Pulpen Standard AE7',
      category: 'Alat Tulis',
      price: 2000,
      stock: 0, // Habis as shown in image 7
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuaTAHAsmAMp2TaGNtkRDzs8M1a2I3WkyoayKaQizVQWJ5IqH2A1KWIzI8CvNIq6lh5359DsvMw--8xX_FPJsQXBejK6bBgZqN9-Gm1RPKNm78TogJzBl2HtfPRBrdqQCLqH1mbP1nAWs3HaIzYD80Hu4wJ-uJJUFqtuDNL0LnhY-_kf6TiWF6-jffaUXqGVm-6bZDb9oD2wH5qWXTWO8ouGxAg57zaLHpBavz-WAsbYle8Xr88i3hGw',
      description: 'Pulpen tinta hitam mata pena 0.5mm anti macet.'
    },
    {
      sku: 'ATK-012',
      name: 'Penghapus Joyko 52B',
      category: 'Alat Tulis',
      price: 1500,
      stock: 85,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPi87jDiA4I96cAPKTA-BKZiJa3Nmj4o6kcqIoEC0FzsXn3qsm-bDbeEKDJae5TQC4Q0LrDqz_Rj1UitXUkSKkJK1UHJJ44KuIfTmUuvYcPXINfj_eOxzTkKu74Pq3GOQ_ENkc3H38ijgHOGC-IzAZ_Ia9PjAY0suEhTOLVTBkoWTB0EENFMeUiHXBcEMwCgWq-qbbaOr5M01GCV7BX20HGpVuXBzZHEhsuC0Q96pDAAx_SNr590Vb0g',
      description: 'Penghapus pensil putih bersih tanpa meninggalkan bekas kotor.'
    },
    {
      sku: 'KSG-001',
      name: 'Kopi Susu Gula Aren',
      category: 'Minuman',
      price: 25000,
      stock: 145,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD96knqKpQAet_lXQPRV6sCkSEx6F7eosde4IobltIvrqabj9-0OL_CYSt2xhnpRXvcLrlChrlcF7lzfjX0gbjr7ZjKV4WidIPortotIXqpeQulMv58Bq9nbU4sxEO2_qP5TxiMglJLrpwQn9XwppoJhM_PWQ_glRfg-PAOASaEspSDtDj9WVGCaL_VWB8kTPKtJswvcwF4HqCzu_VryiYhUoZxD8_WsjV_iaml3V_y6OknYf9kBAjYmA',
      description: 'Espresso segar dengan paduan susu creamy dan gula aren organik.'
    },
    {
      sku: 'RC-002',
      name: 'Croissant Coklat',
      category: 'Makanan',
      price: 30000,
      stock: 42,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8w8O4ZuebrJ0aJzYc7IKNQ_qJY8jmDdU1K_ORGkXJCSFZ2Y7Pp2M2Dbc40oHkl5tCB30jdedK7jLGeCqUwNV3NzJHt9A4x_3zl1bH_v7mRMcaApmtWkXM_n8z-mBnrQs_Fa0s97GhJZ1WzTn6g99HfxvVDEcXeumfvMvFnkIHD5JWCArR6gjtfNVQZRLpeNTXE9SLtZgKeqBgXYJ5MFfBlQI0DtcCyZ-cF2CPn7n6K9e6bANcw2-AQw',
      description: 'Pastry renyah dengan isian coklat lumer lezat.'
    },
    {
      sku: 'ACC-001',
      name: 'Tumbler Stainless',
      category: 'Lainnya',
      price: 150000,
      stock: 0,
      imageUrl: '',
      description: 'Tumbler stainless tahan panas dan dingin hingga 12 jam.'
    }
  ];

  for (const p of sampleProducts) {
    const prodId = 'prod-' + crypto.randomUUID();
    await db.execute({
      sql: `INSERT INTO products (id, tenant_id, sku, name, category, price, stock, image_url, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [prodId, tenantId, p.sku, p.name, p.category, p.price, p.stock, p.imageUrl, p.description]
    });
  }
}
