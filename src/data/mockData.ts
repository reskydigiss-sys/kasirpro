import { Product, Transaction } from '../types';

export const USER_AVATAR_LIGHT = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBz59inFDaXkQSFLwfIWoDmbUKWHzrOQW4PdzQ37UmvAl5R00W5n2YT6QQHpPcrkM6G2RvPUJsWiFmfOtAUCGq6DhIQOJK3wJxrHcdn6i1pYcASrpoqCiRfse-eywMz4h639k09u0puKqo5hPLIXMzw0a3NLrz05-habUnNAfZVeJdcs0V7y4_z7LJQgyXbQ5BsxcJixl9QIN1kLgl370w0-wwX3vEE_u5unOv8i5RZ0Q8O8hcX9ScOLg';
export const USER_AVATAR_DARK = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD307Wtg4hA3lgWmU_BWQc7Fbwz_x1JmAzlB4oto-57dzfcipfCzNzMBFZzKMR6hk3OVL_nDwvMmKkcGa6QmNokVFr0_TwTDQPPGEwfaitjoV7tHz4gbk8c-9pK1tgs86dd2Xr9NWQ_0E_Sgd1M26xipV6oxdc-CuHZP7xJdtU-tervU3ZQuvFOLVsPHzVinYcZDkVXOsOd0FRLEwFvBT8TpQUfDCCiJ4Obmo576duRmqaK_muZZEkP8Q';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Buku Tulis Sidu 38 Lembar',
    sku: 'BK-001',
    category: 'Alat Tulis',
    price: 4500,
    stock: 45,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWW76GKrLBTCDPU-15OqGlAsg0ZdMyrp29rnjrATXZjjHbXh0cEgy-_de07xfSGXijdKHZcBwMfe6YZ6rL-SGyEFwJoXY_RhZegyY4H7QTkxuaWdHQgYE_Qg3dxFG6r9_VAzx1aLq_qDqM84lZf_BNaLRZ7SSl-MYGl-eyWH34Xu9km2bWeozfS2X-aBI1rLZT5zqWaHlwbpakHHh3pjttKBmmR24VicyDvyp2ReLndzUSsy_WTeaC5g',
    description: 'Buku tulis garis standar 38 lembar cocok untuk keperluan sekolah dan kantor.'
  },
  {
    id: 'prod-2',
    name: 'Pensil 2B Faber Castell',
    sku: 'ATK-022',
    category: 'Alat Tulis',
    price: 3000,
    stock: 120,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACj3agCdrEhwrCTgQjX-BD-xBzSpTlNcNdtZ_1KsUA5Sy5VnyvifzOyzl4s8v65lpfSFDXDJIX6rdzSC_qqCUK--7h-HlNJ82rXKo2_xB-mxO1mb35u1WUm4VpdpkC4dxnsgxOZs19BGGTQODnqybchzyozPDDqYgGdwNcfHN4eDIM47vVVYEAd_BnVE7cT7Nsj3GRIeNUoCP6xgPiZ7Yq4mCzpIVvnV7qLyhPba-WeRkyKpmZpPFjPQ',
    description: 'Pensil berkualitas tinggi 2B empuk dan mudah dihapus.'
  },
  {
    id: 'prod-3',
    name: 'Pulpen Standard AE7',
    sku: 'ATK-045',
    category: 'Alat Tulis',
    price: 2000,
    stock: 0, // Habis as shown in image 7
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuaTAHAsmAMp2TaGNtkRDzs8M1a2I3WkyoayKaQizVQWJ5IqH2A1KWIzI8CvNIq6lh5359DsvMw--8xX_FPJsQXBejK6bBgZqN9-Gm1RPKNm78TogJzBl2HtfPRBrdqQCLqH1mbP1nAWs3HaIzYD80Hu4wJ-uJJUFqtuDNL0LnhY-_kf6TiWF6-jffaUXqGVm-6bZDb9oD2wH5qWXTWO8ouGxAg57zaLHpBavz-WAsbYle8Xr88i3hGw',
    description: 'Pulpen tinta hitam mata pena 0.5mm anti macet.'
  },
  {
    id: 'prod-4',
    name: 'Penghapus Joyko 52B',
    sku: 'ATK-012',
    category: 'Alat Tulis',
    price: 1500,
    stock: 85,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPi87jDiA4I96cAPKTA-BKZiJa3Nmj4o6kcqIoEC0FzsXn3qsm-bDbeEKDJae5TQC4Q0LrDqz_Rj1UitXUkSKkJK1UHJJ44KuIfTmUuvYcPXINfj_eOxzTkKu74Pq3GOQ_ENkc3H38ijgHOGC-IzAZ_Ia9PjAY0suEhTOLVTBkoWTB0EENFMeUiHXBcEMwCgWq-qbbaOr5M01GCV7BX20HGpVuXBzZHEhsuC0Q96pDAAx_SNr590Vb0g',
    description: 'Penghapus pensil putih bersih tanpa meninggalkan bekas kotor.'
  },
  {
    id: 'prod-5',
    name: 'Kopi Susu Gula Aren',
    sku: 'KSG-001',
    category: 'Minuman',
    price: 25000,
    stock: 145,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD96knqKpQAet_lXQPRV6sCkSEx6F7eosde4IobltIvrqabj9-0OL_CYSt2xhnpRXvcLrlChrlcF7lzfjX0gbjr7ZjKV4WidIPortotIXqpeQulMv58Bq9nbU4sxEO2_qP5TxiMglJLrpwQn9XwppoJhM_PWQ_glRfg-PAOASaEspSDtDj9WVGCaL_VWB8kTPKtJswvcwF4HqCzu_VryiYhUoZxD8_WsjV_iaml3V_y6OknYf9kBAjYmA',
    description: 'Espresso segar dengan paduan susu creamy dan gula aren organik.'
  },
  {
    id: 'prod-6',
    name: 'Croissant Coklat',
    sku: 'RC-002',
    category: 'Makanan',
    price: 30000,
    stock: 42,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8w8O4ZuebrJ0aJzYc7IKNQ_qJY8jmDdU1K_ORGkXJCSFZ2Y7Pp2M2Dbc40oHkl5tCB30jdedK7jLGeCqUwNV3NzJHt9A4x_3zl1bH_v7mRMcaApmtWkXM_n8z-mBnrQs_Fa0s97GhJZ1WzTn6g99HfxvVDEcXeumfvMvFnkIHD5JWCArR6gjtfNVQZRLpeNTXE9SLtZgKeqBgXYJ5MFfBlQI0DtcCyZ-cF2CPn7n6K9e6bANcw2-AQw',
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
    imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&auto=format&fit=crop&q=60',
    description: 'Pasta creamy dengan daging asap gurih dan taburan parmesan.'
  },
  {
    id: 'prod-9',
    name: 'Croissant Butter',
    sku: 'MK-006',
    category: 'Makanan',
    price: 35000,
    stock: 24,
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60',
    description: 'French butter croissant klasik dengan aroma mentega harum.'
  },
  {
    id: 'prod-10',
    name: 'Es Teh Manis Melati',
    sku: 'MN-004',
    category: 'Minuman',
    price: 8000,
    stock: 90,
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=60',
    description: 'Teh melati seduh dingin segar penghilang dahaga.'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TRX-001',
    timestamp: '2023-10-24T14:30:00Z',
    dateFormatted: '24 Okt 2023, 14:30',
    items: [
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
    ],
    subtotal: 150000,
    discount: 0,
    tax: 0,
    total: 150000,
    paymentMethod: 'QRIS',
    amountPaid: 150000,
    change: 0,
    cashierName: 'Andi',
    status: 'Completed'
  },
  {
    id: 'TRX-002',
    timestamp: '2023-10-24T15:15:00Z',
    dateFormatted: '24 Okt 2023, 15:15',
    items: [
      {
        productId: 'prod-1',
        productName: 'Buku Tulis Sidu 38 Lembar',
        sku: 'BK-001',
        price: 4500,
        quantity: 10,
        total: 45000
      }
    ],
    subtotal: 45000,
    discount: 0,
    tax: 0,
    total: 45000,
    paymentMethod: 'Tunai',
    amountPaid: 50000,
    change: 5000,
    cashierName: 'Budi',
    status: 'Completed'
  },
  {
    id: 'TRX-003',
    timestamp: '2023-10-24T16:05:00Z',
    dateFormatted: '24 Okt 2023, 16:05',
    items: [
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
    ],
    subtotal: 320000,
    discount: 0,
    tax: 0,
    total: 320000,
    paymentMethod: 'Kartu Kredit',
    amountPaid: 320000,
    change: 0,
    cashierName: 'Andi',
    status: 'Completed'
  },
  {
    id: 'TRX-089',
    timestamp: '2023-10-24T13:10:00Z',
    dateFormatted: '24 Okt 2023, 13:10',
    items: [
      {
        productId: 'prod-5',
        productName: 'Kopi Susu Gula Aren',
        sku: 'KSG-001',
        price: 25000,
        quantity: 6,
        total: 150000
      },
      {
        productId: 'prod-6',
        productName: 'Croissant Coklat',
        sku: 'RC-002',
        price: 30000,
        quantity: 2,
        total: 60000
      }
    ],
    subtotal: 210000,
    discount: 0,
    tax: 0,
    total: 210000,
    paymentMethod: 'QRIS',
    amountPaid: 210000,
    change: 0,
    cashierName: 'Siti',
    status: 'Completed'
  },
  {
    id: 'TRX-090',
    timestamp: '2023-10-24T13:50:00Z',
    dateFormatted: '24 Okt 2023, 13:50',
    items: [
      {
        productId: 'prod-5',
        productName: 'Kopi Susu Gula Aren',
        sku: 'KSG-001',
        price: 25000,
        quantity: 1,
        total: 25000
      },
      {
        productId: 'prod-3',
        productName: 'Pulpen Standard AE7',
        sku: 'ATK-045',
        price: 2000,
        quantity: 10,
        total: 20000
      }
    ],
    subtotal: 45000,
    discount: 0,
    tax: 0,
    total: 45000,
    paymentMethod: 'Tunai',
    amountPaid: 50000,
    change: 5000,
    cashierName: 'Budi',
    status: 'Completed'
  },
  {
    id: 'TRX-091',
    timestamp: '2023-10-24T14:15:00Z',
    dateFormatted: '24 Okt 2023, 14:15',
    items: [
      {
        productId: 'prod-6',
        productName: 'Croissant Coklat',
        sku: 'RC-002',
        price: 30000,
        quantity: 4,
        total: 120000
      }
    ],
    subtotal: 120000,
    discount: 0,
    tax: 0,
    total: 120000,
    paymentMethod: 'Kartu Kredit',
    amountPaid: 120000,
    change: 0,
    cashierName: 'Andi',
    status: 'Completed'
  },
  {
    id: 'TRX-092',
    timestamp: '2023-10-24T14:32:00Z',
    dateFormatted: '24 Okt 2023, 14:32',
    items: [
      {
        productId: 'prod-8',
        productName: 'Spaghetti Carbonara',
        sku: 'MK-005',
        price: 65000,
        quantity: 1,
        total: 65000
      },
      {
        productId: 'prod-10',
        productName: 'Es Teh Manis Melati',
        sku: 'MN-004',
        price: 8000,
        quantity: 2,
        total: 16000
      }
    ],
    subtotal: 81000,
    discount: 0,
    tax: 4000,
    total: 85000,
    paymentMethod: 'Tunai',
    amountPaid: 100000,
    change: 15000,
    cashierName: 'Andi',
    status: 'Completed'
  }
];

export const LOW_STOCK_ITEMS = [
  { id: 'ls-1', name: 'Kopi Arabica Blend 1Kg', sku: 'KOP-001', category: 'Bahan Baku', remaining: 2 },
  { id: 'ls-2', name: 'Gelas Plastik 16oz', sku: 'PKG-016', category: 'Packaging', remaining: 15 },
  { id: 'ls-3', name: 'Susu UHT 1L', sku: 'SUS-003', category: 'Bahan Baku', remaining: 8 },
  { id: 'ls-4', name: 'Gula Aren 500g', sku: 'GUL-002', category: 'Bahan Baku', remaining: 1 },
  { id: 'ls-5', name: 'Sedotan Kertas Steril', sku: 'PKG-002', category: 'Packaging', remaining: 12 },
  { id: 'ls-6', name: 'Cup Holder 2-Hole', sku: 'PKG-009', category: 'Packaging', remaining: 5 }
];

export const INITIAL_CART = [
  {
    product: INITIAL_PRODUCTS[0], // Buku Tulis Sidu 38 Lembar
    quantity: 3
  },
  {
    product: INITIAL_PRODUCTS[1], // Pensil 2B Faber Castell
    quantity: 2
  }
];
