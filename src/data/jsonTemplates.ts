export interface JsonStoreTemplate {
  id: string;
  label: string;
  icon: string;
  category: string;
  description: string;
  data: {
    store: {
      name: string;
      storeName: string;
      username: string;
      password: string;
      category: string;
      slug?: string;
    };
    starterCategories: Array<{
      name: string;
      icon: string;
      color: string;
      description?: string;
    }>;
    starterProducts: Array<{
      name: string;
      sku: string;
      category: string;
      price: number;
      stock: number;
      imageUrl?: string;
      description?: string;
    }>;
    starterPromos?: Array<{
      code: string;
      title: string;
      type: 'percentage' | 'fixed';
      value: number;
      min_spend: number;
      is_active: number;
    }>;
  };
}

export const JSON_BUSINESS_TEMPLATES: JsonStoreTemplate[] = [
  {
    id: 'minimarket',
    label: 'Minimarket & Sembako',
    icon: 'storefront',
    category: 'Retail & Minimarket',
    description: 'Sembako, bahan pokok, sabun, dan kebutuhan rumah tangga harian',
    data: {
      store: {
        name: 'Haji Wahyudi',
        storeName: 'Toko Berkah Sembako',
        username: 'berkahsembako',
        password: 'password123',
        category: 'Retail & Minimarket',
        slug: 'berkahsembako'
      },
      starterCategories: [
        { name: 'Sembako', icon: 'rice_bowl', color: 'amber', description: 'Beras, minyak, gula, tepung' },
        { name: 'Minuman', icon: 'local_drink', color: 'blue', description: 'Air mineral, teh, kopi, sirup' },
        { name: 'Kebutuhan Rumah', icon: 'cleaning_services', color: 'purple', description: 'Sabun, deterjen, sampo' },
        { name: 'Camilan & Biskuit', icon: 'cookie', color: 'emerald', description: 'Keripik, biskuit, wafer' }
      ],
      starterProducts: [
        {
          name: 'Beras Rojolele Super 5kg',
          sku: 'SBK-001',
          category: 'Sembako',
          price: 72000,
          stock: 45,
          imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60',
          description: 'Beras pulen pilihan kualitas nomor satu tanpa pemutih'
        },
        {
          name: 'Minyak Goreng Bimoli 2L',
          sku: 'SBK-002',
          category: 'Sembako',
          price: 36500,
          stock: 60,
          imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60',
          description: 'Minyak goreng kelapa sawit murni bening kemasan pouch 2 liter'
        },
        {
          name: 'Gula Pasir Gulaku 1kg',
          sku: 'SBK-003',
          category: 'Sembako',
          price: 18500,
          stock: 80,
          imageUrl: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=500&auto=format&fit=crop&q=60',
          description: 'Gula tebu murni kristal putih higienis 1 kg'
        },
        {
          name: 'Telur Ayam Negeri 1kg',
          sku: 'SBK-004',
          category: 'Sembako',
          price: 29000,
          stock: 50,
          imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=500&auto=format&fit=crop&q=60',
          description: 'Telur ayam segar langsung dari peternakan lokal'
        },
        {
          name: 'Sabun Cuci Piring Sunlight 750ml',
          sku: 'RMT-001',
          category: 'Kebutuhan Rumah',
          price: 15500,
          stock: 40,
          imageUrl: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=500&auto=format&fit=crop&q=60',
          description: 'Pembersih lemak ampuh dengan ekstrak jeruk nipis segar'
        }
      ],
      starterPromos: [
        {
          code: 'SEMBAKOMURAH',
          title: 'Diskon Belanja Sembako Rp 10.000',
          type: 'fixed',
          value: 10000,
          min_spend: 100000,
          is_active: 1
        },
        {
          code: 'DISKON5PERSEN',
          title: 'Potongan Belanja 5% Tanpa Minimal',
          type: 'percentage',
          value: 5,
          min_spend: 25000,
          is_active: 1
        }
      ]
    }
  },
  {
    id: 'coffeeshop',
    label: 'Cafe & Coffee Shop',
    icon: 'local_cafe',
    category: 'Kafe & Restoran',
    description: 'Espresso, minuman artisan, pastry, dan dessert kekinian',
    data: {
      store: {
        name: 'Rian Pratama',
        storeName: 'Senja Kopi & Roastery',
        username: 'senjakopi',
        password: 'password123',
        category: 'Kafe & Restoran',
        slug: 'senjakopi'
      },
      starterCategories: [
        { name: 'Kopi Espresso', icon: 'local_cafe', color: 'amber', description: 'Espresso, Americano, Latte, Cappuccino' },
        { name: 'Non-Kopi & Teh', icon: 'emoji_food_beverage', color: 'emerald', description: 'Matcha, Chocolate, Artisan Tea' },
        { name: 'Pastry & Bakery', icon: 'bakery_dining', color: 'rose', description: 'Croissant, Danish, Toast' },
        { name: 'Makanan Ringan', icon: 'tapas', color: 'purple', description: 'French fries, platter, nugget' }
      ],
      starterProducts: [
        {
          name: 'Kopi Susu Gula Aren Senja',
          sku: 'KOP-001',
          category: 'Kopi Espresso',
          price: 22000,
          stock: 120,
          imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&fit=crop&q=60',
          description: 'Double shot espresso blend dengan susu pasteurisasi dan gula aren organik'
        },
        {
          name: 'Caramel Macchiato Iced',
          sku: 'KOP-002',
          category: 'Kopi Espresso',
          price: 28000,
          stock: 75,
          imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668ba67e53?w=500&auto=format&fit=crop&q=60',
          description: 'Espresso lembut berpadu sirup vanilla dan saus caramel premium'
        },
        {
          name: 'Matcha Latte Uji Kyoto',
          sku: 'TEA-001',
          category: 'Non-Kopi & Teh',
          price: 26000,
          stock: 80,
          imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=60',
          description: 'Bubuk matcha murni asli Jepang dengan steamed milk gurih'
        },
        {
          name: 'Croissant Butter Perancis',
          sku: 'BAK-001',
          category: 'Pastry & Bakery',
          price: 24000,
          stock: 35,
          imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60',
          description: 'Croissant renyah berlapis dengan wangi mentega khas Normandy'
        }
      ],
      starterPromos: [
        {
          code: 'SENJAHEMAT',
          title: 'Potongan Rp 5.000 Ngopi Santai',
          type: 'fixed',
          value: 5000,
          min_spend: 30000,
          is_active: 1
        }
      ]
    }
  },
  {
    id: 'atk',
    label: 'Toko ATK & Fotocopy',
    icon: 'edit_note',
    category: 'Retail & Minimarket',
    description: 'Kertas HVS, alat tulis kantor/sekolah, map, dan perlengkapan fotocopy',
    data: {
      store: {
        name: 'Ibu Ratna',
        storeName: 'CV Sinar Graha ATK',
        username: 'sinargraha',
        password: 'password123',
        category: 'Retail & Minimarket',
        slug: 'sinargraha'
      },
      starterCategories: [
        { name: 'Kertas & Buku', icon: 'menu_book', color: 'blue', description: 'Kertas HVS, folio bergaris, buku catatan' },
        { name: 'Pena & Pensil', icon: 'edit', color: 'purple', description: 'Pulpen gel, spidol, pensil 2B, stabilo' },
        { name: 'Pengarsipan & Map', icon: 'folder', color: 'amber', description: 'Map snelhefter, ordner, binder' }
      ],
      starterProducts: [
        {
          name: 'Kertas HVS Sinar Dunia A4 75gr 1 Rim',
          sku: 'KRT-001',
          category: 'Kertas & Buku',
          price: 49000,
          stock: 100,
          imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500&auto=format&fit=crop&q=60',
          description: 'Kertas putih bersih standar fotocopy dan print dokumen kantor'
        },
        {
          name: 'Pulpen Pilot G2 0.5mm Hitam',
          sku: 'ATK-002',
          category: 'Pena & Pensil',
          price: 18000,
          stock: 140,
          imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&auto=format&fit=crop&q=60',
          description: 'Pulpen gel isi ulang halus anti bleber'
        },
        {
          name: 'Buku Tulis Kiky 58 Lembar (Pack isi 10)',
          sku: 'BK-003',
          category: 'Kertas & Buku',
          price: 42000,
          stock: 50,
          imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60',
          description: 'Buku bergaris tebal sampul menarik untuk pelajar dan mahasiswa'
        }
      ]
    }
  },
  {
    id: 'fashion',
    label: 'Distro & Fashion Brand',
    icon: 'checkroom',
    category: 'Fashion & Pakaian',
    description: 'Kaos oversized, flannel, hoodie, celana, dan aksesoris fashion',
    data: {
      store: {
        name: 'Dimas Setiawan',
        storeName: 'Urban Streetwear Co',
        username: 'urbanstreet',
        password: 'password123',
        category: 'Fashion & Pakaian',
        slug: 'urbanstreet'
      },
      starterCategories: [
        { name: 'Kaos & T-Shirt', icon: 'dry_cleaning', color: 'blue', description: 'Heavyweight t-shirt, sablon discharge' },
        { name: 'Outerwear & Hoodie', icon: 'checkroom', color: 'rose', description: 'Hoodie fleece, jacket coach' },
        { name: 'Celana & Bawahan', icon: 'straighten', color: 'amber', description: 'Chino pants, cargo, shorts' }
      ],
      starterProducts: [
        {
          name: 'Heavyweight Oversized Tee 24s Black',
          sku: 'TSH-001',
          category: 'Kaos & T-Shirt',
          price: 135000,
          stock: 40,
          imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60',
          description: '100% Cotton combed 24s tebal tidak tembus pandang'
        },
        {
          name: 'Pullover Hoodie Charcoal Fleece',
          sku: 'HOD-002',
          category: 'Outerwear & Hoodie',
          price: 245000,
          stock: 25,
          imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=60',
          description: 'Bahan cotton fleece lembut dan hangat cocok untuk harian'
        },
        {
          name: 'Cargo Slim Pants Olive Green',
          sku: 'PNT-003',
          category: 'Celana & Bawahan',
          price: 195000,
          stock: 30,
          imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop&q=60',
          description: 'Celana cargo 6 saku bahan twill stretch nyaman bergerak'
        }
      ],
      starterPromos: [
        {
          code: 'FASHIONFEST',
          title: 'Diskon Spesial Baju Baru 15%',
          type: 'percentage',
          value: 15,
          min_spend: 200000,
          is_active: 1
        }
      ]
    }
  },
  {
    id: 'gadget',
    label: 'Counter HP & Gadget',
    icon: 'smartphone',
    category: 'Elektronik & Gadget',
    description: 'Aksesoris handphone, kabel data, charger, TWS, tempered glass',
    data: {
      store: {
        name: 'Kevin Jonathan',
        storeName: 'Nexus Cell & Gadget',
        username: 'nexuscell',
        password: 'password123',
        category: 'Elektronik & Gadget',
        slug: 'nexuscell'
      },
      starterCategories: [
        { name: 'Kabel & Charger', icon: 'power', color: 'blue', description: 'Fast charging, Type-C, Lightning' },
        { name: 'Audio & TWS', icon: 'headphones', color: 'purple', description: 'Wireless earbuds, speaker bluetooth' },
        { name: 'Proteksi Layar & Casing', icon: 'shield', color: 'emerald', description: 'Tempered glass 9H, softcase' }
      ],
      starterProducts: [
        {
          name: 'Kabel Type-C Fast Charging 65W Braided',
          sku: 'ACC-001',
          category: 'Kabel & Charger',
          price: 45000,
          stock: 80,
          imageUrl: 'https://images.unsplash.com/photo-1541689592655-f5f52825a3b8?w=500&auto=format&fit=crop&q=60',
          description: 'Kabel nilon rajut anti putus mendukung PD Fast Charge'
        },
        {
          name: 'TWS Wireless Earbuds Bluetooth 5.3',
          sku: 'AUD-002',
          category: 'Audio & TWS',
          price: 165000,
          stock: 35,
          imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=60',
          description: 'Suara bass bertenaga, latency rendah untuk game dan telepon'
        },
        {
          name: 'Kepala Charger GaN 30W Dual Port',
          sku: 'CHG-003',
          category: 'Kabel & Charger',
          price: 89000,
          stock: 50,
          imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&auto=format&fit=crop&q=60',
          description: 'Adapter charger ringkas hemat panas dengan port USB-C & USB-A'
        }
      ]
    }
  },
  {
    id: 'apotek',
    label: 'Apotek & Toko Obat',
    icon: 'medical_services',
    category: 'Apotek & Kesehatan',
    description: 'Suplemen vitamin, obat bebas, P3K, dan produk higienis',
    data: {
      store: {
        name: 'Apt. Sarah Amelia',
        storeName: 'Apotek Sehat Keluarga',
        username: 'sehatkeluarga',
        password: 'password123',
        category: 'Apotek & Kesehatan',
        slug: 'sehatkeluarga'
      },
      starterCategories: [
        { name: 'Vitamin & Suplemen', icon: 'medication', color: 'emerald', description: 'Vitamin C, D3, multivitamin' },
        { name: 'Obat Bebas & Flu', icon: 'healing', color: 'blue', description: 'Paracetamol, obat batuk, flu' },
        { name: 'Alat Kesehatan & P3K', icon: 'medical_services', color: 'rose', description: 'Kasa, plester, termometer' }
      ],
      starterProducts: [
        {
          name: 'Vitamin C 500mg Strip 10 Tablet',
          sku: 'VIT-001',
          category: 'Vitamin & Suplemen',
          price: 12500,
          stock: 90,
          imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
          description: 'Membantu menjaga daya tahan tubuh dan kebugaran harian'
        },
        {
          name: 'Minyak Kayu Putih Cap Lang 120ml',
          sku: 'OBT-002',
          category: 'Obat Bebas & Flu',
          price: 43000,
          stock: 65,
          imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=60',
          description: 'Menghangatkan badan, meredakan masuk angin dan gatal gigitan serangga'
        },
        {
          name: 'Masker Medis 3-Ply BFE 99% Box isi 50',
          sku: 'ALKES-003',
          category: 'Alat Kesehatan & P3K',
          price: 25000,
          stock: 110,
          imageUrl: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=500&auto=format&fit=crop&q=60',
          description: 'Filtrasi bakteri tinggi nyaman bernapas dengan earloop elastis'
        }
      ]
    }
  }
];
